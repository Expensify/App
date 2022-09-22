import {cleanup} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import lodashGet from 'lodash/get';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import waitForPromisesToResolve from '../utils/waitForPromisesToResolve';
import CONST from '../../src/CONST';

// Be sure to include the mocked permissions library or else the beta tests won't work
jest.mock('../../src/libs/Permissions');

const ONYXKEYS = {
    PERSONAL_DETAILS: 'personalDetails',
    CURRENTLY_VIEWED_REPORTID: 'currentlyViewedReportID',
    NVP_PRIORITY_MODE: 'nvp_priorityMode',
    SESSION: 'session',
    BETAS: 'betas',
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
        it('excludes a report with no participants', () => {
            const sidebarLinks = LHNTestUtils.getDefaultRenderedSidebarLinks();

            // Given a report with no participants
            const report = LHNTestUtils.getFakeReport([]);

            return waitForPromisesToResolve()

                // When Onyx is updated to contain that report
                .then(() => Onyx.multiSet({
                    [`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`]: report,
                }))

                // Then no reports are rendered in the LHN
                .then(() => {
                    const optionRows = sidebarLinks.queryAllByA11yHint('Navigates to a chat');
                    expect(optionRows).toHaveLength(0);
                });
        });

        it('includes or excludes policy expense chats depending on the beta', () => {
            const sidebarLinks = LHNTestUtils.getDefaultRenderedSidebarLinks();

            // Given a policy expense report
            // and the user not being in any betas
            const report = {
                ...LHNTestUtils.getFakeReport(),
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
            };

            return waitForPromisesToResolve()

                // When Onyx is updated to contain that data and the sidebar re-renders
                .then(() => Onyx.multiSet({
                    [ONYXKEYS.BETAS]: [],
                    [ONYXKEYS.PERSONAL_DETAILS]: LHNTestUtils.fakePersonalDetails,
                    [`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`]: report,
                }))

                // Then no reports are rendered in the LHN
                .then(() => {
                    const optionRows = sidebarLinks.queryAllByA11yHint('Navigates to a chat');
                    expect(optionRows).toHaveLength(0);
                })

                // When the user is added to the policy expense beta and the sidebar re-renders
                .then(() => Onyx.multiSet({
                    [ONYXKEYS.BETAS]: [CONST.BETAS.POLICY_EXPENSE_CHAT],
                }))

                // Then there is one report rendered in the LHN
                .then(() => {
                    const optionRows = sidebarLinks.queryAllByA11yHint('Navigates to a chat');
                    expect(optionRows).toHaveLength(1);
                });
        });

        it('includes or excludes user created policy rooms depending on the beta', () => {
            const sidebarLinks = LHNTestUtils.getDefaultRenderedSidebarLinks();

            // Given a user created policy room report
            // and the user not being in any betas
            const report = {
                ...LHNTestUtils.getFakeReport(),
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
            };

            return waitForPromisesToResolve()

                // When Onyx is updated to contain that data and the sidebar re-renders
                .then(() => Onyx.multiSet({
                    [ONYXKEYS.BETAS]: [],
                    [ONYXKEYS.PERSONAL_DETAILS]: LHNTestUtils.fakePersonalDetails,
                    [`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`]: report,
                }))

                // Then no reports are rendered in the LHN
                .then(() => {
                    const optionRows = sidebarLinks.queryAllByA11yHint('Navigates to a chat');
                    expect(optionRows).toHaveLength(0);
                })

                // When the user is added to the policy rooms beta and the sidebar re-renders
                .then(() => Onyx.multiSet({
                    [ONYXKEYS.BETAS]: [CONST.BETAS.POLICY_ROOMS],
                }))

                // Then there is one report rendered in the LHN
                .then(() => {
                    const optionRows = sidebarLinks.queryAllByA11yHint('Navigates to a chat');
                    expect(optionRows).toHaveLength(1);
                });
        });

        it('includes or excludes default policy rooms depending on the beta', () => {
            const sidebarLinks = LHNTestUtils.getDefaultRenderedSidebarLinks();

            // Given a default policy room report
            // and the user not being in any betas
            const report1 = {
                ...LHNTestUtils.getFakeReport(),
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_ADMINS,
            };
            const report2 = {
                ...LHNTestUtils.getFakeReport(),
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_ANNOUNCE,
            };
            const report3 = {
                ...LHNTestUtils.getFakeReport(),
                chatType: CONST.REPORT.CHAT_TYPE.DOMAIN_ALL,
            };

            return waitForPromisesToResolve()

                // When Onyx is updated to contain that data and the sidebar re-renders
                .then(() => Onyx.multiSet({
                    [ONYXKEYS.BETAS]: [],
                    [ONYXKEYS.PERSONAL_DETAILS]: LHNTestUtils.fakePersonalDetails,
                    [`${ONYXKEYS.COLLECTION.REPORT}${report1.reportID}`]: report1,
                    [`${ONYXKEYS.COLLECTION.REPORT}${report2.reportID}`]: report2,
                    [`${ONYXKEYS.COLLECTION.REPORT}${report3.reportID}`]: report3,
                }))

                // Then no reports are rendered in the LHN
                .then(() => {
                    const optionRows = sidebarLinks.queryAllByA11yHint('Navigates to a chat');
                    expect(optionRows).toHaveLength(0);
                })

                // When the user is added to the default policy rooms beta and the sidebar re-renders
                .then(() => Onyx.multiSet({
                    [ONYXKEYS.BETAS]: [CONST.BETAS.DEFAULT_ROOMS],
                }))

                // Then all three reports are showing in the LHN
                .then(() => {
                    const optionRows = sidebarLinks.queryAllByA11yHint('Navigates to a chat');
                    expect(optionRows).toHaveLength(3);
                });
        });
    });

    describe('in #focus mode', () => {
        it('hides unread chats', () => {
            const sidebarLinks = LHNTestUtils.getDefaultRenderedSidebarLinks();

            const report1 = LHNTestUtils.getFakeReport(['email1@test.com', 'email2@test.com']);
            const report2 = LHNTestUtils.getFakeReport(['email3@test.com', 'email4@test.com']);
            const report3 = LHNTestUtils.getFakeReport(['email5@test.com', 'email6@test.com']);

            return waitForPromisesToResolve()

                // Given the sidebar is rendered in #focus mode (hides read chats)
                // with report 1 and 2 having unread actions
                .then(() => Onyx.multiSet({
                    [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.GSD,
                    [ONYXKEYS.PERSONAL_DETAILS]: LHNTestUtils.fakePersonalDetails,
                    [ONYXKEYS.CURRENTLY_VIEWED_REPORTID]: report1.reportID.toString(),
                    [`${ONYXKEYS.COLLECTION.REPORT}${report1.reportID}`]: {...report1, lastReadSequenceNumber: LHNTestUtils.TEST_MAX_SEQUENCE_NUMBER - 1},
                    [`${ONYXKEYS.COLLECTION.REPORT}${report2.reportID}`]: {...report2, lastReadSequenceNumber: LHNTestUtils.TEST_MAX_SEQUENCE_NUMBER - 1},
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
                .then(() => Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report3.reportID}`, {lastReadSequenceNumber: LHNTestUtils.TEST_MAX_SEQUENCE_NUMBER - 1}))

                // Then all three chats are showing
                .then(() => {
                    expect(sidebarLinks.queryAllByA11yHint('Navigates to a chat')).toHaveLength(3);
                })

                // When report 1 becomes read (it's the active report)
                .then(() => Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report1.reportID}`, {lastReadSequenceNumber: LHNTestUtils.TEST_MAX_SEQUENCE_NUMBER}))

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
