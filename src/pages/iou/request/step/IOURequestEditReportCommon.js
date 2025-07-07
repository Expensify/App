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
var react_1 = require("react");
var OptionListContextProvider_1 = require("@components/OptionListContextProvider");
var SelectionList_1 = require("@components/SelectionList");
var InviteMemberListItem_1 = require("@components/SelectionList/InviteMemberListItem");
var useCurrentUserPersonalDetails_1 = require("@hooks/useCurrentUserPersonalDetails");
var useDebouncedState_1 = require("@hooks/useDebouncedState");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var Navigation_1 = require("@libs/Navigation/Navigation");
var ReportUtils_1 = require("@libs/ReportUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var mapOnyxCollectionItems_1 = require("@src/utils/mapOnyxCollectionItems");
var StepScreenWrapper_1 = require("./StepScreenWrapper");
/**
 * This function narrows down the data from Onyx to just the properties that we want to trigger a re-render of the component.
 * This helps minimize re-rendering and makes the entire component more performant.
 */
var reportSelector = function (report) {
    return report && {
        ownerAccountID: report.ownerAccountID,
        reportID: report.reportID,
        policyID: report.policyID,
        reportName: report.reportName,
        stateNum: report.stateNum,
        statusNum: report.statusNum,
        type: report.type,
    };
};
function IOURequestEditReportCommon(_a) {
    var _b;
    var backTo = _a.backTo, transactionsReports = _a.transactionsReports, selectReport = _a.selectReport;
    var translate = (0, useLocalize_1.default)().translate;
    var options = (0, OptionListContextProvider_1.useOptionsList)().options;
    var allReports = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.REPORT, { selector: function (reports) { return (0, mapOnyxCollectionItems_1.default)(reports, reportSelector); }, canBeMissing: true })[0];
    var reportNameValuePairs = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.REPORT_NAME_VALUE_PAIRS, { canBeMissing: true })[0];
    var allPoliciesID = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.POLICY, { selector: function (policies) { return (0, mapOnyxCollectionItems_1.default)(policies, function (policy) { return policy === null || policy === void 0 ? void 0 : policy.id; }); }, canBeMissing: false })[0];
    var currentUserPersonalDetails = (0, useCurrentUserPersonalDetails_1.default)();
    var _c = (0, useDebouncedState_1.default)(''), searchValue = _c[0], debouncedSearchValue = _c[1], setSearchValue = _c[2];
    var expenseReports = (0, react_1.useMemo)(function () {
        return Object.values(allPoliciesID !== null && allPoliciesID !== void 0 ? allPoliciesID : {}).flatMap(function (policyID) {
            var _a, _b;
            if (!policyID) {
                return [];
            }
            var reports = (0, ReportUtils_1.getOutstandingReportsForUser)(policyID, (_b = (_a = transactionsReports.at(0)) === null || _a === void 0 ? void 0 : _a.ownerAccountID) !== null && _b !== void 0 ? _b : currentUserPersonalDetails.accountID, allReports !== null && allReports !== void 0 ? allReports : {}, reportNameValuePairs);
            return reports;
        });
    }, [allReports, currentUserPersonalDetails.accountID, transactionsReports, allPoliciesID, reportNameValuePairs]);
    var reportOptions = (0, react_1.useMemo)(function () {
        if (!allReports) {
            return [];
        }
        var onlyReport = transactionsReports.length === 1 ? transactionsReports.at(0) : undefined;
        return expenseReports
            .sort(function (a, b) { var _a, _b, _c, _d; return (_d = (_a = a === null || a === void 0 ? void 0 : a.reportName) === null || _a === void 0 ? void 0 : _a.localeCompare((_c = (_b = b === null || b === void 0 ? void 0 : b.reportName) === null || _b === void 0 ? void 0 : _b.toLowerCase()) !== null && _c !== void 0 ? _c : '')) !== null && _d !== void 0 ? _d : 0; })
            .filter(function (report) { var _a; return !debouncedSearchValue || ((_a = report === null || report === void 0 ? void 0 : report.reportName) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(debouncedSearchValue.toLowerCase())); })
            .filter(function (report) { return report !== undefined; })
            .map(function (report) {
            var _a;
            var matchingOption = options.reports.find(function (option) { return option.reportID === report.reportID; });
            return __assign(__assign({}, matchingOption), { alternateText: (_a = (0, ReportUtils_1.getPolicyName)({ report: report })) !== null && _a !== void 0 ? _a : matchingOption === null || matchingOption === void 0 ? void 0 : matchingOption.alternateText, value: report.reportID, isSelected: onlyReport && report.reportID === (onlyReport === null || onlyReport === void 0 ? void 0 : onlyReport.reportID) });
        });
    }, [allReports, debouncedSearchValue, expenseReports, options.reports, transactionsReports]);
    var navigateBack = function () {
        Navigation_1.default.goBack(backTo);
    };
    var headerMessage = (0, react_1.useMemo)(function () { return (searchValue && !reportOptions.length ? translate('common.noResultsFound') : ''); }, [searchValue, reportOptions, translate]);
    return (<StepScreenWrapper_1.default headerTitle={translate('common.report')} onBackButtonPress={navigateBack} shouldShowWrapper testID="IOURequestEditReportCommon" includeSafeAreaPaddingBottom shouldShowNotFoundPage={expenseReports.length === 0}>
            <SelectionList_1.default sections={[{ data: reportOptions }]} onSelectRow={selectReport} textInputValue={searchValue} onChangeText={setSearchValue} textInputLabel={expenseReports.length >= CONST_1.default.STANDARD_LIST_ITEM_LIMIT ? translate('common.search') : undefined} shouldSingleExecuteRowSelect headerMessage={headerMessage} initiallyFocusedOptionKey={transactionsReports.length === 1 ? (_b = transactionsReports.at(0)) === null || _b === void 0 ? void 0 : _b.reportID : undefined} ListItem={InviteMemberListItem_1.default}/>
        </StepScreenWrapper_1.default>);
}
exports.default = IOURequestEditReportCommon;
