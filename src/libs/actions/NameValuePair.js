import _ from 'underscore';
import Onyx from 'react-native-onyx';
import * as DeprecatedAPI from '../deprecatedAPI';

/**
 * Sets the value for an NVP
 *
 * @param {String} name
 * @param {*} value
 * @param {String} [onyxKeyName]
 */
function set(name, value, onyxKeyName) {
    DeprecatedAPI.SetNameValuePair({name, value: _.isObject(value) ? JSON.stringify(value) : value});

    // Update the associated onyx key if we've passed the associated key name
    if (onyxKeyName) {
        Onyx.set(onyxKeyName, value);
    }
}

export default {
    set,
};
