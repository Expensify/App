import Onyx from 'react-native-onyx';
import {cleanup} from '@testing-library/react-native';
import waitForPromisesToResolve from '../utils/waitForPromisesToResolve';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import CONST from '../../src/CONST';
import lodashGet from 'lodash/get';

const fakeReport1 = {
    reportID: 1,
    reportName: 'Report One',
    maxSequenceNumber: LHNTestUtils.TEST_MAX_SEQUENCE_NUMBER,
    lastReadSequenceNumber: LHNTestUtils.TEST_MAX_SEQUENCE_NUMBER,

    // This report's last comment will be in the past
    lastMessageTimestamp: Date.now() - 3000,
    participants: ['email1@test.com', 'email2@test.com'],
};
const fakeReport2 = {
    reportID: 2,
    reportName: 'Report Two',
    maxSequenceNumber: LHNTestUtils.TEST_MAX_SEQUENCE_NUMBER,
    lastReadSequenceNumber: LHNTestUtils.TEST_MAX_SEQUENCE_NUMBER,
    lastMessageTimestamp: Date.now() - 2000,
    participants: ['email3@test.com', 'email4@test.com'],
};
const fakeReport3 = {
    reportID: 3,
    reportName: 'Report Three',
    maxSequenceNumber: LHNTestUtils.TEST_MAX_SEQUENCE_NUMBER,
    lastReadSequenceNumber: LHNTestUtils.TEST_MAX_SEQUENCE_NUMBER,
    lastMessageTimestamp: Date.now() - 1000,
    participants: ['email5@test.com', 'email6@test.com'],
};
const fakeReportIOU = {
    reportID: 4,
    reportName: 'Report IOU Four',
    maxSequenceNumber: LHNTestUtils.TEST_MAX_SEQUENCE_NUMBER,
    lastReadSequenceNumber: LHNTestUtils.TEST_MAX_SEQUENCE_NUMBER,
    lastMessageTimestamp: Date.now() - 1000,
    participants: ['email5@test.com', 'email6@test.com'],
    ownerEmail: 'email2@test.com',
    hasOutstandingIOU: true,
    total: 10000,
    currency: 'USD',
};

const fakeReport1Actions = {
    actionName: 'ADDCOMMENT',
    person: [],
    sequenceNumber: 0,

    // This comment will be in the past
    timestamp: Date.now() - 2000,
    message: [
        {type: 'comment', reportID: 1, text: 'Comment One'},
    ],
};
const fakeReport2Actions = {
    actionName: 'ADDCOMMENT',
    person: [],
    sequenceNumber: 0,
    timestamp: Date.now() - 1000,
    message: [
        {type: 'comment', reportID: 2, text: 'Comment Two'},
    ],
};
const fakeReport3Actions = {
    actionName: 'ADDCOMMENT',
    person: [],
    sequenceNumber: 0,
    timestamp: Date.now(),
    message: [
        {type: 'comment', reportID: 2, text: 'Comment Three'},
    ],
};

const ONYXKEYS = {
    PERSONAL_DETAILS: 'personalDetails',
    CURRENTLY_VIEWED_REPORTID: 'currentlyViewedReportID',
    NVP_PRIORITY_MODE: 'nvp_priorityMode',
    SESSION: 'session',
    COLLECTION: {
        REPORT: 'report_',
        REPORT_ACTIONS: 'reportActions_',
        REPORT_IOUS: 'reportIOUs_',
    },
};

Onyx.init({
    keys: ONYXKEYS,
    registerStorageEventListener: () => {},
});

