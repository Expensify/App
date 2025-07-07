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
var Localize_1 = require("@libs/Localize");
var CONST_1 = require("@src/CONST");
var LHNTestUtils = require("../utils/LHNTestUtils");
var TestHelper_1 = require("../utils/TestHelper");
var waitForBatchedUpdates_1 = require("../utils/waitForBatchedUpdates");
var wrapOnyxWithWaitForBatchedUpdates_1 = require("../utils/wrapOnyxWithWaitForBatchedUpdates");
// Be sure to include the mocked permissions library, as some components that are rendered
// during the test depend on its methods.
jest.mock('@libs/Permissions');
var ONYXKEYS = {
    PERSONAL_DETAILS_LIST: 'personalDetailsList',
    IS_LOADING_APP: 'isLoadingApp',
    NVP_PRIORITY_MODE: 'nvp_priorityMode',
    SESSION: 'session',
    BETAS: 'betas',
    COLLECTION: {
        REPORT: 'report_',
        REPORT_ACTIONS: 'reportActions_',
        POLICY: 'policy_',
        REPORT_DRAFT_COMMENT: 'reportDraftComment_',
    },
    NETWORK: 'network',
};
// We need to fix this test as a follow up. There seems to be some problems with memory after filtering got more complicated.
xdescribe('Sidebar', function () {
    beforeAll(function () {
        return react_native_onyx_1.default.init({
            keys: ONYXKEYS,
            evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        });
    });
    beforeEach(function () {
        // Wrap Onyx each onyx action with waitForBatchedUpdates
        (0, wrapOnyxWithWaitForBatchedUpdates_1.default)(react_native_onyx_1.default);
        // Initialize the network key for OfflineWithFeedback
        return react_native_onyx_1.default.merge(ONYXKEYS.NETWORK, { isOffline: false });
    });
    // clear out Onyx after each test so that each test starts with a clean slate
    afterEach(function () { return react_native_onyx_1.default.clear(); });
    describe('in default (most recent) mode', function () {
        it('excludes a report with no participants', function () {
            var _a;
            LHNTestUtils.getDefaultRenderedSidebarLinks();
            // Given a report with no participants
            var report = LHNTestUtils.getFakeReport([]);
            var reportCollectionDataSet = (_a = {},
                _a["".concat(ONYXKEYS.COLLECTION.REPORT).concat(report.reportID)] = report,
                _a);
            return ((0, waitForBatchedUpdates_1.default)()
                // When Onyx is updated to contain that report
                .then(function () { return react_native_onyx_1.default.multiSet(reportCollectionDataSet); })
                // Then no reports are rendered in the LHN
                .then(function () {
                var optionRows = react_native_1.screen.queryAllByAccessibilityHint((0, TestHelper_1.getNavigateToChatHintRegex)());
                expect(optionRows).toHaveLength(0);
            }));
        });
        it('excludes an empty chat report', function () {
            var _a;
            LHNTestUtils.getDefaultRenderedSidebarLinks();
            // Given a new report
            var report = LHNTestUtils.getFakeReport([1, 2], 0);
            var reportCollectionDataSet = (_a = {},
                _a["".concat(ONYXKEYS.COLLECTION.REPORT).concat(report.reportID)] = report,
                _a);
            return ((0, waitForBatchedUpdates_1.default)()
                // When Onyx is updated to contain that report
                .then(function () {
                var _a;
                return react_native_onyx_1.default.multiSet(__assign((_a = {}, _a[ONYXKEYS.IS_LOADING_APP] = false, _a), reportCollectionDataSet));
            })
                // Then no reports are rendered in the LHN
                .then(function () {
                var hintText = (0, Localize_1.translateLocal)('accessibilityHints.chatUserDisplayNames');
                var displayNames = react_native_1.screen.queryAllByLabelText(hintText);
                expect(displayNames).toHaveLength(0);
            }));
        });
        it('includes an empty chat report if it has a draft', function () {
            var _a;
            LHNTestUtils.getDefaultRenderedSidebarLinks();
            // Given a new report with a draft text
            var report = __assign({}, LHNTestUtils.getFakeReport([1, 2], 0));
            var reportCollectionDataSet = (_a = {},
                _a["".concat(ONYXKEYS.COLLECTION.REPORT).concat(report.reportID)] = report,
                _a);
            return ((0, waitForBatchedUpdates_1.default)()
                // When Onyx is updated to contain that report
                .then(function () {
                var _a;
                return react_native_onyx_1.default.multiSet(__assign((_a = {}, _a[ONYXKEYS.PERSONAL_DETAILS_LIST] = LHNTestUtils.fakePersonalDetails, _a[ONYXKEYS.IS_LOADING_APP] = false, _a["".concat(ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT).concat(report.reportID)] = 'This is a draft message', _a), reportCollectionDataSet));
            })
                // Then the report should be rendered in the LHN since it has a draft
                .then(function () {
                var hintText = (0, Localize_1.translateLocal)('accessibilityHints.chatUserDisplayNames');
                var displayNames = react_native_1.screen.queryAllByLabelText(hintText);
                expect(displayNames).toHaveLength(1);
            }));
        });
        it('includes or excludes user created policy rooms depending on the beta', function () {
            var _a;
            LHNTestUtils.getDefaultRenderedSidebarLinks();
            // Given a user created policy room report
            // and the user not being in any betas
            var report = __assign(__assign({}, LHNTestUtils.getFakeReport()), { chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_ROOM });
            var reportCollectionDataSet = (_a = {},
                _a["".concat(ONYXKEYS.COLLECTION.REPORT).concat(report.reportID)] = report,
                _a);
            return ((0, waitForBatchedUpdates_1.default)()
                // When Onyx is updated to contain that data and the sidebar re-renders
                .then(function () {
                var _a;
                return react_native_onyx_1.default.multiSet(__assign((_a = {}, _a[ONYXKEYS.BETAS] = [], _a[ONYXKEYS.PERSONAL_DETAILS_LIST] = LHNTestUtils.fakePersonalDetails, _a[ONYXKEYS.IS_LOADING_APP] = false, _a), reportCollectionDataSet));
            })
                // Then the report appears in the LHN
                .then(function () {
                var optionRows = react_native_1.screen.queryAllByAccessibilityHint((0, TestHelper_1.getNavigateToChatHintRegex)());
                expect(optionRows).toHaveLength(1);
            }));
        });
        it('includes or excludes default policy rooms depending on the beta', function () {
            var _a;
            LHNTestUtils.getDefaultRenderedSidebarLinks();
            // Given three reports with the three different types of default policy rooms
            // and the user not being in any betas
            var report1 = __assign(__assign({}, LHNTestUtils.getFakeReport()), { chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_ADMINS });
            var report2 = __assign(__assign({}, LHNTestUtils.getFakeReport([3, 4])), { chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_ANNOUNCE });
            var report3 = __assign(__assign({}, LHNTestUtils.getFakeReport([5, 6])), { chatType: CONST_1.default.REPORT.CHAT_TYPE.DOMAIN_ALL });
            var reportCollectionDataSet = (_a = {},
                _a["".concat(ONYXKEYS.COLLECTION.REPORT).concat(report1.reportID)] = report1,
                _a["".concat(ONYXKEYS.COLLECTION.REPORT).concat(report2.reportID)] = report2,
                _a["".concat(ONYXKEYS.COLLECTION.REPORT).concat(report3.reportID)] = report3,
                _a);
            return ((0, waitForBatchedUpdates_1.default)()
                // When Onyx is updated to contain that data and the sidebar re-renders
                .then(function () {
                var _a;
                return react_native_onyx_1.default.multiSet(__assign((_a = {}, _a[ONYXKEYS.BETAS] = [], _a[ONYXKEYS.PERSONAL_DETAILS_LIST] = LHNTestUtils.fakePersonalDetails, _a[ONYXKEYS.IS_LOADING_APP] = false, _a), reportCollectionDataSet));
            })
                // Then all non-domain rooms are rendered in the LHN
                .then(function () {
                var optionRows = react_native_1.screen.queryAllByAccessibilityHint((0, TestHelper_1.getNavigateToChatHintRegex)());
                expect(optionRows).toHaveLength(2);
            })
                // When the user is added to the default policy rooms beta and the sidebar re-renders
                .then(function () {
                var _a;
                return react_native_onyx_1.default.multiSet((_a = {},
                    _a[ONYXKEYS.BETAS] = [CONST_1.default.BETAS.DEFAULT_ROOMS],
                    _a));
            })
                // Then all three reports are showing in the LHN
                .then(function () {
                var optionRows = react_native_1.screen.queryAllByAccessibilityHint((0, TestHelper_1.getNavigateToChatHintRegex)());
                expect(optionRows).toHaveLength(3);
            }));
        });
        it('includes default policy rooms for free policies, regardless of the beta', function () {
            var _a;
            LHNTestUtils.getDefaultRenderedSidebarLinks();
            // Given a default policy room report on a free policy
            // and the user not being in any betas
            var policy = {
                policyID: '1',
                type: CONST_1.default.POLICY.TYPE.TEAM,
            };
            var report = __assign(__assign({}, LHNTestUtils.getFakeReport()), { chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_ADMINS, policyID: policy.policyID });
            var reportCollectionDataSet = (_a = {},
                _a["".concat(ONYXKEYS.COLLECTION.REPORT).concat(report.reportID)] = report,
                _a);
            return ((0, waitForBatchedUpdates_1.default)()
                // When Onyx is updated to contain that data and the sidebar re-renders
                .then(function () {
                var _a;
                return react_native_onyx_1.default.multiSet(__assign((_a = {}, _a[ONYXKEYS.BETAS] = [], _a[ONYXKEYS.PERSONAL_DETAILS_LIST] = LHNTestUtils.fakePersonalDetails, _a[ONYXKEYS.IS_LOADING_APP] = false, _a["".concat(ONYXKEYS.COLLECTION.POLICY).concat(policy.policyID)] = policy, _a), reportCollectionDataSet));
            })
                // Then the report is rendered in the LHN
                .then(function () {
                var optionRows = react_native_1.screen.queryAllByAccessibilityHint((0, TestHelper_1.getNavigateToChatHintRegex)());
                expect(optionRows).toHaveLength(1);
            })
                // When the policy is a paid policy
                .then(function () { return react_native_onyx_1.default.merge("".concat(ONYXKEYS.COLLECTION.POLICY).concat(policy.policyID), { type: CONST_1.default.POLICY.TYPE.CORPORATE }); })
                // Then the report is still rendered in the LHN
                .then(function () {
                var optionRows = react_native_1.screen.queryAllByAccessibilityHint((0, TestHelper_1.getNavigateToChatHintRegex)());
                expect(optionRows).toHaveLength(1);
            }));
        });
        it('filter paycheck and bill report', function () {
            var _a;
            var report1 = __assign(__assign({}, LHNTestUtils.getFakeReport()), { type: CONST_1.default.REPORT.UNSUPPORTED_TYPE.PAYCHECK });
            var report2 = __assign(__assign({}, LHNTestUtils.getFakeReport()), { type: CONST_1.default.REPORT.UNSUPPORTED_TYPE.BILL, errorFields: {
                    notFound: {
                        error: 'Report not found',
                    },
                } });
            var report3 = LHNTestUtils.getFakeReport();
            LHNTestUtils.getDefaultRenderedSidebarLinks(report1.reportID);
            var reportCollectionDataSet = (_a = {},
                _a["".concat(ONYXKEYS.COLLECTION.REPORT).concat(report1.reportID)] = report1,
                _a["".concat(ONYXKEYS.COLLECTION.REPORT).concat(report2.reportID)] = report2,
                _a["".concat(ONYXKEYS.COLLECTION.REPORT).concat(report3.reportID)] = report3,
                _a);
            return ((0, waitForBatchedUpdates_1.default)()
                .then(function () { return react_native_onyx_1.default.multiSet(reportCollectionDataSet); })
                // Then the reports 1 and 2 are hidden and 3 is not
                .then(function () {
                var optionRows = react_native_1.screen.queryAllByAccessibilityHint((0, TestHelper_1.getNavigateToChatHintRegex)());
                expect(optionRows).toHaveLength(1);
            }));
        });
        // NOTE: This is also for #focus mode, should we move this test block?
        describe('all combinations of isArchived, isUserCreatedPolicyRoom, hasAddWorkspaceError, isUnread, isPinned, hasDraft', function () {
            // Given a report that is the active report and doesn't change
            var report1 = LHNTestUtils.getFakeReport([3, 4]);
            // Given a free policy that doesn't change
            var policy = {
                name: 'Policy One',
                policyID: '1',
                type: CONST_1.default.POLICY.TYPE.TEAM,
            };
            // Given the user is in all betas
            var betas = [CONST_1.default.BETAS.DEFAULT_ROOMS];
            // Given there are 6 boolean variables tested in the filtering logic:
            // 1. isArchived
            // 2. isUserCreatedPolicyRoom
            // 3. hasAddWorkspaceError
            // 4. isUnread
            // 5. isPinned
            // 6. hasDraft
            // Given these combinations of booleans which result in the report being filtered out (not shown).
            var booleansWhichRemovesActiveReport = [
                JSON.stringify([false, false, false, false, false, false]),
                JSON.stringify([false, true, false, false, false, false]),
                JSON.stringify([true, false, false, false, false, false]),
                JSON.stringify([true, true, false, false, false, false]),
            ];
            // When every single combination of those booleans is tested
            // Taken from https://stackoverflow.com/a/39734979/9114791 to generate all possible boolean combinations
            var AMOUNT_OF_VARIABLES = 6;
            var _loop_1 = function (i) {
                var boolArr = [];
                for (var j = AMOUNT_OF_VARIABLES - 1; j >= 0; j--) {
                    // eslint-disable-next-line no-bitwise
                    boolArr.push(!!(i & (1 << j)));
                }
                // To test a failing set of conditions, comment out the for loop above and then use a hardcoded array
                // for the specific case that's failing. You can then debug the code to see why the test is not passing.
                // const boolArr = [false, false, false, false, false];
                it("the booleans ".concat(JSON.stringify(boolArr)), function () {
                    var _a;
                    var isArchived = boolArr[0], isUserCreatedPolicyRoom = boolArr[1], hasAddWorkspaceError = boolArr[2], isUnread = boolArr[3], isPinned = boolArr[4];
                    var report2 = __assign(__assign({}, LHNTestUtils.getAdvancedFakeReport(isArchived, isUserCreatedPolicyRoom, hasAddWorkspaceError, isUnread, isPinned)), { policyID: policy.policyID });
                    LHNTestUtils.getDefaultRenderedSidebarLinks(report1.reportID);
                    var reportCollectionDataSet = (_a = {},
                        _a["".concat(ONYXKEYS.COLLECTION.REPORT).concat(report1.reportID)] = report1,
                        _a["".concat(ONYXKEYS.COLLECTION.REPORT).concat(report2.reportID)] = report2,
                        _a);
                    return ((0, waitForBatchedUpdates_1.default)()
                        // When Onyx is updated to contain that data and the sidebar re-renders
                        .then(function () {
                        var _a;
                        return react_native_onyx_1.default.multiSet(__assign((_a = {}, _a[ONYXKEYS.NVP_PRIORITY_MODE] = CONST_1.default.PRIORITY_MODE.GSD, _a[ONYXKEYS.BETAS] = betas, _a[ONYXKEYS.PERSONAL_DETAILS_LIST] = LHNTestUtils.fakePersonalDetails, _a[ONYXKEYS.IS_LOADING_APP] = false, _a["".concat(ONYXKEYS.COLLECTION.POLICY).concat(policy.policyID)] = policy, _a), reportCollectionDataSet));
                    })
                        // Then depending on the outcome, either one or two reports are visible
                        .then(function () {
                        if (booleansWhichRemovesActiveReport.indexOf(JSON.stringify(boolArr)) > -1) {
                            // Only one report visible
                            var displayNamesHintText = (0, Localize_1.translateLocal)('accessibilityHints.chatUserDisplayNames');
                            var displayNames = react_native_1.screen.queryAllByLabelText(displayNamesHintText);
                            expect(react_native_1.screen.queryAllByAccessibilityHint((0, TestHelper_1.getNavigateToChatHintRegex)())).toHaveLength(1);
                            expect(displayNames).toHaveLength(1);
                            expect(react_native_1.screen.getByText('One, Two')).toBeOnTheScreen();
                        }
                        else {
                            // Both reports visible
                            expect(react_native_1.screen.queryAllByAccessibilityHint((0, TestHelper_1.getNavigateToChatHintRegex)())).toHaveLength(2);
                        }
                    }));
                });
            };
            // eslint-disable-next-line no-bitwise
            for (var i = 0; i < 1 << AMOUNT_OF_VARIABLES; i++) {
                _loop_1(i);
            }
        });
    });
    describe('in #focus mode', function () {
        it('hides unread chats', function () {
            var _a;
            // Given the sidebar is rendered in #focus mode (hides read chats)
            // with report 1 and 2 having unread actions
            var report1 = LHNTestUtils.getFakeReport([1, 2], 0, true);
            var report2 = LHNTestUtils.getFakeReport([3, 4], 0, true);
            var report3 = LHNTestUtils.getFakeReport([5, 6]);
            LHNTestUtils.getDefaultRenderedSidebarLinks(report1.reportID);
            var reportCollectionDataSet = (_a = {},
                _a["".concat(ONYXKEYS.COLLECTION.REPORT).concat(report1.reportID)] = report1,
                _a["".concat(ONYXKEYS.COLLECTION.REPORT).concat(report2.reportID)] = report2,
                _a["".concat(ONYXKEYS.COLLECTION.REPORT).concat(report3.reportID)] = report3,
                _a);
            return ((0, waitForBatchedUpdates_1.default)()
                // When Onyx is updated to contain that data and the sidebar re-renders
                .then(function () {
                var _a;
                return react_native_onyx_1.default.multiSet(__assign((_a = {}, _a[ONYXKEYS.NVP_PRIORITY_MODE] = CONST_1.default.PRIORITY_MODE.GSD, _a[ONYXKEYS.PERSONAL_DETAILS_LIST] = LHNTestUtils.fakePersonalDetails, _a[ONYXKEYS.IS_LOADING_APP] = false, _a), reportCollectionDataSet));
            })
                // Then the reports 1 and 2 are shown and 3 is not
                .then(function () {
                var hintText = (0, Localize_1.translateLocal)('accessibilityHints.chatUserDisplayNames');
                var displayNames = react_native_1.screen.queryAllByLabelText(hintText);
                expect(displayNames).toHaveLength(2);
                expect(react_native_1.screen.getByText('One, Two')).toBeOnTheScreen();
                expect(react_native_1.screen.getByText('Three, Four')).toBeOnTheScreen();
            })
                // When report3 becomes unread
                .then(function () {
                jest.advanceTimersByTime(10);
                return react_native_onyx_1.default.merge("".concat(ONYXKEYS.COLLECTION.REPORT).concat(report3.reportID), { lastVisibleActionCreated: DateUtils_1.default.getDBTime() });
            })
                // Then all three chats are showing
                .then(function () {
                expect(react_native_1.screen.queryAllByAccessibilityHint((0, TestHelper_1.getNavigateToChatHintRegex)())).toHaveLength(3);
            })
                // When report 1 becomes read (it's the active report)
                .then(function () { return react_native_onyx_1.default.merge("".concat(ONYXKEYS.COLLECTION.REPORT).concat(report1.reportID), { lastReadTime: DateUtils_1.default.getDBTime() }); })
                // Then all three chats are still showing
                .then(function () {
                expect(react_native_1.screen.queryAllByAccessibilityHint((0, TestHelper_1.getNavigateToChatHintRegex)())).toHaveLength(3);
            })
                // When report 2 becomes the active report
                .then(function () {
                LHNTestUtils.getDefaultRenderedSidebarLinks(report2.reportID);
                return (0, waitForBatchedUpdates_1.default)();
            })
                // Then report 1 should now disappear
                .then(function () {
                expect(react_native_1.screen.queryAllByAccessibilityHint((0, TestHelper_1.getNavigateToChatHintRegex)())).toHaveLength(2);
                expect(react_native_1.screen.queryAllByText(/One, Two/)).toHaveLength(0);
            }));
        });
        it('always shows pinned and draft chats', function () {
            var _a;
            // Given a draft report and a pinned report
            var draftReport = __assign({}, LHNTestUtils.getFakeReport([1, 2]));
            var pinnedReport = __assign(__assign({}, LHNTestUtils.getFakeReport([3, 4])), { isPinned: true });
            LHNTestUtils.getDefaultRenderedSidebarLinks(draftReport.reportID);
            var reportCollectionDataSet = (_a = {},
                _a["".concat(ONYXKEYS.COLLECTION.REPORT).concat(draftReport.reportID)] = draftReport,
                _a["".concat(ONYXKEYS.COLLECTION.REPORT).concat(pinnedReport.reportID)] = pinnedReport,
                _a);
            return ((0, waitForBatchedUpdates_1.default)()
                // When Onyx is updated to contain that data and the sidebar re-renders
                .then(function () {
                var _a;
                return react_native_onyx_1.default.multiSet(__assign((_a = {}, _a[ONYXKEYS.NVP_PRIORITY_MODE] = CONST_1.default.PRIORITY_MODE.GSD, _a[ONYXKEYS.PERSONAL_DETAILS_LIST] = LHNTestUtils.fakePersonalDetails, _a[ONYXKEYS.IS_LOADING_APP] = false, _a["".concat(ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT).concat(draftReport.reportID)] = 'draft report message', _a), reportCollectionDataSet));
            })
                // Then both reports are visible
                .then(function () {
                var hintText = (0, Localize_1.translateLocal)('accessibilityHints.chatUserDisplayNames');
                var displayNames = react_native_1.screen.queryAllByLabelText(hintText);
                expect(displayNames).toHaveLength(2);
                expect(react_native_1.screen.getByText('One, Two')).toBeOnTheScreen();
                expect(react_native_1.screen.getByText('Three, Four')).toBeOnTheScreen();
            }));
        });
        it('archived rooms are displayed only when they have unread messages', function () {
            var _a;
            // Given an archived chat report, an archived default policy room, and an archived user created policy room
            var archivedReport = __assign(__assign({}, LHNTestUtils.getFakeReport([1, 2])), { statusNum: CONST_1.default.REPORT.STATUS_NUM.CLOSED, stateNum: CONST_1.default.REPORT.STATE_NUM.APPROVED });
            var archivedPolicyRoomReport = __assign(__assign({}, LHNTestUtils.getFakeReport([1, 2])), { chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_ANNOUNCE, statusNum: CONST_1.default.REPORT.STATUS_NUM.CLOSED, stateNum: CONST_1.default.REPORT.STATE_NUM.APPROVED });
            var archivedUserCreatedPolicyRoomReport = __assign(__assign({}, LHNTestUtils.getFakeReport([1, 2])), { chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_ROOM, statusNum: CONST_1.default.REPORT.STATUS_NUM.CLOSED, stateNum: CONST_1.default.REPORT.STATE_NUM.APPROVED });
            LHNTestUtils.getDefaultRenderedSidebarLinks();
            var betas = [CONST_1.default.BETAS.DEFAULT_ROOMS];
            var reportCollectionDataSet = (_a = {},
                _a["".concat(ONYXKEYS.COLLECTION.REPORT).concat(archivedReport.reportID)] = archivedReport,
                _a["".concat(ONYXKEYS.COLLECTION.REPORT).concat(archivedPolicyRoomReport.reportID)] = archivedPolicyRoomReport,
                _a["".concat(ONYXKEYS.COLLECTION.REPORT).concat(archivedUserCreatedPolicyRoomReport.reportID)] = archivedUserCreatedPolicyRoomReport,
                _a);
            return ((0, waitForBatchedUpdates_1.default)()
                // When Onyx is updated to contain that data and the sidebar re-renders
                .then(function () {
                var _a;
                return react_native_onyx_1.default.multiSet(__assign((_a = {}, _a[ONYXKEYS.NVP_PRIORITY_MODE] = CONST_1.default.PRIORITY_MODE.GSD, _a[ONYXKEYS.BETAS] = betas, _a[ONYXKEYS.PERSONAL_DETAILS_LIST] = LHNTestUtils.fakePersonalDetails, _a[ONYXKEYS.IS_LOADING_APP] = false, _a), reportCollectionDataSet));
            })
                // Then neither reports are visible
                .then(function () {
                var hintText = (0, Localize_1.translateLocal)('accessibilityHints.chatUserDisplayNames');
                var displayNames = react_native_1.screen.queryAllByLabelText(hintText);
                expect(displayNames).toHaveLength(0);
            })
                // When they have unread messages
                .then(function () {
                jest.advanceTimersByTime(10);
                return react_native_onyx_1.default.merge("".concat(ONYXKEYS.COLLECTION.REPORT).concat(archivedReport.reportID), {
                    lastVisibleActionCreated: DateUtils_1.default.getDBTime(),
                });
            })
                .then(function () {
                return react_native_onyx_1.default.merge("".concat(ONYXKEYS.COLLECTION.REPORT).concat(archivedPolicyRoomReport.reportID), {
                    lastVisibleActionCreated: DateUtils_1.default.getDBTime(),
                });
            })
                .then(function () {
                return react_native_onyx_1.default.merge("".concat(ONYXKEYS.COLLECTION.REPORT).concat(archivedUserCreatedPolicyRoomReport.reportID), {
                    lastVisibleActionCreated: DateUtils_1.default.getDBTime(),
                });
            })
                // Then they are all visible
                .then(function () {
                var hintText = (0, Localize_1.translateLocal)('accessibilityHints.chatUserDisplayNames');
                var displayNames = react_native_1.screen.queryAllByLabelText(hintText);
                expect(displayNames).toHaveLength(3);
            }));
        });
        it('policy rooms are displayed only when they have unread messages', function () {
            var _a;
            // Given a default policy room and user created policy room
            var policyRoomReport = __assign(__assign({}, LHNTestUtils.getFakeReport([1, 2])), { chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_ANNOUNCE });
            var userCreatedPolicyRoomReport = __assign(__assign({}, LHNTestUtils.getFakeReport([1, 2])), { chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_ROOM });
            LHNTestUtils.getDefaultRenderedSidebarLinks();
            var betas = [CONST_1.default.BETAS.DEFAULT_ROOMS];
            var reportCollectionDataSet = (_a = {},
                _a["".concat(ONYXKEYS.COLLECTION.REPORT).concat(policyRoomReport.reportID)] = policyRoomReport,
                _a["".concat(ONYXKEYS.COLLECTION.REPORT).concat(userCreatedPolicyRoomReport.reportID)] = userCreatedPolicyRoomReport,
                _a);
            return ((0, waitForBatchedUpdates_1.default)()
                // When Onyx is updated to contain that data and the sidebar re-renders
                .then(function () {
                var _a;
                return react_native_onyx_1.default.multiSet(__assign((_a = {}, _a[ONYXKEYS.NVP_PRIORITY_MODE] = CONST_1.default.PRIORITY_MODE.GSD, _a[ONYXKEYS.BETAS] = betas, _a[ONYXKEYS.PERSONAL_DETAILS_LIST] = LHNTestUtils.fakePersonalDetails, _a[ONYXKEYS.IS_LOADING_APP] = false, _a), reportCollectionDataSet));
            })
                // Then neither reports are visible
                .then(function () {
                var hintText = (0, Localize_1.translateLocal)('accessibilityHints.chatUserDisplayNames');
                var displayNames = react_native_1.screen.queryAllByLabelText(hintText);
                expect(displayNames).toHaveLength(0);
            })
                // When they both have unread messages
                .then(function () {
                jest.advanceTimersByTime(10);
                return react_native_onyx_1.default.merge("".concat(ONYXKEYS.COLLECTION.REPORT).concat(policyRoomReport.reportID), {
                    lastVisibleActionCreated: DateUtils_1.default.getDBTime(),
                });
            })
                .then(function () {
                return react_native_onyx_1.default.merge("".concat(ONYXKEYS.COLLECTION.REPORT).concat(userCreatedPolicyRoomReport.reportID), {
                    lastVisibleActionCreated: DateUtils_1.default.getDBTime(),
                });
            })
                // Then both rooms are visible
                .then(function () {
                var hintText = (0, Localize_1.translateLocal)('accessibilityHints.chatUserDisplayNames');
                var displayNames = react_native_1.screen.queryAllByLabelText(hintText);
                expect(displayNames).toHaveLength(2);
            }));
        });
    });
    describe('all combinations of isArchived, isUserCreatedPolicyRoom, hasAddWorkspaceError, isUnread, isPinned, hasDraft', function () {
        // Given a report that is the active report and doesn't change
        var report1 = LHNTestUtils.getFakeReport([3, 4]);
        // Given a free policy that doesn't change
        var policy = {
            name: 'Policy One',
            policyID: '1',
            type: CONST_1.default.POLICY.TYPE.TEAM,
        };
        // Given the user is in all betas
        var betas = [CONST_1.default.BETAS.DEFAULT_ROOMS];
        // Given there are 6 boolean variables tested in the filtering logic:
        // 1. isArchived
        // 2. isUserCreatedPolicyRoom
        // 3. hasAddWorkspaceError
        // 4. isUnread
        // 5. isPinned
        // 6. hasDraft
        // Given these combinations of booleans which result in the report being filtered out (not shown).
        var booleansWhichRemovesActiveReport = [
            JSON.stringify([false, false, false, false, false, false]),
            JSON.stringify([false, true, false, false, false, false]),
            JSON.stringify([true, false, false, false, false, false]),
            JSON.stringify([true, true, false, false, false, false]),
        ];
        // When every single combination of those booleans is tested
        // Taken from https://stackoverflow.com/a/39734979/9114791 to generate all possible boolean combinations
        var AMOUNT_OF_VARIABLES = 6;
        var _loop_2 = function (i) {
            var boolArr = [];
            for (var j = AMOUNT_OF_VARIABLES - 1; j >= 0; j--) {
                // eslint-disable-next-line no-bitwise
                boolArr.push(!!(i & (1 << j)));
            }
            // To test a failing set of conditions, comment out the for loop above and then use a hardcoded array
            // for the specific case that's failing. You can then debug the code to see why the test is not passing.
            // const boolArr = [false, false, false, true, false, false, false];
            it("the booleans ".concat(JSON.stringify(boolArr)), function () {
                var _a;
                var isArchived = boolArr[0], isUserCreatedPolicyRoom = boolArr[1], hasAddWorkspaceError = boolArr[2], isUnread = boolArr[3], isPinned = boolArr[4], hasDraft = boolArr[5];
                var report2 = __assign(__assign({}, LHNTestUtils.getAdvancedFakeReport(isArchived, isUserCreatedPolicyRoom, hasAddWorkspaceError, isUnread, isPinned)), { policyID: policy.policyID });
                LHNTestUtils.getDefaultRenderedSidebarLinks(report1.reportID);
                var reportCollectionDataSet = (_a = {},
                    _a["".concat(ONYXKEYS.COLLECTION.REPORT).concat(report1.reportID)] = report1,
                    _a["".concat(ONYXKEYS.COLLECTION.REPORT).concat(report2.reportID)] = report2,
                    _a);
                return ((0, waitForBatchedUpdates_1.default)()
                    // When Onyx is updated to contain that data and the sidebar re-renders
                    .then(function () {
                    var _a;
                    return react_native_onyx_1.default.multiSet(__assign((_a = {}, _a[ONYXKEYS.NVP_PRIORITY_MODE] = CONST_1.default.PRIORITY_MODE.GSD, _a[ONYXKEYS.BETAS] = betas, _a[ONYXKEYS.PERSONAL_DETAILS_LIST] = LHNTestUtils.fakePersonalDetails, _a[ONYXKEYS.IS_LOADING_APP] = false, _a["".concat(ONYXKEYS.COLLECTION.POLICY).concat(policy.policyID)] = policy, _a["".concat(ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT).concat(report2.reportID)] = hasDraft ? 'report2 draft' : null, _a), reportCollectionDataSet));
                })
                    // Then depending on the outcome, either one or two reports are visible
                    .then(function () {
                    if (booleansWhichRemovesActiveReport.indexOf(JSON.stringify(boolArr)) > -1) {
                        // Only one report visible
                        var displayNamesHintText = (0, Localize_1.translateLocal)('accessibilityHints.chatUserDisplayNames');
                        var displayNames = react_native_1.screen.queryAllByLabelText(displayNamesHintText);
                        expect(react_native_1.screen.queryAllByAccessibilityHint((0, TestHelper_1.getNavigateToChatHintRegex)())).toHaveLength(1);
                        expect(displayNames).toHaveLength(1);
                        expect(react_native_1.screen.getByText('One, Two')).toBeOnTheScreen();
                    }
                    else {
                        // Both reports visible
                        expect(react_native_1.screen.queryAllByAccessibilityHint((0, TestHelper_1.getNavigateToChatHintRegex)())).toHaveLength(2);
                    }
                }));
            });
        };
        // eslint-disable-next-line no-bitwise
        for (var i = 0; i < 1 << AMOUNT_OF_VARIABLES; i++) {
            _loop_2(i);
        }
    });
    describe('Archived chat', function () {
        describe('in default (most recent) mode', function () {
            it('is shown regardless if it has comments or not', function () {
                var _a;
                LHNTestUtils.getDefaultRenderedSidebarLinks();
                // Given an archived report with no comments
                var report = __assign(__assign({}, LHNTestUtils.getFakeReport()), { lastVisibleActionCreated: '2022-11-22 03:48:27.267', statusNum: CONST_1.default.REPORT.STATUS_NUM.CLOSED, stateNum: CONST_1.default.REPORT.STATE_NUM.APPROVED });
                // Given the user is in all betas
                var betas = [CONST_1.default.BETAS.DEFAULT_ROOMS];
                var reportCollectionDataSet = (_a = {},
                    _a["".concat(ONYXKEYS.COLLECTION.REPORT).concat(report.reportID)] = report,
                    _a);
                return ((0, waitForBatchedUpdates_1.default)()
                    // When Onyx is updated to contain that data and the sidebar re-renders
                    .then(function () {
                    var _a;
                    return react_native_onyx_1.default.multiSet(__assign((_a = {}, _a[ONYXKEYS.NVP_PRIORITY_MODE] = CONST_1.default.PRIORITY_MODE.DEFAULT, _a[ONYXKEYS.BETAS] = betas, _a[ONYXKEYS.PERSONAL_DETAILS_LIST] = LHNTestUtils.fakePersonalDetails, _a[ONYXKEYS.IS_LOADING_APP] = false, _a), reportCollectionDataSet));
                })
                    // Then the report is rendered in the LHN
                    .then(function () {
                    var optionRows = react_native_1.screen.queryAllByAccessibilityHint((0, TestHelper_1.getNavigateToChatHintRegex)());
                    expect(optionRows).toHaveLength(1);
                })
                    // When the report has comments
                    .then(function () {
                    return react_native_onyx_1.default.merge("".concat(ONYXKEYS.COLLECTION.REPORT).concat(report.reportID), {
                        lastVisibleActionCreated: DateUtils_1.default.getDBTime(),
                    });
                })
                    // Then the report is rendered in the LHN
                    .then(function () {
                    var optionRows = react_native_1.screen.queryAllByAccessibilityHint((0, TestHelper_1.getNavigateToChatHintRegex)());
                    expect(optionRows).toHaveLength(1);
                }));
            });
        });
        describe('in GSD (focus) mode', function () {
            it('is shown when it is unread', function () {
                var _a;
                LHNTestUtils.getDefaultRenderedSidebarLinks();
                // Given an archived report that has all comments read
                var report = __assign(__assign({}, LHNTestUtils.getFakeReport()), { statusNum: CONST_1.default.REPORT.STATUS_NUM.CLOSED, stateNum: CONST_1.default.REPORT.STATE_NUM.APPROVED });
                // Given the user is in all betas
                var betas = [CONST_1.default.BETAS.DEFAULT_ROOMS];
                var reportCollectionDataSet = (_a = {},
                    _a["".concat(ONYXKEYS.COLLECTION.REPORT).concat(report.reportID)] = report,
                    _a);
                return ((0, waitForBatchedUpdates_1.default)()
                    // When Onyx is updated to contain that data and the sidebar re-renders
                    .then(function () {
                    var _a;
                    return react_native_onyx_1.default.multiSet(__assign((_a = {}, _a[ONYXKEYS.NVP_PRIORITY_MODE] = CONST_1.default.PRIORITY_MODE.GSD, _a[ONYXKEYS.BETAS] = betas, _a[ONYXKEYS.PERSONAL_DETAILS_LIST] = LHNTestUtils.fakePersonalDetails, _a[ONYXKEYS.IS_LOADING_APP] = false, _a), reportCollectionDataSet));
                })
                    // Then the report is not rendered in the LHN
                    .then(function () {
                    var optionRows = react_native_1.screen.queryAllByAccessibilityHint((0, TestHelper_1.getNavigateToChatHintRegex)());
                    expect(optionRows).toHaveLength(0);
                })
                    // When the report has a new comment and is now unread
                    .then(function () {
                    jest.advanceTimersByTime(10);
                    return react_native_onyx_1.default.merge("".concat(ONYXKEYS.COLLECTION.REPORT).concat(report.reportID), { lastVisibleActionCreated: DateUtils_1.default.getDBTime() });
                })
                    // Then the report is rendered in the LHN
                    .then(function () {
                    var optionRows = react_native_1.screen.queryAllByAccessibilityHint((0, TestHelper_1.getNavigateToChatHintRegex)());
                    expect(optionRows).toHaveLength(1);
                }));
            });
            it('is shown when it is pinned', function () {
                var _a;
                LHNTestUtils.getDefaultRenderedSidebarLinks();
                // Given an archived report that is not pinned
                var report = __assign(__assign({}, LHNTestUtils.getFakeReport()), { isPinned: false, statusNum: CONST_1.default.REPORT.STATUS_NUM.CLOSED, stateNum: CONST_1.default.REPORT.STATE_NUM.APPROVED });
                // Given the user is in all betas
                var betas = [CONST_1.default.BETAS.DEFAULT_ROOMS];
                var reportCollectionDataSet = (_a = {},
                    _a["".concat(ONYXKEYS.COLLECTION.REPORT).concat(report.reportID)] = report,
                    _a);
                return ((0, waitForBatchedUpdates_1.default)()
                    // When Onyx is updated to contain that data and the sidebar re-renders
                    .then(function () {
                    var _a;
                    return react_native_onyx_1.default.multiSet(__assign((_a = {}, _a[ONYXKEYS.NVP_PRIORITY_MODE] = CONST_1.default.PRIORITY_MODE.GSD, _a[ONYXKEYS.BETAS] = betas, _a[ONYXKEYS.PERSONAL_DETAILS_LIST] = LHNTestUtils.fakePersonalDetails, _a[ONYXKEYS.IS_LOADING_APP] = false, _a), reportCollectionDataSet));
                })
                    // Then the report is not rendered in the LHN
                    .then(function () {
                    var optionRows = react_native_1.screen.queryAllByAccessibilityHint((0, TestHelper_1.getNavigateToChatHintRegex)());
                    expect(optionRows).toHaveLength(0);
                })
                    // When the report is pinned
                    .then(function () { return react_native_onyx_1.default.merge("".concat(ONYXKEYS.COLLECTION.REPORT).concat(report.reportID), { isPinned: true }); })
                    // Then the report is rendered in the LHN
                    .then(function () {
                    var optionRows = react_native_1.screen.queryAllByAccessibilityHint((0, TestHelper_1.getNavigateToChatHintRegex)());
                    expect(optionRows).toHaveLength(1);
                }));
            });
            it('is shown when it is the active report', function () {
                var _a;
                LHNTestUtils.getDefaultRenderedSidebarLinks();
                // Given an archived report that is not the active report
                var report = __assign(__assign({}, LHNTestUtils.getFakeReport()), { statusNum: CONST_1.default.REPORT.STATUS_NUM.CLOSED, stateNum: CONST_1.default.REPORT.STATE_NUM.APPROVED });
                // Given the user is in all betas
                var betas = [CONST_1.default.BETAS.DEFAULT_ROOMS];
                var reportCollectionDataSet = (_a = {},
                    _a["".concat(ONYXKEYS.COLLECTION.REPORT).concat(report.reportID)] = report,
                    _a);
                return ((0, waitForBatchedUpdates_1.default)()
                    // When Onyx is updated to contain that data and the sidebar re-renders
                    .then(function () {
                    var _a;
                    return react_native_onyx_1.default.multiSet(__assign((_a = {}, _a[ONYXKEYS.NVP_PRIORITY_MODE] = CONST_1.default.PRIORITY_MODE.GSD, _a[ONYXKEYS.BETAS] = betas, _a[ONYXKEYS.PERSONAL_DETAILS_LIST] = LHNTestUtils.fakePersonalDetails, _a[ONYXKEYS.IS_LOADING_APP] = false, _a), reportCollectionDataSet));
                })
                    // Then the report is not rendered in the LHN
                    .then(function () {
                    var optionRows = react_native_1.screen.queryAllByAccessibilityHint((0, TestHelper_1.getNavigateToChatHintRegex)());
                    expect(optionRows).toHaveLength(0);
                })
                    // When sidebar is rendered with the active report ID matching the archived report in Onyx
                    .then(function () {
                    LHNTestUtils.getDefaultRenderedSidebarLinks(report.reportID);
                    return (0, waitForBatchedUpdates_1.default)();
                })
                    // Then the report is rendered in the LHN
                    .then(function () {
                    var optionRows = react_native_1.screen.queryAllByAccessibilityHint((0, TestHelper_1.getNavigateToChatHintRegex)());
                    expect(optionRows).toHaveLength(1);
                }));
            });
            it('display empty state', function () {
                var reportCollectionDataSet = {};
                LHNTestUtils.getDefaultRenderedSidebarLinks();
                return ((0, waitForBatchedUpdates_1.default)()
                    // When Onyx is updated to contain that data and the sidebar re-renders
                    .then(function () {
                    var _a;
                    return react_native_onyx_1.default.multiSet(__assign((_a = {}, _a[ONYXKEYS.NVP_PRIORITY_MODE] = CONST_1.default.PRIORITY_MODE.GSD, _a[ONYXKEYS.PERSONAL_DETAILS_LIST] = LHNTestUtils.fakePersonalDetails, _a[ONYXKEYS.IS_LOADING_APP] = false, _a), reportCollectionDataSet));
                })
                    .then(function () {
                    expect(react_native_1.screen.getByText((0, Localize_1.translateLocal)('common.emptyLHN.title'))).toBeOnTheScreen();
                }));
            });
        });
    });
});
