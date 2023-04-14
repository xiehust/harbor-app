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
    const body = JSON.parse(event.body);
    console.log(body);
    const grouptype = body.grouptype;
    const groupid = body.groupid;
    
    const secrets_params = await getDbSecrets();
    if (!secrets_params) return {statusCode:500};
    const connection = mysql.createConnection({
        host     : secrets_params.host,
        user     : secrets_params.username,
        password : secrets_params.password,
        database : secrets_params.dbname
    });

    const sql = "select count(distinct db_name) as total_databases, \
                    sum(tables) as total_tables, \
                    count(distinct s3_location) as total_locations \
                    from glue_databases";
   
    const promise1 = new Promise((resolve,reject) =>{ 
        connection.query(sql, function (error, results, fields) {
        if (error) return reject(error);
        return resolve(results);
        });
    });
    
    let sql2;
    if (grouptype === 'CONSUMER'){
          sql2 = `select count(id) as total_sharinglinks, \
                             count(distinct consumer) as total_consumers, \
                             count(distinct producer) as total_producers \
                     from sharinglinks_view  \
                     where status = 'approved' \
                     and consumerid = ${groupid}`;
        
    }else if (grouptype === 'PRODUCER'){
        sql2 = `select count(id) as total_sharinglinks, \
                             count(distinct consumer) as total_consumers, \
                             count(distinct producer) as total_producers \
                     from sharinglinks_view  \
                     where status = 'approved' \
                     and producerid = ${groupid}`;
    }else{
         sql2 = "select count(id) as total_sharinglinks, \
                             count(distinct consumer) as total_consumers, \
                             count(distinct producer) as total_producers \
                     from sharinglinks_view  \
                     where status = 'approved'";
    }

 
    const promise2 = new Promise((resolve,reject) =>{ 
        connection.query(sql2, function (error, results, fields) {
        if (error) return reject(error);
        return resolve(results);
        });
    });
    
    const sql3 = "select count(id) as total_groups \
                     from group_info  \
                     where status = 'active'";
 
    const promise3 = new Promise((resolve,reject) =>{ 
        connection.query(sql3 ,function (error, results, fields) {
        if (error) return reject(error);
        return resolve(results);
        });
    });
    
    
    
    const resp = await Promise.all([promise1,promise2,promise3]);
    const db1 = resp[0];
    const db2 = resp[1];
    const db3 = resp[2];
    const consolid_resp = {...db1[0],...db2[0],...db3[0]};


    return  {
                statusCode: 200,
                body: JSON.stringify(consolid_resp),
            }
}
