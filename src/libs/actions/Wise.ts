import type {DynamicFormValues} from '@components/DynamicForm/types';
import getAddressInputKeys from '@components/DynamicForm/utils/getAddressInputKeys';
import getAnswerKeys from '@components/DynamicForm/utils/getAnswerKeys';
import getContentFields from '@components/DynamicForm/utils/getContentFields';
import isSensitiveField from '@components/DynamicForm/utils/isSensitiveField';
import isSupportedField from '@components/DynamicForm/utils/isSupportedField';

import {write} from '@libs/API';
import type {UpdateWiseOnboardingAdditionalDataParams} from '@libs/API/parameters';
import {WRITE_COMMANDS} from '@libs/API/types';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';
import isFileUploadable from '@libs/isFileUploadable';

import ONYXKEYS from '@src/ONYXKEYS';
import type {DynamicFormPage} from '@src/types/onyx';
import type {OnyxData} from '@src/types/onyx/Request';
import type {FileObject} from '@src/types/utils/Attachment';

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

// eslint-disable-next-line import/prefer-default-export
export {updateWiseOnboardingAdditionalData};
