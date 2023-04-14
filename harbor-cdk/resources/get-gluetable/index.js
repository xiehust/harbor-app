// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

const mysql = require('mysql');
const {
    GlueClient,
    GetTableCommand,
    GetTableVersionsCommand,
    
} = require("@aws-sdk/client-glue");
var { SecretsManagerClient, GetSecretValueCommand } = require("@aws-sdk/client-secrets-manager");
var { LakeFormationClient, GetResourceLFTagsCommand } = require( "@aws-sdk/client-lakeformation"); 
var { STSClient ,AssumeRoleCommand } =require("@aws-sdk/client-sts");


const admin_role=process.env.LF_ADMIN_ROLE_ARN;


const assumeAdminRole = async () =>{
    // Set the parameters
    const params = {
      RoleArn: admin_role,
      RoleSessionName: "session1",
      DurationSeconds: 900,
    }
    const stsClient = new STSClient();
    try {
    //Assume Role
        const data = await stsClient.send(new AssumeRoleCommand(params));
        const rolecreds = {
          accessKeyId: data.Credentials.AccessKeyId,
          secretAccessKey: data.Credentials.SecretAccessKey,
          sessionToken: data.Credentials.SessionToken,
        }
        return rolecreds;
    }
    catch(err){
        console.error('Assume Role error',err);
        return undefined;
    }
    
}

const getDbSecrets = async () =>{
    const secretName = process.env.RDS_SECRETNAME;
    const client = new SecretsManagerClient();
    const command = new GetSecretValueCommand({SecretId:secretName});
    try {
        const resp = await client.send(command);
        return JSON.parse(resp.SecretString);
    }catch(err){
        console.error('Get Secret Value',err);
            return undefined;
    }
}

const getLFTag = async(resourceType,input, admin=true) =>{
    let lf_client;
    if (admin) {
        if (!admincred) return undefined;
        lf_client = new LakeFormationClient({ 
                        credentials:admincred});
    }else{
        lf_client = new LakeFormationClient();
    }

    let params;
    if (resourceType === 'database'){
        params = {
            ShowAssignedLFTags:true,
            Resource:{
                Database:{
                    Name:input.database,
                },
            }
        }
    }else if (resourceType === 'table'){
        params = {
            ShowAssignedLFTags:true,
            Resource:{
                Table:{
                    DatabaseName:input.database,
                    Name:input.table,
                },
            }
        }
    }else if (resourceType === 'columns'){
        params = {
            ShowAssignedLFTags:true,
            Resource:{
                TableWithColumns:{
                    DatabaseName:input.database,
                    Name:input.table,
                    ColumnNames:input.columns,
                },
            }
    }
    }else{
        console.log('unsupported resource type');
        return undefined;
    }
    
    
    const command = new GetResourceLFTagsCommand(params);
    try {
        const response = await lf_client.send(command);
        return response;
    }catch(error){
        console.error('Get LF Tags failed',error);
        throw(error);
    }
}




const getTableVersions = async (glue_params) =>{
    //get assume role
    const admincred = await assumeAdminRole();
    const glue_client = new GlueClient({credentials:admincred});
    const getData = async(glue_params) => {
        try {
                const resp = await glue_client.send(new GetTableVersionsCommand({ 
                    DatabaseName:glue_params.DatabaseName,
                    TableName:glue_params.Name,}));
                console.log('Get glue table version success');
                return resp;
            }catch(err){
                console.error('Get glue table failed',err);
                return undefined;
            }
    }
    let dbs = [];
    let glueresp;
    let stop = false;
    let nextToken = '';
    const maxResult = 100;
    while (!stop ){
        glueresp = await getData({
                MaxResults:maxResult,
                DatabaseName:glue_params.DatabaseName,
                Name:glue_params.Name,
                NextToken:nextToken
        });
        if (glueresp !== undefined) {
            if (glueresp.TableVersions.length === 0 || glueresp.TableVersions.length < maxResult){
                stop =true;
            }
            dbs = dbs.concat(glueresp.TableVersions);
            nextToken = glueresp.NextToken;
        }
        else{
            stop =true;
        }
    }
    return dbs;
}



const getGlueTable = async(glue_params) => {
    //get assume role
    const admincred = await assumeAdminRole();
    const glue_client = new GlueClient({credentials:admincred});
    try {
            const resp = await glue_client.send(new GetTableCommand(glue_params));
            console.log('Get glue table success');
            return resp;
        }catch(err){
            console.error('Get glue table failed',err);
            return undefined;
        }
}



exports.handler = async (event) => {
    const body = JSON.parse(event.body);
    console.log(body);
    const glue_params = {DatabaseName:body.db_name,
                        Name:body.table_name};
    //get glue tables
    const promise1 = new Promise((resolve,reject)=>{
        getGlueTable(glue_params).then(data=> resolve(data))
        .catch(err => reject(err));
    });
    
    //get table version
    const promise2 = new Promise((resolve,reject)=>{
        getTableVersions(glue_params).then(data=> (resolve(data)))
        .catch(err => reject(err));
    });
    
    const glueresps = await Promise.all([promise1,promise2]);
    
    //get glue tables
    const table_detail =glueresps[0];
    // console.log('table_detail.......,',JSON.stringify(table_detail));
    const versions = glueresps[1];
    // console.log('versions.......,',versions);
    const versionSummary = versions.map(data => ({versionid:data.VersionId,
                                            createtime:data.Table.CreateTime,
                                            updatetime:data.Table.UpdateTime,
                                             createby:data.Table.CreatedBy}));
                          
    let tagsmap;
     try{
         tagsmap = await getLFTag('columns',{database: body.db_name,
                                                    table: body.table_name,
                                        columns:table_detail.Table.StorageDescriptor.Columns.map(v => v.Name)});
        
        //  console.log(tagsmap);
     } catch(err){
        console.log('getLftags err:',JSON.stringify(err));
     }                                     
                              
    
     const secrets_params = await getDbSecrets();
     if (!secrets_params) return {statusCode:500};
     const connection = mysql.createConnection({
         host     : secrets_params.host,
         user     : secrets_params.username,
         password : secrets_params.password,
         database : secrets_params.dbname
     });
    
    const sql = "select * from glue_tables where db_name = ? and table_name = ?";
    const val = [body.db_name,body.table_name];
    // connection.connect();
    const promise3 = new Promise((resolve, reject)=>{
        connection.query(sql,val, function (error, results, fields) {
        if (error) return reject(error);
            return resolve({...results[0],format:table_detail.Table.Parameters.classification});
        })
    });
    
    let response;
    try{
        const resp = await Promise.all([promise3]);
        response = {
                statusCode: 200,
                body: JSON.stringify({
                    summary:resp[0],
                    tagsmap:tagsmap.LFTagsOnColumns,
                    detail:table_detail,
                    versioncnt:versions.length,
                    versions:versionSummary
                }),
    }
        
    }catch(err){
        response = {
            statusCode: 500,
            body: JSON.stringify({
                err
            }),
        }
    }

    return response;
}
