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
const math = require('./measure/math');
const writeTestStats = require('./measure/writeTestStats');
const withFailTimeout = require('./utils/withFailTimeout');
const startRecordingVideo = require('./utils/startRecordingVideo');
const runTestAndGetResults = require('./appium/runTestAndGetResults');

const args = process.argv.slice(2);

const baselineBranch = process.env.baseline || DEFAULT_BASELINE_BRANCH;

// TODO: Run tests with runTestAndGetResults
// TODO: add option to run tests locally with appium, or do a cloud run with AWS device farm
// TODO: get the results from cloudfarm back into this script
// TODO: process results as usual

// Clear all files from previous jobs
try {
    fs.rmSync(OUTPUT_DIR, {recursive: true, force: true});
    fs.mkdirSync(OUTPUT_DIR);
} catch (error) {
    // Do nothing
    console.error(error);
}

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

    // Create a dict in which we will store the run durations for all tests
    const durationsByTestName = {};

    // Run the tests
    const numOfTests = _.values(TESTS_CONFIG).length;
    for (let testIndex = 0; testIndex < numOfTests; testIndex++) {
        const config = _.values(TESTS_CONFIG)[testIndex];

        const warmupLogs = Logger.progressInfo(`Running test '${config.name}'`);
        for (let warmUpRuns = 0; warmUpRuns < WARM_UP_RUNS; warmUpRuns++) {
            const progressText = `(${testIndex + 1}/${numOfTests}) Warmup for test '${config.name}' (iteration ${warmUpRuns + 1}/${WARM_UP_RUNS})`;
            warmupLogs.updateText(progressText);

            await withFailTimeout(runTestAndGetResults(config.name), progressText);
        }
        warmupLogs.done();

        // We run each test multiple time to average out the results
        const testLog = Logger.progressInfo('');
        for (let i = 0; i < RUNS; i++) {
            const progressText = `(${testIndex + 1}/${numOfTests}) Running test '${config.name}' (iteration ${i + 1}/${RUNS})`;
            testLog.updateText(progressText);

            const stopVideoRecording = startRecordingVideo();

            // Wait for a test to finish by waiting on its done call to the http server
            try {
                const results = await withFailTimeout(runTestAndGetResults(config.name), progressText);
                results.forEach((result) => {
                    durationsByTestName[result.name] = durationsByTestName[result.name] || [];
                    durationsByTestName[result.name].push(result.duration);
                });

                await stopVideoRecording(false);
            } catch (e) {
                // When we fail due to a timeout it's interesting to take a screenshot of the emulator to see whats going on
                await stopVideoRecording(true);
                testLog.done();
                throw e; // Rethrow to abort execution
            }

            await new Promise(resolve => setTimeout(resolve, 2000));
        }
        testLog.done();
    }

    // Calculate statistics and write them to our work file
    const progressLog = Logger.progressInfo('Calculating statics and writing results');
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
