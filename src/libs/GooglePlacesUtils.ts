import _ from 'underscore';

type AddressComponent = {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    long_name: string;
    // eslint-disable-next-line @typescript-eslint/naming-convention
    short_name: string;
    types: string[];
};

/**
 * Finds an address component by type, and returns the value associated to key. Each address component object
 * inside the addressComponents array has the following structure:
 * [{
 *   long_name: "New York",
 *   short_name: "New York",
 *   types: [ "locality", "political" ]
 * }]
 */
function getAddressComponents(addressComponents: AddressComponent[], fieldsToExtract: Record<string, keyof AddressComponent>) {
    const result = _.mapObject(fieldsToExtract, () => '');
    addressComponents.forEach((addressComponent) => {
        addressComponent.types.forEach((addressType) => {
            if (!(addressType in fieldsToExtract) || addressType in result) {
                return;
            }
            const value = addressComponent[fieldsToExtract[addressType]] ? addressComponent[fieldsToExtract[addressType]] : '';
            result[addressType] = value;
        });
    });
    return result;
}

/**
 * Finds an address term by type, and returns the value associated to key. Note that each term in the address must
 * conform to the following ORDER: <street, city, state, country>
 *
 * @param {Array} addressTerms
 * @returns {Object}
 */
function getPlaceAutocompleteTerms(addressTerms) {
    const fieldsToExtract = ['country', 'state', 'city', 'street'];
    const result = {};
    _.each(fieldsToExtract, (fieldToExtract, index) => {
        const fieldTermIndex = addressTerms.length - (index + 1);
        result[fieldToExtract] = fieldTermIndex >= 0 ? addressTerms[fieldTermIndex].value : '';
    });
    return result;
}

export {
    // eslint-disable-next-line import/prefer-default-export
    getAddressComponents,
    getPlaceAutocompleteTerms,
};
