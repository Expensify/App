import '@testing-library/react-native';
import type {KeyboardEventName} from 'react-native';
import {Keyboard} from 'react-native';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '@src/ONYXKEYS';

jest.useRealTimers();

// Patch Keyboard.addListener to return a subscription object with .remove() so that
// @react-navigation/bottom-tabs useIsKeyboardShown hook doesn't crash on cleanup.
if (Keyboard && typeof Keyboard.addListener === 'function') {
    const originalAddListener = Keyboard.addListener.bind(Keyboard);
    Keyboard.addListener = ((event: KeyboardEventName, callback: () => void) => {
        const subscription = originalAddListener(event, callback);
        if (!subscription || typeof subscription.remove !== 'function') {
            return {remove: jest.fn()};
        }
        return subscription;
    }) as typeof Keyboard.addListener;
}

// This mock must live in setupAfterEnv (not setupFiles) because @shopify/flash-list/jestSetup,
// imported in setup.ts, registers its own measureLayout mock. Placing ours here ensures it
// runs after FlashList's setup and takes precedence.
jest.mock(
    '@shopify/flash-list/dist/recyclerview/utils/measureLayout',
    () =>
        ({
            ...jest.requireActual('@shopify/flash-list/dist/recyclerview/utils/measureLayout'),
            measureParentSize: jest.fn().mockImplementation(() => ({
                x: 0,
                y: 0,
                width: 300,
                height: 400,
            })),
            measureFirstChildLayout: jest.fn().mockImplementation(() => ({
                x: 0,
                y: 0,
                width: 300,
                height: 400,
            })),
            measureItemLayout: jest.fn().mockImplementation(() => ({
                x: 0,
                y: 0,
                width: 300,
                height: 75,
            })),
        }) as Record<string, unknown>,
);

// Auto-initialize Onyx for tests.
// Tests that already call Onyx.init() in their own beforeAll will safely re-configure Onyx —
// the second init() just re-runs initStoreValues and re-resolves the already-resolved deferred task.
beforeAll(() => {
    Onyx.init({keys: ONYXKEYS});
});
