"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var OnboardingWrapper_1 = require("@components/OnboardingWrapper");
var BaseOnboardingPrivateDomain_1 = require("./BaseOnboardingPrivateDomain");
function OnboardingPrivateDomain(props) {
    return (<OnboardingWrapper_1.default>
            <BaseOnboardingPrivateDomain_1.default shouldUseNativeStyles={false} 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}/>
        </OnboardingWrapper_1.default>);
}
OnboardingPrivateDomain.displayName = 'OnboardingPrivateDomain';
exports.default = OnboardingPrivateDomain;
