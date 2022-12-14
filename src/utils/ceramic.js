import CeramicClient from '@ceramicnetwork/http-client'
import * as nearApiJs from 'near-api-js'
import { get, set, del } from './storage'
import { IDX } from '@ceramicstudio/idx'
import { TileDocument } from '@ceramicnetwork/stream-tile'
import { createDefinition, publishSchema } from '@ceramicstudio/idx-tools'
import { Ed25519Provider } from 'key-did-provider-ed25519'
import { getResolver as getKeyResolver } from 'key-did-resolver'
import { getResolver as get3IDResolver } from '@ceramicnetwork/3id-did-resolver'
import { ThreeIdProvider } from '@3id/did-provider'
import { DID } from 'dids'


// schemas
import { profileSchema } from '../schemas/profile'
import { guildProfileSchema } from '../schemas/guildProfile'
import { accountKeysSchema } from '../schemas/accountKeys'
import { definitionsSchema } from '../schemas/definitions'
import { schemaSchema } from '../schemas/schemas'
import { commentsSchema } from '../schemas/comments'
import { notificationSchema } from '../schemas/notifications'
import { metadataSchema } from '../schemas/metadata'
import { apiKeysSchema } from '../schemas/apiKeys'
import { announcementSchema } from '../schemas/announcements'
import { opportunitiesSchema } from '../schemas/opportunities'
import { daoProfileSchema } from '../schemas/daoProfile'
import { nearPriceHistorySchema } from '../schemas/nearPriceHistory'

import { config } from '../state/config'

const axios = require('axios').default

export const {
    FUNDING_DATA, FUNDING_DATA_BACKUP, SEEDS, ACCOUNT_LINKS, DAO_LINKS, GAS, SEED_PHRASE_LOCAL_COPY, REDIRECT, 
    KEY_REDIRECT, APP_OWNER_ACCOUNT, IPFS_PROVIDER, FACTORY_DEPOSIT, CERAMIC_API_URL, APPSEED_CALL, 
    networkId, nodeUrl, walletUrl, nameSuffix,
    contractName, didRegistryContractName, factoryContractName,
    TOKEN_CALL, AUTH_TOKEN, ALIASES, FUNDING_SEED_CALL, SECRETSET_CALL, SECRETGET_CALL,
    MICROSOFTGRAPH_CA, DB_CALL
  } = config

export const {
  keyStores: { InMemoryKeyStore, BrowserLocalStorageKeyStore },
  Near, Account, Contract, KeyPair, InMemorySigner,
  utils: {
    format: {
      parseNearAmount
    }
  }
} = nearApiJs


class Ceramic {

  async openDBConnection(microsoftAccount){

    let token = await axios.post(TOKEN_CALL, 
      {
      accountId: microsoftAccount
      }    
    )
    
    set(AUTH_TOKEN, token.data.token)
  
    let authToken = get(AUTH_TOKEN, [])

    let connectionString = await axios.post(DB_CALL, 
      {
        
      },
      {
        headers: {
        'Authorization': `Basic ${authToken}`
        }
      }
    )
    console.log('connectionString', connectionString)
    

    return connectionString.data.connection
  }

  async storeKeysSecret(idx, payload, key, did) {

    let record = await idx.get(key)
    
    if(!record){
      record = { seeds: [] }
    }
    
    let access = [idx._ceramic.did.id]
    if(did) access.push(did)
    const jwe = await idx._ceramic.did.createDagJWE(payload, access)
  
    record = { seeds: [jwe] }
    try{
    await idx.set(key, record)
    return true
    } catch (err) {
      console.log('error setting keys records', err)
      return false
    }
  }


  async downloadKeysSecret(idx, key) {
    let records = await idx.get(key)
   
    if(records && Object.keys(records).length != 0){
      return await idx._ceramic.did.decryptDagJWE(records.seeds[0])
    }
    return []
  }


  async getLocalAccountSeed(account, appIdx, contract){

    let newAccountKeys =  await this.downloadKeysSecret(appIdx, 'accountsKeys')

    // add legacy dao keys
    let legacyAppIdx = await this.getLegacyAppIdx(contract, account)
    let oldAccountKeys =  await this.downloadKeysSecret(legacyAppIdx, 'accountsKeys')
    let localAccounts = get(ACCOUNT_LINKS, [])
    let accounts = localAccounts.concat(oldAccountKeys, newAccountKeys)
    
    if(accounts && accounts.length > 0){
      let i = 0
      while (i < accounts.length){
        if(accounts[i].accountId == account.accountId){
          let seed = Buffer.from((accounts[i].key).slice(0,32))
          return seed
        }
        i++
      }
    } 
    return false
  }


