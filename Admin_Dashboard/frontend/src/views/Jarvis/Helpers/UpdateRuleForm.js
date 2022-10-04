import React, { useState, useEffect } from 'react';
import Button from '@material-ui/core/Button';
import TextField from '@material-ui/core/TextField';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import MenuItem from '@material-ui/core/MenuItem'
import Autocomplete from '@material-ui/lab/Autocomplete';
import { Select, FormControl, InputLabel, FormControlLabel, Switch, Typography, List, ListItem, IconButton, Box } from "@material-ui/core"
import AddIcon from '@material-ui/icons/Add';
import ClearIcon from '@material-ui/icons/Clear';
import { makeStyles } from '@material-ui/core/styles'
import uuidv from 'uuid/v4';



const useStyles = makeStyles((theme) => ({
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
    },
    divcont: {
        width: '100%',
        // backgroundColor: theme.palette.background.paper,
        overflow: 'hidden'
    },
    column: {
        width: '40%',
        float: 'left',
        margin: theme.spacing(1),
        minWidth: 120,
    },
    options: {
        width: '30%',
        float: 'left',
        margin: theme.spacing(1),
        minWidth: 200,
    },
    Icon: {
        float: 'right',
        verticalAlign: 'top'
    },
    IconLabel: {
        float: 'right',
        // verticalAlign: 'center'
    },
    listItem: {
        margin: theme.spacing(0)
    }
}))

