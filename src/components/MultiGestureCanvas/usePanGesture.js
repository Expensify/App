"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-param-reassign */
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_gesture_handler_1 = require("react-native-gesture-handler");
var react_native_reanimated_1 = require("react-native-reanimated");
var Browser = require("@libs/Browser");
var constants_1 = require("./constants");
var MultiGestureCanvasUtils = require("./utils");
// This value determines how fast the pan animation should phase out
// We're using a "withDecay" animation to smoothly phase out the pan animation
// https://docs.swmansion.com/react-native-reanimated/docs/animations/withDecay/
var PAN_DECAY_DECLARATION = 0.9915;
var SCREEN_HEIGHT = react_native_1.Dimensions.get('screen').height;
var SNAP_POINT = SCREEN_HEIGHT / 4;
var SNAP_POINT_HIDDEN = SCREEN_HEIGHT / 1.2;
var usePanGesture = function (_a) {
    var canvasSize = _a.canvasSize, contentSize = _a.contentSize, zoomScale = _a.zoomScale, totalScale = _a.totalScale, offsetX = _a.offsetX, offsetY = _a.offsetY, panTranslateX = _a.panTranslateX, panTranslateY = _a.panTranslateY, shouldDisableTransformationGestures = _a.shouldDisableTransformationGestures, stopAnimation = _a.stopAnimation, isSwipingDownToClose = _a.isSwipingDownToClose, onSwipeDown = _a.onSwipeDown;
    // The content size after fitting it to the canvas and zooming
    var zoomedContentWidth = (0, react_native_reanimated_1.useDerivedValue)(function () { return contentSize.width * totalScale.get(); }, [contentSize.width]);
    var zoomedContentHeight = (0, react_native_reanimated_1.useDerivedValue)(function () { return contentSize.height * totalScale.get(); }, [contentSize.height]);
    // Used to track previous touch position for the "swipe down to close" gesture
    var previousTouch = (0, react_native_reanimated_1.useSharedValue)(null);
    // Velocity of the pan gesture
    // We need to keep track of the velocity to properly phase out/decay the pan animation
    var panVelocityX = (0, react_native_reanimated_1.useSharedValue)(0);
    var panVelocityY = (0, react_native_reanimated_1.useSharedValue)(0);
    var isMobileBrowser = Browser.isMobile();
    // Disable "swipe down to close" gesture when content is bigger than the canvas
    var enableSwipeDownToClose = (0, react_native_reanimated_1.useDerivedValue)(function () { return canvasSize.height < zoomedContentHeight.get(); }, [canvasSize.height]);
    // Calculates bounds of the scaled content
    // Can we pan left/right/up/down
    // Can be used to limit gesture or implementing tension effect
    var getBounds = (0, react_1.useCallback)(function () {
        'worklet';
        var horizontalBoundary = 0;
        var verticalBoundary = 0;
        if (canvasSize.width < zoomedContentWidth.get()) {
            horizontalBoundary = Math.abs(canvasSize.width - zoomedContentWidth.get()) / 2;
        }
        if (canvasSize.height < zoomedContentHeight.get()) {
            verticalBoundary = Math.abs(zoomedContentHeight.get() - canvasSize.height) / 2;
        }
        var horizontalBoundaries = { min: -horizontalBoundary, max: horizontalBoundary };
        var verticalBoundaries = { min: -verticalBoundary, max: verticalBoundary };
        var clampedOffset = {
            x: MultiGestureCanvasUtils.clamp(offsetX.get(), horizontalBoundaries.min, horizontalBoundaries.max),
            y: MultiGestureCanvasUtils.clamp(offsetY.get(), verticalBoundaries.min, verticalBoundaries.max),
        };
        // If the horizontal/vertical offset is the same after clamping to the min/max boundaries, the content is within the boundaries
        var isInHorizontalBoundary = clampedOffset.x === offsetX.get();
        var isInVerticalBoundary = clampedOffset.y === offsetY.get();
        return {
            horizontalBoundaries: horizontalBoundaries,
            verticalBoundaries: verticalBoundaries,
            clampedOffset: clampedOffset,
            isInHorizontalBoundary: isInHorizontalBoundary,
            isInVerticalBoundary: isInVerticalBoundary,
        };
    }, [canvasSize.width, canvasSize.height, zoomedContentWidth, zoomedContentHeight, offsetX, offsetY]);
    // We want to smoothly decay/end the gesture by phasing out the pan animation
    // In case the content is outside of the boundaries of the canvas,
    // we need to move the content back into the boundaries
    var finishPanGesture = (0, react_1.useCallback)(function () {
        'worklet';
        // If the content is centered within the canvas, we don't need to run any animations
        if (offsetX.get() === 0 && offsetY.get() === 0 && panTranslateX.get() === 0 && panTranslateY.get() === 0) {
            return;
        }
        var _a = getBounds(), clampedOffset = _a.clampedOffset, isInHorizontalBoundary = _a.isInHorizontalBoundary, isInVerticalBoundary = _a.isInVerticalBoundary, horizontalBoundaries = _a.horizontalBoundaries, verticalBoundaries = _a.verticalBoundaries;
        // If the content is within the horizontal/vertical boundaries of the canvas, we can smoothly phase out the animation
        // If not, we need to snap back to the boundaries
        if (isInHorizontalBoundary) {
            // If the (absolute) velocity is 0, we don't need to run an animation
            if (Math.abs(panVelocityX.get()) !== 0) {
                // Phase out the pan animation
                // eslint-disable-next-line react-compiler/react-compiler
                offsetX.set((0, react_native_reanimated_1.withDecay)({
                    velocity: panVelocityX.get(),
                    clamp: [horizontalBoundaries.min, horizontalBoundaries.max],
                    deceleration: PAN_DECAY_DECLARATION,
                    rubberBandEffect: false,
                }));
            }
        }
        else {
            // Animated back to the boundary
            offsetX.set((0, react_native_reanimated_1.withSpring)(clampedOffset.x, constants_1.SPRING_CONFIG));
        }
        if (isInVerticalBoundary) {
            // If the (absolute) velocity is 0, we don't need to run an animation
            if (Math.abs(panVelocityY.get()) !== 0) {
                // Phase out the pan animation
                offsetY.set((0, react_native_reanimated_1.withDecay)({
                    velocity: panVelocityY.get(),
                    clamp: [verticalBoundaries.min, verticalBoundaries.max],
                    deceleration: PAN_DECAY_DECLARATION,
                }));
            }
        }
        else {
            var finalTranslateY = offsetY.get() + panVelocityY.get() * 0.2;
            if (finalTranslateY > SNAP_POINT && zoomScale.get() <= 1) {
                offsetY.set((0, react_native_reanimated_1.withSpring)(SNAP_POINT_HIDDEN, constants_1.SPRING_CONFIG, function () {
                    isSwipingDownToClose.set(false);
                    if (onSwipeDown) {
                        (0, react_native_reanimated_1.runOnJS)(onSwipeDown)();
                    }
                }));
            }
            else {
                // Animated back to the boundary
                offsetY.set((0, react_native_reanimated_1.withSpring)(clampedOffset.y, constants_1.SPRING_CONFIG, function () {
                    isSwipingDownToClose.set(false);
                }));
            }
        }
        // Reset velocity variables after we finished the pan gesture
        panVelocityX.set(0);
        panVelocityY.set(0);
    }, [getBounds, isSwipingDownToClose, offsetX, offsetY, onSwipeDown, panTranslateX, panTranslateY, panVelocityX, panVelocityY, zoomScale]);
    var panGesture = react_native_gesture_handler_1.Gesture.Pan()
        .manualActivation(true)
        .averageTouches(true)
        .onTouchesUp(function () {
        previousTouch.set(null);
    })
        .onTouchesMove(function (evt, state) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        // We only allow panning when the content is zoomed in
        if (zoomScale.get() > 1 && !shouldDisableTransformationGestures.get()) {
            state.activate();
        }
        // TODO: this needs tuning to work properly
        var previousTouchValue = previousTouch.get();
        if (!shouldDisableTransformationGestures.get() && zoomScale.get() === 1 && previousTouchValue !== null) {
            var velocityX = Math.abs(((_b = (_a = evt.allTouches.at(0)) === null || _a === void 0 ? void 0 : _a.x) !== null && _b !== void 0 ? _b : 0) - previousTouchValue.x);
            var velocityY = ((_d = (_c = evt.allTouches.at(0)) === null || _c === void 0 ? void 0 : _c.y) !== null && _d !== void 0 ? _d : 0) - previousTouchValue.y;
            if (Math.abs(velocityY) > velocityX && velocityY > 20) {
                state.activate();
                isSwipingDownToClose.set(true);
                previousTouch.set(null);
                return;
            }
        }
        if (previousTouch.get() === null) {
            previousTouch.set({
                x: (_f = (_e = evt.allTouches.at(0)) === null || _e === void 0 ? void 0 : _e.x) !== null && _f !== void 0 ? _f : 0,
                y: (_h = (_g = evt.allTouches.at(0)) === null || _g === void 0 ? void 0 : _g.y) !== null && _h !== void 0 ? _h : 0,
            });
        }
    })
        .onStart(function () {
        stopAnimation();
    })
        .onChange(function (evt) {
        // Since we're running both pinch and pan gesture handlers simultaneously,
        // we need to make sure that we don't pan when we pinch since we track it as pinch focal gesture.
        if (evt.numberOfPointers > 1) {
            return;
        }
        panVelocityX.set(evt.velocityX);
        panVelocityY.set(evt.velocityY);
        if (!isSwipingDownToClose.get()) {
            if (!isMobileBrowser || (isMobileBrowser && zoomScale.get() !== 1)) {
                panTranslateX.set(function (value) { return value + evt.changeX; });
            }
        }
        if (enableSwipeDownToClose.get() || isSwipingDownToClose.get()) {
            panTranslateY.set(function (value) { return value + evt.changeY; });
        }
    })
        .onEnd(function () {
        // Add pan translation to total offset and reset gesture variables
        offsetX.set(function (value) { return value + panTranslateX.get(); });
        offsetY.set(function (value) { return value + panTranslateY.get(); });
        // Reset pan gesture variables
        panTranslateX.set(0);
        panTranslateY.set(0);
        previousTouch.set(null);
        // If we are swiping (in the pager), we don't want to return to boundaries
        if (shouldDisableTransformationGestures.get()) {
            return;
        }
        finishPanGesture();
    });
    return panGesture;
};
exports.default = usePanGesture;
