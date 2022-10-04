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
    }
}));

const RuleDisplay = (props) => {
    const classes = useStyles();

    return (<ExpansionPanel defaultExpanded>
        <ExpansionPanelSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel1a-content"
            id="panel1a-header"
            className={props.Rule.Status == 'Enabled' ? classes.enabled : classes.disabled}
        >
            <div className={classes.column}>
                <Typography className={classes.heading}>Sid: {props.Rule.Sid}</Typography>
            </div>
            <div className={clsx(classes.column, classes.helper)}>
                <Typography className={classes.heading}>Status: {props.Rule.Status}</Typography>
            </div>
            <div className={clsx(classes.column, classes.helper)}>
                <Typography className={classes.heading}>Action: {props.Rule.Action}</Typography>
            </div>
        </ExpansionPanelSummary>
        <ExpansionPanelDetails>
            <div style={{ width: '100%' }}>
                <Typography gutterBottom variant="subtitle2" component="h5">
                    Rule Body
                </Typography>
                <Typography variant="body1" color="textSecondary" component="p">
                    {props.Rule.Rule}
                </Typography>
            </div>
        </ExpansionPanelDetails>
        <ExpansionPanelActions>
            {props.Rule.Status == 'Enabled' ? <Button onClick={() => props.disableRule(props.index)}>Disable Rule</Button> : <Button onClick={() => props.enableRule(props.index)}>Enable Rule</Button>}
            {props.isCustom && <Button onClick={() => props.updateRule(props.index)} color="primary">Update Rule</Button>}
            {props.isCustom && <Button onClick={() => props.deleteRule(props.index)} color="secondary">Delete Rule</Button>}
        </ExpansionPanelActions>
    </ExpansionPanel >);
}

export default RuleDisplay;