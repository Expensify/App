import {getDeepestFocusedScreen, isTwoFactorSetupScreen} from '@libs/Navigation/Navigation';

import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

import {useNavigation} from '@react-navigation/core';

import useRootNavigationState from './useRootNavigationState';
import useShouldShowRequire2FAPage from './useShouldShowRequire2FAPage';

/**
 * Portal host rendered above the required-2FA overlay.
 * Test tools render here only while that overlay is covering the root stack.
 */
const REQUIRE_2FA_ABOVE_PORTAL_HOST = 'require2FAAbove';

const REQUIRE_2FA_FOCUSED_SCREEN = {
    OTHER: 0,
    TWO_FACTOR_SETUP: 1,
    TEST_TOOLS: 2,
} as const;

type Require2FAFocusedScreen = (typeof REQUIRE_2FA_FOCUSED_SCREEN)[keyof typeof REQUIRE_2FA_FOCUSED_SCREEN];

const TEST_TOOLS_SCREENS = new Set<string>([NAVIGATORS.TEST_TOOLS_MODAL_NAVIGATOR, SCREENS.TEST_TOOLS_MODAL.ROOT, SCREENS.TEST_TOOLS_MODAL.SERVER]);

/**
 * Classifies the focused screen for the required-2FA overlay.
 * Returns a primitive so navigation listeners can skip unchanged values.
 */
function getRequire2FAFocusedScreen(screenName: string | undefined): Require2FAFocusedScreen {
    if (isTwoFactorSetupScreen(screenName)) {
        return REQUIRE_2FA_FOCUSED_SCREEN.TWO_FACTOR_SETUP;
    }
    if (screenName && TEST_TOOLS_SCREENS.has(screenName)) {
        return REQUIRE_2FA_FOCUSED_SCREEN.TEST_TOOLS;
    }
    return REQUIRE_2FA_FOCUSED_SCREEN.OTHER;
}

type Require2FAOverlayVisibility = {
    /** The blocking required-2FA screen is mounted over the app. */
    isRequire2FAOverlayVisible: boolean;
    /** Test tools are the focused route, so they must sit above the overlay and take input. */
    isTestToolsRouteFocused: boolean;
};

/**
 * Shared by the required-2FA overlay and the test-tools navigator.
 * Test tools move above the overlay only while the overlay is covering the root stack.
 */
function useRequire2FAOverlayVisibility(): Require2FAOverlayVisibility {
    const navigation = useNavigation();
    const shouldShowRequire2FAPage = useShouldShowRequire2FAPage();
    const focusedScreen = useRootNavigationState((state) => {
        // When navigation is not ready yet, use the navigation state from the navigation hook.
        const screenName = getDeepestFocusedScreen(state ?? navigation.getState())?.name;
        return getRequire2FAFocusedScreen(screenName);
    });

    return {
        isRequire2FAOverlayVisible: shouldShowRequire2FAPage && focusedScreen !== REQUIRE_2FA_FOCUSED_SCREEN.TWO_FACTOR_SETUP,
        isTestToolsRouteFocused: focusedScreen === REQUIRE_2FA_FOCUSED_SCREEN.TEST_TOOLS,
    };
}

export default useRequire2FAOverlayVisibility;
export {REQUIRE_2FA_ABOVE_PORTAL_HOST, REQUIRE_2FA_FOCUSED_SCREEN, getRequire2FAFocusedScreen};
export type {Require2FAFocusedScreen};
