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
var react_native_1 = require("react-native");
var AmountForm_1 = require("@components/AmountForm");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var useAutoFocusInput_1 = require("@hooks/useAutoFocusInput");
var useLocalize_1 = require("@hooks/useLocalize");
var usePolicy_1 = require("@hooks/usePolicy");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyDistanceRatesUtils_1 = require("@libs/PolicyDistanceRatesUtils");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var NotFoundPage_1 = require("@pages/ErrorPage/NotFoundPage");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var DistanceRate = require("@userActions/Policy/DistanceRate");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var PolicyDistanceRateEditForm_1 = require("@src/types/form/PolicyDistanceRateEditForm");
function PolicyDistanceRateEditPage(_a) {
    var _b, _c;
    var route = _a.route;
    var styles = (0, useThemeStyles_1.default)();
    var _d = (0, useLocalize_1.default)(), translate = _d.translate, toLocaleDigit = _d.toLocaleDigit;
    var inputCallbackRef = (0, useAutoFocusInput_1.default)().inputCallbackRef;
    var policyID = route.params.policyID;
    var rateID = route.params.rateID;
    var policy = (0, usePolicy_1.default)(policyID);
    var customUnit = (0, PolicyUtils_1.getDistanceRateCustomUnit)(policy);
    var rate = customUnit === null || customUnit === void 0 ? void 0 : customUnit.rates[rateID];
    var currency = (_b = rate === null || rate === void 0 ? void 0 : rate.currency) !== null && _b !== void 0 ? _b : CONST_1.default.CURRENCY.USD;
    var currentRateValue = (parseFloat(((_c = rate === null || rate === void 0 ? void 0 : rate.rate) !== null && _c !== void 0 ? _c : 0).toString()) / CONST_1.default.POLICY.CUSTOM_UNIT_RATE_BASE_OFFSET).toFixed(CONST_1.default.MAX_TAX_RATE_DECIMAL_PLACES);
    var submitRate = function (values) {
        if (currentRateValue === values.rate) {
            Navigation_1.default.goBack();
            return;
        }
        if (!customUnit || !rate) {
            return;
        }
        DistanceRate.updatePolicyDistanceRateValue(policyID, customUnit, [__assign(__assign({}, rate), { rate: Number(values.rate) * CONST_1.default.POLICY.CUSTOM_UNIT_RATE_BASE_OFFSET })]);
        react_native_1.Keyboard.dismiss();
        Navigation_1.default.goBack();
    };
    var validate = (0, react_1.useCallback)(function (values) { var _a; return (0, PolicyDistanceRatesUtils_1.validateRateValue)(values, (_a = customUnit === null || customUnit === void 0 ? void 0 : customUnit.rates) !== null && _a !== void 0 ? _a : {}, toLocaleDigit, rate === null || rate === void 0 ? void 0 : rate.rate); }, [toLocaleDigit, customUnit === null || customUnit === void 0 ? void 0 : customUnit.rates, rate === null || rate === void 0 ? void 0 : rate.rate]);
    if (!rate) {
        return <NotFoundPage_1.default />;
    }
    return (<AccessOrNotFoundWrapper_1.default accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.PAID]} policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_DISTANCE_RATES_ENABLED}>
            <ScreenWrapper_1.default enableEdgeToEdgeBottomSafeAreaPadding style={[styles.defaultModalContainer]} testID={PolicyDistanceRateEditPage.displayName} shouldEnableMaxHeight>
                <HeaderWithBackButton_1.default title={translate('workspace.distanceRates.rate')} shouldShowBackButton onBackButtonPress={function () { return Navigation_1.default.goBack(); }}/>
                <FormProvider_1.default formID={ONYXKEYS_1.default.FORMS.POLICY_DISTANCE_RATE_EDIT_FORM} submitButtonText={translate('common.save')} onSubmit={submitRate} validate={validate} enabledWhenOffline style={[styles.flexGrow1]} shouldHideFixErrorsAlert submitFlexEnabled={false} submitButtonStyles={[styles.mh5, styles.mt0]} addBottomSafeAreaPadding>
                    <InputWrapper_1.default InputComponent={AmountForm_1.default} inputID={PolicyDistanceRateEditForm_1.default.RATE} fixedDecimals={CONST_1.default.MAX_TAX_RATE_DECIMAL_PLACES} defaultValue={currentRateValue} isCurrencyPressable={false} currency={currency} ref={inputCallbackRef}/>
                </FormProvider_1.default>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
PolicyDistanceRateEditPage.displayName = 'PolicyDistanceRateEditPage';
exports.default = PolicyDistanceRateEditPage;
