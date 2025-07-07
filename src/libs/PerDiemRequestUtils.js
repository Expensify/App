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
exports.getCustomUnitID = getCustomUnitID;
exports.getDestinationListSections = getDestinationListSections;
exports.getDestinationForDisplay = getDestinationForDisplay;
exports.getSubratesFields = getSubratesFields;
exports.getSubratesForDisplay = getSubratesForDisplay;
exports.getTimeForDisplay = getTimeForDisplay;
exports.getTimeDifferenceIntervals = getTimeDifferenceIntervals;
var date_fns_1 = require("date-fns");
var sortBy_1 = require("lodash/sortBy");
var react_native_onyx_1 = require("react-native-onyx");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var Localize_1 = require("./Localize");
var PolicyUtils_1 = require("./PolicyUtils");
var ReportUtils_1 = require("./ReportUtils");
var tokenizedSearch_1 = require("./tokenizedSearch");
var allReports;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback: function (value) {
        allReports = value;
    },
});
/**
 * Returns custom unit ID for the per diem transaction
 */
function getCustomUnitID(reportID) {
    var _a, _b;
    var report = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID)];
    var parentReport = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report === null || report === void 0 ? void 0 : report.parentReportID)];
    // This will be fixed as part of https://github.com/Expensify/Expensify/issues/507850
    // eslint-disable-next-line deprecation/deprecation
    var policy = (0, PolicyUtils_1.getPolicy)((_a = report === null || report === void 0 ? void 0 : report.policyID) !== null && _a !== void 0 ? _a : parentReport === null || parentReport === void 0 ? void 0 : parentReport.policyID);
    var customUnitID = CONST_1.default.CUSTOM_UNITS.FAKE_P2P_ID;
    var category;
    if ((0, ReportUtils_1.isPolicyExpenseChat)(report) || (0, ReportUtils_1.isPolicyExpenseChat)(parentReport)) {
        var perDiemUnit = Object.values((_b = policy === null || policy === void 0 ? void 0 : policy.customUnits) !== null && _b !== void 0 ? _b : {}).find(function (unit) { return unit.name === CONST_1.default.CUSTOM_UNITS.NAME_PER_DIEM_INTERNATIONAL; });
        if (perDiemUnit) {
            customUnitID = perDiemUnit.customUnitID;
            category = perDiemUnit.defaultCategory;
        }
    }
    return { customUnitID: customUnitID, category: category };
}
/**
 * Builds the options for the category tree hierarchy via indents
 *
 * @param options - an initial object array
 * @param options[].enabled - a flag to enable/disable option in a list
 * @param options[].name - a name of an option
 * @param options[].rateID - a rateID of an option
 */
function getDestinationOptionTree(options) {
    var optionCollection = new Map();
    Object.values(options).forEach(function (option) {
        if (optionCollection.has(option.rateID)) {
            return;
        }
        optionCollection.set(option.rateID, {
            text: option.name,
            keyForList: option.rateID,
            searchText: option.name,
            tooltipText: option.name,
            isDisabled: false,
            isSelected: !!option.isSelected,
            currency: option.currency,
        });
    });
    return Array.from(optionCollection.values());
}
/**
 * Builds the section list for destinations
 */
