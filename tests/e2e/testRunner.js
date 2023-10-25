/**
 * Multifaceted script, its main function is running the e2e tests.
 *
 * When running in a local environment it can take care of building the APKs required for e2e testing
 * When running on the CI (depending on the flags passed to it) it will skip building and just package/re-sign
 * the correct e2e JS bundle into an existing APK
 *
 * It will run only one set of tests per branch, for you to compare results to get a performance analysis
 * You need to run it twice, once with the base branch (--branch main) and another time with another branch
 * and a label to (--branch my_branch --label delta)
 *
 * This two runs will generate a main.json and a delta.json with the performance data, which then you can merge via
 * node tests/e2e/merge.js
 */

/* eslint-disable @lwc/lwc/no-async-await,no-restricted-syntax,no-await-in-loop */
const fs = require('fs');
const _ = require('underscore');
const defaultConfig = require('./config');
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

// VARIABLE CONFIGURATION
const args = process.argv.slice(2);

let branch = 'main';
if (args.includes('--branch')) {
    branch = args[args.indexOf('--branch') + 1];
}

let label = branch;
if (args.includes('--label')) {
    label = args[args.indexOf('--label') + 1];
}

let config = defaultConfig;
const setConfigPath = (configPathParam) => {
    let configPath = configPathParam;
    if (!configPath.startsWith('.')) {
        configPath = `./${configPath}`;
    }
    const customConfig = require(configPath);
    config = _.extend(defaultConfig, customConfig);
};

const skipCheckout = args.includes('--skipCheckout');

const skipInstallDeps = args.includes('--skipInstallDeps');

// There are three build modes:
// 1. full: rebuilds the full native app in (e2e) release mode
// 2. js-only: only rebuilds the js bundle, and then re-packages
//             the existing native app with the new bundle. If there
//             is no existing native app, it will fallback to mode "full"
// 3. skip: does not rebuild anything, and just runs the existing native app
let buildMode = 'full';

// When we are in dev mode we want to apply certain default params and configs
const isDevMode = args.includes('--development');
if (isDevMode) {
    setConfigPath('config.local.js');
    buildMode = 'js-only';
}

if (args.includes('--buildMode')) {
    buildMode = args[args.indexOf('--buildMode') + 1];
}

if (args.includes('--config')) {
    const configPath = args[args.indexOf('--config') + 1];
    setConfigPath(configPath);
}

// Important set app path after correct config file has been set
let appPath = config.APP_PATH;
if (args.includes('--appPath')) {
    appPath = args[args.indexOf('--appPath') + 1];
}

// Create some variables after the correct config file has been loaded
const OUTPUT_FILE = `${config.OUTPUT_DIR}/${label}.json`;

if (isDevMode) {
    Logger.note(`🟠 Running in development mode.`);
}

if (isDevMode) {
    // On dev mode only delete any existing output file but keep the folder
    if (fs.existsSync(OUTPUT_FILE)) {
        fs.rmSync(OUTPUT_FILE);
    }
} else {
    // On CI it is important to re-create the output dir, it has a different owner
    // therefore this process cannot write to it
    try {
        fs.rmSync(config.OUTPUT_DIR, {recursive: true, force: true});

        fs.mkdirSync(config.OUTPUT_DIR);
    } catch (error) {
        // Do nothing
        console.error(error);
    }
}

// START OF TEST CODE

const restartApp = async () => {
    Logger.log('Killing app …');
    await killApp('android', config.APP_PACKAGE);
    Logger.log('Launching app …');
    await launchApp('android', config.APP_PACKAGE);
};

