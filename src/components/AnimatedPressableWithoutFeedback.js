"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_reanimated_1 = require("react-native-reanimated");
var PressableWithoutFeedback_1 = require("./Pressable/PressableWithoutFeedback");
var AnimatedPressableWithoutFeedback = react_native_reanimated_1.default.createAnimatedComponent(PressableWithoutFeedback_1.default);
AnimatedPressableWithoutFeedback.displayName = 'AnimatedPressableWithoutFeedback';
exports.default = AnimatedPressableWithoutFeedback;
