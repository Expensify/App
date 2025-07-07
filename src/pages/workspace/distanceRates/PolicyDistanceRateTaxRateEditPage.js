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
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var TaxPicker_1 = require("@components/TaxPicker");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var DistanceRate_1 = require("@libs/actions/Policy/DistanceRate");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var TransactionUtils_1 = require("@libs/TransactionUtils");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var withPolicy_1 = require("@pages/workspace/withPolicy");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function PolicyDistanceRateTaxRateEditPage(_a) {
    var _b;
    var route = _a.route, policy = _a.policy;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var policyID = route.params.policyID;
    var rateID = route.params.rateID;
    var customUnit = (0, PolicyUtils_1.getDistanceRateCustomUnit)(policy);
    var rate = customUnit === null || customUnit === void 0 ? void 0 : customUnit.rates[rateID];
    var taxRateExternalID = (_b = rate === null || rate === void 0 ? void 0 : rate.attributes) === null || _b === void 0 ? void 0 : _b.taxRateExternalID;
    var selectedTaxRate = taxRateExternalID ? (0, TransactionUtils_1.getWorkspaceTaxesSettingsName)(policy, taxRateExternalID) : undefined;
    var onTaxRateChange = function (newTaxRate) {
        if (taxRateExternalID === newTaxRate.code) {
            Navigation_1.default.goBack();
            return;
        }
        if (!customUnit || !rate) {
            return;
        }
        (0, DistanceRate_1.updateDistanceTaxRate)(policyID, customUnit, [
            __assign(__assign({}, rate), { attributes: __assign(__assign({}, rate === null || rate === void 0 ? void 0 : rate.attributes), { taxRateExternalID: newTaxRate.code }) }),
        ]);
        Navigation_1.default.goBack(ROUTES_1.default.WORKSPACE_DISTANCE_RATE_DETAILS.getRoute(policyID, rateID));
    };
    var dismiss = function () {
        Navigation_1.default.goBack(ROUTES_1.default.WORKSPACE_DISTANCE_RATE_DETAILS.getRoute(policyID, rateID));
    };
    return (<AccessOrNotFoundWrapper_1.default accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.PAID]} policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_DISTANCE_RATES_ENABLED}>
            <ScreenWrapper_1.default enableEdgeToEdgeBottomSafeAreaPadding style={[styles.defaultModalContainer]} shouldEnableMaxHeight testID={PolicyDistanceRateTaxRateEditPage.displayName}>
                <HeaderWithBackButton_1.default title={translate('workspace.taxes.taxRate')} shouldShowBackButton/>
                <TaxPicker_1.default selectedTaxRate={selectedTaxRate} policyID={policyID} onSubmit={onTaxRateChange} onDismiss={dismiss} addBottomSafeAreaPadding/>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
PolicyDistanceRateTaxRateEditPage.displayName = 'PolicyDistanceRateTaxRateEditPage';
exports.default = (0, withPolicy_1.default)(PolicyDistanceRateTaxRateEditPage);
