"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_error_boundary_1 = require("react-error-boundary");
var BootSplash_1 = require("@libs/BootSplash");
var GenericErrorPage_1 = require("@pages/ErrorPage/GenericErrorPage");
var UpdateRequiredView_1 = require("@pages/ErrorPage/UpdateRequiredView");
var CONST_1 = require("@src/CONST");
var SplashScreenStateContext_1 = require("@src/SplashScreenStateContext");
/**
 * This component captures an error in the child component tree and logs it to the server
 * It can be used to wrap the entire app as well as to wrap specific parts for more granularity
 * @see {@link https://reactjs.org/docs/error-boundaries.html#where-to-place-error-boundaries}
 */
function BaseErrorBoundary(_a) {
    var _b = _a.logError, logError = _b === void 0 ? function () { } : _b, errorMessage = _a.errorMessage, children = _a.children;
    var _c = (0, react_1.useState)(''), errorContent = _c[0], setErrorContent = _c[1];
    var setSplashScreenState = (0, SplashScreenStateContext_1.useSplashScreenStateContext)().setSplashScreenState;
    var catchError = function (errorObject, errorInfo) {
        logError(errorMessage, errorObject, JSON.stringify(errorInfo));
        // We hide the splash screen since the error might happened during app init
        BootSplash_1.default.hide().then(function () { return setSplashScreenState(CONST_1.default.BOOT_SPLASH_STATE.HIDDEN); });
        setErrorContent(errorObject.message);
    };
    var updateRequired = errorContent === CONST_1.default.ERROR.UPDATE_REQUIRED;
    return (<react_error_boundary_1.ErrorBoundary FallbackComponent={updateRequired ? UpdateRequiredView_1.default : GenericErrorPage_1.default} onError={catchError}>
            {children}
        </react_error_boundary_1.ErrorBoundary>);
}
BaseErrorBoundary.displayName = 'BaseErrorBoundary';
exports.default = BaseErrorBoundary;
