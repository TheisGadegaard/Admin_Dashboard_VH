import React, { useEffect, useState } from 'react';
import { LoginHelper } from '../../../core/LoginHelper';
import { DashboardService } from '../../statistics/services/DashboardService';
import { ToastsStore } from 'react-toasts';
import getLanguage from '../../../core/Language';
import { Doughnut } from 'react-chartjs-2';
import Loading from 'react-fullscreen-loading';
import { CardContent, Typography } from '@material-ui/core';

const TopThreeDoughnut = (props) => {

    const dashboardService = new DashboardService();
    const loginHelper = new LoginHelper();

    const [isLoading, setIsLoading] = useState(true);
    const [graphData, setGraphData] = useState(null);
    const [graphTitle, setgraphTitle] = useState("");

    const graphType = props.graphType;

    useEffect(() => {
        getData();
    }, []);

    const getData = async () => {
        setIsLoading(true);
        switch (graphType) {
            case 'getTopStandsWithTraffic':
                await dashboardService.getTopStandsWithTraffic(loginHelper.getCurrentHive().id)
                    .then(res => {
                        handleDataForGraph(res);
                        setgraphTitle('Top 3 Stands')
                        setIsLoading(false);
                    })
                    .catch(
                        err => {
                            ToastsStore.error(
                                `${getLanguage("Error getting data: ")} + ${err}`
                            );
                            console.log(err)
                        }
                    );
                break;
            default:
                console.error("Invalid graphType in TopThreeGraph");
        }
    }
    
    const handleDataForGraph = (serverResponse) => {
        let names = [];
        let count = [];

        for (const key of Object.keys(serverResponse)) {
            names.push(serverResponse[key].Title);
            count.push(serverResponse[key].Count);
        }

        setGraphData({
            labels: names,
            datasets: [
                {
                    label: 'Top 3 graph',
                    data: count,
                    backgroundColor: [
                        'rgb(93, 126, 237)',
                        'rgb(160, 234, 207)',
                        'rgb(255, 202, 59)',
                        'rgb(93, 126, 237, 0.4)'
                    ],
                    borderWidth: 1
                },
            ],
        });
    }

    if (isLoading) {
        return <Loading loading background="#DDD" loadingColor="#3498db" />
    }

    return (
        <div>
            <CardContent>
                <Typography variant="h6">
                    {graphTitle}
                </Typography>
                <Doughnut data={graphData} />
            </CardContent>
        </div>
        )
}

export default TopThreeDoughnut
