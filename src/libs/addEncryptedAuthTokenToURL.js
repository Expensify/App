import Onyx from 'react-native-onyx';
import ONYXKEYS from '../ONYXKEYS';

let encryptedAuthToken = '';
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: session => encryptedAuthToken = session.encryptedAuthToken,
});

/**
 * Add authToken to this attachment URL if necessary
 *
 * @param {String} url
 * @returns {String}
 */
export default function (url) {
    return `${url}?encryptedAuthToken=${encryptedAuthToken}`;
}
