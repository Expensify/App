import type {PlatformStackScreenProps} from '@libs/Navigation/PlatformStackNavigation/types';
import type {MoneyRequestNavigatorParamList} from '@libs/Navigation/types';

import type SCREENS from '@src/SCREENS';

type ConfirmationRouteName = typeof SCREENS.MONEY_REQUEST.STEP_CONFIRMATION | typeof SCREENS.MONEY_REQUEST.CREATE;

type ConfirmationScreenNavigation = PlatformStackScreenProps<MoneyRequestNavigatorParamList, ConfirmationRouteName>['navigation'];

type MockScreenNavigation = {
    /** Stub to hand to the screen's `navigation` prop. Only the APIs the confirmation step actually calls are backed. */
    navigation: ConfirmationScreenNavigation;

    /** Replays the refocus the screen gets when the user returns to it from another RHP. */
    emitScreenFocus: () => void;

    /** Drops every recorded listener, so a test file can reset between renders. */
    resetScreenFocusListeners: () => void;
};

/**
 * Builds the `navigation` stub the money request confirmation tests hand to the screen.
 *
 * These tests render the page outside a navigator, so the real navigation prop isn't available. Recording the 'focus'
 * subscriptions lets a test replay the refocus that happens on returning from another RHP. The cast lives here rather
 * than at every render site, so the stub can grow a new API in one place when the page starts calling one.
 */
function createMockScreenNavigation(): MockScreenNavigation {
    const focusListeners: Array<() => void> = [];

    // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- test-only navigation stub. The single assertion lives here so no render site needs one.
    const navigation = {
        addListener: jest.fn((event: string, callback: () => void) => {
            if (event !== 'focus') {
                return () => {};
            }
            focusListeners.push(callback);
            return () => {
                const index = focusListeners.indexOf(callback);
                if (index === -1) {
                    return;
                }
                focusListeners.splice(index, 1);
            };
        }),
        setParams: jest.fn(),
    } as unknown as ConfirmationScreenNavigation;

    return {
        navigation,
        emitScreenFocus: () => {
            for (const callback of [...focusListeners]) {
                callback();
            }
        },
        resetScreenFocusListeners: () => {
            focusListeners.length = 0;
        },
    };
}

export default createMockScreenNavigation;
