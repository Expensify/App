"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var throttle_1 = require("lodash/throttle");
var react_native_onyx_1 = require("react-native-onyx");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var isProfilingInProgress = false;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.APP_PROFILING_IN_PROGRESS,
    callback: function (val) { return (isProfilingInProgress = val !== null && val !== void 0 ? val : false); },
});
/**
 * Toggle the test tools modal open or closed.
 * Throttle the toggle to make the modal stay open if you accidentally tap an extra time, which is easy to do.
 */
function toggleProfileTool() {
    var toggle = function () { return react_native_onyx_1.default.set(ONYXKEYS_1.default.APP_PROFILING_IN_PROGRESS, !isProfilingInProgress); };
    var throttledToggle = (0, throttle_1.default)(toggle, CONST_1.default.TIMING.TEST_TOOLS_MODAL_THROTTLE_TIME);
    throttledToggle();
}
exports.default = toggleProfileTool;
