/**
 * Decides how an API request sends its authToken. A JWT goes in the `Authorization: Bearer` header instead of the body, so Cloudflare
 * can validate it at the edge. Legacy hex tokens, which Auth issues to accounts outside its JWT beta, stay in the body.
 */
import {getQAAccessToken} from '@libs/CloudflareAccess/fetchWithQAAuth';

import CONST from '@src/CONST';

// Every JWT starts with the base64url encoding of `{"`, and a hex token can't contain these characters
const JWT_PREFIX = 'eyJ';

type RequestAuthorization = {
    /** The JWT the request sends in its Authorization header instead of its body */
    authToken: string;

    headers: Record<string, string>;
};

type AuthTokenPlacement = {
    /** The parameters to serialize into the body, without `authToken` when it moved to the header */
    payloadData: Record<string, unknown>;

    /** Undefined when the authToken stays in the body */
    authorization?: RequestAuthorization;
};

function moveJWTAuthTokenToHeader(url: string, data: Record<string, unknown>): AuthTokenPlacement {
    const {authToken, ...dataWithoutAuthToken} = data;

    // The Cloudflare Access bearer of the QA server takes the Authorization header, so the token keeps riding in the body there
    if (typeof authToken !== 'string' || !authToken.startsWith(JWT_PREFIX) || getQAAccessToken(url)) {
        return {payloadData: data};
    }

    return {
        payloadData: dataWithoutAuthToken,
        authorization: {authToken, headers: {[CONST.HTTP_HEADER_NAMES.AUTHORIZATION]: `Bearer ${authToken}`}},
    };
}

export default moveJWTAuthTokenToHeader;
export type {RequestAuthorization};
