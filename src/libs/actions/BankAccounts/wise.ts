import type {DynamicFormValues} from '@components/DynamicForm/types';

import {read, write} from '@libs/API';
import type {SubmitWiseKYCRequirementParams} from '@libs/API/parameters';
import type {WiseKYCFileParamKey} from '@libs/API/parameters/SubmitWiseKYCRequirementParams';
import {READ_COMMANDS, WRITE_COMMANDS} from '@libs/API/types';
import {getMicroSecondOnyxErrorWithTranslationKey} from '@libs/ErrorUtils';

import ONYXKEYS from '@src/ONYXKEYS';
import type {FileObject} from '@src/types/utils/Attachment';

import Onyx from 'react-native-onyx';

function getWiseKYCRequirements(bankAccountID: number) {
    read(READ_COMMANDS.GET_WISE_KYC_REQUIREMENTS, {bankAccountID});
}

function isFileList(value: unknown): value is FileObject[] {
    return Array.isArray(value) && value.every((item) => typeof item === 'object' && item !== null && 'name' in item);
}

function submitWiseKYCRequirement(bankAccountID: number, requirementKey: string, draft: DynamicFormValues) {
    const answers: Record<string, unknown> = {};
    const files: Record<WiseKYCFileParamKey, FileObject> = {};
    for (const [key, value] of Object.entries(draft)) {
        if (isFileList(value)) {
            for (const [index, file] of value.entries()) {
                files[`${key}_${index}`] = file;
            }
        } else if (value !== undefined) {
            answers[key] = value;
        }
    }

    const parameters: SubmitWiseKYCRequirementParams = {bankAccountID, requirementKey, submissionData: JSON.stringify(answers), ...files};

    write(WRITE_COMMANDS.SUBMIT_WISE_KYC_REQUIREMENT, parameters, {
        optimisticData: [{onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.FORMS.WISE_KYC_REQUIREMENT_FORM, value: {isLoading: true, errors: null}}],
        successData: [
            {onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.FORMS.WISE_KYC_REQUIREMENT_FORM, value: {isLoading: false}},
            {onyxMethod: Onyx.METHOD.SET, key: ONYXKEYS.FORMS.WISE_KYC_REQUIREMENT_FORM_DRAFT, value: null},
        ],
        failureData: [{onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.FORMS.WISE_KYC_REQUIREMENT_FORM, value: {isLoading: false}}],
    });
}

function getWiseKYCReviewEmbeddedLink(bankAccountID: number) {
    read(
        READ_COMMANDS.GET_WISE_KYC_REVIEW_EMBEDDED_LINK,
        {bankAccountID},
        {
            optimisticData: [{onyxMethod: Onyx.METHOD.SET, key: ONYXKEYS.WISE_KYC_REVIEW_EMBEDDED_LINK, value: {isLoading: true}}],
            finallyData: [{onyxMethod: Onyx.METHOD.MERGE, key: ONYXKEYS.WISE_KYC_REVIEW_EMBEDDED_LINK, value: {isLoading: false}}],
            failureData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.WISE_KYC_REVIEW_EMBEDDED_LINK,
                    value: {errors: getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage')},
                },
            ],
        },
    );
}

export {getWiseKYCRequirements, getWiseKYCReviewEmbeddedLink, submitWiseKYCRequirement};
