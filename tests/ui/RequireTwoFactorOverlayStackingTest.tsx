/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
import {render, screen, within} from '@testing-library/react-native';

import {REQUIRE_2FA_ABOVE_PORTAL_HOST} from '@hooks/useRequire2FAOverlayVisibility';

import TestToolsModalNavigator from '@libs/Navigation/AppNavigator/Navigators/TestToolsModalNavigator';

import RequireTwoFactorAuthenticationOverlay from '@pages/RequireTwoFactorAuthenticationOverlay';

import React from 'react';

type Visibility = {
    isRequire2FAOverlayVisible: boolean;
    isTestToolsRouteFocused: boolean;
};

let mockVisibility: Visibility = {
    isRequire2FAOverlayVisible: true,
    isTestToolsRouteFocused: false,
};
let mockIsOffline = true;

jest.mock('@hooks/useRequire2FAOverlayVisibility', () => ({
    __esModule: true,
    REQUIRE_2FA_ABOVE_PORTAL_HOST: 'require2FAAbove',
    default: () => mockVisibility,
}));

jest.mock('@hooks/useNetwork', () => ({
    __esModule: true,
    default: () => ({isOffline: mockIsOffline}),
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
    default: () => ({icon: '#000'}),
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
    default: () => ({shouldUseNarrowLayout: false}),
}));

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
    });

    it('shows the offline banner outside the covering overlay while required 2FA is visible', () => {
        render(<RequireTwoFactorAuthenticationOverlay />);

        const overlay = screen.getByTestId('RequireTwoFactorAuthenticationOverlay');

        expect(overlay).toBeOnTheScreen();
        expect(screen.getByTestId('RequireTwoFactorOfflineBanner')).toBeOnTheScreen();
        expect(screen.getByText('You appear to be offline.')).toBeOnTheScreen();
        expect(within(overlay).queryByText('You appear to be offline.')).toBeNull();
        expect(screen.getByTestId('focus-trap-active')).toBeOnTheScreen();
    });

    it('hides the banner when the overlay is not showing', () => {
        mockVisibility = {
            isRequire2FAOverlayVisible: false,
            isTestToolsRouteFocused: false,
        };

        render(<RequireTwoFactorAuthenticationOverlay />);

        expect(screen.queryByText('You appear to be offline.')).toBeNull();
        expect(screen.queryByTestId('RequireTwoFactorAuthenticationOverlay')).toBeNull();
    });

    it('hides the banner while online', () => {
        mockIsOffline = false;

        render(<RequireTwoFactorAuthenticationOverlay />);

        expect(screen.getByTestId('RequireTwoFactorAuthenticationOverlay')).toBeOnTheScreen();
        expect(screen.queryByText('You appear to be offline.')).toBeNull();
    });

    it('turns the web focus trap off while test tools are focused', () => {
        mockVisibility = {
            isRequire2FAOverlayVisible: true,
            isTestToolsRouteFocused: true,
        };

        render(<RequireTwoFactorAuthenticationOverlay />);

        expect(screen.getByTestId('RequireTwoFactorAuthenticationOverlay')).toBeOnTheScreen();
        expect(screen.getByTestId('focus-trap-inactive')).toBeOnTheScreen();
        expect(screen.queryByTestId('focus-trap-active')).toBeNull();
    });
});

describe('TestToolsModalNavigator portal', () => {
    beforeEach(() => {
        mockVisibility = {
            isRequire2FAOverlayVisible: false,
            isTestToolsRouteFocused: false,
        };
        mockFocusedRouteName = 'TestToolsModal_Root';
    });

    it('keeps test tools in place when the required-2FA overlay is hidden', () => {
        render(<TestToolsModalNavigator />);

        expect(screen.getByTestId('test-tools-stack')).toBeOnTheScreen();
        expect(screen.getByTestId('test-tools-page')).toBeOnTheScreen();
        expect(screen.queryByTestId(`portal-${REQUIRE_2FA_ABOVE_PORTAL_HOST}`)).toBeNull();
    });

    it('portals the focused screen above the overlay and keeps its route', () => {
        mockVisibility = {
            isRequire2FAOverlayVisible: true,
            isTestToolsRouteFocused: true,
        };

        render(<TestToolsModalNavigator />);

        const portal = screen.getByTestId(`portal-${REQUIRE_2FA_ABOVE_PORTAL_HOST}`);

        expect(screen.getByTestId('test-tools-stack')).toBeOnTheScreen();
        expect(within(portal).getByText('TestToolsModal_Root')).toBeOnTheScreen();
        expect(screen.queryByTestId('test-tools-server-page')).toBeNull();
    });

    it('renders nothing for an unfocused test tools screen', () => {
        mockVisibility = {
            isRequire2FAOverlayVisible: true,
            isTestToolsRouteFocused: true,
        };
        mockFocusedRouteName = 'TestToolsModal_Server';

        render(<TestToolsModalNavigator />);

        const portal = screen.getByTestId(`portal-${REQUIRE_2FA_ABOVE_PORTAL_HOST}`);

        expect(within(portal).getByText('TestToolsModal_Server')).toBeOnTheScreen();
        expect(screen.queryByTestId('test-tools-page')).toBeNull();
    });
});
