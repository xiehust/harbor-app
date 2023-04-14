// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React from 'react';
import { BreadcrumbGroup, HelpPanel, Icon, Box,Link } from '@cloudscape-design/components';
import { HomeBreadcrumbs } from '../../common/breadcrumbs';
import { ExternalLinkItem } from '../commons/common-components';
// import { CounterLink } from "../commons/common-components";


const CounterLink = ({href, children }) => {
  return (
    <Link variant="awsui-value-large" href={href}>
      {children}
    </Link>
  );
};

export const Breadcrumbs = () => (
  <BreadcrumbGroup items={HomeBreadcrumbs} expandAriaLabel="Show path" ariaLabel="Breadcrumbs" />
);

export const LabelVals =({label,href,value})=>{
  return(
    <div>
    <Box variant="awsui-key-label">{label}</Box>
    <CounterLink href={href}>{value}</CounterLink>
  </div>
  )
}

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