  async makeSeed(account){
      let keyPair = KeyPair.fromRandom('ed25519')
      let publicKey = keyPair.getPublicKey().toString().split(':')[1]
      let owner = account.accountId
      const links = get(ACCOUNT_LINKS, [])
      let c = 0
      let accountExists
      while(c < links.length) {
          if(links[c].accountId == account.accountId){
              accountExists = true
              links[c] = { key: keyPair.secretKey, publicKey: publicKey, accountId: account.accountId, owner: owner, keyStored: Date.now() }
              set(ACCOUNT_LINKS, links)
              break
          } else {
              accountExists = false
          }
      c++
      }
      if(!accountExists){
        links.push({ key: keyPair.secretKey, publicKey: publicKey, accountId: account.accountId, owner: owner, keyStored: Date.now() })
        set(ACCOUNT_LINKS, links)
      }
  }


  async getCeramic(account, seed) {
    if (seed == undefined || seed == false){
      seed = await this.getLocalAccountSeed(account.accountId)
      if(seed == false || seed == undefined){
        await this.makeSeed(account)
        seed = await this.getLocalAccountSeed(account.accountId)
      }
    }
    const ceramic = new CeramicClient(CERAMIC_API_URL, {cacheDocCommits: true, docSyncEnabled: false, docSynchInterval: 30000})
    const authId = 'NearAuthProvider'
    let authSecret = seed
    const getPermission = async (request) => {
       return request.payload.paths
    }

    const threeId = await ThreeIdProvider.create({
      ceramic,
      getPermission,
      authSecret,
      authId
    })
   
    const provider = threeId.getDidProvider()
   
    const resolver = {...getKeyResolver(), ...get3IDResolver(ceramic)}
    const did = new DID({ resolver })
    ceramic.setDID(did)
    ceramic.did.setProvider(provider)
    await ceramic.did.authenticate()
    return ceramic
  }


  async getLegacyCeramic(account, seed) {
    if (seed == undefined || seed == false){
      seed = await this.getLocalAccountSeed(account.accountId)
      if(seed == false || seed == undefined){
        await this.makeSeed(account)
        seed = await this.getLocalAccountSeed(account.accountId)
      }
    }
    const ceramic = new CeramicClient(CERAMIC_API_URL, {cacheDocCommits: true, docSyncEnabled: false, docSynchInterval: 30000})
   
    const provider = new Ed25519Provider(seed)

    const resolver = {...getKeyResolver()}
  
    const did = new DID({ resolver })
    
    ceramic.setDID(did)
    ceramic.did.setProvider(provider)
  
    await ceramic.did.authenticate()
    
    return ceramic
  }

  async getCeramicWithSeed(seed) {
    if (seed == undefined || seed == false){
      return false
    }
    
    let authSecret = Buffer.from((seed).slice(0,32))

    const authId = 'NearAuthProvider'

    const getPermission = async (request) => {
       return request.payload.paths
    }

    const threeId = await ThreeIdProvider.create({
      ceramic,
      getPermission,
      authSecret,
      authId
    })
    
    const provider = threeId.getDidProvider()
   
    const resolver = {
      ...getKeyResolver(),
      ...get3IDResolver(ceramic)
    }
    const did = new DID({ resolver })
    
    ceramic.setDID(did)
    ceramic.did.setProvider(provider)
    await ceramic.did.authenticate()
    
    return ceramic
  }

  async setVaultKeyPair(microsoftAccount){

    let token = await axios.post(TOKEN_CALL, 
      {
      accountId: microsoftAccount
      }    
    )
    
    set(AUTH_TOKEN, token.data.token)
  
    let authToken = get(AUTH_TOKEN, [])

    let keyPair = KeyPair.fromRandom('ed25519')
    let keyString = {
      "accountId": microsoftAccount,
      "public_key": keyPair.getPublicKey().toString(),
      "private_key": keyPair.secretKey
    }

    let storeString = JSON.stringify(keyString)

    let secretSet = await axios.post(SECRETSET_CALL, 
      {
        accountId: microsoftAccount,
        keypair: storeString
      },
      {
        headers: {
        'Authorization': `Basic ${authToken}`
        }
      }
    )

    return secretSet.data.set
  }

