import {useEffect} from 'react';
import appleAuth from '@invertase/react-native-apple-authentication';
import * as Session from '../../../libs/actions/Session';

/**
 * Apple Sign In wrapper for iOS
 * revokes the session if the credential is revoked.
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
