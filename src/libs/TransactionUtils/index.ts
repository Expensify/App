import {format, isValid, parse} from 'date-fns';
import {deepEqual} from 'fast-equals';
import lodashDeepClone from 'lodash/cloneDeep';
import lodashHas from 'lodash/has';
import lodashSet from 'lodash/set';
import type {OnyxCollection, OnyxEntry, OnyxKey} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import type {Coordinate} from '@components/MapView/MapViewTypes';
import utils from '@components/MapView/utils';
import type {UnreportedExpenseListItemType} from '@components/SelectionListWithSections/types';
import type {TransactionWithOptionalSearchFields} from '@components/TransactionItemRow';
import type {MergeDuplicatesParams} from '@libs/API/parameters';
import {getCategoryDefaultTaxRate, isCategoryMissing} from '@libs/CategoryUtils';
import {convertToBackendAmount, getCurrencyDecimals, getCurrencySymbol} from '@libs/CurrencyUtils';
import DateUtils from '@libs/DateUtils';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import {toLocaleDigit} from '@libs/LocaleDigitUtils';
// eslint-disable-next-line @typescript-eslint/no-deprecated
import {translateLocal} from '@libs/Localize';
import Log from '@libs/Log';
import {rand64, roundToTwoDecimalPlaces} from '@libs/NumberUtils';
import Permissions from '@libs/Permissions';
import {getLoginsByAccountIDs, getPersonalDetailsByIDs} from '@libs/PersonalDetailsUtils';
import {
    getCommaSeparatedTagNameWithSanitizedColons,
    getDistanceRateCustomUnit,
    getDistanceRateCustomUnitRate,
    getPolicy,
    getTaxByID,
    isInstantSubmitEnabled,
    isMultiLevelTags as isMultiLevelTagsPolicyUtils,
    isPolicyAdmin,
    isPolicyMember as isPolicyMemberPolicyUtils,
} from '@libs/PolicyUtils';
import {getOriginalMessage, getReportAction, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {
    getReportOrDraftReport,
    getReportTransactions,
    isCurrentUserSubmitter,
    isInvoiceReport,
    isOpenExpenseReport,
    isProcessingReport,
    isReportApproved,
    isReportIDApproved,
    isReportManuallyReimbursed,
    isSettled,
    isThread,
} from '@libs/ReportUtils';
import type {IOURequestType} from '@userActions/IOU';
import CONST from '@src/CONST';
import type {IOUType} from '@src/CONST';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';
import type {
    Beta,
    CardList,
    OnyxInputOrEntry,
    Policy,
    PolicyCategories,
    PolicyTagLists,
    RecentWaypoint,
    Report,
    ReviewDuplicates,
    TaxRate,
    TaxRates,
    Transaction,
    TransactionViolation,
    TransactionViolations,
    ViolationName,
} from '@src/types/onyx';
import type {Attendee, Participant, SplitExpense} from '@src/types/onyx/IOU';
import type {Errors, PendingAction} from '@src/types/onyx/OnyxCommon';
import type {CurrentUserPersonalDetails} from '@src/types/onyx/PersonalDetails';
import type {OnyxData} from '@src/types/onyx/Request';
import type {
    Comment,
    Receipt,
    TransactionChanges,
    TransactionCustomUnit,
    TransactionPendingFieldsKey,
    UnreportedTransaction,
    Waypoint,
    WaypointCollection,
} from '@src/types/onyx/Transaction';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import SafeString from '@src/utils/SafeString';
import getDistanceInMeters from './getDistanceInMeters';

type TransactionParams = {
    amount: number;
    modifiedAmount?: number;
    currency: string;
    reportID: string | undefined;
    comment?: string;
    attendees?: Attendee[];
    created?: string;
    merchant?: string;
    receipt?: OnyxEntry<Receipt>;
    category?: string;
    tag?: string;
    taxCode?: string;
    taxAmount?: number;
    billable?: boolean;
    pendingFields?: Partial<Record<TransactionPendingFieldsKey, ValueOf<typeof CONST.RED_BRICK_ROAD_PENDING_ACTION>>>;
    reimbursable?: boolean;
    source?: string;
    filename?: string;
    customUnit?: TransactionCustomUnit;
    splitExpenses?: SplitExpense[];
    splitExpensesTotal?: number;
    participants?: Participant[];
    pendingAction?: PendingAction;
    splitsStartDate?: string;
    splitsEndDate?: string;
    distance?: number;
    odometerStart?: number;
    odometerEnd?: number;
    gpsCoordinates?: string;
    type?: ValueOf<typeof CONST.TRANSACTION.TYPE>;
    count?: number;
    rate?: number;
    unit?: ValueOf<typeof CONST.TIME_TRACKING.UNIT>;
};

type BuildOptimisticTransactionParams = {
    originalTransactionID?: string;
    existingTransactionID?: string;
    existingTransaction?: OnyxEntry<Transaction>;
    policy?: OnyxEntry<Policy>;
    transactionParams: TransactionParams;
    isDemoTransactionParam?: boolean;
};

let allBetas: OnyxEntry<Beta[]>;
Onyx.connectWithoutView({
    key: ONYXKEYS.BETAS,
    callback: (value) => (allBetas = value),
});

// TODO: remove `allPolicyTags` from this file (https://github.com/Expensify/App/issues/72719)
// `allPolicyTags` was moved here temporarily from `src/libs/actions/Policy/Tag.ts` during the `Deprecate Onyx.connect` refactor.
// All uses of this variable should be replaced with `useOnyx`.
let allPolicyTags: OnyxCollection<PolicyTagLists> = {};
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

/**
 * @deprecated This function uses Onyx.connect and should be replaced with useOnyx for reactive data access.
 * All usages of this function should be replaced with useOnyx hook in React components.
 */
function getPolicyTagsData(policyID: string | undefined) {
    return allPolicyTags?.[`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`] ?? {};
}

function hasDistanceCustomUnit(transaction: OnyxEntry<Transaction> | Partial<Transaction>): boolean {
    const type = transaction?.comment?.type;
    const customUnitName = transaction?.comment?.customUnit?.name;
    return type === CONST.TRANSACTION.TYPE.CUSTOM_UNIT && customUnitName === CONST.CUSTOM_UNITS.NAME_DISTANCE;
}

function isDistanceRequest(transaction: OnyxEntry<Transaction>): boolean {
    // This is used during the expense creation flow before the transaction has been saved to the server
    if (lodashHas(transaction, 'iouRequestType')) {
        return (
            transaction?.iouRequestType === CONST.IOU.REQUEST_TYPE.DISTANCE ||
            transaction?.iouRequestType === CONST.IOU.REQUEST_TYPE.DISTANCE_MAP ||
            transaction?.iouRequestType === CONST.IOU.REQUEST_TYPE.DISTANCE_ODOMETER ||
            transaction?.iouRequestType === CONST.IOU.REQUEST_TYPE.DISTANCE_GPS ||
            transaction?.iouRequestType === CONST.IOU.REQUEST_TYPE.DISTANCE_MANUAL
        );
    }

    // This is the case for transaction objects once they have been saved to the server
    return hasDistanceCustomUnit(transaction);
}

function isDistanceTypeRequest(transaction: OnyxEntry<Transaction>): boolean {
    // This is used during the expense creation flow before the transaction has been saved to the server
    if (lodashHas(transaction, 'iouRequestType')) {
        return transaction?.iouRequestType === CONST.IOU.REQUEST_TYPE.DISTANCE;
    }

    // This is the case for transaction objects once they have been saved to the server
    return hasDistanceCustomUnit(transaction);
}

/**
 * todo: Currently there is no way to tell server map transaction object from
 * server GPS transaction object, this will be discussed and updated later.
 * To fix this temporarily we set keyForList of GPS waypoints to 'gps_start' and 'gps_end'
 * and use that to determine if it's a GPS or Map transaction. This should be changed before
 * the first GPS release.
 */
function hasGPSWaypoints(transaction: OnyxEntry<Transaction>) {
    const waypoints = transaction?.comment?.waypoints;

    if (!waypoints) {
        return false;
    }

    const waypoint = Object.values(waypoints).at(0);

    return !!waypoint?.keyForList?.startsWith('gps');
}

function isMapDistanceRequest(transaction: OnyxEntry<Transaction>): boolean {
    // This is used during the expense creation flow before the transaction has been saved to the server
    if (lodashHas(transaction, 'iouRequestType')) {
        return transaction?.iouRequestType === CONST.IOU.REQUEST_TYPE.DISTANCE_MAP;
    }

    // This is the case for transaction objects once they have been saved to the server
    return hasDistanceCustomUnit(transaction) && !hasGPSWaypoints(transaction);
}

function isGPSDistanceRequest(transaction: OnyxEntry<Transaction>): boolean {
    // This is used during the expense creation flow before the transaction has been saved to the server
    if (lodashHas(transaction, 'iouRequestType')) {
        return transaction?.iouRequestType === CONST.IOU.REQUEST_TYPE.DISTANCE_GPS;
    }

    // This is the case for transaction objects once they have been saved to the server
    return hasGPSWaypoints(transaction);
}

function isManualDistanceRequest(transaction: OnyxEntry<Transaction>, isUpdatedMergeTransaction = false): boolean {
    // This is used during the expense creation flow before the transaction has been saved to the server
    if (lodashHas(transaction, 'iouRequestType') && !isUpdatedMergeTransaction) {
        return transaction?.iouRequestType === CONST.IOU.REQUEST_TYPE.DISTANCE_MANUAL;
    }

    // This is the case for transaction objects once they have been saved to the server
    // Exclude odometer requests which also have no waypoints but have odometer readings
    return (
        hasDistanceCustomUnit(transaction) &&
        isEmptyObject(transaction?.comment?.waypoints) &&
        transaction?.comment?.odometerStart === undefined &&
        transaction?.comment?.odometerEnd === undefined
    );
}

function isOdometerDistanceRequest(transaction: OnyxEntry<Transaction>): boolean {
    // This is used during the expense creation flow before the transaction has been saved to the server
    if (lodashHas(transaction, 'iouRequestType')) {
        return transaction?.iouRequestType === CONST.IOU.REQUEST_TYPE.DISTANCE_ODOMETER;
    }

    // This is the case for transaction objects once they have been saved to the server
    // Odometer requests have odometerStart and odometerEnd in comment, and no waypoints
    return (
        hasDistanceCustomUnit(transaction) &&
        isEmptyObject(transaction?.comment?.waypoints) &&
        (transaction?.comment?.odometerStart !== undefined || transaction?.comment?.odometerEnd !== undefined)
    );
}

function isScanRequest(transaction: OnyxEntry<Transaction> | Partial<Transaction>): boolean {
    // This is used during the expense creation flow before the transaction has been saved to the server
    if (lodashHas(transaction, 'iouRequestType')) {
        return transaction?.iouRequestType === CONST.IOU.REQUEST_TYPE.SCAN;
    }

    // Distance requests can have a receipt source (for the map), so we need to exclude them
    if (hasDistanceCustomUnit(transaction)) {
        return false;
    }

    return !!transaction?.receipt?.source && transaction?.amount === 0;
}

function isPerDiemRequest(transaction: OnyxEntry<Transaction>): boolean {
    // This is used during the expense creation flow before the transaction has been saved to the server
    if (lodashHas(transaction, 'iouRequestType')) {
        return transaction?.iouRequestType === CONST.IOU.REQUEST_TYPE.PER_DIEM;
    }

    // This is the case for transaction objects once they have been saved to the server
    const type = transaction?.comment?.type;
    const customUnitName = transaction?.comment?.customUnit?.name;
    return type === CONST.TRANSACTION.TYPE.CUSTOM_UNIT && customUnitName === CONST.CUSTOM_UNITS.NAME_PER_DIEM_INTERNATIONAL;
}

function isTimeRequest(transaction: OnyxEntry<Transaction>): boolean {
    // This is used during the expense creation flow before the transaction has been saved to the server
    if (lodashHas(transaction, 'iouRequestType')) {
        return transaction?.iouRequestType === CONST.IOU.REQUEST_TYPE.TIME;
    }

    // This is the case for transaction objects once they have been saved to the server
    return transaction?.comment?.type === CONST.TRANSACTION.TYPE.TIME;
}

function isCorporateCardTransaction(transaction: OnyxEntry<Transaction>): boolean {
    return isManagedCardTransaction(transaction) && transaction?.comment?.liabilityType === CONST.TRANSACTION.LIABILITY_TYPE.RESTRICT;
}

function getRequestType(transaction: OnyxEntry<Transaction>): IOURequestType {
    if (isOdometerDistanceRequest(transaction)) {
        return CONST.IOU.REQUEST_TYPE.DISTANCE_ODOMETER;
    }
    if (isManualDistanceRequest(transaction)) {
        return CONST.IOU.REQUEST_TYPE.DISTANCE_MANUAL;
    }
    if (isMapDistanceRequest(transaction)) {
        return CONST.IOU.REQUEST_TYPE.DISTANCE_MAP;
    }
    if (isDistanceTypeRequest(transaction)) {
        return CONST.IOU.REQUEST_TYPE.DISTANCE;
    }
    if (isScanRequest(transaction)) {
        return CONST.IOU.REQUEST_TYPE.SCAN;
    }
    if (isPerDiemRequest(transaction)) {
        return CONST.IOU.REQUEST_TYPE.PER_DIEM;
    }
    if (isTimeRequest(transaction)) {
        return CONST.IOU.REQUEST_TYPE.TIME;
    }
    if (isGPSDistanceRequest(transaction)) {
        return CONST.IOU.REQUEST_TYPE.DISTANCE_GPS;
    }

    return CONST.IOU.REQUEST_TYPE.MANUAL;
}

/**
 * Determines the expense type of a given transaction.
 */
function getExpenseType(transaction: OnyxEntry<Transaction>): ValueOf<typeof CONST.IOU.EXPENSE_TYPE> | undefined {
    if (!transaction) {
        return undefined;
    }

    if (isExpensifyCardTransaction(transaction)) {
        if (isPending(transaction)) {
            return CONST.IOU.EXPENSE_TYPE.PENDING_EXPENSIFY_CARD;
        }

        return CONST.IOU.EXPENSE_TYPE.EXPENSIFY_CARD;
    }

    const requestType = getRequestType(transaction);
    return requestType as ValueOf<typeof CONST.IOU.EXPENSE_TYPE>;
}

/**
 * Determines the transaction type based on custom unit name or card name.
 * Returns 'distance' for Distance transactions, 'perDiem' for Per Diem International transactions,
 * 'cash' for cash transactions, or 'card' for card transactions.
 *
 * @param transaction - The transaction to check
 * @param cardList - Optional card list to check for cash transactions
 * @returns The transaction type: 'distance', 'perDiem', 'cash', or 'card'
 */
function getTransactionType(transaction: OnyxEntry<Transaction>, cardList?: CardList): ValueOf<typeof CONST.SEARCH.TRANSACTION_TYPE> {
    const customUnitName = transaction?.comment?.customUnit?.name;

    if (customUnitName === CONST.CUSTOM_UNITS.NAME_DISTANCE) {
        return CONST.SEARCH.TRANSACTION_TYPE.DISTANCE;
    }

    if (customUnitName === CONST.CUSTOM_UNITS.NAME_PER_DIEM_INTERNATIONAL) {
        return CONST.SEARCH.TRANSACTION_TYPE.PER_DIEM;
    }

    if (isTimeRequest(transaction)) {
        return CONST.SEARCH.TRANSACTION_TYPE.TIME;
    }

    const cardID = transaction?.cardID;
    if (cardID && cardList?.[cardID]?.cardName === CONST.COMPANY_CARDS.CARD_NAME.CASH) {
        return CONST.SEARCH.TRANSACTION_TYPE.CASH;
    }

    if (!transaction?.cardName || transaction?.cardName?.includes(CONST.EXPENSE.TYPE.CASH_CARD_NAME)) {
        return CONST.SEARCH.TRANSACTION_TYPE.CASH;
    }

    return CONST.SEARCH.TRANSACTION_TYPE.CARD;
}

function isManualRequest(transaction: Transaction): boolean {
    // This is used during the expense creation flow before the transaction has been saved to the server
    if (lodashHas(transaction, 'iouRequestType')) {
        return transaction.iouRequestType === CONST.IOU.REQUEST_TYPE.MANUAL;
    }

    return getRequestType(transaction) === CONST.IOU.REQUEST_TYPE.MANUAL;
}

function isPartialTransaction(transaction: OnyxEntry<Transaction>): boolean {
    const merchant = getMerchant(transaction);

    if (!merchant || isPartialMerchant(merchant)) {
        return true;
    }

    if (isAmountMissing(transaction) && isScanRequest(transaction)) {
        return true;
    }

    return false;
}

function isPendingCardOrScanningTransaction(transaction: OnyxEntry<Transaction>): boolean {
    return (
        (isExpensifyCardTransaction(transaction) && isPending(transaction)) ||
        (isScanRequest(transaction) && isMerchantMissing(transaction) && isAmountMissing(transaction)) ||
        (isScanRequest(transaction) && isScanning(transaction))
    );
}

/**
 * Optimistically generate a transaction.
 *
 * @param amount – in cents
 * @param [existingTransactionID] When creating a distance expense, an empty transaction has already been created with a transactionID. In that case, the transaction here needs to have
 * it's transactionID match what was already generated.
 */
function buildOptimisticTransaction(params: BuildOptimisticTransactionParams): Transaction {
    const {originalTransactionID = '', existingTransactionID, existingTransaction, policy, transactionParams, isDemoTransactionParam} = params;
    const {
        amount,
        modifiedAmount,
        currency,
        reportID,
        distance,
        comment = '',
        attendees = [],
        created = '',
        merchant = '',
        receipt,
        category = '',
        tag = '',
        taxCode = '',
        taxAmount = 0,
        billable = false,
        pendingFields,
        reimbursable = true,
        source = '',
        filename = '',
        customUnit,
        splitExpenses,
        splitsStartDate,
        splitsEndDate,
        splitExpensesTotal,
        participants,
        pendingAction = CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        odometerStart,
        odometerEnd,
        type,
        count,
        rate,
        unit,
    } = transactionParams;
    // transactionIDs are random, positive, 64-bit numeric strings.
    // Because JS can only handle 53-bit numbers, transactionIDs are strings in the front-end (just like reportActionID)
    const transactionID = existingTransactionID ?? rand64();

    const commentJSON: Comment = {comment, attendees};
    if (odometerStart !== undefined) {
        commentJSON.odometerStart = odometerStart;
    }
    if (odometerEnd !== undefined) {
        commentJSON.odometerEnd = odometerEnd;
    }
    if (isDemoTransactionParam) {
        commentJSON.isDemoTransaction = true;
    }
    if (source) {
        commentJSON.source = source;
    }
    if (originalTransactionID) {
        commentJSON.originalTransactionID = originalTransactionID;
    }
    if (splitExpenses) {
        commentJSON.splitExpenses = splitExpenses;
    }
    if (splitsStartDate) {
        commentJSON.splitsStartDate = splitsStartDate;
    }
    if (splitsEndDate) {
        commentJSON.splitsEndDate = splitsEndDate;
    }
    if (splitExpensesTotal) {
        commentJSON.splitExpensesTotal = splitExpensesTotal;
    }

    const isMapDistanceTransaction = !!pendingFields?.waypoints;
    const isManualDistanceTransaction = isManualDistanceRequest(existingTransaction);
    const isOdometerDistanceTransaction = isOdometerDistanceRequest(existingTransaction);
    if (isMapDistanceTransaction || isManualDistanceTransaction || isOdometerDistanceTransaction) {
        // Set the distance unit, which comes from the policy distance unit or the P2P rate data
        lodashSet(commentJSON, 'customUnit.distanceUnit', DistanceRequestUtils.getUpdatedDistanceUnit({transaction: existingTransaction, policy}));
        lodashSet(commentJSON, 'customUnit.quantity', distance);
    }

    const isPerDiemTransaction = !!pendingFields?.subRates;
    if (isPerDiemTransaction) {
        // Set the custom unit, which comes from the policy per diem rate data
        lodashSet(commentJSON, 'customUnit', customUnit);
    }

    const isManualTransaction = !isPerDiemTransaction && !isMapDistanceTransaction && !isManualDistanceTransaction && !splitExpenses && !receipt?.source;
    if (type === CONST.TRANSACTION.TYPE.TIME) {
        commentJSON.units = {
            count,
            rate,
            unit,
        };
        commentJSON.type = type;
    }

    return {
        ...(!isEmptyObject(pendingFields) ? {pendingFields} : {}),
        transactionID,
        amount,
        currency,
        reportID,
        comment: commentJSON,
        merchant: merchant || (isManualTransaction ? CONST.TRANSACTION.DEFAULT_MERCHANT : CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT),
        created: created || DateUtils.getDBTime(),
        pendingAction,
        receipt: receipt?.source
            ? {source: receipt.source, filename: receipt?.name ?? filename, state: receipt.state ?? CONST.IOU.RECEIPT_STATE.SCAN_READY, isTestDriveReceipt: receipt.isTestDriveReceipt}
            : undefined,
        hasEReceipt: existingTransaction?.hasEReceipt,
        category,
        tag,
        taxCode,
        taxAmount,
        modifiedAmount,
        billable,
        reimbursable,
        inserted: DateUtils.getDBTime(),
        participants,
        cardID: existingTransaction?.cardID,
        cardName: existingTransaction?.cardName,
        cardNumber: existingTransaction?.cardNumber,
    };
}

/**
 * Check if the transaction has an Ereceipt
 */
function hasEReceipt(transaction: Transaction | undefined | null): boolean {
    return !!transaction?.hasEReceipt;
}

function hasReceipt(transaction: OnyxInputOrEntry<Transaction> | undefined): boolean {
    return !!transaction?.receipt?.state || hasEReceipt(transaction);
}

/** Check if the receipt has the source file */
function hasReceiptSource(transaction: OnyxInputOrEntry<Transaction>): boolean {
    return !!transaction?.receipt?.source;
}

function isDemoTransaction(transaction: OnyxInputOrEntry<Transaction>): boolean {
    return transaction?.comment?.isDemoTransaction ?? false;
}

function isMerchantMissing(transaction: OnyxEntry<Transaction>) {
    if (transaction?.modifiedMerchant && transaction.modifiedMerchant !== '') {
        return transaction.modifiedMerchant === CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT || transaction.modifiedMerchant === CONST.TRANSACTION.DEFAULT_MERCHANT;
    }
    const isMerchantEmpty =
        transaction?.merchant === CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT || transaction?.merchant === CONST.TRANSACTION.DEFAULT_MERCHANT || transaction?.merchant === '';

    return isMerchantEmpty;
}

/**
 * Determine if we should show the attendee selector for a given expense on a give policy.
 */
function shouldShowAttendees(iouType: IOUType, policy: OnyxEntry<Policy>): boolean {
    if ((iouType !== CONST.IOU.TYPE.SUBMIT && iouType !== CONST.IOU.TYPE.CREATE && iouType !== CONST.IOU.TYPE.TRACK) || !policy?.id || policy?.type !== CONST.POLICY.TYPE.CORPORATE) {
        return false;
    }

    // For backwards compatibility with Expensify Classic, we assume that Attendee Tracking is enabled by default on
    // Control policies if the policy does not contain the attribute
    return policy?.isAttendeeTrackingEnabled ?? true;
}

/**
 * Check if the merchant is partial i.e. `(none)`
 */
function isPartialMerchant(merchant: string): boolean {
    return merchant === CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT;
}

function isAmountMissing(transaction: OnyxEntry<Transaction>) {
    if (Permissions.isBetaEnabled(CONST.BETAS.ZERO_EXPENSES, allBetas)) {
        return transaction?.amount === undefined && (!transaction?.modifiedAmount === undefined || transaction?.modifiedAmount === '');
    }
    return (transaction?.amount === 0 || transaction?.amount === undefined) && (!transaction?.modifiedAmount || transaction?.modifiedAmount === 0 || transaction?.modifiedAmount === '');
}

function hasValidModifiedAmount(transaction: OnyxEntry<Transaction> | null): boolean {
    if (!transaction) {
        return false;
    }
    if (Permissions.isBetaEnabled(CONST.BETAS.ZERO_EXPENSES, allBetas)) {
        return transaction?.modifiedAmount !== undefined && transaction?.modifiedAmount !== null && transaction?.modifiedAmount !== '';
    }
    return transaction?.modifiedAmount !== undefined && transaction?.modifiedAmount !== null && transaction?.modifiedAmount !== '' && transaction?.modifiedAmount !== 0;
}

function isPartial(transaction: OnyxEntry<Transaction>): boolean {
    return isPartialMerchant(getMerchant(transaction)) && isAmountMissing(transaction);
}

function isCreatedMissing(transaction: OnyxEntry<Transaction>) {
    if (!transaction) {
        return true;
    }
    return transaction?.created === '' && (!transaction.created || transaction.modifiedCreated === '');
}

function areRequiredFieldsEmpty(transaction: OnyxEntry<Transaction>, transactionReport: OnyxEntry<Report>): boolean {
    const isFromExpenseReport = transactionReport?.type === CONST.REPORT.TYPE.EXPENSE;
    if (Permissions.isBetaEnabled(CONST.BETAS.ZERO_EXPENSES, allBetas)) {
        return (isFromExpenseReport && isMerchantMissing(transaction)) || isCreatedMissing(transaction);
    }
    return (isFromExpenseReport && isMerchantMissing(transaction)) || isAmountMissing(transaction) || isCreatedMissing(transaction);
}

function getClearedPendingFields(transactionChanges: TransactionChanges) {
    return {
        ...Object.fromEntries(Object.keys(transactionChanges).map((key) => [key, null])),
        ...(Object.hasOwn(transactionChanges, 'comment') && {comment: null}),
        ...(Object.hasOwn(transactionChanges, 'created') && {created: null}),
        ...(Object.hasOwn(transactionChanges, 'amount') && {amount: null}),
        ...(Object.hasOwn(transactionChanges, 'currency') && {currency: null}),
        ...(Object.hasOwn(transactionChanges, 'merchant') && {merchant: null}),
        ...(Object.hasOwn(transactionChanges, 'waypoints') && {waypoints: null}),
        ...(Object.hasOwn(transactionChanges, 'reimbursable') && {reimbursable: null}),
        ...(Object.hasOwn(transactionChanges, 'billable') && {billable: null}),
        ...(Object.hasOwn(transactionChanges, 'category') && {category: null}),
        ...(Object.hasOwn(transactionChanges, 'tag') && {tag: null}),
        ...(Object.hasOwn(transactionChanges, 'taxAmount') && {taxAmount: null}),
        ...(Object.hasOwn(transactionChanges, 'taxCode') && {taxCode: null}),
        ...(Object.hasOwn(transactionChanges, 'attendees') && {attendees: null}),
        ...(Object.hasOwn(transactionChanges, 'distance') && {
            quantity: null,
            amount: null,
            merchant: null,
        }),
    };
}

/**
 * Given the edit made to the expense, return an updated transaction object.
 */
function getUpdatedTransaction({
    transaction,
    transactionChanges,
    isFromExpenseReport,
    shouldUpdateReceiptState = true,
    policy = undefined,
}: {
    transaction: Transaction;
    transactionChanges: TransactionChanges;
    isFromExpenseReport: boolean;
    shouldUpdateReceiptState?: boolean;
    policy?: OnyxEntry<Policy>;
}): Transaction {
    const isUnReportedExpense = transaction?.reportID === CONST.REPORT.UNREPORTED_REPORT_ID;

    // Only changing the first level fields so no need for deep clone now
    const updatedTransaction = lodashDeepClone(transaction);
    let shouldStopSmartscan = false;

    // The comment property does not have its modifiedComment counterpart
    if (Object.hasOwn(transactionChanges, 'comment')) {
        updatedTransaction.comment = {
            ...updatedTransaction.comment,
            comment: transactionChanges.comment,
        };
    }
    if (Object.hasOwn(transactionChanges, 'created')) {
        updatedTransaction.modifiedCreated = transactionChanges.created;
        shouldStopSmartscan = true;
    }
    if (Object.hasOwn(transactionChanges, 'amount') && typeof transactionChanges.amount === 'number') {
        updatedTransaction.modifiedAmount = isFromExpenseReport || isUnReportedExpense ? -transactionChanges.amount : transactionChanges.amount;
        shouldStopSmartscan = true;
    }
    if (Object.hasOwn(transactionChanges, 'currency')) {
        updatedTransaction.modifiedCurrency = transactionChanges.currency;
        shouldStopSmartscan = true;
    }

    if (Object.hasOwn(transactionChanges, 'merchant')) {
        updatedTransaction.modifiedMerchant = transactionChanges.merchant;
        shouldStopSmartscan = true;
    }

    if (Object.hasOwn(transactionChanges, 'waypoints')) {
        updatedTransaction.modifiedWaypoints = transactionChanges.waypoints;
        updatedTransaction.isLoading = true;
        shouldStopSmartscan = true;

        if (!transactionChanges.routes?.route0?.geometry?.coordinates) {
            // The waypoints were changed, but there is no route – it is pending from the BE and we should mark the fields as pending
            updatedTransaction.amount = CONST.IOU.DEFAULT_AMOUNT;
            updatedTransaction.modifiedAmount = CONST.IOU.DEFAULT_AMOUNT;
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            updatedTransaction.modifiedMerchant = translateLocal('iou.fieldPending');
        } else {
            const mileageRate = DistanceRequestUtils.getRate({transaction: updatedTransaction, policy});
            const {unit, rate} = mileageRate;

            const distanceInMeters = getDistanceInMeters(transaction, unit);
            const amount = DistanceRequestUtils.getDistanceRequestAmount(distanceInMeters, unit, rate ?? 0);
            const updatedAmount = isFromExpenseReport || isUnReportedExpense ? -amount : amount;
            const updatedMerchant = DistanceRequestUtils.getDistanceMerchant(
                true,
                distanceInMeters,
                unit,
                rate,
                transaction.currency,
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                translateLocal,
                (digit) => toLocaleDigit(IntlStore.getCurrentLocale(), digit),
                getCurrencySymbol,
            );

            updatedTransaction.amount = updatedAmount;
            updatedTransaction.modifiedAmount = updatedAmount;
            updatedTransaction.modifiedMerchant = updatedMerchant;
        }
    }

    if (Object.hasOwn(transactionChanges, 'customUnitRateID')) {
        lodashSet(updatedTransaction, 'comment.customUnit.customUnitRateID', transactionChanges.customUnitRateID);
        lodashSet(updatedTransaction, 'comment.customUnit.defaultP2PRate', null);
        shouldStopSmartscan = true;

        const existingDistanceUnit = transaction?.comment?.customUnit?.distanceUnit;

        // Get the new distance unit from the rate's unit
        const newDistanceUnit = DistanceRequestUtils.getUpdatedDistanceUnit({transaction: updatedTransaction, policy});
        lodashSet(updatedTransaction, 'comment.customUnit.distanceUnit', newDistanceUnit);

        // If the distanceUnit is set and the rate is changed to one that has a different unit, convert the distance to the new unit
        if (existingDistanceUnit && newDistanceUnit !== existingDistanceUnit) {
            const conversionFactor = existingDistanceUnit === CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES ? CONST.CUSTOM_UNITS.MILES_TO_KILOMETERS : CONST.CUSTOM_UNITS.KILOMETERS_TO_MILES;
            const distance = roundToTwoDecimalPlaces((transaction?.comment?.customUnit?.quantity ?? 0) * conversionFactor);
            lodashSet(updatedTransaction, 'comment.customUnit.quantity', distance);
        }

        if (!isFetchingWaypointsFromServer(transaction)) {
            // When the waypoints are being fetched from the server, we have no information about the distance, and cannot recalculate the updated amount.
            // Otherwise, recalculate the fields based on the new rate.

            const oldMileageRate = DistanceRequestUtils.getRate({transaction, policy});
            const updatedMileageRate = DistanceRequestUtils.getRate({transaction: updatedTransaction, policy, useTransactionDistanceUnit: false});
            const {unit, rate} = updatedMileageRate;

            const distanceInMeters = getDistanceInMeters(transaction, oldMileageRate?.unit);
            const amount = DistanceRequestUtils.getDistanceRequestAmount(distanceInMeters, unit, rate ?? 0);
            const updatedAmount = isFromExpenseReport || isUnReportedExpense ? -amount : amount;
            const updatedCurrency = updatedMileageRate.currency ?? CONST.CURRENCY.USD;
            const updatedMerchant = DistanceRequestUtils.getDistanceMerchant(
                true,
                distanceInMeters,
                unit,
                rate,
                updatedCurrency,
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                translateLocal,
                (digit) => toLocaleDigit(IntlStore.getCurrentLocale(), digit),
                getCurrencySymbol,
            );

            updatedTransaction.amount = updatedAmount;
            updatedTransaction.modifiedAmount = updatedAmount;
            updatedTransaction.modifiedMerchant = updatedMerchant;
            updatedTransaction.modifiedCurrency = updatedCurrency;
        }
    }

    if (Object.hasOwn(transactionChanges, 'taxAmount') && typeof transactionChanges.taxAmount === 'number') {
        updatedTransaction.taxAmount = isFromExpenseReport ? -transactionChanges.taxAmount : transactionChanges.taxAmount;
    }

    if (Object.hasOwn(transactionChanges, 'taxCode') && typeof transactionChanges.taxCode === 'string') {
        updatedTransaction.taxCode = transactionChanges.taxCode;
    }

    if (Object.hasOwn(transactionChanges, 'taxValue') && typeof transactionChanges.taxCode === 'string') {
        updatedTransaction.taxValue = transactionChanges.taxValue;
    }

    if (Object.hasOwn(transactionChanges, 'reimbursable') && typeof transactionChanges.reimbursable === 'boolean') {
        updatedTransaction.reimbursable = transactionChanges.reimbursable;
    }

    if (Object.hasOwn(transactionChanges, 'billable') && typeof transactionChanges.billable === 'boolean') {
        updatedTransaction.billable = transactionChanges.billable;
    }

    if (Object.hasOwn(transactionChanges, 'category') && typeof transactionChanges.category === 'string') {
        updatedTransaction.category = transactionChanges.category;
        const {categoryTaxCode, categoryTaxAmount} = getCategoryTaxCodeAndAmount(transactionChanges.category, transaction, policy);
        if (categoryTaxCode && categoryTaxAmount !== undefined) {
            updatedTransaction.taxCode = categoryTaxCode;
            updatedTransaction.taxAmount = categoryTaxAmount;
        }
    }

    if (Object.hasOwn(transactionChanges, 'tag') && typeof transactionChanges.tag === 'string') {
        updatedTransaction.tag = transactionChanges.tag;
    }

    if (Object.hasOwn(transactionChanges, 'attendees')) {
        updatedTransaction.comment = {
            ...updatedTransaction.comment,
            attendees: transactionChanges.attendees,
        };
        updatedTransaction.modifiedAttendees = transactionChanges?.attendees;
    }

    if (
        shouldUpdateReceiptState &&
        shouldStopSmartscan &&
        transaction?.receipt &&
        Object.keys(transaction.receipt).length > 0 &&
        transaction?.receipt?.state !== CONST.IOU.RECEIPT_STATE.OPEN &&
        updatedTransaction.receipt
    ) {
        updatedTransaction.receipt.state = CONST.IOU.RECEIPT_STATE.OPEN;
    }

    if (Object.hasOwn(transactionChanges, 'distance') && typeof transactionChanges.distance === 'number') {
        const distance = roundToTwoDecimalPlaces(transactionChanges.distance ?? 0);

        lodashSet(updatedTransaction, 'comment.customUnit.quantity', distance);
        shouldStopSmartscan = true;

        const updatedMileageRate = DistanceRequestUtils.getRate({transaction: updatedTransaction, policy, useTransactionDistanceUnit: false});
        const {unit, rate} = updatedMileageRate;

        const distanceInMeters = getDistanceInMeters(updatedTransaction, unit);
        let amount = DistanceRequestUtils.getDistanceRequestAmount(distanceInMeters, unit, rate ?? 0);
        amount = isFromExpenseReport || isUnReportedExpense ? -amount : amount;
        const updatedCurrency = updatedMileageRate.currency ?? CONST.CURRENCY.USD;
        const updatedMerchant = DistanceRequestUtils.getDistanceMerchant(
            true,
            distanceInMeters,
            unit,
            rate,
            updatedCurrency,
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            translateLocal,
            (digit) => toLocaleDigit(IntlStore.getCurrentLocale(), digit),
            getCurrencySymbol,
        );

        updatedTransaction.modifiedAmount = amount;
        updatedTransaction.modifiedMerchant = updatedMerchant;
        updatedTransaction.modifiedCurrency = updatedCurrency;
    }

    if (Object.hasOwn(transactionChanges, 'odometerStart') && typeof transactionChanges.odometerStart === 'number') {
        lodashSet(updatedTransaction, 'comment.odometerStart', transactionChanges.odometerStart);
    }

    if (Object.hasOwn(transactionChanges, 'odometerEnd') && typeof transactionChanges.odometerEnd === 'number') {
        lodashSet(updatedTransaction, 'comment.odometerEnd', transactionChanges.odometerEnd);
    }

    updatedTransaction.pendingFields = {
        ...(updatedTransaction?.pendingFields ?? {}),
        ...(Object.hasOwn(transactionChanges, 'comment') && {comment: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}),
        ...(Object.hasOwn(transactionChanges, 'created') && {created: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}),
        ...(Object.hasOwn(transactionChanges, 'amount') && {amount: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}),
        ...(Object.hasOwn(transactionChanges, 'currency') && {currency: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}),
        ...(Object.hasOwn(transactionChanges, 'merchant') && {merchant: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}),
        ...(Object.hasOwn(transactionChanges, 'waypoints') && {waypoints: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}),
        ...(Object.hasOwn(transactionChanges, 'reimbursable') && {reimbursable: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}),
        ...(Object.hasOwn(transactionChanges, 'billable') && {billable: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}),
        ...(Object.hasOwn(transactionChanges, 'category') && {category: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}),
        ...(Object.hasOwn(transactionChanges, 'tag') && {tag: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}),
        ...(Object.hasOwn(transactionChanges, 'taxAmount') && {taxAmount: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}),
        ...(Object.hasOwn(transactionChanges, 'taxCode') && {taxCode: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}),
        ...(Object.hasOwn(transactionChanges, 'attendees') && {attendees: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}),
        ...(Object.hasOwn(transactionChanges, 'distance') && {
            quantity: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
            amount: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
            merchant: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
        }),
        ...(Object.hasOwn(transactionChanges, 'odometerStart') && {odometerStart: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}),
        ...(Object.hasOwn(transactionChanges, 'odometerEnd') && {odometerEnd: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}),
    };

    return updatedTransaction;
}

/**
 * Return the comment field (referred to as description in the App) from the transaction.
 * The comment does not have its modifiedComment counterpart.
 */
function getDescription(transaction: OnyxInputOrEntry<Transaction>): string {
    // Casting the description to string to avoid wrong data types (e.g. number) being returned from the API
    return transaction?.comment?.comment?.toString() ?? '';
}

/**
 * Return the amount field from the transaction, return the modifiedAmount if present.
 */
function getAmount(transaction: OnyxInputOrEntry<Transaction>, isFromExpenseReport = false, isFromTrackedExpense = false, allowNegative = false, disableOppositeConversion = false): number {
    // IOU requests cannot have negative values, but they can be stored as negative values, let's return absolute value
    if (!isFromExpenseReport && !isFromTrackedExpense && !allowNegative) {
        const amount = Number(transaction?.modifiedAmount) ?? 0;
        if (hasValidModifiedAmount(transaction)) {
            return Math.abs(amount);
        }
        return Math.abs(transaction?.amount ?? 0);
    }

    if (disableOppositeConversion) {
        return transaction?.amount ?? 0;
    }

    // Expense report case:
    // The amounts are stored using an opposite sign and negative values can be set,
    // we need to return an opposite sign than is saved in the transaction object
    let amount = Number(transaction?.modifiedAmount) ?? 0;
    if (hasValidModifiedAmount(transaction)) {
        return -amount;
    }

    amount = transaction?.amount ?? 0;

    // To avoid -0 being shown, lets only change the sign if the value is other than 0.
    return amount ? -amount : 0;
}

/**
 * Return the tax amount field from the transaction.
 */
function getTaxAmount(transaction: OnyxInputOrEntry<Transaction>, isFromExpenseReport: boolean): number {
    // IOU requests cannot have negative values but they can be stored as negative values, let's return absolute value
    if (!isFromExpenseReport) {
        return Math.abs(transaction?.taxAmount ?? 0);
    }

    // To avoid -0 being shown, lets only change the sign if the value is other than 0.
    const amount = transaction?.taxAmount ?? 0;
    return amount ? -amount : 0;
}

/**
 * Return the tax code from the transaction.
 */
function getTaxCode(transaction: OnyxInputOrEntry<Transaction>): string {
    return transaction?.taxCode ?? '';
}

/**
 * Return the posted date from the transaction.
 */
function getPostedDate(transaction: OnyxInputOrEntry<Transaction>): string {
    return transaction?.posted ?? '';
}

/**
 * Return the formatted posted date from the transaction.
 */
function getFormattedPostedDate(transaction: OnyxInputOrEntry<Transaction>, dateFormat: string = CONST.DATE.FNS_FORMAT_STRING): string {
    const postedDate = getPostedDate(transaction);
    const parsedDate = parse(postedDate, 'yyyyMMdd', new Date());

    if (isValid(parsedDate)) {
        return DateUtils.formatWithUTCTimeZone(format(parsedDate, 'yyyy-MM-dd'), dateFormat);
    }
    return '';
}

/**
 * Return the currency field from the transaction, return the modifiedCurrency if present.
 */
function getCurrency(transaction: OnyxInputOrEntry<Transaction>): string {
    const currency = transaction?.modifiedCurrency ?? '';
    if (currency) {
        return currency;
    }
    return transaction?.currency ?? CONST.CURRENCY.USD;
}

/**
 * Determines if a transaction's convertedAmount should be cleared when moving to a different currency workspace.
 * The convertedAmount is calculated for the source workspace's currency, so it becomes stale when:
 * 1. Source and destination workspace currencies differ, AND
 * 2. The transaction's currency doesn't match the destination currency
 *
 * Transactions that match the destination currency can keep their convertedAmount since no conversion is needed.
 */
function shouldClearConvertedAmount(transaction: OnyxInputOrEntry<Transaction>, sourceCurrency: string | undefined, destinationCurrency: string | undefined): boolean {
    if (!sourceCurrency || !destinationCurrency || sourceCurrency === destinationCurrency) {
        return false;
    }

    const transactionCurrency = getCurrency(transaction);
    const transactionMatchesDestination = transactionCurrency === destinationCurrency;

    return !transactionMatchesDestination;
}

/**
 * Return the original currency field from the transaction.
 */
function getOriginalCurrency(transaction: Transaction): string {
    return transaction?.originalCurrency ?? '';
}

/**
 * Return the absolute value of the original amount field from the transaction.
 */
function getOriginalAmount(transaction: Transaction): number {
    const amount = transaction?.originalAmount ?? 0;
    return Math.abs(amount);
}

function getConvertedAmount(
    transaction: OnyxInputOrEntry<Transaction>,
    isFromExpenseReport = false,
    isFromTrackedExpense = false,
    allowNegative = false,
    disableOppositeConversion = false,
): number {
    // IOU requests cannot have negative values, but they can be stored as negative values, let's return absolute value
    if (!isFromExpenseReport && !isFromTrackedExpense && !allowNegative) {
        return Math.abs(transaction?.convertedAmount ?? 0);
    }

    if (disableOppositeConversion) {
        return transaction?.convertedAmount ?? 0;
    }

    // Expense report case:
    // The amounts are stored using an opposite sign and negative values can be set,
    // we need to return an opposite sign than is saved in the transaction object
    const convertedAmount = transaction?.convertedAmount ?? 0;

    // To avoid -0 being shown, lets only change the sign if the value is other than 0.
    return convertedAmount ? -convertedAmount : 0;
}

/**
 * Return the original amount for display/sorting purposes.
 * For expense reports, returns the negated value of (originalAmount || amount || modifiedAmount).
 * For non-expense reports, returns getOriginalAmount() or Math.abs(amount) or Math.abs(modifiedAmount).
 */
function getOriginalAmountForDisplay(transaction: Pick<Transaction, 'originalAmount' | 'amount' | 'modifiedAmount'>, isExpenseReport: boolean): number {
    /* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
    if (isExpenseReport) {
        return -((transaction.originalAmount || transaction.amount || Number(transaction.modifiedAmount)) ?? 0);
    }
    return getOriginalAmount(transaction as Transaction) || Math.abs(transaction.amount ?? 0) || Math.abs(Number(transaction.modifiedAmount ?? 0));
    /* eslint-enable @typescript-eslint/prefer-nullish-coalescing */
}

/**
 * Return the original currency for display/sorting purposes.
 * Falls back to originalCurrency, then currency, then modifiedCurrency.
 */
function getOriginalCurrencyForDisplay(transaction: Pick<Transaction, 'originalCurrency' | 'currency' | 'modifiedCurrency' | 'amount'>): string {
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    return transaction.originalCurrency || (transaction.amount === 0 ? transaction.modifiedCurrency : transaction.currency) || CONST.CURRENCY.USD;
}

/**
 * Verify if the transaction is expecting the distance to be calculated on the server
 */
function isFetchingWaypointsFromServer(transaction: OnyxInputOrEntry<Transaction>): boolean {
    return !!transaction?.pendingFields?.waypoints;
}

/**
 * Verify that the transaction is in Self DM or is an original split transaction and that its distance rate is invalid.
 */
function isUnreportedAndHasInvalidDistanceRateTransaction(transaction: OnyxInputOrEntry<Transaction>, policyParam: OnyxEntry<Policy> = undefined) {
    if (transaction && isDistanceRequest(transaction)) {
        const report = getReportOrDraftReport(transaction.reportID);
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        const policy = policyParam ?? getPolicy(report?.policyID);
        const {rate} = DistanceRequestUtils.getRate({transaction, policy});
        const isUnreportedExpense = !transaction.reportID || transaction.reportID === CONST.REPORT.UNREPORTED_REPORT_ID || String(transaction.reportID) === CONST.REPORT.SPLIT_REPORT_ID;

        if (isUnreportedExpense && !rate) {
            return true;
        }
    }

    return false;
}

/**
 * Return the merchant field from the transaction, return the modifiedMerchant if present.
 */
function getMerchant(transaction: OnyxInputOrEntry<Transaction>, policyParam: OnyxEntry<Policy> = undefined): string {
    if (transaction && isDistanceRequest(transaction)) {
        const report = getReportOrDraftReport(transaction.reportID);
        // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
        // eslint-disable-next-line @typescript-eslint/no-deprecated
        const policy = policyParam ?? getPolicy(report?.policyID);
        const mileageRate = DistanceRequestUtils.getRate({transaction, policy});
        const {unit, rate} = mileageRate;
        const distanceInMeters = getDistanceInMeters(transaction, unit);
        if (
            (policy?.customUnits && !isUnreportedAndHasInvalidDistanceRateTransaction(transaction, policy)) ||
            // If modifiedMerchant is empty but modifiedCurrency exists, recalculate the merchant
            (!transaction?.modifiedMerchant && transaction?.modifiedCurrency)
        ) {
            return DistanceRequestUtils.getDistanceMerchant(
                true,
                distanceInMeters,
                unit,
                rate,
                getCurrency(transaction),
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                translateLocal,
                (digit) => toLocaleDigit(IntlStore.getCurrentLocale(), digit),
                getCurrencySymbol,
            );
        }
    }
    return transaction?.modifiedMerchant ? transaction.modifiedMerchant : (transaction?.merchant ?? '');
}

function getMerchantOrDescription(transaction: OnyxEntry<Transaction>) {
    return !isMerchantMissing(transaction) ? getMerchant(transaction) : getDescription(transaction);
}

/**
 * Return report owner as default attendee
 * @param transaction
 * @param currentUserPersonalDetails - personal details of current user - needed for unreported expenses to return current user as default attendee
 */
function getReportOwnerAsAttendee(transaction: OnyxInputOrEntry<Transaction>, currentUserPersonalDetails: CurrentUserPersonalDetails | undefined): Attendee | undefined {
    if (transaction?.reportID === undefined) {
        return;
    }

    // Get the creator of the transaction by looking at the owner of the report linked to the transaction
    const report = getReportOrDraftReport(transaction?.reportID);
    // For unreported expenses, the creator ID should belong to the current user because the transaction isn’t part of any report yet
    const creatorAccountID = isExpenseUnreported(transaction) ? currentUserPersonalDetails?.accountID : report?.ownerAccountID;

    if (creatorAccountID) {
        const [creatorDetails] = getPersonalDetailsByIDs({accountIDs: [creatorAccountID]});
        const creatorEmail = creatorDetails?.login ?? '';
        const creatorDisplayName = creatorDetails?.displayName ?? creatorEmail;

        if (creatorEmail) {
            return {
                email: creatorEmail,
                login: creatorEmail,
                displayName: creatorDisplayName,
                accountID: creatorAccountID,
                text: creatorDisplayName,
                searchText: creatorDisplayName,
                avatarUrl: creatorDetails?.avatarThumbnail ?? '',
                selected: true,
            };
        }
    }
}

/**
 * Return the list of attendees present on the transaction, if it's empty return report owner as default attendee
 * @param transaction
 * @param currentUserPersonalDetails - personal details of current user
 */
function getOriginalAttendees(transaction: OnyxInputOrEntry<Transaction>, currentUserPersonalDetails: CurrentUserPersonalDetails | undefined): Attendee[] {
    const attendees = transaction?.comment?.attendees ?? [];
    const reportOwnerAsAttendee = getReportOwnerAsAttendee(transaction, currentUserPersonalDetails);
    if (attendees.length === 0 && reportOwnerAsAttendee !== undefined) {
        attendees.push(reportOwnerAsAttendee);
    }
    return attendees;
}

/**
 * Return the list of modified attendees if present otherwise list of attendees
 * @param transaction
 * @param currentUserPersonalDetails - personal details of current user
 */
function getAttendees(transaction: OnyxInputOrEntry<Transaction>, currentUserPersonalDetails: CurrentUserPersonalDetails | undefined): Attendee[] {
    const attendees = transaction?.modifiedAttendees ? transaction.modifiedAttendees : (transaction?.comment?.attendees ?? []);
    const reportOwnerAsAttendee = getReportOwnerAsAttendee(transaction, currentUserPersonalDetails);

    if (attendees.length === 0 && reportOwnerAsAttendee !== undefined) {
        attendees.push(reportOwnerAsAttendee);
    }
    return attendees;
}

/**
 * Return the list of attendees as a string of display names/logins.
 */
function getAttendeesListDisplayString(attendees: Attendee[]): string {
    return attendees.map((item) => item.displayName ?? item.login).join(', ');
}

/**
 * Return the list of attendees as a string and modified list of attendees as a string if present.
 */
function getFormattedAttendees(modifiedAttendees?: Attendee[], attendees?: Attendee[]): [string, string] {
    const oldAttendees = modifiedAttendees ?? [];
    const newAttendees = attendees ?? [];
    return [getAttendeesListDisplayString(oldAttendees), getAttendeesListDisplayString(newAttendees)];
}

/**
 * Return the reimbursable value. Defaults to true to match BE logic.
 */
function getReimbursable(transaction: OnyxInputOrEntry<Transaction>): boolean {
    return transaction?.reimbursable ?? true;
}

/**
 * Return the mccGroup field from the transaction, return the modifiedMCCGroup if present.
 */
function getMCCGroup(transaction: Transaction): ValueOf<typeof CONST.MCC_GROUPS> | undefined {
    return transaction?.modifiedMCCGroup ? transaction.modifiedMCCGroup : transaction?.mccGroup;
}

/**
 * Return the waypoints field from the transaction, return the modifiedWaypoints if present.
 */
function getWaypoints(transaction: OnyxEntry<Transaction>): WaypointCollection | undefined {
    return transaction?.modifiedWaypoints ?? transaction?.comment?.waypoints;
}

/**
 * Return the category from the transaction. This "category" field has no "modified" complement.
 */
function getCategory(transaction: OnyxInputOrEntry<Transaction>): string {
    return transaction?.category ?? '';
}

/**
 * Return the cardID from the transaction.
 */
function getCardID(transaction: Transaction): number {
    return transaction?.cardID ?? CONST.DEFAULT_NUMBER_ID;
}

/**
 * Return the billable field from the transaction. This "billable" field has no "modified" complement.
 */
function getBillable(transaction: OnyxInputOrEntry<Transaction>): boolean {
    return transaction?.billable ?? false;
}

/**
 * Return a colon-delimited tag string as an array, considering escaped colons and double backslashes.
 */
function getTagArrayFromName(tagName: string): string[] {
    // WAIT!!!!!!!!!!!!!!!!!!
    // You need to keep this in sync with TransactionUtils.php

    // We need to be able to preserve double backslashes in the original string
    // and not have it interfere with splitting on a colon (:).
    // So, let's replace it with something absurd to begin with, do our split, and
    // then replace the double backslashes in the end.
    const tagWithoutDoubleSlashes = tagName.replaceAll('\\\\', '☠');
    const tagWithoutEscapedColons = tagWithoutDoubleSlashes.replaceAll('\\:', '☢');

    // Do our split
    const matches = tagWithoutEscapedColons.split(':');
    const newMatches: string[] = [];

    for (const item of matches) {
        const tagWithEscapedColons = item.replaceAll('☢', '\\:');
        const tagWithDoubleSlashes = tagWithEscapedColons.replaceAll('☠', '\\\\');
        newMatches.push(tagWithDoubleSlashes);
    }

    return newMatches;
}

/**
 * Returns the exchange rate for a transaction, based on its group
 */
function getExchangeRate(transaction: TransactionWithOptionalSearchFields) {
    const fromCurrency = getCurrency(transaction);
    const toCurrency = transaction.groupCurrency ?? fromCurrency;

    if (!transaction.groupExchangeRate) {
        return '';
    }

    if (Number(transaction.groupExchangeRate) === 1) {
        return '';
    }

    return transaction.groupExchangeRate ? `${transaction.groupExchangeRate} ${fromCurrency}/${toCurrency}` : '';
}

/**
 * Return the tag from the transaction. When the tagIndex is passed, return the tag based on the index.
 * This "tag" field has no "modified" complement.
 */
function getTag(transaction: OnyxInputOrEntry<Transaction>, tagIndex?: number): string {
    if (tagIndex !== undefined) {
        const tagsArray = getTagArrayFromName(transaction?.tag ?? '');
        return tagsArray.at(tagIndex) ?? '';
    }

    return transaction?.tag ?? '';
}

function getTagForDisplay(transaction: OnyxEntry<Transaction>, tagIndex?: number): string {
    return getCommaSeparatedTagNameWithSanitizedColons(getTag(transaction, tagIndex));
}

function getCreated(transaction: OnyxInputOrEntry<Transaction>): string {
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    return transaction?.modifiedCreated ? transaction.modifiedCreated : transaction?.created || '';
}

/**
 * Return the created field from the transaction, return the modifiedCreated if present.
 */
function getFormattedCreated(transaction: OnyxInputOrEntry<Transaction>, dateFormat: string = CONST.DATE.FNS_FORMAT_STRING): string {
    const created = getCreated(transaction);
    return DateUtils.formatWithUTCTimeZone(created, dateFormat);
}

/**
 * Determine whether a transaction is made with an Expensify card.
 */
function isExpensifyCardTransaction(transaction: OnyxEntry<Transaction>): boolean {
    return transaction?.bank === CONST.EXPENSIFY_CARD.BANK;
}

/**
 * Determine whether a transaction is made with a centrally managed card (Expensify or Company Card).
 */
function isManagedCardTransaction(transaction: OnyxEntry<Transaction>): boolean {
    return !!transaction?.managedCard;
}

/**
 * Determine whether a transaction is imported from a credit card.
 * This includes managed cards (Expensify/Company cards) and personal cards imported via bank connection.
 */
function isFromCreditCardImport(transaction: OnyxEntry<Transaction>): boolean {
    // This can be set in transactions found in the search snapshot
    if (transaction?.transactionType === CONST.SEARCH.TRANSACTION_TYPE.CARD) {
        return true;
    }

    if (transaction?.bank === CONST.COMPANY_CARDS.BANK_NAME.UPLOAD) {
        return false;
    }

    if (transaction?.cardName === CONST.EXPENSE.TYPE.CASH_CARD_NAME) {
        return false;
    }

    if (isManagedCardTransaction(transaction)) {
        return true;
    }

    if (transaction?.cardNumber) {
        return true;
    }

    if (transaction?.bank) {
        return true;
    }

    return false;
}

function getCardName(transaction: OnyxEntry<Transaction>): string {
    return transaction?.cardName ?? '';
}

/**
 * Check if the transaction status is set to Pending.
 */
function isPending(transaction: OnyxEntry<Transaction>): boolean {
    if (!transaction?.status) {
        return false;
    }
    return transaction.status === CONST.TRANSACTION.STATUS.PENDING;
}

/**
 * Check if the transaction status is set to Posted.
 */
function isPosted(transaction: Transaction): boolean {
    if (!transaction.status) {
        return false;
    }
    return transaction.status === CONST.TRANSACTION.STATUS.POSTED;
}

/**
 * The transaction is considered scanning if it is a partial transaction, has a receipt, and the receipt is being scanned.
 * Note that this does not include receipts that are being scanned in the background for auditing / smart scan everything, because there should be no indication to the user that the receipt is being scanned.
 */
function isScanning(transaction: OnyxEntry<Transaction>): boolean {
    return isPartialTransaction(transaction) && hasReceipt(transaction) && isReceiptBeingScanned(transaction);
}

function isReceiptBeingScanned(transaction: OnyxInputOrEntry<Transaction>): boolean {
    return [CONST.IOU.RECEIPT_STATE.SCAN_READY, CONST.IOU.RECEIPT_STATE.SCANNING].some((value) => value === transaction?.receipt?.state);
}

/**
 * Check if category is being analyzed (manual request creation or auto-categorization grace period)
 */
function isCategoryBeingAnalyzed(transaction: OnyxEntry<Transaction>): boolean {
    if (!transaction) {
        return false;
    }

    if (isExpenseUnreported(transaction)) {
        return false;
    }

    // Only consider analyzing if category is actually missing
    const category = getCategory(transaction);
    if (!isCategoryMissing(category)) {
        return false;
    }

    // Don't consider partial transactions (empty merchant and zero amount) as analyzing
    if (isMerchantMissing(transaction) && transaction.amount === 0) {
        return false;
    }

    // Invoice expense is not auto-categorized
    if (isInvoiceReport(transaction.reportID)) {
        return false;
    }

    const pendingAction = transaction.pendingAction;
    const pendingAutoCategorizationTime = transaction.comment?.pendingAutoCategorizationTime;

    // Check if manual request is being created
    if (pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD) {
        return true;
    }

    // Check if within auto-categorization grace period
    if (pendingAutoCategorizationTime && typeof pendingAutoCategorizationTime === 'string') {
        const pendingTime = new Date(`${pendingAutoCategorizationTime.replace(' ', 'T')}Z`);
        if (!Number.isNaN(pendingTime.getTime())) {
            const currentTime = new Date();
            const elapsedMs = currentTime.getTime() - pendingTime.getTime();
            const oneMinuteMs = 60 * 1000;
            return elapsedMs < oneMinuteMs;
        }
    }

    return false;
}

function didReceiptScanSucceed(transaction: OnyxEntry<Transaction>): boolean {
    return [CONST.IOU.RECEIPT_STATE.SCAN_COMPLETE].some((value) => value === transaction?.receipt?.state);
}

/**
 * Check if the transaction has a non-smart-scanning receipt and is missing required fields
 */
function hasMissingSmartscanFields(transaction: OnyxInputOrEntry<Transaction>, transactionReport: OnyxEntry<Report>): boolean {
    return !!(transaction && !isDistanceRequest(transaction) && !isReceiptBeingScanned(transaction) && areRequiredFieldsEmpty(transaction, transactionReport));
}

/**
 * Get all transaction violations of the transaction with given transactionID.
 */
function getTransactionViolations(
    transaction: OnyxEntry<Transaction>,
    transactionViolations: OnyxCollection<TransactionViolations>,
    currentUserEmail: string,
    currentUserAccountID: number,
    iouReport: OnyxEntry<Report>,
    policy: OnyxEntry<Policy>,
): TransactionViolations | undefined {
    if (!transaction || !transactionViolations) {
        return undefined;
    }

    const violations =
        transactionViolations?.[ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS + transaction.transactionID]?.filter(
            (violation) => !isViolationDismissed(transaction, violation, currentUserEmail, currentUserAccountID, iouReport, policy),
        ) ?? [];

    if (CONST.IS_ATTENDEES_REQUIRED_FEATURE_DISABLED) {
        return violations.filter((violation) => violation.name !== CONST.VIOLATIONS.MISSING_ATTENDEES);
    }

    return violations;
}

/**
 * Check if a transaction has been rejected
 */
function hasTransactionBeenRejected(transactionViolations: OnyxEntry<TransactionViolations>): boolean {
    return !!transactionViolations && transactionViolations.some((violation) => violation.name === CONST.VIOLATIONS.AUTO_REPORTED_REJECTED_EXPENSE);
}

/**
 * Check if there is pending rter violation in transactionViolations.
 */
function hasPendingRTERViolation(transactionViolations?: TransactionViolations | null): boolean {
    return !!transactionViolations?.some(
        (transactionViolation: TransactionViolation) =>
            transactionViolation.name === CONST.VIOLATIONS.RTER &&
            transactionViolation.data?.pendingPattern &&
            transactionViolation.data?.rterType !== CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION &&
            transactionViolation.data?.rterType !== CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION_530,
    );
}

/**
 * Check if there is a custom unit out of policy violation in transactionViolations.
 */
function hasCustomUnitOutOfPolicyViolation(transactionViolations?: TransactionViolations | null): boolean {
    return !!transactionViolations?.some((violation) => violation.name === CONST.VIOLATIONS.CUSTOM_UNIT_OUT_OF_POLICY);
}

/**
 * Check if there is broken connection violation.
 */
function hasBrokenConnectionViolation(
    transaction: Transaction,
    transactionViolations: OnyxCollection<TransactionViolations> | undefined,
    currentUserEmail: string,
    currentUserAccountID: number,
    report: OnyxEntry<Report>,
    policy: OnyxEntry<Policy>,
): boolean {
    const violations = getTransactionViolations(transaction, transactionViolations, currentUserEmail, currentUserAccountID, report, policy);
    return !!violations?.find((violation) => isBrokenConnectionViolation(violation));
}

function isBrokenConnectionViolation(violation: TransactionViolation) {
    return (
        violation.name === CONST.VIOLATIONS.RTER &&
        (violation.data?.rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION || violation.data?.rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION_530)
    );
}

function shouldShowBrokenConnectionViolationInternal(brokenConnectionViolations: TransactionViolation[], report: OnyxEntry<Report>, policy: OnyxEntry<Policy>) {
    if (brokenConnectionViolations.length === 0) {
        return false;
    }

    if (!isPolicyAdmin(policy) || isCurrentUserSubmitter(report)) {
        return true;
    }

    if (isOpenExpenseReport(report)) {
        return true;
    }

    return isProcessingReport(report) && isInstantSubmitEnabled(policy);
}

/**
 * Check if user should see broken connection violation warning based on violations list.
 */
function shouldShowBrokenConnectionViolation(report: OnyxEntry<Report>, policy: OnyxEntry<Policy>, transactionViolations: TransactionViolation[]): boolean {
    const brokenConnectionViolations = transactionViolations.filter((violation) => isBrokenConnectionViolation(violation));

    return shouldShowBrokenConnectionViolationInternal(brokenConnectionViolations, report, policy);
}

/**
 * Check if user should see broken connection violation warning based on selected transactions.
 */
function shouldShowBrokenConnectionViolationForMultipleTransactions(
    transactions: Transaction[],
    report: OnyxEntry<Report>,
    policy: OnyxEntry<Policy>,
    transactionViolations: OnyxCollection<TransactionViolation[]>,
    currentUserEmail: string,
    currentUserAccountID: number,
): boolean {
    const brokenConnectionViolations = transactions.flatMap((transaction) => {
        const violations = transactionViolations?.[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction.transactionID}`] ?? [];

        if (!transaction) {
            return [];
        }

        return violations.filter((violation) => {
            if (!isBrokenConnectionViolation(violation)) {
                return false;
            }

            if (isViolationDismissed(transaction, violation, currentUserEmail, currentUserAccountID, report, policy)) {
                return false;
            }

            return shouldShowViolation(report, policy, violation.name, currentUserEmail, true, transaction);
        });
    });

    return shouldShowBrokenConnectionViolationInternal(brokenConnectionViolations, report, policy);
}

/**
 * Merge prohibited violations into one violation.
 */
function mergeProhibitedViolations(transactionViolations: TransactionViolations): TransactionViolations {
    const prohibitedViolations = transactionViolations.filter((violation: TransactionViolation) => violation.name === CONST.VIOLATIONS.PROHIBITED_EXPENSE);

    if (prohibitedViolations.length === 0) {
        return transactionViolations;
    }

    const prohibitedExpenses = prohibitedViolations.flatMap((violation: TransactionViolation) => violation.data?.prohibitedExpenseRule ?? []);
    const mergedProhibitedViolations: TransactionViolation = {
        name: CONST.VIOLATIONS.PROHIBITED_EXPENSE,
        data: {
            prohibitedExpenseRule: prohibitedExpenses,
        },
        type: CONST.VIOLATION_TYPES.VIOLATION,
    };

    return [...transactionViolations.filter((violation: TransactionViolation) => violation.name !== CONST.VIOLATIONS.PROHIBITED_EXPENSE), mergedProhibitedViolations];
}

/**
 * Check if the user should see the violation
 */
function shouldShowViolation(
    iouReport: OnyxEntry<Report>,
    policy: OnyxEntry<Policy>,
    violationName: ViolationName,
    currentUserEmail: string,
    shouldShowRterForSettledReport = true,
    transaction?: OnyxEntry<Transaction>,
): boolean {
    const isSubmitter = isCurrentUserSubmitter(iouReport);
    const isPolicyMember = isPolicyMemberPolicyUtils(policy, currentUserEmail);
    const isReportOpen = isOpenExpenseReport(iouReport);
    const isAttendeeTrackingEnabled = policy?.isAttendeeTrackingEnabled ?? false;

    if (violationName === CONST.VIOLATIONS.AUTO_REPORTED_REJECTED_EXPENSE) {
        return isSubmitter || isPolicyAdmin(policy);
    }

    if (violationName === CONST.VIOLATIONS.OVER_AUTO_APPROVAL_LIMIT) {
        return isPolicyAdmin(policy) && !isSubmitter && isProcessingReport(iouReport);
    }

    if (violationName === CONST.VIOLATIONS.RTER) {
        return (isSubmitter || isInstantSubmitEnabled(policy)) && (shouldShowRterForSettledReport || !isSettled(iouReport));
    }

    if (violationName === CONST.VIOLATIONS.RECEIPT_NOT_SMART_SCANNED) {
        return isPolicyMember && !isSubmitter && !isReportOpen;
    }

    if (violationName === CONST.VIOLATIONS.MISSING_ATTENDEES) {
        return isAttendeeTrackingEnabled;
    }

    if (violationName === CONST.VIOLATIONS.MISSING_CATEGORY && isCategoryBeingAnalyzed(transaction)) {
        return false;
    }

    return true;
}

/**
 * Check if there is pending rter violation in all transactionViolations with given transactionIDs.
 */
function allHavePendingRTERViolation(
    transactions: OnyxEntry<Transaction[]>,
    transactionViolations: OnyxCollection<TransactionViolations> | undefined,
    currentUserEmail: string,
    currentUserAccountID: number,
    report: OnyxEntry<Report>,
    policy: OnyxEntry<Policy>,
): boolean {
    if (!transactions) {
        return false;
    }

    const transactionsWithRTERViolations = transactions.map((transaction) => {
        // Get violations not dismissed by current user
        const filteredTransactionViolations = getTransactionViolations(transaction, transactionViolations, currentUserEmail, currentUserAccountID, report, policy)?.filter((violation) =>
            // Further filter to only violations visible to the current user
            shouldShowViolation(report, policy, violation.name, currentUserEmail, true, transaction),
        );
        // Check if there is pending rter violation in the filtered violations
        return hasPendingRTERViolation(filteredTransactionViolations);
    });
    return transactionsWithRTERViolations.length > 0 && transactionsWithRTERViolations.every((value) => value === true);
}

function checkIfShouldShowMarkAsCashButton(hasRTERPendingViolation: boolean, shouldDisplayBrokenConnectionViolation: boolean, report: OnyxEntry<Report>, policy: OnyxEntry<Policy>) {
    if (hasRTERPendingViolation) {
        return true;
    }
    return shouldDisplayBrokenConnectionViolation && (!isPolicyAdmin(policy) || isCurrentUserSubmitter(report)) && !isReportApproved({report}) && !isReportManuallyReimbursed(report);
}

/**
 * Check if there is any transaction without RTER violation within the given transactionIDs.
 */
function hasAnyTransactionWithoutRTERViolation(
    transactions: Transaction[],
    transactionViolations: OnyxCollection<TransactionViolations> | undefined,
    currentUserEmail: string,
    currentUserAccountID: number,
    report: OnyxEntry<Report>,
    policy: OnyxEntry<Policy>,
): boolean {
    return (
        transactions.length > 0 &&
        transactions.some((transaction) => {
            return !hasBrokenConnectionViolation(transaction, transactionViolations, currentUserEmail, currentUserAccountID, report, policy);
        })
    );
}

/**
 * Check if the transaction is pending or has a pending rter violation.
 */
function hasPendingUI(transaction: OnyxEntry<Transaction>, transactionViolations?: TransactionViolations | null): boolean {
    return isScanning(transaction) || isPending(transaction) || (!!transaction && hasPendingRTERViolation(transactionViolations));
}

/**
 * Check if the transaction has a defined route
 */
function hasRoute(transaction: OnyxEntry<Transaction>, isDistanceRequestType?: boolean): boolean {
    return !!transaction?.routes?.route0?.geometry?.coordinates || (!!isDistanceRequestType && transaction?.comment?.customUnit?.quantity !== undefined);
}

function waypointHasValidAddress(waypoint: RecentWaypoint | Waypoint): boolean {
    return !!waypoint?.address?.trim();
}

function isWaypointNullIsland(waypoint: RecentWaypoint | Waypoint): boolean {
    return waypoint.lat === 0 && waypoint.lng === 0;
}

/**
 * Converts the key of a waypoint to its index
 */
function getWaypointIndex(key: string): number {
    return Number(key.replace('waypoint', ''));
}

/**
 * Filters the waypoints which are valid and returns those
 */
function getValidWaypoints(waypoints: WaypointCollection | undefined, reArrangeIndexes = false): WaypointCollection {
    if (!waypoints) {
        return {};
    }

    const sortedIndexes = Object.keys(waypoints)
        .map(getWaypointIndex)
        .sort((a, b) => a - b);
    const waypointValues = sortedIndexes.map((index) => waypoints[`waypoint${index}`]);
    // Ensure the number of waypoints is between 2 and 25
    if (waypointValues.length < 2 || waypointValues.length > 25) {
        return {};
    }

    let lastWaypointIndex = -1;
    let waypointIndex = -1;

    return waypointValues.reduce<WaypointCollection>((acc, currentWaypoint, index) => {
        // Array.at(-1) returns the last element of the array
        // If a user does a round trip, the last waypoint will be the same as the first waypoint
        // We want to avoid comparing them as this will result in an incorrect duplicate waypoint error.
        const previousWaypoint = lastWaypointIndex !== -1 ? waypointValues.at(lastWaypointIndex) : undefined;

        // Check if the waypoint has a valid address
        if (!waypointHasValidAddress(currentWaypoint)) {
            return acc;
        }

        // Exclude null island
        if (isWaypointNullIsland(currentWaypoint)) {
            return acc;
        }

        // Check for adjacent waypoints with the same address or coordinate
        const previousCoordinate: Coordinate | undefined = previousWaypoint?.lng && previousWaypoint?.lat ? [previousWaypoint.lng, previousWaypoint.lat] : undefined;
        const currentCoordinate: Coordinate | undefined = currentWaypoint.lng && currentWaypoint.lat ? [currentWaypoint.lng, currentWaypoint.lat] : undefined;
        if (
            previousWaypoint &&
            (currentWaypoint?.address === previousWaypoint.address || (previousCoordinate && currentCoordinate && utils.areSameCoordinate(previousCoordinate, currentCoordinate)))
        ) {
            return acc;
        }

        acc[`waypoint${reArrangeIndexes ? waypointIndex + 1 : index}`] = currentWaypoint;

        lastWaypointIndex = index;
        waypointIndex += 1;

        return acc;
    }, {});
}

/**
 * Returns the most recent transactions in an object
 */
function getRecentTransactions(transactions: Record<string, string>, size = 2): string[] {
    return Object.keys(transactions)
        .sort((transactionID1, transactionID2) => (new Date(transactions[transactionID1]) < new Date(transactions[transactionID2]) ? 1 : -1))
        .slice(0, size);
}

/**
 * Check if transaction has duplicatedTransaction violation.
 * @param transactionID - the transaction to check
 */
function isDuplicate(
    transaction: OnyxEntry<Transaction>,
    currentUserEmail: string,
    currentUserAccountID: number,
    iouReport: OnyxEntry<Report>,
    policy: OnyxEntry<Policy>,
    transactionViolation: OnyxEntry<TransactionViolations>,
): boolean {
    if (!transaction) {
        return false;
    }
    const duplicatedTransactionViolation = transactionViolation?.find((violation: TransactionViolation) => violation.name === CONST.VIOLATIONS.DUPLICATED_TRANSACTION);
    const hasDuplicatedTransactionViolation = !!duplicatedTransactionViolation;
    const isDuplicatedTransactionViolationDismissed = isViolationDismissed(transaction, duplicatedTransactionViolation, currentUserEmail, currentUserAccountID, iouReport, policy);

    return hasDuplicatedTransactionViolation && !isDuplicatedTransactionViolationDismissed;
}

/**
 * Check if transaction is on hold
 */
function isOnHold(transaction: OnyxEntry<Transaction>): boolean {
    if (!transaction) {
        return false;
    }

    return !!transaction.comment?.hold;
}

/**
 * Checks if a violation is dismissed for the given transaction.
 */
function isViolationDismissed(
    transaction: OnyxEntry<Transaction>,
    violation: TransactionViolation | undefined,
    currentUserEmail: string,
    currentUserAccountID: number,
    iouReport: OnyxEntry<Report>,
    policy: OnyxEntry<Policy>,
): boolean {
    if (!transaction || !violation) {
        return false;
    }

    const violationDismissals = transaction.comment?.dismissedViolations?.[violation.name];
    if (!violationDismissals) {
        return false;
    }

    const dismissedByEmails = Object.keys(violationDismissals);

    // Current user dismissed it themselves
    if (dismissedByEmails.includes(currentUserEmail)) {
        return true;
    }

    // RTER violations on instant submit reports only need to be dismissed by one person to be considered dismissed
    if (violation.name === CONST.VIOLATIONS.RTER && policy && isInstantSubmitEnabled(policy)) {
        return dismissedByEmails.length > 0;
    }

    // If the admin is looking at an open report, we check for both, submitter and admin.
    if (!iouReport) {
        return false;
    }

    const isSubmitter = iouReport.ownerAccountID === currentUserAccountID;
    const shouldViewAsSubmitter = !isSubmitter && isOpenExpenseReport(iouReport);

    if (shouldViewAsSubmitter && iouReport.ownerAccountID) {
        const reportOwnerEmail = getLoginsByAccountIDs([iouReport.ownerAccountID]).at(0);
        if (reportOwnerEmail && dismissedByEmails.includes(reportOwnerEmail)) {
            return true;
        }
    }

    return false;
}

/**
 * Checks if violations are supported for the given transaction
 */
function doesTransactionSupportViolations(transaction: Transaction | undefined): transaction is Transaction {
    if (!transaction) {
        return false;
    }
    return true;
}

/**
 * Checks if any violations for the provided transaction are of type 'violation'
 */
function hasViolation(
    transaction: Transaction | undefined,
    transactionViolations: TransactionViolation[] | OnyxCollection<TransactionViolation[]>,
    currentUserEmail: string,
    currentUserAccountID: number,
    iouReport: OnyxEntry<Report>,
    policy: OnyxEntry<Policy>,
    showInReview?: boolean,
): boolean {
    if (!doesTransactionSupportViolations(transaction)) {
        return false;
    }
    const violations = Array.isArray(transactionViolations) ? transactionViolations : transactionViolations?.[ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS + transaction.transactionID];

    return !!violations?.some(
        (violation) =>
            violation.type === CONST.VIOLATION_TYPES.VIOLATION &&
            (showInReview === undefined || showInReview === (violation.showInReview ?? false)) &&
            !isViolationDismissed(transaction, violation, currentUserEmail, currentUserAccountID, iouReport, policy) &&
            (!CONST.IS_ATTENDEES_REQUIRED_FEATURE_DISABLED || violation.name !== CONST.VIOLATIONS.MISSING_ATTENDEES),
    );
}

function hasDuplicateTransactions(
    currentUserEmail: string,
    currentUserAccountID: number,
    iouReport: OnyxEntry<Report>,
    policy: OnyxEntry<Policy>,
    allTransactionViolations: OnyxCollection<TransactionViolation[]>,
): boolean {
    const transactionsByIouReportID = getReportTransactions(iouReport?.reportID);
    const reportTransactions = transactionsByIouReportID;

    return (
        reportTransactions.length > 0 &&
        reportTransactions.some((transaction) =>
            isDuplicate(
                transaction,
                currentUserEmail,
                currentUserAccountID,
                iouReport,
                policy,
                allTransactionViolations?.[ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS + transaction.transactionID],
            ),
        )
    );
}

/**
 * Checks if any violations for the provided transaction are of type 'notice'
 */
function hasNoticeTypeViolation(
    transaction: OnyxEntry<Transaction>,
    transactionViolations: TransactionViolation[] | OnyxCollection<TransactionViolation[]>,
    currentUserEmail: string,
    currentUserAccountID: number,
    iouReport: OnyxEntry<Report>,
    policy: OnyxEntry<Policy>,
    showInReview?: boolean,
): boolean {
    if (!doesTransactionSupportViolations(transaction)) {
        return false;
    }
    const violations = Array.isArray(transactionViolations) ? transactionViolations : transactionViolations?.[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction?.transactionID}`];

    return !!violations?.some(
        (violation: TransactionViolation) =>
            violation.type === CONST.VIOLATION_TYPES.NOTICE &&
            (showInReview === undefined || showInReview === (violation.showInReview ?? false)) &&
            !isViolationDismissed(transaction, violation, currentUserEmail, currentUserAccountID, iouReport, policy),
    );
}

/**
 * Checks if any violations for the provided transaction are of type 'warning'
 */
function hasWarningTypeViolation(
    transaction: OnyxEntry<Transaction>,
    transactionViolations: TransactionViolation[] | OnyxCollection<TransactionViolation[]>,
    currentUserEmail: string,
    currentUserAccountID: number,
    iouReport: OnyxEntry<Report>,
    policy: OnyxEntry<Policy>,
    showInReview?: boolean,
): boolean {
    if (!doesTransactionSupportViolations(transaction)) {
        return false;
    }
    const violations = Array.isArray(transactionViolations) ? transactionViolations : transactionViolations?.[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transaction?.transactionID}`];

    const warningTypeViolations =
        violations?.filter(
            (violation: TransactionViolation) =>
                violation.type === CONST.VIOLATION_TYPES.WARNING &&
                (showInReview === undefined || showInReview === (violation.showInReview ?? false)) &&
                !isViolationDismissed(transaction, violation, currentUserEmail, currentUserAccountID, iouReport, policy),
        ) ?? [];

    return warningTypeViolations.length > 0;
}

/**
 * Calculates tax amount from the given expense amount and tax percentage
 */
function calculateTaxAmount(percentage: string | undefined, amount: number, currency: string) {
    if (!percentage) {
        return 0;
    }

    const divisor = Number(percentage.slice(0, -1)) / 100 + 1;
    const taxAmount = (amount - amount / divisor) / 100;
    const decimals = getCurrencyDecimals(currency);
    return parseFloat(taxAmount.toFixed(decimals));
}

/**
 * Calculates count of all tax enabled options
 */
function getEnabledTaxRateCount(options: TaxRates) {
    return Object.values(options).filter((option: TaxRate) => !option.isDisabled).length;
}

/**
 * Check if the customUnitRateID has a value default for P2P distance requests
 */
function isCustomUnitRateIDForP2P(transaction: OnyxInputOrEntry<Transaction>): boolean {
    return transaction?.comment?.customUnit?.customUnitRateID === CONST.CUSTOM_UNITS.FAKE_P2P_ID;
}

function hasReservationList(transaction: Transaction | undefined | null): boolean {
    return !!transaction?.receipt?.reservationList && transaction?.receipt?.reservationList.length > 0;
}

/**
 * Whether an expense is going to be paid later, either at checkout for hotels or drop off for car rental
 */
function isPayAtEndExpense(transaction: Transaction | undefined | null): boolean {
    return !!transaction?.receipt?.reservationList?.some((reservation) => reservation.paymentType === 'PAY_AT_HOTEL' || reservation.paymentType === 'PAY_AT_VENDOR');
}

/**
 * Get custom unit rate (distance rate) ID from the transaction object
 */
function getRateID(transaction: OnyxInputOrEntry<Transaction>): string {
    return transaction?.comment?.customUnit?.customUnitRateID ?? CONST.CUSTOM_UNITS.FAKE_P2P_ID;
}

/**
 * Gets the tax code based on the type of transaction and selected currency.
 * If it is distance request, then returns the tax code corresponding to the custom unit rate
 * Else returns policy default tax rate if transaction is in policy default currency, otherwise foreign default tax rate
 */
function getDefaultTaxCode(policy: OnyxEntry<Policy>, transaction: OnyxEntry<Transaction>, currency?: string | undefined): string | undefined {
    if (isDistanceRequest(transaction)) {
        const customUnitRateID = getRateID(transaction) ?? '';
        const customUnitRate = getDistanceRateCustomUnitRate(policy, customUnitRateID);
        const customUnit = getDistanceRateCustomUnit(policy);
        if (!customUnitRate?.attributes?.taxRateExternalID && customUnit?.attributes?.taxEnabled) {
            return policy?.taxRates?.defaultExternalID;
        }
        return customUnitRate?.attributes?.taxRateExternalID;
    }
    const defaultExternalID = policy?.taxRates?.defaultExternalID;
    const foreignTaxDefault = policy?.taxRates?.foreignTaxDefault;
    return policy?.outputCurrency === (currency ?? getCurrency(transaction)) ? defaultExternalID : foreignTaxDefault;
}

/**
 * Transforms tax rates to a new object format - to add codes and new name with concatenated name and value.
 *
 * @param  policy - The policy which the user has access to and which the report is tied to.
 * @returns The transformed tax rates object.g
 */
function transformedTaxRates(policy: OnyxEntry<Policy> | undefined, transaction?: OnyxEntry<Transaction>): Record<string, TaxRate> {
    const taxRates = policy?.taxRates;
    const defaultExternalID = taxRates?.defaultExternalID;

    const defaultTaxCode = () => {
        if (!transaction) {
            return defaultExternalID;
        }

        return policy && getDefaultTaxCode(policy, transaction);
    };
    // eslint-disable-next-line @typescript-eslint/no-deprecated
    const getModifiedName = (data: TaxRate, code: string) => `${data.name} (${data.value})${defaultTaxCode() === code ? ` ${CONST.DOT_SEPARATOR} ${translateLocal('common.default')}` : ''}`;
    const taxes = Object.fromEntries(Object.entries(taxRates?.taxes ?? {}).map(([code, data]) => [code, {...data, code, modifiedName: getModifiedName(data, code), name: data.name}]));
    return taxes;
}

/**
 * Gets the tax value of a selected tax
 */
function getTaxValue(policy: OnyxEntry<Policy>, transaction: OnyxEntry<Transaction>, taxCode: string) {
    return Object.values(transformedTaxRates(policy, transaction)).find((taxRate) => taxRate.code === taxCode)?.value;
}

/**
 * Gets the tax name for Workspace Taxes Settings
 */
function getWorkspaceTaxesSettingsName(policy: OnyxEntry<Policy>, taxCode: string) {
    return Object.values(transformedTaxRates(policy)).find((taxRate) => taxRate.code === taxCode)?.modifiedName;
}

/**
 * Gets the name corresponding to the taxCode that is displayed to the user
 */
function getTaxName(policy: OnyxEntry<Policy>, transaction: OnyxEntry<Transaction>, shouldFallbackToValue = false) {
    const defaultTaxCode = getDefaultTaxCode(policy, transaction);

    // transaction?.taxCode may be an empty string
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const taxRate = Object.values(transformedTaxRates(policy, transaction)).find((rate) => rate.code === (transaction?.taxCode || defaultTaxCode));

    if (shouldFallbackToValue && transaction?.taxValue !== undefined && taxRate?.value !== transaction?.taxValue) {
        return transaction?.taxValue;
    }

    return taxRate?.modifiedName;
}

type FieldsToCompare = Record<string, Array<keyof Transaction>>;
type FieldsToChange = {
    category?: Array<string | undefined>;
    merchant?: Array<string | undefined>;
    tag?: Array<string | undefined>;
    description?: Array<Comment | undefined>;
    taxCode?: Array<string | undefined>;
    billable?: Array<boolean | undefined>;
    reimbursable?: Array<boolean | undefined>;
};

/**
 * Extracts a set of valid duplicate transaction IDs associated with a given transaction,
 * excluding:
 * - the transaction itself
 * - duplicate IDs that appear more than once
 * - duplicates referencing missing or invalid transactions
 * - settled or approved transactions
 *
 * @param transactionID - The ID of the transaction being validated.
 * @param transactionCollection - A collection of all transactions and their duplicates.
 * @param currentTransactionViolations - The list of violations associated with this transaction.
 * @returns A set of valid duplicate transaction IDs.
 */
function getValidDuplicateTransactionIDs(transactionID: string, transactionCollection: OnyxCollection<Transaction>, currentTransactionViolations: TransactionViolation[]): Set<string> {
    const result = new Set<string>();
    const seen = new Set<string>();
    let foundDuplicateViolation = false;

    if (!transactionCollection) {
        return result;
    }

    for (const violation of currentTransactionViolations) {
        if (violation.name !== CONST.VIOLATIONS.DUPLICATED_TRANSACTION) {
            continue;
        }

        // Skip further violations
        if (foundDuplicateViolation) {
            Log.warn(`Multiple duplicate violations found for transaction. Only one expected.`, {transactionID});
            break;
        }

        foundDuplicateViolation = true;
        const duplicatesIDs = violation.data?.duplicates ?? [];

        const validTransactions: Transaction[] = [];

        for (const duplicateID of duplicatesIDs) {
            // Skip self-reference
            if (duplicateID === transactionID || seen.has(duplicateID)) {
                continue;
            }
            seen.add(duplicateID);

            const transaction = transactionCollection?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${duplicateID}`];
            if (!transaction?.transactionID) {
                Log.warn(`Transaction does not exist or is invalid. Found in transaction.`, {duplicateID, transactionID});
                continue;
            }

            validTransactions.push(transaction);
        }

        // Filter out transactions assumed that they have be reviewed by removing settled and approved transactions
        const filtered = removeSettledAndApprovedTransactions(validTransactions);

        for (const transaction of filtered) {
            result.add(transaction.transactionID);
        }
    }

    return result;
}

