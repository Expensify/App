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
