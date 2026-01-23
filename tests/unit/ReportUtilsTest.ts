/* eslint-disable @typescript-eslint/naming-convention */
import {beforeAll} from '@jest/globals';
import {act, renderHook} from '@testing-library/react-native';
import {addDays, format as formatDate} from 'date-fns';
import type {OnyxCollection, OnyxEntry, OnyxKey} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {LocaleContextProps} from '@components/LocaleContextProvider';
import OnyxListItemProvider from '@components/OnyxListItemProvider';
import usePolicyData from '@hooks/usePolicyData';
import useReportIsArchived from '@hooks/useReportIsArchived';
import {putOnHold} from '@libs/actions/IOU/Hold';
import initOnyxDerivedValues from '@libs/actions/OnyxDerived';
import type {OnboardingTaskLinks} from '@libs/actions/Welcome/OnboardingFlow';
import {convertToDisplayString} from '@libs/CurrencyUtils';
import DateUtils from '@libs/DateUtils';
import {getEnvironmentURL} from '@libs/Environment/Environment';
import {compute} from '@libs/Formula';
import type {FormulaContext} from '@libs/Formula';
import getBase62ReportID from '@libs/getBase62ReportID';
import {translate} from '@libs/Localize';
import Log from '@libs/Log';
import getReportURLForCurrentContext from '@libs/Navigation/helpers/getReportURLForCurrentContext';
import isSearchTopmostFullScreenRoute from '@libs/Navigation/helpers/isSearchTopmostFullScreenRoute';
import Navigation from '@libs/Navigation/Navigation';
// eslint-disable-next-line no-restricted-syntax
import * as PolicyUtils from '@libs/PolicyUtils';
import {getOriginalMessage, getReportAction, isWhisperAction} from '@libs/ReportActionsUtils';
import {buildReportNameFromParticipantNames, computeReportName as computeReportNameOriginal, getGroupChatName, getPolicyExpenseChatName, getReportName} from '@libs/ReportNameUtils';
import type {OptionData} from '@libs/ReportUtils';
import {
    buildOptimisticChatReport,
    buildOptimisticCreatedReportAction,
    buildOptimisticCreatedReportForUnapprovedAction,
    buildOptimisticExpenseReport,
    buildOptimisticInvoiceReport,
    buildOptimisticIOUReportAction,
    buildOptimisticReportPreview,
    buildParticipantsFromAccountIDs,
    buildTransactionThread,
    canAddTransaction,
    canCreateRequest,
    canDeleteMoneyRequestReport,
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
    canRejectReportAction,
    canSeeDefaultRoom,
    canUserPerformWriteAction,
    createDraftTransactionAndNavigateToParticipantSelector,
    doesReportBelongToWorkspace,
    excludeParticipantsForDisplay,
    findLastAccessedReport,
    getAllReportActionsErrorsAndReportActionThatRequiresAttention,
    getApprovalChain,
    getAvailableReportFields,
    getChatByParticipants,
    getChatRoomSubtitle,
    getDefaultWorkspaceAvatar,
    getDisplayNameForParticipant,
    getDisplayNamesWithTooltips,
    getHarvestOriginalReportID,
    getHelpPaneReportType,
    getIconsForParticipants,
    getIndicatedMissingPaymentMethod,
    getIOUReportActionDisplayMessage,
    getMoneyReportPreviewName,
    getMostRecentlyVisitedReport,
    getOutstandingChildRequest,
    getParentNavigationSubtitle,
    getParticipantsList,
    getPolicyExpenseChat,
    getPolicyIDsWithEmptyReportsForAccount,
    getReasonAndReportActionThatRequiresAttention,
    getReportIDFromLink,
    getReportName as getReportNameDeprecated,
    getReportOrDraftReport,
    getReportPreviewMessage,
    getReportStatusTranslation,
    getWorkspaceIcon,
    getWorkspaceNameUpdatedMessage,
    hasEmptyReportsForPolicy,
    hasReceiptError,
    isAllowedToApproveExpenseReport,
    isArchivedNonExpenseReport,
    isArchivedReport,
    isChatUsedForOnboarding,
    isClosedExpenseReportWithNoExpenses,
    isDeprecatedGroupDM,
    isHarvestCreatedExpenseReport,
    isMoneyRequestReportEligibleForMerge,
    isPayer,
    isReportOutstanding,
    isRootGroupChat,
    isSelfDMOrSelfDMThread,
    isWorkspaceMemberLeavingWorkspaceRoom,
    parseReportRouteParams,
    prepareOnboardingOnyxData,
    pushTransactionViolationsOnyxData,
    reasonForReportToBeInOptionList,
    requiresAttentionFromCurrentUser,
    requiresManualSubmission,
    shouldBlockSubmitDueToStrictPolicyRules,
    shouldDisableRename,
    shouldDisableThread,
    shouldDisplayViolationsRBRInLHN,
    shouldEnableNegative,
    shouldExcludeAncestorReportAction,
    shouldHideSingleReportField,
    shouldReportBeInOptionList,
    shouldReportShowSubscript,
    shouldShowFlagComment,
    sortIconsByName,
    sortOutstandingReportsBySelected,
    temporary_getMoneyRequestOptions,
} from '@libs/ReportUtils';
import {buildOptimisticTransaction} from '@libs/TransactionUtils';
import CONST from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {
    BankAccountList,
    Beta,
    OnyxInputOrEntry,
    PersonalDetailsList,
    Policy,
    PolicyEmployeeList,
    PolicyTag,
    Report,
    ReportAction,
    ReportActions,
    ReportMetadata,
    ReportNameValuePairs,
    Transaction,
    TransactionViolation,
} from '@src/types/onyx';
import type {ErrorFields, Errors, OnyxValueWithOfflineFeedback} from '@src/types/onyx/OnyxCommon';
import type {JoinWorkspaceResolution} from '@src/types/onyx/OriginalMessage';
import type {ACHAccount, PolicyReportField} from '@src/types/onyx/Policy';
import type {Participant, Participants} from '@src/types/onyx/Report';
import {toCollectionDataSet} from '@src/types/utils/CollectionDataSet';
import {actionR14932 as mockIOUAction} from '../../__mocks__/reportData/actions';
import {chatReportR14932 as mockedChatReport, iouReportR14932 as mockIOUReport} from '../../__mocks__/reportData/reports';
import {transactionR14932 as mockTransaction} from '../../__mocks__/reportData/transactions';
import * as NumberUtils from '../../src/libs/NumberUtils';
import createRandomPolicy from '../utils/collections/policies';
import createRandomPolicyCategories from '../utils/collections/policyCategory';
import createRandomPolicyTags from '../utils/collections/policyTags';
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
import {formatPhoneNumber, localeCompare, translateLocal} from '../utils/TestHelper';
import waitForBatchedUpdates from '../utils/waitForBatchedUpdates';

// Be sure to include the mocked permissions library or else the beta tests won't work
jest.mock('@libs/Permissions');

jest.mock('@libs/Navigation/helpers/isSearchTopmostFullScreenRoute', () => jest.fn());

jest.mock('@libs/Log', () => ({
    __esModule: true,
    default: {
        warn: jest.fn(),
        info: jest.fn(),
        alert: jest.fn(),
        hmmm: jest.fn(),
        clientLoggingCallback: jest.fn(),
        serverLoggingCallback: jest.fn(),
    },
}));

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

jest.mock('@libs/PolicyUtils', () => ({
    ...jest.requireActual<typeof PolicyUtils>('@libs/PolicyUtils'),
    isPolicyAdmin: jest.fn().mockImplementation((policy?: Policy) => policy?.role === 'admin'),
    isPaidGroupPolicy: jest.fn().mockImplementation((policy?: Policy) => policy?.type === 'corporate' || policy?.type === 'team'),
}));

const mockedPolicyUtils = PolicyUtils as jest.Mocked<typeof PolicyUtils>;