describe('Sidebar', () => {
    // Clear out Onyx after each test so that each test starts with a clean slate
    afterEach(() => {
        cleanup();
        Onyx.clear();
    });

    describe('in default mode', () => {
        it('is not rendered when there are no props passed to it', () => {
            // Given all the default props are passed to SidebarLinks
            // When it is rendered
            const sidebarLinks = LHNTestUtils.getDefaultRenderedSidebarLinks();

            // Then it should render nothing and be null
            // This is expected because there is an early return when there are no personal details
            expect(sidebarLinks.toJSON()).toBe(null);
        });

        it('is rendered with an empty list when personal details exist', () => {
            // Given the sidebar is rendered with default props
            const sidebarLinks = LHNTestUtils.getDefaultRenderedSidebarLinks();

            return waitForPromisesToResolve()

                // When Onyx is updated with some personal details
                .then(() => Onyx.multiSet({
                    [ONYXKEYS.PERSONAL_DETAILS]: LHNTestUtils.fakePersonalDetails,
                }))

                // Then the component should be rendered with an empty list since it will get past the early return
                .then(() => {
                    expect(sidebarLinks.toJSON()).not.toBe(null);
                    expect(sidebarLinks.queryAllByA11yHint('Navigates to a chat')).toHaveLength(0);
                });
        });

        it('contains one report when a report is in Onyx', () => {
            const sidebarLinks = LHNTestUtils.getDefaultRenderedSidebarLinks();

            // Given a single report
            const report = LHNTestUtils.getFakeReport(['email1@test.com', 'email2@test.com']);

            return waitForPromisesToResolve()

                // When Onyx is updated with the data and the sidebar re-renders
                .then(() => Onyx.multiSet({
                    [ONYXKEYS.PERSONAL_DETAILS]: LHNTestUtils.fakePersonalDetails,
                    [`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`]: report,
                }))

                // Then the component should be rendered with an item for the report
                .then(() => {
                    expect(sidebarLinks.queryAllByText('One, Two')).toHaveLength(1);
                });
        });

        it('orders items with most recently updated on top', () => {
            const sidebarLinks = LHNTestUtils.getDefaultRenderedSidebarLinks();

            // Given three reports in the recently updated order of 3, 2, 1
            const report1 = LHNTestUtils.getFakeReport(['email1@test.com', 'email2@test.com'], 3);
            const report2 = LHNTestUtils.getFakeReport(['email3@test.com', 'email4@test.com'], 2);
            const report3 = LHNTestUtils.getFakeReport(['email5@test.com', 'email6@test.com'], 1);

            return waitForPromisesToResolve()

                // When Onyx is updated with the data and the sidebar re-renders
                .then(() => Onyx.multiSet({
                    [ONYXKEYS.PERSONAL_DETAILS]: LHNTestUtils.fakePersonalDetails,
                    [`${ONYXKEYS.COLLECTION.REPORT}${report1.reportID}`]: report1,
                    [`${ONYXKEYS.COLLECTION.REPORT}${report2.reportID}`]: report2,
                    [`${ONYXKEYS.COLLECTION.REPORT}${report3.reportID}`]: report3,
                }))

                // Then the component should be rendered with the mostly recently updated report first
                .then(() => {
                    const displayNames = sidebarLinks.queryAllByA11yLabel('Chat user display names');
                    expect(displayNames).toHaveLength(3);
                    expect(lodashGet(displayNames, [0, 'props', 'children'])).toBe('Five, Six');
                    expect(lodashGet(displayNames, [1, 'props', 'children'])).toBe('Three, Four');
                    expect(lodashGet(displayNames, [2, 'props', 'children'])).toBe('One, Two');
                });
        });

        it('doesn\'t change the order when adding a draft to the active report', () => {
            const sidebarLinks = LHNTestUtils.getDefaultRenderedSidebarLinks();

            // Given three reports in the recently updated order of 3, 2, 1
            // And the first report has a draft
            // And the currently viewed report is the first report
            const report1 = {
                ...LHNTestUtils.getFakeReport(['email1@test.com', 'email2@test.com'], 3),
                hasDraft: true,
            };
            const report2 = LHNTestUtils.getFakeReport(['email3@test.com', 'email4@test.com'], 2);
            const report3 = LHNTestUtils.getFakeReport(['email5@test.com', 'email6@test.com'], 1);
            const currentlyViewedReportID = report1.reportID;

            return waitForPromisesToResolve()

                // When Onyx is updated with the data and the sidebar re-renders
                .then(() => Onyx.multiSet({
                    [ONYXKEYS.PERSONAL_DETAILS]: LHNTestUtils.fakePersonalDetails,
                    [ONYXKEYS.CURRENTLY_VIEWED_REPORTID]: currentlyViewedReportID.toString(),
                    [`${ONYXKEYS.COLLECTION.REPORT}${report1.reportID}`]: report1,
                    [`${ONYXKEYS.COLLECTION.REPORT}${report2.reportID}`]: report2,
                    [`${ONYXKEYS.COLLECTION.REPORT}${report3.reportID}`]: report3,
                }))

                // Then there should be a pencil icon and report one should still be the last one because putting a draft on the active report should not change it's location
                // in the ordered list
                .then(() => {
                    const pencilIcon = sidebarLinks.getAllByAccessibilityHint('Pencil Icon');
                    expect(pencilIcon).toHaveLength(1);

                    const displayNames = sidebarLinks.queryAllByA11yLabel('Chat user display names');
                    expect(displayNames).toHaveLength(3);
                    expect(lodashGet(displayNames, [0, 'props', 'children'])).toBe('Five, Six');
                    expect(lodashGet(displayNames, [1, 'props', 'children'])).toBe('Three, Four');
                    expect(lodashGet(displayNames, [2, 'props', 'children'])).toBe('One, Two');
                });
        });

        it('reorders the reports to always have the most recently updated one on top', () => {
            const sidebarLinks = LHNTestUtils.getDefaultRenderedSidebarLinks();

            // Given three reports in the recently updated order of 3, 2, 1
            // And the first report has a draft
            // And the currently viewed report is the first report
            const report1 = {
                ...LHNTestUtils.getFakeReport(['email1@test.com', 'email2@test.com'], 3),
                hasDraft: true,
            };
            const report2 = LHNTestUtils.getFakeReport(['email3@test.com', 'email4@test.com'], 2);
            const report3 = LHNTestUtils.getFakeReport(['email5@test.com', 'email6@test.com'], 1);
            const currentlyViewedReportID = report1.reportID;

            return waitForPromisesToResolve()

                // When Onyx is updated with the data and the sidebar re-renders
                .then(() => Onyx.multiSet({
                    [ONYXKEYS.PERSONAL_DETAILS]: LHNTestUtils.fakePersonalDetails,
                    [ONYXKEYS.CURRENTLY_VIEWED_REPORTID]: currentlyViewedReportID.toString(),
                    [`${ONYXKEYS.COLLECTION.REPORT}${report1.reportID}`]: report1,
                    [`${ONYXKEYS.COLLECTION.REPORT}${report2.reportID}`]: report2,
                    [`${ONYXKEYS.COLLECTION.REPORT}${report3.reportID}`]: report3,
                }))

                // When a new comment is added to report 1 (eg. it's lastMessageTimestamp is updated)
                .then(() => Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}1`, {lastMessageTimestamp: Date.now()}))

                // Then the order of the reports should be 1 > 3 > 2
                //                                         ^--- (1 goes to the front and pushes other two down)
                .then(() => {
                    const displayNames = sidebarLinks.queryAllByA11yLabel('Chat user display names');
                    expect(displayNames).toHaveLength(3);
                    expect(lodashGet(displayNames, [0, 'props', 'children'])).toBe('One, Two');
                    expect(lodashGet(displayNames, [1, 'props', 'children'])).toBe('Five, Six');
                    expect(lodashGet(displayNames, [2, 'props', 'children'])).toBe('Three, Four');
                });
        });

        it('reorders the reports to keep draft reports on top', () => {
            const sidebarLinks = LHNTestUtils.getDefaultRenderedSidebarLinks();

            // Given three reports in the recently updated order of 3, 2, 1
            // And the second report has a draft
            // And the currently viewed report is the second report
            const report1 = LHNTestUtils.getFakeReport(['email1@test.com', 'email2@test.com'], 3);
            const report2 = {
                ...LHNTestUtils.getFakeReport(['email3@test.com', 'email4@test.com'], 2),
                hasDraft: true,
            };
            const report3 = LHNTestUtils.getFakeReport(['email5@test.com', 'email6@test.com'], 1);
            const currentlyViewedReportID = report2.reportID;

            return waitForPromisesToResolve()

                // When Onyx is updated with the data and the sidebar re-renders
                .then(() => Onyx.multiSet({
                    [ONYXKEYS.PERSONAL_DETAILS]: LHNTestUtils.fakePersonalDetails,
                    [ONYXKEYS.CURRENTLY_VIEWED_REPORTID]: currentlyViewedReportID.toString(),
                    [`${ONYXKEYS.COLLECTION.REPORT}${report1.reportID}`]: report1,
                    [`${ONYXKEYS.COLLECTION.REPORT}${report2.reportID}`]: report2,
                    [`${ONYXKEYS.COLLECTION.REPORT}${report3.reportID}`]: report3,
                }))

                // When the currently active chat is switched to report 1 (the one on the bottom)
                .then(() => Onyx.merge(ONYXKEYS.CURRENTLY_VIEWED_REPORTID, '1'))

                // Then the order of the reports should be 2 > 3 > 1
                //                                         ^--- (2 goes to the front and pushes 3 down)
                .then(() => {
                    const displayNames = sidebarLinks.queryAllByA11yLabel('Chat user display names');
                    expect(displayNames).toHaveLength(3);
                    expect(lodashGet(displayNames, [0, 'props', 'children'])).toBe('Three, Four');
                    expect(lodashGet(displayNames, [1, 'props', 'children'])).toBe('Five, Six');
                    expect(lodashGet(displayNames, [2, 'props', 'children'])).toBe('One, Two');
                });
        });

        it('removes the pencil icon when draft is removed', () => {
            const sidebarLinks = LHNTestUtils.getDefaultRenderedSidebarLinks();

            // Given a single report
            // And the report has a draft
            const report = {
                ...LHNTestUtils.getFakeReport(['email1@test.com', 'email2@test.com']),
                hasDraft: true,
            };

            return waitForPromisesToResolve()

                // When Onyx is updated with the data and the sidebar re-renders
                .then(() => Onyx.multiSet({
                    [ONYXKEYS.PERSONAL_DETAILS]: LHNTestUtils.fakePersonalDetails,
                    [`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`]: report,
                }))

                // Then there should be a pencil icon showing
                .then(() => {
                    expect(sidebarLinks.getAllByAccessibilityHint('Pencil Icon')).toHaveLength(1);
                })

                // When the draft is removed
                .then(() => Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, {hasDraft: null}))

                // Then the pencil icon goes away
                .then(() => {
                    expect(sidebarLinks.queryAllByAccessibilityHint('Pencil Icon')).toHaveLength(0);
                });
        });

        it('removes the pin icon when chat is unpinned', () => {
            const sidebarLinks = LHNTestUtils.getDefaultRenderedSidebarLinks();

            // Given a single report
            // And the report is pinned
            const report = {
                ...LHNTestUtils.getFakeReport(['email1@test.com', 'email2@test.com']),
                isPinned: true,
            };

            return waitForPromisesToResolve()

                // When Onyx is updated with the data and the sidebar re-renders
                .then(() => Onyx.multiSet({
                    [ONYXKEYS.PERSONAL_DETAILS]: LHNTestUtils.fakePersonalDetails,
                    [`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`]: report,
                }))

                // Then there should be a pencil icon showing
                .then(() => {
                    expect(sidebarLinks.getAllByAccessibilityHint('Pin Icon')).toHaveLength(1);
                })

                // When the draft is removed
                .then(() => Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, {isPinned: false}))

                // Then the pencil icon goes away
                .then(() => {
                    expect(sidebarLinks.queryAllByAccessibilityHint('Pin Icon')).toHaveLength(0);
                });
        });

        it('sorts chats by pinned > IOU > draft', () => {
            const sidebarLinks = LHNTestUtils.getDefaultRenderedSidebarLinks();

            return waitForPromisesToResolve()

                // Given the sidebar is rendered in default mode (most recent first)
                // while currently viewing report 2 (the one in the middle)
                // with a draft on report 2
                // with the current user set to email9@
                // with a report that has a draft, a report that is pinned, and
                //    an outstanding IOU report that doesn't belong to the current user
                .then(() => Onyx.multiSet({
                    [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.DEFAULT,
                    [ONYXKEYS.PERSONAL_DETAILS]: LHNTestUtils.fakePersonalDetails,
                    [ONYXKEYS.CURRENTLY_VIEWED_REPORTID]: '2',
                    [ONYXKEYS.SESSION]: {email: 'email9@test.com'},
                    [`${ONYXKEYS.COLLECTION.REPORT}1`]: {...fakeReport1, hasDraft: true},
                    [`${ONYXKEYS.COLLECTION.REPORT}2`]: {...fakeReport2, isPinned: true},
                    [`${ONYXKEYS.COLLECTION.REPORT}3`]: {...fakeReport3, iouReportID: '4', hasOutstandingIOU: true},
                    [`${ONYXKEYS.COLLECTION.REPORT_IOUS}4`]: {...fakeReportIOU, chatReportID: 3},
                    [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`]: fakeReport1Actions,
                    [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}2`]: fakeReport2Actions,
                    [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}2`]: fakeReport3Actions,
                }))

                // Then the reports are ordered by IOU > Pinned > Draft
                // there is a pencil icon
                // there is a pinned icon
                // there is an IOU badge
                .then(() => {
                    const reportOptions = sidebarLinks.queryAllByText(/ReportID, /);
                    expect(reportOptions).toHaveLength(3);
                    expect(reportOptions[0].children[0].props.children).toBe('ReportID, Two');
                    expect(reportOptions[1].children[0].props.children).toBe('ReportID, Three');
                    expect(reportOptions[2].children[0].props.children).toBe('ReportID, One');
                });
        });
    });

    describe('in #focus mode', () => {
        it('alphabetizes chats', () => {
            const sidebarLinks = LHNTestUtils.getDefaultRenderedSidebarLinks();

            return waitForPromisesToResolve()

                // Given the sidebar is rendered in #focus mode (hides read chats)
                // with all reports having unread chats
                .then(() => Onyx.multiSet({
                    [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.GSD,
                    [ONYXKEYS.PERSONAL_DETAILS]: LHNTestUtils.fakePersonalDetails,
                    [ONYXKEYS.CURRENTLY_VIEWED_REPORTID]: '1',
                    [`${ONYXKEYS.COLLECTION.REPORT}1`]: {...fakeReport1, lastReadSequenceNumber: LHNTestUtils.TEST_MAX_SEQUENCE_NUMBER - 1},
                    [`${ONYXKEYS.COLLECTION.REPORT}2`]: {...fakeReport2, lastReadSequenceNumber: LHNTestUtils.TEST_MAX_SEQUENCE_NUMBER - 1},
                    [`${ONYXKEYS.COLLECTION.REPORT}3`]: {...fakeReport3, lastReadSequenceNumber: LHNTestUtils.TEST_MAX_SEQUENCE_NUMBER - 1},
                    [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`]: fakeReport1Actions,
                    [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}2`]: fakeReport2Actions,
                    [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}2`]: fakeReport3Actions,
                }))

                // Then the reports are in alphabetical order
                .then(() => {
                    const reportOptions = sidebarLinks.queryAllByText(/ReportID, /);
                    expect(reportOptions).toHaveLength(3);
                    expect(reportOptions[0].children[0].props.children).toBe('ReportID, One');
                    expect(reportOptions[1].children[0].props.children).toBe('ReportID, Three');
                    expect(reportOptions[2].children[0].props.children).toBe('ReportID, Two');
                })

                // When a new report is added
                .then(() => Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}4`, {
                    reportID: 4,
                    reportName: 'Report Four',
                    maxSequenceNumber: LHNTestUtils.TEST_MAX_SEQUENCE_NUMBER,
                    lastReadSequenceNumber: LHNTestUtils.TEST_MAX_SEQUENCE_NUMBER - 1,
                    lastMessageTimestamp: Date.now(),
                    participants: ['email7@test.com', 'email8@test.com'],
                }))

                // Then they are still in alphabetical order
                .then(() => {
                    const reportOptions = sidebarLinks.queryAllByText(/ReportID, /);
                    expect(reportOptions).toHaveLength(4);
                    expect(reportOptions[0].children[0].props.children).toBe('ReportID, Four');
                    expect(reportOptions[1].children[0].props.children).toBe('ReportID, One');
                    expect(reportOptions[2].children[0].props.children).toBe('ReportID, Three');
                    expect(reportOptions[3].children[0].props.children).toBe('ReportID, Two');
                });
        });
    });
});
