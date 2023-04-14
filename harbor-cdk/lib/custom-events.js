import * as cdk from 'aws-cdk-lib';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as cr from 'aws-cdk-lib/custom-resources';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import  { join }  from 'path';
import { Construct } from 'constructs';

export class MyCustomResource extends Construct {
    response;
  
    constructor(scope, id, props) {
      super(scope, id);
      const rds_params = props.rds_params;
      
      const commonProps = {
        bundling: {
          externalModules: [
            '@aws-sdk',
          ],
          nodeModules:['mysql','jsonwebtoken','bcryptjs']
         },
          environment: {
              RDS_SECRETNAME:rds_params.secretname,
              LF_ADMIN_ROLE_ARN:process.env.LF_ADMIN_ROLE_ARN,
          },
          runtime: lambda.Runtime.NODEJS_18_X,
          vpc:props.vpc,
          vpcSubnets:props.subnets,
      }


      const onEventFn = new NodejsFunction(this, 'rds-initialize', {
        entry: join('resources/custome-event-handler', 'index.js'),
        depsLockFilePath: join('resources/custome-event-handler', 'package-lock.json'),
        ...commonProps,
      });

  
    //   const myProvider = new cr.Provider(this, 'MyProvider', {
    //     onEventHandler: onEventFn,
    //     // isCompleteHandler: isComplete,        // optional async "waiter" lambda, see custom-resource-handler.py
    //     logRetention: logs.RetentionDays.ONE_DAY   // default is INFINITE
    //   });
  
      const resource = new cdk.CustomResource(this, 'Resource1', { 
        serviceToken: onEventFn.functionArn, 
        properties: props });
  
      this.response = resource.getAtt('Att1').toString();
  
    }
  }