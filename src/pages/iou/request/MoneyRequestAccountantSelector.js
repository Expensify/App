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
var pick_1 = require("lodash/pick");
var react_1 = require("react");
var EmptySelectionListContent_1 = require("@components/EmptySelectionListContent");
var OnyxProvider_1 = require("@components/OnyxProvider");
var OptionListContextProvider_1 = require("@components/OptionListContextProvider");
var SelectionList_1 = require("@components/SelectionList");
var InviteMemberListItem_1 = require("@components/SelectionList/InviteMemberListItem");
var useDebouncedState_1 = require("@hooks/useDebouncedState");
var useLocalize_1 = require("@hooks/useLocalize");
var useNetwork_1 = require("@hooks/useNetwork");
var useOnyx_1 = require("@hooks/useOnyx");
var useScreenWrapperTransitionStatus_1 = require("@hooks/useScreenWrapperTransitionStatus");
var DeviceCapabilities_1 = require("@libs/DeviceCapabilities");
var OptionsListUtils_1 = require("@libs/OptionsListUtils");
var Report_1 = require("@userActions/Report");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
function MoneyRequestAccountantSelector(_a) {
    var onFinish = _a.onFinish, onAccountantSelected = _a.onAccountantSelected, iouType = _a.iouType, action = _a.action;
    var translate = (0, useLocalize_1.default)().translate;
    var _b = (0, useDebouncedState_1.default)(''), searchTerm = _b[0], debouncedSearchTerm = _b[1], setSearchTerm = _b[2];
    var isOffline = (0, useNetwork_1.default)().isOffline;
    var personalDetails = (0, OnyxProvider_1.usePersonalDetails)();
    var didScreenTransitionEnd = (0, useScreenWrapperTransitionStatus_1.default)().didScreenTransitionEnd;
    var betas = (0, useOnyx_1.default)(ONYXKEYS_1.default.BETAS, { canBeMissing: false })[0];
    var isSearchingForReports = (0, useOnyx_1.default)(ONYXKEYS_1.default.IS_SEARCHING_FOR_REPORTS, { initWithStoredValues: false, canBeMissing: true })[0];
    var _c = (0, OptionListContextProvider_1.useOptionsList)({
        shouldInitialize: didScreenTransitionEnd,
    }), options = _c.options, areOptionsInitialized = _c.areOptionsInitialized;
    var offlineMessage = isOffline ? "".concat(translate('common.youAppearToBeOffline'), " ").concat(translate('search.resultsAreLimited')) : '';
    (0, react_1.useEffect)(function () {
        (0, Report_1.searchInServer)(debouncedSearchTerm.trim());
    }, [debouncedSearchTerm]);
    var defaultOptions = (0, react_1.useMemo)(function () {
        if (!areOptionsInitialized || !didScreenTransitionEnd) {
            (0, OptionsListUtils_1.getEmptyOptions)();
        }
        var optionList = (0, OptionsListUtils_1.getValidOptions)({
            reports: options.reports,
            personalDetails: options.personalDetails,
        }, {
            betas: betas,
            excludeLogins: CONST_1.default.EXPENSIFY_EMAILS_OBJECT,
            action: action,
        });
        var orderedOptions = (0, OptionsListUtils_1.orderOptions)(optionList);
        return __assign(__assign({}, optionList), orderedOptions);
    }, [action, areOptionsInitialized, betas, didScreenTransitionEnd, options.personalDetails, options.reports]);
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
        var newOptions = (0, OptionsListUtils_1.filterAndOrderOptions)(defaultOptions, debouncedSearchTerm, {
            excludeLogins: CONST_1.default.EXPENSIFY_EMAILS_OBJECT,
            maxRecentReportsToShow: CONST_1.default.IOU.MAX_RECENT_REPORTS_TO_SHOW,
        });
        return newOptions;
    }, [areOptionsInitialized, defaultOptions, debouncedSearchTerm]);
    /**
     * Returns the sections needed for the OptionsSelector
     */
    var _d = (0, react_1.useMemo)(function () {
        var _a, _b, _c, _d, _e, _f;
        var newSections = [];
        if (!areOptionsInitialized || !didScreenTransitionEnd) {
            return [newSections, ''];
        }
        var fiveRecents = __spreadArray([], chatOptions.recentReports, true).slice(0, 5);
        var restOfRecents = __spreadArray([], chatOptions.recentReports, true).slice(5);
        var contactsWithRestOfRecents = __spreadArray(__spreadArray([], restOfRecents, true), chatOptions.personalDetails, true);
        var formatResults = (0, OptionsListUtils_1.formatSectionsFromSearchTerm)(debouncedSearchTerm, [], chatOptions.recentReports, chatOptions.personalDetails, personalDetails, true);
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
        var headerMessage = (0, OptionsListUtils_1.getHeaderMessage)(((_e = chatOptions.personalDetails) !== null && _e !== void 0 ? _e : []).length + ((_f = chatOptions.recentReports) !== null && _f !== void 0 ? _f : []).length !== 0, !!(chatOptions === null || chatOptions === void 0 ? void 0 : chatOptions.userToInvite), debouncedSearchTerm.trim());
        return [newSections, headerMessage];
    }, [areOptionsInitialized, didScreenTransitionEnd, debouncedSearchTerm, chatOptions.recentReports, chatOptions.personalDetails, chatOptions.userToInvite, personalDetails, translate]), sections = _d[0], header = _d[1];
    var selectAccountant = (0, react_1.useCallback)(function (option) {
        onAccountantSelected((0, pick_1.default)(option, 'accountID', 'login'));
        onFinish();
    }, [onAccountantSelected, onFinish]);
    var handleConfirmSelection = (0, react_1.useCallback)(function (keyEvent, option) {
        if (!option) {
            return;
        }
        selectAccountant(option);
    }, [selectAccountant]);
    var showLoadingPlaceholder = (0, react_1.useMemo)(function () { return !areOptionsInitialized || !didScreenTransitionEnd; }, [areOptionsInitialized, didScreenTransitionEnd]);
    var optionLength = (0, react_1.useMemo)(function () {
        if (!areOptionsInitialized) {
            return 0;
        }
        return sections.reduce(function (acc, section) { return acc + section.data.length; }, 0);
    }, [areOptionsInitialized, sections]);
    var shouldShowListEmptyContent = (0, react_1.useMemo)(function () { return optionLength === 0 && !showLoadingPlaceholder; }, [optionLength, showLoadingPlaceholder]);
    return (<SelectionList_1.default onConfirm={handleConfirmSelection} sections={areOptionsInitialized ? sections : CONST_1.default.EMPTY_ARRAY} ListItem={InviteMemberListItem_1.default} textInputValue={searchTerm} textInputLabel={translate('selectionList.nameEmailOrPhoneNumber')} textInputHint={offlineMessage} onChangeText={setSearchTerm} shouldPreventDefaultFocusOnSelectRow={!(0, DeviceCapabilities_1.canUseTouchScreen)()} onSelectRow={selectAccountant} shouldSingleExecuteRowSelect listEmptyContent={<EmptySelectionListContent_1.default contentType={iouType}/>} headerMessage={header} showLoadingPlaceholder={showLoadingPlaceholder} isLoadingNewOptions={!!isSearchingForReports} shouldShowListEmptyContent={shouldShowListEmptyContent}/>);
}
MoneyRequestAccountantSelector.displayName = 'MoneyRequestAccountantSelector';
exports.default = (0, react_1.memo)(MoneyRequestAccountantSelector, function (prevProps, nextProps) { return prevProps.iouType === nextProps.iouType; });
