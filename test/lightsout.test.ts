import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import cdk = require('@aws-cdk/core');
import Lightsout = require('../lib/lightsout-stack');
import template = require('./template.json')

test('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new Lightsout.LightsoutStack(app, 'test');
    // THEN
    expectCDK(stack).to(matchTemplate(template, MatchStyle.EXACT))
});