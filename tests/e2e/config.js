const OUTPUT_DIR = process.env.WORKING_DIRECTORY || './results';

/**
 * @typedef TestConfig
 * @property {string} name
 */

// add your test name here …
const TEST_NAMES = {
    AppStartTime: 'App start time',
};

module.exports = {
    APP_PACKAGE: 'com.expensify.chat',

    // The port of the testing server that communicates with the app
    SERVER_PORT: 4723,

    // The amount of times a test should be executed for average performance metrics
    RUNS: 30,

    DEFAULT_BASELINE_BRANCH: 'main',

    // The amount of outliers to remove from a dataset before calculating the average
    DROP_WORST: 8,

    // The amount of runs that should happen without counting test results
    WARM_UP_RUNS: 3,

    OUTPUT_DIR,

    // The file to write intermediate results to
    OUTPUT_FILE_CURRENT: `${OUTPUT_DIR}/current.json`,

    // The file we write logs to
    LOG_FILE: `${OUTPUT_DIR}/debug.log`,

    // The time in milliseconds after which an operation fails due to timeout
    INTERACTION_TIMEOUT: 300000,

    TEST_NAMES,

    /**
     * Add your test configurations here. At least,
     * you need to add a name for your test.
     *
     * @type {Object.<string, TestConfig>}
     */
    TESTS_CONFIG: {
        [TEST_NAMES.AppStartTime]: {
            name: TEST_NAMES.AppStartTime,

            // ... any additional config you might need
        },
    },
};