  async getVaultKeyPair(microsoftAccount){
    console.log('microsoftaccount', microsoftAccount)
    let token = await axios.post(TOKEN_CALL, 
      {
      accountId: microsoftAccount
      }    
    )
    
    set(AUTH_TOKEN, token.data.token)
  
    let authToken = get(AUTH_TOKEN, [])
    console.log('authtoken', authToken)
    let result = await axios.post(SECRETGET_CALL, 
      {
        accountId: microsoftAccount
      },
      {
        headers: {
        'Authorization': `Basic ${authToken}`
        }
      }
    )
    console.log('get vault key result', result)
    if(result.data.keyPair && result.data.keyPair != ""){
      return JSON.parse(result.data.keyPair.value)
    } else {
      return false
    }
  }

  async getAppCeramic(accountId) {

    let token = await axios.post(TOKEN_CALL, 
      {
      accountId: accountId
      }    
    )
    
    set(AUTH_TOKEN, token.data.token)
  
    let authToken = get(AUTH_TOKEN, [])
   
    let retrieveSeed = await axios.post(APPSEED_CALL, {
      // ...data
    },{
      headers: {
        'Authorization': `Basic ${authToken}`
      }
    })
 
    const ceramic = new CeramicClient(CERAMIC_API_URL)
  
    let authSecret = retrieveSeed.data.seed

    const authId = 'NearAuthProvider'

    const getPermission = async (request) => {
       return request.payload.paths
    }

    const threeId = await ThreeIdProvider.create({
      ceramic,
      getPermission,
      authSecret,
      authId
    })
    
    const provider = threeId.getDidProvider()
   
    const resolver = {
      ...getKeyResolver(),
      ...get3IDResolver(ceramic)
    }
    const did = new DID({ resolver })
    
    ceramic.setDID(did)
    ceramic.did.setProvider(provider)
    await ceramic.did.authenticate()
    
    return ceramic
  }


  // needed to find accounts that had been registered with key did provider
  async getLegacyAppCeramic(accountId) {

    let token = await axios.post(TOKEN_CALL, 
      {
      accountId: accountId
      }    
    )
   
    set(AUTH_TOKEN, token.data.token)

    let authToken = get(AUTH_TOKEN, [])   
    let retrieveSeed = await axios.post(APPSEED_CALL, {
      // ...data
    },{
      headers: {
        'Authorization': `Basic ${authToken}`
      }
    })
 
    const ceramic = new CeramicClient(CERAMIC_API_URL)
    const provider = new Ed25519Provider(retrieveSeed.data.seed)

    const resolver = {...getKeyResolver()}
  
    const did = new DID({ resolver })
    
    ceramic.setDID(did)
    ceramic.did.setProvider(provider)
  
    await ceramic.did.authenticate()
    
    return ceramic
  }



  async useFundingAccount(accountId) { 
    
    let token = await axios.post(TOKEN_CALL, 
      {
      accountId: accountId
      }    
    )
    
    set(AUTH_TOKEN, token.data.token)
  
    let authToken = get(AUTH_TOKEN, [])
   
    let retrieveSeed = await axios.post(FUNDING_SEED_CALL, {
      // ...data
    },{
      headers: {
        'Authorization': `Basic ${authToken}`
      }
    })

    // Step 1:  get the keypair from the funding account's full access private key
    let keyPair = KeyPair.fromString(retrieveSeed.data.seed)

    // Step 2:  load up an inMemorySigner using the keyPair for the account
    let signer = await InMemorySigner.fromKeyPair(networkId, didRegistryContractName, keyPair)

    // Step 3:  create a connection to the network using the signer's keystore and default config for testnet
    const near = await nearApiJs.connect({
      networkId, nodeUrl, walletUrl, deps: { keyStore: signer.keyStore },
    })

    // Step 4:  get the account object of the currentAccount.  At this point, we should have full control over the account.
    let account = new nearApiJs.Account(near.connection, didRegistryContractName)
   
    // initiate the contract so its associated with this current account and exposing all the methods
    let contract = new nearApiJs.Contract(account, didRegistryContractName, {
      changeMethods: ['putDID', 'deleteDID', 'adjustKeyAllowance']
    })
    console.log('contract', contract)
    return {
      contract: contract,
      pubKey: keyPair.getPublicKey().toString().split(':')[1]
    }
  }

