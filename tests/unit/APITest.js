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
var react_native_onyx_1 = require("react-native-onyx");
var CONST_1 = require("@src/CONST");
var PersistedRequests = require("@src/libs/actions/PersistedRequests");
var API = require("@src/libs/API");
var HttpUtils_1 = require("@src/libs/HttpUtils");
var MainQueue = require("@src/libs/Network/MainQueue");
var NetworkStore = require("@src/libs/Network/NetworkStore");
var SequentialQueue = require("@src/libs/Network/SequentialQueue");
var SequentialQueue_1 = require("@src/libs/Network/SequentialQueue");
var Request = require("@src/libs/Request");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var TestHelper = require("../utils/TestHelper");
var waitForBatchedUpdates_1 = require("../utils/waitForBatchedUpdates");
var waitForNetworkPromises_1 = require("../utils/waitForNetworkPromises");
var Onyx = react_native_onyx_1.default;
jest.mock('@src/libs/Log');
Onyx.init({
    keys: ONYXKEYS_1.default,
});
var originalXHR = HttpUtils_1.default.xhr;
beforeEach(function () {
    global.fetch = TestHelper.getGlobalFetchMock();
    HttpUtils_1.default.xhr = originalXHR;
    MainQueue.clear();
    HttpUtils_1.default.cancelPendingRequests();
    PersistedRequests.clear();
    SequentialQueue_1.sequentialQueueRequestThrottle.clear();
    NetworkStore.checkRequiredData();
    // Wait for any Log command to finish and Onyx to fully clear
    return (0, waitForBatchedUpdates_1.default)()
        .then(function () { return Onyx.clear(); })
        .then(waitForBatchedUpdates_1.default);
});
afterEach(function () {
    NetworkStore.resetHasReadRequiredDataFromStorage();
    Onyx.addDelayToConnectCallback(0);
    jest.clearAllMocks();
});
/* eslint-disable rulesdir/no-multiple-api-calls */
/* eslint-disable rulesdir/no-api-side-effects-method */
describe('APITests', function () {
    test('All writes should be persisted while offline', function () {
        // We don't expect calls `xhr` so we make the test fail if such call is made
        var xhr = jest.spyOn(HttpUtils_1.default, 'xhr').mockRejectedValue(new Error('Unexpected xhr call'));
        // Given we're offline
        return Onyx.set(ONYXKEYS_1.default.NETWORK, { isOffline: true })
            .then(function () {
            // When API Writes and Reads are called
            API.write('mock command', { param1: 'value1' });
            API.read('mock command', { param2: 'value2' });
            API.write('mock command', { param3: 'value3' });
            return (0, waitForBatchedUpdates_1.default)();
        })
            .then(function () {
            // Then `xhr` should only be called for the read (where it would not succeed in real life) and write requests should be persisted to storage
            expect(xhr).toHaveBeenCalledTimes(1);
            var persisted = PersistedRequests.getAll();
            expect(persisted).toEqual([
                expect.objectContaining({ command: 'mock command', data: expect.objectContaining({ param1: 'value1' }) }),
                expect.objectContaining({ command: 'mock command', data: expect.objectContaining({ param3: 'value3' }) }),
            ]);
            PersistedRequests.clear();
            return (0, waitForBatchedUpdates_1.default)();
        })
            .then(function () {
            expect(PersistedRequests.getAll()).toEqual([]);
        });
    });
    test('Write requests should resume when we are online', function () {
        var _a;
        // We're setting up a basic case where all requests succeed when we resume connectivity
        var xhr = jest.spyOn(HttpUtils_1.default, 'xhr').mockResolvedValue({ jsonCode: CONST_1.default.JSON_CODE.SUCCESS });
        // Given we have some requests made while we're offline
        return (Onyx.multiSet((_a = {},
            _a[ONYXKEYS_1.default.NETWORK] = { isOffline: true },
            _a[ONYXKEYS_1.default.CREDENTIALS] = { autoGeneratedLogin: 'test', autoGeneratedPassword: 'passwd' },
            _a[ONYXKEYS_1.default.SESSION] = { authToken: 'testToken' },
            _a))
            .then(function () {
            // When API Write commands are made
            API.write('mock command', { param1: 'value1' });
            API.write('mock command', { param2: 'value2' });
            return (0, waitForBatchedUpdates_1.default)();
        })
            .then(function () {
            var persisted = PersistedRequests.getAll();
            expect(persisted).toHaveLength(2);
        })
            // When we resume connectivity
            .then(function () { return Onyx.set(ONYXKEYS_1.default.NETWORK, { isOffline: false }); })
            .then(waitForBatchedUpdates_1.default)
            .then(function () {
            expect(NetworkStore.isOffline()).toBe(false);
            expect(SequentialQueue.isRunning()).toBe(false);
            // Then `xhr` should be called with expected data, and the persisted queue should be empty
            expect(xhr).toHaveBeenCalledTimes(2);
            expect(xhr.mock.calls).toEqual([
                expect.arrayContaining(['mock command', expect.objectContaining({ param1: 'value1' })]),
                expect.arrayContaining(['mock command', expect.objectContaining({ param2: 'value2' })]),
            ]);
            var persisted = PersistedRequests.getAll();
            expect(persisted).toEqual([]);
        }));
    });
    test('Write request should not be cleared until a backend response occurs', function () {
        // We're setting up xhr handler that will resolve calls programmatically
        var xhrCalls = [];
        var promises = [];
        jest.spyOn(HttpUtils_1.default, 'xhr').mockImplementation(function () {
            promises.push(new Promise(function (resolve, reject) {
                xhrCalls.push({ resolve: resolve, reject: reject });
            }));
            var promise = promises.slice(-1).at(0);
            if (promise === undefined) {
                throw new Error('Promise is undefined');
            }
            return promise;
        });
        // Given we have some requests made while we're offline
        return (Onyx.set(ONYXKEYS_1.default.NETWORK, { isOffline: true })
            .then(function () {
            // When API Write commands are made
            API.write('mock command', { param1: 'value1' });
            API.write('mock command', { param2: 'value2' });
            return (0, waitForBatchedUpdates_1.default)();
        })
            // When we resume connectivity
            .then(function () { return Onyx.set(ONYXKEYS_1.default.NETWORK, { isOffline: false }); })
            .then(waitForBatchedUpdates_1.default)
            .then(function () {
            var _a;
            // Then requests should remain persisted until the xhr call is resolved
            expect(PersistedRequests.getAll().length).toEqual(1);
            (_a = xhrCalls.at(0)) === null || _a === void 0 ? void 0 : _a.resolve({ jsonCode: CONST_1.default.JSON_CODE.SUCCESS });
            return (0, waitForBatchedUpdates_1.default)();
        })
            .then(waitForBatchedUpdates_1.default)
            .then(function () {
            var _a;
            expect(PersistedRequests.getAll().length).toEqual(0);
            expect(PersistedRequests.getOngoingRequest()).toEqual(expect.objectContaining({ command: 'mock command', data: expect.objectContaining({ param2: 'value2' }) }));
            // When a request fails it should be retried
            (_a = xhrCalls.at(1)) === null || _a === void 0 ? void 0 : _a.reject(new Error(CONST_1.default.ERROR.FAILED_TO_FETCH));
            return (0, waitForBatchedUpdates_1.default)();
        })
            .then(function () {
            // The ongoingRequest it is moving back to the persistedRequests queue
            expect(PersistedRequests.getAll().length).toEqual(1);
            expect(PersistedRequests.getAll()).toEqual([expect.objectContaining({ command: 'mock command', data: expect.objectContaining({ param2: 'value2' }) })]);
            // We need to advance past the request throttle back off timer because the request won't be retried until then
            return new Promise(function (resolve) {
                setTimeout(resolve, CONST_1.default.NETWORK.MAX_RANDOM_RETRY_WAIT_TIME_MS);
            }).then(waitForBatchedUpdates_1.default);
        })
            .then(function () {
            var _a;
            // A new promise is created after the back off timer
            // Finally, after it succeeds the queue should be empty
            (_a = xhrCalls.at(2)) === null || _a === void 0 ? void 0 : _a.resolve({ jsonCode: CONST_1.default.JSON_CODE.SUCCESS });
            return (0, waitForBatchedUpdates_1.default)();
        })
            .then(function () {
            expect(PersistedRequests.getAll().length).toEqual(0);
            expect(PersistedRequests.getOngoingRequest()).toBeNull();
        }));
    });
    // Given a retry response create a mock and run some expectations for retrying requests
    var retryExpectations = function (response) {
        var successfulResponse = {
            ok: true,
            jsonCode: CONST_1.default.JSON_CODE.SUCCESS,
            // We have to mock response.json() too
            json: function () { return Promise.resolve(successfulResponse); },
        };
        // Given a mock where a retry response is returned twice before a successful response
        global.fetch = jest.fn().mockResolvedValueOnce(response).mockResolvedValueOnce(response).mockResolvedValueOnce(successfulResponse);
        // Given we have a request made while we're offline
        return (Onyx.set(ONYXKEYS_1.default.NETWORK, { isOffline: true })
            .then(function () {
            // When API Write commands are made
            API.write('mock command', { param1: 'value1' });
            return (0, waitForNetworkPromises_1.default)();
        })
            // When we resume connectivity
            .then(function () { return Onyx.set(ONYXKEYS_1.default.NETWORK, { isOffline: false }); })
            .then(waitForBatchedUpdates_1.default)
            .then(function () {
            // Then there has only been one request so far
            expect(global.fetch).toHaveBeenCalledTimes(1);
            // And we still have 1 persisted request since it failed
            expect(PersistedRequests.getAll().length).toEqual(1);
            expect(PersistedRequests.getAll()).toEqual([expect.objectContaining({ command: 'mock command', data: expect.objectContaining({ param1: 'value1' }) })]);
            // We let the SequentialQueue process again after its wait time
            return new Promise(function (resolve) {
                setTimeout(resolve, SequentialQueue_1.sequentialQueueRequestThrottle.getLastRequestWaitTime());
            });
        })
            .then(function () {
            // Then we have retried the failing request
            expect(global.fetch).toHaveBeenCalledTimes(2);
            // And we still have 1 persisted request since it failed
            expect(PersistedRequests.getAll().length).toEqual(1);
            expect(PersistedRequests.getAll()).toEqual([expect.objectContaining({ command: 'mock command', data: expect.objectContaining({ param1: 'value1' }) })]);
            // We let the SequentialQueue process again after its wait time
            return new Promise(function (resolve) {
                setTimeout(resolve, SequentialQueue_1.sequentialQueueRequestThrottle.getLastRequestWaitTime());
            }).then(waitForBatchedUpdates_1.default);
        })
            .then(function () {
            // Then the request is retried again
            expect(global.fetch).toHaveBeenCalledTimes(3);
            // The request succeeds so the queue is empty
            expect(PersistedRequests.getAll().length).toEqual(0);
        }));
    };
    test.each([CONST_1.default.HTTP_STATUS.INTERNAL_SERVER_ERROR, CONST_1.default.HTTP_STATUS.BAD_GATEWAY, CONST_1.default.HTTP_STATUS.GATEWAY_TIMEOUT, CONST_1.default.HTTP_STATUS.UNKNOWN_ERROR])('Write requests with http status %d are retried', 
    // Given that a request resolves as not ok and with a particular http status
    // When we make a persisted request and the http status represents a server error then it is retried with exponential back off
    function (httpStatus) { return retryExpectations({ ok: false, status: httpStatus }); });
    test('write requests are retried when Auth is down', function () {
        // Given the response data returned when auth is down
        var responseData = {
            ok: true,
            status: CONST_1.default.JSON_CODE.SUCCESS,
            jsonCode: CONST_1.default.JSON_CODE.EXP_ERROR,
            title: CONST_1.default.ERROR_TITLE.SOCKET,
            type: CONST_1.default.ERROR_TYPE.SOCKET,
        };
        // We have to mock response.json() too
        var authIsDownResponse = __assign(__assign({}, responseData), { json: function () { return Promise.resolve(responseData); } });
        // When we make a request and auth is down then we retry until it's back
        return retryExpectations(authIsDownResponse);
    });
    test('Write request can trigger reauthentication for anything retryable', function () {
        // We're setting up xhr handler that rejects once with a 407 code and again with success
        var xhr = jest
            .spyOn(HttpUtils_1.default, 'xhr')
            .mockResolvedValue({ jsonCode: CONST_1.default.JSON_CODE.SUCCESS }) // Default
            .mockResolvedValueOnce({ jsonCode: CONST_1.default.JSON_CODE.NOT_AUTHENTICATED }) // Initial call to test command return 407
            .mockResolvedValueOnce({ jsonCode: CONST_1.default.JSON_CODE.SUCCESS }) // Call to Authenticate return 200
            .mockResolvedValueOnce({ jsonCode: CONST_1.default.JSON_CODE.SUCCESS }); // Original command return 200
        // Given we have a request made while we're offline and we have credentials available to reauthenticate
        Onyx.merge(ONYXKEYS_1.default.CREDENTIALS, { autoGeneratedLogin: 'test', autoGeneratedPassword: 'passwd' });
        return ((0, waitForBatchedUpdates_1.default)()
            .then(function () { return Onyx.set(ONYXKEYS_1.default.NETWORK, { isOffline: true }); })
            .then(function () {
            API.write('Mock', { param1: 'value1' });
            return (0, waitForBatchedUpdates_1.default)();
        })
            // When we resume connectivity
            .then(function () { return Onyx.set(ONYXKEYS_1.default.NETWORK, { isOffline: false }); })
            .then(waitForBatchedUpdates_1.default)
            .then(function () {
            var nonLogCalls = xhr.mock.calls.filter(function (_a) {
                var commandName = _a[0];
                return commandName !== 'Log';
            });
            // The request should be retried once and reauthenticate should be called the second time
            // expect(xhr).toHaveBeenCalledTimes(3);
            var call1 = nonLogCalls[0], call2 = nonLogCalls[1], call3 = nonLogCalls[2];
            var commandName1 = call1[0];
            var commandName2 = call2[0];
            var commandName3 = call3[0];
            expect(commandName1).toBe('Mock');
            expect(commandName2).toBe('Authenticate');
            expect(commandName3).toBe('Mock');
        }));
    });
    test('several actions made while offline will get added in the order they are created', function () {
        var _a;
        // Given offline state where all requests will eventually succeed without issue
        var xhr = jest.spyOn(HttpUtils_1.default, 'xhr').mockResolvedValue({ jsonCode: CONST_1.default.JSON_CODE.SUCCESS });
        return Onyx.multiSet((_a = {},
            _a[ONYXKEYS_1.default.SESSION] = { authToken: 'anyToken' },
            _a[ONYXKEYS_1.default.NETWORK] = { isOffline: true },
            _a[ONYXKEYS_1.default.CREDENTIALS] = { autoGeneratedLogin: 'test_user', autoGeneratedPassword: 'password' },
            _a))
            .then(function () {
            // When we queue 6 persistable commands and one not persistable
            API.write('MockCommand', { content: 'value1' });
            API.write('MockCommand', { content: 'value2' });
            API.write('MockCommand', { content: 'value3' });
            API.read('MockCommand', { content: 'not-persisted' });
            API.write('MockCommand', { content: 'value4' });
            API.write('MockCommand', { content: 'value5' });
            API.write('MockCommand', { content: 'value6' });
            return (0, waitForBatchedUpdates_1.default)();
        })
            .then(function () { return Onyx.set(ONYXKEYS_1.default.NETWORK, { isOffline: false }); })
            .then(waitForBatchedUpdates_1.default)
            .then(function () {
            var _a, _b, _c, _d, _e, _f, _g;
            // Then expect all 7 calls to have been made and for the Writes to be made in the order that we made them
            // The read command would have been made first (and would have failed in real-life)
            expect(xhr.mock.calls.length).toBe(7);
            expect((_a = xhr.mock.calls.at(0)) === null || _a === void 0 ? void 0 : _a[1].content).toBe('not-persisted');
            expect((_b = xhr.mock.calls.at(1)) === null || _b === void 0 ? void 0 : _b[1].content).toBe('value1');
            expect((_c = xhr.mock.calls.at(2)) === null || _c === void 0 ? void 0 : _c[1].content).toBe('value2');
            expect((_d = xhr.mock.calls.at(3)) === null || _d === void 0 ? void 0 : _d[1].content).toBe('value3');
            expect((_e = xhr.mock.calls.at(4)) === null || _e === void 0 ? void 0 : _e[1].content).toBe('value4');
            expect((_f = xhr.mock.calls.at(5)) === null || _f === void 0 ? void 0 : _f[1].content).toBe('value5');
            expect((_g = xhr.mock.calls.at(6)) === null || _g === void 0 ? void 0 : _g[1].content).toBe('value6');
        });
    });
    test('several actions made while offline will get added in the order they are created when we need to reauthenticate', function () {
        var _a;
        // Given offline state where all requests will eventually succeed without issue and assumed to be valid credentials
        var xhr = jest.spyOn(HttpUtils_1.default, 'xhr').mockResolvedValueOnce({ jsonCode: CONST_1.default.JSON_CODE.NOT_AUTHENTICATED }).mockResolvedValue({ jsonCode: CONST_1.default.JSON_CODE.SUCCESS });
        return Onyx.multiSet((_a = {},
            _a[ONYXKEYS_1.default.NETWORK] = { isOffline: true },
            _a[ONYXKEYS_1.default.SESSION] = { authToken: 'test' },
            _a[ONYXKEYS_1.default.CREDENTIALS] = { autoGeneratedLogin: 'test', autoGeneratedPassword: 'passwd' },
            _a))
            .then(function () {
            // When we queue 6 persistable commands
            API.write('MockCommand', { content: 'value1' });
            API.write('MockCommand', { content: 'value2' });
            API.write('MockCommand', { content: 'value3' });
            API.write('MockCommand', { content: 'value4' });
            API.write('MockCommand', { content: 'value5' });
            API.write('MockCommand', { content: 'value6' });
            return (0, waitForBatchedUpdates_1.default)();
        })
            .then(function () { return Onyx.set(ONYXKEYS_1.default.NETWORK, { isOffline: false }); })
            .then(waitForBatchedUpdates_1.default)
            .then(function () {
            var _a, _b, _c, _d, _e, _f, _g, _h;
            // Then expect only 8 calls to have been made total and for them to be made in the order that we made them despite requiring reauthentication
            expect(xhr.mock.calls.length).toBe(8);
            expect((_a = xhr.mock.calls.at(0)) === null || _a === void 0 ? void 0 : _a[1].content).toBe('value1');
            // Our call to Authenticate will not have a "content" field
            expect((_b = xhr.mock.calls.at(1)) === null || _b === void 0 ? void 0 : _b[1].content).not.toBeDefined();
            // Rest of the calls have the expected params and are called in sequence
            expect((_c = xhr.mock.calls.at(2)) === null || _c === void 0 ? void 0 : _c[1].content).toBe('value1');
            expect((_d = xhr.mock.calls.at(3)) === null || _d === void 0 ? void 0 : _d[1].content).toBe('value2');
            expect((_e = xhr.mock.calls.at(4)) === null || _e === void 0 ? void 0 : _e[1].content).toBe('value3');
            expect((_f = xhr.mock.calls.at(5)) === null || _f === void 0 ? void 0 : _f[1].content).toBe('value4');
            expect((_g = xhr.mock.calls.at(6)) === null || _g === void 0 ? void 0 : _g[1].content).toBe('value5');
            expect((_h = xhr.mock.calls.at(7)) === null || _h === void 0 ? void 0 : _h[1].content).toBe('value6');
        });
    });
    test('Sequential queue will succeed if triggered while reauthentication via main queue is in progress', function () {
        var _a;
        // Given offline state where all requests will eventually succeed without issue and assumed to be valid credentials
        var xhr = jest
            .spyOn(HttpUtils_1.default, 'xhr')
            .mockResolvedValueOnce({ jsonCode: CONST_1.default.JSON_CODE.NOT_AUTHENTICATED })
            .mockResolvedValueOnce({ jsonCode: CONST_1.default.JSON_CODE.NOT_AUTHENTICATED })
            .mockResolvedValue({ jsonCode: CONST_1.default.JSON_CODE.SUCCESS, authToken: 'newToken' });
        return Onyx.multiSet((_a = {},
            _a[ONYXKEYS_1.default.SESSION] = { authToken: 'oldToken' },
            _a[ONYXKEYS_1.default.NETWORK] = { isOffline: false },
            _a[ONYXKEYS_1.default.CREDENTIALS] = { autoGeneratedLogin: 'test_user', autoGeneratedPassword: 'password' },
            _a))
            .then(function () {
            // When we queue both non-persistable and persistable commands that will trigger reauthentication and go offline at the same time
            API.makeRequestWithSideEffects('AuthenticatePusher', {
                // eslint-disable-next-line @typescript-eslint/naming-convention
                socket_id: 'socket_id',
                // eslint-disable-next-line @typescript-eslint/naming-convention
                channel_name: 'channel_name',
                shouldRetry: false,
                forceNetworkRequest: false,
            });
            Onyx.set(ONYXKEYS_1.default.NETWORK, { isOffline: true });
            expect(NetworkStore.isOffline()).toBe(false);
            expect(NetworkStore.isAuthenticating()).toBe(false);
            return (0, waitForBatchedUpdates_1.default)();
        })
            .then(function () {
            API.write('MockCommand', {});
            expect(PersistedRequests.getAll().length).toBe(1);
            expect(NetworkStore.isOffline()).toBe(true);
            expect(SequentialQueue.isRunning()).toBe(false);
            expect(NetworkStore.isAuthenticating()).toBe(false);
            // We should only have a single call at this point as the main queue is stopped since we've gone offline
            expect(xhr.mock.calls.length).toBe(1);
            (0, waitForBatchedUpdates_1.default)();
            // Come back from offline to trigger the sequential queue flush
            Onyx.set(ONYXKEYS_1.default.NETWORK, { isOffline: false });
        })
            .then(function () {
            // When we wait for the sequential queue to finish
            expect(SequentialQueue.isRunning()).toBe(true);
            return (0, waitForBatchedUpdates_1.default)();
        })
            .then(function () {
            var _a, _b, _c, _d;
            // Then we should expect to see that...
            // The sequential queue has stopped
            expect(SequentialQueue.isRunning()).toBe(false);
            // All persisted requests have run
            expect(PersistedRequests.getAll().length).toBe(0);
            // We are not offline anymore
            expect(NetworkStore.isOffline()).toBe(false);
            // First call to xhr is the AuthenticatePusher request that could not call Authenticate because we went offline
            var firstCommand = ((_a = xhr.mock.calls.at(0)) !== null && _a !== void 0 ? _a : [])[0];
            expect(firstCommand).toBe('AuthenticatePusher');
            // Second call to xhr is the MockCommand that also failed with a 407
            var secondCommand = ((_b = xhr.mock.calls.at(1)) !== null && _b !== void 0 ? _b : [])[0];
            expect(secondCommand).toBe('MockCommand');
            // Third command should be the call to Authenticate
            var thirdCommand = ((_c = xhr.mock.calls.at(2)) !== null && _c !== void 0 ? _c : [])[0];
            expect(thirdCommand).toBe('Authenticate');
            var fourthCommand = ((_d = xhr.mock.calls.at(3)) !== null && _d !== void 0 ? _d : [])[0];
            expect(fourthCommand).toBe('MockCommand');
            // We are using the new authToken
            expect(NetworkStore.getAuthToken()).toBe('newToken');
            // We are no longer authenticating
            expect(NetworkStore.isAuthenticating()).toBe(false);
        });
    });
    test('Sequential queue will not run until credentials are read', function () {
        var _a;
        var xhr = jest.spyOn(HttpUtils_1.default, 'xhr');
        var processWithMiddleware = jest.spyOn(Request, 'processWithMiddleware');
        // Given a simulated a condition where the credentials have not yet been read from storage and we are offline
        return Onyx.multiSet((_a = {},
            _a[ONYXKEYS_1.default.NETWORK] = { isOffline: true },
            _a[ONYXKEYS_1.default.CREDENTIALS] = {},
            _a[ONYXKEYS_1.default.SESSION] = null,
            _a))
            .then(function () {
            expect(NetworkStore.isOffline()).toBe(true);
            NetworkStore.resetHasReadRequiredDataFromStorage();
            // And queue a Write request while offline
            API.write('MockCommand', { content: 'value1' });
            // Then we should expect the request to get persisted
            expect(PersistedRequests.getAll().length).toBe(1);
            // When we go online and wait for promises to resolve
            return Onyx.set(ONYXKEYS_1.default.NETWORK, { isOffline: false });
        })
            .then(waitForBatchedUpdates_1.default)
            .then(function () {
            var _a;
            expect(processWithMiddleware).toHaveBeenCalled();
            // Then we should not expect XHR to run
            expect(xhr).not.toHaveBeenCalled();
            // When we set our credentials and authToken
            return Onyx.multiSet((_a = {},
                _a[ONYXKEYS_1.default.CREDENTIALS] = { autoGeneratedLogin: 'test_user', autoGeneratedPassword: 'password' },
                _a[ONYXKEYS_1.default.SESSION] = { authToken: 'oldToken' },
                _a));
        })
            .then(waitForBatchedUpdates_1.default)
            .then(function () {
            // Then we should expect XHR to run
            expect(xhr).toHaveBeenCalled();
        });
    });
    test('Write request will move directly to the SequentialQueue when we are online and block non-Write requests', function () {
        var xhr = jest.spyOn(HttpUtils_1.default, 'xhr');
        return Onyx.set(ONYXKEYS_1.default.NETWORK, { isOffline: false })
            .then(function () {
            // GIVEN that we are online
            expect(NetworkStore.isOffline()).toBe(false);
            // WHEN we make a request that should be retried, one that should not, and another that should
            API.write('MockCommandOne', {});
            API.read('MockCommandTwo', null);
            API.write('MockCommandThree', {});
            // THEN the retryable requests should immediately be added to the persisted requests
            expect(PersistedRequests.getAll().length).toBe(2);
            // WHEN we wait for the queue to run and finish processing
            return (0, waitForBatchedUpdates_1.default)();
        })
            .then(function () {
            // THEN the queue should be stopped and there should be no more requests to run
            expect(SequentialQueue.isRunning()).toBe(false);
            expect(PersistedRequests.getAll().length).toBe(0);
            // And our Write request should run before our non persistable one in a blocking way
            var firstRequest = xhr.mock.calls.at(0);
            var firstRequestCommandName = (firstRequest !== null && firstRequest !== void 0 ? firstRequest : [])[0];
            expect(firstRequestCommandName).toBe('MockCommandOne');
            var secondRequest = xhr.mock.calls.at(1);
            var secondRequestCommandName = (secondRequest !== null && secondRequest !== void 0 ? secondRequest : [])[0];
            expect(secondRequestCommandName).toBe('MockCommandThree');
            // WHEN we advance the main queue timer and wait for promises
            return new Promise(function (resolve) {
                setTimeout(resolve, CONST_1.default.NETWORK.PROCESS_REQUEST_DELAY_MS);
            });
        })
            .then(function () {
            // THEN we should see that our third (non-persistable) request has run last
            var thirdRequest = xhr.mock.calls.at(2);
            var thirdRequestCommandName = (thirdRequest !== null && thirdRequest !== void 0 ? thirdRequest : [])[0];
            expect(thirdRequestCommandName).toBe('MockCommandTwo');
        });
    });
    test('All write requests are in the queue should be called even some of them are the same', function () {
        var _a;
        // Given offline state where all requests will eventually succeed without issue
        var xhr = jest.spyOn(HttpUtils_1.default, 'xhr').mockResolvedValue({ jsonCode: CONST_1.default.JSON_CODE.SUCCESS });
        return Onyx.multiSet((_a = {},
            _a[ONYXKEYS_1.default.SESSION] = { authToken: 'anyToken' },
            _a[ONYXKEYS_1.default.NETWORK] = { isOffline: true },
            _a[ONYXKEYS_1.default.CREDENTIALS] = { autoGeneratedLogin: 'test_user', autoGeneratedPassword: 'password' },
            _a))
            .then(function () {
            // When we queue 3 persistable commands and two of them are the same
            API.write('MockCommand', { content: 'value1' });
            API.write('MockCommand', { content: 'value2' });
            API.write('MockCommand', { content: 'value1' });
            return (0, waitForBatchedUpdates_1.default)();
        })
            .then(function () { return Onyx.set(ONYXKEYS_1.default.NETWORK, { isOffline: false }); })
            .then(waitForBatchedUpdates_1.default)
            .then(function () {
            var _a, _b, _c;
            // Then expect all 3 calls to have been made and for the Writes to be made in the order that we made them
            expect(xhr.mock.calls.length).toBe(3);
            expect((_a = xhr.mock.calls.at(0)) === null || _a === void 0 ? void 0 : _a[1].content).toBe('value1');
            expect((_b = xhr.mock.calls.at(1)) === null || _b === void 0 ? void 0 : _b[1].content).toBe('value2');
            expect((_c = xhr.mock.calls.at(2)) === null || _c === void 0 ? void 0 : _c[1].content).toBe('value1');
        });
    });
    test('Read request should not stuck when SequentialQueue is paused and resumed', function () { return __awaiter(void 0, void 0, void 0, function () {
        var xhr, thirdCommand;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    xhr = jest.spyOn(HttpUtils_1.default, 'xhr').mockResolvedValueOnce({ previousUpdateID: 1 });
                    API.write('MockWriteCommandOne', {});
                    API.write('MockWriteCommandTwo', {});
                    API.read('MockReadCommand', null);
                    return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                case 1:
                    _b.sent();
                    // When the SequentialQueue is unpaused
                    SequentialQueue.unpause();
                    return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                case 2:
                    _b.sent();
                    thirdCommand = ((_a = xhr.mock.calls.at(2)) !== null && _a !== void 0 ? _a : [])[0];
                    expect(thirdCommand).toBe('MockReadCommand');
                    return [2 /*return*/];
            }
        });
    }); });
    test('duplicated write APIs with resolveDuplicationConflictAction conflict', function () {
        var _a;
        var xhr = jest.spyOn(HttpUtils_1.default, 'xhr').mockResolvedValue({ jsonCode: CONST_1.default.JSON_CODE.SUCCESS });
        return Onyx.multiSet((_a = {},
            _a[ONYXKEYS_1.default.SESSION] = { authToken: 'anyToken' },
            _a[ONYXKEYS_1.default.NETWORK] = { isOffline: true },
            _a[ONYXKEYS_1.default.CREDENTIALS] = { autoGeneratedLogin: 'test_user', autoGeneratedPassword: 'password' },
            _a))
            .then(function () {
            // When we queue 3 duplicate persistable commands
            API.writeWithNoDuplicatesConflictAction('MockCommand', { content: 'value1' });
            API.writeWithNoDuplicatesConflictAction('MockCommand', { content: 'value2' });
            API.writeWithNoDuplicatesConflictAction('MockCommand', { content: 'value3' });
            return (0, waitForBatchedUpdates_1.default)();
        })
            .then(function () { return Onyx.set(ONYXKEYS_1.default.NETWORK, { isOffline: false }); })
            .then(waitForBatchedUpdates_1.default)
            .then(function () {
            var _a;
            // Then expect only 1 call to have been made and for the Writes to be made at the last one that was made
            expect(xhr.mock.calls.length).toBe(1);
            expect((_a = xhr.mock.calls.at(0)) === null || _a === void 0 ? void 0 : _a[1].content).toBe('value3');
        });
    });
    test('different write APIs with resolveDuplicationConflictAction conflict', function () {
        var _a;
        var xhr = jest.spyOn(HttpUtils_1.default, 'xhr').mockResolvedValue({ jsonCode: CONST_1.default.JSON_CODE.SUCCESS });
        return Onyx.multiSet((_a = {},
            _a[ONYXKEYS_1.default.SESSION] = { authToken: 'anyToken' },
            _a[ONYXKEYS_1.default.NETWORK] = { isOffline: true },
            _a[ONYXKEYS_1.default.CREDENTIALS] = { autoGeneratedLogin: 'test_user', autoGeneratedPassword: 'password' },
            _a))
            .then(function () {
            // When we queue 3 different persistable commands
            API.writeWithNoDuplicatesConflictAction('MockCommandOne', { content: 'value1' });
            API.writeWithNoDuplicatesConflictAction('MockCommandTwo', { content: 'value2' });
            API.writeWithNoDuplicatesConflictAction('MockCommandThree', { content: 'value3' });
            return (0, waitForBatchedUpdates_1.default)();
        })
            .then(function () { return Onyx.set(ONYXKEYS_1.default.NETWORK, { isOffline: false }); })
            .then(waitForBatchedUpdates_1.default)
            .then(function () {
            var _a, _b, _c;
            // Then expect all 3 calls to have been made and for the Writes to be made in the order that we made them
            expect(xhr.mock.calls.length).toBe(3);
            expect((_a = xhr.mock.calls.at(0)) === null || _a === void 0 ? void 0 : _a[1].content).toBe('value1');
            expect((_b = xhr.mock.calls.at(1)) === null || _b === void 0 ? void 0 : _b[1].content).toBe('value2');
            expect((_c = xhr.mock.calls.at(2)) === null || _c === void 0 ? void 0 : _c[1].content).toBe('value3');
        });
    });
    test('duplicated write APIs with resolveEnableFeatureConflicts conflict and same policyID', function () {
        var _a;
        var xhr = jest.spyOn(HttpUtils_1.default, 'xhr').mockResolvedValue({ jsonCode: CONST_1.default.JSON_CODE.SUCCESS });
        return Onyx.multiSet((_a = {},
            _a[ONYXKEYS_1.default.SESSION] = { authToken: 'anyToken' },
            _a[ONYXKEYS_1.default.NETWORK] = { isOffline: true },
            _a[ONYXKEYS_1.default.CREDENTIALS] = { autoGeneratedLogin: 'test_user', autoGeneratedPassword: 'password' },
            _a))
            .then(function () {
            // When we queue 3 duplicate persistable commands with same policyID and different enabled values
            API.writeWithNoDuplicatesEnableFeatureConflicts('MockCommand', { policyID: '1', enabled: true });
            API.writeWithNoDuplicatesEnableFeatureConflicts('MockCommand', { policyID: '1', enabled: false });
            API.writeWithNoDuplicatesEnableFeatureConflicts('MockCommand', { policyID: '1', enabled: true });
            return (0, waitForBatchedUpdates_1.default)();
        })
            .then(function () { return Onyx.set(ONYXKEYS_1.default.NETWORK, { isOffline: false }); })
            .then(waitForBatchedUpdates_1.default)
            .then(function () {
            var _a;
            // Then expect only 1 call to have been made and for the Writes to be made at the first one that was made
            expect(xhr.mock.calls.length).toBe(1);
            expect((_a = xhr.mock.calls.at(0)) === null || _a === void 0 ? void 0 : _a[1].enabled).toBe(true);
        });
    });
    test('consecutively enable and disable a feature with resolveEnableFeatureConflicts conflict', function () {
        var _a;
        var xhr = jest.spyOn(HttpUtils_1.default, 'xhr').mockResolvedValue({ jsonCode: CONST_1.default.JSON_CODE.SUCCESS });
        return Onyx.multiSet((_a = {},
            _a[ONYXKEYS_1.default.SESSION] = { authToken: 'anyToken' },
            _a[ONYXKEYS_1.default.NETWORK] = { isOffline: true },
            _a[ONYXKEYS_1.default.CREDENTIALS] = { autoGeneratedLogin: 'test_user', autoGeneratedPassword: 'password' },
            _a))
            .then(function () {
            // When we queue 2 duplicate persistable commands with same policyID and true and false enabled values
            API.writeWithNoDuplicatesEnableFeatureConflicts('MockCommand', { policyID: '1', enabled: true });
            API.writeWithNoDuplicatesEnableFeatureConflicts('MockCommand', { policyID: '1', enabled: false });
            return (0, waitForBatchedUpdates_1.default)();
        })
            .then(function () { return Onyx.set(ONYXKEYS_1.default.NETWORK, { isOffline: false }); })
            .then(waitForBatchedUpdates_1.default)
            .then(function () {
            // Then expect no calls is made
            expect(xhr.mock.calls.length).toBe(0);
        });
    });
    test('multiple write APIs with resolveEnableFeatureConflicts conflict with different policyIDs', function () {
        var _a;
        var xhr = jest.spyOn(HttpUtils_1.default, 'xhr').mockResolvedValue({ jsonCode: CONST_1.default.JSON_CODE.SUCCESS });
        return Onyx.multiSet((_a = {},
            _a[ONYXKEYS_1.default.SESSION] = { authToken: 'anyToken' },
            _a[ONYXKEYS_1.default.NETWORK] = { isOffline: true },
            _a[ONYXKEYS_1.default.CREDENTIALS] = { autoGeneratedLogin: 'test_user', autoGeneratedPassword: 'password' },
            _a))
            .then(function () {
            // When we queue 3 different persistable commands with different policyIDs
            API.writeWithNoDuplicatesEnableFeatureConflicts('MockCommand', { policyID: '1', enabled: true });
            API.writeWithNoDuplicatesEnableFeatureConflicts('MockCommand', { policyID: '2', enabled: false });
            API.writeWithNoDuplicatesEnableFeatureConflicts('MockCommand', { policyID: '3', enabled: true });
            return (0, waitForBatchedUpdates_1.default)();
        })
            .then(function () { return Onyx.set(ONYXKEYS_1.default.NETWORK, { isOffline: false }); })
            .then(waitForBatchedUpdates_1.default)
            .then(function () {
            var _a, _b, _c;
            // Then expect all 3 calls to have been made and for the Writes to be made in the order that we made them
            expect(xhr.mock.calls.length).toBe(3);
            expect((_a = xhr.mock.calls.at(0)) === null || _a === void 0 ? void 0 : _a[1].policyID).toBe('1');
            expect((_b = xhr.mock.calls.at(1)) === null || _b === void 0 ? void 0 : _b[1].policyID).toBe('2');
            expect((_c = xhr.mock.calls.at(2)) === null || _c === void 0 ? void 0 : _c[1].policyID).toBe('3');
        });
    });
    test('multiple write APIs with resolveEnableFeatureConflicts conflict with some different policyIDs', function () {
        var _a;
        var xhr = jest.spyOn(HttpUtils_1.default, 'xhr').mockResolvedValue({ jsonCode: CONST_1.default.JSON_CODE.SUCCESS });
        return Onyx.multiSet((_a = {},
            _a[ONYXKEYS_1.default.SESSION] = { authToken: 'anyToken' },
            _a[ONYXKEYS_1.default.NETWORK] = { isOffline: true },
            _a[ONYXKEYS_1.default.CREDENTIALS] = { autoGeneratedLogin: 'test_user', autoGeneratedPassword: 'password' },
            _a))
            .then(function () {
            // When we queue 3 different persistable commands with only 2 policyIDs
            API.writeWithNoDuplicatesEnableFeatureConflicts('MockCommand', { policyID: '1', enabled: true });
            API.writeWithNoDuplicatesEnableFeatureConflicts('MockCommand', { policyID: '2', enabled: false });
            API.writeWithNoDuplicatesEnableFeatureConflicts('MockCommand', { policyID: '1', enabled: false });
            return (0, waitForBatchedUpdates_1.default)();
        })
            .then(function () { return Onyx.set(ONYXKEYS_1.default.NETWORK, { isOffline: false }); })
            .then(waitForBatchedUpdates_1.default)
            .then(function () {
            var _a;
            // Then expect only 1 call to have been made and for the Writes that have unique policyID to be made
            expect(xhr.mock.calls.length).toBe(1);
            expect((_a = xhr.mock.calls.at(0)) === null || _a === void 0 ? void 0 : _a[1].policyID).toBe('2');
        });
    });
});
