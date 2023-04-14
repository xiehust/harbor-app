// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React, { useEffect, useRef, useState } from 'react';
import {  COLUMN_DEFINITIONS, DEFAULT_PREFERENCES, Preferences } from './table-config';
import { Flashbar, Pagination, Table, TextFilter,PropertyFilter } from '@cloudscape-design/components';
import { FullPageHeader ,Breadcrumbs,} from './common-components';
import {
  CustomAppLayout,
  Navigation,
  Notifications,
  TableEmptyState,
  TableNoMatchState,
  ToolsContent,
} from '../commons/common-components';
import { paginationLabels, distributionSelectionLabels } from '../../common/labels';
import { getServerFilterCounterText } from '../../common/tableCounterStrings';
import { getFilterCounterText } from '../../common/tableCounterStrings';
import { useColumnWidths } from '../commons/use-column-widths';
import { useLocalStorage } from '../../common/localStorage';
import {useSimpleNotifications} from '../commons/use-notifications';
import {useAuthorizedHeader,useAuthUserInfo} from "../commons/use-auth";
import {useDistributions} from "./hooks";
import intersection from 'lodash/intersection';
import { FILTERING_PROPERTIES,} from './table-config';
import {PROPERTY_FILTERING_I18N_CONSTANTS} from '../../common/i18nStrings';


const DEFAULT_FILTERING_QUERY = { tokens: [], operation: 'and' };

export function TableContent({ 
  resourceName,
  buttonName,
  buttonHref,
 }) {
  const [selectedItems, setSelectedItems] = useState([]);
  const [preferences, setPreferences] = useLocalStorage('React-Glue-Table-Preferences', DEFAULT_PREFERENCES);
  const [currentPageIndex, setCurrentPageIndex] = useState(1);
  const [filteringText, setFilteringText] = useState('');
  const [delayedFilteringText, setDelayedFilteringText] = useState('');
  const [sortingColumn, setSortingColumn] = useState(COLUMN_DEFINITIONS[0]);
  const [descendingSorting, setDescendingSorting] = useState(true);
  const headers = useAuthorizedHeader();
  const [columnDefinitions, saveWidths] = useColumnWidths('React-Table-Widths', COLUMN_DEFINITIONS);
  const [filteringQuery, setFilteringQuery] = useState(DEFAULT_FILTERING_QUERY);

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
    filtering: {
      filteringText: delayedFilteringText,
      filteringTokens: filteringQuery.tokens,
      filteringOperation: filteringQuery.operation,
    },
  };
  const { items, loading, totalCount, pagesCount, currentPageIndex: serverPageIndex,refreshAction } = useDistributions(params);

  useEffect(() => {
    setSelectedItems(oldSelected => intersection(items, oldSelected));
  }, [items]);

  const handlePropertyFilteringChange = ({ detail }) => { setFilteringQuery(detail)};

  function handleAddClick(event){
    event.preventDefault();
  }
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
          handleAddClick={handleAddClick}
          href={buttonHref}
          refreshAction={refreshAction}
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

export default function GlueTable () {
  const [toolsOpen, setToolsOpen] = useState(false);
  const appLayout = useRef();
  const {notificationitems} = useSimpleNotifications();

  return (
    <CustomAppLayout
      ref={appLayout}
      navigation={<Navigation activeHref={'/catalog/tables'} />}
      notifications={<Flashbar items={notificationitems} />}
      breadcrumbs={<Breadcrumbs />}
      content={<TableContent 
                resourceName="Tables"
                buttonName = "Add"
                buttonHref="/catalog/creattable"
            />}
      contentType="table"
      toolsOpen={toolsOpen}
      tools={<ToolsContent/>}
      onToolsChange={({ detail }) => setToolsOpen(detail.open)}
      stickyNotifications
    />
  );
}
