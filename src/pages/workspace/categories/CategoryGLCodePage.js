"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var TextInput_1 = require("@components/TextInput");
var useAutoFocusInput_1 = require("@hooks/useAutoFocusInput");
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
var WorkspaceCategoryForm_1 = require("@src/types/form/WorkspaceCategoryForm");
function CategoryGLCodePage(_a) {
    var _b;
    var route = _a.route;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var policyID = route.params.policyID;
    var backTo = route.params.backTo;
    var policyCategories = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_CATEGORIES).concat(policyID), { canBeMissing: true })[0];
    var categoryName = route.params.categoryName;
    var glCode = (_b = policyCategories === null || policyCategories === void 0 ? void 0 : policyCategories[categoryName]) === null || _b === void 0 ? void 0 : _b['GL Code'];
    var inputCallbackRef = (0, useAutoFocusInput_1.default)().inputCallbackRef;
    var isQuickSettingsFlow = route.name === SCREENS_1.default.SETTINGS_CATEGORIES.SETTINGS_CATEGORY_GL_CODE;
    var validate = (0, react_1.useCallback)(function (values) {
        var errors = {};
        var value = values[WorkspaceCategoryForm_1.default.GL_CODE];
        if (value.length > CONST_1.default.MAX_LENGTH_256) {
            errors[WorkspaceCategoryForm_1.default.GL_CODE] = translate('common.error.characterLimitExceedCounter', {
                length: value.length,
                limit: CONST_1.default.MAX_LENGTH_256,
            });
        }
        return errors;
    }, [translate]);
    var editGLCode = (0, react_1.useCallback)(function (values) {
        var newGLCode = values.glCode.trim();
        if (newGLCode !== glCode) {
            (0, Category_1.setPolicyCategoryGLCode)(policyID, categoryName, newGLCode);
        }
        Navigation_1.default.goBack(isQuickSettingsFlow ? ROUTES_1.default.SETTINGS_CATEGORY_SETTINGS.getRoute(policyID, categoryName, backTo) : ROUTES_1.default.WORKSPACE_CATEGORY_SETTINGS.getRoute(policyID, categoryName));
    }, [categoryName, glCode, policyID, isQuickSettingsFlow, backTo]);
    return (<AccessOrNotFoundWrapper_1.default accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.CONTROL]} policyID={route.params.policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CATEGORIES_ENABLED}>
            <ScreenWrapper_1.default enableEdgeToEdgeBottomSafeAreaPadding style={[styles.defaultModalContainer]} testID={CategoryGLCodePage.displayName} shouldEnableMaxHeight>
                <HeaderWithBackButton_1.default title={translate('workspace.categories.glCode')} onBackButtonPress={function () {
            return Navigation_1.default.goBack(isQuickSettingsFlow
                ? ROUTES_1.default.SETTINGS_CATEGORY_SETTINGS.getRoute(route.params.policyID, route.params.categoryName, backTo)
                : ROUTES_1.default.WORKSPACE_CATEGORY_SETTINGS.getRoute(route.params.policyID, route.params.categoryName));
        }}/>
                <FormProvider_1.default formID={ONYXKEYS_1.default.FORMS.WORKSPACE_CATEGORY_FORM} validate={validate} onSubmit={editGLCode} submitButtonText={translate('common.save')} style={[styles.mh5, styles.flex1]} enabledWhenOffline shouldHideFixErrorsAlert addBottomSafeAreaPadding>
                    <InputWrapper_1.default ref={inputCallbackRef} InputComponent={TextInput_1.default} defaultValue={glCode} label={translate('workspace.categories.glCode')} accessibilityLabel={translate('workspace.categories.glCode')} inputID={WorkspaceCategoryForm_1.default.GL_CODE} role={CONST_1.default.ROLE.PRESENTATION}/>
                </FormProvider_1.default>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
CategoryGLCodePage.displayName = 'CategoryGLCodePage';
exports.default = CategoryGLCodePage;
