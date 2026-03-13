import type {Base64URLString} from '@src/utils/Base64URL';

/**
 * Bitmask flag describing user presence and verification state for a challenge.
 */
type ChallengeFlags = number;

/**
 * Signed multifactor authentication challenge.
 * Common response shape for different authenticator types —
 * the actual signature algorithm (e.g. ED25519, ES256) depends on the credential.
 */
type SignedChallenge = {
    rawId: Base64URLString;
    type: string;
    response: {
        authenticatorData: Base64URLString;
        clientDataJSON: Base64URLString;
        signature: Base64URLString;
    };
};

/**
 * Registration challenge returned by the backend.
 * Full WebAuthn format that specifies allowed credential types.
 * Per spec: a challenge must be supplied to sign the newly generated key.
 */
type RegistrationChallenge = {
    challenge: string;
    rp: {id: string};
    user: {
        id: string;
        displayName: string;
    };
    pubKeyCredParams: Array<{
        type: PublicKeyCredentialType;
        alg: number;
    }>;
    timeout: number;
};

/**
 * Challenge object can be either authentication or registration format.
 * The backend sends different structures depending on the challengeType parameter.
 */
type MultifactorAuthenticationChallengeObject = AuthenticationChallenge | RegistrationChallenge;

/**
 * Authentication challenge returned by the backend.
 * Per spec: Used when a MultifactorAuthenticationCommand requires public-key authentication.
 */
type AuthenticationChallenge = {
    challenge: string;
    rpId: string;
    allowCredentials: Array<{
        type: string;
        id: string;
    }>;
    userVerification: UserVerificationRequirement;
    timeout: number;
    expires?: string;
};

export type {MultifactorAuthenticationChallengeObject, ChallengeFlags, SignedChallenge, AuthenticationChallenge, RegistrationChallenge};