function getDestinationListSections(_a) {
    var destinations = _a.destinations, searchValue = _a.searchValue, _b = _a.selectedOptions, selectedOptions = _b === void 0 ? [] : _b, _c = _a.recentlyUsedDestinations, recentlyUsedDestinations = _c === void 0 ? [] : _c, _d = _a.maxRecentReportsToShow, maxRecentReportsToShow = _d === void 0 ? CONST_1.default.IOU.MAX_RECENT_REPORTS_TO_SHOW : _d;
    var sortedDestinations = (0, sortBy_1.default)(destinations, 'name').map(function (rate) {
        var _a, _b;
        return ({
            name: (_a = rate.name) !== null && _a !== void 0 ? _a : '',
            rateID: rate.customUnitRateID,
            currency: (_b = rate.currency) !== null && _b !== void 0 ? _b : CONST_1.default.CURRENCY.USD,
        });
    });
    var destinationSections = [];
    if (searchValue) {
        var searchDestinations = (0, tokenizedSearch_1.default)(sortedDestinations, searchValue, function (destination) { return [destination.name]; }).map(function (destination) { return (__assign(__assign({}, destination), { isSelected: selectedOptions.some(function (selectedOption) { return selectedOption.rateID === destination.rateID; }) })); });
        var data_1 = getDestinationOptionTree(searchDestinations);
        destinationSections.push({
            // "Search" section
            title: '',
            shouldShow: true,
            data: data_1,
            indexOffset: data_1.length,
        });
        return destinationSections;
    }
    if (selectedOptions.length > 0) {
        var data_2 = getDestinationOptionTree(selectedOptions);
        destinationSections.push({
            // "Selected" section
            title: '',
            shouldShow: false,
            data: data_2,
            indexOffset: data_2.length,
        });
    }
    var selectedOptionRateIDs = selectedOptions.map(function (selectedOption) { return selectedOption.rateID; });
    if (sortedDestinations.length < CONST_1.default.STANDARD_LIST_ITEM_LIMIT) {
        var filteredNonSelectedDestinations = sortedDestinations.filter(function (_a) {
            var rateID = _a.rateID;
            return !selectedOptionRateIDs.includes(rateID);
        });
        if (filteredNonSelectedDestinations.length === 0) {
            return destinationSections;
        }
        var data_3 = getDestinationOptionTree(filteredNonSelectedDestinations);
        destinationSections.push({
            // "All" section when items amount less than the threshold
            title: '',
            shouldShow: false,
            data: data_3,
            indexOffset: data_3.length,
        });
        return destinationSections;
    }
    var filteredRecentlyUsedDestinations = sortedDestinations.filter(function (_a) {
        var rateID = _a.rateID;
        return recentlyUsedDestinations.includes(rateID) && !selectedOptionRateIDs.includes(rateID);
    });
    if (filteredRecentlyUsedDestinations.length > 0) {
        var cutRecentlyUsedDestinations = filteredRecentlyUsedDestinations.slice(0, maxRecentReportsToShow);
        var data_4 = getDestinationOptionTree(cutRecentlyUsedDestinations);
        destinationSections.push({
            // "Recent" section
            title: (0, Localize_1.translateLocal)('common.recent'),
            shouldShow: true,
            data: data_4,
            indexOffset: data_4.length,
        });
    }
    var data = getDestinationOptionTree(sortedDestinations);
    destinationSections.push({
        // "All" section when items amount more than the threshold
        title: (0, Localize_1.translateLocal)('common.all'),
        shouldShow: true,
        data: data,
        indexOffset: data.length,
    });
    return destinationSections;
}
function getDestinationForDisplay(customUnit, transaction) {
    var _a, _b, _c, _d;
    var customUnitRateID = (_b = (_a = transaction === null || transaction === void 0 ? void 0 : transaction.comment) === null || _a === void 0 ? void 0 : _a.customUnit) === null || _b === void 0 ? void 0 : _b.customUnitRateID;
    if (!customUnitRateID) {
        return '';
    }
    var selectedDestination = (_c = customUnit === null || customUnit === void 0 ? void 0 : customUnit.rates) === null || _c === void 0 ? void 0 : _c[customUnitRateID];
    return (_d = selectedDestination === null || selectedDestination === void 0 ? void 0 : selectedDestination.name) !== null && _d !== void 0 ? _d : '';
}
function getSubratesFields(customUnit, transaction) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    var customUnitRateID = (_b = (_a = transaction === null || transaction === void 0 ? void 0 : transaction.comment) === null || _a === void 0 ? void 0 : _a.customUnit) === null || _b === void 0 ? void 0 : _b.customUnitRateID;
    if (!customUnitRateID) {
        return [];
    }
    var selectedDestination = (_c = customUnit === null || customUnit === void 0 ? void 0 : customUnit.rates) === null || _c === void 0 ? void 0 : _c[customUnitRateID];
    var countSubrates = (_e = (_d = selectedDestination === null || selectedDestination === void 0 ? void 0 : selectedDestination.subRates) === null || _d === void 0 ? void 0 : _d.length) !== null && _e !== void 0 ? _e : 0;
    var currentSubrates = (_h = (_g = (_f = transaction === null || transaction === void 0 ? void 0 : transaction.comment) === null || _f === void 0 ? void 0 : _f.customUnit) === null || _g === void 0 ? void 0 : _g.subRates) !== null && _h !== void 0 ? _h : [];
    if (currentSubrates.length === countSubrates) {
        return currentSubrates;
    }
    return __spreadArray(__spreadArray([], currentSubrates, true), [undefined], false);
}
function getSubratesForDisplay(subrate, qtyText) {
    if (!subrate) {
        return undefined;
    }
    return "".concat(subrate.name, ", ").concat(qtyText, ": ").concat(subrate.quantity);
}
/**
 * param {string} dateTimeString
 * returns {string} example: 2023-05-16 11:10 PM
 */
