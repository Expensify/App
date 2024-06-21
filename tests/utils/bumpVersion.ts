#!/usr/bin/env node
import * as VersionUpdater from '../../.github/libs/versionUpdater';

const version = process.argv[2];
const level = process.argv[3];

if (!VersionUpdater.isValidSemverLevel(level)) {
    console.error('Invalid semver level:', level);
    process.exit(1);
}

/* eslint-disable no-console */
const realConsoleLog = console.log;
console.log = () => {};

const output = VersionUpdater.incrementVersion(version, level);

console.log = realConsoleLog;
console.log(output);
