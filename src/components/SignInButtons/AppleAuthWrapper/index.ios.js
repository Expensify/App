import appleAuth from '@invertase/react-native-apple-authentication';
import {useEffect} from 'react';
import * as Session from '@userActions/Session';

/**
 * Apple Sign In wrapper for iOS
 * revokes the session if the credential is revoked.
 *
 * @returns {null}
 */
function AppleAuthWrapper() {
    useEffect(() => {
        if (!appleAuth.isSupported) {
            return;
        }
        const listener = appleAuth.onCredentialRevoked(() => {
            Session.signOut();
        });
        return () => {
            listener.remove();
        };
    }, []);

    return null;
}

export default AppleAuthWrapper;
