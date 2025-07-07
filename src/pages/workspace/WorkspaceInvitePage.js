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
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Member_1 = require("@libs/actions/Policy/Member");
var Policy_1 = require("@libs/actions/Policy/Policy");
var Report_1 = require("@libs/actions/Report");
var types_1 = require("@libs/API/types");
var DeviceCapabilities_1 = require("@libs/DeviceCapabilities");
var HttpUtils_1 = require("@libs/HttpUtils");
var LoginUtils_1 = require("@libs/LoginUtils");
var Navigation_1 = require("@libs/Navigation/Navigation");
var OptionsListUtils_1 = require("@libs/OptionsListUtils");
var PhoneNumber_1 = require("@libs/PhoneNumber");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var AccessOrNotFoundWrapper_1 = require("./AccessOrNotFoundWrapper");
var withPolicyAndFullscreenLoading_1 = require("./withPolicyAndFullscreenLoading");
function WorkspaceInvitePage(_a) {
    var route = _a.route, policy = _a.policy;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var _b = (0, useDebouncedState_1.default)(''), searchTerm = _b[0], debouncedSearchTerm = _b[1], setSearchTerm = _b[2];
    var _c = (0, react_1.useState)([]), selectedOptions = _c[0], setSelectedOptions = _c[1];
    var _d = (0, react_1.useState)([]), personalDetails = _d[0], setPersonalDetails = _d[1];
    var _e = (0, react_1.useState)([]), usersToInvite = _e[0], setUsersToInvite = _e[1];
    var _f = (0, react_1.useState)(false), didScreenTransitionEnd = _f[0], setDidScreenTransitionEnd = _f[1];
    var isSearchingForReports = (0, useOnyx_1.default)(ONYXKEYS_1.default.IS_SEARCHING_FOR_REPORTS, { initWithStoredValues: false })[0];
    var firstRenderRef = (0, react_1.useRef)(true);
    var betas = (0, useOnyx_1.default)(ONYXKEYS_1.default.BETAS)[0];
    var invitedEmailsToAccountIDsDraft = (0, useOnyx_1.default)("".concat(ONYXKEYS_1.default.COLLECTION.WORKSPACE_INVITE_MEMBERS_DRAFT).concat(route.params.policyID.toString()))[0];
    var openWorkspaceInvitePage = function () {
        var policyMemberEmailsToAccountIDs = (0, PolicyUtils_1.getMemberAccountIDsForWorkspace)(policy === null || policy === void 0 ? void 0 : policy.employeeList);
        (0, Policy_1.openWorkspaceInvitePage)(route.params.policyID, Object.keys(policyMemberEmailsToAccountIDs));
    };
    var _g = (0, OptionListContextProvider_1.useOptionsList)({
        shouldInitialize: didScreenTransitionEnd,
    }), options = _g.options, areOptionsInitialized = _g.areOptionsInitialized;
    (0, react_1.useEffect)(function () {
        (0, Policy_1.clearErrors)(route.params.policyID);
        openWorkspaceInvitePage();
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps -- policyID changes remount the component
    }, []);
    (0, useNetwork_1.default)({ onReconnect: openWorkspaceInvitePage });
    var excludedUsers = (0, react_1.useMemo)(function () {
        var ineligibleInvites = (0, PolicyUtils_1.getIneligibleInvitees)(policy === null || policy === void 0 ? void 0 : policy.employeeList);
        return ineligibleInvites.reduce(function (acc, login) {
            acc[login] = true;
            return acc;
        }, {});
    }, [policy === null || policy === void 0 ? void 0 : policy.employeeList]);
    var defaultOptions = (0, react_1.useMemo)(function () {
        if (!areOptionsInitialized) {
            return { recentReports: [], personalDetails: [], userToInvite: null, currentUserOption: null };
        }
        var inviteOptions = (0, OptionsListUtils_1.getMemberInviteOptions)(options.personalDetails, betas !== null && betas !== void 0 ? betas : [], excludedUsers, true);
        return __assign(__assign({}, inviteOptions), { recentReports: [], currentUserOption: null });
    }, [areOptionsInitialized, betas, excludedUsers, options.personalDetails]);
    var inviteOptions = (0, react_1.useMemo)(function () { return (0, OptionsListUtils_1.filterAndOrderOptions)(defaultOptions, debouncedSearchTerm, { excludeLogins: excludedUsers }); }, [debouncedSearchTerm, defaultOptions, excludedUsers]);
    (0, react_1.useEffect)(function () {
        if (!areOptionsInitialized) {
            return;
        }
        var newUsersToInviteDict = {};
        var newPersonalDetailsDict = {};
        var newSelectedOptionsDict = {};
        // Update selectedOptions with the latest personalDetails and policyEmployeeList information
        var detailsMap = {};
        inviteOptions.personalDetails.forEach(function (detail) {
            if (!detail.login) {
                return;
            }
            detailsMap[detail.login] = (0, OptionsListUtils_1.formatMemberForList)(detail);
        });
        var newSelectedOptions = [];
        if (firstRenderRef.current) {
            // We only want to add the saved selected user on first render
            firstRenderRef.current = false;
            Object.keys(invitedEmailsToAccountIDsDraft !== null && invitedEmailsToAccountIDsDraft !== void 0 ? invitedEmailsToAccountIDsDraft : {}).forEach(function (login) {
                if (!(login in detailsMap)) {
                    return;
                }
                newSelectedOptions.push(__assign(__assign({}, detailsMap[login]), { isSelected: true }));
            });
        }
        selectedOptions.forEach(function (option) {
            newSelectedOptions.push(option.login && option.login in detailsMap ? __assign(__assign({}, detailsMap[option.login]), { isSelected: true }) : option);
        });
        var userToInvite = inviteOptions.userToInvite;
        // Only add the user to the invites list if it is valid
        if (typeof (userToInvite === null || userToInvite === void 0 ? void 0 : userToInvite.accountID) === 'number') {
            newUsersToInviteDict[userToInvite.accountID] = userToInvite;
        }
        // Add all personal details to the new dict
        inviteOptions.personalDetails.forEach(function (details) {
            if (typeof details.accountID !== 'number') {
                return;
            }
            newPersonalDetailsDict[details.accountID] = details;
        });
        // Add all selected options to the new dict
        newSelectedOptions.forEach(function (option) {
            if (typeof option.accountID !== 'number') {
                return;
            }
            newSelectedOptionsDict[option.accountID] = option;
        });
        // Strip out dictionary keys and update arrays
        setUsersToInvite(Object.values(newUsersToInviteDict));
        setPersonalDetails(Object.values(newPersonalDetailsDict));
        setSelectedOptions(Object.values(newSelectedOptionsDict));
        // eslint-disable-next-line react-compiler/react-compiler, react-hooks/exhaustive-deps -- we don't want to recalculate when selectedOptions change
    }, [options.personalDetails, policy === null || policy === void 0 ? void 0 : policy.employeeList, betas, debouncedSearchTerm, excludedUsers, areOptionsInitialized, inviteOptions.personalDetails, inviteOptions.userToInvite]);
    var sections = (0, react_1.useMemo)(function () {
        var sectionsArr = [];
        if (!areOptionsInitialized) {
            return [];
        }
        // Filter all options that is a part of the search term or in the personal details
        var filterSelectedOptions = selectedOptions;
        if (debouncedSearchTerm !== '') {
            filterSelectedOptions = selectedOptions.filter(function (option) {
                var _a, _b;
                var accountID = option.accountID;
                var isOptionInPersonalDetails = Object.values(personalDetails).some(function (personalDetail) { return personalDetail.accountID === accountID; });
                var searchValue = (0, OptionsListUtils_1.getSearchValueForPhoneOrEmail)(debouncedSearchTerm);
                var isPartOfSearchTerm = !!((_a = option.text) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes(searchValue)) || !!((_b = option.login) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes(searchValue));
                return isPartOfSearchTerm || isOptionInPersonalDetails;
            });
        }
        sectionsArr.push({
            title: undefined,
            data: filterSelectedOptions,
            shouldShow: true,
        });
        // Filtering out selected users from the search results
        var selectedLogins = selectedOptions.map(function (_a) {
            var login = _a.login;
            return login;
        });
        var personalDetailsWithoutSelected = Object.values(personalDetails).filter(function (_a) {
            var login = _a.login;
            return !selectedLogins.some(function (selectedLogin) { return selectedLogin === login; });
        });
        var personalDetailsFormatted = personalDetailsWithoutSelected.map(function (item) { return (0, OptionsListUtils_1.formatMemberForList)(item); });
        sectionsArr.push({
            title: translate('common.contacts'),
            data: personalDetailsFormatted,
            shouldShow: !(0, EmptyObject_1.isEmptyObject)(personalDetailsFormatted),
        });
        Object.values(usersToInvite).forEach(function (userToInvite) {
            var hasUnselectedUserToInvite = !selectedLogins.some(function (selectedLogin) { return selectedLogin === userToInvite.login; });
            if (hasUnselectedUserToInvite) {
                sectionsArr.push({
                    title: undefined,
                    data: [(0, OptionsListUtils_1.formatMemberForList)(userToInvite)],
                    shouldShow: true,
                });
            }
        });
        return sectionsArr;
    }, [areOptionsInitialized, selectedOptions, debouncedSearchTerm, personalDetails, translate, usersToInvite]);
    var toggleOption = function (option) {
        (0, Policy_1.clearErrors)(route.params.policyID);
        var isOptionInList = selectedOptions.some(function (selectedOption) { return selectedOption.login === option.login; });
        var newSelectedOptions;
        if (isOptionInList) {
            newSelectedOptions = selectedOptions.filter(function (selectedOption) { return selectedOption.login !== option.login; });
        }
        else {
            newSelectedOptions = __spreadArray(__spreadArray([], selectedOptions, true), [__assign(__assign({}, option), { isSelected: true })], false);
        }
        setSelectedOptions(newSelectedOptions);
    };
    var inviteUser = (0, react_1.useCallback)(function () {
        var errors = {};
        if (selectedOptions.length <= 0) {
            errors.noUserSelected = 'true';
        }
        (0, Policy_1.setWorkspaceErrors)(route.params.policyID, errors);
        var isValid = (0, EmptyObject_1.isEmptyObject)(errors);
        if (!isValid) {
            return;
        }
        HttpUtils_1.default.cancelPendingRequests(types_1.READ_COMMANDS.SEARCH_FOR_REPORTS);
        var invitedEmailsToAccountIDs = {};
        selectedOptions.forEach(function (option) {
            var _a, _b;
            var login = (_a = option.login) !== null && _a !== void 0 ? _a : '';
            var accountID = (_b = option.accountID) !== null && _b !== void 0 ? _b : CONST_1.default.DEFAULT_NUMBER_ID;
            if (!login.toLowerCase().trim() || !accountID) {
                return;
            }
            invitedEmailsToAccountIDs[login] = Number(accountID);
        });
        (0, Member_1.setWorkspaceInviteMembersDraft)(route.params.policyID, invitedEmailsToAccountIDs);
        Navigation_1.default.navigate(ROUTES_1.default.WORKSPACE_INVITE_MESSAGE.getRoute(route.params.policyID, Navigation_1.default.getActiveRoute()));
    }, [route.params.policyID, selectedOptions]);
    var _h = (0, react_1.useMemo)(function () { var _a; return [(_a = policy === null || policy === void 0 ? void 0 : policy.name) !== null && _a !== void 0 ? _a : '', !(0, EmptyObject_1.isEmptyObject)(policy === null || policy === void 0 ? void 0 : policy.errors) || !!(policy === null || policy === void 0 ? void 0 : policy.alertMessage)]; }, [policy]), policyName = _h[0], shouldShowAlertPrompt = _h[1];
    var headerMessage = (0, react_1.useMemo)(function () {
        var searchValue = debouncedSearchTerm.trim().toLowerCase();
        if (usersToInvite.length === 0 && CONST_1.default.EXPENSIFY_EMAILS_OBJECT[searchValue]) {
            return translate('messages.errorMessageInvalidEmail');
        }
        if (usersToInvite.length === 0 &&
            excludedUsers[(0, PhoneNumber_1.parsePhoneNumber)((0, LoginUtils_1.appendCountryCode)(searchValue)).possible ? (0, PhoneNumber_1.addSMSDomainIfPhoneNumber)((0, LoginUtils_1.appendCountryCode)(searchValue)) : searchValue]) {
            return translate('messages.userIsAlreadyMember', { login: searchValue, name: policyName });
        }
        return (0, OptionsListUtils_1.getHeaderMessage)(personalDetails.length !== 0, usersToInvite.length > 0, searchValue);
    }, [excludedUsers, translate, debouncedSearchTerm, policyName, usersToInvite, personalDetails.length]);
    var footerContent = (0, react_1.useMemo)(function () {
        var _a;
        return (<FormAlertWithSubmitButton_1.default isDisabled={!selectedOptions.length} isAlertVisible={shouldShowAlertPrompt} buttonText={translate('common.next')} onSubmit={inviteUser} message={(_a = policy === null || policy === void 0 ? void 0 : policy.alertMessage) !== null && _a !== void 0 ? _a : ''} containerStyles={[styles.flexReset, styles.flexGrow0, styles.flexShrink0, styles.flexBasisAuto]} enabledWhenOffline/>);
    }, [inviteUser, policy === null || policy === void 0 ? void 0 : policy.alertMessage, selectedOptions.length, shouldShowAlertPrompt, styles.flexBasisAuto, styles.flexGrow0, styles.flexReset, styles.flexShrink0, translate]);
    (0, react_1.useEffect)(function () {
        (0, Report_1.searchInServer)(debouncedSearchTerm);
    }, [debouncedSearchTerm]);
    return (<AccessOrNotFoundWrapper_1.default policyID={route.params.policyID} accessVariants={[CONST_1.default.POLICY.ACCESS_VARIANTS.ADMIN]} fullPageNotFoundViewProps={{ subtitleKey: (0, EmptyObject_1.isEmptyObject)(policy) ? undefined : 'workspace.common.notAuthorized', onLinkPress: PolicyUtils_1.goBackFromInvalidPolicy }}>
            <ScreenWrapper_1.default shouldEnableMaxHeight shouldUseCachedViewportHeight testID={WorkspaceInvitePage.displayName} enableEdgeToEdgeBottomSafeAreaPadding onEntryTransitionEnd={function () { return setDidScreenTransitionEnd(true); }}>
                <HeaderWithBackButton_1.default title={translate('workspace.invite.invitePeople')} subtitle={policyName} onBackButtonPress={function () {
            (0, Policy_1.clearErrors)(route.params.policyID);
            Navigation_1.default.goBack();
        }}/>
                <SelectionList_1.default canSelectMultiple sections={sections} ListItem={InviteMemberListItem_1.default} textInputLabel={translate('selectionList.nameEmailOrPhoneNumber')} textInputValue={searchTerm} onChangeText={function (value) {
            setSearchTerm(value);
        }} headerMessage={headerMessage} onSelectRow={toggleOption} onConfirm={inviteUser} showScrollIndicator showLoadingPlaceholder={!areOptionsInitialized || !didScreenTransitionEnd} shouldPreventDefaultFocusOnSelectRow={!(0, DeviceCapabilities_1.canUseTouchScreen)()} footerContent={footerContent} isLoadingNewOptions={!!isSearchingForReports} addBottomSafeAreaPadding/>
            </ScreenWrapper_1.default>
        </AccessOrNotFoundWrapper_1.default>);
}
WorkspaceInvitePage.displayName = 'WorkspaceInvitePage';
exports.default = (0, withNavigationTransitionEnd_1.default)((0, withPolicyAndFullscreenLoading_1.default)(WorkspaceInvitePage));
