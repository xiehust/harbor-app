// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React from 'react';
import { BreadcrumbGroup, SpaceBetween, Button } from '@cloudscape-design/components';
import {TableHeader } from '../commons/common-components';


const breadcrumbsItems = [
  {
    text: 'Harbor',
    href: '/home',
  },
  {
    text: 'Subscription',
    href: '/subscription-list',
  },
];

export const Breadcrumbs = () => (
  <BreadcrumbGroup items={breadcrumbsItems} expandAriaLabel="Show path" ariaLabel="Breadcrumbs" />
);

export const BreadcrumbsDynmic = ({id}) => (
  <BreadcrumbGroup items={[...breadcrumbsItems, 
                          {
                            text: id,
                            href: '/subscription-list/'+id,
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
          href={"/subscription-list/"+selectId}>View</Button>
          {/* <Button disabled={!isOnlyOneSelected} name="edit" >Edit</Button> */}
          {/* <Button disabled={props.selectedItems.length === 0} name="delete" >Delete</Button> */}
          {/* <Button iconName="add-plus" variant="primary" href={props.href}>{createButtonText} </Button> */}
        </SpaceBetween>
      }
      {...props}
    />
  );
};
