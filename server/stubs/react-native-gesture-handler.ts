// Minimal `react-native-gesture-handler` stub for the headless Bun renderer.
//
// The chart code builds gesture configs (`Gesture.Pan()...`) and composes
// them (`Gesture.Race`, `Gesture.Simultaneous`) during render even when no
// gesture is ever attached. We expose a chainable builder so those calls
// succeed; the headless branch of `CartesianChart` early-returns before any
// gesture handlers would actually be attached.
import type {FunctionComponent, PropsWithChildren} from 'react';

class GestureBuilder {
    // Chainable no-ops: victory-native builds gesture configs during render even in headless mode.
    onTouchesDown = (): this => this;

    onStart = (): this => this;

    onTouchesMove = (): this => this;

    onTouchesUp = (): this => this;

    onEnd = (): this => this;

    onFinalize = (): this => this;

    onChange = (): this => this;

    onUpdate = (): this => this;

    activateAfterLongPress = (): this => this;

    activeOffsetX = (): this => this;

    activeOffsetY = (): this => this;

    failOffsetX = (): this => this;

    failOffsetY = (): this => this;

    minDistance = (): this => this;

    enabled = (): this => this;

    runOnJS = (): this => this;
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

const passThroughComponent: FunctionComponent<PropsWithChildren<unknown>> = ({children}) => children;

const GestureHandlerRootView = passThroughComponent;
const GestureDetector = passThroughComponent;

type ComposedGesture = GestureBuilder;
type GestureType = GestureBuilder;
type PanGesture = GestureBuilder;
type PinchGesture = GestureBuilder;
type TouchData = {id: number; x: number; y: number; absoluteX: number; absoluteY: number};

export type {ComposedGesture, GestureType, PanGesture, PinchGesture, TouchData};
export {Gesture, GestureHandlerRootView, GestureDetector};
