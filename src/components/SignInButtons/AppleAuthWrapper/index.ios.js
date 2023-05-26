import {useEffect} from 'react';
import appleAuth from '@invertase/react-native-apple-authentication';
import * as Session from '../../../libs/actions/Session';

function AppleAuthWrapper() {
    useEffect(() => {
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
