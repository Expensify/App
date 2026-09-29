import type {Dimensions} from '@src/types/utils/Layout';

import type {LayoutChangeEvent} from 'react-native';

import {useState} from 'react';
import {PixelRatio} from 'react-native';

/**
 * Discriminated on `isCanvasLoading` so that checking it narrows `canvasSize`
 * from `Dimensions | undefined` to `Dimensions`.
 */
type CanvasSizeResult =
    | {
          /** Measured layout size of the canvas. */
          canvasSize: Dimensions;

          /** Whether the canvas is still waiting for its first layout measurement. */
          isCanvasLoading: false;

          /** onLayout handler that records the measured canvas size. */
          updateCanvasSize: (event: LayoutChangeEvent) => void;
      }
    | {
          canvasSize: undefined;
          isCanvasLoading: true;
          updateCanvasSize: (event: LayoutChangeEvent) => void;
      };

/** Tracks the measured layout size of a multi-gesture canvas. */
function useCanvasSize(): CanvasSizeResult {
    const [canvasSize, setCanvasSize] = useState<Dimensions>();

    const updateCanvasSize = ({
        nativeEvent: {
            layout: {width: layoutWidth, height: layoutHeight},
        },
    }: LayoutChangeEvent) => setCanvasSize({width: PixelRatio.roundToNearestPixel(layoutWidth), height: PixelRatio.roundToNearestPixel(layoutHeight)});

    if (canvasSize === undefined) {
        return {canvasSize, isCanvasLoading: true, updateCanvasSize};
    }

    return {canvasSize, isCanvasLoading: false, updateCanvasSize};
}

export default useCanvasSize;
