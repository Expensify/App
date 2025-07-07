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
var isEmpty_1 = require("lodash/isEmpty");
var reject_1 = require("lodash/reject");
var react_1 = require("react");
var react_native_1 = require("react-native");
var Button_1 = require("@components/Button");
var OptionListContextProvider_1 = require("@components/OptionListContextProvider");
var Pressable_1 = require("@components/Pressable");
var ReferralProgramCTA_1 = require("@components/ReferralProgramCTA");
var ScreenWrapper_1 = require("@components/ScreenWrapper");
var SelectCircle_1 = require("@components/SelectCircle");
var SelectionList_1 = require("@components/SelectionList");
var UserListItem_1 = require("@components/SelectionList/UserListItem");
var useCurrentUserPersonalDetails_1 = require("@hooks/useCurrentUserPersonalDetails");
var useDebouncedState_1 = require("@hooks/useDebouncedState");
var useDismissedReferralBanners_1 = require("@hooks/useDismissedReferralBanners");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var useSafeAreaInsets_1 = require("@hooks/useSafeAreaInsets");
var useScreenWrapperTransitionStatus_1 = require("@hooks/useScreenWrapperTransitionStatus");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var Report_1 = require("@libs/actions/Report");
var DeviceCapabilities_1 = require("@libs/DeviceCapabilities");
var Log_1 = require("@libs/Log");
var Navigation_1 = require("@libs/Navigation/Navigation");
var OptionsListUtils_1 = require("@libs/OptionsListUtils");
var variables_1 = require("@styles/variables");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var ROUTES_1 = require("@src/ROUTES");
var keyboard_1 = require("@src/utils/keyboard");
var excludedGroupEmails = CONST_1.default.EXPENSIFY_EMAILS.filter(function (value) { return value !== CONST_1.default.EMAIL.CONCIERGE; });
function useOptions() {
    var _a = (0, useDebouncedState_1.default)(''), searchTerm = _a[0], debouncedSearchTerm = _a[1], setSearchTerm = _a[2];
    var _b = (0, react_1.useState)([]), selectedOptions = _b[0], setSelectedOptions = _b[1];
    var betas = (0, useOnyx_1.default)(ONYXKEYS_1.default.BETAS, { canBeMissing: true })[0];
    var newGroupDraft = (0, useOnyx_1.default)(ONYXKEYS_1.default.NEW_GROUP_CHAT_DRAFT, { canBeMissing: true })[0];
    var personalData = (0, useCurrentUserPersonalDetails_1.default)();
    var didScreenTransitionEnd = (0, useScreenWrapperTransitionStatus_1.default)().didScreenTransitionEnd;
    var _c = (0, OptionListContextProvider_1.useOptionsList)({
        shouldInitialize: didScreenTransitionEnd,
    }), listOptions = _c.options, areOptionsInitialized = _c.areOptionsInitialized;
    var defaultOptions = (0, react_1.useMemo)(function () {
        var _a, _b;
        var filteredOptions = (0, OptionsListUtils_1.getValidOptions)({
            reports: (_a = listOptions.reports) !== null && _a !== void 0 ? _a : [],
            personalDetails: (_b = listOptions.personalDetails) !== null && _b !== void 0 ? _b : [],
        }, {
            betas: betas !== null && betas !== void 0 ? betas : [],
            selectedOptions: selectedOptions,
            includeSelfDM: true,
        });
        return filteredOptions;
    }, [betas, listOptions.personalDetails, listOptions.reports, selectedOptions]);
    var options = (0, react_1.useMemo)(function () {
        var filteredOptions = (0, OptionsListUtils_1.filterAndOrderOptions)(defaultOptions, debouncedSearchTerm, {
            selectedOptions: selectedOptions,
            maxRecentReportsToShow: CONST_1.default.IOU.MAX_RECENT_REPORTS_TO_SHOW,
        });
        return filteredOptions;
    }, [debouncedSearchTerm, defaultOptions, selectedOptions]);
    var cleanSearchTerm = (0, react_1.useMemo)(function () { return debouncedSearchTerm.trim().toLowerCase(); }, [debouncedSearchTerm]);
    var headerMessage = (0, react_1.useMemo)(function () {
        return (0, OptionsListUtils_1.getHeaderMessage)(options.personalDetails.length + options.recentReports.length !== 0, !!options.userToInvite, debouncedSearchTerm.trim(), selectedOptions.some(function (participant) { var _a, _b; return (_b = (_a = (0, OptionsListUtils_1.getPersonalDetailSearchTerms)(participant).join(' ')).toLowerCase) === null || _b === void 0 ? void 0 : _b.call(_a).includes(cleanSearchTerm); }));
    }, [cleanSearchTerm, debouncedSearchTerm, options.personalDetails.length, options.recentReports.length, options.userToInvite, selectedOptions]);
    (0, react_1.useEffect)(function () {
        if (!debouncedSearchTerm.length) {
            return;
        }
        (0, Report_1.searchInServer)(debouncedSearchTerm);
    }, [debouncedSearchTerm]);
    (0, react_1.useEffect)(function () {
        if (!(newGroupDraft === null || newGroupDraft === void 0 ? void 0 : newGroupDraft.participants)) {
            return;
        }
        var newSelectedOptions = [];
        newGroupDraft.participants.forEach(function (participant) {
            if (participant.accountID === personalData.accountID) {
                return;
            }
            var participantOption = listOptions.personalDetails.find(function (option) { return option.accountID === participant.accountID; });
            if (!participantOption) {
                participantOption = (0, OptionsListUtils_1.getUserToInviteOption)({
                    searchValue: participant === null || participant === void 0 ? void 0 : participant.login,
                });
            }
            if (!participantOption) {
                return;
            }
            newSelectedOptions.push(__assign(__assign({}, participantOption), { isSelected: true }));
        });
        setSelectedOptions(newSelectedOptions);
    }, [newGroupDraft === null || newGroupDraft === void 0 ? void 0 : newGroupDraft.participants, listOptions.personalDetails, personalData.accountID]);
    return __assign(__assign({}, options), { searchTerm: searchTerm, debouncedSearchTerm: debouncedSearchTerm, setSearchTerm: setSearchTerm, areOptionsInitialized: areOptionsInitialized && didScreenTransitionEnd, selectedOptions: selectedOptions, setSelectedOptions: setSelectedOptions, headerMessage: headerMessage });
}
function NewChatPage(_, ref) {
    var translate = (0, useLocalize_1.default)().translate;
    var isOffline = (0, useNetwork_1.default)().isOffline;
    // We need to use isSmallScreenWidth instead of shouldUseNarrowLayout to show offline indicator on small screen only
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    var styles = (0, useThemeStyles_1.default)();
    var personalData = (0, useCurrentUserPersonalDetails_1.default)();
    var top = (0, useSafeAreaInsets_1.default)().top;
    var isSearchingForReports = (0, useOnyx_1.default)(ONYXKEYS_1.default.IS_SEARCHING_FOR_REPORTS, { initWithStoredValues: false, canBeMissing: true })[0];
    var selectionListRef = (0, react_1.useRef)(null);
    (0, react_1.useImperativeHandle)(ref, function () {
        var _a;
        return ({
            focus: (_a = selectionListRef.current) === null || _a === void 0 ? void 0 : _a.focusTextInput,
        });
    });
    var _a = useOptions(), headerMessage = _a.headerMessage, searchTerm = _a.searchTerm, debouncedSearchTerm = _a.debouncedSearchTerm, setSearchTerm = _a.setSearchTerm, selectedOptions = _a.selectedOptions, setSelectedOptions = _a.setSelectedOptions, recentReports = _a.recentReports, personalDetails = _a.personalDetails, userToInvite = _a.userToInvite, areOptionsInitialized = _a.areOptionsInitialized;
    var _b = (0, react_1.useMemo)(function () {
        var sectionsList = [];
        var firstKey = '';
        var formatResults = (0, OptionsListUtils_1.formatSectionsFromSearchTerm)(debouncedSearchTerm, selectedOptions, recentReports, personalDetails);
        sectionsList.push(formatResults.section);
        if (!firstKey) {
            firstKey = (0, OptionsListUtils_1.getFirstKeyForList)(formatResults.section.data);
        }
        sectionsList.push({
            title: translate('common.recents'),
            data: selectedOptions.length ? recentReports.filter(function (option) { return !option.isSelfDM; }) : recentReports,
            shouldShow: !(0, isEmpty_1.default)(recentReports),
        });
        if (!firstKey) {
            firstKey = (0, OptionsListUtils_1.getFirstKeyForList)(recentReports);
        }
        sectionsList.push({
            title: translate('common.contacts'),
            data: personalDetails,
            shouldShow: !(0, isEmpty_1.default)(personalDetails),
        });
        if (!firstKey) {
            firstKey = (0, OptionsListUtils_1.getFirstKeyForList)(personalDetails);
        }
        if (userToInvite) {
            sectionsList.push({
                title: undefined,
                data: [userToInvite],
                shouldShow: true,
            });
            if (!firstKey) {
                firstKey = (0, OptionsListUtils_1.getFirstKeyForList)([userToInvite]);
            }
        }
        return [sectionsList, firstKey];
    }, [debouncedSearchTerm, selectedOptions, recentReports, personalDetails, translate, userToInvite]), sections = _b[0], firstKeyForList = _b[1];
    /**
     * Removes a selected option from list if already selected. If not already selected add this option to the list.
     */
    var toggleOption = (0, react_1.useCallback)(function (option) {
        var _a, _b, _c, _d;
        var isOptionInList = !!option.isSelected;
        var newSelectedOptions;
        if (isOptionInList) {
            newSelectedOptions = (0, reject_1.default)(selectedOptions, function (selectedOption) { return selectedOption.login === option.login; });
        }
        else {
            newSelectedOptions = __spreadArray(__spreadArray([], selectedOptions, true), [__assign(__assign({}, option), { isSelected: true, selected: true, reportID: option.reportID })], false);
            (_a = selectionListRef === null || selectionListRef === void 0 ? void 0 : selectionListRef.current) === null || _a === void 0 ? void 0 : _a.scrollToIndex(0, true);
        }
        (_c = (_b = selectionListRef === null || selectionListRef === void 0 ? void 0 : selectionListRef.current) === null || _b === void 0 ? void 0 : _b.clearInputAfterSelect) === null || _c === void 0 ? void 0 : _c.call(_b);
        if (!(0, DeviceCapabilities_1.canUseTouchScreen)()) {
            (_d = selectionListRef.current) === null || _d === void 0 ? void 0 : _d.focusTextInput();
        }
        setSelectedOptions(newSelectedOptions);
    }, [selectedOptions, setSelectedOptions]);
    /**
     * If there are selected options already then it will toggle the option otherwise
     * creates a new 1:1 chat with the option and the current user,
     * or navigates to the existing chat if one with those participants already exists.
     */
    var selectOption = (0, react_1.useCallback)(function (option) {
        var _a, _b;
        if (option === null || option === void 0 ? void 0 : option.isSelfDM) {
            if (!option.reportID) {
                Navigation_1.default.dismissModal();
                return;
            }
            Navigation_1.default.dismissModalWithReport({ reportID: option.reportID });
            return;
        }
        if (selectedOptions.length && option) {
            // Prevent excluded emails from being added to groups
            if ((option === null || option === void 0 ? void 0 : option.login) && excludedGroupEmails.includes(option.login)) {
                return;
            }
            toggleOption(option);
            return;
        }
        var login = '';
        if (option === null || option === void 0 ? void 0 : option.login) {
            login = option.login;
        }
        else if (selectedOptions.length === 1) {
            login = (_b = (_a = selectedOptions.at(0)) === null || _a === void 0 ? void 0 : _a.login) !== null && _b !== void 0 ? _b : '';
        }
        if (!login) {
            Log_1.default.warn('Tried to create chat with empty login');
            return;
        }
        keyboard_1.default.dismiss().then(function () { return (0, Report_1.navigateToAndOpenReport)([login]); });
    }, [selectedOptions, toggleOption]);
    var itemRightSideComponent = (0, react_1.useCallback)(function (item, isFocused) {
        if (!!item.isSelfDM || (item.login && excludedGroupEmails.includes(item.login))) {
            return null;
        }
        if (item.isSelected) {
            return (<Pressable_1.PressableWithFeedback onPress={function () { return toggleOption(item); }} disabled={item.isDisabled} role={CONST_1.default.ROLE.BUTTON} accessibilityLabel={CONST_1.default.ROLE.BUTTON} style={[styles.flexRow, styles.alignItemsCenter, styles.ml5, styles.optionSelectCircle]}>
                        <SelectCircle_1.default isChecked={item.isSelected} selectCircleStyles={styles.ml0}/>
                    </Pressable_1.PressableWithFeedback>);
        }
        var buttonInnerStyles = isFocused ? styles.buttonDefaultHovered : {};
        return (<Button_1.default onPress={function () { return toggleOption(item); }} style={[styles.pl2]} text={translate('newChatPage.addToGroup')} innerStyles={buttonInnerStyles} small/>);
    }, [toggleOption, styles.alignItemsCenter, styles.buttonDefaultHovered, styles.flexRow, styles.ml0, styles.ml5, styles.optionSelectCircle, styles.pl2, translate]);
    var createGroup = (0, react_1.useCallback)(function () {
        if (!personalData || !personalData.login || !personalData.accountID) {
            return;
        }
        var selectedParticipants = selectedOptions.map(function (option) {
            var _a;
            return ({
                login: option === null || option === void 0 ? void 0 : option.login,
                accountID: (_a = option.accountID) !== null && _a !== void 0 ? _a : CONST_1.default.DEFAULT_NUMBER_ID,
            });
        });
        var logins = __spreadArray(__spreadArray([], selectedParticipants, true), [{ login: personalData.login, accountID: personalData.accountID }], false);
        (0, Report_1.setGroupDraft)({ participants: logins });
        react_native_1.Keyboard.dismiss();
        Navigation_1.default.navigate(ROUTES_1.default.NEW_CHAT_CONFIRM);
    }, [selectedOptions, personalData]);
    var isDismissed = (0, useDismissedReferralBanners_1.default)({ referralContentType: CONST_1.default.REFERRAL_PROGRAM.CONTENT_TYPES.START_CHAT }).isDismissed;
    var footerContent = (0, react_1.useMemo)(function () {
        return (!isDismissed || selectedOptions.length > 0) && (<>
                    <ReferralProgramCTA_1.default referralContentType={CONST_1.default.REFERRAL_PROGRAM.CONTENT_TYPES.START_CHAT} style={selectedOptions.length ? styles.mb5 : undefined}/>

                    {!!selectedOptions.length && (<Button_1.default success large text={translate('common.next')} onPress={createGroup} pressOnEnter/>)}
                </>);
    }, [createGroup, selectedOptions.length, styles.mb5, translate, isDismissed]);
    return (<ScreenWrapper_1.default enableEdgeToEdgeBottomSafeAreaPadding includePaddingTop={false} shouldEnablePickerAvoiding={false} disableOfflineIndicatorSafeAreaPadding shouldShowOfflineIndicator={false} keyboardVerticalOffset={variables_1.default.contentHeaderHeight + top + variables_1.default.tabSelectorButtonHeight + variables_1.default.tabSelectorButtonPadding} 
    // Disable the focus trap of this page to activate the parent focus trap in `NewChatSelectorPage`.
    focusTrapSettings={{ active: false }} testID={NewChatPage.displayName}>
            <SelectionList_1.default ref={selectionListRef} ListItem={UserListItem_1.default} sections={areOptionsInitialized ? sections : CONST_1.default.EMPTY_ARRAY} textInputValue={searchTerm} textInputHint={isOffline ? "".concat(translate('common.youAppearToBeOffline'), " ").concat(translate('search.resultsAreLimited')) : ''} onChangeText={setSearchTerm} textInputLabel={translate('selectionList.nameEmailOrPhoneNumber')} headerMessage={headerMessage} onSelectRow={selectOption} shouldSingleExecuteRowSelect onConfirm={function (e, option) { return (selectedOptions.length > 0 ? createGroup() : selectOption(option)); }} rightHandSideComponent={itemRightSideComponent} footerContent={footerContent} showLoadingPlaceholder={!areOptionsInitialized} shouldPreventDefaultFocusOnSelectRow={!(0, DeviceCapabilities_1.canUseTouchScreen)()} isLoadingNewOptions={!!isSearchingForReports} initiallyFocusedOptionKey={firstKeyForList} shouldTextInputInterceptSwipe addBottomSafeAreaPadding textInputAutoFocus={false}/>
        </ScreenWrapper_1.default>);
}
NewChatPage.displayName = 'NewChatPage';
exports.default = (0, react_1.forwardRef)(NewChatPage);
