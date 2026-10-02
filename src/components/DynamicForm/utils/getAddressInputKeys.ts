import type {Address} from '@src/types/onyx/PrivatePersonalDetails';

/** The parts AddressSearch reports. `name` is the place name, which Address does not store. */
type AddressSearchPart = keyof Pick<Address, 'street' | 'street2' | 'city' | 'state' | 'zipCode' | 'country' | 'lat' | 'lng' | 'address'> | 'name';

/** Draft keys for AddressSearch's `renamedInputKeys`. The street is the field's own value, and an empty key tells AddressSearch to drop that part. */
function getAddressInputKeys(fieldKey: string): Record<AddressSearchPart, string> {
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

export default getAddressInputKeys;
