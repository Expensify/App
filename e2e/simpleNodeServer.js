const _ = require('underscore');
const createServerInstance = require('./server');
const {TESTS_CONFIG} = require('./config');

// eslint-disable-next-line @lwc/lwc/no-async-await
const startServer = async () => {
// Start the HTTP server
    console.log('Creating server instance');
    const server = createServerInstance();
    console.log('Starting server instance');
    await server.start();
    console.log('Server instance running');

    console.log('Setting config');
    const config = _.values(TESTS_CONFIG)[0];
    server.setTestConfig(config);

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

        console.log(`[LISTENER] Test '${testResult.name}' took ${testResult.duration}ms`);
        durationsByTestName[testResult.name] = (durationsByTestName[testResult.name] || []).concat(testResult.duration);
    });

    server.addTestDoneListener(() => {
        console.log(`Test iteration done!`);
    });
};

// eslint-disable-next-line no-console
startServer().then(() => console.log('Server running'));
