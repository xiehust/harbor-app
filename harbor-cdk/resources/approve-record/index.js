// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
const mysql = require('mysql');
const  { STSClient ,AssumeRoleCommand } =require("@aws-sdk/client-sts");
const {
    GlueClient,
    CreateDatabaseCommand,
    GetDatabaseCommand,
    GetTablesCommand,
} = require("@aws-sdk/client-glue");
const {
    LakeFormationClient,
    GrantPermissionsCommand,
    BatchGrantPermissionsCommand,
} = require("@aws-sdk/client-lakeformation");



let requestId = Math.ceil(Math.random()*10000);
const admin_role=process.env.LF_ADMIN_ROLE_ARN;
//get assume role
let admincred;

const assumeAdminRole = async () =>{
    // Set the parameters
    const params = {
      RoleArn: admin_role,
      RoleSessionName: "session1",
      DurationSeconds: 900,
    }
    const stsClient = new STSClient();
    try {
    //Assume Role
        const data = await stsClient.send(new AssumeRoleCommand(params));
        const rolecreds = {
          accessKeyId: data.Credentials.AccessKeyId,
          secretAccessKey: data.Credentials.SecretAccessKey,
          sessionToken: data.Credentials.SessionToken,
        }
        return rolecreds;
    }
    catch(err){
        console.error('Assume Role error',err);
        return undefined;
    }
    
}

const batchGrantLfPermit = async (params) =>{
    

    
    
    //grant lf permission
    const entry_1 = {
            Id: String(requestId++),
            Principal: {
                DataLakePrincipalIdentifier:params.awsid
            },
            Resource:{
                Database:{
                    Name:params.db_name,
                },
            },
            Permissions:['DESCRIBE','ALTER','CREATE_TABLE'],
            PermissionsWithGrantOption:['DESCRIBE','ALTER','CREATE_TABLE'],
    };

    const entry_2 = {
            Id: String(requestId++),
            Principal: {
                DataLakePrincipalIdentifier:admin_role,
            },
            Resource:{
                Database:{
                    Name:params.db_name,
                },
            },
            Permissions:['DESCRIBE','ALTER','CREATE_TABLE','DROP'],
            PermissionsWithGrantOption:['DESCRIBE','ALTER','CREATE_TABLE','DROP'],
    };

    const entry_3 = {
            Id: String(requestId++),
            Principal: {
                DataLakePrincipalIdentifier:admin_role,
            },
            Resource:{
                Table:{
                    DatabaseName:params.db_name,
                    TableWildcard:{},
                }
            },
            Permissions:['SELECT'],
            PermissionsWithGrantOption:['SELECT'],
    };
 
    const lf_params = {Entries:[entry_1,entry_2,entry_3]};
    
    const lf_client = new LakeFormationClient({credentials:admincred});
    const command = new BatchGrantPermissionsCommand(lf_params);
    try {
        const result = await lf_client.send(command);
        console.log('batch grant lf permission result',result,JSON.stringify(result.Failures));
        return true;
    }catch(err){
        console.error('batch grant lf permission failed',JSON.stringify(err));
        return false;
    }
}

const createGlueDb = async (glue_params) =>{
    var glue_client = new GlueClient({credentials:admincred});
    try {
        const resp = await glue_client.send(new CreateDatabaseCommand({DatabaseInput:glue_params}))
        console.log('create glue database success');
        return true;
    }catch(err){
        console.error('create glue database failed',err);
        return false;
    }
}


const getGlueDb = async (glue_params) =>{
    var glue_client = new GlueClient({credentials:admincred});
    try {
        const resp = await glue_client.send(new GetDatabaseCommand(glue_params))
        console.log('Get glue database success');
        return resp;
    }catch(err){
        console.error('Get glue database failed',err);
        throw (err);
    }
}

const formatDate = (date) =>{
    if (typeof date == 'string') {
        return date;
    }
    var fmt = "yyyy-MM-dd hh:mm:ss";
    if (!date || date == null) return null;
    var opt = {
        'y+': date.getFullYear().toString(), // 年
        'M+': (date.getMonth() + 1).toString(), // 月
        'd+': date.getDate().toString(), // 日
        'h+': date.getHours().toString(), // 时
        'm+': date.getMinutes().toString(), // 分
        's+': date.getSeconds().toString() // 秒      
      }
      for (const k in opt) {
        const ret = new RegExp('(' + k + ')').exec(fmt)
        if (ret) {
          if (/(y+)/.test(k)) {
            fmt = fmt.replace(ret[1], opt[k].substring(4 - ret[1].length))
          } else {
            fmt = fmt.replace(ret[1], (ret[1].length === 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, '0')))
          }
        }
      }
    return fmt
}


