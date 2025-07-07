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
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
function convertSourceToString(source) {
    var _a;
    if (typeof source === 'string' || typeof source === 'number') {
        return source.toString();
    }
    if (source instanceof Array) {
        return source.map(function (src) { return src.uri; }).join(', ');
    }
    if ('uri' in source) {
        return (_a = source.uri) !== null && _a !== void 0 ? _a : '';
    }
    return '';
}
/**
 * A custom React hook that provides functionalities to manage attachment errors.
 * - `setAttachmentError(key)`: Set or unset an error for a given key.
 * - `clearAttachmentErrors()`: Clear all errors.
 * - `isErrorInAttachment(key)`: Check if there is an error associated with a specific key.
 * Errors are indexed by a serialized key - for example url or source object.
 */
function useAttachmentErrors() {
    var _a = (0, react_1.useState)({}), attachmentErrors = _a[0], setAttachmentErrors = _a[1];
    var setAttachmentError = (0, react_1.useCallback)(function (key, state) {
        if (state === void 0) { state = true; }
        var url = convertSourceToString(key);
        if (!url) {
            return;
        }
        setAttachmentErrors(function (prevState) {
            var _a;
            return (__assign(__assign({}, prevState), (_a = {}, _a[url] = state, _a)));
        });
    }, []);
    var clearAttachmentErrors = (0, react_1.useCallback)(function () {
        setAttachmentErrors({});
    }, []);
    var isErrorInAttachment = (0, react_1.useCallback)(function (key) { return attachmentErrors === null || attachmentErrors === void 0 ? void 0 : attachmentErrors[convertSourceToString(key)]; }, [attachmentErrors]);
    return { setAttachmentError: setAttachmentError, clearAttachmentErrors: clearAttachmentErrors, isErrorInAttachment: isErrorInAttachment };
}
exports.default = useAttachmentErrors;
