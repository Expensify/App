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
/* eslint-disable @typescript-eslint/naming-convention */
var NativeNavigation = require("@react-navigation/native");
var react_native_1 = require("@testing-library/react-native");
var date_fns_1 = require("date-fns");
var date_fns_tz_1 = require("date-fns-tz");
var react_1 = require("react");
var react_native_2 = require("react-native");
var react_native_onyx_1 = require("react-native-onyx");
var App_1 = require("@libs/actions/App");
var IOU_1 = require("@libs/actions/IOU");
var Report_1 = require("@libs/actions/Report");
var User_1 = require("@libs/actions/User");
var CollectionUtils_1 = require("@libs/CollectionUtils");
var DateUtils_1 = require("@libs/DateUtils");
var Localize_1 = require("@libs/Localize");
var LocalNotification_1 = require("@libs/Notification/LocalNotification");
var NumberUtils_1 = require("@libs/NumberUtils");
var ReportActionsUtils_1 = require("@libs/ReportActionsUtils");
var FontUtils_1 = require("@styles/utils/FontUtils");
var App_2 = require("@src/App");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var reports_1 = require("../utils/collections/reports");
var transaction_1 = require("../utils/collections/transaction");
var PusherHelper_1 = require("../utils/PusherHelper");
var TestHelper = require("../utils/TestHelper");
var TestHelper_1 = require("../utils/TestHelper");
var waitForBatchedUpdates_1 = require("../utils/waitForBatchedUpdates");
var waitForBatchedUpdatesWithAct_1 = require("../utils/waitForBatchedUpdatesWithAct");
// We need a large timeout here as we are lazy loading React Navigation screens and this test is running against the entire mounted App
jest.setTimeout(60000);
jest.mock('@react-navigation/native');
jest.mock('../../src/libs/Notification/LocalNotification');
jest.mock('../../src/components/Icon/Expensicons');
jest.mock('../../src/components/ConfirmedRoute.tsx');
TestHelper.setupApp();
TestHelper.setupGlobalFetchMock();
beforeEach(function () {
    react_native_onyx_1.default.set(ONYXKEYS_1.default.NVP_ONBOARDING, { hasCompletedGuidedSetupFlow: true });
});
function scrollUpToRevealNewMessagesBadge() {
    var hintText = (0, Localize_1.translateLocal)('sidebarScreen.listOfChatMessages');
    react_native_1.fireEvent.scroll(react_native_1.screen.getByLabelText(hintText), {
        nativeEvent: {
            contentOffset: {
                y: 250,
            },
            contentSize: {
                // Dimensions of the scrollable content
                height: 500,
                width: 100,
            },
            layoutMeasurement: {
                // Dimensions of the device
                height: 700,
                width: 300,
            },
        },
    });
}
function isNewMessagesBadgeVisible() {
    var _a;
    var hintText = (0, Localize_1.translateLocal)('accessibilityHints.scrollToNewestMessages');
    var badge = react_native_1.screen.queryByAccessibilityHint(hintText);
    var badgeProps = badge === null || badge === void 0 ? void 0 : badge.props;
    var transformStyle = (_a = badgeProps.style.transform) === null || _a === void 0 ? void 0 : _a[0];
    return Math.round(transformStyle.translateY) === -40;
}
function navigateToSidebar() {
    var hintText = (0, Localize_1.translateLocal)('accessibilityHints.navigateToChatsList');
    var reportHeaderBackButton = react_native_1.screen.queryByAccessibilityHint(hintText);
    if (reportHeaderBackButton) {
        (0, react_native_1.fireEvent)(reportHeaderBackButton, 'press');
    }
    return (0, waitForBatchedUpdates_1.default)();
}
function areYouOnChatListScreen() {
    var _a, _b;
    var hintText = (0, Localize_1.translateLocal)('sidebarScreen.listOfChats');
    var sidebarLinks = react_native_1.screen.queryAllByLabelText(hintText, { includeHiddenElements: true });
    return !((_b = (_a = sidebarLinks === null || sidebarLinks === void 0 ? void 0 : sidebarLinks.at(0)) === null || _a === void 0 ? void 0 : _a.props) === null || _b === void 0 ? void 0 : _b.accessibilityElementsHidden);
}
var REPORT_ID = '1';
var USER_A_ACCOUNT_ID = 1;
var USER_A_EMAIL = 'user_a@test.com';
var USER_B_ACCOUNT_ID = 2;
var USER_B_EMAIL = 'user_b@test.com';
var USER_C_ACCOUNT_ID = 3;
var USER_C_EMAIL = 'user_c@test.com';
var reportAction3CreatedDate;
var reportAction9CreatedDate;
var TEN_MINUTES_AGO = (0, date_fns_1.subMinutes)(new Date(), 10);
var createdReportActionID = (0, NumberUtils_1.rand64)().toString();
var createdReportAction = {
    actionName: CONST_1.default.REPORT.ACTIONS.TYPE.CREATED,
    automatic: false,
    created: (0, date_fns_1.format)(TEN_MINUTES_AGO, CONST_1.default.DATE.FNS_DB_FORMAT_STRING),
    reportActionID: createdReportActionID,
    message: [
        {
            style: 'strong',
            text: '__FAKE__',
            type: 'TEXT',
        },
        {
            style: 'normal',
            text: 'created this report',
            type: 'TEXT',
        },
    ],
};
/**
 * Sets up a test with a logged in user that has one unread chat from another user. Returns the <App/> test instance.
 */
