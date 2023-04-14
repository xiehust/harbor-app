// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React, {  useState } from 'react';
import { Grid } from '@cloudscape-design/components';

import OverviewStat from './overview-stats';
import ApprovalStat from './approvals-stats';
import HealthStats from './health-stats';
import SharingFlowAnalysisGraph from './sharingflow';
import {useAuthUserInfo} from '../../commons/use-auth';


const Content=() =>{
    const userInfo = useAuthUserInfo();
    switch(userInfo.grouptype){
        case 'CENTRAL': 
        return (
            <Grid 
            gridDefinition={[
                {colspan:12},
                {colspan:6},
                {colspan:6},
                {colspan:12},
            ]}
            >
            <OverviewStat/>
            <ApprovalStat/>
            <HealthStats/>
            <SharingFlowAnalysisGraph/>
            </Grid>
        )

        case 'CONSUMER':
            return (
                <Grid 
                gridDefinition={[
                    {colspan:12},
                    {colspan:6},
                    {colspan:6},
                ]}
                >
                <OverviewStat isAdmin={false}/>
                <ApprovalStat/>
                <HealthStats/>
                </Grid>
            )
        case 'PRODUCER':
            return (
                <Grid 
                gridDefinition={[
                    {colspan:12},
                    {colspan:6},
                    {colspan:6},
                ]}
                >
                <OverviewStat isAdmin={false}/>
                <ApprovalStat/>
                <HealthStats/>
                </Grid>
            )
        default:
            break;
    }

}

export default Content;