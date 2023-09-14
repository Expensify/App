import Onyx from 'react-native-onyx';
import ONYXKEYS from '../ONYXKEYS';

let encryptedAuthToken = '';
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (session) => (encryptedAuthToken = session?.encryptedAuthToken ?? ''),
});

/**
 * Add encryptedAuthToken to this attachment URL
 */
export default function (url: string) {
    return `${url}?encryptedAuthToken=${encodeURIComponent(encryptedAuthToken)}`;
}
