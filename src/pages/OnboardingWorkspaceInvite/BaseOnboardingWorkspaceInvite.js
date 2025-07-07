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
var react_native_1 = require("react-native");
var Button_1 = require("@components/Button");
var HeaderWithBackButton_1 = require("@components/HeaderWithBackButton");
var OnyxProvider_1 = require("@components/OnyxProvider");
var OptionListContextProvider_1 = require("@components/OptionListContextProvider");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var SelectionList_1 = require("@components/SelectionList");
var InviteMemberListItem_1 = require("@components/SelectionList/InviteMemberListItem");
var Text_1 = require("@components/Text");
var useCurrentUserPersonalDetails_1 = require("@hooks/useCurrentUserPersonalDetails");
var useDebouncedState_1 = require("@hooks/useDebouncedState");
var useLocalize_1 = require("@hooks/useLocalize");
var useOnboardingMessages_1 = require("@hooks/useOnboardingMessages");
var useOnyx_1 = require("@hooks/useOnyx");
var usePermissions_1 = require("@hooks/usePermissions");
var usePolicy_1 = require("@hooks/usePolicy");
var useResponsiveLayout_1 = require("@hooks/useResponsiveLayout");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Member_1 = require("@libs/actions/Policy/Member");
var Report_1 = require("@libs/actions/Report");
var types_1 = require("@libs/API/types");
var DeviceCapabilities_1 = require("@libs/DeviceCapabilities");
var HttpUtils_1 = require("@libs/HttpUtils");
var LoginUtils_1 = require("@libs/LoginUtils");
var navigateAfterOnboarding_1 = require("@libs/navigateAfterOnboarding");
var OptionsListUtils_1 = require("@libs/OptionsListUtils");
var PhoneNumber_1 = require("@libs/PhoneNumber");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var Report_2 = require("@userActions/Report");
var Welcome_1 = require("@userActions/Welcome");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
function BaseOnboardingWorkspaceInvite(_a) {
    var shouldUseNativeStyles = _a.shouldUseNativeStyles;
    var styles = (0, useThemeStyles_1.default)();
    var translate = (0, useLocalize_1.default)().translate;
    var onboardingPolicyID = (0, useOnyx_1.default)(ONYXKEYS_1.default.ONBOARDING_POLICY_ID, { canBeMissing: true })[0];
    var onboardingAdminsChatReportID = (0, useOnyx_1.default)(ONYXKEYS_1.default.ONBOARDING_ADMINS_CHAT_REPORT_ID, { canBeMissing: true })[0];
    var policy = (0, usePolicy_1.default)(onboardingPolicyID);
    var onboardingMessages = (0, useOnboardingMessages_1.default)().onboardingMessages;
    // We need to use isSmallScreenWidth, see navigateAfterOnboarding function comment
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    var _b = (0, useResponsiveLayout_1.default)(), onboardingIsMediumOrLargerScreenWidth = _b.onboardingIsMediumOrLargerScreenWidth, isSmallScreenWidth = _b.isSmallScreenWidth;
    var _c = (0, useDebouncedState_1.default)(''), searchTerm = _c[0], debouncedSearchTerm = _c[1], setSearchTerm = _c[2];
    var _d = (0, react_1.useState)([]), selectedOptions = _d[0], setSelectedOptions = _d[1];
    var _e = (0, react_1.useState)([]), personalDetails = _e[0], setPersonalDetails = _e[1];
    var _f = (0, react_1.useState)([]), usersToInvite = _f[0], setUsersToInvite = _f[1];
    var _g = (0, react_1.useState)(false), didScreenTransitionEnd = _g[0], setDidScreenTransitionEnd = _g[1];
    var isSearchingForReports = (0, useOnyx_1.default)(ONYXKEYS_1.default.IS_SEARCHING_FOR_REPORTS, { canBeMissing: true, initWithStoredValues: false })[0];
    var betas = (0, useOnyx_1.default)(ONYXKEYS_1.default.BETAS, { canBeMissing: false })[0];
    var currentUserPersonalDetails = (0, useCurrentUserPersonalDetails_1.default)();
    var session = (0, OnyxProvider_1.useSession)();
    var isBetaEnabled = (0, usePermissions_1.default)().isBetaEnabled;
    var _h = (0, OptionListContextProvider_1.useOptionsList)({
        shouldInitialize: didScreenTransitionEnd,
    }), options = _h.options, areOptionsInitialized = _h.areOptionsInitialized;
    var welcomeNoteSubject = (0, react_1.useMemo)(function () { var _a, _b; return "# ".concat((_a = currentUserPersonalDetails === null || currentUserPersonalDetails === void 0 ? void 0 : currentUserPersonalDetails.displayName) !== null && _a !== void 0 ? _a : '', " invited you to ").concat((_b = policy === null || policy === void 0 ? void 0 : policy.name) !== null && _b !== void 0 ? _b : 'a workspace'); }, [policy === null || policy === void 0 ? void 0 : policy.name, currentUserPersonalDetails === null || currentUserPersonalDetails === void 0 ? void 0 : currentUserPersonalDetails.displayName]);
    var welcomeNote = (0, react_1.useMemo)(function () { return translate('workspace.common.welcomeNote'); }, [translate]);
    var excludedUsers = (0, react_1.useMemo)(function () {
        var ineligibleInvitees = (0, PolicyUtils_1.getIneligibleInvitees)(policy === null || policy === void 0 ? void 0 : policy.employeeList);
        return ineligibleInvitees.reduce(function (acc, login) {
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
        selectedOptions.forEach(function (option) {
            newSelectedOptions.push(option.login && option.login in detailsMap ? __assign(__assign({}, detailsMap[option.login]), { isSelected: true }) : option);
        });
        var userToInvite = inviteOptions.userToInvite;
        // Only add the user to the invitees list if it is valid
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
        var selectedLoginsSet = new Set(selectedOptions.map(function (_a) {
            var login = _a.login;
            return login;
        }));
        var personalDetailsFormatted = Object.values(personalDetails)
            .filter(function (_a) {
            var login = _a.login;
            return !selectedLoginsSet.has(login !== null && login !== void 0 ? login : '');
        })
            .map(OptionsListUtils_1.formatMemberForList);
        sectionsArr.push({
            title: translate('common.contacts'),
            data: personalDetailsFormatted,
            shouldShow: !(0, EmptyObject_1.isEmptyObject)(personalDetailsFormatted),
        });
        Object.values(usersToInvite).forEach(function (userToInvite) {
            var _a;
            var hasUnselectedUserToInvite = !selectedLoginsSet.has((_a = userToInvite.login) !== null && _a !== void 0 ? _a : '');
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
    var completeOnboarding = (0, react_1.useCallback)(function () {
        var _a;
        (0, Report_2.completeOnboarding)({
            engagementChoice: CONST_1.default.ONBOARDING_CHOICES.TRACK_WORKSPACE,
            onboardingMessage: onboardingMessages[CONST_1.default.ONBOARDING_CHOICES.TRACK_WORKSPACE],
            firstName: currentUserPersonalDetails.firstName,
            lastName: currentUserPersonalDetails.lastName,
            adminsChatReportID: onboardingAdminsChatReportID,
            onboardingPolicyID: onboardingPolicyID,
        });
        (0, Welcome_1.setOnboardingAdminsChatReportID)();
        (0, Welcome_1.setOnboardingPolicyID)();
        (0, navigateAfterOnboarding_1.default)(isSmallScreenWidth, isBetaEnabled(CONST_1.default.BETAS.DEFAULT_ROOMS), onboardingPolicyID, onboardingAdminsChatReportID, 
        // Onboarding tasks would show in Concierge instead of admins room for testing accounts, we should open where onboarding tasks are located
        // See https://github.com/Expensify/App/issues/57167 for more details
        ((_a = session === null || session === void 0 ? void 0 : session.email) !== null && _a !== void 0 ? _a : '').includes('+'));
    }, [
        currentUserPersonalDetails.firstName,
        onboardingMessages,
        currentUserPersonalDetails.lastName,
        onboardingAdminsChatReportID,
        onboardingPolicyID,
        isSmallScreenWidth,
        isBetaEnabled,
        session === null || session === void 0 ? void 0 : session.email,
    ]);
    var inviteUser = (0, react_1.useCallback)(function () {
        var isValid = true;
        if (selectedOptions.length <= 0) {
            isValid = false;
        }
        if (!isValid || !onboardingPolicyID) {
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
        var policyMemberAccountIDs = Object.values((0, PolicyUtils_1.getMemberAccountIDsForWorkspace)(policy === null || policy === void 0 ? void 0 : policy.employeeList, false, false));
        (0, Member_1.addMembersToWorkspace)(invitedEmailsToAccountIDs, "".concat(welcomeNoteSubject, "\n\n").concat(welcomeNote), onboardingPolicyID, policyMemberAccountIDs, CONST_1.default.POLICY.ROLE.USER);
        completeOnboarding();
    }, [completeOnboarding, onboardingPolicyID, policy === null || policy === void 0 ? void 0 : policy.employeeList, selectedOptions, welcomeNote, welcomeNoteSubject]);
    (0, react_1.useEffect)(function () {
        (0, Report_1.searchInServer)(debouncedSearchTerm);
    }, [debouncedSearchTerm]);
    var headerMessage = (0, react_1.useMemo)(function () {
        var _a;
        var searchValue = debouncedSearchTerm.trim().toLowerCase();
        if (usersToInvite.length === 0 && CONST_1.default.EXPENSIFY_EMAILS_OBJECT[searchValue]) {
            return translate('messages.errorMessageInvalidEmail');
        }
        if (usersToInvite.length === 0 &&
            excludedUsers[(0, PhoneNumber_1.parsePhoneNumber)((0, LoginUtils_1.appendCountryCode)(searchValue)).possible ? (0, PhoneNumber_1.addSMSDomainIfPhoneNumber)((0, LoginUtils_1.appendCountryCode)(searchValue)) : searchValue]) {
            return translate('messages.userIsAlreadyMember', { login: searchValue, name: (_a = policy === null || policy === void 0 ? void 0 : policy.name) !== null && _a !== void 0 ? _a : '' });
        }
        return (0, OptionsListUtils_1.getHeaderMessage)(personalDetails.length !== 0, usersToInvite.length > 0, searchValue);
    }, [excludedUsers, translate, debouncedSearchTerm, policy === null || policy === void 0 ? void 0 : policy.name, usersToInvite, personalDetails.length]);
    var footerContent = (0, react_1.useMemo)(function () { return (<react_native_1.View style={[onboardingIsMediumOrLargerScreenWidth ? styles.mh3 : undefined]}>
                <react_native_1.View style={styles.mb2}>
                    <Button_1.default large text={translate('common.skip')} onPress={function () { return completeOnboarding(); }}/>
                </react_native_1.View>
                <react_native_1.View>
                    <Button_1.default success large text={translate('common.continue')} onPress={function () { return inviteUser(); }} isDisabled={selectedOptions.length <= 0}/>
                </react_native_1.View>
            </react_native_1.View>); }, [completeOnboarding, inviteUser, onboardingIsMediumOrLargerScreenWidth, selectedOptions.length, styles.mb2, styles.mh3, translate]);
    return (<ScreenWrapper_1.default enableEdgeToEdgeBottomSafeAreaPadding shouldEnableMaxHeight testID={BaseOnboardingWorkspaceInvite.displayName} style={[styles.defaultModalContainer, shouldUseNativeStyles && styles.pt8]} shouldShowOfflineIndicator={isSmallScreenWidth} onEntryTransitionEnd={function () { return setDidScreenTransitionEnd(true); }}>
            <HeaderWithBackButton_1.default progressBarPercentage={100} shouldShowBackButton={false}/>
            <react_native_1.View style={[onboardingIsMediumOrLargerScreenWidth ? styles.mh8 : styles.mh5, onboardingIsMediumOrLargerScreenWidth ? styles.flexRow : styles.flexColumn, styles.mb3]}>
                <Text_1.default style={styles.textHeadlineH1}>{translate('onboarding.inviteMembers.title')}</Text_1.default>
            </react_native_1.View>
            <react_native_1.View style={[onboardingIsMediumOrLargerScreenWidth ? styles.mh8 : styles.mh5, onboardingIsMediumOrLargerScreenWidth ? styles.flexRow : styles.flexColumn, styles.mb5]}>
                <Text_1.default style={[styles.textNormal, styles.colorMuted]}>{translate('onboarding.inviteMembers.subtitle')}</Text_1.default>
            </react_native_1.View>
            <SelectionList_1.default listItemWrapperStyle={onboardingIsMediumOrLargerScreenWidth ? [styles.pl8, styles.pr8] : []} textInputStyle={onboardingIsMediumOrLargerScreenWidth ? styles.ph8 : styles.ph5} sectionTitleStyles={onboardingIsMediumOrLargerScreenWidth ? styles.ph3 : undefined} headerMessageStyle={[onboardingIsMediumOrLargerScreenWidth ? styles.ph8 : styles.ph5, styles.pb5]} canSelectMultiple sections={sections} ListItem={InviteMemberListItem_1.default} textInputLabel={translate('selectionList.nameEmailOrPhoneNumber')} textInputValue={searchTerm} onChangeText={function (value) {
            setSearchTerm(value);
        }} headerMessage={headerMessage} onSelectRow={toggleOption} onConfirm={inviteUser} showScrollIndicator showLoadingPlaceholder={!areOptionsInitialized || !didScreenTransitionEnd} shouldPreventDefaultFocusOnSelectRow={!(0, DeviceCapabilities_1.canUseTouchScreen)()} footerContent={footerContent} isLoadingNewOptions={!!isSearchingForReports} addBottomSafeAreaPadding={isSmallScreenWidth}/>
        </ScreenWrapper_1.default>);
}
BaseOnboardingWorkspaceInvite.displayName = 'BaseOnboardingWorkspaceInvite';
exports.default = BaseOnboardingWorkspaceInvite;
