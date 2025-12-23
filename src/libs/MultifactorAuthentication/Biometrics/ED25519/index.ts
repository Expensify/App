/**
 * Required polyfills for React Native to support ED25519 cryptographic operations.
 * Provides implementations for getRandomValues and SHA-512 hashing.
 * @see https://github.com/paulmillr/noble-ed25519?tab=readme-ov-file#react-native-polyfill-getrandomvalues-and-sha512
 */
import {etc, hashes, keygen, sign, verify} from '@noble/ed25519';
import type {Bytes} from '@noble/ed25519';
import {sha256, sha512} from '@noble/hashes/sha2';
import {utf8ToBytes} from '@noble/hashes/utils';
import {Buffer} from 'buffer';
import 'react-native-get-random-values';
import VALUES from '@libs/MultifactorAuthentication/Biometrics/VALUES';
import type {Base64URL, BinaryData, ChallengeFlag, MultifactorAuthenticationChallengeObject, SignedChallenge} from './types';

hashes.sha512 = sha512;
hashes.sha512Async = (m: Uint8Array) => Promise.resolve(sha512(m));

const {hexToBytes, concatBytes, bytesToHex, randomBytes} = etc;

/** RN polyfill for base64url encoding */
const base64URL = <T>(value: string): Base64URL<T> => {
    return Buffer.from(value).toString('base64').replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
};

/**
 * Generates a new random ED25519 key pair.
 * Returns both private and public keys encoded as hexadecimal strings.
 */
function generateKeyPair() {
    const {secretKey, publicKey} = keygen();

    return {
        privateKey: bytesToHex(secretKey),
        publicKey: bytesToHex(publicKey),
    };
}

/* eslint-disable no-bitwise */
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
 * Signs a multifactor authentication challenge token using an ED25519 private key.
 * Constructs the necessary authenticator data and client data JSON.
 * Returns a SignedChallenge object containing the signature and related data.
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
