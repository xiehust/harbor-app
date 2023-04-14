// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

const { LakeFormationClient, ListLFTagsCommand } = require("@aws-sdk/client-lakeformation");
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





const listLFTags = async () =>{
    //get assume role
    const admincred = await assumeAdminRole();
    if (!admincred) return undefined;
    
    const lf_client = new LakeFormationClient({ 
                    credentials:admincred});


    
    const getData = async(input) => {
        const command = new ListLFTagsCommand(input);
        try {
            const response = await lf_client.send(command);
            return response;
        }catch(error){
            console.error('list LF Tags failed',error);
            return undefined;
        }
    }
    let dbs = [];
    let resp;
    let stop = false;
    let nextToken = '';
    const maxResult = 100;
    while (!stop ){
        resp = await getData({
                MaxResults:maxResult,
                NextToken:nextToken
        });
        if (resp !== undefined) {
            if (resp.LFTags.length === 0 || resp.LFTags.length < maxResult){
                stop =true;
            }
            dbs = dbs.concat(resp.LFTags);
            nextToken = resp.NextToken;
        }
        else{
            stop =true;
        }
    }
    return dbs;
}


exports.handler = async (event) => {
    const body = JSON.parse(event.body);
    // console.log(body);
    const tagpairs = await listLFTags(body.admin);

    return   {
                    statusCode: 200,
                body: JSON.stringify(tagpairs),
            }

}
