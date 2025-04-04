/* eslint-disable @typescript-eslint/naming-convention */
import {addDays, format as formatDate} from 'date-fns';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import DateUtils from '@libs/DateUtils';
import {translateLocal} from '@libs/Localize';
import {
    buildOptimisticChatReport,
    buildOptimisticCreatedReportAction,
    buildOptimisticExpenseReport,
    buildOptimisticIOUReportAction,
    buildParticipantsFromAccountIDs,
    buildTransactionThread,
    canDeleteReportAction,
    canEditWriteCapability,
    findLastAccessedReport,
    getAllAncestorReportActions,
    getApprovalChain,
    getChatByParticipants,
    getDefaultWorkspaceAvatar,
    getDisplayNamesWithTooltips,
    getGroupChatName,
    getIconsForParticipants,
    getInvoiceChatByParticipants,
    getMostRecentlyVisitedReport,
    getPolicyExpenseChat,
    getQuickActionDetails,
    getReportIDFromLink,
    getReportName,
    getWorkspaceIcon,
    getWorkspaceNameUpdatedMessage,
    isAllowedToApproveExpenseReport,
    isChatUsedForOnboarding,
    requiresAttentionFromCurrentUser,
    shouldDisableThread,
    shouldReportBeInOptionList,
    temporary_getMoneyRequestOptions,
} from '@libs/ReportUtils';
import {buildOptimisticTransaction} from '@libs/TransactionUtils';
import initOnyxDerivedValues from '@userActions/OnyxDerived';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Beta, PersonalDetailsList, Policy, PolicyEmployeeList, Report, ReportAction, Transaction} from '@src/types/onyx';
import {toCollectionDataSet} from '@src/types/utils/CollectionDataSet';
import * as NumberUtils from '../../src/libs/NumberUtils';
import {convertedInvoiceChat} from '../data/Invoice';
import createRandomPolicy from '../utils/collections/policies';
import createRandomReport from '../utils/collections/reports';
import createRandomTransaction from '../utils/collections/transaction';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import {fakePersonalDetails} from '../utils/LHNTestUtils';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

// Be sure to include the mocked permissions library or else the beta tests won't work
jest.mock('@libs/Permissions');

const testDate = DateUtils.getDBTime();
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

const employeeList: PolicyEmployeeList = {
    'owner@test.com': {
        email: 'owner@test.com',
        role: 'admin',
        submitsTo: '',
    },
    'admin@test.com': {
        email: 'admin@test.com',
        role: 'admin',
        submitsTo: '',
    },
    'employee@test.com': {
        email: 'employee@test.com',
        role: 'user',
        submitsTo: 'admin@test.com',
    },
    'categoryapprover1@test.com': {
        email: 'categoryapprover1@test.com',
        role: 'user',
        submitsTo: 'admin@test.com',
    },
    'categoryapprover2@test.com': {
        email: 'categoryapprover2@test.com',
        role: 'user',
        submitsTo: 'admin@test.com',
    },
    'tagapprover1@test.com': {
        email: 'tagapprover1@test.com',
        role: 'user',
        submitsTo: 'admin@test.com',
    },
    'tagapprover2@test.com': {
        email: 'tagapprover2@test.com',
        role: 'user',
        submitsTo: 'admin@test.com',
    },
};

const personalDetails: PersonalDetailsList = {
    '1': {
        accountID: 1,
        login: 'admin@test.com',
    },
    '2': {
        accountID: 2,
        login: 'employee@test.com',
    },
    '3': {
        accountID: 3,
        login: 'categoryapprover1@test.com',
    },
    '4': {
        accountID: 4,
        login: 'categoryapprover2@test.com',
    },
    '5': {
        accountID: 5,
        login: 'tagapprover1@test.com',
    },
    '6': {
        accountID: 6,
        login: 'tagapprover2@test.com',
    },
    '7': {
        accountID: 7,
        login: 'owner@test.com',
    },
};

const rules = {
    approvalRules: [
        {
            applyWhen: [
                {
                    condition: 'matches',
                    field: 'category',
                    value: 'cat1',
                },
            ],
            approver: 'categoryapprover1@test.com',
            id: '1',
        },
        {
            applyWhen: [
                {
                    condition: 'matches',
                    field: 'tag',
                    value: 'tag1',
                },
            ],
            approver: 'tagapprover1@test.com',
            id: '2',
        },
        {
            applyWhen: [
                {
                    condition: 'matches',
                    field: 'category',
                    value: 'cat2',
                },
            ],
            approver: 'categoryapprover2@test.com',
            id: '3',
        },
        {
            applyWhen: [
                {
                    condition: 'matches',
                    field: 'tag',
                    value: 'tag2',
                },
            ],
            approver: 'tagapprover2@test.com',
            id: '4',
        },
    ],
};

const employeeAccountID = 2;
const categoryapprover1Email = 'categoryapprover1@test.com';
const categoryapprover2Email = 'categoryapprover2@test.com';
const tagapprover1Email = 'tagapprover1@test.com';
const tagapprover2Email = 'tagapprover2@test.com';

const policy: Policy = {
    id: '1',
    name: 'Vikings Policy',
    role: 'user',
    type: CONST.POLICY.TYPE.TEAM,
    owner: '',
    outputCurrency: '',
    isPolicyExpenseChatEnabled: false,
};

