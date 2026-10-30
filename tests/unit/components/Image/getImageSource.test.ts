import getImageSource from '@components/Image/getImageSource';

import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import type Session from '@src/types/onyx/Session';

const NOW = new Date('2026-04-15T00:00:00Z');
const MOCK_URI = `${CONFIG.EXPENSIFY.EXPENSIFY_URL}receipts/w_receipt.jpg`;
const ATTACKER_URI = 'https://attacker.example/receipt.jpg';
const MOCK_TOKEN = 'encrypted-token';

describe('getImageSource', () => {
    beforeAll(() => {
        jest.useFakeTimers();
        jest.setSystemTime(NOW);
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    it('returns the original source for images that do not require auth', () => {
        const source = {uri: MOCK_URI};

        expect(
            getImageSource({
                propsSource: source,
                session: undefined,
                isAuthTokenRequired: false,
                isOffline: false,
            }),
        ).toEqual({source, shouldReauthenticate: false});
    });

    it('returns an authenticated source with cacheKey when the session is fresh', () => {
        const propsSource = {uri: MOCK_URI};
        const session: Session = {
            encryptedAuthToken: MOCK_TOKEN,
            creationDate: NOW.getTime(),
        };

        expect(
            getImageSource({
                propsSource,
                session,
                isAuthTokenRequired: true,
                isOffline: false,
            }),
        ).toEqual({
            source: {
                ...propsSource,
                cacheKey: MOCK_URI,
                headers: {
                    [CONST.CHAT_ATTACHMENT_TOKEN_KEY]: MOCK_TOKEN,
                },
            },
            shouldReauthenticate: false,
        });
    });

    it('returns an authenticated source offline even when the session is expired', () => {
        const propsSource = {uri: MOCK_URI};
        const session: Session = {
            encryptedAuthToken: MOCK_TOKEN,
            creationDate: NOW.getTime() - CONST.SESSION_EXPIRATION_TIME_MS - 1,
        };

        expect(
            getImageSource({
                propsSource,
                session,
                isAuthTokenRequired: true,
                isOffline: true,
            }),
        ).toEqual({
            source: {
                ...propsSource,
                cacheKey: MOCK_URI,
                headers: {
                    [CONST.CHAT_ATTACHMENT_TOKEN_KEY]: MOCK_TOKEN,
                },
            },
            shouldReauthenticate: false,
        });
    });

    it('returns undefined and requests reauthentication online when the session is expired', () => {
        const session: Session = {
            encryptedAuthToken: MOCK_TOKEN,
            creationDate: NOW.getTime() - CONST.SESSION_EXPIRATION_TIME_MS - 1,
        };

        expect(
            getImageSource({
                propsSource: {uri: MOCK_URI},
                session,
                isAuthTokenRequired: true,
                isOffline: false,
            }),
        ).toEqual({source: undefined, shouldReauthenticate: true});
    });

    it('returns an authenticated source for an expired session running on a delegate token', () => {
        const propsSource = {uri: MOCK_URI};
        const session: Session = {
            encryptedAuthToken: MOCK_TOKEN,
            creationDate: NOW.getTime() - CONST.SESSION_EXPIRATION_TIME_MS - 1,
            authTokenType: CONST.AUTH_TOKEN_TYPES.DELEGATE,
        };

        expect(
            getImageSource({
                propsSource,
                session,
                isAuthTokenRequired: true,
                isOffline: false,
            }),
        ).toEqual({
            source: {
                ...propsSource,
                cacheKey: MOCK_URI,
                headers: {
                    [CONST.CHAT_ATTACHMENT_TOKEN_KEY]: MOCK_TOKEN,
                },
            },
            shouldReauthenticate: false,
        });
    });

    it('returns the source without the token header for an image outside Expensify', () => {
        // Given an image that claims to need the token but lives on a host that is not an Expensify server
        const propsSource = {uri: ATTACKER_URI};
        const session: Session = {
            encryptedAuthToken: MOCK_TOKEN,
            creationDate: NOW.getTime(),
        };

        // When building the image source
        const result = getImageSource({
            propsSource,
            session,
            isAuthTokenRequired: true,
            isOffline: false,
        });

        // Then the image loads like any public image, with no token header for that host to read
        expect(result).toEqual({
            source: propsSource,
            shouldReauthenticate: false,
        });
    });

    it('does not ask for reauthentication for an image outside Expensify when the session is expired', () => {
        // Given an expired session and an image that claims to need the token but lives outside Expensify
        const propsSource = {uri: ATTACKER_URI};
        const session: Session = {
            encryptedAuthToken: MOCK_TOKEN,
            creationDate: NOW.getTime() - CONST.SESSION_EXPIRATION_TIME_MS - 1,
        };

        // When building the image source online
        const result = getImageSource({
            propsSource,
            session,
            isAuthTokenRequired: true,
            isOffline: false,
        });

        // Then the image loads without the token, because a fresh token would never be sent to that host either
        expect(result).toEqual({
            source: propsSource,
            shouldReauthenticate: false,
        });
    });

    it('preserves numeric image sources', () => {
        // @ts-expect-error -- Numeric object URIs intentionally exercise the runtime compatibility branch not represented by the public image source model.
        const propsSource: Parameters<typeof getImageSource>[0]['propsSource'] = {
            uri: 42,
        };

        expect(
            getImageSource({
                propsSource,
                session: undefined,
                isAuthTokenRequired: true,
                isOffline: false,
            }),
        ).toEqual({source: 42, shouldReauthenticate: false});
    });
});
