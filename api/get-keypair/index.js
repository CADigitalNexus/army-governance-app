const jwt = require('jsonwebtoken')

const { DefaultAzureCredential } = require("@azure/identity")
const { SecretClient } = require("@azure/keyvault-secrets")

// Verify Token
function verifyToken(req, res, next){
  // Get auth header value
  const bearerHeader = req.headers['authorization'];
  // Check if bearer is undefined
  if(typeof bearerHeader !== 'undefined'){
    // Split at the space
    const bearerToken = bearerHeader.split(' ')[1];
    // Set the token
    req.token = bearerToken;
    // Next middleware
    return req.token
  } else {
    //Forbidden
    return false
  }
}

module.exports = async function (context, req) {
  context.log('AppSeed testnet trigger function processed a request.');
  const token = verifyToken(req)
  context.log('token', token)
  if(token){
    try{
      let verified = jwt.verify(token, process.env["DIP_TESTNET_SECRET_KEY"])
      context.log('verified', verified)
      if(verified){
          const credential = new DefaultAzureCredential()
          const vaultName = process.env["VAULT_NAME"]
          const url = `https://${vaultName}.vault.azure.net`
          const client = new SecretClient(url, credential)
          const secretName = req.body.accountId
          let formatted = secretName.replace(/@/g, "-")
          let secondFormat = formatted.replace(/./g, "-")
          const result = await client.getSecret(secondFormat)
          context.log('result', result)
          context.res.json({
            keyPair: result
          })
      } else {
        context.res.sendStatus(403);
      }
    } catch (err) {
    context.log('error', err)
    context.res.json({
      keyPair: false
    })
    }
  }
}