import type {SharedValue} from 'react-native-reanimated';
import type {WorkletFunction} from 'react-native-reanimated/lib/typescript/reanimated2/commonTypes';

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
    min?: number;
    max?: number;
};

/** Triggered whenever the scale of the MultiGestureCanvas changes */
type OnScaleChangedCallback = (zoomScale: number) => void;

/** Types used of variables used within the MultiGestureCanvas component and it's hooks */
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

export type {CanvasSize, ContentSize, ZoomRange, OnScaleChangedCallback, MultiGestureCanvasVariables};
