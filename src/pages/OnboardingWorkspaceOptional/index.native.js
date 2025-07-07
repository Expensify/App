"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var BaseOnboardingWorkspaceOptional_1 = require("./BaseOnboardingWorkspaceOptional");
function OnboardingWorkspaceOptional(props) {
    return (<BaseOnboardingWorkspaceOptional_1.default shouldUseNativeStyles 
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}/>);
}
OnboardingWorkspaceOptional.displayName = 'OnboardingWorkspaceOptional';
exports.default = OnboardingWorkspaceOptional;
