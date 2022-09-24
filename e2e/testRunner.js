/* eslint-disable @lwc/lwc/no-async-await,no-restricted-syntax,no-await-in-loop */
const fs = require('fs');
const {execSync} = require('node:child_process');
const {
    OUTPUT_FILE_CURRENT,
    DEFAULT_BASELINE_BRANCH,
    OUTPUT_DIR,
} = require('./config');
const compare = require('./compare/compare');

/**
 * The test runner takes care of running the e2e tests.
 * It will run the tests twice. Once on the branch that
 * we want to base the results on (e.g. main), and then
 * again on another branch we want to compare against the
 * base (e.g. a new feature branch).
 */

const args = process.argv.slice(2);

const baselineBranch = process.env.baseline || DEFAULT_BASELINE_BRANCH;

const TESTS = [
    require('./tests/AppStartTimeTest.e2e'),
];

// clear current results file
try {
    fs.unlinkSync(OUTPUT_FILE_CURRENT);
} catch (error) {
    // do nothing
}

const runTestsOnBranch = async (branch, baselineOrCompare) => {
    console.debug(`Checking out branch ${branch}`);
    execSync(`git switch ${branch}`);
    execSync('npm i');

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

    // mv output file
    const outputFileName = `${OUTPUT_DIR}/${baselineOrCompare}.json`;
    execSync(`mv ${OUTPUT_FILE_CURRENT} ${outputFileName}`);
};

const runTests = async () => {
    // run tests on baseline branch
    await runTestsOnBranch(baselineBranch, 'baseline');

    // run tests on current branch
    await runTestsOnBranch('-', 'compare');

    await compare();

    process.exit(0);
};

runTests();
