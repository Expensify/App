// The jest.mock factories below construct React elements and read props off untyped mock values,
// so the unsafe-* rules fire on intentional test wiring rather than real type problems.
/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
import {render, screen, within} from '@testing-library/react-native';

import {REQUIRE_2FA_ABOVE_PORTAL_HOST} from '@hooks/useRequire2FAOverlayVisibility';

import TestToolsModalNavigator from '@libs/Navigation/AppNavigator/Navigators/TestToolsModalNavigator';

import RequireTwoFactorAuthenticationOverlay from '@pages/RequireTwoFactorAuthenticationOverlay';

import React from 'react';
import {Platform} from 'react-native';

type Visibility = {
    isRequire2FAOverlayVisible: boolean;
    isTestToolsRouteFocused: boolean;
};

let mockVisibility: Visibility = {
    isRequire2FAOverlayVisible: true,
    isTestToolsRouteFocused: false,
};
let mockIsOffline = true;
let mockShouldUseNarrowLayout = true;
let testToolsStackMountCount = 0;

jest.mock('@hooks/useRequire2FAOverlayVisibility', () => ({
    __esModule: true,
    REQUIRE_2FA_ABOVE_PORTAL_HOST: 'require2FAAbove',
    default: () => mockVisibility,
}));

jest.mock('@hooks/useNetwork', () => ({
    __esModule: true,
    default: () => ({isOffline: mockIsOffline}),
}));

jest.mock('@hooks/useBottomSafeSafeAreaPaddingStyle', () => ({
    __esModule: true,
    default: () => ({paddingBottom: 34}),
}));

jest.mock('@hooks/useOnyx', () => ({
    __esModule: true,
    default: () => [undefined, {status: 'loaded'}],
}));

jest.mock('@hooks/useSignOut', () => ({
    __esModule: true,
    default: () => ({
        signOut: jest.fn(() => Promise.resolve()),
        leaveDelegateAccount: jest.fn(() => Promise.resolve()),
        isActingAsDelegate: false,
        isTrackingGPS: false,
    }),
}));

jest.mock('@hooks/useLocalize', () => ({
    __esModule: true,
    default: () => ({
        translate: (key: string) => (key === 'common.youAppearToBeOffline' ? 'You appear to be offline.' : key),
        localeCompare: (a: string, b: string) => a.localeCompare(b),
    }),
}));

jest.mock('@hooks/useTheme', () => ({
    __esModule: true,
    default: () => ({icon: '#000', overlay: '#000000'}),
}));

jest.mock('@hooks/useThemeStyles', () => ({
    __esModule: true,
    default: () =>
        new Proxy(
            {},
            {
                get: (_target, prop) => {
                    if (prop === 'getTestToolsNavigatorOuterView' || prop === 'getTestToolsNavigatorInnerView') {
                        return () => ({});
                    }
                    return {};
                },
            },
        ),
}));

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyIllustrations: () => ({Encryption: 'encryption'}),
    useMemoizedLazyExpensifyIcons: () => ({OfflineCloud: 'offline'}),
}));

jest.mock('@hooks/useTwoFactorAuthRoute', () => ({
    __esModule: true,
    default: () => ({getTwoFactorAuthRoute: jest.fn(() => '/settings/security/two-factor-auth')}),
}));

jest.mock('@hooks/useKeyboardShortcut', () => ({
    __esModule: true,
    default: () => {},
}));

jest.mock('@hooks/useResponsiveLayout', () => ({
    __esModule: true,
    default: () => ({shouldUseNarrowLayout: mockShouldUseNarrowLayout}),
}));

jest.mock('@hooks/useSafeAreaInsets', () => ({
    __esModule: true,
    default: () => ({top: 0, right: 0, bottom: 0, left: 0}),
}));

// Jest resolves the iOS helper, which never lifts. This follows Platform.OS at call time so one suite can cover web and Android too.
jest.mock('@libs/Navigation/helpers/shouldLiftTestToolsAboveRequire2FA', () => {
    const {Platform: RNPlatform} = require('react-native');

    return {
        __esModule: true,
        default: (isRequire2FAOverlayVisible: boolean) => isRequire2FAOverlayVisible && RNPlatform.OS !== 'ios',
    };
});

jest.mock('@hooks/useIsAuthenticated', () => ({
    __esModule: true,
    default: () => true,
}));

jest.mock('@libs/Navigation/Navigation', () => ({
    __esModule: true,
    default: {
        getActiveRoute: () => '/home',
        navigate: jest.fn(),
    },
}));

jest.mock('@userActions/Welcome', () => ({
    updateOnboardingLastVisitedPath: jest.fn(),
}));

