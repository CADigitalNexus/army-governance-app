import React, {useState, useEffect, useContext} from 'react'
import { Link } from 'react-router-dom'
import { appStore, onAppMount } from '../../../state/app'
import LeftSideDrawer from '../LeftSideDrawer/leftSideDrawer'
import LoginButton from '../LogInButton/loginButton'
import LogoutButton from '../LogoutButton/logoutButton'
import AccountInfo from '../AccountInfo/accountInfo'
import ImageLoader from '../ImageLoader/imageLoader'
//import NotificationCard from '../Notifications/notifications'
import {ceramic} from '../../../utils/ceramic'

// Material UI
import Grid from '@mui/material/Grid'
import useMediaQuery from '@mui/material/useMediaQuery'
import Stack from '@mui/material/Stack'
import { Typography } from '@mui/material'

import '../../../global.css'
import './header.css'

const armyLogo = require('../../../img/dip-dark-logo.png')

const logoStyle = {
    maxWidth: '200px',
    maxHeight: '50px',
    marginTop: '5px',
    marginLeft: '10px'
}

const Header = ({ state, handleUpdate }) => {
    const [newNotifications, setNewNotifications] = useState(0)
    const [popoverOpen, setPopoverOpen] = useState(false)
    const [anchorEl, setAnchorEl] = useState(null);
    const { update } = useContext(appStore);

    const {
        wallet,
        appIdx,
        isUpdated,
        accountId
    } = state

    useEffect(
        () => {
        async function fetchData(){
            if(isUpdated){}
            if(accountId){
                //get the list of all notifications for all accounts
       
                let result = await ceramic.downloadKeysSecret(appIdx, 'notifications')
                if(result){

                    //convert the object from ceramic to map in order to more easily
                    //return notifications associated with current account
                    if(result[0]){
                        let notificationMap = new Map(Object.entries(result[0])) 

                        let notifications = 0;

                        //loop thorugh all notifications for user, if the read flag is false, increase the count
                        //for the notification badge
                        if(notificationMap.get(accountId)){
                            for(let i = 0; i < notificationMap.get(accountId).length; i++){
                                if(notificationMap.get(accountId)[i].read == false){
                                    notifications++;
                                }
                            }
                        }
                    

                    //set the counter for the badge to the amount of unread notifications
                    setNewNotifications(notifications)
                    }
                }
            }
        }
        fetchData()
        .then((res) => {
        
        })
    }, [accountId, isUpdated])

    const matches = useMediaQuery('(max-width:500px)')

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
        update('', {isUpdated: !isUpdated})
        setPopoverOpen(true)

    }

    const handleClose = () => {
        setAnchorEl(null);
        update('', {isUpdated: !isUpdated})
        setPopoverOpen(false)
    }
    
    return (
        
        <Grid container justifyContent="space-between" alignItems="center" spacing={1} style={{paddingRight: '10px', paddingLeft: '10px', paddingBottom: '5px', backgroundColor: 'black'}}>
            
            {wallet && wallet.signedIn ? 
                !matches ? (
                    <>
                    <div className="header">
                    
                    <Grid item >
                    <div style={{float:'left', marginTop: '15px'}}>
                        <LeftSideDrawer
                        state={state}    
                        />
                    </div>
                        <Link to="/"> 
                            <ImageLoader image={armyLogo} style={logoStyle}/>
                        </Link>
                    </Grid>
                    <Grid item style={{minWidth: '100px'}}>
        
                        {wallet && !wallet.signedIn ? 
                            <Stack spacing={1} justifyContent="center">
                                <Typography variant="body1" style={{color:'#FFFFFF'}}>
                                    français
                                </Typography>    
                            <LoginButton />
                            </Stack> :  
                            <Stack spacing={1} justifyContent="center">
                                <Typography variant="body1" style={{color:'#FFFFFF'}}>
                                    français
                                </Typography>
                                <LogoutButton /> 
                            </Stack>
                        }
                    </Grid>
                    </div>
                    </>
                )
                : (
                    <>
                    <div className="header">
                    
                    <Grid item >
                        <div style={{float:'left', marginTop: '15px'}}>
                            <LeftSideDrawer
                            state={state}                        
                            />
                        </div>
                        <Link to="/"> 
                            <ImageLoader image={armyLogo} style={logoStyle}/>
                        </Link>
                    </Grid>
                    <Grid item  style={{minWidth: '100px'}}>
                        {wallet && !wallet.signedIn ?  
                            <Stack spacing={1} justifyContent="center">
                                <Typography variant="body1" style={{color:'#FFFFFF'}}>
                                    français
                                </Typography>
                                <LoginButton />
                            </Stack> :    
                            <Stack spacing={1} justifyContent="center">
                                <Typography variant="body1" style={{color:'#FFFFFF'}}>
                                    français
                                </Typography>
                                <LogoutButton /> 
                            </Stack>
                        }
                    </Grid>
                    </div>
                    </>
                )
            :  
            wallet && !wallet.signedIn ? 
                !matches ? (
                    <>
                    <div className="header">
                   
                    <Grid item >
                        <div style={{float:'left', marginTop: '15px'}}>
                            <LeftSideDrawer
                                state={state}                        
                            />
                        </div>
                        <Link to="/"> 
                            <ImageLoader image={armyLogo} style={logoStyle}/>
                        </Link>
                    </Grid>
                    <Grid item style={{minWidth: '100px'}}>
                        {wallet && !wallet.signedIn ? 
                            <Stack spacing={1} justifyContent="center">
                                <Typography variant="body1" style={{color:'#FFFFFF'}}>
                                    français
                                </Typography>    
                            <LoginButton />
                            </Stack> :  
                            <Stack spacing={1} justifyContent="center">
                                <Typography variant="body1" style={{color:'#FFFFFF'}}>
                                    français
                                </Typography>
                                <LogoutButton /> 
                            </Stack>
                        }
                    </Grid>
                    </div>
                    </>
                ) : (
                    <>
                    <div className="header">
                    
                    <Grid item >
                        <div style={{float:'left', marginTop: '15px'}}>
                            <LeftSideDrawer
                                state={state}
                            
                            />
                        </div>
                        <Link to="/"> 
                            <ImageLoader image={armyLogo} style={logoStyle}/>
                        </Link>
                    </Grid>
                    <Grid item style={{minWidth: '100px'}}>
                        {wallet && !wallet.signedIn ? 
                            <Stack  spacing={1} justifyContent="center">
                                <Typography variant="body1" style={{color:'#FFFFFF'}}>
                                    français
                                </Typography>    
                            <LoginButton />
                            </Stack> :  
                            <Stack spacing={1} justifyContent="center">
                                <Typography variant="body1" style={{color:'#FFFFFF'}}>
                                    français
                                </Typography>
                                <LogoutButton /> 
                            </Stack>
                        }
                    </Grid>
                    </div>
                    </>
                ) 
            : null
        }
            
        </Grid>
        
      
    )
}

export default Header