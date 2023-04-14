// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React, { useEffect, useState } from "react";
import DataProvider from "../../commons/data-provider";
import remoteApis from "../../commons/remote-apis";
import TableTemplate from "./table-template";
import {useAuthorizedHeader} from "../../commons/use-auth";
import { useLocalStorage } from "../../../common/localStorage";
import {API_listallgroups,remotePostCall} from '../../commons/api-gateway';




export default function GroupApp(){
    const [tableitems,setTableitems] = useState([]);
    const [loadingState, setLoadingState] = useState(true);

    const headers = useAuthorizedHeader();
    useEffect(()=>{
        setLoadingState(true);
        const controller = new AbortController();
        const payload ={ 
            filtertext:'',
            };
        const fetchData = async() =>{
        try {
            const data = await remotePostCall(headers,API_listallgroups,payload,controller);
            setTableitems(data);
            setLoadingState(false);
        }catch(err){
            setLoadingState(false);
            console.error(err);
        }
        }
    fetchData();
    return ()=>controller.abort();
    },[]);
    return <TableTemplate distributions ={tableitems}
                resourceName="Group"
                buttonName = "Add"
                activeHref="/admin/group"
                buttonHref="/admin/addgroup"
                loadingState={loadingState}
            />;
}