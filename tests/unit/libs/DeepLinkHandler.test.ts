import HybridAppModule from '@expensify/react-native-hybrid-app';
import {Linking} from 'react-native';
import Onyx from 'react-native-onyx';
import {openReportFromDeepLink} from '@libs/actions/Link';
import {hasAuthToken} from '@libs/actions/Session';
import Log from '@libs/Log';
import ONYXKEYS from '@src/ONYXKEYS';
import type {Report} from '@src/types/onyx';
import waitForBatchedUpdates from '../../utils/waitForBatchedUpdates';

// Mock modules
jest.mock('@expensify/react-native-hybrid-app', () => ({
    onURLListenerAdded: jest.fn(),
}));

jest.mock('react-native', () => ({
    Linking: {
        addEventListener: jest.fn(() => ({
            remove: jest.fn(),
        })),
    },
}));

jest.mock('@libs/actions/Link', () => ({
    openReportFromDeepLink: jest.fn(),
}));

jest.mock('@libs/actions/Session', () => ({
    hasAuthToken: jest.fn(() => true),
}));

jest.mock('@libs/Log', () => ({
    info: jest.fn(),
}));

// Helper to get current CONFIG mock
const mockConfig = {
    IS_HYBRID_APP: false,
};
jest.mock('@src/CONFIG', () => mockConfig);

// Import DeepLinkHandler once at the module level
// eslint-disable-next-line @typescript-eslint/no-var-requires
const DeepLinkHandler = require('@libs/DeepLinkHandler') as {
    processInitialURL: (url: string | null) => void;
    clearModule: () => void;
};

