"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZOOM_RANGE_BOUNCE_FACTORS = exports.DEFAULT_ZOOM_RANGE = exports.SPRING_CONFIG = exports.DOUBLE_TAP_SCALE = void 0;
var DOUBLE_TAP_SCALE = 3;
exports.DOUBLE_TAP_SCALE = DOUBLE_TAP_SCALE;
// The spring config is used to determine the physics of the spring animation
// Details and a playground for testing different configs can be found at
// https://docs.swmansion.com/react-native-reanimated/docs/animations/withSpring
var SPRING_CONFIG = {
    mass: 1,
    stiffness: 1000,
    damping: 500,
};
exports.SPRING_CONFIG = SPRING_CONFIG;
// The default zoom range within the user can pinch to zoom the content inside the canvas
var DEFAULT_ZOOM_RANGE = {
    min: 1,
    max: 20,
};
exports.DEFAULT_ZOOM_RANGE = DEFAULT_ZOOM_RANGE;
// The zoom range bounce factors are used to determine the amount of bounce
// that is allowed when the user zooms more than the min or max zoom levels
var ZOOM_RANGE_BOUNCE_FACTORS = {
    min: 0.7,
    max: 1.5,
};
exports.ZOOM_RANGE_BOUNCE_FACTORS = ZOOM_RANGE_BOUNCE_FACTORS;
