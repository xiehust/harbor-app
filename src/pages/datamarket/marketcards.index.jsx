// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React, { useState, useEffect, useRef } from 'react';
import { useCollection } from '@cloudscape-design/collection-hooks';
import { CARD_DEFINITIONS, CARD_CONFIG,VISIBLE_CONTENT_OPTIONS, PAGE_SIZE_OPTIONS, DEFAULT_PREFERENCES } from './cards-config';
import { Cards, CollectionPreferences, Pagination, TextFilter,Flashbar,PropertyFilter } from '@cloudscape-design/components';
import { Breadcrumbs, ToolsContent, FullPageHeader } from './common-components';
import {useAuthorizedHeader} from '../commons/use-auth';
import { useDistributions } from './hooks';
import { getServerFilterCounterText } from '../../common/tableCounterStrings';
import {
  CustomAppLayout,
  Navigation,
  TableNoMatchState,
} from '../commons/common-components';
import { paginationLabels } from '../../common/labels';
import { useLocalStorage } from '../../common/localStorage';
import {useSimpleNotifications} from '../commons/use-notifications';
import intersection from 'lodash/intersection';
import { FILTERING_PROPERTIES,tablelistColumnDefinitions} from './table-config';
import {PROPERTY_FILTERING_I18N_CONSTANTS} from '../../common/i18nStrings';

const DEFAULT_FILTERING_QUERY = { tokens: [], operation: 'and' };


function DetailsCards() {
  const [preferences, setPreferences] = useLocalStorage('React-Cards-Preferences', DEFAULT_PREFERENCES);
  const [selectedItems,setSelectedItems] = useState([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(1);
  const [filteringText, setFilteringText] = useState('');
  const [sortingColumn, setSortingColumn] = useState(tablelistColumnDefinitions[0]);
  const [descendingSorting, setDescendingSorting] = useState(true);
  const [delayedFilteringText, setDelayedFilteringText] = useState('');
  const [filteringQuery, setFilteringQuery] = useState(DEFAULT_FILTERING_QUERY);
  const headers = useAuthorizedHeader();
  const pageSize = preferences.pageSize;
  const onClearFilter = () => {
    setFilteringText('');
    setDelayedFilteringText('');
    setFilteringQuery(DEFAULT_FILTERING_QUERY);

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

  return (
    <Cards
      stickyHeader={true}
      cardDefinition={CARD_DEFINITIONS}
      visibleSections={preferences.visibleContent}
      loading={loading}
      loadingText="Loading items"
      cardsPerRow={CARD_CONFIG}
      items={items}
      selectionType="multi"
      onSelectionChange={({ detail }) =>
        setSelectedItems(detail.selectedItems)
      }
      variant="full-page"
      selectedItems={selectedItems}
      // variant="container"
      ariaLabels={{
        itemSelectionLabel: (e, t) => `select ${t.name}`,
        selectionGroupLabel: "Item selection"
      }}
      header={
        <FullPageHeader
          selectedItems={selectedItems}
          totalItems={totalCount}
          serverSide={true}
          refreshAction={refreshAction}
        />
      }
      empty={<TableNoMatchState onClearFilter={onClearFilter} />}
      filter={
      // <TextFilter
      //     filteringText={filteringText}
      //     onChange={({ detail }) => setFilteringText(detail.filteringText)}
      //     onDelayedChange={() => setDelayedFilteringText(filteringText)}
      //     filteringAriaLabel="Filter"
      //     filteringPlaceholder="Find"
      //     countText={getServerFilterCounterText(items, pagesCount, pageSize)}
      //   />
      <PropertyFilter
          i18nStrings={PROPERTY_FILTERING_I18N_CONSTANTS}
          filteringProperties={FILTERING_PROPERTIES}
          query={filteringQuery}
          onChange={handlePropertyFilteringChange}
          countText={`${getServerFilterCounterText(items, pagesCount, pageSize)}`}
          expandToViewport={true}
        />
  
      }
      pagination={<Pagination 
                  currentPageIndex={serverPageIndex}
                  pagesCount={pagesCount} 
                  onChange={({ detail }) =>
                      setCurrentPageIndex(detail.currentPageIndex)
                  }
                  ariaLabels={paginationLabels} />}
      preferences={
        <CollectionPreferences
          title="Preferences"
          confirmLabel="Confirm"
          cancelLabel="Cancel"
          disabled={loading}
          preferences={preferences}
          onConfirm={({ detail }) => setPreferences(detail)}
          pageSizePreference={{
            title: 'Page size',
            options: PAGE_SIZE_OPTIONS,
          }}
          visibleContentPreference={{
            title: 'Select visible columns',
            options: VISIBLE_CONTENT_OPTIONS,
          }}
          
        />
      }
    />
  );
}

export default function MarketApp() {  
  const appLayout = useRef();
  const {notificationitems} = useSimpleNotifications();
  const [toolsOpen, setToolsOpen] = useState(false);

  return (
    <CustomAppLayout
      ref={appLayout}
      navigation={<Navigation activeHref="/datamarket" />}
      notifications={<Flashbar items={notificationitems} />}
      //notifications={<Notifications successNotification={false} />}
      breadcrumbs={<Breadcrumbs />}
      content={
        <DetailsCards
        />
      }
      contentType="cards"
      stickyNotifications={true}
      toolsOpen={toolsOpen}
      tools={<ToolsContent />}
      onToolsChange={({ detail }) => setToolsOpen(detail.open)}
    />
  );
}


