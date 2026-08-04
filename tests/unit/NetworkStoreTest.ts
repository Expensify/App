import CONST from '@src/CONST';
import * as NetworkStore from '@src/libs/Network/NetworkStore';

describe('NetworkStore', () => {
    afterEach(() => {
        NetworkStore.setIsAuthenticating(false);
        jest.restoreAllMocks();
    });

    describe('isAuthenticating', () => {
        test('stays true within the allowed authentication window', () => {
            const dateNowSpy = jest.spyOn(Date, 'now');
            const startTime = 1000000000000;
            dateNowSpy.mockReturnValue(startTime);
            NetworkStore.setIsAuthenticating(true);

            dateNowSpy.mockReturnValue(startTime + CONST.NETWORK.MAX_AUTHENTICATION_PENDING_TIME_MS);
            expect(NetworkStore.isAuthenticating()).toBe(true);
        });

        test('self-clears once an authentication attempt has been pending for too long', () => {
            const dateNowSpy = jest.spyOn(Date, 'now');
            const startTime = 1000000000000;
            dateNowSpy.mockReturnValue(startTime);
            NetworkStore.setIsAuthenticating(true);

            // A stuck authentication (e.g. an interrupted SAML sign-in) must not block the network forever
            dateNowSpy.mockReturnValue(startTime + CONST.NETWORK.MAX_AUTHENTICATION_PENDING_TIME_MS + 1);
            expect(NetworkStore.isAuthenticating()).toBe(false);

            // And it stays cleared on subsequent reads
            expect(NetworkStore.isAuthenticating()).toBe(false);
        });

        test('a fresh authentication attempt restarts the stuck-detection window', () => {
            const dateNowSpy = jest.spyOn(Date, 'now');
            const startTime = 1000000000000;
            dateNowSpy.mockReturnValue(startTime);
            NetworkStore.setIsAuthenticating(true);

            // A new attempt re-stamps the window, so it is not treated as stale even though the first one would be
            dateNowSpy.mockReturnValue(startTime + CONST.NETWORK.MAX_AUTHENTICATION_PENDING_TIME_MS + 1);
            NetworkStore.setIsAuthenticating(true);
            expect(NetworkStore.isAuthenticating()).toBe(true);
        });
    });
});
