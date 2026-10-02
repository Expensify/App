import type {DynamicFormField, DynamicFormFieldType} from '@src/types/onyx';

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
};

/** Server schemas can carry types this App version does not know. Such a field is left out so it neither renders nor blocks submission. */
function isSupportedField(field: DynamicFormField): boolean {
    if (Object.hasOwn(SUPPORTED_FIELD_TYPES, field.type)) {
        return true;
    }
    logSchemaProblem('Unknown field type', {
        type: String(field.type),
        key: field.key,
    });
    return false;
}

export default isSupportedField;
