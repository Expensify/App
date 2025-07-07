"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var ValuePicker_1 = require("@components/ValuePicker");
var useInternationalBankAccountFormSubmit_1 = require("@hooks/useInternationalBankAccountFormSubmit");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var FormActions_1 = require("@libs/actions/FormActions");
var Text_1 = require("@src/components/Text");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
function AccountType(_a) {
    var _b, _c;
    var isEditing = _a.isEditing, onNext = _a.onNext, fieldsMap = _a.fieldsMap;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var formRef = (0, react_1.useRef)(null);
    var fieldData = (_c = (_b = fieldsMap[CONST_1.default.CORPAY_FIELDS.STEPS_NAME.ACCOUNT_TYPE]) === null || _b === void 0 ? void 0 : _b[CONST_1.default.CORPAY_FIELDS.ACCOUNT_TYPE_KEY]) !== null && _c !== void 0 ? _c : {};
    var handleSubmit = (0, useInternationalBankAccountFormSubmit_1.default)({
        fieldIds: Object.keys(fieldsMap[CONST_1.default.CORPAY_FIELDS.STEPS_NAME.ACCOUNT_TYPE]),
        onNext: onNext,
        shouldSaveDraft: isEditing,
    });
    var validate = (0, react_1.useCallback)(function (values) {
        var _a;
        if (!fieldData.isRequired || values[CONST_1.default.CORPAY_FIELDS.ACCOUNT_TYPE_KEY]) {
            return {};
        }
        return _a = {}, _a[CONST_1.default.CORPAY_FIELDS.ACCOUNT_TYPE_KEY] = translate('common.error.pleaseSelectOne'), _a;
    }, [fieldData.isRequired, translate]);
    var options = (0, react_1.useMemo)(function () {
        var _a;
        return ((_a = fieldData.valueSet) !== null && _a !== void 0 ? _a : []).map(function (item) {
            return {
                value: item.id,
                label: item.text,
            };
        });
    }, [fieldData.valueSet]);
    return (<FormProvider_1.default formID={ONYXKEYS_1.default.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM} submitButtonText={translate('common.confirm')} onSubmit={handleSubmit} validate={validate} style={[styles.flexGrow1, styles.mt3]} submitButtonStyles={[styles.ph5, styles.mb0]} enabledWhenOffline ref={formRef} isSubmitButtonVisible={!isEditing}>
            <react_native_1.View style={styles.ph5}>
                <Text_1.default style={[styles.textHeadlineLineHeightXXL, styles.mb6]}>{translate('addPersonalBankAccount.accountTypeStepHeader')}</Text_1.default>
            </react_native_1.View>
            <InputWrapper_1.default InputComponent={ValuePicker_1.default} inputID={fieldData.id} label={fieldData.label} items={options} shouldSaveDraft={!isEditing} shouldShowModal={false} onValueChange={function (value) {
            var _a;
            if (!isEditing) {
                return;
            }
            (0, FormActions_1.setDraftValues)(ONYXKEYS_1.default.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM, (_a = {}, _a[CONST_1.default.CORPAY_FIELDS.ACCOUNT_TYPE_KEY] = value, _a)).then(function () {
                onNext();
            });
        }}/>
        </FormProvider_1.default>);
}
AccountType.displayName = 'AccountType';
exports.default = AccountType;
