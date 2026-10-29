import {makeRequestWithSideEffects, write} from '@libs/API';
import type {UpdateWiseOnboardingAdditionalDataParams} from '@libs/API/parameters';
import {SIDE_EFFECT_REQUEST_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import Log from '@libs/Log';
import {rand64} from '@libs/NumberUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type {OnyxData} from '@src/types/onyx/Request';

import Onyx from 'react-native-onyx';

/**
 * Marks the page as unsaved until its own save succeeds, since `errors` is shared by every page and the next page's save clears it. It also covers a save
 * whose answer never comes, as when the app closes during a request that is not queued.
 */
function getOnyxData(step: string, saveID: string): OnyxData<typeof ONYXKEYS.REIMBURSEMENT_ACCOUNT> {
    return {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                value: {wiseOnboardingPendingSaves: {[saveID]: true}, errors: null, wiseOnboardingUnsavedPages: {[step]: true}},
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                value: {wiseOnboardingUnsavedPages: {[step]: null}},
            },
        ],
        // The server routes its own error message, such as "Invalid step", to `errors`, so only this save's entry is dropped here
        finallyData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                value: {wiseOnboardingPendingSaves: {[saveID]: null}},
            },
        ],
    };
}

/** Saves one intake page of the Wise business onboarding through the request queue. The server merges what it saved into `achData.wise`. */
function saveWiseOnboardingPage(params: UpdateWiseOnboardingAdditionalDataParams) {
    write(WRITE_COMMANDS.UPDATE_WISE_ONBOARDING_ADDITIONAL_DATA, params, getOnyxData(params.step, rand64()));
}

/** Saves an intake page carrying an SSN without the request queue, since queued requests are written to disk. It is not retried offline. */
function saveWiseOnboardingPageWithSensitiveAnswers(params: UpdateWiseOnboardingAdditionalDataParams) {
    const saveID = rand64();
    makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.UPDATE_WISE_ONBOARDING_ADDITIONAL_DATA, params, getOnyxData(params.step, saveID)).catch((error: unknown) => {
        Log.hmmm('[WiseOnboarding] Failed to save a page with a sensitive answer', {
            step: params.step,
            error,
        });
        Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {
            wiseOnboardingPendingSaves: {[saveID]: null},
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

/** Drops the unsaved pages of the bank account the draft held, since they say nothing about another account's saves */
function clearWiseOnboardingUnsavedPages() {
    Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {wiseOnboardingUnsavedPages: null});
}

/**
 * Ends the page saves left running by an earlier visit, as when the app closed before a save that is not queued answered. Their pages stay unsaved, so
 * Confirm stays blocked until those pages save.
 */
function clearWiseOnboardingSaving() {
    Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {wiseOnboardingPendingSaves: null});
}

export default updateWiseOnboardingAdditionalData;
export {clearWiseOnboardingSaving, clearWiseOnboardingUnsavedPages};
