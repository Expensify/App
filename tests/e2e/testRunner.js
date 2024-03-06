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
import {execSync} from 'child_process';
import fs from 'fs';
import _ from 'underscore';
import compare from './compare/compare';
import defaultConfig from './config';
import createServerInstance from './server';
import reversePort from './utils/androidReversePort';
import installApp from './utils/installApp';
import killApp from './utils/killApp';
import launchApp from './utils/launchApp';
import * as Logger from './utils/logger';
import sleep from './utils/sleep';
import withFailTimeout from './utils/withFailTimeout';

// VARIABLE CONFIGURATION
const args = process.argv.slice(2);
const getArg = (argName) => {
    const argIndex = args.indexOf(argName);
    if (argIndex === -1) {
        return undefined;
    }
    return args[argIndex + 1];
};

let config = defaultConfig;
const setConfigPath = (configPathParam) => {
    let configPath = configPathParam;
    if (!configPath.startsWith('.')) {
        configPath = `./${configPath}`;
    }
    const customConfig = require(configPath).default;
    config = _.extend(defaultConfig, customConfig);
};

if (args.includes('--config')) {
    const configPath = getArg('--config');
    setConfigPath(configPath);
}

// Important: set app path only after correct config file has been loaded
const mainAppPath = getArg('--mainAppPath') || config.MAIN_APP_PATH;
const deltaAppPath = getArg('--deltaAppPath') || config.DELTA_APP_PATH;
// Check if files exists:
if (!fs.existsSync(mainAppPath)) {
    throw new Error(`Main app path does not exist: ${mainAppPath}`);
}
if (!fs.existsSync(deltaAppPath)) {
    throw new Error(`Delta app path does not exist: ${deltaAppPath}`);
}

// On CI it is important to re-create the output dir, it has a different owner
// therefore this process cannot write to it
try {
    fs.rmSync(config.OUTPUT_DIR, {recursive: true, force: true});

    fs.mkdirSync(config.OUTPUT_DIR);
} catch (error) {
    // Do nothing
    console.error(error);
}

// START OF TEST CODE

const runTests = async () => {
    Logger.info('Installing apps and reversing port');
    await installApp(config.MAIN_APP_PACKAGE, mainAppPath);
    await installApp(config.DELTA_APP_PACKAGE, deltaAppPath);
    await reversePort();

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

    // Function to run a single test iteration
    async function runTestIteration(appPackage, iterationText, launchArgs) {
        Logger.info(iterationText);

        // Making sure the app is really killed (e.g. if a prior test run crashed)
        Logger.log('Killing', appPackage);
        await killApp('android', appPackage);

        Logger.log('Launching', appPackage);
        await launchApp('android', appPackage, config.ACTIVITY_PATH, launchArgs);

        await withFailTimeout(
            new Promise((resolve) => {
                const cleanup = server.addTestDoneListener(() => {
                    Logger.success(iterationText);
                    cleanup();
                    resolve();
                });
            }),
            iterationText,
        );

        Logger.log('Killing', appPackage);
        await killApp('android', appPackage);
    }

    // Run the tests
    const tests = _.values(config.TESTS_CONFIG);
    for (let testIndex = 0; testIndex < tests.length; testIndex++) {
        const test = _.values(config.TESTS_CONFIG)[testIndex];

        // check if we want to skip the test
        if (args.includes('--includes')) {
            const includes = args[args.indexOf('--includes') + 1];

            // assume that "includes" is a regexp
            if (!test.name.match(includes)) {
                // eslint-disable-next-line no-continue
                continue;
            }
        }

        // Having the cooldown right at the beginning lowers the chances of heat
        // throttling from the previous run (which we have no control over and will be a
        // completely different AWS DF customer/app). It also gives the time to cool down between tests.
        Logger.info(`Cooling down for ${config.BOOT_COOL_DOWN / 1000}s`);
        await sleep(config.BOOT_COOL_DOWN);

        server.setTestConfig(test);

        const warmupText = `Warmup for test '${test.name}' [${testIndex + 1}/${tests.length}]`;

        // Warmup the main app:
        await runTestIteration(config.MAIN_APP_PACKAGE, `[MAIN] ${warmupText}`);

        // Warmup the delta app:
        await runTestIteration(config.DELTA_APP_PACKAGE, `[DELTA] ${warmupText}`);

        // For each test case we allow the test to fail three times before we stop the test run:
        const errorCountRef = {
            errorCount: 0,
            allowedExceptions: 3,
        };

        // We run each test multiple time to average out the results
        for (let testIteration = 0; testIteration < config.RUNS; testIteration++) {
            const onError = (e) => {
                errorCountRef.errorCount += 1;
                if (testIteration === 0 || errorCountRef.errorCount === errorCountRef.allowedExceptions) {
                    Logger.error("There was an error running the test and we've reached the maximum number of allowed exceptions. Stopping the test run.");
                    // If the error happened on the first test run, the test is broken
                    // and we should not continue running it. Or if we have reached the
                    // maximum number of allowed exceptions, we should stop the test run.
                    throw e;
                }
                Logger.warn(`There was an error running the test. Continuing the test run. Error: ${e}`);
            };

            const launchArgs = {
                mockNetwork: true,
            };

            const iterationText = `Test '${test.name}' [${testIndex + 1}/${tests.length}], iteration [${testIteration + 1}/${config.RUNS}]`;
            const mainIterationText = `[MAIN] ${iterationText}`;
            const deltaIterationText = `[DELTA] ${iterationText}`;
            try {
                // Run the test on the main app:
                await runTestIteration(config.MAIN_APP_PACKAGE, mainIterationText, launchArgs);

                // Run the test on the delta app:
                await runTestIteration(config.DELTA_APP_PACKAGE, deltaIterationText, launchArgs);
            } catch (e) {
                onError(e);
            }
        }
    }

    // Calculate statistics and write them to our work file
    Logger.info('Calculating statics and writing results');
    compare(results.main, results.delta, `${config.OUTPUT_DIR}/output.md`);

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
        execSync(`adb logcat -d > ${config.OUTPUT_DIR}/logcat.txt`);
        execSync(`adb shell "cat /proc/meminfo" > ${config.OUTPUT_DIR}/meminfo.txt`);
        execSync(`adb shell "getprop" > ${config.OUTPUT_DIR}/emulator-properties.txt`);

        execSync(`cat ${config.LOG_FILE}`);
        try {
            execSync(`cat ~/.android/avd/${process.env.AVD_NAME || 'test'}.avd/config.ini > ${config.OUTPUT_DIR}/emulator-config.ini`);
        } catch (ignoredError) {
            // the error is ignored, as the file might not exist if the test
            // run wasn't started with an emulator
        }
        process.exit(1);
    }
};

run();
