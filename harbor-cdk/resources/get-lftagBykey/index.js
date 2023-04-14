var { LakeFormationClient, GetLFTagCommand } = require("@aws-sdk/client-lakeformation"); 
var  { STSClient ,AssumeRoleCommand } = require("@aws-sdk/client-sts");

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


const getLFTag = async(tagkey) =>{
    //get assume role
    const admincred = await assumeAdminRole();
    const lf_client = new LakeFormationClient({ credentials:admincred});
    const command = new GetLFTagCommand({TagKey:tagkey});
    try {
        const response = await lf_client.send(command);
        return response;
    }catch(error){
        console.error('Get LF Tags failed',error);
        return undefined;
    }
}

exports.handler = async(event) => {
    const body = JSON.parse(event.body);
    // console.log(body);
    const resp = await getLFTag(body.tagkey);
    const response = {
        statusCode: resp?200:501,
        body: JSON.stringify(resp),
    };
    return response;
};
