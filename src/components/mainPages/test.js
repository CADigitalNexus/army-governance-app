import React from 'react'
import TestCard from '../Cards/TestCard/testCard'

// Material UI Components
import Grid from '@mui/material/Grid'

const Test = () => {

    return(
    <>
        <Grid container justifyContent="center" alignItems="center" spacing={3} >
            <Grid item xs={6} sm={6} md={6} lg={6} xl={6} >
              <TestCard title={'Big Lizard'}/>
            </Grid>
            <Grid item xs={6} sm={6} md={6} lg={6} xl={6} >
               <TestCard title={'Little Lizard'} />
            </Grid>
        </Grid>
    </>
    )
}

export default Test