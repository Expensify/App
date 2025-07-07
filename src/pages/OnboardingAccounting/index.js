"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var OnboardingWrapper_1 = require("@components/OnboardingWrapper");
var BaseOnboardingAccounting_1 = require("./BaseOnboardingAccounting");
function OnboardingAccounting(props) {
    return (<OnboardingWrapper_1.default>
            <BaseOnboardingAccounting_1.default shouldUseNativeStyles={false} 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}/>
        </OnboardingWrapper_1.default>);
}
OnboardingAccounting.displayName = 'OnboardingAccounting';
exports.default = OnboardingAccounting;
