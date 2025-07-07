"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable no-param-reassign */
var react_1 = require("react");
var react_native_gesture_handler_1 = require("react-native-gesture-handler");
var react_native_reanimated_1 = require("react-native-reanimated");
var constants_1 = require("./constants");
var usePinchGesture = function (_a) {
    var canvasSize = _a.canvasSize, zoomScale = _a.zoomScale, zoomRange = _a.zoomRange, offsetX = _a.offsetX, offsetY = _a.offsetY, totalPinchTranslateX = _a.pinchTranslateX, totalPinchTranslateY = _a.pinchTranslateY, pinchScale = _a.pinchScale, shouldDisableTransformationGestures = _a.shouldDisableTransformationGestures, stopAnimation = _a.stopAnimation, onScaleChanged = _a.onScaleChanged;
    // The current pinch gesture event scale
    var currentPinchScale = (0, react_native_reanimated_1.useSharedValue)(1);
    // Origin of the pinch gesture
    var pinchOrigin = {
        x: (0, react_native_reanimated_1.useSharedValue)(0),
        y: (0, react_native_reanimated_1.useSharedValue)(0),
    };
    // How much the content is translated during the pinch gesture
    // While the pinch gesture is running, the pan gesture is disabled
    // Therefore we need to add the translation separately
    var pinchTranslateX = (0, react_native_reanimated_1.useSharedValue)(0);
    var pinchTranslateY = (0, react_native_reanimated_1.useSharedValue)(0);
    // In order to keep track of the "bounce" effect when "over-zooming"/"under-zooming",
    // we need to have extra "bounce" translation variables
    var pinchBounceTranslateX = (0, react_native_reanimated_1.useSharedValue)(0);
    var pinchBounceTranslateY = (0, react_native_reanimated_1.useSharedValue)(0);
    var triggerScaleChangedEvent = function () {
        'worklet';
        if (onScaleChanged === undefined) {
            return;
        }
        (0, react_native_reanimated_1.runOnJS)(onScaleChanged)(zoomScale.get());
    };
    // Update the total (pinch) translation based on the regular pinch + bounce
    (0, react_native_reanimated_1.useAnimatedReaction)(function () { return [pinchTranslateX.get(), pinchTranslateY.get(), pinchBounceTranslateX.get(), pinchBounceTranslateY.get()]; }, function (_a) {
        var translateX = _a[0], translateY = _a[1], bounceX = _a[2], bounceY = _a[3];
        // eslint-disable-next-line react-compiler/react-compiler
        totalPinchTranslateX.set(translateX + bounceX);
        totalPinchTranslateY.set(translateY + bounceY);
    });
    /**
     * Calculates the adjusted focal point of the pinch gesture,
     * based on the canvas size and the current offset
     */
    var getAdjustedFocal = (0, react_1.useCallback)(function (focalX, focalY) {
        'worklet';
        return {
            x: focalX - (canvasSize.width / 2 + offsetX.get()),
            y: focalY - (canvasSize.height / 2 + offsetY.get()),
        };
    }, [canvasSize.width, canvasSize.height, offsetX, offsetY]);
    // The pinch gesture is disabled when we release one of the fingers
    // On the next render, we need to re-enable the pinch gesture
    var _b = (0, react_1.useState)(true), pinchEnabled = _b[0], setPinchEnabled = _b[1];
    (0, react_1.useEffect)(function () {
        if (pinchEnabled) {
            return;
        }
        setPinchEnabled(true);
    }, [pinchEnabled]);
    var pinchGesture = react_native_gesture_handler_1.Gesture.Pinch()
        .enabled(pinchEnabled)
        // The first argument is not used, but must be defined
        .onTouchesDown(function (_evt, state) {
        // react-compiler optimization unintentionally make all the callbacks run on the JS thread.
        // Adding the worklet directive here will make all the callbacks run on UI thread back.
        'worklet';
        // We don't want to activate pinch gesture when we are swiping in the pager
        if (!shouldDisableTransformationGestures.get()) {
            return;
        }
        state.fail();
    })
        .onStart(function (evt) {
        stopAnimation();
        // Set the origin focal point of the pinch gesture at the start of the gesture
        var adjustedFocal = getAdjustedFocal(evt.focalX, evt.focalY);
        pinchOrigin.x.set(adjustedFocal.x);
        pinchOrigin.y.set(adjustedFocal.y);
    })
        .onChange(function (evt) {
        'worklet';
        // Disable the pinch gesture if one finger is released,
        // to prevent the content from shaking/jumping
        if (evt.numberOfPointers !== 2) {
            (0, react_native_reanimated_1.runOnJS)(setPinchEnabled)(false);
            return;
        }
        var newZoomScale = pinchScale.get() * evt.scale;
        // Limit the zoom scale to zoom range including bounce range
        if (zoomScale.get() >= zoomRange.min * constants_1.ZOOM_RANGE_BOUNCE_FACTORS.min && zoomScale.get() <= zoomRange.max * constants_1.ZOOM_RANGE_BOUNCE_FACTORS.max) {
            zoomScale.set(newZoomScale);
            currentPinchScale.set(evt.scale);
            triggerScaleChangedEvent();
        }
        // Calculate new pinch translation
        var adjustedFocal = getAdjustedFocal(evt.focalX, evt.focalY);
        var newPinchTranslateX = adjustedFocal.x + currentPinchScale.get() * pinchOrigin.x.get() * -1;
        var newPinchTranslateY = adjustedFocal.y + currentPinchScale.get() * pinchOrigin.y.get() * -1;
        // If the zoom scale is within the zoom range, we perform the regular pinch translation
        // Otherwise it means that we are "over-zoomed" or "under-zoomed", so we need to bounce back
        if (zoomScale.get() >= zoomRange.min && zoomScale.get() <= zoomRange.max) {
            pinchTranslateX.set(newPinchTranslateX);
            pinchTranslateY.set(newPinchTranslateY);
        }
        else {
            // Store x and y translation that is produced while bouncing
            // so we can revert the bounce once pinch gesture is released
            pinchBounceTranslateX.set(newPinchTranslateX - pinchTranslateX.get());
            pinchBounceTranslateY.set(newPinchTranslateY - pinchTranslateY.get());
        }
    })
        .onEnd(function () {
        // Add pinch translation to total offset and reset gesture variables
        offsetX.set(function (value) { return value + pinchTranslateX.get(); });
        offsetY.set(function (value) { return value + pinchTranslateY.get(); });
        pinchTranslateX.set(0);
        pinchTranslateY.set(0);
        currentPinchScale.set(1);
        // If the content was "over-zoomed" or "under-zoomed", we need to bounce back with an animation
        if (pinchBounceTranslateX.get() !== 0 || pinchBounceTranslateY.get() !== 0) {
            pinchBounceTranslateX.set((0, react_native_reanimated_1.withSpring)(0, constants_1.SPRING_CONFIG));
            pinchBounceTranslateY.set((0, react_native_reanimated_1.withSpring)(0, constants_1.SPRING_CONFIG));
        }
        if (zoomScale.get() < zoomRange.min) {
            // If the zoom scale is less than the minimum zoom scale, we need to set the zoom scale to the minimum
            pinchScale.set(zoomRange.min);
            zoomScale.set((0, react_native_reanimated_1.withSpring)(zoomRange.min, constants_1.SPRING_CONFIG, triggerScaleChangedEvent));
        }
        else if (zoomScale.get() > zoomRange.max) {
            // If the zoom scale is higher than the maximum zoom scale, we need to set the zoom scale to the maximum
            pinchScale.set(zoomRange.max);
            zoomScale.set((0, react_native_reanimated_1.withSpring)(zoomRange.max, constants_1.SPRING_CONFIG, triggerScaleChangedEvent));
        }
        else {
            // Otherwise, we just update the pinch scale offset
            pinchScale.set(zoomScale.get());
            triggerScaleChangedEvent();
        }
    });
    return pinchGesture;
};
exports.default = usePinchGesture;
