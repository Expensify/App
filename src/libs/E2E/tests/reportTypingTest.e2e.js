"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_config_1 = require("react-native-config");
var react_native_reanimated_1 = require("react-native-reanimated");
var e2eLogin_1 = require("@libs/E2E/actions/e2eLogin");
var waitForAppLoaded_1 = require("@libs/E2E/actions/waitForAppLoaded");
var waitForKeyboard_1 = require("@libs/E2E/actions/waitForKeyboard");
var client_1 = require("@libs/E2E/client");
var getConfigValueOrThrow_1 = require("@libs/E2E/utils/getConfigValueOrThrow");
var getPromiseWithResolve_1 = require("@libs/E2E/utils/getPromiseWithResolve");
var Navigation_1 = require("@libs/Navigation/Navigation");
var Performance_1 = require("@libs/Performance");
var index_e2e_1 = require("@pages/home/report/ReportActionCompose/ComposerWithSuggestions/index.e2e");
var ReportActionCompose_1 = require("@pages/home/report/ReportActionCompose/ReportActionCompose");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
var NativeCommands = require("../../../../tests/e2e/nativeCommands/NativeCommandsAction");
var test = function (config) {
    // check for login (if already logged in the action will simply resolve)
    console.debug('[E2E] Logging in for typing');
    var reportID = (0, getConfigValueOrThrow_1.default)('reportID', config);
    var message = (0, getConfigValueOrThrow_1.default)('message', config);
    var name = (0, getConfigValueOrThrow_1.default)('name', config);
    (0, e2eLogin_1.default)().then(function (neededLogin) {
        if (neededLogin) {
            return (0, waitForAppLoaded_1.default)().then(function () {
                // we don't want to submit the first login to the results
                return client_1.default.submitTestDone();
            });
        }
        console.debug('[E2E] Logged in, getting typing metrics and submitting them…');
        var _a = (0, getPromiseWithResolve_1.default)(), renderTimesPromise = _a[0], renderTimesResolve = _a[1];
        var _b = (0, getPromiseWithResolve_1.default)(), messageSentPromise = _b[0], messageSentResolve = _b[1];
        Promise.all([renderTimesPromise, messageSentPromise]).then(function () {
            console.debug("[E2E] Submitting!");
            client_1.default.submitTestDone();
        });
        Performance_1.default.subscribeToMeasurements(function (entry) {
            if (entry.name === CONST_1.default.TIMING.SEND_MESSAGE) {
                client_1.default.submitTestResults({
                    branch: react_native_config_1.default.E2E_BRANCH,
                    name: "".concat(name, " Message sent"),
                    metric: entry.duration,
                    unit: 'ms',
                }).then(messageSentResolve);
                return;
            }
            if (entry.name !== CONST_1.default.TIMING.SIDEBAR_LOADED) {
                return;
            }
            console.debug("[E2E] Sidebar loaded, navigating to a report\u2026");
            // Crowded Policy (Do Not Delete) Report, has a input bar available:
            Navigation_1.default.navigate(ROUTES_1.default.REPORT_WITH_ID.getRoute(reportID));
            // Wait until keyboard is visible (so we are focused on the input):
            (0, waitForKeyboard_1.default)().then(function () {
                console.debug("[E2E] Keyboard visible, typing\u2026");
                client_1.default.sendNativeCommand(NativeCommands.makeBackspaceCommand())
                    .then(function () {
                    (0, index_e2e_1.resetRerenderCount)();
                    return Promise.resolve();
                })
                    .then(function () { return client_1.default.sendNativeCommand(NativeCommands.makeTypeTextCommand('A')); })
                    .then(function () {
                    return new Promise(function (resolve) {
                        setTimeout(function () {
                            var rerenderCount = (0, index_e2e_1.getRerenderCount)();
                            client_1.default.submitTestResults({
                                branch: react_native_config_1.default.E2E_BRANCH,
                                name: "".concat(name, " Composer typing rerender count"),
                                metric: rerenderCount,
                                unit: 'renders',
                            })
                                .then(renderTimesResolve)
                                .then(resolve);
                        }, 3000);
                    });
                })
                    .then(function () { return client_1.default.sendNativeCommand(NativeCommands.makeBackspaceCommand()); })
                    .then(function () { return client_1.default.sendNativeCommand(NativeCommands.makeTypeTextCommand(message)); })
                    .then(function () { return (0, react_native_reanimated_1.runOnUI)(ReportActionCompose_1.onSubmitAction)(); })
                    .catch(function (error) {
                    console.error('[E2E] Error while test', error);
                    client_1.default.submitTestDone();
                });
            });
        });
    });
};
exports.default = test;