describe('ReportUtils', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
        initOnyxDerivedValues();

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
            const participants = getIconsForParticipants([1, 2, 3, 4, 5], participantsPersonalDetails);
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

    describe('getWorkspaceIcon', () => {
        it('should not use cached icon when avatar is updated', () => {
            // Given a new workspace and a workspace chat with undefined `policyAvatar`
            const workspace = LHNTestUtils.getFakePolicy('1', 'ws');
            const workspaceChat = LHNTestUtils.getFakeReport();
            workspaceChat.policyID = workspace.id;

            expect(getWorkspaceIcon(workspaceChat, workspace).source).toBe(getDefaultWorkspaceAvatar(workspace.name));

            // When the user uploads a new avatar
            const newAvatarURL = 'https://example.com';
            workspace.avatarURL = newAvatarURL;

            // Then it should return the new avatar
            expect(getWorkspaceIcon(workspaceChat, workspace).source).toBe(newAvatarURL);
        });
    });

    describe('getDisplayNamesWithTooltips', () => {
        test('withSingleParticipantReport', () => {
            const participants = getDisplayNamesWithTooltips(participantsPersonalDetails, false);
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
                    getReportName({
                        reportID: '',
                        participants: buildParticipantsFromAccountIDs([currentUserAccountID, 1]),
                    }),
                ).toBe('Ragnar Lothbrok');
            });

            test('no displayName', () => {
                expect(
                    getReportName({
                        reportID: '',
                        participants: buildParticipantsFromAccountIDs([currentUserAccountID, 2]),
                    }),
                ).toBe('floki@vikings.net');
            });

            test('SMS', () => {
                expect(
                    getReportName({
                        reportID: '',
                        participants: buildParticipantsFromAccountIDs([currentUserAccountID, 4]),
                    }),
                ).toBe('(833) 240-3627');
            });
        });

        test('Group DM', () => {
            expect(
                getReportName({
                    reportID: '',
                    participants: buildParticipantsFromAccountIDs([currentUserAccountID, 1, 2, 3, 4]),
                }),
            ).toBe('Ragnar, floki@vikings.net, Lagertha, (833) 240-3627');
        });

        describe('Default Policy Room', () => {
            afterEach(async () => {
                await Onyx.setCollection(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS, {});
            });

            const baseAdminsRoom = {
                reportID: '',
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_ADMINS,
                reportName: '#admins',
            };

            const reportNameValuePairs = {
                private_isArchived: DateUtils.getDBTime(),
            };

            test('Active', () => {
                expect(getReportName(baseAdminsRoom)).toBe('#admins');
            });

            test('Archived', async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${baseAdminsRoom.reportID}`, reportNameValuePairs);

                expect(getReportName(baseAdminsRoom)).toBe('#admins (archived)');

                return Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.ES).then(() => expect(getReportName(baseAdminsRoom)).toBe('#admins (archivado)'));
            });
        });

        describe('User-Created Policy Room', () => {
            afterEach(async () => {
                await Onyx.setCollection(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS, {});
            });

            const baseUserCreatedRoom = {
                reportID: '',
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
                reportName: '#VikingsChat',
            };

            const reportNameValuePairs = {
                private_isArchived: DateUtils.getDBTime(),
            };

            test('Active', () => {
                expect(getReportName(baseUserCreatedRoom)).toBe('#VikingsChat');
            });

            test('Archived', async () => {
                const archivedPolicyRoom = {
                    ...baseUserCreatedRoom,
                };

                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${baseUserCreatedRoom.reportID}`, reportNameValuePairs);

                expect(getReportName(archivedPolicyRoom)).toBe('#VikingsChat (archived)');

                return Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.ES).then(() => expect(getReportName(archivedPolicyRoom)).toBe('#VikingsChat (archivado)'));
            });
        });

        describe('PolicyExpenseChat', () => {
            describe('Active', () => {
                test('as member', () => {
                    expect(
                        getReportName({
                            reportID: '',
                            chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                            policyID: policy.id,
                            isOwnPolicyExpenseChat: true,
                            ownerAccountID: 1,
                        }),
                    ).toBe(`Ragnar Lothbrok's expenses`);
                });

                test('as admin', () => {
                    expect(
                        getReportName({
                            reportID: '',
                            chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                            policyID: policy.id,
                            isOwnPolicyExpenseChat: false,
                            ownerAccountID: 1,
                        }),
                    ).toBe(`Ragnar Lothbrok's expenses`);
                });
            });

            describe('Archived', () => {
                const baseArchivedPolicyExpenseChat = {
                    reportID: '',
                    chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                    ownerAccountID: 1,
                    policyID: policy.id,
                    oldPolicyName: policy.name,
                };

                const reportNameValuePairs = {
                    private_isArchived: DateUtils.getDBTime(),
                };

                test('as member', async () => {
                    const memberArchivedPolicyExpenseChat = {
                        ...baseArchivedPolicyExpenseChat,
                        isOwnPolicyExpenseChat: true,
                    };

                    await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${baseArchivedPolicyExpenseChat.reportID}`, reportNameValuePairs);

                    expect(getReportName(memberArchivedPolicyExpenseChat)).toBe(`Ragnar Lothbrok's expenses (archived)`);

                    return Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.ES).then(() =>
                        expect(getReportName(memberArchivedPolicyExpenseChat)).toBe(`Ragnar Lothbrok's gastos (archivado)`),
                    );
                });

                test('as admin', async () => {
                    const adminArchivedPolicyExpenseChat = {
                        ...baseArchivedPolicyExpenseChat,
                        isOwnPolicyExpenseChat: false,
                    };

                    expect(getReportName(adminArchivedPolicyExpenseChat)).toBe(`Ragnar Lothbrok's expenses (archived)`);

                    return Onyx.set(ONYXKEYS.NVP_PREFERRED_LOCALE, CONST.LOCALES.ES).then(() =>
                        expect(getReportName(adminArchivedPolicyExpenseChat)).toBe(`Ragnar Lothbrok's gastos (archivado)`),
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

                expect(getReportName(threadOfSubmittedReportAction, policy, submittedParentReportAction)).toBe('submitted $1.69');
            });

            test('Invited/Removed Room Member Action', () => {
                const threadOfRemovedRoomMemberAction = {
                    ...LHNTestUtils.getFakeReport(),
                    type: CONST.REPORT.TYPE.CHAT,
                    chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
                    parentReportID: '101',
                    parentReportActionID: '102',
                    policyID: policy.id,
                };
                const removedParentReportAction = {
                    actionName: CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.REMOVE_FROM_ROOM,
                    originalMessage: {
                        targetAccountIDs: [1],
                    },
                } as ReportAction;

                expect(getReportName(threadOfRemovedRoomMemberAction, policy, removedParentReportAction)).toBe('removed ragnar@vikings.net');
            });
        });

        describe('Task Report', () => {
            const htmlTaskTitle = `<h1>heading with <a href="https://www.unknown.com" target="_blank" rel="noreferrer noopener">link</a></h1>`;

            it('Should return the text extracted from report name html', () => {
                const report: Report = {...createRandomReport(1), type: 'task'};
                expect(getReportName({...report, reportName: htmlTaskTitle})).toEqual('heading with link');
            });

            it('Should return deleted task translations when task is is deleted', () => {
                const report: Report = {...createRandomReport(1), type: 'task', isDeletedParentAction: true};
                expect(getReportName({...report, reportName: htmlTaskTitle})).toEqual(translateLocal('parentReportAction.deletedTask'));
            });
        });
    });

    describe('requiresAttentionFromCurrentUser', () => {
        afterEach(async () => {
            await Onyx.clear();
            await Onyx.set(ONYXKEYS.SESSION, {email: currentUserEmail, accountID: currentUserAccountID});
        });

        it('returns false when there is no report', () => {
            expect(requiresAttentionFromCurrentUser(undefined)).toBe(false);
        });

        it('returns false when the matched IOU report does not have an owner accountID', () => {
            const report = {
                ...LHNTestUtils.getFakeReport(),
                ownerAccountID: undefined,
            };
            expect(requiresAttentionFromCurrentUser(report)).toBe(false);
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
                expect(requiresAttentionFromCurrentUser(report)).toBe(false);
            });
        });

        it('returns false when the report has no outstanding IOU but is waiting for a bank account and the logged user is the report owner', () => {
            const report = {
                ...LHNTestUtils.getFakeReport(),
                ownerAccountID: currentUserAccountID,
                isWaitingOnBankAccount: true,
            };
            expect(requiresAttentionFromCurrentUser(report)).toBe(false);
        });

        it('returns false when the report has outstanding IOU and is not waiting for a bank account and the logged user is the report owner', () => {
            const report = {
                ...LHNTestUtils.getFakeReport(),
                ownerAccountID: currentUserAccountID,
                isWaitingOnBankAccount: false,
            };
            expect(requiresAttentionFromCurrentUser(report)).toBe(false);
        });

        it('returns false when the report has no outstanding IOU but is waiting for a bank account and the logged user is not the report owner', () => {
            const report = {
                ...LHNTestUtils.getFakeReport(),
                ownerAccountID: 97,
                isWaitingOnBankAccount: true,
            };
            expect(requiresAttentionFromCurrentUser(report)).toBe(false);
        });

        it('returns true when the report has an unread mention', () => {
            const report = {
                ...LHNTestUtils.getFakeReport(),
                isUnreadWithMention: true,
            };
            expect(requiresAttentionFromCurrentUser(report)).toBe(true);
        });

        it('returns true when the report is an outstanding task', () => {
            const report = {
                ...LHNTestUtils.getFakeReport(),
                type: CONST.REPORT.TYPE.TASK,
                managerID: currentUserAccountID,
                isUnreadWithMention: false,
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                hasParentAccess: false,
            };
            expect(requiresAttentionFromCurrentUser(report)).toBe(true);
        });

        it('returns true when the report has outstanding child expense', () => {
            const report = {
                ...LHNTestUtils.getFakeReport(),
                ownerAccountID: 99,
                hasOutstandingChildRequest: true,
                isWaitingOnBankAccount: false,
            };
            expect(requiresAttentionFromCurrentUser(report)).toBe(true);
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

            expect(requiresAttentionFromCurrentUser(report)).toBe(false);
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

            expect(requiresAttentionFromCurrentUser(report)).toBe(false);
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
                    const moneyRequestOptions = temporary_getMoneyRequestOptions(undefined, undefined, [currentUserAccountID, accountID]);
                    return moneyRequestOptions.length === 0;
                });
                expect(allEmpty).toBe(true);
            });

            it('it is a room with no participants except self', () => {
                const report = {
                    ...LHNTestUtils.getFakeReport(),
                    chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
                };
                const moneyRequestOptions = temporary_getMoneyRequestOptions(report, undefined, [currentUserAccountID]);
                expect(moneyRequestOptions.length).toBe(0);
            });

            it('its not your policy expense chat', () => {
                const report = {
                    ...LHNTestUtils.getFakeReport(),
                    chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                    isOwnPolicyExpenseChat: false,
                };
                const moneyRequestOptions = temporary_getMoneyRequestOptions(report, undefined, [currentUserAccountID]);
                expect(moneyRequestOptions.length).toBe(0);
            });

            it('its paid IOU report', () => {
                const report = {
                    ...LHNTestUtils.getFakeReport(),
                    type: CONST.REPORT.TYPE.IOU,
                    statusNum: CONST.REPORT.STATUS_NUM.REIMBURSED,
                };
                const moneyRequestOptions = temporary_getMoneyRequestOptions(report, undefined, [currentUserAccountID]);
                expect(moneyRequestOptions.length).toBe(0);
            });

            it('its approved Expense report', () => {
                const report = {
                    ...LHNTestUtils.getFakeReport(),
                    type: CONST.REPORT.TYPE.EXPENSE,
                    stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                    statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
                };
                const moneyRequestOptions = temporary_getMoneyRequestOptions(report, undefined, [currentUserAccountID]);
                expect(moneyRequestOptions.length).toBe(0);
            });

            it('its trip room', () => {
                const report = {
                    ...LHNTestUtils.getFakeReport(),
                    type: CONST.REPORT.TYPE.CHAT,
                    chatType: CONST.REPORT.CHAT_TYPE.TRIP_ROOM,
                };
                const moneyRequestOptions = temporary_getMoneyRequestOptions(report, undefined, [currentUserAccountID]);
                expect(moneyRequestOptions.length).toBe(0);
            });

            it('its paid Expense report', () => {
                const report = {
                    ...LHNTestUtils.getFakeReport(),
                    type: CONST.REPORT.TYPE.EXPENSE,
                    statusNum: CONST.REPORT.STATUS_NUM.REIMBURSED,
                };
                const moneyRequestOptions = temporary_getMoneyRequestOptions(report, undefined, [currentUserAccountID]);
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
                    const moneyRequestOptions = temporary_getMoneyRequestOptions(report, undefined, [currentUserAccountID]);
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
                    const moneyRequestOptions = temporary_getMoneyRequestOptions(report, paidPolicy, [currentUserAccountID, participantsAccountIDs.at(0) ?? CONST.DEFAULT_NUMBER_ID]);
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
                    const moneyRequestOptions = temporary_getMoneyRequestOptions(report, undefined, [currentUserAccountID, participantsAccountIDs.at(0) ?? CONST.DEFAULT_NUMBER_ID]);
                    return moneyRequestOptions.length === 1 && moneyRequestOptions.includes(CONST.IOU.TYPE.SPLIT);
                });
                expect(onlyHaveSplitOption).toBe(true);
            });

            it('has multiple participants excluding self', () => {
                const report = {
                    ...LHNTestUtils.getFakeReport(),
                    chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
                };
                const moneyRequestOptions = temporary_getMoneyRequestOptions(report, undefined, [currentUserAccountID, ...participantsAccountIDs]);
                expect(moneyRequestOptions.length).toBe(1);
                expect(moneyRequestOptions.includes(CONST.IOU.TYPE.SPLIT)).toBe(true);
            });

            it('user has pay expense permission', () => {
                const report = {
                    ...LHNTestUtils.getFakeReport(),
                    chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
                };
                const moneyRequestOptions = temporary_getMoneyRequestOptions(report, undefined, [currentUserAccountID, ...participantsAccountIDs]);
                expect(moneyRequestOptions.length).toBe(1);
                expect(moneyRequestOptions.includes(CONST.IOU.TYPE.SPLIT)).toBe(true);
            });

            it("it's a group DM report", () => {
                const report = {
                    ...LHNTestUtils.getFakeReport(),
                    type: CONST.REPORT.TYPE.CHAT,
                    participantsAccountIDs: [currentUserAccountID, ...participantsAccountIDs],
                };
                const moneyRequestOptions = temporary_getMoneyRequestOptions(report, undefined, [currentUserAccountID, ...participantsAccountIDs.map(Number)]);
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
                const moneyRequestOptions = temporary_getMoneyRequestOptions(report, undefined, [currentUserAccountID, participantsAccountIDs.at(0) ?? CONST.DEFAULT_NUMBER_ID]);
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
                const moneyRequestOptions = temporary_getMoneyRequestOptions(report, undefined, [currentUserAccountID, participantsAccountIDs.at(0) ?? CONST.DEFAULT_NUMBER_ID]);
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
                    const moneyRequestOptions = temporary_getMoneyRequestOptions(report, undefined, [currentUserAccountID]);
                    expect(moneyRequestOptions.length).toBe(2);
                    expect(moneyRequestOptions.includes(CONST.IOU.TYPE.SUBMIT)).toBe(true);
                    expect(moneyRequestOptions.includes(CONST.IOU.TYPE.TRACK)).toBe(true);
                    expect(moneyRequestOptions.indexOf(CONST.IOU.TYPE.SUBMIT)).toBe(0);
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
                    const moneyRequestOptions = temporary_getMoneyRequestOptions(report, paidPolicy, [currentUserAccountID, participantsAccountIDs.at(0) ?? CONST.DEFAULT_NUMBER_ID]);
                    expect(moneyRequestOptions.length).toBe(2);
                    expect(moneyRequestOptions.includes(CONST.IOU.TYPE.SUBMIT)).toBe(true);
                    expect(moneyRequestOptions.includes(CONST.IOU.TYPE.TRACK)).toBe(true);
                    expect(moneyRequestOptions.indexOf(CONST.IOU.TYPE.SUBMIT)).toBe(0);
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
                const moneyRequestOptions = temporary_getMoneyRequestOptions(report, undefined, [currentUserAccountID, participantsAccountIDs.at(0) ?? CONST.DEFAULT_NUMBER_ID]);
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
                const moneyRequestOptions = temporary_getMoneyRequestOptions(report, undefined, [currentUserAccountID, participantsAccountIDs.at(0) ?? CONST.DEFAULT_NUMBER_ID]);
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
                    employeeList: {
                        [currentUserEmail]: {
                            email: currentUserEmail,
                            submitsTo: currentUserEmail,
                        },
                    },
                };
                Promise.all([
                    Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${paidPolicy.id}`, paidPolicy),
                    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}101`, {
                        reportID: '101',
                        chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                        isOwnPolicyExpenseChat: true,
                        policyID: paidPolicy.id,
                        ownerAccountID: currentUserAccountID,
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
                        ownerAccountID: currentUserAccountID,
                    };
                    const moneyRequestOptions = temporary_getMoneyRequestOptions(report, paidPolicy, [currentUserAccountID, participantsAccountIDs.at(0) ?? CONST.DEFAULT_NUMBER_ID]);
                    expect(moneyRequestOptions.length).toBe(2);
                    expect(moneyRequestOptions.includes(CONST.IOU.TYPE.SUBMIT)).toBe(true);
                    expect(moneyRequestOptions.includes(CONST.IOU.TYPE.TRACK)).toBe(true);
                    expect(moneyRequestOptions.indexOf(CONST.IOU.TYPE.SUBMIT)).toBe(0);
                });
            });
        });

        describe('return multiple expense options if', () => {
            it('it is a 1:1 DM', () => {
                const report = {
                    ...LHNTestUtils.getFakeReport(),
                    type: CONST.REPORT.TYPE.CHAT,
                };
                const moneyRequestOptions = temporary_getMoneyRequestOptions(report, undefined, [currentUserAccountID, participantsAccountIDs.at(0) ?? CONST.DEFAULT_NUMBER_ID]);
                expect(moneyRequestOptions.length).toBe(3);
                expect(moneyRequestOptions.includes(CONST.IOU.TYPE.SPLIT)).toBe(true);
                expect(moneyRequestOptions.includes(CONST.IOU.TYPE.SUBMIT)).toBe(true);
                expect(moneyRequestOptions.includes(CONST.IOU.TYPE.PAY)).toBe(true);
                expect(moneyRequestOptions.indexOf(CONST.IOU.TYPE.SUBMIT)).toBe(0);
            });

            it("it is user's own policy expense chat", () => {
                const report = {
                    ...LHNTestUtils.getFakeReport(),
                    chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                    isOwnPolicyExpenseChat: true,
                    managerID: currentUserAccountID,
                };
                const moneyRequestOptions = temporary_getMoneyRequestOptions(report, undefined, [currentUserAccountID, ...participantsAccountIDs]);
                expect(moneyRequestOptions.length).toBe(3);
                expect(moneyRequestOptions.includes(CONST.IOU.TYPE.SUBMIT)).toBe(true);
                expect(moneyRequestOptions.includes(CONST.IOU.TYPE.SPLIT)).toBe(true);
                expect(moneyRequestOptions.includes(CONST.IOU.TYPE.TRACK)).toBe(true);
                expect(moneyRequestOptions.indexOf(CONST.IOU.TYPE.SUBMIT)).toBe(0);
            });
        });
    });

    describe('getReportIDFromLink', () => {
        it('should get the correct reportID from a deep link', () => {
            expect(getReportIDFromLink('new-expensify://r/75431276')).toBe('75431276');
            expect(getReportIDFromLink('https://www.expensify.cash/r/75431276')).toBe('75431276');
            expect(getReportIDFromLink('https://staging.new.expensify.com/r/75431276')).toBe('75431276');
            expect(getReportIDFromLink('https://dev.new.expensify.com/r/75431276')).toBe('75431276');
            expect(getReportIDFromLink('https://staging.expensify.cash/r/75431276')).toBe('75431276');
            expect(getReportIDFromLink('https://new.expensify.com/r/75431276')).toBe('75431276');
        });

        it("shouldn't get the correct reportID from a deep link", () => {
            expect(getReportIDFromLink('new-expensify-not-valid://r/75431276')).toBe('');
            expect(getReportIDFromLink('new-expensify://settings')).toBe('');
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
            expect(getMostRecentlyVisitedReport(reports, undefined)).toEqual(latestReport);
        });
    });

    describe('shouldDisableThread', () => {
        const reportID = '1';

        it('should disable on thread-disabled actions', () => {
            const reportAction = buildOptimisticCreatedReportAction('email1@test.com');
            expect(shouldDisableThread(reportAction, reportID, false)).toBeTruthy();
        });

        it('should disable thread on split expense actions', () => {
            const reportAction = buildOptimisticIOUReportAction({
                type: CONST.IOU.REPORT_ACTION_TYPE.SPLIT,
                amount: 50000,
                currency: CONST.CURRENCY.USD,
                comment: '',
                participants: [{login: 'email1@test.com'}, {login: 'email2@test.com'}],
                transactionID: NumberUtils.rand64(),
            }) as ReportAction;
            expect(shouldDisableThread(reportAction, reportID, false)).toBeTruthy();
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
            expect(shouldDisableThread(reportAction, reportID, false)).toBeFalsy();

            reportAction.childVisibleActionCount = 0;
            expect(shouldDisableThread(reportAction, reportID, false)).toBeTruthy();
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
                    expect(shouldDisableThread(reportAction, reportID, false)).toBeFalsy();

                    reportAction.childVisibleActionCount = 0;
                    expect(shouldDisableThread(reportAction, reportID, false)).toBeTruthy();
                });
        });

        it("should disable on a whisper action and it's neither a report preview nor IOU action", () => {
            const reportAction = {
                actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
                originalMessage: {
                    whisperedTo: [123456],
                },
            } as ReportAction;
            expect(shouldDisableThread(reportAction, reportID, false)).toBeTruthy();
        });

        it('should disable on thread first chat', () => {
            const reportAction = {
                childReportID: reportID,
            } as ReportAction;
            expect(shouldDisableThread(reportAction, reportID, true)).toBeTruthy();
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

            expect(getAllAncestorReportActions(reports.at(4))).toEqual(resultAncestors);
        });
    });

    describe('isChatUsedForOnboarding', () => {
        afterEach(async () => {
            await Onyx.clear();
            await Onyx.set(ONYXKEYS.SESSION, {email: currentUserEmail, accountID: currentUserAccountID});
        });

        it('should return false if the report is neither the system or concierge chat', () => {
            expect(isChatUsedForOnboarding(LHNTestUtils.getFakeReport())).toBeFalsy();
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

            expect(isChatUsedForOnboarding(report)).toBeFalsy();
        });

        it('should return true if the user account ID is even and report is the concierge chat', async () => {
            const accountID = 2;
            const report = LHNTestUtils.getFakeReport([accountID, CONST.ACCOUNT_ID.CONCIERGE]);

            await Onyx.multiSet({
                [ONYXKEYS.PERSONAL_DETAILS_LIST]: {
                    [accountID]: {
                        accountID,
                    },
                },
                [ONYXKEYS.SESSION]: {email: currentUserEmail, accountID},
            });
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);

            expect(isChatUsedForOnboarding(report)).toBeTruthy();
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
            expect(isChatUsedForOnboarding(report1)).toBeTruthy();

            const report2: Report = {
                ...LHNTestUtils.getFakeReport(),
                reportID: '8011',
            };
            expect(isChatUsedForOnboarding(report2)).toBeFalsy();
        });
    });

    describe('getQuickActionDetails', () => {
        it('if the report is archived, the quick action will hide the subtitle and avatar', () => {
            // Create a fake archived report as quick action report
            const archivedReport: Report = {
                ...LHNTestUtils.getFakeReport(),
                reportID: '1',
            };
            const reportNameValuePairs = {
                type: 'chat',
                private_isArchived: DateUtils.getDBTime(),
            };

            // Get the quick action detail
            const quickActionDetails = getQuickActionDetails(archivedReport, undefined, undefined, reportNameValuePairs);

            // Expect the quickActionAvatars is empty array and hideQABSubtitle is true since the quick action report is archived
            expect(quickActionDetails.quickActionAvatars.length).toEqual(0);
            expect(quickActionDetails.hideQABSubtitle).toEqual(true);
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
            const report = getChatByParticipants([currentUserAccountID, userAccountID]);
            expect(report?.reportID).toEqual(oneOnOneChatReport.reportID);
        });

        it('should return the group chat', () => {
            const report = getChatByParticipants([currentUserAccountID, userAccountID, userAccountID2], undefined, true);
            expect(report?.reportID).toEqual(groupChatReport.reportID);
        });

        it('should return undefined when no report is found', () => {
            const report = getChatByParticipants([currentUserAccountID, userAccountID2], undefined);
            expect(report).toEqual(undefined);
        });
    });

    describe('getGroupChatName tests', () => {
        afterEach(() => Onyx.clear());

        const fourParticipants = [
            {accountID: 1, login: 'email1@test.com'},
            {accountID: 2, login: 'email2@test.com'},
            {accountID: 3, login: 'email3@test.com'},
            {accountID: 4, login: 'email4@test.com'},
        ];

        const eightParticipants = [
            {accountID: 1, login: 'email1@test.com'},
            {accountID: 2, login: 'email2@test.com'},
            {accountID: 3, login: 'email3@test.com'},
            {accountID: 4, login: 'email4@test.com'},
            {accountID: 5, login: 'email5@test.com'},
            {accountID: 6, login: 'email6@test.com'},
            {accountID: 7, login: 'email7@test.com'},
            {accountID: 8, login: 'email8@test.com'},
        ];

        describe('When participantAccountIDs is passed to getGroupChatName', () => {
            it('Should show all participants name if count <= 5 and shouldApplyLimit is false', async () => {
                await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, fakePersonalDetails);
                expect(getGroupChatName(fourParticipants)).toEqual('Four, One, Three, Two');
            });

            it('Should show all participants name if count <= 5 and shouldApplyLimit is true', async () => {
                await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, fakePersonalDetails);
                expect(getGroupChatName(fourParticipants)).toEqual('Four, One, Three, Two');
            });

            it('Should show 5 participants name with ellipsis if count > 5 and shouldApplyLimit is true', async () => {
                await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, fakePersonalDetails);
                expect(getGroupChatName(eightParticipants, true)).toEqual('Five, Four, One, Three, Two...');
            });

            it('Should show all participants name if count > 5 and shouldApplyLimit is false', async () => {
                await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, fakePersonalDetails);
                expect(getGroupChatName(eightParticipants, false)).toEqual('Eight, Five, Four, One, Seven, Six, Three, Two');
            });

            it('Should use correct display name for participants', async () => {
                await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, participantsPersonalDetails);
                expect(getGroupChatName(fourParticipants, true)).toEqual('(833) 240-3627, floki@vikings.net, Lagertha, Ragnar');
            });
        });

        describe('When participantAccountIDs is not passed to getGroupChatName and report ID is passed', () => {
            it('Should show report name if count <= 5 and shouldApplyLimit is false', async () => {
                const report = {
                    ...LHNTestUtils.getFakeReport([1, 2, 3, 4], 0, false, [1]),
                    chatType: CONST.REPORT.CHAT_TYPE.GROUP,
                    reportID: `1`,
                    reportName: "Let's talk",
                };
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}1`, report);
                await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, fakePersonalDetails);
                expect(getGroupChatName(undefined, false, report)).toEqual("Let's talk");
            });

            it('Should show report name if count <= 5 and shouldApplyLimit is true', async () => {
                const report = {
                    ...LHNTestUtils.getFakeReport([1, 2, 3, 4], 0, false, [1]),
                    chatType: CONST.REPORT.CHAT_TYPE.GROUP,
                    reportID: `1`,
                    reportName: "Let's talk",
                };
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}1`, report);
                await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, fakePersonalDetails);
                expect(getGroupChatName(undefined, true, report)).toEqual("Let's talk");
            });

            it('Should show report name if count > 5 and shouldApplyLimit is true', async () => {
                const report = {
                    ...LHNTestUtils.getFakeReport([1, 2, 3, 4, 5, 6, 7, 8], 0, false, [1, 2]),
                    chatType: CONST.REPORT.CHAT_TYPE.GROUP,
                    reportID: `1`,
                    reportName: "Let's talk",
                };
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}1`, report);
                await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, fakePersonalDetails);
                expect(getGroupChatName(undefined, true, report)).toEqual("Let's talk");
            });

            it('Should show report name if count > 5 and shouldApplyLimit is false', async () => {
                const report = {
                    ...LHNTestUtils.getFakeReport([1, 2, 3, 4, 5, 6, 7, 8], 0, false, [1, 2]),
                    chatType: CONST.REPORT.CHAT_TYPE.GROUP,
                    reportID: `1`,
                    reportName: "Let's talk",
                };
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}1`, report);
                await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, fakePersonalDetails);
                expect(getGroupChatName(undefined, false, report)).toEqual("Let's talk");
            });

            it('Should show participant names if report name is not available', async () => {
                const report = {
                    ...LHNTestUtils.getFakeReport([1, 2, 3, 4, 5, 6, 7, 8], 0, false, [1, 2]),
                    chatType: CONST.REPORT.CHAT_TYPE.GROUP,
                    reportID: `1`,
                    reportName: '',
                };
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}1`, report);
                await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, fakePersonalDetails);
                expect(getGroupChatName(undefined, false, report)).toEqual('Eight, Five, Four, One, Seven, Six, Three, Two');
            });
        });
    });

    describe('shouldReportBeInOptionList tests', () => {
        afterEach(() => Onyx.clear());

        it('should return true when the report is current active report', () => {
            const report = LHNTestUtils.getFakeReport();
            const currentReportId = report.reportID;
            const isInFocusMode = true;
            const betas = [CONST.BETAS.DEFAULT_ROOMS];
            expect(shouldReportBeInOptionList({report, currentReportId, isInFocusMode, betas, policies: {}, doesReportHaveViolations: false, excludeEmptyChats: false})).toBeTruthy();
        });

        it('should return true when the report has outstanding violations', async () => {
            const expenseReport = buildOptimisticExpenseReport('212', '123', 100, 122, 'USD');
            const expenseTransaction = buildOptimisticTransaction({
                transactionParams: {
                    amount: 100,
                    currency: 'USD',
                    reportID: expenseReport.reportID,
                },
            });
            const expenseCreatedAction1 = buildOptimisticIOUReportAction({
                type: 'create',
                amount: 100,
                currency: 'USD',
                comment: '',
                participants: [],
                transactionID: expenseTransaction.transactionID,

                iouReportID: expenseReport.reportID,
            });
            const expenseCreatedAction2 = buildOptimisticIOUReportAction({
                type: 'create',
                amount: 100,
                currency: 'USD',
                comment: '',
                participants: [],
                transactionID: expenseTransaction.transactionID,

                iouReportID: expenseReport.reportID,
            });
            const transactionThreadReport = buildTransactionThread(expenseCreatedAction1, expenseReport);
            const currentReportId = '1';
            const isInFocusMode = false;
            const betas = [CONST.BETAS.DEFAULT_ROOMS];
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`, expenseReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.reportID}`, {
                [expenseCreatedAction1.reportActionID]: expenseCreatedAction1,
                [expenseCreatedAction2.reportActionID]: expenseCreatedAction2,
            });
            expect(
                shouldReportBeInOptionList({
                    report: transactionThreadReport,
                    currentReportId,
                    isInFocusMode,
                    betas,
                    policies: {},
                    doesReportHaveViolations: true,
                    excludeEmptyChats: false,
                }),
            ).toBeTruthy();
        });

        it('should return true when the report needing user action', () => {
            const chatReport: Report = {
                ...LHNTestUtils.getFakeReport(),
                hasOutstandingChildRequest: true,
            };
            const currentReportId = '3';
            const isInFocusMode = true;
            const betas = [CONST.BETAS.DEFAULT_ROOMS];
            expect(
                shouldReportBeInOptionList({report: chatReport, currentReportId, isInFocusMode, betas, policies: {}, doesReportHaveViolations: false, excludeEmptyChats: false}),
            ).toBeTruthy();
        });

        it('should return true when the report has valid draft comment', async () => {
            const report = LHNTestUtils.getFakeReport();
            const currentReportId = '3';
            const isInFocusMode = false;
            const betas = [CONST.BETAS.DEFAULT_ROOMS];

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${report.reportID}`, 'fake draft');

            expect(shouldReportBeInOptionList({report, currentReportId, isInFocusMode, betas, policies: {}, doesReportHaveViolations: false, excludeEmptyChats: false})).toBeTruthy();
        });

        it('should return true when the report is pinned', () => {
            const report: Report = {
                ...LHNTestUtils.getFakeReport(),
                isPinned: true,
            };
            const currentReportId = '3';
            const isInFocusMode = false;
            const betas = [CONST.BETAS.DEFAULT_ROOMS];
            expect(shouldReportBeInOptionList({report, currentReportId, isInFocusMode, betas, policies: {}, doesReportHaveViolations: false, excludeEmptyChats: false})).toBeTruthy();
        });

        it('should return true when the report is unread and we are in the focus mode', async () => {
            const report: Report = {
                ...LHNTestUtils.getFakeReport(),
                lastReadTime: '1',
                lastVisibleActionCreated: '2',
                type: CONST.REPORT.TYPE.CHAT,
                participants: {
                    '1': {
                        notificationPreference: 'always',
                    },
                },
                lastMessageText: 'fake',
            };
            const currentReportId = '3';
            const isInFocusMode = true;
            const betas = [CONST.BETAS.DEFAULT_ROOMS];

            await Onyx.merge(ONYXKEYS.SESSION, {
                accountID: 1,
            });

            expect(shouldReportBeInOptionList({report, currentReportId, isInFocusMode, betas, policies: {}, doesReportHaveViolations: false, excludeEmptyChats: false})).toBeTruthy();
        });

        it('should return true when the report is an archived report and we are in the default mode', async () => {
            const archivedReport: Report = {
                ...LHNTestUtils.getFakeReport(),
                reportID: '1',
            };
            const reportNameValuePairs = {
                type: 'chat',
                private_isArchived: DateUtils.getDBTime(),
            };
            const currentReportId = '3';
            const isInFocusMode = false;
            const betas = [CONST.BETAS.DEFAULT_ROOMS];

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${archivedReport.reportID}`, reportNameValuePairs);

            expect(
                shouldReportBeInOptionList({
                    report: archivedReport,
                    currentReportId,
                    isInFocusMode,
                    betas,
                    policies: {},
                    doesReportHaveViolations: false,
                    excludeEmptyChats: false,
                }),
            ).toBeTruthy();
        });

        it('should return false when the report is an archived report and we are in the focus mode', async () => {
            const archivedReport: Report = {
                ...LHNTestUtils.getFakeReport(),
                reportID: '1',
            };
            const reportNameValuePairs = {
                type: 'chat',
                private_isArchived: DateUtils.getDBTime(),
            };
            const currentReportId = '3';
            const isInFocusMode = true;
            const betas = [CONST.BETAS.DEFAULT_ROOMS];

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${archivedReport.reportID}`, reportNameValuePairs);

            expect(
                shouldReportBeInOptionList({
                    report: archivedReport,
                    currentReportId,
                    isInFocusMode,
                    betas,
                    policies: {},
                    doesReportHaveViolations: false,
                    excludeEmptyChats: false,
                }),
            ).toBeFalsy();
        });

        it('should return true when the report is selfDM', () => {
            const report: Report = {
                ...LHNTestUtils.getFakeReport(),
                chatType: CONST.REPORT.CHAT_TYPE.SELF_DM,
            };
            const currentReportId = '3';
            const isInFocusMode = false;
            const betas = [CONST.BETAS.DEFAULT_ROOMS];
            const includeSelfDM = true;
            expect(
                shouldReportBeInOptionList({
                    report,
                    currentReportId,
                    isInFocusMode,
                    betas,
                    policies: {},
                    doesReportHaveViolations: false,
                    excludeEmptyChats: false,
                    includeSelfDM,
                }),
            ).toBeTruthy();
        });

        it('should return false when the report is marked as hidden', () => {
            const report: Report = {
                ...LHNTestUtils.getFakeReport(),
                participants: {
                    '1': {
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN,
                    },
                },
            };
            const currentReportId = '';
            const isInFocusMode = true;
            const betas = [CONST.BETAS.DEFAULT_ROOMS];
            expect(shouldReportBeInOptionList({report, currentReportId, isInFocusMode, betas, policies: {}, doesReportHaveViolations: false, excludeEmptyChats: false})).toBeFalsy();
        });

        it('should return false when the report does not have participants', () => {
            const report = LHNTestUtils.getFakeReport([]);
            const currentReportId = '';
            const isInFocusMode = true;
            const betas = [CONST.BETAS.DEFAULT_ROOMS];
            expect(shouldReportBeInOptionList({report, currentReportId, isInFocusMode, betas, policies: {}, doesReportHaveViolations: false, excludeEmptyChats: false})).toBeFalsy();
        });

        it('should return false when the report is the report that the user cannot access due to policy restrictions', () => {
            const report: Report = {
                ...LHNTestUtils.getFakeReport(),
                chatType: CONST.REPORT.CHAT_TYPE.DOMAIN_ALL,
            };
            const currentReportId = '';
            const isInFocusMode = false;
            const betas: Beta[] = [];
            expect(shouldReportBeInOptionList({report, currentReportId, isInFocusMode, betas, policies: {}, doesReportHaveViolations: false, excludeEmptyChats: false})).toBeFalsy();
        });

        it('should return false when the report is the single transaction thread', async () => {
            const expenseReport = buildOptimisticExpenseReport('212', '123', 100, 122, 'USD');
            const expenseTransaction = buildOptimisticTransaction({
                transactionParams: {
                    amount: 100,
                    currency: 'USD',
                    reportID: expenseReport.reportID,
                },
            });
            const expenseCreatedAction = buildOptimisticIOUReportAction({
                type: 'create',
                amount: 100,
                currency: 'USD',
                comment: '',
                participants: [],
                transactionID: expenseTransaction.transactionID,

                iouReportID: expenseReport.reportID,
            });
            const transactionThreadReport = buildTransactionThread(expenseCreatedAction, expenseReport);
            expenseCreatedAction.childReportID = transactionThreadReport.reportID;
            const currentReportId = '1';
            const isInFocusMode = false;
            const betas = [CONST.BETAS.DEFAULT_ROOMS];
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`, expenseReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.reportID}`, {
                [expenseCreatedAction.reportActionID]: expenseCreatedAction,
            });
            expect(
                shouldReportBeInOptionList({
                    report: transactionThreadReport,
                    currentReportId,
                    isInFocusMode,
                    betas,
                    policies: {},
                    doesReportHaveViolations: false,
                    excludeEmptyChats: false,
                }),
            ).toBeFalsy();
        });

        it('should return false when the report is empty chat and the excludeEmptyChats setting is true', () => {
            const report = LHNTestUtils.getFakeReport();
            const currentReportId = '';
            const isInFocusMode = false;
            const betas = [CONST.BETAS.DEFAULT_ROOMS];
            expect(shouldReportBeInOptionList({report, currentReportId, isInFocusMode, betas, policies: {}, doesReportHaveViolations: false, excludeEmptyChats: true})).toBeFalsy();
        });

        it('should return false when the user’s email is domain-based and the includeDomainEmail is false', () => {
            const report = LHNTestUtils.getFakeReport();
            const currentReportId = '';
            const isInFocusMode = false;
            const betas = [CONST.BETAS.DEFAULT_ROOMS];
            expect(
                shouldReportBeInOptionList({
                    report,
                    currentReportId,
                    isInFocusMode,
                    betas,
                    policies: {},
                    doesReportHaveViolations: false,
                    login: '+@domain.com',
                    excludeEmptyChats: false,
                    includeDomainEmail: false,
                }),
            ).toBeFalsy();
        });

        it('should return false when the report has the parent message is pending removal', async () => {
            const parentReport = LHNTestUtils.getFakeReport();
            const report = LHNTestUtils.getFakeReport();
            const parentReportAction: ReportAction = {
                ...LHNTestUtils.getFakeReportAction(),
                message: [
                    {
                        type: 'COMMENT',
                        html: 'hey',
                        text: 'hey',
                        isEdited: false,
                        whisperedTo: [],
                        isDeletedParentAction: false,
                        moderationDecision: {
                            decision: CONST.MODERATION.MODERATOR_DECISION_PENDING_REMOVE,
                        },
                    },
                ],
                childReportID: report.reportID,
            };
            report.parentReportID = parentReport.reportID;
            report.parentReportActionID = parentReportAction.reportActionID;
            const currentReportId = '';
            const isInFocusMode = false;
            const betas = [CONST.BETAS.DEFAULT_ROOMS];

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${parentReport.reportID}`, parentReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReport.reportID}`, {
                [parentReportAction.reportActionID]: parentReportAction,
            });

            expect(shouldReportBeInOptionList({report, currentReportId, isInFocusMode, betas, policies: {}, doesReportHaveViolations: false, excludeEmptyChats: false})).toBeFalsy();
        });

        it('should return false when the report is read and we are in the focus mode', () => {
            const report = LHNTestUtils.getFakeReport();
            const currentReportId = '';
            const isInFocusMode = true;
            const betas = [CONST.BETAS.DEFAULT_ROOMS];
            expect(shouldReportBeInOptionList({report, currentReportId, isInFocusMode, betas, policies: {}, doesReportHaveViolations: false, excludeEmptyChats: false})).toBeFalsy();
        });
    });

    describe('buildOptimisticChatReport', () => {
        it('should always set isPinned to false', () => {
            const result = buildOptimisticChatReport({
                participantList: [1, 2, 3],
            });
            expect(result.isPinned).toBe(false);
        });
    });

    describe('getInvoiceChatByParticipants', () => {
        it('only returns an invoice chat if the receiver type matches', () => {
            // Given an invoice chat that has been converted from an individual to policy receiver type
            const reports: OnyxCollection<Report> = {
                [convertedInvoiceChat.reportID]: convertedInvoiceChat,
            };

            // When we send another invoice to the individual from global create and call getInvoiceChatByParticipants
            const invoiceChatReport = getInvoiceChatByParticipants(33, CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL, convertedInvoiceChat.policyID, reports);

            // Then no invoice chat should be returned because the receiver type does not match
            expect(invoiceChatReport).toBeUndefined();
        });
    });
    describe('getWorkspaceNameUpdatedMessage', () => {
        it('return the encoded workspace name updated message', () => {
            const action = {
                originalMessage: {
                    newName: '&#104;&#101;&#108;&#108;&#111;',
                    oldName: 'workspace 1',
                },
            };
            expect(getWorkspaceNameUpdatedMessage(action as ReportAction)).toEqual(
                'updated the name of this workspace to &quot;&amp;#104;&amp;#101;&amp;#108;&amp;#108;&amp;#111;&quot; (previously &quot;workspace 1&quot;)',
            );
        });
    });

    describe('isAllowedToApproveExpenseReport', () => {
        const expenseReport: Report = {
            ...createRandomReport(6),
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: currentUserAccountID,
        };

        it('should return true if preventSelfApproval is disabled and the approver is not the owner of the expense report', () => {
            const fakePolicy: Policy = {
                ...createRandomPolicy(6),
                preventSelfApproval: false,
            };
            expect(isAllowedToApproveExpenseReport(expenseReport, 0, fakePolicy)).toBeTruthy();
        });

        it('should return true if preventSelfApproval is enabled and the approver is not the owner of the expense report', () => {
            const fakePolicy: Policy = {
                ...createRandomPolicy(6),
                preventSelfApproval: true,
            };
            expect(isAllowedToApproveExpenseReport(expenseReport, 0, fakePolicy)).toBeTruthy();
        });

        it('should return true if preventSelfApproval is disabled and the approver is the owner of the expense report', () => {
            const fakePolicy: Policy = {
                ...createRandomPolicy(6),
                preventSelfApproval: false,
            };
            expect(isAllowedToApproveExpenseReport(expenseReport, currentUserAccountID, fakePolicy)).toBeTruthy();
        });

        it('should return false if preventSelfApproval is enabled and the approver is the owner of the expense report', () => {
            const fakePolicy: Policy = {
                ...createRandomPolicy(6),
                preventSelfApproval: true,
            };
            expect(isAllowedToApproveExpenseReport(expenseReport, currentUserAccountID, fakePolicy)).toBeFalsy();
        });
    });

    describe('canEditWriteCapability', () => {
        it('should return false for workspace chat', () => {
            const workspaceChat: Report = {
                ...createRandomReport(1),
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
            };
            expect(canEditWriteCapability(workspaceChat, {...policy, role: CONST.POLICY.ROLE.ADMIN})).toBe(false);
        });
    });

    describe('canDeleteReportAction', () => {
        it('should return false for delete button visibility if transaction is not allowed to be deleted', () => {
            const parentReport = LHNTestUtils.getFakeReport();
            const report = LHNTestUtils.getFakeReport();
            const parentReportAction: ReportAction = {
                ...LHNTestUtils.getFakeReportAction(),
                message: [
                    {
                        type: 'COMMENT',
                        html: 'hey',
                        text: 'hey',
                        isEdited: false,
                        whisperedTo: [],
                        isDeletedParentAction: false,
                        moderationDecision: {
                            decision: CONST.MODERATION.MODERATOR_DECISION_PENDING_REMOVE,
                        },
                    },
                ],
                childReportID: report.reportID,
            };
            report.parentReportID = parentReport.reportID;
            report.parentReportActionID = parentReportAction.reportActionID;
            const currentReportId = '';
            const transactionID = 1;
            const moneyRequestAction = {
                ...parentReportAction,
                actorAccountID: currentUserAccountID,
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                originalMessage: {
                    IOUReportID: '1',
                    IOUTransactionID: '1',
                    amount: 100,
                    participantAccountID: 1,
                    currency: CONST.CURRENCY.USD,
                    type: CONST.IOU.REPORT_ACTION_TYPE.PAY,
                    paymentType: CONST.IOU.PAYMENT_TYPE.EXPENSIFY,
                },
            };

            const transaction: Transaction = {
                ...createRandomTransaction(transactionID),
                category: '',
                tag: '',
                created: testDate,
                reportID: currentReportId,
                managedCard: true,
                comment: {
                    liabilityType: CONST.TRANSACTION.LIABILITY_TYPE.RESTRICT,
                },
            };

            Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, transaction).then(() => {
                expect(canDeleteReportAction(moneyRequestAction, currentReportId)).toBe(false);
            });
        });
    });

    describe('getPolicyExpenseChat', () => {
        it('should return the correct policy expense chat when we have a task report is the child of this report', async () => {
            const policyExpenseChat: Report = {
                ...createRandomReport(11),
                ownerAccountID: 1,
                policyID: '1',
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                type: CONST.REPORT.TYPE.CHAT,
            };

            const taskReport: Report = {
                ...createRandomReport(10),
                ownerAccountID: 1,
                policyID: '1',
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                type: CONST.REPORT.TYPE.TASK,
                parentReportID: policyExpenseChat.reportID,
                parentReportActionID: '1',
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${taskReport.reportID}`, taskReport);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${policyExpenseChat.reportID}`, policyExpenseChat);

            expect(getPolicyExpenseChat(1, '1')?.reportID).toBe(policyExpenseChat.reportID);
        });
    });

    describe('findLastAccessedReport', () => {
        let archivedReport: Report;
        let normalReport: Report;

        beforeAll(async () => {
            // Set up test reports - one archived, one normal
            archivedReport = {
                ...LHNTestUtils.getFakeReport(),
                reportID: '1001',
                lastReadTime: '2024-02-01 04:56:47.233',
                lastVisibleActionCreated: '2024-02-01 04:56:47.233',
            };

            normalReport = {
                ...LHNTestUtils.getFakeReport(),
                reportID: '1002',
                lastReadTime: '2024-01-01 04:56:47.233', // Older last read time
                lastVisibleActionCreated: '2024-01-01 04:56:47.233',
            };

            // Set up report name value pairs to mark one report as archived
            const reportNameValuePairs = {
                private_isArchived: DateUtils.getDBTime(),
            };

            // Add reports to Onyx
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${archivedReport.reportID}`, archivedReport);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${normalReport.reportID}`, normalReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${archivedReport.reportID}`, reportNameValuePairs);

            // Set up report metadata for lastVisitTime
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${archivedReport.reportID}`, {
                lastVisitTime: '2024-02-01 04:56:47.233', // More recent visit
            });

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_METADATA}${normalReport.reportID}`, {
                lastVisitTime: '2024-01-01 04:56:47.233',
            });

            return waitForBatchedUpdates();
        });

        afterAll(async () => {
            await Onyx.clear();
            await Onyx.set(ONYXKEYS.SESSION, {email: currentUserEmail, accountID: currentUserAccountID});
        });

        it('should not return an archived report even if it was most recently accessed', () => {
            const result = findLastAccessedReport(false);

            // Even though the archived report has a more recent lastVisitTime,
            // the function should filter it out and return the normal report
            expect(result?.reportID).toBe(normalReport.reportID);
            expect(result?.reportID).not.toBe(archivedReport.reportID);
        });
    });

    describe('getApprovalChain', () => {
        describe('submit and close policy', () => {
            it('should return empty array', () => {
                const policyTest: Policy = {
                    ...createRandomPolicy(0),
                    approver: 'owner@test.com',
                    owner: 'owner@test.com',
                    type: CONST.POLICY.TYPE.TEAM,
                    approvalMode: CONST.POLICY.APPROVAL_MODE.OPTIONAL,
                };
                const expenseReport: Report = {
                    ...createRandomReport(0),
                    ownerAccountID: employeeAccountID,
                    type: CONST.REPORT.TYPE.EXPENSE,
                };

                expect(getApprovalChain(policyTest, expenseReport)).toStrictEqual([]);
            });
        });
        describe('basic/advance workflow', () => {
            describe('has no approver rule', () => {
                it('should return list contain policy approver/owner and the forwardsTo of them if the policy use basic workflow', () => {
                    const policyTest: Policy = {
                        ...createRandomPolicy(0),
                        approver: 'owner@test.com',
                        owner: 'owner@test.com',
                        type: CONST.POLICY.TYPE.TEAM,
                        employeeList,
                        approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
                    };
                    const expenseReport: Report = {
                        ...createRandomReport(0),
                        ownerAccountID: employeeAccountID,
                        type: CONST.REPORT.TYPE.EXPENSE,
                    };
                    Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetails).then(() => {
                        const result = ['owner@test.com'];
                        expect(getApprovalChain(policyTest, expenseReport)).toStrictEqual(result);
                    });
                });
                it('should return list contain submitsTo of ownerAccountID and the forwardsTo of them if the policy use advance workflow', () => {
                    const policyTest: Policy = {
                        ...createRandomPolicy(0),
                        approver: 'owner@test.com',
                        owner: 'owner@test.com',
                        type: CONST.POLICY.TYPE.CORPORATE,
                        employeeList,
                        approvalMode: CONST.POLICY.APPROVAL_MODE.ADVANCED,
                    };
                    const expenseReport: Report = {
                        ...createRandomReport(0),
                        ownerAccountID: employeeAccountID,
                        type: CONST.REPORT.TYPE.EXPENSE,
                    };
                    Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetails).then(() => {
                        const result = ['admin@test.com'];
                        expect(getApprovalChain(policyTest, expenseReport)).toStrictEqual(result);
                    });
                });
            });
            describe('has approver rule', () => {
                describe('has no transaction match with approver rule', () => {
                    it('should return list contain submitsTo of ownerAccountID and the forwardsTo of them', () => {
                        const policyTest: Policy = {
                            ...createRandomPolicy(0),
                            approver: 'owner@test.com',
                            owner: 'owner@test.com',
                            type: CONST.POLICY.TYPE.CORPORATE,
                            employeeList,
                            rules,
                            approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
                        };
                        const expenseReport: Report = {
                            ...createRandomReport(0),
                            ownerAccountID: employeeAccountID,
                            type: CONST.REPORT.TYPE.EXPENSE,
                        };
                        const transaction1: Transaction = {
                            ...createRandomTransaction(0),
                            category: '',
                            tag: '',
                            created: testDate,
                            reportID: expenseReport.reportID,
                        };
                        const transaction2: Transaction = {
                            ...createRandomTransaction(1),
                            category: '',
                            tag: '',
                            created: DateUtils.subtractMillisecondsFromDateTime(testDate, 1),
                            reportID: expenseReport.reportID,
                        };
                        Onyx.multiSet({
                            [ONYXKEYS.PERSONAL_DETAILS_LIST]: personalDetails,
                            [ONYXKEYS.COLLECTION.TRANSACTION]: {
                                [transaction1.transactionID]: transaction1,
                                [transaction2.transactionID]: transaction2,
                            },
                        }).then(() => {
                            const result = ['owner@test.com'];
                            expect(getApprovalChain(policyTest, expenseReport)).toStrictEqual(result);
                        });
                    });
                });
                describe('has transaction match with approver rule', () => {
                    it('should return the list with correct order of category/tag approver sorted by created/inserted of the transaction', () => {
                        const policyTest: Policy = {
                            ...createRandomPolicy(1),
                            approver: 'owner@test.com',
                            owner: 'owner@test.com',
                            type: CONST.POLICY.TYPE.CORPORATE,
                            employeeList,
                            rules,
                            approvalMode: CONST.POLICY.APPROVAL_MODE.ADVANCED,
                        };
                        const expenseReport: Report = {
                            ...createRandomReport(1),
                            ownerAccountID: employeeAccountID,
                            type: CONST.REPORT.TYPE.EXPENSE,
                        };
                        const transaction1: Transaction = {
                            ...createRandomTransaction(2),
                            category: 'cat1',
                            tag: '',
                            created: testDate,
                            reportID: expenseReport.reportID,
                            inserted: DateUtils.subtractMillisecondsFromDateTime(testDate, 1),
                        };
                        const transaction2: Transaction = {
                            ...createRandomTransaction(3),
                            category: '',
                            tag: 'tag1',
                            created: DateUtils.subtractMillisecondsFromDateTime(testDate, 1),
                            reportID: expenseReport.reportID,
                            inserted: DateUtils.subtractMillisecondsFromDateTime(testDate, 1),
                        };
                        const transaction3: Transaction = {
                            ...createRandomTransaction(4),
                            category: 'cat2',
                            tag: '',
                            created: testDate,
                            reportID: expenseReport.reportID,
                            inserted: DateUtils.subtractMillisecondsFromDateTime(testDate, 2),
                        };
                        const transaction4: Transaction = {
                            ...createRandomTransaction(5),
                            category: '',
                            tag: 'tag2',
                            created: DateUtils.subtractMillisecondsFromDateTime(testDate, 1),
                            reportID: expenseReport.reportID,
                            inserted: DateUtils.subtractMillisecondsFromDateTime(testDate, 2),
                        };
                        Onyx.merge(ONYXKEYS.COLLECTION.TRANSACTION, {
                            [transaction1.transactionID]: transaction1,
                            [transaction2.transactionID]: transaction2,
                            [transaction3.transactionID]: transaction3,
                            [transaction4.transactionID]: transaction4,
                        }).then(() => {
                            const result = [categoryapprover2Email, categoryapprover1Email, tagapprover2Email, tagapprover1Email, 'admin@test.com'];
                            expect(getApprovalChain(policyTest, expenseReport)).toStrictEqual(result);
                        });
                    });
                });
            });
        });
    });
});
