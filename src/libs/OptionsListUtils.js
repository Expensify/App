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
exports.__esModule = true;
exports.combineOrderingOfReportsAndPersonalDetails = exports.hasReportErrors = exports.getReportDisplayOption = exports.getAlternateText = exports.getAttendeeOptions = exports.shouldUseBoldText = exports.getEmptyOptions = exports.getCurrentUserSearchTerms = exports.getPersonalDetailSearchTerms = exports.getUserToInviteOption = exports.canCreateOptimisticPersonalDetailOption = exports.getFirstKeyForList = exports.getReportOption = exports.createOptionFromReport = exports.createOptionList = exports.filterAndOrderOptions = exports.orderPersonalDetailsOptions = exports.orderReportOptionsWithSearch = exports.orderReportOptions = exports.filteredPersonalDetailsOfRecentReports = exports.filterOptions = exports.filterUserToInvite = exports.orderOptions = exports.getShareLogOptions = exports.formatSectionsFromSearchTerm = exports.formatMemberForList = exports.sortAlphabetically = exports.hasEnabledOptions = exports.getEnabledCategoriesCount = exports.getLastMessageTextForReport = exports.getLastActorDisplayName = exports.shouldOptionShowTooltip = exports.isSearchStringMatch = exports.getParticipantsOption = exports.getIOUReportIDOfLastAction = exports.getPolicyExpenseReportOption = exports.isSearchStringMatchUserDetails = exports.getIOUConfirmationOptionsFromPayeePersonalDetail = exports.getPersonalDetailsForAccountIDs = exports.getSearchValueForPhoneOrEmail = exports.getHeaderMessageForNonUserList = exports.getHeaderMessage = exports.getMemberInviteOptions = exports.getShareDestinationOptions = exports.getSearchOptions = exports.getValidPersonalDetailOptions = exports.getValidOptions = exports.isPersonalDetailsReady = exports.isCurrentUser = exports.getAvatarsForAccountIDs = void 0;
exports.shouldShowLastActorDisplayName = exports.isSelectedManagerMcTest = exports.getManagerMcTestParticipant = exports.getIsUserSubmittedExpenseOrScannedReceipt = exports.filterReports = exports.filterSelfDMChat = exports.orderWorkspaceOptions = exports.filterWorkspaceChats = void 0;
/* eslint-disable no-continue */
var expensify_common_1 = require("expensify-common");
var orderBy_1 = require("lodash/orderBy");
var react_native_onyx_1 = require("react-native-onyx");
var Expensicons_1 = require("@components/Icon/Expensicons");
var CONST_1 = require("@src/CONST");
var ONYXKEYS_1 = require("@src/ONYXKEYS");
var EmptyObject_1 = require("@src/types/utils/EmptyObject");
var Timing_1 = require("./actions/Timing");
var filterArrayByMatch_1 = require("./filterArrayByMatch");
var isReportMessageAttachment_1 = require("./isReportMessageAttachment");
var LocalePhoneNumber_1 = require("./LocalePhoneNumber");
var Localize_1 = require("./Localize");
var LoginUtils_1 = require("./LoginUtils");
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
react_native_onyx_1["default"].connect({
    key: ONYXKEYS_1["default"].SESSION,
    callback: function (value) {
        currentUserLogin = value === null || value === void 0 ? void 0 : value.email;
        currentUserAccountID = value === null || value === void 0 ? void 0 : value.accountID;
    }
});
var loginList;
react_native_onyx_1["default"].connect({
    key: ONYXKEYS_1["default"].LOGIN_LIST,
    callback: function (value) { return (loginList = EmptyObject_1.isEmptyObject(value) ? {} : value); }
});
var allPersonalDetails;
react_native_onyx_1["default"].connect({
    key: ONYXKEYS_1["default"].PERSONAL_DETAILS_LIST,
    callback: function (value) { return (allPersonalDetails = EmptyObject_1.isEmptyObject(value) ? {} : value); }
});
var preferredLocale = CONST_1["default"].LOCALES.DEFAULT;
react_native_onyx_1["default"].connect({
    key: ONYXKEYS_1["default"].NVP_PREFERRED_LOCALE,
    callback: function (value) {
        if (!value) {
            return;
        }
        preferredLocale = value;
    }
});
var policies = {};
react_native_onyx_1["default"].connect({
    key: ONYXKEYS_1["default"].COLLECTION.POLICY,
    callback: function (policy, key) {
        if (!policy || !key || !policy.name) {
            return;
        }
        policies[key] = policy;
    }
});
var allPolicies = {};
react_native_onyx_1["default"].connect({
    key: ONYXKEYS_1["default"].COLLECTION.POLICY,
    waitForCollectionCallback: true,
    callback: function (val) { return (allPolicies = val); }
});
var allReports;
react_native_onyx_1["default"].connect({
    key: ONYXKEYS_1["default"].COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback: function (value) {
        allReports = value;
    }
});
var lastReportActions = {};
var allSortedReportActions = {};
var allReportActions;
var lastVisibleReportActions = {};
react_native_onyx_1["default"].connect({
    key: ONYXKEYS_1["default"].COLLECTION.REPORT_ACTIONS,
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
            var sortedReportActions = ReportActionsUtils_1.getSortedReportActions(reportActionsArray, true);
            allSortedReportActions[reportID] = sortedReportActions;
            // If the report is a one-transaction report and has , we need to return the combined reportActions so that the LHN can display modifications
            // to the transaction thread or the report itself
            var transactionThreadReportID = ReportActionsUtils_1.getOneTransactionThreadReportID(reportID, actions[reportActions[0]]);
            if (transactionThreadReportID) {
                var transactionThreadReportActionsArray = Object.values((_b = actions["" + ONYXKEYS_1["default"].COLLECTION.REPORT_ACTIONS + transactionThreadReportID]) !== null && _b !== void 0 ? _b : {});
                sortedReportActions = ReportActionsUtils_1.getCombinedReportActions(sortedReportActions, transactionThreadReportID, transactionThreadReportActionsArray, reportID, false);
            }
            var firstReportAction = sortedReportActions.at(0);
            if (!firstReportAction) {
                delete lastReportActions[reportID];
            }
            else {
                lastReportActions[reportID] = firstReportAction;
            }
            var report = allReports === null || allReports === void 0 ? void 0 : allReports["" + ONYXKEYS_1["default"].COLLECTION.REPORT + reportID];
            var isWriteActionAllowed = ReportUtils_1.canUserPerformWriteAction(report);
            // The report is only visible if it is the last action not deleted that
            // does not match a closed or created state.
            var reportActionsForDisplay = sortedReportActions.filter(function (reportAction, actionKey) {
                return ReportActionsUtils_1.shouldReportActionBeVisible(reportAction, actionKey, isWriteActionAllowed) &&
                    !ReportActionsUtils_1.isWhisperAction(reportAction) &&
                    reportAction.actionName !== CONST_1["default"].REPORT.ACTIONS.TYPE.CREATED &&
                    reportAction.pendingAction !== CONST_1["default"].RED_BRICK_ROAD_PENDING_ACTION.DELETE;
            });
            var reportActionForDisplay = reportActionsForDisplay.at(0);
            if (!reportActionForDisplay) {
                delete lastVisibleReportActions[reportID];
                return;
            }
            lastVisibleReportActions[reportID] = reportActionForDisplay;
        });
    }
});
var activePolicyID;
react_native_onyx_1["default"].connect({
    key: ONYXKEYS_1["default"].NVP_ACTIVE_POLICY_ID,
    callback: function (value) { return (activePolicyID = value); }
});
var nvpDismissedProductTraining;
react_native_onyx_1["default"].connect({
    key: ONYXKEYS_1["default"].NVP_DISMISSED_PRODUCT_TRAINING,
    callback: function (value) { return (nvpDismissedProductTraining = value); }
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
            type: CONST_1["default"].ICON_TYPE_AVATAR,
            name: (_d = userPersonalDetail.login) !== null && _d !== void 0 ? _d : ''
        };
    });
}
exports.getAvatarsForAccountIDs = getAvatarsForAccountIDs;
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
        if (cleanAccountID === CONST_1["default"].ACCOUNT_ID.CONCIERGE) {
            personalDetail.avatar = CONST_1["default"].CONCIERGE_ICON_URL;
        }
        personalDetail.accountID = cleanAccountID;
        personalDetailsForAccountIDs[cleanAccountID] = personalDetail;
    });
    return personalDetailsForAccountIDs;
}
exports.getPersonalDetailsForAccountIDs = getPersonalDetailsForAccountIDs;
/**
 * Return true if personal details data is ready, i.e. report list options can be created.
 */
function isPersonalDetailsReady(personalDetails) {
    var personalDetailsKeys = Object.keys(personalDetails !== null && personalDetails !== void 0 ? personalDetails : {});
    return personalDetailsKeys.some(function (key) { var _a; return (_a = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[key]) === null || _a === void 0 ? void 0 : _a.accountID; });
}
exports.isPersonalDetailsReady = isPersonalDetailsReady;
/**
 * Get the participant option for a report.
 */
