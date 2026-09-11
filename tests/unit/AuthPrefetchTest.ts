import ONYXKEYS from '@src/ONYXKEYS';

const mockClearPrefetchOnAppStart = jest.fn();
const mockMerge = jest.fn();
const mockMultiSet = jest.fn();
const mockClear = jest.fn();
const mockGetDBTime = jest.fn();

jest.mock('@libs/Prefetch/clearPrefetchOnAppStart', () => mockClearPrefetchOnAppStart);
jest.mock('@libs/Log', () => ({
    __esModule: true,
    default: {
        warn: jest.fn(),
    },
}));
jest.mock('@libs/DateUtils', () => ({
    getDBTime: mockGetDBTime,
}));
jest.mock('react-native-onyx', () => ({
    __esModule: true,
    default: {
        merge: mockMerge,
        multiSet: mockMultiSet,
        clear: mockClear,
    },
}));

describe('auth startup prefetch cleanup', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockClearPrefetchOnAppStart.mockResolvedValue(undefined);
        mockMerge.mockResolvedValue(undefined);
        mockMultiSet.mockResolvedValue(undefined);
        mockClear.mockResolvedValue(undefined);
        mockGetDBTime.mockReturnValue('2026-07-16 12:00:00.000');
    });

    it('clears native startup prefetches before replacing session auth tokens', async () => {
        const creationDate = 123456789;
        const getTimeSpy = jest.spyOn(Date.prototype, 'getTime').mockReturnValue(creationDate);
        const updateSessionAuthTokens = (await import('@userActions/Session/updateSessionAuthTokens')).default;

        await updateSessionAuthTokens('authToken', 'encryptedAuthToken');

        expect(mockClearPrefetchOnAppStart).toHaveBeenCalledTimes(1);
        expect(mockMerge).toHaveBeenCalledWith(ONYXKEYS.SESSION, {
            authToken: 'authToken',
            encryptedAuthToken: 'encryptedAuthToken',
            creationDate,
        });
        expect(mockClearPrefetchOnAppStart.mock.invocationCallOrder.at(0)).toBeLessThan(mockMerge.mock.invocationCallOrder.at(0) ?? 0);
        getTimeSpy.mockRestore();
    });

    it('clears native startup prefetches before resetting Onyx for an identity transition', async () => {
        const clearOnyxAndSeedFullReconnect = (await import('@userActions/clearOnyxAndSeedFullReconnect')).default;

        await clearOnyxAndSeedFullReconnect([ONYXKEYS.SESSION], {[ONYXKEYS.IS_LOADING_APP]: true});

        expect(mockClearPrefetchOnAppStart).toHaveBeenCalledTimes(2);
        expect(mockMultiSet).toHaveBeenCalledWith({
            [ONYXKEYS.IS_LOADING_APP]: true,
            [ONYXKEYS.LAST_FULL_RECONNECT_TIME]: '2026-07-16 12:00:00.000',
        });
        expect(mockClear).toHaveBeenCalledWith([ONYXKEYS.SESSION, ONYXKEYS.IS_LOADING_APP, ONYXKEYS.LAST_FULL_RECONNECT_TIME]);
        expect(mockClearPrefetchOnAppStart.mock.invocationCallOrder.at(0)).toBeLessThan(mockMultiSet.mock.invocationCallOrder.at(0) ?? 0);
        expect(mockClearPrefetchOnAppStart.mock.invocationCallOrder.at(1)).toBeGreaterThan(mockClear.mock.invocationCallOrder.at(0) ?? 0);
    });
});
