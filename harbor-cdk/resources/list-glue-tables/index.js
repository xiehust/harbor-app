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
    var body = JSON.parse(event.body);
    console.log(body);
    const limit = body.pagesize;
    const pageindex = body.pageindex;
    const sortingDescending = body.sortingDescending?'desc': 'asc';
    const sortingColumn = body.sortingColumn.sortingField;
    const filteringTokens = body.filteringTokens;
    const filteringOperation = body.filteringOperation;
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
    
    let sql = `select * from glue_tables order by ${sortingColumn} ${sortingDescending} limit ?  offset ?`;
    if (filterquery){
        sql = `select * from glue_tables where ${filterquery} order by ${sortingColumn} ${sortingDescending} limit ? offset ?`;
    }
    const val = [limit,(pageindex-1)*limit];
    
    let dbresult;
    const promise1 = new Promise((resolve,reject) =>{ 
        connection.query(sql,val, function (error, results, fields) {
        if (error) return reject(error);
        dbresult = results;
        resolve('success');
        });
    });
    
    let sql_count = `select count(*) as totals from glue_tables`;
    if (filterquery){
        sql = `select count(*) as totals from glue_tables where ${filterquery}`;
    }
    
    let count;
    const promise2 = new Promise((resolve,reject) =>{ 
        connection.query(sql_count, function (error, results, fields) {
        if (error) return reject(error);
        count = results;
        resolve('success');
        });
    });
    try {
            await Promise.all([promise1,promise2]);
            return {
                statusCode: 200,
                body: JSON.stringify({totals:count[0],tables:dbresult}),
            }
    
    } catch(err){
        return {
                statusCode: 501,
                body: JSON.stringify(err),
            }
    }
    
}
