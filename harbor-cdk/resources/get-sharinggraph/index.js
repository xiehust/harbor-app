// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
var mysql =require('mysql');

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

const buildGraphData =(arr) =>{
    let edges = [];
    let pro_nodes = [];
    let table_nodes = [];
    let con_nodes = [];
    let consumerids = new Set();
    let producerids = new Set();
    let tableids = new Set();
    let producelinks = new Set();
    
    for (let i=0;i<arr.length;i++){
        const v = arr[i];
        
        //dedupe the producer->table path
        if (!producelinks.has(v.producerid+'-'+v.table_id)){
            edges.push({
            
            source:'gid_'+v.producerid,
            target:'tableid_'+v.table_id,
            data:{type:'produce',
                id:`${v.id}`,
            },
            });
            producelinks.add(v.producerid+'-'+v.table_id);
        }
        
       
        edges.push({
            source:'tableid_'+v.table_id,
            target:'gid_'+v.consumerid,
            data:{type:'subscription',
                id:`${v.id}`,
            },
        });
        
        //to dedup the nodes
        if (!producerids.has(v.producerid)){
            pro_nodes.push({
            id:`gid_${v.producerid}`,
            data: {
                type: 'producer',
                groupname:v.producer,
                awsid:v.producerawsid,
            },
            });
            producerids.add(v.producerid);
        }

        //to dedup the nodes
        if (!tableids.has(v.table_id)){
            table_nodes.push({
             id: `tableid_${v.table_id}`,
            data: {
                type: 'table',
                database:v.db_name,
                 table:v.table_name,
            },
            });
            tableids.add(v.table_id);
            
        }
        
        if(!consumerids.has(v.consumerid)){
            con_nodes.push({
            id:`gid_${v.consumerid}`,
            data: {
                type: 'consumer',
                groupname:v.consumer,
                awsid:v.consumerawsid,
            },
            });
            consumerids.add(v.consumerid);
        }
    }
    return [edges,pro_nodes.concat(con_nodes),table_nodes];
}

exports.handler = async (event) => {
    
    const secrets_params = await getDbSecrets();
    if (!secrets_params) return {statusCode:500};
    const connection = mysql.createConnection({
        host     : secrets_params.host,
        user     : secrets_params.username,
        password : secrets_params.password,
        database : secrets_params.dbname
    });

    
    const sql = `select count(distinct consumer) as consumers, count(distinct producer) as producers, 
                    count(distinct table_name) as tables, count(distinct id) as total_links
                        from sharinglinks_view where status = 'approved'`;
    
    const promise1 = new Promise((resolve,reject) =>{ 
        connection.query(sql,function (error, results, fields) {
        if (error) return reject(error);
        return resolve(results);
        });
    });
    
    const sql_2 = "select * from sharinglinks_view";
    const promise2 = new Promise((resolve,reject) =>{ 
        connection.query(sql_2, function (error, results, fields) {
        if (error) return reject(error);
        return resolve(results);
        });
    });
    let response;
    try {
        const resp = await Promise.all([promise1,promise2]);
        const count = resp[0];
        const dbresult = resp[1];
        
        const [edges,nodes,table_nodes] =  buildGraphData(dbresult);
        
        response = {
            statusCode: 200,
            body: JSON.stringify({stats:count[0],edges:edges,nodes:nodes,table_nodes:table_nodes}),
        }
    }catch(err){
        response = {
            statusCode: 500,
            body: JSON.stringify({err}),
        }
    }
    return response;
}
