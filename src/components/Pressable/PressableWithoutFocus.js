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
/**
 * This component prevents the tapped element from capturing focus.
 * We need to blur this element when clicked as it opens modal that implements focus-trapping.
 * When the modal is closed it focuses back to the last active element.
 * Therefore it shifts the element to bring it back to focus.
 * https://github.com/Expensify/App/issues/6806
 */
function PressableWithoutFocus(_a) {
    var children = _a.children, onPress = _a.onPress, onLongPress = _a.onLongPress, rest = __rest(_a, ["children", "onPress", "onLongPress"]);
    var ref = (0, react_1.useRef)(null);
    var pressAndBlur = function () {
        var _a;
        (_a = ref === null || ref === void 0 ? void 0 : ref.current) === null || _a === void 0 ? void 0 : _a.blur();
        onPress === null || onPress === void 0 ? void 0 : onPress();
    };
    return (<GenericPressable_1.default onPress={pressAndBlur} onLongPress={onLongPress} ref={ref} 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...rest}>
            {children}
        </GenericPressable_1.default>);
}
PressableWithoutFocus.displayName = 'PressableWithoutFocus';
exports.default = PressableWithoutFocus;
