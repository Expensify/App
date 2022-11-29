import Onyx from 'react-native-onyx';
import {cleanup} from '@testing-library/react-native';
import lodashGet from 'lodash/get';
import waitForPromisesToResolve from '../utils/waitForPromisesToResolve';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import CONST from '../../src/CONST';
import DateUtils from '../../src/libs/DateUtils';

// Be sure to include the mocked Permissions and Expensicons libraries or else the beta tests won't work
jest.mock('../../src/libs/Permissions');
jest.mock('../../src/components/Icon/Expensicons');

const ONYXKEYS = {
    PERSONAL_DETAILS: 'personalDetails',
    NVP_PRIORITY_MODE: 'nvp_priorityMode',
    SESSION: 'session',
    BETAS: 'betas',
    COLLECTION: {
        REPORT: 'report_',
        REPORT_ACTIONS: 'reportActions_',
        REPORT_IOUS: 'reportIOUs_',
    },
    NETWORK: 'network',
};

describe('Sidebar', () => {
    beforeAll(() => Onyx.init({
        keys: ONYXKEYS,
        registerStorageEventListener: () => {},
    }));

    // Initialize the network key for OfflineWithFeedback
    beforeEach(() => Onyx.merge(ONYXKEYS.NETWORK, {isOffline: false}));

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
            // Given a single report
            const report = LHNTestUtils.getFakeReport(['email1@test.com', 'email2@test.com']);
            const sidebarLinks = LHNTestUtils.getDefaultRenderedSidebarLinks(report.reportID);

            return waitForPromisesToResolve()

                // When Onyx is updated with the data and the sidebar re-renders
                .then(() => Onyx.multiSet({
                    [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.DEFAULT,
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

            // Given three unread reports in the recently updated order of 3, 2, 1
            const report1 = {
                ...LHNTestUtils.getFakeReport(['email1@test.com', 'email2@test.com'], 3),
                lastReadSequenceNumber: LHNTestUtils.TEST_MAX_SEQUENCE_NUMBER - 1,
            };
            const report2 = {
                ...LHNTestUtils.getFakeReport(['email3@test.com', 'email4@test.com'], 2),
                lastReadSequenceNumber: LHNTestUtils.TEST_MAX_SEQUENCE_NUMBER - 1,
            };
            const report3 = {
                ...LHNTestUtils.getFakeReport(['email5@test.com', 'email6@test.com'], 1),
                lastReadSequenceNumber: LHNTestUtils.TEST_MAX_SEQUENCE_NUMBER - 1,
            };

            return waitForPromisesToResolve()

                // When Onyx is updated with the data and the sidebar re-renders
                .then(() => Onyx.multiSet({
                    [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.DEFAULT,
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

        it('changes the order when adding a draft to the active report', () => {
            // Given three reports in the recently updated order of 3, 2, 1
            // And the first report has a draft
            // And the currently viewed report is the first report
            const report1 = {
                ...LHNTestUtils.getFakeReport(['email1@test.com', 'email2@test.com'], 3),
                hasDraft: true,
            };
            const report2 = LHNTestUtils.getFakeReport(['email3@test.com', 'email4@test.com'], 2);
            const report3 = LHNTestUtils.getFakeReport(['email5@test.com', 'email6@test.com'], 1);
            const reportIDFromRoute = report1.reportID;
            const sidebarLinks = LHNTestUtils.getDefaultRenderedSidebarLinks(reportIDFromRoute);
            return waitForPromisesToResolve()

                // When Onyx is updated with the data and the sidebar re-renders
                .then(() => Onyx.multiSet({
                    [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.DEFAULT,
                    [ONYXKEYS.PERSONAL_DETAILS]: LHNTestUtils.fakePersonalDetails,
                    [`${ONYXKEYS.COLLECTION.REPORT}${report1.reportID}`]: report1,
                    [`${ONYXKEYS.COLLECTION.REPORT}${report2.reportID}`]: report2,
                    [`${ONYXKEYS.COLLECTION.REPORT}${report3.reportID}`]: report3,
                }))

                // Then there should be a pencil icon and report one should be the first one because putting a draft on the active report should change its location
                // in the ordered list
                .then(() => {
                    const pencilIcon = sidebarLinks.getAllByAccessibilityHint('Pencil Icon');
                    expect(pencilIcon).toHaveLength(1);

                    const displayNames = sidebarLinks.queryAllByA11yLabel('Chat user display names');
                    expect(displayNames).toHaveLength(3);
                    expect(lodashGet(displayNames, [0, 'props', 'children'])).toBe('One, Two'); // this has `hasDraft` flag enabled so it will be on top
                    expect(lodashGet(displayNames, [1, 'props', 'children'])).toBe('Five, Six');
                    expect(lodashGet(displayNames, [2, 'props', 'children'])).toBe('Three, Four');
                });
        });

        it('reorders the reports to always have the most recently updated one on top', () => {
            const sidebarLinks = LHNTestUtils.getDefaultRenderedSidebarLinks();

            // Given three reports in the recently updated order of 3, 2, 1
            const report1 = LHNTestUtils.getFakeReport(['email1@test.com', 'email2@test.com'], 3);
            const report2 = LHNTestUtils.getFakeReport(['email3@test.com', 'email4@test.com'], 2);
            const report3 = LHNTestUtils.getFakeReport(['email5@test.com', 'email6@test.com'], 1);

            return waitForPromisesToResolve()

                // When Onyx is updated with the data and the sidebar re-renders
                .then(() => Onyx.multiSet({
                    [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.DEFAULT,
                    [ONYXKEYS.PERSONAL_DETAILS]: LHNTestUtils.fakePersonalDetails,
                    [`${ONYXKEYS.COLLECTION.REPORT}${report1.reportID}`]: report1,
                    [`${ONYXKEYS.COLLECTION.REPORT}${report2.reportID}`]: report2,
                    [`${ONYXKEYS.COLLECTION.REPORT}${report3.reportID}`]: report3,
                }))

                // When a new comment is added to report 1 (eg. it's lastActionCreated is updated)
                .then(() => Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report1.reportID}`, {
                    lastActionCreated: DateUtils.getDBTime(),
                }))

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
            // Given three reports in the recently updated order of 3, 2, 1
            // And the second report has a draft
            // And the currently viewed report is the second report
            const report1 = LHNTestUtils.getFakeReport(['email1@test.com', 'email2@test.com'], 3);
            const report2 = {
                ...LHNTestUtils.getFakeReport(['email3@test.com', 'email4@test.com'], 2),
                hasDraft: true,
            };
            const report3 = LHNTestUtils.getFakeReport(['email5@test.com', 'email6@test.com'], 1);
            const reportIDFromRoute = report2.reportID;
            let sidebarLinks = LHNTestUtils.getDefaultRenderedSidebarLinks(reportIDFromRoute);

            return waitForPromisesToResolve()

                // When Onyx is updated with the data and the sidebar re-renders
                .then(() => Onyx.multiSet({
                    [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.DEFAULT,
                    [ONYXKEYS.PERSONAL_DETAILS]: LHNTestUtils.fakePersonalDetails,
                    [`${ONYXKEYS.COLLECTION.REPORT}${report1.reportID}`]: report1,
                    [`${ONYXKEYS.COLLECTION.REPORT}${report2.reportID}`]: report2,
                    [`${ONYXKEYS.COLLECTION.REPORT}${report3.reportID}`]: report3,
                }))

                // When the currently active chat is switched to report 1 (the one on the bottom)
                .then(() => {
                    // The changing of a route itself will re-render the component in the App, but since we are not performing this test
                    // inside the navigator and it has no access to the routes we need to trigger an update to the SidebarLinks manually.
                    sidebarLinks = LHNTestUtils.getDefaultRenderedSidebarLinks('1');
                    return waitForPromisesToResolve();
                })

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
                    [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.DEFAULT,
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
                    [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.DEFAULT,
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
            // Given three reports in the recently updated order of 3, 2, 1
            // with the current user set to email9@ (someone not participating in any of the chats)
            // with a report that has a draft, a report that is pinned, and
            //    an outstanding IOU report that doesn't belong to the current user
            const report1 = {
                ...LHNTestUtils.getFakeReport(['email1@test.com', 'email2@test.com'], 3),
                isPinned: true,
            };
            const report2 = {
                ...LHNTestUtils.getFakeReport(['email3@test.com', 'email4@test.com'], 2),
                hasDraft: true,
            };
            const report3 = {
                ...LHNTestUtils.getFakeReport(['email5@test.com', 'email6@test.com'], 1),
                hasOutstandingIOU: true,

                // This has to be added after the IOU report is generated
                iouReportID: null,
            };
            const iouReport = {
                ...LHNTestUtils.getFakeReport(['email7@test.com', 'email8@test.com']),
                ownerEmail: 'email2@test.com',
                hasOutstandingIOU: true,
                total: 10000,
                currency: 'USD',
                chatReportID: report3.reportID,
            };
            report3.iouReportID = iouReport.reportID;
            const reportIDFromRoute = report2.reportID;
            const currentlyLoggedInUserEmail = 'email9@test.com';
            const sidebarLinks = LHNTestUtils.getDefaultRenderedSidebarLinks(reportIDFromRoute);

            return waitForPromisesToResolve()

                // When Onyx is updated with the data and the sidebar re-renders
                .then(() => Onyx.multiSet({
                    [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.DEFAULT,
                    [ONYXKEYS.PERSONAL_DETAILS]: LHNTestUtils.fakePersonalDetails,
                    [ONYXKEYS.SESSION]: {email: currentlyLoggedInUserEmail},
                    [`${ONYXKEYS.COLLECTION.REPORT}${report1.reportID}`]: report1,
                    [`${ONYXKEYS.COLLECTION.REPORT}${report2.reportID}`]: report2,
                    [`${ONYXKEYS.COLLECTION.REPORT}${report3.reportID}`]: report3,
                    [`${ONYXKEYS.COLLECTION.REPORT_IOUS}${iouReport.reportID}`]: iouReport,
                }))

                // Then the reports are ordered by Pinned > IOU > Draft
                // there is a pencil icon
                // there is a pinned icon
                .then(() => {
                    const displayNames = sidebarLinks.queryAllByA11yLabel('Chat user display names');
                    expect(displayNames).toHaveLength(3);
                    expect(sidebarLinks.getAllByAccessibilityHint('Pin Icon')).toHaveLength(1);
                    expect(sidebarLinks.getAllByAccessibilityHint('Pencil Icon')).toHaveLength(1);
                    expect(lodashGet(displayNames, [0, 'props', 'children'])).toBe('One, Two');
                    expect(lodashGet(displayNames, [1, 'props', 'children'])).toBe('Five, Six');
                    expect(lodashGet(displayNames, [2, 'props', 'children'])).toBe('Three, Four');
                });
        });

        it('alphabetizes all the chats that are pinned', () => {
            // Given three reports in the recently updated order of 3, 2, 1
            // and they are all pinned
            const report1 = {
                ...LHNTestUtils.getFakeReport(['email1@test.com', 'email2@test.com'], 3),
                isPinned: true,
            };
            const report2 = {
                ...LHNTestUtils.getFakeReport(['email3@test.com', 'email4@test.com'], 2),
                isPinned: true,
            };
            const report3 = {
                ...LHNTestUtils.getFakeReport(['email5@test.com', 'email6@test.com'], 1),
                isPinned: true,
            };
            const report4 = {
                ...LHNTestUtils.getFakeReport(['email7@test.com', 'email8@test.com'], 0),
                isPinned: true,
            };
            const sidebarLinks = LHNTestUtils.getDefaultRenderedSidebarLinks('0');
            return waitForPromisesToResolve()

                // When Onyx is updated with the data and the sidebar re-renders
                .then(() => Onyx.multiSet({
                    [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.DEFAULT,
                    [ONYXKEYS.PERSONAL_DETAILS]: LHNTestUtils.fakePersonalDetails,
                    [`${ONYXKEYS.COLLECTION.REPORT}${report1.reportID}`]: report1,
                    [`${ONYXKEYS.COLLECTION.REPORT}${report2.reportID}`]: report2,
                    [`${ONYXKEYS.COLLECTION.REPORT}${report3.reportID}`]: report3,
                }))

                // Then the reports are in alphabetical order
                .then(() => {
                    const displayNames = sidebarLinks.queryAllByA11yLabel('Chat user display names');
                    expect(displayNames).toHaveLength(3);
                    expect(lodashGet(displayNames, [0, 'props', 'children'])).toBe('Five, Six');
                    expect(lodashGet(displayNames, [1, 'props', 'children'])).toBe('One, Two');
                    expect(lodashGet(displayNames, [2, 'props', 'children'])).toBe('Three, Four');
                })

                // When a new report is added
                .then(() => Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report4.reportID}`, report4))

                // Then they are still in alphabetical order
                .then(() => {
                    const displayNames = sidebarLinks.queryAllByA11yLabel('Chat user display names');
                    expect(displayNames).toHaveLength(4);
                    expect(lodashGet(displayNames, [0, 'props', 'children'])).toBe('Five, Six');
                    expect(lodashGet(displayNames, [1, 'props', 'children'])).toBe('One, Two');
                    expect(lodashGet(displayNames, [2, 'props', 'children'])).toBe('Seven, Eight');
                    expect(lodashGet(displayNames, [3, 'props', 'children'])).toBe('Three, Four');
                });
        });

        it('alphabetizes all the chats that have drafts', () => {
            // Given three reports in the recently updated order of 3, 2, 1
            // and they all have drafts
            const report1 = {
                ...LHNTestUtils.getFakeReport(['email1@test.com', 'email2@test.com'], 3),
                hasDraft: true,
            };
            const report2 = {
                ...LHNTestUtils.getFakeReport(['email3@test.com', 'email4@test.com'], 2),
                hasDraft: true,
            };
            const report3 = {
                ...LHNTestUtils.getFakeReport(['email5@test.com', 'email6@test.com'], 1),
                hasDraft: true,
            };
            const report4 = {
                ...LHNTestUtils.getFakeReport(['email7@test.com', 'email8@test.com'], 0),
                hasDraft: true,
            };
            const sidebarLinks = LHNTestUtils.getDefaultRenderedSidebarLinks('0');
            return waitForPromisesToResolve()

                // When Onyx is updated with the data and the sidebar re-renders
                .then(() => Onyx.multiSet({
                    [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.DEFAULT,
                    [ONYXKEYS.PERSONAL_DETAILS]: LHNTestUtils.fakePersonalDetails,
                    [`${ONYXKEYS.COLLECTION.REPORT}${report1.reportID}`]: report1,
                    [`${ONYXKEYS.COLLECTION.REPORT}${report2.reportID}`]: report2,
                    [`${ONYXKEYS.COLLECTION.REPORT}${report3.reportID}`]: report3,
                }))

                // Then the reports are in alphabetical order
                .then(() => {
                    const displayNames = sidebarLinks.queryAllByA11yLabel('Chat user display names');
                    expect(displayNames).toHaveLength(3);
                    expect(lodashGet(displayNames, [0, 'props', 'children'])).toBe('Five, Six');
                    expect(lodashGet(displayNames, [1, 'props', 'children'])).toBe('One, Two');
                    expect(lodashGet(displayNames, [2, 'props', 'children'])).toBe('Three, Four');
                })

                // When a new report is added
                .then(() => Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report4.reportID}`, report4))

                // Then they are still in alphabetical order
                .then(() => {
                    const displayNames = sidebarLinks.queryAllByA11yLabel('Chat user display names');
                    expect(displayNames).toHaveLength(4);
                    expect(lodashGet(displayNames, [0, 'props', 'children'])).toBe('Five, Six');
                    expect(lodashGet(displayNames, [1, 'props', 'children'])).toBe('One, Two');
                    expect(lodashGet(displayNames, [2, 'props', 'children'])).toBe('Seven, Eight');
                    expect(lodashGet(displayNames, [3, 'props', 'children'])).toBe('Three, Four');
                });
        });

        it('puts archived chats last', () => {
            // Given three reports, with the first report being archived
            const report1 = {
                ...LHNTestUtils.getFakeReport(['email1@test.com', 'email2@test.com']),
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
                statusNum: CONST.REPORT.STATUS.CLOSED,
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            };
            const report2 = LHNTestUtils.getFakeReport(['email3@test.com', 'email4@test.com']);
            const report3 = LHNTestUtils.getFakeReport(['email5@test.com', 'email6@test.com']);

            // Given the user is in all betas
            const betas = [
                CONST.BETAS.DEFAULT_ROOMS,
                CONST.BETAS.POLICY_ROOMS,
                CONST.BETAS.POLICY_EXPENSE_CHAT,
            ];
            const sidebarLinks = LHNTestUtils.getDefaultRenderedSidebarLinks('0');
            return waitForPromisesToResolve()

                // When Onyx is updated with the data and the sidebar re-renders
                .then(() => Onyx.multiSet({
                    [ONYXKEYS.BETAS]: betas,
                    [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.DEFAULT,
                    [ONYXKEYS.PERSONAL_DETAILS]: LHNTestUtils.fakePersonalDetails,
                    [`${ONYXKEYS.COLLECTION.REPORT}${report1.reportID}`]: report1,
                    [`${ONYXKEYS.COLLECTION.REPORT}${report2.reportID}`]: report2,
                    [`${ONYXKEYS.COLLECTION.REPORT}${report3.reportID}`]: report3,
                }))

                // Then the first report is in last position
                .then(() => {
                    const displayNames = sidebarLinks.queryAllByA11yLabel('Chat user display names');
                    expect(displayNames).toHaveLength(3);
                    expect(lodashGet(displayNames, [0, 'props', 'children'])).toBe('Five, Six');
                    expect(lodashGet(displayNames, [1, 'props', 'children'])).toBe('Three, Four');
                    expect(lodashGet(displayNames, [2, 'props', 'children'])).toBe('Report (archived)');
                });
        });
    });

    describe('in #focus mode', () => {
        it('alphabetizes chats', () => {
            const sidebarLinks = LHNTestUtils.getDefaultRenderedSidebarLinks();

            const report1 = {
                ...LHNTestUtils.getFakeReport(['email1@test.com', 'email2@test.com'], 3),
                lastReadSequenceNumber: LHNTestUtils.TEST_MAX_SEQUENCE_NUMBER - 1,
            };
            const report2 = {
                ...LHNTestUtils.getFakeReport(['email3@test.com', 'email4@test.com'], 2),
                lastReadSequenceNumber: LHNTestUtils.TEST_MAX_SEQUENCE_NUMBER - 1,
            };
            const report3 = {
                ...LHNTestUtils.getFakeReport(['email5@test.com', 'email6@test.com'], 1),
                lastReadSequenceNumber: LHNTestUtils.TEST_MAX_SEQUENCE_NUMBER - 1,
            };
            const report4 = {
                ...LHNTestUtils.getFakeReport(['email7@test.com', 'email8@test.com'], 0),
                lastReadSequenceNumber: LHNTestUtils.TEST_MAX_SEQUENCE_NUMBER - 1,
            };

            return waitForPromisesToResolve()

                // Given the sidebar is rendered in #focus mode (hides read chats)
                // with all reports having unread comments
                .then(() => Onyx.multiSet({
                    [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.GSD,
                    [ONYXKEYS.PERSONAL_DETAILS]: LHNTestUtils.fakePersonalDetails,
                    [`${ONYXKEYS.COLLECTION.REPORT}${report1.reportID}`]: report1,
                    [`${ONYXKEYS.COLLECTION.REPORT}${report2.reportID}`]: report2,
                    [`${ONYXKEYS.COLLECTION.REPORT}${report3.reportID}`]: report3,
                }))

                // Then the reports are in alphabetical order
                .then(() => {
                    const displayNames = sidebarLinks.queryAllByA11yLabel('Chat user display names');
                    expect(displayNames).toHaveLength(3);
                    expect(lodashGet(displayNames, [0, 'props', 'children'])).toBe('Five, Six');
                    expect(lodashGet(displayNames, [1, 'props', 'children'])).toBe('One, Two');
                    expect(lodashGet(displayNames, [2, 'props', 'children'])).toBe('Three, Four');
                })

                // When a new report is added
                .then(() => Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report4.reportID}`, report4))

                // Then they are still in alphabetical order
                .then(() => {
                    const displayNames = sidebarLinks.queryAllByA11yLabel('Chat user display names');
                    expect(displayNames).toHaveLength(4);
                    expect(lodashGet(displayNames, [0, 'props', 'children'])).toBe('Five, Six');
                    expect(lodashGet(displayNames, [1, 'props', 'children'])).toBe('One, Two');
                    expect(lodashGet(displayNames, [2, 'props', 'children'])).toBe('Seven, Eight');
                    expect(lodashGet(displayNames, [3, 'props', 'children'])).toBe('Three, Four');
                });
        });

        it('puts archived chats last', () => {
            // Given three unread reports, with the first report being archived
            const report1 = {
                ...LHNTestUtils.getFakeReport(['email1@test.com', 'email2@test.com'], 3),
                lastReadSequenceNumber: LHNTestUtils.TEST_MAX_SEQUENCE_NUMBER - 1,
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
                statusNum: CONST.REPORT.STATUS.CLOSED,
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            };
            const report2 = {
                ...LHNTestUtils.getFakeReport(['email3@test.com', 'email4@test.com'], 2),
                lastReadSequenceNumber: LHNTestUtils.TEST_MAX_SEQUENCE_NUMBER - 1,
            };
            const report3 = {
                ...LHNTestUtils.getFakeReport(['email5@test.com', 'email6@test.com'], 1),
                lastReadSequenceNumber: LHNTestUtils.TEST_MAX_SEQUENCE_NUMBER - 1,
            };

            // Given the user is in all betas
            const betas = [
                CONST.BETAS.DEFAULT_ROOMS,
                CONST.BETAS.POLICY_ROOMS,
                CONST.BETAS.POLICY_EXPENSE_CHAT,
            ];
            const sidebarLinks = LHNTestUtils.getDefaultRenderedSidebarLinks('0');
            return waitForPromisesToResolve()

                // When Onyx is updated with the data and the sidebar re-renders
                .then(() => Onyx.multiSet({
                    [ONYXKEYS.BETAS]: betas,
                    [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.GSD,
                    [ONYXKEYS.PERSONAL_DETAILS]: LHNTestUtils.fakePersonalDetails,
                    [`${ONYXKEYS.COLLECTION.REPORT}${report1.reportID}`]: report1,
                    [`${ONYXKEYS.COLLECTION.REPORT}${report2.reportID}`]: report2,
                    [`${ONYXKEYS.COLLECTION.REPORT}${report3.reportID}`]: report3,
                }))

                // Then the first report is in last position
                .then(() => {
                    const displayNames = sidebarLinks.queryAllByA11yLabel('Chat user display names');
                    expect(displayNames).toHaveLength(3);
                    expect(lodashGet(displayNames, [0, 'props', 'children'])).toBe('Five, Six');
                    expect(lodashGet(displayNames, [1, 'props', 'children'])).toBe('Three, Four');
                    expect(lodashGet(displayNames, [2, 'props', 'children'])).toBe('Report (archived)');
                });
        });
    });
});
