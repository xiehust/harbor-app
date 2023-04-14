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
  StatusIndicator,
  Link,
  Icon,
  Spinner,
} from "@cloudscape-design/components";
import { BreadcrumbsDynmic } from "./common-components";
import { CustomAppLayout, Navigation } from "../commons/common-components";
import { useSimpleNotifications } from "../commons/use-notifications";
import { useAuthorizedHeader, useAuthUserInfo } from "../commons/use-auth";
import {createDB,approveSubscribe} from "../commons/api-gateway";
import { useNavigate } from "react-router-dom";
import {
  TableEmptyState,
  TableNoMatchState,
} from "../commons/common-components";
import { useCollection } from "@cloudscape-design/collection-hooks";
import { getFilterCounterText } from '../../common/tableCounterStrings';
import { paginationLabels } from '../../common/labels';
import {TableHeader} from '../commons/common-components';
import { useColumnWidths } from '../commons/use-column-widths';
import { useLocalStorage } from '../../common/localStorage';
import {LFTAG_COLUMN_DEFINITIONS,LFTAG_VISIBLE_OPTIONS,LFTAG_PREFERENCES,
  COL_PREFERENCES,COL_VISIBLE_OPTIONS,
  Preferences} from './table-config';
import {API_getApproveRecord,remotePostCall} from '../commons/api-gateway';
import { PermissionPanel} from "../commons/common-panels";


const handleAction = (
  id,
  action,
  headers,
  setNotificationItems,
  setLoading,
  setVisible,
  navigate,
  remotecall,
) => {
  setLoading(true);
  const msgid = Math.random().toString(16);
  remotecall(headers,{action: action,id: id,})
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
        navigate("/approval-list");
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
      navigate("/approval-list");
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
                 const remotecall = actiontype === 'createdb'?createDB:approveSubscribe;
                 handleAction(
                  id,
                  action,
                  headers,
                  setNotificationItems,
                  setLoading,
                  setVisible,
                  navigate,
                  remotecall
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


const LFTagsPanel = ({data})=>{
  const [columnDefinitions, saveWidths] = useColumnWidths('React-Table-Widths', LFTAG_COLUMN_DEFINITIONS);
  const [preferences, setPreferences] = useLocalStorage('React-LFTagsPanel-Preferences', LFTAG_PREFERENCES);

  const { items, actions, filteredItemsCount, collectionProps, filterProps, paginationProps } = useCollection(
    data,
    {
      filtering: {
        empty: <TableEmptyState resourceName="Tags" />,
        noMatch: <TableNoMatchState onClearFilter={() => actions.setFiltering('')} />,
      },
      pagination: { pageSize: preferences.pageSize },
      sorting: { defaultState: { sortingColumn: columnDefinitions[0] } },
      selection: {},
    }
  );
  return (
    <Table
      {...collectionProps}
      columnDefinitions={columnDefinitions}
      visibleColumns={preferences.visibleContent}
      items={items}
      // selectionType="multi"
      ariaLabels={{
        itemSelectionLabel: (data, row) => `select ${row.id}`,
        allItemsSelectionLabel: () => 'select all',
        selectionGroupLabel: 'lftag selection',
    }}
      // variant="full-page"
      resizableColumns={true}
      onColumnWidthsChange={saveWidths}
      wrapLines={preferences.wrapLines}
      header={
        <TableHeader
          selectedItems={collectionProps.selectedItems}
          totalItems={items}
          title='LF-Tags Filter'
        />
      }
      filter={
        <TextFilter
          {...filterProps}
          filteringAriaLabel="Filter"
          filteringPlaceholder="Find"
          countText={getFilterCounterText(filteredItemsCount)}
        />
      }
      pagination={<Pagination {...paginationProps} ariaLabels={paginationLabels} />}
      preferences={<Preferences visibleContentOptions={LFTAG_VISIBLE_OPTIONS } 
                        preferences ={preferences}
       setPreferences={setPreferences} />}
    />
  );
}


const DetailPanel = ({items})=>{
  return (
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
  );
}


const  ContentPanel = ({ id, items, isAdmin }) =>{
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
                disabled={items.status !== 'submitted'}
                variant="primary"
                onClick={() => {
                  setVisible(true);
                  setTriAction("withdraw");
                }}
              >
                Withdraw
              </Button>
            </SpaceBetween>
          }
        >
          Subscription Id: {id}
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
        <DetailPanel items = {items}/>
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
            tagsfilter={permissions.tagsfilter}
          />
        ) : (
          <div />
        )}
        <LFTagsPanel data = {permissions.tagsfilter}/>
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

