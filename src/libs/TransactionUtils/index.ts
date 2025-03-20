import {format, isValid, parse} from 'date-fns';
import lodashDeepClone from 'lodash/cloneDeep';
import lodashHas from 'lodash/has';
import lodashIsEqual from 'lodash/isEqual';
import lodashSet from 'lodash/set';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import Onyx from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import {getPolicyCategoriesData} from '@libs/actions/Policy/Category';
import {getPolicyTagsData} from '@libs/actions/Policy/Tag';
import type {TransactionMergeParams} from '@libs/API/parameters';
import {getCategoryDefaultTaxRate} from '@libs/CategoryUtils';
import {convertToBackendAmount, getCurrencyDecimals} from '@libs/CurrencyUtils';
import DateUtils from '@libs/DateUtils';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import {toLocaleDigit} from '@libs/LocaleDigitUtils';
import * as Localize from '@libs/Localize';
import * as NumberUtils from '@libs/NumberUtils';
import {
    getCleanedTagName,
    getDistanceRateCustomUnitRate,
    getPolicy,
    getTaxByID,
    isInstantSubmitEnabled,
    isMultiLevelTags as isMultiLevelTagsPolicyUtils,
    isPolicyAdmin,
} from '@libs/PolicyUtils';
import {getOriginalMessage, getReportAction, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {
    getReportTransactions,
    isCurrentUserSubmitter,
    isOpenExpenseReport,
    isProcessingReport,
    isReportApproved,
    isReportIDApproved,
    isReportManuallyReimbursed,
    isSettled,
    isTestTransactionReport,
    isThread,
} from '@libs/ReportUtils';
import type {IOURequestType} from '@userActions/IOU';
import CONST from '@src/CONST';
import type {IOUType} from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxInputOrEntry, Policy, RecentWaypoint, Report, ReviewDuplicates, TaxRate, TaxRates, Transaction, TransactionViolation, TransactionViolations} from '@src/types/onyx';
import type {Attendee} from '@src/types/onyx/IOU';
import type {SearchPolicy, SearchReport} from '@src/types/onyx/SearchResults';
import type {Comment, Receipt, TransactionChanges, TransactionCustomUnit, TransactionPendingFieldsKey, Waypoint, WaypointCollection} from '@src/types/onyx/Transaction';
import type DeepValueOf from '@src/types/utils/DeepValueOf';
import {isEmptyObject} from '@src/types/utils/EmptyObject';
import getDistanceInMeters from './getDistanceInMeters';

type TransactionParams = {
    amount: number;
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
    pendingFields?: Partial<{[K in TransactionPendingFieldsKey]: ValueOf<typeof CONST.RED_BRICK_ROAD_PENDING_ACTION>}>;
    reimbursable?: boolean;
    source?: string;
    filename?: string;
    customUnit?: TransactionCustomUnit;
};

type BuildOptimisticTransactionParams = {
    originalTransactionID?: string;
    existingTransactionID?: string;
    existingTransaction?: OnyxEntry<Transaction>;
    policy?: OnyxEntry<Policy>;
    transactionParams: TransactionParams;
};

let allTransactions: OnyxCollection<Transaction> = {};

Onyx.connect({
    key: ONYXKEYS.COLLECTION.TRANSACTION,
    waitForCollectionCallback: true,
    callback: (value) => {
        if (!value) {
            return;
        }
        allTransactions = Object.fromEntries(Object.entries(value).filter(([, transaction]) => !!transaction));
    },
});

let allReports: OnyxCollection<Report> = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback: (value) => {
        allReports = value;
    },
});

let allTransactionViolations: OnyxCollection<TransactionViolations> = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS,
    waitForCollectionCallback: true,
    callback: (value) => (allTransactionViolations = value),
});

let preferredLocale: DeepValueOf<typeof CONST.LOCALES> = CONST.LOCALES.DEFAULT;
Onyx.connect({
    key: ONYXKEYS.NVP_PREFERRED_LOCALE,
    callback: (value) => {
        if (!value) {
            return;
        }
        preferredLocale = value;
    },
});

let currentUserEmail = '';
let currentUserAccountID = -1;
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (val) => {
        currentUserEmail = val?.email ?? '';
        currentUserAccountID = val?.accountID ?? CONST.DEFAULT_NUMBER_ID;
    },
});

