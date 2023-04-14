// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

const jwt = require( "jsonwebtoken");
const bcryptjs = require("bcryptjs");
const mysql =require("mysql");
const { SecretsManagerClient, GetSecretValueCommand } = require("@aws-sdk/client-secrets-manager");

const getDbSecrets = async (name) =>{
  const secretName = process.env.RDS_SECRETNAME&&name;
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

const createToken = (payload) => {
  return jwt.sign({ payload: payload }, process.env.TOKEN_KEY, {
    expiresIn: "24h",
  });
};

const hashPassword = async (plaintextPassword) => {
  const hash = await bcryptjs.hash(plaintextPassword, 5); //It commonly ranges between 5 and 15. In this demo, we will use 5.
  return hash
};

const comparePassword = async (plaintextPassword, hash) => {
  const result = await bcryptjs.compare(plaintextPassword, hash);
  return result;
};


exports.handler = async function(event) {
    const id = event.PhysicalResourceId; // only for "Update" and "Delete"
    const props = event.ResourceProperties;
    const oldProps = event.OldResourceProperties; // only for "Update"s
  
      //query user in DB
    const secrets_params = await getDbSecrets(props.rds_secretname);
    if (!secrets_params) return {statusCode:500};

    const connection = mysql.createConnection({
        host     : secrets_params.host,
        user     : secrets_params.username,
        password : secrets_params.password,
        database : secrets_params.dbname
    });


    switch (event.RequestType) {
      case "Create":
        // ...
  
      case "Update":
        // ...
  
        // if an error is thrown, a FAILED response will be submitted to CFN
        throw new Error('Failed!');
  
      case "Delete":
        // ...
    }
  
    return {
      // (optional) the value resolved from `resource.ref`
      // defaults to "event.PhysicalResourceId" or "event.RequestId"
      PhysicalResourceId: "REF",
  
      // (optional) calling `resource.getAtt("Att1")` on the custom resource in the CDK app
      // will return the value "BAR".
      Data: {
        Att1: "BAR",
        Att2: "BAZ"
      },
  
      // (optional) user-visible message
      Reason: "User-visible message",
  
      // (optional) hides values from the console
      NoEcho: true
    };
  }