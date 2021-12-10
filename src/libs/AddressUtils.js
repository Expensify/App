import _ from 'underscore';
import lodashGet from 'lodash/get';

/**
 * Gets the full formatted address from an address object
 *
 * @param {Object} address
 * @returns {String}
 */
function getFullAddress(address) {
    const street = lodashGet(address, 'addressStreet', '');
    const city = lodashGet(address, 'addressCity', '');
    const state = lodashGet(address, 'addressState', '');
    const zipCode = lodashGet(address, 'addressZipCode', '');

    return `${_.compact([street, city, state]).join(', ')}${zipCode ? ` ${zipCode}` : ''}`;
}

export default getFullAddress;
