"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var AmountForm_1 = require("@components/AmountForm");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var Text_1 = require("@components/Text");
var useAutoFocusInput_1 = require("@hooks/useAutoFocusInput");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var usePolicy_1 = require("@hooks/usePolicy");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CurrencyUtils_1 = require("@libs/CurrencyUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var Category_1 = require("@userActions/Policy/Category");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var WorkspaceCategoryFlagAmountsOverForm_1 = require("@src/types/form/WorkspaceCategoryFlagAmountsOverForm");
var ExpenseLimitTypeSelector_1 = require("./ExpenseLimitTypeSelector/ExpenseLimitTypeSelector");
function CategoryFlagAmountsOverPage(_a) {
    var _b, _c, _d, _e;
    var _f = _a.route.params, policyID = _f.policyID, categoryName = _f.categoryName;
    var policy = (0, usePolicy_1.default)(policyID);
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var policyCategories = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_CATEGORIES).concat(policyID))[0];
    var _g = (0, react_1.useState)((_c = (_b = policyCategories === null || policyCategories === void 0 ? void 0 : policyCategories[categoryName]) === null || _b === void 0 ? void 0 : _b.expenseLimitType) !== null && _c !== void 0 ? _c : CONST_1.default.POLICY.EXPENSE_LIMIT_TYPES.EXPENSE), expenseLimitType = _g[0], setExpenseLimitType = _g[1];
    var inputCallbackRef = (0, useAutoFocusInput_1.default)().inputCallbackRef;
    var policyCategoryMaxExpenseAmount = (_d = policyCategories === null || policyCategories === void 0 ? void 0 : policyCategories[categoryName]) === null || _d === void 0 ? void 0 : _d.maxExpenseAmount;
    var defaultValue = policyCategoryMaxExpenseAmount === CONST_1.default.DISABLED_MAX_EXPENSE_VALUE || !policyCategoryMaxExpenseAmount
        ? ''
        : (0, CurrencyUtils_1.convertToFrontendAmountAsString)(policyCategoryMaxExpenseAmount, policy === null || policy === void 0 ? void 0 : policy.outputCurrency);
    return (<AccessOrNotFoundWrapper_1.default accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.CONTROL]} policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CATEGORIES_ENABLED}>
            <ScreenWrapper_1.default enableEdgeToEdgeBottomSafeAreaPadding style={[styles.defaultModalContainer]} testID={CategoryFlagAmountsOverPage.displayName} shouldEnableMaxHeight>
                <HeaderWithBackButton_1.default title={translate('workspace.rules.categoryRules.flagAmountsOver')} onBackButtonPress={function () { return Navigation_1.default.goBack(ROUTES_1.default.WORKSPACE_CATEGORY_SETTINGS.getRoute(policyID, categoryName)); }}/>
                <FormProvider_1.default style={[styles.flexGrow1]} formID={ONYXKEYS_1.default.FORMS.WORKSPACE_CATEGORY_FLAG_AMOUNTS_OVER_FORM} onSubmit={function (_a) {
            var maxExpenseAmount = _a.maxExpenseAmount;
            (0, Category_1.setPolicyCategoryMaxAmount)(policyID, categoryName, maxExpenseAmount, expenseLimitType);
            Navigation_1.default.setNavigationActionToMicrotaskQueue(function () { return Navigation_1.default.goBack(ROUTES_1.default.WORKSPACE_CATEGORY_SETTINGS.getRoute(policyID, categoryName)); });
        }} submitButtonText={translate('workspace.editor.save')} enabledWhenOffline submitButtonStyles={styles.ph5} shouldHideFixErrorsAlert addBottomSafeAreaPadding>
                    <react_native_1.View style={[styles.mb4, styles.pt3, styles.ph5]}>
                        <Text_1.default style={styles.pb5}>{translate('workspace.rules.categoryRules.flagAmountsOverDescription', { categoryName: categoryName })}</Text_1.default>
                        <InputWrapper_1.default label={translate('iou.amount')} InputComponent={AmountForm_1.default} inputID={WorkspaceCategoryFlagAmountsOverForm_1.default.MAX_EXPENSE_AMOUNT} currency={(0, CurrencyUtils_1.getCurrencySymbol)((_e = policy === null || policy === void 0 ? void 0 : policy.outputCurrency) !== null && _e !== void 0 ? _e : CONST_1.default.CURRENCY.USD)} defaultValue={defaultValue} isCurrencyPressable={false} ref={inputCallbackRef} displayAsTextInput/>
                        <Text_1.default style={[styles.mutedTextLabel, styles.mt2]}>{translate('workspace.rules.categoryRules.flagAmountsOverSubtitle')}</Text_1.default>
                    </react_native_1.View>
                    <ExpenseLimitTypeSelector_1.default label={translate('common.type')} defaultValue={expenseLimitType} wrapperStyle={[styles.ph5, styles.mt3]} setNewExpenseLimitType={setExpenseLimitType}/>
                </FormProvider_1.default>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
CategoryFlagAmountsOverPage.displayName = 'CategoryFlagAmountsOverPage';
exports.default = CategoryFlagAmountsOverPage;
