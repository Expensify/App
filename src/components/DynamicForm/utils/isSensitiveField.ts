import type {DynamicFormField, DynamicFormNumberField, DynamicFormTextField} from '@src/types/onyx';

/** A sensitive answer stays out of the form draft, so only typed answers, which the flow keeps in memory instead, can be sensitive */
function isSensitiveField(field: DynamicFormField): field is DynamicFormTextField | DynamicFormNumberField {
    return (field.type === 'text' || field.type === 'number') && !!field.sensitive;
}

export default isSensitiveField;
