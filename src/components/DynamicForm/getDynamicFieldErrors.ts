import type {LocalizedTranslate} from '@components/LocaleContextProvider';

import {isValidDate} from '@libs/ValidationUtils';

import type {WiseField} from '@src/types/onyx';

import type {DynamicFormValues} from './types';

import isFieldVisible from './isFieldVisible';

type DynamicFieldErrors = Record<string, string>;

function isAnswered(value: unknown): boolean {
    if (Array.isArray(value)) {
        return value.length > 0;
    }
    if (typeof value === 'string') {
        return value.trim() !== '';
    }
    if (typeof value === 'boolean') {
        return value;
    }
    return value !== undefined && value !== null;
}

function getFieldError(field: WiseField, value: unknown, translate: LocalizedTranslate): string | undefined {
    if (field.required && !isAnswered(value)) {
        return translate('common.error.fieldRequired');
    }
    if (typeof value !== 'string' || value === '') {
        return undefined;
    }
    if (field.regex && !new RegExp(field.regex).test(value)) {
        return translate('dynamicForm.error.invalidFormat', {example: field.example});
    }
    if (field.minLength !== undefined && value.length < field.minLength) {
        return translate('dynamicForm.error.tooShort', {minLength: field.minLength});
    }
    if (field.maxLength !== undefined && value.length > field.maxLength) {
        return translate('dynamicForm.error.tooLong', {maxLength: field.maxLength});
    }
    if (field.type === 'date' && !isValidDate(value)) {
        return translate('dynamicForm.error.invalidDate');
    }
    return undefined;
}

function getDynamicFieldErrors(fields: WiseField[], values: DynamicFormValues, translate: LocalizedTranslate): DynamicFieldErrors {
    const errors: DynamicFieldErrors = {};
    for (const field of fields) {
        if (!isFieldVisible(field, values)) {
            continue;
        }
        const error = getFieldError(field, values[field.key], translate);
        if (error) {
            errors[field.key] = error;
        }
    }
    return errors;
}

export default getDynamicFieldErrors;
export type {DynamicFieldErrors};
