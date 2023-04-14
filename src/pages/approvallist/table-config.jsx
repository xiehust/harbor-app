// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React from 'react';
import { CollectionPreferences,Badge,SpaceBetween, Link ,StatusIndicator} from '@cloudscape-design/components';
import { addColumnSortLabels } from '../../common/labels';

// export const API_NAME = 'getapprovals';
export const COLUMN_DEFINITIONS = addColumnSortLabels([
  {
    id: 'id',
    sortingField: 'id',
    header: 'ID',
    cell: item => item.id,
    minWidth: 60,
  },
  {
    id: 'type',
    sortingField: 'type',
    cell: item =>item.type,
    header: 'Type',

  },
  {
    id: 'db_name',
    sortingField: 'db_name',
    header: 'Database',
    cell: item =>  (
      (item.status === 'approved' || item.type === 'subscribe')?<Link href={"catalog/databases/"+item.db_name} >{item.db_name}</Link>:
      item.database
    ),
   
  },
  {
    id: 'table_name',
    sortingField: 'table_name',
    header: 'Table',
    cell: item =>(item.type === 'subscribe'?<Link   href={`catalog/databases/${item.db_name}/${item.table_name}`}>{item.table_name}</Link>:item.table_name)||'-',

  },
  {
    id: 'created',
    sortingField: 'created',
    header: 'Created',
    cell: item => item.created,

  },
  {
    id: 'requester',
    sortingField: 'groupname',
    header: 'Requester',
    cell: item => item.groupname,
  },
  // {
  //   id: 'producer',
  //   sortingField: 'producer',
  //   header: 'Producer',
  //   cell: item => item.producer,
  // },
  // {
  //   id: 'consumer',
  //   sortingField: 'consumer',
  //   header: 'Consumer',
  //   cell: item => item.consumer,

  // },
  {
    id: 'description',
    header: 'Description',
    cell: item => item.description,
   
  },
  {
    id: 'completed',
    sortingField: 'completed',
    header: 'Completed',
    cell: item => item.completed,
   
  },
  {
    id: 'status',
    sortingField: 'status',
    header: 'Status',
    cell: item => (
      <StatusIndicator type={
        item.status === 'approved' ? 'success' : (item.status === 'rejected'?'error':'pending')
        }
      >{item.status}
      </StatusIndicator>
    ),

  },
]);

export const DEMO_CATEGORY=[ { 
label:"online store",
options:[ 
  { label:"orders",
    value:"1", },
  { label:"shipments",
    value:"2",},
  { label:"items",
    value:"3",},
    { label:"customer service",
    value:"4",}
  ] 
},
{ 
  label:"app",
  options:[ 
    { label:"users",
      value:"10", },
    { label:"user profile",
      value:"11",},
    { label:"user analysis",
      value:"12",}
    ] 
  },
]

const VISIBLE_CONTENT_OPTIONS = [
  {
    label: 'Main user properties',
    options: [
      { id: 'id', label: 'ID', editable: false },
      { id: 'type', label: 'Type' },
      { id: 'db_name', label: 'Database' },
      { id: 'requester', label: 'Requester' },
      // { id: 'producer', label: 'Producer' },
      { id: 'description', label: 'Description' },
      { id: 'table_name', label: 'Table' },
      { id: 'created', label: 'Created' },
      { id: 'completed', label: 'Completed' },
      { id: 'status', label: 'Status' }
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
  visibleContent: ['id','type', 'db_name','requester', 'description','created','completed','status'],
  wrapLines: false,
};

export const LFTAG_PREFERENCES = {
  pageSize: 30,
  visibleContent: ["type", "resource", "tagkey", "tagvalues", "inherited"],
  wrapLines: false,
};

export const DEFAULT_Tags_Filter = "excl";
export const LFTAG_VISIBLE_OPTIONS =  [
  {
    label: 'Column properties',
    options: [
      { id: 'type', label: 'Type' },
      { id: 'resource', label: 'Resource', },
      { id: 'tagkey', label: 'Key' },
      { id: 'tagvalues', label: 'Values' },
    ],
  },
];

export const LFTAG_COLUMN_DEFINITIONS = [
  // { id: "sn", header: "#", cell: (item) => item.sn, minWidth: 50 },
  {
    id: "type",
    header: "Type",
    cell: item => {
      return item.type === DEFAULT_Tags_Filter?"Exclude":
      "Include";
    },
  },
  {
    id: "resource",
    sortingField: "resource",
    header: "Resource",
    cell: (item) => item.resource,
  },
  {
    id: "tagkey",
    sortingField: "tagkey",
    header: "Key",
    cell: (item) => (
      <Badge color={item.TagKey === "PII" ? "red" : "green"}>
        {item.TagKey}
      </Badge>
    ),
  },
  {
    id: "tagvalues",
    sortingField: "tagvalues",
    header: "Values",
    cell: (item) => (
      <SpaceBetween direction="horizontal" size="xs">
        {item.TagValues.map((val) => (
          <Badge color="blue" key={val}>
            {val}
          </Badge>
        ))}
      </SpaceBetween>
    ),
  },
];


export const COL_PREFERENCES =[{
  pageSize: 5,
  visibleContent: ["table", "col", "type", "filtertype"],
  wrapLines: false,
}];

export  const COL_VISIBLE_OPTIONS = [
  {
    label: 'Column properties',
    options: [
      { id: 'table', label: 'Table' },
      { id: 'col', label: 'Column', },
      { id: 'type', label: 'Type' },
      { id: 'filtertype', label: 'Column Filter' },
    ],
  },
]


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
    propertyLabel: 'Database name',
    key: 'db_name',
    groupValuesLabel: 'Database values',
    operators: [':', '!:', '=', '!='],
  },
  {
    propertyLabel: 'Table name',
    key: 'table_name',
    groupValuesLabel: 'Table values',
    operators: [':', '!:', '=', '!='],
  },
  {
    propertyLabel: 'Requester',
    key: 'groupname',
    groupValuesLabel: 'Requester values',
    operators: [':', '!:', '=', '!='],
  },
  {
    propertyLabel: 'Status',
    key: 'status',
    groupValuesLabel: 'Status values',
    operators: [':', '!:', '=', '!='],
  },
].sort((a, b) => a.propertyLabel.localeCompare(b.propertyLabel));