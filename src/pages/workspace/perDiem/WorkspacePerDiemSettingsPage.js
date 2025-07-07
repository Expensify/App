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
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var PerDiem_1 = require("@libs/actions/Policy/PerDiem");
var ErrorUtils = require("@libs/ErrorUtils");
var OptionsListUtils = require("@libs/OptionsListUtils");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var Category = require("@userActions/Policy/Category");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
function WorkspacePerDiemSettingsPage(_a) {
    var _b, _c;
    var route = _a.route;
    var policyID = route.params.policyID;
    var policy = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID))[0];
    var policyCategories = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_CATEGORIES).concat(policyID))[0];
    var styles = (0, useThemeStyles_1.default)();
    var _d = (0, react_1.useState)(false), isCategoryPickerVisible = _d[0], setIsCategoryPickerVisible = _d[1];
    var translate = (0, useLocalize_1.default)().translate;
    var customUnit = (0, PolicyUtils_1.getPerDiemCustomUnit)(policy);
    var customUnitID = (_b = customUnit === null || customUnit === void 0 ? void 0 : customUnit.customUnitID) !== null && _b !== void 0 ? _b : '';
    var defaultCategory = customUnit === null || customUnit === void 0 ? void 0 : customUnit.defaultCategory;
    var errorFields = customUnit === null || customUnit === void 0 ? void 0 : customUnit.errorFields;
    var FullPageBlockingView = !customUnit ? FullPageOfflineBlockingView_1.default : react_native_1.View;
    var setNewCategory = function (category) {
        if (!category.searchText || !customUnit || defaultCategory === category.searchText) {
            return;
        }
        Category.setPolicyCustomUnitDefaultCategory(policyID, customUnitID, customUnit.defaultCategory, category.searchText);
    };
    var clearErrorFields = function (fieldName) {
        var _a;
        (0, PerDiem_1.clearPolicyPerDiemRatesErrorFields)(policyID, customUnitID, __assign(__assign({}, errorFields), (_a = {}, _a[fieldName] = null, _a)));
    };
    return (<AccessOrNotFoundWrapper_1.default accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.CONTROL]} policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_PER_DIEM_RATES_ENABLED}>
            <ScreenWrapper_1.default enableEdgeToEdgeBottomSafeAreaPadding style={[styles.defaultModalContainer]} testID={WorkspacePerDiemSettingsPage.displayName}>
                <HeaderWithBackButton_1.default title={translate('workspace.common.settings')}/>
                <FullPageBlockingView style={customUnit ? styles.flexGrow1 : []} addBottomSafeAreaPadding>
                    <ScrollView_1.default addBottomSafeAreaPadding contentContainerStyle={styles.flexGrow1} keyboardShouldPersistTaps="always">
                        {!!(policy === null || policy === void 0 ? void 0 : policy.areCategoriesEnabled) && OptionsListUtils.hasEnabledOptions(policyCategories !== null && policyCategories !== void 0 ? policyCategories : {}) && (<OfflineWithFeedback_1.default errors={ErrorUtils.getLatestErrorField(customUnit !== null && customUnit !== void 0 ? customUnit : {}, 'defaultCategory')} pendingAction={(_c = customUnit === null || customUnit === void 0 ? void 0 : customUnit.pendingFields) === null || _c === void 0 ? void 0 : _c.defaultCategory} errorRowStyles={styles.mh5} onClose={function () { return clearErrorFields('defaultCategory'); }}>
                                <CategorySelector_1.default policyID={policyID} label={translate('workspace.common.defaultCategory')} defaultValue={defaultCategory} wrapperStyle={[styles.ph5, styles.mt3]} setNewCategory={setNewCategory} isPickerVisible={isCategoryPickerVisible} showPickerModal={function () { return setIsCategoryPickerVisible(true); }} hidePickerModal={function () { return setIsCategoryPickerVisible(false); }}/>
                            </OfflineWithFeedback_1.default>)}
                    </ScrollView_1.default>
                </FullPageBlockingView>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
WorkspacePerDiemSettingsPage.displayName = 'WorkspacePerDiemSettingsPage';
exports.default = WorkspacePerDiemSettingsPage;
