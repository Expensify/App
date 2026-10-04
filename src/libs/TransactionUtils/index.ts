import type {LocaleContextProps} from '@components/LocaleContextProvider';
import type {Coordinate} from '@components/MapView/MapViewTypes';
import utils from '@components/MapView/utils';
import type {UnreportedExpenseListItemType} from '@components/Search/SearchList/ListItem/types';
import type {TransactionWithOptionalSearchFields} from '@components/TransactionItemRow/types';

import type {CurrencyListActionsContextType} from '@hooks/useCurrencyList';

import {convertAttendeesToArray, normalizeAttendees} from '@libs/AttendeeUtils';
import {isTravelCardTransaction} from '@libs/CardUtils';
import {isCategoryMissing} from '@libs/CategoryUtils';
import type {MachineDateFormat} from '@libs/DateUtils';
import DateUtils from '@libs/DateUtils';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import {roundToTwoDecimalPlaces} from '@libs/NumberUtils';
import {
    canSubmitPerDiemExpenseFromWorkspace,
    getCommaSeparatedTagNameWithSanitizedColons,
    getPerDiemCustomUnit,
    isAttendeeTrackingEnabled as isAttendeeTrackingEnabledForPolicy,
} from '@libs/PolicyUtils';
import {getOriginalMessage, getReportAction, isMoneyRequestAction} from '@libs/ReportActionsUtils';
import {getReportOrDraftReport, getReportTransactions, getTransactionDetails, isInvoiceReport, isIOUReport, isThread} from '@libs/ReportUtils';
import StringUtils from '@libs/StringUtils';
import {isInvalidMerchantValue} from '@libs/ValidationUtils';

import type {IOURequestType, IOUType} from '@src/CONST';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Card, CardList, OnyxInputOrEntry, PersonalDetails, Policy, RecentWaypoint, Report, Transaction} from '@src/types/onyx';
import type {Attendee, DistanceExpenseType} from '@src/types/onyx/IOU';
import type {Errors, PendingAction} from '@src/types/onyx/OnyxCommon';
import type {Comment, UnreportedTransaction, Waypoint, WaypointCollection} from '@src/types/onyx/Transaction';

