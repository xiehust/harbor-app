// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React, { useEffect, useRef, useState } from 'react';
import { COLUMN_DEFINITIONS, DEFAULT_PREFERENCES, Preferences,FILTERING_PROPERTIES } from './table-config';
import { Flashbar, Pagination, Table, TextFilter,PropertyFilter } from '@cloudscape-design/components';
import { FullPageHeader ,Breadcrumbs,} from './common-components';
import {
  CustomAppLayout,
  Navigation,
  TableNoMatchState,
  ToolsContent,
} from '../commons/common-components';
import {PROPERTY_FILTERING_I18N_CONSTANTS} from '../../common/i18nStrings';
import { paginationLabels } from '../../common/labels';
import { getServerFilterCounterText } from '../../common/tableCounterStrings';
import { useColumnWidths } from '../commons/use-column-widths';
import { useLocalStorage } from '../../common/localStorage';
import {useSimpleNotifications} from '../commons/use-notifications';
import {useAuthorizedHeader,useAuthUserInfo} from "../commons/use-auth";
import {useDistributions} from "./hooks";
import intersection from 'lodash/intersection';

const DEFAULT_FILTERING_QUERY = { tokens: [], operation: 'and' };


export function TableContent({ 
  resourceName,
  buttonName,
  buttonHref,
 }) {
  const [selectedItems, setSelectedItems] = useState([]);
  const [preferences, setPreferences] = useLocalStorage('Subscriptions-Table-Preferences', DEFAULT_PREFERENCES);
  const [currentPageIndex, setCurrentPageIndex] = useState(1);
  const [filteringText, setFilteringText] = useState('');
  const [delayedFilteringText, setDelayedFilteringText] = useState('');
  const [sortingColumn, setSortingColumn] = useState(COLUMN_DEFINITIONS[0]);
  const [descendingSorting, setDescendingSorting] = useState(true);
  const [filteringQuery, setFilteringQuery] = useState(DEFAULT_FILTERING_QUERY);
  const headers = useAuthorizedHeader();
  const userInfo = useAuthUserInfo();
  const [columnDefinitions, saveWidths] = useColumnWidths('React-Table-Widths', COLUMN_DEFINITIONS);
  // const [pageCount, setPageCount] = useState(1);
  const pageSize = preferences.pageSize;
  const onClearFilter = () => {
    setFilteringText('');
    setDelayedFilteringText('');
    setFilteringQuery(DEFAULT_FILTERING_QUERY);

  };
  const onSortingChange = event => {
    setDescendingSorting(event.detail.isDescending);
    setSortingColumn(event.detail.sortingColumn);
  };
  const params = {
    pagination: {
      currentPageIndex,
      pageSize,
    },
    sorting: {
      sortingColumn,
      sortingDescending: descendingSorting,
    },
    header:headers,
    userinfo:userInfo,
    filtering: {
      filteringText: delayedFilteringText,
      filteringTokens: filteringQuery.tokens,
      filteringOperation: filteringQuery.operation,
    },
  };
  const { items, loading, totalCount, pagesCount, currentPageIndex: serverPageIndex ,refreshAction} = useDistributions(params);
  useEffect(() => {
    setSelectedItems(oldSelected => intersection(items, oldSelected));
  }, [items]);

  const handlePropertyFilteringChange = ({ detail }) => {setFilteringQuery(detail)};
  return (
    <Table
      onSelectionChange={({ detail }) =>
        setSelectedItems(detail.selectedItems)
      }
      onSortingChange={onSortingChange}
      sortingColumn={sortingColumn}
      sortingDescending={descendingSorting}
      
      selectedItems={selectedItems}
      ariaLabels={{
        selectionGroupLabel: "Items selection",
        allItemsSelectionLabel: ({ selectedItems }) =>
          `${selectedItems.length} ${
            selectedItems.length === 1 ? "item" : "items"
          } selected`,
        itemSelectionLabel: ({ selectedItems }, item) => {
          const isItemSelected = selectedItems.filter(
            i => i.name === item.name
          ).length;
          return `${item.name} is ${
            isItemSelected ? "" : "not"
          } selected`;
        }
      }}
      columnDefinitions={columnDefinitions}
      visibleColumns={preferences.visibleContent}
      items={items}
      selectionType="single"
      loading = {loading}
      loadingText = {"Loading"}
      empty={<TableNoMatchState onClearFilter={onClearFilter} />}
      filter={
        // <TextFilter
        //   filteringText={filteringText}
        //   onChange={({ detail }) => setFilteringText(detail.filteringText)}
        //   onDelayedChange={() => setDelayedFilteringText(filteringText)}
        //   filteringAriaLabel="Filter"
        //   filteringPlaceholder="Find"
        //   countText={getServerFilterCounterText(items, pagesCount, pageSize)}
        // />
        <PropertyFilter
          i18nStrings={PROPERTY_FILTERING_I18N_CONSTANTS}
          filteringProperties={FILTERING_PROPERTIES}
          query={filteringQuery}
          onChange={handlePropertyFilteringChange}
          countText={`${getServerFilterCounterText(items, pagesCount, pageSize)}`}
          expandToViewport={true}
        />
      }
      variant="full-page"
      stickyHeader={true}
      resizableColumns={true}
      onColumnWidthsChange={saveWidths}
      wrapLines={preferences.wrapLines}
      header={
        <FullPageHeader
          selectedItems={selectedItems}
          totalItems={totalCount}
          serverSide={true}
          resourceName={resourceName}
          createButtonText={buttonName}
          refreshAction={refreshAction}
          href={buttonHref}
        />
      }
 
      
      pagination={<Pagination 
                  currentPageIndex={serverPageIndex}
                  pagesCount={pagesCount} 
                  onChange={({ detail }) =>
                      setCurrentPageIndex(detail.currentPageIndex)
                  }
                  ariaLabels={paginationLabels} />}
      preferences={<Preferences preferences={preferences} setPreferences={setPreferences} />}
    />
  );
}

export default function SubscriptionList () {
  const appLayout = useRef();
  const {notificationitems} = useSimpleNotifications();
  const [toolsOpen, setToolsOpen] = useState(false);
  return (
    <CustomAppLayout
      ref={appLayout}
      navigation={<Navigation activeHref={'/subscription-list'} />}
      notifications={<Flashbar items={notificationitems} />}
      breadcrumbs={<Breadcrumbs />}
      content={<TableContent 
                resourceName="Subscriptions"
            />}
      contentType="table"
      stickyNotifications
      tools={<ToolsContent />}
      toolsOpen={toolsOpen}
      onToolsChange={({ detail }) => setToolsOpen(detail.open)}
    />
  );
}
