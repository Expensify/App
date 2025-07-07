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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.setInitialCreateReportFieldsForm = setInitialCreateReportFieldsForm;
exports.createReportFieldsListValue = createReportFieldsListValue;
exports.renameReportFieldsListValue = renameReportFieldsListValue;
exports.setReportFieldsListValueEnabled = setReportFieldsListValueEnabled;
exports.deleteReportFieldsListValue = deleteReportFieldsListValue;
exports.createReportField = createReportField;
exports.deleteReportFields = deleteReportFields;
exports.updateReportFieldInitialValue = updateReportFieldInitialValue;
exports.updateReportFieldListValueEnabled = updateReportFieldListValueEnabled;
exports.openPolicyReportFieldsPage = openPolicyReportFieldsPage;
exports.addReportFieldListValue = addReportFieldListValue;
exports.removeReportFieldListValue = removeReportFieldListValue;
var cloneDeep_1 = require("lodash/cloneDeep");
var react_native_onyx_1 = require("react-native-onyx");
var API = require("@libs/API");
var types_1 = require("@libs/API/types");
var ErrorUtils = require("@libs/ErrorUtils");
var Log_1 = require("@libs/Log");
var ReportUtils = require("@libs/ReportUtils");
var WorkspaceReportFieldUtils = require("@libs/WorkspaceReportFieldUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var WorkspaceReportFieldForm_1 = require("@src/types/form/WorkspaceReportFieldForm");
var listValues;
var disabledListValues;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.FORMS.WORKSPACE_REPORT_FIELDS_FORM_DRAFT,
    callback: function (value) {
        var _a, _b;
        if (!value) {
            return;
        }
        listValues = (_a = value[WorkspaceReportFieldForm_1.default.LIST_VALUES]) !== null && _a !== void 0 ? _a : [];
        disabledListValues = (_b = value[WorkspaceReportFieldForm_1.default.DISABLED_LIST_VALUES]) !== null && _b !== void 0 ? _b : [];
    },
});
var allReports;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback: function (value) {
        allReports = value;
    },
});
var allPolicies = {};
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.COLLECTION.POLICY,
    callback: function (value, key) {
        if (!key) {
            return;
        }
        if (value === null || value === undefined) {
            // If we are deleting a policy, we have to check every report linked to that policy
            // and unset the draft indicator (pencil icon) alongside removing any draft comments. Clearing these values will keep the newly archived chats from being displayed in the LHN.
            // More info: https://github.com/Expensify/App/issues/14260
            var policyID = key.replace(ONYXKEYS_1.default.COLLECTION.POLICY, '');
            var policyReports = ReportUtils.getAllPolicyReports(policyID);
            var cleanUpMergeQueries = {};
            var cleanUpSetQueries_1 = {};
            policyReports.forEach(function (policyReport) {
                if (!policyReport) {
                    return;
                }
                var reportID = policyReport.reportID;
                cleanUpSetQueries_1["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_DRAFT_COMMENT).concat(reportID)] = null;
                cleanUpSetQueries_1["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS_DRAFTS).concat(reportID)] = null;
            });
            react_native_onyx_1.default.mergeCollection(ONYXKEYS_1.default.COLLECTION.REPORT, cleanUpMergeQueries);
            react_native_onyx_1.default.multiSet(cleanUpSetQueries_1);
            delete allPolicies[key];
            return;
        }
        allPolicies[key] = value;
    },
});
function openPolicyReportFieldsPage(policyID) {
    if (!policyID) {
        Log_1.default.warn('openPolicyReportFieldsPage invalid params', { policyID: policyID });
        return;
    }
    var params = {
        policyID: policyID,
    };
    API.read(types_1.READ_COMMANDS.OPEN_POLICY_REPORT_FIELDS_PAGE, params);
}
/**
 * Sets the initial form values for the workspace report fields form.
 */
function setInitialCreateReportFieldsForm() {
    var _a;
    react_native_onyx_1.default.set(ONYXKEYS_1.default.FORMS.WORKSPACE_REPORT_FIELDS_FORM_DRAFT, (_a = {},
        _a[WorkspaceReportFieldForm_1.default.INITIAL_VALUE] = '',
        _a));
}
/**
 * Creates a new list value in the workspace report fields form.
 */
