import cdk = require('@aws-cdk/core');
import { LightsoutConstruct } from './lightsout-construct'

export class LightsoutStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string) {
    super(scope, id);

    const morningSchedule = {
      day: '*',
      minute: '0',
      hour: '20',
    }

    const eveningSchedule = {
      day: '*',
      minute: '0',
      hour: '9',
    }

    new LightsoutConstruct(this, 'test', {
      cronSchedules: [morningSchedule, eveningSchedule]
    })
  }
}
