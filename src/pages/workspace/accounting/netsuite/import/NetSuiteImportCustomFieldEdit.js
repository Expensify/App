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
var ConnectionLayout_1 = require("@components/ConnectionLayout");
var FormProvider_1 = require("@components/Form/FormProvider");
var InputWrapper_1 = require("@components/Form/InputWrapper");
var TextInput_1 = require("@components/TextInput");
var useAutoFocusInput_1 = require("@hooks/useAutoFocusInput");
var useLocalize_1 = require("@hooks/useLocalize");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var NetSuiteCommands_1 = require("@libs/actions/connections/NetSuiteCommands");
var ErrorUtils_1 = require("@libs/ErrorUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var withPolicyConnections_1 = require("@pages/workspace/withPolicyConnections");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var NetSuiteCustomFieldMappingPicker_1 = require("./NetSuiteImportCustomFieldNew/NetSuiteCustomFieldMappingPicker");
function NetSuiteImportCustomFieldEdit(_a) {
    var _b, _c, _d, _e, _f, _g, _h, _j, _k;
    var policy = _a.policy, _l = _a.route.params, importCustomField = _l.importCustomField, valueIndex = _l.valueIndex, fieldName = _l.fieldName, policyID = _l.policyID;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var inputCallbackRef = (0, useAutoFocusInput_1.default)().inputCallbackRef;
    var config = (_d = (_c = (_b = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _b === void 0 ? void 0 : _b.netsuite) === null || _c === void 0 ? void 0 : _c.options) === null || _d === void 0 ? void 0 : _d.config;
    var allRecords = (0, react_1.useMemo)(function () { var _a, _b; return (_b = (_a = config === null || config === void 0 ? void 0 : config.syncOptions) === null || _a === void 0 ? void 0 : _a[importCustomField]) !== null && _b !== void 0 ? _b : []; }, [config === null || config === void 0 ? void 0 : config.syncOptions, importCustomField]);
    var customField = allRecords[valueIndex];
    var fieldValue = (_e = customField === null || customField === void 0 ? void 0 : customField[fieldName]) !== null && _e !== void 0 ? _e : '';
    var updateRecord = (0, react_1.useCallback)(function (formValues) {
        var newValue = formValues[fieldName];
        if (customField) {
            var updatedRecords = allRecords.map(function (record, index) {
                var _a;
                if (index === Number(valueIndex)) {
                    return __assign(__assign({}, record), (_a = {}, _a[fieldName] = newValue, _a));
                }
                return record;
            });
            if ((0, PolicyUtils_1.isNetSuiteCustomSegmentRecord)(customField)) {
                (0, NetSuiteCommands_1.updateNetSuiteCustomSegments)(policyID, updatedRecords, allRecords, "".concat(importCustomField, "_").concat(valueIndex), CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
            }
            else {
                (0, NetSuiteCommands_1.updateNetSuiteCustomLists)(policyID, updatedRecords, allRecords, "".concat(importCustomField, "_").concat(valueIndex), CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE);
            }
        }
        Navigation_1.default.navigate(ROUTES_1.default.POLICY_ACCOUNTING_NETSUITE_IMPORT_CUSTOM_FIELD_VIEW.getRoute(policyID, importCustomField, valueIndex));
    }, [allRecords, customField, fieldName, importCustomField, policyID, valueIndex]);
    var validate = (0, react_1.useCallback)(function (formValues) {
        var _a, _b, _c, _d, _e, _f;
        var errors = {};
        var key = fieldName;
        var fieldLabel = translate("workspace.netsuite.import.importCustomFields.".concat(importCustomField, ".fields.").concat(fieldName));
        if (!formValues[key]) {
            (0, ErrorUtils_1.addErrorMessage)(errors, fieldName, translate('workspace.netsuite.import.importCustomFields.requiredFieldError', { fieldName: fieldLabel }));
        }
        else if ((_f = (_e = (_d = (_c = (_b = (_a = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _a === void 0 ? void 0 : _a.netsuite) === null || _b === void 0 ? void 0 : _b.options) === null || _c === void 0 ? void 0 : _c.config) === null || _d === void 0 ? void 0 : _d.syncOptions) === null || _e === void 0 ? void 0 : _e.customSegments) === null || _f === void 0 ? void 0 : _f.find(function (customSegment) { var _a; return ((_a = customSegment === null || customSegment === void 0 ? void 0 : customSegment[fieldName]) === null || _a === void 0 ? void 0 : _a.toLowerCase()) === formValues[key].toLowerCase(); })) {
            (0, ErrorUtils_1.addErrorMessage)(errors, fieldName, translate('workspace.netsuite.import.importCustomFields.customSegments.errors.uniqueFieldError', { fieldName: fieldLabel }));
        }
        return errors;
    }, [fieldName, importCustomField, (_k = (_j = (_h = (_g = (_f = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _f === void 0 ? void 0 : _f.netsuite) === null || _g === void 0 ? void 0 : _g.options) === null || _h === void 0 ? void 0 : _h.config) === null || _j === void 0 ? void 0 : _j.syncOptions) === null || _k === void 0 ? void 0 : _k.customSegments, translate]);
    var renderForm = (0, react_1.useMemo)(function () {
        return !!customField && (<FormProvider_1.default formID={ONYXKEYS_1.default.FORMS.NETSUITE_CUSTOM_FIELD_FORM} style={[styles.flexGrow1, styles.ph5]} validate={validate} onSubmit={updateRecord} submitButtonText={translate('common.save')} shouldValidateOnBlur shouldValidateOnChange isSubmitDisabled={!!(0, PolicyUtils_1.settingsPendingAction)(["".concat(importCustomField, "_").concat(valueIndex)], config === null || config === void 0 ? void 0 : config.pendingFields)} shouldHideFixErrorsAlert>
                    <InputWrapper_1.default InputComponent={TextInput_1.default} inputID={fieldName} label={translate("workspace.netsuite.import.importCustomFields.".concat(importCustomField, ".fields.").concat(fieldName))} aria-label={translate("workspace.netsuite.import.importCustomFields.".concat(importCustomField, ".fields.").concat(fieldName))} role={CONST_1.default.ROLE.PRESENTATION} spellCheck={false} defaultValue={fieldValue !== null && fieldValue !== void 0 ? fieldValue : ''} ref={inputCallbackRef}/>
                </FormProvider_1.default>);
    }, [config === null || config === void 0 ? void 0 : config.pendingFields, customField, fieldName, fieldValue, importCustomField, inputCallbackRef, styles.flexGrow1, styles.ph5, translate, updateRecord, validate, valueIndex]);
    var renderSelection = (0, react_1.useMemo)(function () {
        return !!customField && (<NetSuiteCustomFieldMappingPicker_1.default onInputChange={function (value) {
                var _a;
                updateRecord((_a = {},
                    _a[fieldName] = value,
                    _a));
            }} value={fieldValue}/>);
    }, [customField, fieldName, fieldValue, updateRecord]);
    var renderMap = {
        mapping: renderSelection,
    };
    return (<ConnectionLayout_1.default displayName={NetSuiteImportCustomFieldEdit.displayName} headerTitle={"workspace.netsuite.import.importCustomFields.".concat(importCustomField, ".fields.").concat(fieldName)} accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN, CONST_1.default.POLICY.ACCESS_VARIANTS.CONTROL]} policyID={policyID} featureName={CONST_1.default.POLICY.MORE_FEATURES.ARE_CONNECTIONS_ENABLED} contentContainerStyle={[styles.pb2, styles.flex1]} titleStyle={styles.ph5} connectionName={CONST_1.default.POLICY.CONNECTIONS.NAME.NETSUITE} shouldBeBlocked={!customField || !(0, PolicyUtils_1.isNetSuiteCustomFieldPropertyEditable)(customField, fieldName)} shouldUseScrollView={false}>
            {renderMap[fieldName] || renderForm}
        </ConnectionLayout_1.default>);
}
NetSuiteImportCustomFieldEdit.displayName = 'NetSuiteImportCustomFieldEdit';
exports.default = (0, withPolicyConnections_1.default)(NetSuiteImportCustomFieldEdit);
