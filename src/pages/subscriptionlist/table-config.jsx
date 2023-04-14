// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React from 'react';
import { CollectionPreferences, Link ,StatusIndicator,
Badge,SpaceBetween} from '@cloudscape-design/components';
import { addColumnSortLabels } from '../../common/labels';

export const COLUMN_DEFINITIONS = addColumnSortLabels([
  {
    id: 'id',
    sortingField: 'id',
    header: 'ID',
    cell: item => item.id,
    minWidth: 60,
  },
  {
    id: 'db_name',
    sortingField: 'db_name',
    header: 'Database',
    cell: item =>  (
      <Link href={"catalog/databases/"+item.db_name} >{item.db_name}</Link>
    ),
   
  },
  {
    id: 'table_name',
    sortingField: 'table_name',
    header: 'Table',
    cell: item =>(<Link  href={`catalog/databases/${item.db_name}/${item.table_name}`}>{item.table_name}</Link>)||'-',
  
  },
  {
    id: 'created',
    sortingField: 'created',
    header: 'Created',
    cell: item => item.created,

  },
  {
    id: 'requester',
    sortingField: 'consumer',
    header: 'Requester',
    cell: item => item.consumer,
  },
  {
    id: 'producer',
    header: 'Producer',
    sortingField: 'producer',
    cell: item => item.producer,
   
  },
  {
    id: 'consumer',
    sortingField: 'consumer',
    header: 'Consumer',
    cell: item => item.consumer,
  },
  {
    id: 'expiredate',
    sortingField: 'expiredate',
    header: 'Expire date',
    cell: item => item.expiredate,
   
  },
  {
    id: 'completed',
    sortingField: 'completed',
    header: 'Approve completed',
    cell: item => item.completed,
   
  },
  {
    id: 'status',
    sortingField:'status',
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
export const LFTAG_PREFERENCES = {
  pageSize: 30,
  visibleContent: ["type", "resource", "tagkey", "tagvalues", "inherited"],
  wrapLines: false,
};
const DEFAULT_Tags_Filter = 'excl';

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
const VISIBLE_CONTENT_OPTIONS = [
  {
    label: 'Main user properties',
    options: [
      { id: 'id', label: 'ID', editable: false },
      { id: 'type', label: 'Type' },
      { id: 'db_name', label: 'Database' },
      { id: 'requester', label: 'Requester' },
      { id: 'producer', label: 'Producer' },
      { id: 'consumer', label: 'Consumer' },
      { id: 'table_name', label: 'Table' },
      { id: 'created', label: 'Created' },
      { id: 'completed', label: 'Approve completed' },
      { id: 'expiredate', label: 'Expire date' },
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
  visibleContent: ['id','type', 'db_name','table_name',,'requester','producer', 'description','created','expiredate','status'],
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
    key: 'producer',
    groupValuesLabel: 'Producer values',
    operators: [':', '!:', '=', '!='],
  },
  {
    propertyLabel: 'Consumer',
    key: 'consumer',
    groupValuesLabel: 'Consumer values',
    operators: [':', '!:', '=', '!='],
  },
  {
    propertyLabel: 'Status',
    key: 'status',
    groupValuesLabel: 'Status values',
    operators: [':', '!:', '=', '!='],
  },
].sort((a, b) => a.propertyLabel.localeCompare(b.propertyLabel));