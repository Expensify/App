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
exports.updateQuickbooksDesktopAutoSync = updateQuickbooksDesktopAutoSync;
exports.updateQuickbooksDesktopPreferredExporter = updateQuickbooksDesktopPreferredExporter;
exports.updateQuickbooksDesktopMarkChecksToBePrinted = updateQuickbooksDesktopMarkChecksToBePrinted;
exports.updateQuickbooksDesktopNonReimbursableBillDefaultVendor = updateQuickbooksDesktopNonReimbursableBillDefaultVendor;
exports.updateQuickbooksDesktopShouldAutoCreateVendor = updateQuickbooksDesktopShouldAutoCreateVendor;
exports.updateQuickbooksDesktopNonReimbursableExpensesAccount = updateQuickbooksDesktopNonReimbursableExpensesAccount;
exports.updateQuickbooksDesktopExpensesExportDestination = updateQuickbooksDesktopExpensesExportDestination;
exports.updateQuickbooksDesktopReimbursableExpensesAccount = updateQuickbooksDesktopReimbursableExpensesAccount;
exports.getQuickbooksDesktopCodatSetupLink = getQuickbooksDesktopCodatSetupLink;
exports.updateQuickbooksCompanyCardExpenseAccount = updateQuickbooksCompanyCardExpenseAccount;
exports.updateQuickbooksDesktopEnableNewCategories = updateQuickbooksDesktopEnableNewCategories;
exports.updateQuickbooksDesktopExportDate = updateQuickbooksDesktopExportDate;
exports.updateQuickbooksDesktopSyncClasses = updateQuickbooksDesktopSyncClasses;
exports.updateQuickbooksDesktopSyncCustomers = updateQuickbooksDesktopSyncCustomers;
exports.updateQuickbooksDesktopSyncItems = updateQuickbooksDesktopSyncItems;
var react_native_onyx_1 = require("react-native-onyx");
var API = require("@libs/API");
var types_1 = require("@libs/API/types");
var ErrorUtils = require("@libs/ErrorUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
function buildOnyxDataForMultipleQuickbooksExportConfigurations(policyID, configUpdate, configCurrentData) {
    var _a, _b, _c;
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                connections: (_a = {},
                    _a[CONST_1.default.POLICY.CONNECTIONS.NAME.QBD] = {
                        config: {
                            export: configUpdate,
                            pendingFields: Object.fromEntries(Object.keys(configUpdate).map(function (settingName) { return [settingName, CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE]; })),
                            errorFields: Object.fromEntries(Object.keys(configUpdate).map(function (settingName) { return [settingName, null]; })),
                        },
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
                    _b[CONST_1.default.POLICY.CONNECTIONS.NAME.QBD] = {
                        config: {
                            export: configCurrentData,
                            pendingFields: Object.fromEntries(Object.keys(configUpdate).map(function (settingName) { return [settingName, null]; })),
                            errorFields: Object.fromEntries(Object.keys(configUpdate).map(function (settingName) { return [settingName, ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage')]; })),
                        },
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
                    _c[CONST_1.default.POLICY.CONNECTIONS.NAME.QBD] = {
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
function buildOnyxDataForQuickbooksExportConfiguration(policyID, settingName, settingValue, oldSettingValue) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    var exporterOptimisticData = settingName === CONST_1.default.QUICKBOOKS_CONFIG.EXPORTER ? { exporter: settingValue } : {};
    var exporterErrorData = settingName === CONST_1.default.QUICKBOOKS_CONFIG.EXPORTER ? { exporter: oldSettingValue } : {};
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: __assign(__assign({}, exporterOptimisticData), { connections: (_a = {},
                    _a[CONST_1.default.POLICY.CONNECTIONS.NAME.QBD] = {
                        config: {
                            export: (_b = {},
                                _b[settingName] = settingValue !== null && settingValue !== void 0 ? settingValue : null,
                                _b),
                            pendingFields: (_c = {},
                                _c[settingName] = CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                                _c),
                            errorFields: (_d = {},
                                _d[settingName] = null,
                                _d),
                        },
                    },
                    _a) }),
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: __assign(__assign({}, exporterErrorData), { connections: (_e = {},
                    _e[CONST_1.default.POLICY.CONNECTIONS.NAME.QBD] = {
                        config: {
                            export: (_f = {},
                                _f[settingName] = oldSettingValue !== null && oldSettingValue !== void 0 ? oldSettingValue : null,
                                _f),
                            pendingFields: (_g = {},
                                _g[settingName] = null,
                                _g),
                            errorFields: (_h = {},
                                _h[settingName] = ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                                _h),
                        },
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
                    _j[CONST_1.default.POLICY.CONNECTIONS.NAME.QBD] = {
                        config: {
                            export: (_k = {},
                                _k[settingName] = settingValue !== null && settingValue !== void 0 ? settingValue : null,
                                _k),
                            pendingFields: (_l = {},
                                _l[settingName] = null,
                                _l),
                            errorFields: (_m = {},
                                _m[settingName] = null,
                                _m),
                        },
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
function buildOnyxDataForQuickbooksDesktopMappingsConfiguration(policyID, settingName, settingValue, oldSettingValue) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                connections: (_a = {},
                    _a[CONST_1.default.POLICY.CONNECTIONS.NAME.QBD] = {
                        config: {
                            mappings: (_b = {},
                                _b[settingName] = settingValue !== null && settingValue !== void 0 ? settingValue : null,
                                _b),
                            pendingFields: (_c = {},
                                _c[settingName] = CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                                _c),
                            errorFields: (_d = {},
                                _d[settingName] = null,
                                _d),
                        },
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
                connections: (_e = {},
                    _e[CONST_1.default.POLICY.CONNECTIONS.NAME.QBD] = {
                        config: {
                            mappings: (_f = {},
                                _f[settingName] = oldSettingValue !== null && oldSettingValue !== void 0 ? oldSettingValue : null,
                                _f),
                            pendingFields: (_g = {},
                                _g[settingName] = null,
                                _g),
                            errorFields: (_h = {},
                                _h[settingName] = ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                                _h),
                        },
                    },
                    _e),
            },
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                connections: (_j = {},
                    _j[CONST_1.default.POLICY.CONNECTIONS.NAME.QBD] = {
                        config: {
                            pendingFields: (_k = {},
                                _k[settingName] = null,
                                _k),
                            errorFields: (_l = {},
                                _l[settingName] = null,
                                _l),
                        },
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
function buildOnyxDataForQuickbooksConfiguration(policyID, settingName, settingValue, oldSettingValue) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m;
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                connections: (_a = {},
                    _a[CONST_1.default.POLICY.CONNECTIONS.NAME.QBD] = {
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
                    _a),
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                connections: (_e = {},
                    _e[CONST_1.default.POLICY.CONNECTIONS.NAME.QBD] = {
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
                    _e),
            },
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                connections: (_j = {},
                    _j[CONST_1.default.POLICY.CONNECTIONS.NAME.QBD] = {
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
function getQuickbooksDesktopCodatSetupLink(policyID) {
    var params = { policyID: policyID };
    // eslint-disable-next-line rulesdir/no-api-side-effects-method
    return API.makeRequestWithSideEffects(types_1.SIDE_EFFECT_REQUEST_COMMANDS.CONNECT_POLICY_TO_QUICKBOOKS_DESKTOP, params);
}
function updateQuickbooksDesktopExpensesExportDestination(policyID, configUpdate, configCurrentData) {
    var onyxData = buildOnyxDataForMultipleQuickbooksExportConfigurations(policyID, configUpdate, configCurrentData);
    var parameters = {
        policyID: policyID,
        reimbursableExpensesExportDestination: configUpdate.reimbursable,
        reimbursableExpensesAccount: configUpdate === null || configUpdate === void 0 ? void 0 : configUpdate.reimbursableAccount,
        idempotencyKey: String(CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.REIMBURSABLE),
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_QUICKBOOKS_DESKTOP_REIMBURSABLE_EXPENSES_EXPORT_DESTINATION, parameters, onyxData);
}
function updateQuickbooksCompanyCardExpenseAccount(policyID, configUpdate, configCurrentData) {
    var onyxData = buildOnyxDataForMultipleQuickbooksExportConfigurations(policyID, configUpdate, configCurrentData);
    var parameters = {
        policyID: policyID,
        nonReimbursableExpensesExportDestination: configUpdate.nonReimbursable,
        nonReimbursableExpensesAccount: configUpdate === null || configUpdate === void 0 ? void 0 : configUpdate.nonReimbursableAccount,
        nonReimbursableBillDefaultVendor: configUpdate.nonReimbursableBillDefaultVendor,
        idempotencyKey: String(CONST_1.default.QUICKBOOKS_CONFIG.NON_REIMBURSABLE_EXPENSES_EXPORT_DESTINATION),
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPENSES_EXPORT_DESTINATION, parameters, onyxData);
}
function updateQuickbooksDesktopShouldAutoCreateVendor(policyID, settingValue) {
    if (!policyID) {
        return;
    }
    var onyxData = buildOnyxDataForQuickbooksConfiguration(policyID, CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.SHOULD_AUTO_CREATE_VENDOR, settingValue, !settingValue);
    var parameters = {
        policyID: policyID,
        settingValue: JSON.stringify(settingValue),
        idempotencyKey: String(CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.SHOULD_AUTO_CREATE_VENDOR),
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_QUICKBOOKS_DESKTOP_AUTO_CREATE_VENDOR, parameters, onyxData);
}
function updateQuickbooksDesktopMarkChecksToBePrinted(policyID, settingValue) {
    var onyxData = buildOnyxDataForQuickbooksConfiguration(policyID, CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.MARK_CHECKS_TO_BE_PRINTED, settingValue, !settingValue);
    var parameters = {
        policyID: policyID,
        settingValue: JSON.stringify(settingValue),
        idempotencyKey: String(CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.MARK_CHECKS_TO_BE_PRINTED),
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_QUICKBOOKS_DESKTOP_MARK_CHECKS_TO_BE_PRINTED, parameters, onyxData);
}
function updateQuickbooksDesktopReimbursableExpensesAccount(policyID, settingValue, oldSettingValue) {
    var onyxData = buildOnyxDataForQuickbooksExportConfiguration(policyID, CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.REIMBURSABLE_ACCOUNT, settingValue, oldSettingValue);
    var parameters = {
        policyID: policyID,
        settingValue: settingValue,
        idempotencyKey: String(CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.REIMBURSABLE_ACCOUNT),
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_QUICKBOOKS_DESKTOP_REIMBURSABLE_EXPENSES_ACCOUNT, parameters, onyxData);
}
function updateQuickbooksDesktopEnableNewCategories(policyID, settingValue) {
    var onyxData = buildOnyxDataForQuickbooksConfiguration(policyID, CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.ENABLE_NEW_CATEGORIES, settingValue, !settingValue);
    var parameters = {
        policyID: policyID,
        settingValue: JSON.stringify(settingValue),
        idempotencyKey: String(CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.ENABLE_NEW_CATEGORIES),
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_QUICKBOOKS_DESKTOP_ENABLE_NEW_CATEGORIES, parameters, onyxData);
}
function updateQuickbooksDesktopSyncClasses(policyID, settingValue, oldSettingValue) {
    var onyxData = buildOnyxDataForQuickbooksDesktopMappingsConfiguration(policyID, CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.MAPPINGS.CLASSES, settingValue, oldSettingValue);
    var parameters = {
        policyID: policyID,
        settingValue: settingValue,
        idempotencyKey: String(CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.MAPPINGS.CLASSES),
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_QUICKBOOKS_DESKTOP_SYNC_CLASSES, parameters, onyxData);
}
function updateQuickbooksDesktopSyncCustomers(policyID, settingValue, oldSettingValue) {
    var onyxData = buildOnyxDataForQuickbooksDesktopMappingsConfiguration(policyID, CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.MAPPINGS.CUSTOMERS, settingValue, oldSettingValue);
    var parameters = {
        policyID: policyID,
        settingValue: settingValue,
        idempotencyKey: String(CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.MAPPINGS.CUSTOMERS),
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_QUICKBOOKS_DESKTOP_SYNC_CUSTOMERS, parameters, onyxData);
}
function updateQuickbooksDesktopSyncItems(policyID, settingValue, oldSettingValue) {
    var onyxData = buildOnyxDataForQuickbooksConfiguration(policyID, CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.IMPORT_ITEMS, settingValue, oldSettingValue);
    var parameters = {
        policyID: policyID,
        settingValue: JSON.stringify(settingValue),
        idempotencyKey: String(CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.IMPORT_ITEMS),
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_QUICKBOOKS_DESKTOP_SYNC_ITEMS, parameters, onyxData);
}
function updateQuickbooksDesktopPreferredExporter(policyID, settingValue, oldSettingValue) {
    var onyxData = buildOnyxDataForQuickbooksExportConfiguration(policyID, CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.EXPORTER, settingValue, oldSettingValue);
    var parameters = {
        policyID: policyID,
        settingValue: settingValue,
        idempotencyKey: String(CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.EXPORTER),
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_QUICKBOOKS_DESKTOP_EXPORT, parameters, onyxData);
}
function updateQuickbooksDesktopNonReimbursableExpensesAccount(policyID, settingValue, oldSettingValue) {
    var onyxData = buildOnyxDataForQuickbooksExportConfiguration(policyID, CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.NON_REIMBURSABLE_ACCOUNT, settingValue, oldSettingValue);
    var parameters = {
        policyID: policyID,
        settingValue: settingValue,
        idempotencyKey: String(CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.NON_REIMBURSABLE_ACCOUNT),
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_EXPENSES_ACCOUNT, parameters, onyxData);
}
function updateQuickbooksDesktopNonReimbursableBillDefaultVendor(policyID, settingValue, oldSettingValue) {
    var onyxData = buildOnyxDataForQuickbooksExportConfiguration(policyID, CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.NON_REIMBURSABLE_BILL_DEFAULT_VENDOR, settingValue, oldSettingValue);
    var parameters = {
        policyID: policyID,
        settingValue: settingValue,
        idempotencyKey: String(CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.NON_REIMBURSABLE_BILL_DEFAULT_VENDOR),
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_QUICKBOOKS_DESKTOP_NON_REIMBURSABLE_BILL_DEFAULT_VENDOR, parameters, onyxData);
}
function updateQuickbooksDesktopExportDate(policyID, settingValue, oldSettingValue) {
    var onyxData = buildOnyxDataForQuickbooksExportConfiguration(policyID, CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.EXPORT_DATE, settingValue, oldSettingValue);
    var parameters = {
        policyID: policyID,
        settingValue: settingValue,
        idempotencyKey: String(CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.EXPORT_DATE),
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_QUICKBOOKS_DESKTOP_EXPORT_DATE, parameters, onyxData);
}
function updateQuickbooksDesktopAutoSync(policyID, settingValue) {
    var onyxData = buildOnyxDataForQuickbooksConfiguration(policyID, CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.AUTO_SYNC, { enabled: settingValue }, { enabled: !settingValue });
    var parameters = {
        policyID: policyID,
        settingValue: JSON.stringify(settingValue),
        idempotencyKey: String(CONST_1.default.QUICKBOOKS_DESKTOP_CONFIG.AUTO_SYNC),
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_QUICKBOOKS_DESKTOP_AUTO_SYNC, parameters, onyxData);
}
