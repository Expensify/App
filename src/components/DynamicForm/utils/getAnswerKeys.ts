import type {DynamicFormField} from '@src/types/onyx';

import getAddressInputKeys from './getAddressInputKeys';

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

export default getAnswerKeys;
