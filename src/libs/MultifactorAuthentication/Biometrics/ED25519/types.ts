import type {Base64URLString} from '@src/utils/Base64URL';

/**
 * Bitmask flag describing user presence and verification state for a challenge.
 */
type ChallengeFlags = number;

/**
 * Signed multifactor authentication challenge matching the WebAuthn response shape.
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
 * Challenge parameters required to initiate a multifactor authentication request.
 */
type MultifactorAuthenticationChallengeObject = {
    challenge: string;

    rpId: string;

    allowCredentials: Array<{
        type: string;
        id: string;
    }>;

    userVerification: string;

    timeout: number;
};

export type {MultifactorAuthenticationChallengeObject, ChallengeFlags, SignedChallenge};
