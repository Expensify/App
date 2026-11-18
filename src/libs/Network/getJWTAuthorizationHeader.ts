/**
 * Builds the `Authorization: Bearer` header for API requests whose authToken is a JWT, so Cloudflare can validate it at the edge.
 * Legacy hex tokens, which Auth issues to accounts outside its JWT beta, get no header. The body keeps sending `authToken` either way.
 */
import {getQAAccessToken} from '@libs/CloudflareAccess/fetchWithQAAuth';

import CONST from '@src/CONST';

// Every JWT starts with the base64url encoding of `{"`, and a hex token can't contain these characters
const JWT_PREFIX = 'eyJ';

function getJWTAuthorizationHeader(url: string, authToken: unknown): Record<string, string> | undefined {
    // The Cloudflare Access bearer of the QA server takes the Authorization header there
    if (typeof authToken !== 'string' || !authToken.startsWith(JWT_PREFIX) || getQAAccessToken(url)) {
        return undefined;
    }

    return {[CONST.HTTP_HEADER_NAMES.AUTHORIZATION]: `Bearer ${authToken}`};
}

export default getJWTAuthorizationHeader;
