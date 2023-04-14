// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
var mysql = require('mysql');
var { SecretsManagerClient, GetSecretValueCommand } = require("@aws-sdk/client-secrets-manager");

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

exports.handler = async (event) =>{
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

    let sql;
    let val;    

    if (body.grouptype === 'CENTRAL'){
        sql = `select status, count(id) as cnt from  approvals_reg group by status`;
        val = [];
    }
    else{
        sql = `select status, count(id) as cnt from  approvals_reg where groupid =? group by status`;
        val = [body.groupid];
    }
   
    const promise1 = new Promise((resolve,reject) =>{ 
        connection.query(sql,val,function (error, results, fields) {
        if (error) return reject(error);
        return resolve(results);
        });
    });
    
    let response;
    try {
        const resp = await Promise.all([promise1]);
        let json_result = {
            approved:0,
            rejected:0,
            revoked:0,
            submitted:0
        
        };
        resp[0].map(v => (json_result = {...json_result,[v.status]:v.cnt}));
        response = {
            statusCode: 200,
            body: JSON.stringify(json_result),
        }
    }catch(err){
        response = {
            statusCode: 500,
            body: JSON.stringify({err}),
        }
    }
    return response;
}
