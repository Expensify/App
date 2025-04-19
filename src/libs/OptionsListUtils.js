
/* eslint-disable @typescript-eslint/prefer-for-of */
var __assign =
    (this && this.__assign) ||
    function () {
        __assign =
            Object.assign ||
            function (t) {
                for (var s, i = 1, n = arguments.length; i < n; i++) {
                    s = arguments[i];
                    for (const p in s) {if (Object.prototype.hasOwnProperty.call(s, p)) {t[p] = s[p];}}
                }
                return t;
            };
        return __assign.apply(this, arguments);
    };
const __rest =
    (this && this.__rest) ||
    function (s, e) {
        const t = {};
        for (var p in s) {if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) {t[p] = s[p];}}
        if (s != null && typeof Object.getOwnPropertySymbols === 'function')
            {for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) {t[p[i]] = s[p[i]];}
            }}
        return t;
    };
exports.__esModule = true;
exports.combineOrderingOfReportsAndPersonalDetails =
    exports.hasReportErrors =
    exports.getReportDisplayOption =
    exports.getAlternateText =
    exports.getAttendeeOptions =
    exports.shouldUseBoldText =
    exports.getEmptyOptions =
    exports.getCurrentUserSearchTerms =
    exports.getPersonalDetailSearchTerms =
    exports.getUserToInviteOption =
    exports.canCreateOptimisticPersonalDetailOption =
    exports.getFirstKeyForList =
    exports.getReportOption =
    exports.createOptionFromReport =
    exports.createOptionList =
    exports.filterAndOrderOptions =
    exports.orderPersonalDetailsOptions =
    exports.orderReportOptionsWithSearch =
    exports.orderReportOptions =
    exports.filteredPersonalDetailsOfRecentReports =
    exports.filterOptions =
    exports.filterUserToInvite =
    exports.orderOptions =
    exports.getShareLogOptions =
    exports.formatSectionsFromSearchTerm =
    exports.formatMemberForList =
    exports.sortAlphabetically =
    exports.hasEnabledOptions =
    exports.getEnabledCategoriesCount =
    exports.getLastMessageTextForReport =
    exports.getLastActorDisplayName =
    exports.shouldOptionShowTooltip =
    exports.isSearchStringMatch =
    exports.getParticipantsOption =
    exports.getIOUReportIDOfLastAction =
    exports.getPolicyExpenseReportOption =
    exports.isSearchStringMatchUserDetails =
    exports.getIOUConfirmationOptionsFromPayeePersonalDetail =
    exports.getPersonalDetailsForAccountIDs =
    exports.getSearchValueForPhoneOrEmail =
    exports.getHeaderMessageForNonUserList =
    exports.getHeaderMessage =
    exports.getMemberInviteOptions =
    exports.getShareDestinationOptions =
    exports.getSearchOptions =
    exports.getValidPersonalDetailOptions =
    exports.getValidOptions =
    exports.isPersonalDetailsReady =
    exports.isCurrentUser =
    exports.getAvatarsForAccountIDs =
        void 0;
exports.shouldShowLastActorDisplayName =
    exports.isSelectedManagerMcTest =
    exports.getManagerMcTestParticipant =
    exports.getIsUserSubmittedExpenseOrScannedReceipt =
    exports.filterReports =
    exports.filterSelfDMChat =
    exports.orderWorkspaceOptions =
    exports.filterWorkspaceChats =
        void 0;
/* eslint-disable no-continue */
const expensify_common_1 = require('expensify-common');
const orderBy_1 = require('lodash/orderBy');
const react_native_onyx_1 = require('react-native-onyx');
const Expensicons_1 = require('@components/Icon/Expensicons');
const CONST_1 = require('@src/CONST');
const ONYXKEYS_1 = require('@src/ONYXKEYS');
const EmptyObject_1 = require('@src/types/utils/EmptyObject');
const Timing_1 = require('./actions/Timing');
const filterArrayByMatch_1 = require('./filterArrayByMatch');
const isReportMessageAttachment_1 = require('./isReportMessageAttachment');
const LocalePhoneNumber_1 = require('./LocalePhoneNumber');
const Localize_1 = require('./Localize');
const LoginUtils_1 = require('./LoginUtils');
const ModifiedExpenseMessage_1 = require('./ModifiedExpenseMessage');
const Navigation_1 = require('./Navigation/Navigation');
const Parser_1 = require('./Parser');
const Performance_1 = require('./Performance');
const Permissions_1 = require('./Permissions');
const PersonalDetailsUtils_1 = require('./PersonalDetailsUtils');
const PhoneNumber_1 = require('./PhoneNumber');
const PolicyUtils_1 = require('./PolicyUtils');
const ReportActionsUtils_1 = require('./ReportActionsUtils');
const ReportUtils_1 = require('./ReportUtils');
const StringUtils_1 = require('./StringUtils');
const TaskUtils_1 = require('./TaskUtils');
const UserUtils_1 = require('./UserUtils');
/**
 * OptionsListUtils is used to build a list options passed to the OptionsList component. Several different UI views can
 * be configured to display different results based on the options passed to the private getOptions() method. Public
 * methods should be named for the views they build options for and then exported for use in a component.
 */
let currentUserLogin;
let currentUserAccountID;
react_native_onyx_1['default'].connect({
    key: ONYXKEYS_1['default'].SESSION,
    callback (value) {
        currentUserLogin = value === null || value === void 0 ? void 0 : value.email;
        currentUserAccountID = value === null || value === void 0 ? void 0 : value.accountID;
    },
});
let loginList;
react_native_onyx_1['default'].connect({
    key: ONYXKEYS_1['default'].LOGIN_LIST,
    callback (value) {
        return (loginList = EmptyObject_1.isEmptyObject(value) ? {} : value);
    },
});
let allPersonalDetails;
react_native_onyx_1['default'].connect({
    key: ONYXKEYS_1['default'].PERSONAL_DETAILS_LIST,
    callback (value) {
        return (allPersonalDetails = EmptyObject_1.isEmptyObject(value) ? {} : value);
    },
});
let preferredLocale = CONST_1['default'].LOCALES.DEFAULT;
react_native_onyx_1['default'].connect({
    key: ONYXKEYS_1['default'].NVP_PREFERRED_LOCALE,
    callback (value) {
        if (!value) {
            return;
        }
        preferredLocale = value;
    },
});
const policies = {};
react_native_onyx_1['default'].connect({
    key: ONYXKEYS_1['default'].COLLECTION.POLICY,
    callback (policy, key) {
        if (!policy || !key || !policy.name) {
            return;
        }
        policies[key] = policy;
    },
});
let allPolicies = {};
react_native_onyx_1['default'].connect({
    key: ONYXKEYS_1['default'].COLLECTION.POLICY,
    waitForCollectionCallback: true,
    callback (val) {
        return (allPolicies = val);
    },
});
let allReports;
react_native_onyx_1['default'].connect({
    key: ONYXKEYS_1['default'].COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback (value) {
        allReports = value;
    },
});
const lastReportActions = {};
const allSortedReportActions = {};
let allReportActions;
const lastVisibleReportActions = {};
react_native_onyx_1['default'].connect({
    key: ONYXKEYS_1['default'].COLLECTION.REPORT_ACTIONS,
    waitForCollectionCallback: true,
    callback (actions) {
        if (!actions) {
            return;
        }
        allReportActions = actions !== null && actions !== void 0 ? actions : {};
        // Iterate over the report actions to build the sorted and lastVisible report actions objects
        Object.entries(allReportActions).forEach(function (reportActions) {
            let _a; let _b;
            const reportID = reportActions[0].split('_').at(1);
            if (!reportID) {
                return;
            }
            const reportActionsArray = Object.values((_a = reportActions[1]) !== null && _a !== void 0 ? _a : {});
            let sortedReportActions = ReportActionsUtils_1.getSortedReportActions(reportActionsArray, true);
            allSortedReportActions[reportID] = sortedReportActions;
            // If the report is a one-transaction report and has , we need to return the combined reportActions so that the LHN can display modifications
            // to the transaction thread or the report itself
            const transactionThreadReportID = ReportActionsUtils_1.getOneTransactionThreadReportID(reportID, actions[reportActions[0]]);
            if (transactionThreadReportID) {
                const transactionThreadReportActionsArray = Object.values(
                    (_b = actions[`${  ONYXKEYS_1['default'].COLLECTION.REPORT_ACTIONS  }${transactionThreadReportID}`]) !== null && _b !== void 0 ? _b : {},
                );
                sortedReportActions = ReportActionsUtils_1.getCombinedReportActions(sortedReportActions, transactionThreadReportID, transactionThreadReportActionsArray, reportID, false);
            }
            const firstReportAction = sortedReportActions.at(0);
            if (!firstReportAction) {
                delete lastReportActions[reportID];
            } else {
                lastReportActions[reportID] = firstReportAction;
            }
            const report = allReports === null || allReports === void 0 ? void 0 : allReports[`${  ONYXKEYS_1['default'].COLLECTION.REPORT  }${reportID}`];
            const isWriteActionAllowed = ReportUtils_1.canUserPerformWriteAction(report);
            // The report is only visible if it is the last action not deleted that
            // does not match a closed or created state.
            const reportActionsForDisplay = sortedReportActions.filter(function (reportAction, actionKey) {
                return (
                    ReportActionsUtils_1.shouldReportActionBeVisible(reportAction, actionKey, isWriteActionAllowed) &&
                    !ReportActionsUtils_1.isWhisperAction(reportAction) &&
                    reportAction.actionName !== CONST_1['default'].REPORT.ACTIONS.TYPE.CREATED &&
                    reportAction.pendingAction !== CONST_1['default'].RED_BRICK_ROAD_PENDING_ACTION.DELETE
                );
            });
            const reportActionForDisplay = reportActionsForDisplay.at(0);
            if (!reportActionForDisplay) {
                delete lastVisibleReportActions[reportID];
                return;
            }
            lastVisibleReportActions[reportID] = reportActionForDisplay;
        });
    },
});
let activePolicyID;
react_native_onyx_1['default'].connect({
    key: ONYXKEYS_1['default'].NVP_ACTIVE_POLICY_ID,
    callback (value) {
        return (activePolicyID = value);
    },
});
let nvpDismissedProductTraining;
react_native_onyx_1['default'].connect({
    key: ONYXKEYS_1['default'].NVP_DISMISSED_PRODUCT_TRAINING,
    callback (value) {
        return (nvpDismissedProductTraining = value);
    },
});
/**
 * @param defaultValues {login: accountID} In workspace invite page, when new user is added we pass available data to opt in
 * @returns Returns avatar data for a list of user accountIDs
 */
function getAvatarsForAccountIDs(accountIDs, personalDetails, defaultValues) {
    if (defaultValues === void 0) {
        defaultValues = {};
    }
    const reversedDefaultValues = {};
    Object.entries(defaultValues).forEach(function (item) {
        reversedDefaultValues[item[1]] = item[0];
    });
    return accountIDs.map(function (accountID) {
        let _a; let _b; let _c; let _d;
        const login = (_a = reversedDefaultValues[accountID]) !== null && _a !== void 0 ? _a : '';
        const userPersonalDetail =
            (_b = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[accountID]) !== null && _b !== void 0 ? _b : {login, accountID};
        return {
            id: accountID,
            source: (_c = userPersonalDetail.avatar) !== null && _c !== void 0 ? _c : Expensicons_1.FallbackAvatar,
            type: CONST_1['default'].ICON_TYPE_AVATAR,
            name: (_d = userPersonalDetail.login) !== null && _d !== void 0 ? _d : '',
        };
    });
}
exports.getAvatarsForAccountIDs = getAvatarsForAccountIDs;
/**
 * Returns the personal details for an array of accountIDs
 * @returns keys of the object are emails, values are PersonalDetails objects.
 */
