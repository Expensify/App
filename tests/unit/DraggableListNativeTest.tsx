import {act, fireEvent, render, screen, waitFor} from '@testing-library/react-native';

import DraggableList from '@components/DraggableList/index.native';
import {PressableWithoutFeedback} from '@components/Pressable';

import type {LegendListRef} from '@legendapp/list/react-native';
import type {useRef as useReactRef} from 'react';
import type * as ReanimatedModule from 'react-native-reanimated';
import type * as Worklets from 'react-native-worklets';

import {LegendList as LibraryLegendList} from '@legendapp/list/react-native';
import {View} from 'react-native';
import {Gesture, State} from 'react-native-gesture-handler';

jest.mock('react-native-reanimated', () => {
    const React = jest.requireActual<{useRef: typeof useReactRef}>('react');
    const Reanimated = jest.requireActual<typeof ReanimatedModule>('react-native-reanimated/mock');
    return {
        ...Reanimated,
        useSharedValue: <Value,>(initialValue: Value) => React.useRef(Reanimated.useSharedValue(initialValue)).current,
    };
});

jest.mock('react-native-worklets', () => ({
    ...jest.requireActual<typeof Worklets>('react-native-worklets/src/mock'),
    scheduleOnRN: (mockFunction: (...mockArguments: unknown[]) => unknown, ...mockArguments: unknown[]) => mockFunction(...mockArguments),
}));

const DATA = ['first', 'second', 'third'];

type TestGestureHandlers = {
    onEnd?: (event: {translationY: number}, success: boolean) => void;
    onFinalize?: (event: {translationY: number}, success: boolean) => void;
    onTouchesMove?: (event: Record<string, never>, stateManager: {activate: () => void}) => void;
    onUpdate?: (event: {translationY: number}) => void;
};

function renderDraggableList(onDragEnd = jest.fn()) {
    render(
        <DraggableList
            data={DATA}
            keyExtractor={(item) => item}
            onDragEnd={onDragEnd}
            renderItem={({drag, isActive, item}) => (
                <PressableWithoutFeedback
                    accessibilityLabel={`${item} drag handle`}
                    accessibilityRole="button"
                    onLongPress={drag}
                    onPress={() => {}}
                    testID={`${item}-drag-handle`}
                >
                    <View testID={`${item}-${isActive ? 'active' : 'inactive'}`} />
                </PressableWithoutFeedback>
            )}
        />,
    );
    for (const [index] of DATA.entries()) {
        fireEvent(screen.getByTestId(`draggable-list-row-layout-${index}`), 'layout', {nativeEvent: {layout: {height: 40, width: 200, x: 0, y: 0}}});
    }
    const listRef = getInternalListRef();
    const originalGetState = listRef.getState;
    listRef.getState = () => ({...originalGetState(), elementAtIndex: () => undefined});
}

function getInternalListRef(): LegendListRef {
    const ref = jest.mocked(LibraryLegendList).mock.lastCall?.[0].ref;
    if (!ref || typeof ref === 'function' || !('current' in ref) || !ref.current) {
        throw new Error('Expected DraggableList to forward an object ref to LegendList');
    }
    return ref.current;
}

function requestDrag(item: string) {
    fireEvent(screen.getByTestId(`${item}-drag-handle`), 'longPress');
}

function fireDrag(index: number, translationY: number, endState: State = State.END) {
    const handlers = getRowGestureHandlers(index);
    const event = {translationY};
    act(() => {
        handlers.onUpdate?.(event);
        if (endState === State.END) {
            handlers.onEnd?.(event, true);
        }
        handlers.onFinalize?.(event, endState === State.END);
    });
}

function moveTouches(index: number, activate: jest.Mock) {
    const handlers = getRowGestureHandlers(index);
    act(() => handlers.onTouchesMove?.({}, {activate}));
}

function getRowGestureHandlers(index: number): TestGestureHandlers {
    const testID = `draggable-list-row-${index}`;
    for (const result of jest.mocked(Gesture.Pan).mock.results.toReversed()) {
        const gesture: unknown = result.value;
        if (!isRecord(gesture) || !isRecord(gesture.config) || gesture.config.testId !== testID || !isTestGestureHandlers(gesture.handlers)) {
            continue;
        }
        return gesture.handlers;
    }
    throw new Error(`Expected registered pan gesture handlers for ${testID}`);
}

function isTestGestureHandlers(value: unknown): value is TestGestureHandlers {
    return typeof value === 'object' && value !== null;
}

async function flushWorkletCallbacks() {
    act(() => jest.runAllTicks());
}

