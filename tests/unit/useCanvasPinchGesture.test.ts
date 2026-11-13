import {act, renderHook} from '@testing-library/react-native';

import useCanvasPinchGesture from '@components/MultiGestureCanvas/useCanvasPinchGesture';

import type {PinchGestureActiveEvent} from 'react-native-gesture-handler';

import {PointerType, usePinchGesture} from 'react-native-gesture-handler';
import {useSharedValue} from 'react-native-reanimated';

jest.mock('react-native-gesture-handler', () => {
    const actual = jest.requireActual<{usePinchGesture: typeof usePinchGesture}>('react-native-gesture-handler');
    return {...actual, usePinchGesture: jest.fn(actual.usePinchGesture)};
});

const usePinchGestureSpy = jest.mocked(usePinchGesture);

function createPinchEvent(scale: number, numberOfPointers = 2): PinchGestureActiveEvent {
    return {scale, numberOfPointers, focalX: 150, focalY: 150, velocity: 0, scaleChange: 1, handlerTag: 1, pointerType: PointerType.TOUCH};
}

function renderPinchGesture(initialScale = 1) {
    const {result, rerender} = renderHook(() => {
        const props = {
            canvasSize: {width: 200, height: 200},
            zoomRange: {min: 1, max: 20},
            zoomScale: useSharedValue(initialScale),
            pinchScale: useSharedValue(initialScale),
            offsetX: useSharedValue(0),
            offsetY: useSharedValue(0),
            pinchTranslateX: useSharedValue(0),
            pinchTranslateY: useSharedValue(0),
            shouldDisableTransformationGestures: useSharedValue(false),
            isTransformGestureActive: useSharedValue(false),
            stopAnimation: jest.fn(),
            onScaleChanged: jest.fn(),
            simultaneousWith: [],
        };
        useCanvasPinchGesture(props);
        return props;
    });
    const config = usePinchGestureSpy.mock.calls.at(-1)?.[0];
    if (!config || typeof config.onUpdate !== 'function') {
        throw new Error('Pinch gesture was not configured');
    }
    return {props: result.current, config: {...config, onUpdate: config.onUpdate}, rerender};
}

describe('useCanvasPinchGesture', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it.each([
        {initialScale: 20, overshoot: 2, boundary: 30, reverse: 0.75, expected: 15},
        {initialScale: 1, overshoot: 0.1, boundary: 0.7, reverse: 1.5, expected: 1.5},
    ])('keeps updating after reaching the $boundary bounce limit', ({initialScale, overshoot, boundary, reverse, expected}) => {
        // Given an active pinch close to a zoom boundary
        const {props, config} = renderPinchGesture(initialScale);
        act(() => config.onActivate?.(createPinchEvent(1)));

        // When a single update overshoots the bounce limit
        act(() => config.onUpdate?.(createPinchEvent(overshoot)));

        // Then the scale stays bounded and reversing the same gesture still works
        expect(props.zoomScale.get()).toBe(boundary);
        act(() => config.onUpdate?.(createPinchEvent(reverse)));
        expect(props.zoomScale.get()).toBe(expected);
    });

    it('recovers from a previously out-of-bounds scale', () => {
        // Given a scale left outside the bounce range by an earlier update
        const {props, config} = renderPinchGesture(20);
        props.zoomScale.set(31);

        // When the next pinch update returns inside the normal range
        act(() => config.onUpdate?.(createPinchEvent(0.5)));

        // Then the old scale cannot prevent zooming out
        expect(props.zoomScale.get()).toBe(10);
    });

    it('ignores a missing pointer without disabling subsequent pinches', () => {
        // Given an active pinch that has zoomed in
        const {props, config, rerender} = renderPinchGesture();
        act(() => config.onActivate?.(createPinchEvent(1)));
        act(() => config.onUpdate?.(createPinchEvent(2)));

        // When a finger is lifted, then two pointers resume
        act(() => config.onUpdate?.(createPinchEvent(10, 1)));
        expect(props.zoomScale.get()).toBe(2);
        rerender({});
        act(() => config.onUpdate?.(createPinchEvent(3)));

        // Then the gesture remains enabled and responds to the next valid update
        expect(usePinchGestureSpy.mock.calls.every(([options]) => options?.enabled !== false)).toBe(true);
        expect(props.zoomScale.get()).toBe(3);
    });

    it('responds to a new pinch after the zoom is reset', () => {
        // Given a completed pinch and a double-tap reset of the shared scales
        const {props, config} = renderPinchGesture();
        act(() => config.onActivate?.(createPinchEvent(1)));
        act(() => config.onUpdate?.(createPinchEvent(5)));
        act(() => config.onDeactivate?.({...createPinchEvent(5), canceled: false}));
        props.zoomScale.set(1);
        props.pinchScale.set(1);

        // When another pinch starts at base scale
        act(() => config.onActivate?.(createPinchEvent(1)));
        act(() => config.onUpdate?.(createPinchEvent(2)));

        // Then the image zooms in again without recreating the recognizer
        expect(props.zoomScale.get()).toBe(2);
        expect(props.isTransformGestureActive.get()).toBe(true);
    });

    it('passes external simultaneous gestures to the recognizer', () => {
        // Given a canvas with external gestures
        const {props, config} = renderPinchGesture();

        // When the pinch recognizer is configured
        // Then its simultaneous gestures use the canvas configuration
        expect(config.simultaneousWith).toBe(props.simultaneousWith);
    });
});
