import type {DynamicFormValues} from '@components/DynamicForm/types';
import getAddressInputKeys from '@components/DynamicForm/utils/getAddressInputKeys';
import getAnswerKeys from '@components/DynamicForm/utils/getAnswerKeys';
import getContentFields from '@components/DynamicForm/utils/getContentFields';
import isSensitiveField from '@components/DynamicForm/utils/isSensitiveField';
import isSupportedField from '@components/DynamicForm/utils/isSupportedField';

import {makeRequestWithSideEffects, waitForWrites, write} from '@libs/API';
import type {SubmitWiseBusinessOnboardingParams, UpdateWiseOnboardingAdditionalDataParams} from '@libs/API/parameters';
import {SIDE_EFFECT_REQUEST_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import isFileUploadable from '@libs/isFileUploadable';

import ONYXKEYS from '@src/ONYXKEYS';
import type {DynamicFormPage} from '@src/types/onyx';
import type {OnyxData} from '@src/types/onyx/Request';
import type {FileObject} from '@src/types/utils/Attachment';

import type {OnyxUpdate} from 'react-native-onyx';

import Onyx from 'react-native-onyx';

type OnboardingPageRequest = {
    /** The page's answers keyed by field. An address is one object with its parts. */
    inputs: Record<string, unknown>;

    /** Files keyed by `<fieldKey>_<index>` */
    files: Record<`${string}_${number}`, FileObject>;
};

/** A read-only row shows what the server already holds, and a sensitive answer is never queued, so neither is sent */
function getOnboardingPageRequest(page: DynamicFormPage, answers: DynamicFormValues): OnboardingPageRequest {
    const request: OnboardingPageRequest = {inputs: {}, files: {}};
    for (const field of getContentFields(page.content).filter(isSupportedField)) {
        if (field.readonly || isSensitiveField(field) || answers[field.key] === undefined) {
            continue;
        }
        const answer = answers[field.key];
        if (field.type === 'file') {
            const items: unknown[] = Array.isArray(answer) ? answer : [];
            // A file that cannot be read back, such as one whose local copy is gone, would reach the server as text
            const files = items
                .filter((item): item is FileObject => item instanceof Blob || (typeof item === 'object' && item !== null && 'uri' in item))
                .filter((file) => isFileUploadable(file));
            for (const [index, file] of files.entries()) {
                request.files[`${field.key}_${index}`] = file;
            }
            continue;
        }
        if (field.type === 'address') {
            const {street, city, state, zipCode, country} = getAddressInputKeys(field.key);
            request.inputs[field.key] = {street: answers[street], city: answers[city], state: answers[state], zipCode: answers[zipCode], country: answers[country]};
            continue;
        }
        request.inputs[field.key] = answer;
    }
    return request;
}

/**
 * Saves one page of the business onboarding on the server, so the answers are never asked twice and another device resumes from them.
 * A queued write, so a page saved offline syncs once the connection returns. Field errors from the server land on the form under each field's key.
 */
function updateWiseOnboardingAdditionalData(bankAccountID: number, page: DynamicFormPage, answers: DynamicFormValues) {
    const {inputs, files} = getOnboardingPageRequest(page, answers);
    const parameters: UpdateWiseOnboardingAdditionalDataParams = {...files, bankAccountID, step: page.key, inputs: JSON.stringify(inputs)};
    const pageAnswerKeys = getContentFields(page.content).filter(isSupportedField).flatMap(getAnswerKeys);

    const onyxData: OnyxData<typeof ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM> = {
        optimisticData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM,
                value: {errors: null, errorFields: Object.fromEntries(pageAnswerKeys.map((key) => [key, null]))},
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM,
                value: {errors: getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage')},
            },
        ],
    };

    write(WRITE_COMMANDS.UPDATE_WISE_ONBOARDING_ADDITIONAL_DATA, parameters, onyxData);
}

/** Sends what the page saves did not: the accepted terms and the SSN held in memory */
function submitWiseBusinessOnboarding(parameters: SubmitWiseBusinessOnboardingParams) {
    const optimisticData: Array<OnyxUpdate<typeof ONYXKEYS.RAM_ONLY_WISE_BUSINESS_ONBOARDING_SUBMIT | typeof ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM>> = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.RAM_ONLY_WISE_BUSINESS_ONBOARDING_SUBMIT,
            value: {isLoading: true, errors: null},
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM,
            value: {errors: null, errorFields: null},
        },
    ];
    const onyxData: OnyxData<
        | typeof ONYXKEYS.RAM_ONLY_WISE_BUSINESS_ONBOARDING_SUBMIT
        | typeof ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM
        | typeof ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM_DRAFT
        | typeof ONYXKEYS.RAM_ONLY_DYNAMIC_FORM_SENSITIVE_ANSWERS
    > = {
        successData: [
            {
                onyxMethod: Onyx.METHOD.SET,
                key: ONYXKEYS.RAM_ONLY_WISE_BUSINESS_ONBOARDING_SUBMIT,
                value: {isLoading: false},
            },
            {
                onyxMethod: Onyx.METHOD.SET,
                key: ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM_DRAFT,
                value: null,
            },
            {
                onyxMethod: Onyx.METHOD.SET,
                key: ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM,
                value: null,
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.RAM_ONLY_DYNAMIC_FORM_SENSITIVE_ANSWERS,
                value: {[ONYXKEYS.FORMS.WISE_BUSINESS_ONBOARDING_FORM]: null},
            },
        ],
        failureData: [
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.RAM_ONLY_WISE_BUSINESS_ONBOARDING_SUBMIT,
                value: {isLoading: false, errors: getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage')},
            },
        ],
    };

    Onyx.update(optimisticData);
    // Auth reads the answers the page saves stored, so Submit goes after any save still in the queue
    waitForWrites(SIDE_EFFECT_REQUEST_COMMANDS.SUBMIT_WISE_BUSINESS_ONBOARDING).then(() => {
        // A write would store its parameters, the SSN here, in the request queue on the device until it finishes
        makeRequestWithSideEffects(SIDE_EFFECT_REQUEST_COMMANDS.SUBMIT_WISE_BUSINESS_ONBOARDING, parameters, onyxData);
    });
}

export {submitWiseBusinessOnboarding, updateWiseOnboardingAdditionalData};