const runTests = async () => {
    // check if using buildMode "js-only" or "none" is possible
    if (buildMode !== 'full') {
        const appExists = fs.existsSync(appPath);
        if (!appExists) {
            Logger.warn(`Build mode "${buildMode}" is not possible, because the app does not exist. Falling back to build mode "full".`);
            Logger.note(`App path: ${appPath}`);

            buildMode = 'full';
        }
    }

    if (branch != null && !skipCheckout) {
        // Switch branch
        Logger.log(`Preparing tests on branch '${branch}' - git checkout`);
        await execAsync(`git checkout ${branch}`);
    }

    if (!skipInstallDeps) {
        Logger.log(`Preparing tests on branch '${branch}' - npm install`);
        await execAsync('npm i');
    }

    // Build app
    if (buildMode === 'full') {
        Logger.log(`Preparing tests on branch '${branch}' - building app`);
        await execAsync('npm run android-build-e2e');
    } else if (buildMode === 'js-only') {
        Logger.log(`Preparing tests on branch '${branch}' - building js bundle`);

        // Build a new JS bundle
        const tempDir = `${config.OUTPUT_DIR}/temp`;
        const tempBundlePath = `${tempDir}/index.android.bundle`;
        await execAsync(`rm -rf ${tempDir} && mkdir ${tempDir}`);
        await execAsync(`npx react-native bundle --platform android --dev false --entry-file ${config.ENTRY_FILE} --bundle-output ${tempBundlePath}`, {E2E_TESTING: 'true'});
        // Repackage the existing native app with the new bundle
        const tempApkPath = `${tempDir}/app-release.apk`;
        await execAsync(`./scripts/android-repackage-app-bundle-and-sign.sh ${appPath} ${tempBundlePath} ${tempApkPath}`);
        appPath = tempApkPath;
    }

    // Install app and reverse port
    let progressLog = Logger.progressInfo('Installing app and reversing port');
    await installApp('android', config.APP_PACKAGE, appPath);
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

        // check if we want to skip the test
        if (args.includes('--includes')) {
            const includes = args[args.indexOf('--includes') + 1];

            // assume that "includes" is a regexp
            if (!testConfig.name.match(includes)) {
                // eslint-disable-next-line no-continue
                continue;
            }
        }

        server.setTestConfig(testConfig);

        const warmupLogs = Logger.progressInfo(`Running warmup '${testConfig.name}'`);

        let progressText = `Warmup for suite '${testConfig.name}' [${testIndex + 1}/${numOfTests}]\n`;
        warmupLogs.updateText(progressText);

        await restartApp();

        await withFailTimeout(
            new Promise((resolve) => {
                const cleanup = server.addTestDoneListener(() => {
                    cleanup();
                    resolve();
                });
            }),
            progressText,
        );

        warmupLogs.done();

        // We run each test multiple time to average out the results
        const testLog = Logger.progressInfo('');
        for (let i = 0; i < config.RUNS; i++) {
            progressText = `Suite '${testConfig.name}' [${testIndex + 1}/${numOfTests}], iteration [${i + 1}/${config.RUNS}]\n`;
            testLog.updateText(progressText);

            await restartApp();

            // Wait for a test to finish by waiting on its done call to the http server
            try {
                await withFailTimeout(
                    new Promise((resolve) => {
                        const cleanup = server.addTestDoneListener(() => {
                            Logger.log(`Test iteration ${i + 1} done!`);
                            cleanup();
                            resolve();
                        });
                    }),
                    progressText,
                );
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

    for (const testName of _.keys(durationsByTestName)) {
        const stats = math.getStats(durationsByTestName[testName]);
        await writeTestStats(
            {
                name: testName,
                ...stats,
            },
            OUTPUT_FILE,
        );
    }
    progressLog.done();

    await server.stop();
};

const run = async () => {
    Logger.info('Running e2e tests');

    try {
        await runTests();

        process.exit(0);
    } catch (e) {
        Logger.info('\n\nE2E test suite failed due to error:', e, '\nPrinting full logs:\n\n');

        // Write logcat, meminfo, emulator info to file as well:
        require('child_process').execSync(`adb logcat -d > ${config.OUTPUT_DIR}/logcat.txt`);
        require('child_process').execSync(`adb shell "cat /proc/meminfo" > ${config.OUTPUT_DIR}/meminfo.txt`);
        require('child_process').execSync(`adb shell "getprop" > ${config.OUTPUT_DIR}/emulator-properties.txt`);

        require('child_process').execSync(`cat ${config.LOG_FILE}`);
        try {
            require('child_process').execSync(`cat ~/.android/avd/${process.env.AVD_NAME || 'test'}.avd/config.ini > ${config.OUTPUT_DIR}/emulator-config.ini`);
        } catch (ignoredError) {
            // the error is ignored, as the file might not exist if the test
            // run wasn't started with an emulator
        }
        process.exit(1);
    }
};

run();
