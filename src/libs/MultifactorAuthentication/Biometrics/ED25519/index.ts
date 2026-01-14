import {etc, hashes, keygen, sign, verify} from '@noble/ed25519';
import type {Bytes} from '@noble/ed25519';
import {sha256, sha512} from '@noble/hashes/sha2';
import {utf8ToBytes} from '@noble/hashes/utils';
import {Buffer} from 'buffer';
import 'react-native-get-random-values';
import VALUES from '@libs/MultifactorAuthentication/Biometrics/VALUES';
import type {Base64URL, BinaryData, ChallengeFlag, MultifactorAuthenticationChallengeObject, SignedChallenge} from './types';

/**
 * ED25519 helpers used to construct and sign multifactor authentication challenges.
 * Wraps `@noble/ed25519` to produce WebAuthn-like payloads that the server can verify.
 */
hashes.sha512 = sha512;
hashes.sha512Async = (m: Uint8Array) => Promise.resolve(sha512(m));

const {hexToBytes, concatBytes, bytesToHex, randomBytes} = etc;

/**
 * Converts a string into a URL-safe base64 representation.
 */
const base64URL = <T extends string>(value: T): Base64URL<T> => {
    return Buffer.from(value).toString('base64').replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
};

/**
 * Generates a new ED25519 key pair encoded as hex strings.
 */
function generateKeyPair() {
    const {secretKey, publicKey} = keygen();

    return {
        privateKey: bytesToHex(secretKey),
        publicKey: bytesToHex(publicKey),
    };
}

/* eslint-disable no-bitwise */
/**
 * Builds the challenge flag bitmask describing user presence and verification.
 */
const createFlag = (up: boolean, uv: boolean): ChallengeFlag => {
    let flag = 0;
    if (up) {
        flag |= 0x01; // Set bit 0
    }
    if (uv) {
        flag |= 0x04; // Set bit 2
    }
    return flag;
};
/* eslint-enable no-bitwise */

/**
 * Creates the binary authenticator data buffer for a relying party identifier.
 */
const createBinaryData = (rpId: string): Bytes => {
    const rpIdBytes = utf8ToBytes(rpId);
    const RPID = sha256(rpIdBytes);

    const flagsArray = new Uint8Array([createFlag(true, true)]);

    const signCount = 0; // Not used in our implementation

    const buffer = new ArrayBuffer(4);
    const view = new DataView(buffer);
    view.setUint32(0, signCount, false); // writing the signCount as a big-endian 32-bit integer
    const signCountArray = new Uint8Array(buffer);

    return concatBytes(RPID, flagsArray, signCountArray);
};

/**
 * Signs a multifactor authentication challenge for the given account identifier and key.
 * Returns a WebAuthn-compatible signed challenge structure.
 */
const signToken = (accountID: number, token: MultifactorAuthenticationChallengeObject, key: string): SignedChallenge => {
    const rawId: Base64URL<string> = base64URL(`${accountID}_${VALUES.KEY_ALIASES.PUBLIC_KEY}`);
    const type = VALUES.ED25519_TYPE;

    const binaryData = createBinaryData(token.rpId);
    const authenticatorData: Base64URL<BinaryData> = base64URL(bytesToHex(binaryData));

    const tokenBytes = utf8ToBytes(JSON.stringify(token));

    const message = concatBytes(binaryData, sha256(tokenBytes));
    const keyInBytes = hexToBytes(key);

    const signatureRaw = sign(message, keyInBytes);
    const signature: Base64URL<string> = base64URL(bytesToHex(signatureRaw));

    return {
        rawId,
        type,
        response: {
            authenticatorData,
            clientDataJSON: base64URL(JSON.stringify(token)),
            signature,
        },
    };
};

export {generateKeyPair, signToken, createBinaryData, hexToBytes, concatBytes, sha256, utf8ToBytes, verify, bytesToHex, randomBytes, base64URL};
