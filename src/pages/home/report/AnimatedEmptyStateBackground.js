"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var react_native_reanimated_1 = require("react-native-reanimated");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useThemeIllustrations_1 = require("@hooks/useThemeIllustrations");
var useWindowDimensions_1 = require("@hooks/useWindowDimensions");
var variables_1 = require("@styles/variables");
var CONST_1 = require("@src/CONST");
// Maximum horizontal and vertical shift in pixels on sensor value change
var IMAGE_OFFSET_X = 30;
var IMAGE_OFFSET_Y = 20;
// This is necessary so we don't send the entire CONST object to the worklet which could lead to performance issues
// https://docs.swmansion.com/react-native-reanimated/docs/guides/worklets/#capturing-closure
var ANIMATION_GYROSCOPE_VALUE = CONST_1.default.ANIMATION_GYROSCOPE_VALUE;
function AnimatedEmptyStateBackground() {
    var StyleUtils = (0, useStyleUtils_1.default)();
    var windowWidth = (0, useWindowDimensions_1.default)().windowWidth;
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var illustrations = (0, useThemeIllustrations_1.default)();
    // If window width is greater than the max background width, repeat the background image
    var maxBackgroundWidth = variables_1.default.sideBarWidth + CONST_1.default.EMPTY_STATE_BACKGROUND.ASPECT_RATIO * CONST_1.default.EMPTY_STATE_BACKGROUND.WIDE_SCREEN.IMAGE_HEIGHT;
    // Get data from phone rotation sensor and prep other variables for animation
    var animatedSensor = (0, react_native_reanimated_1.useAnimatedSensor)(react_native_reanimated_1.SensorType.GYROSCOPE);
    var xOffset = (0, react_native_reanimated_1.useSharedValue)(0);
    var yOffset = (0, react_native_reanimated_1.useSharedValue)(0);
    var isReducedMotionEnabled = (0, react_native_reanimated_1.useReducedMotion)();
    // Apply data to create style object
    var animatedStyles = (0, react_native_reanimated_1.useAnimatedStyle)(function () {
        if (!shouldUseNarrowLayout || isReducedMotionEnabled) {
            return {};
        }
        /*
         * We use x and y gyroscope velocity and add it to position offset to move background based on device movements.
         * Position the phone was in while entering the screen is the initial position for background image.
         */
        var _a = animatedSensor.sensor.get(), x = _a.x, y = _a.y;
        // The x vs y here seems wrong but is the way to make it feel right to the user
        xOffset.set(function (value) { return (0, react_native_reanimated_1.clamp)(value + y * ANIMATION_GYROSCOPE_VALUE, -IMAGE_OFFSET_X, IMAGE_OFFSET_X); });
        yOffset.set(function (value) { return (0, react_native_reanimated_1.clamp)(value - x * ANIMATION_GYROSCOPE_VALUE, -IMAGE_OFFSET_Y, IMAGE_OFFSET_Y); });
        return {
            transform: [{ translateX: (0, react_native_reanimated_1.withSpring)(xOffset.get()) }, { translateY: (0, react_native_reanimated_1.withSpring)(yOffset.get(), { overshootClamping: true }) }, { scale: 1.15 }],
        };
    }, [isReducedMotionEnabled]);
    return (<react_native_1.View style={StyleUtils.getReportWelcomeBackgroundContainerStyle()}>
            <react_native_reanimated_1.default.Image source={illustrations.EmptyStateBackgroundImage} style={[StyleUtils.getReportWelcomeBackgroundImageStyle(shouldUseNarrowLayout), animatedStyles]} resizeMode={windowWidth > maxBackgroundWidth ? 'repeat' : 'cover'}/>
        </react_native_1.View>);
}
AnimatedEmptyStateBackground.displayName = 'AnimatedEmptyStateBackground';
exports.default = AnimatedEmptyStateBackground;
