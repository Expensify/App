import {act, fireEvent, render, screen} from '@testing-library/react-native';

import AutoGrowHeightInputContainer from '@components/AutoGrowHeightInputContainer';
import ScrollView from '@components/ScrollView';

import variables from '@styles/variables';

import React from 'react';
import {View} from 'react-native';

jest.mock('@hooks/useThemeStyles', () => () => ({flex1: {flex: 1}}));

describe('AutoGrowHeightInputContainer', () => {
    it('measures reserved content after clamping and tracks layout changes', () => {
        const measuredContentHeights: number[] = [];
        const measure = jest.fn((callback: (x: number, y: number, width: number, height: number, pageX: number, pageY: number) => void) => {
            callback(0, 0, 0, measuredContentHeights.shift() ?? 0, 0, 0);
        });

        render(
            <AutoGrowHeightInputContainer>
                {(maxAutoGrowHeight) => (
                    <View
                        testID="measured-height"
                        accessibilityLabel={String(maxAutoGrowHeight)}
                    />
                )}
            </AutoGrowHeightInputContainer>,
            {createNodeMock: () => ({measure})},
        );

        const content = screen.getByTestId('measured-height').parent;
        if (!content) {
            throw new Error('Expected the measured input to have a content container');
        }
        const container = screen.UNSAFE_getByType(ScrollView);

        expect(screen.getByTestId('measured-height').props.accessibilityLabel).toBe(String(variables.textInputAutoGrowMaxHeight));
        expect(container.props.keyboardShouldPersistTaps).toBe('handled');
        expect(container.props.nestedScrollEnabled).toBe(true);

        measuredContentHeights.push(420);
        fireEvent(container, 'layout', {nativeEvent: {layout: {height: 420}}});
        expect(screen.getByTestId('measured-height').props.accessibilityLabel).toBe('420');

        measuredContentHeights.push(76);
        fireEvent(content, 'layout', {nativeEvent: {layout: {height: 444}}});
        expect(screen.getByTestId('measured-height').props.accessibilityLabel).toBe('396');

        measuredContentHeights.push(100);
        fireEvent(content, 'layout', {nativeEvent: {layout: {height: 444}}});
        expect(screen.getByTestId('measured-height').props.accessibilityLabel).toBe('372');

        measuredContentHeights.push(372);
        fireEvent(content, 'layout', {nativeEvent: {layout: {height: 372}}});
        expect(screen.getByTestId('measured-height').props.accessibilityLabel).toBe('420');

        measuredContentHeights.push(284, 76);
        fireEvent(container, 'layout', {nativeEvent: {layout: {height: 260}}});
        expect(screen.getByTestId('measured-height').props.accessibilityLabel).toBe('236');

        measuredContentHeights.push(76);
        fireEvent(container, 'layout', {nativeEvent: {layout: {height: 0}}});
        expect(screen.getByTestId('measured-height').props.accessibilityLabel).toBe(String(variables.componentSizeLarge));
        expect(measure).toHaveBeenCalled();
    });

    it('keeps an in-flight measurement valid when the same layout repeats', () => {
        const measurementCallbacks: Array<(x: number, y: number, width: number, height: number, pageX: number, pageY: number) => void> = [];

        render(
            <AutoGrowHeightInputContainer>
                {(maxAutoGrowHeight) => (
                    <View
                        testID="deferred-height"
                        accessibilityLabel={String(maxAutoGrowHeight)}
                    />
                )}
            </AutoGrowHeightInputContainer>,
            {
                createNodeMock: () => ({
                    measure: (callback: (x: number, y: number, width: number, height: number, pageX: number, pageY: number) => void) => {
                        measurementCallbacks.push(callback);
                    },
                }),
            },
        );

        const container = screen.UNSAFE_getByType(ScrollView);
        const content = screen.getByTestId('deferred-height').parent;
        if (!content) {
            throw new Error('Expected the deferred input to have a content container');
        }

        fireEvent(container, 'layout', {nativeEvent: {layout: {height: 420, width: 300}}});
        fireEvent(container, 'layout', {nativeEvent: {layout: {height: 420, width: 300}}});
        expect(measurementCallbacks).toHaveLength(1);

        fireEvent(container, 'layout', {nativeEvent: {layout: {height: 420, width: 280}}});
        expect(measurementCallbacks).toHaveLength(2);

        fireEvent(content, 'layout', {nativeEvent: {layout: {height: 430, width: 280}}});
        fireEvent(content, 'layout', {nativeEvent: {layout: {height: 430, width: 280}}});
        expect(measurementCallbacks).toHaveLength(3);

        fireEvent(container, 'layout', {nativeEvent: {layout: {height: 260, width: 280}}});
        fireEvent(content, 'layout', {nativeEvent: {layout: {height: 284, width: 280}}});
        expect(measurementCallbacks).toHaveLength(5);
        expect(screen.getByTestId('deferred-height').props.accessibilityLabel).toBe('260');

        act(() => {
            for (const callback of measurementCallbacks.slice(0, 4)) {
                callback(0, 0, 0, 444, 0, 0);
            }
        });
        expect(screen.getByTestId('deferred-height').props.accessibilityLabel).toBe('260');

        act(() => measurementCallbacks[4](0, 0, 0, 260, 0, 0));
        expect(screen.getByTestId('deferred-height').props.accessibilityLabel).toBe('260');

        fireEvent(content, 'layout', {nativeEvent: {layout: {height: 284, width: 280}}});
        expect(measurementCallbacks).toHaveLength(6);
        expect(screen.getByTestId('deferred-height').props.accessibilityLabel).toBe(String(variables.componentSizeLarge));

        fireEvent(content, 'layout', {nativeEvent: {layout: {height: 80, width: 280}}});
        fireEvent(content, 'layout', {nativeEvent: {layout: {height: 80, width: 280}}});
        expect(measurementCallbacks).toHaveLength(7);

        act(() => measurementCallbacks[5](0, 0, 0, 100, 0, 0));
        expect(screen.getByTestId('deferred-height').props.accessibilityLabel).toBe(String(variables.componentSizeLarge));

        act(() => measurementCallbacks[6](0, 0, 0, 80, 0, 0));
        expect(screen.getByTestId('deferred-height').props.accessibilityLabel).toBe('232');
    });
});
