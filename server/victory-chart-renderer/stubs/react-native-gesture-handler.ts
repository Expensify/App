// Minimal `react-native-gesture-handler` stub for the headless Bun renderer.
//
// The chart code builds gesture configs (`Gesture.Pan()...`) and composes
// them (`Gesture.Race`, `Gesture.Simultaneous`) during render even when no
// gesture is ever attached. We expose a chainable builder so those calls
// succeed; the headless branch of `CartesianChart` early-returns before any
// gesture handlers would actually be attached.

import type {FunctionComponent, PropsWithChildren} from 'react';

class GestureBuilder {
    onTouchesDown(): this {
        return this;
    }

    onStart(): this {
        return this;
    }

    onTouchesMove(): this {
        return this;
    }

    onTouchesUp(): this {
        return this;
    }

    onEnd(): this {
        return this;
    }

    onFinalize(): this {
        return this;
    }

    onChange(): this {
        return this;
    }

    onUpdate(): this {
        return this;
    }

    activateAfterLongPress(): this {
        return this;
    }

    activeOffsetX(): this {
        return this;
    }

    activeOffsetY(): this {
        return this;
    }

    failOffsetX(): this {
        return this;
    }

    failOffsetY(): this {
        return this;
    }

    minDistance(): this {
        return this;
    }

    enabled(): this {
        return this;
    }

    runOnJS(): this {
        return this;
    }
}

const buildGesture = (): GestureBuilder => new GestureBuilder();

export const Gesture = {
    Pan: buildGesture,
    Pinch: buildGesture,
    Rotation: buildGesture,
    Tap: buildGesture,
    LongPress: buildGesture,
    Manual: buildGesture,
    Race: (..._gestures: unknown[]) => buildGesture(),
    Simultaneous: (..._gestures: unknown[]) => buildGesture(),
    Exclusive: (..._gestures: unknown[]) => buildGesture(),
};

const noopComponent: FunctionComponent<PropsWithChildren<unknown>> = () => null;

export const GestureHandlerRootView = noopComponent;
export const GestureDetector = noopComponent;

export type ComposedGesture = GestureBuilder;
export type GestureType = GestureBuilder;
export type PanGesture = GestureBuilder;
export type PinchGesture = GestureBuilder;
export type TouchData = {id: number; x: number; y: number; absoluteX: number; absoluteY: number};
