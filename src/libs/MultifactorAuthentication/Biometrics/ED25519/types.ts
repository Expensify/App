import type {Bytes} from '@noble/ed25519';

/**
 * Hex-encoded string representation of binary data.
 */
type Hex = string;

/**
 * Base64URL-encoded representation of a value used in WebAuthn-like flows.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
type Base64URL<T> = string;

/**
 * Bitmask flag describing user presence and verification state for a challenge.
 */
type ChallengeFlag = number;

/**
 * JSON payload that wraps the raw challenge sent to the client.
 */
type ChallengeJSON = {
    challenge: Base64URL<string>;
};

/**
 * Low-level binary components that are combined into authenticator data.
 */
type BinaryData = {
    RPID: Bytes[];
    FLAGS: Bytes[];
    SIGN_COUNT: Bytes[];
};

/**
 * Signed multifactor authentication challenge matching the WebAuthn response shape.
 */
type SignedChallenge = {
    rawId: Base64URL<string>;
    type: string;
    response: {
        authenticatorData: Base64URL<BinaryData>;
        clientDataJSON: Base64URL<ChallengeJSON>;
        signature: Base64URL<Hex>;
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

export type {MultifactorAuthenticationChallengeObject, Hex, Base64URL, ChallengeJSON, ChallengeFlag, BinaryData, SignedChallenge};
