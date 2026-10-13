import type {DynamicFormFieldOfType, DynamicFormValues} from '@components/DynamicForm/types';
import type {FormValue} from '@components/Form/types';
import type {LocalizedTranslate} from '@components/LocaleContextProvider';

import {addErrorMessage} from '@libs/ErrorUtils';
import {
    getCountryZipRegexDetails,
    isValidDate,
    isValidLegalName,
    isValidPastDate,
    isValidPhoneInternational,
    isValidZipCodeForCountry,
    meetsMaximumAgeRequirement,
    meetsMinimumAgeRequirement,
} from '@libs/ValidationUtils';

import type {
    DynamicFormAddressField,
    DynamicFormChoiceField,
    DynamicFormField,
    DynamicFormFieldType,
    DynamicFormNumberField,
    DynamicFormSchemaField,
    DynamicFormTextField,
} from '@src/types/onyx';

import getAddressInputKeys, {getAddressCountry, isStateAsked} from './getAddressInputKeys';
import getFieldOptions from './getFieldOptions';
import getVisibleFields, {getLoneField} from './getVisibleFields';
import isSupportedField from './isSupportedField';
import logSchemaProblem from './logSchemaProblem';

/** Checks a field the user has answered. Unanswered fields only get the required check. */
type FieldValidator<TType extends DynamicFormFieldType> = (field: DynamicFormFieldOfType<TType>, values: DynamicFormValues, translate: LocalizedTranslate) => string[];

/** A checkbox that is not ticked is unanswered. `isNoAnAnswer` is for a boolean asked as a Yes/No question, where No answers it. */
function isAnswered(value: FormValue | undefined, isNoAnAnswer = false): boolean {
    if (typeof value === 'boolean') {
        return value || isNoAnAnswer;
    }
    if (typeof value === 'string') {
        return value.trim() !== '';
    }
    if (Array.isArray(value)) {
        return value.length > 0;
    }
    return value instanceof Date;
}

function getStringAnswer(field: DynamicFormField, values: DynamicFormValues): string {
    const value = values[field.key];
    return typeof value === 'string' ? value : '';
}

function getStringListAnswer(field: DynamicFormField, values: DynamicFormValues): string[] {
    const value = values[field.key];
    if (!Array.isArray(value)) {
        return [];
    }
    const items: unknown[] = value;
    return items.filter((item): item is string => typeof item === 'string');
}

function matchesRegex(value: string, pattern: string, fieldKey: string): boolean {
    try {
        return new RegExp(pattern).test(value);
    } catch {
        logSchemaProblem('Invalid regex', {key: fieldKey, regex: pattern});
        return true;
    }
}

/** The format checks text and number fields share */
function getFormatErrors(field: DynamicFormTextField | DynamicFormNumberField, value: string, translate: LocalizedTranslate): string[] {
    const messages: string[] = [];
    if (field.regex && !matchesRegex(value, field.regex, field.key)) {
        messages.push(translate('dynamicForm.error.invalidFormat', {example: field.example}));
    }
    if (field.minLength !== undefined && value.length < field.minLength) {
        messages.push(translate('dynamicForm.error.tooShort', {minLength: field.minLength}));
    }
    if (field.maxLength !== undefined && value.length > field.maxLength) {
        messages.push(translate('common.error.characterLimitExceedCounter', value.length, field.maxLength));
    }
    return messages;
}

function getChoiceErrors(field: DynamicFormChoiceField, values: DynamicFormValues, translate: LocalizedTranslate): string[] {
    const value = getStringAnswer(field, values);
    const isOffered = getFieldOptions(field, values).some((option) => option.key === value);
    return isOffered ? [] : [translate('dynamicForm.error.invalidOption')];
}

/** Options change with the answer they depend on, so a chosen key can stop being offered */
function getMultiChoiceErrors(field: DynamicFormFieldOfType<'multiselect' | 'countryMultiselect'>, values: DynamicFormValues, translate: LocalizedTranslate): string[] {
    const offeredKeys = new Set(getFieldOptions(field, values).map((option) => option.key));
    const answer = values[field.key];
    const keys = getStringListAnswer(field, values);
    const hasNonStringEntry = Array.isArray(answer) && keys.length !== answer.length;
    return !hasNonStringEntry && keys.every((key) => offeredKeys.has(key)) ? [] : [translate('dynamicForm.error.invalidOption')];
}

/** For inputs that only accept valid answers: UploadFile checks type and count, AmountForm rejects invalid typing */
const noChecks = () => [];

const PERCENT_MIN = 1;
const PERCENT_MAX = 100;

