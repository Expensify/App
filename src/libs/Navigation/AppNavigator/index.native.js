"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
function AppNavigator(_a) {
    var authenticated = _a.authenticated;
    if (authenticated) {
        var AuthScreens = require('./AuthScreens').default;
        // These are the protected screens and only accessible when an authToken is present
        return <AuthScreens />;
    }
    var PublicScreens = require('./PublicScreens').default;
    return <PublicScreens />;
}
AppNavigator.displayName = 'AppNavigator';
exports.default = (0, react_1.memo)(AppNavigator);
