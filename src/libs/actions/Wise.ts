import type {DynamicFormValues} from '@components/DynamicForm/types';

import {read, write} from '@libs/API';
import type {UpdateWiseOnboardingAdditionalDataParams} from '@libs/API/parameters';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxData} from '@src/types/onyx/Request';
import type {FileObject} from '@src/types/utils/Attachment';

import Onyx from 'react-native-onyx';

/** Requests a fresh link to Wise's embedded KYC page. A link is short-lived and single-use, so every open of the page asks for a new one. */
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
                value: {
                    isLoading: false,
                    errors: getMicroSecondOnyxErrorWithTranslationKey('walletPage.wiseKYCReview.errorSubtitle'),
                },
            },
        ],
    };

    read(READ_COMMANDS.GET_WISE_KYC_REVIEW_EMBEDDED_LINK, {bankAccountID}, onyxData);
}

/** Drops the link once the page closes, since it carries a token */
function clearWiseKYCReviewEmbeddedLink() {
    Onyx.set(ONYXKEYS.RAM_ONLY_WISE_KYC_REVIEW_EMBEDDED_LINK, null);
}

function isFileObject(value: unknown): value is FileObject {
    return typeof value === 'object' && value !== null;
}

/**
 * Saves one onboarding page's answers on the server, so a resume on another device lands after it.
 * Files travel as their own request parameters, because a request carries only files and plain values.
 */
function updateWiseOnboardingAdditionalData(bankAccountID: number, step: string, answers: DynamicFormValues, fileKeys: string[]) {
    const inputs: DynamicFormValues = {};
    const files: Record<string, FileObject> = {};
    for (const [key, value] of Object.entries(answers)) {
        if (fileKeys.includes(key) && Array.isArray(value)) {
            for (const [index, file] of value.filter(isFileObject).entries()) {
                files[`${key}_${index}`] = file;
            }
            continue;
        }
        inputs[key] = value;
    }

    const parameters: UpdateWiseOnboardingAdditionalDataParams = {...files, bankAccountID, step, inputs: JSON.stringify(inputs)};
    const onyxData: OnyxData<typeof ONYXKEYS.REIMBURSEMENT_ACCOUNT> = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                value: {achData: {wise: {step}}},
            },
        ],
    };

    write(WRITE_COMMANDS.UPDATE_WISE_ONBOARDING_ADDITIONAL_DATA, parameters, onyxData);
}

/** Submits the business to Wise once every onboarding page is saved. The server reads the answers it already holds. */
function submitWiseBusinessOnboarding(bankAccountID: number, policyID?: string) {
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
                value: {
                    isLoading: false,
                    errors: getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                },
            },
        ],
    };

    write(WRITE_COMMANDS.SUBMIT_WISE_BUSINESS_ONBOARDING, {bankAccountID, policyID, termsAccepted: true, mandateAccepted: true}, onyxData);
}

export {getWiseKYCReviewEmbeddedLink, clearWiseKYCReviewEmbeddedLink, updateWiseOnboardingAdditionalData, submitWiseBusinessOnboarding};
