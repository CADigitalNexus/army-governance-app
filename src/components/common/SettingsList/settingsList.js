import * as React from 'react';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import MicrosoftLogoutWord from '../MicrosoftLogOutWord/microsoftLogoutWord';

import { Avatar } from "@mui/material";
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import IconButton from '@mui/material/IconButton';

export default function SettingsList(props) {

  const {
    graphData,
    graphPhoto,
    username
  } = props

  console.log('graphphoto', graphPhoto)
  console.log('username', username)

  return (
    <Box sx={{ width: '100%', height: '100vh', bgcolor: 'white' }}>
        <List>
          <ListItem
            secondaryAction={
              <IconButton edge="end" aria-label="go">
                <ChevronRightIcon />
              </IconButton>
            }
          >
            <ListItemAvatar>
              <Avatar src={graphPhoto} />
            </ListItemAvatar>
            <ListItemText
              primary={username}
              secondary="Name, email, phone"
            />
          </ListItem>
          <MicrosoftLogoutWord />     
        </List>
    </Box>
  );
}
