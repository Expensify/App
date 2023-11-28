import Onyx from 'react-native-onyx';
import _ from 'underscore';
import CONST from '../../src/CONST';
import * as ReportUtils from '../../src/libs/ReportUtils';
import ONYXKEYS from '../../src/ONYXKEYS';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

// Be sure to include the mocked permissions library or else the beta tests won't work
jest.mock('../../src/libs/Permissions');

const currentUserEmail = 'bjorn@vikings.net';
const currentUserAccountID = 5;
const participantsPersonalDetails = {
    1: {
        accountID: 1,
        displayName: 'Ragnar Lothbrok',
        firstName: 'Ragnar',
        login: 'ragnar@vikings.net',
    },
    2: {
        accountID: 2,
        login: 'floki@vikings.net',
        displayName: 'floki@vikings.net',
    },
    3: {
        accountID: 3,
        displayName: 'Lagertha Lothbrok',
        firstName: 'Lagertha',
        login: 'lagertha@vikings.net',
        pronouns: 'She/her',
    },
    4: {
        accountID: 4,
        login: '+18332403627@expensify.sms',
        displayName: '(833) 240-3627',
    },
    5: {
        accountID: 5,
        displayName: 'Lagertha Lothbrok',
        firstName: 'Lagertha',
        login: 'lagertha2@vikings.net',
        pronouns: 'She/her',
    },
};
const policy = {
    policyID: 1,
    name: 'Vikings Policy',
};

Onyx.init({keys: ONYXKEYS});

