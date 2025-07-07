"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var BaseOnboardingPrivateDomain_1 = require("./BaseOnboardingPrivateDomain");
function OnboardingPrivateDomain(props) {
    return (<BaseOnboardingPrivateDomain_1.default shouldUseNativeStyles 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}/>);
}
OnboardingPrivateDomain.displayName = 'OnboardingPrivateDomain';
exports.default = OnboardingPrivateDomain;
