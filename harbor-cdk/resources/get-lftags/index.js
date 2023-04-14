// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
const { LakeFormationClient, GetResourceLFTagsCommand } = require("@aws-sdk/client-lakeformation");
const  { STSClient ,AssumeRoleCommand } =require("@aws-sdk/client-sts");

const admin_role=process.env.LF_ADMIN_ROLE_ARN;


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


const getLFTag = async(resourceType,input,) =>{
    //get assume role
    const admincred = await assumeAdminRole();
    if (!admincred) return undefined;
    const lf_client = new LakeFormationClient({ 
                    credentials:admincred});
    let params;
    if (resourceType === 'database'){
        params = {
            ShowAssignedLFTags:true,
            Resource:{
                Database:{
                    Name:input.database,
                },
            }
        }
    }else if (resourceType === 'table'){
        params = {
            ShowAssignedLFTags:true,
            Resource:{
                Table:{
                    DatabaseName:input.database,
                    Name:input.table,
                },
            }
        }
    }else if (resourceType === 'columns'){
        params = {
            ShowAssignedLFTags:true,
            Resource:{
                TableWithColumns:{
                    DatabaseName:input.database,
                    Name:input.table,
                    ColumnNames:input.columns,
                },
            }
    }
    }else{
        console.log('unsupported resource type');
        return undefined;
    }
    
    
    const command = new GetResourceLFTagsCommand(params);
    try {
        const response = await lf_client.send(command);
        return response;
    }catch(error){
        console.error('Get LF Tags failed',error);
        throw(error);
    }
}

exports.handler = async(event) => {
    var body = JSON.parse(event.body);
    console.log(body);
    
    let response;
    
     try{
         const resp = await getLFTag(body.type,body.params);
          response = {
            statusCode:200,
            body: JSON.stringify(resp),
        };
     } catch(err){
         response = {
            statusCode:501,
            body: JSON.stringify(err),
        };
     }
    return response;
};
