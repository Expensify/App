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
var FullPageOfflineBlockingView_1 = require("@components/BlockingViews/FullPageOfflineBlockingView");
var CategorySelector_1 = require("@components/CategorySelector");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var ScrollView_1 = require("@components/ScrollView");
var Switch_1 = require("@components/Switch");
var Text_1 = require("@components/Text");
var TextLink_1 = require("@components/TextLink");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var OptionsListUtils_1 = require("@libs/OptionsListUtils");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var Category_1 = require("@userActions/Policy/Category");
var DistanceRate_1 = require("@userActions/Policy/DistanceRate");
var Policy_1 = require("@userActions/Policy/Policy");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var UnitSelector_1 = require("./UnitSelector");
function PolicyDistanceRatesSettingsPage(_a) {
    var _b, _c, _d, _e, _f, _g;
    var route = _a.route;
    var policyID = route.params.policyID;
    var policy = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID))[0];
    var policyCategories = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_CATEGORIES).concat(policyID))[0];
    var styles = (0, useThemeStyles_1.default)();
    var _h = (0, react_1.useState)(false), isCategoryPickerVisible = _h[0], setIsCategoryPickerVisible = _h[1];
    var translate = (0, useLocalize_1.default)().translate;
    var customUnit = (0, PolicyUtils_1.getDistanceRateCustomUnit)(policy);
    var isDistanceTrackTaxEnabled = !!((_b = customUnit === null || customUnit === void 0 ? void 0 : customUnit.attributes) === null || _b === void 0 ? void 0 : _b.taxEnabled);
    var isPolicyTrackTaxEnabled = !!((_c = policy === null || policy === void 0 ? void 0 : policy.tax) === null || _c === void 0 ? void 0 : _c.trackingEnabled);
    var defaultCategory = customUnit === null || customUnit === void 0 ? void 0 : customUnit.defaultCategory;
    var defaultUnit = (_d = customUnit === null || customUnit === void 0 ? void 0 : customUnit.attributes) === null || _d === void 0 ? void 0 : _d.unit;
    var errorFields = customUnit === null || customUnit === void 0 ? void 0 : customUnit.errorFields;
    var FullPageBlockingView = !customUnit ? FullPageOfflineBlockingView_1.default : react_native_1.View;
    var setNewUnit = function (unit) {
        if (!customUnit) {
            return;
        }
        var attributes = __assign(__assign({}, customUnit === null || customUnit === void 0 ? void 0 : customUnit.attributes), { unit: unit.value });
        (0, DistanceRate_1.setPolicyDistanceRatesUnit)(policyID, customUnit, __assign(__assign({}, customUnit), { attributes: attributes }));
    };
    var setNewCategory = function (category) {
        if (!category.searchText || !customUnit || defaultCategory === category.searchText) {
            return;
        }
        (0, Category_1.setPolicyCustomUnitDefaultCategory)(policyID, customUnit.customUnitID, customUnit.defaultCategory, category.searchText);
    };
    var clearErrorFields = function (fieldName) {
        var _a;
        if (!(customUnit === null || customUnit === void 0 ? void 0 : customUnit.customUnitID)) {
            return;
        }
        (0, DistanceRate_1.clearPolicyDistanceRatesErrorFields)(policyID, customUnit.customUnitID, __assign(__assign({}, errorFields), (_a = {}, _a[fieldName] = null, _a)));
    };
    var onToggleTrackTax = function (isOn) {
        if (!customUnit || !customUnit.attributes) {
            return;
        }
        var attributes = __assign(__assign({}, customUnit === null || customUnit === void 0 ? void 0 : customUnit.attributes), { taxEnabled: isOn });
        (0, Policy_1.enableDistanceRequestTax)(policyID, customUnit.name, customUnit.customUnitID, attributes);
    };
    return (<AccessOrNotFoundWrapper_1.default accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.PAID]} policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_DISTANCE_RATES_ENABLED}>
            <ScreenWrapper_1.default enableEdgeToEdgeBottomSafeAreaPadding style={[styles.defaultModalContainer]} testID={PolicyDistanceRatesSettingsPage.displayName}>
                <HeaderWithBackButton_1.default title={translate('workspace.common.settings')}/>
                <FullPageBlockingView style={customUnit ? styles.flexGrow1 : []}>
                    <ScrollView_1.default contentContainerStyle={styles.flexGrow1} keyboardShouldPersistTaps="always" addBottomSafeAreaPadding>
                        <react_native_1.View>
                            {!!defaultUnit && (<OfflineWithFeedback_1.default errors={(0, ErrorUtils_1.getLatestErrorField)(customUnit !== null && customUnit !== void 0 ? customUnit : {}, 'attributes')} pendingAction={(_e = customUnit === null || customUnit === void 0 ? void 0 : customUnit.pendingFields) === null || _e === void 0 ? void 0 : _e.attributes} errorRowStyles={styles.mh5} onClose={function () { return clearErrorFields('attributes'); }}>
                                    <UnitSelector_1.default label={translate('workspace.distanceRates.unit')} defaultValue={defaultUnit} wrapperStyle={[styles.ph5, styles.mt3]} setNewUnit={setNewUnit}/>
                                </OfflineWithFeedback_1.default>)}
                            {!!(policy === null || policy === void 0 ? void 0 : policy.areCategoriesEnabled) && (0, OptionsListUtils_1.hasEnabledOptions)(policyCategories !== null && policyCategories !== void 0 ? policyCategories : {}) && (<OfflineWithFeedback_1.default errors={(0, ErrorUtils_1.getLatestErrorField)(customUnit !== null && customUnit !== void 0 ? customUnit : {}, 'defaultCategory')} pendingAction={(_f = customUnit === null || customUnit === void 0 ? void 0 : customUnit.pendingFields) === null || _f === void 0 ? void 0 : _f.defaultCategory} errorRowStyles={styles.mh5} onClose={function () { return clearErrorFields('defaultCategory'); }}>
                                    <CategorySelector_1.default policyID={policyID} label={translate('workspace.common.defaultCategory')} defaultValue={defaultCategory} wrapperStyle={[styles.ph5, styles.mt3]} setNewCategory={setNewCategory} isPickerVisible={isCategoryPickerVisible} showPickerModal={function () { return setIsCategoryPickerVisible(true); }} hidePickerModal={function () { return setIsCategoryPickerVisible(false); }}/>
                                </OfflineWithFeedback_1.default>)}
                            <OfflineWithFeedback_1.default errors={(0, ErrorUtils_1.getLatestErrorField)(customUnit !== null && customUnit !== void 0 ? customUnit : {}, 'taxEnabled')} errorRowStyles={styles.mh5} pendingAction={(_g = customUnit === null || customUnit === void 0 ? void 0 : customUnit.pendingFields) === null || _g === void 0 ? void 0 : _g.taxEnabled}>
                                <react_native_1.View style={[styles.mt2, styles.mh5]}>
                                    <react_native_1.View style={[styles.flexRow, styles.mb2, styles.mr2, styles.alignItemsCenter, styles.justifyContentBetween]}>
                                        <Text_1.default style={[styles.textNormal, styles.colorMuted]}>{translate('workspace.distanceRates.trackTax')}</Text_1.default>
                                        <Switch_1.default isOn={isDistanceTrackTaxEnabled && isPolicyTrackTaxEnabled} accessibilityLabel={translate('workspace.distanceRates.trackTax')} onToggle={onToggleTrackTax} disabled={!isPolicyTrackTaxEnabled}/>
                                    </react_native_1.View>
                                </react_native_1.View>
                                {!isPolicyTrackTaxEnabled && (<react_native_1.View style={[styles.mh5]}>
                                        <Text_1.default style={styles.colorMuted}>
                                            {translate('workspace.distanceRates.taxFeatureNotEnabledMessage')}
                                            <TextLink_1.default onPress={function () {
                Navigation_1.default.dismissModal();
                Navigation_1.default.isNavigationReady().then(function () {
                    Navigation_1.default.goBack(ROUTES_1.default.WORKSPACE_MORE_FEATURES.getRoute(policyID));
                });
            }}>
                                                {translate('workspace.common.moreFeatures')}
                                            </TextLink_1.default>
                                            {translate('workspace.distanceRates.changePromptMessage')}
                                        </Text_1.default>
                                    </react_native_1.View>)}
                            </OfflineWithFeedback_1.default>
                        </react_native_1.View>
                    </ScrollView_1.default>
                </FullPageBlockingView>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
PolicyDistanceRatesSettingsPage.displayName = 'PolicyDistanceRatesSettingsPage';
exports.default = PolicyDistanceRatesSettingsPage;
