#!/usr/bin/env node

const GitUtils = require('../../.github/libs/GitUtils');

// eslint-disable-next-line @lwc/lwc/no-async-await
(async () => {
    /* eslint-disable no-console */
    const realConsoleLog = console.log;
    console.log = () => {};

    const output = await GitUtils.getPullRequestsMergedBetween(process.argv[2], process.argv[3]);

    console.log = realConsoleLog;
    console.log(output);
})();
