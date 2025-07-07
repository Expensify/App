"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.growlRef = void 0;
exports.setIsReady = setIsReady;
var react_1 = require("react");
var CONST_1 = require("@src/CONST");
var growlRef = react_1.default.createRef();
exports.growlRef = growlRef;
var resolveIsReadyPromise;
var isReadyPromise = new Promise(function (resolve) {
    resolveIsReadyPromise = resolve;
});
function setIsReady() {
    if (!resolveIsReadyPromise) {
        return;
    }
    resolveIsReadyPromise();
}
/**
 * Show the growl notification
 */
function show(bodyText, type, duration) {
    if (duration === void 0) { duration = CONST_1.default.GROWL.DURATION; }
    isReadyPromise.then(function () {
        var _a;
        if (!((_a = growlRef === null || growlRef === void 0 ? void 0 : growlRef.current) === null || _a === void 0 ? void 0 : _a.show)) {
            return;
        }
        growlRef.current.show(bodyText, type, duration);
    });
}
/**
 * Show error growl
 */
function error(bodyText, duration) {
    if (duration === void 0) { duration = CONST_1.default.GROWL.DURATION; }
    show(bodyText, CONST_1.default.GROWL.ERROR, duration);
}
/**
 * Show success growl
 */
function success(bodyText, duration) {
    if (duration === void 0) { duration = CONST_1.default.GROWL.DURATION; }
    show(bodyText, CONST_1.default.GROWL.SUCCESS, duration);
}
exports.default = {
    show: show,
    error: error,
    success: success,
};
