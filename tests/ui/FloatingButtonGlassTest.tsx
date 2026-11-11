import {cleanup, render, screen} from '@testing-library/react-native';

import FloatingActionButton from '@components/FloatingActionButton';
import BaseFloatingCameraButton from '@components/FloatingCameraButton/BaseFloatingCameraButton';

import useResponsiveLayout from '@hooks/useResponsiveLayout';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import {NavigationContainer} from '@react-navigation/native';
import {GlassView} from 'expo-glass-effect';
import React from 'react';
import Onyx from 'react-native-onyx';

import waitForBatchedUpdatesWithAct from '../utils/waitForBatchedUpdatesWithAct';

// The (+) tint is the dark theme's buttonDefaultBG (productDark400) at 80%.
const FAB_GLASS_TINT = 'rgba(26, 61, 50, 0.8)';
// The open (+) tint is the dark theme's buttonHoveredBG (productDark500) at 80%.
const OPEN_FAB_GLASS_TINT = 'rgba(34, 79, 65, 0.8)';
// The camera tint is the theme's success color (green400) at 90%.
const CAMERA_GLASS_TINT = 'rgba(3, 212, 124, 0.9)';

// Jest resolves the iOS files, and the glass availability is read once at import time, so report an iOS 26 device that ships the glass effect API.
jest.mock('expo-glass-effect', () => ({
    ...jest.requireActual<Record<string, unknown>>('expo-glass-effect'),
    isLiquidGlassAvailable: () => true,
    isGlassEffectAPIAvailable: () => true,
}));

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

// useResponsiveLayout decides whether the FAB sits over the floating tab bar or in the LHB.
jest.mock('@hooks/useResponsiveLayout', () => jest.fn());
const mockedUseResponsiveLayout = jest.mocked(useResponsiveLayout);

jest.mock('react-native-reanimated', () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return {
        ...require('react-native-reanimated/mock'),
        useAnimatedStyle: (updater: () => Record<string, unknown>) => updater(),
    };
});

const mockIcon = () => null;

function mockLayout(shouldUseNarrowLayout: boolean) {
    mockedUseResponsiveLayout.mockReturnValue({...CONST.NAVIGATION_TESTS.DEFAULT_USE_RESPONSIVE_LAYOUT_VALUE, shouldUseNarrowLayout});
}

function renderFAB(isActive = false) {
    render(
        <NavigationContainer>
            <FloatingActionButton
                onPress={jest.fn()}
                isActive={isActive}
                accessibilityLabel="fab"
                role={CONST.ROLE.BUTTON}
            />
        </NavigationContainer>,
    );
}

describe('Floating buttons liquid glass', () => {
    beforeAll(() => {
        Onyx.init({keys: ONYXKEYS});
    });

    afterEach(() => {
        cleanup();
        jest.clearAllMocks();
    });

    it('draws the (+) FAB over the floating tab bar as gray glass without its solid fill and shadow', () => {
        // Given the narrow layout, where the FAB floats over the native tab bar
        mockLayout(true);

        // When the closed FAB renders
        renderFAB();

        // Then the glass carries the gray tint at 80% and the container drops its own fill and shadow, so only the glass draws the surface
        expect(screen.UNSAFE_getByType(GlassView).props).toEqual(expect.objectContaining({tintColor: FAB_GLASS_TINT, colorScheme: CONST.COLOR_SCHEME.DARK}));
        expect(screen.getByTestId('fab-animated-container')).toHaveStyle({backgroundColor: 'transparent', boxShadow: 'none'});
    });

    it('tints the (+) FAB glass with the hover color while its menu is open', () => {
        // Given the narrow layout, where the FAB floats over the native tab bar
        mockLayout(true);

        // When the FAB renders with its menu open
        renderFAB(true);

        // Then the tint switches to the hover color, the same open cue the solid button shows
        expect(screen.UNSAFE_getByType(GlassView).props).toEqual(expect.objectContaining({tintColor: OPEN_FAB_GLASS_TINT}));
    });

    it('keeps the (+) FAB solid in the LHB of the wide layout', () => {
        // Given the wide layout, where the FAB sits in the LHB next to the solid receipt button
        mockLayout(false);

        // When the FAB renders
        renderFAB();

        // Then no glass is drawn and the container keeps its solid fill, so both LHB buttons match and the hover color still shows
        expect(screen.UNSAFE_queryByType(GlassView)).toBeNull();
        expect(screen.getByTestId('fab-animated-container')).not.toHaveStyle({backgroundColor: 'transparent'});
    });

    it('draws the camera button as green glass without its solid fill and shadow', async () => {
        // Given the narrow layout, where the camera button floats over the native tab bar
        mockLayout(true);

        // When the camera button renders
        render(<BaseFloatingCameraButton icon={mockIcon} />);
        await waitForBatchedUpdatesWithAct();

        // Then the glass carries the green tint at 90% and the container drops its own fill and shadow
        expect(screen.UNSAFE_getByType(GlassView).props).toEqual(expect.objectContaining({tintColor: CAMERA_GLASS_TINT, colorScheme: CONST.COLOR_SCHEME.DARK}));
        expect(screen.getByTestId('floating-camera-button-container')).toHaveStyle({backgroundColor: 'transparent', boxShadow: 'none'});
    });
});
