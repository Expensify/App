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
exports.OptionsListContext = exports.useOptionsList = void 0;
var react_1 = require("react");
var useOnyx_1 = require("@hooks/useOnyx");
var usePrevious_1 = require("@hooks/usePrevious");
var OptionsListUtils_1 = require("@libs/OptionsListUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var OnyxProvider_1 = require("./OnyxProvider");
var OptionsListContext = (0, react_1.createContext)({
    options: {
        reports: [],
        personalDetails: [],
    },
    initializeOptions: function () { },
    areOptionsInitialized: false,
    resetOptions: function () { },
});
exports.OptionsListContext = OptionsListContext;
var isEqualPersonalDetail = function (prevPersonalDetail, personalDetail) {
    return (prevPersonalDetail === null || prevPersonalDetail === void 0 ? void 0 : prevPersonalDetail.firstName) === (personalDetail === null || personalDetail === void 0 ? void 0 : personalDetail.firstName) &&
        (prevPersonalDetail === null || prevPersonalDetail === void 0 ? void 0 : prevPersonalDetail.lastName) === (personalDetail === null || personalDetail === void 0 ? void 0 : personalDetail.lastName) &&
        (prevPersonalDetail === null || prevPersonalDetail === void 0 ? void 0 : prevPersonalDetail.login) === (personalDetail === null || personalDetail === void 0 ? void 0 : personalDetail.login) &&
        (prevPersonalDetail === null || prevPersonalDetail === void 0 ? void 0 : prevPersonalDetail.displayName) === (personalDetail === null || personalDetail === void 0 ? void 0 : personalDetail.displayName);
};
function OptionsListContextProvider(_a) {
    var children = _a.children;
    var areOptionsInitialized = (0, react_1.useRef)(false);
    var _b = (0, react_1.useState)({
        reports: [],
        personalDetails: [],
    }), options = _b[0], setOptions = _b[1];
    var reportAttributes = (0, useOnyx_1.default)(ONYXKEYS_1.default.DERIVED.REPORT_ATTRIBUTES, { canBeMissing: true })[0];
    var prevReportAttributesLocale = (0, usePrevious_1.default)(reportAttributes === null || reportAttributes === void 0 ? void 0 : reportAttributes.locale);
    var _c = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.REPORT, { canBeMissing: true }), reports = _c[0], changedReports = _c[1].sourceValue;
    var _d = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS, { canBeMissing: true }), changedReportActions = _d[1].sourceValue;
    var personalDetails = (0, OnyxProvider_1.usePersonalDetails)();
    var prevPersonalDetails = (0, usePrevious_1.default)(personalDetails);
    var hasInitialData = (0, react_1.useMemo)(function () { return Object.keys(personalDetails !== null && personalDetails !== void 0 ? personalDetails : {}).length > 0; }, [personalDetails]);
    var loadOptions = (0, react_1.useCallback)(function () {
        var optionLists = (0, OptionsListUtils_1.createOptionList)(personalDetails, reports);
        setOptions({
            reports: optionLists.reports,
            personalDetails: optionLists.personalDetails,
        });
    }, [personalDetails, reports]);
    /**
     * This effect is responsible for generating the options list when their data is not yet initialized
     */
    (0, react_1.useEffect)(function () {
        if (!areOptionsInitialized.current || !reports || hasInitialData) {
            return;
        }
        loadOptions();
    }, [reports, personalDetails, hasInitialData, loadOptions]);
    /**
     * This effect is responsible for generating the options list when the locale changes
     * Since options might use report attributes, it's necessary to call this after report attributes are loaded with the new locale to make sure the options are generated in a proper language
     */
    (0, react_1.useEffect)(function () {
        if ((reportAttributes === null || reportAttributes === void 0 ? void 0 : reportAttributes.locale) === prevReportAttributesLocale) {
            return;
        }
        loadOptions();
    }, [prevReportAttributesLocale, loadOptions, reportAttributes === null || reportAttributes === void 0 ? void 0 : reportAttributes.locale]);
    var changedReportsEntries = (0, react_1.useMemo)(function () {
        var result = {};
        Object.keys(changedReports !== null && changedReports !== void 0 ? changedReports : {}).forEach(function (key) {
            var report = reports === null || reports === void 0 ? void 0 : reports[key];
            if (report) {
                result[key] = report;
            }
        });
        return result;
    }, [changedReports, reports]);
    /**
     * This effect is responsible for updating the options only for changed reports
     */
    (0, react_1.useEffect)(function () {
        if (!changedReportsEntries || !areOptionsInitialized.current) {
            return;
        }
        setOptions(function (prevOptions) {
            var changedReportKeys = Object.keys(changedReportsEntries);
            if (changedReportKeys.length === 0) {
                return prevOptions;
            }
            var updatedReportsMap = new Map(prevOptions.reports.map(function (report) { return [report.reportID, report]; }));
            changedReportKeys.forEach(function (reportKey) {
                var report = changedReportsEntries[reportKey];
                var reportID = reportKey.replace(ONYXKEYS_1.default.COLLECTION.REPORT, '');
                var reportOption = (0, OptionsListUtils_1.processReport)(report, personalDetails).reportOption;
                if (reportOption) {
                    updatedReportsMap.set(reportID, reportOption);
                }
                else {
                    updatedReportsMap.delete(reportID);
                }
            });
            return __assign(__assign({}, prevOptions), { reports: Array.from(updatedReportsMap.values()) });
        });
    }, [changedReportsEntries, personalDetails]);
    (0, react_1.useEffect)(function () {
        if (!changedReportActions || !areOptionsInitialized.current) {
            return;
        }
        setOptions(function (prevOptions) {
            var changedReportActionsEntries = Object.entries(changedReportActions);
            if (changedReportActionsEntries.length === 0) {
                return prevOptions;
            }
            var updatedReportsMap = new Map(prevOptions.reports.map(function (report) { return [report.reportID, report]; }));
            changedReportActionsEntries.forEach(function (_a) {
                var _b;
                var key = _a[0], reportAction = _a[1];
                if (!reportAction) {
                    return;
                }
                var reportID = key.replace(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS, '');
                var reportOption = (0, OptionsListUtils_1.processReport)((_b = updatedReportsMap.get(reportID)) === null || _b === void 0 ? void 0 : _b.item, personalDetails).reportOption;
                if (reportOption) {
                    updatedReportsMap.set(reportID, reportOption);
                }
            });
            return __assign(__assign({}, prevOptions), { reports: Array.from(updatedReportsMap.values()) });
        });
    }, [changedReportActions, personalDetails]);
    /**
     * This effect is used to update the options list when personal details change.
     */
    (0, react_1.useEffect)(function () {
        // there is no need to update the options if the options are not initialized
        if (!areOptionsInitialized.current) {
            return;
        }
        if (!personalDetails) {
            return;
        }
        // Handle initial personal details load. This initialization is required here specifically to prevent
        // UI freezing that occurs when resetting the app from the troubleshooting page.
        if (!prevPersonalDetails) {
            var _a = (0, OptionsListUtils_1.createOptionList)(personalDetails, reports), newPersonalDetailsOptions_1 = _a.personalDetails, newReports_1 = _a.reports;
            setOptions(function (prevOptions) { return (__assign(__assign({}, prevOptions), { personalDetails: newPersonalDetailsOptions_1, reports: newReports_1 })); });
            return;
        }
        var newReportOptions = [];
        Object.keys(personalDetails).forEach(function (accountID) {
            var prevPersonalDetail = prevPersonalDetails === null || prevPersonalDetails === void 0 ? void 0 : prevPersonalDetails[accountID];
            var personalDetail = personalDetails[accountID];
            if (prevPersonalDetail && personalDetail && isEqualPersonalDetail(prevPersonalDetail, personalDetail)) {
                return;
            }
            Object.values(reports !== null && reports !== void 0 ? reports : {})
                .filter(function (report) { var _a; return !!Object.keys((_a = report === null || report === void 0 ? void 0 : report.participants) !== null && _a !== void 0 ? _a : {}).includes(accountID) || ((0, ReportUtils_1.isSelfDM)(report) && (report === null || report === void 0 ? void 0 : report.ownerAccountID) === Number(accountID)); })
                .forEach(function (report) {
                if (!report) {
                    return;
                }
                var newReportOption = (0, OptionsListUtils_1.createOptionFromReport)(report, personalDetails);
                var replaceIndex = options.reports.findIndex(function (option) { return option.reportID === report.reportID; });
                newReportOptions.push({
                    newReportOption: newReportOption,
                    replaceIndex: replaceIndex,
                });
            });
        });
        // since personal details are not a collection, we need to recreate the whole list from scratch
        var newPersonalDetailsOptions = (0, OptionsListUtils_1.createOptionList)(personalDetails).personalDetails;
        setOptions(function (prevOptions) {
            var newOptions = __assign({}, prevOptions);
            newOptions.personalDetails = newPersonalDetailsOptions;
            newReportOptions.forEach(function (newReportOption) { return (newOptions.reports[newReportOption.replaceIndex] = newReportOption.newReportOption); });
            return newOptions;
        });
        // This effect is used to update the options list when personal details change so we ignore all dependencies except personalDetails
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps
    }, [personalDetails]);
    var initializeOptions = (0, react_1.useCallback)(function () {
        loadOptions();
        areOptionsInitialized.current = true;
    }, [loadOptions]);
    var resetOptions = (0, react_1.useCallback)(function () {
        if (!areOptionsInitialized.current) {
            return;
        }
        areOptionsInitialized.current = false;
        setOptions({
            reports: [],
            personalDetails: [],
        });
    }, []);
    return (<OptionsListContext.Provider // eslint-disable-next-line react-compiler/react-compiler
     value={(0, react_1.useMemo)(function () { return ({ options: options, initializeOptions: initializeOptions, areOptionsInitialized: areOptionsInitialized.current, resetOptions: resetOptions }); }, [options, initializeOptions, resetOptions])}>
            {children}
        </OptionsListContext.Provider>);
}
var useOptionsListContext = function () { return (0, react_1.useContext)(OptionsListContext); };
// Hook to use the OptionsListContext with an initializer to load the options
var useOptionsList = function (options) {
    var _a = (options !== null && options !== void 0 ? options : {}).shouldInitialize, shouldInitialize = _a === void 0 ? true : _a;
    var _b = useOptionsListContext(), initializeOptions = _b.initializeOptions, optionsList = _b.options, areOptionsInitialized = _b.areOptionsInitialized, resetOptions = _b.resetOptions;
    var isLoadingApp = (0, useOnyx_1.default)(ONYXKEYS_1.default.IS_LOADING_APP, { canBeMissing: false })[0];
    var _c = (0, react_1.useState)(optionsList), internalOptions = _c[0], setInternalOptions = _c[1];
    var prevOptions = (0, react_1.useRef)(null);
    (0, react_1.useEffect)(function () {
        if (!prevOptions.current) {
            prevOptions.current = optionsList;
            setInternalOptions(optionsList);
            return;
        }
        /**
         * optionsList reference can change multiple times even the value of its arrays is the same. We perform shallow comparison to check if the options have truly changed.
         * This is necessary to avoid unnecessary re-renders in components that use this context.
         */
        var areOptionsEqual = (0, OptionsListUtils_1.shallowOptionsListCompare)(prevOptions.current, optionsList);
        prevOptions.current = optionsList;
        if (areOptionsEqual) {
            return;
        }
        setInternalOptions(optionsList);
    }, [optionsList]);
    (0, react_1.useEffect)(function () {
        if (!shouldInitialize || areOptionsInitialized || isLoadingApp) {
            return;
        }
        initializeOptions();
    }, [shouldInitialize, initializeOptions, areOptionsInitialized, isLoadingApp]);
    return (0, react_1.useMemo)(function () { return ({
        initializeOptions: initializeOptions,
        options: internalOptions,
        areOptionsInitialized: areOptionsInitialized,
        resetOptions: resetOptions,
    }); }, [initializeOptions, internalOptions, areOptionsInitialized, resetOptions]);
};
exports.useOptionsList = useOptionsList;
exports.default = OptionsListContextProvider;
