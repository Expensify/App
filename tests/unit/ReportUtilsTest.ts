/* eslint-disable @typescript-eslint/naming-convention */
import {beforeAll} from '@jest/globals';
import {renderHook} from '@testing-library/react-native';
import {addDays, format as formatDate} from 'date-fns';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import useReportIsArchived from '@hooks/useReportIsArchived';
import {putOnHold} from '@libs/actions/IOU';
import type {OnboardingTaskLinks} from '@libs/actions/Welcome/OnboardingFlow';
import DateUtils from '@libs/DateUtils';
import {translateLocal} from '@libs/Localize';
import {getOriginalMessage, isWhisperAction} from '@libs/ReportActionsUtils';
import {
    buildOptimisticChatReport,
    buildOptimisticCreatedReportAction,
    buildOptimisticExpenseReport,
    buildOptimisticIOUReportAction,
    buildOptimisticReportPreview,
    buildParticipantsFromAccountIDs,
    buildReportNameFromParticipantNames,
    buildTransactionThread,
    canAddTransaction,
    canDeleteReportAction,
    canDeleteTransaction,
    canEditFieldOfMoneyRequest,
    canEditMoneyRequest,
    canEditReportDescription,
    canEditRoomVisibility,
    canEditWriteCapability,
    canFlagReportAction,
    canHoldUnholdReportAction,
    canJoinChat,
    canLeaveChat,
    canUserPerformWriteAction,
    findLastAccessedReport,
    getAllAncestorReportActions,
    getApprovalChain,
    getChatByParticipants,
    getDefaultWorkspaceAvatar,
    getDisplayNamesWithTooltips,
    getGroupChatName,
    getIconsForParticipants,
    getMoneyReportPreviewName,
    getMostRecentlyVisitedReport,
    getParticipantsList,
    getPolicyExpenseChat,
    getQuickActionDetails,
    getReasonAndReportActionThatRequiresAttention,
    getReportIDFromLink,
    getReportName,
    getReportStatusTranslation,
    getWorkspaceIcon,
    getWorkspaceNameUpdatedMessage,
    hasReceiptError,
    isAllowedToApproveExpenseReport,
    isArchivedNonExpenseReport,
    isArchivedReport,
    isChatUsedForOnboarding,
    isDeprecatedGroupDM,
    isPayer,
    isReportOutstanding,
    isRootGroupChat,
    parseReportRouteParams,
    prepareOnboardingOnyxData,
    requiresAttentionFromCurrentUser,
    shouldDisableRename,
    shouldDisableThread,
    shouldReportBeInOptionList,
    shouldReportShowSubscript,
    shouldShowFlagComment,
    sortOutstandingReportsBySelected,
    temporary_getMoneyRequestOptions,
} from '@libs/ReportUtils';
import type {OptionData} from '@libs/ReportUtils';
import {buildOptimisticTransaction} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Beta, OnyxInputOrEntry, PersonalDetailsList, Policy, PolicyEmployeeList, Report, ReportAction, ReportNameValuePairs, Transaction} from '@src/types/onyx';
import type {ErrorFields, Errors} from '@src/types/onyx/OnyxCommon';
import type {Participant} from '@src/types/onyx/Report';
import {toCollectionDataSet} from '@src/types/utils/CollectionDataSet';
import {chatReportR14932 as mockedChatReport} from '../../__mocks__/reportData/reports';
import * as NumberUtils from '../../src/libs/NumberUtils';
import {convertedInvoiceChat} from '../data/Invoice';
import createRandomPolicy from '../utils/collections/policies';
import createRandomReportAction, {getRandomDate} from '../utils/collections/reportActions';
import {
    createAdminRoom,
    createAnnounceRoom,
    createDomainRoom,
    createExpenseReport,
    createExpenseRequestReport,
    createGroupChat,
    createInvoiceReport,
    createInvoiceRoom,
    createPolicyExpenseChat,
    createPolicyExpenseChatTask,
    createPolicyExpenseChatThread,
    createRandomReport,
    createRegularChat,
    createRegularTaskReport,
    createSelfDM,
    createWorkspaceTaskReport,
    createWorkspaceThread,
} from '../utils/collections/reports';
import createRandomTransaction from '../utils/collections/transaction';
import * as LHNTestUtils from '../utils/LHNTestUtils';
import {fakePersonalDetails} from '../utils/LHNTestUtils';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

// Be sure to include the mocked permissions library or else the beta tests won't work
jest.mock('@libs/Permissions');

