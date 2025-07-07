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
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var react_native_1 = require("react-native");
var BaseOnboardingPurpose_1 = require("./BaseOnboardingPurpose");
function OnboardingPurpose(_a) {
    var rest = __rest(_a, []);
    // To block android native back button behavior
    (0, native_1.useFocusEffect)((0, react_1.useCallback)(function () {
        // Return true to indicate that the back button press is handled here
        var backAction = function () { return true; };
        var backHandler = react_native_1.BackHandler.addEventListener('hardwareBackPress', backAction);
        return function () { return backHandler.remove(); };
    }, []));
    return (<BaseOnboardingPurpose_1.default shouldUseNativeStyles shouldEnableMaxHeight={false} 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...rest}/>);
}
OnboardingPurpose.displayName = 'OnboardingPurpose';
exports.default = OnboardingPurpose;
