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

import type {DynamicFormField, DynamicFormFieldType} from '@src/types/onyx';
import type {DynamicFormAddressField, DynamicFormChoiceField, DynamicFormNumberField, DynamicFormTextField} from '@src/types/onyx/DynamicFormField';

import getAddressInputKeys from './getAddressInputKeys';
import getFieldOptions from './getFieldOptions';
import getVisibleFields from './getVisibleFields';
import isCountryCode from './isCountryCode';
import logSchemaProblem from './logSchemaProblem';

/** Checks a field the user has answered. Unanswered fields only get the required check. */
type FieldValidator<TType extends DynamicFormFieldType> = (field: DynamicFormFieldOfType<TType>, values: DynamicFormValues, translate: LocalizedTranslate) => string[];

/** A boolean is a consent checkbox, so only a ticked box answers it */
function isAnswered(value: FormValue | undefined): boolean {
    if (typeof value === 'string') {
        return value.trim() !== '';
    }
    if (Array.isArray(value)) {
        return value.length > 0;
    }
    return value === true || value instanceof Date;
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

function getMultiChoiceErrors(field: DynamicFormFieldOfType<'multiselect' | 'countryMultiselect'>, values: DynamicFormValues, translate: LocalizedTranslate): string[] {
    const offeredKeys = new Set(getFieldOptions(field, values).map((option) => option.key));
    const isEveryChoiceOffered = getStringListAnswer(field, values).every((key) => offeredKeys.has(key));
    return isEveryChoiceOffered ? [] : [translate('dynamicForm.error.invalidOption')];
}

/** For inputs that only accept valid answers: UploadFile checks type, size and count, AmountForm and PercentageForm reject invalid typing */
const noChecks = () => [];

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
            return [
                translate('dynamicForm.error.invalidFormat', {
                    example: field.example,
                }),
            ];
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
    address: () => [],
    multiselect: getMultiChoiceErrors,
    countryMultiselect: getMultiChoiceErrors,
    boolean: noChecks,
    country: noChecks,
    currency: noChecks,
    file: noChecks,
    amount: noChecks,
    percent: noChecks,
};

/** Each address part has its own input, so its errors go under its own draft key */
function getAddressPartErrors(field: DynamicFormAddressField, values: DynamicFormValues, translate: LocalizedTranslate): Array<[inputID: string, message: string]> {
    const addressKeys = getAddressInputKeys(field.key);
    const partErrors: Array<[string, string]> = [];
    if (field.required) {
        for (const partKey of [addressKeys.city, addressKeys.state, addressKeys.zipCode, addressKeys.country]) {
            if (!isAnswered(values[partKey])) {
                partErrors.push([partKey, translate('common.error.fieldRequired')]);
            }
        }
    }
    const zipCode = values[addressKeys.zipCode];
    if (field.rule !== 'zipCode' || typeof zipCode !== 'string' || zipCode === '') {
        return partErrors;
    }
    const chosenCountry = values[addressKeys.country];
    const country = typeof chosenCountry === 'string' && isCountryCode(chosenCountry) ? chosenCountry : '';
    if (!isValidZipCodeForCountry(zipCode, country)) {
        partErrors.push([addressKeys.zipCode, translate('privatePersonalDetails.error.incorrectZipFormat', getCountryZipRegexDetails(country)?.samples)]);
    }
    return partErrors;
}

function validateField<TType extends DynamicFormFieldType>(field: DynamicFormFieldOfType<TType>, values: DynamicFormValues, translate: LocalizedTranslate): string[] {
    const validate: FieldValidator<TType> = VALIDATORS[field.type];
    return validate(field, values, translate);
}

/** Errors for the fields the user can see, keyed by field key, in the shape FormProvider's `validate` returns */
function getDynamicFieldErrors(fields: DynamicFormField[], values: DynamicFormValues, translate: LocalizedTranslate): Record<string, string> {
    const errors: Record<string, string> = {};
    for (const field of getVisibleFields(fields, values)) {
        if (field.readonly) {
            continue;
        }
        if (field.type === 'address') {
            for (const [inputID, message] of getAddressPartErrors(field, values, translate)) {
                addErrorMessage(errors, inputID, message);
            }
        }
        if (!isAnswered(values[field.key])) {
            if (field.required) {
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
