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
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var AmountForm_1 = require("@components/AmountForm");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var useAutoFocusInput_1 = require("@hooks/useAutoFocusInput");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyDistanceRatesUtils_1 = require("@libs/PolicyDistanceRatesUtils");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var withPolicy_1 = require("@pages/workspace/withPolicy");
var DistanceRate = require("@userActions/Policy/DistanceRate");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var PolicyDistanceRateTaxReclaimableOnEditForm_1 = require("@src/types/form/PolicyDistanceRateTaxReclaimableOnEditForm");
function PolicyDistanceRateTaxReclaimableEditPage(_a) {
    var _b, _c, _d;
    var route = _a.route, policy = _a.policy;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var inputCallbackRef = (0, useAutoFocusInput_1.default)().inputCallbackRef;
    var policyID = route.params.policyID;
    var rateID = route.params.rateID;
    var customUnit = (0, PolicyUtils_1.getDistanceRateCustomUnit)(policy);
    var rate = customUnit === null || customUnit === void 0 ? void 0 : customUnit.rates[rateID];
    var currency = (_b = rate === null || rate === void 0 ? void 0 : rate.currency) !== null && _b !== void 0 ? _b : CONST_1.default.CURRENCY.USD;
    var currentTaxReclaimableOnValue = ((_c = rate === null || rate === void 0 ? void 0 : rate.attributes) === null || _c === void 0 ? void 0 : _c.taxClaimablePercentage) && (rate === null || rate === void 0 ? void 0 : rate.rate) ? ((rate.attributes.taxClaimablePercentage * rate.rate) / 100).toFixed(CONST_1.default.MAX_TAX_RATE_DECIMAL_PLACES) : '';
    var submitTaxReclaimableOn = function (values) {
        if (values.taxClaimableValue === currentTaxReclaimableOnValue) {
            Navigation_1.default.goBack();
            return;
        }
        if (!customUnit || !rate) {
            return;
        }
        DistanceRate.updateDistanceTaxClaimableValue(policyID, customUnit, [
            __assign(__assign({}, rate), { attributes: __assign(__assign({}, rate === null || rate === void 0 ? void 0 : rate.attributes), { taxClaimablePercentage: (rate === null || rate === void 0 ? void 0 : rate.rate) ? (Number(values.taxClaimableValue) * 100) / rate.rate : undefined }) }),
        ]);
        Navigation_1.default.goBack();
    };
    var validate = (0, react_1.useCallback)(function (values) { return (0, PolicyDistanceRatesUtils_1.validateTaxClaimableValue)(values, rate); }, [rate]);
    return (<AccessOrNotFoundWrapper_1.default accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.PAID]} policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_DISTANCE_RATES_ENABLED}>
            <ScreenWrapper_1.default enableEdgeToEdgeBottomSafeAreaPadding style={[styles.defaultModalContainer]} testID={PolicyDistanceRateTaxReclaimableEditPage.displayName} shouldEnableMaxHeight>
                <HeaderWithBackButton_1.default title={translate('workspace.taxes.taxReclaimableOn')} shouldShowBackButton/>
                <FormProvider_1.default formID={ONYXKEYS_1.default.FORMS.POLICY_DISTANCE_RATE_TAX_RECLAIMABLE_ON_EDIT_FORM} submitButtonText={translate('common.save')} onSubmit={submitTaxReclaimableOn} validate={validate} enabledWhenOffline style={[styles.flexGrow1]} shouldHideFixErrorsAlert submitFlexEnabled={false} submitButtonStyles={[styles.mh5, styles.mt0]} addBottomSafeAreaPadding>
                    <InputWrapper_1.default InputComponent={AmountForm_1.default} inputID={PolicyDistanceRateTaxReclaimableOnEditForm_1.default.TAX_CLAIMABLE_VALUE} fixedDecimals={CONST_1.default.MAX_TAX_RATE_DECIMAL_PLACES} defaultValue={(_d = currentTaxReclaimableOnValue === null || currentTaxReclaimableOnValue === void 0 ? void 0 : currentTaxReclaimableOnValue.toString()) !== null && _d !== void 0 ? _d : ''} isCurrencyPressable={false} currency={currency} ref={inputCallbackRef}/>
                </FormProvider_1.default>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
PolicyDistanceRateTaxReclaimableEditPage.displayName = 'PolicyDistanceRateTaxReclaimableEditPage';
exports.default = (0, withPolicy_1.default)(PolicyDistanceRateTaxReclaimableEditPage);
