"use strict";
/* eslint-disable import/newline-after-import,import/first */
var _a;
var _b;
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * We are using a separate entry point for the E2E tests.
 * By doing this, we avoid bundling any E2E testing code
 * into the actual release app.
 */
var Metrics_1 = require("@libs/Metrics");
var Performance_1 = require("@libs/Performance");
var react_native_config_1 = require("react-native-config");
var config_1 = require("../../../tests/e2e/config");
var client_1 = require("./client");
var NetworkInterceptor_1 = require("./utils/NetworkInterceptor");
var LaunchArgs_1 = require("./utils/LaunchArgs");
console.debug('==========================');
console.debug('==== Running e2e test ====');
console.debug('==========================');
// Check if the performance module is available
if (!(0, Metrics_1.default)()) {
    throw new Error('Performance module not available! Please set CAPTURE_METRICS=true in your environment file!');
}
var appInstanceId = react_native_config_1.default.E2E_BRANCH;
if (!appInstanceId) {
    throw new Error('E2E_BRANCH not set in environment file!');
}
// import your test here, define its name and config first in e2e/config.js
var tests = (_a = {},
    _a[config_1.default.TEST_NAMES.AppStartTime] = require('./tests/appStartTimeTest.e2e').default,
    _a[config_1.default.TEST_NAMES.OpenSearchRouter] = require('./tests/openSearchRouterTest.e2e').default,
    _a[config_1.default.TEST_NAMES.ChatOpening] = require('./tests/chatOpeningTest.e2e').default,
    _a[config_1.default.TEST_NAMES.ReportTyping] = require('./tests/reportTypingTest.e2e').default,
    _a[config_1.default.TEST_NAMES.Linking] = require('./tests/linkingTest.e2e').default,
    _a[config_1.default.TEST_NAMES.MoneyRequest] = require('./tests/moneyRequestTest.e2e').default,
    _a);
// Once we receive the TII measurement we know that the app is initialized and ready to be used:
var appReady = new Promise(function (resolve) {
    Performance_1.default.subscribeToMeasurements(function (entry) {
        if (entry.name !== 'TTI') {
            return;
        }
        resolve();
    });
});
// Install the network interceptor
(0, NetworkInterceptor_1.default)(function () { return client_1.default.getNetworkCache(appInstanceId); }, function (networkCache) { return client_1.default.updateNetworkCache(appInstanceId, networkCache); }, (_b = LaunchArgs_1.default.mockNetwork) !== null && _b !== void 0 ? _b : false);
client_1.default.getTestConfig()
    .then(function (config) {
    var test = tests[config.name];
    if (!test) {
        console.error("[E2E] Test '".concat(config.name, "' not found"));
        // instead of throwing, report the error to the server, which is better for DX
        return client_1.default.submitTestResults({
            branch: react_native_config_1.default.E2E_BRANCH,
            name: config.name,
            error: "Test '".concat(config.name, "' not found"),
            isCritical: false,
        });
    }
    console.debug("[E2E] Configured for test ".concat(config.name, ". Waiting for app to become ready"));
    appReady
        .then(function () {
        console.debug('[E2E] App is ready, running test…');
        Performance_1.default.measureFailSafe('appStartedToReady', 'regularAppStart');
        test(config);
    })
        .catch(function (error) {
        console.error('[E2E] Error while waiting for app to become ready', error);
    });
})
    .catch(function (error) {
    console.error("[E2E] Error while running test. Couldn't get test config!", error);
});
// start the usual app
Performance_1.default.markStart('regularAppStart');
require("../../../index");
Performance_1.default.markEnd('regularAppStart');
