import React from 'react'
import { makeStyles } from '@mui/styles'
import { logout } from '../../../state/near'

// Material UI components
import Button from '@mui/material/Button'
import LockTwoToneIcon from '@mui/icons-material/LockTwoTone'

const useStyles = makeStyles((theme) => ({
  button: {
    marginTop: '5px',
    float: 'right',
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0
  },
  accountButton: {
    margin: 0,
    float: 'right',
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0
  },
  }));

export default function LogoutButton(props) {

    const classes = useStyles()

    return (
        <>
            <Button
            variant="contained"
            color="primary"
            className={classes.button}
            style={{marginTop: '-5px'}}
            startIcon={<LockTwoToneIcon />}
            onClick={logout}
            >Sign Out</Button>
      </>
    )
}