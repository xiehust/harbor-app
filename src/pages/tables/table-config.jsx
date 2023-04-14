// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React from 'react';
import { CollectionPreferences, StatusIndicator, Link,SpaceBetween,Badge } from '@cloudscape-design/components';
import { addColumnSortLabels } from '../../common/labels';

export const Sharing_Column_Definitions = [
  {
    id: "principalid",
    header: "AWS Principal ID",
    cell: item => item.principalId || "-",
    sortingField: "principalid",
  },
  {
    id: "groupname",
    header: "Group name",
    cell: item => item.groupname || "-",
    sortingField: "subscribed",
  },
  {
    id: "grouptype",
    header: "Group type",
    cell: item => item.grouptype || "-",
    sortingField: "grouptype",
  },
  {
    id: "permissions",
    header: "Permissions",
    cell: item => item.permissions.join(',') || "-",
  },
  {
    id: "grant_permissions",
    header: "Grantable Permissions",
    cell: item => item.grant_permissions.join(',') || "-",
  },
]

export const Sharing_DEFAULT_PREFERENCES = {
  pageSize: 30,
  visibleContent: ['principalid','groupname', 'grouptype', 'permissions',],
  wrapLines: false,
};

export const LFTAG_COLUMN_DEFINITIONS = addColumnSortLabels([
  {id:"sn",
  header:"#",
  cell:item=>item.sn,
 },
  {
    id: 'resource',
    sortingField: 'resource',
    header: 'Resource',
    cell: item => item.resource,
  },
  {
    id: 'tagkey',
    sortingField: 'tagkey',
    header: 'Key',
    cell: item => item.TagKey,
  },
  {
    id: 'tagvalues',
    sortingField: 'tagvalues',
    header: 'Values',
    cell: item =>     ( <SpaceBetween direction='horizontal' size='xs'>
      {item.TagValues.map(val => <Badge color='blue' key={val} >{val}</Badge>)}
      </SpaceBetween>),
  },
  // {
  //   id: 'inherited',
  //   header: 'Inherited from',
  //   cell: item => item.inherited,
  // },
]);


export const schemaColumnDefinitions = [
  {id:"sn",
  header:"#",
  cell:e=>e.sn,
  minWidth: 50,
   },
  {id:"column",
  header:"Column name",
  cell:e=>e.column,
  sortingField:"column" },
  {id:"dtype",
  header:"Data type",
  cell:e=>e.dtype,
  sortingField:"dtype" },
  {id:"pkey",
  header:"Partition key",
  cell:e=>e.pkey||'-',
  sortingField:"pkey" },
  {id:"comment",
  header:"Comment",
  cell:e=>e.comment||'-',
  sortingField:"comment" },
  {id:"lftags",
  header:"LF-Tags",
  cell:e=>e.lftags||'-',
  sortingField:"lftags" },
];

export const COLUMN_DEFINITIONS = addColumnSortLabels([
  {
    id: 'id',
    sortingField: 'id',
    header: 'ID',
    cell: item => item.id,
  },
  {
    id: "table_name",
    header: "Table",
    cell: item => (<div><Link href={'/catalog/databases/'+item.db_name+'/'+item.table_name}>{item.table_name}</Link></div>),
    
    sortingField: "table_name",
  },
  {
    id: 'db_name',
    sortingField: 'db_name',
    header: 'Database',
    cell: item => (
      <div>
        <Link href={"/catalog/databases/"+item.db_name}>{item.db_name}</Link>
      </div>
    ),
  },
  {
    id: 'producer',
    sortingField: 'groupname',
    header: 'Producer',
    cell: item => (
      item.groupname
    ),
  },
  {
    id: 'awsid',
    sortingField: 'awsid',
    cell: item => item.awsid,
    header: 'AWS ID',
  },
  {
    id: 'description',
    sortingField: 'description',
    header: 'Description',
    cell: item => item.description,
  },
  // {
  //   id: 'tftags',
  //   sortingField: 'tftags',
  //   header: 'TF-Tags',
  //   cell: item => item.tftags,
  //   minWidth: 120,
  // },
  {
    id: 'category1',
    sortingField: 'category1',
    header: 'Category 1',
    cell: item => item.category1_id,
  },
  {
    id: 'category2',
    sortingField: 'category2',
    header: 'Category 2',
    cell: item => item.category1_id,
  },
  {
    id: 'created',
    sortingField: 'created',
    header: 'Created',
    cell: item => item.created,
  },
  {
    id: 'lastupdated',
    sortingField: 'lastupdated',
    header: 'Last updated',
    cell: item => item.lastupdated,
  },
  {
    id: 'status',
    sortingField: 'status',
    header: 'Status',
    cell: item => (<StatusIndicator type={
      item.status === 'active' ? 'success' : (item.status === 'inactive'?'error':'pending')
      }
    >{item.status}
    </StatusIndicator>),
  },
]);

