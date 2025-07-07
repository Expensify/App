"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_config_1 = require("react-native-config");
var e2eLogin_1 = require("@libs/E2E/actions/e2eLogin");
var waitForAppLoaded_1 = require("@libs/E2E/actions/waitForAppLoaded");
var client_1 = require("@libs/E2E/client");
var interactions_1 = require("@libs/E2E/interactions");
var getConfigValueOrThrow_1 = require("@libs/E2E/utils/getConfigValueOrThrow");
var CONST_1 = require("@src/CONST");
var NativeCommandsAction_1 = require("../../../../tests/e2e/nativeCommands/NativeCommandsAction");
var test = function (config) {
    // check for login (if already logged in the action will simply resolve)
    console.debug('[E2E] Logging in for money request');
    var name = (0, getConfigValueOrThrow_1.default)('name', config);
    (0, e2eLogin_1.default)().then(function (neededLogin) {
        if (neededLogin) {
            return (0, waitForAppLoaded_1.default)().then(function () {
                // we don't want to submit the first login to the results
                return client_1.default.submitTestDone();
            });
        }
        console.debug('[E2E] Logged in, getting money request metrics and submitting them…');
        (0, interactions_1.waitForEvent)(CONST_1.default.TIMING.SIDEBAR_LOADED)
            .then(function () { return (0, interactions_1.tap)('floating-action-button'); })
            .then(function () { return (0, interactions_1.waitForElement)('create-expense'); })
            .then(function () { return (0, interactions_1.tap)('create-expense'); })
            .then(function () { return (0, interactions_1.waitForEvent)(CONST_1.default.TIMING.OPEN_CREATE_EXPENSE); })
            .then(function (entry) {
            client_1.default.submitTestResults({
                branch: react_native_config_1.default.E2E_BRANCH,
                name: "".concat(name, " - Open Manual Tracking"),
                metric: entry.duration,
                unit: 'ms',
            });
        })
            .then(function () { return (0, interactions_1.waitForElement)('manual'); })
            .then(function () { return (0, interactions_1.tap)('manual'); })
            .then(function () { return client_1.default.sendNativeCommand((0, NativeCommandsAction_1.makeClearCommand)()); })
            .then(function () { return (0, interactions_1.tap)('button_2'); })
            .then(function () { return (0, interactions_1.waitForTextInputValue)('2', 'moneyRequestAmountInput'); })
            .then(function () { return (0, interactions_1.tap)('next-button'); })
            .then(function () { return (0, interactions_1.waitForEvent)(CONST_1.default.TIMING.OPEN_CREATE_EXPENSE_CONTACT); })
            .then(function (entry) {
            client_1.default.submitTestResults({
                branch: react_native_config_1.default.E2E_BRANCH,
                name: "".concat(name, " - Open Contacts"),
                metric: entry.duration,
                unit: 'ms',
            });
        })
            .then(function () { return (0, interactions_1.waitForElement)('+66 65 490 0617'); })
            .then(function () { return (0, interactions_1.tap)('+66 65 490 0617'); })
            .then(function () { return (0, interactions_1.waitForEvent)(CONST_1.default.TIMING.OPEN_CREATE_EXPENSE_APPROVE); })
            .then(function (entry) {
            client_1.default.submitTestResults({
                branch: react_native_config_1.default.E2E_BRANCH,
                name: "".concat(name, " - Open Create"),
                metric: entry.duration,
                unit: 'ms',
            });
        })
            .then(function () {
            console.debug('[E2E] Test completed successfully, exiting…');
            client_1.default.submitTestDone();
        })
            .catch(function (err) {
            console.debug('[E2E] Error while submitting test results:', err);
        });
    });
};
exports.default = test;