exports.handler = async (event) => {
    const body = JSON.parse(event.body)
    admincred = await assumeAdminRole();
    if(!admincred) return {statusCode:500};
    const secrets_params = await getDbSecrets();
    if (!secrets_params) return {statusCode:500};
    const connection = mysql.createConnection({
        host     : secrets_params.host,
        user     : secrets_params.username,
        password : secrets_params.password,
        database : secrets_params.dbname
      });

     
    //////get apporval details 
    
    const sql2 = 'select a.status,a.db_name,a.description,b.groupname,a.groupid,a.type,a.s3_location,b.awsid from \
                    approvals_reg a, group_info b \
                      where a.id=? and a.groupid=b.id';
    const val2 =[body.id]
    
    let params;
    const db_promise2 = new Promise((resolve,reject) => { 
        connection.query(sql2,val2)
     .on('error',(err) =>{
         console.error('select ....',err);
         reject(Error(err));
     })
     .on('result', (row)=>{
         params = row;
         resolve(row);
     })
     });
     
    await Promise.all([db_promise2]);
    console.log('get all db results ....',params);
    
    const approval_type = params.type;
    
    let statusCode = 200;
    if (approval_type === 'createdb'){
        console.log('type ======= createdb');
        // create db in glue
        const glue_params = {
            Name:params.db_name,
            LocationUri:params.s3_location,
        };
        console.log('create db in glue.....,',glue_params);
        const glueRet = await createGlueDb(glue_params);
        if (!glueRet) {
            return {
                statusCode: 401,
                body: JSON.stringify('failed to create db in glue'),
            }
        }
    }
    
    
    // grant Lakeformation permissions
    const lfRet = await batchGrantLfPermit(params);
    console.log('batch grant permission in lakeformation.....,',lfRet);
    
    //refresh Glue databases and tables informations
    const dbPromise = new Promise((resolve, reject) =>{
        getGlueDb({
                Name:params.db_name,
        }).then(resp => {
            return resolve(resp);
        }).catch(error => {
            return reject(Error(error));
        });
    });
    const promisesResp = await Promise.all([dbPromise]);
    const gluedbresp = promisesResp[0];
    
     
    //insert data into mysql db
    const sql3 = 'insert into glue_databases (id, description, s3_location,db_name,\
                    groupname,groupid,awsid,created,tables,status) values \
                    (?,?,?,?,?,?,?,?,?,?); '
    const val3 = [0,params.description,params.s3_location,params.db_name,params.groupname,
                        params.groupid,params.awsid,gluedbresp.Database.CreateTime,0,'active'];    
    console.log(val3);
    const db_promise3 = new Promise((resolve,reject) => { 
    connection.query(sql3,val3)
     .on('error',(err) =>{
         console.error('select ....',err);
         return reject(Error(err));
     })
     .on('result', (row)=>{
         return resolve(row);
     })
     });
    const p = await Promise.all([db_promise3]);
    console.log('db_promise3',p);
    


    if (!lfRet) statusCode = 402;
    //update the final result
    if (statusCode === 200){ 
        const sql = `update approvals_reg set status=?, completed=?  where id=?`
        const val = [body.action,formatDate(new Date()),body.id]
        let result;
        const db_promise1 = new Promise((resolve,reject) => { 
            connection.query(sql,val)
         .on('error',(err) =>{
             console.error('select ....',err);
             reject(Error(err));
         })
         .on('result', (row)=>{
             result = row.affectedRows;
             console.log('update affectedRows....',result);
             resolve(row.affectedRows);
         })
         });
        await Promise.all([db_promise1]);
    }
    

    return new Promise( ( resolve,) => {
        const response = {
            statusCode: statusCode,
            body: result === 1 ?JSON.stringify('update success'):JSON.stringify('update no row'),
        }
        resolve(response);
    })
}
