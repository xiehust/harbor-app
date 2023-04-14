// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React from 'react';
import { BreadcrumbGroup, HelpPanel, Icon, SpaceBetween, Button } from '@cloudscape-design/components';
import { ExternalLinkItem } from '../commons/common-components';
import {TableHeader } from '../commons/common-components';


const breadcrumbsItems = [
  {
    text: 'Harbor',
    href: '/home',
  },
  {
    text: 'Databases',
    href: '/catalog/databases',
  },
];

export const Breadcrumbs = () => (
  <BreadcrumbGroup items={breadcrumbsItems} expandAriaLabel="Show path" ariaLabel="Breadcrumbs" />
);

export const BreadcrumbsDynmic = ({id}) => (
  <BreadcrumbGroup items={[...breadcrumbsItems, 
                          {
                            text: id,
                            href: '/catalog/database/'+id,
                          },]
  } expandAriaLabel="Show path" ariaLabel="Breadcrumbs" />
);

export const FullPageHeader = ({
  resourceName = 'Databases',
  createButtonText = 'Create',
  ...props
}) => {
  const isOnlyOneSelected = props.selectedItems.length === 1;
  const selectdb = isOnlyOneSelected?props.selectedItems[0].db_name:"";

  return (
    <TableHeader
      variant="awsui-h1-sticky"
      title={resourceName}
      actionButtons={
        <SpaceBetween size="xs" direction="horizontal">
            <Button name="refresh" onClick={props.refreshAction} iconName="refresh"/>
          <Button disabled={!isOnlyOneSelected} name="view" 
          href={'/catalog/database/'+selectdb}
          >View details</Button>
          {/* <Button disabled={props.selectedItems.length === 0} name="delete" >Delete</Button> */}
          <Button iconName="add-plus" variant="primary" href={props.href}>{createButtonText} </Button>
        </SpaceBetween>
      }
      {...props}
    />
  );
};

const toolsFooter = (
  <>
    <h3>
      Learn more{' '}
      <span role="img" aria-label="Icon external Link">
        <Icon name="external" />
      </span>
    </h3>
    <ul>
      <li>
        <ExternalLinkItem
          href="https://aws.amazon.com/blogs/big-data/design-a-data-mesh-architecture-using-aws-lake-formation-and-aws-glue/"
          text="Design a data mesh architecture using AWS Lake Formation and AWS Glue"
        />
      </li>
    </ul>
  </>
);
export const ToolsContent = () => (
  <HelpPanel footer={toolsFooter} header={<h2>Harbor App</h2>}>
    <p>
      Harbor App is a demo application of DataMesh
    </p>
  </HelpPanel>
);
