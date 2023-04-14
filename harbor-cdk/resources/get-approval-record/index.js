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

exports.handler = async (event) => {
    var body = JSON.parse(event.body)
    // console.log(body)

    const secrets_params = await getDbSecrets();
    if (!secrets_params) return {statusCode:500};
    const connection = mysql.createConnection({
        host     : secrets_params.host,
        user     : secrets_params.username,
        password : secrets_params.password,
        database : secrets_params.dbname
      });
    
    const sql = "select a.*, b.awsid from approvals_reg a, group_info b where a.id=? and a.groupid =b.id";
    const val = [body.id];
    
    // var query = event.query
    let dbresult;
    connection.connect();

    connection.query(sql,val, function (error, results, fields) {
      if (error) throw error
      dbresult = results[0]
    })
    
    return new Promise( ( resolve ) => {
            const response = {
                statusCode: 200,
                body: JSON.stringify(dbresult)
            }
            resolve(response)
    })
}
