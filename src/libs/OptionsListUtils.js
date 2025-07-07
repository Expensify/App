"use strict";
/* eslint-disable @typescript-eslint/prefer-for-of */
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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
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
exports.recentReportComparator = void 0;
exports.getAvatarsForAccountIDs = getAvatarsForAccountIDs;
exports.isCurrentUser = isCurrentUser;
exports.isPersonalDetailsReady = isPersonalDetailsReady;
exports.getValidOptions = getValidOptions;
exports.getValidPersonalDetailOptions = getValidPersonalDetailOptions;
exports.getSearchOptions = getSearchOptions;
exports.getShareDestinationOptions = getShareDestinationOptions;
exports.getMemberInviteOptions = getMemberInviteOptions;
exports.getHeaderMessage = getHeaderMessage;
exports.getHeaderMessageForNonUserList = getHeaderMessageForNonUserList;
exports.getSearchValueForPhoneOrEmail = getSearchValueForPhoneOrEmail;
exports.getPersonalDetailsForAccountIDs = getPersonalDetailsForAccountIDs;
exports.getIOUConfirmationOptionsFromPayeePersonalDetail = getIOUConfirmationOptionsFromPayeePersonalDetail;
exports.isSearchStringMatchUserDetails = isSearchStringMatchUserDetails;
exports.getPolicyExpenseReportOption = getPolicyExpenseReportOption;
exports.getIOUReportIDOfLastAction = getIOUReportIDOfLastAction;
exports.getParticipantsOption = getParticipantsOption;
exports.isSearchStringMatch = isSearchStringMatch;
exports.shouldOptionShowTooltip = shouldOptionShowTooltip;
exports.getLastActorDisplayName = getLastActorDisplayName;
exports.getLastMessageTextForReport = getLastMessageTextForReport;
exports.hasEnabledOptions = hasEnabledOptions;
exports.sortAlphabetically = sortAlphabetically;
exports.formatMemberForList = formatMemberForList;
exports.formatSectionsFromSearchTerm = formatSectionsFromSearchTerm;
exports.getShareLogOptions = getShareLogOptions;
exports.orderOptions = orderOptions;
exports.filterUserToInvite = filterUserToInvite;
exports.filterOptions = filterOptions;
exports.filteredPersonalDetailsOfRecentReports = filteredPersonalDetailsOfRecentReports;
exports.orderReportOptions = orderReportOptions;
exports.orderReportOptionsWithSearch = orderReportOptionsWithSearch;
exports.orderPersonalDetailsOptions = orderPersonalDetailsOptions;
exports.filterAndOrderOptions = filterAndOrderOptions;
exports.createOptionList = createOptionList;
exports.createOptionFromReport = createOptionFromReport;
exports.getReportOption = getReportOption;
exports.getFirstKeyForList = getFirstKeyForList;
exports.canCreateOptimisticPersonalDetailOption = canCreateOptimisticPersonalDetailOption;
exports.getUserToInviteOption = getUserToInviteOption;
exports.getUserToInviteContactOption = getUserToInviteContactOption;
exports.getPersonalDetailSearchTerms = getPersonalDetailSearchTerms;
exports.getCurrentUserSearchTerms = getCurrentUserSearchTerms;
exports.getEmptyOptions = getEmptyOptions;
exports.shouldUseBoldText = shouldUseBoldText;
exports.getAttendeeOptions = getAttendeeOptions;
exports.getAlternateText = getAlternateText;
exports.getReportDisplayOption = getReportDisplayOption;
exports.combineOrderingOfReportsAndPersonalDetails = combineOrderingOfReportsAndPersonalDetails;
exports.filterWorkspaceChats = filterWorkspaceChats;
exports.orderWorkspaceOptions = orderWorkspaceOptions;
exports.filterSelfDMChat = filterSelfDMChat;
exports.filterReports = filterReports;
exports.getIsUserSubmittedExpenseOrScannedReceipt = getIsUserSubmittedExpenseOrScannedReceipt;
exports.getManagerMcTestParticipant = getManagerMcTestParticipant;
exports.shouldShowLastActorDisplayName = shouldShowLastActorDisplayName;
exports.isDisablingOrDeletingLastEnabledCategory = isDisablingOrDeletingLastEnabledCategory;
exports.isDisablingOrDeletingLastEnabledTag = isDisablingOrDeletingLastEnabledTag;
exports.isMakingLastRequiredTagListOptional = isMakingLastRequiredTagListOptional;
exports.processReport = processReport;
exports.shallowOptionsListCompare = shallowOptionsListCompare;
exports.optionsOrderBy = optionsOrderBy;
/* eslint-disable no-continue */
var expensify_common_1 = require("expensify-common");
var keyBy_1 = require("lodash/keyBy");
var orderBy_1 = require("lodash/orderBy");
var react_native_onyx_1 = require("react-native-onyx");
var Expensicons_1 = require("@components/Icon/Expensicons");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var Timing_1 = require("./actions/Timing");
var CategoryUtils_1 = require("./CategoryUtils");
var filterArrayByMatch_1 = require("./filterArrayByMatch");
var isReportMessageAttachment_1 = require("./isReportMessageAttachment");
var LocalePhoneNumber_1 = require("./LocalePhoneNumber");
var Localize_1 = require("./Localize");
var LoginUtils_1 = require("./LoginUtils");
var MinHeap_1 = require("./MinHeap");
var ModifiedExpenseMessage_1 = require("./ModifiedExpenseMessage");
var Navigation_1 = require("./Navigation/Navigation");
var Parser_1 = require("./Parser");
var Performance_1 = require("./Performance");
var Permissions_1 = require("./Permissions");
var PersonalDetailsUtils_1 = require("./PersonalDetailsUtils");
var PhoneNumber_1 = require("./PhoneNumber");
var PolicyUtils_1 = require("./PolicyUtils");
var ReportActionsUtils_1 = require("./ReportActionsUtils");
var ReportUtils_1 = require("./ReportUtils");
var StringUtils_1 = require("./StringUtils");
var TaskUtils_1 = require("./TaskUtils");
var UserUtils_1 = require("./UserUtils");
/**
 * OptionsListUtils is used to build a list options passed to the OptionsList component. Several different UI views can
 * be configured to display different results based on the options passed to the private getOptions() method. Public
 * methods should be named for the views they build options for and then exported for use in a component.
 */
var currentUserLogin;
var currentUserAccountID;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.SESSION,
    callback: function (value) {
        currentUserLogin = value === null || value === void 0 ? void 0 : value.email;
        currentUserAccountID = value === null || value === void 0 ? void 0 : value.accountID;
    },
});
var loginList;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.LOGIN_LIST,
    callback: function (value) { return (loginList = (0, EmptyObject_1.isEmptyObject)(value) ? {} : value); },
});
var allPersonalDetails;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.PERSONAL_DETAILS_LIST,
    callback: function (value) { return (allPersonalDetails = (0, EmptyObject_1.isEmptyObject)(value) ? {} : value); },
});
var policies = {};
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.COLLECTION.POLICY,
    callback: function (policy, key) {
        if (!policy || !key || !policy.name) {
            return;
        }
        policies[key] = policy;
    },
});
var allPolicies = {};
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.COLLECTION.POLICY,
    waitForCollectionCallback: true,
    callback: function (val) { return (allPolicies = val); },
});
var allReports;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback: function (value) {
        allReports = value;
    },
});
var allReportNameValuePairs;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.COLLECTION.REPORT_NAME_VALUE_PAIRS,
    waitForCollectionCallback: true,
    callback: function (value) {
        allReportNameValuePairs = value;
    },
});
var lastReportActions = {};
var allSortedReportActions = {};
var allReportActions;
var lastVisibleReportActions = {};
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS,
    waitForCollectionCallback: true,
    callback: function (actions) {
        if (!actions) {
            return;
        }
        allReportActions = actions !== null && actions !== void 0 ? actions : {};
        // Iterate over the report actions to build the sorted and lastVisible report actions objects
        Object.entries(allReportActions).forEach(function (reportActions) {
            var _a, _b;
            var reportID = reportActions[0].split('_').at(1);
            if (!reportID) {
                return;
            }
            var reportActionsArray = Object.values((_a = reportActions[1]) !== null && _a !== void 0 ? _a : {});
            var sortedReportActions = (0, ReportActionsUtils_1.getSortedReportActions)(reportActionsArray, true);
            allSortedReportActions[reportID] = sortedReportActions;
            var report = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(reportID)];
            var chatReport = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report === null || report === void 0 ? void 0 : report.chatReportID)];
            // If the report is a one-transaction report and has , we need to return the combined reportActions so that the LHN can display modifications
            // to the transaction thread or the report itself
            var transactionThreadReportID = (0, ReportActionsUtils_1.getOneTransactionThreadReportID)(report, chatReport, actions[reportActions[0]]);
            if (transactionThreadReportID) {
                var transactionThreadReportActionsArray = Object.values((_b = actions["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(transactionThreadReportID)]) !== null && _b !== void 0 ? _b : {});
                sortedReportActions = (0, ReportActionsUtils_1.getCombinedReportActions)(sortedReportActions, transactionThreadReportID, transactionThreadReportActionsArray, reportID);
            }
            var firstReportAction = sortedReportActions.at(0);
            if (!firstReportAction) {
                delete lastReportActions[reportID];
            }
            else {
                lastReportActions[reportID] = firstReportAction;
            }
            var isWriteActionAllowed = (0, ReportUtils_1.canUserPerformWriteAction)(report);
            // The report is only visible if it is the last action not deleted that
            // does not match a closed or created state.
            var reportActionsForDisplay = sortedReportActions.filter(function (reportAction, actionKey) {
                return (0, ReportActionsUtils_1.shouldReportActionBeVisible)(reportAction, actionKey, isWriteActionAllowed) &&
                    reportAction.actionName !== CONST_1.default.REPORT.ACTIONS.TYPE.CREATED &&
                    reportAction.pendingAction !== CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
            });
            var reportActionForDisplay = reportActionsForDisplay.at(0);
            if (!reportActionForDisplay) {
                delete lastVisibleReportActions[reportID];
                return;
            }
            lastVisibleReportActions[reportID] = reportActionForDisplay;
        });
    },
});
var activePolicyID;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.NVP_ACTIVE_POLICY_ID,
    callback: function (value) { return (activePolicyID = value); },
});
var nvpDismissedProductTraining;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.NVP_DISMISSED_PRODUCT_TRAINING,
    callback: function (value) { return (nvpDismissedProductTraining = value); },
});
var reportAttributesDerivedValue;
react_native_onyx_1.default.connect({
    key: ONYXKEYS_1.default.DERIVED.REPORT_ATTRIBUTES,
    callback: function (value) { return (reportAttributesDerivedValue = value === null || value === void 0 ? void 0 : value.reports); },
});
/**
 * @param defaultValues {login: accountID} In workspace invite page, when new user is added we pass available data to opt in
 * @returns Returns avatar data for a list of user accountIDs
 */
function getAvatarsForAccountIDs(accountIDs, personalDetails, defaultValues) {
    if (defaultValues === void 0) { defaultValues = {}; }
    var reversedDefaultValues = {};
    Object.entries(defaultValues).forEach(function (item) {
        reversedDefaultValues[item[1]] = item[0];
    });
    return accountIDs.map(function (accountID) {
        var _a, _b, _c, _d;
        var login = (_a = reversedDefaultValues[accountID]) !== null && _a !== void 0 ? _a : '';
        var userPersonalDetail = (_b = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[accountID]) !== null && _b !== void 0 ? _b : { login: login, accountID: accountID };
        return {
            id: accountID,
            source: (_c = userPersonalDetail.avatar) !== null && _c !== void 0 ? _c : Expensicons_1.FallbackAvatar,
            type: CONST_1.default.ICON_TYPE_AVATAR,
            name: (_d = userPersonalDetail.login) !== null && _d !== void 0 ? _d : '',
        };
    });
}
/**
 * Returns the personal details for an array of accountIDs
 * @returns keys of the object are emails, values are PersonalDetails objects.
 */
function getPersonalDetailsForAccountIDs(accountIDs, personalDetails) {
    var personalDetailsForAccountIDs = {};
    if (!personalDetails) {
        return personalDetailsForAccountIDs;
    }
    accountIDs === null || accountIDs === void 0 ? void 0 : accountIDs.forEach(function (accountID) {
        var _a;
        var cleanAccountID = Number(accountID);
        if (!cleanAccountID) {
            return;
        }
        var personalDetail = (_a = personalDetails[accountID]) !== null && _a !== void 0 ? _a : undefined;
        if (!personalDetail) {
            personalDetail = {};
        }
        if (cleanAccountID === CONST_1.default.ACCOUNT_ID.CONCIERGE) {
            personalDetail.avatar = CONST_1.default.CONCIERGE_ICON_URL;
        }
        personalDetail.accountID = cleanAccountID;
        personalDetailsForAccountIDs[cleanAccountID] = personalDetail;
    });
    return personalDetailsForAccountIDs;
}
/**
 * Return true if personal details data is ready, i.e. report list options can be created.
 */
function isPersonalDetailsReady(personalDetails) {
    var personalDetailsKeys = Object.keys(personalDetails !== null && personalDetails !== void 0 ? personalDetails : {});
    return personalDetailsKeys.some(function (key) { var _a; return (_a = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[key]) === null || _a === void 0 ? void 0 : _a.accountID; });
}
/**
 * Get the participant option for a report.
 */
function getParticipantsOption(participant, personalDetails) {
    var _a, _b, _c, _d, _e, _f;
    var detail = participant.accountID ? getPersonalDetailsForAccountIDs([participant.accountID], personalDetails)[participant.accountID] : undefined;
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    var login = (detail === null || detail === void 0 ? void 0 : detail.login) || participant.login || '';
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    var displayName = (participant === null || participant === void 0 ? void 0 : participant.displayName) || (0, LocalePhoneNumber_1.formatPhoneNumber)((0, PersonalDetailsUtils_1.getDisplayNameOrDefault)(detail, login || participant.text));
    return {
        keyForList: String((_a = detail === null || detail === void 0 ? void 0 : detail.accountID) !== null && _a !== void 0 ? _a : login),
        login: login,
        accountID: detail === null || detail === void 0 ? void 0 : detail.accountID,
        text: displayName,
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        firstName: (_b = ((detail === null || detail === void 0 ? void 0 : detail.firstName) || participant.firstName)) !== null && _b !== void 0 ? _b : '',
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        lastName: (_c = ((detail === null || detail === void 0 ? void 0 : detail.lastName) || participant.lastName)) !== null && _c !== void 0 ? _c : '',
        alternateText: (0, LocalePhoneNumber_1.formatPhoneNumber)(login) || displayName,
        icons: [
            {
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                source: (_d = (participant.avatar || (detail === null || detail === void 0 ? void 0 : detail.avatar))) !== null && _d !== void 0 ? _d : Expensicons_1.FallbackAvatar,
                name: login,
                type: CONST_1.default.ICON_TYPE_AVATAR,
                id: detail === null || detail === void 0 ? void 0 : detail.accountID,
            },
        ],
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        phoneNumber: (_e = ((detail === null || detail === void 0 ? void 0 : detail.phoneNumber) || (participant === null || participant === void 0 ? void 0 : participant.phoneNumber))) !== null && _e !== void 0 ? _e : '',
        selected: participant.selected,
        isSelected: participant.selected,
        searchText: (_f = participant.searchText) !== null && _f !== void 0 ? _f : undefined,
    };
}
/**
 * A very optimized method to remove duplicates from an array.
 * Taken from https://stackoverflow.com/a/9229821/9114791
 */
