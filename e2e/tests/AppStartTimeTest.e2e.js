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
const installApp = require('./utils/installApp');
const launchApp = require('./utils/launchApp');
const killApp = require('./utils/killApp');
const reversePort = require('./utils/androidReversePort');
const startTestingServer = require('./../server');

const RUNS = 10;
const DROP_WORST = 1;

const createDictByName = (arr) => {
    const dict = {};
    arr.forEach((item) => {
        dict[item.name] = (dict[item.name] || []).concat(item);
    });
    return dict;
};
const sortAndClean = (entries) => {
    // Drop the worst measurements outliers (usually warm up runs)
    entries.sort((first, second) => second - first); // DESC
    return entries.slice(DROP_WORST);
};
const mean = arr => _.reduce(arr, (a, b) => a + b, 0) / arr.length;
const std = (arr) => {
    const avg = mean(arr);
    return Math.sqrt(_.reduce(_.map(arr, i => (i - avg) ** 2), (a, b) => a + b) / arr.length);
};
const getStats = (entries) => {
    const durations = _.map(entries, entry => entry.duration);
    const cleanedDurations = sortAndClean(durations);
    const meanDuration = mean(cleanedDurations);
    const stdevDuration = std(cleanedDurations);

    return {
        mean: meanDuration,
        stdev: stdevDuration,
        runs: cleanedDurations.length,
    };
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
    const ttiStats = getStats(resultsDict.TTI);

    console.debug('TTI stats:', ttiStats);

    server.stopServer();
    process.exit(0);
};
runTest();
