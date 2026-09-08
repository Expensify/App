import addMFABreadcrumb from '@components/MultifactorAuthentication/observability/breadcrumbs';

import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';

import {decodeLibraryError, getKeyAlias} from '@libs/MultifactorAuthentication/NativeBiometricsHSM/helpers';

import Base64URL from '@src/utils/Base64URL';

import {getAllKeys} from '@sbaiahmed1/react-native-biometrics';

import type {UseBiometricsReturn} from './shared/types';

import useServerCredentials from './shared/useServerCredentials';

/**
 * Native biometrics hook using HSM-backed EC P-256 keys via react-native-biometrics.
 * All cryptographic operations happen in native code (Secure Enclave / Android Keystore).
 * Private keys never enter JS memory.
 */
function useNativeBiometricsHSM(): UseBiometricsReturn {
    const {accountID} = useCurrentUserPersonalDetails();
    const {serverKnownCredentialIDs, haveCredentialsEverBeenConfigured} = useServerCredentials();

    const getLocalCredentialID = async () => {
        try {
            const keyAlias = getKeyAlias(accountID);
            const {keys} = await getAllKeys(keyAlias);
            const entry = keys.at(0);
            if (!entry) {
                return undefined;
            }
            return Base64URL.base64ToBase64url(entry.publicKey);
        } catch (error) {
            addMFABreadcrumb('Failed to get local credential ID', decodeLibraryError(error), 'error');
            return undefined;
        }
    };

    /**
     * Legacy compatibility path. The MFA machine uses the platform-resolved biometrics operation,
     * while this hook keeps using reactive Onyx values for existing React consumers. Keep this
     * comparison aligned with `operations/index.native.ts` until the hook is removed.
     */
    const areLocalCredentialsKnownToServer = async () => {
        const key = await getLocalCredentialID();
        return !!key && serverKnownCredentialIDs.includes(key);
    };

    return {
        serverKnownCredentialIDs,
        haveCredentialsEverBeenConfigured,
        getLocalCredentialID,
        areLocalCredentialsKnownToServer,
    };
}

export default useNativeBiometricsHSM;