function uniqFast(items) {
    var seenItems = {};
    var result = [];
    var j = 0;
    for (var _i = 0, items_1 = items; _i < items_1.length; _i++) {
        var item = items_1[_i];
        if (seenItems[item] !== 1) {
            seenItems[item] = 1;
            result[j++] = item;
        }
    }
    return result;
}
/**
 * Get the last actor display name from last actor details.
 */
function getLastActorDisplayName(lastActorDetails) {
    if (!lastActorDetails) {
        return '';
    }
    return lastActorDetails.accountID !== currentUserAccountID
        ? // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            lastActorDetails.firstName || (0, LocalePhoneNumber_1.formatPhoneNumber)((0, PersonalDetailsUtils_1.getDisplayNameOrDefault)(lastActorDetails))
        : (0, Localize_1.translateLocal)('common.you');
}
/**
 * Should show the last actor display name from last actor details.
 */
function shouldShowLastActorDisplayName(report, lastActorDetails, lastAction) {
    var _a, _b;
    if (!lastActorDetails ||
        (0, ReportUtils_1.isSelfDM)(report) ||
        ((0, ReportUtils_1.isDM)(report) && lastActorDetails.accountID !== currentUserAccountID) ||
        (lastAction === null || lastAction === void 0 ? void 0 : lastAction.actionName) === CONST_1.default.REPORT.ACTIONS.TYPE.IOU ||
        ((lastAction === null || lastAction === void 0 ? void 0 : lastAction.actionName) === CONST_1.default.REPORT.ACTIONS.TYPE.REPORT_PREVIEW &&
            ((_b = Object.keys((_a = report === null || report === void 0 ? void 0 : report.participants) !== null && _a !== void 0 ? _a : {})) === null || _b === void 0 ? void 0 : _b.some(function (participantID) { return participantID === CONST_1.default.ACCOUNT_ID.MANAGER_MCTEST.toString(); })))) {
        return false;
    }
    var lastActorDisplayName = getLastActorDisplayName(lastActorDetails);
    if (!lastActorDisplayName) {
        return false;
    }
    return true;
}
/**
 * Update alternate text for the option when applicable
 */
function getAlternateText(option, _a) {
    var _b, _c, _d, _e;
    var _f = _a.showChatPreviewLine, showChatPreviewLine = _f === void 0 ? false : _f, _g = _a.forcePolicyNamePreview, forcePolicyNamePreview = _g === void 0 ? false : _g;
    var report = (0, ReportUtils_1.getReportOrDraftReport)(option.reportID);
    var isAdminRoom = (0, ReportUtils_1.isAdminRoom)(report);
    var isAnnounceRoom = (0, ReportUtils_1.isAnnounceRoom)(report);
    var isGroupChat = (0, ReportUtils_1.isGroupChat)(report);
    var isExpenseThread = (0, ReportUtils_1.isMoneyRequest)(report);
    var formattedLastMessageText = (0, ReportUtils_1.formatReportLastMessageText)(Parser_1.default.htmlToText((_b = option.lastMessageText) !== null && _b !== void 0 ? _b : ''));
    var reportPrefix = (0, ReportUtils_1.getReportSubtitlePrefix)(report);
    var formattedLastMessageTextWithPrefix = reportPrefix + formattedLastMessageText;
    if (isExpenseThread || option.isMoneyRequestReport) {
        return showChatPreviewLine && formattedLastMessageText ? formattedLastMessageTextWithPrefix : (0, Localize_1.translateLocal)('iou.expense');
    }
    if (option.isThread) {
        return showChatPreviewLine && formattedLastMessageText ? formattedLastMessageTextWithPrefix : (0, Localize_1.translateLocal)('threads.thread');
    }
    if (option.isChatRoom && !isAdminRoom && !isAnnounceRoom) {
        return showChatPreviewLine && formattedLastMessageText ? formattedLastMessageTextWithPrefix : option.subtitle;
    }
    if (((_c = option.isPolicyExpenseChat) !== null && _c !== void 0 ? _c : false) || isAdminRoom || isAnnounceRoom) {
        return showChatPreviewLine && !forcePolicyNamePreview && formattedLastMessageText ? formattedLastMessageTextWithPrefix : option.subtitle;
    }
    if (option.isTaskReport) {
        return showChatPreviewLine && formattedLastMessageText ? formattedLastMessageTextWithPrefix : (0, Localize_1.translateLocal)('task.task');
    }
    if (isGroupChat) {
        return showChatPreviewLine && formattedLastMessageText ? formattedLastMessageTextWithPrefix : (0, Localize_1.translateLocal)('common.group');
    }
    return showChatPreviewLine && formattedLastMessageText
        ? formattedLastMessageTextWithPrefix
        : (0, LocalePhoneNumber_1.formatPhoneNumber)(option.participantsList && option.participantsList.length > 0 ? ((_e = (_d = option.participantsList.at(0)) === null || _d === void 0 ? void 0 : _d.login) !== null && _e !== void 0 ? _e : '') : '');
}
/**
 * Searches for a match when provided with a value
 */
function isSearchStringMatch(searchValue, searchText, participantNames, isReportChatRoom) {
    if (participantNames === void 0) { participantNames = new Set(); }
    if (isReportChatRoom === void 0) { isReportChatRoom = false; }
    var searchWords = new Set(searchValue.replace(/,/g, ' ').split(/\s+/));
    var valueToSearch = searchText === null || searchText === void 0 ? void 0 : searchText.replace(new RegExp(/&nbsp;/g), '');
    var matching = true;
    searchWords.forEach(function (word) {
        // if one of the word is not matching, we don't need to check further
        if (!matching) {
            return;
        }
        var matchRegex = new RegExp(expensify_common_1.Str.escapeForRegExp(word), 'i');
        matching = matchRegex.test(valueToSearch !== null && valueToSearch !== void 0 ? valueToSearch : '') || (!isReportChatRoom && participantNames.has(word));
    });
    return matching;
}
function isSearchStringMatchUserDetails(personalDetail, searchValue) {
    var memberDetails = '';
    if (personalDetail.login) {
        memberDetails += " ".concat(personalDetail.login);
    }
    if (personalDetail.firstName) {
        memberDetails += " ".concat(personalDetail.firstName);
    }
    if (personalDetail.lastName) {
        memberDetails += " ".concat(personalDetail.lastName);
    }
    if (personalDetail.displayName) {
        memberDetails += " ".concat((0, PersonalDetailsUtils_1.getDisplayNameOrDefault)(personalDetail));
    }
    if (personalDetail.phoneNumber) {
        memberDetails += " ".concat(personalDetail.phoneNumber);
    }
    return isSearchStringMatch(searchValue.trim(), memberDetails.toLowerCase());
}
/**
 * Get IOU report ID of report last action if the action is report action preview
 */
function getIOUReportIDOfLastAction(report) {
    var _a;
    if (!(report === null || report === void 0 ? void 0 : report.reportID)) {
        return;
    }
    var lastAction = lastVisibleReportActions[report.reportID];
    if (!(0, ReportActionsUtils_1.isReportPreviewAction)(lastAction)) {
        return;
    }
    return (_a = (0, ReportUtils_1.getReportOrDraftReport)((0, ReportActionsUtils_1.getIOUReportIDFromReportActionPreview)(lastAction))) === null || _a === void 0 ? void 0 : _a.reportID;
}
function hasHiddenDisplayNames(accountIDs) {
    return (0, PersonalDetailsUtils_1.getPersonalDetailsByIDs)({ accountIDs: accountIDs, currentUserAccountID: 0 }).some(function (personalDetail) { return !(0, PersonalDetailsUtils_1.getDisplayNameOrDefault)(personalDetail, undefined, false); });
}
/**
 * Get the last message text from the report directly or from other sources for special cases.
 */
