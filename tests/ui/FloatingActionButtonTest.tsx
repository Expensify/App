import {fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import FloatingActionButton from '@components/FloatingActionButton';
import CONST from '@src/CONST';
import lightTheme from '@styles/theme/themes/light';

// FloatingActionButton relies on ProductTrainingContext, so provide a minimal mock.
jest.mock('@components/ProductTrainingContext', () => ({
    // eslint-disable-next-line @typescript-eslint/naming-convention
    useProductTrainingContext: () => ({
        renderProductTrainingTooltip: () => null,
        shouldShowProductTrainingTooltip: false,
        hideProductTrainingTooltip: () => {},
    }),
}));

// useResponsiveLayout determines LHB visibility. Mock a wide layout to keep behaviour deterministic.
jest.mock('@hooks/useResponsiveLayout', () => () => ({shouldUseNarrowLayout: false}));

// Mock useIsHomeRouteActive to avoid navigation state issues
jest.mock('@navigation/helpers/useIsHomeRouteActive', () => () => false);

// Silence react-native-reanimated warnings in Jest
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));

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
                    isTooltipAllowed={false}
                />
            </NavigationContainer>,
        );

    it('changes background colour on hover', () => {
        renderFAB();
        const fab = screen.getByTestId('floating-action-button');

        // Get the animated container by testID
        const animatedContainer = screen.getByTestId('fab-animated-container');

        // Before hover, should not have successHover background
        expect(animatedContainer).not.toHaveStyle({backgroundColor: lightTheme.successHover});
        
        // Test hover in
        fireEvent(fab, 'hoverIn');
        expect(animatedContainer).toHaveStyle({backgroundColor: lightTheme.successHover});
        
        // Test hover out
        fireEvent(fab, 'hoverOut');
        expect(animatedContainer).not.toHaveStyle({backgroundColor: lightTheme.successHover});
    });
});
