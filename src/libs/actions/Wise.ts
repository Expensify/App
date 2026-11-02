import {read} from '@libs/API';
import type {SubmitWiseBusinessOnboardingParams} from '@libs/API/parameters';
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

// TODO: Remove once Auth ships SubmitWiseBusinessOnboarding. It answers the way the command is documented, with the status Wise always returns at launch.
function mockSubmitWiseBusinessOnboarding(params: SubmitWiseBusinessOnboardingParams, {optimisticData, successData}: OnyxData<typeof ONYXKEYS.REIMBURSEMENT_ACCOUNT>) {
    Onyx.update(optimisticData ?? []);
    setTimeout(() => {
        Onyx.update([
            {onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.REIMBURSEMENT_ACCOUNT, value: {achData: {wise: {status: CONST.WISE.ONBOARDING_STATUS.ACTION_REQUIRED}}}},
            ...(successData ?? []),
        ]);
    }, 1500);
}

/** Submits the business to Wise once the admin accepts the terms. The status the server sends decides whether Wise needs more details. */
function submitWiseBusinessOnboarding(bankAccountID: number) {
    const onyxData: OnyxData<typeof ONYXKEYS.REIMBURSEMENT_ACCOUNT> = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                value: {isLoading: true, errors: null},
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                value: {isLoading: false},
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                value: {isLoading: false, errors: getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage')},
            },
        ],
    };

    // TODO: Replace with write(WRITE_COMMANDS.SUBMIT_WISE_BUSINESS_ONBOARDING, params, onyxData) once Auth ships the command
    mockSubmitWiseBusinessOnboarding({bankAccountID, termsAccepted: true, mandateAccepted: true}, onyxData);
}

export {clearWiseKYCReviewEmbeddedLink, getWiseKYCReviewEmbeddedLink, submitWiseBusinessOnboarding};
