require('dotenv').config({ path: './.env.local' })
const express = require('express')
const jwt = require('jsonwebtoken')
const bodyParser = require('body-parser')
const path = require('path')
const cors = require('cors')
const app = express()
const mongoose = require('mongoose')

app.use(cors({
  origin: '*'
}))

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())

app.use(express.static(path.join(__dirname, 'dist')));

app.post('/appseed', cors(), verifyToken, async (req, res) => {
  jwt.verify(req.token, process.env.SECRET_KEY, async (err, authData) => {
    if(err) {
      res.sendStatus(403);
    } else {
      const seed = (process.env.APP_SEED).slice(0, 32)
      res.json({
        seed: seed,
        authData
      });
    }
  })
});

app.post('/funding-seed', cors(), verifyToken, async (req, res) => {
  jwt.verify(req.token, process.env.SECRET_KEY, async (err, authData) => {
    if(err) {
      res.sendStatus(403);
    } else {
      const seed = process.env.FUNDING_ACCOUNT
      res.json({
        seed: seed,
        authData
      });
    }
  })
});

app.post('/sendy', cors(), verifyToken, async (req, res) => {
  jwt.verify(req.token, process.env.SECRET_KEY, async (err, authData) => {
    if(err) {
      res.sendStatus(403);
    } else {
      const seed = process.env.SENDY_API
      res.json({
        seed: seed,
        authData
      });
    }
  })
});

app.post('/db', cors(), verifyToken, async (req, res) => {
  jwt.verify(req.token, process.env.SECRET_KEY, async (err, authData) => {
    if(err) {
      context.log(err)
      res.sendStatus(403);
    } else {
    
      let connection = await mongoose.connect("mongodb://"+process.env.COSMOSDB_USER+":"+process.env.COSMOSDB_PASSWORD+"@"+process.env.COSMOSDB_HOST+":"+process.env.COSMOSDB_PORT+"/?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@dip@")
      
      // let connection = mongoose.connect("mongodb://"+process.env.COSMOSDB_HOST+":"+process.env.COSMOSDB_PORT+"/"+process.env.COSMOSDB_DBNAME+"?ssl=true&replicaSet=globaldb&maxIdleTimeMS=120000&appName=@dip@", {
      // auth: {
      //   username: process.env.COSMOSDB_USER,
      //   password: encodeURIComponent(process.env.COSMOSDB_PASSWORD)
      // },
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
      // retryWrites: false
      // }).then(() => console.log('Connection to CosmosDB successful'))
      // .catch((err) => console.error(err));
       res.json({
         connection: connection,
         authData
       });
    }
  })
});

app.post('/token', cors(), async (req, res) => {
  const accountId = req.body.accountId
  if(!accountId) res.sendStatus(403)
  jwt.sign({ accountId: accountId }, process.env.SECRET_KEY, (err, token) => {
    res.json({
      token
    })
  });
});

app.get('/*', cors(), function (req, res) {
  // res.setHeader(
  //   'Content-Security-Policy-Report-Only',
  //   "default-src 'self'; font-src 'self'; img-src 'self'; script-src 'self'; style-src 'self'; frame-src 'self'"
  // );
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// FORMAT OF TOKEN
// Authorization: Bearer <access_token>

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
    next();
  } else {
    //Forbidden
    res.sendStatus(403);
  }
}

app.listen(3007, () => {
  console.log('running')
});