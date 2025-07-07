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
var react_native_1 = require("@testing-library/react-native");
var react_native_onyx_1 = require("react-native-onyx");
var OnyxDerived_1 = require("@libs/actions/OnyxDerived");
var DateUtils_1 = require("@libs/DateUtils");
var Localize_1 = require("@libs/Localize");
var ReportUtils_1 = require("@libs/ReportUtils");
var TransactionUtils_1 = require("@libs/TransactionUtils");
var FontUtils_1 = require("@styles/utils/FontUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var reports_1 = require("../../__mocks__/reportData/reports");
var LHNTestUtils = require("../utils/LHNTestUtils");
var TestHelper = require("../utils/TestHelper");
var waitForBatchedUpdates_1 = require("../utils/waitForBatchedUpdates");
var waitForBatchedUpdatesWithAct_1 = require("../utils/waitForBatchedUpdatesWithAct");
var wrapOnyxWithWaitForBatchedUpdates_1 = require("../utils/wrapOnyxWithWaitForBatchedUpdates");
// Be sure to include the mocked permissions library, as some components that are rendered
// during the test depend on its methods.
jest.mock('@libs/Permissions');
jest.mock('@react-navigation/native', function () { return (__assign(__assign({}, jest.requireActual('@react-navigation/native')), { useNavigationState: function () { return undefined; }, useIsFocused: function () { return true; }, useRoute: function () { return ({ name: 'Home' }); }, useNavigation: function () { return undefined; }, useFocusEffect: function () { return undefined; } })); });
jest.mock('@components/withCurrentUserPersonalDetails', function () {
    // Lazy loading of LHNTestUtils
    var lazyLoadLHNTestUtils = function () { return require('../utils/LHNTestUtils'); };
    return function (Component) {
        function WrappedComponent(props) {
            var currentUserAccountID = 1;
            var LHNTestUtilsMock = lazyLoadLHNTestUtils(); // Load LHNTestUtils here
            return (<Component 
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props} currentUserPersonalDetails={LHNTestUtilsMock.fakePersonalDetails[currentUserAccountID]}/>);
        }
        WrappedComponent.displayName = 'WrappedComponent';
        return WrappedComponent;
    };
});
var TEST_USER_ACCOUNT_ID = 1;
var TEST_USER_LOGIN = 'test@test.com';
var betas = [CONST_1.default.BETAS.DEFAULT_ROOMS];
var TEST_POLICY_ID = '1';
var signUpWithTestUser = function () {
    TestHelper.signInWithTestUser(TEST_USER_ACCOUNT_ID, TEST_USER_LOGIN);
};
var getOptionRows = function () {
    return react_native_1.screen.queryAllByAccessibilityHint(TestHelper.getNavigateToChatHintRegex());
};
var getDisplayNames = function () {
    var hintText = (0, Localize_1.translateLocal)('accessibilityHints.chatUserDisplayNames');
    return react_native_1.screen.queryAllByLabelText(hintText);
};
// Reusable function to setup a mock report. Feel free to add more parameters as needed.
var createReport = function (isPinned, participants, messageCount, chatType, policyID, isUnread) {
    if (isPinned === void 0) { isPinned = false; }
    if (participants === void 0) { participants = [1, 2]; }
    if (messageCount === void 0) { messageCount = 1; }
    if (chatType === void 0) { chatType = undefined; }
    if (policyID === void 0) { policyID = CONST_1.default.POLICY.ID_FAKE; }
    if (isUnread === void 0) { isUnread = false; }
    return __assign(__assign({}, LHNTestUtils.getFakeReport(participants, messageCount, isUnread)), { isPinned: isPinned, chatType: chatType, policyID: policyID });
};
var createFakeTransactionViolation = function (violationName, showInReview) {
    if (violationName === void 0) { violationName = CONST_1.default.VIOLATIONS.HOLD; }
    if (showInReview === void 0) { showInReview = true; }
    return LHNTestUtils.getFakeTransactionViolation(violationName, showInReview);
};
describe('SidebarLinksData', function () {
    beforeAll(function () {
        react_native_onyx_1.default.init({
            keys: ONYXKEYS_1.default,
            evictableKeys: [ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS],
        });
        (0, OnyxDerived_1.default)();
    });
    // Helper to initialize common state
    var initializeState = function (reportData, otherData) { return __awaiter(void 0, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, (0, waitForBatchedUpdates_1.default)()];
                case 1:
                    _b.sent();
                    return [4 /*yield*/, react_native_onyx_1.default.multiSet(__assign(__assign((_a = {}, _a[ONYXKEYS_1.default.NVP_PRIORITY_MODE] = CONST_1.default.PRIORITY_MODE.GSD, _a[ONYXKEYS_1.default.BETAS] = betas, _a[ONYXKEYS_1.default.PERSONAL_DETAILS_LIST] = LHNTestUtils.fakePersonalDetails, _a[ONYXKEYS_1.default.IS_LOADING_APP] = false, _a), (reportData !== null && reportData !== void 0 ? reportData : {})), (otherData !== null && otherData !== void 0 ? otherData : {})))];
                case 2:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    beforeEach(function () {
        (0, wrapOnyxWithWaitForBatchedUpdates_1.default)(react_native_onyx_1.default);
        // Initialize the network key for OfflineWithFeedback
        react_native_onyx_1.default.merge(ONYXKEYS_1.default.NETWORK, { isOffline: false });
        react_native_onyx_1.default.set(ONYXKEYS_1.default.NVP_PREFERRED_LOCALE, CONST_1.default.LOCALES.EN);
        signUpWithTestUser();
    });
    afterEach(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, react_native_onyx_1.default.clear()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    describe('Report that should be included in the LHN', function () {
        it('should display the current active report', function () { return __awaiter(void 0, void 0, void 0, function () {
            var report;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        // Given the SidebarLinks are rendered without a specified report ID.
                        LHNTestUtils.getDefaultRenderedSidebarLinks();
                        report = createReport();
                        // When the Onyx state is initialized with a report.
                        return [4 /*yield*/, initializeState((_a = {},
                                _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report.reportID)] = report,
                                _a))];
                    case 1:
                        // When the Onyx state is initialized with a report.
                        _b.sent();
                        // Then no other reports should be displayed in the sidebar.
                        expect(getOptionRows()).toHaveLength(0);
                        // When the SidebarLinks are rendered again with the current active report ID.
                        return [4 /*yield*/, LHNTestUtils.getDefaultRenderedSidebarLinks(report.reportID)];
                    case 2:
                        // When the SidebarLinks are rendered again with the current active report ID.
                        _b.sent();
                        return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                    case 3:
                        _b.sent();
                        // Then the active report should be displayed as part of LHN,
                        expect(getOptionRows()).toHaveLength(1);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should display draft report', function () { return __awaiter(void 0, void 0, void 0, function () {
            var draftReport;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        // Given SidebarLinks are rendered initially.
                        LHNTestUtils.getDefaultRenderedSidebarLinks();
                        draftReport = __assign(__assign({}, createReport(false, [1, 2], 0)), { writeCapability: CONST_1.default.REPORT.WRITE_CAPABILITIES.ALL });
                        // When Onyx state is initialized with a draft report.
                        return [4 /*yield*/, initializeState((_a = {},
                                _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(draftReport.reportID)] = draftReport,
                                _a))];
                    case 1:
                        // When Onyx state is initialized with a draft report.
                        _b.sent();
                        return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                    case 2:
                        _b.sent();
                        // And a draft message is added to the report.
                        return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_DRAFT_COMMENT).concat(draftReport.reportID), 'draft report message')];
                    case 3:
                        // And a draft message is added to the report.
                        _b.sent();
                        // Then the sidebar should display the draft report.
                        expect(getDisplayNames()).toHaveLength(1);
                        // And the draft icon should be shown, indicating there is unsent content.
                        expect(react_native_1.screen.getByTestId('Pencil Icon')).toBeOnTheScreen();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should display pinned report', function () { return __awaiter(void 0, void 0, void 0, function () {
            var report;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        // Given the SidebarLinks are rendered.
                        LHNTestUtils.getDefaultRenderedSidebarLinks();
                        report = createReport(false);
                        // When the report is initialized in Onyx.
                        return [4 /*yield*/, initializeState((_a = {},
                                _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report.reportID)] = report,
                                _a))];
                    case 1:
                        // When the report is initialized in Onyx.
                        _b.sent();
                        // Then the report should not appear in the sidebar as it is not pinned.
                        expect(getOptionRows()).toHaveLength(0);
                        return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                    case 2:
                        _b.sent();
                        // When the report is marked as pinned.
                        return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report.reportID), { isPinned: true })];
                    case 3:
                        // When the report is marked as pinned.
                        _b.sent();
                        // Then the report should appear in the sidebar because it’s pinned.
                        expect(getOptionRows()).toHaveLength(1);
                        // And the pin icon should be shown
                        expect(react_native_1.screen.getByTestId('Pin Icon')).toBeOnTheScreen();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should display the report with violations', function () { return __awaiter(void 0, void 0, void 0, function () {
            var report, expenseReport, transaction, transactionViolation, reportAction;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        // Given the SidebarLinks are rendered.
                        LHNTestUtils.getDefaultRenderedSidebarLinks();
                        report = __assign(__assign({}, createReport(true, undefined, undefined, CONST_1.default.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT, TEST_POLICY_ID)), { ownerAccountID: TEST_USER_ACCOUNT_ID });
                        return [4 /*yield*/, initializeState((_a = {},
                                _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report.reportID)] = report,
                                _a))];
                    case 1:
                        _c.sent();
                        // Then the report should appear in the sidebar because it’s pinned.
                        expect(getOptionRows()).toHaveLength(1);
                        return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                    case 2:
                        _c.sent();
                        expenseReport = __assign(__assign({}, createReport(false, undefined, undefined, undefined, TEST_POLICY_ID)), { ownerAccountID: TEST_USER_ACCOUNT_ID, type: CONST_1.default.REPORT.TYPE.EXPENSE, chatReportID: report.reportID });
                        transaction = LHNTestUtils.getFakeTransaction(expenseReport.reportID);
                        transactionViolation = createFakeTransactionViolation();
                        reportAction = LHNTestUtils.getFakeAdvancedReportAction();
                        // When the report has outstanding violations
                        return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(expenseReport.reportID), expenseReport)];
                    case 3:
                        // When the report has outstanding violations
                        _c.sent();
                        return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(report.reportID), (_b = {},
                                _b[reportAction.reportActionID] = reportAction,
                                _b))];
                    case 4:
                        _c.sent();
                        return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(transaction.transactionID), transaction)];
                    case 5:
                        _c.sent();
                        return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(transaction.transactionID), [transactionViolation])];
                    case 6:
                        _c.sent();
                        // Then the RBR icon should be shown
                        expect(react_native_1.screen.getByTestId('RBR Icon')).toBeOnTheScreen();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should display the report awaiting user action', function () { return __awaiter(void 0, void 0, void 0, function () {
            var report;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        // Given the SidebarLinks are rendered.
                        LHNTestUtils.getDefaultRenderedSidebarLinks();
                        report = __assign(__assign({}, createReport(false)), { hasOutstandingChildRequest: true });
                        // When the report is initialized in Onyx.
                        return [4 /*yield*/, initializeState((_a = {},
                                _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report.reportID)] = report,
                                _a))];
                    case 1:
                        // When the report is initialized in Onyx.
                        _b.sent();
                        // Then the report should appear in the sidebar because it requires attention from the user
                        expect(getOptionRows()).toHaveLength(1);
                        // And a green dot icon should be shown
                        expect(react_native_1.screen.getByTestId('GBR Icon')).toBeOnTheScreen();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should display the archived report in the default mode', function () { return __awaiter(void 0, void 0, void 0, function () {
            var archivedReport, reportNameValuePairs;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        // Given the SidebarLinks are rendered.
                        LHNTestUtils.getDefaultRenderedSidebarLinks();
                        archivedReport = __assign({}, createReport(false));
                        reportNameValuePairs = {
                            type: 'chat',
                            private_isArchived: DateUtils_1.default.getDBTime(),
                        };
                        return [4 /*yield*/, initializeState((_a = {},
                                _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(archivedReport.reportID)] = archivedReport,
                                _a))];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                    case 2:
                        _b.sent();
                        // When the user is in the default mode
                        return [4 /*yield*/, react_native_onyx_1.default.merge(ONYXKEYS_1.default.NVP_PRIORITY_MODE, CONST_1.default.PRIORITY_MODE.DEFAULT)];
                    case 3:
                        // When the user is in the default mode
                        _b.sent();
                        return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_NAME_VALUE_PAIRS).concat(archivedReport.reportID), reportNameValuePairs)];
                    case 4:
                        _b.sent();
                        // Then the report should appear in the sidebar because it's archived
                        expect(getOptionRows()).toHaveLength(1);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should display the selfDM report by default', function () { return __awaiter(void 0, void 0, void 0, function () {
            var report;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        // Given the SidebarLinks are rendered.
                        LHNTestUtils.getDefaultRenderedSidebarLinks();
                        report = createReport(true, undefined, undefined, undefined, CONST_1.default.REPORT.CHAT_TYPE.SELF_DM, undefined);
                        // When the selfDM is initialized in Onyx
                        return [4 /*yield*/, initializeState((_a = {},
                                _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report.reportID)] = report,
                                _a))];
                    case 1:
                        // When the selfDM is initialized in Onyx
                        _b.sent();
                        // Then the selfDM report should appear in the sidebar by default
                        expect(getOptionRows()).toHaveLength(1);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should display the unread report in the focus mode with the bold text', function () { return __awaiter(void 0, void 0, void 0, function () {
            var report, displayNameText;
            var _a;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        // Given the SidebarLinks are rendered.
                        LHNTestUtils.getDefaultRenderedSidebarLinks();
                        report = __assign(__assign({}, createReport(undefined, undefined, undefined, undefined, undefined, true)), { lastMessageText: 'fake last message', lastActorAccountID: TEST_USER_ACCOUNT_ID });
                        return [4 /*yield*/, initializeState((_a = {},
                                _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report.reportID)] = report,
                                _a))];
                    case 1:
                        _c.sent();
                        return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                    case 2:
                        _c.sent();
                        // When the user is in focus mode
                        return [4 /*yield*/, react_native_onyx_1.default.merge(ONYXKEYS_1.default.NVP_PRIORITY_MODE, CONST_1.default.PRIORITY_MODE.GSD)];
                    case 3:
                        // When the user is in focus mode
                        _c.sent();
                        // Then the report should appear in the sidebar because it's unread
                        expect(getOptionRows()).toHaveLength(1);
                        displayNameText = (_b = getDisplayNames()) === null || _b === void 0 ? void 0 : _b.at(0);
                        expect(displayNameText).toHaveStyle({ fontWeight: FontUtils_1.default.fontWeight.bold });
                        return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                    case 4:
                        _c.sent();
                        // When the report is marked as read
                        return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report.reportID), {
                                lastReadTime: report.lastVisibleActionCreated,
                            })];
                    case 5:
                        // When the report is marked as read
                        _c.sent();
                        // Then the report should not disappear in the sidebar because we are in the focus mode
                        expect(getOptionRows()).toHaveLength(0);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('Report that should NOT be included in the LHN', function () {
        it('should not display report with no participants', function () { return __awaiter(void 0, void 0, void 0, function () {
            var report;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        // Given the SidebarLinks are rendered.
                        LHNTestUtils.getDefaultRenderedSidebarLinks();
                        report = LHNTestUtils.getFakeReport([]);
                        // When a report with no participants is initialized in Onyx.
                        return [4 /*yield*/, initializeState((_a = {},
                                _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report.reportID)] = report,
                                _a))];
                    case 1:
                        // When a report with no participants is initialized in Onyx.
                        _b.sent();
                        // Then the report should not appear in the sidebar.
                        expect(getOptionRows()).toHaveLength(0);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should not display empty chat', function () { return __awaiter(void 0, void 0, void 0, function () {
            var report;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        // Given the SidebarLinks are rendered.
                        LHNTestUtils.getDefaultRenderedSidebarLinks();
                        report = LHNTestUtils.getFakeReport([1, 2], 0);
                        // When a report with no messages is initialized in Onyx
                        return [4 /*yield*/, initializeState((_a = {},
                                _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report.reportID)] = report,
                                _a))];
                    case 1:
                        // When a report with no messages is initialized in Onyx
                        _b.sent();
                        // Then the empty report should not appear in the sidebar.
                        expect(getOptionRows()).toHaveLength(0);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should not display the report marked as hidden', function () { return __awaiter(void 0, void 0, void 0, function () {
            var report;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        // Given the SidebarLinks are rendered
                        LHNTestUtils.getDefaultRenderedSidebarLinks();
                        report = __assign(__assign({}, createReport()), { participants: (_a = {},
                                _a[TEST_USER_ACCOUNT_ID] = {
                                    notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.HIDDEN,
                                },
                                _a) });
                        // When a report with notification preference set as hidden is initialized in Onyx
                        return [4 /*yield*/, initializeState((_b = {},
                                _b["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report.reportID)] = report,
                                _b))];
                    case 1:
                        // When a report with notification preference set as hidden is initialized in Onyx
                        _c.sent();
                        // Then hidden report should not appear in the sidebar.
                        expect(getOptionRows()).toHaveLength(0);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should not display the report has empty notification preference', function () { return __awaiter(void 0, void 0, void 0, function () {
            var report;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        // Given the SidebarLinks are rendered
                        LHNTestUtils.getDefaultRenderedSidebarLinks();
                        report = createReport(false, [2]);
                        // When a report with empty notification preference is initialized in Onyx
                        return [4 /*yield*/, initializeState((_a = {},
                                _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report.reportID)] = report,
                                _a))];
                    case 1:
                        // When a report with empty notification preference is initialized in Onyx
                        _b.sent();
                        // Then the report should not appear in the sidebar.
                        expect(getOptionRows()).toHaveLength(0);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should not display the report the user cannot access due to policy restrictions', function () { return __awaiter(void 0, void 0, void 0, function () {
            var report;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        // Given the SidebarLinks are rendered
                        LHNTestUtils.getDefaultRenderedSidebarLinks();
                        report = __assign(__assign({}, createReport()), { chatType: CONST_1.default.REPORT.CHAT_TYPE.DOMAIN_ALL, lastMessageText: 'fake last message' });
                        // When a default room is initialized in Onyx
                        return [4 /*yield*/, initializeState((_a = {},
                                _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report.reportID)] = report,
                                _a))];
                    case 1:
                        // When a default room is initialized in Onyx
                        _b.sent();
                        // And the defaultRooms beta is removed
                        return [4 /*yield*/, react_native_onyx_1.default.merge(ONYXKEYS_1.default.BETAS, [])];
                    case 2:
                        // And the defaultRooms beta is removed
                        _b.sent();
                        // Then the default room should not appear in the sidebar.
                        expect(getOptionRows()).toHaveLength(0);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should not display the single transaction thread', function () { return __awaiter(void 0, void 0, void 0, function () {
            var expenseReport, expenseTransaction, expenseCreatedAction, transactionThreadReport;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        // Given the SidebarLinks are rendered
                        LHNTestUtils.getDefaultRenderedSidebarLinks();
                        expenseReport = (0, ReportUtils_1.buildOptimisticExpenseReport)(reports_1.chatReportR14932.reportID, '123', 100, 122, 'USD');
                        expenseTransaction = (0, TransactionUtils_1.buildOptimisticTransaction)({
                            transactionParams: {
                                amount: 100,
                                currency: 'USD',
                                reportID: expenseReport.reportID,
                            },
                        });
                        expenseCreatedAction = (0, ReportUtils_1.buildOptimisticIOUReportAction)({
                            type: 'create',
                            amount: 100,
                            currency: 'USD',
                            comment: '',
                            participants: [],
                            transactionID: expenseTransaction.transactionID,
                            iouReportID: expenseReport.reportID,
                        });
                        transactionThreadReport = (0, ReportUtils_1.buildTransactionThread)(expenseCreatedAction, expenseReport);
                        expenseCreatedAction.childReportID = transactionThreadReport.reportID;
                        // When a single transaction thread is initialized in Onyx
                        return [4 /*yield*/, initializeState((_a = {},
                                _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(transactionThreadReport.reportID)] = transactionThreadReport,
                                _a))];
                    case 1:
                        // When a single transaction thread is initialized in Onyx
                        _c.sent();
                        return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reports_1.chatReportR14932.reportID), reports_1.chatReportR14932)];
                    case 2:
                        _c.sent();
                        return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(expenseReport.reportID), (_b = {},
                                _b[expenseCreatedAction.reportActionID] = expenseCreatedAction,
                                _b))];
                    case 3:
                        _c.sent();
                        return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION).concat(expenseTransaction.transactionID), expenseTransaction)];
                    case 4:
                        _c.sent();
                        // Then such report should not appear in the sidebar because the highest level context is on the expense chat with GBR that is visible in the LHN
                        expect(getOptionRows()).toHaveLength(0);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should not display the report with parent message is pending removal', function () { return __awaiter(void 0, void 0, void 0, function () {
            var parentReport, report, parentReportAction;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        // Given the SidebarLinks are rendered
                        LHNTestUtils.getDefaultRenderedSidebarLinks();
                        parentReport = createReport();
                        report = createReport();
                        parentReportAction = __assign(__assign({}, LHNTestUtils.getFakeReportAction()), { message: [
                                {
                                    type: 'COMMENT',
                                    html: 'hey',
                                    text: 'hey',
                                    isEdited: false,
                                    whisperedTo: [],
                                    isDeletedParentAction: false,
                                    moderationDecision: {
                                        decision: CONST_1.default.MODERATION.MODERATOR_DECISION_PENDING_REMOVE,
                                    },
                                },
                            ], childReportID: report.reportID });
                        report.parentReportID = parentReport.reportID;
                        report.parentReportActionID = parentReportAction.reportActionID;
                        // When a report with parent message is pending removal is initialized in Onyx
                        return [4 /*yield*/, initializeState((_a = {},
                                _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report.reportID)] = report,
                                _a))];
                    case 1:
                        // When a report with parent message is pending removal is initialized in Onyx
                        _c.sent();
                        return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(parentReport.reportID), parentReport)];
                    case 2:
                        _c.sent();
                        return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(parentReport.reportID), (_b = {},
                                _b[parentReportAction.reportActionID] = parentReportAction,
                                _b))];
                    case 3:
                        _c.sent();
                        // Then report should not appear in the sidebar until the moderation feature decides if the message should be removed
                        expect(getOptionRows()).toHaveLength(0);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should not display the read report in the focus mode', function () { return __awaiter(void 0, void 0, void 0, function () {
            var report;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        // Given the SidebarLinks are rendered
                        LHNTestUtils.getDefaultRenderedSidebarLinks();
                        report = __assign(__assign({}, createReport()), { lastMessageText: 'fake last message', lastActorAccountID: TEST_USER_ACCOUNT_ID });
                        // When a read report that isn't empty is initialized in Onyx
                        return [4 /*yield*/, initializeState((_a = {},
                                _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report.reportID)] = report,
                                _a))];
                    case 1:
                        // When a read report that isn't empty is initialized in Onyx
                        _b.sent();
                        return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                    case 2:
                        _b.sent();
                        // And the user is in default mode
                        return [4 /*yield*/, react_native_onyx_1.default.merge(ONYXKEYS_1.default.NVP_PRIORITY_MODE, CONST_1.default.PRIORITY_MODE.DEFAULT)];
                    case 3:
                        // And the user is in default mode
                        _b.sent();
                        // Then the report should appear in the sidebar
                        expect(getOptionRows()).toHaveLength(1);
                        return [4 /*yield*/, (0, waitForBatchedUpdatesWithAct_1.default)()];
                    case 4:
                        _b.sent();
                        // When the user is in focus mode
                        return [4 /*yield*/, react_native_onyx_1.default.merge(ONYXKEYS_1.default.NVP_PRIORITY_MODE, CONST_1.default.PRIORITY_MODE.GSD)];
                    case 5:
                        // When the user is in focus mode
                        _b.sent();
                        // Then the report should not disappear in the sidebar because it's read
                        expect(getOptionRows()).toHaveLength(0);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should not display an empty submitted report having only a CREATED action', function () { return __awaiter(void 0, void 0, void 0, function () {
            var report, reportActionID, reportAction;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        // Given the SidebarLinks are rendered
                        LHNTestUtils.getDefaultRenderedSidebarLinks();
                        report = __assign(__assign({}, createReport(false, [1, 2], 0)), { total: 0, stateNum: CONST_1.default.REPORT.STATE_NUM.SUBMITTED, statusNum: CONST_1.default.REPORT.STATUS_NUM.SUBMITTED });
                        reportActionID = '1';
                        reportAction = __assign(__assign({}, LHNTestUtils.getFakeReportAction()), { reportActionID: reportActionID, actionName: CONST_1.default.REPORT.ACTIONS.TYPE.CREATED });
                        // When the Onyx state is initialized with this report
                        return [4 /*yield*/, initializeState((_a = {},
                                _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report.reportID)] = report,
                                _a))];
                    case 1:
                        // When the Onyx state is initialized with this report
                        _c.sent();
                        // And a report action collection with only a CREATED action is added
                        return [4 /*yield*/, react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(report.reportID), (_b = {},
                                _b[reportActionID] = reportAction,
                                _b))];
                    case 2:
                        // And a report action collection with only a CREATED action is added
                        _c.sent();
                        // Then the report should not be displayed in the sidebar
                        expect(getOptionRows()).toHaveLength(0);
                        expect(getDisplayNames()).toHaveLength(0);
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
