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
exports.enablePolicyDistanceRates = enablePolicyDistanceRates;
exports.openPolicyDistanceRatesPage = openPolicyDistanceRatesPage;
exports.createPolicyDistanceRate = createPolicyDistanceRate;
exports.clearCreateDistanceRateItemAndError = clearCreateDistanceRateItemAndError;
exports.clearDeleteDistanceRateError = clearDeleteDistanceRateError;
exports.setPolicyDistanceRatesUnit = setPolicyDistanceRatesUnit;
exports.clearPolicyDistanceRatesErrorFields = clearPolicyDistanceRatesErrorFields;
exports.clearPolicyDistanceRateErrorFields = clearPolicyDistanceRateErrorFields;
exports.updatePolicyDistanceRateValue = updatePolicyDistanceRateValue;
exports.setPolicyDistanceRatesEnabled = setPolicyDistanceRatesEnabled;
exports.deletePolicyDistanceRates = deletePolicyDistanceRates;
exports.updateDistanceTaxClaimableValue = updateDistanceTaxClaimableValue;
exports.updateDistanceTaxRate = updateDistanceTaxRate;
var react_native_onyx_1 = require("react-native-onyx");
var API = require("@libs/API");
var types_1 = require("@libs/API/types");
var ErrorUtils = require("@libs/ErrorUtils");
var getIsNarrowLayout_1 = require("@libs/getIsNarrowLayout");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var ReportUtils = require("@libs/ReportUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var allPolicies = {};
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.COLLECTION.POLICY,
    callback: function (val, key) {
        if (!key) {
            return;
        }
        if (val === null || val === undefined) {
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
        allPolicies[key] = val;
    },
});
var allTransactions = {};
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.COLLECTION.TRANSACTION,
    waitForCollectionCallback: true,
    callback: function (value) {
        if (!value) {
            allTransactions = {};
            return;
        }
        allTransactions = value;
    },
});
var transactionViolations;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS,
    waitForCollectionCallback: true,
    callback: function (value) {
        transactionViolations = value;
    },
});
/**
 * Takes array of customUnitRates and removes pendingFields and errorFields from each rate - we don't want to send those via API
 */