describe('ReportUtils', () => {
    beforeAll(() => {
        Onyx.multiSet({
            [ONYXKEYS.PERSONAL_DETAILS_LIST]: participantsPersonalDetails,
            [ONYXKEYS.SESSION]: {email: currentUserEmail, accountID: currentUserAccountID},
            [ONYXKEYS.COUNTRY_CODE]: 1,
            [`${ONYXKEYS.COLLECTION.POLICY}${policy.policyID}`]: policy,
        });
        return waitForBatchedUpdates();
    });
    beforeEach(() => Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.DEFAULT).then(waitForBatchedUpdates));

    describe('getIconsForParticipants', () => {
        it('returns sorted avatar source by name, then accountID', () => {
            const participants = ReportUtils.getIconsForParticipants([1, 2, 3, 4, 5], participantsPersonalDetails);
            expect(participants).toHaveLength(5);

            expect(participants[0].source).toBeInstanceOf(Function);
            expect(participants[0].name).toBe('(833) 240-3627');
            expect(participants[0].id).toBe(4);
            expect(participants[0].type).toBe('avatar');

            expect(participants[1].source).toBeInstanceOf(Function);
            expect(participants[1].name).toBe('floki@vikings.net');
            expect(participants[1].id).toBe(2);
            expect(participants[1].type).toBe('avatar');
        });
    });

    describe('getDisplayNamesWithTooltips', () => {
        test('withSingleParticipantReport', () => {
            const participants = ReportUtils.getDisplayNamesWithTooltips(participantsPersonalDetails, false);
            expect(participants).toHaveLength(5);

            expect(participants[0].displayName).toBe('(833) 240-3627');
            expect(participants[0].login).toBe('+18332403627@expensify.sms');

            expect(participants[2].avatar).toBeInstanceOf(Function);
            expect(participants[2].displayName).toBe('Lagertha Lothbrok');
            expect(participants[2].login).toBe('lagertha@vikings.net');
            expect(participants[2].accountID).toBe(3);
            expect(participants[2].pronouns).toBe('She/her');

            expect(participants[4].avatar).toBeInstanceOf(Function);
            expect(participants[4].displayName).toBe('Ragnar Lothbrok');
            expect(participants[4].login).toBe('ragnar@vikings.net');
            expect(participants[4].accountID).toBe(1);
            expect(participants[4].pronouns).toBeUndefined();
        });
    });

    describe('getReportName', () => {
        describe('1:1 DM', () => {
            test('with displayName', () => {
                expect(
                    ReportUtils.getReportName({
                        participantAccountIDs: [currentUserAccountID, 1],
                    }),
                ).toBe('Ragnar Lothbrok');
            });

            test('no displayName', () => {
                expect(
                    ReportUtils.getReportName({
                        participantAccountIDs: [currentUserAccountID, 2],
                    }),
                ).toBe('floki@vikings.net');
            });

            test('SMS', () => {
                expect(
                    ReportUtils.getReportName({
                        participantAccountIDs: [currentUserAccountID, 4],
                    }),
                ).toBe('(833) 240-3627');
            });
        });

        test('Group DM', () => {
            expect(
                ReportUtils.getReportName({
                    participantAccountIDs: [currentUserAccountID, 1, 2, 3, 4],
                }),
            ).toBe('Ragnar, floki@vikings.net, Lagertha, (833) 240-3627');
        });

        describe('Default Policy Room', () => {
            const baseAdminsRoom = {
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_ADMINS,
                reportName: '#admins',
            };

            test('Active', () => {
                expect(ReportUtils.getReportName(baseAdminsRoom)).toBe('#admins');
            });

            test('Archived', () => {
                const archivedAdminsRoom = {
                    ...baseAdminsRoom,
                    statusNum: CONST.REPORT.STATUS.CLOSED,
                    stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                };

                expect(ReportUtils.getReportName(archivedAdminsRoom)).toBe('#admins (archived)');

                return Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.ES).then(() => expect(ReportUtils.getReportName(archivedAdminsRoom)).toBe('#admins (archivado)'));
            });
        });

        describe('User-Created Policy Room', () => {
            const baseUserCreatedRoom = {
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
                reportName: '#VikingsChat',
            };

            test('Active', () => {
                expect(ReportUtils.getReportName(baseUserCreatedRoom)).toBe('#VikingsChat');
            });

            test('Archived', () => {
                const archivedPolicyRoom = {
                    ...baseUserCreatedRoom,
                    statusNum: CONST.REPORT.STATUS.CLOSED,
                    stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                };

                expect(ReportUtils.getReportName(archivedPolicyRoom)).toBe('#VikingsChat (archived)');

                return Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.ES).then(() => expect(ReportUtils.getReportName(archivedPolicyRoom)).toBe('#VikingsChat (archivado)'));
            });
        });

        describe('PolicyExpenseChat', () => {
            describe('Active', () => {
                test('as member', () => {
                    expect(
                        ReportUtils.getReportName({
                            chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                            policyID: policy.policyID,
                            isOwnPolicyExpenseChat: true,
                            ownerAccountID: 1,
                        }),
                    ).toBe('Vikings Policy');
                });

                test('as admin', () => {
                    expect(
                        ReportUtils.getReportName({
                            chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                            policyID: policy.policyID,
                            isOwnPolicyExpenseChat: false,
                            ownerAccountID: 1,
                        }),
                    ).toBe('Ragnar Lothbrok');
                });
            });

            describe('Archived', () => {
                const baseArchivedPolicyExpenseChat = {
                    chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                    ownerAccountID: 1,
                    policyID: policy.policyID,
                    oldPolicyName: policy.name,
                    statusNum: CONST.REPORT.STATUS.CLOSED,
                    stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                };

                test('as member', () => {
                    const memberArchivedPolicyExpenseChat = {
                        ...baseArchivedPolicyExpenseChat,
                        isOwnPolicyExpenseChat: true,
                    };

                    expect(ReportUtils.getReportName(memberArchivedPolicyExpenseChat)).toBe('Vikings Policy (archived)');

                    return Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.ES).then(() =>
                        expect(ReportUtils.getReportName(memberArchivedPolicyExpenseChat)).toBe('Vikings Policy (archivado)'),
                    );
                });

                test('as admin', () => {
                    const adminArchivedPolicyExpenseChat = {
                        ...baseArchivedPolicyExpenseChat,
                        isOwnPolicyExpenseChat: false,
                    };

                    expect(ReportUtils.getReportName(adminArchivedPolicyExpenseChat)).toBe('Ragnar Lothbrok (archived)');

                    return Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.ES).then(() =>
                        expect(ReportUtils.getReportName(adminArchivedPolicyExpenseChat)).toBe('Ragnar Lothbrok (archivado)'),
                    );
                });
            });
        });
    });

    describe('requiresAttentionFromCurrentUser', () => {
        it('returns false when there is no report', () => {
            expect(ReportUtils.requiresAttentionFromCurrentUser()).toBe(false);
        });
        it('returns false when the matched IOU report does not have an owner accountID', () => {
            const report = {
                ...LHNTestUtils.getFakeReport(),
                ownerAccountID: undefined,
                hasOutstandingIOU: true,
            };
            expect(ReportUtils.requiresAttentionFromCurrentUser(report)).toBe(false);
        });
        it('returns false when the linked iou report has an oustanding IOU', () => {
            const report = {
                ...LHNTestUtils.getFakeReport(),
                iouReportID: '1',
            };
            Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}1`, {
                reportID: '1',
                ownerAccountID: 99,
                hasOutstandingIOU: true,
            }).then(() => {
                expect(ReportUtils.requiresAttentionFromCurrentUser(report)).toBe(false);
            });
        });
        it('returns false when the report has no outstanding IOU but is waiting for a bank account and the logged user is the report owner', () => {
            const report = {
                ...LHNTestUtils.getFakeReport(),
                hasOutstandingIOU: false,
                ownerAccountID: currentUserAccountID,
                isWaitingOnBankAccount: true,
            };
            expect(ReportUtils.requiresAttentionFromCurrentUser(report)).toBe(false);
        });
        it('returns false when the report has outstanding IOU and is not waiting for a bank account and the logged user is the report owner', () => {
            const report = {
                ...LHNTestUtils.getFakeReport(),
                hasOutstandingIOU: true,
                ownerAccountID: currentUserAccountID,
                isWaitingOnBankAccount: false,
            };
            expect(ReportUtils.requiresAttentionFromCurrentUser(report)).toBe(false);
        });
        it('returns false when the report has no oustanding IOU but is waiting for a bank account and the logged user is not the report owner', () => {
            const report = {
                ...LHNTestUtils.getFakeReport(),
                hasOutstandingIOU: false,
                ownerAccountID: 97,
                isWaitingOnBankAccount: true,
            };
            expect(ReportUtils.requiresAttentionFromCurrentUser(report)).toBe(false);
        });
        it('returns true when the report has an unread mention', () => {
            const report = {
                ...LHNTestUtils.getFakeReport(),
                isUnreadWithMention: true,
            };
            expect(ReportUtils.requiresAttentionFromCurrentUser(report)).toBe(true);
        });
        it('returns true when the report is an outstanding task', () => {
            const report = {
                ...LHNTestUtils.getFakeReport(),
                type: CONST.REPORT.TYPE.TASK,
                managerID: currentUserAccountID,
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS.OPEN,
            };
            expect(ReportUtils.requiresAttentionFromCurrentUser(report)).toBe(true);
        });
        it('returns true when the report has oustanding child request', () => {
            const report = {
                ...LHNTestUtils.getFakeReport(),
                ownerAccountID: 99,
                hasOutstandingIOU: true,
                hasOutstandingChildRequest: true,
                isWaitingOnBankAccount: false,
            };
            expect(ReportUtils.requiresAttentionFromCurrentUser(report)).toBe(true);
        });
    });

    describe('getMoneyRequestOptions', () => {
        const participantsAccountIDs = _.keys(participantsPersonalDetails);

        beforeAll(() => {
            Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                [currentUserAccountID]: {
                    accountID: currentUserAccountID,
                    login: currentUserEmail,
                },
            });
        });

        afterAll(() => Onyx.clear());

        describe('return empty iou options if', () => {
            it('participants aray contains excluded expensify iou emails', () => {
                const allEmpty = _.every(CONST.EXPENSIFY_ACCOUNT_IDS, (accountID) => {
                    const moneyRequestOptions = ReportUtils.getMoneyRequestOptions({}, [currentUserAccountID, accountID], []);
                    return moneyRequestOptions.length === 0;
                });
                expect(allEmpty).toBe(true);
            });

            it('it is a room with no participants except self', () => {
                const report = {
                    ...LHNTestUtils.getFakeReport(),
                    chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
                };
                const moneyRequestOptions = ReportUtils.getMoneyRequestOptions(report, [currentUserAccountID], []);
                expect(moneyRequestOptions.length).toBe(0);
            });

            it('its not your policy expense chat', () => {
                const report = {
                    ...LHNTestUtils.getFakeReport(),
                    chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                    isOwnPolicyExpenseChat: false,
                };
                const moneyRequestOptions = ReportUtils.getMoneyRequestOptions(report, [currentUserAccountID], []);
                expect(moneyRequestOptions.length).toBe(0);
            });

            it('its paid IOU report', () => {
                const report = {
                    ...LHNTestUtils.getFakeReport(),
                    type: CONST.REPORT.TYPE.IOU,
                    statusNum: CONST.REPORT.STATUS.REIMBURSED,
                };
                const moneyRequestOptions = ReportUtils.getMoneyRequestOptions(report, [currentUserAccountID], []);
                expect(moneyRequestOptions.length).toBe(0);
            });

            it('its approved Expense report', () => {
                const report = {
                    ...LHNTestUtils.getFakeReport(),
                    type: CONST.REPORT.TYPE.EXPENSE,
                    stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                    statusNum: CONST.REPORT.STATUS.APPROVED,
                };
                const moneyRequestOptions = ReportUtils.getMoneyRequestOptions(report, [currentUserAccountID], []);
                expect(moneyRequestOptions.length).toBe(0);
            });

            it('its paid Expense report', () => {
                const report = {
                    ...LHNTestUtils.getFakeReport(),
                    type: CONST.REPORT.TYPE.EXPENSE,
                    statusNum: CONST.REPORT.STATUS.REIMBURSED,
                };
                const moneyRequestOptions = ReportUtils.getMoneyRequestOptions(report, [currentUserAccountID], []);
                expect(moneyRequestOptions.length).toBe(0);
            });

            it('it is an expense report tied to a policy expense chat user does not own', () => {
                Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}100`, {
                    reportID: '100',
                    isOwnPolicyExpenseChat: false,
                }).then(() => {
                    const report = {
                        ...LHNTestUtils.getFakeReport(),
                        parentReportID: '100',
                        type: CONST.REPORT.TYPE.EXPENSE,
                    };
                    const moneyRequestOptions = ReportUtils.getMoneyRequestOptions(report, [currentUserAccountID], [CONST.BETAS.IOU_SEND]);
                    expect(moneyRequestOptions.length).toBe(0);
                });
            });
        });

        describe('return only iou split option if', () => {
            it('it is a chat room with more than one participant', () => {
                const onlyHaveSplitOption = _.every(
                    [CONST.REPORT.CHAT_TYPE.POLICY_ADMINS, CONST.REPORT.CHAT_TYPE.POLICY_ANNOUNCE, CONST.REPORT.CHAT_TYPE.DOMAIN_ALL, CONST.REPORT.CHAT_TYPE.POLICY_ROOM],
                    (chatType) => {
                        const report = {
                            ...LHNTestUtils.getFakeReport(),
                            chatType,
                        };
                        const moneyRequestOptions = ReportUtils.getMoneyRequestOptions(report, [currentUserAccountID, participantsAccountIDs[0]], []);
                        return moneyRequestOptions.length === 1 && moneyRequestOptions.includes(CONST.IOU.TYPE.SPLIT);
                    },
                );
                expect(onlyHaveSplitOption).toBe(true);
            });

            it('has multiple participants excluding self', () => {
                const report = {
                    ...LHNTestUtils.getFakeReport(),
                    chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
                };
                const moneyRequestOptions = ReportUtils.getMoneyRequestOptions(report, [currentUserAccountID, ...participantsAccountIDs], []);
                expect(moneyRequestOptions.length).toBe(1);
                expect(moneyRequestOptions.includes(CONST.IOU.TYPE.SPLIT)).toBe(true);
            });

            it('user has send money permission', () => {
                const report = {
                    ...LHNTestUtils.getFakeReport(),
                    chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
                };
                const moneyRequestOptions = ReportUtils.getMoneyRequestOptions(report, [currentUserAccountID, ...participantsAccountIDs], [CONST.BETAS.IOU_SEND]);
                expect(moneyRequestOptions.length).toBe(1);
                expect(moneyRequestOptions.includes(CONST.IOU.TYPE.SPLIT)).toBe(true);
            });

            it("it's a group DM report", () => {
                const report = {
                    ...LHNTestUtils.getFakeReport(),
                    type: CONST.REPORT.TYPE.CHAT,
                    participantsAccountIDs: [currentUserAccountID, ...participantsAccountIDs],
                };
                const moneyRequestOptions = ReportUtils.getMoneyRequestOptions(report, [currentUserAccountID, ...participantsAccountIDs], [CONST.BETAS.IOU_SEND]);
                expect(moneyRequestOptions.length).toBe(1);
                expect(moneyRequestOptions.includes(CONST.IOU.TYPE.SPLIT)).toBe(true);
            });
        });

        describe('return only money request option if', () => {
            it("it is an expense report tied to user's own policy expense chat", () => {
                Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}101`, {
                    reportID: '101',
                    chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                    isOwnPolicyExpenseChat: true,
                }).then(() => {
                    const report = {
                        ...LHNTestUtils.getFakeReport(),
                        parentReportID: '101',
                        type: CONST.REPORT.TYPE.EXPENSE,
                    };
                    const moneyRequestOptions = ReportUtils.getMoneyRequestOptions(report, [currentUserAccountID], [CONST.BETAS.IOU_SEND]);
                    expect(moneyRequestOptions.length).toBe(1);
                    expect(moneyRequestOptions.includes(CONST.IOU.TYPE.REQUEST)).toBe(true);
                });
            });

            it('it is an IOU report in submitted state', () => {
                const report = {
                    ...LHNTestUtils.getFakeReport(),
                    type: CONST.REPORT.TYPE.IOU,
                    state: CONST.REPORT.STATE.SUBMITTED,
                    stateNum: CONST.REPORT.STATE_NUM.PROCESSING,
                    statusNum: CONST.REPORT.STATUS.SUBMITTED,
                };
                const moneyRequestOptions = ReportUtils.getMoneyRequestOptions(report, [currentUserAccountID, participantsAccountIDs[0]], []);
                expect(moneyRequestOptions.length).toBe(1);
                expect(moneyRequestOptions.includes(CONST.IOU.TYPE.REQUEST)).toBe(true);
            });

            it('it is an IOU report in submitted state even with send money permissions', () => {
                const report = {
                    ...LHNTestUtils.getFakeReport(),
                    type: CONST.REPORT.TYPE.IOU,
                    state: CONST.REPORT.STATE.SUBMITTED,
                    stateNum: CONST.REPORT.STATE_NUM.PROCESSING,
                    statusNum: CONST.REPORT.STATUS.SUBMITTED,
                };
                const moneyRequestOptions = ReportUtils.getMoneyRequestOptions(report, [currentUserAccountID, participantsAccountIDs[0]], [CONST.BETAS.IOU_SEND]);
                expect(moneyRequestOptions.length).toBe(1);
                expect(moneyRequestOptions.includes(CONST.IOU.TYPE.REQUEST)).toBe(true);
            });
        });

        describe('return multiple money request option if', () => {
            it("it is user's own policy expense chat", () => {
                const report = {
                    ...LHNTestUtils.getFakeReport(),
                    chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                    isOwnPolicyExpenseChat: true,
                };
                const moneyRequestOptions = ReportUtils.getMoneyRequestOptions(report, [currentUserAccountID, ...participantsAccountIDs], [CONST.BETAS.IOU_SEND]);
                expect(moneyRequestOptions.length).toBe(2);
                expect(moneyRequestOptions.includes(CONST.IOU.TYPE.REQUEST)).toBe(true);
                expect(moneyRequestOptions.includes(CONST.IOU.TYPE.SPLIT)).toBe(true);
            });

            it('it is a 1:1 DM', () => {
                const report = {
                    ...LHNTestUtils.getFakeReport(),
                    type: CONST.REPORT.TYPE.CHAT,
                };
                const moneyRequestOptions = ReportUtils.getMoneyRequestOptions(report, [currentUserAccountID, participantsAccountIDs[0]], [CONST.BETAS.IOU_SEND]);
                expect(moneyRequestOptions.length).toBe(2);
                expect(moneyRequestOptions.includes(CONST.IOU.TYPE.REQUEST)).toBe(true);
                expect(moneyRequestOptions.includes(CONST.IOU.TYPE.SEND)).toBe(true);
            });
        });
    });

    describe('getReportIDFromLink', () => {
        it('should get the correct reportID from a deep link', () => {
            expect(ReportUtils.getReportIDFromLink('new-expensify://r/75431276')).toBe('75431276');
            expect(ReportUtils.getReportIDFromLink('https://www.expensify.cash/r/75431276')).toBe('75431276');
            expect(ReportUtils.getReportIDFromLink('https://staging.new.expensify.com/r/75431276')).toBe('75431276');
            expect(ReportUtils.getReportIDFromLink('https://dev.new.expensify.com/r/75431276')).toBe('75431276');
            expect(ReportUtils.getReportIDFromLink('https://staging.expensify.cash/r/75431276')).toBe('75431276');
            expect(ReportUtils.getReportIDFromLink('https://new.expensify.com/r/75431276')).toBe('75431276');
        });

        it("shouldn't get the correct reportID from a deep link", () => {
            expect(ReportUtils.getReportIDFromLink('new-expensify-not-valid://r/75431276')).toBe('');
            expect(ReportUtils.getReportIDFromLink('new-expensify://settings')).toBe('');
        });
    });

    describe('sortReportsByLastRead', () => {
        it('should filter out report without reportID & lastReadTime and sort lastReadTime in ascending order', () => {
            const reports = {
                1: {reportID: 1, lastReadTime: '2023-07-08 07:15:44.030'},
                2: {reportID: 2, lastReadTime: null},
                3: {reportID: 3, lastReadTime: '2023-07-06 07:15:44.030'},
                4: {reportID: 4, lastReadTime: '2023-07-07 07:15:44.030', type: CONST.REPORT.TYPE.IOU},
                5: {lastReadTime: '2023-07-09 07:15:44.030'},
                6: {reportID: 6},
                7: {},
            };
            const sortedReports = [
                {reportID: 3, lastReadTime: '2023-07-06 07:15:44.030'},
                {reportID: 4, lastReadTime: '2023-07-07 07:15:44.030', type: CONST.REPORT.TYPE.IOU},
                {reportID: 1, lastReadTime: '2023-07-08 07:15:44.030'},
            ];
            expect(ReportUtils.sortReportsByLastRead(reports)).toEqual(sortedReports);
        });
    });
});
