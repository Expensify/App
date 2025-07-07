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
var ConfirmModal_1 = require("@components/ConfirmModal");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Expensicons = require("@components/Icon/Expensicons");
var MenuItem_1 = require("@components/MenuItem");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var ScrollView_1 = require("@components/ScrollView");
var Switch_1 = require("@components/Switch");
var Text_1 = require("@components/Text");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CurrencyUtils = require("@libs/CurrencyUtils");
var ErrorUtils = require("@libs/ErrorUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var NotFoundPage_1 = require("@pages/ErrorPage/NotFoundPage");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var DistanceRate = require("@userActions/Policy/DistanceRate");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
function PolicyDistanceRateDetailsPage(_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y;
    var route = _a.route;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var _z = (0, react_1.useState)(false), isWarningModalVisible = _z[0], setIsWarningModalVisible = _z[1];
    var _0 = (0, react_1.useState)(false), isDeleteModalVisible = _0[0], setIsDeleteModalVisible = _0[1];
    var policyID = route.params.policyID;
    var policy = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(route.params.policyID))[0];
    var rateID = route.params.rateID;
    var customUnit = (0, PolicyUtils_1.getDistanceRateCustomUnit)(policy);
    var rate = customUnit === null || customUnit === void 0 ? void 0 : customUnit.rates[rateID];
    var currency = (_b = rate === null || rate === void 0 ? void 0 : rate.currency) !== null && _b !== void 0 ? _b : CONST_1.default.CURRENCY.USD;
    var taxClaimablePercentage = (_c = rate === null || rate === void 0 ? void 0 : rate.attributes) === null || _c === void 0 ? void 0 : _c.taxClaimablePercentage;
    var taxRateExternalID = (_d = rate === null || rate === void 0 ? void 0 : rate.attributes) === null || _d === void 0 ? void 0 : _d.taxRateExternalID;
    var isDistanceTrackTaxEnabled = !!((_e = customUnit === null || customUnit === void 0 ? void 0 : customUnit.attributes) === null || _e === void 0 ? void 0 : _e.taxEnabled);
    var isPolicyTrackTaxEnabled = !!((_f = policy === null || policy === void 0 ? void 0 : policy.tax) === null || _f === void 0 ? void 0 : _f.trackingEnabled);
    var taxRate = taxRateExternalID && ((_g = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _g === void 0 ? void 0 : _g.taxes[taxRateExternalID]) ? "".concat((_j = (_h = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _h === void 0 ? void 0 : _h.taxes[taxRateExternalID]) === null || _j === void 0 ? void 0 : _j.name, " (").concat((_l = (_k = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _k === void 0 ? void 0 : _k.taxes[taxRateExternalID]) === null || _l === void 0 ? void 0 : _l.value, ")") : '';
    // Rates can be disabled or deleted as long as in the remaining rates there is always at least one enabled rate and there are no pending delete action
    var canDisableOrDeleteRate = Object.values((_m = customUnit === null || customUnit === void 0 ? void 0 : customUnit.rates) !== null && _m !== void 0 ? _m : {}).some(function (distanceRate) { return (distanceRate === null || distanceRate === void 0 ? void 0 : distanceRate.enabled) && rateID !== (distanceRate === null || distanceRate === void 0 ? void 0 : distanceRate.customUnitRateID) && (distanceRate === null || distanceRate === void 0 ? void 0 : distanceRate.pendingAction) !== CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE; });
    var errorFields = rate === null || rate === void 0 ? void 0 : rate.errorFields;
    if (!rate) {
        return <NotFoundPage_1.default />;
    }
    var editRateValue = function () {
        Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_DISTANCE_RATE_EDIT.getRoute(policyID, rateID));
    };
    var editTaxReclaimableValue = function () {
        Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_DISTANCE_RATE_TAX_RECLAIMABLE_ON_EDIT.getRoute(policyID, rateID));
    };
    var editTaxRateValue = function () {
        Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_DISTANCE_RATE_TAX_RATE_EDIT.getRoute(policyID, rateID));
    };
    var toggleRate = function () {
        if (!(rate === null || rate === void 0 ? void 0 : rate.enabled) || canDisableOrDeleteRate) {
            DistanceRate.setPolicyDistanceRatesEnabled(policyID, customUnit, [__assign(__assign({}, rate), { enabled: !(rate === null || rate === void 0 ? void 0 : rate.enabled) })]);
        }
        else {
            setIsWarningModalVisible(true);
        }
    };
    var deleteRate = function () {
        Navigation_1.default.goBack();
        DistanceRate.deletePolicyDistanceRates(policyID, customUnit, [rateID]);
        setIsDeleteModalVisible(false);
    };
    var rateValueToDisplay = CurrencyUtils.convertAmountToDisplayString(rate === null || rate === void 0 ? void 0 : rate.rate, currency);
    var taxClaimableValueToDisplay = taxClaimablePercentage && rate.rate ? CurrencyUtils.convertAmountToDisplayString(taxClaimablePercentage * rate.rate, currency) : '';
    var unitToDisplay = translate("common.".concat((_p = (_o = customUnit === null || customUnit === void 0 ? void 0 : customUnit.attributes) === null || _o === void 0 ? void 0 : _o.unit) !== null && _p !== void 0 ? _p : CONST_1.default.CUSTOM_UNITS.DISTANCE_UNIT_MILES));
    var clearErrorFields = function (fieldName) {
        var _a;
        DistanceRate.clearPolicyDistanceRateErrorFields(policyID, customUnit.customUnitID, rateID, __assign(__assign({}, errorFields), (_a = {}, _a[fieldName] = null, _a)));
    };
    return (<AccessOrNotFoundWrapper_1.default accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.PAID]} policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_DISTANCE_RATES_ENABLED}>
            <ScreenWrapper_1.default testID={PolicyDistanceRateDetailsPage.displayName} enableEdgeToEdgeBottomSafeAreaPadding style={[styles.defaultModalContainer]}>
                <HeaderWithBackButton_1.default title={"".concat(rateValueToDisplay, " / ").concat(translate("common.".concat((_r = (_q = customUnit === null || customUnit === void 0 ? void 0 : customUnit.attributes) === null || _q === void 0 ? void 0 : _q.unit) !== null && _r !== void 0 ? _r : CONST_1.default.CUSTOM_UNITS.DISTANCE_UNIT_MILES)))}/>
                <ScrollView_1.default contentContainerStyle={styles.flexGrow1} addBottomSafeAreaPadding>
                    <OfflineWithFeedback_1.default errors={ErrorUtils.getLatestErrorField(rate !== null && rate !== void 0 ? rate : {}, 'enabled')} pendingAction={(_s = rate === null || rate === void 0 ? void 0 : rate.pendingFields) === null || _s === void 0 ? void 0 : _s.enabled} errorRowStyles={styles.mh5} onClose={function () { return clearErrorFields('enabled'); }}>
                        <react_native_1.View style={[styles.flexRow, styles.justifyContentBetween, styles.p5]}>
                            <Text_1.default>{translate('workspace.distanceRates.enableRate')}</Text_1.default>
                            <Switch_1.default isOn={(_t = rate === null || rate === void 0 ? void 0 : rate.enabled) !== null && _t !== void 0 ? _t : false} onToggle={toggleRate} accessibilityLabel={translate('workspace.distanceRates.enableRate')}/>
                        </react_native_1.View>
                    </OfflineWithFeedback_1.default>
                    <OfflineWithFeedback_1.default errors={ErrorUtils.getLatestErrorField(rate !== null && rate !== void 0 ? rate : {}, 'rate')} pendingAction={(_v = (_u = rate === null || rate === void 0 ? void 0 : rate.pendingFields) === null || _u === void 0 ? void 0 : _u.rate) !== null && _v !== void 0 ? _v : (_w = rate === null || rate === void 0 ? void 0 : rate.pendingFields) === null || _w === void 0 ? void 0 : _w.currency} errorRowStyles={styles.mh5} onClose={function () { return clearErrorFields('rate'); }}>
                        <MenuItemWithTopDescription_1.default shouldShowRightIcon title={"".concat(rateValueToDisplay, " / ").concat(unitToDisplay)} description={translate('workspace.distanceRates.rate')} descriptionTextStyle={styles.textNormal} onPress={editRateValue}/>
                    </OfflineWithFeedback_1.default>
                    {isDistanceTrackTaxEnabled && isPolicyTrackTaxEnabled && (<OfflineWithFeedback_1.default errors={ErrorUtils.getLatestErrorField(rate, 'taxRateExternalID')} pendingAction={(_x = rate === null || rate === void 0 ? void 0 : rate.pendingFields) === null || _x === void 0 ? void 0 : _x.taxRateExternalID} errorRowStyles={styles.mh5} onClose={function () { return clearErrorFields('taxRateExternalID'); }}>
                            <react_native_1.View style={styles.w100}>
                                <MenuItemWithTopDescription_1.default title={taxRate} description={translate('workspace.taxes.taxRate')} shouldShowRightIcon onPress={editTaxRateValue}/>
                            </react_native_1.View>
                        </OfflineWithFeedback_1.default>)}
                    {isDistanceTrackTaxEnabled && !!taxRate && isPolicyTrackTaxEnabled && (<OfflineWithFeedback_1.default errors={ErrorUtils.getLatestErrorField(rate, 'taxClaimablePercentage')} pendingAction={(_y = rate === null || rate === void 0 ? void 0 : rate.pendingFields) === null || _y === void 0 ? void 0 : _y.taxClaimablePercentage} errorRowStyles={styles.mh5} onClose={function () { return clearErrorFields('taxClaimablePercentage'); }}>
                            <MenuItemWithTopDescription_1.default shouldShowRightIcon title={taxClaimableValueToDisplay} description={translate('workspace.taxes.taxReclaimableOn')} descriptionTextStyle={styles.textNormal} onPress={editTaxReclaimableValue}/>
                        </OfflineWithFeedback_1.default>)}
                    <MenuItem_1.default icon={Expensicons.Trashcan} title={translate('common.delete')} onPress={function () {
            if (canDisableOrDeleteRate) {
                setIsDeleteModalVisible(true);
                return;
            }
            setIsWarningModalVisible(true);
        }}/>
                    <ConfirmModal_1.default onConfirm={function () { return setIsWarningModalVisible(false); }} onCancel={function () { return setIsWarningModalVisible(false); }} isVisible={isWarningModalVisible} title={translate('workspace.distanceRates.oopsNotSoFast')} prompt={translate('workspace.distanceRates.workspaceNeeds')} confirmText={translate('common.buttonConfirm')} shouldShowCancelButton={false}/>
                    <ConfirmModal_1.default title={translate('workspace.distanceRates.deleteDistanceRate')} isVisible={isDeleteModalVisible} onConfirm={deleteRate} onCancel={function () { return setIsDeleteModalVisible(false); }} prompt={translate('workspace.distanceRates.areYouSureDelete', { count: 1 })} confirmText={translate('common.delete')} cancelText={translate('common.cancel')} danger/>
                </ScrollView_1.default>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
PolicyDistanceRateDetailsPage.displayName = 'PolicyDistanceRateDetailsPage';
exports.default = PolicyDistanceRateDetailsPage;
