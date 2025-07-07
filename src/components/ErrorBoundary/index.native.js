"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var crashlytics_1 = require("@react-native-firebase/crashlytics");
var react_1 = require("react");
var Log_1 = require("@libs/Log");
var BaseErrorBoundary_1 = require("./BaseErrorBoundary");
var logError = function (errorMessage, error, errorInfo) {
    // Log the error to the server
    Log_1.default.alert("".concat(errorMessage, " - ").concat(error.message), { errorInfo: errorInfo }, false);
    /* On native we also log the error to crashlytics
     * Since the error was handled we need to manually tell crashlytics about it */
    (0, crashlytics_1.default)().log("errorInfo: ".concat(errorInfo));
    (0, crashlytics_1.default)().recordError(error);
};
function ErrorBoundary(_a) {
    var errorMessage = _a.errorMessage, children = _a.children;
    return (<BaseErrorBoundary_1.default errorMessage={errorMessage} logError={logError}>
            {children}
        </BaseErrorBoundary_1.default>);
}
ErrorBoundary.displayName = 'ErrorBoundary';
exports.default = ErrorBoundary;
