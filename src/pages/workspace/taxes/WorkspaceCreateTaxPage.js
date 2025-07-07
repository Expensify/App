"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var AmountPicker_1 = require("@components/AmountPicker");
var FullPageNotFoundView_1 = require("@components/BlockingViews/FullPageNotFoundView");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var Text_1 = require("@components/Text");
var TextPicker_1 = require("@components/TextPicker");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var TaxRate_1 = require("@libs/actions/TaxRate");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var withPolicyAndFullscreenLoading_1 = require("@pages/workspace/withPolicyAndFullscreenLoading");
var variables_1 = require("@styles/variables");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var WorkspaceNewTaxForm_1 = require("@src/types/form/WorkspaceNewTaxForm");
function WorkspaceCreateTaxPage(_a) {
    var _b;
    var policy = _a.policy, policyID = _a.route.params.policyID;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var modal = (0, useOnyx_1.default)(ONYXKEYS_1.default.MODAL, { canBeMissing: true })[0];
    var submitForm = (0, react_1.useCallback)(function (_a) {
        var _b;
        var value = _a.value, values = __rest(_a, ["value"]);
        var taxRate = __assign(__assign({}, values), { value: (0, TaxRate_1.getTaxValueWithPercentage)(value), code: (0, TaxRate_1.getNextTaxCode)(values[WorkspaceNewTaxForm_1.default.NAME], (_b = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _b === void 0 ? void 0 : _b.taxes) });
        (0, TaxRate_1.createPolicyTax)(policyID, taxRate);
        Navigation_1.default.goBack();
    }, [(_b = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _b === void 0 ? void 0 : _b.taxes, policyID]);
    var validateForm = (0, react_1.useCallback)(function (values) {
        if (!policy) {
            return {};
        }
        return __assign(__assign({}, (0, TaxRate_1.validateTaxName)(policy, values)), (0, TaxRate_1.validateTaxValue)(values));
    }, [policy]);
    return (<AccessOrNotFoundWrapper_1.default accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.PAID]} policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_TAXES_ENABLED}>
            <ScreenWrapper_1.default testID={WorkspaceCreateTaxPage.displayName} enableEdgeToEdgeBottomSafeAreaPadding style={[styles.defaultModalContainer]}>
                <FullPageNotFoundView_1.default shouldShow={(0, PolicyUtils_1.hasAccountingConnections)(policy)} addBottomSafeAreaPadding>
                    <react_native_1.View style={[styles.h100, styles.flex1, styles.justifyContentBetween]}>
                        <HeaderWithBackButton_1.default title={translate('workspace.taxes.addRate')}/>
                        <FormProvider_1.default style={[styles.flexGrow1, styles.mh5]} formID={ONYXKEYS_1.default.FORMS.WORKSPACE_NEW_TAX_FORM} onSubmit={submitForm} validate={validateForm} submitButtonText={translate('common.save')} enabledWhenOffline shouldValidateOnBlur={false} disablePressOnEnter={!!(modal === null || modal === void 0 ? void 0 : modal.isVisible)} addBottomSafeAreaPadding>
                            <react_native_1.View style={styles.mhn5}>
                                <InputWrapper_1.default InputComponent={TextPicker_1.default} inputID={WorkspaceNewTaxForm_1.default.NAME} label={translate('common.name')} description={translate('common.name')} rightLabel={translate('common.required')} accessibilityLabel={translate('workspace.editor.nameInputLabel')} maxLength={CONST_1.default.TAX_RATES.NAME_MAX_LENGTH} multiline={false} role={CONST_1.default.ROLE.PRESENTATION} required/>
                                <InputWrapper_1.default InputComponent={AmountPicker_1.default} inputID={WorkspaceNewTaxForm_1.default.VALUE} title={function (v) { return (v ? (0, TaxRate_1.getTaxValueWithPercentage)(v) : ''); }} description={translate('workspace.taxes.value')} rightLabel={translate('common.required')} hideCurrencySymbol 
    // The default currency uses 2 decimal places, so we subtract it
    extraDecimals={CONST_1.default.MAX_TAX_RATE_DECIMAL_PLACES - 2} 
    // We increase the amount max length to support the extra decimals.
    amountMaxLength={CONST_1.default.MAX_TAX_RATE_INTEGER_PLACES} extraSymbol={<Text_1.default style={styles.iouAmountText}>%</Text_1.default>} autoGrowExtraSpace={variables_1.default.w80} autoGrowMarginSide="left" style={[styles.iouAmountTextInput, styles.textAlignRight]}/>
                            </react_native_1.View>
                        </FormProvider_1.default>
                    </react_native_1.View>
                </FullPageNotFoundView_1.default>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
WorkspaceCreateTaxPage.displayName = 'WorkspaceCreateTaxPage';
exports.default = (0, withPolicyAndFullscreenLoading_1.default)(WorkspaceCreateTaxPage);
