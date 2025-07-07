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
var globals_1 = require("@jest/globals");
var react_native_onyx_1 = require("react-native-onyx");
var App_1 = require("@libs/actions/App");
var OnyxUpdateManager_1 = require("@libs/actions/OnyxUpdateManager");
var PersistedRequests_1 = require("@libs/actions/PersistedRequests");
// eslint-disable-next-line no-restricted-syntax
var SignInRedirect = require("@libs/actions/SignInRedirect");
var types_1 = require("@libs/API/types");
var asyncOpenURL_1 = require("@libs/asyncOpenURL");
var HttpUtils_1 = require("@libs/HttpUtils");
var PushNotification_1 = require("@libs/Notification/PushNotification");
// This lib needs to be imported, but it has nothing to export since all it contains is an Onyx connection
require("@libs/Notification/PushNotification/subscribeToPushNotifications");
var CONFIG_1 = require("@src/CONFIG");
var CONST_1 = require("@src/CONST");
var SessionUtil = require("@src/libs/actions/Session");
var Session_1 = require("@src/libs/actions/Session");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var TestHelper = require("../utils/TestHelper");
var waitForBatchedUpdates_1 = require("../utils/waitForBatchedUpdates");
// We are mocking this method so that we can later test to see if it was called and what arguments it was called with.
// We test HttpUtils.xhr() since this means that our API command turned into a network request and isn't only queued.
HttpUtils_1.default.xhr = globals_1.jest.fn();
// Mocked to ensure push notifications are subscribed/unsubscribed as the session changes
globals_1.jest.mock('@libs/Notification/PushNotification');
// Mocked to check SignOutAndRedirectToSignIn behavior
globals_1.jest.mock('@libs/asyncOpenURL');
react_native_onyx_1.default.init({
    keys: ONYXKEYS_1.default,
});
(0, OnyxUpdateManager_1.default)();
(0, globals_1.beforeEach)(function () { return react_native_onyx_1.default.clear().then(waitForBatchedUpdates_1.default); });
describe('Session', function () {
    (0, globals_1.test)('Authenticate is called with saved credentials when a session expires', function () { return __awaiter(void 0, void 0, void 0, function () {
        var TEST_USER_LOGIN, TEST_USER_ACCOUNT_ID, TEST_INITIAL_AUTH_TOKEN, TEST_REFRESHED_AUTH_TOKEN, credentials, session;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    TEST_USER_LOGIN = 'test@testguy.com';
                    TEST_USER_ACCOUNT_ID = 1;
                    TEST_INITIAL_AUTH_TOKEN = 'initialAuthToken';
                    TEST_REFRESHED_AUTH_TOKEN = 'refreshedAuthToken';
                    react_native_onyx_1.default.connect({
                        key: ONYXKEYS_1.default.CREDENTIALS,
                        callback: function (val) { return (credentials = val); },
                    });
                    react_native_onyx_1.default.connect({
                        key: ONYXKEYS_1.default.SESSION,
                        callback: function (val) { return (session = val); },
                    });
                    // When we sign in with the test user
                    return [4 /*yield*/, TestHelper.signInWithTestUser(TEST_USER_ACCOUNT_ID, TEST_USER_LOGIN, 'Password1', TEST_INITIAL_AUTH_TOKEN)];
                case 1:
                    // When we sign in with the test user
                    _a.sent();
                    return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                case 2:
                    _a.sent();
                    // Then our re-authentication credentials should be generated and our session data
                    // have the correct information + initial authToken.
                    expect(credentials === null || credentials === void 0 ? void 0 : credentials.login).toBe(TEST_USER_LOGIN);
                    expect(credentials === null || credentials === void 0 ? void 0 : credentials.autoGeneratedLogin).not.toBeUndefined();
                    expect(credentials === null || credentials === void 0 ? void 0 : credentials.autoGeneratedPassword).not.toBeUndefined();
                    expect(session === null || session === void 0 ? void 0 : session.authToken).toBe(TEST_INITIAL_AUTH_TOKEN);
                    expect(session === null || session === void 0 ? void 0 : session.accountID).toBe(TEST_USER_ACCOUNT_ID);
                    expect(session === null || session === void 0 ? void 0 : session.email).toBe(TEST_USER_LOGIN);
                    // At this point we have an authToken. To simulate it expiring we'll just make another
                    // request and mock the response so it returns 407. Once this happens we should attempt
                    // to Re-Authenticate with the stored credentials. Our next call will be to Authenticate
                    // so we will mock that response with a new authToken and then verify that Onyx has our
                    // data.
                    HttpUtils_1.default.xhr
                        // This will make the call to OpenApp below return with an expired session code
                        .mockImplementationOnce(function () {
                        return Promise.resolve({
                            jsonCode: CONST_1.default.JSON_CODE.NOT_AUTHENTICATED,
                        });
                    })
                        // The next call should be Authenticate since we are re-authenticating
                        .mockImplementationOnce(function () {
                        return Promise.resolve({
                            jsonCode: CONST_1.default.JSON_CODE.SUCCESS,
                            accountID: TEST_USER_ACCOUNT_ID,
                            authToken: TEST_REFRESHED_AUTH_TOKEN,
                            email: TEST_USER_LOGIN,
                        });
                    });
                    // When we attempt to fetch the initial app data via the API
                    (0, App_1.confirmReadyToOpenApp)();
                    (0, App_1.openApp)();
                    return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                case 3:
                    _a.sent();
                    // Then it should fail and reauthenticate the user adding the new authToken to the session
                    // data in Onyx
                    expect(session === null || session === void 0 ? void 0 : session.authToken).toBe(TEST_REFRESHED_AUTH_TOKEN);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, globals_1.test)('Push notifications are subscribed after signing in', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, TestHelper.signInWithTestUser()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                case 2:
                    _a.sent();
                    expect(PushNotification_1.default.register).toBeCalled();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, globals_1.test)('Push notifications are unsubscribed after signing out', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, TestHelper.signInWithTestUser()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, TestHelper.signOutTestUser()];
                case 2:
                    _a.sent();
                    expect(PushNotification_1.default.deregister).toBeCalled();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, globals_1.test)('ReconnectApp should push request to the queue', function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, TestHelper.signInWithTestUser()];
                case 1:
                    _b.sent();
                    return [4 /*yield*/, react_native_onyx_1.default.set(ONYXKEYS_1.default.HAS_LOADED_APP, true)];
                case 2:
                    _b.sent();
                    return [4 /*yield*/, react_native_onyx_1.default.set(ONYXKEYS_1.default.NETWORK, { isOffline: true })];
                case 3:
                    _b.sent();
                    (0, App_1.confirmReadyToOpenApp)();
                    (0, App_1.reconnectApp)();
                    return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                case 4:
                    _b.sent();
                    expect((0, PersistedRequests_1.getAll)().length).toBe(1);
                    expect((_a = (0, PersistedRequests_1.getAll)().at(0)) === null || _a === void 0 ? void 0 : _a.command).toBe(types_1.WRITE_COMMANDS.RECONNECT_APP);
                    return [4 /*yield*/, react_native_onyx_1.default.set(ONYXKEYS_1.default.NETWORK, { isOffline: false })];
                case 5:
                    _b.sent();
                    return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                case 6:
                    _b.sent();
                    expect((0, PersistedRequests_1.getAll)().length).toBe(0);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, globals_1.test)('ReconnectApp should open if app is not loaded', function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, TestHelper.signInWithTestUser()];
                case 1:
                    _b.sent();
                    return [4 /*yield*/, react_native_onyx_1.default.set(ONYXKEYS_1.default.HAS_LOADED_APP, false)];
                case 2:
                    _b.sent();
                    return [4 /*yield*/, react_native_onyx_1.default.set(ONYXKEYS_1.default.NETWORK, { isOffline: true })];
                case 3:
                    _b.sent();
                    (0, App_1.confirmReadyToOpenApp)();
                    (0, App_1.reconnectApp)();
                    return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                case 4:
                    _b.sent();
                    expect((0, PersistedRequests_1.getAll)().length).toBe(1);
                    expect((_a = (0, PersistedRequests_1.getAll)().at(0)) === null || _a === void 0 ? void 0 : _a.command).toBe(types_1.WRITE_COMMANDS.OPEN_APP);
                    return [4 /*yield*/, react_native_onyx_1.default.set(ONYXKEYS_1.default.NETWORK, { isOffline: false })];
                case 5:
                    _b.sent();
                    return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                case 6:
                    _b.sent();
                    expect((0, PersistedRequests_1.getAll)().length).toBe(0);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, globals_1.test)('ReconnectApp should replace same requests from the queue', function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, TestHelper.signInWithTestUser()];
                case 1:
                    _b.sent();
                    return [4 /*yield*/, react_native_onyx_1.default.set(ONYXKEYS_1.default.HAS_LOADED_APP, true)];
                case 2:
                    _b.sent();
                    return [4 /*yield*/, react_native_onyx_1.default.set(ONYXKEYS_1.default.NETWORK, { isOffline: true })];
                case 3:
                    _b.sent();
                    (0, App_1.confirmReadyToOpenApp)();
                    (0, App_1.reconnectApp)();
                    (0, App_1.reconnectApp)();
                    (0, App_1.reconnectApp)();
                    (0, App_1.reconnectApp)();
                    return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                case 4:
                    _b.sent();
                    expect((0, PersistedRequests_1.getAll)().length).toBe(1);
                    expect((_a = (0, PersistedRequests_1.getAll)().at(0)) === null || _a === void 0 ? void 0 : _a.command).toBe(types_1.WRITE_COMMANDS.RECONNECT_APP);
                    return [4 /*yield*/, react_native_onyx_1.default.set(ONYXKEYS_1.default.NETWORK, { isOffline: false })];
                case 5:
                    _b.sent();
                    expect((0, PersistedRequests_1.getAll)().length).toBe(0);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, globals_1.test)('OpenApp should push request to the queue', function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, TestHelper.signInWithTestUser()];
                case 1:
                    _b.sent();
                    return [4 /*yield*/, react_native_onyx_1.default.set(ONYXKEYS_1.default.NETWORK, { isOffline: true })];
                case 2:
                    _b.sent();
                    (0, App_1.openApp)();
                    return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                case 3:
                    _b.sent();
                    expect((0, PersistedRequests_1.getAll)().length).toBe(1);
                    expect((_a = (0, PersistedRequests_1.getAll)().at(0)) === null || _a === void 0 ? void 0 : _a.command).toBe(types_1.WRITE_COMMANDS.OPEN_APP);
                    return [4 /*yield*/, react_native_onyx_1.default.set(ONYXKEYS_1.default.NETWORK, { isOffline: false })];
                case 4:
                    _b.sent();
                    return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                case 5:
                    _b.sent();
                    expect((0, PersistedRequests_1.getAll)().length).toBe(0);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, globals_1.test)('OpenApp should replace same requests from the queue', function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, TestHelper.signInWithTestUser()];
                case 1:
                    _b.sent();
                    return [4 /*yield*/, react_native_onyx_1.default.set(ONYXKEYS_1.default.NETWORK, { isOffline: true })];
                case 2:
                    _b.sent();
                    (0, App_1.openApp)();
                    (0, App_1.openApp)();
                    (0, App_1.openApp)();
                    (0, App_1.openApp)();
                    return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                case 3:
                    _b.sent();
                    expect((0, PersistedRequests_1.getAll)().length).toBe(1);
                    expect((_a = (0, PersistedRequests_1.getAll)().at(0)) === null || _a === void 0 ? void 0 : _a.command).toBe(types_1.WRITE_COMMANDS.OPEN_APP);
                    return [4 /*yield*/, react_native_onyx_1.default.set(ONYXKEYS_1.default.NETWORK, { isOffline: false })];
                case 4:
                    _b.sent();
                    expect((0, PersistedRequests_1.getAll)().length).toBe(0);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, globals_1.test)('SignOut should return a promise with response containing hasOldDotAuthCookies', function () { return __awaiter(void 0, void 0, void 0, function () {
        var signOutPromise, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, TestHelper.signInWithTestUser()];
                case 1:
                    _b.sent();
                    return [4 /*yield*/, react_native_onyx_1.default.set(ONYXKEYS_1.default.NETWORK, { isOffline: true })];
                case 2:
                    _b.sent();
                    HttpUtils_1.default.xhr
                        // This will make the call to OpenApp below return with an expired session code
                        .mockImplementationOnce(function () {
                        return Promise.resolve({
                            jsonCode: CONST_1.default.JSON_CODE.SUCCESS,
                            hasOldDotAuthCookies: true,
                        });
                    });
                    signOutPromise = SessionUtil.signOut();
                    expect(signOutPromise).toBeInstanceOf(Promise);
                    _a = expect;
                    return [4 /*yield*/, signOutPromise];
                case 3:
                    _a.apply(void 0, [_b.sent()]).toStrictEqual({
                        jsonCode: CONST_1.default.JSON_CODE.SUCCESS,
                        hasOldDotAuthCookies: true,
                    });
                    return [4 /*yield*/, react_native_onyx_1.default.set(ONYXKEYS_1.default.NETWORK, { isOffline: false })];
                case 4:
                    _b.sent();
                    expect((0, PersistedRequests_1.getAll)().length).toBe(0);
                    return [2 /*return*/];
            }
        });
    }); });
    (0, globals_1.test)('SignOutAndRedirectToSignIn should redirect to OldDot when LogOut returns truthy hasOldDotAuthCookies', function () { return __awaiter(void 0, void 0, void 0, function () {
        var redirectToSignInSpy;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, TestHelper.signInWithTestUser()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, react_native_onyx_1.default.set(ONYXKEYS_1.default.NETWORK, { isOffline: true })];
                case 2:
                    _a.sent();
                    HttpUtils_1.default.xhr
                        // This will make the call to OpenApp below return with an expired session code
                        .mockImplementationOnce(function () {
                        return Promise.resolve({
                            jsonCode: CONST_1.default.JSON_CODE.SUCCESS,
                            hasOldDotAuthCookies: true,
                        });
                    });
                    redirectToSignInSpy = globals_1.jest.spyOn(SignInRedirect, 'default').mockImplementation(function () { return Promise.resolve(); });
                    (0, Session_1.signOutAndRedirectToSignIn)();
                    return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                case 3:
                    _a.sent();
                    expect(asyncOpenURL_1.default).toHaveBeenCalledWith(Promise.resolve(), "".concat(CONFIG_1.default.EXPENSIFY.EXPENSIFY_URL).concat(CONST_1.default.OLDDOT_URLS.SIGN_OUT), true, true);
                    expect(redirectToSignInSpy).toHaveBeenCalled();
                    globals_1.jest.clearAllMocks();
                    return [2 /*return*/];
            }
        });
    }); });
    (0, globals_1.test)('SignOutAndRedirectToSignIn should not redirect to OldDot when LogOut return falsy hasOldDotAuthCookies', function () { return __awaiter(void 0, void 0, void 0, function () {
        var redirectToSignInSpy;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, TestHelper.signInWithTestUser()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, react_native_onyx_1.default.set(ONYXKEYS_1.default.NETWORK, { isOffline: true })];
                case 2:
                    _a.sent();
                    HttpUtils_1.default.xhr
                        // This will make the call to OpenApp below return with an expired session code
                        .mockImplementationOnce(function () {
                        return Promise.resolve({
                            jsonCode: CONST_1.default.JSON_CODE.SUCCESS,
                        });
                    });
                    redirectToSignInSpy = globals_1.jest.spyOn(SignInRedirect, 'default').mockImplementation(function () { return Promise.resolve(); });
                    (0, Session_1.signOutAndRedirectToSignIn)();
                    return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                case 3:
                    _a.sent();
                    expect(asyncOpenURL_1.default).not.toHaveBeenCalled();
                    expect(redirectToSignInSpy).toHaveBeenCalled();
                    globals_1.jest.clearAllMocks();
                    return [2 /*return*/];
            }
        });
    }); });
});
