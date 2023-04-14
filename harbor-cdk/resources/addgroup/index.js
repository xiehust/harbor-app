// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
const mysql = require("mysql");
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
  //query user in DB
  const secrets_params = await getDbSecrets();
  if (!secrets_params) return {statusCode:500};
  const connection = mysql.createConnection({
      host     : secrets_params.host,
      user     : secrets_params.username,
      password : secrets_params.password,
      database : secrets_params.dbname
    });
  let affectedRows;
  const sql = "INSERT INTO group_info \
                    VALUES(0,?,?,?,?,?) ";
  const val = [body.groupname,body.grouptype,body.awsid,body.groupid,body.lastupdated,body.status];
    connection.query(sql,val, function (error, results, fields) {
    if (error) throw (error);
        affectedRows = results.affectedRows;
    });

  return new Promise( ( resolve, reject ) => {
        const response = {
            statusCode: 200,
            body: JSON.stringify({affectedRows:affectedRows}),
        }
        resolve(response);
})
};