function createReportFieldsListValue(valueName) {
    var _a;
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.FORMS.WORKSPACE_REPORT_FIELDS_FORM_DRAFT, (_a = {},
        _a[WorkspaceReportFieldForm_1.default.LIST_VALUES] = __spreadArray(__spreadArray([], listValues, true), [valueName], false),
        _a[WorkspaceReportFieldForm_1.default.DISABLED_LIST_VALUES] = __spreadArray(__spreadArray([], disabledListValues, true), [false], false),
        _a));
}
/**
 * Renames a list value in the workspace report fields form.
 */
function renameReportFieldsListValue(valueIndex, newValueName) {
    var _a;
    var listValuesCopy = __spreadArray([], listValues, true);
    listValuesCopy[valueIndex] = newValueName;
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.FORMS.WORKSPACE_REPORT_FIELDS_FORM_DRAFT, (_a = {},
        _a[WorkspaceReportFieldForm_1.default.LIST_VALUES] = listValuesCopy,
        _a));
}
/**
 * Sets the enabled state of a list value in the workspace report fields form.
 */
function setReportFieldsListValueEnabled(valueIndexes, enabled) {
    var _a;
    var disabledListValuesCopy = __spreadArray([], disabledListValues, true);
    valueIndexes.forEach(function (valueIndex) {
        disabledListValuesCopy[valueIndex] = !enabled;
    });
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.FORMS.WORKSPACE_REPORT_FIELDS_FORM_DRAFT, (_a = {},
        _a[WorkspaceReportFieldForm_1.default.DISABLED_LIST_VALUES] = disabledListValuesCopy,
        _a));
}
/**
 * Deletes a list value from the workspace report fields form.
 */
function deleteReportFieldsListValue(valueIndexes) {
    var _a;
    var listValuesCopy = __spreadArray([], listValues, true);
    var disabledListValuesCopy = __spreadArray([], disabledListValues, true);
    valueIndexes
        .sort(function (a, b) { return b - a; })
        .forEach(function (valueIndex) {
        listValuesCopy.splice(valueIndex, 1);
        disabledListValuesCopy.splice(valueIndex, 1);
    });
    react_native_onyx_1.default.merge(ONYXKEYS_1.default.FORMS.WORKSPACE_REPORT_FIELDS_FORM_DRAFT, (_a = {},
        _a[WorkspaceReportFieldForm_1.default.LIST_VALUES] = listValuesCopy,
        _a[WorkspaceReportFieldForm_1.default.DISABLED_LIST_VALUES] = disabledListValuesCopy,
        _a));
}
/**
 * Creates a new report field.
 */
