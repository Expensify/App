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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertFormDataMatchesObject = assertFormDataMatchesObject;
exports.buildPersonalDetails = buildPersonalDetails;
exports.buildTestReportComment = buildTestReportComment;
exports.getFetchMockCalls = getFetchMockCalls;
exports.getGlobalFetchMock = getGlobalFetchMock;
exports.setPersonalDetails = setPersonalDetails;
exports.signInWithTestUser = signInWithTestUser;
exports.signOutTestUser = signOutTestUser;
exports.setupApp = setupApp;
exports.expectAPICommandToHaveBeenCalled = expectAPICommandToHaveBeenCalled;
exports.expectAPICommandToHaveBeenCalledWith = expectAPICommandToHaveBeenCalledWith;
exports.setupGlobalFetchMock = setupGlobalFetchMock;
exports.navigateToSidebarOption = navigateToSidebarOption;
exports.getOnyxData = getOnyxData;
exports.getNavigateToChatHintRegex = getNavigateToChatHintRegex;
var react_native_1 = require("@testing-library/react-native");
var expensify_common_1 = require("expensify-common");
var react_native_2 = require("react-native");
var react_native_onyx_1 = require("react-native-onyx");
var Localize_1 = require("@libs/Localize");
var Pusher_1 = require("@libs/Pusher");
var PusherConnectionManager_1 = require("@libs/PusherConnectionManager");
var CONFIG_1 = require("@src/CONFIG");
var CONST_1 = require("@src/CONST");
var Session = require("@src/libs/actions/Session");
var HttpUtils_1 = require("@src/libs/HttpUtils");
var NumberUtils = require("@src/libs/NumberUtils");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var setup_1 = require("@src/setup");
var waitForBatchedUpdates_1 = require("./waitForBatchedUpdates");
var waitForBatchedUpdatesWithAct_1 = require("./waitForBatchedUpdatesWithAct");
function setupApp() {
    beforeAll(function () {
        react_native_2.Linking.setInitialURL('https://new.expensify.com/');
        (0, setup_1.default)();
        // Connect to Pusher
        PusherConnectionManager_1.default.init();
        Pusher_1.default.init({
            appKey: CONFIG_1.default.PUSHER.APP_KEY,
            cluster: CONFIG_1.default.PUSHER.CLUSTER,
            authEndpoint: "".concat(CONFIG_1.default.EXPENSIFY.DEFAULT_API_ROOT, "api/AuthenticatePusher?"),
        });
    });
}
function buildPersonalDetails(login, accountID, firstName) {
    if (firstName === void 0) { firstName = 'Test'; }
    return {
        accountID: accountID,
        login: login,
        avatar: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_7.png',
        avatarThumbnail: 'https://d2k5nsl2zxldvw.cloudfront.net/images/avatars/avatar_7.png',
        displayName: "".concat(firstName, " User"),
        firstName: firstName,
        lastName: 'User',
        pronouns: '',
        timezone: CONST_1.default.DEFAULT_TIME_ZONE,
        phoneNumber: '',
    };
}
function getOnyxData(options) {
    return new Promise(function (resolve) {
        var connectionID = react_native_onyx_1.default.connect(__assign(__assign({}, options), { callback: function () {
                var _a;
                var params = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    params[_i] = arguments[_i];
                }
                react_native_onyx_1.default.disconnect(connectionID);
                (_a = options.callback) === null || _a === void 0 ? void 0 : _a.call.apply(_a, __spreadArray([options], params, false));
                resolve();
            } }));
    });
}
/**
 * Simulate signing in and make sure all API calls in this flow succeed. Every time we add
 * a mockImplementationOnce() we are altering what Network.post() will return.
 */
