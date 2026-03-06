import {useCallback} from 'react';
import CONST from '@src/CONST';
import type {AuthorizeParams, AuthorizeResult, RegisterResult, UseBiometricsReturn} from './common/types';
import useServerCredentials from './common/useServerCredentials';

function usePasskeys(): UseBiometricsReturn {
    const {serverHasAnyCredentials, serverKnownCredentialIDs} = useServerCredentials();

    // TODO: Return real WebAuthn availability once passkey registration/authorization is implemented
    // (https://github.com/Expensify/App/issues/79464)
    const doesDeviceSupportBiometrics = useCallback(() => {
        return false;
    }, []);

    const hasLocalCredentials = useCallback(async () => {
        return false;
    }, []);

    const areLocalCredentialsKnownToServer = useCallback(async () => {
        return false;
    }, []);

    const resetKeysForAccount = useCallback(async () => {
        // No-op for passkeys — credential management is handled by the browser/OS
    }, []);

    // TODO: Implement passkey registration (https://github.com/Expensify/App/issues/79464)
    const register = async (onResult: (result: RegisterResult) => Promise<void> | void) => {
        onResult({
            success: false,
            reason: CONST.MULTIFACTOR_AUTHENTICATION.REASON.GENERIC.UNSUPPORTED_DEVICE,
        });
    };

    // TODO: Implement passkey authorization (https://github.com/Expensify/App/issues/79464)
    const authorize = async (_params: AuthorizeParams, onResult: (result: AuthorizeResult) => Promise<void> | void) => {
        onResult({
            success: false,
            reason: CONST.MULTIFACTOR_AUTHENTICATION.REASON.GENERIC.UNSUPPORTED_DEVICE,
        });
    };

    return {
        serverHasAnyCredentials,
        serverKnownCredentialIDs,
        doesDeviceSupportBiometrics,
        hasLocalCredentials,
        areLocalCredentialsKnownToServer,
        register,
        authorize,
        resetKeysForAccount,
    };
}

export default usePasskeys;
