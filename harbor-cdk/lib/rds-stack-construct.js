import { Stack,Duration,RemovalPolicy, CfnOutput}  from 'aws-cdk-lib';
import * as ec2 from "aws-cdk-lib/aws-ec2"
import * as rds from "aws-cdk-lib/aws-rds"
import { Provider,Role,Database,Sql } from "cdk-rds-sql"

const dbName = 'harbor_db';

export class RdsStack extends Stack {
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
    const cluster = new rds.ServerlessCluster(this, "Cluster", {
        vpc: vpc,
        vpcSubnets: {
          subnets:subnets,
        },
        engine: rds.DatabaseClusterEngine.AURORA_MYSQL,
        // parameterGroup: rds.ParameterGroup.fromParameterGroupName(
        //   this,
        //   "ParameterGroup",
        //   "default.aurora-mysql8.0"
        // ),
        removalPolicy: RemovalPolicy.DESTROY,
        scaling: {
          autoPause: Duration.minutes(10),
          minCapacity: rds.AuroraCapacityUnit.ACU_1,
          maxCapacity: rds.AuroraCapacityUnit.ACU_1,
        },
        credentials: { username: rds_username,
          excludeCharacters:"\"@/\\ '", },
        clusterIdentifier: 'harbor-db-endpoint',
        // defaultDatabaseName:dbName,
        enableDataApi:true,
      });

      // cluster.addRotationSingleUser({
      //   automaticallyAfter: Duration.days(30),
      //   excludeCharacters: "\"@/\\ '",
      //   vpcSubnets: subnets,
      // });

      const provider = new Provider(this, "Provider", {
        vpc: vpc,
        cluster: cluster,
        secret: cluster.secret,
      });

      const role = new Role(this, "Role", {
          provider: provider,
          roleName: "myrole",
          databaseName:dbName,
      });

      const database = new Database(this, "Database", {
          provider: provider,
          databaseName: dbName,
          owner: role,
        });
 
      const sql = new Sql(this, "Sql-createdb", {
        provider: provider,
        database: database,
        statement: `
        CREATE TABLE glue_databases
 ( id INT NOT NULL AUTO_INCREMENT, 
description VARCHAR(500),
s3_location VARCHAR(300),
db_name VARCHAR(100) NOT NULL,
groupname VARCHAR(50) NOT NULL,
groupid INT NOT NULL,
awsid VARCHAR(50) NOT NULL,
created DATETIME,
tables INT,
category1_id VARCHAR(20),
category2_id VARCHAR(20),
status VARCHAR(20),
PRIMARY KEY ( id ),
UNIQUE (db_name)
 ) ENGINE=InnoDB DEFAULT CHARSET=utf8;
      `,
      })
      this.rds_params = {
        secret:cluster.secret,
        secretname:cluster.secret.secretName,
      }
      new CfnOutput(this, 'RDS secrets',{value:role.secret.secretName});
    }
}