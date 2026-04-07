/* eslint-disable max-lines */
import {format} from 'date-fns';
import {fastMerge} from 'expensify-common';
import cloneDeep from 'lodash/cloneDeep';
// eslint-disable-next-line you-dont-need-lodash-underscore/union-by
import lodashUnionBy from 'lodash/unionBy';
import {InteractionManager} from 'react-native';
import type {NullishDeep, OnyxCollection, OnyxEntry, OnyxInputValue, OnyxKey, OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import ReceiptGeneric from '@assets/images/receipt-generic.png';
import type {PaymentMethod} from '@components/KYCWall/types';
import type {SearchQueryJSON} from '@components/Search/types';
import * as API from '@libs/API';
import type {
    AddReportApproverParams,
    ApproveMoneyRequestParams,
    AssignReportToMeParams,
    CreateDistanceRequestParams,
    DeleteMoneyRequestParams,
    DetachReceiptParams,
    MarkTransactionViolationAsResolvedParams,
    PayInvoiceParams,
    PayMoneyRequestParams,
    RejectExpenseReportParams,
    RejectMoneyRequestParams,
    ReopenReportParams,
    ReplaceReceiptParams,
    RetractReportParams,
    SetNameValuePairParams,
    SubmitReportParams,
    UnapproveExpenseReportParams,
    UpdateMoneyRequestParams,
} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import {convertToBackendAmount, convertToDisplayString, getCurrencyDecimals} from '@libs/CurrencyUtils';
import DateUtils from '@libs/DateUtils';
import {registerDeferredWrite} from '@libs/deferredLayoutWrite';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import {getMicroSecondOnyxErrorObject, getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import {isLocalFile, readFileAsync} from '@libs/fileDownload/FileUtils';
import type {MinimalTransaction} from '@libs/Formula';
import getIsNarrowLayout from '@libs/getIsNarrowLayout';
import {getGPSRoutes, getGPSWaypoints} from '@libs/GPSDraftDetailsUtils';
import {calculateAmount as calculateIOUAmount, formatCurrentUserToAttendee, navigateToStartMoneyRequestStep, updateIOUOwnerAndTotal} from '@libs/IOUUtils';
import {formatPhoneNumber} from '@libs/LocalePhoneNumber';
import * as Localize from '@libs/Localize';
import Log from '@libs/Log';
import isReportOpenInRHP from '@libs/Navigation/helpers/isReportOpenInRHP';
import isReportOpenInSuperWideRHP from '@libs/Navigation/helpers/isReportOpenInSuperWideRHP';
import isReportTopmostSplitNavigator from '@libs/Navigation/helpers/isReportTopmostSplitNavigator';
import isSearchTopmostFullScreenRoute from '@libs/Navigation/helpers/isSearchTopmostFullScreenRoute';
import Navigation, {navigationRef} from '@libs/Navigation/Navigation';
import {isOffline} from '@libs/Network/NetworkStore';
// eslint-disable-next-line @typescript-eslint/no-deprecated
import {buildNextStepNew, buildOptimisticNextStep} from '@libs/NextStepUtils';
import {roundToTwoDecimalPlaces} from '@libs/NumberUtils';
import * as NumberUtils from '@libs/NumberUtils';
import revokeOdometerImageUri from '@libs/OdometerImageUtils';
import {getManagerMcTestParticipant, getPersonalDetailsForAccountIDs} from '@libs/OptionsListUtils';
import {getCustomUnitID} from '@libs/PerDiemRequestUtils';
import {getAccountIDsByLogins, getLoginByAccountID} from '@libs/PersonalDetailsUtils';
import {addSMSDomainIfPhoneNumber} from '@libs/PhoneNumber';
import {
    arePaymentsEnabled,
    getDistanceRateCustomUnit,
    getSubmitToAccountID,
    hasDependentTags,
    hasDynamicExternalWorkflow,
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
    getReportActionHtml,
    getReportActionMessage,
    getReportActionText,
    hasPendingDEWApprove,
    isCreatedAction,
    isDeletedAction,
    isMoneyRequestAction,
    isReportPreviewAction,
} from '@libs/ReportActionsUtils';
import type {OptimisticChatReport, OptimisticCreatedReportAction, OptimisticIOUReportAction, TransactionDetails} from '@libs/ReportUtils';
import {
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
    buildOptimisticReportLevelRejectAction,
    buildOptimisticReportLevelRejectCommentAction,
    buildOptimisticReportPreview,
    buildOptimisticRetractedReportAction,
    buildOptimisticSubmittedReportAction,
    buildOptimisticUnapprovedReportAction,
    canBeAutoReimbursed,
    canEditFieldOfMoneyRequest,
    canSubmitAndIsAwaitingForCurrentUser,
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
    getReportTransactions,
    getTransactionDetails,
    hasHeldExpenses as hasHeldExpensesReportUtils,
    hasNonReimbursableTransactions as hasNonReimbursableTransactionsReportUtils,
    hasOnlyNonReimbursableTransactions,
    hasOutstandingChildRequest,
    hasViolations as hasViolationsReportUtils,
    isArchivedReport,
    isClosedReport as isClosedReportUtil,
    isDeprecatedGroupDM,
    isExpenseReport,
    isGroupChat,
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
    populateOptimisticReportFormula,
    shouldCreateNewMoneyRequestReport as shouldCreateNewMoneyRequestReportReportUtils,
    shouldEnableNegative,
    updateOptimisticParentReportAction,
    updateReportPreview,
} from '@libs/ReportUtils';
import {buildCannedSearchQuery, buildSearchQueryJSON, buildSearchQueryString, getCurrentSearchQueryJSON} from '@libs/SearchQueryUtils';
import {getSuggestedSearches} from '@libs/SearchUIUtils';
import playSound, {SOUNDS} from '@libs/Sound';
import {shouldRestrictUserBillableActions} from '@libs/SubscriptionUtils';
import {getSpan, startSpan} from '@libs/telemetry/activeSpans';
import {endSubmitFollowUpActionSpan, setPendingSubmitFollowUpAction} from '@libs/telemetry/submitFollowUpAction';
import {
    allHavePendingRTERViolation,
    buildOptimisticTransaction,
    calculateTaxAmount,
    getAmount,
    getCategoryTaxCodeAndAmount,
    getClearedPendingFields,
    getCurrency,
    getDistanceInMeters,
    getMerchant,
    getTaxValue,
    getUpdatedTransaction,
    hasAnyTransactionWithoutRTERViolation,
    hasDuplicateTransactions,
    hasSmartScanFailedWithMissingFields,
    hasSubmissionBlockingViolations,
    isDistanceRequest as isDistanceRequestTransactionUtils,
    isDuplicate,
    isFetchingWaypointsFromServer,
    isManualDistanceRequest as isManualDistanceRequestTransactionUtils,
    isOdometerDistanceRequest as isOdometerDistanceRequestTransactionUtils,
    isOnHold,
    isPending,
    isPendingCardOrScanningTransaction,
    isPerDiemRequest as isPerDiemRequestTransactionUtils,
    isScanning,
    isScanRequest as isScanRequestTransactionUtils,
    isTimeRequest as isTimeRequestTransactionUtils,
    removeTransactionFromDuplicateTransactionViolation,
} from '@libs/TransactionUtils';
import type {AvatarSource} from '@libs/UserAvatarUtils';
import ViolationsUtils from '@libs/Violations/ViolationsUtils';
import {clearByKey as clearPdfByOnyxKey} from '@userActions/CachedPDFPaths';
import {clearAllRelatedReportActionErrors} from '@userActions/ClearReportActionErrors';
import {buildPolicyData, generatePolicyID} from '@userActions/Policy/Policy';
import type {BuildPolicyDataKeys} from '@userActions/Policy/Policy';
import {buildOptimisticPolicyRecentlyUsedTags} from '@userActions/Policy/Tag';
import {completeOnboarding, createTransactionThreadReport, notifyNewAction, optimisticReportLastData} from '@userActions/Report';
import {resolveDetachReceiptConflicts} from '@userActions/RequestConflictUtils';
import {mergeTransactionIdsHighlightOnSearchRoute, sanitizeWaypointsForAPI, stringifyWaypointsForAPI} from '@userActions/Transaction';
import {getRemoveDraftTransactionsByIDsData, removeDraftTransaction, removeDraftTransactionsByIDs} from '@userActions/TransactionEdit';
import {getOnboardingMessages} from '@userActions/Welcome/OnboardingFlow';
import type {OnboardingCompanySize} from '@userActions/Welcome/OnboardingFlow';
import type {IOUAction, IOUActionParams, IOUType, OdometerImageType} from '@src/CONST';
import CONST from '@src/CONST';
import NAVIGATORS from '@src/NAVIGATORS';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import SCREENS from '@src/SCREENS';
import type * as OnyxTypes from '@src/types/onyx';
import type {Accountant, Attendee, Participant, Split} from '@src/types/onyx/IOU';
import type {ErrorFields, Errors, PendingAction, PendingFields} from '@src/types/onyx/OnyxCommon';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import type {CurrentUserPersonalDetails} from '@src/types/onyx/PersonalDetails';
import type {Unit} from '@src/types/onyx/Policy';
import type RecentlyUsedTags from '@src/types/onyx/RecentlyUsedTags';
import type {ReportNextStep} from '@src/types/onyx/Report';
import type ReportAction from '@src/types/onyx/ReportAction';
import type {OnyxData} from '@src/types/onyx/Request';
import type {SearchDataTypes} from '@src/types/onyx/SearchResults';
import type {Comment, Receipt, ReceiptSource, Routes, SplitShares, TransactionChanges, TransactionCustomUnit, WaypointCollection} from '@src/types/onyx/Transaction';
import type {FileObject} from '@src/types/utils/Attachment';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type BasePolicyParams from './types/BasePolicyParams';
import type BaseTransactionParams from './types/BaseTransactionParams';
import type {CreateTrackExpenseParams} from './types/CreateTrackExpenseParams';
import type RequestMoneyParticipantParams from './types/RequestMoneyParticipantParams';
import type {GPSPoint} from './types/TrackExpenseTransactionParams';

type IOURequestType = ValueOf<typeof CONST.IOU.REQUEST_TYPE>;

type OneOnOneIOUReport = OnyxTypes.Report | undefined | null;

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
    onyxData: OnyxData<BuildOnyxDataForMoneyRequestKeys>;
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
    betas: OnyxEntry<OnyxTypes.Beta[]>;
    isSelfTourViewed: boolean | undefined;
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

type InitMoneyRequestParams = {
    reportID: string;
    policy?: OnyxEntry<OnyxTypes.Policy>;
    personalPolicy: Pick<OnyxTypes.Policy, 'id' | 'type' | 'autoReporting' | 'outputCurrency'> | undefined;
    isFromGlobalCreate?: boolean;
    isFromFloatingActionButton?: boolean;
    currentIouRequestType?: IOURequestType | undefined;
    newIouRequestType: IOURequestType | undefined;
    report: OnyxEntry<OnyxTypes.Report>;
    parentReport: OnyxEntry<OnyxTypes.Report>;
    currentDate: string | undefined;
    lastSelectedDistanceRates?: OnyxEntry<OnyxTypes.LastSelectedDistanceRates>;
    currentUserPersonalDetails: CurrentUserPersonalDetails;
    isTrackDistanceExpense?: boolean;
    hasOnlyPersonalPolicies: boolean;
    draftTransactionIDs?: string[];
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
    onyxData: OnyxData<BuildOnyxDataForMoneyRequestKeys>;
};

type UpdateMoneyRequestData<TKey extends OnyxKey> = {
    params: UpdateMoneyRequestParams;
    onyxData: OnyxData<TKey>;
};

type PayMoneyRequestData = {
    params: PayMoneyRequestParams & Partial<PayInvoiceParams>;
    onyxData: OnyxData<
        | typeof ONYXKEYS.NVP_ACTIVE_POLICY_ID
        | typeof ONYXKEYS.COLLECTION.REPORT
        | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS
        | typeof ONYXKEYS.COLLECTION.NEXT_STEP
        | typeof ONYXKEYS.NVP_LAST_PAYMENT_METHOD
        | typeof ONYXKEYS.COLLECTION.TRANSACTION
        | typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS
        | BuildPolicyDataKeys
    >;
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
    customUnit?: TransactionCustomUnit;
    odometerStart?: number;
    odometerEnd?: number;

    /** Transaction type (e.g., 'time' for time tracking expenses) */
    type?: ValueOf<typeof CONST.TRANSACTION.TYPE>;

    /** Number of hours for time tracking expenses */
    count?: number;

    /** Hourly rate in cents. Use convertToBackendAmount() to convert from policy rate (which is stored as a float) */
    rate?: number;

    /** Unit for time tracking (e.g., 'h' for hours) */
    unit?: ValueOf<typeof CONST.TIME_TRACKING.UNIT>;
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
    existingTransactionDraft: OnyxEntry<OnyxTypes.Transaction>;
    draftTransactionIDs: string[] | undefined;
    isSelfTourViewed: boolean;
    betas: OnyxEntry<OnyxTypes.Beta[]>;
    personalDetails: OnyxEntry<OnyxTypes.PersonalDetailsList>;
    shouldDeferAutoSubmit?: boolean;
};

type MoneyRequestInformationParams = {
    parentChatReport: OnyxEntry<OnyxTypes.Report>;
    existingIOUReport?: OnyxEntry<OnyxTypes.Report>;
    transactionParams: RequestMoneyTransactionParams;
    participantParams: RequestMoneyParticipantParams;
    betas: OnyxEntry<OnyxTypes.Beta[]>;
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
    personalDetails: OnyxEntry<OnyxTypes.PersonalDetailsList>;
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
    personalDetails: OnyxEntry<OnyxTypes.PersonalDetailsList>;
};

type DistanceRequestTransactionParams = BaseTransactionParams & {
    attendees?: Attendee[];
    validWaypoints?: WaypointCollection;
    splitShares?: SplitShares;
    distance?: number;
    receipt?: Receipt;
    odometerStart?: number;
    odometerEnd?: number;
    gpsCoordinates?: string;
};

type CreateDistanceRequestInformation = {
    report: OnyxEntry<OnyxTypes.Report>;
    participants: Participant[];
    currentUserLogin?: string;
    currentUserAccountID?: number;
    iouType?: ValueOf<typeof CONST.IOU.TYPE>;
    existingIOUReport?: OnyxEntry<OnyxTypes.Report>;
    existingTransaction?: OnyxEntry<OnyxTypes.Transaction>;
    transactionParams: DistanceRequestTransactionParams;
    policyParams?: BasePolicyParams;
    backToReport?: string;
    isASAPSubmitBetaEnabled: boolean;
    transactionViolations: OnyxCollection<OnyxTypes.TransactionViolation[]>;
    quickAction: OnyxEntry<OnyxTypes.QuickAction>;
    policyRecentlyUsedCurrencies: string[];
    recentWaypoints: OnyxEntry<OnyxTypes.RecentWaypoint[]>;
    customUnitPolicyID?: string;
    shouldHandleNavigation?: boolean;
    shouldPlaySound?: boolean;
    personalDetails: OnyxEntry<OnyxTypes.PersonalDetailsList>;
    betas: OnyxEntry<OnyxTypes.Beta[]>;
    optimisticReportPreviewActionID?: string;
    shouldDeferAutoSubmit?: boolean;
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
    betas: OnyxEntry<OnyxTypes.Beta[]>;
    personalDetails: OnyxEntry<OnyxTypes.PersonalDetailsList>;
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
    taxValue?: string;
    shouldPlaySound?: boolean;
    policyRecentlyUsedCategories?: OnyxEntry<OnyxTypes.RecentlyUsedCategories>;
    policyRecentlyUsedTags: OnyxEntry<RecentlyUsedTags>;
    quickAction: OnyxEntry<OnyxTypes.QuickAction>;
    policyRecentlyUsedCurrencies: string[];
    participantsPolicyTags: Record<string, OnyxTypes.PolicyTagLists>;
};

type ReplaceReceipt = {
    transactionID: string;
    file?: File;
    source: string;
    state?: ValueOf<typeof CONST.IOU.RECEIPT_STATE>;
    transactionPolicyCategories?: OnyxEntry<OnyxTypes.PolicyCategories>;
    transactionPolicy: OnyxEntry<OnyxTypes.Policy>;
    isSameReceipt?: boolean;
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
    allTransactionViolationsParam: OnyxCollection<OnyxTypes.TransactionViolations>;
    currentUserAccountID: number;
    currentUserEmail: string;
};

type PayMoneyRequestFunctionParams = {
    paymentType: PaymentMethodType;
    chatReport: OnyxTypes.Report;
    iouReport: OnyxEntry<OnyxTypes.Report>;
    introSelected: OnyxEntry<OnyxTypes.IntroSelected>;
    iouReportCurrentNextStepDeprecated: OnyxEntry<OnyxTypes.ReportNextStepDeprecated>;
    currentUserAccountID: number;
    userBillingGracePeriodEnds: OnyxCollection<OnyxTypes.BillingGraceEndPeriod>;
    paymentPolicyID?: string;
    full?: boolean;
    activePolicy?: OnyxEntry<OnyxTypes.Policy>;
    policy?: OnyxEntry<OnyxTypes.Policy>;
    betas: OnyxEntry<OnyxTypes.Beta[]>;
    isSelfTourViewed: boolean | undefined;
    amountOwed: OnyxEntry<number>;
    ownerBillingGracePeriodEnd?: OnyxEntry<number>;
    methodID?: number;
    onPaid?: () => void;
};

type ApproveMoneyRequestFunctionParams = {
    expenseReport: OnyxEntry<OnyxTypes.Report>;
    policy: OnyxEntry<OnyxTypes.Policy>;
    currentUserAccountIDParam: number;
    currentUserEmailParam: string;
    hasViolations: boolean;
    isASAPSubmitBetaEnabled: boolean;
    expenseReportCurrentNextStepDeprecated: OnyxEntry<OnyxTypes.ReportNextStepDeprecated>;
    betas: OnyxEntry<OnyxTypes.Beta[]>;
    userBillingGracePeriodEnds: OnyxCollection<OnyxTypes.BillingGraceEndPeriod>;
    amountOwed: OnyxEntry<number>;
    full?: boolean;
    onApproved?: () => void;
    ownerBillingGracePeriodEnd: OnyxEntry<number>;
};

type SubmitReportFunctionParams = {
    expenseReport: OnyxEntry<OnyxTypes.Report>;
    policy: OnyxEntry<OnyxTypes.Policy>;
    currentUserAccountIDParam: number;
    currentUserEmailParam: string;
    hasViolations: boolean;
    isASAPSubmitBetaEnabled: boolean;
    expenseReportCurrentNextStepDeprecated: OnyxEntry<OnyxTypes.ReportNextStepDeprecated>;
    userBillingGracePeriodEnds: OnyxCollection<OnyxTypes.BillingGraceEndPeriod>;
    amountOwed: OnyxEntry<number>;
    onSubmitted?: () => void;
    ownerBillingGracePeriodEnd: OnyxEntry<number>;
    delegateEmail: string | undefined;
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

let allPolicyTags: OnyxCollection<OnyxTypes.PolicyTagLists> = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.POLICY_TAGS,
    waitForCollectionCallback: true,
    callback: (value) => {
        if (!value) {
            allPolicyTags = {};
            return;
        }
        allPolicyTags = value;
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

let deprecatedUserAccountID = -1;
let deprecatedCurrentUserEmail = '';
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (value) => {
        deprecatedCurrentUserEmail = value?.email ?? '';
        deprecatedUserAccountID = value?.accountID ?? CONST.DEFAULT_NUMBER_ID;
    },
});

let deprecatedCurrentUserPersonalDetails: OnyxEntry<OnyxTypes.PersonalDetails>;
Onyx.connect({
    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    callback: (value) => {
        deprecatedCurrentUserPersonalDetails = value?.[deprecatedUserAccountID] ?? undefined;
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

function getAllTransactionDrafts(): NonNullable<OnyxCollection<OnyxTypes.Transaction>> {
    return allTransactionDrafts;
}

function getCurrentUserEmail(): string {
    return deprecatedCurrentUserEmail;
}

function getUserAccountID(): number {
    return deprecatedUserAccountID;
}

/**
 * This function uses Onyx.connect and should be replaced with useOnyx for reactive data access.
 * TODO: remove `getPolicyTagsData` from this file (https://github.com/Expensify/App/issues/72721)
 * All usages of this function should be replaced with params passed to the functions or useOnyx hook in React components.
 */
function getPolicyTags(): OnyxCollection<OnyxTypes.PolicyTagLists> {
    return allPolicyTags;
}

/**
 * @deprecated This function uses Onyx.connect and should be replaced with useOnyx for reactive data access.
 * TODO: remove `getPolicyTagsData` from this file (https://github.com/Expensify/App/issues/72721)
 * All usages of this function should be replaced with useOnyx hook in React components.
 */
function getPolicyTagsData(policyID: string | undefined) {
    return allPolicyTags?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`] ?? {};
}

/**
 * @private
 * After finishing the action in RHP from the Inbox tab, besides dismissing the modal, we should open the report.
 * If the action is done from the report RHP, then we just want to dismiss the money request flow screens.
 * It is a helper function used only in this file.
 */
function dismissModalAndOpenReportInInboxTab(reportID?: string, isInvoice?: boolean) {
    const rootState = navigationRef.getRootState();
    const hasSubmitToDestinationVisibleSpan = !!getSpan(CONST.TELEMETRY.SPAN_SUBMIT_TO_DESTINATION_VISIBLE);

    if (!isInvoice && isReportOpenInRHP(rootState)) {
        const rhpKey = rootState.routes.at(-1)?.state?.key;
        if (rhpKey) {
            const hasMultipleTransactions = Object.values(allTransactions).filter((transaction) => transaction?.reportID === reportID).length > 0;
            const isSuperWideRHP = isReportOpenInSuperWideRHP(rootState);

            // submit_follow_up_action: only set when the span was started.
            if (hasSubmitToDestinationVisibleSpan) {
                if (isSuperWideRHP) {
                    setPendingSubmitFollowUpAction(CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_ONLY, reportID);
                } else if (hasMultipleTransactions && reportID) {
                    setPendingSubmitFollowUpAction(CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_AND_OPEN_REPORT, reportID);
                } else {
                    setPendingSubmitFollowUpAction(CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_ONLY, reportID);
                }
            }
            // When a report is opened in the super wide RHP, we need to dismiss to the first RHP to show the same report with new expense.
            if (isSuperWideRHP) {
                Navigation.dismissToPreviousRHP();
                return;
            }
            // When a report with one expense is opened in the wide RHP and the user adds another expense, RHP should be dismissed and ROUTES.SEARCH_MONEY_REQUEST_REPORT should be displayed.
            if (hasMultipleTransactions && reportID) {
                // On small screens, dismiss all modals and then navigate to the right report.
                // On large screens, dismiss to the previous RHP first, then replace the current route with the new report.
                const isNarrowLayout = getIsNarrowLayout();
                if (isNarrowLayout) {
                    Navigation.dismissModal();
                } else {
                    Navigation.dismissToPreviousRHP();
                }
                Navigation.setNavigationActionToMicrotaskQueue(() => {
                    Navigation.navigate(ROUTES.SEARCH_MONEY_REQUEST_REPORT.getRoute({reportID}), {forceReplace: !isNarrowLayout});
                });
                return;
            }
            Navigation.pop(rhpKey);
            return;
        }
    }
    if (isSearchTopmostFullScreenRoute() || !reportID) {
        if (hasSubmitToDestinationVisibleSpan) {
            setPendingSubmitFollowUpAction(CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_ONLY);
        }
        Navigation.dismissModal();
        if (hasSubmitToDestinationVisibleSpan) {
            // eslint-disable-next-line @typescript-eslint/no-deprecated -- we need to wait for the modal to be dismissed before marking the span
            InteractionManager.runAfterInteractions(() => {
                endSubmitFollowUpActionSpan(CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_ONLY);
            });
        }
        return;
    }
    if (hasSubmitToDestinationVisibleSpan) {
        Navigation.dismissModalWithReport({reportID}, undefined, {
            onBeforeNavigate: (willOpenReport) => {
                setPendingSubmitFollowUpAction(
                    willOpenReport ? CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_AND_OPEN_REPORT : CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_ONLY,
                    reportID,
                );
            },
        });
    } else {
        Navigation.dismissModalWithReport({reportID});
    }
}

/**
 * Marks a transaction for highlight on the Search page when the expense was created
 * from the global create button and the user is not on the Inbox tab.
 */
function highlightTransactionOnSearchRouteIfNeeded(isFromGlobalCreate: boolean | undefined, transactionID: string | undefined, dataType: SearchDataTypes) {
    if (!isFromGlobalCreate || isReportTopmostSplitNavigator() || !transactionID) {
        return;
    }
    mergeTransactionIdsHighlightOnSearchRoute(dataType, {[transactionID]: true});
}

/**
 * Helper to navigate after an expense is created in order to standardize the post‑creation experience
 * when creating an expense from the global create button.
 * If the expense is created from the global create button then:
 * - If it is created on the inbox tab, it will open the chat report containing that expense.
 * - If it is created elsewhere, it will navigate to Reports > Expense and highlight the newly created expense.
 */
function handleNavigateAfterExpenseCreate({
    activeReportID,
    transactionID,
    isFromGlobalCreate,
    isInvoice,
    shouldHandleNavigation = true,
}: {
    activeReportID?: string;
    transactionID?: string;
    isFromGlobalCreate?: boolean;
    isInvoice?: boolean;
    shouldHandleNavigation?: boolean;
}) {
    const isUserOnInbox = isReportTopmostSplitNavigator();

    // If the expense is not created from global create or is currently on the inbox tab,
    // we just need to dismiss the money request flow screens
    // and open the report chat containing the IOU report
    if (!isFromGlobalCreate || isUserOnInbox || !transactionID) {
        if (shouldHandleNavigation) {
            dismissModalAndOpenReportInInboxTab(activeReportID, isInvoice);
        }
        return;
    }

    if (!shouldHandleNavigation) {
        return;
    }

    const type = isInvoice ? CONST.SEARCH.DATA_TYPES.INVOICE : CONST.SEARCH.DATA_TYPES.EXPENSE;

    // When already on Search ROOT with the same type (expense vs invoice), we navigate to the same screen (no-op or refresh); record as dismiss_modal_only.
    // When on another Search sub-tab (e.g. Chats), or on Search with a different type (e.g. on Invoice, submitting expense), record as navigate_to_search.
    const rootState = navigationRef.getRootState();
    const searchNavigatorRoute = rootState?.routes?.findLast((route) => route.name === NAVIGATORS.SEARCH_FULLSCREEN_NAVIGATOR);
    const lastSearchRoute = searchNavigatorRoute?.state?.routes?.at(-1);
    const alreadyOnSearchRoot = isSearchTopmostFullScreenRoute() && lastSearchRoute?.name === SCREENS.SEARCH.ROOT;
    const currentSearchQueryJSON = alreadyOnSearchRoot ? getCurrentSearchQueryJSON() : undefined;
    const isSameSearchType = currentSearchQueryJSON?.type === type;
    setPendingSubmitFollowUpAction(
        alreadyOnSearchRoot && isSameSearchType ? CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.DISMISS_MODAL_ONLY : CONST.TELEMETRY.SUBMIT_FOLLOW_UP_ACTION.NAVIGATE_TO_SEARCH,
    );
    const queryString = buildCannedSearchQuery({type});
    const navigateToSearch = () => {
        if (getIsNarrowLayout()) {
            Navigation.navigate(ROUTES.SEARCH_ROOT.getRoute({query: queryString}), {forceReplace: true});
        } else {
            Navigation.revealRouteBeforeDismissingModal(ROUTES.SEARCH_ROOT.getRoute({query: queryString}));
        }
    };

    if (navigationRef.isReady()) {
        navigateToSearch();
    } else {
        Navigation.isNavigationReady().then(navigateToSearch);
    }
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
    isTrackDistanceExpense = false,
    isFromFloatingActionButton,
    currentIouRequestType,
    newIouRequestType,
    report,
    parentReport,
    currentDate,
    lastSelectedDistanceRates,
    currentUserPersonalDetails,
    hasOnlyPersonalPolicies,
    draftTransactionIDs,
}: InitMoneyRequestParams) {
    // Generate a brand new transactionID
    const newTransactionID = CONST.IOU.OPTIMISTIC_TRANSACTION_ID;
    const currency = policy?.outputCurrency ?? personalPolicy?.outputCurrency ?? CONST.CURRENCY.USD;

    const created = currentDate ?? format(new Date(), 'yyyy-MM-dd');

    // We remove draft transactions created during multi scanning if there are some
    removeDraftTransactionsByIDs(draftTransactionIDs, true);

    // in case we have to re-init money request, but the IOU request type is the same with the old draft transaction,
    // we should keep most of the existing data by using the ONYX MERGE operation
    if (currentIouRequestType === newIouRequestType) {
        // so, we just need to update the reportID, isFromGlobalCreate, created, currency
        Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${newTransactionID}`, {
            reportID,
            isFromGlobalCreate,
            isFromFloatingActionButton,
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
        newIouRequestType === CONST.IOU.REQUEST_TYPE.DISTANCE_ODOMETER ||
        newIouRequestType === CONST.IOU.REQUEST_TYPE.DISTANCE_GPS
    ) {
        if (!isFromGlobalCreate) {
            const isPolicyExpenseChat = isPolicyExpenseChatReportUtil(report) || isPolicyExpenseChatReportUtil(parentReport);
            const customUnitRateID = DistanceRequestUtils.getCustomUnitRateID({reportID, isPolicyExpenseChat, isTrackDistanceExpense, policy, lastSelectedDistanceRates});
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
            comment.odometerStartImage = undefined;
            comment.odometerEndImage = undefined;
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
        isFromFloatingActionButton,
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

function clearMoneyRequest(transactionID: string, draftTransactionIDs: string[] | undefined, skipConfirmation = false) {
    const onyxData: Record<string, null | boolean> = {
        ...getRemoveDraftTransactionsByIDsData(draftTransactionIDs),
        [`${ONYXKEYS.COLLECTION.SKIP_CONFIRMATION}${transactionID}`]: skipConfirmation,
    };
    Onyx.multiSet(onyxData as Parameters<typeof Onyx.multiSet>[0]);
}

function startMoneyRequest(
    iouType: ValueOf<typeof CONST.IOU.TYPE>,
    reportID: string,
    draftTransactionIDs: string[] | undefined,
    requestType?: IOURequestType,
    skipConfirmation = false,
    backToReport?: string,
    isFromFloatingActionButton?: boolean,
) {
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
    clearMoneyRequest(CONST.IOU.OPTIMISTIC_TRANSACTION_ID, draftTransactionIDs, skipConfirmation);
    if (isFromFloatingActionButton) {
        Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`, {isFromFloatingActionButton});
    }
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

function startDistanceRequest(
    iouType: ValueOf<typeof CONST.IOU.TYPE>,
    reportID: string,
    draftTransactionIDs: string[] | undefined,
    requestType?: IOURequestType,
    skipConfirmation = false,
    backToReport?: string,
    isFromFloatingActionButton?: boolean,
) {
    clearMoneyRequest(CONST.IOU.OPTIMISTIC_TRANSACTION_ID, draftTransactionIDs, skipConfirmation);
    if (isFromFloatingActionButton) {
        Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_TRANSACTION_ID}`, {isFromFloatingActionButton});
    }
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

function setMoneyRequestReceiptState(transactionID: string, isDraft: boolean, shouldStopSmartscan = false) {
    if (!isDraft || !shouldStopSmartscan) {
        return;
    }
    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {receipt: {state: CONST.IOU.RECEIPT_STATE.OPEN}});
}

function setMoneyRequestAmount(transactionID: string, amount: number, currency: string, shouldShowOriginalAmount = false, shouldStopSmartscan = false) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {amount, currency, shouldShowOriginalAmount});
    setMoneyRequestReceiptState(transactionID, true, shouldStopSmartscan);
}

function setMoneyRequestCreated(transactionID: string, created: string, isDraft: boolean, shouldStopSmartscan = false) {
    Onyx.merge(`${isDraft ? ONYXKEYS.COLLECTION.TRANSACTION_DRAFT : ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {created});
    setMoneyRequestReceiptState(transactionID, isDraft, shouldStopSmartscan);
}

function setMoneyRequestDateAttribute(transactionID: string, start: string, end: string) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {comment: {customUnit: {attributes: {dates: {start, end}}}}});
}

function setMoneyRequestCurrency(transactionID: string, currency: string, isEditing = false) {
    const fieldToUpdate = isEditing ? 'modifiedCurrency' : 'currency';
    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {[fieldToUpdate]: currency});
}

function setMoneyRequestDescription(transactionID: string, comment: string, isDraft: boolean, shouldStopSmartscan = false) {
    Onyx.merge(`${isDraft ? ONYXKEYS.COLLECTION.TRANSACTION_DRAFT : ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {comment: {comment: comment.trim()}});
    setMoneyRequestReceiptState(transactionID, isDraft, shouldStopSmartscan);
}

function setMoneyRequestMerchant(transactionID: string, merchant: string, isDraft: boolean, shouldStopSmartscan = false) {
    Onyx.merge(`${isDraft ? ONYXKEYS.COLLECTION.TRANSACTION_DRAFT : ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {merchant});
    setMoneyRequestReceiptState(transactionID, isDraft, shouldStopSmartscan);
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
 * Set custom unit rateID for the transaction draft, also updates quantity and distanceUnit
 * if passed transaction previously had it to make sure that transaction does not have inconsistent
 * states (for example distanceUnit not matching distance unit of the new customUnitRateID)
 */
function setCustomUnitRateID(transactionID: string, customUnitRateID: string | undefined, transaction: OnyxEntry<OnyxTypes.Transaction>, policy: OnyxEntry<OnyxTypes.Policy>) {
    const isFakeP2PRate = customUnitRateID === CONST.CUSTOM_UNITS.FAKE_P2P_ID;

    let newDistanceUnit: Unit | undefined;
    let newQuantity: number | undefined;

    if (customUnitRateID && transaction) {
        const distanceRate = isFakeP2PRate
            ? DistanceRequestUtils.getRate({transaction: undefined, policy: undefined, useTransactionDistanceUnit: false, isFakeP2PRate})
            : DistanceRequestUtils.getRateByCustomUnitRateID({policy, customUnitRateID});

        const transactionDistanceUnit = transaction.comment?.customUnit?.distanceUnit;
        const transactionQuantity = transaction.comment?.customUnit?.quantity;

        const shouldUpdateDistanceUnit = !!transactionDistanceUnit && !!distanceRate?.unit;
        const shouldUpdateQuantity = transactionQuantity !== null && transactionQuantity !== undefined;

        if (shouldUpdateDistanceUnit) {
            newDistanceUnit = distanceRate.unit;
        }
        if (shouldUpdateQuantity && !!distanceRate?.unit) {
            const newQuantityInMeters = getDistanceInMeters(transaction, transactionDistanceUnit);

            // getDistanceInMeters returns 0 only if there was not enough input to get the correct
            // distance in meters or if the current transaction distance is 0
            if (newQuantityInMeters !== 0) {
                newQuantity = DistanceRequestUtils.convertDistanceUnit(newQuantityInMeters, distanceRate.unit);
            }
        }
    }
    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {
        comment: {
            customUnit: {
                customUnitRateID,
                ...(!isFakeP2PRate && {defaultP2PRate: null}),
                distanceUnit: newDistanceUnit,
                quantity: newQuantity,
            },
        },
    });
}

function setGPSTransactionDraftData(transactionID: string, gpsDraftDetails: OnyxTypes.GpsDraftDetails | undefined, distance: number) {
    const waypoints = getGPSWaypoints(gpsDraftDetails);
    const routes = getGPSRoutes(gpsDraftDetails);

    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {
        comment: {
            customUnit: {quantity: distance},
            waypoints,
        },
        routes,
    });
}

/**
 * Revert custom unit of the draft transaction to the original transaction's value
 */
function resetDraftTransactionsCustomUnit(transaction: OnyxEntry<OnyxTypes.Transaction>) {
    if (!transaction?.transactionID) {
        return;
    }
    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transaction?.transactionID}`, {
        comment: {
            customUnit: transaction.comment?.customUnit ?? {},
        },
    });
}

/**
 * Set custom unit ID for the transaction draft
 */
function setCustomUnitID(transactionID: string, customUnitID: string) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`, {comment: {customUnit: {customUnitID}}});
}

function setMoneyRequestDistance(transactionID: string, distanceAsFloat: number, isDraft: boolean, distanceUnit: Unit) {
    Onyx.merge(`${isDraft ? ONYXKEYS.COLLECTION.TRANSACTION_DRAFT : ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {comment: {customUnit: {quantity: distanceAsFloat, distanceUnit}}});
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
 * Set odometer image for a transaction
 * @param transaction - The transaction or transaction draft
 * @param imageType - 'start' or 'end'
 * @param file - The image file (File object on web, URI string on native)
 * @param isDraft - Whether this is a draft transaction
 * @param shouldRevokeOldImage - Whether to revoke the previous blob URL immediately (always false on native where blob URLs don't exist; false on web when a backup transaction exists making the caller responsible for revoking)
 */
function setMoneyRequestOdometerImage(
    transaction: OnyxEntry<OnyxTypes.Transaction>,
    imageType: OdometerImageType,
    file: FileObject | string,
    isDraft: boolean,
    shouldRevokeOldImage: boolean,
) {
    const imageKey = imageType === CONST.IOU.ODOMETER_IMAGE_TYPE.START ? 'odometerStartImage' : 'odometerEndImage';
    const normalizedFile: FileObject | string =
        typeof file === 'string'
            ? file
            : {
                  uri: file.uri ?? (typeof URL !== 'undefined' ? URL.createObjectURL(file as Blob) : undefined),
                  name: file.name,
                  type: file.type,
                  size: file.size,
              };
    const transactionID = transaction?.transactionID;
    const existingImage = transaction?.comment?.[imageKey];
    if (shouldRevokeOldImage) {
        revokeOdometerImageUri(existingImage, normalizedFile);
    }
    Onyx.merge(`${isDraft ? ONYXKEYS.COLLECTION.TRANSACTION_DRAFT : ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {
        comment: {
            [imageKey]: normalizedFile,
        },
    });
}

/**
 * Remove odometer image from a transaction
 * @param transaction - The transaction or transaction draft
 * @param imageType - 'start' or 'end'
 * @param isDraft - Whether this is a draft transaction
 * @param shouldRevokeOldImage - Whether to revoke the previous blob URL immediately (always false on native where blob URLs don't exist; false on web when a backup transaction exists making the caller responsible for revoking)
 */
function removeMoneyRequestOdometerImage(transaction: OnyxEntry<OnyxTypes.Transaction>, imageType: OdometerImageType, isDraft: boolean, shouldRevokeOldImage: boolean) {
    if (!transaction?.transactionID) {
        return;
    }
    const imageKey = imageType === CONST.IOU.ODOMETER_IMAGE_TYPE.START ? 'odometerStartImage' : 'odometerEndImage';
    const existingImage = transaction?.comment?.[imageKey];
    if (shouldRevokeOldImage) {
        revokeOdometerImageUri(existingImage);
    }
    Onyx.merge(`${isDraft ? ONYXKEYS.COLLECTION.TRANSACTION_DRAFT : ONYXKEYS.COLLECTION.TRANSACTION}${transaction?.transactionID}`, {
        comment: {
            [imageKey]: null,
        },
    });
}

/**
 * Set the distance rate of a transaction.
 * Used when creating a new transaction or moving an existing one from Self DM
 */
function setMoneyRequestDistanceRate(currentTransaction: OnyxEntry<OnyxTypes.Transaction>, customUnitRateID: string, policy: OnyxEntry<OnyxTypes.Policy>, isDraft: boolean) {
    if (!currentTransaction) {
        Log.warn('setMoneyRequestDistanceRate is called without a valid transaction, skipping setting distance rate.');
        return;
    }
    if (policy) {
        Onyx.merge(ONYXKEYS.NVP_LAST_SELECTED_DISTANCE_RATES, {[policy.id]: customUnitRateID});
    }

    const newDistanceUnit = getDistanceRateCustomUnit(policy)?.attributes?.unit;
    const transactionID = currentTransaction?.transactionID;
    const transaction = isDraft ? allTransactionDrafts[`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`] : currentTransaction;

    let newDistance;
    if (newDistanceUnit && newDistanceUnit !== transaction?.comment?.customUnit?.distanceUnit && !isOdometerDistanceRequestTransactionUtils(transaction)) {
        newDistance = DistanceRequestUtils.convertDistanceUnit(getDistanceInMeters(transaction, transaction?.comment?.customUnit?.distanceUnit), newDistanceUnit);
    }

    Onyx.merge(`${isDraft ? ONYXKEYS.COLLECTION.TRANSACTION_DRAFT : ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {
        comment: {
            customUnit: {
                customUnitRateID,
                ...(!!policy && {defaultP2PRate: null}),
                ...(newDistanceUnit && {distanceUnit: newDistanceUnit}),
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
    const text = Localize.translateLocal('testDrive.employeeInviteMessage', personalDetailsList?.[deprecatedUserAccountID]?.firstName ?? '');
    const textComment = buildOptimisticAddCommentReportAction({text, actorAccountID: deprecatedUserAccountID, reportActionID: testDriveIOUParams.testDriveCommentReportActionID});
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

type BuildOnyxDataForMoneyRequestKeys =
    | typeof ONYXKEYS.COLLECTION.REPORT
    | typeof ONYXKEYS.COLLECTION.TRANSACTION
    | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS
    | typeof ONYXKEYS.COLLECTION.REPORT_METADATA
    | typeof ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_CATEGORIES
    | typeof ONYXKEYS.COLLECTION.TRANSACTION_DRAFT
    | typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS
    | typeof ONYXKEYS.RECENTLY_USED_CURRENCIES
    | typeof ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS
    | typeof ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_DESTINATIONS
    | typeof ONYXKEYS.PERSONAL_DETAILS_LIST
    | typeof ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING
    | typeof ONYXKEYS.COLLECTION.NEXT_STEP
    | typeof ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE
    | typeof ONYXKEYS.COLLECTION.SNAPSHOT;

/**
 * When a receipt is a local file (e.g. taken from camera or picked from gallery), its `source` is a local URI
 * that will be lost once the optimistic transaction is replaced by the server response. We stash it in
 * `localSource` so the UI can continue showing the local image while SmartScan is in progress.
 */
function getTransactionWithPreservedLocalReceiptSource(transaction: OnyxTypes.Transaction, isScanRequest: boolean): OnyxTypes.Transaction {
    if (isScanRequest && isLocalFile(transaction.receipt?.source)) {
        return {...transaction, receipt: {...transaction.receipt, localSource: String(transaction.receipt?.source)}};
    }
    return transaction;
}

/** Builds the Onyx data for an expense */
function buildOnyxDataForMoneyRequest(moneyRequestParams: BuildOnyxDataForMoneyRequestParams): OnyxData<BuildOnyxDataForMoneyRequestKeys> {
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
        personalDetails,
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
    const isTimeRequest = isTimeRequestTransactionUtils(transaction);
    const outstandingChildRequest = getOutstandingChildRequest(iou.report);
    const clearedPendingFields = Object.fromEntries(Object.keys(transaction.pendingFields ?? {}).map((key) => [key, null]));
    const isMoneyRequestToManagerMcTest = isTestTransactionReport(iou.report);
    const onyxData: OnyxData<BuildOnyxDataForMoneyRequestKeys> = {
        optimisticData: [],
        successData: [],
        failureData: [],
    };

    let newQuickAction: ValueOf<typeof CONST.QUICK_ACTIONS>;
    if (isScanRequest) {
        newQuickAction = CONST.QUICK_ACTIONS.REQUEST_SCAN;
    } else if (isPerDiemRequest) {
        newQuickAction = CONST.QUICK_ACTIONS.PER_DIEM;
    } else if (isTimeRequest) {
        newQuickAction = CONST.QUICK_ACTIONS.REQUEST_TIME;
    } else {
        newQuickAction = CONST.QUICK_ACTIONS.REQUEST_MANUAL;
    }

    if (isDistanceRequestTransactionUtils(transaction)) {
        newQuickAction = CONST.QUICK_ACTIONS.REQUEST_DISTANCE;
    }
    const existingTransactionThreadReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${existingTransactionThreadReportID}`] ?? null;

    if (chat.report) {
        onyxData.optimisticData?.push({
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

    onyxData.optimisticData?.push(
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
            value: getTransactionWithPreservedLocalReceiptSource(transaction, isScanRequest),
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
        onyxData.optimisticData?.push(
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
        onyxData.optimisticData?.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${chat.report?.reportID}`,
            value: {
                isOptimisticReport: true,
            },
        });
    }

    if (shouldCreateNewMoneyRequestReport) {
        onyxData.optimisticData?.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${iou.report?.reportID}`,
            value: {
                isOptimisticReport: true,
                hasOnceLoadedReportActions: true,
            },
        });
    }

    if (shouldGenerateTransactionThreadReport && !isEmptyObject(transactionThreadCreatedReportAction)) {
        onyxData.optimisticData?.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReport?.reportID}`,
            value: {
                [transactionThreadCreatedReportAction.reportActionID]: transactionThreadCreatedReportAction,
            },
        });
    }

    if (policyRecentlyUsed.categories?.length) {
        onyxData.optimisticData?.push({
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_CATEGORIES}${iou.report.policyID}`,
            value: policyRecentlyUsed.categories,
        });
    }

    if (policyRecentlyUsed.currencies?.length) {
        onyxData.optimisticData?.push({
            onyxMethod: Onyx.METHOD.SET,
            key: ONYXKEYS.RECENTLY_USED_CURRENCIES,
            value: policyRecentlyUsed.currencies,
        });
    }

    if (!isEmptyObject(policyRecentlyUsed.tags)) {
        onyxData.optimisticData?.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS}${iou.report.policyID}`,
            value: policyRecentlyUsed.tags,
        });
    }

    if (policyRecentlyUsed.destinations?.length) {
        onyxData.optimisticData?.push({
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
        onyxData.optimisticData?.push(...testDriveOptimisticData);
        onyxData.successData?.push(...testDriveSuccessData);
        onyxData.failureData?.push(...testDriveFailureData);
    }

    let iouAction = iou.action;
    let iouReport = iou.report;
    if (isMoneyRequestToManagerMcTest) {
        const date = new Date();
        const isTestReceipt = transaction.receipt?.isTestReceipt ?? false;
        const managerMcTestParticipant = getManagerMcTestParticipant(currentUserAccountIDParam, personalDetails) ?? {};
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

        onyxData.optimisticData?.push(
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.NVP_DISMISSED_PRODUCT_TRAINING}`,
                // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
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

        onyxData.optimisticData?.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
            value: personalDetailListAction,
        });
        onyxData.successData?.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
            value: successPersonalDetailListAction,
        });
    }

    if (!isEmptyObject(nextStepDeprecated)) {
        onyxData.optimisticData?.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.NEXT_STEP}${iou.report.reportID}`,
            value: nextStepDeprecated,
        });
    }
    if (!isEmptyObject(nextStep)) {
        onyxData.optimisticData?.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${iou.report.reportID}`,
            value: {
                nextStep,
                pendingFields: {
                    nextStep: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
            },
        });
        onyxData.successData?.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${iou.report.reportID}`,
            value: {
                pendingFields: {
                    nextStep: null,
                },
            },
        });
        onyxData.failureData?.push({
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
        onyxData.successData?.push(
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

    onyxData.successData?.push(
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
        onyxData.successData?.push(
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
        onyxData.successData?.push({
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

    onyxData.failureData?.push(
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
        onyxData.failureData?.push({
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
        onyxData.optimisticData?.push({
            onyxMethod: Onyx.METHOD.SET,
            key: ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE,
            value: {
                action: newQuickAction,
                chatReportID: chat.report?.reportID,
                isFirstQuickAction: isEmptyObject(quickAction),
            },
        });
        onyxData.failureData?.push({
            onyxMethod: Onyx.METHOD.SET,
            key: ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE,
            value: quickAction ?? null,
        });
    }

    if (shouldGenerateTransactionThreadReport && !isEmptyObject(transactionThreadCreatedReportAction)) {
        onyxData.failureData?.push({
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
            onyxData.optimisticData?.push(...searchUpdate.optimisticData);
        }
        if (searchUpdate.successData) {
            onyxData.successData?.push(...searchUpdate.successData);
        }
    }

    // We don't need to compute violations unless we're on a paid policy
    if (!policy || !isPaidGroupPolicy(policy) || transaction.reportID === CONST.REPORT.UNREPORTED_REPORT_ID) {
        return onyxData;
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
        onyxData.optimisticData?.push(violationsOnyxData, {
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
        onyxData.optimisticData?.push({
            key: `${ONYXKEYS.COLLECTION.REPORT}${iou.report.reportID}`,
            onyxMethod: Onyx.METHOD.MERGE,
            value: {
                nextStep: optimisticNextStep,
                pendingFields: {
                    nextStep: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
            },
        });
        onyxData.successData?.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${iou.report.reportID}`,
            value: {
                pendingFields: {
                    nextStep: null,
                },
            },
        });
        onyxData.failureData?.push({
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction.transactionID}`,
            value: [],
        });
        onyxData.failureData?.push({
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

    return onyxData;
}

/**
 * Recalculates the report name using the policy's custom title formula.
 * This is needed when report totals change (e.g., adding expenses or changing reimbursable status)
 * to ensure the report title reflects the updated values like {report:reimbursable}.
 */
function recalculateOptimisticReportName(iouReport: OnyxTypes.Report, policy: OnyxEntry<OnyxTypes.Policy>): string | undefined {
    if (!policy?.fieldList?.[CONST.POLICY.FIELDS.FIELD_LIST_TITLE]) {
        return undefined;
    }
    const titleFormula = policy.fieldList[CONST.POLICY.FIELDS.FIELD_LIST_TITLE]?.defaultValue ?? '';
    if (!titleFormula) {
        return undefined;
    }
    return populateOptimisticReportFormula(titleFormula, iouReport as Parameters<typeof populateOptimisticReportFormula>[1], policy);
}

function maybeUpdateReportNameForFormulaTitle(iouReport: OnyxTypes.Report, policy: OnyxEntry<OnyxTypes.Policy>): OnyxTypes.Report {
    const reportNameValuePairs = allReportNameValuePairs?.[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${iouReport.reportID}`];
    const titleField = reportNameValuePairs?.expensify_text_title;
    if (titleField?.type !== CONST.REPORT_FIELD_TYPES.FORMULA) {
        return iouReport;
    }

    const updatedReportName = recalculateOptimisticReportName(iouReport, policy);
    if (!updatedReportName) {
        return iouReport;
    }

    return {...iouReport, reportName: updatedReportName};
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
        personalDetails,
        betas,
    } = moneyRequestInformation;
    const {payeeAccountID = deprecatedUserAccountID, payeeEmail = deprecatedCurrentUserEmail, participant} = participantParams;
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
        taxValue,
        billable,
        reimbursable = true,
        linkedTrackedExpenseReportAction,
        pendingAction,
        pendingFields = {},
        type,
        count,
        rate,
        unit,
        customUnit,
        waypoints,
        odometerStart,
        odometerEnd,
    } = transactionParams;

    const payerEmail = addSMSDomainIfPhoneNumber(participant.login ?? '');
    const payerAccountID = Number(participant.accountID);
    const isPolicyExpenseChat = participant.isPolicyExpenseChat;

    // STEP 1: Get existing chat report OR build a new optimistic one
    let isNewChatReport = false;
    let chatReport = !isEmptyObject(parentChatReport) && parentChatReport?.reportID ? parentChatReport : null;

    // If the participant is not a policy expense chat, we need to ensure the chatReport matches the participant.
    // This can happen when submit frequency is disabled and the user selects a different participant on the confirm page.
    // We verify that the chatReport participants match the expected participants. If it's a workspace chat or
    // the participants don't match, we'll find/create the correct 1:1 DM chat report.
    // We also check if the chatReport itself is a Policy Expense Chat to avoid incorrectly validating Policy Expense Chats.
    // We also skip validation for self-DM reports since they use accountID 0 for the participant (representing the report itself).
    // We also skip validation for group chats and deprecated group DMs since they can have more than 2 participants.
    if (chatReport && !isPolicyExpenseChat && !isPolicyExpenseChatReportUtil(chatReport) && !isSelfDM(chatReport) && !isGroupChat(chatReport) && !isDeprecatedGroupDM(chatReport)) {
        const parentChatReportParticipants = Object.keys(chatReport.participants ?? {}).map(Number);
        const expectedParticipants = [payerAccountID, payeeAccountID].sort();
        const sortedParentChatReportParticipants = parentChatReportParticipants.sort();

        const participantsMatch =
            expectedParticipants.length === sortedParentChatReportParticipants.length && expectedParticipants.every((id, index) => id === sortedParentChatReportParticipants.at(index));

        if (!participantsMatch) {
            chatReport = null;
        }
    }

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
            currentUserAccountID: currentUserAccountIDParam,
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

    const isScanRequest = isScanRequestTransactionUtils({
        amount,
        receipt,
        ...(existingTransaction && {
            iouRequestType: existingTransaction.iouRequestType,
        }),
    });

    const shouldCreateNewMoneyRequestReport = isSplitExpense ? false : shouldCreateNewMoneyRequestReportReportUtils(iouReport, chatReport, isScanRequest, betas, action);

    // Generate IDs upfront so we can pass them to buildOptimisticExpenseReport for formula computation
    const optimisticTransactionID = existingTransactionID ?? NumberUtils.rand64();
    const optimisticReportID = optimisticIOUReportID ?? generateReportID();

    if (!iouReport || shouldCreateNewMoneyRequestReport) {
        const nonReimbursableTotal = reimbursable ? 0 : amount;
        const reportTransactions = buildMinimalTransactionForFormula(optimisticTransactionID, optimisticReportID, created, amount, currency, merchant);

        iouReport = isPolicyExpenseChat
            ? buildOptimisticExpenseReport({
                  chatReportID: chatReport.reportID,
                  policyID: chatReport.policyID,
                  payeeAccountID,
                  total: amount,
                  currency,
                  nonReimbursableTotal,
                  optimisticIOUReportID: optimisticReportID,
                  reportTransactions,
                  betas,
              })
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

                iouReport = maybeUpdateReportNameForFormulaTitle(iouReport, policy);
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
            taxValue,
            billable,
            pendingAction,
            pendingFields: isDistanceRequest && !isManualDistanceRequest ? {waypoints: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD, ...pendingFields} : pendingFields,
            reimbursable: isPolicyExpenseChat ? reimbursable : true,
            type,
            count,
            rate,
            unit,
            customUnit,
            waypoints,
            odometerStart,
            odometerEnd,
        },
        isDemoTransactionParam: isSelectedManagerMcTest(participant.login) || transactionParams.receipt?.isTestDriveReceipt,
    });

    iouReport.transactionCount = (iouReport.transactionCount ?? 0) + 1;

    const optimisticPolicyRecentlyUsedCategories = mergePolicyRecentlyUsedCategories(category, policyRecentlyUsedCategories);
    const optimisticPolicyRecentlyUsedTags = buildOptimisticPolicyRecentlyUsedTags({
        // TODO: Replace getPolicyTagsData (https://github.com/Expensify/App/issues/72721) and getPolicyRecentlyUsedTagsData (https://github.com/Expensify/App/issues/71491) with useOnyx hook
        // eslint-disable-next-line @typescript-eslint/no-deprecated
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
        // For split expenses, exclude merchant from merge to preserve merchant from splitExpense
        if (isSplitExpense) {
            // Preserve merchant from transactionParams (splitExpense.merchant) before merge
            const preservedMerchant = merchant || optimisticTransaction.merchant;
            const {merchant: omittedMerchant, ...existingTransactionWithoutMerchant} = existingTransaction;
            optimisticTransaction = fastMerge(existingTransactionWithoutMerchant, optimisticTransaction, false) as OnyxTypes.Transaction;

            // Explicitly set merchant from splitExpense to ensure it's not overwritten
            optimisticTransaction.merchant = preservedMerchant;
        } else {
            optimisticTransaction = fastMerge(existingTransaction, optimisticTransaction, false);
        }
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

    const shouldCreateOptimisticPersonalDetails = isNewChatReport && !(personalDetails?.[payerAccountID] ?? allPersonalDetails[payerAccountID]);
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

    const predictedNextStatus =
        iouReport.statusNum ?? (policy?.reimbursementChoice === CONST.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO ? CONST.REPORT.STATUS_NUM.CLOSED : CONST.REPORT.STATUS_NUM.OPEN);
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
    const {optimisticData, successData, failureData} = buildOnyxDataForMoneyRequest({
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
        personalDetails,
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
    const currenciesArray = policyRecentlyUsedCurrencies ?? [];
    if (currency) {
        const currenciesWithNew = [currency, ...currenciesArray];
        mergedCurrencies = Array.from(new Set(currenciesWithNew));
    } else {
        mergedCurrencies = currenciesArray;
    }
    return mergedCurrencies.slice(0, CONST.IOU.MAX_RECENT_REPORTS_TO_SHOW);
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
    const isExpenseReportLocal = isExpenseReport(iouReport) || isInvoiceReportReportUtils(iouReport);
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
    transactionChanges?: TransactionChanges,
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
        // Only recalculate reportName when reimbursable status changes and the report uses a formula title
        if (transactionChanges && 'reimbursable' in transactionChanges) {
            updatedMoneyRequestReport = maybeUpdateReportNameForFormulaTitle(updatedMoneyRequestReport, policy);
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
    isSplitTransaction?: boolean;
};

type UpdateMoneyRequestDataKeys =
    | typeof ONYXKEYS.COLLECTION.REPORT
    | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS
    | typeof ONYXKEYS.COLLECTION.TRANSACTION
    | typeof ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_CATEGORIES
    | typeof ONYXKEYS.RECENTLY_USED_CURRENCIES
    | typeof ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS
    | typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS
    | typeof ONYXKEYS.NVP_RECENT_ATTENDEES
    | typeof ONYXKEYS.COLLECTION.SNAPSHOT
    | typeof ONYXKEYS.COLLECTION.NEXT_STEP
    | typeof ONYXKEYS.COLLECTION.TRANSACTION_DRAFT;

function getUpdateMoneyRequestParams(params: GetUpdateMoneyRequestParamsType): UpdateMoneyRequestData<UpdateMoneyRequestDataKeys> {
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
        isSplitTransaction,
    } = params;
    const optimisticData: Array<
        OnyxUpdate<
            | typeof ONYXKEYS.COLLECTION.REPORT
            | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS
            | typeof ONYXKEYS.COLLECTION.TRANSACTION
            | typeof ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_CATEGORIES
            | typeof ONYXKEYS.RECENTLY_USED_CURRENCIES
            | typeof ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS
            | typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS
            | typeof ONYXKEYS.NVP_RECENT_ATTENDEES
            | typeof ONYXKEYS.COLLECTION.SNAPSHOT
            | typeof ONYXKEYS.COLLECTION.NEXT_STEP
        >
    > = [];
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
    const isFromExpenseReport = isExpenseReport(iouReport) || isInvoiceReportReportUtils(iouReport);
    const updatedTransaction: OnyxEntry<OnyxTypes.Transaction> = transaction
        ? getUpdatedTransaction({
              transaction,
              transactionChanges,
              isFromExpenseReport,
              isSplitTransaction,
              policy,
          })
        : undefined;

    const transactionDetails = getTransactionDetails(updatedTransaction, undefined, undefined, allowNegative);

    if (transactionDetails?.waypoints) {
        transactionDetails.waypoints = stringifyWaypointsForAPI(transactionDetails.waypoints as WaypointCollection);
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
    const hasModifiedMerchant = 'merchant' in transactionChanges;
    // For split transactions, the merchant and amount are already computed in transactionChanges,
    // so we can build a valid optimistic MODIFIED_EXPENSE even when waypoints are pending.
    const hasSplitDistanceMessageFields = !!isSplitTransaction && hasModifiedMerchant && hasModifiedAmount;
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
    // - we're updating the waypoints (unless it's a split transaction with computed merchant + amount)
    // - we're updating the distance rate while the waypoints are still pending
    // - we're merging two expenses (server does not create MODIFIED_EXPENSE in this flow)
    // In these cases, there isn't a valid optimistic mileage data we can use,
    // and the report action is created on the server with the distance-related response from the MapBox API.
    // For split transactions, the merchant and amount are already available in transactionChanges,
    // so we can build the optimistic report action even when waypoints are pending.
    const updatedReportAction = shouldBuildOptimisticModifiedExpenseReportAction
        ? buildOptimisticModifiedExpenseReportAction(transactionThreadReport, transaction, transactionChanges, isFromExpenseReport, policy, updatedTransaction, allowNegative)
        : null;
    if ((!hasPendingWaypoints || hasSplitDistanceMessageFields) && !(hasModifiedDistanceRate && isFetchingWaypointsFromServer(transaction)) && updatedReportAction) {
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
        transactionChanges,
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
            pendingFields,
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
            // TODO: Replace getPolicyTagsData (https://github.com/Expensify/App/issues/72721) and getPolicyRecentlyUsedTagsData (https://github.com/Expensify/App/issues/71491) with useOnyx hook
            // eslint-disable-next-line @typescript-eslint/no-deprecated
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
                (attendee) => attendee.email || attendee.displayName,
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
    const hasModifiedDistance = 'distance' in transactionChanges;
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
            hasModifiedDistance ||
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
        if (hasModifiedDistanceRate || hasModifiedDistance) {
            optimisticViolations = optimisticViolations.filter(
                (violation) => !(violation.name === CONST.VIOLATIONS.MODIFIED_AMOUNT && violation.data?.type === CONST.MODIFIED_AMOUNT_VIOLATION_DATA.DISTANCE),
            );
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
): UpdateMoneyRequestData<
    typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.TRANSACTION | typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.TRANSACTION_DRAFT
> {
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
        transactionDetails.waypoints = stringifyWaypointsForAPI(transactionDetails.waypoints as WaypointCollection);
    }

    const dataToIncludeInParams: Partial<TransactionDetails> = Object.fromEntries(Object.entries(transactionDetails ?? {}).filter(([key]) => key in transactionChanges));

    const apiParams: UpdateMoneyRequestParams = {
        ...dataToIncludeInParams,
        reportID: chatReport?.reportID,
        transactionID,
    };

    const hasPendingWaypoints = 'waypoints' in transactionChanges;
    const hasModifiedDistanceRate = 'customUnitRateID' in transactionChanges;
    if (transaction && updatedTransaction && hasPendingWaypoints) {
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
    let data: UpdateMoneyRequestData<UpdateMoneyRequestDataKeys>;
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
    let data: UpdateMoneyRequestData<UpdateMoneyRequestDataKeys>;
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
    transaction: OnyxEntry<OnyxTypes.Transaction>;
    transactionThreadReport: OnyxEntry<OnyxTypes.Report>;
    parentReport: OnyxEntry<OnyxTypes.Report>;
    waypoints?: WaypointCollection;
    recentWaypoints: OnyxEntry<OnyxTypes.RecentWaypoint[]>;
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
    transaction,
    transactionThreadReport,
    parentReport,
    waypoints,
    recentWaypoints = [],
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
        // Don't sanitize waypoints here - keep all fields for Onyx optimistic data (e.g., keyForList)
        // Sanitization happens when building API params
        ...(waypoints && {waypoints}),
        routes,
        ...(distance && {distance}),
        ...(odometerStart !== undefined && {odometerStart}),
        ...(odometerEnd !== undefined && {odometerEnd}),
    };
    let data: UpdateMoneyRequestData<UpdateMoneyRequestDataKeys | typeof ONYXKEYS.NVP_RECENT_WAYPOINTS>;
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    if (isTrackExpenseReport(transactionThreadReport) && isSelfDM(parentReport)) {
        data = getUpdateTrackExpenseParams(transaction?.transactionID, transactionThreadReport?.reportID, transactionChanges, policy);
    } else {
        data = getUpdateMoneyRequestParams({
            transactionID: transaction?.transactionID,
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
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction?.transactionID}`,
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
    let data: UpdateMoneyRequestData<UpdateMoneyRequestDataKeys>;
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
    transaction,
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
    updatedTaxValue,
    parentReportNextStep,
}: {
    transaction: OnyxEntry<OnyxTypes.Transaction>;
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
    updatedTaxValue?: string;
    parentReportNextStep: OnyxEntry<OnyxTypes.ReportNextStepDeprecated>;
}) {
    const transactionChanges: TransactionChanges = {
        customUnitRateID: rateID,
        ...(typeof updatedTaxAmount === 'number' ? {taxAmount: updatedTaxAmount} : {}),
        ...(updatedTaxCode ? {taxCode: updatedTaxCode} : {}),
        ...(updatedTaxValue ? {taxValue: updatedTaxValue} : {}),
    };

    if (transaction?.transactionID) {
        const existingDistanceUnit = transaction?.comment?.customUnit?.distanceUnit;
        const newDistanceUnit = DistanceRequestUtils.getRateByCustomUnitRateID({customUnitRateID: rateID, policy})?.unit;

        // If the distanceUnit is set and the rate is changed to one that has a different unit, mark the merchant as modified to make the distance field pending
        if (existingDistanceUnit && newDistanceUnit && newDistanceUnit !== existingDistanceUnit) {
            transactionChanges.merchant = getMerchant(transaction);
        }
    }

    let data: UpdateMoneyRequestData<UpdateMoneyRequestDataKeys>;
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    if (isTrackExpenseReport(transactionThreadReport) && isSelfDM(parentReport)) {
        data = getUpdateTrackExpenseParams(transaction?.transactionID, transactionThreadReport?.reportID, transactionChanges, policy);
    } else {
        data = getUpdateMoneyRequestParams({
            transactionID: transaction?.transactionID,
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
            currentUserAccountID,
        });

        return {existingSplitChatReport: null, splitChatReport};
    }

    // Otherwise, create a new 1:1 chat report
    const splitChatReport = buildOptimisticChatReport({
        participantList: participantAccountIDs,
        currentUserAccountID,
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
        taxValue,
        attendees,
    },
    policyRecentlyUsedCategories,
    policyRecentlyUsedTags,
    isASAPSubmitBetaEnabled,
    transactionViolations,
    quickAction,
    policyRecentlyUsedCurrencies,
    betas,
    personalDetails,
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
            taxValue,
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

    const optimisticData: Array<OnyxUpdate<BuildOnyxDataForMoneyRequestKeys>> = [
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

    const successData: Array<OnyxUpdate<BuildOnyxDataForMoneyRequestKeys>> = [
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

    const failureData: Array<OnyxUpdate<BuildOnyxDataForMoneyRequestKeys>> = [
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
                    currentUserAccountID,
                });
        }

        // STEP 2: Get existing IOU/Expense report and update its total OR build a new optimistic one
        let oneOnOneIOUReport: OneOnOneIOUReport = oneOnOneChatReport.iouReportID ? allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${oneOnOneChatReport.iouReportID}`] : null;
        const isScanRequest = isScanRequestTransactionUtils(splitTransaction);
        const shouldCreateNewOneOnOneIOUReport = shouldCreateNewMoneyRequestReportReportUtils(oneOnOneIOUReport, oneOnOneChatReport, isScanRequest, betas);

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
                ? buildOptimisticExpenseReport({
                      chatReportID: oneOnOneChatReport.reportID,
                      policyID: oneOnOneChatReport.policyID,
                      payeeAccountID: currentUserAccountID,
                      total: splitAmount,
                      currency,
                      optimisticIOUReportID: optimisticExpenseReportID,
                      reportTransactions,
                      betas,
                  })
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
                taxValue,
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
                  // TODO: Replace getPolicyTagsData (https://github.com/Expensify/App/issues/72721) and getPolicyRecentlyUsedTagsData (https://github.com/Expensify/App/issues/71491) with useOnyx hook
                  // eslint-disable-next-line @typescript-eslint/no-deprecated
                  policyTags: getPolicyTagsData(participant.policyID),
                  policyRecentlyUsedTags,
                  transactionTags: tag,
              })
            : {};
        const hasViolations = hasViolationsReportUtils(oneOnOneIOUReport.reportID, transactionViolations, currentUserAccountID, currentUserEmailForIOUSplit);

        // STEP 5: Build Onyx Data
        const {
            optimisticData: oneOnOneOptimisticData,
            successData: oneOnOneSuccessData,
            failureData: oneOnOneFailureData,
        } = buildOnyxDataForMoneyRequest({
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
            currentUserEmailParam: deprecatedCurrentUserEmail,
            hasViolations,
            quickAction,
            personalDetails,
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
        optimisticData.push(...(oneOnOneOptimisticData ?? []));
        successData.push(...(oneOnOneSuccessData ?? []));
        failureData.push(...(oneOnOneFailureData ?? []));
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

/** Requests money based on a distance (e.g. mileage from a map) */
function createDistanceRequest(distanceRequestInformation: CreateDistanceRequestInformation) {
    const {
        report,
        participants,
        currentUserLogin = '',
        currentUserAccountID = -1,
        iouType = CONST.IOU.TYPE.SUBMIT,
        existingIOUReport,
        existingTransaction,
        transactionParams,
        policyParams = {},
        backToReport,
        isASAPSubmitBetaEnabled,
        transactionViolations,
        quickAction,
        policyRecentlyUsedCurrencies,
        recentWaypoints = [],
        customUnitPolicyID,
        shouldHandleNavigation = true,
        shouldPlaySound: shouldPlaySoundParam = true,
        personalDetails,
        betas,
        optimisticReportPreviewActionID,
        shouldDeferAutoSubmit,
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
        taxValue,
        merchant,
        modifiedAmount,
        billable,
        reimbursable,
        validWaypoints,
        customUnitRateID = '',
        splitShares = {},
        attendees,
        receipt,
        odometerStart,
        odometerEnd,
        isFromGlobalCreate,
        gpsCoordinates,
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
    let onyxData: OnyxData<BuildOnyxDataForMoneyRequestKeys | typeof ONYXKEYS.NVP_LAST_DISTANCE_EXPENSE_TYPE | typeof ONYXKEYS.NVP_RECENT_WAYPOINTS | typeof ONYXKEYS.GPS_DRAFT_DETAILS>;
    let distanceIouReport: OnyxInputValue<OnyxTypes.Report> = null;
    const sanitizedWaypoints = !isManualDistanceRequest ? sanitizeWaypointsForAPI(validWaypoints) : null;
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
                taxValue,
                attendees,
            },
            policyRecentlyUsedCategories,
            policyRecentlyUsedTags,
            isASAPSubmitBetaEnabled,
            transactionViolations,
            quickAction,
            policyRecentlyUsedCurrencies,
            betas,
            personalDetails,
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
            gpsCoordinates,
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
            existingIOUReport,
            existingTransaction,
            moneyRequestReportID,
            participantParams: {
                participant,
                payeeAccountID: deprecatedUserAccountID,
                payeeEmail: deprecatedCurrentUserEmail,
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
                taxValue,
                billable,
                reimbursable,
                attendees,
                waypoints: validWaypoints,
                odometerStart,
                odometerEnd,
            },
            isASAPSubmitBetaEnabled,
            currentUserAccountIDParam: currentUserAccountID,
            currentUserEmailParam: currentUserLogin,
            transactionViolations,
            quickAction,
            policyRecentlyUsedCurrencies,
            personalDetails,
            betas,
            optimisticReportPreviewActionID,
        });

        onyxData = moneyRequestOnyxData;
        distanceIouReport = iouReport;

        const isGPSDistanceRequest = transaction.iouRequestType === CONST.IOU.REQUEST_TYPE.DISTANCE_GPS;

        if (
            transaction.iouRequestType === CONST.IOU.REQUEST_TYPE.DISTANCE_MAP ||
            isGPSDistanceRequest ||
            isManualDistanceRequest ||
            transaction.iouRequestType === CONST.IOU.REQUEST_TYPE.DISTANCE_ODOMETER
        ) {
            onyxData?.optimisticData?.push({
                onyxMethod: Onyx.METHOD.SET,
                key: ONYXKEYS.NVP_LAST_DISTANCE_EXPENSE_TYPE,
                // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
                value: transaction.iouRequestType,
            });
        }

        if (isGPSDistanceRequest) {
            onyxData?.optimisticData?.push({
                onyxMethod: Onyx.METHOD.SET,
                key: ONYXKEYS.GPS_DRAFT_DETAILS,
                value: null,
            });
        }

        parameters = {
            amount: modifiedAmount ?? undefined,
            comment,
            iouReportID: iouReport.reportID,
            chatReportID: chatReport.reportID,
            transactionID: transaction.transactionID,
            reportActionID: iouAction.reportActionID,
            createdChatReportActionID,
            createdIOUReportActionID,
            reportPreviewReportActionID: reportPreviewAction.reportActionID,
            waypoints: JSON.stringify(sanitizedWaypoints),
            distance: distance !== undefined ? roundToTwoDecimalPlaces(distance) : undefined,
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
            gpsCoordinates,
            shouldDeferAutoSubmit,
        };
    }

    const recentServerValidatedWaypoints = recentWaypoints.filter((item) => !item.pendingAction);
    onyxData?.failureData?.push({
        onyxMethod: Onyx.METHOD.SET,
        key: `${ONYXKEYS.NVP_RECENT_WAYPOINTS}`,
        value: recentServerValidatedWaypoints,
    });

    if (shouldPlaySoundParam) {
        playSound(SOUNDS.DONE);
    }

    const shouldDeferWrite = shouldHandleNavigation && isFromGlobalCreate && !isReportTopmostSplitNavigator();
    const apiWrite = () => {
        API.write(WRITE_COMMANDS.CREATE_DISTANCE_REQUEST, parameters, onyxData);
    };

    if (shouldDeferWrite) {
        registerDeferredWrite(CONST.DEFERRED_LAYOUT_WRITE_KEYS.SEARCH, apiWrite, {
            optimisticWatchKey: `${ONYXKEYS.COLLECTION.TRANSACTION}${parameters.transactionID}`,
        });
    } else {
        apiWrite();
    }

    // eslint-disable-next-line @typescript-eslint/no-deprecated
    InteractionManager.runAfterInteractions(() => removeDraftTransaction(CONST.IOU.OPTIMISTIC_TRANSACTION_ID));
    const activeReportID = isMoneyRequestReport && report?.reportID ? report.reportID : parameters.chatReportID;

    if (shouldHandleNavigation) {
        highlightTransactionOnSearchRouteIfNeeded(isFromGlobalCreate, parameters.transactionID, CONST.SEARCH.DATA_TYPES.EXPENSE);
        handleNavigateAfterExpenseCreate({activeReportID: backToReport ?? activeReportID, isFromGlobalCreate, transactionID: parameters.transactionID});
    }

    if (!isMoneyRequestReport) {
        notifyNewAction(activeReportID, undefined, true);
    }

    return {iouReport: distanceIouReport};
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

    let data: UpdateMoneyRequestData<UpdateMoneyRequestDataKeys>;
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
    originalReportID: string | undefined,
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
        clearAllRelatedReportActionErrors(reportID, reportAction, originalReportID);
    }

    // First, update the reportActions to ensure related actions are not displayed.
    Onyx.update(reportActionsOnyxUpdates).then(() => {
        Navigation.goBack(urlToNavigateBack);
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        InteractionManager.runAfterInteractions(() => {
            if (shouldDeleteIOUReport) {
                clearAllRelatedReportActionErrors(reportID, reportAction, originalReportID);
            }
            // After navigation, update the remaining data.
            Onyx.update(onyxUpdates);
        });
    });
}

/**
 * @param transactionThreadID - The transaction thread reportID of the transaction
 * @param shouldDeleteTransactionThread - Flag indicating whether the transactionThread should be optimistically deleted
 * @param reportAction - The IOU action of the transaction
 * @return Returns Onyx data including information about deleting the transactionThread and updating the child comment count for the preview report action
 */
function getCleanUpTransactionThreadReportOnyxData({
    transactionThreadID,
    shouldDeleteTransactionThread,
    reportAction,
    isChatIOUReportArchived,
    updatedReportPreviewAction,
    shouldAddUpdatedReportPreviewActionToOnyxData = true,
    currentUserAccountID,
}: {
    transactionThreadID?: string;
    shouldDeleteTransactionThread: boolean;
    reportAction?: ReportAction;
    isChatIOUReportArchived?: boolean;
    updatedReportPreviewAction?: ReportAction;
    shouldAddUpdatedReportPreviewActionToOnyxData?: boolean;
    currentUserAccountID: number;
}) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [];
    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [];
    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [];

    if (shouldDeleteTransactionThread) {
        let transactionThread = null;
        let transactionThreadReportActions = null;
        if (transactionThreadID) {
            transactionThread = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadID}`] ?? null;
            transactionThreadReportActions = allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadID}`] ?? null;
        }

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
                        [currentUserAccountID]: {
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
        if (transactionThread) {
            successData.push({
                onyxMethod: Onyx.METHOD.SET,
                key: `${ONYXKEYS.COLLECTION.REPORT}${transactionThreadID}`,
                value: null,
            });
        }
        failureData.push(
            {
                onyxMethod: Onyx.METHOD.SET,
                key: `${ONYXKEYS.COLLECTION.REPORT}${transactionThreadID}`,
                value: transactionThread ?? null,
            },
            {
                onyxMethod: Onyx.METHOD.SET,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadID}`,
                value: transactionThreadReportActions,
            },
        );
    }

    // Update the child comment visible count for reportPreviewAction.
    const iouReportID = isMoneyRequestAction(reportAction) ? getOriginalMessage(reportAction)?.IOUReportID : undefined;
    const iouReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`];
    const chatReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${iouReport?.chatReportID}`];
    const originalReportPreviewAction = getReportPreviewAction(chatReport?.reportID, iouReport?.reportID) ?? undefined;
    let reportPreviewAction = updatedReportPreviewAction ?? originalReportPreviewAction;
    if (
        originalReportPreviewAction?.reportActionID &&
        reportPreviewAction?.reportActionID &&
        reportPreviewAction?.childVisibleActionCount &&
        reportPreviewAction?.childVisibleActionCount > 0 &&
        reportAction?.childVisibleActionCount &&
        reportAction?.childVisibleActionCount > 0
    ) {
        let canUserPerformWriteAction = true;
        if (chatReport) {
            const reportNameValuePairs = allReportNameValuePairs?.[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${iouReport?.reportID}`];
            const isArchivedExpenseReport = isArchivedReport(reportNameValuePairs);

            canUserPerformWriteAction = !!canUserPerformWriteActionReportUtils(chatReport, isChatIOUReportArchived ?? isArchivedExpenseReport);
        }
        const lastVisibleAction = getLastVisibleAction(iouReportID, canUserPerformWriteAction);

        const {childVisibleActionCount, childCommenterCount, childLastVisibleActionCreated, childOldestFourAccountIDs} = updateOptimisticParentReportAction(
            reportPreviewAction,
            lastVisibleAction?.childLastVisibleActionCreated ?? lastVisibleAction?.created ?? '',
            CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
            reportAction.childVisibleActionCount,
        );

        if (shouldAddUpdatedReportPreviewActionToOnyxData) {
            optimisticData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport?.reportID}`,
                value: {
                    [reportPreviewAction.reportActionID]: {
                        childVisibleActionCount,
                        childCommenterCount,
                        childLastVisibleActionCreated,
                        childOldestFourAccountIDs,
                    },
                },
            });

            failureData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport?.reportID}`,
                value: {
                    [reportPreviewAction.reportActionID]: {
                        childVisibleActionCount: originalReportPreviewAction.childVisibleActionCount,
                        childCommenterCount: originalReportPreviewAction.childCommenterCount,
                        childLastVisibleActionCreated: originalReportPreviewAction.childLastVisibleActionCreated,
                        childOldestFourAccountIDs: originalReportPreviewAction.childOldestFourAccountIDs,
                    },
                },
            });
        }

        reportPreviewAction = {
            reportActionID: originalReportPreviewAction.reportActionID,
            childVisibleActionCount,
            childCommenterCount,
            childLastVisibleActionCreated,
            childOldestFourAccountIDs,
        } as ReportAction;
    }

    return {
        optimisticData,
        successData,
        failureData,
        updatedReportPreviewAction: reportPreviewAction,
    };
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
    currentUserAccountID,
    currentUserEmail,
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
        transaction,
        transactionViolations,
        reportPreviewAction,
        iouReportActions,
    } = prepareToCleanUpMoneyRequest(transactionID, reportAction, iouReport, chatReport, isChatIOUReportArchived, false, transactionIDsPendingDeletion, selectedTransactionIDs);

    const urlToNavigateBack = getNavigationUrlOnMoneyRequestDelete(transactionID, reportAction, iouReport, chatReport, isChatIOUReportArchived, isSingleTransactionView);

    // STEP 2: Build Onyx data
    // The logic mostly resembles the cleanUpMoneyRequest function
    const optimisticData: Array<
        OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION | typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS | typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>
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
                hasOutstandingChildRequest: hasOutstandingChildRequest(chatReport, updatedIOUReport, currentUserEmail, currentUserAccountID, allTransactionViolationsParam, undefined),
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
                    hasOutstandingChildRequest: hasOutstandingChildRequest(chatReport, iouReport?.reportID, currentUserEmail, currentUserAccountID, allTransactionViolationsParam, undefined),
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

    const cleanUpTransactionThreadReportOnyxData = getCleanUpTransactionThreadReportOnyxData({
        shouldDeleteTransactionThread,
        transactionThreadID,
        reportAction,
        isChatIOUReportArchived,
        currentUserAccountID,
    });
    optimisticData.push(...cleanUpTransactionThreadReportOnyxData.optimisticData);

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.TRANSACTION>> = [
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
    successData.push(...cleanUpTransactionThreadReportOnyxData.successData);

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

    failureData.push(...cleanUpTransactionThreadReportOnyxData.failureData);

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

    const parameters: DeleteMoneyRequestParams = {
        transactionID,
        reportActionID: reportAction.reportActionID,
    };

    // STEP 3: Make the API request
    API.write(WRITE_COMMANDS.DELETE_MONEY_REQUEST, parameters, {optimisticData, successData, failureData});
    clearPdfByOnyxKey(transactionID);

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
        CONST.REPORT.ACTIONS.TYPE.REJECTED_TO_SUBMITTER,
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
    betas,
    isApprovalFlow = false,
}: {
    chatReport: OnyxTypes.Report;
    iouReport: OnyxEntry<OnyxTypes.Report>;
    recipient: Participant;
    policy: OnyxEntry<OnyxTypes.Policy>;
    createdTimestamp?: string;
    betas: OnyxEntry<OnyxTypes.Beta[]>;
    isApprovalFlow?: boolean;
}): {
    optimisticHoldReportID: string;
    optimisticHoldActionID: string;
    optimisticCreatedReportForUnapprovedTransactionsActionID: string | undefined;
    optimisticHoldReportExpenseActionIDs: OptimisticHoldReportExpenseActionID[];
    optimisticReportActionCopyIDs: OptimisticReportActionCopyIDs;
    optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.TRANSACTION>>;
    successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>>;
    failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.TRANSACTION>>;
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
        ? buildOptimisticExpenseReport({
              chatReportID: chatReport.reportID,
              policyID: chatReport.policyID ?? iouReport?.policyID,
              payeeAccountID: recipient.accountID ?? 1,
              total: holdAmount,
              currency: iouReport?.currency ?? '',
              nonReimbursableTotal: holdNonReimbursableAmount,
              parentReportActionID: newParentReportActionID,
              betas,
              reportTransactions,
              createdTimestamp,
          })
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
    betas,
    isSelfTourViewed,
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
    currentUserAccountIDParam: number;
    currentUserEmailParam?: string;
    introSelected?: OnyxEntry<OnyxTypes.IntroSelected>;
    iouReportCurrentNextStepDeprecated: OnyxEntry<OnyxTypes.ReportNextStepDeprecated>;
    betas: OnyxEntry<OnyxTypes.Beta[]>;
    isSelfTourViewed: boolean | undefined;
}): PayMoneyRequestData {
    const isInvoiceReport = isInvoiceReportReportUtils(iouReport);
    let payerPolicyID = activePolicy?.id;
    let chatReport = initialChatReport;
    let policyParams = {};
    const onyxData: OnyxData<
        | typeof ONYXKEYS.NVP_ACTIVE_POLICY_ID
        | typeof ONYXKEYS.COLLECTION.REPORT
        | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS
        | typeof ONYXKEYS.COLLECTION.NEXT_STEP
        | typeof ONYXKEYS.NVP_LAST_PAYMENT_METHOD
        | typeof ONYXKEYS.COLLECTION.TRANSACTION
        | typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS
        | BuildPolicyDataKeys
    > = {
        optimisticData: [],
        successData: [],
        failureData: [],
    };
    const shouldCreatePolicy = !activePolicy || !isPolicyAdmin(activePolicy) || !isPaidGroupPolicy(activePolicy);

    if (isIndividualInvoiceRoom(chatReport) && payAsBusiness && shouldCreatePolicy) {
        payerPolicyID = generatePolicyID();
        const {
            optimisticData: policyOptimisticData,
            failureData: policyFailureData,
            successData: policySuccessData,
            params,
        } = buildPolicyData({
            policyOwnerEmail: deprecatedCurrentUserEmail,
            makeMeAdmin: true,
            policyID: payerPolicyID,
            currentUserAccountIDParam: currentUserAccountIDParam ?? CONST.DEFAULT_NUMBER_ID,
            currentUserEmailParam: currentUserEmailParam ?? '',
            introSelected,
            activePolicyID: activePolicy?.id,
            companySize: introSelected?.companySize as OnboardingCompanySize,
            betas,
            isSelfTourViewed,
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

        onyxData.optimisticData?.push(...(policyOptimisticData ?? []), {onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.NVP_ACTIVE_POLICY_ID, value: payerPolicyID});
        onyxData.successData?.push(...(policySuccessData ?? []));
        onyxData.failureData?.push(...(policyFailureData ?? []), {onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.NVP_ACTIVE_POLICY_ID, value: activePolicy?.id ?? null});
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
        hasOutstandingChildRequest: hasOutstandingChildRequest(chatReport, iouReport?.reportID, deprecatedCurrentUserEmail, currentUserAccountIDParam, allTransactionViolations, undefined),
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

    onyxData.optimisticData?.push(
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

        onyxData.optimisticData?.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_LAST_PAYMENT_METHOD,
            value: optimisticLastPaymentMethod,
        });
    }

    onyxData.successData?.push(
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

    onyxData.failureData?.push(
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport?.reportID}`,
            value: {
                [optimisticIOUReportAction.reportActionID]: {
                    errors: getMicroSecondOnyxErrorWithTranslationKey('iou.error.other', 0),
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
        onyxData.optimisticData?.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport.reportID}`,
            value: {
                [optimisticReportPreviewAction.reportActionID]: optimisticReportPreviewAction,
            },
        });
        onyxData.failureData?.push({
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
            onyxData.optimisticData?.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`,
                value: {
                    comment: {
                        hold: null,
                    },
                },
            });
            onyxData.failureData?.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`,
                value: {
                    comment: {
                        hold: transaction.comment?.hold,
                    },
                },
            });
        }

        const optimisticTransactionViolations: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS>> = reportTransactions.map(({transactionID}) => {
            return {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`,
                value: null,
            };
        });
        onyxData.optimisticData?.push(...optimisticTransactionViolations);

        const failureTransactionViolations: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS>> = reportTransactions.map(({transactionID}) => {
            const violations = allTransactionViolations[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`] ?? [];
            return {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`,
                value: violations,
            };
        });
        onyxData.failureData?.push(...failureTransactionViolations);
    }

    let optimisticHoldReportID;
    let optimisticHoldActionID;
    let optimisticHoldReportExpenseActionIDs;
    if (!full) {
        const holdReportOnyxData = getReportFromHoldRequestsOnyxData({chatReport, iouReport, recipient, policy: reportPolicy, betas});

        onyxData.optimisticData?.push(...holdReportOnyxData.optimisticData);
        onyxData.successData?.push(...holdReportOnyxData.successData);
        onyxData.failureData?.push(...holdReportOnyxData.failureData);
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
            ...(bankAccountID != null ? {bankAccountID} : {}),
            ...policyParams,
        },
        onyxData,
    };
}

function canApproveIOU(
    iouReport: OnyxTypes.OnyxInputOrEntry<OnyxTypes.Report>,
    policy: OnyxTypes.OnyxInputOrEntry<OnyxTypes.Policy>,
    reportMetadata: OnyxEntry<OnyxTypes.ReportMetadata>,
    iouTransactions?: OnyxTypes.Transaction[],
) {
    // Only expense reports can be approved
    if (!isExpenseReport(iouReport) || !(policy && isPaidGroupPolicy(policy))) {
        return false;
    }

    const isOnSubmitAndClosePolicy = isSubmitAndClose(policy);
    if (isOnSubmitAndClosePolicy) {
        return false;
    }

    const isDEWPolicy = hasDynamicExternalWorkflow(policy);
    if (hasPendingDEWApprove(reportMetadata, isDEWPolicy)) {
        return false;
    }

    const managerID = iouReport?.managerID ?? CONST.DEFAULT_NUMBER_ID;
    const isCurrentUserManager = managerID === deprecatedUserAccountID;
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
            return chatReport?.invoiceReceiver?.accountID === deprecatedUserAccountID;
        }
        return invoiceReceiverPolicy?.role === CONST.POLICY.ROLE.ADMIN;
    }

    const isPayer = isPayerReportUtils(deprecatedUserAccountID, deprecatedCurrentUserEmail, iouReport, bankAccountList, policy, onlyShowPayElsewhere);

    const {reimbursableSpend, nonReimbursableSpend} = getMoneyRequestSpendBreakdown(iouReport);
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
    const isOnlyNonReimbursablePayElsewhere = onlyShowPayElsewhere && nonReimbursableSpend !== 0 && hasOnlyNonReimbursableTransactions(iouReport?.reportID, transactions);

    if (isIOU && isPayer && !iouSettled && reimbursableSpend > 0) {
        return true;
    }

    return (
        isPayer &&
        isReportFinished &&
        !iouSettled &&
        (reimbursableSpend > 0 || canShowMarkedAsPaidForNegativeAmount || isOnlyNonReimbursablePayElsewhere) &&
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
    currentUserAccountID: number,
) {
    const isOpenExpenseReport = isOpenExpenseReportReportUtils(report);
    const isAdmin = policy?.role === CONST.POLICY.ROLE.ADMIN;
    const hasAllPendingRTERViolations = allHavePendingRTERViolation(transactions, allViolations, currentUserEmailParam, currentUserAccountID, report, policy);
    const hasTransactionWithoutRTERViolation = hasAnyTransactionWithoutRTERViolation(transactions, allViolations, currentUserEmailParam, currentUserAccountID, report, policy);
    const hasOnlyPendingCardOrScanFailTransactions = transactions.length > 0 && transactions.every((t) => isPendingCardOrScanningTransaction(t));
    const hasAnySubmissionBlockingViolations = transactions.some((transaction) =>
        hasSubmissionBlockingViolations(transaction, allViolations, currentUserEmailParam, currentUserAccountID, report, policy),
    );

    return (
        isOpenExpenseReport &&
        (report?.ownerAccountID === currentUserAccountID || report?.managerID === currentUserAccountID || isAdmin) &&
        !hasOnlyPendingCardOrScanFailTransactions &&
        !hasAllPendingRTERViolations &&
        hasTransactionWithoutRTERViolation &&
        !isReportArchived &&
        !hasAnySubmissionBlockingViolations &&
        !hasSmartScanFailedWithMissingFields(transactions, report) &&
        transactions.length > 0
    );
}

function getIOUReportActionWithBadge(
    chatReport: OnyxEntry<OnyxTypes.Report>,
    policy: OnyxEntry<OnyxTypes.Policy>,
    reportMetadata: OnyxEntry<OnyxTypes.ReportMetadata>,
    invoiceReceiverPolicy: OnyxEntry<OnyxTypes.Policy>,
): {reportAction: OnyxEntry<ReportAction>; actionBadge?: ValueOf<typeof CONST.REPORT.ACTION_BADGE>} {
    const chatReportActions = allReportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport?.reportID}`] ?? {};

    let actionBadge: ValueOf<typeof CONST.REPORT.ACTION_BADGE> | undefined;
    const reportAction = Object.values(chatReportActions).find((action) => {
        if (!action || action.actionName !== CONST.REPORT.ACTIONS.TYPE.REPORT_PREVIEW || isDeletedAction(action)) {
            return false;
        }
        const iouReport = getReportOrDraftReport(action.childReportID);
        // Only show to the actual payer, exclude admins with bank account access
        if (canIOUBePaid(iouReport, chatReport, policy, undefined, undefined, undefined, undefined, invoiceReceiverPolicy)) {
            actionBadge = CONST.REPORT.ACTION_BADGE.PAY;
            return true;
        }
        if (canApproveIOU(iouReport, policy, reportMetadata)) {
            actionBadge = CONST.REPORT.ACTION_BADGE.APPROVE;
            return true;
        }
        const isWaitingSubmitFromCurrentUser = canSubmitAndIsAwaitingForCurrentUser(
            iouReport,
            chatReport,
            policy,
            getReportTransactions(iouReport?.reportID),
            allTransactionViolations,
            deprecatedCurrentUserEmail,
            deprecatedUserAccountID,
            getAllReportActions(iouReport?.reportID),
        );
        if (isWaitingSubmitFromCurrentUser) {
            actionBadge = CONST.REPORT.ACTION_BADGE.SUBMIT;
            return true;
        }
        return false;
    });

    return {reportAction, actionBadge};
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

function approveMoneyRequest(params: ApproveMoneyRequestFunctionParams) {
    const {
        expenseReport,
        policy,
        currentUserAccountIDParam,
        currentUserEmailParam,
        hasViolations,
        isASAPSubmitBetaEnabled,
        expenseReportCurrentNextStepDeprecated,
        betas,
        userBillingGracePeriodEnds,
        amountOwed,
        full,
        onApproved,
        ownerBillingGracePeriodEnd,
    } = params;
    if (!expenseReport) {
        return;
    }

    if (expenseReport.policyID && shouldRestrictUserBillableActions(expenseReport.policyID, ownerBillingGracePeriodEnd, userBillingGracePeriodEnds, amountOwed)) {
        Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(expenseReport.policyID));
        return;
    }

    let total = expenseReport.total ?? 0;
    const hasHeldExpenses = hasHeldExpensesReportUtils(expenseReport.reportID);
    const hasDuplicates = hasDuplicateTransactions(currentUserEmailParam, currentUserAccountIDParam, expenseReport, policy, allTransactionViolations);
    if (hasHeldExpenses && !full && !!expenseReport.unheldTotal) {
        total = expenseReport.unheldTotal;
    }
    const optimisticApprovedReportAction = buildOptimisticApprovedReportAction(total, expenseReport.currency ?? '', expenseReport.reportID, currentUserAccountIDParam);

    const isDEWPolicy = hasDynamicExternalWorkflow(policy);
    const shouldAddOptimisticApproveAction = !isDEWPolicy || isOffline();

    const nextApproverAccountID = getNextApproverAccountID(expenseReport);
    const predictedNextStatus = !nextApproverAccountID ? CONST.REPORT.STATUS_NUM.APPROVED : CONST.REPORT.STATUS_NUM.SUBMITTED;
    const predictedNextState = !nextApproverAccountID ? CONST.REPORT.STATE_NUM.APPROVED : CONST.REPORT.STATE_NUM.SUBMITTED;
    const managerID = !nextApproverAccountID ? expenseReport.managerID : nextApproverAccountID;

    // buildOptimisticNextStep is used in parallel
    const optimisticNextStepDeprecated = isDEWPolicy
        ? null
        : // eslint-disable-next-line @typescript-eslint/no-deprecated
          buildNextStepNew({
              report: expenseReport,
              policy,
              currentUserAccountIDParam,
              currentUserEmailParam,
              hasViolations,
              isASAPSubmitBetaEnabled,
              predictedNextStatus,
          });
    const optimisticNextStep = isDEWPolicy
        ? null
        : buildOptimisticNextStep({
              report: expenseReport,
              policy,
              currentUserAccountIDParam,
              currentUserEmailParam,
              hasViolations,
              isASAPSubmitBetaEnabled,
              predictedNextStatus,
          });
    const chatReport = getReportOrDraftReport(expenseReport.chatReportID);

    const optimisticData: Array<
        OnyxUpdate<
            | typeof ONYXKEYS.COLLECTION.REPORT
            | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS
            | typeof ONYXKEYS.COLLECTION.TRANSACTION
            | typeof ONYXKEYS.COLLECTION.NEXT_STEP
            | typeof ONYXKEYS.COLLECTION.REPORT_METADATA
            | typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS
        >
    > = [];

    if (shouldAddOptimisticApproveAction) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.reportID}`,
            value: {
                [optimisticApprovedReportAction.reportActionID]: {
                    ...(optimisticApprovedReportAction as OnyxTypes.ReportAction),
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                },
            },
        });
    }

    const updatedExpenseReport = {
        ...expenseReport,
        ...(shouldAddOptimisticApproveAction
            ? {
                  lastMessageText: getReportActionText(optimisticApprovedReportAction),
                  lastMessageHtml: getReportActionHtml(optimisticApprovedReportAction),
              }
            : {}),
        // For DEW policies, don't optimistically update stateNum, statusNum, managerID, or nextStep
        // because DEW determines the actual workflow on the backend
        ...(isDEWPolicy
            ? {}
            : {
                  stateNum: predictedNextState,
                  statusNum: predictedNextStatus,
                  managerID,
                  nextStep: optimisticNextStep ?? undefined,
                  pendingFields: {
                      partial: full ? null : CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                      nextStep: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                  },
              }),
    };
    optimisticData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`,
        value: updatedExpenseReport,
    });

    if (chatReport) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${expenseReport.chatReportID}`,
            value: {
                hasOutstandingChildRequest: hasOutstandingChildRequest(
                    chatReport,
                    updatedExpenseReport,
                    currentUserEmailParam,
                    currentUserAccountIDParam,
                    allTransactionViolations,
                    undefined,
                ),
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

    if (isDEWPolicy) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${expenseReport.reportID}`,
            value: {
                pendingExpenseAction: CONST.EXPENSE_PENDING_ACTION.APPROVE,
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
                    partial: null,
                    nextStep: null,
                },
            },
        });
    }

    if (shouldAddOptimisticApproveAction) {
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.reportID}`,
            value: {
                [optimisticApprovedReportAction.reportActionID]: {
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
        OnyxUpdate<
            | typeof ONYXKEYS.COLLECTION.REPORT
            | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS
            | typeof ONYXKEYS.COLLECTION.NEXT_STEP
            | typeof ONYXKEYS.COLLECTION.REPORT_METADATA
            | typeof ONYXKEYS.COLLECTION.TRANSACTION
            | typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS
        >
    > = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${expenseReport.chatReportID}`,
            value: {
                hasOutstandingChildRequest: chatReport?.hasOutstandingChildRequest,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.NEXT_STEP}${expenseReport.reportID}`,
            value: expenseReportCurrentNextStepDeprecated ?? null,
        },
    ];

    if (!isDEWPolicy) {
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${expenseReport.reportID}`,
            value: {
                statusNum: expenseReport.statusNum,
                stateNum: expenseReport.stateNum,
                nextStep: expenseReport.nextStep ?? null,
                pendingFields: {
                    partial: null,
                    nextStep: null,
                },
            },
        });
    }

    if (shouldAddOptimisticApproveAction) {
        if (isDEWPolicy) {
            failureData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.reportID}`,
                value: {
                    [optimisticApprovedReportAction.reportActionID]: null,
                },
            });
        } else {
            failureData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${expenseReport.reportID}`,
                value: {
                    [optimisticApprovedReportAction.reportActionID]: {
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
            betas,
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

    onApproved?.();
    playSound(SOUNDS.SUCCESS);
    API.write(WRITE_COMMANDS.APPROVE_MONEY_REQUEST, parameters, {optimisticData, successData, failureData});
    return optimisticHoldReportID;
}

function determineIouReportID(chatReport: OnyxEntry<OnyxTypes.Report>, expenseReport: OnyxEntry<OnyxTypes.Report>): string | undefined {
    const iouReportActions = getAllReportActions(chatReport?.iouReportID);
    const expenseReportActions = getAllReportActions(expenseReport?.reportID);
    const iouCreatedAction = Object.values(iouReportActions).find((action) => isCreatedAction(action));
    const expenseCreatedAction = Object.values(expenseReportActions).find((action) => isCreatedAction(action));

    // The report created later will become the iouReportID of the chat report
    return (iouCreatedAction?.created ?? '') > (expenseCreatedAction?.created ?? '') ? chatReport?.iouReportID : expenseReport?.reportID;
}

function reopenReport(
    expenseReport: OnyxEntry<OnyxTypes.Report>,
    policy: OnyxEntry<OnyxTypes.Policy>,
    currentUserAccountIDParam: number,
    currentUserEmailParam: string,
    hasViolations: boolean,
    isASAPSubmitBetaEnabled: boolean,
    expenseReportCurrentNextStepDeprecated: OnyxEntry<OnyxTypes.ReportNextStepDeprecated>,
    chatReport: OnyxEntry<OnyxTypes.Report>,
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

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.NEXT_STEP>> = [
        optimisticIOUReportData,
        optimisticReportActionsData,
        optimisticNextStepData,
    ];

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

    if (chatReport) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`,
            value: {
                // The report created later will become the iouReportID of the chat report
                iouReportID: determineIouReportID(chatReport, expenseReport),
            },
        });
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`,
            value: {
                iouReportID: chatReport.iouReportID,
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
    delegateEmail: string | undefined,
) {
    if (!expenseReport) {
        return;
    }

    const optimisticRetractReportAction = buildOptimisticRetractedReportAction(delegateEmail);
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

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.NEXT_STEP>> = [
        optimisticIOUReportData,
        optimisticReportActionsData,
        optimisticNextStepData,
    ];

    if (chatReport) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`,
            value: {
                // The report created later will become the iouReportID of the chat report
                iouReportID: determineIouReportID(chatReport, expenseReport),
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
                stateNum: expenseReport.stateNum,
                statusNum: expenseReport.statusNum,
                hasReportBeenRetracted: false,
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
    delegateEmail: string | undefined,
) {
    if (isEmptyObject(expenseReport)) {
        return;
    }

    const optimisticUnapprovedReportAction = buildOptimisticUnapprovedReportAction(expenseReport.total ?? 0, expenseReport.currency ?? '', expenseReport.reportID, delegateEmail);

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

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.NEXT_STEP>> = [
        optimisticIOUReportData,
        optimisticReportActionData,
        optimisticNextStepData,
    ];

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

function submitReport({
    expenseReport,
    policy,
    currentUserAccountIDParam,
    currentUserEmailParam,
    hasViolations,
    isASAPSubmitBetaEnabled,
    expenseReportCurrentNextStepDeprecated,
    userBillingGracePeriodEnds,
    amountOwed,
    onSubmitted,
    ownerBillingGracePeriodEnd,
    delegateEmail,
}: SubmitReportFunctionParams) {
    if (!expenseReport) {
        return;
    }
    if (expenseReport.policyID && shouldRestrictUserBillableActions(expenseReport.policyID, ownerBillingGracePeriodEnd, userBillingGracePeriodEnds, amountOwed)) {
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
        delegateEmail,
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

    const optimisticData: Array<
        OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.NEXT_STEP | typeof ONYXKEYS.COLLECTION.REPORT_METADATA>
    > = [];

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

    onSubmitted?.();
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
        currentUserAccountIDParam,
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

    notifyNewAction(expenseReport.reportID, undefined, true);
}

/**
 * Completes onboarding for invite link flow based on the selected payment option
 *
 * @param paymentSelected based on which we choose the onboarding choice and concierge message
 */
function completePaymentOnboarding(
    paymentSelected: ValueOf<typeof CONST.PAYMENT_SELECTED>,
    introSelected: OnyxEntry<OnyxTypes.IntroSelected>,
    isSelfTourViewed: boolean | undefined,
    betas: OnyxEntry<OnyxTypes.Beta[]>,
    adminsChatReportID?: string,
    onboardingPolicyID?: string,
) {
    const isInviteOnboardingComplete = introSelected?.isInviteOnboardingComplete ?? false;

    if (isInviteOnboardingComplete || !introSelected?.choice || !introSelected?.inviteType) {
        return;
    }

    const personalDetailsListValues = Object.values(getPersonalDetailsForAccountIDs(deprecatedUserAccountID ? [deprecatedUserAccountID] : [], personalDetailsList));
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
        companySize: introSelected?.companySize as OnboardingCompanySize,
        introSelected,
        isSelfTourViewed,
        betas,
    });
}

function payMoneyRequest(params: PayMoneyRequestFunctionParams) {
    const {
        paymentType,
        chatReport,
        iouReport,
        introSelected,
        iouReportCurrentNextStepDeprecated,
        currentUserAccountID,
        paymentPolicyID,
        userBillingGracePeriodEnds,
        full = true,
        activePolicy,
        policy,
        betas,
        isSelfTourViewed,
        amountOwed,
        ownerBillingGracePeriodEnd,
        methodID,
        onPaid,
    } = params;
    if (chatReport.policyID && shouldRestrictUserBillableActions(chatReport.policyID, ownerBillingGracePeriodEnd, userBillingGracePeriodEnds, amountOwed)) {
        Navigation.navigate(ROUTES.RESTRICTED_ACTION.getRoute(chatReport.policyID));
        return;
    }

    const paymentSelected = paymentType === CONST.IOU.PAYMENT_TYPE.VBBA ? CONST.IOU.PAYMENT_SELECTED.BBA : CONST.IOU.PAYMENT_SELECTED.PBA;
    completePaymentOnboarding(paymentSelected, introSelected, isSelfTourViewed, betas);

    const recipient = {accountID: iouReport?.ownerAccountID ?? CONST.DEFAULT_NUMBER_ID};
    const {params: payMoneyRequestParams, onyxData} = getPayMoneyRequestParams({
        initialChatReport: chatReport,
        iouReport,
        recipient,
        paymentMethodType: paymentType,
        full,
        paymentPolicyID,
        activePolicy,
        reportPolicy: policy,
        iouReportCurrentNextStepDeprecated,
        currentUserAccountIDParam: currentUserAccountID,
        betas,
        isSelfTourViewed,
        bankAccountID: paymentType === CONST.IOU.PAYMENT_TYPE.VBBA ? methodID : undefined,
    });

    // For now, we need to call the PayMoneyRequestWithWallet API since PayMoneyRequest was not updated to work with
    // Expensify Wallets.
    const apiCommand = paymentType === CONST.IOU.PAYMENT_TYPE.EXPENSIFY ? WRITE_COMMANDS.PAY_MONEY_REQUEST_WITH_WALLET : WRITE_COMMANDS.PAY_MONEY_REQUEST;

    onPaid?.();
    playSound(SOUNDS.SUCCESS);
    API.write(apiCommand, payMoneyRequestParams, onyxData);
    notifyNewAction(!full ? (Navigation.getTopmostReportId() ?? iouReport?.reportID) : iouReport?.reportID, undefined, true);
    return payMoneyRequestParams.optimisticHoldReportID;
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
    betas,
    isSelfTourViewed,
}: PayInvoiceArgs) {
    const recipient = {accountID: invoiceReport?.ownerAccountID ?? CONST.DEFAULT_NUMBER_ID};
    const {
        onyxData,
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
        betas,
        isSelfTourViewed,
    });

    const paymentSelected = paymentMethodType === CONST.IOU.PAYMENT_TYPE.VBBA ? CONST.IOU.PAYMENT_SELECTED.BBA : CONST.IOU.PAYMENT_SELECTED.PBA;
    completePaymentOnboarding(paymentSelected, introSelected, isSelfTourViewed, betas);

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
    API.write(WRITE_COMMANDS.PAY_INVOICE, params, onyxData);
}

function detachReceipt(
    transactionID: string | undefined,
    transactionPolicy: OnyxEntry<OnyxTypes.Policy>,
    transactionPolicyTagList: OnyxEntry<OnyxTypes.PolicyTagLists>,
    transactionPolicyCategories?: OnyxEntry<OnyxTypes.PolicyCategories>,
) {
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

    const optimisticData: Array<
        OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS>
    > = [
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
        const currentTransactionViolations = allTransactionViolations[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`] ?? [];
        const violationsOnyxData = ViolationsUtils.getViolationsOnyxData(
            newTransaction,
            currentTransactionViolations,
            transactionPolicy,
            transactionPolicyTagList ?? {},
            transactionPolicyCategories ?? {},
            hasDependentTags(transactionPolicy, transactionPolicyTagList ?? {}),
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

    API.write(
        WRITE_COMMANDS.DETACH_RECEIPT,
        parameters,
        {optimisticData, successData, failureData},
        {
            checkAndFixConflictingRequest: (persistedRequests) => resolveDetachReceiptConflicts(persistedRequests, parameters),
        },
    );
}

function replaceReceipt({transactionID, file, source, state, transactionPolicy, transactionPolicyCategories, isSameReceipt}: ReplaceReceipt) {
    if (!file) {
        return;
    }

    const transaction = allTransactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
    const expenseReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${transaction?.reportID}`] ?? null;
    const oldReceipt = transaction?.receipt ?? {};
    const receiptOptimistic = {
        source,
        localSource: null,
        state: state ?? CONST.IOU.RECEIPT_STATE.OPEN,
        filename: file.name,
    };
    const newTransaction = transaction && {...transaction, receipt: receiptOptimistic};
    const retryParams: ReplaceReceipt = {transactionID, file: undefined, source, transactionPolicy, transactionPolicyCategories};
    const currentSearchQueryJSON = getCurrentSearchQueryJSON();

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.TRANSACTION | typeof ONYXKEYS.COLLECTION.SNAPSHOT | typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS>> = [
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
        // TODO: Replace getPolicyTagsData (https://github.com/Expensify/App/issues/72721) and getPolicyRecentlyUsedTagsData (https://github.com/Expensify/App/issues/71491) with useOnyx hook
        // eslint-disable-next-line @typescript-eslint/no-deprecated
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
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.SNAPSHOT}${currentSearchQueryJSON.hash}`,
            // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
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
        receiptState: state,
        isSameReceipt,
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
    const isPolicyExpenseChat = isPolicyExpenseChatReportUtil(chatReport);
    let participants: Participant[] = [];

    if (isPolicyExpenseChat || shouldAddAsReport) {
        participants = [{accountID: 0, reportID: chatReport?.reportID, isPolicyExpenseChat, selected: true, policyID: isPolicyExpenseChat ? chatReport?.policyID : undefined}];
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

function setMoneyRequestTaxRate(transactionID: string, taxCode: string | null, isDraft = true) {
    Onyx.merge(`${isDraft ? ONYXKEYS.COLLECTION.TRANSACTION_DRAFT : ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {taxCode});
}

function setMoneyRequestTaxValue(transactionID: string, taxValue: string | null, isDraft = true) {
    Onyx.merge(`${isDraft ? ONYXKEYS.COLLECTION.TRANSACTION_DRAFT : ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {taxValue});
}

function setMoneyRequestTaxAmount(transactionID: string, taxAmount: number | null, isDraft = true) {
    Onyx.merge(`${isDraft ? ONYXKEYS.COLLECTION.TRANSACTION_DRAFT : ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {taxAmount});
}

type TaxRateValues = {
    taxCode: string | null;
    taxAmount: number | null;
    taxValue: string | null;
};

function setMoneyRequestTaxRateValues(transactionID: string, taxRateValues: TaxRateValues, isDraft = true) {
    Onyx.merge(`${isDraft ? ONYXKEYS.COLLECTION.TRANSACTION_DRAFT : ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {...taxRateValues});
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

    const suggestedSearches = getSuggestedSearches(deprecatedUserAccountID);
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
            const snapshotData = {
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
            };

            const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.SNAPSHOT>> = [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.SNAPSHOT}${currentSearchQueryJSON.hash}` as const,
                    value: {
                        // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
                        data: snapshotData,
                    },
                },
            ];

            if (currentSearchQueryJSON.groupBy === CONST.SEARCH.GROUP_BY.FROM) {
                const newFlatFilters = currentSearchQueryJSON.flatFilters.filter((filter) => filter.key !== CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM);
                newFlatFilters.push({
                    key: CONST.SEARCH.SYNTAX_FILTER_KEYS.FROM,
                    filters: [{operator: CONST.SEARCH.SYNTAX_OPERATORS.EQUAL_TO, value: fromAccountID}],
                });

                const groupTransactionsQueryJSON = buildSearchQueryJSON(
                    buildSearchQueryString({
                        ...currentSearchQueryJSON,
                        groupBy: undefined,
                        flatFilters: newFlatFilters,
                    }),
                );

                if (groupTransactionsQueryJSON?.hash) {
                    optimisticData.push({
                        onyxMethod: Onyx.METHOD.MERGE,
                        key: `${ONYXKEYS.COLLECTION.SNAPSHOT}${groupTransactionsQueryJSON.hash}` as const,
                        value: {
                            search: {
                                type: groupTransactionsQueryJSON.type,
                                status: groupTransactionsQueryJSON.status,
                                offset: 0,
                                hasMoreResults: false,
                                hasResults: true,
                                isLoading: false,
                            },
                            // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
                            data: snapshotData,
                        },
                    });
                }
            }

            return {
                optimisticData,
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
    currentUserAccountIDParam: number,
    betas: OnyxEntry<OnyxTypes.Beta[]>,
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
    const parsedComment = getParsedComment(comment);
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

            const [, , iouAction] = buildOptimisticMoneyRequestEntities({
                iouReport: movedToReport,
                type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                amount: transactionAmount,
                currency: getCurrency(transaction),
                comment: parsedComment,
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

            const newExpenseReport = buildOptimisticExpenseReport({
                chatReportID: report.chatReportID,
                policyID: report?.policyID,
                payeeAccountID: report?.ownerAccountID ?? CONST.DEFAULT_NUMBER_ID,
                total: transactionAmount,
                currency: getCurrency(transaction),
                nonReimbursableTotal: transactionAmount,
                optimisticIOUReportID: rejectedToReportID,
                reportTransactions,
                betas,
            });
            const [, createdActionForExpenseReport, iouAction] = buildOptimisticMoneyRequestEntities({
                iouReport: newExpenseReport,
                type: CONST.IOU.REPORT_ACTION_TYPE.CREATE,
                amount: transactionAmount,
                currency: getCurrency(transaction),
                comment: parsedComment,
                payeeEmail: deprecatedCurrentUserEmail,
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
        const shouldHaveOutstandingChildRequest = hasOutstandingChildRequest(
            policyExpenseChat,
            excludedReportID,
            deprecatedCurrentUserEmail,
            currentUserAccountIDParam,
            allTransactionViolations,
            undefined,
        );

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
                rejectedBy: deprecatedCurrentUserEmail,
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
        comment: parsedComment,
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

function rejectMoneyRequest(
    transactionID: string,
    reportID: string,
    comment: string,
    policy: OnyxEntry<OnyxTypes.Policy>,
    currentUserAccountIDParam: number,
    betas: OnyxEntry<OnyxTypes.Beta[]>,
    options?: {sharedRejectedToReportID?: string},
): Route | undefined {
    const data = prepareRejectMoneyRequestData(transactionID, reportID, comment, policy, currentUserAccountIDParam, betas, options);
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
    notifyNewAction(currentReportID, undefined, true);
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

function removeUnchangedBulkEditFields(
    transactionChanges: TransactionChanges,
    transaction: OnyxTypes.Transaction,
    baseIOUReport: OnyxEntry<OnyxTypes.Report> | null,
    policy: OnyxEntry<OnyxTypes.Policy>,
): TransactionChanges {
    const iouType = isInvoiceReportReportUtils(baseIOUReport ?? undefined) ? CONST.IOU.TYPE.INVOICE : CONST.IOU.TYPE.SUBMIT;
    const allowNegative = shouldEnableNegative(baseIOUReport ?? undefined, policy, iouType);
    const currentDetails = getTransactionDetails(transaction, undefined, policy, allowNegative);
    if (!currentDetails) {
        return transactionChanges;
    }

    const changeKeys = Object.keys(transactionChanges) as Array<keyof TransactionChanges>;
    if (changeKeys.length === 0) {
        return transactionChanges;
    }

    let filteredChanges: TransactionChanges = {};

    for (const field of changeKeys) {
        const nextValue = transactionChanges[field];
        const currentValue = currentDetails[field as keyof TransactionDetails];

        if (nextValue !== currentValue) {
            filteredChanges = {
                ...filteredChanges,
                [field]: nextValue,
            };
        }
    }

    return filteredChanges;
}

type UpdateMultipleMoneyRequestsParams = {
    transactionIDs: string[];
    changes: TransactionChanges;
    policy: OnyxEntry<OnyxTypes.Policy>;
    reports: OnyxCollection<OnyxTypes.Report>;
    transactions: OnyxCollection<OnyxTypes.Transaction>;
    reportActions: OnyxCollection<OnyxTypes.ReportActions>;
    policyCategories: OnyxCollection<OnyxTypes.PolicyCategories>;
    policyTags: OnyxCollection<OnyxTypes.PolicyTagLists>;
    hash?: number;
    allPolicies?: OnyxCollection<OnyxTypes.Policy>;
    introSelected: OnyxEntry<OnyxTypes.IntroSelected>;
    betas: OnyxEntry<OnyxTypes.Beta[]>;
};

function updateMultipleMoneyRequests({
    transactionIDs,
    changes,
    policy,
    reports,
    transactions,
    reportActions,
    policyCategories,
    policyTags,
    hash,
    allPolicies,
    introSelected,
    betas,
}: UpdateMultipleMoneyRequestsParams) {
    // Track running totals per report so multiple edits in the same report compound correctly.
    const optimisticReportsByID: Record<string, OnyxTypes.Report> = {};
    for (const transactionID of transactionIDs) {
        const transaction = transactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
        if (!transaction) {
            continue;
        }

        const iouReport = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${transaction.reportID}`] ?? undefined;
        const baseIouReport = iouReport?.reportID ? (optimisticReportsByID[iouReport.reportID] ?? iouReport) : iouReport;
        const isFromExpenseReport = isExpenseReport(baseIouReport);

        const transactionReportActions = reportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transaction.reportID}`] ?? {};
        let reportAction = getIOUActionForTransactionID(Object.values(transactionReportActions), transactionID);

        // Track expenses created via self DM are stored with reportID = UNREPORTED_REPORT_ID ('0')
        // because they have never been submitted to a report. As a result, the lookup above returns
        // nothing — the IOU action is stored under the self DM report (chat with yourself, unique
        // per user) rather than under transaction.reportID. Without this fallback we cannot resolve
        // the transaction thread, which means no optimistic MODIFIED_EXPENSE comment would be
        // generated during bulk edit for these expenses.
        if (!reportAction && (!transaction.reportID || transaction.reportID === CONST.REPORT.UNREPORTED_REPORT_ID)) {
            const selfDMReportID = findSelfDMReportID(reports);
            if (selfDMReportID) {
                const selfDMReportActions = reportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${selfDMReportID}`] ?? {};
                reportAction = getIOUActionForTransactionID(Object.values(selfDMReportActions), transactionID);
            }
        }

        let transactionThreadReportID = transaction.transactionThreadReportID ?? reportAction?.childReportID;
        let transactionThread = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`] ?? null;

        // Offline-created expenses can be missing a transaction thread until it's opened once.
        // Ensure the thread exists before adding optimistic MODIFIED_EXPENSE actions so
        // bulk-edit comments are visible immediately while still offline.
        let didCreateThreadInThisIteration = false;
        if (!transactionThreadReportID && iouReport?.reportID) {
            const optimisticTransactionThread = createTransactionThreadReport(
                introSelected,
                deprecatedCurrentUserEmail,
                deprecatedUserAccountID,
                betas,
                iouReport,
                reportAction,
                transaction,
            );
            if (optimisticTransactionThread?.reportID) {
                transactionThreadReportID = optimisticTransactionThread.reportID;
                transactionThread = optimisticTransactionThread;
                didCreateThreadInThisIteration = true;
            }
        }

        const isUnreportedExpense = !transaction.reportID || transaction.reportID === CONST.REPORT.UNREPORTED_REPORT_ID;
        // Category, tag, tax, and billable only apply to expense/invoice reports and unreported (track) expenses.
        // For plain IOU transactions these fields are not applicable and must be silently skipped.
        const supportsExpenseFields = isUnreportedExpense || isFromExpenseReport || isInvoiceReportReportUtils(baseIouReport ?? undefined);
        // Use the transaction's own policy for all per-transaction checks (permissions, tax, change-diffing).
        // Falls back to the shared bulk-edit policy when the transaction's workspace cannot be resolved.
        const transactionPolicy = (iouReport?.policyID ? allPolicies?.[`${ONYXKEYS.COLLECTION.POLICY}${iouReport.policyID}`] : undefined) ?? policy;
        const canEditField = (field: ValueOf<typeof CONST.EDIT_REQUEST_FIELD>) => {
            // Unreported (track) expenses have no report, so there is no reportAction to validate against.
            // They are never approved or settled, so all bulk-editable fields are allowed.
            if (isUnreportedExpense) {
                return true;
            }

            return canEditFieldOfMoneyRequest({reportAction, fieldToEdit: field, transaction, report: iouReport, policy: transactionPolicy});
        };

        let transactionChanges: TransactionChanges = {};

        if (changes.merchant && canEditField(CONST.EDIT_REQUEST_FIELD.MERCHANT)) {
            transactionChanges.merchant = changes.merchant;
        }
        if (changes.created && canEditField(CONST.EDIT_REQUEST_FIELD.DATE)) {
            transactionChanges.created = changes.created;
        }
        if (changes.amount !== undefined && canEditField(CONST.EDIT_REQUEST_FIELD.AMOUNT)) {
            transactionChanges.amount = changes.amount;
        }
        if (changes.currency && canEditField(CONST.EDIT_REQUEST_FIELD.CURRENCY)) {
            transactionChanges.currency = changes.currency;
        }
        if (changes.category !== undefined && supportsExpenseFields && canEditField(CONST.EDIT_REQUEST_FIELD.CATEGORY)) {
            transactionChanges.category = changes.category;
        }
        if (changes.tag && supportsExpenseFields && canEditField(CONST.EDIT_REQUEST_FIELD.TAG)) {
            transactionChanges.tag = changes.tag;
        }
        if (changes.comment && canEditField(CONST.EDIT_REQUEST_FIELD.DESCRIPTION)) {
            transactionChanges.comment = getParsedComment(changes.comment);
        }
        if (changes.taxCode && supportsExpenseFields && canEditField(CONST.EDIT_REQUEST_FIELD.TAX_RATE)) {
            transactionChanges.taxCode = changes.taxCode;
            const taxValue = getTaxValue(transactionPolicy, transaction, changes.taxCode);
            const decimals = getCurrencyDecimals(getCurrency(transaction));
            const effectiveAmount = transactionChanges.amount !== undefined ? Math.abs(transactionChanges.amount) : Math.abs(getAmount(transaction));
            const taxAmount = calculateTaxAmount(taxValue, effectiveAmount, decimals);
            transactionChanges.taxAmount = convertToBackendAmount(taxAmount);
        }

        if (changes.billable !== undefined && supportsExpenseFields && canEditField(CONST.EDIT_REQUEST_FIELD.BILLABLE)) {
            transactionChanges.billable = changes.billable;
        }
        if (changes.reimbursable !== undefined && canEditField(CONST.EDIT_REQUEST_FIELD.REIMBURSABLE)) {
            transactionChanges.reimbursable = changes.reimbursable;
        }

        transactionChanges = removeUnchangedBulkEditFields(transactionChanges, transaction, baseIouReport, transactionPolicy);

        const updates: Record<string, string | number | boolean> = {};
        if (transactionChanges.merchant) {
            updates.merchant = transactionChanges.merchant;
        }
        if (transactionChanges.created) {
            updates.created = transactionChanges.created;
        }
        if (transactionChanges.currency) {
            updates.currency = transactionChanges.currency;
        }
        if (transactionChanges.category !== undefined) {
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
        if (transactionChanges.taxAmount !== undefined) {
            updates.taxAmount = transactionChanges.taxAmount;
        }
        if (transactionChanges.amount !== undefined) {
            updates.amount = transactionChanges.amount;
        }
        if (transactionChanges.billable !== undefined) {
            updates.billable = transactionChanges.billable;
        }
        if (transactionChanges.reimbursable !== undefined) {
            updates.reimbursable = transactionChanges.reimbursable;
        }

        // Skip if no updates
        if (Object.keys(updates).length === 0) {
            continue;
        }

        // Generate optimistic report action ID
        const modifiedExpenseReportActionID = NumberUtils.rand64();

        const optimisticData: Array<
            OnyxUpdate<
                typeof ONYXKEYS.COLLECTION.TRANSACTION | typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS | typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS
            >
        > = [];
        const successData: Array<
            OnyxUpdate<
                typeof ONYXKEYS.COLLECTION.TRANSACTION | typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS | typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS
            >
        > = [];
        const failureData: Array<
            OnyxUpdate<
                typeof ONYXKEYS.COLLECTION.TRANSACTION | typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS | typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS
            >
        > = [];
        const snapshotOptimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.SNAPSHOT>> = [];
        const snapshotFailureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.SNAPSHOT>> = [];

        // Pending fields for the transaction
        const pendingFields: OnyxTypes.Transaction['pendingFields'] = Object.fromEntries(Object.keys(transactionChanges).map((field) => [field, CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE]));
        const clearedPendingFields = getClearedPendingFields(transactionChanges);

        const errorFields = Object.fromEntries(Object.keys(pendingFields).map((field) => [field, getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericEditFailureMessage')]));

        // Build updated transaction
        const updatedTransaction = getUpdatedTransaction({
            transaction,
            transactionChanges,
            isFromExpenseReport,
            policy: transactionPolicy,
        });
        const isTransactionOnHold = isOnHold(transaction);

        // Optimistically update violations so they disappear immediately when the edited field resolves them.
        // Skip for unreported expenses: they have no iouReport context so isSelfDM() returns false,
        // which would incorrectly trigger policy-required violations (e.g. missingCategory).
        let optimisticViolationsData: ReturnType<typeof ViolationsUtils.getViolationsOnyxData> | undefined;
        let currentTransactionViolations: OnyxTypes.TransactionViolation[] | undefined;
        if (transactionPolicy && !isUnreportedExpense) {
            currentTransactionViolations = allTransactionViolations[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`] ?? [];
            let optimisticViolations =
                transactionChanges.amount !== undefined || transactionChanges.created || transactionChanges.currency
                    ? currentTransactionViolations.filter((violation) => violation.name !== CONST.VIOLATIONS.DUPLICATED_TRANSACTION)
                    : currentTransactionViolations;
            optimisticViolations =
                transactionChanges.category !== undefined && transactionChanges.category === ''
                    ? optimisticViolations.filter((violation) => violation.name !== CONST.VIOLATIONS.CATEGORY_OUT_OF_POLICY)
                    : optimisticViolations;
            const transactionPolicyTagList = policyTags?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${transactionPolicy?.id}`] ?? {};
            const transactionPolicyCategories = policyCategories?.[`${ONYXKEYS.COLLECTION.POLICY_CATEGORIES}${transactionPolicy?.id}`] ?? {};
            optimisticViolationsData = ViolationsUtils.getViolationsOnyxData(
                updatedTransaction,
                optimisticViolations,
                transactionPolicy,
                transactionPolicyTagList,
                transactionPolicyCategories,
                hasDependentTags(transactionPolicy, transactionPolicyTagList),
                isInvoiceReportReportUtils(iouReport),
                isSelfDM(iouReport),
                iouReport,
                isFromExpenseReport,
            );
            optimisticData.push(optimisticViolationsData);
            failureData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`,
                value: currentTransactionViolations,
            });
        }

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

        // Optimistically update the search snapshot so the search list reflects the
        // new values immediately (the snapshot is the exclusive data source for search
        // result rendering and is not automatically updated by the TRANSACTION write above).
        if (hash) {
            snapshotOptimisticData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}` as const,
                value: {
                    // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
                    data: {
                        [`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`]: updatedTransaction,
                        ...(optimisticViolationsData && {[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`]: optimisticViolationsData.value}),
                    },
                },
            });
            snapshotFailureData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.SNAPSHOT}${hash}` as const,
                value: {
                    // @ts-expect-error - will be solved in https://github.com/Expensify/App/issues/73830
                    data: {
                        [`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`]: transaction,
                        ...(currentTransactionViolations && {[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`]: currentTransactionViolations}),
                    },
                },
            });
        }

        // To build proper offline update message, we need to include the currency
        const optimisticTransactionChanges =
            transactionChanges?.amount !== undefined && !transactionChanges?.currency ? {...transactionChanges, currency: getCurrency(transaction)} : transactionChanges;

        // Build optimistic modified expense report action
        const optimisticReportAction = buildOptimisticModifiedExpenseReportAction(
            transactionThread,
            transaction,
            optimisticTransactionChanges,
            isFromExpenseReport,
            transactionPolicy,
            updatedTransaction,
        );

        const {updatedMoneyRequestReport, isTotalIndeterminate} = getUpdatedMoneyRequestReportData(
            baseIouReport,
            updatedTransaction,
            transaction,
            isTransactionOnHold,
            transactionPolicy,
            optimisticReportAction?.actorAccountID,
            transactionChanges,
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
        let backfilledCreatedActionID: string | undefined;
        if (transactionThreadReportID) {
            // Backfill a CREATED action for threads never opened locally so
            // MoneyRequestView renders and the skeleton doesn't loop offline.
            // Skip when the thread was just created above (openReport handles it).
            const threadReportActions = reportActions?.[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`] ?? {};
            const hasCreatedAction = didCreateThreadInThisIteration || Object.values(threadReportActions).some((action) => action?.actionName === CONST.REPORT.ACTIONS.TYPE.CREATED);
            const optimisticCreatedValue: Record<string, Partial<OnyxTypes.ReportAction>> = {};
            if (!hasCreatedAction) {
                const optimisticCreatedAction = buildOptimisticCreatedReportAction(CONST.REPORT.OWNER_EMAIL_FAKE);
                optimisticCreatedAction.pendingAction = null;
                backfilledCreatedActionID = optimisticCreatedAction.reportActionID;
                optimisticCreatedValue[optimisticCreatedAction.reportActionID] = optimisticCreatedAction;
            }

            optimisticData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadReportID}`,
                value: {
                    ...optimisticCreatedValue,
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
                    reportID: transactionThreadReportID,
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
                    // Remove the backfilled CREATED action so it doesn't duplicate one from OpenReport
                    ...(backfilledCreatedActionID ? {[backfilledCreatedActionID]: null} : {}),
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
                        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                        errors: getMicroSecondOnyxErrorWithTranslationKey('iou.error.genericEditFailureMessage'),
                    },
                    ...(backfilledCreatedActionID ? {[backfilledCreatedActionID]: null} : {}),
                },
            });
        }

        const params = {
            transactionID,
            reportActionID: modifiedExpenseReportActionID,
            updates: JSON.stringify(updates),
        };

        API.write(WRITE_COMMANDS.UPDATE_MONEY_REQUEST, params, {
            optimisticData: [...optimisticData, ...snapshotOptimisticData] as Array<
                OnyxUpdate<
                    | typeof ONYXKEYS.COLLECTION.TRANSACTION
                    | typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS
                    | typeof ONYXKEYS.COLLECTION.SNAPSHOT
                    | typeof ONYXKEYS.COLLECTION.REPORT
                    | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS
                >
            >,
            successData,
            failureData: [...failureData, ...snapshotFailureData] as Array<
                OnyxUpdate<
                    | typeof ONYXKEYS.COLLECTION.TRANSACTION
                    | typeof ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS
                    | typeof ONYXKEYS.COLLECTION.SNAPSHOT
                    | typeof ONYXKEYS.COLLECTION.REPORT
                    | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS
                >
            >,
        });
    }
}

/**
 * Initializes the bulk-edit draft transaction under one fixed placeholder ID.
 * We keep a single draft in Onyx to store the shared edits for a multi-select,
 * then apply those edits to each real transaction later. The placeholder ID is
 * just the storage key and never equals any actual transactionID.
 */
function initBulkEditDraftTransaction(selectedTransactionIDs: string[]) {
    Onyx.set(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_BULK_EDIT_TRANSACTION_ID}`, {
        transactionID: CONST.IOU.OPTIMISTIC_BULK_EDIT_TRANSACTION_ID,
        selectedTransactionIDs,
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
function updateBulkEditDraftTransaction(transactionChanges: NullishDeep<OnyxTypes.Transaction>) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${CONST.IOU.OPTIMISTIC_BULK_EDIT_TRANSACTION_ID}`, transactionChanges);
}

function rejectExpenseReport(
    report: OnyxTypes.Report,
    targetAccountID: number,
    comment: string,
    currentUserAccountID: number | undefined,
    currentUserDisplayName: string | undefined,
    currentUserAvatarSource: AvatarSource | undefined,
) {
    const {reportID} = report;
    const isRejectToSubmitter = targetAccountID === report.ownerAccountID;
    const baseTimestamp = DateUtils.getDBTime();
    const optimisticRejectAction = buildOptimisticReportLevelRejectAction(isRejectToSubmitter, currentUserAccountID, currentUserDisplayName, currentUserAvatarSource, baseTimestamp);
    const optimisticCommentAction = buildOptimisticReportLevelRejectCommentAction(
        comment,
        currentUserAccountID,
        currentUserDisplayName,
        currentUserAvatarSource,
        DateUtils.addMillisecondsFromDateTime(baseTimestamp, 1),
    );

    const optimisticStateNum = isRejectToSubmitter ? CONST.REPORT.STATE_NUM.OPEN : CONST.REPORT.STATE_NUM.SUBMITTED;
    const optimisticStatusNum = isRejectToSubmitter ? CONST.REPORT.STATUS_NUM.OPEN : CONST.REPORT.STATUS_NUM.SUBMITTED;

    const optimisticNextStep = isRejectToSubmitter
        ? buildOptimisticNextStep({
              report,
              predictedNextStatus: CONST.REPORT.STATUS_NUM.OPEN,
              isRejectedReport: true,
          })
        : buildOptimisticNextStep({
              report,
              predictedNextStatus: CONST.REPORT.STATUS_NUM.SUBMITTED,
              bypassNextApproverID: targetAccountID,
          });

    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.NEXT_STEP>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                managerID: targetAccountID,
                stateNum: optimisticStateNum,
                statusNum: optimisticStatusNum,
                pendingFields: {
                    partial: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    nextStep: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
                nextStep: optimisticNextStep,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: {
                [optimisticRejectAction.reportActionID]: {
                    ...(optimisticRejectAction as OnyxTypes.ReportAction),
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                },
                [optimisticCommentAction.reportActionID]: {
                    ...(optimisticCommentAction as OnyxTypes.ReportAction),
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                },
            },
        },
    ];

    optimisticData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.NEXT_STEP}${reportID}`,
        value: isRejectToSubmitter
            ? // buildOptimisticNextStep is used in parallel
              // eslint-disable-next-line @typescript-eslint/no-deprecated
              buildNextStepNew({
                  report,
                  predictedNextStatus: CONST.REPORT.STATUS_NUM.OPEN,
                  isRejectedReport: true,
              })
            : // buildOptimisticNextStep is used in parallel
              // eslint-disable-next-line @typescript-eslint/no-deprecated
              buildNextStepNew({
                  report,
                  predictedNextStatus: CONST.REPORT.STATUS_NUM.SUBMITTED,
                  bypassNextApproverID: targetAccountID,
              }),
    });

    if (report.parentReportID && report.parentReportActionID) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.parentReportID}`,
            value: {
                [report.parentReportActionID]: {
                    childStateNum: optimisticStateNum,
                    childStatusNum: optimisticStatusNum,
                },
            },
        });
    }

    const successData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                pendingFields: {
                    partial: null,
                    nextStep: null,
                },
                errorFields: {
                    partial: null,
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: {
                [optimisticRejectAction.reportActionID]: {
                    pendingAction: null,
                },
                [optimisticCommentAction.reportActionID]: {
                    pendingAction: null,
                },
            },
        },
    ];

    const failureData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.REPORT | typeof ONYXKEYS.COLLECTION.REPORT_ACTIONS | typeof ONYXKEYS.COLLECTION.NEXT_STEP>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                managerID: report.managerID,
                stateNum: report.stateNum,
                statusNum: report.statusNum,
                pendingFields: {
                    partial: null,
                    nextStep: null,
                },
                errorFields: {
                    partial: getMicroSecondOnyxErrorWithTranslationKey('iou.rejectReport.couldNotReject'),
                },
                nextStep: report.nextStep ?? null,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: {
                [optimisticCommentAction.reportActionID]: {
                    ...(optimisticCommentAction as OnyxTypes.ReportAction),
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                    errors: getMicroSecondOnyxErrorWithTranslationKey('iou.rejectReport.couldNotReject'),
                },
            },
        },
    ];

    failureData.push({
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.NEXT_STEP}${reportID}`,
        value: null,
    });

    if (report.parentReportID && report.parentReportActionID) {
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.parentReportID}`,
            value: {
                [report.parentReportActionID]: {
                    childStateNum: report.stateNum,
                    childStatusNum: report.statusNum,
                },
            },
        });
    }

    const parameters: RejectExpenseReportParams = {
        reportID,
        targetAccountID,
        comment,
        rejectedActionReportActionID: optimisticRejectAction.reportActionID,
        rejectedCommentReportActionID: optimisticCommentAction.reportActionID,
    };

    API.write(WRITE_COMMANDS.REJECT_EXPENSE_REPORT, parameters, {optimisticData, successData, failureData});
}

export {
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
    detachReceipt,
    getIOURequestPolicyID,
    getReportOriginalCreationTimestamp,
    initMoneyRequest,
    checkIfScanFileCanBeRead,
    dismissModalAndOpenReportInInboxTab,
    navigateToStartStepIfScanFileCannotBeRead,
    completePaymentOnboarding,
    payInvoice,
    payMoneyRequest,
    replaceReceipt,
    resetDraftTransactionsCustomUnit,
    savePreferredPaymentMethod,
    setCustomUnitRateID,
    setGPSTransactionDraftData,
    setCustomUnitID,
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
    setMoneyRequestOdometerImage,
    removeMoneyRequestOdometerImage,
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
    setMoneyRequestTaxValue,
    setMoneyRequestTaxRateValues,
    startMoneyRequest,
    submitReport,
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
    getIOUReportActionWithBadge,
    getNavigationUrlOnMoneyRequestDelete,
    canSubmitReport,
    calculateDiffAmount,
    dismissRejectUseExplanation,
    rejectExpenseReport,
    rejectMoneyRequest,
    prepareRejectMoneyRequestData,
    markRejectViolationAsResolved,
    setMoneyRequestReimbursable,
    reopenReport,
    retractReport,
    startDistanceRequest,
    assignReportToMe,
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
    getAllTransactionDrafts,
    getCurrentUserEmail,
    getUserAccountID,
    getReceiptError,
    getSearchOnyxUpdate,
    getPolicyTags,
    setMoneyRequestTimeRate,
    setMoneyRequestTimeCount,
    getCleanUpTransactionThreadReportOnyxData,
    handleNavigateAfterExpenseCreate,
    highlightTransactionOnSearchRouteIfNeeded,
    buildMinimalTransactionForFormula,
    buildOnyxDataForMoneyRequest,
    createSplitsAndOnyxData,
    getMoneyRequestInformation,
    getOrCreateOptimisticSplitChatReport,
    getTransactionWithPreservedLocalReceiptSource,
};
export type {
    GPSPoint as GpsPoint,
    IOURequestType,
    StartSplitBilActionParams,
    RequestMoneyInformation,
    ReplaceReceipt,
    RequestMoneyParticipantParams,
    UpdateMoneyRequestData,
    UpdateMoneyRequestDataKeys,
    MoneyRequestInformationParams,
    OneOnOneIOUReport,
    RejectMoneyRequestData,
    CreateDistanceRequestInformation,
    BuildOnyxDataForMoneyRequestKeys,
    MoneyRequestInformation,
    BaseTransactionParams,
};
