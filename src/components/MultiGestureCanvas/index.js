"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_ZOOM_RANGE = void 0;
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_gesture_handler_1 = require("react-native-gesture-handler");
var react_native_reanimated_1 = require("react-native-reanimated");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var constants_1 = require("./constants");
Object.defineProperty(exports, "DEFAULT_ZOOM_RANGE", { enumerable: true, get: function () { return constants_1.DEFAULT_ZOOM_RANGE; } });
var usePanGesture_1 = require("./usePanGesture");
var usePinchGesture_1 = require("./usePinchGesture");
var useTapGestures_1 = require("./useTapGestures");
var MultiGestureCanvasUtils = require("./utils");
var defaultContentSize = { width: 1, height: 1 };
function MultiGestureCanvas(_a) {
    var _b;
    var canvasSize = _a.canvasSize, contentSizeProp = _a.contentSize, zoomRangeProp = _a.zoomRange, _c = _a.isActive, isActive = _c === void 0 ? true : _c, children = _a.children, pagerRef = _a.pagerRef, isUsedInCarousel = _a.isUsedInCarousel, shouldDisableTransformationGesturesProp = _a.shouldDisableTransformationGestures, isPagerScrollEnabled = _a.isPagerScrollEnabled, onTap = _a.onTap, onScaleChanged = _a.onScaleChanged, onSwipeDown = _a.onSwipeDown, externalGestureHandler = _a.externalGestureHandler;
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var contentSize = contentSizeProp !== null && contentSizeProp !== void 0 ? contentSizeProp : defaultContentSize;
    var shouldDisableTransformationGesturesFallback = (0, react_native_reanimated_1.useSharedValue)(false);
    var shouldDisableTransformationGestures = shouldDisableTransformationGesturesProp !== null && shouldDisableTransformationGesturesProp !== void 0 ? shouldDisableTransformationGesturesProp : shouldDisableTransformationGesturesFallback;
    var zoomRange = (0, react_1.useMemo)(function () {
        var _a, _b;
        return ({
            min: (_a = zoomRangeProp === null || zoomRangeProp === void 0 ? void 0 : zoomRangeProp.min) !== null && _a !== void 0 ? _a : constants_1.DEFAULT_ZOOM_RANGE.min,
            max: (_b = zoomRangeProp === null || zoomRangeProp === void 0 ? void 0 : zoomRangeProp.max) !== null && _b !== void 0 ? _b : constants_1.DEFAULT_ZOOM_RANGE.max,
        });
    }, [zoomRangeProp === null || zoomRangeProp === void 0 ? void 0 : zoomRangeProp.max, zoomRangeProp === null || zoomRangeProp === void 0 ? void 0 : zoomRangeProp.min]);
    // Based on the (original) content size and the canvas size, we calculate the horizontal and vertical scale factors
    // to fit the content inside the canvas
    // We later use the lower of the two scale factors to fit the content inside the canvas
    var _d = (0, react_1.useMemo)(function () { return MultiGestureCanvasUtils.getCanvasFitScale({ canvasSize: canvasSize, contentSize: contentSize }); }, [canvasSize, contentSize]), minContentScale = _d.minScale, maxContentScale = _d.maxScale;
    var zoomScale = (0, react_native_reanimated_1.useSharedValue)(1);
    // Adding together zoom scale and the initial scale to fit the content into the canvas
    // Using the minimum content scale, so that the image is not bigger than the canvas
    // and not smaller than needed to fit
    var totalScale = (0, react_native_reanimated_1.useDerivedValue)(function () { return zoomScale.get() * minContentScale; }, [minContentScale]);
    var panTranslateX = (0, react_native_reanimated_1.useSharedValue)(0);
    var panTranslateY = (0, react_native_reanimated_1.useSharedValue)(0);
    var isSwipingDownToClose = (0, react_native_reanimated_1.useSharedValue)(false);
    var panGestureRef = (0, react_1.useRef)(react_native_gesture_handler_1.Gesture.Pan());
    var pinchScale = (0, react_native_reanimated_1.useSharedValue)(1);
    var pinchTranslateX = (0, react_native_reanimated_1.useSharedValue)(0);
    var pinchTranslateY = (0, react_native_reanimated_1.useSharedValue)(0);
    // Total offset of the content including previous translations from panning and pinching gestures
    var offsetX = (0, react_native_reanimated_1.useSharedValue)(0);
    var offsetY = (0, react_native_reanimated_1.useSharedValue)(0);
    (0, react_native_reanimated_1.useAnimatedReaction)(function () { return isSwipingDownToClose.get(); }, function (current) {
        if (!isUsedInCarousel) {
            return;
        }
        // eslint-disable-next-line react-compiler/react-compiler, no-param-reassign
        isPagerScrollEnabled.set(!current);
    });
    /**
     * Stops any currently running decay animation from panning
     */
    var stopAnimation = (0, react_1.useCallback)(function () {
        'worklet';
        (0, react_native_reanimated_1.cancelAnimation)(offsetX);
        (0, react_native_reanimated_1.cancelAnimation)(offsetY);
    }, [offsetX, offsetY]);
    /**
     * Resets the canvas to the initial state and animates back smoothly
     */
    var reset = (0, react_1.useCallback)(function (animated, callback) {
        'worklet';
        stopAnimation();
        offsetX.set(0);
        offsetY.set(0);
        pinchScale.set(1);
        if (animated) {
            panTranslateX.set((0, react_native_reanimated_1.withSpring)(0, constants_1.SPRING_CONFIG));
            panTranslateY.set((0, react_native_reanimated_1.withSpring)(0, constants_1.SPRING_CONFIG));
            pinchTranslateX.set((0, react_native_reanimated_1.withSpring)(0, constants_1.SPRING_CONFIG));
            pinchTranslateY.set((0, react_native_reanimated_1.withSpring)(0, constants_1.SPRING_CONFIG));
            zoomScale.set((0, react_native_reanimated_1.withSpring)(1, constants_1.SPRING_CONFIG, callback));
            return;
        }
        panTranslateX.set(0);
        panTranslateY.set(0);
        pinchTranslateX.set(0);
        pinchTranslateY.set(0);
        zoomScale.set(1);
        if (callback === undefined) {
            return;
        }
        callback();
    }, [offsetX, offsetY, panTranslateX, panTranslateY, pinchScale, pinchTranslateX, pinchTranslateY, stopAnimation, zoomScale]);
    var _e = (0, useTapGestures_1.default)({
        canvasSize: canvasSize,
        contentSize: contentSize,
        minContentScale: minContentScale,
        maxContentScale: maxContentScale,
        offsetX: offsetX,
        offsetY: offsetY,
        pinchScale: pinchScale,
        zoomScale: zoomScale,
        reset: reset,
        stopAnimation: stopAnimation,
        onScaleChanged: onScaleChanged,
        onTap: onTap,
        shouldDisableTransformationGestures: shouldDisableTransformationGestures,
    }), baseSingleTapGesture = _e.singleTapGesture, doubleTapGesture = _e.doubleTapGesture;
    // eslint-disable-next-line react-compiler/react-compiler
    var singleTapGesture = baseSingleTapGesture.requireExternalGestureToFail(doubleTapGesture, panGestureRef);
    var panGestureSimultaneousList = (0, react_1.useMemo)(function () { return (pagerRef === undefined ? [singleTapGesture, doubleTapGesture] : [pagerRef, singleTapGesture, doubleTapGesture]); }, [doubleTapGesture, pagerRef, singleTapGesture]);
    var panGesture = (_b = (0, usePanGesture_1.default)({
        canvasSize: canvasSize,
        contentSize: contentSize,
        zoomScale: zoomScale,
        totalScale: totalScale,
        offsetX: offsetX,
        offsetY: offsetY,
        panTranslateX: panTranslateX,
        panTranslateY: panTranslateY,
        stopAnimation: stopAnimation,
        shouldDisableTransformationGestures: shouldDisableTransformationGestures,
        isSwipingDownToClose: isSwipingDownToClose,
        onSwipeDown: onSwipeDown,
    }))
        .simultaneousWithExternalGesture.apply(_b, panGestureSimultaneousList).withRef(panGestureRef);
    var pinchGesture = (0, usePinchGesture_1.default)({
        canvasSize: canvasSize,
        zoomScale: zoomScale,
        zoomRange: zoomRange,
        offsetX: offsetX,
        offsetY: offsetY,
        pinchTranslateX: pinchTranslateX,
        pinchTranslateY: pinchTranslateY,
        pinchScale: pinchScale,
        stopAnimation: stopAnimation,
        onScaleChanged: onScaleChanged,
        shouldDisableTransformationGestures: shouldDisableTransformationGestures,
    }).simultaneousWithExternalGesture(panGesture, singleTapGesture, doubleTapGesture);
    // Trigger a reset when the canvas gets inactive, but only if it was already mounted before
    var mounted = (0, react_1.useRef)(false);
    (0, react_1.useEffect)(function () {
        if (!mounted.current) {
            mounted.current = true;
            return;
        }
        if (!isActive) {
            (0, react_native_reanimated_1.runOnUI)(reset)(false);
        }
    }, [isActive, mounted, reset]);
    // Animate the x and y position of the content within the canvas based on all of the gestures
    var animatedStyles = (0, react_native_reanimated_1.useAnimatedStyle)(function () {
        var x = pinchTranslateX.get() + panTranslateX.get() + offsetX.get();
        var y = pinchTranslateY.get() + panTranslateY.get() + offsetY.get();
        return {
            transform: [
                {
                    translateX: x,
                },
                {
                    translateY: y,
                },
                { scale: totalScale.get() },
            ],
            // Hide the image if the size is not ready yet
            opacity: (contentSizeProp === null || contentSizeProp === void 0 ? void 0 : contentSizeProp.width) ? 1 : 0,
        };
    });
    var containerStyles = (0, react_1.useMemo)(function () { return [styles.flex1, StyleUtils.getMultiGestureCanvasContainerStyle(canvasSize.width)]; }, [StyleUtils, canvasSize.width, styles.flex1]);
    var panGestureWrapper = externalGestureHandler ? panGesture.simultaneousWithExternalGesture(externalGestureHandler) : panGesture;
    return (<react_native_1.View collapsable={false} style={containerStyles}>
            <react_native_gesture_handler_1.GestureDetector gesture={react_native_gesture_handler_1.Gesture.Simultaneous(pinchGesture, react_native_gesture_handler_1.Gesture.Race(singleTapGesture, doubleTapGesture, panGestureWrapper))}>
                <react_native_1.View collapsable={false} onTouchEnd={function (e) { return e.preventDefault(); }} style={StyleUtils.getFullscreenCenteredContentStyles()}>
                    <react_native_reanimated_1.default.View collapsable={false} style={[animatedStyles, styles.canvasContainer]}>
                        {children}
                    </react_native_reanimated_1.default.View>
                </react_native_1.View>
            </react_native_gesture_handler_1.GestureDetector>
        </react_native_1.View>);
}
MultiGestureCanvas.displayName = 'MultiGestureCanvas';
exports.default = MultiGestureCanvas;
