import {makeRequestWithSideEffects, write} from '@libs/API';
import type {UpdateWiseOnboardingAdditionalDataParams} from '@libs/API/parameters';
import {SIDE_EFFECT_REQUEST_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import Log from '@libs/Log';

import ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxData} from '@src/types/onyx/Request';

import Onyx from 'react-native-onyx';

function getOnyxData(): OnyxData<typeof ONYXKEYS.REIMBURSEMENT_ACCOUNT> {
    return {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                value: {isSavingWiseOnboardingPage: true, errors: null},
            },
        ],
        // The server routes its own error message, such as "Invalid step", to `errors`, so only the flag is reset here
        finallyData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                value: {isSavingWiseOnboardingPage: false},
            },
        ],
    };
}

/** Saves one intake page of the Wise business onboarding through the request queue. The server merges what it saved into `achData.wise`. */
function saveWiseOnboardingPage(params: UpdateWiseOnboardingAdditionalDataParams) {
    write(WRITE_COMMANDS.UPDATE_WISE_ONBOARDING_ADDITIONAL_DATA, params, getOnyxData());
}

/** Saves an intake page carrying an SSN without the request queue, since queued requests are written to disk. It is not retried offline. */
function saveWiseOnboardingPageWithSensitiveAnswers(params: UpdateWiseOnboardingAdditionalDataParams) {
    makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.UPDATE_WISE_ONBOARDING_ADDITIONAL_DATA, params, getOnyxData()).catch((error: unknown) => {
        Log.hmmm('[WiseOnboarding] Failed to save a page with a sensitive answer', {
            step: params.step,
            error,
        });
        Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {
            isSavingWiseOnboardingPage: false,
            errors: getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
        });
    });
}

/** Saves one intake page, keeping a page with sensitive answers, such as an SSN in its inputs, out of the request queue */
function updateWiseOnboardingAdditionalData(params: UpdateWiseOnboardingAdditionalDataParams, hasSensitiveAnswers: boolean) {
    if (hasSensitiveAnswers) {
        saveWiseOnboardingPageWithSensitiveAnswers(params);
        return;
    }
    saveWiseOnboardingPage(params);
}

export default updateWiseOnboardingAdditionalData;