function createReportField(policyID, _a) {
    var _b, _c, _d, _e;
    var _f, _g;
    var name = _a.name, type = _a.type, initialValue = _a.initialValue;
    var previousFieldList = (_g = (_f = allPolicies === null || allPolicies === void 0 ? void 0 : allPolicies["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID)]) === null || _f === void 0 ? void 0 : _f.fieldList) !== null && _g !== void 0 ? _g : {};
    var fieldID = WorkspaceReportFieldUtils.generateFieldID(name);
    var fieldKey = ReportUtils.getReportFieldKey(fieldID);
    var optimisticReportFieldDataForPolicy = {
        name: name,
        type: type,
        target: 'expense',
        defaultValue: initialValue,
        values: listValues,
        disabledOptions: disabledListValues,
        fieldID: fieldID,
        orderWeight: Object.keys(previousFieldList).length + 1,
        deletable: false,
        keys: [],
        externalIDs: [],
        isTax: false,
    };
    var policyExpenseReports = Object.values(allReports !== null && allReports !== void 0 ? allReports : {}).filter(function (report) { return (report === null || report === void 0 ? void 0 : report.policyID) === policyID && report.type === CONST_1.default.REPORT.TYPE.EXPENSE; });
    var optimisticData = __spreadArray([
        {
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            value: {
                fieldList: (_b = {},
                    _b[fieldKey] = __assign(__assign({}, optimisticReportFieldDataForPolicy), { pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD }),
                    _b),
                errorFields: null,
            },
        }
    ], policyExpenseReports.map(function (report) {
        var _a;
        return ({
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report.reportID),
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            value: {
                fieldList: (_a = {},
                    _a[fieldKey] = __assign(__assign({}, optimisticReportFieldDataForPolicy), { pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD }),
                    _a),
            },
        });
    }), true);
    var failureData = __spreadArray([
        {
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            value: {
                fieldList: (_c = {},
                    _c[fieldKey] = null,
                    _c),
                errorFields: (_d = {},
                    _d[fieldKey] = ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('workspace.reportFields.genericFailureMessage'),
                    _d),
            },
        }
    ], policyExpenseReports.map(function (report) {
        var _a;
        return ({
            key: "".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report.reportID),
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            value: {
                fieldList: (_a = {},
                    _a[fieldKey] = null,
                    _a),
            },
        });
    }), true);
    var onyxData = {
        optimisticData: optimisticData,
        successData: [
            {
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                value: {
                    fieldList: (_e = {},
                        _e[fieldKey] = { pendingAction: null },
                        _e),
                    errorFields: null,
                },
            },
        ],
        failureData: failureData,
    };
    var parameters = {
        policyID: policyID,
        reportFields: JSON.stringify([optimisticReportFieldDataForPolicy]),
    };
    API.write(types_1.WRITE_COMMANDS.CREATE_WORKSPACE_REPORT_FIELD, parameters, onyxData);
}
function deleteReportFields(policyID, reportFieldsToUpdate) {
    var _a;
    var policy = allPolicies === null || allPolicies === void 0 ? void 0 : allPolicies["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID)];
    var allReportFields = (_a = policy === null || policy === void 0 ? void 0 : policy.fieldList) !== null && _a !== void 0 ? _a : {};
    var updatedReportFields = Object.fromEntries(Object.entries(allReportFields).filter(function (_a) {
        var key = _a[0];
        return !reportFieldsToUpdate.includes(key);
    }));
    var optimisticReportFields = reportFieldsToUpdate.reduce(function (acc, reportFieldKey) {
        acc[reportFieldKey] = { pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE };
        return acc;
    }, {});
    var successReportFields = reportFieldsToUpdate.reduce(function (acc, reportFieldKey) {
        acc[reportFieldKey] = null;
        return acc;
    }, {});
    var failureReportFields = reportFieldsToUpdate.reduce(function (acc, reportFieldKey) {
        acc[reportFieldKey] = { pendingAction: null };
        return acc;
    }, {});
    var onyxData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    fieldList: optimisticReportFields,
                },
            },
        ],
        successData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    fieldList: successReportFields,
                    errorFields: null,
                },
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    fieldList: failureReportFields,
                    errorFields: {
                        fieldList: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                    },
                },
            },
        ],
    };
    var parameters = {
        policyID: policyID,
        reportFields: JSON.stringify(Object.values(updatedReportFields)),
    };
    API.write(types_1.WRITE_COMMANDS.DELETE_POLICY_REPORT_FIELD, parameters, onyxData);
}
/**
 * Updates the initial value of a report field.
 */
