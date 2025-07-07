"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_native_1 = require("react-native");
var CONST_1 = require("@src/CONST");
var isWindowReadyToFocus_1 = require("./isWindowReadyToFocus");
var focusedInput = null;
var uniqueModalId = 1;
var focusMap = new Map();
var activeModals = [];
var promiseMap = new Map();
/**
 * Returns the ref of the currently focused text field, if one exists.
 * react-native-web doesn't support `currentlyFocusedInput`, so we need to make it compatible by using `currentlyFocusedField` instead.
 */
function getActiveInput() {
    // eslint-disable-next-line deprecation/deprecation
    return (react_native_1.TextInput.State.currentlyFocusedInput ? react_native_1.TextInput.State.currentlyFocusedInput() : react_native_1.TextInput.State.currentlyFocusedField());
}
/**
 * On web platform, if the modal is displayed by a click, the blur event is fired before the modal appears,
 * so we need to cache the focused input in the pointerdown handler, which is fired before the blur event.
 */
function saveFocusedInput() {
    focusedInput = getActiveInput();
}
/**
 * If a click does not display the modal, we also should clear the cached value to avoid potential issues.
 */
function clearFocusedInput() {
    if (!focusedInput) {
        return;
    }
    // For the PopoverWithMeasuredContent component, Modal is only mounted after onLayout event is triggered,
    // this event is placed within a setTimeout in react-native-web,
    // so we can safely clear the cached value only after this event.
    setTimeout(function () { return (focusedInput = null); }, CONST_1.default.ANIMATION_IN_TIMING);
}
/**
 * When a TextInput is unmounted, we also should release the reference here to avoid potential issues.
 *
 */
function releaseInput(input) {
    if (!input) {
        return;
    }
    if (input === focusedInput) {
        focusedInput = null;
    }
    focusMap.forEach(function (value, key) {
        if (value.input !== input) {
            return;
        }
        focusMap.delete(key);
    });
}
function getId() {
    return uniqueModalId++;
}
/**
 * Save the focus state when opening the modal.
 */
function saveFocusState(id, isInUploadingContext, shouldClearFocusWithType) {
    if (isInUploadingContext === void 0) { isInUploadingContext = false; }
    if (shouldClearFocusWithType === void 0) { shouldClearFocusWithType = false; }
    var activeInput = getActiveInput();
    // For popoverWithoutOverlay, react calls autofocus before useEffect.
    var input = focusedInput !== null && focusedInput !== void 0 ? focusedInput : activeInput;
    focusedInput = null;
    if (activeModals.indexOf(id) >= 0) {
        return;
    }
    activeModals.push(id);
    if (shouldClearFocusWithType) {
        focusMap.forEach(function (value, key) {
            if (value.isInUploadingContext !== isInUploadingContext) {
                return;
            }
            focusMap.delete(key);
        });
    }
    focusMap.set(id, { input: input, isInUploadingContext: isInUploadingContext });
    input === null || input === void 0 ? void 0 : input.blur();
}
/**
 * On web platform, if we intentionally click on another input box, there is no need to restore focus.
 * Additionally, if we are closing the RHP, we can ignore the focused input.
 */
function focus(input, shouldIgnoreFocused) {
    if (shouldIgnoreFocused === void 0) { shouldIgnoreFocused = false; }
    var activeInput = getActiveInput();
    if (!input || (activeInput && !shouldIgnoreFocused)) {
        return;
    }
    (0, isWindowReadyToFocus_1.default)().then(function () { return input.focus(); });
}
function tryRestoreTopmostFocus(shouldIgnoreFocused, isInUploadingContext) {
    if (isInUploadingContext === void 0) { isInUploadingContext = false; }
    var topmost = __spreadArray([], focusMap, true).filter(function (_a) {
        var v = _a[1];
        return v.input && v.isInUploadingContext === isInUploadingContext;
    }).at(-1);
    if (topmost === undefined) {
        return;
    }
    var modalId = topmost[0], input = topmost[1].input;
    // This modal is still active
    if (activeModals.indexOf(modalId) >= 0) {
        return;
    }
    focus(input, shouldIgnoreFocused);
    focusMap.delete(modalId);
}
/**
 * Restore the focus state after the modal is dismissed.
 */
