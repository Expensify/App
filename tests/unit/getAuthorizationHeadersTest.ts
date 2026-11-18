import getAuthorizationHeaders from '@libs/Network/getAuthorizationHeaders';

import CONST from '@src/CONST';

const getWebAuthorizationHeaders = jest.requireActual<{default: (authToken: unknown) => Record<string, string> | undefined}>('@libs/Network/getAuthorizationHeaders/index.ts').default;

const JWT_AUTH_TOKEN = 'eyJhbGciOiJFUzI1NiJ9.eyJzdWIiOiIxIn0.c2lnbmF0dXJl';
const HEX_AUTH_TOKEN = '0123456789ABCDEF0123456789ABCDEF';

describe('getAuthorizationHeaders', () => {
    it('returns a Bearer header for a JWT authToken on native', () => {
        // Given a JWT authToken, which Auth issues only to accounts on its beta
        // When the native headers are built for it
        const headers = getAuthorizationHeaders(JWT_AUTH_TOKEN);

        // Then the token goes in the Authorization header, so Cloudflare can validate it at the edge
        expect(headers).toEqual({[CONST.HTTP_HEADER_NAMES.AUTHORIZATION]: `Bearer ${JWT_AUTH_TOKEN}`});
    });

    it.each([
        ['a hex authToken', HEX_AUTH_TOKEN],
        ['no authToken', undefined],
        ['a null authToken', null],
    ])('returns no header for %s on native', (_description, authToken) => {
        // Given a token that is not a JWT
        // When the native headers are built for it
        const headers = getAuthorizationHeaders(authToken);

        // Then no header is sent, because only JWTs can be validated as Bearer tokens
        expect(headers).toBeUndefined();
    });

    it('returns no header for a JWT authToken on web', () => {
        // Given a JWT authToken on web, where a custom header would make the browser send a CORS preflight before every API call
        // When the web headers are built for it
        const headers = getWebAuthorizationHeaders(JWT_AUTH_TOKEN);

        // Then no header is sent, and the token only travels as the authToken parameter
        expect(headers).toBeUndefined();
    });
});
