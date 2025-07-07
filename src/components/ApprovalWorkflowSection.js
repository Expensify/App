"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var useLocalize_1 = require("@hooks/useLocalize");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useTheme_1 = require("@hooks/useTheme");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var OptionsListUtils_1 = require("@libs/OptionsListUtils");
var Icon_1 = require("./Icon");
var Expensicons = require("./Icon/Expensicons");
var MenuItem_1 = require("./MenuItem");
var PressableWithoutFeedback_1 = require("./Pressable/PressableWithoutFeedback");
var Text_1 = require("./Text");
function ApprovalWorkflowSection(_a) {
    var approvalWorkflow = _a.approvalWorkflow, onPress = _a.onPress;
    var styles = (0, useThemeStyles_1.default)();
    var theme = (0, useTheme_1.default)();
    var _b = (0, useLocalize_1.default)(), translate = _b.translate, toLocaleOrdinal = _b.toLocaleOrdinal;
    var shouldUseNarrowLayout = (0, useResponsiveLayout_1.default)().shouldUseNarrowLayout;
    var approverTitle = (0, react_1.useCallback)(function (index) {
        return approvalWorkflow.approvers.length > 1 ? "".concat(toLocaleOrdinal(index + 1, true), " ").concat(translate('workflowsPage.approver').toLowerCase()) : "".concat(translate('workflowsPage.approver'));
    }, [approvalWorkflow.approvers.length, toLocaleOrdinal, translate]);
    var members = (0, react_1.useMemo)(function () {
        if (approvalWorkflow.isDefault) {
            return translate('workspace.common.everyone');
        }
        return (0, OptionsListUtils_1.sortAlphabetically)(approvalWorkflow.members, 'displayName')
            .map(function (m) { return m.displayName; })
            .join(', ');
    }, [approvalWorkflow.isDefault, approvalWorkflow.members, translate]);
    return (<PressableWithoutFeedback_1.default accessibilityRole="button" style={[styles.border, shouldUseNarrowLayout ? styles.p3 : styles.p4, styles.flexRow, styles.justifyContentBetween, styles.mt6, styles.mbn3]} onPress={onPress} accessibilityLabel={translate('workflowsPage.addApprovalsTitle')}>
            <react_native_1.View style={[styles.flex1]}>
                {approvalWorkflow.isDefault && (<react_native_1.View style={[styles.flexRow, styles.mb4, styles.alignItemsCenter, styles.pb1, styles.pt1]}>
                        <Icon_1.default src={Expensicons.Lightbulb} fill={theme.icon} additionalStyles={styles.mr2} small/>
                        <Text_1.default style={[styles.textLabelSupportingNormal]} suppressHighlighting>
                            {translate('workflowsPage.addApprovalTip')}
                        </Text_1.default>
                    </react_native_1.View>)}
                <MenuItem_1.default title={translate('workflowsExpensesFromPage.title')} style={styles.p0} titleStyle={styles.textLabelSupportingNormal} descriptionTextStyle={[styles.textNormalThemeText, styles.lineHeightXLarge]} description={members} numberOfLinesDescription={4} icon={Expensicons.Users} iconHeight={20} iconWidth={20} iconFill={theme.icon} onPress={onPress} shouldRemoveBackground/>

                {approvalWorkflow.approvers.map(function (approver, index) { return (
        // eslint-disable-next-line react/no-array-index-key
        <react_native_1.View key={"approver-".concat(approver.email, "-").concat(index)}>
                        <react_native_1.View style={styles.workflowApprovalVerticalLine}/>
                        <MenuItem_1.default title={approverTitle(index)} style={styles.p0} titleStyle={styles.textLabelSupportingNormal} descriptionTextStyle={[styles.textNormalThemeText, styles.lineHeightXLarge]} description={approver.displayName} icon={Expensicons.UserCheck} iconHeight={20} iconWidth={20} numberOfLinesDescription={1} iconFill={theme.icon} onPress={onPress} shouldRemoveBackground/>
                    </react_native_1.View>); })}
            </react_native_1.View>
            <Icon_1.default src={Expensicons.ArrowRight} fill={theme.icon} additionalStyles={[styles.alignSelfCenter]}/>
        </PressableWithoutFeedback_1.default>);
}
exports.default = ApprovalWorkflowSection;
