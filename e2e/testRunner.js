/* eslint-disable @lwc/lwc/no-async-await,no-restricted-syntax,no-await-in-loop */
const fs = require('fs');
const {execSync} = require('node:child_process');
const {OUTPUT_FILE_CURRENT} = require('./config');

const args = process.argv.slice(2);

const TESTS = [
    require('./tests/AppStartTimeTest.e2e'),
];

// clear current results file
try {
    fs.unlinkSync(OUTPUT_FILE_CURRENT);
} catch (error) {
    // do nothing
}

const runTests = async () => {
    // build app
    if (!args.includes('--skipBuild')) {
        console.debug('Building android app...');
        execSync('npm run android-build-e2e');
    }

    // run tests
    console.debug('Running tests...');
    for (const testFunction of TESTS) {
        await testFunction();
    }

    process.exit(0);
};

// TODO: run one test as baseline on branch A
// TODO: write the current workfile as baseline
// TODO: repeat the same test as compare on branch B
// TODO: write the current workfile as compare
// TODO: calculate the compare of the two test runs and output the results

runTests();
