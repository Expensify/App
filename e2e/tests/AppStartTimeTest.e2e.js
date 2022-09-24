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

const installApp = require('./utils/installApp');
const launchApp = require('./utils/launchApp');
const killApp = require('./utils/killApp');
const reversePort = require('./utils/androidReversePort');
const startTestingServer = require('./../server');

const runTest = async () => {
    console.debug('Installing app …');
    installApp('android');
    console.debug('Reversing port (for connecting to testing server) …');
    reversePort();

    console.debug('Starting test server and launching app …');
    const server = startTestingServer();
    launchApp('android');

    await server.waitForAppReady();

    await server.login(); // TODO: provide user credentials here instead of client

    const sampleSize = 5;
    const results = [];
    for (let i = 0; i < sampleSize; i++) {
        // kill and restart the app for a new session
        server.clearSession();
        killApp('android');
        launchApp('android');
        await server.waitForAppReady();

        const metrics = await server.getPerformanceMetrics();
        results.push(...metrics);
    }

    console.debug('Results:', results);

    server.stopServer();
    process.exit(0);
};
runTest();
