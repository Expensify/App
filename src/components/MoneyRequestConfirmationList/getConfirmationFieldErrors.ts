/**
 * The errors the amount, merchant, date, tax amount and attendees fields of the confirmation show on themselves. They
 * are computed from the transaction on every render, so an error goes away as soon as its field is fixed and nothing
 * has to remember to clear it. The same map blocks confirmation, flags each field and picks the field a blocked
 * confirm scrolls to, so those three can't disagree about what needs fixing.
 */
import {getIsMissingAttendeesViolation} from '@libs/AttendeeUtils';
import {convertToFrontendAmountAsString} from '@libs/CurrencyUtils';
import {isP2PRecipient, isParticipantP2P} from '@libs/IOUUtils';
import {
    getConfirmationAmount,
    isConfirmationAmountMissing,
    isConfirmationDateMissing,
    isConfirmationMerchantMissing,
    isTaxAmountInvalid,
    isValidMoneyRequestAmount,
} from '@libs/MoneyRequestUtils';
import {isAttendeeTrackingEnabled} from '@libs/PolicyUtils';
import {getAttendees, getCalculatedTaxAmount, getCategory, getCurrency, getMerchant, getTaxAmount, hasTaxRateWithMatchingValue, isScanRequest} from '@libs/TransactionUtils';
import {isInvalidMerchantValue, isMerchantBlank, isValidInputLength} from '@libs/ValidationUtils';

import type {IOUType} from '@src/CONST';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type * as OnyxTypes from '@src/types/onyx';
import type {Attendee} from '@src/types/onyx/IOU';

import type {OnyxEntry} from 'react-native-onyx';

type ConfirmationFieldErrors = {
    amount?: TranslationPaths;
    merchant?: TranslationPaths;
    date?: TranslationPaths;
    taxAmount?: TranslationPaths;
    attendees?: TranslationPaths;
};

type ConfirmationField = keyof ConfirmationFieldErrors;

type GetConfirmationFieldErrorsParams = {
    /** Total amount of the expense, in the smallest currency unit */
    iouAmount: number;

    iouType: IOUType;

    iouMerchant: string | undefined;

    /** Whether this surface offers manual entry of the amount / merchant / date. False for test receipts and moved tracked expenses. */
    canEnterScanFieldsManually: boolean;

    /** Whether the expense goes to a workspace chat, the only destination where a manually entered Scan needs a merchant */
    isPolicyExpenseChat: boolean;

    /** Whether the date field is rendered. A hidden date can't be filled in, so it is never reported missing. */
    shouldShowDate: boolean;

    /** Whether the confirmation is read-only. A read-only date is populated server-side, so it can't be missing. */
    isReadOnly: boolean;

    isEditingSplitBill: boolean | undefined;

    isMerchantRequired: boolean | undefined;

    isDistanceRequest: boolean;

    isTimeRequest: boolean;

    currentUserAccountID: number;

    /** The workspace whose tax rates and attendee tracking the tax amount and attendees are checked against */
    policy: OnyxEntry<OnyxTypes.Policy>;

    /** The workspace's categories, which say whether the expense's category needs attendees */
    policyCategories: OnyxEntry<OnyxTypes.PolicyCategories>;

    /** Whether the tax fields are rendered. A hidden tax amount can't be fixed, so it is never flagged. */
    shouldShowTax: boolean;

    /** Whether the tax amount input was emptied. The draft stores an emptied input as 0, so only the input can tell. */
    isTaxAmountEmpty: boolean;

    /** Whether the attendees field is rendered. A form without it can't take attendees, so `validate` reports missing ones in the footer instead. */
    shouldShowAttendees: boolean;

    /** The report owner, who counts as the attendee while none were picked */
    reportOwnerAsAttendee: Attendee | undefined;

    /** The current user's login. A category that needs attendees needs someone other than them. */
    currentUserLogin: string | undefined;

    getCurrencyDecimals: (currencyCode: string | undefined) => number;
};

type GetSiblingFieldErrorsParams = Omit<GetConfirmationFieldErrorsParams, 'iouAmount' | 'iouMerchant' | 'isTaxAmountEmpty'> & {
    /** The recipient on screen. Every receipt goes to it, even when another receipt's own draft wasn't updated. */
    participants: OnyxTypes.Transaction['participants'];
};

type SiblingFieldErrors = {
    transactionID: string;
    fieldErrors: ConfirmationFieldErrors;
};

type AttendeeRuleParams = Pick<GetConfirmationFieldErrorsParams, 'iouType' | 'policy' | 'policyCategories' | 'reportOwnerAsAttendee' | 'currentUserLogin'>;

