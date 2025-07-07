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
var react_native_1 = require("react-native");
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
var PolicyUtils_1 = require("@libs/PolicyUtils");
var ValidationUtils_1 = require("@libs/ValidationUtils");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var Tag_1 = require("@userActions/Policy/Tag");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var SCREENS_1 = require("@src/SCREENS");
var WorkspaceTagForm_1 = require("@src/types/form/WorkspaceTagForm");
function EditTagPage(_a) {
    var route = _a.route;
    var policyID = route.params.policyID;
    var policyTags = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat(policyID), { canBeMissing: true })[0];
    var backTo = route.params.backTo;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var inputCallbackRef = (0, useAutoFocusInput_1.default)().inputCallbackRef;
    var currentTagName = (0, PolicyUtils_1.getCleanedTagName)(route.params.tagName);
    var isQuickSettingsFlow = route.name === SCREENS_1.default.SETTINGS_TAGS.SETTINGS_TAG_EDIT;
    var validate = (0, react_1.useCallback)(function (values) {
        var errors = {};
        var tagName = values.tagName.trim();
        var escapedTagName = (0, PolicyUtils_1.escapeTagName)(values.tagName.trim());
        var tags = (0, PolicyUtils_1.getTagList)(policyTags, route.params.orderWeight).tags;
        if (!(0, ValidationUtils_1.isRequiredFulfilled)(tagName)) {
            errors.tagName = translate('workspace.tags.tagRequiredError');
        }
        else if (escapedTagName === '0') {
            errors.tagName = translate('workspace.tags.invalidTagNameError');
        }
        else if ((tags === null || tags === void 0 ? void 0 : tags[escapedTagName]) && currentTagName !== tagName) {
            errors.tagName = translate('workspace.tags.existingTagError');
        }
        else if (__spreadArray([], tagName, true).length > CONST_1.default.API_TRANSACTION_TAG_MAX_LENGTH) {
            // Uses the spread syntax to count the number of Unicode code points instead of the number of UTF-16 code units.
            errors.tagName = translate('common.error.characterLimitExceedCounter', { length: __spreadArray([], tagName, true).length, limit: CONST_1.default.API_TRANSACTION_TAG_MAX_LENGTH });
        }
        return errors;
    }, [policyTags, route.params.orderWeight, currentTagName, translate]);
    var editTag = (0, react_1.useCallback)(function (values) {
        var tagName = values.tagName.trim();
        // Do not call the API if the edited tag name is the same as the current tag name
        if (currentTagName !== tagName) {
            (0, Tag_1.renamePolicyTag)(policyID, { oldName: route.params.tagName, newName: values.tagName.trim() }, route.params.orderWeight);
        }
        react_native_1.Keyboard.dismiss();
        Navigation_1.default.goBack(isQuickSettingsFlow
            ? ROUTES_1.default.SETTINGS_TAG_SETTINGS.getRoute(policyID, route.params.orderWeight, route.params.tagName, backTo)
            : ROUTES_1.default.WORKSPACE_TAG_SETTINGS.getRoute(policyID, route.params.orderWeight, route.params.tagName));
    }, [currentTagName, policyID, route.params.tagName, route.params.orderWeight, isQuickSettingsFlow, backTo]);
    return (<AccessOrNotFoundWrapper_1.default accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.PAID]} policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_TAGS_ENABLED}>
            <ScreenWrapper_1.default enableEdgeToEdgeBottomSafeAreaPadding style={[styles.defaultModalContainer]} testID={EditTagPage.displayName} shouldEnableMaxHeight>
                <HeaderWithBackButton_1.default title={translate('workspace.tags.editTag')} onBackButtonPress={function () {
            var _a, _b;
            return Navigation_1.default.goBack(isQuickSettingsFlow
                ? ROUTES_1.default.SETTINGS_TAG_SETTINGS.getRoute((_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.policyID, route.params.orderWeight, route.params.tagName, backTo)
                : ROUTES_1.default.WORKSPACE_TAG_SETTINGS.getRoute((_b = route === null || route === void 0 ? void 0 : route.params) === null || _b === void 0 ? void 0 : _b.policyID, route.params.orderWeight, route.params.tagName));
        }}/>
                <FormProvider_1.default formID={ONYXKEYS_1.default.FORMS.WORKSPACE_TAG_FORM} onSubmit={editTag} submitButtonText={translate('common.save')} validate={validate} style={[styles.mh5, styles.flex1]} enabledWhenOffline shouldHideFixErrorsAlert addBottomSafeAreaPadding>
                    <InputWrapper_1.default InputComponent={TextInput_1.default} defaultValue={currentTagName} label={translate('common.name')} accessibilityLabel={translate('common.name')} inputID={WorkspaceTagForm_1.default.TAG_NAME} role={CONST_1.default.ROLE.PRESENTATION} ref={inputCallbackRef}/>
                </FormProvider_1.default>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
EditTagPage.displayName = 'EditTagPage';
exports.default = EditTagPage;
