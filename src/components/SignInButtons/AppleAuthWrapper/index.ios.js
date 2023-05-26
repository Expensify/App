import {useEffect} from 'react';
import appleAuth from '@invertase/react-native-apple-authentication';

function AppleAuthWrapper({onCredentialRevoked}) {
    useEffect(() => {
        const listener = appleAuth.onCredentialRevoked(onCredentialRevoked);
        return () => {
            listener.remove();
        };
    }, [onCredentialRevoked]);

    return null;
};

export default AppleAuthWrapper;
