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
var react_native_1 = require("react-native");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var OptionListContextProvider_1 = require("@components/OptionListContextProvider");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var SelectionList_1 = require("@components/SelectionList");
var UserListItem_1 = require("@components/SelectionList/UserListItem");
var useDebouncedState_1 = require("@hooks/useDebouncedState");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ReportActions = require("@libs/actions/Report");
var types_1 = require("@libs/API/types");
var HttpUtils_1 = require("@libs/HttpUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var OptionsListUtils = require("@libs/OptionsListUtils");
var ReportUtils = require("@libs/ReportUtils");
var Task = require("@userActions/Task");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var selectReportHandler = function (option) {
    HttpUtils_1.default.cancelPendingRequests(types_1.READ_COMMANDS.SEARCH_FOR_REPORTS);
    var optionItem = option;
    if (!optionItem || !(optionItem === null || optionItem === void 0 ? void 0 : optionItem.reportID)) {
        return;
    }
    Task.setShareDestinationValue(optionItem === null || optionItem === void 0 ? void 0 : optionItem.reportID);
    Navigation_1.default.goBack(ROUTES_1.default.NEW_TASK.getRoute());
};
var reportFilter = function (reportOptions) {
    return (reportOptions !== null && reportOptions !== void 0 ? reportOptions : []).reduce(function (filtered, option) {
        var report = option.item;
        if (ReportUtils.canUserPerformWriteAction(report) && ReportUtils.canCreateTaskInReport(report) && !ReportUtils.isCanceledTaskReport(report)) {
            filtered.push(option);
        }
        return filtered;
    }, []);
};
function TaskShareDestinationSelectorModal() {
    var _a = (0, react_1.useState)(false), didScreenTransitionEnd = _a[0], setDidScreenTransitionEnd = _a[1];
    var styles = (0, useThemeStyles_1.default)();
    var _b = (0, useDebouncedState_1.default)(''), searchValue = _b[0], debouncedSearchValue = _b[1], setSearchValue = _b[2];
    var translate = (0, useLocalize_1.default)().translate;
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var isSearchingForReports = (0, useOnyx_1.default)(ONYXKEYS_1.default.IS_SEARCHING_FOR_REPORTS, { initWithStoredValues: false })[0];
    var _c = (0, OptionListContextProvider_1.useOptionsList)({
        shouldInitialize: didScreenTransitionEnd,
    }), optionList = _c.options, areOptionsInitialized = _c.areOptionsInitialized;
    var textInputHint = (0, react_1.useMemo)(function () { return (isOffline ? "".concat(translate('common.youAppearToBeOffline'), " ").concat(translate('search.resultsAreLimited')) : ''); }, [isOffline, translate]);
    var defaultOptions = (0, react_1.useMemo)(function () {
        if (!areOptionsInitialized) {
            return {
                recentReports: [],
                personalDetails: [],
                userToInvite: null,
                currentUserOption: null,
                header: '',
            };
        }
        var filteredReports = reportFilter(optionList.reports);
        var recentReports = OptionsListUtils.getShareDestinationOptions(filteredReports, optionList.personalDetails, [], [], {}, true).recentReports;
        var header = OptionsListUtils.getHeaderMessage(recentReports && recentReports.length !== 0, false, '');
        return {
            recentReports: recentReports,
            personalDetails: [],
            userToInvite: null,
            currentUserOption: null,
            header: header,
        };
    }, [areOptionsInitialized, optionList.personalDetails, optionList.reports]);
    var options = (0, react_1.useMemo)(function () {
        if (debouncedSearchValue.trim() === '') {
            return defaultOptions;
        }
        var filteredReports = OptionsListUtils.filterAndOrderOptions(defaultOptions, debouncedSearchValue.trim(), {
            excludeLogins: CONST_1.default.EXPENSIFY_EMAILS_OBJECT,
            canInviteUser: false,
        });
        var header = OptionsListUtils.getHeaderMessage(filteredReports.recentReports && filteredReports.recentReports.length !== 0, false, debouncedSearchValue);
        return __assign(__assign({}, filteredReports), { header: header });
    }, [debouncedSearchValue, defaultOptions]);
    var sections = (0, react_1.useMemo)(function () {
        return options.recentReports && options.recentReports.length > 0
            ? [
                {
                    data: options.recentReports.map(function (option) {
                        var _a, _b, _c, _d, _e, _f;
                        return (__assign(__assign({}, option), { text: (_a = option.text) !== null && _a !== void 0 ? _a : '', alternateText: (_b = option.alternateText) !== null && _b !== void 0 ? _b : undefined, keyForList: (_c = option.keyForList) !== null && _c !== void 0 ? _c : '', isDisabled: (_d = option.isDisabled) !== null && _d !== void 0 ? _d : undefined, login: (_e = option.login) !== null && _e !== void 0 ? _e : undefined, shouldShowSubscript: (_f = option.shouldShowSubscript) !== null && _f !== void 0 ? _f : undefined }));
                    }),
                    shouldShow: true,
                },
            ]
            : [];
    }, [options.recentReports]);
    (0, react_1.useEffect)(function () {
        ReportActions.searchInServer(debouncedSearchValue);
    }, [debouncedSearchValue]);
    return (<ScreenWrapper_1.default includeSafeAreaPaddingBottom={false} testID="TaskShareDestinationSelectorModal" onEntryTransitionEnd={function () { return setDidScreenTransitionEnd(true); }}>
            <>
                <HeaderWithBackButton_1.default title={translate('common.share')} onBackButtonPress={function () { return Navigation_1.default.goBack(ROUTES_1.default.NEW_TASK.getRoute()); }}/>
                <react_native_1.View style={[styles.flex1, styles.w100, styles.pRelative]}>
                    <SelectionList_1.default ListItem={UserListItem_1.default} sections={areOptionsInitialized ? sections : []} onSelectRow={selectReportHandler} shouldSingleExecuteRowSelect onChangeText={setSearchValue} textInputValue={searchValue} headerMessage={options.header} textInputLabel={translate('selectionList.nameEmailOrPhoneNumber')} showLoadingPlaceholder={areOptionsInitialized && debouncedSearchValue.trim() === '' ? sections.length === 0 : !didScreenTransitionEnd} isLoadingNewOptions={!!isSearchingForReports} textInputHint={textInputHint}/>
                </react_native_1.View>
            </>
        </ScreenWrapper_1.default>);
}
TaskShareDestinationSelectorModal.displayName = 'TaskShareDestinationSelectorModal';
exports.default = TaskShareDestinationSelectorModal;
