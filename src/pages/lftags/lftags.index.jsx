// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React, {  useRef, useState, useEffect} from 'react';
import { COLUMN_DEFINITIONS, DEFAULT_PREFERENCES, Preferences } from './table-config';
import { Button, Flashbar, Pagination, Table, TextFilter,
  Modal,
  Box ,
  FormField,
  Input,
  Grid,
  SpaceBetween,
  TokenGroup,
  Form} from '@cloudscape-design/components';
import { FullPageHeader ,Breadcrumbs,lftag_string} from './common-components';
import {
  CustomAppLayout,
  Navigation,
  TableNoMatchState,
  ToolsContent,
  TableEmptyState,
} from '../commons/common-components';
import { paginationLabels } from '../../common/labels';
import { getFilterCounterText } from '../../common/tableCounterStrings';

import { useColumnWidths } from '../commons/use-column-widths';
import { useLocalStorage } from '../../common/localStorage';
import {useSimpleNotifications} from '../commons/use-notifications';
import {useAuthorizedHeader,useAuthUserInfo} from "../commons/use-auth";
import { useCollection } from '@cloudscape-design/collection-hooks';
import {remotePostCall,API_listlftags,API_addlftag} from '../commons/api-gateway';


const AddTagButton = ({action}) =>{
return (
  <Button iconName="add-plus" variant="primary"
    onClick={(e)=>{
      // console.log('click');
      e.preventDefault();
      action(true);
      }}
   >Add</Button>
)
}


const AddLFTagPanel = ({setVisible})=>{
  const [inputKey, setInputKey] = useState();
  const [inputValue, setInputValue] = useState();
  const [items, setItems] = useState([]);
  const headers = useAuthorizedHeader();
  const { setNotificationItems } = useSimpleNotifications();
  const [loading,setLoading] = useState(false);
  const msgid = Math.random().toString(16);
  return(
    <form onSubmit={e=>{
      e.preventDefault();
      setLoading(true);
      const body = {
        tagkey:inputKey,
        tagvalues:items.map(it=>it.label),
      }
      remotePostCall(headers,API_addlftag,body)
      .then(data =>{
        setLoading(false);
        setNotificationItems(item =>([...item,
        {
        header: `Submit request success`,
        type: "success",
        content:`Add LF-Tags [${inputKey}] success`,
        dismissible: true,
        dismissLabel: "Dismiss message",
        onDismiss: () => setNotificationItems(items =>
                items.filter(item => item.id !== msgid)),
        id: msgid
        }]));
        setVisible(false);
      }).catch(err =>{
        setLoading(false);
        setNotificationItems(item =>([...item,
        {
        header: `Submit request failed`,
        type: "error",
        content:`Add LF-Tags failed: ${err}`,
        dismissible: true,
        dismissLabel: "Dismiss message",
        onDismiss: () => setNotificationItems(items =>
                items.filter(item => item.id !== msgid)),
        id: msgid
        }]));
        setVisible(false);
      })

    }}>
    <Form
        variant="h2"
          actions={
            <SpaceBetween size="xs" direction="horizontal">
             <Button formAction="none"
             onClick={()=>setVisible(false)}
              variant="link">
              Cancel
            </Button>
            <Button  loading={loading} variant="primary">Add LF-Tags</Button>
            </SpaceBetween>
          }    
    >
    <SpaceBetween direction="vertical" size="xs">
      <Box>{"LF-Tags have a key and one or more values that can be associated with data catalog resources. Tables automatically inherit from database LF-tags, and columns inherit from table LF-tags.Example: Key = Confidentiality | Values = private, sensitive, public"}</Box>
      <Grid  gridDefinition={[{ colspan: 10 }, { colspan: 2 },]}
      >
      <FormField
      description="Key string must be less than 50 characters long, and cannot be changed once LF-tag is created."
      label="Key"
    >
      <Input
        value={inputKey}
        onChange={event =>
          setInputKey(event.detail.value)
        }
      />
      </FormField>
      <div/>  
      </Grid>
      <FormField
      description="Type a single value and select [Enter] or specify multiple values separated by commas."
      label="Values"
    >
    
    <Grid  gridDefinition={[{ colspan: 8 }, { colspan: 4 },]}>
      <Input
        value={inputValue}
        onChange={event =>
          setInputValue(event.detail.value)
        }
      />
      <Button onClick={e => {
          e.preventDefault();
          if (!inputValue) return;
          const values = inputValue.split(',');
          values.map(val =>{
            return val !== ''?setItems(prev => [...prev, {label:val,dismissLabel:"Remove "+val}]):'';
          }  
          );
          setInputValue('');
      }}
      >Add</Button>
      </Grid>
      </FormField>

      <TokenGroup
        onDismiss={({ detail: { itemIndex } }) => {
          setItems([
            ...items.slice(0, itemIndex),
            ...items.slice(itemIndex + 1)
          ]);
        }}
        items={items}
      />
    </SpaceBetween>
    </Form>
    </form>
    
  )
}

