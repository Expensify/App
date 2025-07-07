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
exports.getTrackingCategories = exports.getXeroSetupLink = void 0;
exports.updateXeroImportTrackingCategories = updateXeroImportTrackingCategories;
exports.updateXeroImportTaxRates = updateXeroImportTaxRates;
exports.updateXeroTenantID = updateXeroTenantID;
exports.updateXeroMappings = updateXeroMappings;
exports.updateXeroImportCustomers = updateXeroImportCustomers;
exports.updateXeroEnableNewCategories = updateXeroEnableNewCategories;
exports.updateXeroAutoSync = updateXeroAutoSync;
exports.updateXeroExportBillStatus = updateXeroExportBillStatus;
exports.updateXeroExportExporter = updateXeroExportExporter;
exports.updateXeroExportBillDate = updateXeroExportBillDate;
exports.updateXeroExportNonReimbursableAccount = updateXeroExportNonReimbursableAccount;
exports.updateXeroSyncInvoiceCollectionsAccountID = updateXeroSyncInvoiceCollectionsAccountID;
exports.updateXeroSyncSyncReimbursedReports = updateXeroSyncSyncReimbursedReports;
exports.updateXeroSyncReimbursementAccountID = updateXeroSyncReimbursementAccountID;
var isObject_1 = require("lodash/isObject");
var react_native_onyx_1 = require("react-native-onyx");
var API = require("@libs/API");
var types_1 = require("@libs/API/types");
var ApiUtils_1 = require("@libs/ApiUtils");
var ErrorUtils = require("@libs/ErrorUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var getXeroSetupLink = function (policyID) {
    var params = { policyID: policyID };
    var commandURL = (0, ApiUtils_1.getCommandURL)({ command: types_1.READ_COMMANDS.CONNECT_POLICY_TO_XERO, shouldSkipWebProxy: true });
    return commandURL + new URLSearchParams(params).toString();
};
exports.getXeroSetupLink = getXeroSetupLink;
var getTrackingCategories = function (policy) {
    var _a, _b, _c, _d, _e, _f;
    var trackingCategories = ((_c = (_b = (_a = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _a === void 0 ? void 0 : _a.xero) === null || _b === void 0 ? void 0 : _b.data) !== null && _c !== void 0 ? _c : {}).trackingCategories;
    var mappings = ((_f = (_e = (_d = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _d === void 0 ? void 0 : _d.xero) === null || _e === void 0 ? void 0 : _e.config) !== null && _f !== void 0 ? _f : {}).mappings;
    if (!trackingCategories) {
        return [];
    }
    return trackingCategories.map(function (category) {
        var _a;
        return (__assign(__assign({}, category), { value: (_a = mappings === null || mappings === void 0 ? void 0 : mappings["".concat(CONST_1.default.XERO_CONFIG.TRACKING_CATEGORY_PREFIX).concat(category.id)]) !== null && _a !== void 0 ? _a : '' }));
    });
};
exports.getTrackingCategories = getTrackingCategories;
function createXeroPendingFields(settingName, settingValue, pendingValue) {
    var _a;
    if (!(0, isObject_1.default)(settingValue)) {
        return _a = {}, _a[settingName] = pendingValue, _a;
    }
    return Object.keys(settingValue).reduce(function (acc, setting) {
        acc[setting] = pendingValue;
        return acc;
    }, {});
}
function createXeroExportPendingFields(settingName, settingValue, pendingValue) {
    var _a;
    if (!(0, isObject_1.default)(settingValue)) {
        return _a = {}, _a[settingName] = pendingValue, _a;
    }
    return Object.keys(settingValue).reduce(function (acc, setting) {
        acc[setting] = pendingValue;
        return acc;
    }, {});
}
function createXeroSyncPendingFields(settingName, settingValue, pendingValue) {
    var _a;
    if (!(0, isObject_1.default)(settingValue)) {
        return _a = {}, _a[settingName] = pendingValue, _a;
    }
    return Object.keys(settingValue).reduce(function (acc, setting) {
        acc[setting] = pendingValue;
        return acc;
    }, {});
}
function createXeroErrorFields(settingName, settingValue, errorValue) {
    var _a;
    if (!(0, isObject_1.default)(settingValue)) {
        return _a = {}, _a[settingName] = errorValue, _a;
    }
    return Object.keys(settingValue).reduce(function (acc, setting) {
        acc[setting] = errorValue;
        return acc;
    }, {});
}
function createXeroExportErrorFields(settingName, settingValue, errorValue) {
    var _a;
    if (!(0, isObject_1.default)(settingValue)) {
        return _a = {}, _a[settingName] = errorValue, _a;
    }
    return Object.keys(settingValue).reduce(function (acc, setting) {
        acc[setting] = errorValue;
        return acc;
    }, {});
}
function createXeroSyncErrorFields(settingName, settingValue, errorValue) {
    var _a;
    if (!(0, isObject_1.default)(settingValue)) {
        return _a = {}, _a[settingName] = errorValue, _a;
    }
    return Object.keys(settingValue).reduce(function (acc, setting) {
        acc[setting] = errorValue;
        return acc;
    }, {});
}
function prepareXeroOptimisticData(policyID, settingName, settingValue, oldSettingValue) {
    var _a, _b;
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                connections: {
                    xero: {
                        config: (_a = {},
                            _a[settingName] = settingValue !== null && settingValue !== void 0 ? settingValue : null,
                            _a.pendingFields = createXeroPendingFields(settingName, settingValue, CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE),
                            _a.errorFields = createXeroErrorFields(settingName, settingValue, null),
                            _a),
                    },
                },
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                connections: {
                    xero: {
                        config: (_b = {},
                            _b[settingName] = oldSettingValue !== null && oldSettingValue !== void 0 ? oldSettingValue : null,
                            _b.pendingFields = createXeroPendingFields(settingName, settingValue, null),
                            _b.errorFields = createXeroErrorFields(settingName, settingValue, ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage')),
                            _b),
                    },
                },
            },
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                connections: {
                    xero: {
                        config: {
                            pendingFields: createXeroPendingFields(settingName, settingValue, null),
                            errorFields: createXeroErrorFields(settingName, settingValue, null),
                        },
                    },
                },
            },
        },
    ];
    return { optimisticData: optimisticData, failureData: failureData, successData: successData };
}
function prepareXeroExportOptimisticData(policyID, settingName, settingValue, oldSettingValue) {
    var _a, _b;
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                connections: {
                    xero: {
                        config: {
                            export: (_a = {},
                                _a[settingName] = settingValue !== null && settingValue !== void 0 ? settingValue : null,
                                _a),
                            pendingFields: createXeroExportPendingFields(settingName, settingValue, CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE),
                            errorFields: createXeroExportErrorFields(settingName, settingValue, null),
                        },
                    },
                },
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                connections: {
                    xero: {
                        config: {
                            export: (_b = {},
                                _b[settingName] = oldSettingValue !== null && oldSettingValue !== void 0 ? oldSettingValue : null,
                                _b),
                            pendingFields: createXeroExportPendingFields(settingName, settingValue, null),
                            errorFields: createXeroExportErrorFields(settingName, settingValue, ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage')),
                        },
                    },
                },
            },
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                connections: {
                    xero: {
                        config: {
                            pendingFields: createXeroExportPendingFields(settingName, settingValue, null),
                            errorFields: createXeroExportErrorFields(settingName, settingValue, null),
                        },
                    },
                },
            },
        },
    ];
    return { optimisticData: optimisticData, failureData: failureData, successData: successData };
}
function prepareXeroSyncOptimisticData(policyID, settingName, settingValue, oldSettingValue) {
    var _a, _b;
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                connections: {
                    xero: {
                        config: {
                            sync: (_a = {},
                                _a[settingName] = settingValue !== null && settingValue !== void 0 ? settingValue : null,
                                _a),
                            pendingFields: createXeroSyncPendingFields(settingName, settingValue, CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE),
                            errorFields: createXeroSyncErrorFields(settingName, settingValue, null),
                        },
                    },
                },
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                connections: {
                    xero: {
                        config: {
                            sync: (_b = {},
                                _b[settingName] = oldSettingValue !== null && oldSettingValue !== void 0 ? oldSettingValue : null,
                                _b),
                            pendingFields: createXeroSyncPendingFields(settingName, settingValue, null),
                            errorFields: createXeroSyncErrorFields(settingName, settingValue, ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage')),
                        },
                    },
                },
            },
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                connections: {
                    xero: {
                        config: {
                            pendingFields: createXeroSyncPendingFields(settingName, settingValue, null),
                            errorFields: createXeroSyncErrorFields(settingName, settingValue, null),
                        },
                    },
                },
            },
        },
    ];
    return { optimisticData: optimisticData, failureData: failureData, successData: successData };
}
function updateXeroImportTrackingCategories(policyID, importTrackingCategories, oldImportTrackingCategories) {
    var parameters = {
        policyID: policyID,
        settingValue: JSON.stringify(importTrackingCategories),
        idempotencyKey: String(CONST_1.default.XERO_CONFIG.IMPORT_TRACKING_CATEGORIES),
    };
    var _a = prepareXeroOptimisticData(policyID, CONST_1.default.XERO_CONFIG.IMPORT_TRACKING_CATEGORIES, importTrackingCategories, oldImportTrackingCategories), optimisticData = _a.optimisticData, failureData = _a.failureData, successData = _a.successData;
    API.write(types_1.WRITE_COMMANDS.UPDATE_XERO_IMPORT_TRACKING_CATEGORIES, parameters, { optimisticData: optimisticData, failureData: failureData, successData: successData });
}
function updateXeroImportTaxRates(policyID, importTaxesRate, oldImportTaxesRate) {
    var parameters = {
        policyID: policyID,
        settingValue: JSON.stringify(importTaxesRate),
        idempotencyKey: String(CONST_1.default.XERO_CONFIG.IMPORT_TAX_RATES),
    };
    var _a = prepareXeroOptimisticData(policyID, CONST_1.default.XERO_CONFIG.IMPORT_TAX_RATES, importTaxesRate, oldImportTaxesRate), optimisticData = _a.optimisticData, failureData = _a.failureData, successData = _a.successData;
    API.write(types_1.WRITE_COMMANDS.UPDATE_XERO_IMPORT_TAX_RATES, parameters, { optimisticData: optimisticData, failureData: failureData, successData: successData });
}
function updateXeroTenantID(policyID, settingValue, oldSettingValue) {
    var parameters = {
        policyID: policyID,
        settingValue: JSON.stringify(settingValue),
        idempotencyKey: String(CONST_1.default.XERO_CONFIG.TENANT_ID),
    };
    var _a = prepareXeroOptimisticData(policyID, CONST_1.default.XERO_CONFIG.TENANT_ID, settingValue, oldSettingValue), optimisticData = _a.optimisticData, successData = _a.successData, failureData = _a.failureData;
    API.write(types_1.WRITE_COMMANDS.UPDATE_XERO_TENANT_ID, parameters, { optimisticData: optimisticData, successData: successData, failureData: failureData });
}
function updateXeroMappings(policyID, mappingValue, oldMappingValue) {
    var parameters = {
        policyID: policyID,
        settingValue: JSON.stringify(mappingValue),
        idempotencyKey: String(CONST_1.default.XERO_CONFIG.MAPPINGS),
    };
    var _a = prepareXeroOptimisticData(policyID, CONST_1.default.XERO_CONFIG.MAPPINGS, mappingValue, oldMappingValue), optimisticData = _a.optimisticData, failureData = _a.failureData, successData = _a.successData;
    API.write(types_1.WRITE_COMMANDS.UPDATE_XERO_MAPPING, parameters, { optimisticData: optimisticData, failureData: failureData, successData: successData });
}
function updateXeroImportCustomers(policyID, importCustomers, oldImportCustomers) {
    var parameters = {
        policyID: policyID,
        settingValue: JSON.stringify(importCustomers),
        idempotencyKey: String(CONST_1.default.XERO_CONFIG.IMPORT_CUSTOMERS),
    };
    var _a = prepareXeroOptimisticData(policyID, CONST_1.default.XERO_CONFIG.IMPORT_CUSTOMERS, importCustomers, oldImportCustomers), optimisticData = _a.optimisticData, failureData = _a.failureData, successData = _a.successData;
    API.write(types_1.WRITE_COMMANDS.UPDATE_XERO_IMPORT_CUSTOMERS, parameters, { optimisticData: optimisticData, failureData: failureData, successData: successData });
}
function updateXeroEnableNewCategories(policyID, enableNewCategories, oldEnableNewCategories) {
    var parameters = {
        policyID: policyID,
        settingValue: JSON.stringify(enableNewCategories),
        idempotencyKey: String(CONST_1.default.XERO_CONFIG.ENABLE_NEW_CATEGORIES),
    };
    var _a = prepareXeroOptimisticData(policyID, CONST_1.default.XERO_CONFIG.ENABLE_NEW_CATEGORIES, enableNewCategories, oldEnableNewCategories), optimisticData = _a.optimisticData, failureData = _a.failureData, successData = _a.successData;
    API.write(types_1.WRITE_COMMANDS.UPDATE_XERO_ENABLE_NEW_CATEGORIES, parameters, { optimisticData: optimisticData, failureData: failureData, successData: successData });
}
function updateXeroAutoSync(policyID, autoSync, oldAutoSync) {
    var parameters = {
        policyID: policyID,
        settingValue: JSON.stringify(autoSync),
        idempotencyKey: String(CONST_1.default.XERO_CONFIG.AUTO_SYNC),
    };
    var _a = prepareXeroOptimisticData(policyID, CONST_1.default.XERO_CONFIG.AUTO_SYNC, autoSync, oldAutoSync), optimisticData = _a.optimisticData, failureData = _a.failureData, successData = _a.successData;
    API.write(types_1.WRITE_COMMANDS.UPDATE_XERO_AUTO_SYNC, parameters, { optimisticData: optimisticData, failureData: failureData, successData: successData });
}
function updateXeroExportBillStatus(policyID, billStatus, oldBillStatus) {
    var parameters = {
        policyID: policyID,
        settingValue: JSON.stringify(billStatus),
        idempotencyKey: String(CONST_1.default.XERO_CONFIG.BILL_STATUS),
    };
    var _a = prepareXeroExportOptimisticData(policyID, CONST_1.default.XERO_CONFIG.BILL_STATUS, billStatus, oldBillStatus), optimisticData = _a.optimisticData, failureData = _a.failureData, successData = _a.successData;
    API.write(types_1.WRITE_COMMANDS.UPDATE_XERO_EXPORT_BILL_STATUS, parameters, { optimisticData: optimisticData, failureData: failureData, successData: successData });
}
function updateXeroExportExporter(policyID, exporter, oldExporter) {
    var parameters = {
        policyID: policyID,
        settingValue: exporter,
        idempotencyKey: String(CONST_1.default.XERO_CONFIG.EXPORTER),
    };
    var _a = prepareXeroExportOptimisticData(policyID, CONST_1.default.XERO_CONFIG.EXPORTER, exporter, oldExporter), optimisticData = _a.optimisticData, failureData = _a.failureData, successData = _a.successData;
    API.write(types_1.WRITE_COMMANDS.UPDATE_XERO_EXPORT_EXPORTER, parameters, { optimisticData: optimisticData, failureData: failureData, successData: successData });
}
function updateXeroExportBillDate(policyID, billDate, oldBillDate) {
    var parameters = {
        policyID: policyID,
        settingValue: billDate,
        idempotencyKey: String(CONST_1.default.XERO_CONFIG.BILL_DATE),
    };
    var _a = prepareXeroExportOptimisticData(policyID, CONST_1.default.XERO_CONFIG.BILL_DATE, billDate, oldBillDate), optimisticData = _a.optimisticData, failureData = _a.failureData, successData = _a.successData;
    API.write(types_1.WRITE_COMMANDS.UPDATE_XERO_EXPORT_BILL_DATE, parameters, { optimisticData: optimisticData, failureData: failureData, successData: successData });
}
function updateXeroExportNonReimbursableAccount(policyID, nonReimbursableAccount, oldNonReimbursableAccount) {
    var parameters = {
        policyID: policyID,
        settingValue: nonReimbursableAccount,
        idempotencyKey: String(CONST_1.default.XERO_CONFIG.NON_REIMBURSABLE_ACCOUNT),
    };
    var _a = prepareXeroExportOptimisticData(policyID, CONST_1.default.XERO_CONFIG.NON_REIMBURSABLE_ACCOUNT, nonReimbursableAccount, oldNonReimbursableAccount), optimisticData = _a.optimisticData, failureData = _a.failureData, successData = _a.successData;
    API.write(types_1.WRITE_COMMANDS.UPDATE_XERO_EXPORT_NON_REIMBURSABLE_ACCOUNT, parameters, { optimisticData: optimisticData, failureData: failureData, successData: successData });
}
function updateXeroSyncInvoiceCollectionsAccountID(policyID, invoiceCollectionsAccountID, oldInvoiceCollectionsAccountID) {
    var parameters = {
        policyID: policyID,
        settingValue: invoiceCollectionsAccountID,
        idempotencyKey: String(CONST_1.default.XERO_CONFIG.INVOICE_COLLECTIONS_ACCOUNT_ID),
    };
    var _a = prepareXeroSyncOptimisticData(policyID, CONST_1.default.XERO_CONFIG.INVOICE_COLLECTIONS_ACCOUNT_ID, invoiceCollectionsAccountID, oldInvoiceCollectionsAccountID), optimisticData = _a.optimisticData, failureData = _a.failureData, successData = _a.successData;
    API.write(types_1.WRITE_COMMANDS.UPDATE_XERO_SYNC_INVOICE_COLLECTIONS_ACCOUNT_ID, parameters, { optimisticData: optimisticData, failureData: failureData, successData: successData });
}
function updateXeroSyncReimbursementAccountID(policyID, reimbursementAccountID, oldReimbursementAccountID) {
    var parameters = {
        policyID: policyID,
        settingValue: reimbursementAccountID,
        idempotencyKey: String(CONST_1.default.XERO_CONFIG.REIMBURSEMENT_ACCOUNT_ID),
    };
    var _a = prepareXeroSyncOptimisticData(policyID, CONST_1.default.XERO_CONFIG.REIMBURSEMENT_ACCOUNT_ID, reimbursementAccountID, oldReimbursementAccountID), optimisticData = _a.optimisticData, failureData = _a.failureData, successData = _a.successData;
    API.write(types_1.WRITE_COMMANDS.UPDATE_XERO_SYNC_REIMBURSEMENT_ACCOUNT_ID, parameters, { optimisticData: optimisticData, failureData: failureData, successData: successData });
}
function updateXeroSyncSyncReimbursedReports(policyID, syncReimbursedReports, oldSyncReimbursedReports) {
    var parameters = {
        policyID: policyID,
        settingValue: JSON.stringify(syncReimbursedReports),
        idempotencyKey: String(CONST_1.default.XERO_CONFIG.SYNC_REIMBURSED_REPORTS),
    };
    var _a = prepareXeroSyncOptimisticData(policyID, CONST_1.default.XERO_CONFIG.SYNC_REIMBURSED_REPORTS, syncReimbursedReports, oldSyncReimbursedReports), optimisticData = _a.optimisticData, failureData = _a.failureData, successData = _a.successData;
    API.write(types_1.WRITE_COMMANDS.UPDATE_XERO_SYNC_SYNC_REIMBURSED_REPORTS, parameters, { optimisticData: optimisticData, failureData: failureData, successData: successData });
}
