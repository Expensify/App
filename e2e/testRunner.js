/**
 * The test runner takes care of running the e2e tests.
 * It will run the tests twice. Once on the branch that
 * we want to base the results on (e.g. main), and then
 * again on another branch we want to compare against the
 * base (e.g. a new feature branch).
 */

/* eslint-disable @lwc/lwc/no-async-await,no-restricted-syntax,no-await-in-loop */
const fs = require('fs');
const {
    DEFAULT_BASELINE_BRANCH,
    OUTPUT_DIR,
    OUTPUT_FILE_CURRENT,
    LOG_FILE,
} = require('./config');
const compare = require('./compare/compare');
const Logger = require('./utils/logger');
const execAsync = require('./utils/execAsync');

const args = process.argv.slice(2);

const baselineBranch = process.env.baseline || DEFAULT_BASELINE_BRANCH;

const TESTS = [
    require('./tests/AppStartTimeTest.e2e'),
];

// clear all files from previous jobs
try {
    fs.rmSync(OUTPUT_DIR, {recursive: true, force: true});
    fs.mkdirSync(OUTPUT_DIR);
} catch (error) {
    // do nothing
    console.error(error);
}

const runTestsOnBranch = async (branch, baselineOrCompare) => {
    // switch branch and install dependencies
    const progress = Logger.progressInfo(`Preparing ${baselineOrCompare} tests on branch '${branch}'`);
    await execAsync(`git switch ${branch}`);
    progress.updateText(`Preparing ${baselineOrCompare} tests on branch '${branch}' - npm install`);
    await execAsync('npm i');

    // build app
    if (!args.includes('--skipBuild')) {
        progress.updateText(`Preparing ${baselineOrCompare} tests on branch '${branch}' - building app`);
        await execAsync('npm run android-build-e2e');
    }
    progress.done();

    // run the tests
    for (const testFunction of TESTS) {
        await testFunction();
    }

    // mv output file
    const outputFileName = `${OUTPUT_DIR}/${baselineOrCompare}.json`;
    await execAsync(`mv ${OUTPUT_FILE_CURRENT} ${outputFileName}`);
};

const runTests = async () => {
    Logger.info('Running e2e tests');

    try {
        // run tests on baseline branch
        await runTestsOnBranch(baselineBranch, 'baseline');

        // run tests on current branch
        await runTestsOnBranch('-', 'compare');

        await compare();

        process.exit(0);
    } catch (e) {
        Logger.info('\n\nE2E test suite failed due to error:', e, '\nPrinting full logs:\n\n');
        require('node:child_process').execSync(`cat ${LOG_FILE}`);
        process.exit(1);
    }
};

runTests();
