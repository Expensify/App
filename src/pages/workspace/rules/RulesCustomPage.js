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
var usePolicy_1 = require("@hooks/usePolicy");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@libs/Navigation/Navigation");
var Parser_1 = require("@libs/Parser");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var Policy_1 = require("@userActions/Policy/Policy");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var RulesCustomForm_1 = require("@src/types/form/RulesCustomForm");
function RulesCustomPage(_a) {
    var policyID = _a.route.params.policyID;
    var policy = (0, usePolicy_1.default)(policyID);
    var inputCallbackRef = (0, useAutoFocusInput_1.default)().inputCallbackRef;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var _b = (0, react_1.useState)(function () { var _a; return Parser_1.default.htmlToMarkdown((_a = policy === null || policy === void 0 ? void 0 : policy.customRules) !== null && _a !== void 0 ? _a : ''); }), customRulesValue = _b[0], setCustomRulesValue = _b[1];
    var onChangeCustomRules = (0, react_1.useCallback)(function (newValue) {
        setCustomRulesValue(newValue);
    }, []);
    return (<AccessOrNotFoundWrapper_1.default policyID={policyID} accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.PAID]} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_RULES_ENABLED}>
            <ScreenWrapper_1.default enableEdgeToEdgeBottomSafeAreaPadding shouldEnableMaxHeight testID={RulesCustomPage.displayName}>
                <HeaderWithBackButton_1.default title={translate('workspace.rules.customRules.title')} onBackButtonPress={function () { return Navigation_1.default.goBack(); }}/>
                <FormProvider_1.default style={[styles.flexGrow1, styles.ph5]} formID={ONYXKEYS_1.default.FORMS.RULES_CUSTOM_FORM} onSubmit={function (_a) {
            var customRules = _a.customRules;
            (0, Policy_1.updateCustomRules)(policyID, customRules);
            Navigation_1.default.setNavigationActionToMicrotaskQueue(Navigation_1.default.goBack);
        }} submitButtonText={translate('workspace.editor.save')} enabledWhenOffline shouldHideFixErrorsAlert addBottomSafeAreaPadding>
                    <react_native_1.View style={styles.mb4}>
                        <InputWrapper_1.default InputComponent={TextInput_1.default} inputID={RulesCustomForm_1.default.CUSTOM_RULES} label={translate('workspace.rules.customRules.subtitle')} role={CONST_1.default.ROLE.PRESENTATION} value={customRulesValue} onChangeText={onChangeCustomRules} ref={inputCallbackRef} type="markdown" autoGrowHeight maxLength={CONST_1.default.DESCRIPTION_LIMIT}/>
                        <Text_1.default style={[styles.mutedTextLabel, styles.mt2]}>{translate('workspace.rules.customRules.description')}</Text_1.default>
                    </react_native_1.View>
                </FormProvider_1.default>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
RulesCustomPage.displayName = 'RulesCustomPage';
exports.default = RulesCustomPage;
