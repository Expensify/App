import CONST from '@src/CONST';
import Base64URL from '@src/utils/Base64URL';
import type {AuthenticationChallenge, RegistrationChallenge} from './ED25519/types';

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
        pubKeyCredParams: challenge.pubKeyCredParams.map((p) => ({
            type: p.type as PublicKeyCredentialType,
            alg: p.alg,
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
        userVerification: challenge.userVerification as UserVerificationRequirement,
        timeout: challenge.timeout,
    };
}

async function createPasskey(options: PublicKeyCredentialCreationOptions): Promise<PublicKeyCredential> {
    const result = await navigator.credentials.create({publicKey: options});
    if (!result) {
        throw new Error('navigator.credentials.create returned null');
    }
    return result as PublicKeyCredential;
}

async function getPasskeyAssertion(options: PublicKeyCredentialRequestOptions): Promise<PublicKeyCredential> {
    const result = await navigator.credentials.get({publicKey: options});
    if (!result) {
        throw new Error('navigator.credentials.get returned null');
    }
    return result as PublicKeyCredential;
}

function buildAllowCredentials(credentials: Array<{id: string; transports?: string[]}>): PublicKeyCredentialDescriptor[] {
    return credentials.map((c) => ({
        id: base64URLToArrayBuffer(c.id),
        type: CONST.PASSKEY_CREDENTIAL_TYPE,
        transports: c.transports as AuthenticatorTransport[] | undefined,
    }));
}

export {arrayBufferToBase64URL, base64URLToArrayBuffer, isWebAuthnSupported, buildCreationOptions, buildRequestOptions, createPasskey, getPasskeyAssertion, buildAllowCredentials};
