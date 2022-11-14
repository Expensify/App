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
    WARM_UP_RUNS,
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

const args = process.argv.slice(2);

const baselineBranch = process.env.baseline || DEFAULT_BASELINE_BRANCH;

// Clear all files from previous jobs
try {
    fs.rmSync(OUTPUT_DIR, {recursive: true, force: true});
    fs.mkdirSync(OUTPUT_DIR);
} catch (error) {
    // Do nothing
    console.error(error);
}

const restartApp = async () => {
    Logger.log('Killing app …');
    await killApp('android');
    Logger.log('Launching app …');
    await launchApp('android');
};

const runTestsOnBranch = async (branch, baselineOrCompare) => {
    // Switch branch and install dependencies
    const progress = Logger.progressInfo(`Preparing ${baselineOrCompare} tests on branch '${branch}'`);
    await execAsync(`git switch ${branch}`);

    if (!args.includes('--skipInstallDeps')) {
        progress.updateText(`Preparing ${baselineOrCompare} tests on branch '${branch}' - npm install`);
        await execAsync('npm i');
    }

    // Build app
    if (!args.includes('--skipBuild')) {
        progress.updateText(`Preparing ${baselineOrCompare} tests on branch '${branch}' - building app`);
        await execAsync('npm run android-build-e2e');
    }
    progress.done();

    // Install app and reverse ports
    let progressLog = Logger.progressInfo('Installing app');
    await installApp('android');
    Logger.log('Reversing port (for connecting to testing server) …');
    await reversePort();
    progressLog.done();

    // Start the HTTP server
    const server = createServerInstance();
    await server.start();

    // Create a dict in which we will store the run durations for all tests
    const durationsByTestName = {};

    // Collect results while tests are being executed
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

    // Run the tests
    const numOfTests = _.values(TESTS_CONFIG).length;
    for (let testIndex = 0; testIndex < numOfTests; testIndex++) {
        const config = _.values(TESTS_CONFIG)[testIndex];
        server.setTestConfig(config);

        const warmupLogs = Logger.progressInfo(`Running test '${config.name}'`);
        for (let warmUpRuns = 0; warmUpRuns < WARM_UP_RUNS; warmUpRuns++) {
            const progressText = `(${testIndex + 1}/${numOfTests}) Warmup for test '${config.name}' (iteration ${warmUpRuns + 1}/${WARM_UP_RUNS})`;
            warmupLogs.updateText(progressText);

            await restartApp();

            await withFailTimeout(new Promise((resolve) => {
                const cleanup = server.addTestDoneListener(() => {
                    Logger.log(`Warmup ${warmUpRuns + 1} done!`);
                    cleanup();
                    resolve();
                });
            }), progressText);
        }
        warmupLogs.done();

        // We run each test multiple time to average out the results
        const testLog = Logger.progressInfo('');
        for (let i = 0; i < RUNS; i++) {
            const progressText = `(${testIndex + 1}/${numOfTests}) Running test '${config.name}' (iteration ${i + 1}/${RUNS})`;
            testLog.updateText(progressText);

            const stopVideoRecording = startRecordingVideo();

            await restartApp();

            // Wait for a test to finish by waiting on its done call to the http server
            try {
                await withFailTimeout(new Promise((resolve) => {
                    const cleanup = server.addTestDoneListener(() => {
                        Logger.log(`Test iteration ${i + 1} done!`);
                        cleanup();
                        resolve();
                    });
                }), progressText);
                await stopVideoRecording(false);
            } catch (e) {
                // When we fail due to a timeout it's interesting to take a screenshot of the emulator to see whats going on
                await stopVideoRecording(true);
                testLog.done();
                throw e; // Rethrow to abort execution
            }
        }
        testLog.done();
    }

    // Calculate statistics and write them to our work file
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

    await server.stop();
};

const runTests = async () => {
    Logger.info('Running e2e tests');

    try {
        // Run tests on baseline branch
        await runTestsOnBranch(baselineBranch, 'baseline');

        // Run tests on current branch
        await runTestsOnBranch('-', 'compare');

        await compare();

        process.exit(0);
    } catch (e) {
        Logger.info('\n\nE2E test suite failed due to error:', e, '\nPrinting full logs:\n\n');

        // Write logcat, meminfo, emulator info to file as well:
        require('node:child_process').execSync(`adb logcat -d > ${OUTPUT_DIR}/logcat.txt`);
        require('node:child_process').execSync(`adb shell "cat /proc/meminfo" > ${OUTPUT_DIR}/meminfo.txt`);
        require('node:child_process').execSync(`cat ~/.android/avd/${process.env.AVD_NAME || 'test'}.avd/config.ini > ${OUTPUT_DIR}/emulator-config.ini`);
        require('node:child_process').execSync(`adb shell "getprop" > ${OUTPUT_DIR}/emulator-properties.txt`);

        require('node:child_process').execSync(`cat ${LOG_FILE}`);
        process.exit(1);
    }
};

runTests();
