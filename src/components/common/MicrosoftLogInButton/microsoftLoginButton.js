import React from 'react'
import { makeStyles } from '@mui/styles'
import { useMsal } from "@azure/msal-react";

// Material UI components
import Button from '@mui/material/Button'
import LockOpenTwoToneIcon from '@mui/icons-material/LockOpenTwoTone'

const useStyles = makeStyles((theme) => ({
  button: {
    width: '90%',
    fontSize: '16px'
  }
  }));

export default function MicrosoftLoginButton(props) {

    const classes = useStyles()
    const { instance } = useMsal()

    function signInClickHandler(instance) {
      instance.loginRedirect();
    }

    return (
        <> 
        <Button
        variant="contained"
        color="primary"
        className={classes.button}
        startIcon={<LockOpenTwoToneIcon />}
        onClick={() => signInClickHandler(instance)}
        >Sign In</Button>
           
      </>
    )
}