  async useSpecialAccessKey(registryContract) {

    let keystore = new BrowserLocalStorageKeyStore()
    
    // Step 1:  get the keypair from the account's localstorage private key we set earlier
    //let keyPair = await keystore.getKey(networkId, accountId)
    let keyPair = KeyPair.fromRandom('ed25519')
   
    // Step 2:  load up an inMemorySigner using the keyPair for the account
    let signer = await InMemorySigner.fromKeyPair(networkId, registryContract, keyPair)

    // Step 3:  create a connection to the network using the signer's keystore and default config for testnet
    const near = await nearApiJs.connect({
      networkId, nodeUrl, walletUrl, deps: { keyStore: signer.keyStore },
    })

    // Step 4:  get the account object of the currentAccount.  At this point, we should have full control over the account.
    let account = new nearApiJs.Account(near.connection, registryContract)
   
    // initiate the contract so its associated with this current account and exposing all the methods
    let contract = new nearApiJs.Contract(account, registryContract, {
      changeMethods: ['register', 'unregister']
    })
    console.log('contract', contract)
    return {
        contract: contract,
        pubKey: keyPair.getPublicKey().toString().split(':')[1]
    }
  }


  async associateAppDID(accountId, contract, ceramic) {
    /** Try and retrieve did from  contract if it exists */
      let did
        let didPresent = await contract.hasDID({accountId: accountId})
          if(didPresent) {   
          try {
              did = await contract.getDID({accountId: accountId});
              if(did) {
                return did
              }           
          } catch (err) {
              console.log('no DID retrievable', err)
          }
        }

        /** No DID, so create a new one and store it in the contract */
        if (ceramic.did.id) {
          let thisContract = this.useSpecialAccessKey(accountId, contract)
          try{
            did = await thisContract.contract.register({
                publicKey: thisContract.pubKey,
                accountId: accountId,
                did: ceramic.did.id,
                type: 'application'
            })
          } catch (err) {
            console.log('problem storing DID', err)
          }
        }
      return did
  }


  async changeDefinition(accountId, aliasName, client, schema, description, contract) {
  
    let alias
  
      let aliasExists = await contract.hasAlias({alias: accountId+':'+aliasName})
    
      if(aliasExists){
        try{
          alias = await contract.retrieveAlias({alias: accountId+':'+aliasName})
        
        } catch (err) {
          console.log('alias is misformed', err)
          alias = false
        }
      } 
      
      let newSchemaURL = await publishSchema(client, {content: schema})
      const doc = await TileDocument.load(client, alias)
    
      try {
        await doc.update({name: aliasName, description: description, schema: newSchemaURL.commitId.toUrl()})
        return true
      } catch (err) {
        console.log('error updating definition schema', err)
        return false
      }
  }


  async getAlias(accountId, aliasName, client, schema, description, contract) {
    let alias
    try {
      let aliasExists = await contract.hasAlias({alias: accountId+':'+aliasName})
      if(aliasExists){
        try{
          alias = await contract.retrieveAlias({alias: accountId+':'+aliasName})
        return alias
        } catch (err) {
          console.log('alias is misformed', err)
          alias = false
        }
      }
      if(!aliasExists || alias == false){
        let schemaURL = await publishSchema(client, {content: schema})
        let definition = await createDefinition(client, {
          name: aliasName,
          description: description,
          schema: schemaURL.commitId.toUrl()
        })
     //   let didContract = await this.useDidContractFullAccessKey()
        await contract.storeAlias({alias: accountId+':'+aliasName, definition: definition.id.toString(), description: description})
        return definition.id.toString()
      }
    } catch (err) {
      console.log('problem retrieving alias', err)
      return false
    }
  }


