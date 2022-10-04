import React, { useState, useEffect } from 'react';
import { List, ListItem, Button, Grid, TextField, InputLabel, Select, MenuItem, FormControl, Snackbar } from '@material-ui/core';
import CircularProgress from '@material-ui/core/CircularProgress';
import Pagination from '@material-ui/lab/Pagination';
import MuiAlert from '@material-ui/lab/Alert';
import { purple, red, green } from '@material-ui/core/colors';
import { makeStyles } from '@material-ui/core/styles'
import queryString from 'query-string'
import clsx from 'clsx';
import UpdateRuleForm from './Helpers/UpdateRuleForm';
import RuleDisplay from "./Helpers/RuleDisplay";
import AlertDisplay from "./Helpers/AlertDisplay"
import Autocomplete from '@material-ui/lab/Autocomplete';



const useStyles = makeStyles((theme) => ({
    root: {
        width: '100%',
        // backgroundColor: theme.palette.background.paper,
        overflow: 'hidden'
    },
    addRules: {
        float: 'Right',
        color: theme.palette.getContrastText(purple[500]),
        backgroundColor: purple[500],
        '&:hover': {
            backgroundColor: purple[700],
        },
        margin: "0.5%"
    },
    column: {
        flexBasis: '33.33%',
    },
    helper: {
        borderLeft: `2px solid ${theme.palette.divider}`,
        padding: theme.spacing(1, 2),
    },
    enabled: {
        backgroundColor: green[100]
    },
    disabled: {
        backgroundColor: red[100]
    },
    loading: {
        margin: 'auto'
    },
    topButton: {
        verticalAlign: 'bottom'
    },
    formControl: {
        margin: theme.spacing(1),
        minWidth: 200,
    }
}));

const Alert = (props) => {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
}


