// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
const mysql = require('mysql');
const { SecretsManagerClient, GetSecretValueCommand } = require("@aws-sdk/client-secrets-manager");

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


exports.handler = async (event) => {
    const body = JSON.parse(event.body);
    const permissions = body.permissions.replace('"','\\"')
    console.log("permissions string:",permissions)
    const expiredate = body.expiredate === ''? "2099-12-31":body.expiredate;
 
    const secrets_params = await getDbSecrets();
    if (!secrets_params) return {statusCode:500};
    const connection = mysql.createConnection({
        host     : secrets_params.host,
        user     : secrets_params.username,
        password : secrets_params.password,
        database : secrets_params.dbname
    });

  const sql = "INSERT INTO approvals_reg  \
                (id, type,db_name,s3_location,groupname,groupid,description,permissions,created,expiredate,status)  \
                    VALUES(0,?,?,?,?,?,?,?,?,?,?) ";
  const val = [0,body.type,body.database,body.location,body.groupname,body.groupid,body.description,permissions,
                    body.created,expiredate,'submitted'];
             
   let affectedRows;
    connection.query(sql,val, function (error, results, fields) {
    if (error) throw (error);
        affectedRows = results.affectedRows;
    });

  return new Promise( ( resolve ) => {
        const response = {
            statusCode: 200,
            body: JSON.stringify({affectedRows:affectedRows}),
        }
        resolve(response);
    });
}