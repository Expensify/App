import {screen} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import * as Report from '@libs/actions/Report';
import DateUtils from '@libs/DateUtils';
import * as Localize from '@libs/Localize';
import CONST from '@src/CONST';
import type * as OnyxTypes from '@src/types/onyx';
import type {ReportCollectionDataSet} from '@src/types/onyx/Report';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import wrapOnyxWithWaitForBatchedUpdates from '../utils/wrapOnyxWithWaitForBatchedUpdates';

// Be sure to include the mocked Permissions and Expensicons libraries as well as the usePermissions hook or else the beta tests won't work
jest.mock('@libs/Permissions');
jest.mock('@hooks/usePermissions.ts');
jest.mock('@components/Icon/Expensicons');
jest.mock('@src/hooks/useActiveWorkspaceFromNavigationState');

const ONYXKEYS = {
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
    IS_LOADING_REPORT_DATA: 'isLoadingReportData',
} as const;

describe('Sidebar', () => {
    beforeAll(() =>
        Onyx.init({
            keys: ONYXKEYS,
            safeEvictionKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        }),
    );

    beforeEach(() => {
        // Wrap Onyx each onyx action with waitForBatchedUpdates
        wrapOnyxWithWaitForBatchedUpdates(Onyx);
        // Initialize the network key for OfflineWithFeedback
        return Onyx.merge(ONYXKEYS.NETWORK, {isOffline: false});
    });

    // Clear out Onyx after each test so that each test starts with a clean slate
    afterEach(() => {
        Onyx.clear();
    });

    describe('in default mode', () => {
        it('is not rendered when there are no props passed to it', () => {
            // Given all the default props are passed to SidebarLinks
            // When it is rendered
            LHNTestUtils.getDefaultRenderedSidebarLinks();

            // Then it should render nothing and be null
            // This is expected because there is an early return when there are no personal details
            expect(screen.toJSON()).toBe(null);
        });

        it('is rendered with an empty list when personal details exist', () =>
            waitForBatchedUpdates()
                // Given the sidebar is rendered with default props
                .then(() => LHNTestUtils.getDefaultRenderedSidebarLinks())

                // When Onyx is updated with some personal details
                .then(() =>
                    Onyx.multiSet({
                        [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
                        [ONYXKEYS.IS_LOADING_APP]: false,
                    }),
                )

                // Then the component should be rendered with an empty list since it will get past the early return
                .then(() => {
                    expect(screen.toJSON()).not.toBe(null);
                    const navigatesToChatHintText = Localize.translateLocal('accessibilityHints.navigatesToChat');
                    expect(screen.queryAllByAccessibilityHint(navigatesToChatHintText)).toHaveLength(0);
                }));

        it('contains one report when a report is in Onyx', () => {
            // Given a single report
            const report = LHNTestUtils.getFakeReport([1, 2]);

            const reportCollectionDataSet: ReportCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`]: report,
            };

            return (
                waitForBatchedUpdates()
                    .then(() => LHNTestUtils.getDefaultRenderedSidebarLinks(report.reportID))

                    // When Onyx is updated with the data and the sidebar re-renders
                    .then(() =>
                        Onyx.multiSet({
                            [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.DEFAULT,
                            [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
                            [ONYXKEYS.IS_LOADING_APP]: false,
                            ...reportCollectionDataSet,
                        }),
                    )

                    // Then the component should be rendered with an item for the report
                    .then(() => {
                        expect(screen.queryAllByText('One, Two')).toHaveLength(1);
                    })
            );
        });

        it('orders items with most recently updated on top', () => {
            // Given three unread reports in the recently updated order of 3, 2, 1
            const report1 = LHNTestUtils.getFakeReport([1, 2], 3);
            const report2 = LHNTestUtils.getFakeReport([3, 4], 2);
            const report3 = LHNTestUtils.getFakeReport([5, 6], 1);

            // Each report has at least one ADD_COMMENT action so should be rendered in the LNH
            Report.addComment(report1.reportID, 'Hi, this is a comment');
            Report.addComment(report2.reportID, 'Hi, this is a comment');
            Report.addComment(report3.reportID, 'Hi, this is a comment');

            const reportCollectionDataSet: ReportCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.REPORT}${report1.reportID}`]: report1,
                [`${ONYXKEYS.COLLECTION.REPORT}${report2.reportID}`]: report2,
                [`${ONYXKEYS.COLLECTION.REPORT}${report3.reportID}`]: report3,
            };

            return (
                waitForBatchedUpdates()
                    .then(() => LHNTestUtils.getDefaultRenderedSidebarLinks())

                    // When Onyx is updated with the data and the sidebar re-renders
                    .then(() =>
                        Onyx.multiSet({
                            [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.DEFAULT,
                            [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
                            [ONYXKEYS.IS_LOADING_APP]: false,
                            ...reportCollectionDataSet,
                        }),
                    )

                    // Then the component should be rendered with the mostly recently updated report first
                    .then(() => {
                        const hintText = Localize.translateLocal('accessibilityHints.chatUserDisplayNames');
                        const displayNames = screen.queryAllByLabelText(hintText);
                        expect(displayNames).toHaveLength(3);

                        expect(displayNames[0]).toHaveTextContent('Five, Six');
                        expect(displayNames[1]).toHaveTextContent('Three, Four');
                        expect(displayNames[2]).toHaveTextContent('One, Two');
                    })
            );
        });

        it('changes the order when adding a draft to the active report', () => {
            // Given three reports in the recently updated order of 3, 2, 1
            // And the first report has a draft
            // And the currently viewed report is the first report
            const report1 = {
                ...LHNTestUtils.getFakeReport([1, 2], 3),
            };
            const report2 = LHNTestUtils.getFakeReport([3, 4], 2);
            const report3 = LHNTestUtils.getFakeReport([5, 6], 1);

            // Each report has at least one ADD_COMMENT action so should be rendered in the LNH
            Report.addComment(report1.reportID, 'Hi, this is a comment');
            Report.addComment(report2.reportID, 'Hi, this is a comment');
            Report.addComment(report3.reportID, 'Hi, this is a comment');

            const currentReportId = report1.reportID;
            const reportCollectionDataSet: ReportCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.REPORT}${report1.reportID}`]: report1,
                [`${ONYXKEYS.COLLECTION.REPORT}${report2.reportID}`]: report2,
                [`${ONYXKEYS.COLLECTION.REPORT}${report3.reportID}`]: report3,
            };

            return (
                waitForBatchedUpdates()
                    .then(() => LHNTestUtils.getDefaultRenderedSidebarLinks(currentReportId))

                    // When Onyx is updated with the data and the sidebar re-renders
                    .then(() =>
                        Onyx.multiSet({
                            [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.DEFAULT,
                            [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
                            [ONYXKEYS.IS_LOADING_APP]: false,
                            [`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${report1.reportID}`]: 'report1 draft',
                            ...reportCollectionDataSet,
                        }),
                    )

                    // Then there should be a pencil icon and report one should be the first one because putting a draft on the active report should change its location
                    // in the ordered list
                    .then(() => {
                        const pencilIcon = screen.queryAllByTestId('Pencil Icon');
                        expect(pencilIcon).toHaveLength(1);

                        const hintText = Localize.translateLocal('accessibilityHints.chatUserDisplayNames');
                        const displayNames = screen.queryAllByLabelText(hintText);
                        expect(displayNames).toHaveLength(3);
                        expect(displayNames[0]).toHaveTextContent('One, Two'); // this has `hasDraft` flag enabled so it will be on top
                        expect(displayNames[1]).toHaveTextContent('Five, Six');
                        expect(displayNames[2]).toHaveTextContent('Three, Four');
                    })
            );
        });

        it('reorders the reports to always have the most recently updated one on top', () => {
            // Given three reports in the recently updated order of 3, 2, 1
            const report1 = LHNTestUtils.getFakeReport([1, 2], 3);
            const report2 = LHNTestUtils.getFakeReport([3, 4], 2);
            const report3 = LHNTestUtils.getFakeReport([5, 6], 1);

            // Each report has at least one ADD_COMMENT action so should be rendered in the LNH
            Report.addComment(report1.reportID, 'Hi, this is a comment');
            Report.addComment(report2.reportID, 'Hi, this is a comment');
            Report.addComment(report3.reportID, 'Hi, this is a comment');

            const reportCollectionDataSet: ReportCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.REPORT}${report1.reportID}`]: report1,
                [`${ONYXKEYS.COLLECTION.REPORT}${report2.reportID}`]: report2,
                [`${ONYXKEYS.COLLECTION.REPORT}${report3.reportID}`]: report3,
            };

            return (
                waitForBatchedUpdates()
                    .then(() => LHNTestUtils.getDefaultRenderedSidebarLinks())

                    // When Onyx is updated with the data and the sidebar re-renders
                    .then(() =>
                        Onyx.multiSet({
                            [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.DEFAULT,
                            [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
                            [ONYXKEYS.IS_LOADING_APP]: false,
                            ...reportCollectionDataSet,
                        }),
                    )

                    // When a new comment is added to report 1 (eg. it's lastVisibleActionCreated is updated)
                    .then(() =>
                        Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report1.reportID}`, {
                            lastVisibleActionCreated: DateUtils.getDBTime(),
                        }),
                    )

                    // Then the order of the reports should be 1 > 3 > 2
                    //                                         ^--- (1 goes to the front and pushes other two down)
                    .then(() => {
                        const hintText = Localize.translateLocal('accessibilityHints.chatUserDisplayNames');
                        const displayNames = screen.queryAllByLabelText(hintText);
                        expect(displayNames).toHaveLength(3);
                        expect(displayNames[0]).toHaveTextContent('One, Two');
                        expect(displayNames[1]).toHaveTextContent('Five, Six');
                        expect(displayNames[2]).toHaveTextContent('Three, Four');
                    })
            );
        });

        it('reorders the reports to have a newly created task report on top', () => {
            // Given three reports in the recently updated order of 3, 2, 1
            const report1 = LHNTestUtils.getFakeReport([1, 2], 4);
            const report2 = LHNTestUtils.getFakeReport([3, 4], 3);
            const report3 = LHNTestUtils.getFakeReport([5, 6], 2);

            const taskReportName = 'Buy Grocery';
            const taskReport: OnyxTypes.Report = {
                ...LHNTestUtils.getFakeReport([7, 8], 1),
                type: CONST.REPORT.TYPE.TASK,
                reportName: taskReportName,
                managerID: 2,
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            };

            // Each report has at least one ADD_COMMENT action so should be rendered in the LNH
            Report.addComment(report1.reportID, 'Hi, this is a comment');
            Report.addComment(report2.reportID, 'Hi, this is a comment');
            Report.addComment(report3.reportID, 'Hi, this is a comment');

            const reportCollectionDataSet: ReportCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.REPORT}${report1.reportID}`]: report1,
                [`${ONYXKEYS.COLLECTION.REPORT}${report2.reportID}`]: report2,
                [`${ONYXKEYS.COLLECTION.REPORT}${report3.reportID}`]: report3,
                [`${ONYXKEYS.COLLECTION.REPORT}${taskReport.reportID}`]: taskReport,
            };

            return (
                waitForBatchedUpdates()
                    .then(() => LHNTestUtils.getDefaultRenderedSidebarLinks(taskReport.reportID))

                    // When Onyx is updated with the data and the sidebar re-renders
                    .then(() =>
                        Onyx.multiSet({
                            [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.DEFAULT,
                            [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
                            [ONYXKEYS.IS_LOADING_APP]: false,
                            ...reportCollectionDataSet,
                        }),
                    )

                    // Then the order of the reports should be 4 > 3 > 2 > 1
                    .then(() => {
                        const hintText = Localize.translateLocal('accessibilityHints.chatUserDisplayNames');
                        const displayNames = screen.queryAllByLabelText(hintText);
                        expect(displayNames).toHaveLength(4);
                        expect(displayNames[0]).toHaveTextContent(taskReportName);
                        expect(displayNames[1]).toHaveTextContent('Five, Six');
                        expect(displayNames[2]).toHaveTextContent('Three, Four');
                        expect(displayNames[3]).toHaveTextContent('One, Two');
                    })
            );
        });

        it('reorders the reports to have a newly created iou report on top', () => {
            // Given three reports in the recently updated order of 3, 2, 1
            const report1 = LHNTestUtils.getFakeReport([1, 2], 4);
            const report2 = LHNTestUtils.getFakeReport([3, 4], 3);
            const report3: OnyxTypes.Report = {
                ...LHNTestUtils.getFakeReport([5, 6], 2),
                hasOutstandingChildRequest: false,

                // This has to be added after the IOU report is generated
                iouReportID: undefined,
            };
            const iouReport: OnyxTypes.Report = {
                ...LHNTestUtils.getFakeReport([7, 8], 1),
                type: CONST.REPORT.TYPE.IOU,
                ownerAccountID: 2,
                managerID: 2,
                hasOutstandingChildRequest: true,
                total: 10000,
                currency: 'USD',
                chatReportID: report3.reportID,
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            };
            report3.iouReportID = iouReport.reportID;

            // Each report has at least one ADD_COMMENT action so should be rendered in the LNH
            Report.addComment(report1.reportID, 'Hi, this is a comment');
            Report.addComment(report2.reportID, 'Hi, this is a comment');
            Report.addComment(report3.reportID, 'Hi, this is a comment');

            const reportCollectionDataSet: ReportCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.REPORT}${report1.reportID}`]: report1,
                [`${ONYXKEYS.COLLECTION.REPORT}${report2.reportID}`]: report2,
                [`${ONYXKEYS.COLLECTION.REPORT}${report3.reportID}`]: report3,
                [`${ONYXKEYS.COLLECTION.REPORT}${iouReport.reportID}`]: iouReport,
            };

            return (
                waitForBatchedUpdates()
                    .then(() => LHNTestUtils.getDefaultRenderedSidebarLinks(report3.reportID))

                    // When Onyx is updated with the data and the sidebar re-renders
                    .then(() =>
                        Onyx.multiSet({
                            [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.DEFAULT,
                            [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
                            [ONYXKEYS.IS_LOADING_APP]: false,
                            ...reportCollectionDataSet,
                        }),
                    )

                    // Then the order of the reports should be 4 > 3 > 2 > 1
                    .then(() => {
                        const hintText = Localize.translateLocal('accessibilityHints.chatUserDisplayNames');
                        const displayNames = screen.queryAllByLabelText(hintText);
                        expect(displayNames).toHaveLength(4);
                        expect(displayNames[0]).toHaveTextContent('Email Two owes $100.00');
                        expect(displayNames[1]).toHaveTextContent('Five, Six');
                        expect(displayNames[2]).toHaveTextContent('Three, Four');
                        expect(displayNames[3]).toHaveTextContent('One, Two');
                    })
            );
        });

        it('reorders the reports to have a newly created expense report on top', () => {
            // Given three reports in the recently updated order of 3, 2, 1
            const report1 = LHNTestUtils.getFakeReport([1, 2], 4);
            const report2 = LHNTestUtils.getFakeReport([3, 4], 3);
            const fakeReport = LHNTestUtils.getFakeReportWithPolicy([5, 6], 2);
            const fakePolicy = LHNTestUtils.getFakePolicy(fakeReport.policyID);
            const report3: OnyxTypes.Report = {
                ...fakeReport,
                hasOutstandingChildRequest: false,

                // This has to be added after the IOU report is generated
                iouReportID: undefined,
            };
            const expenseReport: OnyxTypes.Report = {
                ...LHNTestUtils.getFakeReport([7, 8], 1),
                type: CONST.REPORT.TYPE.EXPENSE,
                ownerAccountID: 7,
                managerID: 7,
                policyName: 'Workspace',
                total: -10000,
                currency: 'USD',
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                chatReportID: report3.reportID,
                parentReportID: report3.reportID,
            };
            report3.iouReportID = expenseReport.reportID;

            // Each report has at least one ADD_COMMENT action so should be rendered in the LNH
            Report.addComment(report1.reportID, 'Hi, this is a comment');
            Report.addComment(report2.reportID, 'Hi, this is a comment');
            Report.addComment(report3.reportID, 'Hi, this is a comment');

            const reportCollectionDataSet: ReportCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.REPORT}${report1.reportID}`]: report1,
                [`${ONYXKEYS.COLLECTION.REPORT}${report2.reportID}`]: report2,
                [`${ONYXKEYS.COLLECTION.REPORT}${report3.reportID}`]: report3,
                [`${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`]: expenseReport,
            };

            return (
                waitForBatchedUpdates()
                    .then(() => LHNTestUtils.getDefaultRenderedSidebarLinks(report3.reportID))

                    // When Onyx is updated with the data and the sidebar re-renders
                    .then(() =>
                        Onyx.multiSet({
                            [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.DEFAULT,
                            [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
                            [ONYXKEYS.IS_LOADING_APP]: false,
                            [`${ONYXKEYS.COLLECTION.POLICY}${fakeReport.policyID}`]: fakePolicy,
                            ...reportCollectionDataSet,
                        }),
                    )

                    // Then the order of the reports should be 4 > 3 > 2 > 1
                    .then(() => {
                        const hintText = Localize.translateLocal('accessibilityHints.chatUserDisplayNames');
                        const displayNames = screen.queryAllByLabelText(hintText);
                        expect(displayNames).toHaveLength(4);
                        expect(displayNames[0]).toHaveTextContent('Workspace owes $100.00');
                        expect(displayNames[1]).toHaveTextContent('Email Five');
                        expect(displayNames[2]).toHaveTextContent('Three, Four');
                        expect(displayNames[3]).toHaveTextContent('One, Two');
                    })
            );
        });

        it('reorders the reports to keep draft reports on top', () => {
            // Given three reports in the recently updated order of 3, 2, 1
            // And the second report has a draft
            // And the currently viewed report is the second report
            const report1 = LHNTestUtils.getFakeReport([1, 2], 3);
            const report2: OnyxTypes.Report = {
                ...LHNTestUtils.getFakeReport([3, 4], 2),
            };
            const report3 = LHNTestUtils.getFakeReport([5, 6], 1);

            // Each report has at least one ADD_COMMENT action so should be rendered in the LNH
            Report.addComment(report1.reportID, 'Hi, this is a comment');
            Report.addComment(report2.reportID, 'Hi, this is a comment');
            Report.addComment(report3.reportID, 'Hi, this is a comment');

            const currentReportId = report2.reportID;

            const reportCollectionDataSet: ReportCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.REPORT}${report1.reportID}`]: report1,
                [`${ONYXKEYS.COLLECTION.REPORT}${report2.reportID}`]: report2,
                [`${ONYXKEYS.COLLECTION.REPORT}${report3.reportID}`]: report3,
            };

            return (
                waitForBatchedUpdates()
                    .then(() => LHNTestUtils.getDefaultRenderedSidebarLinks(currentReportId))

                    // When Onyx is updated with the data and the sidebar re-renders
                    .then(() =>
                        Onyx.multiSet({
                            [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.DEFAULT,
                            [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
                            [ONYXKEYS.IS_LOADING_APP]: false,
                            [ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT + report2.reportID]: 'This is a draft',
                            ...reportCollectionDataSet,
                        }),
                    )

                    // When the currently active chat is switched to report 1 (the one on the bottom)
                    .then(() => {
                        // The changing of a route itself will re-render the component in the App, but since we are not performing this test
                        // inside the navigator and it has no access to the routes we need to trigger an update to the SidebarLinks manually.
                        LHNTestUtils.getDefaultRenderedSidebarLinks('1');
                        return waitForBatchedUpdates();
                    })

                    // Then the order of the reports should be 2 > 3 > 1
                    //                                         ^--- (2 goes to the front and pushes 3 down)
                    .then(() => {
                        const hintText = Localize.translateLocal('accessibilityHints.chatUserDisplayNames');
                        const displayNames = screen.queryAllByLabelText(hintText);
                        expect(displayNames).toHaveLength(3);
                        expect(displayNames[0]).toHaveTextContent('Three, Four');
                        expect(displayNames[1]).toHaveTextContent('Five, Six');
                        expect(displayNames[2]).toHaveTextContent('One, Two');
                    })
            );
        });

        it('removes the pencil icon when draft is removed', () => {
            // Given a single report
            // And the report has a draft
            const report: OnyxTypes.Report = {
                ...LHNTestUtils.getFakeReport([1, 2]),
            };

            const reportCollectionDataSet: ReportCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`]: report,
            };

            return (
                waitForBatchedUpdates()
                    .then(() => LHNTestUtils.getDefaultRenderedSidebarLinks())

                    // When Onyx is updated with the data and the sidebar re-renders
                    .then(() =>
                        Onyx.multiSet({
                            [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.DEFAULT,
                            [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
                            [ONYXKEYS.IS_LOADING_APP]: false,
                            [`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${report.reportID}`]: 'This is a draft',
                            ...reportCollectionDataSet,
                        }),
                    )

                    // Then there should be a pencil icon showing
                    .then(() => {
                        expect(screen.queryAllByTestId('Pencil Icon')).toHaveLength(1);
                    })

                    // When the draft is removed
                    .then(() => Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${report.reportID}`, null))

                    // Then the pencil icon goes away
                    .then(() => {
                        expect(screen.queryAllByTestId('Pencil Icon')).toHaveLength(0);
                    })
            );
        });

        it('removes the pin icon when chat is unpinned', () => {
            // Given a single report
            // And the report is pinned
            const report: OnyxTypes.Report = {
                ...LHNTestUtils.getFakeReport([1, 2]),
                isPinned: true,
            };

            const reportCollectionDataSet: ReportCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`]: report,
            };

            return (
                waitForBatchedUpdates()
                    .then(() => LHNTestUtils.getDefaultRenderedSidebarLinks())

                    // When Onyx is updated with the data and the sidebar re-renders
                    .then(() =>
                        Onyx.multiSet({
                            [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.DEFAULT,
                            [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
                            [ONYXKEYS.IS_LOADING_APP]: false,
                            ...reportCollectionDataSet,
                        }),
                    )

                    // Then there should be a pencil icon showing
                    .then(() => {
                        expect(screen.queryAllByTestId('Pin Icon')).toHaveLength(1);
                    })

                    // When the draft is removed
                    .then(() => Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, {isPinned: false}))

                    // Then the pencil icon goes away
                    .then(() => {
                        expect(screen.queryAllByTestId('Pin Icon')).toHaveLength(0);
                    })
            );
        });

        it('sorts chats by pinned > IOU > draft', () => {
            // Given three reports in the recently updated order of 3, 2, 1
            // with the current user set to email9@ (someone not participating in any of the chats)
            // with a report that has a draft, a report that is pinned, and
            //    an outstanding IOU report that doesn't belong to the current user
            const report1: OnyxTypes.Report = {
                ...LHNTestUtils.getFakeReport([1, 2], 3),
                isPinned: true,
            };
            const report2: OnyxTypes.Report = {
                ...LHNTestUtils.getFakeReport([3, 4], 2),
            };
            const report3: OnyxTypes.Report = {
                ...LHNTestUtils.getFakeReport([5, 6], 1),
                hasOutstandingChildRequest: false,

                // This has to be added after the IOU report is generated
                iouReportID: undefined,
            };
            const iouReport: OnyxTypes.Report = {
                ...LHNTestUtils.getFakeReport([7, 8]),
                type: CONST.REPORT.TYPE.IOU,
                ownerAccountID: 2,
                managerID: 2,
                hasOutstandingChildRequest: true,
                total: 10000,
                currency: 'USD',
                chatReportID: report3.reportID,
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            };
            report3.iouReportID = iouReport.reportID;

            const currentReportId = report2.reportID;
            const currentlyLoggedInUserAccountID = 9;

            const reportCollectionDataSet: ReportCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.REPORT}${report1.reportID}`]: report1,
                [`${ONYXKEYS.COLLECTION.REPORT}${report2.reportID}`]: report2,
                [`${ONYXKEYS.COLLECTION.REPORT}${report3.reportID}`]: report3,
                [`${ONYXKEYS.COLLECTION.REPORT}${iouReport.reportID}`]: iouReport,
            };

            return (
                waitForBatchedUpdates()
                    .then(() => LHNTestUtils.getDefaultRenderedSidebarLinks(currentReportId))

                    // When Onyx is updated with the data and the sidebar re-renders
                    .then(() =>
                        Onyx.multiSet({
                            [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.DEFAULT,
                            [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
                            [ONYXKEYS.IS_LOADING_APP]: false,
                            [ONYXKEYS.SESSION]: {accountID: currentlyLoggedInUserAccountID},
                            [`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${report2.reportID}`]: 'Report2 draft comment',
                            ...reportCollectionDataSet,
                        }),
                    )

                    // Then the reports are ordered by Pinned > IOU > Draft
                    // there is a pencil icon
                    // there is a pinned icon
                    .then(() => {
                        const hintText = Localize.translateLocal('accessibilityHints.chatUserDisplayNames');
                        const displayNames = screen.queryAllByLabelText(hintText);
                        expect(displayNames).toHaveLength(3);
                        expect(screen.queryAllByTestId('Pin Icon')).toHaveLength(1);
                        expect(screen.queryAllByTestId('Pencil Icon')).toHaveLength(1);
                        expect(displayNames[0]).toHaveTextContent('Email Two owes $100.00');
                        expect(displayNames[1]).toHaveTextContent('One, Two');
                        expect(displayNames[2]).toHaveTextContent('Three, Four');
                    })
            );
        });

        it('alphabetizes all the chats that are pinned', () => {
            // Given three reports in the recently updated order of 3, 2, 1
            // and they are all pinned
            const report1: OnyxTypes.Report = {
                ...LHNTestUtils.getFakeReport([1, 2], 3),
                isPinned: true,
            };
            const report2: OnyxTypes.Report = {
                ...LHNTestUtils.getFakeReport([3, 4], 2),
                isPinned: true,
            };
            const report3: OnyxTypes.Report = {
                ...LHNTestUtils.getFakeReport([5, 6], 1),
                isPinned: true,
            };
            const report4: OnyxTypes.Report = {
                ...LHNTestUtils.getFakeReport([7, 8], 0),
                isPinned: true,
            };

            const reportCollectionDataSet: ReportCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.REPORT}${report1.reportID}`]: report1,
                [`${ONYXKEYS.COLLECTION.REPORT}${report2.reportID}`]: report2,
                [`${ONYXKEYS.COLLECTION.REPORT}${report3.reportID}`]: report3,
            };

            return (
                waitForBatchedUpdates()
                    .then(() => LHNTestUtils.getDefaultRenderedSidebarLinks('0'))

                    // When Onyx is updated with the data and the sidebar re-renders
                    .then(() =>
                        Onyx.multiSet({
                            [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.DEFAULT,
                            [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
                            [ONYXKEYS.IS_LOADING_APP]: false,
                            ...reportCollectionDataSet,
                        }),
                    )

                    // Then the reports are in alphabetical order
                    .then(() => {
                        const hintText = Localize.translateLocal('accessibilityHints.chatUserDisplayNames');
                        const displayNames = screen.queryAllByLabelText(hintText);
                        expect(displayNames).toHaveLength(3);
                        expect(displayNames[0]).toHaveTextContent('Five, Six');
                        expect(displayNames[1]).toHaveTextContent('One, Two');
                        expect(displayNames[2]).toHaveTextContent('Three, Four');
                    })

                    // When a new report is added
                    .then(() => Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report4.reportID}`, report4))

                    // Then they are still in alphabetical order
                    .then(() => {
                        const hintText = Localize.translateLocal('accessibilityHints.chatUserDisplayNames');
                        const displayNames = screen.queryAllByLabelText(hintText);
                        expect(displayNames).toHaveLength(4);
                        expect(displayNames[0]).toHaveTextContent('Five, Six');
                        expect(displayNames[1]).toHaveTextContent('One, Two');
                        expect(displayNames[2]).toHaveTextContent('Seven, Eight');
                        expect(displayNames[3]).toHaveTextContent('Three, Four');
                    })
            );
        });

        it('alphabetizes all the chats that have drafts', () => {
            // Given three reports in the recently updated order of 3, 2, 1
            // and they all have drafts
            const report1: OnyxTypes.Report = {
                ...LHNTestUtils.getFakeReport([1, 2], 3),
            };
            const report2: OnyxTypes.Report = {
                ...LHNTestUtils.getFakeReport([3, 4], 2),
            };
            const report3: OnyxTypes.Report = {
                ...LHNTestUtils.getFakeReport([5, 6], 1),
            };
            const report4: OnyxTypes.Report = {
                ...LHNTestUtils.getFakeReport([7, 8], 0),
            };

            const reportCollectionDataSet: ReportCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.REPORT}${report1.reportID}`]: report1,
                [`${ONYXKEYS.COLLECTION.REPORT}${report2.reportID}`]: report2,
                [`${ONYXKEYS.COLLECTION.REPORT}${report3.reportID}`]: report3,
            };

            const reportDraftCommentCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${report1.reportID}`]: 'report1 draft',
                [`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${report2.reportID}`]: 'report2 draft',
                [`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${report3.reportID}`]: 'report3 draft',
            };

            return (
                waitForBatchedUpdates()
                    .then(() => LHNTestUtils.getDefaultRenderedSidebarLinks('0'))

                    // When Onyx is updated with the data and the sidebar re-renders
                    .then(() =>
                        Onyx.multiSet({
                            [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.DEFAULT,
                            [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
                            [ONYXKEYS.IS_LOADING_APP]: false,
                            ...reportDraftCommentCollectionDataSet,
                            ...reportCollectionDataSet,
                        }),
                    )

                    // Then the reports are in alphabetical order
                    .then(() => {
                        const hintText = Localize.translateLocal('accessibilityHints.chatUserDisplayNames');
                        const displayNames = screen.queryAllByLabelText(hintText);
                        expect(displayNames).toHaveLength(3);
                        expect(displayNames[0]).toHaveTextContent('Five, Six');
                        expect(displayNames[1]).toHaveTextContent('One, Two');
                        expect(displayNames[2]).toHaveTextContent('Three, Four');
                    })

                    // When a new report is added
                    .then(() =>
                        Onyx.multiSet({
                            ...reportDraftCommentCollectionDataSet,
                            [`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${report4.reportID}`]: 'report4 draft',
                            ...reportCollectionDataSet,
                            [`${ONYXKEYS.COLLECTION.REPORT}${report4.reportID}`]: report4,
                        }),
                    )

                    // Then they are still in alphabetical order
                    .then(() => {
                        const hintText = Localize.translateLocal('accessibilityHints.chatUserDisplayNames');
                        const displayNames = screen.queryAllByLabelText(hintText);
                        expect(displayNames).toHaveLength(4);
                        expect(displayNames[0]).toHaveTextContent('Five, Six');
                        expect(displayNames[1]).toHaveTextContent('One, Two');
                        expect(displayNames[2]).toHaveTextContent('Seven, Eight');
                        expect(displayNames[3]).toHaveTextContent('Three, Four');
                    })
            );
        });

        it('puts archived chats last', () => {
            // Given three reports, with the first report being archived
            const report1: OnyxTypes.Report = {
                ...LHNTestUtils.getFakeReport([1, 2]),
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
                statusNum: CONST.REPORT.STATUS_NUM.CLOSED,
                stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                // eslint-disable-next-line @typescript-eslint/naming-convention
                private_isArchived: DateUtils.getDBTime(),
            };
            const report2 = LHNTestUtils.getFakeReport([3, 4]);
            const report3 = LHNTestUtils.getFakeReport([5, 6]);

            // Each report has at least one ADD_COMMENT action so should be rendered in the LNH
            Report.addComment(report1.reportID, 'Hi, this is a comment');
            Report.addComment(report2.reportID, 'Hi, this is a comment');
            Report.addComment(report3.reportID, 'Hi, this is a comment');

            // Given the user is in all betas
            const betas = [CONST.BETAS.DEFAULT_ROOMS];

            const reportCollectionDataSet: ReportCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.REPORT}${report1.reportID}`]: report1,
                [`${ONYXKEYS.COLLECTION.REPORT}${report2.reportID}`]: report2,
                [`${ONYXKEYS.COLLECTION.REPORT}${report3.reportID}`]: report3,
            };

            return (
                waitForBatchedUpdates()
                    .then(() => LHNTestUtils.getDefaultRenderedSidebarLinks('0'))

                    // When Onyx is updated with the data and the sidebar re-renders
                    .then(() =>
                        Onyx.multiSet({
                            [ONYXKEYS.BETAS]: betas,
                            [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.DEFAULT,
                            [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
                            [ONYXKEYS.IS_LOADING_APP]: false,
                            ...reportCollectionDataSet,
                        }),
                    )

                    // Then the first report is in last position
                    .then(() => {
                        const hintText = Localize.translateLocal('accessibilityHints.chatUserDisplayNames');
                        const displayNames = screen.queryAllByLabelText(hintText);
                        expect(displayNames).toHaveLength(3);
                        expect(displayNames[0]).toHaveTextContent('Five, Six');
                        expect(displayNames[1]).toHaveTextContent('Three, Four');
                        expect(displayNames[2]).toHaveTextContent('Report (archived)');
                    })
            );
        });
    });

    describe('in #focus mode', () => {
        it('alphabetizes chats', () => {
            const report1 = {...LHNTestUtils.getFakeReport([1, 2], 3, true), lastMessageText: 'test'};
            const report2 = {...LHNTestUtils.getFakeReport([3, 4], 2, true), lastMessageText: 'test'};
            const report3 = {...LHNTestUtils.getFakeReport([5, 6], 1, true), lastMessageText: 'test'};
            const report4 = {...LHNTestUtils.getFakeReport([7, 8], 0, true), lastMessageText: 'test'};

            const reportCollectionDataSet: ReportCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.REPORT}${report1.reportID}`]: report1,
                [`${ONYXKEYS.COLLECTION.REPORT}${report2.reportID}`]: report2,
                [`${ONYXKEYS.COLLECTION.REPORT}${report3.reportID}`]: report3,
            };

            return (
                waitForBatchedUpdates()
                    .then(() => Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, LHNTestUtils.fakePersonalDetails))
                    .then(() => LHNTestUtils.getDefaultRenderedSidebarLinks('0'))
                    // Given the sidebar is rendered in #focus mode (hides read chats)
                    // with all reports having unread comments
                    .then(() =>
                        Onyx.multiSet({
                            [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.GSD,
                            [ONYXKEYS.IS_LOADING_APP]: false,
                            ...reportCollectionDataSet,
                        }),
                    )

                    // Then the reports are in alphabetical order
                    .then(() => {
                        const hintText = Localize.translateLocal('accessibilityHints.chatUserDisplayNames');
                        const displayNames = screen.queryAllByLabelText(hintText);
                        expect(displayNames).toHaveLength(3);
                        expect(displayNames[0]).toHaveTextContent('Five, Six');
                        expect(displayNames[1]).toHaveTextContent('One, Two');
                        expect(displayNames[2]).toHaveTextContent('Three, Four');
                    })

                    // When a new report is added
                    .then(() => Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report4.reportID}`, report4))

                    // Then they are still in alphabetical order
                    .then(() => {
                        const hintText = Localize.translateLocal('accessibilityHints.chatUserDisplayNames');
                        const displayNames = screen.queryAllByLabelText(hintText);
                        expect(displayNames).toHaveLength(4);
                        expect(displayNames[0]).toHaveTextContent('Five, Six');
                        expect(displayNames[1]).toHaveTextContent('One, Two');
                        expect(displayNames[2]).toHaveTextContent('Seven, Eight');
                        expect(displayNames[3]).toHaveTextContent('Three, Four');
                    })
            );
        });

        it('puts archived chats last', () => {
            // Given three unread reports, with the first report being archived
            const report1 = {
                ...LHNTestUtils.getFakeReport([1, 2], 3, true),
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
                statusNum: CONST.REPORT.STATUS_NUM.CLOSED,
                stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                lastMessageText: 'test',
                // eslint-disable-next-line @typescript-eslint/naming-convention
                private_isArchived: DateUtils.getDBTime(),
            };
            const report2 = {
                ...LHNTestUtils.getFakeReport([3, 4], 2, true),
                lastMessageText: 'test',
            };
            const report3 = {...LHNTestUtils.getFakeReport([5, 6], 1, true), lastMessageText: 'test'};

            // Given the user is in all betas
            const betas = [CONST.BETAS.DEFAULT_ROOMS];

            const reportCollectionDataSet: ReportCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.REPORT}${report1.reportID}`]: report1,
                [`${ONYXKEYS.COLLECTION.REPORT}${report2.reportID}`]: report2,
                [`${ONYXKEYS.COLLECTION.REPORT}${report3.reportID}`]: report3,
            };

            return (
                waitForBatchedUpdates()
                    .then(() => LHNTestUtils.getDefaultRenderedSidebarLinks('0'))

                    // When Onyx is updated with the data and the sidebar re-renders
                    .then(() =>
                        Onyx.multiSet({
                            [ONYXKEYS.BETAS]: betas,
                            [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.GSD,
                            [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
                            [ONYXKEYS.IS_LOADING_APP]: false,
                            ...reportCollectionDataSet,
                        }),
                    )

                    // Then the first report is in last position
                    .then(() => {
                        const hintText = Localize.translateLocal('accessibilityHints.chatUserDisplayNames');
                        const displayNames = screen.queryAllByLabelText(hintText);
                        expect(displayNames).toHaveLength(3);
                        expect(displayNames[0]).toHaveTextContent('Five, Six');
                        expect(displayNames[1]).toHaveTextContent('Three, Four');
                        expect(displayNames[2]).toHaveTextContent('Report (archived)');
                    })
            );
        });

        it('orders IOU reports by displayName if amounts are the same', () => {
            // Given three IOU reports containing the same IOU amounts
            const report1: OnyxTypes.Report = {
                ...LHNTestUtils.getFakeReport([1, 2]),

                // This has to be added after the IOU report is generated
                iouReportID: undefined,
            };
            const report2: OnyxTypes.Report = {
                ...LHNTestUtils.getFakeReport([3, 4]),

                // This has to be added after the IOU report is generated
                iouReportID: undefined,
            };
            const report3: OnyxTypes.Report = {
                ...LHNTestUtils.getFakeReport([5, 6]),

                // This has to be added after the IOU report is generated
                iouReportID: undefined,
            };
            const report4: OnyxTypes.Report = {
                ...LHNTestUtils.getFakeReport([5, 6]),

                // This has to be added after the IOU report is generated
                iouReportID: undefined,
            };
            const report5: OnyxTypes.Report = {
                ...LHNTestUtils.getFakeReport([5, 6]),

                // This has to be added after the IOU report is generated
                iouReportID: undefined,
            };
            const iouReport1: OnyxTypes.Report = {
                ...LHNTestUtils.getFakeReport([7, 8]),
                type: CONST.REPORT.TYPE.IOU,
                ownerAccountID: 2,
                managerID: 2,
                hasOutstandingChildRequest: true,
                total: 10000,
                currency: 'USD',
                chatReportID: report3.reportID,
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            };
            const iouReport2: OnyxTypes.Report = {
                ...LHNTestUtils.getFakeReport([9, 10]),
                type: CONST.REPORT.TYPE.IOU,
                ownerAccountID: 2,
                managerID: 3,
                hasOutstandingChildRequest: true,
                total: 10000,
                currency: 'USD',
                chatReportID: report3.reportID,
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            };
            const iouReport3: OnyxTypes.Report = {
                ...LHNTestUtils.getFakeReport([11, 12]),
                type: CONST.REPORT.TYPE.IOU,
                ownerAccountID: 2,
                managerID: 4,
                hasOutstandingChildRequest: true,
                total: 100000,
                currency: 'USD',
                chatReportID: report3.reportID,
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            };
            const iouReport4: OnyxTypes.Report = {
                ...LHNTestUtils.getFakeReport([11, 12]),
                type: CONST.REPORT.TYPE.IOU,
                ownerAccountID: 2,
                managerID: 5,
                hasOutstandingChildRequest: true,
                total: 10000,
                currency: 'USD',
                chatReportID: report3.reportID,
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            };
            const iouReport5: OnyxTypes.Report = {
                ...LHNTestUtils.getFakeReport([11, 12]),
                type: CONST.REPORT.TYPE.IOU,
                ownerAccountID: 2,
                managerID: 6,
                hasOutstandingChildRequest: true,
                total: 10000,
                currency: 'USD',
                chatReportID: report3.reportID,
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            };

            report1.iouReportID = iouReport1.reportID;
            report2.iouReportID = iouReport2.reportID;
            report3.iouReportID = iouReport3.reportID;
            report4.iouReportID = iouReport4.reportID;
            report5.iouReportID = iouReport5.reportID;

            const currentlyLoggedInUserAccountID = 13;

            const reportCollectionDataSet: ReportCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.REPORT}${report1.reportID}`]: report1,
                [`${ONYXKEYS.COLLECTION.REPORT}${report2.reportID}`]: report2,
                [`${ONYXKEYS.COLLECTION.REPORT}${report3.reportID}`]: report3,
                [`${ONYXKEYS.COLLECTION.REPORT}${report4.reportID}`]: report4,
                [`${ONYXKEYS.COLLECTION.REPORT}${report5.reportID}`]: report5,
                [`${ONYXKEYS.COLLECTION.REPORT}${iouReport1.reportID}`]: iouReport1,
                [`${ONYXKEYS.COLLECTION.REPORT}${iouReport2.reportID}`]: iouReport2,
                [`${ONYXKEYS.COLLECTION.REPORT}${iouReport3.reportID}`]: iouReport3,
                [`${ONYXKEYS.COLLECTION.REPORT}${iouReport4.reportID}`]: iouReport4,
                [`${ONYXKEYS.COLLECTION.REPORT}${iouReport5.reportID}`]: iouReport5,
            };

            return (
                waitForBatchedUpdates()
                    .then(() => LHNTestUtils.getDefaultRenderedSidebarLinks('0'))
                    // When Onyx is updated with the data and the sidebar re-renders
                    .then(() =>
                        Onyx.multiSet({
                            [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.DEFAULT,
                            [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
                            [ONYXKEYS.IS_LOADING_APP]: false,
                            [ONYXKEYS.SESSION]: {accountID: currentlyLoggedInUserAccountID},
                            ...reportCollectionDataSet,
                        }),
                    )

                    // Then the reports with the same amount are ordered alphabetically
                    .then(() => {
                        const hintText = Localize.translateLocal('accessibilityHints.chatUserDisplayNames');
                        const displayNames = screen.queryAllByLabelText(hintText);
                        expect(displayNames).toHaveLength(5);
                        expect(displayNames[0]).toHaveTextContent('Email Five owes $100.00');
                        expect(displayNames[1]).toHaveTextContent('Email Four owes $1,000.00');
                        expect(displayNames[2]).toHaveTextContent('Email Six owes $100.00');
                        expect(displayNames[3]).toHaveTextContent('Email Three owes $100.00');
                        expect(displayNames[4]).toHaveTextContent('Email Two owes $100.00');
                    })
            );
        });

        it('orders nonArchived reports by displayName if created timestamps are the same', () => {
            // Given three nonArchived reports created at the same time
            const lastVisibleActionCreated = DateUtils.getDBTime();
            const report1: OnyxTypes.Report = {
                ...LHNTestUtils.getFakeReport([1, 2]),
                lastVisibleActionCreated,
            };
            const report2: OnyxTypes.Report = {
                ...LHNTestUtils.getFakeReport([3, 4]),
                lastVisibleActionCreated,
            };
            const report3: OnyxTypes.Report = {
                ...LHNTestUtils.getFakeReport([5, 6]),
                lastVisibleActionCreated,
            };

            // Each report has at least one ADD_COMMENT action so should be rendered in the LNH
            Report.addComment(report1.reportID, 'Hi, this is a comment');
            Report.addComment(report2.reportID, 'Hi, this is a comment');
            Report.addComment(report3.reportID, 'Hi, this is a comment');

            const reportCollectionDataSet: ReportCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.REPORT}${report1.reportID}`]: report1,
                [`${ONYXKEYS.COLLECTION.REPORT}${report2.reportID}`]: report2,
                [`${ONYXKEYS.COLLECTION.REPORT}${report3.reportID}`]: report3,
            };

            return (
                waitForBatchedUpdates()
                    .then(() => LHNTestUtils.getDefaultRenderedSidebarLinks('0'))

                    // When Onyx is updated with the data and the sidebar re-renders
                    .then(() =>
                        Onyx.multiSet({
                            [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.DEFAULT,
                            [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
                            [ONYXKEYS.IS_LOADING_APP]: false,
                            ...reportCollectionDataSet,
                        }),
                    )

                    // Then the reports are ordered alphabetically since their lastVisibleActionCreated are the same
                    .then(() => {
                        const hintText = Localize.translateLocal('accessibilityHints.chatUserDisplayNames');
                        const displayNames = screen.queryAllByLabelText(hintText);
                        expect(displayNames).toHaveLength(3);
                        expect(displayNames[0]).toHaveTextContent('Five, Six');
                        expect(displayNames[1]).toHaveTextContent('One, Two');
                        expect(displayNames[2]).toHaveTextContent('Three, Four');
                    })
            );
        });
    });
});
