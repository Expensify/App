#!/usr/bin/env node
import GitUtils from '../../.github/libs/GitUtils';

const fromRef = process.argv[2];
const toRef = process.argv[3];

/* eslint-disable no-console */
const realConsoleLog = console.log;
console.log = () => {};

async function main() {
    const output = await GitUtils.getPullRequestsMergedBetween(fromRef, toRef);

    console.log = realConsoleLog;
    console.log(output);
}
main();
