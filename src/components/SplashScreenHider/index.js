"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var BootSplash_1 = require("@libs/BootSplash");
function SplashScreenHider(_a) {
    var _b = _a.onHide, onHide = _b === void 0 ? function () { } : _b;
    (0, react_1.useEffect)(function () {
        BootSplash_1.default.hide().then(function () { return onHide(); });
    }, [onHide]);
    return null;
}
SplashScreenHider.displayName = 'SplashScreenHider';
exports.default = SplashScreenHider;
