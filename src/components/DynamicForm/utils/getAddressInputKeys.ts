import type {DynamicFormValues} from '@components/DynamicForm/types';

import type AddressFormFields from '@pages/ReimbursementAccount/AddressFormFields';

import CONST from '@src/CONST';
import type {Country} from '@src/CONST';
import STATES_BY_COUNTRY from '@src/CONST/STATES_BY_COUNTRY';

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

/** The states the picker lists, which are the US states until a country is picked */
function getStateOptions(country: Country | ''): Record<string, string> | undefined {
    return STATES_BY_COUNTRY[country || CONST.COUNTRY.US];
}

/** The state is asked only where the picker can list the country's states */
function isStateAsked(country: Country | ''): boolean {
    return !!getStateOptions(country);
}

export default getAddressInputKeys;
export {getAddressCountry, getStateOptions, isStateAsked};
