import Onyx from 'react-native-onyx';
import lodashGet from 'lodash.get';
import * as API from '../API';

/**
 * Gets the value of an NVP
 *
 * @param {String} name
 * @param {String} onyxKey
 * @param {Mixed} [defaultValue]
 */
function get(name, onyxKey, defaultValue) {
    API.Get({
        returnValueList: 'nameValuePairs',
        name,
    })
        .then((response) => {
            const value = lodashGet(response.nameValuePairs, [name], defaultValue || '');
            Onyx.set(onyxKey, value);
        });
}

/**
 * Sets the value for an NVP
 *
 * @param {String} name
 * @param {Mixed} value
 * @param {String} [onyxKeyName]
 */
function set(name, value, onyxKeyName) {
    API.SetNameValuePair({name, value});

    // Update the associated onyx key if we've passed the associated key name
    if (onyxKeyName) {
        Onyx.set(onyxKeyName, value);
    }
}

export default {
    get,
    set,
};
