// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import React, { useEffect, useState } from "react";
import DataProvider from "../../commons/data-provider";
import remoteApis from "../../commons/remote-apis";
import TableTemplate from "./table-template";
import {useAuthorizedHeader} from "../../commons/use-auth";


export default function UserApp(){
    const [tableitems,setTableitems] = useState([]);
    const [loadingState, setLoadingState] = useState(true);
    const headers = useAuthorizedHeader();

    useEffect(()=>{
        // new DataProvider().getData('/mockupres/users-items').then(ele => 
        //     setTableitems(ele))
        new remoteApis().invokeAPIGW("listuserlist",{ method:"POST",headers:headers})
        .then(ele => {
            if (typeof(ele) === "number"){
                console.log('error:',JSON.stringify(ele));
                setTableitems([]);
                setLoadingState(false);
            }else{
                setTableitems(ele);
                setLoadingState(false);
            }
        });
    },[]);
    return <TableTemplate distributions ={tableitems}
                resourceName="User"
                buttonName = "Add"
                activeHref="/admin/user"
                buttonHref="/admin/adduser"
                loadingState={loadingState}
            />;
}