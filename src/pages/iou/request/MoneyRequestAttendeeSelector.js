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
var fast_equals_1 = require("fast-equals");
var reject_1 = require("lodash/reject");
var react_1 = require("react");
var Button_1 = require("@components/Button");
var EmptySelectionListContent_1 = require("@components/EmptySelectionListContent");
var FormHelpMessage_1 = require("@components/FormHelpMessage");
var OnyxProvider_1 = require("@components/OnyxProvider");
var OptionListContextProvider_1 = require("@components/OptionListContextProvider");
var SelectionList_1 = require("@components/SelectionList");
var InviteMemberListItem_1 = require("@components/SelectionList/InviteMemberListItem");
var useDebouncedState_1 = require("@hooks/useDebouncedState");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var usePolicy_1 = require("@hooks/usePolicy");
var useScreenWrapperTransitionStatus_1 = require("@hooks/useScreenWrapperTransitionStatus");
var useThemeStyles_1 = require("@hooks/useThemeStyles");
var DeviceCapabilities_1 = require("@libs/DeviceCapabilities");
var OptionsListUtils_1 = require("@libs/OptionsListUtils");
var PersonalDetailsUtils_1 = require("@libs/PersonalDetailsUtils");
var PolicyUtils_1 = require("@libs/PolicyUtils");
var Report_1 = require("@userActions/Report");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
function MoneyRequestAttendeeSelector(_a) {
    var _b = _a.attendees, attendees = _b === void 0 ? [] : _b, onFinish = _a.onFinish, onAttendeesAdded = _a.onAttendeesAdded, iouType = _a.iouType, action = _a.action;
    var translate = (0, useLocalize_1.default)().translate;
    var styles = (0, useThemeStyles_1.default)();
    var _c = (0, useDebouncedState_1.default)(''), searchTerm = _c[0], debouncedSearchTerm = _c[1], setSearchTerm = _c[2];
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var personalDetails = (0, OnyxProvider_1.usePersonalDetails)();
    var didScreenTransitionEnd = (0, useScreenWrapperTransitionStatus_1.default)().didScreenTransitionEnd;
    var betas = (0, useOnyx_1.default)(ONYXKEYS_1.default.BETAS, { canBeMissing: false })[0];
    var activePolicyID = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_ACTIVE_POLICY_ID, { canBeMissing: true })[0];
    var recentAttendees = (0, useOnyx_1.default)(ONYXKEYS_1.default.NVP_RECENT_ATTENDEES, { canBeMissing: true })[0];
    var policy = (0, usePolicy_1.default)(activePolicyID);
    var isSearchingForReports = (0, useOnyx_1.default)(ONYXKEYS_1.default.IS_SEARCHING_FOR_REPORTS, { initWithStoredValues: false, canBeMissing: true })[0];
    var _d = (0, OptionListContextProvider_1.useOptionsList)({
        shouldInitialize: didScreenTransitionEnd,
    }), options = _d.options, areOptionsInitialized = _d.areOptionsInitialized;
    var cleanSearchTerm = (0, react_1.useMemo)(function () { return searchTerm.trim().toLowerCase(); }, [searchTerm]);
    var offlineMessage = isOffline ? "".concat(translate('common.youAppearToBeOffline'), " ").concat(translate('search.resultsAreLimited')) : '';
    var isPaidGroupPolicy = (0, react_1.useMemo)(function () { return (0, PolicyUtils_1.isPaidGroupPolicy)(policy); }, [policy]);
    (0, react_1.useEffect)(function () {
        (0, Report_1.searchInServer)(debouncedSearchTerm.trim());
    }, [debouncedSearchTerm]);
    var defaultOptions = (0, react_1.useMemo)(function () {
        if (!areOptionsInitialized || !didScreenTransitionEnd) {
            (0, OptionsListUtils_1.getEmptyOptions)();
        }
        var optionList = (0, OptionsListUtils_1.getAttendeeOptions)(options.reports, options.personalDetails, betas, attendees, recentAttendees !== null && recentAttendees !== void 0 ? recentAttendees : [], iouType === CONST_1.default.IOU.TYPE.SUBMIT, true, false, action);
        if (isPaidGroupPolicy) {
            var orderedOptions = (0, OptionsListUtils_1.orderOptions)(optionList, searchTerm, {
                preferChatRoomsOverThreads: true,
                preferPolicyExpenseChat: !!action,
                preferRecentExpenseReports: action === CONST_1.default.IOU.ACTION.CREATE,
            });
            optionList.recentReports = orderedOptions.recentReports;
            optionList.personalDetails = orderedOptions.personalDetails;
        }
        return optionList;
    }, [areOptionsInitialized, didScreenTransitionEnd, options.reports, options.personalDetails, betas, attendees, recentAttendees, iouType, action, isPaidGroupPolicy, searchTerm]);
    var chatOptions = (0, react_1.useMemo)(function () {
        if (!areOptionsInitialized) {
            return {
                userToInvite: null,
                recentReports: [],
                personalDetails: [],
                currentUserOption: null,
                headerMessage: '',
            };
        }
        var newOptions = (0, OptionsListUtils_1.filterAndOrderOptions)(defaultOptions, cleanSearchTerm, {
            excludeLogins: CONST_1.default.EXPENSIFY_EMAILS_OBJECT,
            preferPolicyExpenseChat: isPaidGroupPolicy,
            shouldAcceptName: true,
            selectedOptions: attendees.map(function (attendee) { return (__assign(__assign(__assign({}, attendee), { reportID: CONST_1.default.DEFAULT_NUMBER_ID.toString(), selected: true, login: attendee.email }), (0, PersonalDetailsUtils_1.getPersonalDetailByEmail)(attendee.email))); }),
        });
        return newOptions;
    }, [areOptionsInitialized, defaultOptions, cleanSearchTerm, isPaidGroupPolicy, attendees]);
    /**
     * Returns the sections needed for the OptionsSelector
     */
    var _e = (0, react_1.useMemo)(function () {
        var _a, _b, _c, _d, _e, _f;
        var newSections = [];
        if (!areOptionsInitialized || !didScreenTransitionEnd) {
            return [newSections, ''];
        }
        var fiveRecents = __spreadArray([], chatOptions.recentReports, true).slice(0, 5);
        var restOfRecents = __spreadArray([], chatOptions.recentReports, true).slice(5);
        var contactsWithRestOfRecents = __spreadArray(__spreadArray([], restOfRecents, true), chatOptions.personalDetails, true);
        var formatResults = (0, OptionsListUtils_1.formatSectionsFromSearchTerm)(cleanSearchTerm, attendees.map(function (attendee) { return (__assign(__assign(__assign({}, attendee), { reportID: CONST_1.default.DEFAULT_NUMBER_ID.toString(), selected: true, login: attendee.email }), (0, PersonalDetailsUtils_1.getPersonalDetailByEmail)(attendee.email))); }), chatOptions.recentReports, chatOptions.personalDetails, personalDetails, true);
        newSections.push(formatResults.section);
        newSections.push({
            title: translate('common.recents'),
            data: fiveRecents,
            shouldShow: fiveRecents.length > 0,
        });
        newSections.push({
            title: translate('common.contacts'),
            data: contactsWithRestOfRecents,
            shouldShow: contactsWithRestOfRecents.length > 0,
        });
        if (chatOptions.userToInvite &&
            !(0, OptionsListUtils_1.isCurrentUser)(__assign(__assign({}, chatOptions.userToInvite), { accountID: (_b = (_a = chatOptions.userToInvite) === null || _a === void 0 ? void 0 : _a.accountID) !== null && _b !== void 0 ? _b : CONST_1.default.DEFAULT_NUMBER_ID, status: (_d = (_c = chatOptions.userToInvite) === null || _c === void 0 ? void 0 : _c.status) !== null && _d !== void 0 ? _d : undefined }))) {
            newSections.push({
                title: undefined,
                data: [chatOptions.userToInvite].map(function (participant) {
                    var _a;
                    var isPolicyExpenseChat = (_a = participant === null || participant === void 0 ? void 0 : participant.isPolicyExpenseChat) !== null && _a !== void 0 ? _a : false;
                    return isPolicyExpenseChat ? (0, OptionsListUtils_1.getPolicyExpenseReportOption)(participant) : (0, OptionsListUtils_1.getParticipantsOption)(participant, personalDetails);
                }),
                shouldShow: true,
            });
        }
        var headerMessage = (0, OptionsListUtils_1.getHeaderMessage)(((_e = chatOptions.personalDetails) !== null && _e !== void 0 ? _e : []).length + ((_f = chatOptions.recentReports) !== null && _f !== void 0 ? _f : []).length !== 0, !!(chatOptions === null || chatOptions === void 0 ? void 0 : chatOptions.userToInvite), cleanSearchTerm, attendees.some(function (attendee) { return (0, OptionsListUtils_1.getPersonalDetailSearchTerms)(attendee).join(' ').toLowerCase().includes(cleanSearchTerm); }));
        return [newSections, headerMessage];
    }, [
        areOptionsInitialized,
        didScreenTransitionEnd,
        attendees,
        chatOptions.recentReports,
        chatOptions.personalDetails,
        chatOptions.userToInvite,
        personalDetails,
        translate,
        cleanSearchTerm,
    ]), sections = _e[0], header = _e[1];
    var addAttendeeToSelection = (0, react_1.useCallback)(function (option) {
        var _a, _b, _c, _d, _e, _f, _g;
        var isOptionSelected = function (selectedOption) {
            if (selectedOption.accountID && selectedOption.accountID === (option === null || option === void 0 ? void 0 : option.accountID)) {
                return true;
            }
            if (selectedOption.email && selectedOption.email === (option === null || option === void 0 ? void 0 : option.login)) {
                return true;
            }
            return false;
        };
        var isOptionInList = attendees.some(isOptionSelected);
        var newSelectedOptions;
        if (isOptionInList) {
            newSelectedOptions = (0, reject_1.default)(attendees, isOptionSelected);
        }
        else {
            var iconSource = (_b = (_a = option.icons) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.source;
            var icon = typeof iconSource === 'function' ? '' : ((_c = iconSource === null || iconSource === void 0 ? void 0 : iconSource.toString()) !== null && _c !== void 0 ? _c : '');
            newSelectedOptions = __spreadArray(__spreadArray([], attendees, true), [
                {
                    accountID: (_d = option.accountID) !== null && _d !== void 0 ? _d : CONST_1.default.DEFAULT_NUMBER_ID,
                    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                    login: option.login || option.text,
                    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                    email: option.login || ((_e = option.text) !== null && _e !== void 0 ? _e : ''),
                    displayName: (_f = option.text) !== null && _f !== void 0 ? _f : '',
                    selected: true,
                    searchText: option.searchText,
                    avatarUrl: (_g = option.avatarUrl) !== null && _g !== void 0 ? _g : icon,
                    iouType: iouType,
                },
            ], false);
        }
        onAttendeesAdded(newSelectedOptions);
    }, [attendees, iouType, onAttendeesAdded]);
    var shouldShowErrorMessage = attendees.length < 1;
    var handleConfirmSelection = (0, react_1.useCallback)(function (_keyEvent, option) {
        if (shouldShowErrorMessage || (!attendees.length && !option)) {
            return;
        }
        onFinish(CONST_1.default.IOU.TYPE.SUBMIT);
    }, [shouldShowErrorMessage, onFinish, attendees]);
    var showLoadingPlaceholder = (0, react_1.useMemo)(function () { return !areOptionsInitialized || !didScreenTransitionEnd; }, [areOptionsInitialized, didScreenTransitionEnd]);
    var optionLength = (0, react_1.useMemo)(function () {
        if (!areOptionsInitialized) {
            return 0;
        }
        return sections.reduce(function (acc, section) { return acc + section.data.length; }, 0);
    }, [areOptionsInitialized, sections]);
    var shouldShowListEmptyContent = (0, react_1.useMemo)(function () { return optionLength === 0 && !showLoadingPlaceholder; }, [optionLength, showLoadingPlaceholder]);
    var footerContent = (0, react_1.useMemo)(function () {
        if (!shouldShowErrorMessage && !attendees.length) {
            return;
        }
        return (<>
                {shouldShowErrorMessage && (<FormHelpMessage_1.default style={[styles.ph1, styles.mb2]} isError message={translate('iou.error.atLeastOneAttendee')}/>)}
                <Button_1.default success text={translate('common.save')} onPress={handleConfirmSelection} pressOnEnter large isDisabled={shouldShowErrorMessage}/>
            </>);
    }, [handleConfirmSelection, attendees.length, shouldShowErrorMessage, styles, translate]);
    return (<SelectionList_1.default onConfirm={handleConfirmSelection} sections={areOptionsInitialized ? sections : CONST_1.default.EMPTY_ARRAY} ListItem={InviteMemberListItem_1.default} textInputValue={searchTerm} textInputLabel={translate('selectionList.nameEmailOrPhoneNumber')} textInputHint={offlineMessage} onChangeText={setSearchTerm} shouldPreventDefaultFocusOnSelectRow={!(0, DeviceCapabilities_1.canUseTouchScreen)()} onSelectRow={addAttendeeToSelection} shouldSingleExecuteRowSelect footerContent={footerContent} listEmptyContent={<EmptySelectionListContent_1.default contentType={iouType}/>} headerMessage={header} showLoadingPlaceholder={showLoadingPlaceholder} canSelectMultiple isLoadingNewOptions={!!isSearchingForReports} shouldShowListEmptyContent={shouldShowListEmptyContent}/>);
}
MoneyRequestAttendeeSelector.displayName = 'MoneyRequestAttendeeSelector';
exports.default = (0, react_1.memo)(MoneyRequestAttendeeSelector, function (prevProps, nextProps) { return (0, fast_equals_1.deepEqual)(prevProps.attendees, nextProps.attendees) && prevProps.iouType === nextProps.iouType; });
