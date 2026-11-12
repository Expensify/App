import type {DynamicFormValues} from '@components/DynamicForm/types';

import type AddressFormFields from '@pages/ReimbursementAccount/AddressFormFields';

import CONST from '@src/CONST';
import type {Country} from '@src/CONST';

import type {ComponentProps} from 'react';

import isCountryCode from './isCountryCode';

type AddressInputKeys = ComponentProps<typeof AddressFormFields>['inputKeys'];

/**
 * Draft keys for AddressFormFields. The street is the field's own value, and an empty key tells AddressSearch to drop that part, such as the place `name`.
 * Without a `street2` key AddressSearch adds the apartment number to the street, and also writes it to a top-level `street2` draft key that no field submits.
 */
function getAddressInputKeys(fieldKey: string): Required<Pick<AddressInputKeys, 'street' | 'city' | 'state' | 'zipCode' | 'country' | 'lat' | 'lng' | 'address'>> & {name: string} {
    return {
        street: fieldKey,
        city: `${fieldKey}.city`,
        state: `${fieldKey}.state`,
        zipCode: `${fieldKey}.zipCode`,
        country: `${fieldKey}.country`,
        lat: '',
        lng: '',
        address: '',
        name: '',
    };
}

/** The picked country, or '' while none or an unknown one is picked */
function getAddressCountry(fieldKey: string, values: DynamicFormValues): Country | '' {
    const country = values[getAddressInputKeys(fieldKey).country];
    return typeof country === 'string' && isCountryCode(country) ? country : '';
}

/** AddressFormFields lists US states, or Canadian provinces, and assumes the US until a country is picked */
function isStateAsked(country: Country | ''): boolean {
    return !country || country === CONST.COUNTRY.US || country === CONST.COUNTRY.CA;
}

export default getAddressInputKeys;
export {getAddressCountry, isStateAsked};