jest.mock('@userActions/Welcome/OnboardingFlow', () => ({
    buildOnboardingFlowParams: jest.fn(() => ({})),
    getRequired2FAOnboardingResumePath: jest.fn(() => ''),
}));

jest.mock('@userActions/TestTool', () => ({
    __esModule: true,
    default: jest.fn(),
}));

jest.mock('@components/FocusTrap/FocusTrapForModal', () => {
    const ReactActual = require('react');
    const {View} = require('react-native');

    return {
        __esModule: true,
        default: ({active, children}: {active?: boolean; children: React.ReactNode}) =>
            ReactActual.createElement(View, {testID: active ? 'focus-trap-active' : 'focus-trap-inactive'}, children),
    };
});

jest.mock('@components/FocusTrap/FocusTrapForScreen', () => {
    return {
        __esModule: true,
        default: ({children}: {children: React.ReactNode}) => children,
    };
});

jest.mock('@components/Icon', () => {
    const ReactActual = require('react');
    const {View} = require('react-native');

    return {
        __esModule: true,
        default: () => ReactActual.createElement(View),
    };
});

jest.mock('@components/Button/primitives/ButtonKeyboardShortcut', () => {
    const ReactActual = require('react');
    const {View} = require('react-native');

    return {
        __esModule: true,
        default: () => ReactActual.createElement(View, {testID: 'enable-2fa-enter-shortcut'}),
    };
});

let mockFocusedRouteName = 'TestToolsModal_Root';

jest.mock('@gorhom/portal', () => {
    const ReactActual = require('react');
    const {View} = require('react-native');
    const {NavigationContext, NavigationRouteContext} = require('@react-navigation/native');
    const {CardAnimationContext} = require('@react-navigation/stack');

    // A real portal renders at the host, outside the screen's providers. Drop those contexts so the test fails unless the screen puts them back.
    return {
        Portal: ({hostName, children}: {hostName: string; children: React.ReactNode}) =>
            ReactActual.createElement(
                View,
                {testID: `portal-${hostName}`},
                ReactActual.createElement(
                    CardAnimationContext.Provider,
                    {value: undefined},
                    ReactActual.createElement(NavigationContext.Provider, {value: undefined}, ReactActual.createElement(NavigationRouteContext.Provider, {value: undefined}, children)),
                ),
            ),
        PortalHost: () => null,
    };
});

jest.mock('@libs/Navigation/PlatformStackNavigation/createPlatformStackNavigator', () => {
    const ReactActual = require('react');
    const {View} = require('react-native');
    const {NavigationContext, NavigationRouteContext} = require('@react-navigation/native');

    function Navigator({children}: {children: React.ReactNode}) {
        ReactActual.useEffect(() => {
            testToolsStackMountCount += 1;
        }, []);
        return ReactActual.createElement(View, {testID: 'test-tools-stack'}, children);
    }

    function Screen({name, component: Component}: {name: string; component: React.ComponentType<{route: {key: string; name: string}; navigation: {isFocused: () => boolean}}>}) {
        const navigation = {
            isFocused: () => name === mockFocusedRouteName,
            addListener: () => () => {},
        };
        const route = {key: `${name}-key`, name};
        return ReactActual.createElement(
            NavigationContext.Provider,
            {value: navigation},
            ReactActual.createElement(NavigationRouteContext.Provider, {value: route}, ReactActual.createElement(Component, {route, navigation})),
        );
    }

    return {
        __esModule: true,
        default: () => ({Navigator, Screen}),
    };
});

jest.mock('@components/TestToolsModalPage', () => {
    const ReactActual = require('react');
    const {Text} = require('react-native');
    const {useRoute} = require('@react-navigation/native');

    return function MockTestToolsModalPage() {
        const route = useRoute();
        return ReactActual.createElement(Text, {testID: 'test-tools-page'}, route.name);
    };
});

jest.mock('@components/TestToolsServerPage', () => {
    const ReactActual = require('react');
    const {Text} = require('react-native');
    const {useRoute} = require('@react-navigation/native');

    return function MockTestToolsServerPage() {
        const route = useRoute();
        return ReactActual.createElement(Text, {testID: 'test-tools-server-page'}, route.name);
    };
});

