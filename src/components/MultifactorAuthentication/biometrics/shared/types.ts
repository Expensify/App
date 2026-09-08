import type {AuthenticationChallenge, RegistrationChallenge, SignedChallenge} from '@libs/MultifactorAuthentication/shared/challengeTypes';
import type {MFAResult} from '@libs/MultifactorAuthentication/shared/MFAResult';
import type {AuthTypeInfo, RegistrationKeyInfo} from '@libs/MultifactorAuthentication/shared/types';

/**
 * Params for the platform-resolved credential-creation ceremony. Web forwards the actor signal to
 * WebAuthn, while native checks it before starting non-cancellable HSM work.
 */
type CreateCredentialParams = {
    accountID: number;
    registrationChallenge: RegistrationChallenge;
    signal: AbortSignal;
};

type CreateCredentialResult = MFAResult<{keyInfo: RegistrationKeyInfo}>;

/**
 * Params for the platform-resolved authorization ceremony. Web forwards the actor signal to
 * WebAuthn. Native checks it before and after `signWithOptions()`, which cannot itself be aborted.
 */
type AuthorizeOperationParams = {
    accountID: number;
    challenge: AuthenticationChallenge;
    signal: AbortSignal;
};

/** The platform authorization operation's result. A success carries the signed challenge and the authentication method used. */
type AuthorizeOperationResult = MFAResult<{signedChallenge: SignedChallenge; authenticationMethod: AuthTypeInfo}>;

type UseBiometricsReturn = {
    /** List of credential IDs known to server (from Onyx) */
    serverKnownCredentialIDs: string[];

    /** Whether biometric credentials have ever been configured for this account */
    haveCredentialsEverBeenConfigured: boolean;

    /** Retrieve a credential ID stored locally on this device, preferring one the server still knows when multiple exist */
    getLocalCredentialID: () => Promise<string | undefined>;

    /** Check if local credentials are known to server (local credential exists in server's list) */
    areLocalCredentialsKnownToServer: () => Promise<boolean>;
};

export type {AuthorizeOperationParams, AuthorizeOperationResult, UseBiometricsReturn, CreateCredentialParams, CreateCredentialResult};
