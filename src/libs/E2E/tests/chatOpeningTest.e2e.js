"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_config_1 = require("react-native-config");
var e2eLogin_1 = require("@libs/E2E/actions/e2eLogin");
var waitForAppLoaded_1 = require("@libs/E2E/actions/waitForAppLoaded");
var client_1 = require("@libs/E2E/client");
var getConfigValueOrThrow_1 = require("@libs/E2E/utils/getConfigValueOrThrow");
var getPromiseWithResolve_1 = require("@libs/E2E/utils/getPromiseWithResolve");
var Navigation_1 = require("@libs/Navigation/Navigation");
var Performance_1 = require("@libs/Performance");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
var test = function (config) {
    // check for login (if already logged in the action will simply resolve)
    console.debug('[E2E] Logging in for chat opening');
    var reportID = (0, getConfigValueOrThrow_1.default)('reportID', config);
    var name = (0, getConfigValueOrThrow_1.default)('name', config);
    (0, e2eLogin_1.default)().then(function (neededLogin) {
        if (neededLogin) {
            return (0, waitForAppLoaded_1.default)().then(function () {
                // we don't want to submit the first login to the results
                return client_1.default.submitTestDone();
            });
        }
        console.debug('[E2E] Logged in, getting chat opening metrics and submitting them…');
        var _a = (0, getPromiseWithResolve_1.default)(), chatTTIPromise = _a[0], chatTTIResolve = _a[1];
        chatTTIPromise.then(function () {
            console.debug("[E2E] Submitting!");
            client_1.default.submitTestDone();
        });
        Performance_1.default.subscribeToMeasurements(function (entry) {
            if (entry.name === CONST_1.default.TIMING.SIDEBAR_LOADED) {
                console.debug("[E2E] Sidebar loaded, navigating to report\u2026");
                Performance_1.default.markStart(CONST_1.default.TIMING.OPEN_REPORT);
                Navigation_1.default.navigate(ROUTES_1.default.REPORT_WITH_ID.getRoute(reportID));
                return;
            }
            console.debug("[E2E] Entry: ".concat(JSON.stringify(entry)));
            if (entry.name === CONST_1.default.TIMING.OPEN_REPORT) {
                client_1.default.submitTestResults({
                    branch: react_native_config_1.default.E2E_BRANCH,
                    name: "".concat(name, " Chat TTI"),
                    metric: entry.duration,
                    unit: 'ms',
                })
                    .then(function () {
                    console.debug('[E2E] Done with chat TTI tracking, exiting…');
                    chatTTIResolve();
                })
                    .catch(function (err) {
                    console.debug('[E2E] Error while submitting test results:', err);
                });
            }
        });
    });
};
exports.default = test;
