import _ from 'underscore';
import lodashGet from 'lodash/get';

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
            result[addressType] = lodashGet(addressComponent, fieldsToExtract[addressType], '');
        });
    });
    return result;
}

export {
    // eslint-disable-next-line import/prefer-default-export
    getAddressComponents,
};
