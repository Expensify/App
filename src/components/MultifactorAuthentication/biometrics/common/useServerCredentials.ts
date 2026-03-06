import {useMemo} from 'react';
import type {OnyxEntry} from 'react-native-onyx';
import useOnyx from '@hooks/useOnyx';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Account} from '@src/types/onyx';

function getMultifactorAuthenticationPublicKeyIDs(data: OnyxEntry<Account>) {
    return data?.multifactorAuthenticationPublicKeyIDs;
}

type UseServerCredentialsReturn = {
    serverHasAnyCredentials: boolean;
    serverKnownCredentialIDs: string[];
};

function useServerCredentials(): UseServerCredentialsReturn {
    const [multifactorAuthenticationPublicKeyIDs] = useOnyx(ONYXKEYS.ACCOUNT, {selector: getMultifactorAuthenticationPublicKeyIDs});
    const serverKnownCredentialIDs = useMemo(() => multifactorAuthenticationPublicKeyIDs ?? [], [multifactorAuthenticationPublicKeyIDs]);
    const serverHasAnyCredentials = serverKnownCredentialIDs.length > 0;

    return {
        serverHasAnyCredentials,
        serverKnownCredentialIDs,
    };
}

export default useServerCredentials;
export type {UseServerCredentialsReturn};