// cspell:disable-next-line
function signInWithTestUser(accountID, login, password, authToken, firstName) {
    if (accountID === void 0) { accountID = 1; }
    if (login === void 0) { login = 'test@user.com'; }
    if (password === void 0) { password = 'Password1'; }
    if (authToken === void 0) { authToken = 'asdfqwerty'; }
    if (firstName === void 0) { firstName = 'Test'; }
    var originalXhr = HttpUtils_1.default.xhr;
    HttpUtils_1.default.xhr = jest.fn().mockImplementation(function () {
        var _a;
        var mockedResponse = {
            onyxData: [
                {
                    onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                    key: ONYXKEYS_1.default.CREDENTIALS,
                    value: {
                        login: login,
                    },
                },
                {
                    onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                    key: ONYXKEYS_1.default.ACCOUNT,
                    value: {
                        validated: true,
                    },
                },
                {
                    onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                    key: ONYXKEYS_1.default.PERSONAL_DETAILS_LIST,
                    value: (_a = {},
                        _a[accountID] = buildPersonalDetails(login, accountID, firstName),
                        _a),
                },
            ],
            jsonCode: 200,
        };
        // Return a Promise that resolves with the mocked response
        return Promise.resolve(mockedResponse);
    });
    // Simulate user entering their login and populating the credentials.login
    Session.beginSignIn(login);
    return (0, waitForBatchedUpdates_1.default)()
        .then(function () {
        HttpUtils_1.default.xhr = jest.fn().mockImplementation(function () {
            var mockedResponse = {
                onyxData: [
                    {
                        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                        key: ONYXKEYS_1.default.SESSION,
                        value: {
                            authToken: authToken,
                            accountID: accountID,
                            email: login,
                            encryptedAuthToken: authToken,
                        },
                    },
                    {
                        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                        key: ONYXKEYS_1.default.CREDENTIALS,
                        value: {
                            autoGeneratedLogin: expensify_common_1.Str.guid('expensify.cash-'),
                            autoGeneratedPassword: expensify_common_1.Str.guid(),
                        },
                    },
                    {
                        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                        key: ONYXKEYS_1.default.ACCOUNT,
                        value: {
                            isUsingExpensifyCard: false,
                        },
                    },
                    {
                        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                        key: ONYXKEYS_1.default.BETAS,
                        value: ['all'],
                    },
                    {
                        onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                        key: ONYXKEYS_1.default.NVP_PRIVATE_PUSH_NOTIFICATION_ID,
                        value: 'randomID',
                    },
                ],
                jsonCode: 200,
            };
            // Return a Promise that resolves with the mocked response
            return Promise.resolve(mockedResponse);
        });
        Session.signIn(password);
        return (0, waitForBatchedUpdates_1.default)();
    })
        .then(function () {
        HttpUtils_1.default.xhr = originalXhr;
    });
}
function signOutTestUser() {
    var originalXhr = HttpUtils_1.default.xhr;
    HttpUtils_1.default.xhr = jest.fn().mockImplementation(function () {
        var mockedResponse = {
            jsonCode: 200,
        };
        // Return a Promise that resolves with the mocked response
        return Promise.resolve(mockedResponse);
    });
    Session.signOutAndRedirectToSignIn();
    return (0, waitForBatchedUpdates_1.default)().then(function () { return (HttpUtils_1.default.xhr = originalXhr); });
}
/**
 * Use for situations where fetch() is required. This mock is stateful and has some additional methods to control its behavior:
 *
 * - pause() – stop resolving promises until you call resume()
 * - resume() - flush the queue of promises, and start resolving new promises immediately
 * - fail() - start returning a failure response
 * - success() - go back to returning a success response
 */
