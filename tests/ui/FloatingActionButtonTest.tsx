import {NavigationContainer} from '@react-navigation/native';
import {fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';
import FloatingActionButton from '@components/FloatingActionButton';
import colors from '@styles/theme/colors';
import CONST from '@src/CONST';

// FloatingActionButton relies on ProductTrainingContext, so provide a minimal mock.
jest.mock('@components/ProductTrainingContext', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
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

// useResponsiveLayout determines LHB visibility. Mock a wide layout to keep behaviour deterministic.
jest.mock('@hooks/useResponsiveLayout', () => (): {shouldUseNarrowLayout: boolean} => ({shouldUseNarrowLayout: false}));

// Mock useIsHomeRouteActive to avoid navigation state issues
jest.mock('@navigation/helpers/useIsHomeRouteActive', () => (): boolean => false);

// Silence react-native-reanimated warnings in Jest
jest.mock('react-native-reanimated', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return require('react-native-reanimated/mock');
});

describe('FloatingActionButton hover', () => {
    const onPress = jest.fn();

    const renderFAB = () =>
        render(
            <NavigationContainer>
                <FloatingActionButton
                    onPress={onPress}
                    isActive={false}
                    accessibilityLabel="fab"
                    role={CONST.ROLE.BUTTON}
                />
            </NavigationContainer>,
        );

    it('changes background color on hover', () => {
        renderFAB();
        const fab = screen.getByTestId('floating-action-button');

        // Get the animated container by testID
        const animatedContainer = screen.getByTestId('fab-animated-container');

        // Before hover, should not have successHover background
        expect(animatedContainer).not.toHaveStyle({backgroundColor: colors.productDark500});

        // Test hover in
        fireEvent(fab, 'hoverIn');
        expect(animatedContainer).toHaveStyle({backgroundColor: colors.productDark500});

        // Test hover out
        fireEvent(fab, 'hoverOut');
        expect(animatedContainer).not.toHaveStyle({backgroundColor: colors.productDark500});
    });
});
