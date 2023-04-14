import { NestedStack ,Stack,Duration}  from 'aws-cdk-lib';
import lambda  from "aws-cdk-lib/aws-lambda";
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { Role,  } from 'aws-cdk-lib/aws-iam';
import { Rule, Schedule } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import  { join }  from 'path';
import * as dotevn from 'dotenv';
import * as Apis from './apiconfig.js';

dotevn.config();

export class LambdaStack extends Stack {
  /**
   *
   * @param {Construct} scope
   * @param {string} id
   * @param {StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);
    this.handlersMap = new Map();

    const role = Role.fromRoleArn(this,'lfadminrole',process.env.LF_ADMIN_ROLE_ARN,{mutable: false});

    // const role = new Role(this, 'LfadminRole', {
    //   assumedBy: new ServicePrincipal('lakeformation.amazonaws.com'),
    // });

    // role.addToPolicy(new PolicyStatement({
    //   resources: ['*'],
    //   actions: ['lakeformation:*'],
    // }));


    const rds_params = props.rds_params;
    const rds_secret = rds_params.secret;
    //with mysql dependency
    const commonProps = {
      bundling: {
        externalModules: [
          '@aws-sdk',
        ]
       },
        environment: {
            RDS_SECRETNAME:rds_params.secretname,
            LF_ADMIN_ROLE_ARN:process.env.LF_ADMIN_ROLE_ARN,
        },
        runtime: lambda.Runtime.NODEJS_18_X,
        vpc:props.vpc,
        vpcSubnets:props.subnets,
    }
    const nodeJsFunctionProps_mysql = {
      ...commonProps,
      bundling: {
        externalModules: [
          '@aws-sdk',
        ],
        nodeModules:['mysql']
      },
    }

    //with mysql dependency
    const nodeJsFunctionProps_login = {
        ...commonProps,
        environment: {
            ...commonProps.environment,
            TOKEN_KEY: process.env.TOKEN_KEY,
        },
        bundling: {
            externalModules: [
            '@aws-sdk',
            ],
            nodeModules:['mysql','jsonwebtoken','bcryptjs']
        },
        }
    const createLambdaFn = (path,index_fname,api,envProps=nodeJsFunctionProps_mysql)=>{
      let handler = new NodejsFunction(this, api, {
        entry: join(path, index_fname),
        depsLockFilePath: join(path, 'package-lock.json'),
        ...envProps,
      });
      //grant secret manager permission 
      rds_secret.grantRead(handler);
      //grand lambda the permission to assume lfadmin role;
      role.grantAssumeRole(handler.grantPrincipal);
      this.handlersMap.set(api,handler);
    }

    //1 lambda for authorizer
    createLambdaFn('resources/auth','index.js',Apis.API_auth,{
      ...commonProps,
        environment: {
            TOKEN_KEY: process.env.TOKEN_KEY,
        },
        bundling: {
            externalModules: [
            '@aws-sdk',
            ],
            nodeModules:['jsonwebtoken']
        },
    })

    //2 lambda for login
    createLambdaFn('resources/login','index.js',Apis.API_login,nodeJsFunctionProps_login);

    //3 lambda for getsubscriptionlist
    createLambdaFn('resources/get-subscriptionlist','index.js',Apis.API_fetchSubscriptionlist);

   //4 lambda for adduser
   createLambdaFn('resources/adduser','index.js',Apis.API_adduser,nodeJsFunctionProps_login);

    //5 lambda for addgroup
    createLambdaFn('resources/addgroup','index.js',Apis.API_addgroup);
    //6 lambda  addlftags
    createLambdaFn('resources/addlftags','index.mjs',Apis.API_addlftag,{...commonProps,depsLockFilePath:undefined});
    //7 lambda createapproval
    createLambdaFn('resources/createapproval','index.js',Apis.API_createapproval);
    //8 lambda get-approval-list
    createLambdaFn('resources/get-approval-list','index.js',Apis.API_getapprovals);
    //9 lambda
    createLambdaFn('resources/list-databases','index.js',Apis.API_fetchDatabaselist);
    //10
    createLambdaFn('resources/list-allgroups','index.js',Apis.API_listallgroups);
    //11
    createLambdaFn('resources/refresh-glue-tables','index.js',Apis.API_refreshDatabaseList,{...nodeJsFunctionProps_mysql,timeout:Duration.seconds(10)});
    //12
    createLambdaFn('resources/approve-subscription','index.js',Apis.API_approvesubscription,{...nodeJsFunctionProps_mysql,timeout:Duration.seconds(5)});
    //13
    createLambdaFn('resources/get-sharinggraph','index.js',Apis.API_getSharingGraph);
     //14
     createLambdaFn('resources/list-lftags','index.js',Apis.API_listlftags,{...commonProps,depsLockFilePath:undefined});
    //15
    createLambdaFn('resources/get-overview-stats','index.js',Apis.API_getOverviewStats);
    //16
    createLambdaFn('resources/get-lftags','index.js',Apis.API_getlftagByResource,{...commonProps,depsLockFilePath:undefined});
    //17
    createLambdaFn('resources/approve-record','index.js',Apis.API_createdb);
    //18
    createLambdaFn('resources/get-database','index.js',Apis.API_fetchDatabase);
    //19
    createLambdaFn('resources/get-gluetable','index.js',Apis.API_fetchGlueTable);
    //20
    createLambdaFn('resources/list-glue-tables','index.js',Apis.API_fetchGlueTablelist);
    //21
    createLambdaFn('resources/get-approvals-stats','index.js',Apis.API_getApprovalStats);
    //22
    createLambdaFn('resources/deletelftag','index.js',Apis.API_deletelftag,{...commonProps,depsLockFilePath:undefined});
    //23
    createLambdaFn('resources/subscribe-tables','index.js',Apis.API_subscribetables);
    //24
    createLambdaFn('resources/get-sharingpermissionByresource','index.js',Apis.API_getSharingsbyRes);
    //25
    createLambdaFn('resources/get-approval-record','index.js',Apis.API_getApproveRecord);
    //26
    createLambdaFn('resources/get-lftagBykey','index.js',Apis.API_getlftagByKey,{...commonProps,depsLockFilePath:undefined});
    //27
    createLambdaFn('resources/get-gluetableById','index.js',Apis.API_fetchGlueTablebyId);


    //add refresh event
    const lambdaTaskTarget = new LambdaFunction(this.handlersMap.get(Apis.API_refreshDatabaseList));
    new Rule(this, 'ScheduleRule', {
     schedule: Schedule.cron({ minute: '5' }),
     targets: [lambdaTaskTarget],
    });
    }
}