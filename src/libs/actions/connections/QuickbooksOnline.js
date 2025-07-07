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
exports.shouldShowQBOReimbursableExportDestinationAccountError = shouldShowQBOReimbursableExportDestinationAccountError;
exports.getQuickbooksOnlineSetupLink = getQuickbooksOnlineSetupLink;
exports.updateQuickbooksOnlineEnableNewCategories = updateQuickbooksOnlineEnableNewCategories;
exports.updateQuickbooksOnlineAutoCreateVendor = updateQuickbooksOnlineAutoCreateVendor;
exports.updateQuickbooksOnlineReimbursableExpensesAccount = updateQuickbooksOnlineReimbursableExpensesAccount;
exports.updateQuickbooksOnlineAutoSync = updateQuickbooksOnlineAutoSync;
exports.updateQuickbooksOnlineSyncPeople = updateQuickbooksOnlineSyncPeople;
exports.updateQuickbooksOnlineReimbursementAccountID = updateQuickbooksOnlineReimbursementAccountID;
exports.updateQuickbooksOnlinePreferredExporter = updateQuickbooksOnlinePreferredExporter;
exports.updateQuickbooksOnlineReceivableAccount = updateQuickbooksOnlineReceivableAccount;
exports.updateQuickbooksOnlineExportDate = updateQuickbooksOnlineExportDate;
exports.updateQuickbooksOnlineNonReimbursableExpensesAccount = updateQuickbooksOnlineNonReimbursableExpensesAccount;
exports.updateQuickbooksOnlineCollectionAccountID = updateQuickbooksOnlineCollectionAccountID;
exports.updateQuickbooksOnlineNonReimbursableBillDefaultVendor = updateQuickbooksOnlineNonReimbursableBillDefaultVendor;
exports.updateQuickbooksOnlineSyncTax = updateQuickbooksOnlineSyncTax;
exports.updateQuickbooksOnlineSyncClasses = updateQuickbooksOnlineSyncClasses;
exports.updateQuickbooksOnlineSyncLocations = updateQuickbooksOnlineSyncLocations;
exports.updateQuickbooksOnlineSyncCustomers = updateQuickbooksOnlineSyncCustomers;
exports.updateQuickbooksOnlineAccountingMethod = updateQuickbooksOnlineAccountingMethod;
var react_native_onyx_1 = require("react-native-onyx");
var API = require("@libs/API");
var types_1 = require("@libs/API/types");
var ApiUtils_1 = require("@libs/ApiUtils");
var ErrorUtils = require("@libs/ErrorUtils");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
function getQuickbooksOnlineSetupLink(policyID) {
    var params = { policyID: policyID };
    var commandURL = (0, ApiUtils_1.getCommandURL)({
        command: types_1.READ_COMMANDS.CONNECT_POLICY_TO_QUICKBOOKS_ONLINE,
        shouldSkipWebProxy: true,
    });
    return commandURL + new URLSearchParams(params).toString();
}
function shouldShowQBOReimbursableExportDestinationAccountError(policy) {
    var _a, _b;
    var qboConfig = (_b = (_a = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _a === void 0 ? void 0 : _a.quickbooksOnline) === null || _b === void 0 ? void 0 : _b.config;
    return (0, PolicyUtils_1.isPolicyAdmin)(policy) && !!(qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.reimbursableExpensesExportDestination) && !qboConfig.reimbursableExpensesAccount;
}
function buildOnyxDataForMultipleQuickbooksConfigurations(policyID, configUpdate, configCurrentData) {
    var _a, _b, _c;
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                connections: (_a = {},
                    _a[CONST_1.default.POLICY.CONNECTIONS.NAME.QBO] = {
                        config: __assign(__assign({}, configUpdate), { pendingFields: Object.fromEntries(Object.keys(configUpdate).map(function (settingName) { return [settingName, CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE]; })), errorFields: Object.fromEntries(Object.keys(configUpdate).map(function (settingName) { return [settingName, null]; })) }),
                    },
                    _a),
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                connections: (_b = {},
                    _b[CONST_1.default.POLICY.CONNECTIONS.NAME.QBO] = {
                        config: __assign(__assign({}, configCurrentData), { pendingFields: Object.fromEntries(Object.keys(configUpdate).map(function (settingName) { return [settingName, null]; })), errorFields: Object.fromEntries(Object.keys(configUpdate).map(function (settingName) { return [settingName, ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage')]; })) }),
                    },
                    _b),
            },
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                connections: (_c = {},
                    _c[CONST_1.default.POLICY.CONNECTIONS.NAME.QBO] = {
                        config: {
                            pendingFields: Object.fromEntries(Object.keys(configUpdate).map(function (settingName) { return [settingName, null]; })),
                            errorFields: Object.fromEntries(Object.keys(configUpdate).map(function (settingName) { return [settingName, null]; })),
                        },
                    },
                    _c),
            },
        },
    ];
    return {
        optimisticData: optimisticData,
        failureData: failureData,
        successData: successData,
    };
}
function buildOnyxDataForQuickbooksConfiguration(policyID, settingName, settingValue, oldSettingValue) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    var exporterOptimisticData = settingName === CONST_1.default.QUICKBOOKS_CONFIG.EXPORT ? { exporter: settingValue } : {};
    var exporterErrorData = settingName === CONST_1.default.QUICKBOOKS_CONFIG.EXPORT ? { exporter: oldSettingValue } : {};
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: __assign(__assign({}, exporterOptimisticData), { connections: (_a = {},
                    _a[CONST_1.default.POLICY.CONNECTIONS.NAME.QBO] = {
                        config: (_b = {},
                            _b[settingName] = settingValue !== null && settingValue !== void 0 ? settingValue : null,
                            _b.pendingFields = (_c = {},
                                _c[settingName] = CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                                _c),
                            _b.errorFields = (_d = {},
                                _d[settingName] = null,
                                _d),
                            _b),
                    },
                    _a) }),
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: __assign(__assign({}, exporterErrorData), { connections: (_e = {},
                    _e[CONST_1.default.POLICY.CONNECTIONS.NAME.QBO] = {
                        config: (_f = {},
                            _f[settingName] = oldSettingValue !== null && oldSettingValue !== void 0 ? oldSettingValue : null,
                            _f.pendingFields = (_g = {},
                                _g[settingName] = null,
                                _g),
                            _f.errorFields = (_h = {},
                                _h[settingName] = ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                                _h),
                            _f),
                    },
                    _e) }),
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                connections: (_j = {},
                    _j[CONST_1.default.POLICY.CONNECTIONS.NAME.QBO] = {
                        config: (_k = {},
                            _k[settingName] = settingValue !== null && settingValue !== void 0 ? settingValue : null,
                            _k.pendingFields = (_l = {},
                                _l[settingName] = null,
                                _l),
                            _k.errorFields = (_m = {},
                                _m[settingName] = null,
                                _m),
                            _k),
                    },
                    _j),
            },
        },
    ];
    return {
        optimisticData: optimisticData,
        failureData: failureData,
        successData: successData,
    };
}
function updateQuickbooksOnlineAutoSync(policyID, settingValue) {
    if (!policyID) {
        return;
    }
    var onyxData = buildOnyxDataForQuickbooksConfiguration(policyID, CONST_1.default.QUICKBOOKS_CONFIG.AUTO_SYNC, { enabled: settingValue }, { enabled: !settingValue });
    var parameters = {
        policyID: policyID,
        settingValue: JSON.stringify(settingValue),
        idempotencyKey: String(CONST_1.default.QUICKBOOKS_CONFIG.AUTO_SYNC),
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_AUTO_SYNC, parameters, onyxData);
}
function updateQuickbooksOnlineEnableNewCategories(policyID, settingValue) {
    var onyxData = buildOnyxDataForQuickbooksConfiguration(policyID, CONST_1.default.QUICKBOOKS_CONFIG.ENABLE_NEW_CATEGORIES, settingValue, !settingValue);
    var parameters = {
        policyID: policyID,
        settingValue: JSON.stringify(settingValue),
        idempotencyKey: String(CONST_1.default.QUICKBOOKS_CONFIG.ENABLE_NEW_CATEGORIES),
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_ENABLE_NEW_CATEGORIES, parameters, onyxData);
}
function updateQuickbooksOnlineAutoCreateVendor(policyID, configUpdate, configCurrentData) {
    if (!policyID) {
        return;
    }
    var onyxData = buildOnyxDataForMultipleQuickbooksConfigurations(policyID, configUpdate, configCurrentData);
    var parameters = {
        policyID: policyID,
        autoCreateVendor: JSON.stringify(configUpdate.autoCreateVendor),
        nonReimbursableBillDefaultVendor: JSON.stringify(configUpdate.nonReimbursableBillDefaultVendor),
        idempotencyKey: CONST_1.default.QUICKBOOKS_CONFIG.AUTO_CREATE_VENDOR,
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_AUTO_CREATE_VENDOR, parameters, onyxData);
}
function updateQuickbooksOnlineSyncPeople(policyID, settingValue) {
    if (!policyID) {
        return;
    }
    var onyxData = buildOnyxDataForQuickbooksConfiguration(policyID, CONST_1.default.QUICKBOOKS_CONFIG.SYNC_PEOPLE, settingValue, !settingValue);
    var parameters = {
        policyID: policyID,
        settingValue: JSON.stringify(settingValue),
        idempotencyKey: String(CONST_1.default.QUICKBOOKS_CONFIG.SYNC_PEOPLE),
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_SYNC_PEOPLE, parameters, onyxData);
}
function updateQuickbooksOnlineReimbursableExpensesAccount(policyID, settingValue, oldSettingValue) {
    var onyxData = buildOnyxDataForQuickbooksConfiguration(policyID, CONST_1.default.QUICKBOOKS_CONFIG.REIMBURSABLE_EXPENSES_ACCOUNT, settingValue, oldSettingValue);
    var parameters = {
        policyID: policyID,
        settingValue: JSON.stringify(settingValue),
        idempotencyKey: String(CONST_1.default.QUICKBOOKS_CONFIG.REIMBURSABLE_EXPENSES_ACCOUNT),
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_REIMBURSABLE_EXPENSES_ACCOUNT, parameters, onyxData);
}
function updateQuickbooksOnlineSyncLocations(policyID, settingValue, oldSettingValue) {
    var onyxData = buildOnyxDataForQuickbooksConfiguration(policyID, CONST_1.default.QUICKBOOKS_CONFIG.SYNC_LOCATIONS, settingValue, oldSettingValue);
    var parameters = {
        policyID: policyID,
        settingValue: JSON.stringify(settingValue),
        idempotencyKey: String(CONST_1.default.QUICKBOOKS_CONFIG.SYNC_LOCATIONS),
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_SYNC_LOCATIONS, parameters, onyxData);
}
function updateQuickbooksOnlineSyncCustomers(policyID, settingValue, oldSettingValue) {
    var onyxData = buildOnyxDataForQuickbooksConfiguration(policyID, CONST_1.default.QUICKBOOKS_CONFIG.SYNC_CUSTOMERS, settingValue, oldSettingValue);
    var parameters = {
        policyID: policyID,
        settingValue: JSON.stringify(settingValue),
        idempotencyKey: String(CONST_1.default.QUICKBOOKS_CONFIG.SYNC_CUSTOMERS),
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_SYNC_CUSTOMERS, parameters, onyxData);
}
function updateQuickbooksOnlineSyncClasses(policyID, settingValue, oldSettingValue) {
    var onyxData = buildOnyxDataForQuickbooksConfiguration(policyID, CONST_1.default.QUICKBOOKS_CONFIG.SYNC_CLASSES, settingValue, oldSettingValue);
    var parameters = {
        policyID: policyID,
        settingValue: JSON.stringify(settingValue),
        idempotencyKey: String(CONST_1.default.QUICKBOOKS_CONFIG.SYNC_CLASSES),
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_SYNC_CLASSES, parameters, onyxData);
}
function updateQuickbooksOnlineNonReimbursableBillDefaultVendor(policyID, settingValue, oldSettingValue) {
    var onyxData = buildOnyxDataForQuickbooksConfiguration(policyID, CONST_1.default.QUICKBOOKS_CONFIG.NON_REIMBURSABLE_BILL_DEFAULT_VENDOR, settingValue, oldSettingValue);
    var parameters = {
        policyID: policyID,
        settingValue: JSON.stringify(settingValue),
        idempotencyKey: String(CONST_1.default.QUICKBOOKS_CONFIG.NON_REIMBURSABLE_BILL_DEFAULT_VENDOR),
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_NON_REIMBURSABLE_BILL_DEFAULT_VENDOR, parameters, onyxData);
}
function updateQuickbooksOnlineReceivableAccount(policyID, settingValue, oldSettingValue) {
    if (!policyID) {
        return;
    }
    var _a = buildOnyxDataForQuickbooksConfiguration(policyID, CONST_1.default.QUICKBOOKS_CONFIG.RECEIVABLE_ACCOUNT, settingValue, oldSettingValue), optimisticData = _a.optimisticData, failureData = _a.failureData, successData = _a.successData;
    var parameters = {
        policyID: policyID,
        settingValue: JSON.stringify(settingValue),
        idempotencyKey: String(CONST_1.default.QUICKBOOKS_CONFIG.RECEIVABLE_ACCOUNT),
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_RECEIVABLE_ACCOUNT, parameters, { optimisticData: optimisticData, failureData: failureData, successData: successData });
}
function updateQuickbooksOnlineExportDate(policyID, settingValue, oldSettingValue) {
    var _a = buildOnyxDataForQuickbooksConfiguration(policyID, CONST_1.default.QUICKBOOKS_CONFIG.EXPORT_DATE, settingValue, oldSettingValue), optimisticData = _a.optimisticData, failureData = _a.failureData, successData = _a.successData;
    var parameters = {
        policyID: policyID,
        settingValue: JSON.stringify(settingValue),
        idempotencyKey: String(CONST_1.default.QUICKBOOKS_CONFIG.EXPORT_DATE),
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_EXPORT_DATE, parameters, { optimisticData: optimisticData, failureData: failureData, successData: successData });
}
function updateQuickbooksOnlineNonReimbursableExpensesAccount(policyID, settingValue, oldSettingValue) {
    var _a = buildOnyxDataForQuickbooksConfiguration(policyID, CONST_1.default.QUICKBOOKS_CONFIG.NON_REIMBURSABLE_EXPENSES_ACCOUNT, settingValue, oldSettingValue), optimisticData = _a.optimisticData, failureData = _a.failureData, successData = _a.successData;
    var parameters = {
        policyID: policyID,
        settingValue: JSON.stringify(settingValue),
        idempotencyKey: String(CONST_1.default.QUICKBOOKS_CONFIG.NON_REIMBURSABLE_EXPENSES_ACCOUNT),
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_NON_REIMBURSABLE_EXPENSES_ACCOUNT, parameters, { optimisticData: optimisticData, failureData: failureData, successData: successData });
}
function updateQuickbooksOnlineCollectionAccountID(policyID, settingValue, oldSettingValue) {
    if (settingValue === oldSettingValue || !policyID) {
        return;
    }
    var _a = buildOnyxDataForQuickbooksConfiguration(policyID, CONST_1.default.QUICKBOOKS_CONFIG.COLLECTION_ACCOUNT_ID, settingValue, oldSettingValue), optimisticData = _a.optimisticData, failureData = _a.failureData, successData = _a.successData;
    var parameters = {
        policyID: policyID,
        settingValue: JSON.stringify(settingValue),
        idempotencyKey: String(CONST_1.default.QUICKBOOKS_CONFIG.COLLECTION_ACCOUNT_ID),
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_COLLECTION_ACCOUNT_ID, parameters, { optimisticData: optimisticData, failureData: failureData, successData: successData });
}
function updateQuickbooksOnlineAccountingMethod(policyID, accountingMethod, oldAccountingMethod) {
    if (!policyID) {
        return;
    }
    var onyxData = buildOnyxDataForQuickbooksConfiguration(policyID, CONST_1.default.QUICKBOOKS_CONFIG.ACCOUNTING_METHOD, accountingMethod, oldAccountingMethod);
    var parameters = {
        policyID: policyID,
        accountingMethod: accountingMethod,
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_ACCOUNTING_METHOD, parameters, onyxData);
}
function updateQuickbooksOnlineSyncTax(policyID, settingValue) {
    var onyxData = buildOnyxDataForQuickbooksConfiguration(policyID, CONST_1.default.QUICKBOOKS_CONFIG.SYNC_TAX, settingValue, !settingValue);
    var parameters = {
        policyID: policyID,
        settingValue: JSON.stringify(settingValue),
        idempotencyKey: String(CONST_1.default.QUICKBOOKS_CONFIG.SYNC_TAX),
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_SYNC_TAX, parameters, onyxData);
}
function updateQuickbooksOnlineReimbursementAccountID(policyID, settingValue, oldSettingValue) {
    if (settingValue === oldSettingValue) {
        return;
    }
    var onyxData = buildOnyxDataForQuickbooksConfiguration(policyID, CONST_1.default.QUICKBOOKS_CONFIG.REIMBURSEMENT_ACCOUNT_ID, settingValue, oldSettingValue);
    var parameters = {
        policyID: policyID,
        settingValue: JSON.stringify(settingValue),
        idempotencyKey: String(CONST_1.default.QUICKBOOKS_CONFIG.REIMBURSEMENT_ACCOUNT_ID),
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_REIMBURSEMENT_ACCOUNT_ID, parameters, onyxData);
}
function updateQuickbooksOnlinePreferredExporter(policyID, settingValue, oldSettingValue) {
    if (!policyID) {
        return;
    }
    var onyxData = buildOnyxDataForQuickbooksConfiguration(policyID, CONST_1.default.QUICKBOOKS_CONFIG.EXPORT, settingValue, oldSettingValue);
    var parameters = {
        policyID: policyID,
        settingValue: settingValue.exporter,
        idempotencyKey: String(CONST_1.default.QUICKBOOKS_CONFIG.EXPORT),
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_EXPORT, parameters, onyxData);
}
