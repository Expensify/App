import type {DynamicFormFieldOfType, DynamicFormValues} from '@components/DynamicForm/types';
import type {FormValue} from '@components/Form/types';
import type {LocalizedTranslate} from '@components/LocaleContextProvider';

import {addErrorMessage} from '@libs/ErrorUtils';
import {isValidDate, isValidLegalName, isValidPastDate, isValidPhoneInternational, meetsMaximumAgeRequirement, meetsMinimumAgeRequirement} from '@libs/ValidationUtils';

import type {DynamicFormChoiceField, DynamicFormField, DynamicFormFieldType, DynamicFormNumberField, DynamicFormSchemaField, DynamicFormTextField} from '@src/types/onyx';

import getFieldOptions from './getFieldOptions';
import getVisibleFields from './getVisibleFields';
import isSupportedField from './isSupportedField';
import logSchemaProblem from './logSchemaProblem';

/** Checks a field the user has answered. Unanswered fields only get the required check. */
type FieldValidator<TType extends DynamicFormFieldType> = (field: DynamicFormFieldOfType<TType>, values: DynamicFormValues, translate: LocalizedTranslate) => string[];

/** A checkbox that is not ticked is unanswered. */
function isAnswered(value: FormValue | undefined): boolean {
    if (typeof value === 'boolean') {
        return value;
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

/** For inputs that only accept valid answers */
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
    boolean: noChecks,
    country: noChecks,
    currency: noChecks,
};

function validateField<TType extends DynamicFormFieldType>(field: DynamicFormFieldOfType<TType>, values: DynamicFormValues, translate: LocalizedTranslate): string[] {
    const validate: FieldValidator<TType> = VALIDATORS[field.type];
    return validate(field, values, translate);
}

/** Errors for the fields the user can see, keyed by draft key, in the shape FormProvider's `validate` returns. */
function getDynamicFieldErrors(fields: DynamicFormSchemaField[], values: DynamicFormValues, translate: LocalizedTranslate): Record<string, string> {
    const errors: Record<string, string> = {};
    const visibleFields = getVisibleFields(fields.filter(isSupportedField), values);
    for (const field of visibleFields) {
        if (field.readonly) {
            continue;
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
