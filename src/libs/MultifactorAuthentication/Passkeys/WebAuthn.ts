import type {ValueOf} from 'type-fest';
import type {AuthenticationChallenge, RegistrationChallenge} from '@libs/MultifactorAuthentication/shared/challengeTypes';
import MARQETA_VALUES from '@libs/MultifactorAuthentication/shared/MarqetaValues';
import CONST from '@src/CONST';
import Base64URL from '@src/utils/Base64URL';

/**
 * Passkey authentication type metadata.
 * Not part of SecureStore — passkeys bypass the native secure store entirely.
 */
const PASSKEY_AUTH_TYPE = {
    NAME: 'Passkey',
    MARQETA_VALUE: MARQETA_VALUES.AUTHENTICATION_METHOD.KNOWLEDGE_BASED,
} as const;

function arrayBufferToBase64URL(buffer: ArrayBuffer): string {
    return Base64URL.encode(new Uint8Array(buffer));
}

function base64URLToArrayBuffer(base64url: string): ArrayBuffer {
    return Base64URL.decode(base64url).buffer;
}

function isWebAuthnSupported(): boolean {
    return typeof window !== 'undefined' && !!window.PublicKeyCredential;
}

function buildCreationOptions(challenge: RegistrationChallenge, excludeCredentials: PublicKeyCredentialDescriptor[]): PublicKeyCredentialCreationOptions {
    return {
        challenge: base64URLToArrayBuffer(challenge.challenge),
        rp: {
            id: challenge.rp.id,
            name: 'Expensify',
        },
        user: {
            id: base64URLToArrayBuffer(challenge.user.id),
            name: challenge.user.displayName,
            displayName: challenge.user.displayName,
        },
        pubKeyCredParams: challenge.pubKeyCredParams.map((param) => ({
            type: param.type,
            alg: param.alg,
        })),
        authenticatorSelection: {
            userVerification: 'required',
            residentKey: 'required',
            requireResidentKey: true,
        },
        attestation: 'none',
        excludeCredentials,
        timeout: challenge.timeout,
    };
}

function buildRequestOptions(challenge: AuthenticationChallenge, allowCredentials: PublicKeyCredentialDescriptor[]): PublicKeyCredentialRequestOptions {
    return {
        challenge: base64URLToArrayBuffer(challenge.challenge),
        rpId: challenge.rpId,
        allowCredentials,
        userVerification: challenge.userVerification,
        timeout: challenge.timeout,
    };
}

function isPublicKeyCredential(credential: Credential): credential is PublicKeyCredential {
    return credential instanceof PublicKeyCredential;
}

async function createPasskey(options: PublicKeyCredentialCreationOptions): Promise<PublicKeyCredential> {
    const result = await navigator.credentials.create({publicKey: options});
    if (!result || !isPublicKeyCredential(result)) {
        throw new Error('navigator.credentials.create did not return a PublicKeyCredential');
    }
    return result;
}

async function getPasskeyAssertion(options: PublicKeyCredentialRequestOptions): Promise<PublicKeyCredential> {
    const result = await navigator.credentials.get({publicKey: options});
    if (!result || !isPublicKeyCredential(result)) {
        throw new Error('navigator.credentials.get did not return a PublicKeyCredential');
    }
    return result;
}

type SupportedTransport = ValueOf<typeof CONST.PASSKEY_TRANSPORT>;

const SUPPORTED_TRANSPORTS = new Set<string>(Object.values(CONST.PASSKEY_TRANSPORT));

function isSupportedTransport(transport: string): transport is SupportedTransport & AuthenticatorTransport {
    return SUPPORTED_TRANSPORTS.has(transport);
}

function buildAllowCredentials(credentials: Array<{id: string; transports?: SupportedTransport[]}>): PublicKeyCredentialDescriptor[] {
    return credentials.map((c) => ({
        id: base64URLToArrayBuffer(c.id),
        type: CONST.PASSKEY_CREDENTIAL_TYPE,
        transports: c.transports?.filter(isSupportedTransport),
    }));
}

export {
    PASSKEY_AUTH_TYPE,
    arrayBufferToBase64URL,
    base64URLToArrayBuffer,
    isWebAuthnSupported,
    buildCreationOptions,
    buildRequestOptions,
    createPasskey,
    getPasskeyAssertion,
    buildAllowCredentials,
    isSupportedTransport,
};
