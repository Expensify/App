import React, {useContext, useEffect, useMemo, useRef} from 'react';
import {View} from 'react-native';
import {Gesture, GestureDetector} from 'react-native-gesture-handler';
import Animated, {cancelAnimation, runOnUI, useAnimatedReaction, useAnimatedStyle, useDerivedValue, useSharedValue, withSpring} from 'react-native-reanimated';
import AttachmentCarouselPagerContext from '@components/Attachments/AttachmentCarousel/Pager/AttachmentCarouselPagerContext';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import getCanvasFitScale from './getCanvasFitScale';
import {defaultZoomRange, multiGestureCanvasDefaultProps, multiGestureCanvasPropTypes} from './propTypes';
import usePanGesture from './usePanGesture';
import usePinchGesture from './usePinchGesture';
import useTapGestures from './useTapGestures';
import * as MultiGestureCanvasUtils from './utils';

const SPRING_CONFIG = MultiGestureCanvasUtils.SPRING_CONFIG;
const zoomScaleBounceFactors = MultiGestureCanvasUtils.zoomScaleBounceFactors;
const useWorkletCallback = MultiGestureCanvasUtils.useWorkletCallback;

function getDeepDefaultProps({contentSize: contentSizeProp = {}, zoomRange: zoomRangeProp = {}}) {
    const contentSize = {
        width: contentSizeProp.width == null ? 1 : contentSizeProp.width,
        height: contentSizeProp.height == null ? 1 : contentSizeProp.height,
    };

    const zoomRange = {
        min: zoomRangeProp.min == null ? defaultZoomRange.min : zoomRangeProp.min,
        max: zoomRangeProp.max == null ? defaultZoomRange.max : zoomRangeProp.max,
    };

    return {contentSize, zoomRange};
}

function noopWorklet() {
    'worklet';

    // noop
}

