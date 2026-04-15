import getImageSource from '@components/Image/getImageSource';
import CONST from '@src/CONST';
import type Session from '@src/types/onyx/Session';

const NOW = new Date('2026-04-15T00:00:00Z');
const MOCK_URI = 'https://example.com/receipt.jpg';
const MOCK_TOKEN = 'encrypted-token';
type GetImageSourceParams = Parameters<typeof getImageSource>[0];

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

    it('preserves numeric image sources', () => {
        expect(
            getImageSource({
                propsSource: {uri: 42} as unknown as GetImageSourceParams['propsSource'],
                session: undefined,
                isAuthTokenRequired: true,
                isOffline: false,
            }),
        ).toEqual({source: 42, shouldReauthenticate: false});
    });
});
