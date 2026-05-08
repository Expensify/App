import {format} from 'date-fns';
import type {NullishDeep, OnyxCollection, OnyxEntry, OnyxKey, OnyxUpdate} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import type {SearchQueryJSON} from '@components/Search/types';
import type {UpdateMoneyRequestParams} from '@libs/API/parameters';
import DateUtils from '@libs/DateUtils';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import {getGPSRoutes, getGPSWaypoints} from '@libs/GPSDraftDetailsUtils';
import {formatCurrentUserToAttendee} from '@libs/IOUUtils';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import {getCustomUnitID} from '@libs/PerDiemRequestUtils';
import {getDistanceRateCustomUnit} from '@libs/PolicyUtils';
import {
    getReportOrDraftReport,
    isExpenseReport,
    isInvoiceRoom,
    isMoneyRequestReport as isMoneyRequestReportReportUtils,
    isOptimisticPersonalDetail,
    isPolicyExpenseChat as isPolicyExpenseChatReportUtil,
    isSelfDM,
} from '@libs/ReportUtils';
import {buildSearchQueryJSON, buildSearchQueryString, getCurrentSearchQueryJSON} from '@libs/SearchQueryUtils';
import {getSuggestedSearches} from '@libs/SearchUIUtils';
import {startSpan} from '@libs/telemetry/activeSpans';
import {getCategoryTaxDetails, getDistanceInMeters, isOdometerDistanceRequest as isOdometerDistanceRequestTransactionUtils} from '@libs/TransactionUtils';
import {getRemoveDraftTransactionsByIDsData, removeDraftTransactionsByIDs} from '@userActions/TransactionEdit';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type * as OnyxTypes from '@src/types/onyx';
import type {Accountant, Attendee, Participant} from '@src/types/onyx/IOU';
import type {CurrentUserPersonalDetails} from '@src/types/onyx/PersonalDetails';
import type {Unit} from '@src/types/onyx/Policy';
import type RecentlyUsedTags from '@src/types/onyx/RecentlyUsedTags';
import type {OnyxData} from '@src/types/onyx/Request';
import type {SearchResultDataType} from '@src/types/onyx/SearchResults';
import type {Comment, Receipt} from '@src/types/onyx/Transaction';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import type BaseTransactionParams from './types/BaseTransactionParams';
import type RequestMoneyParticipantParams from './types/RequestMoneyParticipantParams';
import type {GPSPoint} from './types/TrackExpenseTransactionParams';

type IOURequestType = ValueOf<typeof CONST.IOU.REQUEST_TYPE>;

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

function getCurrentUserPersonalDetails(): OnyxEntry<OnyxTypes.PersonalDetails> {
    return deprecatedCurrentUserPersonalDetails;
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
    return getPolicyTagsData(iouReportPolicyID) ?? {};
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
        setMoneyRequestTaxRateValues(transactionID, {taxCode: '', taxAmount: null, taxValue: null});
        return;
    }
    const transaction = allTransactionDrafts[`${ONYXKEYS.COLLECTION.TRANSACTION_DRAFT}${transactionID}`];
    const {categoryTaxCode, categoryTaxAmount, categoryTaxValue} = getCategoryTaxDetails(category, transaction, policy);
    if (categoryTaxCode && categoryTaxAmount !== undefined && categoryTaxValue) {
        setMoneyRequestTaxRateValues(transactionID, {taxCode: categoryTaxCode, taxAmount: categoryTaxAmount, taxValue: categoryTaxValue});
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

/**
 * Finds the participants for an IOU based on the attached report
 * @param transactionID of the transaction to set the participants of
 * @param report attached to the transaction
 */
function getMoneyRequestParticipantsFromReport(report: OnyxEntry<OnyxTypes.Report>, currentUserAccountID?: number): Participant[] {
    // If the report is iou or expense report, we should get the chat report to set participant for request money
    const chatReport = isMoneyRequestReportReportUtils(report) ? getReportOrDraftReport(report?.chatReportID) : report;
    const isSelfDMChat = !isEmptyObject(chatReport) && isSelfDM(chatReport);
    const isPolicyExpenseChat = isPolicyExpenseChatReportUtil(chatReport);
    let participants: Participant[] = [];

    if (isPolicyExpenseChat || isSelfDMChat) {
        participants = [
            {
                accountID: 0,
                reportID: chatReport?.reportID,
                isPolicyExpenseChat,
                selected: true,
                policyID: isPolicyExpenseChat ? chatReport?.policyID : undefined,
                isSelfDM: isSelfDMChat,
            },
        ];
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
    currentSearchQueryJSON: Readonly<SearchQueryJSON>,
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
            // The optimistic personal detail is cleared from PERSONAL_DETAILS_LIST on API success, but the snapshot's report still references
            // that optimistic accountID via report.managerID. Re-merging the personal detail into the snapshot in successData prevents the
            // "To" column from briefly going blank before Search API delivers the real data.
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
        // Building this object sequentially resolves TypeScript type inference issues
        const optimisticSnapshotData: SearchResultDataType = {};

        optimisticSnapshotData[ONYXKEYS.PERSONAL_DETAILS_LIST] = {
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
        };

        optimisticSnapshotData[`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`] = {
            ...(transactionThreadReportID && {transactionThreadReportID}),
            ...(isFromOneTransactionReport && {isFromOneTransactionReport}),
            ...transaction,
        };

        if (policy) {
            optimisticSnapshotData[`${ONYXKEYS.COLLECTION.POLICY}${policy.id}`] = policy;
        }

        if (iouReport) {
            optimisticSnapshotData[`${ONYXKEYS.COLLECTION.REPORT}${iouReport.reportID}`] = iouReport;
        }

        if (iouReport && iouAction) {
            optimisticSnapshotData[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport.reportID}`] = {[iouAction.reportActionID]: iouAction};
        }

        const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.COLLECTION.SNAPSHOT>> = [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.SNAPSHOT}${currentSearchQueryJSON.hash}` as const,
                value: {
                    data: optimisticSnapshotData,
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
                        data: optimisticSnapshotData,
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
    startDistanceRequest,
    getAllPersonalDetails,
    getAllTransactions,
    getAllTransactionViolations,
    getAllReports,
    getAllReportActionsFromIOU,
    getAllReportNameValuePairs,
    getAllTransactionDrafts,
    getCurrentUserEmail,
    getUserAccountID,
    getCurrentUserPersonalDetails,
    getRecentAttendees,
    // TODO: Replace getPolicyTagsData (https://github.com/Expensify/App/issues/72721) and getPolicyRecentlyUsedTagsData (https://github.com/Expensify/App/issues/71491) with useOnyx hook
    getPolicyTagsData,
    getSearchOnyxUpdate,
    getPolicyTags,
    getMoneyRequestPolicyTags,
    setMoneyRequestTimeRate,
    setMoneyRequestTimeCount,
};
export type {GPSPoint as GpsPoint, IOURequestType, StartSplitBilActionParams, ReplaceReceipt, RequestMoneyParticipantParams, UpdateMoneyRequestData, BaseTransactionParams};
