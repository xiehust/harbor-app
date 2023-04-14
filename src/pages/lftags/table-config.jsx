// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React from 'react';
import { CollectionPreferences, Badge,SpaceBetween} from '@cloudscape-design/components';
import { addColumnSortLabels } from '../../common/labels';

export const COLUMN_DEFINITIONS = addColumnSortLabels([
  {
    id: 'catalogId',
    sortingField: 'catalogId',
    header: 'Catalog Id',
    cell: item =>  item.CatalogId||'-',
  },
  {
    id: 'tagkey',
    sortingField: 'tagkey',
    header: 'Key',
    cell: item => (<Badge color={item.TagKey === 'PII'?'red':'green'} 
            >{item.TagKey}</Badge>),
  
  },
  {
    id: 'tagvalues',
    header: 'Values',
    cell: item => ( <SpaceBetween direction='horizontal' size='xs'>
      {item.TagValues.map(val => <Badge color='blue' key={val} >{val}</Badge>)}
      </SpaceBetween>)
    ,
  },
]);


const VISIBLE_CONTENT_OPTIONS = [
  {
    label: 'Main user properties',
    options: [
      { id: 'catalogId', label: 'Catalog Id' },
      { id: 'tagkey', label: 'Key' },
      { id: 'tagvalues', label: 'Values' },
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
  visibleContent: ['catalogId','tagkey', 'tagvalues'],
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
