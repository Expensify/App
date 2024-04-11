/* eslint-disable @typescript-eslint/naming-convention */
import type {OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import * as ReportUtils from '@libs/ReportUtils';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList, Policy, Report, ReportAction} from '@src/types/onyx';
import {toCollectionDataSet} from '@src/types/utils/CollectionDataSet';
import * as NumberUtils from '../../src/libs/NumberUtils';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

// Be sure to include the mocked permissions library or else the beta tests won't work
jest.mock('@libs/Permissions');

const currentUserEmail = 'bjorn@vikings.net';
const currentUserAccountID = 5;
const participantsPersonalDetails: PersonalDetailsList = {
    '1': {
        accountID: 1,
        displayName: 'Ragnar Lothbrok',
        firstName: 'Ragnar',
        login: 'ragnar@vikings.net',
    },
    '2': {
        accountID: 2,
        login: 'floki@vikings.net',
        displayName: 'floki@vikings.net',
    },
    '3': {
        accountID: 3,
        displayName: 'Lagertha Lothbrok',
        firstName: 'Lagertha',
        login: 'lagertha@vikings.net',
        pronouns: 'She/her',
    },
    '4': {
        accountID: 4,
        login: '+18332403627@expensify.sms',
        displayName: '(833) 240-3627',
    },
    '5': {
        accountID: 5,
        displayName: 'Lagertha Lothbrok',
        firstName: 'Lagertha',
        login: 'lagertha2@vikings.net',
        pronouns: 'She/her',
    },
};

const policy: Policy = {
    id: '1',
    name: 'Vikings Policy',
    role: 'user',
    type: 'free',
    owner: '',
    outputCurrency: '',
    isPolicyExpenseChatEnabled: false,
};

Onyx.init({keys: ONYXKEYS});

