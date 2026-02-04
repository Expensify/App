import '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import Pusher from '@libs/Pusher';

jest.useRealTimers();

// Clean up after all tests finish to prevent memory leaks
// Note: We use afterAll instead of afterEach because:
// 1. Tests use beforeEach to clear Onyx at the start, not afterEach
// 2. Clearing Onyx after each test can interfere with async operations
// 3. Pusher connections can persist across tests in the same suite
afterAll(async () => {
    // Clear Onyx storage to prevent data accumulation across test suites
    await Onyx.clear();

    // Disconnect Pusher to clean up WebSocket connections and event listeners
    // This prevents memory leaks from Pusher connections created in setupApp()
    try {
        Pusher.disconnect();
    } catch (error) {
        // Ignore errors if Pusher is not initialized or already disconnected
    }
});
