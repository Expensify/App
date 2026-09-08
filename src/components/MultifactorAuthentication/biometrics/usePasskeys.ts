import useCurrentUserPersonalDetails from '@hooks/useCurrentUserPersonalDetails';
import useOnyx from '@hooks/useOnyx';

import {getPasskeyOnyxKey} from '@userActions/Passkey';

import type {UseBiometricsReturn} from './shared/types';

import useServerCredentials from './shared/useServerCredentials';

function usePasskeys(): UseBiometricsReturn {
    const {accountID} = useCurrentUserPersonalDetails();
    const userId = String(accountID);
    const {serverKnownCredentialIDs, haveCredentialsEverBeenConfigured} = useServerCredentials();
    const [localPasskeyCredentials] = useOnyx(getPasskeyOnyxKey(userId));

    const getLocalCredentialID = async (): Promise<string | undefined> => {
        const serverSet = new Set(serverKnownCredentialIDs);
        return (localPasskeyCredentials ?? []).find((credential) => serverSet.has(credential.id))?.id;
    };

    /**
     * Legacy compatibility path. The MFA machine uses the platform-resolved biometrics operation,
     * while this hook keeps using reactive Onyx values for existing React consumers. Keep this
     * comparison aligned with `operations/index.ts` until the hook is removed.
     */
    const areLocalCredentialsKnownToServer = async () => {
        const serverSet = new Set(serverKnownCredentialIDs);
        return (localPasskeyCredentials ?? []).some((c) => serverSet.has(c.id));
    };

    return {
        serverKnownCredentialIDs,
        haveCredentialsEverBeenConfigured,
        getLocalCredentialID,
        areLocalCredentialsKnownToServer,
    };
}

export default usePasskeys;
