// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

const jwt = require("jsonwebtoken");
const bcryptjs = require( "bcryptjs");
const mysql = require("mysql");
const { SecretsManagerClient, GetSecretValueCommand } = require("@aws-sdk/client-secrets-manager");

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



const formatResponse = (code, errormsg, token) => {
  const response = {
    isAuthorized:(code === 200),
    body: {
      message: errormsg,
      token: token,
    },
  };
  return response;
};




exports.handler = async (event) => {
  const body = JSON.parse(event.body);
  // console.log(body);
  const hash_pwd = await hashPassword(body.password)

  //query user in DB
  const secrets_params = await getDbSecrets();
  if (!secrets_params) return {statusCode:500};
  const connection = mysql.createConnection({
      host     : secrets_params.host,
      user     : secrets_params.username,
      password : secrets_params.password,
      database : secrets_params.dbname
    });
  let affectedRows;
  const sql = "INSERT INTO user_info (id,username,password,email,groupid,lastupdated,status) \
                    VALUES(0,?,?,?,?,?,?) ";
  const val = [body.username,hash_pwd,body.email,body.groupid,body.lastupdated,body.status];
    connection.query(sql,val, function (error, results, fields) {
    if (error) throw (error);
        affectedRows = results.affectedRows;
    });

  return new Promise( ( resolve, reject ) => {
        const response = {
            statusCode: 200,
            body: JSON.stringify({affectedRows:affectedRows}),
        }
        resolve(response);
})
};
