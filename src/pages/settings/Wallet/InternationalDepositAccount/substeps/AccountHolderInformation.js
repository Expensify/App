"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var AddressSearch_1 = require("@components/AddressSearch");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var PushRowWithModal_1 = require("@components/PushRowWithModal");
var TextInput_1 = require("@components/TextInput");
var ValuePicker_1 = require("@components/ValuePicker");
var useInternationalBankAccountFormSubmit_1 = require("@hooks/useInternationalBankAccountFormSubmit");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var utils_1 = require("@pages/settings/Wallet/InternationalDepositAccount/utils");
var Text_1 = require("@src/components/Text");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
function getInputComponent(field) {
    var _a;
    if (((_a = field.valueSet) !== null && _a !== void 0 ? _a : []).length > 0) {
        return ValuePicker_1.default;
    }
    if (CONST_1.default.CORPAY_FIELDS.SPECIAL_LIST_REGION_KEYS.includes(field.id)) {
        return ValuePicker_1.default;
    }
    if (CONST_1.default.CORPAY_FIELDS.SPECIAL_LIST_ADDRESS_KEYS.includes(field.id)) {
        return AddressSearch_1.default;
    }
    if (field.id === CONST_1.default.CORPAY_FIELDS.ACCOUNT_HOLDER_COUNTRY_KEY) {
        return PushRowWithModal_1.default;
    }
    return TextInput_1.default;
}
function getItems(field) {
    var _a, _b, _c, _d, _e;
    if (((_a = field.valueSet) !== null && _a !== void 0 ? _a : []).length > 0) {
        return ((_b = field.valueSet) !== null && _b !== void 0 ? _b : []).map(function (_a) {
            var id = _a.id, text = _a.text;
            return ({ value: id, label: text });
        });
    }
    return ((_e = (_d = (_c = field.links) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.content.regions) !== null && _e !== void 0 ? _e : []).map(function (_a) {
        var name = _a.name, code = _a.code;
        return ({ value: code, label: name });
    });
}
function AccountHolderInformation(_a) {
    var isEditing = _a.isEditing, onNext = _a.onNext, formValues = _a.formValues, fieldsMap = _a.fieldsMap;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var handleSubmit = (0, useInternationalBankAccountFormSubmit_1.default)({
        fieldIds: Object.keys(fieldsMap[CONST_1.default.CORPAY_FIELDS.STEPS_NAME.ACCOUNT_HOLDER_INFORMATION]),
        onNext: onNext,
        shouldSaveDraft: isEditing,
    });
    var validate = (0, react_1.useCallback)(function (values) {
        return (0, utils_1.getValidationErrors)(values, fieldsMap[CONST_1.default.CORPAY_FIELDS.STEPS_NAME.ACCOUNT_HOLDER_INFORMATION], translate);
    }, [fieldsMap, translate]);
    var getStyle = (0, react_1.useCallback)(function (field, index) {
        var _a;
        if (((_a = field.valueSet) !== null && _a !== void 0 ? _a : []).length > 0) {
            return [styles.mhn5, index === 0 ? styles.pb1 : styles.pv1];
        }
        if (CONST_1.default.CORPAY_FIELDS.SPECIAL_LIST_REGION_KEYS.includes(field.id)) {
            return [styles.mhn5, index === 0 ? styles.pb1 : styles.pv1];
        }
        if (CONST_1.default.CORPAY_FIELDS.SPECIAL_LIST_ADDRESS_KEYS.includes(field.id)) {
            return [index === 0 ? styles.pb2 : styles.pv2];
        }
        if (field.id === CONST_1.default.CORPAY_FIELDS.ACCOUNT_HOLDER_COUNTRY_KEY) {
            return [styles.mhn5, index === 0 ? styles.pb1 : styles.pv1];
        }
        return [index === 0 ? styles.pb2 : styles.pv2];
    }, [styles.mhn5, styles.pb1, styles.pb2, styles.pv1, styles.pv2]);
    return (<FormProvider_1.default formID={ONYXKEYS_1.default.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM} submitButtonText={translate(isEditing ? 'common.confirm' : 'common.next')} onSubmit={handleSubmit} validate={validate} style={[styles.flexGrow1, styles.mt3]} submitButtonStyles={[styles.ph5, styles.mb0]} enabledWhenOffline>
            <react_native_1.View style={styles.ph5}>
                <Text_1.default style={[styles.textHeadlineLineHeightXXL, styles.mb6]}>{translate('addPersonalBankAccount.accountHolderInformationStepHeader')}</Text_1.default>
                {Object.values(fieldsMap[CONST_1.default.CORPAY_FIELDS.STEPS_NAME.ACCOUNT_HOLDER_INFORMATION])
            .sort(function (a, b) { return CONST_1.default.CORPAY_FIELDS.ACCOUNT_HOLDER_FIELDS.indexOf(a.id) - CONST_1.default.CORPAY_FIELDS.ACCOUNT_HOLDER_FIELDS.indexOf(b.id); })
            .map(function (field, index) {
            var _a, _b, _c, _d;
            return (<react_native_1.View style={getStyle(field, index)} key={field.id}>
                            <InputWrapper_1.default InputComponent={getInputComponent(field)} inputID={field.id} defaultValue={formValues[field.id]} label={field.label + (field.isRequired ? '' : " (".concat(translate('common.optional'), ")"))} description={field.id === CONST_1.default.CORPAY_FIELDS.ACCOUNT_HOLDER_COUNTRY_KEY ? field.label : undefined} items={getItems(field)} shouldAllowChange={field.id === CONST_1.default.CORPAY_FIELDS.ACCOUNT_HOLDER_COUNTRY_KEY ? false : undefined} optionsList={field.id === CONST_1.default.CORPAY_FIELDS.ACCOUNT_HOLDER_COUNTRY_KEY ? CONST_1.default.ALL_COUNTRIES : undefined} value={field.id === CONST_1.default.CORPAY_FIELDS.ACCOUNT_HOLDER_COUNTRY_KEY ? formValues.bankCountry : undefined} shouldSaveDraft={!isEditing} renamedInputKeys={{
                    street: (0, EmptyObject_1.isEmptyObject)((_a = fieldsMap[CONST_1.default.CORPAY_FIELDS.STEPS_NAME.ACCOUNT_HOLDER_INFORMATION]) === null || _a === void 0 ? void 0 : _a.accountHolderAddress1) ? '' : 'accountHolderAddress1',
                    street2: (0, EmptyObject_1.isEmptyObject)((_b = fieldsMap[CONST_1.default.CORPAY_FIELDS.STEPS_NAME.ACCOUNT_HOLDER_INFORMATION]) === null || _b === void 0 ? void 0 : _b.accountHolderAddress2) ? '' : 'accountHolderAddress2',
                    city: (0, EmptyObject_1.isEmptyObject)((_c = fieldsMap[CONST_1.default.CORPAY_FIELDS.STEPS_NAME.ACCOUNT_HOLDER_INFORMATION]) === null || _c === void 0 ? void 0 : _c.accountHolderCity) ? '' : 'accountHolderCity',
                    state: '',
                    zipCode: (0, EmptyObject_1.isEmptyObject)((_d = fieldsMap[CONST_1.default.CORPAY_FIELDS.STEPS_NAME.ACCOUNT_HOLDER_INFORMATION]) === null || _d === void 0 ? void 0 : _d.accountHolderPostal) ? '' : 'accountHolderPostal',
                    country: '',
                    lat: '',
                    lng: '',
                }}/>
                        </react_native_1.View>);
        })}
            </react_native_1.View>
        </FormProvider_1.default>);
}
AccountHolderInformation.displayName = 'AccountHolderInformation';
exports.default = AccountHolderInformation;
