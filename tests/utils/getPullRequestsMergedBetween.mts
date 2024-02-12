#!/usr/bin/env node

import {getPullRequestsMergedBetween} from '../../.github/libs/GitUtils';

const fromRef = process.argv[2];
const toRef = process.argv[3];

/* eslint-disable no-console */
const realConsoleLog = console.log;
console.log = () => {};
async function main (){

    const output = await getPullRequestsMergedBetween(fromRef, toRef);
    
    console.log = realConsoleLog;
    console.log(output);
}
main()
