import type {Bytes} from '@noble/ed25519';
import VALUES from '@libs/MultifactorAuthentication/Biometrics/VALUES';

type Hex = string;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type Base64URL<T> = string;

type ChallengeFlag = number;

type ChallengeJSON = {
    challenge: Base64URL<string>; // Base64-encoded challenge string
};

type BinaryData = {
    RPID: Bytes[]; // RELYING PARTY ID - i.e., 'expensify.com'
    FLAGS: Bytes[]; // Authenticator flags
    SIGN_COUNT: Bytes[]; // Signature counter
};

type SignedChallenge = {
    rawId: Base64URL<string>; // CREDENTIAL_ID - key identifier
    type: string; // e.g., 'public-key'; 'biometrics' for SecureStore.
    response: {
        authenticatorData: Base64URL<BinaryData>;
        clientDataJSON: Base64URL<ChallengeJSON>;
        signature: Base64URL<Hex>;
    };
};

/**
 * Challenge used to initiate a WebAuthn-style multifactor authentication (MFA) assertion.
 *
 * This closely mirrors the PublicKeyCredentialRequestOptions shape used by
 * WebAuthn authenticators, with a subset of fields required by the app.
 *
 * References:
 * - https://www.w3.org/TR/webauthn-2/#dictdef-publickeycredentialrequestoptions
 */
type MFAChallenge = {
    /**
     * Cryptographically random, server-generated nonce associated with this assertion request.
     *
     * Expected to be base64url-encoded binary data. Must be unique per request to
     * prevent replay and should be verified by the server on completion.
     */
    challenge: string;

    /**
     * Relying on Party identifier (effective domain) for which the assertion is requested.
     *
     * Typically, the registrable domain (i.e. "expensify.com"). Authenticators will
     * scope credentials to this RP ID.
     */
    rpId: string;

    /**
     * Optional allow-list of credential descriptors that the authenticator may use to
     * satisfy the assertion. If empty or omitted, any credential for the RP may be used.
     */
    allowCredentials: Array<{
        /**
         * Credential type. For WebAuthn assertions this is almost always "public-key".
         * "biometrics" for SecureStore.
         */
        type: string;

        /**
         * Base64url-encoded credential ID corresponding to a previously registered authenticator.
         */
        id: string;
    }>;

    /**
     * Requested user verification policy communicated to the authenticator.
     *
     * Common values: "required", "preferred", "discouraged".
     * The concrete values are server-defined here and validated upstream.
     */
    userVerification: string;

    /**
     * Time allowed for the assertion operation to complete, in milliseconds.
     * Authenticators may treat this as a hint rather than a strict deadline.
     */
    timeout: number;
};

type MultifactorAuthenticationResponseTranslationPath = typeof VALUES.RESPONSE_TRANSLATION_PATH;

export type {MFAChallenge, Hex, Base64URL, ChallengeJSON, ChallengeFlag, BinaryData, SignedChallenge, MultifactorAuthenticationResponseTranslationPath};
