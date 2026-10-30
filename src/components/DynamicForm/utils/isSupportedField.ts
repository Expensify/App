import type {DynamicFormField, DynamicFormFieldType, DynamicFormSchemaField} from '@src/types/onyx';

import logSchemaProblem from './logSchemaProblem';

const SUPPORTED_FIELD_TYPES: Record<DynamicFormFieldType, true> = {
    text: true,
    number: true,
    select: true,
    radio: true,
    date: true,
    boolean: true,
    country: true,
    currency: true,
    address: true,
    multiselect: true,
    countryMultiselect: true,
    file: true,
    amount: true,
    percent: true,
    list: true,
};

/** A field of a type this App version does not know, or with no key to store its answer under, is left out, so it neither renders nor blocks submission */
function isSupportedField(field: DynamicFormSchemaField): field is DynamicFormField {
    if (!field.key) {
        logSchemaProblem('Field without a key', {type: field.type});
        return false;
    }
    if (Object.hasOwn(SUPPORTED_FIELD_TYPES, field.type)) {
        return true;
    }
    logSchemaProblem('Unknown field type', {type: field.type, key: field.key});
    return false;
}

export default isSupportedField;
