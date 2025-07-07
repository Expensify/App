"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var useLocalize_1 = require("@hooks/useLocalize");
var CONST_1 = require("@src/CONST");
var FeatureTrainingModal_1 = require("./FeatureTrainingModal");
function OnboardingWelcomeVideo() {
    var translate = (0, useLocalize_1.default)().translate;
    return (<FeatureTrainingModal_1.default title={translate('onboarding.welcomeVideo.title')} description={translate('onboarding.welcomeVideo.description')} confirmText={translate('onboarding.getStarted')} videoURL={CONST_1.default.WELCOME_VIDEO_URL}/>);
}
OnboardingWelcomeVideo.displayName = 'OnboardingWelcomeVideo';
exports.default = OnboardingWelcomeVideo;
