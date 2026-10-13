import {fireEvent, render, screen} from '@testing-library/react-native';

import Navigation from '@libs/Navigation/Navigation';

import WorkspaceOwnerRestrictedActionNative from '@src/pages/RestrictedAction/Workspace/WorkspaceOwnerRestrictedAction/index.native';
import ROUTES from '@src/ROUTES';

import type ReactNative from 'react-native';

import React from 'react';

// Jest resolves index.native.tsx by default in the RN test environment; load web implementation explicitly.
const {default: WorkspaceOwnerRestrictedActionWeb} = jest.requireActual<{default: React.ComponentType}>('@src/pages/RestrictedAction/Workspace/WorkspaceOwnerRestrictedAction/index.tsx');

// Held in a variable so tests can change the active route between render and press, which is what
// happens on device when this screen is covered by the Subscription page.
const mockGetActiveRoute = jest.fn(() => 'r/123');

jest.mock('@libs/Navigation/Navigation', () => ({
    dismissModal: jest.fn(),
    closeRHPFlow: jest.fn(),
    navigate: jest.fn(),
    getActiveRoute: () => mockGetActiveRoute(),
    goBack: jest.fn(),
}));

jest.mock('@hooks/useLocalize', () => jest.fn(() => ({translate: jest.fn((key: string) => key)})));

jest.mock('@hooks/useThemeStyles', () =>
    jest.fn(
        () =>
            new Proxy(
                {},
                {
                    get: () => ({}),
                },
            ),
    ),
);

jest.mock('@hooks/useLazyAsset', () => ({
    useMemoizedLazyExpensifyIcons: jest.fn(() => ({
        Unlock: () => null,
    })),
    useMemoizedLazyIllustrations: jest.fn(() => ({
        LockClosedOrange: () => null,
    })),
}));

jest.mock('@components/ScreenWrapper', () => {
    function MockScreenWrapper({children}: {children: React.ReactNode}) {
        return children;
    }
    return MockScreenWrapper;
});

jest.mock('@components/HeaderWithBackButton', () => {
    function MockHeaderWithBackButton() {
        return null;
    }
    return MockHeaderWithBackButton;
});

jest.mock('@components/ScrollView', () => {
    function MockScrollView({children}: {children: React.ReactNode}) {
        return children;
    }
    return MockScrollView;
});

jest.mock('@components/Icon', () => {
    function MockIcon() {
        return null;
    }
    return MockIcon;
});

jest.mock('@components/Badge', () => {
    function MockBadge() {
        return null;
    }
    return MockBadge;
});

jest.mock('@components/Text', () => {
    function MockText({children}: {children: React.ReactNode}) {
        return children;
    }
    return MockText;
});

jest.mock('@components/Button', () => {
    const {TouchableOpacity, Text} = jest.requireActual<typeof ReactNative>('react-native');
    function MockButton({children, onPress}: {children: React.ReactNode; onPress?: () => void}) {
        return (
            <TouchableOpacity
                accessibilityRole="button"
                onPress={onPress}
            >
                {children}
            </TouchableOpacity>
        );
    }
    MockButton.Text = ({children}: {children: React.ReactNode}) => <Text>{children}</Text>;
    return MockButton;
});

function getDismissModalAfterTransition(): (() => void) | undefined {
    const options = jest.mocked(Navigation.dismissModal).mock.calls.at(0)?.at(0);
    if (typeof options !== 'object' || options === null || !('afterTransition' in options)) {
        return undefined;
    }
    const {afterTransition} = options;
    return typeof afterTransition === 'function' ? afterTransition : undefined;
}

describe('WorkspaceOwnerRestrictedAction', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockGetActiveRoute.mockReturnValue('r/123');
    });

    it('dismisses modal before navigating to add payment card on web', () => {
        render(<WorkspaceOwnerRestrictedActionWeb />);

        fireEvent.press(screen.getByText('workspace.restrictedAction.addPaymentCard'));

        expect(Navigation.dismissModal).toHaveBeenCalledTimes(1);
        expect(Navigation.navigate).not.toHaveBeenCalled();

        const afterTransition = getDismissModalAfterTransition();
        expect(afterTransition).toBeInstanceOf(Function);

        afterTransition?.();

        expect(Navigation.navigate).toHaveBeenCalledTimes(1);
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SETTINGS_SUBSCRIPTION_ADD_PAYMENT_CARD);
    });

    it('navigates to subscription without closing the RHP so swiping back returns to the restricted screen', () => {
        // Given the native restricted action screen, which is rendered inside the RHP
        render(<WorkspaceOwnerRestrictedActionNative />);

        // When the owner taps "Go to Subscription"
        fireEvent.press(screen.getByText('workspace.restrictedAction.goToSubscription'));

        // Then the RHP must stay on the root stack. Closing it pops this screen off the stack, and the
        // native swipe-back gesture would then reveal whatever was underneath instead of coming back here.
        expect(Navigation.closeRHPFlow).not.toHaveBeenCalled();
        expect(Navigation.navigate).toHaveBeenCalledTimes(1);
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SETTINGS_SUBSCRIPTION.getRoute('r/123'));
        expect(Navigation.dismissModal).not.toHaveBeenCalled();
    });

    it('resolves backTo at press time so the button still works after swiping back from subscription', () => {
        // Given this screen mounting while the Subscription page is the focused route. That really happens:
        // the screen stays mounted underneath Subscription, and Subscription's own billing fetch toggles the
        // shared loading flag that swaps this screen's content out and back in while it is covered.
        mockGetActiveRoute.mockReturnValue('settings/subscription?backTo=r%2F123');
        render(<WorkspaceOwnerRestrictedActionNative />);

        // When the user swipes back, re-focusing this screen, and taps "Go to Subscription" again
        mockGetActiveRoute.mockReturnValue('r/123');
        fireEvent.press(screen.getByText('workspace.restrictedAction.goToSubscription'));

        // Then backTo must be the restricted-action route, not Subscription. A mount-time snapshot of the
        // active route could be captured while Subscription was on top, making backTo self-referential.
        // `linkTo` discards such a navigation as a no-op and the button silently stops working.
        expect(Navigation.navigate).toHaveBeenCalledTimes(1);
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SETTINGS_SUBSCRIPTION.getRoute('r/123'));
    });
});
