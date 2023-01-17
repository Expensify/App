module.exports = {
    // The app calls this endpoint to know which test to run
    testConfig: '/test_config',

    // When running a test the app reports the results to this endpoint
    testResults: '/test_results',

    // When the app is done running a test it calls this endpoint
    testDone: '/test_done',
};
