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
    text: 'LF Tags',
    href: '/catalog/lftags',
  },
];

export const Breadcrumbs = () => (
  <BreadcrumbGroup items={breadcrumbsItems} expandAriaLabel="Show path" ariaLabel="Breadcrumbs" />
);

export const BreadcrumbsDynmic = ({id}) => (
  <BreadcrumbGroup items={[...breadcrumbsItems, 
                          {
                            text: id,
                            href: '/catalog/lftags/'+id,
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
  const selectId = isOnlyOneSelected?props.selectedItems[0].TagKey:"";
  return (
    <TableHeader
      variant="awsui-h1-sticky"
      title={resourceName}
      actionButtons={
        <SpaceBetween size="xs" direction="horizontal">
          <Button disabled={!isOnlyOneSelected} name="view" 
          href={"/catalog/lftags/"+selectId}>View</Button>
          {/* <Button disabled={!isOnlyOneSelected} name="edit" >Edit</Button> */}
          {/* <Button disabled={props.selectedItems.length === 0} name="delete" >Delete</Button> */}
         {props.addTagButton}
        </SpaceBetween>
      }
      {...props}
    />
  );
};
