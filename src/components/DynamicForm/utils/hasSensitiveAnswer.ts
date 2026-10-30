import type {DynamicFormField} from '@src/types/onyx';

import isSensitiveField from './isSensitiveField';

/** The field is sensitive, or is a list whose entries hold a sensitive answer at any depth, so its answer must stay out of the draft */
function hasSensitiveAnswer(field: DynamicFormField): boolean {
    return isSensitiveField(field) || (field.type === 'list' && field.itemFields.some(hasSensitiveAnswer));
}

export default hasSensitiveAnswer;
