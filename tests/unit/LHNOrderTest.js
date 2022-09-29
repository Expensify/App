import Onyx from 'react-native-onyx';
import {cleanup} from '@testing-library/react-native';
import lodashGet from 'lodash/get';
import waitForPromisesToResolve from '../utils/waitForPromisesToResolve';
import {LocaleContextProvider} from '../../src/components/withLocalize';
import * as Report from '../../src/libs/actions/Report';

// Be sure to include the mocked permissions library or else the beta tests won't work
jest.mock('../../src/libs/Permissions');

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
};

describe('Sidebar', () => {
    beforeAll(() => Onyx.init({
        keys: ONYXKEYS,
        registerStorageEventListener: () => {},
    }));

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

            Report.updateCurrentlyViewedReportID('1');
            return waitForPromisesToResolve()

                // When Onyx is updated with the data and the sidebar re-renders
                .then(() => Onyx.multiSet({
                    [ONYXKEYS.NVP_PRIORITY_MODE]: 'default',
                    [ONYXKEYS.PERSONAL_DETAILS]: fakePersonalDetails,
                    [`${ONYXKEYS.COLLECTION.REPORT}1`]: fakeReport1,
                    [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`]: fakeReport1Actions,
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

            Report.updateCurrentlyViewedReportID('1');
            return waitForPromisesToResolve()

                // When Onyx is updated with the data and the sidebar re-renders
                .then(() => Onyx.multiSet({
                    [ONYXKEYS.NVP_PRIORITY_MODE]: 'default',
                    [ONYXKEYS.PERSONAL_DETAILS]: fakePersonalDetails,
                    [`${ONYXKEYS.COLLECTION.REPORT}1`]: fakeReport1,
                    [`${ONYXKEYS.COLLECTION.REPORT}2`]: fakeReport2,
                    [`${ONYXKEYS.COLLECTION.REPORT}3`]: fakeReport3,
                    [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`]: fakeReport1Actions,
                    [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}2`]: fakeReport2Actions,
                    [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}2`]: fakeReport3Actions,
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

            Report.updateCurrentlyViewedReportID('1');
            return waitForPromisesToResolve()

                // When Onyx is updated with the data and the sidebar re-renders
                .then(() => Onyx.multiSet({
                    [ONYXKEYS.NVP_PRIORITY_MODE]: 'default',
                    [ONYXKEYS.PERSONAL_DETAILS]: fakePersonalDetails,
                    [`${ONYXKEYS.COLLECTION.REPORT}1`]: {...fakeReport1, hasDraft: true},
                    [`${ONYXKEYS.COLLECTION.REPORT}2`]: fakeReport2,
                    [`${ONYXKEYS.COLLECTION.REPORT}3`]: fakeReport3,
                    [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`]: fakeReport1Actions,
                    [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}2`]: fakeReport2Actions,
                    [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}2`]: fakeReport3Actions,
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
            const report1 = LHNTestUtils.getFakeReport(['email1@test.com', 'email2@test.com'], 3);
            const report2 = LHNTestUtils.getFakeReport(['email3@test.com', 'email4@test.com'], 2);
            const report3 = LHNTestUtils.getFakeReport(['email5@test.com', 'email6@test.com'], 1);

            Report.updateCurrentlyViewedReportID('1');
            return waitForPromisesToResolve()

                // When Onyx is updated with the data and the sidebar re-renders
                .then(() => Onyx.multiSet({
                    [ONYXKEYS.NVP_PRIORITY_MODE]: 'default',
                    [ONYXKEYS.PERSONAL_DETAILS]: fakePersonalDetails,
                    [`${ONYXKEYS.COLLECTION.REPORT}1`]: fakeReport1,
                    [`${ONYXKEYS.COLLECTION.REPORT}2`]: fakeReport2,
                    [`${ONYXKEYS.COLLECTION.REPORT}3`]: fakeReport3,
                    [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`]: fakeReport1Actions,
                    [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}2`]: fakeReport2Actions,
                    [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}2`]: fakeReport3Actions,
                }))

                // When a new comment is added to report 1 (eg. it's lastMessageTimestamp is updated)
                .then(() => Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report1.reportID}`, {lastMessageTimestamp: Date.now()}))

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

        test('reorders the reports to keep draft reports on top', () => {
            let sidebarLinks = getDefaultRenderedSidebarLinks();

            Report.updateCurrentlyViewedReportID('2');

            return waitForPromisesToResolve()

                // When Onyx is updated with the data and the sidebar re-renders
                .then(() => Onyx.multiSet({
                    [ONYXKEYS.NVP_PRIORITY_MODE]: 'default',
                    [ONYXKEYS.PERSONAL_DETAILS]: fakePersonalDetails,
                    [`${ONYXKEYS.COLLECTION.REPORT}1`]: fakeReport1,
                    [`${ONYXKEYS.COLLECTION.REPORT}2`]: {hasDraft: true, ...fakeReport2},
                    [`${ONYXKEYS.COLLECTION.REPORT}3`]: fakeReport3,
                    [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`]: fakeReport1Actions,
                    [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}2`]: fakeReport2Actions,
                    [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}2`]: fakeReport3Actions,
                }))

                // When the currently active chat is switched to report 1 (the one on the bottom)
                .then(() => {
                    // The changing of a route itself will re-render the component in the App, but since we are not performing this test
                    // inside the navigator and it has no access to the routes we need to trigger an update to the SidebarLinks manually.
                    Report.updateCurrentlyViewedReportID('1');
                    sidebarLinks = getDefaultRenderedSidebarLinks();
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

            Report.updateCurrentlyViewedReportID('2');
            return waitForPromisesToResolve()

                // When Onyx is updated with the data and the sidebar re-renders
                .then(() => Onyx.multiSet({
                    [ONYXKEYS.NVP_PRIORITY_MODE]: 'default',
                    [ONYXKEYS.PERSONAL_DETAILS]: fakePersonalDetails,
                    [`${ONYXKEYS.COLLECTION.REPORT}1`]: fakeReport1,
                    [`${ONYXKEYS.COLLECTION.REPORT}2`]: {hasDraft: true, ...fakeReport2},
                    [`${ONYXKEYS.COLLECTION.REPORT}3`]: fakeReport3,
                    [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`]: fakeReport1Actions,
                    [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}2`]: fakeReport2Actions,
                    [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}2`]: fakeReport3Actions,
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

            Report.updateCurrentlyViewedReportID('2');
            return waitForPromisesToResolve()

                // When Onyx is updated with the data and the sidebar re-renders
                .then(() => Onyx.multiSet({
                    [ONYXKEYS.NVP_PRIORITY_MODE]: 'default',
                    [ONYXKEYS.PERSONAL_DETAILS]: fakePersonalDetails,
                    [`${ONYXKEYS.COLLECTION.REPORT}1`]: fakeReport1,
                    [`${ONYXKEYS.COLLECTION.REPORT}2`]: {...fakeReport2, isPinned: true},
                    [`${ONYXKEYS.COLLECTION.REPORT}3`]: fakeReport3,
                    [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`]: fakeReport1Actions,
                    [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}2`]: fakeReport2Actions,
                    [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}2`]: fakeReport3Actions,
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
            report3.iouReportID = iouReport.reportID.toString();
            const currentlyViewedReportID = report2.reportID;
            const currentlyLoggedInUserEmail = 'email9@test.com';

            Report.updateCurrentlyViewedReportID('2');
            return waitForPromisesToResolve()

                // When Onyx is updated with the data and the sidebar re-renders
                .then(() => Onyx.multiSet({
                    [ONYXKEYS.NVP_PRIORITY_MODE]: 'default',
                    [ONYXKEYS.PERSONAL_DETAILS]: fakePersonalDetails,
                    [ONYXKEYS.SESSION]: {email: 'email9@test.com'},
                    [`${ONYXKEYS.COLLECTION.REPORT}1`]: {...fakeReport1, hasDraft: true},
                    [`${ONYXKEYS.COLLECTION.REPORT}2`]: {...fakeReport2, isPinned: true},
                    [`${ONYXKEYS.COLLECTION.REPORT}3`]: {...fakeReport3, iouReportID: '4', hasOutstandingIOU: true},
                    [`${ONYXKEYS.COLLECTION.REPORT_IOUS}4`]: {...fakeReportIOU, chatReportID: 3},
                    [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`]: fakeReport1Actions,
                    [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}2`]: fakeReport2Actions,
                    [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}2`]: fakeReport3Actions,
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
            const sidebarLinks = LHNTestUtils.getDefaultRenderedSidebarLinks();

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

            Report.updateCurrentlyViewedReportID('1');
            return waitForPromisesToResolve()

                // When Onyx is updated with the data and the sidebar re-renders
                .then(() => Onyx.multiSet({
                    [ONYXKEYS.NVP_PRIORITY_MODE]: 'default',
                    [ONYXKEYS.PERSONAL_DETAILS]: fakePersonalDetails,
                    [`${ONYXKEYS.COLLECTION.REPORT}1`]: {...fakeReport1, isPinned: true},
                    [`${ONYXKEYS.COLLECTION.REPORT}2`]: {...fakeReport2, isPinned: true},
                    [`${ONYXKEYS.COLLECTION.REPORT}3`]: {...fakeReport3, isPinned: true},
                    [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`]: fakeReport1Actions,
                    [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}2`]: fakeReport2Actions,
                    [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}2`]: fakeReport3Actions,
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
            const sidebarLinks = LHNTestUtils.getDefaultRenderedSidebarLinks();

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

            Report.updateCurrentlyViewedReportID('5');
            return waitForPromisesToResolve()

                // When Onyx is updated with the data and the sidebar re-renders
                .then(() => Onyx.multiSet({
                    [ONYXKEYS.NVP_PRIORITY_MODE]: 'default',
                    [ONYXKEYS.PERSONAL_DETAILS]: fakePersonalDetails,
                    [`${ONYXKEYS.COLLECTION.REPORT}1`]: {...fakeReport1, hasDraft: true},
                    [`${ONYXKEYS.COLLECTION.REPORT}2`]: {...fakeReport2, hasDraft: true},
                    [`${ONYXKEYS.COLLECTION.REPORT}3`]: {...fakeReport3, hasDraft: true},
                    [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`]: fakeReport1Actions,
                    [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}2`]: fakeReport2Actions,
                    [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}2`]: fakeReport3Actions,
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
            const sidebarLinks = LHNTestUtils.getDefaultRenderedSidebarLinks();

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

            return waitForPromisesToResolve()

                // When Onyx is updated with the data and the sidebar re-renders
                .then(() => Onyx.multiSet({
                    [ONYXKEYS.BETAS]: betas,
                    [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.DEFAULT,
                    [ONYXKEYS.PERSONAL_DETAILS]: LHNTestUtils.fakePersonalDetails,
                    [ONYXKEYS.CURRENTLY_VIEWED_REPORTID]: '0',
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
        it('hides unread chats', () => {
            let sidebarLinks = getDefaultRenderedSidebarLinks();

            Report.updateCurrentlyViewedReportID('1');
            return waitForPromisesToResolve()

                // Given the sidebar is rendered in #focus mode (hides read chats)
                // with report 1 and 2 having unread actions
                .then(() => Onyx.multiSet({
                    [ONYXKEYS.NVP_PRIORITY_MODE]: 'gsd',
                    [ONYXKEYS.PERSONAL_DETAILS]: fakePersonalDetails,
                    [`${ONYXKEYS.COLLECTION.REPORT}1`]: {...fakeReport1, lastReadSequenceNumber: TEST_MAX_SEQUENCE_NUMBER - 1},
                    [`${ONYXKEYS.COLLECTION.REPORT}2`]: {...fakeReport2, lastReadSequenceNumber: TEST_MAX_SEQUENCE_NUMBER - 1},
                    [`${ONYXKEYS.COLLECTION.REPORT}3`]: fakeReport3,
                    [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`]: fakeReport1Actions,
                    [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}2`]: fakeReport2Actions,
                    [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}2`]: fakeReport3Actions,
                }))

                // Then the reports 1 and 2 are shown and 3 is not
                .then(() => {
                    const reportOptions = sidebarLinks.queryAllByText(/ReportID, /);
                    expect(reportOptions).toHaveLength(2);
                    expect(reportOptions[0].children[0].props.children).toBe('ReportID, One');
                    expect(reportOptions[1].children[0].props.children).toBe('ReportID, Two');
                })

                // When report3 becomes unread
                .then(() => Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}3`, {lastReadSequenceNumber: TEST_MAX_SEQUENCE_NUMBER - 1}))

                // Then all three chats are showing
                .then(() => {
                    expect(sidebarLinks.queryAllByText(/ReportID, /)).toHaveLength(3);
                })

                // When report 1 becomes read (it's the active report)
                .then(() => Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}1`, {lastReadSequenceNumber: TEST_MAX_SEQUENCE_NUMBER}))

                // Then all three chats are still showing
                .then(() => {
                    expect(sidebarLinks.queryAllByText(/ReportID, /)).toHaveLength(3);
                })

                // When report 2 becomes the active report
                .then(() => {
                    // The changing of a route itself will re-render the component in the App, but since we are not performing this test
                    // inside the navigator and it has no access to the routes we need to trigger an update to the SidebarLinks manually.
                    Report.updateCurrentlyViewedReportID('2');
                    sidebarLinks = getDefaultRenderedSidebarLinks();
                    return waitForPromisesToResolve();
                })

                // Then report 1 should now disappear
                .then(() => {
                    expect(sidebarLinks.queryAllByText(/ReportID, /)).toHaveLength(2);
                    expect(sidebarLinks.queryAllByText(/ReportID, One/)).toHaveLength(0);
                });
        });

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

            Report.updateCurrentlyViewedReportID('1');
            return waitForPromisesToResolve()

                // Given the sidebar is rendered in #focus mode (hides read chats)
                // with all reports having unread comments
                .then(() => Onyx.multiSet({
                    [ONYXKEYS.NVP_PRIORITY_MODE]: 'gsd',
                    [ONYXKEYS.PERSONAL_DETAILS]: fakePersonalDetails,
                    [`${ONYXKEYS.COLLECTION.REPORT}1`]: {...fakeReport1, lastReadSequenceNumber: TEST_MAX_SEQUENCE_NUMBER - 1},
                    [`${ONYXKEYS.COLLECTION.REPORT}2`]: {...fakeReport2, lastReadSequenceNumber: TEST_MAX_SEQUENCE_NUMBER - 1},
                    [`${ONYXKEYS.COLLECTION.REPORT}3`]: {...fakeReport3, lastReadSequenceNumber: TEST_MAX_SEQUENCE_NUMBER - 1},
                    [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}1`]: fakeReport1Actions,
                    [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}2`]: fakeReport2Actions,
                    [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}2`]: fakeReport3Actions,
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
            const sidebarLinks = LHNTestUtils.getDefaultRenderedSidebarLinks();

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

            return waitForPromisesToResolve()

                // When Onyx is updated with the data and the sidebar re-renders
                .then(() => Onyx.multiSet({
                    [ONYXKEYS.BETAS]: betas,
                    [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.GSD,
                    [ONYXKEYS.PERSONAL_DETAILS]: LHNTestUtils.fakePersonalDetails,
                    [ONYXKEYS.CURRENTLY_VIEWED_REPORTID]: '0',
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
