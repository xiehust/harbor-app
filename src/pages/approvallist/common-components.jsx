// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React from 'react';
import { BreadcrumbGroup, HelpPanel, Icon, SpaceBetween, Button, Box } from '@cloudscape-design/components';
import { ExternalLinkItem } from '../commons/common-components';
import {TableHeader } from '../commons/common-components';
import Modal from "@cloudscape-design/components/modal";


const breadcrumbsItems = [
  {
    text: 'Harbor',
    href: '/home',
  },
  {
    text: 'Approvals',
    href: '/approval-list',
  },
];

export const Breadcrumbs = () => (
  <BreadcrumbGroup items={breadcrumbsItems} expandAriaLabel="Show path" ariaLabel="Breadcrumbs" />
);

export const BreadcrumbsDynmic = ({id}) => (
  <BreadcrumbGroup items={[...breadcrumbsItems, 
                          {
                            text: id,
                            href: '/approval-list/'+id,
                          },]
  } expandAriaLabel="Show path" ariaLabel="Breadcrumbs" />
);


export const FullPageHeader = ({
  resourceName,
  createButtonText,
  ...props
}) => {
  const isOnlyOneSelected = props.selectedItems.length === 1;
  //  console.log(props.selectedItems); 
  const selectId = isOnlyOneSelected?props.selectedItems[0].id:"";
  return (
    <TableHeader
      variant="awsui-h1-sticky"
      title={resourceName}
      actionButtons={
        <SpaceBetween size="xs" direction="horizontal">
        <Button name="refresh" onClick={props.refreshAction} iconName="refresh"/>
          <Button disabled={!isOnlyOneSelected} name="view" 
          href={"/approval-list/"+selectId}>Action</Button>
          {/* <Button disabled={!isOnlyOneSelected} name="edit" >Edit</Button> */}
          {/* <Button disabled={props.selectedItems.length === 0} name="delete" >Delete</Button> */}
          <Button iconName="add-plus" variant="primary" href={props.href}>{createButtonText} </Button>
        </SpaceBetween>
      }
      {...props}
    />
  );
};
