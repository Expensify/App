import lodashGet from 'lodash/get';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '../ONYXKEYS';
import CONST from '../CONST';

let encryptedAuthToken = '';
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: session => encryptedAuthToken = lodashGet(session, 'encryptedAuthToken', ''),
});

/**
 * Create a header object with the encryptedAuthToken for image caching via headers
 *
 * @returns {String}
 */
export default function () {
    return {
        [CONST.CHAT_ATTACHMENT_TOKEN_KEY]: encryptedAuthToken,
    };
}
