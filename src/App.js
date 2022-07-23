import React, { useState, useContext, useEffect } from 'react'
import { appStore, onAppMount } from './state/app'
import { Providers, ProviderState } from '@microsoft/mgt-element'
import { get, set, del } from './utils/storage'
import { Route } from "react-router-dom"
import Header from './components/common/Header/header'
import Footer from './components/common/Footer/footer'
import RandomPhrase from './components/common/RandomPhrase/randomPhrase'
import NewKey from './components/mainPages/newKey'
import Choice from './components/mainPages/choice'
import IndivRegister from './components/mainPages/indivRegister'
import GuildRegister from './components/mainPages/guildRegister'
import IndivProfile from './components/Profiles/indivProfile'
import GuildProfile from './components/Profiles/guildProfile'
import Registration from './components/mainPages/registration'
import CreateIndivProfile from './components/mainPages/createIndividualProfile'
import CreateGuildProfile from './components/mainPages/createGuildProfile'
import ExploreGuilds from './components/mainPages/guilds'
import ExploreIndividuals from './components/mainPages/individuals'
import DisplayGuildProfile from './components/mainPages/displayGuildProfile'
import DisplayIndivProfile from './components/mainPages/displayIndivProfile'
import Admin from './components/mainPages/admin'
import Pledge from './components/mainPages/pledge'
import Announcements from './components/mainPages/announcements'
import Dashboard from './components/mainPages/dashboard'
import BottomAppBar from './components/common/BottomAppBar/bottomAppBar'
import { Home } from './components/mainPages/home'
import { useMsal, AuthenticatedTemplate, UnauthenticatedTemplate } from "@azure/msal-react";
import Splash from './components/mainPages/splash'
import { ceramic } from './utils/ceramic'
import HeaderMenu from './components/common/HeaderMenu/headerMenu'
import UpArrow from './components/common/UpArrow/upArrow'
import Settings from './components/mainPages/settings'
import { ProfileData } from './components/ProfileData/profileData';
import { callMsGraph, callMsGraphPhoto, callMsGraphCalendar } from '../graph';
import { loginRequest } from "../authConfig";
import { Person, Agenda } from '@microsoft/mgt-react'
import { motion } from 'framer-motion'

// Material-UI Components
import { makeStyles } from '@mui/styles'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'
import useMediaQuery from '@mui/material/useMediaQuery'
import { Button } from '@mui/material'

const axios = require('axios').default

// helpers
export const btnClass = 'btn btn-sm btn-outline-primary mb-3 '
export const flexClass = 'd-flex justify-content-evenly align-items-center '
export const qs = (s) => document.querySelector(s)

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#58714C'
      },
    centered: {
      width: '200px',
      height: '100px',
      textAlign: 'center',
      position: 'fixed',
      top: '50%',
      left: '50%',
      marginTop: '-100px',
      marginLeft: '-100px'
    },
    centeredPhrase: {
        maxWidth: '450px',
        height: '100px',
        textAlign: 'center',
        position: 'fixed',
        top: '50%',
        left: '50%',
        marginTop: '-80px',
        marginLeft: '-100px'
      },
    container: {
        maxWidth: '60%'
    },
    containerFull: {
        maxWidth: '100%',
        width: '100%'
    }
    }));

