// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React from 'react';
import { BreadcrumbGroup, HelpPanel, Icon, SpaceBetween, Button, Box } from '@cloudscape-design/components';
import { ExternalLinkItem } from '../../commons/common-components';
import {TableHeader } from '../../commons/common-components';
import Modal from "@cloudscape-design/components/modal";


const breadcrumbsItems = [
  {
    text: 'Harbor',
    href: '/home',
  },
  {
    text: 'Group',
    href: '/admin/group',
  },
];

export const Breadcrumbs = () => (
  <BreadcrumbGroup items={breadcrumbsItems} expandAriaLabel="Show path" ariaLabel="Breadcrumbs" />
);


export const FullPageHeader = ({
  resourceName,
  createButtonText,
  ...props
}) => {
  const isOnlyOneSelected = props.selectedItems.length === 1;

  return (
    <TableHeader
      variant="awsui-h1-sticky"
      title={resourceName}
      actionButtons={
        <SpaceBetween size="xs" direction="horizontal">
          {/* <Button disabled={!isOnlyOneSelected} name="view" >View details</Button> */}
          {/* <Button disabled={!isOnlyOneSelected} name="edit" >Edit</Button> */}
          <Button disabled={props.selectedItems.length === 0} name="delete" >Delete</Button>
          <Button iconName="add-plus" variant="primary" href={props.href}>{createButtonText} </Button>
        </SpaceBetween>
      }
      {...props}
    />
  );
};

export function ModalPopup () {
  const [visible, setVisible] = React.useState(false);
  return (
    <Modal
      onDismiss={() => setVisible(false)}
      visible={visible}
      closeAriaLabel="Close modal"
      footer={
        <Box float="right">
          <SpaceBetween direction="horizontal" size="xs">
            <Button variant="link">Cancel</Button>
            <Button variant="primary">Ok</Button>
          </SpaceBetween>
        </Box>
      }
      //header="Modal title"
    >
      Your description should go here
    </Modal>
  );
}