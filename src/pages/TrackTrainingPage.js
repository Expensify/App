"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var FeatureTrainingModal_1 = require("@components/FeatureTrainingModal");
var useLocalize_1 = require("@hooks/useLocalize");
var Link_1 = require("@userActions/Link");
var CONST_1 = require("@src/CONST");
var VIDEO_ASPECT_RATIO = 1560 / 1280;
function TrackTrainingPage() {
    var _a;
    var translate = (0, useLocalize_1.default)().translate;
    var onHelp = (0, react_1.useCallback)(function () {
        var _a;
        (0, Link_1.openExternalLink)((_a = CONST_1.default.FEATURE_TRAINING[CONST_1.default.FEATURE_TRAINING.CONTENT_TYPES.TRACK_EXPENSE]) === null || _a === void 0 ? void 0 : _a.LEARN_MORE_LINK);
    }, []);
    return (<FeatureTrainingModal_1.default shouldShowDismissModalOption confirmText={translate('common.buttonConfirm')} helpText={translate('common.learnMore')} onHelp={onHelp} videoURL={(_a = CONST_1.default.FEATURE_TRAINING[CONST_1.default.FEATURE_TRAINING.CONTENT_TYPES.TRACK_EXPENSE]) === null || _a === void 0 ? void 0 : _a.VIDEO_URL} illustrationAspectRatio={VIDEO_ASPECT_RATIO}/>);
}
TrackTrainingPage.displayName = 'TrackTrainingPage';
exports.default = TrackTrainingPage;
