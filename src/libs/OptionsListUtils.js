/* eslint-disable no-continue */
import {parsePhoneNumber} from 'awesome-phonenumber';
import Str from 'expensify-common/lib/str';
import lodashGet from 'lodash/get';
import lodashOrderBy from 'lodash/orderBy';
import lodashSet from 'lodash/set';
import Onyx from 'react-native-onyx';
import _ from 'underscore';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import * as CollectionUtils from './CollectionUtils';
import * as ErrorUtils from './ErrorUtils';
import * as LocalePhoneNumber from './LocalePhoneNumber';
import * as Localize from './Localize';
import * as LoginUtils from './LoginUtils';
import Navigation from './Navigation/Navigation';
import Permissions from './Permissions';
import * as PersonalDetailsUtils from './PersonalDetailsUtils';
import * as ReportActionUtils from './ReportActionsUtils';
import * as ReportUtils from './ReportUtils';
import * as TransactionUtils from './TransactionUtils';
import * as UserUtils from './UserUtils';

/**
 * OptionsListUtils is used to build a list options passed to the OptionsList component. Several different UI views can
 * be configured to display different results based on the options passed to the private getOptions() method. Public
 * methods should be named for the views they build options for and then exported for use in a component.
 */

let currentUserLogin;
let currentUserAccountID;
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (val) => {
        currentUserLogin = val && val.email;
        currentUserAccountID = val && val.accountID;
    },
});

let loginList;
Onyx.connect({
    key: ONYXKEYS.LOGIN_LIST,
    callback: (val) => (loginList = _.isEmpty(val) ? {} : val),
});

let allPersonalDetails;
Onyx.connect({
    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    callback: (val) => (allPersonalDetails = _.isEmpty(val) ? {} : val),
});

let preferredLocale;
Onyx.connect({
    key: ONYXKEYS.NVP_PREFERRED_LOCALE,
    callback: (val) => (preferredLocale = val || CONST.LOCALES.DEFAULT),
});

const policies = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.POLICY,
    callback: (policy, key) => {
        if (!policy || !key || !policy.name) {
            return;
        }

        policies[key] = policy;
    },
});

const lastReportActions = {};
const allSortedReportActions = {};
const allReportActions = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
    callback: (actions, key) => {
        if (!key || !actions) {
            return;
        }
        const reportID = CollectionUtils.extractCollectionItemID(key);
        allReportActions[reportID] = actions;
        const sortedReportActions = ReportActionUtils.getSortedReportActions(_.toArray(actions), true);
        allSortedReportActions[reportID] = sortedReportActions;
        lastReportActions[reportID] = _.first(sortedReportActions);
    },
});

const policyExpenseReports = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT,
    callback: (report, key) => {
        if (!ReportUtils.isPolicyExpenseChat(report)) {
            return;
        }
        policyExpenseReports[key] = report;
    },
});

let allTransactions = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.TRANSACTION,
    waitForCollectionCallback: true,
    callback: (val) => {
        if (!val) {
            return;
        }
        allTransactions = _.pick(val, (transaction) => transaction);
    },
});

/**
 * Adds expensify SMS domain (@expensify.sms) if login is a phone number and if it's not included yet
 *
 * @param {String} login
 * @return {String}
 */
function addSMSDomainIfPhoneNumber(login) {
    const parsedPhoneNumber = parsePhoneNumber(login);
    if (parsedPhoneNumber.possible && !Str.isValidEmail(login)) {
        return parsedPhoneNumber.number.e164 + CONST.SMS.DOMAIN;
    }
    return login;
}

/**
 * Returns avatar data for a list of user accountIDs
 *
 * @param {Array<Number>} accountIDs
 * @param {Object} personalDetails
 * @param {Object} defaultValues {login: accountID} In workspace invite page, when new user is added we pass available data to opt in
 * @returns {Object}
 */
function getAvatarsForAccountIDs(accountIDs, personalDetails, defaultValues = {}) {
    const reversedDefaultValues = {};
    _.map(Object.entries(defaultValues), (item) => {
        reversedDefaultValues[item[1]] = item[0];
    });

    return _.map(accountIDs, (accountID) => {
        const login = lodashGet(reversedDefaultValues, accountID, '');
        const userPersonalDetail = lodashGet(personalDetails, accountID, {login, accountID, avatar: ''});

        return {
            id: accountID,
            source: UserUtils.getAvatar(userPersonalDetail.avatar, userPersonalDetail.accountID),
            type: CONST.ICON_TYPE_AVATAR,
            name: userPersonalDetail.login,
        };
    });
}

/**
 * Returns the personal details for an array of accountIDs
 *
 * @param {Array} accountIDs
 * @param {Object} personalDetails
 * @returns {Object} – keys of the object are emails, values are PersonalDetails objects.
 */
function getPersonalDetailsForAccountIDs(accountIDs, personalDetails) {
    const personalDetailsForAccountIDs = {};
    if (!personalDetails) {
        return personalDetailsForAccountIDs;
    }
    _.each(accountIDs, (accountID) => {
        const cleanAccountID = Number(accountID);
        if (!cleanAccountID) {
            return;
        }
        let personalDetail = personalDetails[accountID];
        if (!personalDetail) {
            personalDetail = {
                avatar: UserUtils.getDefaultAvatar(cleanAccountID),
            };
        }

        if (cleanAccountID === CONST.ACCOUNT_ID.CONCIERGE) {
            personalDetail.avatar = CONST.CONCIERGE_ICON_URL;
        }

        personalDetail.accountID = cleanAccountID;
        personalDetailsForAccountIDs[cleanAccountID] = personalDetail;
    });
    return personalDetailsForAccountIDs;
}

/**
 * Return true if personal details data is ready, i.e. report list options can be created.
 * @param {Object} personalDetails
 * @returns {Boolean}
 */
function isPersonalDetailsReady(personalDetails) {
    return !_.isEmpty(personalDetails) && _.some(_.keys(personalDetails), (key) => personalDetails[key].accountID);
}

/**
 * Get the participant option for a report.
 * @param {Object} participant
 * @param {Array<Object>} personalDetails
 * @returns {Object}
 */
function getParticipantsOption(participant, personalDetails) {
    const detail = getPersonalDetailsForAccountIDs([participant.accountID], personalDetails)[participant.accountID];
    const login = detail.login || participant.login;
    const displayName = detail.displayName || LocalePhoneNumber.formatPhoneNumber(login);
    return {
        keyForList: String(detail.accountID),
        login,
        accountID: detail.accountID,
        text: displayName,
        firstName: lodashGet(detail, 'firstName', ''),
        lastName: lodashGet(detail, 'lastName', ''),
        alternateText: LocalePhoneNumber.formatPhoneNumber(login) || displayName,
        icons: [
            {
                source: UserUtils.getAvatar(detail.avatar, detail.accountID),
                name: login,
                type: CONST.ICON_TYPE_AVATAR,
                id: detail.accountID,
            },
        ],
        phoneNumber: lodashGet(detail, 'phoneNumber', ''),
        selected: participant.selected,
        searchText: participant.searchText,
    };
}

/**
 * Constructs a Set with all possible names (displayName, firstName, lastName, email) for all participants in a report,
 * to be used in isSearchStringMatch.
 *
 * @param {Array<Object>} personalDetailList
 * @return {Set<String>}
 */
function getParticipantNames(personalDetailList) {
    // We use a Set because `Set.has(value)` on a Set of with n entries is up to n (or log(n)) times faster than
    // `_.contains(Array, value)` for an Array with n members.
    const participantNames = new Set();
    _.each(personalDetailList, (participant) => {
        if (participant.login) {
            participantNames.add(participant.login.toLowerCase());
        }
        if (participant.firstName) {
            participantNames.add(participant.firstName.toLowerCase());
        }
        if (participant.lastName) {
            participantNames.add(participant.lastName.toLowerCase());
        }
        if (participant.displayName) {
            participantNames.add(participant.displayName.toLowerCase());
        }
    });
    return participantNames;
}