const ColumnsPermissionPanel = ({ datapermission,tagsfilter,table }) => {
  const [preferences, setPreferences] = useLocalStorage('React-ColPanel-Preferences', COL_PREFERENCES);
  const totalColumns = datapermission.selectedColumns;
  // const [loading, setLoading] = useState(true);
  //conver the tags to map. 
  let tagsfiltermap = new Map();
  tagsfilter.map(v => tagsfiltermap.set(v.column,'overwritten'));

  const displayitems = totalColumns.map(v => ({...v, 
        filtertype:tagsfiltermap.get(v.value)??(
               datapermission.filtertype === "incl"
              ? "Include"
              : "Exclude"
        )
  }));
  // console.log(displayitems);

  const COL_COLUMN_DEFINITIONS = [
    {
      id: "table",
      sortingField: "table",
      header: "Table name",
      cell: ()=> table,
    },
    {
      id: "col",
      sortingField: "col",
      header: "Column",
      cell: (items) => items.value,
    },
    {
      id: "type",
      sortingField: "type",
      header: "Type",
      cell: (items) => items.tags.join(),
    },
    {
      id: "filtertype",
      sortingField: "filtertype",
      header: "Column Filter",
      cell: (items) => items.filtertype === 'overwritten'? 
            <StatusIndicator type="warning">{"Overwritten by LF-Tags filter"}
            </StatusIndicator>
            :items.filtertype,
    },
  ];
  const [columnDefinitions, saveWidths] = useColumnWidths('React-COL-Table-Widths', COL_COLUMN_DEFINITIONS);

  const {
    items,
    actions,
    filteredItemsCount,
    collectionProps,
    filterProps,
    paginationProps,
  } = useCollection(displayitems, {
    filtering: {
      empty: <TableEmptyState resourceName="Columns" />,
      noMatch: (
        <TableNoMatchState onClearFilter={() => actions.setFiltering("")} />
      ),
    },
    pagination: { pageSize: preferences.pageSize },
    sorting: { defaultState: { sortingColumn: columnDefinitions[0] } },
    selection: {},
  });
  return (
    <Table
    {...collectionProps}
    // loading={loading}
    columnDefinitions={columnDefinitions}
    visibleColumns={preferences.visibleContent}
    items={items}
    // selectionType="multi"
    ariaLabels={{
      itemSelectionLabel: (data, row) => `select ${row.id}`,
      allItemsSelectionLabel: () => 'select all',
      selectionGroupLabel: 'col selection',
  }}
    resizableColumns={true}
    onColumnWidthsChange={saveWidths}
    wrapLines={preferences.wrapLines}
    header={
      <TableHeader
        selectedItems={collectionProps.selectedItems}
        totalItems={items}
        title='Column'
      />
    }
    filter={
      <TextFilter
        {...filterProps}
        filteringAriaLabel="Filter"
        filteringPlaceholder="Find"
        countText={getFilterCounterText(filteredItemsCount)}
      />
    }
    pagination={<Pagination {...paginationProps} ariaLabels={paginationLabels} />}
    preferences={<Preferences visibleContentOptions={COL_VISIBLE_OPTIONS } 
        preferences ={preferences}
     setPreferences={setPreferences} />}
  />
  );
};

export default function SubscriptionDetail() {
  const { subsId } = useParams();
  const [details, setDetail] = useState();
  const headers = useAuthorizedHeader();
  const [toolsOpen, setToolsOpen] = useState(false);
  const appLayout = useRef();
  const { notificationitems } = useSimpleNotifications();
  const userInfo = useAuthUserInfo();
  const isAdmin = userInfo.grouptype === "CENTRAL" ? true : false;

  useEffect(() => {
    const controller = new AbortController();
    const payload = {id: subsId};

    const fetchData = async()=>{
      try {
        const data = await remotePostCall(headers,API_getApproveRecord,payload,controller);
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
      navigation={<Navigation activeHref="/subscription-list" />}
      notifications={<Flashbar items={notificationitems} />}
      breadcrumbs={<BreadcrumbsDynmic id={subsId} />}
      content={
        details ? (
          <ContentPanel id={subsId} items={details} isAdmin={isAdmin} />
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