function getParticipantsOption(participant, personalDetails) {
    var _a, _b, _c, _d, _e, _f;
    var detail = participant.accountID ? getPersonalDetailsForAccountIDs([participant.accountID], personalDetails)[participant.accountID] : undefined;
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    var login = (detail === null || detail === void 0 ? void 0 : detail.login) || participant.login || '';
    var displayName = LocalePhoneNumber_1.formatPhoneNumber(PersonalDetailsUtils_1.getDisplayNameOrDefault(detail, login || participant.text));
    return {
        keyForList: String((_a = detail === null || detail === void 0 ? void 0 : detail.accountID) !== null && _a !== void 0 ? _a : login),
        login: login,
        accountID: detail === null || detail === void 0 ? void 0 : detail.accountID,
        text: displayName,
        firstName: (_b = detail === null || detail === void 0 ? void 0 : detail.firstName) !== null && _b !== void 0 ? _b : '',
        lastName: (_c = detail === null || detail === void 0 ? void 0 : detail.lastName) !== null && _c !== void 0 ? _c : '',
        alternateText: LocalePhoneNumber_1.formatPhoneNumber(login) || displayName,
        icons: [
            {
                source: (_d = detail === null || detail === void 0 ? void 0 : detail.avatar) !== null && _d !== void 0 ? _d : Expensicons_1.FallbackAvatar,
                name: login,
                type: CONST_1["default"].ICON_TYPE_AVATAR,
                id: detail === null || detail === void 0 ? void 0 : detail.accountID
            },
        ],
        phoneNumber: (_e = detail === null || detail === void 0 ? void 0 : detail.phoneNumber) !== null && _e !== void 0 ? _e : '',
        selected: participant.selected,
        isSelected: participant.selected,
        searchText: (_f = participant.searchText) !== null && _f !== void 0 ? _f : undefined
    };
}
exports.getParticipantsOption = getParticipantsOption;
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
            lastActorDetails.firstName || LocalePhoneNumber_1.formatPhoneNumber(PersonalDetailsUtils_1.getDisplayNameOrDefault(lastActorDetails))
        : Localize_1.translateLocal('common.you');
}
exports.getLastActorDisplayName = getLastActorDisplayName;
/**
 * Should show the last actor display name from last actor details.
 */
function shouldShowLastActorDisplayName(report, lastActorDetails) {
    if (!lastActorDetails || ReportUtils_1.isSelfDM(report) || (ReportUtils_1.isDM(report) && lastActorDetails.accountID !== currentUserAccountID)) {
        return false;
    }
    var lastActorDisplayName = getLastActorDisplayName(lastActorDetails);
    if (!lastActorDisplayName) {
        return false;
    }
    return true;
}
exports.shouldShowLastActorDisplayName = shouldShowLastActorDisplayName;
/**
 * Update alternate text for the option when applicable
 */
function getAlternateText(option, _a) {
    var _b, _c, _d, _e;
    var _f = _a.showChatPreviewLine, showChatPreviewLine = _f === void 0 ? false : _f, _g = _a.forcePolicyNamePreview, forcePolicyNamePreview = _g === void 0 ? false : _g;
    var report = ReportUtils_1.getReportOrDraftReport(option.reportID);
    var isAdminRoom = ReportUtils_1.isAdminRoom(report);
    var isAnnounceRoom = ReportUtils_1.isAnnounceRoom(report);
    var isGroupChat = ReportUtils_1.isGroupChat(report);
    var isExpenseThread = ReportUtils_1.isMoneyRequest(report);
    var formattedLastMessageText = ReportUtils_1.formatReportLastMessageText(Parser_1["default"].htmlToText((_b = option.lastMessageText) !== null && _b !== void 0 ? _b : ''));
    var reportPrefix = ReportUtils_1.getReportSubtitlePrefix(report);
    var formattedLastMessageTextWithPrefix = reportPrefix + formattedLastMessageText;
    if (isExpenseThread || option.isMoneyRequestReport) {
        return showChatPreviewLine && formattedLastMessageText ? formattedLastMessageTextWithPrefix : Localize_1.translate(preferredLocale, 'iou.expense');
    }
    if (option.isThread) {
        return showChatPreviewLine && formattedLastMessageText ? formattedLastMessageTextWithPrefix : Localize_1.translate(preferredLocale, 'threads.thread');
    }
    if (option.isChatRoom && !isAdminRoom && !isAnnounceRoom) {
        return showChatPreviewLine && formattedLastMessageText ? formattedLastMessageTextWithPrefix : option.subtitle;
    }
    if (((_c = option.isPolicyExpenseChat) !== null && _c !== void 0 ? _c : false) || isAdminRoom || isAnnounceRoom) {
        return showChatPreviewLine && !forcePolicyNamePreview && formattedLastMessageText ? formattedLastMessageTextWithPrefix : option.subtitle;
    }
    if (option.isTaskReport) {
        return showChatPreviewLine && formattedLastMessageText ? formattedLastMessageTextWithPrefix : Localize_1.translate(preferredLocale, 'task.task');
    }
    if (isGroupChat) {
        return showChatPreviewLine && formattedLastMessageText ? formattedLastMessageTextWithPrefix : Localize_1.translate(preferredLocale, 'common.group');
    }
    return showChatPreviewLine && formattedLastMessageText
        ? formattedLastMessageTextWithPrefix
        : LocalePhoneNumber_1.formatPhoneNumber(option.participantsList && option.participantsList.length > 0 ? (_e = (_d = option.participantsList.at(0)) === null || _d === void 0 ? void 0 : _d.login) !== null && _e !== void 0 ? _e : '' : '');
}
exports.getAlternateText = getAlternateText;
/**
 * Searches for a match when provided with a value
 */