function getLastMessageTextForReport(report, lastActorDetails, policy, isReportArchived) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    if (isReportArchived === void 0) { isReportArchived = false; }
    var reportID = report === null || report === void 0 ? void 0 : report.reportID;
    var lastReportAction = reportID ? lastVisibleReportActions[reportID] : undefined;
    // some types of actions are filtered out for lastReportAction, in some cases we need to check the actual last action
    var lastOriginalReportAction = reportID ? lastReportActions[reportID] : undefined;
    var lastMessageTextFromReport = '';
    if ((0, ReportUtils_1.isArchivedNonExpenseReport)(report, isReportArchived)) {
        var archiveReason = 
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        ((0, ReportActionsUtils_1.isClosedAction)(lastOriginalReportAction) && ((_a = (0, ReportActionsUtils_1.getOriginalMessage)(lastOriginalReportAction)) === null || _a === void 0 ? void 0 : _a.reason)) || CONST_1.default.REPORT.ARCHIVE_REASON.DEFAULT;
        switch (archiveReason) {
            case CONST_1.default.REPORT.ARCHIVE_REASON.ACCOUNT_CLOSED:
            case CONST_1.default.REPORT.ARCHIVE_REASON.REMOVED_FROM_POLICY:
            case CONST_1.default.REPORT.ARCHIVE_REASON.POLICY_DELETED: {
                lastMessageTextFromReport = (0, Localize_1.translateLocal)("reportArchiveReasons.".concat(archiveReason), {
                    displayName: (0, LocalePhoneNumber_1.formatPhoneNumber)((0, PersonalDetailsUtils_1.getDisplayNameOrDefault)(lastActorDetails)),
                    policyName: (0, ReportUtils_1.getPolicyName)({ report: report, policy: policy }),
                });
                break;
            }
            case CONST_1.default.REPORT.ARCHIVE_REASON.BOOKING_END_DATE_HAS_PASSED: {
                lastMessageTextFromReport = (0, Localize_1.translateLocal)("reportArchiveReasons.".concat(archiveReason));
                break;
            }
            default: {
                lastMessageTextFromReport = (0, Localize_1.translateLocal)("reportArchiveReasons.default");
            }
        }
    }
    else if ((0, ReportActionsUtils_1.isMoneyRequestAction)(lastReportAction)) {
        var properSchemaForMoneyRequestMessage = (0, ReportUtils_1.getReportPreviewMessage)(report, lastReportAction, true, false, null, true);
        lastMessageTextFromReport = (0, ReportUtils_1.formatReportLastMessageText)(properSchemaForMoneyRequestMessage);
    }
    else if ((0, ReportActionsUtils_1.isReportPreviewAction)(lastReportAction)) {
        var iouReport = (0, ReportUtils_1.getReportOrDraftReport)((0, ReportActionsUtils_1.getIOUReportIDFromReportActionPreview)(lastReportAction));
        var lastIOUMoneyReportAction = (iouReport === null || iouReport === void 0 ? void 0 : iouReport.reportID)
            ? (_b = allSortedReportActions[iouReport.reportID]) === null || _b === void 0 ? void 0 : _b.find(function (reportAction, key) {
                return (0, ReportActionsUtils_1.shouldReportActionBeVisible)(reportAction, key, (0, ReportUtils_1.canUserPerformWriteAction)(report)) &&
                    reportAction.pendingAction !== CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE &&
                    (0, ReportActionsUtils_1.isMoneyRequestAction)(reportAction);
            })
            : undefined;
        var reportPreviewMessage = (0, ReportUtils_1.getReportPreviewMessage)(!(0, EmptyObject_1.isEmptyObject)(iouReport) ? iouReport : null, lastIOUMoneyReportAction !== null && lastIOUMoneyReportAction !== void 0 ? lastIOUMoneyReportAction : lastReportAction, true, (0, ReportUtils_1.isChatReport)(report), null, true, lastReportAction);
        lastMessageTextFromReport = (0, ReportUtils_1.formatReportLastMessageText)(reportPreviewMessage);
    }
    else if ((0, ReportActionsUtils_1.isReimbursementQueuedAction)(lastReportAction)) {
        lastMessageTextFromReport = (0, ReportUtils_1.getReimbursementQueuedActionMessage)({ reportAction: lastReportAction, reportOrID: report });
    }
    else if ((0, ReportActionsUtils_1.isReimbursementDeQueuedOrCanceledAction)(lastReportAction)) {
        lastMessageTextFromReport = (0, ReportUtils_1.getReimbursementDeQueuedOrCanceledActionMessage)(lastReportAction, report, true);
    }
    else if ((0, ReportActionsUtils_1.isDeletedParentAction)(lastReportAction) && (0, ReportUtils_1.isChatReport)(report)) {
        lastMessageTextFromReport = (0, ReportUtils_1.getDeletedParentActionMessageForChatReport)(lastReportAction);
    }
    else if ((0, ReportActionsUtils_1.isPendingRemove)(lastReportAction) && (report === null || report === void 0 ? void 0 : report.reportID) && (0, ReportActionsUtils_1.isThreadParentMessage)(lastReportAction, report.reportID)) {
        lastMessageTextFromReport = (0, Localize_1.translateLocal)('parentReportAction.hiddenMessage');
    }
    else if ((0, isReportMessageAttachment_1.isReportMessageAttachment)({ text: (_c = report === null || report === void 0 ? void 0 : report.lastMessageText) !== null && _c !== void 0 ? _c : '', html: report === null || report === void 0 ? void 0 : report.lastMessageHtml, type: '' })) {
        lastMessageTextFromReport = "[".concat((0, Localize_1.translateLocal)('common.attachment'), "]");
    }
    else if ((0, ReportActionsUtils_1.isModifiedExpenseAction)(lastReportAction)) {
        var properSchemaForModifiedExpenseMessage = ModifiedExpenseMessage_1.default.getForReportAction({ reportOrID: report === null || report === void 0 ? void 0 : report.reportID, reportAction: lastReportAction });
        lastMessageTextFromReport = (0, ReportUtils_1.formatReportLastMessageText)(properSchemaForModifiedExpenseMessage, true);
    }
    else if ((0, ReportActionsUtils_1.isMovedTransactionAction)(lastReportAction)) {
        lastMessageTextFromReport = (0, ReportUtils_1.getMovedTransactionMessage)(lastReportAction);
    }
    else if ((0, ReportActionsUtils_1.isTaskAction)(lastReportAction)) {
        lastMessageTextFromReport = (0, ReportUtils_1.formatReportLastMessageText)((0, TaskUtils_1.getTaskReportActionMessage)(lastReportAction).text);
    }
    else if ((0, ReportActionsUtils_1.isCreatedTaskReportAction)(lastReportAction)) {
        lastMessageTextFromReport = (0, TaskUtils_1.getTaskCreatedMessage)(lastReportAction);
    }
    else if ((0, ReportActionsUtils_1.isActionOfType)(lastReportAction, CONST_1.default.REPORT.ACTIONS.TYPE.SUBMITTED) ||
        (0, ReportActionsUtils_1.isActionOfType)(lastReportAction, CONST_1.default.REPORT.ACTIONS.TYPE.SUBMITTED_AND_CLOSED) ||
        (0, ReportActionsUtils_1.isMarkAsClosedAction)(lastReportAction)) {
        var wasSubmittedViaHarvesting = !(0, ReportActionsUtils_1.isMarkAsClosedAction)(lastReportAction) ? ((_e = (_d = (0, ReportActionsUtils_1.getOriginalMessage)(lastReportAction)) === null || _d === void 0 ? void 0 : _d.harvesting) !== null && _e !== void 0 ? _e : false) : false;
        if (wasSubmittedViaHarvesting) {
            lastMessageTextFromReport = (0, Localize_1.translateLocal)('iou.automaticallySubmitted');
        }
        else {
            lastMessageTextFromReport = (0, Localize_1.translateLocal)('iou.submitted');
        }
    }
    else if ((0, ReportActionsUtils_1.isActionOfType)(lastReportAction, CONST_1.default.REPORT.ACTIONS.TYPE.APPROVED)) {
        var automaticAction = ((_f = (0, ReportActionsUtils_1.getOriginalMessage)(lastReportAction)) !== null && _f !== void 0 ? _f : {}).automaticAction;
        if (automaticAction) {
            lastMessageTextFromReport = (0, Localize_1.translateLocal)('iou.automaticallyApproved');
        }
        else {
            lastMessageTextFromReport = (0, Localize_1.translateLocal)('iou.approvedMessage');
        }
    }
    else if ((0, ReportActionsUtils_1.isUnapprovedAction)(lastReportAction)) {
        lastMessageTextFromReport = (0, Localize_1.translateLocal)('iou.unapproved');
    }
    else if ((0, ReportActionsUtils_1.isActionOfType)(lastReportAction, CONST_1.default.REPORT.ACTIONS.TYPE.FORWARDED)) {
        var automaticAction = ((_g = (0, ReportActionsUtils_1.getOriginalMessage)(lastReportAction)) !== null && _g !== void 0 ? _g : {}).automaticAction;
        if (automaticAction) {
            lastMessageTextFromReport = (0, Localize_1.translateLocal)('iou.automaticallyForwarded');
        }
        else {
            lastMessageTextFromReport = (0, Localize_1.translateLocal)('iou.forwarded');
        }
    }
    else if ((lastReportAction === null || lastReportAction === void 0 ? void 0 : lastReportAction.actionName) === CONST_1.default.REPORT.ACTIONS.TYPE.REJECTED) {
        lastMessageTextFromReport = (0, ReportUtils_1.getRejectedReportMessage)();
    }
    else if ((lastReportAction === null || lastReportAction === void 0 ? void 0 : lastReportAction.actionName) === CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.CORPORATE_UPGRADE) {
        lastMessageTextFromReport = (0, ReportUtils_1.getUpgradeWorkspaceMessage)();
    }
    else if ((lastReportAction === null || lastReportAction === void 0 ? void 0 : lastReportAction.actionName) === CONST_1.default.REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.TEAM_DOWNGRADE) {
        lastMessageTextFromReport = (0, ReportUtils_1.getDowngradeWorkspaceMessage)();
    }
    else if ((0, ReportActionsUtils_1.isActionableAddPaymentCard)(lastReportAction) || (0, ReportActionsUtils_1.isActionOfType)(lastReportAction, CONST_1.default.REPORT.ACTIONS.TYPE.MOVED)) {
        lastMessageTextFromReport = (0, ReportActionsUtils_1.getReportActionMessageText)(lastReportAction);
    }
    else if ((lastReportAction === null || lastReportAction === void 0 ? void 0 : lastReportAction.actionName) === CONST_1.default.REPORT.ACTIONS.TYPE.EXPORTED_TO_INTEGRATION) {
        lastMessageTextFromReport = (0, ReportActionsUtils_1.getExportIntegrationLastMessageText)(lastReportAction);
    }
    else if ((lastReportAction === null || lastReportAction === void 0 ? void 0 : lastReportAction.actionName) === CONST_1.default.REPORT.ACTIONS.TYPE.RECEIPT_SCAN_FAILED) {
        lastMessageTextFromReport = (0, ReportActionsUtils_1.getReceiptScanFailedMessage)();
    }
    else if ((lastReportAction === null || lastReportAction === void 0 ? void 0 : lastReportAction.actionName) && (0, ReportActionsUtils_1.isOldDotReportAction)(lastReportAction)) {
        lastMessageTextFromReport = (0, ReportActionsUtils_1.getMessageOfOldDotReportAction)(lastReportAction, false);
    }
    else if ((0, ReportActionsUtils_1.isActionableJoinRequest)(lastReportAction)) {
        lastMessageTextFromReport = (0, ReportActionsUtils_1.getJoinRequestMessage)(lastReportAction);
    }
    else if ((lastReportAction === null || lastReportAction === void 0 ? void 0 : lastReportAction.actionName) === CONST_1.default.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.LEAVE_ROOM) {
        lastMessageTextFromReport = (0, ReportActionsUtils_1.getLeaveRoomMessage)();
    }
    else if ((lastReportAction === null || lastReportAction === void 0 ? void 0 : lastReportAction.actionName) === CONST_1.default.REPORT.ACTIONS.TYPE.RESOLVED_DUPLICATES) {
        lastMessageTextFromReport = (0, Localize_1.translateLocal)('violations.resolvedDuplicates');
    }
    else if ((0, ReportActionsUtils_1.isActionOfType)(lastReportAction, CONST_1.default.REPORT.ACTIONS.TYPE.ROOM_CHANGE_LOG.UPDATE_ROOM_DESCRIPTION)) {
        lastMessageTextFromReport = (0, ReportActionsUtils_1.getUpdateRoomDescriptionMessage)(lastReportAction);
    }
    else if ((0, ReportActionsUtils_1.isActionOfType)(lastReportAction, CONST_1.default.REPORT.ACTIONS.TYPE.RETRACTED)) {
        lastMessageTextFromReport = (0, ReportActionsUtils_1.getRetractedMessage)();
    }
    else if ((0, ReportActionsUtils_1.isActionOfType)(lastReportAction, CONST_1.default.REPORT.ACTIONS.TYPE.REOPENED)) {
        lastMessageTextFromReport = (0, ReportActionsUtils_1.getReopenedMessage)();
    }
    else if ((0, ReportActionsUtils_1.isActionOfType)(lastReportAction, CONST_1.default.REPORT.ACTIONS.TYPE.CHANGE_POLICY)) {
        lastMessageTextFromReport = (0, ReportUtils_1.getPolicyChangeMessage)(lastReportAction);
    }
    else if ((0, ReportActionsUtils_1.isActionOfType)(lastReportAction, CONST_1.default.REPORT.ACTIONS.TYPE.TRAVEL_UPDATE)) {
        lastMessageTextFromReport = (0, ReportActionsUtils_1.getTravelUpdateMessage)(lastReportAction);
    }
    // we do not want to show report closed in LHN for non archived report so use getReportLastMessage as fallback instead of lastMessageText from report
    if (reportID &&
        !isReportArchived &&
        (report.lastActionType === CONST_1.default.REPORT.ACTIONS.TYPE.CLOSED || ((lastOriginalReportAction === null || lastOriginalReportAction === void 0 ? void 0 : lastOriginalReportAction.reportActionID) && (0, ReportActionsUtils_1.isDeletedAction)(lastOriginalReportAction)))) {
        return lastMessageTextFromReport || ((_h = (0, ReportUtils_1.getReportLastMessage)(reportID).lastMessageText) !== null && _h !== void 0 ? _h : '');
    }
    // When the last report action has unknown mentions (@Hidden), we want to consistently show @Hidden in LHN and report screen
    // so we reconstruct the last message text of the report from the last report action.
    if (!lastMessageTextFromReport && lastReportAction && hasHiddenDisplayNames((0, ReportActionsUtils_1.getMentionedAccountIDsFromAction)(lastReportAction))) {
        lastMessageTextFromReport = Parser_1.default.htmlToText((0, ReportActionsUtils_1.getReportActionHtml)(lastReportAction));
    }
    // If the last report action is a pending moderation action, get the last message text from the last visible report action
    if (reportID && !lastMessageTextFromReport && (0, ReportActionsUtils_1.isPendingRemove)(lastOriginalReportAction)) {
        lastMessageTextFromReport = (0, ReportActionsUtils_1.getReportActionMessageText)(lastReportAction);
    }
    if (reportID && !lastMessageTextFromReport && lastReportAction) {
        var chatReport = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report === null || report === void 0 ? void 0 : report.chatReportID)];
        // If the report is a one-transaction report, get the last message text from combined report actions so the LHN can display modifications to the transaction thread or the report itself
        var transactionThreadReportID = (0, ReportActionsUtils_1.getOneTransactionThreadReportID)(report, chatReport, allSortedReportActions[reportID]);
        if (transactionThreadReportID) {
            lastMessageTextFromReport = (0, ReportActionsUtils_1.getReportActionMessageText)(lastReportAction);
        }
    }
    return lastMessageTextFromReport || ((_j = report === null || report === void 0 ? void 0 : report.lastMessageText) !== null && _j !== void 0 ? _j : '');
}
/**
 * Creates a report list option
 */
function createOption(accountIDs, personalDetails, report, config) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    var _k = config !== null && config !== void 0 ? config : {}, _l = _k.showChatPreviewLine, showChatPreviewLine = _l === void 0 ? false : _l, _m = _k.forcePolicyNamePreview, forcePolicyNamePreview = _m === void 0 ? false : _m, _o = _k.showPersonalDetails, showPersonalDetails = _o === void 0 ? false : _o, selected = _k.selected, isSelected = _k.isSelected, isDisabled = _k.isDisabled;
    var result = {
        text: undefined,
        alternateText: undefined,
        pendingAction: undefined,
        allReportErrors: undefined,
        brickRoadIndicator: null,
        icons: undefined,
        tooltipText: null,
        ownerAccountID: undefined,
        subtitle: undefined,
        participantsList: undefined,
        accountID: 0,
        login: undefined,
        reportID: '',
        phoneNumber: undefined,
        hasDraftComment: false,
        keyForList: undefined,
        isDefaultRoom: false,
        isPinned: false,
        isWaitingOnBankAccount: false,
        iouReportID: undefined,
        isIOUReportOwner: null,
        iouReportAmount: 0,
        isChatRoom: false,
        shouldShowSubscript: false,
        isPolicyExpenseChat: false,
        isOwnPolicyExpenseChat: false,
        isExpenseReport: false,
        policyID: undefined,
        isOptimisticPersonalDetail: false,
        lastMessageText: '',
        lastVisibleActionCreated: undefined,
        selected: selected,
        isSelected: isSelected,
        isDisabled: isDisabled,
    };
    var personalDetailMap = getPersonalDetailsForAccountIDs(accountIDs, personalDetails);
    var personalDetailList = Object.values(personalDetailMap).filter(function (details) { return !!details; });
    var personalDetail = personalDetailList.at(0);
    var hasMultipleParticipants = personalDetailList.length > 1;
    var subtitle;
    var reportName;
    result.participantsList = personalDetailList;
    result.isOptimisticPersonalDetail = personalDetail === null || personalDetail === void 0 ? void 0 : personalDetail.isOptimisticPersonalDetail;
    if (report) {
        var reportNameValuePairs = allReportNameValuePairs === null || allReportNameValuePairs === void 0 ? void 0 : allReportNameValuePairs["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_NAME_VALUE_PAIRS).concat(report.reportID)];
        result.isChatRoom = (0, ReportUtils_1.isChatRoom)(report);
        result.isDefaultRoom = (0, ReportUtils_1.isDefaultRoom)(report);
        result.private_isArchived = reportNameValuePairs === null || reportNameValuePairs === void 0 ? void 0 : reportNameValuePairs.private_isArchived;
        result.isExpenseReport = (0, ReportUtils_1.isExpenseReport)(report);
        result.isInvoiceRoom = (0, ReportUtils_1.isInvoiceRoom)(report);
        result.isMoneyRequestReport = (0, ReportUtils_1.isMoneyRequestReport)(report);
        result.isThread = (0, ReportUtils_1.isChatThread)(report);
        result.isTaskReport = (0, ReportUtils_1.isTaskReport)(report);
        result.shouldShowSubscript = (0, ReportUtils_1.shouldReportShowSubscript)(report, !!result.private_isArchived);
        result.isPolicyExpenseChat = (0, ReportUtils_1.isPolicyExpenseChat)(report);
        result.isOwnPolicyExpenseChat = (_a = report.isOwnPolicyExpenseChat) !== null && _a !== void 0 ? _a : false;
        result.allReportErrors = (_c = (_b = reportAttributesDerivedValue === null || reportAttributesDerivedValue === void 0 ? void 0 : reportAttributesDerivedValue[report.reportID]) === null || _b === void 0 ? void 0 : _b.reportErrors) !== null && _c !== void 0 ? _c : {};
        result.brickRoadIndicator = !(0, EmptyObject_1.isEmptyObject)(result.allReportErrors) ? CONST_1.default.BRICK_ROAD_INDICATOR_STATUS.ERROR : '';
        result.pendingAction = report.pendingFields ? ((_d = report.pendingFields.addWorkspaceRoom) !== null && _d !== void 0 ? _d : report.pendingFields.createChat) : undefined;
        result.ownerAccountID = report.ownerAccountID;
        result.reportID = report.reportID;
        var chatReport = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report.chatReportID)];
        var oneTransactionThreadReportID = (0, ReportActionsUtils_1.getOneTransactionThreadReportID)(report, chatReport, allReportActions === null || allReportActions === void 0 ? void 0 : allReportActions["".concat(ONYXKEYS_1.default.COLLECTION.REPORT_ACTIONS).concat(report.reportID)]);
        var oneTransactionThreadReport = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(oneTransactionThreadReportID)];
        result.isUnread = (0, ReportUtils_1.isUnread)(report, oneTransactionThreadReport);
        result.isPinned = report.isPinned;
        result.iouReportID = report.iouReportID;
        result.keyForList = String(report.reportID);
        result.isWaitingOnBankAccount = report.isWaitingOnBankAccount;
        result.policyID = report.policyID;
        result.policyName = (0, ReportUtils_1.getPolicyName)({ report: report, returnEmptyIfNotFound: true });
        result.isSelfDM = (0, ReportUtils_1.isSelfDM)(report);
        result.notificationPreference = (0, ReportUtils_1.getReportNotificationPreference)(report);
        result.lastVisibleActionCreated = report.lastVisibleActionCreated;
        var visibleParticipantAccountIDs = (0, ReportUtils_1.getParticipantsAccountIDsForDisplay)(report, true);
        result.tooltipText = (0, ReportUtils_1.getReportParticipantsTitle)(visibleParticipantAccountIDs);
        hasMultipleParticipants = personalDetailList.length > 1 || result.isChatRoom || result.isPolicyExpenseChat || (0, ReportUtils_1.isGroupChat)(report);
        subtitle = (0, ReportUtils_1.getChatRoomSubtitle)(report, { isCreateExpenseFlow: true });
        var lastAction = lastVisibleReportActions[report.reportID];
        // lastActorAccountID can be an empty string
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        var lastActorAccountID = (lastAction === null || lastAction === void 0 ? void 0 : lastAction.actorAccountID) || report.lastActorAccountID;
        var lastActorDetails = lastActorAccountID ? ((_e = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[lastActorAccountID]) !== null && _e !== void 0 ? _e : null) : null;
        var lastActorDisplayName = getLastActorDisplayName(lastActorDetails);
        var lastMessageTextFromReport = getLastMessageTextForReport(report, lastActorDetails, undefined, !!result.private_isArchived);
        var lastMessageText = lastMessageTextFromReport;
        var shouldDisplayLastActorName = lastAction &&
            lastAction.actionName !== CONST_1.default.REPORT.ACTIONS.TYPE.REPORT_PREVIEW &&
            lastAction.actionName !== CONST_1.default.REPORT.ACTIONS.TYPE.IOU &&
            !(0, ReportUtils_1.isArchivedNonExpenseReport)(report, !!(reportNameValuePairs === null || reportNameValuePairs === void 0 ? void 0 : reportNameValuePairs.private_isArchived)) &&
            shouldShowLastActorDisplayName(report, lastActorDetails, lastAction);
        if (shouldDisplayLastActorName && lastActorDisplayName && lastMessageTextFromReport) {
            lastMessageText = "".concat(lastActorDisplayName, ": ").concat(lastMessageTextFromReport);
        }
        result.lastMessageText = lastMessageText;
        // If displaying chat preview line is needed, let's overwrite the default alternate text
        result.alternateText = showPersonalDetails && (personalDetail === null || personalDetail === void 0 ? void 0 : personalDetail.login) ? personalDetail.login : getAlternateText(result, { showChatPreviewLine: showChatPreviewLine, forcePolicyNamePreview: forcePolicyNamePreview });
        reportName = showPersonalDetails ? (0, ReportUtils_1.getDisplayNameForParticipant)({ accountID: accountIDs.at(0) }) || (0, LocalePhoneNumber_1.formatPhoneNumber)((_f = personalDetail === null || personalDetail === void 0 ? void 0 : personalDetail.login) !== null && _f !== void 0 ? _f : '') : (0, ReportUtils_1.getReportName)(report);
    }
    else {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        reportName = (0, ReportUtils_1.getDisplayNameForParticipant)({ accountID: accountIDs.at(0) }) || (0, LocalePhoneNumber_1.formatPhoneNumber)((_g = personalDetail === null || personalDetail === void 0 ? void 0 : personalDetail.login) !== null && _g !== void 0 ? _g : '');
        result.keyForList = String(accountIDs.at(0));
        result.alternateText = (0, LocalePhoneNumber_1.formatPhoneNumber)((_j = (_h = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[accountIDs[0]]) === null || _h === void 0 ? void 0 : _h.login) !== null && _j !== void 0 ? _j : '');
    }
    result.isIOUReportOwner = (0, ReportUtils_1.isIOUOwnedByCurrentUser)(result);
    result.iouReportAmount = (0, ReportUtils_1.getMoneyRequestSpendBreakdown)(result).totalDisplaySpend;
    if (!hasMultipleParticipants && (!report || (report && !(0, ReportUtils_1.isGroupChat)(report) && !(0, ReportUtils_1.isChatRoom)(report)))) {
        result.login = personalDetail === null || personalDetail === void 0 ? void 0 : personalDetail.login;
        result.accountID = Number(personalDetail === null || personalDetail === void 0 ? void 0 : personalDetail.accountID);
        result.phoneNumber = personalDetail === null || personalDetail === void 0 ? void 0 : personalDetail.phoneNumber;
    }
    result.text = reportName;
    result.icons = (0, ReportUtils_1.getIcons)(report, personalDetails, personalDetail === null || personalDetail === void 0 ? void 0 : personalDetail.avatar, personalDetail === null || personalDetail === void 0 ? void 0 : personalDetail.login, personalDetail === null || personalDetail === void 0 ? void 0 : personalDetail.accountID, null);
    result.subtitle = subtitle;
    return result;
}
/**
 * Get the option for a given report.
 */
