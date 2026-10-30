import getImageSource from '@components/Image/getImageSource';

import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';

const MOCK_URI = `${CONFIG.EXPENSIFY.EXPENSIFY_URL}receipts/w_receipt.jpg`;
const MOCK_TOKEN = 'encrypted-token';

describe('getImageSource', () => {
    it('adds the token header and a stable cache key without estimating expiry', () => {
        // Given a receipt whose token validity can only be determined by the server
        const propsSource = {uri: MOCK_URI};

        // When preparing its authenticated request
        const source = getImageSource({propsSource, encryptedAuthToken: MOCK_TOKEN, isAuthTokenRequired: true});

        // Then the loader can try the token without including it in the cache key or URL
        expect(source).toEqual({...propsSource, cacheKey: MOCK_URI, headers: {[CONST.CHAT_ATTACHMENT_TOKEN_KEY]: MOCK_TOKEN}});
    });

    it.each<Parameters<typeof getImageSource>[0]>([
        {propsSource: {uri: MOCK_URI}, encryptedAuthToken: MOCK_TOKEN, isAuthTokenRequired: false},
        {propsSource: {uri: MOCK_URI}, encryptedAuthToken: undefined, isAuthTokenRequired: true},
        {propsSource: {uri: 'https://attacker.example/receipt.jpg'}, encryptedAuthToken: MOCK_TOKEN, isAuthTokenRequired: true},
        {propsSource: undefined, encryptedAuthToken: MOCK_TOKEN, isAuthTokenRequired: true},
        {propsSource: 42, encryptedAuthToken: MOCK_TOKEN, isAuthTokenRequired: true},
        {propsSource: [{uri: MOCK_URI}], encryptedAuthToken: MOCK_TOKEN, isAuthTokenRequired: true},
    ])('preserves the source when credentials are inapplicable: %j', (params) => {
        // Given a native, public or untrusted source, or a session awaiting hydration
        // When preparing it for the loader
        const source = getImageSource(params);

        // Then neither credentials nor a new source identity are introduced
        expect(source).toBe(params.propsSource);
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
