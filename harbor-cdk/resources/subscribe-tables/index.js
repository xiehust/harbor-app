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

function generateUniqueId(){
  const timestamp = Date.now();
  const randomNumber = Math.random();
  const hexadecimalString = randomNumber.toString(16).slice(3); 
  return `id-${timestamp}-${hexadecimalString}`;
};

function parseFormData(data){
    let lines = [];
    const expiredate = (data.expiredate === ''|| data.expiredate === undefined)?"2099-12-31":data.expiredate;
    for( let i = 0; i < data.selectedItems.length; i++){
        const table = data.selectedItems[i];
        let data_permission = null;
        if (data.permissiontype === 'column'){
            //data_permission is a object
            data_permission = data.data_permissions[table.id]; 
        }
        
        //find the tags filter
        const tagsfilter = data.tagsfilter.filter(val => val.database === table.db_name && 
                                        val.table == table.table_name);
        
        
        //make the db value items
        lines.push([
            data.type,
            table.db_name,
            table.table_name,
            table.s3_location,
            data.groupname,
            data.description||'-',
            data.groupid,
            JSON.stringify({permissiontype:data.permissiontype,
                            permissions:data.permissions,
                           data_permission:data_permission,
                           tagsfilter:tagsfilter,
            }),
            data.created,
            expiredate,
            'submitted'
            ])
    }
    return lines;
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

    if (body.type !== "subscribe"){
        return {
                statusCode: 400,
                body: JSON.stringify("wrong type"),
        }
    }
    const docid = generateUniqueId();
    const parsedata = parseFormData(body);
    // console.log(parsedata);

    var sql = 'insert into approvals_reg (type, db_name, table_name, s3_location,groupname,  \
                description,groupid,permissions,created,expiredate,status )  values ?';
    const dbPromise1 = new Promise((resolve,reject)=>{
        connection.query(sql,[parsedata], function (error, results, fields) {
        if (error) return reject(error);
        console.log('updated rows:',results);
        return resolve(results);
        })
    });
    const respdb = await Promise.all([dbPromise1]);
    // const result1 =  respdb[0];
    
    return new Promise( ( resolve ) => {
            const response = {
                statusCode: 200,
                // body: JSON.stringify({orderid:result1.insertId, updatedrows:result1}),
                body: JSON.stringify(respdb[0]),
            }
            resolve(response)
    })
}
