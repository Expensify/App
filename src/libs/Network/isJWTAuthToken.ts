/**
 * Tells a JWT authToken apart from a legacy hex one. Auth issues JWTs only to accounts on its beta.
 */

// Every JWT starts with the base64url encoding of `{"`, and a hex token can't contain these characters
const JWT_PREFIX = 'eyJ';

function isJWTAuthToken(authToken: unknown): authToken is string {
    return typeof authToken === 'string' && authToken.startsWith(JWT_PREFIX);
}

export default isJWTAuthToken;
