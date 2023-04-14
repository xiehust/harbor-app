import { Stack }  from 'aws-cdk-lib';
import { VpcStack } from '../lib/vpc-stack.js';
import { LambdaStack } from '../lib/lambda-stack.js';
import {ApiGatewayStack} from './apigateway-stack.js';
import { RdsStack } from './rds-stack.js';
// import {MyCustomResource} from './custom-events.js';
import * as rds from "aws-cdk-lib/aws-rds";
import * as dotenv from 'dotenv';
dotenv.config();

export class HarborCdkStack extends Stack {
  /**
   *
   * @param {Construct} scope
   * @param {string} id
   * @param {StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

    console.log('----------',props.env)
    //setup a VPC
    const vpcStack = new VpcStack(this,'vpc-stack',{env:props.env});
    const vpc = vpcStack.vpc;
    const subnets = vpcStack.subnets;

    //setup RDS
    const rdstack = new RdsStack(this,'rds-stack',{vpc:vpc,subnets:subnets,env:props.env});
    rdstack.addDependency(vpcStack);
    const rds_params = rdstack.rds_params;

    // const myCr = new MyCustomResource(this,'rds-initialize',{vpc,subnets,rds_params});
    // myCr.node.addDependency(rds);

    //setup Lambdas
    const lambdaStack = new LambdaStack(this,'lambda-stack',{vpc,subnets,rds_params,env:props.env});
    lambdaStack.addDependency(vpcStack);
    lambdaStack.addDependency(rdstack);
    
    const handlersMap = lambdaStack.handlersMap;

    //setup apigw
    const apigwStack = new ApiGatewayStack(this,'apigateway',{handlers:handlersMap,env:props.env})
    apigwStack.addDependency(lambdaStack);

  }
}


