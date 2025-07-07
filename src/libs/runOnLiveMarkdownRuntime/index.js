"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// Reanimated does not support runOnRuntime() on web
function runOnLiveMarkdownRuntime(worklet) {
    return worklet;
}
exports.default = runOnLiveMarkdownRuntime;
