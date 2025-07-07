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
exports.validateTaxValue = exports.validateTaxCode = exports.validateTaxName = void 0;
exports.createPolicyTax = createPolicyTax;
exports.getNextTaxCode = getNextTaxCode;
exports.clearTaxRateError = clearTaxRateError;
exports.clearTaxRateFieldError = clearTaxRateFieldError;
exports.getTaxValueWithPercentage = getTaxValueWithPercentage;
exports.setPolicyTaxesEnabled = setPolicyTaxesEnabled;
exports.deletePolicyTaxes = deletePolicyTaxes;
exports.updatePolicyTaxValue = updatePolicyTaxValue;
exports.renamePolicyTax = renamePolicyTax;
exports.setPolicyTaxCode = setPolicyTaxCode;
var react_native_onyx_1 = require("react-native-onyx");
var API = require("@libs/API");
var types_1 = require("@libs/API/types");
var Localize_1 = require("@libs/Localize");
var PolicyUtils = require("@libs/PolicyUtils");
var ValidationUtils = require("@libs/ValidationUtils");
var CONST_1 = require("@src/CONST");
var ErrorUtils = require("@src/libs/ErrorUtils");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var WorkspaceNewTaxForm_1 = require("@src/types/form/WorkspaceNewTaxForm");
// eslint-disable-next-line import/no-named-default
var WorkspaceTaxCodeForm_1 = require("@src/types/form/WorkspaceTaxCodeForm");
var allPolicies;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.COLLECTION.POLICY,
    waitForCollectionCallback: true,
    callback: function (value) { return (allPolicies = value); },
});
/**
 * Get tax value with percentage
 */
function getTaxValueWithPercentage(value) {
    return "".concat(value, "%");
}
function covertTaxNameToID(name) {
    return "id_".concat(name.toUpperCase().replaceAll(' ', '_'));
}
/**
 *  Function to validate tax name
 */
