// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

const API_endpoint = "https://cahn57ybfh.execute-api.ap-northeast-1.amazonaws.com/";

export const API_login = 'login';
export const API_fetchDatabaselist = 'listdatabases';
export const API_fetchGlueTablelist = 'listgluetables';
export const API_fetchDatabase = 'getdatabase';
export const API_fetchGlueTable = 'getgluetable';
export const API_fetchGlueTablebyId = 'getgluetablebyid';
export const API_createapproval = 'createapproval';
export const API_subscribetables = 'requestsubscription';
export const API_getapprovals = 'getapprovals';
export const API_createdb = 'approverecord';
export const API_approvesubscription = 'approvesubscription';
export const API_fetchSubscriptionlist = 'listsubscriptions';
export const API_AlterSubscription = '';
export const API_getOverviewStats = 'getoverviewstats';
export const API_listlftags = 'listlftags';
export const API_adduser = 'adduser';
export const API_addgroup = 'addgroup';
export const API_getlftagByKey = 'getlftagbykey';
export const API_addlftag = 'addlftags';
export const API_deletelftag = 'deletelftag';
export const API_getlftagByResource = 'getlftagbyres';
export const API_getApproveRecord = 'getrecord';
export const API_getApprovalStats = 'getapprovalstats';
export const API_getSharingsbyRes = 'getsharingsbyres';
export const API_getSharingGraph = 'getsharinggraph';
export const API_refreshDatabaseList = 'refresh-databaselist';
export const API_listallgroups = 'listgrouplist';


export const remotePostCall = async (headers,api,payload,controller) =>{
    const options = {
        method:"POST",
        headers:headers,
        body: JSON.stringify(payload),
        signal:controller?controller.signal:null,
    };
    try {
        let resp = await fetch(API_endpoint + api, options);
        if (!resp.ok) {
            // console.log(resp);
            let data = await resp.json() ;
            // console.log(data);
            throw (Error(`${resp.status} Message:${data.name},${data.message}`));
        }
        let data = await resp.json() ;
        return data;
    } catch (err) {
        throw (err);
    }
}

const invokeAPIGW = async (api,options) =>{
    try {
        var resp = await fetch(API_endpoint + api, options);
        // console.log(resp);
        if (!resp.ok) throw (Error(`Response error: ${resp.status}`));
        var data = await resp.json() ;
        return data;
    } catch (err) {
        throw err;
    }
}

export const fetchDatabase = async (header,db_name) =>{
    const options = {
        method:"POST",
        headers:header,
        body: JSON.stringify({db_name:db_name})
    };
    try {
        const data = await invokeAPIGW(API_fetchDatabase, options);
        return (data);
    } catch (err) {
        throw (err);
    }
}


export const fetchDatabaseList = async (header,currentPageIndex,filteringText,pageSize) =>{
    const options = {
        method:"POST",
        headers:header,
        body: JSON.stringify({
            pageindex:currentPageIndex,
            textfilter:filteringText,
            pagesize:pageSize,})
    };
    try {
        const data = await invokeAPIGW(API_fetchDatabaselist, options);
        return (data);
    } catch (err) {
        throw (err);
    }
}

export const fetchGlueTable = async (header,db_name,table_name) =>{
    const options = {
        method:"POST",
        headers:header,
        body: JSON.stringify({
                db_name:db_name,
                table_name:table_name})
    };
    try {
        const data = await invokeAPIGW(API_fetchGlueTable, options);
        return (data);
    } catch (err) {
        throw (err);
    }
}

export const fetchGlueTableList = async (header,currentPageIndex,filteringText,pageSize) =>{
    const options = {
        method:"POST",
        headers:header,
        body: JSON.stringify({
            pageindex:currentPageIndex,
            textfilter:filteringText,
            pagesize:pageSize,})
    };
    try {
        const data = await invokeAPIGW(API_fetchGlueTablelist, options);
        return (data);
    } catch (err) {
        throw (err);
    }
}


export const fetchGlueTablebyId = async (header,tableids,subscriberid) =>{
    const options = {
        method:"POST",
        headers:header,
        body: JSON.stringify({
                tableids:tableids,
                subscriberid:subscriberid})
    };
    try {
        const data = await invokeAPIGW(API_fetchGlueTablebyId, options);
        return (data);
    } catch (err) {
        throw (err);
    }
}


export const createApproval = async (header,tableids,subscriberid) =>{
    const options = {
        method:"POST",
        headers:header,
        body: JSON.stringify({
                tableids:tableids,
                subscriberid:subscriberid})
    };
    try {
        const data = await invokeAPIGW(API_createapproval, options);
        return (data);
    } catch (err) {
        throw (err);
    }
}

export const makeSubscription = async (header,payload) =>{
    const options = {
        method:"POST",
        headers:header,
        body: JSON.stringify(payload)
    };
    try {
        const data = await invokeAPIGW(API_subscribetables, options);
        return (data);
    } catch (err) {
        throw (err);
    }
}

export const getSubscription = async (headers,payload) =>{
    const options ={ 
        method:"POST",
        headers:headers,
        body: JSON.stringify(payload),
      }
    try {
        const data = await invokeAPIGW(API_getapprovals, options);
        return (data);
    } catch (err) {
        throw (err);
    }
}

export const createDB = async (headers,payload) =>{
    const options = {
        method:"POST",
        headers:headers,
        body: JSON.stringify(payload),
    };
    try {
        const data = await invokeAPIGW(API_createdb, options);
        return (data);
    } catch (err) {
        throw (err);
    }
}

export const approveSubscribe = async (headers,payload) =>{
    const options = {
        method:"POST",
        headers:headers,
        body: JSON.stringify(payload),
    };
    try {
        const data = await invokeAPIGW(API_approvesubscription, options);
        return (data);
    } catch (err) {
        throw (err);
    }
}