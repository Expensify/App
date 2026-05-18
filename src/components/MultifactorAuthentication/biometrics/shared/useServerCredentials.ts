import {mfaCredentialIDsSelector} from '@selectors/Account';
import useOnyx from '@hooks/useOnyx';
import ONYXKEYS from '@src/ONYXKEYS';

type UseServerCredentialsReturn = {
    serverKnownCredentialIDs: string[];
    haveCredentialsEverBeenConfigured: boolean;
};

/**
 * Reads the server-known MFA credential IDs from Onyx.
 * Shared between native biometrics and web passkeys hooks.
 */
function useServerCredentials(): UseServerCredentialsReturn {
    const [multifactorAuthenticationPublicKeyIDs] = useOnyx(ONYXKEYS.ACCOUNT, {
        selector: mfaCredentialIDsSelector,
    });
    const serverKnownCredentialIDs = multifactorAuthenticationPublicKeyIDs ?? [];
    const haveCredentialsEverBeenConfigured = multifactorAuthenticationPublicKeyIDs !== undefined;

    return {
        serverKnownCredentialIDs,
        haveCredentialsEverBeenConfigured,
    };
}

export default useServerCredentials;
