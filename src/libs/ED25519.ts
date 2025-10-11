import * as ed from '@noble/ed25519';
import {sha512} from '@noble/hashes/sha2';

/**
 * Required polyfills for React Native to support ED25519 cryptographic operations.
 * Provides implementations for getRandomValues and SHA-512 hashing.
 * @see https://github.com/paulmillr/noble-ed25519?tab=readme-ov-file#react-native-polyfill-getrandomvalues-and-sha512
 */
import 'react-native-get-random-values';

ed.etc.sha512Sync = (...m) => sha512(ed.etc.concatBytes(...m));
ed.etc.sha512Async = (...m) => Promise.resolve(ed.etc.sha512Sync?.(...m) ?? ([] as unknown as ed.Bytes));

/**
 * Generates a new random ED25519 key pair.
 * Returns both private and public keys encoded as hexadecimal strings.
 */
function generateKeyPair() {
    const privateKey = ed.utils.randomPrivateKey();
    const publicKey = ed.getPublicKey(privateKey);

    return {
        privateKey: ed.etc.bytesToHex(privateKey),
        publicKey: ed.etc.bytesToHex(publicKey),
    };
}

/**
 * Signs a token string using an ED25519 private key.
 * The token is first converted to bytes using TextEncoder to support all Unicode characters.
 * Returns the signature as a hexadecimal string.
 */
function signToken(token: string, key: string) {
    return ed.etc.bytesToHex(ed.sign(new TextEncoder().encode(token), key));
}

export {generateKeyPair, signToken};
