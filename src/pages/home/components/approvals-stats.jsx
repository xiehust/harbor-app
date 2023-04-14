// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React, { useEffect, useState } from "react";
import {
  Box,
  PieChart,
  Container,
  Header,
  ColumnLayout,
  Button,
  Link,
} from "@cloudscape-design/components";
import { formatDate } from "../../commons/utils";
import {useAuthorizedHeader, useAuthUserInfo} from '../../commons/use-auth';
import {API_getApprovalStats,remotePostCall} from '../../commons/api-gateway';
import {LabelVals} from '../common-components';

const ApprovalStat2 = () => {
  const headers = useAuthorizedHeader();
  const [loading, setLoading] = useState(false);
  const userinfo = useAuthUserInfo();
  const [stats, setData] = useState({});
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    setLoading(true);
    const controller = new AbortController();
    const payload = {groupid:userinfo.groupid,grouptype:userinfo.grouptype};
    remotePostCall(headers, API_getApprovalStats, payload, controller)
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });

    return () => controller.abort();
  }, [retry]);

  return (
    <Container
        header={
          <Header variant="h2" 
            description={formatDate(new Date())}
            actions={<Button variant='icon' iconName='refresh' loading={loading}
            onClick={()=>{
                setRetry(e=>e+1);
            }}
             >Button</Button>}
            >
            Approvals
          </Header>
        }
    >
      <ColumnLayout columns="3" variant="text-grid">
         <LabelVals label={'Sumbitted'} href='/approval-list' value={stats.submitted||'-'}/>
         <LabelVals label={'Approved'} href='/approval-list' value={stats.approved||'-'}/>
         <LabelVals label={'Rejected'} href='/approval-list' value={stats.rejected||'-'}/>
         <LabelVals label={'Revoked'} href='/approval-list' value={stats.revoked||'-'}/>
      </ColumnLayout>
    </Container>
  );
};

const ApprovalStat = ()=>{
  const [loadingStatus, setLoadingStatus] = useState('loading') //loading or error
  const [loading, setLoading] = useState(true);
  const percentageFormatter = value => `${(value * 100).toFixed(0)}%`;
  const [totaldata,setTotal]  = useState(0);
  const headers = useAuthorizedHeader();
  const userinfo = useAuthUserInfo();
  const [stats, setData] = useState([]);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    setLoadingStatus('loading');
    setLoading(true);
    const controller = new AbortController();
    const payload = {groupid:userinfo.groupid,grouptype:userinfo.grouptype};
    remotePostCall(headers, API_getApprovalStats, payload, controller)
      .then((data) => {
       
        setData([{title: 'Sumbitted',value:data.submitted}, 
        {title: 'Approved',value:data.approved}, 
        {title: 'Rejected',value:data.rejected}, 
        {title: 'Revoked',value:data.revoked}, 
          ]);
        setTotal(data.submitted+data.approved+data.rejected+data.revoked);
        setLoadingStatus('finished');
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
      });

    return () => controller.abort();
  }, [retry]);


  return(
      <Container
      header={
        <Header variant="h2" description={formatDate(new Date())}
        actions={<Button variant='icon' iconName='refresh' loading={loading}
            onClick={()=>{
                setRetry(e=>e+1);
            }}
             >Button</Button>}
        >
          Approvals
        </Header>
      }
    >
     <PieChart
      size="medium"
      data={stats}
      ariaLabel="Approvals"
      ariaDescription="Pie chart summarizing the status of all data availability"
      hideFilter={true}
      segmentDescription={(datum, sum) => `${datum.value} approvals, ${percentageFormatter(datum.value / sum)}`}
      detailPopoverContent={(datum, sum) => [
        {
          key: 'Count',
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
      innerMetricDescription="Total approvals"
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


export default ApprovalStat;
