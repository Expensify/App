/* eslint-disable max-lines */
import {eachDayOfInterval, format} from 'date-fns';
import {fastMerge} from 'expensify-common';
import cloneDeep from 'lodash/cloneDeep';
// eslint-disable-next-line you-dont-need-lodash-underscore/union-by
import lodashUnionBy from 'lodash/unionBy';
import {InteractionManager} from 'react-native';
import type {NullishDeep, OnyxCollection, OnyxEntry, OnyxInputValue, OnyxKey, OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {SetRequired, ValueOf} from 'type-fest';
import ReceiptGeneric from '@assets/images/receipt-generic.png';
import type {PaymentMethod} from '@components/KYCWall/types';
import type {SearchQueryJSON} from '@components/Search/types';
import * as API from '@libs/API';
import type {
    AddReportApproverParams,
    ApproveMoneyRequestParams,
    AssignReportToMeParams,
    CategorizeTrackedExpenseParams as CategorizeTrackedExpenseApiParams,
    CreateDistanceRequestParams,
    CreatePerDiemRequestParams,
    CreateWorkspaceParams,
    DeleteMoneyRequestParams,
    DetachReceiptParams,
    MarkTransactionViolationAsResolvedParams,
    PayInvoiceParams,
    PayMoneyRequestParams,
    RejectMoneyRequestParams,
    ReopenReportParams,
    ReplaceReceiptParams,
    RequestMoneyParams,
    RetractReportParams,
    SetNameValuePairParams,
    ShareTrackedExpenseParams,
    SubmitReportParams,
    TrackExpenseParams,
    UnapproveExpenseReportParams,
    UpdateMoneyRequestParams,
} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import {convertAmountToDisplayString, convertToDisplayString, convertToFrontendAmountAsString, getCurrencyDecimals} from '@libs/CurrencyUtils';
import DateUtils from '@libs/DateUtils';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import {getMicroSecondOnyxErrorObject, getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import {readFileAsync} from '@libs/fileDownload/FileUtils';
import type {MinimalTransaction} from '@libs/Formula';
import GoogleTagManager from '@libs/GoogleTagManager';
import {
    calculateAmount as calculateIOUAmount,
    formatCurrentUserToAttendee,
    isMovingTransactionFromTrackExpense as isMovingTransactionFromTrackExpenseIOUUtils,
    navigateToStartMoneyRequestStep,
    updateIOUOwnerAndTotal,
} from '@libs/IOUUtils';
import isFileUploadable from '@libs/isFileUploadable';
import {formatPhoneNumber} from '@libs/LocalePhoneNumber';
import * as Localize from '@libs/Localize';
import Log from '@libs/Log';
import {validateAmount} from '@libs/MoneyRequestUtils';
import isReportOpenInRHP from '@libs/Navigation/helpers/isReportOpenInRHP';
import isReportOpenInSuperWideRHP from '@libs/Navigation/helpers/isReportOpenInSuperWideRHP';
import isSearchTopmostFullScreenRoute from '@libs/Navigation/helpers/isSearchTopmostFullScreenRoute';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import {isOffline} from '@libs/Network/NetworkStore';
// eslint-disable-next-line @typescript-eslint/no-deprecated
import {buildNextStepNew, buildOptimisticNextStep} from '@libs/NextStepUtils';
import * as NumberUtils from '@libs/NumberUtils';
import {getManagerMcTestParticipant, getPersonalDetailsForAccountIDs} from '@libs/OptionsListUtils';
import Parser from '@libs/Parser';
import {getCustomUnitID} from '@libs/PerDiemRequestUtils';
import Performance from '@libs/Performance';
import {getAccountIDsByLogins, getLoginByAccountID} from '@libs/PersonalDetailsUtils';
import {addSMSDomainIfPhoneNumber} from '@libs/PhoneNumber';
import {
    arePaymentsEnabled,
    getDistanceRateCustomUnit,
    getMemberAccountIDsForWorkspace,
    getPerDiemCustomUnit,
    getPerDiemRateCustomUnitRate,
    getPolicy,
    getSubmitToAccountID,
    hasDependentTags,
    hasDynamicExternalWorkflow,
    isControlPolicy,
    isDelayedSubmissionEnabled,
    isPaidGroupPolicy,
    isPolicyAdmin,
    isSubmitAndClose,
} from '@libs/PolicyUtils';
import {
    getAllReportActions,
    getIOUActionForReportID,
    getIOUActionForTransactionID,
    getLastVisibleAction,
    getLastVisibleMessage,
    getOriginalMessage,
    getReportAction,
    getReportActionHtml,
    getReportActionMessage,
    getReportActionText,
    getTrackExpenseActionableWhisper,
    isActionableTrackExpense,
    isCreatedAction,
    isDeletedAction,
    isMoneyRequestAction,
    isReportPreviewAction,
} from '@libs/ReportActionsUtils';
import type {OptimisticChatReport, OptimisticCreatedReportAction, OptimisticIOUReportAction, TransactionDetails} from '@libs/ReportUtils';
import {
    buildOptimisticActionableTrackExpenseWhisper,
    buildOptimisticAddCommentReportAction,
    buildOptimisticApprovedReportAction,
    buildOptimisticCancelPaymentReportAction,
    buildOptimisticChangeApproverReportAction,
    buildOptimisticChatReport,
    buildOptimisticCreatedReportAction,
    buildOptimisticCreatedReportForUnapprovedAction,
    buildOptimisticDetachReceipt,
    buildOptimisticExpenseReport,
    buildOptimisticIOUReport,
    buildOptimisticIOUReportAction,
    buildOptimisticMarkedAsResolvedReportAction,
    buildOptimisticModifiedExpenseReportAction,
    buildOptimisticMoneyRequestEntities,
    buildOptimisticMovedTransactionAction,
    buildOptimisticRejectReportAction,
    buildOptimisticRejectReportActionComment,
    buildOptimisticReopenedReportAction,
    buildOptimisticReportPreview,
    buildOptimisticRetractedReportAction,
    buildOptimisticSelfDMReport,
    buildOptimisticSubmittedReportAction,
    buildOptimisticUnapprovedReportAction,
    canBeAutoReimbursed,
    canEditFieldOfMoneyRequest,
    canUserPerformWriteAction as canUserPerformWriteActionReportUtils,
    findSelfDMReportID,
    generateReportID,
    getAllHeldTransactions as getAllHeldTransactionsReportUtils,
    getApprovalChain,
    getChatByParticipants,
    getDisplayedReportID,
    getMoneyRequestSpendBreakdown,
    getNextApproverAccountID,
    getOutstandingChildRequest,
    getParsedComment,
    getPersonalDetailsForAccountID,
    getReportNotificationPreference,
    getReportOrDraftReport,
    getReportRecipientAccountIDs,
    getReportTransactions,
    getTransactionDetails,
    hasHeldExpenses as hasHeldExpensesReportUtils,
    hasNonReimbursableTransactions as hasNonReimbursableTransactionsReportUtils,
    hasOutstandingChildRequest,
    hasViolations as hasViolationsReportUtils,
    isArchivedReport,
    isClosedReport as isClosedReportUtil,
    isDraftReport,
    isExpenseReport,
    isIndividualInvoiceRoom,
    isInvoiceReport as isInvoiceReportReportUtils,
    isInvoiceRoom,
    isIOUReport,
    isMoneyRequestReport as isMoneyRequestReportReportUtils,
    isOneOnOneChat,
    isOneTransactionReport,
    isOneTransactionThread,
    isOpenExpenseReport as isOpenExpenseReportReportUtils,
    isOpenInvoiceReport as isOpenInvoiceReportReportUtils,
    isOpenReport,
    isOptimisticPersonalDetail,
    isPayAtEndExpenseReport as isPayAtEndExpenseReportReportUtils,
    isPayer as isPayerReportUtils,
    isPolicyExpenseChat as isPolicyExpenseChatReportUtil,
    isProcessingReport,
    isReportApproved,
    isReportManager,
    isSelectedManagerMcTest,
    isSelfDM,
    isSettled,
    isTestTransactionReport,
    isTrackExpenseReport,
    prepareOnboardingOnyxData,
    shouldCreateNewMoneyRequestReport as shouldCreateNewMoneyRequestReportReportUtils,
    shouldEnableNegative,
    updateReportPreview,
} from '@libs/ReportUtils';
import {getCurrentSearchQueryJSON} from '@libs/SearchQueryUtils';
import {getSuggestedSearches} from '@libs/SearchUIUtils';
import playSound, {SOUNDS} from '@libs/Sound';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import {startSpan} from '@libs/telemetry/activeSpans';
import {
    allHavePendingRTERViolation,
    buildOptimisticTransaction,
    getAmount,
    getCategoryTaxCodeAndAmount,
    getChildTransactions,
    getClearedPendingFields,
    getCurrency,
    getDistanceInMeters,
    getMerchant,
    getOriginalTransactionWithSplitInfo,
    getUpdatedTransaction,
    hasAnyTransactionWithoutRTERViolation,
    hasDuplicateTransactions,
    isCustomUnitRateIDForP2P,
    isDistanceRequest as isDistanceRequestTransactionUtils,
    isDuplicate,
    isFetchingWaypointsFromServer,
    isManualDistanceRequest as isManualDistanceRequestTransactionUtils,
    isMapDistanceRequest,
    isOdometerDistanceRequest as isOdometerDistanceRequestTransactionUtils,
    isOnHold,
    isPending,
    isPendingCardOrScanningTransaction,
    isPerDiemRequest as isPerDiemRequestTransactionUtils,
    isScanning,
    isScanRequest as isScanRequestTransactionUtils,
    removeTransactionFromDuplicateTransactionViolation,
} from '@libs/TransactionUtils';
import ViolationsUtils from '@libs/Violations/ViolationsUtils';
import {clearByKey as clearPdfByOnyxKey} from '@userActions/CachedPDFPaths';
import {buildAddMembersToWorkspaceOnyxData, buildUpdateWorkspaceMembersRoleOnyxData} from '@userActions/Policy/Member';
import {buildPolicyData, generatePolicyID} from '@userActions/Policy/Policy';
import {buildOptimisticPolicyRecentlyUsedTags, getPolicyTagsData} from '@userActions/Policy/Tag';
import type {GuidedSetupData} from '@userActions/Report';
import {buildInviteToRoomOnyxData, completeOnboarding, getCurrentUserAccountID, notifyNewAction, optimisticReportLastData} from '@userActions/Report';
import {clearAllRelatedReportActionErrors} from '@userActions/ReportActions';
import {sanitizeRecentWaypoints} from '@userActions/Transaction';
import {removeDraftTransaction, removeDraftTransactions} from '@userActions/TransactionEdit';
import {getOnboardingMessages} from '@userActions/Welcome/OnboardingFlow';
import type {OnboardingCompanySize} from '@userActions/Welcome/OnboardingFlow';
import type {IOUAction, IOUActionParams, IOUType} from '@src/CONST';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import type {Accountant, Attendee, Participant, Split, SplitExpense} from '@src/types/onyx/IOU';
import type {ErrorFields, Errors, PendingAction, PendingFields} from '@src/types/onyx/OnyxCommon';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import type {CurrentUserPersonalDetails} from '@src/types/onyx/PersonalDetails';
import type {QuickActionName} from '@src/types/onyx/QuickAction';
import type RecentlyUsedTags from '@src/types/onyx/RecentlyUsedTags';
import type {ReportNextStep} from '@src/types/onyx/Report';
import type ReportAction from '@src/types/onyx/ReportAction';
import type {OnyxData} from '@src/types/onyx/Request';
import type {Comment, Receipt, ReceiptSource, Routes, SplitShares, TransactionChanges, TransactionCustomUnit, WaypointCollection} from '@src/types/onyx/Transaction';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

type IOURequestType = ValueOf<typeof CONST.IOU.REQUEST_TYPE>;

type OneOnOneIOUReport = OnyxTypes.Report | undefined | null;

type BaseTransactionParams = {
    amount: number;
    modifiedAmount?: number;
    currency: string;
    created: string;
    merchant: string;
    comment: string;
    category?: string;
    tag?: string;
    taxCode?: string;
    taxAmount?: number;
    billable?: boolean;
    reimbursable?: boolean;
    customUnitRateID?: string;
};

type InitMoneyRequestParams = {
    reportID: string;
    policy?: OnyxEntry<OnyxTypes.Policy>;
    personalPolicy: Pick<OnyxTypes.Policy, 'id' | 'type' | 'autoReporting' | 'outputCurrency'> | undefined;
    isFromGlobalCreate?: boolean;
    currentIouRequestType?: IOURequestType | undefined;
    newIouRequestType: IOURequestType | undefined;
    report: OnyxEntry<OnyxTypes.Report>;
    parentReport: OnyxEntry<OnyxTypes.Report>;
    currentDate: string | undefined;
    lastSelectedDistanceRates?: OnyxEntry<OnyxTypes.LastSelectedDistanceRates>;
    currentUserPersonalDetails: CurrentUserPersonalDetails;
    hasOnlyPersonalPolicies: boolean;
};

type MoneyRequestInformation = {
    payerAccountID: number;
    payerEmail: string;
    iouReport: OnyxTypes.Report;
    chatReport: OnyxTypes.Report;
    transaction: OnyxTypes.Transaction;
    iouAction: OptimisticIOUReportAction;
    createdChatReportActionID?: string;
    createdIOUReportActionID?: string;
    reportPreviewAction: OnyxTypes.ReportAction;
    transactionThreadReportID?: string;
    createdReportActionIDForThread: string | undefined;
    onyxData: OnyxData<OnyxKey>;
    billable?: boolean;
    reimbursable?: boolean;
};

type PayInvoiceArgs = {
    paymentMethodType: PaymentMethodType;
    chatReport: OnyxTypes.Report;
    invoiceReport: OnyxEntry<OnyxTypes.Report>;
    introSelected: OnyxEntry<OnyxTypes.IntroSelected>;
    invoiceReportCurrentNextStepDeprecated: OnyxEntry<OnyxTypes.ReportNextStepDeprecated>;
    currentUserAccountIDParam: number;
    currentUserEmailParam: string;
    payAsBusiness?: boolean;
    existingB2BInvoiceReport?: OnyxEntry<OnyxTypes.Report>;
    methodID?: number;
    paymentMethod?: PaymentMethod;
    activePolicy?: OnyxTypes.Policy;
};

type RejectMoneyRequestData = {
    optimisticData: Array<
        OnyxUpdate<
            | typeof ONYXKEYS.COLLECTION.REPORT
            | typeof ONYXKEYS.COLLECTION.TRANSACTION
            | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS
            | typeof ONYXKEYS.COLLECTION.REPORT_METADATA
            | typeof ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS
            | typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS
        >
    >;
    successData: Array<
        OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.REPORT_METADATA | typeof ONYXKEYS.COLLECTION.TRANSACTION>
    >;
    failureData: Array<
        OnyxUpdate<
            | typeof ONYXKEYS.COLLECTION.REPORT
            | typeof ONYXKEYS.COLLECTION.TRANSACTION
            | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS
            | typeof ONYXKEYS.COLLECTION.REPORT_METADATA
            | typeof ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS
            | typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS
        >
    >;
    parameters: RejectMoneyRequestParams;
    urlToNavigateBack: Route | undefined;
};

type TrackExpenseInformation = {
    createdWorkspaceParams?: CreateWorkspaceParams;
    iouReport?: OnyxTypes.Report;
    chatReport: OnyxTypes.Report;
    transaction: OnyxTypes.Transaction;
    iouAction: OptimisticIOUReportAction;
    createdChatReportActionID?: string;
    createdIOUReportActionID?: string;
    reportPreviewAction?: OnyxTypes.ReportAction;
    transactionThreadReportID: string;
    createdReportActionIDForThread: string | undefined;
    actionableWhisperReportActionIDParam?: string;
    optimisticReportID: string | undefined;
    optimisticReportActionID: string | undefined;
    onyxData: OnyxData<OnyxKey>;
};

type TrackedExpenseTransactionParams = Omit<BaseTransactionParams, 'taxCode' | 'taxAmount'> & {
    waypoints?: string;
    distance?: number;
    transactionID: string | undefined;
    receipt?: Receipt;
    taxCode: string;
    taxAmount: number;
    attendees?: Attendee[];
};

type TrackedExpensePolicyParams = {
    policy: OnyxEntry<OnyxTypes.Policy>;
    policyID: string | undefined;
    isDraftPolicy?: boolean;
};
type TrackedExpenseReportInformation = {
    moneyRequestPreviewReportActionID: string | undefined;
    moneyRequestReportID: string | undefined;
    moneyRequestCreatedReportActionID: string | undefined;
    actionableWhisperReportActionID: string | undefined;
    linkedTrackedExpenseReportAction: OnyxTypes.ReportAction;
    linkedTrackedExpenseReportID: string;
    transactionThreadReportID: string | undefined;
    reportPreviewReportActionID: string | undefined;
    chatReportID: string | undefined;
    isLinkedTrackedExpenseReportArchived: boolean | undefined;
};
type TrackedExpenseParams = {
    onyxData?: OnyxData<OnyxKey>;
    reportInformation: TrackedExpenseReportInformation;
    transactionParams: TrackedExpenseTransactionParams;
    policyParams: TrackedExpensePolicyParams;
    createdWorkspaceParams?: CreateWorkspaceParams;
    accountantParams?: TrackExpenseAccountantParams;
};

type SplitData = {
    chatReportID: string;
    transactionID: string;
    reportActionID: string;
    policyID?: string;
    createdReportActionID?: string;
    chatType?: string;
};

type SplitsAndOnyxData = {
    splitData: SplitData;
    splits: Split[];
    onyxData: OnyxData<OnyxKey>;
};

type UpdateMoneyRequestData = {
    params: UpdateMoneyRequestParams;
    onyxData: OnyxData<OnyxKey>;
};

type PayMoneyRequestData = {
    params: PayMoneyRequestParams & Partial<PayInvoiceParams>;
    optimisticData: OnyxUpdate[];
    successData: OnyxUpdate[];
    failureData: OnyxUpdate[];
};

type GPSPoint = {
    lat: number;
    long: number;
};

type RequestMoneyTransactionParams = Omit<BaseTransactionParams, 'comment'> & {
    attendees?: Attendee[];
    actionableWhisperReportActionID?: string;
    linkedTrackedExpenseReportAction?: OnyxTypes.ReportAction;
    linkedTrackedExpenseReportID?: string;
    receipt?: Receipt;
    waypoints?: WaypointCollection;
    comment?: string;
    originalTransactionID?: string;
    isTestDrive?: boolean;
    source?: string;
    pendingAction?: PendingAction;
    pendingFields?: PendingFields<string>;
    distance?: number;
    isLinkedTrackedExpenseReportArchived?: boolean;

    /** Transaction type (e.g., 'time' for time tracking expenses) */
    type?: ValueOf<typeof CONST.TRANSACTION.TYPE>;

    /** Number of hours for time tracking expenses */
    count?: number;

    /** Hourly rate in cents. Use convertToBackendAmount() to convert from policy rate (which is stored as a float) */
    rate?: number;

    /** Unit for time tracking (e.g., 'h' for hours) */
    unit?: ValueOf<typeof CONST.TIME_TRACKING.UNIT>;
};

type PerDiemExpenseTransactionParams = Omit<BaseTransactionParams, 'amount' | 'merchant' | 'customUnitRateID' | 'taxAmount' | 'taxCode' | 'comment'> & {
    attendees?: Attendee[];
    customUnit: TransactionCustomUnit;
    comment?: string;
};

type BasePolicyParams = {
    policy?: OnyxEntry<OnyxTypes.Policy>;
    policyTagList?: OnyxEntry<OnyxTypes.PolicyTagLists>;
    policyRecentlyUsedTags?: OnyxEntry<RecentlyUsedTags>;
    policyCategories?: OnyxEntry<OnyxTypes.PolicyCategories>;
    policyRecentlyUsedCategories?: OnyxEntry<OnyxTypes.RecentlyUsedCategories>;
};

type RecentlyUsedParams = {
    destinations?: OnyxEntry<OnyxTypes.RecentlyUsedCategories>;
};

type RequestMoneyParticipantParams = {
    payeeEmail: string | undefined;
    payeeAccountID: number;
    participant: Participant;
};

type PerDiemExpenseInformation = {
    report: OnyxEntry<OnyxTypes.Report>;
    participantParams: RequestMoneyParticipantParams;
    policyParams?: BasePolicyParams;
    recentlyUsedParams?: RecentlyUsedParams;
    transactionParams: PerDiemExpenseTransactionParams;
    isASAPSubmitBetaEnabled: boolean;
    currentUserAccountIDParam: number;
    currentUserEmailParam: string;
    hasViolations: boolean;
    quickAction: OnyxEntry<OnyxTypes.QuickAction>;
    policyRecentlyUsedCurrencies: string[];
};

type PerDiemExpenseInformationParams = {
    parentChatReport: OnyxEntry<OnyxTypes.Report>;
    transactionParams: PerDiemExpenseTransactionParams;
    participantParams: RequestMoneyParticipantParams;
    policyParams?: BasePolicyParams;
    recentlyUsedParams?: RecentlyUsedParams;
    moneyRequestReportID?: string;
    isASAPSubmitBetaEnabled: boolean;
    currentUserAccountIDParam: number;
    currentUserEmailParam: string;
    hasViolations: boolean;
    quickAction: OnyxEntry<OnyxTypes.QuickAction>;
    policyRecentlyUsedCurrencies: string[];
};

type RequestMoneyInformation = {
    report: OnyxEntry<OnyxTypes.Report>;
    existingIOUReport?: OnyxEntry<OnyxTypes.Report>;
    participantParams: RequestMoneyParticipantParams;
    policyParams?: BasePolicyParams;
    gpsPoint?: GPSPoint;
    action?: IOUAction;
    transactionParams: RequestMoneyTransactionParams;
    isRetry?: boolean;
    shouldPlaySound?: boolean;
    shouldHandleNavigation?: boolean;
    backToReport?: string;
    optimisticChatReportID?: string;
    optimisticCreatedReportActionID?: string;
    optimisticIOUReportID?: string;
    optimisticReportPreviewActionID?: string;
    shouldGenerateTransactionThreadReport: boolean;
    isASAPSubmitBetaEnabled: boolean;
    currentUserAccountIDParam: number;
    currentUserEmailParam: string;
    transactionViolations: OnyxCollection<OnyxTypes.TransactionViolation[]>;
    quickAction: OnyxEntry<OnyxTypes.QuickAction>;
    policyRecentlyUsedCurrencies: string[];
};

type MoneyRequestInformationParams = {
    parentChatReport: OnyxEntry<OnyxTypes.Report>;
    existingIOUReport?: OnyxEntry<OnyxTypes.Report>;
    transactionParams: RequestMoneyTransactionParams;
    participantParams: RequestMoneyParticipantParams;
    policyParams?: BasePolicyParams;
    moneyRequestReportID?: string;
    existingTransactionID?: string;
    existingTransaction?: OnyxEntry<OnyxTypes.Transaction>;
    retryParams?: StartSplitBilActionParams | CreateTrackExpenseParams | RequestMoneyInformation | ReplaceReceipt;
    newReportTotal?: number;
    newNonReimbursableTotal?: number;
    testDriveCommentReportActionID?: string;
    optimisticChatReportID?: string;
    optimisticCreatedReportActionID?: string;
    optimisticIOUReportID?: string;
    optimisticReportPreviewActionID?: string;
    shouldGenerateTransactionThreadReport?: boolean;
    isSplitExpense?: boolean;
    action?: IOUAction;
    currentReportActionID?: string;
    isASAPSubmitBetaEnabled: boolean;
    currentUserAccountIDParam: number;
    currentUserEmailParam: string;
    transactionViolations: OnyxCollection<OnyxTypes.TransactionViolation[]>;
    quickAction: OnyxEntry<OnyxTypes.QuickAction>;
    policyRecentlyUsedCurrencies: string[];
};

type MoneyRequestOptimisticParams = {
    chat: {
        report: OnyxTypes.OnyxInputOrEntry<OnyxTypes.Report>;
        createdAction: OptimisticCreatedReportAction;
        reportPreviewAction: ReportAction;
    };
    iou: {
        report: OnyxTypes.Report;
        createdAction: OptimisticCreatedReportAction;
        action: OptimisticIOUReportAction;
    };
    transactionParams: {
        transaction: OnyxTypes.Transaction;
        transactionThreadReport?: OptimisticChatReport | null;
        transactionThreadCreatedReportAction: OptimisticCreatedReportAction | null;
    };
    policyRecentlyUsed: {
        categories?: string[];
        tags?: OnyxTypes.RecentlyUsedTags;
        currencies?: string[];
        destinations?: string[];
    };
    personalDetailListAction?: OnyxTypes.PersonalDetailsList;
    nextStepDeprecated?: OnyxTypes.ReportNextStepDeprecated | null;
    nextStep?: ReportNextStep | null;
    testDriveCommentReportActionID?: string;
};

type BuildOnyxDataForMoneyRequestParams = {
    isNewChatReport: boolean;
    shouldCreateNewMoneyRequestReport: boolean;
    isOneOnOneSplit?: boolean;
    existingTransactionThreadReportID?: string;
    policyParams?: BasePolicyParams;
    optimisticParams: MoneyRequestOptimisticParams;
    retryParams?: StartSplitBilActionParams | CreateTrackExpenseParams | RequestMoneyInformation | ReplaceReceipt;
    participant?: Participant;
    shouldGenerateTransactionThreadReport?: boolean;
    isASAPSubmitBetaEnabled: boolean;
    currentUserAccountIDParam: number;
    currentUserEmailParam: string;
    hasViolations: boolean;
    quickAction: OnyxEntry<OnyxTypes.QuickAction>;
};

type DistanceRequestTransactionParams = BaseTransactionParams & {
    attendees?: Attendee[];
    validWaypoints?: WaypointCollection;
    splitShares?: SplitShares;
    distance?: number;
    receipt?: Receipt;
    odometerStart?: number;
    odometerEnd?: number;
};

type CreateDistanceRequestInformation = {
    report: OnyxEntry<OnyxTypes.Report>;
    participants: Participant[];
    currentUserLogin?: string;
    currentUserAccountID?: number;
    iouType?: ValueOf<typeof CONST.IOU.TYPE>;
    existingTransaction?: OnyxEntry<OnyxTypes.Transaction>;
    transactionParams: DistanceRequestTransactionParams;
    policyParams?: BasePolicyParams;
    backToReport?: string;
    isASAPSubmitBetaEnabled: boolean;
    transactionViolations: OnyxCollection<OnyxTypes.TransactionViolation[]>;
    quickAction: OnyxEntry<OnyxTypes.QuickAction>;
    policyRecentlyUsedCurrencies: string[];
    customUnitPolicyID?: string;
    shouldHandleNavigation?: boolean;
};

type CreateSplitsTransactionParams = Omit<BaseTransactionParams, 'customUnitRateID'> & {
    splitShares: SplitShares;
    iouRequestType?: IOURequestType;
    attendees?: Attendee[];
};

type CreateSplitsAndOnyxDataParams = {
    participants: Participant[];
    currentUserLogin: string;
    currentUserAccountID: number;
    existingSplitChatReportID?: string;
    transactionParams: CreateSplitsTransactionParams;
    policyRecentlyUsedCategories?: OnyxEntry<OnyxTypes.RecentlyUsedCategories>;
    policyRecentlyUsedTags: OnyxEntry<RecentlyUsedTags>;
    isASAPSubmitBetaEnabled: boolean;
    transactionViolations: OnyxCollection<OnyxTypes.TransactionViolation[]>;
    quickAction: OnyxEntry<OnyxTypes.QuickAction>;
    policyRecentlyUsedCurrencies: string[];
};

type TrackExpenseTransactionParams = {
    amount: number;
    currency: string;
    created: string | undefined;
    merchant?: string;
    comment?: string;
    distance?: number;
    receipt?: Receipt;
    category?: string;
    tag?: string;
    taxCode?: string;
    taxAmount?: number;
    billable?: boolean;
    reimbursable?: boolean;
    validWaypoints?: WaypointCollection;
    gpsPoint?: GPSPoint;
    actionableWhisperReportActionID?: string;
    linkedTrackedExpenseReportAction?: OnyxTypes.ReportAction;
    linkedTrackedExpenseReportID?: string;
    customUnitRateID?: string;
    attendees?: Attendee[];
    isLinkedTrackedExpenseReportArchived?: boolean;
    odometerStart?: number;
    odometerEnd?: number;
};

type TrackExpenseAccountantParams = {
    accountant?: Accountant;
};

type CreateTrackExpenseParams = {
    report: OnyxEntry<OnyxTypes.Report>;
    isDraftPolicy: boolean;
    action?: IOUAction;
    participantParams: RequestMoneyParticipantParams;
    policyParams?: BasePolicyParams;
    transactionParams: TrackExpenseTransactionParams;
    accountantParams?: TrackExpenseAccountantParams;
    isRetry?: boolean;
    shouldPlaySound?: boolean;
    shouldHandleNavigation?: boolean;
    isASAPSubmitBetaEnabled: boolean;
    currentUserAccountIDParam: number;
    currentUserEmailParam: string;
    introSelected: OnyxEntry<OnyxTypes.IntroSelected>;
    activePolicyID: string | undefined;
    quickAction: OnyxEntry<OnyxTypes.QuickAction>;
};

type GetTrackExpenseInformationTransactionParams = {
    comment: string;
    amount: number;
    currency: string;
    created: string;
    merchant: string;
    receipt: OnyxEntry<Receipt>;
    category?: string;
    tag?: string;
    taxCode?: string;
    taxAmount?: number;
    billable?: boolean;
    reimbursable?: boolean;
    linkedTrackedExpenseReportAction?: OnyxTypes.ReportAction;
    attendees?: Attendee[];
    distance?: number;
    odometerStart?: number;
    odometerEnd?: number;
};

type GetTrackExpenseInformationParticipantParams = {
    payeeEmail?: string;
    payeeAccountID?: number;
    participant: Participant;
};

type GetTrackExpenseInformationParams = {
    parentChatReport: OnyxEntry<OnyxTypes.Report>;
    moneyRequestReportID?: string;
    existingTransactionID?: string;
    participantParams: GetTrackExpenseInformationParticipantParams;
    policyParams: BasePolicyParams;
    transactionParams: GetTrackExpenseInformationTransactionParams;
    retryParams?: StartSplitBilActionParams | CreateTrackExpenseParams | RequestMoneyInformation | ReplaceReceipt;
    isASAPSubmitBetaEnabled: boolean;
    currentUserAccountIDParam: number;
    currentUserEmailParam: string;
    introSelected: OnyxEntry<OnyxTypes.IntroSelected>;
    activePolicyID: string | undefined;
    quickAction: OnyxEntry<OnyxTypes.QuickAction>;
};

let allPersonalDetails: OnyxTypes.PersonalDetailsList = {};
Onyx.connect({
    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    callback: (value) => {
        allPersonalDetails = value ?? {};
    },
});

type StartSplitBilActionParams = {
    participants: Participant[];
    currentUserLogin: string;
    currentUserAccountID: number;
    comment: string;
    receipt: Receipt;
    existingSplitChatReportID?: string;
    billable?: boolean;
    reimbursable?: boolean;
    category: string | undefined;
    tag: string | undefined;
    currency: string;
    taxCode: string;
    taxAmount: number;
    shouldPlaySound?: boolean;
    policyRecentlyUsedCategories?: OnyxEntry<OnyxTypes.RecentlyUsedCategories>;
    policyRecentlyUsedTags: OnyxEntry<RecentlyUsedTags>;
    quickAction: OnyxEntry<OnyxTypes.QuickAction>;
    policyRecentlyUsedCurrencies: string[];
};

type ReplaceReceipt = {
    transactionID: string;
    file?: File;
    source: string;
    transactionPolicyCategories?: OnyxEntry<OnyxTypes.PolicyCategories>;
    transactionPolicy: OnyxEntry<OnyxTypes.Policy>;
};

type GetSearchOnyxUpdateParams = {
    transaction: OnyxTypes.Transaction;
    participant?: Participant;
    iouReport?: OnyxEntry<OnyxTypes.Report>;
    iouAction?: OnyxEntry<OnyxTypes.ReportAction>;
    policy?: OnyxEntry<OnyxTypes.Policy>;
    isFromOneTransactionReport?: boolean;
    isInvoice?: boolean;
    transactionThreadReportID: string | undefined;
};

type DeleteTrackExpenseParams = {
    chatReportID: string | undefined;
    chatReport: OnyxEntry<OnyxTypes.Report> | undefined;
    transactionID: string | undefined;
    reportAction: OnyxTypes.ReportAction;
    iouReport: OnyxEntry<OnyxTypes.Report>;
    chatIOUReport: OnyxEntry<OnyxTypes.Report>;
    transactions: OnyxCollection<OnyxTypes.Transaction>;
    violations: OnyxCollection<OnyxTypes.TransactionViolations>;
    isSingleTransactionView: boolean | undefined;
    isChatReportArchived: boolean | undefined;
    isChatIOUReportArchived: boolean | undefined;
    allTransactionViolationsParam: OnyxCollection<OnyxTypes.TransactionViolations>;
};

type DeleteMoneyRequestFunctionParams = {
    transactionID: string | undefined;
    reportAction: OnyxTypes.ReportAction;
    transactions: OnyxCollection<OnyxTypes.Transaction>;
    violations: OnyxCollection<OnyxTypes.TransactionViolations>;
    iouReport: OnyxEntry<OnyxTypes.Report>;
    chatReport: OnyxEntry<OnyxTypes.Report>;
    isChatIOUReportArchived?: boolean | undefined;
    isSingleTransactionView?: boolean;
    transactionIDsPendingDeletion?: string[];
    selectedTransactionIDs?: string[];
    hash?: number;
    allTransactionViolationsParam: OnyxCollection<OnyxTypes.TransactionViolations>;
};

let allTransactions: NonNullable<OnyxCollection<OnyxTypes.Transaction>> = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.TRANSACTION,
    waitForCollectionCallback: true,
    callback: (value) => {
        if (!value) {
            allTransactions = {};
            return;
        }

        allTransactions = value;
    },
});

let allTransactionDrafts: NonNullable<OnyxCollection<OnyxTypes.Transaction>> = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.TRANSACTION_DRAFT,
    waitForCollectionCallback: true,
    callback: (value) => {
        allTransactionDrafts = value ?? {};
    },
});

let allTransactionViolations: NonNullable<OnyxCollection<OnyxTypes.TransactionViolations>> = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS,
    waitForCollectionCallback: true,
    callback: (value) => {
        if (!value) {
            allTransactionViolations = {};
            return;
        }

        allTransactionViolations = value;
    },
});

let allReports: OnyxCollection<OnyxTypes.Report>;
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback: (value) => {
        allReports = value;
    },
});

let allReportNameValuePairs: OnyxCollection<OnyxTypes.ReportNameValuePairs>;
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS,
    waitForCollectionCallback: true,
    callback: (value) => {
        allReportNameValuePairs = value;
    },
});

let userAccountID = -1;
let currentUserEmail = '';
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (value) => {
        currentUserEmail = value?.email ?? '';
        userAccountID = value?.accountID ?? CONST.DEFAULT_NUMBER_ID;
    },
});

let deprecatedCurrentUserPersonalDetails: OnyxEntry<OnyxTypes.PersonalDetails>;
Onyx.connect({
    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    callback: (value) => {
        deprecatedCurrentUserPersonalDetails = value?.[userAccountID] ?? undefined;
    },
});

let allReportActions: OnyxCollection<OnyxTypes.ReportActions>;
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
    waitForCollectionCallback: true,
    callback: (actions) => {
        if (!actions) {
            return;
        }
        allReportActions = actions;
    },
});

let personalDetailsList: OnyxEntry<OnyxTypes.PersonalDetailsList>;
Onyx.connect({
    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    callback: (value) => (personalDetailsList = value),
});

// Use connectWithoutView because this is created for non-UI task only
let recentAttendees: OnyxEntry<Attendee[]>;
Onyx.connectWithoutView({
    key: ONYXKEYS.NVP_RECENT_ATTENDEES,
    callback: (value) => (recentAttendees = value),
});

// TODO: remove `recentWaypoints` from this file (https://github.com/Expensify/App/issues/73024)
// `recentWaypoints` was moved here temporarily from `src/libs/actions/Policy/Tag.ts` during the `Deprecate Onyx.connect` refactor.
// All uses of this variable should be replaced with `useOnyx`.
let recentWaypoints: OnyxTypes.RecentWaypoint[] = [];
Onyx.connect({
    key: ONYXKEYS.NVP_RECENT_WAYPOINTS,
    callback: (val) => (recentWaypoints = val ?? []),
});

function getAllPersonalDetails(): OnyxTypes.PersonalDetailsList {
    return allPersonalDetails;
}

function getAllTransactions(): NonNullable<OnyxCollection<OnyxTypes.Transaction>> {
    return allTransactions;
}

function getAllTransactionViolations(): NonNullable<OnyxCollection<OnyxTypes.TransactionViolations>> {
    return allTransactionViolations;
}

function getAllReports(): OnyxCollection<OnyxTypes.Report> {
    return allReports;
}

function getAllReportActionsFromIOU(): OnyxCollection<OnyxTypes.ReportActions> {
    return allReportActions;
}

function getCurrentUserEmail(): string {
    return currentUserEmail;
}

function getUserAccountID(): number {
    return userAccountID;
}

/**
 * @private
 * After finishing the action in RHP from the Inbox tab, besides dismissing the modal, we should open the report.
 * If the action is done from the report RHP, then we just want to dismiss the money request flow screens.
 * It is a helper function used only in this file.
 */
function dismissModalAndOpenReportInInboxTab(reportID?: string) {
    const rootState = navigationRef.getRootState();
    if (isReportOpenInRHP(rootState)) {
        const rhpKey = rootState.routes.at(-1)?.state?.key;
        if (rhpKey) {
            const hasMultipleTransactions = Object.values(allTransactions).filter((transaction) => transaction?.reportID === reportID).length > 0;
            // When a report is opened in the super wide RHP, we need to dismiss to the first RHP to show the same report with new expense.
            if (isReportOpenInSuperWideRHP(rootState)) {
                Navigation.dismissToPreviousRHP();
                return;
            }
            // When a report with one expense is opened in the wide RHP and the user adds another expense, RHP should be dismissed and ROUTES.SEARCH_MONEY_REQUEST_REPORT should be displayed.
            if (hasMultipleTransactions && reportID) {
                Navigation.dismissModal();
                Navigation.setNavigationActionToMicrotaskQueue(() => {
                    Navigation.navigate(ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID}));
                });
                return;
            }
            Navigation.pop(rhpKey);
            return;
        }
    }
    if (isSearchTopmostFullScreenRoute() || !reportID) {
        Navigation.dismissModal();
        return;
    }
    Navigation.dismissModalWithReport({reportID});
}

/**
 * Build a minimal transaction record for formula computation in buildOptimisticExpenseReport.
 * This allows formulas like {report:startdate}, {report:expensescount} to work correctly.
 */
function buildMinimalTransactionForFormula(
    transactionID: string,
    reportID: string,
    created?: string,
    amount?: number,
    currency?: string,
    merchant?: string,
): Record<string, MinimalTransaction> {
    return {
        [transactionID]: {
            transactionID,
            reportID,
            created,
            amount,
            currency,
            merchant,
        } as MinimalTransaction,
    };
}

/**
 * Find the report preview action from given chat report and iou report
 */
function getReportPreviewAction(chatReportID: string | undefined, iouReportID: string | undefined): OnyxInputValue<ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW>> {
    const reportActions = allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReportID}`] ?? {};

    // Find the report preview action from the chat report
    return (
        Object.values(reportActions).find(
            (reportAction): reportAction is ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW> =>
                reportAction && isReportPreviewAction(reportAction) && getOriginalMessage(reportAction)?.linkedReportID === iouReportID,
        ) ?? null
    );
}

/**
 * Initialize expense info
 * @param reportID to attach the transaction to
 * @param policy
 * @param isFromGlobalCreate
 * @param iouRequestType one of manual/scan/distance
 * @param report the report to attach the transaction to
 * @param parentReport the parent report to attach the transaction to
 */
function initMoneyRequest({
    reportID,
    policy,
    personalPolicy,
    isFromGlobalCreate,
    currentIouRequestType,
    newIouRequestType,
    report,
    parentReport,
    currentDate = '',
    lastSelectedDistanceRates,
    currentUserPersonalDetails,
    hasOnlyPersonalPolicies,
}: InitMoneyRequestParams) {
    // Generate a brand new transactionID
    const newTransactionID = CONST.IOU.OPTIMISTIC_TRANSACTION_ID;
    const currency = policy?.outputCurrency ?? personalPolicy?.outputCurrency ?? CONST.CURRENCY.USD;

    // Disabling this line since currentDate can be an empty string
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const created = currentDate || format(new Date(), 'yyyy-MM-dd');

    // We remove draft transactions created during multi scanning if there are some
    removeDraftTransactions(true);

    // in case we have to re-init money request, but the IOU request type is the same with the old draft transaction,
    // we should keep most of the existing data by using the ONYX MERGE operation
    if (currentIouRequestType === newIouRequestType) {
        // so, we just need to update the reportID, isFromGlobalCreate, created, currency
        Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${newTransactionID}`, {
            reportID,
            isFromGlobalCreate,
            created,
            currency,
            transactionID: newTransactionID,
        });
        return;
    }

    const comment: Comment = {
        attendees: formatCurrentUserToAttendee(currentUserPersonalDetails, reportID),
    };
    let requestCategory: string | null = null;

    // Set up initial distance expense state
    if (
        newIouRequestType === CONST.IOU.REQUEST_TYPE.DISTANCE ||
        newIouRequestType === CONST.IOU.REQUEST_TYPE.DISTANCE_MAP ||
        newIouRequestType === CONST.IOU.REQUEST_TYPE.DISTANCE_MANUAL ||
        newIouRequestType === CONST.IOU.REQUEST_TYPE.DISTANCE_ODOMETER
    ) {
        if (!isFromGlobalCreate) {
            const isPolicyExpenseChat = isPolicyExpenseChatReportUtil(report) || isPolicyExpenseChatReportUtil(parentReport);
            const customUnitRateID = DistanceRequestUtils.getCustomUnitRateID({reportID, isPolicyExpenseChat, policy, lastSelectedDistanceRates});
            comment.customUnit = {customUnitRateID, name: CONST.CUSTOM_UNITS.NAME_DISTANCE};
        } else if (hasOnlyPersonalPolicies) {
            comment.customUnit = {customUnitRateID: CONST.CUSTOM_UNITS.FAKE_P2P_ID, name: CONST.CUSTOM_UNITS.NAME_DISTANCE};
        }
        if (comment.customUnit) {
            comment.customUnit.quantity = null;
        }
        if (newIouRequestType === CONST.IOU.REQUEST_TYPE.DISTANCE_MANUAL || newIouRequestType === CONST.IOU.REQUEST_TYPE.DISTANCE_ODOMETER) {
            comment.waypoints = undefined;
        } else {
            comment.waypoints = {
                waypoint0: {keyForList: 'start_waypoint'},
                waypoint1: {keyForList: 'stop_waypoint'},
            };
        }
        // Initialize odometer readings for odometer type
        if (newIouRequestType === CONST.IOU.REQUEST_TYPE.DISTANCE_ODOMETER) {
            comment.odometerStart = undefined;
            comment.odometerEnd = undefined;
        }
    }

    if (newIouRequestType === CONST.IOU.REQUEST_TYPE.PER_DIEM) {
        comment.customUnit = {
            attributes: {
                dates: {
                    start: DateUtils.getStartOfToday(),
                    end: DateUtils.getStartOfToday(),
                },
            },
        };
        if (!isFromGlobalCreate) {
            const {customUnitID, category} = getCustomUnitID(report, parentReport, policy);
            comment.customUnit = {...comment.customUnit, customUnitID};
            requestCategory = category ?? null;
        }
    }

    const defaultMerchant = newIouRequestType === CONST.IOU.REQUEST_TYPE.MANUAL ? CONST.TRANSACTION.DEFAULT_MERCHANT : CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT;

    const newTransaction = {
        amount: 0,
        comment,
        created,
        currency,
        category: requestCategory,
        iouRequestType: newIouRequestType,
        reportID,
        transactionID: newTransactionID,
        isFromGlobalCreate,
        merchant: defaultMerchant,
    };

    // Store the transaction in Onyx and mark it as not saved so it can be cleaned up later
    // Use set() here so that there is no way that data will be leaked between objects when it gets reset
    Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${newTransactionID}`, newTransaction);

    return newTransaction;
}

function createDraftTransaction(transaction: OnyxTypes.Transaction) {
    if (!transaction) {
        return;
    }

    const newTransaction = {
        ...transaction,
    };

    Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transaction.transactionID}`, newTransaction);
}

function clearMoneyRequest(transactionID: string, skipConfirmation = false, draftTransactions?: OnyxCollection<OnyxTypes.Transaction>) {
    removeDraftTransactions(undefined, draftTransactions);
    Onyx.set(`${ONYXKEYS.COLLECTION.SKIP_CONFIRMATION}${transactionID}`, skipConfirmation);
}

function startMoneyRequest(
    iouType: ValueOf<typeof CONST.IOU.TYPE>,
    reportID: string,
    requestType?: IOURequestType,
    skipConfirmation = false,
    backToReport?: string,
    draftTransactions?: OnyxCollection<OnyxTypes.Transaction>,
) {
    Performance.markStart(CONST.TIMING.OPEN_CREATE_EXPENSE);
    const sourceRoute = Navigation.getActiveRoute();
    startSpan(CONST.TELEMETRY.SPAN_OPEN_CREATE_EXPENSE, {
        name: '/money-request-create',
        op: CONST.TELEMETRY.SPAN_OPEN_CREATE_EXPENSE,
        attributes: {
            [CONST.TELEMETRY.ATTRIBUTE_IOU_TYPE]: iouType,
            [CONST.TELEMETRY.ATTRIBUTE_IOU_REQUEST_TYPE]: requestType ?? 'unknown',
            [CONST.TELEMETRY.ATTRIBUTE_REPORT_ID]: reportID,
            [CONST.TELEMETRY.ATTRIBUTE_ROUTE_FROM]: sourceRoute || 'unknown',
        },
    });
    clearMoneyRequest(CONST.IOU.OPTIMISTIC_TRANSACTION_ID, skipConfirmation, draftTransactions);
    switch (requestType) {
        case CONST.IOU.REQUEST_TYPE.MANUAL:
            Navigation.navigate(ROUTES.MONEY_REQUEST_CREATE_TAB_MANUAL.getRoute(CONST.IOU.ACTION.CREATE, iouType, CONST.IOU.OPTIMISTIC_TRANSACTION_ID, reportID, backToReport));
            return;
        case CONST.IOU.REQUEST_TYPE.SCAN:
            Navigation.navigate(ROUTES.MONEY_REQUEST_CREATE_TAB_SCAN.getRoute(CONST.IOU.ACTION.CREATE, iouType, CONST.IOU.OPTIMISTIC_TRANSACTION_ID, reportID, backToReport));
            return;
        case CONST.IOU.REQUEST_TYPE.DISTANCE:
            Navigation.navigate(ROUTES.MONEY_REQUEST_CREATE_TAB_DISTANCE.getRoute(CONST.IOU.ACTION.CREATE, iouType, CONST.IOU.OPTIMISTIC_TRANSACTION_ID, reportID, backToReport));
            return;
        case CONST.IOU.REQUEST_TYPE.TIME:
            Navigation.navigate(ROUTES.MONEY_REQUEST_CREATE_TAB_TIME.getRoute(CONST.IOU.ACTION.CREATE, iouType, CONST.IOU.OPTIMISTIC_TRANSACTION_ID, reportID, backToReport));
            return;
        default:
            Navigation.navigate(ROUTES.MONEY_REQUEST_CREATE.getRoute(CONST.IOU.ACTION.CREATE, iouType, CONST.IOU.OPTIMISTIC_TRANSACTION_ID, reportID, backToReport));
    }
}

function startDistanceRequest(iouType: ValueOf<typeof CONST.IOU.TYPE>, reportID: string, requestType?: IOURequestType, skipConfirmation = false, backToReport?: string) {
    clearMoneyRequest(CONST.IOU.OPTIMISTIC_TRANSACTION_ID, skipConfirmation);
    switch (requestType) {
        case CONST.IOU.REQUEST_TYPE.DISTANCE_MAP:
            Navigation.navigate(ROUTES.DISTANCE_REQUEST_CREATE_TAB_MAP.getRoute(CONST.IOU.ACTION.CREATE, iouType, CONST.IOU.OPTIMISTIC_TRANSACTION_ID, reportID, backToReport));
            return;
        case CONST.IOU.REQUEST_TYPE.DISTANCE_MANUAL:
            Navigation.navigate(ROUTES.DISTANCE_REQUEST_CREATE_TAB_MANUAL.getRoute(CONST.IOU.ACTION.CREATE, iouType, CONST.IOU.OPTIMISTIC_TRANSACTION_ID, reportID, backToReport));
            return;
        case CONST.IOU.REQUEST_TYPE.DISTANCE_GPS:
            Navigation.navigate(ROUTES.DISTANCE_REQUEST_CREATE_TAB_GPS.getRoute(CONST.IOU.ACTION.CREATE, iouType, CONST.IOU.OPTIMISTIC_TRANSACTION_ID, reportID, backToReport));
            return;
        default:
            Navigation.navigate(ROUTES.DISTANCE_REQUEST_CREATE.getRoute(CONST.IOU.ACTION.CREATE, iouType, CONST.IOU.OPTIMISTIC_TRANSACTION_ID, reportID, backToReport));
    }
}

function setMoneyRequestAmount(transactionID: string, amount: number, currency: string, shouldShowOriginalAmount = false) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {amount, currency, shouldShowOriginalAmount});
}

function setMoneyRequestCreated(transactionID: string, created: string, isDraft: boolean) {
    Onyx.merge(`${isDraft ? ONYXKEYS.COLLECTION.TRANSACTION_DRAFT : ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {created});
}

function setMoneyRequestDateAttribute(transactionID: string, start: string, end: string) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {comment: {customUnit: {attributes: {dates: {start, end}}}}});
}

function setMoneyRequestCurrency(transactionID: string, currency: string, isEditing = false) {
    const fieldToUpdate = isEditing ? 'modifiedCurrency' : 'currency';
    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {[fieldToUpdate]: currency});
}

function setMoneyRequestDescription(transactionID: string, comment: string, isDraft: boolean) {
    Onyx.merge(`${isDraft ? ONYXKEYS.COLLECTION.TRANSACTION_DRAFT : ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {comment: {comment: comment.trim()}});
}

function setMoneyRequestMerchant(transactionID: string, merchant: string, isDraft: boolean) {
    Onyx.merge(`${isDraft ? ONYXKEYS.COLLECTION.TRANSACTION_DRAFT : ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {merchant});
}

function setMoneyRequestAttendees(transactionID: string, attendees: Attendee[], isDraft: boolean) {
    Onyx.merge(`${isDraft ? ONYXKEYS.COLLECTION.TRANSACTION_DRAFT : ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {comment: {attendees}});
}

function setMoneyRequestAccountant(transactionID: string, accountant: Accountant, isDraft: boolean) {
    Onyx.merge(`${isDraft ? ONYXKEYS.COLLECTION.TRANSACTION_DRAFT : ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {accountant});
}

function setMoneyRequestPendingFields(transactionID: string, pendingFields: OnyxTypes.Transaction['pendingFields']) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {pendingFields});
}

function setMoneyRequestTimeRate(transactionID: string, rate: number, isDraft: boolean) {
    Onyx.merge(`${isDraft ? ONYXKEYS.COLLECTION.TRANSACTION_DRAFT : ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {comment: {units: {rate}}});
}

function setMoneyRequestTimeCount(transactionID: string, count: number, isDraft: boolean) {
    Onyx.merge(`${isDraft ? ONYXKEYS.COLLECTION.TRANSACTION_DRAFT : ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {comment: {units: {count}}});
}

/**
 * Sets the category for a money request transaction draft.
 * @param transactionID - The transaction ID
 * @param category - The category name
 * @param policy - The policy object, or undefined for P2P transactions where tax info should be cleared
 * @param isMovingFromTrackExpense - If the expense is moved from Track Expense
 */
function setMoneyRequestCategory(transactionID: string, category: string, policy: OnyxEntry<OnyxTypes.Policy>, isMovingFromTrackExpense?: boolean) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {category});
    if (isMovingFromTrackExpense) {
        return;
    }
    if (!policy) {
        setMoneyRequestTaxRate(transactionID, '');
        setMoneyRequestTaxAmount(transactionID, null);
        return;
    }
    const transaction = allTransactionDrafts[`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`];
    const {categoryTaxCode, categoryTaxAmount} = getCategoryTaxCodeAndAmount(category, transaction, policy);
    if (categoryTaxCode && categoryTaxAmount !== undefined) {
        setMoneyRequestTaxRate(transactionID, categoryTaxCode);
        setMoneyRequestTaxAmount(transactionID, categoryTaxAmount);
    }
}

function setMoneyRequestTag(transactionID: string, tag: string) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {tag});
}

function setMoneyRequestBillable(transactionID: string, billable: boolean) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {billable});
}

function setMoneyRequestReimbursable(transactionID: string, reimbursable: boolean) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {reimbursable});
}

function setMoneyRequestParticipants(transactionID: string, participants: Participant[] = [], isTestTransaction = false) {
    // We should change the reportID and isFromGlobalCreate of the test transaction since this flow can start inside an existing report
    return Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {
        participants,
        isFromGlobalCreate: isTestTransaction ? true : undefined,
        reportID: isTestTransaction ? participants?.at(0)?.reportID : undefined,
    });
}

function setMoneyRequestReportID(transactionID: string, reportID: string) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {reportID});
}

function setMoneyRequestReceipt(transactionID: string, source: string, filename: string, isDraft: boolean, type?: string, isTestReceipt = false, isTestDriveReceipt = false) {
    Onyx.merge(`${isDraft ? ONYXKEYS.COLLECTION.TRANSACTION_DRAFT : ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {
        // isTestReceipt = false and isTestDriveReceipt = false are being converted to null because we don't really need to store it in Onyx in those cases
        receipt: {source, filename, type: type ?? '', isTestReceipt: isTestReceipt ? true : null, isTestDriveReceipt: isTestDriveReceipt ? true : null},
    });
}

/**
 * Set custom unit rateID for the transaction draft
 */
function setCustomUnitRateID(transactionID: string, customUnitRateID: string | undefined) {
    const isFakeP2PRate = customUnitRateID === CONST.CUSTOM_UNITS.FAKE_P2P_ID;
    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {
        comment: {
            customUnit: {
                customUnitRateID,
                ...(!isFakeP2PRate && {defaultP2PRate: null}),
            },
        },
    });
}

/**
 * Revert custom unit of the draft transaction to the original transaction's value
 */
function resetDraftTransactionsCustomUnit(transactionID: string | undefined) {
    if (!transactionID) {
        return;
    }

    const originalTransaction = allTransactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
    if (!originalTransaction) {
        return;
    }

    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {
        comment: {
            customUnit: originalTransaction.comment?.customUnit ?? {},
        },
    });
}

/**
 * Set custom unit ID for the transaction draft
 */
function setCustomUnitID(transactionID: string, customUnitID: string) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {comment: {customUnit: {customUnitID}}});
}

function removeSubrate(transaction: OnyxEntry<OnyxTypes.Transaction>, currentIndex: string) {
    // Index comes from the route params and is a string
    const index = Number(currentIndex);
    if (index === -1) {
        return;
    }
    const existingSubrates = transaction?.comment?.customUnit?.subRates ?? [];

    const newSubrates = [...existingSubrates];
    newSubrates.splice(index, 1);

    // Onyx.merge won't remove the null nested object values, this is a workaround
    // to remove nested keys while also preserving other object keys
    // Doing a deep clone of the transaction to avoid mutating the original object and running into a cache issue when using Onyx.set
    const newTransaction: OnyxTypes.Transaction = {
        // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
        ...(transaction as OnyxTypes.Transaction),
        comment: {
            ...transaction?.comment,
            customUnit: {
                ...transaction?.comment?.customUnit,
                subRates: newSubrates,
                quantity: null,
            },
        },
    };

    Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transaction?.transactionID}`, newTransaction);
}

function updateSubrate(transaction: OnyxEntry<OnyxTypes.Transaction>, currentIndex: string, quantity: number, id: string, name: string, rate: number) {
    // Index comes from the route params and is a string
    const index = Number(currentIndex);
    if (index === -1) {
        return;
    }
    const existingSubrates = transaction?.comment?.customUnit?.subRates ?? [];

    if (index >= existingSubrates.length) {
        return;
    }

    const newSubrates = [...existingSubrates];
    newSubrates.splice(index, 1, {quantity, id, name, rate});

    // Onyx.merge won't remove the null nested object values, this is a workaround
    // to remove nested keys while also preserving other object keys
    // Doing a deep clone of the transaction to avoid mutating the original object and running into a cache issue when using Onyx.set
    const newTransaction: OnyxTypes.Transaction = {
        // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
        ...(transaction as OnyxTypes.Transaction),
        comment: {
            ...transaction?.comment,
            customUnit: {
                ...transaction?.comment?.customUnit,
                subRates: newSubrates,
                quantity: null,
            },
        },
    };

    Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transaction?.transactionID}`, newTransaction);
}

function clearSubrates(transactionID: string) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {comment: {customUnit: {subRates: []}}});
}

function addSubrate(transaction: OnyxEntry<OnyxTypes.Transaction>, currentIndex: string, quantity: number, id: string, name: string, rate: number) {
    // Index comes from the route params and is a string
    const index = Number(currentIndex);
    if (index === -1) {
        return;
    }
    const existingSubrates = transaction?.comment?.customUnit?.subRates ?? [];

    if (index !== existingSubrates.length) {
        return;
    }

    const newSubrates = [...existingSubrates];
    newSubrates.push({quantity, id, name, rate});

    // Onyx.merge won't remove the null nested object values, this is a workaround
    // to remove nested keys while also preserving other object keys
    // Doing a deep clone of the transaction to avoid mutating the original object and running into a cache issue when using Onyx.set
    const newTransaction: OnyxTypes.Transaction = {
        // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
        ...(transaction as OnyxTypes.Transaction),
        comment: {
            ...transaction?.comment,
            customUnit: {
                ...transaction?.comment?.customUnit,
                subRates: newSubrates,
                quantity: null,
            },
        },
    };

    Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transaction?.transactionID}`, newTransaction);
}

function setMoneyRequestDistance(transactionID: string, distanceAsFloat: number, isDraft: boolean) {
    Onyx.merge(`${isDraft ? ONYXKEYS.COLLECTION.TRANSACTION_DRAFT : ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {comment: {customUnit: {quantity: distanceAsFloat}}});
}

/**
 * Set the odometer readings for a transaction
 */
function setMoneyRequestOdometerReading(transactionID: string, startReading: number, endReading: number, isDraft: boolean) {
    Onyx.merge(`${isDraft ? ONYXKEYS.COLLECTION.TRANSACTION_DRAFT : ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {
        comment: {
            odometerStart: startReading,
            odometerEnd: endReading,
        },
    });
}

/**
 * Set the distance rate of a transaction.
 * Used when creating a new transaction or moving an existing one from Self DM
 */
function setMoneyRequestDistanceRate(transactionID: string, customUnitRateID: string, policy: OnyxEntry<OnyxTypes.Policy>, isDraft: boolean) {
    if (policy) {
        Onyx.merge(ONYXKEYS.NVP_LAST_SELECTED_DISTANCE_RATES, {[policy.id]: customUnitRateID});
    }

    const distanceRate = DistanceRequestUtils.getRateByCustomUnitRateID({policy, customUnitRateID});
    const transaction = isDraft ? allTransactionDrafts[`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`] : allTransactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
    let newDistance;
    if (distanceRate?.unit && distanceRate?.unit !== transaction?.comment?.customUnit?.distanceUnit) {
        newDistance = DistanceRequestUtils.convertDistanceUnit(getDistanceInMeters(transaction, transaction?.comment?.customUnit?.distanceUnit), distanceRate.unit);
    }
    Onyx.merge(`${isDraft ? ONYXKEYS.COLLECTION.TRANSACTION_DRAFT : ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {
        comment: {
            customUnit: {
                customUnitRateID,
                ...(!!policy && {defaultP2PRate: null}),
                ...(distanceRate && {distanceUnit: distanceRate.unit}),
                ...(newDistance && {quantity: newDistance}),
            },
        },
    });
}

/** Helper function to get the receipt error for expenses, or the generic error if there's no receipt */
function getReceiptError(
    receipt: OnyxEntry<Receipt>,
    filename?: string,
    isScanRequest = true,
    errorKey?: number,
    action?: IOUActionParams,
    retryParams?: StartSplitBilActionParams | CreateTrackExpenseParams | RequestMoneyInformation | ReplaceReceipt,
): Errors | ErrorFields {
    const formattedRetryParams = typeof retryParams === 'string' ? retryParams : JSON.stringify(retryParams);

    return isEmptyObject(receipt) || !isScanRequest
        ? getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericCreateFailureMessage', errorKey)
        : getMicroSecondOnyxErrorObject(
              {
                  error: CONST.IOU.RECEIPT_ERROR,
                  source: receipt.source?.toString() ?? '',
                  filename: filename ?? '',
                  action: action ?? '',
                  retryParams: formattedRetryParams,
              },
              errorKey,
          );
}

/** Helper function to get optimistic fields violations onyx data */
function getFieldViolationsOnyxData(iouReport: OnyxTypes.Report): SetRequired<OnyxData<typeof ONYXKEYS.COLLECTION.REPORT_VIOLATIONS>, 'optimisticData' | 'failureData'> {
    const missingFields: OnyxTypes.ReportFieldsViolations = {};
    const excludedFields = Object.values(CONST.REPORT_VIOLATIONS_EXCLUDED_FIELDS) as string[];

    for (const field of Object.values(iouReport.fieldList ?? {})) {
        if (excludedFields.includes(field.fieldID) || !!field.value || !!field.defaultValue) {
            continue;
        }
        // in case of missing field violation the empty object is indicator.
        missingFields[field.fieldID] = {};
    }

    return {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.SET,
                key: `${ONYXKEYS.COLLECTION.REPORT_VIOLATIONS}${iouReport.reportID}`,
                value: {
                    fieldRequired: missingFields,
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.SET,
                key: `${ONYXKEYS.COLLECTION.REPORT_VIOLATIONS}${iouReport.reportID}`,
                value: null,
            },
        ],
    };
}

type BuildOnyxDataForTestDriveIOUParams = {
    transaction: OnyxTypes.Transaction;
    iouOptimisticParams: MoneyRequestOptimisticParams['iou'];
    chatOptimisticParams: MoneyRequestOptimisticParams['chat'];
    testDriveCommentReportActionID?: string;
};

function buildOnyxDataForTestDriveIOU(
    testDriveIOUParams: BuildOnyxDataForTestDriveIOUParams,
): OnyxData<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.TRANSACTION_DRAFT> {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.REPORT>> = [];
    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.REPORT>> = [];
    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.TRANSACTION_DRAFT>> = [];

    const optimisticIOUReportAction = buildOptimisticIOUReportAction({
        type: CONST.IOU.REPORT_ACTION_TYPE.PAY,
        amount: testDriveIOUParams.transaction.amount,
        currency: testDriveIOUParams.transaction.currency,
        comment: testDriveIOUParams.transaction.comment?.comment ?? '',
        participants: testDriveIOUParams.transaction.participants ?? [],
        paymentType: CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
        iouReportID: testDriveIOUParams.iouOptimisticParams.report.reportID,
        transactionID: testDriveIOUParams.transaction.transactionID,
        reportActionID: testDriveIOUParams.iouOptimisticParams.action.reportActionID,
    });
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const text = Localize.translateLocal('testDrive.employeeInviteMessage', personalDetailsList?.[userAccountID]?.firstName ?? '');
    const textComment = buildOptimisticAddCommentReportAction(text, undefined, userAccountID, undefined, undefined, testDriveIOUParams.testDriveCommentReportActionID);
    textComment.reportAction.created = DateUtils.subtractMillisecondsFromDateTime(testDriveIOUParams.iouOptimisticParams.createdAction.created, 1);

    optimisticData.push(
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${testDriveIOUParams.chatOptimisticParams.report?.reportID}`,
            value: {
                [textComment.reportAction.reportActionID]: textComment.reportAction,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${testDriveIOUParams.iouOptimisticParams.report.reportID}`,
            value: {
                ...{lastActionType: CONST.REPORT.ACTIONS.TYPE.MARKED_REIMBURSED, statusNum: CONST.REPORT.STATUS_NUM.REIMBURSED},
                hasOutstandingChildRequest: false,
                lastActorAccountID: deprecatedCurrentUserPersonalDetails?.accountID,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${testDriveIOUParams.iouOptimisticParams.report.reportID}`,
            value: {
                [testDriveIOUParams.iouOptimisticParams.action.reportActionID]: optimisticIOUReportAction,
            },
        },
    );

    return {
        optimisticData,
        successData,
        failureData,
    };
}

/** Builds the Onyx data for an expense */
function buildOnyxDataForMoneyRequest(moneyRequestParams: BuildOnyxDataForMoneyRequestParams): [OnyxUpdate[], OnyxUpdate[], OnyxUpdate[]] {
    const {
        isNewChatReport,
        shouldCreateNewMoneyRequestReport,
        isOneOnOneSplit = false,
        existingTransactionThreadReportID,
        policyParams = {},
        optimisticParams,
        retryParams,
        participant,
        shouldGenerateTransactionThreadReport = true,
        isASAPSubmitBetaEnabled,
        currentUserAccountIDParam,
        currentUserEmailParam,
        hasViolations,
        quickAction,
    } = moneyRequestParams;
    const {policy, policyCategories, policyTagList} = policyParams;
    const {
        chat,
        iou,
        transactionParams: {transaction, transactionThreadReport, transactionThreadCreatedReportAction},
        policyRecentlyUsed,
        personalDetailListAction,
        nextStep,
        nextStepDeprecated,
        testDriveCommentReportActionID,
    } = optimisticParams;

    const isScanRequest = isScanRequestTransactionUtils(transaction);
    const isPerDiemRequest = isPerDiemRequestTransactionUtils(transaction);
    const outstandingChildRequest = getOutstandingChildRequest(iou.report);
    const clearedPendingFields = Object.fromEntries(Object.keys(transaction.pendingFields ?? {}).map((key) => [key, null]));
    const isMoneyRequestToManagerMcTest = isTestTransactionReport(iou.report);

    const optimisticData: OnyxUpdate[] = [];
    const successData: OnyxUpdate[] = [];
    const failureData: OnyxUpdate[] = [];
    let newQuickAction: ValueOf<typeof CONST.QUICK_ACTIONS>;
    if (isScanRequest) {
        newQuickAction = CONST.QUICK_ACTIONS.REQUEST_SCAN;
    } else if (isPerDiemRequest) {
        newQuickAction = CONST.QUICK_ACTIONS.PER_DIEM;
    } else {
        newQuickAction = CONST.QUICK_ACTIONS.REQUEST_MANUAL;
    }

    if (isDistanceRequestTransactionUtils(transaction)) {
        newQuickAction = CONST.QUICK_ACTIONS.REQUEST_DISTANCE;
    }
    const existingTransactionThreadReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${existingTransactionThreadReportID}`] ?? null;

    if (chat.report) {
        optimisticData.push({
            // Use SET for new reports because it doesn't exist yet, is faster and we need the data to be available when we navigate to the chat page
            onyxMethod: isNewChatReport ? Onyx.METHOD.SET : Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${chat.report.reportID}`,
            value: {
                ...chat.report,
                lastReadTime: DateUtils.getDBTime(),
                ...(shouldCreateNewMoneyRequestReport ? {lastVisibleActionCreated: chat.reportPreviewAction.created} : {}),
                // do not update iouReportID if auto submit beta is enabled and it is a scan request
                ...(isASAPSubmitBetaEnabled && isScanRequest ? {} : {iouReportID: iou.report.reportID}),
                ...outstandingChildRequest,
                ...(isNewChatReport ? {pendingFields: {createChat: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD}} : {}),
            },
        });
    }

    optimisticData.push(
        {
            onyxMethod: shouldCreateNewMoneyRequestReport ? Onyx.METHOD.SET : Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${iou.report.reportID}`,
            value: {
                ...iou.report,
                lastVisibleActionCreated: iou.action.created,
                pendingFields: {
                    ...(shouldCreateNewMoneyRequestReport ? {createChat: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD} : {preview: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}),
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`,
            value: transaction,
        },
        isNewChatReport
            ? {
                  onyxMethod: Onyx.METHOD.SET,
                  key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chat.report?.reportID}`,
                  value: {
                      [chat.createdAction.reportActionID]: chat.createdAction,
                      [chat.reportPreviewAction.reportActionID]: chat.reportPreviewAction,
                  },
              }
            : {
                  onyxMethod: Onyx.METHOD.MERGE,
                  key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chat.report?.reportID}`,
                  value: {
                      [chat.reportPreviewAction.reportActionID]: chat.reportPreviewAction,
                  },
              },
        shouldCreateNewMoneyRequestReport
            ? {
                  onyxMethod: Onyx.METHOD.SET,
                  key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iou.report.reportID}`,
                  value: {
                      [iou.createdAction.reportActionID]: iou.createdAction as OnyxTypes.ReportAction,
                      [iou.action.reportActionID]: iou.action as OnyxTypes.ReportAction,
                  },
              }
            : {
                  onyxMethod: Onyx.METHOD.MERGE,
                  key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iou.report.reportID}`,
                  value: {
                      [iou.action.reportActionID]: iou.action as OnyxTypes.ReportAction,
                  },
              },
    );

    if (shouldGenerateTransactionThreadReport) {
        optimisticData.push(
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReport?.reportID}`,
                value: {
                    ...transactionThreadReport,
                    pendingFields: {createChat: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD},
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${transactionThreadReport?.reportID}`,
                value: {
                    isOptimisticReport: true,
                },
            },
        );
    }

    if (isNewChatReport) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${chat.report?.reportID}`,
            value: {
                isOptimisticReport: true,
            },
        });
    }

    if (shouldCreateNewMoneyRequestReport) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${iou.report?.reportID}`,
            value: {
                isOptimisticReport: true,
                hasOnceLoadedReportActions: true,
            },
        });
    }

    if (shouldGenerateTransactionThreadReport && !isEmptyObject(transactionThreadCreatedReportAction)) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReport?.reportID}`,
            value: {
                [transactionThreadCreatedReportAction.reportActionID]: transactionThreadCreatedReportAction,
            },
        });
    }

    if (policyRecentlyUsed.categories?.length) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_CATEGORIES}${iou.report.policyID}`,
            value: policyRecentlyUsed.categories,
        });
    }

    if (policyRecentlyUsed.currencies?.length) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.SET,
            key: ONYXKEYS.RECENTLY_USED_CURRENCIES,
            value: policyRecentlyUsed.currencies,
        });
    }

    if (!isEmptyObject(policyRecentlyUsed.tags)) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS}${iou.report.policyID}`,
            value: policyRecentlyUsed.tags,
        });
    }

    if (policyRecentlyUsed.destinations?.length) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_DESTINATIONS}${iou.report.policyID}`,
            value: policyRecentlyUsed.destinations,
        });
    }

    if (transaction.receipt?.isTestDriveReceipt) {
        const {
            optimisticData: testDriveOptimisticData = [],
            successData: testDriveSuccessData = [],
            failureData: testDriveFailureData = [],
        } = buildOnyxDataForTestDriveIOU({
            transaction,
            iouOptimisticParams: iou,
            chatOptimisticParams: chat,
            testDriveCommentReportActionID,
        });
        optimisticData.push(...testDriveOptimisticData);
        successData.push(...testDriveSuccessData);
        failureData.push(...testDriveFailureData);
    }

    let iouAction = iou.action;
    let iouReport = iou.report;
    if (isMoneyRequestToManagerMcTest) {
        const date = new Date();
        const isTestReceipt = transaction.receipt?.isTestReceipt ?? false;
        const managerMcTestParticipant = getManagerMcTestParticipant() ?? {};
        const optimisticIOUReportAction = buildOptimisticIOUReportAction({
            type: isScanRequest && !isTestReceipt ? CONST.IOU.REPORT_ACTION_TYPE.CREATE : CONST.IOU.REPORT_ACTION_TYPE.PAY,
            amount: iou.report?.total ?? 0,
            currency: iou.report?.currency ?? '',
            comment: '',
            participants: [managerMcTestParticipant],
            paymentType: isScanRequest && !isTestReceipt ? undefined : CONST.IOU.PAYMENT_TYPE.ELSEWHERE,
            iouReportID: iou.report.reportID,
            transactionID: transaction.transactionID,
            reportActionID: iou.action.reportActionID,
        });
        iouAction = optimisticIOUReportAction;
        iouReport = {
            ...iouReport,
            ...(!isScanRequest || isTestReceipt
                ? {lastActionType: CONST.REPORT.ACTIONS.TYPE.MARKED_REIMBURSED, stateNum: CONST.REPORT.STATE_NUM.APPROVED, statusNum: CONST.REPORT.STATUS_NUM.REIMBURSED}
                : undefined),
            hasOutstandingChildRequest: false,
            lastActorAccountID: deprecatedCurrentUserPersonalDetails?.accountID,
        };

        optimisticData.push(
            // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING}`,
                value: {[CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.SCAN_TEST_TOOLTIP]: DateUtils.getDBTime(date.valueOf())},
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${iou.report.reportID}`,
                value: {
                    ...iou.report,
                    ...(!isScanRequest || isTestReceipt
                        ? {lastActionType: CONST.REPORT.ACTIONS.TYPE.MARKED_REIMBURSED, stateNum: CONST.REPORT.STATE_NUM.APPROVED, statusNum: CONST.REPORT.STATUS_NUM.REIMBURSED}
                        : undefined),
                    hasOutstandingChildRequest: false,
                    lastActorAccountID: deprecatedCurrentUserPersonalDetails?.accountID,
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iou.report.reportID}`,
                value: {
                    [iou.action.reportActionID]: {
                        ...(optimisticIOUReportAction as OnyxTypes.ReportAction),
                    },
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`,
                value: {
                    ...transaction,
                },
            },
        );
    }

    const redundantParticipants: Record<number, null> = {};
    if (!isEmptyObject(personalDetailListAction)) {
        const successPersonalDetailListAction: Record<number, null> = {};

        // BE will send different participants. We clear the optimistic ones to avoid duplicated entries
        for (const accountIDKey of Object.keys(personalDetailListAction)) {
            const accountID = Number(accountIDKey);
            successPersonalDetailListAction[accountID] = null;
            redundantParticipants[accountID] = null;
        }

        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
            value: personalDetailListAction,
        });
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
            value: successPersonalDetailListAction,
        });
    }

    if (!isEmptyObject(nextStepDeprecated)) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.NEXT_STEP}${iou.report.reportID}`,
            value: nextStepDeprecated,
        });
    }
    if (!isEmptyObject(nextStep)) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${iou.report.reportID}`,
            value: {
                nextStep,
                pendingFields: {
                    nextStep: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
            },
        });
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${iou.report.reportID}`,
            value: {
                pendingFields: {
                    nextStep: null,
                },
            },
        });
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${iou.report.reportID}`,
            value: {
                nextStep: iou.report.nextStep ?? null,
                pendingFields: {
                    nextStep: null,
                },
            },
        });
    }

    if (isNewChatReport) {
        successData.push(
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${chat.report?.reportID}`,
                value: {
                    participants: redundantParticipants,
                    pendingFields: null,
                    errorFields: null,
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${chat.report?.reportID}`,
                value: {
                    isOptimisticReport: false,
                },
            },
        );
    }

    successData.push(
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${iou.report.reportID}`,
            value: {
                participants: redundantParticipants,
                pendingFields: null,
                errorFields: null,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${iou.report.reportID}`,
            value: {
                isOptimisticReport: false,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`,
            value: {
                pendingAction: null,
                pendingFields: clearedPendingFields,
                // The routes contains the distance in meters. Clearing the routes ensures we use the distance
                // in the correct unit stored under the transaction customUnit once the request is created.
                // The route is also not saved in the backend, so we can't rely on it.
                routes: null,
            },
        },

        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chat.report?.reportID}`,
            value: {
                ...(isNewChatReport
                    ? {
                          [chat.createdAction.reportActionID]: {
                              pendingAction: null,
                              errors: null,
                              isOptimisticAction: null,
                          },
                      }
                    : {}),
                [chat.reportPreviewAction.reportActionID]: {
                    pendingAction: null,
                    isOptimisticAction: null,
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iou.report.reportID}`,
            value: {
                ...(shouldCreateNewMoneyRequestReport
                    ? {
                          [iou.createdAction.reportActionID]: {
                              pendingAction: null,
                              errors: null,
                              isOptimisticAction: null,
                          },
                      }
                    : {}),
                [iou.action.reportActionID]: {
                    pendingAction: null,
                    errors: null,
                    isOptimisticAction: null,
                },
            },
        },
    );

    if (shouldGenerateTransactionThreadReport) {
        successData.push(
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReport?.reportID}`,
                value: {
                    participants: redundantParticipants,
                    pendingFields: null,
                    errorFields: null,
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${transactionThreadReport?.reportID}`,
                value: {
                    isOptimisticReport: false,
                },
            },
        );
    }

    if (shouldGenerateTransactionThreadReport && !isEmptyObject(transactionThreadCreatedReportAction)) {
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReport?.reportID}`,
            value: {
                [transactionThreadCreatedReportAction.reportActionID]: {
                    pendingAction: null,
                    errors: null,
                    isOptimisticAction: null,
                },
            },
        });
    }

    const errorKey = DateUtils.getMicroseconds();

    failureData.push(
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${chat.report?.reportID}`,
            value: {
                iouReportID: chat.report?.iouReportID,
                lastReadTime: chat.report?.lastReadTime,
                lastVisibleActionCreated: chat.report?.lastVisibleActionCreated,
                pendingFields: null,
                hasOutstandingChildRequest: chat.report?.hasOutstandingChildRequest,
                ...(isNewChatReport
                    ? {
                          errorFields: {
                              createChat: getMicroSecondOnyxErrorWithTranslationKey('report.genericCreateReportFailureMessage'),
                          },
                      }
                    : {}),
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${iou.report.reportID}`,
            value: {
                pendingFields: null,
                errorFields: {
                    ...(shouldCreateNewMoneyRequestReport ? {createChat: getMicroSecondOnyxErrorWithTranslationKey('report.genericCreateReportFailureMessage')} : {}),
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`,
            value: {
                errors: getReceiptError(transaction.receipt, transaction.receipt?.filename, isScanRequest, errorKey, CONST.IOU.ACTION_PARAMS.MONEY_REQUEST, retryParams),
                pendingFields: clearedPendingFields,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iou.report.reportID}`,
            value: {
                ...(shouldCreateNewMoneyRequestReport
                    ? {
                          [iou.createdAction.reportActionID]: {
                              errors: getReceiptError(transaction.receipt, transaction.receipt?.filename, isScanRequest, errorKey, CONST.IOU.ACTION_PARAMS.MONEY_REQUEST, retryParams),
                          },
                          [iou.action.reportActionID]: {
                              errors: getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericCreateFailureMessage'),
                          },
                      }
                    : {
                          [iou.action.reportActionID]: {
                              errors: getReceiptError(transaction.receipt, transaction.receipt?.filename, isScanRequest, errorKey, CONST.IOU.ACTION_PARAMS.MONEY_REQUEST, retryParams),
                          },
                      }),
            },
        },
    );

    if (shouldGenerateTransactionThreadReport) {
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReport?.reportID}`,
            value: {
                pendingFields: null,
                errorFields: existingTransactionThreadReport
                    ? null
                    : {
                          createChat: getMicroSecondOnyxErrorWithTranslationKey('report.genericCreateReportFailureMessage'),
                      },
            },
        });
    }

    if (!isOneOnOneSplit) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.SET,
            key: ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE,
            value: {
                action: newQuickAction,
                chatReportID: chat.report?.reportID,
                isFirstQuickAction: isEmptyObject(quickAction),
            },
        });
        failureData.push({
            onyxMethod: Onyx.METHOD.SET,
            key: ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE,
            value: quickAction ?? null,
        });
    }

    if (shouldGenerateTransactionThreadReport && !isEmptyObject(transactionThreadCreatedReportAction)) {
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReport?.reportID}`,
            value: {
                [transactionThreadCreatedReportAction.reportActionID]: {
                    errors: getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericCreateFailureMessage'),
                },
            },
        });
    }

    const searchUpdate = getSearchOnyxUpdate({
        transaction,
        participant,
        iouReport,
        iouAction,
        policy,
        transactionThreadReportID: transactionThreadReport?.reportID,
        isFromOneTransactionReport: isOneTransactionReport(iou.report),
    });

    if (searchUpdate) {
        if (searchUpdate.optimisticData) {
            optimisticData.push(...searchUpdate.optimisticData);
        }
        if (searchUpdate.successData) {
            successData.push(...searchUpdate.successData);
        }
    }

    // We don't need to compute violations unless we're on a paid policy
    if (!policy || !isPaidGroupPolicy(policy) || transaction.reportID === CONST.REPORT.UNREPORTED_REPORT_ID) {
        return [optimisticData, successData, failureData];
    }
    const violationsOnyxData = ViolationsUtils.getViolationsOnyxData(
        transaction,
        [],
        policy,
        policyTagList ?? {},
        policyCategories ?? {},
        hasDependentTags(policy, policyTagList ?? {}),
        false,
    );

    if (violationsOnyxData) {
        const shouldFixViolations = Array.isArray(violationsOnyxData.value) && violationsOnyxData.value.length > 0;
        const optimisticNextStep = buildOptimisticNextStep({
            report: iou.report,
            predictedNextStatus: iou.report.statusNum ?? CONST.REPORT.STATE_NUM.OPEN,
            shouldFixViolations,
            policy,
            currentUserAccountIDParam,
            currentUserEmailParam,
            hasViolations,
            isASAPSubmitBetaEnabled,
        });
        optimisticData.push(violationsOnyxData, {
            key: `${ONYXKEYS.COLLECTION.NEXT_STEP}${iou.report.reportID}`,
            onyxMethod: Onyx.METHOD.SET,
            // buildOptimisticNextStep is used in parallel
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            value: buildNextStepNew({
                report: iou.report,
                predictedNextStatus: iou.report.statusNum ?? CONST.REPORT.STATE_NUM.OPEN,
                shouldFixViolations,
                policy,
                currentUserAccountIDParam,
                currentUserEmailParam,
                hasViolations,
                isASAPSubmitBetaEnabled,
            }),
        });
        optimisticData.push({
            key: `${ONYXKEYS.COLLECTION.REPORT}${iou.report.reportID}`,
            onyxMethod: Onyx.METHOD.MERGE,
            value: {
                nextStep: optimisticNextStep,
                pendingFields: {
                    nextStep: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
            },
        });
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${iou.report.reportID}`,
            value: {
                pendingFields: {
                    nextStep: null,
                },
            },
        });
        failureData.push({
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction.transactionID}`,
            value: [],
        });
        failureData.push({
            key: `${ONYXKEYS.COLLECTION.REPORT}${iou.report.reportID}`,
            onyxMethod: Onyx.METHOD.MERGE,
            value: {
                nextStep: iou.report.nextStep ?? null,
                pendingFields: {
                    nextStep: null,
                },
            },
        });
    }

    return [optimisticData, successData, failureData];
}

type BuildOnyxDataForTrackExpenseParams = {
    chat: {report: OnyxInputValue<OnyxTypes.Report>; previewAction: OnyxInputValue<ReportAction>};
    iou: {report: OnyxInputValue<OnyxTypes.Report>; createdAction: OptimisticCreatedReportAction; action: OptimisticIOUReportAction};
    transactionParams: {transaction: OnyxTypes.Transaction; threadReport: OptimisticChatReport | null; threadCreatedReportAction: OptimisticCreatedReportAction | null};
    policyParams: {policy?: OnyxInputValue<OnyxTypes.Policy>; tagList?: OnyxInputValue<OnyxTypes.PolicyTagLists>; categories?: OnyxInputValue<OnyxTypes.PolicyCategories>};
    shouldCreateNewMoneyRequestReport: boolean;
    existingTransactionThreadReportID?: string;
    actionableTrackExpenseWhisper?: OnyxInputValue<OnyxTypes.ReportAction>;
    retryParams?: StartSplitBilActionParams | CreateTrackExpenseParams | RequestMoneyInformation | ReplaceReceipt;
    participant?: Participant;
    isASAPSubmitBetaEnabled: boolean;
    quickAction: OnyxEntry<OnyxTypes.QuickAction>;
};

/** Builds the Onyx data for track expense */
function buildOnyxDataForTrackExpense({
    chat,
    iou,
    transactionParams,
    policyParams = {},
    shouldCreateNewMoneyRequestReport,
    existingTransactionThreadReportID,
    actionableTrackExpenseWhisper,
    retryParams,
    participant,
    isASAPSubmitBetaEnabled,
    quickAction,
}: BuildOnyxDataForTrackExpenseParams): [OnyxUpdate[], OnyxUpdate[], OnyxUpdate[]] {
    const {report: chatReport, previewAction: reportPreviewAction} = chat;
    const {report: iouReport, createdAction: iouCreatedAction, action: iouAction} = iou;
    const {transaction, threadReport: transactionThreadReport, threadCreatedReportAction: transactionThreadCreatedReportAction} = transactionParams;
    const {policy, tagList: policyTagList, categories: policyCategories} = policyParams;

    const isScanRequest = isScanRequestTransactionUtils(transaction);
    const isDistanceRequest = isDistanceRequestTransactionUtils(transaction);
    const clearedPendingFields = Object.fromEntries(Object.keys(transaction.pendingFields ?? {}).map((key) => [key, null]));

    const optimisticData: OnyxUpdate[] = [];
    const successData: OnyxUpdate[] = [];
    const failureData: OnyxUpdate[] = [];

    const isSelfDMReport = isSelfDM(chatReport);
    let newQuickAction: QuickActionName = isSelfDMReport ? CONST.QUICK_ACTIONS.TRACK_MANUAL : CONST.QUICK_ACTIONS.REQUEST_MANUAL;
    if (isScanRequest) {
        newQuickAction = isSelfDMReport ? CONST.QUICK_ACTIONS.TRACK_SCAN : CONST.QUICK_ACTIONS.REQUEST_SCAN;
    } else if (isDistanceRequest) {
        newQuickAction = isSelfDMReport ? CONST.QUICK_ACTIONS.TRACK_DISTANCE : CONST.QUICK_ACTIONS.REQUEST_DISTANCE;
    }
    const existingTransactionThreadReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${existingTransactionThreadReportID}`] ?? null;

    if (chatReport) {
        optimisticData.push(
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`,
                value: {
                    ...chatReport,
                    lastMessageText: getReportActionText(iouAction),
                    lastMessageHtml: getReportActionHtml(iouAction),
                    lastReadTime: DateUtils.getDBTime(),
                    // do not update iouReportID if auto submit beta is enabled and it is a scan request
                    iouReportID: isASAPSubmitBetaEnabled && isScanRequest ? null : iouReport?.reportID,
                    lastVisibleActionCreated: shouldCreateNewMoneyRequestReport ? reportPreviewAction?.created : chatReport.lastVisibleActionCreated,
                },
            },
            {
                onyxMethod: Onyx.METHOD.SET,
                key: ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE,
                value: {
                    action: newQuickAction,
                    chatReportID: chatReport.reportID,
                    isFirstQuickAction: isEmptyObject(quickAction),
                },
            },
        );

        if (actionableTrackExpenseWhisper && !iouReport) {
            optimisticData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport?.reportID}`,
                value: {
                    [actionableTrackExpenseWhisper.reportActionID]: actionableTrackExpenseWhisper,
                },
            });
            optimisticData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`,
                value: {
                    lastReadTime: actionableTrackExpenseWhisper.created,
                    lastVisibleActionCreated: actionableTrackExpenseWhisper.created,
                    lastMessageText: CONST.ACTIONABLE_TRACK_EXPENSE_WHISPER_MESSAGE,
                },
            });
            successData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport?.reportID}`,
                value: {
                    [actionableTrackExpenseWhisper.reportActionID]: {pendingAction: null, errors: null},
                },
            });
            failureData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport?.reportID}`,
                value: {[actionableTrackExpenseWhisper.reportActionID]: null},
            });
        }
    }

    if (iouReport) {
        optimisticData.push(
            {
                onyxMethod: shouldCreateNewMoneyRequestReport ? Onyx.METHOD.SET : Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport.reportID}`,
                value: {
                    ...iouReport,
                    lastMessageText: getReportActionText(iouAction),
                    lastMessageHtml: getReportActionHtml(iouAction),
                    pendingFields: {
                        ...(shouldCreateNewMoneyRequestReport ? {createChat: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD} : {preview: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}),
                    },
                },
            },
            shouldCreateNewMoneyRequestReport
                ? {
                      onyxMethod: Onyx.METHOD.SET,
                      key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport.reportID}`,
                      value: {
                          [iouCreatedAction.reportActionID]: iouCreatedAction as OnyxTypes.ReportAction,
                          [iouAction.reportActionID]: iouAction as OnyxTypes.ReportAction,
                      },
                  }
                : {
                      onyxMethod: Onyx.METHOD.MERGE,
                      key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport.reportID}`,
                      value: {
                          [iouAction.reportActionID]: iouAction as OnyxTypes.ReportAction,
                      },
                  },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport?.reportID}`,
                value: {
                    ...(reportPreviewAction && {[reportPreviewAction.reportActionID]: reportPreviewAction}),
                },
            },
        );
        if (shouldCreateNewMoneyRequestReport) {
            optimisticData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${iouReport.reportID}`,
                value: {
                    isOptimisticReport: true,
                },
            });
        }
    } else {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport?.reportID}`,
            value: {
                [iouAction.reportActionID]: iouAction as OnyxTypes.ReportAction,
            },
        });
    }

    optimisticData.push(
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`,
            value: transaction,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReport?.reportID}`,
            value: {
                ...transactionThreadReport,
                pendingFields: {createChat: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD},
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${transactionThreadReport?.reportID}`,
            value: {
                isOptimisticReport: true,
            },
        },
    );

    if (!isEmptyObject(transactionThreadCreatedReportAction)) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReport?.reportID}`,
            value: {
                [transactionThreadCreatedReportAction.reportActionID]: transactionThreadCreatedReportAction,
            },
        });
    }

    if (iouReport) {
        successData.push(
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport?.reportID}`,
                value: {
                    pendingFields: null,
                    errorFields: null,
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport?.reportID}`,
                value: {
                    ...(shouldCreateNewMoneyRequestReport
                        ? {
                              [iouCreatedAction.reportActionID]: {
                                  pendingAction: null,
                                  errors: null,
                              },
                          }
                        : {}),
                    [iouAction.reportActionID]: {
                        pendingAction: null,
                        errors: null,
                    },
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport?.reportID}`,
                value: {
                    ...(reportPreviewAction && {[reportPreviewAction.reportActionID]: {pendingAction: null}}),
                },
            },
        );
        if (shouldCreateNewMoneyRequestReport) {
            successData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${iouReport.reportID}`,
                value: {
                    isOptimisticReport: false,
                },
            });
        }
    } else {
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport?.reportID}`,
            value: {
                [iouAction.reportActionID]: {
                    pendingAction: null,
                    errors: null,
                },
                ...(reportPreviewAction && {[reportPreviewAction.reportActionID]: {pendingAction: null}}),
            },
        });
    }

    successData.push(
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReport?.reportID}`,
            value: {
                pendingFields: null,
                errorFields: null,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${transactionThreadReport?.reportID}`,
            value: {
                isOptimisticReport: false,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`,
            value: {
                pendingAction: null,
                pendingFields: clearedPendingFields,
                routes: null,
            },
        },
    );

    if (!isEmptyObject(transactionThreadCreatedReportAction)) {
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReport?.reportID}`,
            value: {
                [transactionThreadCreatedReportAction.reportActionID]: {
                    pendingAction: null,
                    errors: null,
                },
            },
        });
    }

    failureData.push({
        onyxMethod: Onyx.METHOD.SET,
        key: ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE,
        value: quickAction ?? null,
    });

    if (iouReport) {
        failureData.push(
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport.reportID}`,
                value: {
                    pendingFields: null,
                    errorFields: {
                        ...(shouldCreateNewMoneyRequestReport ? {createChat: getMicroSecondOnyxErrorWithTranslationKey('report.genericCreateReportFailureMessage')} : {}),
                    },
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport.reportID}`,
                value: {
                    ...(shouldCreateNewMoneyRequestReport
                        ? {
                              [iouCreatedAction.reportActionID]: {
                                  errors: getReceiptError(transaction.receipt, transaction.receipt?.filename, isScanRequest, undefined, CONST.IOU.ACTION_PARAMS.TRACK_EXPENSE, retryParams),
                              },
                              [iouAction.reportActionID]: {
                                  errors: getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericCreateFailureMessage'),
                              },
                          }
                        : {
                              [iouAction.reportActionID]: {
                                  errors: getReceiptError(transaction.receipt, transaction.receipt?.filename, isScanRequest, undefined, CONST.IOU.ACTION_PARAMS.TRACK_EXPENSE, retryParams),
                              },
                          }),
                },
            },
        );
    } else {
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport?.reportID}`,
            value: {
                [iouAction.reportActionID]: {
                    errors: getReceiptError(transaction.receipt, transaction.receipt?.filename, isScanRequest, undefined, CONST.IOU.ACTION_PARAMS.TRACK_EXPENSE, retryParams),
                },
            },
        });
    }

    failureData.push(
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport?.reportID}`,
            value: {
                lastReadTime: chatReport?.lastReadTime,
                lastMessageText: chatReport?.lastMessageText,
                lastMessageHtml: chatReport?.lastMessageHtml,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReport?.reportID}`,
            value: {
                pendingFields: null,
                errorFields: existingTransactionThreadReport
                    ? null
                    : {
                          createChat: getMicroSecondOnyxErrorWithTranslationKey('report.genericCreateReportFailureMessage'),
                      },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`,
            value: {
                errors: getReceiptError(transaction.receipt, transaction.receipt?.filename, isScanRequest, undefined, CONST.IOU.ACTION_PARAMS.TRACK_EXPENSE, retryParams),
                pendingFields: clearedPendingFields,
            },
        },
    );

    if (transactionThreadCreatedReportAction?.reportActionID) {
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReport?.reportID}`,
            value: {
                [transactionThreadCreatedReportAction?.reportActionID]: {
                    errors: getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericCreateFailureMessage'),
                },
            },
        });
    }

    const searchUpdate = getSearchOnyxUpdate({
        transaction,
        participant,
        transactionThreadReportID: transactionThreadReport?.reportID,
    });

    if (searchUpdate) {
        if (searchUpdate.optimisticData) {
            optimisticData.push(...searchUpdate.optimisticData);
        }
        if (searchUpdate.successData) {
            successData.push(...searchUpdate.successData);
        }
    }

    // We don't need to compute violations unless we're on a paid policy
    if (!policy || !isPaidGroupPolicy(policy) || transaction.reportID === CONST.REPORT.UNREPORTED_REPORT_ID) {
        return [optimisticData, successData, failureData];
    }

    const violationsOnyxData = ViolationsUtils.getViolationsOnyxData(
        transaction,
        [],
        policy,
        policyTagList ?? {},
        policyCategories ?? {},
        hasDependentTags(policy, policyTagList ?? {}),
        false,
    );

    if (violationsOnyxData) {
        optimisticData.push(violationsOnyxData);
        failureData.push({
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction.transactionID}`,
            value: [],
        });
    }

    // Show field violations only for control policies
    if (isControlPolicy(policy) && iouReport) {
        const {optimisticData: fieldViolationsOptimisticData, failureData: fieldViolationsFailureData} = getFieldViolationsOnyxData(iouReport);
        optimisticData.push(...fieldViolationsOptimisticData);
        failureData.push(...fieldViolationsFailureData);
    }

    return [optimisticData, successData, failureData];
}

function getDeleteTrackExpenseInformation(
    chatReportID: string,
    transactionID: string | undefined,
    reportAction: OnyxTypes.ReportAction,
    isChatReportArchived: boolean | undefined,
    shouldDeleteTransactionFromOnyx = true,
    isMovingTransactionFromTrackExpense = false,
    actionableWhisperReportActionID = '',
    resolution = '',
    shouldRemoveIOUTransaction = true,
) {
    // STEP 1: Get all collections we're updating
    const chatReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`] ?? null;
    const transaction = allTransactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
    const transactionViolations = allTransactionViolations[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`];
    const transactionThreadID = reportAction.childReportID;
    let transactionThread = null;
    if (transactionThreadID) {
        transactionThread = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadID}`] ?? null;
    }

    // STEP 2: Decide if we need to:
    // 1. Delete the transactionThread - delete if there are no visible comments in the thread and we're not moving the transaction
    // 2. Update the moneyRequestPreview to show [Deleted expense] - update if the transactionThread exists AND it isn't being deleted and we're not moving the transaction
    const shouldDeleteTransactionThread = !isMovingTransactionFromTrackExpense && (transactionThreadID ? (reportAction?.childVisibleActionCount ?? 0) === 0 : false);

    const shouldShowDeletedRequestMessage = !isMovingTransactionFromTrackExpense && !!transactionThreadID && !shouldDeleteTransactionThread;

    // STEP 3: Update the IOU reportAction.
    const updatedReportAction = {
        [reportAction.reportActionID]: {
            pendingAction: shouldShowDeletedRequestMessage ? CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE : CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
            previousMessage: reportAction.message,
            message: [
                {
                    type: 'COMMENT',
                    html: '',
                    text: '',
                    isEdited: true,
                    isDeletedParentAction: shouldShowDeletedRequestMessage,
                },
            ],
            originalMessage: {
                IOUTransactionID: shouldRemoveIOUTransaction ? null : transactionID,
            },
            errors: undefined,
        },
        ...(actionableWhisperReportActionID && {[actionableWhisperReportActionID]: {originalMessage: {resolution}}}),
    } as OnyxTypes.ReportActions;
    let canUserPerformWriteAction = true;
    if (chatReport) {
        canUserPerformWriteAction = !!canUserPerformWriteActionReportUtils(chatReport, isChatReportArchived);
    }
    const lastVisibleAction = getLastVisibleAction(chatReportID, canUserPerformWriteAction, updatedReportAction);
    const {lastMessageText = '', lastMessageHtml = ''} = getLastVisibleMessage(chatReportID, canUserPerformWriteAction, updatedReportAction);

    // STEP 4: Build Onyx data
    const optimisticData: Array<
        OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION | typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS | typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>
    > = [];

    if (shouldDeleteTransactionFromOnyx && shouldRemoveIOUTransaction) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: null,
        });
    }
    if (!shouldRemoveIOUTransaction) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: {
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
            },
        });
    }

    optimisticData.push({
        onyxMethod: Onyx.METHOD.SET,
        key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`,
        value: null,
    });

    if (shouldDeleteTransactionThread) {
        optimisticData.push(
            // Use merge instead of set to avoid deleting the report too quickly, which could cause a brief "not found" page to appear.
            // The remaining parts of the report object will be removed after the API call is successful.
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${transactionThreadID}`,
                value: {
                    reportID: null,
                    stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                    statusNum: CONST.REPORT.STATUS_NUM.CLOSED,
                    participants: {
                        [userAccountID]: {
                            notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN,
                        },
                    },
                },
            },
            {
                onyxMethod: Onyx.METHOD.SET,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadID}`,
                value: null,
            },
        );
    }

    optimisticData.push(
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport?.reportID}`,
            value: updatedReportAction,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport?.reportID}`,
            value: {
                lastMessageText,
                lastVisibleActionCreated: lastVisibleAction?.created,
                lastMessageHtml: !lastMessageHtml ? lastMessageText : lastMessageHtml,
            },
        },
    );

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.REPORT>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport?.reportID}`,
            value: {
                [reportAction.reportActionID]: {
                    pendingAction: null,
                    errors: null,
                },
            },
        },
    ];

    // Ensure that any remaining data is removed upon successful completion, even if the server sends a report removal response.
    // This is done to prevent the removal update from lingering in the applyHTTPSOnyxUpdates function.
    if (shouldDeleteTransactionThread && transactionThread) {
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${transactionThreadID}`,
            value: null,
        });
    }

    const failureData: Array<
        OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION | typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS | typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>
    > = [];

    if (shouldDeleteTransactionFromOnyx && shouldRemoveIOUTransaction) {
        failureData.push({
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: transaction ?? null,
        });
    }
    if (!shouldRemoveIOUTransaction) {
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: {
                pendingAction: null,
            },
        });
    }

    failureData.push({
        onyxMethod: Onyx.METHOD.SET,
        key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`,
        value: transactionViolations ?? null,
    });

    if (shouldDeleteTransactionThread) {
        failureData.push({
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT}${transactionThreadID}`,
            value: transactionThread,
        });
    }

    if (actionableWhisperReportActionID) {
        const actionableWhisperReportAction = getReportAction(chatReportID, actionableWhisperReportActionID);
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport?.reportID}`,
            value: {
                [actionableWhisperReportActionID]: {
                    originalMessage: {
                        resolution: isActionableTrackExpense(actionableWhisperReportAction) ? (getOriginalMessage(actionableWhisperReportAction)?.resolution ?? null) : null,
                    },
                },
            },
        });
    }
    failureData.push(
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport?.reportID}`,
            value: {
                [reportAction.reportActionID]: {
                    ...reportAction,
                    pendingAction: null,
                    errors: getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericDeleteFailureMessage'),
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport?.reportID}`,
            value: chatReport,
        },
    );

    const parameters: DeleteMoneyRequestParams = {
        transactionID,
        reportActionID: reportAction.reportActionID,
    };

    return {parameters, optimisticData, successData, failureData, shouldDeleteTransactionThread, chatReport};
}

/**
 * Gathers all the data needed to submit an expense. It attempts to find existing reports, iouReports, and receipts. If it doesn't find them, then
 * it creates optimistic versions of them and uses those instead
 */
function getMoneyRequestInformation(moneyRequestInformation: MoneyRequestInformationParams): MoneyRequestInformation {
    const {
        parentChatReport,
        existingIOUReport,
        transactionParams,
        participantParams,
        policyParams = {},
        existingTransaction,
        existingTransactionID,
        moneyRequestReportID = '',
        retryParams,
        newReportTotal,
        newNonReimbursableTotal,
        testDriveCommentReportActionID,
        optimisticChatReportID,
        optimisticCreatedReportActionID,
        optimisticIOUReportID,
        optimisticReportPreviewActionID,
        shouldGenerateTransactionThreadReport = true,
        isSplitExpense,
        action,
        currentReportActionID,
        isASAPSubmitBetaEnabled,
        currentUserAccountIDParam,
        currentUserEmailParam,
        transactionViolations,
        quickAction,
        policyRecentlyUsedCurrencies,
    } = moneyRequestInformation;
    const {payeeAccountID = userAccountID, payeeEmail = currentUserEmail, participant} = participantParams;
    const {policy, policyCategories, policyTagList, policyRecentlyUsedCategories, policyRecentlyUsedTags} = policyParams;
    const {
        attendees,
        amount,
        distance,
        modifiedAmount,
        comment = '',
        currency,
        source = '',
        created,
        merchant,
        receipt,
        category,
        tag,
        taxCode,
        taxAmount,
        billable,
        reimbursable = true,
        linkedTrackedExpenseReportAction,
        pendingAction,
        pendingFields = {},
        type,
        count,
        rate,
        unit,
    } = transactionParams;

    const payerEmail = addSMSDomainIfPhoneNumber(participant.login ?? '');
    const payerAccountID = Number(participant.accountID);
    const isPolicyExpenseChat = participant.isPolicyExpenseChat;

    // STEP 1: Get existing chat report OR build a new optimistic one
    let isNewChatReport = false;
    let chatReport = !isEmptyObject(parentChatReport) && parentChatReport?.reportID ? parentChatReport : null;

    // If this is a policyExpenseChat, the chatReport must exist and we can get it from Onyx.
    // report is null if the flow is initiated from the global create menu. However, participant always stores the reportID if it exists, which is the case for policyExpenseChats
    if (!chatReport && isPolicyExpenseChat) {
        chatReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${participant.reportID}`] ?? null;
    }

    if (!chatReport) {
        chatReport = getChatByParticipants([payerAccountID, payeeAccountID]) ?? null;
    }

    // If we still don't have a report, it likely doesn't exist and we need to build an optimistic one
    if (!chatReport) {
        isNewChatReport = true;
        chatReport = buildOptimisticChatReport({
            participantList: [payerAccountID, payeeAccountID],
            optimisticReportID: optimisticChatReportID,
        });
    }

    // STEP 2: Get the Expense/IOU report. If the existingIOUReport or moneyRequestReportID has been provided, we want to add the transaction to this specific report.
    // If no such reportID has been provided, let's use the chatReport.iouReportID property. In case that is not present, build a new optimistic Expense/IOU report.
    let iouReport: OnyxInputValue<OnyxTypes.Report> = null;
    if (existingIOUReport) {
        iouReport = existingIOUReport;
    } else if (moneyRequestReportID) {
        iouReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${moneyRequestReportID}`] ?? null;
    } else if (!allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${chatReport.iouReportID}`]?.errorFields?.createChat) {
        iouReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${chatReport.iouReportID}`] ?? null;
    }

    const isScanRequest = isScanRequestTransactionUtils({amount, receipt});
    const shouldCreateNewMoneyRequestReport = isSplitExpense ? false : shouldCreateNewMoneyRequestReportReportUtils(iouReport, chatReport, isScanRequest, action);

    // Generate IDs upfront so we can pass them to buildOptimisticExpenseReport for formula computation
    const optimisticTransactionID = existingTransactionID ?? NumberUtils.rand64();
    const optimisticReportID = optimisticIOUReportID ?? generateReportID();

    if (!iouReport || shouldCreateNewMoneyRequestReport) {
        const nonReimbursableTotal = reimbursable ? 0 : amount;
        const reportTransactions = buildMinimalTransactionForFormula(optimisticTransactionID, optimisticReportID, created, amount, currency, merchant);

        iouReport = isPolicyExpenseChat
            ? buildOptimisticExpenseReport(
                  chatReport.reportID,
                  chatReport.policyID,
                  payeeAccountID,
                  amount,
                  currency,
                  nonReimbursableTotal,
                  undefined,
                  optimisticReportID,
                  reportTransactions,
              )
            : buildOptimisticIOUReport(payeeAccountID, payerAccountID, amount, chatReport.reportID, currency, undefined, undefined, optimisticReportID);
    } else if (isPolicyExpenseChat) {
        iouReport = {...iouReport};
        // Because of the Expense reports are stored as negative values, we subtract the total from the amount
        if (iouReport?.currency === currency) {
            if (!Number.isNaN(iouReport.total) && iouReport.total !== undefined) {
                // Use newReportTotal in scenarios where the total is based on more than just the current transaction, and we need to override it manually
                if (newReportTotal) {
                    iouReport.total = newReportTotal;
                } else {
                    iouReport.total -= amount;
                }

                if (!reimbursable) {
                    if (newNonReimbursableTotal !== undefined) {
                        iouReport.nonReimbursableTotal = newNonReimbursableTotal;
                    } else {
                        iouReport.nonReimbursableTotal = (iouReport.nonReimbursableTotal ?? 0) - amount;
                    }
                }
            }
            if (typeof iouReport.unheldTotal === 'number') {
                // Use newReportTotal in scenarios where the total is based on more than just the current transaction amount, and we need to override it manually
                if (newReportTotal) {
                    iouReport.unheldTotal = newReportTotal;
                } else {
                    iouReport.unheldTotal -= amount;
                }
            }
        }
    } else {
        iouReport = updateIOUOwnerAndTotal(iouReport, payeeAccountID, amount, currency);
    }

    // STEP 3: Build an optimistic transaction with the receipt
    const isDistanceRequest = existingTransaction && isDistanceRequestTransactionUtils(existingTransaction);
    const isManualDistanceRequest = existingTransaction && isManualDistanceRequestTransactionUtils(existingTransaction);
    let optimisticTransaction = buildOptimisticTransaction({
        existingTransactionID: optimisticTransactionID,
        existingTransaction,
        originalTransactionID: transactionParams.originalTransactionID,
        policy,
        transactionParams: {
            amount: isExpenseReport(iouReport) ? -amount : amount,
            distance,
            ...(modifiedAmount !== undefined && {modifiedAmount: isExpenseReport(iouReport) ? -modifiedAmount : modifiedAmount}),
            currency,
            reportID: iouReport.reportID,
            comment,
            attendees,
            created,
            merchant,
            receipt,
            category,
            tag,
            taxCode,
            source,
            taxAmount: isExpenseReport(iouReport) ? -(taxAmount ?? 0) : taxAmount,
            billable,
            pendingAction,
            pendingFields: isDistanceRequest && !isManualDistanceRequest ? {waypoints: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD, ...pendingFields} : pendingFields,
            reimbursable: isPolicyExpenseChat ? reimbursable : true,
            type,
            count,
            rate,
            unit,
        },
        isDemoTransactionParam: isSelectedManagerMcTest(participant.login) || transactionParams.receipt?.isTestDriveReceipt,
    });

    iouReport.transactionCount = (iouReport.transactionCount ?? 0) + 1;

    const optimisticPolicyRecentlyUsedCategories = mergePolicyRecentlyUsedCategories(category, policyRecentlyUsedCategories);
    const optimisticPolicyRecentlyUsedTags = buildOptimisticPolicyRecentlyUsedTags({
        policyTags: getPolicyTagsData(iouReport.policyID),
        policyRecentlyUsedTags,
        transactionTags: tag,
    });
    const optimisticPolicyRecentlyUsedCurrencies = mergePolicyRecentlyUsedCurrencies(currency, policyRecentlyUsedCurrencies);

    // If there is an existing transaction (which is the case for distance requests), then the data from the existing transaction
    // needs to be manually merged into the optimistic transaction. This is because buildOnyxDataForMoneyRequest() uses `Onyx.set()` for the transaction
    // data. This is a big can of worms to change it to `Onyx.merge()` as explored in https://expensify.slack.com/archives/C05DWUDHVK7/p1692139468252109.
    // I want to clean this up at some point, but it's possible this will live in the code for a while so I've created https://github.com/Expensify/App/issues/25417
    // to remind me to do this.
    if (isDistanceRequest && existingTransaction) {
        optimisticTransaction = fastMerge(existingTransaction, optimisticTransaction, false);
    }

    if (isSplitExpense && existingTransaction) {
        const {convertedAmount: originalConvertedAmount, ...existingTransactionWithoutConvertedAmount} = existingTransaction;
        optimisticTransaction = fastMerge(existingTransactionWithoutConvertedAmount, optimisticTransaction, false);

        // Calculate proportional convertedAmount for the split based on the original conversion rate
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- modifiedAmount can be empty string
        const originalAmount = Number(existingTransaction.modifiedAmount) || existingTransaction.amount;
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing -- modifiedAmount can be empty string
        const splitAmount = Number(optimisticTransaction.modifiedAmount) || optimisticTransaction.amount;
        if (originalConvertedAmount && originalAmount && splitAmount) {
            optimisticTransaction.convertedAmount = Math.round((originalConvertedAmount * splitAmount) / originalAmount);
        }
    }

    // STEP 4: Build optimistic reportActions. We need:
    // 1. CREATED action for the chatReport
    // 2. CREATED action for the iouReport
    // 3. IOU action for the iouReport
    // 4. The transaction thread, which requires the iouAction, and CREATED action for the transaction thread
    // 5. REPORT_PREVIEW action for the chatReport
    // Note: The CREATED action for the IOU report must be optimistically generated before the IOU action so there's no chance that it appears after the IOU action in the chat
    const [optimisticCreatedActionForChat, optimisticCreatedActionForIOUReport, iouAction, optimisticTransactionThread, optimisticCreatedActionForTransactionThread] =
        buildOptimisticMoneyRequestEntities({
            iouReport,
            type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
            amount,
            currency,
            comment,
            payeeEmail,
            participants: [participant],
            transactionID: optimisticTransaction.transactionID,
            paymentType: isSelectedManagerMcTest(participant.login) || transactionParams.receipt?.isTestDriveReceipt ? CONST.IOU.PAYMENT_TYPE.ELSEWHERE : undefined,
            existingTransactionThreadReportID: linkedTrackedExpenseReportAction?.childReportID,
            optimisticCreatedReportActionID,
            linkedTrackedExpenseReportAction,
            shouldGenerateTransactionThreadReport,
            reportActionID: currentReportActionID,
        });

    let reportPreviewAction = shouldCreateNewMoneyRequestReport ? null : getReportPreviewAction(chatReport.reportID, iouReport.reportID);

    if (reportPreviewAction) {
        reportPreviewAction = updateReportPreview(iouReport, reportPreviewAction, false, comment, optimisticTransaction);
    } else {
        reportPreviewAction = buildOptimisticReportPreview(chatReport, iouReport, comment, optimisticTransaction, undefined, optimisticReportPreviewActionID);
        chatReport.lastVisibleActionCreated = reportPreviewAction.created;

        // Generated ReportPreview action is a parent report action of the iou report.
        // We are setting the iou report's parentReportActionID to display subtitle correctly in IOU page when offline.
        iouReport.parentReportActionID = reportPreviewAction.reportActionID;
    }

    const shouldCreateOptimisticPersonalDetails = isNewChatReport && !allPersonalDetails[payerAccountID];
    // Add optimistic personal details for participant
    const optimisticPersonalDetailListAction = shouldCreateOptimisticPersonalDetails
        ? {
              [payerAccountID]: {
                  accountID: payerAccountID,
                  // Disabling this line since participant.displayName can be an empty string
                  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                  displayName: formatPhoneNumber(participant.displayName || payerEmail),
                  login: participant.login,
                  isOptimisticPersonalDetail: true,
              },
          }
        : {};

    const predictedNextStatus = policy?.reimbursementChoice === CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO ? CONST.REPORT.STATUS_NUM.CLOSED : CONST.REPORT.STATUS_NUM.OPEN;
    const hasViolations = hasViolationsReportUtils(iouReport.reportID, transactionViolations, currentUserAccountIDParam, currentUserEmailParam);
    // buildOptimisticNextStep is used in parallel
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const optimisticNextStepDeprecated = buildNextStepNew({
        report: iouReport,
        predictedNextStatus,
        policy,
        currentUserAccountIDParam,
        currentUserEmailParam,
        hasViolations,
        isASAPSubmitBetaEnabled,
    });

    const optimisticNextStep = buildOptimisticNextStep({
        report: iouReport,
        predictedNextStatus,
        policy,
        currentUserAccountIDParam,
        currentUserEmailParam,
        hasViolations,
        isASAPSubmitBetaEnabled,
    });

    // STEP 5: Build Onyx Data
    const [optimisticData, successData, failureData] = buildOnyxDataForMoneyRequest({
        participant,
        isNewChatReport,
        shouldCreateNewMoneyRequestReport,
        shouldGenerateTransactionThreadReport,
        policyParams: {
            policy,
            policyCategories,
            policyTagList,
        },
        optimisticParams: {
            chat: {
                report: chatReport,
                createdAction: optimisticCreatedActionForChat,
                reportPreviewAction,
            },
            iou: {
                report: iouReport,
                createdAction: optimisticCreatedActionForIOUReport,
                action: iouAction,
            },
            transactionParams: {
                transaction: optimisticTransaction,
                transactionThreadReport: optimisticTransactionThread,
                transactionThreadCreatedReportAction: optimisticCreatedActionForTransactionThread,
            },
            policyRecentlyUsed: {
                categories: optimisticPolicyRecentlyUsedCategories,
                tags: optimisticPolicyRecentlyUsedTags,
                currencies: optimisticPolicyRecentlyUsedCurrencies,
            },
            personalDetailListAction: optimisticPersonalDetailListAction,
            nextStepDeprecated: optimisticNextStepDeprecated,
            nextStep: optimisticNextStep,
            testDriveCommentReportActionID,
        },
        retryParams,
        isASAPSubmitBetaEnabled,
        currentUserAccountIDParam,
        currentUserEmailParam,
        hasViolations,
        quickAction,
    });

    return {
        payerAccountID,
        payerEmail,
        iouReport,
        chatReport,
        transaction: optimisticTransaction,
        iouAction,
        createdChatReportActionID: isNewChatReport ? optimisticCreatedActionForChat.reportActionID : undefined,
        createdIOUReportActionID: shouldCreateNewMoneyRequestReport ? optimisticCreatedActionForIOUReport.reportActionID : undefined,
        reportPreviewAction,
        transactionThreadReportID: optimisticTransactionThread?.reportID,
        createdReportActionIDForThread: optimisticCreatedActionForTransactionThread?.reportActionID,
        onyxData: {
            optimisticData,
            successData,
            failureData,
        },
    };
}

function computePerDiemExpenseAmount(customUnit: TransactionCustomUnit) {
    const subRates = customUnit.subRates ?? [];
    return subRates.reduce((total, subRate) => total + subRate.quantity * subRate.rate, 0);
}

function computePerDiemExpenseMerchant(customUnit: TransactionCustomUnit, policy: OnyxEntry<OnyxTypes.Policy>) {
    if (!customUnit.customUnitRateID) {
        return '';
    }
    const policyCustomUnit = getPerDiemCustomUnit(policy);
    const rate = policyCustomUnit?.rates?.[customUnit.customUnitRateID];
    const locationName = rate?.name ?? '';
    const startDate = customUnit.attributes?.dates.start;
    const endDate = customUnit.attributes?.dates.end;
    if (!startDate || !endDate) {
        return locationName;
    }
    const formattedTime = DateUtils.getFormattedDateRangeForPerDiem(new Date(startDate), new Date(endDate));
    return `${locationName}, ${formattedTime}`;
}

function isValidPerDiemExpenseAmount(customUnit: TransactionCustomUnit, iouCurrencyCode?: string) {
    const perDiemAmountInCents = computePerDiemExpenseAmount(customUnit);
    const perDiemAmountString = convertToFrontendAmountAsString(perDiemAmountInCents, iouCurrencyCode);
    const decimals = getCurrencyDecimals(iouCurrencyCode);
    return validateAmount(perDiemAmountString, decimals, undefined, true);
}

function computeDefaultPerDiemExpenseComment(customUnit: TransactionCustomUnit, currency: string) {
    const subRates = customUnit.subRates ?? [];
    const subRateComments = subRates.map((subRate) => {
        const rate = subRate.rate ?? 0;
        const rateComment = subRate.name ?? '';
        const quantity = subRate.quantity ?? 0;
        return `${quantity}x ${rateComment} @ ${convertAmountToDisplayString(rate, currency)}`;
    });
    return subRateComments.join(', ');
}

function mergePolicyRecentlyUsedCategories(category: string | undefined, policyRecentlyUsedCategories: OnyxEntry<OnyxTypes.RecentlyUsedCategories>) {
    let mergedCategories: string[];
    if (category) {
        const categoriesArray = Array.isArray(policyRecentlyUsedCategories) ? policyRecentlyUsedCategories : [];
        const categoriesWithNew = [category, ...categoriesArray];
        mergedCategories = Array.from(new Set(categoriesWithNew));
    } else {
        mergedCategories = policyRecentlyUsedCategories ?? [];
    }
    return mergedCategories;
}

function mergePolicyRecentlyUsedCurrencies(currency: string | undefined, policyRecentlyUsedCurrencies: string[]) {
    let mergedCurrencies: string[];
    if (currency) {
        const currenciesWithNew = [currency, ...policyRecentlyUsedCurrencies];
        mergedCurrencies = Array.from(new Set(currenciesWithNew));
    } else {
        mergedCurrencies = policyRecentlyUsedCurrencies;
    }
    return mergedCurrencies.slice(0, CONST.IOU.MAX_RECENT_REPORTS_TO_SHOW);
}

/**
 * Gathers all the data needed to submit a per diem expense. It attempts to find existing reports, iouReports, and receipts. If it doesn't find them, then
 * it creates optimistic versions of them and uses those instead
 */
function getPerDiemExpenseInformation(perDiemExpenseInformation: PerDiemExpenseInformationParams): MoneyRequestInformation {
    const {
        parentChatReport,
        transactionParams,
        participantParams,
        policyParams = {},
        recentlyUsedParams = {},
        moneyRequestReportID = '',
        isASAPSubmitBetaEnabled,
        currentUserAccountIDParam,
        currentUserEmailParam,
        hasViolations,
        quickAction,
        policyRecentlyUsedCurrencies,
    } = perDiemExpenseInformation;
    const {payeeAccountID = userAccountID, payeeEmail = currentUserEmail, participant} = participantParams;
    const {policy, policyCategories, policyTagList, policyRecentlyUsedCategories, policyRecentlyUsedTags} = policyParams;
    const {destinations: recentlyUsedDestinations} = recentlyUsedParams;
    const {comment = '', currency, created, category, tag, customUnit, billable, attendees, reimbursable} = transactionParams;

    const amount = computePerDiemExpenseAmount(customUnit);
    const merchant = computePerDiemExpenseMerchant(customUnit, policy);
    const defaultComment = computeDefaultPerDiemExpenseComment(customUnit, currency);
    const finalComment = comment || defaultComment;

    const payerEmail = addSMSDomainIfPhoneNumber(participant.login ?? '');
    const payerAccountID = Number(participant.accountID);
    const isPolicyExpenseChat = participant.isPolicyExpenseChat;

    // STEP 1: Get existing chat report OR build a new optimistic one
    let isNewChatReport = false;
    let chatReport = !isEmptyObject(parentChatReport) && parentChatReport?.reportID ? parentChatReport : null;

    // If this is a policyExpenseChat, the chatReport must exist and we can get it from Onyx.
    // report is null if the flow is initiated from the global create menu. However, participant always stores the reportID if it exists, which is the case for policyExpenseChats
    if (!chatReport && isPolicyExpenseChat) {
        chatReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${participant.reportID}`] ?? null;
    }

    if (!chatReport) {
        chatReport = getChatByParticipants([payerAccountID, payeeAccountID]) ?? null;
    }

    // If we still don't have a report, it likely doesn't exist and we need to build an optimistic one
    if (!chatReport) {
        isNewChatReport = true;
        chatReport = buildOptimisticChatReport({
            participantList: [payerAccountID, payeeAccountID],
        });
    }

    // STEP 2: Get the Expense/IOU report. If the moneyRequestReportID has been provided, we want to add the transaction to this specific report.
    // If no such reportID has been provided, let's use the chatReport.iouReportID property. In case that is not present, build a new optimistic Expense/IOU report.
    let iouReport: OnyxInputValue<OnyxTypes.Report> = null;
    if (moneyRequestReportID) {
        iouReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${moneyRequestReportID}`] ?? null;
    } else {
        iouReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${chatReport.iouReportID}`] ?? null;
    }

    const shouldCreateNewMoneyRequestReport = shouldCreateNewMoneyRequestReportReportUtils(iouReport, chatReport, false);

    // Generate IDs upfront so we can pass them to buildOptimisticExpenseReport for formula computation
    const optimisticTransactionID = NumberUtils.rand64();
    const optimisticReportID = generateReportID();

    if (!iouReport || shouldCreateNewMoneyRequestReport) {
        const reportTransactions = buildMinimalTransactionForFormula(optimisticTransactionID, optimisticReportID, created, amount, currency, merchant);

        iouReport = isPolicyExpenseChat
            ? buildOptimisticExpenseReport(chatReport.reportID, chatReport.policyID, payeeAccountID, amount, currency, undefined, undefined, optimisticReportID, reportTransactions)
            : buildOptimisticIOUReport(payeeAccountID, payerAccountID, amount, chatReport.reportID, currency);
    } else if (isPolicyExpenseChat) {
        iouReport = {...iouReport};
        // Because of the Expense reports are stored as negative values, we subtract the total from the amount
        if (iouReport?.currency === currency) {
            if (!Number.isNaN(iouReport.total) && iouReport.total !== undefined) {
                iouReport.total -= amount;
            }

            if (typeof iouReport.unheldTotal === 'number') {
                iouReport.unheldTotal -= amount;
            }
        }
    } else {
        iouReport = updateIOUOwnerAndTotal(iouReport, payeeAccountID, amount, currency);
    }

    // STEP 3: Build an optimistic transaction
    const optimisticTransaction = buildOptimisticTransaction({
        existingTransactionID: optimisticTransactionID,
        policy,
        transactionParams: {
            amount: isExpenseReport(iouReport) ? -amount : amount,
            currency,
            reportID: iouReport.reportID,
            comment: finalComment,
            created,
            category,
            merchant,
            tag,
            customUnit,
            billable,
            reimbursable,
            pendingFields: {subRates: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD},
            attendees,
        },
    });
    iouReport.transactionCount = (iouReport.transactionCount ?? 0) + 1;

    // This is to differentiate between a normal expense and a per diem expense
    optimisticTransaction.iouRequestType = CONST.IOU.REQUEST_TYPE.PER_DIEM;
    optimisticTransaction.hasEReceipt = true;
    const optimisticPolicyRecentlyUsedCategories = mergePolicyRecentlyUsedCategories(category, policyRecentlyUsedCategories);
    const optimisticPolicyRecentlyUsedTags = buildOptimisticPolicyRecentlyUsedTags({
        policyTags: getPolicyTagsData(iouReport.policyID),
        policyRecentlyUsedTags,
        transactionTags: tag,
    });
    const optimisticPolicyRecentlyUsedCurrencies = mergePolicyRecentlyUsedCurrencies(currency, policyRecentlyUsedCurrencies);
    const optimisticPolicyRecentlyUsedDestinations = customUnit.customUnitRateID ? [...new Set([customUnit.customUnitRateID, ...(recentlyUsedDestinations ?? [])])] : [];

    // STEP 4: Build optimistic reportActions. We need:
    // 1. CREATED action for the chatReport
    // 2. CREATED action for the iouReport
    // 3. IOU action for the iouReport
    // 4. The transaction thread, which requires the iouAction, and CREATED action for the transaction thread
    // 5. REPORT_PREVIEW action for the chatReport
    // Note: The CREATED action for the IOU report must be optimistically generated before the IOU action so there's no chance that it appears after the IOU action in the chat
    const [optimisticCreatedActionForChat, optimisticCreatedActionForIOUReport, iouAction, optimisticTransactionThread, optimisticCreatedActionForTransactionThread] =
        buildOptimisticMoneyRequestEntities({
            iouReport,
            type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
            amount,
            currency,
            comment,
            payeeEmail,
            participants: [participant],
            transactionID: optimisticTransaction.transactionID,
        });

    let reportPreviewAction = shouldCreateNewMoneyRequestReport ? null : getReportPreviewAction(chatReport.reportID, iouReport.reportID);

    if (reportPreviewAction) {
        reportPreviewAction = updateReportPreview(iouReport, reportPreviewAction, false, comment, optimisticTransaction);
    } else {
        reportPreviewAction = buildOptimisticReportPreview(chatReport, iouReport, comment, optimisticTransaction);
        chatReport.lastVisibleActionCreated = reportPreviewAction.created;

        // Generated ReportPreview action is a parent report action of the iou report.
        // We are setting the iou report's parentReportActionID to display subtitle correctly in IOU page when offline.
        iouReport.parentReportActionID = reportPreviewAction.reportActionID;
    }

    const shouldCreateOptimisticPersonalDetails = isNewChatReport && !allPersonalDetails[payerAccountID];
    // Add optimistic personal details for participant
    const optimisticPersonalDetailListAction = shouldCreateOptimisticPersonalDetails
        ? {
              [payerAccountID]: {
                  accountID: payerAccountID,
                  // Disabling this line since participant.displayName can be an empty string
                  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                  displayName: formatPhoneNumber(participant.displayName || payerEmail),
                  login: participant.login,
                  isOptimisticPersonalDetail: true,
              },
          }
        : {};

    const predictedNextStatus = policy?.reimbursementChoice === CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO ? CONST.REPORT.STATUS_NUM.CLOSED : CONST.REPORT.STATUS_NUM.OPEN;
    // buildOptimisticNextStep is used in parallel
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const optimisticNextStepDeprecated = buildNextStepNew({
        report: iouReport,
        predictedNextStatus,
        currentUserAccountIDParam,
        currentUserEmailParam,
        hasViolations,
        isASAPSubmitBetaEnabled,
        policy,
    });
    const optimisticNextStep = buildOptimisticNextStep({
        report: iouReport,
        predictedNextStatus,
        currentUserAccountIDParam,
        currentUserEmailParam,
        hasViolations,
        isASAPSubmitBetaEnabled,
        policy,
    });

    // STEP 5: Build Onyx Data
    const [optimisticData, successData, failureData] = buildOnyxDataForMoneyRequest({
        isNewChatReport,
        shouldCreateNewMoneyRequestReport,
        policyParams: {
            policy,
            policyCategories,
            policyTagList,
        },
        isASAPSubmitBetaEnabled,
        optimisticParams: {
            chat: {
                report: chatReport,
                createdAction: optimisticCreatedActionForChat,
                reportPreviewAction,
            },
            iou: {
                report: iouReport,
                createdAction: optimisticCreatedActionForIOUReport,
                action: iouAction,
            },
            transactionParams: {
                transaction: optimisticTransaction,
                transactionThreadReport: optimisticTransactionThread,
                transactionThreadCreatedReportAction: optimisticCreatedActionForTransactionThread,
            },
            policyRecentlyUsed: {
                categories: optimisticPolicyRecentlyUsedCategories,
                tags: optimisticPolicyRecentlyUsedTags,
                currencies: optimisticPolicyRecentlyUsedCurrencies,
                destinations: optimisticPolicyRecentlyUsedDestinations,
            },
            personalDetailListAction: optimisticPersonalDetailListAction,
            nextStep: optimisticNextStep,
            nextStepDeprecated: optimisticNextStepDeprecated,
        },
        currentUserAccountIDParam,
        currentUserEmailParam,
        hasViolations,
        quickAction,
    });

    return {
        payerAccountID,
        payerEmail,
        iouReport,
        chatReport,
        transaction: optimisticTransaction,
        iouAction,
        createdChatReportActionID: isNewChatReport ? optimisticCreatedActionForChat.reportActionID : undefined,
        createdIOUReportActionID: shouldCreateNewMoneyRequestReport ? optimisticCreatedActionForIOUReport.reportActionID : undefined,
        reportPreviewAction,
        transactionThreadReportID: optimisticTransactionThread?.reportID,
        createdReportActionIDForThread: optimisticCreatedActionForTransactionThread?.reportActionID,
        onyxData: {
            optimisticData,
            successData,
            failureData,
        },
        billable,
        reimbursable,
    };
}

/**
 * Gathers all the data needed to make an expense. It attempts to find existing reports, iouReports, and receipts. If it doesn't find them, then
 * it creates optimistic versions of them and uses those instead
 */
function getTrackExpenseInformation(params: GetTrackExpenseInformationParams): TrackExpenseInformation | null {
    const {
        parentChatReport,
        moneyRequestReportID = '',
        existingTransactionID,
        participantParams,
        policyParams,
        transactionParams,
        retryParams,
        isASAPSubmitBetaEnabled,
        currentUserAccountIDParam,
        currentUserEmailParam,
        introSelected,
        activePolicyID,
        quickAction,
    } = params;
    const {payeeAccountID = userAccountID, payeeEmail = currentUserEmail, participant} = participantParams;
    const {policy, policyCategories, policyTagList} = policyParams;
    const {
        comment,
        amount,
        currency,
        created,
        distance,
        merchant,
        receipt,
        category,
        tag,
        taxCode,
        taxAmount,
        billable,
        reimbursable,
        linkedTrackedExpenseReportAction,
        attendees,
        odometerStart,
        odometerEnd,
    } = transactionParams;

    const optimisticData: OnyxUpdate[] = [];
    const successData: OnyxUpdate[] = [];
    const failureData: OnyxUpdate[] = [];

    const isPolicyExpenseChat = participant.isPolicyExpenseChat;

    // STEP 1: Get existing chat report
    let chatReport = !isEmptyObject(parentChatReport) && parentChatReport?.reportID ? parentChatReport : null;

    // If no chat report is passed, defaults to the self-DM report
    if (!chatReport) {
        chatReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${findSelfDMReportID()}`] ?? null;
    }

    // If we are still missing the chat report then optimistically create the self-DM report and use it
    let optimisticReportID: string | undefined;
    let optimisticReportActionID: string | undefined;
    if (!chatReport) {
        const currentTime = DateUtils.getDBTime();
        const selfDMReport = buildOptimisticSelfDMReport(currentTime);
        const selfDMCreatedReportAction = buildOptimisticCreatedReportAction(currentUserEmail ?? '', currentTime);
        optimisticReportID = selfDMReport.reportID;
        optimisticReportActionID = selfDMCreatedReportAction.reportActionID;
        chatReport = selfDMReport;

        optimisticData.push(
            {
                onyxMethod: Onyx.METHOD.SET,
                key: `${ONYXKEYS.COLLECTION.REPORT}${optimisticReportID}`,
                value: {
                    ...selfDMReport,
                    pendingFields: {
                        createChat: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                    },
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${optimisticReportID}`,
                value: {isOptimisticReport: true},
            },
            {
                onyxMethod: Onyx.METHOD.SET,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${optimisticReportID}`,
                value: {
                    [optimisticReportActionID]: selfDMCreatedReportAction,
                },
            },
        );
        successData.push(
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${optimisticReportID}`,
                value: {
                    pendingFields: {
                        createChat: null,
                    },
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${optimisticReportID}`,
                value: {isOptimisticReport: false},
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${optimisticReportID}`,
                value: {
                    [optimisticReportActionID]: {
                        pendingAction: null,
                    },
                },
            },
        );
        failureData.push(
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${optimisticReportID}`,
                value: null,
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${optimisticReportID}`,
                value: null,
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${optimisticReportID}`,
                value: null,
            },
        );
    }

    // Check if the report is a draft
    const isDraftReportLocal = isDraftReport(chatReport?.reportID);

    let createdWorkspaceParams: CreateWorkspaceParams | undefined;

    if (isDraftReportLocal) {
        const workspaceData = buildPolicyData({
            policyOwnerEmail: undefined,
            makeMeAdmin: policy?.makeMeAdmin,
            policyName: policy?.name,
            policyID: policy?.id,
            expenseReportId: chatReport?.reportID,
            engagementChoice: CONST.ONBOARDING_CHOICES.TRACK_WORKSPACE,
            currentUserAccountIDParam,
            currentUserEmailParam,
            introSelected,
            activePolicyID,
        });
        createdWorkspaceParams = workspaceData.params;
        optimisticData.push(...workspaceData.optimisticData);
        successData.push(...workspaceData.successData);
        failureData.push(...workspaceData.failureData);
    }

    // STEP 2: If not in the self-DM flow, we need to use the expense report.
    // For this, first use the chatReport.iouReportID property. Build a new optimistic expense report if needed.
    const shouldUseMoneyReport = !!isPolicyExpenseChat && chatReport.chatType !== CONST.REPORT.CHAT_TYPE.SELF_DM;

    let iouReport: OnyxInputValue<OnyxTypes.Report> = null;
    let shouldCreateNewMoneyRequestReport = false;

    // Generate IDs upfront so we can pass them to buildOptimisticExpenseReport for formula computation
    const optimisticTransactionID = existingTransactionID ?? NumberUtils.rand64();
    const optimisticExpenseReportID = generateReportID();

    if (shouldUseMoneyReport) {
        if (moneyRequestReportID) {
            iouReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${moneyRequestReportID}`] ?? null;
        } else {
            iouReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${chatReport.iouReportID}`] ?? null;
        }
        const isScanRequest = isScanRequestTransactionUtils({amount, receipt});
        shouldCreateNewMoneyRequestReport = shouldCreateNewMoneyRequestReportReportUtils(iouReport, chatReport, isScanRequest);
        if (!iouReport || shouldCreateNewMoneyRequestReport) {
            const reportTransactions = buildMinimalTransactionForFormula(optimisticTransactionID, optimisticExpenseReportID, created, amount, currency, merchant);

            iouReport = buildOptimisticExpenseReport(
                chatReport.reportID,
                chatReport.policyID,
                payeeAccountID,
                amount,
                currency,
                amount,
                undefined,
                optimisticExpenseReportID,
                reportTransactions,
            );
        } else {
            iouReport = {...iouReport};
            // Because of the Expense reports are stored as negative values, we subtract the total from the amount
            if (iouReport?.currency === currency) {
                if (!Number.isNaN(iouReport.total) && iouReport.total !== undefined && typeof iouReport.nonReimbursableTotal === 'number') {
                    iouReport.total -= amount;
                    iouReport.nonReimbursableTotal -= amount;
                }

                if (typeof iouReport.unheldTotal === 'number' && typeof iouReport.unheldNonReimbursableTotal === 'number') {
                    iouReport.unheldTotal -= amount;
                    iouReport.unheldNonReimbursableTotal -= amount;
                }
            }
        }
    }

    // If shouldUseMoneyReport is true, the iouReport was defined.
    // But we'll use the `shouldUseMoneyReport && iouReport` check further instead of `shouldUseMoneyReport` to avoid TS errors.

    // STEP 3: Build optimistic receipt and transaction
    const existingTransaction = allTransactionDrafts[`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${existingTransactionID ?? CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`];
    const isDistanceRequest = existingTransaction && isDistanceRequestTransactionUtils(existingTransaction);
    const isManualDistanceRequest = existingTransaction && isManualDistanceRequestTransactionUtils(existingTransaction);
    const isOdometerDistanceRequest = existingTransaction && isOdometerDistanceRequestTransactionUtils(existingTransaction);
    let optimisticTransaction = buildOptimisticTransaction({
        existingTransactionID: optimisticTransactionID,
        existingTransaction,
        policy,
        transactionParams: {
            amount: -amount,
            currency,
            reportID: shouldUseMoneyReport && iouReport ? iouReport.reportID : CONST.REPORT.UNREPORTED_REPORT_ID,
            comment,
            distance,
            created,
            merchant,
            receipt,
            category,
            tag,
            taxCode,
            taxAmount,
            billable,
            pendingFields: isDistanceRequest && !isManualDistanceRequest ? {waypoints: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD} : undefined,
            reimbursable,
            filename: existingTransaction?.receipt?.filename,
            attendees,
            odometerStart: isOdometerDistanceRequest ? odometerStart : undefined,
            odometerEnd: isOdometerDistanceRequest ? odometerEnd : undefined,
        },
    });
    if (iouReport) {
        iouReport.transactionCount = (iouReport.transactionCount ?? 0) + 1;
    }

    // If there is an existing transaction (which is the case for distance requests), then the data from the existing transaction
    // needs to be manually merged into the optimistic transaction. This is because buildOnyxDataForMoneyRequest() uses `Onyx.set()` for the transaction
    // data. This is a big can of worms to change it to `Onyx.merge()` as explored in https://expensify.slack.com/archives/C05DWUDHVK7/p1692139468252109.
    // I want to clean this up at some point, but it's possible this will live in the code for a while so I've created https://github.com/Expensify/App/issues/25417
    // to remind me to do this.
    if (isDistanceRequest) {
        optimisticTransaction = fastMerge(existingTransaction, optimisticTransaction, false);
    }

    // STEP 4: Build optimistic reportActions. We need:
    // 1. CREATED action for the iouReport (if tracking in the Expense chat)
    // 2. IOU action for the iouReport (if tracking in the Expense chat), otherwise – for chatReport
    // 3. The transaction thread, which requires the iouAction, and CREATED action for the transaction thread
    // 4. REPORT_PREVIEW action for the chatReport (if tracking in the Expense chat)
    const [, optimisticCreatedActionForIOUReport, iouAction, optimisticTransactionThread, optimisticCreatedActionForTransactionThread] = buildOptimisticMoneyRequestEntities({
        iouReport: shouldUseMoneyReport && iouReport ? iouReport : chatReport,
        type: CONST.IOU.REPORT_ACTION_TYPE.TRACK,
        amount,
        currency,
        comment,
        payeeEmail,
        participants: [participant],
        transactionID: optimisticTransaction.transactionID,
        isPersonalTrackingExpense: !shouldUseMoneyReport,
        existingTransactionThreadReportID: linkedTrackedExpenseReportAction?.childReportID,
        linkedTrackedExpenseReportAction,
    });

    let reportPreviewAction: OnyxInputValue<OnyxTypes.ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW>> = null;
    if (shouldUseMoneyReport && iouReport) {
        reportPreviewAction = shouldCreateNewMoneyRequestReport ? null : getReportPreviewAction(chatReport.reportID, iouReport.reportID);

        if (reportPreviewAction) {
            reportPreviewAction = updateReportPreview(iouReport, reportPreviewAction, false, comment, optimisticTransaction);
        } else {
            reportPreviewAction = buildOptimisticReportPreview(chatReport, iouReport, comment, optimisticTransaction);
            // Generated ReportPreview action is a parent report action of the iou report.
            // We are setting the iou report's parentReportActionID to display subtitle correctly in IOU page when offline.
            iouReport.parentReportActionID = reportPreviewAction.reportActionID;
        }
    }

    let actionableTrackExpenseWhisper: OnyxInputValue<OnyxTypes.ReportAction> = null;
    if (!isPolicyExpenseChat) {
        actionableTrackExpenseWhisper = buildOptimisticActionableTrackExpenseWhisper(iouAction, optimisticTransaction.transactionID);
    }

    // STEP 5: Build Onyx Data
    const trackExpenseOnyxData = buildOnyxDataForTrackExpense({
        participant,
        chat: {report: chatReport, previewAction: reportPreviewAction},
        iou: {report: iouReport, action: iouAction, createdAction: optimisticCreatedActionForIOUReport},
        transactionParams: {
            transaction: optimisticTransaction,
            threadCreatedReportAction: optimisticCreatedActionForTransactionThread,
            threadReport: optimisticTransactionThread ?? {},
        },
        policyParams: {policy, tagList: policyTagList, categories: policyCategories},
        shouldCreateNewMoneyRequestReport,
        actionableTrackExpenseWhisper,
        retryParams,
        isASAPSubmitBetaEnabled,
        quickAction,
    });

    return {
        createdWorkspaceParams,
        chatReport,
        iouReport: iouReport ?? undefined,
        transaction: optimisticTransaction,
        iouAction,
        createdIOUReportActionID: shouldCreateNewMoneyRequestReport ? optimisticCreatedActionForIOUReport.reportActionID : undefined,
        reportPreviewAction: reportPreviewAction ?? undefined,
        transactionThreadReportID: optimisticTransactionThread.reportID,
        createdReportActionIDForThread: optimisticCreatedActionForTransactionThread?.reportActionID,
        actionableWhisperReportActionIDParam: actionableTrackExpenseWhisper?.reportActionID,
        optimisticReportID,
        optimisticReportActionID,
        onyxData: {
            optimisticData: optimisticData.concat(trackExpenseOnyxData[0]),
            successData: successData.concat(trackExpenseOnyxData[1]),
            failureData: failureData.concat(trackExpenseOnyxData[2]),
        },
    };
}

/**
 * Compute the diff amount when we update the transaction
 */
function calculateDiffAmount(
    iouReport: OnyxTypes.OnyxInputOrEntry<OnyxTypes.Report>,
    updatedTransaction: OnyxTypes.OnyxInputOrEntry<OnyxTypes.Transaction>,
    transaction: OnyxEntry<OnyxTypes.Transaction>,
): number | null {
    if (!iouReport) {
        return 0;
    }
    const isExpenseReportLocal = isExpenseReport(iouReport);
    const updatedCurrency = getCurrency(updatedTransaction);
    const currentCurrency = getCurrency(transaction);

    const currentAmount = getAmount(transaction, isExpenseReportLocal);
    const updatedAmount = getAmount(updatedTransaction, isExpenseReportLocal);

    if (updatedCurrency === currentCurrency && currentAmount === updatedAmount) {
        return 0;
    }

    if (updatedCurrency === iouReport.currency && currentCurrency === iouReport.currency) {
        // Calculate the diff between the updated amount and the current amount if the currency of the updated and current transactions have the same currency as the report
        return updatedAmount - currentAmount;
    }

    return null;
}

function getUpdatedMoneyRequestReportData(
    iouReport: OnyxTypes.OnyxInputOrEntry<OnyxTypes.Report>,
    updatedTransaction: OnyxTypes.OnyxInputOrEntry<OnyxTypes.Transaction>,
    transaction: OnyxEntry<OnyxTypes.Transaction>,
    isTransactionOnHold: boolean,
    policy: OnyxEntry<OnyxTypes.Policy>,
    actorAccountID?: number,
) {
    const calculatedDiffAmount = calculateDiffAmount(iouReport, updatedTransaction, transaction);
    const isTotalIndeterminate = calculatedDiffAmount === null;
    const diff = calculatedDiffAmount ?? 0;

    let updatedMoneyRequestReport: OnyxTypes.OnyxInputOrEntry<OnyxTypes.Report>;
    if (!iouReport) {
        updatedMoneyRequestReport = null;
    } else if ((isExpenseReport(iouReport) || isInvoiceReportReportUtils(iouReport)) && !Number.isNaN(iouReport.total) && iouReport.total !== undefined) {
        // For expense report, the amount is negative, so we should subtract total from diff
        updatedMoneyRequestReport = {
            ...iouReport,
            total: iouReport.total - diff,
        };
        if (!transaction?.reimbursable && typeof updatedMoneyRequestReport.nonReimbursableTotal === 'number') {
            updatedMoneyRequestReport.nonReimbursableTotal -= diff;
        }
        if (updatedTransaction && transaction?.reimbursable !== updatedTransaction?.reimbursable && typeof updatedMoneyRequestReport.nonReimbursableTotal === 'number') {
            updatedMoneyRequestReport.nonReimbursableTotal += updatedTransaction.reimbursable ? -updatedTransaction.amount : updatedTransaction.amount;
        }
        if (!isTransactionOnHold) {
            if (typeof updatedMoneyRequestReport.unheldTotal === 'number') {
                updatedMoneyRequestReport.unheldTotal -= diff;
            }
            if (!transaction?.reimbursable && typeof updatedMoneyRequestReport.unheldNonReimbursableTotal === 'number') {
                updatedMoneyRequestReport.unheldNonReimbursableTotal -= diff;
            }
            if (updatedTransaction && transaction?.reimbursable !== updatedTransaction?.reimbursable && typeof updatedMoneyRequestReport.unheldNonReimbursableTotal === 'number') {
                updatedMoneyRequestReport.unheldNonReimbursableTotal += updatedTransaction.reimbursable ? -updatedTransaction.amount : updatedTransaction.amount;
            }
        }
    } else {
        updatedMoneyRequestReport = updateIOUOwnerAndTotal(iouReport, actorAccountID ?? CONST.DEFAULT_NUMBER_ID, diff, getCurrency(transaction), false, true, isTransactionOnHold);
    }

    return {updatedMoneyRequestReport, isTotalIndeterminate};
}

type GetUpdateMoneyRequestParamsType = {
    transactionID: string | undefined;
    transactionThreadReport: OnyxEntry<OnyxTypes.Report>;
    transactionChanges: TransactionChanges;
    policy: OnyxEntry<OnyxTypes.Policy>;
    policyTagList: OnyxTypes.OnyxInputOrEntry<OnyxTypes.PolicyTagLists>;
    policyRecentlyUsedTags?: OnyxEntry<RecentlyUsedTags>;
    policyCategories: OnyxTypes.OnyxInputOrEntry<OnyxTypes.PolicyCategories>;
    policyRecentlyUsedCategories?: OnyxEntry<OnyxTypes.RecentlyUsedCategories>;
    violations?: OnyxEntry<OnyxTypes.TransactionViolations>;
    hash?: number;
    allowNegative?: boolean;
    newTransactionReportID?: string | undefined;
    iouReport: OnyxEntry<OnyxTypes.Report>;
    shouldBuildOptimisticModifiedExpenseReportAction?: boolean;
    currentUserAccountIDParam: number;
    currentUserEmailParam: string;
    isASAPSubmitBetaEnabled: boolean;
    policyRecentlyUsedCurrencies?: string[];
    iouReportNextStep: OnyxEntry<OnyxTypes.ReportNextStepDeprecated>;
};

function getUpdateMoneyRequestParams(params: GetUpdateMoneyRequestParamsType): UpdateMoneyRequestData {
    const {
        transactionID,
        transactionThreadReport,
        transactionChanges,
        policy,
        policyTagList,
        policyRecentlyUsedTags,
        policyCategories,
        policyRecentlyUsedCategories,
        violations,
        hash,
        allowNegative,
        newTransactionReportID,
        iouReport,
        shouldBuildOptimisticModifiedExpenseReportAction = true,
        currentUserAccountIDParam,
        currentUserEmailParam,
        isASAPSubmitBetaEnabled,
        policyRecentlyUsedCurrencies,
        iouReportNextStep,
    } = params;
    const optimisticData: OnyxUpdate[] = [];
    const successData: Array<
        OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION_DRAFT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.TRANSACTION>
    > = [];
    const failureData: Array<
        OnyxUpdate<
            | typeof ONYXKEYS.COLLECTION.TRANSACTION
            | typeof ONYXKEYS.COLLECTION.REPORT
            | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS
            | typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS
            | typeof ONYXKEYS.COLLECTION.SNAPSHOT
            | typeof ONYXKEYS.COLLECTION.NEXT_STEP
        >
    > = [];

    // Step 1: Set any "pending fields" (ones updated while the user was offline) to have error messages in the failureData
    const pendingFields: OnyxTypes.Transaction['pendingFields'] = Object.fromEntries(Object.keys(transactionChanges).map((key) => [key, CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE]));
    const clearedPendingFields = getClearedPendingFields(transactionChanges);
    const errorFields = Object.fromEntries(Object.keys(pendingFields).map((key) => [key, getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericEditFailureMessage')]));

    // Step 2: Get all the collections being updated
    const transaction = allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];

    const isTransactionOnHold = isOnHold(transaction);
    const isFromExpenseReport = isExpenseReport(iouReport);
    const updatedTransaction: OnyxEntry<OnyxTypes.Transaction> = transaction
        ? getUpdatedTransaction({
              transaction,
              transactionChanges,
              isFromExpenseReport,
              policy,
          })
        : undefined;

    const transactionDetails = getTransactionDetails(updatedTransaction, undefined, undefined, allowNegative);

    if (transactionDetails?.waypoints) {
        // This needs to be a JSON string since we're sending this to the MapBox API
        transactionDetails.waypoints = JSON.stringify(transactionDetails.waypoints);
    }

    const dataToIncludeInParams: Partial<TransactionDetails> = Object.fromEntries(Object.entries(transactionDetails ?? {}).filter(([key]) => key in transactionChanges));

    const apiParams: UpdateMoneyRequestParams = {
        ...dataToIncludeInParams,
        reportID: iouReport?.reportID,
        transactionID,
    };

    const hasPendingWaypoints = 'waypoints' in transactionChanges;
    const hasModifiedDistanceRate = 'customUnitRateID' in transactionChanges;
    const hasModifiedCreated = 'created' in transactionChanges;
    const hasModifiedAmount = 'amount' in transactionChanges;
    if (transaction && updatedTransaction && (hasPendingWaypoints || hasModifiedDistanceRate)) {
        // Delete the draft transaction when editing waypoints when the server responds successfully and there are no errors
        successData.push({
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`,
            value: null,
        });

        // Revert the transaction's amount to the original value on failure.
        // The IOU Report will be fully reverted in the failureData further below.
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: {
                amount: transaction.amount,
                modifiedAmount: transaction.modifiedAmount,
                modifiedMerchant: transaction.modifiedMerchant,
                modifiedCurrency: transaction.modifiedCurrency,
                reportID: transaction.reportID,
            },
        });
    }

    // Step 3: Build the modified expense report actions
    // We don't create a modified report action if:
    // - we're updating the waypoints
    // - we're updating the distance rate while the waypoints are still pending
    // - we're merging two expenses (server does not create MODIFIED_EXPENSE in this flow)
    // In these cases, there isn't a valid optimistic mileage data we can use,
    // and the report action is created on the server with the distance-related response from the MapBox API
    const updatedReportAction = shouldBuildOptimisticModifiedExpenseReportAction
        ? buildOptimisticModifiedExpenseReportAction(transactionThreadReport, transaction, transactionChanges, isFromExpenseReport, policy, updatedTransaction, allowNegative)
        : null;
    if (!hasPendingWaypoints && !(hasModifiedDistanceRate && isFetchingWaypointsFromServer(transaction)) && updatedReportAction) {
        apiParams.reportActionID = updatedReportAction.reportActionID;

        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReport?.reportID}`,
            value: {
                [updatedReportAction.reportActionID]: updatedReportAction as OnyxTypes.ReportAction,
            },
        });
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReport?.reportID}`,
            value: {
                lastReadTime: updatedReportAction.created,
            },
        });
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReport?.reportID}`,
            value: {
                lastReadTime: transactionThreadReport?.lastReadTime,
            },
        });
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReport?.reportID}`,
            value: {
                [updatedReportAction.reportActionID]: {pendingAction: null},
            },
        });

        // Don't push error to failureData when updating distance requests
        // The error will be handled by API response for distance requests
        const isDistanceTransaction = transaction && isDistanceRequestTransactionUtils(transaction);

        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReport?.reportID}`,
            value: {
                [updatedReportAction.reportActionID]: isDistanceTransaction
                    ? null
                    : {
                          ...(updatedReportAction as OnyxTypes.ReportAction),
                          errors: getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericEditFailureMessage'),
                      },
            },
        });
    }

    // Step 4: Compute the IOU total and update the report preview message (and report header) so LHN amount owed is correct.
    // If the diff is indeterminate we cannot calculate the new iou report total from front-end due to currency differences.
    const {updatedMoneyRequestReport, isTotalIndeterminate} = getUpdatedMoneyRequestReportData(
        iouReport,
        updatedTransaction,
        transaction,
        isTransactionOnHold,
        policy,
        updatedReportAction?.actorAccountID,
    );

    optimisticData.push(
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport?.reportID}`,
            value: {...updatedMoneyRequestReport, ...(isTotalIndeterminate && {pendingFields: {total: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}})},
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport?.parentReportID}`,
            value: getOutstandingChildRequest(updatedMoneyRequestReport),
        },
    );
    if (updatedReportAction && isOneTransactionThread(transactionThreadReport ?? undefined, iouReport ?? undefined, undefined)) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport?.reportID}`,
            value: {
                lastReadTime: updatedReportAction.created,
            },
        });
    }
    successData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport?.reportID}`,
        value: {pendingAction: null, ...(isTotalIndeterminate && {pendingFields: {total: null}})},
    });

    // Optimistically modify the transaction and the transaction thread
    optimisticData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
        value: {
            ...updatedTransaction,
            errorFields: null,
            reportID: newTransactionReportID ?? updatedTransaction?.reportID,
        },
    });

    if (updatedReportAction && transactionThreadReport?.reportID) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReport.reportID}`,
            value: {
                lastActorAccountID: updatedReportAction.actorAccountID,
            },
        });
    }

    if (isScanning(transaction) && ('amount' in transactionChanges || 'currency' in transactionChanges)) {
        if (transactionThreadReport?.parentReportActionID) {
            optimisticData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport?.reportID}`,
                value: {
                    [transactionThreadReport?.parentReportActionID]: {
                        originalMessage: {
                            whisperedTo: [],
                        },
                    },
                },
            });
        }

        if (iouReport?.parentReportActionID) {
            optimisticData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport?.parentReportID}`,
                value: {
                    [iouReport.parentReportActionID]: {
                        originalMessage: {
                            whisperedTo: [],
                        },
                    },
                },
            });
        }
    }

    // Update recently used categories if the category is changed
    const hasModifiedCategory = 'category' in transactionChanges;
    if (hasModifiedCategory) {
        const optimisticPolicyRecentlyUsedCategories = mergePolicyRecentlyUsedCategories(transactionChanges.category, policyRecentlyUsedCategories);
        if (optimisticPolicyRecentlyUsedCategories.length) {
            optimisticData.push({
                onyxMethod: Onyx.METHOD.SET,
                key: `${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_CATEGORIES}${iouReport?.policyID}`,
                value: optimisticPolicyRecentlyUsedCategories,
            });
        }
    }

    // Update recently used currencies if the currency is changed
    if ('currency' in transactionChanges) {
        const optimisticRecentlyUsedCurrencies = mergePolicyRecentlyUsedCurrencies(transactionChanges.currency, policyRecentlyUsedCurrencies ?? []);
        if (optimisticRecentlyUsedCurrencies.length) {
            optimisticData.push({
                onyxMethod: Onyx.METHOD.SET,
                key: ONYXKEYS.RECENTLY_USED_CURRENCIES,
                value: optimisticRecentlyUsedCurrencies,
            });
        }
    }

    // Update recently used categories if the tag is changed
    const hasModifiedTag = 'tag' in transactionChanges;
    if (hasModifiedTag) {
        const optimisticPolicyRecentlyUsedTags = buildOptimisticPolicyRecentlyUsedTags({
            policyTags: getPolicyTagsData(iouReport?.policyID),
            policyRecentlyUsedTags,
            transactionTags: transactionChanges.tag,
        });
        if (!isEmptyObject(optimisticPolicyRecentlyUsedTags)) {
            optimisticData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS}${iouReport?.policyID}`,
                value: optimisticPolicyRecentlyUsedTags,
            });
        }
    }

    if ('attendees' in transactionChanges) {
        // Update violation limit, if we modify attendees. The given limit value is for a single attendee, if we have multiple attendees we should multiply limit by attendee count
        const overLimitViolation = violations?.find((violation) => violation.name === 'overLimit');
        if (overLimitViolation) {
            const limitForSingleAttendee = ViolationsUtils.getViolationAmountLimit(overLimitViolation);
            if (limitForSingleAttendee * (transactionChanges?.attendees?.length ?? 1) > Math.abs(getAmount(transaction))) {
                optimisticData.push({
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`,
                    // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
                    value: violations?.filter((violation) => violation.name !== 'overLimit') ?? [],
                });
            }
        }
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_RECENT_ATTENDEES,
            value: lodashUnionBy(
                transactionChanges.attendees?.map(({avatarUrl, displayName, email}) => ({avatarUrl, displayName, email})),
                recentAttendees,
                'email',
            ).slice(0, CONST.IOU.MAX_RECENT_REPORTS_TO_SHOW),
        });
    }

    if (Array.isArray(apiParams?.attendees)) {
        apiParams.attendees = JSON.stringify(apiParams?.attendees);
    }

    // Clear out the error fields and loading states on success
    successData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
        value: {
            pendingFields: clearedPendingFields,
            isLoading: false,
            errorFields: null,
            routes: null,
        },
    });

    // Clear out loading states, pending fields, and add the error fields
    failureData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
        value: {
            ...transaction,
            pendingFields: clearedPendingFields,
            isLoading: false,
            errorFields,
            reportID: transaction?.reportID,
        },
    });

    if (iouReport) {
        // Reset the iouReport to its original state
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport.reportID}`,
            value: {...iouReport, ...(isTotalIndeterminate && {pendingFields: {total: null}})},
        });
    }

    const hasModifiedCurrency = 'currency' in transactionChanges;
    const hasModifiedComment = 'comment' in transactionChanges;
    const hasModifiedReimbursable = 'reimbursable' in transactionChanges;
    const hasModifiedTaxCode = 'taxCode' in transactionChanges;
    const hasModifiedDate = 'date' in transactionChanges;
    const hasModifiedMerchant = 'merchant' in transactionChanges;
    const hasModifiedAttendees = 'attendees' in transactionChanges;

    const isInvoice = isInvoiceReportReportUtils(iouReport);
    if (
        transactionID &&
        policy &&
        isPaidGroupPolicy(policy) &&
        !isInvoice &&
        updatedTransaction &&
        (hasPendingWaypoints ||
            hasModifiedTag ||
            hasModifiedCategory ||
            hasModifiedComment ||
            hasModifiedMerchant ||
            hasModifiedDistanceRate ||
            hasModifiedDate ||
            hasModifiedCurrency ||
            hasModifiedAmount ||
            hasModifiedCreated ||
            hasModifiedReimbursable ||
            hasModifiedTaxCode ||
            hasModifiedAttendees)
    ) {
        const currentTransactionViolations = allTransactionViolations[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`] ?? [];
        // If the amount, currency or date have been modified, we remove the duplicate violations since they would be out of date as the transaction has changed
        let optimisticViolations =
            hasModifiedAmount || hasModifiedDate || hasModifiedCurrency
                ? currentTransactionViolations.filter((violation) => violation.name !== CONST.VIOLATIONS.DUPLICATED_TRANSACTION)
                : currentTransactionViolations;
        optimisticViolations =
            hasModifiedCategory && transactionChanges.category === ''
                ? optimisticViolations.filter((violation) => violation.name !== CONST.VIOLATIONS.CATEGORY_OUT_OF_POLICY)
                : optimisticViolations;
        if (hasPendingWaypoints) {
            optimisticViolations = optimisticViolations.filter((violation) => violation.name !== CONST.VIOLATIONS.NO_ROUTE);
        }

        const violationsOnyxData = ViolationsUtils.getViolationsOnyxData(
            updatedTransaction,
            optimisticViolations,
            policy,
            policyTagList ?? {},
            policyCategories ?? {},
            hasDependentTags(policy, policyTagList ?? {}),
            isInvoice,
            isSelfDM(iouReport),
            iouReport,
            isFromExpenseReport,
        );
        optimisticData.push(violationsOnyxData);
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`,
            value: currentTransactionViolations,
        });
        if (hash) {
            // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
            optimisticData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}`,
                value: {
                    data: {
                        [`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`]: violationsOnyxData.value,
                    },
                },
            });
            // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
            failureData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}`,
                value: {
                    data: {
                        [`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`]: currentTransactionViolations,
                    },
                },
            });
        }
        if (
            violationsOnyxData &&
            ((iouReport?.statusNum ?? CONST.REPORT.STATUS_NUM.OPEN) === CONST.REPORT.STATUS_NUM.OPEN ||
                (hasModifiedReimbursable && iouReport?.statusNum === CONST.REPORT.STATUS_NUM.SUBMITTED))
        ) {
            const currentNextStep = iouReportNextStep ?? {};
            const shouldFixViolations = Array.isArray(violationsOnyxData.value) && violationsOnyxData.value.length > 0;
            const moneyRequestReport = updatedMoneyRequestReport ?? iouReport ?? undefined;
            const hasViolations = hasViolationsReportUtils(moneyRequestReport?.reportID, allTransactionViolations, currentUserAccountIDParam, currentUserEmailParam);
            const optimisticNextStep = buildOptimisticNextStep({
                report: moneyRequestReport,
                predictedNextStatus: iouReport?.statusNum ?? CONST.REPORT.STATUS_NUM.OPEN,
                shouldFixViolations,
                currentUserAccountIDParam,
                currentUserEmailParam,
                hasViolations,
                isASAPSubmitBetaEnabled,
                policy,
            });
            optimisticData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.NEXT_STEP}${iouReport?.reportID}`,
                // buildOptimisticNextStep is used in parallel
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                value: buildNextStepNew({
                    report: moneyRequestReport,
                    predictedNextStatus: iouReport?.statusNum ?? CONST.REPORT.STATUS_NUM.OPEN,
                    shouldFixViolations,
                    currentUserAccountIDParam,
                    currentUserEmailParam,
                    hasViolations,
                    isASAPSubmitBetaEnabled,
                    policy,
                }),
            });
            optimisticData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport?.reportID}`,
                value: {
                    nextStep: optimisticNextStep,
                    pendingFields: {
                        nextStep: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    },
                },
            });
            failureData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.NEXT_STEP}${iouReport?.reportID}`,
                value: currentNextStep,
            });
            failureData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport?.reportID}`,
                value: {
                    nextStep: iouReport?.nextStep ?? null,
                    pendingFields: {
                        nextStep: null,
                    },
                },
            });
            successData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport?.reportID}`,
                value: {
                    pendingFields: {
                        nextStep: null,
                    },
                },
            });
        }
    }

    // Reset the transaction thread to its original state
    if (transactionThreadReport?.reportID) {
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReport.reportID}`,
            value: transactionThreadReport,
        });
    }

    return {
        params: apiParams,
        onyxData: {optimisticData, successData, failureData},
    };
}

/**
 * @param transactionID
 * @param transactionThreadReportID
 * @param transactionChanges
 * @param [transactionChanges.created] Present when updated the date field
 * @param policy  May be undefined, an empty object, or an object matching the Policy type (src/types/onyx/Policy.ts)
 * @param [shouldBuildOptimisticModifiedExpenseReportAction=true] When true, build an optimistic MODIFIED_EXPENSE report action.
 */
function getUpdateTrackExpenseParams(
    transactionID: string | undefined,
    transactionThreadReportID: string | undefined,
    transactionChanges: TransactionChanges,
    policy: OnyxEntry<OnyxTypes.Policy>,
    shouldBuildOptimisticModifiedExpenseReportAction = true,
): UpdateMoneyRequestData {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.TRANSACTION | typeof ONYXKEYS.COLLECTION.REPORT>> = [];
    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION_DRAFT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.TRANSACTION>> = [];
    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.REPORT>> = [];

    // Step 1: Set any "pending fields" (ones updated while the user was offline) to have error messages in the failureData
    const pendingFields = Object.fromEntries(Object.keys(transactionChanges).map((key) => [key, CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE]));
    const clearedPendingFields = getClearedPendingFields(transactionChanges);
    const errorFields = Object.fromEntries(Object.keys(pendingFields).map((key) => [key, getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericEditFailureMessage')]));

    // Step 2: Get all the collections being updated
    const transactionThread = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`] ?? null;
    const transaction = allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
    const chatReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${transactionThread?.parentReportID}`] ?? null;
    const updatedTransaction = transaction
        ? getUpdatedTransaction({
              transaction,
              transactionChanges,
              isFromExpenseReport: false,
              policy,
          })
        : null;
    const transactionDetails = getTransactionDetails(updatedTransaction);

    if (transactionDetails?.waypoints) {
        // This needs to be a JSON string since we're sending this to the MapBox API
        transactionDetails.waypoints = JSON.stringify(transactionDetails.waypoints);
    }

    const dataToIncludeInParams: Partial<TransactionDetails> = Object.fromEntries(Object.entries(transactionDetails ?? {}).filter(([key]) => key in transactionChanges));

    const apiParams: UpdateMoneyRequestParams = {
        ...dataToIncludeInParams,
        reportID: chatReport?.reportID,
        transactionID,
    };

    const hasPendingWaypoints = 'waypoints' in transactionChanges;
    const hasModifiedDistanceRate = 'customUnitRateID' in transactionChanges;
    if (transaction && updatedTransaction && (hasPendingWaypoints || hasModifiedDistanceRate)) {
        // Delete the draft transaction when editing waypoints when the server responds successfully and there are no errors
        successData.push({
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`,
            value: null,
        });

        // Revert the transaction's amount to the original value on failure.
        // The IOU Report will be fully reverted in the failureData further below.
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: {
                amount: transaction.amount,
                modifiedAmount: transaction.modifiedAmount,
                modifiedMerchant: transaction.modifiedMerchant,
            },
        });
    }

    // Step 3: Build the modified expense report actions
    // We don't create a modified report action if:
    // - we're updating the waypoints
    // - we're updating the distance rate while the waypoints are still pending
    // - we're merging two expenses (server does not create MODIFIED_EXPENSE in this flow)
    // In these cases, there isn't a valid optimistic mileage data we can use,
    // and the report action is created on the server with the distance-related response from the MapBox API
    const allowNegative = shouldEnableNegative(transactionThread ?? undefined);
    const updatedReportAction = shouldBuildOptimisticModifiedExpenseReportAction
        ? buildOptimisticModifiedExpenseReportAction(transactionThread, transaction, transactionChanges, false, policy, updatedTransaction, allowNegative)
        : null;
    if (!hasPendingWaypoints && !(hasModifiedDistanceRate && isFetchingWaypointsFromServer(transaction)) && updatedReportAction) {
        apiParams.reportActionID = updatedReportAction.reportActionID;

        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThread?.reportID}`,
            value: {
                [updatedReportAction.reportActionID]: updatedReportAction as OnyxTypes.ReportAction,
            },
        });
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThread?.reportID}`,
            value: {
                [updatedReportAction.reportActionID]: {pendingAction: null},
            },
        });
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThread?.reportID}`,
            value: {
                [updatedReportAction.reportActionID]: {
                    ...(updatedReportAction as OnyxTypes.ReportAction),
                    errors: getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericEditFailureMessage'),
                },
            },
        });
    }

    // Step 4: Update the report preview message (and report header) so LHN amount tracked is correct.
    // Optimistically modify the transaction and the transaction thread
    optimisticData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
        value: {
            ...updatedTransaction,
            pendingFields,
            errorFields: null,
        },
    });

    if (updatedReportAction) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`,
            value: {
                lastActorAccountID: updatedReportAction.actorAccountID,
            },
        });
    }

    if (isScanning(transaction) && transactionThread?.parentReportActionID && ('amount' in transactionChanges || 'currency' in transactionChanges)) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport?.reportID}`,
            value: {[transactionThread.parentReportActionID]: {originalMessage: {whisperedTo: []}}},
        });
    }

    // Clear out the error fields and loading states on success
    successData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
        value: {
            pendingFields: clearedPendingFields,
            isLoading: false,
            errorFields: null,
            routes: null,
        },
    });

    // Clear out loading states, pending fields, and add the error fields
    failureData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
        value: {
            ...transaction,
            pendingFields: clearedPendingFields,
            isLoading: false,
            errorFields,
        },
    });

    // Reset the transaction thread to its original state
    failureData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`,
        value: transactionThread,
    });

    return {
        params: apiParams,
        onyxData: {optimisticData, successData, failureData},
    };
}

type UpdateMoneyRequestDateParams = {
    transactionID: string;
    transactionThreadReport: OnyxEntry<OnyxTypes.Report>;
    parentReport: OnyxEntry<OnyxTypes.Report>;
    transactions: OnyxCollection<OnyxTypes.Transaction>;
    transactionViolations: OnyxCollection<OnyxTypes.TransactionViolations>;
    value: string;
    policy: OnyxEntry<OnyxTypes.Policy>;
    policyTags: OnyxEntry<OnyxTypes.PolicyTagLists>;
    policyCategories: OnyxEntry<OnyxTypes.PolicyCategories>;
    currentUserAccountIDParam: number;
    currentUserEmailParam: string;
    isASAPSubmitBetaEnabled: boolean;
    parentReportNextStep: OnyxEntry<OnyxTypes.ReportNextStepDeprecated>;
};

/** Updates the created date of an expense */
function updateMoneyRequestDate({
    transactionID,
    transactionThreadReport,
    parentReport,
    transactions,
    transactionViolations,
    value,
    policy,
    policyTags,
    policyCategories,
    currentUserAccountIDParam,
    currentUserEmailParam,
    isASAPSubmitBetaEnabled,
    parentReportNextStep,
}: UpdateMoneyRequestDateParams) {
    const transactionChanges: TransactionChanges = {
        created: value,
    };
    let data: UpdateMoneyRequestData;
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    if (isTrackExpenseReport(transactionThreadReport) && isSelfDM(parentReport)) {
        data = getUpdateTrackExpenseParams(transactionID, transactionThreadReport?.reportID, transactionChanges, policy);
    } else {
        data = getUpdateMoneyRequestParams({
            transactionID,
            transactionThreadReport,
            iouReport: parentReport,
            transactionChanges,
            policy,
            policyTagList: policyTags,
            policyCategories,
            currentUserAccountIDParam,
            currentUserEmailParam,
            isASAPSubmitBetaEnabled,
            iouReportNextStep: parentReportNextStep,
        });
        removeTransactionFromDuplicateTransactionViolation(data.onyxData, transactionID, transactions, transactionViolations);
    }
    const {params, onyxData} = data;
    API.write(WRITE_COMMANDS.UPDATE_MONEY_REQUEST_DATE, params, onyxData);
}

/** Updates the billable field of an expense */
function updateMoneyRequestBillable({
    transactionID,
    transactionThreadReport,
    parentReport,
    value,
    policy,
    policyTagList,
    policyCategories,
    currentUserAccountIDParam,
    currentUserEmailParam,
    isASAPSubmitBetaEnabled,
    parentReportNextStep,
}: {
    transactionID: string | undefined;
    transactionThreadReport: OnyxEntry<OnyxTypes.Report>;
    parentReport: OnyxEntry<OnyxTypes.Report>;
    value: boolean;
    policy: OnyxEntry<OnyxTypes.Policy>;
    policyTagList: OnyxEntry<OnyxTypes.PolicyTagLists>;
    policyCategories: OnyxEntry<OnyxTypes.PolicyCategories>;
    currentUserAccountIDParam: number;
    currentUserEmailParam: string;
    isASAPSubmitBetaEnabled: boolean;
    parentReportNextStep: OnyxEntry<OnyxTypes.ReportNextStepDeprecated>;
}) {
    if (!transactionID || !transactionThreadReport?.reportID) {
        return;
    }
    const transactionChanges: TransactionChanges = {
        billable: value,
    };
    const {params, onyxData} = getUpdateMoneyRequestParams({
        transactionID,
        transactionThreadReport,
        iouReport: parentReport,
        transactionChanges,
        policy,
        policyTagList,
        policyCategories,
        currentUserAccountIDParam,
        currentUserEmailParam,
        isASAPSubmitBetaEnabled,
        iouReportNextStep: parentReportNextStep,
    });
    API.write(WRITE_COMMANDS.UPDATE_MONEY_REQUEST_BILLABLE, params, onyxData);
}

function updateMoneyRequestReimbursable({
    transactionID,
    transactionThreadReport,
    parentReport,
    value,
    policy,
    policyTagList,
    policyCategories,
    currentUserAccountIDParam,
    currentUserEmailParam,
    isASAPSubmitBetaEnabled,
    parentReportNextStep,
}: {
    transactionID: string | undefined;
    transactionThreadReport: OnyxEntry<OnyxTypes.Report>;
    parentReport: OnyxEntry<OnyxTypes.Report>;
    value: boolean;
    policy: OnyxEntry<OnyxTypes.Policy>;
    policyTagList: OnyxEntry<OnyxTypes.PolicyTagLists>;
    policyCategories: OnyxEntry<OnyxTypes.PolicyCategories>;
    currentUserAccountIDParam: number;
    currentUserEmailParam: string;
    isASAPSubmitBetaEnabled: boolean;
    parentReportNextStep: OnyxEntry<OnyxTypes.ReportNextStepDeprecated>;
}) {
    if (!transactionID || !transactionThreadReport?.reportID) {
        return;
    }
    const transactionChanges: TransactionChanges = {
        reimbursable: value,
    };
    const {params, onyxData} = getUpdateMoneyRequestParams({
        transactionID,
        transactionThreadReport,
        iouReport: parentReport,
        transactionChanges,
        policy,
        policyTagList,
        policyCategories,
        currentUserAccountIDParam,
        currentUserEmailParam,
        isASAPSubmitBetaEnabled,
        iouReportNextStep: parentReportNextStep,
    });
    API.write(WRITE_COMMANDS.UPDATE_MONEY_REQUEST_REIMBURSABLE, params, onyxData);
}

/** Updates the merchant field of an expense */
function updateMoneyRequestMerchant({
    transactionID,
    transactionThreadReport,
    parentReport,
    value,
    policy,
    policyTagList,
    policyCategories,
    currentUserAccountIDParam,
    currentUserEmailParam,
    isASAPSubmitBetaEnabled,
    parentReportNextStep,
}: {
    transactionID: string;
    transactionThreadReport: OnyxEntry<OnyxTypes.Report>;
    parentReport: OnyxEntry<OnyxTypes.Report>;
    value: string;
    policy: OnyxEntry<OnyxTypes.Policy>;
    policyTagList: OnyxEntry<OnyxTypes.PolicyTagLists>;
    policyCategories: OnyxEntry<OnyxTypes.PolicyCategories>;
    currentUserAccountIDParam: number;
    currentUserEmailParam: string;
    isASAPSubmitBetaEnabled: boolean;
    parentReportNextStep: OnyxEntry<OnyxTypes.ReportNextStepDeprecated>;
}) {
    const transactionChanges: TransactionChanges = {
        merchant: value,
    };
    let data: UpdateMoneyRequestData;
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    if (isTrackExpenseReport(transactionThreadReport) && isSelfDM(parentReport)) {
        data = getUpdateTrackExpenseParams(transactionID, transactionThreadReport?.reportID, transactionChanges, policy);
    } else {
        data = getUpdateMoneyRequestParams({
            transactionID,
            transactionThreadReport,
            iouReport: parentReport,
            transactionChanges,
            policy,
            policyTagList,
            policyCategories,
            currentUserAccountIDParam,
            currentUserEmailParam,
            isASAPSubmitBetaEnabled,
            iouReportNextStep: parentReportNextStep,
        });
    }
    const {params, onyxData} = data;
    API.write(WRITE_COMMANDS.UPDATE_MONEY_REQUEST_MERCHANT, params, onyxData);
}

/** Updates the attendees list of an expense */
function updateMoneyRequestAttendees({
    transactionID,
    transactionThreadReport,
    parentReport,
    attendees,
    policy,
    policyTagList,
    policyCategories,
    violations,
    currentUserAccountIDParam,
    currentUserEmailParam,
    isASAPSubmitBetaEnabled,
    parentReportNextStep,
}: {
    transactionID: string;
    transactionThreadReport: OnyxEntry<OnyxTypes.Report>;
    parentReport: OnyxEntry<OnyxTypes.Report>;
    attendees: Attendee[];
    policy: OnyxEntry<OnyxTypes.Policy>;
    policyTagList: OnyxEntry<OnyxTypes.PolicyTagLists>;
    policyCategories: OnyxEntry<OnyxTypes.PolicyCategories>;
    violations: OnyxEntry<OnyxTypes.TransactionViolations> | undefined;
    currentUserAccountIDParam: number;
    currentUserEmailParam: string;
    isASAPSubmitBetaEnabled: boolean;
    parentReportNextStep: OnyxEntry<OnyxTypes.ReportNextStepDeprecated>;
}) {
    const transactionChanges: TransactionChanges = {
        attendees,
    };
    const data = getUpdateMoneyRequestParams({
        transactionID,
        transactionThreadReport,
        iouReport: parentReport,
        transactionChanges,
        policy,
        policyTagList,
        policyCategories,
        violations,
        currentUserAccountIDParam,
        currentUserEmailParam,
        isASAPSubmitBetaEnabled,
        iouReportNextStep: parentReportNextStep,
    });
    const {params, onyxData} = data;
    API.write(WRITE_COMMANDS.UPDATE_MONEY_REQUEST_ATTENDEES, params, onyxData);
}

type UpdateMoneyRequestTagParams = {
    transactionID: string;
    transactionThreadReport: OnyxEntry<OnyxTypes.Report>;
    parentReport: OnyxEntry<OnyxTypes.Report>;
    tag: string;
    policy: OnyxEntry<OnyxTypes.Policy>;
    policyTagList: OnyxEntry<OnyxTypes.PolicyTagLists>;
    policyRecentlyUsedTags: OnyxEntry<RecentlyUsedTags>;
    policyCategories: OnyxEntry<OnyxTypes.PolicyCategories>;
    currentUserAccountIDParam: number;
    currentUserEmailParam: string;
    isASAPSubmitBetaEnabled: boolean;
    hash?: number;
    parentReportNextStep: OnyxEntry<OnyxTypes.ReportNextStepDeprecated>;
};

/** Updates the tag of an expense */
function updateMoneyRequestTag({
    transactionID,
    transactionThreadReport,
    parentReport,
    tag,
    policy,
    policyTagList,
    policyRecentlyUsedTags,
    policyCategories,
    currentUserAccountIDParam,
    currentUserEmailParam,
    isASAPSubmitBetaEnabled,
    hash,
    parentReportNextStep,
}: UpdateMoneyRequestTagParams) {
    const transactionChanges: TransactionChanges = {
        tag,
    };
    const {params, onyxData} = getUpdateMoneyRequestParams({
        transactionID,
        transactionThreadReport,
        iouReport: parentReport,
        transactionChanges,
        policy,
        policyTagList,
        policyRecentlyUsedTags,
        policyCategories,
        hash,
        currentUserAccountIDParam,
        currentUserEmailParam,
        isASAPSubmitBetaEnabled,
        iouReportNextStep: parentReportNextStep,
    });
    API.write(WRITE_COMMANDS.UPDATE_MONEY_REQUEST_TAG, params, onyxData);
}

/** Updates the created tax amount of an expense */
function updateMoneyRequestTaxAmount({
    transactionID,
    transactionThreadReport,
    parentReport,
    taxAmount,
    policy,
    policyTagList,
    policyCategories,
    currentUserAccountIDParam,
    currentUserEmailParam,
    isASAPSubmitBetaEnabled,
    parentReportNextStep,
}: {
    transactionID: string;
    transactionThreadReport: OnyxEntry<OnyxTypes.Report>;
    parentReport: OnyxEntry<OnyxTypes.Report>;
    taxAmount: number;
    policy: OnyxEntry<OnyxTypes.Policy>;
    policyTagList: OnyxEntry<OnyxTypes.PolicyTagLists>;
    policyCategories: OnyxEntry<OnyxTypes.PolicyCategories>;
    currentUserAccountIDParam: number;
    currentUserEmailParam: string;
    isASAPSubmitBetaEnabled: boolean;
    parentReportNextStep: OnyxEntry<OnyxTypes.ReportNextStepDeprecated>;
}) {
    const transactionChanges = {
        taxAmount,
    };
    const {params, onyxData} = getUpdateMoneyRequestParams({
        transactionID,
        transactionThreadReport,
        iouReport: parentReport,
        transactionChanges,
        policy,
        policyTagList,
        policyCategories,
        currentUserAccountIDParam,
        currentUserEmailParam,
        isASAPSubmitBetaEnabled,
        iouReportNextStep: parentReportNextStep,
    });
    API.write(WRITE_COMMANDS.UPDATE_MONEY_REQUEST_TAX_AMOUNT, params, onyxData);
}

type UpdateMoneyRequestTaxRateParams = {
    transactionID: string | undefined;
    transactionThreadReport: OnyxEntry<OnyxTypes.Report>;
    parentReport: OnyxEntry<OnyxTypes.Report>;
    taxCode: string;
    taxAmount: number;
    taxValue: string;
    policy: OnyxEntry<OnyxTypes.Policy>;
    policyTagList: OnyxEntry<OnyxTypes.PolicyTagLists>;
    policyCategories: OnyxEntry<OnyxTypes.PolicyCategories>;
    currentUserAccountIDParam: number;
    currentUserEmailParam: string;
    isASAPSubmitBetaEnabled: boolean;
    parentReportNextStep: OnyxEntry<OnyxTypes.ReportNextStepDeprecated>;
};

/** Updates the created tax rate of an expense */
function updateMoneyRequestTaxRate({
    transactionID,
    transactionThreadReport,
    parentReport,
    taxCode,
    taxAmount,
    taxValue,
    policy,
    policyTagList,
    policyCategories,
    currentUserAccountIDParam,
    currentUserEmailParam,
    isASAPSubmitBetaEnabled,
    parentReportNextStep,
}: UpdateMoneyRequestTaxRateParams) {
    const transactionChanges = {
        taxCode,
        taxAmount,
        taxValue,
    };
    const {params, onyxData} = getUpdateMoneyRequestParams({
        transactionID,
        transactionThreadReport,
        iouReport: parentReport,
        transactionChanges,
        policy,
        policyTagList,
        policyCategories,
        currentUserAccountIDParam,
        currentUserEmailParam,
        isASAPSubmitBetaEnabled,
        iouReportNextStep: parentReportNextStep,
    });

    API.write(WRITE_COMMANDS.UPDATE_MONEY_REQUEST_TAX_RATE, params, onyxData);
}

type UpdateMoneyRequestDistanceParams = {
    transactionID: string | undefined;
    transactionThreadReport: OnyxEntry<OnyxTypes.Report>;
    parentReport: OnyxEntry<OnyxTypes.Report>;
    waypoints?: WaypointCollection;
    distance?: number;
    routes?: Routes;
    policy: OnyxEntry<OnyxTypes.Policy>;
    policyTagList: OnyxEntry<OnyxTypes.PolicyTagLists>;
    policyCategories: OnyxEntry<OnyxTypes.PolicyCategories>;
    transactionBackup: OnyxEntry<OnyxTypes.Transaction>;
    currentUserAccountIDParam: number;
    currentUserEmailParam: string;
    isASAPSubmitBetaEnabled: boolean;
    odometerStart?: number;
    odometerEnd?: number;
    parentReportNextStep: OnyxEntry<OnyxTypes.ReportNextStepDeprecated>;
};

/** Updates the waypoints of a distance expense */
function updateMoneyRequestDistance({
    transactionID,
    transactionThreadReport,
    parentReport,
    waypoints,
    distance,
    routes = undefined,
    policy,
    policyTagList,
    policyCategories,
    transactionBackup,
    currentUserAccountIDParam,
    currentUserEmailParam,
    isASAPSubmitBetaEnabled,
    odometerStart,
    odometerEnd,
    parentReportNextStep,
}: UpdateMoneyRequestDistanceParams) {
    const transactionChanges: TransactionChanges = {
        ...(waypoints && {waypoints: sanitizeRecentWaypoints(waypoints)}),
        routes,
        ...(distance && {distance}),
        ...(odometerStart !== undefined && {odometerStart}),
        ...(odometerEnd !== undefined && {odometerEnd}),
    };
    let data: UpdateMoneyRequestData;
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    if (isTrackExpenseReport(transactionThreadReport) && isSelfDM(parentReport)) {
        data = getUpdateTrackExpenseParams(transactionID, transactionThreadReport?.reportID, transactionChanges, policy);
    } else {
        data = getUpdateMoneyRequestParams({
            transactionID,
            transactionThreadReport,
            iouReport: parentReport,
            transactionChanges,
            policy,
            policyTagList,
            policyCategories,
            currentUserAccountIDParam,
            currentUserEmailParam,
            isASAPSubmitBetaEnabled,
            iouReportNextStep: parentReportNextStep,
        });
    }
    const {params, onyxData} = data;

    if (odometerStart !== undefined) {
        params.odometerStart = odometerStart;
    }
    if (odometerEnd !== undefined) {
        params.odometerEnd = odometerEnd;
    }

    if (!distance) {
        const recentServerValidatedWaypoints = recentWaypoints.filter((item) => !item.pendingAction);
        onyxData?.failureData?.push({
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.NVP_RECENT_WAYPOINTS}`,
            value: recentServerValidatedWaypoints,
        });
    }

    if (transactionBackup) {
        const transaction = allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];

        // We need to include all keys of the optimisticData's waypoints in the failureData for onyx merge to properly reset
        // waypoint keys that do not exist in the failureData's waypoints. For instance, if the optimisticData waypoints had
        // three keys and the failureData waypoint had only 2 keys then the third key that doesn't exist in the failureData
        // waypoints should be explicitly reset otherwise onyx merge will leave it intact.
        const allWaypointKeys = [...new Set([...Object.keys(transactionBackup.comment?.waypoints ?? {}), ...Object.keys(transaction?.comment?.waypoints ?? {})])];
        const onyxWaypoints = allWaypointKeys.reduce((acc: NullishDeep<WaypointCollection>, key) => {
            acc[key] = transactionBackup.comment?.waypoints?.[key] ? {...transactionBackup.comment?.waypoints?.[key]} : null;
            return acc;
        }, {});
        const allModifiedWaypointsKeys = [...new Set([...Object.keys(waypoints ?? {}), ...Object.keys(transaction?.modifiedWaypoints ?? {})])];
        const onyxModifiedWaypoints = allModifiedWaypointsKeys.reduce((acc: NullishDeep<WaypointCollection>, key) => {
            acc[key] = transactionBackup.modifiedWaypoints?.[key] ? {...transactionBackup.modifiedWaypoints?.[key]} : null;
            return acc;
        }, {});
        onyxData?.failureData?.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: {
                comment: {
                    waypoints: onyxWaypoints,
                    customUnit: {
                        quantity: transactionBackup?.comment?.customUnit?.quantity,
                    },
                },
                modifiedWaypoints: onyxModifiedWaypoints,
                routes: null,
            },
        });
    }

    API.write(WRITE_COMMANDS.UPDATE_MONEY_REQUEST_DISTANCE, params, onyxData);
}

/** Updates the category of an expense */
function updateMoneyRequestCategory({
    transactionID,
    transactionThreadReport,
    parentReport,
    category,
    policy,
    policyTagList,
    policyCategories,
    policyRecentlyUsedCategories,
    currentUserAccountIDParam,
    currentUserEmailParam,
    isASAPSubmitBetaEnabled,
    hash,
    parentReportNextStep,
}: {
    transactionID: string;
    transactionThreadReport: OnyxEntry<OnyxTypes.Report>;
    parentReport: OnyxEntry<OnyxTypes.Report>;
    category: string;
    policy: OnyxEntry<OnyxTypes.Policy>;
    policyTagList: OnyxEntry<OnyxTypes.PolicyTagLists>;
    policyCategories: OnyxEntry<OnyxTypes.PolicyCategories>;
    policyRecentlyUsedCategories: OnyxEntry<OnyxTypes.RecentlyUsedCategories>;
    currentUserAccountIDParam: number;
    currentUserEmailParam: string;
    isASAPSubmitBetaEnabled: boolean;
    hash?: number;
    parentReportNextStep: OnyxEntry<OnyxTypes.ReportNextStepDeprecated>;
}) {
    const transactionChanges: TransactionChanges = {
        category,
    };

    const {params, onyxData} = getUpdateMoneyRequestParams({
        transactionID,
        transactionThreadReport,
        iouReport: parentReport,
        transactionChanges,
        policy,
        policyTagList,
        policyCategories,
        policyRecentlyUsedCategories,
        currentUserAccountIDParam,
        currentUserEmailParam,
        isASAPSubmitBetaEnabled,
        hash,
        iouReportNextStep: parentReportNextStep,
    });
    API.write(WRITE_COMMANDS.UPDATE_MONEY_REQUEST_CATEGORY, params, onyxData);
}

/** Updates the description of an expense */
function updateMoneyRequestDescription({
    transactionID,
    transactionThreadReport,
    parentReport,
    comment,
    policy,
    policyTagList,
    policyCategories,
    currentUserAccountIDParam,
    currentUserEmailParam,
    isASAPSubmitBetaEnabled,
    parentReportNextStep,
}: {
    transactionID: string;
    transactionThreadReport: OnyxEntry<OnyxTypes.Report>;
    parentReport: OnyxEntry<OnyxTypes.Report>;
    comment: string;
    policy: OnyxEntry<OnyxTypes.Policy>;
    policyTagList: OnyxEntry<OnyxTypes.PolicyTagLists>;
    policyCategories: OnyxEntry<OnyxTypes.PolicyCategories>;
    currentUserAccountIDParam: number;
    currentUserEmailParam: string;
    isASAPSubmitBetaEnabled: boolean;
    parentReportNextStep: OnyxEntry<OnyxTypes.ReportNextStepDeprecated>;
}) {
    const parsedComment = getParsedComment(comment);
    const transactionChanges: TransactionChanges = {
        comment: parsedComment,
    };
    let data: UpdateMoneyRequestData;
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    if (isTrackExpenseReport(transactionThreadReport) && isSelfDM(parentReport)) {
        data = getUpdateTrackExpenseParams(transactionID, transactionThreadReport?.reportID, transactionChanges, policy);
    } else {
        data = getUpdateMoneyRequestParams({
            transactionID,
            transactionThreadReport,
            iouReport: parentReport,
            transactionChanges,
            policy,
            policyTagList,
            policyCategories,
            currentUserAccountIDParam,
            currentUserEmailParam,
            isASAPSubmitBetaEnabled,
            iouReportNextStep: parentReportNextStep,
        });
    }
    const {params, onyxData} = data;
    params.description = parsedComment;
    API.write(WRITE_COMMANDS.UPDATE_MONEY_REQUEST_DESCRIPTION, params, onyxData);
}

/** Updates the distance rate of an expense */
function updateMoneyRequestDistanceRate({
    transactionID,
    transactionThreadReport,
    parentReport,
    rateID,
    policy,
    policyTagList,
    policyCategories,
    currentUserAccountIDParam,
    currentUserEmailParam,
    isASAPSubmitBetaEnabled,
    updatedTaxAmount,
    updatedTaxCode,
    parentReportNextStep,
}: {
    transactionID: string;
    transactionThreadReport: OnyxEntry<OnyxTypes.Report>;
    parentReport: OnyxEntry<OnyxTypes.Report>;
    rateID: string;
    policy: OnyxEntry<OnyxTypes.Policy>;
    policyTagList: OnyxEntry<OnyxTypes.PolicyTagLists>;
    policyCategories: OnyxEntry<OnyxTypes.PolicyCategories>;
    currentUserAccountIDParam: number;
    currentUserEmailParam: string;
    isASAPSubmitBetaEnabled: boolean;
    updatedTaxAmount?: number;
    updatedTaxCode?: string;
    parentReportNextStep: OnyxEntry<OnyxTypes.ReportNextStepDeprecated>;
}) {
    const transactionChanges: TransactionChanges = {
        customUnitRateID: rateID,
        ...(typeof updatedTaxAmount === 'number' ? {taxAmount: updatedTaxAmount} : {}),
        ...(updatedTaxCode ? {taxCode: updatedTaxCode} : {}),
    };

    const transaction = allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
    if (transaction) {
        const existingDistanceUnit = transaction?.comment?.customUnit?.distanceUnit;
        const newDistanceUnit = DistanceRequestUtils.getRateByCustomUnitRateID({customUnitRateID: rateID, policy})?.unit;

        // If the distanceUnit is set and the rate is changed to one that has a different unit, mark the merchant as modified to make the distance field pending
        if (existingDistanceUnit && newDistanceUnit && newDistanceUnit !== existingDistanceUnit) {
            transactionChanges.merchant = getMerchant(transaction);
        }
    }

    let data: UpdateMoneyRequestData;
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    if (isTrackExpenseReport(transactionThreadReport) && isSelfDM(parentReport)) {
        data = getUpdateTrackExpenseParams(transactionID, transactionThreadReport?.reportID, transactionChanges, policy);
    } else {
        data = getUpdateMoneyRequestParams({
            transactionID,
            transactionThreadReport,
            iouReport: parentReport,
            transactionChanges,
            policy,
            policyTagList,
            policyCategories,
            currentUserAccountIDParam,
            currentUserEmailParam,
            isASAPSubmitBetaEnabled,
            iouReportNextStep: parentReportNextStep,
        });
    }
    const {params, onyxData} = data;
    // `taxAmount` & `taxCode` only needs to be updated in the optimistic data, so we need to remove them from the params
    const {taxAmount, taxCode, ...paramsWithoutTaxUpdated} = params;
    API.write(WRITE_COMMANDS.UPDATE_MONEY_REQUEST_DISTANCE_RATE, paramsWithoutTaxUpdated, onyxData);
}

const getConvertTrackedExpenseInformation = (
    transactionID: string | undefined,
    actionableWhisperReportActionID: string | undefined,
    moneyRequestReportID: string | undefined,
    linkedTrackedExpenseReportAction: OnyxTypes.ReportAction,
    linkedTrackedExpenseReportID: string,
    transactionThreadReportID: string | undefined,
    resolution: IOUAction,
    isLinkedTrackedExpenseReportArchived: boolean | undefined,
) => {
    const optimisticData: Array<
        OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION | typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS | typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>
    > = [];
    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.REPORT>> = [];
    const failureData: Array<
        OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION | typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS | typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>
    > = [];

    // Delete the transaction from the track expense report
    const {
        optimisticData: deleteOptimisticData,
        successData: deleteSuccessData,
        failureData: deleteFailureData,
    } = getDeleteTrackExpenseInformation(
        linkedTrackedExpenseReportID,
        transactionID,
        linkedTrackedExpenseReportAction,
        isLinkedTrackedExpenseReportArchived,
        false,
        true,
        actionableWhisperReportActionID,
        resolution,
        true,
    );

    optimisticData?.push(...deleteOptimisticData);
    successData?.push(...deleteSuccessData);
    failureData?.push(...deleteFailureData);

    // Build modified expense report action with the transaction changes
    const modifiedExpenseReportAction = buildOptimisticMovedTransactionAction(transactionThreadReportID, linkedTrackedExpenseReportID ?? CONST.REPORT.UNREPORTED_REPORT_ID);

    optimisticData?.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`,
        value: {
            [modifiedExpenseReportAction.reportActionID]: modifiedExpenseReportAction,
        },
    });
    successData?.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`,
        value: {
            [modifiedExpenseReportAction.reportActionID]: {pendingAction: null},
        },
    });
    failureData?.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`,
        value: {
            [modifiedExpenseReportAction.reportActionID]: {
                ...modifiedExpenseReportAction,
                errors: getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericEditFailureMessage'),
            },
        },
    });

    return {optimisticData, successData, failureData, modifiedExpenseReportActionID: modifiedExpenseReportAction.reportActionID};
};

type ConvertTrackedWorkspaceParams = {
    category: string | undefined;
    tag: string | undefined;
    taxCode: string;
    taxAmount: number;
    billable: boolean | undefined;
    policyID: string;
    receipt: Receipt | undefined;
    waypoints?: string;
    customUnitID?: string;
    customUnitRateID?: string;
    reimbursable?: boolean;
};

type AddTrackedExpenseToPolicyParam = {
    amount: number;
    currency: string;
    comment: string;
    created: string;
    merchant: string;
    transactionID: string;
    reimbursable: boolean;
    actionableWhisperReportActionID: string | undefined;
    moneyRequestReportID: string;
    reportPreviewReportActionID: string;
    modifiedExpenseReportActionID: string;
    moneyRequestCreatedReportActionID: string | undefined;
    moneyRequestPreviewReportActionID: string;
    distance: number | undefined;
    attendees: string | undefined;
} & ConvertTrackedWorkspaceParams;

type ConvertTrackedExpenseToRequestParams = {
    payerParams: {
        accountID: number;
        email: string;
    };
    transactionParams: {
        transactionID: string;
        actionableWhisperReportActionID: string | undefined;
        linkedTrackedExpenseReportAction: OnyxTypes.ReportAction;
        linkedTrackedExpenseReportID: string;
        amount: number;
        currency: string;
        comment: string;
        merchant: string;
        created: string;
        attendees?: Attendee[];
        transactionThreadReportID?: string;
        distance?: number;
        isLinkedTrackedExpenseReportArchived: boolean | undefined;
    };
    chatParams: {
        reportID: string;
        createdReportActionID: string | undefined;
        reportPreviewReportActionID: string;
    };
    iouParams: {
        reportID: string;
        createdReportActionID: string | undefined;
        reportActionID: string;
    };
    onyxData: OnyxData<OnyxKey>;
    workspaceParams?: ConvertTrackedWorkspaceParams;
};

function addTrackedExpenseToPolicy(parameters: AddTrackedExpenseToPolicyParam, onyxData: OnyxData<OnyxKey>) {
    API.write(WRITE_COMMANDS.ADD_TRACKED_EXPENSE_TO_POLICY, parameters, onyxData);
}

function convertTrackedExpenseToRequest(convertTrackedExpenseParams: ConvertTrackedExpenseToRequestParams) {
    const {payerParams, transactionParams, chatParams, iouParams, onyxData, workspaceParams} = convertTrackedExpenseParams;
    const {accountID: payerAccountID, email: payerEmail} = payerParams;
    const {
        transactionID,
        actionableWhisperReportActionID,
        linkedTrackedExpenseReportAction,
        linkedTrackedExpenseReportID,
        amount,
        distance,
        currency,
        comment,
        merchant,
        created,
        attendees,
        transactionThreadReportID,
        isLinkedTrackedExpenseReportArchived,
    } = transactionParams;
    const optimisticData: Array<OnyxUpdate<OnyxKey>> = [];
    const successData: Array<OnyxUpdate<OnyxKey>> = [];
    const failureData: Array<OnyxUpdate<OnyxKey>> = [];

    optimisticData?.push(...(onyxData.optimisticData ?? []));
    successData?.push(...(onyxData.successData ?? []));
    failureData?.push(...(onyxData.failureData ?? []));

    const convertTrackedExpenseInformation = getConvertTrackedExpenseInformation(
        transactionID,
        actionableWhisperReportActionID,
        iouParams.reportID,
        linkedTrackedExpenseReportAction,
        linkedTrackedExpenseReportID,
        transactionThreadReportID,
        CONST.IOU.ACTION.SUBMIT,
        isLinkedTrackedExpenseReportArchived,
    );
    optimisticData?.push(...(convertTrackedExpenseInformation.optimisticData ?? []));
    successData?.push(...(convertTrackedExpenseInformation.successData ?? []));
    failureData?.push(...(convertTrackedExpenseInformation.failureData ?? []));

    if (workspaceParams) {
        const params = {
            amount,
            distance,
            currency,
            comment,
            created,
            merchant,
            attendees: attendees ? JSON.stringify(attendees) : undefined,
            reimbursable: true,
            transactionID,
            actionableWhisperReportActionID,
            moneyRequestReportID: iouParams.reportID,
            moneyRequestCreatedReportActionID: iouParams.createdReportActionID,
            moneyRequestPreviewReportActionID: iouParams.reportActionID,
            modifiedExpenseReportActionID: convertTrackedExpenseInformation.modifiedExpenseReportActionID,
            reportPreviewReportActionID: chatParams.reportPreviewReportActionID,
            ...workspaceParams,
        };

        addTrackedExpenseToPolicy(params, {optimisticData, successData, failureData});
        return;
    }

    const parameters = {
        attendees,
        amount,
        distance,
        currency,
        comment,
        created,
        merchant,
        payerAccountID,
        payerEmail,
        chatReportID: chatParams.reportID,
        transactionID,
        actionableWhisperReportActionID,
        createdChatReportActionID: chatParams.createdReportActionID,
        moneyRequestReportID: iouParams.reportID,
        moneyRequestCreatedReportActionID: iouParams.createdReportActionID,
        moneyRequestPreviewReportActionID: iouParams.reportActionID,
        transactionThreadReportID,
        modifiedExpenseReportActionID: convertTrackedExpenseInformation.modifiedExpenseReportActionID,
        reportPreviewReportActionID: chatParams.reportPreviewReportActionID,
    };
    API.write(WRITE_COMMANDS.CONVERT_TRACKED_EXPENSE_TO_REQUEST, parameters, {optimisticData, successData, failureData});
}

/**
 * Move multiple tracked expenses from self-DM to an IOU report
 */
function convertBulkTrackedExpensesToIOU(
    transactionIDs: string[],
    targetReportID: string,
    isASAPSubmitBetaEnabled: boolean,
    currentUserAccountIDParam: number,
    currentUserEmailParam: string,
    transactionViolations: OnyxCollection<OnyxTypes.TransactionViolation[]>,
    policyRecentlyUsedCurrencies: string[],
    quickAction: OnyxEntry<OnyxTypes.QuickAction>,
) {
    const iouReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${targetReportID}`];

    if (!iouReport || !isMoneyRequestReportReportUtils(iouReport)) {
        Log.warn('[convertBulkTrackedExpensesToIOU] Invalid IOU report', {targetReportID});
        return;
    }

    const chatReportID = iouReport.chatReportID;
    if (!chatReportID) {
        Log.warn('[convertBulkTrackedExpensesToIOU] No chat report found for IOU', {targetReportID});
        return;
    }

    const chatReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`];
    if (!chatReport) {
        Log.warn('[convertBulkTrackedExpensesToIOU] Chat report not found', {chatReportID});
        return;
    }

    const participantAccountIDs = getReportRecipientAccountIDs(iouReport, userAccountID);
    const payerAccountID = participantAccountIDs.at(0);

    if (!payerAccountID) {
        Log.warn('[convertBulkTrackedExpensesToIOU] No payer found', {targetReportID, participantAccountIDs});
        return;
    }

    const payerEmail = personalDetailsList?.[payerAccountID]?.login ?? '';
    const selfDMReportID = findSelfDMReportID();

    if (!selfDMReportID) {
        Log.warn('[convertBulkTrackedExpensesToIOU] Self DM not found');
        return;
    }

    const selfDMReportActions = getAllReportActions(selfDMReportID);

    for (const transactionID of transactionIDs) {
        const transaction = allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
        if (!transaction) {
            Log.warn('[convertBulkTrackedExpensesToIOU] Transaction not found', {transactionID});
            continue;
        }

        const linkedTrackedExpenseReportAction = Object.values(selfDMReportActions).find((action) => {
            if (!isMoneyRequestAction(action)) {
                return false;
            }
            const originalMessage = getOriginalMessage(action);
            return originalMessage?.IOUTransactionID === transactionID;
        });

        if (!linkedTrackedExpenseReportAction) {
            Log.warn('[convertBulkTrackedExpensesToIOU] Tracked expense IOU action not found', {transactionID});
            continue;
        }

        const actionableWhisperReportActionID = getTrackExpenseActionableWhisper(transactionID, selfDMReportID)?.reportActionID;

        const commentText = typeof transaction.comment === 'string' ? transaction.comment : (transaction.comment?.comment ?? '');
        const parsedComment = getParsedComment(Parser.htmlToMarkdown(commentText));

        const attendees = transaction.comment?.attendees;

        const transactionThreadReportID = (linkedTrackedExpenseReportAction as OnyxTypes.ReportAction).childReportID;

        if (!transactionThreadReportID) {
            Log.warn('[convertBulkTrackedExpensesToIOU] No transaction thread found for tracked expense, skipping', {
                transactionID,
                actionReportActionID: (linkedTrackedExpenseReportAction as OnyxTypes.ReportAction).reportActionID,
            });
            continue;
        }

        const participantParams = {
            payeeAccountID: userAccountID,
            payeeEmail: currentUserEmail,
            participant: {
                accountID: payerAccountID,
                login: payerEmail,
            },
        };

        const transactionParams = {
            amount: getAmount(transaction),
            currency: getCurrency(transaction),
            comment: parsedComment,
            merchant: getMerchant(transaction),
            created: transaction.created,
            attendees,
            actionableWhisperReportActionID,
            linkedTrackedExpenseReportAction,
            linkedTrackedExpenseReportID: selfDMReportID,
            isLinkedTrackedExpenseReportArchived: false,
        };

        const {
            payerAccountID: moneyRequestPayerAccountID,
            payerEmail: moneyRequestPayerEmail,
            iouReport: moneyRequestIOUReport,
            chatReport: moneyRequestChatReport,
            transaction: moneyRequestTransaction,
            iouAction,
            createdChatReportActionID,
            createdIOUReportActionID,
            reportPreviewAction,
            transactionThreadReportID: moneyRequestTransactionThreadReportID,
            onyxData,
        } = getMoneyRequestInformation({
            parentChatReport: chatReport,
            participantParams,
            transactionParams,
            moneyRequestReportID: targetReportID,
            existingTransactionID: transactionID,
            existingTransaction: transaction,
            isASAPSubmitBetaEnabled,
            currentUserAccountIDParam,
            currentUserEmailParam,
            transactionViolations,
            quickAction,
            policyRecentlyUsedCurrencies,
        });

        const convertParams: ConvertTrackedExpenseToRequestParams = {
            payerParams: {
                accountID: moneyRequestPayerAccountID,
                email: moneyRequestPayerEmail,
            },
            transactionParams: {
                amount: getAmount(transaction),
                currency: getCurrency(transaction),
                comment: parsedComment,
                merchant: getMerchant(transaction),
                created: transaction.created,
                attendees,
                transactionID: moneyRequestTransaction.transactionID,
                actionableWhisperReportActionID,
                linkedTrackedExpenseReportAction,
                linkedTrackedExpenseReportID: selfDMReportID,
                transactionThreadReportID: moneyRequestTransactionThreadReportID,
                isLinkedTrackedExpenseReportArchived: false,
            },
            chatParams: {
                reportID: moneyRequestChatReport.reportID,
                createdReportActionID: createdChatReportActionID,
                reportPreviewReportActionID: reportPreviewAction.reportActionID,
            },
            iouParams: {
                reportID: moneyRequestIOUReport.reportID,
                createdReportActionID: createdIOUReportActionID,
                reportActionID: iouAction.reportActionID,
            },
            onyxData,
        };

        convertTrackedExpenseToRequest(convertParams);
    }
}

function categorizeTrackedExpense(trackedExpenseParams: TrackedExpenseParams) {
    const {onyxData, reportInformation, transactionParams, policyParams, createdWorkspaceParams} = trackedExpenseParams;
    const {optimisticData, successData, failureData} = onyxData ?? {};
    const {transactionID} = transactionParams;
    const {isDraftPolicy} = policyParams;
    const {
        actionableWhisperReportActionID,
        moneyRequestReportID,
        linkedTrackedExpenseReportAction,
        linkedTrackedExpenseReportID,
        transactionThreadReportID,
        isLinkedTrackedExpenseReportArchived,
    } = reportInformation;
    const {
        optimisticData: moveTransactionOptimisticData,
        successData: moveTransactionSuccessData,
        failureData: moveTransactionFailureData,
        modifiedExpenseReportActionID,
    } = getConvertTrackedExpenseInformation(
        transactionID,
        actionableWhisperReportActionID,
        moneyRequestReportID,
        linkedTrackedExpenseReportAction,
        linkedTrackedExpenseReportID,
        transactionThreadReportID,
        CONST.IOU.ACTION.CATEGORIZE,
        isLinkedTrackedExpenseReportArchived,
    );

    optimisticData?.push(...moveTransactionOptimisticData);
    successData?.push(...moveTransactionSuccessData);
    failureData?.push(...moveTransactionFailureData);

    const parameters: CategorizeTrackedExpenseApiParams = {
        ...{
            ...reportInformation,
            linkedTrackedExpenseReportAction: undefined,
        },
        ...policyParams,
        ...transactionParams,
        modifiedExpenseReportActionID,
        policyExpenseChatReportID: createdWorkspaceParams?.expenseChatReportID,
        policyExpenseCreatedReportActionID: createdWorkspaceParams?.expenseCreatedReportActionID,
        adminsChatReportID: createdWorkspaceParams?.adminsChatReportID,
        adminsCreatedReportActionID: createdWorkspaceParams?.adminsCreatedReportActionID,
        engagementChoice: createdWorkspaceParams?.engagementChoice,
        guidedSetupData: createdWorkspaceParams?.guidedSetupData,
        description: transactionParams.comment,
        customUnitID: createdWorkspaceParams?.customUnitID,
        customUnitRateID: createdWorkspaceParams?.customUnitRateID ?? transactionParams.customUnitRateID,
        attendees: transactionParams.attendees ? JSON.stringify(transactionParams.attendees) : undefined,
    };

    API.write(WRITE_COMMANDS.CATEGORIZE_TRACKED_EXPENSE, parameters, {optimisticData, successData, failureData});

    // If a draft policy was used, then the CategorizeTrackedExpense command will create a real one
    // so let's track that conversion here
    if (isDraftPolicy) {
        GoogleTagManager.publishEvent(CONST.ANALYTICS.EVENT.WORKSPACE_CREATED, userAccountID);
    }
}

function shareTrackedExpense(trackedExpenseParams: TrackedExpenseParams) {
    const {onyxData, reportInformation, transactionParams, policyParams, createdWorkspaceParams, accountantParams} = trackedExpenseParams;

    const policyID = policyParams?.policyID;
    const chatReportID = reportInformation?.chatReportID;
    const accountantEmail = addSMSDomainIfPhoneNumber(accountantParams?.accountant?.login);
    const accountantAccountID = accountantParams?.accountant?.accountID;

    if (!policyID || !chatReportID || !accountantEmail || !accountantAccountID) {
        return;
    }

    const optimisticData: Array<OnyxUpdate<OnyxKey>> = [];
    const successData: Array<OnyxUpdate<OnyxKey>> = [];
    const failureData: Array<OnyxUpdate<OnyxKey>> = [];

    const {optimisticData: shareTrackedExpenseOptimisticData = [], successData: shareTrackedExpenseSuccessData = [], failureData: shareTrackedExpenseFailureData = []} = onyxData ?? {};

    optimisticData?.push(...shareTrackedExpenseOptimisticData);
    successData?.push(...shareTrackedExpenseSuccessData);
    failureData?.push(...shareTrackedExpenseFailureData);

    const {transactionID} = transactionParams;
    const {
        actionableWhisperReportActionID,
        moneyRequestPreviewReportActionID,
        moneyRequestCreatedReportActionID,
        reportPreviewReportActionID,
        moneyRequestReportID,
        linkedTrackedExpenseReportAction,
        linkedTrackedExpenseReportID,
        transactionThreadReportID,
        isLinkedTrackedExpenseReportArchived,
    } = reportInformation;

    const convertTrackedExpenseInformation = getConvertTrackedExpenseInformation(
        transactionID,
        actionableWhisperReportActionID,
        moneyRequestReportID,
        linkedTrackedExpenseReportAction,
        linkedTrackedExpenseReportID,
        transactionThreadReportID,
        CONST.IOU.ACTION.SHARE,
        isLinkedTrackedExpenseReportArchived,
    );

    optimisticData?.push(...(convertTrackedExpenseInformation.optimisticData ?? []));
    successData?.push(...(convertTrackedExpenseInformation.successData ?? []));
    failureData?.push(...(convertTrackedExpenseInformation.failureData ?? []));

    const policyEmployeeList = policyParams?.policy?.employeeList;
    if (!policyEmployeeList?.[accountantEmail]) {
        const policyMemberAccountIDs = Object.values(getMemberAccountIDsForWorkspace(policyEmployeeList, false, false));
        const {
            optimisticData: addAccountantToWorkspaceOptimisticData,
            successData: addAccountantToWorkspaceSuccessData,
            failureData: addAccountantToWorkspaceFailureData,
        } = buildAddMembersToWorkspaceOnyxData({[accountantEmail]: accountantAccountID}, policyID, policyMemberAccountIDs, CONST.POLICY.ROLE.ADMIN, formatPhoneNumber);
        optimisticData?.push(...addAccountantToWorkspaceOptimisticData);
        successData?.push(...addAccountantToWorkspaceSuccessData);
        failureData?.push(...addAccountantToWorkspaceFailureData);
    } else if (policyEmployeeList?.[accountantEmail].role !== CONST.POLICY.ROLE.ADMIN) {
        const {
            optimisticData: addAccountantToWorkspaceOptimisticData,
            successData: addAccountantToWorkspaceSuccessData,
            failureData: addAccountantToWorkspaceFailureData,
        } = buildUpdateWorkspaceMembersRoleOnyxData(policyID, [accountantEmail], [accountantAccountID], CONST.POLICY.ROLE.ADMIN);
        optimisticData?.push(...addAccountantToWorkspaceOptimisticData);
        successData?.push(...addAccountantToWorkspaceSuccessData);
        failureData?.push(...addAccountantToWorkspaceFailureData);
    }

    const chatReportParticipants = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`]?.participants;
    if (!chatReportParticipants?.[accountantAccountID]) {
        const {
            optimisticData: inviteAccountantToRoomOptimisticData,
            successData: inviteAccountantToRoomSuccessData,
            failureData: inviteAccountantToRoomFailureData,
        } = buildInviteToRoomOnyxData(chatReportID, {[accountantEmail]: accountantAccountID}, formatPhoneNumber);
        optimisticData?.push(...inviteAccountantToRoomOptimisticData);
        successData?.push(...inviteAccountantToRoomSuccessData);
        failureData?.push(...inviteAccountantToRoomFailureData);
    }

    const parameters: ShareTrackedExpenseParams = {
        ...transactionParams,
        policyID,
        moneyRequestPreviewReportActionID,
        moneyRequestReportID,
        moneyRequestCreatedReportActionID,
        actionableWhisperReportActionID,
        modifiedExpenseReportActionID: convertTrackedExpenseInformation.modifiedExpenseReportActionID,
        reportPreviewReportActionID,
        policyExpenseChatReportID: createdWorkspaceParams?.expenseChatReportID,
        policyExpenseCreatedReportActionID: createdWorkspaceParams?.expenseCreatedReportActionID,
        adminsChatReportID: createdWorkspaceParams?.adminsChatReportID,
        adminsCreatedReportActionID: createdWorkspaceParams?.adminsCreatedReportActionID,
        engagementChoice: createdWorkspaceParams?.engagementChoice,
        guidedSetupData: createdWorkspaceParams?.guidedSetupData,
        policyName: createdWorkspaceParams?.policyName,
        description: transactionParams.comment,
        customUnitID: createdWorkspaceParams?.customUnitID,
        customUnitRateID: createdWorkspaceParams?.customUnitRateID ?? transactionParams.customUnitRateID,
        attendees: transactionParams.attendees ? JSON.stringify(transactionParams.attendees) : undefined,
        accountantEmail,
    };

    API.write(WRITE_COMMANDS.SHARE_TRACKED_EXPENSE, parameters, {optimisticData, successData, failureData});
}

/**
 * Submit expense to another user
 */
function requestMoney(requestMoneyInformation: RequestMoneyInformation): {iouReport?: OnyxTypes.Report} {
    const {
        report,
        existingIOUReport,
        participantParams,
        policyParams = {},
        transactionParams,
        gpsPoint,
        action,
        shouldHandleNavigation = true,
        backToReport,
        shouldPlaySound = true,
        optimisticChatReportID,
        optimisticCreatedReportActionID,
        optimisticIOUReportID,
        optimisticReportPreviewActionID,
        shouldGenerateTransactionThreadReport,
        isASAPSubmitBetaEnabled,
        currentUserAccountIDParam,
        currentUserEmailParam,
        transactionViolations,
        quickAction,
        policyRecentlyUsedCurrencies,
    } = requestMoneyInformation;
    const {payeeAccountID} = participantParams;
    const parsedComment = getParsedComment(transactionParams.comment ?? '');
    transactionParams.comment = parsedComment;
    const {
        amount,
        distance,
        currency,
        merchant,
        comment = '',
        receipt,
        category,
        tag,
        taxCode = '',
        taxAmount = 0,
        billable,
        reimbursable,
        created,
        attendees,
        actionableWhisperReportActionID,
        linkedTrackedExpenseReportAction,
        linkedTrackedExpenseReportID,
        waypoints,
        customUnitRateID,
        isTestDrive,
        isLinkedTrackedExpenseReportArchived,
        type: transactionType,
        count,
        rate,
        unit,
    } = transactionParams;

    const testDriveCommentReportActionID = isTestDrive ? NumberUtils.rand64() : undefined;

    const sanitizedWaypoints = waypoints ? JSON.stringify(sanitizeRecentWaypoints(waypoints)) : undefined;

    // If the report is iou or expense report, we should get the linked chat report to be passed to the getMoneyRequestInformation function
    const isMoneyRequestReport = isMoneyRequestReportReportUtils(report);
    const currentChatReport = isMoneyRequestReport ? getReportOrDraftReport(report?.chatReportID) : report;
    const moneyRequestReportID = isMoneyRequestReport ? report?.reportID : '';
    const isMovingTransactionFromTrackExpense = isMovingTransactionFromTrackExpenseIOUUtils(action);
    const existingTransactionID =
        isMovingTransactionFromTrackExpense && linkedTrackedExpenseReportAction && isMoneyRequestAction(linkedTrackedExpenseReportAction)
            ? getOriginalMessage(linkedTrackedExpenseReportAction)?.IOUTransactionID
            : undefined;
    const existingTransaction =
        action === CONST.IOU.ACTION.SUBMIT
            ? allTransactionDrafts[`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${existingTransactionID}`]
            : allTransactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${existingTransactionID}`];

    const retryParams = {
        ...requestMoneyInformation,
        participantParams: {
            ...requestMoneyInformation.participantParams,
            participant: (({icons, ...rest}) => rest)(requestMoneyInformation.participantParams.participant),
        },
        transactionParams: {
            ...requestMoneyInformation.transactionParams,
            receipt: undefined,
        },
    };

    const {
        payerAccountID,
        payerEmail,
        iouReport,
        chatReport,
        transaction,
        iouAction,
        createdChatReportActionID,
        createdIOUReportActionID,
        reportPreviewAction,
        transactionThreadReportID,
        createdReportActionIDForThread,
        onyxData,
    } = getMoneyRequestInformation({
        parentChatReport: isMovingTransactionFromTrackExpense ? undefined : currentChatReport,
        existingIOUReport,
        participantParams,
        policyParams,
        transactionParams,
        moneyRequestReportID,
        existingTransactionID,
        existingTransaction: isDistanceRequestTransactionUtils(existingTransaction) ? existingTransaction : undefined,
        retryParams,
        testDriveCommentReportActionID,
        optimisticChatReportID,
        optimisticCreatedReportActionID,
        optimisticIOUReportID,
        optimisticReportPreviewActionID,
        shouldGenerateTransactionThreadReport,
        action,
        isASAPSubmitBetaEnabled,
        currentUserAccountIDParam,
        currentUserEmailParam,
        transactionViolations,
        quickAction,
        policyRecentlyUsedCurrencies,
    });
    const activeReportID = isMoneyRequestReport ? report?.reportID : chatReport.reportID;

    if (shouldPlaySound) {
        playSound(SOUNDS.DONE);
    }

    switch (action) {
        case CONST.IOU.ACTION.SUBMIT: {
            if (!linkedTrackedExpenseReportAction || !linkedTrackedExpenseReportID) {
                return {};
            }
            const customUnitParams = isDistanceRequestTransactionUtils(transaction)
                ? {
                      customUnitID: getDistanceRateCustomUnit(policyParams?.policy)?.customUnitID,
                      customUnitRateID,
                  }
                : {};
            const workspaceParams =
                isPolicyExpenseChatReportUtil(chatReport) && chatReport.policyID
                    ? {
                          receipt: isFileUploadable(receipt) ? receipt : undefined,
                          category,
                          tag,
                          taxCode,
                          taxAmount: Math.abs(taxAmount),
                          billable,
                          policyID: chatReport.policyID,
                          waypoints: sanitizedWaypoints,
                          reimbursable,
                          ...customUnitParams,
                      }
                    : undefined;
            convertTrackedExpenseToRequest({
                payerParams: {
                    accountID: payerAccountID,
                    email: payerEmail,
                },
                transactionParams: {
                    amount,
                    distance,
                    currency,
                    comment,
                    merchant,
                    created,
                    attendees,
                    transactionID: transaction.transactionID,
                    actionableWhisperReportActionID,
                    linkedTrackedExpenseReportAction,
                    linkedTrackedExpenseReportID,
                    transactionThreadReportID,
                    isLinkedTrackedExpenseReportArchived,
                },
                chatParams: {
                    reportID: chatReport.reportID,
                    createdReportActionID: createdChatReportActionID,
                    reportPreviewReportActionID: reportPreviewAction.reportActionID,
                },
                iouParams: {
                    reportID: iouReport.reportID,
                    createdReportActionID: createdIOUReportActionID,
                    reportActionID: iouAction.reportActionID,
                },
                onyxData,
                workspaceParams,
            });
            break;
        }
        default: {
            // This is only required when inviting admins to test drive the app
            const guidedSetupData: GuidedSetupData | undefined = isTestDrive
                ? prepareOnboardingOnyxData({
                      introSelected: {choice: CONST.ONBOARDING_CHOICES.TEST_DRIVE_RECEIVER},
                      engagementChoice: CONST.ONBOARDING_CHOICES.TEST_DRIVE_RECEIVER,
                      onboardingMessage: getOnboardingMessages().onboardingMessages[CONST.ONBOARDING_CHOICES.TEST_DRIVE_RECEIVER],
                      companySize: undefined,
                  })?.guidedSetupData
                : undefined;

            const parameters: RequestMoneyParams = {
                debtorEmail: payerEmail,
                debtorAccountID: payerAccountID,
                amount,
                currency,
                comment,
                created,
                merchant,
                iouReportID: iouReport.reportID,
                chatReportID: chatReport.reportID,
                transactionID: transaction.transactionID,
                reportActionID: iouAction.reportActionID,
                createdChatReportActionID,
                createdIOUReportActionID,
                reportPreviewReportActionID: reportPreviewAction.reportActionID,
                receipt: isFileUploadable(receipt) ? receipt : undefined,
                receiptState: receipt?.state,
                category,
                tag,
                taxCode,
                taxAmount,
                billable,
                // This needs to be a string of JSON because of limitations with the fetch() API and nested objects
                receiptGpsPoints: gpsPoint ? JSON.stringify(gpsPoint) : undefined,
                transactionThreadReportID,
                createdReportActionIDForThread,
                reimbursable,
                description: parsedComment,
                attendees: attendees ? JSON.stringify(attendees) : undefined,
                isTestDrive,
                guidedSetupData: guidedSetupData ? JSON.stringify(guidedSetupData) : undefined,
                testDriveCommentReportActionID,
                ...(transactionType === CONST.TRANSACTION.TYPE.TIME
                    ? {
                          type: transactionType,
                          count,
                          rate,
                          unit,
                      }
                    : {}),
            };
            // eslint-disable-next-line rulesdir/no-multiple-api-calls
            API.write(WRITE_COMMANDS.REQUEST_MONEY, parameters, onyxData);
        }
    }

    if (shouldHandleNavigation) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        InteractionManager.runAfterInteractions(() => removeDraftTransactions());
        if (!requestMoneyInformation.isRetry) {
            dismissModalAndOpenReportInInboxTab(backToReport ?? activeReportID);
        }

        const trackReport = Navigation.getReportRouteByID(linkedTrackedExpenseReportAction?.childReportID);
        if (trackReport?.key) {
            Navigation.removeScreenByKey(trackReport.key);
        }
    }

    if (activeReportID && !isMoneyRequestReport) {
        Navigation.setNavigationActionToMicrotaskQueue(() =>
            setTimeout(() => {
                notifyNewAction(activeReportID, payeeAccountID, reportPreviewAction);
            }, CONST.TIMING.NOTIFY_NEW_ACTION_DELAY),
        );
    }

    return {iouReport};
}

/**
 * Submit per diem expense to another user
 */
function submitPerDiemExpense(submitPerDiemExpenseInformation: PerDiemExpenseInformation) {
    const {
        report,
        participantParams,
        policyParams = {},
        recentlyUsedParams = {},
        transactionParams,
        isASAPSubmitBetaEnabled,
        currentUserAccountIDParam,
        currentUserEmailParam,
        hasViolations,
        quickAction,
        policyRecentlyUsedCurrencies,
    } = submitPerDiemExpenseInformation;
    const {payeeAccountID} = participantParams;
    const {currency, comment = '', category, tag, created, customUnit, attendees} = transactionParams;

    if (
        isEmptyObject(policyParams.policy) ||
        isEmptyObject(customUnit) ||
        !customUnit.customUnitID ||
        !customUnit.customUnitRateID ||
        (customUnit.subRates ?? []).length === 0 ||
        isEmptyObject(customUnit.attributes)
    ) {
        return;
    }

    // If the report is iou or expense report, we should get the linked chat report to be passed to the getMoneyRequestInformation function
    const isMoneyRequestReport = isMoneyRequestReportReportUtils(report);
    const currentChatReport = isMoneyRequestReport ? getReportOrDraftReport(report?.chatReportID) : report;
    const moneyRequestReportID = isMoneyRequestReport ? report?.reportID : '';

    const {
        iouReport,
        chatReport,
        transaction,
        iouAction,
        createdChatReportActionID,
        createdIOUReportActionID,
        reportPreviewAction,
        transactionThreadReportID,
        createdReportActionIDForThread,
        onyxData,
        billable,
        reimbursable,
    } = getPerDiemExpenseInformation({
        parentChatReport: currentChatReport,
        participantParams,
        policyParams,
        recentlyUsedParams,
        transactionParams,
        moneyRequestReportID,
        isASAPSubmitBetaEnabled,
        currentUserAccountIDParam,
        currentUserEmailParam,
        hasViolations,
        quickAction,
        policyRecentlyUsedCurrencies,
    });
    const activeReportID = isMoneyRequestReport && Navigation.getTopmostReportId() === report?.reportID ? report?.reportID : chatReport.reportID;

    const customUnitRate = getPerDiemRateCustomUnitRate(policyParams.policy, customUnit.customUnitRateID);

    const customUnitRateParam = {
        id: customUnitRate?.customUnitRateID,
        name: customUnitRate?.name,
    };

    const parameters: CreatePerDiemRequestParams = {
        policyID: policyParams.policy.id,
        customUnitID: customUnit.customUnitID,
        customUnitRateID: customUnit.customUnitRateID,
        customUnitRate: JSON.stringify(customUnitRateParam),
        subRates: JSON.stringify(customUnit.subRates),
        startDateTime: customUnit.attributes.dates.start,
        endDateTime: customUnit.attributes.dates.end,
        currency,
        description: comment,
        created,
        iouReportID: iouReport.reportID,
        chatReportID: chatReport.reportID,
        transactionID: transaction.transactionID,
        reportActionID: iouAction.reportActionID,
        createdChatReportActionID,
        createdIOUReportActionID,
        reportPreviewReportActionID: reportPreviewAction.reportActionID,
        category,
        tag,
        transactionThreadReportID,
        createdReportActionIDForThread,
        billable,
        reimbursable,
        attendees: attendees ? JSON.stringify(attendees) : undefined,
    };

    playSound(SOUNDS.DONE);
    API.write(WRITE_COMMANDS.CREATE_PER_DIEM_REQUEST, parameters, onyxData);

    // eslint-disable-next-line @typescript-eslint/no-deprecated
    InteractionManager.runAfterInteractions(() => removeDraftTransaction(CONST.IOU.OPTIMISTIC_TRANSACTION_ID));
    dismissModalAndOpenReportInInboxTab(activeReportID);

    if (activeReportID) {
        notifyNewAction(activeReportID, payeeAccountID);
    }
}

/**
 * Track an expense
 */
function trackExpense(params: CreateTrackExpenseParams) {
    const {
        report,
        action,
        isDraftPolicy,
        participantParams,
        policyParams: policyData = {},
        transactionParams: transactionData,
        accountantParams,
        shouldHandleNavigation = true,
        shouldPlaySound = true,
        isASAPSubmitBetaEnabled,
        currentUserAccountIDParam,
        currentUserEmailParam,
        introSelected,
        activePolicyID,
        quickAction,
    } = params;
    const {participant, payeeAccountID, payeeEmail} = participantParams;
    const {policy, policyCategories, policyTagList} = policyData;
    const parsedComment = getParsedComment(transactionData.comment ?? '');
    transactionData.comment = parsedComment;
    const {
        amount,
        currency,
        created = '',
        merchant = '',
        comment = '',
        distance,
        receipt,
        category,
        tag,
        taxCode = '',
        taxAmount = 0,
        billable,
        reimbursable,
        gpsPoint,
        validWaypoints,
        actionableWhisperReportActionID,
        linkedTrackedExpenseReportAction,
        linkedTrackedExpenseReportID,
        customUnitRateID,
        attendees,
        odometerStart,
        odometerEnd,
    } = transactionData;
    const isMoneyRequestReport = isMoneyRequestReportReportUtils(report);
    const currentChatReport = isMoneyRequestReport ? getReportOrDraftReport(report?.chatReportID) : report;
    const moneyRequestReportID = isMoneyRequestReport ? report?.reportID : '';
    const isMovingTransactionFromTrackExpense = isMovingTransactionFromTrackExpenseIOUUtils(action);

    // Pass an open receipt so the distance expense will show a map with the route optimistically
    const trackedReceipt = validWaypoints ? {source: ReceiptGeneric as ReceiptSource, state: CONST.IOU.RECEIPT_STATE.OPEN, name: 'receipt-generic.png'} : receipt;
    const sanitizedWaypoints = validWaypoints ? JSON.stringify(sanitizeRecentWaypoints(validWaypoints)) : undefined;

    const retryParams: CreateTrackExpenseParams = {
        ...params,
        report,
        isDraftPolicy,
        action,
        participantParams: {
            participant,
            payeeAccountID,
            payeeEmail,
        },
        transactionParams: {
            amount,
            currency,
            created,
            merchant,
            comment,
            distance,
            receipt: undefined,
            category,
            tag,
            taxCode,
            taxAmount,
            billable,
            reimbursable,
            validWaypoints,
            gpsPoint,
            actionableWhisperReportActionID,
            linkedTrackedExpenseReportAction,
            linkedTrackedExpenseReportID,
            customUnitRateID,
        },
        quickAction,
    };

    const {
        createdWorkspaceParams,
        iouReport,
        chatReport,
        transaction,
        iouAction,
        createdChatReportActionID,
        createdIOUReportActionID,
        reportPreviewAction,
        transactionThreadReportID,
        createdReportActionIDForThread,
        actionableWhisperReportActionIDParam,
        optimisticReportID,
        optimisticReportActionID,
        onyxData,
    } =
        getTrackExpenseInformation({
            parentChatReport: currentChatReport,
            moneyRequestReportID,
            existingTransactionID:
                isMovingTransactionFromTrackExpense && linkedTrackedExpenseReportAction && isMoneyRequestAction(linkedTrackedExpenseReportAction)
                    ? getOriginalMessage(linkedTrackedExpenseReportAction)?.IOUTransactionID
                    : undefined,
            participantParams: {
                participant,
                payeeAccountID,
                payeeEmail,
            },
            transactionParams: {
                comment,
                amount,
                distance,
                currency,
                created,
                merchant,
                receipt: trackedReceipt,
                category,
                tag,
                taxCode,
                taxAmount,
                billable,
                reimbursable,
                linkedTrackedExpenseReportAction,
                attendees,
                odometerStart,
                odometerEnd,
            },
            policyParams: {
                policy,
                policyCategories,
                policyTagList,
            },
            retryParams,
            isASAPSubmitBetaEnabled,
            currentUserAccountIDParam,
            currentUserEmailParam,
            introSelected,
            activePolicyID,
            quickAction,
        }) ?? {};
    const activeReportID = isMoneyRequestReport ? report?.reportID : chatReport?.reportID;

    const recentServerValidatedWaypoints = recentWaypoints.filter((item) => !item.pendingAction);
    onyxData?.failureData?.push({
        onyxMethod: Onyx.METHOD.SET,
        key: `${ONYXKEYS.NVP_RECENT_WAYPOINTS}`,
        value: recentServerValidatedWaypoints,
    });

    const isDistanceRequest = isMapDistanceRequest(transaction) || isManualDistanceRequestTransactionUtils(transaction) || isOdometerDistanceRequestTransactionUtils(transaction);

    if (isDistanceRequest) {
        // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
        onyxData?.optimisticData?.push({
            onyxMethod: Onyx.METHOD.SET,
            key: ONYXKEYS.NVP_LAST_DISTANCE_EXPENSE_TYPE,
            value: transaction?.iouRequestType,
        });
    }

    const mileageRate = isCustomUnitRateIDForP2P(transaction) ? undefined : customUnitRateID;
    if (shouldPlaySound) {
        playSound(SOUNDS.DONE);
    }

    switch (action) {
        case CONST.IOU.ACTION.CATEGORIZE: {
            if (!linkedTrackedExpenseReportAction || !linkedTrackedExpenseReportID) {
                return;
            }
            const transactionParams: TrackedExpenseTransactionParams = {
                transactionID: transaction?.transactionID,
                amount,
                currency,
                comment,
                distance,
                merchant,
                created,
                taxCode,
                taxAmount,
                category,
                tag,
                billable,
                reimbursable,
                receipt: isFileUploadable(trackedReceipt) ? trackedReceipt : undefined,
                waypoints: sanitizedWaypoints,
                customUnitRateID: mileageRate,
                attendees,
            };
            const policyParams: TrackedExpensePolicyParams = {
                policyID: chatReport?.policyID,
                policy,
                isDraftPolicy,
            };
            const reportInformation: TrackedExpenseReportInformation = {
                moneyRequestPreviewReportActionID: iouAction?.reportActionID,
                moneyRequestReportID: iouReport?.reportID,
                moneyRequestCreatedReportActionID: createdIOUReportActionID,
                actionableWhisperReportActionID,
                linkedTrackedExpenseReportAction,
                linkedTrackedExpenseReportID,
                transactionThreadReportID,
                reportPreviewReportActionID: reportPreviewAction?.reportActionID,
                chatReportID: chatReport?.reportID,
                isLinkedTrackedExpenseReportArchived: transactionData.isLinkedTrackedExpenseReportArchived,
            };
            const trackedExpenseParams: TrackedExpenseParams = {
                onyxData,
                reportInformation,
                transactionParams,
                policyParams,
                createdWorkspaceParams,
            };

            categorizeTrackedExpense(trackedExpenseParams);
            break;
        }
        case CONST.IOU.ACTION.SHARE: {
            if (!linkedTrackedExpenseReportAction || !linkedTrackedExpenseReportID) {
                return;
            }
            const transactionParams: TrackedExpenseTransactionParams = {
                transactionID: transaction?.transactionID,
                amount,
                currency,
                comment,
                distance,
                merchant,
                created,
                taxCode: taxCode ?? '',
                taxAmount: taxAmount ?? 0,
                category,
                tag,
                billable,
                reimbursable,
                receipt: isFileUploadable(trackedReceipt) ? trackedReceipt : undefined,
                waypoints: sanitizedWaypoints,
                customUnitRateID: mileageRate,
                attendees,
            };
            const policyParams: TrackedExpensePolicyParams = {
                policyID: chatReport?.policyID,
                policy,
            };
            const reportInformation: TrackedExpenseReportInformation = {
                moneyRequestPreviewReportActionID: iouAction?.reportActionID,
                moneyRequestReportID: iouReport?.reportID,
                moneyRequestCreatedReportActionID: createdIOUReportActionID,
                actionableWhisperReportActionID,
                linkedTrackedExpenseReportAction,
                linkedTrackedExpenseReportID,
                transactionThreadReportID,
                reportPreviewReportActionID: reportPreviewAction?.reportActionID,
                chatReportID: chatReport?.reportID,
                isLinkedTrackedExpenseReportArchived: transactionData.isLinkedTrackedExpenseReportArchived,
            };
            const trackedExpenseParams: TrackedExpenseParams = {
                onyxData,
                reportInformation,
                transactionParams,
                policyParams,
                createdWorkspaceParams,
                accountantParams,
            };
            shareTrackedExpense(trackedExpenseParams);
            break;
        }
        default: {
            const parameters: TrackExpenseParams = {
                amount,
                attendees: attendees ? JSON.stringify(attendees) : undefined,
                currency,
                comment,
                distance,
                created,
                merchant,
                iouReportID: iouReport?.reportID,
                // If we are passing an optimisticReportID then we are creating a new chat (selfDM) and we don't have an *existing* chatReportID
                chatReportID: optimisticReportID ? undefined : chatReport?.reportID,
                transactionID: transaction?.transactionID,
                reportActionID: iouAction?.reportActionID,
                createdChatReportActionID,
                createdIOUReportActionID,
                reportPreviewReportActionID: reportPreviewAction?.reportActionID,
                optimisticReportID,
                optimisticReportActionID,
                policyID: isDistanceRequest ? undefined : policy?.id,
                receipt: isFileUploadable(trackedReceipt) ? trackedReceipt : undefined,
                receiptState: trackedReceipt?.state,
                reimbursable,
                category,
                tag,
                taxCode,
                taxAmount,
                billable,
                // This needs to be a string of JSON because of limitations with the fetch() API and nested objects
                receiptGpsPoints: gpsPoint ? JSON.stringify(gpsPoint) : undefined,
                transactionThreadReportID,
                createdReportActionIDForThread,
                waypoints: sanitizedWaypoints,
                customUnitRateID,
                description: parsedComment,
                isDistance: isMapDistanceRequest(transaction) || isManualDistanceRequestTransactionUtils(transaction),
            };
            if (actionableWhisperReportActionIDParam) {
                parameters.actionableWhisperReportActionID = actionableWhisperReportActionIDParam;
            }
            API.write(WRITE_COMMANDS.TRACK_EXPENSE, parameters, onyxData);
        }
    }

    if (shouldHandleNavigation) {
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        InteractionManager.runAfterInteractions(() => removeDraftTransactions());

        if (!params.isRetry) {
            dismissModalAndOpenReportInInboxTab(activeReportID);
        }
    }

    notifyNewAction(activeReportID, payeeAccountID);
}

function getOrCreateOptimisticSplitChatReport(existingSplitChatReportID: string | undefined, participants: Participant[], participantAccountIDs: number[], currentUserAccountID: number) {
    // The existing chat report could be passed as reportID or exist on the sole "participant" (in this case a report option)
    const existingChatReportID = existingSplitChatReportID ?? participants.at(0)?.reportID;

    // Check if the report is available locally if we do have one
    const existingSplitChatOnyxData = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${existingChatReportID}`];
    let existingSplitChatReport = existingChatReportID && existingSplitChatOnyxData ? {...existingSplitChatOnyxData} : undefined;

    const allParticipantsAccountIDs = [...participantAccountIDs, currentUserAccountID];
    if (!existingSplitChatReport) {
        existingSplitChatReport = getChatByParticipants(allParticipantsAccountIDs, undefined, participantAccountIDs.length > 1);
    }

    // We found an existing chat report we are done...
    if (existingSplitChatReport) {
        // Yes, these are the same, but give the caller a way to identify if we created a new report or not
        return {existingSplitChatReport, splitChatReport: existingSplitChatReport};
    }

    // Create a Group Chat if we have multiple participants
    if (participants.length > 1) {
        const splitChatReport = buildOptimisticChatReport({
            participantList: allParticipantsAccountIDs,
            reportName: '',
            chatType: CONST.REPORT.CHAT_TYPE.GROUP,
            notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
        });

        return {existingSplitChatReport: null, splitChatReport};
    }

    // Otherwise, create a new 1:1 chat report
    const splitChatReport = buildOptimisticChatReport({
        participantList: participantAccountIDs,
    });
    return {existingSplitChatReport: null, splitChatReport};
}

/**
 * Build the Onyx data and IOU split necessary for splitting a bill with 3+ users.
 * 1. Build the optimistic Onyx data for the group chat, i.e. chatReport and iouReportAction creating the former if it doesn't yet exist.
 * 2. Loop over the group chat participant list, building optimistic or updating existing chatReports, iouReports and iouReportActions between the user and each participant.
 * We build both Onyx data and the IOU split that is sent as a request param and is used by Auth to create the chatReports, iouReports and iouReportActions in the database.
 * The IOU split has the following shape:
 *  [
 *      {email: 'currentUser', amount: 100},
 *      {email: 'user2', amount: 100, iouReportID: '100', chatReportID: '110', transactionID: '120', reportActionID: '130'},
 *      {email: 'user3', amount: 100, iouReportID: '200', chatReportID: '210', transactionID: '220', reportActionID: '230'}
 *  ]
 * @param amount - always in the smallest unit of the currency
 * @param existingSplitChatReportID - the report ID where the split expense happens, could be a group chat or a expense chat
 */
function createSplitsAndOnyxData({
    participants,
    currentUserLogin,
    currentUserAccountID,
    existingSplitChatReportID,
    transactionParams: {
        amount,
        comment,
        currency,
        merchant,
        created,
        category,
        tag,
        splitShares = {},
        billable = false,
        reimbursable = false,
        iouRequestType = CONST.IOU.REQUEST_TYPE.MANUAL,
        taxCode = '',
        taxAmount = 0,
        attendees,
    },
    policyRecentlyUsedCategories,
    policyRecentlyUsedTags,
    isASAPSubmitBetaEnabled,
    transactionViolations,
    quickAction,
    policyRecentlyUsedCurrencies,
}: CreateSplitsAndOnyxDataParams): SplitsAndOnyxData {
    const currentUserEmailForIOUSplit = addSMSDomainIfPhoneNumber(currentUserLogin);
    const participantAccountIDs = participants.map((participant) => Number(participant.accountID));

    const {splitChatReport, existingSplitChatReport} = getOrCreateOptimisticSplitChatReport(existingSplitChatReportID, participants, participantAccountIDs, currentUserAccountID);
    const isOwnPolicyExpenseChat = !!splitChatReport.isOwnPolicyExpenseChat;

    // Pass an open receipt so the distance expense will show a map with the route optimistically
    const receipt: Receipt | undefined = iouRequestType === CONST.IOU.REQUEST_TYPE.DISTANCE ? {source: ReceiptGeneric as ReceiptSource, state: CONST.IOU.RECEIPT_STATE.OPEN} : undefined;

    const existingTransaction = allTransactionDrafts[`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`];
    const isDistanceRequest = existingTransaction && existingTransaction.iouRequestType === CONST.IOU.REQUEST_TYPE.DISTANCE;
    let splitTransaction = buildOptimisticTransaction({
        existingTransaction,
        transactionParams: {
            amount,
            currency,
            reportID: CONST.REPORT.SPLIT_REPORT_ID,
            comment,
            created,
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            merchant: merchant || Localize.translateLocal('iou.expense'),
            receipt,
            category,
            tag,
            taxCode,
            taxAmount,
            billable,
            reimbursable,
            pendingFields: isDistanceRequest ? {waypoints: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD} : undefined,
            attendees,
        },
    });

    // Important data is set on the draft distance transaction, such as the iouRequestType marking it as a distance request, so merge it into the optimistic split transaction
    if (isDistanceRequest) {
        splitTransaction = fastMerge(existingTransaction, splitTransaction, false);
    }

    // Note: The created action must be optimistically generated before the IOU action so there's no chance that the created action appears after the IOU action in the chat
    const splitCreatedReportAction = buildOptimisticCreatedReportAction(currentUserEmailForIOUSplit);
    const splitIOUReportAction = buildOptimisticIOUReportAction({
        type: CONST.IOU.REPORT_ACTION_TYPE.SPLIT,
        amount,
        currency,
        comment,
        participants,
        transactionID: splitTransaction.transactionID,
        isOwnPolicyExpenseChat,
    });

    splitChatReport.lastReadTime = DateUtils.getDBTime();
    splitChatReport.lastMessageText = getReportActionText(splitIOUReportAction);
    splitChatReport.lastMessageHtml = getReportActionHtml(splitIOUReportAction);
    splitChatReport.lastActorAccountID = currentUserAccountID;
    splitChatReport.lastVisibleActionCreated = splitIOUReportAction.created;

    if (splitChatReport.participants && getReportNotificationPreference(splitChatReport) === CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN) {
        splitChatReport.participants[currentUserAccountID] = {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS};
    }

    // If we have an existing splitChatReport (group chat or workspace) use it's pending fields, otherwise indicate that we are adding a chat
    if (!existingSplitChatReport) {
        splitChatReport.pendingFields = {
            createChat: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        };
    }

    const optimisticData: OnyxUpdate[] = [
        {
            // Use set for new reports because it doesn't exist yet, is faster,
            // and we need the data to be available when we navigate to the chat page
            onyxMethod: existingSplitChatReport ? Onyx.METHOD.MERGE : Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT}${splitChatReport.reportID}`,
            value: splitChatReport,
        },
        {
            onyxMethod: Onyx.METHOD.SET,
            key: ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE,
            value: {
                action: iouRequestType === CONST.IOU.REQUEST_TYPE.DISTANCE ? CONST.QUICK_ACTIONS.SPLIT_DISTANCE : CONST.QUICK_ACTIONS.SPLIT_MANUAL,
                chatReportID: splitChatReport.reportID,
                isFirstQuickAction: isEmptyObject(quickAction),
            },
        },
        existingSplitChatReport
            ? {
                  onyxMethod: Onyx.METHOD.MERGE,
                  key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${splitChatReport.reportID}`,
                  value: {
                      [splitIOUReportAction.reportActionID]: splitIOUReportAction as OnyxTypes.ReportAction,
                  },
              }
            : {
                  onyxMethod: Onyx.METHOD.SET,
                  key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${splitChatReport.reportID}`,
                  value: {
                      [splitCreatedReportAction.reportActionID]: splitCreatedReportAction as OnyxTypes.ReportAction,
                      [splitIOUReportAction.reportActionID]: splitIOUReportAction as OnyxTypes.ReportAction,
                  },
              },
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${splitTransaction.transactionID}`,
            value: splitTransaction,
        },
    ];

    if (!existingSplitChatReport) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${splitChatReport.reportID}`,
            value: {
                isOptimisticReport: true,
            },
        });
    }

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${splitChatReport.reportID}`,
            value: {
                ...(existingSplitChatReport ? {} : {[splitCreatedReportAction.reportActionID]: {pendingAction: null}}),
                [splitIOUReportAction.reportActionID]: {pendingAction: null},
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${splitTransaction.transactionID}`,
            value: {pendingAction: null, pendingFields: null},
        },
    ];

    if (!existingSplitChatReport) {
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${splitChatReport.reportID}`,
            value: {
                isOptimisticReport: false,
            },
        });
    }

    const redundantParticipants: Record<number, null> = {};
    if (!existingSplitChatReport) {
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${splitChatReport.reportID}`,
            value: {pendingFields: {createChat: null}, participants: redundantParticipants},
        });
    }

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${splitTransaction.transactionID}`,
            value: {
                errors: getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericCreateFailureMessage'),
                pendingAction: null,
                pendingFields: null,
            },
        },
        {
            onyxMethod: Onyx.METHOD.SET,
            key: ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE,
            value: quickAction ?? null,
        },
    ];

    if (existingSplitChatReport) {
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${splitChatReport.reportID}`,
            value: {
                [splitIOUReportAction.reportActionID]: {
                    errors: getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericCreateFailureMessage'),
                },
            },
        });
    } else {
        failureData.push(
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${splitChatReport.reportID}`,
                value: {
                    errorFields: {
                        createChat: getMicroSecondOnyxErrorWithTranslationKey('report.genericCreateReportFailureMessage'),
                    },
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${splitChatReport.reportID}`,
                value: {
                    [splitIOUReportAction.reportActionID]: {
                        errors: getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericCreateFailureMessage'),
                    },
                },
            },
        );
    }

    // Loop through participants creating individual chats, iouReports and reportActionIDs as needed
    const currentUserAmount = splitShares?.[currentUserAccountID]?.amount ?? calculateIOUAmount(participants.length, amount, currency, true);
    const currentUserTaxAmount = calculateIOUAmount(participants.length, taxAmount, currency, true);
    const isPendingDistanceSplitBill = isDistanceRequest && isEmptyObject(splitShares);

    const splits: Split[] = [
        {email: currentUserEmailForIOUSplit, accountID: currentUserAccountID, ...(!isPendingDistanceSplitBill && {amount: currentUserAmount, taxAmount: currentUserTaxAmount})},
    ];

    const hasMultipleParticipants = participants.length > 1;
    for (const participant of participants) {
        // In a case when a participant is a workspace, even when a current user is not an owner of the workspace
        const isPolicyExpenseChat = isPolicyExpenseChatReportUtil(participant);
        const splitAmount = splitShares?.[participant.accountID ?? CONST.DEFAULT_NUMBER_ID]?.amount ?? calculateIOUAmount(participants.length, amount, currency, false);
        const splitTaxAmount = calculateIOUAmount(participants.length, taxAmount, currency, false);

        // In case the participant is a workspace, email & accountID should remain undefined and won't be used in the rest of this code
        // participant.login is undefined when the request is initiated from a group DM with an unknown user, so we need to add a default
        const email = isOwnPolicyExpenseChat || isPolicyExpenseChat ? '' : addSMSDomainIfPhoneNumber(participant.login ?? '').toLowerCase();
        const accountID = isOwnPolicyExpenseChat || isPolicyExpenseChat ? 0 : Number(participant.accountID);

        if (isPendingDistanceSplitBill) {
            const individualSplit = {
                email,
                accountID,
                ...(participant.isOwnPolicyExpenseChat && {
                    policyID: participant.policyID,
                    chatReportID: splitChatReport.reportID,
                }),
            };

            splits.push(individualSplit);
            continue;
        }

        // To exclude someone from a split, the amount can be 0. The scenario for this is when creating a split from a group chat, we have remove the option to deselect users to exclude them.
        // We can input '0' next to someone we want to exclude.
        if (splitAmount === 0) {
            continue;
        }

        if (email === currentUserEmailForIOUSplit) {
            continue;
        }

        // STEP 1: Get existing chat report OR build a new optimistic one
        // If we only have one participant and the request was initiated from the global create menu, i.e. !existingGroupChatReportID, the oneOnOneChatReport is the groupChatReport
        let oneOnOneChatReport: OnyxTypes.Report | OptimisticChatReport;
        let isNewOneOnOneChatReport = false;
        let shouldCreateOptimisticPersonalDetails = false;

        // If this is a split between two people only and the function
        // wasn't provided with an existing group chat report id
        // or, if the split is being made from the expense chat, then the oneOnOneChatReport is the same as the splitChatReport
        // in this case existingSplitChatReport will belong to the policy expense chat and we won't be
        // entering code that creates optimistic personal details
        if ((!hasMultipleParticipants && !existingSplitChatReportID) || isOwnPolicyExpenseChat || isOneOnOneChat(splitChatReport)) {
            oneOnOneChatReport = splitChatReport;
            shouldCreateOptimisticPersonalDetails = !existingSplitChatReport && isOptimisticPersonalDetail(accountID);
        } else {
            const existingChatReport = getChatByParticipants([accountID, currentUserAccountID]);
            isNewOneOnOneChatReport = !existingChatReport;
            shouldCreateOptimisticPersonalDetails = isNewOneOnOneChatReport && isOptimisticPersonalDetail(accountID);
            oneOnOneChatReport =
                existingChatReport ??
                buildOptimisticChatReport({
                    participantList: [accountID, currentUserAccountID],
                });
        }

        // STEP 2: Get existing IOU/Expense report and update its total OR build a new optimistic one
        let oneOnOneIOUReport: OneOnOneIOUReport = oneOnOneChatReport.iouReportID ? allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${oneOnOneChatReport.iouReportID}`] : null;
        const isScanRequest = isScanRequestTransactionUtils(splitTransaction);
        const shouldCreateNewOneOnOneIOUReport = shouldCreateNewMoneyRequestReportReportUtils(oneOnOneIOUReport, oneOnOneChatReport, isScanRequest);

        if (!oneOnOneIOUReport || shouldCreateNewOneOnOneIOUReport) {
            const optimisticExpenseReportID = generateReportID();
            const reportTransactions = buildMinimalTransactionForFormula(
                splitTransaction.transactionID,
                optimisticExpenseReportID,
                splitTransaction.created,
                splitAmount,
                currency,
                splitTransaction.merchant,
            );

            oneOnOneIOUReport = isOwnPolicyExpenseChat
                ? buildOptimisticExpenseReport(
                      oneOnOneChatReport.reportID,
                      oneOnOneChatReport.policyID,
                      currentUserAccountID,
                      splitAmount,
                      currency,
                      undefined,
                      undefined,
                      optimisticExpenseReportID,
                      reportTransactions,
                  )
                : buildOptimisticIOUReport(currentUserAccountID, accountID, splitAmount, oneOnOneChatReport.reportID, currency);
        } else if (isOwnPolicyExpenseChat) {
            // Because of the Expense reports are stored as negative values, we subtract the total from the amount
            if (oneOnOneIOUReport?.currency === currency) {
                if (typeof oneOnOneIOUReport.total === 'number') {
                    oneOnOneIOUReport.total -= splitAmount;
                }

                if (typeof oneOnOneIOUReport.unheldTotal === 'number') {
                    oneOnOneIOUReport.unheldTotal -= splitAmount;
                }
            }
        } else {
            oneOnOneIOUReport = updateIOUOwnerAndTotal(oneOnOneIOUReport, currentUserAccountID, splitAmount, currency);
        }

        // STEP 3: Build optimistic transaction
        let oneOnOneTransaction = buildOptimisticTransaction({
            originalTransactionID: splitTransaction.transactionID,
            transactionParams: {
                amount: isExpenseReport(oneOnOneIOUReport) ? -splitAmount : splitAmount,
                currency,
                reportID: oneOnOneIOUReport.reportID,
                comment,
                created,
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                merchant: merchant || Localize.translateLocal('iou.expense'),
                category,
                tag,
                taxCode,
                taxAmount: isExpenseReport(oneOnOneIOUReport) ? -splitTaxAmount : splitTaxAmount,
                billable,
                source: CONST.IOU.TYPE.SPLIT,
            },
        });
        oneOnOneIOUReport.transactionCount = (oneOnOneIOUReport.transactionCount ?? 0) + 1;

        if (isDistanceRequest) {
            oneOnOneTransaction = fastMerge(existingTransaction, oneOnOneTransaction, false);
        }

        // STEP 4: Build optimistic reportActions. We need:
        // 1. CREATED action for the chatReport
        // 2. CREATED action for the iouReport
        // 3. IOU action for the iouReport
        // 4. Transaction Thread and the CREATED action for it
        // 5. REPORT_PREVIEW action for the chatReport
        const [oneOnOneCreatedActionForChat, oneOnOneCreatedActionForIOU, oneOnOneIOUAction, optimisticTransactionThread, optimisticCreatedActionForTransactionThread] =
            buildOptimisticMoneyRequestEntities({
                iouReport: oneOnOneIOUReport,
                type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                amount: splitAmount,
                currency,
                comment,
                payeeEmail: currentUserEmailForIOUSplit,
                participants: [participant],
                transactionID: oneOnOneTransaction.transactionID,
            });

        // Add optimistic personal details for new participants
        const oneOnOnePersonalDetailListAction: OnyxTypes.PersonalDetailsList = shouldCreateOptimisticPersonalDetails
            ? {
                  [accountID]: {
                      accountID,
                      // Disabling this line since participant.displayName can be an empty string
                      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                      displayName: formatPhoneNumber(participant.displayName || email),
                      login: participant.login,
                      isOptimisticPersonalDetail: true,
                  },
              }
            : {};

        if (shouldCreateOptimisticPersonalDetails) {
            // BE will send different participants. We clear the optimistic ones to avoid duplicated entries
            redundantParticipants[accountID] = null;
        }

        let oneOnOneReportPreviewAction = getReportPreviewAction(oneOnOneChatReport.reportID, oneOnOneIOUReport.reportID);
        if (oneOnOneReportPreviewAction) {
            oneOnOneReportPreviewAction = updateReportPreview(oneOnOneIOUReport, oneOnOneReportPreviewAction);
        } else {
            oneOnOneReportPreviewAction = buildOptimisticReportPreview(oneOnOneChatReport, oneOnOneIOUReport);
        }

        const optimisticPolicyRecentlyUsedCategories = isPolicyExpenseChat ? mergePolicyRecentlyUsedCategories(category, policyRecentlyUsedCategories) : [];
        const optimisticRecentlyUsedCurrencies = mergePolicyRecentlyUsedCurrencies(currency, policyRecentlyUsedCurrencies);

        // Add tag to optimistic policy recently used tags when a participant is a workspace
        const optimisticPolicyRecentlyUsedTags = isPolicyExpenseChat
            ? buildOptimisticPolicyRecentlyUsedTags({
                  policyTags: getPolicyTagsData(participant.policyID),
                  policyRecentlyUsedTags,
                  transactionTags: tag,
              })
            : {};
        const hasViolations = hasViolationsReportUtils(oneOnOneIOUReport.reportID, transactionViolations, currentUserAccountID, currentUserEmailForIOUSplit);

        // STEP 5: Build Onyx Data
        const [oneOnOneOptimisticData, oneOnOneSuccessData, oneOnOneFailureData] = buildOnyxDataForMoneyRequest({
            isNewChatReport: isNewOneOnOneChatReport,
            shouldCreateNewMoneyRequestReport: shouldCreateNewOneOnOneIOUReport,
            isOneOnOneSplit: true,
            isASAPSubmitBetaEnabled,
            optimisticParams: {
                chat: {
                    report: oneOnOneChatReport,
                    createdAction: oneOnOneCreatedActionForChat,
                    reportPreviewAction: oneOnOneReportPreviewAction,
                },
                iou: {
                    report: oneOnOneIOUReport,
                    createdAction: oneOnOneCreatedActionForIOU,
                    action: oneOnOneIOUAction,
                },
                transactionParams: {
                    transaction: oneOnOneTransaction,
                    transactionThreadReport: optimisticTransactionThread,
                    transactionThreadCreatedReportAction: optimisticCreatedActionForTransactionThread,
                },
                policyRecentlyUsed: {
                    categories: optimisticPolicyRecentlyUsedCategories,
                    tags: optimisticPolicyRecentlyUsedTags,
                    currencies: optimisticRecentlyUsedCurrencies,
                },
                personalDetailListAction: oneOnOnePersonalDetailListAction,
            },
            currentUserAccountIDParam: currentUserAccountID,
            currentUserEmailParam: currentUserEmail,
            hasViolations,
            quickAction,
        });

        const individualSplit = {
            email,
            accountID,
            isOptimisticAccount: isOptimisticPersonalDetail(accountID),
            amount: splitAmount,
            iouReportID: oneOnOneIOUReport.reportID,
            chatReportID: oneOnOneChatReport.reportID,
            transactionID: oneOnOneTransaction.transactionID,
            reportActionID: oneOnOneIOUAction.reportActionID,
            createdChatReportActionID: oneOnOneCreatedActionForChat.reportActionID,
            createdIOUReportActionID: oneOnOneCreatedActionForIOU.reportActionID,
            reportPreviewReportActionID: oneOnOneReportPreviewAction.reportActionID,
            transactionThreadReportID: optimisticTransactionThread.reportID,
            createdReportActionIDForThread: optimisticCreatedActionForTransactionThread?.reportActionID,
            taxAmount: splitTaxAmount,
        };

        splits.push(individualSplit);
        optimisticData.push(...oneOnOneOptimisticData);
        successData.push(...oneOnOneSuccessData);
        failureData.push(...oneOnOneFailureData);
    }

    optimisticData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.TRANSACTION}${splitTransaction.transactionID}`,
        value: {
            comment: {
                splits: splits.map((split) => ({accountID: split.accountID, amount: split.amount})),
            },
        },
    });

    const splitData: SplitData = {
        chatReportID: splitChatReport.reportID,
        transactionID: splitTransaction.transactionID,
        reportActionID: splitIOUReportAction.reportActionID,
        policyID: splitChatReport.policyID,
        chatType: splitChatReport.chatType,
    };

    if (!existingSplitChatReport) {
        splitData.createdReportActionID = splitCreatedReportAction.reportActionID;
    }

    return {
        splitData,
        splits,
        onyxData: {optimisticData, successData, failureData},
    };
}

function setDraftSplitTransaction(
    transactionID: string | undefined,
    splitTransactionDraft: OnyxEntry<OnyxTypes.Transaction>,
    transactionChanges: TransactionChanges = {},
    policy?: OnyxEntry<OnyxTypes.Policy>,
) {
    if (!transactionID) {
        return undefined;
    }
    let draftSplitTransaction = splitTransactionDraft;

    if (!draftSplitTransaction) {
        draftSplitTransaction = allTransactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
    }

    const updatedTransaction = draftSplitTransaction
        ? getUpdatedTransaction({
              transaction: draftSplitTransaction,
              transactionChanges,
              isFromExpenseReport: false,
              shouldUpdateReceiptState: false,
              policy,
          })
        : null;

    Onyx.merge(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`, updatedTransaction);
}

/** Requests money based on a distance (e.g. mileage from a map) */
function createDistanceRequest(distanceRequestInformation: CreateDistanceRequestInformation) {
    const {
        report,
        participants,
        currentUserLogin = '',
        currentUserAccountID = -1,
        iouType = CONST.IOU.TYPE.SUBMIT,
        existingTransaction,
        transactionParams,
        policyParams = {},
        backToReport,
        isASAPSubmitBetaEnabled,
        transactionViolations,
        quickAction,
        policyRecentlyUsedCurrencies,
        customUnitPolicyID,
        shouldHandleNavigation = true,
    } = distanceRequestInformation;
    const {policy, policyCategories, policyTagList, policyRecentlyUsedCategories, policyRecentlyUsedTags} = policyParams;
    const parsedComment = getParsedComment(transactionParams.comment);
    transactionParams.comment = parsedComment;
    const {
        amount,
        comment,
        distance,
        currency,
        created,
        category,
        tag,
        taxAmount,
        taxCode,
        merchant,
        billable,
        reimbursable,
        validWaypoints,
        customUnitRateID = '',
        splitShares = {},
        attendees,
        receipt,
        odometerStart,
        odometerEnd,
    } = transactionParams;

    // If the report is an iou or expense report, we should get the linked chat report to be passed to the getMoneyRequestInformation function
    const isMoneyRequestReport = isMoneyRequestReportReportUtils(report);
    const currentChatReport = isMoneyRequestReport ? getReportOrDraftReport(report?.chatReportID) : report;
    const moneyRequestReportID = isMoneyRequestReport ? report?.reportID : '';
    const isManualDistanceRequest = isEmptyObject(validWaypoints);

    const optimisticReceipt: Receipt | undefined = !isManualDistanceRequest
        ? {
              source: ReceiptGeneric as ReceiptSource,
              state: CONST.IOU.RECEIPT_STATE.OPEN,
          }
        : receipt;

    let parameters: CreateDistanceRequestParams;
    let onyxData: OnyxData<OnyxKey>;
    const sanitizedWaypoints = !isManualDistanceRequest ? sanitizeRecentWaypoints(validWaypoints) : null;
    if (iouType === CONST.IOU.TYPE.SPLIT) {
        const {
            splitData,
            splits,
            onyxData: splitOnyxData,
        } = createSplitsAndOnyxData({
            participants,
            currentUserLogin: currentUserLogin ?? '',
            currentUserAccountID,
            existingSplitChatReportID: report?.reportID,
            transactionParams: {
                amount,
                comment,
                currency,
                merchant,
                created,
                category: category ?? '',
                tag: tag ?? '',
                splitShares,
                billable,
                iouRequestType: CONST.IOU.REQUEST_TYPE.DISTANCE,
                taxCode,
                taxAmount,
                attendees,
            },
            policyRecentlyUsedCategories,
            policyRecentlyUsedTags,
            isASAPSubmitBetaEnabled,
            transactionViolations,
            quickAction,
            policyRecentlyUsedCurrencies,
        });
        onyxData = splitOnyxData;

        // Splits don't use the IOU report param. The split transaction isn't linked to a report shown in the UI, it's linked to a special default reportID of -2.
        // Therefore, any params related to the IOU report are irrelevant and omitted below.
        parameters = {
            transactionID: splitData.transactionID,
            chatReportID: splitData.chatReportID,
            createdChatReportActionID: splitData.createdReportActionID,
            reportActionID: splitData.reportActionID,
            waypoints: JSON.stringify(sanitizedWaypoints),
            customUnitRateID,
            customUnitPolicyID,
            comment,
            created,
            category,
            tag,
            taxCode,
            taxAmount,
            billable,
            reimbursable,
            splits: JSON.stringify(splits),
            chatType: splitData.chatType,
            description: parsedComment,
            attendees: attendees ? JSON.stringify(attendees) : undefined,
            odometerStart,
            odometerEnd,
        };
    } else {
        const participant = participants.at(0) ?? {};
        const {
            iouReport,
            chatReport,
            transaction,
            iouAction,
            createdChatReportActionID,
            createdIOUReportActionID,
            reportPreviewAction,
            transactionThreadReportID,
            createdReportActionIDForThread,
            payerEmail,
            onyxData: moneyRequestOnyxData,
        } = getMoneyRequestInformation({
            parentChatReport: currentChatReport,
            existingTransaction,
            moneyRequestReportID,
            participantParams: {
                participant,
                payeeAccountID: userAccountID,
                payeeEmail: currentUserEmail,
            },
            policyParams: {
                policy,
                policyCategories,
                policyTagList,
                policyRecentlyUsedCategories,
                policyRecentlyUsedTags,
            },
            transactionParams: {
                amount,
                distance,
                currency,
                comment,
                created,
                merchant,
                receipt: optimisticReceipt,
                category,
                tag,
                taxCode,
                taxAmount,
                billable,
                reimbursable,
                attendees,
            },
            isASAPSubmitBetaEnabled,
            currentUserAccountIDParam: currentUserAccountID,
            currentUserEmailParam: currentUserLogin,
            transactionViolations,
            quickAction,
            policyRecentlyUsedCurrencies,
        });

        onyxData = moneyRequestOnyxData;

        if (transaction.iouRequestType === CONST.IOU.REQUEST_TYPE.DISTANCE_MAP || isManualDistanceRequest || transaction.iouRequestType === CONST.IOU.REQUEST_TYPE.DISTANCE_ODOMETER) {
            // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
            onyxData?.optimisticData?.push({
                onyxMethod: Onyx.METHOD.SET,
                key: ONYXKEYS.NVP_LAST_DISTANCE_EXPENSE_TYPE,
                value: transaction.iouRequestType,
            });
        }

        parameters = {
            comment,
            iouReportID: iouReport.reportID,
            chatReportID: chatReport.reportID,
            transactionID: transaction.transactionID,
            reportActionID: iouAction.reportActionID,
            createdChatReportActionID,
            createdIOUReportActionID,
            reportPreviewReportActionID: reportPreviewAction.reportActionID,
            waypoints: JSON.stringify(sanitizedWaypoints),
            distance,
            receipt,
            odometerStart,
            odometerEnd,
            created,
            category,
            tag,
            taxCode,
            taxAmount,
            billable,
            reimbursable,
            transactionThreadReportID,
            createdReportActionIDForThread,
            payerEmail,
            customUnitRateID,
            customUnitPolicyID,
            description: parsedComment,
            attendees: attendees ? JSON.stringify(attendees) : undefined,
        };
    }

    const recentServerValidatedWaypoints = recentWaypoints.filter((item) => !item.pendingAction);
    onyxData?.failureData?.push({
        onyxMethod: Onyx.METHOD.SET,
        key: `${ONYXKEYS.NVP_RECENT_WAYPOINTS}`,
        value: recentServerValidatedWaypoints,
    });

    playSound(SOUNDS.DONE);

    API.write(WRITE_COMMANDS.CREATE_DISTANCE_REQUEST, parameters, onyxData);
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    InteractionManager.runAfterInteractions(() => removeDraftTransaction(CONST.IOU.OPTIMISTIC_TRANSACTION_ID));
    const activeReportID = isMoneyRequestReport && report?.reportID ? report.reportID : parameters.chatReportID;

    if (shouldHandleNavigation) {
        dismissModalAndOpenReportInInboxTab(backToReport ?? activeReportID);
    }

    if (!isMoneyRequestReport) {
        notifyNewAction(activeReportID, userAccountID);
    }
}

type UpdateMoneyRequestAmountAndCurrencyParams = {
    transactionID: string;
    transactionThreadReport: OnyxEntry<OnyxTypes.Report>;
    parentReport: OnyxEntry<OnyxTypes.Report>;
    currency: string;
    amount: number;
    taxAmount: number;
    policy?: OnyxEntry<OnyxTypes.Policy>;
    policyTagList?: OnyxEntry<OnyxTypes.PolicyTagLists>;
    policyCategories?: OnyxEntry<OnyxTypes.PolicyCategories>;
    taxCode: string;
    taxValue: string;
    allowNegative?: boolean;
    transactions: OnyxCollection<OnyxTypes.Transaction>;
    transactionViolations: OnyxCollection<OnyxTypes.TransactionViolations>;
    currentUserAccountIDParam: number;
    currentUserEmailParam: string;
    isASAPSubmitBetaEnabled: boolean;
    policyRecentlyUsedCurrencies: string[];
    parentReportNextStep: OnyxEntry<OnyxTypes.ReportNextStepDeprecated>;
};

/** Updates the amount and currency fields of an expense */
function updateMoneyRequestAmountAndCurrency({
    transactionID,
    transactionThreadReport,
    parentReport,
    currency,
    amount,
    taxAmount,
    policy,
    policyTagList,
    policyCategories,
    taxCode,
    taxValue,
    allowNegative = false,
    transactions,
    transactionViolations,
    currentUserAccountIDParam,
    currentUserEmailParam,
    isASAPSubmitBetaEnabled,
    policyRecentlyUsedCurrencies,
    parentReportNextStep,
}: UpdateMoneyRequestAmountAndCurrencyParams) {
    const transactionChanges = {
        amount,
        currency,
        taxCode,
        taxAmount,
        taxValue,
    };

    let data: UpdateMoneyRequestData;
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    if (isTrackExpenseReport(transactionThreadReport) && isSelfDM(parentReport)) {
        data = getUpdateTrackExpenseParams(transactionID, transactionThreadReport?.reportID, transactionChanges, policy);
    } else {
        data = getUpdateMoneyRequestParams({
            transactionID,
            transactionThreadReport,
            iouReport: parentReport,
            transactionChanges,
            policy,
            policyTagList: policyTagList ?? null,
            policyCategories: policyCategories ?? null,
            allowNegative,
            currentUserAccountIDParam,
            currentUserEmailParam,
            isASAPSubmitBetaEnabled,
            policyRecentlyUsedCurrencies,
            iouReportNextStep: parentReportNextStep,
        });
        removeTransactionFromDuplicateTransactionViolation(data.onyxData, transactionID, transactions, transactionViolations);
    }
    const {params, onyxData} = data;
    API.write(WRITE_COMMANDS.UPDATE_MONEY_REQUEST_AMOUNT_AND_CURRENCY, params, onyxData);
}

/**
 *
 * @param transactionID  - The transactionID of IOU
 * @param reportAction - The reportAction of the transaction in the IOU report
 * @return the url to navigate back once the money request is deleted
 */
function prepareToCleanUpMoneyRequest(
    transactionID: string,
    reportAction: OnyxTypes.ReportAction,
    iouReport: OnyxEntry<OnyxTypes.Report>,
    chatReport: OnyxEntry<OnyxTypes.Report>,
    isChatReportArchived: boolean | undefined,
    shouldRemoveIOUTransactionID = true,
    transactionIDsPendingDeletion?: string[],
    selectedTransactionIDs?: string[],
) {
    // STEP 1: Get all collections we're updating
    const iouReportID = iouReport?.reportID;
    const reportPreviewAction = getReportPreviewAction(iouReport?.chatReportID, iouReport?.reportID);
    const transaction = allTransactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
    const isTransactionOnHold = isOnHold(transaction);
    const transactionViolations = allTransactionViolations[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`];
    const transactionThreadID = reportAction.childReportID;
    let transactionThread = null;
    if (transactionThreadID) {
        transactionThread = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadID}`] ?? null;
    }

    // STEP 2: Decide if we need to:
    // 1. Delete the transactionThread - delete if there are no visible comments in the thread
    // 2. Update the moneyRequestPreview to show [Deleted expense] - update if the transactionThread exists AND it isn't being deleted
    // The current state is that we want to get rid of the [Deleted expense] breadcrumb,
    // so we never want to display it if transactionThreadID is present.
    const shouldDeleteTransactionThread = !!transactionThreadID;

    // STEP 3: Update the IOU reportAction and decide if the iouReport should be deleted. We delete the iouReport if there are no visible comments left in the report.
    const updatedReportAction = {
        [reportAction.reportActionID]: {
            pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
            previousMessage: reportAction.message,
            message: [
                {
                    type: 'COMMENT',
                    html: '',
                    text: '',
                    isEdited: true,
                    isDeletedParentAction: shouldDeleteTransactionThread,
                },
            ],
            originalMessage: {
                IOUTransactionID: shouldRemoveIOUTransactionID ? null : transactionID,
            },
            errors: null,
        },
    } as Record<string, NullishDeep<OnyxTypes.ReportAction>>;

    let canUserPerformWriteAction = true;
    if (chatReport) {
        canUserPerformWriteAction = !!canUserPerformWriteActionReportUtils(chatReport, isChatReportArchived);
    }
    // If we are deleting the last transaction on a report, then delete the report too
    const shouldDeleteIOUReport = getReportTransactions(iouReportID).filter((trans) => !transactionIDsPendingDeletion?.includes(trans.transactionID)).length === 1;

    const iouReportActions = allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReportID}`];
    if (shouldDeleteIOUReport) {
        for (const [reportActionID, reportActionData] of Object.entries(iouReportActions ?? {})) {
            if (
                reportAction.reportActionID === reportActionID ||
                reportActionData.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE ||
                reportActionData.actionName === 'CREATED' ||
                !reportActionData.message ||
                isDeletedAction(reportActionData)
            ) {
                continue;
            }

            updatedReportAction[reportActionID] = {
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                previousMessage: reportAction.message,
                message: [
                    {
                        type: 'COMMENT',
                        html: '',
                        text: '',
                        isEdited: true,
                    },
                ],
                errors: null,
            };
        }
    }
    // STEP 4: Update the iouReport and reportPreview with new totals and messages if it wasn't deleted
    let updatedIOUReport;
    const currency = getCurrency(transaction);
    const updatedReportPreviewAction: Partial<OnyxTypes.ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW>> = cloneDeep(reportPreviewAction ?? {});
    updatedReportPreviewAction.pendingAction = shouldDeleteIOUReport ? CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE : CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE;

    const transactionPendingDelete = transactionIDsPendingDeletion?.map((id) => allTransactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${id}`]);
    const selectedTransactions = selectedTransactionIDs?.map((id) => allTransactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${id}`]);
    const canEditTotal = !selectedTransactions?.some((trans) => getCurrency(trans) !== iouReport?.currency);
    const isExpenseReportType = isExpenseReport(iouReport);
    const amountDiff = getAmount(transaction, isExpenseReportType) + (transactionPendingDelete?.reduce((prev, curr) => prev + getAmount(curr, isExpenseReportType), 0) ?? 0);
    const unheldAmountDiff =
        getAmount(transaction, isExpenseReportType) + (transactionPendingDelete?.reduce((prev, curr) => prev + (!isOnHold(curr) ? getAmount(curr, isExpenseReportType) : 0), 0) ?? 0);

    if (iouReport && isExpenseReportType) {
        updatedIOUReport = {...iouReport};

        if (typeof updatedIOUReport.total === 'number' && currency === iouReport?.currency && canEditTotal) {
            // Because of the Expense reports are stored as negative values, we add the total from the amount
            updatedIOUReport.total += amountDiff;

            if (!transaction?.reimbursable && typeof updatedIOUReport.nonReimbursableTotal === 'number') {
                const nonReimbursableAmountDiff =
                    getAmount(transaction, true) + (transactionPendingDelete?.reduce((prev, curr) => prev + (!curr?.reimbursable ? getAmount(curr, true) : 0), 0) ?? 0);
                updatedIOUReport.nonReimbursableTotal += nonReimbursableAmountDiff;
            }

            if (!isTransactionOnHold) {
                if (typeof updatedIOUReport.unheldTotal === 'number') {
                    updatedIOUReport.unheldTotal += unheldAmountDiff;
                }

                if (!transaction?.reimbursable && typeof updatedIOUReport.unheldNonReimbursableTotal === 'number') {
                    const unheldNonReimbursableAmountDiff =
                        getAmount(transaction, true) +
                        (transactionPendingDelete?.reduce((prev, curr) => prev + (!isOnHold(curr) && !curr?.reimbursable ? getAmount(curr, true) : 0), 0) ?? 0);
                    updatedIOUReport.unheldNonReimbursableTotal += unheldNonReimbursableAmountDiff;
                }
            }
        }
    } else {
        updatedIOUReport =
            iouReport && !canEditTotal
                ? {...iouReport}
                : updateIOUOwnerAndTotal(iouReport, reportAction.actorAccountID ?? CONST.DEFAULT_NUMBER_ID, amountDiff, currency, true, false, isTransactionOnHold, unheldAmountDiff);
    }

    if (updatedIOUReport) {
        const lastVisibleAction = getLastVisibleAction(iouReport?.reportID, canUserPerformWriteAction, updatedReportAction);
        const iouReportLastMessageText = getLastVisibleMessage(iouReport?.reportID, canUserPerformWriteAction, updatedReportAction).lastMessageText;
        updatedIOUReport.lastMessageText = iouReportLastMessageText;
        updatedIOUReport.lastVisibleActionCreated = lastVisibleAction?.created;
    }

    const hasNonReimbursableTransactions = hasNonReimbursableTransactionsReportUtils(iouReport?.reportID);
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const messageText = Localize.translateLocal(
        hasNonReimbursableTransactions ? 'iou.payerSpentAmount' : 'iou.payerOwesAmount',
        convertToDisplayString(updatedIOUReport?.total, updatedIOUReport?.currency),
        getPersonalDetailsForAccountID(updatedIOUReport?.managerID ?? CONST.DEFAULT_NUMBER_ID).login ?? '',
    );

    if (getReportActionMessage(updatedReportPreviewAction)) {
        if (Array.isArray(updatedReportPreviewAction?.message)) {
            const message = updatedReportPreviewAction.message.at(0);
            if (message) {
                message.text = messageText;
                message.html = messageText;
                message.deleted = shouldDeleteIOUReport ? DateUtils.getDBTime() : '';
            }
        } else if (!Array.isArray(updatedReportPreviewAction.message) && updatedReportPreviewAction.message) {
            updatedReportPreviewAction.message.text = messageText;
            updatedReportPreviewAction.message.deleted = shouldDeleteIOUReport ? DateUtils.getDBTime() : '';
        }
    }

    if (updatedReportPreviewAction && reportPreviewAction?.childMoneyRequestCount && reportPreviewAction?.childMoneyRequestCount > 0) {
        updatedReportPreviewAction.childMoneyRequestCount = reportPreviewAction.childMoneyRequestCount - 1;
    }

    return {
        shouldDeleteTransactionThread,
        shouldDeleteIOUReport,
        updatedReportAction,
        updatedIOUReport,
        updatedReportPreviewAction,
        transactionThreadID,
        transactionThread,
        transaction,
        transactionViolations,
        reportPreviewAction,
        iouReportActions,
    };
}

/**
 * Calculate the URL to navigate to after a money request deletion
 * @param transactionID - The ID of the money request being deleted
 * @param reportAction - The report action associated with the money request
 * @param isSingleTransactionView - whether we are in the transaction thread report
 * @returns The URL to navigate to
 */
function getNavigationUrlOnMoneyRequestDelete(
    transactionID: string | undefined,
    reportAction: OnyxTypes.ReportAction,
    iouReport: OnyxEntry<OnyxTypes.Report>,
    chatReport: OnyxEntry<OnyxTypes.Report>,
    isChatReportArchived: boolean | undefined,
    isSingleTransactionView = false,
): Route | undefined {
    if (!transactionID) {
        return undefined;
    }

    const {shouldDeleteTransactionThread, shouldDeleteIOUReport} = prepareToCleanUpMoneyRequest(transactionID, reportAction, iouReport, chatReport, isChatReportArchived);

    // Determine which report to navigate back to
    if (iouReport && isSingleTransactionView && shouldDeleteTransactionThread && !shouldDeleteIOUReport) {
        return ROUTES.REPORT_WITH_ID.getRoute(iouReport.reportID);
    }

    if (iouReport?.chatReportID && shouldDeleteIOUReport) {
        return ROUTES.REPORT_WITH_ID.getRoute(iouReport.chatReportID);
    }

    return undefined;
}

/**
 * Calculate the URL to navigate to after a track expense deletion
 * @param chatReportID - The ID of the chat report containing the track expense
 * @param transactionID - The ID of the track expense being deleted
 * @param reportAction - The report action associated with the track expense
 * @param isSingleTransactionView - Whether we're in single transaction view
 * @returns The URL to navigate to
 */
function getNavigationUrlAfterTrackExpenseDelete(
    chatReportID: string | undefined,
    chatReport: OnyxEntry<OnyxTypes.Report> | undefined,
    transactionID: string | undefined,
    reportAction: OnyxTypes.ReportAction,
    iouReport: OnyxEntry<OnyxTypes.Report>,
    chatIOUReport: OnyxEntry<OnyxTypes.Report>,
    isChatReportArchived: boolean | undefined,
    isSingleTransactionView = false,
): Route | undefined {
    if (!chatReportID || !transactionID) {
        return undefined;
    }

    // If not a self DM, handle it as a regular money request
    if (!isSelfDM(chatReport)) {
        return getNavigationUrlOnMoneyRequestDelete(transactionID, reportAction, iouReport, chatIOUReport, isChatReportArchived, isSingleTransactionView);
    }

    // Only navigate if in single transaction view and the thread will be deleted
    if (isSingleTransactionView && chatReport?.reportID) {
        // Pop the deleted report screen before navigating. This prevents navigating to the Concierge chat due to the missing report.
        return ROUTES.REPORT_WITH_ID.getRoute(chatReport.reportID);
    }

    return undefined;
}

/**
 *
 * @param transactionID  - The transactionID of IOU
 * @param reportAction - The reportAction of the transaction in the IOU report
 * @param isSingleTransactionView - whether we are in the transaction thread report
 * @return the url to navigate back once the money request is deleted
 */
function cleanUpMoneyRequest(
    transactionID: string,
    reportAction: OnyxTypes.ReportAction,
    reportID: string,
    iouReport: OnyxEntry<OnyxTypes.Report>,
    chatReport: OnyxEntry<OnyxTypes.Report>,
    isChatIOUReportArchived: boolean | undefined,
    isSingleTransactionView = false,
) {
    const {shouldDeleteTransactionThread, shouldDeleteIOUReport, updatedReportAction, updatedIOUReport, updatedReportPreviewAction, transactionThreadID, reportPreviewAction} =
        prepareToCleanUpMoneyRequest(transactionID, reportAction, iouReport, chatReport, isChatIOUReportArchived, false);

    const urlToNavigateBack = getNavigationUrlOnMoneyRequestDelete(transactionID, reportAction, iouReport, chatReport, isChatIOUReportArchived, isSingleTransactionView);
    // build Onyx data

    // Onyx operations to delete the transaction, update the IOU report action and chat report action
    const reportActionsOnyxUpdates: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [];
    const onyxUpdates: Array<
        OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS | typeof ONYXKEYS.COLLECTION.REPORT>
    > = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: null,
        },
    ];
    if (shouldDeleteIOUReport) {
        onyxUpdates.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport?.reportID}`,
            value: {
                [reportAction.reportActionID]: shouldDeleteIOUReport
                    ? null
                    : {
                          pendingAction: null,
                      },
            },
        });
    } else {
        reportActionsOnyxUpdates.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport?.reportID}`,
            value: {
                [reportAction.reportActionID]: shouldDeleteIOUReport
                    ? null
                    : {
                          pendingAction: null,
                      },
            },
        });
    }

    if (reportPreviewAction?.reportActionID) {
        reportActionsOnyxUpdates.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport?.reportID}`,
            value: {
                [reportPreviewAction.reportActionID]: {
                    ...updatedReportPreviewAction,
                    pendingAction: null,
                    errors: null,
                },
            },
        });
    }

    // added the operation to delete associated transaction violations
    onyxUpdates.push({
        onyxMethod: Onyx.METHOD.SET,
        key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`,
        value: null,
    });

    // added the operation to delete transaction thread
    if (shouldDeleteTransactionThread) {
        onyxUpdates.push(
            {
                onyxMethod: Onyx.METHOD.SET,
                key: `${ONYXKEYS.COLLECTION.REPORT}${transactionThreadID}`,
                value: null,
            },
            {
                onyxMethod: Onyx.METHOD.SET,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadID}`,
                value: null,
            },
        );
    }

    if (shouldDeleteIOUReport) {
        onyxUpdates.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport?.reportID}`,
            value: updatedReportAction,
        });
    } else {
        // added operations to update IOU report and chat report
        reportActionsOnyxUpdates.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport?.reportID}`,
            value: updatedReportAction,
        });
    }
    onyxUpdates.push(
        // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport?.reportID}`,
            value: updatedIOUReport,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport?.reportID}`,
            value: getOutstandingChildRequest(updatedIOUReport),
        },
    );

    if (!shouldDeleteIOUReport && updatedReportPreviewAction.childMoneyRequestCount === 0) {
        onyxUpdates.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport?.reportID}`,
            value: {
                hasOutstandingChildRequest: false,
            },
        });
    }

    if (shouldDeleteIOUReport) {
        let canUserPerformWriteAction = true;
        if (chatReport) {
            canUserPerformWriteAction = !!canUserPerformWriteActionReportUtils(chatReport, isChatIOUReportArchived);
        }

        const lastMessageText = getLastVisibleMessage(
            iouReport?.chatReportID,
            canUserPerformWriteAction,
            reportPreviewAction?.reportActionID ? {[reportPreviewAction.reportActionID]: null} : {},
        )?.lastMessageText;
        const lastVisibleActionCreated = getLastVisibleAction(
            iouReport?.chatReportID,
            canUserPerformWriteAction,
            reportPreviewAction?.reportActionID ? {[reportPreviewAction.reportActionID]: null} : {},
        )?.created;

        onyxUpdates.push(
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport?.reportID}`,
                value: {
                    hasOutstandingChildRequest: false,
                    iouReportID: null,
                    lastMessageText,
                    lastVisibleActionCreated,
                },
            },
            {
                onyxMethod: Onyx.METHOD.SET,
                key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport?.reportID}`,
                value: null,
            },
        );
    }

    if (!shouldDeleteIOUReport) {
        clearAllRelatedReportActionErrors(reportID, reportAction);
    }

    // First, update the reportActions to ensure related actions are not displayed.
    Onyx.update(reportActionsOnyxUpdates).then(() => {
        Navigation.goBack(urlToNavigateBack);
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        InteractionManager.runAfterInteractions(() => {
            if (shouldDeleteIOUReport) {
                clearAllRelatedReportActionErrors(reportID, reportAction);
            }
            // After navigation, update the remaining data.
            Onyx.update(onyxUpdates);
        });
    });
}

/**
 *
 * @param transactionID  - The transactionID of IOU
 * @param reportAction - The reportAction of the transaction in the IOU report
 * @param isSingleTransactionView - whether we are in the transaction thread report
 * @return the url to navigate back once the money request is deleted
 */
function deleteMoneyRequest({
    transactionID,
    reportAction,
    transactions,
    violations,
    iouReport,
    chatReport,
    isChatIOUReportArchived,
    isSingleTransactionView = false,
    transactionIDsPendingDeletion,
    selectedTransactionIDs,
    allTransactionViolationsParam,
    hash,
}: DeleteMoneyRequestFunctionParams) {
    if (!transactionID) {
        return;
    }

    // STEP 1: Calculate and prepare the data
    const {
        shouldDeleteTransactionThread,
        shouldDeleteIOUReport,
        updatedReportAction,
        updatedIOUReport,
        updatedReportPreviewAction,
        transactionThreadID,
        transactionThread,
        transaction,
        transactionViolations,
        reportPreviewAction,
        iouReportActions,
    } = prepareToCleanUpMoneyRequest(transactionID, reportAction, iouReport, chatReport, isChatIOUReportArchived, false, transactionIDsPendingDeletion, selectedTransactionIDs);

    const urlToNavigateBack = getNavigationUrlOnMoneyRequestDelete(transactionID, reportAction, iouReport, chatReport, isChatIOUReportArchived, isSingleTransactionView);

    // STEP 2: Build Onyx data
    // The logic mostly resembles the cleanUpMoneyRequest function
    const optimisticData: Array<
        OnyxUpdate<
            | typeof ONYXKEYS.COLLECTION.TRANSACTION
            | typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS
            | typeof ONYXKEYS.COLLECTION.REPORT
            | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS
            | typeof ONYXKEYS.COLLECTION.SNAPSHOT
        >
    > = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: {...transaction, pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE},
        },
    ];

    optimisticData.push({
        onyxMethod: Onyx.METHOD.SET,
        key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`,
        value: null,
    });

    const failureData: Array<
        OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION | typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS>
    > = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: {...transaction, pendingAction: null},
        },
    ];

    removeTransactionFromDuplicateTransactionViolation({optimisticData, failureData}, transactionID, transactions, violations);

    if (shouldDeleteTransactionThread) {
        optimisticData.push(
            // Use merge instead of set to avoid deleting the report too quickly, which could cause a brief "not found" page to appear.
            // The remaining parts of the report object will be removed after the API call is successful.
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${transactionThreadID}`,
                value: {
                    reportID: null,
                    stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                    statusNum: CONST.REPORT.STATUS_NUM.CLOSED,
                    participants: {
                        [userAccountID]: {
                            notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN,
                        },
                    },
                },
            },
            {
                onyxMethod: Onyx.METHOD.SET,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadID}`,
                value: null,
            },
        );
    }

    optimisticData.push(
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport?.reportID}`,
            value: updatedReportAction,
        },
        // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport?.reportID}`,
            value: updatedIOUReport,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport?.reportID}`,
            value: getOutstandingChildRequest(updatedIOUReport),
        },
    );

    if (reportPreviewAction?.reportActionID) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport?.reportID}`,
            value: {[reportPreviewAction.reportActionID]: updatedReportPreviewAction},
        });
    }

    if (chatReport && updatedIOUReport && !shouldDeleteIOUReport && updatedReportPreviewAction?.childMoneyRequestCount === 0) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport?.reportID}`,
            value: {
                hasOutstandingChildRequest: hasOutstandingChildRequest(chatReport, updatedIOUReport, currentUserEmail, allTransactionViolationsParam, undefined),
            },
        });
    }

    if (shouldDeleteIOUReport) {
        let canUserPerformWriteAction = true;
        if (chatReport) {
            canUserPerformWriteAction = !!canUserPerformWriteActionReportUtils(chatReport, isChatIOUReportArchived);
        }

        const optimisticReportActions = reportPreviewAction?.reportActionID ? {[reportPreviewAction.reportActionID]: null} : {};
        const optimisticLastReportData = optimisticReportLastData(iouReport?.chatReportID ?? String(CONST.DEFAULT_NUMBER_ID), optimisticReportActions, canUserPerformWriteAction);

        if (chatReport) {
            optimisticData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport?.reportID}`,
                value: {
                    hasOutstandingChildRequest: hasOutstandingChildRequest(chatReport, iouReport?.reportID, currentUserEmail, allTransactionViolationsParam, undefined),
                    iouReportID: null,
                    ...optimisticLastReportData,
                },
            });
        }
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport?.reportID}`,
            value: {
                reportID: null,
                pendingFields: {
                    preview: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                },
            },
        });
    }

    const successData: OnyxUpdate[] = [
        shouldDeleteIOUReport
            ? {
                  onyxMethod: Onyx.METHOD.SET,
                  key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport?.reportID}`,
                  value: null,
              }
            : {
                  onyxMethod: Onyx.METHOD.MERGE,
                  key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport?.reportID}`,
                  value: {
                      [reportAction.reportActionID]: {
                          pendingAction: null,
                      },
                  },
              },
    ];

    if (reportPreviewAction?.reportActionID) {
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport?.reportID}`,
            value: {
                [reportPreviewAction.reportActionID]: {
                    pendingAction: null,
                    errors: null,
                },
            },
        });
    }

    // Ensure that any remaining data is removed upon successful completion, even if the server sends a report removal response.
    // This is done to prevent the removal update from lingering in the applyHTTPSOnyxUpdates function.
    if (shouldDeleteTransactionThread && transactionThread) {
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${transactionThreadID}`,
            value: null,
        });
    }

    if (shouldDeleteIOUReport) {
        successData.push({
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport?.reportID}`,
            value: null,
        });
    }

    successData.push({
        onyxMethod: Onyx.METHOD.SET,
        key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
        value: null,
    });

    failureData.push({
        onyxMethod: Onyx.METHOD.SET,
        key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`,
        value: transactionViolations ?? null,
    });

    if (shouldDeleteTransactionThread) {
        failureData.push({
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT}${transactionThreadID}`,
            value: transactionThread,
        });
    }

    const errorKey = DateUtils.getMicroseconds();

    const originalReportActionsUpdate = {} as Record<string, Partial<OnyxTypes.ReportAction>>;
    if (shouldDeleteIOUReport) {
        for (const action of Object.values(iouReportActions ?? {})) {
            if (action.reportActionID === reportAction.reportActionID) {
                continue;
            }
            originalReportActionsUpdate[action.reportActionID] = {
                pendingAction: action.pendingAction ?? null,
                message: action.message,
            };
        }
    }
    failureData.push(
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport?.reportID}`,
            value: {
                ...originalReportActionsUpdate,
                [reportAction.reportActionID]: {
                    ...reportAction,
                    pendingAction: null,
                    errors: getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericDeleteFailureMessage', errorKey),
                },
            },
        },
        // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
        shouldDeleteIOUReport
            ? {
                  onyxMethod: Onyx.METHOD.SET,
                  key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport?.reportID}`,
                  value: iouReport,
              }
            : {
                  onyxMethod: Onyx.METHOD.MERGE,
                  key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport?.reportID}`,
                  value: iouReport,
              },
    );

    if (reportPreviewAction?.reportActionID) {
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport?.reportID}`,
            value: {
                [reportPreviewAction.reportActionID]: {
                    ...reportPreviewAction,
                    pendingAction: null,
                    errors: getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericDeleteFailureMessage', errorKey),
                },
            },
        });
    }

    if (chatReport && shouldDeleteIOUReport) {
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`,
            value: chatReport,
        });
    }

    if (!shouldDeleteIOUReport && updatedReportPreviewAction?.childMoneyRequestCount === 0) {
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport?.reportID}`,
            value: {
                hasOutstandingChildRequest: true,
            },
        });
    }

    if (hash && shouldDeleteIOUReport) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}`,
            value: {
                data: {
                    [`${ONYXKEYS.COLLECTION.REPORT}${iouReport?.reportID}`]: {
                        pendingFields: {
                            // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
                            preview: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                        },
                    },
                },
            },
        });
    }

    const parameters: DeleteMoneyRequestParams = {
        transactionID,
        reportActionID: reportAction.reportActionID,
    };

    // STEP 3: Make the API request
    API.write(WRITE_COMMANDS.DELETE_MONEY_REQUEST, parameters, {optimisticData, successData, failureData});
    clearPdfByOnyxKey(transactionID);

    return urlToNavigateBack;
}

function deleteTrackExpense({
    chatReportID,
    chatReport,
    transactionID,
    reportAction,
    iouReport,
    chatIOUReport,
    transactions,
    violations,
    isSingleTransactionView = false,
    isChatReportArchived,
    isChatIOUReportArchived,
    allTransactionViolationsParam,
}: DeleteTrackExpenseParams) {
    if (!chatReportID || !transactionID) {
        return;
    }

    const urlToNavigateBack = getNavigationUrlAfterTrackExpenseDelete(
        chatReportID,
        chatReport,
        transactionID,
        reportAction,
        iouReport,
        chatIOUReport,
        isSingleTransactionView,
        isChatIOUReportArchived,
    );

    // STEP 1: Get all collections we're updating
    if (!isSelfDM(chatReport)) {
        deleteMoneyRequest({
            transactionID,
            reportAction,
            transactions,
            violations,
            iouReport,
            chatReport: chatIOUReport,
            isChatIOUReportArchived,
            isSingleTransactionView,
            allTransactionViolationsParam,
        });
        return urlToNavigateBack;
    }

    const whisperAction = getTrackExpenseActionableWhisper(transactionID, chatReportID);
    const actionableWhisperReportActionID = whisperAction?.reportActionID;
    const {parameters, optimisticData, successData, failureData} = getDeleteTrackExpenseInformation(
        chatReportID,
        transactionID,
        reportAction,
        isChatReportArchived,
        undefined,
        undefined,
        actionableWhisperReportActionID,
        CONST.REPORT.ACTIONABLE_TRACK_EXPENSE_WHISPER_RESOLUTION.NOTHING,
        false,
    );

    // STEP 6: Make the API request
    API.write(WRITE_COMMANDS.DELETE_MONEY_REQUEST, parameters, {optimisticData, successData, failureData});
    clearPdfByOnyxKey(transactionID);

    // STEP 7: Navigate the user depending on which page they are on and which resources were deleted
    return urlToNavigateBack;
}

type OptimisticHoldReportExpenseActionID = {
    optimisticReportActionID: string;
    oldReportActionID: string;
};

function getHoldReportActionsAndTransactions(reportID: string | undefined) {
    const iouReportActions = getAllReportActions(reportID);
    const holdReportActions: Array<OnyxTypes.ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU>> = [];
    const holdTransactions: OnyxTypes.Transaction[] = [];

    for (const action of Object.values(iouReportActions)) {
        const transactionID = isMoneyRequestAction(action) ? getOriginalMessage(action)?.IOUTransactionID : undefined;
        const transaction = allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];

        if (transaction?.comment?.hold) {
            holdReportActions.push(action as OnyxTypes.ReportAction<typeof CONST.REPORT.ACTIONS.TYPE.IOU>);
            holdTransactions.push(transaction);
        }
    }

    return {holdReportActions, holdTransactions};
}

type OptimisticReportActionCopyIDs = Record<string, string>;

/**
 * Gets duplicate workflow actions for a partial expense report.
 * Used when splitting held expenses into a new partial report to maintain action history.
 *
 * @param sourceReportID - The ID of the original report to copy actions from
 * @param targetReportID - The ID of the new partial expense report to copy actions to
 * @returns A tuple of [optimisticData, successData, failureData, duplicatedReportActionIDs]
 */
function getDuplicateActionsForPartialReport(
    sourceReportID: string | undefined,
    targetReportID: string | undefined,
): [
    Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>>,
    Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>>,
    Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>>,
    OptimisticReportActionCopyIDs,
] {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [];
    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [];
    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [];
    const optimisticReportActionCopyIDs: OptimisticReportActionCopyIDs = {};

    if (!sourceReportID || !targetReportID) {
        return [optimisticData, successData, failureData, optimisticReportActionCopyIDs];
    }

    const sourceReportActions = getAllReportActions(sourceReportID);

    // Match the backend's WORKFLOW_ACTIONS list
    const workflowActionTypes = [
        CONST.REPORT.ACTIONS.TYPE.SUBMITTED,
        CONST.REPORT.ACTIONS.TYPE.SUBMITTED_AND_CLOSED,
        CONST.REPORT.ACTIONS.TYPE.APPROVED,
        CONST.REPORT.ACTIONS.TYPE.UNAPPROVED,
        CONST.REPORT.ACTIONS.TYPE.REJECTED,
        CONST.REPORT.ACTIONS.TYPE.RETRACTED,
        CONST.REPORT.ACTIONS.TYPE.CLOSED,
        CONST.REPORT.ACTIONS.TYPE.REOPENED,
        CONST.REPORT.ACTIONS.TYPE.FORWARDED,
        CONST.REPORT.ACTIONS.TYPE.TAKE_CONTROL,
        CONST.REPORT.ACTIONS.TYPE.REROUTE,
    ] as const;

    const copiedActions: Record<string, OnyxTypes.ReportAction> = {};
    const copiedActionsSuccess: OnyxCollection<NullishDeep<ReportAction>> = {};
    const copiedActionsFailure: Record<string, null> = {};

    for (const action of Object.values(sourceReportActions)) {
        if (action && (workflowActionTypes as readonly string[]).includes(action.actionName)) {
            const newActionID = NumberUtils.rand64();
            copiedActions[newActionID] = {
                ...action,
                reportActionID: newActionID,
                reportID: targetReportID,
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            };
            copiedActionsSuccess[newActionID] = {
                pendingAction: null,
            };
            copiedActionsFailure[newActionID] = null;
            optimisticReportActionCopyIDs[action.reportActionID] = newActionID;
        }
    }

    if (Object.keys(copiedActions).length > 0) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${targetReportID}`,
            value: copiedActions,
        });

        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${targetReportID}`,
            value: copiedActionsSuccess,
        });

        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${targetReportID}`,
            value: copiedActionsFailure,
        });
    }

    return [optimisticData, successData, failureData, optimisticReportActionCopyIDs];
}

function getReportFromHoldRequestsOnyxData({
    chatReport,
    iouReport,
    recipient,
    policy,
    createdTimestamp,
    isApprovalFlow = false,
}: {
    chatReport: OnyxTypes.Report;
    iouReport: OnyxEntry<OnyxTypes.Report>;
    recipient: Participant;
    policy: OnyxEntry<OnyxTypes.Policy>;
    createdTimestamp?: string;
    isApprovalFlow?: boolean;
}): {
    optimisticHoldReportID: string;
    optimisticHoldActionID: string;
    optimisticCreatedReportForUnapprovedTransactionsActionID: string | undefined;
    optimisticHoldReportExpenseActionIDs: OptimisticHoldReportExpenseActionID[];
    optimisticReportActionCopyIDs: OptimisticReportActionCopyIDs;
    optimisticData: OnyxUpdate[];
    successData: OnyxUpdate[];
    failureData: OnyxUpdate[];
} {
    const {holdReportActions, holdTransactions} = getHoldReportActionsAndTransactions(iouReport?.reportID);
    const firstHoldTransaction = holdTransactions.at(0);
    const newParentReportActionID = NumberUtils.rand64();

    const coefficient = isExpenseReport(iouReport) ? -1 : 1;
    const isPolicyExpenseChat = isPolicyExpenseChatReportUtil(chatReport);
    const holdAmount = ((iouReport?.total ?? 0) - (iouReport?.unheldTotal ?? 0)) * coefficient;
    const holdNonReimbursableAmount = ((iouReport?.nonReimbursableTotal ?? 0) - (iouReport?.unheldNonReimbursableTotal ?? 0)) * coefficient;

    // Pass held transactions for formula computation (e.g., {report:startdate})
    const reportTransactions: Record<string, OnyxTypes.Transaction> = {};
    for (const holdTransaction of holdTransactions) {
        if (holdTransaction?.transactionID) {
            reportTransactions[holdTransaction.transactionID] = holdTransaction;
        }
    }

    const optimisticExpenseReport = isPolicyExpenseChat
        ? buildOptimisticExpenseReport(
              chatReport.reportID,
              chatReport.policyID ?? iouReport?.policyID,
              recipient.accountID ?? 1,
              holdAmount,
              iouReport?.currency ?? '',
              holdNonReimbursableAmount,
              newParentReportActionID,
              undefined,
              reportTransactions,
              createdTimestamp,
          )
        : buildOptimisticIOUReport(
              iouReport?.ownerAccountID ?? CONST.DEFAULT_NUMBER_ID,
              iouReport?.managerID ?? CONST.DEFAULT_NUMBER_ID,
              holdAmount,
              chatReport.reportID,
              iouReport?.currency ?? '',
              false,
              newParentReportActionID,
              undefined,
              createdTimestamp,
          );

    const optimisticExpenseReportPreview = buildOptimisticReportPreview(
        chatReport,
        optimisticExpenseReport,
        '',
        firstHoldTransaction,
        optimisticExpenseReport.reportID,
        newParentReportActionID,
    );

    let optimisticCreatedReportForUnapprovedAction: ReportAction | null = null;
    if (isApprovalFlow) {
        optimisticCreatedReportForUnapprovedAction = buildOptimisticCreatedReportForUnapprovedAction(optimisticExpenseReport.reportID, iouReport?.reportID);
    }

    const updateHeldReports: Record<string, Pick<OnyxTypes.Report, 'parentReportActionID' | 'parentReportID' | 'chatReportID'>> = {};
    const addHoldReportActions: OnyxTypes.ReportActions = {};
    const addHoldReportActionsSuccess: OnyxCollection<NullishDeep<ReportAction>> = {};
    const deleteHoldReportActions: Record<string, Pick<OnyxTypes.ReportAction, 'message'>> = {};
    const optimisticHoldReportExpenseActionIDs: OptimisticHoldReportExpenseActionID[] = [];

    for (const holdReportAction of holdReportActions) {
        // eslint-disable-next-line @typescript-eslint/non-nullable-type-assertion-style
        const originalMessage = getOriginalMessage(holdReportAction) as OnyxTypes.OriginalMessageIOU;

        deleteHoldReportActions[holdReportAction.reportActionID] = {
            message: [
                {
                    deleted: DateUtils.getDBTime(),
                    type: CONST.REPORT.MESSAGE.TYPE.TEXT,
                    text: '',
                },
            ],
        };

        const reportActionID = NumberUtils.rand64();
        addHoldReportActions[reportActionID] = {
            ...holdReportAction,
            reportActionID,
            originalMessage: {
                ...originalMessage,
                IOUReportID: optimisticExpenseReport.reportID,
            },
            pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        };
        addHoldReportActionsSuccess[reportActionID] = {
            pendingAction: null,
        };

        optimisticHoldReportExpenseActionIDs.push({optimisticReportActionID: reportActionID, oldReportActionID: holdReportAction.reportActionID});

        const heldReport = getReportOrDraftReport(holdReportAction.childReportID);
        if (heldReport) {
            updateHeldReports[`${ONYXKEYS.COLLECTION.REPORT}${heldReport.reportID}`] = {
                parentReportActionID: reportActionID,
                parentReportID: optimisticExpenseReport.reportID,
                chatReportID: optimisticExpenseReport.reportID,
            };
        }
    }

    const updateHeldTransactions: Record<string, Pick<OnyxTypes.Transaction, 'reportID'>> = {};
    for (const transaction of holdTransactions) {
        updateHeldTransactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`] = {
            reportID: optimisticExpenseReport.reportID,
        };
    }

    const isApprovalEnabled = policy ? policy.approvalMode && policy.approvalMode !== CONST.POLICY.APPROVAL_MODE.OPTIONAL : false;

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.TRANSACTION>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`,
            value: {
                iouReportID: optimisticExpenseReport.reportID,
                lastVisibleActionCreated: optimisticExpenseReportPreview.created,
            },
        },
        // add new optimistic expense report
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${optimisticExpenseReport.reportID}`,
            value: {
                ...optimisticExpenseReport,
                unheldTotal: 0,
                unheldNonReimbursableTotal: 0,
                ...(isProcessingReport(iouReport) && isApprovalEnabled
                    ? {
                          stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                          statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                      }
                    : {}),
            },
        },
        // add preview report action to main chat
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport.reportID}`,
            value: {
                [optimisticExpenseReportPreview.reportActionID]: optimisticExpenseReportPreview,
            },
        },
        // remove hold report actions from old iou report
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport?.reportID}`,
            value: deleteHoldReportActions,
        },
        // add hold report actions to new iou report
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${optimisticExpenseReport.reportID}`,
            value: addHoldReportActions,
        },
        // update held reports with new parentReportActionID
        {
            onyxMethod: Onyx.METHOD.MERGE_COLLECTION,
            key: `${ONYXKEYS.COLLECTION.REPORT}`,
            value: updateHeldReports,
        },
        // update transactions with new iouReportID
        {
            onyxMethod: Onyx.METHOD.MERGE_COLLECTION,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}`,
            value: updateHeldTransactions,
        },
    ];

    const bringReportActionsBack: Record<string, OnyxTypes.ReportAction> = {};
    for (const reportAction of holdReportActions) {
        bringReportActionsBack[reportAction.reportActionID] = reportAction;
    }

    const bringHeldTransactionsBack: Record<string, OnyxTypes.Transaction> = {};
    for (const transaction of holdTransactions) {
        bringHeldTransactionsBack[`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`] = transaction;
    }

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport.reportID}`,
            value: {
                [optimisticExpenseReportPreview.reportActionID]: {
                    pendingAction: null,
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${optimisticExpenseReport.reportID}`,
            value: addHoldReportActionsSuccess,
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.TRANSACTION>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`,
            value: {
                iouReportID: chatReport.iouReportID,
                lastVisibleActionCreated: chatReport.lastVisibleActionCreated,
            },
        },
        // remove added optimistic expense report
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${optimisticExpenseReport.reportID}`,
            value: null,
        },
        // remove preview report action from the main chat
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport.reportID}`,
            value: {
                [optimisticExpenseReportPreview.reportActionID]: null,
            },
        },
        // add hold report actions back to old iou report
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport?.reportID}`,
            value: bringReportActionsBack,
        },
        // remove hold report actions from the new iou report
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${optimisticExpenseReport.reportID}`,
            value: null,
        },
        // add hold transactions back to old iou report
        {
            onyxMethod: Onyx.METHOD.MERGE_COLLECTION,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}`,
            value: bringHeldTransactionsBack,
        },
    ];

    // Copy submission/approval actions to the new report
    const [copiedActionsOptimistic, copiedActionsSuccess, copiedActionsFailure, optimisticReportActionCopyIDs] = getDuplicateActionsForPartialReport(
        iouReport?.reportID,
        optimisticExpenseReport.reportID,
    );
    // Only copy the report action for approval flow
    if (isApprovalFlow && !isEmptyObject(optimisticReportActionCopyIDs)) {
        optimisticData.push(...copiedActionsOptimistic);
        successData.push(...copiedActionsSuccess);
        failureData.push(...copiedActionsFailure);
    }
    // add optimistic system message explaining the created report for unapproved transactions
    if (isApprovalFlow && optimisticCreatedReportForUnapprovedAction) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${optimisticExpenseReport.reportID}`,
            value: {
                [optimisticCreatedReportForUnapprovedAction.reportActionID]: optimisticCreatedReportForUnapprovedAction,
            },
        });

        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${optimisticExpenseReport.reportID}`,
            value: {
                [optimisticCreatedReportForUnapprovedAction.reportActionID]: {
                    pendingAction: null,
                    isOptimisticAction: null,
                },
            },
        });

        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${optimisticExpenseReport.reportID}`,
            value: {
                [optimisticCreatedReportForUnapprovedAction.reportActionID]: null,
            },
        });
    }

    return {
        optimisticData,
        optimisticHoldActionID: optimisticExpenseReportPreview.reportActionID,
        optimisticCreatedReportForUnapprovedTransactionsActionID: optimisticCreatedReportForUnapprovedAction?.reportActionID,
        failureData,
        successData,
        optimisticHoldReportID: optimisticExpenseReport.reportID,
        optimisticHoldReportExpenseActionIDs,
        optimisticReportActionCopyIDs,
    };
}

function getPayMoneyRequestParams({
    initialChatReport,
    iouReport,
    recipient,
    paymentMethodType,
    full,
    reportPolicy,
    payAsBusiness,
    bankAccountID,
    currentUserAccountIDParam,
    currentUserEmailParam,
    introSelected,
    paymentPolicyID,
    lastUsedPaymentMethod,
    existingB2BInvoiceReport,
    activePolicy,
    iouReportCurrentNextStepDeprecated,
}: {
    initialChatReport: OnyxTypes.Report;
    iouReport: OnyxEntry<OnyxTypes.Report>;
    recipient: Participant;
    paymentMethodType: PaymentMethodType;
    full: boolean;
    reportPolicy?: OnyxEntry<OnyxTypes.Policy>;
    payAsBusiness?: boolean;
    bankAccountID?: number;
    paymentPolicyID?: string | undefined;
    lastUsedPaymentMethod?: OnyxTypes.LastPaymentMethodType;
    existingB2BInvoiceReport?: OnyxEntry<OnyxTypes.Report>;
    activePolicy?: OnyxEntry<OnyxTypes.Policy>;
    currentUserAccountIDParam?: number;
    currentUserEmailParam?: string;
    introSelected?: OnyxEntry<OnyxTypes.IntroSelected>;
    iouReportCurrentNextStepDeprecated: OnyxEntry<OnyxTypes.ReportNextStepDeprecated>;
}): PayMoneyRequestData {
    const isInvoiceReport = isInvoiceReportReportUtils(iouReport);
    let payerPolicyID = activePolicy?.id;
    let chatReport = initialChatReport;
    let policyParams = {};
    const optimisticData: OnyxUpdate[] = [];
    const successData: OnyxUpdate[] = [];
    const failureData: OnyxUpdate[] = [];
    const shouldCreatePolicy = !activePolicy || !isPolicyAdmin(activePolicy) || !isPaidGroupPolicy(activePolicy);

    if (isIndividualInvoiceRoom(chatReport) && payAsBusiness && shouldCreatePolicy) {
        payerPolicyID = generatePolicyID();
        const {
            optimisticData: policyOptimisticData,
            failureData: policyFailureData,
            successData: policySuccessData,
            params,
        } = buildPolicyData({
            policyOwnerEmail: currentUserEmail,
            makeMeAdmin: true,
            policyID: payerPolicyID,
            currentUserAccountIDParam: currentUserAccountIDParam ?? CONST.DEFAULT_NUMBER_ID,
            currentUserEmailParam: currentUserEmailParam ?? '',
            introSelected,
            activePolicyID: activePolicy?.id,
            companySize: introSelected?.companySize as OnboardingCompanySize,
        });
        const {adminsChatReportID, adminsCreatedReportActionID, expenseChatReportID, expenseCreatedReportActionID, customUnitRateID, customUnitID, ownerEmail, policyName} = params;

        policyParams = {
            policyID: payerPolicyID,
            adminsChatReportID,
            adminsCreatedReportActionID,
            expenseChatReportID,
            expenseCreatedReportActionID,
            customUnitRateID,
            customUnitID,
            ownerEmail,
            policyName,
        };

        optimisticData.push(...policyOptimisticData, {onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.NVP_ACTIVE_POLICY_ID, value: payerPolicyID});
        successData.push(...policySuccessData);
        failureData.push(...policyFailureData, {onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.NVP_ACTIVE_POLICY_ID, value: activePolicy?.id ?? null});
    }

    if (isIndividualInvoiceRoom(chatReport) && payAsBusiness && existingB2BInvoiceReport) {
        chatReport = existingB2BInvoiceReport;
    }

    let total = (iouReport?.total ?? 0) - (iouReport?.nonReimbursableTotal ?? 0);
    if (hasHeldExpensesReportUtils(iouReport?.reportID) && !full && !!iouReport?.unheldTotal) {
        total = iouReport.unheldTotal - (iouReport?.unheldNonReimbursableTotal ?? 0);
    }

    const optimisticIOUReportAction = buildOptimisticIOUReportAction({
        type: CONST.IOU.REPORT_ACTION_TYPE.PAY,
        amount: isExpenseReport(iouReport) ? -total : total,
        currency: iouReport?.currency ?? '',
        comment: '',
        participants: [recipient],
        transactionID: '',
        paymentType: paymentMethodType,
        iouReportID: iouReport?.reportID,
        isSettlingUp: true,
        payAsBusiness,
        bankAccountID,
    });

    // In some instances, the report preview action might not be available to the payer (only whispered to the requestor)
    // hence we need to make the updates to the action safely.
    let optimisticReportPreviewAction = null;
    const reportPreviewAction = getReportPreviewAction(chatReport.reportID, iouReport?.reportID);
    if (reportPreviewAction) {
        optimisticReportPreviewAction = updateReportPreview(iouReport, reportPreviewAction, true);
    }
    let currentNextStepDeprecated = null;
    let optimisticNextStepDeprecated = null;
    let optimisticNextStep = null;
    if (!isInvoiceReport) {
        currentNextStepDeprecated = iouReportCurrentNextStepDeprecated ?? null;
        // buildOptimisticNextStep is used in parallel
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        optimisticNextStepDeprecated = buildNextStepNew({report: iouReport, predictedNextStatus: CONST.REPORT.STATUS_NUM.REIMBURSED});
        optimisticNextStep = buildOptimisticNextStep({report: iouReport, predictedNextStatus: CONST.REPORT.STATUS_NUM.REIMBURSED});
    }

    const optimisticChatReport = {
        ...chatReport,
        lastReadTime: DateUtils.getDBTime(),
        hasOutstandingChildRequest: hasOutstandingChildRequest(chatReport, iouReport?.reportID, currentUserEmail, allTransactionViolations, undefined),
        iouReportID: null,
        lastMessageText: getReportActionText(optimisticIOUReportAction),
        lastMessageHtml: getReportActionHtml(optimisticIOUReportAction),
    };
    if (isIndividualInvoiceRoom(chatReport) && payAsBusiness && payerPolicyID) {
        optimisticChatReport.invoiceReceiver = {
            type: CONST.REPORT.INVOICE_RECEIVER_TYPE.BUSINESS,
            policyID: payerPolicyID,
        };
    }

    optimisticData.push(
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`,
            value: optimisticChatReport,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport?.reportID}`,
            value: {
                [optimisticIOUReportAction.reportActionID]: {
                    ...(optimisticIOUReportAction as OnyxTypes.ReportAction),
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport?.reportID}`,
            value: {
                lastMessageText: getReportActionText(optimisticIOUReportAction),
                lastMessageHtml: getReportActionHtml(optimisticIOUReportAction),
                lastVisibleActionCreated: optimisticIOUReportAction.created,
                hasOutstandingChildRequest: false,
                statusNum: CONST.REPORT.STATUS_NUM.REIMBURSED,
                stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                pendingFields: {
                    preview: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    reimbursed: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    partial: full ? null : CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    nextStep: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
                nextStep: optimisticNextStep,
                errors: null,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.NEXT_STEP}${iouReport?.reportID}`,
            value: optimisticNextStepDeprecated,
        },
    );

    if (iouReport?.policyID) {
        const prevLastUsedPaymentMethod = lastUsedPaymentMethod?.lastUsed?.name;
        const usedPaymentOption = paymentPolicyID ?? paymentMethodType;

        const optimisticLastPaymentMethod = {
            [iouReport.policyID]: {
                ...(iouReport.type ? {[iouReport.type]: {name: usedPaymentOption}} : {}),
                ...(isInvoiceReport ? {invoice: {name: paymentMethodType, bankAccountID}} : {}),
                lastUsed: {
                    name: prevLastUsedPaymentMethod !== usedPaymentOption && !!prevLastUsedPaymentMethod ? prevLastUsedPaymentMethod : usedPaymentOption,
                },
            },
        };

        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_LAST_PAYMENT_METHOD,
            value: optimisticLastPaymentMethod,
        });
    }

    successData.push(
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport?.reportID}`,
            value: {
                pendingFields: {
                    preview: null,
                    reimbursed: null,
                    partial: null,
                    nextStep: null,
                },
                errors: null,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport?.reportID}`,
            value: {
                [optimisticIOUReportAction.reportActionID]: {
                    pendingAction: null,
                },
            },
        },
    );

    failureData.push(
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport?.reportID}`,
            value: {
                [optimisticIOUReportAction.reportActionID]: {
                    errors: getMicroSecondOnyxErrorWithTranslationKey('iou.error.other'),
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport?.reportID}`,
            value: {
                ...iouReport,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`,
            value: chatReport,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.NEXT_STEP}${iouReport?.reportID}`,
            value: currentNextStepDeprecated,
        },
    );

    // In case the report preview action is loaded locally, let's update it.
    if (optimisticReportPreviewAction) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport.reportID}`,
            value: {
                [optimisticReportPreviewAction.reportActionID]: optimisticReportPreviewAction,
            },
        });
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport.reportID}`,
            value: {
                [optimisticReportPreviewAction.reportActionID]: {
                    created: optimisticReportPreviewAction.created,
                },
            },
        });
    }

    // Optimistically unhold all transactions if we pay all requests
    if (full) {
        const reportTransactions = getReportTransactions(iouReport?.reportID);
        for (const transaction of reportTransactions) {
            optimisticData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`,
                value: {
                    comment: {
                        hold: null,
                    },
                },
            });
            failureData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`,
                value: {
                    comment: {
                        hold: transaction.comment?.hold,
                    },
                },
            });
        }

        const optimisticTransactionViolations: OnyxUpdate[] = reportTransactions.map(({transactionID}) => {
            return {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`,
                value: null,
            };
        });
        optimisticData.push(...optimisticTransactionViolations);

        const failureTransactionViolations: OnyxUpdate[] = reportTransactions.map(({transactionID}) => {
            const violations = allTransactionViolations[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`] ?? [];
            return {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`,
                value: violations,
            };
        });
        failureData.push(...failureTransactionViolations);
    }

    let optimisticHoldReportID;
    let optimisticHoldActionID;
    let optimisticHoldReportExpenseActionIDs;
    if (!full) {
        const holdReportOnyxData = getReportFromHoldRequestsOnyxData({chatReport, iouReport, recipient, policy: reportPolicy});

        optimisticData.push(...holdReportOnyxData.optimisticData);
        successData.push(...holdReportOnyxData.successData);
        failureData.push(...holdReportOnyxData.failureData);
        optimisticHoldReportID = holdReportOnyxData.optimisticHoldReportID;
        optimisticHoldActionID = holdReportOnyxData.optimisticHoldActionID;
        optimisticHoldReportExpenseActionIDs = JSON.stringify(holdReportOnyxData.optimisticHoldReportExpenseActionIDs);
    }

    return {
        params: {
            iouReportID: iouReport?.reportID,
            chatReportID: chatReport.reportID,
            reportActionID: optimisticIOUReportAction.reportActionID,
            paymentMethodType,
            full,
            amount: Math.abs(total),
            optimisticHoldReportID,
            optimisticHoldActionID,
            optimisticHoldReportExpenseActionIDs,
            ...policyParams,
        },
        optimisticData,
        successData,
        failureData,
    };
}

function canApproveIOU(iouReport: OnyxTypes.OnyxInputOrEntry<OnyxTypes.Report>, policy: OnyxTypes.OnyxInputOrEntry<OnyxTypes.Policy>, iouTransactions?: OnyxTypes.Transaction[]) {
    // Only expense reports can be approved
    if (!isExpenseReport(iouReport) || !(policy && isPaidGroupPolicy(policy))) {
        return false;
    }

    const isOnSubmitAndClosePolicy = isSubmitAndClose(policy);
    if (isOnSubmitAndClosePolicy) {
        return false;
    }

    const managerID = iouReport?.managerID ?? CONST.DEFAULT_NUMBER_ID;
    const isCurrentUserManager = managerID === userAccountID;
    const isOpenExpenseReport = isOpenExpenseReportReportUtils(iouReport);
    const isApproved = isReportApproved({report: iouReport});
    const iouSettled = isSettled(iouReport);
    const reportNameValuePairs = allReportNameValuePairs?.[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${iouReport?.reportID}`];
    const isArchivedExpenseReport = isArchivedReport(reportNameValuePairs);
    const reportTransactions = iouTransactions ?? getReportTransactions(iouReport?.reportID);
    const hasOnlyPendingCardOrScanningTransactions = reportTransactions.length > 0 && reportTransactions.every((transaction) => isScanning(transaction) || isPending(transaction));
    if (hasOnlyPendingCardOrScanningTransactions) {
        return false;
    }
    const isPayAtEndExpenseReport = isPayAtEndExpenseReportReportUtils(iouReport ?? undefined, reportTransactions);
    const isClosedReport = isClosedReportUtil(iouReport);
    return (
        reportTransactions.length > 0 && isCurrentUserManager && !isOpenExpenseReport && !isApproved && !iouSettled && !isArchivedExpenseReport && !isPayAtEndExpenseReport && !isClosedReport
    );
}

function canUnapproveIOU(iouReport: OnyxEntry<OnyxTypes.Report>, policy: OnyxEntry<OnyxTypes.Policy>) {
    return (
        isExpenseReport(iouReport) &&
        (isReportManager(iouReport) || isPolicyAdmin(policy)) &&
        isReportApproved({report: iouReport}) &&
        !isSubmitAndClose(policy) &&
        !iouReport?.isWaitingOnBankAccount
    );
}

function canIOUBePaid(
    iouReport: OnyxTypes.OnyxInputOrEntry<OnyxTypes.Report>,
    chatReport: OnyxTypes.OnyxInputOrEntry<OnyxTypes.Report>,
    policy: OnyxTypes.OnyxInputOrEntry<OnyxTypes.Policy>,
    bankAccountList: OnyxEntry<OnyxTypes.BankAccountList>,
    transactions?: OnyxTypes.Transaction[],
    onlyShowPayElsewhere = false,
    chatReportRNVP?: OnyxTypes.ReportNameValuePairs,
    invoiceReceiverPolicy?: OnyxTypes.Policy,
) {
    const reportNameValuePairs = chatReportRNVP ?? allReportNameValuePairs?.[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${chatReport?.reportID}`];
    const isChatReportArchived = isArchivedReport(reportNameValuePairs);
    const iouSettled = isSettled(iouReport);

    if (isEmptyObject(iouReport)) {
        return false;
    }

    if (policy?.reimbursementChoice === CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO) {
        if (!onlyShowPayElsewhere) {
            return false;
        }
        if (iouReport?.statusNum !== CONST.REPORT.STATUS_NUM.SUBMITTED) {
            return false;
        }
    }

    if (isInvoiceReportReportUtils(iouReport)) {
        if (isChatReportArchived || iouSettled || isOpenInvoiceReportReportUtils(iouReport)) {
            return false;
        }
        if (chatReport?.invoiceReceiver?.type === CONST.REPORT.INVOICE_RECEIVER_TYPE.INDIVIDUAL) {
            return chatReport?.invoiceReceiver?.accountID === userAccountID;
        }
        // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        return (invoiceReceiverPolicy ?? getPolicy(chatReport?.invoiceReceiver?.policyID))?.role === CONST.POLICY.ROLE.ADMIN;
    }

    const isPayer = isPayerReportUtils(userAccountID, currentUserEmail, iouReport, bankAccountList, policy, onlyShowPayElsewhere);

    const {reimbursableSpend} = getMoneyRequestSpendBreakdown(iouReport);
    const isAutoReimbursable = policy?.reimbursementChoice === CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES ? false : canBeAutoReimbursed(iouReport, policy);
    const isPayAtEndExpenseReport = isPayAtEndExpenseReportReportUtils(iouReport ?? undefined, transactions);
    const isProcessing = isProcessingReport(iouReport);
    const isApprovalEnabled = policy ? policy.approvalMode && policy.approvalMode !== CONST.POLICY.APPROVAL_MODE.OPTIONAL : false;
    const isSubmittedWithoutApprovalsEnabled = !isApprovalEnabled && isProcessing;
    const isApproved = isReportApproved({report: iouReport}) || isSubmittedWithoutApprovalsEnabled;
    const isClosed = isClosedReportUtil(iouReport);
    const isReportFinished = (isApproved || isClosed) && !iouReport?.isWaitingOnBankAccount;
    const isIOU = isIOUReport(iouReport);
    const canShowMarkedAsPaidForNegativeAmount = onlyShowPayElsewhere && reimbursableSpend < 0;

    if (isIOU && isPayer && !iouSettled && reimbursableSpend > 0) {
        return true;
    }

    return (
        isPayer &&
        isReportFinished &&
        !iouSettled &&
        (reimbursableSpend > 0 || canShowMarkedAsPaidForNegativeAmount) &&
        !isChatReportArchived &&
        !isAutoReimbursable &&
        !isPayAtEndExpenseReport &&
        (!isExpenseReport(iouReport) || arePaymentsEnabled(policy as OnyxEntry<OnyxTypes.Policy>))
    );
}

function canCancelPayment(iouReport: OnyxEntry<OnyxTypes.Report>, session: OnyxEntry<OnyxTypes.Session>, bankAccountList: OnyxEntry<OnyxTypes.BankAccountList>) {
    return isPayerReportUtils(session?.accountID, session?.email, iouReport, bankAccountList) && (isSettled(iouReport) || iouReport?.isWaitingOnBankAccount) && isExpenseReport(iouReport);
}

function canSubmitReport(
    report: OnyxEntry<OnyxTypes.Report>,
    policy: OnyxEntry<OnyxTypes.Policy>,
    transactions: OnyxTypes.Transaction[],
    allViolations: OnyxCollection<OnyxTypes.TransactionViolations> | undefined,
    isReportArchived: boolean,
    currentUserEmailParam: string,
) {
    // eslint-disable-next-line @typescript-eslint/no-deprecated -- Temporarily disabling the rule for deprecated functions; it will be removed soon in https://github.com/Expensify/App/issues/73648.
    const currentUserAccountID = getCurrentUserAccountID();
    const isOpenExpenseReport = isOpenExpenseReportReportUtils(report);
    const isAdmin = policy?.role === CONST.POLICY.ROLE.ADMIN;
    const hasAllPendingRTERViolations = allHavePendingRTERViolation(transactions, allViolations, currentUserEmailParam, currentUserAccountID, report, policy);
    const hasTransactionWithoutRTERViolation = hasAnyTransactionWithoutRTERViolation(transactions, allViolations, currentUserEmailParam, currentUserAccountID, report, policy);
    const hasOnlyPendingCardOrScanFailTransactions = transactions.length > 0 && transactions.every((t) => isPendingCardOrScanningTransaction(t));

    return (
        isOpenExpenseReport &&
        (report?.ownerAccountID === currentUserAccountID || report?.managerID === currentUserAccountID || isAdmin) &&
        !hasOnlyPendingCardOrScanFailTransactions &&
        !hasAllPendingRTERViolations &&
        hasTransactionWithoutRTERViolation &&
        !isReportArchived &&
        transactions.length > 0
    );
}

function getIOUReportActionToApproveOrPay(chatReport: OnyxEntry<OnyxTypes.Report>, updatedIouReport: OnyxEntry<OnyxTypes.Report>): OnyxEntry<ReportAction> {
    const chatReportActions = allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport?.reportID}`] ?? {};

    return Object.values(chatReportActions).find((action) => {
        if (!action) {
            return false;
        }
        const iouReport = updatedIouReport?.reportID === action.childReportID ? updatedIouReport : getReportOrDraftReport(action.childReportID);
        // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        const policy = getPolicy(iouReport?.policyID);
        // Only show to the actual payer, exclude admins with bank account access
        const shouldShowSettlementButton = canIOUBePaid(iouReport, chatReport, policy, undefined) || canApproveIOU(iouReport, policy);
        return action.actionName === CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW && shouldShowSettlementButton && !isDeletedAction(action);
    });
}

/**
 * Gets the original creation timestamp from a report's CREATED action or falls back to report.created
 */
function getReportOriginalCreationTimestamp(expenseReport?: OnyxEntry<OnyxTypes.Report>): string | undefined {
    if (!expenseReport?.reportID) {
        return undefined;
    }

    const expenseReportActions = getAllReportActions(expenseReport.reportID);
    const createdAction = Object.values(expenseReportActions ?? {}).find((action) => isCreatedAction(action));

    return createdAction?.created ?? expenseReport.created;
}

function approveMoneyRequest(
    expenseReport: OnyxEntry<OnyxTypes.Report>,
    policy: OnyxEntry<OnyxTypes.Policy>,
    currentUserAccountIDParam: number,
    currentUserEmailParam: string,
    hasViolations: boolean,
    isASAPSubmitBetaEnabled: boolean,
    expenseReportCurrentNextStepDeprecated: OnyxEntry<OnyxTypes.ReportNextStepDeprecated>,
    full?: boolean,
) {
    if (!expenseReport) {
        return;
    }

    if (expenseReport.policyID && shouldRestrictUserBillableActions(expenseReport.policyID)) {
        Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(expenseReport.policyID));
        return;
    }

    let total = expenseReport.total ?? 0;
    const hasHeldExpenses = hasHeldExpensesReportUtils(expenseReport.reportID);
    const hasDuplicates = hasDuplicateTransactions(currentUserEmailParam, currentUserAccountIDParam, expenseReport, policy, allTransactionViolations);
    if (hasHeldExpenses && !full && !!expenseReport.unheldTotal) {
        total = expenseReport.unheldTotal;
    }
    const optimisticApprovedReportAction = buildOptimisticApprovedReportAction(total, expenseReport.currency ?? '', expenseReport.reportID);

    const nextApproverAccountID = getNextApproverAccountID(expenseReport);
    const predictedNextStatus = !nextApproverAccountID ? CONST.REPORT.STATUS_NUM.APPROVED : CONST.REPORT.STATUS_NUM.SUBMITTED;
    const predictedNextState = !nextApproverAccountID ? CONST.REPORT.STATE_NUM.APPROVED : CONST.REPORT.STATE_NUM.SUBMITTED;
    const managerID = !nextApproverAccountID ? expenseReport.managerID : nextApproverAccountID;

    // buildOptimisticNextStep is used in parallel
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const optimisticNextStepDeprecated = buildNextStepNew({
        report: expenseReport,
        policy,
        currentUserAccountIDParam,
        currentUserEmailParam,
        hasViolations,
        isASAPSubmitBetaEnabled,
        predictedNextStatus,
    });
    const optimisticNextStep = buildOptimisticNextStep({
        report: expenseReport,
        policy,
        currentUserAccountIDParam,
        currentUserEmailParam,
        hasViolations,
        isASAPSubmitBetaEnabled,
        predictedNextStatus,
    });
    const chatReport = getReportOrDraftReport(expenseReport.chatReportID);

    const optimisticReportActionsData: OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS> = {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.reportID}`,
        value: {
            [optimisticApprovedReportAction.reportActionID]: {
                ...(optimisticApprovedReportAction as OnyxTypes.ReportAction),
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            },
        },
    };
    const updatedExpenseReport = {
        ...expenseReport,
        lastMessageText: getReportActionText(optimisticApprovedReportAction),
        lastMessageHtml: getReportActionHtml(optimisticApprovedReportAction),
        stateNum: predictedNextState,
        statusNum: predictedNextStatus,
        managerID,
        nextStep: optimisticNextStep ?? undefined,
        pendingFields: {
            partial: full ? null : CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
            nextStep: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
        },
    };
    const optimisticIOUReportData: OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT> = {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`,
        value: updatedExpenseReport,
    };

    let optimisticChatReportData: OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT> | undefined;
    if (chatReport) {
        optimisticChatReportData = {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${expenseReport.chatReportID}`,
            value: {
                hasOutstandingChildRequest: hasOutstandingChildRequest(chatReport, updatedExpenseReport, currentUserEmail, allTransactionViolations, undefined),
            },
        };
    }

    const optimisticNextStepData: OnyxUpdate<typeof ONYXKEYS.COLLECTION.NEXT_STEP> = {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.NEXT_STEP}${expenseReport.reportID}`,
        value: optimisticNextStepDeprecated,
    };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const optimisticData: OnyxUpdate[] = [optimisticIOUReportData, optimisticReportActionsData, optimisticNextStepData, ...(optimisticChatReportData ? [optimisticChatReportData] : [])];

    const successData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.reportID}`,
            value: {
                [optimisticApprovedReportAction.reportActionID]: {
                    pendingAction: null,
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`,
            value: {
                pendingFields: {
                    partial: null,
                    nextStep: null,
                },
            },
        },
    ];

    const failureData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.reportID}`,
            value: {
                [optimisticApprovedReportAction.reportActionID]: {
                    errors: getMicroSecondOnyxErrorWithTranslationKey('iou.error.other'),
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${expenseReport.chatReportID}`,
            value: {
                hasOutstandingChildRequest: chatReport?.hasOutstandingChildRequest,
                nextStep: expenseReport.nextStep ?? null,
                pendingFields: {
                    partial: null,
                    nextStep: null,
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.NEXT_STEP}${expenseReport.reportID}`,
            value: expenseReportCurrentNextStepDeprecated ?? null,
        },
    ];

    // Clear hold reason of all transactions if we approve all requests
    if (full && hasHeldExpenses) {
        const heldTransactions = getAllHeldTransactionsReportUtils(expenseReport.reportID);
        for (const heldTransaction of heldTransactions) {
            optimisticData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.TRANSACTION}${heldTransaction.transactionID}`,
                value: {
                    comment: {
                        hold: '',
                    },
                },
            });
            failureData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.TRANSACTION}${heldTransaction.transactionID}`,
                value: {
                    comment: {
                        hold: heldTransaction.comment?.hold,
                    },
                },
            });
        }
    }

    let optimisticHoldReportID;
    let optimisticHoldActionID;
    let optimisticHoldReportExpenseActionIDs;
    let optimisticReportActionCopyIDs;
    let optimisticCreatedReportForUnapprovedTransactionsActionID;
    if (!full && !!chatReport && !!expenseReport) {
        const originalCreated = getReportOriginalCreationTimestamp(expenseReport);
        const holdReportOnyxData = getReportFromHoldRequestsOnyxData({
            chatReport,
            iouReport: expenseReport,
            recipient: {accountID: expenseReport.ownerAccountID},
            policy,
            createdTimestamp: originalCreated,
            isApprovalFlow: true,
        });

        optimisticData.push(...holdReportOnyxData.optimisticData);
        successData.push(...holdReportOnyxData.successData);
        failureData.push(...holdReportOnyxData.failureData);
        optimisticHoldReportID = holdReportOnyxData.optimisticHoldReportID;
        optimisticHoldActionID = holdReportOnyxData.optimisticHoldActionID;
        optimisticCreatedReportForUnapprovedTransactionsActionID = holdReportOnyxData.optimisticCreatedReportForUnapprovedTransactionsActionID;
        optimisticHoldReportExpenseActionIDs = JSON.stringify(holdReportOnyxData.optimisticHoldReportExpenseActionIDs);
        optimisticReportActionCopyIDs = JSON.stringify(holdReportOnyxData.optimisticReportActionCopyIDs);
    }

    // Remove duplicates violations if we approve the report
    if (hasDuplicates) {
        let transactions = getReportTransactions(expenseReport.reportID).filter((transaction) =>
            isDuplicate(
                transaction,
                currentUserEmailParam,
                currentUserAccountIDParam,
                expenseReport,
                policy,
                allTransactionViolations?.[ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS + transaction.transactionID],
            ),
        );
        if (!full) {
            transactions = transactions.filter((transaction) => !isOnHold(transaction));
        }

        for (const transaction of transactions) {
            const transactionViolations = allTransactionViolations?.[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction.transactionID}`] ?? [];
            const newTransactionViolations = transactionViolations.filter((violation) => violation.name !== CONST.VIOLATIONS.DUPLICATED_TRANSACTION);
            optimisticData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction.transactionID}`,
                value: newTransactionViolations,
            });

            failureData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction.transactionID}`,
                value: transactionViolations,
            });
        }
    }

    const parameters: ApproveMoneyRequestParams = {
        reportID: expenseReport.reportID,
        approvedReportActionID: optimisticApprovedReportAction.reportActionID,
        full,
        optimisticHoldReportID,
        optimisticHoldActionID,
        optimisticHoldReportExpenseActionIDs,
        optimisticReportActionCopyIDs,
        optimisticCreatedReportForUnapprovedTransactionsActionID,
    };

    playSound(SOUNDS.SUCCESS);
    API.write(WRITE_COMMANDS.APPROVE_MONEY_REQUEST, parameters, {optimisticData, successData, failureData});
    return optimisticHoldReportID;
}

function reopenReport(
    expenseReport: OnyxEntry<OnyxTypes.Report>,
    policy: OnyxEntry<OnyxTypes.Policy>,
    currentUserAccountIDParam: number,
    currentUserEmailParam: string,
    hasViolations: boolean,
    isASAPSubmitBetaEnabled: boolean,
    expenseReportCurrentNextStepDeprecated: OnyxEntry<OnyxTypes.ReportNextStepDeprecated>,
) {
    if (!expenseReport) {
        return;
    }

    const optimisticReopenedReportAction = buildOptimisticReopenedReportAction();
    const predictedNextState = CONST.REPORT.STATE_NUM.OPEN;
    const predictedNextStatus = CONST.REPORT.STATUS_NUM.OPEN;

    // buildOptimisticNextStep is used in parallel
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const optimisticNextStepDeprecated = buildNextStepNew({
        report: expenseReport,
        predictedNextStatus: CONST.REPORT.STATUS_NUM.OPEN,
        policy,
        currentUserAccountIDParam,
        currentUserEmailParam,
        hasViolations,
        isASAPSubmitBetaEnabled,
        isReopen: true,
    });
    const optimisticNextStep = buildOptimisticNextStep({
        report: expenseReport,
        predictedNextStatus: CONST.REPORT.STATUS_NUM.OPEN,
        policy,
        currentUserAccountIDParam,
        currentUserEmailParam,
        hasViolations,
        isASAPSubmitBetaEnabled,
        isReopen: true,
    });
    const optimisticReportActionsData: OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS> = {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.reportID}`,
        value: {
            [optimisticReopenedReportAction.reportActionID]: {
                ...(optimisticReopenedReportAction as OnyxTypes.ReportAction),
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            },
        },
    };
    const optimisticIOUReportData: OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT> = {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`,
        value: {
            ...expenseReport,
            lastMessageText: getReportActionText(optimisticReopenedReportAction),
            lastMessageHtml: getReportActionHtml(optimisticReopenedReportAction),
            stateNum: predictedNextState,
            statusNum: predictedNextStatus,
            hasReportBeenReopened: true,
            nextStep: optimisticNextStep,
            pendingFields: {
                partial: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                nextStep: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
            },
        },
    };

    const optimisticNextStepData: OnyxUpdate<typeof ONYXKEYS.COLLECTION.NEXT_STEP> = {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.NEXT_STEP}${expenseReport.reportID}`,
        value: optimisticNextStepDeprecated,
    };

    const optimisticData: OnyxUpdate[] = [optimisticIOUReportData, optimisticReportActionsData, optimisticNextStepData];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.REPORT>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.reportID}`,
            value: {
                [optimisticReopenedReportAction.reportActionID]: {
                    pendingAction: null,
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`,
            value: {
                pendingFields: {
                    partial: null,
                    nextStep: null,
                },
            },
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.NEXT_STEP | typeof ONYXKEYS.COLLECTION.REPORT>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.reportID}`,
            value: {
                [optimisticReopenedReportAction.reportActionID]: {
                    errors: getMicroSecondOnyxErrorWithTranslationKey('iou.error.other'),
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.NEXT_STEP}${expenseReport.reportID}`,
            value: expenseReportCurrentNextStepDeprecated ?? null,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`,
            value: {
                stateNum: expenseReport.stateNum,
                statusNum: expenseReport.statusNum,
                hasReportBeenReopened: false,
                nextStep: expenseReport.nextStep ?? null,
                pendingFields: {
                    partial: null,
                    nextStep: null,
                },
            },
        },
    ];

    if (expenseReport.parentReportID && expenseReport.parentReportActionID) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.parentReportID}`,
            value: {
                [expenseReport.parentReportActionID]: {
                    childStateNum: predictedNextState,
                    childStatusNum: predictedNextStatus,
                },
            },
        });

        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.parentReportID}`,
            value: {
                [expenseReport.parentReportActionID]: {
                    childStateNum: expenseReport.stateNum,
                    childStatusNum: expenseReport.statusNum,
                },
            },
        });
    }

    const parameters: ReopenReportParams = {
        reportID: expenseReport.reportID,
        reportActionID: optimisticReopenedReportAction.reportActionID,
    };

    API.write(WRITE_COMMANDS.REOPEN_REPORT, parameters, {optimisticData, successData, failureData});
}

function retractReport(
    expenseReport: OnyxEntry<OnyxTypes.Report>,
    chatReport: OnyxEntry<OnyxTypes.Report>,
    policy: OnyxEntry<OnyxTypes.Policy>,
    currentUserAccountIDParam: number,
    currentUserEmailParam: string,
    hasViolations: boolean,
    isASAPSubmitBetaEnabled: boolean,
    expenseReportCurrentNextStepDeprecated: OnyxEntry<OnyxTypes.ReportNextStepDeprecated>,
) {
    if (!expenseReport) {
        return;
    }

    const optimisticRetractReportAction = buildOptimisticRetractedReportAction();
    const predictedNextState = CONST.REPORT.STATE_NUM.OPEN;
    const predictedNextStatus = CONST.REPORT.STATUS_NUM.OPEN;

    // buildOptimisticNextStep is used in parallel
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const optimisticNextStepDeprecated = buildNextStepNew({
        report: expenseReport,
        predictedNextStatus: CONST.REPORT.STATUS_NUM.OPEN,
        policy,
        currentUserAccountIDParam,
        currentUserEmailParam,
        hasViolations,
        isASAPSubmitBetaEnabled,
    });
    const optimisticNextStep = buildOptimisticNextStep({
        report: expenseReport,
        predictedNextStatus: CONST.REPORT.STATUS_NUM.OPEN,
        policy,
        currentUserAccountIDParam,
        currentUserEmailParam,
        hasViolations,
        isASAPSubmitBetaEnabled,
    });
    const optimisticReportActionsData: OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS> = {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.reportID}`,
        value: {
            [optimisticRetractReportAction.reportActionID]: {
                ...(optimisticRetractReportAction as OnyxTypes.ReportAction),
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            },
        },
    };
    const optimisticIOUReportData: OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT> = {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`,
        value: {
            ...expenseReport,
            lastMessageText: getReportActionText(optimisticRetractReportAction),
            lastMessageHtml: getReportActionHtml(optimisticRetractReportAction),
            stateNum: predictedNextState,
            statusNum: predictedNextStatus,
            hasReportBeenRetracted: true,
            nextStep: optimisticNextStep,
            pendingFields: {
                partial: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                nextStep: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
            },
        },
    };

    const optimisticNextStepData: OnyxUpdate<typeof ONYXKEYS.COLLECTION.NEXT_STEP> = {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.NEXT_STEP}${expenseReport.reportID}`,
        value: optimisticNextStepDeprecated,
    };

    const optimisticData: OnyxUpdate[] = [optimisticIOUReportData, optimisticReportActionsData, optimisticNextStepData];

    if (chatReport) {
        const iouReportActions = getAllReportActions(chatReport.iouReportID);
        const expenseReportActions = getAllReportActions(expenseReport.reportID);
        const iouCreatedAction = Object.values(iouReportActions).find((action) => isCreatedAction(action));
        const expenseCreatedAction = Object.values(expenseReportActions).find((action) => isCreatedAction(action));
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`,
            value: {
                // The report created later will become the iouReportID of the chat report
                iouReportID: (iouCreatedAction?.created ?? '') > (expenseCreatedAction?.created ?? '') ? chatReport?.iouReportID : expenseReport.reportID,
            },
        });
    }

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.REPORT>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.reportID}`,
            value: {
                [optimisticRetractReportAction.reportActionID]: {
                    pendingAction: null,
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`,
            value: {
                pendingFields: {
                    partial: null,
                    nextStep: null,
                },
            },
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.NEXT_STEP>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.reportID}`,
            value: {
                [optimisticRetractReportAction.reportActionID]: {
                    errors: getMicroSecondOnyxErrorWithTranslationKey('iou.error.other'),
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`,
            value: {
                // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
                stateNum: expenseReport.stateNum,
                // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
                statusNum: expenseReport.stateNum,
                // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
                hasReportBeenRetracted: false,
                nextStep: expenseReport.nextStep ?? null,
                pendingFields: {
                    // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
                    partial: null,
                    nextStep: null,
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.NEXT_STEP}${expenseReport.reportID}`,
            value: expenseReportCurrentNextStepDeprecated ?? null,
        },
    ];

    if (expenseReport.parentReportID && expenseReport.parentReportActionID) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.parentReportID}`,
            value: {
                [expenseReport.parentReportActionID]: {
                    childStateNum: predictedNextState,
                    childStatusNum: predictedNextStatus,
                },
            },
        });

        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.parentReportID}`,
            value: {
                [expenseReport.parentReportActionID]: {
                    childStateNum: expenseReport.stateNum,
                    childStatusNum: expenseReport.statusNum,
                },
            },
        });
    }

    const parameters: RetractReportParams = {
        reportID: expenseReport.reportID,
        reportActionID: optimisticRetractReportAction.reportActionID,
    };

    API.write(WRITE_COMMANDS.RETRACT_REPORT, parameters, {optimisticData, successData, failureData});
}

function unapproveExpenseReport(
    expenseReport: OnyxEntry<OnyxTypes.Report>,
    policy: OnyxEntry<OnyxTypes.Policy>,
    currentUserAccountIDParam: number,
    currentUserEmailParam: string,
    hasViolations: boolean,
    isASAPSubmitBetaEnabled: boolean,
    expenseReportCurrentNextStepDeprecated: OnyxEntry<OnyxTypes.ReportNextStepDeprecated>,
) {
    if (isEmptyObject(expenseReport)) {
        return;
    }

    const optimisticUnapprovedReportAction = buildOptimisticUnapprovedReportAction(expenseReport.total ?? 0, expenseReport.currency ?? '', expenseReport.reportID);

    // buildOptimisticNextStep is used in parallel
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const optimisticNextStepDeprecated = buildNextStepNew({
        report: expenseReport,
        predictedNextStatus: CONST.REPORT.STATUS_NUM.SUBMITTED,
        policy,
        currentUserAccountIDParam,
        currentUserEmailParam,
        hasViolations,
        isASAPSubmitBetaEnabled,
        shouldFixViolations: false,
        isUnapprove: true,
    });
    const optimisticNextStep = buildOptimisticNextStep({
        report: expenseReport,
        predictedNextStatus: CONST.REPORT.STATUS_NUM.SUBMITTED,
        policy,
        currentUserAccountIDParam,
        currentUserEmailParam,
        hasViolations,
        isASAPSubmitBetaEnabled,
        shouldFixViolations: false,
        isUnapprove: true,
    });

    const optimisticReportActionData: OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS> = {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.reportID}`,
        value: {
            [optimisticUnapprovedReportAction.reportActionID]: {
                ...(optimisticUnapprovedReportAction as OnyxTypes.ReportAction),
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            },
        },
    };
    const optimisticIOUReportData: OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT> = {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`,
        value: {
            ...expenseReport,
            lastMessageText: getReportActionText(optimisticUnapprovedReportAction),
            lastMessageHtml: getReportActionHtml(optimisticUnapprovedReportAction),
            stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
            nextStep: optimisticNextStep,
            pendingFields: {
                partial: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                nextStep: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
            },
            isCancelledIOU: false,
        },
    };

    const optimisticNextStepData: OnyxUpdate<typeof ONYXKEYS.COLLECTION.NEXT_STEP> = {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.NEXT_STEP}${expenseReport.reportID}`,
        value: optimisticNextStepDeprecated,
    };

    const optimisticData: OnyxUpdate[] = [optimisticIOUReportData, optimisticReportActionData, optimisticNextStepData];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.REPORT>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.reportID}`,
            value: {
                [optimisticUnapprovedReportAction.reportActionID]: {
                    pendingAction: null,
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`,
            value: {
                pendingFields: {
                    partial: null,
                    nextStep: null,
                },
            },
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.NEXT_STEP | typeof ONYXKEYS.COLLECTION.REPORT>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.reportID}`,
            value: {
                [optimisticUnapprovedReportAction.reportActionID]: {
                    errors: getMicroSecondOnyxErrorWithTranslationKey('iou.error.other'),
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.NEXT_STEP}${expenseReport.reportID}`,
            value: expenseReportCurrentNextStepDeprecated ?? null,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`,
            value: {
                nextStep: expenseReport.nextStep ?? null,
                pendingFields: {
                    partial: null,
                    nextStep: null,
                },
                isCancelledIOU: true,
            },
        },
    ];

    if (expenseReport.parentReportID && expenseReport.parentReportActionID) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.parentReportID}`,
            value: {
                [expenseReport.parentReportActionID]: {
                    childStateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                    childStatusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                },
            },
        });

        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.parentReportID}`,
            value: {
                [expenseReport.parentReportActionID]: {
                    childStateNum: expenseReport.stateNum,
                    childStatusNum: expenseReport.statusNum,
                },
            },
        });
    }

    const parameters: UnapproveExpenseReportParams = {
        reportID: expenseReport.reportID,
        reportActionID: optimisticUnapprovedReportAction.reportActionID,
    };

    API.write(WRITE_COMMANDS.UNAPPROVE_EXPENSE_REPORT, parameters, {optimisticData, successData, failureData});
}

function submitReport(
    expenseReport: OnyxEntry<OnyxTypes.Report>,
    policy: OnyxEntry<OnyxTypes.Policy>,
    currentUserAccountIDParam: number,
    currentUserEmailParam: string,
    hasViolations: boolean,
    isASAPSubmitBetaEnabled: boolean,
    expenseReportCurrentNextStepDeprecated: OnyxEntry<OnyxTypes.ReportNextStepDeprecated>,
) {
    if (!expenseReport) {
        return;
    }
    if (expenseReport.policyID && shouldRestrictUserBillableActions(expenseReport.policyID)) {
        Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(expenseReport.policyID));
        return;
    }

    const parentReport = getReportOrDraftReport(expenseReport.parentReportID);
    const isCurrentUserManager = currentUserAccountIDParam === expenseReport.managerID;
    const isSubmitAndClosePolicy = isSubmitAndClose(policy);
    const adminAccountID = policy?.role === CONST.POLICY.ROLE.ADMIN ? currentUserAccountIDParam : undefined;
    const optimisticSubmittedReportAction = buildOptimisticSubmittedReportAction(
        expenseReport?.total ?? 0,
        expenseReport.currency ?? '',
        expenseReport.reportID,
        adminAccountID,
        policy?.approvalMode,
    );
    const isDEWPolicy = hasDynamicExternalWorkflow(policy);
    // For DEW policies, only add optimistic submit action when offline
    const shouldAddOptimisticSubmitAction = !isDEWPolicy || isOffline();

    // buildOptimisticNextStep is used in parallel
    const optimisticNextStepDeprecated = isDEWPolicy
        ? null
        : // eslint-disable-next-line @typescript-eslint/no-deprecated
          buildNextStepNew({
              report: expenseReport,
              predictedNextStatus: isSubmitAndClosePolicy ? CONST.REPORT.STATUS_NUM.CLOSED : CONST.REPORT.STATUS_NUM.SUBMITTED,
              policy,
              currentUserAccountIDParam,
              currentUserEmailParam,
              hasViolations,
              isASAPSubmitBetaEnabled,
              isUnapprove: true,
          });
    const optimisticNextStep = isDEWPolicy
        ? null
        : buildOptimisticNextStep({
              report: expenseReport,
              predictedNextStatus: isSubmitAndClosePolicy ? CONST.REPORT.STATUS_NUM.CLOSED : CONST.REPORT.STATUS_NUM.SUBMITTED,
              policy,
              currentUserAccountIDParam,
              currentUserEmailParam,
              hasViolations,
              isASAPSubmitBetaEnabled,
              isUnapprove: true,
          });
    const approvalChain = getApprovalChain(policy, expenseReport);
    const managerID = getAccountIDsByLogins(approvalChain).at(0);

    const optimisticData: OnyxUpdate[] = [];

    if (shouldAddOptimisticSubmitAction) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.reportID}`,
            value: {
                [optimisticSubmittedReportAction.reportActionID]: {
                    ...(optimisticSubmittedReportAction as OnyxTypes.ReportAction),
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                },
            },
        });
    }

    if (!isSubmitAndClosePolicy) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`,
            value: {
                ...expenseReport,
                ...(shouldAddOptimisticSubmitAction
                    ? {
                          lastMessageText: getReportActionText(optimisticSubmittedReportAction),
                          lastMessageHtml: getReportActionHtml(optimisticSubmittedReportAction),
                      }
                    : {}),
                // For DEW policies, don't optimistically update managerID, stateNum, statusNum, or nextStep
                // because DEW determines the actual workflow on the backend
                ...(isDEWPolicy
                    ? {}
                    : {
                          managerID,
                          stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                          statusNum: CONST.REPORT.STATUS_NUM.SUBMITTED,
                          nextStep: optimisticNextStep,
                          pendingFields: {
                              nextStep: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                          },
                      }),
            },
        });
    } else {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`,
            value: {
                ...expenseReport,
                // For DEW policies, don't optimistically update stateNum, statusNum, or nextStep
                ...(isDEWPolicy
                    ? {}
                    : {
                          stateNum: CONST.REPORT.STATE_NUM.APPROVED,
                          statusNum: CONST.REPORT.STATUS_NUM.CLOSED,
                          nextStep: optimisticNextStep,
                          pendingFields: {
                              nextStep: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                          },
                      }),
            },
        });
    }

    if (!isDEWPolicy) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.NEXT_STEP}${expenseReport.reportID}`,
            value: optimisticNextStepDeprecated,
        });
    }

    if (parentReport?.reportID) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${parentReport.reportID}`,
            value: {
                ...parentReport,
                // In case its a manager who force submitted the report, they are the next user who needs to take an action
                hasOutstandingChildRequest: isCurrentUserManager,
                iouReportID: null,
            },
        });
    }

    if (isDEWPolicy) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${expenseReport.reportID}`,
            value: {
                pendingExpenseAction: CONST.EXPENSE_PENDING_ACTION.SUBMIT,
            },
        });
    }

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.REPORT_METADATA>> = [];
    if (!isDEWPolicy) {
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`,
            value: {
                pendingFields: {
                    nextStep: null,
                },
            },
        });
    }
    if (shouldAddOptimisticSubmitAction) {
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.reportID}`,
            value: {
                [optimisticSubmittedReportAction.reportActionID]: {
                    pendingAction: null,
                },
            },
        });
    }

    if (isDEWPolicy) {
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${expenseReport.reportID}`,
            value: {
                pendingExpenseAction: null,
            },
        });
    }

    const failureData: Array<
        OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.NEXT_STEP | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.REPORT_METADATA>
    > = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`,
            value: {
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                ...(isDEWPolicy
                    ? {}
                    : {
                          nextStep: expenseReport.nextStep ?? null,
                          pendingFields: {
                              nextStep: null,
                          },
                      }),
            },
        },
    ];
    if (shouldAddOptimisticSubmitAction) {
        if (isDEWPolicy) {
            // delete the optimistic SUBMITTED action as The backend creates a DEW_SUBMIT_FAILED action instead.
            failureData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.reportID}`,
                value: {
                    [optimisticSubmittedReportAction.reportActionID]: null,
                },
            });
        } else {
            failureData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.reportID}`,
                value: {
                    [optimisticSubmittedReportAction.reportActionID]: {
                        errors: getMicroSecondOnyxErrorWithTranslationKey('iou.error.other'),
                    },
                },
            });
        }
    }

    if (isDEWPolicy) {
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${expenseReport.reportID}`,
            value: {
                pendingExpenseAction: null,
            },
        });
    }

    if (!isDEWPolicy) {
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.NEXT_STEP}${expenseReport.reportID}`,
            value: expenseReportCurrentNextStepDeprecated ?? null,
        });
    }

    if (parentReport?.reportID) {
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${parentReport.reportID}`,
            value: {
                hasOutstandingChildRequest: parentReport.hasOutstandingChildRequest,
                iouReportID: expenseReport.reportID,
            },
        });
    }

    const parameters: SubmitReportParams = {
        reportID: expenseReport.reportID,
        managerAccountID: getSubmitToAccountID(policy, expenseReport) ?? expenseReport.managerID,
        reportActionID: optimisticSubmittedReportAction.reportActionID,
    };

    API.write(WRITE_COMMANDS.SUBMIT_REPORT, parameters, {optimisticData, successData, failureData});
}

function cancelPayment(
    expenseReport: OnyxEntry<OnyxTypes.Report>,
    chatReport: OnyxTypes.Report,
    policy: OnyxEntry<OnyxTypes.Policy>,
    isASAPSubmitBetaEnabled: boolean,
    currentUserAccountIDParam: number,
    currentUserEmailParam: string,
    hasViolations: boolean,
) {
    if (isEmptyObject(expenseReport)) {
        return;
    }

    const optimisticReportAction = buildOptimisticCancelPaymentReportAction(
        expenseReport.reportID,
        -((expenseReport.total ?? 0) - (expenseReport?.nonReimbursableTotal ?? 0)),
        expenseReport.currency ?? '',
    );
    const approvalMode = policy?.approvalMode ?? CONST.POLICY.APPROVAL_MODE.BASIC;

    const stateNum: ValueOf<typeof CONST.REPORT.STATE_NUM> = CONST.REPORT.STATE_NUM.APPROVED;
    const statusNum: ValueOf<typeof CONST.REPORT.STATUS_NUM> = approvalMode === CONST.POLICY.APPROVAL_MODE.OPTIONAL ? CONST.REPORT.STATUS_NUM.CLOSED : CONST.REPORT.STATUS_NUM.APPROVED;

    // buildOptimisticNextStep is used in parallel
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const optimisticNextStepDeprecated = buildNextStepNew({
        report: expenseReport,
        predictedNextStatus: statusNum,
        policy,
        currentUserAccountIDParam,
        currentUserEmailParam,
        hasViolations,
        isASAPSubmitBetaEnabled,
    });
    const optimisticNextStep = buildOptimisticNextStep({
        report: expenseReport,
        predictedNextStatus: statusNum,
        policy,
        currentUserAccountIDParam,
        currentUserEmailParam,
        hasViolations,
        isASAPSubmitBetaEnabled,
    });
    const iouReportActions = getAllReportActions(chatReport.iouReportID);
    const expenseReportActions = getAllReportActions(expenseReport.reportID);
    const iouCreatedAction = Object.values(iouReportActions).find((action) => isCreatedAction(action));
    const expenseCreatedAction = Object.values(expenseReportActions).find((action) => isCreatedAction(action));
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.NEXT_STEP>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.reportID}`,
            value: {
                [optimisticReportAction.reportActionID]: {
                    ...(optimisticReportAction as OnyxTypes.ReportAction),
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`,
            value: {
                // The report created later will become the iouReportID of the chat report
                iouReportID: (iouCreatedAction?.created ?? '') > (expenseCreatedAction?.created ?? '') ? chatReport?.iouReportID : expenseReport.reportID,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`,
            value: {
                ...expenseReport,
                isWaitingOnBankAccount: false,
                lastVisibleActionCreated: optimisticReportAction?.created,
                lastMessageText: getReportActionText(optimisticReportAction),
                lastMessageHtml: getReportActionHtml(optimisticReportAction),
                stateNum,
                statusNum,
                isCancelledIOU: true,
                nextStep: optimisticNextStep,
                pendingFields: {
                    nextStep: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
            },
        },
    ];

    optimisticData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.NEXT_STEP}${expenseReport.reportID}`,
        value: optimisticNextStepDeprecated,
    });

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`,
            value: {
                pendingFields: {
                    nextStep: null,
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.reportID}`,
            value: {
                [optimisticReportAction.reportActionID]: {
                    pendingAction: null,
                },
            },
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.NEXT_STEP>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.reportID}`,
            value: {
                [optimisticReportAction.reportActionID]: {
                    errors: getMicroSecondOnyxErrorWithTranslationKey('iou.error.other'),
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`,
            value: {
                statusNum: CONST.REPORT.STATUS_NUM.REIMBURSED,
                isWaitingOnBankAccount: expenseReport.isWaitingOnBankAccount,
                isCancelledIOU: false,
                nextStep:
                    buildOptimisticNextStep({
                        report: expenseReport,
                        predictedNextStatus: CONST.REPORT.STATUS_NUM.REIMBURSED,
                    }) ?? null,
                pendingFields: {
                    nextStep: null,
                },
            },
        },
    ];

    if (expenseReport.parentReportID && expenseReport.parentReportActionID) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.parentReportID}`,
            value: {
                [expenseReport.parentReportActionID]: {
                    childStateNum: stateNum,
                    childStatusNum: statusNum,
                },
            },
        });

        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.parentReportID}`,
            value: {
                [expenseReport.parentReportActionID]: {
                    childStateNum: expenseReport.stateNum,
                    childStatusNum: expenseReport.statusNum,
                },
            },
        });
    }

    if (chatReport?.reportID) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`,
            value: {
                iouReportID: expenseReport.reportID,
            },
        });
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`,
            value: {
                hasOutstandingChildRequest: chatReport.hasOutstandingChildRequest,
                iouReportID: chatReport.iouReportID,
            },
        });
    }
    failureData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.NEXT_STEP}${expenseReport.reportID}`,
        // buildOptimisticNextStep is used in parallel
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        value: buildNextStepNew({
            report: expenseReport,
            predictedNextStatus: CONST.REPORT.STATUS_NUM.REIMBURSED,
        }),
    });

    API.write(
        WRITE_COMMANDS.CANCEL_PAYMENT,
        {
            iouReportID: expenseReport.reportID,
            chatReportID: chatReport.reportID,
            managerAccountID: expenseReport.managerID ?? CONST.DEFAULT_NUMBER_ID,
            reportActionID: optimisticReportAction.reportActionID,
        },
        {optimisticData, successData, failureData},
    );
    notifyNewAction(expenseReport.reportID, userAccountID);
}

/**
 * Completes onboarding for invite link flow based on the selected payment option
 *
 * @param paymentSelected based on which we choose the onboarding choice and concierge message
 */
function completePaymentOnboarding(
    paymentSelected: ValueOf<typeof CONST.PAYMENT_SELECTED>,
    introSelected: OnyxEntry<OnyxTypes.IntroSelected>,
    adminsChatReportID?: string,
    onboardingPolicyID?: string,
) {
    const isInviteOnboardingComplete = introSelected?.isInviteOnboardingComplete ?? false;

    if (isInviteOnboardingComplete || !introSelected?.choice || !introSelected?.inviteType) {
        return;
    }

    const personalDetailsListValues = Object.values(getPersonalDetailsForAccountIDs(userAccountID ? [userAccountID] : [], personalDetailsList));
    const personalDetails = personalDetailsListValues.at(0);

    let onboardingPurpose = introSelected?.choice;
    if (introSelected?.inviteType === CONST.ONBOARDING_INVITE_TYPES.IOU && paymentSelected === CONST.IOU.PAYMENT_SELECTED.BBA) {
        onboardingPurpose = CONST.ONBOARDING_CHOICES.MANAGE_TEAM;
    }

    if (introSelected?.inviteType === CONST.ONBOARDING_INVITE_TYPES.INVOICE && paymentSelected !== CONST.IOU.PAYMENT_SELECTED.BBA) {
        onboardingPurpose = CONST.ONBOARDING_CHOICES.CHAT_SPLIT;
    }
    const {onboardingMessages} = getOnboardingMessages();

    completeOnboarding({
        engagementChoice: onboardingPurpose,
        onboardingMessage: onboardingMessages[onboardingPurpose],
        firstName: personalDetails?.firstName,
        lastName: personalDetails?.lastName,
        adminsChatReportID,
        onboardingPolicyID,
        paymentSelected,
        wasInvited: true,
        shouldSkipTestDriveModal: true,
        companySize: introSelected?.companySize as OnboardingCompanySize,
    });
}

function payMoneyRequest(
    paymentType: PaymentMethodType,
    chatReport: OnyxTypes.Report,
    iouReport: OnyxEntry<OnyxTypes.Report>,
    introSelected: OnyxEntry<OnyxTypes.IntroSelected>,
    iouReportCurrentNextStepDeprecated: OnyxEntry<OnyxTypes.ReportNextStepDeprecated>,
    paymentPolicyID?: string,
    full = true,
    activePolicy?: OnyxEntry<OnyxTypes.Policy>,
    policy?: OnyxEntry<OnyxTypes.Policy>,
) {
    if (chatReport.policyID && shouldRestrictUserBillableActions(chatReport.policyID)) {
        Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(chatReport.policyID));
        return;
    }

    const paymentSelected = paymentType === CONST.IOU.PAYMENT_TYPE.VBBA ? CONST.IOU.PAYMENT_SELECTED.BBA : CONST.IOU.PAYMENT_SELECTED.PBA;
    completePaymentOnboarding(paymentSelected, introSelected);

    const recipient = {accountID: iouReport?.ownerAccountID ?? CONST.DEFAULT_NUMBER_ID};
    const {params, optimisticData, successData, failureData} = getPayMoneyRequestParams({
        initialChatReport: chatReport,
        iouReport,
        recipient,
        paymentMethodType: paymentType,
        full,
        paymentPolicyID,
        activePolicy,
        reportPolicy: policy,
        iouReportCurrentNextStepDeprecated,
    });

    // For now, we need to call the PayMoneyRequestWithWallet API since PayMoneyRequest was not updated to work with
    // Expensify Wallets.
    const apiCommand = paymentType === CONST.IOU.PAYMENT_TYPE.EXPENSIFY ? WRITE_COMMANDS.PAY_MONEY_REQUEST_WITH_WALLET : WRITE_COMMANDS.PAY_MONEY_REQUEST;

    playSound(SOUNDS.SUCCESS);
    API.write(apiCommand, params, {optimisticData, successData, failureData});
    notifyNewAction(!full ? (Navigation.getTopmostReportId() ?? iouReport?.reportID) : iouReport?.reportID, userAccountID);
    return params.optimisticHoldReportID;
}

function payInvoice({
    paymentMethodType,
    chatReport,
    invoiceReport,
    introSelected,
    currentUserAccountIDParam,
    currentUserEmailParam,
    payAsBusiness = false,
    existingB2BInvoiceReport,
    methodID,
    paymentMethod,
    activePolicy,
    invoiceReportCurrentNextStepDeprecated,
}: PayInvoiceArgs) {
    const recipient = {accountID: invoiceReport?.ownerAccountID ?? CONST.DEFAULT_NUMBER_ID};
    const {
        optimisticData,
        successData,
        failureData,
        params: {
            reportActionID,
            policyID,
            adminsChatReportID,
            adminsCreatedReportActionID,
            expenseChatReportID,
            expenseCreatedReportActionID,
            customUnitRateID,
            customUnitID,
            ownerEmail,
            policyName,
        },
    } = getPayMoneyRequestParams({
        initialChatReport: chatReport,
        iouReport: invoiceReport,
        iouReportCurrentNextStepDeprecated: invoiceReportCurrentNextStepDeprecated,
        recipient,
        paymentMethodType,
        full: true,
        payAsBusiness,
        bankAccountID: methodID,
        existingB2BInvoiceReport,
        activePolicy,
        currentUserAccountIDParam,
        currentUserEmailParam,
        introSelected,
    });

    const paymentSelected = paymentMethodType === CONST.IOU.PAYMENT_TYPE.VBBA ? CONST.IOU.PAYMENT_SELECTED.BBA : CONST.IOU.PAYMENT_SELECTED.PBA;
    completePaymentOnboarding(paymentSelected, introSelected);

    let params: PayInvoiceParams = {
        reportID: invoiceReport?.reportID,
        reportActionID,
        paymentMethodType,
        payAsBusiness,
    };

    if (paymentMethod === CONST.PAYMENT_METHODS.PERSONAL_BANK_ACCOUNT) {
        params.bankAccountID = methodID;
    }

    if (paymentMethod === CONST.PAYMENT_METHODS.DEBIT_CARD) {
        params.fundID = methodID;
    }

    if (policyID) {
        params = {
            ...params,
            policyID,
            adminsChatReportID,
            adminsCreatedReportActionID,
            expenseChatReportID,
            expenseCreatedReportActionID,
            customUnitRateID,
            customUnitID,
            ownerEmail,
            policyName,
        };
    }

    playSound(SOUNDS.SUCCESS);
    API.write(WRITE_COMMANDS.PAY_INVOICE, params, {optimisticData, successData, failureData});
}

function detachReceipt(transactionID: string | undefined, transactionPolicy: OnyxEntry<OnyxTypes.Policy>, transactionPolicyCategories?: OnyxEntry<OnyxTypes.PolicyCategories>) {
    if (!transactionID) {
        return;
    }
    const transaction = allTransactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
    const expenseReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${transaction?.reportID}`] ?? null;
    const newTransaction = transaction
        ? {
              ...transaction,
              receipt: {},
          }
        : null;

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: {
                receipt: null,
                pendingFields: {
                    receipt: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
            },
        },
    ];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: {
                pendingFields: {
                    receipt: null,
                },
            },
        },
    ];
    const failureData: Array<
        OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION | typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS | typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>
    > = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: {
                ...(transaction ?? null),
                errors: getMicroSecondOnyxErrorWithTranslationKey('iou.error.receiptDeleteFailureError'),
                pendingFields: {
                    receipt: null,
                },
            },
        },
    ];

    if (transactionPolicy && isPaidGroupPolicy(transactionPolicy) && newTransaction) {
        const policyTagList = getPolicyTagsData(transactionPolicy.id);
        const currentTransactionViolations = allTransactionViolations[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`] ?? [];
        const violationsOnyxData = ViolationsUtils.getViolationsOnyxData(
            newTransaction,
            currentTransactionViolations,
            transactionPolicy,
            policyTagList ?? {},
            transactionPolicyCategories ?? {},
            hasDependentTags(transactionPolicy, policyTagList ?? {}),
            isInvoiceReportReportUtils(expenseReport),
        );
        optimisticData.push(violationsOnyxData);
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`,
            value: currentTransactionViolations,
        });
    }

    const updatedReportAction = buildOptimisticDetachReceipt(expenseReport?.reportID, transactionID, transaction?.merchant);

    optimisticData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${updatedReportAction?.reportID}`,
        value: {
            [updatedReportAction.reportActionID]: updatedReportAction as OnyxTypes.ReportAction,
        },
    });
    optimisticData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT}${updatedReportAction?.reportID}`,
        value: {
            lastVisibleActionCreated: updatedReportAction.created,
            lastReadTime: updatedReportAction.created,
        },
    });
    failureData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT}${updatedReportAction?.reportID}`,
        value: {
            lastVisibleActionCreated: expenseReport?.lastVisibleActionCreated,
            lastReadTime: expenseReport?.lastReadTime,
        },
    });
    successData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport?.reportID}`,
        value: {
            [updatedReportAction.reportActionID]: {pendingAction: null},
        },
    });
    failureData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport?.reportID}`,
        value: {
            [updatedReportAction.reportActionID]: {
                ...(updatedReportAction as OnyxTypes.ReportAction),
                errors: getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericEditFailureMessage'),
            },
        },
    });

    const parameters: DetachReceiptParams = {transactionID, reportActionID: updatedReportAction.reportActionID};

    API.write(WRITE_COMMANDS.DETACH_RECEIPT, parameters, {optimisticData, successData, failureData});
}

function replaceReceipt({transactionID, file, source, transactionPolicy, transactionPolicyCategories}: ReplaceReceipt) {
    if (!file) {
        return;
    }

    const transaction = allTransactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
    const expenseReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${transaction?.reportID}`] ?? null;
    const oldReceipt = transaction?.receipt ?? {};
    const receiptOptimistic = {
        source,
        state: CONST.IOU.RECEIPT_STATE.OPEN,
        filename: file.name,
    };
    const newTransaction = transaction && {...transaction, receipt: receiptOptimistic};
    const retryParams: ReplaceReceipt = {transactionID, file: undefined, source, transactionPolicy, transactionPolicyCategories};
    const currentSearchQueryJSON = getCurrentSearchQueryJSON();

    const optimisticData: OnyxUpdate[] = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: {
                receipt: receiptOptimistic,
                pendingFields: {
                    receipt: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
                errors: null,
            },
        },
    ];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: {
                pendingFields: {
                    receipt: null,
                },
            },
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION | typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS | typeof ONYXKEYS.COLLECTION.SNAPSHOT>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: {
                receipt: !isEmptyObject(oldReceipt) ? oldReceipt : null,
                errors: getReceiptError(receiptOptimistic, file.name, undefined, undefined, CONST.IOU.ACTION_PARAMS.REPLACE_RECEIPT, retryParams),
                pendingFields: {
                    receipt: null,
                },
            },
        },
    ];

    if (transactionPolicy && isPaidGroupPolicy(transactionPolicy) && newTransaction) {
        const policyTagList = getPolicyTagsData(transactionPolicy.id);
        const currentTransactionViolations = allTransactionViolations[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`] ?? [];
        const violationsOnyxData = ViolationsUtils.getViolationsOnyxData(
            newTransaction,
            currentTransactionViolations,
            transactionPolicy,
            policyTagList ?? {},
            transactionPolicyCategories ?? {},
            hasDependentTags(transactionPolicy, policyTagList ?? {}),
            isInvoiceReportReportUtils(expenseReport),
        );
        optimisticData.push(violationsOnyxData);
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`,
            value: currentTransactionViolations,
        });
    }
    if (currentSearchQueryJSON?.hash) {
        // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SNAPSHOT}${currentSearchQueryJSON.hash}`,
            value: {
                data: {
                    [`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`]: {
                        receipt: receiptOptimistic,
                    },
                },
            },
        });

        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SNAPSHOT}${currentSearchQueryJSON.hash}`,
            // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
            value: {
                data: {
                    [`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`]: {
                        receipt: !isEmptyObject(oldReceipt) ? oldReceipt : null,
                    },
                },
            },
        });
    }

    const parameters: ReplaceReceiptParams = {
        transactionID,
        receipt: file,
    };

    API.write(WRITE_COMMANDS.REPLACE_RECEIPT, parameters, {optimisticData, successData, failureData});
}

/**
 * Finds the participants for an IOU based on the attached report
 * @param transactionID of the transaction to set the participants of
 * @param report attached to the transaction
 */
function getMoneyRequestParticipantsFromReport(report: OnyxEntry<OnyxTypes.Report>, currentUserAccountID?: number): Participant[] {
    // If the report is iou or expense report, we should get the chat report to set participant for request money
    const chatReport = isMoneyRequestReportReportUtils(report) ? getReportOrDraftReport(report?.chatReportID) : report;
    const shouldAddAsReport = !isEmptyObject(chatReport) && isSelfDM(chatReport);
    let participants: Participant[] = [];

    if (isPolicyExpenseChatReportUtil(chatReport) || shouldAddAsReport) {
        participants = [{accountID: 0, reportID: chatReport?.reportID, isPolicyExpenseChat: isPolicyExpenseChatReportUtil(chatReport), selected: true}];
    } else if (isInvoiceRoom(chatReport)) {
        participants = [
            {reportID: chatReport?.reportID, selected: true},
            {
                policyID: chatReport?.policyID,
                isSender: true,
                selected: false,
            },
        ];
    } else {
        const chatReportOtherParticipants = Object.keys(chatReport?.participants ?? {})
            .map(Number)
            .filter((accountID) => accountID !== currentUserAccountID);
        participants = chatReportOtherParticipants.map((accountID) => ({accountID, selected: true}));
    }

    return participants;
}

/**
 * Sets the participants for an IOU based on the attached report
 * @param transactionID of the transaction to set the participants of
 * @param report attached to the transaction
 * @param participantsAutoAssigned whether participants were auto assigned
 */
function setMoneyRequestParticipantsFromReport(transactionID: string, report: OnyxEntry<OnyxTypes.Report>, currentUserAccountID?: number, participantsAutoAssigned = true) {
    const participants = getMoneyRequestParticipantsFromReport(report, currentUserAccountID);
    return Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {
        participants,
        participantsAutoAssigned,
    });
}

function setMoneyRequestTaxRate(transactionID: string, taxCode: string | null) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {taxCode});
}

function setMoneyRequestTaxAmount(transactionID: string, taxAmount: number | null) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {taxAmount});
}

/**
 * Sets the `splitShares` map that holds individual shares of a split bill
 */
function setSplitShares(transaction: OnyxEntry<OnyxTypes.Transaction>, amount: number, currency: string, newAccountIDs: number[]) {
    if (!transaction) {
        return;
    }

    // For pending split distance requests, we don't want to set split shares to zero amount
    // instead we will reset it which would mean splitting the amount equally when the pending distance is resolved.
    if (isDistanceRequestTransactionUtils(transaction) && !amount) {
        Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transaction.transactionID}`, {splitShares: null});
        return;
    }

    const oldAccountIDs = Object.keys(transaction.splitShares ?? {}).map((key) => Number(key));

    // Create an array containing unique IDs of the current transaction participants and the new ones
    // The current userAccountID might not be included in newAccountIDs if this is called from the participants step using Global Create
    // If this is called from an existing group chat, it'll be included. So we manually add them to account for both cases.
    const accountIDs = [...new Set<number>([userAccountID, ...newAccountIDs, ...oldAccountIDs])];

    const splitShares: SplitShares = accountIDs.reduce((acc: SplitShares, accountID): SplitShares => {
        // We want to replace the contents of splitShares to contain only `newAccountIDs` entries
        // In the case of going back to the participants page and removing a participant
        // a simple merge will have the previous participant still present in the splitShares object
        // So we manually set their entry to null
        if (!newAccountIDs.includes(accountID) && accountID !== userAccountID) {
            acc[accountID] = null;
            return acc;
        }

        const isPayer = accountID === userAccountID;
        const participantsLength = newAccountIDs.includes(userAccountID) ? newAccountIDs.length - 1 : newAccountIDs.length;
        const splitAmount = calculateIOUAmount(participantsLength, amount, currency, isPayer);
        acc[accountID] = {
            amount: splitAmount,
            isModified: false,
        };
        return acc;
    }, {});

    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transaction.transactionID}`, {splitShares});
}

function resetSplitShares(transaction: OnyxEntry<OnyxTypes.Transaction>, newAmount?: number, currency?: string) {
    if (!transaction) {
        return;
    }
    const accountIDs = Object.keys(transaction.splitShares ?? {}).map((key) => Number(key));
    if (!accountIDs) {
        return;
    }
    setSplitShares(transaction, newAmount ?? transaction.amount, currency ?? transaction.currency, accountIDs);
}

/**
 * Sets an individual split share of the participant accountID supplied
 */
function setIndividualShare(transactionID: string, participantAccountID: number, participantShare: number) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {
        splitShares: {
            [participantAccountID]: {amount: participantShare, isModified: true},
        },
    });
}

/**
 * Adjusts remaining unmodified shares when another share is modified
 * E.g. if total bill is $100 and split between 3 participants, when the user changes the first share to $50, the remaining unmodified shares will become $25 each.
 */
function adjustRemainingSplitShares(transaction: NonNullable<OnyxTypes.Transaction>) {
    const modifiedShares = Object.keys(transaction.splitShares ?? {}).filter((key: string) => transaction?.splitShares?.[Number(key)]?.isModified);

    if (!modifiedShares.length) {
        return;
    }

    const sumOfManualShares = modifiedShares
        .map((key: string): number => transaction?.splitShares?.[Number(key)]?.amount ?? 0)
        .reduce((prev: number, current: number): number => prev + current, 0);

    const unmodifiedSharesAccountIDs = Object.keys(transaction.splitShares ?? {})
        .filter((key: string) => !transaction?.splitShares?.[Number(key)]?.isModified)
        .map((key: string) => Number(key));

    const remainingTotal = transaction.amount - sumOfManualShares;
    if (remainingTotal < 0) {
        return;
    }

    const splitShares: SplitShares = unmodifiedSharesAccountIDs.reduce((acc: SplitShares, accountID: number, index: number): SplitShares => {
        const splitAmount = calculateIOUAmount(unmodifiedSharesAccountIDs.length - 1, remainingTotal, transaction.currency, index === 0);
        acc[accountID] = {
            amount: splitAmount,
        };
        return acc;
    }, {});

    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transaction.transactionID}`, {splitShares});
}

// eslint-disable-next-line rulesdir/no-negated-variables
function navigateToStartStepIfScanFileCannotBeRead(
    receiptFilename: string | undefined,
    receiptPath: ReceiptSource | undefined,
    onSuccess: (file: File) => void,
    requestType: IOURequestType,
    iouType: IOUType,
    transactionID: string,
    reportID: string,
    receiptType: string | undefined,
    onFailureCallback?: () => void,
) {
    if (!receiptFilename || !receiptPath) {
        return;
    }

    const onFailure = () => {
        setMoneyRequestReceipt(transactionID, '', '', true, '');
        if (requestType === CONST.IOU.REQUEST_TYPE.MANUAL) {
            if (onFailureCallback) {
                onFailureCallback();
                return;
            }
            Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_SCAN.getRoute(CONST.IOU.ACTION.CREATE, iouType, transactionID, reportID, Navigation.getActiveRouteWithoutParams()));
            return;
        }
        navigateToStartMoneyRequestStep(requestType, iouType, transactionID, reportID);
    };
    readFileAsync(receiptPath.toString(), receiptFilename, onSuccess, onFailure, receiptType);
}

function checkIfScanFileCanBeRead(
    receiptFilename: string | undefined,
    receiptPath: ReceiptSource | undefined,
    receiptType: string | undefined,
    onSuccess: (file: File) => void,
    onFailure: () => void,
) {
    if (!receiptFilename || !receiptPath) {
        onFailure();
        return Promise.resolve();
    }

    return readFileAsync(receiptPath.toString(), receiptFilename, onSuccess, onFailure, receiptType);
}

/** Save the preferred payment method for a policy or personal DM */
function savePreferredPaymentMethod(
    policyID: string | undefined,
    paymentMethod: string,
    type: ValueOf<typeof CONST.LAST_PAYMENT_METHOD> | undefined,
    prevPaymentMethod?: OnyxTypes.LastPaymentMethodType | string,
) {
    if (!policyID) {
        return;
    }

    // to make it easier to revert to the previous last payment method, we will save it to this key
    Onyx.merge(`${ONYXKEYS.NVP_LAST_PAYMENT_METHOD}`, {
        [policyID]: type
            ? {
                  [type]: {name: paymentMethod},
                  [CONST.LAST_PAYMENT_METHOD.LAST_USED]: {name: typeof prevPaymentMethod === 'string' ? prevPaymentMethod : (prevPaymentMethod?.lastUsed?.name ?? paymentMethod)},
              }
            : paymentMethod,
    });
}

/** Get report policy id of IOU request */
function getIOURequestPolicyID(transaction: OnyxEntry<OnyxTypes.Transaction>, report: OnyxEntry<OnyxTypes.Report>): string | undefined {
    // Workspace sender will exist for invoices
    const workspaceSender = transaction?.participants?.find((participant) => participant.isSender);
    return workspaceSender?.policyID ?? report?.policyID;
}

function updateLastLocationPermissionPrompt() {
    Onyx.set(ONYXKEYS.NVP_LAST_LOCATION_PERMISSION_PROMPT, new Date().toISOString());
}

function setMultipleMoneyRequestParticipantsFromReport(transactionIDs: string[], reportValue: OnyxEntry<OnyxTypes.Report>, currentUserAccountID: number) {
    const participants = getMoneyRequestParticipantsFromReport(reportValue, currentUserAccountID);
    const updatedTransactions: Record<`${typeof ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${string}`, NullishDeep<OnyxTypes.Transaction>> = {};
    for (const transactionID of transactionIDs) {
        updatedTransactions[`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`] = {
            participants,
            participantsAutoAssigned: true,
        };
    }
    return Onyx.mergeCollection(ONYXKEYS.COLLECTION.TRANSACTION_DRAFT, updatedTransactions);
}

const expenseReportStatusFilterMapping = {
    [CONST.SEARCH.STATUS.EXPENSE.DRAFTS]: (expenseReport: OnyxEntry<OnyxTypes.Report>) =>
        expenseReport?.stateNum === CONST.REPORT.STATE_NUM.OPEN && expenseReport?.statusNum === CONST.REPORT.STATUS_NUM.OPEN,
    [CONST.SEARCH.STATUS.EXPENSE.OUTSTANDING]: (expenseReport: OnyxEntry<OnyxTypes.Report>) =>
        expenseReport?.stateNum === CONST.REPORT.STATE_NUM.SUBMITTED && expenseReport?.statusNum === CONST.REPORT.STATUS_NUM.SUBMITTED,
    [CONST.SEARCH.STATUS.EXPENSE.APPROVED]: (expenseReport: OnyxEntry<OnyxTypes.Report>) =>
        expenseReport?.stateNum === CONST.REPORT.STATE_NUM.APPROVED && expenseReport?.statusNum === CONST.REPORT.STATUS_NUM.APPROVED,
    [CONST.SEARCH.STATUS.EXPENSE.PAID]: (expenseReport: OnyxEntry<OnyxTypes.Report>) =>
        (expenseReport?.stateNum ?? 0) >= CONST.REPORT.STATE_NUM.APPROVED && expenseReport?.statusNum === CONST.REPORT.STATUS_NUM.REIMBURSED,
    [CONST.SEARCH.STATUS.EXPENSE.DONE]: (expenseReport: OnyxEntry<OnyxTypes.Report>) =>
        expenseReport?.stateNum === CONST.REPORT.STATE_NUM.APPROVED && expenseReport?.statusNum === CONST.REPORT.STATUS_NUM.CLOSED,
    [CONST.SEARCH.STATUS.EXPENSE.UNREPORTED]: (expenseReport: OnyxEntry<OnyxTypes.Report>) => !expenseReport,
    [CONST.SEARCH.STATUS.EXPENSE.ALL]: () => true,
};

//  Determines whether the current search results should be optimistically updated
function shouldOptimisticallyUpdateSearch(
    currentSearchQueryJSON: SearchQueryJSON,
    iouReport: OnyxEntry<OnyxTypes.Report>,
    isInvoice: boolean | undefined,
    transaction?: OnyxEntry<OnyxTypes.Transaction>,
) {
    if (
        currentSearchQueryJSON.type !== CONST.SEARCH.DATA_TYPES.INVOICE &&
        currentSearchQueryJSON.type !== CONST.SEARCH.DATA_TYPES.EXPENSE &&
        currentSearchQueryJSON.type !== CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT
    ) {
        return false;
    }
    let shouldOptimisticallyUpdateByStatus;
    const status = currentSearchQueryJSON.status;
    if (Array.isArray(status)) {
        shouldOptimisticallyUpdateByStatus = status.some((val) => {
            const expenseStatus = val as ValueOf<typeof CONST.SEARCH.STATUS.EXPENSE>;
            return expenseReportStatusFilterMapping[expenseStatus](iouReport);
        });
    } else {
        const expenseStatus = status as ValueOf<typeof CONST.SEARCH.STATUS.EXPENSE>;
        shouldOptimisticallyUpdateByStatus = expenseReportStatusFilterMapping[expenseStatus](iouReport);
    }

    if (currentSearchQueryJSON.policyID?.length && iouReport?.policyID) {
        if (!currentSearchQueryJSON.policyID.includes(iouReport.policyID)) {
            return false;
        }
    }

    if (!shouldOptimisticallyUpdateByStatus) {
        return false;
    }

    const suggestedSearches = getSuggestedSearches(userAccountID);
    const submitQueryJSON = suggestedSearches[CONST.SEARCH.SEARCH_KEYS.SUBMIT].searchQueryJSON;
    const approveQueryJSON = suggestedSearches[CONST.SEARCH.SEARCH_KEYS.APPROVE].searchQueryJSON;

    const unapprovedCashSimilarSearchHash = suggestedSearches[CONST.SEARCH.SEARCH_KEYS.UNAPPROVED_CASH].similarSearchHash;

    const validSearchTypes =
        (!isInvoice && currentSearchQueryJSON.type === CONST.SEARCH.DATA_TYPES.EXPENSE) ||
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        (isInvoice && currentSearchQueryJSON.type === CONST.SEARCH.DATA_TYPES.INVOICE) ||
        (iouReport?.type === CONST.REPORT.TYPE.EXPENSE && currentSearchQueryJSON.type === CONST.SEARCH.DATA_TYPES.EXPENSE_REPORT);

    return (
        shouldOptimisticallyUpdateByStatus &&
        validSearchTypes &&
        (currentSearchQueryJSON.flatFilters.length === 0 ||
            (submitQueryJSON?.similarSearchHash === currentSearchQueryJSON.similarSearchHash && expenseReportStatusFilterMapping[CONST.SEARCH.STATUS.EXPENSE.DRAFTS](iouReport)) ||
            (approveQueryJSON?.similarSearchHash === currentSearchQueryJSON.similarSearchHash && expenseReportStatusFilterMapping[CONST.SEARCH.STATUS.EXPENSE.OUTSTANDING](iouReport)) ||
            (unapprovedCashSimilarSearchHash === currentSearchQueryJSON.similarSearchHash &&
                isExpenseReport(iouReport) &&
                (expenseReportStatusFilterMapping[CONST.SEARCH.STATUS.EXPENSE.DRAFTS](iouReport) || expenseReportStatusFilterMapping[CONST.SEARCH.STATUS.EXPENSE.OUTSTANDING](iouReport)) &&
                transaction?.reimbursable))
    );
}

function getSearchOnyxUpdate({
    participant,
    transaction,
    iouReport,
    iouAction,
    policy,
    transactionThreadReportID,
    isFromOneTransactionReport,
    isInvoice,
}: GetSearchOnyxUpdateParams): OnyxData<typeof ONYXKEYS.COLLECTION.SNAPSHOT> | undefined {
    const toAccountID = participant?.accountID;
    const fromAccountID = deprecatedCurrentUserPersonalDetails?.accountID;
    const currentSearchQueryJSON = getCurrentSearchQueryJSON();

    if (currentSearchQueryJSON && toAccountID != null && fromAccountID != null) {
        if (shouldOptimisticallyUpdateSearch(currentSearchQueryJSON, iouReport, isInvoice, transaction)) {
            const isOptimisticToAccountData = isOptimisticPersonalDetail(toAccountID);
            const successData = [];
            if (isOptimisticToAccountData) {
                // The optimistic personal detail is removed on the API's success data but we can't change the managerID of the transaction in the snapshot.
                // So we need to add the optimistic personal detail back to the snapshot in success data to prevent the flickering.
                // After that, it will be cleared via Search API.
                // See https://github.com/Expensify/App/issues/61310 for more information.
                successData.push({
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.SNAPSHOT}${currentSearchQueryJSON.hash}` as const,
                    value: {
                        data: {
                            [ONYXKEYS.PERSONAL_DETAILS_LIST]: {
                                [toAccountID]: {
                                    accountID: toAccountID,
                                    displayName: participant?.displayName,
                                    login: participant?.login,
                                },
                            },
                        },
                    },
                });
            }
            return {
                optimisticData: [
                    {
                        onyxMethod: Onyx.METHOD.MERGE,
                        key: `${ONYXKEYS.COLLECTION.SNAPSHOT}${currentSearchQueryJSON.hash}` as const,
                        value: {
                            // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
                            data: {
                                [ONYXKEYS.PERSONAL_DETAILS_LIST]: {
                                    [toAccountID]: {
                                        accountID: toAccountID,
                                        displayName: participant?.displayName,
                                        login: participant?.login,
                                    },
                                    [fromAccountID]: {
                                        accountID: fromAccountID,
                                        avatar: deprecatedCurrentUserPersonalDetails?.avatar,
                                        displayName: deprecatedCurrentUserPersonalDetails?.displayName,
                                        login: deprecatedCurrentUserPersonalDetails?.login,
                                    },
                                },
                                [`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`]: {
                                    accountID: fromAccountID,
                                    managerID: toAccountID,
                                    ...(transactionThreadReportID && {transactionThreadReportID}),
                                    ...(isFromOneTransactionReport && {isFromOneTransactionReport}),
                                    ...transaction,
                                },
                                ...(policy && {[`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`]: policy}),
                                ...(iouReport && {[`${ONYXKEYS.COLLECTION.REPORT}${iouReport.reportID}`]: iouReport}),
                                ...(iouReport && iouAction && {[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport.reportID}`]: {[iouAction.reportActionID]: iouAction}}),
                            },
                        },
                    },
                ],
                successData,
            };
        }
    }
}

function dismissRejectUseExplanation() {
    const parameters: SetNameValuePairParams = {
        name: ONYXKEYS.NVP_DISMISSED_REJECT_USE_EXPLANATION,
        value: true,
    };

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.NVP_DISMISSED_REJECT_USE_EXPLANATION>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_DISMISSED_REJECT_USE_EXPLANATION,
            value: true,
        },
    ];

    API.write(WRITE_COMMANDS.SET_NAME_VALUE_PAIR, parameters, {
        optimisticData,
    });
}

/**
 * Retrieve the reject money request data
 * @param transactionID - The ID of the transaction to reject
 * @param reportID - The ID of the expense report to reject
 * @param comment - The comment to add to the reject action
 * @param options
 *   - sharedRejectedToReportID: When rejecting multiple expenses sequentially, pass a single shared destination reportID so all rejections land in the same new report.
 * @returns optimisticData, successData, failureData, parameters, urlToNavigateBack
 */
function prepareRejectMoneyRequestData(
    transactionID: string,
    reportID: string,
    comment: string,
    policy: OnyxEntry<OnyxTypes.Policy>,
    options?: {sharedRejectedToReportID?: string},
    shouldUseBulkAction?: boolean,
): RejectMoneyRequestData | undefined {
    const transaction = allTransactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
    const transactionAmount = getAmount(transaction);
    const report = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
    const policyExpenseChat = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${report?.chatReportID}`];
    const isPolicyDelayedSubmissionEnabled = policy ? isDelayedSubmissionEnabled(policy) : false;
    const isIOU = isIOUReport(report);
    const searchFullScreenRoutes = navigationRef.getRootState()?.routes.findLast((route) => route.name === NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR);
    const lastRoute = searchFullScreenRoutes?.state?.routes?.at(-1);
    const isUserOnSearchPage = isSearchTopmostFullScreenRoute() && lastRoute?.name === SCREENS.SEARCH.ROOT;
    const isUserOnSearchMoneyRequestReport = isSearchTopmostFullScreenRoute() && lastRoute?.name === SCREENS.SEARCH.MONEY_REQUEST_REPORT;

    if (!report || !transaction) {
        return undefined;
    }

    const reportAction = getIOUActionForReportID(reportID, transactionID);
    const childReportID = reportAction?.childReportID;
    const transactionThreadReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${childReportID}`];

    let movedToReport;
    let rejectedToReportID = options?.sharedRejectedToReportID;
    let urlToNavigateBack;
    let reportPreviewAction: OnyxTypes.ReportAction | undefined;
    let createdIOUReportActionID;
    let expenseMovedReportActionID;
    let expenseCreatedReportActionID;

    const hasMultipleExpenses = getReportTransactions(reportID).length > 1;
    const transactionCommentCleanup = (() => {
        if (!transaction?.comment?.dismissedViolations?.[CONST.VIOLATIONS.AUTO_REPORTED_REJECTED_EXPENSE]) {
            return undefined;
        }

        const dismissedViolations = {...(transaction.comment.dismissedViolations ?? {})};
        delete dismissedViolations[CONST.VIOLATIONS.AUTO_REPORTED_REJECTED_EXPENSE];

        return {
            comment: {
                ...(transaction.comment ?? {}),
                dismissedViolations: isEmptyObject(dismissedViolations) ? null : dismissedViolations,
            },
        };
    })();

    // Build optimistic data updates
    const optimisticData: Array<
        OnyxUpdate<
            | typeof ONYXKEYS.COLLECTION.REPORT
            | typeof ONYXKEYS.COLLECTION.TRANSACTION
            | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS
            | typeof ONYXKEYS.COLLECTION.REPORT_METADATA
            | typeof ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS
            | typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS
        >
    > = [];

    // Create system messages in both expense report and expense thread
    // The "rejected this expense" action should come before the reject comment
    const baseTimestamp = DateUtils.getDBTime();
    const optimisticRejectReportAction = buildOptimisticRejectReportAction(baseTimestamp);
    const optimisticRejectReportActionComment = buildOptimisticRejectReportActionComment(comment, DateUtils.addMillisecondsFromDateTime(baseTimestamp, 1));
    let movedTransactionAction;

    // Build successData and failureData to prevent duplication
    const successData: Array<
        OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.REPORT_METADATA | typeof ONYXKEYS.COLLECTION.TRANSACTION>
    > = [];
    const failureData: Array<
        OnyxUpdate<
            | typeof ONYXKEYS.COLLECTION.REPORT
            | typeof ONYXKEYS.COLLECTION.TRANSACTION
            | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS
            | typeof ONYXKEYS.COLLECTION.REPORT_METADATA
            | typeof ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS
            | typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS
        >
    > = [];

    if ((!isPolicyDelayedSubmissionEnabled || isIOU) && !shouldUseBulkAction) {
        if (hasMultipleExpenses) {
            // For reports with multiple expenses: Update report total
            optimisticData.push(
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
                    value: {
                        total: (report?.total ?? 0) + transactionAmount,
                        pendingFields: {
                            total: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                        },
                    },
                },
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
                    value: {
                        reportID: null,
                        ...(transactionCommentCleanup ?? {}),
                    },
                },
            );

            // Add success data for report total update
            successData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
                value: {
                    pendingFields: {total: null},
                },
            });

            // Add failure data for report total revert
            failureData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
                value: {
                    total: report?.total ?? 0,
                    pendingFields: {total: null},
                },
            });

            // Add failure data for transaction revert
            failureData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
                value: {
                    reportID: transaction?.reportID ?? reportID,
                },
            });

            if (isUserOnSearchPage) {
                // Navigate to the existing Reports > Expense view
                urlToNavigateBack = undefined;
            } else {
                // Go back to the original expenses report
                urlToNavigateBack = ROUTES.REPORT_WITH_ID.getRoute(reportID);
            }
        } else {
            // For reports with single expense: Delete the report
            optimisticData.push(
                {
                    onyxMethod: Onyx.METHOD.SET,
                    key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
                    value: null,
                },
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
                    value: {
                        reportID: CONST.REPORT.UNREPORTED_REPORT_ID,
                        ...(transactionCommentCleanup ?? {}),
                    },
                },
            );

            // And delete the corresponding REPORTPREVIEW action
            const parentReportID = report?.parentReportID;
            const parentReportActionID = report?.parentReportActionID;
            const deletedTime = DateUtils.getDBTime();
            if (parentReportActionID) {
                optimisticData.push({
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID}`,
                    value: {
                        [parentReportActionID]: {
                            originalMessage: {
                                deleted: deletedTime,
                            },
                        },
                    },
                });
                failureData.push({
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID}`,
                    value: {
                        [parentReportActionID]: {
                            originalMessage: {
                                deleted: null,
                            },
                        },
                    },
                });
            }

            // Add success data for report deletion (no action needed, report is already deleted)
            successData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
                value: null,
            });

            // Add failure data to restore the report
            failureData.push(
                {
                    onyxMethod: Onyx.METHOD.SET,
                    key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
                    value: report,
                },
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
                    value: {
                        reportID,
                    },
                },
            );

            if (isUserOnSearchPage) {
                // Navigate to the existing Reports > Expense view.
                urlToNavigateBack = undefined;
            } else if (isUserOnSearchMoneyRequestReport) {
                // Go back based on backTo param of the current route
                const lastRouteParams = lastRoute?.params;
                urlToNavigateBack = lastRouteParams && 'backTo' in lastRouteParams ? lastRouteParams?.backTo : undefined;
            } else {
                // Go back to the expense chat
                urlToNavigateBack = ROUTES.REPORT_WITH_ID.getRoute(report.chatReportID);
            }
        }
    } else if (hasMultipleExpenses && !shouldUseBulkAction) {
        if (isUserOnSearchPage || isUserOnSearchMoneyRequestReport) {
            // Navigate to the existing Reports > Expense view.
            urlToNavigateBack = undefined;
        } else {
            // Go back to the original expenses report
            urlToNavigateBack = ROUTES.REPORT_WITH_ID.getRoute(reportID);
        }
        // For reports with multiple expenses:
        // 1. Update report total
        // 2. Remove expense from report
        // 3. Add to existing draft report or create new one
        const existingOpenReport = Object.values(allReports ?? {}).find(
            (r) =>
                r?.reportID !== reportID &&
                r?.chatReportID === report.chatReportID &&
                r?.type === CONST.REPORT.TYPE.EXPENSE &&
                isOpenReport(r) &&
                r?.ownerAccountID === report.ownerAccountID,
        );

        if (existingOpenReport) {
            movedToReport = existingOpenReport;
            rejectedToReportID = existingOpenReport.reportID;

            const [, , iouAction, ,] = buildOptimisticMoneyRequestEntities({
                iouReport: movedToReport,
                type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                amount: transactionAmount,
                currency: getCurrency(transaction),
                comment,
                payeeEmail: getLoginByAccountID(report.ownerAccountID ?? CONST.DEFAULT_NUMBER_ID) ?? '',
                participants: [{accountID: report?.ownerAccountID}],
                transactionID: transaction.transactionID,
                existingTransactionThreadReportID: childReportID,
                shouldGenerateTransactionThreadReport: false,
            });
            createdIOUReportActionID = iouAction.reportActionID;

            optimisticData.push(
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT}${movedToReport?.reportID}`,
                    value: {
                        ...movedToReport,
                        total: (movedToReport?.total ?? 0) - transactionAmount,
                    },
                },
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${rejectedToReportID}`,
                    value: {[iouAction.reportActionID]: iouAction},
                },
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT}${childReportID}`,
                    value: {
                        parentReportActionID: iouAction.reportActionID,
                        parentReportID: rejectedToReportID,
                    },
                },
            );

            // Add success data for existing report update
            successData.push(
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT}${movedToReport?.reportID}`,
                    value: {pendingFields: {total: null}},
                },
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${rejectedToReportID}`,
                    value: {[iouAction.reportActionID]: {pendingAction: null}},
                },
            );

            failureData.push(
                // Add failure data to revert existing report total
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT}${movedToReport?.reportID}`,
                    value: {
                        total: movedToReport?.total ?? 0,
                        pendingFields: {total: null},
                    },
                },
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT}${childReportID}`,
                    value: {
                        parentReportActionID: transactionThreadReport?.parentReportActionID,
                        parentReportID: transactionThreadReport?.parentReportID,
                    },
                },
            );
        } else {
            // When no existing open report is found, use the sharedRejectedToReportID
            // so multiple sequential rejections land in the same destination report
            // Fallback to generating a fresh ID if not provided
            rejectedToReportID = rejectedToReportID ?? generateReportID();

            // Pass transaction for formula computation (e.g., {report:startdate})
            const reportTransactions: Record<string, OnyxTypes.Transaction> = {[transaction.transactionID]: transaction};

            const newExpenseReport = buildOptimisticExpenseReport(
                report.chatReportID,
                report?.policyID,
                report?.ownerAccountID ?? CONST.DEFAULT_NUMBER_ID,
                transactionAmount,
                getCurrency(transaction),
                transactionAmount,
                undefined,
                rejectedToReportID,
                reportTransactions,
            );
            const [, createdActionForExpenseReport, iouAction, ,] = buildOptimisticMoneyRequestEntities({
                iouReport: newExpenseReport,
                type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                amount: transactionAmount,
                currency: getCurrency(transaction),
                comment,
                payeeEmail: currentUserEmail,
                participants: [{accountID: report?.ownerAccountID}],
                transactionID: transaction.transactionID,
                existingTransactionThreadReportID: childReportID,
                shouldGenerateTransactionThreadReport: false,
            });

            reportPreviewAction = buildOptimisticReportPreview(policyExpenseChat, newExpenseReport, undefined, transaction, undefined);
            movedTransactionAction = buildOptimisticMovedTransactionAction(childReportID, newExpenseReport.reportID);
            createdIOUReportActionID = iouAction.reportActionID;
            expenseMovedReportActionID = movedTransactionAction.reportActionID;
            expenseCreatedReportActionID = createdActionForExpenseReport.reportActionID;
            newExpenseReport.parentReportActionID = reportPreviewAction.reportActionID;
            optimisticData.push(
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT}${policyExpenseChat?.reportID}`,
                    value: {
                        lastVisibleActionCreated: reportPreviewAction.created,
                    },
                },
                {
                    onyxMethod: Onyx.METHOD.SET,
                    key: `${ONYXKEYS.COLLECTION.REPORT}${rejectedToReportID}`,
                    value: {
                        ...newExpenseReport,
                        pendingFields: {createReport: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD},
                    },
                },
                {
                    onyxMethod: Onyx.METHOD.SET,
                    key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${rejectedToReportID}`,
                    value: {
                        isOptimisticReport: true,
                        hasOnceLoadedReportActions: true,
                    },
                },
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${rejectedToReportID}`,
                    value: {[createdActionForExpenseReport.reportActionID]: createdActionForExpenseReport, [iouAction.reportActionID]: iouAction},
                },
                {
                    onyxMethod: Onyx.METHOD.SET,
                    key: `${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${rejectedToReportID}`,
                    value: {
                        // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
                        parentReportID: report?.chatReportID,
                    },
                },
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${policyExpenseChat?.reportID}`,
                    value: {
                        [reportPreviewAction.reportActionID]: reportPreviewAction,
                    },
                },
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT}${childReportID}`,
                    value: {
                        parentReportActionID: iouAction.reportActionID,
                        parentReportID: rejectedToReportID,
                    },
                },
            );
            successData.push(
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT}${rejectedToReportID}`,
                    value: {
                        pendingFields: null,
                    },
                },
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${rejectedToReportID}`,
                    value: {
                        isOptimisticReport: null,
                    },
                },
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${rejectedToReportID}`,
                    value: {[createdActionForExpenseReport.reportActionID]: {pendingAction: null}, [iouAction.reportActionID]: {pendingAction: null}},
                },
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${policyExpenseChat?.reportID}`,
                    value: {
                        [reportPreviewAction.reportActionID]: {pendingAction: null},
                    },
                },
            );

            failureData.push(
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT}${policyExpenseChat?.reportID}`,
                    value: {
                        lastVisibleActionCreated: policyExpenseChat?.lastVisibleActionCreated,
                    },
                },
                {
                    onyxMethod: Onyx.METHOD.SET,
                    key: `${ONYXKEYS.COLLECTION.REPORT}${rejectedToReportID}`,
                    value: null,
                },
                {
                    onyxMethod: Onyx.METHOD.SET,
                    key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${rejectedToReportID}`,
                    value: null,
                },
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${rejectedToReportID}`,
                    value: null,
                },
                {
                    onyxMethod: Onyx.METHOD.SET,
                    key: `${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${rejectedToReportID}`,
                    value: null,
                },
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${policyExpenseChat?.reportID}`,
                    value: {
                        [reportPreviewAction.reportActionID]: null,
                    },
                },
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT}${childReportID}`,
                    value: {
                        parentReportActionID: transactionThreadReport?.parentReportActionID,
                        parentReportID: transactionThreadReport?.parentReportID,
                    },
                },
            );
        }
        optimisticData.push(
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
                value: {
                    total: (report?.total ?? 0) + transactionAmount,
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
                value: {
                    reportID: rejectedToReportID,
                    ...(transactionCommentCleanup ?? {}),
                },
            },
        );

        // Add success data for original report total update
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                pendingFields: null,
                errorFields: null,
            },
        });

        // Add success data for transaction update
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: {
                pendingAction: null,
                errorFields: null,
            },
        });

        // Add failure data to revert original report total
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                total: report?.total ?? 0,
            },
        });

        // Add failure data to revert transaction reportID
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: {
                reportID: transaction?.reportID ?? reportID,
            },
        });
    } else {
        // For reports with single expense
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                stateNum: CONST.REPORT.STATE_NUM.OPEN,
                statusNum: CONST.REPORT.STATUS_NUM.OPEN,
            },
        });

        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: {
                ...(transactionCommentCleanup ?? {}),
            },
        });

        // Add success data for report state update
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                pendingFields: {
                    stateNum: null,
                    statusNum: null,
                },
            },
        });

        // Add failure data to revert report state
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                stateNum: report?.stateNum,
                statusNum: report?.statusNum,
            },
        });

        if (isUserOnSearchPage || isUserOnSearchMoneyRequestReport) {
            // Navigate to the existing Reports > Expense view
            urlToNavigateBack = undefined;
        } else {
            // Go back to the original expenses report
            urlToNavigateBack = ROUTES.REPORT_WITH_ID.getRoute(reportID);
        }
    }

    // Add optimistic rejected actions to the child report
    optimisticData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${childReportID}`,
        value: {
            [optimisticRejectReportAction.reportActionID]: optimisticRejectReportAction,
            [optimisticRejectReportActionComment.reportActionID]: optimisticRejectReportActionComment,
            ...(movedTransactionAction ? {[movedTransactionAction.reportActionID]: movedTransactionAction} : {}),
        },
    });

    // Update hasOutstandingChildRequest on the chat report after all optimistic updates
    if (policyExpenseChat) {
        const excludedReportID = rejectedToReportID ?? reportID;
        const shouldHaveOutstandingChildRequest = hasOutstandingChildRequest(policyExpenseChat, excludedReportID, currentUserEmail, allTransactionViolations, undefined);

        if (policyExpenseChat.hasOutstandingChildRequest !== shouldHaveOutstandingChildRequest) {
            optimisticData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${policyExpenseChat.reportID}`,
                value: {
                    hasOutstandingChildRequest: shouldHaveOutstandingChildRequest,
                },
            });

            failureData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${policyExpenseChat.reportID}`,
                value: {
                    hasOutstandingChildRequest: policyExpenseChat.hasOutstandingChildRequest,
                },
            });
        }
    }

    // Add successData to clear pending actions when the server confirms
    successData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${childReportID}`,
        value: {
            [optimisticRejectReportAction.reportActionID]: {
                pendingAction: null,
            },
            [optimisticRejectReportActionComment.reportActionID]: {
                pendingAction: null,
            },
        },
    });

    // Add failureData to remove optimistic actions if the request fails
    failureData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${childReportID}`,
        value: {
            [optimisticRejectReportAction.reportActionID]: null,
            [optimisticRejectReportActionComment.reportActionID]: null,
        },
    });

    // Collect all reports that need lastReadTime and lastVisibleActionCreated updates
    const reportsToUpdate: Array<{reportID: string; lastVisibleActionCreated: string}> = [];

    // Add rter transaction violation
    if (!isIOU) {
        const currentTransactionViolations = allTransactionViolations?.[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction?.transactionID}`] ?? [];
        const newViolation = {
            name: CONST.VIOLATIONS.AUTO_REPORTED_REJECTED_EXPENSE,
            type: CONST.VIOLATION_TYPES.WARNING,
            data: {
                comment: comment ?? '',
                rejectedBy: currentUserEmail,
                rejectedDate: DateUtils.getDBTime(),
            },
            showInReview: true,
        };

        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction?.transactionID}`,
            value: [...currentTransactionViolations, newViolation],
        });

        // Add failure data to revert transaction violations
        failureData.push({
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction?.transactionID}`,
            value: currentTransactionViolations,
        });
    }

    // Child report (where rejected actions are added)
    if (childReportID) {
        reportsToUpdate.push({
            reportID: childReportID,
            lastVisibleActionCreated: optimisticRejectReportActionComment.created,
        });
    }

    // Moved to report (if transaction is moved to another report)
    if (rejectedToReportID && rejectedToReportID !== reportID) {
        reportsToUpdate.push({
            reportID: rejectedToReportID,
            lastVisibleActionCreated: optimisticRejectReportActionComment.created,
        });
    }

    const lastReadTime = DateUtils.subtractMillisecondsFromDateTime(optimisticRejectReportAction.created, 1);
    // Add optimistic data for all reports
    for (const {reportID: targetReportID, lastVisibleActionCreated} of reportsToUpdate) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${targetReportID}`,
            value: {
                lastReadTime,
                lastVisibleActionCreated,
            },
        });
    }

    // Add success data for all reports
    for (const {reportID: targetReportID} of reportsToUpdate) {
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${targetReportID}`,
            value: {
                pendingFields: null,
                errorFields: null,
            },
        });
    }

    // Add failure data to revert all reports
    for (const {reportID: targetReportID} of reportsToUpdate) {
        const targetReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${targetReportID}`];
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${targetReportID}`,
            value: {
                lastReadTime: targetReport?.lastReadTime,
                lastVisibleActionCreated: targetReport?.lastVisibleActionCreated,
            },
        });
    }

    // Build API parameters
    const parameters: RejectMoneyRequestParams = {
        transactionID,
        reportID,
        comment,
        rejectedToReportID,
        reportPreviewReportActionID: reportPreviewAction?.reportActionID,
        rejectedActionReportActionID: optimisticRejectReportAction.reportActionID,
        rejectedCommentReportActionID: optimisticRejectReportActionComment.reportActionID,
        createdIOUReportActionID,
        expenseMovedReportActionID,
        expenseCreatedReportActionID,
    };

    return {optimisticData, successData, failureData, parameters, urlToNavigateBack: urlToNavigateBack as Route};
}

function rejectMoneyRequest(transactionID: string, reportID: string, comment: string, policy: OnyxEntry<OnyxTypes.Policy>, options?: {sharedRejectedToReportID?: string}): Route | undefined {
    const data = prepareRejectMoneyRequestData(transactionID, reportID, comment, policy, options);
    if (!data) {
        return;
    }
    const {urlToNavigateBack, optimisticData, successData, failureData, parameters} = data;
    // Make API call
    API.write(WRITE_COMMANDS.REJECT_MONEY_REQUEST, parameters, {optimisticData, successData, failureData});

    return urlToNavigateBack;
}

function markRejectViolationAsResolved(transactionID: string, reportID?: string) {
    if (!reportID) {
        return;
    }

    const currentViolations = allTransactionViolations?.[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`];
    const updatedViolations = currentViolations?.filter((violation) => violation.name !== CONST.VIOLATIONS.AUTO_REPORTED_REJECTED_EXPENSE);
    const optimisticMarkedAsResolvedReportAction = buildOptimisticMarkedAsResolvedReportAction();

    // Build optimistic data
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [
        // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`,
            value: updatedViolations,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: {
                [optimisticMarkedAsResolvedReportAction.reportActionID]: optimisticMarkedAsResolvedReportAction,
            },
        },
    ];

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: {
                [optimisticMarkedAsResolvedReportAction.reportActionID]: {
                    pendingAction: null,
                },
            },
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [
        // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`,
            value: currentViolations,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: {
                [optimisticMarkedAsResolvedReportAction.reportActionID]: null,
            },
        },
    ];

    const parameters: MarkTransactionViolationAsResolvedParams = {
        transactionID,
        markedAsResolvedReportActionID: optimisticMarkedAsResolvedReportAction.reportActionID,
    };

    // Make API call
    API.write(WRITE_COMMANDS.MARK_TRANSACTION_VIOLATION_AS_RESOLVED, parameters, {
        optimisticData,
        successData,
        failureData,
    });

    const currentReportID = getDisplayedReportID(reportID);
    notifyNewAction(currentReportID, userAccountID);
}

function initSplitExpenseItemData(
    transaction: OnyxEntry<OnyxTypes.Transaction>,
    {amount, transactionID, reportID, created}: {amount?: number; transactionID?: string; reportID?: string; created?: string} = {},
): SplitExpense {
    const transactionDetails = getTransactionDetails(transaction);
    const currentReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${transaction?.reportID}`];

    return {
        transactionID: transactionID ?? transactionDetails?.transactionID ?? String(CONST.DEFAULT_NUMBER_ID),
        amount: amount ?? transactionDetails?.amount ?? 0,
        description: transactionDetails?.comment,
        category: transactionDetails?.category,
        tags: transaction?.tag ? [transaction?.tag] : [],
        created: created ?? transactionDetails?.created ?? DateUtils.formatWithUTCTimeZone(DateUtils.getDBTime(), CONST.DATE.FNS_FORMAT_STRING),
        merchant: transaction?.modifiedMerchant ? transaction.modifiedMerchant : (transaction?.merchant ?? ''),
        statusNum: currentReport?.statusNum ?? 0,
        reportID: reportID ?? transaction?.reportID ?? String(CONST.DEFAULT_NUMBER_ID),
        reimbursable: transactionDetails?.reimbursable,
    };
}

/**
 * Create a draft transaction to set up split expense details for the split expense flow
 */
function initSplitExpense(transactions: OnyxCollection<OnyxTypes.Transaction>, reports: OnyxCollection<OnyxTypes.Report>, transaction: OnyxEntry<OnyxTypes.Transaction>) {
    if (!transaction) {
        return;
    }

    const reportID = transaction.reportID ?? String(CONST.DEFAULT_NUMBER_ID);
    const originalTransactionID = transaction?.comment?.originalTransactionID;
    const originalTransaction = transactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${originalTransactionID}`];
    const {isExpenseSplit} = getOriginalTransactionWithSplitInfo(transaction, originalTransaction);

    if (isExpenseSplit) {
        const relatedTransactions = getChildTransactions(transactions, reports, originalTransactionID);
        const transactionDetails = getTransactionDetails(originalTransaction);
        const splitExpenses = relatedTransactions.map((currentTransaction) => initSplitExpenseItemData(currentTransaction));
        const draftTransaction = buildOptimisticTransaction({
            originalTransactionID,
            transactionParams: {
                splitExpenses,
                splitExpensesTotal: splitExpenses.reduce((total, item) => total + item.amount, 0),
                amount: transactionDetails?.amount ?? 0,
                currency: transactionDetails?.currency ?? CONST.CURRENCY.USD,
                participants: transaction?.participants,
                merchant: transaction?.modifiedMerchant ? transaction.modifiedMerchant : (transaction?.merchant ?? ''),
                attendees: transactionDetails?.attendees as Attendee[],
                reportID,
                reimbursable: transactionDetails?.reimbursable,
            },
        });

        Onyx.set(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${originalTransactionID}`, draftTransaction);
        if (isSearchTopmostFullScreenRoute()) {
            Navigation.navigate(ROUTES.SPLIT_EXPENSE_SEARCH.getRoute(reportID, originalTransactionID, transaction.transactionID, Navigation.getActiveRoute()));
        } else {
            Navigation.navigate(ROUTES.SPLIT_EXPENSE.getRoute(reportID, originalTransactionID, transaction.transactionID, Navigation.getActiveRoute()));
        }
        return;
    }

    const transactionDetails = getTransactionDetails(transaction);
    const transactionDetailsAmount = transactionDetails?.amount ?? 0;

    const splitExpenses = [
        initSplitExpenseItemData(transaction, {amount: calculateIOUAmount(1, transactionDetailsAmount, transactionDetails?.currency ?? '', false), transactionID: NumberUtils.rand64()}),
        initSplitExpenseItemData(transaction, {amount: calculateIOUAmount(1, transactionDetailsAmount, transactionDetails?.currency ?? '', true), transactionID: NumberUtils.rand64()}),
    ];

    const draftTransaction = buildOptimisticTransaction({
        originalTransactionID: transaction.transactionID,
        transactionParams: {
            splitExpenses,
            splitExpensesTotal: splitExpenses.reduce((total, item) => total + item.amount, 0),
            amount: transactionDetailsAmount,
            currency: transactionDetails?.currency ?? CONST.CURRENCY.USD,
            merchant: transactionDetails?.merchant ?? '',
            participants: transaction?.participants,
            attendees: transactionDetails?.attendees as Attendee[],
            reportID,
            reimbursable: transactionDetails?.reimbursable,
        },
    });

    Onyx.set(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transaction?.transactionID}`, draftTransaction);

    if (isSearchTopmostFullScreenRoute()) {
        Navigation.navigate(ROUTES.SPLIT_EXPENSE_SEARCH.getRoute(reportID, transaction.transactionID, undefined, Navigation.getActiveRoute()));
    } else {
        Navigation.navigate(ROUTES.SPLIT_EXPENSE.getRoute(reportID, transaction.transactionID, undefined, Navigation.getActiveRoute()));
    }
}

/**
 * Create a draft transaction to set up split expense details for edit split details
 */
function initDraftSplitExpenseDataForEdit(draftTransaction: OnyxEntry<OnyxTypes.Transaction>, splitExpenseTransactionID: string, reportID: string) {
    if (!draftTransaction || !splitExpenseTransactionID) {
        return;
    }
    const originalTransactionID = draftTransaction?.comment?.originalTransactionID;
    const originalTransaction = allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${originalTransactionID}`];
    const splitTransactionData = draftTransaction?.comment?.splitExpenses?.find((item) => item.transactionID === splitExpenseTransactionID);

    const transactionDetails = getTransactionDetails(originalTransaction);

    const editDraftTransaction = buildOptimisticTransaction({
        existingTransactionID: CONST.IOU.OPTIMISTIC_TRANSACTION_ID,
        originalTransactionID,
        transactionParams: {
            amount: Number(splitTransactionData?.amount),
            currency: transactionDetails?.currency ?? CONST.CURRENCY.USD,
            comment: splitTransactionData?.description,
            tag: splitTransactionData?.tags?.at(0),
            merchant: splitTransactionData?.merchant,
            participants: draftTransaction?.participants,
            attendees: transactionDetails?.attendees as Attendee[],
            reportID,
            created: splitTransactionData?.created ?? '',
            category: splitTransactionData?.category ?? '',
        },
    });

    Onyx.set(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`, editDraftTransaction);

    Navigation.navigate(ROUTES.SPLIT_EXPENSE_EDIT.getRoute(reportID, originalTransactionID, splitTransactionData?.transactionID, Navigation.getActiveRoute()));
}

/**
 * Append a new split expense entry to the draft transaction's splitExpenses array
 */
function addSplitExpenseField(transaction: OnyxEntry<OnyxTypes.Transaction>, draftTransaction: OnyxEntry<OnyxTypes.Transaction>) {
    if (!transaction || !draftTransaction) {
        return;
    }

    Onyx.merge(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transaction.transactionID}`, {
        comment: {
            splitExpenses: [
                ...(draftTransaction.comment?.splitExpenses ?? []),
                initSplitExpenseItemData(transaction, {
                    amount: 0,
                    transactionID: NumberUtils.rand64(),
                    reportID: draftTransaction?.reportID,
                }),
            ],
            splitsStartDate: null,
            splitsEndDate: null,
        },
    });
}

/**
 * Evenly distribute the draft split expense amounts across all split items.
 * Remainders are added to the first or last item to ensure the total matches the original amount.
 *
 * Notes:
 * - Works entirely on the provided `draftTransaction` to avoid direct Onyx reads.
 * - Uses `calculateAmount` utility to handle currency subunits and rounding consistently with existing logic.
 */
function evenlyDistributeSplitExpenseAmounts(draftTransaction: OnyxEntry<OnyxTypes.Transaction>) {
    if (!draftTransaction) {
        return;
    }

    const originalTransactionID = draftTransaction?.comment?.originalTransactionID;
    const splitExpenses = draftTransaction?.comment?.splitExpenses ?? [];
    const currency = getCurrency(draftTransaction);

    // Use allowNegative=true and disableOppositeConversion=true to preserve original amount sign
    const total = getAmount(draftTransaction, undefined, undefined, true, true);

    // Guard clause for missing data
    if (!originalTransactionID || splitExpenses.length === 0) {
        return;
    }

    // Floor-allocation with full remainder added to the last split so the last is always the largest
    const splitCount = splitExpenses.length;
    const lastIndex = splitCount - 1;

    const updatedSplitExpenses = splitExpenses.map((splitExpense, index) => ({
        ...splitExpense,
        amount: calculateIOUAmount(splitCount - 1, total, currency, index === lastIndex, true),
    }));

    Onyx.merge(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${originalTransactionID}`, {
        comment: {
            splitExpenses: updatedSplitExpenses,
        },
    });
}

/**
 * Reset all split expenses and create new ones based on the date range.
 * The original amount is distributed proportionally across all dates.
 *
 * @param transaction - The transaction containing split expenses
 * @param startDate - Start date in format 'YYYY-MM-DD'
 * @param endDate - End date in format 'YYYY-MM-DD'
 */
function resetSplitExpensesByDateRange(transaction: OnyxEntry<OnyxTypes.Transaction>, startDate: string, endDate: string) {
    if (!transaction || !startDate || !endDate) {
        return;
    }

    // Generate all dates in the range
    const dates = eachDayOfInterval({
        start: new Date(startDate),
        end: new Date(endDate),
    });

    const transactionDetails = getTransactionDetails(transaction);
    const total = transactionDetails?.amount ?? 0;
    const currency = transactionDetails?.currency ?? CONST.CURRENCY.USD;

    // Create split expenses for each date with proportional amounts
    const lastIndex = dates.length - 1;
    const newSplitExpenses: SplitExpense[] = dates.map((date, index) => {
        return initSplitExpenseItemData(transaction, {
            amount: calculateIOUAmount(lastIndex, total, currency, index === lastIndex, true),
            transactionID: NumberUtils.rand64(),
            reportID: transaction?.reportID,
            created: format(date, CONST.DATE.FNS_FORMAT_STRING),
        });
    });

    Onyx.merge(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transaction.transactionID}`, {
        comment: {
            splitExpenses: newSplitExpenses,
            splitsStartDate: startDate,
            splitsEndDate: endDate,
        },
    });
}

function removeSplitExpenseField(draftTransaction: OnyxEntry<OnyxTypes.Transaction>, splitExpenseTransactionID: string) {
    if (!draftTransaction || !splitExpenseTransactionID) {
        return;
    }

    const originalTransactionID = draftTransaction?.comment?.originalTransactionID;

    const splitExpenses = draftTransaction.comment?.splitExpenses?.filter((item) => item.transactionID !== splitExpenseTransactionID);

    Onyx.merge(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${originalTransactionID}`, {
        comment: {
            splitExpenses,
            splitsStartDate: null,
            splitsEndDate: null,
        },
    });
}

function updateSplitExpenseField(
    splitExpenseDraftTransaction: OnyxEntry<OnyxTypes.Transaction>,
    originalTransactionDraft: OnyxEntry<OnyxTypes.Transaction>,
    splitExpenseTransactionID: string,
) {
    if (!splitExpenseDraftTransaction || !splitExpenseTransactionID || !originalTransactionDraft) {
        return;
    }

    const originalTransactionID = splitExpenseDraftTransaction?.comment?.originalTransactionID;
    const transactionDetails = getTransactionDetails(splitExpenseDraftTransaction);
    let shouldResetDateRange = false;

    const splitExpenses = originalTransactionDraft?.comment?.splitExpenses?.map((item) => {
        if (item.transactionID === splitExpenseTransactionID) {
            if (transactionDetails?.created !== item.created) {
                shouldResetDateRange = true;
            }
            return {
                ...item,
                description: transactionDetails?.comment,
                category: transactionDetails?.category,
                tags: splitExpenseDraftTransaction?.tag ? [splitExpenseDraftTransaction?.tag] : [],
                created: transactionDetails?.created ?? DateUtils.formatWithUTCTimeZone(DateUtils.getDBTime(), CONST.DATE.FNS_FORMAT_STRING),
            };
        }
        return item;
    });

    Onyx.merge(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${originalTransactionID}`, {
        comment: {
            splitExpenses,
            // Reset date range if the created date was modified
            splitsStartDate: shouldResetDateRange ? null : originalTransactionDraft?.comment?.splitsStartDate,
            splitsEndDate: shouldResetDateRange ? null : originalTransactionDraft?.comment?.splitsEndDate,
        },
    });
}

function updateSplitExpenseAmountField(draftTransaction: OnyxEntry<OnyxTypes.Transaction>, currentItemTransactionID: string, amount: number) {
    if (!draftTransaction?.transactionID || !currentItemTransactionID) {
        return;
    }

    const updatedSplitExpenses = draftTransaction.comment?.splitExpenses?.map((splitExpense) => {
        if (splitExpense.transactionID === currentItemTransactionID) {
            return {
                ...splitExpense,
                amount,
            };
        }
        return splitExpense;
    });

    Onyx.merge(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${draftTransaction?.comment?.originalTransactionID}`, {
        comment: {
            splitExpenses: updatedSplitExpenses,
        },
    });
}

/**
 * Clear errors from split transaction draft
 */
function clearSplitTransactionDraftErrors(transactionID: string | undefined) {
    if (!transactionID) {
        return;
    }

    Onyx.merge(`${ONYXKEYS.COLLECTION.SPLIT_TRANSACTION_DRAFT}${transactionID}`, {
        errors: null,
    });
}

function assignReportToMe(
    report: OnyxTypes.Report,
    accountID: number,
    email: string,
    policy: OnyxEntry<OnyxTypes.Policy>,
    hasViolations: boolean,
    isASAPSubmitBetaEnabled: boolean,
    reportCurrentNextStepDeprecated: OnyxEntry<OnyxTypes.ReportNextStepDeprecated>,
) {
    const takeControlReportAction = buildOptimisticChangeApproverReportAction(accountID, accountID);

    // buildOptimisticNextStep is used in parallel
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const optimisticNextStepDeprecated = buildNextStepNew({
        report: {...report, managerID: accountID},
        predictedNextStatus: report.statusNum ?? CONST.REPORT.STATUS_NUM.SUBMITTED,
        shouldFixViolations: false,
        isUnapprove: true,
        policy,
        currentUserAccountIDParam: accountID,
        currentUserEmailParam: email,
        hasViolations,
        isASAPSubmitBetaEnabled,
        bypassNextApproverID: accountID,
    });
    const optimisticNextStep = buildOptimisticNextStep({
        report: {...report, managerID: accountID},
        predictedNextStatus: report.statusNum ?? CONST.REPORT.STATUS_NUM.SUBMITTED,
        shouldFixViolations: false,
        isUnapprove: true,
        policy,
        currentUserAccountIDParam: accountID,
        currentUserEmailParam: email,
        hasViolations,
        isASAPSubmitBetaEnabled,
        bypassNextApproverID: accountID,
    });

    const onyxData: OnyxData<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.NEXT_STEP> = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`,
                value: {
                    managerID: accountID,
                    nextStep: optimisticNextStep,
                    pendingFields: {
                        nextStep: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    },
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`,
                value: {
                    [takeControlReportAction.reportActionID]: takeControlReportAction,
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.NEXT_STEP}${report.reportID}`,
                value: optimisticNextStepDeprecated,
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`,
                value: {
                    pendingFields: {
                        nextStep: null,
                    },
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`,
                value: {
                    [takeControlReportAction.reportActionID]: {
                        pendingAction: null,
                        isOptimisticAction: null,
                        errors: null,
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`,
                value: {
                    managerID: report.managerID,
                    nextStep: report.nextStep ?? null,
                    pendingFields: {
                        nextStep: null,
                    },
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.NEXT_STEP}${report?.reportID}`,
                value: reportCurrentNextStepDeprecated ?? null,
            },
        ],
    };

    const params: AssignReportToMeParams = {
        reportID: report.reportID,
        reportActionID: takeControlReportAction.reportActionID,
    };

    API.write(WRITE_COMMANDS.ASSIGN_REPORT_TO_ME, params, onyxData);
}

function addReportApprover(
    report: OnyxTypes.Report,
    newApproverEmail: string,
    newApproverAccountID: number,
    accountID: number,
    email: string,
    policy: OnyxEntry<OnyxTypes.Policy>,
    hasViolations: boolean,
    isASAPSubmitBetaEnabled: boolean,
    reportCurrentNextStepDeprecated: OnyxEntry<OnyxTypes.ReportNextStepDeprecated>,
) {
    const takeControlReportAction = buildOptimisticChangeApproverReportAction(newApproverAccountID, accountID);

    // buildOptimisticNextStep is used in parallel
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const optimisticNextStepDeprecated = buildNextStepNew({
        report: {...report, managerID: newApproverAccountID},
        predictedNextStatus: report.statusNum ?? CONST.REPORT.STATUS_NUM.SUBMITTED,
        shouldFixViolations: false,
        isUnapprove: true,
        policy,
        currentUserAccountIDParam: accountID,
        currentUserEmailParam: email,
        hasViolations,
        isASAPSubmitBetaEnabled,
        bypassNextApproverID: newApproverAccountID,
    });
    const optimisticNextStep = buildOptimisticNextStep({
        report: {...report, managerID: newApproverAccountID},
        predictedNextStatus: report.statusNum ?? CONST.REPORT.STATUS_NUM.SUBMITTED,
        shouldFixViolations: false,
        isUnapprove: true,
        policy,
        currentUserAccountIDParam: accountID,
        currentUserEmailParam: email,
        hasViolations,
        isASAPSubmitBetaEnabled,
        bypassNextApproverID: newApproverAccountID,
    });
    const onyxData: OnyxData<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.NEXT_STEP> = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`,
                value: {
                    managerID: newApproverAccountID,
                    nextStep: optimisticNextStep,
                    pendingFields: {
                        nextStep: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    },
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`,
                value: {
                    [takeControlReportAction.reportActionID]: takeControlReportAction,
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.NEXT_STEP}${report.reportID}`,
                value: optimisticNextStepDeprecated,
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`,
                value: {
                    pendingFields: {
                        nextStep: null,
                    },
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.reportID}`,
                value: {
                    [takeControlReportAction.reportActionID]: {
                        pendingAction: null,
                        errors: null,
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`,
                value: {
                    managerID: report.managerID,
                    nextStep: report.nextStep ?? null,
                    pendingFields: {
                        nextStep: null,
                    },
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.NEXT_STEP}${report?.reportID}`,
                value: reportCurrentNextStepDeprecated ?? null,
            },
        ],
    };

    const params: AddReportApproverParams = {
        reportID: report.reportID,
        reportActionID: takeControlReportAction.reportActionID,
        newApproverEmail,
    };

    API.write(WRITE_COMMANDS.ADD_REPORT_APPROVER, params, onyxData);
}

function updateMultipleMoneyRequests(
    transactionIDs: string[],
    changes: TransactionChanges,
    policy: OnyxEntry<OnyxTypes.Policy>,
    reports: OnyxCollection<OnyxTypes.Report>,
    transactions: OnyxCollection<OnyxTypes.Transaction>,
    reportActions: OnyxCollection<OnyxTypes.ReportActions>,
) {
    // Track running totals per report so multiple edits in the same report compound correctly.
    const optimisticReportsByID: Record<string, OnyxTypes.Report> = {};
    for (const transactionID of transactionIDs) {
        const transaction = transactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
        if (!transaction) {
            continue;
        }

        const iouReport = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${transaction.reportID}`] ?? null;
        const baseIouReport = iouReport?.reportID ? (optimisticReportsByID[iouReport.reportID] ?? iouReport) : iouReport;
        const isFromExpenseReport = isExpenseReport(baseIouReport);

        const transactionReportActions = reportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transaction.reportID}`] ?? {};
        const reportAction = getIOUActionForTransactionID(Object.values(transactionReportActions), transactionID);
        const transactionThreadReportID = transaction.transactionThreadReportID ?? reportAction?.childReportID;
        const transactionThread = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`] ?? null;

        const canEditField = (field: ValueOf<typeof CONST.EDIT_REQUEST_FIELD>) => {
            return canEditFieldOfMoneyRequest(reportAction, field, undefined, false, undefined, transaction, iouReport, policy);
        };

        const transactionChanges: TransactionChanges = {};

        if (changes.merchant && canEditField(CONST.EDIT_REQUEST_FIELD.MERCHANT)) {
            transactionChanges.merchant = changes.merchant;
        }
        if (changes.created && canEditField(CONST.EDIT_REQUEST_FIELD.DATE)) {
            transactionChanges.created = changes.created;
        }
        if (changes.amount && canEditField(CONST.EDIT_REQUEST_FIELD.AMOUNT)) {
            transactionChanges.amount = changes.amount;
        }
        if (changes.currency && canEditField(CONST.EDIT_REQUEST_FIELD.CURRENCY)) {
            transactionChanges.currency = changes.currency;
        }
        if (changes.category && canEditField(CONST.EDIT_REQUEST_FIELD.CATEGORY)) {
            transactionChanges.category = changes.category;
        }
        if (changes.tag && canEditField(CONST.EDIT_REQUEST_FIELD.TAG)) {
            transactionChanges.tag = changes.tag;
        }
        if (changes.comment && canEditField(CONST.EDIT_REQUEST_FIELD.DESCRIPTION)) {
            transactionChanges.comment = changes.comment;
        }
        if (changes.taxCode && canEditField(CONST.EDIT_REQUEST_FIELD.TAX_RATE)) {
            transactionChanges.taxCode = changes.taxCode;
        }
        if (changes.billable !== undefined && canEditField(CONST.EDIT_REQUEST_FIELD.BILLABLE)) {
            transactionChanges.billable = changes.billable;
        }
        if (changes.reimbursable !== undefined && canEditField(CONST.EDIT_REQUEST_FIELD.REIMBURSABLE)) {
            transactionChanges.reimbursable = changes.reimbursable;
        }

        const updates: Record<string, string | number> = {};
        if (transactionChanges.merchant) {
            updates.merchant = transactionChanges.merchant;
        }
        if (transactionChanges.created) {
            updates.created = transactionChanges.created;
        }
        if (transactionChanges.currency) {
            updates.currency = transactionChanges.currency;
        }
        if (transactionChanges.category) {
            updates.category = transactionChanges.category;
        }
        if (transactionChanges.tag) {
            updates.tag = transactionChanges.tag;
        }
        if (transactionChanges.comment) {
            updates.comment = transactionChanges.comment;
        }
        if (transactionChanges.taxCode) {
            updates.taxCode = transactionChanges.taxCode;
        }
        if (transactionChanges.amount) {
            updates.amount = transactionChanges.amount;
        }
        if (transactionChanges.billable !== undefined || transactionChanges.reimbursable !== undefined) {
            const billable = transactionChanges.billable;
            const reimbursable = transactionChanges.reimbursable;

            if (billable && reimbursable) {
                updates.state = CONST.TRANSACTION.STATE_NUM.REIMBURSABLE_BILLABLE;
            } else if (billable) {
                updates.state = CONST.TRANSACTION.STATE_NUM.BILLABLE;
            } else if (reimbursable) {
                updates.state = CONST.TRANSACTION.STATE_NUM.REIMBURSABLE;
            }
        }

        // Skip if no updates
        if (Object.keys(updates).length === 0) {
            continue;
        }

        // Generate optimistic report action ID
        const modifiedExpenseReportActionID = NumberUtils.rand64();

        const optimisticData: OnyxUpdate[] = [];
        const successData: OnyxUpdate[] = [];
        const failureData: OnyxUpdate[] = [];

        // Pending fields for the transaction
        const pendingFields: OnyxTypes.Transaction['pendingFields'] = Object.fromEntries(Object.keys(transactionChanges).map((field) => [field, CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE]));
        const clearedPendingFields = getClearedPendingFields(transactionChanges);

        const errorFields = Object.fromEntries(
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            Object.keys(pendingFields).map((field) => [field, {[DateUtils.getMicroseconds()]: Localize.translateLocal('iou.error.genericEditFailureMessage')}]),
        );

        // Build updated transaction
        const updatedTransaction = getUpdatedTransaction({
            transaction,
            transactionChanges,
            isFromExpenseReport,
            policy,
        });
        const isTransactionOnHold = isOnHold(transaction);

        // Optimistic transaction update
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: {
                ...updatedTransaction,
                pendingFields,
                isLoading: false,
                errorFields: null,
            },
        });

        // Build optimistic modified expense report action
        const optimisticReportAction = buildOptimisticModifiedExpenseReportAction(transactionThread, transaction, transactionChanges, isFromExpenseReport, policy, updatedTransaction);

        const {updatedMoneyRequestReport, isTotalIndeterminate} = getUpdatedMoneyRequestReportData(
            baseIouReport,
            updatedTransaction,
            transaction,
            isTransactionOnHold,
            policy,
            optimisticReportAction?.actorAccountID,
        );

        if (updatedMoneyRequestReport) {
            if (updatedMoneyRequestReport.reportID) {
                optimisticReportsByID[updatedMoneyRequestReport.reportID] = updatedMoneyRequestReport;
            }
            optimisticData.push(
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport?.reportID}`,
                    value: {...updatedMoneyRequestReport, ...(isTotalIndeterminate && {pendingFields: {total: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}})},
                },
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport?.parentReportID}`,
                    value: getOutstandingChildRequest(updatedMoneyRequestReport),
                },
            );
            successData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport?.reportID}`,
                value: {pendingAction: null, ...(isTotalIndeterminate && {pendingFields: {total: null}})},
            });
            failureData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport?.reportID}`,
                value: {...iouReport, ...(isTotalIndeterminate && {pendingFields: {total: null}})},
            });
        }

        // Optimistic report action
        if (transactionThreadReportID) {
            optimisticData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`,
                value: {
                    [modifiedExpenseReportActionID]: {
                        ...optimisticReportAction,
                        reportActionID: modifiedExpenseReportActionID,
                    },
                },
            });
            optimisticData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`,
                value: {
                    lastReadTime: optimisticReportAction.created,
                },
            });
            failureData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`,
                value: {
                    lastReadTime: transactionThread?.lastReadTime,
                },
            });
        }

        // Success data - clear pending fields
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: {
                pendingFields: clearedPendingFields,
            },
        });

        if (transactionThreadReportID) {
            successData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`,
                value: {
                    [modifiedExpenseReportActionID]: {pendingAction: null},
                },
            });
        }

        // Failure data - revert transaction
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: {
                ...transaction,
                pendingFields: clearedPendingFields,
                errorFields,
            },
        });

        // Failure data - remove optimistic report action
        if (transactionThreadReportID) {
            failureData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`,
                value: {
                    [modifiedExpenseReportActionID]: {
                        pendingAction: null,
                        errors: getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericEditFailureMessage'),
                    },
                },
            });
        }

        const params = {
            transactionID,
            reportActionID: modifiedExpenseReportActionID,
            updates: JSON.stringify(updates),
        };

        API.write(WRITE_COMMANDS.UPDATE_MONEY_REQUEST, params, {optimisticData, successData, failureData});
    }
}

/**
 * Initializes the bulk-edit draft transaction under one fixed placeholder ID.
 * We keep a single draft in Onyx to store the shared edits for a multi-select,
 * then apply those edits to each real transaction later. The placeholder ID is
 * just the storage key and never equals any actual transactionID.
 */
function initBulkEditDraftTransaction() {
    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_BULK_EDIT_TRANSACTION_ID}`, {
        transactionID: CONST.IOU.OPTIMISTIC_BULK_EDIT_TRANSACTION_ID,
    });
}

/**
 * Clears the draft transaction used for bulk editing
 */
function clearBulkEditDraftTransaction() {
    Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_BULK_EDIT_TRANSACTION_ID}`, null);
}

/**
 * Updates the draft transaction for bulk editing multiple expenses
 */
function updateBulkEditDraftTransaction(transactionChanges: Partial<OnyxTypes.Transaction>) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_BULK_EDIT_TRANSACTION_ID}`, transactionChanges);
}

export {
    adjustRemainingSplitShares,
    approveMoneyRequest,
    canApproveIOU,
    canUnapproveIOU,
    cancelPayment,
    canIOUBePaid,
    canCancelPayment,
    cleanUpMoneyRequest,
    clearMoneyRequest,
    createDistanceRequest,
    createDraftTransaction,
    deleteMoneyRequest,
    deleteTrackExpense,
    detachReceipt,
    getIOURequestPolicyID,
    getReportOriginalCreationTimestamp,
    initMoneyRequest,
    checkIfScanFileCanBeRead,
    dismissModalAndOpenReportInInboxTab,
    navigateToStartStepIfScanFileCannotBeRead,
    completePaymentOnboarding,
    convertBulkTrackedExpensesToIOU,
    payInvoice,
    payMoneyRequest,
    replaceReceipt,
    requestMoney,
    resetSplitShares,
    resetDraftTransactionsCustomUnit,
    savePreferredPaymentMethod,
    setCustomUnitRateID,
    setCustomUnitID,
    removeSubrate,
    addSubrate,
    updateSubrate,
    clearSubrates,
    setDraftSplitTransaction,
    setIndividualShare,
    setMoneyRequestAmount,
    setMoneyRequestAttendees,
    setMoneyRequestAccountant,
    setMoneyRequestBillable,
    setMoneyRequestCategory,
    setMoneyRequestCreated,
    setMoneyRequestDateAttribute,
    setMoneyRequestCurrency,
    setMoneyRequestDescription,
    setMoneyRequestDistance,
    setMoneyRequestDistanceRate,
    setMoneyRequestOdometerReading,
    setMoneyRequestMerchant,
    setMoneyRequestParticipants,
    setMoneyRequestParticipantsFromReport,
    getMoneyRequestParticipantsFromReport,
    setMoneyRequestReportID,
    setMoneyRequestPendingFields,
    setMultipleMoneyRequestParticipantsFromReport,
    setMoneyRequestReceipt,
    setMoneyRequestTag,
    setMoneyRequestTaxAmount,
    setMoneyRequestTaxRate,
    setSplitShares,
    startMoneyRequest,
    submitReport,
    trackExpense,
    unapproveExpenseReport,
    updateMoneyRequestAttendees,
    updateMoneyRequestAmountAndCurrency,
    updateMoneyRequestReimbursable,
    updateMoneyRequestBillable,
    updateMoneyRequestCategory,
    updateMoneyRequestDate,
    updateMoneyRequestDescription,
    updateMoneyRequestDistance,
    updateMoneyRequestDistanceRate,
    updateMoneyRequestMerchant,
    updateMoneyRequestTag,
    updateMoneyRequestTaxAmount,
    updateMoneyRequestTaxRate,
    updateLastLocationPermissionPrompt,
    shouldOptimisticallyUpdateSearch,
    getIOUReportActionToApproveOrPay,
    getNavigationUrlOnMoneyRequestDelete,
    getNavigationUrlAfterTrackExpenseDelete,
    canSubmitReport,
    submitPerDiemExpense,
    calculateDiffAmount,
    dismissRejectUseExplanation,
    rejectMoneyRequest,
    prepareRejectMoneyRequestData,
    markRejectViolationAsResolved,
    setMoneyRequestReimbursable,
    computePerDiemExpenseAmount,
    isValidPerDiemExpenseAmount,
    initSplitExpense,
    initSplitExpenseItemData,
    addSplitExpenseField,
    evenlyDistributeSplitExpenseAmounts,
    resetSplitExpensesByDateRange,
    updateSplitExpenseAmountField,
    initDraftSplitExpenseDataForEdit,
    removeSplitExpenseField,
    updateSplitExpenseField,
    reopenReport,
    retractReport,
    startDistanceRequest,
    clearSplitTransactionDraftErrors,
    assignReportToMe,
    getPerDiemExpenseInformation,
    addReportApprover,
    hasOutstandingChildRequest,
    getUpdateMoneyRequestParams,
    getUpdateTrackExpenseParams,
    getReportPreviewAction,
    updateMultipleMoneyRequests,
    initBulkEditDraftTransaction,
    clearBulkEditDraftTransaction,
    updateBulkEditDraftTransaction,
    mergePolicyRecentlyUsedCurrencies,
    mergePolicyRecentlyUsedCategories,
    getAllPersonalDetails,
    getAllTransactions,
    getAllTransactionViolations,
    getAllReports,
    getAllReportActionsFromIOU,
    getCurrentUserEmail,
    getUserAccountID,
    getReceiptError,
    getSearchOnyxUpdate,
    setMoneyRequestTimeRate,
    setMoneyRequestTimeCount,
    buildMinimalTransactionForFormula,
    buildOnyxDataForMoneyRequest,
    createSplitsAndOnyxData,
    getDeleteTrackExpenseInformation,
    getMoneyRequestInformation,
    getOrCreateOptimisticSplitChatReport,
};
export type {
    GPSPoint as GpsPoint,
    IOURequestType,
    StartSplitBilActionParams,
    CreateTrackExpenseParams,
    RequestMoneyInformation,
    ReplaceReceipt,
    RequestMoneyParticipantParams,
    PerDiemExpenseTransactionParams,
    UpdateMoneyRequestData,
    BasePolicyParams,
    MoneyRequestInformationParams,
    OneOnOneIOUReport,
    RejectMoneyRequestData,
    CreateDistanceRequestInformation,
};
