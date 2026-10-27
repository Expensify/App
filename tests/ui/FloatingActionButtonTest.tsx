import {cleanup, fireEvent, render, screen} from '@testing-library/react-native';

import FloatingActionButton from '@components/FloatingActionButton';

import useResponsiveLayout from '@hooks/useResponsiveLayout';

import colors from '@styles/theme/colors';

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

// Jest resolves the iOS files and its native module mock reports liquid glass as available, so pin the solid button that web, Android and older iOS draw.
jest.mock('expo-glass-effect', () => ({
    ...jest.requireActual<Record<string, unknown>>('expo-glass-effect'),
    isLiquidGlassAvailable: () => false,
}));

// useResponsiveLayout determines LHB visibility. Mock a wide layout to keep behaviour deterministic.
jest.mock('@hooks/useResponsiveLayout', () => jest.fn());
const mockedUseResponsiveLayout = jest.mocked(useResponsiveLayout);

let mockUseAnimatedStyleUpdater: () => Record<string, unknown>;
// Silence react-native-reanimated warnings in Jest
jest.mock('react-native-reanimated', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...require('react-native-reanimated/mock'),
        interpolateColor: (value: number, input: number[], output: string[]) => {
            const [, inputMax] = input;
            const [colorMin, colorMax] = output;

            if (value >= inputMax) {
                return colorMax;
            }
            return colorMin;
        },
        useAnimatedStyle: (updater: () => Record<string, unknown>) => {
            mockUseAnimatedStyleUpdater = updater;
            return updater();
        },
    };
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

    afterEach(() => {
        cleanup();
        jest.clearAllMocks();
    });

    beforeAll(() => {
        mockedUseResponsiveLayout.mockReturnValue({...CONST.NAVIGATION_TESTS.DEFAULT_USE_RESPONSIVE_LAYOUT_VALUE, shouldUseNarrowLayout: false});
    });

    it('changes background color on hover', () => {
        // Given a solid FAB that is not hovered, so it does not show the hover background yet
        renderFAB();
        const fab = screen.getByTestId('floating-action-button');
        const animatedContainer = screen.getByTestId('fab-animated-container');
        expect(animatedContainer).not.toHaveStyle({backgroundColor: colors.productDark500});
        expect(mockUseAnimatedStyleUpdater()).not.toEqual(expect.objectContaining({backgroundColor: colors.productDark500}));

        // When the pointer enters the FAB
        fireEvent(fab, 'hoverIn');

        // Then the background switches to the hover color to signal the button is interactive
        expect(mockUseAnimatedStyleUpdater()).toEqual(expect.objectContaining({backgroundColor: colors.productDark500}));

        // When the pointer leaves the FAB
        fireEvent(fab, 'hoverOut');

        // Then the background returns to its resting color
        expect(mockUseAnimatedStyleUpdater()).not.toEqual(expect.objectContaining({backgroundColor: colors.productDark500}));
    });

    it('should render animated button if LHB is visible', () => {
        renderFAB();

        // Get the animated container by testID
        const animatedContainer = screen.getByTestId('fab-animated-container');

        expect(animatedContainer).toBeVisible();
    });
});
