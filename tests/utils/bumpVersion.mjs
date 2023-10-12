#!/usr/bin/env node

import {incrementVersion} from '../../.github/libs/versionUpdater.js';

const version = process.argv[2];
const level = process.argv[3];

/* eslint-disable no-console */
const realConsoleLog = console.log;
console.log = () => {};

const output = incrementVersion(version, level);

console.log = realConsoleLog;
console.log(output);
