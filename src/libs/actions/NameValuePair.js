import Onyx from 'react-native-onyx';
import * as API from '../API';

/**
 * Sets the value for a provided NVP
 *
 * @param {String} name
 * @param {String} value
 * @param {String} [onyxKeyName]
 */
function set(name, value, onyxKeyName) {
    API.SetNameValuePair({name, value: JSON.stringify(value)});

    // Update the associated onyx key if we've passed the associated key name
    if (onyxKeyName) {
        Onyx.set(onyxKeyName, value);
    }
}

export default {
    set,
};
