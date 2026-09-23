import isNativeOAuthCallbackURL from '@libs/Navigation/linkingConfig/isNativeOAuthCallbackURL';

import CONST from '@src/CONST';

describe('isNativeOAuthCallbackURL', () => {
    it('matches the native callback path on any host, with or without a query string', () => {
        // Given the claimed native callback path on the production host with OAuth query params
        const url = `https://new.expensify.com${CONST.CLOUDFLARE_ACCESS.NATIVE_OAUTH_CALLBACK_PATH}?code=abc&state=xyz`;

        // When the URL is checked
        const result = isNativeOAuthCallbackURL(url);

        // Then it is recognized as the native callback
        expect(result).toBe(true);
    });

    it('does not match the web callback path', () => {
        // Given the web-only callback path that Safari must keep
        const url = 'https://new.expensify.com/oauth/callback?code=abc';

        // When the URL is checked
        const result = isNativeOAuthCallbackURL(url);

        // Then it is left for normal routing
        expect(result).toBe(false);
    });

    it('does not match a path that merely contains the callback path', () => {
        // Given a deep link whose path embeds the callback path as a substring
        const url = `https://new.expensify.com/r/123${CONST.CLOUDFLARE_ACCESS.NATIVE_OAUTH_CALLBACK_PATH}`;

        // When the URL is checked
        const result = isNativeOAuthCallbackURL(url);

        // Then it is not treated as the callback
        expect(result).toBe(false);
    });

    it('returns false for a value that is not a URL', () => {
        // Given a relative path with no origin
        const url = CONST.CLOUDFLARE_ACCESS.NATIVE_OAUTH_CALLBACK_PATH;

        // When the URL is checked
        const result = isNativeOAuthCallbackURL(url);

        // Then parsing fails safely
        expect(result).toBe(false);
    });
});
