import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

// Mock functions that will be used across tests
const mockOpenReportFromDeepLink = jest.fn();
const mockHasAuthToken = jest.fn(() => false);
const mockGetInitialURL = jest.fn<Promise<string | null>, []>(() => Promise.resolve(null));
const mockAddEventListener = jest.fn<{remove: jest.Mock}, [string, (state: {url: string}) => void]>(() => ({remove: jest.fn()}));
const mockOnURLListenerAdded = jest.fn();

// Mocks MUST be defined before any imports that use them
jest.mock('react-native', () => ({
    Linking: {
        getInitialURL: () => mockGetInitialURL(),
        addEventListener: (...args: [string, (state: {url: string}) => void]) => mockAddEventListener(...args),
    },
}));

jest.mock('@libs/actions/Link', () => ({
    openReportFromDeepLink: (...args: unknown[]): void => {
        mockOpenReportFromDeepLink(...args);
    },
}));

jest.mock('@libs/actions/Session', () => ({
    hasAuthToken: (): boolean => mockHasAuthToken(),
}));

jest.mock('@expensify/react-native-hybrid-app', () => ({
    default: {
        onURLListenerAdded: (): void => {
            mockOnURLListenerAdded();
        },
    },
}));

jest.mock('@src/CONFIG', () => ({
    default: {
        IS_HYBRID_APP: false,
    },
}));

describe('DeepLinkHandler', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    beforeEach(async () => {
        jest.clearAllMocks();
        await Onyx.clear();
        await waitForBatchedUpdates();
    });

    /**
     * Helper to setup all mocks after jest.resetModules()
     */
    function setupMocksAfterReset(isHybridApp = false): void {
        jest.doMock('react-native', () => ({
            Linking: {
                getInitialURL: () => mockGetInitialURL(),
                addEventListener: (...args: [string, (state: {url: string}) => void]) => mockAddEventListener(...args),
            },
        }));
        jest.doMock('@libs/actions/Link', () => ({
            openReportFromDeepLink: (...args: unknown[]): void => {
                mockOpenReportFromDeepLink(...args);
            },
        }));
        jest.doMock('@libs/actions/Session', () => ({
            hasAuthToken: (): boolean => mockHasAuthToken(),
        }));
        jest.doMock('@expensify/react-native-hybrid-app', () => ({
                onURLListenerAdded: (): void => {
                    mockOnURLListenerAdded();
            },
        }));
        jest.doMock('@src/CONFIG', () => ({
            IS_HYBRID_APP: isHybridApp,
        }));
    }

    describe('Initialization', () => {
        it('should set up Linking listener on module load', async () => {
            jest.resetModules();
            setupMocksAfterReset(false);

            await import('@src/libs/DeepLinkHandler');
            await waitForBatchedUpdates();

            expect(mockAddEventListener).toHaveBeenCalledWith('url', expect.any(Function));
        });

        it('should only initialize once', async () => {
            jest.resetModules();
            setupMocksAfterReset(false);

            // Import the module twice
            await import('@src/libs/DeepLinkHandler');
            await import('@src/libs/DeepLinkHandler');
            await waitForBatchedUpdates();

            // Should only set up listener once
            expect(mockAddEventListener).toHaveBeenCalledTimes(1);
        });

        it('should process initial URL when processInitialURL is called', async () => {
            jest.resetModules();
            setupMocksAfterReset(false);
        
            const testUrl = 'https://new.expensify.com/r/123';
            const DeepLinkHandlerModule = await import('@src/libs/DeepLinkHandler');
            await waitForBatchedUpdates();
        
            // Set up reports in Onyx so the deep link can be processed
            await Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}123`, {
                reportID: '123',
                type: 'chat',
            });
            await waitForBatchedUpdates();

            // Process initial URL via the exported function (called by Expensify.tsx)
            // Properly type the imported module default export and avoid unsafe casts
            const processInitialURL = (DeepLinkHandlerModule as {default: (url: string) => void}).default;
            processInitialURL(testUrl);
            await waitForBatchedUpdates();

            expect(mockOpenReportFromDeepLink).toHaveBeenCalled();
        });

        it('should call HybridAppModule.onURLListenerAdded when IS_HYBRID_APP is true', async () => {
            jest.resetModules();
            mockOnURLListenerAdded.mockClear();
            setupMocksAfterReset(true);

            await import('@src/libs/DeepLinkHandler');
            await waitForBatchedUpdates();

            expect(mockOnURLListenerAdded).toHaveBeenCalled();
        });

        it('should NOT call HybridAppModule.onURLListenerAdded when IS_HYBRID_APP is false', async () => {
            jest.resetModules();
            mockOnURLListenerAdded.mockClear();
            setupMocksAfterReset(false);

            await import('@src/libs/DeepLinkHandler');
            await waitForBatchedUpdates();

            expect(mockOnURLListenerAdded).not.toHaveBeenCalled();
        });
    });

    describe('Deep link handling', () => {
        it('should not process deep link if initial URL is null', async () => {
            jest.resetModules();
            mockGetInitialURL.mockReturnValue(Promise.resolve(null));
            setupMocksAfterReset(false);

            await import('@src/libs/DeepLinkHandler');
            await waitForBatchedUpdates();

            // Should not call openReportFromDeepLink when URL is null
            expect(mockOpenReportFromDeepLink).not.toHaveBeenCalled();
        });

        it('should capture URL change listener callback', async () => {
            jest.resetModules();
            mockGetInitialURL.mockReturnValue(Promise.resolve(null));

            let capturedCallback: ((state: {url: string}) => void) | null = null;
            mockAddEventListener.mockImplementation((event: string, callback: (state: {url: string}) => void) => {
                if (event === 'url') {
                    capturedCallback = callback;
                }
                return {remove: jest.fn()};
            });

            setupMocksAfterReset(false);

            await import('@src/libs/DeepLinkHandler');
            await waitForBatchedUpdates();

            // The listener callback should have been captured
            expect(capturedCallback).not.toBeNull();
            expect(typeof capturedCallback).toBe('function');
        });

        it('should return remove function from addEventListener', async () => {
            jest.resetModules();
            mockGetInitialURL.mockReturnValue(Promise.resolve(null));

            const mockRemove = jest.fn();
            mockAddEventListener.mockReturnValue({remove: mockRemove});
            setupMocksAfterReset(false);

            await import('@src/libs/DeepLinkHandler');
            await waitForBatchedUpdates();

            // Verify addEventListener returns an object with remove function
            const result = mockAddEventListener.mock.results.at(0);
            expect(result?.value).toHaveProperty('remove');
            expect(typeof (result?.value as {remove: jest.Mock}).remove).toBe('function');
        });
    });

    describe('URL listener behavior', () => {
        it('should register listener for url event type', async () => {
            jest.resetModules();
            mockGetInitialURL.mockReturnValue(Promise.resolve(null));
            setupMocksAfterReset(false);

            await import('@src/libs/DeepLinkHandler');
            await waitForBatchedUpdates();

            // Verify the first argument is 'url'
            expect(mockAddEventListener).toHaveBeenCalledWith('url', expect.any(Function));
            const call = mockAddEventListener.mock.calls.at(0);
            expect(call?.at(0)).toBe('url');
        });
    });
});