/** Returned whenever no field error is shown, so the error state passed down the footer keeps its identity while nothing is flagged. */
const NO_FIELD_ERRORS: Readonly<ConfirmationFieldErrors> = Object.freeze({});

function getAmountFieldError(transaction: OnyxEntry<OnyxTypes.Transaction>, params: GetConfirmationFieldErrorsParams): TranslationPaths | undefined {
    const {iouAmount, iouType, canEnterScanFieldsManually, isPolicyExpenseChat, isEditingSplitBill, isDistanceRequest, isTimeRequest, currentUserAccountID} = params;
    const firstParticipant = transaction?.participants?.at(0);
    const isP2P = isParticipantP2P(firstParticipant);

    // A split is only edited here when its receipt couldn't be read or it was saved at $0, and a split of nothing can't be completed.
    if (isEditingSplitBill && iouAmount === 0) {
        return 'common.error.enterAmount';
    }

    // This runs before the $0 check so an amount the user never entered reads as missing, whoever the expense goes to.
    if (isConfirmationAmountMissing(transaction, canEnterScanFieldsManually, isPolicyExpenseChat)) {
        return 'common.error.fieldRequired';
    }

    // A manual expense to a person can't be $0, but scan, time and distance amounts are exempt since they're read off the receipt or computed.
    if (!isScanRequest(transaction) && !isTimeRequest && !isDistanceRequest && iouAmount === 0 && isP2P) {
        return 'common.error.invalidAmount';
    }

    // A typed Scan amount is checked like a manual one, because a Scan can pick its 1:1 recipient first and so never hits the participant picker's negative amount guard.
    const canAmountBeTyped = transaction?.iouRequestType === CONST.IOU.REQUEST_TYPE.MANUAL || canEnterScanFieldsManually;
    if (
        canAmountBeTyped &&
        transaction?.isAmountSet &&
        !isTimeRequest &&
        !isDistanceRequest &&
        !isEditingSplitBill &&
        !isValidMoneyRequestAmount(iouAmount, iouType, !isP2PRecipient(firstParticipant, currentUserAccountID), isP2P)
    ) {
        return 'common.error.invalidAmount';
    }

    return undefined;
}

function getMerchantFieldError(transaction: OnyxEntry<OnyxTypes.Transaction>, params: GetConfirmationFieldErrorsParams): TranslationPaths | undefined {
    const {iouMerchant, canEnterScanFieldsManually, isPolicyExpenseChat, isMerchantRequired} = params;
    const merchant = iouMerchant ?? '';

    // The confirmation saves the merchant as typed, so its length is checked before trimming.
    if (!isValidInputLength(merchant, CONST.MERCHANT_NAME_MAX_BYTES).isValid) {
        return 'iou.error.invalidMerchant';
    }

    // The amount, merchant and date of a Scan are all-or-nothing, so once one is entered a blank merchant is missing.
    if (isConfirmationMerchantMissing(transaction, canEnterScanFieldsManually, isPolicyExpenseChat)) {
        return 'common.error.fieldRequired';
    }

    const isBlank = isMerchantBlank(transaction?.isMerchantSet, merchant);
    const isTypedValueInvalid = !isBlank && isInvalidMerchantValue(merchant.trim());

    if (!isMerchantRequired) {
        // An optional merchant is only checked once the user typed one in.
        return transaction?.isMerchantSet && isTypedValueInvalid ? 'iou.error.invalidMerchant' : undefined;
    }

    // A required merchant left blank reads the same as the other required fields, and only a typed one is "invalid".
    if (isBlank) {
        return 'common.error.fieldRequired';
    }
    return isTypedValueInvalid ? 'iou.error.invalidMerchant' : undefined;
}

function getTaxAmountFieldError(transaction: OnyxEntry<OnyxTypes.Transaction>, params: GetConfirmationFieldErrorsParams): TranslationPaths | undefined {
    const {shouldShowTax, isDistanceRequest, isTaxAmountEmpty, policy, getCurrencyDecimals} = params;

    // A distance expense's tax amount follows its rate and can't be typed, so only a typed one can be wrong.
    if (!shouldShowTax || isDistanceRequest) {
        return undefined;
    }

    // A rate the workspace doesn't have is reported as out of policy instead, because its limit can't be known until the rate is changed.
    if (transaction?.taxCode && !hasTaxRateWithMatchingValue(policy, transaction)) {
        return undefined;
    }

    if (isTaxAmountEmpty) {
        return 'common.error.fieldRequired';
    }

    const currency = getCurrency(transaction);
    const decimals = getCurrencyDecimals(currency);
    const maxTaxAmount = getCalculatedTaxAmount(policy, transaction, currency, decimals);
    const taxAmount = convertToFrontendAmountAsString(Math.abs(getTaxAmount(transaction, false)), decimals);
    return isTaxAmountInvalid(taxAmount, maxTaxAmount, decimals) ? 'iou.error.invalidTaxAmount' : undefined;
}

