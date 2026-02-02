import {NavigationContainer} from '@react-navigation/native';
import {cleanup, fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';
import FloatingActionButton from '@components/FloatingActionButton';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
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
jest.mock('@hooks/useResponsiveLayout', () => jest.fn());
const mockedUseResponsiveLayout = useResponsiveLayout as jest.MockedFunction<typeof useResponsiveLayout>;

// Mock useIsHomeRouteActive to avoid navigation state issues
jest.mock('@navigation/helpers/useIsHomeRouteActive', () => (): boolean => false);

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
        renderFAB();
        const fab = screen.getByTestId('floating-action-button');

        // Get the animated container by testID
        const animatedContainer = screen.getByTestId('fab-animated-container');

        // Before hover, should not have successHover background
        expect(animatedContainer).not.toHaveStyle({backgroundColor: colors.productDark500});

        expect(mockUseAnimatedStyleUpdater()).not.toEqual(expect.objectContaining({backgroundColor: colors.productDark500}));

        // Test hover in
        fireEvent(fab, 'hoverIn');
        expect(mockUseAnimatedStyleUpdater()).toEqual(expect.objectContaining({backgroundColor: colors.productDark500}));

        // Test hover out
        fireEvent(fab, 'hoverOut');
        expect(mockUseAnimatedStyleUpdater()).not.toEqual(expect.objectContaining({backgroundColor: colors.productDark500}));
    });

    it('should render animated button if LHB is visible', () => {
        renderFAB();

        // Get the animated container by testID
        const animatedContainer = screen.getByTestId('fab-animated-container');

        expect(animatedContainer).toBeVisible();
    });
});
