import React, { useEffect, useState } from 'react';
import { LoginHelper } from '../../../core/LoginHelper';
import { DashboardService } from '../../statistics/services/DashboardService';
import { ToastsStore } from 'react-toasts';
import Loading from 'react-fullscreen-loading';
import getLanguage from '../../../core/Language';
import { Typography, CardContent } from '@material-ui/core';

const SingleDataPointCard = (props) => {

    const dashboardService = new DashboardService();
    const loginHelper = new LoginHelper();

    const [isLoading, setIsLoading] = useState(true);
    const [data, setData] = useState(null);
    const [title, setTitle] = useState(null);

    const dataPoint = props.dataPoint;

    useEffect(() => {
        getData();
    }, []);

    const getData = async () => {
        setIsLoading(true);
        switch (dataPoint) {
            case 'getTotalUniqueVisitors':
                await dashboardService.getTotalUniqueVisitors(loginHelper.getCurrentHive().id)
                    .then(res => {
                        setData(res);
                        setTitle('Total Unique Visitors');
                        setIsLoading(false);
                    })
                    .catch(
                        err => {
                            ToastsStore.error(
                                `${getLanguage("Error getting data: ")} + ${err}`
                            );
                            console.log(err);
                        setTitle('No Title Found');
                        setIsLoading(false);
                        }
                    );
                break;
            case 'getTotalStandVisits':
                await dashboardService.getTotalStandVisits(loginHelper.getCurrentHive().id)
                    .then(res => {
                        setData(res);
                        setTitle('Total Stand Visits');
                        setIsLoading(false);
                    })
                    .catch(
                        err => {
                            ToastsStore.error(
                                `${getLanguage("Error getting data: ")} + ${err}`
                            );
                            console.log(err)
                            setTitle('No Title Found');
                            setIsLoading(false);
                        }
                    );
                break;
            default:
                setTitle('No Title Found');
                setIsLoading(false);
        }
        
    }

    if (isLoading) {
        return <Loading loading background="#DDD" loadingColor="#3498db" />
    }

    return (
        <React.Fragment>
            <CardContent>
                <Typography variant="h5">
                    {title}
                </Typography>
                <Typography variant="h2">
                    {data}
                </Typography>
            </CardContent>
        </React.Fragment>
        )
}

export default SingleDataPointCard