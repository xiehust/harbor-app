import React, { createContext,useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { API_fetchGlueTable } from "../commons/api-gateway";
import {useAuthorizedHeader} from "../commons/use-auth";
import { useCollection } from '@cloudscape-design/collection-hooks';
import { remotePostCall, API_getlftagByResource} from "../commons/api-gateway";
import {
  CustomAppLayout,
  Navigation,
  TableEmptyState,
  TableNoMatchState,
} from '../commons/common-components';
import { useLocalStorage } from '../../common/localStorage';
import {BreadcrumbsDynmic} from "./common-components";
import {
    Pagination,
  Container,
  Header,
  TextFilter,
  Select,
  SpaceBetween,
  Box,
  Button,
  ColumnLayout,
  ContentLayout,
  Link,
  Table,
  Spinner,
} from "@cloudscape-design/components";
import { getFilterCounterText } from '../../common/tableCounterStrings';
import { useColumnWidths } from '../commons/use-column-widths';
import { paginationLabels } from '../../common/labels';
import {TableHeader} from '../commons/common-components';
import {ConsumerPanel} from '../commons/common-panels';
import {
  LFTAG_PREFERENCES,
  LFTAG_COLUMN_DEFINITIONS,
  schemaColumnDefinitions,
  Schema_PREFERENCES,
  Preferences} from './table-config';



const GlueTableHeader = ({tableName,content,setSelectedVersion}) =>{
    var options = content.map(v =>({label:"Version "+v.versionid,
    value:v.versionid,
    description:"Updated:"+v.updatetime,
    }))
    options[0] = {...options[0],label:"Version (Current version) "+content[0].versionid};
    options[options.length-1] = {...options[options.length-1],
        description:"Created:"+content[content.length-1].createtime,
        tags:["Createdby:"+content[content.length-1].createby]}
    const [
        selectedOption,
        setSelectedOption
      ] = useState(options[0]);
    return (
        <Header
        variant="h2"
        actions={
          <SpaceBetween size="xs" direction="horizontal">
            <Button
              onClick={(e) => {
                e.preventDefault();
              }}
            >
              Compare versions
            </Button>
            <Select
            options={options}
            selectedOption={selectedOption}
            onChange={({ detail }) =>{
                setSelectedOption(detail.selectedOption);
                setSelectedVersion(detail.selectedOption.value);
            }
            }
            expandToViewport
            selectedAriaLabel="Selected"
            />
            </SpaceBetween>
        }
      >
        Name: {tableName}
      </Header>
    )
}

const DetailPanel = ({content}) =>{
    return(
        <Container header={<Header variant="h2">Details</Header>}>
          <ColumnLayout columns={2} variant="text-grid">
            <div>
              <Box variant="awsui-key-label">Data location</Box>
              <Link external href={content.s3_location}>{content.s3_location}</Link>
            </div>
            <div>
              <Box variant="awsui-key-label">Database</Box>
              <Link href={'/catalog/databases/'+content.db_name}>{content.db_name}</Link>
            </div>
            <div>
              <Box variant="awsui-key-label">Created time</Box>
              <div>{content.created}</div>
            </div>
            <div>
              <Box variant="awsui-key-label">Last updated time</Box>
              <div>{content.lastupdated}</div>
            </div>
            <div>
              <Box variant="awsui-key-label">Governance</Box>
              <div>Disabled</div>
            </div>
            <div>
              <Box variant="awsui-key-label">Data format</Box>
              <div>{content.format||"--"}</div>
            </div>
            <div>
              <Box variant="awsui-key-label">Description</Box>
              <div>{content.description||"--"}</div>
            </div>
          </ColumnLayout>
        </Container>
    )
}

const LFTagsPanel = ({dbName,tableName})=>{
  const [columnDefinitions, saveWidths] = useColumnWidths('React-Table-Widths', LFTAG_COLUMN_DEFINITIONS);
  const [preferences, setPreferences] = useLocalStorage('React-LFTagsPanel-Preferences', LFTAG_PREFERENCES);
  const [data, setData] = useState([]);
  const headers = useAuthorizedHeader();
  const [loading, setLoading] = useState(true);

  useEffect(()=>{ 
    const controller = new AbortController();
    const payload = {
      type:'table', 
      params:{
        database:dbName,
        table:tableName,
      }
    };
    const fetchData = async() =>{
      try {
        const data = await remotePostCall(headers,API_getlftagByResource,payload,controller);
        let tempdata =[];
        let sn = 1;
        if (data.LFTagsOnTable) {
          tempdata = data.LFTagsOnTable.map(v=> ({...v,sn:sn++, 
            column:'*',
            table:tableName,
            database:dbName,
            resource:tableName+' (table)'}));
        }
        if (data.LFTagsOnColumns) {
          data.LFTagsOnColumns.map(v1=>(
              v1.LFTags.map(v2 => (tempdata.push({...v2,sn:sn++,
                column:v1.Name, 
                table:tableName,
                database:dbName,
                resource:v1.Name+' (column)'})))
          ));
          // tempdata = [...tempdata,data.LFTagsOnColumns.map(v=> ({...v,sn:sn++, resource:'columns'}))];
        }
        // console.log(tempdata);
        setData(tempdata);
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
      loading={loading}
      loadingText='loading'
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
      // stickyHeader={true}
      resizableColumns={true}
      onColumnWidthsChange={saveWidths}
      wrapLines={preferences.wrapLines}
      header={
        <TableHeader
          selectedItems={collectionProps.selectedItems}
          totalItems={items}
          // actionButtons={
          //   <Button>Edit</Button>
          // }
          title='LF-Tags'
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
                  { id: 'sn', label: '#' ,editable: false},
                  { id: 'resource', label: 'Resource', },
                  { id: 'tagkey', label: 'Key' },
                  { id: 'tagvalues', label: 'Values' },
                ],
              },
            ]
         } 
       preferences={preferences}
       setPreferences={setPreferences} />}
    />
  );
}


