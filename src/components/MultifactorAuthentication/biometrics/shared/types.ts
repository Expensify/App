import type {AuthenticationChallenge, RegistrationChallenge, SignedChallenge} from '@libs/MultifactorAuthentication/shared/challengeTypes';
import type {MFAError, MFAResult} from '@libs/MultifactorAuthentication/shared/MFAResult';
import type {AuthTypeInfo, RegistrationKeyInfo} from '@libs/MultifactorAuthentication/shared/types';

/**
 * Params for the platform-resolved credential-creation ceremony. A params object (not positional
 * args) keeps both platform signatures identical while native simply ignores `signal`.
 */
type CreateCredentialParams = {
    accountID: number;
    registrationChallenge: RegistrationChallenge;
    signal?: AbortSignal;
};

type CreateCredentialResult = MFAResult<{keyInfo: RegistrationKeyInfo}>;

type AuthorizeParams = {
    challenge: AuthenticationChallenge;
};

type AuthorizeResultSuccess = {
    success: true;
    signedChallenge: SignedChallenge;
    authenticationMethod: AuthTypeInfo;
};

type AuthorizeResultFailure = {
    success: false;
    error: MFAError;
};

type AuthorizeResult = AuthorizeResultSuccess | AuthorizeResultFailure;

type UseBiometricsReturn = {
    /** List of credential IDs known to server (from Onyx) */
    serverKnownCredentialIDs: string[];

    /** Whether biometric credentials have ever been configured for this account */
    haveCredentialsEverBeenConfigured: boolean;

    /** Retrieve the credential ID stored locally on this device */
    getLocalCredentialID: () => Promise<string | undefined>;

    /** Check if device has biometric credentials stored locally */
    hasLocalCredentials: () => Promise<boolean>;

    /** Check if local credentials are known to server (local credential exists in server's list) */
    areLocalCredentialsKnownToServer: () => Promise<boolean>;

    /** Authorize using chosen authentication method */
    authorize: (params: AuthorizeParams, onResult: (result: AuthorizeResult) => Promise<void> | void) => Promise<void>;

    /** Delete local keys for account */
    deleteLocalKeysForAccount: () => Promise<void>;
};

export type {AuthorizeParams, AuthorizeResult, UseBiometricsReturn, CreateCredentialParams, CreateCredentialResult};
