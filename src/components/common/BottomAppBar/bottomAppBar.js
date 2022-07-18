import React, { useState, useEffect, useContext } from 'react';
import { styled } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import CssBaseline from '@mui/material/CssBaseline';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import Fab from '@mui/material/Fab';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import ListItemText from '@mui/material/ListItemText';
import ListSubheader from '@mui/material/ListSubheader';
import Avatar from '@mui/material/Avatar';
import MenuIcon from '@mui/icons-material/Menu';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import MoreIcon from '@mui/icons-material/MoreVert';
import MainMenu from '../MainMenu/mainMenu';
import Backdrop from '@mui/material/Backdrop';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import SpeedDialAction from '@mui/material/SpeedDialAction';
import FileCopyIcon from '@mui/icons-material/FileCopyOutlined';
import SaveIcon from '@mui/icons-material/Save';
import PrintIcon from '@mui/icons-material/Print';
import ShareIcon from '@mui/icons-material/Share';
import HomeIcon from '@mui/icons-material/Home';
import brainBulb from '../../../img/brainbulbicon.png'

const actions = [
  { icon: <FileCopyIcon />, name: 'Copy' },
  { icon: <SaveIcon />, name: 'Save' },
  { icon: <PrintIcon />, name: 'Print' },
  { icon: <ShareIcon />, name: 'Share' },
];

const StyledFab = styled(Fab)({
  position: 'absolute',
  zIndex: 1,
  top: -10,
  left: 0,
  right: 0,
  margin: '0 auto',
  backgroundColor: '#3675E1'
});

export default function BottomAppBar() {

  const [anchorEl, setAnchorEl] = useState(null)
  const [menuClicked, setMenuClicked] = useState(false)
  const [menuClickState, setMenuClickState] = useState(false)

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  function signOutClickHandler(instance) {
    const logoutRequest = {
        account: instance.getActiveAccount(),
        postLogoutRedirectUri: "/"
    }
    instance.logoutRedirect(logoutRequest);
  }

  function handleExpanded() {
    setAnchorEl(null)
  }

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  }

  const handleMenuClick = () => {
    handleExpanded()
    handleMenuClickState(true)
  }

  function handleMenuClickState(property){
    setMenuClicked(property)
  }

  // SignOutButton Component returns a button that invokes a popup login when clicked
  function SignOutButton() {
    // useMsal hook will return the PublicClientApplication instance you provided to MsalProvider
    const { instance } = useMsal();
    console.log('instance', instance)
    return <Button onClick={() => signOutClickHandler(instance)} variant="contained" style={{width:'90%', color: '#FFFFFF', fontSize: '16px'}}>Sign Out</Button>
    };
  
  return (
    <React.Fragment>
      <CssBaseline />
      <AppBar position="fixed" sx={{ top: 'auto', bottom: 0 , backgroundColor: 'white'}}>
        <Toolbar style={{justifyContent: 'space-between'}}>
          <IconButton color="inherit" aria-label="open drawer">
            <HomeIcon style={{color: 'blue'}} />
          </IconButton>
          <IconButton color="inherit" aria-label="open drawer">
            <MenuIcon style={{marginRight: '80px', color: 'blue'}}/>
          </IconButton>
          <StyledFab>
              <img src={brainBulb} style={{maxHeight: '40px'}} onClick={handleMenuClick} color="primary" alt="Main Menu" />
          </StyledFab>
          <IconButton color="inherit">
            <SearchIcon style={{color: 'blue'}}/>
          </IconButton>
          <IconButton color="inherit">
            <MoreIcon style={{color: 'blue'}} />
          </IconButton>
        </Toolbar>
      </AppBar>

      {menuClicked ? <MainMenu
        handleMenuClickState={handleMenuClickState}
      /> : null}

    </React.Fragment>
  )
    

  
}