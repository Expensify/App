"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var OnboardingWrapper_1 = require("@components/OnboardingWrapper");
var BaseOnboardingWorkEmail_1 = require("./BaseOnboardingWorkEmail");
function OnboardingWorkEmail(props) {
    return (<OnboardingWrapper_1.default>
            <BaseOnboardingWorkEmail_1.default shouldUseNativeStyles={false} 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}/>
        </OnboardingWrapper_1.default>);
}
OnboardingWorkEmail.displayName = 'OnboardingWorkEmail';
exports.default = OnboardingWorkEmail;
