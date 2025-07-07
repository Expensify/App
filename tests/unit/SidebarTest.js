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
var react_native_1 = require("@testing-library/react-native");
var react_native_onyx_1 = require("react-native-onyx");
var DateUtils_1 = require("@libs/DateUtils");
var OnyxDerived_1 = require("@userActions/OnyxDerived");
var CONST_1 = require("@src/CONST");
var Localize = require("@src/libs/Localize");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var LHNTestUtils = require("../utils/LHNTestUtils");
var TestHelper = require("../utils/TestHelper");
var waitForBatchedUpdates_1 = require("../utils/waitForBatchedUpdates");
var wrapOnyxWithWaitForBatchedUpdates_1 = require("../utils/wrapOnyxWithWaitForBatchedUpdates");
// Be sure to include the mocked Permissions and Expensicons libraries or else the beta tests won't work
jest.mock('@src/libs/Permissions');
jest.mock('@src/components/Icon/Expensicons');
jest.mock('@src/hooks/useRootNavigationState');
var TEST_USER_ACCOUNT_ID = 1;
var TEST_USER_LOGIN = 'email1@test.com';
describe('Sidebar', function () {
    beforeAll(function () {
        react_native_onyx_1.default.init({
            keys: ONYXKEYS_1.default,
            evictableKeys: [ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS],
        });
        (0, OnyxDerived_1.default)();
    });
    beforeEach(function () {
        // Wrap Onyx each onyx action with waitForBatchedUpdates
        (0, wrapOnyxWithWaitForBatchedUpdates_1.default)(react_native_onyx_1.default);
        react_native_onyx_1.default.set(ONYXKEYS_1.default.NVP_PREFERRED_LOCALE, CONST_1.default.LOCALES.EN);
        // Initialize the network key for OfflineWithFeedback
        return TestHelper.signInWithTestUser(TEST_USER_ACCOUNT_ID, TEST_USER_LOGIN).then(function () { return react_native_onyx_1.default.merge(ONYXKEYS_1.default.NETWORK, { isOffline: false }); });
    });
    // Clear out Onyx after each test so that each test starts with a clean slate
    afterEach(function () {
        react_native_onyx_1.default.clear();
    });
    describe('archived chats', function () {
        it('renders the archive reason as the preview message of the chat', function () {
            var report = __assign(__assign({}, LHNTestUtils.getFakeReport([1, 2], 3, true)), { chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_ROOM, lastMessageText: 'test' });
            var action = __assign(__assign({}, LHNTestUtils.getFakeReportAction('email1@test.com', 3)), { actionName: 'CLOSED', originalMessage: {
                    reason: CONST_1.default.REPORT.ARCHIVE_REASON.DEFAULT,
                } });
            var reportNameValuePairs = {
                private_isArchived: DateUtils_1.default.getDBTime(),
            };
            // Given the user is in all betas
            var betas = [CONST_1.default.BETAS.DEFAULT_ROOMS];
            return ((0, waitForBatchedUpdates_1.default)()
                .then(function () { return LHNTestUtils.getDefaultRenderedSidebarLinks('0'); })
                // When Onyx is updated with the data and the sidebar re-renders
                .then(function () {
                var _a, _b, _c, _d, _e;
                var reportCollection = (_a = {},
                    _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report.reportID)] = report,
                    _a);
                var reportAction = (_b = {},
                    _b["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(report.reportID)] = (_c = {}, _c[action.reportActionID] = action, _c),
                    _b);
                var reportNameValuePairsCollection = (_d = {},
                    _d["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_NAME_VALUE_PAIRS).concat(report.reportID)] = reportNameValuePairs,
                    _d);
                return react_native_onyx_1.default.multiSet(__assign(__assign(__assign((_e = {}, _e[ONYXKEYS_1.default.BETAS] = betas, _e[ONYXKEYS_1.default.NVP_PRIORITY_MODE] = CONST_1.default.PRIORITY_MODE.GSD, _e[ONYXKEYS_1.default.PERSONAL_DETAILS_LIST] = LHNTestUtils.fakePersonalDetails, _e[ONYXKEYS_1.default.IS_LOADING_APP] = false, _e), reportNameValuePairsCollection), reportCollection), reportAction));
            })
                .then(function () {
                var hintText = Localize.translateLocal('accessibilityHints.chatUserDisplayNames');
                var displayNames = react_native_1.screen.queryAllByLabelText(hintText);
                expect(displayNames.at(0)).toHaveTextContent('Report (archived)');
                var hintMessagePreviewText = Localize.translateLocal('accessibilityHints.lastChatMessagePreview');
                var messagePreviewTexts = react_native_1.screen.queryAllByLabelText(hintMessagePreviewText);
                expect(messagePreviewTexts.at(0)).toHaveTextContent('This chat room has been archived.');
            }));
        });
        it('renders the policy deleted archive reason as the preview message of the chat', function () {
            var report = __assign(__assign({}, LHNTestUtils.getFakeReport([1, 2], 3, true)), { policyName: 'Vikings Policy', chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_ROOM, statusNum: CONST_1.default.REPORT.STATUS_NUM.CLOSED, stateNum: CONST_1.default.REPORT.STATE_NUM.APPROVED, private_isArchived: DateUtils_1.default.getDBTime(), lastMessageText: 'test' });
            var action = __assign(__assign({}, LHNTestUtils.getFakeReportAction('email1@test.com', 3)), { actionName: 'CLOSED', originalMessage: {
                    policyName: 'Vikings Policy',
                    reason: 'policyDeleted',
                } });
            var reportNameValuePairs = {
                private_isArchived: DateUtils_1.default.getDBTime(),
            };
            // Given the user is in all betas
            var betas = [CONST_1.default.BETAS.DEFAULT_ROOMS];
            return ((0, waitForBatchedUpdates_1.default)()
                .then(function () { return LHNTestUtils.getDefaultRenderedSidebarLinks('0'); })
                // When Onyx is updated with the data and the sidebar re-renders
                .then(function () {
                var _a, _b, _c, _d, _e;
                var reportCollection = (_a = {},
                    _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report.reportID)] = report,
                    _a);
                var reportAction = (_b = {},
                    _b["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(report.reportID)] = (_c = {}, _c[action.reportActionID] = action, _c),
                    _b);
                var reportNameValuePairsCollection = (_d = {},
                    _d["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_NAME_VALUE_PAIRS).concat(report.reportID)] = reportNameValuePairs,
                    _d);
                return react_native_onyx_1.default.multiSet(__assign(__assign(__assign((_e = {}, _e[ONYXKEYS_1.default.BETAS] = betas, _e[ONYXKEYS_1.default.NVP_PRIORITY_MODE] = CONST_1.default.PRIORITY_MODE.GSD, _e[ONYXKEYS_1.default.PERSONAL_DETAILS_LIST] = LHNTestUtils.fakePersonalDetails, _e[ONYXKEYS_1.default.IS_LOADING_APP] = false, _e), reportNameValuePairsCollection), reportCollection), reportAction));
            })
                .then(function () {
                var hintText = Localize.translateLocal('accessibilityHints.chatUserDisplayNames');
                var displayNames = react_native_1.screen.queryAllByLabelText(hintText);
                expect(displayNames.at(0)).toHaveTextContent('Report (archived)');
                var hintMessagePreviewText = Localize.translateLocal('accessibilityHints.lastChatMessagePreview');
                var messagePreviewTexts = react_native_1.screen.queryAllByLabelText(hintMessagePreviewText);
                expect(messagePreviewTexts.at(0)).toHaveTextContent('This chat is no longer active because Vikings Policy is no longer an active workspace.');
            }));
        });
    });
});
