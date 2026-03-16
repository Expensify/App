import type {OnyxEntry} from 'react-native-onyx';
import useOnyx from '@hooks/useOnyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Account} from '@src/types/onyx';

type UseServerCredentialsReturn = {
    serverKnownCredentialIDs: string[];
    haveCredentialsEverBeenConfigured: boolean;
};

const selectMFAPublicKeyIDs = (data: OnyxEntry<Account>) => data?.multifactorAuthenticationPublicKeyIDs;

/**
 * Reads the server-known MFA credential IDs from Onyx.
 * Shared between native biometrics and web passkeys hooks.
 */
function useServerCredentials(): UseServerCredentialsReturn {
    const [multifactorAuthenticationPublicKeyIDs] = useOnyx(ONYXKEYS.ACCOUNT, {
        selector: selectMFAPublicKeyIDs,
    });
    const serverKnownCredentialIDs = multifactorAuthenticationPublicKeyIDs ?? [];
    const haveCredentialsEverBeenConfigured = multifactorAuthenticationPublicKeyIDs !== undefined;

    return {
        serverKnownCredentialIDs,
        haveCredentialsEverBeenConfigured,
    };
}

export default useServerCredentials;
