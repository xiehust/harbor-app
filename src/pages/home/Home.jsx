// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React, { useRef, useState } from "react";
import { Breadcrumbs, ToolsContent } from "./common-components";
import { CustomAppLayout, Navigation } from "../commons/common-components";
import Content from "./components/content";
import { Header, ContentLayout, Link } from "@cloudscape-design/components";

const Home = () => {
  const [toolsOpen, setToolsOpen] = useState(false);
  const appLayout = useRef();
  return (
    <CustomAppLayout
      ref={appLayout}
      navigation={<Navigation activeHref="/home" />}
      breadcrumbs={<Breadcrumbs />}
      content={
        <ContentLayout
          header={
            <Header variant="h1" info={<Link variant="info">Info</Link>}>
              Harbor Dashboard
            </Header>
          }
        >
          <Content />
        </ContentLayout>
      }
      tools={<ToolsContent />}
      toolsOpen={toolsOpen}
      onToolsChange={({ detail }) => setToolsOpen(detail.open)}
      stickyNotifications
    />
  );
};

export default Home;
