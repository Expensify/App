"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var CheckboxWithLabel_1 = require("@components/CheckboxWithLabel");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var FormHelpMessage_1 = require("@components/FormHelpMessage");
var MenuItemWithTopDescription_1 = require("@components/MenuItemWithTopDescription");
var ScrollView_1 = require("@components/ScrollView");
var Text_1 = require("@components/Text");
var TextLink_1 = require("@components/TextLink");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var CurrencyUtils_1 = require("@libs/CurrencyUtils");
var BankAccounts_1 = require("@userActions/BankAccounts");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var STEP_INDEXES = CONST_1.default.CORPAY_FIELDS.INDEXES.MAPPING;
function TermsAndConditionsLabel() {
    var translate = (0, useLocalize_1.default)().translate;
    return (<Text_1.default>
            {translate('common.iAcceptThe')}
            <TextLink_1.default href={CONST_1.default.OLD_DOT_PUBLIC_URLS.TERMS_URL}>{"".concat(translate('common.addCardTermsOfService'))}</TextLink_1.default>
        </Text_1.default>);
}
function Confirmation(_a) {
    var _b, _c, _d, _e;
    var onNext = _a.onNext, onMove = _a.onMove, formValues = _a.formValues, fieldsMap = _a.fieldsMap;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var _f = (0, react_1.useState)(false), isSubmitting = _f[0], setIsSubmitting = _f[1];
    var _g = (0, react_1.useState)(''), error = _g[0], setError = _g[1];
    var corpayFields = (0, useOnyx_1.default)(ONYXKEYS_1.default.CORPAY_FIELDS, { canBeMissing: false })[0];
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var getTitle = function (field, fieldName) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
        if (((_a = field.valueSet) !== null && _a !== void 0 ? _a : []).length > 0) {
            return (_d = (_c = (_b = field.valueSet) === null || _b === void 0 ? void 0 : _b.find(function (type) { return type.id === formValues[fieldName]; })) === null || _c === void 0 ? void 0 : _c.text) !== null && _d !== void 0 ? _d : formValues[fieldName];
        }
        if (((_h = (_g = (_f = (_e = field === null || field === void 0 ? void 0 : field.links) === null || _e === void 0 ? void 0 : _e[0]) === null || _f === void 0 ? void 0 : _f.content) === null || _g === void 0 ? void 0 : _g.regions) !== null && _h !== void 0 ? _h : []).length > 0) {
            return (_q = (_p = (_o = ((_m = (_l = (_k = (_j = field === null || field === void 0 ? void 0 : field.links) === null || _j === void 0 ? void 0 : _j[0]) === null || _k === void 0 ? void 0 : _k.content) === null || _l === void 0 ? void 0 : _l.regions) !== null && _m !== void 0 ? _m : [])) === null || _o === void 0 ? void 0 : _o.find(function (_a) {
                var code = _a.code;
                return code === formValues[fieldName];
            })) === null || _p === void 0 ? void 0 : _p.name) !== null && _q !== void 0 ? _q : formValues[fieldName];
        }
        return formValues[fieldName];
    };
    var getDataAndGoToNextStep = function (values) {
        var _a, _b, _c;
        setError('');
        setIsSubmitting(true);
        (0, BankAccounts_1.createCorpayBankAccountForWalletFlow)(__assign(__assign({}, formValues), values), (_a = corpayFields === null || corpayFields === void 0 ? void 0 : corpayFields.classification) !== null && _a !== void 0 ? _a : '', (_b = corpayFields === null || corpayFields === void 0 ? void 0 : corpayFields.destinationCountry) !== null && _b !== void 0 ? _b : '', (_c = corpayFields === null || corpayFields === void 0 ? void 0 : corpayFields.preferredMethod) !== null && _c !== void 0 ? _c : '').then(function (response) {
            var _a;
            setIsSubmitting(false);
            if (response === null || response === void 0 ? void 0 : response.jsonCode) {
                if (response.jsonCode === CONST_1.default.JSON_CODE.SUCCESS) {
                    onNext();
                }
                else {
                    setError((_a = response.message) !== null && _a !== void 0 ? _a : '');
                }
            }
        });
    };
    var summaryItems = [
        {
            description: translate('common.country'),
            title: translate("allCountries.".concat(formValues.bankCountry)),
            shouldShowRightIcon: true,
            onPress: function () {
                onMove(STEP_INDEXES.COUNTRY_SELECTOR);
            },
            disabled: isOffline,
        },
        {
            description: translate('common.currency'),
            title: "".concat(formValues.bankCurrency, " - ").concat((0, CurrencyUtils_1.getCurrencySymbol)(formValues.bankCurrency)),
            shouldShowRightIcon: true,
            onPress: function () {
                onMove(STEP_INDEXES.BANK_ACCOUNT_DETAILS);
            },
            disabled: isOffline,
        },
    ];
    Object.entries((_b = fieldsMap[CONST_1.default.CORPAY_FIELDS.STEPS_NAME.BANK_ACCOUNT_DETAILS]) !== null && _b !== void 0 ? _b : {}).forEach(function (_a) {
        var fieldName = _a[0], field = _a[1];
        summaryItems.push({
            description: field.label + (field.isRequired ? '' : " (".concat(translate('common.optional'), ")")),
            title: getTitle(field, fieldName),
            shouldShowRightIcon: true,
            onPress: function () {
                onMove(STEP_INDEXES.BANK_ACCOUNT_DETAILS);
            },
        });
    });
    Object.entries((_c = fieldsMap[CONST_1.default.CORPAY_FIELDS.STEPS_NAME.ACCOUNT_TYPE]) !== null && _c !== void 0 ? _c : {}).forEach(function (_a) {
        var fieldName = _a[0], field = _a[1];
        summaryItems.push({
            description: field.label + (field.isRequired ? '' : " (".concat(translate('common.optional'), ")")),
            title: getTitle(field, fieldName),
            shouldShowRightIcon: true,
            onPress: function () {
                onMove(STEP_INDEXES.ACCOUNT_TYPE);
            },
        });
    });
    Object.entries((_d = fieldsMap[CONST_1.default.CORPAY_FIELDS.STEPS_NAME.BANK_INFORMATION]) !== null && _d !== void 0 ? _d : {})
        .sort(function (_a, _b) {
        var field1 = _a[0];
        var field2 = _b[0];
        return CONST_1.default.CORPAY_FIELDS.BANK_INFORMATION_FIELDS.indexOf(field1) - CONST_1.default.CORPAY_FIELDS.BANK_INFORMATION_FIELDS.indexOf(field2);
    })
        .forEach(function (_a) {
        var fieldName = _a[0], field = _a[1];
        summaryItems.push({
            description: field.label + (field.isRequired ? '' : " (".concat(translate('common.optional'), ")")),
            title: getTitle(field, fieldName),
            shouldShowRightIcon: true,
            onPress: function () {
                onMove(STEP_INDEXES.BANK_INFORMATION);
            },
        });
    });
    Object.entries((_e = fieldsMap[CONST_1.default.CORPAY_FIELDS.STEPS_NAME.ACCOUNT_HOLDER_INFORMATION]) !== null && _e !== void 0 ? _e : {})
        .sort(function (_a, _b) {
        var field1 = _a[0];
        var field2 = _b[0];
        return CONST_1.default.CORPAY_FIELDS.ACCOUNT_HOLDER_FIELDS.indexOf(field1) - CONST_1.default.CORPAY_FIELDS.ACCOUNT_HOLDER_FIELDS.indexOf(field2);
    })
        .forEach(function (_a) {
        var fieldName = _a[0], field = _a[1];
        summaryItems.push({
            description: field.label + (field.isRequired ? '' : " (".concat(translate('common.optional'), ")")),
            title: fieldName === CONST_1.default.CORPAY_FIELDS.ACCOUNT_HOLDER_COUNTRY_KEY ? translate("allCountries.".concat(formValues.bankCountry)) : getTitle(field, fieldName),
            shouldShowRightIcon: fieldName !== CONST_1.default.CORPAY_FIELDS.ACCOUNT_HOLDER_COUNTRY_KEY,
            onPress: function () {
                onMove(STEP_INDEXES.ACCOUNT_HOLDER_INFORMATION);
            },
            interactive: fieldName !== CONST_1.default.CORPAY_FIELDS.ACCOUNT_HOLDER_COUNTRY_KEY,
        });
    });
    var validate = (0, react_1.useCallback)(function (values) {
        var errors = {};
        if (!values.acceptTerms) {
            errors.acceptTerms = translate('common.error.acceptTerms');
        }
        return errors;
    }, [translate]);
    return (<ScrollView_1.default contentContainerStyle={styles.flexGrow1}>
            <Text_1.default style={[styles.textHeadlineLineHeightXXL, styles.ph5, styles.mb3]}>{translate('addPersonalBankAccount.confirmationStepHeader')}</Text_1.default>
            <Text_1.default style={[styles.mb6, styles.ph5, styles.textSupporting]}>{translate('addPersonalBankAccount.confirmationStepSubHeader')}</Text_1.default>
            {summaryItems.map(function (_a) {
            var description = _a.description, title = _a.title, shouldShowRightIcon = _a.shouldShowRightIcon, interactive = _a.interactive, disabled = _a.disabled, onPress = _a.onPress;
            return (<MenuItemWithTopDescription_1.default key={"".concat(title, "_").concat(description)} description={description} title={title} shouldShowRightIcon={shouldShowRightIcon} onPress={onPress} interactive={interactive} disabled={disabled}/>);
        })}
            <FormProvider_1.default formID={ONYXKEYS_1.default.FORMS.INTERNATIONAL_BANK_ACCOUNT_FORM} validate={validate} onSubmit={getDataAndGoToNextStep} scrollContextEnabled submitButtonText={translate('common.confirm')} style={[styles.mh5, styles.flexGrow1]} enabledWhenOffline={false} isLoading={isSubmitting} shouldHideFixErrorsAlert>
                <InputWrapper_1.default InputComponent={CheckboxWithLabel_1.default} aria-label={"".concat(translate('common.iAcceptThe'), " ").concat(translate('common.addCardTermsOfService'))} inputID="acceptTerms" LabelComponent={TermsAndConditionsLabel} style={[styles.mt3]} shouldSaveDraft/>
                <FormHelpMessage_1.default style={[styles.mt3, styles.mbn1]} isError message={error}/>
            </FormProvider_1.default>
        </ScrollView_1.default>);
}
Confirmation.displayName = 'Confirmation';
exports.default = Confirmation;
