
var __assign =
    (this && this.__assign) ||
    function () {
        __assign =
            Object.assign ||
            function (t) {
                for (var s, i = 1, n = arguments.length; i < n; i++) {
                    s = arguments[i];
                    for (const p in s) {if (Object.prototype.hasOwnProperty.call(s, p)) {t[p] = s[p];}}
                }
                return t;
            };
        return __assign.apply(this, arguments);
    };
exports.__esModule = true;
exports.updateQuickbooksOnlineAccountingMethod =
    exports.updateQuickbooksOnlineSyncCustomers =
    exports.updateQuickbooksOnlineSyncLocations =
    exports.updateQuickbooksOnlineSyncClasses =
    exports.updateQuickbooksOnlineSyncTax =
    exports.updateQuickbooksOnlineNonReimbursableBillDefaultVendor =
    exports.updateQuickbooksOnlineCollectionAccountID =
    exports.updateQuickbooksOnlineNonReimbursableExpensesAccount =
    exports.updateQuickbooksOnlineExportDate =
    exports.updateQuickbooksOnlineReceivableAccount =
    exports.updateQuickbooksOnlinePreferredExporter =
    exports.updateQuickbooksOnlineReimbursementAccountID =
    exports.updateQuickbooksOnlineSyncPeople =
    exports.updateQuickbooksOnlineAutoSync =
    exports.updateQuickbooksOnlineReimbursableExpensesAccount =
    exports.updateQuickbooksOnlineAutoCreateVendor =
    exports.updateQuickbooksOnlineEnableNewCategories =
    exports.getQuickbooksOnlineSetupLink =
    exports.shouldShowQBOReimbursableExportDestinationAccountError =
        void 0;
const react_native_onyx_1 = require('react-native-onyx');
const API = require('@libs/API');
const types_1 = require('@libs/API/types');
const ApiUtils_1 = require('@libs/ApiUtils');
const ErrorUtils = require('@libs/ErrorUtils');
const PolicyUtils_1 = require('@libs/PolicyUtils');
const CONST_1 = require('@src/CONST');
const ONYXKEYS_1 = require('@src/ONYXKEYS');

