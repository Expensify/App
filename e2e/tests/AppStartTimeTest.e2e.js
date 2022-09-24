/* eslint-disable @lwc/lwc/no-async-await,no-await-in-loop */
// This isn't a jest test, but just a node js script

// Steps:
// - Pre-step: Build the app, using the .env.e2e file - or should this have happened before? Yes that's better as for multiple test we might need the same app
// The same for app test cases:
// - Install the app to the currently available android device, expecting only one device to be connected
// - Start the app

// - Setup the app: login
// - Define the test procedure:
//   - Start the app
//   - Get TTI values
// - Run the test procedures X times (X = 5)

const _ = require('underscore');
const installApp = require('../utils/installApp');
const launchApp = require('../utils/launchApp');
const killApp = require('../utils/killApp');
const reversePort = require('../utils/androidReversePort');
const startTestingServer = require('./../server');
const writeTestStats = require('../measure/writeTestStats');
const {RUNS} = require('../config');
const math = require('../measure/math');
const Logger = require('../utils/logger');

const createDictByName = (arr) => {
    const dict = {};

    // for each measurement took, add it to the dict
    arr.forEach((item) => {
        dict[item.name] = (dict[item.name] || []).concat(item);
    });

    // extract property "duration" from objects to get an array of numbers
    _.keys(dict).forEach((key) => {
        dict[key] = _.map(dict[key], item => item.duration);
    });
    return dict;
};

const TEST_NAME = 'App start time';

const runTest = async () => {
    let progressLog = Logger.progressInfo('Installing app');
    await installApp('android');
    progressLog.done();
    Logger.log('Reversing port (for connecting to testing server) …');
    await reversePort();

    progressLog = Logger.progressInfo('Starting test server and launching app');
    const server = startTestingServer();
    await launchApp('android');
    progressLog.done();

    progressLog = Logger.progressInfo(`Running test ${TEST_NAME}`);

    const startNewAppSession = async () => {
        // kill and restart the app for a new session
        server.clearSession();
        Logger.log('Killing app …');
        await killApp('android');
        Logger.log('Launching app …');
        await launchApp('android');
        await server.waitForAppReady();
    };

    await server.waitForAppReady();
    await server.login(); // TODO: provide user credentials here instead of client

    const results = [];
    for (let i = 0; i < RUNS; i++) {
        progressLog.updateText(`Running test ${TEST_NAME} (iteration ${i + 1}/${RUNS})`);
        await startNewAppSession();

        const metrics = await server.getPerformanceMetrics();
        results.push(...metrics);
    }
    progressLog.done();

    progressLog = Logger.progressInfo(`Saving results of test ${TEST_NAME}`);
    const resultsDict = createDictByName(results);

    const ttiStats = math.getStats(resultsDict.TTI);
    await writeTestStats({
        name: 'App start time (TTI)',
        ...ttiStats,
    });
    const nativeLaunch = math.getStats(resultsDict.nativeLaunch);
    await writeTestStats({
        name: 'App start time (Native launch)',
        ...nativeLaunch,
    });
    const runJsBundle = math.getStats(resultsDict.runJsBundle);
    await writeTestStats({
        name: 'App start time (Run JS bundle)',
        ...runJsBundle,
    });
    progressLog.done();

    server.stopServer();
};

module.exports = runTest;
