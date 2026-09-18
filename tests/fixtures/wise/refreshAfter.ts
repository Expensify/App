import type {WiseField} from '@src/types/onyx';

import refreshBefore from './refreshBefore';

/** The same form after `currency` changed to EUR: IBAN replaces the sort code and account number */
const refreshAfter: WiseField[] = [
    ...refreshBefore.filter((field) => field.key === 'currency'),
    {
        key: 'IBAN',
        label: 'IBAN',
        group: 'Account details',
        type: 'text',
        required: true,
        regex: '^[A-Z]{2}\\d{2}[A-Z0-9]{11,30}$',
        minLength: 15,
        maxLength: 34,
        example: 'DE89370400440532013000',
        refreshOnChange: false,
    },
    ...refreshBefore.filter((field) => field.group === 'Account holder details'),
];

export default refreshAfter;