function isDistanceRequest(transaction: OnyxEntry<Transaction>): boolean {
    // This is used during the expense creation flow before the transaction has been saved to the server
    if (lodashHas(transaction, 'iouRequestType')) {
        return transaction?.iouRequestType === CONST.IOU.REQUEST_TYPE.DISTANCE;
    }

    // This is the case for transaction objects once they have been saved to the server
    const type = transaction?.comment?.type;
    const customUnitName = transaction?.comment?.customUnit?.name;
    return type === CONST.TRANSACTION.TYPE.CUSTOM_UNIT && customUnitName === CONST.CUSTOM_UNITS.NAME_DISTANCE;
}

function isScanRequest(transaction: OnyxEntry<Transaction>): boolean {
    // This is used during the expense creation flow before the transaction has been saved to the server
    if (lodashHas(transaction, 'iouRequestType')) {
        return transaction?.iouRequestType === CONST.IOU.REQUEST_TYPE.SCAN;
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

function getRequestType(transaction: OnyxEntry<Transaction>): IOURequestType {
    if (isDistanceRequest(transaction)) {
        return CONST.IOU.REQUEST_TYPE.DISTANCE;
    }
    if (isScanRequest(transaction)) {
        return CONST.IOU.REQUEST_TYPE.SCAN;
    }

    if (isPerDiemRequest(transaction)) {
        return CONST.IOU.REQUEST_TYPE.PER_DIEM;
    }

    return CONST.IOU.REQUEST_TYPE.MANUAL;
}

function isManualRequest(transaction: Transaction): boolean {
    // This is used during the expense creation flow before the transaction has been saved to the server
    if (lodashHas(transaction, 'iouRequestType')) {
        return transaction.iouRequestType === CONST.IOU.REQUEST_TYPE.MANUAL;
    }

    return getRequestType(transaction) === CONST.IOU.REQUEST_TYPE.MANUAL;
}

/**
 * Optimistically generate a transaction.
 *
 * @param amount – in cents
 * @param [existingTransactionID] When creating a distance expense, an empty transaction has already been created with a transactionID. In that case, the transaction here needs to have
 * it's transactionID match what was already generated.
 */
function buildOptimisticTransaction(params: BuildOptimisticTransactionParams): Transaction {
    const {originalTransactionID = '', existingTransactionID, existingTransaction, policy, transactionParams} = params;
    const {
        amount,
        currency,
        reportID,
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
    } = transactionParams;
    // transactionIDs are random, positive, 64-bit numeric strings.
    // Because JS can only handle 53-bit numbers, transactionIDs are strings in the front-end (just like reportActionID)
    const transactionID = existingTransactionID ?? NumberUtils.rand64();

    const commentJSON: Comment = {comment};
    if (source) {
        commentJSON.source = source;
    }
    if (originalTransactionID) {
        commentJSON.originalTransactionID = originalTransactionID;
    }

    const isDistanceTransaction = !!pendingFields?.waypoints;
    if (isDistanceTransaction) {
        // Set the distance unit, which comes from the policy distance unit or the P2P rate data
        lodashSet(commentJSON, 'customUnit.distanceUnit', DistanceRequestUtils.getUpdatedDistanceUnit({transaction: existingTransaction, policy}));
    }

    const isPerDiemTransaction = !!pendingFields?.subRates;
    if (isPerDiemTransaction) {
        // Set the custom unit, which comes from the policy per diem rate data
        lodashSet(commentJSON, 'customUnit', customUnit);
    }

    const report = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
    const isManagerMcTestTransaction = isTestTransactionReport(report);

    return {
        ...(!isEmptyObject(pendingFields) ? {pendingFields} : {}),
        transactionID,
        amount,
        currency,
        reportID,
        comment: commentJSON,
        merchant: merchant || CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT,
        created: created || DateUtils.getDBTime(),
        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        receipt: receipt?.source
            ? {source: receipt.source, state: isManagerMcTestTransaction ? CONST.IOU.RECEIPT_STATE.SCANCOMPLETE : receipt.state ?? CONST.IOU.RECEIPT_STATE.SCANREADY}
            : {},
        filename: (receipt?.source ? receipt?.name ?? filename : filename).toString(),
        category,
        tag,
        taxCode,
        taxAmount,
        billable,
        reimbursable,
        attendees,
        inserted: DateUtils.getDBTime(),
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

function isMerchantMissing(transaction: OnyxEntry<Transaction>) {
    if (transaction?.modifiedMerchant && transaction.modifiedMerchant !== '') {
        return transaction.modifiedMerchant === CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT;
    }
    const isMerchantEmpty = transaction?.merchant === CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT || transaction?.merchant === '';

    return isMerchantEmpty;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function shouldShowAttendees(iouType: IOUType, policy: OnyxEntry<Policy>): boolean {
    return false;
    // To be renabled once feature is complete: https://github.com/Expensify/App/issues/44725
    // Keep this disabled for per diem expense
    // return iouType === CONST.IOU.TYPE.SUBMIT && !!policy?.id && (policy?.type === CONST.POLICY.TYPE.CORPORATE || policy?.type === CONST.POLICY.TYPE.TEAM);
}

/**
 * Check if the merchant is partial i.e. `(none)`
 */
function isPartialMerchant(merchant: string): boolean {
    return merchant === CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT;
}

function isAmountMissing(transaction: OnyxEntry<Transaction>) {
    return transaction?.amount === 0 && (!transaction.modifiedAmount || transaction.modifiedAmount === 0);
}

function isCreatedMissing(transaction: OnyxEntry<Transaction>) {
    return transaction?.created === '' && (!transaction.created || transaction.modifiedCreated === '');
}

function areRequiredFieldsEmpty(transaction: OnyxEntry<Transaction>): boolean {
    const parentReport = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${transaction?.reportID}`];
    const isFromExpenseReport = parentReport?.type === CONST.REPORT.TYPE.EXPENSE;
    const isSplitPolicyExpenseChat = !!transaction?.comment?.splits?.some((participant) => allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${participant.chatReportID}`]?.isOwnPolicyExpenseChat);
    const isMerchantRequired = isFromExpenseReport || isSplitPolicyExpenseChat;
    return (isMerchantRequired && isMerchantMissing(transaction)) || isAmountMissing(transaction) || isCreatedMissing(transaction);
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
        updatedTransaction.modifiedAmount = isFromExpenseReport ? -transactionChanges.amount : transactionChanges.amount;
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
            updatedTransaction.modifiedMerchant = Localize.translateLocal('iou.fieldPending');
        } else {
            const mileageRate = DistanceRequestUtils.getRate({transaction: updatedTransaction, policy});
            const {unit, rate} = mileageRate;

            const distanceInMeters = getDistanceInMeters(transaction, unit);
            const amount = DistanceRequestUtils.getDistanceRequestAmount(distanceInMeters, unit, rate ?? 0);
            const updatedAmount = isFromExpenseReport ? -amount : amount;
            const updatedMerchant = DistanceRequestUtils.getDistanceMerchant(true, distanceInMeters, unit, rate, transaction.currency, Localize.translateLocal, (digit) =>
                toLocaleDigit(preferredLocale, digit),
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
            const distance = NumberUtils.roundToTwoDecimalPlaces((transaction?.comment?.customUnit?.quantity ?? 0) * conversionFactor);
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
            const updatedAmount = isFromExpenseReport ? -amount : amount;
            const updatedCurrency = updatedMileageRate.currency ?? CONST.CURRENCY.USD;
            const updatedMerchant = DistanceRequestUtils.getDistanceMerchant(true, distanceInMeters, unit, rate, updatedCurrency, Localize.translateLocal, (digit) =>
                toLocaleDigit(preferredLocale, digit),
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

    updatedTransaction.pendingFields = {
        ...(updatedTransaction?.pendingFields ?? {}),
        ...(Object.hasOwn(transactionChanges, 'comment') && {comment: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}),
        ...(Object.hasOwn(transactionChanges, 'created') && {created: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}),
        ...(Object.hasOwn(transactionChanges, 'amount') && {amount: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}),
        ...(Object.hasOwn(transactionChanges, 'currency') && {currency: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}),
        ...(Object.hasOwn(transactionChanges, 'merchant') && {merchant: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}),
        ...(Object.hasOwn(transactionChanges, 'waypoints') && {waypoints: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}),
        ...(Object.hasOwn(transactionChanges, 'billable') && {billable: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}),
        ...(Object.hasOwn(transactionChanges, 'category') && {category: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}),
        ...(Object.hasOwn(transactionChanges, 'tag') && {tag: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}),
        ...(Object.hasOwn(transactionChanges, 'taxAmount') && {taxAmount: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}),
        ...(Object.hasOwn(transactionChanges, 'taxCode') && {taxCode: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}),
        ...(Object.hasOwn(transactionChanges, 'attendees') && {attendees: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE}),
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
function getAmount(transaction: OnyxInputOrEntry<Transaction>, isFromExpenseReport = false, isFromTrackedExpense = false): number {
    // IOU requests cannot have negative values, but they can be stored as negative values, let's return absolute value
    if (!isFromExpenseReport || isFromTrackedExpense) {
        const amount = transaction?.modifiedAmount ?? 0;
        if (amount) {
            return Math.abs(amount);
        }
        return Math.abs(transaction?.amount ?? 0);
    }

    // Expense report case:
    // The amounts are stored using an opposite sign and negative values can be set,
    // we need to return an opposite sign than is saved in the transaction object
    let amount = transaction?.modifiedAmount ?? 0;
    if (amount) {
        return -amount;
    }

    // To avoid -0 being shown, lets only change the sign if the value is other than 0.
    amount = transaction?.amount ?? 0;
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
 * Return the formated posted date from the transaction.
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

/**
 * Verify if the transaction is expecting the distance to be calculated on the server
 */
function isFetchingWaypointsFromServer(transaction: OnyxInputOrEntry<Transaction>): boolean {
    return !!transaction?.pendingFields?.waypoints;
}

/**
 * Return the merchant field from the transaction, return the modifiedMerchant if present.
 */
function getMerchant(transaction: OnyxInputOrEntry<Transaction>): string {
    return transaction?.modifiedMerchant ? transaction.modifiedMerchant : transaction?.merchant ?? '';
}

function getMerchantOrDescription(transaction: OnyxEntry<Transaction>) {
    return !isMerchantMissing(transaction) ? getMerchant(transaction) : getDescription(transaction);
}

/**
 * Return the list of modified attendees if present otherwise list of attendees
 */
function getAttendees(transaction: OnyxInputOrEntry<Transaction>): Attendee[] {
    return transaction?.modifiedAttendees ? transaction.modifiedAttendees : transaction?.attendees ?? [];
}

/**
 * Return the list of attendees as a string and modified list of attendees as a string if present.
 */
function getFormattedAttendees(modifiedAttendees?: Attendee[], attendees?: Attendee[]): [string, string] {
    const oldAttendees = modifiedAttendees ?? [];
    const newAttendees = attendees ?? [];
    return [oldAttendees.map((item) => item.displayName ?? item.login).join(', '), newAttendees.map((item) => item.displayName ?? item.login).join(', ')];
}

/**
 * Return the reimbursable value. Defaults to true to match BE logic.
 */
function getReimbursable(transaction: Transaction): boolean {
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
    const tagWithoutDoubleSlashes = tagName.replace(/\\\\/g, '☠');
    const tagWithoutEscapedColons = tagWithoutDoubleSlashes.replace(/\\:/g, '☢');

    // Do our split
    const matches = tagWithoutEscapedColons.split(':');
    const newMatches: string[] = [];

    for (const item of matches) {
        const tagWithEscapedColons = item.replace(/☢/g, '\\:');
        const tagWithDoubleSlashes = tagWithEscapedColons.replace(/☠/g, '\\\\');
        newMatches.push(tagWithDoubleSlashes);
    }

    return newMatches;
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
    return getCleanedTagName(getTag(transaction, tagIndex));
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
 * Determine whether a transaction is made with a card (Expensify or Company Card).
 */
function isCardTransaction(transaction: OnyxEntry<Transaction>): boolean {
    return !!transaction?.managedCard;
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

function isReceiptBeingScanned(transaction: OnyxInputOrEntry<Transaction>): boolean {
    return [CONST.IOU.RECEIPT_STATE.SCANREADY, CONST.IOU.RECEIPT_STATE.SCANNING].some((value) => value === transaction?.receipt?.state);
}

function didReceiptScanSucceed(transaction: OnyxEntry<Transaction>): boolean {
    return [CONST.IOU.RECEIPT_STATE.SCANCOMPLETE].some((value) => value === transaction?.receipt?.state);
}

/**
 * Check if the transaction has a non-smartscanning receipt and is missing required fields
 */
function hasMissingSmartscanFields(transaction: OnyxInputOrEntry<Transaction>): boolean {
    return !!(transaction && !isDistanceRequest(transaction) && !isReceiptBeingScanned(transaction) && areRequiredFieldsEmpty(transaction));
}

/**
 * Get all transaction violations of the transaction with given tranactionID.
 */
function getTransactionViolations(transactionID: string | undefined, transactionViolations: OnyxCollection<TransactionViolations> | undefined): TransactionViolations | undefined {
    const transaction = getTransaction(transactionID);
    if (!transactionID || !transactionViolations) {
        return undefined;
    }
    return transactionViolations?.[ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS + transactionID]?.filter((violation) => !isViolationDismissed(transaction, violation));
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
 * Check if there is broken connection violation.
 */
function hasBrokenConnectionViolation(transactionID: string | undefined, transactionViolations: OnyxCollection<TransactionViolations> | undefined): boolean {
    const violations = getTransactionViolations(transactionID, transactionViolations);
    return !!violations?.find((violation) => isBrokenConnectionViolation(violation));
}

function isBrokenConnectionViolation(violation: TransactionViolation) {
    return (
        violation.name === CONST.VIOLATIONS.RTER &&
        (violation.data?.rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION || violation.data?.rterType === CONST.RTER_VIOLATION_TYPES.BROKEN_CARD_CONNECTION_530)
    );
}

function shouldShowBrokenConnectionViolationInternal(brokenConnectionViolations: TransactionViolation[], report: OnyxEntry<Report> | SearchReport, policy: OnyxEntry<Policy> | SearchPolicy) {
    if (brokenConnectionViolations.length === 0) {
        return false;
    }

    if (!isPolicyAdmin(policy) || isCurrentUserSubmitter(report?.reportID)) {
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
function shouldShowBrokenConnectionViolation(report: OnyxEntry<Report> | SearchReport, policy: OnyxEntry<Policy> | SearchPolicy, transactionViolations: TransactionViolation[]): boolean {
    const brokenConnectionViolations = transactionViolations.filter((violation) => isBrokenConnectionViolation(violation));

    return shouldShowBrokenConnectionViolationInternal(brokenConnectionViolations, report, policy);
}

/**
 * Check if user should see broken connection violation warning based on selected transactions.
 */
function shouldShowBrokenConnectionViolationForMultipleTransactions(
    transactionIDs: string[],
    report: OnyxEntry<Report> | SearchReport,
    policy: OnyxEntry<Policy> | SearchPolicy,
    transactionViolations: OnyxCollection<TransactionViolation[]>,
): boolean {
    const violations = transactionIDs.flatMap((id) => transactionViolations?.[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${id}`] ?? []);

    const brokenConnectionViolations = violations.filter((violation) => isBrokenConnectionViolation(violation));

    return shouldShowBrokenConnectionViolationInternal(brokenConnectionViolations, report, policy);
}

function checkIfShouldShowMarkAsCashButton(hasRTERVPendingViolation: boolean, shouldDisplayBrokenConnectionViolation: boolean, report: OnyxEntry<Report>, policy: OnyxEntry<Policy>) {
    if (hasRTERVPendingViolation) {
        return true;
    }
    return (
        shouldDisplayBrokenConnectionViolation && (!isPolicyAdmin(policy) || isCurrentUserSubmitter(report?.reportID)) && !isReportApproved({report}) && !isReportManuallyReimbursed(report)
    );
}

/**
 * Check if there is pending rter violation in all transactionViolations with given transactionIDs.
 */
function allHavePendingRTERViolation(transactionIds: string[], transactionViolations: OnyxCollection<TransactionViolations> | undefined): boolean {
    const transactionsWithRTERViolations = transactionIds.map((transactionId) => {
        const filteredTransactionViolations = getTransactionViolations(transactionId, transactionViolations);
        return hasPendingRTERViolation(filteredTransactionViolations);
    });
    return transactionsWithRTERViolations.length > 0 && transactionsWithRTERViolations.every((value) => value === true);
}

/**
 * Check if the transaction is pending or has a pending rter violation.
 */
function hasPendingUI(transaction: OnyxEntry<Transaction>, transactionViolations?: TransactionViolations | null): boolean {
    return isReceiptBeingScanned(transaction) || isPending(transaction) || (!!transaction && hasPendingRTERViolation(transactionViolations));
}

/**
 * Check if the transaction has a defined route
 */
function hasRoute(transaction: OnyxEntry<Transaction>, isDistanceRequestType?: boolean): boolean {
    return !!transaction?.routes?.route0?.geometry?.coordinates || (!!isDistanceRequestType && !!transaction?.comment?.customUnit?.quantity);
}

function waypointHasValidAddress(waypoint: RecentWaypoint | Waypoint): boolean {
    return !!waypoint?.address?.trim();
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

        // Check for adjacent waypoints with the same address
        if (previousWaypoint && currentWaypoint?.address === previousWaypoint.address) {
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
 * @param checkDismissed - whether to check if the violation has already been dismissed as well
 */
function isDuplicate(transactionID: string | undefined, checkDismissed = false): boolean {
    const transaction = getTransaction(transactionID);
    if (!transaction) {
        return false;
    }
    const duplicateViolation = allTransactionViolations?.[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${transactionID}`]?.find(
        (violation: TransactionViolation) => violation.name === CONST.VIOLATIONS.DUPLICATED_TRANSACTION,
    );
    const hasDuplicatedViolation = !!duplicateViolation;
    if (!checkDismissed) {
        return hasDuplicatedViolation;
    }

    const didDismissedViolation = isViolationDismissed(transaction, duplicateViolation);

    return hasDuplicatedViolation && !didDismissedViolation;
}

/**
 * Check if transaction is on hold
 */
function isOnHold(transaction: OnyxEntry<Transaction>): boolean {
    if (!transaction) {
        return false;
    }

    return !!transaction.comment?.hold || isDuplicate(transaction.transactionID, true);
}

/**
 * Check if transaction is on hold for the given transactionID
 */
function isOnHoldByTransactionID(transactionID: string | undefined | null): boolean {
    if (!transactionID) {
        return false;
    }

    return isOnHold(allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`]);
}

/**
 * Checks if a violation is dismissed for the given transaction
 */
function isViolationDismissed(transaction: OnyxEntry<Transaction>, violation: TransactionViolation | undefined): boolean {
    if (!transaction || !violation) {
        return false;
    }
    return transaction?.comment?.dismissedViolations?.[violation.name]?.[currentUserEmail] === `${currentUserAccountID}`;
}

/**
 * Checks if violations are supported for the given transaction
 */
function doesTransactionSupportViolations(transaction: Transaction | undefined): transaction is Transaction {
    if (!transaction) {
        return false;
    }
    if (isExpensifyCardTransaction(transaction) && isPending(transaction)) {
        return false;
    }
    return true;
}

/**
 * Checks if any violations for the provided transaction are of type 'violation'
 */
function hasViolation(transaction: Transaction | undefined, transactionViolations: TransactionViolation[] | OnyxCollection<TransactionViolation[]>, showInReview?: boolean): boolean {
    if (!doesTransactionSupportViolations(transaction)) {
        return false;
    }
    const violations = Array.isArray(transactionViolations) ? transactionViolations : transactionViolations?.[ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS + transaction.transactionID];

    return !!violations?.some(
        (violation) =>
            violation.type === CONST.VIOLATION_TYPES.VIOLATION &&
            (showInReview === undefined || showInReview === (violation.showInReview ?? false)) &&
            !isViolationDismissed(transaction, violation),
    );
}

/**
 * Checks if any violations for the provided transaction are of type 'notice'
 */
function hasNoticeTypeViolation(transactionID: string | undefined, transactionViolations: TransactionViolation[] | OnyxCollection<TransactionViolation[]>, showInReview?: boolean): boolean {
    const transaction = getTransaction(transactionID);
    if (!doesTransactionSupportViolations(transaction)) {
        return false;
    }
    const violations = Array.isArray(transactionViolations) ? transactionViolations : transactionViolations?.[ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS + transactionID];

    return !!violations?.some(
        (violation: TransactionViolation) =>
            violation.type === CONST.VIOLATION_TYPES.NOTICE &&
            (showInReview === undefined || showInReview === (violation.showInReview ?? false)) &&
            !isViolationDismissed(transaction, violation),
    );
}

/**
 * Checks if any violations for the provided transaction are of type 'warning'
 */
function hasWarningTypeViolation(transactionID: string | undefined, transactionViolations: TransactionViolation[] | OnyxCollection<TransactionViolation[]>, showInReview?: boolean): boolean {
    const transaction = getTransaction(transactionID);
    if (!doesTransactionSupportViolations(transaction)) {
        return false;
    }
    const violations = Array.isArray(transactionViolations) ? transactionViolations : transactionViolations?.[ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS + transactionID];
    const warningTypeViolations =
        violations?.filter(
            (violation: TransactionViolation) =>
                violation.type === CONST.VIOLATION_TYPES.WARNING &&
                (showInReview === undefined || showInReview === (violation.showInReview ?? false)) &&
                !isViolationDismissed(transaction, violation),
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
function getRateID(transaction: OnyxInputOrEntry<Transaction>): string | undefined {
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

    const getModifiedName = (data: TaxRate, code: string) =>
        `${data.name} (${data.value})${defaultTaxCode() === code ? ` ${CONST.DOT_SEPARATOR} ${Localize.translateLocal('common.default')}` : ''}`;
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
function getTaxName(policy: OnyxEntry<Policy>, transaction: OnyxEntry<Transaction>) {
    const defaultTaxCode = getDefaultTaxCode(policy, transaction);
    return Object.values(transformedTaxRates(policy, transaction)).find((taxRate) => taxRate.code === (transaction?.taxCode ?? defaultTaxCode))?.modifiedName;
}

function getTransaction(transactionID: string | number | undefined): OnyxEntry<Transaction> {
    return allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
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

function removeSettledAndApprovedTransactions(transactionIDs: string[]): string[] {
    return transactionIDs.filter(
        (transactionID) =>
            !isSettled(allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`]?.reportID) &&
            !isReportIDApproved(allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`]?.reportID),
    );
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
    reviewingTransactionID?: string | undefined,
    reportID?: string | undefined,
    selectedTransactionID?: string,
): {keep: Partial<ReviewDuplicates>; change: FieldsToChange} {
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
    const transactionViolations = allTransactionViolations?.[`${ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS}${reviewingTransactionID}`];
    const duplicates = transactionViolations?.find((violation) => violation.name === CONST.VIOLATIONS.DUPLICATED_TRANSACTION)?.data?.duplicates ?? [];
    const transactions = removeSettledAndApprovedTransactions([reviewingTransactionID, ...duplicates]).map((item) => getTransaction(item));

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
        return items.every((item) => lodashIsEqual(getDescription(item), getDescription(firstTransaction)));
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
            const report = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${reportID}`];
            const policy = getPolicy(report?.policyID);

            const areAllFieldsEqualForKey = areAllFieldsEqual(transactions, (item) => keys.map((key) => item?.[key]).join('|'));
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
                const policyCategories = report?.policyID ? getPolicyCategoriesData(report.policyID) : {};
                const availableCategories = Object.values(policyCategories)
                    .filter((category) => differentValues.includes(category.name) && category.enabled && category.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE)
                    .map((e) => e.name);

                if (!areAllFieldsEqualForKey && policy?.areCategoriesEnabled && (availableCategories.length > 1 || (availableCategories.length === 1 && differentValues.includes('')))) {
                    change[fieldName] = [...availableCategories, ...(differentValues.includes('') ? [''] : [])];
                } else if (areAllFieldsEqualForKey) {
                    keep[fieldName] = firstTransaction?.[keys[0]] ?? firstTransaction?.[keys[1]];
                }
            } else if (fieldName === 'tag') {
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

function getTransactionID(threadReportID?: string): string | undefined {
    if (!threadReportID) {
        return;
    }
    const report = allReports?.[`${ONYXKEYS.COLLECTION.REPORT}${threadReportID}`];
    const parentReportAction = isThread(report) ? getReportAction(report.parentReportID, report.parentReportActionID) : undefined;
    const IOUTransactionID = isMoneyRequestAction(parentReportAction) ? getOriginalMessage(parentReportAction)?.IOUTransactionID : undefined;

    return IOUTransactionID;
}

function buildNewTransactionAfterReviewingDuplicates(reviewDuplicateTransaction: OnyxEntry<ReviewDuplicates>): Partial<Transaction> {
    const originalTransaction = allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${reviewDuplicateTransaction?.transactionID}`] ?? undefined;
    const {duplicates, ...restReviewDuplicateTransaction} = reviewDuplicateTransaction ?? {};

    return {
        ...originalTransaction,
        ...restReviewDuplicateTransaction,
        modifiedMerchant: reviewDuplicateTransaction?.merchant,
        merchant: reviewDuplicateTransaction?.merchant,
        comment: {...reviewDuplicateTransaction?.comment, comment: reviewDuplicateTransaction?.description},
    };
}

function buildTransactionsMergeParams(reviewDuplicates: OnyxEntry<ReviewDuplicates>, originalTransaction: Partial<Transaction>): TransactionMergeParams {
    return {
        amount: -getAmount(originalTransaction as OnyxEntry<Transaction>, true),
        reportID: originalTransaction?.reportID,
        receiptID: originalTransaction?.receipt?.receiptID ?? CONST.DEFAULT_NUMBER_ID,
        currency: getCurrency(originalTransaction as OnyxEntry<Transaction>),
        created: getFormattedCreated(originalTransaction as OnyxEntry<Transaction>),
        transactionID: reviewDuplicates?.transactionID,
        transactionIDList: removeSettledAndApprovedTransactions(reviewDuplicates?.duplicates ?? []),
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

function shouldShowRTERViolationMessage(transactions?: Transaction[]) {
    return transactions?.length === 1 && hasPendingUI(transactions?.at(0), getTransactionViolations(transactions?.at(0)?.transactionID, allTransactionViolations));
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
    getDescription,
    getRequestType,
    isManualRequest,
    isScanRequest,
    getAmount,
    getAttendees,
    getTaxAmount,
    getTaxCode,
    getCurrency,
    getDistanceInMeters,
    getCardID,
    getOriginalCurrency,
    getOriginalAmount,
    getFormattedAttendees,
    getMerchant,
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
    isDistanceRequest,
    isFetchingWaypointsFromServer,
    isExpensifyCardTransaction,
    isCardTransaction,
    isDuplicate,
    isPending,
    isPosted,
    isOnHold,
    isOnHoldByTransactionID,
    getWaypoints,
    isAmountMissing,
    isMerchantMissing,
    isPartialMerchant,
    isCreatedMissing,
    areRequiredFieldsEmpty,
    hasMissingSmartscanFields,
    hasPendingRTERViolation,
    allHavePendingRTERViolation,
    hasPendingUI,
    getWaypointIndex,
    waypointHasValidAddress,
    getRecentTransactions,
    hasReservationList,
    hasViolation,
    hasBrokenConnectionViolation,
    shouldShowBrokenConnectionViolation,
    shouldShowBrokenConnectionViolationForMultipleTransactions,
    hasNoticeTypeViolation,
    hasWarningTypeViolation,
    isCustomUnitRateIDForP2P,
    getRateID,
    getTransaction,
    compareDuplicateTransactionFields,
    getTransactionID,
    buildNewTransactionAfterReviewingDuplicates,
    buildTransactionsMergeParams,
    getReimbursable,
    isPayAtEndExpense,
    removeSettledAndApprovedTransactions,
    getCardName,
    hasReceiptSource,
    shouldShowAttendees,
    getAllSortedTransactions,
    getFormattedPostedDate,
    getCategoryTaxCodeAndAmount,
    isPerDiemRequest,
    isViolationDismissed,
    isBrokenConnectionViolation,
    checkIfShouldShowMarkAsCashButton,
    shouldShowRTERViolationMessage,
};

export type {TransactionChanges};
