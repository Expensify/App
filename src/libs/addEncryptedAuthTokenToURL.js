import lodashGet from 'lodash/get';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '../ONYXKEYS';

let encryptedAuthToken = '';
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: session => encryptedAuthToken = lodashGet(session, 'encryptedAuthToken', ''),
});

/**
 * Add encryptedAuthToken to this attachment URL if necessary
 *
 * @param {String} url
 * @returns {String}
 */
export default function (url) {
    return `${url}?encryptedAuthToken=${encryptedAuthToken}`;
}
