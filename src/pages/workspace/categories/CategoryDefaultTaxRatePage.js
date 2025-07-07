"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var SelectionList_1 = require("@components/SelectionList");
var RadioListItem_1 = require("@components/SelectionList/RadioListItem");
var useLocalize_1 = require("@hooks/useLocalize");
var usePolicy_1 = require("@hooks/usePolicy");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CategoryUtils = require("@libs/CategoryUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var Category = require("@userActions/Policy/Category");
var CONST_1 = require("@src/CONST");
var ROUTES_1 = require("@src/ROUTES");
function CategoryDefaultTaxRatePage(_a) {
    var _b, _c, _d;
    var _e = _a.route.params, policyID = _e.policyID, categoryName = _e.categoryName;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var policy = (0, usePolicy_1.default)(policyID);
    var selectedTaxRate = CategoryUtils.getCategoryDefaultTaxRate((_c = (_b = policy === null || policy === void 0 ? void 0 : policy.rules) === null || _b === void 0 ? void 0 : _b.expenseRules) !== null && _c !== void 0 ? _c : [], categoryName, (_d = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _d === void 0 ? void 0 : _d.defaultExternalID);
    var textForDefault = (0, react_1.useCallback)(function (taxID, taxRate) { return CategoryUtils.formatDefaultTaxRateText(translate, taxID, taxRate, policy === null || policy === void 0 ? void 0 : policy.taxRates); }, [policy === null || policy === void 0 ? void 0 : policy.taxRates, translate]);
    var taxesList = (0, react_1.useMemo)(function () {
        var _a, _b;
        if (!policy) {
            return [];
        }
        return Object.entries((_b = (_a = policy.taxRates) === null || _a === void 0 ? void 0 : _a.taxes) !== null && _b !== void 0 ? _b : {})
            .map(function (_a) {
            var _b, _c;
            var key = _a[0], value = _a[1];
            return ({
                text: textForDefault(key, value),
                keyForList: key,
                isSelected: key === selectedTaxRate,
                isDisabled: value.pendingAction === CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                pendingAction: (_b = value.pendingAction) !== null && _b !== void 0 ? _b : (Object.keys((_c = value.pendingFields) !== null && _c !== void 0 ? _c : {}).length > 0 ? CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE : null),
            });
        })
            .sort(function (a, b) { var _a, _b, _c, _d; return ((_b = (_a = a.text) !== null && _a !== void 0 ? _a : a.keyForList) !== null && _b !== void 0 ? _b : '').localeCompare((_d = (_c = b.text) !== null && _c !== void 0 ? _c : b.keyForList) !== null && _d !== void 0 ? _d : ''); });
    }, [policy, selectedTaxRate, textForDefault]);
    return (<AccessOrNotFoundWrapper_1.default accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.CONTROL]} policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CATEGORIES_ENABLED}>
            <ScreenWrapper_1.default enableEdgeToEdgeBottomSafeAreaPadding style={[styles.defaultModalContainer]} testID={CategoryDefaultTaxRatePage.displayName} shouldEnableMaxHeight>
                <HeaderWithBackButton_1.default title={translate('workspace.rules.categoryRules.defaultTaxRate')} onBackButtonPress={function () { return Navigation_1.default.goBack(ROUTES_1.default.WORKSPACE_CATEGORY_SETTINGS.getRoute(policyID, categoryName)); }}/>
                <SelectionList_1.default sections={[{ data: taxesList }]} ListItem={RadioListItem_1.default} onSelectRow={function (item) {
            if (!item.keyForList) {
                return;
            }
            if (item.keyForList === selectedTaxRate) {
                Navigation_1.default.goBack(ROUTES_1.default.WORKSPACE_CATEGORY_SETTINGS.getRoute(policyID, categoryName));
                return;
            }
            Category.setPolicyCategoryTax(policyID, categoryName, item.keyForList);
            Navigation_1.default.setNavigationActionToMicrotaskQueue(function () { return Navigation_1.default.goBack(ROUTES_1.default.WORKSPACE_CATEGORY_SETTINGS.getRoute(policyID, categoryName)); });
        }} shouldSingleExecuteRowSelect containerStyle={[styles.pt3]} initiallyFocusedOptionKey={selectedTaxRate} addBottomSafeAreaPadding/>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
CategoryDefaultTaxRatePage.displayName = 'CategoryDefaultTaxRatePage';
exports.default = CategoryDefaultTaxRatePage;
