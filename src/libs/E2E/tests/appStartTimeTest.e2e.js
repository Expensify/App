"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_config_1 = require("react-native-config");
var e2eLogin_1 = require("@libs/E2E/actions/e2eLogin");
var waitForAppLoaded_1 = require("@libs/E2E/actions/waitForAppLoaded");
var client_1 = require("@libs/E2E/client");
var getConfigValueOrThrow_1 = require("@libs/E2E/utils/getConfigValueOrThrow");
var Performance_1 = require("@libs/Performance");
var test = function (config) {
    var name = (0, getConfigValueOrThrow_1.default)('name', config);
    // check for login (if already logged in the action will simply resolve)
    (0, e2eLogin_1.default)().then(function (neededLogin) {
        if (neededLogin) {
            return (0, waitForAppLoaded_1.default)().then(function () {
                // we don't want to submit the first login to the results
                return client_1.default.submitTestDone();
            });
        }
        console.debug('[E2E] Logged in, getting metrics and submitting them…');
        // collect performance metrics and submit
        var metrics = Performance_1.default.getPerformanceMetrics();
        // promises in sequence without for-loop
        Promise.all(metrics.map(function (metric) {
            return client_1.default.submitTestResults({
                branch: react_native_config_1.default.E2E_BRANCH,
                name: "".concat(name, " ").concat(metric.name),
                metric: metric.duration,
                unit: 'ms',
            });
        }))
            .then(function () {
            console.debug('[E2E] Done, exiting…');
            client_1.default.submitTestDone();
        })
            .catch(function (err) {
            console.debug('[E2E] Error while submitting test results:', err);
        });
    });
};
exports.default = test;
