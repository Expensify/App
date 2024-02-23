import Onyx from 'react-native-onyx';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

let encryptedAuthToken = '';
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (session) => (encryptedAuthToken = session?.encryptedAuthToken ?? ''),
});

/**
 * Add encryptedAuthToken to this attachment URL
 */
export default function (url: string) {
    return `${url}?${CONST.ENCRYPTED_AUTH_TOKEN_KEY}=${encodeURIComponent(encryptedAuthToken)}`;
}
