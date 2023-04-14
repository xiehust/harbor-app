// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React, { createContext, useContext, useRef, useState } from 'react';
import { Breadcrumbs, ToolsContent } from './common-components';
import FormContent from './group-form';
import {
  CustomAppLayout,
  Navigation,
} from '../../commons/common-components';
import {useSimpleNotifications} from "../../commons/use-notifications";
import { Flashbar } from '@cloudscape-design/components';

export default function AddGroupApp() {
  const appLayout = useRef();
  const {notificationitems} = useSimpleNotifications();

  return (
    <CustomAppLayout
      ref={appLayout}
      navigation={<Navigation activeHref="/admin/group" />}
      notifications={<Flashbar items={notificationitems}/>}
      breadcrumbs={<Breadcrumbs />}
      content={<FormContent/>}
      contentType="table"
      stickyNotifications
    />
  );
}
