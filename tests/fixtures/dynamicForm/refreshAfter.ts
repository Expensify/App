import type {DynamicFormField} from '@src/types/onyx';

import refreshBefore from './refreshBefore';

/** The same form after `address.country` changed to US: Wise adds `address.state` with its allowed values */
const refreshAfter: DynamicFormField[] = [
    ...refreshBefore,
    {
        key: 'address.state',
        label: 'State',
        group: 'Account holder details',
        type: 'select',
        required: true,
        values: [
            {key: 'CA', label: 'California'},
            {key: 'NY', label: 'New York'},
            {key: 'TX', label: 'Texas'},
        ],
        refreshOnChange: false,
    },
];

export default refreshAfter;
