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
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var OnyxProvider_1 = require("@components/OnyxProvider");
var OptionListContextProvider_1 = require("@components/OptionListContextProvider");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var SelectionList_1 = require("@components/SelectionList");
var UserListItem_1 = require("@components/SelectionList/UserListItem");
var useDebouncedState_1 = require("@hooks/useDebouncedState");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var ReportActions = require("@libs/actions/Report");
var FileUtils = require("@libs/fileDownload/FileUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var OptionsListUtils = require("@libs/OptionsListUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
function BaseShareLogList(_a) {
    var onAttachLogToReport = _a.onAttachLogToReport;
    var _b = (0, useDebouncedState_1.default)(''), searchValue = _b[0], debouncedSearchValue = _b[1], setSearchValue = _b[2];
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var translate = (0, useLocalize_1.default)().translate;
    var betas = (0, OnyxProvider_1.useBetas)();
    var isSearchingForReports = (0, useOnyx_1.default)(ONYXKEYS_1.default.IS_SEARCHING_FOR_REPORTS, { initWithStoredValues: false })[0];
    var _c = (0, OptionListContextProvider_1.useOptionsList)(), options = _c.options, areOptionsInitialized = _c.areOptionsInitialized;
    var defaultOptions = (0, react_1.useMemo)(function () {
        if (!areOptionsInitialized) {
            return {
                recentReports: [],
                personalDetails: [],
                userToInvite: null,
                currentUserOption: null,
                headerMessage: '',
            };
        }
        var shareLogOptions = OptionsListUtils.getShareLogOptions(options, betas !== null && betas !== void 0 ? betas : []);
        var header = OptionsListUtils.getHeaderMessage((shareLogOptions.recentReports.length || 0) + (shareLogOptions.personalDetails.length || 0) !== 0, !!shareLogOptions.userToInvite, '');
        return __assign(__assign({}, shareLogOptions), { headerMessage: header });
    }, [areOptionsInitialized, options, betas]);
    var searchOptions = (0, react_1.useMemo)(function () {
        var _a, _b;
        if (debouncedSearchValue.trim() === '') {
            return defaultOptions;
        }
        var filteredOptions = OptionsListUtils.filterAndOrderOptions(defaultOptions, debouncedSearchValue, {
            preferChatRoomsOverThreads: true,
            sortByReportTypeInSearch: true,
        });
        var headerMessage = OptionsListUtils.getHeaderMessage((((_a = filteredOptions.recentReports) === null || _a === void 0 ? void 0 : _a.length) || 0) + (((_b = filteredOptions.personalDetails) === null || _b === void 0 ? void 0 : _b.length) || 0) !== 0, !!filteredOptions.userToInvite, debouncedSearchValue.trim());
        return __assign(__assign({}, filteredOptions), { headerMessage: headerMessage });
    }, [debouncedSearchValue, defaultOptions]);
    var sections = (0, react_1.useMemo)(function () {
        var _a, _b;
        var sectionsList = [];
        sectionsList.push({
            title: translate('common.recents'),
            data: searchOptions.recentReports,
            shouldShow: ((_a = searchOptions.recentReports) === null || _a === void 0 ? void 0 : _a.length) > 0,
        });
        sectionsList.push({
            title: translate('common.contacts'),
            data: searchOptions.personalDetails,
            shouldShow: ((_b = searchOptions.personalDetails) === null || _b === void 0 ? void 0 : _b.length) > 0,
        });
        if (searchOptions.userToInvite) {
            sectionsList.push({
                data: [searchOptions.userToInvite],
                shouldShow: true,
            });
        }
        return sectionsList;
    }, [searchOptions === null || searchOptions === void 0 ? void 0 : searchOptions.personalDetails, searchOptions === null || searchOptions === void 0 ? void 0 : searchOptions.recentReports, searchOptions === null || searchOptions === void 0 ? void 0 : searchOptions.userToInvite, translate]);
    var attachLogToReport = function (option) {
        if (!option.reportID) {
            return;
        }
        var filename = FileUtils.appendTimeToFileName('logs.txt');
        onAttachLogToReport(option.reportID, filename);
    };
    (0, react_1.useEffect)(function () {
        ReportActions.searchInServer(debouncedSearchValue);
    }, [debouncedSearchValue]);
    return (<ScreenWrapper_1.default testID={BaseShareLogList.displayName} includeSafeAreaPaddingBottom={false}>
            {function (_a) {
            var didScreenTransitionEnd = _a.didScreenTransitionEnd;
            return (<>
                    <HeaderWithBackButton_1.default title={translate('initialSettingsPage.debugConsole.shareLog')} onBackButtonPress={function () { return Navigation_1.default.goBack(ROUTES_1.default.SETTINGS_CONSOLE.getRoute()); }}/>
                    <SelectionList_1.default ListItem={UserListItem_1.default} sections={didScreenTransitionEnd ? sections : CONST_1.default.EMPTY_ARRAY} onSelectRow={attachLogToReport} shouldSingleExecuteRowSelect onChangeText={setSearchValue} textInputValue={searchValue} headerMessage={searchOptions.headerMessage} textInputLabel={translate('selectionList.nameEmailOrPhoneNumber')} textInputHint={isOffline ? "".concat(translate('common.youAppearToBeOffline'), " ").concat(translate('search.resultsAreLimited')) : ''} showLoadingPlaceholder={!didScreenTransitionEnd} isLoadingNewOptions={!!isSearchingForReports}/>
                </>);
        }}
        </ScreenWrapper_1.default>);
}
BaseShareLogList.displayName = 'ShareLogPage';
exports.default = BaseShareLogList;
