/**
 * Picks the draft answers that belong to the fields of the current Wise schema. The draft still holds answers to fields an earlier schema had,
 * such as a sort code after switching to IBAN, and the server reads every answer it gets as part of the new form.
 */
import getAnswerKeys from '@components/DynamicForm/utils/getAnswerKeys';
import getContentFields from '@components/DynamicForm/utils/getContentFields';
import {hasSupportedShape} from '@components/DynamicForm/utils/isSupportedField';

import type {DynamicFormSchema} from '@src/types/onyx';

function getCurrentSchemaAnswers(schema: DynamicFormSchema | undefined, draftValues: Record<string, unknown> | undefined): Record<string, unknown> {
    if (!schema || !draftValues) {
        return {};
    }
    // Every field of the schema counts, including ones this App version cannot render, so their answers still reach the server. The raw fields are read
    // directly instead of through getPages, which would log the unsupported ones again on every refresh
    const schemaFields = 'pages' in schema ? schema.pages.flatMap((page) => getContentFields(page.content)) : schema.fields;
    // A field can write to several draft keys, such as the parts of an address, so every one of them counts
    const answerKeys = new Set(schemaFields.flatMap((field) => (hasSupportedShape(field) ? getAnswerKeys(field) : [field.key])));
    return Object.fromEntries(Object.entries(draftValues).filter(([key]) => answerKeys.has(key)));
}

export default getCurrentSchemaAnswers;
