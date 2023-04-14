// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
import { LakeFormationClient, CreateLFTagCommand } from "@aws-sdk/client-lakeformation"; 
import  { STSClient ,AssumeRoleCommand } from "@aws-sdk/client-sts";

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


const addLFTag = async(key,values) =>{
    let lf_client;
    //get assume role
    const admincred = await assumeAdminRole();
    if (!admincred) return undefined;
    lf_client = new LakeFormationClient({ 
                    credentials:admincred});

    const params = {
        TagKey:key,
        TagValues:values,
    };
    
    
    const command = new CreateLFTagCommand(params);
    try {
        const response = await lf_client.send(command);
        return response;
    }catch(error){
        console.error('Add LF Tags failed',error);
        throw(error);
    }
}

export const handler = async(event) => {
    var body = JSON.parse(event.body);
    console.log(body);
    let response;
    try {
        const resp = await addLFTag(body.tagkey,body.tagvalues);
        response = {
            statusCode:200,
            body: JSON.stringify(resp),
        };
    }catch(error){
        response = {
            statusCode:400,
            body: JSON.stringify(error),
        };
    }
    return response;
};
