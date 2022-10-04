import React, { useState, useEffect } from 'react';
import { Typography, Button } from '@material-ui/core';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpansionPanelActions from '@material-ui/core/ExpansionPanelActions';
import { purple, red, green } from '@material-ui/core/colors';
import { makeStyles } from '@material-ui/core/styles'
import clsx from 'clsx';


const useStyles = makeStyles((theme) => ({
    column: {
        flexBasis: '33.33%',
        padding: theme.spacing(1, 2)
    },
    helper: {
        borderLeft: `2px solid ${theme.palette.divider}`,
    },
    enabled: {
        backgroundColor: green[100]
    },
    disabled: {
        backgroundColor: red[100]
    }
}));

const AlertDisplay = (props) => {
    const classes = useStyles();

    return (<ExpansionPanel defaultExpanded>
        <ExpansionPanelSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
            className={props.Alert.Snort ? classes.enabled : classes.disabled}
        >
            <div className={classes.column}>
                <Typography className={classes.heading}>Source IP: {props.Alert.Src}</Typography>
            </div>
            <div className={clsx(classes.column, classes.helper)}>
                <Typography className={classes.heading}>Destination IP: {props.Alert.Dst}</Typography>
            </div>
            {/* <div className={clsx(classes.column, classes.helper)}>
                <Typography className={classes.heading}>Source Port: {props.Alert.SrcPort}</Typography>
            </div>
            <div className={clsx(classes.column, classes.helper)}>
                <Typography className={classes.heading}>Destination Port: {props.Alert.DstPort}</Typography>
            </div> */}
            <div className={clsx(classes.column, classes.helper)}>
                <Typography className={classes.heading}>Attack Type: {props.Alert.Detected}</Typography>
            </div>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
            <div style={{ width: '100%' }}>
                <Typography gutterBottom variant="subtitle2" component="h5">
                    {props.Alert.Snort ? "Snort Detected the Following Attack. No actions need to be taken" : "Suggested Action"}
                </Typography>
                <Typography variant="body1" color="textSecondary" component="p">
                    {props.Alert.Rule}
                </Typography>
            </div>
        </ExpansionPanelDetails>
        <ExpansionPanelActions>
            {!props.Alert.Snort && <Button onClick={() => props.addAlertSol(props.index)}>Add Rule</Button>}
            {!props.Alert.Snort && <Button color="secondary" onClick={() => props.deleteAlert([props.index])}>Remove Alert</Button>}
        </ExpansionPanelActions>
    </ExpansionPanel >);
}

export default AlertDisplay;