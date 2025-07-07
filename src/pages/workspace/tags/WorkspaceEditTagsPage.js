"use strict";
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
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var Tag_1 = require("@userActions/Policy/Tag");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var SCREENS_1 = require("@src/SCREENS");
var PolicyTagNameForm_1 = require("@src/types/form/PolicyTagNameForm");
function WorkspaceEditTagsPage(_a) {
    var _b, _c;
    var route = _a.route;
    var policyTags = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.POLICY_TAGS).concat((_b = route === null || route === void 0 ? void 0 : route.params) === null || _b === void 0 ? void 0 : _b.policyID), { canBeMissing: true })[0];
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var tagListName = (0, react_1.useMemo)(function () { return (0, PolicyUtils_1.getTagListName)(policyTags, route.params.orderWeight); }, [policyTags, route.params.orderWeight]);
    var inputCallbackRef = (0, useAutoFocusInput_1.default)().inputCallbackRef;
    var backTo = route.params.backTo;
    var isQuickSettingsFlow = route.name === SCREENS_1.default.SETTINGS_TAGS.SETTINGS_TAGS_EDIT;
    var validateTagName = (0, react_1.useCallback)(function (values) {
        var _a;
        var errors = {};
        if (!values[PolicyTagNameForm_1.default.POLICY_TAGS_NAME] && values[PolicyTagNameForm_1.default.POLICY_TAGS_NAME].trim() === '') {
            errors[PolicyTagNameForm_1.default.POLICY_TAGS_NAME] = translate('common.error.fieldRequired');
        }
        if (((_a = values[PolicyTagNameForm_1.default.POLICY_TAGS_NAME]) === null || _a === void 0 ? void 0 : _a.trim()) === '0') {
            errors[PolicyTagNameForm_1.default.POLICY_TAGS_NAME] = translate('workspace.tags.invalidTagNameError');
        }
        if (policyTags && Object.values(policyTags).find(function (tag) { return tag.orderWeight !== route.params.orderWeight && tag.name === values[PolicyTagNameForm_1.default.POLICY_TAGS_NAME]; })) {
            errors[PolicyTagNameForm_1.default.POLICY_TAGS_NAME] = translate('workspace.tags.existingTagError');
        }
        return errors;
    }, [translate, policyTags, route.params.orderWeight]);
    var goBackToTagsSettings = (0, react_1.useCallback)(function () {
        var _a, _b;
        if (isQuickSettingsFlow) {
            Navigation_1.default.goBack(backTo);
            return;
        }
        Navigation_1.default.goBack(route.params.orderWeight
            ? ROUTES_1.default.WORKSPACE_TAG_LIST_VIEW.getRoute((_a = route === null || route === void 0 ? void 0 : route.params) === null || _a === void 0 ? void 0 : _a.policyID, route.params.orderWeight)
            : ROUTES_1.default.WORKSPACE_TAGS_SETTINGS.getRoute((_b = route === null || route === void 0 ? void 0 : route.params) === null || _b === void 0 ? void 0 : _b.policyID));
    }, [isQuickSettingsFlow, route.params.orderWeight, (_c = route.params) === null || _c === void 0 ? void 0 : _c.policyID, backTo]);
    var updateTagListName = (0, react_1.useCallback)(function (values) {
        if (values[PolicyTagNameForm_1.default.POLICY_TAGS_NAME] !== tagListName) {
            (0, Tag_1.renamePolicyTagList)(route.params.policyID, { oldName: tagListName, newName: values[PolicyTagNameForm_1.default.POLICY_TAGS_NAME] }, policyTags, route.params.orderWeight);
        }
        goBackToTagsSettings();
    }, [tagListName, goBackToTagsSettings, route.params.policyID, route.params.orderWeight, policyTags]);
    return (<AccessOrNotFoundWrapper_1.default accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.PAID]} policyID={route.params.policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_TAGS_ENABLED}>
            <ScreenWrapper_1.default enableEdgeToEdgeBottomSafeAreaPadding shouldEnableMaxHeight testID={WorkspaceEditTagsPage.displayName}>
                <HeaderWithBackButton_1.default title={translate("workspace.tags.customTagName")} onBackButtonPress={goBackToTagsSettings}/>
                <FormProvider_1.default style={[styles.flexGrow1, styles.ph5]} formID={ONYXKEYS_1.default.FORMS.POLICY_TAG_NAME_FORM} onSubmit={updateTagListName} validate={validateTagName} submitButtonText={translate('common.save')} enabledWhenOffline shouldHideFixErrorsAlert addBottomSafeAreaPadding>
                    <react_native_1.View style={styles.mb4}>
                        <InputWrapper_1.default InputComponent={TextInput_1.default} inputID={PolicyTagNameForm_1.default.POLICY_TAGS_NAME} label={translate("workspace.tags.customTagName")} accessibilityLabel={translate("workspace.tags.customTagName")} defaultValue={(0, PolicyUtils_1.getCleanedTagName)(tagListName)} role={CONST_1.default.ROLE.PRESENTATION} ref={inputCallbackRef}/>
                    </react_native_1.View>
                </FormProvider_1.default>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
WorkspaceEditTagsPage.displayName = 'WorkspaceEditTagsPage';
exports.default = WorkspaceEditTagsPage;
