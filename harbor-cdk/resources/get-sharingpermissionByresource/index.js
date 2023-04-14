var {
    LakeFormationClient,
    ListPermissionsCommand,
    DataLakeResourceType
} =require( "@aws-sdk/client-lakeformation");
var  { STSClient ,AssumeRoleCommand }  =require("@aws-sdk/client-sts");
var { SecretsManagerClient, GetSecretValueCommand } = require("@aws-sdk/client-secrets-manager");
var mysql = require('mysql');



const admin_role=process.env.LF_ADMIN_ROLE_ARN;

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





const listLfPermission = async(lf_client,params) =>{
    
    const getData = async(entry) =>{
        console.log(entry);
        const command = new ListPermissionsCommand(entry);
        try {
            const result = await lf_client.send(command);
            // console.log('list lf permission result',JSON.stringify(result));
            return result;
    
        }catch(err){
            console.error('list lf permission failed',JSON.stringify(err));
            throw err;
        }
    }
    let dbs = [];
    let lf_resp;
    let stop = false;
    let nextToken = '';
    const maxResult = 100;

    let input;
    switch (params.type){
        case 'table': 
            input= {
            MaxResults:maxResult,
            NextToken:nextToken,
            ResourceType:DataLakeResourceType.TABLE,
            Resource:{
                Table:{
                    DatabaseName:params.db_name,
                    Name:params.table_name,
                },
                }
            }
         break;
         case 'database':
            input = {
            MaxResults:maxResult,
            NextToken:nextToken,
            ResourceType:DataLakeResourceType.DATABASE,
            Resource:{
                Database:{
                    Name:params.db_name,
                },
                }
            }
         break;
         case 'lftag':
            input = {
            MaxResults:maxResult,
            NextToken:nextToken,
            ResourceType:DataLakeResourceType.DATABASE,
            Resource:{
                LFTag:{
                    TagKey:params.tagkey,
                    TagValues:params.tagvalues
                },
                }
            }  
             break;   
    }
                                
    while (!stop ){
        try{
            lf_resp = await getData(input);
            if (lf_resp.PrincipalResourcePermissions.length === 0 || lf_resp.PrincipalResourcePermissions.length < maxResult){
                stop = true;
            }
            dbs = dbs.concat(lf_resp.PrincipalResourcePermissions);
            nextToken = lf_resp.NextToken;
        }catch(err){
            console.error(err);
            stop =true;
        }
    }
    return dbs;
}


exports.handler = async(event) => {
    const body = JSON.parse(event.body)
    console.log(body)
    const params = {
        type:body.type,
        db_name:body.db_name,
        table_name:body.table_name,
        scope:body.scope,
        tagkey:body.tagkey,
        tagvalues:body.tagvalues
        
    }
    //get assume role
    const admincred = await assumeAdminRole();
    const lf_client = new LakeFormationClient({credentials:admincred});
    const lf_resp = await listLfPermission(lf_client,params);
    let principals = [];
    let awsids = [];
    lf_resp.map(v => {
        const accountid = v.Principal.DataLakePrincipalIdentifier.match(/\d{12}/)[0];
        awsids.push(accountid);
        principals.push({
            principalIdentifier:v.Principal.DataLakePrincipalIdentifier,
            principalId:accountid,
            permissions:v.Permissions,
            grant_permissions:v.PermissionsWithGrantOption,
        });
    });
    console.log('principals result',JSON.stringify(principals));

    const secrets_params = await getDbSecrets();
    if (!secrets_params) return {statusCode:500};
    const connection = mysql.createConnection({
      host     : secrets_params.host,
      user     : secrets_params.username,
      password : secrets_params.password,
      database : secrets_params.dbname
    });
    
    
    const sql = `select * from group_info where awsid in (?) `;
    const promise = new Promise((resolve,reject) =>{ 
        connection.query(sql, [awsids], function (error, results, fields) {
        if (error) return reject(error);
        return resolve(results);
        });
    });
    let dbresult;
    try {
         [dbresult] = await Promise.all([promise]);
    }catch(err){
        console.log('query group info err:',err);
    }
    console.log(dbresult)
    let groupSet = new Map();
    dbresult.map(v =>(groupSet.set(v.awsid,v)));
    let results = principals.map(v=>({
        ...v,
        groupname:groupSet.get(v.principalId).groupname,
        grouptype:groupSet.get(v.principalId).grouptype,
    }));
    results = (params.scope !== 'all')? 
                results.filter(it => (it.grouptype === 'CONSUMER'))
                :results
    console.log(results)
    const response = {
        statusCode: 200,
        body: JSON.stringify(results),
    };
    return response;
};
