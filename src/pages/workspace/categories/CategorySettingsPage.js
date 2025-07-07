"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var react_native_1 = require("react-native");
var ConfirmModal_1 = require("@components/ConfirmModal");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var Expensicons_1 = require("@components/Icon/Expensicons");
var MenuItem_1 = require("@components/MenuItem");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var OfflineWithFeedback_1 = require("@components/OfflineWithFeedback");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var ScrollView_1 = require("@components/ScrollView");
var Switch_1 = require("@components/Switch");
var Text_1 = require("@components/Text");
var TextLink_1 = require("@components/TextLink");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var usePolicy_1 = require("@hooks/usePolicy");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CategoryUtils_1 = require("@libs/CategoryUtils");
var CurrencyUtils_1 = require("@libs/CurrencyUtils");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var OptionsListUtils_1 = require("@libs/OptionsListUtils");
var PersonalDetailsUtils_1 = require("@libs/PersonalDetailsUtils");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var NotFoundPage_1 = require("@pages/ErrorPage/NotFoundPage");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var Category_1 = require("@userActions/Policy/Category");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var SCREENS_1 = require("@src/SCREENS");
function CategorySettingsPage(_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t;
    var _u = _a.route, _v = _u.params, backTo = _v.backTo, policyID = _v.policyID, categoryName = _v.categoryName, name = _u.name, navigation = _a.navigation;
    var allTransactionViolations = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS, { canBeMissing: true })[0];
    var policyTagLists = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(policyID), { canBeMissing: true })[0];
    var policyCategories = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_CATEGORIES).concat(policyID), { canBeMissing: false })[0];
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var _w = (0, react_1.useState)(false), deleteCategoryConfirmModalVisible = _w[0], setDeleteCategoryConfirmModalVisible = _w[1];
    var policy = (0, usePolicy_1.default)(policyID);
    var policyCategory = (_b = policyCategories === null || policyCategories === void 0 ? void 0 : policyCategories[categoryName]) !== null && _b !== void 0 ? _b : Object.values(policyCategories !== null && policyCategories !== void 0 ? policyCategories : {}).find(function (category) { return category.previousCategoryName === categoryName; });
    var policyCurrency = (_c = policy === null || policy === void 0 ? void 0 : policy.outputCurrency) !== null && _c !== void 0 ? _c : CONST_1.default.CURRENCY.USD;
    var policyCategoryExpenseLimitType = (_d = policyCategory === null || policyCategory === void 0 ? void 0 : policyCategory.expenseLimitType) !== null && _d !== void 0 ? _d : CONST_1.default.POLICY.EXPENSE_LIMIT_TYPES.EXPENSE;
    var _x = (0, react_1.useState)(false), isCannotDeleteOrDisableLastCategoryModalVisible = _x[0], setIsCannotDeleteOrDisableLastCategoryModalVisible = _x[1];
    var shouldPreventDisableOrDelete = (0, OptionsListUtils_1.isDisablingOrDeletingLastEnabledCategory)(policy, policyCategories, [policyCategory]);
    var areCommentsRequired = (_e = policyCategory === null || policyCategory === void 0 ? void 0 : policyCategory.areCommentsRequired) !== null && _e !== void 0 ? _e : false;
    var isQuickSettingsFlow = name === SCREENS_1.default.SETTINGS_CATEGORIES.SETTINGS_CATEGORY_SETTINGS;
    var navigateBack = function () {
        Navigation_1.default.goBack(isQuickSettingsFlow ? ROUTES_1.default.SETTINGS_CATEGORIES_ROOT.getRoute(policyID, backTo) : undefined);
    };
    var isFocused = (0, native_1.useIsFocused)();
    (0, react_1.useEffect)(function () {
        if ((policyCategory === null || policyCategory === void 0 ? void 0 : policyCategory.name) === categoryName || !isFocused) {
            return;
        }
        navigation.setParams({ categoryName: policyCategory === null || policyCategory === void 0 ? void 0 : policyCategory.name });
    }, [categoryName, navigation, policyCategory === null || policyCategory === void 0 ? void 0 : policyCategory.name, isFocused]);
    var flagAmountsOverText = (0, react_1.useMemo)(function () {
        if ((policyCategory === null || policyCategory === void 0 ? void 0 : policyCategory.maxExpenseAmount) === CONST_1.default.DISABLED_MAX_EXPENSE_VALUE || !(policyCategory === null || policyCategory === void 0 ? void 0 : policyCategory.maxExpenseAmount)) {
            return '';
        }
        return "".concat((0, CurrencyUtils_1.convertToDisplayString)(policyCategory === null || policyCategory === void 0 ? void 0 : policyCategory.maxExpenseAmount, policyCurrency), " ").concat(CONST_1.default.DOT_SEPARATOR, " ").concat(translate("workspace.rules.categoryRules.expenseLimitTypes.".concat(policyCategoryExpenseLimitType)));
    }, [policyCategory === null || policyCategory === void 0 ? void 0 : policyCategory.maxExpenseAmount, policyCategoryExpenseLimitType, policyCurrency, translate]);
    var approverText = (0, react_1.useMemo)(function () {
        var _a, _b, _c, _d, _e;
        var categoryApprover = (_d = (_c = (0, CategoryUtils_1.getCategoryApproverRule)((_b = (_a = policy === null || policy === void 0 ? void 0 : policy.rules) === null || _a === void 0 ? void 0 : _a.approvalRules) !== null && _b !== void 0 ? _b : [], categoryName)) === null || _c === void 0 ? void 0 : _c.approver) !== null && _d !== void 0 ? _d : '';
        var approver = (0, PersonalDetailsUtils_1.getPersonalDetailByEmail)(categoryApprover);
        return (_e = approver === null || approver === void 0 ? void 0 : approver.displayName) !== null && _e !== void 0 ? _e : categoryApprover;
    }, [categoryName, (_f = policy === null || policy === void 0 ? void 0 : policy.rules) === null || _f === void 0 ? void 0 : _f.approvalRules]);
    var defaultTaxRateText = (0, react_1.useMemo)(function () {
        var _a, _b, _c, _d;
        var taxID = (0, CategoryUtils_1.getCategoryDefaultTaxRate)((_b = (_a = policy === null || policy === void 0 ? void 0 : policy.rules) === null || _a === void 0 ? void 0 : _a.expenseRules) !== null && _b !== void 0 ? _b : [], categoryName, (_c = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _c === void 0 ? void 0 : _c.defaultExternalID);
        if (!taxID) {
            return '';
        }
        var taxRate = (_d = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _d === void 0 ? void 0 : _d.taxes[taxID];
        if (!taxRate) {
            return '';
        }
        return (0, CategoryUtils_1.formatDefaultTaxRateText)(translate, taxID, taxRate, policy === null || policy === void 0 ? void 0 : policy.taxRates);
    }, [categoryName, (_g = policy === null || policy === void 0 ? void 0 : policy.rules) === null || _g === void 0 ? void 0 : _g.expenseRules, policy === null || policy === void 0 ? void 0 : policy.taxRates, translate]);
    var requireReceiptsOverText = (0, react_1.useMemo)(function () {
        if (!policy) {
            return '';
        }
        return (0, CategoryUtils_1.formatRequireReceiptsOverText)(translate, policy, policyCategory === null || policyCategory === void 0 ? void 0 : policyCategory.maxAmountNoReceipt);
    }, [policy, policyCategory === null || policyCategory === void 0 ? void 0 : policyCategory.maxAmountNoReceipt, translate]);
    if (!policyCategory) {
        return <NotFoundPage_1.default />;
    }
    var updateWorkspaceCategoryEnabled = function (value) {
        var _a;
        if (shouldPreventDisableOrDelete) {
            setIsCannotDeleteOrDisableLastCategoryModalVisible(true);
            return;
        }
        (0, Category_1.setWorkspaceCategoryEnabled)(policyID, (_a = {}, _a[policyCategory.name] = { name: policyCategory.name, enabled: value }, _a), policyTagLists, allTransactionViolations);
    };
    var navigateToEditCategory = function () {
        Navigation_1.default.navigate(isQuickSettingsFlow ? ROUTES_1.default.SETTINGS_CATEGORY_EDIT.getRoute(policyID, policyCategory.name, backTo) : ROUTES_1.default.WORKSPACE_CATEGORY_EDIT.getRoute(policyID, policyCategory.name));
    };
    var deleteCategory = function () {
        (0, Category_1.deleteWorkspaceCategories)(policyID, [categoryName], policyTagLists, allTransactionViolations);
        setDeleteCategoryConfirmModalVisible(false);
        navigateBack();
    };
    var isThereAnyAccountingConnection = Object.keys((_h = policy === null || policy === void 0 ? void 0 : policy.connections) !== null && _h !== void 0 ? _h : {}).length !== 0;
    var workflowApprovalsUnavailable = (0, PolicyUtils_1.getWorkflowApprovalsUnavailable)(policy);
    var approverDisabled = !(policy === null || policy === void 0 ? void 0 : policy.areWorkflowsEnabled) || workflowApprovalsUnavailable;
    return (<AccessOrNotFoundWrapper_1.default accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.PAID]} policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CATEGORIES_ENABLED}>
            <ScreenWrapper_1.default enableEdgeToEdgeBottomSafeAreaPadding style={[styles.defaultModalContainer]} testID={CategorySettingsPage.displayName}>
                <HeaderWithBackButton_1.default title={categoryName} onBackButtonPress={navigateBack}/>
                <ConfirmModal_1.default isVisible={deleteCategoryConfirmModalVisible} onConfirm={deleteCategory} onCancel={function () { return setDeleteCategoryConfirmModalVisible(false); }} title={translate('workspace.categories.deleteCategory')} prompt={translate('workspace.categories.deleteCategoryPrompt')} confirmText={translate('common.delete')} cancelText={translate('common.cancel')} danger/>
                <ConfirmModal_1.default isVisible={isCannotDeleteOrDisableLastCategoryModalVisible} onConfirm={function () { return setIsCannotDeleteOrDisableLastCategoryModalVisible(false); }} onCancel={function () { return setIsCannotDeleteOrDisableLastCategoryModalVisible(false); }} title={translate('workspace.categories.cannotDeleteOrDisableAllCategories.title')} prompt={translate('workspace.categories.cannotDeleteOrDisableAllCategories.description')} confirmText={translate('common.buttonConfirm')} shouldShowCancelButton={false}/>
                <ScrollView_1.default contentContainerStyle={[styles.flexGrow1]} addBottomSafeAreaPadding>
                    <OfflineWithFeedback_1.default errors={(0, ErrorUtils_1.getLatestErrorMessageField)(policyCategory)} pendingAction={(_j = policyCategory === null || policyCategory === void 0 ? void 0 : policyCategory.pendingFields) === null || _j === void 0 ? void 0 : _j.enabled} errorRowStyles={styles.mh5} onClose={function () { return (0, Category_1.clearCategoryErrors)(policyID, categoryName); }}>
                        <react_native_1.View style={[styles.mt2, styles.mh5]}>
                            <react_native_1.View style={[styles.flexRow, styles.mb5, styles.mr2, styles.alignItemsCenter, styles.justifyContentBetween]}>
                                <Text_1.default style={[styles.flexShrink1, styles.mr2]}>{translate('workspace.categories.enableCategory')}</Text_1.default>
                                <Switch_1.default isOn={policyCategory.enabled} accessibilityLabel={translate('workspace.categories.enableCategory')} onToggle={updateWorkspaceCategoryEnabled} showLockIcon={shouldPreventDisableOrDelete}/>
                            </react_native_1.View>
                        </react_native_1.View>
                    </OfflineWithFeedback_1.default>
                    <OfflineWithFeedback_1.default pendingAction={(_k = policyCategory.pendingFields) === null || _k === void 0 ? void 0 : _k.name}>
                        <MenuItemWithTopDescription_1.default title={policyCategory.name} description={translate('common.name')} onPress={navigateToEditCategory} shouldShowRightIcon/>
                    </OfflineWithFeedback_1.default>
                    <OfflineWithFeedback_1.default pendingAction={(_l = policyCategory.pendingFields) === null || _l === void 0 ? void 0 : _l['GL Code']}>
                        <MenuItemWithTopDescription_1.default title={policyCategory['GL Code']} description={translate('workspace.categories.glCode')} onPress={function () {
            if (!(0, PolicyUtils_1.isControlPolicy)(policy)) {
                Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_UPGRADE.getRoute(policyID, CONST_1.default.UPGRADE_FEATURE_INTRO_MAPPING.glAndPayrollCodes.alias, isQuickSettingsFlow
                    ? ROUTES_1.default.SETTINGS_CATEGORY_GL_CODE.getRoute(policyID, policyCategory.name, backTo)
                    : ROUTES_1.default.WORKSPACE_CATEGORY_GL_CODE.getRoute(policyID, policyCategory.name)));
                return;
            }
            Navigation_1.default.navigate(isQuickSettingsFlow
                ? ROUTES_1.default.SETTINGS_CATEGORY_GL_CODE.getRoute(policyID, policyCategory.name, backTo)
                : ROUTES_1.default.WORKSPACE_CATEGORY_GL_CODE.getRoute(policyID, policyCategory.name));
        }} shouldShowRightIcon/>
                    </OfflineWithFeedback_1.default>
                    <OfflineWithFeedback_1.default pendingAction={(_m = policyCategory.pendingFields) === null || _m === void 0 ? void 0 : _m['Payroll Code']}>
                        <MenuItemWithTopDescription_1.default title={policyCategory['Payroll Code']} description={translate('workspace.categories.payrollCode')} onPress={function () {
            if (!(0, PolicyUtils_1.isControlPolicy)(policy)) {
                Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_UPGRADE.getRoute(policyID, CONST_1.default.UPGRADE_FEATURE_INTRO_MAPPING.glAndPayrollCodes.alias, ROUTES_1.default.WORKSPACE_CATEGORY_PAYROLL_CODE.getRoute(policyID, policyCategory.name)));
                return;
            }
            Navigation_1.default.navigate(isQuickSettingsFlow
                ? ROUTES_1.default.SETTINGS_CATEGORY_PAYROLL_CODE.getRoute(policyID, policyCategory.name, backTo)
                : ROUTES_1.default.WORKSPACE_CATEGORY_PAYROLL_CODE.getRoute(policyID, policyCategory.name));
        }} shouldShowRightIcon/>
                    </OfflineWithFeedback_1.default>

                    {!!(policy === null || policy === void 0 ? void 0 : policy.areRulesEnabled) && (<>
                            <react_native_1.View style={[styles.mh5, styles.pt3, styles.borderTop]}>
                                <Text_1.default style={[styles.textNormal, styles.textStrong, styles.mv3]}>{translate('workspace.rules.categoryRules.title')}</Text_1.default>
                            </react_native_1.View>
                            <OfflineWithFeedback_1.default pendingAction={(_o = policyCategory === null || policyCategory === void 0 ? void 0 : policyCategory.pendingFields) === null || _o === void 0 ? void 0 : _o.areCommentsRequired}>
                                <react_native_1.View style={[styles.mt2, styles.mh5]}>
                                    <react_native_1.View style={[styles.flexRow, styles.mb5, styles.mr2, styles.alignItemsCenter, styles.justifyContentBetween]}>
                                        <Text_1.default style={[styles.flexShrink1, styles.mr2]}>{translate('workspace.rules.categoryRules.requireDescription')}</Text_1.default>
                                        <Switch_1.default isOn={(_p = policyCategory === null || policyCategory === void 0 ? void 0 : policyCategory.areCommentsRequired) !== null && _p !== void 0 ? _p : false} accessibilityLabel={translate('workspace.rules.categoryRules.requireDescription')} onToggle={function () {
                if (policyCategory.commentHint && areCommentsRequired) {
                    (0, Category_1.setWorkspaceCategoryDescriptionHint)(policyID, categoryName, '');
                }
                (0, Category_1.setPolicyCategoryDescriptionRequired)(policyID, categoryName, !areCommentsRequired);
            }}/>
                                    </react_native_1.View>
                                </react_native_1.View>
                            </OfflineWithFeedback_1.default>
                            {!!(policyCategory === null || policyCategory === void 0 ? void 0 : policyCategory.areCommentsRequired) && (<OfflineWithFeedback_1.default pendingAction={(_q = policyCategory.pendingFields) === null || _q === void 0 ? void 0 : _q.commentHint}>
                                    <MenuItemWithTopDescription_1.default title={policyCategory === null || policyCategory === void 0 ? void 0 : policyCategory.commentHint} description={translate('workspace.rules.categoryRules.descriptionHint')} onPress={function () {
                    Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_CATEGORY_DESCRIPTION_HINT.getRoute(policyID, policyCategory.name));
                }} shouldShowRightIcon/>
                                </OfflineWithFeedback_1.default>)}
                            <MenuItemWithTopDescription_1.default title={approverText} description={translate('workspace.rules.categoryRules.approver')} onPress={function () {
                Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_CATEGORY_APPROVER.getRoute(policyID, policyCategory.name));
            }} shouldShowRightIcon/>
                            {approverDisabled && (<Text_1.default style={[styles.flexRow, styles.alignItemsCenter, styles.mv2, styles.mh5]}>
                                    <Text_1.default style={[styles.textLabel, styles.colorMuted]}>{translate('workspace.rules.categoryRules.goTo')}</Text_1.default>{' '}
                                    <TextLink_1.default style={[styles.link, styles.label]} onPress={function () { return Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_MORE_FEATURES.getRoute(policyID)); }}>
                                        {translate('workspace.common.moreFeatures')}
                                    </TextLink_1.default>{' '}
                                    <Text_1.default style={[styles.textLabel, styles.colorMuted]}>{translate('workspace.rules.categoryRules.andEnableWorkflows')}</Text_1.default>
                                </Text_1.default>)}
                            {!!((_r = policy === null || policy === void 0 ? void 0 : policy.tax) === null || _r === void 0 ? void 0 : _r.trackingEnabled) && (<MenuItemWithTopDescription_1.default title={defaultTaxRateText} description={translate('workspace.rules.categoryRules.defaultTaxRate')} onPress={function () {
                    Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_CATEGORY_DEFAULT_TAX_RATE.getRoute(policyID, policyCategory.name));
                }} shouldShowRightIcon/>)}

                            <OfflineWithFeedback_1.default pendingAction={(_s = policyCategory.pendingFields) === null || _s === void 0 ? void 0 : _s.maxExpenseAmount}>
                                <MenuItemWithTopDescription_1.default title={flagAmountsOverText} description={translate('workspace.rules.categoryRules.flagAmountsOver')} onPress={function () {
                Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_CATEGORY_FLAG_AMOUNTS_OVER.getRoute(policyID, policyCategory.name));
            }} shouldShowRightIcon/>
                            </OfflineWithFeedback_1.default>
                            <OfflineWithFeedback_1.default pendingAction={(_t = policyCategory.pendingFields) === null || _t === void 0 ? void 0 : _t.maxAmountNoReceipt}>
                                <MenuItemWithTopDescription_1.default title={requireReceiptsOverText} description={translate("workspace.rules.categoryRules.requireReceiptsOver")} onPress={function () {
                Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_CATEGORY_REQUIRE_RECEIPTS_OVER.getRoute(policyID, policyCategory.name));
            }} shouldShowRightIcon/>
                            </OfflineWithFeedback_1.default>
                        </>)}
                    {!isThereAnyAccountingConnection && (<MenuItem_1.default icon={Expensicons_1.Trashcan} title={translate('common.delete')} onPress={function () {
                if (shouldPreventDisableOrDelete) {
                    setIsCannotDeleteOrDisableLastCategoryModalVisible(true);
                    return;
                }
                setDeleteCategoryConfirmModalVisible(true);
            }}/>)}
                </ScrollView_1.default>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
CategorySettingsPage.displayName = 'CategorySettingsPage';
exports.default = CategorySettingsPage;
