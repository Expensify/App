import {fireEvent, render, screen} from '@testing-library/react-native';

import Overlay from '@libs/Navigation/AppNavigator/Navigators/Overlay/index.native';

import variables from '@styles/variables';

import type {StackCardInterpolationProps} from '@react-navigation/stack';

import {useIsFocused} from '@react-navigation/native';
import {useCardAnimation} from '@react-navigation/stack';
import React from 'react';
// eslint-disable-next-line no-restricted-imports
import {Animated} from 'react-native';

import createMock from '../utils/createMock';

jest.mock('@react-navigation/native', () => ({...jest.requireActual('@react-navigation/native'), useIsFocused: jest.fn()}));
jest.mock('@react-navigation/stack', () => ({...jest.requireActual('@react-navigation/stack'), useCardAnimation: jest.fn()}));

describe('Native RHP scrims', () => {
    beforeEach(() => {
        jest.mocked(useIsFocused).mockReturnValue(true);
        jest.mocked(useCardAnimation).mockReturnValue(createMock<StackCardInterpolationProps>({current: {progress: new Animated.Value(0)}}));
    });

    it.each([0, 0.25, 1])('fades with navigation progress %s without a transform', (progress) => {
        jest.mocked(useCardAnimation).mockReturnValue(createMock<StackCardInterpolationProps>({current: {progress: new Animated.Value(progress)}}));
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

    it('retains only visual dimming after its root route loses focus', () => {
        jest.mocked(useIsFocused).mockReturnValue(false);
        const onPress = jest.fn();
        render(<Overlay onPress={onPress} />);
        expect(screen.queryByTestId('rhp-overlay-dismiss', {includeHiddenElements: true})).toBeNull();
        expect(onPress).not.toHaveBeenCalled();
    });
});
