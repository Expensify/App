const OUTPUT_DIR = 'e2e/.results';

module.exports = {
    APP_PACKAGE: 'com.expensify.chat',

    // The port of the testing server that communicates with the app
    SERVER_PORT: 3000,

    // The amount of times a test should be executed for average performance metrics
    RUNS: 30,

    DEFAULT_BASELINE_BRANCH: 'main',

    // The amount of outliers to remove from a dataset before calculating the average
    DROP_WORST: 8,

    OUTPUT_DIR,

    // The file to write intermediate results to
    OUTPUT_FILE_CURRENT: `${OUTPUT_DIR}/current.json`,

    // The file we write logs to
    LOG_FILE: `${OUTPUT_DIR}/debug.log`,

    // The time in milliseconds after which a operation fails due to timeout
    INTERACTION_TIMEOUT: 30_000,
};