describe('ReportUtils', () => {
    beforeAll(() => {
        const policyCollectionDataSet = toCollectionDataSet(ONYXKEYS.COLLECTION.POLICY, [policy], (current) => current.id);
        Onyx.multiSet({
            [ONYXKEYS.PERSONAL_DETAILS_LIST]: participantsPersonalDetails,
            [ONYXKEYS.SESSION]: {email: currentUserEmail, accountID: currentUserAccountID},
            [ONYXKEYS.COUNTRY_CODE]: 1,
            ...policyCollectionDataSet,
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
                        reportID: '',
                        participantAccountIDs: [currentUserAccountID, 1],
                    }),
                ).toBe('Ragnar Lothbrok');
            });

            test('no displayName', () => {
                expect(
                    ReportUtils.getReportName({
                        reportID: '',
                        participantAccountIDs: [currentUserAccountID, 2],
                    }),
                ).toBe('floki@vikings.net');
            });

            test('SMS', () => {
                expect(
                    ReportUtils.getReportName({
                        reportID: '',
                        participantAccountIDs: [currentUserAccountID, 4],
                    }),
                ).toBe('(833) 240-3627');
            });
        });

        test('Group DM', () => {
            expect(
                ReportUtils.getReportName({
                    reportID: '',
                    participantAccountIDs: [currentUserAccountID, 1, 2, 3, 4],
                }),
            ).toBe('Ragnar, floki@vikings.net, Lagertha, (833) 240-3627');
        });

        describe('Default Policy Room', () => {
            const baseAdminsRoom = {
                reportID: '',
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_ADMINS,
                reportName: '#admins',
            };

            test('Active', () => {
                expect(ReportUtils.getReportName(baseAdminsRoom)).toBe('#admins');
            });

            test('Archived', () => {
                const archivedAdminsRoom = {
                    ...baseAdminsRoom,
                    statusNum: CONST.REPORT.STATUS_NUM.CLOSED,
                    stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                };

                expect(ReportUtils.getReportName(archivedAdminsRoom)).toBe('#admins (archived)');

                return Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.ES).then(() => expect(ReportUtils.getReportName(archivedAdminsRoom)).toBe('#admins (archivado)'));
            });
        });

        describe('User-Created Policy Room', () => {
            const baseUserCreatedRoom = {
                reportID: '',
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
                reportName: '#VikingsChat',
            };

            test('Active', () => {
                expect(ReportUtils.getReportName(baseUserCreatedRoom)).toBe('#VikingsChat');
            });

            test('Archived', () => {
                const archivedPolicyRoom = {
                    ...baseUserCreatedRoom,
                    statusNum: CONST.REPORT.STATUS_NUM.CLOSED,
                    stateNum: CONST.REPORT.STATE_NUM.APPROVED,
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
                            reportID: '',
                            chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                            policyID: policy.id,
                            isOwnPolicyExpenseChat: true,
                            ownerAccountID: 1,
                        }),
                    ).toBe('Vikings Policy');
                });

                test('as admin', () => {
                    expect(
                        ReportUtils.getReportName({
                            reportID: '',
                            chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                            policyID: policy.id,
                            isOwnPolicyExpenseChat: false,
                            ownerAccountID: 1,
                        }),
                    ).toBe('Ragnar Lothbrok');
                });
            });

            describe('Archived', () => {
                const baseArchivedPolicyExpenseChat = {
                    reportID: '',
                    chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                    ownerAccountID: 1,
                    policyID: policy.id,
                    oldPolicyName: policy.name,
                    statusNum: CONST.REPORT.STATUS_NUM.CLOSED,
                    stateNum: CONST.REPORT.STATE_NUM.APPROVED,
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
            expect(ReportUtils.requiresAttentionFromCurrentUser(null)).toBe(false);
        });
        it('returns false when the matched IOU report does not have an owner accountID', () => {
            const report = {
                ...LHNTestUtils.getFakeReport(),
                ownerAccountID: undefined,
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
            }).then(() => {
                expect(ReportUtils.requiresAttentionFromCurrentUser(report)).toBe(false);
            });
        });
        it('returns false when the report has no outstanding IOU but is waiting for a bank account and the logged user is the report owner', () => {
            const report = {
                ...LHNTestUtils.getFakeReport(),
                ownerAccountID: currentUserAccountID,
                isWaitingOnBankAccount: true,
            };
            expect(ReportUtils.requiresAttentionFromCurrentUser(report)).toBe(false);
        });
        it('returns false when the report has outstanding IOU and is not waiting for a bank account and the logged user is the report owner', () => {
            const report = {
                ...LHNTestUtils.getFakeReport(),
                ownerAccountID: currentUserAccountID,
                isWaitingOnBankAccount: false,
            };
            expect(ReportUtils.requiresAttentionFromCurrentUser(report)).toBe(false);
        });
        it('returns false when the report has no oustanding IOU but is waiting for a bank account and the logged user is not the report owner', () => {
            const report = {
                ...LHNTestUtils.getFakeReport(),
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
                isUnreadWithMention: false,
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            };
            expect(ReportUtils.requiresAttentionFromCurrentUser(report)).toBe(true);
        });
        it('returns true when the report has oustanding child request', () => {
            const report = {
                ...LHNTestUtils.getFakeReport(),
                ownerAccountID: 99,
                hasOutstandingChildRequest: true,
                isWaitingOnBankAccount: false,
            };
            expect(ReportUtils.requiresAttentionFromCurrentUser(report)).toBe(true);
        });
    });

    describe('getMoneyRequestOptions', () => {
        const participantsAccountIDs = Object.keys(participantsPersonalDetails).map(Number);

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
            it('participants array contains excluded expensify iou emails', () => {
                const allEmpty = CONST.EXPENSIFY_ACCOUNT_IDS.every((accountID) => {
                    const moneyRequestOptions = ReportUtils.getMoneyRequestOptions(null, null, [currentUserAccountID, accountID]);
                    return moneyRequestOptions.length === 0;
                });
                expect(allEmpty).toBe(true);
            });

            it('it is a room with no participants except self', () => {
                const report = {
                    ...LHNTestUtils.getFakeReport(),
                    chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
                };
                const moneyRequestOptions = ReportUtils.getMoneyRequestOptions(report, null, [currentUserAccountID]);
                expect(moneyRequestOptions.length).toBe(0);
            });

            it('its not your policy expense chat', () => {
                const report = {
                    ...LHNTestUtils.getFakeReport(),
                    chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                    isOwnPolicyExpenseChat: false,
                };
                const moneyRequestOptions = ReportUtils.getMoneyRequestOptions(report, null, [currentUserAccountID]);
                expect(moneyRequestOptions.length).toBe(0);
            });

            it('its paid IOU report', () => {
                const report = {
                    ...LHNTestUtils.getFakeReport(),
                    type: CONST.REPORT.TYPE.IOU,
                    statusNum: CONST.REPORT.STATUS_NUM.REIMBURSED,
                };
                const moneyRequestOptions = ReportUtils.getMoneyRequestOptions(report, null, [currentUserAccountID]);
                expect(moneyRequestOptions.length).toBe(0);
            });

            it('its approved Expense report', () => {
                const report = {
                    ...LHNTestUtils.getFakeReport(),
                    type: CONST.REPORT.TYPE.EXPENSE,
                    stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                    statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
                };
                const moneyRequestOptions = ReportUtils.getMoneyRequestOptions(report, null, [currentUserAccountID]);
                expect(moneyRequestOptions.length).toBe(0);
            });

            it('its paid Expense report', () => {
                const report = {
                    ...LHNTestUtils.getFakeReport(),
                    type: CONST.REPORT.TYPE.EXPENSE,
                    statusNum: CONST.REPORT.STATUS_NUM.REIMBURSED,
                };
                const moneyRequestOptions = ReportUtils.getMoneyRequestOptions(report, null, [currentUserAccountID]);
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
                    const moneyRequestOptions = ReportUtils.getMoneyRequestOptions(report, null, [currentUserAccountID]);
                    expect(moneyRequestOptions.length).toBe(0);
                });
            });

            it("it is a submitted report tied to user's own policy expense chat and the policy does not have Instant Submit frequency", () => {
                const paidPolicy: Policy = {
                    id: '3f54cca8',
                    type: CONST.POLICY.TYPE.TEAM,
                    name: '',
                    role: 'user',
                    owner: '',
                    outputCurrency: '',
                    isPolicyExpenseChatEnabled: false,
                };
                Promise.all([
                    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${paidPolicy.id}`, paidPolicy),
                    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}101`, {
                        reportID: '101',
                        chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                        isOwnPolicyExpenseChat: true,
                    }),
                ]).then(() => {
                    const report = {
                        ...LHNTestUtils.getFakeReport(),
                        type: CONST.REPORT.TYPE.EXPENSE,
                        stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                        statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                        parentReportID: '101',
                        policyID: paidPolicy.id,
                    };
                    const moneyRequestOptions = ReportUtils.getMoneyRequestOptions(report, paidPolicy, [currentUserAccountID, participantsAccountIDs[0]]);
                    expect(moneyRequestOptions.length).toBe(0);
                });
            });
        });

        describe('return only iou split option if', () => {
            it('it is a chat room with more than one participant', () => {
                const onlyHaveSplitOption = [
                    CONST.REPORT.CHAT_TYPE.POLICY_ADMINS,
                    CONST.REPORT.CHAT_TYPE.POLICY_ANNOUNCE,
                    CONST.REPORT.CHAT_TYPE.DOMAIN_ALL,
                    CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
                ].every((chatType) => {
                    const report = {
                        ...LHNTestUtils.getFakeReport(),
                        chatType,
                    };
                    const moneyRequestOptions = ReportUtils.getMoneyRequestOptions(report, null, [currentUserAccountID, participantsAccountIDs[0]]);
                    return moneyRequestOptions.length === 1 && moneyRequestOptions.includes(CONST.IOU.TYPE.SPLIT);
                });
                expect(onlyHaveSplitOption).toBe(true);
            });

            it('has multiple participants excluding self', () => {
                const report = {
                    ...LHNTestUtils.getFakeReport(),
                    chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
                };
                const moneyRequestOptions = ReportUtils.getMoneyRequestOptions(report, null, [currentUserAccountID, ...participantsAccountIDs]);
                expect(moneyRequestOptions.length).toBe(1);
                expect(moneyRequestOptions.includes(CONST.IOU.TYPE.SPLIT)).toBe(true);
            });

            it('user has send money permission', () => {
                const report = {
                    ...LHNTestUtils.getFakeReport(),
                    chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
                };
                const moneyRequestOptions = ReportUtils.getMoneyRequestOptions(report, null, [currentUserAccountID, ...participantsAccountIDs]);
                expect(moneyRequestOptions.length).toBe(1);
                expect(moneyRequestOptions.includes(CONST.IOU.TYPE.SPLIT)).toBe(true);
            });

            it("it's a group DM report", () => {
                const report = {
                    ...LHNTestUtils.getFakeReport(),
                    type: CONST.REPORT.TYPE.CHAT,
                    participantsAccountIDs: [currentUserAccountID, ...participantsAccountIDs],
                };
                const moneyRequestOptions = ReportUtils.getMoneyRequestOptions(report, null, [currentUserAccountID, ...participantsAccountIDs.map(Number)]);
                expect(moneyRequestOptions.length).toBe(1);
                expect(moneyRequestOptions.includes(CONST.IOU.TYPE.SPLIT)).toBe(true);
            });
        });

        describe('return only money request option if', () => {
            it('it is an IOU report in submitted state', () => {
                const report = {
                    ...LHNTestUtils.getFakeReport(),
                    type: CONST.REPORT.TYPE.IOU,
                    stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                    statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                };
                const moneyRequestOptions = ReportUtils.getMoneyRequestOptions(report, null, [currentUserAccountID, participantsAccountIDs[0]]);
                expect(moneyRequestOptions.length).toBe(1);
                expect(moneyRequestOptions.includes(CONST.IOU.TYPE.REQUEST)).toBe(true);
            });

            it('it is an IOU report in submitted state even with send money permissions', () => {
                const report = {
                    ...LHNTestUtils.getFakeReport(),
                    type: CONST.REPORT.TYPE.IOU,
                    stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                    statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                };
                const moneyRequestOptions = ReportUtils.getMoneyRequestOptions(report, null, [currentUserAccountID, participantsAccountIDs[0]]);
                expect(moneyRequestOptions.length).toBe(1);
                expect(moneyRequestOptions.includes(CONST.IOU.TYPE.REQUEST)).toBe(true);
            });
        });

        describe('return only money request and track expense options if', () => {
            it("it is an expense report tied to user's own policy expense chat", () => {
                Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}102`, {
                    reportID: '102',
                    chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                    isOwnPolicyExpenseChat: true,
                }).then(() => {
                    const report = {
                        ...LHNTestUtils.getFakeReport(),
                        parentReportID: '102',
                        type: CONST.REPORT.TYPE.EXPENSE,
                    };
                    const moneyRequestOptions = ReportUtils.getMoneyRequestOptions(report, null, [currentUserAccountID]);
                    expect(moneyRequestOptions.length).toBe(2);
                    expect(moneyRequestOptions.includes(CONST.IOU.TYPE.REQUEST)).toBe(true);
                    expect(moneyRequestOptions.includes(CONST.IOU.TYPE.TRACK_EXPENSE)).toBe(true);
                });
            });

            it("it is an open expense report tied to user's own policy expense chat", () => {
                Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}103`, {
                    reportID: '103',
                    chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                    isOwnPolicyExpenseChat: true,
                }).then(() => {
                    const report = {
                        ...LHNTestUtils.getFakeReport(),
                        type: CONST.REPORT.TYPE.EXPENSE,
                        stateNum: CONST.REPORT.STATE_NUM.OPEN,
                        statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                        parentReportID: '103',
                    };
                    const paidPolicy = {
                        type: CONST.POLICY.TYPE.TEAM,
                        id: '',
                        name: '',
                        role: 'user',
                        owner: '',
                        outputCurrency: '',
                        isPolicyExpenseChatEnabled: false,
                    } as const;
                    const moneyRequestOptions = ReportUtils.getMoneyRequestOptions(report, paidPolicy, [currentUserAccountID, participantsAccountIDs[0]]);
                    expect(moneyRequestOptions.length).toBe(2);
                    expect(moneyRequestOptions.includes(CONST.IOU.TYPE.REQUEST)).toBe(true);
                    expect(moneyRequestOptions.includes(CONST.IOU.TYPE.TRACK_EXPENSE)).toBe(true);
                });
            });

            it('it is an IOU report in submitted state', () => {
                const report = {
                    ...LHNTestUtils.getFakeReport(),
                    type: CONST.REPORT.TYPE.IOU,
                    stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                    statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                };
                const moneyRequestOptions = ReportUtils.getMoneyRequestOptions(report, null, [currentUserAccountID, participantsAccountIDs[0]]);
                expect(moneyRequestOptions.length).toBe(1);
                expect(moneyRequestOptions.includes(CONST.IOU.TYPE.REQUEST)).toBe(true);
            });

            it('it is an IOU report in submitted state even with send money permissions', () => {
                const report = {
                    ...LHNTestUtils.getFakeReport(),
                    type: CONST.REPORT.TYPE.IOU,
                    stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                    statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                };
                const moneyRequestOptions = ReportUtils.getMoneyRequestOptions(report, null, [currentUserAccountID, participantsAccountIDs[0]]);
                expect(moneyRequestOptions.length).toBe(1);
                expect(moneyRequestOptions.includes(CONST.IOU.TYPE.REQUEST)).toBe(true);
            });

            it("it is a submitted expense report in user's own policyExpenseChat and the policy has Instant Submit frequency", () => {
                const paidPolicy: Policy = {
                    id: 'ef72dfeb',
                    type: CONST.POLICY.TYPE.TEAM,
                    autoReporting: true,
                    autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT,
                    name: '',
                    role: 'user',
                    owner: '',
                    outputCurrency: '',
                    isPolicyExpenseChatEnabled: false,
                };
                Promise.all([
                    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${paidPolicy.id}`, paidPolicy),
                    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}101`, {
                        reportID: '101',
                        chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                        isOwnPolicyExpenseChat: true,
                    }),
                ]).then(() => {
                    const report = {
                        ...LHNTestUtils.getFakeReport(),
                        type: CONST.REPORT.TYPE.EXPENSE,
                        stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                        statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                        parentReportID: '101',
                        policyID: paidPolicy.id,
                    };
                    const moneyRequestOptions = ReportUtils.getMoneyRequestOptions(report, paidPolicy, [currentUserAccountID, participantsAccountIDs[0]]);
                    expect(moneyRequestOptions.length).toBe(2);
                    expect(moneyRequestOptions.includes(CONST.IOU.TYPE.REQUEST)).toBe(true);
                    expect(moneyRequestOptions.includes(CONST.IOU.TYPE.TRACK_EXPENSE)).toBe(true);
                });
            });
        });

        describe('return multiple money request options if', () => {
            it('it is a 1:1 DM', () => {
                const report = {
                    ...LHNTestUtils.getFakeReport(),
                    type: CONST.REPORT.TYPE.CHAT,
                };
                const moneyRequestOptions = ReportUtils.getMoneyRequestOptions(report, null, [currentUserAccountID, participantsAccountIDs[0]]);
                expect(moneyRequestOptions.length).toBe(3);
                expect(moneyRequestOptions.includes(CONST.IOU.TYPE.SPLIT)).toBe(true);
                expect(moneyRequestOptions.includes(CONST.IOU.TYPE.REQUEST)).toBe(true);
                expect(moneyRequestOptions.includes(CONST.IOU.TYPE.SEND)).toBe(true);
            });
        });

        describe('return multiple money request options and the track expense option if', () => {
            it("it is user's own policy expense chat", () => {
                const report = {
                    ...LHNTestUtils.getFakeReport(),
                    chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                    isOwnPolicyExpenseChat: true,
                };
                const moneyRequestOptions = ReportUtils.getMoneyRequestOptions(report, null, [currentUserAccountID, ...participantsAccountIDs]);
                expect(moneyRequestOptions.length).toBe(3);
                expect(moneyRequestOptions.includes(CONST.IOU.TYPE.REQUEST)).toBe(true);
                expect(moneyRequestOptions.includes(CONST.IOU.TYPE.SPLIT)).toBe(true);
                expect(moneyRequestOptions.includes(CONST.IOU.TYPE.TRACK_EXPENSE)).toBe(true);
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
            const reports: Array<OnyxEntry<Report>> = [
                {reportID: '1', lastReadTime: '2023-07-08 07:15:44.030'},
                {reportID: '2', lastReadTime: undefined},
                {reportID: '3', lastReadTime: '2023-07-06 07:15:44.030'},
                {reportID: '4', lastReadTime: '2023-07-07 07:15:44.030', type: CONST.REPORT.TYPE.IOU},
                {lastReadTime: '2023-07-09 07:15:44.030'} as Report,
                {reportID: '6'},
                null,
            ];
            const sortedReports: Array<OnyxEntry<Report>> = [
                {reportID: '3', lastReadTime: '2023-07-06 07:15:44.030'},
                {reportID: '4', lastReadTime: '2023-07-07 07:15:44.030', type: CONST.REPORT.TYPE.IOU},
                {reportID: '1', lastReadTime: '2023-07-08 07:15:44.030'},
            ];
            expect(ReportUtils.sortReportsByLastRead(reports, null)).toEqual(sortedReports);
        });
    });

    describe('shouldDisableThread', () => {
        const reportID = '1';

        it('should disable on thread-disabled actions', () => {
            const reportAction = ReportUtils.buildOptimisticCreatedReportAction('email1@test.com');
            expect(ReportUtils.shouldDisableThread(reportAction, reportID)).toBeTruthy();
        });

        it('should disable thread on split bill actions', () => {
            const reportAction = ReportUtils.buildOptimisticIOUReportAction(
                CONST.IOU.REPORT_ACTION_TYPE.SPLIT,
                50000,
                CONST.CURRENCY.USD,
                '',
                [{login: 'email1@test.com'}, {login: 'email2@test.com'}],
                NumberUtils.rand64(),
            ) as ReportAction;
            expect(ReportUtils.shouldDisableThread(reportAction, reportID)).toBeTruthy();
        });

        it('should disable on deleted and not-thread actions', () => {
            const reportAction = {
                message: [
                    {
                        translationKey: '',
                        type: 'COMMENT',
                        html: '',
                        text: '',
                        isEdited: true,
                    },
                ],
                childVisibleActionCount: 1,
            } as ReportAction;
            expect(ReportUtils.shouldDisableThread(reportAction, reportID)).toBeFalsy();

            reportAction.childVisibleActionCount = 0;
            expect(ReportUtils.shouldDisableThread(reportAction, reportID)).toBeTruthy();
        });

        it('should disable on archived reports and not-thread actions', () => {
            Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {
                statusNum: CONST.REPORT.STATUS_NUM.CLOSED,
                stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            })
                .then(() => waitForBatchedUpdates())
                .then(() => {
                    const reportAction = {
                        childVisibleActionCount: 1,
                    } as ReportAction;
                    expect(ReportUtils.shouldDisableThread(reportAction, reportID)).toBeFalsy();

                    reportAction.childVisibleActionCount = 0;
                    expect(ReportUtils.shouldDisableThread(reportAction, reportID)).toBeTruthy();
                });
        });

        it("should disable on a whisper action and it's neither a report preview nor IOU action", () => {
            const reportAction = {
                actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIEDEXPENSE,
                whisperedToAccountIDs: [123456],
            } as ReportAction;
            expect(ReportUtils.shouldDisableThread(reportAction, reportID)).toBeTruthy();
        });

        it('should disable on thread first chat', () => {
            const reportAction = {
                childReportID: reportID,
            } as ReportAction;
            expect(ReportUtils.shouldDisableThread(reportAction, reportID)).toBeTruthy();
        });
    });

    describe('getAllAncestorReportActions', () => {
        const reports: Report[] = [
            {reportID: '1', lastReadTime: '2024-02-01 04:56:47.233', reportName: 'Report'},
            {reportID: '2', lastReadTime: '2024-02-01 04:56:47.233', parentReportActionID: '1', parentReportID: '1', reportName: 'Report'},
            {reportID: '3', lastReadTime: '2024-02-01 04:56:47.233', parentReportActionID: '2', parentReportID: '2', reportName: 'Report'},
            {reportID: '4', lastReadTime: '2024-02-01 04:56:47.233', parentReportActionID: '3', parentReportID: '3', reportName: 'Report'},
            {reportID: '5', lastReadTime: '2024-02-01 04:56:47.233', parentReportActionID: '4', parentReportID: '4', reportName: 'Report'},
        ];

        const reportActions: ReportAction[] = [
            {reportActionID: '1', created: '2024-02-01 04:42:22.965', actionName: 'MARKEDREIMBURSED'},
            {reportActionID: '2', created: '2024-02-01 04:42:28.003', actionName: 'MARKEDREIMBURSED'},
            {reportActionID: '3', created: '2024-02-01 04:42:31.742', actionName: 'MARKEDREIMBURSED'},
            {reportActionID: '4', created: '2024-02-01 04:42:35.619', actionName: 'MARKEDREIMBURSED'},
        ];

        beforeAll(() => {
            const reportCollectionDataSet = toCollectionDataSet(ONYXKEYS.COLLECTION.REPORT, reports, (report) => report.reportID);
            const reportActionCollectionDataSet = toCollectionDataSet(
                ONYXKEYS.COLLECTION.REPORT_ACTIONS,
                reportActions.map((reportAction) => ({[reportAction.reportActionID]: reportAction})),
                (actions) => Object.values(actions)[0].reportActionID,
            );
            Onyx.multiSet({
                ...reportCollectionDataSet,
                ...reportActionCollectionDataSet,
            });
            return waitForBatchedUpdates();
        });

        afterAll(() => Onyx.clear());

        it('should return correctly all ancestors of a thread report', () => {
            const resultAncestors = [
                {report: reports[1], reportAction: reportActions[0], shouldDisplayNewMarker: false},
                {report: reports[2], reportAction: reportActions[1], shouldDisplayNewMarker: false},
                {report: reports[3], reportAction: reportActions[2], shouldDisplayNewMarker: false},
                {report: reports[4], reportAction: reportActions[3], shouldDisplayNewMarker: false},
            ];

            expect(ReportUtils.getAllAncestorReportActions(reports[4])).toEqual(resultAncestors);
        });
    });
});