const ModalPopup =({visible,setVisible}) =>{
  
  
  return (
    <Modal
      onDismiss={() => setVisible(false)}
      visible={visible}
      closeAriaLabel="Close modal"
      header="Add LF-Tags"
    >
      <AddLFTagPanel setVisible={setVisible}/>
    </Modal>
  );
}


const TableContent = ({ 
  resourceName,
  distributions=[],
  loading,
 }) =>{
  

  const [visible, setVisible] = useState(false);
  const [preferences, setPreferences] = useLocalStorage('LFTags-Table-Preferences', DEFAULT_PREFERENCES);
  const [columnDefinitions, saveWidths] = useColumnWidths('React-Table-Widths', COLUMN_DEFINITIONS);
  const { items, actions, filteredItemsCount, collectionProps, filterProps, paginationProps } = useCollection(
    distributions,
    {
      filtering: {
        empty: <TableEmptyState resourceName={resourceName} />,
        noMatch: <TableNoMatchState onClearFilter={() => actions.setFiltering('')} />,
      },
      pagination: { pageSize: preferences.pageSize },
      sorting: { defaultState: { sortingColumn: columnDefinitions[0] } },
      selection: {},
    }
  );

  
  return (
    <div>
    <ModalPopup 
      visible = {visible}
      setVisible = {setVisible}
    />
    <Table
    {...collectionProps}
    loading={loading}
    columnDefinitions={columnDefinitions}
    visibleColumns={preferences.visibleContent}
    items={items}
    selectionType="single"
    ariaLabels={{
            itemSelectionLabel: (data, row) => `select ${row.id}`,
            allItemsSelectionLabel: () => 'select all',
            selectionGroupLabel: 'selection',
    }}
    variant="full-page"
    stickyHeader={true}
    resizableColumns={true}
    onColumnWidthsChange={saveWidths}
    wrapLines={preferences.wrapLines}
    header={
      <FullPageHeader
        resourceName = 'LF Tags'
        addTagButton = <AddTagButton action={setVisible}/>
        selectedItems={collectionProps.selectedItems}
        totalItems={distributions}
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
    preferences={<Preferences preferences={preferences} setPreferences={setPreferences} />}
  />
  </div>
  );
}

export default function Lftagslist () {
  const appLayout = useRef();
  const {notificationitems} = useSimpleNotifications();
  const [toolsOpen, setToolsOpen] = useState(false);
  const headers = useAuthorizedHeader();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    let controller = new AbortController();
    const fetchData = async() =>{
      const payload = {};
      try {
        const data = await remotePostCall(headers, API_listlftags, payload,controller);
        setItems(data);
        setLoading(false);

      }catch(err){
        console.log(err);
        // setLoading(false);
      }
    }
    fetchData();
    return () => {
      controller.abort();
    };
  }, []);

  return (
    <CustomAppLayout
      ref={appLayout}
      navigation={<Navigation activeHref={'/catalog/lftags'} />}
      notifications={<Flashbar items={notificationitems} />}
      breadcrumbs={<Breadcrumbs />}
      content={<TableContent 
                resourceName="LF Tags"
                distributions={items}
                loading={loading}
            />}
      contentType="table"
      stickyNotifications
      tools={<ToolsContent />}
      toolsOpen={toolsOpen}
      onToolsChange={({ detail }) => setToolsOpen(detail.open)}
    />
  );
}