/**
 * Adds onyx updates to the passed onyxData to update the DUPLICATED_TRANSACTION violation data
 * by removing the passed transactionID from any violation that referenced it.
 * @param onyxData - An object to store optimistic and failure updates.
 * @param transactionID - The ID of the transaction being deleted or updated.
 * @param transactions - A collection of all transactions and their duplicates.
 * @param transactionViolations - The collection of the transaction violations including the duplicates violations.
 *
 */
function removeTransactionFromDuplicateTransactionViolation(
    onyxData: OnyxData<OnyxKey>,
    transactionID: string,
    transactions: OnyxCollection<Transaction>,
    transactionViolations: OnyxCollection<TransactionViolations>,
) {
    if (!transactionID || !transactions || !transactionViolations) {
        return;
    }
    const violations = transactionViolations[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`];

    if (!violations) {
        return;
    }

    const duplicateIDs = getValidDuplicateTransactionIDs(transactionID, transactions, violations);

    for (const duplicateID of duplicateIDs) {
        const duplicateViolations = transactionViolations[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${duplicateID}`];

        if (!duplicateViolations) {
            continue;
        }

        const duplicateTransactionViolations = duplicateViolations.filter((violation) => violation.name === CONST.VIOLATIONS.DUPLICATED_TRANSACTION);

        if (duplicateTransactionViolations.length === 0) {
            continue;
        }

        if (duplicateTransactionViolations.length > 1) {
            Log.warn(`There are  duplicate transaction violations for transactionID. This should not happen.`, {duplicateTransactionViolations, duplicateID});
            continue;
        }

        const duplicateTransactionViolation = duplicateTransactionViolations.at(0);
        if (!duplicateTransactionViolation?.data?.duplicates) {
            continue;
        }

        // If the transactionID is not in the duplicates list, we don't need to update the violation
        const duplicateTransactionIDs = duplicateTransactionViolation.data.duplicates.filter((duplicateTransactionID) => duplicateTransactionID !== transactionID);
        if (duplicateTransactionIDs.length === duplicateTransactionViolation.data.duplicates.length) {
            continue;
        }

        const optimisticViolations = duplicateTransactionViolations.filter((violation) => violation.name !== CONST.VIOLATIONS.DUPLICATED_TRANSACTION);

        if (duplicateTransactionIDs.length > 0) {
            optimisticViolations.push({
                ...duplicateTransactionViolation,
                data: {
                    ...duplicateTransactionViolation.data,
                    duplicates: duplicateTransactionIDs,
                },
            });
        }

        onyxData.optimisticData?.push({
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${duplicateID}`,
            value: optimisticViolations.length > 0 ? optimisticViolations : null,
        });

        onyxData.failureData?.push({
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${duplicateID}`,
            value: duplicateViolations,
        });
    }
}

