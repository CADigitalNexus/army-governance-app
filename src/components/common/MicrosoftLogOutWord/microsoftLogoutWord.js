import React from 'react'
import { useMsal } from "@azure/msal-react"

// Material UI components
import { ListItem, ListItemIcon, ListItemButton, ListItemText } from '@mui/material'
import LockTwoToneIcon from '@mui/icons-material/LockOpenTwoTone'

export default function MicrosoftLogoutWord(props) {

    const { instance } = useMsal()
   
    function signOutClickHandler(instance) {
      const logoutRequest = {
          account: instance.getActiveAccount(),
      }
      instance.logoutRedirect(logoutRequest);
    }
    
    return (
        <>
        <ListItem>
          <ListItemIcon>
            <LockTwoToneIcon />
          </ListItemIcon>
          <ListItemButton onClick={() => signOutClickHandler(instance)}>
            <ListItemText primary="Sign Out" />
          </ListItemButton>
        </ListItem>
        </>
    )
}