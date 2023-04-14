import { Stack,Duration,RemovalPolicy, CfnOutput}  from 'aws-cdk-lib';
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as rds from "aws-cdk-lib/aws-rds";
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as dotenv from 'dotenv';
dotenv.config();

const dbName = 'harbor_db';
export class RdsStack extends Stack {
  rds_params;
  cluster;
  /**
   *
   * @param {Construct} scope
   * @param {string} id
   * @param {StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);
    const vpc = props.vpc;
    const subnets = props.subnets;
    const rds_username = process.env.RDS_USERNAME??'admin';

    this.cluster = new rds.ServerlessCluster(this, "Cluster", {
        vpc: vpc,
        vpcSubnets: {
          subnets:subnets,
        },
        engine: rds.DatabaseClusterEngine.AURORA_MYSQL,

        removalPolicy: RemovalPolicy.DESTROY,
        scaling: {
          autoPause: Duration.minutes(10),
          minCapacity: rds.AuroraCapacityUnit.ACU_1,
          maxCapacity: rds.AuroraCapacityUnit.ACU_1,
        },
        credentials: { username: rds_username,
          excludeCharacters:"\"@/\\ '", },
        clusterIdentifier: 'harbor-db-endpoint',
        defaultDatabaseName:dbName,
        enableDataApi:true,
      })
      this.rds_params = {
        secret:this.cluster.secret,
        secretname:this.cluster.secret.secretName,
      }
      // cluster.addRotationSingleUser({
      //   automaticallyAfter: Duration.days(30),
      //   excludeCharacters: "\"@/\\ '",
      //   vpcSubnets: subnets,
      // });
     
  
      
      new CfnOutput(this, 'Username',{value:rds_username});
      new CfnOutput(this, 'Cluster Endpoint',
                {value:`${this.cluster.clusterEndpoint.hostname}:${this.cluster.clusterEndpoint.port}`});
    }



}