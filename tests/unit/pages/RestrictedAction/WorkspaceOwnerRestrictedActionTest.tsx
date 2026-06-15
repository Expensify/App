import {fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';
import type ReactNative from 'react-native';
import Navigation from '@libs/Navigation/Navigation';
import WorkspaceOwnerRestrictedActionNative from '@src/pages/RestrictedAction/Workspace/WorkspaceOwnerRestrictedAction/index.native';
import ROUTES from '@src/ROUTES';

// Jest resolves index.native.tsx by default in the RN test environment; load web implementation explicitly.
const {default: WorkspaceOwnerRestrictedActionWeb} = jest.requireActual<{default: React.ComponentType}>('@src/pages/RestrictedAction/Workspace/WorkspaceOwnerRestrictedAction/index.tsx');

jest.mock('@libs/Navigation/Navigation', () => ({
    dismissModal: jest.fn(),
    closeRHPFlow: jest.fn(),
    navigate: jest.fn(),
    getActiveRoute: jest.fn(() => 'r/123'),
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
    function MockButton({text, onPress}: {text: string; onPress?: () => void}) {
        return (
            <TouchableOpacity
                accessibilityRole="button"
                onPress={onPress}
            >
                <Text>{text}</Text>
            </TouchableOpacity>
        );
    }
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

    it('uses unchanged native handler to navigate to subscription route', () => {
        render(<WorkspaceOwnerRestrictedActionNative />);

        fireEvent.press(screen.getByText('workspace.restrictedAction.goToSubscription'));

        expect(Navigation.closeRHPFlow).toHaveBeenCalledTimes(1);
        expect(Navigation.navigate).toHaveBeenCalledTimes(1);
        expect(Navigation.navigate).toHaveBeenCalledWith(ROUTES.SETTINGS_SUBSCRIPTION.getRoute('r/123'));
        expect(Navigation.dismissModal).not.toHaveBeenCalled();
    });
});
