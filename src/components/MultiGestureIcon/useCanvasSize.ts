import type {Dimensions} from '@src/types/utils/Layout';

import type {LayoutChangeEvent} from 'react-native';

import {useState} from 'react';
import {PixelRatio} from 'react-native';

/** Tracks the measured layout size of the multi-gesture icon canvas. */
function useCanvasSize() {
    const [canvasSize, setCanvasSize] = useState<Dimensions>();
    const isCanvasLoading = canvasSize === undefined;

    const updateCanvasSize = ({
        nativeEvent: {
            layout: {width: layoutWidth, height: layoutHeight},
        },
    }: LayoutChangeEvent) => setCanvasSize({width: PixelRatio.roundToNearestPixel(layoutWidth), height: PixelRatio.roundToNearestPixel(layoutHeight)});

    return {canvasSize, isCanvasLoading, updateCanvasSize};
}

export default useCanvasSize;