/**
 * A very optimized method to remove duplicates from an array.
 * Taken from https://stackoverflow.com/a/9229821/9114791
 *
 * @param {Array} items
 * @returns {Array}
 */
function uniqFast(items) {
    const seenItems = {};
    const result = [];
    let j = 0;
    for (let i = 0; i < items.length; i++) {
        const item = items[i];
        if (seenItems[item] !== 1) {
            seenItems[item] = 1;
            result[j++] = item;
        }
    }
    return result;
}

/**
 * Returns a string with all relevant search terms.
 * Default should be serachable by policy/domain name but not by participants.
 *
 * This method must be incredibly performant. It was found to be a big performance bottleneck
 * when dealing with accounts that have thousands of reports. For loops are more efficient than _.each
 * Array.prototype.push.apply is faster than using the spread operator, and concat() is faster than push().
 *
 * @param {Object} report
 * @param {String} reportName
 * @param {Array} personalDetailList
 * @param {Boolean} isChatRoomOrPolicyExpenseChat
 * @param {Boolean} isThread
 * @return {String}
 */
function getSearchText(report, reportName, personalDetailList, isChatRoomOrPolicyExpenseChat, isThread) {
    let searchTerms = [];

    if (!isChatRoomOrPolicyExpenseChat) {
        for (let i = 0; i < personalDetailList.length; i++) {
            const personalDetail = personalDetailList[i];

            if (personalDetail.login) {
                // The regex below is used to remove dots only from the local part of the user email (local-part@domain)
                // so that we can match emails that have dots without explicitly writing the dots (e.g: fistlast@domain will match first.last@domain)
                // More info https://github.com/Expensify/App/issues/8007
                searchTerms = searchTerms.concat([personalDetail.displayName, personalDetail.login, personalDetail.login.replace(/\.(?=[^\s@]*@)/g, '')]);
            }
        }
    }
    if (report) {
        Array.prototype.push.apply(searchTerms, reportName.split(/[,\s]/));

        if (isThread) {
            const title = ReportUtils.getReportName(report);
            const chatRoomSubtitle = ReportUtils.getChatRoomSubtitle(report);

            Array.prototype.push.apply(searchTerms, title.split(/[,\s]/));
            Array.prototype.push.apply(searchTerms, chatRoomSubtitle.split(/[,\s]/));
        } else if (isChatRoomOrPolicyExpenseChat) {
            const chatRoomSubtitle = ReportUtils.getChatRoomSubtitle(report);

            Array.prototype.push.apply(searchTerms, chatRoomSubtitle.split(/[,\s]/));
        } else {
            const participantAccountIDs = report.participantAccountIDs || [];
            for (let i = 0; i < participantAccountIDs.length; i++) {
                const accountID = participantAccountIDs[i];

                if (allPersonalDetails[accountID] && allPersonalDetails[accountID].login) {
                    searchTerms = searchTerms.concat(allPersonalDetails[accountID].login);
                }
            }
        }
    }

    return uniqFast(searchTerms).join(' ');
}

/**
 * Get an object of error messages keyed by microtime by combining all error objects related to the report.
 * @param {Object} report
 * @param {Object} reportActions
 * @returns {Object}
 */
