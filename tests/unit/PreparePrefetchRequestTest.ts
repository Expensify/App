import {WRITE_COMMANDS} from '@libs/API/types';

const mockGetAccountID = jest.fn();

jest.mock('@libs/Network/NetworkStore', () => ({
    getAccountID: mockGetAccountID,
}));

describe('preparePrefetchRequest', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('uses an account-scoped key for startup prefetches', async () => {
        // Given a signed-in account, because native prefetch responses outlive the JS session
        mockGetAccountID.mockReturnValue(123);

        // When a command eligible for startup prefetching is prepared
        const preparePrefetchRequest = (await import('@libs/Prefetch/preparePrefetchRequest')).default;
        const result = preparePrefetchRequest(WRITE_COMMANDS.RECONNECT_APP);

        // Then its cache key is bound to that account and cannot be reused by another account
        expect(result).toEqual({
            prefetchKey: `${WRITE_COMMANDS.RECONNECT_APP}:123`,
            prefetchHeaders: {prefetchKey: `${WRITE_COMMANDS.RECONNECT_APP}:123`},
        });
    });

    it('does not register a startup prefetch without an account identity', async () => {
        // Given the previous account's session has been cleared during sign-out
        mockGetAccountID.mockReturnValue(null);

        // When a reconnect request is processed after that cleanup
        const preparePrefetchRequest = (await import('@libs/Prefetch/preparePrefetchRequest')).default;
        const result = preparePrefetchRequest(WRITE_COMMANDS.RECONNECT_APP);

        // Then it cannot recreate a cross-session prefetch entry
        expect(result).toEqual({prefetchKey: undefined, prefetchHeaders: undefined});
    });
});
