// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React from 'react';
import { BreadcrumbGroup, HelpPanel, Icon, SpaceBetween, Button, Box } from '@cloudscape-design/components';
import {TableHeader } from '../../commons/common-components';
import Modal from "@cloudscape-design/components/modal";


const breadcrumbsItems = [
  {
    text: 'Harbor',
    href: '/home',
  },
  {
    text: 'User',
    href: '/admin/user',
  },
  {
    text: 'Add User',
    href: '',
  },
];

export const Breadcrumbs = () => (
  <BreadcrumbGroup items={breadcrumbsItems} expandAriaLabel="Show path" ariaLabel="Breadcrumbs" />
);


export function ModalPopup ({header,desc}) {
  const [visible, setVisible] = React.useState(true);
  return (
    <Modal
      onDismiss={() => setVisible(false)}
      visible={visible}
      closeAriaLabel="Close modal"
      footer={
        <Box float="right">
          <SpaceBetween direction="horizontal" size="xs">
            <Button onClick={()=>setVisible(false)} >Dismiss</Button>
          </SpaceBetween>
        </Box>
      }
      header={header}
    >
      {desc}
    </Modal>
  );
}