var validateTaxName = function (policy, values) {
    var _a;
    var errors = ValidationUtils.getFieldRequiredErrors(values, [WorkspaceNewTaxForm_1.default.NAME]);
    var name = values[WorkspaceNewTaxForm_1.default.NAME];
    if (name.length > CONST_1.default.TAX_RATES.NAME_MAX_LENGTH) {
        errors[WorkspaceNewTaxForm_1.default.NAME] = (0, Localize_1.translateLocal)('common.error.characterLimitExceedCounter', {
            length: name.length,
            limit: CONST_1.default.TAX_RATES.NAME_MAX_LENGTH,
        });
    }
    else if (((_a = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _a === void 0 ? void 0 : _a.taxes) && ValidationUtils.isExistingTaxName(name, policy.taxRates.taxes)) {
        errors[WorkspaceNewTaxForm_1.default.NAME] = (0, Localize_1.translateLocal)('workspace.taxes.error.taxRateAlreadyExists');
    }
    return errors;
};
exports.validateTaxName = validateTaxName;
var validateTaxCode = function (policy, values) {
    var _a;
    var errors = ValidationUtils.getFieldRequiredErrors(values, [WorkspaceTaxCodeForm_1.default.TAX_CODE]);
    var taxCode = values[WorkspaceTaxCodeForm_1.default.TAX_CODE];
    if (taxCode.length > CONST_1.default.TAX_RATES.NAME_MAX_LENGTH) {
        errors[WorkspaceTaxCodeForm_1.default.TAX_CODE] = (0, Localize_1.translateLocal)('common.error.characterLimitExceedCounter', {
            length: taxCode.length,
            limit: CONST_1.default.TAX_RATES.NAME_MAX_LENGTH,
        });
    }
    else if (((_a = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _a === void 0 ? void 0 : _a.taxes) && ValidationUtils.isExistingTaxCode(taxCode, policy.taxRates.taxes)) {
        errors[WorkspaceTaxCodeForm_1.default.TAX_CODE] = (0, Localize_1.translateLocal)('workspace.taxes.error.taxCodeAlreadyExists');
    }
    return errors;
};
exports.validateTaxCode = validateTaxCode;
/**
 *  Function to validate tax value
 */
var validateTaxValue = function (values) {
    var errors = ValidationUtils.getFieldRequiredErrors(values, [WorkspaceNewTaxForm_1.default.VALUE]);
    var value = values[WorkspaceNewTaxForm_1.default.VALUE];
    if (!ValidationUtils.isValidPercentage(value)) {
        errors[WorkspaceNewTaxForm_1.default.VALUE] = (0, Localize_1.translateLocal)('workspace.taxes.error.valuePercentageRange');
    }
    return errors;
};
exports.validateTaxValue = validateTaxValue;
/**
 * Get new tax ID
 */
function getNextTaxCode(name, taxRates) {
    var newID = covertTaxNameToID(name);
    if (!(taxRates === null || taxRates === void 0 ? void 0 : taxRates[newID])) {
        return newID;
    }
    // If the tax ID already exists, we need to find a unique ID
    var nextID = 1;
    while (taxRates === null || taxRates === void 0 ? void 0 : taxRates[covertTaxNameToID("".concat(name, "_").concat(nextID))]) {
        nextID++;
    }
    return covertTaxNameToID("".concat(name, "_").concat(nextID));
}
function createPolicyTax(policyID, taxRate) {
    var _a, _b, _c;
    if (!taxRate.code) {
        console.debug('Policy or tax rates not found');
        return;
    }
    var onyxData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    taxRates: {
                        taxes: (_a = {},
                            _a[taxRate.code] = __assign(__assign({}, taxRate), { pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD }),
                            _a),
                    },
                },
            },
        ],
        successData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    taxRates: {
                        taxes: (_b = {},
                            _b[taxRate.code] = {
                                errors: null,
                                pendingAction: null,
                            },
                            _b),
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    taxRates: {
                        taxes: (_c = {},
                            _c[taxRate.code] = {
                                errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('workspace.taxes.error.createFailureMessage'),
                            },
                            _c),
                    },
                },
            },
        ],
    };
    var parameters = {
        policyID: policyID,
        taxFields: JSON.stringify({
            name: taxRate.name,
            value: taxRate.value,
            enabled: true,
            taxCode: taxRate.code,
        }),
    };
    API.write(types_1.WRITE_COMMANDS.CREATE_POLICY_TAX, parameters, onyxData);
}
function clearTaxRateFieldError(policyID, taxID, field) {
    var _a, _b, _c;
    react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), {
        taxRates: {
            taxes: (_a = {},
                _a[taxID] = {
                    pendingFields: (_b = {},
                        _b[field] = null,
                        _b),
                    errorFields: (_c = {},
                        _c[field] = null,
                        _c),
                },
                _a),
        },
    });
}
function clearTaxRateError(policyID, taxID, pendingAction) {
    var _a, _b;
    if (pendingAction === CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD) {
        react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), {
            taxRates: {
                taxes: (_a = {},
                    _a[taxID] = null,
                    _a),
            },
        });
        return;
    }
    react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), {
        taxRates: {
            taxes: (_b = {},
                _b[taxID] = { pendingAction: null, errors: null, errorFields: null },
                _b),
        },
    });
}
function setPolicyTaxesEnabled(policy, taxesIDsToUpdate, isEnabled) {
    var _a;
    if (!policy) {
        return;
    }
    var originalTaxes = __assign({}, (_a = policy.taxRates) === null || _a === void 0 ? void 0 : _a.taxes);
    var onyxData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policy.id),
                value: {
                    taxRates: {
                        taxes: taxesIDsToUpdate.reduce(function (acc, taxID) {
                            acc[taxID] = {
                                isDisabled: !isEnabled,
                                pendingFields: { isDisabled: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE },
                                pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                                errorFields: { isDisabled: null },
                            };
                            return acc;
                        }, {}),
                    },
                },
            },
        ],
        successData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policy.id),
                value: {
                    taxRates: {
                        taxes: taxesIDsToUpdate.reduce(function (acc, taxID) {
                            acc[taxID] = { pendingFields: { isDisabled: null }, errorFields: { isDisabled: null }, pendingAction: null };
                            return acc;
                        }, {}),
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policy.id),
                value: {
                    taxRates: {
                        taxes: taxesIDsToUpdate.reduce(function (acc, taxID) {
                            acc[taxID] = {
                                isDisabled: !!originalTaxes[taxID].isDisabled,
                                pendingFields: { isDisabled: null },
                                pendingAction: null,
                                errorFields: { isDisabled: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('workspace.taxes.error.updateFailureMessage') },
                            };
                            return acc;
                        }, {}),
                    },
                },
            },
        ],
    };
    var parameters = {
        policyID: policy.id,
        taxFieldsArray: JSON.stringify(taxesIDsToUpdate.map(function (taxID) { return ({ taxCode: taxID, enabled: isEnabled }); })),
    };
    API.write(types_1.WRITE_COMMANDS.SET_POLICY_TAXES_ENABLED, parameters, onyxData);
}
function deletePolicyTaxes(policy, taxesToDelete) {
    var _a, _b, _c;
    var _d, _e, _f;
    var policyTaxRates = (_d = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _d === void 0 ? void 0 : _d.taxes;
    var foreignTaxDefault = (_e = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _e === void 0 ? void 0 : _e.foreignTaxDefault;
    var firstTaxID = Object.keys(policyTaxRates !== null && policyTaxRates !== void 0 ? policyTaxRates : {})
        .sort(function (a, b) { return a.localeCompare(b); })
        .at(0);
    var distanceRateCustomUnit = PolicyUtils.getDistanceRateCustomUnit(policy);
    var customUnitID = distanceRateCustomUnit === null || distanceRateCustomUnit === void 0 ? void 0 : distanceRateCustomUnit.customUnitID;
    var ratesToUpdate = Object.values((_f = distanceRateCustomUnit === null || distanceRateCustomUnit === void 0 ? void 0 : distanceRateCustomUnit.rates) !== null && _f !== void 0 ? _f : {}).filter(function (rate) { var _a, _b; return !!((_a = rate.attributes) === null || _a === void 0 ? void 0 : _a.taxRateExternalID) && taxesToDelete.includes((_b = rate.attributes) === null || _b === void 0 ? void 0 : _b.taxRateExternalID); });
    if (!policyTaxRates) {
        console.debug('Policy or tax rates not found');
        return;
    }
    var isForeignTaxRemoved = foreignTaxDefault && taxesToDelete.includes(foreignTaxDefault);
    var optimisticRates = {};
    var successRates = {};
    var failureRates = {};
    ratesToUpdate.forEach(function (rate) {
        var rateID = rate.customUnitRateID;
        optimisticRates[rateID] = {
            attributes: {
                taxRateExternalID: null,
                taxClaimablePercentage: null,
            },
            pendingFields: {
                taxRateExternalID: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                taxClaimablePercentage: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
            },
        };
        successRates[rateID] = { pendingFields: { taxRateExternalID: null, taxClaimablePercentage: null } };
        failureRates[rateID] = {
            attributes: __assign({}, rate === null || rate === void 0 ? void 0 : rate.attributes),
            pendingFields: { taxRateExternalID: null, taxClaimablePercentage: null },
            errorFields: {
                taxRateExternalID: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                taxClaimablePercentage: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
            },
        };
    });
    var onyxData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policy.id),
                value: {
                    taxRates: {
                        pendingFields: { foreignTaxDefault: isForeignTaxRemoved ? CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE : null },
                        foreignTaxDefault: isForeignTaxRemoved ? firstTaxID : foreignTaxDefault,
                        taxes: taxesToDelete.reduce(function (acc, taxID) {
                            acc[taxID] = { pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE, errors: null, isDisabled: true };
                            return acc;
                        }, {}),
                    },
                    customUnits: distanceRateCustomUnit &&
                        customUnitID && (_a = {},
                        _a[customUnitID] = {
                            rates: optimisticRates,
                        },
                        _a),
                },
            },
        ],
        successData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policy.id),
                value: {
                    taxRates: {
                        pendingFields: { foreignTaxDefault: null },
                        taxes: taxesToDelete.reduce(function (acc, taxID) {
                            acc[taxID] = null;
                            return acc;
                        }, {}),
                    },
                    customUnits: distanceRateCustomUnit &&
                        customUnitID && (_b = {},
                        _b[customUnitID] = {
                            rates: successRates,
                        },
                        _b),
                },
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policy.id),
                value: {
                    taxRates: {
                        pendingFields: { foreignTaxDefault: null },
                        taxes: taxesToDelete.reduce(function (acc, taxID) {
                            var _a;
                            acc[taxID] = {
                                pendingAction: null,
                                errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('workspace.taxes.error.deleteFailureMessage'),
                                isDisabled: !!((_a = policyTaxRates === null || policyTaxRates === void 0 ? void 0 : policyTaxRates[taxID]) === null || _a === void 0 ? void 0 : _a.isDisabled),
                            };
                            return acc;
                        }, {}),
                    },
                    customUnits: distanceRateCustomUnit &&
                        customUnitID && (_c = {},
                        _c[customUnitID] = {
                            rates: failureRates,
                        },
                        _c),
                },
            },
        ],
    };
    var parameters = {
        policyID: policy.id,
        taxNames: JSON.stringify(taxesToDelete.map(function (taxID) { return policyTaxRates[taxID].name; })),
    };
    API.write(types_1.WRITE_COMMANDS.DELETE_POLICY_TAXES, parameters, onyxData);
}
function updatePolicyTaxValue(policyID, taxID, taxValue) {
    var _a, _b, _c;
    var _d;
    var policy = allPolicies === null || allPolicies === void 0 ? void 0 : allPolicies["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID)];
    var originalTaxRate = __assign({}, (_d = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _d === void 0 ? void 0 : _d.taxes[taxID]);
    var stringTaxValue = "".concat(taxValue, "%");
    var onyxData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    taxRates: {
                        taxes: (_a = {},
                            _a[taxID] = {
                                value: stringTaxValue,
                                pendingFields: { value: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE },
                                pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                                errorFields: { value: null },
                            },
                            _a),
                    },
                },
            },
        ],
        successData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    taxRates: {
                        taxes: (_b = {},
                            _b[taxID] = { pendingFields: { value: null }, pendingAction: null, errorFields: { value: null } },
                            _b),
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    taxRates: {
                        taxes: (_c = {},
                            _c[taxID] = {
                                value: originalTaxRate.value,
                                pendingFields: { value: null },
                                pendingAction: null,
                                errorFields: { value: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('workspace.taxes.error.updateFailureMessage') },
                            },
                            _c),
                    },
                },
            },
        ],
    };
    var parameters = {
        policyID: policyID,
        taxCode: taxID,
        taxRate: stringTaxValue,
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_POLICY_TAX_VALUE, parameters, onyxData);
}
function renamePolicyTax(policyID, taxID, newName) {
    var _a, _b, _c;
    var _d;
    var policy = allPolicies === null || allPolicies === void 0 ? void 0 : allPolicies["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID)];
    var originalTaxRate = __assign({}, (_d = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _d === void 0 ? void 0 : _d.taxes[taxID]);
    var onyxData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    taxRates: {
                        taxes: (_a = {},
                            _a[taxID] = {
                                name: newName,
                                pendingFields: { name: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE },
                                pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                                errorFields: { name: null },
                            },
                            _a),
                    },
                },
            },
        ],
        successData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    taxRates: {
                        taxes: (_b = {},
                            _b[taxID] = { pendingFields: { name: null }, pendingAction: null, errorFields: { name: null } },
                            _b),
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    taxRates: {
                        taxes: (_c = {},
                            _c[taxID] = {
                                name: originalTaxRate.name,
                                pendingFields: { name: null },
                                pendingAction: null,
                                errorFields: { name: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('workspace.taxes.error.updateFailureMessage') },
                            },
                            _c),
                    },
                },
            },
        ],
    };
    var parameters = {
        policyID: policyID,
        taxCode: taxID,
        newName: newName,
    };
    API.write(types_1.WRITE_COMMANDS.RENAME_POLICY_TAX, parameters, onyxData);
}
function setPolicyTaxCode(policyID, oldTaxCode, newTaxCode) {
    var _a, _b, _c, _d, _e;
    var _f, _g, _h, _j;
    var policy = allPolicies === null || allPolicies === void 0 ? void 0 : allPolicies["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID)];
    var originalTaxRate = __assign({}, (_f = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _f === void 0 ? void 0 : _f.taxes[oldTaxCode]);
    var distanceRateCustomUnit = PolicyUtils.getDistanceRateCustomUnit(policy);
    var optimisticDistanceRateCustomUnit = distanceRateCustomUnit && __assign(__assign({}, distanceRateCustomUnit), { rates: __assign({}, Object.keys(distanceRateCustomUnit.rates).reduce(function (rates, rateID) {
            var _a;
            if (((_a = distanceRateCustomUnit.rates[rateID].attributes) === null || _a === void 0 ? void 0 : _a.taxRateExternalID) === oldTaxCode) {
                // eslint-disable-next-line no-param-reassign
                rates[rateID] = {
                    attributes: {
                        taxRateExternalID: newTaxCode,
                    },
                };
            }
            return rates;
        }, {})) });
    var oldDefaultExternalID = (_g = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _g === void 0 ? void 0 : _g.defaultExternalID;
    var oldForeignTaxDefault = (_h = policy === null || policy === void 0 ? void 0 : policy.taxRates) === null || _h === void 0 ? void 0 : _h.foreignTaxDefault;
    var onyxData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: __assign({ taxRates: {
                        defaultExternalID: oldTaxCode === oldDefaultExternalID ? newTaxCode : oldDefaultExternalID,
                        foreignTaxDefault: oldTaxCode === oldForeignTaxDefault ? newTaxCode : oldForeignTaxDefault,
                        taxes: (_a = {},
                            _a[oldTaxCode] = null,
                            _a[newTaxCode] = __assign(__assign({}, originalTaxRate), { pendingFields: __assign(__assign({}, originalTaxRate.pendingFields), { code: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE }), pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE, errorFields: { code: null }, previousTaxCode: oldTaxCode }),
                            _a),
                    } }, (!!distanceRateCustomUnit && { customUnits: (_b = {}, _b[distanceRateCustomUnit.customUnitID] = optimisticDistanceRateCustomUnit, _b) })),
            },
        ],
        successData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    taxRates: {
                        defaultExternalID: oldTaxCode === oldDefaultExternalID ? newTaxCode : oldDefaultExternalID,
                        foreignTaxDefault: oldTaxCode === oldForeignTaxDefault ? newTaxCode : oldForeignTaxDefault,
                        taxes: (_c = {},
                            _c[oldTaxCode] = null,
                            _c[newTaxCode] = __assign(__assign({}, originalTaxRate), { code: newTaxCode, pendingFields: __assign(__assign({}, originalTaxRate.pendingFields), { code: null }), pendingAction: null, errorFields: { code: null } }),
                            _c),
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: __assign({ taxRates: {
                        defaultExternalID: oldDefaultExternalID,
                        foreignTaxDefault: oldForeignTaxDefault,
                        taxes: (_d = {},
                            _d[newTaxCode] = null,
                            _d[oldTaxCode] = __assign(__assign({}, originalTaxRate), { code: originalTaxRate.code, pendingFields: __assign(__assign({}, originalTaxRate.pendingFields), { code: null }), pendingAction: null, errorFields: { code: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('workspace.taxes.error.updateFailureMessage') } }),
                            _d),
                    } }, (!!distanceRateCustomUnit && { customUnits: (_e = {}, _e[distanceRateCustomUnit.customUnitID] = distanceRateCustomUnit, _e) })),
            },
        ],
    };
    var parameters = {
        policyID: policyID,
        oldTaxCode: oldTaxCode,
        newTaxCode: newTaxCode,
        taxID: (_j = originalTaxRate.name) !== null && _j !== void 0 ? _j : '',
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_POLICY_TAX_CODE, parameters, onyxData);
}
