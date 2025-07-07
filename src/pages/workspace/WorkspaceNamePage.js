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
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Policy_1 = require("@libs/actions/Policy/Policy");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ValidationUtils_1 = require("@libs/ValidationUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var WorkspaceSettingsForm_1 = require("@src/types/form/WorkspaceSettingsForm");
var AccessOrNotFoundWrapper_1 = require("./AccessOrNotFoundWrapper");
var withPolicy_1 = require("./withPolicy");
function WorkspaceNamePage(_a) {
    var policy = _a.policy;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var submit = (0, react_1.useCallback)(function (values) {
        if (!policy || policy.isPolicyUpdating) {
            return;
        }
        (0, Policy_1.updateGeneralSettings)(policy.id, values.name.trim(), policy.outputCurrency);
        react_native_1.Keyboard.dismiss();
        Navigation_1.default.setNavigationActionToMicrotaskQueue(function () { return Navigation_1.default.goBack(); });
    }, [policy]);
    var validate = (0, react_1.useCallback)(function (values) {
        var errors = {};
        var name = values.name.trim();
        if (!(0, ValidationUtils_1.isRequiredFulfilled)(name)) {
            errors.name = translate('workspace.editor.nameIsRequiredError');
        }
        else if (__spreadArray([], name, true).length > CONST_1.default.TITLE_CHARACTER_LIMIT) {
            // Uses the spread syntax to count the number of Unicode code points instead of the number of UTF-16
            // code units.
            (0, ErrorUtils_1.addErrorMessage)(errors, 'name', translate('common.error.characterLimitExceedCounter', { length: __spreadArray([], name, true).length, limit: CONST_1.default.TITLE_CHARACTER_LIMIT }));
        }
        return errors;
    }, [translate]);
    return (<AccessOrNotFoundWrapper_1.default policyID={policy === null || policy === void 0 ? void 0 : policy.id} accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN]}>
            <ScreenWrapper_1.default enableEdgeToEdgeBottomSafeAreaPadding shouldEnableMaxHeight testID={WorkspaceNamePage.displayName}>
                <HeaderWithBackButton_1.default title={translate('workspace.common.workspaceName')} onBackButtonPress={function () { return Navigation_1.default.goBack(); }}/>

                <FormProvider_1.default formID={ONYXKEYS_1.default.FORMS.WORKSPACE_SETTINGS_FORM} submitButtonText={translate('workspace.editor.save')} style={[styles.flexGrow1, styles.ph5]} scrollContextEnabled validate={validate} onSubmit={submit} enabledWhenOffline shouldHideFixErrorsAlert addBottomSafeAreaPadding>
                    <react_native_1.View style={styles.mb4}>
                        <InputWrapper_1.default InputComponent={TextInput_1.default} role={CONST_1.default.ROLE.PRESENTATION} inputID={WorkspaceSettingsForm_1.default.NAME} label={translate('workspace.common.workspaceName')} accessibilityLabel={translate('workspace.common.workspaceName')} defaultValue={policy === null || policy === void 0 ? void 0 : policy.name} spellCheck={false} autoFocus/>
                    </react_native_1.View>
                </FormProvider_1.default>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
WorkspaceNamePage.displayName = 'WorkspaceNamePage';
exports.default = (0, withPolicy_1.default)(WorkspaceNamePage);