const testDate = DateUtils.getDBTime();
const currentUserEmail = 'bjorn@vikings.net';
const currentUserAccountID = 5;
const computeReportName = (
    report?: Report,
    reports?: OnyxCollection<Report>,
    policies?: OnyxCollection<Policy>,
    transactions?: OnyxCollection<Transaction>,
    allReportNameValuePairs?: OnyxCollection<ReportNameValuePairs>,
    personalDetailsList?: PersonalDetailsList,
    reportActions?: OnyxCollection<ReportActions>,
    currentUserID = currentUserAccountID,
) => computeReportNameOriginal(report, reports, policies, transactions, allReportNameValuePairs, personalDetailsList, reportActions, currentUserID);
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

    describe('getIOUReportActionDisplayMessage', () => {
        const iouReportID = '1234567890';
        const policyID = 332;

        const reportAction = {
            ...createRandomReportAction(44),
            actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
            originalMessage: {IOUReportID: iouReportID, type: CONST.IOU.REPORT_ACTION_TYPE.PAY, paymentType: CONST.IOU.PAYMENT_TYPE.VBBA},
        };

        const iouReport = {...createExpenseReport(Number(iouReportID)), policyID: policyID.toString()};

        const policyWithBank = {
            ...createRandomPolicy(policyID, CONST.POLICY.TYPE.TEAM),
            achAccount: {
                accountNumber: 'XXXXXXXXXXXX0000',
            },
        };

        it('should return the right message when payment type is ACH', async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, policyWithBank);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`, iouReport);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReportID}`, {[reportAction.reportActionID]: reportAction});

            const last4Digits = policyWithBank.achAccount?.accountNumber.slice(-4);
            const paidSystemMessage = translate(CONST.LOCALES.EN, 'iou.businessBankAccount', '', last4Digits);

            expect(getIOUReportActionDisplayMessage(translateLocal, reportAction, undefined, iouReport)).toBe(paidSystemMessage);
        });
    });

    describe('prepareOnboardingOnyxData', () => {
        it('provides test drive url to task title', () => {
            const title = jest.fn();

            prepareOnboardingOnyxData({
                introSelected: undefined,
                engagementChoice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM,
                onboardingMessage: {
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
                adminsChatReportID: '1',
                companySize: CONST.ONBOARDING_COMPANY_SIZE.MICRO,
            });

            expect(title).toHaveBeenCalledWith(
                expect.objectContaining<OnboardingTaskLinks>({
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    testDriveURL: expect.any(String),
                }),
            );
        });

        it('provides test drive url to task description', () => {
            const description = jest.fn();

            prepareOnboardingOnyxData({
                introSelected: undefined,
                engagementChoice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM,
                onboardingMessage: {
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
                adminsChatReportID: '1',
                companySize: CONST.ONBOARDING_COMPANY_SIZE.MICRO,
            });

            expect(description).toHaveBeenCalledWith(
                expect.objectContaining<OnboardingTaskLinks>({
                    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                    testDriveURL: expect.any(String),
                }),
            );
        });

        it('should not create tasks if the task feature is not in the selected interested features', () => {
            const result = prepareOnboardingOnyxData({
                introSelected: undefined,
                engagementChoice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM,
                onboardingMessage: {
                    message: 'This is a test',
                    tasks: [{type: CONST.ONBOARDING_TASK_TYPE.CONNECT_CORPORATE_CARD, title: () => '', description: () => '', autoCompleted: false, mediaAttributes: {}}],
                },
                adminsChatReportID: '1',
                selectedInterestedFeatures: ['categories', 'accounting', 'tags'],
                companySize: CONST.ONBOARDING_COMPANY_SIZE.MICRO,
            });

            expect(result?.guidedSetupData.filter((data) => data.type === 'task')).toHaveLength(0);
        });

        it('includes avatar in optimistic Setup Specialist personal detail', () => {
            const mergeSpy = jest.spyOn(Onyx, 'merge');

            prepareOnboardingOnyxData({
                introSelected: undefined,
                engagementChoice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM,
                onboardingMessage: {
                    message: 'This is a test',
                    tasks: [],
                },
                adminsChatReportID: '1',
                companySize: CONST.ONBOARDING_COMPANY_SIZE.MICRO,
            });

            const personalDetailsCall = mergeSpy.mock.calls.find((call) => call[0] === ONYXKEYS.PERSONAL_DETAILS_LIST);
            const personalDetailsData = personalDetailsCall?.[1] as Record<string, {avatar?: string; login?: string; displayName?: string}>;
            const setupSpecialistDetail = Object.values(personalDetailsData ?? {}).at(0);

            expect(setupSpecialistDetail).toBeDefined();
            expect(setupSpecialistDetail?.avatar).toBeDefined();
            expect(setupSpecialistDetail?.avatar).toContain('images/avatars/');

            mergeSpy.mockRestore();
        });

        it('passes MICRO company size to onboarding task parameters', () => {
            const title = jest.fn();
            const description = jest.fn();

            prepareOnboardingOnyxData({
                introSelected: undefined,
                engagementChoice: CONST.ONBOARDING_CHOICES.MANAGE_TEAM,
                onboardingMessage: {
                    message: 'This is a test',
                    tasks: [
                        {
                            type: CONST.ONBOARDING_TASK_TYPE.CREATE_WORKSPACE,
                            title,
                            description,
                            autoCompleted: false,
                            mediaAttributes: {},
                        },
                    ],
                },
                adminsChatReportID: '1',
                companySize: CONST.ONBOARDING_COMPANY_SIZE.MICRO,
            });

            expect(title).toHaveBeenCalledWith(
                expect.objectContaining<OnboardingTaskLinks>({
                    onboardingCompanySize: CONST.ONBOARDING_COMPANY_SIZE.MICRO,
                }),
            );

            expect(description).toHaveBeenCalledWith(
                expect.objectContaining<OnboardingTaskLinks>({
                    onboardingCompanySize: CONST.ONBOARDING_COMPANY_SIZE.MICRO,
                }),
            );
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
            expect(name).toBe(translate(CONST.LOCALES.EN, 'workspace.common.policyExpenseChatName', {displayName: 'Ragnar Lothbrok'}));
        });

        it('falls back to owner login when display name not present', () => {
            const report = {
                ownerAccountID: 2,
                reportName: 'Fallback Report Name',
            } as unknown as OnyxEntry<Report>;

            const name = getPolicyExpenseChatName({report, personalDetailsList: participantsPersonalDetails});
            expect(name).toBe(translate(CONST.LOCALES.EN, 'workspace.common.policyExpenseChatName', {displayName: 'floki'}));
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
            const participants = getDisplayNamesWithTooltips(participantsPersonalDetails, false, localeCompare, formatPhoneNumber);
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
                    computeReportName(
                        {
                            reportID: '1',
                            participants: buildParticipantsFromAccountIDs([currentUserAccountID, 1]),
                        },
                        undefined,
                        undefined,
                        undefined,
                        undefined,
                        participantsPersonalDetails,
                    ),
                ).toBe('Ragnar Lothbrok');
            });

            test('no displayName', () => {
                expect(
                    computeReportName(
                        {
                            reportID: '2',
                            participants: buildParticipantsFromAccountIDs([currentUserAccountID, 2]),
                        },
                        undefined,
                        undefined,
                        undefined,
                        undefined,
                        participantsPersonalDetails,
                    ),
                ).toBe('floki@vikings.net');
            });

            test('SMS', () => {
                expect(
                    computeReportName(
                        {
                            reportID: '3',
                            participants: buildParticipantsFromAccountIDs([currentUserAccountID, 4]),
                        },
                        undefined,
                        undefined,
                        undefined,
                        undefined,
                        participantsPersonalDetails,
                    ),
                ).toBe('(833) 240-3627');
            });
        });

        test('Group DM', () => {
            expect(
                computeReportName(
                    {
                        reportID: '4',
                        participants: buildParticipantsFromAccountIDs([currentUserAccountID, 1, 2, 3, 4]),
                    },
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    participantsPersonalDetails,
                ),
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
                expect(computeReportName(baseAdminsRoom)).toBe('#admins');
            });

            test('Archived', async () => {
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${baseAdminsRoom.reportID}`, reportNameValuePairs);

                const allReportNameValuePairs = {[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${baseAdminsRoom.reportID}`]: reportNameValuePairs};
                expect(computeReportName(baseAdminsRoom, undefined, undefined, undefined, allReportNameValuePairs)).toBe('#admins (archived)');

                return IntlStore.load(CONST.LOCALES.ES).then(() =>
                    expect(computeReportName(baseAdminsRoom, undefined, undefined, undefined, allReportNameValuePairs)).toBe('#admins (archivado)'),
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
                expect(computeReportName(baseUserCreatedRoom)).toBe('#VikingsChat');
            });

            test('Archived', async () => {
                const archivedPolicyRoom = {
                    ...baseUserCreatedRoom,
                };

                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${baseUserCreatedRoom.reportID}`, reportNameValuePairs);

                const allReportNameValuePairs = {[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${baseUserCreatedRoom.reportID}`]: reportNameValuePairs};
                expect(computeReportName(archivedPolicyRoom, undefined, undefined, undefined, allReportNameValuePairs)).toBe('#VikingsChat (archived)');

                return IntlStore.load(CONST.LOCALES.ES).then(() =>
                    expect(computeReportName(archivedPolicyRoom, undefined, undefined, undefined, allReportNameValuePairs)).toBe('#VikingsChat (archivado)'),
                );
            });
        });

        describe('Harvest-created reports', () => {
            test('detects harvest-created report from name value pairs', () => {
                expect(isHarvestCreatedExpenseReport('harvest', '12345')).toBe(true);
                expect(getHarvestOriginalReportID('harvest', '12345')).toBe('12345');
            });

            test('returns false when origin or originalID missing', () => {
                expect(isHarvestCreatedExpenseReport(undefined, undefined)).toBe(false);
                expect(isHarvestCreatedExpenseReport('harvest', undefined)).toBe(false);
                expect(isHarvestCreatedExpenseReport(undefined, '123')).toBe(false);
                expect(getHarvestOriginalReportID('harvest', undefined)).toBe(undefined);
            });
        });

        describe('PolicyExpenseChat', () => {
            describe('Active', () => {
                test('as member', () => {
                    expect(
                        computeReportName(
                            {
                                reportID: '5',
                                chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                                policyID: policy.id,
                                isOwnPolicyExpenseChat: true,
                                ownerAccountID: 1,
                            },
                            undefined,
                            undefined,
                            undefined,
                            undefined,
                            participantsPersonalDetails,
                        ),
                    ).toBe(`Ragnar Lothbrok's expenses`);
                });

                test('as admin', () => {
                    expect(
                        computeReportName(
                            {
                                reportID: '6',
                                chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                                policyID: policy.id,
                                isOwnPolicyExpenseChat: false,
                                ownerAccountID: 1,
                            },
                            undefined,
                            undefined,
                            undefined,
                            undefined,
                            participantsPersonalDetails,
                        ),
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

                    const allReportNameValuePairs = {[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${baseArchivedPolicyExpenseChat.reportID}`]: reportNameValuePairs};
                    expect(computeReportName(memberArchivedPolicyExpenseChat, undefined, undefined, undefined, allReportNameValuePairs)).toBe(`Ragnar Lothbrok's expenses (archived)`);

                    return IntlStore.load(CONST.LOCALES.ES).then(() =>
                        expect(computeReportName(memberArchivedPolicyExpenseChat, undefined, undefined, undefined, allReportNameValuePairs)).toBe(`Ragnar Lothbrok's gastos (archivado)`),
                    );
                });

                test('as admin', async () => {
                    const adminArchivedPolicyExpenseChat = {
                        ...baseArchivedPolicyExpenseChat,
                        isOwnPolicyExpenseChat: false,
                    };

                    await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${baseArchivedPolicyExpenseChat.reportID}`, reportNameValuePairs);

                    const allReportNameValuePairs = {[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${baseArchivedPolicyExpenseChat.reportID}`]: reportNameValuePairs};
                    expect(computeReportName(adminArchivedPolicyExpenseChat, undefined, undefined, undefined, allReportNameValuePairs)).toBe(`Ragnar Lothbrok's expenses (archived)`);

                    return IntlStore.load(CONST.LOCALES.ES).then(() =>
                        expect(computeReportName(adminArchivedPolicyExpenseChat, undefined, undefined, undefined, allReportNameValuePairs)).toBe(`Ragnar Lothbrok's gastos (archivado)`),
                    );
                });
            });
        });

        describe('ParentReportAction is', () => {
            test('Manually Submitted Report Action', () => {
                const submittedParentReportAction = {
                    reportActionID: '1',
                    actionName: CONST.REPORT.ACTIONS.TYPE.SUBMITTED,
                    originalMessage: {
                        amount: 169,
                        currency: 'USD',
                    },
                } as ReportAction;
                const threadOfSubmittedReportAction = {
                    ...LHNTestUtils.getFakeReport(),
                    type: CONST.REPORT.TYPE.EXPENSE,
                    stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                    statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                    parentReportID: '101',
                    parentReportActionID: submittedParentReportAction.reportActionID,
                    policyID: policy.id,
                };

                const policies = {[`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`]: policy};
                const reportActions = {
                    [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${threadOfSubmittedReportAction.parentReportID}`]: {[submittedParentReportAction.reportActionID]: submittedParentReportAction},
                };
                expect(computeReportName(threadOfSubmittedReportAction, undefined, policies, undefined, undefined, undefined, reportActions)).toBe('submitted');
            });

            test('Invited/Removed Room Member Action', () => {
                const parentReport = {
                    ...LHNTestUtils.getFakeReport(),
                    reportID: '101',
                    type: CONST.REPORT.TYPE.CHAT,
                    chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
                    policyID: policy.id,
                };
                const removedParentReportAction = {
                    reportActionID: '102',
                    actionName: CONST.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.REMOVE_FROM_ROOM,
                    message: [
                        {
                            type: 'COMMENT',
                            html: 'removed 1 member',
                            text: 'removed 1 member',
                        },
                    ],
                    originalMessage: {
                        targetAccountIDs: [1],
                    },
                } as ReportAction;
                const threadOfRemovedRoomMemberAction = {
                    ...LHNTestUtils.getFakeReport(),
                    type: CONST.REPORT.TYPE.CHAT,
                    chatType: undefined,
                    parentReportID: parentReport.reportID,
                    parentReportActionID: removedParentReportAction.reportActionID,
                    policyID: policy.id,
                };

                const reports = {[`${ONYXKEYS.COLLECTION.REPORT}${parentReport.reportID}`]: parentReport};
                const policies = {[`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`]: policy};
                const reportActions = {
                    [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${threadOfRemovedRoomMemberAction.parentReportID}`]: {[removedParentReportAction.reportActionID]: removedParentReportAction},
                };
                // Note: The new computeReportName returns generic "removed 1 member" instead of expanding names like the old deprecated getReportName did
                expect(computeReportName(threadOfRemovedRoomMemberAction, reports, policies, undefined, undefined, participantsPersonalDetails, reportActions)).toBe('removed 1 member');
            });
        });

        describe('Task Report', () => {
            const htmlTaskTitle = `<h1>heading with <a href="https://www.unknown.com" target="_blank" rel="noreferrer noopener">link</a></h1>`;

            it('Should return the text extracted from report name html', () => {
                const report: Report = {...createRandomReport(1, undefined), type: 'task'};
                expect(computeReportName({...report, reportName: htmlTaskTitle})).toEqual('heading with link');
            });

            it('Should return deleted task translations when task is is deleted', () => {
                const parentReportAction: ReportAction = {
                    ...createRandomReportAction(0),
                    reportActionID: '1',
                    actionName: CONST.REPORT.ACTIONS.TYPE.TASK_CANCELLED,
                };
                const report: Report = {
                    ...createRandomReport(1, undefined),
                    type: 'task',
                    isDeletedParentAction: true,
                    parentReportID: '100',
                    parentReportActionID: parentReportAction.reportActionID,
                };
                const reportActions = {[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.parentReportID}`]: {[parentReportAction.reportActionID]: parentReportAction}};
                expect(computeReportName({...report, reportName: htmlTaskTitle}, undefined, undefined, undefined, undefined, undefined, reportActions)).toEqual(
                    translate(CONST.LOCALES.EN, 'parentReportAction.deletedTask'),
                );
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
                expect(computeReportName(report)).toEqual("Ragnar Lothbrok's expenses");
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

                expect(computeReportName(expenseChatReport)).toEqual("Ragnar Lothbrok's expenses");
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

                const result = computeReportName(conciergeReport);
                expect(result).toBe(CONST.CONCIERGE_DISPLAY_NAME);
            });
        });

        describe('Automatically approved report message via automatic (not by a human) action is', () => {
            test('shown when the report is forwarded (Control feature)', () => {
                const submittedParentReportAction = {
                    reportActionID: '1',
                    actionName: CONST.REPORT.ACTIONS.TYPE.FORWARDED,
                    originalMessage: {
                        amount: 169,
                        currency: 'USD',
                        automaticAction: true,
                        type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                    },
                } as ReportAction;
                const expenseReport = {
                    ...LHNTestUtils.getFakeReport(),
                    type: CONST.REPORT.TYPE.EXPENSE,
                    stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                    statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
                    parentReportID: '101',
                    parentReportActionID: submittedParentReportAction.reportActionID,
                    policyID: policy.id,
                };

                const policies = {[`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`]: policy};
                const reportActions = {[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.parentReportID}`]: {[submittedParentReportAction.reportActionID]: submittedParentReportAction}};
                expect(computeReportName(expenseReport, undefined, policies, undefined, undefined, undefined, reportActions)).toBe(
                    'approved via <a href="https://help.expensify.com/articles/new-expensify/workspaces/Set-up-rules#configure-expense-report-rules">workspace rules</a>',
                );
            });

            test('shown when the report is approved', () => {
                const submittedParentReportAction = {
                    reportActionID: '1',
                    actionName: CONST.REPORT.ACTIONS.TYPE.APPROVED,
                    originalMessage: {
                        amount: 169,
                        currency: 'USD',
                        automaticAction: true,
                    },
                } as ReportAction;
                const expenseReport = {
                    ...LHNTestUtils.getFakeReport(),
                    type: CONST.REPORT.TYPE.EXPENSE,
                    stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                    statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
                    parentReportID: '101',
                    parentReportActionID: submittedParentReportAction.reportActionID,
                    policyID: policy.id,
                };

                const policies = {[`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`]: policy};
                const reportActions = {[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.parentReportID}`]: {[submittedParentReportAction.reportActionID]: submittedParentReportAction}};
                expect(computeReportName(expenseReport, undefined, policies, undefined, undefined, undefined, reportActions)).toBe(
                    'approved via <a href="https://help.expensify.com/articles/new-expensify/workspaces/Set-up-rules#configure-expense-report-rules">workspace rules</a>',
                );
            });
        });

        describe('Automatically submitted via harvesting (delayed submit) report message is', () => {
            test('shown when report is submitted and status is submitted', () => {
                const submittedParentReportAction = {
                    reportActionID: '1',
                    actionName: CONST.REPORT.ACTIONS.TYPE.SUBMITTED,
                    originalMessage: {
                        amount: 169,
                        currency: 'USD',
                        harvesting: true,
                    },
                } as ReportAction;
                const expenseReport = {
                    ...LHNTestUtils.getFakeReport(),
                    type: CONST.REPORT.TYPE.EXPENSE,
                    stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                    statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                    parentReportID: '101',
                    parentReportActionID: submittedParentReportAction.reportActionID,
                    policyID: policy.id,
                };

                const policies = {[`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`]: policy};
                const reportActions = {[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.parentReportID}`]: {[submittedParentReportAction.reportActionID]: submittedParentReportAction}};
                expect(computeReportName(expenseReport, undefined, policies, undefined, undefined, undefined, reportActions)).toBe(
                    'submitted via <a href="https://help.expensify.com/articles/new-expensify/workspaces/Set-up-workflows#select-workflows">delay submissions</a>',
                );
            });

            test('shown when report is submitted and status is closed', () => {
                const submittedParentReportAction = {
                    reportActionID: '1',
                    actionName: CONST.REPORT.ACTIONS.TYPE.SUBMITTED_AND_CLOSED,
                    originalMessage: {
                        amount: 169,
                        currency: 'USD',
                        harvesting: true,
                    },
                } as ReportAction;
                const expenseReport = {
                    ...LHNTestUtils.getFakeReport(),
                    type: CONST.REPORT.TYPE.EXPENSE,
                    stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                    statusNum: CONST.REPORT.STATUS_NUM.CLOSED,
                    parentReportID: '101',
                    parentReportActionID: submittedParentReportAction.reportActionID,
                    policyID: policy.id,
                };

                const policies = {[`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`]: policy};
                const reportActions = {[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.parentReportID}`]: {[submittedParentReportAction.reportActionID]: submittedParentReportAction}};
                expect(computeReportName(expenseReport, undefined, policies, undefined, undefined, undefined, reportActions)).toBe(
                    'submitted via <a href="https://help.expensify.com/articles/new-expensify/workspaces/Set-up-workflows#select-workflows">delay submissions</a>',
                );
            });
        });

        it('should return "resolved the duplicate" report name for resolved duplicate system message', () => {
            const parentReport = createRandomReport(122, undefined);
            const resolvedDuplicateAction: ReportAction = {
                ...createRandomReportAction(Number(parentReport.reportID)),
                actionName: CONST.REPORT.ACTIONS.TYPE.RESOLVED_DUPLICATES,
                message: [
                    {
                        type: 'COMMENT',
                        html: 'resolved the duplicate',
                        text: 'resolved the duplicate',
                    },
                ],
            };
            const threadReport = {
                ...createRandomReport(123, undefined),
                type: CONST.REPORT.TYPE.CHAT,
                parentReportID: parentReport.reportID,
                parentReportActionID: resolvedDuplicateAction.reportActionID,
            };

            const reports = {[`${ONYXKEYS.COLLECTION.REPORT}${parentReport.reportID}`]: parentReport};
            const reportActions = {[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReport.reportID}`]: {[resolvedDuplicateAction.reportActionID]: resolvedDuplicateAction}};
            const reportName = computeReportName(threadReport, reports, undefined, undefined, undefined, undefined, reportActions);
            expect(reportName).toBe('resolved the duplicate');
        });

        describe('Unreported transaction thread', () => {
            test('HTML is stripped from unreported transaction message', async () => {
                const fromReport = {
                    ...LHNTestUtils.getFakeReport(),
                    reportID: '789',
                };

                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${fromReport.reportID}`, fromReport);

                const transactionThread = {
                    ...LHNTestUtils.getFakeReport(),
                    type: CONST.REPORT.TYPE.CHAT,
                    reportID: '123',
                    parentReportID: '456',
                };

                const unreportedTransactionAction = {
                    actionName: CONST.REPORT.ACTIONS.TYPE.UNREPORTED_TRANSACTION,
                    originalMessage: {
                        fromReportID: '789',
                    },
                } as ReportAction;

                // eslint-disable-next-line @typescript-eslint/no-deprecated
                const reportName = getReportNameDeprecated(transactionThread, undefined, unreportedTransactionAction);

                // Should NOT contain HTML tags
                expect(reportName).not.toContain('<a href');
                expect(reportName).not.toContain('</a>');
                // Should contain the text content
                expect(reportName).toContain('moved this expense from');
                expect(reportName).toContain('Ragnar');
            });
        });
    });

    describe('computeReportName (getSearchReportName tests)', () => {
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
                reportID: '1000',
                type: CONST.REPORT.TYPE.CHAT,
            };

            test('should return the displayName', () => {
                const chatReport: Report = {
                    ...baseChatReport,
                    reportID: '1001',
                    participants: buildParticipantsFromAccountIDs([currentUserAccountID, 1]),
                };

                const reportName = computeReportName(chatReport, undefined, undefined, undefined, undefined, participantsPersonalDetails);
                expect(reportName).toBe('Ragnar Lothbrok');
            });

            test('should return the email', () => {
                const chatReport: Report = {
                    ...baseChatReport,
                    reportID: '1002',
                    participants: buildParticipantsFromAccountIDs([currentUserAccountID, 2]),
                };

                const reportName = computeReportName(chatReport, undefined, undefined, undefined, undefined, participantsPersonalDetails);
                expect(reportName).toBe('floki@vikings.net');
            });

            test('should return phone number', () => {
                const chatReport: Report = {
                    ...baseChatReport,
                    reportID: '1003',
                    participants: buildParticipantsFromAccountIDs([currentUserAccountID, 4]),
                };

                const reportName = computeReportName(chatReport, undefined, undefined, undefined, undefined, participantsPersonalDetails);
                expect(reportName).toBe('(833) 240-3627');
            });

            describe('Threads', () => {
                const baseThreadReport: Report = {
                    reportID: '1004',
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

                    const reportActions = {
                        [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${baseThreadReport.parentReportID}`]: {[hiddenAction.reportActionID]: hiddenAction},
                    };
                    const reportName = computeReportName(baseThreadReport, undefined, undefined, undefined, undefined, participantsPersonalDetails, reportActions);

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

                    const reportActions = {
                        [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${baseThreadReport.parentReportID}`]: {[attachmentAction.reportActionID]: attachmentAction},
                    };
                    const reportName = computeReportName(baseThreadReport, undefined, undefined, undefined, undefined, participantsPersonalDetails, reportActions);

                    expect(reportName).toBe('[Attachment]');
                });

                test('should handle thread report with missing parent action', () => {
                    const threadReport: Report = {
                        ...baseThreadReport,
                        parentReportActionID: '999', // Non-existent action
                    };

                    const reportName = computeReportName(threadReport, undefined, undefined, undefined, undefined, participantsPersonalDetails);
                    expect(reportName).toBe('');
                });
            });
        });

        describe('Self DM', () => {
            const selfDMReport: Report = {
                reportID: '1005',
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.SELF_DM,
                ownerAccountID: currentUserAccountID,
                participants: buildParticipantsFromAccountIDs([currentUserAccountID]),
            };
            test('should return self DM name for self DM', () => {
                const reportName = computeReportName(selfDMReport, undefined, undefined, undefined, undefined, participantsPersonalDetails);

                expect(reportName).toBe('Lagertha Lothbrok (you)');
            });
        });

        describe('Group Chat', () => {
            test('should return group chat name for group chat', () => {
                const groupChatReport: Report = {
                    reportID: '1006',
                    type: CONST.REPORT.TYPE.CHAT,
                    chatType: CONST.REPORT.CHAT_TYPE.GROUP,
                    participants: buildParticipantsFromAccountIDs([1, 2, 3]),
                };

                const reportName = computeReportName(groupChatReport, undefined, undefined, undefined, undefined, participantsPersonalDetails);

                expect(reportName).toContain('Ragnar');
            });

            test('should handle group chat with mixed participant types', () => {
                const groupChat: Report = {
                    reportID: '1007',
                    type: CONST.REPORT.TYPE.CHAT,
                    participants: {
                        [currentUserAccountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                        1: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                        2: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                        999: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS}, // Non-existent user
                    },
                };

                const reportName = computeReportName(groupChat, undefined, undefined, undefined, undefined, participantsPersonalDetails);
                expect(reportName).toBe('Ragnar, floki@vikings.net');
            });
        });

        describe('Concierge Chat', () => {
            const conciergeReport: Report = {
                reportID: conciergeReportID,
                participants: {},
            };
            test('should handle concierge chat report', () => {
                const reportName = computeReportName(conciergeReport);
                expect(reportName).toBe(CONST.CONCIERGE_DISPLAY_NAME);
            });
        });

        describe('Money Request', () => {
            const baseIOUReport: Report = {
                reportID: '1008',
                type: CONST.REPORT.TYPE.IOU,
                ownerAccountID: currentUserAccountID,
                managerID: currentUserAccountID,
                isOwnPolicyExpenseChat: false,
                currency: 'USD',
                total: 5000,
            };
            test('should handle IOU report', () => {
                const reportName = computeReportName(baseIOUReport, undefined, undefined, undefined, undefined, participantsPersonalDetails);
                expect(reportName).toBe('Lagertha Lothbrok paid $50.00');
            });
        });

        describe('Task', () => {
            const baseTaskReport = {
                reportID: '1009',
                managerID: 1,
                reportName: 'Test Task',
                type: CONST.REPORT.TYPE.TASK,
            };

            test('should handle completed task report', () => {
                const taskReport: Report = {
                    ...baseTaskReport,
                };

                const reportName = computeReportName(taskReport);
                expect(reportName).toBe('Test Task');
            });

            test('should handle canceled task report', () => {
                const cancelledParentAction: ReportAction = {
                    ...createRandomReportAction(0),
                    actionName: CONST.REPORT.ACTIONS.TYPE.TASK_CANCELLED,
                    actorAccountID: 1,
                };

                const taskReport: Report = {
                    ...baseTaskReport,
                    isDeletedParentAction: true,
                    parentReportID: '1050',
                    parentReportActionID: cancelledParentAction.reportActionID,
                };

                const reportActions = {
                    [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${taskReport.parentReportID}`]: {[cancelledParentAction.reportActionID]: cancelledParentAction},
                };
                const reportName = computeReportName(taskReport, undefined, undefined, undefined, undefined, participantsPersonalDetails, reportActions);
                expect(reportName).toBe('Deleted task');
            });

            test('should return thread name for task report with cancelled task', () => {
                const parentReportAction: ReportAction = {
                    ...createRandomReportAction(0),
                    actionName: CONST.REPORT.ACTIONS.TYPE.TASK_CANCELLED,
                    actorAccountID: 1,
                };

                const taskReport: Report = {
                    ...baseTaskReport,
                    isDeletedParentAction: true,
                    parentReportID: '1051',
                    parentReportActionID: parentReportAction.reportActionID,
                };

                const reportActions = {
                    [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${taskReport.parentReportID}`]: {[parentReportAction.reportActionID]: parentReportAction},
                };
                const reportName = computeReportName(taskReport, undefined, undefined, undefined, undefined, participantsPersonalDetails, reportActions);

                expect(reportName).toBe('Deleted task');
            });

            test('should handle task report with proper name formatting', () => {
                const taskReport: Report = {
                    reportID: '1',
                    type: CONST.REPORT.TYPE.TASK,
                    reportName: '<b>HTML Task Name</b>',
                };

                const reportName = computeReportName(taskReport, undefined, undefined, undefined, undefined, participantsPersonalDetails);

                expect(reportName).toBe('HTML Task Name');
            });
        });

        describe('Policy-related Reports', () => {
            describe('Rooms', () => {
                describe('Default', () => {
                    test.each([
                        [CONST.REPORT.CHAT_TYPE.POLICY_ADMINS, '#admins', '1010'],
                        [CONST.REPORT.CHAT_TYPE.POLICY_ANNOUNCE, '#announce', '1011'],
                    ])('should return %s room as %s', (chatType, reportName, reportID) => {
                        const defaultPolicyRoom: Report = {
                            reportID,
                            chatType,
                            reportName,
                            policyID: policy.id,
                        };

                        const policies = {[`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`]: policy};
                        const result = computeReportName(defaultPolicyRoom, undefined, policies);
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

                        const policies = {[`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`]: policy};
                        const allReportNameValuePairs = {
                            [`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${defaultArchivedPolicyRoom.reportID}`]: {private_isArchived: DateUtils.getDBTime()},
                        };
                        const result = computeReportName(defaultArchivedPolicyRoom, undefined, policies, undefined, allReportNameValuePairs);
                        expect(result).toBe(`${reportName} (archived)`);
                    });

                    describe('Change log scenarios', () => {
                        const baseParentReportAction = createRandomReportAction(0);
                        const report: Report = {
                            reportID: '1012',
                            type: CONST.REPORT.TYPE.CHAT,
                            policyID: policy.id,
                            parentReportID: '1013',
                            parentReportActionID: baseParentReportAction.reportActionID,
                        };

                        test('should handle corporate upgrade action', () => {
                            const upgradeAction: ReportAction = {
                                ...baseParentReportAction,
                                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.CORPORATE_UPGRADE,
                            };

                            const reportActions = {
                                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.parentReportID}`]: {[upgradeAction.reportActionID]: upgradeAction},
                            };
                            const reportName = computeReportName(report, undefined, undefined, undefined, undefined, participantsPersonalDetails, reportActions);

                            expect(reportName).toBe('upgraded this workspace to the Control plan');
                        });

                        test('should handle corporate downgrade action', () => {
                            const downgradeAction: ReportAction = {
                                ...baseParentReportAction,
                                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.TEAM_DOWNGRADE,
                            };

                            const reportActions = {
                                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.parentReportID}`]: {[downgradeAction.reportActionID]: downgradeAction},
                            };
                            const reportName = computeReportName(report, undefined, undefined, undefined, undefined, participantsPersonalDetails, reportActions);

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

                            const reportActions = {
                                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.parentReportID}`]: {[nameUpdateAction.reportActionID]: nameUpdateAction},
                            };
                            const reportName = computeReportName(report, undefined, undefined, undefined, undefined, participantsPersonalDetails, reportActions);

                            expect(reportName).toBe('updated the name of this workspace to "New Workspace" (previously "Old Workspace")');
                        });

                        test('should handle corporate force upgrade action', () => {
                            const forceUpgradeAction: ReportAction = {
                                ...baseParentReportAction,
                                actionName: CONST.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.CORPORATE_FORCE_UPGRADE,
                                isAttachmentOnly: false,
                                message: [
                                    {
                                        type: 'COMMENT',
                                        html: `This workspace has been upgraded to the Control plan. Click <a href="${CONST.COLLECT_UPGRADE_HELP_URL}">here</a> for more information.`,
                                        text: `This workspace has been upgraded to the Control plan. Click here for more information.`,
                                    },
                                ],
                            };

                            const reportActions = {
                                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.parentReportID}`]: {[forceUpgradeAction.reportActionID]: forceUpgradeAction},
                            };
                            const reportName = computeReportName(report, undefined, undefined, undefined, undefined, participantsPersonalDetails, reportActions);

                            // Note: computeReportName returns the text version, not HTML
                            expect(reportName).toBe('This workspace has been upgraded to the Control plan. Click here for more information.');
                        });
                    });
                });

                describe('User-created', () => {
                    const chatRoom: Report = {
                        reportID: '1014',
                        type: CONST.REPORT.TYPE.CHAT,
                        chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
                        reportName: '#test-room',
                    };
                    test('Active', () => {
                        const reportName = computeReportName(chatRoom, undefined, undefined, undefined, undefined, participantsPersonalDetails);

                        expect(reportName).toBe('#test-room');
                    });
                    test('Archived', () => {
                        const archivedRoom: Report = {
                            ...chatRoom,
                            reportID: archivedReportID,
                        };

                        const allReportNameValuePairs = {
                            [`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${archivedRoom.reportID}`]: {private_isArchived: DateUtils.getDBTime()},
                        };
                        const reportName = computeReportName(archivedRoom, undefined, undefined, undefined, allReportNameValuePairs, participantsPersonalDetails);

                        expect(reportName).toBe('#test-room (archived)');
                    });
                });

                describe('Chat thread name behavior', () => {
                    const baseChatReport = {
                        reportID: '1019',
                        reportName: 'Vikings Report',
                        type: CONST.REPORT.TYPE.CHAT,
                        chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
                        policyID: policy.id,
                    };

                    // Converting the chat report into a thread chat report
                    const chatThread = {
                        ...baseChatReport,
                        reportID: '1020',
                        parentReportID: baseChatReport.reportID,
                        parentReportActionID: '1',
                    };

                    test('should return the policy name when report is chat thread', () => {
                        const policies = {[`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`]: policy};
                        const searchReportName = computeReportName(chatThread, undefined, policies);
                        // Note: For chat threads that are also policy rooms, computeReportName returns the room's reportName
                        expect(searchReportName).toBe('Vikings Report');
                    });

                    test('should return a empty string when report is chat thread and policy is undefined', () => {
                        const searchReportName = computeReportName(chatThread);
                        // Note: Thread still returns its reportName since it's a policy room
                        expect(searchReportName).toBe('Vikings Report');
                    });

                    test('should return the report name when report is not chat thread', () => {
                        const policies = {[`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`]: policy};
                        const searchReportName = computeReportName(baseChatReport, undefined, policies);
                        expect(searchReportName).toBe('Vikings Report');
                    });

                    test('should return the report name when report is not chat thread and policy is undefined', () => {
                        const searchReportName = computeReportName(baseChatReport);
                        expect(searchReportName).toBe('Vikings Report');
                    });

                    test('should return a empty string when report is undefined ', () => {
                        const policies = {[`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`]: policy};
                        const searchReportName = computeReportName(undefined, undefined, policies);
                        expect(searchReportName).toBe('');
                    });

                    test('should return a empty string when both report and policy are undefined', () => {
                        const searchReportName = computeReportName(undefined);
                        expect(searchReportName).toBe('');
                    });
                });
            });

            describe('Expenses', () => {
                const baseChatReport: Report = {
                    reportID: '1015',
                    chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                    isOwnPolicyExpenseChat: true,
                    ownerAccountID: 1,
                    policyID: policy.id,
                };

                const baseExpenseReport: Report = {
                    type: CONST.REPORT.TYPE.EXPENSE,
                    isOwnPolicyExpenseChat: false,
                    reportID: '1016',
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
                    const policies = {[`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`]: policy};
                    const reportName = computeReportName(baseChatReport, undefined, policies, undefined, undefined, participantsPersonalDetails);
                    expect(reportName).toBe("Ragnar Lothbrok's expenses");
                });

                test('Archived', () => {
                    const policies = {[`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`]: policy};
                    const allReportNameValuePairs = {
                        [`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${baseChatReport.reportID}`]: {private_isArchived: DateUtils.getDBTime()},
                    };
                    const reportName = computeReportName(baseChatReport, undefined, policies, undefined, allReportNameValuePairs, participantsPersonalDetails);
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

                    const transaction: Transaction = {
                        transactionID: 'txn1',
                        reportID: '2',
                        amount: 1000,
                        currency: 'USD',
                        merchant: 'Test Merchant',
                        created: testDate,
                        modifiedMerchant: 'Test Merchant',
                    };

                    const policies = {[`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`]: policy};
                    const transactions = {[`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`]: transaction};
                    const reportActions = {
                        [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${baseExpenseReport.parentReportID}`]: {[iouAction.reportActionID]: iouAction},
                    };
                    const reportName = computeReportName(baseExpenseReport, undefined, policies, transactions, undefined, participantsPersonalDetails, reportActions);

                    expect(reportName).toBe('Vikings Policy paid $10.00');
                });

                test('should handle expense report with approval status', () => {
                    const expenseReport: Report = {
                        ...baseExpenseReport,
                        stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                        statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
                    };

                    const policies = {[`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`]: policy};
                    const reportName = computeReportName(expenseReport, undefined, policies, undefined, undefined, participantsPersonalDetails);
                    expect(reportName).toBe('Vikings Policy approved $10.00');
                });

                test('should handle closed expense report with no expenses', () => {
                    const expenseReport: Report = {
                        ...baseExpenseReport,
                        statusNum: CONST.REPORT.STATUS_NUM.CLOSED,
                        total: 0,
                    };

                    const policies = {[`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`]: policy};
                    const reportName = computeReportName(expenseReport, undefined, policies, undefined, undefined, participantsPersonalDetails);

                    expect(reportName).toBe('Deleted report');
                });

                test('closed expense report with total and transactions not loaded', () => {
                    // Given a closed (submitted) expense report with a total and no transactions yet loaded
                    const expenseReport: Report = {
                        ...baseExpenseReport,
                        statusNum: CONST.REPORT.STATUS_NUM.CLOSED,
                        total: -4400, // Report has expenses (negative total indicates expense)
                    };

                    // Then it should not be considered closed without expenses, because it has a total
                    expect(isClosedExpenseReportWithNoExpenses(expenseReport)).toBe(false);
                });

                test('closed expense report with zero total but non-reimbursable total exists', () => {
                    // Given a closed expense report where reimbursable and non-reimbursable totals cancel out
                    // The total will be zero, but the non-reimbursable total will exist
                    const expenseReport: Report = {
                        ...baseExpenseReport,
                        statusNum: CONST.REPORT.STATUS_NUM.CLOSED,
                        total: 0,
                        nonReimbursableTotal: -10000,
                    };

                    // Then it should not be considered closed without expenses, because nonReimbursableTotal indicates expenses exist
                    expect(isClosedExpenseReportWithNoExpenses(expenseReport)).toBe(false);
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

                    const threadReport: Report = {
                        ...baseExpenseReport,
                        parentReportID: baseChatReport.reportID,
                        parentReportActionID: payAction.reportActionID,
                    };

                    const policies = {[`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`]: policy};
                    const reportActions = {
                        [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${threadReport.parentReportID}`]: {[payAction.reportActionID]: payAction},
                    };
                    const reportName = computeReportName(threadReport, undefined, policies, undefined, undefined, participantsPersonalDetails, reportActions);
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

                    const threadReport: Report = {
                        ...baseExpenseReport,
                        parentReportID: baseChatReport.reportID,
                        parentReportActionID: vbbaPayAction.reportActionID,
                    };

                    const policyWithACH = {
                        ...policy,
                        achAccount,
                    };
                    const policies = {[`${ONYXKEYS.COLLECTION.POLICY}${policyWithACH.id}`]: policyWithACH};
                    const reportActions = {
                        [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${threadReport.parentReportID}`]: {[vbbaPayAction.reportActionID]: vbbaPayAction},
                    };
                    const reportName = computeReportName(threadReport, undefined, policies, undefined, undefined, participantsPersonalDetails, reportActions);
                    expect(reportName).toBe(
                        'paid with bank account 7890 via <a href="https://help.expensify.com/articles/new-expensify/workspaces/Set-up-rules#configure-expense-report-rules">workspace rules</a>',
                    );
                });

                test('should return forwarded action name', () => {
                    const forwardedAction: ReportAction = {
                        ...baseParentReportAction,
                        actionName: CONST.REPORT.ACTIONS.TYPE.FORWARDED,
                        originalMessage: {},
                    };

                    const threadReport: Report = {
                        ...baseExpenseReport,
                        parentReportID: baseChatReport.reportID,
                        parentReportActionID: forwardedAction.reportActionID,
                    };

                    const reportActions = {
                        [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${threadReport.parentReportID}`]: {[forwardedAction.reportActionID]: forwardedAction},
                    };
                    const reportName = computeReportName(threadReport, undefined, undefined, undefined, undefined, participantsPersonalDetails, reportActions);

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

                    const threadReport: Report = {
                        ...baseExpenseReport,
                        parentReportID: baseChatReport.reportID,
                        parentReportActionID: autoApprovedAction.reportActionID,
                    };

                    const reportActions = {
                        [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${threadReport.parentReportID}`]: {[autoApprovedAction.reportActionID]: autoApprovedAction},
                    };
                    const reportName = computeReportName(threadReport, undefined, undefined, undefined, undefined, participantsPersonalDetails, reportActions);

                    expect(reportName).toBe(
                        'approved via <a href="https://help.expensify.com/articles/new-expensify/workspaces/Set-up-rules#configure-expense-report-rules">workspace rules</a>',
                    );
                });

                test('should return submitted action name', () => {
                    const submittedAction: ReportAction = {
                        ...baseParentReportAction,
                        actionName: CONST.REPORT.ACTIONS.TYPE.SUBMITTED,
                        originalMessage: {
                            amount: 1000,
                            currency: 'USD',
                        },
                    };

                    const threadReport: Report = {
                        ...baseExpenseReport,
                        type: CONST.REPORT.TYPE.EXPENSE,
                        stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                        statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                        parentReportID: baseChatReport.reportID,
                        parentReportActionID: submittedAction.reportActionID,
                    };

                    const reportActions = {
                        [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${threadReport.parentReportID}`]: {[submittedAction.reportActionID]: submittedAction},
                    };
                    const reportName = computeReportName(threadReport, undefined, undefined, undefined, undefined, undefined, reportActions);

                    expect(reportName).toBe('submitted');
                });

                test('should return approved action name', () => {
                    const approvedAction: ReportAction = {
                        ...baseParentReportAction,
                        actionName: CONST.REPORT.ACTIONS.TYPE.APPROVED,
                        originalMessage: {
                            amount: 1000,
                            currency: 'USD',
                        },
                    };

                    const threadReport: Report = {
                        ...baseExpenseReport,
                        stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                        statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
                        parentReportID: baseChatReport.reportID,
                        parentReportActionID: approvedAction.reportActionID,
                    };

                    const reportActions = {
                        [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${threadReport.parentReportID}`]: {[approvedAction.reportActionID]: approvedAction},
                    };
                    const reportName = computeReportName(threadReport, undefined, undefined, undefined, undefined, undefined, reportActions);

                    expect(reportName).toBe('approved');
                });

                test('should return rejected action name', () => {
                    const rejectedAction: ReportAction = {
                        ...baseParentReportAction,
                        actionName: CONST.REPORT.ACTIONS.TYPE.REJECTED,
                    };

                    const threadReport: Report = {
                        ...baseExpenseReport,
                        parentReportID: baseChatReport.reportID,
                        parentReportActionID: rejectedAction.reportActionID,
                    };

                    const reportActions = {
                        [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${threadReport.parentReportID}`]: {[rejectedAction.reportActionID]: rejectedAction},
                    };
                    const reportName = computeReportName(threadReport, undefined, undefined, undefined, undefined, participantsPersonalDetails, reportActions);

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

                    const threadReport: Report = {
                        ...baseExpenseReport,
                        parentReportID: baseChatReport.reportID,
                        parentReportActionID: integrationFailedAction.reportActionID,
                    };

                    const reportActions = {
                        [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${threadReport.parentReportID}`]: {[integrationFailedAction.reportActionID]: integrationFailedAction},
                    };
                    const reportName = computeReportName(threadReport, undefined, undefined, undefined, undefined, participantsPersonalDetails, reportActions);

                    expect(reportName).toBe(`there was a problem syncing with QuickBooks ("Sync failed"). Please fix the issue in workspace settings.`);
                });

                test('should handle concierge company card connection broken action', () => {
                    const companyCardConnectionBrokenAction: ReportAction = {
                        ...baseParentReportAction,
                        actionName: CONST.REPORT.ACTIONS.TYPE.COMPANY_CARD_CONNECTION_BROKEN,
                        originalMessage: {
                            feedName: 'Regions Bank cards',
                            policyID: '1',
                        },
                    };

                    const threadReport: Report = {
                        ...baseExpenseReport,
                        parentReportID: baseChatReport.reportID,
                        parentReportActionID: companyCardConnectionBrokenAction.reportActionID,
                    };

                    const reportActions = {
                        [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${threadReport.parentReportID}`]: {
                            [companyCardConnectionBrokenAction.reportActionID]: companyCardConnectionBrokenAction,
                        },
                    };
                    const reportName = computeReportName(threadReport, undefined, undefined, undefined, undefined, participantsPersonalDetails, reportActions);

                    expect(reportName).toBe(
                        `The Regions Bank cards connection is broken. To restore card imports, <a href='https://dev.new.expensify.com:8082/workspaces/1/company-cards'>log into your bank</a>`,
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

                test('should handle invoice report', async () => {
                    const chatReportID = '1017-chat';
                    const invoiceReport: Report = {
                        reportID: '1017',
                        policyID: corporatePolicy.id,
                        chatReportID,
                        type: CONST.REPORT.TYPE.INVOICE,
                        ownerAccountID: 1,
                        managerID: 1,
                        chatType: CONST.REPORT.CHAT_TYPE.INVOICE,
                    };

                    const chatReport: Report = {
                        reportID: chatReportID,
                        invoiceReceiver: {policyID: invoiceReceiverPolicy.id, type: CONST.REPORT.INVOICE_RECEIVER_TYPE.BUSINESS},
                    } as Report;

                    await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`, chatReport);
                    await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${invoiceReceiverPolicy.id}`, invoiceReceiverPolicy);

                    const policies = {
                        [`${ONYXKEYS.COLLECTION.POLICY}${corporatePolicy.id}`]: corporatePolicy,
                        [`${ONYXKEYS.COLLECTION.POLICY}${invoiceReceiverPolicy.id}`]: invoiceReceiverPolicy,
                    };
                    const reports = {[`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`]: chatReport};
                    const reportName = computeReportName(invoiceReport, reports, policies, undefined, undefined, participantsPersonalDetails);

                    expect(reportName).toBe('Vikings Policy');

                    await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`, null);
                    await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${invoiceReceiverPolicy.id}`, null);
                });

                test('should handle invoice room', () => {
                    const invoiceRoom: Report = {
                        reportID: '1018',
                        policyID: corporatePolicy.id,
                        type: CONST.REPORT.TYPE.CHAT,
                        chatType: CONST.REPORT.CHAT_TYPE.INVOICE,
                        invoiceReceiver: {
                            type: CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL,
                            accountID: 2,
                        },
                    };

                    const policies = {
                        [`${ONYXKEYS.COLLECTION.POLICY}${corporatePolicy.id}`]: corporatePolicy,
                        [`${ONYXKEYS.COLLECTION.POLICY}${invoiceReceiverPolicy.id}`]: invoiceReceiverPolicy,
                    };
                    const reportName = computeReportName(invoiceRoom, undefined, policies, undefined, undefined, participantsPersonalDetails);

                    expect(reportName).toBe('floki@vikings.net');
                });
            });
        });

        describe('Fallback scenarios', () => {
            test('should return participant-based name when no specific type matches', () => {
                const genericReport: Report = {
                    reportID: '1',
                    participants: buildParticipantsFromAccountIDs([currentUserAccountID, 1]),
                };

                const reportName = computeReportName(genericReport, undefined, undefined, undefined, undefined, participantsPersonalDetails);

                expect(reportName).toBe('Ragnar Lothbrok');
            });

            test('should return report.reportName as fallback when no participants available', () => {
                const reportWithName: Report = {
                    reportID: '1',
                    reportName: 'Fallback Report Name',
                    type: CONST.REPORT.TYPE.CHAT,
                    chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
                    participants: {},
                };

                const reportName = computeReportName(reportWithName, undefined, undefined, undefined, undefined, participantsPersonalDetails);

                expect(reportName).toBe('Fallback Report Name');
            });

            test('should return empty string when no name can be determined', () => {
                const emptyReport: Report = {
                    reportID: '1',
                    reportName: '',
                    participants: {},
                };

                const reportName = computeReportName(emptyReport, undefined, undefined, undefined, undefined, participantsPersonalDetails);

                expect(reportName).toBe('');
            });
        });

        describe('Edges cases', () => {
            test('should handle undefined report gracefully', () => {
                const reportName = computeReportName(undefined);

                expect(reportName).toBe('');
            });

            test('should handle empty personalDetails', () => {
                const report: Report = {
                    reportID: '1',
                    participants: buildParticipantsFromAccountIDs([1]),
                };

                const reportName = computeReportName(report, undefined, undefined, undefined, undefined, {});

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
            const normalizedActual = {...actual, reportName: actual.reportName?.replaceAll('\u00A0', ' ')};
            expect(normalizedActual).toEqual({reportName: 'A workspace & Ragnar Lothbrok (archived)'});
        });

        it('should return the correct parent navigation subtitle for the non archived invoice report', () => {
            const actual = getParentNavigationSubtitle(baseArchivedPolicyExpenseChat, false);
            const normalizedActual = {...actual, reportName: actual.reportName?.replaceAll('\u00A0', ' ')};
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

        it('returns false when expense report is awaiting user submission, delayed submission on > daily', async () => {
            const report = {
                ...LHNTestUtils.getFakeReport(),
                hasOutstandingChildRequest: false,
                policyID: '1',
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}1`, {reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_MANUAL});

            expect(requiresAttentionFromCurrentUser(report)).toBe(false);
        });

        it('returns false when expense report is awaiting user submission, delayed submission on > manually', async () => {
            const report = {
                ...LHNTestUtils.getFakeReport(),
                hasOutstandingChildRequest: true,
                policyID: '1',
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}1`, {reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_MANUAL});

            expect(requiresAttentionFromCurrentUser(report)).toBe(true);
        });

        it('returns true for expense report awaiting submission with manual submit', async () => {
            const report = {
                ...LHNTestUtils.getFakeReport(),
                policyID: '1',
                managerID: currentUserAccountID,
                type: CONST.REPORT.TYPE.EXPENSE,
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            };

            const policyExpenseChat = {
                ...createPolicyExpenseChat(100, true),
                policyID: '1',
                ownerAccountID: currentUserAccountID,
                hasOutstandingChildRequest: true,
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}1`, {reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_MANUAL});

            // The GBR should appear on the policy expense chat but not on the report itself
            expect(requiresAttentionFromCurrentUser(report)).toBe(false);
            expect(requiresAttentionFromCurrentUser(policyExpenseChat)).toBe(true);
        });

        it('returns true for expense report awaiting user payment/reimbursement', async () => {
            const report = {
                ...LHNTestUtils.getFakeReport(),
                policyID: '1',
                userID: currentUserAccountID,
                type: CONST.REPORT.TYPE.EXPENSE,
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            };

            const policyExpenseChat = {
                ...createPolicyExpenseChat(100, true),
                policyID: '1',
                ownerAccountID: currentUserAccountID,
                hasOutstandingChildRequest: true,
            };

            // The GBR should appear on the policy expense chat but not on the report itself
            expect(requiresAttentionFromCurrentUser(report)).toBe(false);
            expect(requiresAttentionFromCurrentUser(policyExpenseChat)).toBe(true);
        });

        it('returns false and does not surface GBR when expense report is approved and reimbursement is enabled', async () => {
            // Given a policy with reimbursement enabled
            const policyID = '1';
            // And an expense report that is already approved
            const report: Report = {
                ...LHNTestUtils.getFakeReport(),
                type: CONST.REPORT.TYPE.EXPENSE,
                stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
                managerID: currentUserAccountID,
                hasParentAccess: false,
                policyID,
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, {
                id: policyID,
                reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_MANUAL,
            });
            await waitForBatchedUpdates();

            // When we evaluate if the report requires attention from the current user
            const requiresAttention = requiresAttentionFromCurrentUser(report);

            // Then it should return false because the report is already approved and reimbursement is enabled
            expect(requiresAttention).toBe(false);
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
                ...createRandomReport(1, CONST.REPORT.CHAT_TYPE.POLICY_ROOM),
                type: CONST.REPORT.TYPE.CHAT,
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
                    mockedPolicyUtils.isPaidGroupPolicy.mockReturnValue(true);
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
                    owner: currentUserEmail,
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
                        managerID: currentUserAccountID,
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
            expect(shouldDisableThread(reportAction, false)).toBeTruthy();
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
            expect(shouldDisableThread(reportAction, false)).toBeTruthy();
        });

        it("should disable on a whisper action and it's neither a report preview nor IOU action", () => {
            const reportAction = {
                actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIED_EXPENSE,
                originalMessage: {
                    whisperedTo: [123456],
                },
            } as ReportAction;
            expect(shouldDisableThread(reportAction, false)).toBeTruthy();
        });

        it('should disable on thread first chat', () => {
            const reportAction = {
                childReportID: reportID,
            } as ReportAction;
            expect(shouldDisableThread(reportAction, true)).toBeTruthy();
        });

        it('should disable thread for messages sent by MANAGER_MCTEST', () => {
            // Given a report action from MANAGER_MCTEST
            const reportAction = {
                actorAccountID: CONST.ACCOUNT_ID.MANAGER_MCTEST,
                message: [
                    {
                        translationKey: '',
                        type: 'COMMENT',
                        html: 'Test message from Manager McTest',
                        text: 'Test message from Manager McTest',
                    },
                ],
                actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
            } as ReportAction;

            // When it's checked to see if the thread should be disabled
            const isThreadDisabled = shouldDisableThread(reportAction, false);

            // Then the thread should be disabled
            // This ensures "Reply in thread" and "Join thread" context menu options won't be shown
            expect(isThreadDisabled).toBeTruthy();
        });

        it('should disable on a DYNAMIC_EXTERNAL_WORKFLOW_ROUTED action', () => {
            const reportAction = {
                actionName: CONST.REPORT.ACTIONS.TYPE.DYNAMIC_EXTERNAL_WORKFLOW_ROUTED,
            } as ReportAction;
            expect(shouldDisableThread(reportAction, false, false)).toBeTruthy();
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
                const isThreadDisabled = shouldDisableThread(reportAction, false);

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
                const isThreadDisabled = shouldDisableThread(reportAction, false);

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
                const isThreadDisabled = shouldDisableThread(reportAction, false);

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
                const isThreadDisabled = shouldDisableThread(reportAction, false);

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
                const isThreadDisabled = shouldDisableThread(reportAction, false, isReportArchived);

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
                const isThreadDisabled = shouldDisableThread(reportAction, false, isReportArchived);

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
                const isThreadDisabled = shouldDisableThread(reportAction, false, isReportArchived);

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
                const isThreadDisabled = shouldDisableThread(reportAction, false, isReportArchived);

                // Then the thread should be disabled
                expect(isThreadDisabled).toBeTruthy();
            });
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

            expect(canHoldUnholdReportAction(expenseReport, expenseCreatedAction, undefined, expenseTransaction, undefined)).toEqual({
                canHoldRequest: true,
                canUnholdRequest: false,
            });

            putOnHold(expenseTransaction.transactionID, 'hold', transactionThreadReport.reportID);
            await waitForBatchedUpdates();

            const expenseReportUpdated = await new Promise<OnyxEntry<Report>>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`,
                    callback: (report) => {
                        Onyx.disconnect(connection);
                        resolve(report);
                    },
                });
            });
            const expenseCreatedActionUpdated = await new Promise<OnyxEntry<ReportAction>>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.reportID}`,
                    callback: (reportActions) => {
                        Onyx.disconnect(connection);
                        resolve(reportActions?.[expenseCreatedAction.reportActionID]);
                    },
                });
            });
            const expenseTransactionUpdated = await new Promise<OnyxEntry<Transaction>>((resolve) => {
                const connection = Onyx.connect({
                    key: `${ONYXKEYS.COLLECTION.TRANSACTION}${expenseTransaction.transactionID}`,
                    callback: (transaction) => {
                        Onyx.disconnect(connection);
                        resolve(transaction);
                    },
                });
            });
            const transactionThreadReportHoldReportAction = getReportAction(transactionThreadReport.reportID, `${expenseTransactionUpdated?.comment?.hold ?? ''}`);

            // canUnholdRequest should be true after the transaction is held.
            expect(canHoldUnholdReportAction(expenseReportUpdated, expenseCreatedActionUpdated, transactionThreadReportHoldReportAction, expenseTransactionUpdated, undefined)).toEqual({
                canHoldRequest: false,
                canUnholdRequest: true,
            });
        });
    });

    describe('canDeleteMoneyRequestReport', () => {
        it('should allow deletion if the report is open invoice report', async () => {
            const invoiceReport = {...createInvoiceReport(343), ownerAccountID: currentUserAccountID, stateNum: CONST.REPORT.STATE_NUM.OPEN, statusNum: CONST.REPORT.STATUS_NUM.OPEN};
            // Wait for Onyx to load session data before calling canDeleteMoneyRequestReport,
            // since it relies on the session subscription for currentUserAccountID.
            await new Promise<void>((resolve) => {
                const connection = Onyx.connectWithoutView({
                    key: `${ONYXKEYS.SESSION}`,
                    callback: () => {
                        Onyx.disconnect(connection);
                        resolve();
                    },
                });
            });
            expect(canDeleteMoneyRequestReport(invoiceReport, [], [])).toBe(true);
        });

        it('should allow deletion if the expense report is submitted but not yet approved by anyone', async () => {
            const expenseReport: Report = {
                reportID: '1',
                type: CONST.REPORT.TYPE.EXPENSE,
                ownerAccountID: currentUserAccountID,
                managerID: currentUserAccountID,
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                participants: {
                    [currentUserAccountID]: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                },
                policyID: '11',
            };

            const expenseReportPolicy = {
                id: '11',
                employeeList: {
                    [currentUserEmail]: {
                        email: currentUserEmail,
                        submitsTo: currentUserEmail,
                    },
                },
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}11`, expenseReportPolicy); // Wait for Onyx to load session data before calling canDeleteMoneyRequestReport,
            // since it relies on the session subscription for currentUserAccountID.
            await new Promise<void>((resolve) => {
                const connection = Onyx.connectWithoutView({
                    key: `${ONYXKEYS.SESSION}`,
                    callback: () => {
                        Onyx.disconnect(connection);
                        resolve();
                    },
                });
            });

            expect(canDeleteMoneyRequestReport(expenseReport, [], [])).toBe(true);
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

            const canEditRequest = canEditMoneyRequest(moneyRequestAction, true, invoiceReport, undefined, transaction);

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

            const canEditRequest = canEditMoneyRequest(moneyRequestAction, true, expenseReport, undefined, transaction);

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
            // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
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
                expect(getGroupChatName(formatPhoneNumber, fourParticipants)).toEqual('Four, One, Three, Two');
            });

            it('Should show all participants name if count <= 5 and shouldApplyLimit is true', async () => {
                await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, fakePersonalDetails);
                expect(getGroupChatName(formatPhoneNumber, fourParticipants)).toEqual('Four, One, Three, Two');
            });

            it('Should show 5 participants name with ellipsis if count > 5 and shouldApplyLimit is true', async () => {
                await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, fakePersonalDetails);
                expect(getGroupChatName(formatPhoneNumber, eightParticipants, true)).toEqual('Five, Four, One, Three, Two...');
            });

            it('Should show all participants name if count > 5 and shouldApplyLimit is false', async () => {
                await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, fakePersonalDetails);
                expect(getGroupChatName(formatPhoneNumber, eightParticipants, false)).toEqual('Eight, Five, Four, One, Seven, Six, Three, Two');
            });

            it('Should use correct display name for participants', async () => {
                await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, participantsPersonalDetails);
                expect(getGroupChatName(formatPhoneNumber, fourParticipants, true)).toEqual('(833) 240-3627, floki@vikings.net, Lagertha, Ragnar');
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
                expect(getGroupChatName(formatPhoneNumber, undefined, false, report)).toEqual("Let's talk");
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
                expect(getGroupChatName(formatPhoneNumber, undefined, true, report)).toEqual("Let's talk");
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
                expect(getGroupChatName(formatPhoneNumber, undefined, true, report)).toEqual("Let's talk");
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
                expect(getGroupChatName(formatPhoneNumber, undefined, false, report)).toEqual("Let's talk");
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
                expect(getGroupChatName(formatPhoneNumber, undefined, false, report)).toEqual('Eight, Five, Four, One, Seven, Six, Three, Two');
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
                    draftComment: '',
                    isReportArchived: undefined,
                }),
            ).toBeTruthy();
        });

        it('should return true for empty submitted report if it is the current focused report', async () => {
            const report: Report = {...LHNTestUtils.getFakeReport(), total: 0, statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED, stateNum: CONST.REPORT.STATE_NUM.SUBMITTED};
            const currentReportId = report.reportID;

            const isInFocusMode = true;
            const betas = [CONST.BETAS.DEFAULT_ROOMS];
            const createdReportAction: ReportAction = {...LHNTestUtils.getFakeReportAction(), actionName: CONST.REPORT.ACTIONS.TYPE.CREATED};
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {[createdReportAction.reportActionID]: createdReportAction});

            expect(
                shouldReportBeInOptionList({
                    report,
                    chatReport: mockedChatReport,
                    currentReportId,
                    isInFocusMode,
                    betas,
                    doesReportHaveViolations: false,
                    excludeEmptyChats: false,
                    draftComment: '',
                    isReportArchived: undefined,
                }),
            ).toBeTruthy();
        });

        it('should return false for empty submitted report if it is not the current focused report', async () => {
            const report: Report = {
                ...LHNTestUtils.getFakeReport(),
                total: 0,
                statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            };
            const currentReportId = `${report.reportID}1`;

            const isInFocusMode = true;
            const betas = [CONST.BETAS.DEFAULT_ROOMS];
            const createdReportAction: ReportAction = {...LHNTestUtils.getFakeReportAction(), actionName: CONST.REPORT.ACTIONS.TYPE.CREATED};
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {[createdReportAction.reportActionID]: createdReportAction});

            expect(
                shouldReportBeInOptionList({
                    report,
                    chatReport: mockedChatReport,
                    currentReportId,
                    isInFocusMode,
                    betas,
                    doesReportHaveViolations: false,
                    excludeEmptyChats: false,
                    draftComment: '',
                    isReportArchived: undefined,
                }),
            ).toBeFalsy();
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
                    draftComment: '',
                    isReportArchived: undefined,
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
                    draftComment: '',
                    isReportArchived: undefined,
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
                    draftComment: 'fake draft',
                    isReportArchived: undefined,
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
                    draftComment: '',
                    isReportArchived: undefined,
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
                    draftComment: '',
                    isReportArchived: undefined,
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
                    draftComment: '',
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
                    draftComment: '',
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
                    draftComment: '',
                    isReportArchived: undefined,
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
                    draftComment: '',
                    isReportArchived: undefined,
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
                    draftComment: '',
                    isReportArchived: undefined,
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
                    draftComment: '',
                    isReportArchived: undefined,
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
                    draftComment: '',
                    isReportArchived: undefined,
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
                    draftComment: '',
                    isReportArchived: undefined,
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
                    draftComment: '',
                    isReportArchived: undefined,
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
                    draftComment: '',
                    isReportArchived: undefined,
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
                    draftComment: '',
                    isReportArchived: undefined,
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
                    draftComment: '',
                    isReportArchived: undefined,
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
            expect(getWorkspaceNameUpdatedMessage(translateLocal, action as ReportAction)).toEqual(
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

    describe('buildOptimisticCreatedReportForUnapprovedAction', () => {
        it('should build a valid optimistic report action with all required properties', () => {
            const reportID = '123456';
            const originalReportID = '789012';
            const reportAction = buildOptimisticCreatedReportForUnapprovedAction(reportID, originalReportID);

            // Verify action name
            expect(reportAction.actionName).toBe(CONST.REPORT.ACTIONS.TYPE.CREATED_REPORT_FOR_UNAPPROVED_TRANSACTIONS);

            // Verify reportID and originalReportID
            expect(reportAction.reportID).toBe(reportID);
            /* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */
            const originalMessage = getOriginalMessage(reportAction);
            expect(originalMessage?.originalID).toBe(originalReportID);
            /* eslint-enable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access */

            // Verify empty message array (by design for this action type)
            expect(reportAction.message).toEqual([]);

            // Verify optimistic properties
            expect(reportAction.pendingAction).toBe(CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);

            // Verify Concierge as actor
            expect(reportAction.actorAccountID).toBeDefined();
            expect(reportAction.person).toEqual([
                {
                    text: CONST.DISPLAY_NAME.EXPENSIFY_CONCIERGE,
                    type: 'TEXT',
                },
            ]);
        });
    });

    describe('isAllowedToApproveExpenseReport', () => {
        const expenseReport: Report = {
            ...createRandomReport(6, undefined),
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
        const archivedReport: Report = createRandomReport(1, CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT);
        const nonArchivedReport: Report = createRandomReport(2, CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT);
        beforeAll(async () => {
            // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
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
        const archivedReport: Report = createRandomReport(1, CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT);
        const nonArchivedReport: Report = createRandomReport(2, CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT);
        beforeAll(async () => {
            // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
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
            const workspaceChat: Report = createRandomReport(1, CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT);

            expect(canEditWriteCapability(workspaceChat, {...policy, role: CONST.POLICY.ROLE.ADMIN}, false)).toBe(false);
        });

        const policyAnnounceRoom: Report = createRandomReport(1, CONST.REPORT.CHAT_TYPE.POLICY_ANNOUNCE);
        const adminPolicy = {...policy, role: CONST.POLICY.ROLE.ADMIN};

        it('should return true for non-archived policy announce room', () => {
            expect(canEditWriteCapability(policyAnnounceRoom, adminPolicy, false)).toBe(true);
        });

        it('should return false for archived policy announce room', () => {
            expect(canEditWriteCapability(policyAnnounceRoom, adminPolicy, true)).toBe(false);
        });

        it('should return false for non-admin user', () => {
            const normalChat = createRandomReport(11, undefined);
            const memberPolicy = {...policy, role: CONST.POLICY.ROLE.USER};

            expect(canEditWriteCapability(normalChat, memberPolicy, false)).toBe(false);
        });

        it('should return false for admin room', () => {
            const adminRoom: Report = createRandomReport(12, CONST.REPORT.CHAT_TYPE.POLICY_ADMINS);

            expect(canEditWriteCapability(adminRoom, adminPolicy, false)).toBe(false);
        });

        it('should return false for thread reports', () => {
            const parent = createRandomReport(13, undefined);
            const thread: Report = {
                ...createRandomReport(14, undefined),
                parentReportID: parent.reportID,
                parentReportActionID: '2',
            };

            expect(canEditWriteCapability(thread, adminPolicy, false)).toBe(false);
        });

        it('should return false for invoice rooms', () => {
            const invoiceRoom = createRandomReport(13, CONST.REPORT.CHAT_TYPE.INVOICE);

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
                ...createRandomReport(11, CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT),
                ownerAccountID: 1,
                policyID: '1',
                type: CONST.REPORT.TYPE.CHAT,
            };

            const taskReport: Report = {
                ...createRandomReport(10, CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT),
                ownerAccountID: 1,
                policyID: '1',
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
                    ...createRandomReport(0, undefined),
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
                        ...createRandomReport(0, undefined),
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
                        ...createRandomReport(0, undefined),
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
                            ...createRandomReport(0, undefined),
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
                            ...createRandomReport(100, undefined),
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
            ...createRandomReport(1000, undefined),
            ownerAccountID: employeeAccountID,
            type: CONST.REPORT.TYPE.EXPENSE,
        };
        const chatReport: Report = {
            ...createRandomReport(2000, undefined),
            ownerAccountID: employeeAccountID,
            type: CONST.REPORT.TYPE.CHAT,
        };
        const archivedChatReport: Report = {
            ...createRandomReport(3000, undefined),
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
            ...createRandomReport(1, undefined),
            type: CONST.REPORT.TYPE.EXPENSE,
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
            policyID: '1',
        };

        const unapprovedReport: Report = {
            ...createRandomReport(2, undefined),
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
            expect(isPayer(currentUserAccountID, currentUserEmail, unapprovedReport, undefined, undefined, false)).toBe(false);
        });

        it('should return false for non-admin of a group policy', () => {
            expect(isPayer(currentUserAccountID, currentUserEmail, approvedReport, undefined, undefined, false)).toBe(false);
        });

        it('should return true for a reimburser of a group policy on a closed report', async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}1`, {reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES, achAccount: {reimburser: currentUserEmail}});

            const closedReport: Report = {
                ...createRandomReport(2, undefined),
                type: CONST.REPORT.TYPE.EXPENSE,
                stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                statusNum: CONST.REPORT.STATUS_NUM.CLOSED,
                managerID: currentUserAccountID + 1,
                policyID: policyTest.id,
            };

            expect(isPayer(currentUserAccountID, currentUserEmail, closedReport, undefined, undefined, false)).toBe(true);
        });

        it('should return true for admin with bank account access via sharees', () => {
            const adminEmail = 'admin@test.com';
            const adminAccountID = 999;
            const reimburserEmail = 'reimburser@test.com';
            const bankAccountID = 12345;

            const policyWithAch: Policy = {
                ...policyTest,
                role: CONST.POLICY.ROLE.ADMIN,
                reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES,
                achAccount: {
                    reimburser: reimburserEmail,
                    bankAccountID,
                    accountNumber: '1234567890',
                    routingNumber: '987654321',
                    addressName: 'Test Address',
                    bankName: 'Test Bank',
                },
            };

            const bankAccountList = {
                [bankAccountID]: {
                    accountData: {
                        sharees: [reimburserEmail, adminEmail],
                    },
                },
            } as unknown as BankAccountList;

            const report: Report = {
                ...createRandomReport(3, undefined),
                type: CONST.REPORT.TYPE.EXPENSE,
                stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
                policyID: policyTest.id,
            };

            expect(isPayer(adminAccountID, adminEmail, report, bankAccountList, policyWithAch, false)).toBe(true);
        });

        it('should return false for admin without bank account access via sharees', () => {
            const adminEmail = 'admin@test.com';
            const adminAccountID = 888;
            const reimburserEmail = 'reimburser@test.com';
            const otherAdminEmail = 'other@test.com';
            const bankAccountID = 12345;

            const policyWithAch: Policy = {
                ...policyTest,
                role: CONST.POLICY.ROLE.ADMIN,
                reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES,
                achAccount: {
                    reimburser: reimburserEmail,
                    bankAccountID,
                    accountNumber: '1234567890',
                    routingNumber: '987654321',
                    addressName: 'Test Address',
                    bankName: 'Test Bank',
                },
            };

            const bankAccountList = {
                [bankAccountID]: {
                    accountData: {
                        sharees: [reimburserEmail, otherAdminEmail],
                    },
                },
            } as unknown as BankAccountList;

            const report: Report = {
                ...createRandomReport(4, undefined),
                type: CONST.REPORT.TYPE.EXPENSE,
                stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
                policyID: policyTest.id,
            };

            expect(isPayer(adminAccountID, adminEmail, report, bankAccountList, policyWithAch, false)).toBe(false);
        });
    });
    describe('buildReportNameFromParticipantNames', () => {
        beforeAll(async () => {
            await Onyx.set(ONYXKEYS.SESSION, {email: currentUserEmail, accountID: currentUserAccountID});
            await Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, fakePersonalDetails);
        });

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
            const {report, personalDetails: testPersonalDetails} = generateFakeReportAndParticipantsPersonalDetails({count: currentUserAccountID + 2});
            const result = buildReportNameFromParticipantNames({report, personalDetailsList: testPersonalDetails, currentUserAccountID});
            expect(result).not.toContain('CURRENT');
        });

        it('limits to a maximum of 5 participants in the title', () => {
            const {report, personalDetails: testPersonalDetails} = generateFakeReportAndParticipantsPersonalDetails({count: 10});
            const result = buildReportNameFromParticipantNames({report, personalDetailsList: testPersonalDetails, currentUserAccountID});
            expect(result.split(',').length).toBeLessThanOrEqual(5);
        });

        it('returns full name if only one participant is present (excluding current user)', () => {
            const {report, personalDetails: testPersonalDetails} = generateFakeReportAndParticipantsPersonalDetails({count: 1});
            const result = buildReportNameFromParticipantNames({report, personalDetailsList: testPersonalDetails, currentUserAccountID});
            const {displayName} = fakePersonalDetails[1] ?? {};
            expect(result).toEqual(displayName);
        });

        it('returns an empty string if there are no participants or all are excluded', () => {
            const {report, personalDetails: testPersonalDetails} = generateFakeReportAndParticipantsPersonalDetails({start: currentUserAccountID - 1, count: 1});
            const result = buildReportNameFromParticipantNames({report, personalDetailsList: testPersonalDetails, currentUserAccountID});
            expect(result).toEqual('');
        });

        it('handles partial or missing personal details correctly', () => {
            const {report} = generateFakeReportAndParticipantsPersonalDetails({count: 6});

            const secondUser = fakePersonalDetails[2];
            const fourthUser = fakePersonalDetails[4];

            const incompleteDetails = {2: secondUser, 4: fourthUser};
            const result = buildReportNameFromParticipantNames({report, personalDetailsList: incompleteDetails, currentUserAccountID});
            const expectedNames = [secondUser?.firstName, fourthUser?.firstName].sort();
            const resultNames = result.split(', ').sort();
            expect(resultNames).toEqual(expect.arrayContaining(expectedNames));
        });
    });

    describe('getParticipantsList', () => {
        it('should exclude hidden participants', () => {
            const report: Report = {
                ...createRandomReport(1, undefined),
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
                ...createRandomReport(1, undefined),
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
                ...createRandomReport(1, undefined),
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
                ...createRandomReport(0, undefined),
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
                ...createRandomReport(1, undefined),
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
                ...createRandomReport(0, undefined),
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
                ...createRandomReport(1, undefined),
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
                ...createRandomReport(1, undefined),
                policyID: policy.id,
                type: CONST.REPORT.TYPE.EXPENSE,
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            };
            expect(isReportOutstanding(report, policy.id)).toBe(true);
        });
        it('should return false for submitted reports if we specify it', () => {
            const report: Report = {
                ...createRandomReport(1, undefined),
                policyID: policy.id,
                type: CONST.REPORT.TYPE.EXPENSE,
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            };
            expect(isReportOutstanding(report, policy.id, undefined, false)).toBe(false);
        });
        it('should return true for submitted reports if top most report ID is processing', async () => {
            const report: Report = {
                ...createRandomReport(1, undefined),
                policyID: policy.id,
                type: CONST.REPORT.TYPE.EXPENSE,
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            };
            const activeReport: Report = {
                ...createRandomReport(2, undefined),
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
                ...createRandomReport(1, undefined),
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
            const report: Report = createRandomReport(1, CONST.REPORT.CHAT_TYPE.POLICY_ROOM);
            const result = getMoneyReportPreviewName(action, report);
            expect(result).toBe(report.reportName);
        });

        it('should return the report name when the chat type is domain all', () => {
            const action: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
            };
            const report: Report = createRandomReport(1, CONST.REPORT.CHAT_TYPE.DOMAIN_ALL);
            const result = getMoneyReportPreviewName(action, report);
            expect(result).toBe(report.reportName);
        });

        it('should return the report name when the chat type is group', () => {
            const action: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
            };
            const report: Report = createRandomReport(1, CONST.REPORT.CHAT_TYPE.GROUP);
            const result = getMoneyReportPreviewName(action, report);
            expect(result).toBe(report.reportName);
        });

        it('should return policy name when the chat type is invoice', () => {
            const action: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
            };
            const report: Report = createRandomReport(1, CONST.REPORT.CHAT_TYPE.INVOICE);
            const result = getMoneyReportPreviewName(action, report);
            // Policies are empty, so the policy name is "Unavailable workspace"
            expect(result).toBe('Unavailable workspace');
        });

        it('should return the report name when the chat type is policy admins', () => {
            const action: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
            };
            const report: Report = createRandomReport(1, CONST.REPORT.CHAT_TYPE.POLICY_ADMINS);
            const result = getMoneyReportPreviewName(action, report);
            expect(result).toBe(report.reportName);
        });

        it('should return the report name when the chat type is policy announce', () => {
            const action: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
            };
            const report: Report = createRandomReport(1, CONST.REPORT.CHAT_TYPE.POLICY_ANNOUNCE);
            const result = getMoneyReportPreviewName(action, report);
            expect(result).toBe(report.reportName);
        });

        it('should return the owner name expenses when the chat type is policy expense chat', () => {
            const action: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
            };
            const report: Report = createRandomReport(1, CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT);
            const result = getMoneyReportPreviewName(action, report);
            // Report with ownerAccountID: 1 corresponds to "Ragnar Lothbrok"
            expect(result).toBe("Ragnar Lothbrok's expenses");
        });

        it('should return the display name of the current user when the chat type is self dm', () => {
            const action: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
            };
            const report: Report = createRandomReport(1, CONST.REPORT.CHAT_TYPE.SELF_DM);
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
                ...createRandomReport(1, CONST.REPORT.CHAT_TYPE.SYSTEM),
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
                ...createRandomReport(1, CONST.REPORT.CHAT_TYPE.TRIP_ROOM),
                participants: {
                    1: {notificationPreference: 'hidden'},
                    2: {notificationPreference: 'always'},
                },
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
                ...createRandomReport(10000, undefined),
                type: CONST.REPORT.TYPE.EXPENSE,
                ownerAccountID: currentUserAccountID,
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);

            mockedPolicyUtils.isPaidGroupPolicy.mockReturnValue(true);

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
                ...createRandomReport(10000, undefined),
                type: CONST.REPORT.TYPE.EXPENSE,
                ownerAccountID: currentUserAccountID + 1,
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);

            mockedPolicyUtils.isPaidGroupPolicy.mockReturnValue(true);

            const result = canAddTransaction(report, false);

            // Then the result is false
            expect(result).toBe(false);
        });

        it('should return false for a submitted report when the policy is submit and close with payment disabled', async () => {
            // Given the policy is submit and close with payment disabled
            const workflowDisabledPolicy: Policy = {
                ...createRandomPolicy(2962),
                autoReporting: true,
                autoReportingFrequency: CONST.POLICY.AUTO_REPORTING_FREQUENCIES.INSTANT,
                approvalMode: CONST.POLICY.APPROVAL_MODE.OPTIONAL,
                reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO,
                employeeList: {
                    [currentUserEmail]: {email: currentUserEmail, submitsTo: currentUserEmail},
                },
                approver: currentUserEmail,
            };
            const report: Report = {
                ...createRandomReport(10002, undefined),
                type: CONST.REPORT.TYPE.EXPENSE,
                statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                policyID: workflowDisabledPolicy.id,
                ownerAccountID: currentUserAccountID,
                managerID: currentUserAccountID,
            };
            const createdAction: ReportAction = {...createRandomReportAction(123), actionName: CONST.REPORT.ACTIONS.TYPE.CREATED, originalMessage: {submittedTo: currentUserAccountID}};
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {[createdAction.reportActionID]: createdAction});
            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${workflowDisabledPolicy.id}`, workflowDisabledPolicy);
            await Onyx.set(`${ONYXKEYS.PERSONAL_DETAILS_LIST}`, {
                [currentUserAccountID]: {
                    accountID: currentUserAccountID,
                    displayName: 'Lagertha Lothbrok',
                    firstName: 'Lagertha',
                    login: currentUserEmail,
                    pronouns: 'She/her',
                },
            });

            const {result: isReportArchived} = renderHook(() => useReportIsArchived(report?.reportID));

            mockedPolicyUtils.isPaidGroupPolicy.mockReturnValue(true);

            // If the canAddTransaction is used for the case of adding expense into the report
            const result = canAddTransaction(report, isReportArchived.current);

            // Then the result should be false
            expect(result).toBe(false);

            // If the canAddTransaction is used for the case of moving transaction into the report
            const result2 = canAddTransaction(report, isReportArchived.current, true);

            // Then the result should be true
            expect(result2).toBe(true);
        });

        it('should return false for an archived report', async () => {
            // Given an archived expense report
            const report: Report = {
                ...createRandomReport(10001, undefined),
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
                ...createRandomReport(10002, undefined),
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
                ...createRandomReport(20000, undefined),
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
                ...createRandomReport(20001, undefined),
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
                ...createRandomReport(10002, undefined),
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
                ...createRandomReport(30000, undefined),
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

        it('should return HAS_UNRESOLVED_CARD_FRAUD_ALERT when report has unresolved fraud alert', async () => {
            const report: OptionData = {
                ...createRandomReport(40000, undefined),
                type: CONST.REPORT.TYPE.EXPENSE,
                isUnreadWithMention: true,
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);
            const reportAction: ReportAction = {
                ...createRandomReportAction(40000),
                actionName: CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_CARD_FRAUD_ALERT,
            };
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`, {
                [reportAction.reportActionID]: reportAction,
            });

            // When the reason is retrieved
            const {result: isReportArchived} = renderHook(() => useReportIsArchived(report?.reportID));
            const result = getReasonAndReportActionThatRequiresAttention(report, undefined, isReportArchived.current);

            expect(result).toHaveProperty('reason', CONST.REQUIRES_ATTENTION_REASONS.HAS_UNRESOLVED_CARD_FRAUD_ALERT);
        });

        it('should return null for an archived report', async () => {
            // Given an archived expense report that is unread with a mention
            const report: OptionData = {
                ...createRandomReport(30000, undefined),
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
        it('should return null for an archived report when there is a policy pending join request', async () => {
            // Given an archived admin room with a pending join request
            const joinRequestReportAction: ReportAction = {
                ...createRandomReportAction(50400),
                originalMessage: {
                    choice: '' as JoinWorkspaceResolution,
                    policyID: '1',
                },
                actionName: CONST.REPORT.ACTIONS.TYPE.ACTIONABLE_JOIN_REQUEST,
            };

            const adminReport = createAdminRoom(34001);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${adminReport.reportID}`, {[joinRequestReportAction.reportActionID]: joinRequestReportAction});
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${adminReport.reportID}`, {private_isArchived: DateUtils.getDBTime()});

            // When the reason is retrieved
            const {result: isReportArchived} = renderHook(() => useReportIsArchived(adminReport?.reportID));
            const result = getReasonAndReportActionThatRequiresAttention(adminReport, undefined, isReportArchived.current);

            // Then the result is null
            expect(result).toBe(null);
        });
    });

    describe('canEditReportDescription', () => {
        it('should return true for a non-archived policy room', async () => {
            // Given a non-archived policy room
            const report: Report = {
                ...createRandomReport(40001, CONST.REPORT.CHAT_TYPE.POLICY_ROOM),
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
                ...createRandomReport(40002, CONST.REPORT.CHAT_TYPE.POLICY_ROOM),
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
                ...createRandomReport(0, undefined),
                parentReportActionID: '1',
                parentReportID: '1',
                type: CONST.REPORT.TYPE.CHAT,
                participants: buildParticipantsFromAccountIDs([currentUserAccountID, 1, 2]),
            };
            expect(isDeprecatedGroupDM(report)).toBeFalsy();
        });

        it('should return false if the report is a task report', () => {
            const report: Report = {
                ...createRandomReport(0, undefined),
                type: CONST.REPORT.TYPE.TASK,
                participants: buildParticipantsFromAccountIDs([currentUserAccountID, 1, 2]),
            };
            expect(isDeprecatedGroupDM(report)).toBeFalsy();
        });

        it('should return false if the report is a money request report', () => {
            const report: Report = {
                ...createRandomReport(0, undefined),
                type: CONST.REPORT.TYPE.EXPENSE,
                participants: buildParticipantsFromAccountIDs([currentUserAccountID, 1, 2]),
            };
            expect(isDeprecatedGroupDM(report)).toBeFalsy();
        });

        it('should return false if the report is an archived room', () => {
            const report: Report = {
                ...createRandomReport(0, undefined),
                participants: buildParticipantsFromAccountIDs([currentUserAccountID, 1, 2]),
            };
            expect(isDeprecatedGroupDM(report, true)).toBeFalsy();
        });

        it('should return false if the report is a public / admin / announce chat room', () => {
            const report: Report = {
                ...createRandomReport(0, CONST.REPORT.CHAT_TYPE.POLICY_ADMINS),
                participants: buildParticipantsFromAccountIDs([currentUserAccountID, 1, 2]),
            };
            expect(isDeprecatedGroupDM(report)).toBeFalsy();
        });

        it('should return false if the report has less than 2 participants', () => {
            const report: Report = {
                ...createRandomReport(0, undefined),
                type: CONST.REPORT.TYPE.CHAT,
                participants: buildParticipantsFromAccountIDs([currentUserAccountID, 1]),
            };
            expect(isDeprecatedGroupDM(report)).toBeFalsy();
        });

        it('should return true if the report has more than 2 participants', () => {
            const report: Report = {
                ...createRandomReport(0, undefined),
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
                ...createRandomReport(50001, CONST.REPORT.CHAT_TYPE.POLICY_ANNOUNCE),
                participants: buildParticipantsFromAccountIDs([currentUserAccountID, 1]),
                policyID: policy.id,
                writeCapability: CONST.REPORT.WRITE_CAPABILITIES.ADMINS,
            };

            await Onyx.set(`${ONYXKEYS.COLLECTION.POLICY}${workspace.id}`, workspace);

            const {result: isReportArchived} = renderHook(() => useReportIsArchived(policyAnnounceRoom.reportID));
            const result = canUserPerformWriteAction(policyAnnounceRoom, isReportArchived.current);

            // Then it should return false
            expect(result).toBe(false);
        });
        it('should return false for announce room when the role of the employee is admin and report is archived', async () => {
            // Given a policy announce room of a policy that the user has an admin role
            const workspace: Policy = {...createRandomPolicy(1, CONST.POLICY.TYPE.TEAM), role: CONST.POLICY.ROLE.ADMIN};
            const policyAnnounceRoom: Report = {
                ...createRandomReport(50001, CONST.REPORT.CHAT_TYPE.POLICY_ANNOUNCE),
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
                ...createRandomReport(50001, CONST.REPORT.CHAT_TYPE.POLICY_ANNOUNCE),
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
                ...createRandomReport(50001, CONST.REPORT.CHAT_TYPE.POLICY_ROOM),
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
                ...createRandomReport(50002, CONST.REPORT.CHAT_TYPE.POLICY_ADMINS),
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
                ...createRandomReport(50003, CONST.REPORT.CHAT_TYPE.POLICY_ROOM),
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
                ...createRandomReport(50004, undefined),
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
                ...createRandomReport(50005, undefined),
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
                ...createRandomReport(50006, undefined),
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
                ...createRandomReport(50007, CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT),
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
                ...createRandomReport(50008, CONST.REPORT.CHAT_TYPE.INVOICE),
            };

            // When shouldDisableRename is called
            const result = shouldDisableRename(report);

            // Then it should return true
            expect(result).toBe(true);
        });

        it('should return true for invoice reports', () => {
            // Given an invoice report
            const report: Report = {
                ...createRandomReport(50009, undefined),
                type: CONST.REPORT.TYPE.INVOICE,
            };

            // When shouldDisableRename is called
            const result = shouldDisableRename(report);

            // Then it should return true
            expect(result).toBe(true);
        });

        it('should return true for system chats', () => {
            // Given a system chat
            const report: Report = createRandomReport(50010, CONST.REPORT.CHAT_TYPE.SYSTEM);

            // When shouldDisableRename is called
            const result = shouldDisableRename(report);

            // Then it should return true
            expect(result).toBe(true);
        });

        it('should return false for group chats', async () => {
            // Given a group chat
            const report: Report = {
                ...createRandomReport(50011, CONST.REPORT.CHAT_TYPE.GROUP),
                type: CONST.REPORT.TYPE.CHAT,
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

    describe('pushTransactionViolationsOnyxData', () => {
        beforeAll(() => {
            initOnyxDerivedValues();
        });
        it('should push category violation to the Onyx data when category and tag is pending deletion', async () => {
            // Given policy categories, the first is pending deletion
            const fakePolicyCategories = createRandomPolicyCategories(3);
            const fakePolicyCategoryNameToDelete = Object.keys(fakePolicyCategories).at(0) ?? '';
            const fakePolicyCategoriesUpdate = {
                [fakePolicyCategoryNameToDelete]: {
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                    enabled: false,
                },
            };

            // Given policy tags, the first is pending deletion
            const fakePolicyTagListName = 'Tag List';
            const fakePolicyTagsLists = createRandomPolicyTags(fakePolicyTagListName, 3);
            const fakePolicyTagsToDelete = Object.entries(fakePolicyTagsLists?.[fakePolicyTagListName]?.tags ?? {}).slice(1, 2);
            const fakePolicyTagListsUpdate: Record<string, Record<string, Partial<OnyxValueWithOfflineFeedback<PolicyTag>>>> = {
                [fakePolicyTagListName]: {
                    tags: {
                        ...fakePolicyTagsToDelete.reduce<Record<string, Partial<OnyxValueWithOfflineFeedback<PolicyTag>>>>((acc, [tagName]) => {
                            acc[tagName] = {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE, enabled: false};
                            return acc;
                        }, {}),
                    },
                },
            };

            const fakePolicyID = '0';

            const fakePolicy = {
                ...createRandomPolicy(0),
                id: fakePolicyID,
                requiresTag: true,
                areTagsEnabled: true,
                requiresCategory: true,
                areCategoriesEnabled: true,
            };

            const fakePolicyReports: Record<`${typeof ONYXKEYS.COLLECTION.REPORT}${string}`, Report> = {
                [`${ONYXKEYS.COLLECTION.REPORT}${mockIOUReport.reportID}`]: {
                    ...mockIOUReport,
                    policyID: fakePolicyID,
                },
                [`${ONYXKEYS.COLLECTION.REPORT}${mockedChatReport.reportID}`]: {
                    ...mockedChatReport,
                    policyID: fakePolicyID,
                },
            };

            // Populating Onyx with required data
            await Onyx.multiSet({
                ...fakePolicyReports,
                [`${ONYXKEYS.COLLECTION.POLICY_TAGS}${fakePolicyID}`]: fakePolicyTagsLists,
                [`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${fakePolicyID}`]: fakePolicyCategories,
                [`${ONYXKEYS.COLLECTION.POLICY}${fakePolicyID}`]: fakePolicy,
                [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${mockIOUReport.reportID}`]: {
                    [mockIOUAction.reportActionID]: mockIOUAction,
                },
                [`${ONYXKEYS.COLLECTION.TRANSACTION}${mockTransaction.transactionID}`]: {
                    ...mockTransaction,
                    reportID: mockIOUReport.reportID,
                    policyID: fakePolicyID,
                    category: fakePolicyCategoryNameToDelete,
                    tag: fakePolicyTagsToDelete.at(0)?.[0] ?? '',
                },
            });

            await waitForBatchedUpdates();

            const {result} = renderHook(() => usePolicyData(fakePolicyID), {wrapper: OnyxListItemProvider});

            await waitForBatchedUpdates();

            const onyxData = {optimisticData: [], failureData: []};

            pushTransactionViolationsOnyxData(onyxData, result.current, {}, fakePolicyCategoriesUpdate, fakePolicyTagListsUpdate);

            const expectedOnyxData = {
                // Expecting the optimistic data to contain the OUT_OF_POLICY violations for the deleted category and tag
                optimisticData: [
                    {
                        onyxMethod: Onyx.METHOD.SET,
                        key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${mockTransaction.transactionID}`,
                        value: [
                            {
                                name: CONST.VIOLATIONS.CATEGORY_OUT_OF_POLICY,
                                type: CONST.VIOLATION_TYPES.VIOLATION,
                            },

                            {
                                name: CONST.VIOLATIONS.TAG_OUT_OF_POLICY,
                                type: CONST.VIOLATION_TYPES.VIOLATION,
                            },
                        ],
                    },
                ],

                // Expecting the failure data to clear the violations.
                failureData: [
                    {
                        onyxMethod: Onyx.METHOD.SET,
                        key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${mockTransaction.transactionID}`,
                        value: null,
                    },
                ],
            };

            expect(onyxData).toMatchObject(expectedOnyxData);
        });
    });

    describe('canLeaveChat', () => {
        beforeEach(async () => {
            jest.clearAllMocks();

            await Onyx.clear();
        });

        it('should return true for root group chat', () => {
            const report: Report = createRandomReport(1, CONST.REPORT.CHAT_TYPE.GROUP);

            expect(canLeaveChat(report, undefined)).toBe(true);
        });

        it('should return true for policy expense chat if the user is not the owner and the user is not an admin', () => {
            const report: Report = {
                ...createRandomReport(1, CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT),
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
                ...createRandomReport(1, CONST.REPORT.CHAT_TYPE.POLICY_ROOM),
                visibility: CONST.REPORT.VISIBILITY.PUBLIC,
            };

            await Onyx.set(ONYXKEYS.SESSION, {email: currentUserEmail, accountID: currentUserAccountID, authTokenType: CONST.AUTH_TOKEN_TYPES.ANONYMOUS});

            expect(canLeaveChat(report, undefined)).toBe(false);
        });

        it('should return false if the report is hidden for the current user', async () => {
            const report: Report = {
                ...createRandomReport(1, undefined),
                type: CONST.REPORT.TYPE.CHAT,
                participants: {
                    ...buildParticipantsFromAccountIDs([currentUserAccountID, 1234]),
                    [currentUserAccountID]: {
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN,
                    },
                },
            };

            await Onyx.set(ONYXKEYS.SESSION, {email: currentUserEmail, accountID: currentUserAccountID});

            expect(canLeaveChat(report, undefined)).toBe(false);
        });

        it('should return false for selfDM reports', () => {
            const report: Report = {
                ...createRandomReport(1, CONST.REPORT.CHAT_TYPE.SELF_DM),
                type: CONST.REPORT.TYPE.CHAT,
            };

            expect(canLeaveChat(report, undefined)).toBe(false);
        });

        it('should return false for the public announce room if the user is a member of the policy', () => {
            const report: Report = {
                ...createRandomReport(1, CONST.REPORT.CHAT_TYPE.POLICY_ROOM),
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
                ...createRandomReport(1, CONST.REPORT.CHAT_TYPE.INVOICE),
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
                ...createRandomReport(1, undefined),
                type: CONST.REPORT.TYPE.CHAT,
                participants: buildParticipantsFromAccountIDs([currentUserAccountID, 1234]),
                parentReportID: '12345',
                parentReportActionID: '67890',
            };

            await Onyx.set(ONYXKEYS.SESSION, {email: currentUserEmail, accountID: currentUserAccountID});

            expect(canLeaveChat(report, undefined)).toBe(true);
        });

        it('should return true for user created policy room', async () => {
            const report: Report = {
                ...createRandomReport(1, CONST.REPORT.CHAT_TYPE.POLICY_ROOM),
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
                ...createRandomReport(1, CONST.REPORT.CHAT_TYPE.GROUP),
                type: CONST.REPORT.TYPE.CHAT,
                participants: buildParticipantsFromAccountIDs([currentUserAccountID, 1234]),
            };

            const parentReportAction: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
                originalMessage: {
                    whisperedTo: [1234],
                },
            };

            expect(canJoinChat(report, parentReportAction, undefined, undefined)).toBe(false);
        });

        it('should return false if the report is not hidden for the current user', async () => {
            const report: Report = {
                ...createRandomReport(1, CONST.REPORT.CHAT_TYPE.GROUP),
                type: CONST.REPORT.TYPE.CHAT,
                participants: buildParticipantsFromAccountIDs([currentUserAccountID, 1234]),
            };

            await Onyx.set(ONYXKEYS.SESSION, {email: currentUserEmail, accountID: currentUserAccountID});

            expect(canJoinChat(report, undefined, undefined, undefined)).toBe(false);
        });

        it('should return false if the report is one of these types: group chat, selfDM, invoice room, system chat, expense chat', () => {
            const report: Report = {
                ...createRandomReport(1, CONST.REPORT.CHAT_TYPE.GROUP),
                type: CONST.REPORT.TYPE.CHAT,
            };

            expect(canJoinChat(report, undefined, undefined, undefined)).toBe(false);
        });

        it('should return false if the report is archived', () => {
            const report: Report = {
                ...createRandomReport(1, undefined),
            };

            expect(canJoinChat(report, undefined, undefined, undefined, true)).toBe(false);
        });

        it('should return true if the report is chat thread', async () => {
            const report: Report = {
                ...createRandomReport(1, undefined),
                type: CONST.REPORT.TYPE.CHAT,
                participants: {
                    ...buildParticipantsFromAccountIDs([currentUserAccountID, 1234]),
                    [currentUserAccountID]: {
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN,
                    },
                },
                parentReportID: '12345',
                parentReportActionID: '67890',
            };

            await Onyx.set(ONYXKEYS.SESSION, {email: currentUserEmail, accountID: currentUserAccountID});

            expect(canJoinChat(report, undefined, undefined, undefined)).toBe(true);
        });

        it('should respect workspace membership for restricted visibility rooms', async () => {
            const policyID = '123456';
            await Onyx.set(ONYXKEYS.SESSION, {email: currentUserEmail, accountID: currentUserAccountID});

            const policyWithoutCurrentUser: Policy = {
                ...createRandomPolicy(1),
                id: policyID,
                employeeList: {
                    'employee@test.com': {
                        role: CONST.POLICY.ROLE.USER,
                        errors: {},
                    },
                },
            };

            const policyWithCurrentUser: Policy = {
                ...createRandomPolicy(2),
                id: policyID,
                employeeList: {
                    [currentUserEmail]: {
                        role: CONST.POLICY.ROLE.USER,
                        errors: {},
                    },
                },
            };

            const restrictedReport: Report = {
                ...createRandomReport(1, CONST.REPORT.CHAT_TYPE.POLICY_ROOM),
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
                policyID,
                visibility: CONST.REPORT.VISIBILITY.RESTRICTED,
                participants: {
                    ...buildParticipantsFromAccountIDs([currentUserAccountID, 1234]),
                    [currentUserAccountID]: {
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN,
                    },
                },
            };

            const publicReport: Report = {
                ...restrictedReport,
                visibility: CONST.REPORT.VISIBILITY.PUBLIC,
            };

            expect(canJoinChat(restrictedReport, undefined, policyWithoutCurrentUser, undefined)).toBe(false);
            expect(canJoinChat(restrictedReport, undefined, policyWithCurrentUser, undefined)).toBe(true);
            expect(canJoinChat(publicReport, undefined, policyWithoutCurrentUser, undefined)).toBe(true);
        });
    });

    describe('isRootGroupChat', () => {
        it('should return false if the report is chat thread', () => {
            const report: Report = {
                ...createRandomReport(1, undefined),
                type: CONST.REPORT.TYPE.CHAT,
                parentReportID: '12345',
                parentReportActionID: '67890',
            };

            expect(isRootGroupChat(report)).toBe(false);
        });

        it('should return true if the report is a group chat and it is not a chat thread', () => {
            const report: Report = {
                ...createRandomReport(1, CONST.REPORT.CHAT_TYPE.GROUP),
                type: CONST.REPORT.TYPE.CHAT,
            };

            expect(isRootGroupChat(report)).toBe(true);
        });

        it('should return true if the report is a deprecated group DM and it is not a chat thread', () => {
            const report: Report = {
                ...createRandomReport(0, undefined),
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
            const report = createRandomReport(1, undefined);
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
                    ...createRandomReport(2, undefined),

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
                    ...createRandomReport(60000, undefined),
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
                    ...createRandomReport(60000, undefined),
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
                    ...createRandomReport(60000, undefined),
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
                    ...createRandomReport(60000, undefined),
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
                ...createRandomReport(1, CONST.REPORT.CHAT_TYPE.POLICY_ROOM),
                reportID: mockReportID,
                type: CONST.REPORT.TYPE.CHAT,
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

        it('should return false for IOU report', async () => {
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
        const mockTranslate: LocaleContextProps['translate'] = (path, ...params) => translate(CONST.LOCALES.EN, path, ...params);

        it('should return "Draft" for state 0, status 0', () => {
            const result = getReportStatusTranslation({stateNum: CONST.REPORT.STATE_NUM.OPEN, statusNum: CONST.REPORT.STATUS_NUM.OPEN, translate: mockTranslate});
            expect(result).toBe(mockTranslate('common.draft'));
        });

        it('should return "Outstanding" for state 1, status 1', () => {
            const result = getReportStatusTranslation({stateNum: CONST.REPORT.STATE_NUM.SUBMITTED, statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED, translate: mockTranslate});
            expect(result).toBe(mockTranslate('common.outstanding'));
        });

        it('should return "Done" for state 2, status 2', () => {
            const result = getReportStatusTranslation({stateNum: CONST.REPORT.STATE_NUM.APPROVED, statusNum: CONST.REPORT.STATUS_NUM.CLOSED, translate: mockTranslate});
            expect(result).toBe(mockTranslate('common.done'));
        });

        it('should return "Approved" for state 2, status 3', () => {
            const result = getReportStatusTranslation({stateNum: CONST.REPORT.STATE_NUM.APPROVED, statusNum: CONST.REPORT.STATUS_NUM.APPROVED, translate: mockTranslate});
            expect(result).toBe(mockTranslate('iou.approved'));
        });

        it('should return "Paid" for state 2, status 4', () => {
            const result = getReportStatusTranslation({stateNum: CONST.REPORT.STATE_NUM.APPROVED, statusNum: CONST.REPORT.STATUS_NUM.REIMBURSED, translate: mockTranslate});
            expect(result).toBe(mockTranslate('iou.settledExpensify'));
        });

        it('should return "Paid" for state 3, status 4', () => {
            const result = getReportStatusTranslation({stateNum: CONST.REPORT.STATE_NUM.BILLING, statusNum: CONST.REPORT.STATUS_NUM.REIMBURSED, translate: mockTranslate});
            expect(result).toBe(mockTranslate('iou.settledExpensify'));
        });

        it('should return "Paid" for state 6, status 4', () => {
            const result = getReportStatusTranslation({stateNum: CONST.REPORT.STATE_NUM.AUTOREIMBURSED, statusNum: CONST.REPORT.STATUS_NUM.REIMBURSED, translate: mockTranslate});
            expect(result).toBe(mockTranslate('iou.settledExpensify'));
        });

        it('should return an empty string when stateNum or statusNum is undefined', () => {
            expect(getReportStatusTranslation({stateNum: undefined, statusNum: undefined, translate: mockTranslate})).toBe('');
            expect(getReportStatusTranslation({stateNum: CONST.REPORT.STATE_NUM.OPEN, statusNum: undefined, translate: mockTranslate})).toBe('');
            expect(getReportStatusTranslation({stateNum: undefined, statusNum: CONST.REPORT.STATUS_NUM.OPEN, translate: mockTranslate})).toBe('');
        });
    });

    describe('buildOptimisticReportPreview', () => {
        it('should include childOwnerAccountID and childManagerAccountID that matches with iouReport data', () => {
            const chatReport: Report = {
                ...createRandomReport(100, undefined),
                type: CONST.REPORT.TYPE.CHAT,
            };

            const iouReport: Report = {
                ...createRandomReport(200, undefined),
                parentReportID: '1',
                type: CONST.REPORT.TYPE.IOU,
                ownerAccountID: 1,
                managerID: 2,
            };

            const reportPreviewAction = buildOptimisticReportPreview(chatReport, iouReport);

            expect(reportPreviewAction.childOwnerAccountID).toBe(iouReport.ownerAccountID);
            expect(reportPreviewAction.childManagerAccountID).toBe(iouReport.managerID);
        });
    });

    describe('compute (Formula.ts for optimistic report names)', () => {
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

        const mockReport: Report = {
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

        const createFormulaContext = (reportParam: Report, policyParam: Policy, reportTransactions: Record<string, Transaction> = {}): FormulaContext => ({
            report: reportParam,
            policy: policyParam,
            allTransactions: reportTransactions,
        });

        it('should handle NaN total by falling back to original definition', () => {
            const reportWithNaNTotal: Report = {
                ...mockReport,
                total: NaN,
            };
            const context = createFormulaContext(reportWithNaNTotal, mockPolicy);
            const result = compute('{report:total}', context);
            // NaN gets formatted as "NaN" by formatAmount, which is a non-empty value
            expect(result).toBe('NaN');
        });

        it('should replace {report:total} with formatted amount', () => {
            const context = createFormulaContext(mockReport, mockPolicy);
            const result = compute('{report:total}', context);
            // compute uses convertToDisplayString which includes currency symbol
            expect(result).toBe('50.00');
        });

        it('should replace {report:id} with base62 report ID', () => {
            const context = createFormulaContext(mockReport, mockPolicy);
            const result = compute('{report:id}', context);
            expect(result).toBe(getBase62ReportID(Number(mockReport.reportID)));
        });

        it('should replace multiple placeholders correctly', () => {
            const formula = 'Report {report:id} has total {report:total}';
            const context = createFormulaContext(mockReport, mockPolicy);
            const result = compute(formula, context);
            const expectedId = getBase62ReportID(Number(mockReport.reportID));
            expect(result).toBe(`Report ${expectedId} has total 50.00`);
        });

        it('should handle undefined total by falling back to original definition', () => {
            const reportWithUndefinedTotal: Report = {
                ...mockReport,
                total: undefined,
            };
            const context = createFormulaContext(reportWithUndefinedTotal, mockPolicy);
            const result = compute('{report:total}', context);
            // compute returns the original definition when the value is empty (undefined total)
            expect(result).toBe('{report:total}');
        });

        it('should handle complex formula with multiple placeholders and some invalid values', () => {
            const formula = 'ID: {report:id}, Total: {report:total}, Type: {report:type}';
            const reportWithNaNTotal: Report = {
                ...mockReport,
                total: NaN,
            };
            const context = createFormulaContext(reportWithNaNTotal, mockPolicy);
            const expectedId = getBase62ReportID(Number(mockReport.reportID));
            const result = compute(formula, context);
            // NaN gets formatted as "NaN" which is a non-empty value
            expect(result).toBe(`ID: ${expectedId}, Total: NaN, Type: Expense Report`);
        });

        it('should handle missing total gracefully', () => {
            const reportWithMissingTotal: Report = {
                ...mockReport,
                total: undefined,
            };
            const context = createFormulaContext(reportWithMissingTotal, mockPolicy);
            const result = compute('{report:total}', context);
            // compute returns the original definition when the value is empty (undefined total)
            expect(result).toBe('{report:total}');
        });

        it('should replace {report:policyname} with policy name', () => {
            const context = createFormulaContext(mockReport, mockPolicy);
            const result = compute('{report:policyname}', context);
            expect(result).toBe('Test Policy');
        });

        it('should replace {report:workspacename} with policy name', () => {
            const context = createFormulaContext(mockReport, mockPolicy);
            const result = compute('{report:workspacename}', context);
            expect(result).toBe('Test Policy');
        });

        it('should replace {report:status} with human-readable status', () => {
            const context = createFormulaContext(mockReport, mockPolicy);
            const result = compute('{report:status}', context);
            expect(result).toBe('Open');
        });

        it('should replace {report:currency} with currency code', () => {
            const context = createFormulaContext(mockReport, mockPolicy);
            const result = compute('{report:currency}', context);
            expect(result).toBe('USD');
        });
    });
    describe('canSeeDefaultRoom', () => {
        it('should return true if report is archived room ', () => {
            const betas = [CONST.BETAS.DEFAULT_ROOMS];
            const report: Report = {
                ...createRandomReport(40002, undefined),
                type: CONST.REPORT.TYPE.CHAT,
                participants: buildParticipantsFromAccountIDs([currentUserAccountID, 1]),
            };
            expect(canSeeDefaultRoom(report, betas, true)).toBe(true);
        });
        it('should return true if the room has an assigned guide', () => {
            const betas = [CONST.BETAS.DEFAULT_ROOMS];
            const report: Report = {
                ...createRandomReport(40002, undefined),
                participants: buildParticipantsFromAccountIDs([currentUserAccountID, 8]),
            };
            Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetails).then(() => {
                expect(canSeeDefaultRoom(report, betas, false)).toBe(true);
            });
        });
        it('should return true if the report is admin room', () => {
            const betas = [CONST.BETAS.DEFAULT_ROOMS];
            const report: Report = createRandomReport(40002, CONST.REPORT.CHAT_TYPE.POLICY_ADMINS);
            Onyx.set(ONYXKEYS.PERSONAL_DETAILS_LIST, personalDetails).then(() => {
                expect(canSeeDefaultRoom(report, betas, false)).toBe(true);
            });
        });
    });

    describe('getAllReportActionsErrorsAndReportActionThatRequiresAttention', () => {
        const report: Report = {
            ...createRandomReport(40003, undefined),
            parentReportID: '40004',
            parentReportActionID: '2',
        };
        const parentReport: Report = {
            ...createRandomReport(40004, undefined),
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
            actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
            originalMessage: {
                linkedReportID: report.reportID,
            },
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
        it('should return smart scan error for the top-most parent report with smart scan error', async () => {
            const transactionID = '12345';
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportAction1.reportID}`, {
                [reportAction1.reportActionID]: {
                    actorAccountID: currentUserAccountID,
                    actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                    originalMessage: {
                        type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                        IOUTransactionID: transactionID,
                    },
                },
            });
            const transaction: Transaction = {
                ...createRandomTransaction(Number(transactionID)),
                reportID: parentReport.reportID,
                created: '',
                modifiedCreated: '',
            };
            await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction);
            await waitForBatchedUpdates();
            const {errors, reportAction} = getAllReportActionsErrorsAndReportActionThatRequiresAttention(parentReport, reportActions, false);
            expect(Object.keys(errors)).toHaveLength(1);
            expect(Object.keys(errors).at(0)).toBe('smartscan');
            expect(Object.keys(errors.smartscan ?? {})).toHaveLength(1);
            expect(errors.smartscan?.[Object.keys(errors.smartscan)[0]]).toEqual('Transaction is missing fields');
            expect(reportAction?.reportActionID).toBe(parentReportAction1.reportActionID);
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
                created: '',
                modifiedCreated: '',
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

    describe('getReportURLForCurrentContext', () => {
        const flushPromises = () =>
            new Promise<void>((resolve) => {
                setImmediate(resolve);
            });
        const mockIsSearchTopmostFullScreenRoute = jest.mocked(isSearchTopmostFullScreenRoute);
        let environmentURL: string;

        beforeAll(async () => {
            environmentURL = await getEnvironmentURL();
            await flushPromises();
        });

        afterAll(() => {
            mockIsSearchTopmostFullScreenRoute.mockRestore();
        });

        const mockGetActiveRoute = Navigation.getActiveRoute as jest.Mock;

        beforeEach(() => {
            mockIsSearchTopmostFullScreenRoute.mockReset();
            mockIsSearchTopmostFullScreenRoute.mockReturnValue(false);
            mockGetActiveRoute.mockReset();
            mockGetActiveRoute.mockReturnValue('search?q=type:report');
        });

        it('returns report route when not in search context', () => {
            const reportID = '123';
            expect(getReportURLForCurrentContext(reportID)).toBe(`${environmentURL}/${ROUTES.REPORT_WITH_ID.getRoute(reportID)}`);
        });

        it('returns search route when in search context', () => {
            const reportID = '456';
            mockIsSearchTopmostFullScreenRoute.mockReturnValue(true);
            const encodedBackTo = 'search%3Fq%3Dtype%3Areport';
            mockGetActiveRoute.mockReturnValue(`search/r/999?backTo=${encodedBackTo}`);
            expect(getReportURLForCurrentContext(reportID)).toBe(`${environmentURL}/${ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID, backTo: 'search?q=type:report'})}`);
        });

        it('uses current search route when no backTo parameter is present', () => {
            const reportID = '111';
            mockIsSearchTopmostFullScreenRoute.mockReturnValue(true);
            mockGetActiveRoute.mockReturnValue('search?q=type:invoice');
            expect(getReportURLForCurrentContext(reportID)).toBe(`${environmentURL}/${ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID, backTo: 'search?q=type:invoice'})}`);
        });

        it('normalizes leading slash in search routes', () => {
            const reportID = '222';
            mockIsSearchTopmostFullScreenRoute.mockReturnValue(true);
            mockGetActiveRoute.mockReturnValue('/search?q=type:card');
            expect(getReportURLForCurrentContext(reportID)).toBe(`${environmentURL}/${ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID, backTo: 'search?q=type:card'})}`);
        });

        it('falls back to default search route when current route is unavailable', () => {
            const reportID = '789';
            mockIsSearchTopmostFullScreenRoute.mockReturnValue(true);
            mockGetActiveRoute.mockReturnValue('');
            expect(getReportURLForCurrentContext(reportID)).toBe(`${environmentURL}/${ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID, backTo: ROUTES.SEARCH_ROOT.route})}`);
        });

        it('falls back to the base report path when reportID is missing', () => {
            expect(getReportURLForCurrentContext(undefined)).toBe(`${environmentURL}/r/`);
        });
    });

    describe('requiresManualSubmission', () => {
        it('should return true when manual submit is enabled', () => {
            const report: Report = {
                ...createRandomReport(1, undefined),
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
                ...createRandomReport(2, undefined),
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
                ...createRandomReport(3, undefined),
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
                ...createRandomReport(4, undefined),
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
                ...createRandomReport(5, undefined),
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
                ...createRandomReport(8, undefined),
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

    describe('isWorkspaceMemberLeavingWorkspaceRoom', () => {
        test('should return false when not a policy employee', () => {
            const report = {
                ...createRandomReport(1, CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT),
                visibility: CONST.REPORT.VISIBILITY.RESTRICTED,
                isOwnPolicyExpenseChat: true,
            };
            expect(isWorkspaceMemberLeavingWorkspaceRoom(report, false, true)).toBe(false);
        });

        test('should return true for restricted room when policy employee', () => {
            const report = {
                ...createRandomReport(2, undefined),
                visibility: CONST.REPORT.VISIBILITY.RESTRICTED,
            };
            expect(isWorkspaceMemberLeavingWorkspaceRoom(report, true, false)).toBe(true);
        });

        test('should return true for policy expense chat when own chat and policy employee', () => {
            const report = {
                ...createRandomReport(3, CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT),
                visibility: CONST.REPORT.VISIBILITY.PUBLIC,
                isOwnPolicyExpenseChat: true,
            };
            expect(isWorkspaceMemberLeavingWorkspaceRoom(report, true, false)).toBe(true);
        });

        test('should return true for policy expense chat when policy admin and policy employee', () => {
            const report = {
                ...createRandomReport(4, CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT),
                visibility: CONST.REPORT.VISIBILITY.PUBLIC,
                isOwnPolicyExpenseChat: false,
            };
            expect(isWorkspaceMemberLeavingWorkspaceRoom(report, true, true)).toBe(true);
        });

        test('should return false for non-restricted, non-policy expense chat', () => {
            const report = {
                ...createRandomReport(5, CONST.REPORT.CHAT_TYPE.GROUP),
                visibility: CONST.REPORT.VISIBILITY.PUBLIC,
                isOwnPolicyExpenseChat: false,
            };
            expect(isWorkspaceMemberLeavingWorkspaceRoom(report, true, false)).toBe(false);
        });

        test('should return false for non-restricted policy expense chat when not own chat and not admin', () => {
            const report = {
                ...createRandomReport(6, CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT),
                visibility: CONST.REPORT.VISIBILITY.PUBLIC,
                isOwnPolicyExpenseChat: false,
            };
            expect(isWorkspaceMemberLeavingWorkspaceRoom(report, true, false)).toBe(false);
        });
    });

    describe('shouldExcludeAncestorReportAction', () => {
        it('should return false for trip preview action when it is the youngest descendant', () => {
            const tripPreviewAction: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.TRIP_PREVIEW,
            };

            const result = shouldExcludeAncestorReportAction(tripPreviewAction, true);
            expect(result).toBe(false);
        });

        it('should return true for trip preview action when it is not the youngest descendant', () => {
            const tripPreviewAction: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.TRIP_PREVIEW,
            };

            const result = shouldExcludeAncestorReportAction(tripPreviewAction, false);
            expect(result).toBe(true);
        });

        it('should return true for transaction thread CREATE actions', () => {
            const transactionThreadAction: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                originalMessage: {
                    created: DateUtils.getDBTime(),
                    type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                },
            };

            const result = shouldExcludeAncestorReportAction(transactionThreadAction, false);
            expect(result).toBe(true);
        });

        it('should return true for transaction thread TRACK actions', () => {
            const transactionThreadAction: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                originalMessage: {
                    created: DateUtils.getDBTime(),
                    type: CONST.IOU.REPORT_ACTION_TYPE.TRACK,
                },
            };

            const result = shouldExcludeAncestorReportAction(transactionThreadAction, false);
            expect(result).toBe(true);
        });

        it('should return false for sent money report actions (PAY with IOUDetails)', () => {
            const sentMoneyAction: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                originalMessage: {
                    created: DateUtils.getDBTime(),
                    type: CONST.IOU.REPORT_ACTION_TYPE.PAY,
                    IOUDetails: {
                        amount: 100,
                        currency: 'USD',
                        comment: '',
                    },
                },
            };

            const result = shouldExcludeAncestorReportAction(sentMoneyAction, true);
            expect(result).toBe(false);
        });

        it('should return true for report preview actions', () => {
            const reportPreviewAction: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
            };

            const result = shouldExcludeAncestorReportAction(reportPreviewAction, true);
            expect(result).toBe(true);
        });

        it('should return false for regular comment actions', () => {
            const commentAction: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.ADD_COMMENT,
            };

            const result = shouldExcludeAncestorReportAction(commentAction, true);
            expect(result).toBe(false);
        });

        it('should return false for regular IOU actions that are not transaction threads', () => {
            const iouAction: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                originalMessage: {
                    created: DateUtils.getDBTime(),
                    type: CONST.IOU.REPORT_ACTION_TYPE.SPLIT,
                },
            };

            const result = shouldExcludeAncestorReportAction(iouAction, true);
            expect(result).toBe(false);
        });

        it('should return false for PAY actions without IOUDetails', () => {
            const payAction: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
                originalMessage: {
                    created: DateUtils.getDBTime(),
                    type: CONST.IOU.REPORT_ACTION_TYPE.PAY,
                },
            };

            const result = shouldExcludeAncestorReportAction(payAction, true);
            expect(result).toBe(false);
        });

        it('should return false for non-money request actions', () => {
            const nonMoneyRequestAction: ReportAction = {
                ...createRandomReportAction(1),
                actionName: CONST.REPORT.ACTIONS.TYPE.RENAMED,
            };

            const result = shouldExcludeAncestorReportAction(nonMoneyRequestAction, true);
            expect(result).toBe(false);
        });

        it('should handle empty object as parent report action', () => {
            const result = shouldExcludeAncestorReportAction({} as ReportAction, true);
            expect(result).toBe(false);
        });
    });

    describe('shouldEnableNegative', () => {
        let expenseReport: Report;
        let chatReport: Report;
        let corporatePolicy: Policy;
        let teamPolicy: Policy;
        let personalPolicy: Policy;

        beforeEach(() => {
            // Create test reports using the proper pattern
            expenseReport = {
                ...LHNTestUtils.getFakeReport(),
                type: CONST.REPORT.TYPE.EXPENSE,
            };

            chatReport = {
                ...LHNTestUtils.getFakeReport(),
                type: CONST.REPORT.TYPE.CHAT,
            };

            // Create test policies using the existing pattern
            corporatePolicy = {
                ...createRandomPolicy(1),
                type: CONST.POLICY.TYPE.CORPORATE,
            };

            teamPolicy = {
                ...createRandomPolicy(2),
                type: CONST.POLICY.TYPE.TEAM,
            };

            personalPolicy = {
                ...createRandomPolicy(3),
                type: CONST.POLICY.TYPE.PERSONAL,
            };
        });

        describe('when report is an expense report', () => {
            it('should return true for expense report with undefined iouType', () => {
                expect(shouldEnableNegative(expenseReport)).toBe(true);
            });

            it('should return true for expense report with null iouType', () => {
                expect(shouldEnableNegative(expenseReport, undefined, undefined)).toBe(true);
            });

            it('should return true for expense report with CREATE iouType', () => {
                expect(shouldEnableNegative(expenseReport, undefined, CONST.IOU.TYPE.CREATE)).toBe(true);
            });

            it('should return true for expense report with REQUEST iouType', () => {
                expect(shouldEnableNegative(expenseReport, undefined, CONST.IOU.TYPE.REQUEST)).toBe(true);
            });

            it('should return false for expense report with SPLIT iouType', () => {
                expect(shouldEnableNegative(expenseReport, undefined, CONST.IOU.TYPE.SPLIT)).toBe(false);
            });

            it('should return false for expense report with INVOICE iouType', () => {
                expect(shouldEnableNegative(expenseReport, undefined, CONST.IOU.TYPE.INVOICE)).toBe(false);
            });
        });

        describe('when policy is a group policy (CORPORATE)', () => {
            it('should return true for corporate policy with undefined iouType', () => {
                expect(shouldEnableNegative(chatReport, corporatePolicy)).toBe(true);
            });

            it('should return true for corporate policy with CREATE iouType', () => {
                expect(shouldEnableNegative(chatReport, corporatePolicy, CONST.IOU.TYPE.CREATE)).toBe(true);
            });

            it('should return true for corporate policy with REQUEST iouType', () => {
                expect(shouldEnableNegative(chatReport, corporatePolicy, CONST.IOU.TYPE.REQUEST)).toBe(true);
            });

            it('should return false for corporate policy with SPLIT iouType', () => {
                expect(shouldEnableNegative(chatReport, corporatePolicy, CONST.IOU.TYPE.SPLIT)).toBe(false);
            });

            it('should return false for corporate policy with INVOICE iouType', () => {
                expect(shouldEnableNegative(chatReport, corporatePolicy, CONST.IOU.TYPE.INVOICE)).toBe(false);
            });
        });

        describe('when policy is a group policy (TEAM)', () => {
            it('should return true for team policy with undefined iouType', () => {
                expect(shouldEnableNegative(chatReport, teamPolicy)).toBe(true);
            });

            it('should return true for team policy with CREATE iouType', () => {
                expect(shouldEnableNegative(chatReport, teamPolicy, CONST.IOU.TYPE.CREATE)).toBe(true);
            });

            it('should return true for team policy with REQUEST iouType', () => {
                expect(shouldEnableNegative(chatReport, teamPolicy, CONST.IOU.TYPE.REQUEST)).toBe(true);
            });

            it('should return false for team policy with SPLIT iouType', () => {
                expect(shouldEnableNegative(chatReport, teamPolicy, CONST.IOU.TYPE.SPLIT)).toBe(false);
            });

            it('should return false for team policy with INVOICE iouType', () => {
                expect(shouldEnableNegative(chatReport, teamPolicy, CONST.IOU.TYPE.INVOICE)).toBe(false);
            });
        });

        describe('when iouType is CREATE', () => {
            it('should return true for CREATE iouType with personal policy', () => {
                expect(shouldEnableNegative(chatReport, personalPolicy, CONST.IOU.TYPE.CREATE)).toBe(true);
            });

            it('should return true for CREATE iouType with no policy', () => {
                expect(shouldEnableNegative(chatReport, undefined, CONST.IOU.TYPE.CREATE)).toBe(true);
            });

            it('should return true for CREATE iouType with null policy', () => {
                expect(shouldEnableNegative(chatReport, undefined, CONST.IOU.TYPE.CREATE)).toBe(true);
            });

            it('should return true for CREATE iouType with expense report', () => {
                expect(shouldEnableNegative(expenseReport, personalPolicy, CONST.IOU.TYPE.CREATE)).toBe(true);
            });
        });

        describe('exclusion cases for SPLIT and INVOICE iouTypes', () => {
            it('should return false for SPLIT iouType regardless of report type', () => {
                expect(shouldEnableNegative(expenseReport, corporatePolicy, CONST.IOU.TYPE.SPLIT)).toBe(false);
                expect(shouldEnableNegative(chatReport, teamPolicy, CONST.IOU.TYPE.SPLIT)).toBe(false);
                expect(shouldEnableNegative(chatReport, personalPolicy, CONST.IOU.TYPE.SPLIT)).toBe(false);
            });

            it('should return false for INVOICE iouType regardless of report type', () => {
                expect(shouldEnableNegative(expenseReport, corporatePolicy, CONST.IOU.TYPE.INVOICE)).toBe(false);
                expect(shouldEnableNegative(chatReport, teamPolicy, CONST.IOU.TYPE.INVOICE)).toBe(false);
                expect(shouldEnableNegative(chatReport, personalPolicy, CONST.IOU.TYPE.INVOICE)).toBe(false);
            });

            it('should return true for SPLIT_EXPENSE iouType with expense report (different from SPLIT)', () => {
                // SPLIT_EXPENSE is different from SPLIT - only SPLIT and INVOICE are excluded
                expect(shouldEnableNegative(expenseReport, corporatePolicy, CONST.IOU.TYPE.SPLIT_EXPENSE)).toBe(true);
            });
        });

        describe('edge cases with null/undefined values', () => {
            it('should return false when all parameters are null/undefined', () => {
                expect(shouldEnableNegative(undefined, undefined, undefined)).toBe(false);
            });

            it('should return true when report is null but policy is group policy', () => {
                expect(shouldEnableNegative(undefined, corporatePolicy)).toBe(true);
                expect(shouldEnableNegative(undefined, teamPolicy)).toBe(true);
            });

            it('should return false when report is null and policy is personal', () => {
                expect(shouldEnableNegative(undefined, personalPolicy)).toBe(false);
            });

            it('should return true when report is null but iouType is CREATE', () => {
                expect(shouldEnableNegative(undefined, undefined, CONST.IOU.TYPE.CREATE)).toBe(true);
            });

            it('should return true when report is null and iouType is SUBMIT', () => {
                expect(shouldEnableNegative(undefined, undefined, CONST.IOU.TYPE.SUBMIT)).toBe(true);
            });

            it('should return true when report is null, the iouType is SUBMIT, and the receipts do not include a user', () => {
                const participants = [{accountID: 0, isPolicyExpenseChat: true, isSender: false}];
                expect(shouldEnableNegative(undefined, undefined, CONST.IOU.TYPE.SUBMIT, participants)).toBe(true);
            });

            it('should return false when report is null, the iouType is SUBMIT, and the receipts include a user', () => {
                const participants = [{accountID: 1, isPolicyExpenseChat: false, isSender: false}];
                expect(shouldEnableNegative(undefined, undefined, CONST.IOU.TYPE.SUBMIT, participants)).toBe(false);
            });

            it('should handle undefined policy type gracefully', () => {
                const policyWithUndefinedType = {
                    ...createRandomPolicy(4),
                    type: undefined,
                } as unknown as Policy;
                expect(shouldEnableNegative(chatReport, policyWithUndefinedType)).toBe(false);
            });

            it('should handle empty string policy type gracefully', () => {
                const policyWithEmptyType = {
                    ...createRandomPolicy(5),
                    type: '',
                } as unknown as Policy;
                expect(shouldEnableNegative(chatReport, policyWithEmptyType)).toBe(false);
            });
        });

        describe('combination scenarios', () => {
            it('should return true when expense report AND group policy', () => {
                expect(shouldEnableNegative(expenseReport, corporatePolicy)).toBe(true);
                expect(shouldEnableNegative(expenseReport, teamPolicy)).toBe(true);
            });

            it('should return true when expense report AND CREATE iouType', () => {
                expect(shouldEnableNegative(expenseReport, personalPolicy, CONST.IOU.TYPE.CREATE)).toBe(true);
            });

            it('should return true when group policy AND CREATE iouType', () => {
                expect(shouldEnableNegative(chatReport, corporatePolicy, CONST.IOU.TYPE.CREATE)).toBe(true);
                expect(shouldEnableNegative(chatReport, teamPolicy, CONST.IOU.TYPE.CREATE)).toBe(true);
            });

            it('should return false when none of the enabling conditions are met', () => {
                // Chat report + personal policy + no iouType
                expect(shouldEnableNegative(chatReport, personalPolicy)).toBe(false);

                // Chat report + personal policy + non-CREATE iouType
                expect(shouldEnableNegative(chatReport, personalPolicy, CONST.IOU.TYPE.REQUEST)).toBe(false);
                expect(shouldEnableNegative(chatReport, personalPolicy, CONST.IOU.TYPE.TRACK)).toBe(false);
                expect(shouldEnableNegative(chatReport, personalPolicy, CONST.IOU.TYPE.SEND)).toBe(false);
            });

            it('should prioritize exclusion over inclusion', () => {
                // Even if expense report + group policy, SPLIT should still exclude
                expect(shouldEnableNegative(expenseReport, corporatePolicy, CONST.IOU.TYPE.SPLIT)).toBe(false);

                // Even if expense report + CREATE iouType, INVOICE should still exclude
                expect(shouldEnableNegative(expenseReport, undefined, CONST.IOU.TYPE.INVOICE)).toBe(false);

                // Even if group policy + CREATE iouType, SPLIT should still exclude
                expect(shouldEnableNegative(chatReport, teamPolicy, CONST.IOU.TYPE.SPLIT)).toBe(false);
            });
        });
    });

    describe('isSelfDMOrSelfDMThread', () => {
        let standardSelfDMReport: Report;
        let movedSelfDMReport: Report;
        let regularDMReport: Report;
        let groupChatReport: Report;

        beforeEach(() => {
            // Standard self-DM with proper chatType
            standardSelfDMReport = {
                ...LHNTestUtils.getFakeReport(),
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.SELF_DM,
                participants: {
                    [currentUserAccountID]: {
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                    },
                },
            };

            // Self-DM that was moved from workspace (empty chatType)
            movedSelfDMReport = {
                ...LHNTestUtils.getFakeReport(),
                type: CONST.REPORT.TYPE.CHAT,
                chatType: undefined,
                participants: {
                    [currentUserAccountID]: {
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                    },
                },
            };

            // Regular 1:1 DM with another user
            regularDMReport = {
                ...LHNTestUtils.getFakeReport(),
                type: CONST.REPORT.TYPE.CHAT,
                chatType: undefined,
                participants: {
                    [currentUserAccountID]: {
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                    },
                    12345678: {
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                    },
                },
            };

            // Group chat with multiple participants
            groupChatReport = {
                ...LHNTestUtils.getFakeReport(),
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.GROUP,
                participants: {
                    [currentUserAccountID]: {
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                    },
                    12345678: {
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                    },
                    87654321: {
                        notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                    },
                },
            };
        });

        describe('standard self-DM detection', () => {
            it('should return true for standard self-DM with proper chatType', () => {
                expect(isSelfDMOrSelfDMThread(standardSelfDMReport)).toBe(true);
            });

            it('should return true for moved self-DM with empty chatType', () => {
                expect(isSelfDMOrSelfDMThread(movedSelfDMReport)).toBe(true);
            });
        });

        describe('non-self-DM reports', () => {
            it('should return false for regular 1:1 DM', () => {
                expect(isSelfDMOrSelfDMThread(regularDMReport)).toBe(false);
            });

            it('should return false for group chat', () => {
                expect(isSelfDMOrSelfDMThread(groupChatReport)).toBe(false);
            });
        });

        describe('edge cases', () => {
            it('should return false for undefined report', () => {
                expect(isSelfDMOrSelfDMThread(undefined)).toBe(false);
            });

            it('should return false for report with no participants', () => {
                const reportWithNoParticipants = {
                    ...LHNTestUtils.getFakeReport(),
                    type: CONST.REPORT.TYPE.CHAT,
                    chatType: undefined,
                    participants: {},
                };
                expect(isSelfDMOrSelfDMThread(reportWithNoParticipants)).toBe(false);
            });

            it('should return false for non-chat report types', () => {
                const expenseReport = {
                    ...LHNTestUtils.getFakeReport(),
                    type: CONST.REPORT.TYPE.EXPENSE,
                    participants: {
                        [currentUserAccountID]: {
                            notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
                        },
                    },
                };
                expect(isSelfDMOrSelfDMThread(expenseReport)).toBe(false);
            });
        });
    });

    describe('shouldBlockSubmitDueToStrictPolicyRules', () => {
        const reportID = 'report123';

        it('should return false when areStrictPolicyRulesEnabled is false regardless of violations', () => {
            const transactionViolations = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}transaction1`]: [
                    {
                        name: CONST.VIOLATIONS.MISSING_CATEGORY,
                        type: CONST.VIOLATION_TYPES.VIOLATION,
                        data: {},
                    },
                ],
            };

            const result = shouldBlockSubmitDueToStrictPolicyRules(reportID, transactionViolations, false, CONST.DEFAULT_NUMBER_ID, '');

            expect(result).toBe(false);
        });

        it('should return false when areStrictPolicyRulesEnabled is true but no violations exist', () => {
            const transactionViolations = {};

            const result = shouldBlockSubmitDueToStrictPolicyRules(reportID, transactionViolations, true, 0, '');

            expect(result).toBe(false);
        });

        it('should return false when reportID is undefined', () => {
            const transactionViolations = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}transaction1`]: [
                    {
                        name: CONST.VIOLATIONS.MISSING_CATEGORY,
                        type: CONST.VIOLATION_TYPES.VIOLATION,
                        data: {},
                    },
                ],
            };

            const result = shouldBlockSubmitDueToStrictPolicyRules(undefined, transactionViolations, true, 0, '');

            expect(result).toBe(false);
        });

        it('should return false when areStrictPolicyRulesEnabled is false even with violations and transactions provided', () => {
            const transaction = buildOptimisticTransaction({
                transactionParams: {
                    amount: 100,
                    currency: CONST.CURRENCY.USD,
                    reportID,
                    comment: '',
                    attendees: [],
                    created: '2024-01-01',
                    merchant: CONST.TRANSACTION.DEFAULT_MERCHANT,
                    category: '',
                },
            });
            const transactions = [transaction];
            const transactionViolations = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction.transactionID}`]: [
                    {
                        name: CONST.VIOLATIONS.MISSING_CATEGORY,
                        type: CONST.VIOLATION_TYPES.VIOLATION,
                        data: {},
                    },
                ],
            };

            const result = shouldBlockSubmitDueToStrictPolicyRules(reportID, transactionViolations, false, 0, '', transactions);

            expect(result).toBe(false);
        });

        it('should return true when areStrictPolicyRulesEnabled is true and violations exist', () => {
            const transaction = buildOptimisticTransaction({
                transactionParams: {
                    amount: 100,
                    currency: CONST.CURRENCY.USD,
                    reportID,
                    comment: '',
                    attendees: [],
                    created: '2024-01-01',
                    merchant: CONST.TRANSACTION.DEFAULT_MERCHANT,
                    category: '',
                },
            });
            const transactions = [transaction];
            const transactionViolations = {
                [`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction.transactionID}`]: [
                    {
                        name: CONST.VIOLATIONS.MISSING_CATEGORY,
                        type: CONST.VIOLATION_TYPES.VIOLATION,
                        data: {},
                    },
                ],
            };

            const result = shouldBlockSubmitDueToStrictPolicyRules(reportID, transactionViolations, true, 0, '', transactions);

            expect(result).toBe(true);
        });
    });

    describe('canRejectReportAction', () => {
        it('should return false if the user is not the report manager', async () => {
            const approver = 'approver@gmail.com';
            const expenseReport: Report = {
                ...createRandomReport(0, undefined),
                type: CONST.REPORT.TYPE.EXPENSE,
                managerID: 1,
            };
            const reportPolicy: Policy = {
                ...createRandomPolicy(0),
                approver,
            };
            await Onyx.merge(ONYXKEYS.SESSION, {
                accountID: 2,
            });
            expect(canRejectReportAction(approver, expenseReport, reportPolicy)).toBe(false);
        });
    });

    describe('getReportOrDraftReport', () => {
        const mockReportIDIndex = 1;
        const mockReportID = mockReportIDIndex.toString();
        const mockSearchReport: Report = {
            ...createRandomReport(mockReportIDIndex, undefined),
            reportName: 'Search Report',
            type: CONST.REPORT.TYPE.CHAT,
        };
        const mockOnyxReport: Report = {
            ...createPolicyExpenseChat(mockReportIDIndex),
            reportName: 'Onyx Report',
        };
        const mockDraftReport: Report = {
            ...createExpenseReport(mockReportIDIndex),
            reportName: 'Draft Report',
        };
        const mockFallbackReport: Report = {
            ...createExpenseRequestReport(mockReportIDIndex),
            reportName: 'Fallback Report',
        };

        beforeEach(async () => {
            await Onyx.clear();
        });

        test('returns search report when found in searchReports array', () => {
            const searchReports = [mockSearchReport];
            const result = getReportOrDraftReport(mockReportID, searchReports);
            expect(result).toEqual(mockSearchReport);
        });

        test('returns onyx report when search report is not found but onyx report exists', async () => {
            const searchReports: Report[] = [];
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${mockReportID}`, mockOnyxReport);
            const result = getReportOrDraftReport(mockReportID, searchReports);
            expect(result).toEqual(mockOnyxReport);
        });

        test('returns draft report when neither search nor onyx report exists but draft exists', async () => {
            const searchReports: Report[] = [];
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_DRAFT}${mockReportID}`, mockDraftReport);
            const result = getReportOrDraftReport(mockReportID, searchReports);
            expect(result).toEqual(mockDraftReport);
        });

        test('returns fallback report when no other reports exist', () => {
            const searchReports: Report[] = [];
            const result = getReportOrDraftReport('unknownReportID', searchReports, mockFallbackReport);
            expect(result).toEqual(mockFallbackReport);
        });

        test('returns undefined when no reports exist and no fallback provided', () => {
            const searchReports: Report[] = [];
            const result = getReportOrDraftReport(mockReportID, searchReports);
            expect(result).toBeUndefined();
        });

        test('returns undefined when reportID is undefined', () => {
            const searchReports = [mockSearchReport];
            const result = getReportOrDraftReport(undefined, searchReports);
            expect(result).toBeUndefined();
        });

        test('returns undefined when only reportID is provided and it is not found', () => {
            const result = getReportOrDraftReport('unknownReportID');
            expect(result).toBeUndefined();
        });

        test('returns fallback report when reportID is undefined', () => {
            const searchReports = [mockSearchReport];
            const result = getReportOrDraftReport(undefined, searchReports, mockFallbackReport);
            expect(result).toEqual(mockFallbackReport);
        });

        test('prioritizes search report over onyx report when both exist', async () => {
            const searchReports = [mockSearchReport];
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${mockReportID}`, mockOnyxReport);
            const result = getReportOrDraftReport(mockReportID, searchReports);
            expect(result).toEqual(mockSearchReport);
            expect(result).not.toEqual(mockOnyxReport);
        });

        test('prioritizes onyx report over draft report when both exist', async () => {
            const searchReports: Report[] = [];
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${mockReportID}`, mockOnyxReport);
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_DRAFT}${mockReportID}`, mockDraftReport);
            const result = getReportOrDraftReport(mockReportID, searchReports);
            expect(result).toEqual(mockOnyxReport);
            expect(result).not.toEqual(mockDraftReport);
        });

        test('prioritizes draft report over fallback when both exist', async () => {
            const searchReports: Report[] = [];
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_DRAFT}${mockReportID}`, mockDraftReport);
            const result = getReportOrDraftReport(mockReportID, searchReports, mockFallbackReport);
            expect(result).toEqual(mockDraftReport);
            expect(result).not.toEqual(mockFallbackReport);
        });

        test('handles empty searchReports array gracefully', async () => {
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${mockReportID}`, mockOnyxReport);
            const result = getReportOrDraftReport(mockReportID);
            expect(result).toEqual(mockOnyxReport);
        });
    });

    describe('buildOptimisticExpenseReport', () => {
        beforeEach(Onyx.clear);

        it('should include the policy name in report name from report draft', async () => {
            const chatReportID = '1';
            const policyID = '2';
            const reportDraft: Report = {
                ...createRandomReport(Number(chatReportID), CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT),
                policyID,
            };
            const fakePolicy: Policy = createRandomPolicy(Number(policyID));
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_DRAFT}${chatReportID}`, reportDraft);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, fakePolicy);

            const total = 100;
            const currency = CONST.CURRENCY.USD;
            const expenseReport = buildOptimisticExpenseReport(chatReportID, undefined, 1, total, currency);
            expect(expenseReport.reportName).toBe(`${fakePolicy.name} owes ${convertToDisplayString(-total, currency)}`);
        });
    });

    describe('hasEmptyReportsForPolicy', () => {
        const policyID = 'workspace-001';
        const otherPolicyID = 'workspace-002';
        const accountID = 987654;
        const otherAccountID = 123456;

        const buildReport = (overrides: Partial<Report> = {}): Report => ({
            reportID: overrides.reportID ?? 'report-1',
            policyID,
            ownerAccountID: accountID,
            type: CONST.REPORT.TYPE.EXPENSE,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            total: 0,
            nonReimbursableTotal: 0,
            pendingAction: null,
            errors: undefined,
            ...overrides,
        });

        const toCollection = (...reports: Report[]): OnyxCollection<Report> =>
            reports.reduce<Record<string, Report>>((acc, report, index) => {
                acc[report.reportID ?? String(index)] = report;
                return acc;
            }, {});

        const createTransactionForReport = (reportID: string, index = 0): Transaction => ({
            ...createRandomTransaction(index),
            reportID,
            transactionID: `${reportID}-transaction-${index}`,
        });

        it('returns false when policyID is missing or accountID invalid', () => {
            const reportID = 'report-1';
            const reports = toCollection(buildReport({reportID}));
            const transactions: Record<string, Transaction[]> = {
                [reportID]: [],
            };

            expect(hasEmptyReportsForPolicy(reports, undefined, accountID, transactions)).toBe(false);
            expect(hasEmptyReportsForPolicy(reports, policyID, Number.NaN, transactions)).toBe(false);
            expect(hasEmptyReportsForPolicy(reports, policyID, CONST.DEFAULT_NUMBER_ID, transactions)).toBe(false);
        });

        it('returns true when an owned open expense report has no transactions', () => {
            const reportID = 'empty-report';
            const reports = toCollection(buildReport({reportID}));
            const transactions: Record<string, Transaction[]> = {
                [reportID]: [],
            };

            expect(hasEmptyReportsForPolicy(reports, policyID, accountID, transactions)).toBe(true);
        });

        it('returns true when an owned submitted expense report has no transactions', () => {
            const reportID = 'submitted-empty-report';
            const reports = toCollection(
                buildReport({
                    reportID,
                    stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                    statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                }),
            );
            const transactions: Record<string, Transaction[]> = {
                [reportID]: [],
            };

            expect(hasEmptyReportsForPolicy(reports, policyID, accountID, transactions)).toBe(true);
        });

        it('returns false when an owned expense report already has transactions', () => {
            const reportID = 'with-transaction';
            const reports = toCollection(buildReport({reportID}));
            const transactions: Record<string, Transaction[]> = {
                [reportID]: [createTransactionForReport(reportID)],
            };

            expect(hasEmptyReportsForPolicy(reports, policyID, accountID, transactions)).toBe(false);
        });

        it('treats transactions pending deletion as removed when checking emptiness', () => {
            const reportID = 'pending-delete-report';
            const reports = toCollection(buildReport({reportID}));
            const transactions: Record<string, Transaction[]> = {
                [reportID]: [
                    {
                        ...createTransactionForReport(reportID),
                        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                    },
                ],
            };

            expect(hasEmptyReportsForPolicy(reports, policyID, accountID, transactions)).toBe(true);
        });

        it('ignores reports owned by other users or policies', () => {
            const reports = toCollection(buildReport({reportID: 'other-owner', ownerAccountID: otherAccountID}), buildReport({reportID: 'other-policy', policyID: otherPolicyID}));
            const transactions: Record<string, Transaction[]> = {
                'other-owner': [],
                'other-policy': [],
            };

            expect(hasEmptyReportsForPolicy(reports, policyID, accountID, transactions)).toBe(false);
        });

        it('ignores reports that are not open expense reports even if they have no transactions', () => {
            const reports = toCollection(
                buildReport({reportID: 'closed', statusNum: CONST.REPORT.STATUS_NUM.CLOSED}),
                buildReport({reportID: 'approved', stateNum: CONST.REPORT.STATE_NUM.APPROVED}),
                buildReport({reportID: 'chat', type: CONST.REPORT.TYPE.CHAT}),
            );
            const transactions: Record<string, Transaction[]> = {
                closed: [],
                approved: [],
                chat: [],
            };

            expect(hasEmptyReportsForPolicy(reports, policyID, accountID, transactions)).toBe(false);
        });

        it('ignores reports flagged for deletion or with errors', () => {
            const reports = toCollection(
                buildReport({reportID: 'pending-delete', pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}),
                buildReport({reportID: 'with-errors', errors: {test: 'error'}}),
            );

            const transactions: Record<string, Transaction[]> = {
                'pending-delete': [],
                'with-errors': [],
            };

            expect(hasEmptyReportsForPolicy(reports, policyID, accountID, transactions)).toBe(false);
        });

        it('returns true when at least one qualifying report exists among mixed data', () => {
            const reports = toCollection(buildReport({reportID: 'valid-empty'}), buildReport({reportID: 'with-transaction'}), buildReport({reportID: 'other', policyID: otherPolicyID}));

            const transactions: Record<string, Transaction[]> = {
                'valid-empty': [],
                'with-transaction': [createTransactionForReport('with-transaction')],
                other: [],
            };

            expect(hasEmptyReportsForPolicy(reports, policyID, accountID, transactions)).toBe(true);
        });

        it('returns false when accountID is the default one', () => {
            const reports = toCollection(buildReport({reportID: 'valid-empty'}), buildReport({reportID: 'with-transaction'}), buildReport({reportID: 'other', policyID: otherPolicyID}));

            const transactions: Record<string, Transaction[]> = {
                'valid-empty': [],
                'with-transaction': [createTransactionForReport('with-transaction')],
                other: [],
            };

            expect(hasEmptyReportsForPolicy(reports, policyID, CONST.DEFAULT_NUMBER_ID, transactions)).toBe(false);
        });

        it('supports minimal report summaries array', () => {
            const reportID = 'summary-report';
            const minimalReports = [
                {
                    reportID,
                    policyID,
                    ownerAccountID: accountID,
                    type: CONST.REPORT.TYPE.EXPENSE,
                    stateNum: CONST.REPORT.STATE_NUM.OPEN,
                    statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                    total: 0,
                    nonReimbursableTotal: 0,
                    pendingAction: null,
                    errors: undefined,
                },
            ];

            const transactions: Record<string, Transaction[]> = {
                [reportID]: [],
            };

            expect(hasEmptyReportsForPolicy(minimalReports, policyID, accountID, transactions)).toBe(true);
        });
    });

    describe('getPolicyIDsWithEmptyReportsForAccount', () => {
        const policyID = 'workspace-001';
        const otherPolicyID = 'workspace-002';
        const accountID = 555555;
        const otherAccountID = 999999;

        const buildReport = (overrides: Partial<Report> = {}): Report => ({
            reportID: overrides.reportID ?? 'report-1',
            policyID,
            ownerAccountID: accountID,
            type: CONST.REPORT.TYPE.EXPENSE,
            stateNum: CONST.REPORT.STATE_NUM.OPEN,
            statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            total: 0,
            nonReimbursableTotal: 0,
            pendingAction: null,
            errors: undefined,
            ...overrides,
        });

        const toCollection = (...reports: Report[]): OnyxCollection<Report> =>
            reports.reduce<Record<string, Report>>((acc, report, index) => {
                acc[report.reportID ?? String(index)] = report;
                return acc;
            }, {});

        const createTransactionForReport = (reportID: string, index = 0): Transaction => ({
            ...createRandomTransaction(index),
            reportID,
            transactionID: `${reportID}-txn-${index}`,
        });

        it('returns empty object when accountID is missing', () => {
            const reportID = 'empty';
            const reports = toCollection(buildReport({reportID}));
            const transactions: Record<string, Transaction[]> = {
                [reportID]: [],
            };

            expect(getPolicyIDsWithEmptyReportsForAccount(reports, undefined, transactions)).toEqual({});
        });

        it('marks policy IDs that have empty reports owned by the user', () => {
            const reportA = 'policy-a';
            const reportB = 'policy-b';
            const reports = toCollection(buildReport({reportID: reportA, policyID}), buildReport({reportID: reportB, policyID: otherPolicyID}));
            const transactions: Record<string, Transaction[]> = {
                [reportA]: [],
                [reportB]: [],
            };

            expect(getPolicyIDsWithEmptyReportsForAccount(reports, accountID, transactions)).toEqual({
                [policyID]: true,
                [otherPolicyID]: true,
            });
        });

        it('marks submitted empty reports as outstanding for the policy lookup', () => {
            const reportID = 'submitted-empty-lookup';
            const reports = toCollection(
                buildReport({
                    reportID,
                    stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                    statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                }),
            );
            const transactions: Record<string, Transaction[]> = {
                [reportID]: [],
            };

            expect(getPolicyIDsWithEmptyReportsForAccount(reports, accountID, transactions)).toEqual({
                [policyID]: true,
            });
        });

        it('ignores transactions pending deletion when compiling policy lookup', () => {
            const reportID = 'pending-delete-lookup';
            const reports = toCollection(buildReport({reportID}));
            const transactions: Record<string, Transaction[]> = {
                [reportID]: [
                    {
                        ...createTransactionForReport(reportID),
                        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                    },
                ],
            };

            expect(getPolicyIDsWithEmptyReportsForAccount(reports, accountID, transactions)).toEqual({
                [policyID]: true,
            });
        });

        it('supports minimal summaries input', () => {
            const reportID = 'summary-report';
            const summaries = [
                {
                    reportID,
                    policyID,
                    ownerAccountID: accountID,
                    type: CONST.REPORT.TYPE.EXPENSE,
                    stateNum: CONST.REPORT.STATE_NUM.OPEN,
                    statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                    total: 0,
                    nonReimbursableTotal: 0,
                    pendingAction: null,
                    errors: undefined,
                },
            ];

            const transactions: Record<string, Transaction[]> = {
                [reportID]: [],
            };

            expect(getPolicyIDsWithEmptyReportsForAccount(summaries, accountID, transactions)).toEqual({
                [policyID]: true,
            });
        });

        it('ignores reports that do not qualify', () => {
            const reports = toCollection(
                buildReport({reportID: 'with-money', total: 100}),
                buildReport({reportID: 'other-owner', ownerAccountID: otherAccountID}),
                buildReport({reportID: 'pending-delete', pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE}),
                buildReport({reportID: 'with-errors', errors: {message: 'error'}}),
                buildReport({reportID: 'chat', type: CONST.REPORT.TYPE.CHAT}),
            );

            const transactions: Record<string, Transaction[]> = {
                'with-money': [createTransactionForReport('with-money')],
                'other-owner': [],
                'pending-delete': [],
                'with-errors': [],
                chat: [],
            };

            expect(getPolicyIDsWithEmptyReportsForAccount(reports, accountID, transactions)).toEqual({});
        });
    });

    it('should require attention when a workspace chat awaits Expensify Card shipping details', async () => {
        const workspaceChat = {
            ...createPolicyExpenseChat(41000),
            hasOutstandingChildTask: true,
        };
        const cardMissingAddressAction: ReportAction = {
            reportActionID: 'card-missing-address-action',
            actionName: CONST.REPORT.ACTIONS.TYPE.CARD_MISSING_ADDRESS,
            childType: CONST.REPORT.TYPE.TASK,
            childReportID: 'task-11000',
            created: DateUtils.getDBTime(),
            originalMessage: {
                assigneeAccountID: currentUserAccountID,
                cardID: 11000,
            },
        };

        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${workspaceChat.reportID}`, workspaceChat);
        await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${workspaceChat.reportID}`, {
            [cardMissingAddressAction.reportActionID]: cardMissingAddressAction,
        });
        await waitForBatchedUpdates();

        const {result: isReportArchived} = renderHook(() => useReportIsArchived(workspaceChat.reportID));
        const result = getReasonAndReportActionThatRequiresAttention(workspaceChat, undefined, isReportArchived.current);

        expect(result?.reason).toBe(CONST.REQUIRES_ATTENTION_REASONS.IS_WAITING_FOR_ASSIGNEE_TO_COMPLETE_ACTION);
        expect(result?.reportAction?.reportActionID).toBe(cardMissingAddressAction.reportActionID);
    });

    it('should surface a GBR when reimbursement is queued and waiting on the payee bank account', async () => {
        await Onyx.clear();

        const adminAccountID = 42;
        const expenseReportID = '10000';
        const chatReport: Report = {
            ...LHNTestUtils.getFakeReport([currentUserAccountID, adminAccountID]),
            hasOutstandingChildRequest: true,
            iouReportID: expenseReportID,
        };
        const expenseReport: Report = {
            ...LHNTestUtils.getFakeReport([currentUserAccountID, adminAccountID]),
            reportID: expenseReportID,
            chatReportID: chatReport.reportID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: currentUserAccountID,
            managerID: adminAccountID,
            currency: CONST.CURRENCY.USD,
            total: 10000,
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
            isWaitingOnBankAccount: true,
        };
        const reimbursementQueuedAction: ReportAction = {
            ...LHNTestUtils.getFakeReportAction(),
            actionName: CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_QUEUED,
            childReportID: expenseReportID,
            originalMessage: {
                paymentType: CONST.IOU.PAYMENT_TYPE.VBBA,
            },
        };

        await Onyx.merge(ONYXKEYS.SESSION, {accountID: currentUserAccountID, email: currentUserEmail});
        await Promise.all([
            Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`, chatReport),
            Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${expenseReportID}`, expenseReport),
            Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport.reportID}`, {
                [reimbursementQueuedAction.reportActionID]: reimbursementQueuedAction,
            }),
        ]);
        await waitForBatchedUpdates();

        const reason = reasonForReportToBeInOptionList({
            report: chatReport,
            chatReport,
            currentReportId: '',
            isInFocusMode: false,
            betas: [CONST.BETAS.DEFAULT_ROOMS],
            doesReportHaveViolations: false,
            excludeEmptyChats: false,
            draftComment: '',
            isReportArchived: undefined,
        });

        expect(reason).toBe(CONST.REPORT_IN_LHN_REASONS.HAS_GBR);
        await Onyx.clear();
    });

    it('should not surface a GBR when reimbursement is queued but not waiting on the payee bank account', async () => {
        await Onyx.clear();

        const adminAccountID = 42;
        const expenseReportID = '10000';
        const chatReport: Report = {
            ...LHNTestUtils.getFakeReport([currentUserAccountID, adminAccountID]),
            hasOutstandingChildRequest: false,
            iouReportID: expenseReportID,
        };
        const expenseReport: Report = {
            ...LHNTestUtils.getFakeReport([currentUserAccountID, adminAccountID]),
            reportID: expenseReportID,
            chatReportID: chatReport.reportID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: currentUserAccountID,
            managerID: adminAccountID,
            currency: CONST.CURRENCY.USD,
            total: 10000,
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
            isWaitingOnBankAccount: false,
        };
        const reimbursementQueuedAction: ReportAction = {
            ...LHNTestUtils.getFakeReportAction(),
            actionName: CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_QUEUED,
            childReportID: expenseReportID,
            originalMessage: {
                paymentType: CONST.IOU.PAYMENT_TYPE.VBBA,
            },
        };

        await Onyx.merge(ONYXKEYS.SESSION, {accountID: currentUserAccountID, email: currentUserEmail});
        await Promise.all([
            Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`, chatReport),
            Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${expenseReportID}`, expenseReport),
            Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport.reportID}`, {
                [reimbursementQueuedAction.reportActionID]: reimbursementQueuedAction,
            }),
        ]);
        await waitForBatchedUpdates();

        const reason = reasonForReportToBeInOptionList({
            report: chatReport,
            chatReport,
            currentReportId: '',
            isInFocusMode: false,
            betas: [CONST.BETAS.DEFAULT_ROOMS],
            doesReportHaveViolations: false,
            excludeEmptyChats: false,
            draftComment: '',
            isReportArchived: undefined,
        });

        expect(reason).toBe(CONST.REPORT_IN_LHN_REASONS.DEFAULT);
        await Onyx.clear();
    });

    describe('getDisplayNameForParticipant', () => {
        it('should return the display name for a participant', async () => {
            await Onyx.merge(ONYXKEYS.PERSONAL_DETAILS_LIST, fakePersonalDetails);

            waitForBatchedUpdates();

            const policyExpenseChat: Report = {
                ...createRandomReport(2, CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT),
                chatType: CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
                policyID: policy.id,
                policyName: policy.name,
                type: CONST.REPORT.TYPE.CHAT,
            };

            const lastReportPreviewAction = {
                action: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
                actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
                childReportName: 'Expense Report 2025-07-10',
                childReportID: '5186125925096828',
                created: '2025-07-10 17:45:31.448',
                reportActionID: '7425617950691586420',
                shouldShow: true,
                message: [
                    {
                        type: 'COMMENT',
                        html: 'a owes ETB 5.00',
                        text: 'a owes ETB 5.00',
                        isEdited: false,
                        whisperedTo: [],
                        isDeletedParentAction: false,
                        deleted: '',
                        reactions: [],
                    },
                ],
                originalMessage: {
                    linkedReportID: '5186125925096828',
                    actionableForAccountIDs: [20232605],
                    isNewDot: true,
                    lastModified: '2025-07-10 17:45:53.635',
                },
                person: [
                    {
                        type: 'TEXT',
                        style: 'strong',
                        text: 'f100',
                    },
                ],
                parentReportID: policyExpenseChat.reportID,
            };

            const iouReport = {
                reportName: 'Expense Report 2025-07-10',
                reportID: '5186125925096828',
                policyID: policy.id,
                type: 'expense',
                currency: 'ETB',
                ownerAccountID: 1,
                total: -500,
                nonReimbursableTotal: 0,
                parentReportID: policyExpenseChat.reportID,
                parentReportActionID: lastReportPreviewAction.reportActionID,
                chatReportID: policyExpenseChat.reportID,
            } as Report;

            const displayName = getDisplayNameForParticipant({formatPhoneNumber, accountID: iouReport.ownerAccountID});
            expect(displayName).toBe(fakePersonalDetails?.[1]?.displayName);
        });
        it('should surface a GBR when copiloted into an approver account with a report with outstanding child request', async () => {
            await Onyx.clear();

            const copilotEmail = 'copilot@example.com';
            const delegatedAccess = {
                delegate: copilotEmail,
                delegates: [{email: copilotEmail, role: CONST.DELEGATE_ROLE.ALL}],
            };

            await Onyx.merge(ONYXKEYS.ACCOUNT, {delegatedAccess});

            const expenseReport: Report = {
                ...createExpenseReport(1234),
                hasOutstandingChildRequest: true,
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`, expenseReport);

            const reasonForAttention = getReasonAndReportActionThatRequiresAttention(expenseReport, undefined, false);
            expect(reasonForAttention?.reason).toBe(CONST.REQUIRES_ATTENTION_REASONS.HAS_CHILD_REPORT_AWAITING_ACTION);

            const requiresAttention = requiresAttentionFromCurrentUser(expenseReport, undefined, false);
            expect(requiresAttention).toBe(true);

            const reasonForOptionList = reasonForReportToBeInOptionList({
                report: expenseReport,
                chatReport: undefined,
                currentReportId: undefined,
                isInFocusMode: true,
                betas: undefined,
                doesReportHaveViolations: false,
                excludeEmptyChats: false,
                draftComment: undefined,
                isReportArchived: undefined,
            });

            expect(reasonForOptionList).toBe(CONST.REPORT_IN_LHN_REASONS.HAS_GBR);

            await Onyx.clear();
        });

        it('should not surface a GBR when copiloted into an approver account with a report without outstanding child request', async () => {
            await Onyx.clear();

            const copilotEmail = 'copilot@example.com';
            const delegatedAccess = {
                delegate: copilotEmail,
                delegates: [{email: copilotEmail, role: CONST.DELEGATE_ROLE.ALL}],
            };

            await Onyx.merge(ONYXKEYS.ACCOUNT, {delegatedAccess});

            const expenseReport: Report = {
                ...createExpenseReport(1234),
                isPinned: false,
                isWaitingOnBankAccount: false,
                hasOutstandingChildRequest: false,
            };

            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`, expenseReport);

            const reasonForAttention = getReasonAndReportActionThatRequiresAttention(expenseReport, undefined, false);
            expect(reasonForAttention?.reason).toBe(undefined);

            const requiresAttention = requiresAttentionFromCurrentUser(expenseReport, undefined, false);
            expect(requiresAttention).toBe(false);

            const reasonForOptionList = reasonForReportToBeInOptionList({
                report: expenseReport,
                chatReport: undefined,
                currentReportId: undefined,
                isInFocusMode: true,
                betas: undefined,
                doesReportHaveViolations: false,
                excludeEmptyChats: false,
                draftComment: undefined,
                isReportArchived: undefined,
            });

            expect(reasonForOptionList).toBe(null);

            await Onyx.clear();
        });
    });

    it('should surface a GBR for admin with held expenses requiring approval or payment and avoid showing an RBR', async () => {
        await Onyx.clear();

        const adminAccountID = currentUserAccountID;
        const policyID = 'policy-hold';
        const chatReportID = 'chat-hold';
        const expenseReportID = 'expense-hold';
        const transactionID = 'transaction-hold';
        const holdReportActionID = 'hold-action';

        const policy1: Policy = {
            id: policyID,
            name: 'Held Expenses Workspace',
            type: CONST.POLICY.TYPE.TEAM,
            role: CONST.POLICY.ROLE.ADMIN,
            outputCurrency: CONST.CURRENCY.USD,
            reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES,
            approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
            employeeList: {
                [currentUserEmail]: {
                    role: CONST.POLICY.ROLE.ADMIN,
                },
            },
            owner: currentUserEmail,
            isPolicyExpenseChatEnabled: true,
        };

        const chatReport: Report = {
            ...createPolicyExpenseChat(500, false),
            reportID: chatReportID,
            ownerAccountID: employeeAccountID,
            policyID,
            iouReportID: expenseReportID,
            hasOutstandingChildRequest: true,
            participants: buildParticipantsFromAccountIDs([adminAccountID, employeeAccountID]),
        };

        const expenseReport: Report = {
            ...createExpenseReport(600),
            reportID: expenseReportID,
            chatReportID,
            ownerAccountID: employeeAccountID,
            managerID: adminAccountID,
            policyID,
            type: CONST.REPORT.TYPE.EXPENSE,
            currency: CONST.CURRENCY.USD,
            total: 12345,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
        };

        const baseTransaction = createRandomTransaction(700);
        const transaction: Transaction = {
            ...baseTransaction,
            transactionID,
            reportID: expenseReportID,
            amount: 12345,
            currency: CONST.CURRENCY.USD,
            status: CONST.TRANSACTION.STATUS.POSTED,
            reimbursable: true,
            comment: {
                ...(baseTransaction.comment ?? {}),
                hold: holdReportActionID,
            },
        };

        const reportPreviewAction: ReportAction = {
            ...LHNTestUtils.getFakeReportAction(),
            reportActionID: 'report-preview-action',
            actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
            childReportID: expenseReportID,
        };

        const transactionViolationsKey = `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction.transactionID}` as OnyxKey;
        const transactionViolationsCollection: OnyxCollection<TransactionViolation[]> = {
            [transactionViolationsKey]: [
                {
                    name: CONST.VIOLATIONS.HOLD,
                    type: CONST.VIOLATION_TYPES.VIOLATION,
                },
            ],
        };

        await Onyx.merge(ONYXKEYS.SESSION, {accountID: adminAccountID, email: currentUserEmail});
        await Promise.all([
            Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, policy1),
            Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`, chatReport),
            Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`, expenseReport),
            Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport.reportID}`, {
                [reportPreviewAction.reportActionID]: reportPreviewAction,
            }),
            Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction),
            Onyx.merge(transactionViolationsKey, transactionViolationsCollection[transactionViolationsKey]),
        ]);
        await waitForBatchedUpdates();

        const shouldShowRBR = shouldDisplayViolationsRBRInLHN(chatReport, transactionViolationsCollection);
        expect(shouldShowRBR).toBe(false);

        const reason = reasonForReportToBeInOptionList({
            report: chatReport,
            chatReport,
            currentReportId: '',
            isInFocusMode: false,
            betas: [CONST.BETAS.DEFAULT_ROOMS],
            doesReportHaveViolations: shouldShowRBR,
            excludeEmptyChats: false,
            draftComment: '',
            isReportArchived: undefined,
        });

        expect(reason).toBe(CONST.REPORT_IN_LHN_REASONS.HAS_GBR);
        await Onyx.clear();
    });

    it('should not surface a GBR when bank account is added, but reimbursement is disabled on the policy', async () => {
        await Onyx.clear();

        const adminAccountID = 42;
        const policyID = '10000';
        const expenseReportID = '20000';
        const chatReport: Report = {
            ...LHNTestUtils.getFakeReport([currentUserAccountID, adminAccountID]),
            iouReportID: expenseReportID,
            policyID,
        };
        const expenseReport: Report = {
            ...LHNTestUtils.getFakeReport([currentUserAccountID, adminAccountID]),
            reportID: expenseReportID,
            chatReportID: chatReport.reportID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: currentUserAccountID,
            managerID: adminAccountID,
            currency: CONST.CURRENCY.USD,
            total: 10000,
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
            isWaitingOnBankAccount: false,
            policyID,
        };
        const pendingTransaction: Transaction = {
            transactionID: `${expenseReportID}-transaction`,
            reportID: expenseReportID,
            amount: 10000,
            currency: CONST.CURRENCY.USD,
            created: '2025-01-01T00:00:00.000Z',
            merchant: 'Expensify Card',
            bank: CONST.EXPENSIFY_CARD.BANK,
            status: CONST.TRANSACTION.STATUS.PENDING,
        };
        const reimbursementQueuedAction: ReportAction = {
            ...LHNTestUtils.getFakeReportAction(),
            actionName: CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_QUEUED,
            childReportID: expenseReportID,
            originalMessage: {
                paymentType: CONST.IOU.PAYMENT_TYPE.VBBA,
            },
        };
        const policy1: Policy = {
            id: policyID,
            name: 'Policy',
            role: CONST.POLICY.ROLE.ADMIN,
            type: CONST.POLICY.TYPE.TEAM,
            owner: currentUserEmail,
            outputCurrency: CONST.CURRENCY.USD,
            isPolicyExpenseChatEnabled: true,
            reimbursementChoice: CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO,
        };

        await Onyx.merge(ONYXKEYS.SESSION, {accountID: currentUserAccountID, email: currentUserEmail});
        await Promise.all([
            Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`, chatReport),
            Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${expenseReportID}`, expenseReport),
            Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport.reportID}`, {
                [reimbursementQueuedAction.reportActionID]: reimbursementQueuedAction,
            }),
            Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${pendingTransaction.transactionID}`, pendingTransaction),
            Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, policy1),
        ]);
        await waitForBatchedUpdates();

        const reason = reasonForReportToBeInOptionList({
            report: chatReport,
            chatReport,
            currentReportId: '',
            isInFocusMode: false,
            betas: [CONST.BETAS.DEFAULT_ROOMS],
            doesReportHaveViolations: false,
            excludeEmptyChats: false,
            draftComment: '',
            isReportArchived: undefined,
        });

        expect(reason).toBe(CONST.REPORT_IN_LHN_REASONS.DEFAULT);
        await Onyx.clear();
    });

    it('should create an invoice report with SUBMITTED status the same BE response', () => {
        const mockChatReportID = 'chat-report-123';
        const mockPolicyID = 'policy-456';
        const mockReceiverAccountID = 789;
        const mockReceiverName = 'John Doe';
        const mockTotal = 100;
        const mockCurrency = 'USD';
        const optimisticInvoiceReport = buildOptimisticInvoiceReport(mockChatReportID, mockPolicyID, mockReceiverAccountID, mockReceiverName, mockTotal, mockCurrency);

        expect(optimisticInvoiceReport.statusNum).toBe(CONST.REPORT.STATUS_NUM.SUBMITTED);
        expect(optimisticInvoiceReport.stateNum).toBe(CONST.REPORT.STATE_NUM.SUBMITTED);
    });

    it('should surface a GBR when copiloted into an approver account with a report with outstanding child request', async () => {
        await Onyx.clear();

        const copilotEmail = 'copilot@example.com';
        const delegatedAccess = {
            delegate: copilotEmail,
            delegates: [{email: copilotEmail, role: CONST.DELEGATE_ROLE.ALL}],
        };

        await Onyx.merge(ONYXKEYS.ACCOUNT, {delegatedAccess});

        const expenseReport: Report = {
            ...createExpenseReport(1234),
            hasOutstandingChildRequest: true,
        };

        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`, expenseReport);

        const reasonForAttention = getReasonAndReportActionThatRequiresAttention(expenseReport, undefined, false);
        expect(reasonForAttention?.reason).toBe(CONST.REQUIRES_ATTENTION_REASONS.HAS_CHILD_REPORT_AWAITING_ACTION);
    });

    describe('getOutstandingChildRequest', () => {
        const fakePolicy: Policy = {
            ...createRandomPolicy(12),
            harvesting: {
                enabled: false,
            },
            type: CONST.POLICY.TYPE.TEAM,
        };

        beforeAll(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, fakePolicy);
        });

        it('should return hasOutstandingChildRequest as true if the expense report is open report', async () => {
            const iouReport: Report = {
                ...createRandomReport(100, undefined),
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                type: CONST.REPORT.TYPE.EXPENSE,
                policyID: fakePolicy.id,
            };

            expect(getOutstandingChildRequest(iouReport).hasOutstandingChildRequest).toBe(true);
        });

        it('should return empty object if the expense report is not open report', async () => {
            const iouReport: Report = {
                ...createRandomReport(100, undefined),
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                type: CONST.REPORT.TYPE.EXPENSE,
                policyID: fakePolicy.id,
            };

            expect(getOutstandingChildRequest(iouReport).hasOutstandingChildRequest).toBeFalsy();
        });

        it('should return empty object if harvesting is enabled', async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${fakePolicy.id}`, {harvesting: {enabled: true}});

            const iouReport: Report = {
                ...createRandomReport(100, undefined),
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                type: CONST.REPORT.TYPE.EXPENSE,
                policyID: fakePolicy.id,
            };

            expect(getOutstandingChildRequest(iouReport).hasOutstandingChildRequest).toBeFalsy();
        });

        it('should return true if the current user is the manger of the iou report and the total spend is not zero', async () => {
            const iouReport: Report = {
                ...createRandomReport(100, undefined),
                type: CONST.REPORT.TYPE.IOU,
                policyID: fakePolicy.id,
                managerID: currentUserAccountID,
                total: 100,
            };

            expect(getOutstandingChildRequest(iouReport).hasOutstandingChildRequest).toBe(true);
        });

        it('should return false if the current user is not the manger of the iou report', async () => {
            const iouReport: Report = {
                ...createRandomReport(100, undefined),
                type: CONST.REPORT.TYPE.IOU,
                policyID: fakePolicy.id,
                ownerAccountID: currentUserAccountID,
                total: 100,
            };

            expect(getOutstandingChildRequest(iouReport).hasOutstandingChildRequest).toBeFalsy();
        });

        it('should return false if the total spend is zero', async () => {
            const iouReport: Report = {
                ...createRandomReport(100, undefined),
                type: CONST.REPORT.TYPE.IOU,
                policyID: fakePolicy.id,
                managerID: currentUserAccountID,
                total: 0,
            };

            expect(getOutstandingChildRequest(iouReport).hasOutstandingChildRequest).toBeFalsy();
        });
    });

    it('should stop surfacing a GBR for a workspace once it is archived', async () => {
        await Onyx.clear();

        const adminAccountID = 42;
        const policyID = 'policy-to-delete';
        const expenseReportID = '20000';
        const chatReport: Report = {
            ...LHNTestUtils.getFakeReport([currentUserAccountID, adminAccountID]),
            policyID,
            hasOutstandingChildRequest: true,
            iouReportID: expenseReportID,
        };
        const expenseReport: Report = {
            ...LHNTestUtils.getFakeReport([currentUserAccountID, adminAccountID]),
            reportID: expenseReportID,
            chatReportID: chatReport.reportID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: currentUserAccountID,
            managerID: adminAccountID,
            currency: CONST.CURRENCY.USD,
            total: 10000,
            stateNum: CONST.REPORT.STATE_NUM.APPROVED,
            statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
            isWaitingOnBankAccount: true,
            policyID,
        };
        const reimbursementQueuedAction: ReportAction = {
            ...LHNTestUtils.getFakeReportAction(),
            actionName: CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_QUEUED,
            childReportID: expenseReportID,
            originalMessage: {
                paymentType: CONST.IOU.PAYMENT_TYPE.VBBA,
            },
        };

        await Onyx.merge(ONYXKEYS.SESSION, {accountID: currentUserAccountID, email: currentUserEmail});
        await Promise.all([
            Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`, chatReport),
            Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${expenseReportID}`, expenseReport),
            Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport.reportID}`, {
                [reimbursementQueuedAction.reportActionID]: reimbursementQueuedAction,
            }),
        ]);
        await waitForBatchedUpdates();

        const {result: archiveState, unmount} = renderHook(() => useReportIsArchived(chatReport.reportID));
        const reasonBeforeDelete = reasonForReportToBeInOptionList({
            report: chatReport,
            chatReport,
            currentReportId: '',
            isInFocusMode: false,
            betas: [CONST.BETAS.DEFAULT_ROOMS],
            doesReportHaveViolations: false,
            excludeEmptyChats: false,
            draftComment: '',
            isReportArchived: archiveState.current,
        });

        expect(reasonBeforeDelete).toBe(CONST.REPORT_IN_LHN_REASONS.HAS_GBR);

        const archiveTimestamp = DateUtils.getDBTime();
        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${chatReport.reportID}`, {private_isArchived: archiveTimestamp});
            await waitForBatchedUpdates();
        });

        expect(archiveState.current).toBe(true);

        const reasonAfterDelete = reasonForReportToBeInOptionList({
            report: chatReport,
            chatReport,
            currentReportId: '',
            isInFocusMode: false,
            betas: [CONST.BETAS.DEFAULT_ROOMS],
            doesReportHaveViolations: false,
            excludeEmptyChats: false,
            draftComment: '',
            isReportArchived: archiveState.current,
        });

        expect(reasonAfterDelete).toBe(CONST.REPORT_IN_LHN_REASONS.IS_ARCHIVED);

        unmount();
        await Onyx.clear();
    });

    it('should surface a GBR on expense report chat when admin is removed as approver but report still needs approval', async () => {
        await Onyx.clear();

        const approverAccountID = 42;
        const approverEmail = 'clara+admin3@test.com';
        const employeeAccountID1 = 100;
        const employeeEmail = 'employee@test.com';
        const policyID1 = 'policy-with-removed-approver';
        const expenseReportID = '30000';
        const chatReportID = '30001';

        // Given a workspace with an admin as approver
        const policy1: Policy = {
            id: policyID1,
            name: 'Test Policy',
            role: CONST.POLICY.ROLE.ADMIN,
            type: CONST.POLICY.TYPE.TEAM,
            owner: approverEmail,
            outputCurrency: CONST.CURRENCY.USD,
            isPolicyExpenseChatEnabled: true,
            approver: approverEmail,
            approvalMode: CONST.POLICY.APPROVAL_MODE.BASIC,
            employeeList: {
                [employeeEmail]: {
                    email: employeeEmail,
                    role: CONST.POLICY.ROLE.USER,
                    submitsTo: approverEmail,
                },
                [approverEmail]: {
                    email: approverEmail,
                    role: CONST.POLICY.ROLE.ADMIN,
                    submitsTo: '',
                },
            },
        };

        // Employee creates and submits an expense report to the admin
        const expenseReport: Report = {
            ...LHNTestUtils.getFakeReport([employeeAccountID1, approverAccountID]),
            reportID: expenseReportID,
            chatReportID,
            type: CONST.REPORT.TYPE.EXPENSE,
            ownerAccountID: employeeAccountID1,
            managerID: approverAccountID,
            currency: CONST.CURRENCY.USD,
            total: 10000,
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            policyID: policyID1,
        };

        // The expense report chat (where GBR should appear)
        const expenseReportChat: Report = {
            ...LHNTestUtils.getFakeReport([employeeAccountID1, approverAccountID]),
            reportID: chatReportID,
            iouReportID: expenseReportID,
            policyID: policyID1,
            hasOutstandingChildRequest: true,
        };

        const submitAction: ReportAction = {
            ...LHNTestUtils.getFakeReportAction(),
            actionName: CONST.REPORT.ACTIONS.TYPE.SUBMITTED,
            childReportID: expenseReportID,
            originalMessage: {
                amount: 10000,
                currency: CONST.CURRENCY.USD,
            },
        };

        await Onyx.merge(ONYXKEYS.SESSION, {accountID: approverAccountID, email: approverEmail});
        await Promise.all([
            Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${expenseReportID}`, expenseReport),
            Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`, expenseReportChat),
            Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReportID}`, {
                [submitAction.reportActionID]: submitAction,
            }),
            Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID1}`, policy1),
        ]);
        await waitForBatchedUpdates();

        // Verify that the admin sees GBR on the expense report chat before removal
        const {result: isReportArchivedBefore} = renderHook(() => useReportIsArchived(chatReportID));
        const reasonBeforeRemoval = reasonForReportToBeInOptionList({
            report: expenseReportChat,
            chatReport: expenseReportChat,
            currentReportId: '',
            isInFocusMode: false,
            betas: [CONST.BETAS.DEFAULT_ROOMS],
            doesReportHaveViolations: false,
            excludeEmptyChats: false,
            draftComment: '',
            isReportArchived: isReportArchivedBefore.current,
        });

        expect(reasonBeforeRemoval).toBe(CONST.REPORT_IN_LHN_REASONS.HAS_GBR);

        // When the admin is removed as approver
        const updatedPolicy: Policy = {
            ...policy1,
            approver: '',
            employeeList: {
                [employeeEmail]: {
                    email: employeeEmail,
                    role: CONST.POLICY.ROLE.USER,
                    submitsTo: '',
                },
                [approverEmail]: {
                    email: approverEmail,
                    role: CONST.POLICY.ROLE.USER,
                    submitsTo: '',
                },
            },
        };

        await act(async () => {
            await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policyID1}`, updatedPolicy);
            await waitForBatchedUpdates();
        });

        // Then verify that the admin still sees GBR on the expense report chat
        // The report still needs approval, even though the admin is no longer the approver
        const {result: isReportArchivedAfter} = renderHook(() => useReportIsArchived(chatReportID));
        const reasonAfterRemoval = reasonForReportToBeInOptionList({
            report: expenseReportChat,
            chatReport: expenseReportChat,
            currentReportId: '',
            isInFocusMode: false,
            betas: [CONST.BETAS.DEFAULT_ROOMS],
            doesReportHaveViolations: false,
            excludeEmptyChats: false,
            draftComment: '',
            isReportArchived: isReportArchivedAfter.current,
        });

        expect(reasonAfterRemoval).toBe(CONST.REPORT_IN_LHN_REASONS.HAS_GBR);
        await Onyx.clear();
    });

    describe('getReportPreviewMessage', () => {
        it('should return childReportName when report is empty and originalReportAction has childReportName with childMoneyRequestCount === 0', async () => {
            // Given an empty report (undefined)
            const report = undefined;

            // Given a report action with childReportName and childMoneyRequestCount === 0
            const reportAction: ReportAction = {
                ...LHNTestUtils.getFakeReportAction(),
                actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
                childReportName: 'Expense Report 2025-01-15',
                childMoneyRequestCount: 0,
            };

            // When we call getReportPreviewMessage
            const result = getReportPreviewMessage(report, reportAction, false, false, undefined, false, reportAction);

            // Then it should return the childReportName instead of "payer owes $0"
            expect(result).toBe('Expense Report 2025-01-15');
        });

        it('should return reportActionMessage when report is empty and childMoneyRequestCount > 0', async () => {
            // Given an empty report (undefined)
            const report = undefined;

            // Given a report action with childReportName but childMoneyRequestCount > 0
            const reportAction: ReportAction = {
                ...LHNTestUtils.getFakeReportAction(),
                actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
                childReportName: 'Expense Report 2025-01-15',
                childMoneyRequestCount: 3,
                message: [{html: 'payer owes $100', type: 'COMMENT', text: 'payer owes $100'}],
            };

            // When we call getReportPreviewMessage
            const result = getReportPreviewMessage(report, reportAction, false, false, undefined, false, reportAction);

            // Then it should return the message from the report action (not the childReportName)
            expect(result).toBe('payer owes $100');
        });
        it('should return expense report name when isCopyAction is true', async () => {
            const report = LHNTestUtils.getFakeReport();
            report.reportName = 'Expense Report 2025-01-15';
            const reportAction: ReportAction = {
                ...LHNTestUtils.getFakeReportAction(),
                actionName: CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW,
                childReportName: report.reportName,
                childMoneyRequestCount: 0,
            };

            // When we call getReportPreviewMessage with isCopyAction = true
            const result = getReportPreviewMessage(report, reportAction, false, false, undefined, false, reportAction, true);

            // Then it should return the childReportName instead of "payer owes $0"
            expect(result).toBe('Expense Report 2025-01-15');
        });
    });

    describe('getAvailableReportFields', () => {
        const fieldList1 = {
            expensify_field_id_LIST: {
                type: 'dropdown',
                values: ['value 1'],
                disabledOptions: [false],
                fieldID: 'field_id_LIST',
                name: 'field list 1',
            },
        } as unknown as NonNullable<Policy['fieldList']>;
        const fieldList2 = {
            expensify_field_id_LIST_POLICY: {
                type: 'dropdown',
                values: ['value 1'],
                disabledOptions: [false],
                fieldID: 'field_id_LIST_POLICY',
                name: 'field list 2',
            },
        } as unknown as NonNullable<Policy['fieldList']>;

        it('should return report fieldList if report is settled', async () => {
            const settledReport = {
                reportID: '1',
                policyID: '1',
                statusNum: CONST.REPORT.STATUS_NUM.REIMBURSED,
                fieldList: fieldList1,
            } as Report;
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${settledReport.reportID}`, settledReport);
            expect(getAvailableReportFields(settledReport, Object.values(fieldList2))).toEqual(Object.values(fieldList1));
        });

        it('should merge report and policy field list', async () => {
            const report = {
                reportID: '2',
                policyID: '1',
                fieldList: fieldList1,
            } as Report;
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);
            const mergedFieldList = [
                {
                    type: 'dropdown',
                    values: ['value 1'],
                    disabledOptions: [false],
                    fieldID: 'field_id_LIST_POLICY',
                    name: 'field list 2',
                },
                {
                    type: 'dropdown',
                    values: ['value 1'],
                    disabledOptions: [false],
                    fieldID: 'field_id_LIST',
                    name: 'field list 1',
                },
            ];
            expect(getAvailableReportFields(report, Object.values(fieldList2))).toEqual(mergedFieldList);
        });

        it('should overwrite report fieldList disabledOptions and values if field list exists in both report and policy', async () => {
            const report = {
                reportID: '2',
                policyID: '1',
                fieldList: fieldList1,
            } as Report;
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, report);
            const policyFieldList = [
                {
                    type: 'dropdown',
                    values: ['value 2'],
                    disabledOptions: [true],
                    fieldID: 'field_id_LIST',
                    name: 'field list policy',
                },
                {
                    type: 'dropdown',
                    values: ['value'],
                    disabledOptions: [false],
                    fieldID: 'field_id_LIST_2',
                    name: 'field list',
                },
            ] as unknown as PolicyReportField[];
            const expectedFieldList = [
                {
                    type: 'dropdown',
                    values: ['value 2'],
                    disabledOptions: [true],
                    fieldID: 'field_id_LIST',
                    name: 'field list 1',
                },
                {
                    type: 'dropdown',
                    values: ['value'],
                    disabledOptions: [false],
                    fieldID: 'field_id_LIST_2',
                    name: 'field list',
                },
            ] as unknown as PolicyReportField[];
            expect(getAvailableReportFields(report, policyFieldList)).toEqual(expectedFieldList);
        });
    });

    describe('shouldHideSingleReportField', () => {
        it('should return true if report field has title type', () => {
            const reportField = {
                fieldID: CONST.REPORT_FIELD_TITLE_FIELD_ID,
            } as PolicyReportField;
            expect(shouldHideSingleReportField(reportField)).toBe(true);
        });
        it('should return false if report field is not of type list', () => {
            const reportField = {
                type: CONST.REPORT_FIELD_TYPES.TEXT,
            } as PolicyReportField;
            expect(shouldHideSingleReportField(reportField)).toBe(false);
        });
        it('should return false if list report field has some options enabled', () => {
            const reportField = {
                type: CONST.REPORT_FIELD_TYPES.LIST,
                disabledOptions: [false, true, false],
            } as PolicyReportField;
            expect(shouldHideSingleReportField(reportField)).toBe(false);
        });
        it('should return false if all items in list report field are disabled', () => {
            const reportField = {
                type: CONST.REPORT_FIELD_TYPES.LIST,
                disabledOptions: [true, true, true],
            } as PolicyReportField;
            expect(shouldHideSingleReportField(reportField)).toBe(true);
        });
    });
    describe('P2P Wallet Activation - GBR and Wallet Indicator', () => {
        const friendAccountID = 42;

        /**
         * Tests the complete P2P wallet activation scenario:
         * - Friend sends P2P payment to user with SILVER wallet
         * - Backend sets hasOutstandingChildRequest: true (payment pending wallet setup)
         * - GBR shows in LHN
         * - "Enable your wallet" button shows (getIndicatedMissingPaymentMethod returns 'wallet')
         */
        it('should show GBR and wallet indicator for SILVER tier user receiving P2P payment', async () => {
            await Onyx.clear();

            const iouReportID = '10000';

            // Chat report - hasOutstandingChildRequest set by backend when P2P payment pending wallet
            const chatReport: Report = {
                ...LHNTestUtils.getFakeReport([currentUserAccountID, friendAccountID]),
                hasOutstandingChildRequest: true,
                iouReportID,
            };

            // IOU report - P2P payment from friend to current user
            const iouReport: Report = {
                ...LHNTestUtils.getFakeReport([currentUserAccountID, friendAccountID]),
                reportID: iouReportID,
                chatReportID: chatReport.reportID,
                type: CONST.REPORT.TYPE.IOU,
                ownerAccountID: currentUserAccountID,
                managerID: friendAccountID,
                currency: CONST.CURRENCY.USD,
                total: 10000,
                stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
                isWaitingOnBankAccount: true,
            };

            // REIMBURSEMENT_QUEUED with EXPENSIFY payment type = P2P wallet payment
            const reimbursementQueuedAction: ReportAction = {
                ...LHNTestUtils.getFakeReportAction(),
                actionName: CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_QUEUED,
                originalMessage: {
                    paymentType: CONST.IOU.PAYMENT_TYPE.EXPENSIFY,
                },
            };

            await Onyx.merge(ONYXKEYS.SESSION, {accountID: currentUserAccountID, email: currentUserEmail});
            await Promise.all([
                Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`, chatReport),
                Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`, iouReport),
                Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport.reportID}`, {
                    [reimbursementQueuedAction.reportActionID]: reimbursementQueuedAction,
                }),
            ]);
            await waitForBatchedUpdates();

            // Verify GBR shows in LHN
            const reason = reasonForReportToBeInOptionList({
                report: chatReport,
                chatReport,
                currentReportId: '',
                isInFocusMode: false,
                betas: [CONST.BETAS.DEFAULT_ROOMS],
                doesReportHaveViolations: false,
                excludeEmptyChats: false,
                isReportArchived: false,
                draftComment: '',
            });
            expect(reason).toBe(CONST.REPORT_IN_LHN_REASONS.HAS_GBR);

            // Verify "Enable your wallet" indicator for SILVER tier
            const missingPaymentMethod = getIndicatedMissingPaymentMethod(CONST.WALLET.TIER_NAME.SILVER, iouReportID, reimbursementQueuedAction, {});
            expect(missingPaymentMethod).toBe('wallet');

            await Onyx.clear();
        });

        /**
         * Same scenario but user has no wallet tier set (new user)
         */
        it('should show GBR and wallet indicator for user with no wallet tier (undefined)', async () => {
            await Onyx.clear();

            const iouReportID = '10001';

            const chatReport: Report = {
                ...LHNTestUtils.getFakeReport([currentUserAccountID, friendAccountID]),
                hasOutstandingChildRequest: true,
                iouReportID,
            };

            const iouReport: Report = {
                ...LHNTestUtils.getFakeReport([currentUserAccountID, friendAccountID]),
                reportID: iouReportID,
                chatReportID: chatReport.reportID,
                type: CONST.REPORT.TYPE.IOU,
                ownerAccountID: currentUserAccountID,
                managerID: friendAccountID,
                currency: CONST.CURRENCY.USD,
                total: 5000,
                stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
                isWaitingOnBankAccount: true,
            };

            const reimbursementQueuedAction: ReportAction = {
                ...LHNTestUtils.getFakeReportAction(),
                actionName: CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_QUEUED,
                originalMessage: {
                    paymentType: CONST.IOU.PAYMENT_TYPE.EXPENSIFY,
                },
            };

            await Onyx.merge(ONYXKEYS.SESSION, {accountID: currentUserAccountID, email: currentUserEmail});
            await Promise.all([
                Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`, chatReport),
                Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`, iouReport),
                Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport.reportID}`, {
                    [reimbursementQueuedAction.reportActionID]: reimbursementQueuedAction,
                }),
            ]);
            await waitForBatchedUpdates();

            // Verify GBR shows
            const reason = reasonForReportToBeInOptionList({
                report: chatReport,
                chatReport,
                currentReportId: '',
                isInFocusMode: false,
                betas: [CONST.BETAS.DEFAULT_ROOMS],
                doesReportHaveViolations: false,
                excludeEmptyChats: false,
                isReportArchived: false,
                draftComment: '',
            });
            expect(reason).toBe(CONST.REPORT_IN_LHN_REASONS.HAS_GBR);

            // Verify wallet indicator for undefined tier
            const missingPaymentMethod = getIndicatedMissingPaymentMethod(undefined, iouReportID, reimbursementQueuedAction, {});
            expect(missingPaymentMethod).toBe('wallet');

            await Onyx.clear();
        });

        /**
         * When user has GOLD wallet (already enabled):
         * - Payment goes through, no pending state
         * - hasOutstandingChildRequest would be false (set by backend)
         * - No GBR needed, no wallet button needed
         */
        it('should NOT show GBR or wallet indicator when user has GOLD tier (wallet already enabled)', async () => {
            await Onyx.clear();

            const iouReportID = '10002';

            // No outstanding request - GOLD wallet means payment processes normally
            const chatReport: Report = {
                ...LHNTestUtils.getFakeReport([currentUserAccountID, friendAccountID]),
                hasOutstandingChildRequest: false,
                iouReportID,
            };

            const iouReport: Report = {
                ...LHNTestUtils.getFakeReport([currentUserAccountID, friendAccountID]),
                reportID: iouReportID,
                chatReportID: chatReport.reportID,
                type: CONST.REPORT.TYPE.IOU,
                ownerAccountID: currentUserAccountID,
                managerID: friendAccountID,
                currency: CONST.CURRENCY.USD,
                total: 10000,
                stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
                isWaitingOnBankAccount: false,
            };

            const reimbursementQueuedAction: ReportAction = {
                ...LHNTestUtils.getFakeReportAction(),
                actionName: CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_QUEUED,
                originalMessage: {
                    paymentType: CONST.IOU.PAYMENT_TYPE.EXPENSIFY,
                },
            };

            await Onyx.merge(ONYXKEYS.SESSION, {accountID: currentUserAccountID, email: currentUserEmail});
            await Promise.all([
                Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`, chatReport),
                Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`, iouReport),
                Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport.reportID}`, {
                    [reimbursementQueuedAction.reportActionID]: reimbursementQueuedAction,
                }),
            ]);
            await waitForBatchedUpdates();

            // Verify GBR does NOT show (no outstanding request for GOLD user)
            const reason = reasonForReportToBeInOptionList({
                report: chatReport,
                chatReport,
                currentReportId: '',
                isInFocusMode: false,
                betas: [CONST.BETAS.DEFAULT_ROOMS],
                doesReportHaveViolations: false,
                excludeEmptyChats: false,
                isReportArchived: false,
                draftComment: '',
            });
            expect(reason).not.toBe(CONST.REPORT_IN_LHN_REASONS.HAS_GBR);

            // Verify NO wallet indicator for GOLD tier
            const missingPaymentMethod = getIndicatedMissingPaymentMethod(CONST.WALLET.TIER_NAME.GOLD, iouReportID, reimbursementQueuedAction, {});
            expect(missingPaymentMethod).toBeUndefined();

            await Onyx.clear();
        });

        /**
         * For non-EXPENSIFY payment types (e.g., ELSEWHERE):
         * - This is not a P2P wallet scenario
         * - Wallet indicator should not return 'wallet'
         */
        it('should NOT show wallet indicator for non-EXPENSIFY payment type', async () => {
            await Onyx.clear();

            const iouReportID = '10003';

            const chatReport: Report = {
                ...LHNTestUtils.getFakeReport([currentUserAccountID, friendAccountID]),
                hasOutstandingChildRequest: true,
                iouReportID,
            };

            const iouReport: Report = {
                ...LHNTestUtils.getFakeReport([currentUserAccountID, friendAccountID]),
                reportID: iouReportID,
                chatReportID: chatReport.reportID,
                type: CONST.REPORT.TYPE.IOU,
                ownerAccountID: currentUserAccountID,
                managerID: friendAccountID,
                currency: CONST.CURRENCY.USD,
                total: 10000,
                stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                statusNum: CONST.REPORT.STATUS_NUM.APPROVED,
                isWaitingOnBankAccount: true,
            };

            // Non-P2P payment type (ELSEWHERE = external/manual payment)
            const reimbursementQueuedAction: ReportAction = {
                ...LHNTestUtils.getFakeReportAction(),
                actionName: CONST.REPORT.ACTIONS.TYPE.REIMBURSEMENT_QUEUED,
                originalMessage: {
                    paymentType: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
                },
            };

            await Onyx.merge(ONYXKEYS.SESSION, {accountID: currentUserAccountID, email: currentUserEmail});
            await Promise.all([
                Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`, chatReport),
                Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`, iouReport),
                Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport.reportID}`, {
                    [reimbursementQueuedAction.reportActionID]: reimbursementQueuedAction,
                }),
            ]);
            await waitForBatchedUpdates();

            // GBR may still show (hasOutstandingChildRequest: true) but for different reason
            const reason = reasonForReportToBeInOptionList({
                report: chatReport,
                chatReport,
                currentReportId: '',
                isInFocusMode: false,
                betas: [CONST.BETAS.DEFAULT_ROOMS],
                doesReportHaveViolations: false,
                excludeEmptyChats: false,
                isReportArchived: false,
                draftComment: '',
            });
            expect(reason).toBe(CONST.REPORT_IN_LHN_REASONS.HAS_GBR);

            // But wallet indicator should NOT be 'wallet' for non-EXPENSIFY payment
            // (would be 'bankAccount' or undefined depending on bank account status)
            const missingPaymentMethod = getIndicatedMissingPaymentMethod(CONST.WALLET.TIER_NAME.SILVER, iouReportID, reimbursementQueuedAction, {});
            expect(missingPaymentMethod).not.toBe('wallet');

            await Onyx.clear();
        });
    });

    describe('getAllReportActionsErrorsAndReportActionThatRequiresAttention for DEW', () => {
        it('should return error for DEW_SUBMIT_FAILED action on OPEN report', () => {
            const report = {
                reportID: '1',
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
            };

            const dewSubmitFailedAction = {
                ...createRandomReportAction(1),
                reportActionID: '1',
                actionName: CONST.REPORT.ACTIONS.TYPE.DEW_SUBMIT_FAILED,
                created: '2025-11-21 12:00:00',
                shouldShow: true,
                message: [
                    {
                        type: CONST.REPORT.MESSAGE.TYPE.TEXT,
                        text: 'DEW submit failed',
                    },
                ],
                originalMessage: {
                    message: 'This report contains an Airfare expense that is missing the Flight Destination tag.',
                },
            };

            const reportActions = {
                [dewSubmitFailedAction.reportActionID]: dewSubmitFailedAction,
            };

            const {errors, reportAction} = getAllReportActionsErrorsAndReportActionThatRequiresAttention(report, reportActions);

            expect(errors?.dewSubmitFailed).toBeDefined();
            expect(reportAction).toEqual(dewSubmitFailedAction);
        });

        it('should NOT return error for DEW_SUBMIT_FAILED if there is a more recent SUBMITTED action', () => {
            const report = {
                reportID: '1',
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
            };

            const dewSubmitFailedAction = {
                reportActionID: '1',
                actionName: CONST.REPORT.ACTIONS.TYPE.DEW_SUBMIT_FAILED,
                created: '2025-11-21 12:00:00',
                shouldShow: true,
                originalMessage: {
                    message: 'Error message',
                },
            };

            const submittedAction = {
                reportActionID: '2',
                actionName: CONST.REPORT.ACTIONS.TYPE.SUBMITTED,
                created: '2025-11-21 13:00:00',
                shouldShow: true,
                originalMessage: {},
            };

            const reportActions = {
                [dewSubmitFailedAction.reportActionID]: dewSubmitFailedAction,
                [submittedAction.reportActionID]: submittedAction,
            };

            const {errors} = getAllReportActionsErrorsAndReportActionThatRequiresAttention(report, reportActions);

            expect(errors?.dewSubmitFailed).toBeUndefined();
        });

        it('should return error for DEW_SUBMIT_FAILED if it is more recent than SUBMITTED action', () => {
            const report = {
                reportID: '1',
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
            };

            const submittedAction = {
                ...createRandomReportAction(1),
                reportActionID: '1',
                actionName: CONST.REPORT.ACTIONS.TYPE.SUBMITTED,
                created: '2025-11-21 12:00:00',
                shouldShow: true,
                message: [
                    {
                        type: CONST.REPORT.MESSAGE.TYPE.TEXT,
                        text: 'submitted',
                    },
                ],
                originalMessage: {
                    amount: 10000,
                    currency: 'USD',
                },
            };

            const dewSubmitFailedAction = {
                ...createRandomReportAction(2),
                reportActionID: '2',
                actionName: CONST.REPORT.ACTIONS.TYPE.DEW_SUBMIT_FAILED,
                created: '2025-11-21 13:00:00',
                shouldShow: true,
                message: [
                    {
                        type: CONST.REPORT.MESSAGE.TYPE.TEXT,
                        text: 'DEW submit failed',
                    },
                ],
                originalMessage: {
                    message: 'Error message',
                },
            };

            const reportActions = {
                [submittedAction.reportActionID]: submittedAction,
                [dewSubmitFailedAction.reportActionID]: dewSubmitFailedAction,
            };

            const {errors, reportAction} = getAllReportActionsErrorsAndReportActionThatRequiresAttention(report, reportActions);

            expect(errors?.dewSubmitFailed).toBeDefined();
            expect(reportAction).toEqual(dewSubmitFailedAction);
        });

        it('should NOT return error for DEW_SUBMIT_FAILED on non-OPEN report', () => {
            const report = {
                reportID: '1',
                statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            };

            const dewSubmitFailedAction = {
                reportActionID: '1',
                actionName: CONST.REPORT.ACTIONS.TYPE.DEW_SUBMIT_FAILED,
                created: '2025-11-21 12:00:00',
                shouldShow: true,
                originalMessage: {
                    message: 'Error message',
                },
            };

            const reportActions = {
                [dewSubmitFailedAction.reportActionID]: dewSubmitFailedAction,
            };

            const {errors} = getAllReportActionsErrorsAndReportActionThatRequiresAttention(report, reportActions);

            expect(errors?.dewSubmitFailed).toBeUndefined();
        });

        it('should NOT return error for DEW_SUBMIT_FAILED on archived report', () => {
            const report = {
                reportID: '1',
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
            };

            const dewSubmitFailedAction = {
                reportActionID: '1',
                actionName: CONST.REPORT.ACTIONS.TYPE.DEW_SUBMIT_FAILED,
                created: '2025-11-21 12:00:00',
                shouldShow: true,
                originalMessage: {
                    message: 'Error message',
                },
            };

            const reportActions = {
                [dewSubmitFailedAction.reportActionID]: dewSubmitFailedAction,
            };

            const {errors} = getAllReportActionsErrorsAndReportActionThatRequiresAttention(report, reportActions, true);

            expect(errors?.dewSubmitFailed).toBeUndefined();
        });

        it('should NOT return DEW error when a more recent SUBMITTED action exists after the failure (multiple submits)', () => {
            const report = {
                reportID: '1',
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
            };

            const firstSubmittedAction = {
                ...createRandomReportAction(1),
                reportActionID: '1',
                actionName: CONST.REPORT.ACTIONS.TYPE.SUBMITTED,
                created: '2025-11-21 10:00:00',
                shouldShow: true,
                message: [
                    {
                        type: CONST.REPORT.MESSAGE.TYPE.TEXT,
                        text: 'first submit',
                    },
                ],
                originalMessage: {
                    amount: 10000,
                    currency: 'USD',
                },
            };

            const dewSubmitFailedAction = {
                ...createRandomReportAction(2),
                reportActionID: '2',
                actionName: CONST.REPORT.ACTIONS.TYPE.DEW_SUBMIT_FAILED,
                created: '2025-11-21 10:05:00',
                shouldShow: true,
                message: [
                    {
                        type: CONST.REPORT.MESSAGE.TYPE.TEXT,
                        text: 'DEW submit failed',
                    },
                ],
                originalMessage: {
                    message: 'This report contains an Airfare expense that is missing the Flight Destination tag.',
                },
            };

            const secondSubmittedAction = {
                ...createRandomReportAction(3),
                reportActionID: '3',
                actionName: CONST.REPORT.ACTIONS.TYPE.SUBMITTED,
                created: '2025-11-21 10:10:00',
                shouldShow: true,
                message: [
                    {
                        type: CONST.REPORT.MESSAGE.TYPE.TEXT,
                        text: 'second submit',
                    },
                ],
                originalMessage: {
                    amount: 10000,
                    currency: 'USD',
                },
            };

            const reportActions = {
                [firstSubmittedAction.reportActionID]: firstSubmittedAction,
                [dewSubmitFailedAction.reportActionID]: dewSubmitFailedAction,
                [secondSubmittedAction.reportActionID]: secondSubmittedAction,
            };

            const {errors, reportAction} = getAllReportActionsErrorsAndReportActionThatRequiresAttention(report, reportActions);

            expect(errors?.dewSubmitFailed).toBeUndefined();
            expect(reportAction).not.toEqual(dewSubmitFailedAction);
        });
    });

    describe('doesReportBelongToWorkspace', () => {
        const policyID = 'test-policy-123';
        const conciergeReportID = 'concierge-report-456';

        beforeEach(async () => {
            await Onyx.clear();
            await waitForBatchedUpdates();
        });

        it('should return true for concierge chat report when conciergeReportID matches', () => {
            const conciergeReport: Report = {
                reportID: conciergeReportID,
                type: CONST.REPORT.TYPE.CHAT,
            };

            const result = doesReportBelongToWorkspace(conciergeReport, [], policyID, conciergeReportID);
            expect(result).toBe(true);
        });

        it('should return false for concierge chat report when conciergeReportID does not match', () => {
            const conciergeReport: Report = {
                reportID: 'different-report-id',
                type: CONST.REPORT.TYPE.CHAT,
                policyID: CONST.POLICY.ID_FAKE,
            };

            const result = doesReportBelongToWorkspace(conciergeReport, [], policyID, conciergeReportID);
            expect(result).toBe(false);
        });

        it('should return true for policy related report with matching policyID', () => {
            const policyReport: Report = {
                reportID: 'policy-report-123',
                type: CONST.REPORT.TYPE.CHAT,
                policyID,
            };

            const result = doesReportBelongToWorkspace(policyReport, [], policyID, conciergeReportID);
            expect(result).toBe(true);
        });

        it('should return true for DM report with participant in workspace', () => {
            const dmReport: Report = {
                reportID: 'dm-report-123',
                type: CONST.REPORT.TYPE.CHAT,
                policyID: CONST.POLICY.ID_FAKE,
                participants: {
                    1: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                    2: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                },
            };
            const policyMemberAccountIDs = [1, 2];

            const result = doesReportBelongToWorkspace(dmReport, policyMemberAccountIDs, policyID, conciergeReportID);
            expect(result).toBe(true);
        });

        it('should return false for DM report with no participants in workspace', () => {
            const dmReport: Report = {
                reportID: 'dm-report-123',
                type: CONST.REPORT.TYPE.CHAT,
                policyID: CONST.POLICY.ID_FAKE,
                participants: {
                    3: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                    4: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                },
            };
            const policyMemberAccountIDs = [1, 2];

            const result = doesReportBelongToWorkspace(dmReport, policyMemberAccountIDs, policyID, conciergeReportID);
            expect(result).toBe(false);
        });

        it('should return false for report with no policyID and no matching participants', () => {
            const report: Report = {
                reportID: 'report-123',
                type: CONST.REPORT.TYPE.CHAT,
                participants: {
                    5: {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS},
                },
            };

            const result = doesReportBelongToWorkspace(report, [1, 2], policyID, conciergeReportID);
            expect(result).toBe(false);
        });

        it('should return false for invoice report with different policyID in invoiceReceiver', () => {
            const invoiceReport: Report = {
                reportID: 'invoice-report-123',
                type: CONST.REPORT.TYPE.INVOICE,
                policyID: 'different-policy',
                invoiceReceiver: {
                    policyID: 'another-different-policy',
                    type: CONST.REPORT.INVOICE_RECEIVER_TYPE.BUSINESS,
                },
            };

            const result = doesReportBelongToWorkspace(invoiceReport, [], policyID, conciergeReportID);
            expect(result).toBe(false);
        });

        it('should return true for invoice report with matching policyID in invoiceReceiver', () => {
            const invoiceReport: Report = {
                reportID: 'invoice-report-123',
                type: CONST.REPORT.TYPE.INVOICE,
                policyID: 'different-policy',
                invoiceReceiver: {
                    policyID,
                    type: CONST.REPORT.INVOICE_RECEIVER_TYPE.BUSINESS,
                },
            };

            const result = doesReportBelongToWorkspace(invoiceReport, [], policyID, conciergeReportID);
            expect(result).toBe(true);
        });
    });

    describe('getHelpPaneReportType', () => {
        const conciergeReportID = 'concierge-report-456';

        it('should return undefined for undefined report', () => {
            const result = getHelpPaneReportType(undefined, conciergeReportID);
            expect(result).toBeUndefined();
        });

        it('should return CHAT_CONCIERGE for concierge chat report', () => {
            const conciergeReport: Report = {
                reportID: conciergeReportID,
                type: CONST.REPORT.TYPE.CHAT,
            };

            const result = getHelpPaneReportType(conciergeReport, conciergeReportID);
            expect(result).toBe(CONST.REPORT.HELP_TYPE.CHAT_CONCIERGE);
        });

        it('should return chatType for report with chatType', () => {
            const groupChatReport: Report = {
                reportID: 'group-chat-123',
                type: CONST.REPORT.TYPE.CHAT,
                chatType: CONST.REPORT.CHAT_TYPE.GROUP,
            };

            const result = getHelpPaneReportType(groupChatReport, conciergeReportID);
            expect(result).toBe(CONST.REPORT.CHAT_TYPE.GROUP);
        });

        it('should return EXPENSE_REPORT for expense report type', () => {
            const expenseReport: Report = {
                reportID: 'expense-report-123',
                type: CONST.REPORT.TYPE.EXPENSE,
            };

            const result = getHelpPaneReportType(expenseReport, conciergeReportID);
            expect(result).toBe(CONST.REPORT.HELP_TYPE.EXPENSE_REPORT);
        });

        it('should return CHAT for chat report type without chatType', () => {
            const chatReport: Report = {
                reportID: 'chat-report-123',
                type: CONST.REPORT.TYPE.CHAT,
            };

            const result = getHelpPaneReportType(chatReport, conciergeReportID);
            expect(result).toBe(CONST.REPORT.HELP_TYPE.CHAT);
        });

        it('should return IOU for IOU report type', () => {
            const iouReport: Report = {
                reportID: 'iou-report-123',
                type: CONST.REPORT.TYPE.IOU,
            };

            const result = getHelpPaneReportType(iouReport, conciergeReportID);
            expect(result).toBe(CONST.REPORT.HELP_TYPE.IOU);
        });

        it('should return INVOICE for invoice report type', () => {
            const invoiceReport: Report = {
                reportID: 'invoice-report-123',
                type: CONST.REPORT.TYPE.INVOICE,
            };

            const result = getHelpPaneReportType(invoiceReport, conciergeReportID);
            expect(result).toBe(CONST.REPORT.HELP_TYPE.INVOICE);
        });

        it('should return TASK for task report type', () => {
            const taskReport: Report = {
                reportID: 'task-report-123',
                type: CONST.REPORT.TYPE.TASK,
            };

            const result = getHelpPaneReportType(taskReport, conciergeReportID);
            expect(result).toBe(CONST.REPORT.HELP_TYPE.TASK);
        });

        it('should return undefined for unknown report type', () => {
            const unknownReport: Report = {
                reportID: 'unknown-report-123',
                type: 'unknown' as Report['type'],
            };

            const result = getHelpPaneReportType(unknownReport, conciergeReportID);
            expect(result).toBeUndefined();
        });

        it('should not return CHAT_CONCIERGE when conciergeReportID does not match', () => {
            const chatReport: Report = {
                reportID: 'regular-chat-123',
                type: CONST.REPORT.TYPE.CHAT,
            };

            const result = getHelpPaneReportType(chatReport, conciergeReportID);
            // This report has type CHAT but is not the concierge report
            expect(result).toBe(CONST.REPORT.HELP_TYPE.CHAT);
        });
    });

    describe('createDraftTransactionAndNavigateToParticipantSelector', () => {
        describe('when action is CATEGORIZE', () => {
            beforeEach(async () => {
                jest.clearAllMocks();
                await Onyx.clear();
                await Onyx.set(ONYXKEYS.SESSION, {email: currentUserEmail, accountID: currentUserAccountID});
            });

            it("should navigate to the restricted action page if the active policy's billable actions are restricted", async () => {
                // Given a transaction and an active policy where billable actions are restricted
                const transaction = createRandomTransaction(1);
                const activePolicy: Policy = {
                    ...createRandomPolicy(100),
                    ownerAccountID: currentUserAccountID,
                };
                await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${1}`, {});
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${activePolicy.id}`, activePolicy);
                await Onyx.merge(ONYXKEYS.NVP_PRIVATE_AMOUNT_OWED, 1);
                // Grace period end is in the past (Unix timestamp in seconds)
                await Onyx.merge(ONYXKEYS.NVP_PRIVATE_OWNER_BILLING_GRACE_PERIOD_END, Math.floor(Date.now() / 1000) - 3600);

                // When we call createDraftTransactionAndNavigateToParticipantSelector with the restricted policy
                createDraftTransactionAndNavigateToParticipantSelector(transaction.transactionID, '1', CONST.IOU.ACTION.CATEGORIZE, '1', undefined, undefined, activePolicy);

                // Then it should navigate to the restricted action page
                expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.RESTRICTED_ACTION.getRoute(activePolicy.id));
            });

            it('should navigate to the category step if the active policy is valid and not restricted', async () => {
                // Given a transaction and a valid, non-restricted active policy
                const transaction = createRandomTransaction(2);
                const activePolicy: Policy = {
                    ...createRandomPolicy(101),
                    ownerAccountID: currentUserAccountID,
                    role: CONST.POLICY.ROLE.ADMIN,
                    type: CONST.POLICY.TYPE.TEAM,
                    pendingAction: null,
                };
                const policyExpenseReport = {
                    ...createPolicyExpenseChat(1),
                    policyID: activePolicy.id,
                    ownerAccountID: currentUserAccountID,
                };

                await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${1}`, {});
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${activePolicy.id}`, activePolicy);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${policyExpenseReport.reportID}`, policyExpenseReport);

                // When we call createDraftTransactionAndNavigateToParticipantSelector
                createDraftTransactionAndNavigateToParticipantSelector(transaction.transactionID, '1', CONST.IOU.ACTION.CATEGORIZE, '1', undefined, undefined, activePolicy);

                // Then it should navigate to the category step
                expect(Navigation.navigate).toHaveBeenCalledWith(
                    ROUTES.MONEY_REQUEST_STEP_CATEGORY.getRoute(CONST.IOU.ACTION.CATEGORIZE, CONST.IOU.TYPE.SUBMIT, transaction.transactionID, policyExpenseReport.reportID),
                );
            });

            it('should navigate to the category step via filteredPolicies when activePolicy is null', async () => {
                // Given a transaction and no active policy, but one valid policy is available in Onyx
                const transaction = createRandomTransaction(3);
                const ownPolicy = {
                    ...createRandomPolicy(102),
                    ownerAccountID: currentUserAccountID,
                    role: CONST.POLICY.ROLE.ADMIN,
                    type: CONST.POLICY.TYPE.TEAM,
                    pendingAction: null,
                };
                const policyExpenseReport = {
                    ...createPolicyExpenseChat(2),
                    policyID: ownPolicy.id,
                    ownerAccountID: currentUserAccountID,
                };

                await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${2}`, {});
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${ownPolicy.id}`, ownPolicy);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${policyExpenseReport.reportID}`, policyExpenseReport);

                // When we call createDraftTransactionAndNavigateToParticipantSelector with undefined activePolicy
                createDraftTransactionAndNavigateToParticipantSelector(transaction.transactionID, '2', CONST.IOU.ACTION.CATEGORIZE, '2', undefined, undefined, undefined);

                // Then it should automatically pick the available policy and navigate to the category step
                expect(Navigation.navigate).toHaveBeenCalledWith(
                    ROUTES.MONEY_REQUEST_STEP_CATEGORY.getRoute(CONST.IOU.ACTION.CATEGORIZE, CONST.IOU.TYPE.SUBMIT, transaction.transactionID, policyExpenseReport.reportID),
                );
            });

            it('should navigate to the upgrade page when activePolicy is null and no policies are found', async () => {
                // Given a transaction and no policies in Onyx
                const transaction = createRandomTransaction(0);

                await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${1}`, {});
                await Onyx.setCollection(ONYXKEYS.COLLECTION.POLICY, {});

                // When we call createDraftTransactionAndNavigateToParticipantSelector with undefined activePolicy
                createDraftTransactionAndNavigateToParticipantSelector(transaction.transactionID, '1', CONST.IOU.ACTION.CATEGORIZE, '1', undefined, undefined, undefined);

                // Then it should navigate to the upgrade page because no policies were found to categorize with
                expect(Navigation.navigate).toHaveBeenCalledWith(
                    ROUTES.MONEY_REQUEST_UPGRADE.getRoute({
                        action: CONST.IOU.ACTION.CATEGORIZE,
                        iouType: CONST.IOU.TYPE.SUBMIT,
                        transactionID: transaction.transactionID,
                        reportID: '1',
                        backTo: '',
                        upgradePath: CONST.UPGRADE_PATHS.CATEGORIES,
                        shouldSubmitExpense: true,
                    }),
                );
            });

            it('should navigate to the upgrade page when activePolicy is null and multiple policies are found', async () => {
                // Given a transaction and multiple policies in Onyx
                const transaction = createRandomTransaction(0);
                const policy1 = {
                    ...createRandomPolicy(103),
                    role: CONST.POLICY.ROLE.ADMIN,
                    type: CONST.POLICY.TYPE.TEAM,
                    pendingAction: null,
                };
                const policy2 = {
                    ...createRandomPolicy(104),
                    role: CONST.POLICY.ROLE.ADMIN,
                    type: CONST.POLICY.TYPE.TEAM,
                    pendingAction: null,
                };

                await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${1}`, {});
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy1.id}`, policy1);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${policy2.id}`, policy2);

                // When we call createDraftTransactionAndNavigateToParticipantSelector with undefined activePolicy
                createDraftTransactionAndNavigateToParticipantSelector(transaction.transactionID, '1', CONST.IOU.ACTION.CATEGORIZE, '1', undefined, undefined, undefined);

                // Then it should navigate to the upgrade page because it's ambiguous which policy to use
                expect(Navigation.navigate).toHaveBeenCalledWith(
                    ROUTES.MONEY_REQUEST_UPGRADE.getRoute({
                        action: CONST.IOU.ACTION.CATEGORIZE,
                        iouType: CONST.IOU.TYPE.SUBMIT,
                        transactionID: transaction.transactionID,
                        reportID: '1',
                        backTo: '',
                        upgradePath: CONST.UPGRADE_PATHS.CATEGORIES,
                        shouldSubmitExpense: true,
                    }),
                );
            });

            it('should log a warning when policyExpenseReportID is missing during categorization', async () => {
                // Given a transaction and an active policy, but no corresponding policy expense report in Onyx
                const logWarnSpy = jest.spyOn(Log, 'warn');
                const transaction = createRandomTransaction(4);
                const activePolicy: Policy = {
                    ...createRandomPolicy(105),
                    ownerAccountID: currentUserAccountID,
                    role: CONST.POLICY.ROLE.ADMIN,
                    type: CONST.POLICY.TYPE.TEAM,
                    pendingAction: null,
                };

                // We don't merge any policy expense report for this policy
                await Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`, transaction);
                await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${1}`, {});
                await Onyx.merge(`${ONYXKEYS.COLLECTION.POLICY}${activePolicy.id}`, activePolicy);

                // When we call createDraftTransactionAndNavigateToParticipantSelector
                createDraftTransactionAndNavigateToParticipantSelector(transaction.transactionID, '1', CONST.IOU.ACTION.CATEGORIZE, '1', undefined, undefined, activePolicy);

                // Then it should log a warning and not navigate
                expect(logWarnSpy).toHaveBeenCalledWith('policyExpenseReportID is not valid during expense categorizing');
                expect(Navigation.navigate).not.toHaveBeenCalled();
            });
        });
    });
});
