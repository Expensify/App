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
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Policy_1 = require("@libs/actions/Policy/Policy");
var Navigation_1 = require("@libs/Navigation/Navigation");
var AccessOrNotFoundWrapper_1 = require("@pages/workspace/AccessOrNotFoundWrapper");
var withPolicyAndFullscreenLoading_1 = require("@pages/workspace/withPolicyAndFullscreenLoading");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
function WorkspaceMemberCustomFieldPage(_a) {
    var _b, _c, _d, _e;
    var policy = _a.policy, route = _a.route, personalDetails = _a.personalDetails;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var inputCallbackRef = (0, useAutoFocusInput_1.default)().inputCallbackRef;
    var params = route.params;
    var customFieldType = params.customFieldType;
    var accountID = Number(params.accountID);
    var memberLogin = (_c = (_b = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[accountID]) === null || _b === void 0 ? void 0 : _b.login) !== null && _c !== void 0 ? _c : '';
    var member = (_d = policy === null || policy === void 0 ? void 0 : policy.employeeList) === null || _d === void 0 ? void 0 : _d[memberLogin];
    var customFieldKey = CONST_1.default.CUSTOM_FIELD_KEYS[customFieldType];
    var _f = (0, react_1.useState)((_e = member === null || member === void 0 ? void 0 : member[customFieldKey !== null && customFieldKey !== void 0 ? customFieldKey : '']) !== null && _e !== void 0 ? _e : ''), customField = _f[0], setCustomField = _f[1];
    var customFieldText = translate("workspace.common.".concat(customFieldType));
    var policyID = params.policyID;
    var goBack = (0, react_1.useCallback)(function () {
        Navigation_1.default.goBack(ROUTES_1.default.WORKSPACE_MEMBER_DETAILS.getRoute(policyID, accountID));
    }, [accountID, policyID]);
    return (<AccessOrNotFoundWrapper_1.default policyID={policyID} accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.CONTROL]}>
            <ScreenWrapper_1.default testID="WorkspaceMemberCustomFieldPage" shouldEnableMaxHeight>
                <HeaderWithBackButton_1.default title={customFieldText} onBackButtonPress={goBack}/>
                <react_native_1.View style={[styles.ph5, styles.pb5]}>
                    <Text_1.default>{translate('workspace.common.customFieldHint')}</Text_1.default>
                </react_native_1.View>
                <FormProvider_1.default formID={ONYXKEYS_1.default.FORMS.WORKSPACE_MEMBER_CUSTOM_FIELD_FORM} style={[styles.flexGrow1, styles.ph5]} enabledWhenOffline submitButtonText={translate('common.save')} onSubmit={function () {
            (0, Policy_1.updateMemberCustomField)(params.policyID, memberLogin, customFieldType, customField.trim());
            goBack();
        }}>
                    <InputWrapper_1.default ref={inputCallbackRef} InputComponent={TextInput_1.default} label={customFieldText} accessibilityLabel={customFieldText} role={CONST_1.default.ROLE.PRESENTATION} inputID="customField" value={customField} onChangeText={setCustomField}/>
                </FormProvider_1.default>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
WorkspaceMemberCustomFieldPage.displayName = 'WorkspaceMemberCustomFieldPage';
exports.default = (0, withPolicyAndFullscreenLoading_1.default)(WorkspaceMemberCustomFieldPage);
