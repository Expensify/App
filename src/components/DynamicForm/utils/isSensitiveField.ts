import type {DynamicFormField} from '@src/types/onyx';

/** A sensitive answer stays out of the form draft, and the flow keeps it in memory instead */
function isSensitiveField(field: DynamicFormField): boolean {
    return !!field.sensitive;
}

export default isSensitiveField;
