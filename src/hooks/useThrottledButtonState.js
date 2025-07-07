"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = useThrottledButtonState;
var react_1 = require("react");
function useThrottledButtonState() {
    var _a = (0, react_1.useState)(true), isButtonActive = _a[0], setIsButtonActive = _a[1];
    (0, react_1.useEffect)(function () {
        if (isButtonActive) {
            return;
        }
        var timer = setTimeout(function () {
            setIsButtonActive(true);
        }, 1800);
        return function () { return clearTimeout(timer); };
    }, [isButtonActive]);
    return [isButtonActive, function () { return setIsButtonActive(false); }];
}
