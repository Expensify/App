import type {WithImplicitCoercion} from 'buffer';
import {Buffer} from 'buffer';

/**
 * Base64URL-encoded representation of a value used in WebAuthn-like flows.
 */
type Base64URLString = string;

/**
 * Base64URL is not currently supported as an encoding in React Native hence the RegExp is needed.
 */
const Base64URL = {
    /**
     * Converts a string into a URL-safe base64 representation.
     */
    encode: (value: WithImplicitCoercion<string | ArrayLike<number>>): Base64URLString => {
        return Buffer.from(value).toString('base64').replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '');
    },
    /**
     * Decodes a URL-safe Base64 (Base64URL) string back to its original byte representation.
     */
    decode: (value: Base64URLString) => {
        // Replace URL-safe characters back to Base64 standard characters
        let base64 = value.replaceAll('-', '+').replaceAll('_', '/');

        // Add padding characters '=' based on length modulo 4
        switch (base64.length % 4) {
            case 2:
                base64 += '==';
                break;
            case 3:
                base64 += '=';
                break;
            // No padding needed, for length modulo 4 being 0 or 1 (1 is technically not possible for valid base64)
            default:
                break;
        }

        // Convert the base64 string back to bytes
        return Buffer.from(base64, 'base64');
    },
};

export default Base64URL;
export type {Base64URLString};