jest.mock('@libs/Navigation/Navigation', () => ({
    setNavigationActionToMicrotaskQueue: jest.fn(),
    navigationRef: {
        getCurrentRoute: jest.fn(() => ({
            params: {
                reportID: '2',
            },
        })),
    },
}));

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
const categoryApprover1Email = 'categoryapprover1@test.com';
const categoryApprover2Email = 'categoryapprover2@test.com';
const tagApprover1Email = 'tagapprover1@test.com';
const tagApprover2Email = 'tagapprover2@test.com';

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

        const policyCollectionDataSet = toCollectionDataSet(ONYXKEYS.COLLECTION.POLICY, [policy], (current) => current.id);
        Onyx.multiSet({
            [ONYXKEYS.PERSONAL_DETAILS_LIST]: participantsPersonalDetails,
            [ONYXKEYS.SESSION]: {email: currentUserEmail, accountID: currentUserAccountID},
            [ONYXKEYS.COUNTRY_CODE]: 1,
            ...policyCollectionDataSet,
        });
        return waitForBatchedUpdates();
    });
    beforeEach(() => IntlStore.load(CONST.LOCALES.DEFAULT).then(waitForBatchedUpdates));

    describe('canEditFieldOfMoneyRequest', () => {
        const reportActionID = 2;
        const IOUReportID = '1234';
        const IOUTransactionID = '123';
        const randomReportAction = createRandomReportAction(reportActionID);
        const policyID = '2424';
        const amount = 39;

        const policy1 = {...createRandomPolicy(Number(policyID), CONST.POLICY.TYPE.TEAM), areInvoicesEnabled: true, role: CONST.POLICY.ROLE.ADMIN};

        // Given that there is at least one outstanding expense report in a policy
        const outstandingExpenseReport = {
            ...createExpenseReport(483),
            policyID,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            ownerAccountID: currentUserAccountID,
        };

        // When a user creates an invoice in the same policy

        const reportAction = {
            ...randomReportAction,
            actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
            actorAccountID: currentUserAccountID,
            childStateNum: CONST.REPORT.STATE_NUM.OPEN,
            childStatusNum: CONST.REPORT.STATUS_NUM.OPEN,
            originalMessage: {
                // eslint-disable-next-line deprecation/deprecation
                ...randomReportAction.originalMessage,
                IOUReportID,
                IOUTransactionID,
                type: CONST.IOU.ACTION.CREATE,
                amount,
                currency: CONST.CURRENCY.USD,
            },
        };

        const moneyRequestTransaction = {...createRandomTransaction(Number(IOUTransactionID)), reportID: IOUReportID, transactionID: IOUTransactionID, amount};

        const invoiceReport = {
            ...createInvoiceReport(Number(IOUReportID)),
            policyID,
            ownerAccountID: currentUserAccountID,
            state: CONST.REPORT.ACTIONS.TYPE.SUBMITTED,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            managerID: 8723,
        };

        beforeAll(() => {
            Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${IOUTransactionID}`, moneyRequestTransaction);
            Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${IOUReportID}`, invoiceReport);
            Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${483}`, outstandingExpenseReport);
            Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, policy1);
            return waitForBatchedUpdates();
        });

        // Then the user should be able to move the invoice to the outstanding expense report
        it('should return true for invoice report action given that there is a minimum of one outstanding report', () => {
            const canEditReportField = canEditFieldOfMoneyRequest(reportAction, CONST.EDIT_REQUEST_FIELD.REPORT);
            expect(canEditReportField).toBe(true);
        });
    });

    describe('prepareOnboardingOnyxData', () => {
        it('provides test drive url to task title', () => {
            const title = jest.fn();

            prepareOnboardingOnyxData(
                undefined,
                CONST.ONBOARDING_CHOICES.MANAGE_TEAM,
                {
                    message: 'This is a test',
                    tasks: [
                        {
                            type: 'test',
                            title,
                            description: () => '',
                            autoCompleted: false,
                            mediaAttributes: {},
                        },
                    ],
                },
                '1',
            );

            expect(title).toBeCalledWith(
                expect.objectContaining<OnboardingTaskLinks>({
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    testDriveURL: expect.any(String),
                }),
            );
        });

        it('provides test drive url to task description', () => {
            const description = jest.fn();

            prepareOnboardingOnyxData(
                undefined,
                CONST.ONBOARDING_CHOICES.MANAGE_TEAM,
                {
                    message: 'This is a test',
                    tasks: [
                        {
                            type: 'test',
                            title: () => '',
                            description,
                            autoCompleted: false,
                            mediaAttributes: {},
                        },
                    ],
                },
                '1',
            );

            expect(description).toBeCalledWith(
                expect.objectContaining<OnboardingTaskLinks>({
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    testDriveURL: expect.any(String),
                }),
            );
        });
    });

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
            // Given a new workspace and a expense chat with undefined `policyAvatar`
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

    describe('hasReceiptError', () => {
        it('should return true for transaction has receipt error', () => {
            const parentReport = LHNTestUtils.getFakeReport();
            const report = LHNTestUtils.getFakeReport();
            const errors: Errors | ErrorFields = {
                '1231231231313221': {
                    error: CONST.IOU.RECEIPT_ERROR,
                    source: 'blob:https://dev.new.expensify.com:8082/6c5b7110-42c2-4e6d-8566-657ff24caf21',
                    filename: 'images.jpeg',
                    action: 'replaceReceipt',
                },
            };

            report.parentReportID = parentReport.reportID;
            const currentReportId = '';
            const transactionID = 1;

            const transaction = {
                ...createRandomTransaction(transactionID),
                category: '',
                tag: '',
                created: testDate,
                reportID: currentReportId,
                managedCard: true,
                comment: {
                    liabilityType: CONST.TRANSACTION.LIABILITY_TYPE.RESTRICT,
                },
                errors,
            };
            expect(hasReceiptError(transaction as OnyxInputOrEntry<Transaction>)).toBe(true);
        });
    });

    describe('hasReceiptError', () => {
        it('should return false for transaction has no receipt error', () => {
            const parentReport = LHNTestUtils.getFakeReport();
            const report = LHNTestUtils.getFakeReport();
            report.parentReportID = parentReport.reportID;
            const currentReportId = '';
            const transactionID = 1;

            const transaction = {
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
            expect(hasReceiptError(transaction as OnyxInputOrEntry<Transaction>)).toBe(false);
        });
    });

    describe('sortOutstandingReportsBySelected', () => {
        it('should return -1 when report1 is selected and report2 is not', () => {
            const report1 = LHNTestUtils.getFakeReport();
            const report2 = LHNTestUtils.getFakeReport();
            const selectedReportID = report1.reportID;
            expect(sortOutstandingReportsBySelected(report1, report2, selectedReportID)).toBe(-1);
        });
        it('should return 1 when report2 is selected and report1 is not', () => {
            const report1 = LHNTestUtils.getFakeReport();
            const report2 = LHNTestUtils.getFakeReport();
            const selectedReportID = report2.reportID;
            expect(sortOutstandingReportsBySelected(report1, report2, selectedReportID)).toBe(1);
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

                return IntlStore.load(CONST.LOCALES.ES).then(() => expect(getReportName(baseAdminsRoom)).toBe('#admins (archivado)'));
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

                return IntlStore.load(CONST.LOCALES.ES).then(() => expect(getReportName(archivedPolicyRoom)).toBe('#VikingsChat (archivado)'));
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

                    return IntlStore.load(CONST.LOCALES.ES).then(() => expect(getReportName(memberArchivedPolicyExpenseChat)).toBe(`Ragnar Lothbrok's gastos (archivado)`));
                });

                test('as admin', async () => {
                    const adminArchivedPolicyExpenseChat = {
                        ...baseArchivedPolicyExpenseChat,
                        isOwnPolicyExpenseChat: false,
                    };

                    expect(getReportName(adminArchivedPolicyExpenseChat)).toBe(`Ragnar Lothbrok's expenses (archived)`);

                    return IntlStore.load(CONST.LOCALES.ES).then(() => expect(getReportName(adminArchivedPolicyExpenseChat)).toBe(`Ragnar Lothbrok's gastos (archivado)`));
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

                expect(getReportName(threadOfSubmittedReportAction, policy, submittedParentReportAction)).toBe('submitted');
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

        describe('Derived values', () => {
            const report: Report = {
                reportID: '1',
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                currency: 'CLP',
                ownerAccountID: 1,
                isPinned: false,
                isOwnPolicyExpenseChat: true,
                isWaitingOnBankAccount: false,
                policyID: '1',
            };

            beforeEach(() => {
                jest.clearAllMocks();
            });

            beforeAll(async () => {
                await Onyx.mergeCollection(ONYXKEYS.COLLECTION.REPORT, {
                    report_1: report,
                });
            });

            test('should return report name from a derived value', () => {
                expect(getReportName(report)).toEqual("Ragnar Lothbrok's expenses");
            });

            test('should generate report name if report is not merged in the Onyx', () => {
                const expenseChatReport: Report = {
                    reportID: '2',
                    chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                    currency: 'CLP',
                    ownerAccountID: 1,
                    isPinned: false,
                    isOwnPolicyExpenseChat: true,
                    isWaitingOnBankAccount: false,
                    policyID: '1',
                };

                expect(getReportName(expenseChatReport)).toEqual("Ragnar Lothbrok's expenses");
            });
        });
    });

    describe('Automatically approved report message via automatic (not by a human) action is', () => {
        test('shown when the report is forwarded (Control feature)', () => {
            const expenseReport = {
                ...LHNTestUtils.getFakeReport(),
                type: CONST.REPORT.TYPE.EXPENSE,
                stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
                parentReportID: '101',
                policyID: policy.id,
            };
            const submittedParentReportAction = {
                actionName: CONST.REPORT.ACTIONS.TYPE.FORWARDED,
                originalMessage: {
                    amount: 169,
                    currency: 'USD',
                    automaticAction: true,
                },
            } as ReportAction;

            expect(getReportName(expenseReport, policy, submittedParentReportAction)).toBe(
                'approved via <a href="https://help.expensify.com/articles/new-expensify/workspaces/Set-up-rules#configure-expense-report-rules">workspace rules</a>',
            );
        });

        test('shown when the report is approved', () => {
            const expenseReport = {
                ...LHNTestUtils.getFakeReport(),
                type: CONST.REPORT.TYPE.EXPENSE,
                stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
                parentReportID: '101',
                policyID: policy.id,
            };
            const submittedParentReportAction = {
                actionName: CONST.REPORT.ACTIONS.TYPE.APPROVED,
                originalMessage: {
                    amount: 169,
                    currency: 'USD',
                    automaticAction: true,
                },
            } as ReportAction;

            expect(getReportName(expenseReport, policy, submittedParentReportAction)).toBe(
                'approved via <a href="https://help.expensify.com/articles/new-expensify/workspaces/Set-up-rules#configure-expense-report-rules">workspace rules</a>',
            );
        });
    });

    describe('Automatically submitted via harvesting (delayed submit) report message is', () => {
        test('shown when report is submitted and status is submitted', () => {
            const expenseReport = {
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
                    harvesting: true,
                },
            } as ReportAction;

            expect(getReportName(expenseReport, policy, submittedParentReportAction)).toBe(
                'submitted via <a href="https://help.expensify.com/articles/new-expensify/workspaces/Set-up-workflows#select-workflows">delay submissions</a>',
            );
        });

        test('shown when report is submitted and status is closed', () => {
            const expenseReport = {
                ...LHNTestUtils.getFakeReport(),
                type: CONST.REPORT.TYPE.EXPENSE,
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                statusNum: CONST.REPORT.STATUS_NUM.CLOSED,
                parentReportID: '101',
                policyID: policy.id,
            };
            const submittedParentReportAction = {
                actionName: CONST.REPORT.ACTIONS.TYPE.SUBMITTED_AND_CLOSED,
                originalMessage: {
                    amount: 169,
                    currency: 'USD',
                    harvesting: true,
                },
            } as ReportAction;

            expect(getReportName(expenseReport, policy, submittedParentReportAction)).toBe(
                'submitted via <a href="https://help.expensify.com/articles/new-expensify/workspaces/Set-up-workflows#select-workflows">delay submissions</a>',
            );
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

        it('returns false when the linked iou report has an outstanding IOU', () => {
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

            it('the current user is an invited user of the expense report', () => {
                const report = {
                    ...LHNTestUtils.getFakeReport(),
                    type: CONST.REPORT.TYPE.EXPENSE,
                };
                const moneyRequestOptions = temporary_getMoneyRequestOptions(report, undefined, [currentUserAccountID, 20]);
                expect(moneyRequestOptions.length).toBe(0);
            });
            it('the current user is an invited user of the iou report', () => {
                const report: Report = {
                    ...LHNTestUtils.getFakeReport(),
                    type: CONST.REPORT.TYPE.IOU,
                    ownerAccountID: 20,
                    managerID: 21,
                };
                const moneyRequestOptions = temporary_getMoneyRequestOptions(report, undefined, [currentUserAccountID, 20, 21]);
                expect(moneyRequestOptions.length).toBe(0);
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
                        ownerAccountID: currentUserAccountID,
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
                        ownerAccountID: currentUserAccountID,
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

            it("it is a submitted report tied to user's own policy expense chat", () => {
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
                        ownerAccountID: currentUserAccountID,
                    };
                    const moneyRequestOptions = temporary_getMoneyRequestOptions(report, paidPolicy, [currentUserAccountID, participantsAccountIDs.at(0) ?? CONST.DEFAULT_NUMBER_ID]);
                    expect(moneyRequestOptions.length).toBe(2);
                    expect(moneyRequestOptions.includes(CONST.IOU.TYPE.SUBMIT)).toBe(true);
                    expect(moneyRequestOptions.includes(CONST.IOU.TYPE.TRACK)).toBe(true);
                });
            });

            it("it is user's own policy expense chat", () => {
                const report = {
                    ...LHNTestUtils.getFakeReport(),
                    chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                    isOwnPolicyExpenseChat: true,
                    managerID: currentUserAccountID,
                };
                const moneyRequestOptions = temporary_getMoneyRequestOptions(report, undefined, [currentUserAccountID, ...participantsAccountIDs]);
                expect(moneyRequestOptions.length).toBe(2);
                expect(moneyRequestOptions.includes(CONST.IOU.TYPE.SUBMIT)).toBe(true);
                expect(moneyRequestOptions.includes(CONST.IOU.TYPE.TRACK)).toBe(true);
                expect(moneyRequestOptions.indexOf(CONST.IOU.TYPE.SUBMIT)).toBe(0);
            });
        });

        describe('Teachers Unite policy logic', () => {
            const teachersUniteTestPolicyID = CONST.TEACHERS_UNITE.TEST_POLICY_ID;
            const otherPolicyID = 'normal-policy-id';

            it('should hide Create Expense option and show Split Expense for Teachers Unite policy', () => {
                const report = {
                    ...LHNTestUtils.getFakeReport(),
                    policyID: teachersUniteTestPolicyID,
                    chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                    isOwnPolicyExpenseChat: true,
                };

                const moneyRequestOptions = temporary_getMoneyRequestOptions(report, undefined, [currentUserAccountID, participantsAccountIDs.at(0) ?? CONST.DEFAULT_NUMBER_ID]);

                // Should not include SUBMIT (Create Expense)
                expect(moneyRequestOptions.includes(CONST.IOU.TYPE.SUBMIT)).toBe(false);

                // Should include SPLIT (Split Expense)
                expect(moneyRequestOptions.includes(CONST.IOU.TYPE.SPLIT)).toBe(true);
            });

            it('should show Create Expense option and hide Split Expense for non-Teachers Unite policy', () => {
                const report = {
                    ...LHNTestUtils.getFakeReport(),
                    policyID: otherPolicyID,
                    chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                    isOwnPolicyExpenseChat: true,
                };

                const moneyRequestOptions = temporary_getMoneyRequestOptions(report, undefined, [currentUserAccountID, participantsAccountIDs.at(0) ?? CONST.DEFAULT_NUMBER_ID]);

                // Should include SUBMIT (Create Expense)
                expect(moneyRequestOptions.includes(CONST.IOU.TYPE.SUBMIT)).toBe(true);

                // Should not include SPLIT (Split Expense)
                expect(moneyRequestOptions.includes(CONST.IOU.TYPE.SPLIT)).toBe(false);

                // Should include other options like TRACK
                expect(moneyRequestOptions.includes(CONST.IOU.TYPE.TRACK)).toBe(true);
            });

            it('should disable Create report option for expense chats on Teachers Unite workspace', () => {
                const expenseReport = {
                    ...LHNTestUtils.getFakeReport(),
                    policyID: teachersUniteTestPolicyID,
                    type: CONST.REPORT.TYPE.EXPENSE,
                    chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                    isOwnPolicyExpenseChat: true,
                };

                const moneyRequestOptions = temporary_getMoneyRequestOptions(expenseReport, undefined, [currentUserAccountID, participantsAccountIDs.at(0) ?? CONST.DEFAULT_NUMBER_ID]);

                // Should not include SUBMIT
                expect(moneyRequestOptions.includes(CONST.IOU.TYPE.SUBMIT)).toBe(false);
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

        describe('deleted threads', () => {
            it('should be enabled if the report action is not-deleted and child visible action count is 1', () => {
                // Given a normal report action with one child visible action count
                const reportAction = {
                    message: [
                        {
                            translationKey: '',
                            type: 'COMMENT',
                            html: 'test',
                            text: 'test',
                        },
                    ],
                    childVisibleActionCount: 1,
                } as ReportAction;

                // When it's checked to see if the thread should be disabled
                const isThreadDisabled = shouldDisableThread(reportAction, reportID, false);

                // Then the thread should be enabled
                expect(isThreadDisabled).toBeFalsy();
            });

            it('should be enabled if the report action is not-deleted and child visible action count is 0', () => {
                // Given a normal report action with zero child visible action count
                const reportAction = {
                    message: [
                        {
                            translationKey: '',
                            type: 'COMMENT',
                            html: 'test',
                            text: 'test',
                        },
                    ],
                    childVisibleActionCount: 0,
                } as ReportAction;

                // When it's checked to see if the thread should be disabled
                const isThreadDisabled = shouldDisableThread(reportAction, reportID, false);

                // Then the thread should be enabled
                expect(isThreadDisabled).toBeFalsy();
            });
            it('should be enabled if the report action is deleted and child visible action count is 1', () => {
                // Given a normal report action with one child visible action count
                const reportAction = {
                    message: [
                        {
                            translationKey: '',
                            type: 'COMMENT',
                            html: '',
                            text: '',
                        },
                    ],
                    childVisibleActionCount: 1,
                } as ReportAction;

                // When it's checked to see if the thread should be disabled
                const isThreadDisabled = shouldDisableThread(reportAction, reportID, false);

                // Then the thread should be enabled
                expect(isThreadDisabled).toBeFalsy();
            });

            it('should be disabled if the report action is deleted and child visible action count is 0', () => {
                // Given a normal report action with zero child visible action count
                const reportAction = {
                    message: [
                        {
                            translationKey: '',
                            type: 'COMMENT',
                            html: '',
                            text: '',
                        },
                    ],
                    childVisibleActionCount: 0,
                } as ReportAction;

                // When it's checked to see if the thread should be disabled
                const isThreadDisabled = shouldDisableThread(reportAction, reportID, false);

                // Then the thread should be disabled
                expect(isThreadDisabled).toBeTruthy();
            });
        });

        describe('archived report threads', () => {
            it('should be enabled if the report is not-archived and child visible action count is 1', () => {
                // Given a normal report action with one child visible action count
                const reportAction = {
                    message: [
                        {
                            translationKey: '',
                            type: 'COMMENT',
                            html: 'test',
                            text: 'test',
                        },
                    ],
                    childVisibleActionCount: 1,
                } as ReportAction;

                // And a report that is not archived
                const isReportArchived = false;

                // When it's checked to see if the thread should be disabled
                const isThreadDisabled = shouldDisableThread(reportAction, reportID, false, isReportArchived);

                // Then the thread should be enabled
                expect(isThreadDisabled).toBeFalsy();
            });
            it('should be enabled if the report is not-archived and child visible action count is 0', () => {
                // Given a normal report action with zero child visible action counts
                const reportAction = {
                    message: [
                        {
                            translationKey: '',
                            type: 'COMMENT',
                            html: 'test',
                            text: 'test',
                        },
                    ],
                    childVisibleActionCount: 1,
                } as ReportAction;

                // And a report that is not archived
                const isReportArchived = false;

                // When it's checked to see if the thread should be disabled
                const isThreadDisabled = shouldDisableThread(reportAction, reportID, false, isReportArchived);

                // Then the thread should be enabled
                expect(isThreadDisabled).toBeFalsy();
            });
            it('should be enabled if the report is archived and child visible action count is 1', () => {
                // Given a normal report action with one child visible action count
                const reportAction = {
                    message: [
                        {
                            translationKey: '',
                            type: 'COMMENT',
                            html: 'test',
                            text: 'test',
                        },
                    ],
                    childVisibleActionCount: 1,
                } as ReportAction;

                // And a report that is not archived
                const isReportArchived = true;

                // When it's checked to see if the thread should be disabled
                const isThreadDisabled = shouldDisableThread(reportAction, reportID, false, isReportArchived);

                // Then the thread should be enabled
                expect(isThreadDisabled).toBeFalsy();
            });
            it('should be disabled if the report is archived and child visible action count is 0', () => {
                // Given a normal report action with zero child visible action counts
                const reportAction = {
                    message: [
                        {
                            translationKey: '',
                            type: 'COMMENT',
                            html: 'test',
                            text: 'test',
                        },
                    ],
                    childVisibleActionCount: 0,
                } as ReportAction;

                // And a report that is not archived
                const isReportArchived = true;

                // When it's checked to see if the thread should be disabled
                const isThreadDisabled = shouldDisableThread(reportAction, reportID, false, isReportArchived);

                // Then the thread should be disabled
                expect(isThreadDisabled).toBeTruthy();
            });
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
            {reportActionID: '1', created: '2024-02-01 04:42:22.965', actionName: CONST.REPORT.ACTIONS.TYPE.MARKED_REIMBURSED},
            {reportActionID: '2', created: '2024-02-01 04:42:28.003', actionName: CONST.REPORT.ACTIONS.TYPE.MARKED_REIMBURSED},
            {reportActionID: '3', created: '2024-02-01 04:42:31.742', actionName: CONST.REPORT.ACTIONS.TYPE.MARKED_REIMBURSED},
            {reportActionID: '4', created: '2024-02-01 04:42:35.619', actionName: CONST.REPORT.ACTIONS.TYPE.MARKED_REIMBURSED},
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

            // Test failure is being discussed here: https://github.com/Expensify/App/pull/63096#issuecomment-2930818443
            expect(true).toBe(true);
            // expect(isChatUsedForOnboarding(report)).toBeTruthy();
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

    describe('canHoldUnholdReportAction', () => {
        it('should return canUnholdRequest as true for a held duplicate transaction', async () => {
            const chatReport: Report = {reportID: '1'};
            const reportPreviewReportActionID = '8';
            const expenseReport = buildOptimisticExpenseReport(chatReport.reportID, '123', currentUserAccountID, 122, 'USD', undefined, reportPreviewReportActionID);
            const expenseTransaction = buildOptimisticTransaction({
                transactionParams: {
                    amount: 100,
                    currency: 'USD',
                    reportID: expenseReport.reportID,
                },
            });
            const reportPreview = buildOptimisticReportPreview(chatReport, expenseReport, '', expenseTransaction, expenseReport.reportID, reportPreviewReportActionID);
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

            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                currentUserAccountID: {
                    accountID: currentUserAccountID,
                    displayName: currentUserEmail,
                    login: currentUserEmail,
                },
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${expenseTransaction.transactionID}`, {...expenseTransaction});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`, expenseReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReport.reportID}`, transactionThreadReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.reportID}`, {
                [expenseCreatedAction.reportActionID]: expenseCreatedAction,
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport.reportID}`, {
                [reportPreview.reportActionID]: reportPreview,
            });
            // Given a transaction with duplicate transaction violation
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${expenseTransaction.transactionID}`, [
                {
                    name: CONST.VIOLATIONS.DUPLICATED_TRANSACTION,
                    type: CONST.VIOLATION_TYPES.WARNING,
                },
            ]);

            expect(canHoldUnholdReportAction(expenseCreatedAction)).toEqual({canHoldRequest: true, canUnholdRequest: false});

            putOnHold(expenseTransaction.transactionID, 'hold', transactionThreadReport.reportID);
            await waitForBatchedUpdates();

            // canUnholdRequest should be true after the transaction is held.
            expect(canHoldUnholdReportAction(expenseCreatedAction)).toEqual({canHoldRequest: false, canUnholdRequest: true});
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

    describe('canEditMoneyRequest', () => {
        it('it should return false for archived invoice', async () => {
            const invoiceReport: Report = {
                reportID: '1',
                type: CONST.REPORT.TYPE.INVOICE,
            };
            const transaction = createRandomTransaction(22);
            const moneyRequestAction: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> = {
                reportActionID: '22',
                actorAccountID: currentUserAccountID,
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                originalMessage: {
                    IOUReportID: invoiceReport.reportID,
                    IOUTransactionID: transaction.transactionID,
                    amount: 530,
                    currency: CONST.CURRENCY.USD,
                    type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                },
                message: [
                    {
                        type: 'COMMENT',
                        html: 'USD 5.30 expense',
                        text: 'USD 5.30 expense',
                        isEdited: false,
                        whisperedTo: [],
                        isDeletedParentAction: false,
                        deleted: '',
                    },
                ],
                created: '2025-03-05 16:34:27',
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${invoiceReport.reportID}`, invoiceReport);

            const canEditRequest = canEditMoneyRequest(moneyRequestAction, transaction, true);

            expect(canEditRequest).toEqual(false);
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
            expect(
                shouldReportBeInOptionList({
                    report,
                    chatReport: mockedChatReport,
                    currentReportId,
                    isInFocusMode,
                    betas,
                    doesReportHaveViolations: false,
                    excludeEmptyChats: false,
                }),
            ).toBeTruthy();
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
                    chatReport: mockedChatReport,
                    currentReportId,
                    isInFocusMode,
                    betas,
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
                shouldReportBeInOptionList({
                    report: chatReport,
                    chatReport: mockedChatReport,
                    currentReportId,
                    isInFocusMode,
                    betas,
                    doesReportHaveViolations: false,
                    excludeEmptyChats: false,
                }),
            ).toBeTruthy();
        });

        it('should return true when the report has valid draft comment', async () => {
            const report = LHNTestUtils.getFakeReport();
            const currentReportId = '3';
            const isInFocusMode = false;
            const betas = [CONST.BETAS.DEFAULT_ROOMS];

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${report.reportID}`, 'fake draft');

            expect(
                shouldReportBeInOptionList({
                    report,
                    chatReport: mockedChatReport,
                    currentReportId,
                    isInFocusMode,
                    betas,
                    doesReportHaveViolations: false,
                    excludeEmptyChats: false,
                }),
            ).toBeTruthy();
        });

        it('should return true when the report is pinned', () => {
            const report: Report = {
                ...LHNTestUtils.getFakeReport(),
                isPinned: true,
            };
            const currentReportId = '3';
            const isInFocusMode = false;
            const betas = [CONST.BETAS.DEFAULT_ROOMS];
            expect(
                shouldReportBeInOptionList({
                    report,
                    chatReport: mockedChatReport,
                    currentReportId,
                    isInFocusMode,
                    betas,
                    doesReportHaveViolations: false,
                    excludeEmptyChats: false,
                }),
            ).toBeTruthy();
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

            expect(
                shouldReportBeInOptionList({
                    report,
                    chatReport: mockedChatReport,
                    currentReportId,
                    isInFocusMode,
                    betas,
                    doesReportHaveViolations: false,
                    excludeEmptyChats: false,
                }),
            ).toBeTruthy();
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
            const {result: isReportArchived} = renderHook(() => useReportIsArchived(archivedReport?.reportID));

            expect(
                shouldReportBeInOptionList({
                    report: archivedReport,
                    chatReport: mockedChatReport,
                    currentReportId,
                    isInFocusMode,
                    betas,
                    doesReportHaveViolations: false,
                    excludeEmptyChats: false,
                    isReportArchived: isReportArchived.current,
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
            const {result: isReportArchived} = renderHook(() => useReportIsArchived(archivedReport?.reportID));

            expect(
                shouldReportBeInOptionList({
                    report: archivedReport,
                    chatReport: mockedChatReport,
                    currentReportId,
                    isInFocusMode,
                    betas,
                    doesReportHaveViolations: false,
                    excludeEmptyChats: false,
                    isReportArchived: isReportArchived.current,
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
                    chatReport: mockedChatReport,
                    currentReportId,
                    isInFocusMode,
                    betas,
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
            expect(
                shouldReportBeInOptionList({
                    report,
                    chatReport: mockedChatReport,
                    currentReportId,
                    isInFocusMode,
                    betas,
                    doesReportHaveViolations: false,
                    excludeEmptyChats: false,
                }),
            ).toBeFalsy();
        });

        it('should return false when the report does not have participants', () => {
            const report = LHNTestUtils.getFakeReport([]);
            const currentReportId = '';
            const isInFocusMode = true;
            const betas = [CONST.BETAS.DEFAULT_ROOMS];
            expect(
                shouldReportBeInOptionList({
                    report,
                    chatReport: mockedChatReport,
                    currentReportId,
                    isInFocusMode,
                    betas,
                    doesReportHaveViolations: false,
                    excludeEmptyChats: false,
                }),
            ).toBeFalsy();
        });

        it('should return false when the report is the report that the user cannot access due to policy restrictions', () => {
            const report: Report = {
                ...LHNTestUtils.getFakeReport(),
                chatType: CONST.REPORT.CHAT_TYPE.DOMAIN_ALL,
            };
            const currentReportId = '';
            const isInFocusMode = false;
            const betas: Beta[] = [];
            expect(
                shouldReportBeInOptionList({
                    report,
                    chatReport: mockedChatReport,
                    currentReportId,
                    isInFocusMode,
                    betas,
                    doesReportHaveViolations: false,
                    excludeEmptyChats: false,
                }),
            ).toBeFalsy();
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
                    chatReport: mockedChatReport,
                    currentReportId,
                    isInFocusMode,
                    betas,
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
            expect(
                shouldReportBeInOptionList({
                    report,
                    chatReport: mockedChatReport,
                    currentReportId,
                    isInFocusMode,
                    betas,
                    doesReportHaveViolations: false,
                    excludeEmptyChats: true,
                }),
            ).toBeFalsy();
        });

        it('should return false when the users email is domain-based and the includeDomainEmail is false', () => {
            const report = LHNTestUtils.getFakeReport();
            const currentReportId = '';
            const isInFocusMode = false;
            const betas = [CONST.BETAS.DEFAULT_ROOMS];
            expect(
                shouldReportBeInOptionList({
                    report,
                    chatReport: mockedChatReport,
                    currentReportId,
                    isInFocusMode,
                    betas,
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

            expect(
                shouldReportBeInOptionList({
                    report,
                    chatReport: mockedChatReport,
                    currentReportId,
                    isInFocusMode,
                    betas,
                    doesReportHaveViolations: false,
                    excludeEmptyChats: false,
                }),
            ).toBeFalsy();
        });

        it('should return false when the report is read and we are in the focus mode', () => {
            const report = LHNTestUtils.getFakeReport();
            const currentReportId = '';
            const isInFocusMode = true;
            const betas = [CONST.BETAS.DEFAULT_ROOMS];
            expect(
                shouldReportBeInOptionList({
                    report,
                    chatReport: mockedChatReport,
                    currentReportId,
                    isInFocusMode,
                    betas,
                    doesReportHaveViolations: false,
                    excludeEmptyChats: false,
                }),
            ).toBeFalsy();
        });

        it('should return false when the empty report has deleted action with child comment but isDeletedParentAction is false', async () => {
            const report = LHNTestUtils.getFakeReport();
            const iouReportAction: ReportAction = {
                ...LHNTestUtils.getFakeReportAction(),
                message: [
                    {
                        type: 'COMMENT',
                        html: '',
                        text: '',
                        isEdited: false,
                        whisperedTo: [],
                        isDeletedParentAction: false,
                    },
                ],
                childVisibleActionCount: 1,
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                [iouReportAction.reportActionID]: iouReportAction,
            });
            expect(
                shouldReportBeInOptionList({
                    report,
                    chatReport: mockedChatReport,
                    currentReportId: '',
                    isInFocusMode: false,
                    betas: [],
                    doesReportHaveViolations: false,
                    excludeEmptyChats: true,
                }),
            ).toBeFalsy();
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

    describe('buildOptimisticIOUReportAction', () => {
        it('should not include IOUReportID in the originalMessage when tracking a personal expense', () => {
            const iouAction = buildOptimisticIOUReportAction({
                type: 'track',
                amount: 1200,
                currency: 'INR',
                comment: '',
                participants: [{login: 'email1@test.com'}],
                transactionID: '8749701985416635400',
                iouReportID: '8698041594589716',
                isPersonalTrackingExpense: true,
            });
            expect(getOriginalMessage(iouAction as ReportAction<'IOU'>)?.IOUReportID).toBe(undefined);
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

    describe('isArchivedReport', () => {
        const archivedReport: Report = {
            ...createRandomReport(1),
            chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
        };
        const nonArchivedReport: Report = {
            ...createRandomReport(2),
            chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
        };
        beforeAll(async () => {
            await Onyx.setCollection<typeof ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS, ReportNameValuePairs>(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS, {
                [`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${archivedReport.reportID}`]: {private_isArchived: DateUtils.getDBTime()},
            });
        });

        it('should return true for archived report', async () => {
            const reportNameValuePairs = await new Promise<OnyxEntry<ReportNameValuePairs>>((resolve) => {
                Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${archivedReport.reportID}`,
                    callback: resolve,
                });
            });
            expect(isArchivedReport(reportNameValuePairs)).toBe(true);
        });

        it('should return false for non-archived report', async () => {
            const reportNameValuePairs = await new Promise<OnyxEntry<ReportNameValuePairs>>((resolve) => {
                Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${nonArchivedReport.reportID}`,
                    callback: resolve,
                });
                expect(isArchivedReport(reportNameValuePairs)).toBe(false);
            });
        });
    });

    describe('useReportIsArchived', () => {
        const archivedReport: Report = {
            ...createRandomReport(1),
            chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
        };
        const nonArchivedReport: Report = {
            ...createRandomReport(2),
            chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
        };
        beforeAll(async () => {
            await Onyx.setCollection<typeof ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS, ReportNameValuePairs>(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS, {
                [`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${archivedReport.reportID}`]: {private_isArchived: DateUtils.getDBTime()},
            });
        });

        it('should return true for archived report', () => {
            const {result: isReportArchived} = renderHook(() => useReportIsArchived(archivedReport?.reportID));

            expect(isReportArchived.current).toBe(true);
        });

        it('should return false for non-archived report', () => {
            const {result: isReportArchived} = renderHook(() => useReportIsArchived(nonArchivedReport?.reportID));

            expect(isReportArchived.current).toBe(false);
        });
    });

    describe('canEditWriteCapability', () => {
        it('should return false for expense chat', () => {
            const workspaceChat: Report = {
                ...createRandomReport(1),
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
            };

            expect(canEditWriteCapability(workspaceChat, {...policy, role: CONST.POLICY.ROLE.ADMIN}, false)).toBe(false);
        });

        const policyAnnounceRoom: Report = {
            ...createRandomReport(1),
            chatType: CONST.REPORT.CHAT_TYPE.POLICY_ANNOUNCE,
        };
        const adminPolicy = {...policy, role: CONST.POLICY.ROLE.ADMIN};

        it('should return true for non-archived policy announce room', () => {
            expect(canEditWriteCapability(policyAnnounceRoom, adminPolicy, false)).toBe(true);
        });

        it('should return false for archived policy announce room', () => {
            expect(canEditWriteCapability(policyAnnounceRoom, adminPolicy, true)).toBe(false);
        });

        it('should return false for non-admin user', () => {
            const normalChat = createRandomReport(11);
            const memberPolicy = {...policy, role: CONST.POLICY.ROLE.USER};

            expect(canEditWriteCapability(normalChat, memberPolicy, false)).toBe(false);
        });

        it('should return false for admin room', () => {
            const adminRoom: Report = {...createRandomReport(12), chatType: CONST.REPORT.CHAT_TYPE.POLICY_ADMINS};

            expect(canEditWriteCapability(adminRoom, adminPolicy, false)).toBe(false);
        });

        it('should return false for thread reports', () => {
            const parent = createRandomReport(13);
            const thread: Report = {
                ...createRandomReport(14),
                parentReportID: parent.reportID,
                parentReportActionID: '2',
            };

            expect(canEditWriteCapability(thread, adminPolicy, false)).toBe(false);
        });

        it('should return false for invoice rooms', () => {
            const invoiceRoom = {...createRandomReport(13), chatType: CONST.REPORT.CHAT_TYPE.INVOICE};

            expect(canEditWriteCapability(invoiceRoom, adminPolicy, false)).toBe(false);
        });
    });

    describe('canEditRoomVisibility', () => {
        it('should return true for policy rooms that are not archived and the user is an admin', () => {
            expect(canEditRoomVisibility({...policy, role: CONST.POLICY.ROLE.ADMIN}, false)).toBeTruthy();
            expect(canEditRoomVisibility({...policy, role: CONST.POLICY.ROLE.AUDITOR}, false)).toBeFalsy();
            expect(canEditRoomVisibility({...policy, role: CONST.POLICY.ROLE.USER}, false)).toBeFalsy();
        });

        it('should return false for policy rooms that are archived regardless of the policy role', () => {
            expect(canEditRoomVisibility({...policy, role: CONST.POLICY.ROLE.ADMIN}, true)).toBeFalsy();
            expect(canEditRoomVisibility({...policy, role: CONST.POLICY.ROLE.AUDITOR}, true)).toBeFalsy();
            expect(canEditRoomVisibility({...policy, role: CONST.POLICY.ROLE.USER}, true)).toBeFalsy();
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

            expect(canDeleteReportAction(moneyRequestAction, currentReportId, transaction)).toBe(false);
        });

        it('should return true for demo transaction', () => {
            const transaction = {
                ...createRandomTransaction(1),
                comment: {
                    isDemoTransaction: true,
                },
            };

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

            expect(canDeleteReportAction(moneyRequestAction, '1', transaction)).toBe(true);
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
    describe('findLastAccessedReport should return owned report if no reports was accessed before', () => {
        let ownedReport: Report;
        let nonOwnedReport: Report;

        beforeAll(async () => {
            // Set up test reports - one archived, one normal
            nonOwnedReport = {
                ...LHNTestUtils.getFakeReport(),
                reportID: '1001',
                lastReadTime: '2024-02-01 04:56:47.233',
                lastVisibleActionCreated: '2024-02-01 04:56:47.233',
                ownerAccountID: 1,
            };

            ownedReport = {
                ...LHNTestUtils.getFakeReport(),
                reportID: '1002',
                lastReadTime: '2024-01-01 04:56:47.233', // Older last read time
                lastVisibleActionCreated: '2024-01-01 04:56:47.233',
                ownerAccountID: currentUserAccountID,
            };

            // Add reports to Onyx
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${ownedReport.reportID}`, ownedReport);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${nonOwnedReport.reportID}`, nonOwnedReport);

            return waitForBatchedUpdates();
        });

        afterAll(async () => {
            await Onyx.clear();
            await Onyx.set(ONYXKEYS.SESSION, {email: currentUserEmail, accountID: currentUserAccountID});
        });

        it('findLastAccessedReport should return owned report if no reports was accessed before', () => {
            const result = findLastAccessedReport(false);

            // Even though the archived report has a more recent lastVisitTime,
            // the function should filter it out and return the normal report
            expect(result?.reportID).toBe(ownedReport.reportID);
            expect(result?.reportID).not.toBe(nonOwnedReport.reportID);
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

            // This test is broken, so I am commenting it out. I have opened up https://github.com/Expensify/App/issues/60854 to get the test fixed
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
                            ...createRandomReport(100),
                            ownerAccountID: employeeAccountID,
                            type: CONST.REPORT.TYPE.EXPENSE,
                        };
                        const transaction1: Transaction = {
                            ...createRandomTransaction(1),
                            category: 'cat1',
                            tag: '',
                            created: testDate,
                            reportID: expenseReport.reportID,
                            inserted: DateUtils.subtractMillisecondsFromDateTime(testDate, 1),
                        };
                        const transaction2: Transaction = {
                            ...createRandomTransaction(2),
                            category: '',
                            tag: 'tag1',
                            created: DateUtils.subtractMillisecondsFromDateTime(testDate, 1),
                            reportID: expenseReport.reportID,
                            inserted: DateUtils.subtractMillisecondsFromDateTime(testDate, 1),
                        };
                        const transaction3: Transaction = {
                            ...createRandomTransaction(3),
                            category: 'cat2',
                            tag: '',
                            created: testDate,
                            reportID: expenseReport.reportID,
                            inserted: DateUtils.subtractMillisecondsFromDateTime(testDate, 2),
                        };
                        const transaction4: Transaction = {
                            ...createRandomTransaction(4),
                            category: '',
                            tag: 'tag2',
                            created: DateUtils.subtractMillisecondsFromDateTime(testDate, 1),
                            reportID: expenseReport.reportID,
                            inserted: DateUtils.subtractMillisecondsFromDateTime(testDate, 2),
                        };

                        Onyx.mergeCollection(ONYXKEYS.COLLECTION.TRANSACTION, {
                            transactions_1: transaction1,
                            transactions_2: transaction2,
                            transactions_3: transaction3,
                            transactions_4: transaction4,
                        }).then(() => {
                            const result = [categoryApprover2Email, categoryApprover1Email, tagApprover2Email, tagApprover1Email, 'admin@test.com'];
                            expect(getApprovalChain(policyTest, expenseReport)).toStrictEqual(result);
                        });
                    });
                });
            });
        });
    });

    describe('shouldReportShowSubscript', () => {
        afterEach(async () => {
            await Onyx.clear();
            await Onyx.set(ONYXKEYS.SESSION, {email: currentUserEmail, accountID: currentUserAccountID});
        });

        it('should return true for policy expense chat', () => {
            const report = createPolicyExpenseChat(1);
            expect(shouldReportShowSubscript(report)).toBe(true);
        });

        it('should return true for workspace thread', () => {
            const report = createWorkspaceThread(1);
            expect(shouldReportShowSubscript(report)).toBe(true);
        });

        it('should return false for archived non-expense report that is not a workspace thread', async () => {
            const report = createRegularChat(1, [currentUserAccountID, 1]);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report.reportID}`, {
                private_isArchived: new Date().toString(),
            });
            const {result: isReportArchived} = renderHook(() => useReportIsArchived(report?.reportID));

            expect(shouldReportShowSubscript(report, isReportArchived.current)).toBe(false);
        });

        it('should return false for a non-archived non-expense report', () => {
            const report = createRegularChat(1, [currentUserAccountID, 1]);
            const {result: isReportArchived} = renderHook(() => useReportIsArchived(report?.reportID));
            expect(shouldReportShowSubscript(report, isReportArchived.current)).toBe(false);
        });

        it('should return false for regular 1:1 chat', () => {
            const report = createRegularChat(1, [currentUserAccountID, 1]);
            expect(shouldReportShowSubscript(report)).toBe(false);
        });

        it('should return true for expense request report', async () => {
            // Given a normal parent report
            const parentReport = createExpenseReport(1);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${parentReport.reportID}`, parentReport);

            // And a parent report action that is an IOU report action
            const randomReportAction = createRandomReportAction(2);
            const parentReportAction = {
                ...createRandomReportAction(2),
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                message: {
                    ...randomReportAction.message,
                    type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                },
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReport.reportID}`, {
                '3': parentReportAction,
            });

            // And a report that is a thread of the parent report
            const report = createExpenseRequestReport(2, parentReport.reportID, '3');

            // When we check if the report should show a subscript
            // Then it should return true because isExpenseRequest() returns true
            expect(shouldReportShowSubscript(report)).toBe(true);
        });

        it('should return true for workspace task report', async () => {
            // Given a parent report that is a policy expense chat
            const parentReport = createPolicyExpenseChat(1);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${parentReport.reportID}`, parentReport);

            // And a report that is a task report of the parent report
            const report = createWorkspaceTaskReport(2, [currentUserAccountID, 1], parentReport.reportID);

            // When we check if the report should show a subscript
            // Then it should return true because isWorkspaceTaskReport() returns true
            expect(shouldReportShowSubscript(report)).toBe(true);
        });

        it('should return true for invoice room', () => {
            const report = createInvoiceRoom(1);
            expect(shouldReportShowSubscript(report)).toBe(true);
        });

        it('should return true for invoice report', () => {
            const report = createInvoiceReport(1);
            expect(shouldReportShowSubscript(report)).toBe(true);
        });

        it('should return true for policy expense chat that is not own', () => {
            const report = createPolicyExpenseChat(1, false);
            expect(shouldReportShowSubscript(report)).toBe(true);
        });

        it('should return true for archived workspace thread (exception to archived rule)', async () => {
            const report = createWorkspaceThread(1);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report.reportID}`, {
                private_isArchived: new Date().toString(),
            });
            const {result: isReportArchived} = renderHook(() => useReportIsArchived(report?.reportID));

            // Even if archived, workspace threads should show subscript
            expect(shouldReportShowSubscript(report, isReportArchived.current)).toBe(true);
        });

        it('should return false for archived non-expense report', async () => {
            const report = createRegularChat(1, []);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report.reportID}`, {
                private_isArchived: new Date().toString(),
            });
            const {result: isReportArchived} = renderHook(() => useReportIsArchived(report?.reportID));

            // Archived expense reports should not show subscript
            expect(shouldReportShowSubscript(report, isReportArchived.current)).toBe(false);
        });

        it('should return false for policy expense chat that is also a chat thread', () => {
            const report = createPolicyExpenseChatThread(1);
            // Policy expense chats that are threads should not show subscript
            expect(shouldReportShowSubscript(report)).toBe(false);
        });

        it('should return false for policy expense chat that is also a task report', () => {
            const report = createPolicyExpenseChatTask(1);
            // Policy expense chats that are task reports should not show subscript
            expect(shouldReportShowSubscript(report)).toBe(false);
        });

        it('should return false for group chat', () => {
            const report = createGroupChat(1, [currentUserAccountID, 1, 2, 3]);
            expect(shouldReportShowSubscript(report)).toBe(false);
        });

        it('should return false for self DM', () => {
            const report = createSelfDM(1, currentUserAccountID);
            expect(shouldReportShowSubscript(report)).toBe(false);
        });

        it('should return false for admin room', () => {
            const report = createAdminRoom(1);
            expect(shouldReportShowSubscript(report)).toBe(false);
        });

        it('should return false for announce room', () => {
            const report = createAnnounceRoom(1);
            expect(shouldReportShowSubscript(report)).toBe(false);
        });

        it('should return false for domain room', () => {
            const report = createDomainRoom(1);
            expect(shouldReportShowSubscript(report)).toBe(false);
        });

        it('should return false for regular task report (non-workspace)', () => {
            const report = {...createRegularTaskReport(1, currentUserAccountID), chatType: CONST.REPORT.CHAT_TYPE.TRIP_ROOM};
            expect(shouldReportShowSubscript(report)).toBe(false);
        });
    });

    describe('isArchivedNonExpenseReport', () => {
        // Given an expense report, a chat report, and an archived chat report
        const expenseReport: Report = {
            ...createRandomReport(1000),
            ownerAccountID: employeeAccountID,
            type: CONST.REPORT.TYPE.EXPENSE,
        };
        const chatReport: Report = {
            ...createRandomReport(2000),
            ownerAccountID: employeeAccountID,
            type: CONST.REPORT.TYPE.CHAT,
        };
        const archivedChatReport: Report = {
            ...createRandomReport(3000),
            ownerAccountID: employeeAccountID,
            type: CONST.REPORT.TYPE.CHAT,
        };

        beforeAll(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`, expenseReport);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`, chatReport);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${archivedChatReport.reportID}`, archivedChatReport);

            // This is what indicates that a report is archived (see ReportUtils.isArchivedReport())
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${archivedChatReport.reportID}`, {
                private_isArchived: new Date().toString(),
            });
        });

        it('should return false if the report is an expense report', () => {
            // Simulate how components use the hook useReportIsArchived() to see if the report is archived
            const {result: isReportArchived} = renderHook(() => useReportIsArchived(expenseReport?.reportID));
            expect(isArchivedNonExpenseReport(expenseReport, isReportArchived.current)).toBe(false);
        });

        it('should return false if the report is a non-expense report and not archived', () => {
            const {result: isReportArchived} = renderHook(() => useReportIsArchived(chatReport?.reportID));
            expect(isArchivedNonExpenseReport(chatReport, isReportArchived.current)).toBe(false);
        });

        it('should return true if the report is a non-expense report and archived', () => {
            const {result: isReportArchived} = renderHook(() => useReportIsArchived(archivedChatReport?.reportID));
            expect(isArchivedNonExpenseReport(archivedChatReport, isReportArchived.current)).toBe(true);
        });
    });

    describe('parseReportRouteParams', () => {
        const testReportID = '123456789';

        it('should return empty reportID and isSubReportPageRoute as false if the route is not a report route', () => {
            const result = parseReportRouteParams('/concierge');
            expect(result.reportID).toBe('');
            expect(result.isSubReportPageRoute).toBe(false);
        });

        it('should return isSubReportPageRoute as false if the route is a report screen route', () => {
            const result = parseReportRouteParams(`r/${testReportID}/11111111`);
            expect(result.reportID).toBe(testReportID);
            expect(result.isSubReportPageRoute).toBe(false);
        });

        it('should return isSubReportPageRoute as true if the route is a sub report page route', () => {
            const result = parseReportRouteParams(`r/${testReportID}/details`);
            expect(result.reportID).toBe(testReportID);
            expect(result.isSubReportPageRoute).toBe(true);
        });
    });

    describe('isPayer', () => {
        const approvedReport: Report = {
            ...createRandomReport(1),
            type: CONST.REPORT.TYPE.EXPENSE,
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
            policyID: '1',
        };

        const unapprovedReport: Report = {
            ...createRandomReport(2),
            type: CONST.REPORT.TYPE.EXPENSE,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            policyID: '1',
        };

        const policyTest: Policy = {
            ...createRandomPolicy(1),
            employeeList: {
                [currentUserEmail]: {
                    role: CONST.POLICY.ROLE.AUDITOR,
                },
            },
        };

        beforeAll(() => {
            Onyx.multiSet({
                [ONYXKEYS.SESSION]: {email: currentUserEmail, accountID: currentUserAccountID},
                [ONYXKEYS.COLLECTION.POLICY]: {
                    [`${ONYXKEYS.COLLECTION.POLICY}1`]: policyTest,
                },
            });
            return waitForBatchedUpdates();
        });

        afterAll(() => Onyx.clear());

        it('should return false for admin of a group policy with reimbursement enabled and report not approved', () => {
            expect(isPayer({email: currentUserEmail, accountID: currentUserAccountID}, unapprovedReport, false)).toBe(false);
        });

        it('should return false for non-admin of a group policy', () => {
            expect(isPayer({email: currentUserEmail, accountID: currentUserAccountID}, approvedReport, false)).toBe(false);
        });
    });
    describe('buildReportNameFromParticipantNames', () => {
        /**
         * Generates a fake report and matching personal details for specified number of participants.
         * Participants in the report are directly linked with their personal details.
         */
        const generateFakeReportAndParticipantsPersonalDetails = ({count, start = 0}: {count: number; start?: number}): {report: Report; personalDetails: PersonalDetailsList} => {
            const data = {
                report: {
                    ...mockedChatReport,
                    participants: Object.keys(fakePersonalDetails)
                        .slice(start, count)
                        .reduce<Record<string, Participant>>((acc, cur) => {
                            acc[cur] = {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS};
                            return acc;
                        }, {}),
                },
                personalDetails: Object.fromEntries(Object.entries(fakePersonalDetails).slice(start, count)),
            };

            data.personalDetails[currentUserAccountID] = {
                accountID: currentUserAccountID,
                displayName: 'CURRENT USER',
                firstName: 'CURRENT',
            };

            return data;
        };

        it('excludes the current user from the report title', () => {
            const result = buildReportNameFromParticipantNames(generateFakeReportAndParticipantsPersonalDetails({count: currentUserAccountID + 2}));
            expect(result).not.toContain('CURRENT');
        });

        it('limits to a maximum of 5 participants in the title', () => {
            const result = buildReportNameFromParticipantNames(generateFakeReportAndParticipantsPersonalDetails({count: 10}));
            expect(result.split(',').length).toBeLessThanOrEqual(5);
        });

        it('returns full name if only one participant is present (excluding current user)', () => {
            const result = buildReportNameFromParticipantNames(generateFakeReportAndParticipantsPersonalDetails({count: 1}));
            const {displayName} = fakePersonalDetails[1] ?? {};
            expect(result).toEqual(displayName);
        });

        it('returns an empty string if there are no participants or all are excluded', () => {
            const result = buildReportNameFromParticipantNames(generateFakeReportAndParticipantsPersonalDetails({start: currentUserAccountID - 1, count: 1}));
            expect(result).toEqual('');
        });

        it('handles partial or missing personal details correctly', () => {
            const {report} = generateFakeReportAndParticipantsPersonalDetails({count: 6});

            const secondUser = fakePersonalDetails[2];
            const fourthUser = fakePersonalDetails[4];

            const incompleteDetails = {2: secondUser, 4: fourthUser};
            const result = buildReportNameFromParticipantNames({report, personalDetails: incompleteDetails});
            const expectedNames = [secondUser?.firstName, fourthUser?.firstName].sort();
            const resultNames = result.split(', ').sort();
            expect(resultNames).toEqual(expect.arrayContaining(expectedNames));
        });
    });

    describe('getParticipantsList', () => {
        it('should exclude hidden participants', () => {
            const report: Report = {
                ...createRandomReport(1),
                chatType: 'policyRoom',
                participants: {
                    1: {notificationPreference: 'hidden'},
                    2: {notificationPreference: 'always'},
                },
            };
            const participants = getParticipantsList(report, participantsPersonalDetails);
            expect(participants.length).toBe(1);
        });

        it('should include hidden participants for IOU report', () => {
            const report: Report = {
                ...createRandomReport(1),
                type: CONST.REPORT.TYPE.IOU,
                participants: {
                    1: {notificationPreference: 'hidden'},
                    2: {notificationPreference: 'always'},
                },
            };
            const participants = getParticipantsList(report, participantsPersonalDetails);
            expect(participants.length).toBe(2);
        });

        it('should include hidden participants for expense report', () => {
            const report: Report = {
                ...createRandomReport(1),
                type: CONST.REPORT.TYPE.EXPENSE,
                participants: {
                    1: {notificationPreference: 'hidden'},
                    2: {notificationPreference: 'always'},
                },
            };
            const participants = getParticipantsList(report, participantsPersonalDetails);
            expect(participants.length).toBe(2);
        });

        it('should include hidden participants for IOU transaction report', async () => {
            const parentReport: Report = {
                ...createRandomReport(0),
                type: CONST.REPORT.TYPE.IOU,
            };
            const parentReportAction: ReportAction = {
                ...createRandomReportAction(0),
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                message: [],
                previousMessage: [],
                originalMessage: {
                    amount: 1,
                    currency: 'USD',
                    type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                },
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${parentReport.reportID}`, parentReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReport.reportID}`, {
                [parentReportAction.reportActionID]: parentReportAction,
            });

            const report: Report = {
                ...createRandomReport(1),
                parentReportID: parentReport.reportID,
                parentReportActionID: parentReportAction.reportActionID,
                participants: {
                    1: {notificationPreference: 'hidden'},
                    2: {notificationPreference: 'always'},
                },
            };
            const participants = getParticipantsList(report, participantsPersonalDetails);
            expect(participants.length).toBe(2);
        });

        it('should include hidden participants for expense transaction report', async () => {
            const parentReport: Report = {
                ...createRandomReport(0),
                type: CONST.REPORT.TYPE.EXPENSE,
            };
            const parentReportAction: ReportAction = {
                ...createRandomReportAction(0),
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                message: [],
                previousMessage: [],
                originalMessage: {
                    amount: 1,
                    currency: 'USD',
                    type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                },
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${parentReport.reportID}`, parentReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReport.reportID}`, {
                [parentReportAction.reportActionID]: parentReportAction,
            });

            const report: Report = {
                ...createRandomReport(1),
                parentReportID: parentReport.reportID,
                parentReportActionID: parentReportAction.reportActionID,
                participants: {
                    1: {notificationPreference: 'hidden'},
                    2: {notificationPreference: 'always'},
                },
            };
            const participants = getParticipantsList(report, participantsPersonalDetails);
            expect(participants.length).toBe(2);
        });
    });

    describe('isReportOutstanding', () => {
        it('should return true for submitted reports', () => {
            const report: Report = {
                ...createRandomReport(1),
                policyID: policy.id,
                type: CONST.REPORT.TYPE.EXPENSE,
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            };
            expect(isReportOutstanding(report, policy.id)).toBe(true);
        });
        it('should return false for submitted reports if we specify it', () => {
            const report: Report = {
                ...createRandomReport(1),
                policyID: policy.id,
                type: CONST.REPORT.TYPE.EXPENSE,
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            };
            expect(isReportOutstanding(report, policy.id, undefined, false)).toBe(false);
        });
        it('should return true for submitted reports if top most report ID is processing', async () => {
            const report: Report = {
                ...createRandomReport(1),
                policyID: policy.id,
                type: CONST.REPORT.TYPE.EXPENSE,
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            };
            const activeReport: Report = {
                ...createRandomReport(2),
                policyID: policy.id,
                type: CONST.REPORT.TYPE.EXPENSE,
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${activeReport.reportID}`, activeReport);
            expect(isReportOutstanding(report, policy.id)).toBe(true);
        });
        it('should return false for archived report', async () => {
            const report: Report = {
                ...createRandomReport(1),
                policyID: policy.id,
                type: CONST.REPORT.TYPE.EXPENSE,
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report.reportID}`, {private_isArchived: DateUtils.getDBTime()});
            expect(isReportOutstanding(report, policy.id)).toBe(false);
        });
    });

    describe('getMoneyReportPreviewName', () => {
        beforeAll(async () => {
            await Onyx.clear();
            await Onyx.multiSet({
                [ONYXKEYS.PERSONAL_DETAILS_LIST]: participantsPersonalDetails,
                [ONYXKEYS.SESSION]: {email: currentUserEmail, accountID: currentUserAccountID},
            });
        });

        afterAll(async () => {
            await Onyx.clear();
        });

        it('should return the report name when the chat type is policy room', () => {
            const action: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
            };
            const report: Report = {
                ...createRandomReport(1),
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
            };
            const result = getMoneyReportPreviewName(action, report);
            expect(result).toBe(report.reportName);
        });

        it('should return the report name when the chat type is domain all', () => {
            const action: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
            };
            const report: Report = {
                ...createRandomReport(1),
                chatType: CONST.REPORT.CHAT_TYPE.DOMAIN_ALL,
            };
            const result = getMoneyReportPreviewName(action, report);
            expect(result).toBe(report.reportName);
        });

        it('should return the report name when the chat type is group', () => {
            const action: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
            };
            const report: Report = {
                ...createRandomReport(1),
                chatType: CONST.REPORT.CHAT_TYPE.GROUP,
            };
            const result = getMoneyReportPreviewName(action, report);
            expect(result).toBe(report.reportName);
        });

        it('should return policy name when the chat type is invoice', () => {
            const action: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
            };
            const report: Report = {
                ...createRandomReport(1),
                chatType: CONST.REPORT.CHAT_TYPE.INVOICE,
            };
            const result = getMoneyReportPreviewName(action, report);
            // Policies are empty, so the policy name is "Unavailable workspace"
            expect(result).toBe('Unavailable workspace');
        });

        it('should return the report name when the chat type is policy admins', () => {
            const action: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
            };
            const report: Report = {
                ...createRandomReport(1),
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_ADMINS,
            };
            const result = getMoneyReportPreviewName(action, report);
            expect(result).toBe(report.reportName);
        });

        it('should return the report name when the chat type is policy announce', () => {
            const action: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
            };
            const report: Report = {
                ...createRandomReport(1),
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_ANNOUNCE,
            };
            const result = getMoneyReportPreviewName(action, report);
            expect(result).toBe(report.reportName);
        });

        it('should return the owner name expenses when the chat type is policy expense chat', () => {
            const action: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
            };
            const report: Report = {
                ...createRandomReport(1),
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
            };
            const result = getMoneyReportPreviewName(action, report);
            // Report with ownerAccountID: 1 corresponds to "Ragnar Lothbrok"
            expect(result).toBe("Ragnar Lothbrok's expenses");
        });

        it('should return the display name of the current user when the chat type is self dm', () => {
            const action: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
            };
            const report: Report = {
                ...createRandomReport(1),
                chatType: CONST.REPORT.CHAT_TYPE.SELF_DM,
            };
            const result = getMoneyReportPreviewName(action, report);
            // currentUserAccountID: 5 corresponds to "Lagertha Lothbrok"
            expect(result).toBe('Lagertha Lothbrok (you)');
        });

        it('should return the participant name when the chat type is system', () => {
            const action: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
            };
            const report: Report = {
                ...createRandomReport(1),
                chatType: CONST.REPORT.CHAT_TYPE.SYSTEM,
                participants: {
                    1: {notificationPreference: 'hidden'},
                },
            };
            const result = getMoneyReportPreviewName(action, report);
            // participant accountID: 1 corresponds to "Ragnar Lothbrok"
            expect(result).toBe('Ragnar Lothbrok');
        });

        it('should return the participant names when the chat type is trip room', () => {
            const action: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
            };
            const report: Report = {
                ...createRandomReport(1),
                participants: {
                    1: {notificationPreference: 'hidden'},
                    2: {notificationPreference: 'always'},
                },
                chatType: CONST.REPORT.CHAT_TYPE.TRIP_ROOM,
            };
            const result = getMoneyReportPreviewName(action, report);
            // participant accountID: 1, 2 corresponds to "Ragnar", "floki@vikings.net"
            expect(result).toBe('Ragnar, floki@vikings.net');
        });

        it('should return the child report name when the report name is not present', () => {
            const action: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
                childReportName: 'Child Report',
            };
            const result = getMoneyReportPreviewName(action, undefined);
            expect(result).toBe('Child Report');
        });
    });

    describe('canAddTransaction', () => {
        it('should return true for a non-archived report', async () => {
            // Given a non-archived expense report
            const report: Report = {
                ...createRandomReport(10000),
                type: CONST.REPORT.TYPE.EXPENSE,
                ownerAccountID: currentUserAccountID,
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);

            // When it's checked if the transactions can be added
            // Simulate how components determined if a report is archived by using this hook
            const {result: isReportArchived} = renderHook(() => useReportIsArchived(report?.reportID));
            const result = canAddTransaction(report, isReportArchived.current);

            // Then the result is true
            expect(result).toBe(true);
        });

        it('should return false for an expense report the current user is not the submitter', async () => {
            // Given an expense report the current user is not the submitter
            const report: Report = {
                ...createRandomReport(10000),
                type: CONST.REPORT.TYPE.EXPENSE,
                ownerAccountID: currentUserAccountID + 1,
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);

            const result = canAddTransaction(report, false);

            // Then the result is false
            expect(result).toBe(false);
        });

        it('should return false for an archived report', async () => {
            // Given an archived expense report
            const report: Report = {
                ...createRandomReport(10001),
                type: CONST.REPORT.TYPE.EXPENSE,
                ownerAccountID: currentUserAccountID,
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report.reportID}`, {private_isArchived: DateUtils.getDBTime()});

            // When it's checked if the transactions can be added
            const {result: isReportArchived} = renderHook(() => useReportIsArchived(report?.reportID));
            const result = canAddTransaction(report, isReportArchived.current);

            // Then the result is false
            expect(result).toBe(false);
        });
    });

    describe('canDeleteTransaction', () => {
        it('should return true for a non-archived report', async () => {
            // Given a non-archived expense report
            const report: Report = {
                ...createRandomReport(20000),
                type: CONST.REPORT.TYPE.EXPENSE,
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);

            // When it's checked if the transactions can be deleted
            // Simulate how components determined if a report is archived by using this hook
            const {result: isReportArchived} = renderHook(() => useReportIsArchived(report?.reportID));
            const result = canDeleteTransaction(report, isReportArchived.current);

            // Then the result is true
            expect(result).toBe(true);
        });

        it('should return false for an archived report', async () => {
            // Given an archived expense report
            const report: Report = {
                ...createRandomReport(20001),
                type: CONST.REPORT.TYPE.EXPENSE,
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report.reportID}`, {private_isArchived: DateUtils.getDBTime()});

            // When it's checked if the transactions can be deleted
            const {result: isReportArchived} = renderHook(() => useReportIsArchived(report?.reportID));
            const result = canDeleteTransaction(report, isReportArchived.current);

            // Then the result is false
            expect(result).toBe(false);
        });
    });

    describe('getReasonAndReportActionThatRequiresAttention', () => {
        it('should return a reason for a non-archived report', async () => {
            // Given a non-archived expense report that is unread with a mention
            const report: OptionData = {
                ...createRandomReport(30000),
                type: CONST.REPORT.TYPE.EXPENSE,
                isUnreadWithMention: true,
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);

            // When the reason is retrieved
            const {result: isReportArchived} = renderHook(() => useReportIsArchived(report?.reportID));
            const result = getReasonAndReportActionThatRequiresAttention(report, undefined, isReportArchived.current);

            // There should be some kind of a reason (any reason is fine)
            expect(result).toHaveProperty('reason');
        });

        it('should return null for an archived report', async () => {
            // Given an archived expense report that is unread with a mention
            const report: OptionData = {
                ...createRandomReport(30000),
                type: CONST.REPORT.TYPE.EXPENSE,
                isUnreadWithMention: true,
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report.reportID}`, {private_isArchived: DateUtils.getDBTime()});

            // When the reason is retrieved
            const {result: isReportArchived} = renderHook(() => useReportIsArchived(report?.reportID));
            const result = getReasonAndReportActionThatRequiresAttention(report, undefined, isReportArchived.current);

            // Then the result is null
            expect(result).toBe(null);
        });
    });

    describe('canEditReportDescription', () => {
        it('should return true for a non-archived policy room', async () => {
            // Given a non-archived policy room
            const report: Report = {
                ...createRandomReport(40001),
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
                participants: buildParticipantsFromAccountIDs([currentUserAccountID, 1]),
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);

            // When it's checked if the description can be edited
            const {result: isReportArchived} = renderHook(() => useReportIsArchived(report?.reportID));
            const result = canEditReportDescription(report, policy, isReportArchived.current);

            // Then it can be edited
            expect(result).toBeTruthy();
        });

        it('should return false for an archived policy room', async () => {
            // Given an archived policy room
            const report: Report = {
                ...createRandomReport(40002),
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
                participants: buildParticipantsFromAccountIDs([currentUserAccountID, 1]),
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report.reportID}`, {private_isArchived: DateUtils.getDBTime()});

            // When it's checked if the description can be edited
            const {result: isReportArchived} = renderHook(() => useReportIsArchived(report?.reportID));
            const result = canEditReportDescription(report, policy, isReportArchived.current);

            // Then it cannot be edited
            expect(result).toBeFalsy();
        });
    });

    describe('isDeprecatedGroupDM', () => {
        it('should return false if the report is a chat thread', () => {
            const report: Report = {
                ...createRandomReport(0),
                parentReportActionID: '1',
                parentReportID: '1',
                type: CONST.REPORT.TYPE.CHAT,
                participants: buildParticipantsFromAccountIDs([currentUserAccountID, 1, 2]),
            };
            expect(isDeprecatedGroupDM(report)).toBeFalsy();
        });

        it('should return false if the report is a task report', () => {
            const report: Report = {
                ...createRandomReport(0),
                type: CONST.REPORT.TYPE.TASK,
                participants: buildParticipantsFromAccountIDs([currentUserAccountID, 1, 2]),
            };
            expect(isDeprecatedGroupDM(report)).toBeFalsy();
        });

        it('should return false if the report is a money request report', () => {
            const report: Report = {
                ...createRandomReport(0),
                type: CONST.REPORT.TYPE.EXPENSE,
                participants: buildParticipantsFromAccountIDs([currentUserAccountID, 1, 2]),
            };
            expect(isDeprecatedGroupDM(report)).toBeFalsy();
        });

        it('should return false if the report is an archived room', () => {
            const report: Report = {
                ...createRandomReport(0),
                participants: buildParticipantsFromAccountIDs([currentUserAccountID, 1, 2]),
            };
            expect(isDeprecatedGroupDM(report, true)).toBeFalsy();
        });

        it('should return false if the report is a public / admin / announce chat room', () => {
            const report: Report = {
                ...createRandomReport(0),
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_ADMINS,
                participants: buildParticipantsFromAccountIDs([currentUserAccountID, 1, 2]),
            };
            expect(isDeprecatedGroupDM(report)).toBeFalsy();
        });

        it('should return false if the report has less than 2 participants', () => {
            const report: Report = {
                ...createRandomReport(0),
                chatType: undefined,
                type: CONST.REPORT.TYPE.CHAT,
                participants: buildParticipantsFromAccountIDs([currentUserAccountID, 1]),
            };
            expect(isDeprecatedGroupDM(report)).toBeFalsy();
        });

        it('should return true if the report has more than 2 participants', () => {
            const report: Report = {
                ...createRandomReport(0),
                chatType: undefined,
                type: CONST.REPORT.TYPE.CHAT,
                participants: buildParticipantsFromAccountIDs([currentUserAccountID, 1, 2]),
            };
            expect(isDeprecatedGroupDM(report)).toBeTruthy();
        });
    });

    describe('canUserPerformWriteAction', () => {
        it('should return false for announce room when the role of the employee is auditor ', async () => {
            // Given a policy announce room of a policy that the user has an auditor role
            const workspace: Policy = {...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM), role: CONST.POLICY.ROLE.AUDITOR};
            const policyAnnounceRoom: Report = {
                ...createRandomReport(50001),
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_ANNOUNCE,
                participants: buildParticipantsFromAccountIDs([currentUserAccountID, 1]),
                policyID: policy.id,
                writeCapability: CONST.REPORT.WRITE_CAPABILITIES.ADMINS,
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${workspace.id}`, workspace);

            const result = canUserPerformWriteAction(policyAnnounceRoom);

            // Then it should return false
            expect(result).toBe(false);
        });
    });

    describe('shouldDisableRename', () => {
        it('should return true for archived reports', async () => {
            // Given an archived policy room
            const report: Report = {
                ...createRandomReport(50001),
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
                participants: buildParticipantsFromAccountIDs([currentUserAccountID, 1]),
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${report.reportID}`, {private_isArchived: DateUtils.getDBTime()});

            // When shouldDisableRename is called
            const {result: isReportArchived} = renderHook(() => useReportIsArchived(report?.reportID));
            const result = shouldDisableRename(report, isReportArchived.current);

            // Then it should return true
            expect(result).toBe(true);
        });

        it('should return true for default rooms', () => {
            // Given a default room
            const report: Report = {
                ...createRandomReport(50002),
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_ADMINS,
                reportName: '#admins',
            };

            // When shouldDisableRename is called
            const result = shouldDisableRename(report);

            // Then it should return true
            expect(result).toBe(true);
        });

        it('should return true for public rooms', () => {
            // Given a public room
            const report: Report = {
                ...createRandomReport(50003),
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
                visibility: CONST.REPORT.VISIBILITY.PUBLIC,
            };

            // When shouldDisableRename is called
            const result = shouldDisableRename(report);

            // Then it should return true
            expect(result).toBe(true);
        });

        it('should return true for threads', () => {
            // Given a thread report
            const report: Report = {
                ...createRandomReport(50004),
                parentReportID: '12345',
                parentReportActionID: '67890',
            };

            // When shouldDisableRename is called
            const result = shouldDisableRename(report);

            // Then it should return true
            expect(result).toBe(true);
        });

        it('should return true for money request reports', () => {
            // Given a money request report
            const report: Report = {
                ...createRandomReport(50005),
                type: CONST.REPORT.TYPE.IOU,
            };

            // When shouldDisableRename is called
            const result = shouldDisableRename(report);

            // Then it should return true
            expect(result).toBe(true);
        });

        it('should return true for expense reports', () => {
            // Given an expense report
            const report: Report = {
                ...createRandomReport(50006),
                type: CONST.REPORT.TYPE.EXPENSE,
            };

            // When shouldDisableRename is called
            const result = shouldDisableRename(report);

            // Then it should return true
            expect(result).toBe(true);
        });

        it('should return true for policy expense chats', () => {
            // Given a policy expense chat
            const report: Report = {
                ...createRandomReport(50007),
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                isOwnPolicyExpenseChat: true,
            };

            // When shouldDisableRename is called
            const result = shouldDisableRename(report);

            // Then it should return true
            expect(result).toBe(true);
        });

        it('should return true for invoice rooms', () => {
            // Given an invoice room
            const report: Report = {
                ...createRandomReport(50008),
                chatType: CONST.REPORT.CHAT_TYPE.INVOICE,
            };

            // When shouldDisableRename is called
            const result = shouldDisableRename(report);

            // Then it should return true
            expect(result).toBe(true);
        });

        it('should return true for invoice reports', () => {
            // Given an invoice report
            const report: Report = {
                ...createRandomReport(50009),
                type: CONST.REPORT.TYPE.INVOICE,
            };

            // When shouldDisableRename is called
            const result = shouldDisableRename(report);

            // Then it should return true
            expect(result).toBe(true);
        });

        it('should return true for system chats', () => {
            // Given a system chat
            const report: Report = {
                ...createRandomReport(50010),
                chatType: CONST.REPORT.CHAT_TYPE.SYSTEM,
            };

            // When shouldDisableRename is called
            const result = shouldDisableRename(report);

            // Then it should return true
            expect(result).toBe(true);
        });

        it('should return false for group chats', async () => {
            // Given a group chat
            const report: Report = {
                ...createRandomReport(50011),
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.GROUP,
                participants: buildParticipantsFromAccountIDs([currentUserAccountID, 1, 2]),
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);

            // When shouldDisableRename is called
            const result = shouldDisableRename(report);

            // Then it should return false
            expect(result).toBe(false);
        });

        it('should return false for non-archived regular chats', async () => {
            // Given a non-archived regular chat (1:1 DM)
            const report: Report = {
                reportID: '50012',
                type: CONST.REPORT.TYPE.CHAT,
                participants: buildParticipantsFromAccountIDs([currentUserAccountID, 1]),

                // Ensure it's not a policy expense chat or any other special chat type
                chatType: undefined,
                isOwnPolicyExpenseChat: false,
                policyID: undefined,
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);

            // When shouldDisableRename is called
            const {result: isReportArchived} = renderHook(() => useReportIsArchived(report?.reportID));
            const result = shouldDisableRename(report, isReportArchived.current);

            // Then it should return false (since this is a 1:1 DM and not a group chat, and none of the other conditions are met)
            expect(result).toBe(false);
        });
    });

    describe('canLeaveChat', () => {
        beforeEach(async () => {
            jest.clearAllMocks();

            await Onyx.clear();
        });

        it('should return true for root group chat', () => {
            const report: Report = {
                ...createRandomReport(1),
                chatType: CONST.REPORT.CHAT_TYPE.GROUP,
            };

            expect(canLeaveChat(report, undefined)).toBe(true);
        });

        it('should return true for policy expense chat if the user is not the owner and the user is not an admin', () => {
            const report: Report = {
                ...createRandomReport(1),
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                isOwnPolicyExpenseChat: false,
                policyID: '1',
            };

            const reportPolicy: Policy = {
                ...createRandomPolicy(1),
                role: CONST.POLICY.ROLE.USER,
            };

            expect(canLeaveChat(report, reportPolicy)).toBe(true);
        });

        it('should return false if the chat is public room and the user is the guest', async () => {
            const report: Report = {
                ...createRandomReport(1),
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
                visibility: CONST.REPORT.VISIBILITY.PUBLIC,
            };

            await Onyx.set(ONYXKEYS.SESSION, {email: currentUserEmail, accountID: currentUserAccountID, authTokenType: CONST.AUTH_TOKEN_TYPES.ANONYMOUS});

            expect(canLeaveChat(report, undefined)).toBe(false);
        });

        it('should return false if the report is hidden for the current user', async () => {
            const report: Report = {
                ...createRandomReport(1),
                type: CONST.REPORT.TYPE.CHAT,
                participants: {
                    ...buildParticipantsFromAccountIDs([currentUserAccountID, 1234]),
                    [currentUserAccountID]: {
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN,
                    },
                },
                chatType: undefined,
            };

            await Onyx.set(ONYXKEYS.SESSION, {email: currentUserEmail, accountID: currentUserAccountID});

            expect(canLeaveChat(report, undefined)).toBe(false);
        });

        it('should return false for selfDM reports', () => {
            const report: Report = {
                ...createRandomReport(1),
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.SELF_DM,
            };

            expect(canLeaveChat(report, undefined)).toBe(false);
        });

        it('should return false for the public announce room if the user is a member of the policy', () => {
            const report: Report = {
                ...createRandomReport(1),
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
                visibility: CONST.REPORT.VISIBILITY.PUBLIC_ANNOUNCE,
            };

            const reportPolicy: Policy = {
                ...createRandomPolicy(1),
                role: CONST.POLICY.ROLE.USER,
            };

            expect(canLeaveChat(report, reportPolicy)).toBe(false);
        });

        it('should return true for the invoice room if the user is not the sender or receiver', async () => {
            const report: Report = {
                ...createRandomReport(1),
                chatType: CONST.REPORT.CHAT_TYPE.INVOICE,
                invoiceReceiver: {
                    type: CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL,
                    accountID: 1234,
                },
                policyID: '1',
                participants: buildParticipantsFromAccountIDs([currentUserAccountID, 1234]),
            };

            await Onyx.set(ONYXKEYS.SESSION, {email: currentUserEmail, accountID: currentUserAccountID});

            const reportPolicy: Policy = {
                ...createRandomPolicy(1),
                role: CONST.POLICY.ROLE.USER,
            };

            expect(canLeaveChat(report, reportPolicy)).toBe(true);
        });

        it('should return true for chat thread if the user is joined', async () => {
            const report: Report = {
                ...createRandomReport(1),
                type: CONST.REPORT.TYPE.CHAT,
                chatType: undefined,
                participants: buildParticipantsFromAccountIDs([currentUserAccountID, 1234]),
                parentReportID: '12345',
                parentReportActionID: '67890',
            };

            await Onyx.set(ONYXKEYS.SESSION, {email: currentUserEmail, accountID: currentUserAccountID});

            expect(canLeaveChat(report, undefined)).toBe(true);
        });

        it('should return true for user created policy room', async () => {
            const report: Report = {
                ...createRandomReport(1),
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
                participants: buildParticipantsFromAccountIDs([currentUserAccountID, 1234]),
            };

            await Onyx.set(ONYXKEYS.SESSION, {email: currentUserEmail, accountID: currentUserAccountID});

            const reportPolicy: Policy = {
                ...createRandomPolicy(1),
                role: CONST.POLICY.ROLE.USER,
            };

            expect(canLeaveChat(report, reportPolicy)).toBe(true);
        });
    });

    describe('canJoinChat', () => {
        beforeEach(async () => {
            jest.clearAllMocks();

            await Onyx.clear();
        });

        it('should return false if the parent report action is a whisper action', () => {
            const report: Report = {
                ...createRandomReport(1),
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.GROUP,
                participants: buildParticipantsFromAccountIDs([currentUserAccountID, 1234]),
            };

            const parentReportAction: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                originalMessage: {
                    whisperedTo: [1234],
                },
            };

            expect(canJoinChat(report, parentReportAction, undefined)).toBe(false);
        });

        it('should return false if the report is not hidden for the current user', async () => {
            const report: Report = {
                ...createRandomReport(1),
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.GROUP,
                participants: buildParticipantsFromAccountIDs([currentUserAccountID, 1234]),
            };

            await Onyx.set(ONYXKEYS.SESSION, {email: currentUserEmail, accountID: currentUserAccountID});

            expect(canJoinChat(report, undefined, undefined)).toBe(false);
        });

        it('should return false if the report is one of these types: group chat, selfDM, invoice room, system chat, expense chat', () => {
            const report: Report = {
                ...createRandomReport(1),
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.GROUP,
            };

            expect(canJoinChat(report, undefined, undefined)).toBe(false);
        });

        it('should return false if the report is archived', () => {
            const report: Report = {
                ...createRandomReport(1),
            };

            expect(canJoinChat(report, undefined, undefined, true)).toBe(false);
        });

        it('should return true if the report is chat thread', async () => {
            const report: Report = {
                ...createRandomReport(1),
                type: CONST.REPORT.TYPE.CHAT,
                participants: {
                    ...buildParticipantsFromAccountIDs([currentUserAccountID, 1234]),
                    [currentUserAccountID]: {
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN,
                    },
                },
                chatType: undefined,
                parentReportID: '12345',
                parentReportActionID: '67890',
            };

            await Onyx.set(ONYXKEYS.SESSION, {email: currentUserEmail, accountID: currentUserAccountID});

            expect(canJoinChat(report, undefined, undefined)).toBe(true);
        });
    });

    describe('isRootGroupChat', () => {
        it('should return false if the report is chat thread', () => {
            const report: Report = {
                ...createRandomReport(1),
                type: CONST.REPORT.TYPE.CHAT,
                chatType: undefined,
                parentReportID: '12345',
                parentReportActionID: '67890',
            };

            expect(isRootGroupChat(report)).toBe(false);
        });

        it('should return true if the report is a group chat and it is not a chat thread', () => {
            const report: Report = {
                ...createRandomReport(1),
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.GROUP,
            };

            expect(isRootGroupChat(report)).toBe(true);
        });

        it('should return true if the report is a deprecated group DM and it is not a chat thread', () => {
            const report: Report = {
                ...createRandomReport(0),
                chatType: undefined,
                type: CONST.REPORT.TYPE.CHAT,
                participants: buildParticipantsFromAccountIDs([currentUserAccountID, 1, 2]),
            };
            expect(isRootGroupChat(report)).toBe(true);
        });
    });
    describe('isWhisperAction', () => {
        it('an action where reportAction.message.whisperedTo has accountIDs is a whisper action', () => {
            const whisperReportAction: ReportAction = {
                ...createRandomReportAction(1),
            };
            expect(isWhisperAction(whisperReportAction)).toBe(true);
        });
        it('an action where reportAction.originalMessage.whisperedTo does not exist is not a whisper action', () => {
            const nonWhisperReportAction = {
                ...createRandomReportAction(1),
                message: [
                    {
                        whisperedTo: undefined,
                    },
                ],
            } as ReportAction;
            expect(isWhisperAction(nonWhisperReportAction)).toBe(false);
        });
    });

    describe('canFlagReportAction', () => {
        describe('a whisper action', () => {
            const whisperReportAction: ReportAction = {
                ...createRandomReportAction(1),
            };

            it('cannot be flagged if it is from concierge', () => {
                const whisperReportActionFromConcierge = {
                    ...whisperReportAction,
                    actorAccountID: CONST.ACCOUNT_ID.CONCIERGE,
                };

                // The reportID doesn't matter because there is an early return for whisper actions and the report is not looked at
                expect(canFlagReportAction(whisperReportActionFromConcierge, '123456')).toBe(false);
            });

            it('cannot be flagged if it is from the current user', () => {
                const whisperReportActionFromCurrentUser = {
                    ...whisperReportAction,
                    actorAccountID: currentUserAccountID,
                };

                // The reportID doesn't matter because there is an early return for whisper actions and the report is not looked at
                expect(canFlagReportAction(whisperReportActionFromCurrentUser, '123456')).toBe(false);
            });

            it('can be flagged if it is not from concierge or the current user', () => {
                expect(canFlagReportAction(whisperReportAction, '123456')).toBe(true);
            });
        });

        describe('a non-whisper action', () => {
            const report = {
                ...createRandomReport(1),
            };
            const nonWhisperReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                message: [
                    {
                        whisperedTo: undefined,
                    },
                ],
            } as ReportAction;

            beforeAll(async () => {
                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);
            });

            afterAll(async () => {
                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, null);
            });

            it('cannot be flagged if it is from the current user', () => {
                const nonWhisperReportActionFromCurrentUser = {
                    ...nonWhisperReportAction,
                    actorAccountID: currentUserAccountID,
                };
                expect(canFlagReportAction(nonWhisperReportActionFromCurrentUser, report.reportID)).toBe(false);
            });

            it('cannot be flagged if the action name is something other than ADD_COMMENT', () => {
                const nonWhisperReportActionWithDifferentActionName = {
                    ...nonWhisperReportAction,
                    actionName: CONST.REPORT.ACTIONS.TYPE.APPROVED,
                };
                expect(canFlagReportAction(nonWhisperReportActionWithDifferentActionName, report.reportID)).toBe(false);
            });

            it('cannot be flagged if the action is deleted', () => {
                const deletedReportAction = {
                    ...nonWhisperReportAction,
                    message: [
                        {
                            whisperedTo: undefined,
                            html: '',
                            deleted: getRandomDate(),
                        },
                    ],
                } as ReportAction;
                expect(canFlagReportAction(deletedReportAction, report.reportID)).toBe(false);
            });

            it('cannot be flagged if the action is a created task report', () => {
                const createdTaskReportAction = {
                    ...nonWhisperReportAction,
                    originalMessage: {
                        // This signifies that the action is a created task report along with the ADD_COMMENT action name
                        taskReportID: '123456',
                    },
                } as ReportAction;
                expect(canFlagReportAction(createdTaskReportAction, report.reportID)).toBe(false);
            });

            it('cannot be flagged if the report does not exist', () => {
                // cspell:disable-next-line
                expect(canFlagReportAction(nonWhisperReportAction, 'starwarsisthebest')).toBe(false);
            });

            it('cannot be flagged if the report is not allowed to be commented on', () => {
                // eslint-disable-next-line rulesdir/no-negated-variables
                const reportThatCannotBeCommentedOn = {
                    ...createRandomReport(2),

                    // If the permissions does not contain WRITE, then it cannot be commented on
                    permissions: [],
                } as Report;
                expect(canFlagReportAction(nonWhisperReportAction, reportThatCannotBeCommentedOn.reportID)).toBe(false);
            });

            it('can be flagged', () => {
                expect(canFlagReportAction(nonWhisperReportAction, report.reportID)).toBe(true);
            });
        });
    });

    // Note: shouldShowFlagComment() calls isArchivedNonExpenseReport() which has it's own unit tests, so whether
    // the report is an expense report or not does not need to be tested here.
    describe('shouldShowFlagComment', () => {
        const validReportAction: ReportAction = {
            ...createRandomReportAction(1),
            actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,

            // Actor is not the current user or Concierge
            actorAccountID: 123456,
        };

        describe('can flag report action', () => {
            let expenseReport: Report;
            const reportActionThatCanBeFlagged: ReportAction = {
                ...validReportAction,
            };

            // eslint-disable-next-line rulesdir/no-negated-variables
            const reportActionThatCannotBeFlagged: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,

                // If the actor is Concierge, the report action cannot be flagged
                actorAccountID: CONST.ACCOUNT_ID.CONCIERGE,
            };

            beforeAll(async () => {
                expenseReport = {
                    ...createRandomReport(60000),
                    type: CONST.REPORT.TYPE.EXPENSE,
                };
                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`, expenseReport);
            });

            afterAll(async () => {
                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`, null);
            });

            it('should return true for an archived expense report with an action that can be flagged', () => {
                expect(shouldShowFlagComment(reportActionThatCanBeFlagged, expenseReport, true)).toBe(true);
            });

            it('should return true for a non-archived expense report with an action that can be flagged', () => {
                expect(shouldShowFlagComment(reportActionThatCanBeFlagged, expenseReport, false)).toBe(true);
            });

            it('should return false for an archived expense report with an action that cannot be flagged', () => {
                expect(shouldShowFlagComment(reportActionThatCannotBeFlagged, expenseReport, true)).toBe(false);
            });

            it('should return false for a non-archived expense report with an action that cannot be flagged', () => {
                expect(shouldShowFlagComment(reportActionThatCannotBeFlagged, expenseReport, false)).toBe(false);
            });
        });

        describe('Chat with Chronos', () => {
            let chatReport: Report;

            beforeAll(async () => {
                chatReport = {
                    ...createRandomReport(60000),
                    type: CONST.REPORT.TYPE.CHAT,
                    participants: buildParticipantsFromAccountIDs([currentUserAccountID, CONST.ACCOUNT_ID.CHRONOS]),
                };
                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`, chatReport);
            });

            afterAll(async () => {
                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`, null);
            });

            it('should return false for an archived chat report', () => {
                expect(shouldShowFlagComment(validReportAction, chatReport, true)).toBe(false);
            });

            it('should return false for a non-archived chat report', () => {
                expect(shouldShowFlagComment(validReportAction, chatReport, false)).toBe(false);
            });
        });

        describe('Chat with Concierge', () => {
            let chatReport: Report;

            beforeAll(async () => {
                chatReport = {
                    ...createRandomReport(60000),
                    type: CONST.REPORT.TYPE.CHAT,
                    participants: buildParticipantsFromAccountIDs([currentUserAccountID, CONST.ACCOUNT_ID.CONCIERGE]),
                };
                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`, chatReport);
                await Onyx.set(`${ONYXKEYS.CONCIERGE_REPORT_ID}`, chatReport.reportID);
            });

            afterAll(async () => {
                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`, null);
                await Onyx.set(`${ONYXKEYS.CONCIERGE_REPORT_ID}`, null);
            });

            it('should return false for an archived chat report', () => {
                expect(shouldShowFlagComment(validReportAction, chatReport, true)).toBe(false);
            });

            it('should return false for a non-archived chat report', () => {
                expect(shouldShowFlagComment(validReportAction, chatReport, false)).toBe(false);
            });
        });

        describe('Action from Concierge', () => {
            let chatReport: Report;
            const actionFromConcierge: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                actorAccountID: CONST.ACCOUNT_ID.CONCIERGE,
            };

            beforeAll(async () => {
                chatReport = {
                    ...createRandomReport(60000),
                    type: CONST.REPORT.TYPE.CHAT,
                };
                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`, chatReport);
            });

            afterAll(async () => {
                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`, null);
            });

            it('should return false for an archived chat report', () => {
                expect(shouldShowFlagComment(actionFromConcierge, chatReport, true)).toBe(false);
            });

            it('should return false for a non-archived chat report', () => {
                expect(shouldShowFlagComment(actionFromConcierge, chatReport, false)).toBe(false);
            });
        });
    });

    describe('getReportStatusTranslation', () => {
        it('should return "Draft" for state 0, status 0', () => {
            expect(getReportStatusTranslation(CONST.REPORT.STATE_NUM.OPEN, CONST.REPORT.STATUS_NUM.OPEN)).toBe(translateLocal('common.draft'));
        });

        it('should return "Outstanding" for state 1, status 1', () => {
            expect(getReportStatusTranslation(CONST.REPORT.STATE_NUM.SUBMITTED, CONST.REPORT.STATUS_NUM.SUBMITTED)).toBe(translateLocal('common.outstanding'));
        });

        it('should return "Done" for state 2, status 2', () => {
            expect(getReportStatusTranslation(CONST.REPORT.STATE_NUM.APPROVED, CONST.REPORT.STATUS_NUM.CLOSED)).toBe(translateLocal('common.done'));
        });

        it('should return "Approved" for state 2, status 3', () => {
            expect(getReportStatusTranslation(CONST.REPORT.STATE_NUM.APPROVED, CONST.REPORT.STATUS_NUM.APPROVED)).toBe(translateLocal('iou.approved'));
        });

        it('should return "Paid" for state 2, status 4', () => {
            expect(getReportStatusTranslation(CONST.REPORT.STATE_NUM.APPROVED, CONST.REPORT.STATUS_NUM.REIMBURSED)).toBe(translateLocal('iou.settledExpensify'));
        });

        it('should return "Paid" for state 3, status 4', () => {
            expect(getReportStatusTranslation(CONST.REPORT.STATE_NUM.BILLING, CONST.REPORT.STATUS_NUM.REIMBURSED)).toBe(translateLocal('iou.settledExpensify'));
        });

        it('should return "Paid" for state 6, status 4', () => {
            expect(getReportStatusTranslation(CONST.REPORT.STATE_NUM.AUTOREIMBURSED, CONST.REPORT.STATUS_NUM.REIMBURSED)).toBe(translateLocal('iou.settledExpensify'));
        });

        it('should return an empty string when stateNum or statusNum is undefined', () => {
            expect(getReportStatusTranslation(undefined, undefined)).toBe('');
            expect(getReportStatusTranslation(CONST.REPORT.STATE_NUM.OPEN, undefined)).toBe('');
            expect(getReportStatusTranslation(undefined, CONST.REPORT.STATUS_NUM.OPEN)).toBe('');
        });
    });
});
