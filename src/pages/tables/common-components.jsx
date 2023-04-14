// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React, { useState,  useEffect } from "react";
import {TableHeader } from '../commons/common-components';

import { remotePostCall, API_getSharingsbyRes } from "../commons/api-gateway";
import {useAuthorizedHeader} from "../commons/use-auth";
import { useCollection } from '@cloudscape-design/collection-hooks';
import {
  TableEmptyState,
  TableNoMatchState,
} from '../commons/common-components';
import { useLocalStorage } from '../../common/localStorage';
import {
  BreadcrumbGroup,
  Pagination,
  TextFilter,
  SpaceBetween,
  Button,
  Table,
} from "@cloudscape-design/components";
import { getFilterCounterText } from '../../common/tableCounterStrings';
import { useColumnWidths } from '../commons/use-column-widths';
import { paginationLabels } from '../../common/labels';
import {
  Sharing_Column_Definitions,
  Sharing_DEFAULT_PREFERENCES,
  Preferences} from './table-config';

const breadcrumbsItems = [
  {
    text: 'Harbor',
    href: '/home',
  },
  {
    text: 'Tables',
    href: '/catalog/tables',
  },
];

export const Breadcrumbs = () => (
  <BreadcrumbGroup items={breadcrumbsItems} expandAriaLabel="Show path" ariaLabel="Breadcrumbs" />
);

export const BreadcrumbsDynmic = ({id}) => (
  <BreadcrumbGroup items={[...breadcrumbsItems, 
                          {
                            text: id,
                            href: '/catalog/tables/'+id,
                          },]
  } expandAriaLabel="Show path" ariaLabel="Breadcrumbs" />
);

export const FullPageHeader = ({
  resourceName = 'Tables',
  createButtonText = 'Create',
  ...props
}) => {
  const isOnlyOneSelected = props.selectedItems.length === 1;
  const selectdb = isOnlyOneSelected?props.selectedItems[0].db_name:"";
  const selecttable = isOnlyOneSelected?props.selectedItems[0].table_name:"";

  return (
    <TableHeader
      variant="awsui-h1-sticky"
      title={resourceName}
      actionButtons={
        <SpaceBetween size="xs" direction="horizontal">
         <Button name="refresh" onClick={props.refreshAction} iconName="refresh"/>
          <Button disabled={!isOnlyOneSelected} name="view" 
          href={'/catalog/database/'+selectdb+'/'+selecttable}
          >View details</Button>
          {/* <Button disabled={!isOnlyOneSelected} name="edit" >Edit</Button> */}
          {/* <Button disabled={props.selectedItems.length === 0} name="delete" >Delete</Button> */}
       
          {/* <Button iconName="add-plus" variant="primary" href={props.href}>{createButtonText} </Button> */}
        </SpaceBetween>
      }
      {...props}
    />
  );
};



