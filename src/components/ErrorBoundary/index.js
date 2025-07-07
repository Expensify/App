"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var Log_1 = require("@libs//Log");
var BaseErrorBoundary_1 = require("./BaseErrorBoundary");
var logError = function (errorMessage, error, errorInfo) {
    // Log the error to the server
    Log_1.default.alert("".concat(errorMessage, " - ").concat(error.message), { errorInfo: errorInfo }, false);
};
var onUnhandledRejection = function (event) {
    var rejection = event.reason;
    if (event.reason instanceof Error) {
        Log_1.default.alert("Unhandled Promise Rejection: ".concat(event.reason.message, "\nStack: ").concat(event.reason.stack), {}, false);
        return;
    }
    if (typeof event.reason === 'object' && event.reason !== null) {
        rejection = JSON.stringify(event.reason);
    }
    Log_1.default.alert("Unhandled Promise Rejection: ".concat(String(rejection)), {}, false);
};
function ErrorBoundary(_a) {
    var errorMessage = _a.errorMessage, children = _a.children;
    // Log unhandled promise rejections to the server
    (0, react_1.useEffect)(function () {
        window.addEventListener('unhandledrejection', onUnhandledRejection);
        return function () { return window.removeEventListener('unhandledrejection', onUnhandledRejection); };
    }, []);
    return (<BaseErrorBoundary_1.default errorMessage={errorMessage} logError={logError}>
            {children}
        </BaseErrorBoundary_1.default>);
}
ErrorBoundary.displayName = 'ErrorBoundary';
exports.default = ErrorBoundary;
