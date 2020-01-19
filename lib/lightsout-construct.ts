import { Construct, Duration } from '@aws-cdk/core'
import lambda = require('@aws-cdk/aws-lambda')
import { ManagedPolicy, Role, ServicePrincipal } from '@aws-cdk/aws-iam'
import { Rule, Schedule, CronOptions, RuleTargetInput } from '@aws-cdk/aws-events'
import { LambdaFunction } from '@aws-cdk/aws-events-targets';

const AWS_LAMBDA_DEFAULT_DURATION = 3
const AWS_LAMBDA_DEFAULT_MEMORY_SIZE = 128

export interface CronLambdaProps {
  readonly cronSchedules: CronOptions[],
  readonly timeout? : number,
  readonly memory? : number,
  readonly dryRun?: boolean,
  readonly filters? : any[]
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
      if (!props?.filters || props?.filters.length == 0) {
        fn.addEnvironment('DRY_RUN', 'true')
      }
    }

    props?.cronSchedules?.forEach((opt, idx) => {

      const filters = props?.filters
      const ruleTargetInput = RuleTargetInput.fromObject({input: filters })

      let targetFn:LambdaFunction
      let ruleDescription = JSON.stringify(opt)
      if (!filters) {
        targetFn = new LambdaFunction(fn)
      } else {
        targetFn = new LambdaFunction(fn, { event: ruleTargetInput })
        ruleDescription = ruleDescription + ' ' + JSON.stringify(filters)
      }
      new Rule(this, ''+idx, {
        description: JSON.stringify(opt) + JSON.stringify(filters),
        schedule: Schedule.cron(opt),
        targets: [targetFn]
      })
        
    })

  }

}