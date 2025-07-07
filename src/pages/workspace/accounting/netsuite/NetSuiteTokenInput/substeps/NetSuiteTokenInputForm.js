"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var RenderHTML_1 = require("@components/RenderHTML");
var Text_1 = require("@components/Text");
var TextInput_1 = require("@components/TextInput");
var useAutoFocusInput_1 = require("@hooks/useAutoFocusInput");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var NetSuiteCommands_1 = require("@libs/actions/connections/NetSuiteCommands");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var Parser_1 = require("@libs/Parser");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var NetSuiteTokenInputForm_1 = require("@src/types/form/NetSuiteTokenInputForm");
function NetSuiteTokenInputForm(_a) {
    var onNext = _a.onNext, policyID = _a.policyID;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var inputCallbackRef = (0, useAutoFocusInput_1.default)().inputCallbackRef;
    var formInputs = Object.values(NetSuiteTokenInputForm_1.default);
    var validate = (0, react_1.useCallback)(function (formValues) {
        var errors = {};
        formInputs.forEach(function (formInput) {
            if (formValues[formInput]) {
                return;
            }
            (0, ErrorUtils_1.addErrorMessage)(errors, formInput, translate('common.error.fieldRequired'));
        });
        return errors;
    }, [formInputs, translate]);
    var connectPolicy = (0, react_1.useCallback)(function (formValues) {
        if (!policyID) {
            return;
        }
        (0, NetSuiteCommands_1.connectPolicyToNetSuite)(policyID, formValues);
        onNext();
    }, [onNext, policyID]);
    return (<react_native_1.View style={[styles.flexGrow1, styles.ph5]}>
            <Text_1.default style={[styles.textHeadlineLineHeightXXL, styles.mb6]}>{translate("workspace.netsuite.tokenInput.formSteps.enterCredentials.title")}</Text_1.default>

            <FormProvider_1.default formID={ONYXKEYS_1.default.FORMS.NETSUITE_TOKEN_INPUT_FORM} style={styles.flexGrow1} validate={validate} onSubmit={connectPolicy} submitButtonText={translate('common.confirm')} shouldValidateOnBlur shouldValidateOnChange addBottomSafeAreaPadding={false}>
                {formInputs.map(function (formInput, index) { return (<react_native_1.View style={styles.mb4} key={formInput}>
                        <InputWrapper_1.default InputComponent={TextInput_1.default} inputID={formInput} ref={index === 0 ? inputCallbackRef : undefined} label={translate("workspace.netsuite.tokenInput.formSteps.enterCredentials.formInputs.".concat(formInput))} aria-label={translate("workspace.netsuite.tokenInput.formSteps.enterCredentials.formInputs.".concat(formInput))} role={CONST_1.default.ROLE.PRESENTATION} spellCheck={false}/>
                        {formInput === NetSuiteTokenInputForm_1.default.NETSUITE_ACCOUNT_ID && (<react_native_1.View style={[styles.flexRow, styles.pt2]}>
                                <RenderHTML_1.default html={"<comment><muted-text>".concat(Parser_1.default.replace(translate("workspace.netsuite.tokenInput.formSteps.enterCredentials.".concat(formInput, "Description"))), "</muted-text></comment>")}/>
                            </react_native_1.View>)}
                    </react_native_1.View>); })}
            </FormProvider_1.default>
        </react_native_1.View>);
}
NetSuiteTokenInputForm.displayName = 'NetSuiteTokenInputForm';
exports.default = NetSuiteTokenInputForm;
