/**
 * Hex-encoded string representation of binary data.
 */
type Hex = string;

/**
 * Base64URL-encoded representation of a value used in WebAuthn-like flows.
 */
type Base64URL = string;

/**
 * Bitmask flag describing user presence and verification state for a challenge.
 */
type ChallengeFlags = number;

/**
 * Signed multifactor authentication challenge matching the WebAuthn response shape.
 */
type SignedChallenge = {
    rawId: Base64URL;
    type: string;
    response: {
        authenticatorData: Base64URL;
        clientDataJSON: Base64URL;
        signature: Base64URL;
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

export type {MultifactorAuthenticationChallengeObject, Hex, Base64URL, ChallengeFlags, SignedChallenge};
