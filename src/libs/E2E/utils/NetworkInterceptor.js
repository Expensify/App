"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = installNetworkInterceptor;
exports.waitForActiveRequestsToBeEmpty = waitForActiveRequestsToBeEmpty;
/* eslint-disable @lwc/lwc/no-async-await */
var react_native_1 = require("react-native");
var LOG_TAG = "[E2E][NetworkInterceptor]";
// Requests with these headers will be ignored:
var IGNORE_REQUEST_HEADERS = ['X-E2E-Server-Request'];
var globalResolveIsNetworkInterceptorInstalled;
var globalRejectIsNetworkInterceptorInstalled;
var globalIsNetworkInterceptorInstalledPromise = new Promise(function (resolve, reject) {
    globalResolveIsNetworkInterceptorInstalled = resolve;
    globalRejectIsNetworkInterceptorInstalled = reject;
});
var networkCache = null;
/**
 * The headers of a fetch request can be passed as an array of tuples or as an object.
 * This function converts the headers to an object.
 */
function getFetchRequestHeadersAsObject(fetchRequest) {
    var headers = {};
    if (Array.isArray(fetchRequest.headers)) {
        fetchRequest.headers.forEach(function (_a) {
            var key = _a[0], value = _a[1];
            headers[key] = value;
        });
    }
    else if (typeof fetchRequest.headers === 'object') {
        Object.entries(fetchRequest.headers).forEach(function (_a) {
            var key = _a[0], value = _a[1];
            headers[key] = value;
        });
    }
    return headers;
}
/**
 * This function extracts the RequestInit from the arguments of fetch.
 * It is needed because the arguments can be passed in different ways.
 */
function fetchArgsGetRequestInit(args) {
    var firstArg = args[0], secondArg = args[1];
    if (typeof firstArg === 'string' || (typeof firstArg === 'object' && firstArg instanceof URL)) {
        if (secondArg == null) {
            return {};
        }
        return secondArg;
    }
    return firstArg;
}
/**
 * This function extracts the url from the arguments of fetch.
 */
function fetchArgsGetUrl(args) {
    var firstArg = args[0];
    if (typeof firstArg === 'string') {
        return firstArg;
    }
    if (typeof firstArg === 'object' && firstArg instanceof URL) {
        return firstArg.href;
    }
    if (typeof firstArg === 'object' && firstArg instanceof Request) {
        return firstArg.url;
    }
    throw new Error('Could not get url from fetch args');
}
/**
 * This function transforms a NetworkCacheEntry (internal representation) to a (fetch) Response.
 */
function networkCacheEntryToResponse(_a) {
    var headers = _a.headers, status = _a.status, statusText = _a.statusText, body = _a.body;
    // Transform headers to Headers object:
    var newHeaders = new Headers();
    Object.entries(headers).forEach(function (_a) {
        var key = _a[0], value = _a[1];
        newHeaders.append(key, value);
    });
    return new Response(body, {
        status: status,
        statusText: statusText,
        headers: newHeaders,
    });
}
/**
 * This function hashes the arguments of fetch.
 */
function hashFetchArgs(args) {
    var url = fetchArgsGetUrl(args);
    var options = fetchArgsGetRequestInit(args);
    var headers = getFetchRequestHeadersAsObject(options);
    // Note: earlier we were using the body value as well, however
    // the body for the same request might be different due to including
    // times or app versions.
    return "".concat(url).concat(JSON.stringify(headers));
}
var activeRequestsCount = 0;
var ACTIVE_REQUESTS_QUEUE_IS_EMPTY_EVENT = 'activeRequestsQueueIsEmpty';
/**
 * Assures that ongoing network requests are empty. **Highly desirable** to call this function before closing the app.
 * Otherwise if some requests are persisted - they will be executed on the next app start. And it can lead to a situation
 * where we can have `N * M` requests (where `N` is the number of app run per test and `M` is the number of test suites)
 * and such big amount of requests can lead to a situation, where first app run (in test suite to cache network requests)
 * may be blocked by spinners and lead to unbelievable big time execution, which eventually will be bigger than timeout and
 * will lead to a test failure.
 */
