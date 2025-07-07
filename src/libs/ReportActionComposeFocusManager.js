"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var SCREENS_1 = require("@src/SCREENS");
var isReportOpenInRHP_1 = require("./Navigation/helpers/isReportOpenInRHP");
var navigationRef_1 = require("./Navigation/navigationRef");
var composerRef = react_1.default.createRef();
// There are two types of composer: general composer (edit composer) and main composer.
// The general composer callback will take priority if it exists.
var editComposerRef = react_1.default.createRef();
// There are two types of focus callbacks: priority and general
// Priority callback would take priority if it existed
var priorityFocusCallback = null;
var focusCallback = null;
/**
 * Register a callback to be called when focus is requested.
 * Typical uses of this would be call the focus on the ReportActionComposer.
 *
 * @param callback callback to register
 */
function onComposerFocus(callback, isPriorityCallback) {
    if (isPriorityCallback === void 0) { isPriorityCallback = false; }
    if (isPriorityCallback) {
        priorityFocusCallback = callback;
    }
    else {
        focusCallback = callback;
    }
}
/**
 * Request focus on the ReportActionComposer
 */
function focus(shouldFocusForNonBlurInputOnTapOutside) {
    /** Do not trigger the refocusing when the active route is not the report screen */
    var navigationState = navigationRef_1.default.getState();
    var focusedRoute = (0, native_1.findFocusedRoute)(navigationState);
    if (!navigationState || (!(0, isReportOpenInRHP_1.default)(navigationState) && (focusedRoute === null || focusedRoute === void 0 ? void 0 : focusedRoute.name) !== SCREENS_1.default.REPORT)) {
        return;
    }
    if (typeof priorityFocusCallback !== 'function' && typeof focusCallback !== 'function') {
        return;
    }
    if (typeof priorityFocusCallback === 'function') {
        priorityFocusCallback(shouldFocusForNonBlurInputOnTapOutside);
        return;
    }
    if (typeof focusCallback === 'function') {
        focusCallback();
    }
}
/**
 * Clear the registered focus callback
 */
function clear(isPriorityCallback) {
    if (isPriorityCallback === void 0) { isPriorityCallback = false; }
    if (isPriorityCallback) {
        editComposerRef.current = null;
        priorityFocusCallback = null;
    }
    else {
        focusCallback = null;
    }
}
/**
 * Exposes the current focus state of the report action composer.
 */
function isFocused() {
    var _a;
    return !!((_a = composerRef.current) === null || _a === void 0 ? void 0 : _a.isFocused());
}
/**
 * Exposes the current focus state of the edit message composer.
 */
function isEditFocused() {
    var _a;
    return !!((_a = editComposerRef.current) === null || _a === void 0 ? void 0 : _a.isFocused());
}
exports.default = {
    composerRef: composerRef,
    onComposerFocus: onComposerFocus,
    focus: focus,
    clear: clear,
    isFocused: isFocused,
    editComposerRef: editComposerRef,
    isEditFocused: isEditFocused,
};