function isSearchStringMatch(searchValue, searchText, participantNames, isReportChatRoom) {
    if (participantNames === void 0) { participantNames = new Set(); }
    if (isReportChatRoom === void 0) { isReportChatRoom = false; }
    var searchWords = new Set(searchValue.replace(/,/g, ' ').split(' '));
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
exports.isSearchStringMatch = isSearchStringMatch;
function isSearchStringMatchUserDetails(personalDetail, searchValue) {
    var memberDetails = '';
    if (personalDetail.login) {
        memberDetails += " " + personalDetail.login;
    }
    if (personalDetail.firstName) {
        memberDetails += " " + personalDetail.firstName;
    }
    if (personalDetail.lastName) {
        memberDetails += " " + personalDetail.lastName;
    }
    if (personalDetail.displayName) {
        memberDetails += " " + PersonalDetailsUtils_1.getDisplayNameOrDefault(personalDetail);
    }
    if (personalDetail.phoneNumber) {
        memberDetails += " " + personalDetail.phoneNumber;
    }
    return isSearchStringMatch(searchValue.trim(), memberDetails.toLowerCase());
}
exports.isSearchStringMatchUserDetails = isSearchStringMatchUserDetails;
/**
 * Get IOU report ID of report last action if the action is report action preview
 */
function getIOUReportIDOfLastAction(report) {
    var _a;
    if (!(report === null || report === void 0 ? void 0 : report.reportID)) {
        return;
    }
    var lastAction = lastVisibleReportActions[report.reportID];
    if (!ReportActionsUtils_1.isReportPreviewAction(lastAction)) {
        return;
    }
    return (_a = ReportUtils_1.getReportOrDraftReport(ReportActionsUtils_1.getIOUReportIDFromReportActionPreview(lastAction))) === null || _a === void 0 ? void 0 : _a.reportID;
}
exports.getIOUReportIDOfLastAction = getIOUReportIDOfLastAction;
/**
 * Get the last message text from the report directly or from other sources for special cases.
 */
function getLastMessageTextForReport(report, lastActorDetails, policy, reportNameValuePairs) {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j;
    var reportID = report === null || report === void 0 ? void 0 : report.reportID;
    var lastReportAction = reportID ? lastVisibleReportActions[reportID] : undefined;
    // some types of actions are filtered out for lastReportAction, in some cases we need to check the actual last action
    var lastOriginalReportAction = reportID ? lastReportActions[reportID] : undefined;
    var lastMessageTextFromReport = '';
    if (ReportUtils_1.isArchivedNonExpenseReport(report, reportNameValuePairs)) {
        var archiveReason = 
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        (ReportActionsUtils_1.isClosedAction(lastOriginalReportAction) && ((_a = ReportActionsUtils_1.getOriginalMessage(lastOriginalReportAction)) === null || _a === void 0 ? void 0 : _a.reason)) || CONST_1["default"].REPORT.ARCHIVE_REASON.DEFAULT;
        switch (archiveReason) {
            case CONST_1["default"].REPORT.ARCHIVE_REASON.ACCOUNT_CLOSED:
            case CONST_1["default"].REPORT.ARCHIVE_REASON.REMOVED_FROM_POLICY:
            case CONST_1["default"].REPORT.ARCHIVE_REASON.POLICY_DELETED: {
                lastMessageTextFromReport = Localize_1.translate(preferredLocale, "reportArchiveReasons." + archiveReason, {
                    displayName: LocalePhoneNumber_1.formatPhoneNumber(PersonalDetailsUtils_1.getDisplayNameOrDefault(lastActorDetails)),
                    policyName: ReportUtils_1.getPolicyName({ report: report, policy: policy })
                });
                break;
            }
            case CONST_1["default"].REPORT.ARCHIVE_REASON.BOOKING_END_DATE_HAS_PASSED: {
                lastMessageTextFromReport = Localize_1.translate(preferredLocale, "reportArchiveReasons." + archiveReason);
                break;
            }
            default: {
                lastMessageTextFromReport = Localize_1.translate(preferredLocale, "reportArchiveReasons.default");
            }
        }
    }
    else if (ReportActionsUtils_1.isMoneyRequestAction(lastReportAction)) {
        var properSchemaForMoneyRequestMessage = ReportUtils_1.getReportPreviewMessage(report, lastReportAction, true, false, null, true);
        lastMessageTextFromReport = ReportUtils_1.formatReportLastMessageText(properSchemaForMoneyRequestMessage);
    }
    else if (ReportActionsUtils_1.isReportPreviewAction(lastReportAction)) {
        var iouReport = ReportUtils_1.getReportOrDraftReport(ReportActionsUtils_1.getIOUReportIDFromReportActionPreview(lastReportAction));
        var lastIOUMoneyReportAction = (iouReport === null || iouReport === void 0 ? void 0 : iouReport.reportID) ? (_b = allSortedReportActions[iouReport.reportID]) === null || _b === void 0 ? void 0 : _b.find(function (reportAction, key) {
            return ReportActionsUtils_1.shouldReportActionBeVisible(reportAction, key, ReportUtils_1.canUserPerformWriteAction(report)) &&
                reportAction.pendingAction !== CONST_1["default"].RED_BRICK_ROAD_PENDING_ACTION.DELETE &&
                ReportActionsUtils_1.isMoneyRequestAction(reportAction);
        }) : undefined;
        var reportPreviewMessage = ReportUtils_1.getReportPreviewMessage(!EmptyObject_1.isEmptyObject(iouReport) ? iouReport : null, lastIOUMoneyReportAction !== null && lastIOUMoneyReportAction !== void 0 ? lastIOUMoneyReportAction : lastReportAction, true, ReportUtils_1.isChatReport(report), null, true, lastReportAction);
        lastMessageTextFromReport = ReportUtils_1.formatReportLastMessageText(reportPreviewMessage);
    }
    else if (ReportActionsUtils_1.isReimbursementQueuedAction(lastReportAction)) {
        lastMessageTextFromReport = ReportUtils_1.getReimbursementQueuedActionMessage({ reportAction: lastReportAction, reportOrID: report });
    }
    else if (ReportActionsUtils_1.isReimbursementDeQueuedOrCanceledAction(lastReportAction)) {
        lastMessageTextFromReport = ReportUtils_1.getReimbursementDeQueuedOrCanceledActionMessage(lastReportAction, report, true);
    }
    else if (ReportActionsUtils_1.isDeletedParentAction(lastReportAction) && ReportUtils_1.isChatReport(report)) {
        lastMessageTextFromReport = ReportUtils_1.getDeletedParentActionMessageForChatReport(lastReportAction);
    }
    else if (ReportActionsUtils_1.isPendingRemove(lastReportAction) && (report === null || report === void 0 ? void 0 : report.reportID) && ReportActionsUtils_1.isThreadParentMessage(lastReportAction, report.reportID)) {
        lastMessageTextFromReport = Localize_1.translateLocal('parentReportAction.hiddenMessage');
    }
    else if (isReportMessageAttachment_1.isReportMessageAttachment({ text: (_c = report === null || report === void 0 ? void 0 : report.lastMessageText) !== null && _c !== void 0 ? _c : '', html: report === null || report === void 0 ? void 0 : report.lastMessageHtml, type: '' })) {
        lastMessageTextFromReport = "[" + Localize_1.translateLocal('common.attachment') + "]";
    }
    else if (ReportActionsUtils_1.isModifiedExpenseAction(lastReportAction)) {
        var properSchemaForModifiedExpenseMessage = ModifiedExpenseMessage_1["default"].getForReportAction({ reportOrID: report === null || report === void 0 ? void 0 : report.reportID, reportAction: lastReportAction });
        lastMessageTextFromReport = ReportUtils_1.formatReportLastMessageText(properSchemaForModifiedExpenseMessage, true);
    }
    else if (ReportActionsUtils_1.isTaskAction(lastReportAction)) {
        lastMessageTextFromReport = ReportUtils_1.formatReportLastMessageText(TaskUtils_1.getTaskReportActionMessage(lastReportAction).text);
    }
    else if (ReportActionsUtils_1.isCreatedTaskReportAction(lastReportAction)) {
        lastMessageTextFromReport = TaskUtils_1.getTaskCreatedMessage(lastReportAction);
    }
    else if (ReportActionsUtils_1.isActionOfType(lastReportAction, CONST_1["default"].REPORT.ACTIONS.TYPE.SUBMITTED) || ReportActionsUtils_1.isActionOfType(lastReportAction, CONST_1["default"].REPORT.ACTIONS.TYPE.SUBMITTED_AND_CLOSED)) {
        var wasSubmittedViaHarvesting = (_e = (_d = ReportActionsUtils_1.getOriginalMessage(lastReportAction)) === null || _d === void 0 ? void 0 : _d.harvesting) !== null && _e !== void 0 ? _e : false;
        if (wasSubmittedViaHarvesting) {
            lastMessageTextFromReport = ReportUtils_1.getReportAutomaticallySubmittedMessage(lastReportAction);
        }
        else {
            lastMessageTextFromReport = ReportUtils_1.getIOUSubmittedMessage(lastReportAction);
        }
    }
    else if (ReportActionsUtils_1.isActionOfType(lastReportAction, CONST_1["default"].REPORT.ACTIONS.TYPE.APPROVED)) {
        var automaticAction = ((_f = ReportActionsUtils_1.getOriginalMessage(lastReportAction)) !== null && _f !== void 0 ? _f : {}).automaticAction;
        if (automaticAction) {
            lastMessageTextFromReport = ReportUtils_1.getReportAutomaticallyApprovedMessage(lastReportAction);
        }
        else {
            lastMessageTextFromReport = ReportUtils_1.getIOUApprovedMessage(lastReportAction);
        }
    }
    else if (ReportActionsUtils_1.isUnapprovedAction(lastReportAction)) {
        lastMessageTextFromReport = ReportUtils_1.getIOUUnapprovedMessage(lastReportAction);
    }
    else if (ReportActionsUtils_1.isActionOfType(lastReportAction, CONST_1["default"].REPORT.ACTIONS.TYPE.FORWARDED)) {
        var automaticAction = ((_g = ReportActionsUtils_1.getOriginalMessage(lastReportAction)) !== null && _g !== void 0 ? _g : {}).automaticAction;
        if (automaticAction) {
            lastMessageTextFromReport = ReportUtils_1.getReportAutomaticallyForwardedMessage(lastReportAction, reportID);
        }
        else {
            lastMessageTextFromReport = ReportUtils_1.getIOUForwardedMessage(lastReportAction, report);
        }
    }
    else if ((lastReportAction === null || lastReportAction === void 0 ? void 0 : lastReportAction.actionName) === CONST_1["default"].REPORT.ACTIONS.TYPE.REJECTED) {
        lastMessageTextFromReport = ReportUtils_1.getRejectedReportMessage();
    }
    else if ((lastReportAction === null || lastReportAction === void 0 ? void 0 : lastReportAction.actionName) === CONST_1["default"].REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.CORPORATE_UPGRADE) {
        lastMessageTextFromReport = ReportUtils_1.getUpgradeWorkspaceMessage();
    }
    else if ((lastReportAction === null || lastReportAction === void 0 ? void 0 : lastReportAction.actionName) === CONST_1["default"].REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.TEAM_DOWNGRADE) {
        lastMessageTextFromReport = ReportUtils_1.getDowngradeWorkspaceMessage();
    }
    else if (ReportActionsUtils_1.isActionableAddPaymentCard(lastReportAction) || ReportActionsUtils_1.isActionOfType(lastReportAction, CONST_1["default"].REPORT.ACTIONS.TYPE.CHANGE_POLICY)) {
        lastMessageTextFromReport = ReportActionsUtils_1.getReportActionMessageText(lastReportAction);
    }
    else if ((lastReportAction === null || lastReportAction === void 0 ? void 0 : lastReportAction.actionName) === 'EXPORTINTEGRATION') {
        lastMessageTextFromReport = ReportActionsUtils_1.getExportIntegrationLastMessageText(lastReportAction);
    }
    else if ((lastReportAction === null || lastReportAction === void 0 ? void 0 : lastReportAction.actionName) && ReportActionsUtils_1.isOldDotReportAction(lastReportAction)) {
        lastMessageTextFromReport = ReportActionsUtils_1.getMessageOfOldDotReportAction(lastReportAction, false);
    }
    else if ((lastReportAction === null || lastReportAction === void 0 ? void 0 : lastReportAction.actionName) === CONST_1["default"].REPORT.ACTIONS.TYPE.RESOLVED_DUPLICATES) {
        lastMessageTextFromReport = Localize_1.translateLocal('violations.resolvedDuplicates');
    }
    // we do not want to show report closed in LHN for non archived report so use getReportLastMessage as fallback instead of lastMessageText from report
    if (reportID && !ReportUtils_1.isArchivedReport(reportNameValuePairs) && report.lastActionType === CONST_1["default"].REPORT.ACTIONS.TYPE.CLOSED) {
        return lastMessageTextFromReport || ((_h = ReportUtils_1.getReportLastMessage(reportID).lastMessageText) !== null && _h !== void 0 ? _h : '');
    }
    return lastMessageTextFromReport || ((_j = report === null || report === void 0 ? void 0 : report.lastMessageText) !== null && _j !== void 0 ? _j : '');
}
exports.getLastMessageTextForReport = getLastMessageTextForReport;
function hasReportErrors(report, reportActions) {
    return !EmptyObject_1.isEmptyObject(ReportUtils_1.getAllReportErrors(report, reportActions));
}
exports.hasReportErrors = hasReportErrors;
/**
 * Creates a report list option
 */
function createOption(accountIDs, personalDetails, report, reportActions, config) {
    var _a, _b, _c, _d, _e, _f, _g;
    var _h = config !== null && config !== void 0 ? config : {}, _j = _h.showChatPreviewLine, showChatPreviewLine = _j === void 0 ? false : _j, _k = _h.forcePolicyNamePreview, forcePolicyNamePreview = _k === void 0 ? false : _k, _l = _h.showPersonalDetails, showPersonalDetails = _l === void 0 ? false : _l, selected = _h.selected, isSelected = _h.isSelected, isDisabled = _h.isDisabled;
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
        isDisabled: isDisabled
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
        var reportNameValuePairs = ReportUtils_1.getReportNameValuePairs(report.reportID);
        result.isChatRoom = ReportUtils_1.isChatRoom(report);
        result.isDefaultRoom = ReportUtils_1.isDefaultRoom(report);
        result.private_isArchived = reportNameValuePairs === null || reportNameValuePairs === void 0 ? void 0 : reportNameValuePairs.private_isArchived;
        result.isExpenseReport = ReportUtils_1.isExpenseReport(report);
        result.isInvoiceRoom = ReportUtils_1.isInvoiceRoom(report);
        result.isMoneyRequestReport = ReportUtils_1.isMoneyRequestReport(report);
        result.isThread = ReportUtils_1.isChatThread(report);
        result.isTaskReport = ReportUtils_1.isTaskReport(report);
        result.shouldShowSubscript = ReportUtils_1.shouldReportShowSubscript(report);
        result.isPolicyExpenseChat = ReportUtils_1.isPolicyExpenseChat(report);
        result.isOwnPolicyExpenseChat = (_a = report.isOwnPolicyExpenseChat) !== null && _a !== void 0 ? _a : false;
        result.allReportErrors = ReportUtils_1.getAllReportErrors(report, reportActions);
        result.brickRoadIndicator = hasReportErrors(report, reportActions) ? CONST_1["default"].BRICK_ROAD_INDICATOR_STATUS.ERROR : '';
        result.pendingAction = report.pendingFields ? (_b = report.pendingFields.addWorkspaceRoom) !== null && _b !== void 0 ? _b : report.pendingFields.createChat : undefined;
        result.ownerAccountID = report.ownerAccountID;
        result.reportID = report.reportID;
        var oneTransactionThreadReportID = ReportActionsUtils_1.getOneTransactionThreadReportID(report.reportID, allReportActions === null || allReportActions === void 0 ? void 0 : allReportActions["" + ONYXKEYS_1["default"].COLLECTION.REPORT_ACTIONS + report.reportID]);
        var oneTransactionThreadReport = allReports === null || allReports === void 0 ? void 0 : allReports["" + ONYXKEYS_1["default"].COLLECTION.REPORT + oneTransactionThreadReportID];
        result.isUnread = ReportUtils_1.isUnread(report, oneTransactionThreadReport);
        result.isPinned = report.isPinned;
        result.iouReportID = report.iouReportID;
        result.keyForList = String(report.reportID);
        result.isWaitingOnBankAccount = report.isWaitingOnBankAccount;
        result.policyID = report.policyID;
        result.isSelfDM = ReportUtils_1.isSelfDM(report);
        result.notificationPreference = ReportUtils_1.getReportNotificationPreference(report);
        result.lastVisibleActionCreated = report.lastVisibleActionCreated;
        var visibleParticipantAccountIDs = ReportUtils_1.getParticipantsAccountIDsForDisplay(report, true);
        result.tooltipText = ReportUtils_1.getReportParticipantsTitle(visibleParticipantAccountIDs);
        hasMultipleParticipants = personalDetailList.length > 1 || result.isChatRoom || result.isPolicyExpenseChat || ReportUtils_1.isGroupChat(report);
        subtitle = ReportUtils_1.getChatRoomSubtitle(report, { isCreateExpenseFlow: true });
        var lastActorDetails = report.lastActorAccountID ? (_c = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[report.lastActorAccountID]) !== null && _c !== void 0 ? _c : null : null;
        var lastActorDisplayName = getLastActorDisplayName(lastActorDetails);
        var lastMessageTextFromReport = getLastMessageTextForReport(report, lastActorDetails, undefined, reportNameValuePairs);
        var lastMessageText = lastMessageTextFromReport;
        var lastAction = lastVisibleReportActions[report.reportID];
        var shouldDisplayLastActorName = lastAction &&
            lastAction.actionName !== CONST_1["default"].REPORT.ACTIONS.TYPE.REPORT_PREVIEW &&
            lastAction.actionName !== CONST_1["default"].REPORT.ACTIONS.TYPE.IOU &&
            !ReportUtils_1.isArchivedNonExpenseReport(report, reportNameValuePairs) &&
            shouldShowLastActorDisplayName(report, lastActorDetails);
        if (shouldDisplayLastActorName && lastActorDisplayName && lastMessageTextFromReport) {
            lastMessageText = lastActorDisplayName + ": " + lastMessageTextFromReport;
        }
        result.lastMessageText = lastMessageText;
        // If displaying chat preview line is needed, let's overwrite the default alternate text
        result.alternateText = showPersonalDetails && (personalDetail === null || personalDetail === void 0 ? void 0 : personalDetail.login) ? personalDetail.login : getAlternateText(result, { showChatPreviewLine: showChatPreviewLine, forcePolicyNamePreview: forcePolicyNamePreview });
        reportName = showPersonalDetails ? ReportUtils_1.getDisplayNameForParticipant({ accountID: accountIDs.at(0) }) || LocalePhoneNumber_1.formatPhoneNumber((_d = personalDetail === null || personalDetail === void 0 ? void 0 : personalDetail.login) !== null && _d !== void 0 ? _d : '') : ReportUtils_1.getReportName(report);
    }
    else {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        reportName = ReportUtils_1.getDisplayNameForParticipant({ accountID: accountIDs.at(0) }) || LocalePhoneNumber_1.formatPhoneNumber((_e = personalDetail === null || personalDetail === void 0 ? void 0 : personalDetail.login) !== null && _e !== void 0 ? _e : '');
        result.keyForList = String(accountIDs.at(0));
        result.alternateText = LocalePhoneNumber_1.formatPhoneNumber((_g = (_f = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[accountIDs[0]]) === null || _f === void 0 ? void 0 : _f.login) !== null && _g !== void 0 ? _g : '');
    }
    result.isIOUReportOwner = ReportUtils_1.isIOUOwnedByCurrentUser(result);
    result.iouReportAmount = ReportUtils_1.getMoneyRequestSpendBreakdown(result).totalDisplaySpend;
    if (!hasMultipleParticipants && (!report || (report && !ReportUtils_1.isGroupChat(report) && !ReportUtils_1.isChatRoom(report)))) {
        result.login = personalDetail === null || personalDetail === void 0 ? void 0 : personalDetail.login;
        result.accountID = Number(personalDetail === null || personalDetail === void 0 ? void 0 : personalDetail.accountID);
        result.phoneNumber = personalDetail === null || personalDetail === void 0 ? void 0 : personalDetail.phoneNumber;
    }
    result.text = reportName;
    result.icons = ReportUtils_1.getIcons(report, personalDetails, personalDetail === null || personalDetail === void 0 ? void 0 : personalDetail.avatar, personalDetail === null || personalDetail === void 0 ? void 0 : personalDetail.login, personalDetail === null || personalDetail === void 0 ? void 0 : personalDetail.accountID, null);
    result.subtitle = subtitle;
    return result;
}
/**
 * Get the option for a given report.
 */
