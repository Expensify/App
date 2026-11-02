import {write} from '@libs/API';
import {WRITE_COMMANDS} from '@libs/API/types';

import ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxData} from '@src/types/onyx/Request';

import Onyx from 'react-native-onyx';

/** Saves one page of the Wise business onboarding form on the bank account, so the server holds every answer Submit needs */
function updateWiseOnboardingAdditionalData(bankAccountID: number, step: string, inputs: Record<string, unknown>) {
    const onyxData: OnyxData<typeof ONYXKEYS.REIMBURSEMENT_ACCOUNT> = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                value: {isSavingWiseOnboardingPage: true, errors: null},
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                value: {isSavingWiseOnboardingPage: false},
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                value: {isSavingWiseOnboardingPage: false},
            },
        ],
    };
    write(WRITE_COMMANDS.UPDATE_WISE_ONBOARDING_ADDITIONAL_DATA, {bankAccountID, step, inputs: JSON.stringify(inputs)}, onyxData);
}

/** Submits the company behind the bank account to Wise with the pages already saved on it. A failure leaves the server's message in the reimbursement account's errors. */
function submitWiseBusinessOnboarding(bankAccountID: number) {
    const onyxData: OnyxData<typeof ONYXKEYS.REIMBURSEMENT_ACCOUNT> = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                value: {isSubmittingWiseBusinessOnboarding: true, errors: null},
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                value: {isSubmittingWiseBusinessOnboarding: false},
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                value: {isSubmittingWiseBusinessOnboarding: false},
            },
        ],
    };
    write(WRITE_COMMANDS.SUBMIT_WISE_BUSINESS_ONBOARDING, {bankAccountID}, onyxData);
}

export {submitWiseBusinessOnboarding, updateWiseOnboardingAdditionalData};
