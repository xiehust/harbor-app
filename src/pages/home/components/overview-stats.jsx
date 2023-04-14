// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React, { useEffect, useState } from 'react';
import { Box, Container, Header, ColumnLayout, Button} from '@cloudscape-design/components';
import {formatDate} from '../../commons/utils';
import {useAuthorizedHeader, useAuthUserInfo} from '../../commons/use-auth';
import {API_getOverviewStats,API_listlftags,remotePostCall} from '../../commons/api-gateway';
import {LabelVals} from '../common-components';


const OverviewStat = ({isAdmin=true})=>{
    const headers = useAuthorizedHeader();
    const {grouptype,groupid} = useAuthUserInfo();
    const [loading, setLoading] = useState(false);
    const [stats, setData] = useState({});
    const [retry, setRetry] = useState(0);
    const [lftagscnt, setTagsCnt] = useState();
    useEffect(()=>{
        setLoading(true);
        const controller = new AbortController();
        const payload ={grouptype:grouptype,groupid:groupid};
        remotePostCall(headers,API_getOverviewStats,payload,controller)
        .then(data =>{
            setData(data);
            setLoading(false);
        })
        .catch(err =>{
            setLoading(false);
            console.error(err);
        });

        return ()=>controller.abort();
    },
    [retry]);

    useEffect(() => {
      let controller = new AbortController();
      const fetchData = async() =>{
        const payload = {};
        try {
          const data = await remotePostCall(headers, API_listlftags, payload,controller);
          setTagsCnt(data.length);
          // setLoading(false);
        }catch(err){
          console.log(err);
        }
      }
      fetchData();
      return () => {
        controller.abort();
      };
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
            Overview statistics
          </Header>
        }
      >
        <ColumnLayout columns="4" variant="text-grid">
          <LabelVals label={'Total Databases'} href='/catalog/databases'  value={stats.total_databases||'-'}/>
          <LabelVals label={'Total Tables'} href='/catalog/tables'  value={stats.total_tables||'-'}/>
          <LabelVals label={'Total Data Locations'} href='/catalog/databases'  value={stats.total_locations||'-'}/>
          {isAdmin&&<LabelVals label={'Total Sharing Links'} href='/catalog/sharinglinks'  value={stats.total_sharinglinks||'-'}/>}
          {isAdmin&&<LabelVals label={'Total Consumers'} href='/admin/user'  value={stats.total_consumers||'-'}/>}
          {isAdmin&&<LabelVals label={'Total Producers'} href='/admin/user'  value={stats.total_producers||'-'}/>}
          <LabelVals label={'Total LF-Tags'} href='/catalog/lftags'  value={lftagscnt||'-'}/>
          {isAdmin&&<LabelVals label={'Total users groups'} href='/admin/group'  value={stats.total_groups||'-'}/>}
          {!isAdmin&&<LabelVals label={'Total Subscriptions'} href='/subscription-list'  value={stats.total_sharinglinks||'-'}/>}

        </ColumnLayout>
      </Container>
    );
}

export default OverviewStat;