function getPersonalDetailsForAccountIDs(accountIDs, personalDetails) {
    const personalDetailsForAccountIDs = {};
    if (!personalDetails) {
        return personalDetailsForAccountIDs;
    }
    accountIDs === null || accountIDs === void 0
        ? void 0
        : accountIDs.forEach(function (accountID) {
              let _a;
              const cleanAccountID = Number(accountID);
              if (!cleanAccountID) {
                  return;
              }
              let personalDetail = (_a = personalDetails[accountID]) !== null && _a !== void 0 ? _a : undefined;
              if (!personalDetail) {
                  personalDetail = {};
              }
              if (cleanAccountID === CONST_1['default'].ACCOUNT_ID.CONCIERGE) {
                  personalDetail.avatar = CONST_1['default'].CONCIERGE_ICON_URL;
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
    const personalDetailsKeys = Object.keys(personalDetails !== null && personalDetails !== void 0 ? personalDetails : {});
    return personalDetailsKeys.some(function (key) {
        let _a;
        return (_a = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[key]) === null || _a === void 0 ? void 0 : _a.accountID;
    });
}
exports.isPersonalDetailsReady = isPersonalDetailsReady;
/**
 * Get the participant option for a report.
 */
function getParticipantsOption(participant, personalDetails) {
    let _a; let _b; let _c; let _d; let _e; let _f;
    const detail = participant.accountID ? getPersonalDetailsForAccountIDs([participant.accountID], personalDetails)[participant.accountID] : undefined;
    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
    const login = (detail === null || detail === void 0 ? void 0 : detail.login) || participant.login || '';
    const displayName = LocalePhoneNumber_1.formatPhoneNumber(PersonalDetailsUtils_1.getDisplayNameOrDefault(detail, login || participant.text));
    return {
        keyForList: String((_a = detail === null || detail === void 0 ? void 0 : detail.accountID) !== null && _a !== void 0 ? _a : login),
        login,
        accountID: detail === null || detail === void 0 ? void 0 : detail.accountID,
        text: displayName,
        firstName: (_b = detail === null || detail === void 0 ? void 0 : detail.firstName) !== null && _b !== void 0 ? _b : '',
        lastName: (_c = detail === null || detail === void 0 ? void 0 : detail.lastName) !== null && _c !== void 0 ? _c : '',
        alternateText: LocalePhoneNumber_1.formatPhoneNumber(login) || displayName,
        icons: [
            {
                source: (_d = detail === null || detail === void 0 ? void 0 : detail.avatar) !== null && _d !== void 0 ? _d : Expensicons_1.FallbackAvatar,
                name: login,
                type: CONST_1['default'].ICON_TYPE_AVATAR,
                id: detail === null || detail === void 0 ? void 0 : detail.accountID,
            },
        ],
        phoneNumber: (_e = detail === null || detail === void 0 ? void 0 : detail.phoneNumber) !== null && _e !== void 0 ? _e : '',
        selected: participant.selected,
        isSelected: participant.selected,
        searchText: (_f = participant.searchText) !== null && _f !== void 0 ? _f : undefined,
    };
}
exports.getParticipantsOption = getParticipantsOption;
/**
 * A very optimized method to remove duplicates from an array.
 * Taken from https://stackoverflow.com/a/9229821/9114791
 */
function uniqFast(items) {
    const seenItems = {};
    const result = [];
    let j = 0;
    for (let _i = 0, items_1 = items; _i < items_1.length; _i++) {
        const item = items_1[_i];
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
    const lastActorDisplayName = getLastActorDisplayName(lastActorDetails);
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
    let _b; let _c; let _d; let _e;
    const _f = _a.showChatPreviewLine;
        const showChatPreviewLine = _f === void 0 ? false : _f;
        const _g = _a.forcePolicyNamePreview;
        const forcePolicyNamePreview = _g === void 0 ? false : _g;
    const report = ReportUtils_1.getReportOrDraftReport(option.reportID);
    const isAdminRoom = ReportUtils_1.isAdminRoom(report);
    const isAnnounceRoom = ReportUtils_1.isAnnounceRoom(report);
    const isGroupChat = ReportUtils_1.isGroupChat(report);
    const isExpenseThread = ReportUtils_1.isMoneyRequest(report);
    const formattedLastMessageText = ReportUtils_1.formatReportLastMessageText(Parser_1['default'].htmlToText((_b = option.lastMessageText) !== null && _b !== void 0 ? _b : ''));
    const reportPrefix = ReportUtils_1.getReportSubtitlePrefix(report);
    const formattedLastMessageTextWithPrefix = reportPrefix + formattedLastMessageText;
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
        : LocalePhoneNumber_1.formatPhoneNumber(
              option.participantsList && option.participantsList.length > 0
                  ? (_e = (_d = option.participantsList.at(0)) === null || _d === void 0 ? void 0 : _d.login) !== null && _e !== void 0
                      ? _e
                      : ''
                  : '',
          );
}
exports.getAlternateText = getAlternateText;
/**
 * Searches for a match when provided with a value
 */
function isSearchStringMatch(searchValue, searchText, participantNames, isReportChatRoom) {
    if (participantNames === void 0) {
        participantNames = new Set();
    }
    if (isReportChatRoom === void 0) {
        isReportChatRoom = false;
    }
    const searchWords = new Set(searchValue.replace(/,/g, ' ').split(' '));
    const valueToSearch = searchText === null || searchText === void 0 ? void 0 : searchText.replace(new RegExp(/&nbsp;/g), '');
    let matching = true;
    searchWords.forEach(function (word) {
        // if one of the word is not matching, we don't need to check further
        if (!matching) {
            return;
        }
        const matchRegex = new RegExp(expensify_common_1.Str.escapeForRegExp(word), 'i');
        matching = matchRegex.test(valueToSearch !== null && valueToSearch !== void 0 ? valueToSearch : '') || (!isReportChatRoom && participantNames.has(word));
    });
    return matching;
}
exports.isSearchStringMatch = isSearchStringMatch;
function isSearchStringMatchUserDetails(personalDetail, searchValue) {
    let memberDetails = '';
    if (personalDetail.login) {
        memberDetails += ` ${  personalDetail.login}`;
    }
    if (personalDetail.firstName) {
        memberDetails += ` ${  personalDetail.firstName}`;
    }
    if (personalDetail.lastName) {
        memberDetails += ` ${  personalDetail.lastName}`;
    }
    if (personalDetail.displayName) {
        memberDetails += ` ${  PersonalDetailsUtils_1.getDisplayNameOrDefault(personalDetail)}`;
    }
    if (personalDetail.phoneNumber) {
        memberDetails += ` ${  personalDetail.phoneNumber}`;
    }
    return isSearchStringMatch(searchValue.trim(), memberDetails.toLowerCase());
}
exports.isSearchStringMatchUserDetails = isSearchStringMatchUserDetails;
/**
 * Get IOU report ID of report last action if the action is report action preview
 */
function getIOUReportIDOfLastAction(report) {
    let _a;
    if (!(report === null || report === void 0 ? void 0 : report.reportID)) {
        return;
    }
    const lastAction = lastVisibleReportActions[report.reportID];
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
    let _a; let _b; let _c; let _d; let _e; let _f; let _g; let _h; let _j;
    const reportID = report === null || report === void 0 ? void 0 : report.reportID;
    const lastReportAction = reportID ? lastVisibleReportActions[reportID] : undefined;
    // some types of actions are filtered out for lastReportAction, in some cases we need to check the actual last action
    const lastOriginalReportAction = reportID ? lastReportActions[reportID] : undefined;
    let lastMessageTextFromReport = '';
    if (ReportUtils_1.isArchivedNonExpenseReport(report, reportNameValuePairs)) {
        const archiveReason =
            // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
            (ReportActionsUtils_1.isClosedAction(lastOriginalReportAction) &&
                ((_a = ReportActionsUtils_1.getOriginalMessage(lastOriginalReportAction)) === null || _a === void 0 ? void 0 : _a.reason)) ||
            CONST_1['default'].REPORT.ARCHIVE_REASON.DEFAULT;
        switch (archiveReason) {
            case CONST_1['default'].REPORT.ARCHIVE_REASON.ACCOUNT_CLOSED:
            case CONST_1['default'].REPORT.ARCHIVE_REASON.REMOVED_FROM_POLICY:
            case CONST_1['default'].REPORT.ARCHIVE_REASON.POLICY_DELETED: {
                lastMessageTextFromReport = Localize_1.translate(preferredLocale, `reportArchiveReasons.${  archiveReason}`, {
                    displayName: LocalePhoneNumber_1.formatPhoneNumber(PersonalDetailsUtils_1.getDisplayNameOrDefault(lastActorDetails)),
                    policyName: ReportUtils_1.getPolicyName({report, policy}),
                });
                break;
            }
            case CONST_1['default'].REPORT.ARCHIVE_REASON.BOOKING_END_DATE_HAS_PASSED: {
                lastMessageTextFromReport = Localize_1.translate(preferredLocale, `reportArchiveReasons.${  archiveReason}`);
                break;
            }
            default: {
                lastMessageTextFromReport = Localize_1.translate(preferredLocale, 'reportArchiveReasons.default');
            }
        }
    } else if (ReportActionsUtils_1.isMoneyRequestAction(lastReportAction)) {
        const properSchemaForMoneyRequestMessage = ReportUtils_1.getReportPreviewMessage(report, lastReportAction, true, false, null, true);
        lastMessageTextFromReport = ReportUtils_1.formatReportLastMessageText(properSchemaForMoneyRequestMessage);
    } else if (ReportActionsUtils_1.isReportPreviewAction(lastReportAction)) {
        const iouReport = ReportUtils_1.getReportOrDraftReport(ReportActionsUtils_1.getIOUReportIDFromReportActionPreview(lastReportAction));
        const lastIOUMoneyReportAction = (iouReport === null || iouReport === void 0 ? void 0 : iouReport.reportID)
            ? (_b = allSortedReportActions[iouReport.reportID]) === null || _b === void 0
                ? void 0
                : _b.find(function (reportAction, key) {
                      return (
                          ReportActionsUtils_1.shouldReportActionBeVisible(reportAction, key, ReportUtils_1.canUserPerformWriteAction(report)) &&
                          reportAction.pendingAction !== CONST_1['default'].RED_BRICK_ROAD_PENDING_ACTION.DELETE &&
                          ReportActionsUtils_1.isMoneyRequestAction(reportAction)
                      );
                  })
            : undefined;
        const reportPreviewMessage = ReportUtils_1.getReportPreviewMessage(
            !EmptyObject_1.isEmptyObject(iouReport) ? iouReport : null,
            lastIOUMoneyReportAction !== null && lastIOUMoneyReportAction !== void 0 ? lastIOUMoneyReportAction : lastReportAction,
            true,
            ReportUtils_1.isChatReport(report),
            null,
            true,
            lastReportAction,
        );
        lastMessageTextFromReport = ReportUtils_1.formatReportLastMessageText(reportPreviewMessage);
    } else if (ReportActionsUtils_1.isReimbursementQueuedAction(lastReportAction)) {
        lastMessageTextFromReport = ReportUtils_1.getReimbursementQueuedActionMessage({reportAction: lastReportAction, reportOrID: report});
    } else if (ReportActionsUtils_1.isReimbursementDeQueuedOrCanceledAction(lastReportAction)) {
        lastMessageTextFromReport = ReportUtils_1.getReimbursementDeQueuedOrCanceledActionMessage(lastReportAction, report, true);
    } else if (ReportActionsUtils_1.isDeletedParentAction(lastReportAction) && ReportUtils_1.isChatReport(report)) {
        lastMessageTextFromReport = ReportUtils_1.getDeletedParentActionMessageForChatReport(lastReportAction);
    } else if (
        ReportActionsUtils_1.isPendingRemove(lastReportAction) &&
        (report === null || report === void 0 ? void 0 : report.reportID) &&
        ReportActionsUtils_1.isThreadParentMessage(lastReportAction, report.reportID)
    ) {
        lastMessageTextFromReport = Localize_1.translateLocal('parentReportAction.hiddenMessage');
    } else if (
        isReportMessageAttachment_1.isReportMessageAttachment({
            text: (_c = report === null || report === void 0 ? void 0 : report.lastMessageText) !== null && _c !== void 0 ? _c : '',
            html: report === null || report === void 0 ? void 0 : report.lastMessageHtml,
            type: '',
        })
    ) {
        lastMessageTextFromReport = `[${  Localize_1.translateLocal('common.attachment')  }]`;
    } else if (ReportActionsUtils_1.isModifiedExpenseAction(lastReportAction)) {
        const properSchemaForModifiedExpenseMessage = ModifiedExpenseMessage_1['default'].getForReportAction({
            reportOrID: report === null || report === void 0 ? void 0 : report.reportID,
            reportAction: lastReportAction,
        });
        lastMessageTextFromReport = ReportUtils_1.formatReportLastMessageText(properSchemaForModifiedExpenseMessage, true);
    } else if (ReportActionsUtils_1.isTaskAction(lastReportAction)) {
        lastMessageTextFromReport = ReportUtils_1.formatReportLastMessageText(TaskUtils_1.getTaskReportActionMessage(lastReportAction).text);
    } else if (ReportActionsUtils_1.isCreatedTaskReportAction(lastReportAction)) {
        lastMessageTextFromReport = TaskUtils_1.getTaskCreatedMessage(lastReportAction);
    } else if (
        ReportActionsUtils_1.isActionOfType(lastReportAction, CONST_1['default'].REPORT.ACTIONS.TYPE.SUBMITTED) ||
        ReportActionsUtils_1.isActionOfType(lastReportAction, CONST_1['default'].REPORT.ACTIONS.TYPE.SUBMITTED_AND_CLOSED)
    ) {
        const wasSubmittedViaHarvesting =
            (_e = (_d = ReportActionsUtils_1.getOriginalMessage(lastReportAction)) === null || _d === void 0 ? void 0 : _d.harvesting) !== null && _e !== void 0 ? _e : false;
        if (wasSubmittedViaHarvesting) {
            lastMessageTextFromReport = ReportUtils_1.getReportAutomaticallySubmittedMessage(lastReportAction);
        } else {
            lastMessageTextFromReport = ReportUtils_1.getIOUSubmittedMessage(lastReportAction);
        }
    } else if (ReportActionsUtils_1.isActionOfType(lastReportAction, CONST_1['default'].REPORT.ACTIONS.TYPE.APPROVED)) {
        var automaticAction = ((_f = ReportActionsUtils_1.getOriginalMessage(lastReportAction)) !== null && _f !== void 0 ? _f : {}).automaticAction;
        if (automaticAction) {
            lastMessageTextFromReport = ReportUtils_1.getReportAutomaticallyApprovedMessage(lastReportAction);
        } else {
            lastMessageTextFromReport = ReportUtils_1.getIOUApprovedMessage(lastReportAction);
        }
    } else if (ReportActionsUtils_1.isUnapprovedAction(lastReportAction)) {
        lastMessageTextFromReport = ReportUtils_1.getIOUUnapprovedMessage(lastReportAction);
    } else if (ReportActionsUtils_1.isActionOfType(lastReportAction, CONST_1['default'].REPORT.ACTIONS.TYPE.FORWARDED)) {
        var automaticAction = ((_g = ReportActionsUtils_1.getOriginalMessage(lastReportAction)) !== null && _g !== void 0 ? _g : {}).automaticAction;
        if (automaticAction) {
            lastMessageTextFromReport = ReportUtils_1.getReportAutomaticallyForwardedMessage(lastReportAction, reportID);
        } else {
            lastMessageTextFromReport = ReportUtils_1.getIOUForwardedMessage(lastReportAction, report);
        }
    } else if ((lastReportAction === null || lastReportAction === void 0 ? void 0 : lastReportAction.actionName) === CONST_1['default'].REPORT.ACTIONS.TYPE.REJECTED) {
        lastMessageTextFromReport = ReportUtils_1.getRejectedReportMessage();
    } else if (
        (lastReportAction === null || lastReportAction === void 0 ? void 0 : lastReportAction.actionName) === CONST_1['default'].REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.CORPORATE_UPGRADE
    ) {
        lastMessageTextFromReport = ReportUtils_1.getUpgradeWorkspaceMessage();
    } else if (
        (lastReportAction === null || lastReportAction === void 0 ? void 0 : lastReportAction.actionName) === CONST_1['default'].REPORT.ACTIONS.TYPE.POLICY_CHANGE_LOG.TEAM_DOWNGRADE
    ) {
        lastMessageTextFromReport = ReportUtils_1.getDowngradeWorkspaceMessage();
    } else if (
        ReportActionsUtils_1.isActionableAddPaymentCard(lastReportAction) ||
        ReportActionsUtils_1.isActionOfType(lastReportAction, CONST_1['default'].REPORT.ACTIONS.TYPE.CHANGE_POLICY)
    ) {
        lastMessageTextFromReport = ReportActionsUtils_1.getReportActionMessageText(lastReportAction);
    } else if ((lastReportAction === null || lastReportAction === void 0 ? void 0 : lastReportAction.actionName) === 'EXPORTINTEGRATION') {
        lastMessageTextFromReport = ReportActionsUtils_1.getExportIntegrationLastMessageText(lastReportAction);
    } else if ((lastReportAction === null || lastReportAction === void 0 ? void 0 : lastReportAction.actionName) && ReportActionsUtils_1.isOldDotReportAction(lastReportAction)) {
        lastMessageTextFromReport = ReportActionsUtils_1.getMessageOfOldDotReportAction(lastReportAction, false);
    } else if ((lastReportAction === null || lastReportAction === void 0 ? void 0 : lastReportAction.actionName) === CONST_1['default'].REPORT.ACTIONS.TYPE.RESOLVED_DUPLICATES) {
        lastMessageTextFromReport = Localize_1.translateLocal('violations.resolvedDuplicates');
    }
    // we do not want to show report closed in LHN for non archived report so use getReportLastMessage as fallback instead of lastMessageText from report
    if (reportID && !ReportUtils_1.isArchivedReport(reportNameValuePairs) && report.lastActionType === CONST_1['default'].REPORT.ACTIONS.TYPE.CLOSED) {
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
    let _a; let _b; let _c; let _d; let _e; let _f; let _g;
    const _h = config !== null && config !== void 0 ? config : {};
        const _j = _h.showChatPreviewLine;
        const showChatPreviewLine = _j === void 0 ? false : _j;
        const _k = _h.forcePolicyNamePreview;
        const forcePolicyNamePreview = _k === void 0 ? false : _k;
        const _l = _h.showPersonalDetails;
        const showPersonalDetails = _l === void 0 ? false : _l;
        const selected = _h.selected;
        const isSelected = _h.isSelected;
        const isDisabled = _h.isDisabled;
    const result = {
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
        selected,
        isSelected,
        isDisabled,
    };
    const personalDetailMap = getPersonalDetailsForAccountIDs(accountIDs, personalDetails);
    const personalDetailList = Object.values(personalDetailMap).filter(function (details) {
        return !!details;
    });
    const personalDetail = personalDetailList.at(0);
    let hasMultipleParticipants = personalDetailList.length > 1;
    let subtitle;
    let reportName;
    result.participantsList = personalDetailList;
    result.isOptimisticPersonalDetail = personalDetail === null || personalDetail === void 0 ? void 0 : personalDetail.isOptimisticPersonalDetail;
    if (report) {
        const reportNameValuePairs = ReportUtils_1.getReportNameValuePairs(report.reportID);
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
        result.brickRoadIndicator = hasReportErrors(report, reportActions) ? CONST_1['default'].BRICK_ROAD_INDICATOR_STATUS.ERROR : '';
        result.pendingAction = report.pendingFields ? ((_b = report.pendingFields.addWorkspaceRoom) !== null && _b !== void 0 ? _b : report.pendingFields.createChat) : undefined;
        result.ownerAccountID = report.ownerAccountID;
        result.reportID = report.reportID;
        const oneTransactionThreadReportID = ReportActionsUtils_1.getOneTransactionThreadReportID(
            report.reportID,
            allReportActions === null || allReportActions === void 0 ? void 0 : allReportActions[`${  ONYXKEYS_1['default'].COLLECTION.REPORT_ACTIONS  }${report.reportID}`],
        );
        const oneTransactionThreadReport = allReports === null || allReports === void 0 ? void 0 : allReports[`${  ONYXKEYS_1['default'].COLLECTION.REPORT  }${oneTransactionThreadReportID}`];
        result.isUnread = ReportUtils_1.isUnread(report, oneTransactionThreadReport);
        result.isPinned = report.isPinned;
        result.iouReportID = report.iouReportID;
        result.keyForList = String(report.reportID);
        result.isWaitingOnBankAccount = report.isWaitingOnBankAccount;
        result.policyID = report.policyID;
        result.isSelfDM = ReportUtils_1.isSelfDM(report);
        result.notificationPreference = ReportUtils_1.getReportNotificationPreference(report);
        result.lastVisibleActionCreated = report.lastVisibleActionCreated;
        const visibleParticipantAccountIDs = ReportUtils_1.getParticipantsAccountIDsForDisplay(report, true);
        result.tooltipText = ReportUtils_1.getReportParticipantsTitle(visibleParticipantAccountIDs);
        hasMultipleParticipants = personalDetailList.length > 1 || result.isChatRoom || result.isPolicyExpenseChat || ReportUtils_1.isGroupChat(report);
        subtitle = ReportUtils_1.getChatRoomSubtitle(report, {isCreateExpenseFlow: true});
        const lastActorDetails = report.lastActorAccountID
            ? (_c = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[report.lastActorAccountID]) !== null && _c !== void 0
                ? _c
                : null
            : null;
        const lastActorDisplayName = getLastActorDisplayName(lastActorDetails);
        const lastMessageTextFromReport = getLastMessageTextForReport(report, lastActorDetails, undefined, reportNameValuePairs);
        let lastMessageText = lastMessageTextFromReport;
        const lastAction = lastVisibleReportActions[report.reportID];
        const shouldDisplayLastActorName =
            lastAction &&
            lastAction.actionName !== CONST_1['default'].REPORT.ACTIONS.TYPE.REPORT_PREVIEW &&
            lastAction.actionName !== CONST_1['default'].REPORT.ACTIONS.TYPE.IOU &&
            !ReportUtils_1.isArchivedNonExpenseReport(report, reportNameValuePairs) &&
            shouldShowLastActorDisplayName(report, lastActorDetails);
        if (shouldDisplayLastActorName && lastActorDisplayName && lastMessageTextFromReport) {
            lastMessageText = `${lastActorDisplayName  }: ${  lastMessageTextFromReport}`;
        }
        result.lastMessageText = lastMessageText;
        // If displaying chat preview line is needed, let's overwrite the default alternate text
        result.alternateText =
            showPersonalDetails && (personalDetail === null || personalDetail === void 0 ? void 0 : personalDetail.login)
                ? personalDetail.login
                : getAlternateText(result, {showChatPreviewLine, forcePolicyNamePreview});
        reportName = showPersonalDetails
            ? ReportUtils_1.getDisplayNameForParticipant({accountID: accountIDs.at(0)}) ||
              LocalePhoneNumber_1.formatPhoneNumber((_d = personalDetail === null || personalDetail === void 0 ? void 0 : personalDetail.login) !== null && _d !== void 0 ? _d : '')
            : ReportUtils_1.getReportName(report);
    } else {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        reportName =
            ReportUtils_1.getDisplayNameForParticipant({accountID: accountIDs.at(0)}) ||
            LocalePhoneNumber_1.formatPhoneNumber((_e = personalDetail === null || personalDetail === void 0 ? void 0 : personalDetail.login) !== null && _e !== void 0 ? _e : '');
        result.keyForList = String(accountIDs.at(0));
        result.alternateText = LocalePhoneNumber_1.formatPhoneNumber(
            (_g = (_f = personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails[accountIDs[0]]) === null || _f === void 0 ? void 0 : _f.login) !== null &&
                _g !== void 0
                ? _g
                : '',
        );
    }
    result.isIOUReportOwner = ReportUtils_1.isIOUOwnedByCurrentUser(result);
    result.iouReportAmount = ReportUtils_1.getMoneyRequestSpendBreakdown(result).totalDisplaySpend;
    if (!hasMultipleParticipants && (!report || (report && !ReportUtils_1.isGroupChat(report) && !ReportUtils_1.isChatRoom(report)))) {
        result.login = personalDetail === null || personalDetail === void 0 ? void 0 : personalDetail.login;
        result.accountID = Number(personalDetail === null || personalDetail === void 0 ? void 0 : personalDetail.accountID);
        result.phoneNumber = personalDetail === null || personalDetail === void 0 ? void 0 : personalDetail.phoneNumber;
    }
    result.text = reportName;
    result.icons = ReportUtils_1.getIcons(
        report,
        personalDetails,
        personalDetail === null || personalDetail === void 0 ? void 0 : personalDetail.avatar,
        personalDetail === null || personalDetail === void 0 ? void 0 : personalDetail.login,
        personalDetail === null || personalDetail === void 0 ? void 0 : personalDetail.accountID,
        null,
    );
    result.subtitle = subtitle;
    return result;
}
/**
 * Get the option for a given report.
 */
function getReportOption(participant) {
    let _a;
    const report = ReportUtils_1.getReportOrDraftReport(participant.reportID);
    const visibleParticipantAccountIDs = ReportUtils_1.getParticipantsAccountIDsForDisplay(report, true);
    const option = createOption(
        visibleParticipantAccountIDs,
        allPersonalDetails !== null && allPersonalDetails !== void 0 ? allPersonalDetails : {},
        !EmptyObject_1.isEmptyObject(report) ? report : undefined,
        {},
        {
            showChatPreviewLine: false,
            forcePolicyNamePreview: false,
        },
    );
    // Update text & alternateText because createOption returns workspace name only if report is owned by the user
    if (option.isSelfDM) {
        option.alternateText = Localize_1.translateLocal('reportActionsView.yourSpace');
    } else if (option.isInvoiceRoom) {
        option.text = ReportUtils_1.getReportName(report);
        option.alternateText = Localize_1.translateLocal('workspace.common.invoices');
    } else {
        option.text = ReportUtils_1.getPolicyName({report});
        option.alternateText = Localize_1.translateLocal('workspace.common.workspace');
        if (report === null || report === void 0 ? void 0 : report.policyID) {
            const policy = allPolicies === null || allPolicies === void 0 ? void 0 : allPolicies[`${  ONYXKEYS_1['default'].COLLECTION.POLICY  }${report.policyID}`];
            const submitToAccountID = PolicyUtils_1.getSubmitToAccountID(policy, report);
            const submitsToAccountDetails = allPersonalDetails === null || allPersonalDetails === void 0 ? void 0 : allPersonalDetails[submitToAccountID];
            const subtitle =
                (_a = submitsToAccountDetails === null || submitsToAccountDetails === void 0 ? void 0 : submitsToAccountDetails.displayName) !== null && _a !== void 0
                    ? _a
                    : submitsToAccountDetails === null || submitsToAccountDetails === void 0
                    ? void 0
                    : submitsToAccountDetails.login;
            if (subtitle) {
                option.alternateText = Localize_1.translateLocal('iou.submitsTo', {name: subtitle !== null && subtitle !== void 0 ? subtitle : ''});
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
    let _a; let _b;
    const visibleParticipantAccountIDs = ReportUtils_1.getParticipantsAccountIDsForDisplay(report, true);
    const option = createOption(
        visibleParticipantAccountIDs,
        allPersonalDetails !== null && allPersonalDetails !== void 0 ? allPersonalDetails : {},
        !EmptyObject_1.isEmptyObject(report) ? report : undefined,
        {},
        {
            showChatPreviewLine: false,
            forcePolicyNamePreview: false,
        },
    );
    // Update text & alternateText because createOption returns workspace name only if report is owned by the user
    if (option.isSelfDM) {
        option.alternateText = Localize_1.translateLocal('reportActionsView.yourSpace');
    } else if (option.isInvoiceRoom) {
        option.text = ReportUtils_1.getReportName(report);
        option.alternateText = Localize_1.translateLocal('workspace.common.invoices');
    } else if (unknownUserDetails && !option.text) {
        option.text = (_a = unknownUserDetails.text) !== null && _a !== void 0 ? _a : unknownUserDetails.login;
        option.alternateText = unknownUserDetails.login;
        option.participantsList = [
            {...unknownUserDetails, displayName: unknownUserDetails.login,
                accountID: (_b = unknownUserDetails.accountID) !== null && _b !== void 0 ? _b : CONST_1['default'].DEFAULT_NUMBER_ID,},
        ];
    } else if ((report === null || report === void 0 ? void 0 : report.ownerAccountID) !== 0 || !option.text) {
        option.text = ReportUtils_1.getPolicyName({report});
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
    let _a;
    const expenseReport = ReportUtils_1.isPolicyExpenseChat(participant) ? ReportUtils_1.getReportOrDraftReport(participant.reportID) : null;
    const visibleParticipantAccountIDs = Object.entries((_a = expenseReport === null || expenseReport === void 0 ? void 0 : expenseReport.participants) !== null && _a !== void 0 ? _a : {})
        .filter(function (_a) {
            const reportParticipant = _a[1];
            return reportParticipant && !ReportUtils_1.isHiddenForCurrentUser(reportParticipant.notificationPreference);
        })
        .map(function (_a) {
            const accountID = _a[0];
            return Number(accountID);
        });
    const option = createOption(
        visibleParticipantAccountIDs,
        allPersonalDetails !== null && allPersonalDetails !== void 0 ? allPersonalDetails : {},
        !EmptyObject_1.isEmptyObject(expenseReport) ? expenseReport : null,
        {},
        {
            showChatPreviewLine: false,
            forcePolicyNamePreview: false,
        },
    );
    // Update text & alternateText because createOption returns workspace name only if report is owned by the user
    option.text = ReportUtils_1.getPolicyName({report: expenseReport});
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
    let _a;
    if (!userDetails) {
        return false;
    }
    // If user login is a mobile number, append sms domain if not appended already.
    const userDetailsLogin = PhoneNumber_1.addSMSDomainIfPhoneNumber((_a = userDetails.login) !== null && _a !== void 0 ? _a : '');
    if ((currentUserLogin === null || currentUserLogin === void 0 ? void 0 : currentUserLogin.toLowerCase()) === userDetailsLogin.toLowerCase()) {
        return true;
    }
    // Check if userDetails login exists in loginList
    return Object.keys(loginList !== null && loginList !== void 0 ? loginList : {}).some(function (login) {
        return login.toLowerCase() === userDetailsLogin.toLowerCase();
    });
}
exports.isCurrentUser = isCurrentUser;
/**
 * Calculates count of all enabled options
 */
function getEnabledCategoriesCount(options) {
    return Object.values(options).filter(function (option) {
        return option.enabled;
    }).length;
}
exports.getEnabledCategoriesCount = getEnabledCategoriesCount;
function getSearchValueForPhoneOrEmail(searchTerm) {
    let _a; let _b;
    const parsedPhoneNumber = PhoneNumber_1.parsePhoneNumber(LoginUtils_1.appendCountryCode(expensify_common_1.Str.removeSMSDomain(searchTerm)));
    return parsedPhoneNumber.possible ? ((_b = (_a = parsedPhoneNumber.number) === null || _a === void 0 ? void 0 : _a.e164) !== null && _b !== void 0 ? _b : '') : searchTerm.toLowerCase();
}
exports.getSearchValueForPhoneOrEmail = getSearchValueForPhoneOrEmail;
/**
 * Verifies that there is at least one enabled option
 */
function hasEnabledOptions(options) {
    return Object.values(options).some(function (option) {
        return option.enabled && option.pendingAction !== CONST_1['default'].RED_BRICK_ROAD_PENDING_ACTION.DELETE;
    });
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
    return selectedOptions.some(function (option) {
        return (option.accountID && option.accountID === reportOption.accountID) || (option.reportID && option.reportID === reportOption.reportID);
    });
}
function createOptionList(personalDetails, reports) {
    const reportMapForAccountIDs = {};
    const allReportOptions = [];
    if (reports) {
        Object.values(reports).forEach(function (report) {
            if (!report) {
                return;
            }
            const isOneOnOneChat = ReportUtils_1.isOneOnOneChat(report);
            const accountIDs = ReportUtils_1.getParticipantsAccountIDsForDisplay(report);
            const isChatRoom = ReportUtils_1.isChatRoom(report);
            if ((!accountIDs || accountIDs.length === 0) && !isChatRoom) {
                return;
            }
            // Save the report in the map if this is a single participant so we can associate the reportID with the
            // personal detail option later. Individuals should not be associated with single participant
            // policyExpenseChats or chatRooms since those are not people.
            if (accountIDs.length <= 1 && isOneOnOneChat) {
                reportMapForAccountIDs[accountIDs[0]] = report;
            }
            allReportOptions.push({item: report, ...createOption(accountIDs, personalDetails, report, {})});
        });
    }
    const allPersonalDetailsOptions = Object.values(personalDetails !== null && personalDetails !== void 0 ? personalDetails : {}).map(function (personalDetail) {
        let _a; let _b;
        return {
            item: personalDetail,
            ...createOption(
                [(_a = personalDetail === null || personalDetail === void 0 ? void 0 : personalDetail.accountID) !== null && _a !== void 0 ? _a : CONST_1['default'].DEFAULT_NUMBER_ID],
                personalDetails,
                reportMapForAccountIDs[
                    (_b = personalDetail === null || personalDetail === void 0 ? void 0 : personalDetail.accountID) !== null && _b !== void 0 ? _b : CONST_1['default'].DEFAULT_NUMBER_ID
                ],
                {},
                {showPersonalDetails: true},
            ),
        };
    });
    return {
        reports: allReportOptions,
        personalDetails: allPersonalDetailsOptions,
    };
}
exports.createOptionList = createOptionList;
function createOptionFromReport(report, personalDetails) {
    const accountIDs = ReportUtils_1.getParticipantsAccountIDsForDisplay(report);
    return {item: report, ...createOption(accountIDs, personalDetails, report, {})};
}
exports.createOptionFromReport = createOptionFromReport;
function orderPersonalDetailsOptions(options) {
    // PersonalDetails should be ordered Alphabetically by default - https://github.com/Expensify/App/issues/8220#issuecomment-1104009435
    return orderBy_1['default'](
        options,
        [
            function (personalDetail) {
                let _a;
                return (_a = personalDetail.text) === null || _a === void 0 ? void 0 : _a.toLowerCase();
            },
        ],
        'asc',
    );
}
exports.orderPersonalDetailsOptions = orderPersonalDetailsOptions;
/**
 * Orders report options without grouping them by kind.
 * Usually used when there is no search value
 */
function orderReportOptions(options) {
    return orderBy_1['default'](options, [sortComparatorReportOptionByArchivedStatus, sortComparatorReportOptionByDate], ['asc', 'desc']);
}
exports.orderReportOptions = orderReportOptions;
/**
 * Ordering for report options when you have a search value, will order them by kind additionally.
 * @param options - list of options to be sorted
 * @param searchValue - search string
 * @returns a sorted list of options
 */
function orderReportOptionsWithSearch(options, searchValue, _a) {
    const _b = _a === void 0 ? {} : _a;
        const _c = _b.preferChatroomsOverThreads;
        const preferChatroomsOverThreads = _c === void 0 ? false : _c;
        const _d = _b.preferPolicyExpenseChat;
        const preferPolicyExpenseChat = _d === void 0 ? false : _d;
        const _e = _b.preferRecentExpenseReports;
        const preferRecentExpenseReports = _e === void 0 ? false : _e;
    const orderedByDate = orderReportOptions(options);
    return orderBy_1['default'](
        orderedByDate,
        [
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
            preferRecentExpenseReports
                ? function (option) {
                      let _a;
                      return (_a = option === null || option === void 0 ? void 0 : option.lastIOUCreationDate) !== null && _a !== void 0 ? _a : '';
                  }
                : '',
            preferRecentExpenseReports
                ? function (option) {
                      return option === null || option === void 0 ? void 0 : option.isPolicyExpenseChat;
                  }
                : 0,
        ],
        ['asc', 'desc', 'desc'],
    );
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
    let _a;
    // If there is no date (ie. a personal detail option), the option will be sorted to the bottom
    // (comparing a dateString > '' returns true, and we are sorting descending, so the dateString will come before '')
    return (_a = options.lastVisibleActionCreated) !== null && _a !== void 0 ? _a : '';
}
function orderOptions(options, searchValue, config) {
    let _a;
    let orderedReportOptions;
    if (searchValue) {
        orderedReportOptions = orderReportOptionsWithSearch(options.recentReports, searchValue, config);
    } else {
        orderedReportOptions = orderReportOptions(options.recentReports);
    }
    const orderedPersonalDetailsOptions = orderPersonalDetailsOptions(options.personalDetails);
    const orderedWorkspaceChats = orderWorkspaceOptions((_a = options === null || options === void 0 ? void 0 : options.workspaceChats) !== null && _a !== void 0 ? _a : []);
    return {
        recentReports: orderedReportOptions,
        personalDetails: orderedPersonalDetailsOptions,
        workspaceChats: orderedWorkspaceChats,
    };
}
exports.orderOptions = orderOptions;
function canCreateOptimisticPersonalDetailOption(_a) {
    const recentReportOptions = _a.recentReportOptions;
        const personalDetailsOptions = _a.personalDetailsOptions;
        const currentUserOption = _a.currentUserOption;
        const searchValue = _a.searchValue;
    if (recentReportOptions.length + personalDetailsOptions.length > 0) {
        return false;
    }
    if (!currentUserOption) {
        return true;
    }
    return (
        currentUserOption.login !== PhoneNumber_1.addSMSDomainIfPhoneNumber(searchValue !== null && searchValue !== void 0 ? searchValue : '').toLowerCase() &&
        currentUserOption.login !== (searchValue === null || searchValue === void 0 ? void 0 : searchValue.toLowerCase())
    );
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
    let _b;
    let _c; let _d;
    const searchValue = _a.searchValue;
        const _e = _a.loginsToExclude;
        const loginsToExclude = _e === void 0 ? {} : _e;
        const _f = _a.selectedOptions;
        const selectedOptions = _f === void 0 ? [] : _f;
        const _g = _a.reportActions;
        const reportActions = _g === void 0 ? {} : _g;
        const _h = _a.showChatPreviewLine;
        const showChatPreviewLine = _h === void 0 ? false : _h;
        const _j = _a.shouldAcceptName;
        const shouldAcceptName = _j === void 0 ? false : _j;
    if (!searchValue) {
        return null;
    }
    const parsedPhoneNumber = PhoneNumber_1.parsePhoneNumber(LoginUtils_1.appendCountryCode(expensify_common_1.Str.removeSMSDomain(searchValue)));
    const isCurrentUserLogin = isCurrentUser({login: searchValue});
    const isInSelectedOption = selectedOptions.some(function (option) {
        return 'login' in option && option.login === searchValue;
    });
    const isValidEmail =
        expensify_common_1.Str.isValidEmail(searchValue) &&
        !expensify_common_1.Str.isDomainEmail(searchValue) &&
        !expensify_common_1.Str.endsWith(searchValue, CONST_1['default'].SMS.DOMAIN);
    const isValidPhoneNumber =
        parsedPhoneNumber.possible &&
        expensify_common_1.Str.isValidE164Phone(
            LoginUtils_1.getPhoneNumberWithoutSpecialChars((_d = (_c = parsedPhoneNumber.number) === null || _c === void 0 ? void 0 : _c.input) !== null && _d !== void 0 ? _d : ''),
        );
    const isInOptionToExclude = loginsToExclude[PhoneNumber_1.addSMSDomainIfPhoneNumber(searchValue).toLowerCase()];
    if (isCurrentUserLogin || isInSelectedOption || (!isValidEmail && !isValidPhoneNumber && !shouldAcceptName) || isInOptionToExclude) {
        return null;
    }
    // Generates an optimistic account ID for new users not yet saved in Onyx
    const optimisticAccountID = UserUtils_1.generateAccountID(searchValue);
    const personalDetailsExtended = {
        ...allPersonalDetails,
        ...((_b = {}),
        (_b[optimisticAccountID] = {
            accountID: optimisticAccountID,
            login: searchValue,
        }),
        _b),
    };
    const userToInvite = createOption([optimisticAccountID], personalDetailsExtended, null, reportActions, {
        showChatPreviewLine,
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
            type: CONST_1['default'].ICON_TYPE_AVATAR,
        },
    ];
    return userToInvite;
}
exports.getUserToInviteOption = getUserToInviteOption;
function getValidReports(reports, config) {
    let _a; let _b;
    const _c = config.betas;
        const betas = _c === void 0 ? [] : _c;
        const _d = config.includeMultipleParticipantReports;
        const includeMultipleParticipantReports = _d === void 0 ? false : _d;
        const _e = config.showChatPreviewLine;
        const showChatPreviewLine = _e === void 0 ? false : _e;
        const _f = config.forcePolicyNamePreview;
        const forcePolicyNamePreview = _f === void 0 ? false : _f;
        const _g = config.includeOwnedWorkspaceChats;
        const includeOwnedWorkspaceChats = _g === void 0 ? false : _g;
        const _h = config.includeThreads;
        const includeThreads = _h === void 0 ? false : _h;
        const _j = config.includeTasks;
        const includeTasks = _j === void 0 ? false : _j;
        const _k = config.includeMoneyRequests;
        const includeMoneyRequests = _k === void 0 ? false : _k;
        const _l = config.includeReadOnly;
        const includeReadOnly = _l === void 0 ? true : _l;
        const _m = config.transactionViolations;
        const transactionViolations = _m === void 0 ? {} : _m;
        const _o = config.includeSelfDM;
        const includeSelfDM = _o === void 0 ? false : _o;
        const _p = config.includeInvoiceRooms;
        const includeInvoiceRooms = _p === void 0 ? false : _p;
        const action = config.action;
        const _q = config.selectedOptions;
        const selectedOptions = _q === void 0 ? [] : _q;
        const _r = config.includeP2P;
        const includeP2P = _r === void 0 ? true : _r;
        const _s = config.includeDomainEmail;
        const includeDomainEmail = _s === void 0 ? false : _s;
        const _t = config.shouldBoldTitleByDefault;
        const shouldBoldTitleByDefault = _t === void 0 ? true : _t;
        const _u = config.loginsToExclude;
        const loginsToExclude = _u === void 0 ? {} : _u;
        const shouldSeparateSelfDMChat = config.shouldSeparateSelfDMChat;
        const shouldSeparateWorkspaceChat = config.shouldSeparateWorkspaceChat;
    const topmostReportId = Navigation_1['default'].getTopmostReportId();
    const validReportOptions = [];
    const workspaceChats = [];
    let selfDMChat;
    const preferRecentExpenseReports = action === CONST_1['default'].IOU.ACTION.CREATE;
    for (let i = 0; i < reports.length; i++) {
        // eslint-disable-next-line rulesdir/prefer-at
        const option = reports[i];
        const report = option.item;
        const doesReportHaveViolations = ReportUtils_1.shouldDisplayViolationsRBRInLHN(report, transactionViolations);
        const shouldBeInOptionList = ReportUtils_1.shouldReportBeInOptionList({
            report,
            currentReportId: topmostReportId,
            betas,
            policies,
            doesReportHaveViolations,
            isInFocusMode: false,
            excludeEmptyChats: false,
            includeSelfDM,
            login: option.login,
            includeDomainEmail,
        });
        if (!shouldBeInOptionList) {
            continue;
        }
        const isThread = option.isThread;
        const isTaskReport = option.isTaskReport;
        const isPolicyExpenseChat = option.isPolicyExpenseChat;
        const isMoneyRequestReport = option.isMoneyRequestReport;
        const isSelfDM = option.isSelfDM;
        const isChatRoom = option.isChatRoom;
        const accountIDs = ReportUtils_1.getParticipantsAccountIDsForDisplay(report);
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
        if (option.login === CONST_1['default'].EMAIL.NOTIFICATIONS) {
            continue;
        }
        const isCurrentUserOwnedPolicyExpenseChatThatCouldShow =
            option.isPolicyExpenseChat && option.ownerAccountID === currentUserAccountID && includeOwnedWorkspaceChats && !option.private_isArchived;
        const shouldShowInvoiceRoom =
            includeInvoiceRooms &&
            ReportUtils_1.isInvoiceRoom(option.item) &&
            ReportUtils_1.isPolicyAdmin(option.policyID, policies) &&
            !option.private_isArchived &&
            PolicyUtils_1.canSendInvoiceFromWorkspace(option.policyID);
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
        if (action === CONST_1['default'].IOU.ACTION.CATEGORIZE) {
            const reportPolicy = allPolicies === null || allPolicies === void 0 ? void 0 : allPolicies[`${  ONYXKEYS_1['default'].COLLECTION.POLICY  }${option.policyID}`];
            if (!(reportPolicy === null || reportPolicy === void 0 ? void 0 : reportPolicy.areCategoriesEnabled)) {
                continue;
            }
        }
        /**
         * By default, generated options does not have the chat preview line enabled.
         * If showChatPreviewLine or forcePolicyNamePreview are true, let's generate and overwrite the alternate text.
         */
        const alternateText = getAlternateText(option, {showChatPreviewLine, forcePolicyNamePreview});
        const isSelected = isReportSelected(option, selectedOptions);
        const isBold = shouldBoldTitleByDefault || shouldUseBoldText(option);
        let lastIOUCreationDate = void 0;
        // Add a field to sort the recent reports by the time of last IOU request for create actions
        if (preferRecentExpenseReports) {
            const reportPreviewAction =
                (_a = allSortedReportActions[option.reportID]) === null || _a === void 0
                    ? void 0
                    : _a.find(function (reportAction) {
                          return ReportActionsUtils_1.isActionOfType(reportAction, CONST_1['default'].REPORT.ACTIONS.TYPE.REPORT_PREVIEW);
                      });
            if (reportPreviewAction) {
                const iouReportID = ReportActionsUtils_1.getIOUReportIDFromReportActionPreview(reportPreviewAction);
                const iouReportActions = iouReportID ? ((_b = allSortedReportActions[iouReportID]) !== null && _b !== void 0 ? _b : []) : [];
                const lastIOUAction = iouReportActions.find(function (iouAction) {
                    return iouAction.actionName === CONST_1['default'].REPORT.ACTIONS.TYPE.IOU;
                });
                if (lastIOUAction) {
                    lastIOUCreationDate = lastIOUAction.lastModified;
                }
            }
        }
        const newReportOption = {...option, alternateText, isSelected, isBold, lastIOUCreationDate};
        if (shouldSeparateWorkspaceChat && newReportOption.isOwnPolicyExpenseChat && !newReportOption.private_isArchived) {
            workspaceChats.push(newReportOption);
        } else if (shouldSeparateSelfDMChat && newReportOption.isSelfDM) {
            selfDMChat = newReportOption;
        } else {
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
    return !!(nvpDismissedProductTraining === null || nvpDismissedProductTraining === void 0
        ? void 0
        : nvpDismissedProductTraining[CONST_1['default'].PRODUCT_TRAINING_TOOLTIP_NAMES.SCAN_TEST_TOOLTIP]);
}
exports.getIsUserSubmittedExpenseOrScannedReceipt = getIsUserSubmittedExpenseOrScannedReceipt;
/**
 * Whether the report is a Manager McTest report
 */
function isManagerMcTestReport(report) {
    let _a; let _b;
    return (_b =
        (_a = report.participantsList) === null || _a === void 0
            ? void 0
            : _a.some(function (participant) {
                  return participant.accountID === CONST_1['default'].ACCOUNT_ID.MANAGER_MCTEST;
              })) !== null && _b !== void 0
        ? _b
        : false;
}
/**
 * Helper method to check if participant email is Manager McTest
 */
function isSelectedManagerMcTest(email) {
    return email === CONST_1['default'].EMAIL.MANAGER_MCTEST;
}
exports.isSelectedManagerMcTest = isSelectedManagerMcTest;
function getValidPersonalDetailOptions(options, _a) {
    const _b = _a.loginsToExclude;
        const loginsToExclude = _b === void 0 ? {} : _b;
        const _c = _a.includeDomainEmail;
        const includeDomainEmail = _c === void 0 ? false : _c;
        const _d = _a.shouldBoldTitleByDefault;
        const shouldBoldTitleByDefault = _d === void 0 ? false : _d;
        const currentUserRef = _a.currentUserRef;
    const personalDetailsOptions = [];
    for (let i = 0; i < options.length; i++) {
        // eslint-disable-next-line rulesdir/prefer-at
        const detail = options[i];
        if (
            !(detail === null || detail === void 0 ? void 0 : detail.login) ||
            !detail.accountID ||
            !!(detail === null || detail === void 0 ? void 0 : detail.isOptimisticPersonalDetail) ||
            (!includeDomainEmail && expensify_common_1.Str.isDomainEmail(detail.login)) ||
            // Exclude the setup specialist from the list of personal details as it's a fallback if guide is not assigned
            (detail === null || detail === void 0 ? void 0 : detail.login) === CONST_1['default'].SETUP_SPECIALIST_LOGIN
        ) {
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
    let _b; let _c; let _d;
    if (_a === void 0) {
        _a = {};
    }
    const _e = _a.excludeLogins;
        const excludeLogins = _e === void 0 ? {} : _e;
        const _f = _a.includeSelectedOptions;
        const includeSelectedOptions = _f === void 0 ? false : _f;
        const _g = _a.includeRecentReports;
        const includeRecentReports = _g === void 0 ? true : _g;
        const recentAttendees = _a.recentAttendees;
        const _h = _a.selectedOptions;
        const selectedOptions = _h === void 0 ? [] : _h;
        const _j = _a.shouldSeparateSelfDMChat;
        const shouldSeparateSelfDMChat = _j === void 0 ? false : _j;
        const _k = _a.shouldSeparateWorkspaceChat;
        const shouldSeparateWorkspaceChat = _k === void 0 ? false : _k;
        const _l = _a.excludeHiddenThreads;
        const excludeHiddenThreads = _l === void 0 ? false : _l;
        const _m = _a.excludeHiddenChatRoom;
        const excludeHiddenChatRoom = _m === void 0 ? false : _m;
        const _o = _a.canShowManagerMcTest;
        const canShowManagerMcTest = _o === void 0 ? false : _o;
        const config = __rest(_a, [
            'excludeLogins',
            'includeSelectedOptions',
            'includeRecentReports',
            'recentAttendees',
            'selectedOptions',
            'shouldSeparateSelfDMChat',
            'shouldSeparateWorkspaceChat',
            'excludeHiddenThreads',
            'excludeHiddenChatRoom',
            'canShowManagerMcTest',
        ]);
    const userHasReportWithManagerMcTest = Object.values(options.reports).some(function (report) {
        return isManagerMcTestReport(report);
    });
    // If user has a workspace that he isn't owner, it means he was invited to it.
    const isUserInvitedToWorkspace = Object.values(policies !== null && policies !== void 0 ? policies : {}).some(function (policy) {
        return (
            (policy === null || policy === void 0 ? void 0 : policy.ownerAccountID) !== currentUserAccountID &&
            (policy === null || policy === void 0 ? void 0 : policy.isPolicyExpenseChatEnabled) &&
            (policy === null || policy === void 0 ? void 0 : policy.id) &&
            policy.id !== CONST_1['default'].POLICY.ID_FAKE
        );
    });
    // Gather shared configs:
    const loginsToExclude = __assign(
        __assign(((_b = {}), (_b[CONST_1['default'].EMAIL.NOTIFICATIONS] = true), _b), excludeLogins),
        ((_c = {}),
        (_c[CONST_1['default'].EMAIL.MANAGER_MCTEST] =
            !canShowManagerMcTest ||
            (getIsUserSubmittedExpenseOrScannedReceipt() && !userHasReportWithManagerMcTest) ||
            !Permissions_1['default'].canUseManagerMcTest(config.betas) ||
            isUserInvitedToWorkspace),
        _c),
    );
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
    const _p = config.includeP2P;
        const includeP2P = _p === void 0 ? true : _p;
        const _q = config.shouldBoldTitleByDefault;
        const shouldBoldTitleByDefault = _q === void 0 ? true : _q;
        const _r = config.includeDomainEmail;
        const includeDomainEmail = _r === void 0 ? false : _r;
        const getValidReportsConfig = __rest(config, ['includeP2P', 'shouldBoldTitleByDefault', 'includeDomainEmail']);
    // Get valid recent reports:
    let recentReportOptions = [];
    let workspaceChats = [];
    let selfDMChat;
    if (includeRecentReports) {
        const _s = getValidReports(
                options.reports,
                {...getValidReportsConfig, includeP2P,
                    includeDomainEmail,
                    selectedOptions,
                    loginsToExclude,
                    shouldBoldTitleByDefault,
                    shouldSeparateSelfDMChat,
                    shouldSeparateWorkspaceChat,},
            );
            const recentReports = _s.recentReports;
            const workspaceOptions = _s.workspaceOptions;
            const selfDMOption = _s.selfDMOption;
        recentReportOptions = recentReports;
        workspaceChats = workspaceOptions;
        selfDMChat = selfDMOption;
    } else if (recentAttendees && (recentAttendees === null || recentAttendees === void 0 ? void 0 : recentAttendees.length) > 0) {
        recentAttendees.filter(function (attendee) {
            let _a;
            const login = (_a = attendee.login) !== null && _a !== void 0 ? _a : attendee.displayName;
            if (login) {
                loginsToExclude[login] = true;
                return true;
            }
            return false;
        });
        recentReportOptions = recentAttendees;
    }
    // Get valid personal details and check if we can find the current user:
    let personalDetailsOptions = [];
    const currentUserRef = {
        current: undefined,
    };
    if (includeP2P) {
        let personalDetailLoginsToExclude = loginsToExclude;
        if (currentUserLogin) {
            personalDetailLoginsToExclude = {...loginsToExclude, ...((_d = {}), (_d[currentUserLogin] = true), _d)};
        }
        personalDetailsOptions = getValidPersonalDetailOptions(options.personalDetails, {
            loginsToExclude: personalDetailLoginsToExclude,
            shouldBoldTitleByDefault,
            includeDomainEmail,
            currentUserRef,
        });
    }
    if (excludeHiddenThreads) {
        recentReportOptions = recentReportOptions.filter(function (option) {
            return !option.isThread || option.notificationPreference !== CONST_1['default'].REPORT.NOTIFICATION_PREFERENCE.HIDDEN;
        });
    }
    if (excludeHiddenChatRoom) {
        recentReportOptions = recentReportOptions.filter(function (option) {
            return !option.isChatRoom || option.notificationPreference !== CONST_1['default'].REPORT.NOTIFICATION_PREFERENCE.HIDDEN;
        });
    }
    return {
        personalDetails: personalDetailsOptions,
        recentReports: recentReportOptions,
        currentUserOption: currentUserRef.current,
        // User to invite is generated by the search input of a user.
        // As this function isn't concerned with any search input yet, this is null (will be set when using filterOptions).
        userToInvite: null,
        workspaceChats,
        selfDMChat,
    };
}
exports.getValidOptions = getValidOptions;
/**
 * Build the options for the Search view
 */
function getSearchOptions(options, betas, isUsedInChatFinder) {
    if (betas === void 0) {
        betas = [];
    }
    if (isUsedInChatFinder === void 0) {
        isUsedInChatFinder = true;
    }
    Timing_1['default'].start(CONST_1['default'].TIMING.LOAD_SEARCH_OPTIONS);
    Performance_1['default'].markStart(CONST_1['default'].TIMING.LOAD_SEARCH_OPTIONS);
    const optionList = getValidOptions(options, {
        betas,
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
        excludeHiddenChatRoom: true,
    });
    const orderedOptions = orderOptions(optionList);
    Timing_1['default'].end(CONST_1['default'].TIMING.LOAD_SEARCH_OPTIONS);
    Performance_1['default'].markEnd(CONST_1['default'].TIMING.LOAD_SEARCH_OPTIONS);
    return {...optionList, ...orderedOptions};
}
exports.getSearchOptions = getSearchOptions;
function getShareLogOptions(options, betas) {
    if (betas === void 0) {
        betas = [];
    }
    return getValidOptions(options, {
        betas,
        includeMultipleParticipantReports: true,
        includeP2P: true,
        forcePolicyNamePreview: true,
        includeOwnedWorkspaceChats: true,
        includeSelfDM: true,
        includeThreads: true,
        includeReadOnly: false,
    });
}
exports.getShareLogOptions = getShareLogOptions;
/**
 * Build the IOUConfirmation options for showing the payee personalDetail
 */
function getIOUConfirmationOptionsFromPayeePersonalDetail(personalDetail, amountText) {
    let _a; let _b; let _c; let _d; let _e; let _f;
    const login = (_a = personalDetail === null || personalDetail === void 0 ? void 0 : personalDetail.login) !== null && _a !== void 0 ? _a : '';
    return {
        text: LocalePhoneNumber_1.formatPhoneNumber(PersonalDetailsUtils_1.getDisplayNameOrDefault(personalDetail, login)),
        alternateText: LocalePhoneNumber_1.formatPhoneNumber(login || PersonalDetailsUtils_1.getDisplayNameOrDefault(personalDetail, '', false)),
        icons: [
            {
                source: (_b = personalDetail === null || personalDetail === void 0 ? void 0 : personalDetail.avatar) !== null && _b !== void 0 ? _b : Expensicons_1.FallbackAvatar,
                name: (_c = personalDetail === null || personalDetail === void 0 ? void 0 : personalDetail.login) !== null && _c !== void 0 ? _c : '',
                type: CONST_1['default'].ICON_TYPE_AVATAR,
                id: personalDetail === null || personalDetail === void 0 ? void 0 : personalDetail.accountID,
            },
        ],
        descriptiveText: amountText !== null && amountText !== void 0 ? amountText : '',
        login: (_d = personalDetail === null || personalDetail === void 0 ? void 0 : personalDetail.login) !== null && _d !== void 0 ? _d : '',
        accountID: (_e = personalDetail === null || personalDetail === void 0 ? void 0 : personalDetail.accountID) !== null && _e !== void 0 ? _e : CONST_1['default'].DEFAULT_NUMBER_ID,
        keyForList: String(
            (_f = personalDetail === null || personalDetail === void 0 ? void 0 : personalDetail.accountID) !== null && _f !== void 0 ? _f : CONST_1['default'].DEFAULT_NUMBER_ID,
        ),
        isInteractive: false,
    };
}
exports.getIOUConfirmationOptionsFromPayeePersonalDetail = getIOUConfirmationOptionsFromPayeePersonalDetail;
function getAttendeeOptions(reports, personalDetails, betas, attendees, recentAttendees, includeOwnedWorkspaceChats, includeP2P, includeInvoiceRooms, action) {
    if (includeOwnedWorkspaceChats === void 0) {
        includeOwnedWorkspaceChats = false;
    }
    if (includeP2P === void 0) {
        includeP2P = true;
    }
    if (includeInvoiceRooms === void 0) {
        includeInvoiceRooms = false;
    }
    if (action === void 0) {
        action = undefined;
    }
    return getValidOptions(
        {reports, personalDetails},
        {
            betas,
            selectedOptions: attendees,
            excludeLogins: CONST_1['default'].EXPENSIFY_EMAILS_OBJECT,
            includeOwnedWorkspaceChats,
            includeRecentReports: false,
            includeP2P,
            includeSelectedOptions: false,
            includeSelfDM: false,
            includeInvoiceRooms,
            action,
            recentAttendees,
        },
    );
}
exports.getAttendeeOptions = getAttendeeOptions;
/**
 * Build the options for the Share Destination for a Task
 */
function getShareDestinationOptions(reports, personalDetails, betas, selectedOptions, excludeLogins, includeOwnedWorkspaceChats) {
    if (reports === void 0) {
        reports = [];
    }
    if (personalDetails === void 0) {
        personalDetails = [];
    }
    if (betas === void 0) {
        betas = [];
    }
    if (selectedOptions === void 0) {
        selectedOptions = [];
    }
    if (excludeLogins === void 0) {
        excludeLogins = {};
    }
    if (includeOwnedWorkspaceChats === void 0) {
        includeOwnedWorkspaceChats = true;
    }
    return getValidOptions(
        {reports, personalDetails},
        {
            betas,
            selectedOptions,
            includeMultipleParticipantReports: true,
            showChatPreviewLine: true,
            forcePolicyNamePreview: true,
            includeThreads: true,
            includeMoneyRequests: true,
            includeTasks: true,
            excludeLogins,
            includeOwnedWorkspaceChats,
            includeSelfDM: true,
        },
    );
}
exports.getShareDestinationOptions = getShareDestinationOptions;
/**
 * Format personalDetails or userToInvite to be shown in the list
 *
 * @param member - personalDetails or userToInvite
 * @param config - keys to overwrite the default values
 */
function formatMemberForList(member) {
    let _a; let _b; let _c;
    const accountID = member.accountID;
    return {
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        text: member.text || member.displayName || '',
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        alternateText: member.alternateText || member.login || '',
        // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
        keyForList: member.keyForList || String(accountID !== null && accountID !== void 0 ? accountID : CONST_1['default'].DEFAULT_NUMBER_ID) || '',
        isSelected: (_a = member.isSelected) !== null && _a !== void 0 ? _a : false,
        isDisabled: (_b = member.isDisabled) !== null && _b !== void 0 ? _b : false,
        accountID,
        login: (_c = member.login) !== null && _c !== void 0 ? _c : '',
        icons: member.icons,
        pendingAction: member.pendingAction,
        reportID: member.reportID,
    };
}
exports.formatMemberForList = formatMemberForList;
/**
 * Build the options for the Workspace Member Invite view
 */
function getMemberInviteOptions(personalDetails, betas, excludeLogins, includeSelectedOptions, reports, includeRecentReports) {
    if (betas === void 0) {
        betas = [];
    }
    if (excludeLogins === void 0) {
        excludeLogins = {};
    }
    if (includeSelectedOptions === void 0) {
        includeSelectedOptions = false;
    }
    if (reports === void 0) {
        reports = [];
    }
    if (includeRecentReports === void 0) {
        includeRecentReports = false;
    }
    const options = getValidOptions(
        {reports, personalDetails},
        {
            betas,
            includeP2P: true,
            excludeLogins,
            includeSelectedOptions,
            includeRecentReports,
        },
    );
    const orderedOptions = orderOptions(options);
    return {...options, personalDetails: orderedOptions.personalDetails, recentReports: orderedOptions.recentReports};
}
exports.getMemberInviteOptions = getMemberInviteOptions;
/**
 * Helper method that returns the text to be used for the header's message and title (if any)
 */
function getHeaderMessage(hasSelectableOptions, hasUserToInvite, searchValue, hasMatchedParticipant) {
    if (hasMatchedParticipant === void 0) {
        hasMatchedParticipant = false;
    }
    const isValidPhone = PhoneNumber_1.parsePhoneNumber(LoginUtils_1.appendCountryCode(searchValue)).possible;
    const isValidEmail = expensify_common_1.Str.isValidEmail(searchValue);
    if (searchValue && CONST_1['default'].REGEX.DIGITS_AND_PLUS.test(searchValue) && !isValidPhone && !hasSelectableOptions) {
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
    if (personalDetails === void 0) {
        personalDetails = {};
    }
    if (shouldGetOptionDetails === void 0) {
        shouldGetOptionDetails = false;
    }
    if (filteredWorkspaceChats === void 0) {
        filteredWorkspaceChats = [];
    }
    // We show the selected participants at the top of the list when there is no search term or maximum number of participants has already been selected
    // However, if there is a search term we remove the selected participants from the top of the list unless they are part of the search results
    // This clears up space on mobile views, where if you create a group with 4+ people you can't see the selected participants and the search results at the same time
    if (searchTerm === '') {
        return {
            section: {
                title: undefined,
                data: shouldGetOptionDetails
                    ? selectedOptions.map(function (participant) {
                          let _a;
                          const isReportPolicyExpenseChat = (_a = participant.isPolicyExpenseChat) !== null && _a !== void 0 ? _a : false;
                          return isReportPolicyExpenseChat ? getPolicyExpenseReportOption(participant) : getParticipantsOption(participant, personalDetails);
                      })
                    : selectedOptions,
                shouldShow: selectedOptions.length > 0,
            },
        };
    }
    const cleanSearchTerm = searchTerm.trim().toLowerCase();
    // If you select a new user you don't have a contact for, they won't get returned as part of a recent report or personal details
    // This will add them to the list of options, deduping them if they already exist in the other lists
    const selectedParticipantsWithoutDetails = selectedOptions.filter(function (participant) {
        let _a;
        const accountID = (_a = participant.accountID) !== null && _a !== void 0 ? _a : null;
        const isPartOfSearchTerm = getPersonalDetailSearchTerms(participant).join(' ').toLowerCase().includes(cleanSearchTerm);
        const isReportInRecentReports =
            filteredRecentReports.some(function (report) {
                return report.accountID === accountID;
            }) ||
            filteredWorkspaceChats.some(function (report) {
                return report.accountID === accountID;
            });
        const isReportInPersonalDetails = filteredPersonalDetails.some(function (personalDetail) {
            return personalDetail.accountID === accountID;
        });
        return isPartOfSearchTerm && !isReportInRecentReports && !isReportInPersonalDetails;
    });
    return {
        section: {
            title: undefined,
            data: shouldGetOptionDetails
                ? selectedParticipantsWithoutDetails.map(function (participant) {
                      let _a;
                      const isReportPolicyExpenseChat = (_a = participant.isPolicyExpenseChat) !== null && _a !== void 0 ? _a : false;
                      return isReportPolicyExpenseChat ? getPolicyExpenseReportOption(participant) : getParticipantsOption(participant, personalDetails);
                  })
                : selectedParticipantsWithoutDetails,
            shouldShow: selectedParticipantsWithoutDetails.length > 0,
        },
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
    const firstNonEmptyDataObj = data.at(0);
    return (firstNonEmptyDataObj === null || firstNonEmptyDataObj === void 0 ? void 0 : firstNonEmptyDataObj.keyForList)
        ? firstNonEmptyDataObj === null || firstNonEmptyDataObj === void 0
            ? void 0
            : firstNonEmptyDataObj.keyForList
        : '';
}
exports.getFirstKeyForList = getFirstKeyForList;
function getPersonalDetailSearchTerms(item) {
    let _a; let _b; let _c; let _d; let _e; let _f;
    return [
        (_c = (_b = (_a = item.participantsList) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.displayName) !== null && _c !== void 0 ? _c : '',
        (_d = item.login) !== null && _d !== void 0 ? _d : '',
        (_f = (_e = item.login) === null || _e === void 0 ? void 0 : _e.replace(CONST_1['default'].EMAIL_SEARCH_REGEX, '')) !== null && _f !== void 0 ? _f : '',
    ];
}
exports.getPersonalDetailSearchTerms = getPersonalDetailSearchTerms;
function getCurrentUserSearchTerms(item) {
    let _a; let _b; let _c; let _d;
    return [
        (_a = item.text) !== null && _a !== void 0 ? _a : '',
        (_b = item.login) !== null && _b !== void 0 ? _b : '',
        (_d = (_c = item.login) === null || _c === void 0 ? void 0 : _c.replace(CONST_1['default'].EMAIL_SEARCH_REGEX, '')) !== null && _d !== void 0 ? _d : '',
    ];
}
exports.getCurrentUserSearchTerms = getCurrentUserSearchTerms;
/**
 * Remove the personal details for the DMs that are already in the recent reports so that we don't show duplicates.
 */
function filteredPersonalDetailsOfRecentReports(recentReports, personalDetails) {
    const excludedLogins = new Set(
        recentReports.map(function (report) {
            return report.login;
        }),
    );
    return personalDetails.filter(function (personalDetail) {
        return !excludedLogins.has(personalDetail.login);
    });
}
exports.filteredPersonalDetailsOfRecentReports = filteredPersonalDetailsOfRecentReports;
/**
 * Filters options based on the search input value
 */
function filterReports(reports, searchTerms) {
    const normalizedSearchTerms = searchTerms.map(function (term) {
        return StringUtils_1['default'].normalizeAccents(term);
    });
    // We search eventually for multiple whitespace separated search terms.
    // We start with the search term at the end, and then narrow down those filtered search results with the next search term.
    // We repeat (reduce) this until all search terms have been used:
    const filteredReports = normalizedSearchTerms.reduceRight(
        function (items, term) {
            return filterArrayByMatch_1['default'](items, term, function (item) {
                const values = [];
                if (item.text) {
                    values.push(StringUtils_1['default'].normalizeAccents(item.text));
                    values.push(StringUtils_1['default'].normalizeAccents(item.text).replace(/['-]/g, ''));
                }
                if (item.login) {
                    values.push(StringUtils_1['default'].normalizeAccents(item.login));
                    values.push(StringUtils_1['default'].normalizeAccents(item.login.replace(CONST_1['default'].EMAIL_SEARCH_REGEX, '')));
                }
                if (item.isThread) {
                    if (item.alternateText) {
                        values.push(StringUtils_1['default'].normalizeAccents(item.alternateText));
                    }
                } else if (!!item.isChatRoom || !!item.isPolicyExpenseChat) {
                    if (item.subtitle) {
                        values.push(StringUtils_1['default'].normalizeAccents(item.subtitle));
                    }
                }
                return uniqFast(values);
            });
        },
        // We start from all unfiltered reports:
        reports,
    );
    return filteredReports;
}
exports.filterReports = filterReports;
function filterWorkspaceChats(reports, searchTerms) {
    const filteredReports = searchTerms.reduceRight(
        function (items, term) {
            return filterArrayByMatch_1['default'](items, term, function (item) {
                const values = [];
                if (item.text) {
                    values.push(item.text);
                }
                return uniqFast(values);
            });
        },
        // We start from all unfiltered reports:
        reports,
    );
    return filteredReports;
}
exports.filterWorkspaceChats = filterWorkspaceChats;
function filterPersonalDetails(personalDetails, searchTerms) {
    return searchTerms.reduceRight(function (items, term) {
        return filterArrayByMatch_1['default'](items, term, function (item) {
            const values = getPersonalDetailSearchTerms(item);
            return uniqFast(values);
        });
    }, personalDetails);
}
function filterCurrentUserOption(currentUserOption, searchTerms) {
    return searchTerms.reduceRight(function (item, term) {
        if (!item) {
            return null;
        }
        const currentUserOptionSearchText = uniqFast(getCurrentUserSearchTerms(item)).join(' ');
        return isSearchStringMatch(term, currentUserOptionSearchText) ? item : null;
    }, currentUserOption);
}
function filterUserToInvite(options, searchValue, config) {
    let _a;
    const _b = config !== null && config !== void 0 ? config : {};
        const _c = _b.canInviteUser;
        const canInviteUser = _c === void 0 ? true : _c;
        const _d = _b.excludeLogins;
        const excludeLogins = _d === void 0 ? {} : _d;
    if (!canInviteUser) {
        return null;
    }
    const canCreateOptimisticDetail = canCreateOptimisticPersonalDetailOption({
        recentReportOptions: options.recentReports,
        personalDetailsOptions: options.personalDetails,
        currentUserOption: options.currentUserOption,
        searchValue,
    });
    if (!canCreateOptimisticDetail) {
        return null;
    }
    const loginsToExclude = __assign(((_a = {}), (_a[CONST_1['default'].EMAIL.NOTIFICATIONS] = true), _a), excludeLogins);
    return getUserToInviteOption({searchValue, loginsToExclude, ...config});
}
exports.filterUserToInvite = filterUserToInvite;
function filterSelfDMChat(report, searchTerms) {
    const isMatch = searchTerms.every(function (term) {
        const values = [];
        if (report.text) {
            values.push(report.text);
        }
        if (report.login) {
            values.push(report.login);
            values.push(report.login.replace(CONST_1['default'].EMAIL_SEARCH_REGEX, ''));
        }
        if (report.isThread) {
            if (report.alternateText) {
                values.push(report.alternateText);
            }
        } else if (!!report.isChatRoom || !!report.isPolicyExpenseChat) {
            if (report.subtitle) {
                values.push(report.subtitle);
            }
        }
        // Remove duplicate values and check if the term matches any value
        return uniqFast(values).some(function (value) {
            return value.includes(term);
        });
    });
    return isMatch ? report : undefined;
}
exports.filterSelfDMChat = filterSelfDMChat;
function filterOptions(options, searchInputValue, config) {
    let _a; let _b;
    const parsedPhoneNumber = PhoneNumber_1.parsePhoneNumber(LoginUtils_1.appendCountryCode(expensify_common_1.Str.removeSMSDomain(searchInputValue)));
    const searchValue =
        parsedPhoneNumber.possible && ((_a = parsedPhoneNumber.number) === null || _a === void 0 ? void 0 : _a.e164) ? parsedPhoneNumber.number.e164 : searchInputValue.toLowerCase();
    const searchTerms = searchValue ? searchValue.split(' ') : [];
    const recentReports = filterReports(options.recentReports, searchTerms);
    const personalDetails = filterPersonalDetails(options.personalDetails, searchTerms);
    const currentUserOption = filterCurrentUserOption(options.currentUserOption, searchTerms);
    const userToInvite = filterUserToInvite(
        {
            recentReports,
            personalDetails,
            currentUserOption,
        },
        searchValue,
        config,
    );
    const workspaceChats = filterWorkspaceChats((_b = options.workspaceChats) !== null && _b !== void 0 ? _b : [], searchTerms);
    const selfDMChat = options.selfDMChat ? filterSelfDMChat(options.selfDMChat, searchTerms) : undefined;
    return {
        personalDetails,
        recentReports,
        userToInvite,
        currentUserOption,
        workspaceChats,
        selfDMChat,
    };
}
exports.filterOptions = filterOptions;
/**
 * Orders the reports and personal details based on the search input value.
 * Personal details will be filtered out if they are part of the recent reports.
 * Additional configs can be applied.
 */
function combineOrderingOfReportsAndPersonalDetails(options, searchInputValue, _a) {
    if (_a === void 0) {
        _a = {};
    }
    const maxRecentReportsToShow = _a.maxRecentReportsToShow;
        const sortByReportTypeInSearch = _a.sortByReportTypeInSearch;
        const orderReportOptionsConfig = __rest(_a, ['maxRecentReportsToShow', 'sortByReportTypeInSearch']);
    // sortByReportTypeInSearch will show the personal details as part of the recent reports
    if (sortByReportTypeInSearch) {
        const personalDetailsWithoutDMs_1 = filteredPersonalDetailsOfRecentReports(options.recentReports, options.personalDetails);
        const reportsAndPersonalDetails = options.recentReports.concat(personalDetailsWithoutDMs_1);
        return orderOptions({recentReports: reportsAndPersonalDetails, personalDetails: []}, searchInputValue, orderReportOptionsConfig);
    }
    let orderedReports = orderReportOptionsWithSearch(options.recentReports, searchInputValue, orderReportOptionsConfig);
    if (typeof maxRecentReportsToShow === 'number') {
        orderedReports = orderedReports.slice(0, maxRecentReportsToShow);
    }
    const personalDetailsWithoutDMs = filteredPersonalDetailsOfRecentReports(orderedReports, options.personalDetails);
    const orderedPersonalDetails = orderPersonalDetailsOptions(personalDetailsWithoutDMs);
    return {
        recentReports: orderedReports,
        personalDetails: orderedPersonalDetails,
    };
}
exports.combineOrderingOfReportsAndPersonalDetails = combineOrderingOfReportsAndPersonalDetails;
/**
 * Filters and orders the options based on the search input value.
 * Note that personal details that are part of the recent reports will always be shown as part of the recent reports (ie. DMs).
 */
function filterAndOrderOptions(options, searchInputValue, config) {
    if (config === void 0) {
        config = {};
    }
    let filterResult = options;
    if (searchInputValue.trim().length > 0) {
        filterResult = filterOptions(options, searchInputValue, config);
    }
    const orderedOptions = combineOrderingOfReportsAndPersonalDetails(filterResult, searchInputValue, config);
    // on staging server, in specific cases (see issue) BE returns duplicated personalDetails entries
    const uniqueLogins = new Set();
    orderedOptions.personalDetails = orderedOptions.personalDetails.filter(function (detail) {
        let _a;
        const login = (_a = detail.login) !== null && _a !== void 0 ? _a : '';
        if (uniqueLogins.has(login)) {
            return false;
        }
        uniqueLogins.add(login);
        return true;
    });
    return {...filterResult, ...orderedOptions};
}
exports.filterAndOrderOptions = filterAndOrderOptions;
function sortAlphabetically(items, key) {
    return items.sort(function (a, b) {
        let _a; let _b;
        return ((_a = a[key]) !== null && _a !== void 0 ? _a : '').toLowerCase().localeCompare(((_b = b[key]) !== null && _b !== void 0 ? _b : '').toLowerCase());
    });
}
exports.sortAlphabetically = sortAlphabetically;
function getEmptyOptions() {
    return {
        recentReports: [],
        personalDetails: [],
        userToInvite: null,
        currentUserOption: null,
    };
}
exports.getEmptyOptions = getEmptyOptions;
function shouldUseBoldText(report) {
    let _a;
    const notificationPreference = (_a = report.notificationPreference) !== null && _a !== void 0 ? _a : ReportUtils_1.getReportNotificationPreference(report);
    return report.isUnread === true && notificationPreference !== CONST_1['default'].REPORT.NOTIFICATION_PREFERENCE.MUTE && !ReportUtils_1.isHiddenForCurrentUser(notificationPreference);
}
exports.shouldUseBoldText = shouldUseBoldText;
function getManagerMcTestParticipant() {
    const managerMcTestPersonalDetails = Object.values(allPersonalDetails !== null && allPersonalDetails !== void 0 ? allPersonalDetails : {}).find(function (personalDetails) {
        return (personalDetails === null || personalDetails === void 0 ? void 0 : personalDetails.login) === CONST_1['default'].EMAIL.MANAGER_MCTEST;
    });
    return managerMcTestPersonalDetails ? getParticipantsOption(managerMcTestPersonalDetails, allPersonalDetails) : undefined;
}
exports.getManagerMcTestParticipant = getManagerMcTestParticipant;
