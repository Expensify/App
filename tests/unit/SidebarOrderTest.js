import Onyx from 'react-native-onyx';
import {cleanup, screen} from '@testing-library/react-native';
import lodashGet from 'lodash/get';
import waitForPromisesToResolve from '../utils/waitForPromisesToResolve';
import wrapOnyxWithWaitForPromisesToResolve from '../utils/wrapOnyxWithWaitForPromisesToResolve';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import CONST from '../../src/CONST';
import DateUtils from '../../src/libs/DateUtils';
import * as Localize from '../../src/libs/Localize';

// Be sure to include the mocked Permissions and Expensicons libraries or else the beta tests won't work
jest.mock('../../src/libs/Permissions');
jest.mock('../../src/components/Icon/Expensicons');

const ONYXKEYS = {
    PERSONAL_DETAILS_LIST: 'personalDetailsList',
    NVP_PRIORITY_MODE: 'nvp_priorityMode',
    SESSION: 'session',
    BETAS: 'betas',
    COLLECTION: {
        REPORT: 'report_',
        REPORT_ACTIONS: 'reportActions_',
    },
    NETWORK: 'network',
};

describe('Sidebar', () => {
    beforeAll(() =>
        Onyx.init({
            keys: ONYXKEYS,
            registerStorageEventListener: () => {},
            safeEvictionKeys: [ONYXKEYS.COLLECTION.REPORT_ACTIONS],
        }),
    );

    beforeEach(() => {
        // Wrap Onyx each onyx action with waitForPromiseToResolve
        wrapOnyxWithWaitForPromisesToResolve(Onyx);
        // Initialize the network key for OfflineWithFeedback
        return Onyx.merge(ONYXKEYS.NETWORK, {isOffline: false});
    });

    // Clear out Onyx after each test so that each test starts with a clean slate
    afterEach(() => {
        cleanup();
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

        it('is rendered with an empty list when personal details exist', () => {
            // Given the sidebar is rendered with default props
            LHNTestUtils.getDefaultRenderedSidebarLinks();

            return (
                waitForPromisesToResolve()
                    // When Onyx is updated with some personal details
                    .then(() =>
                        Onyx.multiSet({
                            [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
                        }),
                    )

                    // Then the component should be rendered with an empty list since it will get past the early return
                    .then(() => {
                        expect(screen.toJSON()).not.toBe(null);
                        const navigatesToChatHintText = Localize.translateLocal('accessibilityHints.navigatesToChat');
                        expect(screen.queryAllByAccessibilityHint(navigatesToChatHintText)).toHaveLength(0);
                    })
            );
        });

        it('contains one report when a report is in Onyx', () => {
            // Given a single report
            const report = LHNTestUtils.getFakeReport([1, 2]);
            LHNTestUtils.getDefaultRenderedSidebarLinks(report.reportID);

            return (
                waitForPromisesToResolve()
                    // When Onyx is updated with the data and the sidebar re-renders
                    .then(() =>
                        Onyx.multiSet({
                            [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.DEFAULT,
                            [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
                            [`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`]: report,
                        }),
                    )

                    // Then the component should be rendered with an item for the report
                    .then(() => {
                        expect(screen.queryAllByText('One, Two')).toHaveLength(1);
                    })
            );
        });

        it('orders items with most recently updated on top', () => {
            LHNTestUtils.getDefaultRenderedSidebarLinks();

            // Given three unread reports in the recently updated order of 3, 2, 1
            const report1 = {
                ...LHNTestUtils.getFakeReport([1, 2], 3),
            };
            const report2 = {
                ...LHNTestUtils.getFakeReport([3, 4], 2),
            };
            const report3 = {
                ...LHNTestUtils.getFakeReport([5, 6], 1),
            };

            return (
                waitForPromisesToResolve()
                    // When Onyx is updated with the data and the sidebar re-renders
                    .then(() =>
                        Onyx.multiSet({
                            [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.DEFAULT,
                            [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
                            [`${ONYXKEYS.COLLECTION.REPORT}${report1.reportID}`]: report1,
                            [`${ONYXKEYS.COLLECTION.REPORT}${report2.reportID}`]: report2,
                            [`${ONYXKEYS.COLLECTION.REPORT}${report3.reportID}`]: report3,
                        }),
                    )

                    // Then the component should be rendered with the mostly recently updated report first
                    .then(() => {
                        const hintText = Localize.translateLocal('accessibilityHints.chatUserDisplayNames');
                        const displayNames = screen.queryAllByLabelText(hintText);
                        expect(displayNames).toHaveLength(3);
                        expect(lodashGet(displayNames, [0, 'props', 'children'])).toBe('Five, Six');
                        expect(lodashGet(displayNames, [1, 'props', 'children'])).toBe('Three, Four');
                        expect(lodashGet(displayNames, [2, 'props', 'children'])).toBe('One, Two');
                    })
            );
        });

        it('changes the order when adding a draft to the active report', () => {
            // Given three reports in the recently updated order of 3, 2, 1
            // And the first report has a draft
            // And the currently viewed report is the first report
            const report1 = {
                ...LHNTestUtils.getFakeReport([1, 2], 3),
                hasDraft: true,
            };
            const report2 = LHNTestUtils.getFakeReport([3, 4], 2);
            const report3 = LHNTestUtils.getFakeReport([5, 6], 1);
            const currentReportId = report1.reportID;
            LHNTestUtils.getDefaultRenderedSidebarLinks(currentReportId);
            return (
                waitForPromisesToResolve()
                    // When Onyx is updated with the data and the sidebar re-renders
                    .then(() =>
                        Onyx.multiSet({
                            [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.DEFAULT,
                            [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
                            [`${ONYXKEYS.COLLECTION.REPORT}${report1.reportID}`]: report1,
                            [`${ONYXKEYS.COLLECTION.REPORT}${report2.reportID}`]: report2,
                            [`${ONYXKEYS.COLLECTION.REPORT}${report3.reportID}`]: report3,
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
                        expect(lodashGet(displayNames, [0, 'props', 'children'])).toBe('One, Two'); // this has `hasDraft` flag enabled so it will be on top
                        expect(lodashGet(displayNames, [1, 'props', 'children'])).toBe('Five, Six');
                        expect(lodashGet(displayNames, [2, 'props', 'children'])).toBe('Three, Four');
                    })
            );
        });

        it('reorders the reports to always have the most recently updated one on top', () => {
            LHNTestUtils.getDefaultRenderedSidebarLinks();

            // Given three reports in the recently updated order of 3, 2, 1
            const report1 = LHNTestUtils.getFakeReport([1, 2], 3);
            const report2 = LHNTestUtils.getFakeReport([3, 4], 2);
            const report3 = LHNTestUtils.getFakeReport([5, 6], 1);

            return (
                waitForPromisesToResolve()
                    // When Onyx is updated with the data and the sidebar re-renders
                    .then(() =>
                        Onyx.multiSet({
                            [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.DEFAULT,
                            [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
                            [`${ONYXKEYS.COLLECTION.REPORT}${report1.reportID}`]: report1,
                            [`${ONYXKEYS.COLLECTION.REPORT}${report2.reportID}`]: report2,
                            [`${ONYXKEYS.COLLECTION.REPORT}${report3.reportID}`]: report3,
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
                        expect(lodashGet(displayNames, [0, 'props', 'children'])).toBe('One, Two');
                        expect(lodashGet(displayNames, [1, 'props', 'children'])).toBe('Five, Six');
                        expect(lodashGet(displayNames, [2, 'props', 'children'])).toBe('Three, Four');
                    })
            );
        });

        it('reorders the reports to keep draft reports on top', () => {
            // Given three reports in the recently updated order of 3, 2, 1
            // And the second report has a draft
            // And the currently viewed report is the second report
            const report1 = LHNTestUtils.getFakeReport([1, 2], 3);
            const report2 = {
                ...LHNTestUtils.getFakeReport([3, 4], 2),
                hasDraft: true,
            };
            const report3 = LHNTestUtils.getFakeReport([5, 6], 1);
            const currentReportId = report2.reportID;
            LHNTestUtils.getDefaultRenderedSidebarLinks(currentReportId);

            return (
                waitForPromisesToResolve()
                    // When Onyx is updated with the data and the sidebar re-renders
                    .then(() =>
                        Onyx.multiSet({
                            [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.DEFAULT,
                            [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
                            [`${ONYXKEYS.COLLECTION.REPORT}${report1.reportID}`]: report1,
                            [`${ONYXKEYS.COLLECTION.REPORT}${report2.reportID}`]: report2,
                            [`${ONYXKEYS.COLLECTION.REPORT}${report3.reportID}`]: report3,
                        }),
                    )

                    // When the currently active chat is switched to report 1 (the one on the bottom)
                    .then(() => {
                        // The changing of a route itself will re-render the component in the App, but since we are not performing this test
                        // inside the navigator and it has no access to the routes we need to trigger an update to the SidebarLinks manually.
                        LHNTestUtils.getDefaultRenderedSidebarLinks('1');
                        return waitForPromisesToResolve();
                    })

                    // Then the order of the reports should be 2 > 3 > 1
                    //                                         ^--- (2 goes to the front and pushes 3 down)
                    .then(() => {
                        const hintText = Localize.translateLocal('accessibilityHints.chatUserDisplayNames');
                        const displayNames = screen.queryAllByLabelText(hintText);
                        expect(displayNames).toHaveLength(3);
                        expect(lodashGet(displayNames, [0, 'props', 'children'])).toBe('Three, Four');
                        expect(lodashGet(displayNames, [1, 'props', 'children'])).toBe('Five, Six');
                        expect(lodashGet(displayNames, [2, 'props', 'children'])).toBe('One, Two');
                    })
            );
        });

        it('removes the pencil icon when draft is removed', () => {
            LHNTestUtils.getDefaultRenderedSidebarLinks();

            // Given a single report
            // And the report has a draft
            const report = {
                ...LHNTestUtils.getFakeReport([1, 2]),
                hasDraft: true,
            };

            return (
                waitForPromisesToResolve()
                    // When Onyx is updated with the data and the sidebar re-renders
                    .then(() =>
                        Onyx.multiSet({
                            [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.DEFAULT,
                            [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
                            [`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`]: report,
                        }),
                    )

                    // Then there should be a pencil icon showing
                    .then(() => {
                        expect(screen.queryAllByTestId('Pencil Icon')).toHaveLength(1);
                    })

                    // When the draft is removed
                    .then(() => Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, {hasDraft: null}))

                    // Then the pencil icon goes away
                    .then(() => {
                        expect(screen.queryAllByTestId('Pencil Icon')).toHaveLength(0);
                    })
            );
        });

        it('removes the pin icon when chat is unpinned', () => {
            LHNTestUtils.getDefaultRenderedSidebarLinks();

            // Given a single report
            // And the report is pinned
            const report = {
                ...LHNTestUtils.getFakeReport([1, 2]),
                isPinned: true,
            };

            return (
                waitForPromisesToResolve()
                    // When Onyx is updated with the data and the sidebar re-renders
                    .then(() =>
                        Onyx.multiSet({
                            [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.DEFAULT,
                            [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
                            [`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`]: report,
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
            const report1 = {
                ...LHNTestUtils.getFakeReport([1, 2], 3),
                isPinned: true,
            };
            const report2 = {
                ...LHNTestUtils.getFakeReport([3, 4], 2),
                hasDraft: true,
            };
            const report3 = {
                ...LHNTestUtils.getFakeReport([5, 6], 1),
                hasOutstandingIOU: true,

                // This has to be added after the IOU report is generated
                iouReportID: null,
            };
            const iouReport = {
                ...LHNTestUtils.getFakeReport([7, 8]),
                type: CONST.REPORT.TYPE.IOU,
                ownerAccountID: 2,
                managerID: 2,
                hasOutstandingIOU: true,
                total: 10000,
                currency: 'USD',
                chatReportID: report3.reportID,
            };
            report3.iouReportID = iouReport.reportID;
            const currentReportId = report2.reportID;
            const currentlyLoggedInUserAccountID = 9;
            LHNTestUtils.getDefaultRenderedSidebarLinks(currentReportId);

            return (
                waitForPromisesToResolve()
                    // When Onyx is updated with the data and the sidebar re-renders
                    .then(() =>
                        Onyx.multiSet({
                            [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.DEFAULT,
                            [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
                            [ONYXKEYS.SESSION]: {accountID: currentlyLoggedInUserAccountID},
                            [`${ONYXKEYS.COLLECTION.REPORT}${report1.reportID}`]: report1,
                            [`${ONYXKEYS.COLLECTION.REPORT}${report2.reportID}`]: report2,
                            [`${ONYXKEYS.COLLECTION.REPORT}${report3.reportID}`]: report3,
                            [`${ONYXKEYS.COLLECTION.REPORT}${iouReport.reportID}`]: iouReport,
                        }),
                    )

                    // Then the reports are ordered by Pinned > IOU > Draft
                    // there is a pencil icon
                    // there is a pinned icon
                    .then(() => {
                        const hintText = Localize.translateLocal('accessibilityHints.chatUserDisplayNames');
                        const displayNames = screen.queryAllByLabelText(hintText);
                        expect(displayNames).toHaveLength(4);
                        expect(screen.queryAllByTestId('Pin Icon')).toHaveLength(1);
                        expect(screen.queryAllByTestId('Pencil Icon')).toHaveLength(1);
                        expect(lodashGet(displayNames, [0, 'props', 'children'])).toBe('One, Two');
                        expect(lodashGet(displayNames, [1, 'props', 'children'])).toBe('Email Two owes $100.00');
                        expect(lodashGet(displayNames, [2, 'props', 'children'])).toBe('Five, Six');
                        expect(lodashGet(displayNames, [3, 'props', 'children'])).toBe('Three, Four');
                    })
            );
        });

        it('alphabetizes all the chats that are pinned', () => {
            // Given three reports in the recently updated order of 3, 2, 1
            // and they are all pinned
            const report1 = {
                ...LHNTestUtils.getFakeReport([1, 2], 3),
                isPinned: true,
            };
            const report2 = {
                ...LHNTestUtils.getFakeReport([3, 4], 2),
                isPinned: true,
            };
            const report3 = {
                ...LHNTestUtils.getFakeReport([5, 6], 1),
                isPinned: true,
            };
            const report4 = {
                ...LHNTestUtils.getFakeReport([7, 8], 0),
                isPinned: true,
            };
            LHNTestUtils.getDefaultRenderedSidebarLinks('0');
            return (
                waitForPromisesToResolve()
                    // When Onyx is updated with the data and the sidebar re-renders
                    .then(() =>
                        Onyx.multiSet({
                            [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.DEFAULT,
                            [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
                            [`${ONYXKEYS.COLLECTION.REPORT}${report1.reportID}`]: report1,
                            [`${ONYXKEYS.COLLECTION.REPORT}${report2.reportID}`]: report2,
                            [`${ONYXKEYS.COLLECTION.REPORT}${report3.reportID}`]: report3,
                        }),
                    )

                    // Then the reports are in alphabetical order
                    .then(() => {
                        const hintText = Localize.translateLocal('accessibilityHints.chatUserDisplayNames');
                        const displayNames = screen.queryAllByLabelText(hintText);
                        expect(displayNames).toHaveLength(3);
                        expect(lodashGet(displayNames, [0, 'props', 'children'])).toBe('Five, Six');
                        expect(lodashGet(displayNames, [1, 'props', 'children'])).toBe('One, Two');
                        expect(lodashGet(displayNames, [2, 'props', 'children'])).toBe('Three, Four');
                    })

                    // When a new report is added
                    .then(() => Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report4.reportID}`, report4))

                    // Then they are still in alphabetical order
                    .then(() => {
                        const hintText = Localize.translateLocal('accessibilityHints.chatUserDisplayNames');
                        const displayNames = screen.queryAllByLabelText(hintText);
                        expect(displayNames).toHaveLength(4);
                        expect(lodashGet(displayNames, [0, 'props', 'children'])).toBe('Five, Six');
                        expect(lodashGet(displayNames, [1, 'props', 'children'])).toBe('One, Two');
                        expect(lodashGet(displayNames, [2, 'props', 'children'])).toBe('Seven, Eight');
                        expect(lodashGet(displayNames, [3, 'props', 'children'])).toBe('Three, Four');
                    })
            );
        });

        it('alphabetizes all the chats that have drafts', () => {
            // Given three reports in the recently updated order of 3, 2, 1
            // and they all have drafts
            const report1 = {
                ...LHNTestUtils.getFakeReport([1, 2], 3),
                hasDraft: true,
            };
            const report2 = {
                ...LHNTestUtils.getFakeReport([3, 4], 2),
                hasDraft: true,
            };
            const report3 = {
                ...LHNTestUtils.getFakeReport([5, 6], 1),
                hasDraft: true,
            };
            const report4 = {
                ...LHNTestUtils.getFakeReport([7, 8], 0),
                hasDraft: true,
            };
            LHNTestUtils.getDefaultRenderedSidebarLinks('0');
            return (
                waitForPromisesToResolve()
                    // When Onyx is updated with the data and the sidebar re-renders
                    .then(() =>
                        Onyx.multiSet({
                            [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.DEFAULT,
                            [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
                            [`${ONYXKEYS.COLLECTION.REPORT}${report1.reportID}`]: report1,
                            [`${ONYXKEYS.COLLECTION.REPORT}${report2.reportID}`]: report2,
                            [`${ONYXKEYS.COLLECTION.REPORT}${report3.reportID}`]: report3,
                        }),
                    )

                    // Then the reports are in alphabetical order
                    .then(() => {
                        const hintText = Localize.translateLocal('accessibilityHints.chatUserDisplayNames');
                        const displayNames = screen.queryAllByLabelText(hintText);
                        expect(displayNames).toHaveLength(3);
                        expect(lodashGet(displayNames, [0, 'props', 'children'])).toBe('Five, Six');
                        expect(lodashGet(displayNames, [1, 'props', 'children'])).toBe('One, Two');
                        expect(lodashGet(displayNames, [2, 'props', 'children'])).toBe('Three, Four');
                    })

                    // When a new report is added
                    .then(() => Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report4.reportID}`, report4))

                    // Then they are still in alphabetical order
                    .then(() => {
                        const hintText = Localize.translateLocal('accessibilityHints.chatUserDisplayNames');
                        const displayNames = screen.queryAllByLabelText(hintText);
                        expect(displayNames).toHaveLength(4);
                        expect(lodashGet(displayNames, [0, 'props', 'children'])).toBe('Five, Six');
                        expect(lodashGet(displayNames, [1, 'props', 'children'])).toBe('One, Two');
                        expect(lodashGet(displayNames, [2, 'props', 'children'])).toBe('Seven, Eight');
                        expect(lodashGet(displayNames, [3, 'props', 'children'])).toBe('Three, Four');
                    })
            );
        });

        it('puts archived chats last', () => {
            // Given three reports, with the first report being archived
            const report1 = {
                ...LHNTestUtils.getFakeReport([1, 2]),
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
                statusNum: CONST.REPORT.STATUS.CLOSED,
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            };
            const report2 = LHNTestUtils.getFakeReport([3, 4]);
            const report3 = LHNTestUtils.getFakeReport([5, 6]);

            // Given the user is in all betas
            const betas = [CONST.BETAS.DEFAULT_ROOMS, CONST.BETAS.POLICY_ROOMS, CONST.BETAS.POLICY_EXPENSE_CHAT];
            LHNTestUtils.getDefaultRenderedSidebarLinks('0');
            return (
                waitForPromisesToResolve()
                    // When Onyx is updated with the data and the sidebar re-renders
                    .then(() =>
                        Onyx.multiSet({
                            [ONYXKEYS.BETAS]: betas,
                            [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.DEFAULT,
                            [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
                            [`${ONYXKEYS.COLLECTION.REPORT}${report1.reportID}`]: report1,
                            [`${ONYXKEYS.COLLECTION.REPORT}${report2.reportID}`]: report2,
                            [`${ONYXKEYS.COLLECTION.REPORT}${report3.reportID}`]: report3,
                        }),
                    )

                    // Then the first report is in last position
                    .then(() => {
                        const hintText = Localize.translateLocal('accessibilityHints.chatUserDisplayNames');
                        const displayNames = screen.queryAllByLabelText(hintText);
                        expect(displayNames).toHaveLength(3);
                        expect(lodashGet(displayNames, [0, 'props', 'children'])).toBe('Five, Six');
                        expect(lodashGet(displayNames, [1, 'props', 'children'])).toBe('Three, Four');
                        expect(lodashGet(displayNames, [2, 'props', 'children'])).toBe('Report (archived)');
                    })
            );
        });
    });

    describe('in #focus mode', () => {
        it('alphabetizes chats', () => {
            LHNTestUtils.getDefaultRenderedSidebarLinks();

            const report1 = LHNTestUtils.getFakeReport([1, 2], 3, true);
            const report2 = LHNTestUtils.getFakeReport([3, 4], 2, true);
            const report3 = LHNTestUtils.getFakeReport([5, 6], 1, true);
            const report4 = LHNTestUtils.getFakeReport([7, 8], 0, true);

            return (
                waitForPromisesToResolve()
                    // Given the sidebar is rendered in #focus mode (hides read chats)
                    // with all reports having unread comments
                    .then(() =>
                        Onyx.multiSet({
                            [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.GSD,
                            [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
                            [`${ONYXKEYS.COLLECTION.REPORT}${report1.reportID}`]: report1,
                            [`${ONYXKEYS.COLLECTION.REPORT}${report2.reportID}`]: report2,
                            [`${ONYXKEYS.COLLECTION.REPORT}${report3.reportID}`]: report3,
                        }),
                    )

                    // Then the reports are in alphabetical order
                    .then(() => {
                        const hintText = Localize.translateLocal('accessibilityHints.chatUserDisplayNames');
                        const displayNames = screen.queryAllByLabelText(hintText);
                        expect(displayNames).toHaveLength(3);
                        expect(lodashGet(displayNames, [0, 'props', 'children'])).toBe('Five, Six');
                        expect(lodashGet(displayNames, [1, 'props', 'children'])).toBe('One, Two');
                        expect(lodashGet(displayNames, [2, 'props', 'children'])).toBe('Three, Four');
                    })

                    // When a new report is added
                    .then(() => Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report4.reportID}`, report4))

                    // Then they are still in alphabetical order
                    .then(() => {
                        const hintText = Localize.translateLocal('accessibilityHints.chatUserDisplayNames');
                        const displayNames = screen.queryAllByLabelText(hintText);
                        expect(displayNames).toHaveLength(4);
                        expect(lodashGet(displayNames, [0, 'props', 'children'])).toBe('Five, Six');
                        expect(lodashGet(displayNames, [1, 'props', 'children'])).toBe('One, Two');
                        expect(lodashGet(displayNames, [2, 'props', 'children'])).toBe('Seven, Eight');
                        expect(lodashGet(displayNames, [3, 'props', 'children'])).toBe('Three, Four');
                    })
            );
        });

        it('puts archived chats last', () => {
            // Given three unread reports, with the first report being archived
            const report1 = {
                ...LHNTestUtils.getFakeReport([1, 2], 3, true),
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
                statusNum: CONST.REPORT.STATUS.CLOSED,
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            };
            const report2 = LHNTestUtils.getFakeReport([3, 4], 2, true);
            const report3 = LHNTestUtils.getFakeReport([5, 6], 1, true);

            // Given the user is in all betas
            const betas = [CONST.BETAS.DEFAULT_ROOMS, CONST.BETAS.POLICY_ROOMS, CONST.BETAS.POLICY_EXPENSE_CHAT];
            LHNTestUtils.getDefaultRenderedSidebarLinks('0');
            return (
                waitForPromisesToResolve()
                    // When Onyx is updated with the data and the sidebar re-renders
                    .then(() =>
                        Onyx.multiSet({
                            [ONYXKEYS.BETAS]: betas,
                            [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.GSD,
                            [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
                            [`${ONYXKEYS.COLLECTION.REPORT}${report1.reportID}`]: report1,
                            [`${ONYXKEYS.COLLECTION.REPORT}${report2.reportID}`]: report2,
                            [`${ONYXKEYS.COLLECTION.REPORT}${report3.reportID}`]: report3,
                        }),
                    )

                    // Then the first report is in last position
                    .then(() => {
                        const hintText = Localize.translateLocal('accessibilityHints.chatUserDisplayNames');
                        const displayNames = screen.queryAllByLabelText(hintText);
                        expect(displayNames).toHaveLength(3);
                        expect(lodashGet(displayNames, [0, 'props', 'children'])).toBe('Five, Six');
                        expect(lodashGet(displayNames, [1, 'props', 'children'])).toBe('Three, Four');
                        expect(lodashGet(displayNames, [2, 'props', 'children'])).toBe('Report (archived)');
                    })
            );
        });

        it('orders IOU reports by displayName if amounts are the same', () => {
            // Given three IOU reports containing the same IOU amounts
            const report1 = {
                ...LHNTestUtils.getFakeReport([1, 2]),
                hasOutstandingIOU: true,

                // This has to be added after the IOU report is generated
                iouReportID: null,
            };
            const report2 = {
                ...LHNTestUtils.getFakeReport([3, 4]),
                hasOutstandingIOU: true,

                // This has to be added after the IOU report is generated
                iouReportID: null,
            };
            const report3 = {
                ...LHNTestUtils.getFakeReport([5, 6]),
                hasOutstandingIOU: true,

                // This has to be added after the IOU report is generated
                iouReportID: null,
            };
            const iouReport1 = {
                ...LHNTestUtils.getFakeReport([7, 8]),
                type: CONST.REPORT.TYPE.IOU,
                ownerAccountID: 2,
                managerID: 2,
                hasOutstandingIOU: true,
                total: 10000,
                currency: 'USD',
                chatReportID: report3.reportID,
            };
            const iouReport2 = {
                ...LHNTestUtils.getFakeReport([9, 10]),
                type: CONST.REPORT.TYPE.IOU,
                ownerAccountID: 2,
                managerID: 2,
                hasOutstandingIOU: true,
                total: 10000,
                currency: 'USD',
                chatReportID: report3.reportID,
            };
            const iouReport3 = {
                ...LHNTestUtils.getFakeReport([11, 12]),
                type: CONST.REPORT.TYPE.IOU,
                ownerAccountID: 2,
                managerID: 2,
                hasOutstandingIOU: true,
                total: 10000,
                currency: 'USD',
                chatReportID: report3.reportID,
            };

            report1.iouReportID = iouReport1.reportID;
            report2.iouReportID = iouReport2.reportID;
            report3.iouReportID = iouReport3.reportID;

            const currentlyLoggedInUserAccountID = 13;
            LHNTestUtils.getDefaultRenderedSidebarLinks('0');
            return (
                waitForPromisesToResolve()
                    // When Onyx is updated with the data and the sidebar re-renders
                    .then(() =>
                        Onyx.multiSet({
                            [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.DEFAULT,
                            [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
                            [ONYXKEYS.SESSION]: {accountID: currentlyLoggedInUserAccountID},
                            [`${ONYXKEYS.COLLECTION.REPORT}${report1.reportID}`]: report1,
                            [`${ONYXKEYS.COLLECTION.REPORT}${report2.reportID}`]: report2,
                            [`${ONYXKEYS.COLLECTION.REPORT}${report3.reportID}`]: report3,
                            [`${ONYXKEYS.COLLECTION.REPORT}${iouReport1.reportID}`]: iouReport1,
                            [`${ONYXKEYS.COLLECTION.REPORT}${iouReport2.reportID}`]: iouReport2,
                            [`${ONYXKEYS.COLLECTION.REPORT}${iouReport3.reportID}`]: iouReport3,
                        }),
                    )

                    // Then the reports are ordered alphabetically since their amounts are the same
                    .then(() => {
                        const hintText = Localize.translateLocal('accessibilityHints.chatUserDisplayNames');
                        const displayNames = screen.queryAllByLabelText(hintText);
                        expect(displayNames).toHaveLength(5);
                        expect(lodashGet(displayNames, [0, 'props', 'children'])).toBe('Email Two owes $100.00');
                        expect(lodashGet(displayNames, [1, 'props', 'children'])).toBe('Email Two owes $100.00');
                        expect(lodashGet(displayNames, [2, 'props', 'children'])).toBe('Email Two owes $100.00');
                        expect(lodashGet(displayNames, [3, 'props', 'children'])).toBe('Five, Six');
                        expect(lodashGet(displayNames, [4, 'props', 'children'])).toBe('One, Two');
                    })
            );
        });

        it('orders nonArchived reports by displayName if created timestamps are the same', () => {
            // Given three nonArchived reports created at the same time
            const lastVisibleActionCreated = DateUtils.getDBTime();
            const report1 = {
                ...LHNTestUtils.getFakeReport([1, 2]),
                lastVisibleActionCreated,
            };
            const report2 = {
                ...LHNTestUtils.getFakeReport([3, 4]),
                lastVisibleActionCreated,
            };
            const report3 = {
                ...LHNTestUtils.getFakeReport([5, 6]),
                lastVisibleActionCreated,
            };

            LHNTestUtils.getDefaultRenderedSidebarLinks('0');
            return (
                waitForPromisesToResolve()
                    // When Onyx is updated with the data and the sidebar re-renders
                    .then(() =>
                        Onyx.multiSet({
                            [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.DEFAULT,
                            [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
                            [`${ONYXKEYS.COLLECTION.REPORT}${report1.reportID}`]: report1,
                            [`${ONYXKEYS.COLLECTION.REPORT}${report2.reportID}`]: report2,
                            [`${ONYXKEYS.COLLECTION.REPORT}${report3.reportID}`]: report3,
                        }),
                    )

                    // Then the reports are ordered alphabetically since their lastVisibleActionCreated are the same
                    .then(() => {
                        const hintText = Localize.translateLocal('accessibilityHints.chatUserDisplayNames');
                        const displayNames = screen.queryAllByLabelText(hintText);
                        expect(displayNames).toHaveLength(3);
                        expect(lodashGet(displayNames, [0, 'props', 'children'])).toBe('Five, Six');
                        expect(lodashGet(displayNames, [1, 'props', 'children'])).toBe('One, Two');
                        expect(lodashGet(displayNames, [2, 'props', 'children'])).toBe('Three, Four');
                    })
            );
        });
    });
});
