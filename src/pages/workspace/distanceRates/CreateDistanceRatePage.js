"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var AmountForm_1 = require("@components/AmountForm");
var FullPageOfflineBlockingView_1 = require("@components/BlockingViews/FullPageOfflineBlockingView");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var useAutoFocusInput_1 = require("@hooks/useAutoFocusInput");
var useLocalize_1 = require("@hooks/useLocalize");
var usePolicy_1 = require("@hooks/usePolicy");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var PolicyDistanceRatesUtils_1 = require("@libs/PolicyDistanceRatesUtils");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var Navigation_1 = require("@navigation/Navigation");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var DistanceRate_1 = require("@userActions/Policy/DistanceRate");
var Policy_1 = require("@userActions/Policy/Policy");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var PolicyCreateDistanceRateForm_1 = require("@src/types/form/PolicyCreateDistanceRateForm");
function CreateDistanceRatePage(_a) {
    var _b, _c;
    var route = _a.route;
    var styles = (0, useThemeStyles_1.default)();
    var _d = (0, useLocalize_1.default)(), translate = _d.translate, toLocaleDigit = _d.toLocaleDigit;
    var policyID = route.params.policyID;
    var policy = (0, usePolicy_1.default)(policyID);
    var currency = (_b = policy === null || policy === void 0 ? void 0 : policy.outputCurrency) !== null && _b !== void 0 ? _b : CONST_1.default.CURRENCY.USD;
    var customUnit = (0, PolicyUtils_1.getDistanceRateCustomUnit)(policy);
    var customUnitID = (_c = customUnit === null || customUnit === void 0 ? void 0 : customUnit.customUnitID) !== null && _c !== void 0 ? _c : '';
    var customUnitRateID = (0, Policy_1.generateCustomUnitID)();
    var inputCallbackRef = (0, useAutoFocusInput_1.default)().inputCallbackRef;
    var FullPageBlockingView = !customUnitID ? FullPageOfflineBlockingView_1.default : react_native_1.View;
    var validate = (0, react_1.useCallback)(function (values) { var _a; return (0, PolicyDistanceRatesUtils_1.validateRateValue)(values, (_a = customUnit === null || customUnit === void 0 ? void 0 : customUnit.rates) !== null && _a !== void 0 ? _a : {}, toLocaleDigit); }, [toLocaleDigit, customUnit === null || customUnit === void 0 ? void 0 : customUnit.rates]);
    var submit = function (values) {
        var _a;
        var newRate = {
            currency: currency,
            name: (0, PolicyDistanceRatesUtils_1.getOptimisticRateName)((_a = customUnit === null || customUnit === void 0 ? void 0 : customUnit.rates) !== null && _a !== void 0 ? _a : {}),
            rate: parseFloat(values.rate) * CONST_1.default.POLICY.CUSTOM_UNIT_RATE_BASE_OFFSET,
            customUnitRateID: customUnitRateID,
            enabled: true,
        };
        (0, DistanceRate_1.createPolicyDistanceRate)(policyID, customUnitID, newRate);
        Navigation_1.default.goBack();
    };
    return (<AccessOrNotFoundWrapper_1.default accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.PAID]} policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_DISTANCE_RATES_ENABLED}>
            <ScreenWrapper_1.default enableEdgeToEdgeBottomSafeAreaPadding style={[styles.defaultModalContainer]} testID={CreateDistanceRatePage.displayName} shouldEnableMaxHeight>
                <HeaderWithBackButton_1.default title={translate('workspace.distanceRates.addRate')}/>
                <FullPageBlockingView style={[styles.flexGrow1]}>
                    <FormProvider_1.default formID={ONYXKEYS_1.default.FORMS.POLICY_CREATE_DISTANCE_RATE_FORM} submitButtonText={translate('common.save')} onSubmit={submit} validate={validate} enabledWhenOffline style={[styles.flexGrow1]} shouldHideFixErrorsAlert submitFlexEnabled={false} submitButtonStyles={[styles.mh5, styles.mt0]} addBottomSafeAreaPadding>
                        <InputWrapper_1.default InputComponent={AmountForm_1.default} inputID={PolicyCreateDistanceRateForm_1.default.RATE} fixedDecimals={CONST_1.default.MAX_TAX_RATE_DECIMAL_PLACES} isCurrencyPressable={false} currency={currency} ref={inputCallbackRef}/>
                    </FormProvider_1.default>
                </FullPageBlockingView>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
CreateDistanceRatePage.displayName = 'CreateDistanceRatePage';
exports.default = CreateDistanceRatePage;
