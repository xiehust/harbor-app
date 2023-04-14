import React, { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { BreadcrumbsDynmic} from "./common-components";
import {tablelistColumnDefinitions,
 } from "./table-config";
import { CustomAppLayout,
     Navigation ,  
     } from "../commons/common-components";
import {API_fetchDatabase,remotePostCall} from "../commons/api-gateway";
import { useAuthorizedHeader, useAuthUserInfo } from "../commons/use-auth";
import {ConsumerPanel} from "../commons/common-panels";
import { useColumnWidths } from '../commons/use-column-widths';
import {
    Pagination,
  Container,
  Header,
  SpaceBetween,
  Box,
  Button,
  Spinner,
  ColumnLayout,
  ContentLayout,
  Link,
  Table,
} from "@cloudscape-design/components";

const PAGE_SIZE = 10;

const TablePanel = ({tables}) =>{
    const [items, setItems] = useState(tables);
    const [columnDefinitions, saveWidths] = useColumnWidths('Table-List-Widths', tablelistColumnDefinitions);
    const [currentPageIndex, setCurrentPageIndex] = useState(1);
    useEffect(()=>{
        const slices = tables.slice((currentPageIndex-1)*PAGE_SIZE,
                                    currentPageIndex*PAGE_SIZE);
        setItems(slices);
    },[tables]);
    
    return (
    <Table
      columnDefinitions={columnDefinitions}
      items={items}
      sortingDisabled
      resizableColumns={true}
      onColumnWidthsChange={saveWidths}
      header={
        <Header
        counter={
            '('+tables.length+')'
        }
        >Tables</Header>
      }
      empty={
                <Box textAlign="center" color="inherit">
                <b>No data</b>
                <Box padding={{ bottom: "s" }} variant="p" color="inherit" >
                    No data to display.
                </Box>
                </Box>
            }
      pagination={
      <Pagination 
            ariaLabels={{
                nextPageLabel: "Next page",
                previousPageLabel: "Previous page",
                pageLabel: pageNumber =>
                `Page ${pageNumber} of all pages`
            }}
            currentPageIndex={currentPageIndex}
            onChange={({ detail }) =>{
                setCurrentPageIndex(detail.currentPageIndex);
                setItems(tables.slice((detail.currentPageIndex-1)*PAGE_SIZE,
                                    detail.currentPageIndex*PAGE_SIZE)
                    );
            }
            }
            pagesCount={Math.ceil(tables.length/PAGE_SIZE) }
       />}
    />
  );    
}



const DetailPanel = ({database})=>{
  return(
    <Container header={<Header variant="h2">Details</Header>}>
          <ColumnLayout columns={2} variant="text-grid">
            <div>
              <Box variant="awsui-key-label">Data location</Box>
              <Link external href={database.s3_location}>{database.s3_location}</Link>
            </div>
            <div>
              <Box variant="awsui-key-label">Category</Box>
              <div>{database.category_id1||'-'} / {database.category_id2||'-'}</div>
            </div>
            <div>
              <Box variant="awsui-key-label">Created</Box>
              <div>{database.created}</div>
            </div>
            <div>
              <Box variant="awsui-key-label">Producer</Box>
               <Box  color="text-status-inactive" fontSize="body-m">
               {database.groupname+' (awsid:'+database.awsid+')'}
               </Box>
            </div>
            <div>
              <Box variant="awsui-key-label">Description</Box>
              <div>{database.description||'-'}</div>
            </div>
          </ColumnLayout>
        </Container>
  )
}


const ContentPanel = ({ id, items, isAdmin }) => {
  const [visible, setVisible] = useState(false);
  const [triggerAction, setTriAction] = useState();
  const database =items.database;
  const tablelist = items.tables;
  let sn =0;
  var tableitems = tablelist.map(it => ({sn:++sn,
                                        name:it.Name,
                                     format:it.Parameters.classification,
                                     catalogid:it.CatalogId,
                                     updated:it.UpdateTime,
                                     db_name:it.DatabaseName,
                                    }))
  return (
    <ContentLayout
      header={
        <Header
          variant="h1"
          actions={
            <SpaceBetween size="xs" direction="horizontal">
              <Button
                disabled={!isAdmin}
                variant="primary"
                onClick={() => {
                  setVisible(true);
                  setTriAction("edit");
                }}
              >
                Edit
              </Button>
            </SpaceBetween>
          }
        >
          Name: {id}
        </Header>
      }
    >
      <SpaceBetween size="l">
        <DetailPanel database={database} />
        <TablePanel tables={tableitems}/>
        <ConsumerPanel dbName={database.db_name} type={'database'}  />
        {/* <ConsumerPanel tables={tableitems}/> */}
      </SpaceBetween>
    </ContentLayout>
  );
};

const DatabaseDetail = () => {
    const { dbName } = useParams();
    const appLayout = useRef();
    // const [details, setDetails] = useState({database:'',tables:[]});
    const [details, setDetails] = useState();
    const userInfo = useAuthUserInfo();
    const headers = useAuthorizedHeader();
    const isAdmin = userInfo.grouptype === "CENTRAL" ? true : false;
    
    useEffect(()=>{

      const controller = new AbortController();
      const fetchData = async()=>{
        const payload = {
          db_name:dbName,
        }
        try {
          const data = await remotePostCall(headers,API_fetchDatabase,payload,controller);
          setDetails({database:data.database,
            tables:data.tables});
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
        navigation={<Navigation activeHref="/catalog/databases" />}
        breadcrumbs={<BreadcrumbsDynmic id={dbName} />}
        content={details?(<ContentPanel id={dbName} items={details} isAdmin={isAdmin} />):<Spinner size="large"/>}
        contentType="table"
        stickyNotifications
        />
    );
};

export default DatabaseDetail;