function removeSettledAndApprovedTransactions(transactions: Array<OnyxEntry<Transaction>>): Transaction[] {
    return transactions.filter((transaction) => !!transaction && !isSettled(transaction?.reportID) && !isReportIDApproved(transaction?.reportID)) as Transaction[];
}

/**
 * This function compares fields of duplicate transactions and determines which fields should be kept and which should be changed.
 *
 * @returns An object with two properties: 'keep' and 'change'.
 * 'keep' is an object where each key is a field name and the value is the value of that field in the transaction that should be kept.
 * 'change' is an object where each key is a field name and the value is an array of different values of that field in the duplicate transactions.
 *
 * The function works as follows:
 * 1. It fetches the transaction violations for the given transaction ID.
 * 2. It finds the duplicate transactions.
 * 3. It creates two empty objects, 'keep' and 'change'.
 * 4. It defines the fields to compare in the transactions.
 * 5. It iterates over the fields to compare. For each field:
 *    - If the field is 'description', it checks if all comments are equal, exist, or are empty. If so, it keeps the first transaction's comment. Otherwise, it finds the different values and adds them to 'change'.
 *    - For other fields, it checks if all fields are equal. If so, it keeps the first transaction's field value. Otherwise, it finds the different values and adds them to 'change'.
 * 6. It returns the 'keep' and 'change' objects.
 */

