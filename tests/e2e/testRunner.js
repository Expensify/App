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
const defaultConfig = require('./config');
const compare = require('./compare/compare');
const Logger = require('./utils/logger');
const execAsync = require('./utils/execAsync');
const killApp = require('./utils/killApp');
const launchApp = require('./utils/launchApp');
const createServerInstance = require('./server');
const installApp = require('./utils/installApp');
const math = require('./measure/math');
const writeTestStats = require('./measure/writeTestStats');
const withFailTimeout = require('./utils/withFailTimeout');
const reversePort = require('./utils/androidReversePort');
const getCurrentBranchName = require('./utils/getCurrentBranchName');

const args = process.argv.slice(2);

let config = defaultConfig;
const setConfigPath = (configPathParam) => {
    let configPath = configPathParam;
    if (!configPath.startsWith('.')) {
        configPath = `./${configPath}`;
    }
    const customConfig = require(configPath);
    config = _.extend(defaultConfig, customConfig);
};

let baselineBranch = process.env.baseline || config.DEFAULT_BASELINE_BRANCH;

// There are three build modes:
// 1. full: rebuilds the full native app in (e2e) release mode
// 2. js-only: only rebuilds the js bundle, and then re-packages
//             the existing native app with the new package. If there
//             is no existing native app, it will fallback to mode "full"
// 3. skip: does not rebuild anything, and just runs the existing native app
let buildMode = 'full';

// When we are in dev mode we want to apply certain default params and configs
const isDevMode = args.includes('--development');
if (isDevMode) {
    setConfigPath('config.local.js');
    baselineBranch = getCurrentBranchName();
    buildMode = 'js-only';
}

if (args.includes('--config')) {
    const configPath = args[args.indexOf('--config') + 1];
    setConfigPath(configPath);
}

// Clear all files from previous jobs
try {
    fs.rmSync(config.OUTPUT_DIR, {recursive: true, force: true});
    fs.mkdirSync(config.OUTPUT_DIR);
} catch (error) {
    // Do nothing
    console.error(error);
}

if (isDevMode) {
    Logger.note(`Running in development mode. Set baseline branch to same as current ${baselineBranch}`);
}

const restartApp = async () => {
    Logger.log('Killing app …');
    await killApp('android');
    Logger.log('Launching app …');
    await launchApp('android');
};

const runTestsOnBranch = async (branch, baselineOrCompare) => {
    if (args.includes('--buildMode')) {
        buildMode = args[args.indexOf('--buildMode') + 1];
    }
    let appPath = baselineOrCompare === 'baseline' ? config.APP_PATHS.baseline : config.APP_PATHS.compare;

    // check if using buildMode "js-only" or "none" is possible
    if (buildMode !== 'full') {
        const appExists = fs.existsSync(appPath);
        if (!appExists) {
            Logger.warn(`Build mode "${buildMode}" is not possible, because the app does not exist. Falling back to build mode "full".`);
            buildMode = 'full';
        }
    }

    // Switch branch
    Logger.log(`Preparing ${baselineOrCompare} tests on branch '${branch}'`);
    await execAsync(`git checkout ${branch}`);

    if (!args.includes('--skipInstallDeps')) {
        Logger.log(`Preparing ${baselineOrCompare} tests on branch '${branch}' - npm install`);
        await execAsync('npm i');
    }

    // Build app
    if (buildMode === 'full') {
        Logger.log(`Preparing ${baselineOrCompare} tests on branch '${branch}' - building app`);
        await execAsync('npm run android-build-e2e');
    } else if (buildMode === 'js-only') {
        Logger.log(`Preparing ${baselineOrCompare} tests on branch '${branch}' - building js bundle`);

        // Build a new JS bundle
        const tempDir = `${config.OUTPUT_DIR}/temp`;
        const tempBundlePath = `${tempDir}/index.android.bundle`;
        await execAsync(`rm -rf ${tempDir} && mkdir ${tempDir}`);
        await execAsync(`npx react-native bundle --platform android --dev false --entry-file ${config.ENTRY_FILE} --bundle-output ${tempBundlePath}`);

        // Repackage the existing native app with the new bundle
        const tempApkPath = `${tempDir}/app-release.apk`;
        await execAsync(`./scripts/android-repackage-app-bundle-and-sign.sh ${appPath} ${tempBundlePath} ${tempApkPath}`);
        appPath = tempApkPath;
    }

    // Install app and reverse port
    let progressLog = Logger.progressInfo('Installing app and reversing port');
    await installApp('android', appPath);
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
    const numOfTests = _.values(config.TESTS_CONFIG).length;
    for (let testIndex = 0; testIndex < numOfTests; testIndex++) {
        const testConfig = _.values(config.TESTS_CONFIG)[testIndex];

        // check if we want to skip the text
        if (args.includes('--includes')) {
            const includes = args[args.indexOf('--includes') + 1];

            // assume that "includes" is a regexp
            if (!testConfig.name.match(includes)) {
                // eslint-disable-next-line no-continue
                continue;
            }
        }

        server.setTestConfig(testConfig);

        const warmupLogs = Logger.progressInfo(`Running test '${testConfig.name}'`);
        for (let warmUpRuns = 0; warmUpRuns < config.WARM_UP_RUNS; warmUpRuns++) {
            const progressText = `(${testIndex + 1}/${numOfTests}) Warmup for test '${testConfig.name}' (iteration ${warmUpRuns + 1}/${config.WARM_UP_RUNS})`;
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
        for (let i = 0; i < config.RUNS; i++) {
            const progressText = `(${testIndex + 1}/${numOfTests}) Running test '${testConfig.name}' (iteration ${i + 1}/${config.RUNS})`;
            testLog.updateText(progressText);

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
            } catch (e) {
                // When we fail due to a timeout it's interesting to take a screenshot of the emulator to see whats going on
                testLog.done();
                throw e; // Rethrow to abort execution
            }
        }
        testLog.done();
    }

    // Calculate statistics and write them to our work file
    progressLog = Logger.progressInfo('Calculating statics and writing results');
    const outputFileName = `${config.OUTPUT_DIR}/${baselineOrCompare}.json`;
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
        require('node:child_process').execSync(`adb logcat -d > ${config.OUTPUT_DIR}/logcat.txt`);
        require('node:child_process').execSync(`adb shell "cat /proc/meminfo" > ${config.OUTPUT_DIR}/meminfo.txt`);
        require('node:child_process').execSync(`adb shell "getprop" > ${config.OUTPUT_DIR}/emulator-properties.txt`);

        require('node:child_process').execSync(`cat ${config.LOG_FILE}`);
        try {
            require('node:child_process').execSync(`cat ~/.android/avd/${process.env.AVD_NAME || 'test'}.avd/config.ini > ${config.OUTPUT_DIR}/emulator-config.ini`);
        } catch (ignoredError) {
            // the error is ignored, as the file might not exist if the test
            // run wasn't started with an emulator
        }
        process.exit(1);
    }
};

runTests();
