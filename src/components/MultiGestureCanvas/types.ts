import type {SharedValue} from 'react-native-reanimated';
import type {Dimensions} from '@src/types/utils/Layout';

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
    canvasSize: Dimensions;
    contentSize: Dimensions;
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

export type {ZoomRange, OnScaleChangedCallback, OnTapCallback, MultiGestureCanvasVariables, OnSwipeDownCallback};
