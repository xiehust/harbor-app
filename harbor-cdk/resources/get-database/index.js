// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
var mysql = require('mysql');
var  { STSClient ,AssumeRoleCommand } =require("@aws-sdk/client-sts");
var {
    GlueClient,
    GetTablesCommand,
} = require("@aws-sdk/client-glue");
var { SecretsManagerClient, GetSecretValueCommand } = require("@aws-sdk/client-secrets-manager");
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




const getGlueTables = async (glue_params) =>{
    //get assume role
    const admincred = await assumeAdminRole();  
    const getData = async (glue_params) =>{
        var glue_client = new GlueClient({ credentials: admincred });
        try {
            var resp = await glue_client.send(new GetTablesCommand(glue_params))
            console.log('Get glue tables success');
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
    const body = JSON.parse(event.body);
    console.log(body);
    const secrets_params = await getDbSecrets();
    if (!secrets_params) return {statusCode:500};
    const connection = mysql.createConnection({
        host     : secrets_params.host,
        user     : secrets_params.username,
        password : secrets_params.password,
        database : secrets_params.dbname
    });
    //get glue tables
    const tablelist = await getGlueTables({DatabaseName:body.db_name});

    
    const sql = "select * from glue_databases where db_name = ?";
    const val = [body.db_name];
    let dbresult;
    
    connection.query(sql,val, function (error, results, fields) {
      if (error) throw error
      dbresult = results[0];
    })

    return new Promise( ( resolve ) => {
            const response = {
                statusCode: 200,
                body: JSON.stringify({database:dbresult,tables:tablelist}),
            }
            resolve(response)
    })
}
