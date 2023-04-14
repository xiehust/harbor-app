import React, { createContext,useState, useRef, useEffect,useContext, } from "react";
import { useParams } from "react-router-dom";
import { Breadcrumbs} from "./common-components";
import {
  tablelistColumnDefinitions,
    TABLES_DEFAULT_PREFERENCES,Preferences } from "./table-config";
import { CustomAppLayout,
     Navigation ,  
     TableEmptyState,
    TableNoMatchState,} from "../commons/common-components";
import {fetchGlueTablebyId,fetchGlueTable,remotePostCall,API_getlftagByResource} from "../commons/api-gateway";
import { useAuthorizedHeader, useAuthUserInfo } from "../commons/use-auth";
import { useCollection } from '@cloudscape-design/collection-hooks';
import { paginationLabels, distributionSelectionLabels } from '../../common/labels';
import { getFilterCounterText } from '../../common/tableCounterStrings';
import {makeSubscription} from '../commons/api-gateway';
import {useNavigate} from 'react-router-dom';
import { useColumnWidths } from '../commons/use-column-widths';
import { useLocalStorage } from '../../common/localStorage';
import {
    Pagination,
    Select,
  Container,
  Header,
  SpaceBetween,
  Spinner,
  Box,
  Button,
  ColumnLayout,
  Form,
  Textarea,
  Flashbar,
  Checkbox,
  Multiselect,
  Tabs,
  Tiles,
  FormField,
  TextFilter,
  Badge,
  RadioGroup,
  Table,DatePicker, Link,
} from "@cloudscape-design/components";
import {useSimpleNotifications} from '../commons/use-notifications';
import {formatDate} from '../commons/utils';
import {LFTAG_PREFERENCES,LFTAG_COLUMN_DEFINITIONS,DEFAULT_Tags_Filter} from './table-config';
import {TableHeader} from '../commons/common-components';


const formDataCtx = createContext();


