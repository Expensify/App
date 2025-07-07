"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useBeforeRemove_1 = require("@hooks/useBeforeRemove");
var useLocalize_1 = require("@hooks/useLocalize");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var variables_1 = require("@styles/variables");
var CONST_1 = require("@src/CONST");
var FeatureTrainingModal_1 = require("./FeatureTrainingModal");
var HoldMenuSectionList_1 = require("./HoldMenuSectionList");
var Illustrations = require("./Icon/Illustrations");
var Text_1 = require("./Text");
var TextPill_1 = require("./TextPill");
function ProcessMoneyRequestHoldMenu(_a) {
    var onClose = _a.onClose, onConfirm = _a.onConfirm;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var onboardingIsMediumOrLargerScreenWidth = (0, useResponsiveLayout_1.default)().onboardingIsMediumOrLargerScreenWidth;
    (0, useBeforeRemove_1.default)(onClose);
    var title = (0, react_1.useMemo)(function () { return (<react_native_1.View style={[styles.flexRow, styles.alignItemsCenter, onboardingIsMediumOrLargerScreenWidth ? styles.mb1 : styles.mb2]}>
                <Text_1.default style={[styles.textHeadline, styles.mr2]}>{translate('iou.holdEducationalTitle')}</Text_1.default>
                <TextPill_1.default textStyles={styles.holdRequestInline}>{translate('iou.holdEducationalText')}</TextPill_1.default>
            </react_native_1.View>); }, [onboardingIsMediumOrLargerScreenWidth, styles.flexRow, styles.alignItemsCenter, styles.mb1, styles.mb2, styles.textHeadline, styles.mr2, styles.holdRequestInline, translate]);
    return (<FeatureTrainingModal_1.default title={title} description={translate('iou.whatIsHoldExplain')} confirmText={translate('common.buttonConfirm')} image={Illustrations.HoldExpense} contentFitImage="cover" width={variables_1.default.holdEducationModalWidth} illustrationAspectRatio={CONST_1.default.ILLUSTRATION_ASPECT_RATIO} contentInnerContainerStyles={styles.mb5} modalInnerContainerStyle={styles.pt0} illustrationOuterContainerStyle={styles.p0} onClose={onClose} onConfirm={onConfirm}>
            <HoldMenuSectionList_1.default />
        </FeatureTrainingModal_1.default>);
}
ProcessMoneyRequestHoldMenu.displayName = 'ProcessMoneyRequestHoldMenu';
exports.default = ProcessMoneyRequestHoldMenu;