describe('RequireTwoFactorAuthenticationOverlay stacking', () => {
    beforeEach(() => {
        mockVisibility = {
            isRequire2FAOverlayVisible: true,
            isTestToolsRouteFocused: false,
        };
        mockIsOffline = true;
        mockShouldUseNarrowLayout = true;
    });

    it('shows the offline banner inside the overlay on a narrow screen and opens test tools from a four-finger tap', () => {
        // Given required 2FA is visible on a phone and the user is offline. The overlay covers the ScreenWrapper banner and its four-finger handler.

        // When the overlay renders its own banner in the column, and the user taps with four fingers.
        render(<RequireTwoFactorAuthenticationOverlay />);

        // Then the banner is visible without covering the buttons, and the overlay itself handles the four-finger tap.
        const overlay = screen.getByTestId('RequireTwoFactorAuthenticationOverlay');
        expect(overlay).toBeOnTheScreen();
        expect(within(overlay).getByTestId('RequireTwoFactorOfflineBanner')).toBeOnTheScreen();
        expect(within(overlay).getByText('You appear to be offline.')).toBeOnTheScreen();
        const fourTouches = {nativeEvent: {touches: [{}, {}, {}, {}]}, touchHistory: {numberActiveTouches: 4}};
        const oneTouch = {nativeEvent: {touches: [{}]}, touchHistory: {numberActiveTouches: 1}};
        expect(overlay.props.onStartShouldSetResponderCapture(fourTouches)).toBe(true);
        expect(overlay.props.onStartShouldSetResponderCapture(oneTouch)).toBe(false);
        overlay.props.onResponderRelease({touchHistory: {numberActiveTouches: 0}});
        expect(jest.requireMock<{default: jest.Mock}>('@userActions/TestTool').default).toHaveBeenCalledTimes(1);
        expect(screen.getByTestId('focus-trap-active')).toBeOnTheScreen();
        expect(screen.getByTestId('enable-2fa-enter-shortcut')).toBeOnTheScreen();
    });

    it('hides the offline banner on a wide layout', () => {
        // Given required 2FA is visible on a wide screen, where ScreenWrapper does not show an offline indicator.
        mockShouldUseNarrowLayout = false;

        // When the overlay renders.
        render(<RequireTwoFactorAuthenticationOverlay />);

        // Then it does not add a full-width banner of its own.
        expect(screen.getByTestId('RequireTwoFactorAuthenticationOverlay')).toBeOnTheScreen();
        expect(screen.queryByTestId('RequireTwoFactorOfflineBanner')).toBeNull();
    });

    it('hides the banner when the overlay is not showing', () => {
        // Given required 2FA is not showing, so the ScreenWrapper banner is visible again.
        mockVisibility = {
            isRequire2FAOverlayVisible: false,
            isTestToolsRouteFocused: false,
        };

        // When the overlay decides whether to render.
        render(<RequireTwoFactorAuthenticationOverlay />);

        // Then there is no second banner, because the two would stack.
        expect(screen.queryByText('You appear to be offline.')).toBeNull();
        expect(screen.queryByTestId('RequireTwoFactorAuthenticationOverlay')).toBeNull();
    });

    it('hides the banner while online', () => {
        // Given required 2FA is visible but the user is online.
        mockIsOffline = false;

        // When the overlay renders.
        render(<RequireTwoFactorAuthenticationOverlay />);

        // Then the extra banner stays hidden, because there is no offline state to show.
        expect(screen.getByTestId('RequireTwoFactorAuthenticationOverlay')).toBeOnTheScreen();
        expect(screen.queryByText('You appear to be offline.')).toBeNull();
    });

    it('turns the web focus trap off while test tools are focused', () => {
        // Given test tools are focused on top of the required-2FA overlay.
        mockVisibility = {
            isRequire2FAOverlayVisible: true,
            isTestToolsRouteFocused: true,
        };

        // When the overlay renders.
        render(<RequireTwoFactorAuthenticationOverlay />);

        // Then the web focus trap turns off, so keyboard focus can reach the tools, and Enter no longer starts 2FA setup.
        expect(screen.getByTestId('RequireTwoFactorAuthenticationOverlay')).toBeOnTheScreen();
        expect(screen.getByTestId('focus-trap-inactive')).toBeOnTheScreen();
        expect(screen.queryByTestId('focus-trap-active')).toBeNull();
        expect(screen.queryByTestId('enable-2fa-enter-shortcut')).toBeNull();
    });
});

