import {screen} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import DateUtils from '@libs/DateUtils';
import * as Localize from '@libs/Localize';
import CONST from '@src/CONST';
import type {Report} from '@src/types/onyx';
import type {ReportCollectionDataSet} from '@src/types/onyx/Report';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';
import wrapOnyxWithWaitForBatchedUpdates from '../utils/wrapOnyxWithWaitForBatchedUpdates';

// Be sure to include the mocked permissions library, as some components that are rendered
// during the test depend on its methods.
jest.mock('@libs/Permissions');

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
} as const;

// We need to fix this test as a follow up. There seems to be some problems with memory after filtering got more complicated.
xdescribe('Sidebar', () => {
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

    // clear out Onyx after each test so that each test starts with a clean slate
    afterEach(() => Onyx.clear());

    describe('in default (most recent) mode', () => {
        it('excludes a report with no participants', () => {
            LHNTestUtils.getDefaultRenderedSidebarLinks();

            // Given a report with no participants
            const report = LHNTestUtils.getFakeReport([]);

            const reportCollectionDataSet: ReportCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`]: report,
            };

            return (
                waitForBatchedUpdates()
                    // When Onyx is updated to contain that report
                    .then(() => Onyx.multiSet(reportCollectionDataSet))

                    // Then no reports are rendered in the LHN
                    .then(() => {
                        const hintText = Localize.translateLocal('accessibilityHints.navigatesToChat');
                        const optionRows = screen.queryAllByAccessibilityHint(hintText);
                        expect(optionRows).toHaveLength(0);
                    })
            );
        });

        it('excludes an empty chat report', () => {
            LHNTestUtils.getDefaultRenderedSidebarLinks();

            // Given a new report
            const report = LHNTestUtils.getFakeReport([1, 2], 0);

            const reportCollectionDataSet: ReportCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`]: report,
            };

            return (
                waitForBatchedUpdates()
                    // When Onyx is updated to contain that report
                    .then(() =>
                        Onyx.multiSet({
                            [ONYXKEYS.IS_LOADING_APP]: false,
                            ...reportCollectionDataSet,
                        }),
                    )

                    // Then no reports are rendered in the LHN
                    .then(() => {
                        const hintText = Localize.translateLocal('accessibilityHints.chatUserDisplayNames');
                        const displayNames = screen.queryAllByLabelText(hintText);
                        expect(displayNames).toHaveLength(0);
                    })
            );
        });

        it('includes an empty chat report if it has a draft', () => {
            LHNTestUtils.getDefaultRenderedSidebarLinks();

            // Given a new report with a draft text
            const report: Report = {
                ...LHNTestUtils.getFakeReport([1, 2], 0),
            };

            const reportCollectionDataSet: ReportCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`]: report,
            };

            return (
                waitForBatchedUpdates()
                    // When Onyx is updated to contain that report
                    .then(() =>
                        Onyx.multiSet({
                            [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
                            [ONYXKEYS.IS_LOADING_APP]: false,
                            [`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${report.reportID}`]: 'This is a draft message',
                            ...reportCollectionDataSet,
                        }),
                    )

                    // Then the report should be rendered in the LHN since it has a draft
                    .then(() => {
                        const hintText = Localize.translateLocal('accessibilityHints.chatUserDisplayNames');
                        const displayNames = screen.queryAllByLabelText(hintText);
                        expect(displayNames).toHaveLength(1);
                    })
            );
        });

        it('includes or excludes user created policy rooms depending on the beta', () => {
            LHNTestUtils.getDefaultRenderedSidebarLinks();

            // Given a user created policy room report
            // and the user not being in any betas
            const report: Report = {
                ...LHNTestUtils.getFakeReport(),
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
            };

            const reportCollectionDataSet: ReportCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`]: report,
            };

            return (
                waitForBatchedUpdates()
                    // When Onyx is updated to contain that data and the sidebar re-renders
                    .then(() =>
                        Onyx.multiSet({
                            [ONYXKEYS.BETAS]: [],
                            [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
                            [ONYXKEYS.IS_LOADING_APP]: false,
                            ...reportCollectionDataSet,
                        }),
                    )

                    // Then the report appears in the LHN
                    .then(() => {
                        const hintText = Localize.translateLocal('accessibilityHints.navigatesToChat');
                        const optionRows = screen.queryAllByAccessibilityHint(hintText);
                        expect(optionRows).toHaveLength(1);
                    })
            );
        });

        it('includes or excludes default policy rooms depending on the beta', () => {
            LHNTestUtils.getDefaultRenderedSidebarLinks();

            // Given three reports with the three different types of default policy rooms
            // and the user not being in any betas
            const report1: Report = {
                ...LHNTestUtils.getFakeReport(),
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_ADMINS,
            };
            const report2: Report = {
                ...LHNTestUtils.getFakeReport([3, 4]),
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_ANNOUNCE,
            };
            const report3: Report = {
                ...LHNTestUtils.getFakeReport([5, 6]),
                chatType: CONST.REPORT.CHAT_TYPE.DOMAIN_ALL,
            };

            const reportCollectionDataSet: ReportCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.REPORT}${report1.reportID}`]: report1,
                [`${ONYXKEYS.COLLECTION.REPORT}${report2.reportID}`]: report2,
                [`${ONYXKEYS.COLLECTION.REPORT}${report3.reportID}`]: report3,
            };

            return (
                waitForBatchedUpdates()
                    // When Onyx is updated to contain that data and the sidebar re-renders
                    .then(() =>
                        Onyx.multiSet({
                            [ONYXKEYS.BETAS]: [],
                            [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
                            [ONYXKEYS.IS_LOADING_APP]: false,
                            ...reportCollectionDataSet,
                        }),
                    )

                    // Then all non-domain rooms are rendered in the LHN
                    .then(() => {
                        const hintText = Localize.translateLocal('accessibilityHints.navigatesToChat');
                        const optionRows = screen.queryAllByAccessibilityHint(hintText);
                        expect(optionRows).toHaveLength(2);
                    })

                    // When the user is added to the default policy rooms beta and the sidebar re-renders
                    .then(() =>
                        Onyx.multiSet({
                            [ONYXKEYS.BETAS]: [CONST.BETAS.DEFAULT_ROOMS],
                        }),
                    )

                    // Then all three reports are showing in the LHN
                    .then(() => {
                        const hintText = Localize.translateLocal('accessibilityHints.navigatesToChat');
                        const optionRows = screen.queryAllByAccessibilityHint(hintText);
                        expect(optionRows).toHaveLength(3);
                    })
            );
        });

        it('includes default policy rooms for free policies, regardless of the beta', () => {
            LHNTestUtils.getDefaultRenderedSidebarLinks();

            // Given a default policy room report on a free policy
            // and the user not being in any betas
            const policy = {
                policyID: '1',
                type: CONST.POLICY.TYPE.TEAM,
            };
            const report: Report = {
                ...LHNTestUtils.getFakeReport(),
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_ADMINS,
                policyID: policy.policyID,
            };

            const reportCollectionDataSet: ReportCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`]: report,
            };

            return (
                waitForBatchedUpdates()
                    // When Onyx is updated to contain that data and the sidebar re-renders
                    .then(() =>
                        Onyx.multiSet({
                            [ONYXKEYS.BETAS]: [],
                            [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
                            [ONYXKEYS.IS_LOADING_APP]: false,
                            [`${ONYXKEYS.COLLECTION.POLICY}${policy.policyID}`]: policy,
                            ...reportCollectionDataSet,
                        }),
                    )

                    // Then the report is rendered in the LHN
                    .then(() => {
                        const hintText = Localize.translateLocal('accessibilityHints.navigatesToChat');
                        const optionRows = screen.queryAllByAccessibilityHint(hintText);
                        expect(optionRows).toHaveLength(1);
                    })

                    // When the policy is a paid policy
                    .then(() => Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.policyID}`, {type: CONST.POLICY.TYPE.CORPORATE}))

                    // Then the report is still rendered in the LHN
                    .then(() => {
                        const hintText = Localize.translateLocal('accessibilityHints.navigatesToChat');
                        const optionRows = screen.queryAllByAccessibilityHint(hintText);
                        expect(optionRows).toHaveLength(1);
                    })
            );
        });

        it('filter paycheck and bill report', () => {
            const report1: Report = {
                ...LHNTestUtils.getFakeReport(),
                type: CONST.REPORT.UNSUPPORTED_TYPE.PAYCHECK,
            };
            const report2: Report = {
                ...LHNTestUtils.getFakeReport(),
                type: CONST.REPORT.UNSUPPORTED_TYPE.BILL,
                errorFields: {
                    notFound: {
                        error: 'Report not found',
                    },
                },
            };
            const report3: Report = LHNTestUtils.getFakeReport();
            LHNTestUtils.getDefaultRenderedSidebarLinks(report1.reportID);
            const reportCollectionDataSet: ReportCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.REPORT}${report1.reportID}`]: report1,
                [`${ONYXKEYS.COLLECTION.REPORT}${report2.reportID}`]: report2,
                [`${ONYXKEYS.COLLECTION.REPORT}${report3.reportID}`]: report3,
            };
            return (
                waitForBatchedUpdates()
                    .then(() => Onyx.multiSet(reportCollectionDataSet))

                    // Then the reports 1 and 2 are hidden and 3 is not
                    .then(() => {
                        const hintText = Localize.translateLocal('accessibilityHints.navigatesToChat');
                        const optionRows = screen.queryAllByAccessibilityHint(hintText);
                        expect(optionRows).toHaveLength(1);
                    })
            );
        });

        // NOTE: This is also for #focus mode, should we move this test block?
        describe('all combinations of isArchived, isUserCreatedPolicyRoom, hasAddWorkspaceError, isUnread, isPinned, hasDraft', () => {
            // Given a report that is the active report and doesn't change
            const report1 = LHNTestUtils.getFakeReport([3, 4]);

            // Given a free policy that doesn't change
            const policy = {
                name: 'Policy One',
                policyID: '1',
                type: CONST.POLICY.TYPE.TEAM,
            };

            // Given the user is in all betas
            const betas = [CONST.BETAS.DEFAULT_ROOMS];

            // Given there are 6 boolean variables tested in the filtering logic:
            // 1. isArchived
            // 2. isUserCreatedPolicyRoom
            // 3. hasAddWorkspaceError
            // 4. isUnread
            // 5. isPinned
            // 6. hasDraft

            // Given these combinations of booleans which result in the report being filtered out (not shown).
            const booleansWhichRemovesActiveReport = [
                JSON.stringify([false, false, false, false, false, false]),
                JSON.stringify([false, true, false, false, false, false]),
                JSON.stringify([true, false, false, false, false, false]),
                JSON.stringify([true, true, false, false, false, false]),
            ];

            // When every single combination of those booleans is tested

            // Taken from https://stackoverflow.com/a/39734979/9114791 to generate all possible boolean combinations
            const AMOUNT_OF_VARIABLES = 6;
            // eslint-disable-next-line no-bitwise
            for (let i = 0; i < 1 << AMOUNT_OF_VARIABLES; i++) {
                const boolArr: boolean[] = [];
                for (let j = AMOUNT_OF_VARIABLES - 1; j >= 0; j--) {
                    // eslint-disable-next-line no-bitwise
                    boolArr.push(!!(i & (1 << j)));
                }

                // To test a failing set of conditions, comment out the for loop above and then use a hardcoded array
                // for the specific case that's failing. You can then debug the code to see why the test is not passing.
                // const boolArr = [false, false, false, false, false];

                it(`the booleans ${JSON.stringify(boolArr)}`, () => {
                    const [isArchived, isUserCreatedPolicyRoom, hasAddWorkspaceError, isUnread, isPinned] = boolArr;
                    const report2: Report = {
                        ...LHNTestUtils.getAdvancedFakeReport(isArchived, isUserCreatedPolicyRoom, hasAddWorkspaceError, isUnread, isPinned),
                        policyID: policy.policyID,
                    };
                    LHNTestUtils.getDefaultRenderedSidebarLinks(report1.reportID);

                    const reportCollectionDataSet: ReportCollectionDataSet = {
                        [`${ONYXKEYS.COLLECTION.REPORT}${report1.reportID}`]: report1,
                        [`${ONYXKEYS.COLLECTION.REPORT}${report2.reportID}`]: report2,
                    };

                    return (
                        waitForBatchedUpdates()
                            // When Onyx is updated to contain that data and the sidebar re-renders
                            .then(() =>
                                Onyx.multiSet({
                                    [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.GSD,
                                    [ONYXKEYS.BETAS]: betas,
                                    [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
                                    [ONYXKEYS.IS_LOADING_APP]: false,
                                    [`${ONYXKEYS.COLLECTION.POLICY}${policy.policyID}`]: policy,
                                    ...reportCollectionDataSet,
                                }),
                            )
                            // Then depending on the outcome, either one or two reports are visible
                            .then(() => {
                                if (booleansWhichRemovesActiveReport.indexOf(JSON.stringify(boolArr)) > -1) {
                                    // Only one report visible
                                    const displayNamesHintText = Localize.translateLocal('accessibilityHints.chatUserDisplayNames');
                                    const displayNames = screen.queryAllByLabelText(displayNamesHintText);
                                    const navigatesToChatHintText = Localize.translateLocal('accessibilityHints.navigatesToChat');
                                    expect(screen.queryAllByAccessibilityHint(navigatesToChatHintText)).toHaveLength(1);
                                    expect(displayNames).toHaveLength(1);
                                    expect(screen.getByText('One, Two')).toBeOnTheScreen();
                                } else {
                                    // Both reports visible
                                    const navigatesToChatHintText = Localize.translateLocal('accessibilityHints.navigatesToChat');
                                    expect(screen.queryAllByAccessibilityHint(navigatesToChatHintText)).toHaveLength(2);
                                }
                            })
                    );
                });
            }
        });
    });

    describe('in #focus mode', () => {
        it('hides unread chats', () => {
            // Given the sidebar is rendered in #focus mode (hides read chats)
            // with report 1 and 2 having unread actions
            const report1 = LHNTestUtils.getFakeReport([1, 2], 0, true);
            const report2 = LHNTestUtils.getFakeReport([3, 4], 0, true);
            const report3 = LHNTestUtils.getFakeReport([5, 6]);
            LHNTestUtils.getDefaultRenderedSidebarLinks(report1.reportID);

            const reportCollectionDataSet: ReportCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.REPORT}${report1.reportID}`]: report1,
                [`${ONYXKEYS.COLLECTION.REPORT}${report2.reportID}`]: report2,
                [`${ONYXKEYS.COLLECTION.REPORT}${report3.reportID}`]: report3,
            };

            return (
                waitForBatchedUpdates()
                    // When Onyx is updated to contain that data and the sidebar re-renders
                    .then(() =>
                        Onyx.multiSet({
                            [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.GSD,
                            [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
                            [ONYXKEYS.IS_LOADING_APP]: false,
                            ...reportCollectionDataSet,
                        }),
                    )

                    // Then the reports 1 and 2 are shown and 3 is not
                    .then(() => {
                        const hintText = Localize.translateLocal('accessibilityHints.chatUserDisplayNames');
                        const displayNames = screen.queryAllByLabelText(hintText);
                        expect(displayNames).toHaveLength(2);

                        expect(screen.getByText('One, Two')).toBeOnTheScreen();
                        expect(screen.getByText('Three, Four')).toBeOnTheScreen();
                    })

                    // When report3 becomes unread
                    .then(() => {
                        jest.advanceTimersByTime(10);
                        return Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report3.reportID}`, {lastVisibleActionCreated: DateUtils.getDBTime()});
                    })

                    // Then all three chats are showing
                    .then(() => {
                        const navigatesToChatHintText = Localize.translateLocal('accessibilityHints.navigatesToChat');
                        expect(screen.queryAllByAccessibilityHint(navigatesToChatHintText)).toHaveLength(3);
                    })

                    // When report 1 becomes read (it's the active report)
                    .then(() => Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report1.reportID}`, {lastReadTime: DateUtils.getDBTime()}))

                    // Then all three chats are still showing
                    .then(() => {
                        const navigatesToChatHintText = Localize.translateLocal('accessibilityHints.navigatesToChat');
                        expect(screen.queryAllByAccessibilityHint(navigatesToChatHintText)).toHaveLength(3);
                    })

                    // When report 2 becomes the active report
                    .then(() => {
                        LHNTestUtils.getDefaultRenderedSidebarLinks(report2.reportID);
                        return waitForBatchedUpdates();
                    })

                    // Then report 1 should now disappear
                    .then(() => {
                        const navigatesToChatHintText = Localize.translateLocal('accessibilityHints.navigatesToChat');
                        expect(screen.queryAllByAccessibilityHint(navigatesToChatHintText)).toHaveLength(2);
                        expect(screen.queryAllByText(/One, Two/)).toHaveLength(0);
                    })
            );
        });

        it('always shows pinned and draft chats', () => {
            // Given a draft report and a pinned report
            const draftReport = {
                ...LHNTestUtils.getFakeReport([1, 2]),
            };
            const pinnedReport = {
                ...LHNTestUtils.getFakeReport([3, 4]),
                isPinned: true,
            };
            LHNTestUtils.getDefaultRenderedSidebarLinks(draftReport.reportID);

            const reportCollectionDataSet: ReportCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.REPORT}${draftReport.reportID}`]: draftReport,
                [`${ONYXKEYS.COLLECTION.REPORT}${pinnedReport.reportID}`]: pinnedReport,
            };

            return (
                waitForBatchedUpdates()
                    // When Onyx is updated to contain that data and the sidebar re-renders
                    .then(() =>
                        Onyx.multiSet({
                            [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.GSD,
                            [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
                            [ONYXKEYS.IS_LOADING_APP]: false,
                            [`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${draftReport.reportID}`]: 'draft report message',
                            ...reportCollectionDataSet,
                        }),
                    )

                    // Then both reports are visible
                    .then(() => {
                        const hintText = Localize.translateLocal('accessibilityHints.chatUserDisplayNames');
                        const displayNames = screen.queryAllByLabelText(hintText);
                        expect(displayNames).toHaveLength(2);

                        expect(screen.getByText('One, Two')).toBeOnTheScreen();
                        expect(screen.getByText('Three, Four')).toBeOnTheScreen();
                    })
            );
        });

        it('archived rooms are displayed only when they have unread messages', () => {
            // Given an archived chat report, an archived default policy room, and an archived user created policy room
            const archivedReport: Report = {
                ...LHNTestUtils.getFakeReport([1, 2]),
                statusNum: CONST.REPORT.STATUS_NUM.CLOSED,
                stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            };
            const archivedPolicyRoomReport: Report = {
                ...LHNTestUtils.getFakeReport([1, 2]),
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_ANNOUNCE,
                statusNum: CONST.REPORT.STATUS_NUM.CLOSED,
                stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            };
            const archivedUserCreatedPolicyRoomReport: Report = {
                ...LHNTestUtils.getFakeReport([1, 2]),
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
                statusNum: CONST.REPORT.STATUS_NUM.CLOSED,
                stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            };
            LHNTestUtils.getDefaultRenderedSidebarLinks();

            const betas = [CONST.BETAS.DEFAULT_ROOMS];

            const reportCollectionDataSet: ReportCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.REPORT}${archivedReport.reportID}`]: archivedReport,
                [`${ONYXKEYS.COLLECTION.REPORT}${archivedPolicyRoomReport.reportID}`]: archivedPolicyRoomReport,
                [`${ONYXKEYS.COLLECTION.REPORT}${archivedUserCreatedPolicyRoomReport.reportID}`]: archivedUserCreatedPolicyRoomReport,
            };

            return (
                waitForBatchedUpdates()
                    // When Onyx is updated to contain that data and the sidebar re-renders
                    .then(() =>
                        Onyx.multiSet({
                            [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.GSD,
                            [ONYXKEYS.BETAS]: betas,
                            [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
                            [ONYXKEYS.IS_LOADING_APP]: false,
                            ...reportCollectionDataSet,
                        }),
                    )

                    // Then neither reports are visible
                    .then(() => {
                        const hintText = Localize.translateLocal('accessibilityHints.chatUserDisplayNames');
                        const displayNames = screen.queryAllByLabelText(hintText);
                        expect(displayNames).toHaveLength(0);
                    })

                    // When they have unread messages
                    .then(() => {
                        jest.advanceTimersByTime(10);
                        return Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${archivedReport.reportID}`, {
                            lastVisibleActionCreated: DateUtils.getDBTime(),
                        });
                    })
                    .then(() =>
                        Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${archivedPolicyRoomReport.reportID}`, {
                            lastVisibleActionCreated: DateUtils.getDBTime(),
                        }),
                    )
                    .then(() =>
                        Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${archivedUserCreatedPolicyRoomReport.reportID}`, {
                            lastVisibleActionCreated: DateUtils.getDBTime(),
                        }),
                    )

                    // Then they are all visible
                    .then(() => {
                        const hintText = Localize.translateLocal('accessibilityHints.chatUserDisplayNames');
                        const displayNames = screen.queryAllByLabelText(hintText);
                        expect(displayNames).toHaveLength(3);
                    })
            );
        });

        it('policy rooms are displayed only when they have unread messages', () => {
            // Given a default policy room and user created policy room
            const policyRoomReport: Report = {
                ...LHNTestUtils.getFakeReport([1, 2]),
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_ANNOUNCE,
            };
            const userCreatedPolicyRoomReport: Report = {
                ...LHNTestUtils.getFakeReport([1, 2]),
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
            };
            LHNTestUtils.getDefaultRenderedSidebarLinks();

            const betas = [CONST.BETAS.DEFAULT_ROOMS];

            const reportCollectionDataSet: ReportCollectionDataSet = {
                [`${ONYXKEYS.COLLECTION.REPORT}${policyRoomReport.reportID}`]: policyRoomReport,
                [`${ONYXKEYS.COLLECTION.REPORT}${userCreatedPolicyRoomReport.reportID}`]: userCreatedPolicyRoomReport,
            };

            return (
                waitForBatchedUpdates()
                    // When Onyx is updated to contain that data and the sidebar re-renders
                    .then(() =>
                        Onyx.multiSet({
                            [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.GSD,
                            [ONYXKEYS.BETAS]: betas,
                            [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
                            [ONYXKEYS.IS_LOADING_APP]: false,
                            ...reportCollectionDataSet,
                        }),
                    )

                    // Then neither reports are visible
                    .then(() => {
                        const hintText = Localize.translateLocal('accessibilityHints.chatUserDisplayNames');
                        const displayNames = screen.queryAllByLabelText(hintText);
                        expect(displayNames).toHaveLength(0);
                    })

                    // When they both have unread messages
                    .then(() => {
                        jest.advanceTimersByTime(10);
                        return Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${policyRoomReport.reportID}`, {
                            lastVisibleActionCreated: DateUtils.getDBTime(),
                        });
                    })
                    .then(() =>
                        Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${userCreatedPolicyRoomReport.reportID}`, {
                            lastVisibleActionCreated: DateUtils.getDBTime(),
                        }),
                    )

                    // Then both rooms are visible
                    .then(() => {
                        const hintText = Localize.translateLocal('accessibilityHints.chatUserDisplayNames');
                        const displayNames = screen.queryAllByLabelText(hintText);
                        expect(displayNames).toHaveLength(2);
                    })
            );
        });
    });

    describe('all combinations of isArchived, isUserCreatedPolicyRoom, hasAddWorkspaceError, isUnread, isPinned, hasDraft', () => {
        // Given a report that is the active report and doesn't change
        const report1 = LHNTestUtils.getFakeReport([3, 4]);

        // Given a free policy that doesn't change
        const policy = {
            name: 'Policy One',
            policyID: '1',
            type: CONST.POLICY.TYPE.TEAM,
        };

        // Given the user is in all betas
        const betas = [CONST.BETAS.DEFAULT_ROOMS];

        // Given there are 6 boolean variables tested in the filtering logic:
        // 1. isArchived
        // 2. isUserCreatedPolicyRoom
        // 3. hasAddWorkspaceError
        // 4. isUnread
        // 5. isPinned
        // 6. hasDraft

        // Given these combinations of booleans which result in the report being filtered out (not shown).
        const booleansWhichRemovesActiveReport = [
            JSON.stringify([false, false, false, false, false, false]),
            JSON.stringify([false, true, false, false, false, false]),
            JSON.stringify([true, false, false, false, false, false]),
            JSON.stringify([true, true, false, false, false, false]),
        ];

        // When every single combination of those booleans is tested

        // Taken from https://stackoverflow.com/a/39734979/9114791 to generate all possible boolean combinations
        const AMOUNT_OF_VARIABLES = 6;
        // eslint-disable-next-line no-bitwise
        for (let i = 0; i < 1 << AMOUNT_OF_VARIABLES; i++) {
            const boolArr: boolean[] = [];
            for (let j = AMOUNT_OF_VARIABLES - 1; j >= 0; j--) {
                // eslint-disable-next-line no-bitwise
                boolArr.push(!!(i & (1 << j)));
            }

            // To test a failing set of conditions, comment out the for loop above and then use a hardcoded array
            // for the specific case that's failing. You can then debug the code to see why the test is not passing.
            // const boolArr = [false, false, false, true, false, false, false];

            it(`the booleans ${JSON.stringify(boolArr)}`, () => {
                const [isArchived, isUserCreatedPolicyRoom, hasAddWorkspaceError, isUnread, isPinned, hasDraft] = boolArr;
                const report2 = {
                    ...LHNTestUtils.getAdvancedFakeReport(isArchived, isUserCreatedPolicyRoom, hasAddWorkspaceError, isUnread, isPinned),
                    policyID: policy.policyID,
                };
                LHNTestUtils.getDefaultRenderedSidebarLinks(report1.reportID);

                const reportCollectionDataSet: ReportCollectionDataSet = {
                    [`${ONYXKEYS.COLLECTION.REPORT}${report1.reportID}`]: report1,
                    [`${ONYXKEYS.COLLECTION.REPORT}${report2.reportID}`]: report2,
                };

                return (
                    waitForBatchedUpdates()
                        // When Onyx is updated to contain that data and the sidebar re-renders
                        .then(() =>
                            Onyx.multiSet({
                                [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.GSD,
                                [ONYXKEYS.BETAS]: betas,
                                [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
                                [ONYXKEYS.IS_LOADING_APP]: false,
                                [`${ONYXKEYS.COLLECTION.POLICY}${policy.policyID}`]: policy,
                                [`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${report2.reportID}`]: hasDraft ? 'report2 draft' : null,
                                ...reportCollectionDataSet,
                            }),
                        )

                        // Then depending on the outcome, either one or two reports are visible
                        .then(() => {
                            if (booleansWhichRemovesActiveReport.indexOf(JSON.stringify(boolArr)) > -1) {
                                // Only one report visible
                                const displayNamesHintText = Localize.translateLocal('accessibilityHints.chatUserDisplayNames');
                                const displayNames = screen.queryAllByLabelText(displayNamesHintText);
                                const navigatesToChatHintText = Localize.translateLocal('accessibilityHints.navigatesToChat');
                                expect(screen.queryAllByAccessibilityHint(navigatesToChatHintText)).toHaveLength(1);
                                expect(displayNames).toHaveLength(1);
                                expect(screen.getByText('One, Two')).toBeOnTheScreen();
                            } else {
                                // Both reports visible
                                const navigatesToChatHintText = Localize.translateLocal('accessibilityHints.navigatesToChat');
                                expect(screen.queryAllByAccessibilityHint(navigatesToChatHintText)).toHaveLength(2);
                            }
                        })
                );
            });
        }
    });

    describe('Archived chat', () => {
        describe('in default (most recent) mode', () => {
            it('is shown regardless if it has comments or not', () => {
                LHNTestUtils.getDefaultRenderedSidebarLinks();

                // Given an archived report with no comments
                const report: Report = {
                    ...LHNTestUtils.getFakeReport(),
                    lastVisibleActionCreated: '2022-11-22 03:48:27.267',
                    statusNum: CONST.REPORT.STATUS_NUM.CLOSED,
                    stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                };

                // Given the user is in all betas
                const betas = [CONST.BETAS.DEFAULT_ROOMS];

                const reportCollectionDataSet: ReportCollectionDataSet = {
                    [`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`]: report,
                };

                return (
                    waitForBatchedUpdates()
                        // When Onyx is updated to contain that data and the sidebar re-renders
                        .then(() =>
                            Onyx.multiSet({
                                [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.DEFAULT,
                                [ONYXKEYS.BETAS]: betas,
                                [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
                                [ONYXKEYS.IS_LOADING_APP]: false,
                                ...reportCollectionDataSet,
                            }),
                        )

                        // Then the report is rendered in the LHN
                        .then(() => {
                            const hintText = Localize.translateLocal('accessibilityHints.navigatesToChat');
                            const optionRows = screen.queryAllByAccessibilityHint(hintText);
                            expect(optionRows).toHaveLength(1);
                        })

                        // When the report has comments
                        .then(() =>
                            Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, {
                                lastVisibleActionCreated: DateUtils.getDBTime(),
                            }),
                        )

                        // Then the report is rendered in the LHN
                        .then(() => {
                            const hintText = Localize.translateLocal('accessibilityHints.navigatesToChat');
                            const optionRows = screen.queryAllByAccessibilityHint(hintText);
                            expect(optionRows).toHaveLength(1);
                        })
                );
            });
        });

        describe('in GSD (focus) mode', () => {
            it('is shown when it is unread', () => {
                LHNTestUtils.getDefaultRenderedSidebarLinks();

                // Given an archived report that has all comments read
                const report: Report = {
                    ...LHNTestUtils.getFakeReport(),
                    statusNum: CONST.REPORT.STATUS_NUM.CLOSED,
                    stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                };

                // Given the user is in all betas
                const betas = [CONST.BETAS.DEFAULT_ROOMS];

                const reportCollectionDataSet: ReportCollectionDataSet = {
                    [`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`]: report,
                };

                return (
                    waitForBatchedUpdates()
                        // When Onyx is updated to contain that data and the sidebar re-renders
                        .then(() =>
                            Onyx.multiSet({
                                [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.GSD,
                                [ONYXKEYS.BETAS]: betas,
                                [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
                                [ONYXKEYS.IS_LOADING_APP]: false,
                                ...reportCollectionDataSet,
                            }),
                        )

                        // Then the report is not rendered in the LHN
                        .then(() => {
                            const hintText = Localize.translateLocal('accessibilityHints.navigatesToChat');
                            const optionRows = screen.queryAllByAccessibilityHint(hintText);
                            expect(optionRows).toHaveLength(0);
                        })

                        // When the report has a new comment and is now unread
                        .then(() => {
                            jest.advanceTimersByTime(10);
                            return Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, {lastVisibleActionCreated: DateUtils.getDBTime()});
                        })

                        // Then the report is rendered in the LHN
                        .then(() => {
                            const hintText = Localize.translateLocal('accessibilityHints.navigatesToChat');
                            const optionRows = screen.queryAllByAccessibilityHint(hintText);
                            expect(optionRows).toHaveLength(1);
                        })
                );
            });

            it('is shown when it is pinned', () => {
                LHNTestUtils.getDefaultRenderedSidebarLinks();

                // Given an archived report that is not pinned
                const report: Report = {
                    ...LHNTestUtils.getFakeReport(),
                    isPinned: false,
                    statusNum: CONST.REPORT.STATUS_NUM.CLOSED,
                    stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                };

                // Given the user is in all betas
                const betas = [CONST.BETAS.DEFAULT_ROOMS];

                const reportCollectionDataSet: ReportCollectionDataSet = {
                    [`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`]: report,
                };

                return (
                    waitForBatchedUpdates()
                        // When Onyx is updated to contain that data and the sidebar re-renders
                        .then(() =>
                            Onyx.multiSet({
                                [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.GSD,
                                [ONYXKEYS.BETAS]: betas,
                                [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
                                [ONYXKEYS.IS_LOADING_APP]: false,
                                ...reportCollectionDataSet,
                            }),
                        )

                        // Then the report is not rendered in the LHN
                        .then(() => {
                            const hintText = Localize.translateLocal('accessibilityHints.navigatesToChat');
                            const optionRows = screen.queryAllByAccessibilityHint(hintText);
                            expect(optionRows).toHaveLength(0);
                        })

                        // When the report is pinned
                        .then(() => Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, {isPinned: true}))

                        // Then the report is rendered in the LHN
                        .then(() => {
                            const hintText = Localize.translateLocal('accessibilityHints.navigatesToChat');
                            const optionRows = screen.queryAllByAccessibilityHint(hintText);
                            expect(optionRows).toHaveLength(1);
                        })
                );
            });

            it('is shown when it is the active report', () => {
                LHNTestUtils.getDefaultRenderedSidebarLinks();

                // Given an archived report that is not the active report
                const report: Report = {
                    ...LHNTestUtils.getFakeReport(),
                    statusNum: CONST.REPORT.STATUS_NUM.CLOSED,
                    stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                };

                // Given the user is in all betas
                const betas = [CONST.BETAS.DEFAULT_ROOMS];

                const reportCollectionDataSet: ReportCollectionDataSet = {
                    [`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`]: report,
                };

                return (
                    waitForBatchedUpdates()
                        // When Onyx is updated to contain that data and the sidebar re-renders
                        .then(() =>
                            Onyx.multiSet({
                                [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.GSD,
                                [ONYXKEYS.BETAS]: betas,
                                [ONYXKEYS.PERSONAL_DETAILS_LIST]: LHNTestUtils.fakePersonalDetails,
                                [ONYXKEYS.IS_LOADING_APP]: false,
                                ...reportCollectionDataSet,
                            }),
                        )

                        // Then the report is not rendered in the LHN
                        .then(() => {
                            const hintText = Localize.translateLocal('accessibilityHints.navigatesToChat');
                            const optionRows = screen.queryAllByAccessibilityHint(hintText);
                            expect(optionRows).toHaveLength(0);
                        })

                        // When sidebar is rendered with the active report ID matching the archived report in Onyx
                        .then(() => {
                            LHNTestUtils.getDefaultRenderedSidebarLinks(report.reportID);
                            return waitForBatchedUpdates();
                        })

                        // Then the report is rendered in the LHN
                        .then(() => {
                            const hintText = Localize.translateLocal('accessibilityHints.navigatesToChat');
                            const optionRows = screen.queryAllByAccessibilityHint(hintText);
                            expect(optionRows).toHaveLength(1);
                        })
                );
            });
        });
    });
});
