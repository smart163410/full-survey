import React, { useEffect, useRef } from 'react'
import { load } from '../redux/results'
import { Model } from 'survey-core'
import 'tabulator-tables/dist/css/tabulator.css'
import 'survey-analytics/survey.analytics.tabulator.css'
import { useNavigate, useParams } from 'react-router-dom'
import { useReduxDispatch, useReduxSelector } from '../redux'

// material-ui
// import { useTheme } from '@mui/material/styles';
import { Grid, MenuItem, TextField, Typography } from '@mui/material';

import MainCard from '../components/MainCard';

import OrdersList from '../sections/dashboard/analytics/OrdersList';
import SalesChart from '../sections/dashboard/SalesChart';
// import { useSelector, useDispatch } from 'react-redux'
// import Spinner from '../components/Spinner'
// import { RootState } from '../redux'
// const SurveyAnalyticsTabulator = require('survey-analytics/survey.analytics.tabulator')



const Viewer = (params: { id: string }): React.ReactElement => {


    const { id } = useParams();
    const dispatch = useReduxDispatch()
    const postStatus = useReduxSelector(state => state.results.status)
    useEffect(() => {
        if (postStatus === 'idle' && id) {
            dispatch(load(id))
        }
    }, []);

    return (
        <Grid container rowSpacing={4.5} columnSpacing={3}>

            {/* row 4 */}
            <Grid item xs={12} md={12} lg={12}>
                <Grid container alignItems="center" justifyContent="space-between">
                    <Grid item>
                        <Typography variant="h1">Vote Rate</Typography>
                    </Grid>
                </Grid>
                <SalesChart />
            </Grid>
            <Grid item xs={12} md={12} lg={12}>
                <Grid container alignItems="center" justifyContent="space-between">
                    <Grid item>
                        <Typography variant="h3">Response Result</Typography>
                    </Grid>
                    <Grid item />
                </Grid>
                <MainCard sx={{ mt: 2 }} content={false}>
                    <OrdersList />
                </MainCard>
            </Grid>
        </Grid>
    )
}



export default Viewer