#!/usr/bin/env node

import {getPreviousVersion} from '../../.github/libs/versionUpdater.js';

const currentVersion = process.argv[2];
const level = process.argv[3];

/* eslint-disable no-console */
const realConsoleLog = console.log;
console.log = () => {};

const output = getPreviousVersion(currentVersion, level);

console.log = realConsoleLog;
console.log(output);
