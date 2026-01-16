import type * as reactNavigationNativeImport from '@react-navigation/native';
import {screen} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import {addComment} from '@libs/actions/Report';
import DateUtils from '@libs/DateUtils';
import initOnyxDerivedValues from '@userActions/OnyxDerived';
import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import type * as OnyxTypes from '@src/types/onyx';
import type {ReportCollectionDataSet} from '@src/types/onyx/Report';
import type {ReportNameValuePairsCollectionDataSet} from '@src/types/onyx/ReportNameValuePairs';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import * as TestHelper from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import wrapOnyxWithWaitForBatchedUpdates from '../utils/wrapOnyxWithWaitForBatchedUpdates';

// Be sure to include the mocked Permissions and Expensicons libraries or else the beta tests won't work
jest.mock('@libs/Permissions');
jest.mock('@components/Icon/Expensicons');
jest.mock('@src/hooks/useResponsiveLayout');
jest.mock('@react-navigation/native', () => ({
    ...jest.requireActual<typeof reactNavigationNativeImport>('@react-navigation/native'),
    useNavigationState: () => true,
    useIsFocused: () => true,
    useRoute: () => ({name: 'Home'}),
    useNavigation: () => undefined,
    useFocusEffect: () => undefined,
}));

function assertSidebarOptionsAlphabetical() {
    const firstElement = screen.queryByTestId('DisplayNames-0');
    const secondElement = screen.queryByTestId('DisplayNames-1');
    const thirdElement = screen.queryByTestId('DisplayNames-2');
    const fourthElement = screen.queryByTestId('DisplayNames-3');

    expect(firstElement).toHaveTextContent('Email Five');
    expect(secondElement).toHaveTextContent('Email Four');
    expect(thirdElement).toHaveTextContent('Email Three');
    expect(fourthElement).toHaveTextContent('Email Two');
}
// Mock components to prevent act() warnings from state updates during render
jest.mock('@src/components/ReportActionAvatars', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const React = require('react');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const {View} = require('react-native');
    return () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        return React.createElement(View, {
            testID: 'MockedReportActionAvatars',
        });
    };
});

