"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var ChangeWorkspaceMenuSectionList_1 = require("@components/ChangeWorkspaceMenuSectionList");
var FeatureTrainingModal_1 = require("@components/FeatureTrainingModal");
var Illustrations = require("@components/Icon/Illustrations");
var useBeforeRemove_1 = require("@hooks/useBeforeRemove");
var useLocalize_1 = require("@hooks/useLocalize");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Report_1 = require("@libs/actions/Report");
var colors_1 = require("@styles/theme/colors");
var variables_1 = require("@styles/variables");
var CONST_1 = require("@src/CONST");
function ChangePolicyEducationalModal() {
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var onConfirm = (0, react_1.useCallback)(function () {
        (0, Report_1.dismissChangePolicyModal)();
    }, []);
    (0, useBeforeRemove_1.default)(onConfirm);
    return (<FeatureTrainingModal_1.default title={translate('iou.changePolicyEducational.title')} description={translate('iou.changePolicyEducational.description')} confirmText={translate('common.buttonConfirm')} image={Illustrations.ReceiptFairy} imageWidth={variables_1.default.changePolicyEducationModalIconWidth} imageHeight={variables_1.default.changePolicyEducationModalIconHeight} contentFitImage="cover" width={variables_1.default.changePolicyEducationModalWidth} illustrationAspectRatio={CONST_1.default.ILLUSTRATION_ASPECT_RATIO} illustrationInnerContainerStyle={[styles.alignItemsCenter, styles.justifyContentCenter, StyleUtils.getBackgroundColorStyle(colors_1.default.blue700)]} modalInnerContainerStyle={styles.pt0} illustrationOuterContainerStyle={styles.p0} contentInnerContainerStyles={[styles.mb5, styles.gap2]} onClose={onConfirm} onConfirm={onConfirm}>
            <ChangeWorkspaceMenuSectionList_1.default />
        </FeatureTrainingModal_1.default>);
}
ChangePolicyEducationalModal.displayName = 'ChangePolicyEducationalModal';
exports.default = ChangePolicyEducationalModal;
