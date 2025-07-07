"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var GenericPressable_1 = require("./GenericPressable");
function PressableWithoutFeedback(_a, ref) {
    var pressStyle = _a.pressStyle, focusStyle = _a.focusStyle, screenReaderActiveStyle = _a.screenReaderActiveStyle, shouldUseHapticsOnPress = _a.shouldUseHapticsOnPress, _b = _a.shouldUseHapticsOnLongPress, shouldUseHapticsOnLongPress = _b === void 0 ? false : _b, rest = __rest(_a, ["pressStyle", "focusStyle", "screenReaderActiveStyle", "shouldUseHapticsOnPress", "shouldUseHapticsOnLongPress"]);
    return (<GenericPressable_1.default 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...rest} ref={ref} shouldUseHapticsOnLongPress={shouldUseHapticsOnLongPress}/>);
}
PressableWithoutFeedback.displayName = 'PressableWithoutFeedback';
exports.default = react_1.default.forwardRef(PressableWithoutFeedback);