  // application IDX - maintains most up to date schemas and definitions ensuring chain always has the most recent commit
  async getAppIdx(contract, account){
  
    const appClient = await this.getAppCeramic(account.accountId)

    const legacyAppClient = await this.getLegacyAppCeramic(account.accountId)

    const appDid = this.associateAppDID(APP_OWNER_ACCOUNT, contract, appClient)
  
    // Retrieve cached aliases
    // let rootAliases = get(ALIASES, [])
    // if(rootAliases.length > 0){
    //const appIdx = new IDX({ ceramic: appClient, aliases: rootAliases[0]})
    //     return appIdx
    // } else {

    // uncomment below to change a definition
    //  let changed = await this.changeDefinition(APP_OWNER_ACCOUNT, 'profile', appClient, profileSchema, 'persona profiles', contract)
    //  let changed1 = await this.changeDefinition(APP_OWNER_ACCOUNT, 'guildProfile', appClient, guildProfileSchema, 'guild profiles', contract)
    //  console.log('changed schema', changed)
    //  console.log('changed1 schema', changed1)

      const definitions = this.getAlias(APP_OWNER_ACCOUNT, 'Definitions', appClient, definitionsSchema, 'alias definitions', contract)
      const schemas = this.getAlias(APP_OWNER_ACCOUNT, 'Schemas', appClient, schemaSchema, 'user schemas', contract)
      const profile = this.getAlias(APP_OWNER_ACCOUNT, 'profile', appClient, profileSchema, 'persona profiles', contract)
      const accountsKeys = this.getAlias(APP_OWNER_ACCOUNT, 'accountsKeys', appClient, accountKeysSchema, 'user account info', contract)
      const comments = this.getAlias(APP_OWNER_ACCOUNT, 'comments', appClient, commentsSchema, 'comments', contract)
      const notifications = this.getAlias(APP_OWNER_ACCOUNT, 'notifications', appClient, notificationSchema, 'notifications', contract)
      const guildProfile = this.getAlias(APP_OWNER_ACCOUNT, 'guildProfile', appClient, guildProfileSchema, 'guild profiles', contract)
      const apiKeys = this.getAlias(APP_OWNER_ACCOUNT, 'apiKeys', appClient, apiKeysSchema, 'guild api keys', contract)
      const announcements = this.getAlias(APP_OWNER_ACCOUNT, 'announcements', appClient, announcementSchema, 'guild announcements', contract)
      const opportunities = this.getAlias(APP_OWNER_ACCOUNT, 'opportunities', appClient, opportunitiesSchema, 'opportunities to complete', contract)
      const daoProfile = this.getAlias(APP_OWNER_ACCOUNT, 'daoProfile', appClient, daoProfileSchema, 'dao profiles', contract)
      const nearPriceHistory = this.getAlias(APP_OWNER_ACCOUNT, 'nearPriceHistory', appClient, nearPriceHistorySchema, 'near price history', contract)
     
      const done = await Promise.all([
        appDid, 
        definitions, 
        schemas, 
        profile, 
        accountsKeys, 
        comments,
        notifications,
        guildProfile,
        apiKeys,
        announcements,
        opportunities,
        daoProfile,
        nearPriceHistory
      ])
      
      let rootAliases = {
        definitions: done[1],
        schemas: done[2],
        profile: done[3],
        accountsKeys: done[4],
        comments: done[5],
        notifications: done[6],
        guildProfile: done[7],
        apiKeys: done[8],
        announcements: done[9],
        opportunities: done[10],
        daoProfile: done[11],
        nearPriceHistory: done[12]
      }

      // cache aliases
      let aliases = []
      aliases.push(rootAliases)
      set(ALIASES, aliases)

      const appIdx = new IDX({ ceramic: appClient, aliases: rootAliases})

      return appIdx
    // }
  }


  async getLegacyAppIdx(contract, account){

    const legacyAppClient = await this.getLegacyAppCeramic(account.accountId)
  
    const accountsKeys = this.getAlias(APP_OWNER_ACCOUNT, 'accountsKeys', legacyAppClient, accountKeysSchema, 'user account info', contract)
    const done = await Promise.all([
      accountsKeys
    ])
    
    let rootAliases = {
      accountsKeys: done[0]
    }

    const appIdx = new IDX({ ceramic: legacyAppClient, aliases: rootAliases})
    return appIdx
  }

  async getSpaceIDX(seed, nftContract){
    let client = await this.getCeramicWithSeed(seed)
    let spaceProfile = this.getAlias(APP_OWNER_ACCOUNT, 'metadata', client, metadataSchema, 'space metadata info', nftContract)
    const done = await Promise.all([
      spaceProfile,
    ])
    let alias = {
      spaceProfile: done[0]
    }
    let spaceIdx = new IDX({ ceramic: client, aliases: alias})
    return spaceIdx
  }