function getGlobalFetchMock() {
    var _this = this;
    var queue = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    var responses = new Map();
    var isPaused = false;
    var shouldFail = false;
    var getResponse = function (input, options) {
        return shouldFail
            ? {
                ok: true,
                json: function () { return Promise.resolve({ jsonCode: 400 }); },
            }
            : {
                ok: true,
                json: function () { return __awaiter(_this, void 0, void 0, function () {
                    var commandMatch, command, responseHandler, requestData;
                    return __generator(this, function (_a) {
                        commandMatch = typeof input === 'string' ? input.match(/https:\/\/www.expensify.com.dev\/api\/(\w+)\?/) : null;
                        command = commandMatch ? commandMatch[1] : null;
                        responseHandler = command ? responses.get(command) : null;
                        if (responseHandler) {
                            requestData = (options === null || options === void 0 ? void 0 : options.body) instanceof FormData ? Object.fromEntries(options.body) : {};
                            return [2 /*return*/, Promise.resolve(__assign({ jsonCode: 200 }, responseHandler(requestData)))];
                        }
                        return [2 /*return*/, Promise.resolve({ jsonCode: 200 })];
                    });
                }); },
            };
    };
    var mockFetch = jest.fn().mockImplementation(function (input, options) {
        if (!isPaused) {
            return Promise.resolve(getResponse(input, options));
        }
        return new Promise(function (resolve) {
            queue.push({ resolve: resolve, input: input, options: options });
        });
    });
    var baseMockReset = mockFetch.mockReset.bind(mockFetch);
    mockFetch.mockReset = function () {
        baseMockReset();
        queue = [];
        responses = new Map();
        isPaused = false;
        shouldFail = false;
        return mockFetch;
    };
    mockFetch.pause = function () { return (isPaused = true); };
    mockFetch.resume = function () {
        isPaused = false;
        queue.forEach(function (_a) {
            var resolve = _a.resolve, input = _a.input;
            return resolve(getResponse(input));
        });
        return (0, waitForBatchedUpdates_1.default)();
    };
    mockFetch.fail = function () { return (shouldFail = true); };
    mockFetch.succeed = function () { return (shouldFail = false); };
    mockFetch.mockAPICommand = function (command, responseHandler) {
        responses.set(command, responseHandler);
    };
    return mockFetch;
}
function setupGlobalFetchMock() {
    var mockFetch = getGlobalFetchMock();
    var originalFetch = global.fetch;
    global.fetch = mockFetch;
    afterAll(function () {
        global.fetch = originalFetch;
    });
    return mockFetch;
}
function getFetchMockCalls(commandName) {
    return global.fetch.mock.calls.filter(function (c) { return c[0] === "https://www.expensify.com.dev/api/".concat(commandName, "?"); });
}
/**
 * Assertion helper to validate that a command has been called a specific number of times.
 */
function expectAPICommandToHaveBeenCalled(commandName, expectedCalls) {
    expect(getFetchMockCalls(commandName)).toHaveLength(expectedCalls);
}
/**
 * Assertion helper to validate that a command has been called with specific parameters.
 */
function expectAPICommandToHaveBeenCalledWith(commandName, callIndex, expectedParams) {
    var _a;
    var call = getFetchMockCalls(commandName).at(callIndex);
    expect(call).toBeTruthy();
    var body = (_a = call === null || call === void 0 ? void 0 : call.at(1)) === null || _a === void 0 ? void 0 : _a.body;
    var params = body instanceof FormData ? Object.fromEntries(body) : {};
    expect(params).toEqual(expect.objectContaining(expectedParams));
}
function setPersonalDetails(login, accountID) {
    var _a;
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.PERSONAL_DETAILS_LIST, (_a = {},
        _a[accountID] = buildPersonalDetails(login, accountID),
        _a));
    return (0, waitForBatchedUpdates_1.default)();
}
function buildTestReportComment(created, actorAccountID, actionID) {
    if (actionID === void 0) { actionID = null; }
    var reportActionID = actionID !== null && actionID !== void 0 ? actionID : NumberUtils.rand64().toString();
    return {
        actionName: CONST_1.default.REPORT.ACTIONS.TYPE.ADD_COMMENT,
        person: [{ type: 'TEXT', style: 'strong', text: 'User B' }],
        created: created,
        message: [{ type: 'COMMENT', html: "Comment ".concat(actionID), text: "Comment ".concat(actionID) }],
        reportActionID: reportActionID,
        actorAccountID: actorAccountID,
    };
}
function assertFormDataMatchesObject(obj, formData) {
    expect(formData).not.toBeUndefined();
    if (formData) {
        expect(Array.from(formData.entries()).reduce(function (acc, _a) {
            var key = _a[0], val = _a[1];
            acc[key] = val;
            return acc;
        }, {})).toEqual(expect.objectContaining(obj));
    }
}
function getNavigateToChatHintRegex() {
    var hintTextPrefix = (0, Localize_1.translateLocal)('accessibilityHints.navigatesToChat');
    return new RegExp(hintTextPrefix, 'i');
}
function navigateToSidebarOption(index) {
    return __awaiter(this, void 0, void 0, function () {
        var optionRow;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    optionRow = react_native_1.screen.queryAllByAccessibilityHint(getNavigateToChatHintRegex()).at(index);
                    if (!optionRow) {
                        return [2 /*return*/];
                    }
                    (0, react_native_1.fireEvent)(optionRow, 'press');
                    return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