function getReportOption(participant) {
    var _a;
    var report = ReportUtils_1.getReportOrDraftReport(participant.reportID);
    var visibleParticipantAccountIDs = ReportUtils_1.getParticipantsAccountIDsForDisplay(report, true);
    var option = createOption(visibleParticipantAccountIDs, allPersonalDetails !== null && allPersonalDetails !== void 0 ? allPersonalDetails : {}, !EmptyObject_1.isEmptyObject(report) ? report : undefined, {}, {
        showChatPreviewLine: false,
        forcePolicyNamePreview: false
    });
    // Update text & alternateText because createOption returns workspace name only if report is owned by the user
    if (option.isSelfDM) {
        option.alternateText = Localize_1.translateLocal('reportActionsView.yourSpace');
    }
    else if (option.isInvoiceRoom) {
        option.text = ReportUtils_1.getReportName(report);
        option.alternateText = Localize_1.translateLocal('workspace.common.invoices');
    }
    else {
        option.text = ReportUtils_1.getPolicyName({ report: report });
        option.alternateText = Localize_1.translateLocal('workspace.common.workspace');
        if (report === null || report === void 0 ? void 0 : report.policyID) {
            var policy = allPolicies === null || allPolicies === void 0 ? void 0 : allPolicies["" + ONYXKEYS_1["default"].COLLECTION.POLICY + report.policyID];
            var submitToAccountID = PolicyUtils_1.getSubmitToAccountID(policy, report);
            var submitsToAccountDetails = allPersonalDetails === null || allPersonalDetails === void 0 ? void 0 : allPersonalDetails[submitToAccountID];
            var subtitle = (_a = submitsToAccountDetails === null || submitsToAccountDetails === void 0 ? void 0 : submitsToAccountDetails.displayName) !== null && _a !== void 0 ? _a : submitsToAccountDetails === null || submitsToAccountDetails === void 0 ? void 0 : submitsToAccountDetails.login;
            if (subtitle) {
                option.alternateText = Localize_1.translateLocal('iou.submitsTo', { name: subtitle !== null && subtitle !== void 0 ? subtitle : '' });
            }
        }
    }
    option.isDisabled = ReportUtils_1.isDraftReport(participant.reportID);
    option.selected = participant.selected;
    option.isSelected = participant.selected;
    return option;
}
exports.getReportOption = getReportOption;
/**
 * Get the display option for a given report.
 */
function getReportDisplayOption(report, unknownUserDetails) {
    var _a, _b;
    var visibleParticipantAccountIDs = ReportUtils_1.getParticipantsAccountIDsForDisplay(report, true);
    var option = createOption(visibleParticipantAccountIDs, allPersonalDetails !== null && allPersonalDetails !== void 0 ? allPersonalDetails : {}, !EmptyObject_1.isEmptyObject(report) ? report : undefined, {}, {
        showChatPreviewLine: false,
        forcePolicyNamePreview: false
    });
    // Update text & alternateText because createOption returns workspace name only if report is owned by the user
    if (option.isSelfDM) {
        option.alternateText = Localize_1.translateLocal('reportActionsView.yourSpace');
    }
    else if (option.isInvoiceRoom) {
        option.text = ReportUtils_1.getReportName(report);
        option.alternateText = Localize_1.translateLocal('workspace.common.invoices');
    }
    else if (unknownUserDetails && !option.text) {
        option.text = (_a = unknownUserDetails.text) !== null && _a !== void 0 ? _a : unknownUserDetails.login;
        option.alternateText = unknownUserDetails.login;
        option.participantsList = [__assign(__assign({}, unknownUserDetails), { displayName: unknownUserDetails.login, accountID: (_b = unknownUserDetails.accountID) !== null && _b !== void 0 ? _b : CONST_1["default"].DEFAULT_NUMBER_ID })];
    }
    else if ((report === null || report === void 0 ? void 0 : report.ownerAccountID) !== 0 || !option.text) {
        option.text = ReportUtils_1.getPolicyName({ report: report });
        option.alternateText = Localize_1.translateLocal('workspace.common.workspace');
    }
    option.isDisabled = true;
    option.selected = false;
    option.isSelected = false;
    return option;
}
exports.getReportDisplayOption = getReportDisplayOption;
/**
 * Get the option for a policy expense report.
 */
