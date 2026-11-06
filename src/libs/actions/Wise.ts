import {read} from '@libs/API';
import {READ_COMMANDS} from '@libs/API/types';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxData} from '@src/types/onyx/Request';

import Onyx from 'react-native-onyx';

import type {PayMoneyRequestFunctionParams} from './IOU/PayMoneyRequest';

import {getPaymentBankAccountID} from './IOU/PayMoneyRequest';

/** Fetches a fresh link to Wise's hosted KYC form for the bank account. The server puts the link in `wiseKYCReviewEmbeddedLink`. */
function getWiseKYCReviewEmbeddedLink(bankAccountID: number) {
    const onyxData: OnyxData<typeof ONYXKEYS.RAM_ONLY_WISE_KYC_REVIEW_EMBEDDED_LINK> = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.SET,
                key: ONYXKEYS.RAM_ONLY_WISE_KYC_REVIEW_EMBEDDED_LINK,
                value: {isLoading: true},
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.RAM_ONLY_WISE_KYC_REVIEW_EMBEDDED_LINK,
                value: {isLoading: false},
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.RAM_ONLY_WISE_KYC_REVIEW_EMBEDDED_LINK,
                value: {isLoading: false, errors: getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage')},
            },
        ],
    };

    read(READ_COMMANDS.GET_WISE_KYC_REVIEW_EMBEDDED_LINK, {bankAccountID}, onyxData);
}

type WiseQuotePayment = Pick<PayMoneyRequestFunctionParams, 'full' | 'paymentType' | 'methodID'>;

/**
 * Asks Wise for a fresh price for paying the report the way PayMoneyRequest will: held expenses are left out when full is false, and the money comes from the
 * chosen bank account. The server merges the quote into `report.wiseQuote`, so the old quote is dropped first
 */
function getWiseQuote(reportID: string, {full = true, paymentType, methodID}: WiseQuotePayment) {
    const reportKey = `${ONYXKEYS.COLLECTION.REPORT}${reportID}` as const;
    const onyxData: OnyxData<typeof ONYXKEYS.COLLECTION.REPORT> = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: reportKey,
                value: {wiseQuote: null, errorFields: {wiseQuote: null}},
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: reportKey,
                value: {errorFields: {wiseQuote: getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage')}},
            },
        ],
    };

    read(READ_COMMANDS.GET_WISE_QUOTE, {reportID, full, bankAccountID: getPaymentBankAccountID({paymentType, methodID})}, onyxData);
}

/** Drops the link, which carries a token */
function clearWiseKYCReviewEmbeddedLink() {
    Onyx.set(ONYXKEYS.RAM_ONLY_WISE_KYC_REVIEW_EMBEDDED_LINK, null);
}

export {clearWiseKYCReviewEmbeddedLink, getWiseKYCReviewEmbeddedLink, getWiseQuote};
