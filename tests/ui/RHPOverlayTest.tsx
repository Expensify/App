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
import {Animated, Platform, StyleSheet} from 'react-native';

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
        // Given the scrim must dim the whole background without moving with the panel
        jest.mocked(useCardAnimation).mockReturnValue(createMock<ReactNavigationStack.StackCardInterpolationProps>({current: {progress: new Animated.Value(progress)}}));
        // When navigation advances through the panel transition
        render(<Overlay />);
        const scrim = screen.getByTestId('rhp-overlay', {includeHiddenElements: true});

        // Then only opacity changes, and a visual-only scrim must not introduce a dismissal action
        expect(scrim).toHaveStyle({opacity: Math.min(progress * 2, 1) * variables.overlayOpacity, left: 0, right: 0});
        expect(scrim).toHaveProp('pointerEvents', 'none');
        expect(scrim).toHaveProp('importantForAccessibility', 'no-hide-descendants');
        expect(screen.queryByTestId('rhp-overlay-dismiss', {includeHiddenElements: true})).toBeNull();
        expect(screen.queryByLabelText('Close', {includeHiddenElements: true})).toBeNull();
    });

    it('uses explicit progress for a secondary visual scrim', () => {
        // Given a secondary scrim can animate independently of the root navigation card
        // When its explicit progress is fully open while the root progress is still zero
        render(<Overlay progress={new Animated.Value(1)} />);
        // Then its opacity must follow the supplied progress rather than remaining invisible
        expect(screen.getByTestId('rhp-overlay', {includeHiddenElements: true})).toHaveStyle({opacity: variables.overlayOpacity});
    });

    it.each([375, 840, 1033])('bounds pointer dismissal outside a %s-point panel without exporting a Close action', (width) => {
        // Given panel widths vary and their content must remain interactive rather than dismissing on touch
        const onPress = jest.fn();
        // When the overlay has a visual offset different from the panel's dismissal boundary
        render(
            <Overlay
                onPress={onPress}
                positionLeftValue={-1033}
                dismissalPositionRight={width}
            />,
        );
        const dismiss = screen.getByTestId('rhp-overlay-dismiss', {includeHiddenElements: true});

        // Then only the outside region dismisses, without duplicating the panel's accessible Close control
        expect(dismiss).toHaveStyle({left: 0, right: width});
        expect(dismiss).toHaveProp('accessible', false);
        expect(dismiss).toHaveProp('importantForAccessibility', 'no-hide-descendants');
        expect(screen.queryByRole('button', {includeHiddenElements: true})).toBeNull();
        expect(screen.queryByLabelText('Close', {includeHiddenElements: true})).toBeNull();
        fireEvent.press(dismiss);
        expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('uses one dismissal target with the ID recognized by form blur handling', () => {
        // Given form blur handling identifies overlay presses by a shared native ID
        const onPress = jest.fn();
        // When a dismissible overlay is mounted
        render(<Overlay onPress={onPress} />);
        const dismiss = screen.getByTestId('rhp-overlay-dismiss', {includeHiddenElements: true});

        // Then its single working target must retain that ID so outside presses also blur form inputs
        expect(dismiss).toHaveProp('id', CONST.OVERLAY.BOTTOM_BUTTON_NATIVE_ID);
        fireEvent.press(dismiss);
        expect(onPress).toHaveBeenCalledTimes(1);
    });

    it('uses independent visual and dismissal bounds while the web Concierge offset changes', () => {
        // Given Concierge can shift the panel while the background still needs full-window dimming
        const offset = new Animated.Value(0);
        const {rerender} = render(
            <Overlay
                onPress={jest.fn()}
                dismissalPositionRight={Animated.add<number>(offset, 375)}
            />,
        );
        expect(screen.getByTestId('rhp-overlay-dismiss', {includeHiddenElements: true})).toHaveStyle({right: 375});

        // When the side panel shifts the dismissal boundary away from its initial position
        offset.setValue(320);
        rerender(
            <Overlay
                onPress={jest.fn()}
                dismissalPositionRight={Animated.add<number>(offset, 375)}
            />,
        );
        // Then the hit region follows the panel but the visual scrim must not leave an undimmed strip
        expect(screen.getByTestId('rhp-overlay-dismiss', {includeHiddenElements: true})).toHaveStyle({right: 695});
        expect(screen.getByTestId('rhp-overlay', {includeHiddenElements: true})).toHaveStyle({right: 0});
    });

    it('retains only visual dimming after its root route loses focus', () => {
        // Given a covered root route must not intercept presses intended for the focused route
        jest.mocked(useIsFocused).mockReturnValue(false);
        const onPress = jest.fn();
        // When its overlay renders while that root route is unfocused
        render(<Overlay onPress={onPress} />);
        // Then the dismissal target must disappear so the old route cannot consume a foreground interaction
        expect(screen.queryByTestId('rhp-overlay-dismiss', {includeHiddenElements: true})).toBeNull();
        expect(onPress).not.toHaveBeenCalled();
    });

    it('uses the floating RHP opacity without changing dismissal accessibility', () => {
        // Given floating RHP cards need their own dimming strength without another screen-reader Close action
        const onPress = jest.fn();

        // When the floating-card overlay reaches its fully open state
        render(
            <RHPOverlay
                progress={new Animated.Value(1)}
                onPress={onPress}
            />,
        );

        // Then RHP-specific opacity must not change the shared rule that only the panel exposes accessible dismissal
        expect(screen.getByTestId('rhp-overlay', {includeHiddenElements: true})).toHaveStyle({opacity: variables.rhpOverlayOpacity});
        expect(screen.getByTestId('rhp-overlay-dismiss', {includeHiddenElements: true})).toHaveProp('accessible', false);
    });

    it('keeps the transparent floating-card gap pressable within its vertical bounds', () => {
        // Given a gap above the floating card that must dismiss without adding another layer of dimming
        const onPress = jest.fn();

        // When the gap needs its own dismissal region above the card rather than across its content
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

        // Then the gap must dismiss without darkening the existing scrim or stealing presses from the card
        expect(StyleSheet.flatten(screen.getByTestId('rhp-overlay', {includeHiddenElements: true}).props.style)).not.toHaveProperty('backgroundColor');
        const dismiss = screen.getByTestId('rhp-overlay-dismiss', {includeHiddenElements: true});
        expect(dismiss).toHaveStyle({left: 800, right: 12, top: 0, bottom: 808});
        fireEvent.press(dismiss);
        expect(onPress).toHaveBeenCalledTimes(1);
    });
});
