import _ from 'underscore';

/**
 * Finds an address component by type, and returns the value associated to key. Each address component object
 * inside the addressComponents array has the following structure:
 * [{
 *   long_name: "New York",
 *   short_name: "New York",
 *   types: [ "locality", "political" ]
 * }]
 *
 * @param {Array} addressComponents
 * @param {Object} fieldsToExtract – has shape: {addressType: 'keyToUse'}
 * @returns {Object}
 */
function getAddressComponents(addressComponents, fieldsToExtract) {
    const result = _.mapObject(fieldsToExtract, () => '');
    _.each(addressComponents, (addressComponent) => {
        _.each(addressComponent.types, (addressType) => {
            if (!_.has(fieldsToExtract, addressType) || !_.isEmpty(result[addressType])) {
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
