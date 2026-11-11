import {read} from '@libs/API';
import {READ_COMMANDS} from '@libs/API/types';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import {canReuseWiseQuote, getWiseQuoteRequest} from '@libs/WiseQuoteUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';
import type {OnyxData} from '@src/types/onyx/Request';

import Onyx from 'react-native-onyx';

/** Fetches a fresh link to Wise's hosted KYC form for the bank account. The server puts the link in `wiseKYCReviewEmbeddedLink`. */
function getWiseKYCReviewEmbeddedLink(bankAccountID: number, redirectURL: string) {
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

    read(READ_COMMANDS.GET_WISE_KYC_REVIEW_EMBEDDED_LINK, {bankAccountID, redirectURL}, onyxData);
}

/**
 * Asks Wise for a price for paying the report, unless the report holds a valid one for the same payment.
 * The server merges the new quote into `report.wiseQuote`, so the old quote is dropped first.
 */
function getWiseQuote(report: Report, full: boolean) {
    if (canReuseWiseQuote(report, full)) {
        return;
    }

    const reportKey = `${ONYXKEYS.COLLECTION.REPORT}${report.reportID}` as const;
    const onyxData: OnyxData<typeof ONYXKEYS.COLLECTION.REPORT> = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: reportKey,
                value: {wiseQuote: null, wiseQuoteRequest: getWiseQuoteRequest(report, full), errorFields: {wiseQuote: null}},
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

    read(READ_COMMANDS.GET_WISE_QUOTE, {reportID: report.reportID, full}, onyxData);
}

/** Drops the link, which carries a token */
function clearWiseKYCReviewEmbeddedLink() {
    Onyx.set(ONYXKEYS.RAM_ONLY_WISE_KYC_REVIEW_EMBEDDED_LINK, null);
}

/**
 * Optimistic update with no API call: sets the account's Wise onboarding to in review on the device as soon as Wise's hosted KYC form ends with success.
 * Wise sends the form's real result only to our server, through a webhook, so the bank account the server sends next replaces this status with the real one.
 */
function setOptimisticWiseOnboardingInReview(bankAccountID: number) {
    Onyx.merge(ONYXKEYS.BANK_ACCOUNT_LIST, {[bankAccountID]: {accountData: {additionalData: {wise: {status: CONST.WISE.ONBOARDING_STATUS.IN_REVIEW}}}}});
}

export {clearWiseKYCReviewEmbeddedLink, getWiseKYCReviewEmbeddedLink, getWiseQuote, setOptimisticWiseOnboardingInReview};
