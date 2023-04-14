import { NestedStack,Stack, Duration, CfnOutput }  from 'aws-cdk-lib';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import { HttpLambdaAuthorizer, HttpLambdaResponseType } from '@aws-cdk/aws-apigatewayv2-authorizers-alpha';
import * as apigwv2 from '@aws-cdk/aws-apigatewayv2-alpha';
import { API_login,API_auth } from '../lib/apiconfig.js';

export class ApiGatewayStack extends Stack {
    /**
     *
     * @param {Construct} scope
     * @param {string} id
     * @param {StackProps=} props
     */
    constructor(scope, id, props) {
      super(scope, id, props);
      const cors = {
        corsPreflight: {
          allowHeaders: ['*'],
          allowMethods: ['*'],
          allowOrigins: ['*'],
          maxAge: Duration.days(10),
        }
    }
    const handlers = props.handlers;

    //create lambda authorizer
    const authorizer = new HttpLambdaAuthorizer(API_auth, handlers.get(API_auth), {
        responseTypes: [HttpLambdaResponseType.SIMPLE], // Define if returns simple and/or iam response
      });
    
    const api = new apigwv2.HttpApi(this, 'HttpApi',cors);

    //add route for login
    api.addRoutes({
        integration: new HttpLambdaIntegration(API_login, handlers.get(API_login)),
        path: '/'+API_login,
        methods: [ apigwv2.HttpMethod.POST ],
      });

    //add integration routes for other handlers
    handlers.forEach((handle,key) => {
        if (key !== API_login && key !== API_auth ){
            // console.log('add route for api:',key);
            new CfnOutput(this, `add route for api:${key}`,{value:key})
            api.addRoutes({
                integration: new HttpLambdaIntegration(key, handle),
                path: '/'+key,
                methods: [ apigwv2.HttpMethod.POST ],
                authorizer
              });
        }
    })
    //publish api if you need to define a stage name, but HttpApi will always creates a $default stage,
    //unless the createDefaultStage property is unset. 
    // new apigwv2.HttpStage(this, 'Stage', {
    //     httpApi: api,
    //     stageName: 'beta',
    //   });
    }
}