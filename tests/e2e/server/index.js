"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var http_1 = require("http");
var config_1 = require("../config");
var nativeCommands = require("../nativeCommands");
var Logger = require("../utils/logger");
var routes_1 = require("./routes");
var PORT = (_a = process.env.PORT) !== null && _a !== void 0 ? _a : config_1.default.SERVER_PORT;
// Gets the request data as a string
var getReqData = function (req) {
    var data = '';
    req.on('data', function (chunk) {
        data += chunk;
    });
    return new Promise(function (resolve) {
        req.on('end', function () {
            resolve(data);
        });
    });
};
// Expects a POST request with JSON data. Returns parsed JSON data.
var getPostJSONRequestData = function (req, res) {
    if (req.method !== 'POST') {
        res.statusCode = 400;
        res.end('Unsupported method');
        return;
    }
    return getReqData(req).then(function (data) {
        try {
            return JSON.parse(data);
        }
        catch (e) {
            Logger.info('❌ Failed to parse request data', data);
            res.statusCode = 400;
            res.end('Invalid JSON');
        }
    });
};
var createListenerState = function () {
    var listeners = [];
    var addListener = function (listener) {
        listeners.push(listener);
        return function () {
            var index = listeners.indexOf(listener);
            if (index !== -1) {
                listeners.splice(index, 1);
            }
        };
    };
    var clearAllListeners = function () {
        listeners.splice(0, listeners.length);
    };
    return [listeners, addListener, clearAllListeners];
};
/**
 * Creates a new http server.
 * The server just has two endpoints:
 *
 *  - POST: /test_results, expects a {@link TestResult} as JSON body.
 *          Send test results while a test runs.
 *  - GET: /test_done, expected to be called when test run signals it's done
 *
 *  It returns an instance to which you can add listeners for the test results, and test done events.
 */
var createServerInstance = function () {
    var _a = createListenerState(), testStartedListeners = _a[0], addTestStartedListener = _a[1];
    var _b = createListenerState(), testResultListeners = _b[0], addTestResultListener = _b[1];
    var _c = createListenerState(), testDoneListeners = _c[0], addTestDoneListener = _c[1], clearAllTestDoneListeners = _c[2];
    var isReadyToAcceptTestResults = true;
    var setReadyToAcceptTestResults = function (isReady) {
        isReadyToAcceptTestResults = isReady;
    };
    var forceTestCompletion = function () {
        testDoneListeners.forEach(function (listener) {
            listener();
        });
    };
    var activeTestConfig;
    var networkCache = {};
    var setTestConfig = function (testConfig) {
        activeTestConfig = testConfig;
    };
    var getTestConfig = function () {
        if (!activeTestConfig) {
            throw new Error('No test config set');
        }
        return activeTestConfig;
    };
    var server = (0, http_1.createServer)(function (req, res) {
        var _a, _b, _c, _d;
        res.statusCode = 200;
        switch (req.url) {
            case routes_1.default.testConfig: {
                testStartedListeners.forEach(function (listener) { return listener(activeTestConfig); });
                if (!activeTestConfig) {
                    throw new Error('No test config set');
                }
                return res.end(JSON.stringify(activeTestConfig));
            }
            case routes_1.default.testResults: {
                if (!isReadyToAcceptTestResults) {
                    return res.end('ok');
                }
                (_a = getPostJSONRequestData(req, res)) === null || _a === void 0 ? void 0 : _a.then(function (data) {
                    if (!data) {
                        // The getPostJSONRequestData function already handled the response
                        return;
                    }
                    testResultListeners.forEach(function (listener) {
                        listener(data);
                    });
                    res.end('ok');
                });
                break;
            }
            case routes_1.default.testDone: {
                forceTestCompletion();
                return res.end('ok');
            }
            case routes_1.default.testNativeCommand: {
                (_b = getPostJSONRequestData(req, res)) === null || _b === void 0 ? void 0 : _b.then(function (data) { return nativeCommands.executeFromPayload(data === null || data === void 0 ? void 0 : data.actionName, data === null || data === void 0 ? void 0 : data.payload); }).then(function (status) {
                    if (status) {
                        res.end('ok');
                        return;
                    }
                    res.statusCode = 500;
                    res.end('Error executing command');
                }).catch(function (error) {
                    Logger.error('Error executing command', error);
                    res.statusCode = 500;
                    res.end('Error executing command');
                });
                break;
            }
            case routes_1.default.testGetNetworkCache: {
                (_c = getPostJSONRequestData(req, res)) === null || _c === void 0 ? void 0 : _c.then(function (data) {
                    var _a;
                    var appInstanceId = data === null || data === void 0 ? void 0 : data.appInstanceId;
                    if (!appInstanceId) {
                        res.statusCode = 400;
                        res.end('Invalid request missing appInstanceId');
                        return;
                    }
                    var cachedData = (_a = networkCache[appInstanceId]) !== null && _a !== void 0 ? _a : {};
                    res.end(JSON.stringify(cachedData));
                });
                break;
            }
            case routes_1.default.testUpdateNetworkCache: {
                (_d = getPostJSONRequestData(req, res)) === null || _d === void 0 ? void 0 : _d.then(function (data) {
                    var appInstanceId = data === null || data === void 0 ? void 0 : data.appInstanceId;
                    var cache = data === null || data === void 0 ? void 0 : data.cache;
                    if (!appInstanceId || !cache) {
                        res.statusCode = 400;
                        res.end('Invalid request missing appInstanceId or cache');
                        return;
                    }
                    networkCache[appInstanceId] = cache;
                    res.end('ok');
                });
                break;
            }
            default:
                res.statusCode = 404;
                res.end('Page not found!');
        }
    });
    return {
        setReadyToAcceptTestResults: setReadyToAcceptTestResults,
        get isReadyToAcceptTestResults() {
            return isReadyToAcceptTestResults;
        },
        setTestConfig: setTestConfig,
        getTestConfig: getTestConfig,
        addTestStartedListener: addTestStartedListener,
        addTestResultListener: addTestResultListener,
        addTestDoneListener: addTestDoneListener,
        clearAllTestDoneListeners: clearAllTestDoneListeners,
        forceTestCompletion: forceTestCompletion,
        start: function () {
            return new Promise(function (resolve) {
                server.listen(PORT, resolve);
            });
        },
        stop: function () {
            return new Promise(function (resolve) {
                server.close(resolve);
            });
        },
    };
};
exports.default = createServerInstance;