const Alerts = (props) => {

    const classes = useStyles();
    const disp_per_page = 20
    const attacks = ['PortScan']
    let [alert, setAlert] = useState([])
    let [allAlerts, setAllAlerts] = useState([])
    let [filterInd, setFilterInd] = useState([])
    let [loading, setLoading] = useState(true)
    let [search, setSearch] = useState({ s_ip: '', d_ip: '', attack: '', detected: '' })
    let [page, setPage] = React.useState(1);
    let [isUpdated, setUpdated] = React.useState(false);
    let [rules, setRules] = useState([])
    let [popup, setPopup] = React.useState({
        notif: { disp: false, status: false, text: "" },
        update: { disp: false, index: -1 },
        add: { disp: false }
    })


    useEffect(() => {
        fetch('/api/getAlerts').then(res => res.json()).then(data => {
            setAllAlerts(data.Alerts)
            setFilterInd(getFilterInd(data.Alerts))
            setLoading(false)
        })
    }, [])

    useEffect(() => {
        let start_index = (page - 1) * disp_per_page
        setAlert(filterInd.slice(start_index, start_index + disp_per_page))
    }, [filterInd])

    useEffect(() => {
        document.getElementById('NavBar').scrollIntoView();
    }, [page])

    const handleChange = (event, value) => {
        setPage(value);
        let start_index = (value - 1) * disp_per_page
        setAlert(filterInd.slice(start_index, start_index + disp_per_page))
    };

    const handlePopupClose = (notification, add = false) => {
        if (notification)
            setPopup({ ...popup, notif: { ...popup.notif, disp: false } })
        else {
            if (add)
                setPopup({ ...popup, add: { disp: false } })
            else
                setPopup({ ...popup, update: { disp: false, index: -1 } })
        }
    }

    const handleSearchChange = (event) => {
        const { target } = event;
        const { name, value } = target;
        console.log("Value: ", value)
        setSearch({ ...search, [name]: value })
    };

    const getFilterInd = (alerts) => {
        let f_ind = []
        // let query = queryString.parse(props.location.search).q
        for (let i = 0; i < alerts.length; i++) {
            // if (query) {
            //     if (!alerts[i].Rule.toLowerCase().includes(query.toLowerCase()))
            //         continue
            // }
            if (search.s_ip) {
                if (alerts[i].Src != search.s_ip)
                    continue
            }
            if (search.d_ip) {
                if (alerts[i].Dst !== search.d_ip)
                    continue
            }
            if (search.attack) {
                if (alerts[i].Detected.toLowerCase() !== search.attack.toLowerCase())
                    continue
            }
            if (search.detected) {
                if (search.detected == 'Snort') {
                    if (!alerts[i].Snort)
                        continue
                }
                else {
                    if (alerts[i].Snort)
                        continue
                }
            }
            f_ind.push(i)
        }
        return f_ind
    }

    const handleFilterClick = () => {
        let f_ind = getFilterInd(allAlerts)
        setFilterInd(f_ind)
        setPage(1)
    }

    const deleteAlert = (indices) => {
        console.log("Delete Alert " + indices)
        let newAlerts = []
        for (let i = 0; i < allAlerts.length; i++)
            if (!indices.includes(i))
                newAlerts.push(allAlerts[i])

        setAllAlerts(newAlerts)
        let f_ind = getFilterInd(newAlerts)
        setFilterInd(f_ind)
        let start_index = (page - 1) * disp_per_page
        setAlert(f_ind.slice(start_index, start_index + disp_per_page))
        if (!isUpdated)
            setUpdated(true)
    }

    const addAlertSol = (index) => {
        let newRules = rules
        newRules.push(allAlerts[index].Rule)
        console.log(newRules)
        setRules(newRules)
        let indices = []
        for (let i = 0; i < allAlerts.length; i++) {
            if (allAlerts[i].Src == allAlerts[index].Src)
                indices.push(i)
        }
        deleteAlert(indices)
    }

    const saveChanges = (deploy) => {
        console.log("Changes Saved")
        fetch("/api/addSuggestedRules", {
            method: "POST", // or 'PUT'
            body: JSON.stringify({ rules: rules, deploy: deploy, alerts: allAlerts }), // data can be `string` or {object}!
            headers: {
                "Content-Type": "application/json"
            }
        }).then(res => res.json()).then(res => {
            if (res.status === "success") {
                setUpdated(false)
                setPopup({ ...popup, notif: { disp: true, success: true, text: "Deployed Succesfully!" } })
            }
            else
                setPopup({ ...popup, notif: { disp: true, success: false, text: "Deployment Not Succesful!" } })
        })
    }

    let alertDisp = alert.map(r => <AlertDisplay key={r}
        index={r}
        Alert={allAlerts[r]}
        deleteAlert={deleteAlert}
        addAlertSol={addAlertSol}
    />)

    return (<div>
        <Snackbar open={popup.notif.disp} autoHideDuration={3000} onClose={() => handlePopupClose(true)}>
            <Alert onClose={() => handlePopupClose(true)} severity={popup.notif.success ? "success" : "error"}>{popup.notif.text}</Alert>
        </Snackbar>
        <div className={classes.root}>
            <FormControl className={classes.formControl}>
                <TextField name="s_ip" value={search.s_ip} label='Source IP' onChange={handleSearchChange} ></TextField>
            </FormControl>
            <FormControl className={classes.formControl}>
                <TextField name="d_ip" value={search.d_ip} label='Destination IP' onChange={handleSearchChange} ></TextField>
            </FormControl>
            {/* <FormControl className={classes.formControl}>
                <InputLabel id="action-label">Action</InputLabel>
                <Select
                    labelId="action-label"
                    name="Action"
                    value={search.Action}
                    onChange={handleSearchChange}
                >
                    <MenuItem value="">
                        <em>None</em>
                    </MenuItem>
                    <MenuItem value={'Alert'}>Alert</MenuItem>
                    <MenuItem value={'Drop'}>Drop</MenuItem>
                </Select>
            </FormControl> */}
            <FormControl className={classes.formControl}>
                <Autocomplete
                    freeSolo
                    value={search.attack}
                    inputValue={search.attack}
                    onInputChange={(event, newInputValue) => setSearch({ ...search, attack: newInputValue })}
                    onChange={(event, newValue) => setSearch({ ...search, attack: newValue ? newValue : "" })}
                    options={attacks}
                    renderInput={(params) => (
                        <div className={classes.options}>
                            <TextField {...params} label="Attack Type" name="attack" />
                        </div>)}
                />
            </FormControl>
            <FormControl className={classes.formControl}>
                <InputLabel id="det-label">Detected By</InputLabel>
                <Select
                    labelId="det-label"
                    name="detected"
                    value={search.detected}
                    onChange={handleSearchChange}
                >
                    <MenuItem value="">
                        <em>None</em>
                    </MenuItem>
                    <MenuItem value={'Model'}>Model</MenuItem>
                    <MenuItem value={'Snort'}>Snort</MenuItem>
                </Select>
            </FormControl>
            <Button className={classes.topButton} onClick={handleFilterClick}>Filter</Button>
            {isUpdated && <Button className={clsx(classes.addRules, classes.topButton)} onClick={() => saveChanges(false)}>Test Config</Button>}
            {isUpdated && <Button className={clsx(classes.addRules, classes.topButton)} onClick={() => saveChanges(true)}>Deploy to Snort</Button>}

        </div>
        <Grid container justify='center'>
            <Pagination count={Math.ceil(filterInd.length / disp_per_page)} page={page} onChange={handleChange} />
        </Grid>
        {
            loading &&
            <Grid container justify='center'>
                <CircularProgress size='20px' className={classes.loading} />
            </Grid>
        }
        {(!loading && !filterInd.length) ? <Grid container justify='center'>No Alerts!</Grid> : <List>{alertDisp}</List>}
        <Grid container justify='center'>
            <Pagination count={Math.ceil(filterInd.length / disp_per_page)} page={page} onChange={handleChange} />
        </Grid>
    </div >);
}

export default Alerts;