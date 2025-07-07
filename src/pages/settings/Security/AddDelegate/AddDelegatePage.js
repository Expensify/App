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
var DelegateNoAccessWrapper_1 = require("@components/DelegateNoAccessWrapper");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var OnyxProvider_1 = require("@components/OnyxProvider");
var OptionListContextProvider_1 = require("@components/OptionListContextProvider");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var SelectionList_1 = require("@components/SelectionList");
var UserListItem_1 = require("@components/SelectionList/UserListItem");
var useDebouncedState_1 = require("@hooks/useDebouncedState");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var ReportActions = require("@libs/actions/Report");
var Navigation_1 = require("@libs/Navigation/Navigation");
var OptionsListUtils = require("@libs/OptionsListUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
function useOptions() {
    var _a;
    var betas = (0, OnyxProvider_1.useBetas)();
    var _b = (0, react_1.useState)(true), isLoading = _b[0], setIsLoading = _b[1];
    var _c = (0, useDebouncedState_1.default)(''), searchValue = _c[0], debouncedSearchValue = _c[1], setSearchValue = _c[2];
    var _d = (0, OptionListContextProvider_1.useOptionsList)(), optionsList = _d.options, areOptionsInitialized = _d.areOptionsInitialized;
    var account = (0, useOnyx_1.default)(ONYXKEYS_1.default.ACCOUNT)[0];
    var existingDelegates = (0, react_1.useMemo)(function () {
        var _a, _b;
        return (_b = (_a = account === null || account === void 0 ? void 0 : account.delegatedAccess) === null || _a === void 0 ? void 0 : _a.delegates) === null || _b === void 0 ? void 0 : _b.reduce(function (prev, _a) {
            var email = _a.email;
            // eslint-disable-next-line no-param-reassign
            prev[email] = true;
            return prev;
        }, {});
    }, [(_a = account === null || account === void 0 ? void 0 : account.delegatedAccess) === null || _a === void 0 ? void 0 : _a.delegates]);
    var defaultOptions = (0, react_1.useMemo)(function () {
        var _a = OptionsListUtils.getValidOptions({
            reports: optionsList.reports,
            personalDetails: optionsList.personalDetails,
        }, {
            betas: betas,
            excludeLogins: __assign(__assign({}, CONST_1.default.EXPENSIFY_EMAILS_OBJECT), existingDelegates),
        }), recentReports = _a.recentReports, personalDetails = _a.personalDetails, userToInvite = _a.userToInvite, currentUserOption = _a.currentUserOption;
        var headerMessage = OptionsListUtils.getHeaderMessage(((recentReports === null || recentReports === void 0 ? void 0 : recentReports.length) || 0) + ((personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails.length) || 0) !== 0, !!userToInvite, '');
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
    }, [optionsList.reports, optionsList.personalDetails, betas, existingDelegates, isLoading]);
    var options = (0, react_1.useMemo)(function () {
        var _a, _b;
        var filteredOptions = OptionsListUtils.filterAndOrderOptions(defaultOptions, debouncedSearchValue.trim(), {
            excludeLogins: __assign(__assign({}, CONST_1.default.EXPENSIFY_EMAILS_OBJECT), existingDelegates),
            maxRecentReportsToShow: CONST_1.default.IOU.MAX_RECENT_REPORTS_TO_SHOW,
        });
        var headerMessage = OptionsListUtils.getHeaderMessage((((_a = filteredOptions.recentReports) === null || _a === void 0 ? void 0 : _a.length) || 0) + (((_b = filteredOptions.personalDetails) === null || _b === void 0 ? void 0 : _b.length) || 0) !== 0, !!filteredOptions.userToInvite, debouncedSearchValue);
        return __assign(__assign({}, filteredOptions), { headerMessage: headerMessage });
    }, [debouncedSearchValue, defaultOptions, existingDelegates]);
    return __assign(__assign({}, options), { searchValue: searchValue, debouncedSearchValue: debouncedSearchValue, setSearchValue: setSearchValue, areOptionsInitialized: areOptionsInitialized });
}
function AddDelegatePage() {
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var isSearchingForReports = (0, useOnyx_1.default)(ONYXKEYS_1.default.IS_SEARCHING_FOR_REPORTS, { initWithStoredValues: false })[0];
    var _a = useOptions(), userToInvite = _a.userToInvite, recentReports = _a.recentReports, personalDetails = _a.personalDetails, searchValue = _a.searchValue, debouncedSearchValue = _a.debouncedSearchValue, setSearchValue = _a.setSearchValue, headerMessage = _a.headerMessage, areOptionsInitialized = _a.areOptionsInitialized;
    var sections = (0, react_1.useMemo)(function () {
        var sectionsList = [];
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
                title: undefined,
                data: [userToInvite],
                shouldShow: true,
            });
        }
        return sectionsList.map(function (section) { return (__assign(__assign({}, section), { data: section.data.map(function (option) {
                var _a, _b, _c, _d, _e, _f;
                return (__assign(__assign({}, option), { text: (_a = option.text) !== null && _a !== void 0 ? _a : '', alternateText: (_b = option.alternateText) !== null && _b !== void 0 ? _b : undefined, keyForList: (_c = option.keyForList) !== null && _c !== void 0 ? _c : '', isDisabled: (_d = option.isDisabled) !== null && _d !== void 0 ? _d : undefined, login: (_e = option.login) !== null && _e !== void 0 ? _e : undefined, shouldShowSubscript: (_f = option.shouldShowSubscript) !== null && _f !== void 0 ? _f : undefined }));
            }) })); });
    }, [personalDetails, recentReports, translate, userToInvite]);
    var onSelectRow = (0, react_1.useCallback)(function (option) {
        var _a;
        Navigation_1.default.navigate(ROUTES_1.default.SETTINGS_DELEGATE_ROLE.getRoute((_a = option === null || option === void 0 ? void 0 : option.login) !== null && _a !== void 0 ? _a : ''));
    }, []);
    (0, react_1.useEffect)(function () {
        ReportActions.searchInServer(debouncedSearchValue);
    }, [debouncedSearchValue]);
    return (<ScreenWrapper_1.default includeSafeAreaPaddingBottom={false} testID={AddDelegatePage.displayName}>
            <DelegateNoAccessWrapper_1.default accessDeniedVariants={[CONST_1.default.DELEGATE.DENIED_ACCESS_VARIANTS.DELEGATE]}>
                <HeaderWithBackButton_1.default title={translate('delegate.addCopilot')} onBackButtonPress={function () { return Navigation_1.default.goBack(); }}/>
                <react_native_1.View style={[styles.flex1, styles.w100, styles.pRelative]}>
                    <SelectionList_1.default sections={areOptionsInitialized ? sections : []} ListItem={UserListItem_1.default} onSelectRow={onSelectRow} shouldSingleExecuteRowSelect onChangeText={setSearchValue} textInputValue={searchValue} headerMessage={headerMessage} textInputLabel={translate('selectionList.nameEmailOrPhoneNumber')} showLoadingPlaceholder={!areOptionsInitialized} isLoadingNewOptions={!!isSearchingForReports}/>
                </react_native_1.View>
            </DelegateNoAccessWrapper_1.default>
        </ScreenWrapper_1.default>);
}
AddDelegatePage.displayName = 'AddDelegatePage';
exports.default = AddDelegatePage;
