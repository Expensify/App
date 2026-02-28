import type {Base64URLString} from '@src/utils/Base64URL';

/**
 * Bitmask flag describing user presence and verification state for a challenge.
 */
type ChallengeFlags = number;

/**
 * Signed multifactor authentication challenge for biometric authentication.
 * Uses ED25519 signature format with authenticatorData and signature.
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
 * Registration challenge for biometric key registration.
 * Full WebAuthn format that specifies allowed credential types.
 * Per spec: When registering a new biometric key, webauthn specification requires a challenge be supplied to sign the newly generated key.
 */
type RegistrationChallenge = {
    challenge: string;
    rp: {id: string};
    user: {
        id: string;
        displayName: string;
    };
    pubKeyCredParams: Array<{
        type: string;
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
 * Authentication challenge for biometric authentication flow.
 * This is a simplified nonce-based challenge used for ED25519 biometric signing.
 * Per spec: Used when a MultifactorAuthenticationCommand requires public-key authentication.
 */
type AuthenticationChallenge = {
    challenge: string;
    rpId: string;
    allowCredentials: Array<{
        type: string;
        id: string;
    }>;
    userVerification: string;
    timeout: number;
    expires?: string;
};

export type {MultifactorAuthenticationChallengeObject, ChallengeFlags, SignedChallenge, AuthenticationChallenge, RegistrationChallenge};