describe('DraggableList on native platforms', () => {
    beforeEach(() => {
        jest.useFakeTimers();
        const createPanGesture = Gesture.Pan;
        jest.spyOn(Gesture, 'Pan').mockImplementation(() => createPanGesture().runOnJS(true));
    });

    afterEach(() => {
        jest.restoreAllMocks();
        jest.useRealTimers();
    });

    it('does not start dragging when a row gesture moves before the consumer calls drag', async () => {
        const onDragEnd = jest.fn();
        renderDraggableList(onDragEnd);
        const activate = jest.fn();

        moveTouches(0, activate);
        await flushWorkletCallbacks();
        fireEvent.scroll(screen.getByTestId('draggable-list'), {
            nativeEvent: {contentOffset: {x: 0, y: 40}, contentSize: {height: 300, width: 200}, layoutMeasurement: {height: 100, width: 200}},
        });

        expect(activate).not.toHaveBeenCalled();
        expect(onDragEnd).not.toHaveBeenCalled();
        expect(screen.getByTestId('first-inactive')).toBeOnTheScreen();
    });

    it('reorders rows after the consumer calls drag', async () => {
        const onDragEnd = jest.fn();
        renderDraggableList(onDragEnd);
        requestDrag('first');
        expect(await screen.findByTestId('first-active')).toBeOnTheScreen();
        const activate = jest.fn();
        moveTouches(0, activate);
        expect(activate).toHaveBeenCalledTimes(1);

        fireDrag(0, 85);
        await flushWorkletCallbacks();

        await waitFor(() => expect(onDragEnd).toHaveBeenCalledWith({data: ['second', 'third', 'first']}));
    });

    it('clears a requested drag when the pointer is released without moving', async () => {
        renderDraggableList();
        requestDrag('second');
        expect(await screen.findByTestId('second-active')).toBeOnTheScreen();

        fireDrag(1, 0, State.FAILED);
        await flushWorkletCallbacks();

        expect(await screen.findByTestId('second-inactive')).toBeOnTheScreen();
    });

    it('keeps the first requested row active and resets its native stacking', async () => {
        renderDraggableList();
        const setNativeProps = jest.fn();
        const listRef = getInternalListRef();
        const originalGetState = listRef.getState;
        listRef.getState = () => ({...originalGetState(), elementAtIndex: () => ({setNativeProps})});

        requestDrag('first');
        requestDrag('second');
        expect(await screen.findByTestId('first-active')).toBeOnTheScreen();
        expect(screen.getByTestId('second-inactive')).toBeOnTheScreen();
        expect(setNativeProps).toHaveBeenCalledTimes(1);

        fireDrag(0, 0, State.CANCELLED);
        await flushWorkletCallbacks();
        expect(await screen.findByTestId('first-inactive')).toBeOnTheScreen();
        expect(setNativeProps).toHaveBeenLastCalledWith({style: {zIndex: 0}});
    });

    it('scrolls automatically on the first drag before any scroll event', () => {
        renderDraggableList();
        fireEvent(screen.getByTestId('draggable-list'), 'layout', {nativeEvent: {layout: {height: 100, width: 200, x: 0, y: 0}}});
        fireEvent(screen.getByTestId('draggable-list'), 'contentSizeChange', 200, 300);
        const listRef = getInternalListRef();
        requestDrag('third');

        act(() => getRowGestureHandlers(2).onUpdate?.({translationY: 10}));
        act(() => jest.runAllTicks());
        act(() => jest.advanceTimersByTime(64));

        expect(listRef.scrollToOffset).toHaveBeenCalled();
        fireDrag(2, 10, State.CANCELLED);
        act(() => jest.runAllTicks());
    });

    it('passes active and renderer state through Legend extraData', async () => {
        renderDraggableList();
        requestDrag('first');

        expect(await screen.findByTestId('first-active')).toBeOnTheScreen();
        const listProps: unknown = jest.mocked(LibraryLegendList).mock.lastCall?.[0];
        expect(isRecord(listProps)).toBe(true);
        if (!isRecord(listProps)) {
            throw new Error('Expected LegendList props');
        }
        expect(isRecord(listProps.extraData)).toBe(true);
        if (!isRecord(listProps.extraData)) {
            throw new Error('Expected LegendList extraData');
        }
        expect(listProps.extraData.activeItemIndex).toBe(0);
        expect(typeof listProps.extraData.renderItem).toBe('function');

        fireDrag(0, 0, State.CANCELLED);
        await flushWorkletCallbacks();
        expect(await screen.findByTestId('first-inactive')).toBeOnTheScreen();
    });
});

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === 'object' && value !== null;
}
