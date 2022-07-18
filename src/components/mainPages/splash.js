import React, { useState, useEffect, useContext } from 'react'
import { appStore, onAppMount } from '../../state/app'
import MicrosoftLoginButton from '../common/MicrosoftLogInButton/microsoftLoginButton'
import ImageLoader from '../common/ImageLoader/imageLoader'
import { useMsal, AuthenticatedTemplate, UnauthenticatedTemplate } from "@azure/msal-react";

// Material UI Components
import { makeStyles } from '@mui/styles'
import { css, keyframes } from "@emotion/react"
import Grid from '@mui/material/Grid'
import { useTheme } from "@mui/material/styles"
import useMediaQuery from '@mui/material/useMediaQuery'
import MicrosoftLogoutButton from '../common/MicrosoftLogOutButton/microsoftLogoutButton';

const useStyles = makeStyles((theme) => ({
    center: {
        textAlign: 'center',
        fontWeight: 700,
        paddingTop: 30, 
        paddingBottom: 60, 
    },
   
    bottom: {
      position: 'absolute',
      bottom: 0,
      height: '50px',
      width: '90%'
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
    
}));

const myEffect = keyframes`
  0% {
    opacity: 0;
    transform: translateY(-200%);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`;
const myEffectExit = keyframes`
  0% {
    opacity: 1;
    transform: translateY(0);
  }
  100% {
    opacity: 0;
    transform: translateY(-200%);
  }
`;

const dipDarkLogo = require('../../img/dip-dark-logo.png')

const logoStyle = {
    maxWidth: '200px'
}

export default function Splash (props) {
    const classes = useStyles()
    const matches = useMediaQuery('(max-width:500px)')
    const { state, update } = useContext(appStore)


    const theme = useTheme()
    const animatedItem = css`
      animation: ${myEffect} 3000ms ${theme.transitions.easing.easeInOut};
    `;
    const animatedItemExiting = css`
      animation: ${myEffectExit} 3000ms ${theme.transitions.easing.easeInOut};
      opacity: 0;
      transform: translateY(-200%);
    `;
    const [exit, setExit] = useState(false)
    
    const { accounts } = useMsal();
    
    useEffect(() => {
      update('', {microsoftAccount: accounts})
    }, [accounts])


    function WelcomeUser() {
      
      console.log('account', state.microsoftAccount)
      const name = state.microsoftAccount[0].name;
      
      return (<p>Welcome, {name}</p>)
    }
    
  

    return(
    <>
      
    {!matches ?
            <Grid container justifyContent="center" alignItems="center" spacing={0}>
              
            </Grid>
        :
            <Grid container justifyContent="center" alignItems="center" spacing={0} >
          
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center">
                
                  <div className={classes.centered}>
                    <ImageLoader image={dipDarkLogo} style={logoStyle} css={exit ? animatedItemExiting : animatedItem}/>
                  </div>
                </Grid>
               
                <Grid item xs={12} sm={12} md={12} lg={12} xl={12} align="center" className={classes.bottom}>
                <AuthenticatedTemplate>
                  <MicrosoftLogoutButton />
                </AuthenticatedTemplate>
                <UnauthenticatedTemplate>
                    <MicrosoftLoginButton />
                </UnauthenticatedTemplate>
                </Grid>
            </Grid>
    }
    </>
    )
}