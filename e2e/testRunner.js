/**
 * The test runner takes care of running the e2e tests.
 * It will run the tests twice. Once on the branch that
 * we want to base the results on (e.g. main), and then
 * again on another branch we want to compare against the
 * base (e.g. a new feature branch).
 */

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

// clear all files from previous jobs
try {
    fs.rmSync(OUTPUT_DIR, {recursive: true, force: true});
    fs.mkdirSync(OUTPUT_DIR);
} catch (error) {
    // do nothing
    console.error(error);
}

const restartApp = () => {
    Logger.log('Relaunching app …');
    return killApp().then(launchApp);
};

const runTestsOnBranch = (branch, baselineOrCompare) => {
    const progress = Logger.progressInfo(`Preparing ${baselineOrCompare} tests on branch '${branch}'`);

    const installDeps = () => {
        if (args.includes('--skipInstallDeps')) {
            return;
        }
        progress.updateText(`Preparing ${baselineOrCompare} tests on branch '${branch}' - npm install`);
        return execAsync('npm i');
    };

    const buildApp = () => {
        if (!args.includes('--skipBuild')) {
            progress.updateText(`Preparing ${baselineOrCompare} tests on branch '${branch}' - building app`);
            return execAsync('npm run android-build-e2e');
        }
        progress.done();
    };

    const installAppAndReversePorts = () => {
        const progressLog = Logger.progressInfo('Installing app');
        return installApp('android')
            .then(() => {
                Logger.log('Reversing port (for connecting to testing server) …');
                return reversePort().then(progressLog.done);
            });
    };

    const switchBranch = execAsync(`git switch ${branch}`);
    switchBranch
        .then(installDeps)
        .then(buildApp)
        .then(installAppAndReversePorts)
        .then(() => {
            // start the HTTP server
            const server = createServerInstance();
            return server.start().then(() => {
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

                // Generate an array of functions, where each function is ar promise for a test run
                const numOfTests = _.values(TESTS_CONFIG).length;
                const testTasks = _.map([...Array(numOfTests).keys()], testIndex => () => {
                    const config = _.values(TESTS_CONFIG)[testIndex];
                    server.setTestConfig(config);

                    const warmupLogs = Logger.progressInfo(`Running test '${config.name}'`);
                    const warmupTasks = _.map([...Array(WARM_UP_RUNS).keys()], runIndex => () => {
                        const progressText = `(${testIndex + 1}/${numOfTests}) Warmup for test '${config.name}' (iteration ${runIndex + 1}/${WARM_UP_RUNS})`;
                        warmupLogs.updateText(progressText);

                        return restartApp().then(() => withFailTimeout(new Promise((resolve) => {
                            const cleanup = server.addTestDoneListener(() => {
                                Logger.log(`Warmup ${runIndex + 1} done!`);
                                cleanup();
                                resolve();
                            });
                        }), progressText));
                    });

                    const warmup = () => _.reduce(warmupTasks, (promise, task) => promise.then(task), Promise.resolve())
                        .then(warmupLogs.done);

                    const testLog = Logger.progressInfo('');

                    // We run each test multiple time to average out the results
                    const testRunTasks = _.map([...Array(RUNS)], runIndex => () => {
                        const progressText = `(${testIndex + 1}/${numOfTests}) Running test '${config.name}' (iteration ${runIndex + 1}/${RUNS})`;
                        testLog.updateText(progressText);

                        const stopVideoRecording = startRecordingVideo();

                        return restartApp().then(() => withFailTimeout(new Promise((resolve) => {
                            // wait for a test to finish by waiting on its done call to the http server
                            const cleanup = server.addTestDoneListener(() => {
                                Logger.log(`Test iteration ${runIndex + 1} done!`);
                                cleanup();
                                resolve();
                            });
                        }), progressText).then(() => stopVideoRecording(false))).catch((e) => {
                            stopVideoRecording(true);
                            testLog.done();
                            throw e;
                        });
                    });

                    const tests = () => _.reduce(testRunTasks, (promise, task) => promise.then(task), Promise.resolve())
                        .then(testLog.done);

                    return warmup().then(tests);
                });

                // run the test tasks in serial
                return _.reduce(testTasks, (promise, task) => promise.then(task), Promise.resolve()).then(() => {
                    // calculate statistics and write them to our work file
                    const progressLog = Logger.progressInfo('Calculating statics and writing results');
                    const outputFileName = `${OUTPUT_DIR}/${baselineOrCompare}.json`;

                    const testNames = _.keys(durationsByTestName);
                    const writeTasks = _.map(testNames, testName => () => {
                        const stats = math.getStats(durationsByTestName[testName]);
                        return writeTestStats(
                            {
                                name: testName,
                                ...stats,
                            },
                            outputFileName,
                        );
                    });
                    const write = () => _.reduce(writeTasks, (promise, task) => promise.then(task), Promise.resolve())
                        .then(progressLog.done);

                    return write().then(server.stop);
                });
            });
        });
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

        // write logcat, meminfo, emulator info to file as well:
        require('node:child_process').execSync(`adb logcat -d > ${OUTPUT_DIR}/logcat.txt`);
        require('node:child_process').execSync(`adb shell "cat /proc/meminfo" > ${OUTPUT_DIR}/meminfo.txt`);
        require('node:child_process').execSync(`cat ~/.android/avd/${process.env.AVD_NAME || 'test'}.avd/config.ini > ${OUTPUT_DIR}/emulator-config.ini`);
        require('node:child_process').execSync(`adb shell "getprop" > ${OUTPUT_DIR}/emulator-properties.txt`);

        require('node:child_process').execSync(`cat ${LOG_FILE}`);
        process.exit(1);
    }
};

runTests();
