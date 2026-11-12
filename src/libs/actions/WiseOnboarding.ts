import type {DynamicFormValues} from '@components/DynamicForm/types';

import {makeRequestWithSideEffects, write} from '@libs/API';
import type {SubmitWiseBusinessOnboardingParams, UpdateWiseOnboardingAdditionalDataParams} from '@libs/API/parameters';
import {SIDE_EFFECT_REQUEST_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import getWiseOnboardingPageParams from '@libs/getWiseOnboardingPageParams';
import {rand64} from '@libs/NumberUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type {DynamicFormPage} from '@src/types/onyx';
import type {OnyxData} from '@src/types/onyx/Request';

import Onyx from 'react-native-onyx';

/**
 * Marks the page as unsaved until its own save succeeds, since `errors` is shared by every page and the next page's save clears it. It also covers a save
 * whose answer never comes, as when the app closes during a request that is not queued, since the running saves are kept only in memory. A failed save marks the page again, so when the same page is
 * saved twice, the success of the earlier save does not hide the failure of the later one.
 */
function getOnyxData(step: string, saveID: string): OnyxData<typeof ONYXKEYS.REIMBURSEMENT_ACCOUNT | typeof ONYXKEYS.RAM_ONLY_WISE_ONBOARDING_PENDING_SAVES> {
    return {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.RAM_ONLY_WISE_ONBOARDING_PENDING_SAVES,
                value: {[saveID]: true},
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                value: {errors: null, wiseOnboardingUnsavedPages: {[step]: true}},
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                value: {wiseOnboardingUnsavedPages: {[step]: null}},
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                value: {wiseOnboardingUnsavedPages: {[step]: true}},
            },
        ],
        // The server routes its own error message, such as "Invalid step", to `errors`, so only this save's entry is dropped here
        finallyData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.RAM_ONLY_WISE_ONBOARDING_PENDING_SAVES,
                value: {[saveID]: null},
            },
        ],
    };
}

/** Saves one intake page of the Wise business onboarding through the request queue. The server merges what it saved into `achData.wise`. */
function saveWiseOnboardingPageThroughQueue(params: UpdateWiseOnboardingAdditionalDataParams) {
    write(WRITE_COMMANDS.UPDATE_WISE_ONBOARDING_ADDITIONAL_DATA, params, getOnyxData(params.step, rand64()));
}

/** The last save of each page sent without the request queue, keyed by bank account and step */
const lastSavesWithSensitiveAnswers = new Map<string, Promise<unknown>>();

/**
 * Saves an intake page carrying an SSN without the request queue, since queued requests are written to disk. The flow saves pages only online, so a
 * failure here, including a connection that drops mid-request, is a failed save that is not retried. A dropped connection resolves the request
 * instead of rejecting it, so the failure data marks the page unsaved. Without the queue, two saves of a page could answer out of order, so a page's
 * save is sent only after its previous one answers, and the answer of the latest save always decides whether the page is unsaved. The optimistic data
 * is applied at once, so the flow counts the save as running while it waits.
 */
function saveWiseOnboardingPageWithSensitiveAnswers(params: UpdateWiseOnboardingAdditionalDataParams) {
    const {optimisticData, ...onyxData} = getOnyxData(params.step, rand64());
    Onyx.update(optimisticData ?? []);
    const pageKey = `${params.bankAccountID}:${params.step}`;
    const previousSave = lastSavesWithSensitiveAnswers.get(pageKey) ?? Promise.resolve();
    const save = previousSave.then(() => makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.UPDATE_WISE_ONBOARDING_ADDITIONAL_DATA, params, onyxData));
    lastSavesWithSensitiveAnswers.set(pageKey, save);
}

/**
 * Saves one intake page the user left with Next. A typed SSN goes in `inputs`, where the server reads it, and keeps the request out of the queue.
 * A page whose key is not a step the server accepts is not sent, since the server would answer it with 400 Invalid step.
 */
function saveWiseOnboardingPage(bankAccountID: number, page: DynamicFormPage, answers: DynamicFormValues, sensitiveAnswers: DynamicFormValues) {
    // A blank SSN keeps the one the server holds, so it is only sent when the user typed one
    const ssn = typeof sensitiveAnswers.ssn === 'string' && sensitiveAnswers.ssn !== '' ? sensitiveAnswers.ssn : undefined;
    const params = getWiseOnboardingPageParams(bankAccountID, page, ssn ? {...answers, ssn} : answers);
    if (!params) {
        return;
    }
    if (ssn) {
        saveWiseOnboardingPageWithSensitiveAnswers(params);
        return;
    }
    saveWiseOnboardingPageThroughQueue(params);
}

/** Drops the unsaved pages of the bank account the draft held, since they say nothing about another account's saves */
function clearWiseOnboardingUnsavedPages() {
    Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {wiseOnboardingUnsavedPages: null});
}

/** Submits the business to Wise with the answers its pages saved. Auth creates the Wise profile and opens Wise's review in the same request. */
function submitWiseBusinessOnboarding(params: SubmitWiseBusinessOnboardingParams) {
    const onyxData: OnyxData<typeof ONYXKEYS.REIMBURSEMENT_ACCOUNT> = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                value: {isSubmittingWiseBusinessOnboarding: true, isWiseBusinessOnboardingSubmitSuccessful: null, errors: null},
            },
        ],
        successData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                value: {isWiseBusinessOnboardingSubmitSuccessful: true},
            },
        ],
        // Key 0 so a message Auth sends with its response always sorts newer than this fallback, even with device clock skew
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                value: {isWiseBusinessOnboardingSubmitSuccessful: false, errors: getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage', 0)},
            },
        ],
        // A 460 answer applies neither the success nor the failure data, so the loading ends here
        finallyData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.REIMBURSEMENT_ACCOUNT,
                value: {isSubmittingWiseBusinessOnboarding: false},
            },
        ],
    };
    write(WRITE_COMMANDS.SUBMIT_WISE_BUSINESS_ONBOARDING, params, onyxData);
}

function clearWiseBusinessOnboardingSubmission() {
    Onyx.merge(ONYXKEYS.REIMBURSEMENT_ACCOUNT, {isSubmittingWiseBusinessOnboarding: null, isWiseBusinessOnboardingSubmitSuccessful: null});
}

export default saveWiseOnboardingPage;
export {clearWiseBusinessOnboardingSubmission, clearWiseOnboardingUnsavedPages, submitWiseBusinessOnboarding};
