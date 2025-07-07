"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var CurrencySelectionList_1 = require("@components/CurrencySelectionList");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var PerDiem_1 = require("@libs/actions/Policy/PerDiem");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
function EditPerDiemCurrencyPage(_a) {
    var _b, _c;
    var route = _a.route;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var policyID = route.params.policyID;
    var rateID = route.params.rateID;
    var subRateID = route.params.subRateID;
    var policy = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), { canBeMissing: true })[0];
    var customUnit = (0, PolicyUtils_1.getPerDiemCustomUnit)(policy);
    var selectedRate = (_b = customUnit === null || customUnit === void 0 ? void 0 : customUnit.rates) === null || _b === void 0 ? void 0 : _b[rateID];
    var editCurrency = (0, react_1.useCallback)(function (item) {
        var newCurrency = item.currencyCode;
        if (newCurrency !== (selectedRate === null || selectedRate === void 0 ? void 0 : selectedRate.currency)) {
            (0, PerDiem_1.editPerDiemRateCurrency)(policyID, rateID, customUnit, newCurrency);
        }
        Navigation_1.default.goBack(ROUTES_1.default.WORKSPACE_PER_DIEM_DETAILS.getRoute(policyID, rateID, subRateID));
    }, [selectedRate === null || selectedRate === void 0 ? void 0 : selectedRate.currency, policyID, rateID, subRateID, customUnit]);
    return (<AccessOrNotFoundWrapper_1.default accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.CONTROL]} policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_PER_DIEM_RATES_ENABLED} shouldBeBlocked={!policyID || !rateID || (0, EmptyObject_1.isEmptyObject)(selectedRate)}>
            <ScreenWrapper_1.default shouldEnableKeyboardAvoidingView={false} enableEdgeToEdgeBottomSafeAreaPadding testID={EditPerDiemCurrencyPage.displayName}>
                <HeaderWithBackButton_1.default title={translate('common.currency')} onBackButtonPress={function () { return Navigation_1.default.goBack(ROUTES_1.default.WORKSPACE_PER_DIEM_DETAILS.getRoute(policyID, rateID, subRateID)); }}/>
                <react_native_1.View style={[styles.pb4, styles.mh5]}>
                    <Text_1.default style={[styles.sidebarLinkText, styles.optionAlternateText]}>{translate('workspace.perDiem.editCurrencySubtitle', { destination: (_c = selectedRate === null || selectedRate === void 0 ? void 0 : selectedRate.name) !== null && _c !== void 0 ? _c : '' })}</Text_1.default>
                </react_native_1.View>
                <CurrencySelectionList_1.default initiallySelectedCurrencyCode={selectedRate === null || selectedRate === void 0 ? void 0 : selectedRate.currency} onSelect={editCurrency} searchInputLabel={translate('common.search')} addBottomSafeAreaPadding/>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
EditPerDiemCurrencyPage.displayName = 'EditPerDiemCurrencyPage';
exports.default = EditPerDiemCurrencyPage;
