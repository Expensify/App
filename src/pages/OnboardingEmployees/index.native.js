"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var BaseOnboardingEmployees_1 = require("./BaseOnboardingEmployees");
function OnboardingEmployees(props) {
    return (<BaseOnboardingEmployees_1.default shouldUseNativeStyles 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}/>);
}
OnboardingEmployees.displayName = 'OnboardingEmployees';
exports.default = OnboardingEmployees;
