import {fireEvent, render, screen} from '@testing-library/react-native';

import Overlay from '@libs/Navigation/AppNavigator/Navigators/Overlay';
import RHPOverlay from '@libs/Navigation/AppNavigator/Navigators/Overlay/RHPOverlay';

import variables from '@styles/variables';

import CONST from '@src/CONST';

import type * as ReactNavigationNative from '@react-navigation/native';
import type * as ReactNavigationStack from '@react-navigation/stack';

import {useIsFocused} from '@react-navigation/native';
import {useCardAnimation} from '@react-navigation/stack';
import React from 'react';
// eslint-disable-next-line no-restricted-imports
import {Animated, Platform} from 'react-native';

import createMock from '../utils/createMock';

jest.mock('@react-navigation/native', () => ({...jest.requireActual<typeof ReactNavigationNative>('@react-navigation/native'), useIsFocused: jest.fn()}));
jest.mock('@react-navigation/stack', () => ({...jest.requireActual<typeof ReactNavigationStack>('@react-navigation/stack'), useCardAnimation: jest.fn()}));

describe.each(['ios', 'android', 'web'] as const)('RHP scrims on %s', (platform) => {
    beforeEach(() => {
        jest.replaceProperty(Platform, 'OS', platform);
        jest.mocked(useIsFocused).mockReturnValue(true);
        jest.mocked(useCardAnimation).mockReturnValue(createMock<ReactNavigationStack.StackCardInterpolationProps>({current: {progress: new Animated.Value(0)}}));
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it.each([0, 0.25, 1])('fades with navigation progress %s without a transform', (progress) => {
        jest.mocked(useCardAnimation).mockReturnValue(createMock<ReactNavigationStack.StackCardInterpolationProps>({current: {progress: new Animated.Value(progress)}}));
        render(<Overlay />);
        const scrim = screen.getByTestId('rhp-overlay', {includeHiddenElements: true});

        expect(scrim).toHaveStyle({opacity: Math.min(progress * 2, 1) * variables.overlayOpacity, left: 0, right: 0});
        expect(scrim).toHaveProp('pointerEvents', 'none');
        expect(scrim).toHaveProp('importantForAccessibility', 'no-hide-descendants');
        expect(screen.queryByTestId('rhp-overlay-dismiss', {includeHiddenElements: true})).toBeNull();
        expect(screen.queryByLabelText('Close', {includeHiddenElements: true})).toBeNull();
    });

    it('uses explicit progress for a secondary visual scrim', () => {
        render(<Overlay progress={new Animated.Value(1)} />);
        expect(screen.getByTestId('rhp-overlay', {includeHiddenElements: true})).toHaveStyle({opacity: variables.overlayOpacity});
    });

    it.each([375, 840, 1033])('bounds pointer dismissal outside a %s-point panel without exporting a Close action', (width) => {
        const onPress = jest.fn();
        render(
            <Overlay
                onPress={onPress}
                positionLeftValue={-1033}
                dismissalPositionRight={width}
            />,
        );
        const dismiss = screen.getByTestId('rhp-overlay-dismiss', {includeHiddenElements: true});

        expect(dismiss).toHaveStyle({left: 0, right: width});
        expect(dismiss).toHaveProp('accessible', false);
        expect(dismiss).toHaveProp('importantForAccessibility', 'no-hide-descendants');
        expect(screen.queryByRole('button', {includeHiddenElements: true})).toBeNull();
        expect(screen.queryByLabelText('Close', {includeHiddenElements: true})).toBeNull();
        fireEvent.press(dismiss);
        expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('uses one dismissal target with the ID recognized by form blur handling', () => {
        const onPress = jest.fn();
        render(<Overlay onPress={onPress} />);
        const dismiss = screen.getByTestId('rhp-overlay-dismiss', {includeHiddenElements: true});

        expect(dismiss).toHaveProp('id', CONST.OVERLAY.BOTTOM_BUTTON_NATIVE_ID);
        fireEvent.press(dismiss);
        expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('uses independent visual and dismissal bounds while the web Concierge offset changes', () => {
        const offset = new Animated.Value(0);
        const {rerender} = render(
            <Overlay
                onPress={jest.fn()}
                dismissalPositionRight={Animated.add<number>(offset, 375)}
            />,
        );
        expect(screen.getByTestId('rhp-overlay-dismiss', {includeHiddenElements: true})).toHaveStyle({right: 375});

        offset.setValue(320);
        rerender(
            <Overlay
                onPress={jest.fn()}
                dismissalPositionRight={Animated.add<number>(offset, 375)}
            />,
        );
        expect(screen.getByTestId('rhp-overlay-dismiss', {includeHiddenElements: true})).toHaveStyle({right: 695});
        expect(screen.getByTestId('rhp-overlay', {includeHiddenElements: true})).toHaveStyle({right: 0});
    });

    it('retains only visual dimming after its root route loses focus', () => {
        jest.mocked(useIsFocused).mockReturnValue(false);
        const onPress = jest.fn();
        render(<Overlay onPress={onPress} />);
        expect(screen.queryByTestId('rhp-overlay-dismiss', {includeHiddenElements: true})).toBeNull();
        expect(onPress).not.toHaveBeenCalled();
    });

    it('uses the floating RHP opacity without changing dismissal accessibility', () => {
        // Given the dedicated RHP overlay introduced by the floating-card layout
        const onPress = jest.fn();

        // When the overlay is fully visible
        render(
            <RHPOverlay
                progress={new Animated.Value(1)}
                onPress={onPress}
            />,
        );

        // Then it uses the RHP opacity while keeping the dismissal target hidden from screen readers
        expect(screen.getByTestId('rhp-overlay', {includeHiddenElements: true})).toHaveStyle({opacity: variables.rhpOverlayOpacity});
        expect(screen.getByTestId('rhp-overlay-dismiss', {includeHiddenElements: true})).toHaveProp('accessible', false);
    });

    it('keeps the transparent floating-card gap pressable within its vertical bounds', () => {
        // Given a gap above the floating card that must dismiss without adding another layer of dimming
        const onPress = jest.fn();

        // When the gap overlay is rendered with explicit horizontal and vertical bounds
        render(
            <RHPOverlay
                transparent
                positionLeftValue={800}
                positionRightValue={12}
                positionTopValue={0}
                positionBottomValue={808}
                onPress={onPress}
            />,
        );

        // Then the visual overlay has no background and the dismissal target covers only the gap
        expect(screen.getByTestId('rhp-overlay', {includeHiddenElements: true})).not.toHaveStyle({backgroundColor: expect.any(String)});
        const dismiss = screen.getByTestId('rhp-overlay-dismiss', {includeHiddenElements: true});
        expect(dismiss).toHaveStyle({left: 800, right: 12, top: 0, bottom: 808});
        fireEvent.press(dismiss);
        expect(onPress).toHaveBeenCalledTimes(1);
    });
});