function getAllReportErrors(report, reportActions) {
    const reportErrors = report.errors || {};
    const reportErrorFields = report.errorFields || {};
    const reportActionErrors = _.reduce(
        reportActions,
        (prevReportActionErrors, action) => (!action || _.isEmpty(action.errors) ? prevReportActionErrors : _.extend(prevReportActionErrors, action.errors)),
        {},
    );

    const parentReportAction = !report.parentReportID || !report.parentReportActionID ? {} : lodashGet(allReportActions, [report.parentReportID, report.parentReportActionID], {});

    if (parentReportAction.actorAccountID === currentUserAccountID && ReportActionUtils.isTransactionThread(parentReportAction)) {
        const transactionID = lodashGet(parentReportAction, ['originalMessage', 'IOUTransactionID'], '');
        const transaction = allTransactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`] || {};
        if (TransactionUtils.hasMissingSmartscanFields(transaction)) {
            _.extend(reportActionErrors, {smartscan: ErrorUtils.getMicroSecondOnyxError('report.genericSmartscanFailureMessage')});
        }
    } else if ((ReportUtils.isIOUReport(report) || ReportUtils.isExpenseReport(report)) && report.ownerAccountID === currentUserAccountID) {
        if (ReportUtils.hasMissingSmartscanFields(report.reportID)) {
            _.extend(reportActionErrors, {smartscan: ErrorUtils.getMicroSecondOnyxError('report.genericSmartscanFailureMessage')});
        }
    }

    // All error objects related to the report. Each object in the sources contains error messages keyed by microtime
    const errorSources = {
        reportErrors,
        ...reportErrorFields,
        reportActionErrors,
    };

    // Combine all error messages keyed by microtime into one object
    const allReportErrors = _.reduce(errorSources, (prevReportErrors, errors) => (_.isEmpty(errors) ? prevReportErrors : _.extend(prevReportErrors, errors)), {});

    return allReportErrors;
}

/**
 * Get the last message text from the report directly or from other sources for special cases.
 * @param {Object} report
 * @returns {String}
 */
function getLastMessageTextForReport(report) {
    const lastReportAction = _.find(allSortedReportActions[report.reportID], (reportAction) => ReportActionUtils.shouldReportActionBeVisibleAsLastAction(reportAction));
    let lastMessageTextFromReport = '';
    const lastActionName = lodashGet(lastReportAction, 'actionName', '');

    if (ReportActionUtils.isMoneyRequestAction(lastReportAction)) {
        const properSchemaForMoneyRequestMessage = ReportUtils.getReportPreviewMessage(report, lastReportAction, true);
        lastMessageTextFromReport = ReportUtils.formatReportLastMessageText(properSchemaForMoneyRequestMessage);
    } else if (ReportActionUtils.isReportPreviewAction(lastReportAction)) {
        const iouReport = ReportUtils.getReport(ReportActionUtils.getIOUReportIDFromReportActionPreview(lastReportAction));
        const lastIOUMoneyReport = _.find(
            allSortedReportActions[iouReport.reportID],
            (reportAction, key) =>
                ReportActionUtils.shouldReportActionBeVisible(reportAction, key) &&
                reportAction.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE &&
                ReportActionUtils.isMoneyRequestAction(reportAction),
        );
        lastMessageTextFromReport = ReportUtils.getReportPreviewMessage(iouReport, lastIOUMoneyReport, true, ReportUtils.isChatReport(report));
    } else if (ReportActionUtils.isReimbursementQueuedAction(lastReportAction)) {
        lastMessageTextFromReport = ReportUtils.getReimbursementQueuedActionMessage(lastReportAction, report);
    } else if (ReportActionUtils.isDeletedParentAction(lastReportAction) && ReportUtils.isChatReport(report)) {
        lastMessageTextFromReport = ReportUtils.getDeletedParentActionMessageForChatReport(lastReportAction);
    } else if (ReportUtils.isReportMessageAttachment({text: report.lastMessageText, html: report.lastMessageHtml, translationKey: report.lastMessageTranslationKey})) {
        lastMessageTextFromReport = `[${Localize.translateLocal(report.lastMessageTranslationKey || 'common.attachment')}]`;
    } else if (ReportActionUtils.isModifiedExpenseAction(lastReportAction)) {
        const properSchemaForModifiedExpenseMessage = ReportUtils.getModifiedExpenseMessage(lastReportAction);
        lastMessageTextFromReport = ReportUtils.formatReportLastMessageText(properSchemaForModifiedExpenseMessage, true);
    } else if (
        lastActionName === CONST.REPORT.ACTIONS.TYPE.TASKCOMPLETED ||
        lastActionName === CONST.REPORT.ACTIONS.TYPE.TASKREOPENED ||
        lastActionName === CONST.REPORT.ACTIONS.TYPE.TASKCANCELLED
    ) {
        lastMessageTextFromReport = lodashGet(lastReportAction, 'message[0].text', '');
    } else {
        lastMessageTextFromReport = report ? report.lastMessageText || '' : '';
    }
    return lastMessageTextFromReport;
}

/**
 * Creates a report list option
 *
 * @param {Array<Number>} accountIDs
 * @param {Object} personalDetails
 * @param {Object} report
 * @param {Object} reportActions
 * @param {Object} options
 * @param {Boolean} [options.showChatPreviewLine]
 * @param {Boolean} [options.forcePolicyNamePreview]
 * @returns {Object}
 */
function createOption(accountIDs, personalDetails, report, reportActions = {}, {showChatPreviewLine = false, forcePolicyNamePreview = false}) {
    const result = {
        text: null,
        alternateText: null,
        pendingAction: null,
        allReportErrors: null,
        brickRoadIndicator: null,
        icons: null,
        tooltipText: null,
        ownerAccountID: null,
        subtitle: null,
        participantsList: null,
        accountID: 0,
        login: null,
        reportID: null,
        phoneNumber: null,
        hasDraftComment: false,
        keyForList: null,
        searchText: null,
        isDefaultRoom: false,
        isPinned: false,
        hasOutstandingIOU: false,
        isWaitingOnBankAccount: false,
        iouReportID: null,
        isIOUReportOwner: null,
        iouReportAmount: 0,
        isChatRoom: false,
        isArchivedRoom: false,
        shouldShowSubscript: false,
        isPolicyExpenseChat: false,
        isOwnPolicyExpenseChat: false,
        isExpenseReport: false,
        policyID: null,
        isOptimisticPersonalDetail: false,
    };

    const personalDetailMap = getPersonalDetailsForAccountIDs(accountIDs, personalDetails);
    const personalDetailList = _.values(personalDetailMap);
    const personalDetail = personalDetailList[0] || {};
    let hasMultipleParticipants = personalDetailList.length > 1;
    let subtitle;
    let reportName;

    result.participantsList = personalDetailList;
    result.isOptimisticPersonalDetail = personalDetail.isOptimisticPersonalDetail;

    if (report) {
        result.isChatRoom = ReportUtils.isChatRoom(report);
        result.isDefaultRoom = ReportUtils.isDefaultRoom(report);
        result.isArchivedRoom = ReportUtils.isArchivedRoom(report);
        result.isExpenseReport = ReportUtils.isExpenseReport(report);
        result.isMoneyRequestReport = ReportUtils.isMoneyRequestReport(report);
        result.isThread = ReportUtils.isChatThread(report);
        result.isTaskReport = ReportUtils.isTaskReport(report);
        result.shouldShowSubscript = ReportUtils.shouldReportShowSubscript(report);
        result.isPolicyExpenseChat = ReportUtils.isPolicyExpenseChat(report);
        result.isOwnPolicyExpenseChat = report.isOwnPolicyExpenseChat || false;
        result.allReportErrors = getAllReportErrors(report, reportActions);
        result.brickRoadIndicator = !_.isEmpty(result.allReportErrors) ? CONST.BRICK_ROAD_INDICATOR_STATUS.ERROR : '';
        result.pendingAction = report.pendingFields ? report.pendingFields.addWorkspaceRoom || report.pendingFields.createChat : null;
        result.ownerAccountID = report.ownerAccountID;
        result.reportID = report.reportID;
        result.isUnread = ReportUtils.isUnread(report);
        result.hasDraftComment = report.hasDraft;
        result.isPinned = report.isPinned;
        result.iouReportID = report.iouReportID;
        result.keyForList = String(report.reportID);
        result.tooltipText = ReportUtils.getReportParticipantsTitle(report.participantAccountIDs || []);
        result.hasOutstandingIOU = report.hasOutstandingIOU;
        result.isWaitingOnBankAccount = report.isWaitingOnBankAccount;
        result.policyID = report.policyID;

        hasMultipleParticipants = personalDetailList.length > 1 || result.isChatRoom || result.isPolicyExpenseChat;
        subtitle = ReportUtils.getChatRoomSubtitle(report);

        const lastMessageTextFromReport = getLastMessageTextForReport(report);
        const lastActorDetails = personalDetailMap[report.lastActorAccountID] || null;
        let lastMessageText = hasMultipleParticipants && lastActorDetails && lastActorDetails.accountID !== currentUserAccountID ? `${lastActorDetails.displayName}: ` : '';
        lastMessageText += report ? lastMessageTextFromReport : '';

        if (result.isArchivedRoom) {
            const archiveReason =
                (lastReportActions[report.reportID] && lastReportActions[report.reportID].originalMessage && lastReportActions[report.reportID].originalMessage.reason) ||
                CONST.REPORT.ARCHIVE_REASON.DEFAULT;
            lastMessageText = Localize.translate(preferredLocale, `reportArchiveReasons.${archiveReason}`, {
                displayName: archiveReason.displayName || PersonalDetailsUtils.getDisplayNameOrDefault(lastActorDetails, 'displayName'),
                policyName: ReportUtils.getPolicyName(report),
            });
        }

        if (result.isThread || result.isMoneyRequestReport) {
            result.alternateText = lastMessageTextFromReport.length > 0 ? lastMessageText : Localize.translate(preferredLocale, 'report.noActivityYet');
        } else if (result.isChatRoom || result.isPolicyExpenseChat) {
            result.alternateText = showChatPreviewLine && !forcePolicyNamePreview && lastMessageText ? lastMessageText : subtitle;
        } else if (result.isTaskReport) {
            result.alternateText = showChatPreviewLine && lastMessageText ? lastMessageTextFromReport : Localize.translate(preferredLocale, 'report.noActivityYet');
        } else {
            result.alternateText = showChatPreviewLine && lastMessageText ? lastMessageText : LocalePhoneNumber.formatPhoneNumber(personalDetail.login);
        }
        reportName = ReportUtils.getReportName(report);
    } else {
        reportName = ReportUtils.getDisplayNameForParticipant(accountIDs[0]) || LocalePhoneNumber.formatPhoneNumber(personalDetail.login);
        result.keyForList = String(accountIDs[0]);
        result.alternateText = LocalePhoneNumber.formatPhoneNumber(lodashGet(personalDetails, [accountIDs[0], 'login'], ''));
    }

    result.isIOUReportOwner = ReportUtils.isIOUOwnedByCurrentUser(result);
    result.iouReportAmount = ReportUtils.getMoneyRequestReimbursableTotal(result);

    if (!hasMultipleParticipants) {
        result.login = personalDetail.login;
        result.accountID = Number(personalDetail.accountID);
        result.phoneNumber = personalDetail.phoneNumber;
    }

    result.text = reportName;
    result.searchText = getSearchText(report, reportName, personalDetailList, result.isChatRoom || result.isPolicyExpenseChat, result.isThread);
    result.icons = ReportUtils.getIcons(report, personalDetails, UserUtils.getAvatar(personalDetail.avatar, personalDetail.accountID), personalDetail.login, personalDetail.accountID);
    result.subtitle = subtitle;

    return result;
}

/**
 * Get the option for a policy expense report.
 * @param {Object} report
 * @returns {Object}
 */
function getPolicyExpenseReportOption(report) {
    const expenseReport = policyExpenseReports[`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`];

    const option = createOption(
        expenseReport.participantAccountIDs,
        allPersonalDetails,
        expenseReport,
        {},
        {
            showChatPreviewLine: false,
            forcePolicyNamePreview: false,
        },
    );

    // Update text & alternateText because createOption returns workspace name only if report is owned by the user
    option.text = ReportUtils.getPolicyName(expenseReport);
    option.alternateText = Localize.translateLocal('workspace.common.workspace');
    option.selected = report.selected;
    return option;
}

/**
 * Searches for a match when provided with a value
 *
 * @param {String} searchValue
 * @param {String} searchText
 * @param {Set<String>} [participantNames]
 * @param {Boolean} isChatRoom
 * @returns {Boolean}
 */
function isSearchStringMatch(searchValue, searchText, participantNames = new Set(), isChatRoom = false) {
    const searchWords = new Set(searchValue.replace(/,/g, ' ').split(' '));
    const valueToSearch = searchText && searchText.replace(new RegExp(/&nbsp;/g), '');
    let matching = true;
    searchWords.forEach((word) => {
        // if one of the word is not matching, we don't need to check further
        if (!matching) {
            return;
        }
        const matchRegex = new RegExp(Str.escapeForRegExp(word), 'i');
        matching = matchRegex.test(valueToSearch) || (!isChatRoom && participantNames.has(word));
    });
    return matching;
}

/**
 * Checks if the given userDetails is currentUser or not.
 * Note: We can't migrate this off of using logins because this is used to check if you're trying to start a chat with
 * yourself or a different user, and people won't be starting new chats via accountID usually.
 *
 * @param {Object} userDetails
 * @returns {Boolean}
 */
function isCurrentUser(userDetails) {
    if (!userDetails) {
        return false;
    }

    // If user login is a mobile number, append sms domain if not appended already.
    const userDetailsLogin = addSMSDomainIfPhoneNumber(userDetails.login);

    if (currentUserLogin.toLowerCase() === userDetailsLogin.toLowerCase()) {
        return true;
    }

    // Check if userDetails login exists in loginList
    return _.some(_.keys(loginList), (login) => login.toLowerCase() === userDetailsLogin.toLowerCase());
}

/**
 * Calculates count of all enabled options
 *
 * @param {Object[]} options - an initial strings array
 * @param {Boolean} options[].enabled - a flag to enable/disable option in a list
 * @param {String} options[].name - a name of an option
 * @returns {Number}
 */
function getEnabledCategoriesCount(options) {
    return _.filter(options, (option) => option.enabled).length;
}

/**
 * Verifies that there is at least one enabled option
 *
 * @param {Object[]} options - an initial strings array
 * @param {Boolean} options[].enabled - a flag to enable/disable option in a list
 * @param {String} options[].name - a name of an option
 * @returns {Boolean}
 */
function hasEnabledOptions(options) {
    return _.some(options, (option) => option.enabled);
}

/**
 * Sorts categories using a simple object.
 * It builds an hierarchy (based on an object), where each category has a name and other keys as subcategories.
 * Via the hierarchy we avoid duplicating and sort categories one by one. Subcategories are being sorted alphabetically.
 *
 * @param {Object<String, {name: String, enabled: Boolean}>} categories
 * @returns {Array<Object>}
 */
function sortCategories(categories) {
    // Sorts categories alphabetically by name.
    const sortedCategories = _.chain(categories)
        .values()
        .sortBy((category) => category.name)
        .value();

    // An object that respects nesting of categories. Also, can contain only uniq categories.
    const hierarchy = {};

    /**
     * Iterates over all categories to set each category in a proper place in hierarchy
     * It gets a path based on a category name e.g. "Parent: Child: Subcategory" -> "Parent.Child.Subcategory".
     * {
     *   Parent: {
     *     name: "Parent",
     *     Child: {
     *       name: "Child"
     *       Subcategory: {
     *         name: "Subcategory"
     *       }
     *     }
     *   }
     * }
     */
    _.each(sortedCategories, (category) => {
        const path = category.name.split(CONST.PARENT_CHILD_SEPARATOR);
        const existedValue = lodashGet(hierarchy, path, {});

        lodashSet(hierarchy, path, {
            ...existedValue,
            name: category.name,
        });
    });

    /**
     * A recursive function to convert hierarchy into an array of category objects.
     * The category object contains base 2 properties: "name" and "enabled".
     * It iterates each key one by one. When a category has subcategories, goes deeper into them. Also, sorts subcategories alphabetically.
     *
     * @param {Object} initialHierarchy
     * @returns {Array<Object>}
     */
    const flatHierarchy = (initialHierarchy) =>
        _.reduce(
            initialHierarchy,
            (acc, category) => {
                const {name, ...subcategories} = category;

                if (!_.isEmpty(name)) {
                    const categoryObject = {
                        name,
                        enabled: lodashGet(categories, [name, 'enabled'], false),
                    };

                    acc.push(categoryObject);
                }

                if (!_.isEmpty(subcategories)) {
                    const nestedCategories = flatHierarchy(subcategories);

                    acc.push(..._.sortBy(nestedCategories, 'name'));
                }

                return acc;
            },
            [],
        );

    return flatHierarchy(hierarchy);
}

/**
 * Sorts tags alphabetically by name.
 *
 * @param {Object<String, {name: String, enabled: Boolean}>} tags
 * @returns {Array<Object>}
 */
function sortTags(tags) {
    const sortedTags = _.chain(tags)
        .values()
        .sortBy((tag) => tag.name)
        .value();

    return sortedTags;
}

/**
 * Builds the options for the category tree hierarchy via indents
 *
 * @param {Object[]} options - an initial object array
 * @param {Boolean} options[].enabled - a flag to enable/disable option in a list
 * @param {String} options[].name - a name of an option
 * @param {Boolean} [isOneLine] - a flag to determine if text should be one line
 * @returns {Array<Object>}
 */
function getCategoryOptionTree(options, isOneLine = false) {
    const optionCollection = new Map();

    _.each(options, (option) => {
        if (isOneLine) {
            if (optionCollection.has(option.name)) {
                return;
            }

            optionCollection.set(option.name, {
                text: option.name,
                keyForList: option.name,
                searchText: option.name,
                tooltipText: option.name,
                isDisabled: !option.enabled,
            });

            return;
        }

        option.name.split(CONST.PARENT_CHILD_SEPARATOR).forEach((optionName, index, array) => {
            const indents = _.times(index, () => CONST.INDENTS).join('');
            const isChild = array.length - 1 === index;
            const searchText = array.slice(0, index + 1).join(CONST.PARENT_CHILD_SEPARATOR);

            if (optionCollection.has(searchText)) {
                return;
            }

            optionCollection.set(searchText, {
                text: `${indents}${optionName}`,
                keyForList: searchText,
                searchText,
                tooltipText: optionName,
                isDisabled: isChild ? !option.enabled : true,
            });
        });
    });

    return Array.from(optionCollection.values());
}

/**
 * Builds the section list for categories
 *
 * @param {Object<String, {name: String, enabled: Boolean}>} categories
 * @param {String[]} recentlyUsedCategories
 * @param {Object[]} selectedOptions
 * @param {String} selectedOptions[].name
 * @param {String} searchInputValue
 * @param {Number} maxRecentReportsToShow
 * @returns {Array<Object>}
 */
function getCategoryListSections(categories, recentlyUsedCategories, selectedOptions, searchInputValue, maxRecentReportsToShow) {
    const sortedCategories = sortCategories(categories);
    const enabledCategories = _.filter(sortedCategories, (category) => category.enabled);

    const categorySections = [];
    const numberOfCategories = _.size(enabledCategories);

    let indexOffset = 0;

    if (numberOfCategories === 0 && selectedOptions.length > 0) {
        categorySections.push({
            // "Selected" section
            title: '',
            shouldShow: false,
            indexOffset,
            data: getCategoryOptionTree(selectedOptions, true),
        });

        return categorySections;
    }

    if (!_.isEmpty(searchInputValue)) {
        const searchCategories = _.filter(enabledCategories, (category) => category.name.toLowerCase().includes(searchInputValue.toLowerCase()));

        categorySections.push({
            // "Search" section
            title: '',
            shouldShow: true,
            indexOffset,
            data: getCategoryOptionTree(searchCategories, true),
        });

        return categorySections;
    }

    if (numberOfCategories < CONST.CATEGORY_LIST_THRESHOLD) {
        categorySections.push({
            // "All" section when items amount less than the threshold
            title: '',
            shouldShow: false,
            indexOffset,
            data: getCategoryOptionTree(enabledCategories),
        });

        return categorySections;
    }

    if (!_.isEmpty(selectedOptions)) {
        categorySections.push({
            // "Selected" section
            title: '',
            shouldShow: true,
            indexOffset,
            data: getCategoryOptionTree(selectedOptions, true),
        });

        indexOffset += selectedOptions.length;
    }

    const selectedOptionNames = _.map(selectedOptions, (selectedOption) => selectedOption.name);
    const filteredRecentlyUsedCategories = _.chain(recentlyUsedCategories)
        .filter((categoryName) => !_.includes(selectedOptionNames, categoryName) && lodashGet(categories, [categoryName, 'enabled'], false))
        .map((categoryName) => ({
            name: categoryName,
            enabled: lodashGet(categories, [categoryName, 'enabled'], false),
        }))
        .value();

    if (!_.isEmpty(filteredRecentlyUsedCategories)) {
        const cutRecentlyUsedCategories = filteredRecentlyUsedCategories.slice(0, maxRecentReportsToShow);

        categorySections.push({
            // "Recent" section
            title: Localize.translateLocal('common.recent'),
            shouldShow: true,
            indexOffset,
            data: getCategoryOptionTree(cutRecentlyUsedCategories, true),
        });

        indexOffset += filteredRecentlyUsedCategories.length;
    }

    const filteredCategories = _.filter(enabledCategories, (category) => !_.includes(selectedOptionNames, category.name));

    categorySections.push({
        // "All" section when items amount more than the threshold
        title: Localize.translateLocal('common.all'),
        shouldShow: true,
        indexOffset,
        data: getCategoryOptionTree(filteredCategories),
    });

    return categorySections;
}

/**
 * Transforms the provided tags into objects with a specific structure.
 *
 * @param {Object[]} tags - an initial tag array
 * @param {Boolean} tags[].enabled - a flag to enable/disable option in a list
 * @param {String} tags[].name - a name of an option
 * @returns {Array<Object>}
 */
function getTagsOptions(tags) {
    return _.map(tags, (tag) => ({
        text: tag.name,
        keyForList: tag.name,
        searchText: tag.name,
        tooltipText: tag.name,
        isDisabled: !tag.enabled,
    }));
}

/**
 * Build the section list for tags
 *
 * @param {Object[]} rawTags
 * @param {String} tags[].name
 * @param {Boolean} tags[].enabled
 * @param {String[]} recentlyUsedTags
 * @param {Object[]} selectedOptions
 * @param {String} selectedOptions[].name
 * @param {String} searchInputValue
 * @param {Number} maxRecentReportsToShow
 * @returns {Array<Object>}
 */
function getTagListSections(rawTags, recentlyUsedTags, selectedOptions, searchInputValue, maxRecentReportsToShow) {
    const tagSections = [];
    const tags = _.map(rawTags, (tag) => {
        // This is to remove unnecessary escaping backslash in tag name sent from backend.
        const tagName = tag.name && tag.name.replace(/\\{1,2}:/g, ':');

        return {...tag, name: tagName};
    });
    const sortedTags = sortTags(tags);
    const enabledTags = _.filter(sortedTags, (tag) => tag.enabled);
    const numberOfTags = _.size(enabledTags);
    let indexOffset = 0;

    // If all tags are disabled but there's a previously selected tag, show only the selected tag
    if (numberOfTags === 0 && selectedOptions.length > 0) {
        const selectedTagOptions = _.map(selectedOptions, (option) => ({
            name: option.name,
            // Should be marked as enabled to be able to be de-selected
            enabled: true,
        }));
        tagSections.push({
            // "Selected" section
            title: '',
            shouldShow: false,
            indexOffset,
            data: getTagsOptions(selectedTagOptions),
        });

        return tagSections;
    }

    if (!_.isEmpty(searchInputValue)) {
        const searchTags = _.filter(enabledTags, (tag) => tag.name.toLowerCase().includes(searchInputValue.toLowerCase()));

        tagSections.push({
            // "Search" section
            title: '',
            shouldShow: true,
            indexOffset,
            data: getTagsOptions(searchTags),
        });

        return tagSections;
    }

    if (numberOfTags < CONST.TAG_LIST_THRESHOLD) {
        tagSections.push({
            // "All" section when items amount less than the threshold
            title: '',
            shouldShow: false,
            indexOffset,
            data: getTagsOptions(enabledTags),
        });

        return tagSections;
    }

    const selectedOptionNames = _.map(selectedOptions, (selectedOption) => selectedOption.name);
    const filteredRecentlyUsedTags = _.map(
        _.filter(recentlyUsedTags, (recentlyUsedTag) => {
            const tagObject = _.find(tags, (tag) => tag.name === recentlyUsedTag);
            return Boolean(tagObject && tagObject.enabled) && !_.includes(selectedOptionNames, recentlyUsedTag);
        }),
        (tag) => ({name: tag, enabled: true}),
    );
    const filteredTags = _.filter(enabledTags, (tag) => !_.includes(selectedOptionNames, tag.name));

    if (!_.isEmpty(selectedOptions)) {
        const selectedTagOptions = _.map(selectedOptions, (option) => {
            const tagObject = _.find(tags, (tag) => tag.name === option.name);
            return {
                name: option.name,
                enabled: Boolean(tagObject && tagObject.enabled),
            };
        });

        tagSections.push({
            // "Selected" section
            title: '',
            shouldShow: true,
            indexOffset,
            data: getTagsOptions(selectedTagOptions),
        });

        indexOffset += selectedOptions.length;
    }

    if (!_.isEmpty(filteredRecentlyUsedTags)) {
        const cutRecentlyUsedTags = filteredRecentlyUsedTags.slice(0, maxRecentReportsToShow);

        tagSections.push({
            // "Recent" section
            title: Localize.translateLocal('common.recent'),
            shouldShow: true,
            indexOffset,
            data: getTagsOptions(cutRecentlyUsedTags),
        });

        indexOffset += filteredRecentlyUsedTags.length;
    }

    tagSections.push({
        // "All" section when items amount more than the threshold
        title: Localize.translateLocal('common.all'),
        shouldShow: true,
        indexOffset,
        data: getTagsOptions(filteredTags),
    });

    return tagSections;
}

/**
 * Build the options
 *
 * @param {Object} reports
 * @param {Object} personalDetails
 * @param {Object} options
 * @returns {Object}
 * @private
 */
function getOptions(
    reports,
    personalDetails,
    {
        reportActions = {},
        betas = [],
        selectedOptions = [],
        maxRecentReportsToShow = 0,
        excludeLogins = [],
        includeMultipleParticipantReports = false,
        includePersonalDetails = false,
        includeRecentReports = false,
        // When sortByReportTypeInSearch flag is true, recentReports will include the personalDetails options as well.
        sortByReportTypeInSearch = false,
        searchInputValue = '',
        showChatPreviewLine = false,
        sortPersonalDetailsByAlphaAsc = true,
        forcePolicyNamePreview = false,
        includeOwnedWorkspaceChats = false,
        includeThreads = false,
        includeTasks = false,
        includeMoneyRequests = false,
        excludeUnknownUsers = false,
        includeP2P = true,
        includeCategories = false,
        categories = {},
        recentlyUsedCategories = [],
        includeTags = false,
        tags = {},
        recentlyUsedTags = [],
        canInviteUser = true,
        includeSelectedOptions = false,
    },
) {
    if (includeCategories) {
        const categoryOptions = getCategoryListSections(categories, recentlyUsedCategories, selectedOptions, searchInputValue, maxRecentReportsToShow);

        return {
            recentReports: [],
            personalDetails: [],
            userToInvite: null,
            currentUserOption: null,
            categoryOptions,
            tagOptions: [],
        };
    }

    if (includeTags) {
        const tagOptions = getTagListSections(_.values(tags), recentlyUsedTags, selectedOptions, searchInputValue, maxRecentReportsToShow);

        return {
            recentReports: [],
            personalDetails: [],
            userToInvite: null,
            currentUserOption: null,
            categoryOptions: [],
            tagOptions,
        };
    }

    if (!isPersonalDetailsReady(personalDetails)) {
        return {
            recentReports: [],
            personalDetails: [],
            userToInvite: null,
            currentUserOption: null,
            categoryOptions: [],
            tagOptions: [],
        };
    }

    let recentReportOptions = [];
    let personalDetailsOptions = [];
    const reportMapForAccountIDs = {};
    const parsedPhoneNumber = parsePhoneNumber(LoginUtils.appendCountryCode(Str.removeSMSDomain(searchInputValue)));
    const searchValue = parsedPhoneNumber.possible ? parsedPhoneNumber.number.e164 : searchInputValue.toLowerCase();

    // Filter out all the reports that shouldn't be displayed
    const filteredReports = _.filter(reports, (report) => ReportUtils.shouldReportBeInOptionList(report, Navigation.getTopmostReportId(), false, betas, policies));

    // Sorting the reports works like this:
    // - Order everything by the last message timestamp (descending)
    // - All archived reports should remain at the bottom
    const orderedReports = _.sortBy(filteredReports, (report) => {
        if (ReportUtils.isArchivedRoom(report)) {
            return CONST.DATE.UNIX_EPOCH;
        }

        return report.lastVisibleActionCreated;
    });
    orderedReports.reverse();

    const allReportOptions = [];
    _.each(orderedReports, (report) => {
        if (!report) {
            return;
        }

        const isThread = ReportUtils.isChatThread(report);
        const isChatRoom = ReportUtils.isChatRoom(report);
        const isTaskReport = ReportUtils.isTaskReport(report);
        const isPolicyExpenseChat = ReportUtils.isPolicyExpenseChat(report);
        const isMoneyRequestReport = ReportUtils.isMoneyRequestReport(report);
        const accountIDs = report.participantAccountIDs || [];

        if (isPolicyExpenseChat && report.isOwnPolicyExpenseChat && !includeOwnedWorkspaceChats) {
            return;
        }

        // When passing includeP2P false we are trying to hide features from users that are not ready for P2P and limited to workspace chats only.
        if (!includeP2P && !isPolicyExpenseChat) {
            return;
        }

        if (isThread && !includeThreads) {
            return;
        }

        if (isTaskReport && !includeTasks) {
            return;
        }

        if (isMoneyRequestReport && !includeMoneyRequests) {
            return;
        }

        // In case user needs to add credit bank account, don't allow them to request more money from the workspace.
        if (includeOwnedWorkspaceChats && ReportUtils.hasIOUWaitingOnCurrentUserBankAccount(report)) {
            return;
        }

        // Save the report in the map if this is a single participant so we can associate the reportID with the
        // personal detail option later. Individuals should not be associated with single participant
        // policyExpenseChats or chatRooms since those are not people.
        if (accountIDs.length <= 1 && !isPolicyExpenseChat && !isChatRoom) {
            reportMapForAccountIDs[accountIDs[0]] = report;
        }
        const isSearchingSomeonesPolicyExpenseChat = !report.isOwnPolicyExpenseChat && searchValue !== '';

        // Checks to see if the current user is the admin of the policy, if so the policy
        // name preview will be shown.
        const isPolicyChatAdmin = ReportUtils.isPolicyExpenseChatAdmin(report, policies);

        allReportOptions.push(
            createOption(accountIDs, personalDetails, report, reportActions, {
                showChatPreviewLine,
                forcePolicyNamePreview: isPolicyExpenseChat ? isSearchingSomeonesPolicyExpenseChat || isPolicyChatAdmin : forcePolicyNamePreview,
            }),
        );
    });

    // We're only picking personal details that have logins set
    // This is a temporary fix for all the logic that's been breaking because of the new privacy changes
    // See https://github.com/Expensify/Expensify/issues/293465 for more context
    // Moreover, we should not override the personalDetails object, otherwise the createOption util won't work properly, it returns incorrect tooltipText
    const havingLoginPersonalDetails = !includeP2P ? {} : _.pick(personalDetails, (detail) => Boolean(detail.login));
    let allPersonalDetailsOptions = _.map(havingLoginPersonalDetails, (personalDetail) =>
        createOption([personalDetail.accountID], personalDetails, reportMapForAccountIDs[personalDetail.accountID], reportActions, {
            showChatPreviewLine,
            forcePolicyNamePreview,
        }),
    );

    if (sortPersonalDetailsByAlphaAsc) {
        // PersonalDetails should be ordered Alphabetically by default - https://github.com/Expensify/App/issues/8220#issuecomment-1104009435
        allPersonalDetailsOptions = lodashOrderBy(allPersonalDetailsOptions, [(personalDetail) => personalDetail.text && personalDetail.text.toLowerCase()], 'asc');
    }

    // Exclude the current user from the personal details list
    const optionsToExclude = [{login: currentUserLogin}];

    // If we're including selected options from the search results, we only want to exclude them if the search input is empty
    // This is because on certain pages, we show the selected options at the top when the search input is empty
    // This prevents the issue of seeing the selected option twice if you have them as a recent chat and select them
    if (!includeSelectedOptions || searchInputValue === '') {
        optionsToExclude.push(...selectedOptions);
    }

    _.each(excludeLogins, (login) => {
        optionsToExclude.push({login});
    });

    if (includeRecentReports) {
        for (let i = 0; i < allReportOptions.length; i++) {
            const reportOption = allReportOptions[i];

            // Stop adding options to the recentReports array when we reach the maxRecentReportsToShow value
            if (recentReportOptions.length > 0 && recentReportOptions.length === maxRecentReportsToShow) {
                break;
            }

            const isCurrentUserOwnedPolicyExpenseChatThatCouldShow =
                reportOption.isPolicyExpenseChat && reportOption.ownerAccountID === currentUserAccountID && includeOwnedWorkspaceChats && !reportOption.isArchivedRoom;

            // Skip if we aren't including multiple participant reports and this report has multiple participants
            if (!isCurrentUserOwnedPolicyExpenseChatThatCouldShow && !includeMultipleParticipantReports && !reportOption.login) {
                continue;
            }

            // If we're excluding threads, check the report to see if it has a single participant and if the participant is already selected
            if (
                !includeThreads &&
                (reportOption.login || reportOption.reportID) &&
                _.some(optionsToExclude, (option) => (option.login && option.login === reportOption.login) || (option.reportID && option.reportID === reportOption.reportID))
            ) {
                continue;
            }

            // Finally check to see if this option is a match for the provided search string if we have one
            const {searchText, participantsList, isChatRoom} = reportOption;
            const participantNames = getParticipantNames(participantsList);

            if (searchValue) {
                // Determine if the search is happening within a chat room and starts with the report ID
                const isReportIdSearch = isChatRoom && Str.startsWith(reportOption.reportID, searchValue);

                // Check if the search string matches the search text or participant names considering the type of the room
                const isSearchMatch = isSearchStringMatch(searchValue, searchText, participantNames, isChatRoom);

                if (!isReportIdSearch && !isSearchMatch) {
                    continue;
                }
            }

            recentReportOptions.push(reportOption);

            // Add this login to the exclude list so it won't appear when we process the personal details
            if (reportOption.login) {
                optionsToExclude.push({login: reportOption.login});
            }
        }
    }

    if (includePersonalDetails) {
        // Next loop over all personal details removing any that are selectedUsers or recentChats
        _.each(allPersonalDetailsOptions, (personalDetailOption) => {
            if (_.some(optionsToExclude, (optionToExclude) => optionToExclude.login === personalDetailOption.login)) {
                return;
            }
            const {searchText, participantsList, isChatRoom} = personalDetailOption;
            const participantNames = getParticipantNames(participantsList);
            if (searchValue && !isSearchStringMatch(searchValue, searchText, participantNames, isChatRoom)) {
                return;
            }

            personalDetailsOptions.push(personalDetailOption);
        });
    }

    let currentUserOption = _.find(allPersonalDetailsOptions, (personalDetailsOption) => personalDetailsOption.login === currentUserLogin);
    if (searchValue && currentUserOption && !isSearchStringMatch(searchValue, currentUserOption.searchText)) {
        currentUserOption = null;
    }

    let userToInvite = null;
    const noOptions = recentReportOptions.length + personalDetailsOptions.length === 0 && !currentUserOption;
    const noOptionsMatchExactly = !_.find(
        personalDetailsOptions.concat(recentReportOptions),
        (option) => option.login === addSMSDomainIfPhoneNumber(searchValue).toLowerCase() || option.login === searchValue.toLowerCase(),
    );

    if (
        searchValue &&
        (noOptions || noOptionsMatchExactly) &&
        !isCurrentUser({login: searchValue}) &&
        _.every(selectedOptions, (option) => option.login !== searchValue) &&
        ((Str.isValidEmail(searchValue) && !Str.isDomainEmail(searchValue) && !Str.endsWith(searchValue, CONST.SMS.DOMAIN)) ||
            (parsedPhoneNumber.possible && Str.isValidPhone(LoginUtils.getPhoneNumberWithoutSpecialChars(parsedPhoneNumber.number.input)))) &&
        !_.find(optionsToExclude, (optionToExclude) => optionToExclude.login === addSMSDomainIfPhoneNumber(searchValue).toLowerCase()) &&
        (searchValue !== CONST.EMAIL.CHRONOS || Permissions.canUseChronos(betas)) &&
        !excludeUnknownUsers
    ) {
        // Generates an optimistic account ID for new users not yet saved in Onyx
        const optimisticAccountID = UserUtils.generateAccountID(searchValue);
        const personalDetailsExtended = {
            ...personalDetails,
            [optimisticAccountID]: {
                accountID: optimisticAccountID,
                login: searchValue,
                avatar: UserUtils.getDefaultAvatar(optimisticAccountID),
            },
        };
        userToInvite = createOption([optimisticAccountID], personalDetailsExtended, null, reportActions, {
            showChatPreviewLine,
        });
        userToInvite.isOptimisticAccount = true;
        userToInvite.login = searchValue;
        userToInvite.text = userToInvite.text || searchValue;
        userToInvite.alternateText = userToInvite.alternateText || searchValue;

        // If user doesn't exist, use a default avatar
        userToInvite.icons = [
            {
                source: UserUtils.getAvatar('', optimisticAccountID),
                name: searchValue,
                type: CONST.ICON_TYPE_AVATAR,
            },
        ];
    }

    // If we are prioritizing 1:1 chats in search, do it only once we started searching
    if (sortByReportTypeInSearch && searchValue !== '') {
        // When sortByReportTypeInSearch is true, recentReports will be returned with all the reports including personalDetailsOptions in the correct Order.
        recentReportOptions.push(...personalDetailsOptions);
        personalDetailsOptions = [];
        recentReportOptions = lodashOrderBy(
            recentReportOptions,
            [
                (option) => {
                    if (option.isChatRoom || option.isArchivedRoom) {
                        return 3;
                    }
                    if (!option.login) {
                        return 2;
                    }
                    if (option.login.toLowerCase() !== searchValue.toLowerCase()) {
                        return 1;
                    }

                    // When option.login is an exact match with the search value, returning 0 puts it at the top of the option list
                    return 0;
                },
            ],
            ['asc'],
        );
    }

    return {
        personalDetails: _.filter(personalDetailsOptions, (personalDetailsOption) => !personalDetailsOption.isOptimisticPersonalDetail),
        recentReports: recentReportOptions,
        userToInvite: canInviteUser ? userToInvite : null,
        currentUserOption,
        categoryOptions: [],
        tagOptions: [],
    };
}

/**
 * Build the options for the Search view
 *
 * @param {Object} reports
 * @param {Object} personalDetails
 * @param {String} searchValue
 * @param {Array<String>} betas
 * @returns {Object}
 */
function getSearchOptions(reports, personalDetails, searchValue = '', betas) {
    return getOptions(reports, personalDetails, {
        betas,
        searchInputValue: searchValue.trim(),
        includeRecentReports: true,
        includeMultipleParticipantReports: true,
        maxRecentReportsToShow: 0, // Unlimited
        sortByReportTypeInSearch: true,
        showChatPreviewLine: true,
        includePersonalDetails: true,
        forcePolicyNamePreview: true,
        includeOwnedWorkspaceChats: true,
        includeThreads: true,
        includeMoneyRequests: true,
        includeTasks: true,
    });
}

/**
 * Build the IOUConfirmation options for showing the payee personalDetail
 *
 * @param {Object} personalDetail
 * @param {String} amountText
 * @returns {Object}
 */
function getIOUConfirmationOptionsFromPayeePersonalDetail(personalDetail, amountText) {
    const formattedLogin = LocalePhoneNumber.formatPhoneNumber(personalDetail.login);
    return {
        text: personalDetail.displayName || formattedLogin,
        alternateText: formattedLogin || personalDetail.displayName,
        icons: [
            {
                source: UserUtils.getAvatar(personalDetail.avatar, personalDetail.accountID),
                name: personalDetail.login,
                type: CONST.ICON_TYPE_AVATAR,
                id: personalDetail.accountID,
            },
        ],
        descriptiveText: amountText,
        login: personalDetail.login,
        accountID: personalDetail.accountID,
    };
}

/**
 * Build the IOUConfirmationOptions for showing participants
 *
 * @param {Array} participants
 * @param {String} amountText
 * @returns {Array}
 */
function getIOUConfirmationOptionsFromParticipants(participants, amountText) {
    return _.map(participants, (participant) => ({
        ...participant,
        descriptiveText: amountText,
    }));
}

/**
 * Build the options for the New Group view
 *
 * @param {Object} reports
 * @param {Object} personalDetails
 * @param {Array<String>} [betas]
 * @param {String} [searchValue]
 * @param {Array} [selectedOptions]
 * @param {Array} [excludeLogins]
 * @param {Boolean} [includeOwnedWorkspaceChats]
 * @param {boolean} [includeP2P]
 * @param {boolean} [includeCategories]
 * @param {Object} [categories]
 * @param {Array<String>} [recentlyUsedCategories]
 * @param {boolean} [includeTags]
 * @param {Object} [tags]
 * @param {Array<String>} [recentlyUsedTags]
 * @param {boolean} [canInviteUser]
 * @param {boolean} [includeSelectedOptions]
 * @returns {Object}
 */
function getFilteredOptions(
    reports,
    personalDetails,
    betas = [],
    searchValue = '',
    selectedOptions = [],
    excludeLogins = [],
    includeOwnedWorkspaceChats = false,
    includeP2P = true,
    includeCategories = false,
    categories = {},
    recentlyUsedCategories = [],
    includeTags = false,
    tags = {},
    recentlyUsedTags = [],
    canInviteUser = true,
    includeSelectedOptions = false,
) {
    return getOptions(reports, personalDetails, {
        betas,
        searchInputValue: searchValue.trim(),
        selectedOptions,
        includeRecentReports: true,
        includePersonalDetails: true,
        maxRecentReportsToShow: 5,
        excludeLogins,
        includeOwnedWorkspaceChats,
        includeP2P,
        includeCategories,
        categories,
        recentlyUsedCategories,
        includeTags,
        tags,
        recentlyUsedTags,
        canInviteUser,
        includeSelectedOptions,
    });
}

/**
 * Build the options for the Share Destination for a Task
 * *
 * @param {Object} reports
 * @param {Object} personalDetails
 * @param {Array<String>} [betas]
 * @param {String} [searchValue]
 * @param {Array} [selectedOptions]
 * @param {Array} [excludeLogins]
 * @param {Boolean} [includeOwnedWorkspaceChats]
 * @returns {Object}
 *
 */

function getShareDestinationOptions(
    reports,
    personalDetails,
    betas = [],
    searchValue = '',
    selectedOptions = [],
    excludeLogins = [],
    includeOwnedWorkspaceChats = true,
    excludeUnknownUsers = true,
) {
    return getOptions(reports, personalDetails, {
        betas,
        searchInputValue: searchValue.trim(),
        selectedOptions,
        maxRecentReportsToShow: 0, // Unlimited
        includeRecentReports: true,
        includeMultipleParticipantReports: true,
        includePersonalDetails: false,
        showChatPreviewLine: true,
        forcePolicyNamePreview: true,
        includeThreads: true,
        includeMoneyRequests: true,
        includeTasks: true,
        excludeLogins,
        includeOwnedWorkspaceChats,
        excludeUnknownUsers,
    });
}

/**
 * Format personalDetails or userToInvite to be shown in the list
 *
 * @param {Object} member - personalDetails or userToInvite
 * @param {Object} config - keys to overwrite the default values
 * @returns {Object}
 */
function formatMemberForList(member, config = {}) {
    if (!member) {
        return undefined;
    }

    const accountID = lodashGet(member, 'accountID', '');

    return {
        text: lodashGet(member, 'text', '') || lodashGet(member, 'displayName', ''),
        alternateText: lodashGet(member, 'alternateText', '') || lodashGet(member, 'login', ''),
        keyForList: lodashGet(member, 'keyForList', '') || String(accountID),
        isSelected: false,
        isDisabled: false,
        accountID,
        login: lodashGet(member, 'login', ''),
        rightElement: null,
        icons: lodashGet(member, 'icons'),
        pendingAction: lodashGet(member, 'pendingAction'),
        ...config,
    };
}

/**
 * Build the options for the Workspace Member Invite view
 *
 * @param {Object} personalDetails
 * @param {Array<String>} betas
 * @param {String} searchValue
 * @param {Array} excludeLogins
 * @returns {Object}
 */
function getMemberInviteOptions(personalDetails, betas = [], searchValue = '', excludeLogins = []) {
    return getOptions([], personalDetails, {
        betas,
        searchInputValue: searchValue.trim(),
        includePersonalDetails: true,
        excludeLogins,
        sortPersonalDetailsByAlphaAsc: true,
    });
}

/**
 * Helper method that returns the text to be used for the header's message and title (if any)
 *
 * @param {Boolean} hasSelectableOptions
 * @param {Boolean} hasUserToInvite
 * @param {String} searchValue
 * @param {Boolean} [maxParticipantsReached]
 * @param {Boolean} [hasMatchedParticipant]
 * @return {String}
 */
function getHeaderMessage(hasSelectableOptions, hasUserToInvite, searchValue, maxParticipantsReached = false, hasMatchedParticipant = false) {
    if (maxParticipantsReached) {
        return Localize.translate(preferredLocale, 'common.maxParticipantsReached', {count: CONST.REPORT.MAXIMUM_PARTICIPANTS});
    }

    const isValidPhone = parsePhoneNumber(LoginUtils.appendCountryCode(searchValue)).possible;

    const isValidEmail = Str.isValidEmail(searchValue);

    if (searchValue && CONST.REGEX.DIGITS_AND_PLUS.test(searchValue) && !isValidPhone && !hasSelectableOptions) {
        return Localize.translate(preferredLocale, 'messages.errorMessageInvalidPhone');
    }

    // Without a search value, it would be very confusing to see a search validation message.
    // Therefore, this skips the validation when there is no search value.
    if (searchValue && !hasSelectableOptions && !hasUserToInvite) {
        if (/^\d+$/.test(searchValue) && !isValidPhone) {
            return Localize.translate(preferredLocale, 'messages.errorMessageInvalidPhone');
        }
        if (/@/.test(searchValue) && !isValidEmail) {
            return Localize.translate(preferredLocale, 'messages.errorMessageInvalidEmail');
        }
        if (hasMatchedParticipant && (isValidEmail || isValidPhone)) {
            return '';
        }
        return Localize.translate(preferredLocale, 'common.noResultsFound');
    }

    return '';
}

/**
 * Helper method for non-user lists (eg. categories and tags) that returns the text to be used for the header's message and title (if any)
 *
 * @param {Boolean} hasSelectableOptions
 * @param {String} searchValue
 * @return {String}
 */
function getHeaderMessageForNonUserList(hasSelectableOptions, searchValue) {
    if (searchValue && !hasSelectableOptions) {
        return Localize.translate(preferredLocale, 'common.noResultsFound');
    }
    return '';
}

/**
 * Helper method to check whether an option can show tooltip or not
 * @param {Object} option
 * @returns {Boolean}
 */
function shouldOptionShowTooltip(option) {
    return (!option.isChatRoom || option.isThread) && !option.isArchivedRoom;
}

/**
 * Handles the logic for displaying selected participants from the search term
 * @param {String} searchTerm
 * @param {Array} selectedOptions
 * @param {Array} filteredRecentReports
 * @param {Array} filteredPersonalDetails
 * @param {Object} personalDetails
 * @param {Boolean} shouldGetOptionDetails
 * @param {Number} indexOffset
 * @returns {Object}
 */
function formatSectionsFromSearchTerm(searchTerm, selectedOptions, filteredRecentReports, filteredPersonalDetails, personalDetails = {}, shouldGetOptionDetails = false, indexOffset) {
    // We show the selected participants at the top of the list when there is no search term
    // However, if there is a search term we remove the selected participants from the top of the list unless they are part of the search results
    // This clears up space on mobile views, where if you create a group with 4+ people you can't see the selected participants and the search results at the same time
    if (searchTerm === '') {
        return {
            section: {
                title: undefined,
                data: shouldGetOptionDetails
                    ? _.map(selectedOptions, (participant) => {
                          const isPolicyExpenseChat = lodashGet(participant, 'isPolicyExpenseChat', false);
                          return isPolicyExpenseChat ? getPolicyExpenseReportOption(participant) : getParticipantsOption(participant, personalDetails);
                      })
                    : selectedOptions,
                shouldShow: !_.isEmpty(selectedOptions),
                indexOffset,
            },
            newIndexOffset: indexOffset + selectedOptions.length,
        };
    }

    // If you select a new user you don't have a contact for, they won't get returned as part of a recent report or personal details
    // This will add them to the list of options, deduping them if they already exist in the other lists
    const selectedParticipantsWithoutDetails = _.filter(selectedOptions, (participant) => {
        const accountID = lodashGet(participant, 'accountID', null);
        const isPartOfSearchTerm = participant.searchText.toLowerCase().includes(searchTerm.trim().toLowerCase());
        const isReportInRecentReports = _.some(filteredRecentReports, (report) => report.accountID === accountID);
        const isReportInPersonalDetails = _.some(filteredPersonalDetails, (personalDetail) => personalDetail.accountID === accountID);
        return isPartOfSearchTerm && !isReportInRecentReports && !isReportInPersonalDetails;
    });

    return {
        section: {
            title: undefined,
            data: shouldGetOptionDetails
                ? _.map(selectedParticipantsWithoutDetails, (participant) => {
                      const isPolicyExpenseChat = lodashGet(participant, 'isPolicyExpenseChat', false);
                      return isPolicyExpenseChat ? getPolicyExpenseReportOption(participant) : getParticipantsOption(participant, personalDetails);
                  })
                : selectedParticipantsWithoutDetails,
            shouldShow: !_.isEmpty(selectedParticipantsWithoutDetails),
            indexOffset,
        },
        newIndexOffset: indexOffset + selectedParticipantsWithoutDetails.length,
    };
}

export {
    addSMSDomainIfPhoneNumber,
    getAvatarsForAccountIDs,
    isCurrentUser,
    isPersonalDetailsReady,
    getSearchOptions,
    getFilteredOptions,
    getShareDestinationOptions,
    getMemberInviteOptions,
    getHeaderMessage,
    getHeaderMessageForNonUserList,
    getPersonalDetailsForAccountIDs,
    getIOUConfirmationOptionsFromPayeePersonalDetail,
    getIOUConfirmationOptionsFromParticipants,
    getSearchText,
    getAllReportErrors,
    getPolicyExpenseReportOption,
    getParticipantsOption,
    isSearchStringMatch,
    shouldOptionShowTooltip,
    getLastMessageTextForReport,
    getEnabledCategoriesCount,
    hasEnabledOptions,
    sortCategories,
    getCategoryOptionTree,
    formatMemberForList,
    formatSectionsFromSearchTerm,
};
