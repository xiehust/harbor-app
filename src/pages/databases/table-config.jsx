// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React from 'react';
import { CollectionPreferences, StatusIndicator, Link } from '@cloudscape-design/components';
import { addColumnSortLabels } from '../../common/labels';

export const API_NAME = 'listdatabases';
export const consumerColumnDefinitions = [
  {
    id: "sn",
    header: "#",
    cell: item => item.sn || "-",
    sortingField: "sn",
    minWidth: 80,
  },
  {
    id: "name",
    header: "Name",
    cell: item => item.name || "-",
    sortingField: "name",
    minWidth: 180,
  },
  {
    id: "awsid",
    header: "AWS ID",
    cell: item => item.awsid || "-",
    sortingField: "awsid",
    minWidth: 180,
  },
  {
    id: "subscribed",
    header: "Subscribed",
    cell: item => item.subscribed || "-",
    sortingField: "subscribed",
    minWidth: 180,
  },
]

export const CONSUMER_DEFAULT_PREFERENCES = {
  pageSize: 30,
  visibleContent: ['sn','name', 'awsid', 'subscribed'],
  wrapLines: false,
};


export const tablelistColumnDefinitions = [
  {
    id: "sn",
    header: "#",
    cell: item => item.sn || "-",
    sortingField: "sn",
    minWidth: 80,
  },
  {
    id: "name",
    header: "Name",
    cell: item => (<div><Link href={'/catalog/databases/'+item.db_name+'/'+item.name}>{item.name}</Link></div>),
    sortingField: "name",
    minWidth: 180,
  },
  {
    id: "format",
    header: "Data format",
    cell: item => item.format || "-",
    sortingField: "format",
    minWidth: 80,
  },
  {
    id: "catelogid",
    header: "CatalogId",
    cell: item => item.catalogid || "-",
    sortingField: "catelogid",
    minWidth: 120,
  },
  {
    id: "updated",
    header: "Updated",
    cell: item => item.updated || "-",
    sortingField: "updated",
    minWidth: 200,
  },
];

export const TABLES_DEFAULT_PREFERENCES = {
  pageSize: 30,
  visibleContent: ['sn','name', 'format', 'catelogid', 'updated'],
  wrapLines: false,
};


export const COLUMN_DEFINITIONS = addColumnSortLabels([
  {
    id: 'id',
    sortingField: 'id',
    header: 'ID',
    cell: item => item.id,
    minWidth: 80,
  },
  {
    id: 'db_name',
    sortingField: 'db_name',
    header: 'Name',
    cell: item => (
      <div>
        <Link href={"/catalog/databases/"+item.db_name}>{item.db_name}</Link>
      </div>
    ),
    minWidth: 180,
  },
  {
    id: 'producer',
    sortingField: 'groupname',
    header: 'Producer',
    cell: item => (
      item.groupname
    ),
    minWidth: 160,
  },
  {
    id: 'awsid',
    sortingField: 'awsid',
    cell: item => item.awsid,
    header: 'AWS ID',
    minWidth: 120,
  },
  {
    id: 'description',
    sortingField: 'description',
    header: 'Description',
    cell: item => item.description,
    minWidth: 100,
  },
  {
    id: 'tables',
    sortingField: 'tables',
    header: 'Tables',
    cell: item => item.tables,
    minWidth: 50,
  },
  {
    id: 'category1',
    sortingField: 'category1',
    header: 'Category 1',
    cell: item => item.category1_id,
    minWidth: 50,
  },
  {
    id: 'category2',
    sortingField: 'category2',
    header: 'Category 2',
    cell: item => item.category1_id,
    minWidth: 50,
  },
  {
    id: 'created',
    sortingField: 'created',
    header: 'Created',
    cell: item => item.created,
    minWidth: 160,
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
    minWidth: 100,
  },
]);

const VISIBLE_CONTENT_OPTIONS = [
  {
    label: 'Main Databases properties',
    options: [
      { id: 'id', label: 'ID', },
      { id: 'db_name', label: 'Name' },
      { id: 'producer', label: 'Producer' },
      { id: 'awsid', label: 'AWS Account ID' },
      { id: 'category', label: 'Category' },
      { id: 'discription', label: 'Desc' },
      { id: 'tables', label: 'Tables' },
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
  visibleContent: ['db_name', 'producer', 'awsid', 'discription', 'tables', 'created'],
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