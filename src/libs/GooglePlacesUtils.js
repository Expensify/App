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

/**
 * Validates this contains the minimum address components
 *
 * @param {Array} addressComponents
 * @returns {Boolean}
 */
function isAddressValidForVBA(addressComponents) {
    if (!addressComponents) {
        return false;
    }
    if (!_.some(addressComponents, component => _.includes(component.types, 'street_number'))) {
        // Missing Street number
        return false;
    }
    if (!_.some(addressComponents, component => _.includes(component.types, 'postal_code'))) {
        // Missing zip code
        return false;
    }
    if (!_.some(addressComponents, component => _.includes(component.types, 'administrative_area_level_1'))) {
        // Missing state
        return false;
    }
    if (!_.some(addressComponents, component => _.includes(component.types, 'locality'))
        && !_.some(addressComponents, component => _.includes(component.types, 'sublocality'))) {
        // Missing city
        return false;
    }
    if (_.some(addressComponents, component => _.includes(component.types, 'post_box'))) {
        // Reject PO box
        return false;
    }
    return true;
}

export {
    getAddressComponent,
    isAddressValidForVBA,
};
