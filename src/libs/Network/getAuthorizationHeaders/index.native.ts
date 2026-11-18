/**
 * Builds the `Authorization: Bearer` header for API requests that carry a JWT authToken, so Cloudflare can validate it at the edge.
 * The `authToken` parameter is still sent unchanged, and legacy hex tokens get no header.
 */
import isJWTAuthToken from '@libs/Network/isJWTAuthToken';

import CONST from '@src/CONST';

import type GetAuthorizationHeaders from './types';

const getAuthorizationHeaders: GetAuthorizationHeaders = (authToken) => {
    if (!isJWTAuthToken(authToken)) {
        return undefined;
    }

    return {[CONST.HTTP_HEADER_NAMES.AUTHORIZATION]: `Bearer ${authToken}`};
};

export default getAuthorizationHeaders;