const VALIDATORS: {[TType in DynamicFormFieldType]: FieldValidator<TType>} = {
    text: (field, values, translate) => {
        const value = getStringAnswer(field, values);
        const messages = getFormatErrors(field, value, translate);
        if (field.rule === 'legalName' && !isValidLegalName(value)) {
            messages.push(translate('privatePersonalDetails.error.hasInvalidCharacter'));
        }
        if (field.rule === 'phone' && !isValidPhoneInternational(value)) {
            messages.push(translate('common.error.phoneNumber'));
        }
        return messages;
    },
    number: (field, values, translate) => {
        const value = getStringAnswer(field, values);
        if (!Number.isFinite(Number(value))) {
            return [translate('dynamicForm.error.invalidFormat', {example: field.example})];
        }
        return getFormatErrors(field, value, translate);
    },
    select: getChoiceErrors,
    radio: getChoiceErrors,
    date: (field, values, translate) => {
        const value = getStringAnswer(field, values);
        if (!isValidDate(value)) {
            return [translate('common.error.dateInvalid')];
        }
        if (field.rule !== 'dateOfBirth') {
            return [];
        }
        if (!isValidPastDate(value) || !meetsMaximumAgeRequirement(value)) {
            return [translate('bankAccount.error.dob')];
        }
        return meetsMinimumAgeRequirement(value) ? [] : [translate('bankAccount.error.age')];
    },
    // The street is the field's own value and needs no check beyond required. getAddressPartErrors checks the other parts.
    address: noChecks,
    multiselect: getMultiChoiceErrors,
    countryMultiselect: getMultiChoiceErrors,
    boolean: noChecks,
    country: noChecks,
    currency: noChecks,
    file: noChecks,
    amount: noChecks,
    percent: (field, values, translate) => {
        const percent = Number(getStringAnswer(field, values));
        return Number.isFinite(percent) && percent >= PERCENT_MIN && percent <= PERCENT_MAX ? [] : [translate('dynamicForm.error.outOfRange', {min: PERCENT_MIN, max: PERCENT_MAX})];
    },
};

/** An optional address the user has started filling in is checked like a required one, so it is never submitted in part */
function isAddressRequired(field: DynamicFormAddressField, values: DynamicFormValues): boolean {
    const {street, city, state, zipCode, country} = getAddressInputKeys(field.key);
    return field.required || [street, city, state, zipCode, country].some((partKey) => isAnswered(values[partKey]));
}

/** Each address part has its own input, so its errors go under its own draft key */
function getAddressPartErrors(field: DynamicFormAddressField, values: DynamicFormValues, translate: LocalizedTranslate): Array<[inputID: string, message: string]> {
    const addressKeys = getAddressInputKeys(field.key);
    const country = getAddressCountry(field.key, values);
    // A country whose zip format accepts an empty zip does not require one
    const isZipAsked = !country || !isValidZipCodeForCountry('', country);
    const partErrors: Array<[string, string]> = [];
    if (isAddressRequired(field, values)) {
        const requiredPartKeys = [addressKeys.city, addressKeys.country, ...(isZipAsked ? [addressKeys.zipCode] : []), ...(isStateAsked(country) ? [addressKeys.state] : [])];
        for (const partKey of requiredPartKeys) {
            if (!isAnswered(values[partKey])) {
                partErrors.push([partKey, translate('common.error.fieldRequired')]);
            }
        }
    }
    const zipCode = values[addressKeys.zipCode];
    if (field.rule !== 'zipCode' || typeof zipCode !== 'string' || zipCode.trim() === '') {
        return partErrors;
    }
    if (!isValidZipCodeForCountry(zipCode, country)) {
        partErrors.push([addressKeys.zipCode, translate('privatePersonalDetails.error.incorrectZipFormat', getCountryZipRegexDetails(country)?.samples)]);
    }
    return partErrors;
}

function validateField<TType extends DynamicFormFieldType>(field: DynamicFormFieldOfType<TType>, values: DynamicFormValues, translate: LocalizedTranslate): string[] {
    const validate: FieldValidator<TType> = VALIDATORS[field.type];
    return validate(field, values, translate);
}

/**
 * Errors for the fields the user can see, keyed by draft key, in the shape FormProvider's `validate` returns.
 * `fields` must be exactly one page's fields, since the lone-field check has to match what the page renders. Pass the whole form as `allFields` when a `showWhen` can name a field on another page.
 */
function getDynamicFieldErrors(fields: DynamicFormSchemaField[], values: DynamicFormValues, translate: LocalizedTranslate, allFields?: DynamicFormField[]): Record<string, string> {
    const errors: Record<string, string> = {};
    const visibleFields = getVisibleFields(fields.filter(isSupportedField), values, allFields);
    const loneField = getLoneField(visibleFields);
    for (const field of visibleFields) {
        if (field.readonly) {
            continue;
        }
        if (field.type === 'address') {
            for (const [inputID, message] of getAddressPartErrors(field, values, translate)) {
                addErrorMessage(errors, inputID, message);
            }
        }
        if (!isAnswered(values[field.key], field.type === 'boolean' && field === loneField)) {
            if (field.type === 'address' ? isAddressRequired(field, values) : field.required) {
                addErrorMessage(errors, field.key, translate('common.error.fieldRequired'));
            }
            continue;
        }
        for (const message of validateField(field, values, translate)) {
            addErrorMessage(errors, field.key, message);
        }
    }
    return errors;
}

export default getDynamicFieldErrors;
