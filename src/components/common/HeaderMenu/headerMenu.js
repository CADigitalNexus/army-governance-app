import React, { useEffect, useState } from 'react';
import { Link, useHistory, useLocation } from 'react-router-dom'
import PropTypes from 'prop-types';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import CssBaseline from '@mui/material/CssBaseline';
import useScrollTrigger from '@mui/material/useScrollTrigger';
import Box from '@mui/material/Box';
import Fade from '@mui/material/Fade'
import SettingsIcon from '@mui/icons-material/Settings';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { Typography } from '@mui/material';
import caLogo from '../../../img/ca-header-dark.png'

function ScrollTop(props) {
  const { children, window } = props;
  // Note that you normally won't need to set the window ref as useScrollTrigger
  // will default to window.
  // This is only being set here because the demo is in an iframe.
  const trigger = useScrollTrigger({
    target: window ? window() : undefined,
    disableHysteresis: true,
    threshold: 100,
  });

  const handleClick = (event) => {
    const anchor = (event.target.ownerDocument || document).querySelector(
      '#back-to-top-anchor',
    );

    if (anchor) {
      anchor.scrollIntoView({
        block: 'center',
      });
    }
  };

  return (
    <Fade in={trigger}>
      <Box
        onClick={handleClick}
        role="presentation"
        sx={{ position: 'fixed', bottom: 66, right: 16 }}
      >
        {children}
      </Box>
    </Fade>
  );
}

ScrollTop.propTypes = {
  children: PropTypes.element.isRequired,
  /**
   * Injected by the documentation to work in an iframe.
   * You won't need it on your project.
   */
  window: PropTypes.func,
};

export default function HeaderMenu(props) {
    
    let history = useHistory()
    let location = useLocation()

    const {
        signedIn
    } = props

    console.log('signedIn', signedIn)

  return (
    <React.Fragment>
      <CssBaseline />
      <AppBar style={{backgroundColor: '#58714C', boxShadow: 'none'}}>
        <Toolbar>
        {signedIn && location.pathname == '/' ? <>
            <Link to="/settings" style={{color: 'white'}}><SettingsIcon color="white" /></Link>
            <img src={caLogo} style={{height: '50px', width: 'auto', position: 'absolute', top: 4, left: '50%', marginLeft: '-70px'}}/>
            </> : null
        }
        {!signedIn && location.pathname == '/' ? <>
            <img src={caLogo} style={{height: '50px', width: 'auto', position: 'absolute', top: 4, left: '50%', marginLeft: '-73px'}}/>
            </> : null
        }
        {signedIn && location.pathname == '/settings' ? <>
            <ArrowBackIcon color="white" style={{marginRight: '30px'}} onClick={history.goBack} />
            <Typography variant="h5">Settings</Typography></>: null
        }
        
        </Toolbar>
      </AppBar>
      <Toolbar id="back-to-top-anchor" />     
    </React.Fragment>
  );
}
