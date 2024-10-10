/* eslint-disable @typescript-eslint/naming-convention */
import {addDays, format as formatDate} from 'date-fns';
import type {OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import DateUtils from '@libs/DateUtils';
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
    type: CONST.POLICY.TYPE.TEAM,
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

            expect(participants.at(0)?.source).toBeInstanceOf(Function);
            expect(participants.at(0)?.name).toBe('(833) 240-3627');
            expect(participants.at(0)?.id).toBe(4);
            expect(participants.at(0)?.type).toBe('avatar');

            expect(participants.at(1)?.source).toBeInstanceOf(Function);
            expect(participants.at(1)?.name).toBe('floki@vikings.net');
            expect(participants.at(1)?.id).toBe(2);
            expect(participants.at(1)?.type).toBe('avatar');
        });
    });

    describe('getDisplayNamesWithTooltips', () => {
        test('withSingleParticipantReport', () => {
            const participants = ReportUtils.getDisplayNamesWithTooltips(participantsPersonalDetails, false);
            expect(participants).toHaveLength(5);

            expect(participants.at(0)?.displayName).toBe('(833) 240-3627');
            expect(participants.at(0)?.login).toBe('+18332403627@expensify.sms');

            expect(participants.at(2)?.displayName).toBe('Lagertha Lothbrok');
            expect(participants.at(2)?.login).toBe('lagertha@vikings.net');
            expect(participants.at(2)?.accountID).toBe(3);
            expect(participants.at(2)?.pronouns).toBe('She/her');

            expect(participants.at(4)?.displayName).toBe('Ragnar Lothbrok');
            expect(participants.at(4)?.login).toBe('ragnar@vikings.net');
            expect(participants.at(4)?.accountID).toBe(1);
            expect(participants.at(4)?.pronouns).toBeUndefined();
        });
    });

    describe('getReportName', () => {
        describe('1:1 DM', () => {
            test('with displayName', () => {
                expect(
                    ReportUtils.getReportName({
                        reportID: '',
                        participants: ReportUtils.buildParticipantsFromAccountIDs([currentUserAccountID, 1]),
                    }),
                ).toBe('Ragnar Lothbrok');
            });

            test('no displayName', () => {
                expect(
                    ReportUtils.getReportName({
                        reportID: '',
                        participants: ReportUtils.buildParticipantsFromAccountIDs([currentUserAccountID, 2]),
                    }),
                ).toBe('floki@vikings.net');
            });

            test('SMS', () => {
                expect(
                    ReportUtils.getReportName({
                        reportID: '',
                        participants: ReportUtils.buildParticipantsFromAccountIDs([currentUserAccountID, 4]),
                    }),
                ).toBe('(833) 240-3627');
            });
        });

        test('Group DM', () => {
            expect(
                ReportUtils.getReportName({
                    reportID: '',
                    participants: ReportUtils.buildParticipantsFromAccountIDs([currentUserAccountID, 1, 2, 3, 4]),
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
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    private_isArchived: DateUtils.getDBTime(),
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
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    private_isArchived: DateUtils.getDBTime(),
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
                    // eslint-disable-next-line @typescript-eslint/naming-convention
                    private_isArchived: DateUtils.getDBTime(),
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

        describe('ParentReportAction is', () => {
            test('Manually Submitted Report Action', () => {
                const threadOfSubmittedReportAction = {
                    ...LHNTestUtils.getFakeReport(),
                    type: CONST.REPORT.TYPE.EXPENSE,
                    stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                    statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                    parentReportID: '101',
                    policyID: policy.id,
                };
                const submittedParentReportAction = {
                    actionName: CONST.REPORT.ACTIONS.TYPE.SUBMITTED,
                    originalMessage: {
                        amount: 169,
                        currency: 'USD',
                    },
                } as ReportAction;

                expect(ReportUtils.getReportName(threadOfSubmittedReportAction, policy, submittedParentReportAction)).toBe('submitted $1.69');
            });
        });
    });

    describe('requiresAttentionFromCurrentUser', () => {
        afterEach(async () => {
            await Onyx.clear();
            await Onyx.set(ONYXKEYS.SESSION, {email: currentUserEmail, accountID: currentUserAccountID});
        });

        it('returns false when there is no report', () => {
            expect(ReportUtils.requiresAttentionFromCurrentUser(undefined)).toBe(false);
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

        it('returns false when the report has no outstanding IOU but is waiting for a bank account and the logged user is not the report owner', () => {
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

        it('returns true when the report has outstanding child expense', () => {
            const report = {
                ...LHNTestUtils.getFakeReport(),
                ownerAccountID: 99,
                hasOutstandingChildRequest: true,
                isWaitingOnBankAccount: false,
            };
            expect(ReportUtils.requiresAttentionFromCurrentUser(report)).toBe(true);
        });

        it('returns false if the user is not on free trial', async () => {
            await Onyx.multiSet({
                [ONYXKEYS.NVP_LAST_DAY_FREE_TRIAL]: null, // not on free trial
                [ONYXKEYS.NVP_BILLING_FUND_ID]: null, // no payment card added
            });

            const report: Report = {
                ...LHNTestUtils.getFakeReport(),
                chatType: CONST.REPORT.CHAT_TYPE.SYSTEM,
            };

            expect(ReportUtils.requiresAttentionFromCurrentUser(report)).toBe(false);
        });

        it("returns false if the user free trial hasn't ended yet", async () => {
            await Onyx.multiSet({
                [ONYXKEYS.NVP_LAST_DAY_FREE_TRIAL]: formatDate(addDays(new Date(), 1), CONST.DATE.FNS_DATE_TIME_FORMAT_STRING), // trial not ended
                [ONYXKEYS.NVP_BILLING_FUND_ID]: null, // no payment card added
            });

            const report: Report = {
                ...LHNTestUtils.getFakeReport(),
                chatType: CONST.REPORT.CHAT_TYPE.SYSTEM,
            };

            expect(ReportUtils.requiresAttentionFromCurrentUser(report)).toBe(false);
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
                    const moneyRequestOptions = ReportUtils.temporary_getMoneyRequestOptions(undefined, undefined, [currentUserAccountID, accountID]);
                    return moneyRequestOptions.length === 0;
                });
                expect(allEmpty).toBe(true);
            });

            it('it is a room with no participants except self', () => {
                const report = {
                    ...LHNTestUtils.getFakeReport(),
                    chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
                };
                const moneyRequestOptions = ReportUtils.temporary_getMoneyRequestOptions(report, undefined, [currentUserAccountID]);
                expect(moneyRequestOptions.length).toBe(0);
            });

            it('its not your policy expense chat', () => {
                const report = {
                    ...LHNTestUtils.getFakeReport(),
                    chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                    isOwnPolicyExpenseChat: false,
                };
                const moneyRequestOptions = ReportUtils.temporary_getMoneyRequestOptions(report, undefined, [currentUserAccountID]);
                expect(moneyRequestOptions.length).toBe(0);
            });

            it('its paid IOU report', () => {
                const report = {
                    ...LHNTestUtils.getFakeReport(),
                    type: CONST.REPORT.TYPE.IOU,
                    statusNum: CONST.REPORT.STATUS_NUM.REIMBURSED,
                };
                const moneyRequestOptions = ReportUtils.temporary_getMoneyRequestOptions(report, undefined, [currentUserAccountID]);
                expect(moneyRequestOptions.length).toBe(0);
            });

            it('its approved Expense report', () => {
                const report = {
                    ...LHNTestUtils.getFakeReport(),
                    type: CONST.REPORT.TYPE.EXPENSE,
                    stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                    statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
                };
                const moneyRequestOptions = ReportUtils.temporary_getMoneyRequestOptions(report, undefined, [currentUserAccountID]);
                expect(moneyRequestOptions.length).toBe(0);
            });

            it('its paid Expense report', () => {
                const report = {
                    ...LHNTestUtils.getFakeReport(),
                    type: CONST.REPORT.TYPE.EXPENSE,
                    statusNum: CONST.REPORT.STATUS_NUM.REIMBURSED,
                };
                const moneyRequestOptions = ReportUtils.temporary_getMoneyRequestOptions(report, undefined, [currentUserAccountID]);
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
                    const moneyRequestOptions = ReportUtils.temporary_getMoneyRequestOptions(report, undefined, [currentUserAccountID]);
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
                    const moneyRequestOptions = ReportUtils.temporary_getMoneyRequestOptions(report, paidPolicy, [currentUserAccountID, participantsAccountIDs.at(0)]);
                    expect(moneyRequestOptions.length).toBe(0);
                });
            });
        });

        describe('return only iou split option if', () => {
            it('it is a chat room with more than one participant that is not an announce room', () => {
                const onlyHaveSplitOption = [CONST.REPORT.CHAT_TYPE.POLICY_ADMINS, CONST.REPORT.CHAT_TYPE.DOMAIN_ALL, CONST.REPORT.CHAT_TYPE.POLICY_ROOM].every((chatType) => {
                    const report = {
                        ...LHNTestUtils.getFakeReport(),
                        chatType,
                    };
                    const moneyRequestOptions = ReportUtils.temporary_getMoneyRequestOptions(report, undefined, [currentUserAccountID, participantsAccountIDs.at(0)]);
                    return moneyRequestOptions.length === 1 && moneyRequestOptions.includes(CONST.IOU.TYPE.SPLIT);
                });
                expect(onlyHaveSplitOption).toBe(true);
            });

            it('has multiple participants excluding self', () => {
                const report = {
                    ...LHNTestUtils.getFakeReport(),
                    chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
                };
                const moneyRequestOptions = ReportUtils.temporary_getMoneyRequestOptions(report, undefined, [currentUserAccountID, ...participantsAccountIDs]);
                expect(moneyRequestOptions.length).toBe(1);
                expect(moneyRequestOptions.includes(CONST.IOU.TYPE.SPLIT)).toBe(true);
            });

            it('user has pay expense permission', () => {
                const report = {
                    ...LHNTestUtils.getFakeReport(),
                    chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
                };
                const moneyRequestOptions = ReportUtils.temporary_getMoneyRequestOptions(report, undefined, [currentUserAccountID, ...participantsAccountIDs]);
                expect(moneyRequestOptions.length).toBe(1);
                expect(moneyRequestOptions.includes(CONST.IOU.TYPE.SPLIT)).toBe(true);
            });

            it("it's a group DM report", () => {
                const report = {
                    ...LHNTestUtils.getFakeReport(),
                    type: CONST.REPORT.TYPE.CHAT,
                    participantsAccountIDs: [currentUserAccountID, ...participantsAccountIDs],
                };
                const moneyRequestOptions = ReportUtils.temporary_getMoneyRequestOptions(report, undefined, [currentUserAccountID, ...participantsAccountIDs.map(Number)]);
                expect(moneyRequestOptions.length).toBe(1);
                expect(moneyRequestOptions.includes(CONST.IOU.TYPE.SPLIT)).toBe(true);
            });
        });

        describe('return only submit expense option if', () => {
            it('it is an IOU report in submitted state', () => {
                const report = {
                    ...LHNTestUtils.getFakeReport(),
                    type: CONST.REPORT.TYPE.IOU,
                    stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                    statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                    managerID: currentUserAccountID,
                };
                const moneyRequestOptions = ReportUtils.temporary_getMoneyRequestOptions(report, undefined, [currentUserAccountID, participantsAccountIDs.at(0)]);
                expect(moneyRequestOptions.length).toBe(1);
                expect(moneyRequestOptions.includes(CONST.IOU.TYPE.SUBMIT)).toBe(true);
            });

            it('it is an IOU report in submitted state even with pay expense permissions', () => {
                const report = {
                    ...LHNTestUtils.getFakeReport(),
                    type: CONST.REPORT.TYPE.IOU,
                    stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                    statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                    managerID: currentUserAccountID,
                };
                const moneyRequestOptions = ReportUtils.temporary_getMoneyRequestOptions(report, undefined, [currentUserAccountID, participantsAccountIDs.at(0)]);
                expect(moneyRequestOptions.length).toBe(1);
                expect(moneyRequestOptions.includes(CONST.IOU.TYPE.SUBMIT)).toBe(true);
            });
        });

        describe('return only submit expense and track expense options if', () => {
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
                        managerID: currentUserAccountID,
                    };
                    const moneyRequestOptions = ReportUtils.temporary_getMoneyRequestOptions(report, undefined, [currentUserAccountID]);
                    expect(moneyRequestOptions.length).toBe(2);
                    expect(moneyRequestOptions.includes(CONST.IOU.TYPE.SUBMIT)).toBe(true);
                    expect(moneyRequestOptions.includes(CONST.IOU.TYPE.TRACK)).toBe(true);
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
                        managerID: currentUserAccountID,
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
                    const moneyRequestOptions = ReportUtils.temporary_getMoneyRequestOptions(report, paidPolicy, [currentUserAccountID, participantsAccountIDs.at(0)]);
                    expect(moneyRequestOptions.length).toBe(2);
                    expect(moneyRequestOptions.includes(CONST.IOU.TYPE.SUBMIT)).toBe(true);
                    expect(moneyRequestOptions.includes(CONST.IOU.TYPE.TRACK)).toBe(true);
                });
            });

            it('it is an IOU report in submitted state', () => {
                const report = {
                    ...LHNTestUtils.getFakeReport(),
                    type: CONST.REPORT.TYPE.IOU,
                    stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                    statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                    managerID: currentUserAccountID,
                };
                const moneyRequestOptions = ReportUtils.temporary_getMoneyRequestOptions(report, undefined, [currentUserAccountID, participantsAccountIDs.at(0)]);
                expect(moneyRequestOptions.length).toBe(1);
                expect(moneyRequestOptions.includes(CONST.IOU.TYPE.SUBMIT)).toBe(true);
            });

            it('it is an IOU report in submitted state even with pay expense permissions', () => {
                const report = {
                    ...LHNTestUtils.getFakeReport(),
                    type: CONST.REPORT.TYPE.IOU,
                    stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                    statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                    managerID: currentUserAccountID,
                };
                const moneyRequestOptions = ReportUtils.temporary_getMoneyRequestOptions(report, undefined, [currentUserAccountID, participantsAccountIDs.at(0)]);
                expect(moneyRequestOptions.length).toBe(1);
                expect(moneyRequestOptions.includes(CONST.IOU.TYPE.SUBMIT)).toBe(true);
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
                        managerID: currentUserAccountID,
                    };
                    const moneyRequestOptions = ReportUtils.temporary_getMoneyRequestOptions(report, paidPolicy, [currentUserAccountID, participantsAccountIDs.at(0)]);
                    expect(moneyRequestOptions.length).toBe(2);
                    expect(moneyRequestOptions.includes(CONST.IOU.TYPE.SUBMIT)).toBe(true);
                    expect(moneyRequestOptions.includes(CONST.IOU.TYPE.TRACK)).toBe(true);
                });
            });
        });

        describe('return multiple expense options if', () => {
            it('it is a 1:1 DM', () => {
                const report = {
                    ...LHNTestUtils.getFakeReport(),
                    type: CONST.REPORT.TYPE.CHAT,
                };
                const moneyRequestOptions = ReportUtils.temporary_getMoneyRequestOptions(report, undefined, [currentUserAccountID, participantsAccountIDs.at(0)]);
                expect(moneyRequestOptions.length).toBe(3);
                expect(moneyRequestOptions.includes(CONST.IOU.TYPE.SPLIT)).toBe(true);
                expect(moneyRequestOptions.includes(CONST.IOU.TYPE.SUBMIT)).toBe(true);
                expect(moneyRequestOptions.includes(CONST.IOU.TYPE.PAY)).toBe(true);
            });

            it("it is user's own policy expense chat", () => {
                const report = {
                    ...LHNTestUtils.getFakeReport(),
                    chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                    isOwnPolicyExpenseChat: true,
                    managerID: currentUserAccountID,
                };
                const moneyRequestOptions = ReportUtils.temporary_getMoneyRequestOptions(report, undefined, [currentUserAccountID, ...participantsAccountIDs]);
                expect(moneyRequestOptions.length).toBe(3);
                expect(moneyRequestOptions.includes(CONST.IOU.TYPE.SUBMIT)).toBe(true);
                expect(moneyRequestOptions.includes(CONST.IOU.TYPE.SPLIT)).toBe(true);
                expect(moneyRequestOptions.includes(CONST.IOU.TYPE.TRACK)).toBe(true);
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

    describe('getMostRecentlyVisitedReport', () => {
        it('should filter out report without reportID & lastReadTime and return the most recently visited report', () => {
            const reports: Array<OnyxEntry<Report>> = [
                {reportID: '1', lastReadTime: '2023-07-08 07:15:44.030'},
                {reportID: '2', lastReadTime: undefined},
                {reportID: '3', lastReadTime: '2023-07-06 07:15:44.030'},
                {reportID: '4', lastReadTime: '2023-07-07 07:15:44.030', type: CONST.REPORT.TYPE.IOU},
                {lastReadTime: '2023-07-09 07:15:44.030'} as Report,
                {reportID: '6'},
                undefined,
            ];
            const latestReport: OnyxEntry<Report> = {reportID: '1', lastReadTime: '2023-07-08 07:15:44.030'};
            expect(ReportUtils.getMostRecentlyVisitedReport(reports, undefined)).toEqual(latestReport);
        });
    });

    describe('shouldDisableThread', () => {
        const reportID = '1';

        it('should disable on thread-disabled actions', () => {
            const reportAction = ReportUtils.buildOptimisticCreatedReportAction('email1@test.com');
            expect(ReportUtils.shouldDisableThread(reportAction, reportID)).toBeTruthy();
        });

        it('should disable thread on split expense actions', () => {
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
                actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
                originalMessage: {
                    whisperedTo: [123456],
                },
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
                (actions) => Object.values(actions).at(0)?.reportActionID,
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
                {report: reports.at(0), reportAction: reportActions.at(0), shouldDisplayNewMarker: false},
                {report: reports.at(1), reportAction: reportActions.at(1), shouldDisplayNewMarker: false},
                {report: reports.at(2), reportAction: reportActions.at(2), shouldDisplayNewMarker: false},
                {report: reports.at(3), reportAction: reportActions.at(3), shouldDisplayNewMarker: false},
            ];

            expect(ReportUtils.getAllAncestorReportActions(reports.at(4))).toEqual(resultAncestors);
        });
    });

    describe('isChatUsedForOnboarding', () => {
        afterEach(async () => {
            await Onyx.clear();
            await Onyx.set(ONYXKEYS.SESSION, {email: currentUserEmail, accountID: currentUserAccountID});
        });

        it('should return false if the report is neither the system or concierge chat', () => {
            expect(ReportUtils.isChatUsedForOnboarding(LHNTestUtils.getFakeReport())).toBeFalsy();
        });

        it('should return false if the user account ID is odd and report is the system chat - only the Concierge chat chat should be the onboarding chat for users without the onboarding NVP', async () => {
            const accountID = 1;

            await Onyx.multiSet({
                [ONYXKEYS.PERSONAL_DETAILS_LIST]: {
                    [accountID]: {
                        accountID,
                    },
                },
                [ONYXKEYS.SESSION]: {email: currentUserEmail, accountID},
            });

            const report: Report = {
                ...LHNTestUtils.getFakeReport(),
                chatType: CONST.REPORT.CHAT_TYPE.SYSTEM,
            };

            expect(ReportUtils.isChatUsedForOnboarding(report)).toBeFalsy();
        });

        it('should return true if the user account ID is even and report is the concierge chat', async () => {
            const accountID = 2;

            await Onyx.multiSet({
                [ONYXKEYS.PERSONAL_DETAILS_LIST]: {
                    [accountID]: {
                        accountID,
                    },
                },
                [ONYXKEYS.SESSION]: {email: currentUserEmail, accountID},
            });

            const report: Report = {
                ...LHNTestUtils.getFakeReport([accountID, CONST.ACCOUNT_ID.CONCIERGE]),
            };

            expect(ReportUtils.isChatUsedForOnboarding(report)).toBeTruthy();
        });

        it("should use the report id from the onboarding NVP if it's set", async () => {
            const reportID = '8010';

            await Onyx.multiSet({
                [ONYXKEYS.NVP_ONBOARDING]: {chatReportID: reportID, hasCompletedGuidedSetupFlow: true},
            });

            const report1: Report = {
                ...LHNTestUtils.getFakeReport(),
                reportID,
            };
            expect(ReportUtils.isChatUsedForOnboarding(report1)).toBeTruthy();

            const report2: Report = {
                ...LHNTestUtils.getFakeReport(),
                reportID: '8011',
            };
            expect(ReportUtils.isChatUsedForOnboarding(report2)).toBeFalsy();
        });
    });

    describe('getChatByParticipants', () => {
        const userAccountID = 1;
        const userAccountID2 = 2;
        let oneOnOneChatReport: Report;
        let groupChatReport: Report;

        beforeAll(() => {
            const invoiceReport: Report = {
                reportID: '1',
                type: CONST.REPORT.TYPE.INVOICE,
                participants: {
                    [userAccountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                    [currentUserAccountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                },
            };
            const taskReport: Report = {
                reportID: '2',
                type: CONST.REPORT.TYPE.TASK,
                participants: {
                    [userAccountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                    [currentUserAccountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                },
            };
            const iouReport: Report = {
                reportID: '3',
                type: CONST.REPORT.TYPE.IOU,
                participants: {
                    [userAccountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                    [currentUserAccountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                },
            };
            groupChatReport = {
                reportID: '4',
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.GROUP,
                participants: {
                    [userAccountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                    [userAccountID2]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                    [currentUserAccountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                },
            };
            oneOnOneChatReport = {
                reportID: '5',
                type: CONST.REPORT.TYPE.CHAT,
                participants: {
                    [userAccountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                    [currentUserAccountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                },
            };
            const reportCollectionDataSet = toCollectionDataSet(
                ONYXKEYS.COLLECTION.REPORT,
                [invoiceReport, taskReport, iouReport, groupChatReport, oneOnOneChatReport],
                (item) => item.reportID,
            );
            return Onyx.mergeCollection(ONYXKEYS.COLLECTION.REPORT, reportCollectionDataSet);
        });
        it('should return the 1:1 chat', () => {
            const report = ReportUtils.getChatByParticipants([currentUserAccountID, userAccountID]);
            expect(report?.reportID).toEqual(oneOnOneChatReport.reportID);
        });

        it('should return the group chat', () => {
            const report = ReportUtils.getChatByParticipants([currentUserAccountID, userAccountID, userAccountID2], undefined, true);
            expect(report?.reportID).toEqual(groupChatReport.reportID);
        });

        it('should return undefined when no report is found', () => {
            const report = ReportUtils.getChatByParticipants([currentUserAccountID, userAccountID2], undefined);
            expect(report).toEqual(undefined);
        });
    });
});