describe('TestToolsModalNavigator portal', () => {
    const originalOS = Platform.OS;

    beforeEach(() => {
        mockVisibility = {
            isRequire2FAOverlayVisible: false,
            isTestToolsRouteFocused: false,
        };
        mockFocusedRouteName = 'TestToolsModal_Root';
        mockShouldUseNarrowLayout = true;
        testToolsStackMountCount = 0;
        Platform.OS = originalOS;
    });

    afterEach(() => {
        Platform.OS = originalOS;
    });

    it('keeps test tools in place when the required-2FA overlay is hidden', () => {
        // Given the required-2FA overlay is hidden, so the screen contentStyle already dims the tools.

        // When test tools render in the root stack.
        render(<TestToolsModalNavigator />);

        // Then they stay in place, because nothing is covering them.
        expect(screen.getByTestId('test-tools-stack')).toBeOnTheScreen();
        expect(screen.getByTestId('test-tools-page')).toBeOnTheScreen();
        expect(screen.queryByTestId(`portal-${REQUIRE_2FA_ABOVE_PORTAL_HOST}`)).toBeNull();
    });

    it('portals the focused screen above the overlay on web and keeps its route', () => {
        // Given web, where the overlay is painted after the navigator and would cover an in-place screen.
        Platform.OS = 'web';
        mockVisibility = {
            isRequire2FAOverlayVisible: true,
            isTestToolsRouteFocused: true,
        };

        // When test tools render above that overlay.
        render(<TestToolsModalNavigator />);

        // Then that screen is portaled with its route. Web dims via Overlay inside the frame.
        const portal = screen.getByTestId(`portal-${REQUIRE_2FA_ABOVE_PORTAL_HOST}`);

        expect(screen.getByTestId('test-tools-stack')).toBeOnTheScreen();
        expect(within(portal).getByText('TestToolsModal_Root')).toBeOnTheScreen();
        expect(screen.queryByTestId('test-tools-server-page')).toBeNull();
    });

    it('renders nothing for an unfocused test tools screen on web', () => {
        // Given the server page is the focused test-tools screen while required 2FA is showing on web.
        Platform.OS = 'web';
        mockVisibility = {
            isRequire2FAOverlayVisible: true,
            isTestToolsRouteFocused: true,
        };
        mockFocusedRouteName = 'TestToolsModal_Server';

        // When test tools render above the overlay.
        render(<TestToolsModalNavigator />);

        // Then only the focused page is portaled, so the previous tool screen does not stay on top of 2FA.
        const portal = screen.getByTestId(`portal-${REQUIRE_2FA_ABOVE_PORTAL_HOST}`);

        expect(within(portal).getByText('TestToolsModal_Server')).toBeOnTheScreen();
        expect(screen.queryByTestId('test-tools-page')).toBeNull();
    });

    it('portals the focused screen above the overlay on Android', () => {
        // Given Android, where a transparent modal stays inside the stack and the overlay would cover an in-place screen.
        Platform.OS = 'android';
        mockVisibility = {
            isRequire2FAOverlayVisible: true,
            isTestToolsRouteFocused: true,
        };

        // When test tools render above that overlay.
        render(<TestToolsModalNavigator />);

        // Then that screen is portaled with its route, the same as on web.
        const portal = screen.getByTestId(`portal-${REQUIRE_2FA_ABOVE_PORTAL_HOST}`);

        expect(within(portal).getByText('TestToolsModal_Root')).toBeOnTheScreen();
        expect(within(portal).getByTestId('test-tools-portal-backdrop')).toBeOnTheScreen();
    });

    it('keeps the stack mounted when required 2FA appears while test tools are open', () => {
        // Given test tools are already open on web, before the required-2FA flag arrives.
        Platform.OS = 'web';
        mockVisibility = {
            isRequire2FAOverlayVisible: false,
            isTestToolsRouteFocused: true,
        };
        const view = render(<TestToolsModalNavigator />);
        const mountsAfterOpen = testToolsStackMountCount;

        // When required 2FA becomes visible.
        mockVisibility = {
            isRequire2FAOverlayVisible: true,
            isTestToolsRouteFocused: true,
        };
        view.rerender(<TestToolsModalNavigator />);

        // Then the stack stays mounted and the focused screen moves into the portal.
        expect(testToolsStackMountCount).toBe(mountsAfterOpen);
        expect(screen.getByTestId(`portal-${REQUIRE_2FA_ABOVE_PORTAL_HOST}`)).toBeOnTheScreen();
    });

    it('keeps test tools inside the iOS modal while required 2FA is showing', () => {
        // Given iOS, where this navigator is already a window above the overlay.
        // Moving the screen out of that window into the portal host leaves an empty opaque screen that covers the tools after the transition.
        Platform.OS = 'ios';
        mockVisibility = {
            isRequire2FAOverlayVisible: true,
            isTestToolsRouteFocused: true,
        };

        // When test tools render.
        render(<TestToolsModalNavigator />);

        // Then they stay in the navigator, where the modal can show them, and nothing is portaled behind it.
        expect(screen.queryByTestId(`portal-${REQUIRE_2FA_ABOVE_PORTAL_HOST}`)).toBeNull();
        expect(screen.queryByTestId('test-tools-portal-backdrop')).toBeNull();
        expect(screen.getByTestId('test-tools-page')).toBeOnTheScreen();
    });
});
