import {cleanup} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import lodashGet from 'lodash/get';
import * as LHNUtils from '../utils/LHNUtils';
import waitForPromisesToResolve from '../utils/waitForPromisesToResolve';

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

describe('Sidebar', () => {
    beforeAll(() => Onyx.init({
        keys: ONYXKEYS,
        registerStorageEventListener: () => {},
    }));

    // Cleanup (ie. unmount) all rendered components and clear out Onyx after each test so that each test starts with a clean slate
    afterEach(() => {
        cleanup();
        Onyx.clear();
    });

    describe('in default mode', () => {
        it('Excludes a report with no participants', () => {
            const sidebarLinks = LHNUtils.getDefaultRenderedSidebarLinks();

            // Given a report with no participants
            const fakeReport = LHNUtils.getFakeReport();

            return waitForPromisesToResolve()

                // When Onyx is updated to contain that report
                .then(() => Onyx.multiSet({
                    [`${ONYXKEYS.COLLECTION.REPORT}${fakeReport.reportID}`]: fakeReport,
                }))

                // Then no reports are rendered in the LHN
                .then(() => {
                    const optionRows = sidebarLinks.queryAllByA11yHint('Navigates to a chat');
                    expect(optionRows).toHaveLength(0);
                });
        });
    });

    describe('in #focus mode', () => {
        it('hides unread chats', () => {
            const sidebarLinks = LHNUtils.getDefaultRenderedSidebarLinks();

            const report1 = LHNUtils.getFakeReport(['email1@test.com', 'email2@test.com']);
            const report2 = LHNUtils.getFakeReport(['email3@test.com', 'email4@test.com']);
            const report3 = LHNUtils.getFakeReport(['email5@test.com', 'email6@test.com']);

            return waitForPromisesToResolve()

                // Given the sidebar is rendered in #focus mode (hides read chats)
                // with report 1 and 2 having unread actions
                .then(() => Onyx.multiSet({
                    [ONYXKEYS.NVP_PRIORITY_MODE]: 'gsd',
                    [ONYXKEYS.PERSONAL_DETAILS]: LHNUtils.fakePersonalDetails,
                    [ONYXKEYS.CURRENTLY_VIEWED_REPORTID]: report1.reportID.toString(),
                    [`${ONYXKEYS.COLLECTION.REPORT}${report1.reportID}`]: {...report1, lastReadSequenceNumber: LHNUtils.TEST_MAX_SEQUENCE_NUMBER - 1},
                    [`${ONYXKEYS.COLLECTION.REPORT}${report2.reportID}`]: {...report2, lastReadSequenceNumber: LHNUtils.TEST_MAX_SEQUENCE_NUMBER - 1},
                    [`${ONYXKEYS.COLLECTION.REPORT}${report3.reportID}`]: report3,
                }))

                // Then the reports 1 and 2 are shown and 3 is not
                .then(() => {
                    const displayNames = sidebarLinks.queryAllByA11yLabel('Chat user display names');
                    expect(displayNames).toHaveLength(2);
                    expect(lodashGet(displayNames, [0, 'props', 'children'])).toBe('One, Two');
                    expect(lodashGet(displayNames, [1, 'props', 'children'])).toBe('Three, Four');
                })

                // When report3 becomes unread
                .then(() => Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report3.reportID}`, {lastReadSequenceNumber: LHNUtils.TEST_MAX_SEQUENCE_NUMBER - 1}))

                // Then all three chats are showing
                .then(() => {
                    expect(sidebarLinks.queryAllByA11yHint('Navigates to a chat')).toHaveLength(3);
                })

                // When report 1 becomes read (it's the active report)
                .then(() => Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report1.reportID}`, {lastReadSequenceNumber: LHNUtils.TEST_MAX_SEQUENCE_NUMBER}))

                // Then all three chats are still showing
                .then(() => {
                    expect(sidebarLinks.queryAllByA11yHint('Navigates to a chat')).toHaveLength(3);
                })

                // When report 2 becomes the active report
                .then(() => Onyx.merge(ONYXKEYS.CURRENTLY_VIEWED_REPORTID, report2.reportID.toString()))

                // Then report 1 should now disappear
                .then(() => {
                    expect(sidebarLinks.queryAllByA11yHint('Navigates to a chat')).toHaveLength(2);
                    expect(sidebarLinks.queryAllByText(/One, Two/)).toHaveLength(0);
                });
        });
    });
});
