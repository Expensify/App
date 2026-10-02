import type AddressFormFields from '@pages/ReimbursementAccount/AddressFormFields';

import CONST from '@src/CONST';

import type {ComponentProps} from 'react';

type AddressInputKeys = ComponentProps<typeof AddressFormFields>['inputKeys'];

/** Draft keys for AddressFormFields. The street is the field's own value, and an empty key tells AddressSearch to drop that part, such as the place `name` it also reports. */
function getAddressInputKeys(
    fieldKey: string,
): Required<Pick<AddressInputKeys, 'street' | 'street2' | 'city' | 'state' | 'zipCode' | 'country' | 'lat' | 'lng' | 'address'>> & {name: string} {
    return {
        street: fieldKey,
        street2: `${fieldKey}.street2`,
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

/** AddressFormFields lists US states, or Canadian provinces, and assumes the US until a country is picked */
function isStateAsked(country: unknown): boolean {
    return !country || country === CONST.COUNTRY.US || country === CONST.COUNTRY.CA;
}

export default getAddressInputKeys;
export {isStateAsked};
