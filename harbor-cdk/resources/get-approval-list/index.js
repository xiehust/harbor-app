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
    const limit = body.pagesize;
    const pageindex = body.pageindex;
    const groupid = body.groupid;
    const sortingDescending = body.sortingDescending?'desc': 'asc';
    const sortingColumn = body.sortingColumn.sortingField;
    const filteringTokens = body.filteringTokens;
    const filteringOperation = body.filteringOperation;
    const filterquery = parseFilters(filteringTokens,filteringOperation);
    
    const secrets_params = await getDbSecrets();
    if (!secrets_params) return {statusCode:500};
    const connection = mysql.createConnection({
        host     : secrets_params.host,
        user     : secrets_params.username,
        password : secrets_params.password,
        database : secrets_params.dbname
      });
    
    let sql;
    let val =[];
    let sql_count;
    let val_count = [];
    if (body.grouptype === 'CENTRAL'){
        sql = `select * from approvals_reg order by ${sortingColumn} ${sortingDescending} limit ? offset ?`;
        sql_count = "select count(*) as totals from sharinglinks_view";
        if (filterquery){
            sql = `select * from approvals_reg where ${filterquery} order by ${sortingColumn} ${sortingDescending} limit ? offset ?`;
            sql_count = `select count(*) as totals from sharinglinks_view where ${filterquery} ` ;
        }
        
        val = [limit,(pageindex-1)*limit];
    }else{
        sql = `select * from approvals_reg where groupid=? order by ${sortingColumn} ${sortingDescending} limit ? offset ?`;
        sql_count = `select count(*) as totals from sharinglinks_view where consumerid = ?` ;
        if (filterquery){
            sql = `select * from approvals_reg where groupid=? and ${filterquery} order by ${sortingColumn} ${sortingDescending} limit ? offset ?`;
            sql_count = `select count(*) as totals from sharinglinks_view where consumerid = ? and ${filterquery} ` ;
        }

        val = [groupid,limit,(pageindex-1)*limit];
        val_count = [groupid];
    }
    
    
    const promise1 = new Promise((resolve,reject) =>{ 
        connection.query(sql,val, function (error, results, fields) {
        if (error) return reject(error);
        return resolve(results);
        });
    });
    
    
    
    const promise2 = new Promise((resolve,reject) =>{ 
        connection.query(sql_count,val_count, function (error, results, fields) {
        if (error) return reject(error);
        return resolve(results);
        });
    });
    
    const resp = await Promise.all([promise1,promise2]);
    const dbresult = resp[0];
    const count = resp[1];
    
    return  {
                statusCode: 200,
                body: JSON.stringify({...count[0],items:dbresult}),
            };
}
