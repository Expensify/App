"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var tooltipRef = react_1.default.createRef();
var TooltipRefManager = {
    ref: tooltipRef,
    hideTooltip: function () {
        var _a;
        (_a = tooltipRef.current) === null || _a === void 0 ? void 0 : _a.hideTooltip();
    },
};
exports.default = TooltipRefManager;
