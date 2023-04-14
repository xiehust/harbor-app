
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React, { useState,  useEffect } from "react";
import {TableHeader } from './common-components';
import { CollectionPreferences } from '@cloudscape-design/components';
import { remotePostCall, API_getSharingsbyRes } from "./api-gateway";
import {useAuthorizedHeader} from "./use-auth";
import { useCollection } from '@cloudscape-design/collection-hooks';
import {
  TableEmptyState,
  TableNoMatchState,
} from './common-components';
import { useLocalStorage } from '../../common/localStorage';
import {
  Pagination,
  TextFilter,
  Table,
  Container,
  Header,
  Box,
  Checkbox,
  ColumnLayout
} from "@cloudscape-design/components";
import { getFilterCounterText } from '../../common/tableCounterStrings';
import { useColumnWidths } from './use-column-widths';
import { paginationLabels } from '../../common/labels';


const PAGE_SIZE_OPTIONS = [
    { value: 10, label: '10 Distributions' },
    { value: 30, label: '30 Distributions' },
    { value: 50, label: '50 Distributions' },
];


const Sharing_Column_Definitions = [
  {
    id: "principalIdentifier",
    header: "AWS Principal",
    cell: item => item.principalIdentifier || "-",
    sortingField: "principalIdentifier",
  },
    {
      id: "principalid",
      header: "AWS Account ID",
      cell: item => item.principalId || "-",
      sortingField: "principalid",
    },
    {
      id: "groupname",
      header: "Group name",
      cell: item => item.groupname || "-",
      sortingField: "subscribed",
    },
    {
      id: "grouptype",
      header: "Group type",
      cell: item => item.grouptype || "-",
      sortingField: "grouptype",
    },
    {
      id: "permissions",
      header: "Permissions",
      cell: item => item.permissions.join(',') || "-",
    },
    {
      id: "grant_permissions",
      header: "Grantable Permissions",
      cell: item => item.grant_permissions.join(',') || "-",
    },
  ]
  
const Sharing_DEFAULT_PREFERENCES = {
    pageSize: 30,
    visibleContent: ['principalIdentifier','principalid','groupname', 'grouptype', 'permissions',],
    wrapLines: false,
};

const Preferences = ({
    preferences,
    setPreferences,
    disabled,
    pageSizeOptions = PAGE_SIZE_OPTIONS,
    visibleContentOptions,
  }) => (
    <CollectionPreferences
      title="Preferences"
      confirmLabel="Confirm"
      cancelLabel="Cancel"
      disabled={disabled}
      preferences={preferences}
      onConfirm={({ detail }) => setPreferences(detail)}
      pageSizePreference={{
        title: 'Page size',
        options: pageSizeOptions,
      }}
      wrapLinesPreference={{
        label: 'Wrap lines',
        description: 'Check to see all the text and wrap the lines',
      }}
      visibleContentPreference={{
        title: 'Select visible columns',
        options: visibleContentOptions,
      }}
    />
  );


export const ConsumerPanel = ({dbName,tableName,tagkey,tagvalues,type,scope, title='Consumers'})=>{
    const [columnDefinitions, saveWidths] = useColumnWidths('React-Sharing-Table-Widths', Sharing_Column_Definitions);
    const [preferences, setPreferences] = useLocalStorage('React-SharingsPanel-Preferences', Sharing_DEFAULT_PREFERENCES);
    const [data, setData] = useState([]);
    const headers = useAuthorizedHeader();
    const [loading, setLoading] = useState(true);
  
    useEffect(()=>{ 
      const controller = new AbortController();
      const payload = {
        type:type,
        scope:scope,
        db_name:dbName,
        table_name:tableName,
        tagkey:tagkey,
        tagvalues:tagvalues
      };
      const fetchData = async() =>{
        try {
          const data = await remotePostCall(headers,API_getSharingsbyRes,payload,controller);      
          // console.log(data);
          setData(data);
          setLoading(false);
        }catch(err){
          console.error(err);
          // setLoading(false);
        }
      }
      fetchData();
      return ()=>controller.abort();
    },[]);
  
  
    const { items, actions, filteredItemsCount, collectionProps, filterProps, paginationProps } = useCollection(
      data,
      {
        filtering: {
          empty: <TableEmptyState resourceName="Sharings" />,
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
        loading={loading}
        loadingText={'loading'}
        columnDefinitions={columnDefinitions}
        visibleColumns={preferences.visibleContent}
        items={items}
        ariaLabels={{
          itemSelectionLabel: (data, row) => `select ${row.id}`,
          allItemsSelectionLabel: () => 'select all',
          selectionGroupLabel: 'lftag selection',
      }}
        resizableColumns={true}
        onColumnWidthsChange={saveWidths}
        wrapLines={preferences.wrapLines}
        header={
          <TableHeader
            selectedItems={collectionProps.selectedItems}
            totalItems={items}
            title={title}
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
        preferences={<Preferences visibleContentOptions={
            [
                {
                  label: 'Column properties',
                  options: [
                    { id: 'principalIdentifier', label: 'AWS Principal', },
                    { id: 'principalid', label: 'AWS Account ID', },
                    { id: 'groupname', label: 'Group name' },
                    { id: 'grouptype', label: 'Group type' },
                    { id: 'permissions', label: 'Permissions' },
                    { id: 'grant_permissions', label: 'Grantable permissions' },
                  ],
                },
              ]
           } 
         preferences={preferences}
         setPreferences={setPreferences} />}
      />
    );
    
  }

  export const PermissionPanel = ({ type, permissions, expiredate }) => {
    // console.log(type,permissions);
    const formatString =({...props})=>{
      // console.log(props);
      let ret = [];
      for (let x in props){
        if (x !== 'type' && props[x]) ret.push(x.toUpperCase());
      }
      // return  ret.join(' | ')
      return ret.map(v => (<Checkbox key={v} checked>{v}</Checkbox>))
    }

    return type === "createdb" ? (
      <Container header={<Header variant="h2">Permissions</Header>}>
        <ColumnLayout columns={2} variant="text-grid">
          <div>
            <Box variant="awsui-key-label">Database</Box>
            <div>{permissions ? formatString(permissions[0]) : "-"}</div>
          </div>
          <div>
            <Box variant="awsui-key-label">Grantable</Box>
            <div>{permissions ? formatString(permissions[1]) : "-"}</div>
          </div>
          <div>
            <Box variant="awsui-key-label">Expired date</Box>
            <div>{expiredate.slice(0,10)}</div>
          </div>
        </ColumnLayout>
      </Container>
    ) : (
      <Container header={<Header variant="h2">Permissions</Header>}>
        <ColumnLayout columns={2} variant="text-grid">
          <div>
            <Box variant="awsui-key-label">Table</Box>
            <div>
              {permissions ? formatString(permissions.permissions[0]) : "-"}
            </div>
          </div>
          <div>
            <Box variant="awsui-key-label">Grantable</Box>
            <div>
              {permissions ? formatString(permissions.permissions[1]) : "-"}
            </div>
          </div>
          <div>
            <Box variant="awsui-key-label">Expired date</Box>
            <div>{expiredate.slice(0,10)}</div>
          </div>
        </ColumnLayout>
      </Container>
    );
  };