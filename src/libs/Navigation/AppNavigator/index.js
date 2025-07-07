"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var lazyRetry_1 = require("@src/utils/lazyRetry");
var AuthScreens = (0, react_1.lazy)(function () { return (0, lazyRetry_1.default)(function () { return Promise.resolve().then(function () { return require('./AuthScreens'); }); }); });
var PublicScreens = (0, react_1.lazy)(function () { return (0, lazyRetry_1.default)(function () { return Promise.resolve().then(function () { return require('./PublicScreens'); }); }); });
function AppNavigator(_a) {
    var authenticated = _a.authenticated;
    if (authenticated) {
        // These are the protected screens and only accessible when an authToken is present
        return (<react_1.Suspense fallback={null}>
                <AuthScreens />
            </react_1.Suspense>);
    }
    return (<react_1.Suspense fallback={null}>
            <PublicScreens />
        </react_1.Suspense>);
}
AppNavigator.displayName = 'AppNavigator';
exports.default = (0, react_1.memo)(AppNavigator);
