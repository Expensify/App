import '@testing-library/react-native';
import {Keyboard} from 'react-native';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';

jest.useRealTimers();

// Patch Keyboard.addListener to return a subscription object with .remove() so that
// @react-navigation/bottom-tabs useIsKeyboardShown hook doesn't crash on cleanup.
if (Keyboard && typeof Keyboard.addListener === 'function') {
    const originalAddListener = Keyboard.addListener.bind(Keyboard);
    Keyboard.addListener = ((event: string, callback: () => void) => {
        const subscription = originalAddListener(event, callback);
        if (!subscription || typeof subscription.remove !== 'function') {
            return {remove: jest.fn()};
        }
        return subscription;
    }) as typeof Keyboard.addListener;
}

// Auto-initialize Onyx for tests.
// Tests that already call Onyx.init() in their own beforeAll will safely re-configure Onyx —
// the second init() just re-runs initStoreValues and re-resolves the already-resolved deferred task.
beforeAll(() => {
    Onyx.init({keys: ONYXKEYS});
});
