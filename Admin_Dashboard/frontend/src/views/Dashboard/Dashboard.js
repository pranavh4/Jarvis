import React from "react";
// react plugin for creating charts
import ChartistGraph from "react-chartist";
// @material-ui/core
import { makeStyles } from "@material-ui/core/styles";
import Icon from "@material-ui/core/Icon";
// @material-ui/icons
import Store from "@material-ui/icons/Store";
import Warning from "@material-ui/icons/Warning";
import DateRange from "@material-ui/icons/DateRange";
import LocalOffer from "@material-ui/icons/LocalOffer";
import Update from "@material-ui/icons/Update";
import ArrowUpward from "@material-ui/icons/ArrowUpward";
import AccessTime from "@material-ui/icons/AccessTime";
import Accessibility from "@material-ui/icons/Accessibility";
import BugReport from "@material-ui/icons/BugReport";
import Code from "@material-ui/icons/Code";
import Cloud from "@material-ui/icons/Cloud";
// core components
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Table from "components/Table/Table.js";
import Tasks from "components/Tasks/Tasks.js";
import CustomTabs from "components/CustomTabs/CustomTabs.js";
import Danger from "components/Typography/Danger.js";
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardIcon from "components/Card/CardIcon.js";
import CardBody from "components/Card/CardBody.js";
import CardFooter from "components/Card/CardFooter.js";
import Button from "@material-ui/core/Button"

import { bugs, website, server } from "variables/general.js";

import {
  dailySalesChart,
  emailsSubscriptionChart,
  completedTasksChart
} from "variables/charts.js";

import styles from "assets/jss/material-dashboard-react/views/dashboardStyle.js";

const useStyles = makeStyles(styles);

// const dailySalesChart = {
//   data: {
//     labels: ["M", "T", "W", "T", "F", "S", "S"],
//     series: [[12, 17, 7, 17, 23, 18, 38]]
//   },
//   options: {
//     lineSmooth: Chartist.Interpolation.cardinal({
//       tension: 0
//     }),
//     low: 0,
//     high: 50, // creative tim: we recommend you to set the high sa the biggest value + something for a better look
//     chartPadding: {
//       top: 0,
//       right: 0,
//       bottom: 0,
//       left: 0
//     }
//   }

export default function Dashboard() {
  const classes = useStyles();

  let [val, setVal] = React.useState({ Sites: [], Labels: [], Traffic: [] })

  React.useEffect(() => {
    fetch('/api/getDashboardData').then(res => res.json()).then(res => {
      console.log(res)
      setVal(res)
      console.log({ labels: res.Labels, series: [res.Traffic] })
    })
  }, [])

  return (
    <div>
      <GridContainer>
        <GridItem xs={12} sm={6} md={3}>
          <Card>
            <CardHeader color="success" stats icon>
              <CardIcon color="success">
                <Button>
                  <Icon>power_settings_new</Icon>
                </Button>
              </CardIcon>
              <p className={classes.cardCategory}>Snort</p>
              <h3 className={classes.cardTitle}>
                Start Snort
              </h3>
            </CardHeader>
            <CardFooter stats>
              {/* <div className={classes.stats}>
                <Danger>
                  <Warning />
                </Danger>
                <a href="#pablo" onClick={e => e.preventDefault()}>
                  Get more space
                </a>
              </div> */}
            </CardFooter>
          </Card>
        </GridItem>
        <GridItem xs={12} sm={6} md={3}>
          <Card>
            <CardHeader color="success" stats icon>
              <CardIcon color="success">
                {/* <Store /> */}
                <Icon>list</Icon>
              </CardIcon>
              <p className={classes.cardCategory}>Custom Rules</p>
              <h3 className={classes.cardTitle}>{val.rules}</h3>
            </CardHeader>
            <CardFooter stats>
              {/* <div className={classes.stats}>
                <DateRange />
                Last 24 Hours
              </div> */}
            </CardFooter>
          </Card>
        </GridItem>
        <GridItem xs={12} sm={6} md={3}>
          <Card>
            <CardHeader color="danger" stats icon>
              <CardIcon color="danger">
                <Icon>info_outline</Icon>
              </CardIcon>
              <p className={classes.cardCategory}>Alerts</p>
              <h3 className={classes.cardTitle}>{val.alerts}</h3>
            </CardHeader>
            <CardFooter stats>
              {/* <div className={classes.stats}>
                <DateRange />
                Last 5 mins
              </div> */}
            </CardFooter>
          </Card>
        </GridItem>
        <GridItem xs={12} sm={6} md={3}>
          <Card>
            <CardHeader color="info" stats icon>
              <CardIcon color="info">
                <Accessibility />
              </CardIcon>
              <p className={classes.cardCategory}>Connected Devices</p>
              <h3 className={classes.cardTitle}>2</h3>
            </CardHeader>
            <CardFooter stats>
              {/* <div className={classes.stats}>
                <Update />
                Just Updated
              </div> */}
            </CardFooter>
          </Card>
        </GridItem>
      </GridContainer>
      <GridContainer>
        <GridItem xs={12} sm={12} md={6}>
          <Card chart>
            <CardHeader color="success">
              <ChartistGraph
                className="ct-chart"
                data={{ labels: [], series: [val.Traffic] }}
                type="Line"
                options={{ ...dailySalesChart.options, high: 1500, height: '300px' }}
                listener={dailySalesChart.animation}
              />
            </CardHeader>
            <CardBody>
              <h4 className={classes.cardTitle}>Traffic Details</h4>
              <p className={classes.cardCategory}>
                <span className={classes.successText}>
                  <ArrowUpward className={classes.upArrowCardCategory} /> Number of packets transmitted recently
                </span>
              </p>
            </CardBody>
            <CardFooter chart>
              <div className={classes.stats}>
                <AccessTime /> updated just now
              </div>
            </CardFooter>
          </Card>
        </GridItem>
        <GridItem xs={12} sm={12} md={6}>
          <Card>
            <CardHeader color="warning">
              <h4 className={classes.cardTitleWhite}>Websites</h4>
              <p className={classes.cardCategoryWhite}>
                Recently visited websites
              </p>
            </CardHeader>
            <CardBody>
              <Table
                style={{ height: "200px" }}
                tableHeaderColor="warning"
                tableHead={["Url", "Time"]}
                tableData={val.Sites.map(s => [s.Site, new Date(s.time * 1000).toLocaleString()])}
              />
            </CardBody>
          </Card>
        </GridItem>
      </GridContainer>
    </div>
  );
}
