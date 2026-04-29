/* eslint-disable max-lines */
import {format} from 'date-fns';
import {fastMerge} from 'expensify-common';
import type {NullishDeep, OnyxCollection, OnyxEntry, OnyxInputValue, OnyxKey, OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import type {SearchQueryJSON} from '@components/Search/types';
import type {UpdateMoneyRequestParams} from '@libs/API/parameters';
import DateUtils from '@libs/DateUtils';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import {getMicroSecondOnyxErrorObject, getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import {isLocalFile} from '@libs/fileDownload/FileUtils';
import type {MinimalTransaction} from '@libs/Formula';
import {getGPSRoutes, getGPSWaypoints} from '@libs/GPSDraftDetailsUtils';
import {formatCurrentUserToAttendee, updateIOUOwnerAndTotal} from '@libs/IOUUtils';
import {formatPhoneNumber} from '@libs/LocalePhoneNumber';
import * as Localize from '@libs/Localize';
import Log from '@libs/Log';
import sharedDismissModalAndOpenReportInInboxTab from '@libs/Navigation/helpers/dismissModalAndOpenReportInInboxTab';
import isReportTopmostSplitNavigator from '@libs/Navigation/helpers/isReportTopmostSplitNavigator';
import navigateAfterExpenseCreate from '@libs/Navigation/helpers/navigateAfterExpenseCreate';
import Navigation from '@libs/Navigation/Navigation';
// eslint-disable-next-line @typescript-eslint/no-deprecated
import {buildNextStepNew, buildOptimisticNextStep} from '@libs/NextStepUtils';
import * as NumberUtils from '@libs/NumberUtils';
import {getManagerMcTestParticipant} from '@libs/OptionsListUtils';
import {getCustomUnitID} from '@libs/PerDiemRequestUtils';
import {addSMSDomainIfPhoneNumber} from '@libs/PhoneNumber';
import {getDistanceRateCustomUnit, hasDependentTags, isPaidGroupPolicy} from '@libs/PolicyUtils';
import {getOriginalMessage, isReportPreviewAction} from '@libs/ReportActionsUtils';
import type {OptimisticChatReport, OptimisticCreatedReportAction, OptimisticIOUReportAction} from '@libs/ReportUtils';
import {
    buildOptimisticAddCommentReportAction,
    buildOptimisticChatReport,
    buildOptimisticExpenseReport,
    buildOptimisticIOUReport,
    buildOptimisticIOUReportAction,
    buildOptimisticMoneyRequestEntities,
    buildOptimisticReportPreview,
    generateReportID,
    getChatByParticipants,
    getOutstandingChildRequest,
    getReportOrDraftReport,
    hasViolations as hasViolationsReportUtils,
    isDeprecatedGroupDM,
    isExpenseReport,
    isGroupChat,
    isInvoiceReport as isInvoiceReportReportUtils,
    isInvoiceRoom,
    isMoneyRequestReport as isMoneyRequestReportReportUtils,
    isOneTransactionReport,
    isOptimisticPersonalDetail,
    isPolicyExpenseChat as isPolicyExpenseChatReportUtil,
    isSelectedManagerMcTest,
    isSelfDM,
    isTestTransactionReport,
    populateOptimisticReportFormula,
    shouldCreateNewMoneyRequestReport as shouldCreateNewMoneyRequestReportReportUtils,
    updateReportPreview,
} from '@libs/ReportUtils';
import {buildSearchQueryJSON, buildSearchQueryString, getCurrentSearchQueryJSON} from '@libs/SearchQueryUtils';
import {getSuggestedSearches} from '@libs/SearchUIUtils';
import {startSpan} from '@libs/telemetry/activeSpans';
import {
    buildOptimisticTransaction,
    getAmount,
    getCategoryTaxCodeAndAmount,
    getCurrency,
    getDistanceInMeters,
    isDistanceRequest as isDistanceRequestTransactionUtils,
    isManualDistanceRequest as isManualDistanceRequestTransactionUtils,
    isOdometerDistanceRequest as isOdometerDistanceRequestTransactionUtils,
    isPerDiemRequest as isPerDiemRequestTransactionUtils,
    isScanRequest as isScanRequestTransactionUtils,
    isTimeRequest as isTimeRequestTransactionUtils,
} from '@libs/TransactionUtils';
import ViolationsUtils from '@libs/Violations/ViolationsUtils';
import {buildOptimisticPolicyRecentlyUsedTags} from '@userActions/Policy/Tag';
import {mergeTransactionIdsHighlightOnSearchRoute} from '@userActions/Transaction';
import {getRemoveDraftTransactionsByIDsData, removeDraftTransactionsByIDs} from '@userActions/TransactionEdit';
import type {IOUAction, IOUActionParams} from '@src/CONST';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import type {Accountant, Attendee, Participant} from '@src/types/onyx/IOU';
import type {ErrorFields, Errors, PendingAction, PendingFields} from '@src/types/onyx/OnyxCommon';
import type {CurrentUserPersonalDetails} from '@src/types/onyx/PersonalDetails';
import type {Unit} from '@src/types/onyx/Policy';
import type RecentlyUsedTags from '@src/types/onyx/RecentlyUsedTags';
import type {ReportNextStep} from '@src/types/onyx/Report';
import type ReportAction from '@src/types/onyx/ReportAction';
import type {OnyxData} from '@src/types/onyx/Request';
import type {SearchDataTypes} from '@src/types/onyx/SearchResults';
import type {Comment, Receipt, TransactionChanges, TransactionCustomUnit, WaypointCollection} from '@src/types/onyx/Transaction';
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

type UpdateMoneyRequestData<TKey extends OnyxKey> = {
    params: UpdateMoneyRequestParams;
    onyxData: OnyxData<TKey>;
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

function getAllReportNameValuePairs(): OnyxCollection<OnyxTypes.ReportNameValuePairs> {
    return allReportNameValuePairs;
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

function getRecentAttendees(): OnyxEntry<Attendee[]> {
    return recentAttendees;
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
 * @deprecated This function uses Onyx.connect and should be replaced with useOnyx for reactive data access.
 * TODO: remove `getMoneyRequestPolicyTags` from this file (https://github.com/Expensify/App/issues/72721)
 * All usages of this function should be replaced with useOnyx hook in React components.
 */
function getMoneyRequestPolicyTags({
    existingIOUReport,
    moneyRequestReportID,
    parentChatReport,
    participant,
}: {
    existingIOUReport?: OnyxEntry<OnyxTypes.Report>;
    moneyRequestReportID?: string;
    parentChatReport: OnyxEntry<OnyxTypes.Report>;
    participant: Participant;
}): OnyxTypes.PolicyTagLists {
    const iouReportPolicyID =
        existingIOUReport?.policyID ??
        (moneyRequestReportID ? allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${moneyRequestReportID}`]?.policyID : undefined) ??
        parentChatReport?.policyID ??
        allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${participant.reportID}`]?.policyID;
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    return getPolicyTagsData(iouReportPolicyID) ?? {};
}

/**
 * @private
 * After finishing the action in RHP from the Inbox tab, besides dismissing the modal, we should open the report.
 * If the action is done from the report RHP, then we just want to dismiss the money request flow screens.
 * It is a helper function used only in this file.
 */
function dismissModalAndOpenReportInInboxTab(reportID?: string, isInvoice?: boolean) {
    const hasMultipleTransactions = Object.values(allTransactions).filter((transaction) => transaction?.reportID === reportID).length > 0;
    sharedDismissModalAndOpenReportInInboxTab(reportID, isInvoice, hasMultipleTransactions);
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
}: {
    activeReportID?: string;
    transactionID?: string;
    isFromGlobalCreate?: boolean;
    isInvoice?: boolean;
}) {
    const hasMultipleTransactions = Object.values(allTransactions).filter((transaction) => transaction?.reportID === activeReportID).length > 0;
    navigateAfterExpenseCreate({activeReportID, transactionID, isFromGlobalCreate, isInvoice, hasMultipleTransactions});
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
    // delegateAccountIDParam: will be threaded in PR 15; buildOptimisticAddCommentReportAction falls back to module-level Onyx.connect value (https://github.com/Expensify/App/issues/66425)
    const textComment = buildOptimisticAddCommentReportAction({
        text,
        actorAccountID: deprecatedUserAccountID,
        reportActionID: testDriveIOUParams.testDriveCommentReportActionID,
        delegateAccountIDParam: undefined,
    });
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
    | typeof ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE
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
            },
        });
        onyxData.optimisticData?.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.RAM_ONLY_REPORT_LOADING_STATE}${iou.report?.reportID}`,
            value: {
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
                value: {[CONST.PRODUCT_TRAINING_TOOLTIP_NAMES.SCAN_TEST_TOOLTIP]: {timestamp: DateUtils.getDBTime(date.valueOf()), dismissedMethod: 'click'}},
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
    const {payeeAccountID = currentUserAccountIDParam, payeeEmail = currentUserEmailParam, participant} = participantParams;
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
        policyTags: policyTagList ?? {},
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
        isOneOnOneSplit: isSplitExpense,
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
        if (transactionChanges && 'reimbursable' in transactionChanges) {
            updatedMoneyRequestReport = maybeUpdateReportNameForFormulaTitle(updatedMoneyRequestReport, policy);
        }
    } else {
        updatedMoneyRequestReport = updateIOUOwnerAndTotal(iouReport, actorAccountID ?? CONST.DEFAULT_NUMBER_ID, diff, getCurrency(transaction), false, true, isTransactionOnHold);
    }

    return {updatedMoneyRequestReport, isTotalIndeterminate};
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

type ExpenseReportStatusPredicate = (expenseReport: OnyxEntry<OnyxTypes.Report>, transactionReportID?: string) => boolean;

const expenseReportStatusFilterMapping: Record<string, ExpenseReportStatusPredicate> = {
    [CONST.SEARCH.STATUS.EXPENSE.DRAFTS]: (expenseReport) => expenseReport?.stateNum === CONST.REPORT.STATE_NUM.OPEN && expenseReport?.statusNum === CONST.REPORT.STATUS_NUM.OPEN,
    [CONST.SEARCH.STATUS.EXPENSE.OUTSTANDING]: (expenseReport) =>
        expenseReport?.stateNum === CONST.REPORT.STATE_NUM.SUBMITTED && expenseReport?.statusNum === CONST.REPORT.STATUS_NUM.SUBMITTED,
    [CONST.SEARCH.STATUS.EXPENSE.APPROVED]: (expenseReport) => expenseReport?.stateNum === CONST.REPORT.STATE_NUM.APPROVED && expenseReport?.statusNum === CONST.REPORT.STATUS_NUM.APPROVED,
    [CONST.SEARCH.STATUS.EXPENSE.PAID]: (expenseReport) =>
        (expenseReport?.stateNum ?? 0) >= CONST.REPORT.STATE_NUM.APPROVED && expenseReport?.statusNum === CONST.REPORT.STATUS_NUM.REIMBURSED,
    [CONST.SEARCH.STATUS.EXPENSE.DONE]: (expenseReport) => expenseReport?.stateNum === CONST.REPORT.STATE_NUM.APPROVED && expenseReport?.statusNum === CONST.REPORT.STATUS_NUM.CLOSED,
    [CONST.SEARCH.STATUS.EXPENSE.UNREPORTED]: (expenseReport, transactionReportID) => !expenseReport && transactionReportID !== CONST.REPORT.TRASH_REPORT_ID,
    [CONST.SEARCH.STATUS.EXPENSE.DELETED]: (_expenseReport, transactionReportID) => transactionReportID === CONST.REPORT.TRASH_REPORT_ID,
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
    const transactionReportID = transaction?.reportID;
    if (Array.isArray(status)) {
        shouldOptimisticallyUpdateByStatus = status.some((val) => {
            const expenseStatus = val as ValueOf<typeof CONST.SEARCH.STATUS.EXPENSE>;
            return expenseReportStatusFilterMapping[expenseStatus](iouReport, transactionReportID);
        });
    } else {
        const expenseStatus = status as ValueOf<typeof CONST.SEARCH.STATUS.EXPENSE>;
        shouldOptimisticallyUpdateByStatus = expenseReportStatusFilterMapping[expenseStatus](iouReport, transactionReportID);
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

    const hasNoFlatFilters = currentSearchQueryJSON.flatFilters.length === 0;

    const matchesSubmitQuery =
        submitQueryJSON?.similarSearchHash === currentSearchQueryJSON.similarSearchHash && expenseReportStatusFilterMapping[CONST.SEARCH.STATUS.EXPENSE.DRAFTS](iouReport);

    const matchesApproveQuery =
        approveQueryJSON?.similarSearchHash === currentSearchQueryJSON.similarSearchHash && expenseReportStatusFilterMapping[CONST.SEARCH.STATUS.EXPENSE.OUTSTANDING](iouReport);

    const matchesUnapprovedCashQuery =
        unapprovedCashSimilarSearchHash === currentSearchQueryJSON.similarSearchHash &&
        isExpenseReport(iouReport) &&
        (expenseReportStatusFilterMapping[CONST.SEARCH.STATUS.EXPENSE.DRAFTS](iouReport) || expenseReportStatusFilterMapping[CONST.SEARCH.STATUS.EXPENSE.OUTSTANDING](iouReport)) &&
        transaction?.reimbursable;

    const matchesFilterQuery = hasNoFlatFilters || matchesSubmitQuery || matchesApproveQuery || matchesUnapprovedCashQuery;

    return shouldOptimisticallyUpdateByStatus && validSearchTypes && matchesFilterQuery;
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

    if (!currentSearchQueryJSON || toAccountID === undefined || fromAccountID === undefined) {
        return;
    }

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

export {
    clearMoneyRequest,
    createDraftTransaction,
    getIOURequestPolicyID,
    initMoneyRequest,
    dismissModalAndOpenReportInInboxTab,
    resetDraftTransactionsCustomUnit,
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
    setMoneyRequestMerchant,
    setMoneyRequestParticipants,
    setMoneyRequestParticipantsFromReport,
    getMoneyRequestParticipantsFromReport,
    setMoneyRequestReportID,
    setMoneyRequestPendingFields,
    setMultipleMoneyRequestParticipantsFromReport,
    setMoneyRequestTag,
    setMoneyRequestTaxAmount,
    setMoneyRequestTaxRate,
    setMoneyRequestTaxValue,
    setMoneyRequestTaxRateValues,
    startMoneyRequest,
    updateLastLocationPermissionPrompt,
    shouldOptimisticallyUpdateSearch,
    setMoneyRequestReimbursable,
    calculateDiffAmount,
    getUpdatedMoneyRequestReportData,
    startDistanceRequest,
    getReportPreviewAction,
    mergePolicyRecentlyUsedCurrencies,
    mergePolicyRecentlyUsedCategories,
    getAllPersonalDetails,
    getAllTransactions,
    getAllTransactionViolations,
    getAllReports,
    getAllReportActionsFromIOU,
    getAllReportNameValuePairs,
    getAllTransactionDrafts,
    getCurrentUserEmail,
    getUserAccountID,
    getRecentAttendees,
    getReceiptError,
    // TODO: Replace getPolicyTagsData (https://github.com/Expensify/App/issues/72721) and getPolicyRecentlyUsedTagsData (https://github.com/Expensify/App/issues/71491) with useOnyx hook
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    getPolicyTagsData,
    getSearchOnyxUpdate,
    getPolicyTags,
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    getMoneyRequestPolicyTags,
    setMoneyRequestTimeRate,
    setMoneyRequestTimeCount,
    handleNavigateAfterExpenseCreate,
    buildMinimalTransactionForFormula,
    buildOnyxDataForMoneyRequest,
    getMoneyRequestInformation,
    getTransactionWithPreservedLocalReceiptSource,
    highlightTransactionOnSearchRouteIfNeeded,
};
export type {
    GPSPoint as GpsPoint,
    IOURequestType,
    StartSplitBilActionParams,
    RequestMoneyInformation,
    ReplaceReceipt,
    RequestMoneyParticipantParams,
    UpdateMoneyRequestData,
    MoneyRequestInformationParams,
    OneOnOneIOUReport,
    BuildOnyxDataForMoneyRequestKeys,
    MoneyRequestInformation,
    BaseTransactionParams,
};
