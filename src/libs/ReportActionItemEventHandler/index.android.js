"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_1 = require("react-native");
var reportActionItemEventHandler = {
    handleComposerLayoutChange: function (reportScrollManager, index) { return function () {
        react_native_1.InteractionManager.runAfterInteractions(function () {
            requestAnimationFrame(function () {
                reportScrollManager.scrollToIndex(index, true);
            });
        });
    }; },
};
exports.default = reportActionItemEventHandler;
