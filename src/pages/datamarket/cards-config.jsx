// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React from 'react';
import { Link, StatusIndicator, Badge, SpaceBetween, Button ,Box} from '@cloudscape-design/components';

export const CARD_DEFINITIONS = {
  header: item => (
    <div>
      <Link fontSize="heading-m"  href={'/catalog/database/'+item.db_name+'/'+item.table_name}>
        {item.table_name}
      </Link>
    </div>
  ),
  sections: [
    {
      id: 'db_name',
      header: 'Database',
      content: item => (
        <div>
          <Link href={"/catalog/database/"+item.db_name}>{item.db_name}</Link>
        </div>
      ),
    },
    {
      id: 'producer',
      header: 'Producer',
      content: item => (
        item.groupname+" (awsid:"+item.awsid+")"
      ),
    },
    // {
    //   id: 'subscribed',
    //   header: 'Subscribed',
    //   content: item =>  (<StatusIndicator type={
    //     item.status === 'yes' ? 'success' : 'pending'
    //     }
    //   >{item.isSubed}
    //   </StatusIndicator>),
    // },
    {
      id: 'status',
      header: 'Status',
      content: item =>  (<StatusIndicator type={
        item.status === 'active' ? 'success' : 'pending'
        }
      >{item.status}
      </StatusIndicator>),
    },
    {
      id: 'description',
      header: 'Description',
      content: item => item.description||"-",
    },
    {
      id: 'lastupdated',
      header: 'Last updated',
      content: item => item.lastupdated,
    },
    {
      id: 'lftags',
      header: 'Tags',
      content: item => ( 
        <SpaceBetween direction='horizontal' size='xs'>
              <Badge color='green'>PII</Badge>
              <Badge color='blue'>Confidential</Badge>
        </SpaceBetween>
      ),
    },
    {
      id: 'buttonurl',
      content: item => (
        <Box float="right"> <Button disabled={item.status === 'subscribed'} href={'datamarket/'+item.id}>Subscribe</Button></Box>
      ),
    },
  ],
};

export const VISIBLE_CONTENT_OPTIONS = [
  {
    label: 'Main properties',
    options: [
      { id: 'db_name', label: 'Database name' },
      { id: 'lastupdated', label: 'Last updated' },
      { id: 'producer', label: 'Producer' },
      { id: 'description', label: 'Description' },
      { id: 'lftags', label: 'Classification' },
      { id: 'buttonurl', label: 'Button' },
      { id: 'status', label: 'Status' },
      { id: 'subscribed', label: 'Subscribed Status' },
    ],
  },
];

export const CARD_CONFIG = [
    {cards: 3}
];

export const PAGE_SIZE_OPTIONS = [
  { value: 10, label: '10 Distributions' },
  { value: 30, label: '30 Distributions' },
  { value: 50, label: '50 Distributions' },
];

export const DEFAULT_PREFERENCES = {
  pageSize: 30,
  visibleContent: ['db_name', 'producer', 'lastupdated', 'description', 'status', 'subscribed','cltags', 'buttonurl'],
};