const UpdateRuleForm = (props) => {

    const classes = useStyles();

    const formOptions = {
        action: ['alert', 'log', 'pass', 'drop', 'reject', 'sdrop', 'activate', 'dynamic'],
        protocol: ['tcp', 'udp', 'icmp', 'ip'],
        ip: ['$HOME_NET', '$EXTERNAL_NET'], port: ['any']
    }

    const keyOptions = {
        options: ['msg', 'reference', 'sid', 'gid', 'classtype', 'rev', 'priority'],
        metadata: ['engine', 'soid', 'service', 'policy']
    }
    const fieldOptions = {
        classtype: ['attempted-admin', 'attempted-user', 'inappropriate-content', 'policy-violation', 'shellcode-detect', 'successful-admin', 'successful-user', 'trojan-activity', 'unsuccessful-user', 'web-application-attack', 'attempted-dos', 'attempted-recon', 'attempted-recon', 'bad-unknown', 'default-login-attempt', 'denial-of-service', 'misc-attack', 'non-standard-protocol', 'rpc-portmap-decode', 'successful-dos', 'successful-recon-largescale', 'successful-recon-limited', 'suspicious-filename-detect', 'suspicious-login', 'system-call-detect', 'unusual-client-port-connection', 'web-application-activity', 'icmp-event', 'misc-activity', 'network-scan', 'not-suspicious', 'protocol-command-decode', 'string-detect', 'unknown', 'tcp-connection'],
    }

    // useEffect(() => {
    // }, [props.index])

    const initForm = () => {
        let form = { action: "alert", protocol: "tcp", bidirectional: false, s_ip: "", d_ip: "", s_port: "", d_port: "", options: [], metadata: [] }
        if (props.Rule) {
            let ruleBody = props.Rule.Rule.trim()
            if (ruleBody.charAt(0) == '#')
                ruleBody = ruleBody.slice(1).trim()
            let split = ruleBody.split('(')
            let header = split[0]
            let options = split.slice(1).join("(")
            header = header.split(' ').filter(e => e)
            console.log(header)
            form.action = header[0].trim()
            let headerOps = ['s_ip', 's_port', 'bidirectional', 'd_ip', 'd_port']
            if (header.length > 1) {
                let index = 1
                if (formOptions.protocol.includes(header[1])) {
                    form.protocol = header[1]
                    index = 2
                }
                for (let i = 0; i < headerOps.length; i++) {
                    console.log(index + i)
                    if (headerOps[i] == 'bidirectional')
                        form[headerOps[i]] = header[index + i] == '<>'
                    else
                        form[headerOps[i]] = header[index + i]
                }
            }
            console.log(options)
            options = options.slice(0, options.length - 1).trim()
            options = options.split(';').filter(e => ![null, undefined, ""].includes(e))
            if (options.length) {
                for (let o of options) {
                    o = o.split(':', 2)
                    o[0] = o[0].trim()
                    console.log(o)
                    if (o[0] == 'metadata') {
                        for (let m of o[1].split(',')) {
                            console.log(m)
                            split = m.trim().split(' ')
                            let key = split[0]
                            let value = split.slice(1).join(" ")
                            form.metadata.push({ key: key.trim(), value: value.trim() })
                        }
                        continue
                    }
                    form.options.push({ key: o[0], value: o[1] ? o[1].trim() : "" })
                }
            }
            console.log(form)
            // setFormVal(form)
        }
        return form
    }

    useEffect(() => {
        if (!props.add)
            setFormVal(initForm())
    }, [props.index])

    let [formVal, setFormVal] = useState({ action: "alert", protocol: "tcp", bidirectional: false, s_ip: "", d_ip: "", s_port: "", d_port: "", options: [], metadata: [] })
    // const [value, setValue] = useState(options[0]);
    // let [formVal, setFormVal] = useState(initForm())
    let [errorVal, setErrorVal] = useState({})
    let [keys, setKeys] = useState({ options: [], metadata: [] })

    const generateRule = () => {
        console.log(formVal)
        let ruleBody = ""
        if (!props.add && props.Rule.Status == "Disabled")
            ruleBody += "# "
        ruleBody += formVal.action + " "
        ruleBody += formVal.protocol + " "
        if (formVal.s_ip) {
            ruleBody += formVal.s_ip + " " + formVal.s_port + " "
            ruleBody += ((formVal.bidirectional) ? " <> " : " -> ")
            ruleBody += formVal.d_ip + " " + formVal.d_port + " "
        }
        if (formVal.options.length || formVal.metadata.length) {
            ruleBody += "("
            for (let o of formVal.options)
                ruleBody += " " + o.key + (o.value ? ": " : "") + o.value + ";"
            if (formVal.metadata.length) {
                let len = formVal.metadata.length
                ruleBody += " metadata:"
                for (let i = 0; i < len - 1; i++) {
                    let m = formVal.metadata[i]
                    ruleBody += " " + m.key + " " + m.value + ","
                }
                ruleBody += " " + formVal.metadata[len - 1].key + " " + formVal.metadata[len - 1].value + ";"
            }
            ruleBody += " )"
        }
        if (props.add) {
            let newRule = { Status: 'Enabled' }
            let sid = props.sid + 1
            for (let i = 0; i < formVal.options.length; i++) {
                if (formVal.options[i].key == 'sid')
                    sid = formVal.options[i].value
            }
            newRule.Sid = sid
            newRule.Action = formVal.action
            newRule.Rule = ruleBody
            return newRule
        }
        return { ...props.Rule, Action: formVal.action, Rule: ruleBody }
    }

    const validateForm = () => {
        let errors = {}
        let required = ['s_ip', 'd_ip', 's_port', 'd_port']
        let filled = required.filter(e => formVal[e])
        for (let r of required) {
            if (!formVal[r] && filled.length)
                errors[r] = "Fill all four fields or none"
            else if ((r == 's_ip' || r == 'd_ip') && filled.length) {
                if (!formOptions.ip.includes(formVal[r])) {
                    let blocks = formVal[r].split('.')
                    console.log(blocks)
                    if (blocks.length != 4)
                        errors[r] = "Not a Valid IP Address"
                    for (let b of blocks) {
                        if (b == "") {
                            errors[r] = "Not a Valid IP Address"
                            break
                        }
                        b = Number(b)
                        if (isNaN(b) || b < 0 || b > 255) {
                            console.log(r, b)
                            errors[r] = "Not a Valid IP Address"
                            break
                        }
                    }
                }
            }
            // else if (r == 'd_port' || r == 's_port') {
            //     if (!formOptions.port.includes(formVal[r])) {
            //         let port = Number(formVal[r])
            //         if (isNaN(port) || port < 0 || port > 65535)
            //             errors[r] = "Not a Valid Port"
            //     }
            // }
        }
        return errors
    }

    const handleChange = (event) => {
        const { target } = event;
        const { name, value } = target;
        console.log(name, value)
        if (name == 'bidirectional')
            setFormVal({ ...formVal, [name]: target.checked })
        else
            setFormVal({ ...formVal, [name]: value })
    };

    const handleOptionsChange = (newVal, type_str, key_str, index) => {
        let newops = formVal[type_str]
        newops[index] = { ...newops[index], [key_str]: newVal }
        setFormVal({ ...formVal, [type_str]: newops })
    }

    const handleSubmit = () => {
        let errors = validateForm()
        // console.log(errors)
        // console.log(Object.keys(errors).length)
        if (Object.keys(errors).length)
            setErrorVal(errors)
        else {
            props.onFormSubmit({ index: props.index, Rule: generateRule() }, props.add)
            setFormVal({ action: "alert", protocol: "tcp", bidirectional: false, s_ip: "", d_ip: "", s_port: "", d_port: "", options: [], metadata: [] })
            setErrorVal({})
        }
    }

    const handleClose = () => {
        setFormVal({ action: "alert", protocol: "tcp", bidirectional: false, s_ip: "", d_ip: "", s_port: "", d_port: "", options: [], metadata: [] })
        setErrorVal({})
        props.handleClose()
    }

    const addField = (str) => {
        let newops = formVal[str]
        let newkeys = keys[str]
        newops.push({ key: "", value: "" })
        newkeys.push(uuidv())
        setKeys({ ...keys, [str]: newkeys })
        console.log(newops)
        setFormVal({ ...formVal, [str]: newops })
    }

    const removeField = (str, index) => {
        let newops = formVal[str].filter((o, i) => i != index)
        let newkeys = keys[str].filter((o, i) => i != index)
        console.log(newops)
        setKeys({ ...keys, [str]: newkeys })
        setFormVal({ ...formVal, [str]: newops })
    }

    var options = formVal.options.map((o, i) => (
        <ListItem dense={true} key={keys.options[i]}>
            <Autocomplete
                freeSolo
                value={formVal.options[i].key}
                inputValue={formVal.options[i].key}
                onInputChange={(event, newInputValue) => {
                    handleOptionsChange(newInputValue, 'options', 'key', i)
                }}
                onChange={(event, newValue) => handleOptionsChange(newValue ? newValue : "", 'options', 'key', i)}
                options={keyOptions.options}
                renderInput={(params) => (
                    <div className={classes.options}>
                        <TextField {...params} label="Key"
                            name={"option_key_" + i}
                            // value={formVal.options[i].key}
                            // onChange={(e) => handleOptionsChange(e.target.value, 'options', 'key', i)}
                            required
                        />
                    </div>)}
            />
            <Autocomplete
                freeSolo
                disableClearable={true}
                value={formVal.options[i].value}
                inputValue={formVal.options[i].value}
                onInputChange={(event, newInputValue) => {
                    handleOptionsChange(newInputValue, 'options', 'value', i)
                }}
                onChange={(event, newValue) => handleOptionsChange(newValue ? newValue : "", 'options', 'value', i)}
                options={fieldOptions[formVal.options[i].key] ? fieldOptions[formVal.options[i].key] : []}
                renderInput={(params) => (
                    <div className={classes.options}>
                        <TextField {...params} label="Value"
                            name={"option_val_" + i}
                            // value={formVal.options[i].value}
                            // onChange={(e) => handleOptionsChange(e.target.value, 'options', 'value', i)}
                            required
                        />
                    </div>)}
            />
            <IconButton onClick={() => removeField('options', i)}>
                <ClearIcon />
            </IconButton>
        </ListItem>
    ))

    let metadata = formVal.metadata.map((o, i) => (
        <ListItem dense={true} key={keys.metadata[i]}>
            <Autocomplete
                freeSolo
                value={formVal.metadata[i].key}
                inputValue={formVal.metadata[i].key}
                onInputChange={(event, newInputValue) => {
                    handleOptionsChange(newInputValue, 'metadata', 'key', i)
                }}
                onChange={(event, newValue) => handleOptionsChange(newValue ? newValue : "", 'metadata', 'key', i)}
                options={keyOptions.metadata}
                renderInput={(params) => (
                    <div className={classes.options}>
                        <TextField {...params} label="Key"
                            name={"metadata_key_" + i}
                            // value={formVal.metadata[i].key}
                            // onChange={(e) => handleOptionsChange(e.target.value, 'metadata', 'key', i)}
                            required
                        />
                    </div>)}
            />
            <Autocomplete
                freeSolo
                value={formVal.metadata[i].value}
                inputValue={formVal.metadata[i].value}
                onInputChange={(event, newInputValue) => {
                    handleOptionsChange(newInputValue, 'metadata', 'value', i)
                }}
                onChange={(event, newValue) => handleOptionsChange(newValue ? newValue : "", 'metadata', 'value', i)}
                options={fieldOptions[formVal.metadata[i].key] ? fieldOptions[formVal.metadata[i].key] : []}
                renderInput={(params) => (
                    <div className={classes.options}>
                        <TextField {...params} label="Value"
                            name={"metadata_val_" + i}
                            // value={formVal.metadata[i].value}
                            // onChange={(e) => handleOptionsChange(e.target.value, 'metadata', 'value', i)}
                            required
                        />
                    </div>)}
            />
            <IconButton onClick={() => removeField('metadata', i)}>
                <ClearIcon />
            </IconButton>
        </ListItem>
    ))


    return (
        <Dialog open={props.open} onClose={handleClose} aria-labelledby="form-dialog-title" maxWidth={'sm'} fullWidth={true}>
            <DialogTitle id="form-dialog-title">{props.add ? "Add" : "Update"} Rule</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    <Typography variant="subtitle2">Rule Body</Typography>
                </DialogContentText>
                <FormControl className={classes.formControl}>
                    <InputLabel id="action-label">Action</InputLabel>
                    <Select
                        labelId='action-label'
                        name="action"
                        value={formVal.action}
                        onChange={handleChange}
                    >
                        {formOptions.action.map(a => <MenuItem value={a}>{a}</MenuItem>)}
                    </Select>
                </FormControl>
                <FormControl className={classes.formControl}>
                    <InputLabel id="protocol-label">Protocol</InputLabel>
                    <Select
                        labelId='protocol-label'
                        name="action"
                        value={formVal.protocol}
                        onChange={handleChange}
                    >
                        {formOptions.protocol.map(a => <MenuItem value={a}>{a}</MenuItem>)}
                    </Select>
                </FormControl>
                <Autocomplete
                    freeSolo
                    value={formVal.s_ip}
                    onChange={(event, newValue) => { setFormVal({ ...formVal, s_ip: newValue ? newValue : "" }) }}
                    options={formOptions.ip}
                    inputValue={formVal.s_ip}
                    onInputChange={(event, newInputValue) => {
                        setFormVal({ ...formVal, s_ip: newInputValue });
                    }}
                    renderInput={(params) => (
                        <div className={classes.column}>
                            <TextField {...params} label="Source IP" name="s_ip" value={formVal.s_ip} onChange={handleChange} required error={errorVal.s_ip} helperText={errorVal.s_ip} />
                        </div>)}
                />
                <Autocomplete
                    freeSolo
                    value={formVal.d_ip}
                    inputValue={formVal.d_ip}
                    onInputChange={(event, newInputValue) => {
                        setFormVal({ ...formVal, d_ip: newInputValue });
                    }}
                    onChange={(event, newValue) => setFormVal({ ...formVal, d_ip: newValue ? newValue : "" })}
                    options={formOptions.ip}
                    renderInput={(params) => (
                        <div className={classes.column}>
                            <TextField {...params} label="Destination IP" name="d_ip" value={formVal.d_ip} onChange={handleChange} required error={errorVal.d_ip} helperText={errorVal.d_ip} />
                        </div>)}
                />
                <Autocomplete
                    freeSolo
                    value={formVal.s_port}
                    inputValue={formVal.s_port}
                    onInputChange={(event, newInputValue) => {
                        setFormVal({ ...formVal, s_port: newInputValue });
                    }}
                    onChange={(event, newValue) => setFormVal({ ...formVal, s_port: newValue ? newValue : "" })}
                    options={formOptions.port}
                    renderInput={(params) => (
                        <div className={classes.column}>
                            <TextField {...params} label="Source Port" name="s_port" value={formVal.s_port} onChange={handleChange} required error={errorVal.s_port} helperText={errorVal.s_port} />
                        </div>)}
                />
                <Autocomplete
                    freeSolo
                    value={formVal.d_port}
                    inputValue={formVal.d_port}
                    onInputChange={(event, newInputValue) => {
                        setFormVal({ ...formVal, d_port: newInputValue });
                    }}
                    onChange={(event, newValue) => setFormVal({ ...formVal, d_port: newValue ? newValue : "" })}
                    options={formOptions.port}
                    renderInput={(params) => (
                        <div className={classes.column}>
                            <TextField {...params} label="Destination Port" name="d_port" value={formVal.d_port} onChange={handleChange} required error={errorVal.d_port} helperText={errorVal.d_port} />
                        </div>)}
                />
                <FormControlLabel className={classes.formControl}
                    control={<Switch checked={formVal.bidirectional} onChange={handleChange} name="bidirectional" />}
                    label={<Typography>Bi-Directional</Typography>}
                />
                <Typography variant="subtitle2">Options</Typography>
                <List>{options}</List>
                <Box display='flex' justifyContent="flex-end" alignItems="center">
                    <Typography>Add Options</Typography>
                    <IconButton onClick={() => addField('options')}>
                        <AddIcon />
                    </IconButton>
                </Box>
                <Typography variant="subtitle2">Metadata</Typography>
                <List>{metadata}</List>
                <Box display='flex' justifyContent="flex-end" alignItems="center">
                    <Typography>Add Metadata</Typography>
                    <IconButton onClick={() => addField('metadata')}>
                        <AddIcon />
                    </IconButton>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose} color="primary">
                    Cancel
              </Button>
                <Button onClick={handleSubmit} color="primary">
                    {props.add ? "Add" : "Update"}
                </Button>
            </DialogActions>
        </Dialog >
    );
}

export default UpdateRuleForm;