const SchemaPanel = ({total_columns}) =>{
    // const [items, setItems] = useState([]);
    // console.log(total_columns);
    const [columnDefinitions, saveWidths] = useColumnWidths('Table-List-Widths', schemaColumnDefinitions);
    const [preferences, setPreferences] = useLocalStorage('React-SchemaPanel-Preferences', Schema_PREFERENCES);

    const { items, actions, filteredItemsCount, collectionProps, filterProps, paginationProps } = useCollection(
      total_columns,
      {
        filtering: {
          empty: <TableEmptyState resourceName="Column" />,
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
          selectionGroupLabel: 'column selection',
      }}
        // variant="full-page"
        stickyHeader={true}
        resizableColumns={true}
        onColumnWidthsChange={saveWidths}
        wrapLines={preferences.wrapLines}
        header={
          <TableHeader
            selectedItems={collectionProps.selectedItems}
            totalItems={items}
            title='Schema'
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
                  { id: 'sn', label: '#' ,editable: false},
                  { id: 'column', label: 'Column Name', },
                  { id: 'dtype', label: 'Data type' },
                  { id: 'pkey', label: 'Partition key' },
                  { id: 'comment', label: 'Comment' },
                  { id: 'lftags', label: 'LF-Tags' },
                ],
              },
            ]
         } 

           preferences={preferences}
             setPreferences={setPreferences} />}
      />
    );

}
const ContentPanel =({dbName,tableName, content})=>{
    const [selectedVersion, setSelectedVersion] = useState();
    let sn = 0;
    let colstagsmap = new Map();

    //if columns have lftags, convert tagsvalues into Map().
    // console.log(content.tagsmap);
    if(content.tagsmap){
      content.tagsmap.map(v=>(colstagsmap.set(v.Name, v.LFTags.map(val => ({TagKey:val.TagKey, TagValues:val.TagValues})))));
    }

    let total_columns = content.detail.Table.StorageDescriptor.Columns.map( v=>({
      sn:++sn,
      column:v.Name,
      dtype:v.Type,
      comment:v.Comment,
      lftags: colstagsmap.has(v.Name)?JSON.stringify(colstagsmap.get(v.Name)):'-'
    }) );
    

    return (
        <ContentLayout
        header={
            <GlueTableHeader id={dbName} 
                content={content.versions}
                setSelectedVersion={setSelectedVersion}/>
        }
      >
      <SpaceBetween size="l">
            <DetailPanel content={content.summary}/>
            <SchemaPanel dbName={dbName} tableName={tableName} total_columns={total_columns} />
            <LFTagsPanel dbName={dbName} tableName={tableName} />
            <ConsumerPanel dbName={dbName} tableName={tableName} type={'table'} />
      </SpaceBetween>
      </ContentLayout>
    )

}
const TableDetail = ()=>{
    const {dbName, tbName} = useParams();
    const [details, setDetails] = useState();
    const appLayout = useRef();
    const headers = useAuthorizedHeader();

    useEffect(()=>{
      const controller = new AbortController();
      const payload = {
        db_name:dbName,
        table_name:tbName
      };
      const fetchData = async() =>{
        try {
          const data = await remotePostCall(headers,API_fetchGlueTable,payload,controller);
          setDetails(data);
        }catch(err){
          console.error(err);
        }
      }
      fetchData();
      return ()=>controller.abort();
   },[])

   return (
       <CustomAppLayout
       ref={appLayout}
       navigation={<Navigation activeHref="/catalog/tables" />}
       breadcrumbs={<BreadcrumbsDynmic id={tbName} />}
       content={details?(<ContentPanel dbName={dbName} tableName={tbName} content={details}/>):( <Spinner size="large"/>)}
       contentType="table"
       stickyNotifications
       />
   );

}

export default TableDetail;