function signInAndGetAppWithUnreadChat() {
    var _this = this;
    // Render the App and sign in as a test user.
    (0, react_native_1.render)(<App_2.default />);
    return (0, waitForBatchedUpdatesWithAct_1.default)()
        .then(function () { return __awaiter(_this, void 0, void 0, function () {
        var hintText, loginForm;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                case 1:
                    _a.sent();
                    hintText = (0, Localize_1.translateLocal)('loginForm.loginForm');
                    loginForm = react_native_1.screen.queryAllByLabelText(hintText);
                    expect(loginForm).toHaveLength(1);
                    return [2 /*return*/];
            }
        });
    }); })
        .then(function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
        return [2 /*return*/, TestHelper.signInWithTestUser(USER_A_ACCOUNT_ID, USER_A_EMAIL, undefined, undefined, 'A')];
    }); }); })
        .then(function () {
        (0, User_1.subscribeToUserEvents)();
        return (0, waitForBatchedUpdates_1.default)();
    })
        .then(function () { return __awaiter(_this, void 0, void 0, function () {
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    reportAction3CreatedDate = (0, date_fns_1.format)((0, date_fns_1.addSeconds)(TEN_MINUTES_AGO, 30), CONST_1.default.DATE.FNS_DB_FORMAT_STRING);
                    reportAction9CreatedDate = (0, date_fns_1.format)((0, date_fns_1.addSeconds)(TEN_MINUTES_AGO, 90), CONST_1.default.DATE.FNS_DB_FORMAT_STRING);
                    return [4 /*yield*/, react_native_onyx_1.default.merge(ONYXKEYS_1.default.PERSONAL_DETAILS_LIST, (_a = {},
                            _a[USER_B_ACCOUNT_ID] = TestHelper.buildPersonalDetails(USER_B_EMAIL, USER_B_ACCOUNT_ID, 'B'),
                            _a))];
                case 1:
                    _d.sent();
                    // Simulate setting an unread report and personal details
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(REPORT_ID), {
                            reportID: REPORT_ID,
                            reportName: CONST_1.default.REPORT.DEFAULT_REPORT_NAME,
                            lastReadTime: reportAction3CreatedDate,
                            lastVisibleActionCreated: reportAction9CreatedDate,
                            lastMessageText: 'Test',
                            participants: (_b = {},
                                _b[USER_B_ACCOUNT_ID] = { notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.ALWAYS },
                                _b[USER_A_ACCOUNT_ID] = { notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.ALWAYS },
                                _b),
                            lastActorAccountID: USER_B_ACCOUNT_ID,
                            type: CONST_1.default.REPORT.TYPE.CHAT,
                        })];
                case 2:
                    // Simulate setting an unread report and personal details
                    _d.sent();
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(REPORT_ID), (_c = {},
                            _c[createdReportActionID] = createdReportAction,
                            _c[1] = TestHelper.buildTestReportComment((0, date_fns_1.format)((0, date_fns_1.addSeconds)(TEN_MINUTES_AGO, 10), CONST_1.default.DATE.FNS_DB_FORMAT_STRING), USER_B_ACCOUNT_ID, '1'),
                            _c[2] = TestHelper.buildTestReportComment((0, date_fns_1.format)((0, date_fns_1.addSeconds)(TEN_MINUTES_AGO, 20), CONST_1.default.DATE.FNS_DB_FORMAT_STRING), USER_B_ACCOUNT_ID, '2'),
                            _c[3] = TestHelper.buildTestReportComment(reportAction3CreatedDate, USER_B_ACCOUNT_ID, '3'),
                            _c[4] = TestHelper.buildTestReportComment((0, date_fns_1.format)((0, date_fns_1.addSeconds)(TEN_MINUTES_AGO, 40), CONST_1.default.DATE.FNS_DB_FORMAT_STRING), USER_B_ACCOUNT_ID, '4'),
                            _c[5] = TestHelper.buildTestReportComment((0, date_fns_1.format)((0, date_fns_1.addSeconds)(TEN_MINUTES_AGO, 50), CONST_1.default.DATE.FNS_DB_FORMAT_STRING), USER_B_ACCOUNT_ID, '5'),
                            _c[6] = TestHelper.buildTestReportComment((0, date_fns_1.format)((0, date_fns_1.addSeconds)(TEN_MINUTES_AGO, 60), CONST_1.default.DATE.FNS_DB_FORMAT_STRING), USER_B_ACCOUNT_ID, '6'),
                            _c[7] = TestHelper.buildTestReportComment((0, date_fns_1.format)((0, date_fns_1.addSeconds)(TEN_MINUTES_AGO, 70), CONST_1.default.DATE.FNS_DB_FORMAT_STRING), USER_B_ACCOUNT_ID, '7'),
                            _c[8] = TestHelper.buildTestReportComment((0, date_fns_1.format)((0, date_fns_1.addSeconds)(TEN_MINUTES_AGO, 80), CONST_1.default.DATE.FNS_DB_FORMAT_STRING), USER_B_ACCOUNT_ID, '8'),
                            _c[9] = TestHelper.buildTestReportComment(reportAction9CreatedDate, USER_B_ACCOUNT_ID, '9'),
                            _c))];
                case 3:
                    _d.sent();
                    // We manually setting the sidebar as loaded since the onLayout event does not fire in tests
                    (0, App_1.setSidebarLoaded)();
                    return [2 /*return*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
            }
        });
    }); });
}
describe('Unread Indicators', function () {
    beforeAll(function () {
        PusherHelper_1.default.setup();
    });
    beforeEach(function () {
        jest.clearAllMocks();
        react_native_onyx_1.default.clear();
        // Unsubscribe to pusher channels
        PusherHelper_1.default.teardown();
    });
    it('Display bold in the LHN for unread chat and new line indicator above the chat message when we navigate to it', function () {
        return signInAndGetAppWithUnreadChat()
            .then(function () {
            var _a, _b;
            // Verify no notifications are created for these older messages
            expect(LocalNotification_1.default.showCommentNotification.mock.calls).toHaveLength(0);
            // Verify the sidebar links are rendered
            var sidebarLinksHintText = (0, Localize_1.translateLocal)('sidebarScreen.listOfChats');
            var sidebarLinks = react_native_1.screen.queryAllByLabelText(sidebarLinksHintText);
            expect(sidebarLinks).toHaveLength(1);
            // Verify there is only one option in the sidebar
            var optionRows = react_native_1.screen.queryAllByAccessibilityHint(TestHelper.getNavigateToChatHintRegex());
            expect(optionRows).toHaveLength(1);
            // And that the text is bold
            var displayNameHintText = (0, Localize_1.translateLocal)('accessibilityHints.chatUserDisplayNames');
            var displayNameText = react_native_1.screen.queryByLabelText(displayNameHintText);
            expect((_b = (_a = displayNameText === null || displayNameText === void 0 ? void 0 : displayNameText.props) === null || _a === void 0 ? void 0 : _a.style) === null || _b === void 0 ? void 0 : _b.fontWeight).toBe(FontUtils_1.default.fontWeight.bold);
            return (0, TestHelper_1.navigateToSidebarOption)(0);
        })
            .then(function () { return __awaiter(void 0, void 0, void 0, function () {
            var welcomeMessageHintText, createdAction, reportCommentsHintText, reportComments, newMessageLineIndicatorHintText, unreadIndicator, reportActionID;
            var _a, _b;
            return __generator(this, function (_c) {
                (0, react_native_1.act)(function () { return NativeNavigation.triggerTransitionEnd(); });
                welcomeMessageHintText = (0, Localize_1.translateLocal)('accessibilityHints.chatWelcomeMessage');
                createdAction = react_native_1.screen.queryByLabelText(welcomeMessageHintText);
                expect(createdAction).toBeTruthy();
                reportCommentsHintText = (0, Localize_1.translateLocal)('accessibilityHints.chatMessage');
                reportComments = react_native_1.screen.queryAllByLabelText(reportCommentsHintText);
                expect(reportComments).toHaveLength(9);
                newMessageLineIndicatorHintText = (0, Localize_1.translateLocal)('accessibilityHints.newMessageLineIndicator');
                unreadIndicator = react_native_1.screen.queryAllByLabelText(newMessageLineIndicatorHintText);
                expect(unreadIndicator).toHaveLength(1);
                reportActionID = (_b = (_a = unreadIndicator.at(0)) === null || _a === void 0 ? void 0 : _a.props) === null || _b === void 0 ? void 0 : _b['data-action-id'];
                expect(reportActionID).toBe('4');
                // Scroll up and verify that the "New messages" badge appears
                scrollUpToRevealNewMessagesBadge();
                return [2 /*return*/, (0, react_native_1.waitFor)(function () { return expect(isNewMessagesBadgeVisible()).toBe(true); })];
            });
        }); });
    });
    it('Clear the new line indicator and bold when we navigate away from a chat that is now read', function () {
        return signInAndGetAppWithUnreadChat()
            // Navigate to the unread chat from the sidebar
            .then(function () { return (0, TestHelper_1.navigateToSidebarOption)(0); })
            .then(function () {
            (0, react_native_1.act)(function () { return NativeNavigation.triggerTransitionEnd(); });
            // Verify the unread indicator is present
            var newMessageLineIndicatorHintText = (0, Localize_1.translateLocal)('accessibilityHints.newMessageLineIndicator');
            var unreadIndicator = react_native_1.screen.queryAllByLabelText(newMessageLineIndicatorHintText);
            expect(unreadIndicator).toHaveLength(1);
        })
            .then(function () {
            expect(areYouOnChatListScreen()).toBe(false);
            // Then navigate back to the sidebar
            return navigateToSidebar();
        })
            .then(function () {
            // Verify the LHN is now open
            expect(areYouOnChatListScreen()).toBe(true);
            // Tap on the chat again
            return (0, TestHelper_1.navigateToSidebarOption)(0);
        })
            .then(function () {
            // Sending event to clear the unread indicator cache, given that the test doesn't behave as the app
            react_native_2.DeviceEventEmitter.emit("unreadAction_".concat(REPORT_ID), (0, date_fns_1.format)(new Date(), CONST_1.default.DATE.FNS_DB_FORMAT_STRING));
            return (0, waitForBatchedUpdatesWithAct_1.default)();
        })
            .then(function () {
            // Verify the unread indicator is not present
            var newMessageLineIndicatorHintText = (0, Localize_1.translateLocal)('accessibilityHints.newMessageLineIndicator');
            var unreadIndicator = react_native_1.screen.queryAllByLabelText(newMessageLineIndicatorHintText);
            expect(unreadIndicator).toHaveLength(0);
            // Tap on the chat again
            return (0, TestHelper_1.navigateToSidebarOption)(0);
        })
            .then(function () {
            // Verify the unread indicator is not present
            var newMessageLineIndicatorHintText = (0, Localize_1.translateLocal)('accessibilityHints.newMessageLineIndicator');
            var unreadIndicator = react_native_1.screen.queryAllByLabelText(newMessageLineIndicatorHintText);
            expect(unreadIndicator).toHaveLength(0);
            expect(areYouOnChatListScreen()).toBe(false);
        });
    });
    it('Shows a browser notification and bold text when a new message arrives for a chat that is read', function () {
        return signInAndGetAppWithUnreadChat()
            .then(function () {
            var _a, _b, _c;
            // Simulate a new report arriving via Pusher along with reportActions and personalDetails for the other participant
            // We set the created date 5 seconds in the past to ensure that time has passed when we open the report
            var NEW_REPORT_ID = '2';
            var NEW_REPORT_CREATED_DATE = (0, date_fns_1.subSeconds)(new Date(), 5);
            var NEW_REPORT_FIST_MESSAGE_CREATED_DATE = (0, date_fns_1.addSeconds)(NEW_REPORT_CREATED_DATE, 1);
            var createdReportActionIDLocal = (0, NumberUtils_1.rand64)();
            var commentReportActionID = (0, NumberUtils_1.rand64)();
            PusherHelper_1.default.emitOnyxUpdate([
                {
                    onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                    key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(NEW_REPORT_ID),
                    value: {
                        reportID: NEW_REPORT_ID,
                        reportName: CONST_1.default.REPORT.DEFAULT_REPORT_NAME,
                        lastReadTime: '',
                        lastVisibleActionCreated: DateUtils_1.default.getDBTime((0, date_fns_tz_1.toZonedTime)(NEW_REPORT_FIST_MESSAGE_CREATED_DATE, 'UTC').valueOf()),
                        lastMessageText: 'Comment 1',
                        lastActorAccountID: USER_C_ACCOUNT_ID,
                        participants: (_a = {},
                            _a[USER_C_ACCOUNT_ID] = { notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.ALWAYS },
                            _a[USER_A_ACCOUNT_ID] = { notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.ALWAYS },
                            _a),
                        type: CONST_1.default.REPORT.TYPE.CHAT,
                    },
                },
                {
                    onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                    key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(NEW_REPORT_ID),
                    value: (_b = {},
                        _b[createdReportActionIDLocal] = {
                            actionName: CONST_1.default.REPORT.ACTIONS.TYPE.CREATED,
                            automatic: false,
                            created: (0, date_fns_1.format)(NEW_REPORT_CREATED_DATE, CONST_1.default.DATE.FNS_DB_FORMAT_STRING),
                            reportActionID: createdReportActionIDLocal,
                        },
                        _b[commentReportActionID] = {
                            actionName: CONST_1.default.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                            actorAccountID: USER_C_ACCOUNT_ID,
                            person: [{ type: 'TEXT', style: 'strong', text: 'User C' }],
                            created: (0, date_fns_1.format)(NEW_REPORT_FIST_MESSAGE_CREATED_DATE, CONST_1.default.DATE.FNS_DB_FORMAT_STRING),
                            message: [{ type: 'COMMENT', html: 'Comment 1', text: 'Comment 1' }],
                            reportActionID: commentReportActionID,
                        },
                        _b),
                    shouldNotify: true,
                },
                {
                    onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                    key: ONYXKEYS_1.default.PERSONAL_DETAILS_LIST,
                    value: (_c = {},
                        _c[USER_C_ACCOUNT_ID] = TestHelper.buildPersonalDetails(USER_C_EMAIL, USER_C_ACCOUNT_ID, 'C'),
                        _c),
                },
            ]);
            return (0, waitForBatchedUpdates_1.default)();
        })
            .then(function () {
            // Verify notification was created
            expect(LocalNotification_1.default.showCommentNotification).toBeCalled();
        })
            .then(function () {
            var _a, _b, _c, _d;
            // // Verify the new report option appears in the LHN
            var optionRows = react_native_1.screen.queryAllByAccessibilityHint(TestHelper.getNavigateToChatHintRegex());
            expect(optionRows).toHaveLength(2);
            // Verify the text for both chats are bold indicating that nothing has not yet been read
            var displayNameHintTexts = (0, Localize_1.translateLocal)('accessibilityHints.chatUserDisplayNames');
            var displayNameTexts = react_native_1.screen.queryAllByLabelText(displayNameHintTexts);
            expect(displayNameTexts).toHaveLength(2);
            var firstReportOption = displayNameTexts.at(0);
            expect((_b = (_a = firstReportOption === null || firstReportOption === void 0 ? void 0 : firstReportOption.props) === null || _a === void 0 ? void 0 : _a.style) === null || _b === void 0 ? void 0 : _b.fontWeight).toBe(FontUtils_1.default.fontWeight.bold);
            expect(react_native_1.screen.getByText('C User')).toBeOnTheScreen();
            var secondReportOption = displayNameTexts.at(1);
            expect((_d = (_c = secondReportOption === null || secondReportOption === void 0 ? void 0 : secondReportOption.props) === null || _c === void 0 ? void 0 : _c.style) === null || _d === void 0 ? void 0 : _d.fontWeight).toBe(FontUtils_1.default.fontWeight.bold);
            expect(react_native_1.screen.getByText('B User')).toBeOnTheScreen();
            // Tap the new report option and navigate back to the sidebar again via the back button
            return (0, TestHelper_1.navigateToSidebarOption)(0);
        })
            .then(waitForBatchedUpdates_1.default)
            .then(function () {
            var _a, _b, _c, _d, _e, _f;
            (0, react_native_1.act)(function () { return NativeNavigation.triggerTransitionEnd(); });
            // Verify that report we navigated to appears in a "read" state while the original unread report still shows as unread
            var hintText = (0, Localize_1.translateLocal)('accessibilityHints.chatUserDisplayNames');
            var displayNameTexts = react_native_1.screen.queryAllByLabelText(hintText, { includeHiddenElements: true });
            expect(displayNameTexts).toHaveLength(2);
            expect((_c = (_b = (_a = displayNameTexts.at(0)) === null || _a === void 0 ? void 0 : _a.props) === null || _b === void 0 ? void 0 : _b.style) === null || _c === void 0 ? void 0 : _c.fontWeight).toBe(FontUtils_1.default.fontWeight.normal);
            expect(react_native_1.screen.getAllByText('C User').at(0)).toBeOnTheScreen();
            expect((_f = (_e = (_d = displayNameTexts.at(1)) === null || _d === void 0 ? void 0 : _d.props) === null || _e === void 0 ? void 0 : _e.style) === null || _f === void 0 ? void 0 : _f.fontWeight).toBe(FontUtils_1.default.fontWeight.bold);
            expect(react_native_1.screen.getByText('B User', { includeHiddenElements: true })).toBeOnTheScreen();
        });
    });
    xit('Manually marking a chat message as unread shows the new line indicator and updates the LHN', function () {
        return signInAndGetAppWithUnreadChat()
            // Navigate to the unread report
            .then(function () { return (0, TestHelper_1.navigateToSidebarOption)(0); })
            .then(function () {
            // It's difficult to trigger marking a report comment as unread since we would have to mock the long press event and then
            // another press on the context menu item so we will do it via the action directly and then test if the UI has updated properly
            (0, Report_1.markCommentAsUnread)(REPORT_ID, createdReportAction);
            return (0, waitForBatchedUpdates_1.default)();
        })
            .then(function () {
            var _a, _b;
            // Verify the indicator appears above the last action
            var newMessageLineIndicatorHintText = (0, Localize_1.translateLocal)('accessibilityHints.newMessageLineIndicator');
            var unreadIndicator = react_native_1.screen.queryAllByLabelText(newMessageLineIndicatorHintText);
            expect(unreadIndicator).toHaveLength(1);
            var reportActionID = (_b = (_a = unreadIndicator.at(0)) === null || _a === void 0 ? void 0 : _a.props) === null || _b === void 0 ? void 0 : _b['data-action-id'];
            expect(reportActionID).toBe('3');
            // Scroll up and verify the new messages badge appears
            scrollUpToRevealNewMessagesBadge();
            return (0, react_native_1.waitFor)(function () { return expect(isNewMessagesBadgeVisible()).toBe(true); });
        })
            // Navigate to the sidebar
            .then(navigateToSidebar)
            .then(function () {
            var _a, _b, _c;
            // Verify the report is marked as unread in the sidebar
            var hintText = (0, Localize_1.translateLocal)('accessibilityHints.chatUserDisplayNames');
            var displayNameTexts = react_native_1.screen.queryAllByLabelText(hintText);
            expect(displayNameTexts).toHaveLength(1);
            expect((_c = (_b = (_a = displayNameTexts.at(0)) === null || _a === void 0 ? void 0 : _a.props) === null || _b === void 0 ? void 0 : _b.style) === null || _c === void 0 ? void 0 : _c.fontWeight).toBe(FontUtils_1.default.fontWeight.bold);
            expect(react_native_1.screen.getByText('B User')).toBeOnTheScreen();
            // Navigate to the report again and back to the sidebar
            return (0, TestHelper_1.navigateToSidebarOption)(0);
        })
            .then(function () { return navigateToSidebar(); })
            .then(function () {
            var _a, _b, _c;
            // Verify the report is now marked as read
            var hintText = (0, Localize_1.translateLocal)('accessibilityHints.chatUserDisplayNames');
            var displayNameTexts = react_native_1.screen.queryAllByLabelText(hintText);
            expect(displayNameTexts).toHaveLength(1);
            expect((_c = (_b = (_a = displayNameTexts.at(0)) === null || _a === void 0 ? void 0 : _a.props) === null || _b === void 0 ? void 0 : _b.style) === null || _c === void 0 ? void 0 : _c.fontWeight).toBe(undefined);
            expect(react_native_1.screen.getByText('B User')).toBeOnTheScreen();
            // Navigate to the report again and verify the new line indicator is missing
            return (0, TestHelper_1.navigateToSidebarOption)(0);
        })
            .then(function () {
            var newMessageLineIndicatorHintText = (0, Localize_1.translateLocal)('accessibilityHints.newMessageLineIndicator');
            var unreadIndicator = react_native_1.screen.queryAllByLabelText(newMessageLineIndicatorHintText);
            expect(unreadIndicator).toHaveLength(0);
            // Scroll up and verify the "New messages" badge is hidden
            scrollUpToRevealNewMessagesBadge();
            return (0, react_native_1.waitFor)(function () { return expect(isNewMessagesBadgeVisible()).toBe(false); });
        });
    });
    it('Keep showing the new line indicator when a new message is created by the current user', function () {
        return signInAndGetAppWithUnreadChat()
            .then(function () {
            // Verify we are on the LHN and that the chat shows as unread in the LHN
            expect(areYouOnChatListScreen()).toBe(true);
            // Navigate to the report and verify the indicator is present
            return (0, TestHelper_1.navigateToSidebarOption)(0);
        })
            .then(function () { return __awaiter(void 0, void 0, void 0, function () {
            var newMessageLineIndicatorHintText, unreadIndicator;
            return __generator(this, function (_a) {
                (0, react_native_1.act)(function () { return NativeNavigation.triggerTransitionEnd(); });
                newMessageLineIndicatorHintText = (0, Localize_1.translateLocal)('accessibilityHints.newMessageLineIndicator');
                unreadIndicator = react_native_1.screen.queryAllByLabelText(newMessageLineIndicatorHintText);
                expect(unreadIndicator).toHaveLength(1);
                // Leave a comment as the current user and verify the indicator is removed
                (0, Report_1.addComment)(REPORT_ID, 'Current User Comment 1');
                return [2 /*return*/, (0, waitForBatchedUpdates_1.default)()];
            });
        }); })
            .then(function () {
            var newMessageLineIndicatorHintText = (0, Localize_1.translateLocal)('accessibilityHints.newMessageLineIndicator');
            var unreadIndicator = react_native_1.screen.queryAllByLabelText(newMessageLineIndicatorHintText);
            expect(unreadIndicator).toHaveLength(1);
        });
    });
    xit('Keeps the new line indicator when the user moves the App to the background', function () {
        return signInAndGetAppWithUnreadChat()
            .then(function () {
            // Verify we are on the LHN and that the chat shows as unread in the LHN
            expect(areYouOnChatListScreen()).toBe(true);
            // Navigate to the chat and verify the new line indicator is present
            return (0, TestHelper_1.navigateToSidebarOption)(0);
        })
            .then(function () {
            var newMessageLineIndicatorHintText = (0, Localize_1.translateLocal)('accessibilityHints.newMessageLineIndicator');
            var unreadIndicator = react_native_1.screen.queryAllByLabelText(newMessageLineIndicatorHintText);
            expect(unreadIndicator).toHaveLength(1);
            // Then back to the LHN - then back to the chat again and verify the new line indicator has cleared
            return navigateToSidebar();
        })
            .then(function () { return (0, TestHelper_1.navigateToSidebarOption)(0); })
            .then(function () {
            var newMessageLineIndicatorHintText = (0, Localize_1.translateLocal)('accessibilityHints.newMessageLineIndicator');
            var unreadIndicator = react_native_1.screen.queryAllByLabelText(newMessageLineIndicatorHintText);
            expect(unreadIndicator).toHaveLength(0);
            // Mark a previous comment as unread and verify the unread action indicator returns
            (0, Report_1.markCommentAsUnread)(REPORT_ID, createdReportAction);
            return (0, waitForBatchedUpdates_1.default)();
        })
            .then(function () {
            var newMessageLineIndicatorHintText = (0, Localize_1.translateLocal)('accessibilityHints.newMessageLineIndicator');
            var unreadIndicator = react_native_1.screen.queryAllByLabelText(newMessageLineIndicatorHintText);
            expect(unreadIndicator).toHaveLength(1);
            // Trigger the app going inactive and active again
            react_native_2.AppState.emitCurrentTestState('background');
            react_native_2.AppState.emitCurrentTestState('active');
            // Verify the new line is still present
            unreadIndicator = react_native_1.screen.queryAllByLabelText(newMessageLineIndicatorHintText);
            expect(unreadIndicator).toHaveLength(1);
        });
    });
    it('Displays the correct chat message preview in the LHN when a comment is added then deleted', function () {
        var reportActions;
        var lastReportAction;
        react_native_onyx_1.default.connect({
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(REPORT_ID),
            callback: function (val) { return (reportActions = val); },
        });
        return (signInAndGetAppWithUnreadChat()
            // Navigate to the chat and simulate leaving a comment from the current user
            .then(function () { return (0, TestHelper_1.navigateToSidebarOption)(0); })
            .then(function () {
            // Leave a comment as the current user
            (0, Report_1.addComment)(REPORT_ID, 'Current User Comment 1');
            return (0, waitForBatchedUpdates_1.default)();
        })
            .then(function () {
            // Simulate the response from the server so that the comment can be deleted in this test
            lastReportAction = reportActions ? (0, CollectionUtils_1.lastItem)(reportActions) : undefined;
            react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(REPORT_ID), {
                lastMessageText: (0, ReportActionsUtils_1.getReportActionText)(lastReportAction),
                lastActorAccountID: lastReportAction === null || lastReportAction === void 0 ? void 0 : lastReportAction.actorAccountID,
                reportID: REPORT_ID,
            });
            return (0, waitForBatchedUpdates_1.default)();
        })
            .then(function () {
            // Verify the chat preview text matches the last comment from the current user
            var hintText = (0, Localize_1.translateLocal)('accessibilityHints.lastChatMessagePreview');
            var alternateText = react_native_1.screen.queryAllByLabelText(hintText, { includeHiddenElements: true });
            expect(alternateText).toHaveLength(1);
            // This message is visible on the sidebar and the report screen, so there are two occurrences.
            expect(react_native_1.screen.getAllByText('Current User Comment 1').at(0)).toBeOnTheScreen();
            if (lastReportAction) {
                (0, Report_1.deleteReportComment)(REPORT_ID, lastReportAction);
            }
            return (0, waitForBatchedUpdates_1.default)();
        })
            .then(function () {
            var hintText = (0, Localize_1.translateLocal)('accessibilityHints.lastChatMessagePreview');
            var alternateText = react_native_1.screen.queryAllByLabelText(hintText, { includeHiddenElements: true });
            expect(alternateText).toHaveLength(1);
            expect(react_native_1.screen.getAllByText('Comment 9').at(0)).toBeOnTheScreen();
        }));
    });
    it('Move the new line indicator to the next message when the unread message is deleted', function () { return __awaiter(void 0, void 0, void 0, function () {
        var reportActions, connection, firstNewReportAction, secondNewReportAction, newMessageLineIndicatorHintText, unreadIndicator, reportActionID;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    connection = react_native_onyx_1.default.connect({
                        key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(REPORT_ID),
                        callback: function (val) { return (reportActions = val); },
                    });
                    return [4 /*yield*/, signInAndGetAppWithUnreadChat()];
                case 1:
                    _c.sent();
                    return [4 /*yield*/, (0, TestHelper_1.navigateToSidebarOption)(0)];
                case 2:
                    _c.sent();
                    (0, Report_1.addComment)(REPORT_ID, 'Comment 1');
                    return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                case 3:
                    _c.sent();
                    firstNewReportAction = reportActions ? (0, CollectionUtils_1.lastItem)(reportActions) : undefined;
                    if (!firstNewReportAction) return [3 /*break*/, 7];
                    (0, Report_1.markCommentAsUnread)(REPORT_ID, firstNewReportAction);
                    return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                case 4:
                    _c.sent();
                    (0, Report_1.addComment)(REPORT_ID, 'Comment 2');
                    return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                case 5:
                    _c.sent();
                    (0, Report_1.deleteReportComment)(REPORT_ID, firstNewReportAction);
                    return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                case 6:
                    _c.sent();
                    _c.label = 7;
                case 7:
                    secondNewReportAction = reportActions ? (0, CollectionUtils_1.lastItem)(reportActions) : undefined;
                    newMessageLineIndicatorHintText = (0, Localize_1.translateLocal)('accessibilityHints.newMessageLineIndicator');
                    unreadIndicator = react_native_1.screen.queryAllByLabelText(newMessageLineIndicatorHintText);
                    expect(unreadIndicator).toHaveLength(1);
                    reportActionID = (_b = (_a = unreadIndicator.at(0)) === null || _a === void 0 ? void 0 : _a.props) === null || _b === void 0 ? void 0 : _b['data-action-id'];
                    expect(reportActionID).toBe(secondNewReportAction === null || secondNewReportAction === void 0 ? void 0 : secondNewReportAction.reportActionID);
                    react_native_onyx_1.default.disconnect(connection);
                    return [2 /*return*/];
            }
        });
    }); });
    it('Do not display the new line indicator when receiving a new message from another user', function () { return __awaiter(void 0, void 0, void 0, function () {
        var newMessageLineIndicatorHintText, unreadIndicator;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: 
                // Given a read report
                return [4 /*yield*/, signInAndGetAppWithUnreadChat()];
                case 1:
                    // Given a read report
                    _a.sent();
                    (0, Report_1.readNewestAction)(REPORT_ID, true);
                    return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, (0, TestHelper_1.navigateToSidebarOption)(0)];
                case 3:
                    _a.sent();
                    // When another user adds a new message
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(REPORT_ID), {
                            10: TestHelper.buildTestReportComment(DateUtils_1.default.getDBTime(), USER_B_ACCOUNT_ID, '10'),
                        })];
                case 4:
                    // When another user adds a new message
                    _a.sent();
                    newMessageLineIndicatorHintText = (0, Localize_1.translateLocal)('accessibilityHints.newMessageLineIndicator');
                    unreadIndicator = react_native_1.screen.queryAllByLabelText(newMessageLineIndicatorHintText);
                    expect(unreadIndicator).toHaveLength(0);
                    return [2 /*return*/];
            }
        });
    }); });
    it('Do not display the new line indicator when tracking an expense on self DM while offline', function () { return __awaiter(void 0, void 0, void 0, function () {
        var selfDMReport, fakeTransaction, participant, newMessageLineIndicatorHintText, unreadIndicator;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: 
                // Given a self DM report and an offline network
                return [4 /*yield*/, signInAndGetAppWithUnreadChat()];
                case 1:
                    // Given a self DM report and an offline network
                    _a.sent();
                    return [4 /*yield*/, react_native_onyx_1.default.merge(ONYXKEYS_1.default.NETWORK, { isOffline: true })];
                case 2:
                    _a.sent();
                    // Remove unnecessary report
                    return [4 /*yield*/, react_native_onyx_1.default.set("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(REPORT_ID), null)];
                case 3:
                    // Remove unnecessary report
                    _a.sent();
                    selfDMReport = __assign(__assign({}, (0, reports_1.createRandomReport)(2)), { chatType: CONST_1.default.REPORT.CHAT_TYPE.SELF_DM, type: CONST_1.default.REPORT.TYPE.CHAT, lastMessageText: 'test' });
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(selfDMReport.reportID), selfDMReport)];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(selfDMReport.reportID), {
                            1: {
                                actionName: CONST_1.default.REPORT.ACTIONS.TYPE.CREATED,
                                automatic: false,
                                created: DateUtils_1.default.getDBTime(),
                                reportActionID: '1',
                                message: [
                                    {
                                        style: 'strong',
                                        text: '__FAKE__',
                                        type: 'TEXT',
                                    },
                                    {
                                        style: 'normal',
                                        text: 'created this report',
                                        type: 'TEXT',
                                    },
                                ],
                            },
                        })];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, (0, TestHelper_1.navigateToSidebarOption)(0)];
                case 6:
                    _a.sent();
                    fakeTransaction = __assign(__assign({}, (0, transaction_1.default)(1)), { iouRequestType: CONST_1.default.IOU.REQUEST_TYPE.MANUAL, comment: 'description' });
                    participant = { login: USER_A_EMAIL, accountID: USER_A_ACCOUNT_ID };
                    (0, IOU_1.trackExpense)({
                        report: selfDMReport,
                        isDraftPolicy: true,
                        action: CONST_1.default.IOU.ACTION.CREATE,
                        participantParams: {
                            payeeEmail: participant.login,
                            payeeAccountID: participant.accountID,
                            participant: participant,
                        },
                        transactionParams: {
                            amount: fakeTransaction.amount,
                            currency: fakeTransaction.currency,
                            created: (0, date_fns_1.format)(new Date(), CONST_1.default.DATE.FNS_FORMAT_STRING),
                        },
                    });
                    return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                case 7:
                    _a.sent();
                    newMessageLineIndicatorHintText = (0, Localize_1.translateLocal)('accessibilityHints.newMessageLineIndicator');
                    unreadIndicator = react_native_1.screen.queryAllByLabelText(newMessageLineIndicatorHintText);
                    expect(unreadIndicator).toHaveLength(0);
                    return [2 /*return*/];
            }
        });
    }); });
    it('Mark the chat as unread on clicking "Mark as unread" on an item in LHN when the last message of the chat was deleted by another user', function () { return __awaiter(void 0, void 0, void 0, function () {
        var reportAction11CreatedDate, reportAction11, reportAction12CreatedDate, reportAction12, message, hintText, displayNameTexts;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0: return [4 /*yield*/, signInAndGetAppWithUnreadChat()];
                case 1:
                    _d.sent();
                    return [4 /*yield*/, navigateToSidebar()];
                case 2:
                    _d.sent();
                    reportAction11CreatedDate = (0, date_fns_1.format)((0, date_fns_1.addSeconds)(TEN_MINUTES_AGO, 110), CONST_1.default.DATE.FNS_DB_FORMAT_STRING);
                    reportAction11 = TestHelper.buildTestReportComment(reportAction11CreatedDate, USER_B_ACCOUNT_ID, '11');
                    reportAction12CreatedDate = (0, date_fns_1.format)((0, date_fns_1.addSeconds)(TEN_MINUTES_AGO, 120), CONST_1.default.DATE.FNS_DB_FORMAT_STRING);
                    reportAction12 = TestHelper.buildTestReportComment(reportAction12CreatedDate, USER_B_ACCOUNT_ID, '12');
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(REPORT_ID), {
                            11: reportAction11,
                            12: reportAction12,
                        })];
                case 3:
                    _d.sent();
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(REPORT_ID), {
                            lastVisibleActionCreated: reportAction12CreatedDate,
                        })];
                case 4:
                    _d.sent();
                    message = reportAction12.message.at(0);
                    if (message) {
                        message.html = ''; // Simulate the server response for deleting the last message
                    }
                    return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(REPORT_ID), {
                            lastVisibleActionCreated: reportAction11CreatedDate,
                        })];
                case 5:
                    _d.sent();
                    (0, Report_1.markCommentAsUnread)(REPORT_ID, { reportActionID: -1 }); // Marking the chat as unread from LHN passing a dummy reportActionID
                    return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                case 6:
                    _d.sent();
                    hintText = (0, Localize_1.translateLocal)('accessibilityHints.chatUserDisplayNames');
                    displayNameTexts = react_native_1.screen.queryAllByLabelText(hintText);
                    expect(displayNameTexts).toHaveLength(1);
                    expect((_c = (_b = (_a = displayNameTexts.at(0)) === null || _a === void 0 ? void 0 : _a.props) === null || _b === void 0 ? void 0 : _b.style) === null || _c === void 0 ? void 0 : _c.fontWeight).toBe(FontUtils_1.default.fontWeight.bold);
                    return [2 /*return*/];
            }
        });
    }); });
});
