"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var Text_1 = require("@components/Text");
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
var WorkspaceCategoryDescriptionHintForm_1 = require("@src/types/form/WorkspaceCategoryDescriptionHintForm");
function CategoryDescriptionHintPage(_a) {
    var _b;
    var _c = _a.route.params, policyID = _c.policyID, categoryName = _c.categoryName;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var policyCategories = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_CATEGORIES).concat(policyID))[0];
    var inputCallbackRef = (0, useAutoFocusInput_1.default)().inputCallbackRef;
    var commentHintDefaultValue = (_b = policyCategories === null || policyCategories === void 0 ? void 0 : policyCategories[categoryName]) === null || _b === void 0 ? void 0 : _b.commentHint;
    return (<AccessOrNotFoundWrapper_1.default accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.CONTROL]} policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CATEGORIES_ENABLED}>
            <ScreenWrapper_1.default enableEdgeToEdgeBottomSafeAreaPadding style={[styles.defaultModalContainer]} testID={CategoryDescriptionHintPage.displayName} shouldEnableMaxHeight>
                <HeaderWithBackButton_1.default title={translate('workspace.rules.categoryRules.descriptionHint')} onBackButtonPress={function () { return Navigation_1.default.goBack(ROUTES_1.default.WORKSPACE_CATEGORY_SETTINGS.getRoute(policyID, categoryName)); }}/>
                <FormProvider_1.default style={[styles.flexGrow1, styles.mh5]} formID={ONYXKEYS_1.default.FORMS.WORKSPACE_CATEGORY_DESCRIPTION_HINT_FORM} onSubmit={function (_a) {
            var commentHint = _a.commentHint;
            (0, Category_1.setWorkspaceCategoryDescriptionHint)(policyID, categoryName, commentHint);
            Navigation_1.default.setNavigationActionToMicrotaskQueue(function () { return Navigation_1.default.goBack(ROUTES_1.default.WORKSPACE_CATEGORY_SETTINGS.getRoute(policyID, categoryName)); });
        }} submitButtonText={translate('common.save')} enabledWhenOffline shouldHideFixErrorsAlert addBottomSafeAreaPadding>
                    <react_native_1.View style={styles.mb4}>
                        <Text_1.default style={styles.pb5}>{translate('workspace.rules.categoryRules.descriptionHintDescription', { categoryName: categoryName })}</Text_1.default>
                        <InputWrapper_1.default InputComponent={TextInput_1.default} inputID={WorkspaceCategoryDescriptionHintForm_1.default.COMMENT_HINT} defaultValue={commentHintDefaultValue} label={translate('workspace.rules.categoryRules.descriptionHintLabel')} aria-label={translate('workspace.rules.categoryRules.descriptionHintLabel')} ref={inputCallbackRef}/>
                        <Text_1.default style={[styles.mutedTextLabel, styles.mt2]}>{translate('workspace.rules.categoryRules.descriptionHintSubtitle')}</Text_1.default>
                    </react_native_1.View>
                </FormProvider_1.default>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
CategoryDescriptionHintPage.displayName = 'CategoryDescriptionHintPage';
exports.default = CategoryDescriptionHintPage;
