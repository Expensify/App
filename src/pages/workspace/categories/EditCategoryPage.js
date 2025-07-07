"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@libs/Navigation/Navigation");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var Category_1 = require("@userActions/Policy/Category");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var SCREENS_1 = require("@src/SCREENS");
var CategoryForm_1 = require("./CategoryForm");
function EditCategoryPage(_a) {
    var _b;
    var route = _a.route;
    var policyID = route.params.policyID;
    var policyCategories = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_CATEGORIES).concat(policyID), { canBeMissing: true })[0];
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var currentCategoryName = route.params.categoryName;
    var backTo = (_b = route.params) === null || _b === void 0 ? void 0 : _b.backTo;
    var isQuickSettingsFlow = route.name === SCREENS_1.default.SETTINGS_CATEGORIES.SETTINGS_CATEGORY_EDIT;
    var validate = (0, react_1.useCallback)(function (values) {
        var errors = {};
        var newCategoryName = values.categoryName.trim();
        if (!newCategoryName) {
            errors.categoryName = translate('workspace.categories.categoryRequiredError');
        }
        else if ((policyCategories === null || policyCategories === void 0 ? void 0 : policyCategories[newCategoryName]) && currentCategoryName !== newCategoryName) {
            errors.categoryName = translate('workspace.categories.existingCategoryError');
        }
        else if (__spreadArray([], newCategoryName, true).length > CONST_1.default.API_TRANSACTION_CATEGORY_MAX_LENGTH) {
            // Uses the spread syntax to count the number of Unicode code points instead of the number of UTF-16 code units.
            errors.categoryName = translate('common.error.characterLimitExceedCounter', { length: __spreadArray([], newCategoryName, true).length, limit: CONST_1.default.API_TRANSACTION_CATEGORY_MAX_LENGTH });
        }
        return errors;
    }, [policyCategories, currentCategoryName, translate]);
    var editCategory = (0, react_1.useCallback)(function (values) {
        var newCategoryName = values.categoryName.trim();
        // Do not call the API if the edited category name is the same as the current category name
        if (currentCategoryName !== newCategoryName) {
            (0, Category_1.renamePolicyCategory)(policyID, { oldName: currentCategoryName, newName: values.categoryName });
        }
        // Ensure Onyx.update is executed before navigation to prevent UI blinking issues, affecting the category name and rate.
        Navigation_1.default.setNavigationActionToMicrotaskQueue(function () {
            Navigation_1.default.goBack(isQuickSettingsFlow
                ? ROUTES_1.default.SETTINGS_CATEGORY_SETTINGS.getRoute(policyID, currentCategoryName, backTo)
                : ROUTES_1.default.WORKSPACE_CATEGORY_SETTINGS.getRoute(policyID, currentCategoryName), { compareParams: false });
        });
    }, [isQuickSettingsFlow, currentCategoryName, policyID, backTo]);
    return (<AccessOrNotFoundWrapper_1.default accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.PAID]} policyID={route.params.policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CATEGORIES_ENABLED}>
            <ScreenWrapper_1.default enableEdgeToEdgeBottomSafeAreaPadding style={[styles.defaultModalContainer]} testID={EditCategoryPage.displayName} shouldEnableMaxHeight>
                <HeaderWithBackButton_1.default title={translate('workspace.categories.editCategory')} onBackButtonPress={function () {
            return Navigation_1.default.goBack(isQuickSettingsFlow
                ? ROUTES_1.default.SETTINGS_CATEGORY_SETTINGS.getRoute(route.params.policyID, route.params.categoryName, backTo)
                : ROUTES_1.default.WORKSPACE_CATEGORY_SETTINGS.getRoute(route.params.policyID, route.params.categoryName));
        }}/>
                <CategoryForm_1.default onSubmit={editCategory} validateEdit={validate} categoryName={currentCategoryName} policyCategories={policyCategories}/>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
EditCategoryPage.displayName = 'EditCategoryPage';
exports.default = EditCategoryPage;
