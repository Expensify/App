"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var useLocalize_1 = require("@hooks/useLocalize");
var Welcome = require("@userActions/Welcome");
var CONST_1 = require("@src/CONST");
var FeatureTrainingModal_1 = require("./FeatureTrainingModal");
function ExplanationModal() {
    var translate = (0, useLocalize_1.default)().translate;
    return (<FeatureTrainingModal_1.default title={translate('onboarding.explanationModal.title')} description={translate('onboarding.explanationModal.description')} secondaryDescription={translate('onboarding.explanationModal.secondaryDescription')} confirmText={translate('footer.getStarted')} videoURL={CONST_1.default.WELCOME_VIDEO_URL} onClose={Welcome.completeHybridAppOnboarding}/>);
}
ExplanationModal.displayName = 'ExplanationModal';
exports.default = ExplanationModal;