function getReportOption(participant) {
    var _a;
    var report = (0, ReportUtils_1.getReportOrDraftReport)(participant.reportID);
    var visibleParticipantAccountIDs = (0, ReportUtils_1.getParticipantsAccountIDsForDisplay)(report, true);
    var option = createOption(visibleParticipantAccountIDs, allPersonalDetails !== null && allPersonalDetails !== void 0 ? allPersonalDetails : {}, !(0, EmptyObject_1.isEmptyObject)(report) ? report : undefined, {
        showChatPreviewLine: false,
        forcePolicyNamePreview: false,
    });
    // Update text & alternateText because createOption returns workspace name only if report is owned by the user
    if (option.isSelfDM) {
        option.alternateText = (0, Localize_1.translateLocal)('reportActionsView.yourSpace');
    }
    else if (option.isInvoiceRoom) {
        option.text = (0, ReportUtils_1.getReportName)(report);
        option.alternateText = (0, Localize_1.translateLocal)('workspace.common.invoices');
    }
    else {
        option.text = (0, ReportUtils_1.getPolicyName)({ report: report });
        option.alternateText = (0, Localize_1.translateLocal)('workspace.common.workspace');
        if (report === null || report === void 0 ? void 0 : report.policyID) {
            var policy = allPolicies === null || allPolicies === void 0 ? void 0 : allPolicies["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(report.policyID)];
            var submitToAccountID = (0, PolicyUtils_1.getSubmitToAccountID)(policy, report);
            var submitsToAccountDetails = allPersonalDetails === null || allPersonalDetails === void 0 ? void 0 : allPersonalDetails[submitToAccountID];
            var subtitle = (_a = submitsToAccountDetails === null || submitsToAccountDetails === void 0 ? void 0 : submitsToAccountDetails.displayName) !== null && _a !== void 0 ? _a : submitsToAccountDetails === null || submitsToAccountDetails === void 0 ? void 0 : submitsToAccountDetails.login;
            if (subtitle) {
                option.alternateText = (0, Localize_1.translateLocal)('iou.submitsTo', { name: subtitle !== null && subtitle !== void 0 ? subtitle : '' });
            }
        }
    }
    option.isDisabled = (0, ReportUtils_1.isDraftReport)(participant.reportID);
    option.selected = participant.selected;
    option.isSelected = participant.selected;
    option.brickRoadIndicator = null;
    return option;
}
/**
 * Get the display option for a given report.
 */
function getReportDisplayOption(report, unknownUserDetails) {
    var _a, _b;
    var visibleParticipantAccountIDs = (0, ReportUtils_1.getParticipantsAccountIDsForDisplay)(report, true);
    var option = createOption(visibleParticipantAccountIDs, allPersonalDetails !== null && allPersonalDetails !== void 0 ? allPersonalDetails : {}, !(0, EmptyObject_1.isEmptyObject)(report) ? report : undefined, {
        showChatPreviewLine: false,
        forcePolicyNamePreview: false,
    });
    // Update text & alternateText because createOption returns workspace name only if report is owned by the user
    if (option.isSelfDM) {
        option.alternateText = (0, Localize_1.translateLocal)('reportActionsView.yourSpace');
    }
    else if (option.isInvoiceRoom) {
        option.text = (0, ReportUtils_1.getReportName)(report);
        option.alternateText = (0, Localize_1.translateLocal)('workspace.common.invoices');
    }
    else if (unknownUserDetails && !option.text) {
        option.text = (_a = unknownUserDetails.text) !== null && _a !== void 0 ? _a : unknownUserDetails.login;
        option.alternateText = unknownUserDetails.login;
        option.participantsList = [__assign(__assign({}, unknownUserDetails), { displayName: unknownUserDetails.login, accountID: (_b = unknownUserDetails.accountID) !== null && _b !== void 0 ? _b : CONST_1.default.DEFAULT_NUMBER_ID })];
    }
    else if ((report === null || report === void 0 ? void 0 : report.ownerAccountID) !== 0 || !option.text) {
        option.text = (0, ReportUtils_1.getPolicyName)({ report: report });
        option.alternateText = (0, Localize_1.translateLocal)('workspace.common.workspace');
    }
    option.isDisabled = true;
    option.selected = false;
    option.isSelected = false;
    return option;
}
/**
 * Get the option for a policy expense report.
 */
function getPolicyExpenseReportOption(participant) {
    var _a;
    var expenseReport = (0, ReportUtils_1.isPolicyExpenseChat)(participant) ? (0, ReportUtils_1.getReportOrDraftReport)(participant.reportID) : null;
    var visibleParticipantAccountIDs = Object.entries((_a = expenseReport === null || expenseReport === void 0 ? void 0 : expenseReport.participants) !== null && _a !== void 0 ? _a : {})
        .filter(function (_a) {
        var reportParticipant = _a[1];
        return reportParticipant && !(0, ReportUtils_1.isHiddenForCurrentUser)(reportParticipant.notificationPreference);
    })
        .map(function (_a) {
        var accountID = _a[0];
        return Number(accountID);
    });
    var option = createOption(visibleParticipantAccountIDs, allPersonalDetails !== null && allPersonalDetails !== void 0 ? allPersonalDetails : {}, !(0, EmptyObject_1.isEmptyObject)(expenseReport) ? expenseReport : null, {
        showChatPreviewLine: false,
        forcePolicyNamePreview: false,
    });
    // Update text & alternateText because createOption returns workspace name only if report is owned by the user
    option.text = (0, ReportUtils_1.getPolicyName)({ report: expenseReport });
    option.alternateText = (0, Localize_1.translateLocal)('workspace.common.workspace');
    option.selected = participant.selected;
    option.isSelected = participant.selected;
    return option;
}
/**
 * Checks if the given userDetails is currentUser or not.
 * Note: We can't migrate this off of using logins because this is used to check if you're trying to start a chat with
 * yourself or a different user, and people won't be starting new chats via accountID usually.
 */
function isCurrentUser(userDetails) {
    var _a;
    if (!userDetails) {
        return false;
    }
    // If user login is a mobile number, append sms domain if not appended already.
    var userDetailsLogin = (0, PhoneNumber_1.addSMSDomainIfPhoneNumber)((_a = userDetails.login) !== null && _a !== void 0 ? _a : '');
    if ((currentUserLogin === null || currentUserLogin === void 0 ? void 0 : currentUserLogin.toLowerCase()) === userDetailsLogin.toLowerCase()) {
        return true;
    }
    // Check if userDetails login exists in loginList
    return Object.keys(loginList !== null && loginList !== void 0 ? loginList : {}).some(function (login) { return login.toLowerCase() === userDetailsLogin.toLowerCase(); });
}
function isDisablingOrDeletingLastEnabledCategory(policy, policyCategories, selectedCategories) {
    var enabledCategoriesCount = (0, CategoryUtils_1.getEnabledCategoriesCount)(policyCategories);
    if (!enabledCategoriesCount) {
        return false;
    }
    if ((policy === null || policy === void 0 ? void 0 : policy.requiresCategory) && selectedCategories.filter(function (selectedCategory) { return selectedCategory === null || selectedCategory === void 0 ? void 0 : selectedCategory.enabled; }).length === enabledCategoriesCount) {
        return true;
    }
    return false;
}
function isDisablingOrDeletingLastEnabledTag(policyTagList, selectedTags) {
    var enabledTagsCount = (0, PolicyUtils_1.getCountOfEnabledTagsOfList)(policyTagList === null || policyTagList === void 0 ? void 0 : policyTagList.tags);
    if (!enabledTagsCount) {
        return false;
    }
    if ((policyTagList === null || policyTagList === void 0 ? void 0 : policyTagList.required) && selectedTags.filter(function (selectedTag) { return selectedTag === null || selectedTag === void 0 ? void 0 : selectedTag.enabled; }).length === enabledTagsCount) {
        return true;
    }
    return false;
}
function isMakingLastRequiredTagListOptional(policy, policyTags, selectedTagLists) {
    var requiredTagsCount = (0, PolicyUtils_1.getCountOfRequiredTagLists)(policyTags);
    if (!requiredTagsCount) {
        return false;
    }
    if ((policy === null || policy === void 0 ? void 0 : policy.requiresTag) && selectedTagLists.filter(function (selectedTagList) { return selectedTagList === null || selectedTagList === void 0 ? void 0 : selectedTagList.required; }).length === requiredTagsCount) {
        return true;
    }
    return false;
}
function getSearchValueForPhoneOrEmail(searchTerm) {
    var _a, _b;
    var parsedPhoneNumber = (0, PhoneNumber_1.parsePhoneNumber)((0, LoginUtils_1.appendCountryCode)(expensify_common_1.Str.removeSMSDomain(searchTerm)));
    return parsedPhoneNumber.possible ? ((_b = (_a = parsedPhoneNumber.number) === null || _a === void 0 ? void 0 : _a.e164) !== null && _b !== void 0 ? _b : '') : searchTerm.toLowerCase();
}
/**
 * Verifies that there is at least one enabled option
 */
function hasEnabledOptions(options) {
    return Object.values(options).some(function (option) { return option.enabled && option.pendingAction !== CONST_1.default.RED_BRICK_ROAD_PENDING_ACTION.DELETE; });
}
/**
 * Checks if a report option is selected based on matching accountID or reportID.
 *
 * @param reportOption - The report option to be checked.
 * @param selectedOptions - Array of selected options to compare with.
 * @returns true if the report option matches any of the selected options by accountID or reportID, false otherwise.
 */
function isReportSelected(reportOption, selectedOptions) {
    if (!selectedOptions || selectedOptions.length === 0) {
        return false;
    }
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    return selectedOptions.some(function (option) { return (option.accountID && option.accountID === reportOption.accountID) || (option.reportID && option.reportID === reportOption.reportID); });
}
function processReport(report, personalDetails) {
    if (!report) {
        return { reportOption: null };
    }
    var isOneOnOneChat = (0, ReportUtils_1.isOneOnOneChat)(report);
    var accountIDs = (0, ReportUtils_1.getParticipantsAccountIDsForDisplay)(report);
    var isChatRoom = (0, ReportUtils_1.isChatRoom)(report);
    if ((!accountIDs || accountIDs.length === 0) && !isChatRoom) {
        return { reportOption: null };
    }
    // Determine if this report should be mapped to a personal detail
    var reportMapEntry = accountIDs.length <= 1 && isOneOnOneChat ? [accountIDs.at(0), report] : undefined;
    return {
        reportMapEntry: reportMapEntry,
        reportOption: __assign({ item: report }, createOption(accountIDs, personalDetails, report)),
    };
}
function createOptionList(personalDetails, reports) {
    var reportMapForAccountIDs = {};
    var allReportOptions = [];
    if (reports) {
        Object.values(reports).forEach(function (report) {
            var _a = processReport(report, personalDetails), reportMapEntry = _a.reportMapEntry, reportOption = _a.reportOption;
            if (reportMapEntry) {
                var accountID = reportMapEntry[0], reportValue = reportMapEntry[1];
                reportMapForAccountIDs[accountID] = reportValue;
            }
            if (reportOption) {
                allReportOptions.push(reportOption);
            }
        });
    }
    var allPersonalDetailsOptions = Object.values(personalDetails !== null && personalDetails !== void 0 ? personalDetails : {}).map(function (personalDetail) {
        var _a, _b;
        return (__assign({ item: personalDetail }, createOption([(_a = personalDetail === null || personalDetail === void 0 ? void 0 : personalDetail.accountID) !== null && _a !== void 0 ? _a : CONST_1.default.DEFAULT_NUMBER_ID], personalDetails, reportMapForAccountIDs[(_b = personalDetail === null || personalDetail === void 0 ? void 0 : personalDetail.accountID) !== null && _b !== void 0 ? _b : CONST_1.default.DEFAULT_NUMBER_ID], {
            showPersonalDetails: true,
        })));
    });
    return {
        reports: allReportOptions,
        personalDetails: allPersonalDetailsOptions,
    };
}
function createOptionFromReport(report, personalDetails) {
    var accountIDs = (0, ReportUtils_1.getParticipantsAccountIDsForDisplay)(report);
    return __assign({ item: report }, createOption(accountIDs, personalDetails, report));
}
function orderPersonalDetailsOptions(options) {
    // PersonalDetails should be ordered Alphabetically by default - https://github.com/Expensify/App/issues/8220#issuecomment-1104009435
    return (0, orderBy_1.default)(options, [function (personalDetail) { var _a; return (_a = personalDetail.text) === null || _a === void 0 ? void 0 : _a.toLowerCase(); }], 'asc');
}
/**
 * Orders report options without grouping them by kind.
 * Usually used when there is no search value
 */
function orderReportOptions(options) {
    return (0, orderBy_1.default)(options, [sortComparatorReportOptionByArchivedStatus, sortComparatorReportOptionByDate], ['asc', 'desc']);
}
var recentReportComparator = function (option) {
    var _a;
    return "".concat(option.private_isArchived ? 0 : 1, "_").concat((_a = option.lastVisibleActionCreated) !== null && _a !== void 0 ? _a : '');
};
exports.recentReportComparator = recentReportComparator;
function optionsOrderBy(options, limit, comparator, filter) {
    Timing_1.default.start(CONST_1.default.TIMING.SEARCH_MOST_RECENT_OPTIONS);
    var heap = new MinHeap_1.MinHeap(comparator);
    options.forEach(function (option) {
        if (filter && !filter(option)) {
            return;
        }
        if (heap.size() < limit) {
            heap.push(option);
            return;
        }
        var peekedValue = heap.peek();
        if (!peekedValue) {
            throw new Error('Heap is empty, cannot peek value');
        }
        if (comparator(option) > comparator(peekedValue)) {
            heap.pop();
            heap.push(option);
        }
    });
    Timing_1.default.end(CONST_1.default.TIMING.SEARCH_MOST_RECENT_OPTIONS);
    return __spreadArray([], heap, true).reverse();
}
/**
 * Ordering for report options when you have a search value, will order them by kind additionally.
 * @param options - list of options to be sorted
 * @param searchValue - search string
 * @returns a sorted list of options
 */
function orderReportOptionsWithSearch(options, searchValue, _a) {
    var _b = _a === void 0 ? {} : _a, _c = _b.preferChatRoomsOverThreads, preferChatRoomsOverThreads = _c === void 0 ? false : _c, _d = _b.preferPolicyExpenseChat, preferPolicyExpenseChat = _d === void 0 ? false : _d, _e = _b.preferRecentExpenseReports, preferRecentExpenseReports = _e === void 0 ? false : _e;
    var orderedByDate = orderReportOptions(options);
    return (0, orderBy_1.default)(orderedByDate, [
        // Sorting by kind:
        function (option) {
            if (option.isPolicyExpenseChat && preferPolicyExpenseChat && option.policyID === activePolicyID) {
                return 0;
            }
            if (option.isSelfDM) {
                return -1;
            }
            if (preferRecentExpenseReports && !!(option === null || option === void 0 ? void 0 : option.lastIOUCreationDate)) {
                return 1;
            }
            if (preferRecentExpenseReports && option.isPolicyExpenseChat) {
                return 1;
            }
            if (preferChatRoomsOverThreads && option.isThread) {
                return 4;
            }
            if (!!option.isChatRoom || option.private_isArchived) {
                return 3;
            }
            if (!option.login) {
                return 2;
            }
            if (option.login.toLowerCase() !== (searchValue === null || searchValue === void 0 ? void 0 : searchValue.toLowerCase())) {
                return 1;
            }
            // When option.login is an exact match with the search value, returning 0 puts it at the top of the option list
            return 0;
        },
        // For Submit Expense flow, prioritize the most recent expense reports and then policy expense chats (without expense requests)
        preferRecentExpenseReports ? function (option) { var _a; return (_a = option === null || option === void 0 ? void 0 : option.lastIOUCreationDate) !== null && _a !== void 0 ? _a : ''; } : '',
        preferRecentExpenseReports ? function (option) { return option === null || option === void 0 ? void 0 : option.isPolicyExpenseChat; } : 0,
    ], ['asc', 'desc', 'desc']);
}
function orderWorkspaceOptions(options) {
    return options.sort(function (a, b) {
        // Check if `a` is the default workspace
        if (a.isPolicyExpenseChat && a.policyID === activePolicyID) {
            return -1;
        }
        // Check if `b` is the default workspace
        if (b.isPolicyExpenseChat && b.policyID === activePolicyID) {
            return 1;
        }
        return 0;
    });
}
function sortComparatorReportOptionByArchivedStatus(option) {
    return option.private_isArchived ? 1 : 0;
}
function sortComparatorReportOptionByDate(options) {
    var _a;
    // If there is no date (ie. a personal detail option), the option will be sorted to the bottom
    // (comparing a dateString > '' returns true, and we are sorting descending, so the dateString will come before '')
    return (_a = options.lastVisibleActionCreated) !== null && _a !== void 0 ? _a : '';
}
function orderOptions(options, searchValue, config) {
    var _a;
    var orderedReportOptions;
    if (searchValue) {
        orderedReportOptions = orderReportOptionsWithSearch(options.recentReports, searchValue, config);
    }
    else {
        orderedReportOptions = orderReportOptions(options.recentReports);
    }
    var orderedPersonalDetailsOptions = orderPersonalDetailsOptions(options.personalDetails);
    var orderedWorkspaceChats = orderWorkspaceOptions((_a = options === null || options === void 0 ? void 0 : options.workspaceChats) !== null && _a !== void 0 ? _a : []);
    return {
        recentReports: orderedReportOptions,
        personalDetails: orderedPersonalDetailsOptions,
        workspaceChats: orderedWorkspaceChats,
    };
}
function canCreateOptimisticPersonalDetailOption(_a) {
    var recentReportOptions = _a.recentReportOptions, personalDetailsOptions = _a.personalDetailsOptions, currentUserOption = _a.currentUserOption, searchValue = _a.searchValue;
    if (recentReportOptions.length + personalDetailsOptions.length > 0) {
        return false;
    }
    if (!currentUserOption) {
        return true;
    }
    return currentUserOption.login !== (0, PhoneNumber_1.addSMSDomainIfPhoneNumber)(searchValue !== null && searchValue !== void 0 ? searchValue : '').toLowerCase() && currentUserOption.login !== (searchValue === null || searchValue === void 0 ? void 0 : searchValue.toLowerCase());
}
/**
 * We create a new user option if the following conditions are satisfied:
 * - There's no matching recent report and personal detail option
 * - The searchValue is a valid email or phone number
 * - If prop shouldAcceptName = true, the searchValue can be also a normal string
 * - The searchValue isn't the current personal detail login
 */
function getUserToInviteOption(_a) {
    var _b;
    var _c, _d;
    var searchValue = _a.searchValue, _e = _a.loginsToExclude, loginsToExclude = _e === void 0 ? {} : _e, _f = _a.selectedOptions, selectedOptions = _f === void 0 ? [] : _f, _g = _a.showChatPreviewLine, showChatPreviewLine = _g === void 0 ? false : _g, _h = _a.shouldAcceptName, shouldAcceptName = _h === void 0 ? false : _h;
    if (!searchValue) {
        return null;
    }
    var parsedPhoneNumber = (0, PhoneNumber_1.parsePhoneNumber)((0, LoginUtils_1.appendCountryCode)(expensify_common_1.Str.removeSMSDomain(searchValue)));
    var isCurrentUserLogin = isCurrentUser({ login: searchValue });
    var isInSelectedOption = selectedOptions.some(function (option) { return 'login' in option && option.login === searchValue; });
    var isValidEmail = expensify_common_1.Str.isValidEmail(searchValue) && !expensify_common_1.Str.isDomainEmail(searchValue) && !expensify_common_1.Str.endsWith(searchValue, CONST_1.default.SMS.DOMAIN);
    var isValidPhoneNumber = parsedPhoneNumber.possible && expensify_common_1.Str.isValidE164Phone((0, LoginUtils_1.getPhoneNumberWithoutSpecialChars)((_d = (_c = parsedPhoneNumber.number) === null || _c === void 0 ? void 0 : _c.input) !== null && _d !== void 0 ? _d : ''));
    var isInOptionToExclude = loginsToExclude[(0, PhoneNumber_1.addSMSDomainIfPhoneNumber)(searchValue).toLowerCase()];
    if (isCurrentUserLogin || isInSelectedOption || (!isValidEmail && !isValidPhoneNumber && !shouldAcceptName) || isInOptionToExclude) {
        return null;
    }
    // Generates an optimistic account ID for new users not yet saved in Onyx
    var optimisticAccountID = (0, UserUtils_1.generateAccountID)(searchValue);
    var personalDetailsExtended = __assign(__assign({}, allPersonalDetails), (_b = {}, _b[optimisticAccountID] = {
        accountID: optimisticAccountID,
        login: searchValue,
    }, _b));
    var userToInvite = createOption([optimisticAccountID], personalDetailsExtended, null, {
        showChatPreviewLine: showChatPreviewLine,
    });
    userToInvite.isOptimisticAccount = true;
    userToInvite.login = isValidEmail || isValidPhoneNumber ? searchValue : '';
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    userToInvite.text = userToInvite.text || searchValue;
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    userToInvite.alternateText = userToInvite.alternateText || searchValue;
    // If user doesn't exist, use a fallback avatar
    userToInvite.icons = [
        {
            source: Expensicons_1.FallbackAvatar,
            id: optimisticAccountID,
            name: searchValue,
            type: CONST_1.default.ICON_TYPE_AVATAR,
        },
    ];
    return userToInvite;
}
function getUserToInviteContactOption(_a) {
    var _b, _c;
    var _d = _a.searchValue, searchValue = _d === void 0 ? '' : _d, _e = _a.optionsToExclude, optionsToExclude = _e === void 0 ? [] : _e, _f = _a.selectedOptions, selectedOptions = _f === void 0 ? [] : _f, _g = _a.firstName, firstName = _g === void 0 ? '' : _g, _h = _a.lastName, lastName = _h === void 0 ? '' : _h, _j = _a.email, email = _j === void 0 ? '' : _j, _k = _a.phone, phone = _k === void 0 ? '' : _k, _l = _a.avatar, avatar = _l === void 0 ? '' : _l;
    // If email is provided, use it as the primary identifier
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    var effectiveSearchValue = email || searchValue;
    // Handle phone number parsing for either provided phone or searchValue
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    var phoneToCheck = phone || searchValue;
    var parsedPhoneNumber = (0, PhoneNumber_1.parsePhoneNumber)((0, LoginUtils_1.appendCountryCode)(expensify_common_1.Str.removeSMSDomain(phoneToCheck)));
    var isCurrentUserLogin = isCurrentUser({ login: effectiveSearchValue });
    var isInSelectedOption = selectedOptions.some(function (option) { return 'login' in option && option.login === effectiveSearchValue; });
    // Validate email (either provided email or searchValue)
    var isValidEmail = expensify_common_1.Str.isValidEmail(effectiveSearchValue) && !expensify_common_1.Str.isDomainEmail(effectiveSearchValue) && !expensify_common_1.Str.endsWith(effectiveSearchValue, CONST_1.default.SMS.DOMAIN);
    var isValidPhoneNumber = parsedPhoneNumber.possible && expensify_common_1.Str.isValidE164Phone((0, LoginUtils_1.getPhoneNumberWithoutSpecialChars)((_c = (_b = parsedPhoneNumber.number) === null || _b === void 0 ? void 0 : _b.input) !== null && _c !== void 0 ? _c : ''));
    var isInOptionToExclude = optionsToExclude.findIndex(function (optionToExclude) { return 'login' in optionToExclude && optionToExclude.login === (0, PhoneNumber_1.addSMSDomainIfPhoneNumber)(effectiveSearchValue).toLowerCase(); }) !== -1;
    if (!effectiveSearchValue || isCurrentUserLogin || isInSelectedOption || (!isValidEmail && !isValidPhoneNumber) || isInOptionToExclude) {
        return null;
    }
    // Generates an optimistic account ID for new users not yet saved in Onyx
    var optimisticAccountID = (0, UserUtils_1.generateAccountID)(effectiveSearchValue);
    // Construct display name if firstName/lastName are provided
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    var displayName = firstName && lastName ? "".concat(firstName, " ").concat(lastName) : firstName || lastName || effectiveSearchValue;
    // Create the base user details that will be used in both item and participantsList
    var userDetails = {
        accountID: optimisticAccountID,
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        avatar: avatar || Expensicons_1.FallbackAvatar,
        firstName: firstName !== null && firstName !== void 0 ? firstName : '',
        lastName: lastName !== null && lastName !== void 0 ? lastName : '',
        displayName: displayName,
        login: effectiveSearchValue,
        pronouns: '',
        phoneNumber: phone !== null && phone !== void 0 ? phone : '',
        validated: true,
    };
    var userToInvite = {
        item: userDetails,
        text: displayName,
        alternateText: displayName !== effectiveSearchValue ? effectiveSearchValue : undefined,
        brickRoadIndicator: null,
        icons: [
            {
                source: userDetails.avatar,
                type: CONST_1.default.ICON_TYPE_AVATAR,
                name: effectiveSearchValue,
                id: optimisticAccountID,
            },
        ],
        tooltipText: null,
        participantsList: [userDetails],
        accountID: optimisticAccountID,
        login: effectiveSearchValue,
        reportID: '',
        phoneNumber: phone !== null && phone !== void 0 ? phone : '',
        hasDraftComment: false,
        keyForList: optimisticAccountID.toString(),
        isDefaultRoom: false,
        isPinned: false,
        isWaitingOnBankAccount: false,
        isIOUReportOwner: false,
        iouReportAmount: 0,
        isChatRoom: false,
        shouldShowSubscript: false,
        isPolicyExpenseChat: false,
        isOwnPolicyExpenseChat: false,
        isExpenseReport: false,
        lastMessageText: '',
        isBold: true,
        isOptimisticAccount: true,
    };
    return userToInvite;
}
function getValidReports(reports, config) {
    var _a, _b, _c;
    var _d = config.betas, betas = _d === void 0 ? [] : _d, _e = config.includeMultipleParticipantReports, includeMultipleParticipantReports = _e === void 0 ? false : _e, _f = config.showChatPreviewLine, showChatPreviewLine = _f === void 0 ? false : _f, _g = config.forcePolicyNamePreview, forcePolicyNamePreview = _g === void 0 ? false : _g, _h = config.includeOwnedWorkspaceChats, includeOwnedWorkspaceChats = _h === void 0 ? false : _h, _j = config.includeThreads, includeThreads = _j === void 0 ? false : _j, _k = config.includeTasks, includeTasks = _k === void 0 ? false : _k, _l = config.includeMoneyRequests, includeMoneyRequests = _l === void 0 ? false : _l, _m = config.includeReadOnly, includeReadOnly = _m === void 0 ? true : _m, _o = config.transactionViolations, transactionViolations = _o === void 0 ? {} : _o, _p = config.includeSelfDM, includeSelfDM = _p === void 0 ? false : _p, _q = config.includeInvoiceRooms, includeInvoiceRooms = _q === void 0 ? false : _q, action = config.action, _r = config.selectedOptions, selectedOptions = _r === void 0 ? [] : _r, _s = config.includeP2P, includeP2P = _s === void 0 ? true : _s, _t = config.includeDomainEmail, includeDomainEmail = _t === void 0 ? false : _t, _u = config.shouldBoldTitleByDefault, shouldBoldTitleByDefault = _u === void 0 ? true : _u, _v = config.loginsToExclude, loginsToExclude = _v === void 0 ? {} : _v, shouldSeparateSelfDMChat = config.shouldSeparateSelfDMChat, shouldSeparateWorkspaceChat = config.shouldSeparateWorkspaceChat, excludeNonAdminWorkspaces = config.excludeNonAdminWorkspaces, _w = config.isPerDiemRequest, isPerDiemRequest = _w === void 0 ? false : _w, _x = config.showRBR, showRBR = _x === void 0 ? true : _x;
    var topmostReportId = Navigation_1.default.getTopmostReportId();
    var validReportOptions = [];
    var workspaceChats = [];
    var selfDMChat;
    var preferRecentExpenseReports = action === CONST_1.default.IOU.ACTION.CREATE;
    for (var i = 0; i < reports.length; i++) {
        // eslint-disable-next-line rulesdir/prefer-at
        var option = reports[i];
        var report = option.item;
        var chatReport = allReports === null || allReports === void 0 ? void 0 : allReports["".concat(ONYXKEYS_1.default.COLLECTION.REPORT).concat(report.chatReportID)];
        var doesReportHaveViolations = (0, ReportUtils_1.shouldDisplayViolationsRBRInLHN)(report, transactionViolations);
        var shouldBeInOptionList = (0, ReportUtils_1.shouldReportBeInOptionList)({
            report: report,
            chatReport: chatReport,
            currentReportId: topmostReportId,
            betas: betas,
            doesReportHaveViolations: doesReportHaveViolations,
            isInFocusMode: false,
            excludeEmptyChats: false,
            includeSelfDM: includeSelfDM,
            login: option.login,
            includeDomainEmail: includeDomainEmail,
            isReportArchived: !!option.private_isArchived,
        });
        if (!shouldBeInOptionList) {
            continue;
        }
        var isThread = option.isThread;
        var isTaskReport = option.isTaskReport;
        var isPolicyExpenseChat = option.isPolicyExpenseChat;
        var isMoneyRequestReport = option.isMoneyRequestReport;
        var isSelfDM = option.isSelfDM;
        var isChatRoom = option.isChatRoom;
        var accountIDs = (0, ReportUtils_1.getParticipantsAccountIDsForDisplay)(report);
        if (excludeNonAdminWorkspaces && !(0, ReportUtils_1.isPolicyAdmin)(option.policyID, policies)) {
            continue;
        }
        if (isPolicyExpenseChat && report.isOwnPolicyExpenseChat && !includeOwnedWorkspaceChats) {
            continue;
        }
        // When passing includeP2P false we are trying to hide features from users that are not ready for P2P and limited to expense chats only.
        if (!includeP2P && !isPolicyExpenseChat) {
            continue;
        }
        if (isSelfDM && !includeSelfDM) {
            continue;
        }
        if (isThread && !includeThreads) {
            continue;
        }
        if (isTaskReport && !includeTasks) {
            continue;
        }
        if (isMoneyRequestReport && !includeMoneyRequests) {
            continue;
        }
        if (!(0, ReportUtils_1.canUserPerformWriteAction)(report) && !includeReadOnly) {
            continue;
        }
        // In case user needs to add credit bank account, don't allow them to submit an expense from the workspace.
        if (includeOwnedWorkspaceChats && (0, ReportUtils_1.hasIOUWaitingOnCurrentUserBankAccount)(report)) {
            continue;
        }
        if ((!accountIDs || accountIDs.length === 0) && !isChatRoom) {
            continue;
        }
        if (option.login === CONST_1.default.EMAIL.NOTIFICATIONS) {
            continue;
        }
        var isCurrentUserOwnedPolicyExpenseChatThatCouldShow = option.isPolicyExpenseChat && option.ownerAccountID === currentUserAccountID && includeOwnedWorkspaceChats && !option.private_isArchived;
        var shouldShowInvoiceRoom = includeInvoiceRooms && (0, ReportUtils_1.isInvoiceRoom)(option.item) && (0, ReportUtils_1.isPolicyAdmin)(option.policyID, policies) && !option.private_isArchived && (0, PolicyUtils_1.canSendInvoiceFromWorkspace)(option.policyID);
        /*
        Exclude the report option if it doesn't meet any of the following conditions:
        - It is not an owned policy expense chat that could be shown
        - Multiple participant reports are not included
        - It doesn't have a login
        - It is not an invoice room that should be shown
        */
        if (!isCurrentUserOwnedPolicyExpenseChatThatCouldShow && !includeMultipleParticipantReports && !option.login && !shouldShowInvoiceRoom) {
            continue;
        }
        // If we're excluding threads, check the report to see if it has a single participant and if the participant is already selected
        if (!includeThreads && ((!!option.login && loginsToExclude[option.login]) || loginsToExclude[option.reportID])) {
            continue;
        }
        if (action === CONST_1.default.IOU.ACTION.CATEGORIZE) {
            var reportPolicy = allPolicies === null || allPolicies === void 0 ? void 0 : allPolicies["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(option.policyID)];
            if (!(reportPolicy === null || reportPolicy === void 0 ? void 0 : reportPolicy.areCategoriesEnabled)) {
                continue;
            }
        }
        /**
         * By default, generated options does not have the chat preview line enabled.
         * If showChatPreviewLine or forcePolicyNamePreview are true, let's generate and overwrite the alternate text.
         */
        var alternateText = getAlternateText(option, { showChatPreviewLine: showChatPreviewLine, forcePolicyNamePreview: forcePolicyNamePreview });
        var isSelected = isReportSelected(option, selectedOptions);
        var isBold = shouldBoldTitleByDefault || shouldUseBoldText(option);
        var lastIOUCreationDate = void 0;
        // Add a field to sort the recent reports by the time of last IOU request for create actions
        if (preferRecentExpenseReports) {
            var reportPreviewAction = (_a = allSortedReportActions[option.reportID]) === null || _a === void 0 ? void 0 : _a.find(function (reportAction) { return (0, ReportActionsUtils_1.isActionOfType)(reportAction, CONST_1.default.REPORT.ACTIONS.TYPE.REPORT_PREVIEW); });
            if (reportPreviewAction) {
                var iouReportID = (0, ReportActionsUtils_1.getIOUReportIDFromReportActionPreview)(reportPreviewAction);
                var iouReportActions = iouReportID ? ((_b = allSortedReportActions[iouReportID]) !== null && _b !== void 0 ? _b : []) : [];
                var lastIOUAction = iouReportActions.find(function (iouAction) { return iouAction.actionName === CONST_1.default.REPORT.ACTIONS.TYPE.IOU; });
                if (lastIOUAction) {
                    lastIOUCreationDate = lastIOUAction.lastModified;
                }
            }
        }
        var newReportOption = __assign(__assign({}, option), { alternateText: alternateText, isSelected: isSelected, isBold: isBold, lastIOUCreationDate: lastIOUCreationDate, brickRoadIndicator: showRBR ? option.brickRoadIndicator : null });
        if (shouldSeparateWorkspaceChat && newReportOption.isOwnPolicyExpenseChat && !newReportOption.private_isArchived) {
            newReportOption.text = (0, ReportUtils_1.getPolicyName)({ report: report });
            newReportOption.alternateText = (0, Localize_1.translateLocal)('workspace.common.workspace');
            if (report === null || report === void 0 ? void 0 : report.policyID) {
                var policy = allPolicies === null || allPolicies === void 0 ? void 0 : allPolicies["".concat(ONYXKEYS_1.default.COLLECTION.POLICY).concat(report.policyID)];
                var submitToAccountID = (0, PolicyUtils_1.getSubmitToAccountID)(policy, report);
                var submitsToAccountDetails = allPersonalDetails === null || allPersonalDetails === void 0 ? void 0 : allPersonalDetails[submitToAccountID];
                var subtitle = (_c = submitsToAccountDetails === null || submitsToAccountDetails === void 0 ? void 0 : submitsToAccountDetails.displayName) !== null && _c !== void 0 ? _c : submitsToAccountDetails === null || submitsToAccountDetails === void 0 ? void 0 : submitsToAccountDetails.login;
                if (subtitle) {
                    newReportOption.alternateText = (0, Localize_1.translateLocal)('iou.submitsTo', { name: subtitle !== null && subtitle !== void 0 ? subtitle : '' });
                }
                var canSubmitPerDiemExpense = (0, PolicyUtils_1.canSubmitPerDiemExpenseFromWorkspace)(policy);
                if (!canSubmitPerDiemExpense && isPerDiemRequest) {
                    continue;
                }
            }
            workspaceChats.push(newReportOption);
        }
        else if (shouldSeparateSelfDMChat && newReportOption.isSelfDM) {
            selfDMChat = newReportOption;
        }
        else {
            validReportOptions.push(newReportOption);
        }
    }
    return {
        recentReports: validReportOptions,
        workspaceOptions: workspaceChats,
        selfDMOption: selfDMChat,
    };
}
/**
 * Whether user submitted already an expense or scanned receipt
 */
function getIsUserSubmittedExpenseOrScannedReceipt() {
    return !!(nvpDismissedProductTraining === null || nvpDismissedProductTraining === void 0 ? void 0 : nvpDismissedProductTraining[CONST_1.default.PRODUCT_TRAINING_TOOLTIP_NAMES.SCAN_TEST_TOOLTIP]);
}
/**
 * Whether the report is a Manager McTest report
 */
function isManagerMcTestReport(report) {
    var _a, _b;
    return (_b = (_a = report.participantsList) === null || _a === void 0 ? void 0 : _a.some(function (participant) { return participant.accountID === CONST_1.default.ACCOUNT_ID.MANAGER_MCTEST; })) !== null && _b !== void 0 ? _b : false;
}
function getValidPersonalDetailOptions(options, _a) {
    var _b = _a.loginsToExclude, loginsToExclude = _b === void 0 ? {} : _b, _c = _a.includeDomainEmail, includeDomainEmail = _c === void 0 ? false : _c, _d = _a.shouldBoldTitleByDefault, shouldBoldTitleByDefault = _d === void 0 ? false : _d, currentUserRef = _a.currentUserRef;
    var personalDetailsOptions = [];
    for (var i = 0; i < options.length; i++) {
        // eslint-disable-next-line rulesdir/prefer-at
        var detail = options[i];
        if (!(detail === null || detail === void 0 ? void 0 : detail.login) ||
            !detail.accountID ||
            !!(detail === null || detail === void 0 ? void 0 : detail.isOptimisticPersonalDetail) ||
            (!includeDomainEmail && expensify_common_1.Str.isDomainEmail(detail.login)) ||
            // Exclude the setup specialist from the list of personal details as it's a fallback if guide is not assigned
            (detail === null || detail === void 0 ? void 0 : detail.login) === CONST_1.default.SETUP_SPECIALIST_LOGIN) {
            continue;
        }
        if (currentUserRef && !!currentUserLogin && detail.login === currentUserLogin) {
            // eslint-disable-next-line no-param-reassign
            currentUserRef.current = detail;
        }
        if (loginsToExclude[detail.login]) {
            continue;
        }
        detail.isBold = shouldBoldTitleByDefault;
        personalDetailsOptions.push(detail);
    }
    return personalDetailsOptions;
}
/**
 * Returns a list of logins that should be restricted (i.e., hidden or excluded in the UI)
 * based on dynamic business logic and feature flags.
 * Centralizes restriction logic to avoid scattering conditions across the codebase.
 */
function getRestrictedLogins(config, options, canShowManagerMcTest) {
    var _a;
    var userHasReportWithManagerMcTest = Object.values(options.reports).some(function (report) { return isManagerMcTestReport(report); });
    return _a = {},
        _a[CONST_1.default.EMAIL.MANAGER_MCTEST] = !canShowManagerMcTest ||
            (getIsUserSubmittedExpenseOrScannedReceipt() && !userHasReportWithManagerMcTest) ||
            !Permissions_1.default.isBetaEnabled(CONST_1.default.BETAS.NEWDOT_MANAGER_MCTEST, config.betas) ||
            (0, PolicyUtils_1.isUserInvitedToWorkspace)(),
        _a;
}
/**
 * Options are reports and personal details. This function filters out the options that are not valid to be displayed.
 */
function getValidOptions(options, _a) {
    var _b, _c;
    if (_a === void 0) { _a = {}; }
    var _d = _a.excludeLogins, excludeLogins = _d === void 0 ? {} : _d, _e = _a.includeSelectedOptions, includeSelectedOptions = _e === void 0 ? false : _e, _f = _a.includeRecentReports, includeRecentReports = _f === void 0 ? true : _f, recentAttendees = _a.recentAttendees, _g = _a.selectedOptions, selectedOptions = _g === void 0 ? [] : _g, _h = _a.shouldSeparateSelfDMChat, shouldSeparateSelfDMChat = _h === void 0 ? false : _h, _j = _a.shouldSeparateWorkspaceChat, shouldSeparateWorkspaceChat = _j === void 0 ? false : _j, _k = _a.excludeHiddenThreads, excludeHiddenThreads = _k === void 0 ? false : _k, _l = _a.canShowManagerMcTest, canShowManagerMcTest = _l === void 0 ? false : _l, config = __rest(_a, ["excludeLogins", "includeSelectedOptions", "includeRecentReports", "recentAttendees", "selectedOptions", "shouldSeparateSelfDMChat", "shouldSeparateWorkspaceChat", "excludeHiddenThreads", "canShowManagerMcTest"]);
    var restrictedLogins = getRestrictedLogins(config, options, canShowManagerMcTest);
    // Gather shared configs:
    var loginsToExclude = __assign(__assign((_b = {}, _b[CONST_1.default.EMAIL.NOTIFICATIONS] = true, _b), excludeLogins), restrictedLogins);
    // If we're including selected options from the search results, we only want to exclude them if the search input is empty
    // This is because on certain pages, we show the selected options at the top when the search input is empty
    // This prevents the issue of seeing the selected option twice if you have them as a recent chat and select them
    if (!includeSelectedOptions) {
        selectedOptions.forEach(function (option) {
            if (!option.login) {
                return;
            }
            loginsToExclude[option.login] = true;
        });
    }
    var _m = config.includeP2P, includeP2P = _m === void 0 ? true : _m, _o = config.shouldBoldTitleByDefault, shouldBoldTitleByDefault = _o === void 0 ? true : _o, _p = config.includeDomainEmail, includeDomainEmail = _p === void 0 ? false : _p, getValidReportsConfig = __rest(config, ["includeP2P", "shouldBoldTitleByDefault", "includeDomainEmail"]);
    // Get valid recent reports:
    var recentReportOptions = [];
    var workspaceChats = [];
    var selfDMChat;
    if (includeRecentReports) {
        var _q = getValidReports(options.reports, __assign(__assign({}, getValidReportsConfig), { includeP2P: includeP2P, includeDomainEmail: includeDomainEmail, selectedOptions: selectedOptions, loginsToExclude: loginsToExclude, shouldBoldTitleByDefault: shouldBoldTitleByDefault, shouldSeparateSelfDMChat: shouldSeparateSelfDMChat, shouldSeparateWorkspaceChat: shouldSeparateWorkspaceChat })), recentReports = _q.recentReports, workspaceOptions = _q.workspaceOptions, selfDMOption = _q.selfDMOption;
        recentReportOptions = recentReports;
        workspaceChats = workspaceOptions;
        selfDMChat = selfDMOption;
    }
    else if (recentAttendees && (recentAttendees === null || recentAttendees === void 0 ? void 0 : recentAttendees.length) > 0) {
        recentAttendees.filter(function (attendee) {
            var _a;
            var login = (_a = attendee.login) !== null && _a !== void 0 ? _a : attendee.displayName;
            if (login) {
                loginsToExclude[login] = true;
                return true;
            }
            return false;
        });
        recentReportOptions = recentAttendees;
    }
    // Get valid personal details and check if we can find the current user:
    var personalDetailsOptions = [];
    var currentUserRef = {
        current: undefined,
    };
    if (includeP2P) {
        var personalDetailLoginsToExclude = loginsToExclude;
        if (currentUserLogin) {
            personalDetailLoginsToExclude = __assign(__assign({}, loginsToExclude), (_c = {}, _c[currentUserLogin] = !config.includeCurrentUser, _c));
        }
        personalDetailsOptions = getValidPersonalDetailOptions(options.personalDetails, {
            loginsToExclude: personalDetailLoginsToExclude,
            shouldBoldTitleByDefault: shouldBoldTitleByDefault,
            includeDomainEmail: includeDomainEmail,
            currentUserRef: currentUserRef,
        });
    }
    if (excludeHiddenThreads) {
        recentReportOptions = recentReportOptions.filter(function (option) { return !option.isThread || option.notificationPreference !== CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.HIDDEN; });
    }
    return {
        personalDetails: personalDetailsOptions,
        recentReports: recentReportOptions,
        currentUserOption: currentUserRef.current,
        // User to invite is generated by the search input of a user.
        // As this function isn't concerned with any search input yet, this is null (will be set when using filterOptions).
        userToInvite: null,
        workspaceChats: workspaceChats,
        selfDMChat: selfDMChat,
    };
}
/**
 * Build the options for the Search view
 */
function getSearchOptions(options, betas, isUsedInChatFinder, includeReadOnly) {
    if (betas === void 0) { betas = []; }
    if (isUsedInChatFinder === void 0) { isUsedInChatFinder = true; }
    if (includeReadOnly === void 0) { includeReadOnly = true; }
    Timing_1.default.start(CONST_1.default.TIMING.LOAD_SEARCH_OPTIONS);
    Performance_1.default.markStart(CONST_1.default.TIMING.LOAD_SEARCH_OPTIONS);
    var optionList = getValidOptions(options, {
        betas: betas,
        includeRecentReports: true,
        includeMultipleParticipantReports: true,
        showChatPreviewLine: isUsedInChatFinder,
        includeP2P: true,
        includeOwnedWorkspaceChats: true,
        includeThreads: true,
        includeMoneyRequests: true,
        includeTasks: true,
        includeReadOnly: includeReadOnly,
        includeSelfDM: true,
        shouldBoldTitleByDefault: !isUsedInChatFinder,
        excludeHiddenThreads: true,
    });
    Timing_1.default.end(CONST_1.default.TIMING.LOAD_SEARCH_OPTIONS);
    Performance_1.default.markEnd(CONST_1.default.TIMING.LOAD_SEARCH_OPTIONS);
    return optionList;
}
function getShareLogOptions(options, betas) {
    if (betas === void 0) { betas = []; }
    return getValidOptions(options, {
        betas: betas,
        includeMultipleParticipantReports: true,
        includeP2P: true,
        forcePolicyNamePreview: true,
        includeOwnedWorkspaceChats: true,
        includeSelfDM: true,
        includeThreads: true,
        includeReadOnly: false,
    });
}
/**
 * Build the IOUConfirmation options for showing the payee personalDetail
 */
function getIOUConfirmationOptionsFromPayeePersonalDetail(personalDetail, amountText) {
    var _a, _b, _c, _d, _e, _f;
    var login = (_a = personalDetail === null || personalDetail === void 0 ? void 0 : personalDetail.login) !== null && _a !== void 0 ? _a : '';
    return {
        text: (0, LocalePhoneNumber_1.formatPhoneNumber)((0, PersonalDetailsUtils_1.getDisplayNameOrDefault)(personalDetail, login)),
        alternateText: (0, LocalePhoneNumber_1.formatPhoneNumber)(login || (0, PersonalDetailsUtils_1.getDisplayNameOrDefault)(personalDetail, '', false)),
        icons: [
            {
                source: (_b = personalDetail === null || personalDetail === void 0 ? void 0 : personalDetail.avatar) !== null && _b !== void 0 ? _b : Expensicons_1.FallbackAvatar,
                name: (_c = personalDetail === null || personalDetail === void 0 ? void 0 : personalDetail.login) !== null && _c !== void 0 ? _c : '',
                type: CONST_1.default.ICON_TYPE_AVATAR,
                id: personalDetail === null || personalDetail === void 0 ? void 0 : personalDetail.accountID,
            },
        ],
        descriptiveText: amountText !== null && amountText !== void 0 ? amountText : '',
        login: (_d = personalDetail === null || personalDetail === void 0 ? void 0 : personalDetail.login) !== null && _d !== void 0 ? _d : '',
        accountID: (_e = personalDetail === null || personalDetail === void 0 ? void 0 : personalDetail.accountID) !== null && _e !== void 0 ? _e : CONST_1.default.DEFAULT_NUMBER_ID,
        keyForList: String((_f = personalDetail === null || personalDetail === void 0 ? void 0 : personalDetail.accountID) !== null && _f !== void 0 ? _f : CONST_1.default.DEFAULT_NUMBER_ID),
        isInteractive: false,
    };
}
function getAttendeeOptions(reports, personalDetails, betas, attendees, recentAttendees, includeOwnedWorkspaceChats, includeP2P, includeInvoiceRooms, action) {
    var _a, _b, _c, _d;
    if (includeOwnedWorkspaceChats === void 0) { includeOwnedWorkspaceChats = false; }
    if (includeP2P === void 0) { includeP2P = true; }
    if (includeInvoiceRooms === void 0) { includeInvoiceRooms = false; }
    if (action === void 0) { action = undefined; }
    var personalDetailList = (0, keyBy_1.default)(personalDetails.map(function (_a) {
        var item = _a.item;
        return item;
    }), 'accountID');
    var recentAttendeeHasCurrentUser = recentAttendees.find(function (attendee) { return attendee.email === currentUserLogin || attendee.login === currentUserLogin; });
    if (!recentAttendeeHasCurrentUser && currentUserLogin) {
        var details = (0, PersonalDetailsUtils_1.getPersonalDetailByEmail)(currentUserLogin);
        recentAttendees.push({
            email: currentUserLogin,
            login: currentUserLogin,
            displayName: (_a = details === null || details === void 0 ? void 0 : details.displayName) !== null && _a !== void 0 ? _a : currentUserLogin,
            accountID: currentUserAccountID,
            text: (_b = details === null || details === void 0 ? void 0 : details.displayName) !== null && _b !== void 0 ? _b : currentUserLogin,
            searchText: (_c = details === null || details === void 0 ? void 0 : details.displayName) !== null && _c !== void 0 ? _c : currentUserLogin,
            avatarUrl: (_d = details === null || details === void 0 ? void 0 : details.avatarThumbnail) !== null && _d !== void 0 ? _d : '',
        });
    }
    var filteredRecentAttendees = recentAttendees
        .filter(function (attendee) { return !attendees.find(function (_a) {
        var email = _a.email, displayName = _a.displayName;
        return (attendee.email ? email === attendee.email : displayName === attendee.displayName);
    }); })
        .map(function (attendee) {
        var _a;
        return (__assign(__assign(__assign({}, attendee), { login: (_a = attendee.email) !== null && _a !== void 0 ? _a : attendee.displayName }), (0, PersonalDetailsUtils_1.getPersonalDetailByEmail)(attendee.email)));
    })
        .map(function (attendee) { return getParticipantsOption(attendee, personalDetailList); });
    return getValidOptions({ reports: reports, personalDetails: personalDetails }, {
        betas: betas,
        selectedOptions: attendees.map(function (attendee) { return (__assign(__assign({}, attendee), { login: attendee.email })); }),
        excludeLogins: CONST_1.default.EXPENSIFY_EMAILS_OBJECT,
        includeOwnedWorkspaceChats: includeOwnedWorkspaceChats,
        includeRecentReports: false,
        includeP2P: includeP2P,
        includeSelectedOptions: false,
        includeSelfDM: false,
        includeInvoiceRooms: includeInvoiceRooms,
        action: action,
        recentAttendees: filteredRecentAttendees,
    });
}
/**
 * Build the options for the Share Destination for a Task
 */
function getShareDestinationOptions(reports, personalDetails, betas, selectedOptions, excludeLogins, includeOwnedWorkspaceChats) {
    if (reports === void 0) { reports = []; }
    if (personalDetails === void 0) { personalDetails = []; }
    if (betas === void 0) { betas = []; }
    if (selectedOptions === void 0) { selectedOptions = []; }
    if (excludeLogins === void 0) { excludeLogins = {}; }
    if (includeOwnedWorkspaceChats === void 0) { includeOwnedWorkspaceChats = true; }
    return getValidOptions({ reports: reports, personalDetails: personalDetails }, {
        betas: betas,
        selectedOptions: selectedOptions,
        includeMultipleParticipantReports: true,
        showChatPreviewLine: true,
        forcePolicyNamePreview: true,
        includeThreads: true,
        includeMoneyRequests: true,
        includeTasks: true,
        excludeLogins: excludeLogins,
        includeOwnedWorkspaceChats: includeOwnedWorkspaceChats,
        includeSelfDM: true,
    });
}
/**
 * Format personalDetails or userToInvite to be shown in the list
 *
 * @param member - personalDetails or userToInvite
 * @param config - keys to overwrite the default values
 */
function formatMemberForList(member) {
    var _a, _b, _c;
    var accountID = member.accountID;
    return {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        text: member.text || member.displayName || '',
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        alternateText: member.alternateText || member.login || '',
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        keyForList: member.keyForList || String(accountID !== null && accountID !== void 0 ? accountID : CONST_1.default.DEFAULT_NUMBER_ID) || '',
        isSelected: (_a = member.isSelected) !== null && _a !== void 0 ? _a : false,
        isDisabled: (_b = member.isDisabled) !== null && _b !== void 0 ? _b : false,
        accountID: accountID,
        login: (_c = member.login) !== null && _c !== void 0 ? _c : '',
        icons: member.icons,
        pendingAction: member.pendingAction,
        reportID: member.reportID,
    };
}
/**
 * Build the options for the Workspace Member Invite view
 */
function getMemberInviteOptions(personalDetails, betas, excludeLogins, includeSelectedOptions, reports, includeRecentReports) {
    if (betas === void 0) { betas = []; }
    if (excludeLogins === void 0) { excludeLogins = {}; }
    if (includeSelectedOptions === void 0) { includeSelectedOptions = false; }
    if (reports === void 0) { reports = []; }
    if (includeRecentReports === void 0) { includeRecentReports = false; }
    var options = getValidOptions({ reports: reports, personalDetails: personalDetails }, {
        betas: betas,
        includeP2P: true,
        excludeLogins: excludeLogins,
        includeSelectedOptions: includeSelectedOptions,
        includeRecentReports: includeRecentReports,
    });
    var orderedOptions = orderOptions(options);
    return __assign(__assign({}, options), { personalDetails: orderedOptions.personalDetails, recentReports: orderedOptions.recentReports });
}
/**
 * Helper method that returns the text to be used for the header's message and title (if any)
 */
function getHeaderMessage(hasSelectableOptions, hasUserToInvite, searchValue, hasMatchedParticipant) {
    if (hasMatchedParticipant === void 0) { hasMatchedParticipant = false; }
    var isValidPhone = (0, PhoneNumber_1.parsePhoneNumber)((0, LoginUtils_1.appendCountryCode)(searchValue)).possible;
    var isValidEmail = expensify_common_1.Str.isValidEmail(searchValue);
    if (searchValue && CONST_1.default.REGEX.DIGITS_AND_PLUS.test(searchValue) && !isValidPhone && !hasSelectableOptions) {
        return (0, Localize_1.translateLocal)('messages.errorMessageInvalidPhone');
    }
    // Without a search value, it would be very confusing to see a search validation message.
    // Therefore, this skips the validation when there is no search value.
    if (searchValue && !hasSelectableOptions && !hasUserToInvite) {
        if (/^\d+$/.test(searchValue) && !isValidPhone) {
            return (0, Localize_1.translateLocal)('messages.errorMessageInvalidPhone');
        }
        if (/@/.test(searchValue) && !isValidEmail) {
            return (0, Localize_1.translateLocal)('messages.errorMessageInvalidEmail');
        }
        if (hasMatchedParticipant && (isValidEmail || isValidPhone)) {
            return '';
        }
        return (0, Localize_1.translateLocal)('common.noResultsFound');
    }
    return '';
}
/**
 * Helper method for non-user lists (eg. categories and tags) that returns the text to be used for the header's message and title (if any)
 */
function getHeaderMessageForNonUserList(hasSelectableOptions, searchValue) {
    if (searchValue && !hasSelectableOptions) {
        return (0, Localize_1.translateLocal)('common.noResultsFound');
    }
    return '';
}
/**
 * Helper method to check whether an option can show tooltip or not
 */
function shouldOptionShowTooltip(option) {
    return !option.private_isArchived;
}
/**
 * Handles the logic for displaying selected participants from the search term
 */
function formatSectionsFromSearchTerm(searchTerm, selectedOptions, filteredRecentReports, filteredPersonalDetails, personalDetails, shouldGetOptionDetails, filteredWorkspaceChats) {
    if (personalDetails === void 0) { personalDetails = {}; }
    if (shouldGetOptionDetails === void 0) { shouldGetOptionDetails = false; }
    if (filteredWorkspaceChats === void 0) { filteredWorkspaceChats = []; }
    // We show the selected participants at the top of the list when there is no search term or maximum number of participants has already been selected
    // However, if there is a search term we remove the selected participants from the top of the list unless they are part of the search results
    // This clears up space on mobile views, where if you create a group with 4+ people you can't see the selected participants and the search results at the same time
    if (searchTerm === '') {
        return {
            section: {
                title: undefined,
                data: shouldGetOptionDetails
                    ? selectedOptions.map(function (participant) {
                        var _a;
                        var isReportPolicyExpenseChat = (_a = participant.isPolicyExpenseChat) !== null && _a !== void 0 ? _a : false;
                        return isReportPolicyExpenseChat ? getPolicyExpenseReportOption(participant) : getParticipantsOption(participant, personalDetails);
                    })
                    : selectedOptions,
                shouldShow: selectedOptions.length > 0,
            },
        };
    }
    var cleanSearchTerm = searchTerm.trim().toLowerCase();
    // If you select a new user you don't have a contact for, they won't get returned as part of a recent report or personal details
    // This will add them to the list of options, deduping them if they already exist in the other lists
    var selectedParticipantsWithoutDetails = selectedOptions.filter(function (participant) {
        var _a;
        var accountID = (_a = participant.accountID) !== null && _a !== void 0 ? _a : null;
        var isPartOfSearchTerm = getPersonalDetailSearchTerms(participant).join(' ').toLowerCase().includes(cleanSearchTerm);
        var isReportInRecentReports = filteredRecentReports.some(function (report) { return report.accountID === accountID; }) || filteredWorkspaceChats.some(function (report) { return report.accountID === accountID; });
        var isReportInPersonalDetails = filteredPersonalDetails.some(function (personalDetail) { return personalDetail.accountID === accountID; });
        return isPartOfSearchTerm && !isReportInRecentReports && !isReportInPersonalDetails;
    });
    return {
        section: {
            title: undefined,
            data: shouldGetOptionDetails
                ? selectedParticipantsWithoutDetails.map(function (participant) {
                    var _a;
                    var isReportPolicyExpenseChat = (_a = participant.isPolicyExpenseChat) !== null && _a !== void 0 ? _a : false;
                    return isReportPolicyExpenseChat ? getPolicyExpenseReportOption(participant) : getParticipantsOption(participant, personalDetails);
                })
                : selectedParticipantsWithoutDetails,
            shouldShow: selectedParticipantsWithoutDetails.length > 0,
        },
    };
}
/**
 * Helper method to get the `keyForList` for the first option in the OptionsList
 */
function getFirstKeyForList(data) {
    if (!(data === null || data === void 0 ? void 0 : data.length)) {
        return '';
    }
    var firstNonEmptyDataObj = data.at(0);
    return (firstNonEmptyDataObj === null || firstNonEmptyDataObj === void 0 ? void 0 : firstNonEmptyDataObj.keyForList) ? firstNonEmptyDataObj === null || firstNonEmptyDataObj === void 0 ? void 0 : firstNonEmptyDataObj.keyForList : '';
}
function getPersonalDetailSearchTerms(item) {
    var _a, _b, _c, _d, _e, _f;
    return [(_c = (_b = (_a = item.participantsList) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.displayName) !== null && _c !== void 0 ? _c : '', (_d = item.login) !== null && _d !== void 0 ? _d : '', (_f = (_e = item.login) === null || _e === void 0 ? void 0 : _e.replace(CONST_1.default.EMAIL_SEARCH_REGEX, '')) !== null && _f !== void 0 ? _f : ''];
}
function getCurrentUserSearchTerms(item) {
    var _a, _b, _c, _d;
    return [(_a = item.text) !== null && _a !== void 0 ? _a : '', (_b = item.login) !== null && _b !== void 0 ? _b : '', (_d = (_c = item.login) === null || _c === void 0 ? void 0 : _c.replace(CONST_1.default.EMAIL_SEARCH_REGEX, '')) !== null && _d !== void 0 ? _d : ''];
}
/**
 * Remove the personal details for the DMs that are already in the recent reports so that we don't show duplicates.
 */
function filteredPersonalDetailsOfRecentReports(recentReports, personalDetails) {
    var excludedLogins = new Set(recentReports.map(function (report) { return report.login; }));
    return personalDetails.filter(function (personalDetail) { return !excludedLogins.has(personalDetail.login); });
}
/**
 * Filters options based on the search input value
 */
function filterReports(reports, searchTerms) {
    var normalizedSearchTerms = searchTerms.map(function (term) { return StringUtils_1.default.normalizeAccents(term); });
    // We search eventually for multiple whitespace separated search terms.
    // We start with the search term at the end, and then narrow down those filtered search results with the next search term.
    // We repeat (reduce) this until all search terms have been used:
    var filteredReports = normalizedSearchTerms.reduceRight(function (items, term) {
        return (0, filterArrayByMatch_1.default)(items, term, function (item) {
            var values = [];
            if (item.text) {
                values.push(StringUtils_1.default.normalizeAccents(item.text));
                values.push(StringUtils_1.default.normalizeAccents(item.text).replace(/['-]/g, ''));
            }
            if (item.login) {
                values.push(StringUtils_1.default.normalizeAccents(item.login));
                values.push(StringUtils_1.default.normalizeAccents(item.login.replace(CONST_1.default.EMAIL_SEARCH_REGEX, '')));
            }
            if (item.isThread) {
                if (item.alternateText) {
                    values.push(StringUtils_1.default.normalizeAccents(item.alternateText));
                }
            }
            else if (!!item.isChatRoom || !!item.isPolicyExpenseChat) {
                if (item.subtitle) {
                    values.push(StringUtils_1.default.normalizeAccents(item.subtitle));
                }
            }
            return uniqFast(values);
        });
    }, 
    // We start from all unfiltered reports:
    reports);
    return filteredReports;
}
function filterWorkspaceChats(reports, searchTerms) {
    var filteredReports = searchTerms.reduceRight(function (items, term) {
        return (0, filterArrayByMatch_1.default)(items, term, function (item) {
            var values = [];
            if (item.text) {
                values.push(item.text);
            }
            return uniqFast(values);
        });
    }, 
    // We start from all unfiltered reports:
    reports);
    return filteredReports;
}
function filterPersonalDetails(personalDetails, searchTerms) {
    return searchTerms.reduceRight(function (items, term) {
        return (0, filterArrayByMatch_1.default)(items, term, function (item) {
            var values = getPersonalDetailSearchTerms(item);
            return uniqFast(values);
        });
    }, personalDetails);
}
function filterCurrentUserOption(currentUserOption, searchTerms) {
    return searchTerms.reduceRight(function (item, term) {
        if (!item) {
            return null;
        }
        var currentUserOptionSearchText = uniqFast(getCurrentUserSearchTerms(item)).join(' ');
        return isSearchStringMatch(term, currentUserOptionSearchText) ? item : null;
    }, currentUserOption);
}
function filterUserToInvite(options, searchValue, config) {
    var _a;
    var _b = config !== null && config !== void 0 ? config : {}, _c = _b.canInviteUser, canInviteUser = _c === void 0 ? true : _c, _d = _b.excludeLogins, excludeLogins = _d === void 0 ? {} : _d;
    if (!canInviteUser) {
        return null;
    }
    var canCreateOptimisticDetail = canCreateOptimisticPersonalDetailOption({
        recentReportOptions: options.recentReports,
        personalDetailsOptions: options.personalDetails,
        currentUserOption: options.currentUserOption,
        searchValue: searchValue,
    });
    if (!canCreateOptimisticDetail) {
        return null;
    }
    var loginsToExclude = __assign((_a = {}, _a[CONST_1.default.EMAIL.NOTIFICATIONS] = true, _a), excludeLogins);
    return getUserToInviteOption(__assign({ searchValue: searchValue, loginsToExclude: loginsToExclude }, config));
}
function filterSelfDMChat(report, searchTerms) {
    var isMatch = searchTerms.every(function (term) {
        var values = [];
        if (report.text) {
            values.push(report.text);
        }
        if (report.login) {
            values.push(report.login);
            values.push(report.login.replace(CONST_1.default.EMAIL_SEARCH_REGEX, ''));
        }
        if (report.isThread) {
            if (report.alternateText) {
                values.push(report.alternateText);
            }
        }
        else if (!!report.isChatRoom || !!report.isPolicyExpenseChat) {
            if (report.subtitle) {
                values.push(report.subtitle);
            }
        }
        // Remove duplicate values and check if the term matches any value
        return uniqFast(values).some(function (value) { return value.includes(term); });
    });
    return isMatch ? report : undefined;
}
function filterOptions(options, searchInputValue, config) {
    var _a, _b;
    var parsedPhoneNumber = (0, PhoneNumber_1.parsePhoneNumber)((0, LoginUtils_1.appendCountryCode)(expensify_common_1.Str.removeSMSDomain(searchInputValue)));
    var searchValue = parsedPhoneNumber.possible && ((_a = parsedPhoneNumber.number) === null || _a === void 0 ? void 0 : _a.e164) ? parsedPhoneNumber.number.e164 : searchInputValue.toLowerCase();
    var searchTerms = searchValue ? searchValue.split(' ') : [];
    var recentReports = filterReports(options.recentReports, searchTerms);
    var personalDetails = filterPersonalDetails(options.personalDetails, searchTerms);
    var currentUserOption = filterCurrentUserOption(options.currentUserOption, searchTerms);
    var userToInvite = filterUserToInvite({
        recentReports: recentReports,
        personalDetails: personalDetails,
        currentUserOption: currentUserOption,
    }, searchValue, config);
    var workspaceChats = filterWorkspaceChats((_b = options.workspaceChats) !== null && _b !== void 0 ? _b : [], searchTerms);
    var selfDMChat = options.selfDMChat ? filterSelfDMChat(options.selfDMChat, searchTerms) : undefined;
    return {
        personalDetails: personalDetails,
        recentReports: recentReports,
        userToInvite: userToInvite,
        currentUserOption: currentUserOption,
        workspaceChats: workspaceChats,
        selfDMChat: selfDMChat,
    };
}
/**
 * Orders the reports and personal details based on the search input value.
 * Personal details will be filtered out if they are part of the recent reports.
 * Additional configs can be applied.
 */
function combineOrderingOfReportsAndPersonalDetails(options, searchInputValue, _a) {
    if (_a === void 0) { _a = {}; }
    var maxRecentReportsToShow = _a.maxRecentReportsToShow, sortByReportTypeInSearch = _a.sortByReportTypeInSearch, orderReportOptionsConfig = __rest(_a, ["maxRecentReportsToShow", "sortByReportTypeInSearch"]);
    // sortByReportTypeInSearch will show the personal details as part of the recent reports
    if (sortByReportTypeInSearch) {
        var personalDetailsWithoutDMs_1 = filteredPersonalDetailsOfRecentReports(options.recentReports, options.personalDetails);
        var reportsAndPersonalDetails = options.recentReports.concat(personalDetailsWithoutDMs_1);
        return orderOptions({ recentReports: reportsAndPersonalDetails, personalDetails: [] }, searchInputValue, orderReportOptionsConfig);
    }
    var orderedReports = orderReportOptionsWithSearch(options.recentReports, searchInputValue, orderReportOptionsConfig);
    if (typeof maxRecentReportsToShow === 'number') {
        orderedReports = orderedReports.slice(0, maxRecentReportsToShow);
    }
    var personalDetailsWithoutDMs = filteredPersonalDetailsOfRecentReports(orderedReports, options.personalDetails);
    var orderedPersonalDetails = orderPersonalDetailsOptions(personalDetailsWithoutDMs);
    return {
        recentReports: orderedReports,
        personalDetails: orderedPersonalDetails,
    };
}
/**
 * Filters and orders the options based on the search input value.
 * Note that personal details that are part of the recent reports will always be shown as part of the recent reports (ie. DMs).
 */
function filterAndOrderOptions(options, searchInputValue, config) {
    if (config === void 0) { config = {}; }
    var filterResult = options;
    if (searchInputValue.trim().length > 0) {
        filterResult = filterOptions(options, searchInputValue, config);
    }
    var orderedOptions = combineOrderingOfReportsAndPersonalDetails(filterResult, searchInputValue, config);
    // on staging server, in specific cases (see issue) BE returns duplicated personalDetails entries
    var uniqueLogins = new Set();
    orderedOptions.personalDetails = orderedOptions.personalDetails.filter(function (detail) {
        var _a;
        var login = (_a = detail.login) !== null && _a !== void 0 ? _a : '';
        if (uniqueLogins.has(login)) {
            return false;
        }
        uniqueLogins.add(login);
        return true;
    });
    return __assign(__assign({}, filterResult), orderedOptions);
}
function sortAlphabetically(items, key) {
    return items.sort(function (a, b) { var _a, _b; return ((_a = a[key]) !== null && _a !== void 0 ? _a : '').toLowerCase().localeCompare(((_b = b[key]) !== null && _b !== void 0 ? _b : '').toLowerCase()); });
}
function getEmptyOptions() {
    return {
        recentReports: [],
        personalDetails: [],
        userToInvite: null,
        currentUserOption: null,
    };
}
function shouldUseBoldText(report) {
    var _a;
    var notificationPreference = (_a = report.notificationPreference) !== null && _a !== void 0 ? _a : (0, ReportUtils_1.getReportNotificationPreference)(report);
    return report.isUnread === true && notificationPreference !== CONST_1.default.REPORT.NOTIFICATION_PREFERENCE.MUTE && !(0, ReportUtils_1.isHiddenForCurrentUser)(notificationPreference);
}
function getManagerMcTestParticipant() {
    var managerMcTestPersonalDetails = Object.values(allPersonalDetails !== null && allPersonalDetails !== void 0 ? allPersonalDetails : {}).find(function (personalDetails) { return (personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails.login) === CONST_1.default.EMAIL.MANAGER_MCTEST; });
    var managerMcTestReport = (managerMcTestPersonalDetails === null || managerMcTestPersonalDetails === void 0 ? void 0 : managerMcTestPersonalDetails.accountID) && currentUserAccountID ? (0, ReportUtils_1.getChatByParticipants)([managerMcTestPersonalDetails === null || managerMcTestPersonalDetails === void 0 ? void 0 : managerMcTestPersonalDetails.accountID, currentUserAccountID]) : undefined;
    return managerMcTestPersonalDetails ? __assign(__assign({}, getParticipantsOption(managerMcTestPersonalDetails, allPersonalDetails)), { reportID: managerMcTestReport === null || managerMcTestReport === void 0 ? void 0 : managerMcTestReport.reportID }) : undefined;
}
function shallowOptionsListCompare(a, b) {
    var _a, _b, _c, _d;
    if (!a || !b) {
        return false;
    }
    if (a.reports.length !== b.reports.length || a.personalDetails.length !== b.personalDetails.length) {
        return false;
    }
    for (var i = 0; i < a.reports.length; i++) {
        if (((_a = a.reports.at(i)) === null || _a === void 0 ? void 0 : _a.reportID) !== ((_b = b.reports.at(i)) === null || _b === void 0 ? void 0 : _b.reportID)) {
            return false;
        }
    }
    for (var i = 0; i < a.personalDetails.length; i++) {
        if (((_c = a.personalDetails.at(i)) === null || _c === void 0 ? void 0 : _c.login) !== ((_d = b.personalDetails.at(i)) === null || _d === void 0 ? void 0 : _d.login)) {
            return false;
        }
    }
    return true;
}
