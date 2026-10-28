import getImageSource from '@components/Image/getImageSource';

import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';

const MOCK_URI = `${CONFIG.EXPENSIFY.EXPENSIFY_URL}receipts/w_receipt.jpg`;
const MOCK_TOKEN = 'encrypted-token';

describe('getImageSource', () => {
    it('returns the original source for images that do not require auth', () => {
        // Given a public image that must not receive session credentials
        const propsSource = {uri: MOCK_URI};

        // When preparing it while an encrypted token is available
        const source = getImageSource({propsSource, encryptedAuthToken: MOCK_TOKEN, isAuthTokenRequired: false});

        // Then its source is unchanged
        expect(source).toBe(propsSource);
    });

    it('adds the token header and a stable cache key without estimating token expiry', () => {
        // Given a receipt whose token validity can only be determined by the server
        const propsSource = {uri: MOCK_URI};

        // When preparing its authenticated request
        const source = getImageSource({propsSource, encryptedAuthToken: MOCK_TOKEN, isAuthTokenRequired: true});

        // Then the loader can try the token, without putting it into the cache key or URL
        expect(source).toEqual({...propsSource, cacheKey: MOCK_URI, headers: {[CONST.CHAT_ATTACHMENT_TOKEN_KEY]: MOCK_TOKEN}});
    });

    it('preserves sources when there is no encrypted token', () => {
        // Given a source before the session has hydrated
        const propsSource = {uri: MOCK_URI};

        // When preparing it without credentials
        const source = getImageSource({propsSource, encryptedAuthToken: undefined, isAuthTokenRequired: true});

        // Then no fabricated token is sent
        expect(source).toBe(propsSource);
    });

    it('does not send credentials to an image outside Expensify', () => {
        // Given an untrusted image marked as requiring authentication
        const propsSource = {uri: 'https://attacker.example/receipt.jpg'};

        // When preparing its source with an available token
        const source = getImageSource({propsSource, encryptedAuthToken: MOCK_TOKEN, isAuthTokenRequired: true});

        // Then the remote host cannot receive the token
        expect(source).toBe(propsSource);
    });

    it.each([undefined, 42, [{uri: MOCK_URI}]])('preserves non-URI sources: %s', (propsSource) => {
        // Given a source that does not describe an individual remote image
        // When preparing it for the loader
        const source = getImageSource({propsSource, encryptedAuthToken: MOCK_TOKEN, isAuthTokenRequired: true});

        // Then the loader retains its native source representation
        expect(source).toBe(propsSource);
    });

    it('preserves numeric object URIs', () => {
        // Given a runtime source representation supported by older callers
        // @ts-expect-error -- Numeric object URIs exercise runtime compatibility outside the public source model.
        const propsSource: Parameters<typeof getImageSource>[0]['propsSource'] = {uri: 42};

        // When preparing the bundled asset
        const source = getImageSource({propsSource, encryptedAuthToken: MOCK_TOKEN, isAuthTokenRequired: true});

        // Then the loader receives its asset identifier
        expect(source).toBe(42);
    });
});
