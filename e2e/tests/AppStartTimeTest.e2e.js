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

const runTest = async () => {
    console.debug('Installing app …');
    installApp('android');
    console.debug('Reversing port (for connecting to testing server) …');
    reversePort();

    console.debug('Starting test server and launching app …');
    const server = startTestingServer();
    launchApp('android');

    const startNewAppSession = async () => {
        // kill and restart the app for a new session
        server.clearSession();
        killApp('android');
        launchApp('android');
        await server.waitForAppReady();
    };

    await server.waitForAppReady();
    await server.login(); // TODO: provide user credentials here instead of client

    const results = [];
    for (let i = 0; i < RUNS; i++) {
        await startNewAppSession();

        const metrics = await server.getPerformanceMetrics();
        results.push(...metrics);
    }

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

    server.stopServer();
};

module.exports = runTest;
