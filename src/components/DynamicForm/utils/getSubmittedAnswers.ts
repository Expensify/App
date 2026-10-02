import type {DynamicFormValues} from '@components/DynamicForm/types';

import type {DynamicFormField} from '@src/types/onyx';

import getAddressInputKeys from './getAddressInputKeys';
import {getOfferedChoices} from './getDynamicFieldErrors';
import getVisibleFields from './getVisibleFields';
import {getListItems, getListItemSensitiveAnswers} from './listItems';

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

/** The answers to the fields the user can see, so answers left on fields hidden later, and list keys no longer offered, are not submitted. List entries get their sensitive answers back from memory. Pass the whole form as `allFields` when `fields` is one page of it. */
function getSubmittedAnswers(fields: DynamicFormField[], values: DynamicFormValues, allFields = fields): DynamicFormValues {
    const answers: DynamicFormValues = {};
    for (const field of getVisibleFields(fields, values, allFields)) {
        for (const key of getAnswerKeys(field)) {
            if (values[key] !== undefined) {
                answers[key] = values[key];
            }
        }
        if ((field.type === 'multiselect' || field.type === 'countryMultiselect') && values[field.key] !== undefined) {
            answers[field.key] = getOfferedChoices(field, values);
        }
        if (field.type === 'list' && values[field.key] !== undefined) {
            answers[field.key] = getListItems(values[field.key]).map((item) => ({
                id: item.id,
                answers: getSubmittedAnswers(field.itemFields, {...item.answers, ...getListItemSensitiveAnswers(field, item.id, values)}),
            }));
        }
    }
    return answers;
}

export default getSubmittedAnswers;