function updateReportFieldInitialValue(policyID, reportFieldID, newInitialValue) {
    var _a, _b, _c, _d;
    var _e, _f;
    var previousFieldList = (_f = (_e = allPolicies === null || allPolicies === void 0 ? void 0 : allPolicies["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID)]) === null || _e === void 0 ? void 0 : _e.fieldList) !== null && _f !== void 0 ? _f : {};
    var fieldKey = ReportUtils.getReportFieldKey(reportFieldID);
    var updatedReportField = __assign(__assign({}, previousFieldList[fieldKey]), { defaultValue: newInitialValue });
    var onyxData = {
        optimisticData: [
            {
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                value: {
                    fieldList: (_a = {},
                        _a[fieldKey] = __assign(__assign({}, updatedReportField), { pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE }),
                        _a),
                    errorFields: null,
                },
            },
        ],
        successData: [
            {
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                value: {
                    fieldList: (_b = {},
                        _b[fieldKey] = { pendingAction: null },
                        _b),
                    errorFields: null,
                },
            },
        ],
        failureData: [
            {
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                value: {
                    fieldList: (_c = {},
                        _c[fieldKey] = __assign(__assign({}, previousFieldList[fieldKey]), { pendingAction: null }),
                        _c),
                    errorFields: (_d = {},
                        _d[fieldKey] = ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('workspace.reportFields.genericFailureMessage'),
                        _d),
                },
            },
        ],
    };
    var parameters = {
        policyID: policyID,
        reportFields: JSON.stringify([updatedReportField]),
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_WORKSPACE_REPORT_FIELD_INITIAL_VALUE, parameters, onyxData);
}
function updateReportFieldListValueEnabled(policyID, reportFieldID, valueIndexes, enabled) {
    var _a;
    var _b, _c;
    var previousFieldList = (_c = (_b = allPolicies === null || allPolicies === void 0 ? void 0 : allPolicies["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID)]) === null || _b === void 0 ? void 0 : _b.fieldList) !== null && _c !== void 0 ? _c : {};
    var fieldKey = ReportUtils.getReportFieldKey(reportFieldID);
    var reportField = previousFieldList[fieldKey];
    var updatedReportField = (0, cloneDeep_1.default)(reportField);
    valueIndexes.forEach(function (valueIndex) {
        updatedReportField.disabledOptions[valueIndex] = !enabled;
        var shouldResetDefaultValue = !enabled && reportField.defaultValue === reportField.values.at(valueIndex);
        if (shouldResetDefaultValue) {
            updatedReportField.defaultValue = '';
        }
    });
    // We are using the offline pattern A (optimistic without feedback)
    var onyxData = {
        optimisticData: [
            {
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                value: {
                    fieldList: (_a = {},
                        _a[fieldKey] = updatedReportField,
                        _a),
                },
            },
        ],
    };
    var parameters = {
        policyID: policyID,
        reportFields: JSON.stringify([updatedReportField]),
    };
    API.write(types_1.WRITE_COMMANDS.ENABLE_WORKSPACE_REPORT_FIELD_LIST_VALUE, parameters, onyxData);
}
/**
 * Adds a new option to the list type report field on a workspace.
 */
function addReportFieldListValue(policyID, reportFieldID, valueName) {
    var _a;
    var _b, _c;
    var previousFieldList = (_c = (_b = allPolicies === null || allPolicies === void 0 ? void 0 : allPolicies["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID)]) === null || _b === void 0 ? void 0 : _b.fieldList) !== null && _c !== void 0 ? _c : {};
    var reportFieldKey = ReportUtils.getReportFieldKey(reportFieldID);
    var reportField = previousFieldList[reportFieldKey];
    var updatedReportField = (0, cloneDeep_1.default)(reportField);
    updatedReportField.values.push(valueName);
    updatedReportField.disabledOptions.push(false);
    // We are using the offline pattern A (optimistic without feedback)
    var onyxData = {
        optimisticData: [
            {
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                value: {
                    fieldList: (_a = {},
                        _a[reportFieldKey] = updatedReportField,
                        _a),
                },
            },
        ],
    };
    var parameters = {
        policyID: policyID,
        reportFields: JSON.stringify([updatedReportField]),
    };
    API.write(types_1.WRITE_COMMANDS.CREATE_WORKSPACE_REPORT_FIELD_LIST_VALUE, parameters, onyxData);
}
/**
 * Removes a list value from the workspace report fields.
 */
function removeReportFieldListValue(policyID, reportFieldID, valueIndexes) {
    var _a;
    var _b, _c;
    var previousFieldList = (_c = (_b = allPolicies === null || allPolicies === void 0 ? void 0 : allPolicies["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID)]) === null || _b === void 0 ? void 0 : _b.fieldList) !== null && _c !== void 0 ? _c : {};
    var reportFieldKey = ReportUtils.getReportFieldKey(reportFieldID);
    var reportField = previousFieldList[reportFieldKey];
    var updatedReportField = (0, cloneDeep_1.default)(reportField);
    valueIndexes
        .sort(function (a, b) { return b - a; })
        .forEach(function (valueIndex) {
        var shouldResetDefaultValue = reportField.defaultValue === reportField.values.at(valueIndex);
        if (shouldResetDefaultValue) {
            updatedReportField.defaultValue = '';
        }
        updatedReportField.values.splice(valueIndex, 1);
        updatedReportField.disabledOptions.splice(valueIndex, 1);
    });
    // We are using the offline pattern A (optimistic without feedback)
    var onyxData = {
        optimisticData: [
            {
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                value: {
                    fieldList: (_a = {},
                        _a[reportFieldKey] = updatedReportField,
                        _a),
                },
            },
        ],
    };
    var parameters = {
        policyID: policyID,
        reportFields: JSON.stringify([updatedReportField]),
    };
    API.write(types_1.WRITE_COMMANDS.REMOVE_WORKSPACE_REPORT_FIELD_LIST_VALUE, parameters, onyxData);
}
