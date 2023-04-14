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


const parseFilters = (tokens,operation)=>{
    
   const operatorCov =(col,opr,val)=>{
       switch (opr) {
           case ':':
               return `${col} like '%${val}%'`;
           case '!:':
               return `${col} not like '%${val}%'`;
           default:
               return `${col} ${opr} '${val}'`;
       }
   }
   const query =  tokens.map( v =>operatorCov(v.propertyKey,v.operator,v.value)).join(` ${operation} `)
  return query;
}


exports.handler = async (event) => {
    const body = JSON.parse(event.body);
    console.log(body);
    const limit = body.pagesize;
    const pageindex = body.pageindex;
    const filteringTokens = body.filteringTokens;
    const filteringOperation = body.filteringOperation;
    const groupid = body.groupid;
    const grouptype = body.grouptype;
    const sortingDescending = body.sortingDescending?'desc': 'asc';
    const sortingColumn = body.sortingColumn.sortingField;
    
    
    const filterquery = parseFilters(filteringTokens,filteringOperation);
    console.log('filterquery:',filterquery);
    
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
    if (grouptype !== 'CENTRAL') {
        sql = `select * from sharinglinks_view where consumerid = ? order by ${sortingColumn} ${sortingDescending} limit ? offset ?`;
        val = [groupid,limit,(pageindex-1)*limit];
        if (filterquery){
            sql = `select * from sharinglinks_view where consumerid = ? and ${filterquery} order by ${sortingColumn} ${sortingDescending} limit ? offset ?`;
        }
        
    }else{
        sql = `select * from sharinglinks_view order by ${sortingColumn} ${sortingDescending} limit ? offset ?`;
        val = [limit,(pageindex-1)**limit];
        if (filterquery){
            sql = `select * from sharinglinks_view where ${filterquery} order by ${sortingColumn} ${sortingDescending} limit ? offset ?`;
        }
    }
    
   
    console.log('sql:',sql);
   
    const promise1 = new Promise((resolve,reject) =>{ 
        connection.query(sql,val, function (error, results, fields) {
        if (error) return reject(error);
        return resolve(results);
        });
    });
    
    let sql_count = `select count(*) as totals from sharinglinks_view `;
    if (filterquery){
        sql_count = `select count(*) as totals from sharinglinks_view where ${filterquery}`;
    }
    const promise2 = new Promise((resolve,reject) =>{ 
        connection.query(sql_count, function (error, results, fields) {
        if (error) return reject(error);
        return resolve(results);
        });
    });
    
    const resp = await Promise.all([promise1,promise2]);
    const dbresult = resp[0];
    const count = resp[1];

    return {
        statusCode: 200,
        body: JSON.stringify({totals:count[0],tables:dbresult}),
    }
}
