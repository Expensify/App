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
var react_native_1 = require("@testing-library/react-native");
var sub_1 = require("date-fns/sub");
var react_native_onyx_1 = require("react-native-onyx");
var TestToolMenu_1 = require("@components/TestToolMenu");
var App_1 = require("@libs/actions/App");
var Reauthentication_1 = require("@libs/Middleware/Reauthentication");
var CONST_1 = require("@src/CONST");
var NetworkActions = require("@src/libs/actions/Network");
var OnyxUpdateManager_1 = require("@src/libs/actions/OnyxUpdateManager");
var PersistedRequests = require("@src/libs/actions/PersistedRequests");
var PersonalDetails = require("@src/libs/actions/PersonalDetails");
var Session = require("@src/libs/actions/Session");
var HttpUtils_1 = require("@src/libs/HttpUtils");
var Log_1 = require("@src/libs/Log");
var Network = require("@src/libs/Network");
var MainQueue = require("@src/libs/Network/MainQueue");
var NetworkStore = require("@src/libs/Network/NetworkStore");
var SequentialQueue = require("@src/libs/Network/SequentialQueue");
var NetworkConnection_1 = require("@src/libs/NetworkConnection");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var TestHelper = require("../utils/TestHelper");
var waitForBatchedUpdates_1 = require("../utils/waitForBatchedUpdates");
var Onyx = react_native_onyx_1.default;
jest.mock('@src/libs/Log');
Onyx.init({
    keys: ONYXKEYS_1.default,
});
(0, OnyxUpdateManager_1.default)();
var originalXHR = HttpUtils_1.default.xhr;
beforeEach(function () {
    global.fetch = TestHelper.getGlobalFetchMock();
    HttpUtils_1.default.xhr = originalXHR;
    // Reset any pending requests
    MainQueue.clear();
    HttpUtils_1.default.cancelPendingRequests();
    NetworkStore.checkRequiredData();
    NetworkStore.setIsAuthenticating(false);
    (0, Reauthentication_1.resetReauthentication)();
    Network.clearProcessQueueInterval();
    SequentialQueue.resetQueue();
    return Promise.all([SequentialQueue.waitForIdle(), (0, waitForBatchedUpdates_1.default)(), PersistedRequests.clear(), Onyx.clear()]).then(function () {
        return (0, waitForBatchedUpdates_1.default)();
    });
});
afterEach(function () {
    NetworkStore.resetHasReadRequiredDataFromStorage();
    Onyx.addDelayToConnectCallback(0);
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useRealTimers();
});
describe('NetworkTests', function () {
    test('failing to reauthenticate should not log out user', function () {
        // Use fake timers to control timing in the test
        jest.useFakeTimers();
        var TEST_USER_LOGIN = 'test@testguy.com';
        var TEST_USER_ACCOUNT_ID = 1;
        var NEW_AUTH_TOKEN = 'qwerty12345';
        var sessionState;
        Onyx.connect({
            key: ONYXKEYS_1.default.SESSION,
            callback: function (val) { return (sessionState = val); },
        });
        return TestHelper.signInWithTestUser(TEST_USER_ACCOUNT_ID, TEST_USER_LOGIN)
            .then(function () {
            // Mock XHR with a sequence of responses:
            // 1. First call fails with NOT_AUTHENTICATED
            // 2. Second call fails with network error
            // 3. Third call succeeds with new auth token
            var mockedXhr = jest
                .fn()
                .mockImplementationOnce(function () {
                return Promise.resolve({
                    jsonCode: CONST_1.default.JSON_CODE.NOT_AUTHENTICATED,
                });
            })
                .mockImplementationOnce(function () { return Promise.reject(new Error(CONST_1.default.ERROR.FAILED_TO_FETCH)); })
                .mockImplementationOnce(function () {
                return Promise.resolve({
                    jsonCode: CONST_1.default.JSON_CODE.SUCCESS,
                    authToken: NEW_AUTH_TOKEN,
                });
            });
            HttpUtils_1.default.xhr = mockedXhr;
            // Trigger an API call that will cause reauthentication flow
            PersonalDetails.openPublicProfilePage(TEST_USER_ACCOUNT_ID);
            return (0, waitForBatchedUpdates_1.default)();
        })
            .then(function () {
            // Process pending retry request
            jest.runAllTimers();
            return (0, waitForBatchedUpdates_1.default)();
        })
            .then(function () {
            // Verify:
            // 1. We attempted to authenticate twice (first failed, retry succeeded)
            // 2. The session has the new auth token (user wasn't logged out)
            var callsToAuthenticate = HttpUtils_1.default.xhr.mock.calls.filter(function (_a) {
                var command = _a[0];
                return command === 'Authenticate';
            });
            expect(callsToAuthenticate.length).toBe(2);
            expect(sessionState === null || sessionState === void 0 ? void 0 : sessionState.authToken).toBe(NEW_AUTH_TOKEN);
        });
    });
    test('failing to reauthenticate while offline should not log out user', function () { return __awaiter(void 0, void 0, void 0, function () {
        var TEST_USER_LOGIN, TEST_USER_ACCOUNT_ID, sessionState, initialAuthToken, resolveAuthRequest, pendingAuthRequest, mockedXhr, firstCall, secondCall;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    TEST_USER_LOGIN = 'test@testguy.com';
                    TEST_USER_ACCOUNT_ID = 1;
                    // Set up listeners for session and network state changes
                    Onyx.connect({
                        key: ONYXKEYS_1.default.SESSION,
                        callback: function (val) { return (sessionState = val); },
                    });
                    // Sign in test user and wait for updates
                    return [4 /*yield*/, TestHelper.signInWithTestUser(TEST_USER_ACCOUNT_ID, TEST_USER_LOGIN)];
                case 1:
                    // Sign in test user and wait for updates
                    _a.sent();
                    return [4 /*yield*/, Onyx.set(ONYXKEYS_1.default.HAS_LOADED_APP, true)];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                case 3:
                    _a.sent();
                    initialAuthToken = sessionState === null || sessionState === void 0 ? void 0 : sessionState.authToken;
                    expect(initialAuthToken).toBeDefined();
                    resolveAuthRequest = function () { };
                    pendingAuthRequest = new Promise(function (resolve) {
                        resolveAuthRequest = resolve;
                    });
                    mockedXhr = jest
                        .fn()
                        // First call: Return NOT_AUTHENTICATED to trigger reauthentication
                        .mockImplementationOnce(function () {
                        return Promise.resolve({
                            jsonCode: CONST_1.default.JSON_CODE.NOT_AUTHENTICATED,
                        });
                    })
                        // Second call: Return a pending promise that we'll resolve later
                        .mockImplementationOnce(function () { return pendingAuthRequest; });
                    HttpUtils_1.default.xhr = mockedXhr;
                    // 3. Test Execution Phase - Start with online network
                    return [4 /*yield*/, Onyx.set(ONYXKEYS_1.default.NETWORK, { isOffline: false })];
                case 4:
                    // 3. Test Execution Phase - Start with online network
                    _a.sent();
                    // Trigger reconnect which will fail due to expired token
                    (0, App_1.confirmReadyToOpenApp)();
                    (0, App_1.reconnectApp)();
                    return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                case 5:
                    _a.sent();
                    firstCall = mockedXhr.mock.calls.at(0);
                    expect(firstCall[0]).toBe('ReconnectApp');
                    // 5. Authentication Start - Verify authenticate was triggered
                    return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                case 6:
                    // 5. Authentication Start - Verify authenticate was triggered
                    _a.sent();
                    secondCall = mockedXhr.mock.calls.at(1);
                    expect(secondCall[0]).toBe('Authenticate');
                    // 6. Network State Change - Set offline and back online while authenticate is pending
                    return [4 /*yield*/, Onyx.set(ONYXKEYS_1.default.NETWORK, { isOffline: true })];
                case 7:
                    // 6. Network State Change - Set offline and back online while authenticate is pending
                    _a.sent();
                    return [4 /*yield*/, Onyx.set(ONYXKEYS_1.default.NETWORK, { isOffline: false })];
                case 8:
                    _a.sent();
                    // 7.Trigger another reconnect due to network change
                    (0, App_1.confirmReadyToOpenApp)();
                    (0, App_1.reconnectApp)();
                    // 8. Now fail the pending authentication request
                    resolveAuthRequest(Promise.reject(new Error('Network request failed')));
                    return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                case 9:
                    _a.sent(); // Now we wait for all updates after the auth request fails
                    // 9. Verify the session remained intact and wasn't cleared
                    expect(sessionState === null || sessionState === void 0 ? void 0 : sessionState.authToken).toBe(initialAuthToken);
                    return [2 /*return*/];
            }
        });
    }); });
    test('consecutive API calls eventually succeed when authToken is expired', function () {
        // Given a test user login and account ID
        var TEST_USER_LOGIN = 'test@testguy.com';
        var TEST_USER_ACCOUNT_ID = 1;
        var reconnectionCallbacksSpy = jest.spyOn(NetworkConnection_1.default, 'triggerReconnectionCallbacks');
        expect(reconnectionCallbacksSpy.mock.calls.length).toBe(0);
        // When we sign in
        return TestHelper.signInWithTestUser(TEST_USER_ACCOUNT_ID, TEST_USER_LOGIN)
            .then(function () {
            var mockedXhr = jest.fn();
            mockedXhr
                // And mock the first call to openPublicProfilePage return with an expired session code
                .mockImplementationOnce(function () {
                return Promise.resolve({
                    jsonCode: CONST_1.default.JSON_CODE.NOT_AUTHENTICATED,
                });
            })
                // The next 2 API calls will also fire and also return a 407
                .mockImplementationOnce(function () {
                return Promise.resolve({
                    jsonCode: CONST_1.default.JSON_CODE.NOT_AUTHENTICATED,
                });
            })
                .mockImplementationOnce(function () {
                return Promise.resolve({
                    jsonCode: CONST_1.default.JSON_CODE.NOT_AUTHENTICATED,
                });
            })
                // The request to Authenticate should succeed and we mock the responses for the remaining calls
                .mockImplementationOnce(function () {
                return Promise.resolve({
                    jsonCode: CONST_1.default.JSON_CODE.SUCCESS,
                    authToken: 'qwerty12345',
                });
            });
            HttpUtils_1.default.xhr = mockedXhr;
            // And then make 3 API READ requests in quick succession with an expired authToken and handle the response
            // It doesn't matter which requests these are really as all the response is mocked we just want to see
            // that we get re-authenticated
            PersonalDetails.openPublicProfilePage(TEST_USER_ACCOUNT_ID);
            PersonalDetails.openPublicProfilePage(TEST_USER_ACCOUNT_ID);
            PersonalDetails.openPublicProfilePage(TEST_USER_ACCOUNT_ID);
            return (0, waitForBatchedUpdates_1.default)();
        })
            .then(function () {
            // We should expect to see the three calls to OpenApp, but only one call to Authenticate.
            // And we should also see the reconnection callbacks triggered.
            var callsToOpenPublicProfilePage = HttpUtils_1.default.xhr.mock.calls.filter(function (_a) {
                var command = _a[0];
                return command === 'OpenPublicProfilePage';
            });
            var callsToAuthenticate = HttpUtils_1.default.xhr.mock.calls.filter(function (_a) {
                var command = _a[0];
                return command === 'Authenticate';
            });
            expect(callsToOpenPublicProfilePage.length).toBe(3);
            expect(callsToAuthenticate.length).toBe(1);
            expect(reconnectionCallbacksSpy.mock.calls.length).toBe(3);
        });
    });
    test('Request will not run until credentials are read from Onyx', function () {
        // In order to test an scenario where the auth token and credentials hasn't been read from storage we reset hasReadRequiredDataFromStorage
        // and set the session and credentials to "ready" the Network
        // Given a test user login and account ID
        var TEST_USER_LOGIN = 'test@testguy.com';
        // Given a delay to the Onyx.connect callbacks
        var ONYX_DELAY_MS = 3000;
        Onyx.addDelayToConnectCallback(ONYX_DELAY_MS);
        // Given initial state to Network
        NetworkStore.resetHasReadRequiredDataFromStorage();
        // Given some mock functions to track the isReady
        // flag in Network and the http requests made
        var spyHttpUtilsXhr = jest.spyOn(HttpUtils_1.default, 'xhr').mockImplementation(function () { return Promise.resolve({}); });
        // When we make a request
        Session.beginSignIn(TEST_USER_LOGIN);
        // Then we should expect that no requests have been made yet
        expect(spyHttpUtilsXhr).not.toHaveBeenCalled();
        // Once credentials are set and we wait for promises to resolve
        Onyx.merge(ONYXKEYS_1.default.CREDENTIALS, { login: 'test-login' });
        Onyx.merge(ONYXKEYS_1.default.SESSION, { authToken: 'test-auth-token' });
        return (0, waitForBatchedUpdates_1.default)().then(function () {
            // Then we should expect the request to have been made since the network is now ready
            expect(spyHttpUtilsXhr).not.toHaveBeenCalled();
        });
    });
    test('Non-retryable request will not be retried if connection is lost in flight', function () {
        // Given a xhr mock that will fail as if network connection dropped
        var xhr = jest.spyOn(HttpUtils_1.default, 'xhr').mockImplementationOnce(function () {
            Onyx.merge(ONYXKEYS_1.default.NETWORK, { isOffline: true });
            return Promise.reject(new Error(CONST_1.default.ERROR.FAILED_TO_FETCH));
        });
        // Given a non-retryable request (that is bound to fail)
        var promise = Network.post('Get');
        return (0, waitForBatchedUpdates_1.default)()
            .then(function () {
            // When network connection is recovered
            Onyx.merge(ONYXKEYS_1.default.NETWORK, { isOffline: false });
            return (0, waitForBatchedUpdates_1.default)();
        })
            .then(function () {
            // Advance the network request queue by 1 second so that it can realize it's back online
            jest.advanceTimersByTime(CONST_1.default.NETWORK.PROCESS_REQUEST_DELAY_MS);
            return (0, waitForBatchedUpdates_1.default)();
        })
            .then(function () {
            // Then the request should only have been attempted once and we should get an unable to retry
            expect(xhr).toHaveBeenCalledTimes(1);
            // And the promise should be resolved with the special offline jsonCode
            return expect(promise).resolves.toEqual({ jsonCode: CONST_1.default.JSON_CODE.UNABLE_TO_RETRY });
        });
    });
    test('test Bad Gateway status will log hmmm', function () {
        global.fetch = jest.fn().mockResolvedValueOnce({ ok: false, status: CONST_1.default.HTTP_STATUS.BAD_GATEWAY, statusText: 'Bad Gateway' });
        var logHmmmSpy = jest.spyOn(Log_1.default, 'hmmm');
        // Given we have a request made while online
        return Onyx.set(ONYXKEYS_1.default.NETWORK, { isOffline: false })
            .then(function () {
            Network.post('MockBadNetworkResponse', { param1: 'value1' });
            return (0, waitForBatchedUpdates_1.default)();
        })
            .then(function () {
            expect(logHmmmSpy).toHaveBeenCalled();
        });
    });
    test('test unknown status will log alert', function () {
        global.fetch = jest.fn().mockResolvedValueOnce({ ok: false, status: 418, statusText: "I'm a teapot" });
        var logAlertSpy = jest.spyOn(Log_1.default, 'alert');
        // Given we have a request made while online
        return Onyx.set(ONYXKEYS_1.default.NETWORK, { isOffline: false })
            .then(function () {
            Network.post('MockBadNetworkResponse', { param1: 'value1' });
            return (0, waitForBatchedUpdates_1.default)();
        })
            .then(function () {
            expect(logAlertSpy).toHaveBeenCalled();
        });
    });
    test('test Failed to fetch error for non-retryable requests resolve with unable to retry jsonCode', function () {
        // Setup xhr handler that rejects once with a Failed to Fetch
        global.fetch = jest.fn().mockRejectedValue(new Error(CONST_1.default.ERROR.FAILED_TO_FETCH));
        var onResolved = jest.fn();
        // Given we have a request made while online
        return Onyx.set(ONYXKEYS_1.default.NETWORK, { isOffline: false })
            .then(function () {
            expect(NetworkStore.isOffline()).toBe(false);
            // When network calls with are made
            Network.post('mock command', { param1: 'value1' }).then(onResolved);
            return (0, waitForBatchedUpdates_1.default)();
        })
            .then(function () {
            var _a;
            var response = (_a = onResolved.mock.calls.at(0)) === null || _a === void 0 ? void 0 : _a.at(0);
            expect(onResolved).toHaveBeenCalled();
            expect(response === null || response === void 0 ? void 0 : response.jsonCode).toBe(CONST_1.default.JSON_CODE.UNABLE_TO_RETRY);
        });
    });
    test('cancelled requests should not be retried', function () {
        var xhr = jest.spyOn(HttpUtils_1.default, 'xhr');
        // GIVEN a mock that will return a "cancelled" request error
        global.fetch = jest.fn().mockRejectedValue(new DOMException('Aborted', CONST_1.default.ERROR.REQUEST_CANCELLED));
        return Onyx.set(ONYXKEYS_1.default.NETWORK, { isOffline: false })
            .then(function () {
            // WHEN we make a few requests and then cancel them
            Network.post('MockCommandOne');
            Network.post('MockCommandTwo');
            Network.post('MockCommandThree');
            // WHEN we wait for the requests to all cancel
            return (0, waitForBatchedUpdates_1.default)();
        })
            .then(function () {
            // THEN expect our queue to be empty and for no requests to have been retried
            expect(MainQueue.getAll().length).toBe(0);
            expect(xhr.mock.calls.length).toBe(3);
        });
    });
    test('poor connection simulation', function () { return __awaiter(void 0, void 0, void 0, function () {
        var logSpy, setShouldForceOfflineSpy, setShouldFailAllRequestsSpy;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    logSpy = jest.spyOn(Log_1.default, 'info');
                    setShouldForceOfflineSpy = jest.spyOn(NetworkActions, 'setShouldForceOffline');
                    setShouldFailAllRequestsSpy = jest.spyOn(NetworkActions, 'setShouldFailAllRequests');
                    // Given an opened test tool menu
                    (0, react_native_1.render)(<TestToolMenu_1.default />);
                    expect(react_native_1.screen.getByAccessibilityHint('Force offline')).not.toBeDisabled();
                    expect(react_native_1.screen.getByAccessibilityHint('Simulate failing network requests')).not.toBeDisabled();
                    // When the connection simulation is turned on
                    NetworkActions.setShouldSimulatePoorConnection(true, undefined);
                    return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                case 1:
                    _a.sent();
                    // Then the connection status change log should be displayed as well Simulate poor internet connection toggle should be checked
                    expect(logSpy).toHaveBeenCalledWith(expect.stringMatching(/\[NetworkConnection\] Set connection status "(online|offline)" for (\d+(?:\.\d+)?) sec/));
                    expect(react_native_1.screen.getByAccessibilityHint('Simulate poor internet connection')).toBeChecked();
                    // And the setShouldForceOffline and setShouldFailAllRequests should not be called as the Force offline and Simulate failing network requests toggles are disabled
                    react_native_1.fireEvent.press(react_native_1.screen.getByAccessibilityHint('Force offline'));
                    return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                case 2:
                    _a.sent();
                    expect(setShouldForceOfflineSpy).not.toHaveBeenCalled();
                    react_native_1.fireEvent.press(react_native_1.screen.getByAccessibilityHint('Simulate failing network requests'));
                    return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                case 3:
                    _a.sent();
                    expect(setShouldFailAllRequestsSpy).not.toHaveBeenCalled();
                    return [2 /*return*/];
            }
        });
    }); });
    test('connection changes tracking', function () { return __awaiter(void 0, void 0, void 0, function () {
        var logSpy;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    logSpy = jest.spyOn(Log_1.default, 'info');
                    // Given tracked connection changes started at least an hour ago
                    Onyx.merge(ONYXKEYS_1.default.NETWORK, { connectionChanges: { amount: 5, startTime: (0, sub_1.sub)(new Date(), { hours: 1 }).getTime() } });
                    return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                case 1:
                    _a.sent();
                    // When the connection is changed one more time
                    NetworkConnection_1.default.setOfflineStatus(true);
                    // Then the log with information about connection changes since the start time should be shown
                    expect(logSpy).toHaveBeenCalledWith('[NetworkConnection] Connection has changed 6 time(s) for the last 1 hour(s). Poor connection simulation is turned off');
                    return [2 /*return*/];
            }
        });
    }); });
});
