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
var native_1 = require("@react-navigation/native");
var react_1 = require("react");
var FormAlertWithSubmitButton_1 = require("@components/FormAlertWithSubmitButton");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var OptionListContextProvider_1 = require("@components/OptionListContextProvider");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var SelectionList_1 = require("@components/SelectionList");
var InviteMemberListItem_1 = require("@components/SelectionList/InviteMemberListItem");
var withNavigationTransitionEnd_1 = require("@components/withNavigationTransitionEnd");
var useDebouncedState_1 = require("@hooks/useDebouncedState");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Report_1 = require("@libs/actions/Report");
var RoomMembersUserSearchPhrase_1 = require("@libs/actions/RoomMembersUserSearchPhrase");
var DeviceCapabilities_1 = require("@libs/DeviceCapabilities");
var LoginUtils_1 = require("@libs/LoginUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var OptionsListUtils_1 = require("@libs/OptionsListUtils");
var PersonalDetailsUtils_1 = require("@libs/PersonalDetailsUtils");
var PhoneNumber_1 = require("@libs/PhoneNumber");
var ReportUtils_1 = require("@libs/ReportUtils");
var tokenizedSearch_1 = require("@libs/tokenizedSearch");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var withReportOrNotFound_1 = require("./home/report/withReportOrNotFound");
function InviteReportParticipantsPage(_a) {
    var betas = _a.betas, report = _a.report, didScreenTransitionEnd = _a.didScreenTransitionEnd;
    var route = (0, native_1.useRoute)();
    var _b = (0, OptionListContextProvider_1.useOptionsList)({
        shouldInitialize: didScreenTransitionEnd,
    }), options = _b.options, areOptionsInitialized = _b.areOptionsInitialized;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var personalDetails = (0, useOnyx_1.default)(ONYXKEYS_1.default.PERSONAL_DETAILS_LIST, { canBeMissing: false })[0];
    var userSearchPhrase = (0, useOnyx_1.default)(ONYXKEYS_1.default.ROOM_MEMBERS_USER_SEARCH_PHRASE, { canBeMissing: true })[0];
    var _c = (0, useDebouncedState_1.default)(userSearchPhrase !== null && userSearchPhrase !== void 0 ? userSearchPhrase : ''), searchValue = _c[0], debouncedSearchTerm = _c[1], setSearchValue = _c[2];
    var _d = (0, react_1.useState)([]), selectedOptions = _d[0], setSelectedOptions = _d[1];
    (0, react_1.useEffect)(function () {
        (0, RoomMembersUserSearchPhrase_1.updateUserSearchPhrase)(debouncedSearchTerm);
        (0, Report_1.searchInServer)(debouncedSearchTerm);
    }, [debouncedSearchTerm]);
    // Any existing participants and Expensify emails should not be eligible for invitation
    var excludedUsers = (0, react_1.useMemo)(function () {
        var res = __assign({}, CONST_1.default.EXPENSIFY_EMAILS_OBJECT);
        var participantsAccountIDs = (0, ReportUtils_1.getParticipantsAccountIDsForDisplay)(report, false, true);
        var loginsByAccountIDs = (0, PersonalDetailsUtils_1.getLoginsByAccountIDs)(participantsAccountIDs);
        for (var _i = 0, loginsByAccountIDs_1 = loginsByAccountIDs; _i < loginsByAccountIDs_1.length; _i++) {
            var login = loginsByAccountIDs_1[_i];
            res[login] = true;
        }
        return res;
    }, [report]);
    var defaultOptions = (0, react_1.useMemo)(function () {
        if (!areOptionsInitialized) {
            return (0, OptionsListUtils_1.getEmptyOptions)();
        }
        return (0, OptionsListUtils_1.getMemberInviteOptions)(options.personalDetails, betas !== null && betas !== void 0 ? betas : [], excludedUsers, false, options.reports, true);
    }, [areOptionsInitialized, betas, excludedUsers, options.personalDetails, options.reports]);
    var inviteOptions = (0, react_1.useMemo)(function () { return (0, OptionsListUtils_1.filterAndOrderOptions)(defaultOptions, debouncedSearchTerm, { excludeLogins: excludedUsers }); }, [debouncedSearchTerm, defaultOptions, excludedUsers]);
    (0, react_1.useEffect)(function () {
        // Update selectedOptions with the latest personalDetails information
        var detailsMap = {};
        inviteOptions.personalDetails.forEach(function (detail) {
            if (!detail.login) {
                return;
            }
            detailsMap[detail.login] = (0, OptionsListUtils_1.formatMemberForList)(detail);
        });
        var newSelectedOptions = [];
        selectedOptions.forEach(function (option) {
            newSelectedOptions.push(option.login && option.login in detailsMap ? __assign(__assign({}, detailsMap[option.login]), { isSelected: true }) : option);
        });
        setSelectedOptions(newSelectedOptions);
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps -- we don't want to recalculate when selectedOptions change
    }, [personalDetails, betas, debouncedSearchTerm, excludedUsers, options]);
    var sections = (0, react_1.useMemo)(function () {
        var sectionsArr = [];
        if (!areOptionsInitialized) {
            return [];
        }
        // Filter all options that is a part of the search term or in the personal details
        var filterSelectedOptions = selectedOptions;
        if (debouncedSearchTerm !== '') {
            var processedSearchValue_1 = (0, OptionsListUtils_1.getSearchValueForPhoneOrEmail)(debouncedSearchTerm);
            filterSelectedOptions = (0, tokenizedSearch_1.default)(selectedOptions, processedSearchValue_1, function (option) { var _a, _b; return [(_a = option.text) !== null && _a !== void 0 ? _a : '', (_b = option.login) !== null && _b !== void 0 ? _b : '']; }).filter(function (option) {
                var _a, _b;
                var accountID = option === null || option === void 0 ? void 0 : option.accountID;
                var isOptionInPersonalDetails = inviteOptions.personalDetails.some(function (personalDetail) { return accountID && (personalDetail === null || personalDetail === void 0 ? void 0 : personalDetail.accountID) === accountID; });
                var isPartOfSearchTerm = !!((_a = option.text) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(processedSearchValue_1)) || !!((_b = option.login) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(processedSearchValue_1));
                return isPartOfSearchTerm || isOptionInPersonalDetails;
            });
        }
        var filterSelectedOptionsFormatted = filterSelectedOptions.map(function (selectedOption) { return (0, OptionsListUtils_1.formatMemberForList)(selectedOption); });
        sectionsArr.push({
            title: undefined,
            data: filterSelectedOptionsFormatted,
        });
        // Filtering out selected users from the search results
        var selectedLogins = selectedOptions.map(function (_a) {
            var login = _a.login;
            return login;
        });
        var recentReportsWithoutSelected = inviteOptions.recentReports.filter(function (_a) {
            var login = _a.login;
            return !selectedLogins.includes(login);
        });
        var recentReportsFormatted = recentReportsWithoutSelected.map(function (reportOption) { return (0, OptionsListUtils_1.formatMemberForList)(reportOption); });
        var personalDetailsWithoutSelected = inviteOptions.personalDetails.filter(function (_a) {
            var login = _a.login;
            return !selectedLogins.includes(login);
        });
        var personalDetailsFormatted = personalDetailsWithoutSelected.map(function (personalDetail) { return (0, OptionsListUtils_1.formatMemberForList)(personalDetail); });
        var hasUnselectedUserToInvite = inviteOptions.userToInvite && !selectedLogins.includes(inviteOptions.userToInvite.login);
        sectionsArr.push({
            title: translate('common.recents'),
            data: recentReportsFormatted,
        });
        sectionsArr.push({
            title: translate('common.contacts'),
            data: personalDetailsFormatted,
        });
        if (hasUnselectedUserToInvite) {
            sectionsArr.push({
                title: undefined,
                data: inviteOptions.userToInvite ? [(0, OptionsListUtils_1.formatMemberForList)(inviteOptions.userToInvite)] : [],
            });
        }
        return sectionsArr;
    }, [areOptionsInitialized, selectedOptions, debouncedSearchTerm, inviteOptions.recentReports, inviteOptions.personalDetails, inviteOptions.userToInvite, translate]);
    var toggleOption = (0, react_1.useCallback)(function (option) {
        var isOptionInList = selectedOptions.some(function (selectedOption) { return selectedOption.login === option.login; });
        var newSelectedOptions;
        if (isOptionInList) {
            newSelectedOptions = selectedOptions.filter(function (selectedOption) { return selectedOption.login !== option.login; });
        }
        else {
            newSelectedOptions = __spreadArray(__spreadArray([], selectedOptions, true), [__assign(__assign({}, option), { isSelected: true })], false);
        }
        setSelectedOptions(newSelectedOptions);
    }, [selectedOptions]);
    var validate = (0, react_1.useCallback)(function () { return selectedOptions.length > 0; }, [selectedOptions]);
    var reportID = report.reportID;
    var reportName = (0, react_1.useMemo)(function () { return (0, ReportUtils_1.getGroupChatName)(undefined, true, report); }, [report]);
    var goBack = (0, react_1.useCallback)(function () {
        Navigation_1.default.goBack(ROUTES_1.default.REPORT_PARTICIPANTS.getRoute(reportID, route.params.backTo));
    }, [reportID, route.params.backTo]);
    var inviteUsers = (0, react_1.useCallback)(function () {
        if (!validate()) {
            return;
        }
        var invitedEmailsToAccountIDs = {};
        selectedOptions.forEach(function (option) {
            var _a;
            var login = (_a = option.login) !== null && _a !== void 0 ? _a : '';
            var accountID = option.accountID;
            if (!login.toLowerCase().trim() || !accountID) {
                return;
            }
            invitedEmailsToAccountIDs[login] = accountID;
        });
        (0, Report_1.inviteToGroupChat)(reportID, invitedEmailsToAccountIDs);
        goBack();
    }, [selectedOptions, goBack, reportID, validate]);
    var headerMessage = (0, react_1.useMemo)(function () {
        var processedLogin = debouncedSearchTerm.trim().toLowerCase();
        var expensifyEmails = CONST_1.default.EXPENSIFY_EMAILS;
        if (!inviteOptions.userToInvite && expensifyEmails.includes(processedLogin)) {
            return translate('messages.errorMessageInvalidEmail');
        }
        if (!inviteOptions.userToInvite &&
            excludedUsers[(0, PhoneNumber_1.parsePhoneNumber)((0, LoginUtils_1.appendCountryCode)(processedLogin)).possible ? (0, PhoneNumber_1.addSMSDomainIfPhoneNumber)((0, LoginUtils_1.appendCountryCode)(processedLogin)) : processedLogin]) {
            return translate('messages.userIsAlreadyMember', { login: processedLogin, name: reportName !== null && reportName !== void 0 ? reportName : '' });
        }
        return (0, OptionsListUtils_1.getHeaderMessage)(inviteOptions.recentReports.length + inviteOptions.personalDetails.length !== 0, !!inviteOptions.userToInvite, processedLogin);
    }, [debouncedSearchTerm, inviteOptions.userToInvite, inviteOptions.recentReports.length, inviteOptions.personalDetails.length, excludedUsers, translate, reportName]);
    var footerContent = (0, react_1.useMemo)(function () { return (<FormAlertWithSubmitButton_1.default isDisabled={!selectedOptions.length} buttonText={translate('common.invite')} onSubmit={function () {
            (0, RoomMembersUserSearchPhrase_1.clearUserSearchPhrase)();
            inviteUsers();
        }} containerStyles={[styles.flexReset, styles.flexGrow0, styles.flexShrink0, styles.flexBasisAuto]} enabledWhenOffline/>); }, [selectedOptions.length, inviteUsers, translate, styles]);
    return (<ScreenWrapper_1.default shouldEnableMaxHeight testID={InviteReportParticipantsPage.displayName}>
            <HeaderWithBackButton_1.default title={translate('workspace.invite.members')} subtitle={reportName} onBackButtonPress={goBack}/>

            <SelectionList_1.default canSelectMultiple sections={sections} ListItem={InviteMemberListItem_1.default} textInputLabel={translate('selectionList.nameEmailOrPhoneNumber')} textInputValue={searchValue} onChangeText={function (value) {
            setSearchValue(value);
        }} headerMessage={headerMessage} onSelectRow={toggleOption} onConfirm={inviteUsers} showScrollIndicator shouldPreventDefaultFocusOnSelectRow={!(0, DeviceCapabilities_1.canUseTouchScreen)()} showLoadingPlaceholder={!didScreenTransitionEnd || !(0, OptionsListUtils_1.isPersonalDetailsReady)(personalDetails)} footerContent={footerContent}/>
        </ScreenWrapper_1.default>);
}
InviteReportParticipantsPage.displayName = 'InviteReportParticipantsPage';
exports.default = (0, withNavigationTransitionEnd_1.default)((0, withReportOrNotFound_1.default)()(InviteReportParticipantsPage));
