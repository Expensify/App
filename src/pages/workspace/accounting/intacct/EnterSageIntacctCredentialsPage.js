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
var SageIntacct_1 = require("@libs/actions/connections/SageIntacct");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var SageIntactCredentialsForm_1 = require("@src/types/form/SageIntactCredentialsForm");
function EnterSageIntacctCredentialsPage(_a) {
    var route = _a.route;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var inputCallbackRef = (0, useAutoFocusInput_1.default)().inputCallbackRef;
    var policyID = route.params.policyID;
    var confirmCredentials = (0, react_1.useCallback)(function (values) {
        (0, SageIntacct_1.connectToSageIntacct)(policyID, values);
        Navigation_1.default.dismissModal();
    }, [policyID]);
    var formItems = Object.values(SageIntactCredentialsForm_1.default);
    var validate = (0, react_1.useCallback)(function (values) {
        var errors = {};
        formItems.forEach(function (formItem) {
            if (values[formItem]) {
                return;
            }
            (0, ErrorUtils_1.addErrorMessage)(errors, formItem, translate('common.error.fieldRequired'));
        });
        return errors;
    }, [formItems, translate]);
    return (<ScreenWrapper_1.default shouldEnableMaxHeight testID={EnterSageIntacctCredentialsPage.displayName} enableEdgeToEdgeBottomSafeAreaPadding>
            <HeaderWithBackButton_1.default title={translate('workspace.intacct.sageIntacctSetup')} onBackButtonPress={function () { return Navigation_1.default.goBack(); }}/>
            <FormProvider_1.default style={[styles.flexGrow1, styles.ph5]} formID={ONYXKEYS_1.default.FORMS.SAGE_INTACCT_CREDENTIALS_FORM} validate={validate} onSubmit={confirmCredentials} submitButtonText={translate('common.confirm')} enabledWhenOffline shouldValidateOnBlur shouldValidateOnChange addBottomSafeAreaPadding>
                <Text_1.default style={[styles.textHeadlineH1, styles.pb5, styles.pt3]}>{translate('workspace.intacct.enterCredentials')}</Text_1.default>
                {formItems.map(function (formItem, index) { return (<react_native_1.View style={styles.mb4} key={formItem}>
                        <InputWrapper_1.default InputComponent={TextInput_1.default} inputID={formItem} ref={index === 0 ? inputCallbackRef : undefined} label={translate("common.".concat(formItem))} aria-label={translate("common.".concat(formItem))} role={CONST_1.default.ROLE.PRESENTATION} spellCheck={false} secureTextEntry={formItem === SageIntactCredentialsForm_1.default.PASSWORD} autoCorrect={false}/>
                    </react_native_1.View>); })}
            </FormProvider_1.default>
        </ScreenWrapper_1.default>);
}
EnterSageIntacctCredentialsPage.displayName = 'EnterSageIntacctCredentialsPage';
exports.default = EnterSageIntacctCredentialsPage;
