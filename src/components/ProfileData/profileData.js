import React from "react";

import { Avatar } from "@mui/material";
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import IconButton from '@mui/material/IconButton';
/**
 * Renders information about the user obtained from Microsoft Graph
 */
export const ProfileData = (props) => {
    console.log('props', props)
    return (<>
            <List>
                <ListItem
                  secondaryAction={
                    <IconButton edge="end" aria-label="delete">
                      <ChevronRightIcon />
                    </IconButton>
                  }
                >
                  <ListItemAvatar>
                    <Avatar src={props.graphPhoto}/>
                  </ListItemAvatar>
                  <ListItemText
                    primary={props.username}
                    secondary="Name, phone, email"
                  />
                </ListItem>
            </List>
        <div id="profile-div">
            <p></p>
            <p><strong>First Name: </strong> </p>
            <p><strong>Last Name: </strong> {props.graphData.surname}</p>
            <p><strong>Email: </strong> {props.graphData.userPrincipalName}</p>
            <p><strong>Id: </strong> {props.graphData.id}</p>
        </div>
        </>
    );
};