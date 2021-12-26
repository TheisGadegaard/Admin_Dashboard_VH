import { React, useEffect, useState } from 'react';
import Chart from 'react-apexcharts';
import { LoginHelper } from '../../../core/LoginHelper';
import { DashboardService } from '../services/DashboardService';
import Loading from 'react-fullscreen-loading';
import { ToastsStore } from 'react-toasts';
import getLanguage from '../../../core/Language';
import { FormControl, Grid, MenuItem, InputLabel, Select } from '@material-ui/core';

const EventActivityGraph = () => {

    const dashboardService = new DashboardService();
    const loginHelper = new LoginHelper();

    const [trackingDataIsLoading, setTrackingDataIsLoading] = useState(true);
    const [eventDataIsLoading, setEventDataIsLoading] = useState(true);
    const [eventData, setEventData] = useState([]);
    const [selectedEventData, setSelectedEventData] = useState([]);
    const [activityData, setActivityData] = useState(null);
    const [selectedPage, setSelectedPage] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);

    const colors = [
        'rgb(93, 126, 237)',
        'rgb(160, 234, 207)',
        'rgb(255, 202, 59)',
        'rgb(93, 126, 237, 0.4)'
    ]

    useEffect(() => {
        getEventData();
        getTrackingData();
    }, [])

    useEffect(() => {
        handleEventDataForGraph();
    }, [selectedPage, selectedDate])

    const getEventData = async () => {
        setEventDataIsLoading(true);
        await dashboardService.getAllEventsStartDateEndDate(loginHelper.getCurrentHive().id)
            .then(res => {
                setEventData(res);
                setEventDataIsLoading(false);
            })
            .catch(
                err => {
                    ToastsStore.error(
                        `${getLanguage("Error getting event data: ")} + ${err}`
                    );
                    console.log(err)
                }
        );
    }

    const getTrackingData = async () => {
        setTrackingDataIsLoading(true)
        await dashboardService.getAllPagesActivityByHiveId(loginHelper.getCurrentHive().id, 5)
            .then(res => {
                handleTrackingDataForGraph(res);
                setTrackingDataIsLoading(false);
            })
            .catch(
                err => {
                    ToastsStore.error(
                        `${getLanguage("Error getting tracking data: ")} + ${err}`
                    );
                    console.log(err)
                }
            );
    }

    const handleTrackingDataForGraph = (serverResponse) => {
        let pages = [];

        for (const page of Object.keys(serverResponse)) {
            let title = serverResponse[page].Title;
            let temp = [];
            for (const traffic of serverResponse[page].Traffic) {
                temp.push(
                    {
                        x: traffic.Timestamp,
                        y: traffic.Activity
                    }
                );
            }
            pages.push({
                name: title,
                data: temp
            });
        }
        setActivityData(pages);
    }

    const handleEventDataForGraph = () => {
        let selectedPageEvents = [];
        let i = 0;  //pointer for choosing colors

        let currentPageName = selectedPage ? selectedPage.name : "test";
              
        eventData.map(event => {
            if (event.PageTitle == currentPageName) {
                selectedPageEvents.push({
                    x: new Date(event.startDate).getTime(),
                    x2: new Date(event.endDate).getTime(),
                    fillColor: colors[i % colors.length],
                    label: {
                        text: event.EventTitle
                    }
                });
                i++;
            }
        });
            
        setSelectedEventData(selectedPageEvents);
    }

    if (trackingDataIsLoading || eventDataIsLoading) {
            return <Loading loading background="#DDD" loadingColor="#3498db" />
    }

    const dropdownPages = () => {
        return activityData.map(data => (
            <MenuItem key={data.name} value={data}>
                {data.name}
            </MenuItem>
        ))
    }

    const dropdownDates = () => {
        let dates = [];

        if (selectedPage) {
            dates.push({
                dateName: 'All time',
                dateValue: ''
            });
            selectedPage.data.map(data => {
                let tempdate = {
                    dateName:
                        new Date(data.x).getDate() + '/' +
                        (new Date(data.x).getMonth() + 1).toLocaleString() + '/' + //add 1 because months in JS range 0-11
                        new Date(data.x).getFullYear(),
                    dateValue:
                        new Date(data.x)
                };
                if (!dates.some(date => date.dateName == tempdate.dateName)) {
                    dates.push(tempdate);
                }
            });
        } else {
            dates.push({
                dateName: 'Please select page',
                dateValue: ''
            });
        }

        return dates.map(date => (
            <MenuItem key={date.dateName} value={date}>
                {date.dateName}
            </MenuItem>
        ));
    }

    const series = () => {

        console.log(selectedDate);

        if (selectedPage) {
            if (!selectedDate || selectedDate.dateName == 'All time') {
                return [
                    {
                        name: selectedPage.name,
                        type: 'line',
                        data: selectedPage.data
                    }
                ]
            }

            let selectedPageDataSortedByDate = [];
            let selectedDateValue = new Date(Date.parse(selectedDate.dateValue));

            selectedPage.data.map(selectedPageData => {
                let selectedPageDataDateValue = new Date(Date.parse(selectedPageData.x));
                
                if (
                    selectedPageDataDateValue.getFullYear() == selectedDateValue.getFullYear() &&
                    selectedPageDataDateValue.getMonth() == selectedDateValue.getMonth() &&
                    selectedPageDataDateValue.getDate() == selectedDateValue.getDate()
                ) {
                    selectedPageDataSortedByDate.push({
                        x: selectedPageData.x,
                        y: selectedPageData.y
                    })
                }
            })

            return [
                {
                    name: selectedPage.name,
                    type: 'line',
                    data: selectedPageDataSortedByDate
                }
            ];

        } else {
            return [
                {
                    data: []
                }
            ];
        }
    }

    const options = {

        chart: {
            id: 'EventActivity'
        },
        stroke: {
            curve: 'smooth'
        },
        annotations: {
            xaxis: selectedEventData ? selectedEventData : []
        },
        xaxis: {
            type: 'datetime',
            labels: {
                show: 'true',
                datetimeFormatter: {
                    year: 'yyyy',
                    month: 'MMM \'yy',
                    day: 'dd MMM',
                    hour: 'HH:mm'
                }
            }
        },
        noData: {
            text: 'Please Select Page',
            align: 'center',
            verticalAlign: 'middle',
            style: {
                color: 'black'
            }
        }
    };

    const handleSelectedPageChanged = (event) => {
        setSelectedPage(event.target.value);
    }

    const handleSelectedDateChanged = (event) => {
        setSelectedDate(event.target.value);
    }

    return (
        <div>
            <Grid container spacing={2}>
                <Grid item xs={6}>
                    <FormControl variant="outlined" fullWidth={true}>
                        <InputLabel>
                             {getLanguage("Page")}
                        </InputLabel>
                        <Select
                            value=''
                            variant="outlined"
                            onChange={handleSelectedPageChanged}
                        >
                            {dropdownPages()}
                        </Select>
                        </FormControl>  
                </Grid>
                <Grid item xs={6}>
                    <FormControl variant="outlined" fullWidth={true}>
                        <InputLabel>
                            {getLanguage("Date")}
                        </InputLabel>
                        <Select
                            value=''
                            variant="outlined"
                            onChange={handleSelectedDateChanged}
                        >
                            {dropdownDates()}
                            </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12}>
                    <Chart
                        type='line'
                        series={series()}
                        options={options}
                        />
                </Grid>
            </Grid>
        </div>
        )
}

export default EventActivityGraph;