function getQuickbooksOnlineSetupLink(policyID) {
    const params = {policyID};
    const commandURL = ApiUtils_1.getCommandURL({
        command: types_1.READ_COMMANDS.CONNECT_POLICY_TO_QUICKBOOKS_ONLINE,
        shouldSkipWebProxy: true,
    });
    return commandURL + new URLSearchParams(params).toString();
}
exports.getQuickbooksOnlineSetupLink = getQuickbooksOnlineSetupLink;
function shouldShowQBOReimbursableExportDestinationAccountError(policy) {
    let _a; let _b;
    const qboConfig =
        (_b = (_a = policy === null || policy === void 0 ? void 0 : policy.connections) === null || _a === void 0 ? void 0 : _a.quickbooksOnline) === null || _b === void 0
            ? void 0
            : _b.config;
    return (
        PolicyUtils_1.isPolicyAdmin(policy) &&
        !!(qboConfig === null || qboConfig === void 0 ? void 0 : qboConfig.reimbursableExpensesExportDestination) &&
        !qboConfig.reimbursableExpensesAccount
    );
}
exports.shouldShowQBOReimbursableExportDestinationAccountError = shouldShowQBOReimbursableExportDestinationAccountError;
function buildOnyxDataForMultipleQuickbooksConfigurations(policyID, configUpdate, configCurrentData) {
    let _a; let _b; let _c;
    const optimisticData = [
        {
            onyxMethod: react_native_onyx_1['default'].METHOD.MERGE,
            key: `${  ONYXKEYS_1['default'].COLLECTION.POLICY  }${policyID}`,
            value: {
                connections:
                    ((_a = {}),
                    (_a[CONST_1['default'].POLICY.CONNECTIONS.NAME.QBO] = {
                        config: {...configUpdate, pendingFields: Object.fromEntries(
                                Object.keys(configUpdate).map(function (settingName) {
                                    return [settingName, CONST_1['default'].RED_BRICK_ROAD_PENDING_ACTION.UPDATE];
                                }),
                            ),
                            errorFields: Object.fromEntries(
                                Object.keys(configUpdate).map(function (settingName) {
                                    return [settingName, null];
                                }),
                            ),},
                    }),
                    _a),
            },
        },
    ];
    const failureData = [
        {
            onyxMethod: react_native_onyx_1['default'].METHOD.MERGE,
            key: `${  ONYXKEYS_1['default'].COLLECTION.POLICY  }${policyID}`,
            value: {
                connections:
                    ((_b = {}),
                    (_b[CONST_1['default'].POLICY.CONNECTIONS.NAME.QBO] = {
                        config: {...configCurrentData, pendingFields: Object.fromEntries(
                                Object.keys(configUpdate).map(function (settingName) {
                                    return [settingName, null];
                                }),
                            ),
                            errorFields: Object.fromEntries(
                                Object.keys(configUpdate).map(function (settingName) {
                                    return [settingName, ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage')];
                                }),
                            ),},
                    }),
                    _b),
            },
        },
    ];
    const successData = [
        {
            onyxMethod: react_native_onyx_1['default'].METHOD.MERGE,
            key: `${  ONYXKEYS_1['default'].COLLECTION.POLICY  }${policyID}`,
            value: {
                connections:
                    ((_c = {}),
                    (_c[CONST_1['default'].POLICY.CONNECTIONS.NAME.QBO] = {
                        config: {
                            pendingFields: Object.fromEntries(
                                Object.keys(configUpdate).map(function (settingName) {
                                    return [settingName, null];
                                }),
                            ),
                            errorFields: Object.fromEntries(
                                Object.keys(configUpdate).map(function (settingName) {
                                    return [settingName, null];
                                }),
                            ),
                        },
                    }),
                    _c),
            },
        },
    ];
    return {
        optimisticData,
        failureData,
        successData,
    };
}
function buildOnyxDataForQuickbooksConfiguration(policyID, settingName, settingValue, oldSettingValue) {
    let _a; let _b; let _c; let _d; let _e; let _f; let _g; let _h; let _j; let _k; let _l; let _m;
    const optimisticData = [
        {
            onyxMethod: react_native_onyx_1['default'].METHOD.MERGE,
            key: `${  ONYXKEYS_1['default'].COLLECTION.POLICY  }${policyID}`,
            value: {
                connections:
                    ((_a = {}),
                    (_a[CONST_1['default'].POLICY.CONNECTIONS.NAME.QBO] = {
                        config:
                            ((_b = {}),
                            (_b[settingName] = settingValue !== null && settingValue !== void 0 ? settingValue : null),
                            (_b.pendingFields = ((_c = {}), (_c[settingName] = CONST_1['default'].RED_BRICK_ROAD_PENDING_ACTION.UPDATE), _c)),
                            (_b.errorFields = ((_d = {}), (_d[settingName] = null), _d)),
                            _b),
                    }),
                    _a),
            },
        },
    ];
    const failureData = [
        {
            onyxMethod: react_native_onyx_1['default'].METHOD.MERGE,
            key: `${  ONYXKEYS_1['default'].COLLECTION.POLICY  }${policyID}`,
            value: {
                connections:
                    ((_e = {}),
                    (_e[CONST_1['default'].POLICY.CONNECTIONS.NAME.QBO] = {
                        config:
                            ((_f = {}),
                            (_f[settingName] = oldSettingValue !== null && oldSettingValue !== void 0 ? oldSettingValue : null),
                            (_f.pendingFields = ((_g = {}), (_g[settingName] = null), _g)),
                            (_f.errorFields = ((_h = {}), (_h[settingName] = ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage')), _h)),
                            _f),
                    }),
                    _e),
            },
        },
    ];
    const successData = [
        {
            onyxMethod: react_native_onyx_1['default'].METHOD.MERGE,
            key: `${  ONYXKEYS_1['default'].COLLECTION.POLICY  }${policyID}`,
            value: {
                connections:
                    ((_j = {}),
                    (_j[CONST_1['default'].POLICY.CONNECTIONS.NAME.QBO] = {
                        config:
                            ((_k = {}),
                            (_k[settingName] = settingValue !== null && settingValue !== void 0 ? settingValue : null),
                            (_k.pendingFields = ((_l = {}), (_l[settingName] = null), _l)),
                            (_k.errorFields = ((_m = {}), (_m[settingName] = null), _m)),
                            _k),
                    }),
                    _j),
            },
        },
    ];
    return {
        optimisticData,
        failureData,
        successData,
    };
}
function updateQuickbooksOnlineAutoSync(policyID, settingValue) {
    if (!policyID) {
        return;
    }
    const onyxData = buildOnyxDataForQuickbooksConfiguration(policyID, CONST_1['default'].QUICKBOOKS_CONFIG.AUTO_SYNC, {enabled: settingValue}, {enabled: !settingValue});
    const parameters = {
        policyID,
        settingValue: JSON.stringify(settingValue),
        idempotencyKey: String(CONST_1['default'].QUICKBOOKS_CONFIG.AUTO_SYNC),
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_AUTO_SYNC, parameters, onyxData);
}
exports.updateQuickbooksOnlineAutoSync = updateQuickbooksOnlineAutoSync;
function updateQuickbooksOnlineEnableNewCategories(policyID, settingValue) {
    const onyxData = buildOnyxDataForQuickbooksConfiguration(policyID, CONST_1['default'].QUICKBOOKS_CONFIG.ENABLE_NEW_CATEGORIES, settingValue, !settingValue);
    const parameters = {
        policyID,
        settingValue: JSON.stringify(settingValue),
        idempotencyKey: String(CONST_1['default'].QUICKBOOKS_CONFIG.ENABLE_NEW_CATEGORIES),
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_ENABLE_NEW_CATEGORIES, parameters, onyxData);
}
exports.updateQuickbooksOnlineEnableNewCategories = updateQuickbooksOnlineEnableNewCategories;
function updateQuickbooksOnlineAutoCreateVendor(policyID, configUpdate, configCurrentData) {
    if (!policyID) {
        return;
    }
    const onyxData = buildOnyxDataForMultipleQuickbooksConfigurations(policyID, configUpdate, configCurrentData);
    const parameters = {
        policyID,
        autoCreateVendor: JSON.stringify(configUpdate.autoCreateVendor),
        nonReimbursableBillDefaultVendor: JSON.stringify(configUpdate.nonReimbursableBillDefaultVendor),
        idempotencyKey: CONST_1['default'].QUICKBOOKS_CONFIG.AUTO_CREATE_VENDOR,
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_AUTO_CREATE_VENDOR, parameters, onyxData);
}
exports.updateQuickbooksOnlineAutoCreateVendor = updateQuickbooksOnlineAutoCreateVendor;
function updateQuickbooksOnlineSyncPeople(policyID, settingValue) {
    if (!policyID) {
        return;
    }
    const onyxData = buildOnyxDataForQuickbooksConfiguration(policyID, CONST_1['default'].QUICKBOOKS_CONFIG.SYNC_PEOPLE, settingValue, !settingValue);
    const parameters = {
        policyID,
        settingValue: JSON.stringify(settingValue),
        idempotencyKey: String(CONST_1['default'].QUICKBOOKS_CONFIG.SYNC_PEOPLE),
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_SYNC_PEOPLE, parameters, onyxData);
}
exports.updateQuickbooksOnlineSyncPeople = updateQuickbooksOnlineSyncPeople;
function updateQuickbooksOnlineReimbursableExpensesAccount(policyID, settingValue, oldSettingValue) {
    const onyxData = buildOnyxDataForQuickbooksConfiguration(policyID, CONST_1['default'].QUICKBOOKS_CONFIG.REIMBURSABLE_EXPENSES_ACCOUNT, settingValue, oldSettingValue);
    const parameters = {
        policyID,
        settingValue: JSON.stringify(settingValue),
        idempotencyKey: String(CONST_1['default'].QUICKBOOKS_CONFIG.REIMBURSABLE_EXPENSES_ACCOUNT),
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_REIMBURSABLE_EXPENSES_ACCOUNT, parameters, onyxData);
}
exports.updateQuickbooksOnlineReimbursableExpensesAccount = updateQuickbooksOnlineReimbursableExpensesAccount;
function updateQuickbooksOnlineSyncLocations(policyID, settingValue, oldSettingValue) {
    const onyxData = buildOnyxDataForQuickbooksConfiguration(policyID, CONST_1['default'].QUICKBOOKS_CONFIG.SYNC_LOCATIONS, settingValue, oldSettingValue);
    const parameters = {
        policyID,
        settingValue: JSON.stringify(settingValue),
        idempotencyKey: String(CONST_1['default'].QUICKBOOKS_CONFIG.SYNC_LOCATIONS),
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_SYNC_LOCATIONS, parameters, onyxData);
}
exports.updateQuickbooksOnlineSyncLocations = updateQuickbooksOnlineSyncLocations;
function updateQuickbooksOnlineSyncCustomers(policyID, settingValue, oldSettingValue) {
    const onyxData = buildOnyxDataForQuickbooksConfiguration(policyID, CONST_1['default'].QUICKBOOKS_CONFIG.SYNC_CUSTOMERS, settingValue, oldSettingValue);
    const parameters = {
        policyID,
        settingValue: JSON.stringify(settingValue),
        idempotencyKey: String(CONST_1['default'].QUICKBOOKS_CONFIG.SYNC_CUSTOMERS),
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_SYNC_CUSTOMERS, parameters, onyxData);
}
exports.updateQuickbooksOnlineSyncCustomers = updateQuickbooksOnlineSyncCustomers;
function updateQuickbooksOnlineSyncClasses(policyID, settingValue, oldSettingValue) {
    const onyxData = buildOnyxDataForQuickbooksConfiguration(policyID, CONST_1['default'].QUICKBOOKS_CONFIG.SYNC_CLASSES, settingValue, oldSettingValue);
    const parameters = {
        policyID,
        settingValue: JSON.stringify(settingValue),
        idempotencyKey: String(CONST_1['default'].QUICKBOOKS_CONFIG.SYNC_CLASSES),
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_SYNC_CLASSES, parameters, onyxData);
}
exports.updateQuickbooksOnlineSyncClasses = updateQuickbooksOnlineSyncClasses;
function updateQuickbooksOnlineNonReimbursableBillDefaultVendor(policyID, settingValue, oldSettingValue) {
    const onyxData = buildOnyxDataForQuickbooksConfiguration(policyID, CONST_1['default'].QUICKBOOKS_CONFIG.NON_REIMBURSABLE_BILL_DEFAULT_VENDOR, settingValue, oldSettingValue);
    const parameters = {
        policyID,
        settingValue: JSON.stringify(settingValue),
        idempotencyKey: String(CONST_1['default'].QUICKBOOKS_CONFIG.NON_REIMBURSABLE_BILL_DEFAULT_VENDOR),
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_NON_REIMBURSABLE_BILL_DEFAULT_VENDOR, parameters, onyxData);
}
exports.updateQuickbooksOnlineNonReimbursableBillDefaultVendor = updateQuickbooksOnlineNonReimbursableBillDefaultVendor;
function updateQuickbooksOnlineReceivableAccount(policyID, settingValue, oldSettingValue) {
    if (!policyID) {
        return;
    }
    const _a = buildOnyxDataForQuickbooksConfiguration(policyID, CONST_1['default'].QUICKBOOKS_CONFIG.RECEIVABLE_ACCOUNT, settingValue, oldSettingValue);
        const optimisticData = _a.optimisticData;
        const failureData = _a.failureData;
        const successData = _a.successData;
    const parameters = {
        policyID,
        settingValue: JSON.stringify(settingValue),
        idempotencyKey: String(CONST_1['default'].QUICKBOOKS_CONFIG.RECEIVABLE_ACCOUNT),
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_RECEIVABLE_ACCOUNT, parameters, {optimisticData, failureData, successData});
}
exports.updateQuickbooksOnlineReceivableAccount = updateQuickbooksOnlineReceivableAccount;
function updateQuickbooksOnlineExportDate(policyID, settingValue, oldSettingValue) {
    const _a = buildOnyxDataForQuickbooksConfiguration(policyID, CONST_1['default'].QUICKBOOKS_CONFIG.EXPORT_DATE, settingValue, oldSettingValue);
        const optimisticData = _a.optimisticData;
        const failureData = _a.failureData;
        const successData = _a.successData;
    const parameters = {
        policyID,
        settingValue: JSON.stringify(settingValue),
        idempotencyKey: String(CONST_1['default'].QUICKBOOKS_CONFIG.EXPORT_DATE),
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_EXPORT_DATE, parameters, {optimisticData, failureData, successData});
}
exports.updateQuickbooksOnlineExportDate = updateQuickbooksOnlineExportDate;
function updateQuickbooksOnlineNonReimbursableExpensesAccount(policyID, settingValue, oldSettingValue) {
    const _a = buildOnyxDataForQuickbooksConfiguration(policyID, CONST_1['default'].QUICKBOOKS_CONFIG.NON_REIMBURSABLE_EXPENSES_ACCOUNT, settingValue, oldSettingValue);
        const optimisticData = _a.optimisticData;
        const failureData = _a.failureData;
        const successData = _a.successData;
    const parameters = {
        policyID,
        settingValue: JSON.stringify(settingValue),
        idempotencyKey: String(CONST_1['default'].QUICKBOOKS_CONFIG.NON_REIMBURSABLE_EXPENSES_ACCOUNT),
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_NON_REIMBURSABLE_EXPENSES_ACCOUNT, parameters, {
        optimisticData,
        failureData,
        successData,
    });
}
exports.updateQuickbooksOnlineNonReimbursableExpensesAccount = updateQuickbooksOnlineNonReimbursableExpensesAccount;
function updateQuickbooksOnlineCollectionAccountID(policyID, settingValue, oldSettingValue) {
    if (settingValue === oldSettingValue || !policyID) {
        return;
    }
    const _a = buildOnyxDataForQuickbooksConfiguration(policyID, CONST_1['default'].QUICKBOOKS_CONFIG.COLLECTION_ACCOUNT_ID, settingValue, oldSettingValue);
        const optimisticData = _a.optimisticData;
        const failureData = _a.failureData;
        const successData = _a.successData;
    const parameters = {
        policyID,
        settingValue: JSON.stringify(settingValue),
        idempotencyKey: String(CONST_1['default'].QUICKBOOKS_CONFIG.COLLECTION_ACCOUNT_ID),
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_COLLECTION_ACCOUNT_ID, parameters, {optimisticData, failureData, successData});
}
exports.updateQuickbooksOnlineCollectionAccountID = updateQuickbooksOnlineCollectionAccountID;
function updateQuickbooksOnlineAccountingMethod(policyID, accountingMethod, oldAccountingMethod) {
    if (!policyID) {
        return;
    }
    const onyxData = buildOnyxDataForQuickbooksConfiguration(policyID, CONST_1['default'].QUICKBOOKS_CONFIG.ACCOUNTING_METHOD, accountingMethod, oldAccountingMethod);
    const parameters = {
        policyID,
        accountingMethod,
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_ACCOUNTING_METHOD, parameters, onyxData);
}
exports.updateQuickbooksOnlineAccountingMethod = updateQuickbooksOnlineAccountingMethod;
function updateQuickbooksOnlineSyncTax(policyID, settingValue) {
    const onyxData = buildOnyxDataForQuickbooksConfiguration(policyID, CONST_1['default'].QUICKBOOKS_CONFIG.SYNC_TAX, settingValue, !settingValue);
    const parameters = {
        policyID,
        settingValue: JSON.stringify(settingValue),
        idempotencyKey: String(CONST_1['default'].QUICKBOOKS_CONFIG.SYNC_TAX),
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_SYNC_TAX, parameters, onyxData);
}
exports.updateQuickbooksOnlineSyncTax = updateQuickbooksOnlineSyncTax;
function updateQuickbooksOnlineReimbursementAccountID(policyID, settingValue, oldSettingValue) {
    if (settingValue === oldSettingValue) {
        return;
    }
    const onyxData = buildOnyxDataForQuickbooksConfiguration(policyID, CONST_1['default'].QUICKBOOKS_CONFIG.REIMBURSEMENT_ACCOUNT_ID, settingValue, oldSettingValue);
    const parameters = {
        policyID,
        settingValue: JSON.stringify(settingValue),
        idempotencyKey: String(CONST_1['default'].QUICKBOOKS_CONFIG.REIMBURSEMENT_ACCOUNT_ID),
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_REIMBURSEMENT_ACCOUNT_ID, parameters, onyxData);
}
exports.updateQuickbooksOnlineReimbursementAccountID = updateQuickbooksOnlineReimbursementAccountID;
function updateQuickbooksOnlinePreferredExporter(policyID, settingValue, oldSettingValue) {
    if (!policyID) {
        return;
    }
    const onyxData = buildOnyxDataForQuickbooksConfiguration(policyID, CONST_1['default'].QUICKBOOKS_CONFIG.EXPORT, settingValue, oldSettingValue);
    const parameters = {
        policyID,
        settingValue: settingValue.exporter,
        idempotencyKey: String(CONST_1['default'].QUICKBOOKS_CONFIG.EXPORT),
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_QUICKBOOKS_ONLINE_EXPORT, parameters, onyxData);
}
exports.updateQuickbooksOnlinePreferredExporter = updateQuickbooksOnlinePreferredExporter;
