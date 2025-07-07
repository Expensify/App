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
exports.connectToSageIntacct = connectToSageIntacct;
exports.updateSageIntacctBillable = updateSageIntacctBillable;
exports.updateSageIntacctSyncTaxConfiguration = updateSageIntacctSyncTaxConfiguration;
exports.addSageIntacctUserDimensions = addSageIntacctUserDimensions;
exports.updateSageIntacctMappingValue = updateSageIntacctMappingValue;
exports.editSageIntacctUserDimensions = editSageIntacctUserDimensions;
exports.removeSageIntacctUserDimensions = removeSageIntacctUserDimensions;
exports.removeSageIntacctUserDimensionsByName = removeSageIntacctUserDimensionsByName;
exports.updateSageIntacctExporter = updateSageIntacctExporter;
exports.clearSageIntacctErrorField = clearSageIntacctErrorField;
exports.clearSageIntacctPendingField = clearSageIntacctPendingField;
exports.updateSageIntacctExportDate = updateSageIntacctExportDate;
exports.updateSageIntacctReimbursableExpensesExportDestination = updateSageIntacctReimbursableExpensesExportDestination;
exports.updateSageIntacctNonreimbursableExpensesExportDestination = updateSageIntacctNonreimbursableExpensesExportDestination;
exports.updateSageIntacctNonreimbursableExpensesExportAccount = updateSageIntacctNonreimbursableExpensesExportAccount;
exports.updateSageIntacctDefaultVendor = updateSageIntacctDefaultVendor;
exports.updateSageIntacctAutoSync = updateSageIntacctAutoSync;
exports.updateSageIntacctImportEmployees = updateSageIntacctImportEmployees;
exports.updateSageIntacctApprovalMode = updateSageIntacctApprovalMode;
exports.updateSageIntacctSyncReimbursedReports = updateSageIntacctSyncReimbursedReports;
exports.updateSageIntacctSyncReimbursementAccountID = updateSageIntacctSyncReimbursementAccountID;
exports.updateSageIntacctEntity = updateSageIntacctEntity;
exports.changeMappingsValueFromDefaultToTag = changeMappingsValueFromDefaultToTag;
exports.UpdateSageIntacctTaxSolutionID = UpdateSageIntacctTaxSolutionID;
var react_native_onyx_1 = require("react-native-onyx");
var API = require("@libs/API");
var types_1 = require("@libs/API/types");
var ErrorUtils = require("@libs/ErrorUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
function connectToSageIntacct(policyID, credentials) {
    var parameters = {
        policyID: policyID,
        intacctCompanyID: credentials.companyID,
        intacctUserID: credentials.userID,
        intacctPassword: credentials.password,
    };
    API.write(types_1.WRITE_COMMANDS.CONNECT_POLICY_TO_SAGE_INTACCT, parameters, {});
}
function prepareOnyxDataForMappingUpdate(policyID, mappingName, mappingValue, oldMappingValue) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                connections: {
                    intacct: {
                        config: {
                            mappings: (_a = {},
                                _a[mappingName] = mappingValue,
                                _a),
                            pendingFields: (_b = {},
                                _b[mappingName] = CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                                _b),
                            errorFields: (_c = {},
                                _c[mappingName] = null,
                                _c),
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
                    intacct: {
                        config: {
                            mappings: (_d = {},
                                _d[mappingName] = oldMappingValue !== null && oldMappingValue !== void 0 ? oldMappingValue : null,
                                _d),
                            pendingFields: (_e = {},
                                _e[mappingName] = null,
                                _e),
                            errorFields: (_f = {},
                                _f[mappingName] = ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                                _f),
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
                    intacct: {
                        config: {
                            pendingFields: (_g = {},
                                _g[mappingName] = null,
                                _g),
                            errorFields: (_h = {},
                                _h[mappingName] = undefined,
                                _h),
                        },
                    },
                },
            },
        },
    ];
    return { optimisticData: optimisticData, failureData: failureData, successData: successData };
}
function updateSageIntacctBillable(policyID, enabled) {
    if (!policyID) {
        return;
    }
    var parameters = {
        policyID: policyID,
        enabled: enabled,
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_SAGE_INTACCT_BILLABLE, parameters, prepareOnyxDataForMappingUpdate(policyID, CONST_1.default.SAGE_INTACCT_CONFIG.SYNC_ITEMS, enabled, !enabled));
}
function getCommandForMapping(mappingName) {
    switch (mappingName) {
        case CONST_1.default.SAGE_INTACCT_CONFIG.MAPPINGS.DEPARTMENTS:
            return types_1.WRITE_COMMANDS.UPDATE_SAGE_INTACCT_DEPARTMENT_MAPPING;
        case CONST_1.default.SAGE_INTACCT_CONFIG.MAPPINGS.CLASSES:
            return types_1.WRITE_COMMANDS.UPDATE_SAGE_INTACCT_CLASSES_MAPPING;
        case CONST_1.default.SAGE_INTACCT_CONFIG.MAPPINGS.LOCATIONS:
            return types_1.WRITE_COMMANDS.UPDATE_SAGE_INTACCT_LOCATIONS_MAPPING;
        case CONST_1.default.SAGE_INTACCT_CONFIG.MAPPINGS.CUSTOMERS:
            return types_1.WRITE_COMMANDS.UPDATE_SAGE_INTACCT_CUSTOMERS_MAPPING;
        case CONST_1.default.SAGE_INTACCT_CONFIG.MAPPINGS.PROJECTS:
            return types_1.WRITE_COMMANDS.UPDATE_SAGE_INTACCT_PROJECTS_MAPPING;
        default:
            return undefined;
    }
}
function updateSageIntacctMappingValue(policyID, mappingName, mappingValue, oldMappingValue) {
    var command = getCommandForMapping(mappingName);
    if (!command) {
        return;
    }
    var onyxData = prepareOnyxDataForMappingUpdate(policyID, mappingName, mappingValue, oldMappingValue);
    API.write(command, {
        policyID: policyID,
        mapping: mappingValue,
    }, onyxData);
}
function changeMappingsValueFromDefaultToTag(policyID, mappings) {
    if ((mappings === null || mappings === void 0 ? void 0 : mappings.departments) === CONST_1.default.SAGE_INTACCT_MAPPING_VALUE.DEFAULT) {
        updateSageIntacctMappingValue(policyID, CONST_1.default.SAGE_INTACCT_CONFIG.MAPPINGS.DEPARTMENTS, CONST_1.default.SAGE_INTACCT_MAPPING_VALUE.TAG, CONST_1.default.SAGE_INTACCT_MAPPING_VALUE.DEFAULT);
    }
    if ((mappings === null || mappings === void 0 ? void 0 : mappings.classes) === CONST_1.default.SAGE_INTACCT_MAPPING_VALUE.DEFAULT) {
        updateSageIntacctMappingValue(policyID, CONST_1.default.SAGE_INTACCT_CONFIG.MAPPINGS.CLASSES, CONST_1.default.SAGE_INTACCT_MAPPING_VALUE.TAG, CONST_1.default.SAGE_INTACCT_MAPPING_VALUE.DEFAULT);
    }
    if ((mappings === null || mappings === void 0 ? void 0 : mappings.locations) === CONST_1.default.SAGE_INTACCT_MAPPING_VALUE.DEFAULT) {
        updateSageIntacctMappingValue(policyID, CONST_1.default.SAGE_INTACCT_CONFIG.MAPPINGS.LOCATIONS, CONST_1.default.SAGE_INTACCT_MAPPING_VALUE.TAG, CONST_1.default.SAGE_INTACCT_MAPPING_VALUE.DEFAULT);
    }
}
function UpdateSageIntacctTaxSolutionID(policyID, taxSolutionID) {
    if (!policyID) {
        return;
    }
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                connections: {
                    intacct: {
                        config: {
                            tax: {
                                taxSolutionID: taxSolutionID,
                            },
                            pendingFields: {
                                tax: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                            },
                            errorFields: {
                                taxSolutionID: null,
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
                    intacct: {
                        config: {
                            tax: {
                                taxSolutionID: null,
                            },
                            pendingFields: {
                                tax: null,
                            },
                            errorFields: {
                                taxSolutionID: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
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
                    intacct: {
                        config: {
                            pendingFields: {
                                tax: null,
                            },
                            errorFields: {
                                taxSolutionID: null,
                            },
                        },
                    },
                },
            },
        },
    ];
    API.write(types_1.WRITE_COMMANDS.UPDATE_SAGE_INTACCT_TAX_SOLUTION_ID, { policyID: policyID, taxSolutionID: taxSolutionID }, { optimisticData: optimisticData, failureData: failureData, successData: successData });
}
function updateSageIntacctSyncTaxConfiguration(policyID, enabled) {
    if (!policyID) {
        return;
    }
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                connections: {
                    intacct: {
                        config: {
                            tax: {
                                syncTax: enabled,
                            },
                            pendingFields: {
                                tax: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                            },
                            errorFields: {
                                tax: null,
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
                    intacct: {
                        config: {
                            tax: {
                                syncTax: !enabled,
                            },
                            pendingFields: {
                                tax: null,
                            },
                            errorFields: {
                                tax: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
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
                    intacct: {
                        config: {
                            pendingFields: {
                                tax: null,
                            },
                            errorFields: {
                                tax: undefined,
                            },
                        },
                    },
                },
            },
        },
    ];
    API.write(types_1.WRITE_COMMANDS.UPDATE_SAGE_INTACCT_SYNC_TAX_CONFIGURATION, { policyID: policyID, enabled: enabled }, { optimisticData: optimisticData, failureData: failureData, successData: successData });
}
function prepareOnyxDataForUserDimensionUpdate(policyID, dimensionName, newDimensions, oldDimensions, oldDimensionName, pendingAction) {
    var _a, _b, _c, _d, _e, _f;
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                connections: {
                    intacct: {
                        config: {
                            mappings: {
                                dimensions: newDimensions,
                            },
                            pendingFields: (_a = {}, _a["".concat(CONST_1.default.SAGE_INTACCT_CONFIG.DIMENSION_PREFIX).concat(dimensionName)] = pendingAction, _a),
                            errorFields: (_b = {}, _b["".concat(CONST_1.default.SAGE_INTACCT_CONFIG.DIMENSION_PREFIX).concat(dimensionName)] = null, _b),
                        },
                    },
                },
            },
        },
    ];
    var pendingActionAfterFailure = pendingAction === CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD ? pendingAction : null;
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                connections: {
                    intacct: {
                        config: {
                            mappings: {
                                dimensions: oldDimensions,
                            },
                            pendingFields: (_c = {}, _c["".concat(CONST_1.default.SAGE_INTACCT_CONFIG.DIMENSION_PREFIX).concat(oldDimensionName)] = pendingActionAfterFailure, _c),
                            errorFields: (_d = {},
                                _d["".concat(CONST_1.default.SAGE_INTACCT_CONFIG.DIMENSION_PREFIX).concat(oldDimensionName)] = ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                                _d),
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
                    intacct: {
                        config: {
                            mappings: {
                                dimensions: newDimensions,
                            },
                            pendingFields: (_e = {}, _e["".concat(CONST_1.default.SAGE_INTACCT_CONFIG.DIMENSION_PREFIX).concat(dimensionName)] = null, _e),
                            errorFields: (_f = {}, _f["".concat(CONST_1.default.SAGE_INTACCT_CONFIG.DIMENSION_PREFIX).concat(dimensionName)] = null, _f),
                        },
                    },
                },
            },
        },
    ];
    return { optimisticData: optimisticData, failureData: failureData, successData: successData };
}
function addSageIntacctUserDimensions(policyID, dimensionName, mapping, existingUserDimensions) {
    var newDimensions = __spreadArray(__spreadArray([], existingUserDimensions, true), [{ mapping: mapping, dimension: dimensionName }], false);
    API.write(types_1.WRITE_COMMANDS.UPDATE_SAGE_INTACCT_USER_DIMENSION, { policyID: policyID, dimensions: JSON.stringify(newDimensions) }, prepareOnyxDataForUserDimensionUpdate(policyID, dimensionName, newDimensions, newDimensions, dimensionName, CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD));
}
function editSageIntacctUserDimensions(policyID, previousName, name, mapping, existingUserDimensions) {
    var newDimensions = existingUserDimensions.map(function (userDimension) {
        if (userDimension.dimension === previousName) {
            return { dimension: name, mapping: mapping };
        }
        return userDimension;
    });
    API.write(types_1.WRITE_COMMANDS.UPDATE_SAGE_INTACCT_USER_DIMENSION, { policyID: policyID, dimensions: JSON.stringify(newDimensions) }, prepareOnyxDataForUserDimensionUpdate(policyID, name, newDimensions, existingUserDimensions, previousName, CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE));
}
function removeSageIntacctUserDimensions(policyID, dimensionName, existingUserDimensions) {
    var newDimensions = existingUserDimensions.filter(function (userDimension) { return dimensionName !== userDimension.dimension; });
    API.write(types_1.WRITE_COMMANDS.UPDATE_SAGE_INTACCT_USER_DIMENSION, { policyID: policyID, dimensions: JSON.stringify(newDimensions) }, prepareOnyxDataForUserDimensionUpdate(policyID, dimensionName, newDimensions, existingUserDimensions, dimensionName, CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE));
}
function prepareOnyxDataForExportUpdate(policyID, settingName, settingValue, oldSettingValue) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    var exporterOptimisticData = settingName === CONST_1.default.SAGE_INTACCT_CONFIG.EXPORTER ? { exporter: settingValue } : {};
    var exporterErrorData = settingName === CONST_1.default.SAGE_INTACCT_CONFIG.EXPORTER ? { exporter: oldSettingValue } : {};
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: __assign(__assign({}, exporterOptimisticData), { connections: {
                    intacct: {
                        config: {
                            export: (_a = {},
                                _a[settingName] = settingValue,
                                _a),
                            pendingFields: (_b = {},
                                _b[settingName] = CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                                _b),
                            errorFields: (_c = {},
                                _c[settingName] = null,
                                _c),
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
                    intacct: {
                        config: {
                            export: (_d = {},
                                _d[settingName] = oldSettingValue !== null && oldSettingValue !== void 0 ? oldSettingValue : null,
                                _d),
                            pendingFields: (_e = {},
                                _e[settingName] = null,
                                _e),
                            errorFields: (_f = {},
                                _f[settingName] = ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                                _f),
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
                    intacct: {
                        config: {
                            pendingFields: (_g = {},
                                _g[settingName] = null,
                                _g),
                            errorFields: (_h = {},
                                _h[settingName] = null,
                                _h),
                        },
                    },
                },
            },
        },
    ];
    return { optimisticData: optimisticData, failureData: failureData, successData: successData };
}
function updateSageIntacctExporter(policyID, exporter, oldExporter) {
    var _a = prepareOnyxDataForExportUpdate(policyID, CONST_1.default.SAGE_INTACCT_CONFIG.EXPORTER, exporter, oldExporter), optimisticData = _a.optimisticData, failureData = _a.failureData, successData = _a.successData;
    var parameters = {
        policyID: policyID,
        email: exporter,
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_SAGE_INTACCT_EXPORTER, parameters, { optimisticData: optimisticData, failureData: failureData, successData: successData });
}
function updateSageIntacctExportDate(policyID, date, oldDate) {
    var _a = prepareOnyxDataForExportUpdate(policyID, CONST_1.default.SAGE_INTACCT_CONFIG.EXPORT_DATE, date, oldDate), optimisticData = _a.optimisticData, failureData = _a.failureData, successData = _a.successData;
    var parameters = {
        policyID: policyID,
        value: date,
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_SAGE_INTACCT_EXPORT_DATE, parameters, { optimisticData: optimisticData, failureData: failureData, successData: successData });
}
function updateSageIntacctReimbursableExpensesExportDestination(policyID, reimbursable, oldReimbursable) {
    var _a = prepareOnyxDataForExportUpdate(policyID, CONST_1.default.SAGE_INTACCT_CONFIG.REIMBURSABLE, reimbursable, oldReimbursable), optimisticData = _a.optimisticData, failureData = _a.failureData, successData = _a.successData;
    var parameters = {
        policyID: policyID,
        value: reimbursable,
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_SAGE_INTACCT_REIMBURSABLE_EXPENSES_EXPORT_DESTINATION, parameters, { optimisticData: optimisticData, failureData: failureData, successData: successData });
}
function updateSageIntacctNonreimbursableExpensesExportDestination(policyID, nonReimbursable, oldNonReimbursable) {
    var _a = prepareOnyxDataForExportUpdate(policyID, CONST_1.default.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE, nonReimbursable, oldNonReimbursable), optimisticData = _a.optimisticData, failureData = _a.failureData, successData = _a.successData;
    var parameters = {
        policyID: policyID,
        value: nonReimbursable,
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_SAGE_INTACCT_NON_REIMBURSABLE_EXPENSES_EXPORT_DESTINATION, parameters, { optimisticData: optimisticData, failureData: failureData, successData: successData });
}
function updateSageIntacctReimbursableExpensesReportExportDefaultVendor(policyID, vendor, oldVendor) {
    var _a = prepareOnyxDataForExportUpdate(policyID, CONST_1.default.SAGE_INTACCT_CONFIG.REIMBURSABLE_VENDOR, vendor, oldVendor), optimisticData = _a.optimisticData, failureData = _a.failureData, successData = _a.successData;
    var parameters = {
        policyID: policyID,
        vendorID: vendor,
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_SAGE_INTACCT_REIMBURSABLE_EXPENSES_REPORT_EXPORT_DEFAULT_VENDOR, parameters, { optimisticData: optimisticData, failureData: failureData, successData: successData });
}
function updateSageIntacctNonreimbursableExpensesCreditCardChargeExportDefaultVendor(policyID, vendor, oldVendor) {
    var _a = prepareOnyxDataForExportUpdate(policyID, CONST_1.default.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE_CREDIT_CARD_VENDOR, vendor, oldVendor), optimisticData = _a.optimisticData, failureData = _a.failureData, successData = _a.successData;
    var parameters = {
        policyID: policyID,
        vendorID: vendor,
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_SAGE_INTACCT_NON_REIMBURSABLE_EXPENSES_CREDIT_CARD_CHARGE_EXPORT_DEFAULT_VENDOR, parameters, { optimisticData: optimisticData, failureData: failureData, successData: successData });
}
function updateSageIntacctNonreimbursableExpensesExportAccount(policyID, nonReimbursableAccount, oldReimbursableAccount) {
    var _a = prepareOnyxDataForExportUpdate(policyID, CONST_1.default.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE_ACCOUNT, nonReimbursableAccount, oldReimbursableAccount), optimisticData = _a.optimisticData, failureData = _a.failureData, successData = _a.successData;
    var parameters = {
        policyID: policyID,
        creditCardAccountID: nonReimbursableAccount,
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_SAGE_INTACCT_NON_REIMBURSABLE_EXPENSES_EXPORT_ACCOUNT, parameters, { optimisticData: optimisticData, failureData: failureData, successData: successData });
}
function updateSageIntacctNonreimbursableExpensesExportVendor(policyID, vendor, oldVendor) {
    var _a = prepareOnyxDataForExportUpdate(policyID, CONST_1.default.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE_VENDOR, vendor, oldVendor), optimisticData = _a.optimisticData, failureData = _a.failureData, successData = _a.successData;
    var parameters = {
        policyID: policyID,
        vendorID: vendor,
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_SAGE_INTACCT_NON_REIMBURSABLE_EXPENSES_EXPORT_VENDOR, parameters, { optimisticData: optimisticData, failureData: failureData, successData: successData });
}
function updateSageIntacctDefaultVendor(policyID, settingName, vendor, oldVendor) {
    if (settingName === CONST_1.default.SAGE_INTACCT_CONFIG.REIMBURSABLE_VENDOR) {
        updateSageIntacctReimbursableExpensesReportExportDefaultVendor(policyID, vendor, oldVendor);
    }
    else if (settingName === CONST_1.default.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE_CREDIT_CARD_VENDOR) {
        updateSageIntacctNonreimbursableExpensesCreditCardChargeExportDefaultVendor(policyID, vendor, oldVendor);
    }
    else if (settingName === CONST_1.default.SAGE_INTACCT_CONFIG.NON_REIMBURSABLE_VENDOR) {
        updateSageIntacctNonreimbursableExpensesExportVendor(policyID, vendor, oldVendor);
    }
}
function clearSageIntacctErrorField(policyID, key) {
    var _a;
    react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), { connections: { intacct: { config: { errorFields: (_a = {}, _a[key] = null, _a) } } } });
}
function clearSageIntacctPendingField(policyID, key) {
    var _a;
    react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), { connections: { intacct: { config: { pendingFields: (_a = {}, _a[key] = null, _a) } } } });
}
function removeSageIntacctUserDimensionsByName(dimensions, policyID, dimensionName) {
    var Dimensions = dimensions.filter(function (dimension) { return dimension.dimension !== dimensionName; });
    react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), { connections: { intacct: { config: { mappings: { dimensions: Dimensions } } } } });
}
function prepareOnyxDataForConfigUpdate(policyID, settingName, settingValue, oldSettingValue) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                connections: {
                    intacct: {
                        config: (_a = {},
                            _a[settingName] = settingValue,
                            _a.pendingFields = (_b = {},
                                _b[settingName] = CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                                _b),
                            _a.errorFields = (_c = {},
                                _c[settingName] = null,
                                _c),
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
                    intacct: {
                        config: (_d = {},
                            _d[settingName] = oldSettingValue !== null && oldSettingValue !== void 0 ? oldSettingValue : null,
                            _d.pendingFields = (_e = {},
                                _e[settingName] = null,
                                _e),
                            _d.errorFields = (_f = {},
                                _f[settingName] = ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                                _f),
                            _d),
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
                    intacct: {
                        config: {
                            pendingFields: (_g = {},
                                _g[settingName] = null,
                                _g),
                            errorFields: (_h = {},
                                _h[settingName] = null,
                                _h),
                        },
                    },
                },
            },
        },
    ];
    return { optimisticData: optimisticData, failureData: failureData, successData: successData };
}
function prepareOnyxDataForSyncUpdate(policyID, settingName, settingValue, oldSettingValue) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                connections: {
                    intacct: {
                        config: {
                            sync: (_a = {},
                                _a[settingName] = settingValue,
                                _a),
                            pendingFields: (_b = {},
                                _b[settingName] = CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                                _b),
                            errorFields: (_c = {},
                                _c[settingName] = null,
                                _c),
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
                    intacct: {
                        config: {
                            sync: (_d = {},
                                _d[settingName] = oldSettingValue !== null && oldSettingValue !== void 0 ? oldSettingValue : null,
                                _d),
                            pendingFields: (_e = {},
                                _e[settingName] = null,
                                _e),
                            errorFields: (_f = {},
                                _f[settingName] = ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                                _f),
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
                    intacct: {
                        config: {
                            pendingFields: (_g = {},
                                _g[settingName] = null,
                                _g),
                            errorFields: (_h = {},
                                _h[settingName] = null,
                                _h),
                        },
                    },
                },
            },
        },
    ];
    return { optimisticData: optimisticData, failureData: failureData, successData: successData };
}
function prepareOnyxDataForAutoSyncUpdate(policyID, settingName, settingValue) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                connections: {
                    intacct: {
                        config: {
                            autoSync: (_a = {},
                                _a[settingName] = settingValue,
                                _a),
                            pendingFields: (_b = {},
                                _b[settingName] = CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                                _b),
                            errorFields: (_c = {},
                                _c[settingName] = null,
                                _c),
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
                    intacct: {
                        config: {
                            autoSync: (_d = {},
                                _d[settingName] = !settingValue,
                                _d),
                            pendingFields: (_e = {},
                                _e[settingName] = null,
                                _e),
                            errorFields: (_f = {},
                                _f[settingName] = ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                                _f),
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
                    intacct: {
                        config: {
                            pendingFields: (_g = {},
                                _g[settingName] = null,
                                _g),
                            errorFields: (_h = {},
                                _h[settingName] = null,
                                _h),
                        },
                    },
                },
            },
        },
    ];
    return { optimisticData: optimisticData, failureData: failureData, successData: successData };
}
function updateSageIntacctAutoSync(policyID, enabled) {
    var _a = prepareOnyxDataForAutoSyncUpdate(policyID, CONST_1.default.SAGE_INTACCT_CONFIG.AUTO_SYNC_ENABLED, enabled), optimisticData = _a.optimisticData, failureData = _a.failureData, successData = _a.successData;
    var parameters = {
        policyID: policyID,
        enabled: enabled,
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_SAGE_INTACCT_AUTO_SYNC, parameters, { optimisticData: optimisticData, failureData: failureData, successData: successData });
}
function updateSageIntacctImportEmployees(policyID, enabled) {
    var _a = prepareOnyxDataForConfigUpdate(policyID, CONST_1.default.SAGE_INTACCT_CONFIG.IMPORT_EMPLOYEES, enabled, !enabled), optimisticData = _a.optimisticData, failureData = _a.failureData, successData = _a.successData;
    var parameters = {
        policyID: policyID,
        enabled: enabled,
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_SAGE_INTACCT_IMPORT_EMPLOYEES, parameters, { optimisticData: optimisticData, failureData: failureData, successData: successData });
}
function updateSageIntacctApprovalMode(policyID, enabled) {
    var approvalModeSettingValue = enabled ? CONST_1.default.SAGE_INTACCT.APPROVAL_MODE.APPROVAL_MANUAL : '';
    var oldApprovalModeSettingValue = enabled ? '' : CONST_1.default.SAGE_INTACCT.APPROVAL_MODE.APPROVAL_MANUAL;
    var _a = prepareOnyxDataForConfigUpdate(policyID, CONST_1.default.SAGE_INTACCT_CONFIG.APPROVAL_MODE, approvalModeSettingValue, oldApprovalModeSettingValue), optimisticData = _a.optimisticData, failureData = _a.failureData, successData = _a.successData;
    var parameters = {
        policyID: policyID,
        value: approvalModeSettingValue,
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_SAGE_INTACCT_APPROVAL_MODE, parameters, { optimisticData: optimisticData, failureData: failureData, successData: successData });
}
function updateSageIntacctSyncReimbursedReports(policyID, enabled) {
    var _a = prepareOnyxDataForSyncUpdate(policyID, CONST_1.default.SAGE_INTACCT_CONFIG.SYNC_REIMBURSED_REPORTS, enabled, !enabled), optimisticData = _a.optimisticData, failureData = _a.failureData, successData = _a.successData;
    var parameters = {
        policyID: policyID,
        enabled: enabled,
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_SAGE_INTACCT_SYNC_REIMBURSED_REPORTS, parameters, { optimisticData: optimisticData, failureData: failureData, successData: successData });
}
function updateSageIntacctSyncReimbursementAccountID(policyID, vendorID, oldVendorID) {
    var _a = prepareOnyxDataForSyncUpdate(policyID, CONST_1.default.SAGE_INTACCT_CONFIG.REIMBURSEMENT_ACCOUNT_ID, vendorID, oldVendorID), optimisticData = _a.optimisticData, failureData = _a.failureData, successData = _a.successData;
    var parameters = {
        policyID: policyID,
        vendorID: vendorID,
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_SAGE_INTACCT_SYNC_REIMBURSEMENT_ACCOUNT_ID, parameters, { optimisticData: optimisticData, failureData: failureData, successData: successData });
}
function updateSageIntacctEntity(policyID, entity, oldEntity) {
    var parameters = {
        policyID: policyID,
        entity: entity,
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_SAGE_INTACCT_ENTITY, parameters, prepareOnyxDataForConfigUpdate(policyID, CONST_1.default.SAGE_INTACCT_CONFIG.ENTITY, entity, oldEntity));
}
