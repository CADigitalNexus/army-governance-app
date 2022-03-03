import React, { useState, useEffect, useContext } from 'react'
import { appStore, onAppMount } from '../../state/app'
import Fuse from 'fuse.js'
import GuildCard from '../Cards/GuildCard/guildCard'
import SearchBar from '../common/SearchBar/search'

// Material UI components
import { makeStyles } from '@mui/styles'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import useMediaQuery from '@mui/material/useMediaQuery'
import List from '@mui/material/List'

const axios = require('axios').default

const useStyles = makeStyles((theme) => ({
    root: {
      flexGrow: 1,
      position: 'relative',
      display: 'flex',
      flexDirection: 'column'
    },
    featureDAO: {
        minHeight: '200px',
        backgroundColor:'#eff3fb',
        padding: '20px',
    },
    paper: {
        padding: '5px',
        textAlign: 'center',
    },
    menuButton: {
      marginRight: '5px',
    },
    title: {
      flexGrow: 1,
      textAlign: 'left'
    },
    drawer: {
        marginTop: '5px'
    }
  }));

  
export default function ExploreGuilds(props) {
   
    const [guilds, setGuilds] = useState([])
    const [guildCount, setGuildCount] = useState(0)

    const [membersOnly, setMembersOnly] = useState(false)
    const [activeOnly, setActiveOnly] = useState(true)
    const [resources, setResources] = useState(0)
    const [searchGuilds, setSearchGuilds] = useState([])
    const [contractId, setContractId] = useState('')
    const [daoPlatform, setDaoPlatform] = useState('')
    
    const [anchorEl, setAnchorEl] = useState(null)
   
    const classes = useStyles()

    const { state, dispatch, update } = useContext(appStore)

    const {
      currentGuilds,
      accountId,
      near,
      isUpdated,
      did,
      didRegistryContract,
      nearPrice,
      appIdx
    } = state

    const matches = useMediaQuery('(max-width:500px)')

    let sortedGuilds

    useEffect(
        () => {
            if(isUpdated){}
            console.log('currentGuilds', currentGuilds)
            async function fetchData() {
                if(currentGuilds && near){
                    setGuildCount(currentGuilds.length)
                    sortedGuilds = _.sortBy(currentGuilds, 'registered').reverse()
                    console.log('sortedGuilds', sortedGuilds)
                    for(let x = 0; x < sortedGuilds.length; x++){
                        let result = await appIdx.get('daoProfile', sortedGuilds[x].did)
                        console.log('result', result)
                        if(result){
                            let category
                            result.category ? category = result.category : category = ''
                            let newObject = {...sortedGuilds[x], category: category}
                            sortedGuilds[x] = newObject
                        }
                    }
                    console.log('sortedguilds2', sortedGuilds)
                    setGuilds(sortedGuilds)                
                }

                // if(currentGuildsList && currentGuildsList.data.putDIDs.length > 0){
                //     let i = 0
                //     let balance = 0
                //     while (i < currentGuildsList.data.putDIDs.length){
                //         let account
                //         let guildDid = currentGuildsList.data.putDIDs[i].did
                //         let guildInfo = await appIdx.get('daoProfile', guildDid)
                //         if(guildInfo.contractId){
                //             setContractId(guildInfo.contractId)
                //             try {
                //                 account = await near.connection.provider.query({
                //                     request_type: "view_account",
                //                     finality: "final",
                //                     account_id: guildInfo.contractId,
                //                 })
                //             } catch (err) {
                //                 console.log('problem retrieving account', err)
                //             }
                //         }
                //         if(account){
                //             let formatted = utils.format.formatNearAmount(account.amount, 0)
                //             balance = balance + parseFloat(formatted)
                //         }
                //         i++
                //     }
                //     setResources(balance)
                // }
            }

        let mounted = true
        if(mounted){
        fetchData()
          .then((res) => {
         
          })
        return () => mounted = false
        }

    }, [currentGuilds, near, isUpdated]
    )

    function handleExpanded() {
        setAnchorEl(null)
    }

    // const handleMembersOnlyChange = async (event) => {
    //     setMembersOnly(event.target.checked)
     
    //     if(event.target.checked){
    //         let contract
    //         let memberGuilds = []
    //         let i = 0
           
    //         while (i < guilds.length){
    //             try{
    //                 contract = await dao.initDaoContract(state.wallet.account(), daos[i].contractId)
    //             } catch (err) {
    //                 console.log('problem initializing dao contract', err)
    //             }

    //             let thisMemberStatus
    //             let thisMemberInfo
    //             try {
    //             thisMemberInfo = await contract.getMemberInfo({member: accountId})
    //             thisMemberStatus = await contract.getMemberStatus({member: accountId})
    //             if(thisMemberStatus && thisMemberInfo[0].active){
    //                 memberDaos.push(daos[i])
    //             } 
    //             } catch (err) {
    //             console.log('no member info yet')
    //             }
    //         i++
    //         }
    //         setDaos(memberDaos)
    //     } else {
    //         let memberDaos = []
    //         setDaos(memberDaos)
    //         let i = 0
         
    //         let sortedDaos = _.sortBy(currentDaosList, 'created').reverse()
    //         while (i < sortedDaos.length){
    //             memberDaos.push(sortedDaos[i])
    //             i++
    //         }
    //         setDaos(memberDaos)
    //     }
    // }

    // const handleStatusChange = async (event) => {
    //     setActiveOnly(event.target.checked)
        
    //     if(event.target.checked){
    //         let contract
    //         let statusCommunity = []
    //         let i = 0
    //         while (i < daos.length){
    //             if(daos[i].status == 'active'){
    //                 statusCommunity.push(daos[i])
    //             } 
    //         i++
    //         }
    //         setDaos(statusCommunity)
    //     } else {
    //         let statusCommunity = []
    //         setDaos(statusCommunity)
    //         let i = 0
    //         let sortedDaos = _.sortBy(currentDaosList, 'created').reverse()
    //         while (i < sortedDaos.length){
    //             statusCommunity.push(sortedDaos[i])
    //             i++
    //         }
    //         setDaos(statusCommunity)
    //     }
    // }

    function makeSearchGuilds(guild){
       let i = 0
        let exists
        let someGuilds = []
        if(guild != false && searchGuilds.length > 0){
            while(i < searchGuilds.length){
                if(searchGuilds[i].contractId == guild.contractId){
                    exists = true
                }
                i++
            }
            if(!exists){
                someGuilds.push(guild)
                setSearchGuilds(someGuilds)
            }
        }
    }

    const searchData = async (pattern) => {
        if (!pattern) {
            let sortedGuilds = _.sortBy(currentGuilds, 'registered').reverse()
            for(let x = 0; x < sortedGuilds.length; x++){
                let result = await appIdx.get('daoProfile', sortedGuilds[x].did)
                if(result){
                    result.category ? category = result.category : category = ''
                    let newObject = {...sortedGuilds[x], category: category}
                    sortedGuilds[x] = newObject
                }
            }
            setGuilds(sortedGuilds)
            return
        }
        
        const fuse = new Fuse(searchGuilds, {
            keys: ['category']
        })
     

        const result = fuse.search(pattern)

        const matches = []
        if (!result.length) {
            setGuilds([])
        } else {
            result.forEach(({item}) => {
                matches.push(item)
        })
            setGuilds(matches)
        }
    }
  

    return (
        <>
       
        {!matches ? (
            <Grid container spacing={1}>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center">
                    <Typography variant="h4" style={{color:'#1341a4',fontWeight:'700', marginTop: '30px', lineHeight:'1em', verticalAlign:'middle'}}>
                        Explore {guilds ? guildCount : null} 
                        {guilds && guildCount > 1 ? ' Guilds': null} 
                        {guilds && guildCount == 1 ? ' Guild': null}
                        {guilds && guildCount == 0 ? ' Guilds': null}
                    </Typography>
                </Grid>
            

                <Grid item xs={1} sm={1} md={3} lg={3} xl={3}>
                </Grid>
                <Grid item xs={10} sm={10} md={6} lg={6} xl={6}>
                <SearchBar
                    placeholder="Search"
                    onChange={(e) => searchData(e.target.value)}
                />
                </Grid>
                <Grid item xs={1} sm={1} md={3} lg={3} xl={3}>
                </Grid>
           </Grid>
        
        ) : (
            <Grid container spacing={1}>
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center">
                    <Typography style={{color:'#1341a4', fontSize:'30px',fontWeight:'700', marginTop: '30px', lineHeight:'1em', verticalAlign:'middle'}}>
                        Explore {guilds ? guildCount : null} 
                        {guilds && guildCount > 1 ? ' Guilds': null} 
                        {guilds && guildCount == 1 ? ' Guild': null}
                        {guilds && guildCount == 0 ? ' Guilds': null}
                    </Typography>
                </Grid>
 
         
                <Grid item xs={1} sm={1} md={3} lg={3} xl={3}>
                </Grid>
                <Grid item xs={10} sm={10} md={6} lg={6} xl={6}>
                <SearchBar
                    placeholder="Search"
                    onChange={(e) => searchData(e.target.value)}
                />
                </Grid>
                <Grid item xs={1} sm={1} md={3} lg={3} xl={3}>
                </Grid>
            </Grid>
            

        )}
        
        

        <List sx={{ bgcolor: 'background.paper', paddingLeft: '10px', paddingRight: '10px' }}>
          {guilds && guildCount > 0 ? 
            (<>
              
            {guilds.map(({accountId, blockTime, did, owner, category}, i) => {
                console.log('guilds', guilds)
                return ( 
                    <GuildCard
                        key={i}
                        contractId={accountId}
                        created={blockTime}
                        summoner={owner}
                        did={did}
                        link={''}
                        state={state}
                        makeSearchGuilds={makeSearchGuilds}
                        status={'active'}
                        registered={true}
                        category={category}
                    />
               )
            }
            )}
       
            </>)
        : null
        }

        </List>
       
       
        </>
    )
}