"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var PercentageForm_1 = require("@components/PercentageForm");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var Text_1 = require("@components/Text");
var useAutoFocusInput_1 = require("@hooks/useAutoFocusInput");
var useLocalize_1 = require("@hooks/useLocalize");
var usePolicy_1 = require("@hooks/usePolicy");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var Policy_1 = require("@userActions/Policy/Policy");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var RulesRandomReportAuditModalForm_1 = require("@src/types/form/RulesRandomReportAuditModalForm");
function RulesRandomReportAuditPage(_a) {
    var _b, _c;
    var route = _a.route;
    var policyID = route.params.policyID;
    var policy = (0, usePolicy_1.default)(policyID);
    var inputCallbackRef = (0, useAutoFocusInput_1.default)().inputCallbackRef;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var workflowApprovalsUnavailable = (0, PolicyUtils_1.getWorkflowApprovalsUnavailable)(policy);
    var defaultValue = Math.round(((_c = (_b = policy === null || policy === void 0 ? void 0 : policy.autoApproval) === null || _b === void 0 ? void 0 : _b.auditRate) !== null && _c !== void 0 ? _c : CONST_1.default.POLICY.RANDOM_AUDIT_DEFAULT_PERCENTAGE) * 100);
    return (<AccessOrNotFoundWrapper_1.default policyID={policyID} accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.PAID]} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_RULES_ENABLED} shouldBeBlocked={!(policy === null || policy === void 0 ? void 0 : policy.shouldShowAutoApprovalOptions) || workflowApprovalsUnavailable}>
            <ScreenWrapper_1.default enableEdgeToEdgeBottomSafeAreaPadding shouldEnableMaxHeight testID={RulesRandomReportAuditPage.displayName}>
                <HeaderWithBackButton_1.default title={translate('workspace.rules.expenseReportRules.randomReportAuditTitle')} onBackButtonPress={function () { return Navigation_1.default.goBack(); }}/>
                <FormProvider_1.default style={[styles.flexGrow1, styles.mh5]} formID={ONYXKEYS_1.default.FORMS.RULES_RANDOM_REPORT_AUDIT_MODAL_FORM} onSubmit={function (_a) {
            var auditRatePercentage = _a.auditRatePercentage;
            (0, Policy_1.setPolicyAutomaticApprovalRate)(policyID, auditRatePercentage);
            Navigation_1.default.setNavigationActionToMicrotaskQueue(Navigation_1.default.goBack);
        }} submitButtonText={translate('common.save')} enabledWhenOffline shouldHideFixErrorsAlert addBottomSafeAreaPadding>
                    <react_native_1.View style={styles.mb4}>
                        <InputWrapper_1.default label={translate('common.percentage')} InputComponent={PercentageForm_1.default} defaultValue={defaultValue.toString()} inputID={RulesRandomReportAuditModalForm_1.default.AUDIT_RATE_PERCENTAGE} ref={inputCallbackRef}/>
                        <Text_1.default style={[styles.mutedNormalTextLabel, styles.mt2]}>{translate('workspace.rules.expenseReportRules.randomReportAuditDescription')}</Text_1.default>
                    </react_native_1.View>
                </FormProvider_1.default>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
RulesRandomReportAuditPage.displayName = 'RulesRandomReportAuditPage';
exports.default = RulesRandomReportAuditPage;
