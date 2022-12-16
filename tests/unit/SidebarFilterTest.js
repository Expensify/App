import {cleanup, screen} from '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import lodashGet from 'lodash/get';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import waitForPromisesToResolve from '../utils/waitForPromisesToResolve';
import CONST from '../../src/CONST';
import DateUtils from '../../src/libs/DateUtils';

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
        POLICY: 'policy_',
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

    // Cleanup (ie. unmount) all rendered components and clear out Onyx after each test so that each test starts with a clean slate
    afterEach(() => {
        cleanup();
        Onyx.clear();
    });

    describe('in default (most recent) mode', () => {
        it('excludes a report with no participants', () => {
            LHNTestUtils.getDefaultRenderedSidebarLinks();

            // Given a report with no participants
            const report = LHNTestUtils.getFakeReport([]);

            return waitForPromisesToResolve()

                // When Onyx is updated to contain that report
                .then(() => Onyx.multiSet({
                    [`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`]: report,
                }))

                // Then no reports are rendered in the LHN
                .then(() => {
                    const optionRows = screen.queryAllByAccessibilityHint('Navigates to a chat');
                    expect(optionRows).toHaveLength(0);
                });
        });

        it('includes or excludes policy expense chats depending on the beta', () => {
            LHNTestUtils.getDefaultRenderedSidebarLinks();

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
                    const optionRows = screen.queryAllByAccessibilityHint('Navigates to a chat');
                    expect(optionRows).toHaveLength(0);
                })

                // When the user is added to the policy expense beta and the sidebar re-renders
                .then(() => Onyx.multiSet({
                    [ONYXKEYS.BETAS]: [CONST.BETAS.POLICY_EXPENSE_CHAT],
                }))

                // Then there is one report rendered in the LHN
                .then(() => {
                    const optionRows = screen.queryAllByAccessibilityHint('Navigates to a chat');
                    expect(optionRows).toHaveLength(1);
                });
        });

        it('includes or excludes user created policy rooms depending on the beta', () => {
            LHNTestUtils.getDefaultRenderedSidebarLinks();

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
                    const optionRows = screen.queryAllByAccessibilityHint('Navigates to a chat');
                    expect(optionRows).toHaveLength(0);
                })

                // When the user is added to the policy rooms beta and the sidebar re-renders
                .then(() => Onyx.multiSet({
                    [ONYXKEYS.BETAS]: [CONST.BETAS.POLICY_ROOMS],
                }))

                // Then there is one report rendered in the LHN
                .then(() => {
                    const optionRows = screen.queryAllByAccessibilityHint('Navigates to a chat');
                    expect(optionRows).toHaveLength(1);
                });
        });

        it('includes or excludes default policy rooms depending on the beta', () => {
            LHNTestUtils.getDefaultRenderedSidebarLinks();

            // Given three reports with the three different types of default policy rooms
            // and the user not being in any betas
            const report1 = {
                ...LHNTestUtils.getFakeReport(),
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_ADMINS,
            };
            const report2 = {
                ...LHNTestUtils.getFakeReport(['email3@test.com', 'email4@test.com']),
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_ANNOUNCE,
            };
            const report3 = {
                ...LHNTestUtils.getFakeReport(['email5@test.com', 'email6@test.com']),
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
                    const optionRows = screen.queryAllByAccessibilityHint('Navigates to a chat');
                    expect(optionRows).toHaveLength(0);
                })

                // When the user is added to the default policy rooms beta and the sidebar re-renders
                .then(() => Onyx.multiSet({
                    [ONYXKEYS.BETAS]: [CONST.BETAS.DEFAULT_ROOMS],
                }))

                // Then all three reports are showing in the LHN
                .then(() => {
                    const optionRows = screen.queryAllByAccessibilityHint('Navigates to a chat');
                    expect(optionRows).toHaveLength(3);
                });
        });

        it('includes default policy rooms for free policies, regardless of the beta', () => {
            LHNTestUtils.getDefaultRenderedSidebarLinks();

            // Given a default policy room report on a free policy
            // and the user not being in any betas
            const policy = {
                policyID: '1',
                type: CONST.POLICY.TYPE.FREE,
            };
            const report = {
                ...LHNTestUtils.getFakeReport(),
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_ADMINS,
                policyID: policy.policyID,
            };

            return waitForPromisesToResolve()

                // When Onyx is updated to contain that data and the sidebar re-renders
                .then(() => Onyx.multiSet({
                    [ONYXKEYS.BETAS]: [],
                    [ONYXKEYS.PERSONAL_DETAILS]: LHNTestUtils.fakePersonalDetails,
                    [`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`]: report,
                    [`${ONYXKEYS.COLLECTION.POLICY}${policy.policyID}`]: policy,
                }))

                // Then the report is rendered in the LHN
                .then(() => {
                    const optionRows = screen.queryAllByAccessibilityHint('Navigates to a chat');
                    expect(optionRows).toHaveLength(1);
                })

                // When the policy is a paid policy
                .then(() => Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy.policyID}`, {type: CONST.POLICY.TYPE.CORPORATE}))

                // Then the report is not rendered in the LHN
                .then(() => {
                    const optionRows = screen.queryAllByAccessibilityHint('Navigates to a chat');
                    expect(optionRows).toHaveLength(0);
                });
        });

        describe('all combinations of isArchived, isUserCreatedPolicyRoom, hasAddWorkspaceError, isUnread, isPinned, hasDraft', () => {
            // Given a report that is the active report and doesn't change
            const report1 = LHNTestUtils.getFakeReport(['email3@test.com', 'email4@test.com']);

            // Given a free policy that doesn't change
            const policy = {
                name: 'Policy One',
                policyID: '1',
                type: CONST.POLICY.TYPE.FREE,
            };

            // Given the user is in all betas
            const betas = [
                CONST.BETAS.DEFAULT_ROOMS,
                CONST.BETAS.POLICY_ROOMS,
                CONST.BETAS.POLICY_EXPENSE_CHAT,
            ];

            // Given there are 6 boolean variables tested in the filtering logic:
            // 1. isArchived
            // 2. isUserCreatedPolicyRoom
            // 3. hasAddWorkspaceError
            // 4. isUnread
            // 5. isPinned
            // 6. hasDraft
            // There is one setting not represented here, which is hasOutstandingIOU. In order to test that setting, there must be
            // additional reports in Onyx, so it's being left out for now. It's identical to the logic for hasDraft and isPinned though.

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
            for (let i = 0; i < (1 << AMOUNT_OF_VARIABLES); i++) {
                const boolArr = [];
                for (let j = AMOUNT_OF_VARIABLES - 1; j >= 0; j--) {
                    // eslint-disable-next-line no-bitwise
                    boolArr.push(Boolean(i & (1 << j)));
                }

                // To test a failing set of conditions, comment out the for loop above and then use a hardcoded array
                // for the specific case that's failing. You can then debug the code to see why the test is not passing.
                // const boolArr = [false, false, true, false, false, false];

                it(`the booleans ${JSON.stringify(boolArr)}`, () => {
                    const report2 = {
                        ...LHNTestUtils.getAdvancedFakeReport(...boolArr),
                        policyID: policy.policyID,
                    };
                    LHNTestUtils.getDefaultRenderedSidebarLinks(report1.reportID);

                    return waitForPromisesToResolve()

                        // When Onyx is updated to contain that data and the sidebar re-renders
                        .then(() => Onyx.multiSet({
                            [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.GSD,
                            [ONYXKEYS.BETAS]: betas,
                            [ONYXKEYS.PERSONAL_DETAILS]: LHNTestUtils.fakePersonalDetails,
                            [`${ONYXKEYS.COLLECTION.REPORT}${report1.reportID}`]: report1,
                            [`${ONYXKEYS.COLLECTION.REPORT}${report2.reportID}`]: report2,
                            [`${ONYXKEYS.COLLECTION.POLICY}${policy.policyID}`]: policy,
                        }))

                        // Then depending on the outcome, either one or two reports are visible
                        .then(() => {
                            if (booleansWhichRemovesActiveReport.indexOf(JSON.stringify(boolArr)) > -1) {
                                // Only one report visible
                                expect(screen.queryAllByAccessibilityHint('Navigates to a chat')).toHaveLength(1);
                                expect(screen.queryAllByLabelText('Chat user display names')).toHaveLength(1);
                                const displayNames = screen.queryAllByLabelText('Chat user display names');
                                expect(lodashGet(displayNames, [0, 'props', 'children'])).toBe('Three, Four');
                            } else {
                                // Both reports visible
                                expect(screen.queryAllByAccessibilityHint('Navigates to a chat')).toHaveLength(2);
                            }
                        });
                });
            }
        });
    });

    describe('in #focus mode', () => {
        it('hides unread chats', () => {
            // Given the sidebar is rendered in #focus mode (hides read chats)
            // with report 1 and 2 having unread actions
            const report1 = {
                ...LHNTestUtils.getFakeReport(['email1@test.com', 'email2@test.com']),
                lastReadSequenceNumber: LHNTestUtils.TEST_MAX_SEQUENCE_NUMBER - 1,
            };
            const report2 = {
                ...LHNTestUtils.getFakeReport(['email3@test.com', 'email4@test.com']),
                lastReadSequenceNumber: LHNTestUtils.TEST_MAX_SEQUENCE_NUMBER - 1,
            };
            const report3 = LHNTestUtils.getFakeReport(['email5@test.com', 'email6@test.com']);
            LHNTestUtils.getDefaultRenderedSidebarLinks(report1.reportID);

            return waitForPromisesToResolve()

                // When Onyx is updated to contain that data and the sidebar re-renders
                .then(() => Onyx.multiSet({
                    [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.GSD,
                    [ONYXKEYS.PERSONAL_DETAILS]: LHNTestUtils.fakePersonalDetails,
                    [`${ONYXKEYS.COLLECTION.REPORT}${report1.reportID}`]: report1,
                    [`${ONYXKEYS.COLLECTION.REPORT}${report2.reportID}`]: report2,
                    [`${ONYXKEYS.COLLECTION.REPORT}${report3.reportID}`]: report3,
                }))

                // Then the reports 1 and 2 are shown and 3 is not
                .then(() => {
                    const displayNames = screen.queryAllByLabelText('Chat user display names');
                    expect(displayNames).toHaveLength(2);
                    expect(lodashGet(displayNames, [0, 'props', 'children'])).toBe('One, Two');
                    expect(lodashGet(displayNames, [1, 'props', 'children'])).toBe('Three, Four');
                })

                // When report3 becomes unread
                .then(() => Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report3.reportID}`, {lastReadSequenceNumber: LHNTestUtils.TEST_MAX_SEQUENCE_NUMBER - 1}))

                // Then all three chats are showing
                .then(() => {
                    expect(screen.queryAllByAccessibilityHint('Navigates to a chat')).toHaveLength(3);
                })

                // When report 1 becomes read (it's the active report)
                .then(() => Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report1.reportID}`, {lastReadSequenceNumber: LHNTestUtils.TEST_MAX_SEQUENCE_NUMBER}))

                // Then all three chats are still showing
                .then(() => {
                    expect(screen.queryAllByAccessibilityHint('Navigates to a chat')).toHaveLength(3);
                })

                // When report 2 becomes the active report
                .then(() => {
                    LHNTestUtils.getDefaultRenderedSidebarLinks(report2.reportID);
                    return waitForPromisesToResolve();
                })

                // Then report 1 should now disappear
                .then(() => {
                    expect(screen.queryAllByAccessibilityHint('Navigates to a chat')).toHaveLength(2);
                    expect(screen.queryAllByText(/One, Two/)).toHaveLength(0);
                });
        });

        it('always shows pinned and draft chats', () => {
            // Given a draft report and a pinned report
            const draftReport = {
                ...LHNTestUtils.getFakeReport(['email1@test.com', 'email2@test.com']),
                hasDraft: true,
            };
            const pinnedReport = {
                ...LHNTestUtils.getFakeReport(['email3@test.com', 'email4@test.com']),
                isPinned: true,
            };
            LHNTestUtils.getDefaultRenderedSidebarLinks(draftReport.reportID);

            return waitForPromisesToResolve()

                // When Onyx is updated to contain that data and the sidebar re-renders
                .then(() => Onyx.multiSet({
                    [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.GSD,
                    [ONYXKEYS.PERSONAL_DETAILS]: LHNTestUtils.fakePersonalDetails,
                    [`${ONYXKEYS.COLLECTION.REPORT}${draftReport.reportID}`]: draftReport,
                    [`${ONYXKEYS.COLLECTION.REPORT}${pinnedReport.reportID}`]: pinnedReport,
                }))

                // Then both reports are visible
                .then(() => {
                    const displayNames = screen.queryAllByLabelText('Chat user display names');
                    expect(displayNames).toHaveLength(2);
                    expect(lodashGet(displayNames, [0, 'props', 'children'])).toBe('Three, Four');
                    expect(lodashGet(displayNames, [1, 'props', 'children'])).toBe('One, Two');
                });
        });

        it('archived rooms are displayed only when they have unread messages', () => {
            // Given an archived chat report, an archived default policy room, and an archived user created policy room
            const archivedReport = {
                ...LHNTestUtils.getFakeReport(['email1@test.com', 'email2@test.com']),
                statusNum: CONST.REPORT.STATUS.CLOSED,
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            };
            const archivedPolicyRoomReport = {
                ...LHNTestUtils.getFakeReport(['email1@test.com', 'email2@test.com']),
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_ANNOUNCE,
                statusNum: CONST.REPORT.STATUS.CLOSED,
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            };
            const archivedUserCreatedPolicyRoomReport = {
                ...LHNTestUtils.getFakeReport(['email1@test.com', 'email2@test.com']),
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
                statusNum: CONST.REPORT.STATUS.CLOSED,
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            };
            LHNTestUtils.getDefaultRenderedSidebarLinks();

            return waitForPromisesToResolve()

                // When Onyx is updated to contain that data and the sidebar re-renders
                .then(() => Onyx.multiSet({
                    [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.GSD,
                    [ONYXKEYS.PERSONAL_DETAILS]: LHNTestUtils.fakePersonalDetails,
                    [`${ONYXKEYS.COLLECTION.REPORT}${archivedReport.reportID}`]: archivedReport,
                    [`${ONYXKEYS.COLLECTION.REPORT}${archivedPolicyRoomReport.reportID}`]: archivedPolicyRoomReport,
                    [`${ONYXKEYS.COLLECTION.REPORT}${archivedUserCreatedPolicyRoomReport.reportID}`]: archivedUserCreatedPolicyRoomReport,
                }))

                // Then neither reports are visible
                .then(() => {
                    const displayNames = screen.queryAllByLabelText('Chat user display names');
                    expect(displayNames).toHaveLength(0);
                })

                // When they have unread messages
                .then(() => Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${archivedReport.reportID}`, {
                    lastReadSequenceNumber: LHNTestUtils.TEST_MAX_SEQUENCE_NUMBER - 1,
                }))
                .then(() => Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${archivedPolicyRoomReport.reportID}`, {
                    lastReadSequenceNumber: LHNTestUtils.TEST_MAX_SEQUENCE_NUMBER - 1,
                }))
                .then(() => Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${archivedUserCreatedPolicyRoomReport.reportID}`, {
                    lastReadSequenceNumber: LHNTestUtils.TEST_MAX_SEQUENCE_NUMBER - 1,
                }))

                // Then they are all visible
                .then(() => {
                    const displayNames = screen.queryAllByLabelText('Chat user display names');
                    expect(displayNames).toHaveLength(3);
                });
        });

        it('policy rooms are displayed only when they have unread messages', () => {
            // Given a default policy room and user created policy room
            const policyRoomReport = {
                ...LHNTestUtils.getFakeReport(['email1@test.com', 'email2@test.com']),
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_ANNOUNCE,
            };
            const userCreatedPolicyRoomReport = {
                ...LHNTestUtils.getFakeReport(['email1@test.com', 'email2@test.com']),
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
            };
            LHNTestUtils.getDefaultRenderedSidebarLinks();

            return waitForPromisesToResolve()

                // When Onyx is updated to contain that data and the sidebar re-renders
                .then(() => Onyx.multiSet({
                    [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.GSD,
                    [ONYXKEYS.PERSONAL_DETAILS]: LHNTestUtils.fakePersonalDetails,
                    [`${ONYXKEYS.COLLECTION.REPORT}${policyRoomReport.reportID}`]: policyRoomReport,
                    [`${ONYXKEYS.COLLECTION.REPORT}${userCreatedPolicyRoomReport.reportID}`]: userCreatedPolicyRoomReport,
                }))

                // Then neither reports are visible
                .then(() => {
                    const displayNames = screen.queryAllByLabelText('Chat user display names');
                    expect(displayNames).toHaveLength(0);
                })

                // When they both have unread messages
                .then(() => Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${policyRoomReport.reportID}`, {
                    lastReadSequenceNumber: LHNTestUtils.TEST_MAX_SEQUENCE_NUMBER - 1,
                }))
                .then(() => Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${userCreatedPolicyRoomReport.reportID}`, {
                    lastReadSequenceNumber: LHNTestUtils.TEST_MAX_SEQUENCE_NUMBER - 1,
                }))

                // Then both rooms are visible
                .then(() => {
                    const displayNames = screen.queryAllByLabelText('Chat user display names');
                    expect(displayNames).toHaveLength(2);
                });
        });
    });

    describe('all combinations of isArchived, isUserCreatedPolicyRoom, hasAddWorkspaceError, isUnread, isPinned, hasDraft', () => {
        // Given a report that is the active report and doesn't change
        const report1 = LHNTestUtils.getFakeReport(['email3@test.com', 'email4@test.com']);

        // Given a free policy that doesn't change
        const policy = {
            name: 'Policy One',
            policyID: '1',
            type: CONST.POLICY.TYPE.FREE,
        };

        // Given the user is in all betas
        const betas = [
            CONST.BETAS.DEFAULT_ROOMS,
            CONST.BETAS.POLICY_ROOMS,
            CONST.BETAS.POLICY_EXPENSE_CHAT,
        ];

        // Given there are 6 boolean variables tested in the filtering logic:
        // 1. isArchived
        // 2. isUserCreatedPolicyRoom
        // 3. hasAddWorkspaceError
        // 4. isUnread
        // 5. isPinned
        // 6. hasDraft
        // There is one setting not represented here, which is hasOutstandingIOU. In order to test that setting, there must be
        // additional reports in Onyx, so it's being left out for now. It's identical to the logic for hasDraft and isPinned though.

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
        for (let i = 0; i < (1 << AMOUNT_OF_VARIABLES); i++) {
            const boolArr = [];
            for (let j = AMOUNT_OF_VARIABLES - 1; j >= 0; j--) {
                // eslint-disable-next-line no-bitwise
                boolArr.push(Boolean(i & (1 << j)));
            }

            // To test a failing set of conditions, comment out the for loop above and then use a hardcoded array
            // for the specific case that's failing. You can then debug the code to see why the test is not passing.
            // const boolArr = [false, false, false, true, false, false, false];

            it(`the booleans ${JSON.stringify(boolArr)}`, () => {
                const report2 = {
                    ...LHNTestUtils.getAdvancedFakeReport(...boolArr),
                    policyID: policy.policyID,
                };
                LHNTestUtils.getDefaultRenderedSidebarLinks(report1.reportID);

                return waitForPromisesToResolve()

                    // When Onyx is updated to contain that data and the sidebar re-renders
                    .then(() => Onyx.multiSet({
                        [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.GSD,
                        [ONYXKEYS.BETAS]: betas,
                        [ONYXKEYS.PERSONAL_DETAILS]: LHNTestUtils.fakePersonalDetails,
                        [`${ONYXKEYS.COLLECTION.REPORT}${report1.reportID}`]: report1,
                        [`${ONYXKEYS.COLLECTION.REPORT}${report2.reportID}`]: report2,
                        [`${ONYXKEYS.COLLECTION.POLICY}${policy.policyID}`]: policy,
                    }))

                    // Then depending on the outcome, either one or two reports are visible
                    .then(() => {
                        if (booleansWhichRemovesActiveReport.indexOf(JSON.stringify(boolArr)) > -1) {
                            // Only one report visible
                            expect(screen.queryAllByAccessibilityHint('Navigates to a chat')).toHaveLength(1);
                            expect(screen.queryAllByLabelText('Chat user display names')).toHaveLength(1);
                            const displayNames = screen.queryAllByLabelText('Chat user display names');
                            expect(lodashGet(displayNames, [0, 'props', 'children'])).toBe('Three, Four');
                        } else {
                            // Both reports visible
                            expect(screen.queryAllByAccessibilityHint('Navigates to a chat')).toHaveLength(2);
                        }
                    });
            });
        }
    });

    describe('Archived chat', () => {
        describe('in default (most recent) mode', () => {
            it('is shown regardless if it has comments or not', () => {
                LHNTestUtils.getDefaultRenderedSidebarLinks();

                // Given an archived report with no comments
                const report = {
                    ...LHNTestUtils.getFakeReport(),
                    lastActionCreated: '2022-11-22 03:48:27.267',
                    statusNum: CONST.REPORT.STATUS.CLOSED,
                    stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                };

                // Given the user is in all betas
                const betas = [
                    CONST.BETAS.DEFAULT_ROOMS,
                    CONST.BETAS.POLICY_ROOMS,
                    CONST.BETAS.POLICY_EXPENSE_CHAT,
                ];

                return waitForPromisesToResolve()

                    // When Onyx is updated to contain that data and the sidebar re-renders
                    .then(() => Onyx.multiSet({
                        [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.DEFAULT,
                        [ONYXKEYS.BETAS]: betas,
                        [ONYXKEYS.PERSONAL_DETAILS]: LHNTestUtils.fakePersonalDetails,
                        [`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`]: report,
                    }))

                    // Then the report is rendered in the LHN
                    .then(() => {
                        const optionRows = screen.queryAllByAccessibilityHint('Navigates to a chat');
                        expect(optionRows).toHaveLength(1);
                    })

                    // When the report has comments
                    .then(() => Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, {
                        lastActionCreated: DateUtils.getDBTime(),
                    }))

                    // Then the report is rendered in the LHN
                    .then(() => {
                        const optionRows = screen.queryAllByAccessibilityHint('Navigates to a chat');
                        expect(optionRows).toHaveLength(1);
                    });
            });
        });

        describe('in GSD (focus) mode', () => {
            it('is shown when it is unread', () => {
                LHNTestUtils.getDefaultRenderedSidebarLinks();

                // Given an archived report that has all comments read
                const report = {
                    ...LHNTestUtils.getFakeReport(),
                    lastReadSequenceNumber: LHNTestUtils.TEST_MAX_SEQUENCE_NUMBER,
                    statusNum: CONST.REPORT.STATUS.CLOSED,
                    stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                };

                // Given the user is in all betas
                const betas = [
                    CONST.BETAS.DEFAULT_ROOMS,
                    CONST.BETAS.POLICY_ROOMS,
                    CONST.BETAS.POLICY_EXPENSE_CHAT,
                ];

                return waitForPromisesToResolve()

                    // When Onyx is updated to contain that data and the sidebar re-renders
                    .then(() => Onyx.multiSet({
                        [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.GSD,
                        [ONYXKEYS.BETAS]: betas,
                        [ONYXKEYS.PERSONAL_DETAILS]: LHNTestUtils.fakePersonalDetails,
                        [`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`]: report,
                    }))

                    // Then the report is not rendered in the LHN
                    .then(() => {
                        const optionRows = screen.queryAllByAccessibilityHint('Navigates to a chat');
                        expect(optionRows).toHaveLength(0);
                    })

                    // When the report has a new comment and is now unread
                    .then(() => Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, {lastReadSequenceNumber: LHNTestUtils.TEST_MAX_SEQUENCE_NUMBER - 1}))

                    // Then the report is rendered in the LHN
                    .then(() => {
                        const optionRows = screen.queryAllByAccessibilityHint('Navigates to a chat');
                        expect(optionRows).toHaveLength(1);
                    });
            });

            it('is shown when it is pinned', () => {
                LHNTestUtils.getDefaultRenderedSidebarLinks();

                // Given an archived report that is not pinned
                const report = {
                    ...LHNTestUtils.getFakeReport(),
                    isPinned: false,
                    statusNum: CONST.REPORT.STATUS.CLOSED,
                    stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                };

                // Given the user is in all betas
                const betas = [
                    CONST.BETAS.DEFAULT_ROOMS,
                    CONST.BETAS.POLICY_ROOMS,
                    CONST.BETAS.POLICY_EXPENSE_CHAT,
                ];

                return waitForPromisesToResolve()

                    // When Onyx is updated to contain that data and the sidebar re-renders
                    .then(() => Onyx.multiSet({
                        [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.GSD,
                        [ONYXKEYS.BETAS]: betas,
                        [ONYXKEYS.PERSONAL_DETAILS]: LHNTestUtils.fakePersonalDetails,
                        [`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`]: report,
                    }))

                    // Then the report is not rendered in the LHN
                    .then(() => {
                        const optionRows = screen.queryAllByAccessibilityHint('Navigates to a chat');
                        expect(optionRows).toHaveLength(0);
                    })

                    // When the report is pinned
                    .then(() => Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, {isPinned: true}))

                    // Then the report is rendered in the LHN
                    .then(() => {
                        const optionRows = screen.queryAllByAccessibilityHint('Navigates to a chat');
                        expect(optionRows).toHaveLength(1);
                    });
            });

            it('is shown when it is the active report', () => {
                LHNTestUtils.getDefaultRenderedSidebarLinks();

                // Given an archived report that is not the active report
                const report = {
                    ...LHNTestUtils.getFakeReport(),
                    statusNum: CONST.REPORT.STATUS.CLOSED,
                    stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                };

                // Given the user is in all betas
                const betas = [
                    CONST.BETAS.DEFAULT_ROOMS,
                    CONST.BETAS.POLICY_ROOMS,
                    CONST.BETAS.POLICY_EXPENSE_CHAT,
                ];

                return waitForPromisesToResolve()

                    // When Onyx is updated to contain that data and the sidebar re-renders
                    .then(() => Onyx.multiSet({
                        [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.GSD,
                        [ONYXKEYS.BETAS]: betas,
                        [ONYXKEYS.PERSONAL_DETAILS]: LHNTestUtils.fakePersonalDetails,
                        [`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`]: report,
                    }))

                    // Then the report is not rendered in the LHN
                    .then(() => {
                        const optionRows = screen.queryAllByAccessibilityHint('Navigates to a chat');
                        expect(optionRows).toHaveLength(0);
                    })

                    // When sidebar is rendered with the active report ID matching the archived report in Onyx
                    .then(() => {
                        LHNTestUtils.getDefaultRenderedSidebarLinks(report.reportID);
                        return waitForPromisesToResolve();
                    })

                    // Then the report is rendered in the LHN
                    .then(() => {
                        const optionRows = screen.queryAllByAccessibilityHint('Navigates to a chat');
                        expect(optionRows).toHaveLength(1);
                    });
            });

            it('is hidden regardless of how many comments it has', () => {
                LHNTestUtils.getDefaultRenderedSidebarLinks();

                // Given an archived report with no comments
                const report = {
                    ...LHNTestUtils.getFakeReport(),
                    lastActionCreated: '2022-11-22 03:48:27.267',
                    statusNum: CONST.REPORT.STATUS.CLOSED,
                    stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                };

                // Given the user is in all betas
                const betas = [
                    CONST.BETAS.DEFAULT_ROOMS,
                    CONST.BETAS.POLICY_ROOMS,
                    CONST.BETAS.POLICY_EXPENSE_CHAT,
                ];

                return waitForPromisesToResolve()

                    // When Onyx is updated to contain that data and the sidebar re-renders
                    .then(() => Onyx.multiSet({
                        [ONYXKEYS.NVP_PRIORITY_MODE]: CONST.PRIORITY_MODE.GSD,
                        [ONYXKEYS.BETAS]: betas,
                        [ONYXKEYS.PERSONAL_DETAILS]: LHNTestUtils.fakePersonalDetails,
                        [`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`]: report,
                    }))

                    // Then the report is not rendered in the LHN
                    .then(() => {
                        const optionRows = screen.queryAllByAccessibilityHint('Navigates to a chat');
                        expect(optionRows).toHaveLength(0);
                    })

                    // When the report has comments
                    .then(() => Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, {
                        lastActionCreated: DateUtils.getDBTime(),
                    }))

                    // Then the report is not rendered in the LHN
                    .then(() => {
                        const optionRows = screen.queryAllByAccessibilityHint('Navigates to a chat');
                        expect(optionRows).toHaveLength(0);
                    });
            });
        });
    });
});