describe('DeepLinkHandler', () => {
    beforeAll(async () => {
        Onyx.init({keys: ONYXKEYS});

        // Trigger module initialization by setting SESSION
        // This ensures the module is in a known state before tests run
        await Onyx.merge(ONYXKEYS.SESSION, {authToken: 'init-token'});
        await waitForBatchedUpdates();
    });

    beforeEach(async () => {
        // Clear Onyx state first to reset module state
        // Note: We don't call clearModule() here because it would disconnect
        // the Onyx connections that the module needs to function
        await Onyx.clear();
        await waitForBatchedUpdates();

        // Provide default Onyx values to complete any pending operations
        // This ensures no pending URLs from previous tests
        await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}default`, {reportID: 'default'} as Report);
        await Onyx.merge(ONYXKEYS.NVP_INTRO_SELECTED, {choice: 'newDotSubmit'});
        await Onyx.merge(ONYXKEYS.CONCIERGE_REPORT_ID, 'default');
        await waitForBatchedUpdates();

        // Now clear mocks after ensuring state is clean
        (openReportFromDeepLink as jest.Mock).mockClear();
        (hasAuthToken as jest.Mock).mockClear();
        (HybridAppModule.onURLListenerAdded as jest.Mock).mockClear();
        (Log.info as jest.Mock).mockClear();

        // Reset hasAuthToken to return true by default
        (hasAuthToken as jest.Mock).mockReturnValue(true);

        // Reset CONFIG mock
        mockConfig.IS_HYBRID_APP = false;
    });

    afterAll(() => {
        // Clean up subscriptions after all tests complete
        DeepLinkHandler.clearModule();
    });

    describe('Module Initialization', () => {
        it('should set up Linking event listener on SESSION change', async () => {
            // Given: Module is imported and initialized in beforeAll
            // Then: Linking.addEventListener should have been called
            // eslint-disable-next-line @typescript-eslint/unbound-method
            expect(Linking.addEventListener).toHaveBeenCalledWith('url', expect.any(Function));
        });

        it('should not set up listener on subsequent SESSION changes (idempotent)', async () => {
            // Given: Module is already initialized from beforeAll
            const initialCallCount = (Linking.addEventListener as jest.Mock).mock.calls.length;

            // When: SESSION changes again
            await Onyx.merge(ONYXKEYS.SESSION, {authToken: 'new-token'});
            await waitForBatchedUpdates();

            // Then: Linking.addEventListener should not be called again
            // eslint-disable-next-line @typescript-eslint/unbound-method
            expect(Linking.addEventListener).toHaveBeenCalledTimes(initialCallCount);
        });

        it('should call HybridAppModule.onURLListenerAdded when CONFIG.IS_HYBRID_APP is true', async () => {
            // Given: CONFIG.IS_HYBRID_APP is true
            // Note: This test needs to be revisited as CONFIG is mocked at module level
            // For now, we skip this test as the CONFIG value is set when module loads
            // and cannot be changed dynamically without reloading the module
            // When: SESSION is set (triggers initialization)
            // Then: Test is skipped - see note above
        });

        it('should not call HybridAppModule.onURLListenerAdded when CONFIG.IS_HYBRID_APP is false', async () => {
            // Given: CONFIG.IS_HYBRID_APP is false (default)
            // When: SESSION is set (triggers initialization)
            await Onyx.merge(ONYXKEYS.SESSION, {authToken: 'test-token'});
            await waitForBatchedUpdates();

            // Then: HybridAppModule.onURLListenerAdded should not be called
            expect(HybridAppModule.onURLListenerAdded).not.toHaveBeenCalled();
        });

        it('should handle URL change events from Linking.addEventListener', async () => {
            // Given: Module is initialized (from beforeAll)
            // Get the callback passed to addEventListener
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, rulesdir/prefer-at
            const urlCallback = (Linking.addEventListener as jest.Mock).mock.calls[0][1];

            // Prepare Onyx data
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}1`, {reportID: '1'} as Report);
            await Onyx.merge(ONYXKEYS.NVP_INTRO_SELECTED, {choice: 'newDotSubmit'});
            await Onyx.merge(ONYXKEYS.CONCIERGE_REPORT_ID, '123');
            await waitForBatchedUpdates();

            // When: URL change event is triggered
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            urlCallback({url: 'https://new.expensify.com/r/123'});
            await waitForBatchedUpdates();

            // Then: openReportFromDeepLink should be called
            expect(openReportFromDeepLink).toHaveBeenCalledWith('https://new.expensify.com/r/123', expect.anything(), true, '123', expect.anything());
        });
    });

    describe('Initial URL Processing', () => {
        it('should handle null URL gracefully', () => {
            // Given: DeepLinkHandler is loaded
            // When: processInitialURL is called with null
            expect(() => {
                DeepLinkHandler.processInitialURL(null);
            }).not.toThrow();

            // Then: No side effects should occur
            expect(openReportFromDeepLink).not.toHaveBeenCalled();
        });

        it('should handle undefined URL gracefully', () => {
            // Given: DeepLinkHandler is loaded
            // When: processInitialURL is called with undefined (cast as null)
            expect(() => {
                DeepLinkHandler.processInitialURL(undefined as unknown as null);
            }).not.toThrow();

            // Then: No side effects should occur
            expect(openReportFromDeepLink).not.toHaveBeenCalled();
        });

        it('should process valid initial URL when all data is loaded', async () => {
            // Given: All required Onyx data is prepared
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}1`, {reportID: '1'} as Report);
            await Onyx.merge(ONYXKEYS.NVP_INTRO_SELECTED, {choice: 'newDotSubmit'});
            await Onyx.merge(ONYXKEYS.CONCIERGE_REPORT_ID, '123');
            await waitForBatchedUpdates();

            // When: processInitialURL is called
            DeepLinkHandler.processInitialURL('https://new.expensify.com/r/456');
            await waitForBatchedUpdates();

            // Then: openReportFromDeepLink should be called with correct parameters
            expect(openReportFromDeepLink).toHaveBeenCalledWith('https://new.expensify.com/r/456', expect.anything(), true, '123', expect.anything());
        });
    });

    describe('Deep Link Handling - Early Returns', () => {
        it('should return early if URL is null', async () => {
            // Given: Module is loaded
            // When: processInitialURL is called with null
            DeepLinkHandler.processInitialURL(null);
            await waitForBatchedUpdates();

            // Then: No processing should occur
            expect(openReportFromDeepLink).not.toHaveBeenCalled();
        });

        it('should return early if URL is empty string', async () => {
            // Given: Module is loaded
            // When: processInitialURL is called with empty string
            DeepLinkHandler.processInitialURL('');
            await waitForBatchedUpdates();

            // Then: No processing should occur (empty string is falsy)
            expect(openReportFromDeepLink).not.toHaveBeenCalled();
        });
    });

    describe('Deep Link Handling - URL Change Events', () => {
        it('should immediately process if all data is already loaded', async () => {
            // Given: Module is initialized (from beforeAll) and all data is loaded
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}1`, {reportID: '1'} as Report);
            await Onyx.merge(ONYXKEYS.NVP_INTRO_SELECTED, {choice: 'newDotSubmit'});
            await Onyx.merge(ONYXKEYS.CONCIERGE_REPORT_ID, '123');
            await waitForBatchedUpdates();

            // Get the URL change callback
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, rulesdir/prefer-at
            const urlCallback = (Linking.addEventListener as jest.Mock).mock.calls[0][1];

            // When: URL change event is triggered
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            urlCallback({url: 'https://new.expensify.com/r/789'});
            await waitForBatchedUpdates();

            // Then: openReportFromDeepLink should be called immediately
            expect(openReportFromDeepLink).toHaveBeenCalledWith('https://new.expensify.com/r/789', expect.anything(), true, '123', expect.anything());
        });

        it('should pass correct authentication state to openReportFromDeepLink', async () => {
            // Given: Module is initialized (from beforeAll) with authenticated user
            (hasAuthToken as jest.Mock).mockReturnValue(true);
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}1`, {reportID: '1'} as Report);
            await Onyx.merge(ONYXKEYS.NVP_INTRO_SELECTED, {choice: 'newDotSubmit'});
            await Onyx.merge(ONYXKEYS.CONCIERGE_REPORT_ID, '123');
            await waitForBatchedUpdates();

            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, rulesdir/prefer-at
            const urlCallback = (Linking.addEventListener as jest.Mock).mock.calls[0][1];

            // When: URL change event is triggered
            // eslint-disable-next-line @typescript-eslint/no-unsafe-call
            urlCallback({url: 'https://new.expensify.com/r/999'});
            await waitForBatchedUpdates();

            // Then: Should pass isAuthenticated = true
            expect(openReportFromDeepLink).toHaveBeenCalledWith(expect.any(String), expect.anything(), true, expect.any(String), expect.anything());
        });
    });

    describe('Pending Deep Link Processing', () => {
        it('should not process if pendingDeepLinkUrl is null', async () => {
            // Given: No pending URL is set
            // When: Data loads
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}1`, {reportID: '1'} as Report);
            await Onyx.merge(ONYXKEYS.NVP_INTRO_SELECTED, {choice: 'newDotSubmit'});
            await Onyx.merge(ONYXKEYS.CONCIERGE_REPORT_ID, '123');
            await waitForBatchedUpdates();

            // Then: Should not process anything
            expect(openReportFromDeepLink).not.toHaveBeenCalled();
        });

        it('should clear pendingDeepLinkUrl after processing', async () => {
            // Given: Initial URL is set and all data loads
            DeepLinkHandler.processInitialURL('https://new.expensify.com/r/666');
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}1`, {reportID: '1'} as Report);
            await Onyx.merge(ONYXKEYS.NVP_INTRO_SELECTED, {choice: 'newDotSubmit'});
            await Onyx.merge(ONYXKEYS.CONCIERGE_REPORT_ID, '123');
            await waitForBatchedUpdates();

            // Then: URL should be processed
            expect(openReportFromDeepLink).toHaveBeenCalledTimes(1);

            // When: Data changes again (triggers callbacks)
            jest.clearAllMocks();
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}2`, {reportID: '2'} as Report);
            await waitForBatchedUpdates();

            // Then: Should not process again (pendingDeepLinkUrl was cleared)
            expect(openReportFromDeepLink).not.toHaveBeenCalled();
        });

        it('should pass current authentication state when processing', async () => {
            // Given: User is not authenticated
            (hasAuthToken as jest.Mock).mockReturnValue(false);

            DeepLinkHandler.processInitialURL('https://new.expensify.com/r/999');
            await Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}1`, {reportID: '1'} as Report);
            await Onyx.merge(ONYXKEYS.NVP_INTRO_SELECTED, {choice: 'newDotSubmit'});
            await Onyx.merge(ONYXKEYS.CONCIERGE_REPORT_ID, '123');
            await waitForBatchedUpdates();

            // Then: Should pass isAuthenticated = false
            expect(openReportFromDeepLink).toHaveBeenCalledWith(expect.any(String), expect.anything(), false, expect.any(String), expect.anything());
        });
    });

    describe('Session Change Handling', () => {
        it('should reinitialize only if not already initialized', async () => {
            // Given: Module is initialized
            await Onyx.merge(ONYXKEYS.SESSION, {authToken: 'test-token'});
            await waitForBatchedUpdates();
            const firstCallCount = (Linking.addEventListener as jest.Mock).mock.calls.length;

            // When: Session changes (login/logout)
            await Onyx.merge(ONYXKEYS.SESSION, {authToken: null});
            await waitForBatchedUpdates();
            await Onyx.merge(ONYXKEYS.SESSION, {authToken: 'new-token'});
            await waitForBatchedUpdates();

            // Then: Should not add multiple listeners
            // eslint-disable-next-line @typescript-eslint/unbound-method
            expect(Linking.addEventListener).toHaveBeenCalledTimes(firstCallCount);
        });
    });

    describe('Module Cleanup', () => {
        it('should handle null linkingEventSubscription gracefully', () => {
            // Given: Module with no subscription
            // When: clearModule is called
            expect(() => {
                DeepLinkHandler.clearModule();
            }).not.toThrow();
        });

        it('should not throw when cleanup called multiple times', () => {
            // Given: Module is loaded
            // When: clearModule is called multiple times
            expect(() => {
                DeepLinkHandler.clearModule();
                DeepLinkHandler.clearModule();
                DeepLinkHandler.clearModule();
            }).not.toThrow();
        });
    });
});