function getPolicyExpenseReportOption(participant) {
    var _a;
    var expenseReport = ReportUtils_1.isPolicyExpenseChat(participant) ? ReportUtils_1.getReportOrDraftReport(participant.reportID) : null;
    var visibleParticipantAccountIDs = Object.entries((_a = expenseReport === null || expenseReport === void 0 ? void 0 : expenseReport.participants) !== null && _a !== void 0 ? _a : {})
        .filter(function (_a) {
        var reportParticipant = _a[1];
        return reportParticipant && !ReportUtils_1.isHiddenForCurrentUser(reportParticipant.notificationPreference);
    })
        .map(function (_a) {
        var accountID = _a[0];
        return Number(accountID);
    });
    var option = createOption(visibleParticipantAccountIDs, allPersonalDetails !== null && allPersonalDetails !== void 0 ? allPersonalDetails : {}, !EmptyObject_1.isEmptyObject(expenseReport) ? expenseReport : null, {}, {
        showChatPreviewLine: false,
        forcePolicyNamePreview: false
    });
    // Update text & alternateText because createOption returns workspace name only if report is owned by the user
    option.text = ReportUtils_1.getPolicyName({ report: expenseReport });
    option.alternateText = Localize_1.translateLocal('workspace.common.workspace');
    option.selected = participant.selected;
    option.isSelected = participant.selected;
    return option;
}
exports.getPolicyExpenseReportOption = getPolicyExpenseReportOption;
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
    var userDetailsLogin = PhoneNumber_1.addSMSDomainIfPhoneNumber((_a = userDetails.login) !== null && _a !== void 0 ? _a : '');
    if ((currentUserLogin === null || currentUserLogin === void 0 ? void 0 : currentUserLogin.toLowerCase()) === userDetailsLogin.toLowerCase()) {
        return true;
    }
    // Check if userDetails login exists in loginList
    return Object.keys(loginList !== null && loginList !== void 0 ? loginList : {}).some(function (login) { return login.toLowerCase() === userDetailsLogin.toLowerCase(); });
}
exports.isCurrentUser = isCurrentUser;
/**
 * Calculates count of all enabled options
 */
function getEnabledCategoriesCount(options) {
    return Object.values(options).filter(function (option) { return option.enabled; }).length;
}
exports.getEnabledCategoriesCount = getEnabledCategoriesCount;
function getSearchValueForPhoneOrEmail(searchTerm) {
    var _a, _b;
    var parsedPhoneNumber = PhoneNumber_1.parsePhoneNumber(LoginUtils_1.appendCountryCode(expensify_common_1.Str.removeSMSDomain(searchTerm)));
    return parsedPhoneNumber.possible ? (_b = (_a = parsedPhoneNumber.number) === null || _a === void 0 ? void 0 : _a.e164) !== null && _b !== void 0 ? _b : '' : searchTerm.toLowerCase();
}
exports.getSearchValueForPhoneOrEmail = getSearchValueForPhoneOrEmail;
/**
 * Verifies that there is at least one enabled option
 */
function hasEnabledOptions(options) {
    return Object.values(options).some(function (option) { return option.enabled && option.pendingAction !== CONST_1["default"].RED_BRICK_ROAD_PENDING_ACTION.DELETE; });
}
exports.hasEnabledOptions = hasEnabledOptions;
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
function createOptionList(personalDetails, reports) {
    var reportMapForAccountIDs = {};
    var allReportOptions = [];
    if (reports) {
        Object.values(reports).forEach(function (report) {
            if (!report) {
                return;
            }
            var isOneOnOneChat = ReportUtils_1.isOneOnOneChat(report);
            var accountIDs = ReportUtils_1.getParticipantsAccountIDsForDisplay(report);
            var isChatRoom = ReportUtils_1.isChatRoom(report);
            if ((!accountIDs || accountIDs.length === 0) && !isChatRoom) {
                return;
            }
            // Save the report in the map if this is a single participant so we can associate the reportID with the
            // personal detail option later. Individuals should not be associated with single participant
            // policyExpenseChats or chatRooms since those are not people.
            if (accountIDs.length <= 1 && isOneOnOneChat) {
                reportMapForAccountIDs[accountIDs[0]] = report;
            }
            allReportOptions.push(__assign({ item: report }, createOption(accountIDs, personalDetails, report, {})));
        });
    }
    var allPersonalDetailsOptions = Object.values(personalDetails !== null && personalDetails !== void 0 ? personalDetails : {}).map(function (personalDetail) {
        var _a, _b;
        return (__assign({ item: personalDetail }, createOption([(_a = personalDetail === null || personalDetail === void 0 ? void 0 : personalDetail.accountID) !== null && _a !== void 0 ? _a : CONST_1["default"].DEFAULT_NUMBER_ID], personalDetails, reportMapForAccountIDs[(_b = personalDetail === null || personalDetail === void 0 ? void 0 : personalDetail.accountID) !== null && _b !== void 0 ? _b : CONST_1["default"].DEFAULT_NUMBER_ID], {}, { showPersonalDetails: true })));
    });
    return {
        reports: allReportOptions,
        personalDetails: allPersonalDetailsOptions
    };
}
exports.createOptionList = createOptionList;
function createOptionFromReport(report, personalDetails) {
    var accountIDs = ReportUtils_1.getParticipantsAccountIDsForDisplay(report);
    return __assign({ item: report }, createOption(accountIDs, personalDetails, report, {}));
}
exports.createOptionFromReport = createOptionFromReport;
function orderPersonalDetailsOptions(options) {
    // PersonalDetails should be ordered Alphabetically by default - https://github.com/Expensify/App/issues/8220#issuecomment-1104009435
    return orderBy_1["default"](options, [function (personalDetail) { var _a; return (_a = personalDetail.text) === null || _a === void 0 ? void 0 : _a.toLowerCase(); }], 'asc');
}
exports.orderPersonalDetailsOptions = orderPersonalDetailsOptions;
/**
 * Orders report options without grouping them by kind.
 * Usually used when there is no search value
 */
function orderReportOptions(options) {
    return orderBy_1["default"](options, [sortComparatorReportOptionByArchivedStatus, sortComparatorReportOptionByDate], ['asc', 'desc']);
}
exports.orderReportOptions = orderReportOptions;
/**
 * Ordering for report options when you have a search value, will order them by kind additionally.
 * @param options - list of options to be sorted
 * @param searchValue - search string
 * @returns a sorted list of options
 */
