import {renderHook} from '@testing-library/react-native';

import useRequire2FAOverlayVisibility, {getRequire2FAFocusedScreen, REQUIRE_2FA_FOCUSED_SCREEN} from '@hooks/useRequire2FAOverlayVisibility';

import NAVIGATORS from '@src/NAVIGATORS';
import SCREENS from '@src/SCREENS';

import type {NavigationState} from '@react-navigation/native';

let mockRootState: NavigationState | undefined;
let mockShouldShowRequire2FAPage = true;
const mockGetState = jest.fn<NavigationState | undefined, []>();

jest.mock('@react-navigation/core', () => {
    // jest.requireActual is typed as any.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const actual = jest.requireActual('@react-navigation/core');

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...actual,
        useNavigation: () => ({
            getState: mockGetState,
        }),
    };
});

jest.mock('@hooks/useShouldShowRequire2FAPage', () => ({
    __esModule: true,
    default: () => mockShouldShowRequire2FAPage,
}));

jest.mock('@hooks/useRootNavigationState', () => ({
    __esModule: true,
    default: (selector: (state: NavigationState | undefined) => number) => selector(mockRootState),
}));

function navigationState(screenName: string): NavigationState {
    return {
        key: 'root',
        index: 0,
        routeNames: [screenName],
        routes: [{key: `${screenName}-key`, name: screenName}],
        type: 'stack',
        stale: false,
    };
}

describe('getRequire2FAFocusedScreen', () => {
    it('classifies a 2FA setup screen', () => {
        // Given the focused route is the 2FA setup screen the overlay opens.
        const screenName = SCREENS.TWO_FACTOR_AUTH.DYNAMIC_ROOT;

        // When the focused screen is classified.
        const focusedScreen = getRequire2FAFocusedScreen(screenName);

        // Then it is setup, so the overlay can hide and stop covering the flow it opened.
        expect(focusedScreen).toBe(REQUIRE_2FA_FOCUSED_SCREEN.TWO_FACTOR_SETUP);
    });

    it('classifies test tools screens', () => {
        // Given the focused route is a test-tools screen rather than setup.
        const screenNames = [SCREENS.TEST_TOOLS_MODAL.ROOT, SCREENS.TEST_TOOLS_MODAL.SERVER, NAVIGATORS.TEST_TOOLS_MODAL_NAVIGATOR];

        // When each of those routes is classified.
        const focusedScreens = screenNames.map((screenName) => getRequire2FAFocusedScreen(screenName));

        // Then they stay distinct from setup, so the overlay can remain up while the tools are open.
        expect(focusedScreens).toEqual([REQUIRE_2FA_FOCUSED_SCREEN.TEST_TOOLS, REQUIRE_2FA_FOCUSED_SCREEN.TEST_TOOLS, REQUIRE_2FA_FOCUSED_SCREEN.TEST_TOOLS]);
    });

    it('classifies every other screen as other', () => {
        // Given a route that is neither setup nor test tools, including a missing route.
        const screenNames = [SCREENS.TWO_FACTOR_AUTH.ENABLED, undefined];

        // When those routes are classified.
        const focusedScreens = screenNames.map((screenName) => getRequire2FAFocusedScreen(screenName));

        // Then they are normal screens, so the overlay follows the required-2FA flag alone.
        expect(focusedScreens).toEqual([REQUIRE_2FA_FOCUSED_SCREEN.OTHER, REQUIRE_2FA_FOCUSED_SCREEN.OTHER]);
    });
});

describe('useRequire2FAOverlayVisibility', () => {
    beforeEach(() => {
        mockRootState = undefined;
        mockShouldShowRequire2FAPage = true;
        mockGetState.mockReset();
        mockGetState.mockReturnValue(undefined);
    });

    it('shows the overlay when required 2FA is on and the user is not in setup', () => {
        // Given required 2FA is on and the user is on Home, not in setup.
        mockRootState = navigationState(SCREENS.HOME);

        // When the visibility hook runs.
        const {result} = renderHook(() => useRequire2FAOverlayVisibility());

        // Then the overlay shows, because the user still has to enable 2FA.
        expect(result.current.isRequire2FAOverlayVisible).toBe(true);
        expect(result.current.isTestToolsRouteFocused).toBe(false);
    });

    it('hides the overlay during 2FA setup', () => {
        // Given the user is on the 2FA setup screen the overlay opened.
        mockRootState = navigationState(SCREENS.TWO_FACTOR_AUTH.DYNAMIC_ROOT);

        // When the visibility hook runs.
        const {result} = renderHook(() => useRequire2FAOverlayVisibility());

        // Then the overlay hides, so it does not cover that setup flow.
        expect(result.current.isRequire2FAOverlayVisible).toBe(false);
        expect(result.current.isTestToolsRouteFocused).toBe(false);
    });

    it('hides the overlay when required 2FA is off', () => {
        // Given required 2FA is turned off.
        mockShouldShowRequire2FAPage = false;
        mockRootState = navigationState(SCREENS.HOME);

        // When the visibility hook runs.
        const {result} = renderHook(() => useRequire2FAOverlayVisibility());

        // Then the overlay hides, because there is nothing left to block.
        expect(result.current.isRequire2FAOverlayVisible).toBe(false);
    });

    it('keeps the overlay visible while test tools are focused', () => {
        // Given required 2FA is on and test tools are the focused screen.
        mockRootState = navigationState(SCREENS.TEST_TOOLS_MODAL.ROOT);

        // When the visibility hook runs.
        const {result} = renderHook(() => useRequire2FAOverlayVisibility());

        // Then the overlay stays visible, so closing the tools returns to the 2FA screen instead of the app.
        expect(result.current.isRequire2FAOverlayVisible).toBe(true);
        expect(result.current.isTestToolsRouteFocused).toBe(true);
    });

    it('falls back to the navigation hook when root state is missing', () => {
        // Given the root navigation state is missing and the navigation hook still reports test tools.
        mockGetState.mockReturnValue(navigationState(SCREENS.TEST_TOOLS_MODAL.SERVER));

        // When the visibility hook runs.
        const {result} = renderHook(() => useRequire2FAOverlayVisibility());

        // Then it uses that hook, so the overlay does not flicker off before the root state is ready.
        expect(result.current.isTestToolsRouteFocused).toBe(true);
        expect(result.current.isRequire2FAOverlayVisible).toBe(true);
    });
});
