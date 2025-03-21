import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';

let encryptedAuthToken = '';
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (session) => (encryptedAuthToken = session?.encryptedAuthToken ?? ''),
});

/**
 * Add encryptedAuthToken to this attachment URL
 */
export default function (url: string, hasOtherParameters = false) {
    const symbol = hasOtherParameters ? '&' : '?';
    return `${url}${symbol}encryptedAuthToken=${encodeURIComponent(encryptedAuthToken)}`;
}
