import type {OnyxEntry} from 'react-native-onyx';
import useOnyx from '@hooks/useOnyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Account} from '@src/types/onyx';

type UseServerCredentialsReturn = {
    serverHasAnyCredentials: boolean;
    serverKnownCredentialIDs: string[];
    haveCredentialsEverBeenConfigured: boolean;
};

const selectMFAPublicKeyIDs = (data: OnyxEntry<Account>) => data?.multifactorAuthenticationPublicKeyIDs;

function useServerCredentials(): UseServerCredentialsReturn {
    const [multifactorAuthenticationPublicKeyIDs] = useOnyx(ONYXKEYS.ACCOUNT, {
        selector: selectMFAPublicKeyIDs,
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
