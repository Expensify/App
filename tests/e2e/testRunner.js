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
const withFailTimeout = require('./utils/withFailTimeout');
const reversePort = require('./utils/androidReversePort');
const sleep = require('./utils/sleep');
const compare = require('./compare/compare');

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
let mainAppPath = config.MAIN_APP_PATH;
let deltaAppPath = config.DELTA_APP_PATH;

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

const runTests = async () => {
    // check if using buildMode "js-only" or "none" is possible
    if (buildMode !== 'full') {
        const mainAppExists = fs.existsSync(mainAppPath);
        const deltaAppExists = fs.existsSync(deltaAppPath);
        if (!mainAppExists || !deltaAppExists) {
            Logger.warn(`Build mode "${buildMode}" is not possible, because the app does not exist. Falling back to build mode "full".`);
            Logger.note(`App path: ${mainAppPath}`);

            buildMode = 'full';
        }
    }

    // Build app
    if (buildMode === 'full') {
        Logger.log(`Test setup - building main branch`);

        if (!skipCheckout) {
            // Switch branch
            Logger.log(`Test setup - checkout main`);
            await execAsync(`git checkout main`);
        }

        if (!skipInstallDeps) {
            Logger.log(`Test setup - npm install`);
            await execAsync('npm i');
        }

        await execAsync('npm run android-build-e2e');

        if (branch != null && !skipCheckout) {
            // Switch branch
            Logger.log(`Test setup - checkout branch '${branch}'`);
            await execAsync(`git checkout ${branch}`);
        }

        if (!skipInstallDeps) {
            Logger.log(`Test setup - npm install`);
            await execAsync('npm i');
        }

        Logger.log(`Test setup '${branch}' - building delta branch`);
        await execAsync('npm run android-build-e2edelta');
    } else if (buildMode === 'js-only') {
        Logger.log(`Test setup '${branch}' - building js bundle`);

        if (!skipInstallDeps) {
            Logger.log(`Test setup '${branch}' - npm install`);
            await execAsync('npm i');
        }

        // Build a new JS bundle
        if (!skipCheckout) {
            // Switch branch
            Logger.log(`Test setup - checkout main`);
            await execAsync(`git checkout main`);
        }

        if (!skipInstallDeps) {
            Logger.log(`Test setup - npm install`);
            await execAsync('npm i');
        }

        const tempDir = `${config.OUTPUT_DIR}/temp`;
        let tempBundlePath = `${tempDir}/index.android.bundle`;
        await execAsync(`rm -rf ${tempDir} && mkdir ${tempDir}`);
        await execAsync(`npx react-native bundle --platform android --dev false --entry-file ${config.ENTRY_FILE} --bundle-output ${tempBundlePath}`, {E2E_TESTING: 'true'});
        // Repackage the existing native app with the new bundle
        let tempApkPath = `${tempDir}/app-release.apk`;
        await execAsync(`./scripts/android-repackage-app-bundle-and-sign.sh ${mainAppPath} ${tempBundlePath} ${tempApkPath}`);
        mainAppPath = tempApkPath;

        // Build a new JS bundle
        if (!skipCheckout) {
            // Switch branch
            Logger.log(`Test setup - checkout main`);
            await execAsync(`git checkout ${branch}`);
        }

        if (!skipInstallDeps) {
            Logger.log(`Test setup - npm install`);
            await execAsync('npm i');
        }

        tempBundlePath = `${tempDir}/index.android.bundle`;
        await execAsync(`rm -rf ${tempDir} && mkdir ${tempDir}`);
        await execAsync(`npx react-native bundle --platform android --dev false --entry-file ${config.ENTRY_FILE} --bundle-output ${tempBundlePath}`, {E2E_TESTING: 'true'});
        // Repackage the existing native app with the new bundle
        tempApkPath = `${tempDir}/app-release.apk`;
        await execAsync(`./scripts/android-repackage-app-bundle-and-sign.sh ${deltaAppPath} ${tempBundlePath} ${tempApkPath}`);
        deltaAppPath = tempApkPath;
    }

    let progressLog = Logger.progressInfo('Installing apps and reversing port');

    await installApp('android', config.MAIN_APP_PACKAGE, defaultConfig.MAIN_APP_PATH);
    await installApp('android', config.DELTA_APP_PACKAGE, defaultConfig.DELTA_APP_PATH);
    await reversePort();
    progressLog.done();

    // Start the HTTP server
    const server = createServerInstance();
    await server.start();

    // Create a dict in which we will store the run durations for all tests
    const results = {};

    // Collect results while tests are being executed
    server.addTestResultListener((testResult) => {
        if (testResult.error != null) {
            throw new Error(`Test '${testResult.name}' failed with error: ${testResult.error}`);
        }
        let result = 0;

        if ('duration' in testResult) {
            if (testResult.duration < 0) {
                return;
            }
            result = testResult.duration;
        }
        if ('renderCount' in testResult) {
            result = testResult.renderCount;
        }

        Logger.log(`[LISTENER] Test '${testResult.name}' on '${testResult.branch}' measured ${result}`);

        if (!results[testResult.branch]) {
            results[testResult.branch] = {};
        }

        results[testResult.branch][testResult.name] = (results[testResult.branch][testResult.name] || []).concat(result);
    });

    // Run the tests
    const suites = _.values(config.TESTS_CONFIG);
    for (let suiteIndex = 0; suiteIndex < suites.length; suiteIndex++) {
        const suite = _.values(config.TESTS_CONFIG)[suiteIndex];

        // check if we want to skip the test
        if (args.includes('--includes')) {
            const includes = args[args.indexOf('--includes') + 1];

            // assume that "includes" is a regexp
            if (!suite.name.match(includes)) {
                // eslint-disable-next-line no-continue
                continue;
            }
        }

        const coolDownLogs = Logger.progressInfo(`Cooling down for ${config.BOOT_COOL_DOWN / 1000}s`);
        coolDownLogs.updateText(`Cooling down for ${config.BOOT_COOL_DOWN / 1000}s`);

        // Having the cooldown right at the beginning should hopefully lower the chances of heat
        // throttling from the previous run (which we have no control over and will be a
        // completely different AWS DF customer/app). It also gives the time to cool down between test suites.
        await sleep(config.BOOT_COOL_DOWN);
        coolDownLogs.done();

        server.setTestConfig(suite);

        const warmupLogs = Logger.progressInfo(`Running warmup '${suite.name}'`);

        let progressText = `Warmup for suite '${suite.name}' [${suiteIndex + 1}/${suites.length}]\n`;
        warmupLogs.updateText(progressText);

        Logger.log('Killing main app');
        await killApp('android', config.MAIN_APP_PACKAGE);
        Logger.log('Launching main app');
        await launchApp('android', config.MAIN_APP_PACKAGE);

        await withFailTimeout(
            new Promise((resolve) => {
                const cleanup = server.addTestDoneListener(() => {
                    Logger.log('Main warm up ready ✅');
                    cleanup();
                    resolve();
                });
            }),
            progressText,
        );

        Logger.log('Killing main app');
        await killApp('android', config.MAIN_APP_PACKAGE);

        Logger.log('Killing delta app');
        await killApp('android', config.DELTA_APP_PACKAGE);
        Logger.log('Launching delta app');
        await launchApp('android', config.DELTA_APP_PACKAGE);

        await withFailTimeout(
            new Promise((resolve) => {
                const cleanup = server.addTestDoneListener(() => {
                    Logger.log('Delta warm up ready ✅');
                    cleanup();
                    resolve();
                });
            }),
            progressText,
        );

        Logger.log('Killing delta app');
        await killApp('android', config.DELTA_APP_PACKAGE);

        warmupLogs.done();

        // We run each test multiple time to average out the results
        const testLog = Logger.progressInfo('');
        for (let i = 0; i < config.RUNS; i++) {
            progressText = `Suite '${suite.name}' [${suiteIndex + 1}/${suites.length}], iteration [${i + 1}/${config.RUNS}]\n`;
            testLog.updateText(progressText);

            Logger.log('Killing delta app');
            await killApp('android', config.DELTA_APP_PACKAGE);

            Logger.log('Killing main app');
            await killApp('android', config.MAIN_APP_PACKAGE);

            Logger.log('Starting main app');
            await launchApp('android', config.MAIN_APP_PACKAGE);

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

            Logger.log('Killing main app');
            await killApp('android', config.MAIN_APP_PACKAGE);

            Logger.log('Starting delta app');
            await launchApp('android', config.DELTA_APP_PACKAGE);

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

    compare(results.main, results.delta, `${config.OUTPUT_DIR}/output.md`);

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
