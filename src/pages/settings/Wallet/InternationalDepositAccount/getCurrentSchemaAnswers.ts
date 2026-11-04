/**
 * Picks the draft answers that belong to the fields of the current Wise schema. The draft still holds answers to fields an earlier schema had,
 * such as a sort code after switching to IBAN, and the server reads every answer it gets as part of the new form.
 */
import getAnswerKeys from '@components/DynamicForm/utils/getAnswerKeys';
import {getAllFields, getPages} from '@components/DynamicForm/utils/paginate';

import type {DynamicFormSchema} from '@src/types/onyx';

function getCurrentSchemaAnswers(schema: DynamicFormSchema | undefined, draftValues: Record<string, unknown> | undefined): Record<string, unknown> {
    if (!schema || !draftValues) {
        return {};
    }
    // A field can write to several draft keys, such as the parts of an address, so every one of them counts
    const answerKeys = new Set(getAllFields(getPages(schema)).flatMap(getAnswerKeys));
    return Object.fromEntries(Object.entries(draftValues).filter(([key]) => answerKeys.has(key)));
}

export default getCurrentSchemaAnswers;
