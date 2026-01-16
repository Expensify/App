import {etc, hashes, keygen, sign, verify} from '@noble/ed25519';
import type {Bytes} from '@noble/ed25519';
import {sha256, sha512} from '@noble/hashes/sha2';
import {utf8ToBytes} from '@noble/hashes/utils';
import 'react-native-get-random-values';
import VALUES from '@libs/MultifactorAuthentication/Biometrics/VALUES';
import Base64URL from '@src/utils/Base64URL';
import type {Base64URLString} from '@src/utils/Base64URL';
import type {ChallengeFlags, MultifactorAuthenticationChallengeObject, SignedChallenge} from './types';

/**
 * ED25519 helpers used to construct and sign multifactor authentication challenges.
 * Wraps `@noble/ed25519` to produce WebAuthn-like payloads that the server can verify.
 */

/**
 * Required polyfills for React Native to support ED25519 cryptographic operations.
 * Provides implementations for getRandomValues and SHA-512 hashing.
 * It is required for internal operations, even if it is not explicitly used in the app code.
 * @see https://github.com/paulmillr/noble-ed25519?tab=readme-ov-file#react-native-polyfill-getrandomvalues-and-sha512
 */
hashes.sha512 = sha512;
hashes.sha512Async = (m: Uint8Array) => Promise.resolve(sha512(m));

const {hexToBytes, concatBytes, bytesToHex, randomBytes} = etc;

/**
 * Generates a new ED25519 key pair encoded as hex strings.
 */
function generateKeyPair() {
    const {secretKey, publicKey} = keygen();

    return {
        /**
         * The public key is stored as url-encoded base64 because that is what the server expects.
         * The encoding is arbitrary, and base64 was chosen because it is shorter than hex, so less
         * overall data is stored and shipped across the wire. The private key is never exchanged with
         * the server, so compatibility with the encoding format is not important. Hex is used instead
         * because the @noble library ships with some convenience methods for converting between
         * Hex<->Bytes, and the documented examples use those methods.
         */
        privateKey: bytesToHex(secretKey),

        publicKey: Base64URL.encode(publicKey),
    };
}

/* eslint-disable no-bitwise */
/**
 * Builds the challenge flag bitmask describing user presence and verification.
 */
function createFlag(up: boolean, uv: boolean): ChallengeFlags {
    let flag = 0;

    // Set bit 0
    // (User Presence, user touched the security key or interacted with the authenticator)
    if (up) {
        flag |= 0x01;
    }

    // Set bit 2
    // (User Verified, user has successfully authenticated with the authenticator)
    if (uv) {
        flag |= 0x04;
    }

    return flag;
}
/* eslint-enable no-bitwise */

/**
 * Creates the binary authenticator data buffer for a Relying Party Identifier.
 * The result is in the form of concatBytes of the RPID, FLAGS, and SIGN_COUNT.
 *
 * RPID - Relying Party Identifier Hash (SHA-256 hash of the rpId)
 * FLAGS - Bitmask describing user presence and verification state
 *
 * SIGN_COUNT - This exists to support hardware authenticator devices.
 * It contains a monotonically increasing integer. The API currently will not validate this field.
 *
 * @see https://www.w3.org/TR/webauthn-2/#sctn-authenticator-data
 */
function createAuthenticatorData(rpId: string): Bytes {
    const rpIdBytes = utf8ToBytes(rpId);

    // Per WebAuthn spec, RPID is hashed to guarantee a consistent length
    const hashedRpId = sha256(rpIdBytes);

    // User Presence (UP) is true, User Verification (UV) is true
    // This is because we only create challenges after successful biometric verification
    const flagsArray = new Uint8Array([createFlag(true, true)]);

    const signCount = 0;

    // Creating a 4-byte buffer for the signCount
    const buffer = new ArrayBuffer(4);

    const view = new DataView(buffer);

    // Writing the signCount as a big-endian 32-bit integer because WebAuthn expects it in this format
    view.setUint32(0, signCount, false);

    // Creating a Uint8Array from the buffer to get the byte representation
    const signCountArray = new Uint8Array(buffer);

    // Concatenate hashedRpId, flagsArray, and signCountArray to form the final binary data
    return concatBytes(hashedRpId, flagsArray, signCountArray);
}

/**
 * Signs a multifactor authentication challenge for the given account identifier and key.
 * Returns a WebAuthn-compatible signed challenge structure.
 */
function signToken(credentialRequestOptions: MultifactorAuthenticationChallengeObject, privateKey: string): SignedChallenge {
    const rawId: Base64URLString = Base64URL.encode(VALUES.KEY_ALIASES.PUBLIC_KEY);
    const type = VALUES.ED25519_TYPE;

    const authenticatorDataBytes = createAuthenticatorData(credentialRequestOptions.rpId);
    const authenticatorData: Base64URLString = Base64URL.encode(authenticatorDataBytes);

    const clientDataJSON = JSON.stringify({challenge: credentialRequestOptions.challenge});
    const clientDataBytes = utf8ToBytes(clientDataJSON);

    /**
     * Since the token can be of variable length, it is hashed to guarantee that binaryData is always a fixed length.
     * This comes from the WebAuthN spec, with which we maintain compatibility here for easier interoperability on the backend.
     */
    const clientDataHash = sha256(clientDataBytes);

    // WebAuthn signature format: sign(authenticatorData || SHA-256(clientDataJSON))
    const dataToSign = concatBytes(authenticatorDataBytes, clientDataHash);
    const privateKeyBytes = hexToBytes(privateKey);

    const signatureBytes = sign(dataToSign, privateKeyBytes);
    const signature: Base64URLString = Base64URL.encode(signatureBytes);

    return {
        rawId,
        type,
        response: {
            authenticatorData,
            clientDataJSON: Base64URL.encode(clientDataJSON),
            signature,
        },
    };
}

export {generateKeyPair, signToken, createAuthenticatorData, concatBytes, sha256, utf8ToBytes, verify, randomBytes};
