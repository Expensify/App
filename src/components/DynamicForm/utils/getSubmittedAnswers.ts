import type {DynamicFormValues} from '@components/DynamicForm/types';

import type {DynamicFormAddressField, DynamicFormField} from '@src/types/onyx';

import getAddressInputKeys, {getAddressCountry, isStateAsked, isZipCodeShown} from './getAddressInputKeys';
import getAnswerKeys from './getAnswerKeys';
import getVisibleFields from './getVisibleFields';
import {getListItems, getListItemSensitiveAnswers} from './listItems';

function getHiddenAddressPartKeys(field: DynamicFormAddressField, values: DynamicFormValues): string[] {
    const addressKeys = getAddressInputKeys(field.key);
    return [...(isStateAsked(field, getAddressCountry(field.key, values)) ? [] : [addressKeys.state]), ...(isZipCodeShown(field) ? [] : [addressKeys.zipCode])];
}

/** The answers to the fields the user can see, so answers left on fields hidden later are not submitted. List entries get their sensitive answers back from memory. Pass the whole form as `allFields` when `fields` is one page of it. */
function getSubmittedAnswers(fields: DynamicFormField[], values: DynamicFormValues, allFields = fields): DynamicFormValues {
    const answers: DynamicFormValues = {};
    for (const field of getVisibleFields(fields, values, allFields)) {
        // AddressSearch fills the state and the zip even where they are not asked, with values the user never sees
        const hiddenPartKeys = field.type === 'address' ? getHiddenAddressPartKeys(field, values) : [];
        for (const key of getAnswerKeys(field)) {
            if (values[key] !== undefined && !hiddenPartKeys.includes(key)) {
                answers[key] = values[key];
            }
        }
        if (field.type === 'list' && values[field.key] !== undefined) {
            answers[field.key] = getListItems(values[field.key]).map((item) => ({
                id: item.id,
                ...getSubmittedAnswers(field.itemFields, {...item, ...getListItemSensitiveAnswers(field, item.id, values)}),
            }));
        }
    }
    return answers;
}

export default getSubmittedAnswers;
export {getAnswerKeys};
