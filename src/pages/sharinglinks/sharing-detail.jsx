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
  RadioGroup,
  ColumnLayout,
  ContentLayout,
  FormField,
  Tiles,
  Table,
  TextFilter,
  Pagination,
  Spinner,
  StatusIndicator,
  Link,
} from "@cloudscape-design/components";
import { BreadcrumbsDynmic } from "./common-components";
import { CustomAppLayout, Navigation } from "../commons/common-components";
import { useSimpleNotifications } from "../commons/use-notifications";
import remoteApis from "../commons/remote-apis";
import { useAuthorizedHeader, useAuthUserInfo } from "../commons/use-auth";
import { useNavigate } from "react-router-dom";
import {
  TableEmptyState,
  TableNoMatchState,
} from "../commons/common-components";
import { useCollection } from "@cloudscape-design/collection-hooks";
import { getFilterCounterText } from '../../common/tableCounterStrings';
import { paginationLabels } from '../../common/labels';
import {remotePostCall,API_AlterSubscription} from '../commons/api-gateway';
import { PermissionPanel} from "../commons/common-panels";

const handleAction = (
  id,
  action,
  headers,
  setNotificationItems,
  setLoading,
  setVisible,
  navigate,
  actiontype,
) => {
  setLoading(true);
  const msgid = Math.random().toString(16);



  remotePostCall(headers,API_AlterSubscription,{action: actiontype,id: id,})
    .then((resp) => {
      // console.log(resp);
      if (resp === "update success") {
        setNotificationItems((item) => [
          ...item,
          {
            header: `Success to sumbit request`,
            type: "success",
            content: `Success to submit request`,
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
        navigate("/subscription-list");
      }
    })
    .catch((err) => {
      console.error(err);
      setNotificationItems((item) => [
        ...item,
        {
          header: `Failed to sumbit request`,
          type: "error",
          content: `Failed to submit request`,
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
      navigate("/subscription-list");
    });
};


const ModalPopup = ({ actiontype, visible, setVisible, id, action }) => {
  // const [msgid, setMsgid] = useState(Math.round(Math.random() * 100));
  const [loading,setLoading] = useState(false);
  const { setNotificationItems } = useSimpleNotifications();
  const headers = useAuthorizedHeader();
  const navigate = useNavigate();
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
              loading = {loading}
              onClick={(e) => {
                 e.preventDefault();
                //  const remotecall = (actiontype === 'withraw')?createDB:approveSubscribe;
                 handleAction(
                  id,
                  action,
                  headers,
                  setNotificationItems,
                  setLoading,
                  setVisible,
                  navigate,
                  actiontype
                );
              }}
            >
              Confirm
            </Button>
          </SpaceBetween>
        </Box>
      }
      header="Confirm"
    >
      <Box variant="h4">Confirm : {action}</Box>
    </Modal>
  );
};

function ContentPanel({ id, items, isAdmin }) {
  let permissions;
  if (items && items.permissions) {
    permissions = JSON.parse(items.permissions.replaceAll("\\", ""));
  }

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
                disabled={isAdmin || items.status !== 'submitted'}
                variant="primary"
                onClick={() => {
                  setVisible(true);
                  setTriAction("withraw");
                }}
              >
                Withdraw
              </Button>
              <Button
                disabled={isAdmin || items.status !== 'approved'}
                onClick={() => {
                  setVisible(true);
                  setTriAction("unsubscribe");
                }}
              >
                Unsubscribe
              </Button>
            </SpaceBetween>
          }
        >
          Sharing Id: {id}
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
        <Container header={<Header variant="h2">Details</Header>}>
          <ColumnLayout columns={2} variant="text-grid">
            <div>
              <Box variant="awsui-key-label">Request type</Box>
              <RadioGroup
                items={[{ value: items.type, label: items.type }]}
                value={items.type}
              />
              {/* <div>{items.type}</div> */}
            </div>
            <div>
              <Box variant="awsui-key-label">Resource type</Box>
              <div>
                <RadioGroup
                  items={[
                    { value: 1, label: "by Named data catalog resources" },
                  ]}
                  value={1}
                />
              </div>
            </div>
            <div>
              <Box variant="awsui-key-label">Database name</Box>
              <Link variant="primary" href={"/catalog/database/"+items.db_name} >{items.db_name} </Link>
            </div>
            <div>
              <Box variant="awsui-key-label">Table name</Box>
              {items.table_name? <Link variant="primary" href={"/catalog/database/"+items.db_name+"/"+items.table_name}> {items.table_name}</Link>:'-'}
            </div>
            <div>
              <Box variant="awsui-key-label">Created</Box>
              <div>{items.created}</div>
            </div>
            <div>
              <Box variant="awsui-key-label">Requester</Box>
              <div>
                {items.groupname} (awsid:{items.awsid})
              </div>
            </div>
            <div>
              <Box variant="awsui-key-label">Description</Box>
              <div>{items.description||'-'}</div>
            </div>
            <div>
              <Box variant="awsui-key-label">Status</Box>
              <StatusIndicator type={
                      items.status === 'approved' ? 'success' : (items.status === 'rejected'?'error':'pending')
                      }
                    >{items.status}
                </StatusIndicator>
            </div>
          </ColumnLayout>
        </Container>
        <PermissionPanel
          type={items.type}
          permissions={permissions}
          expiredate={items.expiredate}
        />
        {items.type === "subscribe" ? (
          <PermiTypePanel permissiontype={permissions.permissiontype} />
        ) : (
          <div />
        )}
        {items.type === "subscribe" && permissions.permissiontype === 'column' ? (
          <ColumnsPermissionPanel
            datapermission={permissions.data_permission} table={items.table_name}
          />
        ) : (
          <div />
        )}
      </SpaceBetween>
    </ContentLayout>
  );
}

const PermiTypePanel = ({ permissiontype }) => {
  return (
    <Container header={<Header variant="h2">Type</Header>}>
      <FormField label="Request type" stretch={true}>
        <Tiles
          items={[
            {
              value: "all",
              label: "All data access",
              disabled: permissiontype==="all",
              description:
                "Grant access to all data (with tag filter applied optional).",
            },
            {
              value: "column",
              label: "Column-based access",
              disabled: permissiontype==="column",
              description: "Grant data access to specific columns only.",
            },
          ]}
          value={permissiontype}
        />
      </FormField>
    </Container>
  );
};

const ColumnsPermissionPanel = ({ datapermission,table }) => {
  // console.log(datapermission);
  const totalColumns = datapermission.selectedColumns;
  const columnDefinitions = [
    {
      id: "table",
      sortingField: "table",
      header: "Table name",
      cell: ()=> table,
    },
    {
      id: "col",
      sortingField: "col",
      header: "Column name",
      cell: (items) => items.value,
    },
    {
      id: "type",
      sortingField: "type",
      header: "Type name",
      cell: (items) => items.tags.join(),
    },
    {
      id: "filtertype",
      sortingField: "filtertype",
      header: "Filter type",
      cell: () =>
        datapermission.filtertype === "incl"
          ? "Include columns"
          : "Exclude columns",
    },
  ];
  const {
    items,
    actions,
    filteredItemsCount,
    collectionProps,
    filterProps,
    paginationProps,
  } = useCollection(totalColumns, {
    filtering: {
      empty: <TableEmptyState resourceName="Distribution" />,
      noMatch: (
        <TableNoMatchState onClearFilter={() => actions.setFiltering("")} />
      ),
    },
    pagination: { pageSize: 5 },
    sorting: { defaultState: { sortingColumn: columnDefinitions[0] } },
    selection: {},
  });
  return (
    <Table
      {...collectionProps}
      columnDefinitions={columnDefinitions}
      items={items}
      variant="container"
      // stickyHeader={true}
      resizableColumns={true}
      wrapLines={true}
      header={
        <Header
          counter={
            collectionProps.selectedItems.length
              ? "(" + collectionProps.selectedItems.length + "/"+totalColumns.length+")"
              : "("+totalColumns.length+")"
          }
        >
          Columns
        </Header>
      }
      filter={
        <TextFilter
          {...filterProps}
          filteringAriaLabel="Filter"
          filteringPlaceholder="Find"
          countText={getFilterCounterText(filteredItemsCount)}
        />
      }
      pagination={
        <Pagination {...paginationProps} ariaLabels={paginationLabels} />
      }
    />
  );
};


export default function SharinglinkDetail() {
  const { Id } = useParams();
  const [details, setDetail] = useState();
  const headers = useAuthorizedHeader();
  const [toolsOpen, setToolsOpen] = useState(false);
  const appLayout = useRef();
  const { notificationitems } = useSimpleNotifications();
  const userInfo = useAuthUserInfo();
  const isAdmin = userInfo.grouptype === "CENTRAL" ? true : false;

  useEffect(() => {
    new remoteApis()
      .invokeAPIGW_2("getrecord", {
        method: "POST",
        headers: headers,
        body: JSON.stringify({id: Id }),
      })
      .then((ele) => {
        setDetail(ele);
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  return (
    <CustomAppLayout
      ref={appLayout}
      navigation={<Navigation activeHref="/catalog/sharinglinks" />}
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