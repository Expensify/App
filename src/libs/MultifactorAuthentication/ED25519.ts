/**
 * Required polyfills for React Native to support ED25519 cryptographic operations.
 * Provides implementations for getRandomValues and SHA-512 hashing.
 * @see https://github.com/paulmillr/noble-ed25519?tab=readme-ov-file#react-native-polyfill-getrandomvalues-and-sha512
 */
import * as ed from '@noble/ed25519';
import {sha512} from '@noble/hashes/sha2';
import 'react-native-get-random-values';

ed.hashes.sha512 = sha512;
ed.hashes.sha512Async = (m: Uint8Array) => Promise.resolve(sha512(m));

/**
 * Generates a new random ED25519 key pair.
 * Returns both private and public keys encoded as hexadecimal strings.
 */
function generateKeyPair() {
    const {secretKey, publicKey} = ed.keygen();

    return {
        privateKey: ed.etc.bytesToHex(secretKey),
        publicKey: ed.etc.bytesToHex(publicKey),
    };
}

/**
 * Signs a token string using an ED25519 private key.
 * The token is first converted to bytes using TextEncoder to support all Unicode characters.
 * Returns the signature as a hexadecimal string.
 */
function signToken(token: string, key: string) {
    const bytes = ed.etc.hexToBytes(key);

    return ed.etc.bytesToHex(ed.sign(new TextEncoder().encode(token), bytes));
}

export {generateKeyPair, signToken};
