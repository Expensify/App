import {fireEvent, render, screen} from '@testing-library/react-native';

import FloatingActionButton from '@components/FloatingActionButton';

import {resolvePopoverLauncherElement, setActivePopoverLauncher} from '@libs/LauncherStack';

import CONST from '@src/CONST';

import {NavigationContainer} from '@react-navigation/native';
import React from 'react';

// FloatingActionButton relies on ProductTrainingContext, so provide a minimal mock.
jest.mock('@components/ProductTrainingContext', () => ({
    useProductTrainingContext: (): {
        renderProductTrainingTooltip: () => null;
        shouldShowProductTrainingTooltip: boolean;
        hideProductTrainingTooltip: () => void;
    } => ({
        renderProductTrainingTooltip: () => null,
        shouldShowProductTrainingTooltip: false,
        hideProductTrainingTooltip: () => {},
    }),
}));

// useResponsiveLayout determines LHB visibility. The manual mock pins a wide layout, keeping behaviour deterministic.
jest.mock('@hooks/useResponsiveLayout');

jest.mock('@libs/LauncherStack', () => ({
    resolvePopoverLauncherElement: jest.fn(),
    setActivePopoverLauncher: jest.fn(),
    markActivePopoverLauncherDeactivated: jest.fn(),
    pickLauncher: jest.fn(() => null),
    consumeLauncher: jest.fn(),
    resetLauncherStackForTests: jest.fn(),
}));

const mockAnchor = document.createElement('button');

describe('FloatingActionButton launcher registration', () => {
    const onPress = jest.fn();

    const renderFAB = (isActive: boolean) =>
        render(
            <NavigationContainer>
                <FloatingActionButton
                    onPress={onPress}
                    isActive={isActive}
                    accessibilityLabel="fab"
                    role={CONST.ROLE.BUTTON}
                />
            </NavigationContainer>,
        );

    beforeEach(() => {
        jest.clearAllMocks();
        jest.mocked(resolvePopoverLauncherElement).mockReturnValue(mockAnchor);
    });

    it('registers the FAB as the launcher before opening the menu', () => {
        renderFAB(false);

        fireEvent.press(screen.getByTestId('floating-action-button'));

        expect(setActivePopoverLauncher).toHaveBeenCalledWith(mockAnchor);
        // The registration must happen before onPress opens the popover — the focus trap activates with a blurred
        // (body) activeElement, so it can only find the launcher if it is already on the stack.
        const registerOrder = jest.mocked(setActivePopoverLauncher).mock.invocationCallOrder.at(0) ?? Infinity;
        const openOrder = onPress.mock.invocationCallOrder.at(0) ?? -Infinity;
        expect(registerOrder).toBeLessThan(openOrder);
    });

    it('does not register a launcher when the press closes an already-open menu', () => {
        renderFAB(true);

        fireEvent.press(screen.getByTestId('floating-action-button'));

        expect(setActivePopoverLauncher).not.toHaveBeenCalled();
        expect(onPress).toHaveBeenCalled();
    });

    it('does not register anything when the anchor has no host node (native)', () => {
        jest.mocked(resolvePopoverLauncherElement).mockReturnValue(null);
        renderFAB(false);

        fireEvent.press(screen.getByTestId('floating-action-button'));

        expect(setActivePopoverLauncher).not.toHaveBeenCalled();
        expect(onPress).toHaveBeenCalled();
    });
});
