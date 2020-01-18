# CDK LightsOut

Schedule your instances to be toggled on and off.
*A simple tool for simple use cases.*

```typescript
new LightsoutConstruct(this, 'test', {
  cronSchedules: [morningSchedule, eveningSchedule]
})
```

## Import into your stack


## Getting Started

## Configure timers
Configure schedules with CloudWatch Event Rules.
> Remembering all hours are in UTC.

```typescript
    const morningSchedule = {
      day: '*',
      minute: '0',
      hour: '17',
    }
```
## Filter instances
Use any [describeInstances filters](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/EC2.html#describeInstances-property).

```typescript
filters: [
{
  Name: "tag:Purpose", 
  Values: [
     "test"
  ]
}
]
```
## Dry Run
Lambda Toggle function supports DRY_RUN environment variable.

## Handling Alarms
- Avoid alarms on instances started/stopped

## Contributors
### Setup
aws-cdk

### References
- [AWS Construct Library Design Guidelines](https://github.com/aws/aws-cdk/blob/master/design/aws-guidelines.md)
- [Contributor Convenant](CODE_OF_CONDUCT)