function orderReportOptionsWithSearch(options, searchValue, _a) {
    var _b = _a === void 0 ? {} : _a, _c = _b.preferChatroomsOverThreads, preferChatroomsOverThreads = _c === void 0 ? false : _c, _d = _b.preferPolicyExpenseChat, preferPolicyExpenseChat = _d === void 0 ? false : _d, _e = _b.preferRecentExpenseReports, preferRecentExpenseReports = _e === void 0 ? false : _e;
    var orderedByDate = orderReportOptions(options);
    return orderBy_1["default"](orderedByDate, [
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
            if (preferChatroomsOverThreads && option.isThread) {
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
exports.orderReportOptionsWithSearch = orderReportOptionsWithSearch;
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
exports.orderWorkspaceOptions = orderWorkspaceOptions;
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
        workspaceChats: orderedWorkspaceChats
    };
}
exports.orderOptions = orderOptions;
function canCreateOptimisticPersonalDetailOption(_a) {
    var recentReportOptions = _a.recentReportOptions, personalDetailsOptions = _a.personalDetailsOptions, currentUserOption = _a.currentUserOption, searchValue = _a.searchValue;
    if (recentReportOptions.length + personalDetailsOptions.length > 0) {
        return false;
    }
    if (!currentUserOption) {
        return true;
    }
    return currentUserOption.login !== PhoneNumber_1.addSMSDomainIfPhoneNumber(searchValue !== null && searchValue !== void 0 ? searchValue : '').toLowerCase() && currentUserOption.login !== (searchValue === null || searchValue === void 0 ? void 0 : searchValue.toLowerCase());
}
exports.canCreateOptimisticPersonalDetailOption = canCreateOptimisticPersonalDetailOption;
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
    var searchValue = _a.searchValue, _e = _a.loginsToExclude, loginsToExclude = _e === void 0 ? {} : _e, _f = _a.selectedOptions, selectedOptions = _f === void 0 ? [] : _f, _g = _a.reportActions, reportActions = _g === void 0 ? {} : _g, _h = _a.showChatPreviewLine, showChatPreviewLine = _h === void 0 ? false : _h, _j = _a.shouldAcceptName, shouldAcceptName = _j === void 0 ? false : _j;
    if (!searchValue) {
        return null;
    }
    var parsedPhoneNumber = PhoneNumber_1.parsePhoneNumber(LoginUtils_1.appendCountryCode(expensify_common_1.Str.removeSMSDomain(searchValue)));
    var isCurrentUserLogin = isCurrentUser({ login: searchValue });
    var isInSelectedOption = selectedOptions.some(function (option) { return 'login' in option && option.login === searchValue; });
    var isValidEmail = expensify_common_1.Str.isValidEmail(searchValue) && !expensify_common_1.Str.isDomainEmail(searchValue) && !expensify_common_1.Str.endsWith(searchValue, CONST_1["default"].SMS.DOMAIN);
    var isValidPhoneNumber = parsedPhoneNumber.possible && expensify_common_1.Str.isValidE164Phone(LoginUtils_1.getPhoneNumberWithoutSpecialChars((_d = (_c = parsedPhoneNumber.number) === null || _c === void 0 ? void 0 : _c.input) !== null && _d !== void 0 ? _d : ''));
    var isInOptionToExclude = loginsToExclude[PhoneNumber_1.addSMSDomainIfPhoneNumber(searchValue).toLowerCase()];
    if (isCurrentUserLogin || isInSelectedOption || (!isValidEmail && !isValidPhoneNumber && !shouldAcceptName) || isInOptionToExclude) {
        return null;
    }
    // Generates an optimistic account ID for new users not yet saved in Onyx
    var optimisticAccountID = UserUtils_1.generateAccountID(searchValue);
    var personalDetailsExtended = __assign(__assign({}, allPersonalDetails), (_b = {}, _b[optimisticAccountID] = {
        accountID: optimisticAccountID,
        login: searchValue
    }, _b));
    var userToInvite = createOption([optimisticAccountID], personalDetailsExtended, null, reportActions, {
        showChatPreviewLine: showChatPreviewLine
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
            type: CONST_1["default"].ICON_TYPE_AVATAR
        },
    ];
    return userToInvite;
}
exports.getUserToInviteOption = getUserToInviteOption;
function getValidReports(reports, config) {
    var _a, _b;
    var _c = config.betas, betas = _c === void 0 ? [] : _c, _d = config.includeMultipleParticipantReports, includeMultipleParticipantReports = _d === void 0 ? false : _d, _e = config.showChatPreviewLine, showChatPreviewLine = _e === void 0 ? false : _e, _f = config.forcePolicyNamePreview, forcePolicyNamePreview = _f === void 0 ? false : _f, _g = config.includeOwnedWorkspaceChats, includeOwnedWorkspaceChats = _g === void 0 ? false : _g, _h = config.includeThreads, includeThreads = _h === void 0 ? false : _h, _j = config.includeTasks, includeTasks = _j === void 0 ? false : _j, _k = config.includeMoneyRequests, includeMoneyRequests = _k === void 0 ? false : _k, _l = config.includeReadOnly, includeReadOnly = _l === void 0 ? true : _l, _m = config.transactionViolations, transactionViolations = _m === void 0 ? {} : _m, _o = config.includeSelfDM, includeSelfDM = _o === void 0 ? false : _o, _p = config.includeInvoiceRooms, includeInvoiceRooms = _p === void 0 ? false : _p, action = config.action, _q = config.selectedOptions, selectedOptions = _q === void 0 ? [] : _q, _r = config.includeP2P, includeP2P = _r === void 0 ? true : _r, _s = config.includeDomainEmail, includeDomainEmail = _s === void 0 ? false : _s, _t = config.shouldBoldTitleByDefault, shouldBoldTitleByDefault = _t === void 0 ? true : _t, _u = config.loginsToExclude, loginsToExclude = _u === void 0 ? {} : _u, shouldSeparateSelfDMChat = config.shouldSeparateSelfDMChat, shouldSeparateWorkspaceChat = config.shouldSeparateWorkspaceChat;
    var topmostReportId = Navigation_1["default"].getTopmostReportId();
    var validReportOptions = [];
    var workspaceChats = [];
    var selfDMChat;
    var preferRecentExpenseReports = action === CONST_1["default"].IOU.ACTION.CREATE;
    for (var i = 0; i < reports.length; i++) {
        // eslint-disable-next-line rulesdir/prefer-at
        var option = reports[i];
        var report = option.item;
        var doesReportHaveViolations = ReportUtils_1.shouldDisplayViolationsRBRInLHN(report, transactionViolations);
        var shouldBeInOptionList = ReportUtils_1.shouldReportBeInOptionList({
            report: report,
            currentReportId: topmostReportId,
            betas: betas,
            policies: policies,
            doesReportHaveViolations: doesReportHaveViolations,
            isInFocusMode: false,
            excludeEmptyChats: false,
            includeSelfDM: includeSelfDM,
            login: option.login,
            includeDomainEmail: includeDomainEmail
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
        var accountIDs = ReportUtils_1.getParticipantsAccountIDsForDisplay(report);
        if (isPolicyExpenseChat && report.isOwnPolicyExpenseChat && !includeOwnedWorkspaceChats) {
            continue;
        }
        // When passing includeP2P false we are trying to hide features from users that are not ready for P2P and limited to workspace chats only.
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
        if (!ReportUtils_1.canUserPerformWriteAction(report) && !includeReadOnly) {
            continue;
        }
        // In case user needs to add credit bank account, don't allow them to submit an expense from the workspace.
        if (includeOwnedWorkspaceChats && ReportUtils_1.hasIOUWaitingOnCurrentUserBankAccount(report)) {
            continue;
        }
        if ((!accountIDs || accountIDs.length === 0) && !isChatRoom) {
            continue;
        }
        if (option.login === CONST_1["default"].EMAIL.NOTIFICATIONS) {
            continue;
        }
        var isCurrentUserOwnedPolicyExpenseChatThatCouldShow = option.isPolicyExpenseChat && option.ownerAccountID === currentUserAccountID && includeOwnedWorkspaceChats && !option.private_isArchived;
        var shouldShowInvoiceRoom = includeInvoiceRooms && ReportUtils_1.isInvoiceRoom(option.item) && ReportUtils_1.isPolicyAdmin(option.policyID, policies) && !option.private_isArchived && PolicyUtils_1.canSendInvoiceFromWorkspace(option.policyID);
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
        if (action === CONST_1["default"].IOU.ACTION.CATEGORIZE) {
            var reportPolicy = allPolicies === null || allPolicies === void 0 ? void 0 : allPolicies["" + ONYXKEYS_1["default"].COLLECTION.POLICY + option.policyID];
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
            var reportPreviewAction = (_a = allSortedReportActions[option.reportID]) === null || _a === void 0 ? void 0 : _a.find(function (reportAction) { return ReportActionsUtils_1.isActionOfType(reportAction, CONST_1["default"].REPORT.ACTIONS.TYPE.REPORT_PREVIEW); });
            if (reportPreviewAction) {
                var iouReportID = ReportActionsUtils_1.getIOUReportIDFromReportActionPreview(reportPreviewAction);
                var iouReportActions = iouReportID ? (_b = allSortedReportActions[iouReportID]) !== null && _b !== void 0 ? _b : [] : [];
                var lastIOUAction = iouReportActions.find(function (iouAction) { return iouAction.actionName === CONST_1["default"].REPORT.ACTIONS.TYPE.IOU; });
                if (lastIOUAction) {
                    lastIOUCreationDate = lastIOUAction.lastModified;
                }
            }
        }
        var newReportOption = __assign(__assign({}, option), { alternateText: alternateText,
            isSelected: isSelected,
            isBold: isBold,
            lastIOUCreationDate: lastIOUCreationDate });
        if (shouldSeparateWorkspaceChat && newReportOption.isOwnPolicyExpenseChat && !newReportOption.private_isArchived) {
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
        selfDMOption: selfDMChat
    };
}
/**
 * Whether user submitted already an expense or scanned receipt
 */
function getIsUserSubmittedExpenseOrScannedReceipt() {
    return !!(nvpDismissedProductTraining === null || nvpDismissedProductTraining === void 0 ? void 0 : nvpDismissedProductTraining[CONST_1["default"].PRODUCT_TRAINING_TOOLTIP_NAMES.SCAN_TEST_TOOLTIP]);
}
exports.getIsUserSubmittedExpenseOrScannedReceipt = getIsUserSubmittedExpenseOrScannedReceipt;
/**
 * Whether the report is a Manager McTest report
 */
function isManagerMcTestReport(report) {
    var _a, _b;
    return (_b = (_a = report.participantsList) === null || _a === void 0 ? void 0 : _a.some(function (participant) { return participant.accountID === CONST_1["default"].ACCOUNT_ID.MANAGER_MCTEST; })) !== null && _b !== void 0 ? _b : false;
}
/**
 * Helper method to check if participant email is Manager McTest
 */
function isSelectedManagerMcTest(email) {
    return email === CONST_1["default"].EMAIL.MANAGER_MCTEST;
}
exports.isSelectedManagerMcTest = isSelectedManagerMcTest;
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
            (detail === null || detail === void 0 ? void 0 : detail.login) === CONST_1["default"].SETUP_SPECIALIST_LOGIN) {
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
exports.getValidPersonalDetailOptions = getValidPersonalDetailOptions;
/**
 * Options are reports and personal details. This function filters out the options that are not valid to be displayed.
 */
function getValidOptions(options, _a) {
    var _b, _c, _d;
    if (_a === void 0) { _a = {}; }
    var _e = _a.excludeLogins, excludeLogins = _e === void 0 ? {} : _e, _f = _a.includeSelectedOptions, includeSelectedOptions = _f === void 0 ? false : _f, _g = _a.includeRecentReports, includeRecentReports = _g === void 0 ? true : _g, recentAttendees = _a.recentAttendees, _h = _a.selectedOptions, selectedOptions = _h === void 0 ? [] : _h, _j = _a.shouldSeparateSelfDMChat, shouldSeparateSelfDMChat = _j === void 0 ? false : _j, _k = _a.shouldSeparateWorkspaceChat, shouldSeparateWorkspaceChat = _k === void 0 ? false : _k, _l = _a.excludeHiddenThreads, excludeHiddenThreads = _l === void 0 ? false : _l, _m = _a.excludeHiddenChatRoom, excludeHiddenChatRoom = _m === void 0 ? false : _m, _o = _a.canShowManagerMcTest, canShowManagerMcTest = _o === void 0 ? false : _o, config = __rest(_a, ["excludeLogins", "includeSelectedOptions", "includeRecentReports", "recentAttendees", "selectedOptions", "shouldSeparateSelfDMChat", "shouldSeparateWorkspaceChat", "excludeHiddenThreads", "excludeHiddenChatRoom", "canShowManagerMcTest"]);
    var userHasReportWithManagerMcTest = Object.values(options.reports).some(function (report) { return isManagerMcTestReport(report); });
    // If user has a workspace that he isn't owner, it means he was invited to it.
    var isUserInvitedToWorkspace = Object.values(policies !== null && policies !== void 0 ? policies : {}).some(function (policy) { return (policy === null || policy === void 0 ? void 0 : policy.ownerAccountID) !== currentUserAccountID && (policy === null || policy === void 0 ? void 0 : policy.isPolicyExpenseChatEnabled) && (policy === null || policy === void 0 ? void 0 : policy.id) && policy.id !== CONST_1["default"].POLICY.ID_FAKE; });
    // Gather shared configs:
    var loginsToExclude = __assign(__assign((_b = {}, _b[CONST_1["default"].EMAIL.NOTIFICATIONS] = true, _b), excludeLogins), (_c = {}, _c[CONST_1["default"].EMAIL.MANAGER_MCTEST] = !canShowManagerMcTest ||
        (getIsUserSubmittedExpenseOrScannedReceipt() && !userHasReportWithManagerMcTest) ||
        !Permissions_1["default"].canUseManagerMcTest(config.betas) ||
        isUserInvitedToWorkspace, _c));
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
    var _p = config.includeP2P, includeP2P = _p === void 0 ? true : _p, _q = config.shouldBoldTitleByDefault, shouldBoldTitleByDefault = _q === void 0 ? true : _q, _r = config.includeDomainEmail, includeDomainEmail = _r === void 0 ? false : _r, getValidReportsConfig = __rest(config, ["includeP2P", "shouldBoldTitleByDefault", "includeDomainEmail"]);
    // Get valid recent reports:
    var recentReportOptions = [];
    var workspaceChats = [];
    var selfDMChat;
    if (includeRecentReports) {
        var _s = getValidReports(options.reports, __assign(__assign({}, getValidReportsConfig), { includeP2P: includeP2P,
            includeDomainEmail: includeDomainEmail,
            selectedOptions: selectedOptions,
            loginsToExclude: loginsToExclude,
            shouldBoldTitleByDefault: shouldBoldTitleByDefault,
            shouldSeparateSelfDMChat: shouldSeparateSelfDMChat,
            shouldSeparateWorkspaceChat: shouldSeparateWorkspaceChat })), recentReports = _s.recentReports, workspaceOptions = _s.workspaceOptions, selfDMOption = _s.selfDMOption;
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
        current: undefined
    };
    if (includeP2P) {
        var personalDetailLoginsToExclude = loginsToExclude;
        if (currentUserLogin) {
            personalDetailLoginsToExclude = __assign(__assign({}, loginsToExclude), (_d = {}, _d[currentUserLogin] = true, _d));
        }
        personalDetailsOptions = getValidPersonalDetailOptions(options.personalDetails, {
            loginsToExclude: personalDetailLoginsToExclude,
            shouldBoldTitleByDefault: shouldBoldTitleByDefault,
            includeDomainEmail: includeDomainEmail,
            currentUserRef: currentUserRef
        });
    }
    if (excludeHiddenThreads) {
        recentReportOptions = recentReportOptions.filter(function (option) { return !option.isThread || option.notificationPreference !== CONST_1["default"].REPORT.NOTIFICATION_PREFERENCE.HIDDEN; });
    }
    if (excludeHiddenChatRoom) {
        recentReportOptions = recentReportOptions.filter(function (option) { return !option.isChatRoom || option.notificationPreference !== CONST_1["default"].REPORT.NOTIFICATION_PREFERENCE.HIDDEN; });
    }
    return {
        personalDetails: personalDetailsOptions,
        recentReports: recentReportOptions,
        currentUserOption: currentUserRef.current,
        // User to invite is generated by the search input of a user.
        // As this function isn't concerned with any search input yet, this is null (will be set when using filterOptions).
        userToInvite: null,
        workspaceChats: workspaceChats,
        selfDMChat: selfDMChat
    };
}
exports.getValidOptions = getValidOptions;
/**
 * Build the options for the Search view
 */
function getSearchOptions(options, betas, isUsedInChatFinder) {
    if (betas === void 0) { betas = []; }
    if (isUsedInChatFinder === void 0) { isUsedInChatFinder = true; }
    Timing_1["default"].start(CONST_1["default"].TIMING.LOAD_SEARCH_OPTIONS);
    Performance_1["default"].markStart(CONST_1["default"].TIMING.LOAD_SEARCH_OPTIONS);
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
        includeSelfDM: true,
        shouldBoldTitleByDefault: !isUsedInChatFinder,
        excludeHiddenThreads: true,
        excludeHiddenChatRoom: true
    });
    var orderedOptions = orderOptions(optionList);
    Timing_1["default"].end(CONST_1["default"].TIMING.LOAD_SEARCH_OPTIONS);
    Performance_1["default"].markEnd(CONST_1["default"].TIMING.LOAD_SEARCH_OPTIONS);
    return __assign(__assign({}, optionList), orderedOptions);
}
exports.getSearchOptions = getSearchOptions;
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
        includeReadOnly: false
    });
}
exports.getShareLogOptions = getShareLogOptions;
/**
 * Build the IOUConfirmation options for showing the payee personalDetail
 */
