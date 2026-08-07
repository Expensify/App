import '@testing-library/react-native';
import IntlStore from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';

import type {KeyboardEventName} from 'react-native';

import {Keyboard} from 'react-native';
import Onyx from 'react-native-onyx';

jest.useRealTimers();

jest.mock('@hooks/useAIFeaturesPromoModal', () => ({
    __esModule: true,
    default: jest.fn(),
}));

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

/**
 * Test-time bootstrap for every suite:
 * - Onyx.init: safe to re-init if a test does it again (second call re-runs initStoreValues + re-resolves the deferred task).
 * - IntlStore.load('en'): seeds the translations cache so `translate()` returns real strings for tests that render before their own load resolves.
 */
beforeAll(async () => {
    Onyx.init({keys: ONYXKEYS});
    await IntlStore.load('en');
});
