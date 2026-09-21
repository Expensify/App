/** Maps AddressSearch's address parts onto `<fieldKey>.<part>` draft keys; the street line is the field's own value */
function addressAdapter(fieldKey: string): Record<string, string> {
    return {
        street: fieldKey,
        street2: `${fieldKey}.street2`,
        city: `${fieldKey}.city`,
        state: `${fieldKey}.state`,
        zipCode: `${fieldKey}.zipCode`,
        country: `${fieldKey}.country`,
        lat: '',
        lng: '',
        name: '',
        address: '',
    };
}

export default addressAdapter;
