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
var expensify_common_1 = require("expensify-common");
var react_1 = require("react");
var react_native_1 = require("react-native");
var FullPageNotFoundView_1 = require("@components/BlockingViews/FullPageNotFoundView");
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
var types_1 = require("@libs/API/types");
var DeviceCapabilities_1 = require("@libs/DeviceCapabilities");
var HttpUtils_1 = require("@libs/HttpUtils");
var LoginUtils_1 = require("@libs/LoginUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var OptionsListUtils_1 = require("@libs/OptionsListUtils");
var PersonalDetailsUtils_1 = require("@libs/PersonalDetailsUtils");
var PhoneNumber_1 = require("@libs/PhoneNumber");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var ReportUtils_1 = require("@libs/ReportUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var withReportOrNotFound_1 = require("./home/report/withReportOrNotFound");
function RoomInvitePage(_a) {
    var betas = _a.betas, report = _a.report, policy = _a.policy, backTo = _a.route.params.backTo;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var userSearchPhrase = (0, useOnyx_1.default)(ONYXKEYS_1.default.ROOM_MEMBERS_USER_SEARCH_PHRASE, { canBeMissing: true })[0];
    var _b = (0, useDebouncedState_1.default)(userSearchPhrase !== null && userSearchPhrase !== void 0 ? userSearchPhrase : ''), searchTerm = _b[0], debouncedSearchTerm = _b[1], setSearchTerm = _b[2];
    var _c = (0, react_1.useState)([]), selectedOptions = _c[0], setSelectedOptions = _c[1];
    var isSearchingForReports = (0, useOnyx_1.default)(ONYXKEYS_1.default.IS_SEARCHING_FOR_REPORTS, { initWithStoredValues: false, canBeMissing: true })[0];
    var _d = (0, OptionListContextProvider_1.useOptionsList)(), options = _d.options, areOptionsInitialized = _d.areOptionsInitialized;
    // Any existing participants and Expensify emails should not be eligible for invitation
    var excludedUsers = (0, react_1.useMemo)(function () {
        var _a;
        var res = __assign({}, CONST_1.default.EXPENSIFY_EMAILS_OBJECT);
        var visibleParticipantAccountIDs = Object.entries((_a = report.participants) !== null && _a !== void 0 ? _a : {})
            .filter(function (_a) {
            var participant = _a[1];
            return participant && !(0, ReportUtils_1.isHiddenForCurrentUser)(participant.notificationPreference);
        })
            .map(function (_a) {
            var accountID = _a[0];
            return Number(accountID);
        });
        (0, PersonalDetailsUtils_1.getLoginsByAccountIDs)(visibleParticipantAccountIDs).forEach(function (participant) {
            var smsDomain = (0, PhoneNumber_1.addSMSDomainIfPhoneNumber)(participant);
            res[smsDomain] = true;
        });
        return res;
    }, [report.participants]);
    var defaultOptions = (0, react_1.useMemo)(function () {
        if (!areOptionsInitialized) {
            return { recentReports: [], personalDetails: [], userToInvite: null, currentUserOption: null };
        }
        var inviteOptions = (0, OptionsListUtils_1.getMemberInviteOptions)(options.personalDetails, betas !== null && betas !== void 0 ? betas : [], excludedUsers);
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
        return {
            userToInvite: inviteOptions.userToInvite,
            personalDetails: inviteOptions.personalDetails,
            selectedOptions: newSelectedOptions,
            recentReports: [],
            currentUserOption: null,
        };
    }, [areOptionsInitialized, betas, excludedUsers, options.personalDetails, selectedOptions]);
    var inviteOptions = (0, react_1.useMemo)(function () {
        if (debouncedSearchTerm.trim() === '') {
            return defaultOptions;
        }
        var filteredOptions = (0, OptionsListUtils_1.filterAndOrderOptions)(defaultOptions, debouncedSearchTerm, { excludeLogins: excludedUsers });
        return filteredOptions;
    }, [debouncedSearchTerm, defaultOptions, excludedUsers]);
    var sections = (0, react_1.useMemo)(function () {
        var sectionsArr = [];
        var personalDetails = inviteOptions.personalDetails, userToInvite = inviteOptions.userToInvite;
        if (!areOptionsInitialized) {
            return [];
        }
        // Filter all options that is a part of the search term or in the personal details
        var filterSelectedOptions = selectedOptions;
        if (debouncedSearchTerm !== '') {
            filterSelectedOptions = selectedOptions.filter(function (option) {
                var _a, _b, _c, _d;
                var accountID = option === null || option === void 0 ? void 0 : option.accountID;
                var isOptionInPersonalDetails = personalDetails ? personalDetails.some(function (personalDetail) { return accountID && (personalDetail === null || personalDetail === void 0 ? void 0 : personalDetail.accountID) === accountID; }) : false;
                var parsedPhoneNumber = (0, PhoneNumber_1.parsePhoneNumber)((0, LoginUtils_1.appendCountryCode)(expensify_common_1.Str.removeSMSDomain(debouncedSearchTerm)));
                var searchValue = parsedPhoneNumber.possible && parsedPhoneNumber.number ? parsedPhoneNumber.number.e164 : debouncedSearchTerm.toLowerCase();
                var isPartOfSearchTerm = ((_b = (_a = option.text) === null || _a === void 0 ? void 0 : _a.toLowerCase()) !== null && _b !== void 0 ? _b : '').includes(searchValue) || ((_d = (_c = option.login) === null || _c === void 0 ? void 0 : _c.toLowerCase()) !== null && _d !== void 0 ? _d : '').includes(searchValue);
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
        var personalDetailsWithoutSelected = personalDetails ? personalDetails.filter(function (_a) {
            var login = _a.login;
            return !selectedLogins.includes(login);
        }) : [];
        var personalDetailsFormatted = personalDetailsWithoutSelected.map(function (personalDetail) { return (0, OptionsListUtils_1.formatMemberForList)(personalDetail); });
        var hasUnselectedUserToInvite = userToInvite && !selectedLogins.includes(userToInvite.login);
        sectionsArr.push({
            title: translate('common.contacts'),
            data: personalDetailsFormatted,
        });
        if (hasUnselectedUserToInvite) {
            sectionsArr.push({
                title: undefined,
                data: [(0, OptionsListUtils_1.formatMemberForList)(userToInvite)],
            });
        }
        return sectionsArr;
    }, [inviteOptions, areOptionsInitialized, selectedOptions, debouncedSearchTerm, translate]);
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
    // Non policy members should not be able to view the participants of a room
    var reportID = report === null || report === void 0 ? void 0 : report.reportID;
    var isPolicyEmployee = (0, react_1.useMemo)(function () { return (0, PolicyUtils_1.isPolicyEmployee)(report === null || report === void 0 ? void 0 : report.policyID, policy); }, [report === null || report === void 0 ? void 0 : report.policyID, policy]);
    var backRoute = (0, react_1.useMemo)(function () {
        return reportID && (isPolicyEmployee ? ROUTES_1.default.ROOM_MEMBERS.getRoute(reportID, backTo) : ROUTES_1.default.REPORT_WITH_ID_DETAILS.getRoute(reportID, backTo));
    }, [isPolicyEmployee, reportID, backTo]);
    var reportName = (0, react_1.useMemo)(function () { return (0, ReportUtils_1.getReportName)(report); }, [report]);
    var inviteUsers = (0, react_1.useCallback)(function () {
        HttpUtils_1.default.cancelPendingRequests(types_1.READ_COMMANDS.SEARCH_FOR_REPORTS);
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
            invitedEmailsToAccountIDs[login] = Number(accountID);
        });
        if (reportID) {
            (0, Report_1.inviteToRoom)(reportID, invitedEmailsToAccountIDs);
        }
        (0, RoomMembersUserSearchPhrase_1.clearUserSearchPhrase)();
        Navigation_1.default.goBack(backRoute);
    }, [selectedOptions, backRoute, reportID, validate]);
    var goBack = (0, react_1.useCallback)(function () {
        Navigation_1.default.goBack(backRoute);
    }, [backRoute]);
    var headerMessage = (0, react_1.useMemo)(function () {
        var _a;
        var searchValue = debouncedSearchTerm.trim().toLowerCase();
        var expensifyEmails = CONST_1.default.EXPENSIFY_EMAILS;
        if (!inviteOptions.userToInvite && expensifyEmails.includes(searchValue)) {
            return translate('messages.errorMessageInvalidEmail');
        }
        if (!inviteOptions.userToInvite &&
            excludedUsers[(0, PhoneNumber_1.parsePhoneNumber)((0, LoginUtils_1.appendCountryCode)(searchValue)).possible ? (0, PhoneNumber_1.addSMSDomainIfPhoneNumber)((0, LoginUtils_1.appendCountryCode)(searchValue)) : searchValue]) {
            return translate('messages.userIsAlreadyMember', { login: searchValue, name: reportName });
        }
        return (0, OptionsListUtils_1.getHeaderMessage)(((_a = inviteOptions.personalDetails) !== null && _a !== void 0 ? _a : []).length !== 0, !!inviteOptions.userToInvite, debouncedSearchTerm);
    }, [debouncedSearchTerm, inviteOptions.userToInvite, inviteOptions.personalDetails, excludedUsers, translate, reportName]);
    (0, react_1.useEffect)(function () {
        (0, RoomMembersUserSearchPhrase_1.updateUserSearchPhrase)(debouncedSearchTerm);
        (0, Report_1.searchInServer)(debouncedSearchTerm);
    }, [debouncedSearchTerm]);
    return (<ScreenWrapper_1.default shouldEnableMaxHeight testID={RoomInvitePage.displayName} includeSafeAreaPaddingBottom>
            <FullPageNotFoundView_1.default shouldShow={(0, EmptyObject_1.isEmptyObject)(report)} subtitleKey={(0, EmptyObject_1.isEmptyObject)(report) ? undefined : 'roomMembersPage.notAuthorized'} onBackButtonPress={goBack}>
                <HeaderWithBackButton_1.default title={translate('workspace.invite.invitePeople')} subtitle={reportName} onBackButtonPress={goBack}/>
                <SelectionList_1.default canSelectMultiple sections={sections} ListItem={InviteMemberListItem_1.default} textInputLabel={translate('selectionList.nameEmailOrPhoneNumber')} textInputValue={searchTerm} onChangeText={function (value) {
            setSearchTerm(value);
        }} headerMessage={headerMessage} onSelectRow={toggleOption} onConfirm={inviteUsers} showScrollIndicator shouldPreventDefaultFocusOnSelectRow={!(0, DeviceCapabilities_1.canUseTouchScreen)()} showLoadingPlaceholder={!areOptionsInitialized} isLoadingNewOptions={!!isSearchingForReports}/>
                <react_native_1.View style={[styles.flexShrink0]}>
                    <FormAlertWithSubmitButton_1.default isDisabled={!selectedOptions.length} buttonText={translate('common.invite')} onSubmit={inviteUsers} containerStyles={[styles.flexReset, styles.flexGrow0, styles.flexShrink0, styles.flexBasisAuto, styles.mb5, styles.ph5]} enabledWhenOffline isAlertVisible={false}/>
                </react_native_1.View>
            </FullPageNotFoundView_1.default>
        </ScreenWrapper_1.default>);
}
RoomInvitePage.displayName = 'RoomInvitePage';
exports.default = (0, withNavigationTransitionEnd_1.default)((0, withReportOrNotFound_1.default)()(RoomInvitePage));
