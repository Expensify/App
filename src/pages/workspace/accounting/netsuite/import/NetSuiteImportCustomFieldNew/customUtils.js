"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSubstepValues = getSubstepValues;
exports.getCustomListInitialSubstep = getCustomListInitialSubstep;
exports.getCustomSegmentInitialSubstep = getCustomSegmentInitialSubstep;
var CONST_1 = require("@src/CONST");
var NetSuiteCustomFieldForm_1 = require("@src/types/form/NetSuiteCustomFieldForm");
function getCustomListInitialSubstep(values) {
    if (!values[NetSuiteCustomFieldForm_1.default.LIST_NAME]) {
        return CONST_1.default.NETSUITE_CUSTOM_FIELD_SUBSTEP_INDEXES.CUSTOM_LISTS.CUSTOM_LIST_PICKER;
    }
    if (!values[NetSuiteCustomFieldForm_1.default.TRANSACTION_FIELD_ID]) {
        return CONST_1.default.NETSUITE_CUSTOM_FIELD_SUBSTEP_INDEXES.CUSTOM_LISTS.TRANSACTION_FIELD_ID;
    }
    if (!values[NetSuiteCustomFieldForm_1.default.MAPPING]) {
        return CONST_1.default.NETSUITE_CUSTOM_FIELD_SUBSTEP_INDEXES.CUSTOM_LISTS.MAPPING;
    }
    return CONST_1.default.NETSUITE_CUSTOM_FIELD_SUBSTEP_INDEXES.CUSTOM_LISTS.CONFIRM;
}
function getCustomSegmentInitialSubstep(values) {
    if (!values[NetSuiteCustomFieldForm_1.default.SEGMENT_TYPE]) {
        return CONST_1.default.NETSUITE_CUSTOM_FIELD_SUBSTEP_INDEXES.CUSTOM_SEGMENTS.SEGMENT_TYPE;
    }
    if (!values[NetSuiteCustomFieldForm_1.default.SEGMENT_NAME]) {
        return CONST_1.default.NETSUITE_CUSTOM_FIELD_SUBSTEP_INDEXES.CUSTOM_SEGMENTS.SEGMENT_NAME;
    }
    if (!values[NetSuiteCustomFieldForm_1.default.INTERNAL_ID]) {
        return CONST_1.default.NETSUITE_CUSTOM_FIELD_SUBSTEP_INDEXES.CUSTOM_SEGMENTS.INTERNAL_ID;
    }
    if (!values[NetSuiteCustomFieldForm_1.default.SCRIPT_ID]) {
        return CONST_1.default.NETSUITE_CUSTOM_FIELD_SUBSTEP_INDEXES.CUSTOM_SEGMENTS.SCRIPT_ID;
    }
    if (!values[NetSuiteCustomFieldForm_1.default.MAPPING]) {
        return CONST_1.default.NETSUITE_CUSTOM_FIELD_SUBSTEP_INDEXES.CUSTOM_SEGMENTS.MAPPING;
    }
    return CONST_1.default.NETSUITE_CUSTOM_FIELD_SUBSTEP_INDEXES.CUSTOM_SEGMENTS.CONFIRM;
}
function getSubstepValues(NetSuitCustomFieldDraft) {
    var _a;
    var _b, _c, _d, _e, _f, _g, _h;
    return _a = {},
        _a[NetSuiteCustomFieldForm_1.default.LIST_NAME] = (_b = NetSuitCustomFieldDraft === null || NetSuitCustomFieldDraft === void 0 ? void 0 : NetSuitCustomFieldDraft[NetSuiteCustomFieldForm_1.default.LIST_NAME]) !== null && _b !== void 0 ? _b : '',
        _a[NetSuiteCustomFieldForm_1.default.TRANSACTION_FIELD_ID] = (_c = NetSuitCustomFieldDraft === null || NetSuitCustomFieldDraft === void 0 ? void 0 : NetSuitCustomFieldDraft[NetSuiteCustomFieldForm_1.default.TRANSACTION_FIELD_ID]) !== null && _c !== void 0 ? _c : '',
        _a[NetSuiteCustomFieldForm_1.default.MAPPING] = (_d = NetSuitCustomFieldDraft === null || NetSuitCustomFieldDraft === void 0 ? void 0 : NetSuitCustomFieldDraft[NetSuiteCustomFieldForm_1.default.MAPPING]) !== null && _d !== void 0 ? _d : '',
        _a[NetSuiteCustomFieldForm_1.default.INTERNAL_ID] = (_e = NetSuitCustomFieldDraft === null || NetSuitCustomFieldDraft === void 0 ? void 0 : NetSuitCustomFieldDraft[NetSuiteCustomFieldForm_1.default.INTERNAL_ID]) !== null && _e !== void 0 ? _e : '',
        _a[NetSuiteCustomFieldForm_1.default.SCRIPT_ID] = (_f = NetSuitCustomFieldDraft === null || NetSuitCustomFieldDraft === void 0 ? void 0 : NetSuitCustomFieldDraft[NetSuiteCustomFieldForm_1.default.SCRIPT_ID]) !== null && _f !== void 0 ? _f : '',
        _a[NetSuiteCustomFieldForm_1.default.SEGMENT_TYPE] = (_g = NetSuitCustomFieldDraft === null || NetSuitCustomFieldDraft === void 0 ? void 0 : NetSuitCustomFieldDraft[NetSuiteCustomFieldForm_1.default.SEGMENT_TYPE]) !== null && _g !== void 0 ? _g : '',
        _a[NetSuiteCustomFieldForm_1.default.SEGMENT_NAME] = (_h = NetSuitCustomFieldDraft === null || NetSuitCustomFieldDraft === void 0 ? void 0 : NetSuitCustomFieldDraft[NetSuiteCustomFieldForm_1.default.SEGMENT_NAME]) !== null && _h !== void 0 ? _h : '',
        _a;
}
