"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var AmountForm_1 = require("@components/AmountForm");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var Text_1 = require("@components/Text");
var useAutoFocusInput_1 = require("@hooks/useAutoFocusInput");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var TaxRate_1 = require("@libs/actions/TaxRate");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var NotFoundPage_1 = require("@pages/ErrorPage/NotFoundPage");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var withPolicyAndFullscreenLoading_1 = require("@pages/workspace/withPolicyAndFullscreenLoading");
var variables_1 = require("@styles/variables");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var WorkspaceTaxValueForm_1 = require("@src/types/form/WorkspaceTaxValueForm");
function ValuePage(_a) {
    var _b;
    var _c = _a.route.params, policyID = _c.policyID, taxID = _c.taxID, policy = _a.policy;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var inputCallbackRef = (0, useAutoFocusInput_1.default)().inputCallbackRef;
    var currentTaxRate = (0, PolicyUtils_1.getTaxByID)(policy, taxID);
    var defaultValue = (_b = currentTaxRate === null || currentTaxRate === void 0 ? void 0 : currentTaxRate.value) === null || _b === void 0 ? void 0 : _b.replace('%', '');
    var goBack = (0, react_1.useCallback)(function () { return Navigation_1.default.goBack(ROUTES_1.default.WORKSPACE_TAX_EDIT.getRoute(policyID, taxID)); }, [policyID, taxID]);
    var submit = (0, react_1.useCallback)(function (values) {
        if (defaultValue === values.value) {
            goBack();
            return;
        }
        (0, TaxRate_1.updatePolicyTaxValue)(policyID, taxID, Number(values.value));
        goBack();
    }, [goBack, policyID, taxID, defaultValue]);
    if (!currentTaxRate) {
        return <NotFoundPage_1.default />;
    }
    return (<AccessOrNotFoundWrapper_1.default accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.PAID]} policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_TAXES_ENABLED}>
            <ScreenWrapper_1.default enableEdgeToEdgeBottomSafeAreaPadding shouldEnableMaxHeight testID={ValuePage.displayName}>
                <HeaderWithBackButton_1.default title={translate('workspace.taxes.value')} onBackButtonPress={goBack}/>

                <FormProvider_1.default formID={ONYXKEYS_1.default.FORMS.WORKSPACE_TAX_VALUE_FORM} submitButtonText={translate('workspace.editor.save')} style={[styles.flexGrow1]} scrollContextEnabled validate={TaxRate_1.validateTaxValue} onSubmit={submit} enabledWhenOffline shouldHideFixErrorsAlert submitFlexEnabled={false} submitButtonStyles={[styles.mh5, styles.mt0]} addBottomSafeAreaPadding>
                    <InputWrapper_1.default InputComponent={AmountForm_1.default} inputID={WorkspaceTaxValueForm_1.default.VALUE} defaultValue={defaultValue} hideCurrencySymbol 
    // The default currency uses 2 decimal places, so we subtract it
    extraDecimals={CONST_1.default.MAX_TAX_RATE_DECIMAL_PLACES - 2} 
    // We increase the amount max length to support the extra decimals.
    amountMaxLength={CONST_1.default.MAX_TAX_RATE_INTEGER_PLACES} extraSymbol={<Text_1.default style={styles.iouAmountText}>%</Text_1.default>} ref={inputCallbackRef} autoGrowExtraSpace={variables_1.default.w80} autoGrowMarginSide="left" style={[styles.iouAmountTextInput, styles.textAlignRight]}/>
                </FormProvider_1.default>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
ValuePage.displayName = 'ValuePage';
exports.default = (0, withPolicyAndFullscreenLoading_1.default)(ValuePage);