import type {Locale as DateFnsLocale} from 'date-fns';
import type {NullishDeep, OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';

import {differenceInCalendarDays, format, isValid, parse, parseISO} from 'date-fns';
import {Str} from 'expensify-common';
import {deepEqual} from 'fast-equals';

import {hasValidModifiedAmount, isAmountMissing, isFailedScanAmountPlaceholder} from './amountUtils';
// These cycle imports are safe because buildOptimisticTransaction, getUpdatedTransaction, and the duplicates and tax helpers were extracted from this file to keep it under the max-lines limit.
// They import helper functions from this file, and this file re-exports them. Neither side calls the other at initialization time.
// eslint-disable-next-line import/no-cycle
import buildOptimisticTransaction from './buildOptimisticTransaction';
// eslint-disable-next-line import/no-cycle
import {
    buildMergeDuplicatesParams,
    buildNewTransactionAfterReviewingDuplicates,
    canMergeDuplicates,
    compareDuplicateTransactionFields,
    removeSettledAndApprovedTransactions,
    removeTransactionFromDuplicateTransactionViolation,
} from './duplicates';
import getDistanceInMeters from './getDistanceInMeters';
import getSelectedRouteKey from './getSelectedRouteKey';
// eslint-disable-next-line import/no-cycle
import {getClearedPendingFields, getDistanceMerchantForTransaction, getUpdatedTransaction} from './getUpdatedTransaction';
// eslint-disable-next-line import/no-cycle
import {
    calculateTaxAmount,
    getCalculatedTaxAmount,
    getCategoryTaxDetails,
    getDefaultTaxCode,
    getDistanceRateTaxUpdates,
    getEnabledTaxRateCount,
    getTaxName,
    getTaxRateTitle,
    getTaxValue,
    getWorkspaceTaxesSettingsName,
    hasTaxRateWithMatchingValue,
    transformedTaxRates,
} from './tax';
// eslint-disable-next-line import/no-cycle
import {
    allHavePendingRTERViolation,
    getTransactionViolations,
    getUnsuppressibleBrokenConnectionTransactionID,
    getVisibleTransactionViolations,
    hasAnyPendingRTERViolation,
    hasAnyTransactionWithoutRTERViolation,
    hasCustomUnitOutOfPolicyViolation,
    hasDuplicateTransactions,
    hasNoticeTypeViolation,
    hasPendingRTERViolation,
    hasPendingUI,
    hasSubmissionBlockingViolationInList,
    hasSubmissionBlockingViolationInReport,
    hasSubmissionBlockingViolations,
    hasTransactionBeenRejected,
    hasViolation,
    hasWarningTypeViolation,
    isBrokenConnectionViolation,
    isDuplicate,
    isTransactionSubmittable,
    isViolationDismissed,
    mergeProhibitedViolations,
    shouldShowBrokenConnectionViolation,
    shouldShowBrokenConnectionViolationForMultipleTransactions,
    shouldShowViolation,
    shouldSuppressBrokenConnectionStatus,
} from './violations';

function isDeletedTransaction(transaction: {reportID?: string}): boolean {
    return transaction.reportID === CONST.REPORT.TRASH_REPORT_ID;
}

function isDistanceRequest(transaction: OnyxEntry<Transaction>): boolean {
    const requestType = transaction?.iouRequestType;
    return requestType === CONST.IOU.REQUEST_TYPE.DISTANCE || isDistanceExpenseType(requestType);
}

function isDistanceTypeRequest(transaction: OnyxEntry<Transaction>): boolean {
    return transaction?.iouRequestType === CONST.IOU.REQUEST_TYPE.DISTANCE;
}

/**
 * Compare two waypoint collections by their addresses only (ignoring coordinates/names), which is
 * the meaningful signal for "did the user change the route?". Numeric fields like lat/lng can drift
 * due to rounding in transaction backups, so they're excluded.
 */
function haveWaypointAddressesChanged(oldWaypoints: WaypointCollection | undefined, newWaypoints: WaypointCollection | undefined): boolean {
    const toAddresses = (collection: WaypointCollection | undefined) =>
        Object.fromEntries(Object.entries(collection ?? {}).map(([key, waypoint]) => [key, waypoint && 'address' in waypoint ? waypoint.address : undefined]));
    return !deepEqual(toAddresses(oldWaypoints), toAddresses(newWaypoints));
}

function isMapDistanceRequest(transaction: OnyxEntry<Transaction>): boolean {
    return transaction?.iouRequestType === CONST.IOU.REQUEST_TYPE.DISTANCE_MAP;
}

function isGPSDistanceRequest(transaction: OnyxEntry<Transaction>): boolean {
    return transaction?.iouRequestType === CONST.IOU.REQUEST_TYPE.DISTANCE_GPS;
}

function isManualDistanceRequest(transaction: OnyxEntry<Transaction>): boolean {
    return transaction?.iouRequestType === CONST.IOU.REQUEST_TYPE.DISTANCE_MANUAL;
}

function isOdometerDistanceRequest(transaction: OnyxEntry<Transaction>): boolean {
    return transaction?.iouRequestType === CONST.IOU.REQUEST_TYPE.DISTANCE_ODOMETER;
}

function hasAppliedCommuterExclusion(transaction: OnyxEntry<Transaction>): boolean {
    return isDistanceRequest(transaction) && (transaction?.comment?.customUnit?.commuterExclusion ?? 0) > 0;
}

function shouldUseCommuterExclusionForDisplay(transaction: OnyxEntry<Transaction>, isPolicyExpenseChat: boolean): boolean {
    return hasAppliedCommuterExclusion(transaction) && isPolicyExpenseChat;
}

function getDisplayTransactionWithoutInvalidCommuterExclusion({
    transaction,
    isPolicyExpenseChat,
    policy,
    policies,
    translate,
    getCurrencySymbol,
}: {
    transaction: OnyxEntry<Transaction>;
    isPolicyExpenseChat: boolean;
    policy?: OnyxEntry<Policy>;
    policies?: OnyxCollection<Policy>;
    translate: LocaleContextProps['translate'];
    getCurrencySymbol: CurrencyListActionsContextType['getCurrencySymbol'];
}): OnyxEntry<Transaction> {
    const hasCommuterExclusion = hasAppliedCommuterExclusion(transaction);
    if (!transaction || (hasCommuterExclusion && isPolicyExpenseChat)) {
        return transaction;
    }

    const customUnit = transaction.comment?.customUnit;
    const fullDistance = customUnit?.quantity;
    if (!hasCommuterExclusion || typeof fullDistance !== 'number') {
        return transaction;
    }

    const mileageRate = DistanceRequestUtils.getRateByCustomUnitRateIDAcrossPolicies({customUnitRateID: customUnit?.customUnitRateID, policy, policies});
    const rate = mileageRate?.rate;
    const unit = customUnit?.distanceUnit ?? mileageRate?.unit;
    if (!unit || !rate) {
        return transaction;
    }

    const fullDistanceInMeters = DistanceRequestUtils.convertToDistanceInMeters(fullDistance, unit);
    const fullDistanceAmount = DistanceRequestUtils.getDistanceRequestAmount(fullDistanceInMeters, unit, rate);
    const storedAmount = hasValidModifiedAmount(transaction) ? Number(transaction.modifiedAmount) : (transaction.amount ?? 0);
    const normalizedAmount = storedAmount < 0 ? -fullDistanceAmount : fullDistanceAmount;
    const currency = mileageRate?.currency ?? getCurrency(transaction);
    const normalizedMerchant = getDistanceMerchantForTransaction({
        transaction,
        distanceInMeters: fullDistanceInMeters,
        unit,
        rate,
        currency,
        translate,
        getCurrencySymbol,
    });

    return {
        ...transaction,
        amount: normalizedAmount,
        convertedAmount: undefined,
        modifiedAmount: undefined,
        merchant: normalizedMerchant,
        modifiedMerchant: undefined,
        currency,
    };
}

/**
 * Whether a distance expense's receipt is a map/route receipt (as opposed to an odometer photo or a
 * pure manual entry that has no route). Used to decide whether the full distance e-receipt (map +
 * amount + waypoints) should be shown. A merged distance expense can be typed `distance-manual` yet
 * still carry waypoints, so the presence of waypoints keeps those included.
 */
function isMapBasedDistanceRequest(transaction: OnyxEntry<Transaction>): boolean {
    if (!isDistanceRequest(transaction) || isOdometerDistanceRequest(transaction)) {
        return false;
    }
    const hasWaypoints = Object.keys(getWaypoints(transaction) ?? {}).length > 0;
    return isMapDistanceRequest(transaction) || isGPSDistanceRequest(transaction) || hasWaypoints;
}

function isScanRequest(transaction: OnyxEntry<Pick<Transaction, 'iouRequestType'>>): boolean {
    return transaction?.iouRequestType === CONST.IOU.REQUEST_TYPE.SCAN;
}

/** The fields a Scan confirmation lets the user fill in behind "Show more", plus the type that tells it is a scan. */
type ManuallyEnteredScanFields = Pick<Transaction, 'iouRequestType' | 'isAmountSet' | 'isMerchantSet' | 'isCreatedSet'>;

/**
 * The Scan confirmation's amount / merchant / date are all-or-nothing: leave all three blank to let SmartScan read
 * them, or fill all three in to submit as a manual expense whose receipt is never scanned over.
 */
function hasAllManuallyEnteredScanFields(transaction: OnyxEntry<ManuallyEnteredScanFields>): boolean {
    return isScanRequest(transaction) && !!transaction?.isAmountSet && !!transaction?.isMerchantSet && !!transaction?.isCreatedSet;
}

/** Whether the user filled in at least one of those three fields, which is what turns the scan into a manual expense. */
function hasAnyManuallyEnteredScanField(transaction: OnyxEntry<ManuallyEnteredScanFields>): boolean {
    return isScanRequest(transaction) && (!!transaction?.isAmountSet || !!transaction?.isMerchantSet || !!transaction?.isCreatedSet);
}

/**
 * Whether the user started filling the three fields in but stopped short, which blocks confirmation.
 * `canEnterScanFieldsManually` says whether the surface offers those fields at all, since splits, moved tracked
 * expenses and test receipts carry the same flags without ever having shown them.
 */
function isPartiallyEnteredScanExpense(transaction: OnyxEntry<ManuallyEnteredScanFields>, canEnterScanFieldsManually = false): boolean {
    return canEnterScanFieldsManually && hasAnyManuallyEnteredScanField(transaction) && !hasAllManuallyEnteredScanFields(transaction);
}

function isPerDiemRequest(transaction: OnyxEntry<Transaction>): boolean {
    if (transaction?.iouRequestType === CONST.IOU.REQUEST_TYPE.PER_DIEM) {
        return true;
    }
    return transaction?.comment?.customUnit?.name === CONST.CUSTOM_UNITS.NAME_PER_DIEM_INTERNATIONAL;
}

function isTimeRequest(transaction: OnyxEntry<Transaction>): boolean {
    return transaction?.iouRequestType === CONST.IOU.REQUEST_TYPE.TIME;
}

function isDistanceExpenseType(requestType: IOURequestType | undefined): requestType is DistanceExpenseType {
    return (
        requestType === CONST.IOU.REQUEST_TYPE.DISTANCE ||
        requestType === CONST.IOU.REQUEST_TYPE.DISTANCE_MAP ||
        requestType === CONST.IOU.REQUEST_TYPE.DISTANCE_MANUAL ||
        requestType === CONST.IOU.REQUEST_TYPE.DISTANCE_GPS ||
        requestType === CONST.IOU.REQUEST_TYPE.DISTANCE_ODOMETER
    );
}

function isCorporateCardTransaction(transaction: OnyxEntry<Transaction>): boolean {
    return isManagedCardTransaction(transaction) && transaction?.comment?.liabilityType === CONST.TRANSACTION.LIABILITY_TYPE.RESTRICT;
}

function getRequestType(transaction: OnyxEntry<Transaction>): IOURequestType {
    return transaction?.iouRequestType ?? CONST.IOU.REQUEST_TYPE.MANUAL;
}

/**
 * Determines the transaction type based on custom unit name, comment type or card name.
 * Returns 'distance' for Distance transactions, 'perDiem' for Per Diem International transactions,
 * 'time' for time transactions,
 * 'cash' for cash transactions, or 'card' for card transactions.
 *
 * @param transaction - The transaction to check
 * @param card - Optional card to check for cash transactions
 * @returns The transaction type: 'distance', 'perDiem', 'time', 'cash', or 'card'
 */
function getTransactionType(transaction: OnyxEntry<Transaction>, card?: Card): ValueOf<typeof CONST.SEARCH.TRANSACTION_TYPE> {
    if (isDistanceRequest(transaction)) {
        return CONST.SEARCH.TRANSACTION_TYPE.DISTANCE;
    }

    if (isPerDiemRequest(transaction)) {
        return CONST.SEARCH.TRANSACTION_TYPE.PER_DIEM;
    }

    if (isTimeRequest(transaction)) {
        return CONST.SEARCH.TRANSACTION_TYPE.TIME;
    }

    if (isManagedCardTransaction(transaction)) {
        return CONST.SEARCH.TRANSACTION_TYPE.CARD;
    }

    if (card?.cardName === CONST.COMPANY_CARDS.CARD_NAME.CASH) {
        return CONST.SEARCH.TRANSACTION_TYPE.CASH;
    }

    if (!transaction?.cardName || transaction?.cardName?.includes(CONST.EXPENSE.TYPE.CASH_CARD_NAME)) {
        return CONST.SEARCH.TRANSACTION_TYPE.CASH;
    }

    return CONST.SEARCH.TRANSACTION_TYPE.CARD;
}

/**
 * Returns the corresponding translation key for expense type
 */
function getExpenseTypeTranslationKey(expenseType: ValueOf<typeof CONST.SEARCH.TRANSACTION_TYPE>): TranslationPaths {
    // eslint-disable-next-line default-case
    switch (expenseType) {
        case CONST.SEARCH.TRANSACTION_TYPE.DISTANCE:
            return 'common.distance';
        case CONST.SEARCH.TRANSACTION_TYPE.CARD:
            return 'common.card';
        case CONST.SEARCH.TRANSACTION_TYPE.CASH:
            return 'iou.cash';
        case CONST.SEARCH.TRANSACTION_TYPE.PER_DIEM:
            return 'common.perDiem';
        case CONST.SEARCH.TRANSACTION_TYPE.TIME:
            return 'iou.time';
    }
}

/**
 * Returns the corresponding translation key for card type
 */
function getDetailedExpenseTypeTranslationKey(transaction: OnyxEntry<Transaction>, card?: Card): TranslationPaths {
    if (isPending(transaction)) {
        return 'iou.pending';
    }
    if (isTravelCardTransaction(transaction?.feedCountry, card)) {
        return 'cardTransactions.travelCard';
    }
    const transactionType = getTransactionType(transaction, card);
    if (transactionType !== CONST.SEARCH.TRANSACTION_TYPE.CARD) {
        return getExpenseTypeTranslationKey(transactionType);
    }
    if (isExpensifyCardTransaction(transaction)) {
        return 'cardTransactions.expensifyCard';
    }
    if (isManagedCardTransaction(transaction)) {
        return 'cardTransactions.companyCard';
    }
    return 'cardTransactions.personalCard';
}

function getReceiptTypeTranslationKey(receiptType: ValueOf<typeof CONST.SEARCH.RECEIPT_TYPE>): TranslationPaths {
    // eslint-disable-next-line default-case
    switch (receiptType) {
        case CONST.SEARCH.RECEIPT_TYPE.ERECEIPT:
            return 'search.receiptTypeValues.ereceipt';
        case CONST.SEARCH.RECEIPT_TYPE.ITEMIZED:
            return 'search.receiptTypeValues.itemized';
        case CONST.SEARCH.RECEIPT_TYPE.HOTEL:
            return 'search.receiptTypeValues.hotel';
    }
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

function isScanningTransaction(transaction: OnyxEntry<Transaction>): boolean {
    return (isScanRequest(transaction) && isMerchantMissing(transaction) && isAmountMissing(transaction)) || (isScanRequest(transaction) && isScanning(transaction));
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

/**
 * Whether the transaction already has its receipt stored server-side.
 */
function hasUploadedReceipt(transaction: OnyxInputOrEntry<Transaction> | undefined): boolean {
    return !!transaction?.receipt?.receiptID;
}

/** Check if the receipt has the source file */
function hasReceiptSource(transaction: OnyxInputOrEntry<Transaction>): boolean {
    return !!transaction?.receipt?.source;
}

/** Check if odometer image has the source file */
function hasOdometerImageSource(transaction: OnyxInputOrEntry<Transaction>, imageType: string): boolean {
    const odometerImage = imageType === CONST.IOU.ODOMETER_IMAGE_TYPE.START ? transaction?.comment?.odometerStartImage : transaction?.comment?.odometerEndImage;
    if (!odometerImage) {
        return false;
    }
    if (typeof odometerImage === 'string') {
        return odometerImage.length > 0;
    }
    if ('uri' in odometerImage) {
        return typeof odometerImage.uri === 'string' && odometerImage.uri.length > 0;
    }
    return true;
}

function isDemoTransaction(transaction: OnyxInputOrEntry<Transaction>): boolean {
    return transaction?.comment?.isDemoTransaction ?? false;
}

function isMerchantMissing(transaction: OnyxEntry<Transaction>) {
    if (transaction?.modifiedMerchant && transaction.modifiedMerchant !== '') {
        return isInvalidMerchantValue(transaction.modifiedMerchant);
    }
    return isInvalidMerchantValue(transaction?.merchant);
}

/**
 * Determine if we should show the attendee selector for a given expense on a give policy.
 */
function shouldShowAttendees(iouType: IOUType, policy: OnyxEntry<Policy>): boolean {
    if ((iouType !== CONST.IOU.TYPE.SUBMIT && iouType !== CONST.IOU.TYPE.CREATE && iouType !== CONST.IOU.TYPE.TRACK) || !policy?.id || policy?.type !== CONST.POLICY.TYPE.CORPORATE) {
        return false;
    }

    return isAttendeeTrackingEnabledForPolicy(policy);
}

/**
 * Check if the merchant is partial i.e. `(none)`
 */
function isPartialMerchant(merchant: string): boolean {
    return merchant === CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT;
}

/**
 * Builds the optimistic transaction used when an IOU report is converted to an expense report.
 *
 * Expense reports store amounts with the opposite sign of IOU reports (see `getAmount`/`getConvertedAmount`),
 * so `amount`, `modifiedAmount` and `convertedAmount` are negated to match the expense-report convention.
 * Absent converted values are not added so they keep being derived from the amount.
 */
function getNegatedAmountTransaction(transaction: Transaction): Transaction {
    return {
        ...transaction,
        amount: -transaction.amount,
        modifiedAmount: hasValidModifiedAmount(transaction) ? -Number(transaction.modifiedAmount) : '',
        ...(transaction.convertedAmount != null && {convertedAmount: -transaction.convertedAmount}),
    };
}

function isCreatedMissing(transaction: OnyxEntry<Transaction>) {
    if (!transaction) {
        return true;
    }
    return transaction?.created === '' && (!transaction.created || transaction.modifiedCreated === '');
}

function areRequiredFieldsEmpty(transaction: OnyxEntry<Transaction>, transactionReport: OnyxEntry<Report>): boolean {
    const isFromExpenseReport = transactionReport?.type === CONST.REPORT.TYPE.EXPENSE;
    const isUnreportedExpense = isExpenseUnreported(transaction);
    const isZeroAmountAllowed = isFromExpenseReport || isUnreportedExpense;
    const isMissingAmount = isFailedScanAmountPlaceholder(transaction) || (!isZeroAmountAllowed && isAmountMissing(transaction, false));

    return (isFromExpenseReport && isMerchantMissing(transaction)) || isCreatedMissing(transaction) || isMissingAmount;
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
function getFormattedPostedDate(transaction: OnyxInputOrEntry<Transaction>, dateFormat: MachineDateFormat = CONST.DATE.FNS_FORMAT_STRING): string {
    const postedDate = getPostedDate(transaction);
    const parsedDate = parse(postedDate, 'yyyyMMdd', new Date());

    if (isValid(parsedDate)) {
        return DateUtils.formatMachineDateWithUTCTimeZone(format(parsedDate, 'yyyy-MM-dd'), dateFormat);
    }
    return '';
}

/**
 * Return the currency field from the transaction, return the modifiedCurrency if present.
 */
function getCurrency(transaction: OnyxInputOrEntry<Pick<Transaction, 'modifiedCurrency' | 'currency'>>): string {
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
    if (!destinationCurrency) {
        return false;
    }

    const transactionCurrency = getCurrency(transaction);
    // sourceCurrency is undefined for unreported expenses (e.g. Self DM) since there's no source report.
    // Fall back to the transaction's own currency so cross-currency detection still works.
    const effectiveSourceCurrency = sourceCurrency ?? transactionCurrency;

    return effectiveSourceCurrency !== destinationCurrency && transactionCurrency !== destinationCurrency;
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
 * Whether the transaction's route distance is already known locally (from a computed route or stored quantity),
 * so amount/merchant can be recalculated without waiting for the server.
 *
 * A waypoint edit whose route is still being computed by the server zeroes the amount but leaves the
 * quantity/routes of the pre-edit route in place, so a zero amount means the stored distance is stale.
 */
function hasLocallyKnownDistance(transaction: OnyxInputOrEntry<Transaction>): boolean {
    const hasDistanceSource = !!transaction?.comment?.customUnit?.quantity || !!transaction?.routes?.route0?.distance;
    return hasDistanceSource && !!getAmount(transaction);
}

// Editing any of these fields makes the server regenerate the distance map receipt. `customUnitRateID`/`distance`
// aren't typed `pendingFields` keys (they live on the comment), so this is matched by name rather than property access.
const DISTANCE_RECEIPT_REGENERATION_FIELDS = new Set(['waypoints', 'distance', 'merchant', 'customUnitRateID']);

/**
 * After a distance/rate/waypoint edit the server regenerates the map receipt and invalidates the prior URL, but the
 * local `receipt.source` only refreshes once the Pusher push arrives. While any of these edits are pending the stored
 * map image is stale and can't be regenerated locally.
 */
function hasPendingDistanceReceiptRegeneration(transaction: OnyxInputOrEntry<Transaction>): boolean {
    const pendingFields = transaction?.pendingFields;
    if (!pendingFields) {
        return false;
    }
    const hasPendingRegenerationField = Object.entries(pendingFields).some(([field, pendingAction]) => !!pendingAction && DISTANCE_RECEIPT_REGENERATION_FIELDS.has(field));
    return hasPendingRegenerationField;
}

/**
 * Return the merchant field from the transaction, return the modifiedMerchant if present.
 */
function getMerchant(transaction: OnyxInputOrEntry<Transaction>): string {
    return transaction?.modifiedMerchant ? transaction.modifiedMerchant : (transaction?.merchant ?? '');
}

function getMerchantOrDescription(transaction: OnyxEntry<Transaction>) {
    return !isMerchantMissing(transaction) ? getMerchant(transaction) : getDescription(transaction);
}

/**
 * Resolves the merchant string to display for a transaction. Returns the localized scanning label while a receipt is
 * scanning, and normalizes the `DEFAULT_MERCHANT` ("Expense") and `PARTIAL_TRANSACTION_MERCHANT` ("(none)") placeholder
 * values to an empty string so they never leak into the UI.
 */
function getMerchantName(transaction: TransactionWithOptionalSearchFields, translate: (key: TranslationPaths) => string): string {
    const shouldShowMerchant = transaction.shouldShowMerchant ?? true;

    let merchant = transaction?.formattedMerchant ?? getMerchant(transaction);

    if (isScanning(transaction) && shouldShowMerchant) {
        merchant = translate('iou.receiptStatusTitle');
    }

    const merchantName = StringUtils.getFirstLine(merchant);
    return merchantName !== CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT && merchantName !== CONST.TRANSACTION.DEFAULT_MERCHANT ? (merchantName ?? '') : '';
}

function getReportOwnerAsAttendee(creatorDetails: OnyxEntry<PersonalDetails>): Attendee | undefined {
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const creatorLogin = creatorDetails?.login || creatorDetails?.displayName || '';

    if (!creatorLogin) {
        return;
    }

    const creatorDisplayName = creatorDetails?.displayName ?? creatorLogin;
    return {
        email: creatorLogin,
        displayName: creatorDisplayName,
        avatarUrl: (creatorDetails?.avatarThumbnail ?? creatorDetails?.avatar ?? '') as string,
    };
}

/**
 * Return report owner as default attendee
 */
function getReportOwnerAccountIDAsAttendee(transaction: OnyxInputOrEntry<Transaction>, currentUserAccountID: number | undefined) {
    if (transaction?.reportID === undefined) {
        return;
    }

    // Get the creator of the transaction by looking at the owner of the report linked to the transaction
    const report = getReportOrDraftReport(transaction?.reportID);
    // For unreported expenses, the creator ID should belong to the current user because the transaction isn’t part of any report yet
    const creatorAccountID = isExpenseUnreported(transaction) ? currentUserAccountID : report?.ownerAccountID;
    return creatorAccountID;
}

/**
 * Return the list of attendees present on the transaction, if it's empty return report owner as default attendee
 */
function getOriginalAttendees(transaction: OnyxInputOrEntry<Transaction>, reportOwnerAsAttendee: Attendee | undefined): Attendee[] {
    const rawAttendees = transaction?.comment?.attendees;
    const attendees = normalizeAttendees(convertAttendeesToArray(rawAttendees));
    if (attendees.length === 0 && reportOwnerAsAttendee !== undefined) {
        attendees.push(reportOwnerAsAttendee);
    }
    return attendees;
}

/**
 * Return the list of modified attendees if present otherwise list of attendees
 */
function getAttendees(transaction: OnyxInputOrEntry<Transaction>, reportOwnerAsAttendee?: Attendee): Attendee[] {
    const rawAttendees = transaction?.modifiedAttendees ?? transaction?.comment?.attendees;
    const attendees = normalizeAttendees(convertAttendeesToArray(rawAttendees));

    if (attendees.length === 0 && reportOwnerAsAttendee !== undefined) {
        attendees.push(reportOwnerAsAttendee);
    }
    return attendees;
}

/**
 * Returns attendees joined as a display string. Pass `localeCompare` to sort alphabetically (matches the pill sort);
 * omit it to keep insertion order — used by non-React callers that don't want to thread the comparator.
 * Strips the SMS domain so phone-login attendees render the same as in the rendered pills.
 */
function getAttendeesListDisplayString(attendees: Attendee[], localeCompare?: LocaleContextProps['localeCompare']): string {
    const getName = (a: Attendee) => Str.removeSMSDomain(a.displayName ?? a.email ?? '');
    const ordered = localeCompare
        ? // Lowercase to match sortAlphabetically (the pill sort) so joined string and pill order never disagree on case.
          [...attendees].sort((a, b) => localeCompare(getName(a).toLowerCase(), getName(b).toLowerCase()))
        : attendees;
    return ordered.map(getName).join(', ');
}

/**
 * Return the list of attendees as a string and modified list of attendees as a string if present.
 */
function getFormattedAttendees(modifiedAttendees?: Attendee[], attendees?: Attendee[], localeCompare?: LocaleContextProps['localeCompare']): [string, string] {
    const oldAttendees = modifiedAttendees ?? [];
    const newAttendees = attendees ?? [];
    return [getAttendeesListDisplayString(oldAttendees, localeCompare), getAttendeesListDisplayString(newAttendees, localeCompare)];
}

/**
 * Return the reimbursable value. Defaults to true to match BE logic.
 */
function getReimbursable(transaction: OnyxInputOrEntry<Transaction>): boolean {
    return transaction?.reimbursable ?? true;
}

function hasNonReimbursableTransactions(transactions?: Transaction[]): boolean {
    return !!transactions?.some((transaction) => !getReimbursable(transaction));
}

/**
 * Return the mccGroup field from the transaction, return the modifiedMCCGroup if present.
 */
function getMCCGroup(transaction: Transaction): ValueOf<typeof CONST.MCC_GROUPS> | undefined {
    return transaction?.modifiedMCCGroup ? transaction.modifiedMCCGroup : transaction?.mccGroup;
}

function getMCCForDisplay(mcc: number | string | null | undefined): string {
    if (!mcc || mcc === CONST.DEFAULT_NUMBER_ID || mcc === String(CONST.DEFAULT_NUMBER_ID)) {
        return '';
    }

    return String(mcc);
}

function hasDisplayableMCC(mcc: number | string | null | undefined): boolean {
    return getMCCForDisplay(mcc) !== '';
}

/** Whether the draft holds tab-entered input (waypoints) that is lost when the flow is abandoned. */
function doesMoneyRequestDraftHaveUserInput(transaction: OnyxEntry<Transaction>): boolean {
    return Object.keys(getValidWaypoints(getWaypoints(transaction))).length > 0;
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
 * Caps an exchange rate at 4 decimals for display, matching Expensify Classic, which rounds and pads to
 * exactly 4 decimals (`0.272294077603812` -> `0.2723`, `1.5` -> `1.5000`). `toFixed` handles the exponential
 * form small rates stringify into (`7.27431439586819e-7` -> `0.0000`), and a finite guard passes a
 * non-numeric rate through untouched so we never render `NaN`.
 */
function formatExchangeRateForDisplay(rate: string | number): string {
    const parsedRate = Number(rate);
    return Number.isFinite(parsedRate) ? parsedRate.toFixed(CONST.EXCHANGE_RATE_DISPLAY_DECIMALS) : String(rate);
}

/**
 * Returns the exchange rate for a transaction, based on its group or currencyConversionRate.
 *
 * When `shouldFormatRate` is true (display only), the rate is rounded and padded to exactly 4 decimals
 * to match Expensify Classic. The default (false) keeps the raw value so the non-display consumers, the
 * search/report sort keys and the emptiness predicate, compare on the full precision exactly as they do today.
 */
function getExchangeRate(transaction: TransactionWithOptionalSearchFields, reportCurrency?: string, shouldFormatRate = false) {
    const fromCurrency = getCurrency(transaction);

    // On the report view, "unconverted" means the transaction currency matches the report currency.
    // groupCurrency reflects the user's default workspace and is unrelated to the report being viewed,
    // so we must gate on reportCurrency here to match Expensify Classic behavior.
    if (reportCurrency && fromCurrency === reportCurrency) {
        return '';
    }

    // groupExchangeRate: search-page rate (fromCurrency → groupCurrency).
    if (transaction.groupExchangeRate != null && transaction.groupCurrency && fromCurrency !== transaction.groupCurrency) {
        const groupRate = Number(transaction.groupExchangeRate);
        if (groupRate !== 1) {
            const rate = shouldFormatRate ? formatExchangeRateForDisplay(transaction.groupExchangeRate) : transaction.groupExchangeRate;
            return `${rate} ${fromCurrency}/${transaction.groupCurrency}`;
        }
    }

    // currencyConversionRate: report-layout rate (fromCurrency → reportCurrency).
    // When no reportCurrency is provided (e.g. search sort), fall back to groupCurrency so we can still
    // surface a meaningful rate. We intentionally do not use transaction.currency here, since it reflects
    // the pre-modification currency and is almost never the correct conversion target.
    const conversionToCurrency = reportCurrency ?? transaction.groupCurrency;
    if (conversionToCurrency && transaction.currencyConversionRate != null && fromCurrency !== conversionToCurrency) {
        const conversionRate = Number(transaction.currencyConversionRate);
        if (conversionRate !== 1) {
            const rate = shouldFormatRate ? formatExchangeRateForDisplay(transaction.currencyConversionRate) : transaction.currencyConversionRate;
            return `${rate} ${fromCurrency}/${conversionToCurrency}`;
        }
    }

    return '';
}

/**
 * Return the tag from the transaction. When the tagIndex is passed, return the tag based on the index.
 * This "tag" field has no "modified" complement.
 */
function getTag(transaction: OnyxInputOrEntry<Pick<Transaction, 'tag'>>, tagIndex?: number): string {
    if (tagIndex !== undefined) {
        const tagsArray = getTagArrayFromName(transaction?.tag ?? '');
        return tagsArray.at(tagIndex) ?? '';
    }

    return transaction?.tag ?? '';
}

function getTagForDisplay(transaction: OnyxEntry<Pick<Transaction, 'tag'>>, tagIndex?: number): string {
    return getCommaSeparatedTagNameWithSanitizedColons(getTag(transaction, tagIndex));
}

function getCreated(transaction: OnyxInputOrEntry<Transaction>): string {
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    return transaction?.modifiedCreated ? transaction.modifiedCreated : transaction?.created || '';
}

/**
 * Return the created field from the transaction, return the modifiedCreated if present.
 */
function getFormattedCreated(transaction: OnyxInputOrEntry<Transaction>, dateFormat: string = CONST.DATE.FNS_FORMAT_STRING, dateFnsLocale?: DateFnsLocale): string {
    const created = getCreated(transaction);
    return DateUtils.formatWithUTCTimeZone(created, dateFormat, dateFnsLocale);
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
function isManagedCardTransaction(transaction: OnyxEntry<Pick<Transaction, 'managedCard'>>): boolean {
    return !!transaction?.managedCard;
}

/**
 * Determine whether a transaction is imported from a credit card.
 * This includes managed cards (Expensify/Company cards) and personal cards imported via bank connection.
 */
function isFromCreditCardImport(transaction: OnyxEntry<Transaction>): boolean {
    // CSV-imported card transactions (bank === 'upload') must be checked before transactionType to avoid search snapshot inconsistency
    if (transaction?.bank === CONST.COMPANY_CARD.FEED_BANK_NAME.UPLOAD) {
        return false;
    }

    // This can be set in transactions found in the search snapshot
    if (transaction?.transactionType === CONST.SEARCH.TRANSACTION_TYPE.CARD) {
        return true;
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
 * Returns the appropriate delete dialog title for an expense.
 * Shows "Delete pending expense" when deleting a single pending transaction.
 */
function getDeleteExpenseTitle(translate: LocaleContextProps['translate'], transaction: OnyxEntry<Transaction> | undefined, count = 1): string {
    if (count === 1 && isPending(transaction)) {
        return translate('iou.deletePendingExpense');
    }
    return translate('iou.deleteExpense', {count});
}

/**
 * Returns the appropriate delete confirmation prompt for an expense.
 * - Single pending transaction: shows a BYOC-specific warning (may be re-imported once it posts).
 * - Multiple transactions where some are pending: warns that some may be re-imported.
 * - Otherwise: shows the standard delete confirmation.
 */
function getDeleteConfirmationPrompt(translate: LocaleContextProps['translate'], transaction: OnyxEntry<Transaction> | undefined, count = 1, hasSomePending = false): string {
    if (count === 1 && isPending(transaction)) {
        return translate('iou.deleteConfirmationPendingBYOC');
    }
    if (count > 1 && hasSomePending) {
        return translate('iou.deleteConfirmationSomePendingBYOC');
    }
    return translate('iou.deleteConfirmation', {count});
}

/**
 * Check if all transactions are pending (includes both Expensify Card and BYOC card transactions).
 */
function hasOnlyPendingCardTransactions(transactions: Array<OnyxEntry<Transaction>>): boolean {
    return transactions.length > 0 && transactions.every((t) => isPending(t));
}

/**
 * Returns the root of a card transaction's authorization chain.
 *
 * A posted/clearing Expensify Card transaction carries `parentTransactionID` pointing at the root pending auth's
 * `transactionID`. The root pending auth has an empty `parentTransactionID`, so it is its own chain root.
 */
function getCardAuthChainRoot(transaction: OnyxEntry<Transaction>): string | undefined {
    if (transaction?.parentTransactionID) {
        return transaction.parentTransactionID;
    }
    return transaction?.transactionID;
}

/**
 * Returns the set of pending Expensify Card transaction IDs that are already superseded by a posted transaction
 * from the same authorization chain.
 *
 * When a card transaction settles while the client is offline, the backend moves the pending auth to a hidden
 * report and clears it from clients via a realtime Onyx update. A client that missed that update keeps the stale
 * pending row in Onyx, so it renders as a duplicate next to the posted row. Grouping by auth chain lets us hide a
 * pending row whenever its posted counterpart is present, while leaving a genuinely pending row (no posted sibling)
 * untouched.
 */
function getSupersededPendingCardTransactionIDs(transactions: Array<OnyxEntry<Transaction>>): Set<string> {
    const settledRootTransactionIDs = new Set<string>();
    for (const transaction of transactions) {
        if (isExpensifyCardTransaction(transaction) && !isPending(transaction)) {
            const rootTransactionID = getCardAuthChainRoot(transaction);
            if (rootTransactionID) {
                settledRootTransactionIDs.add(rootTransactionID);
            }
        }
    }

    const supersededTransactionIDs = new Set<string>();
    if (settledRootTransactionIDs.size === 0) {
        return supersededTransactionIDs;
    }

    for (const transaction of transactions) {
        if (!transaction || !isExpensifyCardTransaction(transaction) || !isPending(transaction)) {
            continue;
        }
        const rootTransactionID = getCardAuthChainRoot(transaction);
        if (rootTransactionID && settledRootTransactionIDs.has(rootTransactionID)) {
            supersededTransactionIDs.add(transaction.transactionID);
        }
    }

    return supersededTransactionIDs;
}

/**
 * Show a confirm modal explaining that pending card transactions cannot be submitted. Pass shouldShowMarkAsDoneCopy
 * when the triggering button uses the "Mark as done" copy so the modal matches it.
 */
function showPendingCardTransactionsBlockModal(
    showConfirmModal: (options: {title: string; prompt: string; confirmText: string; shouldShowCancelButton: boolean}) => void | Promise<unknown>,
    translate: LocaleContextProps['translate'],
    shouldShowMarkAsDoneCopy = false,
) {
    showConfirmModal({
        title: translate(shouldShowMarkAsDoneCopy ? 'iou.error.unableToMarkAsDone' : 'iou.error.unableToSubmitReport'),
        prompt: translate(shouldShowMarkAsDoneCopy ? 'iou.error.allTransactionsPendingMarkAsDoneDescription' : 'iou.error.allTransactionsPendingDescription'),
        confirmText: translate('common.buttonConfirm'),
        shouldShowCancelButton: false,
    });
}

/**
 * Show a confirm modal explaining that a report with only held expenses cannot be submitted. Pass shouldShowMarkAsDoneCopy
 * when the triggering button uses the "Mark as done" copy so the modal matches it.
 */
function showHeldExpensesBlockModal(
    showConfirmModal: (options: {title: string; prompt: string; confirmText: string; shouldShowCancelButton: boolean}) => void | Promise<unknown>,
    translate: LocaleContextProps['translate'],
    shouldShowMarkAsDoneCopy = false,
) {
    showConfirmModal({
        title: translate(shouldShowMarkAsDoneCopy ? 'iou.error.unableToMarkAsDone' : 'iou.error.unableToSubmitReport'),
        prompt: translate(shouldShowMarkAsDoneCopy ? 'iou.error.allExpensesOnHoldMarkAsDoneDescription' : 'iou.error.allExpensesOnHoldDescription'),
        confirmText: translate('common.buttonConfirm'),
        shouldShowCancelButton: false,
    });
}

/**
 * The transaction is considered scanning if it is a partial transaction, has a receipt, and the receipt is being scanned.
 * Note that this does not include receipts that are being scanned in the background for auditing / smart scan everything, because there should be no indication to the user that the receipt is being scanned.
 */
function isScanning(transaction: OnyxEntry<Transaction>): boolean {
    // Performance optimization: Check the receipt state first (cheapest check) before doing more expensive checks
    if (!isReceiptBeingScanned(transaction)) {
        return false;
    }

    // SmartScan can continue in the background, but a manual amount edit should stop the scanning UI state.
    if (hasValidModifiedAmount(transaction)) {
        return false;
    }

    return isPartialTransaction(transaction) && hasReceipt(transaction);
}

function isReceiptBeingScanned(transaction: OnyxInputOrEntry<Transaction>): boolean {
    return transaction?.receipt?.state === CONST.IOU.RECEIPT_STATE.SCAN_READY || transaction?.receipt?.state === CONST.IOU.RECEIPT_STATE.SCANNING;
}

/**
 * Check if category is being analyzed (manual request creation or auto-categorization grace period)
 */
function isCategoryBeingAnalyzed(transaction: OnyxEntry<Transaction>, report: OnyxEntry<Report>, policy?: OnyxEntry<Policy>): boolean {
    if (!transaction) {
        return false;
    }

    if (policy?.autoCategorizeNewExpenses === false) {
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
    if (isInvoiceReport(report)) {
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
 * Check if the transaction has a defined route.
 * Unlike getDistanceInMeters this ignores `routeDistanceMeters`: an earlier fetch's distance does not make the current route resolved.
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
function getValidWaypoints(waypoints: WaypointCollection | undefined, reArrangeIndexes = false, areWaypointsForGpsDistanceRequest = false): WaypointCollection {
    if (!waypoints) {
        return {};
    }

    if (areWaypointsForGpsDistanceRequest) {
        return waypoints;
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
 * Check if transaction is on hold
 */
function isOnHold(transaction: OnyxEntry<Transaction>): boolean {
    if (!transaction) {
        return false;
    }

    return !!transaction.comment?.hold;
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
 * Returns the number of nights covered by a SmartScanned reservation receipt, or 0 when the
 * transaction has no usable reservation range.
 */
function getReservationNights(transaction: OnyxEntry<Transaction>): number {
    const startDate = transaction?.receipt?.hotelReservationStartDate;
    const endDate = transaction?.receipt?.hotelReservationEndDate;
    if (!startDate || !endDate) {
        return 0;
    }

    // The dates are calendar days with no time component, so they are parsed as local dates and compared by calendar
    // day. Anchoring them to UTC instead would let a DST shift within the stay swallow or invent a night.
    const start = parseISO(startDate);
    const end = parseISO(endDate);
    if (!isValid(start) || !isValid(end)) {
        return 0;
    }

    const nights = differenceInCalendarDays(end, start);
    return nights > 0 ? nights : 0;
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

function getTransactionID(report?: OnyxEntry<Report>): string | undefined {
    if (!report) {
        return;
    }
    const parentReportAction = isThread(report) ? getReportAction(report.parentReportID, report.parentReportActionID) : undefined;
    const IOUTransactionID = isMoneyRequestAction(parentReportAction) ? getOriginalMessage(parentReportAction)?.IOUTransactionID : undefined;

    return IOUTransactionID;
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
    const isAddedToReport = !!transaction?.reportID && transaction.reportID !== CONST.REPORT.SPLIT_REPORT_ID && transaction.reportID !== CONST.REPORT.UNREPORTED_REPORT_ID;
    if (isAddedToReport) {
        const report = getReportOrDraftReport(transaction.reportID);
        if (report && report.type !== CONST.REPORT.TYPE.EXPENSE) {
            return false;
        }
    }
    if (!originalTransaction) {
        return !!transaction?.comment?.originalTransactionID && transaction?.comment?.source === 'split';
    }

    const {originalTransactionID, source, splits} = transaction?.comment ?? {};

    if ((splits && splits.length > 0) || !originalTransactionID || source !== CONST.IOU.TYPE.SPLIT) {
        return false;
    }

    return !originalTransaction?.comment?.splits;
}

function isSplitChildTransaction(transaction: OnyxEntry<Transaction> | Transaction): boolean {
    return transaction?.comment?.source === CONST.IOU.TYPE.SPLIT;
}

/**
 * The original (container) transaction of a split lives in SPLIT_REPORT_ID while the split exists, so it's
 * hidden and has no dismiss UI of its own. Used to decide whether a split failure error on the original
 * should be cleared alongside the visible child's error.
 */
function isSplitContainerTransaction(transaction: OnyxEntry<Transaction> | Transaction): boolean {
    return transaction?.reportID === CONST.REPORT.SPLIT_REPORT_ID;
}

function hasSplitExpenseInSelection(transactions: Transaction[]): boolean {
    return transactions.some(isSplitChildTransaction);
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

function shouldRedirectDeleteToSplitExpenseEdit(transaction: OnyxEntry<Transaction>, originalTransaction: OnyxEntry<Transaction>, isSelfDMSplit?: boolean): boolean {
    const {isExpenseSplit: isExpenseSplitTransaction, originalTransaction: sourceTransaction} = getOriginalTransactionWithSplitInfo(transaction, originalTransaction);

    if (!isExpenseSplitTransaction || !isPerDiemRequest(sourceTransaction)) {
        return false;
    }

    if (isSelfDMSplit) {
        return true;
    }

    return !isExpenseUnreported(transaction ?? undefined) && !isExpenseUnreported(originalTransaction ?? undefined);
}

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
 * Whether a transaction should light the SmartScan-fields RBR red-dot.
 * A transaction queued for deletion still lives in Onyx until the server confirms removal, so it must
 * not keep lighting the RBR while it waits.
 */
function hasMissingSmartscanFieldsForRBR(transaction: OnyxEntry<Transaction>, report: OnyxEntry<Report>): boolean {
    return !isTransactionPendingDelete(transaction) && hasMissingSmartscanFields(transaction, report);
}

/**
 * Retrieves all "child" transactions associated with a given original transaction.
 */
function getChildTransactions(transactions: OnyxCollection<Transaction>, originalTransactionID: string | undefined) {
    return Object.values(transactions ?? {}).filter((currentTransaction) => {
        const isSplitChild = currentTransaction?.comment?.originalTransactionID === originalTransactionID;
        if (!isSplitChild || currentTransaction?.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
            return false;
        }
        return currentTransaction?.comment?.source === CONST.IOU.TYPE.SPLIT;
    });
}

/**
 * Creates sections data for unreported expenses, marking transactions with DELETE pending action as disabled
 */
function createUnreportedExpenses(transactions: Array<OnyxEntry<Transaction> | undefined>): UnreportedExpenseListItemType[] {
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

type GetEligibleTransactionsToAddParams = {
    transactions: OnyxCollection<Transaction>;
    report: OnyxEntry<Report>;
    policy: OnyxEntry<Policy>;
    cardList: OnyxEntry<CardList>;
    currentUserAccountID: number | undefined;
    reportID: string;
    allOpenReports: Record<string, true> | undefined;
    openReportDrafts: Record<string, true> | undefined;
};

/**
 * Returns the transactions that can be added to the given expense or IOU report.
 */
function getEligibleTransactionsToAdd({
    transactions,
    report,
    policy,
    cardList,
    currentUserAccountID,
    reportID,
    allOpenReports,
    openReportDrafts,
}: GetEligibleTransactionsToAddParams): Transaction[] {
    if (!transactions) {
        return [];
    }

    const isIOU = isIOUReport(report);
    const canSubmitPerDiemExpense = canSubmitPerDiemExpenseFromWorkspace(policy);
    const workspacePerDiemUnitID = getPerDiemCustomUnit(policy)?.customUnitID;

    return Object.values(transactions).filter((transaction): transaction is Transaction => {
        if (!transaction) {
            return false;
        }

        const isUnreported = isUnreportedTransaction(transaction);
        if (isIOU && !isUnreported) {
            return false;
        }

        // Split expenses can't be moved to a 1:1 DM chat, so they must not be offered when adding to an IOU report
        if (isIOU) {
            const originalTransaction = transactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.comment?.originalTransactionID}`];
            const {isExpenseSplit: isExpenseSplitTransaction} = getOriginalTransactionWithSplitInfo(transaction, originalTransaction);
            if (isExpenseSplitTransaction) {
                return false;
            }
        }

        const isOnOpenExpenseReport = !!(transaction.reportID && (allOpenReports?.[transaction.reportID] ?? openReportDrafts?.[transaction.reportID]));
        if (!isUnreported && !isOnOpenExpenseReport) {
            return false;
        }

        // Don't show expenses that are already on the current report
        if (transaction.reportID === reportID) {
            return false;
        }

        // Check if the transaction belongs to the current user by verifying card ownership
        if (transaction.cardID) {
            const card = cardList?.[transaction.cardID];
            if (card?.accountID !== currentUserAccountID) {
                return false;
            }
        }

        const transactionAmount = getTransactionDetails(transaction)?.amount ?? 0;
        if (isIOU && transactionAmount <= 0) {
            return false;
        }

        if (isPerDiemRequest(transaction)) {
            // Only show per diem expenses if the target workspace has per diem enabled and the per diem expense was created in the same workspace
            const perDiemCustomUnitID = transaction.comment?.customUnit?.customUnitID;

            return canSubmitPerDiemExpense && (!perDiemCustomUnitID || perDiemCustomUnitID === workspacePerDiemUnitID);
        }

        return true;
    });
}

function willFieldBeAutomaticallyFilled(transaction: OnyxEntry<Transaction>, fieldType: 'amount' | 'merchant' | 'date' | 'category'): boolean {
    if (fieldType === 'category' && transaction?.iouRequestType === CONST.IOU.REQUEST_TYPE.MANUAL) {
        return true;
    }

    if (!transaction?.receipt) {
        return false;
    }

    if (!isScanRequest(transaction)) {
        return false;
    }

    const autoFillableFields = ['amount', 'merchant', 'date', 'category'];
    return autoFillableFields.includes(fieldType);
}

function isExpenseUnreported(transaction?: Transaction): transaction is UnreportedTransaction {
    return transaction?.reportID === CONST.REPORT.UNREPORTED_REPORT_ID;
}

function isUnreportedTransaction(transaction: OnyxEntry<Transaction>): boolean {
    return isExpenseUnreported(transaction ?? undefined) || transaction?.reportID === '';
}

function isUnreportedManagedCardTransaction(transaction?: Transaction): boolean {
    return isExpenseUnreported(transaction) && isManagedCardTransaction(transaction);
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

/**
 * A utility that ensures unreported transactions are unheld.
 */
function recalculateUnreportedTransactionDetails() {
    // If the transaction is on hold, we need to unhold it because unreported transactions (on selfDM) should never remain on hold.
    const comment: NullishDeep<Comment> = {
        hold: null,
    };

    return {comment};
}

/**
 * Check if the transaction has a smartscan failed with missing fields before violation is written
 */
function hasSmartScanFailedWithMissingFields(transactions: Transaction[], report: OnyxEntry<Report>): boolean {
    return transactions.some(
        (transaction) => isScanRequest(transaction) && transaction?.receipt?.state === CONST.IOU.RECEIPT_STATE.SCAN_FAILED && hasMissingSmartscanFields(transaction, report),
    );
}

/**
 * Whether a scan-failed expense is one that the backend moves to its own report on payment. Auth only moves it when
 * both the merchant and the amount are unset, so anything with an amount has to stay put to keep the payment total in
 * sync with the server.
 */
function isScanFailedTransactionMovedOnPayment(transaction: Transaction, report: OnyxEntry<Report>): boolean {
    if (!hasSmartScanFailedWithMissingFields([transaction], report)) {
        return false;
    }
    return getMerchant(transaction) === CONST.TRANSACTION.PARTIAL_TRANSACTION_MERCHANT && getAmount(transaction, true) === 0;
}

/**
 * Whether the report has scan-failed expenses to move out and at least one other expense left behind to pay.
 */
function shouldSplitScanFailedTransactions(transactions: Transaction[], report: OnyxEntry<Report>): boolean {
    let hasScanFailedTransaction = false;
    let hasRemainingTransaction = false;
    for (const transaction of transactions) {
        if (isScanFailedTransactionMovedOnPayment(transaction, report)) {
            hasScanFailedTransaction = true;
        } else {
            hasRemainingTransaction = true;
        }
    }
    return hasScanFailedTransaction && hasRemainingTransaction;
}

function getDistanceRequestType(transaction: OnyxEntry<Transaction>): string | undefined {
    const requestType = getRequestType(transaction);
    return isDistanceExpenseType(requestType) ? requestType : undefined;
}

function getIsFromGlobalCreate(transaction: OnyxEntry<Transaction> | Partial<Transaction> | undefined): boolean | undefined {
    return transaction?.isFromFloatingActionButton ?? transaction?.isFromGlobalCreate;
}

/**
 * Distance in meters of the currently selected map route (the default route when the user hasn't picked an
 * alternate one), or undefined when there is nothing to send: the expense isn't a map distance request, or the
 * selected route has no distance.
 */
function getSelectedRouteDistance(transaction: OnyxEntry<Transaction>): number | undefined {
    if (!isMapDistanceRequest(transaction) && !isDistanceTypeRequest(transaction)) {
        return undefined;
    }

    const selectedRouteKey = getSelectedRouteKey(transaction);
    return transaction?.routes?.[selectedRouteKey]?.distance ?? undefined;
}

/**
 * Whether the transaction's displayed distance is a manually typed override rather than the distance of the map route
 * it points at. `comment.customUnit.quantity` holds both cases — a value the user typed on the Manual tab and, after
 * picking an alternate route, that route's distance — so the comparison has to be against the *selected* route and not
 * the primary one, or every alternate route selection would look like an override.
 */
function hasManualDistanceOverride(transaction: OnyxInputOrEntry<Transaction>): boolean {
    const quantity = transaction?.comment?.customUnit?.quantity;
    const selectedRouteDistanceInMeters = transaction?.routes?.[getSelectedRouteKey(transaction)]?.distance;
    if (quantity == null || !selectedRouteDistanceInMeters) {
        return false;
    }

    const unit = transaction?.comment?.customUnit?.distanceUnit ?? CONST.CUSTOM_UNITS.DISTANCE_UNIT_MILES;
    const quantityMatchesDistance = (distanceInMeters: number) => quantity === roundToTwoDecimalPlaces(DistanceRequestUtils.convertDistanceUnit(distanceInMeters, unit));

    // The saved quantity was computed from the route distance at creation time (`routeDistanceMeters`); a later
    // re-fetch can return a slightly different distance for the same route, which must not read as an override.
    const routeDistanceMeters = transaction?.comment?.customUnit?.routeDistanceMeters;
    return !quantityMatchesDistance(selectedRouteDistanceInMeters) && !(routeDistanceMeters && quantityMatchesDistance(routeDistanceMeters));
}

export {
    buildOptimisticTransaction,
    calculateTaxAmount,
    getWorkspaceTaxesSettingsName,
    getDefaultTaxCode,
    transformedTaxRates,
    getTaxValue,
    getCalculatedTaxAmount,
    getDistanceRateTaxUpdates,
    getTaxName,
    getTaxRateTitle,
    hasTaxRateWithMatchingValue,
    getEnabledTaxRateCount,
    getUpdatedTransaction,
    getClearedPendingFields,
    getDescription,
    getRequestType,
    getTransactionType,
    isScanRequest,
    getAmount,
    getAttendees,
    getTaxAmount,
    getTaxCode,
    getCurrency,
    shouldClearConvertedAmount,
    getDistanceInMeters,
    getSelectedRouteDistance,
    getSelectedRouteKey,
    hasManualDistanceOverride,
    getCardID,
    getOriginalCurrency,
    getOriginalAmount,
    getFormattedAttendees,
    getMerchant,
    getMerchantName,
    hasAnyTransactionWithoutRTERViolation,
    getMerchantOrDescription,
    getMCCGroup,
    getCreated,
    getFormattedCreated,
    getCategory,
    getBillable,
    getIsFromGlobalCreate,
    getTag,
    getTagArrayFromName,
    getTagForDisplay,
    getTransactionViolations,
    hasAllManuallyEnteredScanFields,
    hasAnyManuallyEnteredScanField,
    isPartiallyEnteredScanExpense,
    hasReceipt,
    hasUploadedReceipt,
    hasEReceipt,
    hasRoute,
    isReceiptBeingScanned,
    didReceiptScanSucceed,
    getValidWaypoints,
    doesMoneyRequestDraftHaveUserInput,
    haveWaypointAddressesChanged,
    isDistanceRequest,
    isMapDistanceRequest,
    isMapBasedDistanceRequest,
    isGPSDistanceRequest,
    isManualDistanceRequest,
    isOdometerDistanceRequest,
    hasAppliedCommuterExclusion,
    shouldUseCommuterExclusionForDisplay,
    getDisplayTransactionWithoutInvalidCommuterExclusion,
    isDistanceExpenseType,
    isFetchingWaypointsFromServer,
    hasLocallyKnownDistance,
    hasPendingDistanceReceiptRegeneration,
    isExpensifyCardTransaction,
    isManagedCardTransaction,
    isDuplicate,
    isPending,
    hasOnlyPendingCardTransactions,
    getSupersededPendingCardTransactionIDs,
    showPendingCardTransactionsBlockModal,
    showHeldExpensesBlockModal,
    isOnHold,
    getWaypoints,
    isAmountMissing,
    isMerchantMissing,
    isCreatedMissing,
    areRequiredFieldsEmpty,
    hasMissingSmartscanFields,
    hasMissingSmartscanFieldsForRBR,
    hasPendingRTERViolation,
    getUnsuppressibleBrokenConnectionTransactionID,
    hasAnyPendingRTERViolation,
    hasValidModifiedAmount,
    getNegatedAmountTransaction,
    allHavePendingRTERViolation,
    hasPendingUI,
    getWaypointIndex,
    waypointHasValidAddress,
    isWaypointNullIsland,
    getRecentTransactions,
    hasReservationList,
    hasViolation,
    hasDuplicateTransactions,
    hasSubmissionBlockingViolationInList,
    hasSubmissionBlockingViolationInReport,
    hasSubmissionBlockingViolations,
    hasCustomUnitOutOfPolicyViolation,
    isBrokenConnectionViolation,
    shouldSuppressBrokenConnectionStatus,
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
    canMergeDuplicates,
    getReimbursable,
    hasNonReimbursableTransactions,
    isPayAtEndExpense,
    removeSettledAndApprovedTransactions,
    removeTransactionFromDuplicateTransactionViolation,
    getCardName,
    getDeleteExpenseTitle,
    getDeleteConfirmationPrompt,
    hasReceiptSource,
    hasOdometerImageSource,
    shouldShowAttendees,
    getAllSortedTransactions,
    getFormattedPostedDate,
    getPostedDate,
    getCategoryTaxDetails,
    isPerDiemRequest,
    isViolationDismissed,
    isPartialTransaction,
    isScanningTransaction,
    isScanning,
    isTransactionSubmittable,
    isCategoryBeingAnalyzed,
    getOriginalTransactionWithSplitInfo,
    shouldRedirectDeleteToSplitExpenseEdit,
    getTransactionPendingAction,
    isTransactionPendingDelete,
    getChildTransactions,
    createUnreportedExpenses,
    getEligibleTransactionsToAdd,
    isDemoTransaction,
    shouldShowViolation,
    hasTransactionBeenRejected,
    isExpenseSplit,
    hasSplitExpenseInSelection,
    isSplitChildTransaction,
    isSplitContainerTransaction,
    getAttendeesListDisplayString,
    isCorporateCardTransaction,
    isExpenseUnreported,
    isUnreportedTransaction,
    mergeProhibitedViolations,
    getVisibleTransactionViolations,
    getOriginalAttendees,
    getReportOwnerAsAttendee,
    getReportOwnerAccountIDAsAttendee,
    isFromCreditCardImport,
    getExchangeRate,
    shouldReuseInitialTransaction,
    willFieldBeAutomaticallyFilled,
    getOriginalAmountForDisplay,
    getOriginalCurrencyForDisplay,
    getMCCForDisplay,
    hasDisplayableMCC,
    getConvertedAmount,
    isTimeRequest,
    getExpenseTypeTranslationKey,
    getDetailedExpenseTypeTranslationKey,
    getReceiptTypeTranslationKey,
    isDistanceTypeRequest,
    recalculateUnreportedTransactionDetails,
    hasSmartScanFailedWithMissingFields,
    isFailedScanAmountPlaceholder,
    isScanFailedTransactionMovedOnPayment,
    shouldSplitScanFailedTransactions,
    isDeletedTransaction,
    getDistanceRequestType,
    isUnreportedManagedCardTransaction,
    getReservationNights,
};

export type {ManuallyEnteredScanFields};