function prepareCustomUnitRatesArray(customUnitRates) {
    var customUnitRateArray = [];
    customUnitRates.forEach(function (rate) {
        var cleanedRate = __assign({}, rate);
        delete cleanedRate.pendingFields;
        delete cleanedRate.errorFields;
        customUnitRateArray.push(cleanedRate);
    });
    return customUnitRateArray;
}
function openPolicyDistanceRatesPage(policyID) {
    if (!policyID) {
        return;
    }
    var params = { policyID: policyID };
    API.read(types_1.READ_COMMANDS.OPEN_POLICY_DISTANCE_RATES_PAGE, params);
}
function enablePolicyDistanceRates(policyID, enabled) {
    var _a;
    var _b, _c;
    var onyxData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    areDistanceRatesEnabled: enabled,
                    pendingFields: {
                        areDistanceRatesEnabled: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    },
                },
            },
        ],
        successData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    pendingFields: {
                        areDistanceRatesEnabled: null,
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    areDistanceRatesEnabled: !enabled,
                    pendingFields: {
                        areDistanceRatesEnabled: null,
                    },
                },
            },
        ],
    };
    if (!enabled) {
        var policy = allPolicies === null || allPolicies === void 0 ? void 0 : allPolicies["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID)];
        var customUnit = (0, PolicyUtils_1.getDistanceRateCustomUnit)(policy);
        if (customUnit) {
            var customUnitID = customUnit.customUnitID;
            var rateEntries = Object.entries((_b = customUnit.rates) !== null && _b !== void 0 ? _b : {});
            // find the rate to be enabled after disabling the distance rate feature
            var rateEntryToBeEnabled_1 = rateEntries.at(0);
            (_c = onyxData.optimisticData) === null || _c === void 0 ? void 0 : _c.push({
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    customUnits: (_a = {},
                        _a[customUnitID] = {
                            rates: Object.fromEntries(rateEntries.map(function (rateEntry) {
                                var rateID = rateEntry[0], rate = rateEntry[1];
                                return [
                                    rateID,
                                    __assign(__assign({}, rate), { enabled: rateID === (rateEntryToBeEnabled_1 === null || rateEntryToBeEnabled_1 === void 0 ? void 0 : rateEntryToBeEnabled_1.at(0)) }),
                                ];
                            })),
                        },
                        _a),
                },
            });
        }
    }
    var parameters = { policyID: policyID, enabled: enabled };
    API.writeWithNoDuplicatesEnableFeatureConflicts(types_1.WRITE_COMMANDS.ENABLE_POLICY_DISTANCE_RATES, parameters, onyxData);
    if (enabled && (0, getIsNarrowLayout_1.default)()) {
        (0, PolicyUtils_1.goBackWhenEnableFeature)(policyID);
    }
}
function createPolicyDistanceRate(policyID, customUnitID, customUnitRate) {
    var _a, _b, _c, _d, _e, _f;
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                customUnits: (_a = {},
                    _a[customUnitID] = {
                        rates: (_b = {},
                            _b[customUnitRate.customUnitRateID] = __assign(__assign({}, customUnitRate), { pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.ADD }),
                            _b),
                    },
                    _a),
            },
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                customUnits: (_c = {},
                    _c[customUnitID] = {
                        rates: (_d = {},
                            _d[customUnitRate.customUnitRateID] = {
                                pendingAction: null,
                            },
                            _d),
                    },
                    _c),
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                customUnits: (_e = {},
                    _e[customUnitID] = {
                        rates: (_f = {},
                            _f[customUnitRate.customUnitRateID] = {
                                errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage'),
                            },
                            _f),
                    },
                    _e),
            },
        },
    ];
    var params = {
        policyID: policyID,
        customUnitID: customUnitID,
        customUnitRate: JSON.stringify(customUnitRate),
    };
    API.write(types_1.WRITE_COMMANDS.CREATE_POLICY_DISTANCE_RATE, params, { optimisticData: optimisticData, successData: successData, failureData: failureData });
}
function clearCreateDistanceRateItemAndError(policyID, customUnitID, customUnitRateIDToClear) {
    var _a, _b;
    react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), {
        customUnits: (_a = {},
            _a[customUnitID] = {
                rates: (_b = {},
                    _b[customUnitRateIDToClear] = null,
                    _b),
            },
            _a),
    });
}
function clearPolicyDistanceRatesErrorFields(policyID, customUnitID, updatedErrorFields) {
    var _a;
    react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), {
        customUnits: (_a = {},
            _a[customUnitID] = {
                errorFields: updatedErrorFields,
            },
            _a),
    });
}
function clearDeleteDistanceRateError(policyID, customUnitID, rateID) {
    var _a, _b;
    react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), {
        customUnits: (_a = {},
            _a[customUnitID] = {
                rates: (_b = {},
                    _b[rateID] = {
                        errors: null,
                    },
                    _b),
            },
            _a),
    });
}
function clearPolicyDistanceRateErrorFields(policyID, customUnitID, rateID, updatedErrorFields) {
    var _a, _b;
    react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), {
        customUnits: (_a = {},
            _a[customUnitID] = {
                rates: (_b = {},
                    _b[rateID] = {
                        errorFields: updatedErrorFields,
                    },
                    _b),
            },
            _a),
    });
}
function setPolicyDistanceRatesUnit(policyID, currentCustomUnit, newCustomUnit) {
    var _a, _b, _c;
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                customUnits: (_a = {},
                    _a[newCustomUnit.customUnitID] = __assign(__assign({}, newCustomUnit), { pendingFields: { attributes: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE } }),
                    _a),
            },
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                customUnits: (_b = {},
                    _b[newCustomUnit.customUnitID] = {
                        pendingFields: { attributes: null },
                    },
                    _b),
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                customUnits: (_c = {},
                    _c[currentCustomUnit.customUnitID] = __assign(__assign({}, currentCustomUnit), { errorFields: { attributes: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage') }, pendingFields: { attributes: null } }),
                    _c),
            },
        },
    ];
    var params = {
        policyID: policyID,
        customUnit: JSON.stringify((0, PolicyUtils_1.removePendingFieldsFromCustomUnit)(newCustomUnit)),
    };
    API.write(types_1.WRITE_COMMANDS.SET_POLICY_DISTANCE_RATES_UNIT, params, { optimisticData: optimisticData, successData: successData, failureData: failureData });
}
function updatePolicyDistanceRateValue(policyID, customUnit, customUnitRates) {
    var _a, _b, _c;
    var currentRates = customUnit.rates;
    var optimisticRates = {};
    var successRates = {};
    var failureRates = {};
    var rateIDs = customUnitRates.map(function (rate) { return rate.customUnitRateID; });
    var _loop_1 = function (rateID) {
        if (rateIDs.includes(rateID)) {
            var foundRate = customUnitRates.find(function (rate) { return rate.customUnitRateID === rateID; });
            optimisticRates[rateID] = __assign(__assign({}, foundRate), { pendingFields: { rate: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE } });
            successRates[rateID] = __assign(__assign({}, foundRate), { pendingFields: { rate: null } });
            failureRates[rateID] = __assign(__assign({}, currentRates[rateID]), { pendingFields: { rate: null }, errorFields: { rate: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage') } });
        }
    };
    for (var _i = 0, _d = Object.keys(customUnit.rates); _i < _d.length; _i++) {
        var rateID = _d[_i];
        _loop_1(rateID);
    }
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                customUnits: (_a = {},
                    _a[customUnit.customUnitID] = {
                        rates: optimisticRates,
                    },
                    _a),
            },
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                customUnits: (_b = {},
                    _b[customUnit.customUnitID] = {
                        rates: successRates,
                    },
                    _b),
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                customUnits: (_c = {},
                    _c[customUnit.customUnitID] = {
                        rates: failureRates,
                    },
                    _c),
            },
        },
    ];
    var params = {
        policyID: policyID,
        customUnitID: customUnit.customUnitID,
        customUnitRateArray: JSON.stringify(prepareCustomUnitRatesArray(customUnitRates)),
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_POLICY_DISTANCE_RATE_VALUE, params, { optimisticData: optimisticData, successData: successData, failureData: failureData });
}
function setPolicyDistanceRatesEnabled(policyID, customUnit, customUnitRates) {
    var _a, _b, _c;
    var currentRates = customUnit.rates;
    var optimisticRates = {};
    var successRates = {};
    var failureRates = {};
    var rateIDs = customUnitRates.map(function (rate) { return rate.customUnitRateID; });
    var _loop_2 = function (rateID) {
        if (rateIDs.includes(rateID)) {
            var foundRate = customUnitRates.find(function (rate) { return rate.customUnitRateID === rateID; });
            optimisticRates[rateID] = __assign(__assign({}, foundRate), { pendingFields: { enabled: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE } });
            successRates[rateID] = __assign(__assign({}, foundRate), { pendingFields: { enabled: null } });
            failureRates[rateID] = __assign(__assign({}, currentRates[rateID]), { pendingFields: { enabled: null }, errorFields: { enabled: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage') } });
        }
    };
    for (var _i = 0, _d = Object.keys(currentRates); _i < _d.length; _i++) {
        var rateID = _d[_i];
        _loop_2(rateID);
    }
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                customUnits: (_a = {},
                    _a[customUnit.customUnitID] = {
                        rates: optimisticRates,
                    },
                    _a),
            },
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                customUnits: (_b = {},
                    _b[customUnit.customUnitID] = {
                        rates: successRates,
                    },
                    _b),
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                customUnits: (_c = {},
                    _c[customUnit.customUnitID] = {
                        rates: failureRates,
                    },
                    _c),
            },
        },
    ];
    var params = {
        policyID: policyID,
        customUnitID: customUnit.customUnitID,
        customUnitRateArray: JSON.stringify(prepareCustomUnitRatesArray(customUnitRates)),
    };
    API.write(types_1.WRITE_COMMANDS.SET_POLICY_DISTANCE_RATES_ENABLED, params, { optimisticData: optimisticData, successData: successData, failureData: failureData });
}
function deletePolicyDistanceRates(policyID, customUnit, rateIDsToDelete) {
    var _a, _b, _c;
    var currentRates = customUnit.rates;
    var optimisticRates = {};
    var successRates = {};
    var failureRates = {};
    for (var _i = 0, _d = Object.keys(currentRates); _i < _d.length; _i++) {
        var rateID = _d[_i];
        if (rateIDsToDelete.includes(rateID)) {
            optimisticRates[rateID] = __assign(__assign({}, currentRates[rateID]), { enabled: false, pendingAction: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE });
            failureRates[rateID] = __assign(__assign({}, currentRates[rateID]), { pendingAction: null, errors: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage') });
        }
        else {
            optimisticRates[rateID] = currentRates[rateID];
            successRates[rateID] = __assign(__assign({}, currentRates[rateID]), { pendingAction: null });
        }
    }
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                customUnits: (_a = {},
                    _a[customUnit.customUnitID] = {
                        rates: optimisticRates,
                    },
                    _a),
            },
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                customUnits: (_b = {},
                    _b[customUnit.customUnitID] = {
                        rates: successRates,
                    },
                    _b),
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                customUnits: (_c = {},
                    _c[customUnit.customUnitID] = {
                        rates: failureRates,
                    },
                    _c),
            },
        },
    ];
    var transactions = Object.values(allTransactions !== null && allTransactions !== void 0 ? allTransactions : {}).filter(function (transaction) { var _a, _b; return ((_b = (_a = transaction === null || transaction === void 0 ? void 0 : transaction.comment) === null || _a === void 0 ? void 0 : _a.customUnit) === null || _b === void 0 ? void 0 : _b.customUnitID) === customUnit.customUnitID; });
    var optimisticTransactionsViolations = [];
    transactions.forEach(function (transaction) {
        var _a;
        var currentTransactionViolations = (_a = transactionViolations === null || transactionViolations === void 0 ? void 0 : transactionViolations["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(transaction === null || transaction === void 0 ? void 0 : transaction.transactionID)]) !== null && _a !== void 0 ? _a : [];
        if (currentTransactionViolations.some(function (violation) { return violation.name === CONST_1.default.VIOLATIONS.CUSTOM_UNIT_OUT_OF_POLICY; })) {
            return;
        }
        optimisticTransactionsViolations.push({
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(transaction === null || transaction === void 0 ? void 0 : transaction.transactionID),
            value: __spreadArray(__spreadArray([], currentTransactionViolations, true), [
                {
                    type: CONST_1.default.VIOLATION_TYPES.VIOLATION,
                    name: CONST_1.default.VIOLATIONS.CUSTOM_UNIT_OUT_OF_POLICY,
                    showInReview: true,
                },
            ], false),
        });
    });
    var failureTransactionsViolations = transactions.map(function (transaction) {
        var currentTransactionViolations = transactionViolations === null || transactionViolations === void 0 ? void 0 : transactionViolations["".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(transaction === null || transaction === void 0 ? void 0 : transaction.transactionID)];
        return { onyxMethod: react_native_onyx_1.default.METHOD.MERGE, key: "".concat(ONYXKEYS_1.default.COLLECTION.TRANSACTION_VIOLATIONS).concat(transaction === null || transaction === void 0 ? void 0 : transaction.transactionID), value: currentTransactionViolations };
    });
    optimisticData.push.apply(optimisticData, optimisticTransactionsViolations);
    failureData.push.apply(failureData, failureTransactionsViolations);
    var params = {
        policyID: policyID,
        customUnitID: customUnit.customUnitID,
        customUnitRateID: rateIDsToDelete,
    };
    API.write(types_1.WRITE_COMMANDS.DELETE_POLICY_DISTANCE_RATES, params, { optimisticData: optimisticData, successData: successData, failureData: failureData });
}
function updateDistanceTaxClaimableValue(policyID, customUnit, customUnitRates) {
    var _a, _b, _c;
    var currentRates = customUnit.rates;
    var optimisticRates = {};
    var successRates = {};
    var failureRates = {};
    var rateIDs = customUnitRates.map(function (rate) { return rate.customUnitRateID; });
    var _loop_3 = function (rateID) {
        if (rateIDs.includes(rateID)) {
            var foundRate = customUnitRates.find(function (rate) { return rate.customUnitRateID === rateID; });
            optimisticRates[rateID] = __assign(__assign({}, foundRate), { pendingFields: { taxClaimablePercentage: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE } });
            successRates[rateID] = __assign(__assign({}, foundRate), { pendingFields: { taxClaimablePercentage: null } });
            failureRates[rateID] = __assign(__assign({}, currentRates[rateID]), { pendingFields: { taxClaimablePercentage: null }, errorFields: { taxClaimablePercentage: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage') } });
        }
    };
    for (var _i = 0, _d = Object.keys(customUnit.rates); _i < _d.length; _i++) {
        var rateID = _d[_i];
        _loop_3(rateID);
    }
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                customUnits: (_a = {},
                    _a[customUnit.customUnitID] = {
                        rates: optimisticRates,
                    },
                    _a),
            },
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                customUnits: (_b = {},
                    _b[customUnit.customUnitID] = {
                        rates: successRates,
                    },
                    _b),
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                customUnits: (_c = {},
                    _c[customUnit.customUnitID] = {
                        rates: failureRates,
                    },
                    _c),
            },
        },
    ];
    var params = {
        policyID: policyID,
        customUnitID: customUnit.customUnitID,
        customUnitRateArray: JSON.stringify(prepareCustomUnitRatesArray(customUnitRates)),
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_DISTANCE_TAX_CLAIMABLE_VALUE, params, { optimisticData: optimisticData, successData: successData, failureData: failureData });
}
function updateDistanceTaxRate(policyID, customUnit, customUnitRates) {
    var _a, _b, _c;
    var currentRates = customUnit.rates;
    var optimisticRates = {};
    var successRates = {};
    var failureRates = {};
    var rateIDs = customUnitRates.map(function (rate) { return rate.customUnitRateID; });
    var _loop_4 = function (rateID) {
        if (rateIDs.includes(rateID)) {
            var foundRate = customUnitRates.find(function (rate) { return rate.customUnitRateID === rateID; });
            optimisticRates[rateID] = __assign(__assign({}, foundRate), { pendingFields: { taxRateExternalID: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE } });
            successRates[rateID] = __assign(__assign({}, foundRate), { pendingFields: { taxRateExternalID: null } });
            failureRates[rateID] = __assign(__assign({}, currentRates[rateID]), { pendingFields: { taxRateExternalID: null }, errorFields: { taxRateExternalID: ErrorUtils.getMicroSecondOnyxErrorWithTranslationKey('common.genericErrorMessage') } });
        }
    };
    for (var _i = 0, _d = Object.keys(customUnit.rates); _i < _d.length; _i++) {
        var rateID = _d[_i];
        _loop_4(rateID);
    }
    var optimisticData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                customUnits: (_a = {},
                    _a[customUnit.customUnitID] = {
                        rates: optimisticRates,
                    },
                    _a),
            },
        },
    ];
    var successData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                customUnits: (_b = {},
                    _b[customUnit.customUnitID] = {
                        rates: successRates,
                    },
                    _b),
            },
        },
    ];
    var failureData = [
        {
            onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
            key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
            value: {
                customUnits: (_c = {},
                    _c[customUnit.customUnitID] = {
                        rates: failureRates,
                    },
                    _c),
            },
        },
    ];
    var params = {
        policyID: policyID,
        customUnitID: customUnit.customUnitID,
        customUnitRateArray: JSON.stringify(prepareCustomUnitRatesArray(customUnitRates)),
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_POLICY_DISTANCE_TAX_RATE_VALUE, params, { optimisticData: optimisticData, successData: successData, failureData: failureData });
}
