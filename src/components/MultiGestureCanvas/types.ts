import type {SharedValue} from 'react-native-reanimated';
import type {WorkletFunction} from 'react-native-reanimated/lib/typescript/reanimated2/commonTypes';

type CanvasSize = {
    width: number;
    height: number;
};

type ContentSize = {
    width: number;
    height: number;
};

type ZoomRange = {
    min?: number;
    max?: number;
};

type OnScaleChangedCallback = (zoomScale: number) => void;

type MultiGestureCanvasProps = React.PropsWithChildren<{
    /**
     * Wheter the canvas is currently active (in the screen) or not.
     * Disables certain gestures and functionality
     */
    isActive: boolean;

    /** Handles scale changed event */
    onScaleChanged: OnScaleChangedCallback;

    /** The width and height of the canvas.
     * This is needed in order to properly scale the content in the canvas
     */
    canvasSize: CanvasSize;

    /** The width and height of the content.
     * This is needed in order to properly scale the content in the canvas
     */
    contentSize: ContentSize;

    /** Range of zoom that can be applied to the content by pinching or double tapping. */
    zoomRange?: ZoomRange;
}>;

type MultiGestureCanvasVariables = {
    minContentScale: number;
    maxContentScale: number;
    isSwipingInPager: SharedValue<boolean>;
    zoomScale: SharedValue<number>;
    totalScale: SharedValue<number>;
    pinchScale: SharedValue<number>;
    offsetX: SharedValue<number>;
    offsetY: SharedValue<number>;
    panTranslateX: SharedValue<number>;
    panTranslateY: SharedValue<number>;
    pinchTranslateX: SharedValue<number>;
    pinchTranslateY: SharedValue<number>;
    stopAnimation: WorkletFunction<[], void>;
    reset: WorkletFunction<[boolean], void>;
    onTap: () => void;
};

export type {MultiGestureCanvasProps, CanvasSize, ContentSize, ZoomRange, OnScaleChangedCallback, MultiGestureCanvasVariables};
