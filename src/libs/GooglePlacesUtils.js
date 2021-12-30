import _ from 'underscore';

/**
 * Finds an address component by type, and returns the value associated to key. Each address component object
 * inside the addressComponents array has the following structure:
 * {
 *   long_name: "New York",
 *   short_name: "New York",
 *   types: [ "locality", "political" ]
 * }
 *
 * @param {Array} addressComponents
 * @param {String} type
 * @param {String} key
 * @returns {String|undefined}
 */
function getAddressComponent(addressComponents, type, key) {
    return _.chain(addressComponents)
        .find(component => _.contains(component.types, type))
        .get(key)
        .value();
}

export {
    // eslint-disable-next-line import/prefer-default-export
    getAddressComponent,
};
