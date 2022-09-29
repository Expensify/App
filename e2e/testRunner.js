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
    TESTS_CONFIG,
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
const startRecordingVideo = require('./utils/startRecordingVideo');
const isAppRunning = require('./utils/isAppRunning');

const args = process.argv.slice(2);

const baselineBranch = process.env.baseline || DEFAULT_BASELINE_BRANCH;

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
    let progressLog = Logger.progressInfo('Installing app');
    await installApp('android');
    Logger.log('Reversing port (for connecting to testing server) …');
    await reversePort();
    progressLog.done();

    // start the HTTP server
    const server = createServerInstance();
    await server.start();

    // create a dict in which we will store the run durations for all tests
    const durationsByTestName = {};

    // collect results while tests are being executed
    server.addTestResultListener((testResult) => {
        if (testResult.error != null) {
            throw new Error(`Test '${testResult.name}' failed with error: ${testResult.error}`);
        }
        if (testResult.duration < 0) {
            return;
        }

        Logger.log(`[LISTENER] Test '${testResult.name}' took ${testResult.duration}ms`);
        durationsByTestName[testResult.name] = (durationsByTestName[testResult.name] || []).concat(testResult.duration);
    });

    // run the tests
    const numOfTests = _.values(TESTS_CONFIG).length;
    for (let testIndex = 0; testIndex < numOfTests; testIndex++) {
        const config = _.values(TESTS_CONFIG)[testIndex];
        server.setTestConfig(config);

        // We run each test multiple time to average out the results
        const testLog = Logger.progressInfo(`Running test '${config.name}'`);
        for (let i = 0; i < RUNS; i++) {
            const progressText = `(${testIndex + 1}/${numOfTests}) Running test '${config.name}' (iteration ${i + 1}/${RUNS})`;
            testLog.updateText(progressText);

            const stopVideoRecording = startRecordingVideo();

            // create a promise that will resolve once the app fetched
            // the test config, which signals us that the app really started.
            // Especially on weak systems it can happen that the app crashes during startup.
            const waitForAppStarted = new Promise((resolve, reject) => {
                // check every X seconds if the app is still app
                // it can happen that the app crashes during startup, e.g.
                // on CI. If this happens we want to try restarting the app.
                let retries = 0;
                const intervalId = setInterval(async () => {
                    try {
                        await isAppRunning();
                    } catch (e) {
                        // !!! the app doesn't seem to be active anymore, try to start it again
                        if (retries > 10) {
                            stopVideoRecording(true);
                            clearInterval(intervalId);
                            reject(new Error('App crashed during startup'));
                        }
                        retries++;

                        Logger.log(`App crashed during startup, restarting app (attempt ${retries}/10)`);
                        await launchApp('android');
                    }
                }, 8000);

                server.addTestStartedListener(() => {
                    Logger.log(`Test '${config.name}' started!`);
                    clearInterval(intervalId);
                    resolve();
                });
            });

            await restartApp();
            await waitForAppStarted;

            // wait for a test to finish by waiting on its done call to the http server
            try {
                await withFailTimeout(new Promise((resolve) => {
                    const cleanup = server.addTestDoneListener(() => {
                        cleanup();
                        resolve();
                    });
                }), progressText);
                await stopVideoRecording(false);
            } catch (e) {
                // when we fail due to a timeout it's interesting to take a screenshot of the emulator to see whats going on
                await stopVideoRecording(true);
                throw e; // rethrow to abort execution
            }
        }
        testLog.done();
    }

    // calculate statistics and write them to our work file
    progressLog = Logger.progressInfo('Calculating statics and writing results');
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
    progressLog.done();

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
