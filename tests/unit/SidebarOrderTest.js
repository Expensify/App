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
var Report_1 = require("@libs/actions/Report");
var DateUtils_1 = require("@libs/DateUtils");
var Localize_1 = require("@libs/Localize");
var OnyxDerived_1 = require("@userActions/OnyxDerived");
var CONST_1 = require("@src/CONST");
var IntlStore_1 = require("@src/languages/IntlStore");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var LHNTestUtils = require("../utils/LHNTestUtils");
var TestHelper = require("../utils/TestHelper");
var waitForBatchedUpdates_1 = require("../utils/waitForBatchedUpdates");
var wrapOnyxWithWaitForBatchedUpdates_1 = require("../utils/wrapOnyxWithWaitForBatchedUpdates");
// Be sure to include the mocked Permissions and Expensicons libraries or else the beta tests won't work
jest.mock('@libs/Permissions');
jest.mock('@components/Icon/Expensicons');
jest.mock('@src/hooks/useResponsiveLayout');
jest.mock('@react-navigation/native', function () { return (__assign(__assign({}, jest.requireActual('@react-navigation/native')), { useNavigationState: function () { return true; }, useIsFocused: function () { return true; }, useRoute: function () { return ({ name: 'Home' }); }, useNavigation: function () { return undefined; }, useFocusEffect: function () { return undefined; } })); });
describe('Sidebar', function () {
    beforeAll(function () {
        react_native_onyx_1.default.init({
            keys: ONYXKEYS_1.default,
            evictableKeys: [ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS],
        });
        (0, OnyxDerived_1.default)();
        IntlStore_1.default.load(CONST_1.default.LOCALES.EN);
        return (0, waitForBatchedUpdates_1.default)();
    });
    beforeEach(function () {
        // Wrap Onyx each onyx action with waitForBatchedUpdates
        (0, wrapOnyxWithWaitForBatchedUpdates_1.default)(react_native_onyx_1.default);
        // Initialize the network key for OfflineWithFeedback
        return TestHelper.signInWithTestUser(1, 'email1@test.com', undefined, undefined, 'One').then(function () { return react_native_onyx_1.default.merge(ONYXKEYS_1.default.NETWORK, { isOffline: false }); });
    });
    // Clear out Onyx after each test so that each test starts with a clean slate
    afterEach(function () {
        react_native_onyx_1.default.clear();
    });
    describe('in default mode', function () {
        it('is not rendered when there are no props passed to it', function () {
            // Given all the default props are passed to SidebarLinks
            // When it is rendered
            LHNTestUtils.getDefaultRenderedSidebarLinks();
            // Then it should render nothing and be null
            // This is expected because there is an early return when there are no personal details
            expect(react_native_1.screen.toJSON()).toBe(null);
        });
        it('is rendered with an empty list when personal details exist', function () {
            return (0, waitForBatchedUpdates_1.default)()
                // Given the sidebar is rendered with default props
                .then(function () { return LHNTestUtils.getDefaultRenderedSidebarLinks(); })
                // When Onyx is updated with some personal details
                .then(function () {
                var _a;
                return react_native_onyx_1.default.multiSet((_a = {},
                    _a[ONYXKEYS_1.default.PERSONAL_DETAILS_LIST] = LHNTestUtils.fakePersonalDetails,
                    _a[ONYXKEYS_1.default.IS_LOADING_APP] = false,
                    _a));
            })
                // Then the component should be rendered with an empty list since it will get past the early return
                .then(function () {
                expect(react_native_1.screen.toJSON()).not.toBe(null);
                expect(react_native_1.screen.queryAllByAccessibilityHint(TestHelper.getNavigateToChatHintRegex())).toHaveLength(0);
            });
        });
        it('contains one report when a report is in Onyx', function () {
            var _a;
            // Given a single report
            var report = LHNTestUtils.getFakeReport([1, 2]);
            var reportCollectionDataSet = (_a = {},
                _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report.reportID)] = report,
                _a);
            return ((0, waitForBatchedUpdates_1.default)()
                .then(function () { return LHNTestUtils.getDefaultRenderedSidebarLinks(report.reportID); })
                // When Onyx is updated with the data and the sidebar re-renders
                .then(function () {
                var _a;
                return react_native_onyx_1.default.multiSet(__assign((_a = {}, _a[ONYXKEYS_1.default.NVP_PRIORITY_MODE] = CONST_1.default.PRIORITY_MODE.DEFAULT, _a[ONYXKEYS_1.default.PERSONAL_DETAILS_LIST] = LHNTestUtils.fakePersonalDetails, _a[ONYXKEYS_1.default.IS_LOADING_APP] = false, _a), reportCollectionDataSet));
            })
                // Then the component should be rendered with an item for the report
                .then(function () {
                expect(react_native_1.screen.queryAllByText('Email Two')).toHaveLength(1);
            }));
        });
        it('orders items with most recently updated on top', function () {
            var _a;
            // Given three unread reports in the recently updated order of 3, 2, 1
            var report1 = LHNTestUtils.getFakeReport([1, 2], 3);
            var report2 = LHNTestUtils.getFakeReport([1, 3], 2);
            var report3 = LHNTestUtils.getFakeReport([1, 4], 1);
            // Each report has at least one ADD_COMMENT action so should be rendered in the LNH
            (0, Report_1.addComment)(report1.reportID, 'Hi, this is a comment');
            (0, Report_1.addComment)(report2.reportID, 'Hi, this is a comment');
            (0, Report_1.addComment)(report3.reportID, 'Hi, this is a comment');
            var reportCollectionDataSet = (_a = {},
                _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report1.reportID)] = report1,
                _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report2.reportID)] = report2,
                _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report3.reportID)] = report3,
                _a);
            return ((0, waitForBatchedUpdates_1.default)()
                .then(function () { return LHNTestUtils.getDefaultRenderedSidebarLinks(); })
                // When Onyx is updated with the data and the sidebar re-renders
                .then(function () {
                var _a;
                return react_native_onyx_1.default.multiSet(__assign((_a = {}, _a[ONYXKEYS_1.default.NVP_PRIORITY_MODE] = CONST_1.default.PRIORITY_MODE.DEFAULT, _a[ONYXKEYS_1.default.PERSONAL_DETAILS_LIST] = LHNTestUtils.fakePersonalDetails, _a[ONYXKEYS_1.default.IS_LOADING_APP] = false, _a), reportCollectionDataSet));
            })
                // Then the component should be rendered with the mostly recently updated report first
                .then(function () {
                var hintText = (0, Localize_1.translateLocal)('accessibilityHints.chatUserDisplayNames');
                var displayNames = react_native_1.screen.queryAllByLabelText(hintText);
                expect(displayNames).toHaveLength(3);
                expect(displayNames.at(0)).toHaveTextContent('Email Four');
                expect(displayNames.at(1)).toHaveTextContent('Email Three');
                expect(displayNames.at(2)).toHaveTextContent('Email Two');
            }));
        });
        it('changes the order when adding a draft to the active report', function () {
            var _a;
            // Given three reports in the recently updated order of 3, 2, 1
            // And the first report has a draft
            // And the currently viewed report is the first report
            var report1 = __assign({}, LHNTestUtils.getFakeReport([1, 2], 3));
            var report2 = LHNTestUtils.getFakeReport([1, 3], 2);
            var report3 = LHNTestUtils.getFakeReport([1, 4], 1);
            // Each report has at least one ADD_COMMENT action so should be rendered in the LNH
            (0, Report_1.addComment)(report1.reportID, 'Hi, this is a comment');
            (0, Report_1.addComment)(report2.reportID, 'Hi, this is a comment');
            (0, Report_1.addComment)(report3.reportID, 'Hi, this is a comment');
            var currentReportId = report1.reportID;
            var reportCollectionDataSet = (_a = {},
                _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report1.reportID)] = report1,
                _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report2.reportID)] = report2,
                _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report3.reportID)] = report3,
                _a);
            return ((0, waitForBatchedUpdates_1.default)()
                .then(function () { return LHNTestUtils.getDefaultRenderedSidebarLinks(currentReportId); })
                // When Onyx is updated with the data and the sidebar re-renders
                .then(function () {
                var _a;
                return react_native_onyx_1.default.multiSet(__assign((_a = {}, _a[ONYXKEYS_1.default.NVP_PRIORITY_MODE] = CONST_1.default.PRIORITY_MODE.DEFAULT, _a[ONYXKEYS_1.default.PERSONAL_DETAILS_LIST] = LHNTestUtils.fakePersonalDetails, _a[ONYXKEYS_1.default.IS_LOADING_APP] = false, _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_DRAFT_COMMENT).concat(report1.reportID)] = 'report1 draft', _a), reportCollectionDataSet));
            })
                // Then there should be a pencil icon and report one should be the first one because putting a draft on the active report should change its location
                // in the ordered list
                .then(function () {
                var pencilIcon = react_native_1.screen.queryAllByTestId('Pencil Icon');
                expect(pencilIcon).toHaveLength(1);
                var hintText = (0, Localize_1.translateLocal)('accessibilityHints.chatUserDisplayNames');
                var displayNames = react_native_1.screen.queryAllByLabelText(hintText);
                expect(displayNames).toHaveLength(3);
                expect(displayNames.at(0)).toHaveTextContent('Email Two'); // this has `hasDraft` flag enabled so it will be on top
                expect(displayNames.at(1)).toHaveTextContent('Email Four');
                expect(displayNames.at(2)).toHaveTextContent('Email Three');
            }));
        });
        it('reorders the reports to always have the most recently updated one on top', function () {
            var _a;
            // Given three reports in the recently updated order of 3, 2, 1
            var report1 = LHNTestUtils.getFakeReport([1, 2], 3);
            var report2 = LHNTestUtils.getFakeReport([1, 3], 2);
            var report3 = LHNTestUtils.getFakeReport([1, 4], 1);
            // Each report has at least one ADD_COMMENT action so should be rendered in the LNH
            (0, Report_1.addComment)(report1.reportID, 'Hi, this is a comment');
            (0, Report_1.addComment)(report2.reportID, 'Hi, this is a comment');
            (0, Report_1.addComment)(report3.reportID, 'Hi, this is a comment');
            var reportCollectionDataSet = (_a = {},
                _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report1.reportID)] = report1,
                _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report2.reportID)] = report2,
                _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report3.reportID)] = report3,
                _a);
            return ((0, waitForBatchedUpdates_1.default)()
                .then(function () { return LHNTestUtils.getDefaultRenderedSidebarLinks(); })
                // When Onyx is updated with the data and the sidebar re-renders
                .then(function () {
                var _a;
                return react_native_onyx_1.default.multiSet(__assign((_a = {}, _a[ONYXKEYS_1.default.NVP_PRIORITY_MODE] = CONST_1.default.PRIORITY_MODE.DEFAULT, _a[ONYXKEYS_1.default.PERSONAL_DETAILS_LIST] = LHNTestUtils.fakePersonalDetails, _a[ONYXKEYS_1.default.IS_LOADING_APP] = false, _a), reportCollectionDataSet));
            })
                // When a new comment is added to report 1 (eg. it's lastVisibleActionCreated is updated)
                .then(function () {
                return react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report1.reportID), {
                    lastVisibleActionCreated: DateUtils_1.default.getDBTime(),
                });
            })
                // Then the order of the reports should be 1 > 3 > 2
                //                                         ^--- (1 goes to the front and pushes other two down)
                .then(function () {
                var hintText = (0, Localize_1.translateLocal)('accessibilityHints.chatUserDisplayNames');
                var displayNames = react_native_1.screen.queryAllByLabelText(hintText);
                expect(displayNames).toHaveLength(3);
                expect(displayNames.at(0)).toHaveTextContent('Email Two');
                expect(displayNames.at(1)).toHaveTextContent('Email Four');
                expect(displayNames.at(2)).toHaveTextContent('Email Three');
            }));
        });
        it('reorders the reports to have a newly created task report on top', function () {
            var _a;
            // Given three reports in the recently updated order of 3, 2, 1
            var report1 = LHNTestUtils.getFakeReport([1, 2], 4);
            var report2 = LHNTestUtils.getFakeReport([1, 3], 3);
            var report3 = LHNTestUtils.getFakeReport([1, 4], 2);
            var taskReportName = 'Buy Grocery';
            var taskReport = __assign(__assign({}, LHNTestUtils.getFakeReport([1, 2], 1)), { type: CONST_1.default.REPORT.TYPE.TASK, reportName: taskReportName, managerID: 2, stateNum: CONST_1.default.REPORT.STATE_NUM.OPEN, statusNum: CONST_1.default.REPORT.STATUS_NUM.OPEN });
            // Each report has at least one ADD_COMMENT action so should be rendered in the LNH
            (0, Report_1.addComment)(report1.reportID, 'Hi, this is a comment');
            (0, Report_1.addComment)(report2.reportID, 'Hi, this is a comment');
            (0, Report_1.addComment)(report3.reportID, 'Hi, this is a comment');
            var reportCollectionDataSet = (_a = {},
                _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report1.reportID)] = report1,
                _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report2.reportID)] = report2,
                _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report3.reportID)] = report3,
                _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(taskReport.reportID)] = taskReport,
                _a);
            return ((0, waitForBatchedUpdates_1.default)()
                .then(function () { return LHNTestUtils.getDefaultRenderedSidebarLinks(taskReport.reportID); })
                // When Onyx is updated with the data and the sidebar re-renders
                .then(function () {
                var _a;
                return react_native_onyx_1.default.multiSet(__assign((_a = {}, _a[ONYXKEYS_1.default.NVP_PRIORITY_MODE] = CONST_1.default.PRIORITY_MODE.DEFAULT, _a[ONYXKEYS_1.default.PERSONAL_DETAILS_LIST] = LHNTestUtils.fakePersonalDetails, _a[ONYXKEYS_1.default.IS_LOADING_APP] = false, _a), reportCollectionDataSet));
            })
                // Then the order of the reports should be 4 > 3 > 2 > 1
                .then(function () {
                var hintText = (0, Localize_1.translateLocal)('accessibilityHints.chatUserDisplayNames');
                var displayNames = react_native_1.screen.queryAllByLabelText(hintText);
                expect(displayNames).toHaveLength(4);
                expect(displayNames.at(0)).toHaveTextContent(taskReportName);
                expect(displayNames.at(1)).toHaveTextContent('Email Four');
                expect(displayNames.at(2)).toHaveTextContent('Email Three');
                expect(displayNames.at(3)).toHaveTextContent('Email Two');
            }));
        });
        it('reorders the reports to have a newly created iou report on top', function () {
            var _a;
            // Given three reports in the recently updated order of 3, 2, 1
            var report1 = LHNTestUtils.getFakeReport([1, 2], 4);
            var report2 = LHNTestUtils.getFakeReport([1, 3], 3);
            var report3 = __assign(__assign({}, LHNTestUtils.getFakeReport([1, 4], 2)), { hasOutstandingChildRequest: true, 
                // This has to be added after the IOU report is generated
                iouReportID: undefined });
            var iouReport = __assign(__assign({}, LHNTestUtils.getFakeReport([1, 4], 1)), { type: CONST_1.default.REPORT.TYPE.IOU, ownerAccountID: 1, managerID: 4, hasOutstandingChildRequest: false, total: 10000, currency: 'USD', chatReportID: report3.reportID, stateNum: CONST_1.default.REPORT.STATE_NUM.SUBMITTED, statusNum: CONST_1.default.REPORT.STATUS_NUM.SUBMITTED, participants: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    1: {
                        notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.HIDDEN,
                    },
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    4: {
                        notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.HIDDEN,
                    },
                } });
            report3.iouReportID = iouReport.reportID;
            // Each report has at least one ADD_COMMENT action so should be rendered in the LNH
            (0, Report_1.addComment)(report1.reportID, 'Hi, this is a comment');
            (0, Report_1.addComment)(report3.reportID, 'Hi, this is a comment');
            (0, Report_1.addComment)(report2.reportID, 'Hi, this is a comment');
            var reportCollectionDataSet = (_a = {},
                _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report1.reportID)] = report1,
                _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report2.reportID)] = report2,
                _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report3.reportID)] = report3,
                _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(iouReport.reportID)] = iouReport,
                _a);
            return ((0, waitForBatchedUpdates_1.default)()
                .then(function () { return LHNTestUtils.getDefaultRenderedSidebarLinks(iouReport.reportID); })
                // When Onyx is updated with the data and the sidebar re-renders
                .then(function () {
                var _a;
                return react_native_onyx_1.default.multiSet(__assign((_a = {}, _a[ONYXKEYS_1.default.NVP_PRIORITY_MODE] = CONST_1.default.PRIORITY_MODE.DEFAULT, _a[ONYXKEYS_1.default.PERSONAL_DETAILS_LIST] = LHNTestUtils.fakePersonalDetails, _a[ONYXKEYS_1.default.IS_LOADING_APP] = false, _a), reportCollectionDataSet));
            })
                // Then the order of the reports should be 4 > 3 > 2 > 1
                .then(function () {
                var hintText = (0, Localize_1.translateLocal)('accessibilityHints.chatUserDisplayNames');
                var displayNames = react_native_1.screen.queryAllByLabelText(hintText);
                expect(displayNames).toHaveLength(4);
                expect(displayNames.at(0)).toHaveTextContent('Email Four');
                expect(displayNames.at(1)).toHaveTextContent('Email Four owes $100.00');
                expect(displayNames.at(2)).toHaveTextContent('Email Three');
                expect(displayNames.at(3)).toHaveTextContent('Email Two');
            }));
        });
        it('reorders the reports to have a newly created expense report on top', function () {
            var _a;
            // Given three reports in the recently updated order of 3, 2, 1
            var report1 = LHNTestUtils.getFakeReport([1, 2], 4);
            var report2 = LHNTestUtils.getFakeReport([1, 3], 3);
            var fakeReport = LHNTestUtils.getFakeReportWithPolicy([1, 4], 2);
            var fakePolicy = LHNTestUtils.getFakePolicy(fakeReport.policyID);
            var report3 = __assign(__assign({}, fakeReport), { hasOutstandingChildRequest: true, 
                // This has to be added after the IOU report is generated
                iouReportID: undefined });
            var expenseReport = __assign(__assign({}, LHNTestUtils.getFakeReport([1, 4], 1)), { type: CONST_1.default.REPORT.TYPE.EXPENSE, ownerAccountID: 1, managerID: 4, policyName: fakePolicy.name, policyID: fakeReport.policyID, reportName: 'Report Name', total: -10000, currency: 'USD', stateNum: CONST_1.default.REPORT.STATE_NUM.SUBMITTED, statusNum: CONST_1.default.REPORT.STATUS_NUM.SUBMITTED, chatReportID: report3.reportID, parentReportID: report3.reportID, participants: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    1: {
                        notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.HIDDEN,
                    },
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    4: {
                        notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.HIDDEN,
                    },
                } });
            report3.iouReportID = expenseReport.reportID;
            // Each report has at least one ADD_COMMENT action so should be rendered in the LNH
            (0, Report_1.addComment)(report1.reportID, 'Hi, this is a comment');
            (0, Report_1.addComment)(report3.reportID, 'Hi, this is a comment');
            (0, Report_1.addComment)(report2.reportID, 'Hi, this is a comment');
            var reportCollectionDataSet = (_a = {},
                _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report1.reportID)] = report1,
                _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report2.reportID)] = report2,
                _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report3.reportID)] = report3,
                _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(expenseReport.reportID)] = expenseReport,
                _a);
            return ((0, waitForBatchedUpdates_1.default)()
                .then(function () { return LHNTestUtils.getDefaultRenderedSidebarLinks(expenseReport.reportID); })
                // When Onyx is updated with the data and the sidebar re-renders
                .then(function () {
                var _a;
                return react_native_onyx_1.default.multiSet(__assign((_a = {}, _a[ONYXKEYS_1.default.NVP_PRIORITY_MODE] = CONST_1.default.PRIORITY_MODE.DEFAULT, _a[ONYXKEYS_1.default.PERSONAL_DETAILS_LIST] = LHNTestUtils.fakePersonalDetails, _a[ONYXKEYS_1.default.IS_LOADING_APP] = false, _a["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(fakeReport.policyID)] = fakePolicy, _a), reportCollectionDataSet));
            })
                // Then the order of the reports should be 4 > 3 > 2 > 1
                .then(function () {
                var hintText = (0, Localize_1.translateLocal)('accessibilityHints.chatUserDisplayNames');
                var displayNames = react_native_1.screen.queryAllByLabelText(hintText);
                expect(displayNames).toHaveLength(4);
                expect(displayNames.at(0)).toHaveTextContent("Email One's expenses");
                expect(displayNames.at(1)).toHaveTextContent('Report Name');
                expect(displayNames.at(2)).toHaveTextContent('Email Three');
                expect(displayNames.at(3)).toHaveTextContent('Email Two');
            }));
        });
        it('reorders the reports to keep draft reports on top', function () {
            var _a;
            // Given three reports in the recently updated order of 3, 2, 1
            // And the second report has a draft
            // And the currently viewed report is the second report
            var report1 = LHNTestUtils.getFakeReport([1, 2], 3);
            var report2 = __assign({}, LHNTestUtils.getFakeReport([1, 3], 2));
            var report3 = LHNTestUtils.getFakeReport([1, 4], 1);
            // Each report has at least one ADD_COMMENT action so should be rendered in the LNH
            (0, Report_1.addComment)(report1.reportID, 'Hi, this is a comment');
            (0, Report_1.addComment)(report2.reportID, 'Hi, this is a comment');
            (0, Report_1.addComment)(report3.reportID, 'Hi, this is a comment');
            var currentReportId = report2.reportID;
            var reportCollectionDataSet = (_a = {},
                _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report1.reportID)] = report1,
                _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report2.reportID)] = report2,
                _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report3.reportID)] = report3,
                _a);
            return ((0, waitForBatchedUpdates_1.default)()
                .then(function () { return LHNTestUtils.getDefaultRenderedSidebarLinks(currentReportId); })
                // When Onyx is updated with the data and the sidebar re-renders
                .then(function () {
                var _a;
                return react_native_onyx_1.default.multiSet(__assign((_a = {}, _a[ONYXKEYS_1.default.NVP_PRIORITY_MODE] = CONST_1.default.PRIORITY_MODE.DEFAULT, _a[ONYXKEYS_1.default.PERSONAL_DETAILS_LIST] = LHNTestUtils.fakePersonalDetails, _a[ONYXKEYS_1.default.IS_LOADING_APP] = false, _a[ONYXKEYS_1.default.COLLECTION.REPORT_DRAFT_COMMENT + report2.reportID] = 'This is a draft', _a), reportCollectionDataSet));
            })
                // When the currently active chat is switched to report 1 (the one on the bottom)
                .then(function () {
                // The changing of a route itself will re-render the component in the App, but since we are not performing this test
                // inside the navigator and it has no access to the routes we need to trigger an update to the SidebarLinks manually.
                LHNTestUtils.getDefaultRenderedSidebarLinks(report1.reportID);
                return (0, waitForBatchedUpdates_1.default)();
            })
                // Then the order of the reports should be 2 > 3 > 1
                //                                         ^--- (2 goes to the front and pushes 3 down)
                .then(function () {
                var hintText = (0, Localize_1.translateLocal)('accessibilityHints.chatUserDisplayNames');
                var displayNames = react_native_1.screen.queryAllByLabelText(hintText);
                expect(displayNames).toHaveLength(3);
                expect(displayNames.at(0)).toHaveTextContent('Email Three');
                expect(displayNames.at(1)).toHaveTextContent('Email Four');
                expect(displayNames.at(2)).toHaveTextContent('Email Two');
            }));
        });
        it('removes the pencil icon when draft is removed', function () {
            var _a;
            // Given a single report
            // And the report has a draft
            var report = __assign({}, LHNTestUtils.getFakeReport([1, 2]));
            var reportCollectionDataSet = (_a = {},
                _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report.reportID)] = report,
                _a);
            return ((0, waitForBatchedUpdates_1.default)()
                .then(function () { return LHNTestUtils.getDefaultRenderedSidebarLinks(); })
                // When Onyx is updated with the data and the sidebar re-renders
                .then(function () {
                var _a;
                return react_native_onyx_1.default.multiSet(__assign((_a = {}, _a[ONYXKEYS_1.default.NVP_PRIORITY_MODE] = CONST_1.default.PRIORITY_MODE.DEFAULT, _a[ONYXKEYS_1.default.PERSONAL_DETAILS_LIST] = LHNTestUtils.fakePersonalDetails, _a[ONYXKEYS_1.default.IS_LOADING_APP] = false, _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_DRAFT_COMMENT).concat(report.reportID)] = 'This is a draft', _a), reportCollectionDataSet));
            })
                // Then there should be a pencil icon showing
                .then(function () {
                expect(react_native_1.screen.queryAllByTestId('Pencil Icon')).toHaveLength(1);
            })
                // When the draft is removed
                .then(function () { return react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT_DRAFT_COMMENT).concat(report.reportID), null); })
                // Then the pencil icon goes away
                .then(function () {
                expect(react_native_1.screen.queryAllByTestId('Pencil Icon')).toHaveLength(0);
            }));
        });
        it('removes the pin icon when chat is unpinned', function () {
            var _a;
            // Given a single report
            // And the report is pinned
            var report = __assign(__assign({}, LHNTestUtils.getFakeReport([1, 2])), { isPinned: true });
            var reportCollectionDataSet = (_a = {},
                _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report.reportID)] = report,
                _a);
            return ((0, waitForBatchedUpdates_1.default)()
                .then(function () { return LHNTestUtils.getDefaultRenderedSidebarLinks(); })
                // When Onyx is updated with the data and the sidebar re-renders
                .then(function () {
                var _a;
                return react_native_onyx_1.default.multiSet(__assign((_a = {}, _a[ONYXKEYS_1.default.NVP_PRIORITY_MODE] = CONST_1.default.PRIORITY_MODE.DEFAULT, _a[ONYXKEYS_1.default.PERSONAL_DETAILS_LIST] = LHNTestUtils.fakePersonalDetails, _a[ONYXKEYS_1.default.IS_LOADING_APP] = false, _a), reportCollectionDataSet));
            })
                // Then there should be a pencil icon showing
                .then(function () {
                expect(react_native_1.screen.queryAllByTestId('Pin Icon')).toHaveLength(1);
            })
                // When the draft is removed
                .then(function () { return react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report.reportID), { isPinned: false }); })
                // Then the pencil icon goes away
                .then(function () {
                expect(react_native_1.screen.queryAllByTestId('Pin Icon')).toHaveLength(0);
            }));
        });
        it('sorts chats by pinned / GBR > draft > rest', function () {
            var _a;
            // Given three reports in the recently updated order of 4, 3, 2, 1
            // with a report that has a draft, a report that is pinned, and
            //    an outstanding IOU report that belong to the current user
            var report1 = __assign(__assign({}, LHNTestUtils.getFakeReport([1, 2], 4)), { isPinned: true });
            var report2 = __assign({}, LHNTestUtils.getFakeReport([1, 3], 3));
            var report3 = __assign(__assign({}, LHNTestUtils.getFakeReport([1, 4], 2)), { hasOutstandingChildRequest: true, 
                // This has to be added after the IOU report is generated
                iouReportID: undefined });
            var report4 = LHNTestUtils.getFakeReport([1, 5], 1);
            (0, Report_1.addComment)(report4.reportID, 'Hi, this is a comment');
            var iouReport = __assign(__assign({}, LHNTestUtils.getFakeReport([1, 4])), { type: CONST_1.default.REPORT.TYPE.IOU, ownerAccountID: 1, managerID: 4, hasOutstandingChildRequest: false, total: 10000, currency: 'USD', chatReportID: report3.reportID, stateNum: CONST_1.default.REPORT.STATE_NUM.SUBMITTED, statusNum: CONST_1.default.REPORT.STATUS_NUM.SUBMITTED, participants: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    1: {
                        notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.HIDDEN,
                    },
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    4: {
                        notificationPreference: CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.HIDDEN,
                    },
                } });
            report3.iouReportID = iouReport.reportID;
            var currentReportId = report2.reportID;
            var reportCollectionDataSet = (_a = {},
                _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report1.reportID)] = report1,
                _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report2.reportID)] = report2,
                _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report3.reportID)] = report3,
                _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report4.reportID)] = report4,
                _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(iouReport.reportID)] = iouReport,
                _a);
            return ((0, waitForBatchedUpdates_1.default)()
                .then(function () { return LHNTestUtils.getDefaultRenderedSidebarLinks(currentReportId); })
                // When Onyx is updated with the data and the sidebar re-renders
                .then(function () {
                var _a;
                return react_native_onyx_1.default.multiSet(__assign((_a = {}, _a[ONYXKEYS_1.default.NVP_PRIORITY_MODE] = CONST_1.default.PRIORITY_MODE.DEFAULT, _a[ONYXKEYS_1.default.PERSONAL_DETAILS_LIST] = LHNTestUtils.fakePersonalDetails, _a[ONYXKEYS_1.default.IS_LOADING_APP] = false, _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_DRAFT_COMMENT).concat(report2.reportID)] = 'Report2 draft comment', _a), reportCollectionDataSet));
            })
                // Then the reports are ordered by Pinned / GBR > Draft > Rest
                // there is a pencil icon
                // there is a pinned icon
                .then(function () {
                var hintText = (0, Localize_1.translateLocal)('accessibilityHints.chatUserDisplayNames');
                var displayNames = react_native_1.screen.queryAllByLabelText(hintText);
                expect(displayNames).toHaveLength(4);
                expect(react_native_1.screen.queryAllByTestId('Pin Icon')).toHaveLength(1);
                expect(react_native_1.screen.queryAllByTestId('Pencil Icon')).toHaveLength(1);
                expect(displayNames.at(0)).toHaveTextContent('Email Four');
                expect(displayNames.at(1)).toHaveTextContent('Email Two');
                expect(displayNames.at(2)).toHaveTextContent('Email Three');
                expect(displayNames.at(3)).toHaveTextContent('Email Five');
            }));
        });
        it('alphabetizes all the chats that are pinned', function () {
            var _a;
            // Given three reports in the recently updated order of 3, 2, 1
            // and they are all pinned
            var report1 = __assign(__assign({}, LHNTestUtils.getFakeReport([1, 2], 3)), { isPinned: true });
            var report2 = __assign(__assign({}, LHNTestUtils.getFakeReport([1, 3], 2)), { isPinned: true });
            var report3 = __assign(__assign({}, LHNTestUtils.getFakeReport([1, 4], 1)), { isPinned: true });
            var report4 = __assign(__assign({}, LHNTestUtils.getFakeReport([1, 5], 0)), { isPinned: true });
            var reportCollectionDataSet = (_a = {},
                _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report1.reportID)] = report1,
                _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report2.reportID)] = report2,
                _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report3.reportID)] = report3,
                _a);
            return ((0, waitForBatchedUpdates_1.default)()
                .then(function () { return LHNTestUtils.getDefaultRenderedSidebarLinks('0'); })
                // When Onyx is updated with the data and the sidebar re-renders
                .then(function () {
                var _a;
                return react_native_onyx_1.default.multiSet(__assign((_a = {}, _a[ONYXKEYS_1.default.NVP_PRIORITY_MODE] = CONST_1.default.PRIORITY_MODE.DEFAULT, _a[ONYXKEYS_1.default.PERSONAL_DETAILS_LIST] = LHNTestUtils.fakePersonalDetails, _a[ONYXKEYS_1.default.IS_LOADING_APP] = false, _a), reportCollectionDataSet));
            })
                // Then the reports are in alphabetical order
                .then(function () {
                var hintText = (0, Localize_1.translateLocal)('accessibilityHints.chatUserDisplayNames');
                var displayNames = react_native_1.screen.queryAllByLabelText(hintText);
                expect(displayNames).toHaveLength(3);
                expect(displayNames.at(0)).toHaveTextContent('Email Four');
                expect(displayNames.at(1)).toHaveTextContent('Email Three');
                expect(displayNames.at(2)).toHaveTextContent('Email Two');
            })
                // When a new report is added
                .then(function () { return react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report4.reportID), report4); })
                // Then they are still in alphabetical order
                .then(function () {
                var hintText = (0, Localize_1.translateLocal)('accessibilityHints.chatUserDisplayNames');
                var displayNames = react_native_1.screen.queryAllByLabelText(hintText);
                expect(displayNames).toHaveLength(4);
                expect(displayNames.at(0)).toHaveTextContent('Email Five');
                expect(displayNames.at(1)).toHaveTextContent('Email Four');
                expect(displayNames.at(2)).toHaveTextContent('Email Three');
                expect(displayNames.at(3)).toHaveTextContent('Email Two');
            }));
        });
        it('alphabetizes all the chats that have drafts', function () {
            var _a, _b;
            // Given three reports in the recently updated order of 3, 2, 1
            // and they all have drafts
            var report1 = __assign({}, LHNTestUtils.getFakeReport([1, 2], 3));
            var report2 = __assign({}, LHNTestUtils.getFakeReport([1, 3], 2));
            var report3 = __assign({}, LHNTestUtils.getFakeReport([1, 4], 1));
            var report4 = __assign({}, LHNTestUtils.getFakeReport([1, 5], 0));
            var reportCollectionDataSet = (_a = {},
                _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report1.reportID)] = report1,
                _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report2.reportID)] = report2,
                _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report3.reportID)] = report3,
                _a);
            var reportDraftCommentCollectionDataSet = (_b = {},
                _b["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_DRAFT_COMMENT).concat(report1.reportID)] = 'report1 draft',
                _b["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_DRAFT_COMMENT).concat(report2.reportID)] = 'report2 draft',
                _b["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_DRAFT_COMMENT).concat(report3.reportID)] = 'report3 draft',
                _b);
            return ((0, waitForBatchedUpdates_1.default)()
                .then(function () { return LHNTestUtils.getDefaultRenderedSidebarLinks('0'); })
                // When Onyx is updated with the data and the sidebar re-renders
                .then(function () {
                var _a;
                return react_native_onyx_1.default.multiSet(__assign(__assign((_a = {}, _a[ONYXKEYS_1.default.NVP_PRIORITY_MODE] = CONST_1.default.PRIORITY_MODE.DEFAULT, _a[ONYXKEYS_1.default.PERSONAL_DETAILS_LIST] = LHNTestUtils.fakePersonalDetails, _a[ONYXKEYS_1.default.IS_LOADING_APP] = false, _a), reportDraftCommentCollectionDataSet), reportCollectionDataSet));
            })
                // Then the reports are in alphabetical order
                .then(function () {
                var hintText = (0, Localize_1.translateLocal)('accessibilityHints.chatUserDisplayNames');
                var displayNames = react_native_1.screen.queryAllByLabelText(hintText);
                expect(displayNames).toHaveLength(3);
                expect(displayNames.at(0)).toHaveTextContent('Email Four');
                expect(displayNames.at(1)).toHaveTextContent('Email Three');
                expect(displayNames.at(2)).toHaveTextContent('Email Two');
            })
                // When a new report is added
                .then(function () {
                var _a;
                return react_native_onyx_1.default.multiSet(__assign(__assign(__assign({}, reportDraftCommentCollectionDataSet), (_a = {}, _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_DRAFT_COMMENT).concat(report4.reportID)] = 'report4 draft', _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report4.reportID)] = report4, _a)), reportCollectionDataSet));
            })
                // Then they are still in alphabetical order
                .then(function () {
                var hintText = (0, Localize_1.translateLocal)('accessibilityHints.chatUserDisplayNames');
                var displayNames = react_native_1.screen.queryAllByLabelText(hintText);
                expect(displayNames).toHaveLength(4);
                expect(displayNames.at(0)).toHaveTextContent('Email Five');
                expect(displayNames.at(1)).toHaveTextContent('Email Four');
                expect(displayNames.at(2)).toHaveTextContent('Email Three');
                expect(displayNames.at(3)).toHaveTextContent('Email Two');
            }));
        });
        it('puts archived chats last', function () {
            var _a, _b;
            // Given three reports, with the first report being archived
            var report1 = __assign(__assign({}, LHNTestUtils.getFakeReport([1, 2])), { chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_ROOM });
            var report2 = LHNTestUtils.getFakeReport([1, 3]);
            var report3 = LHNTestUtils.getFakeReport([1, 4]);
            // Each report has at least one ADD_COMMENT action so should be rendered in the LNH
            (0, Report_1.addComment)(report1.reportID, 'Hi, this is a comment');
            (0, Report_1.addComment)(report2.reportID, 'Hi, this is a comment');
            (0, Report_1.addComment)(report3.reportID, 'Hi, this is a comment');
            // Given the user is in all betas
            var betas = [CONST_1.default.BETAS.DEFAULT_ROOMS];
            var reportCollectionDataSet = (_a = {},
                _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report1.reportID)] = report1,
                _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report2.reportID)] = report2,
                _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report3.reportID)] = report3,
                _a);
            var reportNameValuePairsCollectionDataSet = (_b = {},
                _b["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_NAME_VALUE_PAIRS).concat(report1.reportID)] = {
                    private_isArchived: DateUtils_1.default.getDBTime(),
                },
                _b);
            return ((0, waitForBatchedUpdates_1.default)()
                .then(function () { return LHNTestUtils.getDefaultRenderedSidebarLinks('0'); })
                // When Onyx is updated with the data and the sidebar re-renders
                .then(function () {
                var _a;
                return react_native_onyx_1.default.multiSet(__assign(__assign((_a = {}, _a[ONYXKEYS_1.default.BETAS] = betas, _a[ONYXKEYS_1.default.NVP_PRIORITY_MODE] = CONST_1.default.PRIORITY_MODE.DEFAULT, _a[ONYXKEYS_1.default.PERSONAL_DETAILS_LIST] = LHNTestUtils.fakePersonalDetails, _a[ONYXKEYS_1.default.IS_LOADING_APP] = false, _a), reportNameValuePairsCollectionDataSet), reportCollectionDataSet));
            })
                // Then the first report is in last position
                .then(function () {
                var hintText = (0, Localize_1.translateLocal)('accessibilityHints.chatUserDisplayNames');
                var displayNames = react_native_1.screen.queryAllByLabelText(hintText);
                expect(displayNames).toHaveLength(3);
                expect(displayNames.at(0)).toHaveTextContent('Email Four');
                expect(displayNames.at(1)).toHaveTextContent('Email Three');
                expect(displayNames.at(2)).toHaveTextContent('Report (archived)');
            }));
        });
        it('orders nonArchived reports by displayName if created timestamps are the same', function () {
            var _a;
            // Given three nonArchived reports created at the same time
            var report1 = LHNTestUtils.getFakeReport([1, 2]);
            var report2 = LHNTestUtils.getFakeReport([1, 3]);
            var report3 = LHNTestUtils.getFakeReport([1, 4]);
            // Each report has at least one ADD_COMMENT action so should be rendered in the LNH
            (0, Report_1.addComment)(report1.reportID, 'Hi, this is a comment');
            (0, Report_1.addComment)(report2.reportID, 'Hi, this is a comment');
            (0, Report_1.addComment)(report3.reportID, 'Hi, this is a comment');
            var reportCollectionDataSet = (_a = {},
                _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report1.reportID)] = report1,
                _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report2.reportID)] = report2,
                _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report3.reportID)] = report3,
                _a);
            return ((0, waitForBatchedUpdates_1.default)()
                .then(function () { return LHNTestUtils.getDefaultRenderedSidebarLinks('0'); })
                // When Onyx is updated with the data and the sidebar re-renders
                .then(function () {
                var _a;
                return react_native_onyx_1.default.multiSet(__assign((_a = {}, _a[ONYXKEYS_1.default.NVP_PRIORITY_MODE] = CONST_1.default.PRIORITY_MODE.DEFAULT, _a[ONYXKEYS_1.default.PERSONAL_DETAILS_LIST] = LHNTestUtils.fakePersonalDetails, _a[ONYXKEYS_1.default.IS_LOADING_APP] = false, _a), reportCollectionDataSet));
            })
                // Then the reports are ordered alphabetically since their lastVisibleActionCreated are the same
                .then(function () {
                var hintText = (0, Localize_1.translateLocal)('accessibilityHints.chatUserDisplayNames');
                var displayNames = react_native_1.screen.queryAllByLabelText(hintText);
                expect(displayNames).toHaveLength(3);
                expect(displayNames.at(0)).toHaveTextContent('Email Four');
                expect(displayNames.at(1)).toHaveTextContent('Email Three');
                expect(displayNames.at(2)).toHaveTextContent('Email Two');
            }));
        });
    });
    describe('in #focus mode', function () {
        it('alphabetizes chats', function () {
            var _a;
            var report1 = __assign(__assign({}, LHNTestUtils.getFakeReport([1, 2], 3, true)), { lastMessageText: 'test' });
            var report2 = __assign(__assign({}, LHNTestUtils.getFakeReport([1, 3], 2, true)), { lastMessageText: 'test' });
            var report3 = __assign(__assign({}, LHNTestUtils.getFakeReport([1, 4], 1, true)), { lastMessageText: 'test' });
            var report4 = __assign(__assign({}, LHNTestUtils.getFakeReport([1, 5], 0, true)), { lastMessageText: 'test' });
            var reportCollectionDataSet = (_a = {},
                _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report1.reportID)] = report1,
                _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report2.reportID)] = report2,
                _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report3.reportID)] = report3,
                _a);
            return ((0, waitForBatchedUpdates_1.default)()
                .then(function () { return react_native_onyx_1.default.set(ONYXKEYS_1.default.PERSONAL_DETAILS_LIST, LHNTestUtils.fakePersonalDetails); })
                .then(function () { return LHNTestUtils.getDefaultRenderedSidebarLinks('0'); })
                // Given the sidebar is rendered in #focus mode (hides read chats)
                // with all reports having unread comments
                .then(function () {
                var _a;
                return react_native_onyx_1.default.multiSet(__assign((_a = {}, _a[ONYXKEYS_1.default.NVP_PRIORITY_MODE] = CONST_1.default.PRIORITY_MODE.GSD, _a[ONYXKEYS_1.default.IS_LOADING_APP] = false, _a), reportCollectionDataSet));
            })
                // Then the reports are in alphabetical order
                .then(function () {
                var hintText = (0, Localize_1.translateLocal)('accessibilityHints.chatUserDisplayNames');
                var displayNames = react_native_1.screen.queryAllByLabelText(hintText);
                expect(displayNames).toHaveLength(3);
                expect(displayNames.at(0)).toHaveTextContent('Email Four');
                expect(displayNames.at(1)).toHaveTextContent('Email Three');
                expect(displayNames.at(2)).toHaveTextContent('Email Two');
            })
                // When a new report is added
                .then(function () { return react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report4.reportID), report4); })
                // Then they are still in alphabetical order
                .then(function () {
                var hintText = (0, Localize_1.translateLocal)('accessibilityHints.chatUserDisplayNames');
                var displayNames = react_native_1.screen.queryAllByLabelText(hintText);
                expect(displayNames).toHaveLength(4);
                expect(displayNames.at(0)).toHaveTextContent('Email Five');
                expect(displayNames.at(1)).toHaveTextContent('Email Four');
                expect(displayNames.at(2)).toHaveTextContent('Email Three');
                expect(displayNames.at(3)).toHaveTextContent('Email Two');
            }));
        });
        it('puts archived chats last', function () {
            var _a, _b;
            // Given three unread reports, with the first report being archived
            var report1 = __assign(__assign({}, LHNTestUtils.getFakeReport([1, 2], 3, true)), { chatType: CONST_1.default.REPORT.CHAT_TYPE.POLICY_ROOM, lastMessageText: 'test' });
            var report2 = __assign(__assign({}, LHNTestUtils.getFakeReport([1, 3], 2, true)), { lastMessageText: 'test' });
            var report3 = __assign(__assign({}, LHNTestUtils.getFakeReport([1, 4], 1, true)), { lastMessageText: 'test' });
            // Given the user is in all betas
            var betas = [CONST_1.default.BETAS.DEFAULT_ROOMS];
            var reportCollectionDataSet = (_a = {},
                _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report1.reportID)] = report1,
                _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report2.reportID)] = report2,
                _a["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report3.reportID)] = report3,
                _a);
            var reportNameValuePairsCollectionDataSet = (_b = {},
                _b["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_NAME_VALUE_PAIRS).concat(report1.reportID)] = {
                    private_isArchived: DateUtils_1.default.getDBTime(),
                },
                _b);
            return ((0, waitForBatchedUpdates_1.default)()
                .then(function () { return LHNTestUtils.getDefaultRenderedSidebarLinks('0'); })
                // When Onyx is updated with the data and the sidebar re-renders
                .then(function () {
                var _a;
                return react_native_onyx_1.default.multiSet(__assign(__assign((_a = {}, _a[ONYXKEYS_1.default.BETAS] = betas, _a[ONYXKEYS_1.default.NVP_PRIORITY_MODE] = CONST_1.default.PRIORITY_MODE.GSD, _a[ONYXKEYS_1.default.PERSONAL_DETAILS_LIST] = LHNTestUtils.fakePersonalDetails, _a[ONYXKEYS_1.default.IS_LOADING_APP] = false, _a), reportNameValuePairsCollectionDataSet), reportCollectionDataSet));
            })
                // Then the first report is in last position
                .then(function () {
                var hintText = (0, Localize_1.translateLocal)('accessibilityHints.chatUserDisplayNames');
                var displayNames = react_native_1.screen.queryAllByLabelText(hintText);
                expect(displayNames).toHaveLength(3);
                expect(displayNames.at(0)).toHaveTextContent('Email Four');
                expect(displayNames.at(1)).toHaveTextContent('Email Three');
                expect(displayNames.at(2)).toHaveTextContent('Report (archived)');
            }));
        });
    });
});
