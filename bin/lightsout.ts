#!/usr/bin/env node
import 'source-map-support/register';
import cdk = require('@aws-cdk/core');
import { LightsoutStack } from '../lib/lightsout-stack';

const app = new cdk.App();
new LightsoutStack(app, 'LightsoutStack');
