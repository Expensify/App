import '@testing-library/react-native';
import type * as enModule from '@src/languages/en';
import type * as flattenObjectModule from '@src/languages/flattenObject';
import type * as IntlStoreModule from '@src/languages/IntlStore';
import ONYXKEYS from '@src/ONYXKEYS';

import type {KeyboardEventName} from 'react-native';

import {Keyboard} from 'react-native';
import Onyx from 'react-native-onyx';

import mockUseSingleExecution from '../tests/utils/mockUseSingleExecution';

jest.useRealTimers();

jest.mock('@hooks/useAIFeaturesPromoModal', () => ({
    __esModule: true,
    default: jest.fn(),
}));

// The real hook relies on real navigation transitions to settle `isExecuting` (see
// `runAfterPredictedTransition`/`TransitionTracker`), which don't happen in unit tests and would
// otherwise leave buttons stuck disabled. Mocked globally so no test needs to import the navigation
// listener machinery just because it renders a Pressable-based component (Button, MenuItem, etc.).
jest.mock('@hooks/useSingleExecution', () => ({
    __esModule: true,
    default: mockUseSingleExecution,
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
 * - Onyx.init: safe to re-init if a test does it too (second call re-resolves the deferred task).
 * - IntlStore.seedForTests('en'): `translate()` works pre-load. Lazy-required so a top-level import doesn't freeze `CONFIG` before env-toggle tests can override it.
 */
beforeAll(() => {
    Onyx.init({keys: ONYXKEYS});
    const IntlStore = jest.requireActual<typeof IntlStoreModule>('@src/languages/IntlStore').default;
    const enTranslations = jest.requireActual<typeof enModule>('@src/languages/en').default;
    const flattenObject = jest.requireActual<typeof flattenObjectModule>('@src/languages/flattenObject').default;
    IntlStore.seedForTests('en', flattenObject(enTranslations));
});
