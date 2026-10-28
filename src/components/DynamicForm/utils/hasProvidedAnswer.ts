import type {DynamicFormValues} from '@components/DynamicForm/types';

import type {DynamicFormField} from '@src/types/onyx';

import isSensitiveField from './isSensitiveField';

/** The draft key the server sets in place of a sensitive answer it holds */
function getProvidedKey(fieldKey: string): string {
    return `${fieldKey}Provided`;
}

/** The server already holds the field's sensitive answer, so leaving it blank keeps that answer */
function hasProvidedAnswer(field: DynamicFormField, values: DynamicFormValues): boolean {
    return isSensitiveField(field) && values[getProvidedKey(field.key)] === true;
}

export default hasProvidedAnswer;
export {getProvidedKey};
