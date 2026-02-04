import '@testing-library/react-native';
import Onyx from 'react-native-onyx';
import Pusher from '@libs/Pusher';

jest.useRealTimers();

// Clean up after each test to prevent memory leaks
afterEach(async () => {
    // Clear Onyx storage to prevent data accumulation across tests
    await Onyx.clear();

    // Disconnect Pusher to clean up WebSocket connections and event listeners
    // This prevents memory leaks from Pusher connections created in setupApp()
    try {
        Pusher.disconnect();
    } catch (error) {
        // Ignore errors if Pusher is not initialized or already disconnected
    }
});