const TablePanel = ({tables}) =>{
  const {formData,setFormData}= useContext(formDataCtx);
  const [columnDefinitions, saveWidths] = useColumnWidths('React-SubsTable-Widths', tablelistColumnDefinitions);
  const [preferences, setPreferences] = useLocalStorage('React-SubsTable-Preferences', TABLES_DEFAULT_PREFERENCES);
  const { items, actions, filteredItemsCount, collectionProps, filterProps, paginationProps } = useCollection(
    tables,
    {
      filtering: {
        empty: <TableEmptyState resourceName="Tables" />,
        noMatch: <TableNoMatchState onClearFilter={() => actions.setFiltering('')} />,
      },
      pagination: { pageSize: preferences.pageSize },
      sorting: { defaultState: { sortingColumn: columnDefinitions[0] } },
      selection: {defaultSelectedItems:formData.selectedItems,
        trackBy:'id'},
    }
  );

  const onSelectChange = (e)=>{
    e.preventDefault();
    collectionProps.onSelectionChange(e);
    setFormData( prev => ({...prev,selectedItems:e.detail.selectedItems}))
  }
  // console.log(formData,collectionProps.selectedItems);

  return (
    <Table
      {...collectionProps}
      selectedItems = {formData.selectedItems}
      onSelectionChange={onSelectChange}
      columnDefinitions={columnDefinitions}
      visibleColumns={preferences.visibleContent}
      items={items}
      selectionType="multi"
      ariaLabels={distributionSelectionLabels}
      // stickyHeader={true}
      resizableColumns={true}
      onColumnWidthsChange={saveWidths}
      wrapLines={preferences.wrapLines}
      header={
        <Header
        counter={
            '('+formData.selectedItems.length+'/'+tables.length+')'
        }
        >Tables</Header>
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
  );

}

const PermiTypePanel = ({disabled}) =>{
  const {formData,setFormData}= useContext(formDataCtx);
    return (
      <Container header={<Header variant="h2">Type</Header>}>
      <FormField
      label="Request type"
      stretch={true}
    >
  <Tiles
        items={[
          {
            value: 'all',
            label: 'All data access',
            description: 'Grant access to all data (with tag filter applied optional).',
          },
          {
            value: 'column',
            label: 'Column-based access',
            description:'Grant data access to specific columns only.',
          },
        ]}
        value={formData.permissiontype}
        onChange={e => setFormData(prev => ({...prev,permissiontype:e.detail.value}))}
      />
    </FormField>
      </Container>
    )
}


const PermissionFormPanel =({disabled}) =>{
  const {formData,setFormData}= useContext(formDataCtx);
  const [checked1, setChecked1] = useState(formData.permissions[0].select);
  const [checked2, setChecked2] = useState(formData.permissions[0].desc);
  const [checked5, setChecked5] = useState(formData.permissions[1].select);
  const [checked6, setChecked6] = useState(formData.permissions[1].desc);
  const [checked7, setChecked7] = useState(false);

  return (
    <Container header={<Header variant="h2">Permission</Header>}>
      <SpaceBetween  size="s">
      <ColumnLayout columns={2} variant="text-grid">
        <FormField label="Table permission" description="Choose specific access permissions to grant">
          <Checkbox 
          onChange={({detail}) => {
            setChecked1(detail.checked);
            setFormData(prev => ({
            ...prev,
            permissions:[{type:"subscribe",select:checked1,desc:checked2},
                          {type:"subscribe-grant",select:checked5,desc:checked6}]
            }));
          }}
          checked={checked1}
          disabled={disabled}
        >
          Select
        </Checkbox>
        <Checkbox 
           onChange={({detail}) => {
            setChecked2(detail.checked);
            setFormData(prev => ({
            ...prev,
            permissions:[{type:"subscribe",select:checked1,desc:checked2},
                          {type:"subscribe-grant",select:checked5,desc:checked6}]
            }));
          }}
          checked={checked2}
          disabled={disabled}
        >
          Describe
        </Checkbox>
        </FormField>
        <FormField label="Grantable permission" description="Choose the permission that may be granted to others">
        <Checkbox 
           onChange={({detail}) => {
            setChecked5(detail.checked);
            setFormData(prev => ({
            ...prev,
            permissions:[{type:"subscribe",select:checked1,desc:checked2},
                          {type:"subscribe-grant",select:checked5,desc:checked6}]
            }));
          }}
          checked={checked5}
          disabled={disabled}
        >
          Select
        </Checkbox>
        <Checkbox 
           onChange={({detail}) => {
            setChecked6(detail.checked);
            setFormData(prev => ({
            ...prev,
            permissions:[{type:"subscribe",select:checked1,desc:checked2},
                          {type:"subscribe-grant",select:checked5,desc:checked6}]
            }));
          }}
          checked={checked6}
          disabled={disabled}
        >
          Describe
        </Checkbox>
        </FormField>
        <FormField label="Expire date"  constraintText="Use YYYY/MM/DD format.">
        <DatePicker
        disabled = {checked7||disabled}
        onChange={({ detail }) => setFormData(prev =>({...prev,expiredate:detail.value}))}
        value={formData.expiredate}
        openCalendarAriaLabel={selectedDate =>
          "Choose expiry date" +
          (selectedDate
            ? `, selected date is ${selectedDate}`
            : "")
        }
        nextMonthAriaLabel="Next month"
        placeholder="YYYY/MM/DD"
        previousMonthAriaLabel="Previous month"
        todayAriaLabel="Today"
      />
        </FormField>
        <FormField label="Long term permission">
        <Checkbox 
           onChange={({detail}) => {
            setChecked7(detail.checked);
            setFormData(prev => ({
            ...prev,
            expiredate: ""
            }));
          }}
          checked={checked7}
          disabled={disabled}
        >
          Is Long term
        </Checkbox>

        </FormField>
      </ColumnLayout>
      </SpaceBetween>
    </Container>
  )
}

const ColumnsPermissionPanel = () =>{
  const {formData}= useContext(formDataCtx);
  const selectedItems = formData.selectedItems;
  const headers = useAuthorizedHeader();
  let params = [];
  const [colDetail, setColDetail] = useState({});
  const [filterTypes, setfilterTypes] = useState({});
  const [selectedOptions, setSelectedOptions] = useState({});

  for (let i =0; i<selectedItems.length;i++){
      params.push({table_name:selectedItems[i].table_name,
                  db_name:selectedItems[i].db_name});
  }
  useEffect(()=>{
    for (let i=0 ; i<params.length ; i++ ){
      fetchGlueTable(headers,params[i].db_name,params[i].table_name)
        .then(data=>{
          setColDetail((prev) =>({...prev,
             [data.summary.id]:data.detail.Table}))
        }).catch(err =>{
           console.error(err);
        })
    }
  },[])

  const tabs = selectedItems.map(it =>(
    {
      label:it.table_name,
      id:it.id,
      database:it.db_name,
      content:
          <TabPanel tableId={it.id} 
              table_name={it.table_name}
              db_name={it.db_name}
              cols={colDetail[it.id]}
              filterTypes = {filterTypes}
              setfilterTypes = {setfilterTypes}
              selectedOptions = {selectedOptions}
              setSelectedOptions ={setSelectedOptions}
              />,
    }
  ));
  return (
    <Tabs
        variant="container"
        tabs={tabs}
    />

  
  )
}

const TabPanel = ({tableId,cols,filterTypes,setfilterTypes,selectedOptions,setSelectedOptions}) =>{

  const {setFormData}= useContext(formDataCtx);
 

  const options = cols? cols.StorageDescriptor.Columns.map( (cols) =>({
     label:cols.Name,
     value:cols.Name,
     tags:[cols.Type]
  })):[];

  const permissionkey = tableId;

  return(
    <div>
      <SpaceBetween direction='vertical' size='m'>
      <Box variant="awsui-key-label">Choose permission filter</Box>
      <RadioGroup onChange={({ detail }) => {
        setfilterTypes( prev => ({...prev,[permissionkey]: detail.value}));
        setFormData((prev)=>({...prev,
                                  data_permissions:{
                                    ...prev.data_permissions,
                                      [permissionkey]:{
                                        ...prev.data_permissions?prev.data_permissions[permissionkey]:undefined,
                                        filtertype:detail.value}}
                                  }))
      }}
        items={[{ value: 'incl', label: "Include columns",description:"Grant permission to access specific columns" },
                { value: 'excl', label: "Exclude columns",description:"Grant permissions to access all but specific columns" },
                  ]}
                  value={filterTypes[permissionkey]}
                />
      <Multiselect selectedOptions={selectedOptions[permissionkey]} 
        onChange={({ detail }) =>{
            setSelectedOptions( prev=> ({...prev, [permissionkey]: detail.selectedOptions}));
            setFormData((prev)=>({...prev,
                                  data_permissions:{
                                       ...prev.data_permissions,
                                      [permissionkey]:{
                                        ...prev.data_permissions?prev.data_permissions[permissionkey]:undefined,
                                        selectedColumns:detail.selectedOptions}}
                                  }))
        }
      }
      options = {options}
      placeholder="Choose one or more columns"
      filteringType="auto"
      selectedAriaLabel={"Selected"+tableId}
      deselectAriaLabel={e => `Remove ${e.label}`}
      />
      </SpaceBetween>
    </div>
  )

}

const PermissionSetTab = ({permissiontype}) =>{
      return(
        permissiontype === 'all'?
        '':<ColumnsPermissionPanel />)
}

const DetailPanel = ({requester})=>{
  return (
    <div>
       <Container header={<Header variant="h2">Details</Header>}>
          <ColumnLayout columns={2} variant="text-grid">
            <div>
              <Box variant="awsui-key-label">Request type</Box>
              <RadioGroup
                  items={[
                    { value: 1, label: "Subscribe" },
                  ]}
                  value={1}
                />
            </div>
            <div>
              <Box variant="awsui-key-label">Resource type</Box>
              <RadioGroup
                  items={[
                    { value: 1, label: "by Named data catalog resources" },
                  ]}
                  value={1}
                />
            </div>
            <div>
              <Box variant="awsui-key-label">Requester</Box>
               <Box  color="text-status-inactive" fontSize="body-m">
               {requester.username +'/'+requester.groupname+'@'+requester.awsid}
               </Box>
            </div>
            <div>
              <Box variant="awsui-key-label">Classification</Box>
                <div>     
                <SpaceBetween direction='horizontal' size='xs'>
                <Badge color='red'>PII</Badge>
                <Badge color='green'>Confidential</Badge>
              </SpaceBetween>
              </div>
            </div>
          </ColumnLayout>
        </Container>
    </div>
  )
}

const LFTagsPanel = ()=>{

  //to trigger state refresh of tagsData, after the inline edit saved.
  const [flag, setFlag]  =useState(false);

  const [columnDefinitions, saveWidths] = useColumnWidths('React-LFTagTable-Widths', LFTAG_COLUMN_DEFINITIONS);
  const [preferences, setPreferences] = useLocalStorage('React-LFTagsPanel-Preferences', LFTAG_PREFERENCES);
  const [tagsData, setTagsData] = useState([]);
  const headers = useAuthorizedHeader();
  const {formData,setFormData}= useContext(formDataCtx);
  const selectedItems = formData.selectedItems;
  const [loading, setLoading] = useState(true); 
  // console.log(formData);

  useEffect(()=>{
    const controller = new AbortController();
    let sn = 1;
    const fetchData = async(dbName,tableName) =>{
      const payload = {
        type:'table', 
        params:{
          database:dbName,
          table:tableName,
        }
      };
      try {
        const data = await remotePostCall(headers,API_getlftagByResource,payload,controller);
        let tempdata =[];

        if (data.LFTagsOnTable) {
          tempdata = data.LFTagsOnTable.map(v=> (
            {...v,
              sn:sn++, 
              type:DEFAULT_Tags_Filter,
            column:'*',
            table:tableName,
            database:dbName,
            resource:tableName+' (table)'}));
        }
        if (data.LFTagsOnColumns) {
          // console.log(data.LFTagsOnColumns);
          data.LFTagsOnColumns.map(v1=>(
              v1.LFTags.map(v2 => (tempdata.push(
                {...v2,
                  sn:sn++,
                  type:DEFAULT_Tags_Filter,
                  column:v1.Name, 
                  table:tableName,
                  database:dbName,
                  resource:v1.Name+' (column)'})))
          ));
        }
        setLoading(false);
        // console.log(tempdata);
        setTagsData(prev => prev.concat(tempdata));
         //save the tags data to form.
        setFormData( prev => ({...prev, tagsfilter:prev.tagsfilter.concat(tempdata)})); 

        }catch(err){
          // setLoading(false);
        console.error(err);
      }
    }

    //fetch tags for every selected tables
    for (let i=0 ; i<selectedItems.length ; i++ ){
      fetchData(selectedItems[i].db_name,selectedItems[i].table_name);
    }
    return ()=>controller.abort();
  },[]);

  useEffect(()=>{
    //save the tags data to form.
    setFormData( prev => ({...prev, tagsfilter:tagsData})); 
  },[flag]);

  const { items, actions, filteredItemsCount, collectionProps, filterProps, paginationProps } = useCollection(
    tagsData,
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
      loading = {loading}
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
      sortingDisabled={true}
      resizableColumns={true}
      onColumnWidthsChange={saveWidths}
      wrapLines={preferences.wrapLines}
      header={
        <TableHeader
          selectedItems={collectionProps.selectedItems}
          totalItems={items}
          title='LF-Tags filters'
          // actionButtons={<Button herf='#' onClick={handleEditTag}>Edit</Button>}
        />
      }
      submitEdit={ async (item,column,newValue) => { 
          await new Promise( (e) => {
              setTimeout(e, 300);
              setTagsData(prev => { 
                    const i= prev.findIndex(e => e.sn === item.sn );
                    prev[i] = {...prev[i],type:newValue};
                    return prev;
              });
              setFlag(prev => !prev);
          } );
        
          
        // setFormData( prev => ({...prev, tagsfilter:tagsData})); 
        // console.log(tagsData);
      }}
      
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
                  { id: 'type', label: 'Type' ,editable: true},
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


const simpleValidateRequest = (formData) =>{
  if (formData.selectedItems.length === 0){
    return [false,'no selected items'];
  }
  if (formData.permissiontype === 'column'){
    if (!formData.data_permissions) return [false,'no any permissions is set'];
    var i = 0;
    for( var key in formData.data_permissions){
        i++;
        var tab = formData.data_permissions[key];
        if( !tab.filtertype || !tab.selectedColumns)
          return [false,'did not choose any column for table:'+key];
    }
    if (i !== formData.selectedItems.length)
      return [false,'some tables permission is not set'];
  }
  return [true,'success'];
}

const handleSumbit=(requestheader,userinfo,formData,setNotificationItems,navigate,setLoading)=>{
  setLoading(true);
  const [valid, errormsg] = simpleValidateRequest(formData);
  const msgid = Math.random().toString(16);
  if (!valid){
    setNotificationItems(item =>([...item,
      {
      header: `Error`,
      type: "error",
      content:`${msgid}:${errormsg}`,
      dismissible: true,
      dismissLabel: "Dismiss message",
      onDismiss: () => setNotificationItems(items =>
              items.filter(item => item.id !== msgid)),
      id: msgid
      }]))
  }
  const nowtime = formatDate(new Date());
  const data = {
          ...formData,
          type:"subscribe",
          groupname:userinfo.groupname,
          groupid:userinfo.groupid,
          username:userinfo.username,
          created: nowtime,
  }
  makeSubscription(requestheader, data)
  .then(data => {
      setLoading(false);
      setNotificationItems(item =>([...item,
        {
        header: `Submit request success`,
        type: "success",
        content:<div>Submit request success, more detail:<Link external href={"/subscription-list/"+data.insertId}>{data.insertId}</Link></div>,
        dismissible: true,
        dismissLabel: "Dismiss message",
        onDismiss: () => setNotificationItems(items =>
                items.filter(item => item.id !== msgid)),
        id: msgid
        }]));
        navigate("/datamarket");
  })
  .catch(error => {
    setLoading(false);
    setNotificationItems(item =>([...item,
      {
      header: `Error`,
      type: "error",
      content:`${error.message}`,
      dismissible: true,
      dismissLabel: "Dismiss message",
      onDismiss: () => setNotificationItems(items =>
              items.filter(item => item.id !== msgid)),
      id: msgid
      }]));
      console.log(error);
  })
}
const JustificationPanel =() =>{
  const {setFormData}= useContext(formDataCtx);
  const [value, setValue] = useState();

  return (
    <Container header={<Header variant="h2">Justification</Header>}>

      <Textarea 
      onChange={({ detail }) => {
        setValue(detail.value);
        setFormData(prev => ({...prev,description:detail.value}))
      }}
      value={value}
      autoFocus
      placeholder="Enter justfication"
     />
    </Container>
  )

}


const ContentPanel = ({ requester, content, isAdmin }) => {
  // console.log('rendering ContentPanel');
  const {setNotificationItems} = useSimpleNotifications();
  const [visible, setVisible] = useState(false);
  const [triggerAction, setTriAction] = useState();
  const navigate = useNavigate();
  const userinfo = useAuthUserInfo();
  const requestheader = useAuthorizedHeader();
  const [formData, setFormData] = useState({permissiontype:'all',
        selectedItems:content.tables,
        permissions:[
              {type:"subscribe",select:true,desc:true},
             {type:"subscribe-grant",select:true,desc:true}
        ]
      });
  const [submitLoading,setSubmitLoading] = useState(false);
  
  return (
    <formDataCtx.Provider value={{formData,setFormData}}>
    {/* <form onSubmit={e => {
      e.preventDefault();
      handleSumbit(requestheader,userinfo,formData,setNotificationItems,navigate);
    }}> */}
     <Form
          variant="h1"
          actions={
            <SpaceBetween size="xs" direction="horizontal">
             <Button formAction="none" variant="link">
             {'Cancel'}
            </Button>
            <Button  disabled={isAdmin} variant="primary" loading={submitLoading}
              onClick={e => {
                  e.preventDefault();
                 handleSumbit(requestheader,userinfo,formData,setNotificationItems,navigate,setSubmitLoading);
                }}
            
            >{'Submit'}</Button>
            </SpaceBetween>
          }
          header={<Header variant="h1">Subscribe</Header>}
        >
        <SpaceBetween size="l">
          <DetailPanel requester = {requester}/>
          <TablePanel tables={content.tables}/>
          <PermiTypePanel />
          <PermissionSetTab permissiontype={formData.permissiontype} selectedItems={formData.selectedItems}/>
          <LFTagsPanel />
          <PermissionFormPanel />
          <JustificationPanel />
        </SpaceBetween>
      </Form>
    {/* </form> */}
    </formDataCtx.Provider>
  );
};

const DataProductDetail = () => {
    const { tableIds } = useParams();
    const {notificationitems} = useSimpleNotifications();
    const appLayout = useRef();
    const [details, setDetails] = useState();
    // const [loading, setLoading] = useState(true);
    const userInfo = useAuthUserInfo();
    const headers = useAuthorizedHeader();
    const isAdmin = userInfo.grouptype === "CENTRAL" ? true : false;
    const groupid = userInfo.groupid;
    useEffect(()=>{
        fetchGlueTablebyId(headers,tableIds,groupid)
         .then(data=>{
            setDetails({
                        tables:data.tables});
            // console.log(data);
         }).catch(err =>{
            console.error(err);
         })
        
    },[])

    return (
        <CustomAppLayout
        ref={appLayout}
        notifications={<Flashbar items={notificationitems} />}
        navigation={<Navigation activeHref="/datamarket" />}
        breadcrumbs={<Breadcrumbs/>}
        content={details?(<ContentPanel requester={userInfo}  content={details} isAdmin={isAdmin} />):<Spinner size="large"/>}
        contentType="table"
        stickyNotifications
        />
    );
};

export default DataProductDetail;
