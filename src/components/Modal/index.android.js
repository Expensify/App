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
var BaseModal_1 = require("./BaseModal");
// Only want to use useNativeDriver on Android. It has strange flashes issue on IOS
// https://github.com/react-native-modal/react-native-modal#the-modal-flashes-in-a-weird-way-when-animating
function Modal(_a) {
    var _b = _a.useNativeDriver, useNativeDriver = _b === void 0 ? true : _b, rest = __rest(_a, ["useNativeDriver"]);
    return (<BaseModal_1.default useNativeDriver={useNativeDriver} useNativeDriverForBackdrop={false} 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...rest}>
            {rest.children}
        </BaseModal_1.default>);
}
Modal.displayName = 'Modal';
exports.default = Modal;
