"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
var Section_1 = require("@components/Section");
var Text_1 = require("@components/Text");
var TextLink_1 = require("@components/TextLink");
var useLocalize_1 = require("@hooks/useLocalize");
var usePolicy_1 = require("@hooks/usePolicy");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CurrencyUtils_1 = require("@libs/CurrencyUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var ToggleSettingsOptionRow_1 = require("@pages/workspace/workflows/ToggleSettingsOptionRow");
var Policy_1 = require("@userActions/Policy/Policy");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function ExpenseReportRulesSection(_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0, _1, _2;
    var policyID = _a.policyID;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var policy = (0, usePolicy_1.default)(policyID);
    var workflowApprovalsUnavailable = (0, PolicyUtils_1.getWorkflowApprovalsUnavailable)(policy);
    var autoPayApprovedReportsUnavailable = !(policy === null || policy === void 0 ? void 0 : policy.areWorkflowsEnabled) || (policy === null || policy === void 0 ? void 0 : policy.reimbursementChoice) !== CONST_1.default.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_YES || !(0, PolicyUtils_1.hasVBBA)(policyID);
    var renderFallbackSubtitle = function (_a) {
        var featureName = _a.featureName, _b = _a.variant, variant = _b === void 0 ? 'unlock' : _b;
        return (<Text_1.default style={[styles.flexRow, styles.alignItemsCenter, styles.w100, styles.mt2]}>
                <Text_1.default style={styles.mutedNormalTextLabel}>{translate('workspace.rules.expenseReportRules.unlockFeatureGoToSubtitle')}</Text_1.default>{' '}
                <TextLink_1.default style={[styles.mutedNormalTextLabel, styles.link]} onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_MORE_FEATURES.getRoute(policyID)); }}>
                    {translate('workspace.common.moreFeatures').toLowerCase()}
                </TextLink_1.default>{' '}
                {variant === 'unlock' ? (<Text_1.default style={styles.mutedNormalTextLabel}>{translate('workspace.rules.expenseReportRules.unlockFeatureEnableWorkflowsSubtitle', { featureName: featureName })}</Text_1.default>) : (<Text_1.default style={styles.mutedNormalTextLabel}>{translate('workspace.rules.expenseReportRules.enableFeatureSubtitle', { featureName: featureName })}</Text_1.default>)}
            </Text_1.default>);
    };
    var optionItems = [
        {
            title: translate('workspace.rules.expenseReportRules.preventSelfApprovalsTitle'),
            subtitle: workflowApprovalsUnavailable
                ? renderFallbackSubtitle({ featureName: translate('common.approvals').toLowerCase() })
                : translate('workspace.rules.expenseReportRules.preventSelfApprovalsSubtitle'),
            switchAccessibilityLabel: translate('workspace.rules.expenseReportRules.preventSelfApprovalsTitle'),
            isActive: (policy === null || policy === void 0 ? void 0 : policy.preventSelfApproval) && !workflowApprovalsUnavailable,
            disabled: workflowApprovalsUnavailable,
            showLockIcon: workflowApprovalsUnavailable,
            pendingAction: (_b = policy === null || policy === void 0 ? void 0 : policy.pendingFields) === null || _b === void 0 ? void 0 : _b.preventSelfApproval,
            onToggle: function (isEnabled) { return (0, Policy_1.setPolicyPreventSelfApproval)(policyID, isEnabled); },
        },
        {
            title: translate('workspace.rules.expenseReportRules.autoApproveCompliantReportsTitle'),
            subtitle: workflowApprovalsUnavailable
                ? renderFallbackSubtitle({ featureName: translate('common.approvals').toLowerCase() })
                : translate('workspace.rules.expenseReportRules.autoApproveCompliantReportsSubtitle'),
            switchAccessibilityLabel: translate('workspace.rules.expenseReportRules.autoApproveCompliantReportsTitle'),
            isActive: (policy === null || policy === void 0 ? void 0 : policy.shouldShowAutoApprovalOptions) && !workflowApprovalsUnavailable,
            disabled: workflowApprovalsUnavailable,
            showLockIcon: workflowApprovalsUnavailable,
            pendingAction: (_c = policy === null || policy === void 0 ? void 0 : policy.pendingFields) === null || _c === void 0 ? void 0 : _c.shouldShowAutoApprovalOptions,
            onToggle: function (isEnabled) {
                (0, Policy_1.enableAutoApprovalOptions)(policyID, isEnabled);
            },
            subMenuItems: [
                <OfflineWithFeedback_1.default pendingAction={!((_d = policy === null || policy === void 0 ? void 0 : policy.pendingFields) === null || _d === void 0 ? void 0 : _d.shouldShowAutoApprovalOptions) && ((_f = (_e = policy === null || policy === void 0 ? void 0 : policy.autoApproval) === null || _e === void 0 ? void 0 : _e.pendingFields) === null || _f === void 0 ? void 0 : _f.limit) ? (_h = (_g = policy === null || policy === void 0 ? void 0 : policy.autoApproval) === null || _g === void 0 ? void 0 : _g.pendingFields) === null || _h === void 0 ? void 0 : _h.limit : null} key="autoApproveReportsUnder">
                    <MenuItemWithTopDescription_1.default description={translate('workspace.rules.expenseReportRules.autoApproveReportsUnderTitle')} title={(0, CurrencyUtils_1.convertToDisplayString)((_k = (_j = policy === null || policy === void 0 ? void 0 : policy.autoApproval) === null || _j === void 0 ? void 0 : _j.limit) !== null && _k !== void 0 ? _k : CONST_1.default.POLICY.AUTO_APPROVE_REPORTS_UNDER_DEFAULT_CENTS, (_l = policy === null || policy === void 0 ? void 0 : policy.outputCurrency) !== null && _l !== void 0 ? _l : CONST_1.default.CURRENCY.USD)} shouldShowRightIcon style={[styles.sectionMenuItemTopDescription, styles.mt6, styles.mbn3]} onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.RULES_AUTO_APPROVE_REPORTS_UNDER.getRoute(policyID)); }}/>
                </OfflineWithFeedback_1.default>,
                <OfflineWithFeedback_1.default pendingAction={!((_m = policy === null || policy === void 0 ? void 0 : policy.pendingFields) === null || _m === void 0 ? void 0 : _m.shouldShowAutoApprovalOptions) && ((_p = (_o = policy === null || policy === void 0 ? void 0 : policy.autoApproval) === null || _o === void 0 ? void 0 : _o.pendingFields) === null || _p === void 0 ? void 0 : _p.auditRate) ? (_r = (_q = policy === null || policy === void 0 ? void 0 : policy.autoApproval) === null || _q === void 0 ? void 0 : _q.pendingFields) === null || _r === void 0 ? void 0 : _r.auditRate : null} key="randomReportAuditTitle">
                    <MenuItemWithTopDescription_1.default description={translate('workspace.rules.expenseReportRules.randomReportAuditTitle')} title={"".concat(Math.round(((_t = (_s = policy === null || policy === void 0 ? void 0 : policy.autoApproval) === null || _s === void 0 ? void 0 : _s.auditRate) !== null && _t !== void 0 ? _t : CONST_1.default.POLICY.RANDOM_AUDIT_DEFAULT_PERCENTAGE) * 100), "%")} shouldShowRightIcon style={[styles.sectionMenuItemTopDescription, styles.mt6, styles.mbn3]} onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.RULES_RANDOM_REPORT_AUDIT.getRoute(policyID)); }}/>
                </OfflineWithFeedback_1.default>,
            ],
        },
        {
            title: translate('workspace.rules.expenseReportRules.autoPayApprovedReportsTitle'),
            subtitle: autoPayApprovedReportsUnavailable
                ? renderFallbackSubtitle({ featureName: translate('common.payments').toLowerCase() })
                : translate('workspace.rules.expenseReportRules.autoPayApprovedReportsSubtitle'),
            switchAccessibilityLabel: translate('workspace.rules.expenseReportRules.autoPayApprovedReportsTitle'),
            onToggle: function (isEnabled) {
                (0, Policy_1.enablePolicyAutoReimbursementLimit)(policyID, isEnabled);
            },
            disabled: autoPayApprovedReportsUnavailable,
            showLockIcon: autoPayApprovedReportsUnavailable,
            isActive: (policy === null || policy === void 0 ? void 0 : policy.shouldShowAutoReimbursementLimitOption) && !autoPayApprovedReportsUnavailable,
            pendingAction: (_u = policy === null || policy === void 0 ? void 0 : policy.pendingFields) === null || _u === void 0 ? void 0 : _u.shouldShowAutoReimbursementLimitOption,
            subMenuItems: [
                <OfflineWithFeedback_1.default pendingAction={!((_v = policy === null || policy === void 0 ? void 0 : policy.pendingFields) === null || _v === void 0 ? void 0 : _v.shouldShowAutoReimbursementLimitOption) && ((_x = (_w = policy === null || policy === void 0 ? void 0 : policy.autoReimbursement) === null || _w === void 0 ? void 0 : _w.pendingFields) === null || _x === void 0 ? void 0 : _x.limit)
                        ? (_z = (_y = policy === null || policy === void 0 ? void 0 : policy.autoReimbursement) === null || _y === void 0 ? void 0 : _y.pendingFields) === null || _z === void 0 ? void 0 : _z.limit
                        : null} key="autoPayReportsUnder">
                    <MenuItemWithTopDescription_1.default description={translate('workspace.rules.expenseReportRules.autoPayReportsUnderTitle')} title={(0, CurrencyUtils_1.convertToDisplayString)((_1 = (_0 = policy === null || policy === void 0 ? void 0 : policy.autoReimbursement) === null || _0 === void 0 ? void 0 : _0.limit) !== null && _1 !== void 0 ? _1 : CONST_1.default.POLICY.AUTO_REIMBURSEMENT_DEFAULT_LIMIT_CENTS, (_2 = policy === null || policy === void 0 ? void 0 : policy.outputCurrency) !== null && _2 !== void 0 ? _2 : CONST_1.default.CURRENCY.USD)} shouldShowRightIcon style={[styles.sectionMenuItemTopDescription, styles.mt6, styles.mbn3]} onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.RULES_AUTO_PAY_REPORTS_UNDER.getRoute(policyID)); }}/>
                </OfflineWithFeedback_1.default>,
            ],
        },
    ];
    return (<Section_1.default isCentralPane title={translate('workspace.rules.expenseReportRules.title')} subtitle={translate('workspace.rules.expenseReportRules.subtitle')} titleStyles={styles.accountSettingsSectionTitle} subtitleMuted>
            {optionItems.map(function (_a, index) {
            var title = _a.title, subtitle = _a.subtitle, isActive = _a.isActive, subMenuItems = _a.subMenuItems, showLockIcon = _a.showLockIcon, disabled = _a.disabled, onToggle = _a.onToggle, pendingAction = _a.pendingAction;
            var showBorderBottom = index !== optionItems.length - 1;
            return (<ToggleSettingsOptionRow_1.default key={title} title={title} subtitle={subtitle} switchAccessibilityLabel={title} wrapperStyle={[styles.pv6, showBorderBottom && styles.borderBottom]} shouldPlaceSubtitleBelowSwitch titleStyle={styles.pv2} subtitleStyle={styles.pt1} isActive={!!isActive} showLockIcon={showLockIcon} disabled={disabled} subMenuItems={subMenuItems} onToggle={onToggle} pendingAction={pendingAction}/>);
        })}
        </Section_1.default>);
}
exports.default = ExpenseReportRulesSection;
