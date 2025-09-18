import {fireEvent, render, screen} from '@testing-library/react-native';
import React from 'react';
import ToggleDistanceUnitButton from '@components/MapView/ToggleDistanceUnitButton/index.android';
import type PressableProps from '@components/Pressable/GenericPressable/types';
import Text from '@components/Text';
import CONST from '@src/CONST';

const onPressMock = jest.fn();
describe('ToggleDistanceUnitButton', () => {
    const renderButton = (props: PressableProps) =>
        render(
            <ToggleDistanceUnitButton
                testID="pressable"
                accessibilityLabel="fake-button"
                accessibilityRole={CONST.ROLE.BUTTON}
                // eslint-disable-next-line react/jsx-props-no-spreading
                {...props}
            >
                <Text>Click me</Text>
            </ToggleDistanceUnitButton>,
        );
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('should trigger onPress when tapped quickly', () => {
        // Given the component is rendered
        renderButton({onPress: onPressMock, accessibilityLabel: 'ToggleDistanceUnitButton'});
        const pressable = screen.getByTestId('pressable');

        // When touch starts on the button
        fireEvent(pressable, 'touchStart', {
            nativeEvent: {
                pageX: 100,
                pageY: 100,
            },
        });

        // When touch end on the button
        fireEvent(pressable, 'touchEnd');

        // Then onPress should be called once
        expect(onPressMock).toHaveBeenCalledTimes(1);
    });

    test('should not trigger onPress when dragged', () => {
        // Given the component is rendered
        renderButton({onPress: onPressMock, accessibilityLabel: 'ToggleDistanceUnitButton'});
        const pressable = screen.getByTestId('pressable');

        // When touch start on the button
        fireEvent(pressable, 'touchStart', {
            nativeEvent: {
                pageX: 100,
                pageY: 100,
            },
        });

        // When the touch moves beyond the threshold (dragging)
        fireEvent(pressable, 'touchMove', {
            nativeEvent: {
                pageX: 110,
                pageY: 110,
            },
        });

        // When touch end on the button
        fireEvent(pressable, 'touchEnd');

        // Then onPress should not be called
        expect(onPressMock).not.toHaveBeenCalled();
    });
});
