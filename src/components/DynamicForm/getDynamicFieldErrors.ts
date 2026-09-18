import type {LocalizedTranslate} from '@components/LocaleContextProvider';

import {addErrorMessage} from '@libs/ErrorUtils';
import {isValidDate} from '@libs/ValidationUtils';

import type {DynamicFormField} from '@src/types/onyx';

import type {DynamicFormValues} from './types';

import isFieldVisible from './isFieldVisible';

type DynamicFieldErrors = Record<string, string>;

const PERCENT_MIN = 1;
const PERCENT_MAX = 100;

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

function isAnswerRecord(item: unknown): item is DynamicFormValues {
    return typeof item === 'object' && item !== null && !Array.isArray(item);
}

function getListErrors(field: DynamicFormField, value: unknown, translate: LocalizedTranslate): string[] {
    const items: unknown[] = Array.isArray(value) ? value : [];
    const messages: string[] = [];
    if (field.minItems !== undefined && items.length < field.minItems) {
        messages.push(translate('dynamicForm.error.tooFewItems', {min: field.minItems}));
    }
    if (field.maxItems !== undefined && items.length > field.maxItems) {
        messages.push(translate('dynamicForm.error.tooManyItems', {max: field.maxItems}));
    }
    const itemFields = field.itemFields ?? [];
    for (const item of items) {
        if (!isAnswerRecord(item)) {
            continue;
        }
        const itemErrors = getDynamicFieldErrors(itemFields, item, translate);
        const firstItemError = Object.values(itemErrors).at(0);
        if (firstItemError) {
            messages.push(firstItemError);
            break;
        }
    }
    return messages;
}

function getFieldErrors(field: DynamicFormField, value: unknown, translate: LocalizedTranslate): string[] {
    if (field.required && !isAnswered(value)) {
        return [translate('common.error.fieldRequired')];
    }
    if (field.type === 'list') {
        return getListErrors(field, value, translate);
    }
    if (typeof value !== 'string' || value === '') {
        return [];
    }
    const messages: string[] = [];
    if (field.type === 'percent') {
        const percent = Number(value);
        if (!Number.isFinite(percent) || percent < PERCENT_MIN || percent > PERCENT_MAX) {
            messages.push(translate('dynamicForm.error.outOfRange', {min: PERCENT_MIN, max: PERCENT_MAX}));
        }
    }
    if (field.regex && !new RegExp(field.regex).test(value)) {
        messages.push(translate('dynamicForm.error.invalidFormat', {example: field.example}));
    }
    if (field.minLength !== undefined && value.length < field.minLength) {
        messages.push(translate('dynamicForm.error.tooShort', {minLength: field.minLength}));
    }
    if (field.maxLength !== undefined && value.length > field.maxLength) {
        messages.push(translate('common.error.characterLimitExceedCounter', value.length, field.maxLength));
    }
    if (field.type === 'date' && !isValidDate(value)) {
        messages.push(translate('dynamicForm.error.invalidDate'));
    }
    return messages;
}

function getDynamicFieldErrors(fields: DynamicFormField[], values: DynamicFormValues, translate: LocalizedTranslate): DynamicFieldErrors {
    const errors: DynamicFieldErrors = {};
    for (const field of fields) {
        if (field.readonly || !isFieldVisible(field, values)) {
            continue;
        }
        for (const message of getFieldErrors(field, values[field.key], translate)) {
            addErrorMessage(errors, field.key, message);
        }
    }
    return errors;
}

export default getDynamicFieldErrors;
export type {DynamicFieldErrors};
