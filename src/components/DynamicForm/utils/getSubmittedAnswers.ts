import type {DynamicFormValues} from '@components/DynamicForm/types';

import type {DynamicFormField} from '@src/types/onyx';

import getAddressInputKeys from './getAddressInputKeys';
import getVisibleFields from './getVisibleFields';

/** The draft keys a field writes to: its own, plus its address parts or its chosen currency */
function getAnswerKeys(field: DynamicFormField): string[] {
    switch (field.type) {
        case 'address':
            return Object.values(getAddressInputKeys(field.key)).filter(Boolean);
        case 'amount':
            return field.currencyKey ? [field.key, field.currencyKey] : [field.key];
        default:
            return [field.key];
    }
}

/** The answers to the fields the user can see, so answers left on fields hidden later are not submitted */
function getSubmittedAnswers(fields: DynamicFormField[], values: DynamicFormValues): DynamicFormValues {
    const answerKeys = new Set(getVisibleFields(fields, values).flatMap(getAnswerKeys));
    return Object.fromEntries(Object.entries(values).filter(([key]) => answerKeys.has(key)));
}

export default getSubmittedAnswers;
