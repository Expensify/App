"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var react_native_1 = require("react-native");
var BaseOnboardingWorkEmail_1 = require("./BaseOnboardingWorkEmail");
function OnboardingWorkEmail(props) {
    // To block android native back button behavior
    (0, native_1.useFocusEffect)((0, react_1.useCallback)(function () {
        // Return true to indicate that the back button press is handled here
        var backAction = function () { return true; };
        var backHandler = react_native_1.BackHandler.addEventListener('hardwareBackPress', backAction);
        return function () { return backHandler.remove(); };
    }, []));
    return (<BaseOnboardingWorkEmail_1.default shouldUseNativeStyles 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}/>);
}
OnboardingWorkEmail.displayName = 'OnboardingWorkEmail';
exports.default = OnboardingWorkEmail;
