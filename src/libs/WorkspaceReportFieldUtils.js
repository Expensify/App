"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
exports.__esModule = true;
exports.getReportFieldInitialValue = exports.generateFieldID = exports.validateReportFieldListValueName = exports.getReportFieldAlternativeTextTranslationKey = exports.getReportFieldTypeTranslationKey = void 0;
var CONST_1 = require("@src/CONST");
var ErrorUtils = require("./ErrorUtils");
var Localize = require("./Localize");
var ValidationUtils = require("./ValidationUtils");
/**
 * Gets the translation key for the report field type.
 */
function getReportFieldTypeTranslationKey(reportFieldType) {
    var _a;
    var typeTranslationKeysStrategy = (_a = {},
        _a[CONST_1["default"].REPORT_FIELD_TYPES.TEXT] = 'workspace.reportFields.textType',
        _a[CONST_1["default"].REPORT_FIELD_TYPES.DATE] = 'workspace.reportFields.dateType',
        _a[CONST_1["default"].REPORT_FIELD_TYPES.LIST] = 'workspace.reportFields.dropdownType',
        _a);
    return typeTranslationKeysStrategy[reportFieldType];
}
exports.getReportFieldTypeTranslationKey = getReportFieldTypeTranslationKey;
/**
 * Gets the translation key for the alternative text for the report field.
 */
function getReportFieldAlternativeTextTranslationKey(reportFieldType) {
    var _a;
    var typeTranslationKeysStrategy = (_a = {},
        _a[CONST_1["default"].REPORT_FIELD_TYPES.TEXT] = 'workspace.reportFields.textAlternateText',
        _a[CONST_1["default"].REPORT_FIELD_TYPES.DATE] = 'workspace.reportFields.dateAlternateText',
        _a[CONST_1["default"].REPORT_FIELD_TYPES.LIST] = 'workspace.reportFields.dropdownAlternateText',
        _a);
    return typeTranslationKeysStrategy[reportFieldType];
}
exports.getReportFieldAlternativeTextTranslationKey = getReportFieldAlternativeTextTranslationKey;
/**
 * Validates the list value name.
 */
function validateReportFieldListValueName(valueName, priorValueName, listValues, inputID) {
    var errors = {};
    if (!ValidationUtils.isRequiredFulfilled(valueName)) {
        errors[inputID] = Localize.translateLocal('workspace.reportFields.listValueRequiredError');
    }
    else if (priorValueName !== valueName && listValues.some(function (currentValueName) { return currentValueName === valueName; })) {
        errors[inputID] = Localize.translateLocal('workspace.reportFields.existingListValueError');
    }
    else if (__spreadArrays(valueName).length > CONST_1["default"].WORKSPACE_REPORT_FIELD_POLICY_MAX_LENGTH) {
        // Uses the spread syntax to count the number of Unicode code points instead of the number of UTF-16 code units.
        ErrorUtils.addErrorMessage(errors, inputID, Localize.translateLocal('common.error.characterLimitExceedCounter', { length: __spreadArrays(valueName).length, limit: CONST_1["default"].WORKSPACE_REPORT_FIELD_POLICY_MAX_LENGTH }));
    }
    return errors;
}
exports.validateReportFieldListValueName = validateReportFieldListValueName;
/**
 * Generates a field ID based on the field name.
 */
function generateFieldID(name) {
    return "field_id_" + name.replace(CONST_1["default"].REGEX.ANY_SPACE, '_').toUpperCase();
}
exports.generateFieldID = generateFieldID;
/**
 * Gets the initial value for a report field.
 */
function getReportFieldInitialValue(reportField) {
    var _a, _b;
    if (!reportField) {
        return '';
    }
    if (reportField.type === CONST_1["default"].REPORT_FIELD_TYPES.LIST) {
        return (_a = reportField.defaultValue) !== null && _a !== void 0 ? _a : '';
    }
    if (reportField.type === CONST_1["default"].REPORT_FIELD_TYPES.DATE) {
        return Localize.translateLocal('common.initialValue');
    }
    return (_b = reportField.value) !== null && _b !== void 0 ? _b : reportField.defaultValue;
}
exports.getReportFieldInitialValue = getReportFieldInitialValue;
