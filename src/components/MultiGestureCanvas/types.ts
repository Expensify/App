import type {SharedValue} from 'react-native-reanimated';

/** Dimensions of the canvas rendered by the MultiGestureCanvas */
type CanvasSize = {
    width: number;
    height: number;
};

/** Dimensions of the content passed to the MultiGestureCanvas */
type ContentSize = {
    width: number;
    height: number;
};

/** Range of zoom that can be applied to the content by pinching or double tapping. */
type ZoomRange = {
    min: number;
    max: number;
};

/** Triggered whenever the scale of the MultiGestureCanvas changes */
type OnScaleChangedCallback = (zoomScale: number) => void;

/** Triggered when the canvas is tapped (single tap) */
type OnTapCallback = () => void;

/** Triggered when the swipe down gesture on canvas occurs  */
type OnSwipeDownCallback = () => void;

/** Types used of variables used within the MultiGestureCanvas component and it's hooks */
type MultiGestureCanvasVariables = {
    canvasSize: CanvasSize;
    contentSize: ContentSize;
    zoomRange: ZoomRange;
    minContentScale: number;
    maxContentScale: number;
    shouldDisableTransformationGestures: SharedValue<boolean>;
    isSwipingDownToClose: SharedValue<boolean>;
    zoomScale: SharedValue<number>;
    totalScale: SharedValue<number>;
    pinchScale: SharedValue<number>;
    offsetX: SharedValue<number>;
    offsetY: SharedValue<number>;
    panTranslateX: SharedValue<number>;
    panTranslateY: SharedValue<number>;
    pinchTranslateX: SharedValue<number>;
    pinchTranslateY: SharedValue<number>;
    stopAnimation: () => void;
    reset: (animated: boolean, callback: () => void) => void;
    onTap: OnTapCallback | undefined;
    onScaleChanged: OnScaleChangedCallback | undefined;
    onSwipeDown: OnSwipeDownCallback | undefined;
};

export type {CanvasSize, ContentSize, ZoomRange, OnScaleChangedCallback, OnTapCallback, MultiGestureCanvasVariables, OnSwipeDownCallback};
