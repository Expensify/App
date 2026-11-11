/**
 * The errors the amount, date and merchant fields of the confirmation show under their inputs. They are computed
 * from the transaction on every render, so an error goes away as soon as its field is fixed and nothing has to
 * remember to clear it. The same map blocks confirmation, flags each field and drives the summary above the confirm
 * button, so those three can't disagree about what is missing.
 */
import {isP2PRecipient, isParticipantP2P} from '@libs/IOUUtils';
import {getConfirmationAmount, isConfirmationAmountMissing, isConfirmationDateMissing, isConfirmationMerchantMissing, isValidMoneyRequestAmount} from '@libs/MoneyRequestUtils';
import {getMerchant, isScanRequest} from '@libs/TransactionUtils';
import {isInvalidMerchantValue, isMerchantBlank, isValidInputLength} from '@libs/ValidationUtils';

import type {IOUType} from '@src/CONST';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type * as OnyxTypes from '@src/types/onyx';

import type {OnyxEntry} from 'react-native-onyx';

type ConfirmationFieldErrors = {
    amount?: TranslationPaths;
    date?: TranslationPaths;
    merchant?: TranslationPaths;
};

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
};

type GetSiblingFieldErrorsParams = Omit<GetConfirmationFieldErrorsParams, 'iouAmount' | 'iouMerchant'> & {
    /** The recipient on screen. Every receipt goes to it, even when another receipt's own draft wasn't updated. */
    participants: OnyxTypes.Transaction['participants'];
};

type SiblingFieldErrors = {
    transactionID: string;
    fieldErrors: ConfirmationFieldErrors;
};

/** Returned whenever no field error is shown, so the error state passed down the footer keeps its identity while nothing is flagged. */
const NO_FIELD_ERRORS: Readonly<ConfirmationFieldErrors> = Object.freeze({});

function getAmountFieldError(transaction: OnyxEntry<OnyxTypes.Transaction>, params: GetConfirmationFieldErrorsParams): TranslationPaths | undefined {
    const {iouAmount, iouType, canEnterScanFieldsManually, isPolicyExpenseChat, isEditingSplitBill, isDistanceRequest, isTimeRequest, currentUserAccountID} = params;
    const firstParticipant = transaction?.participants?.at(0);
    const isP2P = isParticipantP2P(firstParticipant);

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

/** Returns the error each inline field of the confirmation would show right now, keyed by field. Empty when nothing blocks. */
function getConfirmationFieldErrors(transaction: OnyxEntry<OnyxTypes.Transaction>, params: GetConfirmationFieldErrorsParams): ConfirmationFieldErrors {
    const {shouldShowDate, isReadOnly, canEnterScanFieldsManually, isPolicyExpenseChat} = params;
    const amount = getAmountFieldError(transaction, params);
    const date = isConfirmationDateMissing(transaction, shouldShowDate, isReadOnly, canEnterScanFieldsManually, isPolicyExpenseChat) ? 'common.error.fieldRequired' : undefined;
    const merchant = getMerchantFieldError(transaction, params);

    if (!amount && !date && !merchant) {
        return NO_FIELD_ERRORS;
    }

    return {
        ...(amount && {amount}),
        ...(date && {date}),
        ...(merchant && {merchant}),
    };
}

/** Returns the first other receipt of a multi-scan with a field error, since Create submits every receipt at once. */
function getSiblingFieldErrors(siblingTransactions: OnyxTypes.Transaction[] | undefined, {participants, ...params}: GetSiblingFieldErrorsParams): SiblingFieldErrors | undefined {
    for (const sibling of siblingTransactions ?? []) {
        const fieldErrors = getConfirmationFieldErrors({...sibling, participants}, {...params, iouAmount: getConfirmationAmount(sibling), iouMerchant: getMerchant(sibling)});
        if (fieldErrors !== NO_FIELD_ERRORS) {
            return {transactionID: sibling.transactionID, fieldErrors};
        }
    }
    return undefined;
}

/** Whether a field error blocks confirming, on the receipt on screen or on another receipt of a multi-scan. */
function hasBlockingFieldErrors(fieldErrors: ConfirmationFieldErrors, siblingFieldErrors: SiblingFieldErrors | undefined): boolean {
    return Object.keys(fieldErrors).length > 0 || !!siblingFieldErrors;
}

export default getConfirmationFieldErrors;
export {NO_FIELD_ERRORS, getSiblingFieldErrors, hasBlockingFieldErrors};
export type {ConfirmationFieldErrors, GetConfirmationFieldErrorsParams, SiblingFieldErrors};