function getIOUConfirmationOptionsFromPayeePersonalDetail(personalDetail, amountText) {
    var _a, _b, _c, _d, _e, _f;
    var login = (_a = personalDetail === null || personalDetail === void 0 ? void 0 : personalDetail.login) !== null && _a !== void 0 ? _a : '';
    return {
        text: LocalePhoneNumber_1.formatPhoneNumber(PersonalDetailsUtils_1.getDisplayNameOrDefault(personalDetail, login)),
        alternateText: LocalePhoneNumber_1.formatPhoneNumber(login || PersonalDetailsUtils_1.getDisplayNameOrDefault(personalDetail, '', false)),
        icons: [
            {
                source: (_b = personalDetail === null || personalDetail === void 0 ? void 0 : personalDetail.avatar) !== null && _b !== void 0 ? _b : Expensicons_1.FallbackAvatar,
                name: (_c = personalDetail === null || personalDetail === void 0 ? void 0 : personalDetail.login) !== null && _c !== void 0 ? _c : '',
                type: CONST_1["default"].ICON_TYPE_AVATAR,
                id: personalDetail === null || personalDetail === void 0 ? void 0 : personalDetail.accountID
            },
        ],
        descriptiveText: amountText !== null && amountText !== void 0 ? amountText : '',
        login: (_d = personalDetail === null || personalDetail === void 0 ? void 0 : personalDetail.login) !== null && _d !== void 0 ? _d : '',
        accountID: (_e = personalDetail === null || personalDetail === void 0 ? void 0 : personalDetail.accountID) !== null && _e !== void 0 ? _e : CONST_1["default"].DEFAULT_NUMBER_ID,
        keyForList: String((_f = personalDetail === null || personalDetail === void 0 ? void 0 : personalDetail.accountID) !== null && _f !== void 0 ? _f : CONST_1["default"].DEFAULT_NUMBER_ID),
        isInteractive: false
    };
}
exports.getIOUConfirmationOptionsFromPayeePersonalDetail = getIOUConfirmationOptionsFromPayeePersonalDetail;
function getAttendeeOptions(reports, personalDetails, betas, attendees, recentAttendees, includeOwnedWorkspaceChats, includeP2P, includeInvoiceRooms, action) {
    if (includeOwnedWorkspaceChats === void 0) { includeOwnedWorkspaceChats = false; }
    if (includeP2P === void 0) { includeP2P = true; }
    if (includeInvoiceRooms === void 0) { includeInvoiceRooms = false; }
    if (action === void 0) { action = undefined; }
    return getValidOptions({ reports: reports, personalDetails: personalDetails }, {
        betas: betas,
        selectedOptions: attendees,
        excludeLogins: CONST_1["default"].EXPENSIFY_EMAILS_OBJECT,
        includeOwnedWorkspaceChats: includeOwnedWorkspaceChats,
        includeRecentReports: false,
        includeP2P: includeP2P,
        includeSelectedOptions: false,
        includeSelfDM: false,
        includeInvoiceRooms: includeInvoiceRooms,
        action: action,
        recentAttendees: recentAttendees
    });
}
exports.getAttendeeOptions = getAttendeeOptions;
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
        includeSelfDM: true
    });
}
exports.getShareDestinationOptions = getShareDestinationOptions;
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
        keyForList: member.keyForList || String(accountID !== null && accountID !== void 0 ? accountID : CONST_1["default"].DEFAULT_NUMBER_ID) || '',
        isSelected: (_a = member.isSelected) !== null && _a !== void 0 ? _a : false,
        isDisabled: (_b = member.isDisabled) !== null && _b !== void 0 ? _b : false,
        accountID: accountID,
        login: (_c = member.login) !== null && _c !== void 0 ? _c : '',
        icons: member.icons,
        pendingAction: member.pendingAction,
        reportID: member.reportID
    };
}
exports.formatMemberForList = formatMemberForList;
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
        includeRecentReports: includeRecentReports
    });
    var orderedOptions = orderOptions(options);
    return __assign(__assign({}, options), { personalDetails: orderedOptions.personalDetails, recentReports: orderedOptions.recentReports });
}
exports.getMemberInviteOptions = getMemberInviteOptions;
/**
 * Helper method that returns the text to be used for the header's message and title (if any)
 */
