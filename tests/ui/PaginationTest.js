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
/* eslint-disable @typescript-eslint/naming-convention */
var NativeNavigation = require("@react-navigation/native");
var react_native_1 = require("@testing-library/react-native");
var date_fns_1 = require("date-fns");
var react_1 = require("react");
var react_native_onyx_1 = require("react-native-onyx");
var Localize_1 = require("@libs/Localize");
var SequentialQueue_1 = require("@libs/Network/SequentialQueue");
var App_1 = require("@userActions/App");
var User_1 = require("@userActions/User");
var App_2 = require("@src/App");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var PusherHelper_1 = require("../utils/PusherHelper");
var TestHelper = require("../utils/TestHelper");
var waitForBatchedUpdates_1 = require("../utils/waitForBatchedUpdates");
var waitForBatchedUpdatesWithAct_1 = require("../utils/waitForBatchedUpdatesWithAct");
// We need a large timeout here as we are lazy loading React Navigation screens and this test is running against the entire mounted App
jest.setTimeout(60000);
jest.mock('@react-navigation/native');
jest.mock('../../src/libs/Notification/LocalNotification');
jest.mock('../../src/components/Icon/Expensicons');
jest.mock('../../src/components/ConfirmedRoute.tsx');
TestHelper.setupApp();
var fetchMock = TestHelper.setupGlobalFetchMock();
var LIST_SIZE = {
    width: 300,
    height: 400,
};
var LIST_CONTENT_SIZE = {
    width: 300,
    height: 600,
};
var TEN_MINUTES_AGO = (0, date_fns_1.subMinutes)(new Date(), 10);
var REPORT_ID = '1';
var COMMENT_LINKING_REPORT_ID = '2';
var USER_A_ACCOUNT_ID = 1;
var USER_A_EMAIL = 'user_a@test.com';
var USER_B_ACCOUNT_ID = 2;
var USER_B_EMAIL = 'user_b@test.com';
function getReportScreen(reportID) {
    if (reportID === void 0) { reportID = REPORT_ID; }
    return react_native_1.screen.getByTestId("report-screen-".concat(reportID));
}
function scrollToOffset(offset) {
    var hintText = (0, Localize_1.translateLocal)('sidebarScreen.listOfChatMessages');
    react_native_1.fireEvent.scroll((0, react_native_1.within)(getReportScreen()).getByLabelText(hintText), {
        nativeEvent: {
            contentOffset: {
                y: offset,
            },
            contentSize: LIST_CONTENT_SIZE,
            layoutMeasurement: LIST_SIZE,
        },
    });
}
function triggerListLayout(reportID) {
    var report = getReportScreen(reportID);
    (0, react_native_1.fireEvent)((0, react_native_1.within)(report).getByTestId('report-actions-view-wrapper'), 'onLayout', {
        nativeEvent: {
            layout: __assign({ x: 0, y: 0 }, LIST_SIZE),
        },
        persist: function () { },
    });
    (0, react_native_1.fireEvent)((0, react_native_1.within)(report).getByTestId('report-actions-list'), 'onContentSizeChange', LIST_CONTENT_SIZE.width, LIST_CONTENT_SIZE.height);
}
function getReportActions(reportID) {
    var report = getReportScreen(reportID);
    return __spreadArray(__spreadArray([], (0, react_native_1.within)(report).queryAllByLabelText((0, Localize_1.translateLocal)('accessibilityHints.chatMessage')), true), (0, react_native_1.within)(report).queryAllByLabelText((0, Localize_1.translateLocal)('accessibilityHints.chatWelcomeMessage')), true);
}
function navigateToSidebarOption(reportID) {
    return __awaiter(this, void 0, void 0, function () {
        var optionRow;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    optionRow = react_native_1.screen.getByTestId(reportID);
                    (0, react_native_1.fireEvent)(optionRow, 'press');
                    return [4 /*yield*/, (0, react_native_1.waitFor)(function () {
                            NativeNavigation.triggerTransitionEnd();
                        })];
                case 1:
                    _a.sent();
                    // ReportScreen relies on the onLayout event to receive updates from onyx.
                    triggerListLayout(reportID);
                    return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
function buildCreatedAction(reportActionID, created) {
    return {
        reportActionID: reportActionID,
        actionName: 'CREATED',
        created: created,
        message: [
            {
                type: 'TEXT',
                text: 'CREATED',
            },
        ],
    };
}
function buildReportComments(count, initialID, reverse) {
    if (reverse === void 0) { reverse = false; }
    var currentID = parseInt(initialID, 10);
    var result = {};
    for (var i = 0; i < count; i++) {
        if (currentID < 1) {
            break;
        }
        var created = (0, date_fns_1.format)((0, date_fns_1.addSeconds)(TEN_MINUTES_AGO, 10 * currentID), CONST_1.default.DATE.FNS_DB_FORMAT_STRING);
        var id = currentID;
        currentID += reverse ? 1 : -1;
        result["".concat(id)] = id === 1 ? buildCreatedAction('1', created) : TestHelper.buildTestReportComment(created, USER_B_ACCOUNT_ID, "".concat(id));
    }
    return result;
}
function mockOpenReport(messageCount, initialID) {
    fetchMock.mockAPICommand('OpenReport', function (_a) {
        var reportID = _a.reportID;
        var comments = buildReportComments(messageCount, initialID);
        return {
            onyxData: reportID === REPORT_ID
                ? [
                    {
                        onyxMethod: 'merge',
                        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(REPORT_ID),
                        value: comments,
                    },
                ]
                : [],
            hasOlderActions: !comments['1'],
            hasNewerActions: !!reportID,
        };
    });
}
function mockGetOlderActions(messageCount) {
    fetchMock.mockAPICommand('GetOlderActions', function (_a) {
        var reportID = _a.reportID, reportActionID = _a.reportActionID;
        // The API also returns the action that was requested with the reportActionID.
        var comments = buildReportComments(messageCount + 1, reportActionID);
        return {
            onyxData: reportID === REPORT_ID
                ? [
                    {
                        onyxMethod: 'merge',
                        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(REPORT_ID),
                        value: comments,
                    },
                ]
                : [],
            hasOlderActions: comments['1'] != null,
        };
    });
}
function mockGetNewerActions(messageCount) {
    fetchMock.mockAPICommand('GetNewerActions', function (_a) {
        var reportID = _a.reportID, reportActionID = _a.reportActionID;
        return ({
            onyxData: reportID === REPORT_ID
                ? [
                    {
                        onyxMethod: 'merge',
                        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(REPORT_ID),
                        // The API also returns the action that was requested with the reportActionID.
                        value: buildReportComments(messageCount + 1, reportActionID, true),
                    },
                ]
                : [],
            hasNewerActions: messageCount > 0,
        });
    });
}
/**
 * Sets up a test with a logged in user. Returns the <App/> test instance.
 */
function signInAndGetApp() {
    return __awaiter(this, void 0, void 0, function () {
        var hintText, loginForm;
        var _this = this;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    // Render the App and sign in as a test user.
                    (0, react_native_1.render)(<App_2.default />);
                    return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                case 1:
                    _a.sent();
                    hintText = (0, Localize_1.translateLocal)('loginForm.loginForm');
                    return [4 /*yield*/, react_native_1.screen.findAllByLabelText(hintText)];
                case 2:
                    loginForm = _a.sent();
                    expect(loginForm).toHaveLength(1);
                    return [4 /*yield*/, (0, react_native_1.act)(function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, TestHelper.signInWithTestUser(USER_A_ACCOUNT_ID, USER_A_EMAIL, undefined, undefined, 'A')];
                                    case 1:
                                        _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                case 4:
                    _a.sent();
                    (0, User_1.subscribeToUserEvents)();
                    return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, (0, react_native_1.act)(function () { return __awaiter(_this, void 0, void 0, function () {
                            var _a, _b, _c;
                            return __generator(this, function (_d) {
                                switch (_d.label) {
                                    case 0: 
                                    // Simulate setting an unread report and personal details
                                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(REPORT_ID), {
                                            reportID: REPORT_ID,
                                            reportName: CONST_1.default.REPORT.DEFAULT_REPORT_NAME,
                                            lastMessageText: 'Test',
                                            participants: (_a = {},
                                                _a[USER_B_ACCOUNT_ID] = { notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.ALWAYS },
                                                _a[USER_A_ACCOUNT_ID] = { notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.ALWAYS },
                                                _a),
                                            lastActorAccountID: USER_B_ACCOUNT_ID,
                                            type: CONST_1.default.REPORT.TYPE.CHAT,
                                        })];
                                    case 1:
                                        // Simulate setting an unread report and personal details
                                        _d.sent();
                                        return [4 /*yield*/, react_native_onyx_1.default.merge(ONYXKEYS_1.default.PERSONAL_DETAILS_LIST, (_b = {},
                                                _b[USER_B_ACCOUNT_ID] = TestHelper.buildPersonalDetails(USER_B_EMAIL, USER_B_ACCOUNT_ID, 'B'),
                                                _b))];
                                    case 2:
                                        _d.sent();
                                        // Setup a 2nd report to test comment linking.
                                        return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(COMMENT_LINKING_REPORT_ID), {
                                                reportID: COMMENT_LINKING_REPORT_ID,
                                                reportName: CONST_1.default.REPORT.DEFAULT_REPORT_NAME,
                                                lastMessageText: 'Test',
                                                participants: (_c = {}, _c[USER_A_ACCOUNT_ID] = { notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.ALWAYS }, _c),
                                                lastActorAccountID: USER_A_ACCOUNT_ID,
                                                type: CONST_1.default.REPORT.TYPE.CHAT,
                                            })];
                                    case 3:
                                        // Setup a 2nd report to test comment linking.
                                        _d.sent();
                                        return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(COMMENT_LINKING_REPORT_ID), {
                                                '100': buildCreatedAction('100', (0, date_fns_1.format)(TEN_MINUTES_AGO, CONST_1.default.DATE.FNS_DB_FORMAT_STRING)),
                                                '101': {
                                                    actionName: CONST_1.default.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                                                    person: [{ type: 'TEXT', style: 'strong', text: 'User B' }],
                                                    created: (0, date_fns_1.format)((0, date_fns_1.addSeconds)(TEN_MINUTES_AGO, 10), CONST_1.default.DATE.FNS_DB_FORMAT_STRING),
                                                    message: [
                                                        {
                                                            type: 'COMMENT',
                                                            html: '<a href="https://dev.new.expensify.com:8082/r/1/5">Link 1</a>',
                                                            text: 'Link 1',
                                                        },
                                                    ],
                                                    reportActionID: '101',
                                                    actorAccountID: USER_A_ACCOUNT_ID,
                                                },
                                            })];
                                    case 4:
                                        _d.sent();
                                        // We manually setting the sidebar as loaded since the onLayout event does not fire in tests
                                        (0, App_1.setSidebarLoaded)();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                case 6:
                    _a.sent();
                    return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                case 7:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
}
describe('Pagination', function () {
    afterEach(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, SequentialQueue_1.waitForIdle)()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, (0, react_native_1.act)(function () { return __awaiter(void 0, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, react_native_onyx_1.default.clear()];
                                    case 1:
                                        _a.sent();
                                        // Unsubscribe to pusher channels
                                        PusherHelper_1.default.teardown();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                case 3:
                    _a.sent();
                    jest.clearAllMocks();
                    return [2 /*return*/];
            }
        });
    }); });
    it('opens a chat and load initial messages', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mockOpenReport(5, '5');
                    return [4 /*yield*/, signInAndGetApp()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, navigateToSidebarOption(REPORT_ID)];
                case 2:
                    _a.sent();
                    expect(getReportActions()).toHaveLength(5);
                    TestHelper.expectAPICommandToHaveBeenCalled('OpenReport', 1);
                    TestHelper.expectAPICommandToHaveBeenCalledWith('OpenReport', 0, { reportID: REPORT_ID });
                    TestHelper.expectAPICommandToHaveBeenCalled('GetOlderActions', 0);
                    TestHelper.expectAPICommandToHaveBeenCalled('GetNewerActions', 0);
                    // Scrolling here should not trigger a new network request.
                    scrollToOffset(LIST_CONTENT_SIZE.height);
                    return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                case 3:
                    _a.sent();
                    scrollToOffset(0);
                    return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                case 4:
                    _a.sent();
                    TestHelper.expectAPICommandToHaveBeenCalled('OpenReport', 1);
                    TestHelper.expectAPICommandToHaveBeenCalled('GetOlderActions', 0);
                    TestHelper.expectAPICommandToHaveBeenCalled('GetNewerActions', 0);
                    return [2 /*return*/];
            }
        });
    }); });
    it('opens a chat and load older messages', function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mockOpenReport(CONST_1.default.REPORT.MIN_INITIAL_REPORT_ACTION_COUNT, '18');
                    mockGetOlderActions(5);
                    return [4 /*yield*/, signInAndGetApp()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, navigateToSidebarOption(REPORT_ID)];
                case 2:
                    _a.sent();
                    expect(getReportActions()).toHaveLength(CONST_1.default.REPORT.MIN_INITIAL_REPORT_ACTION_COUNT);
                    TestHelper.expectAPICommandToHaveBeenCalled('OpenReport', 1);
                    TestHelper.expectAPICommandToHaveBeenCalledWith('OpenReport', 0, { reportID: REPORT_ID });
                    TestHelper.expectAPICommandToHaveBeenCalled('GetOlderActions', 0);
                    TestHelper.expectAPICommandToHaveBeenCalled('GetNewerActions', 0);
                    // Scrolling here should trigger a new network request.
                    scrollToOffset(LIST_CONTENT_SIZE.height);
                    return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                case 3:
                    _a.sent();
                    TestHelper.expectAPICommandToHaveBeenCalled('OpenReport', 1);
                    TestHelper.expectAPICommandToHaveBeenCalled('GetOlderActions', 1);
                    TestHelper.expectAPICommandToHaveBeenCalledWith('GetOlderActions', 0, { reportID: REPORT_ID, reportActionID: '4' });
                    TestHelper.expectAPICommandToHaveBeenCalled('GetNewerActions', 0);
                    return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                case 4:
                    _a.sent();
                    // We now have 18 messages. 15 (MIN_INITIAL_REPORT_ACTION_COUNT) from the initial OpenReport and 3 from GetOlderActions.
                    // GetOlderActions only returns 3 actions since it reaches id '1', which is the created action.
                    expect(getReportActions()).toHaveLength(18);
                    return [2 /*return*/];
            }
        });
    }); });
    it('opens a chat and load newer messages', function () { return __awaiter(void 0, void 0, void 0, function () {
        var link;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    mockOpenReport(5, '5');
                    mockGetNewerActions(5);
                    return [4 /*yield*/, signInAndGetApp()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, navigateToSidebarOption(COMMENT_LINKING_REPORT_ID)];
                case 2:
                    _a.sent();
                    link = react_native_1.screen.getByText('Link 1');
                    (0, react_native_1.fireEvent)(link, 'press');
                    return [4 /*yield*/, (0, react_native_1.waitFor)(function () {
                            NativeNavigation.triggerTransitionEnd();
                        })];
                case 3:
                    _a.sent();
                    // Due to https://github.com/facebook/react-native/commit/3485e9ed871886b3e7408f90d623da5c018da493
                    // we need to scroll too to trigger `onStartReached` which triggers other updates
                    scrollToOffset(0);
                    // ReportScreen relies on the onLayout event to receive updates from onyx.
                    triggerListLayout();
                    return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                case 4:
                    _a.sent();
                    // Here we have 5 messages from the initial OpenReport and 5 from the initial GetNewerActions.
                    expect(getReportActions()).toHaveLength(10);
                    // There is 1 extra call here because of the comment linking report.
                    TestHelper.expectAPICommandToHaveBeenCalled('OpenReport', 3);
                    TestHelper.expectAPICommandToHaveBeenCalledWith('OpenReport', 1, { reportID: REPORT_ID, reportActionID: '5' });
                    TestHelper.expectAPICommandToHaveBeenCalled('GetOlderActions', 0);
                    TestHelper.expectAPICommandToHaveBeenCalledWith('GetNewerActions', 0, { reportID: REPORT_ID, reportActionID: '5' });
                    // Simulate the maintainVisibleContentPosition scroll adjustment, so it is now possible to scroll down more.
                    scrollToOffset(500);
                    return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                case 5:
                    _a.sent();
                    scrollToOffset(0);
                    return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                case 6:
                    _a.sent();
                    TestHelper.expectAPICommandToHaveBeenCalled('OpenReport', 3);
                    TestHelper.expectAPICommandToHaveBeenCalled('GetOlderActions', 0);
                    TestHelper.expectAPICommandToHaveBeenCalled('GetNewerActions', 1);
                    // We now have 10 messages. 5 from the initial OpenReport and 5 from the GetNewerActions call.
                    expect(getReportActions()).toHaveLength(10);
                    // Simulate the backend returning no new messages to simulate reaching the start of the chat.
                    mockGetNewerActions(0);
                    scrollToOffset(500);
                    return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                case 7:
                    _a.sent();
                    scrollToOffset(0);
                    return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                case 8:
                    _a.sent();
                    TestHelper.expectAPICommandToHaveBeenCalled('OpenReport', 3);
                    TestHelper.expectAPICommandToHaveBeenCalled('GetOlderActions', 0);
                    TestHelper.expectAPICommandToHaveBeenCalled('GetNewerActions', 1);
                    // We still have 15 messages. 5 from the initial OpenReport and 5 from the GetNewerActions call.
                    expect(getReportActions()).toHaveLength(10);
                    return [2 /*return*/];
            }
        });
    }); });
});
