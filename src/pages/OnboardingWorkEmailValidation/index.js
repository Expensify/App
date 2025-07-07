"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var OnboardingWrapper_1 = require("@components/OnboardingWrapper");
var BaseOnboardingWorkEmailValidation_1 = require("./BaseOnboardingWorkEmailValidation");
function OnboardingWorkEmailValidation(props) {
    return (<OnboardingWrapper_1.default>
            <BaseOnboardingWorkEmailValidation_1.default shouldUseNativeStyles={false} 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}/>
        </OnboardingWrapper_1.default>);
}
OnboardingWorkEmailValidation.displayName = 'OnboardingWorkEmailValidation';
exports.default = OnboardingWorkEmailValidation;
