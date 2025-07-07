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
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Policy_1 = require("@libs/actions/Policy/Policy");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var Parser_1 = require("@libs/Parser");
var updateMultilineInputRange_1 = require("@libs/updateMultilineInputRange");
var variables_1 = require("@styles/variables");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var AccessOrNotFoundWrapper_1 = require("./AccessOrNotFoundWrapper");
var withPolicy_1 = require("./withPolicy");
function WorkspaceOverviewDescriptionPage(_a) {
    var policy = _a.policy;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var isInputInitializedRef = (0, react_1.useRef)(false);
    var _b = (0, react_1.useState)(function () { var _a; return Parser_1.default.htmlToMarkdown((_a = policy === null || policy === void 0 ? void 0 : policy.description) !== null && _a !== void 0 ? _a : translate('workspace.common.defaultDescription')); }), description = _b[0], setDescription = _b[1];
    /**
     * @param {Object} values - form input values passed by the Form component
     * @returns {Boolean}
     */
    var validate = (0, react_1.useCallback)(function (values) {
        var errors = {};
        if (values.description.length > CONST_1.default.DESCRIPTION_LIMIT) {
            (0, ErrorUtils_1.addErrorMessage)(errors, 'description', translate('common.error.characterLimitExceedCounter', { length: values.description.length, limit: CONST_1.default.DESCRIPTION_LIMIT }));
        }
        return errors;
    }, [translate]);
    var submit = (0, react_1.useCallback)(function (values) {
        if (!policy || policy.isPolicyUpdating) {
            return;
        }
        (0, Policy_1.updateWorkspaceDescription)(policy.id, values.description.trim(), policy.description);
        react_native_1.Keyboard.dismiss();
        Navigation_1.default.setNavigationActionToMicrotaskQueue(function () { return Navigation_1.default.goBack(); });
    }, [policy]);
    return (<AccessOrNotFoundWrapper_1.default policyID={policy === null || policy === void 0 ? void 0 : policy.id} accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN]}>
            <ScreenWrapper_1.default shouldEnableMaxHeight enableEdgeToEdgeBottomSafeAreaPadding testID={WorkspaceOverviewDescriptionPage.displayName}>
                <HeaderWithBackButton_1.default title={translate('workspace.editor.descriptionInputLabel')} onBackButtonPress={function () { return Navigation_1.default.goBack(); }}/>
                <react_native_1.View style={[styles.ph5, styles.pb5]}>
                    <Text_1.default>{translate('workspace.common.descriptionHint')}</Text_1.default>
                </react_native_1.View>
                <FormProvider_1.default formID={ONYXKEYS_1.default.FORMS.WORKSPACE_DESCRIPTION_FORM} submitButtonText={translate('workspace.editor.save')} style={[styles.flexGrow1, styles.ph5]} scrollContextEnabled onSubmit={submit} validate={validate} enabledWhenOffline shouldHideFixErrorsAlert addBottomSafeAreaPadding>
                    <react_native_1.View style={styles.mb4}>
                        <InputWrapper_1.default InputComponent={TextInput_1.default} role={CONST_1.default.ROLE.PRESENTATION} inputID="description" label={translate('workspace.editor.descriptionInputLabel')} accessibilityLabel={translate('workspace.editor.descriptionInputLabel')} maxAutoGrowHeight={variables_1.default.textInputAutoGrowMaxHeight} value={description} spellCheck={false} autoFocus onChangeText={setDescription} autoGrowHeight type="markdown" ref={function (el) {
            if (!isInputInitializedRef.current) {
                (0, updateMultilineInputRange_1.default)(el);
            }
            isInputInitializedRef.current = true;
        }}/>
                    </react_native_1.View>
                </FormProvider_1.default>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
WorkspaceOverviewDescriptionPage.displayName = 'WorkspaceOverviewDescriptionPage';
exports.default = (0, withPolicy_1.default)(WorkspaceOverviewDescriptionPage);
