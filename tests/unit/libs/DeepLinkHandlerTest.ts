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

    describe('Initialization', () => {
        it('should set up Linking listener on module load', async () => {
            jest.resetModules();

            // Re-apply mocks after reset
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
                default: {
                    onURLListenerAdded: (): void => {
                        mockOnURLListenerAdded();
                    },
                },
            }));
            jest.doMock('@src/CONFIG', () => ({
                default: {IS_HYBRID_APP: false},
            }));

            await import('@src/libs/DeepLinkHandler');
            await waitForBatchedUpdates();

            expect(mockAddEventListener).toHaveBeenCalledWith('url', expect.any(Function));
        });

        it('should check for initial URL on module load', async () => {
            jest.resetModules();

            const testUrl = 'https://new.expensify.com/r/123';
            mockGetInitialURL.mockReturnValue(Promise.resolve(testUrl));

            // Re-apply mocks after reset
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
                default: {
                    onURLListenerAdded: (): void => {
                        mockOnURLListenerAdded();
                    },
                },
            }));
            jest.doMock('@src/CONFIG', () => ({
                default: {IS_HYBRID_APP: false},
            }));

            await import('@src/libs/DeepLinkHandler');
            await waitForBatchedUpdates();

            expect(mockGetInitialURL).toHaveBeenCalled();
        });

        it('should call HybridAppModule.onURLListenerAdded when IS_HYBRID_APP is true', async () => {
            jest.resetModules();

            // Re-apply ALL mocks after reset, with IS_HYBRID_APP: true
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
                default: {
                    onURLListenerAdded: (): void => {
                        mockOnURLListenerAdded();
                    },
                },
            }));
            jest.doMock('@src/CONFIG', () => ({
                default: {IS_HYBRID_APP: true}, // Changed to true
            }));

            mockOnURLListenerAdded.mockClear();
            await import('@src/libs/DeepLinkHandler');
            await waitForBatchedUpdates();

            expect(mockOnURLListenerAdded).toHaveBeenCalled();
        });
    });

    describe('Deep link handling', () => {
        it('should not process deep link if URL is null', async () => {
            jest.resetModules();

            mockGetInitialURL.mockReturnValue(Promise.resolve(null));

            // Re-apply mocks after reset
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
                default: {
                    onURLListenerAdded: (): void => {
                        mockOnURLListenerAdded();
                    },
                },
            }));
            jest.doMock('@src/CONFIG', () => ({
                default: {IS_HYBRID_APP: false},
            }));

            await import('@src/libs/DeepLinkHandler');
            await waitForBatchedUpdates();

            // Should not call openReportFromDeepLink when URL is null
            expect(mockOpenReportFromDeepLink).not.toHaveBeenCalled();
        });
    });
});
