/**
 * The test runner takes care of running the e2e tests.
 * It will run the tests twice. Once on the branch that
 * we want to base the results on (e.g. main), and then
 * again on another branch we want to compare against the
 * base (e.g. a new feature branch).
 */

/* eslint-disable @lwc/lwc/no-async-await,no-restricted-syntax,no-await-in-loop */
const fs = require('fs');
const _ = require('underscore');
const {
    DEFAULT_BASELINE_BRANCH,
    OUTPUT_DIR,
    LOG_FILE,
    RUNS,
} = require('./config');
const compare = require('./compare/compare');
const Logger = require('./utils/logger');
const execAsync = require('./utils/execAsync');
const killApp = require('./utils/killApp');
const launchApp = require('./utils/launchApp');
const createServerInstance = require('./server');
const installApp = require('./utils/installApp');
const reversePort = require('./utils/androidReversePort');
const math = require('./measure/math');
const writeTestStats = require('./measure/writeTestStats');
const withFailTimeout = require('./utils/withFailTimeout');

const args = process.argv.slice(2);

const baselineBranch = process.env.baseline || DEFAULT_BASELINE_BRANCH;

const TESTS = [
    {
        name: 'App start time',
    },
];

// clear all files from previous jobs
try {
    fs.rmSync(OUTPUT_DIR, {recursive: true, force: true});
    fs.mkdirSync(OUTPUT_DIR);
} catch (error) {
    // do nothing
    console.error(error);
}

const restartApp = async () => {
    Logger.log('Killing app …');
    await killApp('android');
    Logger.log('Launching app …');
    await launchApp('android');
};

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

    // install app and reverse ports
    const progressLog = Logger.progressInfo('Installing app');
    await installApp('android');
    Logger.log('Reversing port (for connecting to testing server) …');
    await reversePort();
    progressLog.done();

    // start the HTTP server
    const server = createServerInstance();
    await server.start();

    // create a dict in which we will store the run durations for all tests
    const durationsByTestName = {};

    // collect durations while tests are being executed
    server.addTestResultListener((testResult) => {
        if (testResult.error != null) {
            Logger.info(`Test '${testResult.name}' failed with error: ${testResult.error}`);
            return;
        }
        if (testResult.duration < 0) {
            return;
        }

        Logger.log(`[LISTENER] Test '${testResult.name}' took ${testResult.duration}ms`);
        durationsByTestName[testResult.name] = (durationsByTestName[testResult.name] || []).concat(testResult.duration);
    });

    // run the tests
    for (const test of TESTS) {
        const testLog = Logger.progressInfo(`Running test '${test.name}'`);
        for (let i = 0; i < RUNS; i++) {
            const progressText = `Running test '${test.name}' (iteration ${i + 1}/${RUNS})`;
            testLog.updateText(progressText);

            // TODO: when adding more test cases, we'd need to tell the app here, which test to start
            await restartApp();

            // wait for a test to finish by waiting on its done call to the http server
            await withFailTimeout(new Promise((resolve) => {
                const cleanup = server.addTestDoneListener(() => {
                    cleanup();
                    resolve();
                });
            }), progressText);
        }
        testLog.done();
    }

    // calculate statistics and write them to our work file
    const outputFileName = `${OUTPUT_DIR}/${baselineOrCompare}.json`;
    for (const testName of _.keys(durationsByTestName)) {
        const stats = math.getStats(durationsByTestName[testName]);
        await writeTestStats(
            {
                name: testName,
                ...stats,
            },
            outputFileName,
        );
    }

    // close server
    await server.stop();
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
