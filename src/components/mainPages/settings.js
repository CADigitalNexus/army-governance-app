import React from 'react'
import SettingsList from '../common/SettingsList/settingsList'

// Material UI Components
import { makeStyles } from '@mui/styles'
import Grid from '@mui/material/Grid'
import useMediaQuery from '@mui/material/useMediaQuery'

const useStyles = makeStyles((theme) => ({
    root: {
        flexGrow: 1,
        position: 'relative',
        display: 'flex',
        flexDirection: 'column'
      },
    center: {
        textAlign: 'center',
        fontWeight: 700,
        paddingTop: 30, 
        paddingBottom: 60, 
    },
    button: {
        width: '80%',
        fontSize: '40px'
    }
}));

export default function Settings (props) {
    const classes = useStyles()
    const matches = useMediaQuery('(max-width:500px)')
    const {
       state
    } = props
console.log('state', state)
    return (
        <Grid container alignItems="center" justifyContent="space-between" style={{width: '100%'}}>
            <Grid item xs={12} sm={12} md={12} lg={12} xl={12} >
                <SettingsList graphData={state.graphData} graphPhoto={state.graphPhotoData} username={state.graphData.displayName}/>
            </Grid>
        </Grid>
    
    )
}