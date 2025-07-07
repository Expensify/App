"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var config_1 = require("../../../tests/e2e/config");
var routes_1 = require("../../../tests/e2e/server/routes");
var NetworkInterceptor_1 = require("./utils/NetworkInterceptor");
var SERVER_ADDRESS = "http://localhost:".concat(config_1.default.SERVER_PORT);
var defaultHeaders = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    'X-E2E-Server-Request': 'true',
};
var defaultRequestInit = {
    headers: defaultHeaders,
};
var sendRequest = function (url, data) {
    return fetch(url, {
        method: 'POST',
        headers: __assign({ 
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'Content-Type': 'application/json' }, defaultHeaders),
        body: JSON.stringify(data),
    }).then(function (res) {
        if (res.status === 200) {
            return res;
        }
        var errorMsg = "[E2E] Client failed to send request to \"".concat(url, "\". Returned status: ").concat(res.status);
        return res
            .json()
            .then(function (responseText) {
            throw new Error("".concat(errorMsg, ": ").concat(responseText));
        })
            .catch(function () {
            throw new Error(errorMsg);
        });
    });
};
/**
 * Submits a test result to the server.
 * Note: a test can have multiple test results.
 */
var submitTestResults = function (testResult) {
    console.debug("[E2E] Submitting test result '".concat(testResult.name, "'\u2026"));
    return sendRequest("".concat(SERVER_ADDRESS).concat(routes_1.default.testResults), testResult).then(function () {
        console.debug("[E2E] Test result '".concat(testResult.name, "' submitted successfully"));
    });
};
var submitTestDone = function () { return (0, NetworkInterceptor_1.waitForActiveRequestsToBeEmpty)().then(function () { return fetch("".concat(SERVER_ADDRESS).concat(routes_1.default.testDone), defaultRequestInit); }); };
var currentActiveTestConfig = null;
var getTestConfig = function () {
    return fetch("".concat(SERVER_ADDRESS).concat(routes_1.default.testConfig), defaultRequestInit)
        .then(function (res) { return res.json(); })
        .then(function (config) {
        currentActiveTestConfig = config;
        return config;
    });
};
var getCurrentActiveTestConfig = function () { return currentActiveTestConfig; };
var sendNativeCommand = function (payload) {
    console.debug("[E2E] Sending native command '".concat(payload.actionName, "'\u2026"));
    return sendRequest("".concat(SERVER_ADDRESS).concat(routes_1.default.testNativeCommand), payload).then(function () {
        console.debug("[E2E] Native command '".concat(payload.actionName, "' sent successfully"));
    });
};
var updateNetworkCache = function (appInstanceId, networkCache) {
    console.debug('[E2E] Updating network cache…');
    return sendRequest("".concat(SERVER_ADDRESS).concat(routes_1.default.testUpdateNetworkCache), {
        appInstanceId: appInstanceId,
        cache: networkCache,
    }).then(function () {
        console.debug('[E2E] Network cache updated successfully');
    });
};
var getNetworkCache = function (appInstanceId) {
    return sendRequest("".concat(SERVER_ADDRESS).concat(routes_1.default.testGetNetworkCache), { appInstanceId: appInstanceId })
        .then(function (res) { return res.json(); })
        .then(function (networkCache) {
        console.debug('[E2E] Network cache fetched successfully');
        return networkCache;
    });
};
exports.default = {
    submitTestResults: submitTestResults,
    submitTestDone: submitTestDone,
    getTestConfig: getTestConfig,
    getCurrentActiveTestConfig: getCurrentActiveTestConfig,
    sendNativeCommand: sendNativeCommand,
    updateNetworkCache: updateNetworkCache,
    getNetworkCache: getNetworkCache,
};
