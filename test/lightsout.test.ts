import { expect as expectCDK, haveResource } from '@aws-cdk/assert';
import cdk = require('@aws-cdk/core');
import Lightsout = require('../lib/lightsout-stack');

test('Empty Stack', () => {
    // GIVEN
    const app = new cdk.App()

    // WHEN
    const stack = new Lightsout.LightsoutStack(app, 'test')
    
    // THEN
    expectCDK(stack).to(haveResource('AWS::Lambda::Function'))
    expectCDK(stack).to(haveResource('AWS::Events::Rule'))
    
})