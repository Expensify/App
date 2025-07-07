"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useStyleUtils_1 = require("@hooks/useStyleUtils");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var colors_1 = require("@styles/theme/colors");
var variables_1 = require("@styles/variables");
var User_1 = require("@userActions/User");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var FeatureTrainingModal_1 = require("./FeatureTrainingModal");
var Icon_1 = require("./Icon");
var Illustrations = require("./Icon/Illustrations");
var Text_1 = require("./Text");
var menuSections = [
    {
        icon: Illustrations.PaperAirplane,
        titleTranslationKey: 'autoSubmitModal.submittedExpensesTitle',
        descriptionTranslationKey: 'autoSubmitModal.submittedExpensesDescription',
    },
    {
        icon: Illustrations.Pencil,
        titleTranslationKey: 'autoSubmitModal.pendingExpensesTitle',
        descriptionTranslationKey: 'autoSubmitModal.pendingExpensesDescription',
    },
];
function AutoSubmitModal() {
    var dismissedASAPSubmitExplanation = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_DISMISSED_ASAP_SUBMIT_EXPLANATION, { canBeMissing: true })[0];
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var StyleUtils = (0, useStyleUtils_1.default)();
    var onClose = (0, react_1.useCallback)(function (willShowAgain) {
        react_native_1.InteractionManager.runAfterInteractions(function () {
            if (!willShowAgain) {
                (0, User_1.dismissASAPSubmitExplanation)(true);
            }
            else {
                (0, User_1.dismissASAPSubmitExplanation)(false);
            }
        });
    }, []);
    return (<FeatureTrainingModal_1.default title={translate('autoSubmitModal.title')} description={translate('autoSubmitModal.description')} confirmText={translate('common.buttonConfirm')} image={Illustrations.ReceiptsStackedOnPin} contentFitImage="cover" width={variables_1.default.holdEducationModalWidth} imageWidth={variables_1.default.changePolicyEducationModalIconWidth} imageHeight={variables_1.default.changePolicyEducationModalIconHeight} illustrationAspectRatio={CONST_1.default.ILLUSTRATION_ASPECT_RATIO} illustrationInnerContainerStyle={[styles.alignItemsCenter, styles.justifyContentCenter, StyleUtils.getBackgroundColorStyle(colors_1.default.green700), styles.p8]} modalInnerContainerStyle={styles.pt0} illustrationOuterContainerStyle={styles.p0} shouldShowDismissModalOption={dismissedASAPSubmitExplanation === false} onConfirm={onClose} titleStyles={[styles.mb1]} contentInnerContainerStyles={[styles.mb5]}>
            {menuSections.map(function (section) { return (<react_native_1.View key={section.titleTranslationKey} style={[styles.flexRow, styles.alignItemsCenter, styles.mt3]}>
                    <Icon_1.default width={variables_1.default.menuIconSize} height={variables_1.default.menuIconSize} src={section.icon} additionalStyles={[styles.mr4]}/>
                    <react_native_1.View style={[styles.flex1, styles.justifyContentCenter]}>
                        <Text_1.default style={[styles.textStrong, styles.mb1]}>{translate(section.titleTranslationKey)}</Text_1.default>
                        <Text_1.default style={[styles.mutedTextLabel, styles.lh16]}>{translate(section.descriptionTranslationKey)}</Text_1.default>
                    </react_native_1.View>
                </react_native_1.View>); })}
        </FeatureTrainingModal_1.default>);
}
exports.default = AutoSubmitModal;
AutoSubmitModal.displayName = 'AutoSubmitModal';
