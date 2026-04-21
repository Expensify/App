import type {ValueOf} from 'type-fest';
import {getErrorMessage} from '@libs/ErrorUtils';
import Log from '@libs/Log';
import type {AuthenticationChallenge, RegistrationChallenge} from '@libs/MultifactorAuthentication/shared/challengeTypes';
import MARQETA_VALUES from '@libs/MultifactorAuthentication/shared/MarqetaValues';
import type {MultifactorAuthenticationReason} from '@libs/MultifactorAuthentication/shared/types';
import VALUES from '@libs/MultifactorAuthentication/VALUES';
import CONST from '@src/CONST';
import Base64URL from '@src/utils/Base64URL';

/**
 * Passkey authentication type metadata.
 */
const PASSKEY_AUTH_TYPE = {
    NAME: 'Passkey',
    MARQETA_VALUE: MARQETA_VALUES.AUTHENTICATION_METHOD.OTHER,
} as const;

/** Encodes an ArrayBuffer as a Base64URL string. */
function arrayBufferToBase64URL(buffer: ArrayBuffer): string {
    return Base64URL.encode(new Uint8Array(buffer));
}

/** Decodes a Base64URL string into an ArrayBuffer. */
function base64URLToArrayBuffer(base64url: string): ArrayBuffer {
    return new Uint8Array(Base64URL.decode(base64url)).buffer;
}

/** Checks whether the current environment supports WebAuthn (PublicKeyCredential API). */
function isWebAuthnSupported(): boolean {
    return typeof window !== 'undefined' && !!window.PublicKeyCredential;
}

/** Builds WebAuthn credential creation options from a backend registration challenge. */
function buildPublicKeyCredentialCreationOptions(challenge: RegistrationChallenge, credentials: Array<{id: string; transports?: SupportedTransport[]}>): PublicKeyCredentialCreationOptions {
    return {
        challenge: base64URLToArrayBuffer(challenge.challenge),
        rp: {
            id: challenge.rp.id,
            name: VALUES.RELYING_PARTY_NAME,
        },
        user: {
            id: base64URLToArrayBuffer(challenge.user.id),
            name: challenge.user.displayName,
            displayName: challenge.user.displayName,
        },
        pubKeyCredParams: challenge.pubKeyCredParams
            .filter((param) => param.type === CONST.PASSKEY_CREDENTIAL_TYPE)
            .map((param) => ({
                type: param.type,
                alg: param.alg,
            })),
        authenticatorSelection: {
            userVerification: 'required',
            residentKey: 'required',
            requireResidentKey: true,
        },
        attestation: 'none',
        excludeCredentials: buildAllowedCredentialDescriptors(credentials),
        timeout: challenge.timeout,
    };
}

/** Builds WebAuthn credential request options from a backend authentication challenge. */
function buildPublicKeyCredentialRequestOptions(challenge: AuthenticationChallenge, allowCredentials: PublicKeyCredentialDescriptor[]): PublicKeyCredentialRequestOptions {
    return {
        challenge: base64URLToArrayBuffer(challenge.challenge),
        rpId: challenge.rpId,
        allowCredentials,
        userVerification: challenge.userVerification,
        timeout: challenge.timeout,
    };
}

/** Type guard that narrows a generic Credential to PublicKeyCredential. */
function isPublicKeyCredential(credential: Credential): credential is PublicKeyCredential {
    return credential instanceof PublicKeyCredential;
}

/** Prompts the user to create a new passkey credential via the platform authenticator. */
async function createPasskeyCredential(options: PublicKeyCredentialCreationOptions): Promise<PublicKeyCredential> {
    const result = await navigator.credentials.create({publicKey: options});
    if (!result || !isPublicKeyCredential(result)) {
        throw new Error('navigator.credentials.create did not return a PublicKeyCredential');
    }
    return result;
}

/** Prompts the user to authenticate with an existing passkey via the platform authenticator. */
async function authenticateWithPasskey(options: PublicKeyCredentialRequestOptions): Promise<PublicKeyCredential> {
    const result = await navigator.credentials.get({publicKey: options});
    if (!result || !isPublicKeyCredential(result)) {
        throw new Error('navigator.credentials.get did not return a PublicKeyCredential');
    }
    return result;
}

type SupportedTransport = ValueOf<typeof CONST.PASSKEY_TRANSPORT>;

const SUPPORTED_TRANSPORTS = new Set<string>(Object.values(CONST.PASSKEY_TRANSPORT));

/** Type guard that checks whether a transport string is one of the supported authenticator transports. */
function isSupportedTransport(transport: string): transport is SupportedTransport & AuthenticatorTransport {
    return SUPPORTED_TRANSPORTS.has(transport);
}

/** Converts stored credential records into WebAuthn-compatible PublicKeyCredentialDescriptors. */
function buildAllowedCredentialDescriptors(credentials: Array<{id: string; transports?: SupportedTransport[]}>): PublicKeyCredentialDescriptor[] {
    return credentials.map((c) => ({
        id: base64URLToArrayBuffer(c.id),
        type: CONST.PASSKEY_CREDENTIAL_TYPE,
        transports: c.transports?.filter(isSupportedTransport),
    }));
}
/**
 * Extracts the AAGUID (Authenticator Attestation Globally Unique Identifier) from WebAuthn authenticatorData.
 * The AAGUID occupies bytes 37-52: after rpIdHash (32 bytes), flags (1 byte), and signCount (4 bytes).
 * Returns a UUID-formatted string, or empty string if authenticatorData is too short.
 */
function extractAAGUID(authData: ArrayBuffer): string | undefined {
    const bytes = new Uint8Array(authData);
    if (bytes.length < 53) {
        return undefined;
    }
    const aaguidBytes = bytes.slice(37, 53);
    const hex = Array.from(aaguidBytes, (b) => b.toString(16).padStart(2, '0')).join('');
    return [hex.slice(0, 8), hex.slice(8, 12), hex.slice(12, 16), hex.slice(16, 20), hex.slice(20, 32)].join('-');
}

function isWebAuthnReason(name: string): name is MultifactorAuthenticationReason {
    return Object.values<string>(VALUES.REASON.WEBAUTHN).includes(name);
}

type DecodedWebAuthnError = {
    reason: MultifactorAuthenticationReason;
    message?: string;
};

/** Decodes WebAuthn DOMException errors and maps them to authentication error reasons. */
function decodeWebAuthnError(error: unknown): DecodedWebAuthnError {
    Log.info('[Passkey] WebAuthn error', false, {error: getErrorMessage(error)});
    if (error instanceof DOMException && isWebAuthnReason(error.name)) {
        return {reason: error.name};
    }

    return {reason: VALUES.REASON.WEBAUTHN.GENERIC, message: getErrorMessage(error)};
}

export {
    PASSKEY_AUTH_TYPE,
    arrayBufferToBase64URL,
    isWebAuthnSupported,
    buildPublicKeyCredentialCreationOptions,
    buildPublicKeyCredentialRequestOptions,
    createPasskeyCredential,
    authenticateWithPasskey,
    buildAllowedCredentialDescriptors,
    isSupportedTransport,
    extractAAGUID,
    decodeWebAuthnError,
};