function waitForActiveRequestsToBeEmpty() {
    console.debug('Waiting for requests queue to be empty...', activeRequestsCount);
    if (activeRequestsCount === 0) {
        return Promise.resolve();
    }
    return new Promise(function (resolve) {
        var subscription = react_native_1.DeviceEventEmitter.addListener(ACTIVE_REQUESTS_QUEUE_IS_EMPTY_EVENT, function () {
            subscription.remove();
            resolve();
        });
    });
}
/**
 * Install a network interceptor by overwriting the global fetch function:
 * - Overwrites fetch globally with a custom implementation
 * - For each fetch request we cache the request and the response
 * - The cache is send to the test runner server to persist the network cache in between sessions
 * - On e2e test start the network cache is requested and loaded
 * - If a fetch request is already in the NetworkInterceptors cache instead of making a real API request the value from the cache is used.
 */
function installNetworkInterceptor(getNetworkCache, updateNetworkCache, shouldReturnRecordedResponse) {
    var _this = this;
    console.debug(LOG_TAG, 'installing with shouldReturnRecordedResponse:', shouldReturnRecordedResponse);
    var originalFetch = global.fetch;
    if (networkCache == null && shouldReturnRecordedResponse) {
        console.debug(LOG_TAG, 'fetching network cache …');
        getNetworkCache()
            .then(function (newCache) {
            networkCache = newCache;
            globalResolveIsNetworkInterceptorInstalled();
            console.debug(LOG_TAG, 'network cache fetched!');
        }, globalRejectIsNetworkInterceptorInstalled)
            .catch(globalRejectIsNetworkInterceptorInstalled);
    }
    else {
        networkCache = {};
        globalResolveIsNetworkInterceptorInstalled();
    }
    global.fetch = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return __awaiter(_this, void 0, void 0, function () {
            var options, headers, url, hash, cachedResponse, response;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        options = fetchArgsGetRequestInit(args);
                        headers = getFetchRequestHeadersAsObject(options);
                        url = fetchArgsGetUrl(args);
                        // Check if headers contain any of the ignored headers, or if react native metro server:
                        if (IGNORE_REQUEST_HEADERS.some(function (header) { return headers[header] != null; }) || url.includes('8081')) {
                            return [2 /*return*/, originalFetch.apply(void 0, args)];
                        }
                        return [4 /*yield*/, globalIsNetworkInterceptorInstalledPromise];
                    case 1:
                        _a.sent();
                        hash = hashFetchArgs(args);
                        cachedResponse = networkCache === null || networkCache === void 0 ? void 0 : networkCache[hash];
                        if (shouldReturnRecordedResponse && cachedResponse != null) {
                            response = networkCacheEntryToResponse(cachedResponse);
                            console.debug(LOG_TAG, 'Returning recorded response for url:', url);
                            return [2 /*return*/, Promise.resolve(response)];
                        }
                        if (shouldReturnRecordedResponse) {
                            console.debug('!!! Missed cache hit for url:', url);
                        }
                        activeRequestsCount++;
                        return [2 /*return*/, originalFetch.apply(void 0, args).then(function (res) { return __awaiter(_this, void 0, void 0, function () {
                                var body;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            if (!(networkCache != null)) return [3 /*break*/, 2];
                                            return [4 /*yield*/, res.clone().text()];
                                        case 1:
                                            body = _a.sent();
                                            networkCache[hash] = {
                                                url: url,
                                                options: options,
                                                body: body,
                                                headers: getFetchRequestHeadersAsObject(options),
                                                status: res.status,
                                                statusText: res.statusText,
                                            };
                                            console.debug(LOG_TAG, 'Updating network cache for url:', url);
                                            // Send the network cache to the test server:
                                            return [2 /*return*/, updateNetworkCache(networkCache).then(function () { return res; })];
                                        case 2: return [2 /*return*/, res];
                                    }
                                });
                            }); })
                                .then(function (res) {
                                console.debug(LOG_TAG, 'Network cache updated!');
                                return res;
                            })
                                .finally(function () {
                                console.debug('Active requests count:', activeRequestsCount);
                                activeRequestsCount--;
                                if (activeRequestsCount === 0) {
                                    react_native_1.DeviceEventEmitter.emit(ACTIVE_REQUESTS_QUEUE_IS_EMPTY_EVENT);
                                }
                            })];
                }
            });
        });
    };
}
