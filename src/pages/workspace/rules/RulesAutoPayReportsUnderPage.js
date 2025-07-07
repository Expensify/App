"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var AmountForm_1 = require("@components/AmountForm");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var Text_1 = require("@components/Text");
var useAutoFocusInput_1 = require("@hooks/useAutoFocusInput");
var useLocalize_1 = require("@hooks/useLocalize");
var usePolicy_1 = require("@hooks/usePolicy");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CurrencyUtils_1 = require("@libs/CurrencyUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var Policy_1 = require("@userActions/Policy/Policy");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var RulesAutoPayReportsUnderModalForm_1 = require("@src/types/form/RulesAutoPayReportsUnderModalForm");
function RulesAutoPayReportsUnderPage(_a) {
    var _b, _c, _d;
    var route = _a.route;
    var policyID = route.params.policyID;
    var policy = (0, usePolicy_1.default)(policyID);
    var inputCallbackRef = (0, useAutoFocusInput_1.default)().inputCallbackRef;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var currencySymbol = (0, CurrencyUtils_1.getCurrencySymbol)((_b = policy === null || policy === void 0 ? void 0 : policy.outputCurrency) !== null && _b !== void 0 ? _b : CONST_1.default.CURRENCY.USD);
    var autoPayApprovedReportsUnavailable = (policy === null || policy === void 0 ? void 0 : policy.reimbursementChoice) === CONST_1.default.POLICY.REIMBURSEMENT_CHOICES.REIMBURSEMENT_NO;
    var defaultValue = (0, CurrencyUtils_1.convertToFrontendAmountAsString)((_d = (_c = policy === null || policy === void 0 ? void 0 : policy.autoReimbursement) === null || _c === void 0 ? void 0 : _c.limit) !== null && _d !== void 0 ? _d : CONST_1.default.POLICY.AUTO_REIMBURSEMENT_DEFAULT_LIMIT_CENTS, policy === null || policy === void 0 ? void 0 : policy.outputCurrency);
    var validateLimit = function (_a) {
        var maxExpenseAutoPayAmount = _a.maxExpenseAutoPayAmount;
        var errors = {};
        if ((0, CurrencyUtils_1.convertToBackendAmount)(parseFloat(maxExpenseAutoPayAmount)) > CONST_1.default.POLICY.AUTO_REIMBURSEMENT_MAX_LIMIT_CENTS) {
            errors[RulesAutoPayReportsUnderModalForm_1.default.MAX_EXPENSE_AUTO_PAY_AMOUNT] = translate('workspace.rules.expenseReportRules.autoPayApprovedReportsLimitError', { currency: currencySymbol });
        }
        return errors;
    };
    return (<AccessOrNotFoundWrapper_1.default policyID={policyID} accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.PAID]} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_RULES_ENABLED} shouldBeBlocked={!(policy === null || policy === void 0 ? void 0 : policy.shouldShowAutoReimbursementLimitOption) || autoPayApprovedReportsUnavailable}>
            <ScreenWrapper_1.default enableEdgeToEdgeBottomSafeAreaPadding shouldEnableMaxHeight testID={RulesAutoPayReportsUnderPage.displayName}>
                <HeaderWithBackButton_1.default title={translate('workspace.rules.expenseReportRules.autoPayReportsUnderTitle')} onBackButtonPress={function () { return Navigation_1.default.goBack(); }}/>
                <FormProvider_1.default style={[styles.flexGrow1, styles.mh5]} formID={ONYXKEYS_1.default.FORMS.RULES_AUTO_PAY_REPORTS_UNDER_MODAL_FORM} validate={validateLimit} onSubmit={function (_a) {
            var maxExpenseAutoPayAmount = _a.maxExpenseAutoPayAmount;
            (0, Policy_1.setPolicyAutoReimbursementLimit)(policyID, maxExpenseAutoPayAmount);
            Navigation_1.default.setNavigationActionToMicrotaskQueue(Navigation_1.default.goBack);
        }} submitButtonText={translate('common.save')} enabledWhenOffline shouldHideFixErrorsAlert addBottomSafeAreaPadding>
                    <react_native_1.View style={styles.mb4}>
                        <InputWrapper_1.default label={translate('iou.amount')} InputComponent={AmountForm_1.default} inputID={RulesAutoPayReportsUnderModalForm_1.default.MAX_EXPENSE_AUTO_PAY_AMOUNT} currency={currencySymbol} defaultValue={defaultValue} isCurrencyPressable={false} ref={inputCallbackRef} displayAsTextInput/>
                        <Text_1.default style={[styles.mutedNormalTextLabel, styles.mt2]}>{translate('workspace.rules.expenseReportRules.autoPayReportsUnderDescription')}</Text_1.default>
                    </react_native_1.View>
                </FormProvider_1.default>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
RulesAutoPayReportsUnderPage.displayName = 'RulesAutoPayReportsUnderPage';
exports.default = RulesAutoPayReportsUnderPage;
