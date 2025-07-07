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
exports.generateCustomUnitID = generateCustomUnitID;
exports.enablePerDiem = enablePerDiem;
exports.openPolicyPerDiemPage = openPolicyPerDiemPage;
exports.importPerDiemRates = importPerDiemRates;
exports.downloadPerDiemCSV = downloadPerDiemCSV;
exports.clearPolicyPerDiemRatesErrorFields = clearPolicyPerDiemRatesErrorFields;
exports.deleteWorkspacePerDiemRates = deleteWorkspacePerDiemRates;
exports.editPerDiemRateDestination = editPerDiemRateDestination;
exports.editPerDiemRateSubrate = editPerDiemRateSubrate;
exports.editPerDiemRateAmount = editPerDiemRateAmount;
exports.editPerDiemRateCurrency = editPerDiemRateCurrency;
exports.buildOptimisticPolicyRecentlyUsedDestinations = buildOptimisticPolicyRecentlyUsedDestinations;
var cloneDeep_1 = require("lodash/cloneDeep");
var union_1 = require("lodash/union");
var react_native_onyx_1 = require("react-native-onyx");
var API = require("@libs/API");
var types_1 = require("@libs/API/types");
var ApiUtils = require("@libs/ApiUtils");
var fileDownload_1 = require("@libs/fileDownload");
var getIsNarrowLayout_1 = require("@libs/getIsNarrowLayout");
var Localize_1 = require("@libs/Localize");
var enhanceParameters_1 = require("@libs/Network/enhanceParameters");
var NumberUtils = require("@libs/NumberUtils");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var ReportUtils = require("@libs/ReportUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
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
/**
 * Returns a client generated 13 character hexadecimal value for a custom unit ID
 */
function generateCustomUnitID() {
    return NumberUtils.generateHexadecimalValue(13);
}
function enablePerDiem(policyID, enabled, customUnitID, shouldGoBack) {
    var _a;
    var doesCustomUnitExists = !!customUnitID;
    var finalCustomUnitID = doesCustomUnitExists ? customUnitID : generateCustomUnitID();
    var optimisticCustomUnit = {
        name: CONST_1.default.CUSTOM_UNITS.NAME_PER_DIEM_INTERNATIONAL,
        customUnitID: finalCustomUnitID,
        enabled: true,
        defaultCategory: '',
        rates: {},
    };
    var onyxData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: __assign({ arePerDiemRatesEnabled: enabled, pendingFields: {
                        arePerDiemRatesEnabled: CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    } }, (doesCustomUnitExists ? {} : { customUnits: (_a = {}, _a[finalCustomUnitID] = optimisticCustomUnit, _a) })),
            },
        ],
        successData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    pendingFields: {
                        arePerDiemRatesEnabled: null,
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    arePerDiemRatesEnabled: !enabled,
                    pendingFields: {
                        arePerDiemRatesEnabled: null,
                    },
                },
            },
        ],
    };
    var parameters = { policyID: policyID, enabled: enabled, customUnitID: finalCustomUnitID };
    API.write(types_1.WRITE_COMMANDS.TOGGLE_POLICY_PER_DIEM, parameters, onyxData);
    if (enabled && (0, getIsNarrowLayout_1.default)() && shouldGoBack) {
        (0, PolicyUtils_1.goBackWhenEnableFeature)(policyID);
    }
}
function openPolicyPerDiemPage(policyID) {
    if (!policyID) {
        return;
    }
    var params = { policyID: policyID };
    API.read(types_1.READ_COMMANDS.OPEN_POLICY_PER_DIEM_RATES_PAGE, params);
}
function updateImportSpreadsheetData(ratesLength) {
    var onyxData = {
        successData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: ONYXKEYS_1.default.IMPORTED_SPREADSHEET,
                value: {
                    shouldFinalModalBeOpened: true,
                    importFinalModal: {
                        title: (0, Localize_1.translateLocal)('spreadsheet.importSuccessfulTitle'),
                        prompt: (0, Localize_1.translateLocal)('spreadsheet.importPerDiemRatesSuccessfulDescription', { rates: ratesLength }),
                    },
                },
            },
        ],
        failureData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: ONYXKEYS_1.default.IMPORTED_SPREADSHEET,
                value: {
                    shouldFinalModalBeOpened: true,
                    importFinalModal: { title: (0, Localize_1.translateLocal)('spreadsheet.importFailedTitle'), prompt: (0, Localize_1.translateLocal)('spreadsheet.importFailedDescription') },
                },
            },
        ],
    };
    return onyxData;
}
function importPerDiemRates(policyID, customUnitID, rates, rowsLength) {
    var onyxData = updateImportSpreadsheetData(rowsLength);
    var parameters = {
        policyID: policyID,
        customUnitID: customUnitID,
        customUnitRates: JSON.stringify(rates),
    };
    API.write(types_1.WRITE_COMMANDS.IMPORT_PER_DIEM_RATES, parameters, onyxData);
}
function downloadPerDiemCSV(policyID, onDownloadFailed) {
    var finalParameters = (0, enhanceParameters_1.default)(types_1.WRITE_COMMANDS.EXPORT_PER_DIEM_CSV, {
        policyID: policyID,
    });
    var fileName = 'PerDiem.csv';
    var formData = new FormData();
    Object.entries(finalParameters).forEach(function (_a) {
        var key = _a[0], value = _a[1];
        formData.append(key, String(value));
    });
    (0, fileDownload_1.default)(ApiUtils.getCommandURL({ command: types_1.WRITE_COMMANDS.EXPORT_PER_DIEM_CSV }), fileName, '', false, formData, CONST_1.default.NETWORK.METHOD.POST, onDownloadFailed);
}
function clearPolicyPerDiemRatesErrorFields(policyID, customUnitID, updatedErrorFields) {
    var _a;
    react_native_onyx_1.default.merge("".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID), {
        customUnits: (_a = {},
            _a[customUnitID] = {
                errorFields: updatedErrorFields,
            },
            _a),
    });
}
function prepareNewCustomUnit(customUnit, subRatesToBeDeleted) {
    var _a, _b;
    var mappedDeletedSubRatesToRate = subRatesToBeDeleted.reduce(function (acc, subRate) {
        if (subRate.rateID in acc) {
            acc[subRate.rateID].push(subRate);
        }
        else {
            acc[subRate.rateID] = [subRate];
        }
        return acc;
    }, {});
    // Copy the custom unit and remove the sub rates that are to be deleted
    var newCustomUnit = (0, cloneDeep_1.default)(customUnit);
    var customUnitOnyxUpdate = (0, cloneDeep_1.default)(customUnit);
    var _loop_1 = function (rateID) {
        if (!(rateID in newCustomUnit.rates)) {
            return "continue";
        }
        var subRates = mappedDeletedSubRatesToRate[rateID];
        if (subRates.length === ((_a = newCustomUnit.rates[rateID].subRates) === null || _a === void 0 ? void 0 : _a.length)) {
            delete newCustomUnit.rates[rateID];
            customUnitOnyxUpdate.rates[rateID] = null;
        }
        else {
            var newSubRates = (_b = newCustomUnit.rates[rateID].subRates) === null || _b === void 0 ? void 0 : _b.filter(function (subRate) { return !subRates.some(function (subRateToBeDeleted) { return subRateToBeDeleted.subRateID === subRate.id; }); });
            newCustomUnit.rates[rateID].subRates = newSubRates;
            customUnitOnyxUpdate.rates[rateID] = __assign(__assign({}, customUnitOnyxUpdate.rates[rateID]), { subRates: newSubRates });
        }
    };
    for (var rateID in mappedDeletedSubRatesToRate) {
        _loop_1(rateID);
    }
    return { newCustomUnit: newCustomUnit, customUnitOnyxUpdate: customUnitOnyxUpdate };
}
function deleteWorkspacePerDiemRates(policyID, customUnit, subRatesToBeDeleted) {
    var _a;
    if (!policyID || (0, EmptyObject_1.isEmptyObject)(customUnit) || !subRatesToBeDeleted.length) {
        return;
    }
    var _b = prepareNewCustomUnit(customUnit, subRatesToBeDeleted), newCustomUnit = _b.newCustomUnit, customUnitOnyxUpdate = _b.customUnitOnyxUpdate;
    var onyxData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    customUnits: (_a = {},
                        _a[customUnit.customUnitID] = customUnitOnyxUpdate,
                        _a),
                },
            },
        ],
    };
    var parameters = {
        policyID: policyID,
        customUnit: JSON.stringify(newCustomUnit),
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_WORKSPACE_CUSTOM_UNIT, parameters, onyxData);
}
function editPerDiemRateDestination(policyID, rateID, customUnit, newDestination) {
    var _a;
    if (!policyID || !rateID || (0, EmptyObject_1.isEmptyObject)(customUnit) || !newDestination) {
        return;
    }
    var newCustomUnit = (0, cloneDeep_1.default)(customUnit);
    newCustomUnit.rates[rateID].name = newDestination;
    var onyxData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    customUnits: (_a = {},
                        _a[customUnit.customUnitID] = newCustomUnit,
                        _a),
                },
            },
        ],
    };
    var parameters = {
        policyID: policyID,
        customUnit: JSON.stringify(newCustomUnit),
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_WORKSPACE_CUSTOM_UNIT, parameters, onyxData);
}
function editPerDiemRateSubrate(policyID, rateID, subRateID, customUnit, newSubrate) {
    var _a;
    var _b;
    if (!policyID || !rateID || (0, EmptyObject_1.isEmptyObject)(customUnit) || !newSubrate) {
        return;
    }
    var newCustomUnit = (0, cloneDeep_1.default)(customUnit);
    newCustomUnit.rates[rateID].subRates = (_b = newCustomUnit.rates[rateID].subRates) === null || _b === void 0 ? void 0 : _b.map(function (subRate) {
        if (subRate.id === subRateID) {
            return __assign(__assign({}, subRate), { name: newSubrate });
        }
        return subRate;
    });
    var onyxData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    customUnits: (_a = {},
                        _a[customUnit.customUnitID] = newCustomUnit,
                        _a),
                },
            },
        ],
    };
    var parameters = {
        policyID: policyID,
        customUnit: JSON.stringify(newCustomUnit),
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_WORKSPACE_CUSTOM_UNIT, parameters, onyxData);
}
function editPerDiemRateAmount(policyID, rateID, subRateID, customUnit, newAmount) {
    var _a;
    var _b;
    if (!policyID || !rateID || (0, EmptyObject_1.isEmptyObject)(customUnit) || !newAmount) {
        return;
    }
    var newCustomUnit = (0, cloneDeep_1.default)(customUnit);
    newCustomUnit.rates[rateID].subRates = (_b = newCustomUnit.rates[rateID].subRates) === null || _b === void 0 ? void 0 : _b.map(function (subRate) {
        if (subRate.id === subRateID) {
            return __assign(__assign({}, subRate), { rate: newAmount });
        }
        return subRate;
    });
    var onyxData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    customUnits: (_a = {},
                        _a[customUnit.customUnitID] = newCustomUnit,
                        _a),
                },
            },
        ],
    };
    var parameters = {
        policyID: policyID,
        customUnit: JSON.stringify(newCustomUnit),
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_WORKSPACE_CUSTOM_UNIT, parameters, onyxData);
}
function editPerDiemRateCurrency(policyID, rateID, customUnit, newCurrency) {
    var _a;
    if (!policyID || !rateID || (0, EmptyObject_1.isEmptyObject)(customUnit) || !newCurrency) {
        return;
    }
    var newCustomUnit = (0, cloneDeep_1.default)(customUnit);
    newCustomUnit.rates[rateID].currency = newCurrency;
    var onyxData = {
        optimisticData: [
            {
                onyxMethod: react_native_onyx_1.default.METHOD.MERGE,
                key: "".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(policyID),
                value: {
                    customUnits: (_a = {},
                        _a[customUnit.customUnitID] = newCustomUnit,
                        _a),
                },
            },
        ],
    };
    var parameters = {
        policyID: policyID,
        customUnit: JSON.stringify(newCustomUnit),
    };
    API.write(types_1.WRITE_COMMANDS.UPDATE_WORKSPACE_CUSTOM_UNIT, parameters, onyxData);
}
var allRecentlyUsedDestinations = {};
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.COLLECTION.POLICY_RECENTLY_USED_DESTINATIONS,
    waitForCollectionCallback: true,
    callback: function (val) { return (allRecentlyUsedDestinations = val); },
});
function buildOptimisticPolicyRecentlyUsedDestinations(policyID, destination) {
    var _a;
    if (!policyID || !destination) {
        return [];
    }
    var policyRecentlyUsedDestinations = (_a = allRecentlyUsedDestinations === null || allRecentlyUsedDestinations === void 0 ? void 0 : allRecentlyUsedDestinations["".concat(ONYXKEYS_1.default.COLLECTION.POLICY_RECENTLY_USED_DESTINATIONS).concat(policyID)]) !== null && _a !== void 0 ? _a : [];
    return (0, union_1.default)([destination], policyRecentlyUsedDestinations);
}
