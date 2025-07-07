"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var expensify_common_1 = require("expensify-common");
var react_1 = require("react");
var react_native_1 = require("react-native");
var BulletList_1 = require("@components/BulletList");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var Text_1 = require("@components/Text");
var TextInput_1 = require("@components/TextInput");
var TextLink_1 = require("@components/TextLink");
var useAutoFocusInput_1 = require("@hooks/useAutoFocusInput");
var useLocalize_1 = require("@hooks/useLocalize");
var usePolicy_1 = require("@hooks/usePolicy");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Navigation_1 = require("@libs/Navigation/Navigation");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var Policy_1 = require("@userActions/Policy/Policy");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var RulesCustomNameModalForm_1 = require("@src/types/form/RulesCustomNameModalForm");
function RulesCustomNamePage(_a) {
    var _b, _c;
    var route = _a.route;
    var policyID = route.params.policyID;
    var policy = (0, usePolicy_1.default)(policyID);
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var inputCallbackRef = (0, useAutoFocusInput_1.default)().inputCallbackRef;
    var RULE_EXAMPLE_BULLET_POINTS = [
        translate('workspace.rules.expenseReportRules.customNameEmailPhoneExample'),
        translate('workspace.rules.expenseReportRules.customNameStartDateExample'),
        translate('workspace.rules.expenseReportRules.customNameWorkspaceNameExample'),
        translate('workspace.rules.expenseReportRules.customNameReportIDExample'),
        translate('workspace.rules.expenseReportRules.customNameTotalExample'),
    ];
    var customNameDefaultValue = expensify_common_1.Str.htmlDecode((_c = (_b = policy === null || policy === void 0 ? void 0 : policy.fieldList) === null || _b === void 0 ? void 0 : _b[CONST_1.default.POLICY.FIELDS.FIELD_LIST_TITLE].defaultValue) !== null && _c !== void 0 ? _c : '');
    var validateCustomName = function (_a) {
        var customName = _a.customName;
        var errors = {};
        if (!customName) {
            errors[RulesCustomNameModalForm_1.default.CUSTOM_NAME] = translate('common.error.fieldRequired');
        }
        else if (customName.length > CONST_1.default.WORKSPACE_NAME_CHARACTER_LIMIT) {
            errors[RulesCustomNameModalForm_1.default.CUSTOM_NAME] = translate('common.error.characterLimitExceedCounter', {
                length: customName.length,
                limit: CONST_1.default.WORKSPACE_NAME_CHARACTER_LIMIT,
            });
        }
        return errors;
    };
    return (<AccessOrNotFoundWrapper_1.default policyID={policyID} accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.PAID]}>
            <ScreenWrapper_1.default enableEdgeToEdgeBottomSafeAreaPadding shouldEnableMaxHeight testID={RulesCustomNamePage.displayName}>
                <HeaderWithBackButton_1.default title={translate('workspace.rules.expenseReportRules.customNameTitle')} onBackButtonPress={function () { return Navigation_1.default.goBack(); }}/>
                <react_native_1.View style={[styles.ph5, styles.pb4]}>
                    <Text_1.default>
                        {translate('workspace.rules.expenseReportRules.customNameDescription')}
                        <TextLink_1.default style={[styles.link]} href={CONST_1.default.CUSTOM_REPORT_NAME_HELP_URL}>
                            {translate('workspace.rules.expenseReportRules.customNameDescriptionLink')}
                        </TextLink_1.default>
                        .
                    </Text_1.default>
                </react_native_1.View>
                <FormProvider_1.default style={[styles.flexGrow1, styles.mh5]} formID={ONYXKEYS_1.default.FORMS.RULES_CUSTOM_NAME_MODAL_FORM} validate={validateCustomName} onSubmit={function (_a) {
            var customName = _a.customName;
            (0, Policy_1.setPolicyDefaultReportTitle)(policyID, customName);
            Navigation_1.default.setNavigationActionToMicrotaskQueue(Navigation_1.default.goBack);
        }} submitButtonText={translate('common.save')} enabledWhenOffline shouldHideFixErrorsAlert addBottomSafeAreaPadding>
                    <InputWrapper_1.default InputComponent={TextInput_1.default} inputID={RulesCustomNameModalForm_1.default.CUSTOM_NAME} defaultValue={customNameDefaultValue} label={translate('workspace.rules.expenseReportRules.customNameInputLabel')} aria-label={translate('workspace.rules.expenseReportRules.customNameInputLabel')} ref={inputCallbackRef}/>
                    <BulletList_1.default items={RULE_EXAMPLE_BULLET_POINTS} header={translate('workspace.rules.expenseReportRules.examples')}/>
                </FormProvider_1.default>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
RulesCustomNamePage.displayName = 'RulesCustomNamePage';
exports.default = RulesCustomNamePage;
