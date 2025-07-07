"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
var Timing_1 = require("@userActions/Timing");
var CONST_1 = require("@src/CONST");
function default_1() {
    Timing_1.default.start(CONST_1.default.TIMING.SPLASH_SCREEN);
    document.addEventListener('visibilitychange', function () {
        Timing_1.default.clearData();
    });
}