/** Whether the expense's category needs attendees it doesn't have, whether or not the form shows the attendees field */
function isMissingRequiredAttendees(transaction: OnyxEntry<OnyxTypes.Transaction>, params: AttendeeRuleParams): boolean {
    const {iouType, policy, policyCategories, reportOwnerAsAttendee, currentUserLogin} = params;

    // An invoice isn't an expense report, so its attendees aren't tracked.
    if (iouType === CONST.IOU.TYPE.INVOICE) {
        return false;
    }

    // A disabled category is reported as out of policy instead, and the user has to change it, so its attendee rule no longer applies.
    const category = getCategory(transaction);
    if (!policyCategories?.[category]?.enabled) {
        return false;
    }

    return getIsMissingAttendeesViolation(
        policyCategories,
        category,
        getAttendees(transaction, reportOwnerAsAttendee),
        currentUserLogin,
        isAttendeeTrackingEnabled(policy),
        policy?.type === CONST.POLICY.TYPE.CORPORATE,
    );
}

function getAttendeesFieldError(transaction: OnyxEntry<OnyxTypes.Transaction>, params: GetConfirmationFieldErrorsParams): TranslationPaths | undefined {
    if (!params.shouldShowAttendees) {
        return undefined;
    }
    return isMissingRequiredAttendees(transaction, params) ? 'violations.missingAttendees' : undefined;
}

/** Returns the error each field of the confirmation would show right now, keyed by field. Empty when nothing blocks. */
function getConfirmationFieldErrors(transaction: OnyxEntry<OnyxTypes.Transaction>, params: GetConfirmationFieldErrorsParams): ConfirmationFieldErrors {
    // The pager can render once without a receipt while one is removed, and an absent receipt has no fields to flag.
    if (!transaction) {
        return NO_FIELD_ERRORS;
    }
    const {shouldShowDate, isReadOnly, canEnterScanFieldsManually, isPolicyExpenseChat} = params;
    const amount = getAmountFieldError(transaction, params);
    const merchant = getMerchantFieldError(transaction, params);
    const date = isConfirmationDateMissing(transaction, shouldShowDate, isReadOnly, canEnterScanFieldsManually, isPolicyExpenseChat) ? 'common.error.fieldRequired' : undefined;
    const taxAmount = getTaxAmountFieldError(transaction, params);
    const attendees = getAttendeesFieldError(transaction, params);

    if (!amount && !merchant && !date && !taxAmount && !attendees) {
        return NO_FIELD_ERRORS;
    }

    return {
        ...(amount && {amount}),
        ...(merchant && {merchant}),
        ...(date && {date}),
        ...(taxAmount && {taxAmount}),
        ...(attendees && {attendees}),
    };
}

/** Checks emptiness by content, so it gives the same answer whether or not the map is the shared `NO_FIELD_ERRORS` */
function hasFieldErrors(fieldErrors: ConfirmationFieldErrors): boolean {
    return Object.values(fieldErrors).some(Boolean);
}

/** Returns the first other receipt of a multi-scan with a field error, since Create submits every receipt at once. */
function getSiblingFieldErrors(siblingTransactions: OnyxTypes.Transaction[] | undefined, {participants, ...params}: GetSiblingFieldErrorsParams): SiblingFieldErrors | undefined {
    for (const sibling of siblingTransactions ?? []) {
        // Only the receipt on screen renders a tax amount input, so another receipt's emptied tax amount is just its stored 0.
        const fieldErrors = getConfirmationFieldErrors(
            {...sibling, participants},
            {...params, iouAmount: getConfirmationAmount(sibling), iouMerchant: getMerchant(sibling), isTaxAmountEmpty: false},
        );
        if (hasFieldErrors(fieldErrors)) {
            return {transactionID: sibling.transactionID, fieldErrors};
        }
    }
    return undefined;
}

/** Whether a field error blocks confirming, on the receipt on screen or on another receipt of a multi-scan. */
function hasBlockingFieldErrors(fieldErrors: ConfirmationFieldErrors, siblingFieldErrors: SiblingFieldErrors | undefined): boolean {
    return hasFieldErrors(fieldErrors) || !!siblingFieldErrors;
}

export default getConfirmationFieldErrors;
export {NO_FIELD_ERRORS, getSiblingFieldErrors, hasBlockingFieldErrors, hasFieldErrors, isMissingRequiredAttendees};
export type {ConfirmationField, ConfirmationFieldErrors, GetConfirmationFieldErrorsParams, SiblingFieldErrors};
