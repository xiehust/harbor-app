// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React, { useState } from 'react';
import { Box, Container, Header, PieChart} from '@cloudscape-design/components';
import {formatDate} from '../../commons/utils';


const HealthStats = ()=>{
    const [loadingStatus, setLoading] = useState('finished') //loading or error
    const percentageFormatter = value => `${(value * 100).toFixed(0)}%`;
    const data =[
        { title: "Available",  value: 40 },
        { title: "Unvailable",  value: 25 },
        { title: "Waiting", value: 2 },];
    const totaldata = 67;
    return(
        <Container
        header={
          <Header variant="h2" description={formatDate(new Date())}>
            Data SLA
          </Header>
        }
      >
       <PieChart
        size="medium"
        data={data}
        ariaLabel="data availability"
        ariaDescription="Pie chart summarizing the status of all data availability"
        hideFilter={true}
        segmentDescription={(datum, sum) => `${datum.value} tables, ${percentageFormatter(datum.value / sum)}`}
        detailPopoverContent={(datum, sum) => [
          {
            key: 'Table count',
            value: datum.value,
          },
          {
            key: 'Percentage',
            value: percentageFormatter(datum.value / sum),
          },
        ]}
        variant="donut"
        loadingText="Loading chart"
        errorText="Error loading data."
        recoveryText="Retry"
        statusType = {loadingStatus}
        innerMetricDescription="total tables"
        innerMetricValue={totaldata}
        i18nStrings={{
          filterLabel: 'Filter displayed data',
          filterPlaceholder: 'Filter data',
          filterSelectedAriaLabel: 'selected',
          detailPopoverDismissAriaLabel: 'Dismiss',
          legendAriaLabel: 'Legend',
          chartAriaRoleDescription: 'pie chart',
          segmentAriaRoleDescription: 'segment',
        }}
        onRecoveryClick
        empty={
        <Box textAlign="center" color="inherit">
          <b>No data available</b>
          <Box variant="p" color="inherit">
            There is no data available
          </Box>
        </Box>
      }
      />
      </Container>
    )
}

export default HealthStats;