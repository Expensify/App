import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';

let encryptedAuthToken = '';
// We use `connectWithoutView` here since this connection only updates a module-level variable
// and doesn't need to trigger component re-renders. UI components get the current token
// value when they call the exported function.
Onyx.connectWithoutView({
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
