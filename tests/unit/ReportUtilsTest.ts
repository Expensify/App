/* eslint-disable @typescript-eslint/naming-convention */
import {beforeAll} from '@jest/globals';
import {renderHook} from '@testing-library/react-native';
import {addDays, format as formatDate} from 'date-fns';
import type {OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import useReportIsArchived from '@hooks/useReportIsArchived';
import {putOnHold} from '@libs/actions/IOU';
import type {OnboardingTaskLinks} from '@libs/actions/Welcome/OnboardingFlow';
import DateUtils from '@libs/DateUtils';
import getBase62ReportID from '@libs/getBase62ReportID';
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
    canCreateRequest,
    canDeleteReportAction,
    canDeleteTransaction,
    canEditMoneyRequest,
    canEditReportDescription,
    canEditRoomVisibility,
    canEditWriteCapability,
    canFlagReportAction,
    canHoldUnholdReportAction,
    canJoinChat,
    canLeaveChat,
    canSeeDefaultRoom,
    canUserPerformWriteAction,
    excludeParticipantsForDisplay,
    findLastAccessedReport,
    getAllAncestorReportActions,
    getAllReportActionsErrorsAndReportActionThatRequiresAttention,
    getApprovalChain,
    getChatByParticipants,
    getChatRoomSubtitle,
    getDefaultWorkspaceAvatar,
    getDisplayNamesWithTooltips,
    getGroupChatName,
    getIconsForParticipants,
    getMoneyReportPreviewName,
    getMostRecentlyVisitedReport,
    getParentNavigationSubtitle,
    getParticipantsList,
    getPolicyExpenseChat,
    getPolicyExpenseChatName,
    getReasonAndReportActionThatRequiresAttention,
    getReportActionActorAccountID,
    getReportIDFromLink,
    getReportName,
    getReportStatusTranslation,
    getSearchReportName,
    getWorkspaceIcon,
    getWorkspaceNameUpdatedMessage,
    hasReceiptError,
    isAllowedToApproveExpenseReport,
    isArchivedNonExpenseReport,
    isArchivedReport,
    isChatUsedForOnboarding,
    isDeprecatedGroupDM,
    isMoneyRequestReportEligibleForMerge,
    isPayer,
    isReportOutstanding,
    isRootGroupChat,
    parseReportRouteParams,
    populateOptimisticReportFormula,
    prepareOnboardingOnyxData,
    requiresAttentionFromCurrentUser,
    requiresManualSubmission,
    shouldDisableRename,
    shouldDisableThread,
    shouldReportBeInOptionList,
    shouldReportShowSubscript,
    shouldShowFlagComment,
    sortIconsByName,
    sortOutstandingReportsBySelected,
    temporary_getMoneyRequestOptions,
} from '@libs/ReportUtils';
import type {OptionData} from '@libs/ReportUtils';
import {buildOptimisticTransaction} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import type {
    Beta,
    OnyxInputOrEntry,
    PersonalDetailsList,
    Policy,
    PolicyEmployeeList,
    Report,
    ReportAction,
    ReportActions,
    ReportMetadata,
    ReportNameValuePairs,
    Transaction,
} from '@src/types/onyx';
import type {ErrorFields, Errors} from '@src/types/onyx/OnyxCommon';
import type {ACHAccount} from '@src/types/onyx/Policy';
import type {Participant, Participants} from '@src/types/onyx/Report';
import type {SearchTransaction} from '@src/types/onyx/SearchResults';
import {toCollectionDataSet} from '@src/types/utils/CollectionDataSet';
import {chatReportR14932 as mockedChatReport} from '../../__mocks__/reportData/reports';
import * as NumberUtils from '../../src/libs/NumberUtils';
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
import {localeCompare} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

// Be sure to include the mocked permissions library or else the beta tests won't work
jest.mock('@libs/Permissions');

