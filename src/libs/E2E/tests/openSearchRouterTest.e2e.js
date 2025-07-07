"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_config_1 = require("react-native-config");
var E2EGenericPressableWrapper = require("@components/Pressable/GenericPressable/index.e2e");
var e2eLogin_1 = require("@libs/E2E/actions/e2eLogin");
var waitForAppLoaded_1 = require("@libs/E2E/actions/waitForAppLoaded");
var client_1 = require("@libs/E2E/client");
var getConfigValueOrThrow_1 = require("@libs/E2E/utils/getConfigValueOrThrow");
var getPromiseWithResolve_1 = require("@libs/E2E/utils/getPromiseWithResolve");
var Performance_1 = require("@libs/Performance");
var CONST_1 = require("@src/CONST");
var test = function (config) {
    // check for login (if already logged in the action will simply resolve)
    console.debug('[E2E] Logging in for new search router');
    var name = (0, getConfigValueOrThrow_1.default)('name', config);
    (0, e2eLogin_1.default)().then(function (neededLogin) {
        if (neededLogin) {
            return (0, waitForAppLoaded_1.default)().then(function () {
                // we don't want to submit the first login to the results
                return client_1.default.submitTestDone();
            });
        }
        console.debug('[E2E] Logged in, getting search router metrics and submitting them…');
        var _a = (0, getPromiseWithResolve_1.default)(), openSearchRouterPromise = _a[0], openSearchRouterResolve = _a[1];
        var _b = (0, getPromiseWithResolve_1.default)(), loadSearchOptionsPromise = _b[0], loadSearchOptionsResolve = _b[1];
        Promise.all([openSearchRouterPromise, loadSearchOptionsPromise]).then(function () {
            console.debug("[E2E] Submitting!");
            client_1.default.submitTestDone();
        });
        Performance_1.default.subscribeToMeasurements(function (entry) {
            console.debug("[E2E] Entry: ".concat(JSON.stringify(entry)));
            if (entry.name === CONST_1.default.TIMING.SIDEBAR_LOADED) {
                var props = E2EGenericPressableWrapper.getPressableProps('searchButton');
                if (!props) {
                    console.debug('[E2E] Search button not found, failing test!');
                    client_1.default.submitTestResults({
                        branch: react_native_config_1.default.E2E_BRANCH,
                        error: 'Search button not found',
                        name: "".concat(name, " Open Search Router TTI"),
                    }).then(function () { return client_1.default.submitTestDone(); });
                    return;
                }
                if (!props.onPress) {
                    console.debug('[E2E] Search button found but onPress prop was not present, failing test!');
                    client_1.default.submitTestResults({
                        branch: react_native_config_1.default.E2E_BRANCH,
                        error: 'Search button found but onPress prop was not present',
                        name: "".concat(name, " Open Search Router TTI"),
                    }).then(function () { return client_1.default.submitTestDone(); });
                    return;
                }
                // Open the search router
                props.onPress();
            }
            if (entry.name === CONST_1.default.TIMING.OPEN_SEARCH) {
                client_1.default.submitTestResults({
                    branch: react_native_config_1.default.E2E_BRANCH,
                    name: "".concat(name, " Open Search Router TTI"),
                    metric: entry.duration,
                    unit: 'ms',
                })
                    .then(function () {
                    openSearchRouterResolve();
                    console.debug('[E2E] Done with search, exiting…');
                })
                    .catch(function (err) {
                    console.debug('[E2E] Error while submitting test results:', err);
                });
            }
            if (entry.name === CONST_1.default.TIMING.LOAD_SEARCH_OPTIONS) {
                client_1.default.submitTestResults({
                    branch: react_native_config_1.default.E2E_BRANCH,
                    name: "".concat(name, " Load Search Options"),
                    metric: entry.duration,
                    unit: 'ms',
                })
                    .then(function () {
                    loadSearchOptionsResolve();
                    console.debug('[E2E] Done with loading search options, exiting…');
                })
                    .catch(function (err) {
                    console.debug('[E2E] Error while submitting test results:', err);
                });
            }
            console.debug("[E2E] Submitting!");
        });
    });
};
exports.default = test;
