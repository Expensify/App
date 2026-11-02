import type {DynamicFormValues} from '@components/DynamicForm/types';

import type {DynamicFormField} from '@src/types/onyx';

import getVisibleFields from './getVisibleFields';
import isSensitiveField from './isSensitiveField';

/** The draft key the server sets in place of a sensitive answer it holds */
function getProvidedKey(fieldKey: string): string {
    return `${fieldKey}Provided`;
}

/**
 * Whether the server already holds the field's sensitive answer, such as an SSN saved on an earlier visit.
 * The server never sends a sensitive answer back. A resumed draft holds `<key>Provided: true` in its place, so the field shows a mask, and a page saved without a new answer keeps the saved one.
 */
function hasProvidedAnswer(field: DynamicFormField, values: DynamicFormValues): boolean {
    return isSensitiveField(field) && values[getProvidedKey(field.key)] === true;
}

/**
 * The markers of sensitive answers the server holds for fields the answers now hide, such as an SSN after the user says they have none.
 * Those answers no longer apply, so a field shown again asks for a new one instead of showing it as on file.
 */
function getHiddenProvidedKeys(fields: DynamicFormField[], values: DynamicFormValues, allFields = fields): string[] {
    const visibleFields = new Set(getVisibleFields(fields, values, allFields));
    return fields.filter((field) => !visibleFields.has(field) && hasProvidedAnswer(field, values)).map((field) => getProvidedKey(field.key));
}

export default hasProvidedAnswer;
export {getHiddenProvidedKeys};