function formatDateTimeTo12Hour(dateTimeString) {
    if (!dateTimeString) {
        return '';
    }
    var date = new Date(dateTimeString);
    return (0, date_fns_1.format)(date, 'hh:mm a, yyyy-MM-dd');
}
function getTimeForDisplay(transaction) {
    var _a, _b, _c, _d;
    var customUnitRateDate = (_d = (_c = (_b = (_a = transaction === null || transaction === void 0 ? void 0 : transaction.comment) === null || _a === void 0 ? void 0 : _a.customUnit) === null || _b === void 0 ? void 0 : _b.attributes) === null || _c === void 0 ? void 0 : _c.dates) !== null && _d !== void 0 ? _d : { start: '', end: '' };
    return "".concat(formatDateTimeTo12Hour(customUnitRateDate.start), " - ").concat(formatDateTimeTo12Hour(customUnitRateDate.end));
}
function getTimeDifferenceIntervals(transaction) {
    var _a, _b, _c, _d;
    var customUnitRateDate = (_d = (_c = (_b = (_a = transaction === null || transaction === void 0 ? void 0 : transaction.comment) === null || _a === void 0 ? void 0 : _a.customUnit) === null || _b === void 0 ? void 0 : _b.attributes) === null || _c === void 0 ? void 0 : _c.dates) !== null && _d !== void 0 ? _d : { start: '', end: '' };
    var startDate = new Date(customUnitRateDate.start);
    var endDate = new Date(customUnitRateDate.end);
    if ((0, date_fns_1.isSameDay)(startDate, endDate)) {
        var hourDiff = (0, date_fns_1.differenceInMinutes)(endDate, startDate) / 60;
        return {
            firstDay: hourDiff,
            tripDays: 0,
            lastDay: undefined,
        };
    }
    var firstDayDiff = (0, date_fns_1.differenceInMinutes)((0, date_fns_1.startOfDay)((0, date_fns_1.addDays)(startDate, 1)), startDate);
    var tripDaysDiff = (0, date_fns_1.differenceInDays)((0, date_fns_1.startOfDay)(endDate), (0, date_fns_1.startOfDay)((0, date_fns_1.addDays)(startDate, 1)));
    var lastDayDiff = (0, date_fns_1.differenceInMinutes)(endDate, (0, date_fns_1.startOfDay)(endDate));
    return {
        firstDay: firstDayDiff === 1440 ? undefined : firstDayDiff / 60,
        tripDays: firstDayDiff === 1440 ? tripDaysDiff + 1 : tripDaysDiff,
        lastDay: lastDayDiff === 0 ? undefined : lastDayDiff / 60,
    };
}
