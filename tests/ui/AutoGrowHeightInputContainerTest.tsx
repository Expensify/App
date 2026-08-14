import {act, fireEvent, render, screen, waitFor} from '@testing-library/react-native';

import AutoGrowHeightInputContainer from '@components/AutoGrowHeightInputContainer';
import ScrollView from '@components/ScrollView';

import variables from '@styles/variables';

import React from 'react';
import {View} from 'react-native';

type MeasureCallback = (x: number, y: number, width: number, height: number, pageX: number, pageY: number) => void;
type MockViewHandle = {measure: (callback: MeasureCallback) => void};
type MockViewProps = {children?: React.ReactNode; [key: string]: unknown};
type MockReactNativeModule = {View: React.ComponentType<MockViewProps>; [key: string]: unknown};

const mockMeasure = jest.fn<void, [MeasureCallback]>();

jest.mock('react-native', () => {
    const MockReact = jest.requireActual<typeof React>('react');
    const MockReactNative = jest.requireActual<MockReactNativeModule>('react-native');
    const MockMeasuredView = MockReact.forwardRef<MockViewHandle, MockViewProps>((props, ref) => {
        MockReact.useImperativeHandle(ref, () => ({measure: mockMeasure}));
        return MockReact.createElement(MockReactNative.View, props);
    });

    return {...MockReactNative, View: MockMeasuredView};
});

jest.mock('@hooks/useThemeStyles', () => () => ({flex1: {flex: 1}}));

describe('AutoGrowHeightInputContainer', () => {
    beforeEach(() => {
        mockMeasure.mockReset();
    });

    it('measures reserved content after clamping and tracks layout changes', async () => {
        const measuredContentHeights: number[] = [];
        mockMeasure.mockImplementation((callback) => {
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
        await waitFor(() => expect(mockMeasure).toHaveBeenCalledTimes(1));

        measuredContentHeights.push(76);
        fireEvent(content, 'layout', {nativeEvent: {layout: {height: 444}}});
        await waitFor(() => expect(screen.getByTestId('measured-height').props.accessibilityLabel).toBe('396'));

        measuredContentHeights.push(100);
        fireEvent(content, 'layout', {nativeEvent: {layout: {height: 444}}});
        await waitFor(() => expect(screen.getByTestId('measured-height').props.accessibilityLabel).toBe('372'));

        measuredContentHeights.push(372);
        fireEvent(content, 'layout', {nativeEvent: {layout: {height: 372}}});
        await waitFor(() => expect(screen.getByTestId('measured-height').props.accessibilityLabel).toBe('420'));

        measuredContentHeights.push(284, 76);
        fireEvent(container, 'layout', {nativeEvent: {layout: {height: 260}}});
        await waitFor(() => expect(screen.getByTestId('measured-height').props.accessibilityLabel).toBe('236'));

        measuredContentHeights.push(76);
        fireEvent(container, 'layout', {nativeEvent: {layout: {height: 0}}});
        await waitFor(() => expect(screen.getByTestId('measured-height').props.accessibilityLabel).toBe(String(variables.componentSizeLarge)));
        expect(mockMeasure).toHaveBeenCalled();
    });

    it('keeps an in-flight measurement valid when the same layout repeats', async () => {
        const measurementCallbacks: Array<(x: number, y: number, width: number, height: number, pageX: number, pageY: number) => void> = [];
        mockMeasure.mockImplementation((callback) => {
            measurementCallbacks.push(callback);
        });

        render(
            <AutoGrowHeightInputContainer>
                {(maxAutoGrowHeight) => (
                    <View
                        testID="deferred-height"
                        accessibilityLabel={String(maxAutoGrowHeight)}
                    />
                )}
            </AutoGrowHeightInputContainer>,
        );

        const container = screen.UNSAFE_getByType(ScrollView);
        const content = screen.getByTestId('deferred-height').parent;
        if (!content) {
            throw new Error('Expected the deferred input to have a content container');
        }

        fireEvent(container, 'layout', {nativeEvent: {layout: {height: 420, width: 300}}});
        fireEvent(container, 'layout', {nativeEvent: {layout: {height: 420, width: 300}}});
        await waitFor(() => expect(measurementCallbacks).toHaveLength(1));

        fireEvent(container, 'layout', {nativeEvent: {layout: {height: 420, width: 280}}});
        await waitFor(() => expect(measurementCallbacks).toHaveLength(2));

        fireEvent(content, 'layout', {nativeEvent: {layout: {height: 430, width: 280}}});
        fireEvent(content, 'layout', {nativeEvent: {layout: {height: 430, width: 280}}});
        await waitFor(() => expect(measurementCallbacks).toHaveLength(3));

        fireEvent(container, 'layout', {nativeEvent: {layout: {height: 260, width: 280}}});
        await waitFor(() => expect(measurementCallbacks).toHaveLength(4));
        fireEvent(content, 'layout', {nativeEvent: {layout: {height: 284, width: 280}}});
        await waitFor(() => expect(measurementCallbacks).toHaveLength(5));
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
        await waitFor(() => expect(measurementCallbacks).toHaveLength(6));
        expect(screen.getByTestId('deferred-height').props.accessibilityLabel).toBe(String(variables.componentSizeLarge));

        fireEvent(content, 'layout', {nativeEvent: {layout: {height: 80, width: 280}}});
        fireEvent(content, 'layout', {nativeEvent: {layout: {height: 80, width: 280}}});
        await waitFor(() => expect(measurementCallbacks).toHaveLength(7));

        act(() => measurementCallbacks[5](0, 0, 0, 100, 0, 0));
        expect(screen.getByTestId('deferred-height').props.accessibilityLabel).toBe(String(variables.componentSizeLarge));

        act(() => measurementCallbacks[6](0, 0, 0, 80, 0, 0));
        expect(screen.getByTestId('deferred-height').props.accessibilityLabel).toBe('232');
    });
});
