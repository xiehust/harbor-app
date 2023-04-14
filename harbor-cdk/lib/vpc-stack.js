import { CfnOutput, Stack }  from 'aws-cdk-lib';
import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';


export class VpcStack extends Stack {


  vpc;
  subnets;
  securityGroups;
  /**
   *
   * @param {Construct} scope
   * @param {string} id
   * @param {StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

    const vpc = new ec2.Vpc(this, 'Vpc', {
        ipAddresses: ec2.IpAddresses.cidr('192.168.0.0/16'),
        maxAzs: 2,
        enableDnsHostnames: true,
        enableDnsSupport: true,
        subnetConfiguration: [
            {
                cidrMask: 20,
                name: 'applications',
                subnetType: ec2.SubnetType.PRIVATE_ISOLATED,
            }]
      });
    this.vpc = vpc;
    const subnets = vpc.isolatedSubnets;
    this.subnets =subnets;
 

    //add securitygroups
    const securityGroup = new ec2.SecurityGroup(this,'lambda-security-group',
        {vpc,
        description: 'Allow SSH (TCP port 22) in',});
    const sgid = securityGroup.securityGroupId;

    securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(22), 'Allow SSH Access');
    securityGroup.addIngressRule(securityGroup, ec2.Port.allTraffic(), 'Allow self traffic');
    this.securityGroups = securityGroup;
    new CfnOutput(this,'subnets',{value:subnets.join()});
    // add interface endpionts for glue, lakeformation, sts, rds
    // !!! they are quite expensive, so only add one interface for each service   
    // vpc.addInterfaceEndpoint('glue',{
    //     service:ec2.InterfaceVpcEndpointAwsService.GLUE,
    //     securityGroups:[securityGroup],
    //      subnets:{subnets:[subnets[0]]}}
    //     });
    // vpc.addInterfaceEndpoint('lake-formation',{
    //     service:ec2.InterfaceVpcEndpointAwsService.LAKE_FORMATION,
    //     securityGroups:[securityGroup],
    //      subnets:{subnets:[subnets[0]]}}
    // });
    // vpc.addInterfaceEndpoint('sts',{
    //     service:ec2.InterfaceVpcEndpointAwsService.STS,
    //     securityGroups:[securityGroup],
    //     subnets:{subnets:[subnets[0]]}}
    // });
    // vpc.addInterfaceEndpoint('rds',{
    //     service:ec2.InterfaceVpcEndpointAwsService.RDS,
    //     securityGroups:[securityGroup],
    //      subnets:{subnets:[subnets[0]]}}
    //     );
      vpc.addInterfaceEndpoint('secretsmanager',{
      service:ec2.InterfaceVpcEndpointAwsService.SECRETS_MANAGER,
      securityGroups:[securityGroup],
      subnets:{subnets:[subnets[0]]}}
      );
}
}