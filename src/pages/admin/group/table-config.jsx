// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React from 'react';
import { CollectionPreferences, Link ,StatusIndicator} from '@cloudscape-design/components';
import { addColumnSortLabels } from '../../../common/labels';

export const COLUMN_DEFINITIONS = addColumnSortLabels([
  {
    id: 'id',
    sortingField: 'id',
    header: 'ID',
    cell: item => item.id,
    minWidth: 60,
  },
  {
    id: 'groupname',
    sortingField: 'groupname',
    cell: item =>(
    <div>
      <Link href={"group/"+item.groupname}>{item.groupname}</Link>
    </div>
    ),
    header: 'Group Name',
    minWidth: 100,
  },
  {
    id: 'grouptype',
    sortingField: 'grouptype',
    header: 'Type',
    cell: item => item.grouptype,
    minWidth: 100,
  },
  {
    id: 'awsid',
    sortingField: 'awsid',
    header: 'AWS ID',
    cell: item => item.awsid,
    minWidth: 100,
  },
  {
    id: 'lastupdated',
    sortingField: 'lastupdated',
    header: 'Last updated',
    cell: item => item.lastupdated,
    minWidth: 200,
  },
  {
    id: 'status',
    sortingField: 'status',
    header: 'Status',
    cell: item => (
      <StatusIndicator type={item.status === 'Inactive' ? 'stopped' : 'success'}>{item.status}</StatusIndicator>
    ),
    minWidth: 100,
  },
]);

const VISIBLE_CONTENT_OPTIONS = [
  {
    label: 'Main user properties',
    options: [
      { id: 'id', label: 'ID', editable: false },
      { id: 'groupname', label: 'Group name' },
      { id: 'grouptype', label: 'Type' },
      { id: 'awsid', label: 'AWS ID' },
      { id: 'lastupdated', label: 'Last updated' },
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
  visibleContent: ['id','awsid', 'groupname', 'grouptype', 'lastupdated','status'],
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
