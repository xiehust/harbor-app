// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Flashbar,
  Container,
  Header,
  SpaceBetween,
  Box,
  Button,
  Modal,
  ColumnLayout,
  ContentLayout,
  Badge,
  Spinner,
  Alert,
  Input,
  FormField,

} from "@cloudscape-design/components";
import { BreadcrumbsDynmic } from "./common-components";
import { CustomAppLayout, Navigation } from "../commons/common-components";
import { useSimpleNotifications } from "../commons/use-notifications";
import { useAuthorizedHeader, useAuthUserInfo } from "../commons/use-auth";
import { useNavigate } from "react-router-dom";
import {remotePostCall,API_deletelftag,API_getlftagByKey} from '../commons/api-gateway';
import {ConsumerPanel} from '../commons/common-panels';

const handleDeleteAction = (
  tagkey,
  headers,
  setNotificationItems,
  setLoading,
  setVisible,
  navigate,
) => {
  setLoading(true);
  const msgid = Math.random().toString(16);
  remotePostCall(headers,API_deletelftag,{tagkey: tagkey})
    .then((resp) => {
        setNotificationItems((item) => [
          ...item,
          {
            header: `Success to sumbit request`,
            type: "success",
            content: `Success to delete LF-Tag [${tagkey}]`,
            dismissible: true,
            dismissLabel: "Dismiss message",
            onDismiss: () =>
              setNotificationItems((items) =>
                items.filter((item) => item.id !== msgid)
              ),
            id: msgid,
          },
        ]);
        setLoading(false);
        setVisible(false);
        navigate("/catalog/lftags");
    })
    .catch((err) => {
      setNotificationItems((item) => [
        ...item,
        {
          header: `Failed to sumbit request`,
          type: "error",
          content: `Delete LF-Tags failed: ${err}`,
          dismissible: true,
          dismissLabel: "Dismiss message",
          onDismiss: () =>
            setNotificationItems((items) =>
              items.filter((item) => item.id !== msgid)
            ),
          id: msgid,
        },
      ]);
      setLoading(false);
      setVisible(false);
      navigate("/catalog/lftags");
    });
};


const ModalPopup = ({ visible, setVisible, id, action }) => {
  const [loading,setLoading] = useState(false);
  const { setNotificationItems } = useSimpleNotifications();
  const headers = useAuthorizedHeader();
  const navigate = useNavigate();
  const [confirmStatus, setConfirmStatus] = useState();
  const [inputKeyValue, setInputKey] = useState();
  return (
    <Modal
      onDismiss={() => setVisible(false)}
      visible={visible}
      closeAriaLabel="Close modal"
      footer={
        <Box float="right">
          <SpaceBetween direction="horizontal" size="xs">
            <Button
              variant="link"
              onClick={() => {
                setVisible(false);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled ={!confirmStatus}
              loading = {loading}
              onClick={(e) => {
                 e.preventDefault();
                handleDeleteAction(
                  id,
                  headers,
                  setNotificationItems,
                  setLoading,
                  setVisible,
                  navigate
                );
              }}
            >
              Confirm
            </Button>
          </SpaceBetween>
        </Box>
      }
      header={<Header variant="h2"> {`Delete LF-Tag ${id} ?`}</Header>}
    > 
    <SpaceBetween direction="vertical" size="m">
      <Box variant="p">{"Delete this LF-Tag permanently? This action cannot be undone."}</Box>
      <Alert statusIconAriaLabel="Warning" type="warning">
       {"Deleting this LF-Tag will also remove it from all data catalog resources."}
      </Alert>
      <FormField
      description="To confirm the LF-tag deletion, enter its key string in the input field below."
      label="Key"
    >
      <Input
        value={inputKeyValue}
        onChange={event =>{
          setInputKey(event.detail.value);
          (event.detail.value === id)?setConfirmStatus(true):setConfirmStatus(false);
        }
        }
        placeholder = {id}
      />
      </FormField>
      </SpaceBetween>
    </Modal>
  );
};

function ContentPanel({ id, items, isAdmin }) {

  const [visible, setVisible] = useState(false);
  const [triggerAction, setTriAction] = useState();

  return (
    <ContentLayout
      header={
        <Header
          variant="h1"
          actions={
            <SpaceBetween size="xs" direction="horizontal">
              <Button
                disabled={!isAdmin }
                // variant="primary"
                onClick={() => {
                  setVisible(true);
                  setTriAction("Edit");
                }}
              >
                Edit
              </Button>
              <Button
                disabled={!isAdmin}
                onClick={() => {
                  setVisible(true);
                  setTriAction("Delete");
                }}
              >
                Delete
              </Button>
            </SpaceBetween>
          }
        >
          {id}
        </Header>
      }
    >
      <ModalPopup
        actiontype = {items.type}
        visible={visible}
        setVisible={setVisible}
        id={id}
        action={triggerAction}
      />
      <SpaceBetween size="l">
        <Container header={<Header variant="h2"
        >Details</Header>}>
          <ColumnLayout columns={2} variant="text-grid">
            <div>
              <Box variant="awsui-key-label">Key</Box>
              <Badge color={items.TagKey === 'PII'?'red':'green'} 
                      >{items.TagKey}</Badge>
            </div>
            <div>
              <Box variant="awsui-key-label">Values</Box>
              <SpaceBetween direction='horizontal' size='xs'>
                {items.TagValues.map(val => <Badge color='blue' key={val} >{val}</Badge>)}
              </SpaceBetween>
            </div>
          </ColumnLayout>
        </Container>
        <ConsumerPanel title={'Permissions'} type={'lftag'} scope={'all'} tagkey={items.TagKey} tagvalues={items.TagValues}/>
      </SpaceBetween>
    </ContentLayout>
  );
}


export default function LfTagDetail() {
  const { Id } = useParams();
  const [details, setDetail] = useState();
  const headers = useAuthorizedHeader();
  const [toolsOpen, setToolsOpen] = useState(false);
  const appLayout = useRef();
  const { notificationitems } = useSimpleNotifications();
  const userInfo = useAuthUserInfo();
  const isAdmin = userInfo.grouptype === "CENTRAL" ? true : false;
  useEffect(() => {
    const controller = new AbortController();
    const payload ={tagkey:Id};
    const fetchData = async() =>{
      try {
        const data = await remotePostCall(headers,API_getlftagByKey,payload,controller);
        setDetail(data);
      }catch(err){
        console.error(err);
      }
    }
    fetchData();
    return ()=>controller.abort();

  }, []);

  return (
    <CustomAppLayout
      ref={appLayout}
      navigation={<Navigation activeHref="/catalog/lftags" />}
      notifications={<Flashbar items={notificationitems} />}
      breadcrumbs={<BreadcrumbsDynmic id={Id} />}
      content={
        details ? (
          <ContentPanel id={Id} items={details} isAdmin={isAdmin} />
        ) : (
          <Spinner size="large"/>
        )
      }
      contentType="table"
      stickyNotifications
      toolsOpen={toolsOpen}
      onToolsChange={({ detail }) => setToolsOpen(detail.open)}
    />
  );
}