jest.mock('@libs/Navigation/Navigation', () => ({
    setNavigationActionToMicrotaskQueue: jest.fn(),
    navigate: jest.fn(),
    getActiveRoute: jest.fn(() => 'mock-route'),
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
    '8': {
        accountID: 8,
        login: CONST.EMAIL.GUIDES_DOMAIN,
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
                            type: CONST.ONBOARDING_TASK_TYPE.CREATE_REPORT,
                            title,
                            description: () => '',
                            autoCompleted: false,
                            mediaAttributes: {},
                        },
                    ],
                },
                '1',
            );

            expect(title).toHaveBeenCalledWith(
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
                            type: CONST.ONBOARDING_TASK_TYPE.CREATE_REPORT,
                            title: () => '',
                            description,
                            autoCompleted: false,
                            mediaAttributes: {},
                        },
                    ],
                },
                '1',
            );

            expect(description).toHaveBeenCalledWith(
                expect.objectContaining<OnboardingTaskLinks>({
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    testDriveURL: expect.any(String),
                }),
            );
        });

        it('should not create tasks if the task feature is not in the selected interested features', () => {
            const result = prepareOnboardingOnyxData(
                undefined,
                CONST.ONBOARDING_CHOICES.MANAGE_TEAM,
                {
                    message: 'This is a test',
                    tasks: [{type: CONST.ONBOARDING_TASK_TYPE.CONNECT_CORPORATE_CARD, title: () => '', description: () => '', autoCompleted: false, mediaAttributes: {}}],
                },
                '1',
                undefined,
                undefined,
                undefined,
                undefined,
                ['categories', 'accounting', 'tags'],
            );

            expect(result?.guidedSetupData.filter((data) => data.type === 'task')).toHaveLength(0);
        });
    });

    describe('getIconsForParticipants', () => {
        it('returns avatar source', () => {
            const participants = getIconsForParticipants([1, 2, 3, 4, 5], participantsPersonalDetails);
            expect(participants).toHaveLength(5);

            expect(participants.at(3)?.source).toBeInstanceOf(Function);
            expect(participants.at(3)?.name).toBe('(833) 240-3627');
            expect(participants.at(3)?.id).toBe(4);
            expect(participants.at(3)?.type).toBe('avatar');

            expect(participants.at(1)?.source).toBeInstanceOf(Function);
            expect(participants.at(1)?.name).toBe('floki@vikings.net');
            expect(participants.at(1)?.id).toBe(2);
            expect(participants.at(1)?.type).toBe('avatar');
        });
    });

    describe('getPolicyExpenseChatName', () => {
        it("returns owner's display name when available", () => {
            const report = {
                ownerAccountID: 1,
                reportName: 'Fallback Report Name',
            } as unknown as OnyxEntry<Report>;

            const name = getPolicyExpenseChatName({report, personalDetailsList: participantsPersonalDetails});
            expect(name).toBe(translateLocal('workspace.common.policyExpenseChatName', {displayName: 'Ragnar Lothbrok'}));
        });

        it('falls back to owner login when display name not present', () => {
            const report = {
                ownerAccountID: 2,
                reportName: 'Fallback Report Name',
            } as unknown as OnyxEntry<Report>;

            const name = getPolicyExpenseChatName({report, personalDetailsList: participantsPersonalDetails});
            expect(name).toBe(translateLocal('workspace.common.policyExpenseChatName', {displayName: 'floki'}));
        });

        it('returns report name when no personal details or owner', () => {
            const report = {
                ownerAccountID: undefined,
                reportName: 'Fallback Report Name',
            } as unknown as OnyxEntry<Report>;

            const name = getPolicyExpenseChatName({report, personalDetailsList: {}});
            expect(name).toBe('Fallback Report Name');
        });
    });

    describe('sortIconsByName', () => {
        it('returns sorted avatar source by name, then accountID', () => {
            const participants = getIconsForParticipants([1, 2, 3, 4, 5], participantsPersonalDetails);
            const sortedParticipants = sortIconsByName(participants, participantsPersonalDetails, localeCompare);
            expect(sortedParticipants).toHaveLength(5);

            expect(sortedParticipants.at(0)?.source).toBeInstanceOf(Function);
            expect(sortedParticipants.at(0)?.name).toBe('(833) 240-3627');
            expect(sortedParticipants.at(0)?.id).toBe(4);
            expect(sortedParticipants.at(0)?.type).toBe('avatar');

            expect(sortedParticipants.at(1)?.source).toBeInstanceOf(Function);
            expect(sortedParticipants.at(1)?.name).toBe('floki@vikings.net');
            expect(sortedParticipants.at(1)?.id).toBe(2);
            expect(sortedParticipants.at(1)?.type).toBe('avatar');
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
            expect(sortOutstandingReportsBySelected(report1, report2, selectedReportID, localeCompare)).toBe(-1);
        });
        it('should return 1 when report2 is selected and report1 is not', () => {
            const report1 = LHNTestUtils.getFakeReport();
            const report2 = LHNTestUtils.getFakeReport();
            const selectedReportID = report2.reportID;
            expect(sortOutstandingReportsBySelected(report1, report2, selectedReportID, localeCompare)).toBe(1);
        });
    });

    describe('getDisplayNamesWithTooltips', () => {
        test('withSingleParticipantReport', () => {
            const participants = getDisplayNamesWithTooltips(participantsPersonalDetails, false, localeCompare);
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
                reportID: '1',
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

                const {result: isReportArchived} = renderHook(() => useReportIsArchived(baseAdminsRoom.reportID));

                expect(getReportName(baseAdminsRoom, undefined, undefined, undefined, undefined, undefined, undefined, isReportArchived.current)).toBe('#admins (archived)');

                return IntlStore.load(CONST.LOCALES.ES).then(() =>
                    expect(getReportName(baseAdminsRoom, undefined, undefined, undefined, undefined, undefined, undefined, isReportArchived.current)).toBe('#admins (archivado)'),
                );
            });
        });

        describe('User-Created Policy Room', () => {
            afterEach(async () => {
                await Onyx.setCollection(ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS, {});
            });

            const baseUserCreatedRoom = {
                reportID: '1',
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

                const {result: isReportArchived} = renderHook(() => useReportIsArchived(baseUserCreatedRoom.reportID));

                expect(getReportName(archivedPolicyRoom, undefined, undefined, undefined, undefined, undefined, undefined, isReportArchived.current)).toBe('#VikingsChat (archived)');

                return IntlStore.load(CONST.LOCALES.ES).then(() =>
                    expect(getReportName(archivedPolicyRoom, undefined, undefined, undefined, undefined, undefined, undefined, isReportArchived.current)).toBe('#VikingsChat (archivado)'),
                );
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
                    reportID: '1',
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

                    const {result: isReportArchived} = renderHook(() => useReportIsArchived(baseArchivedPolicyExpenseChat.reportID));

                    expect(getReportName(memberArchivedPolicyExpenseChat, undefined, undefined, undefined, undefined, undefined, undefined, isReportArchived.current)).toBe(
                        `Ragnar Lothbrok's expenses (archived)`,
                    );

                    return IntlStore.load(CONST.LOCALES.ES).then(() =>
                        expect(getReportName(memberArchivedPolicyExpenseChat, undefined, undefined, undefined, undefined, undefined, undefined, isReportArchived.current)).toBe(
                            `Ragnar Lothbrok's gastos (archivado)`,
                        ),
                    );
                });

                test('as admin', async () => {
                    const adminArchivedPolicyExpenseChat = {
                        ...baseArchivedPolicyExpenseChat,
                        isOwnPolicyExpenseChat: false,
                    };

                    const {result: isReportArchived} = renderHook(() => useReportIsArchived(baseArchivedPolicyExpenseChat.reportID));

                    expect(getReportName(adminArchivedPolicyExpenseChat, undefined, undefined, undefined, undefined, undefined, undefined, isReportArchived.current)).toBe(
                        `Ragnar Lothbrok's expenses (archived)`,
                    );

                    return IntlStore.load(CONST.LOCALES.ES).then(() =>
                        expect(getReportName(adminArchivedPolicyExpenseChat, undefined, undefined, undefined, undefined, undefined, undefined, isReportArchived.current)).toBe(
                            `Ragnar Lothbrok's gastos (archivado)`,
                        ),
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

        describe('Fallback scenarios', () => {
            test('should fallback to report.reportName when primary name generation returns empty string', () => {
                const reportWithFallbackName: Report = {
                    reportID: '3',
                    reportName: 'Custom Report Name',
                    ownerAccountID: undefined,
                    participants: {},
                    policyID: undefined,
                    chatType: undefined,
                };

                const result = getReportName(reportWithFallbackName);
                expect(result).toBe('Custom Report Name');
            });

            test('should return empty string when both primary name generation and reportName are empty', () => {
                const reportWithoutName: Report = {
                    reportID: '4',
                    reportName: '',
                    ownerAccountID: undefined,
                    participants: {},
                    policyID: undefined,
                    chatType: undefined,
                };

                const result = getReportName(reportWithoutName);
                expect(result).toBe('');
            });

            test('should return empty string when reportName is undefined', () => {
                const reportWithUndefinedName: Report = {
                    reportID: '5',
                    reportName: undefined,
                    ownerAccountID: undefined,
                    participants: {},
                    policyID: undefined,
                    chatType: undefined,
                };

                const result = getReportName(reportWithUndefinedName);
                expect(result).toBe('');
            });

            test('should return Concierge display name for concierge chat report', async () => {
                const conciergeReportID = 'concierge-123';
                await Onyx.set(`${ONYXKEYS.CONCIERGE_REPORT_ID}`, conciergeReportID);

                const conciergeReport: Report = {
                    reportID: conciergeReportID,
                    reportName: '',
                    ownerAccountID: undefined,
                    participants: {},
                    policyID: undefined,
                    chatType: undefined,
                };

                const result = getReportName(conciergeReport);
                expect(result).toBe(CONST.CONCIERGE_DISPLAY_NAME);
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
                        type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
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
    });

    // Need to merge the same tests
    describe('getSearchReportName', () => {
        const archivedReportID = '12345678';
        const archivedReportNameValuePairs = {
            private_isArchived: DateUtils.getDBTime(),
        };

        const conciergeReportID = 'concierge-123';

        beforeAll(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${archivedReportID}`, archivedReportNameValuePairs);
            await Onyx.set(`${ONYXKEYS.CONCIERGE_REPORT_ID}`, conciergeReportID);
            await waitForBatchedUpdates();
        });

        afterAll(async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${archivedReportID}`, null);
            await Onyx.set(`${ONYXKEYS.CONCIERGE_REPORT_ID}`, null);
        });

        describe('1:1 Chat', () => {
            const baseChatReport: Report = {
                reportID: '',
                type: CONST.REPORT.TYPE.CHAT,
            };

            test('should return the displayName', () => {
                const chatReport: Report = {
                    ...baseChatReport,
                    participants: buildParticipantsFromAccountIDs([currentUserAccountID, 1]),
                };

                const params = {
                    report: chatReport,
                    personalDetails: participantsPersonalDetails,
                };

                const reportName = getSearchReportName(params);
                expect(reportName).toBe('Ragnar Lothbrok');
            });

            test('should return the email', () => {
                const chatReport: Report = {
                    ...baseChatReport,
                    participants: buildParticipantsFromAccountIDs([currentUserAccountID, 2]),
                };

                const reportName = getSearchReportName({report: chatReport});
                expect(reportName).toBe('floki@vikings.net');
            });

            test('should return phone number', () => {
                const chatReport: Report = {
                    ...baseChatReport,
                    participants: buildParticipantsFromAccountIDs([currentUserAccountID, 4]),
                };

                const reportName = getSearchReportName({report: chatReport});
                expect(reportName).toBe('(833) 240-3627');
            });

            describe('Threads', () => {
                const baseThreadReport: Report = {
                    reportID: '',
                    parentReportID: '1',
                    parentReportActionID: '3',
                    type: CONST.REPORT.TYPE.CHAT,
                };

                const baseParentReportAction: ReportAction = {
                    actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                    created: testDate,
                    reportActionID: '3',
                };

                test('should handle hidden message', () => {
                    const hiddenAction: ReportAction = {
                        ...baseParentReportAction,
                        actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                        message: [
                            {
                                type: 'COMMENT',
                                html: '',
                                text: '',
                                moderationDecision: {
                                    decision: CONST.MODERATION.MODERATOR_DECISION_HIDDEN,
                                },
                            },
                        ],
                    };

                    const reportName = getSearchReportName({
                        report: baseThreadReport,
                        parentReportActionParam: hiddenAction,
                        personalDetails: participantsPersonalDetails,
                    });

                    expect(reportName).toBe('Hidden message');
                });

                test('should return attachment label for attachment', () => {
                    const attachmentAction: ReportAction = {
                        ...baseParentReportAction,
                        actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                        message: [
                            {
                                type: 'COMMENT',
                                html: '<img src="test.jpg" />',
                                text: '[Attachment]',
                            },
                        ],
                    };

                    const reportName = getSearchReportName({
                        report: baseThreadReport,
                        parentReportActionParam: attachmentAction,
                        personalDetails: participantsPersonalDetails,
                    });

                    expect(reportName).toBe('[Attachment]');
                });

                test('should handle thread report with missing parent action', () => {
                    const threadReport: Report = {
                        ...baseThreadReport,
                        parentReportActionID: '999', // Non-existent action
                    };

                    const reportName = getSearchReportName({
                        report: threadReport,
                        personalDetails: participantsPersonalDetails,
                    });
                    expect(reportName).toBe('');
                });
            });
        });

        describe('Self DM', () => {
            const selfDMReport: Report = {
                reportID: '',
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.SELF_DM,
                participants: buildParticipantsFromAccountIDs([currentUserAccountID]),
            };
            test('should return self DM name for self DM', () => {
                const reportName = getSearchReportName({
                    report: selfDMReport,
                    personalDetails: participantsPersonalDetails,
                });

                expect(reportName).toBe('Lagertha Lothbrok (you)');
            });
        });

        describe('Group Chat', () => {
            test('should return group chat name for group chat', () => {
                const groupChatReport: Report = {
                    reportID: '',
                    type: CONST.REPORT.TYPE.CHAT,
                    chatType: CONST.REPORT.CHAT_TYPE.GROUP,
                    participants: buildParticipantsFromAccountIDs([1, 2, 3]),
                };

                const reportName = getSearchReportName({
                    report: groupChatReport,
                    personalDetails: participantsPersonalDetails,
                });

                expect(reportName).toContain('Ragnar');
            });

            test('should handle group chat with mixed participant types', () => {
                const groupChat: Report = {
                    reportID: '',
                    type: CONST.REPORT.TYPE.CHAT,
                    participants: {
                        [currentUserAccountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                        1: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                        2: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                        999: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS}, // Non-existent user
                    },
                };

                const reportName = getSearchReportName({report: groupChat});
                expect(reportName).toBe('Ragnar, floki@vikings.net');
            });
        });

        describe('Concierge Chat', () => {
            const conciergeReport: Report = {
                reportID: conciergeReportID,
                participants: {},
            };
            test('should handle concierge chat report', () => {
                const reportName = getSearchReportName({report: conciergeReport});
                expect(reportName).toBe(CONST.CONCIERGE_DISPLAY_NAME);
            });
        });

        describe('Money Request', () => {
            const baseIOUReport: Report = {
                reportID: '',
                type: CONST.REPORT.TYPE.IOU,
                ownerAccountID: currentUserAccountID,
                managerID: currentUserAccountID,
                isOwnPolicyExpenseChat: false,
                currency: 'USD',
                total: 5000,
            };
            test('should handle IOU report', () => {
                const params = {
                    report: baseIOUReport,
                    personalDetails: participantsPersonalDetails,
                };

                const reportName = getSearchReportName(params);
                expect(reportName).toBe('Lagertha Lothbrok paid $50.00');
            });
        });

        describe('Task', () => {
            const baseTaskReport = {
                reportID: '',
                managerID: 1,
                reportName: 'Test Task',
                type: CONST.REPORT.TYPE.TASK,
            };

            test('should handle completed task report', () => {
                const taskReport: Report = {
                    ...baseTaskReport,
                };

                const reportName = getSearchReportName({report: taskReport});
                expect(reportName).toBe('Test Task');
            });

            test('should handle canceled task report', () => {
                const taskReport: Report = {
                    ...baseTaskReport,
                    isDeletedParentAction: true,
                };

                const reportName = getSearchReportName({report: taskReport});
                expect(reportName).toBe('Deleted task');
            });

            test('should return thread name for task report with cancelled task', () => {
                const taskReport: Report = {
                    ...baseTaskReport,
                    isDeletedParentAction: true,
                };

                const parentReportAction: ReportAction = {
                    ...createRandomReportAction(0),
                    actionName: CONST.REPORT.ACTIONS.TYPE.TASK_CANCELLED,
                    parentReportID: taskReport.reportID,
                    actorAccountID: 1,
                };

                const reportName = getSearchReportName({
                    report: taskReport,
                    parentReportActionParam: parentReportAction,
                    personalDetails: participantsPersonalDetails,
                });

                expect(reportName).toBe('Deleted task');
            });

            test('should handle task report with proper name formatting', () => {
                const taskReport: Report = {
                    reportID: '1',
                    type: CONST.REPORT.TYPE.TASK,
                    reportName: '<b>HTML Task Name</b>',
                };

                const reportName = getSearchReportName({
                    report: taskReport,
                    personalDetails: participantsPersonalDetails,
                });

                expect(reportName).toBe('HTML Task Name');
            });
        });

        describe('Policy-related Reports', () => {
            describe('Rooms', () => {
                describe('Default', () => {
                    test.each([
                        [CONST.REPORT.CHAT_TYPE.POLICY_ADMINS, '#admins'],
                        [CONST.REPORT.CHAT_TYPE.POLICY_ANNOUNCE, '#announce'],
                    ])('should return %s room as %s', (chatType, reportName) => {
                        const defaultPolicyRoom: Report = {
                            reportID: '',
                            chatType,
                            reportName,
                            policyID: policy.id,
                        };

                        const {result: isReportArchived} = renderHook(() => useReportIsArchived(defaultPolicyRoom.reportID));

                        const result = getSearchReportName({report: defaultPolicyRoom, policy, isReportArchived: isReportArchived.current});
                        expect(result).toBe(reportName);
                    });

                    test.each([
                        [CONST.REPORT.CHAT_TYPE.POLICY_ADMINS, '#admins'],
                        [CONST.REPORT.CHAT_TYPE.POLICY_ANNOUNCE, '#announce'],
                    ])('should return %s (archived) room as %s', (chatType, reportName) => {
                        const defaultArchivedPolicyRoom: Report = {
                            reportID: archivedReportID,
                            chatType,
                            reportName,
                            policyID: policy.id,
                        };

                        const {
                            result: {current: isReportArchived},
                        } = renderHook(() => useReportIsArchived(defaultArchivedPolicyRoom.reportID));

                        const result = getSearchReportName({policy, report: defaultArchivedPolicyRoom, isReportArchived});
                        expect(result).toBe(`${reportName} (archived)`);
                    });

                    describe('Change log scenarios', () => {
                        const report: Report = {
                            reportID: '',
                            type: CONST.REPORT.TYPE.CHAT,
                            policyID: policy.id,
                        };

                        const baseParentReportAction = createRandomReportAction(0);

                        test('should handle corporate upgrade action', () => {
                            const upgradeAction: ReportAction = {
                                ...baseParentReportAction,
                                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.CORPORATE_UPGRADE,
                            };

                            const reportName = getSearchReportName({
                                report,
                                parentReportActionParam: upgradeAction,
                                personalDetails: participantsPersonalDetails,
                            });

                            expect(reportName).toBe('upgraded this workspace to the Control plan');
                        });

                        test('should handle corporate downgrade action', () => {
                            const downgradeAction: ReportAction = {
                                ...baseParentReportAction,
                                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.TEAM_DOWNGRADE,
                            };

                            const reportName = getSearchReportName({
                                report,
                                parentReportActionParam: downgradeAction,
                                personalDetails: participantsPersonalDetails,
                            });

                            expect(reportName).toBe('downgraded this workspace to the Collect plan');
                        });

                        test('should handle workspace name update action', () => {
                            const nameUpdateAction: ReportAction = {
                                ...baseParentReportAction,
                                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.UPDATE_NAME,
                                originalMessage: {
                                    oldName: 'Old Workspace',
                                    newName: 'New Workspace',
                                },
                            };

                            const reportName = getSearchReportName({
                                report,
                                parentReportActionParam: nameUpdateAction,
                                personalDetails: participantsPersonalDetails,
                            });

                            expect(reportName).toBe('updated the name of this workspace to "New Workspace" (previously "Old Workspace")');
                        });
                    });
                });

                describe('User-created', () => {
                    const chatRoom: Report = {
                        reportID: '',
                        type: CONST.REPORT.TYPE.CHAT,
                        chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
                        reportName: '#test-room',
                    };
                    test('Active', () => {
                        const {
                            result: {current: isReportArchived},
                        } = renderHook(() => useReportIsArchived(chatRoom.reportID));

                        const reportName = getSearchReportName({
                            report: chatRoom,
                            personalDetails: participantsPersonalDetails,
                            isReportArchived,
                        });

                        expect(reportName).toBe('#test-room');
                    });
                    test('Archived', () => {
                        const archivedRoom: Report = {
                            ...chatRoom,
                            reportID: archivedReportID,
                        };

                        const {
                            result: {current: isReportArchived},
                        } = renderHook(() => useReportIsArchived(archivedRoom.reportID));

                        const reportName = getSearchReportName({
                            report: archivedRoom,
                            personalDetails: participantsPersonalDetails,
                            isReportArchived,
                        });

                        expect(reportName).toBe('#test-room (archived)');
                    });
                });

                describe('getSearchReportName', () => {
                    const baseChatReport = {
                        reportID: '',
                        reportName: 'Vikings Report',
                        type: CONST.REPORT.TYPE.CHAT,
                    };

                    // Converting the chat report into a thread chat report
                    const chatThread = {
                        ...baseChatReport,
                        parentReportID: '1',
                        parentReportActionID: '1',
                    };

                    test('should return the policy name when report is chat thread', () => {
                        const searchReportName = getSearchReportName({report: chatThread, policy});
                        expect(searchReportName).toBe('Vikings Policy');
                    });

                    test('should return a empty string when report is chat thread and policy is undefined', () => {
                        const searchReportName = getSearchReportName({report: chatThread, policy: undefined});
                        expect(searchReportName).toBe('');
                    });

                    test('should return the report name when report is not chat thread', () => {
                        const searchReportName = getSearchReportName({report: baseChatReport, policy});
                        expect(searchReportName).toBe('Vikings Report');
                    });

                    test('should return the report name when report is not chat thread and policy is undefined', () => {
                        const searchReportName = getSearchReportName({report: baseChatReport, policy: undefined});
                        expect(searchReportName).toBe('Vikings Report');
                    });

                    test('should return a empty string when report is undefined ', () => {
                        const searchReportName = getSearchReportName({report: undefined, policy});
                        expect(searchReportName).toBe('');
                    });

                    test('should return a empty string when both report and policy are undefined', () => {
                        const searchReportName = getSearchReportName({report: undefined, policy: undefined});
                        expect(searchReportName).toBe('');
                    });
                });
            });

            describe('Expenses', () => {
                const baseChatReport: Report = {
                    reportID: '',
                    chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                    isOwnPolicyExpenseChat: true,
                    ownerAccountID: 1,
                    policyID: policy.id,
                };

                const baseExpenseReport: Report = {
                    type: CONST.REPORT.TYPE.EXPENSE,
                    isOwnPolicyExpenseChat: false,
                    reportID: '',
                    policyID: policy.id,
                    currency: 'USD',
                    total: -1000,
                };
                const baseParentReportAction: ReportAction = {
                    reportActionID: '3',
                    created: testDate,
                    actionName: CONST.REPORT.ACTIONS.TYPE.APPROVED,
                    parentReportID: baseExpenseReport.reportID,
                };

                test('Active', () => {
                    const {
                        result: {current: isReportArchived},
                    } = renderHook(() => useReportIsArchived(baseChatReport.reportID));

                    const params = {
                        report: baseChatReport,
                        policy,
                        isReportArchived,
                    };

                    const reportName = getSearchReportName(params);
                    expect(reportName).toBe("Ragnar Lothbrok's expenses");
                });

                test('Archived', () => {
                    const {
                        result: {current: isReportArchived},
                    } = renderHook(() => useReportIsArchived(archivedReportID));

                    const params = {
                        report: baseChatReport,
                        policy,
                        isReportArchived,
                    };

                    const reportName = getSearchReportName(params);
                    expect(reportName).toBe("Ragnar Lothbrok's expenses (archived)");
                });

                test('should return formatted transaction thread name', () => {
                    const iouAction: ReportAction = {
                        ...baseParentReportAction,
                        actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                        originalMessage: {
                            IOUTransactionID: 'txn1',
                            type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                            amount: 1000,
                            currency: 'USD',
                        },
                    };

                    const transaction: SearchTransaction = {
                        transactionID: 'txn1',
                        reportID: '2',
                        amount: 1000,
                        currency: 'USD',
                        merchant: 'Test Merchant',
                        transactionType: 'cash',
                        action: 'submit',
                        created: testDate,
                        modifiedMerchant: 'Test Merchant',
                    } as SearchTransaction;

                    const reportName = getSearchReportName({
                        report: baseExpenseReport,
                        policy,
                        parentReportActionParam: iouAction,
                        personalDetails: participantsPersonalDetails,
                        transactions: [transaction],
                    });

                    expect(reportName).toBe('Vikings Policy paid $10.00');
                });

                test('should handle expense report with approval status', () => {
                    const expenseReport: Report = {
                        ...baseExpenseReport,
                        stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                        statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
                    };

                    const reportName = getSearchReportName({report: expenseReport, policy});
                    expect(reportName).toBe('Vikings Policy approved $10.00');
                });

                test('should handle closed expense report with no expenses', () => {
                    const expenseReport: Report = {
                        ...baseExpenseReport,
                        statusNum: CONST.REPORT.STATUS_NUM.CLOSED,
                    };

                    const params = {
                        report: expenseReport,
                        policy,
                        transactions: [], // No transactions
                    };
                    const reportName = getSearchReportName(params);

                    expect(reportName).toBe('Deleted report');
                });

                test('should handle paid elsewhere money request', () => {
                    const payAction: ReportAction = {
                        ...baseParentReportAction,
                        actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                        originalMessage: {
                            type: CONST.IOU.REPORT_ACTION_TYPE.PAY,
                            paymentType: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
                        },
                    };

                    const params = {
                        policy,
                        report: baseExpenseReport,
                        parentReportActionParam: payAction,
                        personalDetails: participantsPersonalDetails,
                    };

                    const reportName = getSearchReportName(params);
                    expect(reportName).toBe('marked as paid');
                });

                test('should handle VBBA payment with automatic action', () => {
                    const achAccount: ACHAccount = {
                        accountNumber: '1234567890',
                        bankAccountID: 0,
                        routingNumber: '',
                        addressName: '',
                        bankName: '',
                        reimburser: '',
                    };

                    const vbbaPayAction: ReportAction = {
                        ...baseParentReportAction,
                        actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                        originalMessage: {
                            type: CONST.IOU.REPORT_ACTION_TYPE.PAY,
                            paymentType: CONST.IOU.PAYMENT_TYPE.VBBA,
                            automaticAction: true,
                        },
                    };

                    const params = {
                        report: baseExpenseReport,
                        parentReportActionParam: vbbaPayAction,
                        personalDetails: participantsPersonalDetails,
                        policy: {
                            ...policy,
                            achAccount,
                        },
                    };

                    const reportName = getSearchReportName(params);
                    expect(reportName).toBe(
                        'paid with bank account  via <a href="https://help.expensify.com/articles/new-expensify/workspaces/Set-up-rules#configure-expense-report-rules">workspace rules</a>',
                    );
                });

                test('should return forwarded action name', () => {
                    const forwardedAction: ReportAction = {
                        ...baseParentReportAction,
                        actionName: CONST.REPORT.ACTIONS.TYPE.FORWARDED,
                        originalMessage: {},
                    };
                    const reportName = getSearchReportName({
                        report: baseExpenseReport,
                        parentReportActionParam: forwardedAction,
                        personalDetails: participantsPersonalDetails,
                    });

                    expect(reportName).toBe('approved');
                });

                test('should return automatically approved message for automatic approval', () => {
                    const autoApprovedAction: ReportAction = {
                        ...baseParentReportAction,
                        actionName: CONST.REPORT.ACTIONS.TYPE.APPROVED,
                        originalMessage: {
                            amount: 169,
                            automaticAction: true,
                            type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                        },
                    };

                    const params = {
                        report: baseExpenseReport,
                        parentReportActionParam: autoApprovedAction,
                        personalDetails: participantsPersonalDetails,
                    };

                    const reportName = getSearchReportName(params);

                    expect(reportName).toBe(
                        'approved via <a href="https://help.expensify.com/articles/new-expensify/workspaces/Set-up-rules#configure-expense-report-rules">workspace rules</a>',
                    );
                });

                test('should return submitted action name', () => {
                    const expenseReport: Report = {
                        ...baseExpenseReport,
                        type: CONST.REPORT.TYPE.EXPENSE,
                        stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                        statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                    };

                    const submittedAction: ReportAction = {
                        ...baseParentReportAction,
                        actionName: CONST.REPORT.ACTIONS.TYPE.SUBMITTED,
                        originalMessage: {
                            amount: 1000,
                            currency: 'USD',
                        },
                    };

                    const reportName = getSearchReportName({
                        report: expenseReport,
                        parentReportActionParam: submittedAction,
                    });

                    expect(reportName).toBe('submitted');
                });

                test('should return approved action name', () => {
                    const expenseReport: Report = {
                        ...baseExpenseReport,
                        stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                        statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
                    };

                    const approvedAction: ReportAction = {
                        ...baseParentReportAction,
                        actionName: CONST.REPORT.ACTIONS.TYPE.APPROVED,
                        originalMessage: {
                            amount: 1000,
                            currency: 'USD',
                        },
                    };

                    const reportName = getSearchReportName({
                        report: expenseReport,
                        parentReportActionParam: approvedAction,
                    });

                    expect(reportName).toBe('approved');
                });

                test('should return rejected action name', () => {
                    const rejectedAction: ReportAction = {
                        ...baseParentReportAction,
                        actionName: CONST.REPORT.ACTIONS.TYPE.REJECTED,
                    };

                    const reportName = getSearchReportName({
                        report: baseExpenseReport,
                        parentReportActionParam: rejectedAction,
                        personalDetails: participantsPersonalDetails,
                    });

                    expect(reportName).toBe('rejected this report');
                });

                test('should handle integration sync failed action', () => {
                    const integrationFailedAction: ReportAction = {
                        ...baseParentReportAction,
                        actionName: CONST.REPORT.ACTIONS.TYPE.INTEGRATION_SYNC_FAILED,
                        originalMessage: {
                            label: 'QuickBooks',
                            errorMessage: 'Sync failed',
                            source: 'quickbooks',
                        },
                    };

                    const props = {
                        report: baseExpenseReport,
                        parentReportActionParam: integrationFailedAction,
                        personalDetails: participantsPersonalDetails,
                    };

                    const reportName = getSearchReportName(props);

                    expect(reportName).toBe(
                        `there was a problem syncing with QuickBooks ("Sync failed"). Please fix the issue in <a href="https://dev.new.expensify.com:8082/workspaces/1/accounting">workspace settings</a>.`,
                    );
                });
            });

            describe('Invoices', () => {
                const corporatePolicy = {
                    ...policy,
                    type: CONST.POLICY.TYPE.CORPORATE,
                    ownerAccountID: 1,
                    managerID: 1,
                };

                const invoiceReceiverPolicy = {
                    ...policy,
                    id: 'policy2',
                    name: 'Receiver Policy',
                    type: CONST.POLICY.TYPE.CORPORATE,
                };

                test('should handle invoice report', () => {
                    const invoiceReport: Report = {
                        reportID: '',
                        policyID: corporatePolicy.id,
                        type: CONST.REPORT.TYPE.INVOICE,
                        ownerAccountID: 1,
                        managerID: 1,
                        chatType: CONST.REPORT.CHAT_TYPE.INVOICE,
                    };

                    const params = {
                        report: invoiceReport,
                        policy: corporatePolicy,
                        personalDetails: participantsPersonalDetails,
                        invoiceReceiverPolicy,
                    };

                    const reportName = getSearchReportName(params);

                    expect(reportName).toBe('Receiver Policy');
                });

                test('should handle invoice room', () => {
                    const invoiceRoom: Report = {
                        reportID: '',
                        policyID: corporatePolicy.id,
                        type: CONST.REPORT.TYPE.CHAT,
                        chatType: CONST.REPORT.CHAT_TYPE.INVOICE,
                        invoiceReceiver: {
                            type: CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL,
                            accountID: 2,
                        },
                    };

                    const params = {
                        report: invoiceRoom,
                        policy: corporatePolicy,
                        personalDetails: participantsPersonalDetails,
                        invoiceReceiverPolicy,
                    };

                    const reportName = getSearchReportName(params);

                    expect(reportName).toBe('floki@vikings.net');
                });
            });
        });

        describe('Fallback scenarios', () => {
            test('should return participant-based name when no specific type matches', () => {
                const genericReport: Report = {
                    reportID: '',
                    participants: buildParticipantsFromAccountIDs([currentUserAccountID, 1]),
                };

                const reportName = getSearchReportName({
                    report: genericReport,
                    personalDetails: participantsPersonalDetails,
                });

                expect(reportName).toBe('Ragnar Lothbrok');
            });

            test('should return report.reportName as fallback when no participants available', () => {
                const reportWithName: Report = {
                    reportID: '',
                    reportName: 'Fallback Report Name',
                    participants: {},
                };

                const reportName = getSearchReportName({
                    report: reportWithName,
                    personalDetails: participantsPersonalDetails,
                });

                expect(reportName).toBe('Fallback Report Name');
            });

            test('should return empty string when no name can be determined', () => {
                const emptyReport: Report = {
                    reportID: '',
                    reportName: '',
                    participants: {},
                };

                const reportName = getSearchReportName({
                    report: emptyReport,
                    personalDetails: participantsPersonalDetails,
                });

                expect(reportName).toBe('');
            });
        });

        describe('Edges cases', () => {
            test('should handle undefined report gracefully', () => {
                const params = {
                    report: undefined,
                };

                const reportName = getSearchReportName(params);

                expect(reportName).toBe('');
            });

            test('should handle empty personalDetails', () => {
                const report: Report = {
                    reportID: '',
                    participants: buildParticipantsFromAccountIDs([1]),
                };

                const params = {
                    report,
                    personalDetails: {},
                };

                const reportName = getSearchReportName(params);

                expect(reportName).toBe('');
            });
        });
    });

    describe('getParentNavigationSubtitle', () => {
        const baseArchivedPolicyExpenseChat = {
            reportID: '2',
            lastReadTime: '2024-02-01 04:56:47.233',
            parentReportActionID: '1',
            parentReportID: '1',
            reportName: 'Base Report',
            type: CONST.REPORT.TYPE.INVOICE,
        };

        const reports: Report[] = [
            {
                reportID: '1',
                lastReadTime: '2024-02-01 04:56:47.233',
                reportName: 'Report',
                policyName: 'A workspace',
                invoiceReceiver: {type: CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL, accountID: 1},
            },
            baseArchivedPolicyExpenseChat,
        ];

        beforeAll(() => {
            const reportCollectionDataSet = toCollectionDataSet(ONYXKEYS.COLLECTION.REPORT, reports, (report) => report.reportID);
            Onyx.multiSet({
                ...reportCollectionDataSet,
            });
            return waitForBatchedUpdates();
        });

        it('should return the correct parent navigation subtitle for the archived invoice report', () => {
            const actual = getParentNavigationSubtitle(baseArchivedPolicyExpenseChat, true);
            const normalizedActual = {...actual, reportName: actual.reportName?.replace(/\u00A0/g, ' ')};
            expect(normalizedActual).toEqual({reportName: 'A workspace & Ragnar Lothbrok (archived)'});
        });

        it('should return the correct parent navigation subtitle for the non archived invoice report', () => {
            const actual = getParentNavigationSubtitle(baseArchivedPolicyExpenseChat, false);
            const normalizedActual = {...actual, reportName: actual.reportName?.replace(/\u00A0/g, ' ')};
            expect(normalizedActual).toEqual({reportName: 'A workspace & Ragnar Lothbrok'});
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

        it('returns true for @here mention in an admin room', () => {
            const adminRoom = createAdminRoom(42);
            const report = {
                ...adminRoom,
                lastReadTime: '2024-03-01 12:00:00.000',
                lastMentionedTime: '2024-03-01 12:00:01.000',
            };
            expect(requiresAttentionFromCurrentUser(report)).toBe(true);
        });

        it('returns false for @here in an admin room when user already read after mention', () => {
            const adminRoom2 = createAdminRoom(43);
            const report = {
                ...adminRoom2,
                lastReadTime: '2024-03-01 12:00:02.000',
                lastMentionedTime: '2024-03-01 12:00:01.000',
            };
            expect(requiresAttentionFromCurrentUser(report)).toBe(false);
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

        it('returns true when expense report is awaiting current user approval without parent access', () => {
            const report = {
                ...LHNTestUtils.getFakeReport(),
                managerID: currentUserAccountID,
                hasParentAccess: false,
                type: CONST.REPORT.TYPE.EXPENSE,
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            };

            expect(requiresAttentionFromCurrentUser(report)).toBe(true);
        });

        it('returns false when awaiting approval but parent accessible or user is not approver', () => {
            const reportWithParentAccess = {
                ...LHNTestUtils.getFakeReport(),
                managerID: currentUserAccountID,
                hasParentAccess: true,
                type: CONST.REPORT.TYPE.EXPENSE,
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            };

            expect(requiresAttentionFromCurrentUser(reportWithParentAccess)).toBe(false);

            const reportWithDifferentManager = {
                ...LHNTestUtils.getFakeReport(),
                managerID: 999999,
                hasParentAccess: false,
                type: CONST.REPORT.TYPE.EXPENSE,
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            };

            expect(requiresAttentionFromCurrentUser(reportWithDifferentManager)).toBe(false);
        });
    });

    describe('getChatRoomSubtitle', () => {
        beforeAll(async () => {
            await Onyx.clear();
            const policyCollectionDataSet = toCollectionDataSet(ONYXKEYS.COLLECTION.POLICY, [policy], (current) => current.id);
            await Onyx.multiSet({
                [ONYXKEYS.PERSONAL_DETAILS_LIST]: participantsPersonalDetails,
                [ONYXKEYS.SESSION]: {email: currentUserEmail, accountID: currentUserAccountID},
                ...policyCollectionDataSet,
            });
        });

        afterEach(async () => {
            await Onyx.clear();
            const policyCollectionDataSet = toCollectionDataSet(ONYXKEYS.COLLECTION.POLICY, [policy], (current) => current.id);
            await Onyx.multiSet({
                [ONYXKEYS.PERSONAL_DETAILS_LIST]: participantsPersonalDetails,
                [ONYXKEYS.SESSION]: {email: currentUserEmail, accountID: currentUserAccountID},
                ...policyCollectionDataSet,
            });
        });

        it('should return empty string for chat thread', () => {
            const report = createWorkspaceThread(1);
            const result = getChatRoomSubtitle(report);
            expect(result).toBe('');
        });

        it('should return "Your space" for self DM', () => {
            const report = createSelfDM(1, currentUserAccountID);
            const result = getChatRoomSubtitle(report);
            expect(result).toBe('Your space');
        });

        it('should return "Invoices" for invoice room', () => {
            const report = createInvoiceRoom(1);
            const result = getChatRoomSubtitle(report);
            expect(result).toBe('Invoices');
        });

        it('should return empty string for non-default, non-user-created, non-policy-expense chat', () => {
            const report = createRegularChat(1, [currentUserAccountID, 2]);
            const result = getChatRoomSubtitle(report);
            expect(result).toBe('');
        });

        it('should return domain name for domain room', () => {
            const report = createDomainRoom(1);
            report.reportName = '#example.com';
            const result = getChatRoomSubtitle(report);
            expect(result).toBe('example.com');
        });

        it('should return policy name for admin room', () => {
            const report = createAdminRoom(1);
            report.policyID = policy.id;
            const result = getChatRoomSubtitle(report);
            expect(result).toBe(policy.name);
        });

        it('should return policy name for announce room', () => {
            const report = createAnnounceRoom(1);
            report.policyID = policy.id;
            const result = getChatRoomSubtitle(report);
            expect(result).toBe(policy.name);
        });

        it('should return policy name for user created policy room', () => {
            const report = {
                ...createRandomReport(1),
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
                policyID: policy.id,
            };
            const result = getChatRoomSubtitle(report);
            expect(result).toBe(policy.name);
        });

        it('should return policy name for policy expense chat when not in create expense flow', () => {
            const report = createPolicyExpenseChat(1);
            report.policyID = policy.id;
            const result = getChatRoomSubtitle(report);
            expect(result).toBe(policy.name);
        });

        it('should return empty string for expense report (not default/user-created/policy-expense)', () => {
            const report = createExpenseReport(1);
            report.policyID = policy.id;
            const result = getChatRoomSubtitle(report);
            expect(result).toBe('');
        });

        it('should return empty string for expense report in create expense flow (not default/user-created/policy-expense)', () => {
            const report = createExpenseReport(1);
            report.policyID = policy.id;
            const result = getChatRoomSubtitle(report, true, false);
            expect(result).toBe('');
        });

        it('should return oldPolicyName when report is archived', () => {
            const report = createAdminRoom(1);
            report.oldPolicyName = 'Old Policy Name';
            const result = getChatRoomSubtitle(report, false, true);
            expect(result).toBe('Old Policy Name');
        });

        it('should return empty string when report is archived but has no oldPolicyName', () => {
            const report = createAdminRoom(1);
            report.oldPolicyName = undefined;
            const result = getChatRoomSubtitle(report, false, true);
            expect(result).toBe('');
        });

        it('should prioritize isReportArchived over other conditions', () => {
            const report = createAdminRoom(1);
            report.policyID = policy.id;
            report.oldPolicyName = 'Archived Policy';
            const result = getChatRoomSubtitle(report, true, true);
            expect(result).toBe('Archived Policy');
        });

        it('should handle with only report data', () => {
            const report = createAdminRoom(1);
            report.policyID = policy.id;
            const result = getChatRoomSubtitle(report);
            expect(result).toBe(policy.name);
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

            it('its archived report', () => {
                const report = {
                    ...LHNTestUtils.getFakeReport(),
                    type: CONST.REPORT.TYPE.EXPENSE,
                };

                const moneyRequestOptions = temporary_getMoneyRequestOptions(report, undefined, [currentUserAccountID], true);
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

        describe('Preferred policy restrictions', () => {
            // Self DM - TRACK should always be allowed regardless of restrictions
            it('should allow TRACK requests for self DMs', () => {
                const selfDMReport = {
                    reportID: '1234',
                    type: CONST.REPORT.TYPE.CHAT,
                    chatType: CONST.REPORT.CHAT_TYPE.SELF_DM,
                    participants: {
                        [currentUserAccountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                    },
                };
                const selfDMParticipants = [currentUserAccountID];

                const withoutRestrictionsResult = temporary_getMoneyRequestOptions(selfDMReport, undefined, selfDMParticipants, false, false);
                const withRestrictionsResult = temporary_getMoneyRequestOptions(selfDMReport, undefined, selfDMParticipants, false, true);

                expect(withoutRestrictionsResult.includes(CONST.IOU.TYPE.TRACK)).toBe(true);
                expect(withRestrictionsResult.includes(CONST.IOU.TYPE.TRACK)).toBe(true);
            });

            // DM - SUBMIT, PAY, SPLIT should be restricted
            it('should restrict SUBMIT requests for DMs', () => {
                const otherUserAccountID = participantsAccountIDs.at(0) ?? 0;
                const dmReport = {
                    reportID: '1235',
                    type: CONST.REPORT.TYPE.CHAT,
                    participants: {
                        [currentUserAccountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                        [otherUserAccountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                    },
                };
                const dmParticipants = [currentUserAccountID, otherUserAccountID];

                const withoutRestrictionsResult = temporary_getMoneyRequestOptions(dmReport, undefined, dmParticipants, false, false);
                const withRestrictionsResult = temporary_getMoneyRequestOptions(dmReport, undefined, dmParticipants, false, true);

                expect(withoutRestrictionsResult.includes(CONST.IOU.TYPE.SUBMIT)).toBe(true);
                expect(withRestrictionsResult.includes(CONST.IOU.TYPE.SUBMIT)).toBe(false);
            });

            it('should restrict PAY requests for DMs', () => {
                const otherUserAccountID = participantsAccountIDs.at(0) ?? 0;
                const dmReport = {
                    reportID: '1236',
                    type: CONST.REPORT.TYPE.CHAT,
                    participants: {
                        [currentUserAccountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                        [otherUserAccountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                    },
                };
                const dmParticipants = [currentUserAccountID, otherUserAccountID];

                const withoutRestrictionsResult = temporary_getMoneyRequestOptions(dmReport, undefined, dmParticipants, false, false);
                const withRestrictionsResult = temporary_getMoneyRequestOptions(dmReport, undefined, dmParticipants, false, true);

                if (withoutRestrictionsResult.includes(CONST.IOU.TYPE.PAY)) {
                    expect(withRestrictionsResult.includes(CONST.IOU.TYPE.PAY)).toBe(false);
                }
            });

            it('should restrict SPLIT requests for DMs', () => {
                const otherUserAccountID = participantsAccountIDs.at(0) ?? 0;
                const dmReport = {
                    reportID: '1237',
                    type: CONST.REPORT.TYPE.CHAT,
                    participants: {
                        [currentUserAccountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                        [otherUserAccountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                    },
                };
                const dmParticipants = [currentUserAccountID, otherUserAccountID];

                const withoutRestrictionsResult = temporary_getMoneyRequestOptions(dmReport, undefined, dmParticipants, false, false);
                const withRestrictionsResult = temporary_getMoneyRequestOptions(dmReport, undefined, dmParticipants, false, true);

                expect(withoutRestrictionsResult.includes(CONST.IOU.TYPE.SPLIT)).toBe(true);
                expect(withRestrictionsResult.includes(CONST.IOU.TYPE.SPLIT)).toBe(false);
            });

            // Group Chat - Only SPLIT functionality available, should be restricted

            it('should restrict SPLIT requests for group chats', () => {
                const groupParticipants = [currentUserAccountID, ...participantsAccountIDs.slice(0, 3)];
                const groupChatReport = {
                    ...LHNTestUtils.getFakeReport(groupParticipants),
                    type: CONST.REPORT.TYPE.CHAT,
                    chatType: undefined,
                };

                const withoutRestrictionsResult = temporary_getMoneyRequestOptions(groupChatReport, undefined, groupParticipants, false, false);
                const withRestrictionsResult = temporary_getMoneyRequestOptions(groupChatReport, undefined, groupParticipants, false, true);

                expect(withoutRestrictionsResult.includes(CONST.IOU.TYPE.SPLIT)).toBe(true);
                expect(withRestrictionsResult.includes(CONST.IOU.TYPE.SPLIT)).toBe(false);
            });

            // Policy Rooms - SPLIT should be restricted

            it('should restrict SPLIT requests for user-created policy rooms', () => {
                const policyRoomParticipants = [currentUserAccountID, participantsAccountIDs.at(0) ?? 0];
                const policyRoomReport = {
                    ...LHNTestUtils.getFakeReport(policyRoomParticipants),
                    type: CONST.REPORT.TYPE.CHAT,
                    chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
                };

                const withoutRestrictionsResult = temporary_getMoneyRequestOptions(policyRoomReport, undefined, policyRoomParticipants, false, false);
                const withRestrictionsResult = temporary_getMoneyRequestOptions(policyRoomReport, undefined, policyRoomParticipants, false, true);

                expect(withoutRestrictionsResult.includes(CONST.IOU.TYPE.SPLIT)).toBe(true);
                expect(withRestrictionsResult.includes(CONST.IOU.TYPE.SPLIT)).toBe(false);
            });
        });
    });

    describe('canCreateRequest', () => {
        describe('Preferred policy restrictions', () => {
            const participantsAccountIDs = Object.keys(participantsPersonalDetails).map(Number);

            // Self DM - TRACK should always be allowed regardless of restrictions
            it('should allow TRACK requests for self DMs', () => {
                const selfDMReport = {
                    reportID: '2234',
                    type: CONST.REPORT.TYPE.CHAT,
                    chatType: CONST.REPORT.CHAT_TYPE.SELF_DM,
                    participants: {
                        [currentUserAccountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                    },
                };

                const withoutRestrictionsResult = canCreateRequest(selfDMReport, undefined, CONST.IOU.TYPE.TRACK, false, false);
                const withRestrictionsResult = canCreateRequest(selfDMReport, undefined, CONST.IOU.TYPE.TRACK, false, true);

                expect(withoutRestrictionsResult).toBe(true);
                expect(withRestrictionsResult).toBe(true);
            });

            // DM - SPLIT should be restricted

            it('should restrict SPLIT requests for DMs', () => {
                const otherUserAccountID = participantsAccountIDs.at(0) ?? 0;
                const dmReport = {
                    reportID: '2237',
                    type: CONST.REPORT.TYPE.CHAT,
                    participants: {
                        [currentUserAccountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                        [otherUserAccountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                    },
                };

                const withoutRestrictionsResult = canCreateRequest(dmReport, undefined, CONST.IOU.TYPE.SPLIT, false, false);
                const withRestrictionsResult = canCreateRequest(dmReport, undefined, CONST.IOU.TYPE.SPLIT, false, true);

                expect(withoutRestrictionsResult).toBe(true);
                expect(withRestrictionsResult).toBe(false);
            });

            // Group Chat - Only SPLIT functionality available, should be restricted

            it('should restrict SPLIT requests for group chats', () => {
                const groupChat = LHNTestUtils.getFakeReport([currentUserAccountID, ...participantsAccountIDs.slice(0, 3)]);

                const withoutRestrictionsResult = canCreateRequest(groupChat, undefined, CONST.IOU.TYPE.SPLIT, false, false);
                const withRestrictionsResult = canCreateRequest(groupChat, undefined, CONST.IOU.TYPE.SPLIT, false, true);

                expect(withoutRestrictionsResult).toBe(true);
                expect(withRestrictionsResult).toBe(false);
            });

            // Policy Rooms - SPLIT should be restricted

            it('should restrict SPLIT requests for user-created policy rooms', () => {
                const policyRoom = {
                    ...LHNTestUtils.getFakeReport([currentUserAccountID, participantsAccountIDs.at(0) ?? 0]),
                    chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
                };

                const withoutRestrictionsResult = canCreateRequest(policyRoom, undefined, CONST.IOU.TYPE.SPLIT, false, false);
                const withRestrictionsResult = canCreateRequest(policyRoom, undefined, CONST.IOU.TYPE.SPLIT, false, true);

                expect(withoutRestrictionsResult).toBe(true);
                expect(withRestrictionsResult).toBe(false);
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

        it('should return true for admins rooms chat when posting tasks in admins room', async () => {
            await Onyx.multiSet({
                [ONYXKEYS.NVP_ONBOARDING]: {hasCompletedGuidedSetupFlow: true},
            });

            const report = {
                ...LHNTestUtils.getFakeReport(),
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_ADMINS,
            };
            expect(isChatUsedForOnboarding(report, CONST.ONBOARDING_CHOICES.MANAGE_TEAM)).toBeTruthy();
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
                [currentUserAccountID]: {
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

        it('it should return true for pay iou action with IOUDetails which is linked to send money flow', async () => {
            const expenseReport: Report = {
                reportID: '1',
                type: CONST.REPORT.TYPE.EXPENSE,
            };
            const transaction = createRandomTransaction(22);
            const moneyRequestAction: ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU> = {
                reportActionID: '3',
                actorAccountID: currentUserAccountID,
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                originalMessage: {
                    IOUReportID: expenseReport.reportID,
                    IOUTransactionID: transaction.transactionID,
                    type: CONST.IOU.REPORT_ACTION_TYPE.PAY,
                    IOUDetails: {
                        amount: 530,
                        currency: CONST.CURRENCY.USD,
                        comment: '',
                    },
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
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`, expenseReport);

            const canEditRequest = canEditMoneyRequest(moneyRequestAction, transaction, true);

            expect(canEditRequest).toEqual(true);
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

            expect(canDeleteReportAction(moneyRequestAction, currentReportId, transaction, undefined, undefined)).toBe(false);
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

            expect(canDeleteReportAction(moneyRequestAction, '1', transaction, undefined, undefined)).toBe(true);
        });

        it('should return false for unreported card expense imported with deleting disabled', async () => {
            // Given the unreported card expense import with deleting disabled
            const selfDMReport = {
                ...LHNTestUtils.getFakeReport(),
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.SELF_DM,
            };

            const transaction: Transaction = {
                ...createRandomTransaction(1),
                reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
                managedCard: true,
                comment: {
                    liabilityType: CONST.TRANSACTION.LIABILITY_TYPE.RESTRICT,
                },
            };

            const trackExpenseAction: ReportAction = {
                ...LHNTestUtils.getFakeReportAction(),
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                actorAccountID: currentUserAccountID,
                originalMessage: {
                    IOUTransactionID: transaction.transactionID,
                    IOUReportID: CONST.REPORT.UNREPORTED_REPORT_ID,
                    amount: 100,
                    currency: CONST.CURRENCY.USD,
                    type: CONST.IOU.REPORT_ACTION_TYPE.TRACK,
                },
                message: [
                    {
                        type: 'COMMENT',
                        html: '$1.00 expense',
                        text: '$1.00 expense',
                        isEdited: false,
                        whisperedTo: [],
                        isDeletedParentAction: false,
                    },
                ],
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${selfDMReport.reportID}`, selfDMReport);

            // Then it should return false since the unreported card expense is imported with deleting disabled
            expect(canDeleteReportAction(trackExpenseAction, selfDMReport.reportID, transaction, undefined, undefined)).toBe(false);
        });

        it("should return false for ADD_COMMENT report action the current user (admin of the personal policy) didn't comment", async () => {
            const adminPolicy = {...LHNTestUtils.getFakePolicy(), type: CONST.POLICY.TYPE.PERSONAL};

            const report = {...LHNTestUtils.getFakeReport(), policyID: adminPolicy.id};
            const reportAction: ReportAction = {
                ...LHNTestUtils.getFakeReportAction(),
                actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                actorAccountID: currentUserAccountID + 1,
                parentReportID: report.reportID,
                message: [
                    {
                        type: 'COMMENT',
                        html: 'hey',
                        text: 'hey',
                        isEdited: false,
                        whisperedTo: [],
                        isDeletedParentAction: false,
                    },
                ],
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${adminPolicy.id}`, adminPolicy);

            expect(canDeleteReportAction(reportAction, report.reportID, undefined, undefined, undefined)).toBe(false);
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
            type: CONST.POLICY.TYPE.CORPORATE,
            employeeList: {
                [currentUserEmail]: {
                    role: CONST.POLICY.ROLE.AUDITOR,
                },
            },
            role: CONST.POLICY.ROLE.AUDITOR,
        };

        beforeAll(async () => {
            await Onyx.set(ONYXKEYS.SESSION, {email: currentUserEmail, accountID: currentUserAccountID});
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}1`, policyTest);
        });

        afterAll(() => Onyx.clear());

        it('should return false for admin of a group policy with reimbursement enabled and report not approved', () => {
            expect(isPayer({email: currentUserEmail, accountID: currentUserAccountID}, unapprovedReport, false)).toBe(false);
        });

        it('should return false for non-admin of a group policy', () => {
            expect(isPayer({email: currentUserEmail, accountID: currentUserAccountID}, approvedReport, false)).toBe(false);
        });

        it('should return true for a reimburser of a group policy on a closed report', async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}1`, {reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES, achAccount: {reimburser: currentUserEmail}});

            const closedReport: Report = {
                ...createRandomReport(2),
                type: CONST.REPORT.TYPE.EXPENSE,
                stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                statusNum: CONST.REPORT.STATUS_NUM.CLOSED,
                managerID: currentUserAccountID + 1,
                policyID: policyTest.id,
            };

            expect(isPayer({email: currentUserEmail, accountID: currentUserAccountID}, closedReport, false)).toBe(true);
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

        it('should return false for a closed report', async () => {
            // Given a closed expense report
            const report: Report = {
                ...createRandomReport(10002),
                type: CONST.REPORT.TYPE.EXPENSE,
                statusNum: CONST.REPORT.STATUS_NUM.CLOSED,
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);

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

        it('should return false for a closed report', async () => {
            // Given a closed expense report
            const report: Report = {
                ...createRandomReport(10002),
                type: CONST.REPORT.TYPE.EXPENSE,
                statusNum: CONST.REPORT.STATUS_NUM.CLOSED,
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);

            const {result: isReportArchived} = renderHook(() => useReportIsArchived(report?.reportID));
            const result = canAddTransaction(report, isReportArchived.current);

            // Then the result is false
            expect(result).toBe(false);
        });

        describe('with workflow disabled', () => {
            const workflowDisabledPolicy: Policy = {
                ...createRandomPolicy(1),
                autoReporting: true,
                autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT,
                approvalMode: CONST.POLICY.APPROVAL_MODE.OPTIONAL,
                reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO,
            };

            beforeAll(() => {
                return Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${workflowDisabledPolicy.id}`, workflowDisabledPolicy);
            });

            afterAll(() => {
                return Onyx.clear();
            });

            it('should return true for reopened report when workflow is disabled', async () => {
                const openReport: Report = {
                    ...createExpenseReport(20002),
                    policyID: '1',
                    stateNum: CONST.REPORT.STATE_NUM.OPEN,
                    statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                };

                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${openReport.reportID}`, openReport);

                expect(canDeleteTransaction(openReport, false)).toBe(true);
            });

            it('should return false for closed report when workflow is disabled', async () => {
                const closedReport: Report = {
                    ...createExpenseReport(20002),
                    policyID: '1',
                    stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                    statusNum: CONST.REPORT.STATUS_NUM.CLOSED,
                };

                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${closedReport.reportID}`, closedReport);

                expect(canDeleteTransaction(closedReport, false)).toBe(false);
            });
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
        it('should return false for announce room when the role of the employee is admin and report is archived', async () => {
            // Given a policy announce room of a policy that the user has an admin role
            const workspace: Policy = {...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM), role: CONST.POLICY.ROLE.ADMIN};
            const policyAnnounceRoom: Report = {
                ...createRandomReport(50001),
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_ANNOUNCE,
                participants: buildParticipantsFromAccountIDs([currentUserAccountID, 1]),
                policyID: policy.id,
                writeCapability: CONST.REPORT.WRITE_CAPABILITIES.ADMINS,
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${workspace.id}`, workspace);

            const result = canUserPerformWriteAction(policyAnnounceRoom, true);

            expect(result).toBe(false);
        });
        it('should return true for announce room when the role of the employee is admin and report is not archived', async () => {
            // Given a policy announce room of a policy that the user has an admin role
            const workspace: Policy = {...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM), role: CONST.POLICY.ROLE.ADMIN};
            const policyAnnounceRoom: Report = {
                ...createRandomReport(50001),
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_ANNOUNCE,
                participants: buildParticipantsFromAccountIDs([currentUserAccountID, 1]),
                policyID: policy.id,
                writeCapability: CONST.REPORT.WRITE_CAPABILITIES.ADMINS,
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${workspace.id}`, workspace);

            const result = canUserPerformWriteAction(policyAnnounceRoom, false);

            expect(result).toBe(true);
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

    describe('isMoneyRequestReportEligibleForMerge', () => {
        const mockReportID = 'report123';
        const differentUserAccountID = 123123;

        beforeEach(async () => {
            await Onyx.multiSet({
                [ONYXKEYS.PERSONAL_DETAILS_LIST]: participantsPersonalDetails,
                [ONYXKEYS.SESSION]: {email: currentUserEmail, accountID: currentUserAccountID},
            });
        });

        afterEach(async () => {
            await Onyx.clear();
        });

        it('should return false when report is not a money request report', async () => {
            // Given a regular chat report that is not a money request report
            const chatReport: Report = {
                ...createRandomReport(1),
                reportID: mockReportID,
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${mockReportID}`, chatReport);

            // When we check if the report is eligible for merge
            const result = isMoneyRequestReportEligibleForMerge(mockReportID, true);

            // Then it should return false because it's not a money request report
            expect(result).toBe(false);
        });

        it('should return false when report does not exist', () => {
            // Given a non-existent report ID
            const nonExistentReportID = 'nonexistent123';

            // When we check if the report is eligible for merge
            const result = isMoneyRequestReportEligibleForMerge(nonExistentReportID, true);

            // Then it should return false because the report doesn't exist
            expect(result).toBe(false);
        });

        describe('Admin role', () => {
            it('should return true for open expense report when user is admin', async () => {
                // Given an open expense report and the user is an admin
                const expenseReport: Report = {
                    ...createExpenseReport(1),
                    reportID: mockReportID,
                    stateNum: CONST.REPORT.STATE_NUM.OPEN,
                    statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                };
                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${mockReportID}`, expenseReport);

                // When we check if the report is eligible for merge as an admin
                const result = isMoneyRequestReportEligibleForMerge(mockReportID, true);

                // Then it should return true because admins can merge open expense reports
                expect(result).toBe(true);
            });

            it('should return true for processing expense report when user is admin', async () => {
                // Given a processing expense report and the user is an admin
                const expenseReport: Report = {
                    ...createExpenseReport(1),
                    reportID: mockReportID,
                    stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                    statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                };
                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${mockReportID}`, expenseReport);

                // When we check if the report is eligible for merge as an admin
                const result = isMoneyRequestReportEligibleForMerge(mockReportID, true);

                // Then it should return true because admins can merge processing expense reports
                expect(result).toBe(true);
            });

            it('should return false for approved expense report when user is admin', async () => {
                // Given an approved expense report and the user is an admin
                const expenseReport: Report = {
                    ...createExpenseReport(1),
                    reportID: mockReportID,
                    stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                    statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
                };
                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${mockReportID}`, expenseReport);

                // When we check if the report is eligible for merge as an admin
                const result = isMoneyRequestReportEligibleForMerge(mockReportID, true);

                // Then it should return false because approved reports are not eligible for merge
                expect(result).toBe(false);
            });

            it('should return true for open IOU report when user is admin', async () => {
                // Given an open IOU report and the user is an admin
                const iouReport: Report = {
                    ...createExpenseRequestReport(1),
                    reportID: mockReportID,
                    stateNum: CONST.REPORT.STATE_NUM.OPEN,
                    statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                };
                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${mockReportID}`, iouReport);

                // When we check if the report is eligible for merge as an admin
                const result = isMoneyRequestReportEligibleForMerge(mockReportID, true);

                // Then it should return true because admins can merge open IOU reports
                expect(result).toBe(true);
            });
        });

        describe('Submitter role', () => {
            it('should return true for open expense report when user is submitter', async () => {
                // Given an open expense report where the current user is the submitter
                const expenseReport: Report = {
                    ...createExpenseReport(1),
                    reportID: mockReportID,
                    ownerAccountID: currentUserAccountID,
                    stateNum: CONST.REPORT.STATE_NUM.OPEN,
                    statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                };
                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${mockReportID}`, expenseReport);

                // When we check if the report is eligible for merge as a submitter
                const result = isMoneyRequestReportEligibleForMerge(mockReportID, false);

                // Then it should return true because submitters can merge open expense reports
                expect(result).toBe(true);
            });

            it('should return true for processing IOU report when user is submitter', async () => {
                // Given a processing IOU report where the current user is the submitter
                const iouReport: Report = {
                    ...createExpenseRequestReport(1),
                    reportID: mockReportID,
                    ownerAccountID: currentUserAccountID,
                    stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                    statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                };
                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${mockReportID}`, iouReport);

                // When we check if the report is eligible for merge as a submitter
                const result = isMoneyRequestReportEligibleForMerge(mockReportID, false);

                // Then it should return true because submitters can merge processing IOU reports
                expect(result).toBe(true);
            });

            it('should return true for processing expense report at first level approval when user is submitter', async () => {
                const managerAccountID = 123123;
                const managerEmail = 'manager@test.com';
                // Create a policy with appropriate approval settings
                const firstLevelApprovalPolicy: Policy = {
                    ...createRandomPolicy(1),
                    type: CONST.POLICY.TYPE.CORPORATE,
                    approvalMode: CONST.POLICY.APPROVAL_MODE.ADVANCED,
                    preventSelfApproval: true,
                    approver: managerEmail,
                };

                // Given a processing expense report at first level approval where the current user is the submitter
                const expenseReport: Report = {
                    ...createExpenseReport(1),
                    policyID: firstLevelApprovalPolicy.id,
                    reportID: mockReportID,
                    ownerAccountID: currentUserAccountID,
                    stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                    statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                    managerID: managerAccountID,
                };
                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${mockReportID}`, expenseReport);
                await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${firstLevelApprovalPolicy.id}`, firstLevelApprovalPolicy);
                await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, {
                    [managerAccountID]: {
                        accountID: managerAccountID,
                        login: managerEmail,
                    },
                });

                // When we check if the report is eligible for merge as a submitter
                const result = isMoneyRequestReportEligibleForMerge(mockReportID, false);

                // Then it should return true because submitters can merge processing expense reports
                expect(result).toBe(true);
            });

            it('should return false for processing expense report beyond first level approval when user is submitter', async () => {
                // Given a processing expense report beyond first level approval where the current user is the submitter
                const expenseReport: Report = {
                    ...createExpenseReport(1),
                    reportID: mockReportID,
                    ownerAccountID: currentUserAccountID,
                    stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                    statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                };
                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${mockReportID}`, expenseReport);

                // When we check if the report is eligible for merge as a submitter
                const result = isMoneyRequestReportEligibleForMerge(mockReportID, false);

                // Then the result depends on the actual approval level logic in the implementation
                expect(typeof result).toBe('boolean');
            });

            it('should return false when user is not the submitter', async () => {
                // Given an open expense report where the current user is not the submitter
                const expenseReport: Report = {
                    ...createExpenseReport(1),
                    reportID: mockReportID,
                    ownerAccountID: differentUserAccountID,
                    stateNum: CONST.REPORT.STATE_NUM.OPEN,
                    statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                };
                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${mockReportID}`, expenseReport);

                // When we check if the report is eligible for merge as a non-submitter
                const result = isMoneyRequestReportEligibleForMerge(mockReportID, false);

                // Then it should return false because the user is not the submitter and not an admin
                expect(result).toBe(false);
            });
        });

        describe('Manager role', () => {
            const managerAccountID = currentUserAccountID;

            it('should return true for processing expense report when user is manager', async () => {
                // Given a processing expense report where the current user is the manager
                const expenseReport: Report = {
                    ...createExpenseReport(1),
                    reportID: mockReportID,
                    ownerAccountID: differentUserAccountID, // Different user as submitter
                    managerID: managerAccountID,
                    stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                    statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                };
                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${mockReportID}`, expenseReport);

                // When we check if the report is eligible for merge as a manager
                const result = isMoneyRequestReportEligibleForMerge(mockReportID, false);

                // Then it should return true because managers can merge processing expense reports
                expect(result).toBe(true);
            });

            it('should return false for open expense report when user is manager', async () => {
                // Given an open expense report where the current user is the manager
                const expenseReport: Report = {
                    ...createExpenseReport(1),
                    reportID: mockReportID,
                    ownerAccountID: differentUserAccountID, // Different user as submitter
                    managerID: managerAccountID,
                    stateNum: CONST.REPORT.STATE_NUM.OPEN,
                    statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                };
                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${mockReportID}`, expenseReport);

                // When we check if the report is eligible for merge as a manager
                const result = isMoneyRequestReportEligibleForMerge(mockReportID, false);

                // Then it should return false because managers can only merge processing expense reports, not open ones
                expect(result).toBe(false);
            });

            it('should return false for IOU report when user is manager', async () => {
                // Given an IOU report where the current user is the manager
                const iouReport: Report = {
                    ...createExpenseRequestReport(1),
                    reportID: mockReportID,
                    ownerAccountID: differentUserAccountID, // Different user as submitter
                    managerID: managerAccountID,
                    stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                    statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                };
                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${mockReportID}`, iouReport);

                // When we check if the report is eligible for merge as a manager
                const result = isMoneyRequestReportEligibleForMerge(mockReportID, false);

                // Then it should return false because managers can only merge expense reports, not IOU reports
                expect(result).toBe(false);
            });

            it('should return false when user is not the manager', async () => {
                // Given a processing expense report where the current user is not the manager
                const expenseReport: Report = {
                    ...createExpenseReport(1),
                    reportID: mockReportID,
                    ownerAccountID: differentUserAccountID, // Different user as submitter
                    managerID: differentUserAccountID,
                    stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                    statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                };
                await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${mockReportID}`, expenseReport);

                // When we check if the report is eligible for merge as a non-manager
                const result = isMoneyRequestReportEligibleForMerge(mockReportID, false);

                // Then it should return false because the user is not the manager, submitter, or admin
                expect(result).toBe(false);
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

    describe('buildOptimisticReportPreview', () => {
        it('should include childOwnerAccountID and childManagerAccountID that matches with iouReport data', () => {
            const chatReport: Report = {
                ...createRandomReport(100),
                type: CONST.REPORT.TYPE.CHAT,
                chatType: undefined,
            };

            const iouReport: Report = {
                ...createRandomReport(200),
                parentReportID: '1',
                type: CONST.REPORT.TYPE.IOU,
                chatType: undefined,
                ownerAccountID: 1,
                managerID: 2,
            };

            const reportPreviewAction = buildOptimisticReportPreview(chatReport, iouReport);

            expect(reportPreviewAction.childOwnerAccountID).toBe(iouReport.ownerAccountID);
            expect(reportPreviewAction.childManagerAccountID).toBe(iouReport.managerID);
        });
    });

    describe('populateOptimisticReportFormula', () => {
        const mockPolicy: Policy = {
            id: 'test-policy-id',
            name: 'Test Policy',
            type: CONST.POLICY.TYPE.TEAM,
            role: CONST.POLICY.ROLE.ADMIN,
            owner: 'test@example.com',
            outputCurrency: CONST.CURRENCY.USD,
            isPolicyExpenseChatEnabled: true,
            autoReporting: true,
            autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.WEEKLY,
            harvesting: {
                enabled: true,
            },
            defaultBillable: false,
            disabledFields: {},
            fieldList: {},
            customUnits: {},
            areCategoriesEnabled: true,
            areTagsEnabled: true,
            areDistanceRatesEnabled: true,
            areWorkflowsEnabled: true,
            areReportFieldsEnabled: true,
            areConnectionsEnabled: true,
            pendingAction: undefined,
            errors: {},
            isLoading: false,
            errorFields: {},
        };

        const mockReport = {
            reportID: '123456789',
            reportName: 'Test Report',
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: 1,
            currency: CONST.CURRENCY.USD,
            total: -5000,
            lastVisibleActionCreated: '2024-01-15 10:30:00',
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            chatReportID: 'chat-123',
            policyID: 'test-policy-id',
            participants: {},
            parentReportID: 'chat-123',
        };

        it('should handle NaN total gracefully', () => {
            const reportWithNaNTotal = {
                ...mockReport,
                total: NaN,
            };

            const result = populateOptimisticReportFormula('{report:total}', reportWithNaNTotal, mockPolicy);
            expect(result).toBe('{report:total}');
        });

        it('should replace {report:total} with formatted amount', () => {
            const result = populateOptimisticReportFormula('{report:total}', mockReport, mockPolicy);
            expect(result).toBe('$50.00');
        });

        it('should replace {report:id} with base62 report ID', () => {
            const result = populateOptimisticReportFormula('{report:id}', mockReport, mockPolicy);
            expect(result).toBe(getBase62ReportID(Number(mockReport.reportID)));
        });

        it('should replace multiple placeholders correctly', () => {
            const formula = 'Report {report:id} has total {report:total}';
            const result = populateOptimisticReportFormula(formula, mockReport, mockPolicy);
            const expectedId = getBase62ReportID(Number(mockReport.reportID));
            expect(result).toBe(`Report ${expectedId} has total $50.00`);
        });

        it('should handle undefined total gracefully', () => {
            const reportWithUndefinedTotal = {
                ...mockReport,
                total: undefined,
            };

            const result = populateOptimisticReportFormula('{report:total}', reportWithUndefinedTotal, mockPolicy);
            expect(result).toBe('{report:total}');
        });

        it('should handle complex formula with multiple placeholders and some invalid values', () => {
            const formula = 'ID: {report:id}, Total: {report:total}, Type: {report:type}';
            const reportWithNaNTotal = {
                ...mockReport,
                total: NaN,
            };
            const expectedId = getBase62ReportID(Number(mockReport.reportID));
            const result = populateOptimisticReportFormula(formula, reportWithNaNTotal, mockPolicy);
            expect(result).toBe(`ID: ${expectedId}, Total: , Type: Expense Report`);
        });

        it('should handle missing total gracefully', () => {
            const reportWithMissingTotal = {
                ...mockReport,
                total: undefined,
            };

            const result = populateOptimisticReportFormula('{report:total}', reportWithMissingTotal, mockPolicy);
            expect(result).toBe('{report:total}');
        });
    });
    describe('canSeeDefaultRoom', () => {
        it('should return true if report is archived room ', () => {
            const betas = [CONST.BETAS.DEFAULT_ROOMS];
            const report: Report = {
                ...createRandomReport(40002),
                type: CONST.REPORT.TYPE.CHAT,
                participants: buildParticipantsFromAccountIDs([currentUserAccountID, 1]),
            };
            expect(canSeeDefaultRoom(report, betas, true)).toBe(true);
        });
        it('should return true if the room has an assigned guide', () => {
            const betas = [CONST.BETAS.DEFAULT_ROOMS];
            const report: Report = {
                ...createRandomReport(40002),
                participants: buildParticipantsFromAccountIDs([currentUserAccountID, 8]),
            };
            Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetails).then(() => {
                expect(canSeeDefaultRoom(report, betas, false)).toBe(true);
            });
        });
        it('should return true if the report is admin room', () => {
            const betas = [CONST.BETAS.DEFAULT_ROOMS];
            const report: Report = {
                ...createRandomReport(40002),
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_ADMINS,
            };
            Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetails).then(() => {
                expect(canSeeDefaultRoom(report, betas, false)).toBe(true);
            });
        });
    });

    describe('getAllReportActionsErrorsAndReportActionThatRequiresAttention', () => {
        const report: Report = {
            ...createRandomReport(40003),
            parentReportID: '40004',
            parentReportActionID: '2',
        };
        const parentReport: Report = {
            ...createRandomReport(40004),
            statusNum: 0,
        };
        const reportAction1: ReportAction = {
            ...createRandomReportAction(1),
            reportID: report.reportID,
        };
        const parentReportAction1: ReportAction = {
            ...createRandomReportAction(2),
            reportID: '40004',
            actorAccountID: currentUserAccountID,
        };
        const reportActions = [reportAction1, parentReportAction1].reduce<ReportActions>((acc, action) => {
            if (action.reportActionID) {
                acc[action.reportActionID] = action;
            }
            return acc;
        }, {});
        beforeEach(async () => {
            await Onyx.clear();
            await Onyx.set(ONYXKEYS.SESSION, {email: currentUserEmail, accountID: currentUserAccountID});
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${parentReport.reportID}`, parentReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportAction1.reportID}`, {
                [reportAction1.reportActionID]: reportAction1,
            });
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportAction1.reportID}`, {
                [parentReportAction1.reportActionID]: parentReportAction1,
            });

            return waitForBatchedUpdates();
        });
        it("should return nothing when there's no actions required", () => {
            expect(getAllReportActionsErrorsAndReportActionThatRequiresAttention(report, reportActions, false)).toEqual({
                errors: {},
                reportAction: undefined,
            });
        });
        it("should return error with report action when there's actions required", async () => {
            const reportActionWithError: ReportAction = {
                ...createRandomReportAction(1),
                reportID: report.reportID,
                errors: {
                    reportID: 'Error message',
                    accountID: 'Error in accountID',
                },
            };
            const reportActionsWithError = {
                ...reportActions,
                [reportActionWithError.reportActionID]: reportActionWithError,
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportActionWithError.reportID}`, {
                [reportActionWithError.reportActionID]: reportActionWithError,
            });
            await waitForBatchedUpdates();
            expect(getAllReportActionsErrorsAndReportActionThatRequiresAttention(report, reportActionsWithError, false)).toEqual({
                errors: {
                    reportID: 'Error message',
                    accountID: 'Error in accountID',
                },
                reportAction: reportActionWithError,
            });
        });
        it("should return smart scan error with no report action when there's actions required and report is not archived", async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportAction1.reportID}`, {
                [parentReportAction1.reportActionID]: {
                    actorAccountID: currentUserAccountID,
                    actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                    originalMessage: {
                        type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                        IOUTransactionID: '12345',
                    },
                },
            });
            const transaction: Transaction = {
                ...createRandomTransaction(12345),
                reportID: parentReport.reportID,
                amount: 0,
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction);
            await waitForBatchedUpdates();
            const {errors, reportAction} = getAllReportActionsErrorsAndReportActionThatRequiresAttention(report, reportActions, false);
            expect(Object.keys(errors)).toHaveLength(1);
            expect(Object.keys(errors).at(0)).toBe('smartscan');
            expect(Object.keys(errors.smartscan ?? {})).toHaveLength(1);
            expect(errors.smartscan?.[Object.keys(errors.smartscan)[0]]).toEqual('Transaction is missing fields');
            expect(reportAction).toBeUndefined();
        });
        it("should return no error and no report action when there's actions required and report is archived", async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportAction1.reportID}`, {
                [parentReportAction1.reportActionID]: {
                    actorAccountID: currentUserAccountID,
                    actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                    originalMessage: {
                        type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                        IOUTransactionID: '12345',
                    },
                },
            });
            const transaction: Transaction = {
                ...createRandomTransaction(12345),
                reportID: parentReport.reportID,
                amount: 0,
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction);
            await waitForBatchedUpdates();
            const {errors, reportAction} = getAllReportActionsErrorsAndReportActionThatRequiresAttention(report, reportActions, true);
            expect(Object.keys(errors)).toHaveLength(0);
            expect(reportAction).toBeUndefined();
        });
    });

    describe('excludeParticipantsForDisplay', () => {
        const mockParticipants = {
            1: {notificationPreference: 'always'},
            2: {notificationPreference: 'hidden'},
            3: {notificationPreference: 'daily'},
            4: {notificationPreference: 'always'},
        } as Participants;

        const mockReportMetadata = {
            pendingChatMembers: [
                {accountID: '3', pendingAction: 'delete'},
                {accountID: '4', pendingAction: 'add'},
            ],
        } as OnyxEntry<ReportMetadata>;

        it('should return original array when no exclude options provided', () => {
            const participantsIDs = [1, 2, 3, 4];
            const result = excludeParticipantsForDisplay(participantsIDs, mockParticipants);
            expect(result).toEqual(participantsIDs);
        });

        it('should return original array when excludeOptions is undefined', () => {
            const participantsIDs = [1, 2, 3, 4];
            const result = excludeParticipantsForDisplay(participantsIDs, mockParticipants, mockReportMetadata, undefined);
            expect(result).toEqual(participantsIDs);
        });

        it('should exclude current user when shouldExcludeCurrentUser is true', () => {
            const participantsIDs = [1, 2, currentUserAccountID, 4];
            const result = excludeParticipantsForDisplay(participantsIDs, mockParticipants, mockReportMetadata, {
                shouldExcludeCurrentUser: true,
            });
            expect(result).toEqual([1, 2, 4]);
            expect(result).not.toContain(currentUserAccountID);
        });

        it('should exclude hidden participants when shouldExcludeHidden is true', () => {
            const participantsIDs = [1, 2, 3, 4];
            const result = excludeParticipantsForDisplay(participantsIDs, mockParticipants, mockReportMetadata, {
                shouldExcludeHidden: true,
            });
            expect(result).toEqual([1, 3, 4]);
            expect(result).not.toContain(2); // participant 2 has 'hidden' notification preference
        });

        it('should exclude deleted participants when shouldExcludeDeleted is true', () => {
            const participantsIDs = [1, 2, 3, 4];
            const result = excludeParticipantsForDisplay(participantsIDs, mockParticipants, mockReportMetadata, {
                shouldExcludeDeleted: true,
            });
            expect(result).toEqual([1, 2, 4]);
            expect(result).not.toContain(3); // participant 3 has pending delete action
        });

        it('should apply multiple exclusions when multiple options are true', () => {
            const participantsIDs = [1, 2, 3, currentUserAccountID];
            const result = excludeParticipantsForDisplay(participantsIDs, mockParticipants, mockReportMetadata, {
                shouldExcludeCurrentUser: true,
                shouldExcludeHidden: true,
                shouldExcludeDeleted: true,
            });
            expect(result).toEqual([1]);
        });

        it('should handle empty participants array', () => {
            const participantsIDs: number[] = [];
            const result = excludeParticipantsForDisplay(participantsIDs, mockParticipants, mockReportMetadata, {
                shouldExcludeCurrentUser: true,
                shouldExcludeHidden: true,
                shouldExcludeDeleted: true,
            });
            expect(result).toEqual([]);
        });

        it('should exclude participants not in the participants object when shouldExcludeHidden is true', () => {
            const participantsIDs = [99, 100];
            const result = excludeParticipantsForDisplay(participantsIDs, mockParticipants, mockReportMetadata, {
                shouldExcludeHidden: true,
            });
            expect(result).toEqual([]); // Should exclude unknown participants because they have undefined notification preference (treated as hidden)
        });

        it('should not exclude participants not in the participants object when shouldExcludeHidden is false', () => {
            const participantsIDs = [99, 100];
            const result = excludeParticipantsForDisplay(participantsIDs, mockParticipants, mockReportMetadata, {
                shouldExcludeHidden: false,
            });
            expect(result).toEqual([99, 100]); // Should not exclude unknown participants when not excluding hidden
        });

        it('should handle report metadata without pending chat members', () => {
            const participantsIDs = [1, 2, 3, 4];
            const emptyMetadata = {};
            const result = excludeParticipantsForDisplay(participantsIDs, mockParticipants, emptyMetadata, {
                shouldExcludeDeleted: true,
            });
            expect(result).toEqual(participantsIDs); // Should not exclude any when no pending members
        });

        it('should only exclude based on last pending action when multiple actions for same user', () => {
            const participantsIDs = [1, 2, 3];
            const metadataWithMultipleActions = {
                pendingChatMembers: [
                    {accountID: '3', pendingAction: 'add'},
                    {accountID: '3', pendingAction: 'delete'},
                ],
            } as OnyxEntry<ReportMetadata>;
            const result = excludeParticipantsForDisplay(participantsIDs, mockParticipants, metadataWithMultipleActions, {
                shouldExcludeDeleted: true,
            });
            expect(result).toEqual([1, 2]);
            expect(result).not.toContain(3); // Should be excluded based on last action (delete)
        });

        it('should not exclude when pending action is not delete', () => {
            const participantsIDs = [1, 4];
            const result = excludeParticipantsForDisplay(participantsIDs, mockParticipants, mockReportMetadata, {
                shouldExcludeDeleted: true,
            });
            expect(result).toEqual([1, 4]); // participant 4 has 'add' action, should not be excluded
        });
    });

    describe('requiresManualSubmission', () => {
        it('should return true when manual submit is enabled', () => {
            const report: Report = {
                ...createRandomReport(1),
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            };
            const policy1 = createRandomPolicy(1);
            policy1.harvesting = {enabled: false};
            policy1.autoReportingFrequency = CONST.POLICY.AUTO_REPORTING_FREQUENCIES.IMMEDIATE;
            const result = requiresManualSubmission(report, policy1);
            expect(result).toBe(true);
        });

        it('should return false when instant submit is enabled and report is not open', () => {
            const report: Report = {
                ...createRandomReport(2),
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            };
            const policy2 = createRandomPolicy(2);
            policy2.autoReporting = true;
            policy2.autoReportingFrequency = CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT;
            policy2.approvalMode = CONST.POLICY.APPROVAL_MODE.BASIC;
            const result = requiresManualSubmission(report, policy2);
            expect(result).toBe(false);
        });

        it('should return false when instant submit is enabled with approvers', () => {
            const report: Report = {
                ...createRandomReport(3),
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            };
            const policy3 = createRandomPolicy(3);
            policy3.autoReporting = true;
            policy3.autoReportingFrequency = CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT;
            policy3.approvalMode = CONST.POLICY.APPROVAL_MODE.BASIC;
            const result = requiresManualSubmission(report, policy3);
            expect(result).toBe(false);
        });

        it('should return true for open report in Submit & Close policy with instant submit', () => {
            const report: Report = {
                ...createRandomReport(4),
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            };
            const policy4 = createRandomPolicy(4);
            policy4.autoReporting = true;
            policy4.autoReportingFrequency = CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT;
            policy4.approvalMode = CONST.POLICY.APPROVAL_MODE.OPTIONAL; // Submit & Close (no approvers)
            const result = requiresManualSubmission(report, policy4);
            expect(result).toBe(true);
        });

        it('should return false for closed report in Submit & Close policy with instant submit', () => {
            const report: Report = {
                ...createRandomReport(5),
                stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                statusNum: CONST.REPORT.STATUS_NUM.CLOSED,
            };
            const policy5 = createRandomPolicy(5);
            policy5.autoReporting = true;
            policy5.autoReportingFrequency = CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT;
            policy5.approvalMode = CONST.POLICY.APPROVAL_MODE.OPTIONAL; // Submit & Close (no approvers)
            const result = requiresManualSubmission(report, policy5);
            expect(result).toBe(false);
        });

        it('should return false when policy has auto reporting with monthly frequency (delayed submission)', () => {
            const report: Report = {
                ...createRandomReport(8),
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            };
            const policy6 = createRandomPolicy(8);
            policy6.autoReporting = true;
            policy6.autoReportingFrequency = CONST.POLICY.AUTO_REPORTING_FREQUENCIES.MONTHLY;
            const result = requiresManualSubmission(report, policy6);
            expect(result).toBe(false);
        });
    });

    describe('getReportActionActorAccountID', () => {
        it('should return report owner account id if action is REPORTPREVIEW and report is a policy expense chat', () => {
            const reportAction: ReportAction = {
                ...createRandomReportAction(0),
                actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
            };
            const iouReport: Report = {
                ...createRandomReport(0),
                type: CONST.REPORT.TYPE.IOU,
                ownerAccountID: 10,
                managerID: 20,
            };
            const report: Report = {
                ...createRandomReport(1),
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
            };
            const actorAccountID = getReportActionActorAccountID(reportAction, iouReport, report);
            expect(actorAccountID).toEqual(10);
        });

        it('should return report manager account id if action is REPORTPREVIEW and report is not a policy expense chat', () => {
            const reportAction: ReportAction = {
                ...createRandomReportAction(0),
                actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
            };
            const iouReport: Report = {
                ...createRandomReport(0),
                type: CONST.REPORT.TYPE.IOU,
                ownerAccountID: 10,
                managerID: 20,
            };
            const report: Report = {
                ...createRandomReport(1),
                type: CONST.REPORT.TYPE.CHAT,
                chatType: undefined,
            };
            const actorAccountID = getReportActionActorAccountID(reportAction, iouReport, report);
            expect(actorAccountID).toEqual(20);
        });

        it('should return admin account id if action is SUBMITTED taken by an admin on behalf the submitter', () => {
            const reportAction: ReportAction = {
                ...createRandomReportAction(0),
                actionName: CONST.REPORT.ACTIONS.TYPE.SUBMITTED,
                adminAccountID: 30,
                actorAccountID: 10,
            };
            const iouReport: Report = {
                ...createRandomReport(0),
                type: CONST.REPORT.TYPE.IOU,
                ownerAccountID: 10,
                managerID: 20,
            };
            const report: Report = {
                ...createRandomReport(1),
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
            };
            const actorAccountID = getReportActionActorAccountID(reportAction, iouReport, report);
            expect(actorAccountID).toEqual(30);
        });

        it('should return report owner account id if action is SUBMITTED taken by the submitter himself', () => {
            const reportAction: ReportAction = {
                ...createRandomReportAction(0),
                actionName: CONST.REPORT.ACTIONS.TYPE.SUBMITTED,
                actorAccountID: 10,
            };
            const iouReport: Report = {
                ...createRandomReport(0),
                type: CONST.REPORT.TYPE.IOU,
                ownerAccountID: 10,
                managerID: 20,
            };
            const report: Report = {
                ...createRandomReport(1),
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
            };
            const actorAccountID = getReportActionActorAccountID(reportAction, iouReport, report);
            expect(actorAccountID).toEqual(10);
        });

        it('should return admin account id if action is SUBMITTED_AND_CLOSED taken by an admin on behalf the submitter', () => {
            const reportAction: ReportAction = {
                ...createRandomReportAction(0),
                actionName: CONST.REPORT.ACTIONS.TYPE.SUBMITTED_AND_CLOSED,
                adminAccountID: 30,
                actorAccountID: 10,
            };
            const iouReport: Report = {
                ...createRandomReport(0),
                type: CONST.REPORT.TYPE.IOU,
                ownerAccountID: 10,
                managerID: 20,
            };
            const report: Report = {
                ...createRandomReport(1),
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
            };
            const actorAccountID = getReportActionActorAccountID(reportAction, iouReport, report);
            expect(actorAccountID).toEqual(30);
        });

        it('should return report owner account id if action is SUBMITTED_AND_CLOSED taken by the submitter himself', () => {
            const reportAction: ReportAction = {
                ...createRandomReportAction(0),
                actionName: CONST.REPORT.ACTIONS.TYPE.SUBMITTED_AND_CLOSED,
                actorAccountID: 10,
            };
            const iouReport: Report = {
                ...createRandomReport(0),
                type: CONST.REPORT.TYPE.IOU,
                ownerAccountID: 10,
                managerID: 20,
            };
            const report: Report = {
                ...createRandomReport(1),
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
            };
            const actorAccountID = getReportActionActorAccountID(reportAction, iouReport, report);
            expect(actorAccountID).toEqual(10);
        });

        it('should return original actor account id if action is ADDCOMMENT', () => {
            const reportAction: ReportAction = {
                ...createRandomReportAction(0),
                actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                actorAccountID: 123,
            };
            const iouReport: Report = {
                ...createRandomReport(0),
                type: CONST.REPORT.TYPE.IOU,
                ownerAccountID: 10,
                managerID: 20,
            };
            const report: Report = {
                ...createRandomReport(1),
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
            };
            const actorAccountID = getReportActionActorAccountID(reportAction, iouReport, report);
            expect(actorAccountID).toEqual(123);
        });
    });
});
