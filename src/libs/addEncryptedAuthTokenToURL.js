import _ from 'underscore';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '../ONYXKEYS';

let encryptedAuthToken = '';
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: session => encryptedAuthToken = _.get(session, 'encryptedAuthToken', ''),
});

/**
 * Add encryptedAuthToken to this attachment URL
 *
 * @param {String} url
 * @returns {String}
 */
export default function (url) {
    return `${url}?encryptedAuthToken=${encodeURIComponent(encryptedAuthToken)}`;
}