describe('Sidebar', () => {
    beforeAll(() => {
        Onyx.init({
            keys: ONYXKEYS,
            evictableKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        });
        initOnyxDerivedValues();
        IntlStore.load(CONST.LOCALES.EN);
        return waitForBatchedUpdates();
    });

    beforeEach(() => {
        // Wrap Onyx each onyx action with waitForBatchedUpdates
        wrapOnyxWithWaitForBatchedUpdates(Onyx);
        // Initialize the network key for OfflineWithFeedback
        return TestHelper.signInWithTestUser(1, 'email1@test.com', undefined, undefined, 'One').then(() => Onyx.merge(ONYXKEYS.NETWORK, {isOffline: false}));
    });

    // Clear out Onyx after each test so that each test starts with a clean slate
    afterEach(() => {
        Onyx.clear();
    });

    describe('in default mode', () => {
        it('is rendered with empty state when no reports are available', () => {
            // Given all the default props are passed to SidebarLinks
            // When it is rendered
            LHNTestUtils.getDefaultRenderedSidebarLinks();

            // Then it should render with the empty state message and not show the reports list
            expect(screen.getByText(TestHelper.translateLocal('common.emptyLHN.title'))).toBeOnTheScreen();
            expect(screen.queryByTestId('lhn-options-list')).not.toBeOnTheScreen();
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
                    expect(screen.queryAllByAccessibilityHint(TestHelper.getNavigateToChatHintRegex())).toHaveLength(0);
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
                        expect(screen.queryAllByText('Email Two')).toHaveLength(1);
                    })
            );
        });

        it('orders items with most recently updated on top', () => {
            // Given three unread reports in the recently updated order of 3, 2, 1
            const report1 = LHNTestUtils.getFakeReport([1, 2], 3);
            const report2 = LHNTestUtils.getFakeReport([1, 3], 2);
            const report3 = LHNTestUtils.getFakeReport([1, 4], 1);

            // Each report has at least one ADD_COMMENT action so should be rendered in the LNH
            addComment(report1, report1.reportID, [], 'Hi, this is a comment', CONST.DEFAULT_TIME_ZONE);
            addComment(report2, report2.reportID, [], 'Hi, this is a comment', CONST.DEFAULT_TIME_ZONE);
            addComment(report3, report3.reportID, [], 'Hi, this is a comment', CONST.DEFAULT_TIME_ZONE);

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
                        const hintText = TestHelper.translateLocal('accessibilityHints.chatUserDisplayNames');
                        const displayNames = screen.queryAllByLabelText(hintText);
                        expect(displayNames).toHaveLength(3);

                        expect(displayNames.at(0)).toHaveTextContent('Email Four');
                        expect(displayNames.at(1)).toHaveTextContent('Email Three');
                        expect(displayNames.at(2)).toHaveTextContent('Email Two');
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
            const report2 = LHNTestUtils.getFakeReport([1, 3], 2);
            const report3 = LHNTestUtils.getFakeReport([1, 4], 1);

            // Each report has at least one ADD_COMMENT action so should be rendered in the LNH
            addComment(report1, report1.reportID, [], 'Hi, this is a comment', CONST.DEFAULT_TIME_ZONE);
            addComment(report2, report2.reportID, [], 'Hi, this is a comment', CONST.DEFAULT_TIME_ZONE);
            addComment(report3, report3.reportID, [], 'Hi, this is a comment', CONST.DEFAULT_TIME_ZONE);

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
                        const hintText = TestHelper.translateLocal('accessibilityHints.chatUserDisplayNames');
                        const displayNames = screen.queryAllByLabelText(hintText);
                        expect(displayNames).toHaveLength(3);
                        expect(displayNames.at(0)).toHaveTextContent('Email Two'); // this has `hasDraft` flag enabled so it will be on top
                        expect(displayNames.at(1)).toHaveTextContent('Email Four');
                        expect(displayNames.at(2)).toHaveTextContent('Email Three');
                    })
            );
        });

        it('reorders the reports to always have the most recently updated one on top', () => {
            // Given three reports in the recently updated order of 3, 2, 1
            const report1 = LHNTestUtils.getFakeReport([1, 2], 3);
            const report2 = LHNTestUtils.getFakeReport([1, 3], 2);
            const report3 = LHNTestUtils.getFakeReport([1, 4], 1);

            // Each report has at least one ADD_COMMENT action so should be rendered in the LNH
            addComment(report1, report1.reportID, [], 'Hi, this is a comment', CONST.DEFAULT_TIME_ZONE);
            addComment(report2, report2.reportID, [], 'Hi, this is a comment', CONST.DEFAULT_TIME_ZONE);
            addComment(report3, report3.reportID, [], 'Hi, this is a comment', CONST.DEFAULT_TIME_ZONE);

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
                        const firstElement = screen.queryByTestId('DisplayNames-0');
                        const secondElement = screen.queryByTestId('DisplayNames-1');
                        const thirdElement = screen.queryByTestId('DisplayNames-2');

                        expect(firstElement).toHaveTextContent('Email Two');
                        expect(secondElement).toHaveTextContent('Email Four');
                        expect(thirdElement).toHaveTextContent('Email Three');
                    })
            );
        });

        it('reorders the reports to have a newly created task report on top', () => {
            // Given three reports in the recently updated order of 3, 2, 1
            const report1 = LHNTestUtils.getFakeReport([1, 2], 4);
            const report2 = LHNTestUtils.getFakeReport([1, 3], 3);
            const report3 = LHNTestUtils.getFakeReport([1, 4], 2);

            const taskReportName = 'Buy Grocery';
            const taskReport: OnyxTypes.Report = {
                ...LHNTestUtils.getFakeReport([1, 2], 1),
                type: CONST.REPORT.TYPE.TASK,
                reportName: taskReportName,
                managerID: 2,
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            };

            // Each report has at least one ADD_COMMENT action so should be rendered in the LNH
            addComment(report1, report1.reportID, [], 'Hi, this is a comment', CONST.DEFAULT_TIME_ZONE);
            addComment(report2, report2.reportID, [], 'Hi, this is a comment', CONST.DEFAULT_TIME_ZONE);
            addComment(report3, report3.reportID, [], 'Hi, this is a comment', CONST.DEFAULT_TIME_ZONE);

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
                        const hintText = TestHelper.translateLocal('accessibilityHints.chatUserDisplayNames');
                        const displayNames = screen.queryAllByLabelText(hintText);
                        expect(displayNames).toHaveLength(4);
                        expect(displayNames.at(0)).toHaveTextContent(taskReportName);
                        expect(displayNames.at(1)).toHaveTextContent('Email Four');
                        expect(displayNames.at(2)).toHaveTextContent('Email Three');
                        expect(displayNames.at(3)).toHaveTextContent('Email Two');
                    })
            );
        });

        it('reorders the reports to have a newly created iou report on top', () => {
            // Given three reports in the recently updated order of 3, 2, 1
            const report1 = LHNTestUtils.getFakeReport([1, 2], 4);
            const report2 = LHNTestUtils.getFakeReport([1, 3], 3);
            const report3: OnyxTypes.Report = {
                ...LHNTestUtils.getFakeReport([1, 4], 2),
                hasOutstandingChildRequest: true,

                // This has to be added after the IOU report is generated
                iouReportID: undefined,
            };
            const iouReport: OnyxTypes.Report = {
                ...LHNTestUtils.getFakeReport([1, 4], 1),
                type: CONST.REPORT.TYPE.IOU,
                ownerAccountID: 1,
                managerID: 4,
                hasOutstandingChildRequest: false,
                total: 10000,
                currency: 'USD',
                chatReportID: report3.reportID,
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                participants: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    1: {
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN,
                    },
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    4: {
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN,
                    },
                },
            };
            report3.iouReportID = iouReport.reportID;

            // Each report has at least one ADD_COMMENT action so should be rendered in the LNH
            addComment(report1, report1.reportID, [], 'Hi, this is a comment', CONST.DEFAULT_TIME_ZONE);
            addComment(report3, report3.reportID, [], 'Hi, this is a comment', CONST.DEFAULT_TIME_ZONE);
            addComment(report2, report2.reportID, [], 'Hi, this is a comment', CONST.DEFAULT_TIME_ZONE);

            const reportCollectionDataSet: ReportCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.REPORT}${report1.reportID}`]: report1,
                [`${ONYXKEYS.COLLECTION.REPORT}${report2.reportID}`]: report2,
                [`${ONYXKEYS.COLLECTION.REPORT}${report3.reportID}`]: report3,
                [`${ONYXKEYS.COLLECTION.REPORT}${iouReport.reportID}`]: iouReport,
            };

            return (
                waitForBatchedUpdates()
                    .then(() => LHNTestUtils.getDefaultRenderedSidebarLinks(iouReport.reportID))

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
                        const hintText = TestHelper.translateLocal('accessibilityHints.chatUserDisplayNames');
                        const displayNames = screen.queryAllByLabelText(hintText);
                        expect(displayNames).toHaveLength(4);
                        expect(displayNames.at(0)).toHaveTextContent('Email Four');
                        expect(displayNames.at(1)).toHaveTextContent('Email Four owes $100.00');
                        expect(displayNames.at(2)).toHaveTextContent('Email Three');
                        expect(displayNames.at(3)).toHaveTextContent('Email Two');
                    })
            );
        });

        it('reorders the reports to have a newly created expense report on top', () => {
            // Given three reports in the recently updated order of 3, 2, 1
            const report1 = LHNTestUtils.getFakeReport([1, 2], 4);
            const report2 = LHNTestUtils.getFakeReport([1, 3], 3);
            const fakeReport = LHNTestUtils.getFakeReportWithPolicy([1, 4], 2);
            const fakePolicy = LHNTestUtils.getFakePolicy(fakeReport.policyID);
            const report3: OnyxTypes.Report = {
                ...fakeReport,
                hasOutstandingChildRequest: true,

                // This has to be added after the IOU report is generated
                iouReportID: undefined,
            };
            const expenseReport: OnyxTypes.Report = {
                ...LHNTestUtils.getFakeReport([1, 4], 1),
                type: CONST.REPORT.TYPE.EXPENSE,
                ownerAccountID: 1,
                managerID: 4,
                policyName: fakePolicy.name,
                policyID: fakeReport.policyID,
                reportName: 'Report Name',
                total: -10000,
                currency: 'USD',
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                chatReportID: report3.reportID,
                parentReportID: report3.reportID,
                participants: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    1: {
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN,
                    },
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    4: {
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN,
                    },
                },
            };
            report3.iouReportID = expenseReport.reportID;

            // Each report has at least one ADD_COMMENT action so should be rendered in the LNH
            addComment(report1, report1.reportID, [], 'Hi, this is a comment', CONST.DEFAULT_TIME_ZONE);
            addComment(report3, report3.reportID, [], 'Hi, this is a comment', CONST.DEFAULT_TIME_ZONE);
            addComment(report2, report2.reportID, [], 'Hi, this is a comment', CONST.DEFAULT_TIME_ZONE);

            const reportCollectionDataSet: ReportCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.REPORT}${report1.reportID}`]: report1,
                [`${ONYXKEYS.COLLECTION.REPORT}${report2.reportID}`]: report2,
                [`${ONYXKEYS.COLLECTION.REPORT}${report3.reportID}`]: report3,
                [`${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`]: expenseReport,
            };

            return (
                waitForBatchedUpdates()
                    .then(() => LHNTestUtils.getDefaultRenderedSidebarLinks(expenseReport.reportID))

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
                        const hintText = TestHelper.translateLocal('accessibilityHints.chatUserDisplayNames');
                        const displayNames = screen.queryAllByLabelText(hintText);
                        expect(displayNames).toHaveLength(4);
                        expect(displayNames.at(0)).toHaveTextContent(`Email One's expenses`);
                        expect(displayNames.at(1)).toHaveTextContent('Report Name');
                        expect(displayNames.at(2)).toHaveTextContent('Email Three');
                        expect(displayNames.at(3)).toHaveTextContent('Email Two');
                    })
            );
        });

        it('reorders the reports to keep draft reports on top', () => {
            // Given three reports in the recently updated order of 3, 2, 1
            // And the second report has a draft
            // And the currently viewed report is the second report
            const report1 = LHNTestUtils.getFakeReport([1, 2], 3);
            const report2: OnyxTypes.Report = {
                ...LHNTestUtils.getFakeReport([1, 3], 2),
            };
            const report3 = LHNTestUtils.getFakeReport([1, 4], 1);

            // Each report has at least one ADD_COMMENT action so should be rendered in the LNH
            addComment(report1, report1.reportID, [], 'Hi, this is a comment', CONST.DEFAULT_TIME_ZONE);
            addComment(report2, report2.reportID, [], 'Hi, this is a comment', CONST.DEFAULT_TIME_ZONE);
            addComment(report3, report3.reportID, [], 'Hi, this is a comment', CONST.DEFAULT_TIME_ZONE);

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
                        LHNTestUtils.getDefaultRenderedSidebarLinks(report1.reportID);
                        return waitForBatchedUpdates();
                    })

                    // Then the order of the reports should be 2 > 3 > 1
                    //                                         ^--- (2 goes to the front and pushes 3 down)
                    .then(() => {
                        const hintText = TestHelper.translateLocal('accessibilityHints.chatUserDisplayNames');
                        const displayNames = screen.queryAllByLabelText(hintText);
                        expect(displayNames).toHaveLength(3);
                        expect(displayNames.at(0)).toHaveTextContent('Email Three');
                        expect(displayNames.at(1)).toHaveTextContent('Email Four');
                        expect(displayNames.at(2)).toHaveTextContent('Email Two');
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

        it('sorts chats by pinned / GBR > draft > rest', () => {
            // Given three reports in the recently updated order of 4, 3, 2, 1
            // with a report that has a draft, a report that is pinned, and
            //    an outstanding IOU report that belong to the current user
            const report1: OnyxTypes.Report = {
                ...LHNTestUtils.getFakeReport([1, 2], 4),
                isPinned: true,
            };
            const report2: OnyxTypes.Report = {
                ...LHNTestUtils.getFakeReport([1, 3], 3),
            };
            const report3: OnyxTypes.Report = {
                ...LHNTestUtils.getFakeReport([1, 4], 2),
                hasOutstandingChildRequest: true,

                // This has to be added after the IOU report is generated
                iouReportID: undefined,
            };
            const report4 = LHNTestUtils.getFakeReport([1, 5], 1);
            addComment(report4, report4.reportID, [], 'Hi, this is a comment', CONST.DEFAULT_TIME_ZONE);

            const iouReport: OnyxTypes.Report = {
                ...LHNTestUtils.getFakeReport([1, 4]),
                type: CONST.REPORT.TYPE.IOU,
                ownerAccountID: 1,
                managerID: 4,
                hasOutstandingChildRequest: false,
                total: 10000,
                currency: 'USD',
                chatReportID: report3.reportID,
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                participants: {
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    1: {
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN,
                    },
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    4: {
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN,
                    },
                },
            };
            report3.iouReportID = iouReport.reportID;

            const currentReportId = report2.reportID;

            const reportCollectionDataSet: ReportCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.REPORT}${report1.reportID}`]: report1,
                [`${ONYXKEYS.COLLECTION.REPORT}${report2.reportID}`]: report2,
                [`${ONYXKEYS.COLLECTION.REPORT}${report3.reportID}`]: report3,
                [`${ONYXKEYS.COLLECTION.REPORT}${report4.reportID}`]: report4,
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
                            [`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${report2.reportID}`]: 'Report2 draft comment',
                            ...reportCollectionDataSet,
                        }),
                    )

                    // Then the reports are ordered by Pinned / GBR > Draft > Rest
                    // there is a pencil icon
                    // there is a pinned icon
                    .then(() => {
                        const hintText = TestHelper.translateLocal('accessibilityHints.chatUserDisplayNames');
                        const displayNames = screen.queryAllByLabelText(hintText);
                        expect(displayNames).toHaveLength(4);
                        expect(screen.queryAllByTestId('Pin Icon')).toHaveLength(1);
                        expect(screen.queryAllByTestId('Pencil Icon')).toHaveLength(1);
                        expect(displayNames.at(0)).toHaveTextContent('Email Four');
                        expect(displayNames.at(1)).toHaveTextContent('Email Two');
                        expect(displayNames.at(2)).toHaveTextContent('Email Three');
                        expect(displayNames.at(3)).toHaveTextContent('Email Five');
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
                ...LHNTestUtils.getFakeReport([1, 3], 2),
                isPinned: true,
            };
            const report3: OnyxTypes.Report = {
                ...LHNTestUtils.getFakeReport([1, 4], 1),
                isPinned: true,
            };
            const report4: OnyxTypes.Report = {
                ...LHNTestUtils.getFakeReport([1, 5], 0),
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
                        const hintText = TestHelper.translateLocal('accessibilityHints.chatUserDisplayNames');
                        const displayNames = screen.queryAllByLabelText(hintText);
                        expect(displayNames).toHaveLength(3);
                        expect(displayNames.at(0)).toHaveTextContent('Email Four');
                        expect(displayNames.at(1)).toHaveTextContent('Email Three');
                        expect(displayNames.at(2)).toHaveTextContent('Email Two');
                    })

                    // When a new report is added
                    .then(() => Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report4.reportID}`, report4))

                    // Then they are still in alphabetical order
                    .then(() => {
                        assertSidebarOptionsAlphabetical();
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
                ...LHNTestUtils.getFakeReport([1, 3], 2),
            };
            const report3: OnyxTypes.Report = {
                ...LHNTestUtils.getFakeReport([1, 4], 1),
            };
            const report4: OnyxTypes.Report = {
                ...LHNTestUtils.getFakeReport([1, 5], 0),
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
                        const hintText = TestHelper.translateLocal('accessibilityHints.chatUserDisplayNames');
                        const displayNames = screen.queryAllByLabelText(hintText);
                        expect(displayNames).toHaveLength(3);
                        expect(displayNames.at(0)).toHaveTextContent('Email Four');
                        expect(displayNames.at(1)).toHaveTextContent('Email Three');
                        expect(displayNames.at(2)).toHaveTextContent('Email Two');
                    })

                    // When a new report is added
                    .then(() =>
                        Onyx.multiSet({
                            ...reportDraftCommentCollectionDataSet,
                            [`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${report4.reportID}`]: 'report4 draft',
                            [`${ONYXKEYS.COLLECTION.REPORT}${report4.reportID}`]: report4,
                            ...reportCollectionDataSet,
                        }),
                    )

                    // Then they are still in alphabetical order
                    .then(() => {
                        assertSidebarOptionsAlphabetical();
                    })
            );
        });

        it('puts archived chats last', () => {
            // Given three reports, with the first report being archived
            const report1: OnyxTypes.Report = {
                ...LHNTestUtils.getFakeReport([1, 2]),
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
            };
            const report2 = LHNTestUtils.getFakeReport([1, 3]);
            const report3 = LHNTestUtils.getFakeReport([1, 4]);

            // Each report has at least one ADD_COMMENT action so should be rendered in the LNH
            addComment(report1, report1.reportID, [], 'Hi, this is a comment', CONST.DEFAULT_TIME_ZONE);
            addComment(report2, report2.reportID, [], 'Hi, this is a comment', CONST.DEFAULT_TIME_ZONE);
            addComment(report3, report3.reportID, [], 'Hi, this is a comment', CONST.DEFAULT_TIME_ZONE);

            // Given the user is in all betas
            const betas = [CONST.BETAS.DEFAULT_ROOMS];

            const reportCollectionDataSet: ReportCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.REPORT}${report1.reportID}`]: report1,
                [`${ONYXKEYS.COLLECTION.REPORT}${report2.reportID}`]: report2,
                [`${ONYXKEYS.COLLECTION.REPORT}${report3.reportID}`]: report3,
            };

            const reportNameValuePairsCollectionDataSet: ReportNameValuePairsCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report1.reportID}`]: {
                    private_isArchived: DateUtils.getDBTime(),
                },
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
                            ...reportNameValuePairsCollectionDataSet,
                            ...reportCollectionDataSet,
                        }),
                    )

                    // Then the first report is in last position
                    .then(() => {
                        const hintText = TestHelper.translateLocal('accessibilityHints.chatUserDisplayNames');
                        const displayNames = screen.queryAllByLabelText(hintText);
                        expect(displayNames).toHaveLength(3);
                        expect(displayNames.at(0)).toHaveTextContent('Email Four');
                        expect(displayNames.at(1)).toHaveTextContent('Email Three');
                        expect(displayNames.at(2)).toHaveTextContent('Report (archived)');
                    })
            );
        });

        it('orders nonArchived reports by displayName if created timestamps are the same', () => {
            // Given three nonArchived reports created at the same time
            const report1 = LHNTestUtils.getFakeReport([1, 2]);
            const report2 = LHNTestUtils.getFakeReport([1, 3]);
            const report3: OnyxTypes.Report = LHNTestUtils.getFakeReport([1, 4]);

            // Each report has at least one ADD_COMMENT action so should be rendered in the LNH
            addComment(report1, report1.reportID, [], 'Hi, this is a comment', CONST.DEFAULT_TIME_ZONE);
            addComment(report2, report2.reportID, [], 'Hi, this is a comment', CONST.DEFAULT_TIME_ZONE);
            addComment(report3, report3.reportID, [], 'Hi, this is a comment', CONST.DEFAULT_TIME_ZONE);

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
                        const hintText = TestHelper.translateLocal('accessibilityHints.chatUserDisplayNames');
                        const displayNames = screen.queryAllByLabelText(hintText);
                        expect(displayNames).toHaveLength(3);
                        expect(displayNames.at(0)).toHaveTextContent('Email Four');
                        expect(displayNames.at(1)).toHaveTextContent('Email Three');
                        expect(displayNames.at(2)).toHaveTextContent('Email Two');
                    })
            );
        });
    });

    describe('in #focus mode', () => {
        it('alphabetizes chats', () => {
            const report1 = {...LHNTestUtils.getFakeReport([1, 2], 3, true), lastMessageText: 'test'};
            const report2 = {...LHNTestUtils.getFakeReport([1, 3], 2, true), lastMessageText: 'test'};
            const report3 = {...LHNTestUtils.getFakeReport([1, 4], 1, true), lastMessageText: 'test'};
            const report4 = {...LHNTestUtils.getFakeReport([1, 5], 0, true), lastMessageText: 'test'};

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
                        const hintText = TestHelper.translateLocal('accessibilityHints.chatUserDisplayNames');
                        const displayNames = screen.queryAllByLabelText(hintText);
                        expect(displayNames).toHaveLength(3);
                        expect(displayNames.at(0)).toHaveTextContent('Email Four');
                        expect(displayNames.at(1)).toHaveTextContent('Email Three');
                        expect(displayNames.at(2)).toHaveTextContent('Email Two');
                    })

                    // When a new report is added
                    .then(() => Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report4.reportID}`, report4))

                    // Then they are still in alphabetical order
                    .then(() => {
                        assertSidebarOptionsAlphabetical();
                    })
            );
        });

        it('puts archived chats last', () => {
            // Given three unread reports, with the first report being archived
            const report1 = {
                ...LHNTestUtils.getFakeReport([1, 2], 3, true),
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
                lastMessageText: 'test',
            };
            const report2 = {
                ...LHNTestUtils.getFakeReport([1, 3], 2, true),
                lastMessageText: 'test',
            };
            const report3 = {...LHNTestUtils.getFakeReport([1, 4], 1, true), lastMessageText: 'test'};

            // Given the user is in all betas
            const betas = [CONST.BETAS.DEFAULT_ROOMS];

            const reportCollectionDataSet: ReportCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.REPORT}${report1.reportID}`]: report1,
                [`${ONYXKEYS.COLLECTION.REPORT}${report2.reportID}`]: report2,
                [`${ONYXKEYS.COLLECTION.REPORT}${report3.reportID}`]: report3,
            };

            const reportNameValuePairsCollectionDataSet: ReportNameValuePairsCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report1.reportID}`]: {
                    private_isArchived: DateUtils.getDBTime(),
                },
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
                            ...reportNameValuePairsCollectionDataSet,
                            ...reportCollectionDataSet,
                        }),
                    )

                    // Then the first report is in last position
                    .then(() => {
                        const hintText = TestHelper.translateLocal('accessibilityHints.chatUserDisplayNames');
                        const displayNames = screen.queryAllByLabelText(hintText);
                        expect(displayNames).toHaveLength(3);
                        expect(displayNames.at(0)).toHaveTextContent('Email Four');
                        expect(displayNames.at(1)).toHaveTextContent('Email Three');
                        expect(displayNames.at(2)).toHaveTextContent('Report (archived)');
                    })
            );
        });
    });
});
