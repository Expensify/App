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
        expect(getRequire2FAFocusedScreen(SCREENS.TWO_FACTOR_AUTH.DYNAMIC_ROOT)).toBe(REQUIRE_2FA_FOCUSED_SCREEN.TWO_FACTOR_SETUP);
    });

    it('classifies test tools screens', () => {
        expect(getRequire2FAFocusedScreen(SCREENS.TEST_TOOLS_MODAL.ROOT)).toBe(REQUIRE_2FA_FOCUSED_SCREEN.TEST_TOOLS);
        expect(getRequire2FAFocusedScreen(SCREENS.TEST_TOOLS_MODAL.SERVER)).toBe(REQUIRE_2FA_FOCUSED_SCREEN.TEST_TOOLS);
        expect(getRequire2FAFocusedScreen(NAVIGATORS.TEST_TOOLS_MODAL_NAVIGATOR)).toBe(REQUIRE_2FA_FOCUSED_SCREEN.TEST_TOOLS);
    });

    it('classifies every other screen as other', () => {
        expect(getRequire2FAFocusedScreen(SCREENS.TWO_FACTOR_AUTH.ENABLED)).toBe(REQUIRE_2FA_FOCUSED_SCREEN.OTHER);
        expect(getRequire2FAFocusedScreen(undefined)).toBe(REQUIRE_2FA_FOCUSED_SCREEN.OTHER);
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
        mockRootState = navigationState(SCREENS.HOME);

        const {result} = renderHook(() => useRequire2FAOverlayVisibility());

        expect(result.current.isRequire2FAOverlayVisible).toBe(true);
        expect(result.current.isTestToolsRouteFocused).toBe(false);
    });

    it('hides the overlay during 2FA setup', () => {
        mockRootState = navigationState(SCREENS.TWO_FACTOR_AUTH.DYNAMIC_ROOT);

        const {result} = renderHook(() => useRequire2FAOverlayVisibility());

        expect(result.current.isRequire2FAOverlayVisible).toBe(false);
        expect(result.current.isTestToolsRouteFocused).toBe(false);
    });

    it('hides the overlay when required 2FA is off', () => {
        mockShouldShowRequire2FAPage = false;
        mockRootState = navigationState(SCREENS.HOME);

        const {result} = renderHook(() => useRequire2FAOverlayVisibility());

        expect(result.current.isRequire2FAOverlayVisible).toBe(false);
    });

    it('keeps the overlay visible while test tools are focused', () => {
        mockRootState = navigationState(SCREENS.TEST_TOOLS_MODAL.ROOT);

        const {result} = renderHook(() => useRequire2FAOverlayVisibility());

        expect(result.current.isRequire2FAOverlayVisible).toBe(true);
        expect(result.current.isTestToolsRouteFocused).toBe(true);
    });

    it('falls back to the navigation hook when root state is missing', () => {
        mockGetState.mockReturnValue(navigationState(SCREENS.TEST_TOOLS_MODAL.SERVER));

        const {result} = renderHook(() => useRequire2FAOverlayVisibility());

        expect(result.current.isTestToolsRouteFocused).toBe(true);
        expect(result.current.isRequire2FAOverlayVisible).toBe(true);
    });
});
