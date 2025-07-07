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
var usePolicy_1 = require("@hooks/usePolicy");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var Tag_1 = require("@userActions/Policy/Tag");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var SCREENS_1 = require("@src/SCREENS");
var WorkspaceTagForm_1 = require("@src/types/form/WorkspaceTagForm");
function TagGLCodePage(_a) {
    var _b;
    var route = _a.route;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var inputCallbackRef = (0, useAutoFocusInput_1.default)().inputCallbackRef;
    var policyID = route.params.policyID;
    var policy = (0, usePolicy_1.default)(policyID);
    var backTo = route.params.backTo;
    var policyTags = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(policyID), { canBeMissing: true })[0];
    var tagName = route.params.tagName;
    var orderWeight = route.params.orderWeight;
    var tags = (0, PolicyUtils_1.getTagList)(policyTags, orderWeight).tags;
    var glCode = (_b = tags === null || tags === void 0 ? void 0 : tags[route.params.tagName]) === null || _b === void 0 ? void 0 : _b['GL Code'];
    var isQuickSettingsFlow = route.name === SCREENS_1.default.SETTINGS_TAGS.SETTINGS_TAG_GL_CODE;
    var goBack = (0, react_1.useCallback)(function () {
        Navigation_1.default.goBack(isQuickSettingsFlow ? ROUTES_1.default.SETTINGS_TAG_SETTINGS.getRoute(policyID, orderWeight, tagName, backTo) : ROUTES_1.default.WORKSPACE_TAG_SETTINGS.getRoute(policyID, orderWeight, tagName));
    }, [orderWeight, policyID, tagName, isQuickSettingsFlow, backTo]);
    var validate = (0, react_1.useCallback)(function (values) {
        var errors = {};
        var tagGLCode = values.glCode.trim();
        if (tagGLCode.length > CONST_1.default.MAX_LENGTH_256) {
            errors.glCode = translate('common.error.characterLimitExceedCounter', { length: tagGLCode.length, limit: CONST_1.default.MAX_LENGTH_256 });
        }
        return errors;
    }, [translate]);
    var editGLCode = (0, react_1.useCallback)(function (values) {
        var newGLCode = values.glCode.trim();
        if (newGLCode !== glCode) {
            (0, Tag_1.setPolicyTagGLCode)(policyID, tagName, orderWeight, newGLCode);
        }
        goBack();
    }, [glCode, policyID, tagName, orderWeight, goBack]);
    return (<AccessOrNotFoundWrapper_1.default accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.CONTROL]} policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CATEGORIES_ENABLED} shouldBeBlocked={(0, PolicyUtils_1.hasAccountingConnections)(policy)}>
            <ScreenWrapper_1.default enableEdgeToEdgeBottomSafeAreaPadding style={[styles.defaultModalContainer]} testID={TagGLCodePage.displayName} shouldEnableMaxHeight>
                <HeaderWithBackButton_1.default title={translate('workspace.tags.glCode')} onBackButtonPress={goBack}/>
                <FormProvider_1.default formID={ONYXKEYS_1.default.FORMS.WORKSPACE_TAG_FORM} validate={validate} onSubmit={editGLCode} submitButtonText={translate('common.save')} style={[styles.mh5, styles.flex1]} enabledWhenOffline shouldHideFixErrorsAlert addBottomSafeAreaPadding>
                    <InputWrapper_1.default ref={inputCallbackRef} InputComponent={TextInput_1.default} defaultValue={glCode} label={translate('workspace.tags.glCode')} accessibilityLabel={translate('workspace.tags.glCode')} inputID={WorkspaceTagForm_1.default.TAG_GL_CODE} role={CONST_1.default.ROLE.PRESENTATION}/>
                </FormProvider_1.default>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
TagGLCodePage.displayName = 'TagGLCodePage';
exports.default = TagGLCodePage;
