"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_live_markdown_1 = require("@expensify/react-native-live-markdown");
var react_native_reanimated_1 = require("react-native-reanimated");
function runOnLiveMarkdownRuntime(worklet) {
    return (0, react_native_reanimated_1.runOnRuntime)((0, react_native_live_markdown_1.getWorkletRuntime)(), worklet);
}
exports.default = runOnLiveMarkdownRuntime;
