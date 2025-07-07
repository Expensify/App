"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var DeviceCapabilities_1 = require("@libs/DeviceCapabilities");
var useHover = function () {
    var _a = (0, react_1.useState)(false), hovered = _a[0], setHovered = _a[1];
    var canUseTouchScreen = (0, DeviceCapabilities_1.canUseTouchScreen)();
    return {
        hovered: hovered,
        bind: {
            onMouseEnter: function () { return !canUseTouchScreen && setHovered(true); },
            onMouseLeave: function () { return !canUseTouchScreen && setHovered(false); },
        },
    };
};
exports.default = useHover;
