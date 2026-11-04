import {read} from '@libs/API';
import {READ_COMMANDS} from '@libs/API/types';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxData} from '@src/types/onyx/Request';

import Onyx from 'react-native-onyx';

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

/** Drops the link, which carries a token */
function clearWiseKYCReviewEmbeddedLink() {
    Onyx.set(ONYXKEYS.RAM_ONLY_WISE_KYC_REVIEW_EMBEDDED_LINK, null);
}

/**
 * Shows the onboarding as in review as soon as Wise's hosted KYC form ends with success.
 * Only Wise's webhook tells the server the real result, so the server's next push replaces this value.
 */
function markWiseKYCReviewSubmitted(bankAccountID: number) {
    Onyx.merge(ONYXKEYS.BANK_ACCOUNT_LIST, {[bankAccountID]: {accountData: {additionalData: {wise: {status: CONST.WISE.ONBOARDING_STATUS.IN_REVIEW}}}}});
}

export {clearWiseKYCReviewEmbeddedLink, getWiseKYCReviewEmbeddedLink, markWiseKYCReviewSubmitted};
