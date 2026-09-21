import type {LocalizedTranslate} from '@components/LocaleContextProvider';

import {addErrorMessage} from '@libs/ErrorUtils';
import {
    getCountryZipRegexDetails,
    isValidDate,
    isValidLegalName,
    isValidPastDate,
    isValidZipCodeForCountry,
    meetsMaximumAgeRequirement,
    meetsMinimumAgeRequirement,
} from '@libs/ValidationUtils';

import type {DynamicFormField} from '@src/types/onyx';

import type {DynamicFormValues} from './types';

import {getFieldOptions} from './getFieldOptions';
import isCountryCode from './isCountryCode';
import isFieldVisible from './isFieldVisible';

type DynamicFieldErrors = Record<string, string>;

const PERCENT_MIN = 1;
const PERCENT_MAX = 100;

const CHOICE_TYPES = new Set<DynamicFormField['type']>(['select', 'multiselect', 'radio']);

/** A boolean alone on its page is a Yes/No question, so No is an answer; among other fields it is a consent box that must be ticked */
function isAnswered(value: unknown, isAloneOnPage: boolean): boolean {
    if (Array.isArray(value)) {
        return value.length > 0;
    }
    if (typeof value === 'string') {
        return value.trim() !== '';
    }
    if (typeof value === 'boolean') {
        return isAloneOnPage || value;
    }
    return value !== undefined && value !== null;
}

function hasStaleOption(field: DynamicFormField, value: unknown, values: DynamicFormValues): boolean {
    if (!CHOICE_TYPES.has(field.type)) {
        return false;
    }
    const allowed = new Set(getFieldOptions(field, values).map((option) => option.key));
    const chosen: unknown[] = Array.isArray(value) ? value : [value];
    return chosen.some((key) => typeof key === 'string' && key !== '' && !allowed.has(key));
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

function getFieldErrors(field: DynamicFormField, values: DynamicFormValues, translate: LocalizedTranslate, isAloneOnPage: boolean): string[] {
    const value = values[field.key];
    if (field.required && !isAnswered(value, isAloneOnPage)) {
        return [translate('common.error.fieldRequired')];
    }
    if (field.type === 'list') {
        return getListErrors(field, value, translate);
    }
    if (hasStaleOption(field, value, values)) {
        return [translate('dynamicForm.error.invalidOption')];
    }
    const messages: string[] = [];
    if (field.type === 'address' && field.rule === 'zipCode') {
        const zipCode = values[`${field.key}.zipCode`];
        const chosenCountry = values[`${field.key}.country`];
        const country = typeof chosenCountry === 'string' && isCountryCode(chosenCountry) ? chosenCountry : '';
        if (typeof zipCode === 'string' && zipCode !== '' && !isValidZipCodeForCountry(zipCode, country)) {
            messages.push(translate('privatePersonalDetails.error.incorrectZipFormat', getCountryZipRegexDetails(country)?.samples));
        }
    }
    if (typeof value !== 'string' || value === '') {
        return messages;
    }
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
    if (field.type === 'text' && field.rule === 'legalName' && !isValidLegalName(value)) {
        messages.push(translate('privatePersonalDetails.error.hasInvalidCharacter'));
    }
    if (field.type === 'date') {
        if (!isValidDate(value)) {
            messages.push(translate('dynamicForm.error.invalidDate'));
        } else if (field.rule === 'dateOfBirth' && (!isValidPastDate(value) || !meetsMaximumAgeRequirement(value))) {
            messages.push(translate('bankAccount.error.dob'));
        } else if (field.rule === 'dateOfBirth' && !meetsMinimumAgeRequirement(value)) {
            messages.push(translate('bankAccount.error.age'));
        }
    }
    return messages;
}

function getDynamicFieldErrors(fields: DynamicFormField[], values: DynamicFormValues, translate: LocalizedTranslate): DynamicFieldErrors {
    const errors: DynamicFieldErrors = {};
    const visibleFields = fields.filter((field) => isFieldVisible(field, values));
    const isAloneOnPage = visibleFields.length === 1;
    for (const field of visibleFields) {
        if (field.readonly) {
            continue;
        }
        for (const message of getFieldErrors(field, values, translate, isAloneOnPage)) {
            addErrorMessage(errors, field.key, message);
        }
    }
    return errors;
}

export default getDynamicFieldErrors;