function getHeaderMessage(hasSelectableOptions, hasUserToInvite, searchValue, hasMatchedParticipant) {
    if (hasMatchedParticipant === void 0) { hasMatchedParticipant = false; }
    var isValidPhone = PhoneNumber_1.parsePhoneNumber(LoginUtils_1.appendCountryCode(searchValue)).possible;
    var isValidEmail = expensify_common_1.Str.isValidEmail(searchValue);
    if (searchValue && CONST_1["default"].REGEX.DIGITS_AND_PLUS.test(searchValue) && !isValidPhone && !hasSelectableOptions) {
        return Localize_1.translate(preferredLocale, 'messages.errorMessageInvalidPhone');
    }
    // Without a search value, it would be very confusing to see a search validation message.
    // Therefore, this skips the validation when there is no search value.
    if (searchValue && !hasSelectableOptions && !hasUserToInvite) {
        if (/^\d+$/.test(searchValue) && !isValidPhone) {
            return Localize_1.translate(preferredLocale, 'messages.errorMessageInvalidPhone');
        }
        if (/@/.test(searchValue) && !isValidEmail) {
            return Localize_1.translate(preferredLocale, 'messages.errorMessageInvalidEmail');
        }
        if (hasMatchedParticipant && (isValidEmail || isValidPhone)) {
            return '';
        }
        return Localize_1.translate(preferredLocale, 'common.noResultsFound');
    }
    return '';
}
exports.getHeaderMessage = getHeaderMessage;
/**
 * Helper method for non-user lists (eg. categories and tags) that returns the text to be used for the header's message and title (if any)
 */
function getHeaderMessageForNonUserList(hasSelectableOptions, searchValue) {
    if (searchValue && !hasSelectableOptions) {
        return Localize_1.translate(preferredLocale, 'common.noResultsFound');
    }
    return '';
}
exports.getHeaderMessageForNonUserList = getHeaderMessageForNonUserList;
/**
 * Helper method to check whether an option can show tooltip or not
 */
function shouldOptionShowTooltip(option) {
    return !option.private_isArchived;
}
exports.shouldOptionShowTooltip = shouldOptionShowTooltip;
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
                shouldShow: selectedOptions.length > 0
            }
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
            shouldShow: selectedParticipantsWithoutDetails.length > 0
        }
    };
}
exports.formatSectionsFromSearchTerm = formatSectionsFromSearchTerm;
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
exports.getFirstKeyForList = getFirstKeyForList;
function getPersonalDetailSearchTerms(item) {
    var _a, _b, _c, _d, _e, _f;
    return [(_c = (_b = (_a = item.participantsList) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.displayName) !== null && _c !== void 0 ? _c : '', (_d = item.login) !== null && _d !== void 0 ? _d : '', (_f = (_e = item.login) === null || _e === void 0 ? void 0 : _e.replace(CONST_1["default"].EMAIL_SEARCH_REGEX, '')) !== null && _f !== void 0 ? _f : ''];
}
exports.getPersonalDetailSearchTerms = getPersonalDetailSearchTerms;
function getCurrentUserSearchTerms(item) {
    var _a, _b, _c, _d;
    return [(_a = item.text) !== null && _a !== void 0 ? _a : '', (_b = item.login) !== null && _b !== void 0 ? _b : '', (_d = (_c = item.login) === null || _c === void 0 ? void 0 : _c.replace(CONST_1["default"].EMAIL_SEARCH_REGEX, '')) !== null && _d !== void 0 ? _d : ''];
}
exports.getCurrentUserSearchTerms = getCurrentUserSearchTerms;
/**
 * Remove the personal details for the DMs that are already in the recent reports so that we don't show duplicates.
 */
function filteredPersonalDetailsOfRecentReports(recentReports, personalDetails) {
    var excludedLogins = new Set(recentReports.map(function (report) { return report.login; }));
    return personalDetails.filter(function (personalDetail) { return !excludedLogins.has(personalDetail.login); });
}
exports.filteredPersonalDetailsOfRecentReports = filteredPersonalDetailsOfRecentReports;
/**
 * Filters options based on the search input value
 */
function filterReports(reports, searchTerms) {
    var normalizedSearchTerms = searchTerms.map(function (term) { return StringUtils_1["default"].normalizeAccents(term); });
    // We search eventually for multiple whitespace separated search terms.
    // We start with the search term at the end, and then narrow down those filtered search results with the next search term.
    // We repeat (reduce) this until all search terms have been used:
    var filteredReports = normalizedSearchTerms.reduceRight(function (items, term) {
        return filterArrayByMatch_1["default"](items, term, function (item) {
            var values = [];
            if (item.text) {
                values.push(StringUtils_1["default"].normalizeAccents(item.text));
                values.push(StringUtils_1["default"].normalizeAccents(item.text).replace(/['-]/g, ''));
            }
            if (item.login) {
                values.push(StringUtils_1["default"].normalizeAccents(item.login));
                values.push(StringUtils_1["default"].normalizeAccents(item.login.replace(CONST_1["default"].EMAIL_SEARCH_REGEX, '')));
            }
            if (item.isThread) {
                if (item.alternateText) {
                    values.push(StringUtils_1["default"].normalizeAccents(item.alternateText));
                }
            }
            else if (!!item.isChatRoom || !!item.isPolicyExpenseChat) {
                if (item.subtitle) {
                    values.push(StringUtils_1["default"].normalizeAccents(item.subtitle));
                }
            }
            return uniqFast(values);
        });
    }, 
    // We start from all unfiltered reports:
    reports);
    return filteredReports;
}
exports.filterReports = filterReports;
function filterWorkspaceChats(reports, searchTerms) {
    var filteredReports = searchTerms.reduceRight(function (items, term) {
        return filterArrayByMatch_1["default"](items, term, function (item) {
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
exports.filterWorkspaceChats = filterWorkspaceChats;
function filterPersonalDetails(personalDetails, searchTerms) {
    return searchTerms.reduceRight(function (items, term) {
        return filterArrayByMatch_1["default"](items, term, function (item) {
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
        searchValue: searchValue
    });
    if (!canCreateOptimisticDetail) {
        return null;
    }
    var loginsToExclude = __assign((_a = {}, _a[CONST_1["default"].EMAIL.NOTIFICATIONS] = true, _a), excludeLogins);
    return getUserToInviteOption(__assign({ searchValue: searchValue,
        loginsToExclude: loginsToExclude }, config));
}
exports.filterUserToInvite = filterUserToInvite;
function filterSelfDMChat(report, searchTerms) {
    var isMatch = searchTerms.every(function (term) {
        var values = [];
        if (report.text) {
            values.push(report.text);
        }
        if (report.login) {
            values.push(report.login);
            values.push(report.login.replace(CONST_1["default"].EMAIL_SEARCH_REGEX, ''));
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
exports.filterSelfDMChat = filterSelfDMChat;
function filterOptions(options, searchInputValue, config) {
    var _a, _b;
    var parsedPhoneNumber = PhoneNumber_1.parsePhoneNumber(LoginUtils_1.appendCountryCode(expensify_common_1.Str.removeSMSDomain(searchInputValue)));
    var searchValue = parsedPhoneNumber.possible && ((_a = parsedPhoneNumber.number) === null || _a === void 0 ? void 0 : _a.e164) ? parsedPhoneNumber.number.e164 : searchInputValue.toLowerCase();
    var searchTerms = searchValue ? searchValue.split(' ') : [];
    var recentReports = filterReports(options.recentReports, searchTerms);
    var personalDetails = filterPersonalDetails(options.personalDetails, searchTerms);
    var currentUserOption = filterCurrentUserOption(options.currentUserOption, searchTerms);
    var userToInvite = filterUserToInvite({
        recentReports: recentReports,
        personalDetails: personalDetails,
        currentUserOption: currentUserOption
    }, searchValue, config);
    var workspaceChats = filterWorkspaceChats((_b = options.workspaceChats) !== null && _b !== void 0 ? _b : [], searchTerms);
    var selfDMChat = options.selfDMChat ? filterSelfDMChat(options.selfDMChat, searchTerms) : undefined;
    return {
        personalDetails: personalDetails,
        recentReports: recentReports,
        userToInvite: userToInvite,
        currentUserOption: currentUserOption,
        workspaceChats: workspaceChats,
        selfDMChat: selfDMChat
    };
}
exports.filterOptions = filterOptions;
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
        personalDetails: orderedPersonalDetails
    };
}
exports.combineOrderingOfReportsAndPersonalDetails = combineOrderingOfReportsAndPersonalDetails;
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
exports.filterAndOrderOptions = filterAndOrderOptions;
function sortAlphabetically(items, key) {
    return items.sort(function (a, b) { var _a, _b; return ((_a = a[key]) !== null && _a !== void 0 ? _a : '').toLowerCase().localeCompare(((_b = b[key]) !== null && _b !== void 0 ? _b : '').toLowerCase()); });
}
exports.sortAlphabetically = sortAlphabetically;
function getEmptyOptions() {
    return {
        recentReports: [],
        personalDetails: [],
        userToInvite: null,
        currentUserOption: null
    };
}
exports.getEmptyOptions = getEmptyOptions;
function shouldUseBoldText(report) {
    var _a;
    var notificationPreference = (_a = report.notificationPreference) !== null && _a !== void 0 ? _a : ReportUtils_1.getReportNotificationPreference(report);
    return report.isUnread === true && notificationPreference !== CONST_1["default"].REPORT.NOTIFICATION_PREFERENCE.MUTE && !ReportUtils_1.isHiddenForCurrentUser(notificationPreference);
}
exports.shouldUseBoldText = shouldUseBoldText;
function getManagerMcTestParticipant() {
    var managerMcTestPersonalDetails = Object.values(allPersonalDetails !== null && allPersonalDetails !== void 0 ? allPersonalDetails : {}).find(function (personalDetails) { return (personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails.login) === CONST_1["default"].EMAIL.MANAGER_MCTEST; });
    return managerMcTestPersonalDetails ? getParticipantsOption(managerMcTestPersonalDetails, allPersonalDetails) : undefined;
}
exports.getManagerMcTestParticipant = getManagerMcTestParticipant;
