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
/* eslint-disable es/no-optional-chaining */
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var react_native_1 = require("react-native");
var FullPageNotFoundView_1 = require("@components/BlockingViews/FullPageNotFoundView");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var OnyxProvider_1 = require("@components/OnyxProvider");
var OptionListContextProvider_1 = require("@components/OptionListContextProvider");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var SelectionList_1 = require("@components/SelectionList");
var UserListItem_1 = require("@components/SelectionList/UserListItem");
var withCurrentUserPersonalDetails_1 = require("@components/withCurrentUserPersonalDetails");
var withNavigationTransitionEnd_1 = require("@components/withNavigationTransitionEnd");
var useCurrentUserPersonalDetails_1 = require("@hooks/useCurrentUserPersonalDetails");
var useDebouncedState_1 = require("@hooks/useDebouncedState");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useReportIsArchived_1 = require("@hooks/useReportIsArchived");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Report_1 = require("@libs/actions/Report");
var Task_1 = require("@libs/actions/Task");
var types_1 = require("@libs/API/types");
var HttpUtils_1 = require("@libs/HttpUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var OptionsListUtils_1 = require("@libs/OptionsListUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
function useOptions() {
    var betas = (0, OnyxProvider_1.useBetas)();
    var _a = (0, react_1.useState)(true), isLoading = _a[0], setIsLoading = _a[1];
    var _b = (0, useDebouncedState_1.default)(''), searchValue = _b[0], debouncedSearchValue = _b[1], setSearchValue = _b[2];
    var _c = (0, OptionListContextProvider_1.useOptionsList)(), optionsList = _c.options, areOptionsInitialized = _c.areOptionsInitialized;
    var defaultOptions = (0, react_1.useMemo)(function () {
        var _a = (0, OptionsListUtils_1.getValidOptions)({
            reports: optionsList.reports,
            personalDetails: optionsList.personalDetails,
        }, {
            betas: betas,
            excludeLogins: CONST_1.default.EXPENSIFY_EMAILS_OBJECT,
        }), recentReports = _a.recentReports, personalDetails = _a.personalDetails, userToInvite = _a.userToInvite, currentUserOption = _a.currentUserOption;
        var headerMessage = (0, OptionsListUtils_1.getHeaderMessage)(((recentReports === null || recentReports === void 0 ? void 0 : recentReports.length) || 0) + ((personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails.length) || 0) !== 0 || !!currentUserOption, !!userToInvite, '');
        if (isLoading) {
            // eslint-disable-next-line react-compiler/react-compiler
            setIsLoading(false);
        }
        return {
            userToInvite: userToInvite,
            recentReports: recentReports,
            personalDetails: personalDetails,
            currentUserOption: currentUserOption,
            headerMessage: headerMessage,
        };
    }, [optionsList.reports, optionsList.personalDetails, betas, isLoading]);
    var options = (0, react_1.useMemo)(function () {
        var _a, _b;
        var filteredOptions = (0, OptionsListUtils_1.filterAndOrderOptions)(defaultOptions, debouncedSearchValue.trim(), {
            excludeLogins: CONST_1.default.EXPENSIFY_EMAILS_OBJECT,
            maxRecentReportsToShow: CONST_1.default.IOU.MAX_RECENT_REPORTS_TO_SHOW,
        });
        var headerMessage = (0, OptionsListUtils_1.getHeaderMessage)((((_a = filteredOptions.recentReports) === null || _a === void 0 ? void 0 : _a.length) || 0) + (((_b = filteredOptions.personalDetails) === null || _b === void 0 ? void 0 : _b.length) || 0) !== 0 || !!filteredOptions.currentUserOption, !!filteredOptions.userToInvite, debouncedSearchValue);
        return __assign(__assign({}, filteredOptions), { headerMessage: headerMessage });
    }, [debouncedSearchValue, defaultOptions]);
    return __assign(__assign({}, options), { searchValue: searchValue, debouncedSearchValue: debouncedSearchValue, setSearchValue: setSearchValue, areOptionsInitialized: areOptionsInitialized });
}
function TaskAssigneeSelectorModal() {
    var _a;
    var styles = (0, useThemeStyles_1.default)();
    var route = (0, native_1.useRoute)();
    var translate = (0, useLocalize_1.default)().translate;
    var session = (0, OnyxProvider_1.useSession)();
    var backTo = (_a = route.params) === null || _a === void 0 ? void 0 : _a.backTo;
    var reports = (0, useOnyx_1.default)(ONYXKEYS_1.default.COLLECTION.REPORT, { canBeMissing: false })[0];
    var task = (0, useOnyx_1.default)(ONYXKEYS_1.default.TASK, { canBeMissing: false })[0];
    var isSearchingForReports = (0, useOnyx_1.default)(ONYXKEYS_1.default.IS_SEARCHING_FOR_REPORTS, { initWithStoredValues: false, canBeMissing: true })[0];
    var currentUserPersonalDetails = (0, useCurrentUserPersonalDetails_1.default)();
    var _b = useOptions(), userToInvite = _b.userToInvite, recentReports = _b.recentReports, personalDetails = _b.personalDetails, currentUserOption = _b.currentUserOption, searchValue = _b.searchValue, debouncedSearchValue = _b.debouncedSearchValue, setSearchValue = _b.setSearchValue, headerMessage = _b.headerMessage, areOptionsInitialized = _b.areOptionsInitialized;
    var report = (0, react_1.useMemo)(function () {
        var _a, _b, _c;
        if (!((_a = route.params) === null || _a === void 0 ? void 0 : _a.reportID)) {
            return;
        }
        var reportOnyx = reports === null || reports === void 0 ? void 0 : reports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat((_b = route.params) === null || _b === void 0 ? void 0 : _b.reportID)];
        if (reportOnyx && !(0, ReportUtils_1.isTaskReport)(reportOnyx)) {
            Navigation_1.default.isNavigationReady().then(function () {
                Navigation_1.default.dismissModalWithReport({ reportID: reportOnyx.reportID });
            });
        }
        return reports === null || reports === void 0 ? void 0 : reports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat((_c = route.params) === null || _c === void 0 ? void 0 : _c.reportID)];
    }, [reports, route]);
    var sections = (0, react_1.useMemo)(function () {
        var sectionsList = [];
        if (currentUserOption) {
            sectionsList.push({
                title: translate('newTaskPage.assignMe'),
                data: [currentUserOption],
                shouldShow: true,
            });
        }
        sectionsList.push({
            title: translate('common.recents'),
            data: recentReports,
            shouldShow: (recentReports === null || recentReports === void 0 ? void 0 : recentReports.length) > 0,
        });
        sectionsList.push({
            title: translate('common.contacts'),
            data: personalDetails,
            shouldShow: (personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails.length) > 0,
        });
        if (userToInvite) {
            sectionsList.push({
                title: '',
                data: [userToInvite],
                shouldShow: true,
            });
        }
        return sectionsList.map(function (section) { return (__assign(__assign({}, section), { data: section.data.map(function (option) {
                var _a, _b, _c, _d, _e, _f;
                return (__assign(__assign({}, option), { text: (_a = option.text) !== null && _a !== void 0 ? _a : '', alternateText: (_b = option.alternateText) !== null && _b !== void 0 ? _b : undefined, keyForList: (_c = option.keyForList) !== null && _c !== void 0 ? _c : '', isDisabled: (_d = option.isDisabled) !== null && _d !== void 0 ? _d : undefined, login: (_e = option.login) !== null && _e !== void 0 ? _e : undefined, shouldShowSubscript: (_f = option.shouldShowSubscript) !== null && _f !== void 0 ? _f : undefined }));
            }) })); });
    }, [currentUserOption, personalDetails, recentReports, translate, userToInvite]);
    var selectReport = (0, react_1.useCallback)(function (option) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        HttpUtils_1.default.cancelPendingRequests(types_1.READ_COMMANDS.SEARCH_FOR_REPORTS);
        if (!option) {
            return;
        }
        // Check to see if we're editing a task and if so, update the assignee
        if (report) {
            if (option.accountID !== report.managerID) {
                var assigneeChatReport = (0, Task_1.setAssigneeValue)((_a = option === null || option === void 0 ? void 0 : option.login) !== null && _a !== void 0 ? _a : '', (_b = option === null || option === void 0 ? void 0 : option.accountID) !== null && _b !== void 0 ? _b : CONST_1.default.DEFAULT_NUMBER_ID, report.reportID, undefined, // passing null as report because for editing task the report will be task details report page not the actual report where task was created
                (0, OptionsListUtils_1.isCurrentUser)(__assign(__assign({}, option), { accountID: (_c = option === null || option === void 0 ? void 0 : option.accountID) !== null && _c !== void 0 ? _c : CONST_1.default.DEFAULT_NUMBER_ID, login: (_d = option === null || option === void 0 ? void 0 : option.login) !== null && _d !== void 0 ? _d : '' })));
                // Pass through the selected assignee
                (0, Task_1.editTaskAssignee)(report, (_e = session === null || session === void 0 ? void 0 : session.accountID) !== null && _e !== void 0 ? _e : CONST_1.default.DEFAULT_NUMBER_ID, (_f = option === null || option === void 0 ? void 0 : option.login) !== null && _f !== void 0 ? _f : '', option === null || option === void 0 ? void 0 : option.accountID, assigneeChatReport);
            }
            react_native_1.InteractionManager.runAfterInteractions(function () {
                Navigation_1.default.dismissModalWithReport({ reportID: report === null || report === void 0 ? void 0 : report.reportID });
            });
            // If there's no report, we're creating a new task
        }
        else if (option.accountID) {
            (0, Task_1.setAssigneeValue)((_g = option === null || option === void 0 ? void 0 : option.login) !== null && _g !== void 0 ? _g : '', (_h = option.accountID) !== null && _h !== void 0 ? _h : CONST_1.default.DEFAULT_NUMBER_ID, (_j = task === null || task === void 0 ? void 0 : task.shareDestination) !== null && _j !== void 0 ? _j : '', undefined, // passing null as report is null in this condition
            (0, OptionsListUtils_1.isCurrentUser)(__assign(__assign({}, option), { accountID: (_k = option === null || option === void 0 ? void 0 : option.accountID) !== null && _k !== void 0 ? _k : CONST_1.default.DEFAULT_NUMBER_ID, login: (_l = option === null || option === void 0 ? void 0 : option.login) !== null && _l !== void 0 ? _l : undefined })));
            react_native_1.InteractionManager.runAfterInteractions(function () {
                Navigation_1.default.goBack(ROUTES_1.default.NEW_TASK.getRoute(backTo));
            });
        }
    }, [session === null || session === void 0 ? void 0 : session.accountID, task === null || task === void 0 ? void 0 : task.shareDestination, report, backTo]);
    var handleBackButtonPress = (0, react_1.useCallback)(function () { var _a; return Navigation_1.default.goBack(!((_a = route.params) === null || _a === void 0 ? void 0 : _a.reportID) ? ROUTES_1.default.NEW_TASK.getRoute(backTo) : backTo); }, [route.params, backTo]);
    var isOpen = (0, ReportUtils_1.isOpenTaskReport)(report);
    var isParentReportArchived = (0, useReportIsArchived_1.default)(report === null || report === void 0 ? void 0 : report.parentReportID);
    var isTaskModifiable = (0, Task_1.canModifyTask)(report, currentUserPersonalDetails.accountID, isParentReportArchived);
    var isTaskNonEditable = (0, ReportUtils_1.isTaskReport)(report) && (!isTaskModifiable || !isOpen);
    (0, react_1.useEffect)(function () {
        (0, Report_1.searchInServer)(debouncedSearchValue);
    }, [debouncedSearchValue]);
    return (<ScreenWrapper_1.default includeSafeAreaPaddingBottom={false} testID={TaskAssigneeSelectorModal.displayName}>
            <FullPageNotFoundView_1.default shouldShow={isTaskNonEditable}>
                <HeaderWithBackButton_1.default title={translate('task.assignee')} onBackButtonPress={handleBackButtonPress}/>
                <react_native_1.View style={[styles.flex1, styles.w100, styles.pRelative]}>
                    <SelectionList_1.default sections={areOptionsInitialized ? sections : []} ListItem={UserListItem_1.default} onSelectRow={selectReport} shouldSingleExecuteRowSelect onChangeText={setSearchValue} textInputValue={searchValue} headerMessage={headerMessage} textInputLabel={translate('selectionList.nameEmailOrPhoneNumber')} showLoadingPlaceholder={!areOptionsInitialized} isLoadingNewOptions={!!isSearchingForReports}/>
                </react_native_1.View>
            </FullPageNotFoundView_1.default>
        </ScreenWrapper_1.default>);
}
TaskAssigneeSelectorModal.displayName = 'TaskAssigneeSelectorModal';
exports.default = (0, withNavigationTransitionEnd_1.default)((0, withCurrentUserPersonalDetails_1.default)(TaskAssigneeSelectorModal));
