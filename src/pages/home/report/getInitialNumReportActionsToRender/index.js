"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var DEFAULT_NUM_TO_RENDER = 50;
function getInitialNumToRender(numToRender) {
    // For web and desktop environments, it's crucial to set this value equal to or higher than the maxToRenderPerBatch setting. If it's set lower, the 'onStartReached' event will be triggered excessively, every time an additional item enters the virtualized list.
    return Math.max(numToRender, DEFAULT_NUM_TO_RENDER);
}
exports.default = getInitialNumToRender;
