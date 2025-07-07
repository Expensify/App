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
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var Policy_1 = require("@userActions/Policy/Policy");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var RulesMaxExpenseAgeForm_1 = require("@src/types/form/RulesMaxExpenseAgeForm");
function RulesMaxExpenseAgePage(_a) {
    var policyID = _a.route.params.policyID;
    var policy = (0, usePolicy_1.default)(policyID);
    var inputCallbackRef = (0, useAutoFocusInput_1.default)().inputCallbackRef;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var maxExpenseAgeDefaultValue = (policy === null || policy === void 0 ? void 0 : policy.maxExpenseAge) === CONST_1.default.DISABLED_MAX_EXPENSE_VALUE || !(policy === null || policy === void 0 ? void 0 : policy.maxExpenseAge) ? '' : "".concat(policy === null || policy === void 0 ? void 0 : policy.maxExpenseAge);
    var _b = (0, react_1.useState)(maxExpenseAgeDefaultValue), maxExpenseAgeValue = _b[0], setMaxExpenseAgeValue = _b[1];
    var onChangeMaxExpenseAge = (0, react_1.useCallback)(function (newValue) {
        var _a, _b;
        // replace all characters that are not spaces or digits
        var validMaxExpenseAge = newValue.replace(/[^0-9]/g, '');
        validMaxExpenseAge = (_b = (_a = validMaxExpenseAge.match(/(?:\d *){1,5}/)) === null || _a === void 0 ? void 0 : _a[0]) !== null && _b !== void 0 ? _b : '';
        setMaxExpenseAgeValue(validMaxExpenseAge);
    }, []);
    return (<AccessOrNotFoundWrapper_1.default policyID={policyID} accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.PAID]} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_RULES_ENABLED}>
            <ScreenWrapper_1.default enableEdgeToEdgeBottomSafeAreaPadding shouldEnableMaxHeight testID={RulesMaxExpenseAgePage.displayName}>
                <HeaderWithBackButton_1.default title={translate('workspace.rules.individualExpenseRules.maxExpenseAge')} onBackButtonPress={function () { return Navigation_1.default.goBack(); }}/>
                <FormProvider_1.default style={[styles.flexGrow1, styles.ph5]} formID={ONYXKEYS_1.default.FORMS.RULES_MAX_EXPENSE_AGE_FORM} onSubmit={function (_a) {
            var maxExpenseAge = _a.maxExpenseAge;
            (0, Policy_1.setPolicyMaxExpenseAge)(policyID, maxExpenseAge);
            Navigation_1.default.setNavigationActionToMicrotaskQueue(Navigation_1.default.goBack);
        }} submitButtonText={translate('workspace.editor.save')} enabledWhenOffline shouldHideFixErrorsAlert addBottomSafeAreaPadding>
                    <react_native_1.View style={styles.mb4}>
                        <InputWrapper_1.default InputComponent={TextInput_1.default} inputID={RulesMaxExpenseAgeForm_1.default.MAX_EXPENSE_AGE} label={translate('workspace.rules.individualExpenseRules.maxAge')} suffixCharacter={translate('common.days')} suffixStyle={styles.colorMuted} role={CONST_1.default.ROLE.PRESENTATION} inputMode={CONST_1.default.INPUT_MODE.NUMERIC} value={maxExpenseAgeValue} onChangeText={onChangeMaxExpenseAge} ref={inputCallbackRef}/>
                        <Text_1.default style={[styles.mutedTextLabel, styles.mt2]}>{translate('workspace.rules.individualExpenseRules.maxExpenseAgeDescription')}</Text_1.default>
                    </react_native_1.View>
                </FormProvider_1.default>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
RulesMaxExpenseAgePage.displayName = 'RulesMaxExpenseAgePage';
exports.default = RulesMaxExpenseAgePage;
