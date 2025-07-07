"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var debounce_1 = require("lodash/debounce");
var CONST_1 = require("@src/CONST");
var active = false;
/**
 * Debounced function to deactivate the TooltipSense after a specific time
 */
var debouncedDeactivate = (0, debounce_1.default)(function () {
    active = false;
}, CONST_1.default.TIMING.TOOLTIP_SENSE);
function activate() {
    active = true;
    debouncedDeactivate.cancel();
}
function deactivate() {
    return debouncedDeactivate();
}
function isActive() {
    return active === true;
}
exports.default = {
    activate: activate,
    deactivate: deactivate,
    isActive: isActive,
};
