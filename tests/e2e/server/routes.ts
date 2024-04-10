const routes = {
    // The app calls this endpoint to know which test to run
    testConfig: '/test_config',

    // When running a test the app reports the results to this endpoint
    testResults: '/test_results',

    // When the app is done running a test it calls this endpoint
    testDone: '/test_done',

    // Commands to execute from the host machine (there are pre-defined types like scroll or type)
    testNativeCommand: '/test_native_command',

    // Updates the network cache
    testUpdateNetworkCache: '/test_update_network_cache',

    // Gets the network cache
    testGetNetworkCache: '/test_get_network_cache',
} satisfies Record<string, string>;

export default routes;
