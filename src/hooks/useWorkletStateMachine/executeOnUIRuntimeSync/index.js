"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// executeOnUIRuntimeSync crashes on web not because browsers lack a UI thread concept,
// but because this specific function attempts to use direct, synchronous thread communication
// methods that don't exist in browsers
// runOnUI works on web because it's designed with proper cross-platform compatibility
var react_native_reanimated_1 = require("react-native-reanimated");
exports.default = react_native_reanimated_1.runOnUI;
