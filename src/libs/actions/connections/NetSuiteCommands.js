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
exports.connectPolicyToNetSuite = connectPolicyToNetSuite;
exports.updateNetSuiteSubsidiary = updateNetSuiteSubsidiary;
exports.updateNetSuiteSyncTaxConfiguration = updateNetSuiteSyncTaxConfiguration;
exports.updateNetSuiteExporter = updateNetSuiteExporter;
exports.updateNetSuiteExportDate = updateNetSuiteExportDate;
exports.updateNetSuiteReimbursableExpensesExportDestination = updateNetSuiteReimbursableExpensesExportDestination;
exports.updateNetSuiteNonReimbursableExpensesExportDestination = updateNetSuiteNonReimbursableExpensesExportDestination;
exports.updateNetSuiteDefaultVendor = updateNetSuiteDefaultVendor;
exports.updateNetSuiteReimbursablePayableAccount = updateNetSuiteReimbursablePayableAccount;
exports.updateNetSuitePayableAcct = updateNetSuitePayableAcct;
exports.updateNetSuiteJournalPostingPreference = updateNetSuiteJournalPostingPreference;
exports.updateNetSuiteReceivableAccount = updateNetSuiteReceivableAccount;
exports.updateNetSuiteInvoiceItemPreference = updateNetSuiteInvoiceItemPreference;
exports.updateNetSuiteInvoiceItem = updateNetSuiteInvoiceItem;
exports.updateNetSuiteTaxPostingAccount = updateNetSuiteTaxPostingAccount;
exports.updateNetSuiteProvincialTaxPostingAccount = updateNetSuiteProvincialTaxPostingAccount;
exports.updateNetSuiteAllowForeignCurrency = updateNetSuiteAllowForeignCurrency;
exports.updateNetSuiteExportToNextOpenPeriod = updateNetSuiteExportToNextOpenPeriod;
exports.updateNetSuiteImportMapping = updateNetSuiteImportMapping;
exports.updateNetSuiteCrossSubsidiaryCustomersConfiguration = updateNetSuiteCrossSubsidiaryCustomersConfiguration;
exports.updateNetSuiteCustomSegments = updateNetSuiteCustomSegments;
exports.updateNetSuiteCustomLists = updateNetSuiteCustomLists;
exports.updateNetSuiteAutoSync = updateNetSuiteAutoSync;
exports.updateNetSuiteSyncReimbursedReports = updateNetSuiteSyncReimbursedReports;
exports.updateNetSuiteSyncPeople = updateNetSuiteSyncPeople;
exports.updateNetSuiteAutoCreateEntities = updateNetSuiteAutoCreateEntities;
exports.updateNetSuiteEnableNewCategories = updateNetSuiteEnableNewCategories;
exports.updateNetSuiteCustomFormIDOptionsEnabled = updateNetSuiteCustomFormIDOptionsEnabled;
exports.updateNetSuiteReimbursementAccountID = updateNetSuiteReimbursementAccountID;
exports.updateNetSuiteCollectionAccount = updateNetSuiteCollectionAccount;
exports.updateNetSuiteExportReportsTo = updateNetSuiteExportReportsTo;
exports.updateNetSuiteExportVendorBillsTo = updateNetSuiteExportVendorBillsTo;
exports.updateNetSuiteExportJournalsTo = updateNetSuiteExportJournalsTo;
exports.updateNetSuiteApprovalAccount = updateNetSuiteApprovalAccount;
exports.updateNetSuiteCustomFormIDOptions = updateNetSuiteCustomFormIDOptions;
exports.updateNetSuiteCustomersJobsMapping = updateNetSuiteCustomersJobsMapping;
exports.updateNetSuiteAccountingMethod = updateNetSuiteAccountingMethod;
var isObject_1 = require("lodash/isObject");
var react_native_onyx_1 = require("react-native-onyx");
var API = require("@libs/API");
var types_1 = require("@libs/API/types");
var ErrorUtils = require("@libs/ErrorUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
function connectPolicyToNetSuite(policyID, credentials) {
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY_CONNECTION_SYNC_PROGRESS).concat(policyID),
            value: {
                stageInProgress: CONST_1.default.POLICY.CONNECTIONS.SYNC_STAGE_NAME.NETSUITE_SYNC_CONNECTION,
                connectionName: CONST_1.default.POLICY.CONNECTIONS.NAME.NETSUITE,
                timestamp: new Date().toISOString(),
            },
        },
    ];
    var parameters = __assign({ policyID: policyID }, credentials);
    API.write(types_1.WRITE_COMMANDS.CONNECT_POLICY_TO_NETSUITE, parameters, { optimisticData: optimisticData });
}
function createPendingFields(settingName, settingValue, pendingValue) {
    var _a;
    if (!(0, isObject_1.default)(settingValue)) {
        return _a = {}, _a[settingName] = pendingValue, _a;
    }
    return Object.keys(settingValue).reduce(function (acc, setting) {
        acc[setting] = pendingValue;
        return acc;
    }, {});
}
function createErrorFields(settingName, settingValue, errorValue) {
    var _a;
    if (!(0, isObject_1.default)(settingValue)) {
        return _a = {}, _a[settingName] = errorValue, _a;
    }
    return Object.keys(settingValue).reduce(function (acc, setting) {
        acc[setting] = errorValue;
        return acc;
    }, {});
}
function updateNetSuiteOnyxData(policyID, settingName, settingValue, oldSettingValue) {
    var _a, _b, _c;
    var exporterOptimisticData = settingName === CONST_1.default.NETSUITE_CONFIG.EXPORTER ? { exporter: settingValue } : {};
    var exporterErrorData = settingName === CONST_1.default.NETSUITE_CONFIG.EXPORTER ? { exporter: oldSettingValue } : {};
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: __assign(__assign({}, exporterOptimisticData), { connections: {
                    netsuite: {
                        options: {
                            config: (_a = {},
                                _a[settingName] = settingValue !== null && settingValue !== void 0 ? settingValue : null,
                                _a.pendingFields = createPendingFields(settingName, settingValue, CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE),
                                _a.errorFields = createErrorFields(settingName, settingValue, null),
                                _a),
                        },
                    },
                } }),
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: __assign(__assign({}, exporterErrorData), { connections: {
                    netsuite: {
                        options: {
                            config: (_b = {},
                                _b[settingName] = oldSettingValue !== null && oldSettingValue !== void 0 ? oldSettingValue : null,
                                _b.pendingFields = createPendingFields(settingName, settingValue, null),
                                _b.errorFields = createErrorFields(settingName, settingValue, ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage')),
                                _b),
                        },
                    },
                } }),
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                connections: {
                    netsuite: {
                        options: {
                            config: (_c = {},
                                _c[settingName] = settingValue !== null && settingValue !== void 0 ? settingValue : null,
                                _c.pendingFields = createPendingFields(settingName, settingValue, null),
                                _c.errorFields = createErrorFields(settingName, settingValue, null),
                                _c),
                        },
                    },
                },
            },
        },
    ];
    return { optimisticData: optimisticData, failureData: failureData, successData: successData };
}
function updateNetSuiteSyncOptionsOnyxData(policyID, settingName, settingValue, oldSettingValue, modifiedFieldID, pendingAction) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    var syncOptionsOptimisticValue;
    if (pendingAction !== CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
        syncOptionsOptimisticValue = (_a = {},
            _a[settingName] = settingValue !== null && settingValue !== void 0 ? settingValue : null,
            _a);
    }
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                connections: {
                    netsuite: {
                        options: {
                            config: {
                                syncOptions: syncOptionsOptimisticValue,
                                pendingFields: (_b = {},
                                    _b[modifiedFieldID !== null && modifiedFieldID !== void 0 ? modifiedFieldID : settingName] = pendingAction !== null && pendingAction !== void 0 ? pendingAction : CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                                    _b),
                                errorFields: (_c = {},
                                    _c[modifiedFieldID !== null && modifiedFieldID !== void 0 ? modifiedFieldID : settingName] = null,
                                    _c),
                            },
                        },
                    },
                },
            },
        },
    ];
    var syncOptionsAfterFailure;
    var pendingFieldsAfterFailure;
    if (pendingAction !== CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD) {
        syncOptionsAfterFailure = (_d = {},
            _d[settingName] = oldSettingValue !== null && oldSettingValue !== void 0 ? oldSettingValue : null,
            _d);
        pendingFieldsAfterFailure = (_e = {},
            _e[modifiedFieldID !== null && modifiedFieldID !== void 0 ? modifiedFieldID : settingName] = null,
            _e);
    }
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                connections: {
                    netsuite: {
                        options: {
                            config: {
                                syncOptions: syncOptionsAfterFailure,
                                pendingFields: pendingFieldsAfterFailure,
                                errorFields: (_f = {},
                                    _f[modifiedFieldID !== null && modifiedFieldID !== void 0 ? modifiedFieldID : settingName] = ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                                    _f),
                            },
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
                    netsuite: {
                        options: {
                            config: {
                                pendingFields: (_g = {},
                                    _g[modifiedFieldID !== null && modifiedFieldID !== void 0 ? modifiedFieldID : settingName] = null,
                                    _g),
                                errorFields: (_h = {},
                                    _h[modifiedFieldID !== null && modifiedFieldID !== void 0 ? modifiedFieldID : settingName] = null,
                                    _h),
                            },
                        },
                    },
                },
            },
        },
    ];
    return { optimisticData: optimisticData, failureData: failureData, successData: successData };
}
function updateNetSuiteSubsidiary(policyID, newSubsidiary, oldSubsidiary) {
    var onyxData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    connections: {
                        netsuite: {
                            options: {
                                config: {
                                    subsidiary: newSubsidiary.subsidiary,
                                    subsidiaryID: newSubsidiary.subsidiaryID,
                                    pendingFields: {
                                        subsidiary: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                                    },
                                    errorFields: {
                                        subsidiary: null,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        ],
        successData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    connections: {
                        netsuite: {
                            options: {
                                config: {
                                    subsidiary: newSubsidiary.subsidiary,
                                    subsidiaryID: newSubsidiary.subsidiaryID,
                                    errorFields: {
                                        subsidiary: null,
                                    },
                                    pendingFields: {
                                        subsidiary: null,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    connections: {
                        netsuite: {
                            options: {
                                config: {
                                    subsidiary: oldSubsidiary.subsidiary,
                                    subsidiaryID: oldSubsidiary.subsidiaryID,
                                    errorFields: {
                                        subsidiary: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                                    },
                                    pendingFields: {
                                        subsidiary: null,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        ],
    };
    var params = __assign({ policyID: policyID }, newSubsidiary);
    API.write(types_1.WRITE_COMMANDS.UPDATE_NETSUITE_SUBSIDIARY, params, onyxData);
}
function updateNetSuiteImportMapping(policyID, mappingName, mappingValue, oldMappingValue) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    var onyxData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    connections: {
                        netsuite: {
                            options: {
                                config: {
                                    syncOptions: {
                                        mapping: (_a = {},
                                            _a[mappingName] = mappingValue,
                                            _a),
                                    },
                                    errorFields: (_b = {},
                                        _b[mappingName] = null,
                                        _b),
                                    pendingFields: (_c = {},
                                        _c[mappingName] = CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                                        _c),
                                },
                            },
                        },
                    },
                },
            },
        ],
        successData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    connections: {
                        netsuite: {
                            options: {
                                config: {
                                    syncOptions: {
                                        mapping: (_d = {},
                                            _d[mappingName] = mappingValue,
                                            _d),
                                    },
                                    errorFields: (_e = {},
                                        _e[mappingName] = null,
                                        _e),
                                    pendingFields: (_f = {},
                                        _f[mappingName] = null,
                                        _f),
                                },
                            },
                        },
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    connections: {
                        netsuite: {
                            options: {
                                config: {
                                    syncOptions: {
                                        mapping: (_g = {},
                                            _g[mappingName] = oldMappingValue,
                                            _g),
                                    },
                                    errorFields: (_h = {},
                                        _h[mappingName] = ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                                        _h),
                                    pendingFields: (_j = {},
                                        _j[mappingName] = null,
                                        _j),
                                },
                            },
                        },
                    },
                },
            },
        ],
    };
    var params = {
        policyID: policyID,
        mapping: mappingValue,
    };
    var commandName;
    switch (mappingName) {
        case 'departments':
            commandName = types_1.WRITE_COMMANDS.UPDATE_NETSUITE_DEPARTMENTS_MAPPING;
            break;
        case 'classes':
            commandName = types_1.WRITE_COMMANDS.UPDATE_NETSUITE_CLASSES_MAPPING;
            break;
        case 'locations':
            commandName = types_1.WRITE_COMMANDS.UPDATE_NETSUITE_LOCATIONS_MAPPING;
            break;
        case 'customers':
            commandName = types_1.WRITE_COMMANDS.UPDATE_NETSUITE_CUSTOMERS_MAPPING;
            break;
        case 'jobs':
            commandName = types_1.WRITE_COMMANDS.UPDATE_NETSUITE_JOBS_MAPPING;
            break;
        default:
            return;
    }
    API.write(commandName, params, onyxData);
}
function updateNetSuiteCustomersJobsMapping(policyID, mappingValue, oldMappingValue) {
    var onyxData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    connections: {
                        netsuite: {
                            options: {
                                config: {
                                    syncOptions: {
                                        mapping: {
                                            customers: mappingValue.customersMapping,
                                            jobs: mappingValue.jobsMapping,
                                        },
                                    },
                                    errorFields: {
                                        customers: null,
                                        jobs: null,
                                    },
                                    pendingFields: {
                                        customers: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                                        jobs: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        ],
        successData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    connections: {
                        netsuite: {
                            options: {
                                config: {
                                    syncOptions: {
                                        mapping: {
                                            customers: mappingValue.customersMapping,
                                            jobs: mappingValue.jobsMapping,
                                        },
                                    },
                                    errorFields: {
                                        customers: null,
                                        jobs: null,
                                    },
                                    pendingFields: {
                                        customers: null,
                                        jobs: null,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    connections: {
                        netsuite: {
                            options: {
                                config: {
                                    syncOptions: {
                                        mapping: {
                                            customers: oldMappingValue.customersMapping,
                                            jobs: oldMappingValue.jobsMapping,
                                        },
                                    },
                                    errorFields: {
                                        customers: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                                        jobs: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                                    },
                                    pendingFields: {
                                        customers: null,
                                        jobs: null,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        ],
    };
    var params = __assign({ policyID: policyID }, mappingValue);
    API.write(types_1.WRITE_COMMANDS.UPDATE_NETSUITE_CUSTOMERS_JOBS_MAPPING, params, onyxData);
}
function updateNetSuiteSyncTaxConfiguration(policyID, isSyncTaxEnabled) {
    var onyxData = updateNetSuiteSyncOptionsOnyxData(policyID, CONST_1.default.NETSUITE_CONFIG.SYNC_OPTIONS.SYNC_TAX, isSyncTaxEnabled, !isSyncTaxEnabled);
    var params = {
        policyID: policyID,
        enabled: isSyncTaxEnabled,
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_NETSUITE_SYNC_TAX_CONFIGURATION, params, onyxData);
}
function updateNetSuiteCrossSubsidiaryCustomersConfiguration(policyID, isCrossSubsidiaryCustomersEnabled) {
    var onyxData = updateNetSuiteSyncOptionsOnyxData(policyID, CONST_1.default.NETSUITE_CONFIG.SYNC_OPTIONS.CROSS_SUBSIDIARY_CUSTOMERS, isCrossSubsidiaryCustomersEnabled, !isCrossSubsidiaryCustomersEnabled);
    var params = {
        policyID: policyID,
        enabled: isCrossSubsidiaryCustomersEnabled,
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_NETSUITE_CROSS_SUBSIDIARY_CUSTOMER_CONFIGURATION, params, onyxData);
}
function updateNetSuiteCustomSegments(policyID, records, oldRecords, modifiedSegmentID, pendingAction) {
    var onyxData = updateNetSuiteSyncOptionsOnyxData(policyID, CONST_1.default.NETSUITE_CONFIG.IMPORT_CUSTOM_FIELDS.CUSTOM_SEGMENTS, records, oldRecords, modifiedSegmentID, pendingAction);
    API.write(types_1.WRITE_COMMANDS.UPDATE_NETSUITE_CUSTOM_SEGMENTS, {
        policyID: policyID,
        customSegments: JSON.stringify(records),
    }, onyxData);
}
function updateNetSuiteCustomLists(policyID, records, oldRecords, modifiedListID, pendingAction) {
    var onyxData = updateNetSuiteSyncOptionsOnyxData(policyID, CONST_1.default.NETSUITE_CONFIG.IMPORT_CUSTOM_FIELDS.CUSTOM_LISTS, records, oldRecords, modifiedListID, pendingAction);
    API.write(types_1.WRITE_COMMANDS.UPDATE_NETSUITE_CUSTOM_LISTS, {
        policyID: policyID,
        customLists: JSON.stringify(records),
    }, onyxData);
}
function updateNetSuiteExporter(policyID, exporter, oldExporter) {
    var onyxData = updateNetSuiteOnyxData(policyID, CONST_1.default.NETSUITE_CONFIG.EXPORTER, exporter, oldExporter);
    var parameters = {
        policyID: policyID,
        email: exporter,
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_NETSUITE_EXPORTER, parameters, onyxData);
}
function updateNetSuiteExportDate(policyID, date, oldDate) {
    var onyxData = updateNetSuiteOnyxData(policyID, CONST_1.default.NETSUITE_CONFIG.EXPORT_DATE, date, oldDate);
    var parameters = {
        policyID: policyID,
        value: date,
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_NETSUITE_EXPORT_DATE, parameters, onyxData);
}
function updateNetSuiteReimbursableExpensesExportDestination(policyID, destination, oldDestination) {
    var onyxData = updateNetSuiteOnyxData(policyID, CONST_1.default.NETSUITE_CONFIG.REIMBURSABLE_EXPENSES_EXPORT_DESTINATION, destination, oldDestination);
    var parameters = {
        policyID: policyID,
        value: destination,
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_NETSUITE_REIMBURSABLE_EXPENSES_EXPORT_DESTINATION, parameters, onyxData);
}
function updateNetSuiteNonReimbursableExpensesExportDestination(policyID, destination, oldDestination) {
    var onyxData = updateNetSuiteOnyxData(policyID, CONST_1.default.NETSUITE_CONFIG.NON_REIMBURSABLE_EXPENSES_EXPORT_DESTINATION, destination, oldDestination);
    var parameters = {
        policyID: policyID,
        value: destination,
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_NETSUITE_NONREIMBURSABLE_EXPENSES_EXPORT_DESTINATION, parameters, onyxData);
}
function updateNetSuiteDefaultVendor(policyID, vendorID, oldVendorID) {
    var onyxData = updateNetSuiteOnyxData(policyID, CONST_1.default.NETSUITE_CONFIG.DEFAULT_VENDOR, vendorID, oldVendorID);
    var parameters = {
        policyID: policyID,
        vendorID: vendorID,
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_NETSUITE_DEFAULT_VENDOR, parameters, onyxData);
}
function updateNetSuiteReimbursablePayableAccount(policyID, bankAccountID, oldBankAccountID) {
    var onyxData = updateNetSuiteOnyxData(policyID, CONST_1.default.NETSUITE_CONFIG.REIMBURSABLE_PAYABLE_ACCOUNT, bankAccountID, oldBankAccountID);
    var parameters = {
        policyID: policyID,
        bankAccountID: bankAccountID,
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_NETSUITE_REIMBURSABLE_PAYABLE_ACCOUNT, parameters, onyxData);
}
function updateNetSuitePayableAcct(policyID, bankAccountID, oldBankAccountID) {
    var onyxData = updateNetSuiteOnyxData(policyID, CONST_1.default.NETSUITE_CONFIG.PAYABLE_ACCT, bankAccountID, oldBankAccountID);
    var parameters = {
        policyID: policyID,
        bankAccountID: bankAccountID,
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_NETSUITE_PAYABLE_ACCT, parameters, onyxData);
}
function updateNetSuiteJournalPostingPreference(policyID, postingPreference, oldPostingPreference) {
    var onyxData = updateNetSuiteOnyxData(policyID, CONST_1.default.NETSUITE_CONFIG.JOURNAL_POSTING_PREFERENCE, postingPreference, oldPostingPreference);
    var parameters = {
        policyID: policyID,
        value: postingPreference,
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_NETSUITE_JOURNAL_POSTING_PREFERENCE, parameters, onyxData);
}
function updateNetSuiteReceivableAccount(policyID, bankAccountID, oldBankAccountID) {
    var onyxData = updateNetSuiteOnyxData(policyID, CONST_1.default.NETSUITE_CONFIG.RECEIVABLE_ACCOUNT, bankAccountID, oldBankAccountID);
    var parameters = {
        policyID: policyID,
        bankAccountID: bankAccountID,
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_NETSUITE_RECEIVABLE_ACCOUNT, parameters, onyxData);
}
function updateNetSuiteInvoiceItemPreference(policyID, value, oldValue) {
    var onyxData = updateNetSuiteOnyxData(policyID, CONST_1.default.NETSUITE_CONFIG.INVOICE_ITEM_PREFERENCE, value, oldValue);
    var parameters = {
        policyID: policyID,
        value: value,
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_NETSUITE_INVOICE_ITEM_PREFERENCE, parameters, onyxData);
}
function updateNetSuiteInvoiceItem(policyID, itemID, oldItemID) {
    var onyxData = updateNetSuiteOnyxData(policyID, CONST_1.default.NETSUITE_CONFIG.INVOICE_ITEM, itemID, oldItemID);
    var parameters = {
        policyID: policyID,
        itemID: itemID,
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_NETSUITE_INVOICE_ITEM, parameters, onyxData);
}
function updateNetSuiteTaxPostingAccount(policyID, bankAccountID, oldBankAccountID) {
    var onyxData = updateNetSuiteOnyxData(policyID, CONST_1.default.NETSUITE_CONFIG.TAX_POSTING_ACCOUNT, bankAccountID, oldBankAccountID);
    var parameters = {
        policyID: policyID,
        bankAccountID: bankAccountID,
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_NETSUITE_TAX_POSTING_ACCOUNT, parameters, onyxData);
}
function updateNetSuiteProvincialTaxPostingAccount(policyID, bankAccountID, oldBankAccountID) {
    var onyxData = updateNetSuiteOnyxData(policyID, CONST_1.default.NETSUITE_CONFIG.PROVINCIAL_TAX_POSTING_ACCOUNT, bankAccountID, oldBankAccountID);
    var parameters = {
        policyID: policyID,
        bankAccountID: bankAccountID,
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_NETSUITE_PROVINCIAL_TAX_POSTING_ACCOUNT, parameters, onyxData);
}
function updateNetSuiteAllowForeignCurrency(policyID, value, oldValue) {
    var onyxData = updateNetSuiteOnyxData(policyID, CONST_1.default.NETSUITE_CONFIG.ALLOW_FOREIGN_CURRENCY, value, oldValue);
    var parameters = {
        policyID: policyID,
        enabled: value,
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_NETSUITE_ALLOW_FOREIGN_CURRENCY, parameters, onyxData);
}
function updateNetSuiteExportToNextOpenPeriod(policyID, value, oldValue) {
    var onyxData = updateNetSuiteOnyxData(policyID, CONST_1.default.NETSUITE_CONFIG.EXPORT_TO_NEXT_OPEN_PERIOD, value, oldValue);
    var parameters = {
        policyID: policyID,
        enabled: value,
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_NETSUITE_EXPORT_TO_NEXT_OPEN_PERIOD, parameters, onyxData);
}
function updateNetSuiteAutoSync(policyID, value) {
    if (!policyID) {
        return;
    }
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                connections: {
                    netsuite: {
                        config: {
                            autoSync: {
                                enabled: value,
                            },
                            pendingFields: {
                                autoSync: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                            },
                            errorFields: {
                                autoSync: null,
                            },
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
                    netsuite: {
                        config: {
                            autoSync: {
                                enabled: !value,
                            },
                            pendingFields: {
                                autoSync: null,
                            },
                            errorFields: {
                                autoSync: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                            },
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
                    netsuite: {
                        config: {
                            autoSync: {
                                enabled: value,
                            },
                            pendingFields: {
                                autoSync: null,
                            },
                            errorFields: {
                                autoSync: null,
                            },
                        },
                    },
                },
            },
        },
    ];
    var parameters = {
        policyID: policyID,
        enabled: value,
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_NETSUITE_AUTO_SYNC, parameters, { optimisticData: optimisticData, failureData: failureData, successData: successData });
}
function updateNetSuiteSyncReimbursedReports(policyID, value) {
    var onyxData = updateNetSuiteSyncOptionsOnyxData(policyID, CONST_1.default.NETSUITE_CONFIG.SYNC_OPTIONS.SYNC_REIMBURSED_REPORTS, value, !value);
    var parameters = {
        policyID: policyID,
        enabled: value,
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_NETSUITE_SYNC_REIMBURSED_REPORTS, parameters, onyxData);
}
function updateNetSuiteSyncPeople(policyID, value) {
    var onyxData = updateNetSuiteSyncOptionsOnyxData(policyID, CONST_1.default.NETSUITE_CONFIG.SYNC_OPTIONS.SYNC_PEOPLE, value, !value);
    var parameters = {
        policyID: policyID,
        enabled: value,
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_NETSUITE_SYNC_PEOPLE, parameters, onyxData);
}
function updateNetSuiteAutoCreateEntities(policyID, value) {
    var onyxData = updateNetSuiteOnyxData(policyID, CONST_1.default.NETSUITE_CONFIG.AUTO_CREATE_ENTITIES, value, !value);
    var parameters = {
        policyID: policyID,
        enabled: value,
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_NETSUITE_AUTO_CREATE_ENTITIES, parameters, onyxData);
}
function updateNetSuiteEnableNewCategories(policyID, value) {
    var onyxData = updateNetSuiteSyncOptionsOnyxData(policyID, CONST_1.default.NETSUITE_CONFIG.SYNC_OPTIONS.ENABLE_NEW_CATEGORIES, value, !value);
    var parameters = {
        policyID: policyID,
        enabled: value,
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_NETSUITE_ENABLE_NEW_CATEGORIES, parameters, onyxData);
}
function updateNetSuiteCustomFormIDOptionsEnabled(policyID, value) {
    var data = {
        enabled: value,
    };
    var oldData = {
        enabled: !value,
    };
    var onyxData = updateNetSuiteOnyxData(policyID, CONST_1.default.NETSUITE_CONFIG.CUSTOM_FORM_ID_OPTIONS, data, oldData);
    var parameters = {
        policyID: policyID,
        enabled: value,
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_NETSUITE_CUSTOM_FORM_ID_OPTIONS_ENABLED, parameters, onyxData);
}
function updateNetSuiteReimbursementAccountID(policyID, bankAccountID, oldBankAccountID) {
    var onyxData = updateNetSuiteOnyxData(policyID, CONST_1.default.NETSUITE_CONFIG.REIMBURSEMENT_ACCOUNT_ID, bankAccountID, oldBankAccountID);
    var parameters = {
        policyID: policyID,
        bankAccountID: bankAccountID,
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_NETSUITE_REIMBURSEMENT_ACCOUNT_ID, parameters, onyxData);
}
function updateNetSuiteCollectionAccount(policyID, bankAccountID, oldBankAccountID) {
    var onyxData = updateNetSuiteOnyxData(policyID, CONST_1.default.NETSUITE_CONFIG.COLLECTION_ACCOUNT, bankAccountID, oldBankAccountID);
    var parameters = {
        policyID: policyID,
        bankAccountID: bankAccountID,
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_NETSUITE_COLLECTION_ACCOUNT, parameters, onyxData);
}
function updateNetSuiteExportReportsTo(policyID, approvalLevel, oldApprovalLevel) {
    var onyxData = updateNetSuiteSyncOptionsOnyxData(policyID, CONST_1.default.NETSUITE_CONFIG.SYNC_OPTIONS.EXPORT_REPORTS_TO, approvalLevel, oldApprovalLevel);
    var parameters = {
        policyID: policyID,
        value: approvalLevel,
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_NETSUITE_EXPORT_REPORTS_TO, parameters, onyxData);
}
function updateNetSuiteAccountingMethod(policyID, accountingMethod, oldAccountingMethod) {
    if (!policyID) {
        return;
    }
    var onyxData = updateNetSuiteOnyxData(policyID, CONST_1.default.NETSUITE_CONFIG.ACCOUNTING_METHOD, accountingMethod, oldAccountingMethod);
    var parameters = {
        policyID: policyID,
        accountingMethod: accountingMethod,
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_NETSUITE_ACCOUNTING_METHOD, parameters, onyxData);
}
function updateNetSuiteExportVendorBillsTo(policyID, approvalLevel, oldApprovalLevel) {
    var onyxData = updateNetSuiteSyncOptionsOnyxData(policyID, CONST_1.default.NETSUITE_CONFIG.SYNC_OPTIONS.EXPORT_VENDOR_BILLS_TO, approvalLevel, oldApprovalLevel);
    var parameters = {
        policyID: policyID,
        value: approvalLevel,
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_NETSUITE_VENDOR_BILLS_TO, parameters, onyxData);
}
function updateNetSuiteExportJournalsTo(policyID, approvalLevel, oldApprovalLevel) {
    var onyxData = updateNetSuiteSyncOptionsOnyxData(policyID, CONST_1.default.NETSUITE_CONFIG.SYNC_OPTIONS.EXPORT_JOURNALS_TO, approvalLevel, oldApprovalLevel);
    var parameters = {
        policyID: policyID,
        value: approvalLevel,
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_NETSUITE_JOURNALS_TO, parameters, onyxData);
}
function updateNetSuiteApprovalAccount(policyID, value, oldValue) {
    var onyxData = updateNetSuiteOnyxData(policyID, CONST_1.default.NETSUITE_CONFIG.APPROVAL_ACCOUNT, value, oldValue);
    var parameters = {
        policyID: policyID,
        value: value,
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_NETSUITE_APPROVAL_ACCOUNT, parameters, onyxData);
}
function updateNetSuiteCustomFormIDOptions(policyID, value, isReimbursable, exportDestination, oldCustomFormID) {
    var _a, _b, _c;
    var _d;
    var customFormIDKey = isReimbursable ? CONST_1.default.NETSUITE_CONFIG.CUSTOM_FORM_ID_TYPE.REIMBURSABLE : CONST_1.default.NETSUITE_CONFIG.CUSTOM_FORM_ID_TYPE.NON_REIMBURSABLE;
    var data = (_a = {},
        _a[customFormIDKey] = (_b = {},
            _b[CONST_1.default.NETSUITE_MAP_EXPORT_DESTINATION[exportDestination]] = value,
            _b),
        _a);
    var oldData = (_c = {},
        _c[customFormIDKey] = (_d = oldCustomFormID === null || oldCustomFormID === void 0 ? void 0 : oldCustomFormID[customFormIDKey]) !== null && _d !== void 0 ? _d : null,
        _c);
    var onyxData = updateNetSuiteOnyxData(policyID, CONST_1.default.NETSUITE_CONFIG.CUSTOM_FORM_ID_OPTIONS, data, oldData);
    var commandName = isReimbursable ? types_1.WRITE_COMMANDS.UPDATE_NETSUITE_CUSTOM_FORM_ID_OPTIONS_REIMBURSABLE : types_1.WRITE_COMMANDS.UPDATE_NETSUITE_CUSTOM_FORM_ID_OPTIONS_NON_REIMBURSABLE;
    var parameters = {
        policyID: policyID,
        formType: CONST_1.default.NETSUITE_MAP_EXPORT_DESTINATION[exportDestination],
        formID: value,
    };
    API.write(commandName, parameters, onyxData);
}
