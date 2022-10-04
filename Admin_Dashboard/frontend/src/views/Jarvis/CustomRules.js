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
import Autocomplete from '@material-ui/lab/Autocomplete';


function sortByKey(array, key) {
    return array.sort(function (a, b) {
        var x = a[key]; var y = b[key];
        return ((x < y) ? -1 : ((x > y) ? 1 : 0));
    });
}


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

const CustomRules = (props) => {

    const classes = useStyles();
    const rules_per_page = 20
    const classtype = ['attempted-admin', 'attempted-user', 'inappropriate-content', 'policy-violation', 'shellcode-detect', 'successful-admin', 'successful-user', 'trojan-activity', 'unsuccessful-user', 'web-application-attack', 'attempted-dos', 'attempted-recon', 'attempted-recon', 'bad-unknown', 'default-login-attempt', 'denial-of-service', 'misc-attack', 'non-standard-protocol', 'rpc-portmap-decode', 'successful-dos', 'successful-recon-largescale', 'successful-recon-limited', 'suspicious-filename-detect', 'suspicious-login', 'system-call-detect', 'unusual-client-port-connection', 'web-application-activity', 'icmp-event', 'misc-activity', 'network-scan', 'not-suspicious', 'protocol-command-decode', 'string-detect', 'unknown', 'tcp-connection'].sort()

    let [rule, setRule] = useState([])
    let [allRules, setAllRules] = useState([])
    let [filterInd, setFilterInd] = useState([])
    let [loading, setLoading] = useState(true)
    let [search, setSearch] = useState({ Sid: '', Action: '', Status: '', classtype: '' })
    let [page, setPage] = React.useState(1);
    let [isUpdated, setUpdated] = React.useState(false);
    let [popup, setPopup] = React.useState({
        notif: { disp: false, status: false, text: "" },
        update: { disp: false, index: -1 },
        add: { disp: false }
    })



    useEffect(() => {
        fetch('/api/getCustomRules').then(res => res.json()).then(data => {
            setAllRules(data.Rules)
            setFilterInd(getFilterInd(data.Rules))
            setLoading(false)
        }
        )

    }, [])

    useEffect(() => {
        window.addEventListener('beforeunload', handleTabClose)
        return () => {
            window.removeEventListener("beforeunload", handleTabClose)
        }
    })

    useEffect(() => {
        if (allRules.length) {
            console.log(allRules.length)
            let f_ind = getFilterInd(allRules)
            setFilterInd(f_ind)
        }
    }, [props.location.search])

    useEffect(() => {
        let start_index = (page - 1) * rules_per_page
        setRule(filterInd.slice(start_index, start_index + rules_per_page))
    }, [filterInd])

    useEffect(() => {
        document.getElementById('NavBar').scrollIntoView();
    }, [page])

    const handleChange = (event, value) => {
        setPage(value);
        let start_index = (value - 1) * rules_per_page
        setRule(filterInd.slice(start_index, start_index + rules_per_page))
    };

    const handleSearchChange = (event) => {
        const { target } = event;
        const { name, value } = target;
        console.log("Value: ", value)
        setSearch({ ...search, [name]: value })
    };

    const getFilterInd = (rules) => {
        let f_ind = []
        let query = queryString.parse(props.location.search).q
        for (let i = 0; i < rules.length; i++) {
            if (query) {
                if (!rules[i].Rule.toLowerCase().includes(query.toLowerCase()))
                    continue
            }
            if (search.Sid) {
                if (rules[i].Sid != search.Sid)
                    continue
            }
            if (search.Action) {
                if (rules[i].Action !== search.Action)
                    continue
            }
            if (search.Status) {
                if (rules[i].Status !== search.Status)
                    continue
            }
            if (search.classtype) {
                let rule = rules[i].Rule.toLowerCase()
                let index = rule.indexOf('classtype:')
                let ctype = rule.slice(index + 'classtype:'.length).split(';')[0].toLowerCase().trim()
                console.log(ctype)
                if (ctype != search.classtype)
                    continue
            }
            f_ind.push(i)
        }
        return f_ind
    }

    const handleFilterClick = () => {
        let f_ind = getFilterInd(allRules)
        setFilterInd(f_ind)
        setPage(1)
    }

    const updateRule = (index) => {
        // let newRules = [...allRules]
        // newRules[index].Rule = 'updated ' + allRules[index].Rule
        // setAllRules(newRules)
        console.log({ ...popup, update: { disp: true, index: index } })
        setPopup({ ...popup, update: { disp: true, index: index } })

    }

    const addRule = () => {
        setPopup({ ...popup, add: { disp: true } })
    }

    const deleteRule = (index) => {
        console.log("Delete Rule " + index)
        let newRules = []
        for (let i = 0; i < allRules.length; i++)
            if (i != index)
                newRules.push(allRules[i])

        setAllRules(newRules)
        let f_ind = getFilterInd(newRules)
        setFilterInd(f_ind)
        let start_index = (page - 1) * rules_per_page
        setRule(f_ind.slice(start_index, start_index + rules_per_page))
        if (!isUpdated)
            setUpdated(true)
    }

    const enableRule = (index) => {
        let newRules = []
        for (let i = 0; i < allRules.length; i++) {
            if (i != index)
                newRules.push(allRules[i])
            else
                newRules.push({ ...allRules[i], Status: 'Enabled', Rule: allRules[i].Rule.slice(1).trim() })
        }
        setAllRules(newRules)
        if (!isUpdated)
            setUpdated(true)
    }

    const disableRule = (index) => {
        let newRules = []
        for (let i = 0; i < allRules.length; i++) {
            if (i != index)
                newRules.push(allRules[i])
            else
                newRules.push({ ...allRules[i], Status: 'Disabled', Rule: "# " + allRules[i].Rule })
        }
        setAllRules(newRules)
        if (!isUpdated)
            setUpdated(true)
    }

    const saveChanges = (deploy) => {
        console.log("Changes Saved")
        fetch("/api/saveRules", {
            method: "POST", // or 'PUT'
            body: JSON.stringify({ type: 'Custom', rules: allRules, deploy: deploy }), // data can be `string` or {object}!
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

    const onFormSubmit = (data, add) => {
        console.log("update rule " + data.index)
        let newRules = [...allRules]
        if (add) {
            newRules.push(data.Rule)
            newRules = sortByKey(newRules, 'Sid')
            setAllRules(newRules)
            let f_ind = getFilterInd(newRules)
            setFilterInd(f_ind)
            let start_index = (page - 1) * rules_per_page
            setRule(f_ind.slice(start_index, start_index + rules_per_page))
            handlePopupClose(false, true)
        }
        else {
            newRules[data.index] = data.Rule
            setAllRules(newRules)
            handlePopupClose(false)
        }
        if (!isUpdated)
            setUpdated(true)
    }

    const handleTabClose = (ev) => {
        // if (isUpdated) {
        //     ev.preventDefault()
        //     return ev.returnValue = 'Changes you made have not been saved. Are you sure you want to quit?';
        // }
    }


    let rulesDisp = rule.map(r => <RuleDisplay key={r}
        index={r}
        Rule={allRules[r]}
        updateRule={updateRule}
        deleteRule={deleteRule}
        disableRule={disableRule}
        enableRule={enableRule}
        isCustom={true}
    />)

    return (<div>
        <UpdateRuleForm open={popup.update.disp} handleClose={() => handlePopupClose(false, false)} onFormSubmit={onFormSubmit} index={popup.update.index} Rule={allRules[popup.update.index]} add={false} />
        <UpdateRuleForm open={popup.add.disp} handleClose={() => handlePopupClose(false, true)} onFormSubmit={onFormSubmit} add={true} index={-1} sid={allRules.length && allRules[allRules.length - 1].Sid} />

        <Snackbar open={popup.notif.disp} autoHideDuration={3000} onClose={() => handlePopupClose(true)}>
            <Alert onClose={() => handlePopupClose(true)} severity={popup.notif.success ? "success" : "error"}>{popup.notif.text}</Alert>
        </Snackbar>
        <div className={classes.root}>
            <FormControl className={classes.formControl}>
                <TextField name="Sid" value={search.Sid} label='Sid' onChange={handleSearchChange} ></TextField>
            </FormControl>
            <FormControl className={classes.formControl}>
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                    labelId="status-label"
                    name="Status"
                    value={search.Status}
                    onChange={handleSearchChange}
                >
                    <MenuItem value="">
                        <em>None</em>
                    </MenuItem>
                    <MenuItem value={'Enabled'}>Enabled</MenuItem>
                    <MenuItem value={'Disabled'}>Disabled</MenuItem>
                </Select>
            </FormControl>
            <FormControl className={classes.formControl}>
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
            </FormControl>
            <FormControl className={classes.formControl}>
                <Autocomplete
                    freeSolo
                    value={search.classtype}
                    inputValue={search.classtype}
                    onInputChange={(event, newInputValue) => setSearch({ ...search, classtype: newInputValue })}
                    onChange={(event, newValue) => setSearch({ ...search, classtype: newValue ? newValue : "" })}
                    options={classtype}
                    renderInput={(params) => (
                        <div className={classes.options}>
                            <TextField {...params} label="Class Type" name="classtype" />
                        </div>)}
                />
            </FormControl>
            <Button onClick={handleFilterClick} className={classes.topButton}>Filter</Button>
            <Button className={clsx(classes.addRules, classes.topButton)} onClick={addRule}>Add Rule</Button>
            {isUpdated && <Button className={clsx(classes.addRules, classes.topButton)} onClick={() => saveChanges(false)}>Test Config</Button>}
            {isUpdated && <Button className={clsx(classes.addRules, classes.topButton)} onClick={() => saveChanges(true)}>Deploy to Snort</Button>}
        </div>
        <Grid container justify='center'>
            <Pagination count={Math.ceil(filterInd.length / rules_per_page)} page={page} onChange={handleChange} />
        </Grid>
        {
            loading &&
            <Grid container justify='center'>
                <CircularProgress size='20px' className={classes.loading} />
            </Grid>
        }
        {(!loading && !filterInd.length) ? <Grid container justify='center'>No Matching Rules Found</Grid> : <List>{rulesDisp}</List>}
        <Grid container justify='center'>
            <Pagination count={Math.ceil(filterInd.length / rules_per_page)} page={page} onChange={handleChange} />
        </Grid>
    </div >);
}

export default CustomRules;


