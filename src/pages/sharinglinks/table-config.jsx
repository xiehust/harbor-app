// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React from 'react';
import { CollectionPreferences, Link ,StatusIndicator} from '@cloudscape-design/components';
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
      <Link  href={"catalog/databases/"+item.db_name} >{item.db_name}</Link>
    ),
   
  },
  {
    id: 'table_name',
    sortingField: 'table_name',
    header: 'Table',
    cell: item =>  (
      <Link  href={`catalog/databases/${item.db_name}/${item.table_name}`}>{item.table_name}</Link>),
  },
  {
    id: 'created',
    sortingField: 'created',
    header: 'Created',
    cell: item => item.created,

  },
  {
    id: 'requester',
    sortingField:'consumer',
    header: 'Requester',
    cell: item => item.consumer,
  },
  {
    id: 'producer',
    sortingField:'producer',
    header: 'Producer',
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
    header: 'Status',
    sortingField: 'status',
    cell: item => (
      <StatusIndicator type={
        item.status === 'approved' ? 'success' : (item.status === 'rejected'?'error':'pending')
        }
      >{item.status}
      </StatusIndicator>
    ),

  },
]);


const VISIBLE_CONTENT_OPTIONS = [
  {
    label: 'Main user properties',
    options: [
      { id: 'id', label: 'ID', editable: false },
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
  visibleContent: ['id', 'db_name','table_name',,'requester','producer', 'description','created','expiredate','status'],
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

