import type {DynamicFormValues} from '@components/DynamicForm/types';

import type {DynamicFormField} from '@src/types/onyx';

import isSensitiveField from './isSensitiveField';

/** The draft key the server sets in place of a sensitive answer it holds */
function getProvidedKey(fieldKey: string): string {
    return `${fieldKey}Provided`;
}

/**
 * Whether the server already holds the field's sensitive answer, such as an SSN saved on an earlier visit.
 * The server never sends a sensitive answer back. A resumed draft holds `<key>Provided: true` in its place, so the field opens blank, and leaving it blank keeps the saved answer.
 */
function hasProvidedAnswer(field: DynamicFormField, values: DynamicFormValues): boolean {
    return isSensitiveField(field) && values[getProvidedKey(field.key)] === true;
}

export default hasProvidedAnswer;
