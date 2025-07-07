"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = require("react");
var react_native_1 = require("react-native");
var Button_1 = require("@components/Button");
var CheckboxWithLabel_1 = require("@components/CheckboxWithLabel");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var ScrollView_1 = require("@components/ScrollView");
var Text_1 = require("@components/Text");
var TextInput_1 = require("@components/TextInput");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var DebugUtils_1 = require("@libs/DebugUtils");
var Debug_1 = require("@userActions/Debug");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var DebugTransactionForm_1 = require("@src/types/form/DebugTransactionForm");
var const_1 = require("./const");
var ConstantSelector_1 = require("./ConstantSelector");
var DateTimeSelector_1 = require("./DateTimeSelector");
function DebugDetails(_a) {
    var formType = _a.formType, data = _a.data, policyHasEnabledTags = _a.policyHasEnabledTags, policyID = _a.policyID, children = _a.children, onSave = _a.onSave, onDelete = _a.onDelete, validate = _a.validate;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var formDraftData = (0, useOnyx_1.default)(ONYXKEYS_1.default.FORMS.DEBUG_DETAILS_FORM_DRAFT, { canBeMissing: true })[0];
    var booleanFields = (0, react_1.useMemo)(function () {
        return Object.entries(data !== null && data !== void 0 ? data : {})
            .filter(function (_a) {
            var value = _a[1];
            return typeof value === 'boolean';
        })
            .sort(function (a, b) { return a[0].localeCompare(b[0]); });
    }, [data]);
    var constantFields = (0, react_1.useMemo)(function () {
        return Object.entries(data !== null && data !== void 0 ? data : {})
            .filter(function (entry) {
            // Tag picker needs to be hidden when the policy has no tags available to pick
            if (entry[0] === DebugTransactionForm_1.default.TAG && !policyHasEnabledTags) {
                return false;
            }
            return const_1.DETAILS_CONSTANT_FIELDS[formType].some(function (_a) {
                var fieldName = _a.fieldName;
                return fieldName === entry[0];
            });
        })
            .sort(function (a, b) { return a[0].localeCompare(b[0]); });
    }, [data, formType, policyHasEnabledTags]);
    var numberFields = (0, react_1.useMemo)(function () {
        return Object.entries(data !== null && data !== void 0 ? data : {})
            .filter(function (entry) { return typeof entry[1] === 'number'; })
            .sort(function (a, b) { return a[0].localeCompare(b[0]); });
    }, [data]);
    var textFields = (0, react_1.useMemo)(function () {
        return Object.entries(data !== null && data !== void 0 ? data : {})
            .filter(function (entry) {
            return (typeof entry[1] === 'string' || typeof entry[1] === 'object') &&
                !const_1.DETAILS_CONSTANT_FIELDS[formType].some(function (_a) {
                    var fieldName = _a.fieldName;
                    return fieldName === entry[0];
                }) &&
                !const_1.DETAILS_DATETIME_FIELDS.includes(entry[0]);
        })
            .map(function (_a) {
            var key = _a[0], value = _a[1];
            return [key, DebugUtils_1.default.onyxDataToString(value)];
        })
            .sort(function (a, b) { var _a, _b; return ((_a = a.at(0)) !== null && _a !== void 0 ? _a : '').localeCompare((_b = b.at(0)) !== null && _b !== void 0 ? _b : ''); });
    }, [data, formType]);
    var dateTimeFields = (0, react_1.useMemo)(function () { return Object.entries(data !== null && data !== void 0 ? data : {}).filter(function (entry) { return const_1.DETAILS_DATETIME_FIELDS.includes(entry[0]); }); }, [data]);
    var validator = (0, react_1.useCallback)(function (values) {
        var newErrors = {};
        Object.entries(values).forEach(function (_a) {
            var key = _a[0], value = _a[1];
            try {
                validate(key, DebugUtils_1.default.onyxDataToString(value));
            }
            catch (e) {
                var _b = e, cause = _b.cause, message = _b.message;
                newErrors[key] = cause || message === 'debug.missingValue' ? translate(message, cause) : message;
            }
        });
        return newErrors;
    }, [translate, validate]);
    (0, react_1.useEffect)(function () {
        Debug_1.default.resetDebugDetailsDraftForm();
    }, []);
    var handleSubmit = (0, react_1.useCallback)(function (values) {
        var dataPreparedToSave = Object.entries(values).reduce(function (acc, _a) {
            var key = _a[0], value = _a[1];
            if (typeof value === 'boolean') {
                acc[key] = value;
            }
            else {
                acc[key] = DebugUtils_1.default.stringToOnyxData(value, typeof (data === null || data === void 0 ? void 0 : data[key]));
            }
            return acc;
        }, {});
        onSave(dataPreparedToSave);
    }, [data, onSave]);
    var isSubmitDisabled = (0, react_1.useMemo)(function () {
        return !Object.entries(formDraftData !== null && formDraftData !== void 0 ? formDraftData : {}).some(function (_a) {
            var key = _a[0], value = _a[1];
            var onyxData = data === null || data === void 0 ? void 0 : data[key];
            if (typeof value === 'string') {
                return !DebugUtils_1.default.compareStringWithOnyxData(value, onyxData);
            }
            return onyxData !== value;
        });
    }, [formDraftData, data]);
    return (<ScrollView_1.default style={styles.mv5}>
            {children}
            <FormProvider_1.default style={styles.flexGrow1} formID={ONYXKEYS_1.default.FORMS.DEBUG_DETAILS_FORM} validate={validator} shouldValidateOnChange onSubmit={handleSubmit} isSubmitDisabled={isSubmitDisabled} submitButtonText={translate('common.save')} submitButtonStyles={[styles.ph5, styles.mt0]} enabledWhenOffline allowHTML>
                <Text_1.default style={[styles.headerText, styles.ph5, styles.mb3]}>{translate('debug.textFields')}</Text_1.default>
                <react_native_1.View style={[styles.mb5, styles.ph5, styles.gap5]}>
                    {textFields.map(function (_a) {
            var _b;
            var key = _a[0], value = _a[1];
            var numberOfLines = DebugUtils_1.default.getNumberOfLinesFromString((_b = formDraftData === null || formDraftData === void 0 ? void 0 : formDraftData[key]) !== null && _b !== void 0 ? _b : value);
            return (<InputWrapper_1.default key={key} InputComponent={TextInput_1.default} inputID={key} accessibilityLabel={key} shouldSaveDraft forceActiveLabel label={key} numberOfLines={numberOfLines} multiline={numberOfLines > 1} defaultValue={value} disabled={const_1.DETAILS_DISABLED_KEYS.includes(key)} shouldInterceptSwipe/>);
        })}
                    {textFields.length === 0 && <Text_1.default style={[styles.textNormalThemeText, styles.ph5]}>{translate('debug.none')}</Text_1.default>}
                </react_native_1.View>
                <Text_1.default style={[styles.headerText, styles.ph5, styles.mb3]}>{translate('debug.numberFields')}</Text_1.default>
                <react_native_1.View style={[styles.mb5, styles.ph5, styles.gap5]}>
                    {numberFields.map(function (_a) {
            var key = _a[0], value = _a[1];
            return (<InputWrapper_1.default key={key} InputComponent={TextInput_1.default} inputID={key} accessibilityLabel={key} shouldSaveDraft forceActiveLabel label={key} defaultValue={String(value)} disabled={const_1.DETAILS_DISABLED_KEYS.includes(key)} shouldInterceptSwipe/>);
        })}
                    {numberFields.length === 0 && <Text_1.default style={styles.textNormalThemeText}>{translate('debug.none')}</Text_1.default>}
                </react_native_1.View>
                <Text_1.default style={[styles.headerText, styles.ph5, styles.mb3]}>{translate('debug.constantFields')}</Text_1.default>
                <react_native_1.View style={styles.mb5}>
                    {constantFields.map(function (_a) {
            var key = _a[0], value = _a[1];
            return (<InputWrapper_1.default key={key} InputComponent={ConstantSelector_1.default} inputID={key} formType={formType} name={key} shouldSaveDraft defaultValue={String(value)} policyID={policyID}/>);
        })}
                    {constantFields.length === 0 && <Text_1.default style={[styles.textNormalThemeText, styles.ph5]}>{translate('debug.none')}</Text_1.default>}
                </react_native_1.View>
                <Text_1.default style={[styles.headerText, styles.ph5, styles.mb3]}>{translate('debug.dateTimeFields')}</Text_1.default>
                <react_native_1.View style={styles.mb5}>
                    {dateTimeFields.map(function (_a) {
            var key = _a[0], value = _a[1];
            return (<InputWrapper_1.default key={key} InputComponent={DateTimeSelector_1.default} inputID={key} name={key} shouldSaveDraft defaultValue={String(value)}/>);
        })}
                    {dateTimeFields.length === 0 && <Text_1.default style={[styles.textNormalThemeText, styles.ph5]}>{translate('debug.none')}</Text_1.default>}
                </react_native_1.View>
                <Text_1.default style={[styles.headerText, styles.ph5, styles.mb3]}>{translate('debug.booleanFields')}</Text_1.default>
                <react_native_1.View style={[styles.mb5, styles.ph5, styles.gap5]}>
                    {booleanFields.map(function (_a) {
            var key = _a[0], value = _a[1];
            return (<InputWrapper_1.default key={key} InputComponent={CheckboxWithLabel_1.default} label={key} inputID={key} shouldSaveDraft accessibilityLabel={key} defaultValue={value}/>);
        })}
                    {booleanFields.length === 0 && <Text_1.default style={styles.textNormalThemeText}>{translate('debug.none')}</Text_1.default>}
                </react_native_1.View>
                <Text_1.default style={[styles.headerText, styles.textAlignCenter]}>{translate('debug.hint')}</Text_1.default>
                <react_native_1.View style={[styles.ph5, styles.mb3, styles.mt5]}>
                    <Button_1.default danger large text={translate('common.delete')} onPress={onDelete}/>
                </react_native_1.View>
            </FormProvider_1.default>
        </ScrollView_1.default>);
}
DebugDetails.displayName = 'DebugDetails';
exports.default = DebugDetails;
