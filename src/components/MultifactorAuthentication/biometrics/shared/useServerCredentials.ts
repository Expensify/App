import useOnyx from '@hooks/useOnyx';
import ONYXKEYS from '@src/ONYXKEYS';

type UseServerCredentialsReturn = {
    serverHasAnyCredentials: boolean;
    serverKnownCredentialIDs: string[];
    haveCredentialsEverBeenConfigured: boolean;
};

function useServerCredentials(): UseServerCredentialsReturn {
    const [multifactorAuthenticationPublicKeyIDs] = useOnyx(ONYXKEYS.ACCOUNT, {
        selector: (data) => data?.multifactorAuthenticationPublicKeyIDs,
    });
    const serverKnownCredentialIDs = multifactorAuthenticationPublicKeyIDs ?? [];
    const serverHasAnyCredentials = serverKnownCredentialIDs.length > 0;
    const haveCredentialsEverBeenConfigured = multifactorAuthenticationPublicKeyIDs !== undefined;

    return {
        serverHasAnyCredentials,
        serverKnownCredentialIDs,
        haveCredentialsEverBeenConfigured,
    };
}

export default useServerCredentials;
export type {UseServerCredentialsReturn};
