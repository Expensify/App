const OUTPUT_DIR = process.env.WORKING_DIRECTORY || './tests/e2e/results';

/**
 * @typedef TestConfig
 * @property {string} name
 */

// add your test name here …
const TEST_NAMES = {
    AppStartTime: 'App start time',
    OpenSearchPage: 'Open search page TTI',
    ReportTyping: 'Report typing',
};

/**
 * Default config, used by CI by default.
 * You can modify these values for your test run by creating a
 * separate config file and pass it to the test runner like this:
 *
 * ```bash
 * npm run test:e2e -- --config ./path/to/your/config.js
 * ```
 */
module.exports = {
    MAIN_APP_PACKAGE: 'com.expensify.chat.e2e',
    DELTA_APP_PACKAGE: 'com.expensify.chat.e2edelta',

    MAIN_APP_PATH: './app-e2eRelease.apk',
    DELTA_APP_PATH: './app-e2edeltaRelease.apk',

    ENTRY_FILE: 'src/libs/E2E/reactNativeLaunchingTest.ts',

    // The port of the testing server that communicates with the app
    SERVER_PORT: 4723,

    // The amount of times a test should be executed for average performance metrics
    RUNS: 60,

    DEFAULT_BASELINE_BRANCH: 'main',

    OUTPUT_DIR,

    // The file to write intermediate results to
    OUTPUT_FILE_CURRENT: `${OUTPUT_DIR}/current.json`,

    // The file we write logs to
    LOG_FILE: `${OUTPUT_DIR}/debug.log`,

    // The time in milliseconds after which an operation fails due to timeout
    INTERACTION_TIMEOUT: 300000,

    // Period we wait between each test runs, to let the device cool down
    BOOT_COOL_DOWN: 90 * 1000,

    // Period we wait between each test runs, to let the device cool down
    SUITE_COOL_DOWN: 10 * 1000,

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
        [TEST_NAMES.OpenSearchPage]: {
            name: TEST_NAMES.OpenSearchPage,
        },
        [TEST_NAMES.ReportTyping]: {
            name: TEST_NAMES.ReportTyping,
            reportScreen: {
                autoFocus: true,
            },
        },
    },
};