  // retrieve user identity
  async getUserIdx(account, appIdx, factoryContract, registryContract){
      let seed = false
      set(KEY_REDIRECT, {action: false, link: ''})

      let newAccountKeys =  await this.downloadKeysSecret(appIdx, 'accountsKeys')
     
      // add legacy dao keys
      let legacyAppIdx = await this.getLegacyAppIdx(registryContract, account)
      let oldAccountKeys =  await this.downloadKeysSecret(legacyAppIdx, 'accountsKeys')
    
      let localAccounts = get(ACCOUNT_LINKS, [])
      
      if(oldAccountKeys && oldAccountKeys.length > 0){
        let i = 0
        while (i < oldAccountKeys.length){
          if(oldAccountKeys[i].accountId == account.accountId){
            seed = Buffer.from((oldAccountKeys[i].key).slice(0,32))
          }
          i++
        }
        try{
          let oldAccountUserCeramicClient
          let did = await this.getDid(account.accountId, factoryContract, registryContract)
          if(did){
            let part = did.split(':')[1]
            if(part == '3'){
              oldAccountUserCeramicClient = await this.getCeramic(account, seed)
            } else {
              oldAccountUserCeramicClient = await this.getLegacyCeramic(account, seed)
            }
          } else {
            oldAccountUserCeramicClient = await this.getCeramic(account, seed)
          }
          let curUserIdx = new IDX({ ceramic: oldAccountUserCeramicClient, aliases: appIdx._aliases})
          return curUserIdx
        } catch (err) {
          console.log('no did from oldaccounts', err)
        }
      }

      if(newAccountKeys && newAccountKeys.length > 0){
        let i = 0
        while (i < newAccountKeys.length){
          if(newAccountKeys[i].accountId == account.accountId){
            seed = Buffer.from((newAccountKeys[i].key).slice(0,32))
          }
          i++
        }
        try{
          let did = await this.getDid(account.accountId, factoryContract, registryContract)
          let currentUserCeramicClient
          if(did){
            let part = did.split(':')[1]
            if(part == '3'){
              currentUserCeramicClient = await this.getCeramic(account, seed)
            } else {
              currentUserCeramicClient = await this.getLegacyCeramic(account, seed)
            }
          } else {
            currentUserCeramicClient = await this.getCeramic(account, seed)
          }
          let curUserIdx = new IDX({ ceramic: currentUserCeramicClient, aliases: appIdx._aliases})
          return curUserIdx
        } catch (err) {
          console.log('no did from newaccounts', err)
        }
      }

      if(localAccounts && localAccounts.length > 0){
        let i = 0
        while (i < localAccounts.length){
          if(localAccounts[i].accountId == account.accountId){
            seed = Buffer.from((localAccounts[i].key).slice(0,32))
          }
          i++
        }
        try{
          let did = await this.getDid(account.accountId, factoryContract, registryContract)
          let localAccountUserCeramicClient
          if(did){
            let part = did.split(':')[1]
            if(part == '3'){
              localAccountUserCeramicClient = await this.getCeramic(account, seed)
            } else {
              localAccountUserCeramicClient = await this.getLegacyCeramic(account, seed)
            }
          } else {
            localAccountUserCeramicClient = await this.getCeramic(account, seed)
          }
          let curUserIdx = new IDX({ ceramic: localAccountUserCeramicClient, aliases: appIdx._aliases})
          return curUserIdx
        } catch (err) {
          console.log('no did from localaccount', err)
        }
      }
     
      if(seed == false){
        set(KEY_REDIRECT, {action: true, link: '/setup'})
        return false
      }
  }

  
  async getDid(accountId, factoryContract, registryContract) {
    let dao
    let did = false
    
    try{
      did = await registryContract.getDID({accountId: accountId})
      if(did != 'none'){
        return did
      }
    } catch (err) {
      console.log('error retrieving did from legacy', err)
    }
    
    if (did == 'none'){
     try {
      dao = await factoryContract.getDaoByAccount({accountId: accountId})
      did = dao.did
      } catch (err) {
        console.log('error retrieving did', err)
      }
    }
    return did
  }
}

export const ceramic = new Ceramic()