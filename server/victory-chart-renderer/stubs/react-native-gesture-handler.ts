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

const Gesture = {
    Pan: buildGesture,
    Pinch: buildGesture,
    Rotation: buildGesture,
    Tap: buildGesture,
    LongPress: buildGesture,
    Manual: buildGesture,
    Race: () => buildGesture(),
    Simultaneous: () => buildGesture(),
    Exclusive: () => buildGesture(),
};

const noopComponent: FunctionComponent<PropsWithChildren<unknown>> = () => null;

const GestureHandlerRootView = noopComponent;
const GestureDetector = noopComponent;

type ComposedGesture = GestureBuilder;
type GestureType = GestureBuilder;
type PanGesture = GestureBuilder;
type PinchGesture = GestureBuilder;
type TouchData = {id: number; x: number; y: number; absoluteX: number; absoluteY: number};

export type {ComposedGesture, GestureType, PanGesture, PinchGesture, TouchData};
export {Gesture, GestureHandlerRootView, GestureDetector};
