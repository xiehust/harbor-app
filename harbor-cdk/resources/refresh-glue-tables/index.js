// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
var mysql = require('mysql');
var {
    GlueClient,
    GetTablesCommand,
} = require("@aws-sdk/client-glue");
var  { STSClient ,AssumeRoleCommand } =require("@aws-sdk/client-sts");
var { SecretsManagerClient, GetSecretValueCommand } = require("@aws-sdk/client-secrets-manager");
const admin_role=process.env.LF_ADMIN_ROLE_ARN;
    

const assumeAdminRole = async () =>{
    // Set the parameters
    const params = {
      RoleArn: admin_role,
      RoleSessionName: "session",//+Math.random().toString(16),
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

const getGlueTables = async (glue_params) =>{
    //get assume role
    const admincred = await assumeAdminRole();

    const getData = async (glue_params) =>{
        var glue_client = new GlueClient({credentials:admincred});
        try {
            var resp = await glue_client.send(new GetTablesCommand(glue_params))
            // console.log('Get glue tables success...',glue_params);
            return resp;
        }catch(err){
            console.error('Get glue tables failed',err);
            return undefined;
        }
    }
    
    var dbs = [];
    var glueresp;
    var stop = false;
    var nextToken = '';
    const maxResult = 100;
    while (!stop ){
        glueresp = await getData({
                MaxResults:maxResult,
                DatabaseName:glue_params.DatabaseName,
                NextToken:nextToken
        });
        if (glueresp !== undefined) {
            if (glueresp.TableList.length === 0 || glueresp.TableList.length < maxResult){
                stop =true;
            }
            dbs = dbs.concat(glueresp.TableList);
            nextToken = glueresp.NextToken;
        }
        else{
            stop =true;
        }
    }
    return dbs;
}

exports.handler = async (event) => {
     //query user in DB
    const secrets_params = await getDbSecrets();
    if (!secrets_params) return {statusCode:500};
    const connection = mysql.createConnection({
        host     : secrets_params.host,
        user     : secrets_params.username,
        password : secrets_params.password,
        database : secrets_params.dbname
      });

    const sql = "select * from glue_databases";
    
    let dbresult;
    let dbresultMap = new Map();
    const promise1 = new Promise((resolve,reject) =>{ 
        connection.query(sql, function (error, results, fields) {
        if (error) return reject(error);
        dbresult = results;
        resolve('success');
        });
    });
    await Promise.all([promise1]);
    let dbNames= [];
    for (let i =0; i< dbresult.length;i++){
        dbNames.push(dbresult[i].db_name);
        dbresultMap.set(dbresult[i].db_name,[
                                        dbresult[i].groupname,
                                        dbresult[i].groupid,
                                        dbresult[i].awsid,
                                        dbresult[i].category1_id,
                                        dbresult[i].category2_id,
                                        dbresult[i].status]);
    }
    let glueTableMap = new Map();
    const promises2 = dbNames.map((it) => new Promise((resolve,reject)=>{
        getGlueTables({DatabaseName:it})
        .then(resp =>{
            glueTableMap.set(it,resp);
            return resolve(resp);
        });
    }));
    
    const promises_resp = await Promise.all(promises2);
    const tables_cnt = promises_resp.map(it => (it.length));

        //refresh tables counts in glue_database
    for (let i = 0; i<dbresult.length;i++){
        dbresult[i].tables = tables_cnt[i]
    }
    const sql2 = 'update glue_databases set tables=? where db_name=?';
    let val2;
    let dbrows = 0;
    let dbpromises = [];
    for (let i=0; i<dbNames.length; i++){
        val2 = [tables_cnt[i],dbNames[i]]
        console.log('insert glue_databases data,',val2);
        dbpromises.push(
            new Promise((resolve,reject)=>{
            connection.query(sql2,val2, function (error, results, fields) {
            if (error) return reject(error);
            dbrows = dbrows+results.affectedRows;
            console.log('updated glue_databases rows:',dbrows);
            return resolve(dbrows);
            })
        }));
    }
    
    
    //refresh glue_tables
    let glueTables = [];
    glueTableMap.forEach((value,dbname)=>{
        for (let i=0;i < value.length;i++){
            let gluedbfields = dbresultMap.get(dbname);
            glueTables.push([
                            value[i].Name,
                            dbname,
                            value[i].Description,
                            value[i].StorageDescriptor.Location,
                            value[i].CreateTime,
                            value[i].UpdateTime,
                            '[placeholder]', //lf-tags
                            ].concat(gluedbfields));
        }
    }) 

    const sql3 = 'insert into glue_tables (table_name,db_name,description,s3_location, \
                created, lastupdated, lftags, groupname, groupid, awsid, category1_id, category2_id, status ) values ?  on duplicate key update \
                lastupdated = values(lastupdated), lftags=values(lftags), status=values(status)';
    let rows = 0;
    const tablepromise = new Promise((resolve,reject)=>{
        connection.query(sql3,[glueTables], function (error, results, fields) {
        if (error) return reject(error)
        rows = results.affectedRows;
        console.log('updated glue_tables rows:',rows);
        return resolve(rows)
    })
    })
    
    await Promise.all([...dbpromises,tablepromise]);
    
    return  {
            statusCode: 200,
            body:JSON.stringify('success')
        }
}