function restoreFocusState(id, shouldIgnoreFocused, restoreFocusType, isInUploadingContext) {
    var _a;
    if (shouldIgnoreFocused === void 0) { shouldIgnoreFocused = false; }
    if (restoreFocusType === void 0) { restoreFocusType = CONST_1.default.MODAL.RESTORE_FOCUS_TYPE.DEFAULT; }
    if (isInUploadingContext === void 0) { isInUploadingContext = false; }
    if (!id || !activeModals.length) {
        return;
    }
    var activeModalIndex = activeModals.indexOf(id);
    // This id has been removed from the stack.
    if (activeModalIndex < 0) {
        return;
    }
    activeModals.splice(activeModalIndex, 1);
    if (restoreFocusType === CONST_1.default.MODAL.RESTORE_FOCUS_TYPE.PRESERVE) {
        return;
    }
    var input = ((_a = focusMap.get(id)) !== null && _a !== void 0 ? _a : {}).input;
    focusMap.delete(id);
    if (restoreFocusType === CONST_1.default.MODAL.RESTORE_FOCUS_TYPE.DELETE) {
        return;
    }
    // This modal is not the topmost one, do not restore it.
    if (activeModals.length > activeModalIndex) {
        if (input) {
            var lastId = activeModals.at(-1);
            focusMap.set(lastId, __assign(__assign({}, focusMap.get(lastId)), { input: input }));
        }
        return;
    }
    if (input) {
        focus(input, shouldIgnoreFocused);
        return;
    }
    // Try to find the topmost one and restore it
    tryRestoreTopmostFocus(shouldIgnoreFocused, isInUploadingContext);
}
function resetReadyToFocus(id) {
    var promise = {
        ready: Promise.resolve(),
        resolve: function () { },
    };
    promise.ready = new Promise(function (resolve) {
        promise.resolve = resolve;
    });
    promiseMap.set(id, promise);
}
/**
 * Backward compatibility, for cases without an ModalId param, it's fine to just take the topmost one.
 */
function getTopmostModalId() {
    if (promiseMap.size < 1) {
        return 0;
    }
    return __spreadArray([], promiseMap.keys(), true).at(-1);
}
function setReadyToFocus(id) {
    var _a;
    var key = id !== null && id !== void 0 ? id : getTopmostModalId();
    var promise = promiseMap.get(key);
    if (!promise) {
        return;
    }
    (_a = promise.resolve) === null || _a === void 0 ? void 0 : _a.call(promise);
    promiseMap.delete(key);
}
function isReadyToFocus(id) {
    var key = id !== null && id !== void 0 ? id : getTopmostModalId();
    var promise = promiseMap.get(key);
    if (!promise) {
        return Promise.resolve();
    }
    return promise.ready;
}
function refocusAfterModalFullyClosed(id, restoreType, isInUploadingContext) {
    var _a;
    (_a = isReadyToFocus(id)) === null || _a === void 0 ? void 0 : _a.then(function () { return restoreFocusState(id, false, restoreType, isInUploadingContext); });
}
exports.default = {
    getId: getId,
    saveFocusedInput: saveFocusedInput,
    clearFocusedInput: clearFocusedInput,
    releaseInput: releaseInput,
    saveFocusState: saveFocusState,
    restoreFocusState: restoreFocusState,
    resetReadyToFocus: resetReadyToFocus,
    setReadyToFocus: setReadyToFocus,
    isReadyToFocus: isReadyToFocus,
    refocusAfterModalFullyClosed: refocusAfterModalFullyClosed,
    tryRestoreTopmostFocus: tryRestoreTopmostFocus,
};
