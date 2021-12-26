import { Dashboard } from '@material-ui/icons';
import React, { Component, useEffect, useState } from 'react';
import { LoginHelper } from '../../../core/LoginHelper';
import { DashboardService } from '../services/DashboardService';
import { navigateToStands_Page } from '../../../core/Navigation';
import { Box, Link, Typography, Grid, Card, CardContent } from '@material-ui/core';
import { useDispatch } from 'react-redux';
import { updatePageTitle } from '../../../actions/Actions';
import { ToastsStore } from 'react-toasts';
import getLanguage from '../../../core/Language';
import { Doughnut } from 'react-chartjs-2';
import { render } from 'react-dom';
import Loading from 'react-fullscreen-loading';
import TopThreeDoughnut from '../../statistics/components/TopThreeGraph';
import SingleDataPointCard from '../components/SingleDataPointCard';
import { FormControl, makeStyles, MenuItem, TextField, InputLabel, Select, Button } from '@material-ui/core';
import EventActivityGraph from '../components/EventActivityGraph';

const Dashboard_Page = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(updatePageTitle(getLanguage("Dashboard")));
    });

    return (
        
        <Grid container spacing={2}>
            <Grid item xs={3}>
                <Card variant="outlined">
                    <SingleDataPointCard dataPoint='getTotalUniqueVisitors'/>
                </Card>
            </Grid>
            <Grid item xs={3}>
                <Card variant="outlined">
                    <SingleDataPointCard dataPoint='getTotalStandVisits' />
                </Card>
            </Grid>
            <Grid item xs={4}>
                <Card variant="outlined">
                    <TopThreeDoughnut graphType="getTopStandsWithTraffic"/>
                </Card>
            </Grid>
            <Grid item xs={12}>
                <Card variant="outlined">
                    <EventActivityGraph />
                </Card>
            </Grid>
        </Grid>
    )
}

export default Dashboard_Page