const VISIBLE_CONTENT_OPTIONS = [
  {
    label: 'Main Tables properties',
    options: [
      { id: 'id', label: 'ID' },
      { id: 'table_name', label: 'Table Name', editable: false },
      { id: 'db_name', label: 'Database' },
      { id: 'producer', label: 'Producer' },
      { id: 'awsid', label: 'AWS Account ID' },
      { id: 'category', label: 'Category' },
      { id: 'discription', label: 'Desc' },
      { id: 'lastupdated', label: 'Last updated' },
      { id: 'created', label: 'Created' },
      { id: 'status', label: 'Status' },
    ],
  },
];

export const PAGE_SIZE_OPTIONS = [
  { value: 10, label: '10 Distributions' },
  { value: 30, label: '30 Distributions' },
  { value: 50, label: '50 Distributions' },
];

export const DEFAULT_PREFERENCES = {
  pageSize: 30,
  visibleContent: ['table_name', 'db_name','producer','status', 'awsid', 'discription', 'tables', 'created','lastupdated'],
  wrapLines: false,
};

export const LFTAG_PREFERENCES = {
  pageSize: 30,
  visibleContent: ['sn','resource', 'tagkey','tagvalues','inherited'],
  wrapLines: false,
};

export const Schema_PREFERENCES = {
  pageSize: 30,
  visibleContent: ['sn', 'column','dtype','pkey','comment','lftags'],
  wrapLines: false,
};



export const Preferences = ({
  preferences,
  setPreferences,
  disabled,
  pageSizeOptions = PAGE_SIZE_OPTIONS,
  visibleContentOptions = VISIBLE_CONTENT_OPTIONS,
}) => (
  <CollectionPreferences
    title="Preferences"
    confirmLabel="Confirm"
    cancelLabel="Cancel"
    disabled={disabled}
    preferences={preferences}
    onConfirm={({ detail }) => setPreferences(detail)}
    pageSizePreference={{
      title: 'Page size',
      options: pageSizeOptions,
    }}
    wrapLinesPreference={{
      label: 'Wrap lines',
      description: 'Check to see all the text and wrap the lines',
    }}
    visibleContentPreference={{
      title: 'Select visible columns',
      options: visibleContentOptions,
    }}
  />
);


export const FILTERING_PROPERTIES = [
  {
    propertyLabel: 'Table',
    key: 'table_name',
    groupValuesLabel: 'Table values',
    operators: [':', '!:', '=', '!='],
  },
  {
    propertyLabel: 'Database name',
    key: 'db_name',
    groupValuesLabel: 'Database values',
    operators: [':', '!:', '=', '!='],
  },
  {
    propertyLabel: 'Producer',
    key: 'groupname',
    groupValuesLabel: 'Producer values',
    operators: [':', '!:', '=', '!='],
  },
  {
    propertyLabel: 'AWS ID',
    key: 'awsid',
    groupValuesLabel: 'AWS ID values',
    operators: [':', '!:', '=', '!='],
  },
  {
    propertyLabel: 'Status',
    key: 'status',
    groupValuesLabel: 'Status values',
    operators: [':', '!:', '=', '!='],
  },
].sort((a, b) => a.propertyLabel.localeCompare(b.propertyLabel));