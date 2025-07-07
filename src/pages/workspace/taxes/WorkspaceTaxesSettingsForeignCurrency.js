"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var TaxPicker_1 = require("@components/TaxPicker");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@libs/Navigation/Navigation");
var TransactionUtils = require("@libs/TransactionUtils");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var withPolicyAndFullscreenLoading_1 = require("@pages/workspace/withPolicyAndFullscreenLoading");
var Policy_1 = require("@userActions/Policy/Policy");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function WorkspaceTaxesSettingsForeignCurrency(_a) {
    var _b, _c;
    var policyID = _a.route.params.policyID, policy = _a.policy;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var foreignTaxDefault = (_c = (_b = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _b === void 0 ? void 0 : _b.foreignTaxDefault) !== null && _c !== void 0 ? _c : '';
    var selectedTaxRate = TransactionUtils.getWorkspaceTaxesSettingsName(policy, foreignTaxDefault);
    var submit = function (taxes) {
        var _a;
        (0, Policy_1.setForeignCurrencyDefault)(policyID, (_a = taxes.code) !== null && _a !== void 0 ? _a : '');
        Navigation_1.default.goBack(ROUTES_1.default.WORKSPACE_TAXES_SETTINGS.getRoute(policyID));
    };
    var dismiss = function () {
        Navigation_1.default.goBack(ROUTES_1.default.WORKSPACE_TAXES_SETTINGS.getRoute(policyID));
    };
    return (<AccessOrNotFoundWrapper_1.default accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.PAID]} policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_TAXES_ENABLED}>
            <ScreenWrapper_1.default enableEdgeToEdgeBottomSafeAreaPadding shouldEnableMaxHeight testID={WorkspaceTaxesSettingsForeignCurrency.displayName} style={styles.defaultModalContainer}>
                <HeaderWithBackButton_1.default title={translate('workspace.taxes.foreignDefault')}/>

                <react_native_1.View style={[styles.mb4, styles.flex1]}>
                    <TaxPicker_1.default selectedTaxRate={selectedTaxRate} policyID={policyID} onSubmit={submit} onDismiss={dismiss} addBottomSafeAreaPadding/>
                </react_native_1.View>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
WorkspaceTaxesSettingsForeignCurrency.displayName = 'WorkspaceTaxesSettingsForeignCurrency';
exports.default = (0, withPolicyAndFullscreenLoading_1.default)(WorkspaceTaxesSettingsForeignCurrency);