const App = () => {
   
    const { state, dispatch, update } = useContext(appStore)
    const [isSignedIn, setIsSignedIn] = useState(false)
    const [graphData, setGraphData] = useState(null);
    const [graphPhotoData, setGraphPhotoData] = useState(null)

    const classes = useStyles()
    const matches = useMediaQuery('(max-width:500px)')

    const onMount = () => {
        dispatch(onAppMount())
    }

    const { instance, accounts } = useMsal()
    
    useEffect(() => {

        async function fetchData(){
            try{
                
                let keypair = false
                let user
                if(accounts && instance){
                    keypair = await ceramic.getVaultKeyPair(accounts[0].username)
                    console.log('keypair', keypair)
                    if(!keypair){
                        let result = await ceramic.setVaultKeyPair(accounts[0].username)
                        console.log('result', result)
                    }
                    setIsSignedIn(true)

                    // Get ECN profile data
                    const request = {
                        ...loginRequest,
                        account: accounts[0]
                    }

                    let photo
                    let personData
                    let calendarData
                    // Silently acquires an access token which is then attached to a request for Microsoft Graph data
                    try {
                        let response = await instance.acquireTokenSilent(request)
                        console.log('person response', response)
                        if(response){
                            personData = await callMsGraph(response.accessToken)
                        }
                    } catch (err) {
                        console.log('err', err)
                        let response = await instance.acquireTokenRedirect(request)
                        console.log('person error response', response)
                        if(response){
                            personData = await callMsGraph(response.accessToken)
                        }
                    }
                
                    try {
                        let response = await instance.acquireTokenSilent(request)
                        console.log('photo response', response)
                        if(response){
                            photo = await callMsGraphPhoto(response.accessToken)
                        }
                        } catch (err) {
                            console.log('err', err)
                            let response = await instance.acquireTokenRedirect(request)
                            console.log('photo err response', response)
                            if(response){
                                photo = await callMsGraphPhoto(response.accessToken)
                            }
                    }

                    try {
                        let response = await instance.acquireTokenSilent(request)
                        console.log('calendar response', response)
                        if(response){
                            calendarData = await callMsGraphCalendar(response.accessToken)
                        }
                        } catch (err) {
                            console.log('err', err)
                            let response = await instance.acquireTokenRedirect(request)
                            console.log('calendar err response', response)
                            if(response){
                                calendarData = await callMsGraphCalendar(response.accessToken)
                            }
                    }
                  
                    // Update state with data
                    update('', {
                        microsoftAccount: accounts, 
                        keyPair: keypair, 
                        isSignedIn: true, 
                        graphData: personData, 
                        graphPhotoData: photo,
                        calendar: await calendarData.json()
                    })
                }
                
            } catch (err) {
                console.log('error retrieving account', err)
            }
        }

        fetchData()
        .then(() => {
            
        })
        
    }, [accounts, instance])

    useEffect(onMount, []);

    window.onerror = function (message, url, lineNo) {
        alert('Error: ' + message + 
       '\nUrl: ' + url + 
       '\nLine Number: ' + lineNo);
    return true;   
    }    
    
    const {
        accountData, funding, wallet, microsoftAccount
    } = state
    
    let children = null

    if (!accountData || !wallet) {
        children = (<>
        <div className={classes.centered}><CircularProgress/><br></br>
            <Typography variant="h6">Setting Things Up...</Typography>
        </div>
        <div className={classes.centeredPhrase}>
            <RandomPhrase />
        </div></>)
    }

    // if (accountData) {
    //     children = <Receiver {...{ state, dispatch }} />
    // }

    // if (funding) {
    //     children = <div class="container container-custom">
    //         <h2>DO NOT CLOSE OR REFRESH THIS PAGE</h2>
    //         <h2>Creating Persona...</h2>
    //     </div>
    // }

    // if (wallet) {
    //     children = <PersonaPage {...{ state, dispatch, update }} />

    // }
    
    return(
        <>
        
        <UnauthenticatedTemplate>
        <HeaderMenu signedIn={isSignedIn} />
        <div className={classes.root}>
        <Grid container alignItems="center" justifyContent="center" >
            <Grid item align="center" className={`${!matches ? classes.container : classes.containerFull}`}>
                <Route exact path="/">
                    <Splash
                        state={state}
                        >
                        { children }
                    </Splash>
                </Route>
            </Grid>
        </Grid>
        </div>
        </UnauthenticatedTemplate>

        <AuthenticatedTemplate>
        <HeaderMenu signedIn={isSignedIn} />
        <div className={classes.root}> 
        <Grid container alignItems="center" justifyContent="center">
            <Grid item align="center" className={`${!matches ? classes.container : classes.containerFull}`}>
            <Route exact path="/">
           
                <Home 
                    state={state}
                    >
                   
                    { children }
                </Home>
            
            </Route>
            <Route exact path="/setup"> 
                <NewKey 
                    state={state}
                    >
                    { children }
                </NewKey>
            </Route>
            <Route exact path="/admin">
            <Admin
                state={state}
                >
                { children }
            </Admin>
            </Route>
            <Route exact path="/settings">
            <motion.div 
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2, ease: 'easeOut' }}
            >
                <Settings state={state}/>
                  
            </motion.div>
            </Route>
            <Route exact path="/guilds">
                <ExploreGuilds
                    state={state}
                    >
                    { children }
                </ExploreGuilds>
            </Route>
            <Route exact path="/pledge">
                <Pledge
                    state={state}
                    >
                    { children }
                </Pledge>
            </Route>
            <Route exact path="/people">
                <ExploreIndividuals
                    state={state}
                    >
                    { children }
                </ExploreIndividuals>
            </Route>
            <Route exact path="/registration">
                <Registration
                    state={state}
                    >
                    { children }
                </Registration>
            </Route>
            <Route exact path="/register-individual">
                <IndivRegister
                    state={state}
                    >
                    { children }
                </IndivRegister>
            </Route>
            <Route exact path="/register-guild">
                <GuildRegister 
                    state={state}
                    >
                    { children }
                </GuildRegister>
            </Route>
            <Route exact path="/create-guild-profile">
                <CreateGuildProfile
                    state={state}
                    >
                    { children }
                </CreateGuildProfile>
            </Route>
            <Route exact path="/announcements">
                <Announcements
                    state={state}
                    >
                    { children }
                </Announcements>
            </Route>
            <Route exact path="/create-indiv-profile">
                <CreateIndivProfile
                    state={state}
                    >
                    { children }
                </CreateIndivProfile>
            </Route>
            <Route exact path="/indiv-profile">
                <IndivProfile 
                    state={state}
                    >
                    { children }
                </IndivProfile>
            </Route>
            <Route exact path="/guild-profile">
                <GuildProfile 
                    state={state}
                    >
                    { children }
                </GuildProfile>
            </Route>
            <Route exact path="/dashboard">
            <Dashboard
                state={state}
                >
                { children }
            </Dashboard>
            </Route>
            <Route path="/guild-profiles/:guildDid">
                <DisplayGuildProfile />
            </Route>
            <Route path="/indiv-profiles/:indivDid">
                <DisplayIndivProfile />
            </Route>
           </Grid>
        </Grid>
        </div> 
        <BottomAppBar />
        <UpArrow />
        </AuthenticatedTemplate>

        </>
       
    )
}

export default App
