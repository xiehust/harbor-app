// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

const jwt = require( "jsonwebtoken");
const bcryptjs = require("bcryptjs");
const mysql =require("mysql");
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




exports.handler  = async (event) => {
  const authorization = event.headers?event.headers.authorization.split(':'):null;
  if (!authorization) 
    return {
        'isAuthorized': false,
        'context':{
            'code':400,
            'msg':'Missing auth headers'
        }
    }
  const user_name = authorization[0];
  const plain_user_pwd = authorization[1];
  //query user in DB
  const secrets_params = await getDbSecrets();
  if (!secrets_params) return {statusCode:500};

  const connection = mysql.createConnection({
    host     : secrets_params.host,
    user     : secrets_params.username,
    password : secrets_params.password,
    database : secrets_params.dbname
  });

  const sql = "SELECT a.id,a.username, a.password,a.secret,a.groupid,b.groupname,b.awsid,b.grouptype \
                    from user_info a join group_info b \
                    where a.username=? and a.groupid=b.id and a.status='active' and b.status='active'";
    const promise1 = new Promise((resolve,reject) =>{ 
        connection.query(sql,[user_name], function (error, results, fields) {
        if (error) return reject(error);
        return resolve(results);
        });
    });
    const [results] = await Promise.all([promise1]);
    console.log('db results,', results);
    
    if (results.length ===0 ) 
        return {
            'isAuthorized': false,
            'context':{
                'code':401,
                'msg':'Invalid username'
            }
    }
    const pwdcompare = await comparePassword(plain_user_pwd,results[0].password);
    if(!pwdcompare)
      return {
            'isAuthorized': false,
            'context':{
                'code':401,
                'msg':'Invalid credentials'
            }
        }
  
  const payload =   {
        userid:results[0].id,
        username: results[0].username,
        groupid: results[0].groupid,
        groupname: results[0].groupname,
        awsid: results[0].awsid,
        "role": results[0].grouptype,
 }



  //create jwt token
  const token = createToken(payload);
  
  return {
    'isAuthorized': true,
    "context": {
        "token": token,
        "payload":payload,
            'code':200,
            'msg':'Success'
    }
}

};