function compareDuplicateTransactionFields(
    reviewingTransaction?: OnyxEntry<Transaction>,
    duplicates?: Array<OnyxEntry<Transaction>>,
    report?: OnyxEntry<Report>,
    selectedTransactionID?: string,
    policyCategories?: PolicyCategories,
): {keep: Partial<ReviewDuplicates>; change: FieldsToChange} {
    const reportID = report?.reportID;
    const reviewingTransactionID = reviewingTransaction?.transactionID;
    if (!reviewingTransactionID || !reportID) {
        return {change: {}, keep: {}};
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const keep: Record<string, any> = {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const change: Record<string, any[]> = {};
    if (!reviewingTransactionID || !reportID) {
        return {keep, change};
    }
    const transactions = removeSettledAndApprovedTransactions([reviewingTransaction, ...(duplicates ?? [])]);

    const fieldsToCompare: FieldsToCompare = {
        merchant: ['modifiedMerchant', 'merchant'],
        category: ['category'],
        tag: ['tag'],
        description: ['comment'],
        taxCode: ['taxCode'],
        billable: ['billable'],
        reimbursable: ['reimbursable'],
    };

    // Helper function thats create an array of different values for a given key in the transactions
    function getDifferentValues(items: Array<OnyxEntry<Transaction>>, keys: Array<keyof Transaction>) {
        return [
            ...new Set(
                items
                    .map((item) => {
                        // Prioritize modifiedMerchant over merchant
                        if (keys.includes('modifiedMerchant' as keyof Transaction) && keys.includes('merchant' as keyof Transaction)) {
                            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                            return getMerchant(item);
                        }
                        return keys.map((key) => item?.[key]);
                    })
                    .flat(),
            ),
        ];
    }

    // Helper function to check if all comments are equal
    function areAllCommentsEqual(items: Array<OnyxEntry<Transaction>>, firstTransaction: OnyxEntry<Transaction>) {
        return items.every((item) => deepEqual(getDescription(item), getDescription(firstTransaction)));
    }

    // Helper function to check if all fields are equal for a given key
    function areAllFieldsEqual(items: Array<OnyxEntry<Transaction>>, keyExtractor: (item: OnyxEntry<Transaction>) => string) {
        const firstTransaction = transactions.at(0);
        return items.every((item) => keyExtractor(item) === keyExtractor(firstTransaction));
    }

    // Helper function to process changes
    function processChanges(fieldName: string, items: Array<OnyxEntry<Transaction>>, keys: Array<keyof Transaction>) {
        const differentValues = getDifferentValues(items, keys);
        if (differentValues.length > 0) {
            change[fieldName] = differentValues;
        }
    }

    // The comment object needs to be stored only when selecting a specific transaction to keep.
    // It contains details such as 'customUnit' and 'waypoints,' which remain unchanged during the review steps
    // but are essential for displaying complete information on the confirmation page.
    if (selectedTransactionID) {
        const selectedTransaction = transactions.find((t) => t?.transactionID === selectedTransactionID);
        keep.comment = selectedTransaction?.comment ?? {};
    }

    for (const fieldName in fieldsToCompare) {
        if (Object.prototype.hasOwnProperty.call(fieldsToCompare, fieldName)) {
            const keys = fieldsToCompare[fieldName];
            const firstTransaction = transactions.at(0);
            const isFirstTransactionCommentEmptyObject = typeof firstTransaction?.comment === 'object' && firstTransaction?.comment?.comment === '';
            // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
            // eslint-disable-next-line @typescript-eslint/no-deprecated
            const policy = getPolicy(report?.policyID);

            const areAllFieldsEqualForKey = areAllFieldsEqual(transactions, (item) => keys.map((key) => SafeString(item?.[key])).join('|'));
            if (fieldName === 'description') {
                const allCommentsAreEqual = areAllCommentsEqual(transactions, firstTransaction);
                const allCommentsAreEmpty = isFirstTransactionCommentEmptyObject && transactions.every((item) => getDescription(item) === '');
                if (allCommentsAreEqual || allCommentsAreEmpty) {
                    keep[fieldName] = firstTransaction?.comment?.comment ?? firstTransaction?.comment;
                } else {
                    processChanges(fieldName, transactions, keys);
                }
            } else if (fieldName === 'merchant') {
                if (areAllFieldsEqual(transactions, getMerchant)) {
                    keep[fieldName] = getMerchant(firstTransaction);
                } else {
                    processChanges(fieldName, transactions, keys);
                }
            } else if (fieldName === 'taxCode') {
                const differentValues = getDifferentValues(transactions, keys);
                const validTaxes = differentValues?.filter((taxID) => {
                    const tax = getTaxByID(policy, (taxID as string) ?? '');
                    return tax?.name && !tax.isDisabled && tax.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
                });

                if (!areAllFieldsEqualForKey && validTaxes.length > 1) {
                    change[fieldName] = validTaxes;
                } else if (areAllFieldsEqualForKey) {
                    keep[fieldName] = firstTransaction?.[keys[0]] ?? firstTransaction?.[keys[1]];
                }
            } else if (fieldName === 'category') {
                const differentValues = getDifferentValues(transactions, keys);
                const availableCategories = Object.values(policyCategories ?? {})
                    .filter((category) => differentValues.includes(category.name) && category.enabled && category.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE)
                    .map((e) => e.name);

                if (!areAllFieldsEqualForKey && policy?.areCategoriesEnabled && (availableCategories.length > 1 || (availableCategories.length === 1 && differentValues.includes('')))) {
                    change[fieldName] = [...availableCategories, ...(differentValues.includes('') ? [''] : [])];
                } else if (areAllFieldsEqualForKey) {
                    keep[fieldName] = firstTransaction?.[keys[0]] ?? firstTransaction?.[keys[1]];
                }
            } else if (fieldName === 'tag') {
                // TODO: Replace getPolicyTagsData with useOnyx hook (https://github.com/Expensify/App/issues/72719)
                // eslint-disable-next-line @typescript-eslint/no-deprecated
                const policyTags = report?.policyID ? getPolicyTagsData(report?.policyID) : {};
                const isMultiLevelTags = isMultiLevelTagsPolicyUtils(policyTags);
                if (isMultiLevelTags) {
                    if (areAllFieldsEqualForKey || !policy?.areTagsEnabled) {
                        keep[fieldName] = firstTransaction?.[keys[0]] ?? firstTransaction?.[keys[1]];
                    } else {
                        processChanges(fieldName, transactions, keys);
                    }
                } else {
                    const differentValues = getDifferentValues(transactions, keys);
                    const policyTagsObj = Object.values(Object.values(policyTags).at(0)?.tags ?? {});
                    const availableTags = policyTagsObj
                        .filter((tag) => differentValues.includes(tag.name) && tag.enabled && tag.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE)
                        .map((e) => e.name);
                    if (!areAllFieldsEqualForKey && policy?.areTagsEnabled && (availableTags.length > 1 || (availableTags.length === 1 && differentValues.includes('')))) {
                        change[fieldName] = [...availableTags, ...(differentValues.includes('') ? [''] : [])];
                    } else if (areAllFieldsEqualForKey) {
                        keep[fieldName] = firstTransaction?.[keys[0]] ?? firstTransaction?.[keys[1]];
                    }
                }
            } else if (areAllFieldsEqualForKey) {
                keep[fieldName] = firstTransaction?.[keys[0]] ?? firstTransaction?.[keys[1]];
            } else {
                processChanges(fieldName, transactions, keys);
            }
        }
    }

    return {keep, change};
}

function getTransactionID(report?: OnyxEntry<Report>): string | undefined {
    if (!report) {
        return;
    }
    const parentReportAction = isThread(report) ? getReportAction(report.parentReportID, report.parentReportActionID) : undefined;
    const IOUTransactionID = isMoneyRequestAction(parentReportAction) ? getOriginalMessage(parentReportAction)?.IOUTransactionID : undefined;

    return IOUTransactionID;
}

function buildNewTransactionAfterReviewingDuplicates(reviewDuplicateTransaction: OnyxEntry<ReviewDuplicates>, duplicatedTransaction: OnyxEntry<Transaction>): Partial<Transaction> {
    const {duplicates, ...restReviewDuplicateTransaction} = reviewDuplicateTransaction ?? {};

    return {
        ...duplicatedTransaction,
        ...restReviewDuplicateTransaction,
        modifiedMerchant: reviewDuplicateTransaction?.merchant,
        merchant: reviewDuplicateTransaction?.merchant,
        comment: {...reviewDuplicateTransaction?.comment, comment: reviewDuplicateTransaction?.description},
    };
}

function buildMergeDuplicatesParams(
    reviewDuplicates: OnyxEntry<ReviewDuplicates>,
    duplicatedTransactions: Array<OnyxEntry<Transaction>>,
    originalTransaction: Partial<Transaction>,
): MergeDuplicatesParams {
    return {
        amount: -getAmount(originalTransaction as OnyxEntry<Transaction>, true),
        reportID: originalTransaction?.reportID,
        receiptID: originalTransaction?.receipt?.receiptID ?? CONST.DEFAULT_NUMBER_ID,
        currency: getCurrency(originalTransaction as OnyxEntry<Transaction>),
        created: getFormattedCreated(originalTransaction as OnyxEntry<Transaction>),
        transactionID: reviewDuplicates?.transactionID,
        transactionIDList: removeSettledAndApprovedTransactions(duplicatedTransactions ?? []).map((transaction) => transaction.transactionID),
        billable: reviewDuplicates?.billable ?? false,
        reimbursable: reviewDuplicates?.reimbursable ?? false,
        category: reviewDuplicates?.category ?? '',
        tag: reviewDuplicates?.tag ?? '',
        merchant: reviewDuplicates?.merchant ?? '',
        comment: reviewDuplicates?.description ?? '',
    };
}

function getCategoryTaxCodeAndAmount(category: string, transaction: OnyxEntry<Transaction>, policy: OnyxEntry<Policy>) {
    const taxRules = policy?.rules?.expenseRules?.filter((rule) => rule.tax);
    if (!taxRules || taxRules?.length === 0 || isDistanceRequest(transaction)) {
        return {categoryTaxCode: undefined, categoryTaxAmount: undefined};
    }

    const defaultTaxCode = getDefaultTaxCode(policy, transaction, getCurrency(transaction));
    const categoryTaxCode = getCategoryDefaultTaxRate(taxRules, category, defaultTaxCode);
    const categoryTaxPercentage = getTaxValue(policy, transaction, categoryTaxCode ?? '');
    let categoryTaxAmount;

    if (categoryTaxPercentage) {
        categoryTaxAmount = convertToBackendAmount(calculateTaxAmount(categoryTaxPercentage, getAmount(transaction), getCurrency(transaction)));
    }

    return {categoryTaxCode, categoryTaxAmount};
}

/**
 * Return the sorted list transactions of an iou report
 */
function getAllSortedTransactions(iouReportID?: string): Array<OnyxEntry<Transaction>> {
    return getReportTransactions(iouReportID).sort((transA, transB) => {
        if (transA.created < transB.created) {
            return -1;
        }

        if (transA.created > transB.created) {
            return 1;
        }

        return (transA.inserted ?? '') < (transB.inserted ?? '') ? -1 : 1;
    });
}

function isExpenseSplit(transaction: OnyxEntry<Transaction>, originalTransaction?: OnyxEntry<Transaction>): boolean {
    if (!originalTransaction) {
        return !!transaction?.comment?.originalTransactionID && transaction?.comment?.source === 'split';
    }

    const {originalTransactionID, source, splits} = transaction?.comment ?? {};

    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    if ((splits && splits.length > 0) || !originalTransactionID || source !== CONST.IOU.TYPE.SPLIT) {
        return false;
    }

    return !originalTransaction?.comment?.splits;
}

const getOriginalTransactionWithSplitInfo = (transaction: OnyxEntry<Transaction>, originalTransaction: OnyxEntry<Transaction>) => {
    const {originalTransactionID, source, splits} = transaction?.comment ?? {};

    if (splits && splits.length > 0) {
        return {isBillSplit: true, isExpenseSplit: false, originalTransaction: originalTransaction ?? transaction};
    }

    if (!originalTransactionID || source !== CONST.IOU.TYPE.SPLIT) {
        return {isBillSplit: false, isExpenseSplit: false, originalTransaction: transaction};
    }

    // To determine if it’s a split bill or a split expense, we check for the presence of `comment.splits` on the original transaction.
    // Since both splits use `comment.originalTransaction`, but split expenses won’t have `comment.splits`.
    return {isBillSplit: !!originalTransaction?.comment?.splits, isExpenseSplit: isExpenseSplit(transaction, originalTransaction), originalTransaction: originalTransaction ?? transaction};
};

/**
 * Return transactions pending action.
 */
function getTransactionPendingAction(transaction: OnyxEntry<Transaction>): PendingAction {
    if (transaction?.pendingAction) {
        return transaction.pendingAction;
    }
    const hasPendingFields = Object.keys(transaction?.pendingFields ?? {}).length > 0;
    return hasPendingFields ? CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE : null;
}

function isTransactionPendingDelete(transaction: OnyxEntry<Transaction>): boolean {
    return getTransactionPendingAction(transaction) === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
}

/**
 * Retrieves all "child" transactions associated with a given original transaction.
 * By default excludes orphaned transactions (reportID '0'). Use includeOrphaned=true for counting.
 */
function getChildTransactions(transactions: OnyxCollection<Transaction>, reports: OnyxCollection<Report>, originalTransactionID: string | undefined, includeOrphaned = false) {
    return Object.values(transactions ?? {}).filter((currentTransaction) => {
        const isSplitChild = currentTransaction?.comment?.originalTransactionID === originalTransactionID;
        if (!isSplitChild || currentTransaction?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
            return false;
        }
        const isOrphaned = currentTransaction?.reportID === CONST.REPORT.UNREPORTED_REPORT_ID;
        if (isOrphaned) {
            return includeOrphaned;
        }
        const currentReport = reports?.[`${ONYXKEYS.COLLECTION.REPORT}${currentTransaction?.reportID}`];
        return !!currentReport || currentTransaction?.comment?.source === CONST.IOU.TYPE.SPLIT;
    });
}

/**
 * Determines whether a report should display the expense breakdown.
 */
function shouldShowExpenseBreakdown(transactions?: Transaction[]): boolean {
    if (!transactions || transactions.length === 0) {
        return false;
    }

    // Show breakdown if there is ANY non-reimbursable expense.
    // If there are no non-reimbursable expenses (i.e., all are reimbursable), do not show the breakdown.
    return transactions.some((transaction) => !getReimbursable(transaction));
}

/**
 * Creates sections data for unreported expenses, marking transactions with DELETE pending action as disabled
 */
function createUnreportedExpenses(transactions: Array<Transaction | undefined>): UnreportedExpenseListItemType[] {
    return transactions
        .filter((t): t is Transaction => t !== undefined)
        .map(
            (transaction): UnreportedExpenseListItemType => ({
                ...transaction,
                isDisabled: isTransactionPendingDelete(transaction),
                keyForList: transaction.transactionID,
                errors: transaction.errors as Errors | undefined,
            }),
        );
}

function isExpenseUnreported(transaction?: Transaction): transaction is UnreportedTransaction {
    return transaction?.reportID === CONST.REPORT.UNREPORTED_REPORT_ID;
}

/**
 * Check if there is a smartscan failed or no route violation for the transaction.
 */
function hasSmartScanFailedOrNoRouteViolation(
    transaction: Transaction,
    transactionViolations: OnyxCollection<TransactionViolations> | undefined,
    currentUserEmail: string,
    currentUserAccountID: number,
    report: OnyxEntry<Report>,
    policy: OnyxEntry<Policy>,
): boolean {
    const violations = getTransactionViolations(transaction, transactionViolations, currentUserEmail, currentUserAccountID, report, policy);
    return !!violations?.some((violation) => violation.name === CONST.VIOLATIONS.SMARTSCAN_FAILED || violation.name === CONST.VIOLATIONS.NO_ROUTE);
}

/**
 * Check if the initial transaction should be reused for the current file being processed.
 */
function shouldReuseInitialTransaction(
    initialTransaction: OnyxEntry<Transaction>,
    shouldAcceptMultipleFiles: boolean,
    index: number,
    isMultiScanEnabled: boolean,
    transactions: Transaction[],
): boolean {
    if (!initialTransaction) {
        return false;
    }

    if (!shouldAcceptMultipleFiles) {
        return true;
    }

    if (index !== 0) {
        return false;
    }

    return !isMultiScanEnabled || (transactions.length === 1 && (!initialTransaction.receipt?.source || initialTransaction.receipt?.isTestReceipt === true));
}

export {
    buildOptimisticTransaction,
    calculateTaxAmount,
    getWorkspaceTaxesSettingsName,
    getDefaultTaxCode,
    transformedTaxRates,
    getTaxValue,
    getTaxName,
    getEnabledTaxRateCount,
    getUpdatedTransaction,
    getClearedPendingFields,
    getDescription,
    getRequestType,
    getExpenseType,
    getTransactionType,
    isManualRequest,
    isScanRequest,
    getAmount,
    getAttendees,
    getTaxAmount,
    getTaxCode,
    getCurrency,
    shouldClearConvertedAmount,
    getDistanceInMeters,
    getCardID,
    getOriginalCurrency,
    getOriginalAmount,
    getFormattedAttendees,
    getMerchant,
    hasAnyTransactionWithoutRTERViolation,
    getMerchantOrDescription,
    getMCCGroup,
    getCreated,
    getFormattedCreated,
    getCategory,
    getBillable,
    getTag,
    getTagArrayFromName,
    getTagForDisplay,
    getTransactionViolations,
    hasReceipt,
    hasEReceipt,
    hasRoute,
    isReceiptBeingScanned,
    didReceiptScanSucceed,
    getValidWaypoints,
    getValidDuplicateTransactionIDs,
    isDistanceRequest,
    isMapDistanceRequest,
    isGPSDistanceRequest,
    isManualDistanceRequest,
    isOdometerDistanceRequest,
    isFetchingWaypointsFromServer,
    isExpensifyCardTransaction,
    isManagedCardTransaction,
    isDuplicate,
    isPending,
    isPosted,
    isOnHold,
    getWaypoints,
    isAmountMissing,
    isMerchantMissing,
    isPartialMerchant,
    isPartial,
    isCreatedMissing,
    areRequiredFieldsEmpty,
    hasMissingSmartscanFields,
    hasPendingRTERViolation,
    hasValidModifiedAmount,
    allHavePendingRTERViolation,
    hasPendingUI,
    getWaypointIndex,
    waypointHasValidAddress,
    isWaypointNullIsland,
    getRecentTransactions,
    hasReservationList,
    hasViolation,
    hasDuplicateTransactions,
    hasBrokenConnectionViolation,
    hasSmartScanFailedOrNoRouteViolation,
    hasCustomUnitOutOfPolicyViolation,
    shouldShowBrokenConnectionViolation,
    shouldShowBrokenConnectionViolationForMultipleTransactions,
    hasNoticeTypeViolation,
    hasWarningTypeViolation,
    isCustomUnitRateIDForP2P,
    getRateID,
    compareDuplicateTransactionFields,
    getTransactionID,
    buildNewTransactionAfterReviewingDuplicates,
    buildMergeDuplicatesParams,
    getReimbursable,
    isPayAtEndExpense,
    removeSettledAndApprovedTransactions,
    removeTransactionFromDuplicateTransactionViolation,
    getCardName,
    hasReceiptSource,
    shouldShowAttendees,
    getAllSortedTransactions,
    getFormattedPostedDate,
    getCategoryTaxCodeAndAmount,
    isPerDiemRequest,
    isViolationDismissed,
    isBrokenConnectionViolation,
    isPartialTransaction,
    isPendingCardOrScanningTransaction,
    isScanning,
    isCategoryBeingAnalyzed,
    checkIfShouldShowMarkAsCashButton,
    getOriginalTransactionWithSplitInfo,
    getTransactionPendingAction,
    isTransactionPendingDelete,
    getChildTransactions,
    createUnreportedExpenses,
    isDemoTransaction,
    shouldShowViolation,
    isUnreportedAndHasInvalidDistanceRateTransaction,
    hasTransactionBeenRejected,
    isExpenseSplit,
    getAttendeesListDisplayString,
    isCorporateCardTransaction,
    isExpenseUnreported,
    mergeProhibitedViolations,
    getOriginalAttendees,
    getReportOwnerAsAttendee,
    isFromCreditCardImport,
    getExchangeRate,
    shouldReuseInitialTransaction,
    getOriginalAmountForDisplay,
    getOriginalCurrencyForDisplay,
    getConvertedAmount,
    shouldShowExpenseBreakdown,
    isTimeRequest,
};

export type {TransactionChanges};
