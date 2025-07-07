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
var RulesMaxExpenseAmountForm_1 = require("@src/types/form/RulesMaxExpenseAmountForm");
function RulesMaxExpenseAmountPage(_a) {
    var _b;
    var policyID = _a.route.params.policyID;
    var policy = (0, usePolicy_1.default)(policyID);
    var inputCallbackRef = (0, useAutoFocusInput_1.default)().inputCallbackRef;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var defaultValue = (policy === null || policy === void 0 ? void 0 : policy.maxExpenseAmount) === CONST_1.default.DISABLED_MAX_EXPENSE_VALUE || !(policy === null || policy === void 0 ? void 0 : policy.maxExpenseAmount) ? '' : (0, CurrencyUtils_1.convertToFrontendAmountAsString)(policy === null || policy === void 0 ? void 0 : policy.maxExpenseAmount, policy === null || policy === void 0 ? void 0 : policy.outputCurrency);
    return (<AccessOrNotFoundWrapper_1.default policyID={policyID} accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.PAID]} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_RULES_ENABLED}>
            <ScreenWrapper_1.default enableEdgeToEdgeBottomSafeAreaPadding shouldEnableMaxHeight testID={RulesMaxExpenseAmountPage.displayName}>
                <HeaderWithBackButton_1.default title={translate('workspace.rules.individualExpenseRules.maxExpenseAmount')} onBackButtonPress={function () { return Navigation_1.default.goBack(); }}/>
                <FormProvider_1.default style={[styles.flexGrow1, styles.ph5]} formID={ONYXKEYS_1.default.FORMS.RULES_MAX_EXPENSE_AMOUNT_FORM} onSubmit={function (_a) {
            var maxExpenseAmount = _a.maxExpenseAmount;
            (0, Policy_1.setPolicyMaxExpenseAmount)(policyID, maxExpenseAmount);
            Navigation_1.default.setNavigationActionToMicrotaskQueue(Navigation_1.default.goBack);
        }} submitButtonText={translate('workspace.editor.save')} enabledWhenOffline shouldHideFixErrorsAlert addBottomSafeAreaPadding>
                    <react_native_1.View style={styles.mb4}>
                        <InputWrapper_1.default label={translate('iou.amount')} InputComponent={AmountForm_1.default} inputID={RulesMaxExpenseAmountForm_1.default.MAX_EXPENSE_AMOUNT} currency={(0, CurrencyUtils_1.getCurrencySymbol)((_b = policy === null || policy === void 0 ? void 0 : policy.outputCurrency) !== null && _b !== void 0 ? _b : CONST_1.default.CURRENCY.USD)} defaultValue={defaultValue} isCurrencyPressable={false} ref={inputCallbackRef} displayAsTextInput/>
                        <Text_1.default style={[styles.mutedTextLabel, styles.mt2]}>{translate('workspace.rules.individualExpenseRules.maxExpenseAmountDescription')}</Text_1.default>
                    </react_native_1.View>
                </FormProvider_1.default>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
RulesMaxExpenseAmountPage.displayName = 'RulesMaxExpenseAmountPage';
exports.default = RulesMaxExpenseAmountPage;
