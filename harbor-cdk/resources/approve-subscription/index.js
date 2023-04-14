// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
var mysql = require('mysql');
var  { STSClient ,AssumeRoleCommand } =require("@aws-sdk/client-sts");
var {
    LakeFormationClient,
    BatchGrantPermissionsCommand,
    RevokePermissionsCommand,
    ListPermissionsCommand,
    DataLakeResourceType
} = require("@aws-sdk/client-lakeformation");

var {
    GlueClient,
    GetTableCommand,
} = require("@aws-sdk/client-glue");

const admin_role=process.env.LF_ADMIN_ROLE_ARN;
let  admincred; //get assume role

const assumeAdminRole = async () =>{
    // Set the parameters
    const params = {
      RoleArn: admin_role,
      RoleSessionName: "session",//+Math.random().toString(16),
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


//for all data apply filters, we only need the exclued columns
const applyfilter_all = (lftagsfilter,table_columns) =>{
    let tags_excludeColumns = [];
    let tags_includeColumns = [];
    let remain_cols_set = new Set(table_columns);
    lftagsfilter.map(v => v.type === 'excl'?
                        tags_excludeColumns.push(v.column):
                        tags_includeColumns.push(v.column) );
    tags_excludeColumns.map(v => remain_cols_set.delete(v));
    return [...remain_cols_set];
}


const applyfilter_col =(data_permission, lftagsfilter,table_columns) =>{
    let tags_excludeColumns = [];
    let tags_includeColumns = [];
    let remain_cols_set = new Set(table_columns);
    lftagsfilter.map(v => v.type === 'excl'?
                        tags_excludeColumns.push(v.column):
                        tags_includeColumns.push(v.column) );
                                    
    if (data_permission.filtertype === 'excl'){
        let data_excludeColumns = data_permission.selectedColumns.map(it => it.value);
        let exclColsSet = new Set(data_excludeColumns.concat(tags_excludeColumns));
        
        //remove the cols from the excl list that was overwritten by tag filters
        tags_includeColumns.map(v => exclColsSet.delete(v));
        
        //calculate the final remain cols to grant permissions
        exclColsSet.forEach( v=> remain_cols_set.delete(v) );
        
        return [...remain_cols_set];
    }
    else {// 'incl'
        let data_includeColumns = data_permission.selectedColumns.map(it => it.value);
        let inclColsSet = new Set(data_includeColumns.concat(tags_includeColumns));
        tags_excludeColumns.map(v=> inclColsSet.delete(v));
        return [...inclColsSet];
    }
}



const batchGrantLfPermit = async (params) =>{
    //parse permissions 
    const permissions = JSON.parse(params.permissions.replaceAll("\\", ""));
    const select = permissions.permissions[0].select?'SELECT':'';
    const desc = permissions.permissions[0].desc?'':'';
    const grant_select = permissions.permissions[1].select?'SELECT':'';
    const grant_desc = permissions.permissions[1].desc?'':'';
    const table_permission = [select,desc].filter(it=> it!=='');
    const data_permission = permissions.data_permission;
    const grant_table_permission = [grant_select,grant_desc].filter(it=> it!=='');
    const lftagsfilter = permissions.tagsfilter;
    // console.log(permissions);


    //grant db to consumer
    let entry_1 = {
            Id: Math.random().toString(16),
            Principal: {
                DataLakePrincipalIdentifier:params.awsid
            },
            Resource:{
                Database:{
                    Name:params.db_name,
                },
            },
            Permissions:['DESCRIBE'],
            PermissionsWithGrantOption:['DESCRIBE'],
    };
    
    ////grant table to consumer
    let entry_2 = {
            Id: Math.random().toString(16),
            Principal: {
                DataLakePrincipalIdentifier:params.awsid
            },
            Resource:{
                Table:{
                    DatabaseName:params.db_name,
                    Name:params.table_name,
                },
            },
            Permissions:table_permission,
            //Only all columns or column inclusion list can be granted/revoked with SELECT grant options.
            PermissionsWithGrantOption:grant_table_permission,
    };
   //all columns
    if (permissions.permissiontype === 'all'){ 
        if (lftagsfilter.length >0){
            const include_cols = applyfilter_all(lftagsfilter,params.table_columns);
            console.log('include_cols',include_cols);
            entry_2 = {
                ...entry_2,
                Resource:{
                    TableWithColumns:{
                            DatabaseName:params.db_name,
                            Name:params.table_name,
                            ColumnNames:include_cols,
                    },
                }
            }
        }
    }
    ////column permissions
    else if (permissions.permissiontype === 'column'){
        const include_cols = applyfilter_col(data_permission,lftagsfilter,params.table_columns);
        console.log('include_cols',include_cols);
        entry_2 = {
            ...entry_2,
            Resource:{
                TableWithColumns:{
                        DatabaseName:params.db_name,
                        Name:params.table_name,
                        ColumnNames:include_cols,
                },
            }
        }
    }else{
        console.log('permissions.permissiontype=',permissions.permissiontype);
    }

    
    let entries=[entry_1,entry_2];
    
    const lf_params = {Entries:entries};
    
    console.log(JSON.stringify(lf_params));

    const lf_client = new LakeFormationClient({credentials:admincred});
    const command = new BatchGrantPermissionsCommand(lf_params);
    try {
        const result = await lf_client.send(command);
        console.log('batch grant lf permission result',result,JSON.stringify(result.Failures));
        return result.Failures;//if no failure, then true, other false
    }catch(err){
        console.error('batch grant lf permission failed',JSON.stringify(err));
        throw err;
    }
}

const getGlueTable = async(params) => {
    const glue_client = new GlueClient({credentials:admincred});
    const glue_params = {DatabaseName:params.db_name,
                        Name:params.table_name};
    try {
            const resp = await glue_client.send(new GetTableCommand(glue_params));
            return resp.Table.StorageDescriptor.Columns.map(v=>v.Name);
        }catch(err){
            console.error('Get glue table failed',err);
            throw err;
        }
}


const listLfPermission = async(lf_client,params) =>{
    const entry ={
            Principal: {
                DataLakePrincipalIdentifier:params.awsid
            },
            MaxResults:1,
            ResourceType:DataLakeResourceType.TABLE,
            Resource:{
                Table:{
                    DatabaseName:params.db_name,
                    Name:params.table_name,
                },
            }
    }
    const command = new ListPermissionsCommand(entry);
    try {
        const result = await lf_client.send(command);
        console.log('list lf permission result',JSON.stringify(result));
        const col_resource = result.PrincipalResourcePermissions[0].Resource.TableWithColumns;
        return col_resource? col_resource.ColumnNames:[];

    }catch(err){
        console.error('list lf permission failed',JSON.stringify(err));
        throw err;
    }
}

//revoke the all table permission 
const revokeLfPermit = async (params) =>{
    const permissions = JSON.parse(params.permissions.replaceAll("\\", ""));
    const select = permissions.permissions[0].select?'SELECT':'';
    const desc = permissions.permissions[0].desc?'':'';
    const grant_select = permissions.permissions[1].select?'SELECT':'';
    const grant_desc = permissions.permissions[1].desc?'':'';
    const table_permission = [select,desc].filter(it=> it!=='');
    const data_permission = permissions.data_permission;
    const grant_table_permission = [grant_select,grant_desc].filter(it=> it!=='');
    const lftagsfilter = permissions.tagsfilter;
    // console.log(permissions);

    const lf_client = new LakeFormationClient({ credentials:admincred});
    
    
    //list the remaining permissions on columns to preven the over revoke 
    const cols_with_permission = await listLfPermission(lf_client,params);
    
    
    ////grant table to consumer
    let entry = {
            Principal: {
                DataLakePrincipalIdentifier:params.awsid
            },
            Resource:{
                Table:{
                    DatabaseName:params.db_name,
                    Name:params.table_name,
                },
            },
            Permissions:table_permission,
            //Only all columns or column inclusion list can be granted/revoked with SELECT grant options.
            PermissionsWithGrantOption:grant_table_permission,
    };
    
   //all columns
    if (permissions.permissiontype === 'all'){ 
        if (lftagsfilter.length >0){
            const include_cols = applyfilter_all(lftagsfilter,params.table_columns);
            console.log('include_cols',include_cols);
            
            const final_include_cols = (new Set(include_cols)) && (new Set(cols_with_permission));
            entry = {
                ...entry,
                Resource:{
                    TableWithColumns:{
                            DatabaseName:params.db_name,
                            Name:params.table_name,
                            ColumnNames:[...final_include_cols],
                    },
                }
            }
        }
    }
    ////column permissions
    else if (permissions.permissiontype === 'column'){
        const include_cols = applyfilter_col(data_permission,lftagsfilter,params.table_columns);
        console.log('include_cols',include_cols);
        const final_include_cols = (new Set(include_cols)) && (new Set(cols_with_permission));
        entry = {
            ...entry,
            Resource:{
                TableWithColumns:{
                        DatabaseName:params.db_name,
                        Name:params.table_name,
                        ColumnNames:[...final_include_cols],
                },
            }
        }
    }else{
        console.log('permissiontype',permissions.permissiontype);
    }

    console.log(JSON.stringify(entry));
    
    const command = new RevokePermissionsCommand(entry);
    try {
        const result = await lf_client.send(command);
        console.log('revoke lf permission result',JSON.stringify(result));
        return result.$metadata.httpStatusCode
    }catch(err){
        console.error('revoke lf permission failed',JSON.stringify(err));
        throw err;
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


const approveSub = async (params) => {
    // grant Lakeformation permissions
    try {
        const lfRet = await batchGrantLfPermit(params);
        console.log('grant permission in lakeformation.....,',lfRet);
        return lfRet.length ===0?200:401;
    }catch(err){
        console.error('grant permission in lakeformation.....,',err);
        return 501;
    }
}

const revokeSub = async(params) =>{
    try {
        const lfRet = await revokeLfPermit(params);
        console.log('revoke permission in lakeformation.....,',lfRet);
        return lfRet
    }catch(err){
        console.error('revoke permission in lakeformation.....,',err);
        return 502;
    }
}

    

exports.handler = async (event) => {
    const body = JSON.parse(event.body)
    console.log(body)
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
    let respCode;
    if (body.action === 'approved' || body.action === 'revoked'){
        //////get apporval details 
        const sql = 'select a.status,a.db_name,a.table_name,a.description,b.groupname,a.groupid,a.type,a.s3_location,b.awsid,a.permissions from \
                        approvals_reg a, group_info b \
                          where a.id=? and a.groupid=b.id';
        let params;
        const db_promise = new Promise((resolve,reject) => { 
            connection.query(sql,[body.id])
         .on('error',(err) =>{
             console.error('select ....',err);
             reject(Error(err));
         })
         .on('result', (row)=>{
             params = row;
             resolve();
         })
         });
        await Promise.all([db_promise]);
        // console.log('get all db results ....',params);
        try {
            const table_columns = await getGlueTable(params);
            params = {...params,table_columns:table_columns}
            console.log('get all columns from GlueTable...',table_columns); 
            
            respCode = body.action === 'approved' ? await approveSub( params):await revokeSub (params);
        }catch(err){
            console.error('getGlueTable error....',err);
            respCode = 500;
        }
        
    }else if (body.action === 'rejected'){
        //nothing to do with lakeformation
        //just direct change the status in db
        respCode = 200
    }else{
        respCode = 400
    }
    
    //update the final result
    let result;
    if (respCode === 200){ 
        const sql = `update approvals_reg set status=?, completed=?  where id=?`
        const val = [body.action,formatDate(new Date()),body.id]
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
    
    
    const response = {
        statusCode: respCode,
        body: result === 1 ?JSON.stringify('update success'):JSON.stringify('update no row'),
    }
    return response;
}
