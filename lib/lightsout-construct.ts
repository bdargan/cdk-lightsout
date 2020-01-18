import { Construct, Duration } from '@aws-cdk/core'
import lambda = require('@aws-cdk/aws-lambda')
import { ManagedPolicy, Role, ServicePrincipal } from '@aws-cdk/aws-iam'
import { S3Code } from '@aws-cdk/aws-lambda'
import { Rule, Schedule, CronOptions } from '@aws-cdk/aws-events'
import { LambdaFunction } from '@aws-cdk/aws-events-targets';

const AWS_LAMBDA_DEFAULT_DURATION = 3
const AWS_LAMBDA_DEFAULT_MEMORY_SIZE = 128

export interface CronLambdaProps {
  // readonly handler : string,
  // readonly s3Code : S3Code,
  readonly timeout? : number,
  readonly memory? : number,
  readonly cronSchedules: CronOptions[],
  readonly dryRun?: boolean,
  readonly tagFilters? : any[]
}
// TODO: Reduce EC2FullAccess
export class LightsoutConstruct extends Construct {
  constructor(parent: Construct, id: string, props: CronLambdaProps) {
    super(parent, id)

    const role = new Role(this, 'LightsoutLambdaRole', {
      assumedBy: new ServicePrincipal('lambda.amazonaws.com'),
      managedPolicies: [
        ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole'), 
        ManagedPolicy.fromAwsManagedPolicyName('AmazonEC2FullAccess')]
    })

    const srcPath = './lambda/lightsout-lambda.zip'
    const fn = new lambda.Function(this, 'lightsoutToggle', {
      runtime: lambda.Runtime.NODEJS_10_X,
      handler: 'dist/index.handler',
      description: 'Lightsout Lambda will toggle your stop and start instance states',
      code: lambda.Code.fromAsset(srcPath),
      role: role,
      timeout: Duration.seconds(props?.timeout ?? AWS_LAMBDA_DEFAULT_DURATION),
      memorySize: props?.memory ?? AWS_LAMBDA_DEFAULT_MEMORY_SIZE,
    })

    if (props?.dryRun) {
      fn.addEnvironment('DRY_RUN', props.dryRun.toString())
    } else {
      if (!props?.tagFilters || props?.tagFilters.length == 0) {
        fn.addEnvironment('DRY_RUN', 'true')
      }
    }

    props?.cronSchedules?.forEach((opt, idx) => {
      new Rule(this, ''+idx, {
        schedule: Schedule.cron(opt),
        targets: [new LambdaFunction(fn)]
      })
        
    })

  }

}