function MultiGestureCanvas({canvasSize, isActive = true, onScaleChanged, children, ...props}) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {contentSize, zoomRange} = getDeepDefaultProps(props);

    const attachmentCarouselPagerContext = useContext(AttachmentCarouselPagerContext);

    const pagerRefFallback = useRef(null);
    const {onTap, onSwipeDown, onSwipeDownEnd, pagerRef, shouldPagerScroll, isSwipingInPager, onPinchGestureChange} = attachmentCarouselPagerContext || {
        onTap: () => undefined,
        onSwipeDown: noopWorklet,
        onSwipeDownEnd: () => undefined,
        onPinchGestureChange: () => undefined,
        pagerRef: pagerRefFallback,
        shouldPagerScroll: false,
        isSwipingInPager: false,
        ...props,
    };

    const {minScale: minContentScale, maxScale: maxContentScale} = useMemo(() => getCanvasFitScale({canvasSize, contentSize}), [canvasSize, contentSize]);

    const zoomScale = useSharedValue(1);
    // Adding together the pinch zoom scale and the initial scale to fit the content into the canvas
    // Using the smaller content scale, so that the immage is not bigger than the canvas
    // and not smaller than needed to fit
    const totalScale = useDerivedValue(() => zoomScale.value * minContentScale, [minContentScale]);

    // total offset of the canvas (panning + pinching offset)
    const totalOffsetX = useSharedValue(0);
    const totalOffsetY = useSharedValue(0);

    // pan gesture
    const panTranslateX = useSharedValue(0);
    const panTranslateY = useSharedValue(0);
    const isSwipingDownToClose = useSharedValue(false);
    const panGestureRef = useRef(Gesture.Pan());

    // pinch gesture
    const pinchTranslateX = useSharedValue(0);
    const pinchTranslateY = useSharedValue(0);
    const pinchBounceTranslateX = useSharedValue(0);
    const pinchBounceTranslateY = useSharedValue(0);
    // scale in between gestures
    const pinchScaleOffset = useSharedValue(1);

    const stopAnimation = useWorkletCallback(() => {
        cancelAnimation(totalOffsetX);
        cancelAnimation(totalOffsetY);
    });

    const reset = useWorkletCallback((animated) => {
        pinchScaleOffset.value = 1;

        stopAnimation();

        if (animated) {
            totalOffsetX.value = withSpring(0, SPRING_CONFIG);
            totalOffsetY.value = withSpring(0, SPRING_CONFIG);
            zoomScale.value = withSpring(1, SPRING_CONFIG);
        } else {
            totalOffsetX.value = 0;
            totalOffsetY.value = 0;
            zoomScale.value = 1;
            panTranslateX.value = 0;
            panTranslateY.value = 0;
            pinchTranslateX.value = 0;
            pinchTranslateY.value = 0;
        }
    });

    const {singleTap, doubleTap} = useTapGestures({
        canvasSize,
        contentSize,
        minContentScale,
        maxContentScale,
        panGestureRef,
        totalOffsetX,
        totalOffsetY,
        pinchScaleOffset,
        zoomScale,
        reset,
        stopAnimation,
        onScaleChanged,
        onTap,
    });

    const panGesture = usePanGesture({
        canvasSize,
        contentSize,
        panGestureRef,
        pagerRef,
        singleTap,
        doubleTap,
        zoomScale,
        zoomRange,
        totalScale,
        totalOffsetX,
        totalOffsetY,
        panTranslateX,
        panTranslateY,
        isSwipingInPager,
        isSwipingDownToClose,
        onSwipeDownEnd,
        stopAnimation,
    });

    const pinchGesture = usePinchGesture({
        canvasSize,
        singleTap,
        doubleTap,
        panGesture,
        zoomScale,
        zoomRange,
        totalOffsetX,
        totalOffsetY,
        pinchTranslateX,
        pinchTranslateY,
        pinchBounceTranslateX,
        pinchBounceTranslateY,
        pinchScaleOffset,
        isSwipingInPager,
        stopAnimation,
        onScaleChanged,
        onPinchGestureChange,
    });

    // Enables/disables the pager scroll based on the zoom scale
    // When the content is zoomed in/out, the pager should be disabled
    useAnimatedReaction(
        () => zoomScale.value,
        () => {
            shouldPagerScroll.value = zoomScale.value === 1;
        },
    );

    const mounted = useRef(false);
    useEffect(() => {
        if (!mounted.current) {
            mounted.current = true;
            return;
        }

        if (!isActive) {
            runOnUI(reset)(false);
        }
    }, [isActive, mounted, reset]);

    const animatedStyles = useAnimatedStyle(() => {
        const x = pinchTranslateX.value + pinchBounceTranslateX.value + panTranslateX.value + totalOffsetX.value;
        const y = pinchTranslateY.value + pinchBounceTranslateY.value + panTranslateY.value + totalOffsetY.value;

        if (isSwipingDownToClose.value) {
            onSwipeDown(y);
        }

        return {
            transform: [
                {
                    translateX: x,
                },
                {
                    translateY: y,
                },
                {scale: totalScale.value},
            ],
        };
    });

    return (
        <View
            collapsable={false}
            style={[
                styles.flex1,
                {
                    width: canvasSize.width,
                    overflow: 'hidden',
                },
            ]}
        >
            <GestureDetector gesture={Gesture.Simultaneous(pinchGesture, Gesture.Race(singleTap, doubleTap, panGesture))}>
                <View
                    collapsable={false}
                    style={StyleUtils.getFullscreenCenteredContentStyles()}
                >
                    <Animated.View
                        collapsable={false}
                        style={animatedStyles}
                    >
                        {children}
                    </Animated.View>
                </View>
            </GestureDetector>
        </View>
    );
}
MultiGestureCanvas.propTypes = multiGestureCanvasPropTypes;
MultiGestureCanvas.defaultProps = multiGestureCanvasDefaultProps;
MultiGestureCanvas.displayName = 'MultiGestureCanvas';

export default MultiGestureCanvas;
export {defaultZoomRange, zoomScaleBounceFactors};
