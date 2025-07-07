"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var useWindowDimensions_1 = require("@hooks/useWindowDimensions");
var variables_1 = require("@styles/variables");
/**
 * This a native specific implementation for FlashList of LHNOptionsList. It calculates estimated visible height and width of the list. It is not the scroll content size. Defining this prop will enable the list to be rendered immediately. Without it, the list first needs to measure its size, leading to a small delay during the first render.
 */
var useLHNEstimatedListSize = function () {
    var _a = (0, useWindowDimensions_1.default)(), windowHeight = _a.windowHeight, windowWidth = _a.windowWidth;
    var listHeight = windowHeight - variables_1.default.bottomTabHeight;
    return {
        height: listHeight,
        width: windowWidth,
    };
};
exports.default = useLHNEstimatedListSize;
