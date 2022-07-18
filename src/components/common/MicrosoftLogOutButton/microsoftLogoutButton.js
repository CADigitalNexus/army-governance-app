import React from 'react'
import { makeStyles } from '@mui/styles'
import { useMsal } from "@azure/msal-react";

// Material UI components
import Button from '@mui/material/Button'
import LockTwoToneIcon from '@mui/icons-material/LockOpenTwoTone'

const useStyles = makeStyles((theme) => ({
  button: {
    width: '90%',
    fontSize: '16px'
  }
  }));

export default function MicrosoftLogoutButton(props) {

    const classes = useStyles()
    const { instance } = useMsal()

    console.log('instance', instance)
   
    function signOutClickHandler(instance) {
      const logoutRequest = {
          account: instance.getActiveAccount(),
      }
      instance.logoutRedirect(logoutRequest);
    }
    
    return (
        <> 
        <Button
        variant="contained"
        color="primary"
        className={classes.button}
        startIcon={<LockTwoToneIcon />}
        onClick={() => signOutClickHandler(instance)} 
        >Sign Out</Button>
           
      </>
    )
}