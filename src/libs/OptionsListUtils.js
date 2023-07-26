/* eslint-disable no-continue */
import _ from 'underscore';
import Onyx from 'react-native-onyx';
import lodashOrderBy from 'lodash/orderBy';
import lodashGet from 'lodash/get';
import Str from 'expensify-common/lib/str';
import {parsePhoneNumber} from 'awesome-phonenumber';
import ONYXKEYS from '../ONYXKEYS';
import CONST from '../CONST';
import * as ReportUtils from './ReportUtils';
import * as Localize from './Localize';
import Permissions from './Permissions';
import * as CollectionUtils from './CollectionUtils';
import Navigation from './Navigation/Navigation';
import * as LoginUtils from './LoginUtils';
import * as LocalePhoneNumber from './LocalePhoneNumber';
import * as UserUtils from './UserUtils';
import * as ReportActionUtils from './ReportActionsUtils';
import * as PersonalDetailsUtils from './PersonalDetailsUtils';

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
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
    callback: (actions, key) => {
        if (!key || !actions) {
            return;
        }
        const sortedReportActions = ReportActionUtils.getSortedReportActions(_.toArray(actions), true);
        const reportID = CollectionUtils.extractCollectionItemID(key);
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

/**
 * Get the options for a policy expense report.
 * @param {Object} report
 * @returns {Array}
 */
function getPolicyExpenseReportOptions(report) {
    const expenseReport = policyExpenseReports[`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`];
    const policyExpenseChatAvatarSource = ReportUtils.getWorkspaceAvatar(expenseReport);
    return [
        {
            ...expenseReport,
            keyForList: expenseReport.policyID,
            text: expenseReport.displayName,
            alternateText: Localize.translateLocal('workspace.common.workspace'),
            icons: [
                {
                    source: policyExpenseChatAvatarSource,
                    name: expenseReport.displayName,
                    type: CONST.ICON_TYPE_WORKSPACE,
                },
            ],
            selected: report.selected,
            isPolicyExpenseChat: true,
        },
    ];
}

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
 * Get the participant options for a report.
 * @param {Array<Object>} participants
 * @param {Array<Object>} personalDetails
 * @returns {Array}
 */
function getParticipantsOptions(participants, personalDetails) {
    const details = getPersonalDetailsForAccountIDs(_.pluck(participants, 'accountID'), personalDetails);
    return _.map(participants, (participant) => {
        const detail = details[participant.accountID];
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
            payPalMeAddress: lodashGet(detail, 'payPalMeAddress', ''),
            phoneNumber: lodashGet(detail, 'phoneNumber', ''),
            selected: participant.selected,
        };
    });
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
    const reportID = report.reportID;
    const reportsActions = reportActions[`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`] || {};
    const reportActionErrors = _.reduce(
        reportsActions,
        (prevReportActionErrors, action) => (!action || _.isEmpty(action.errors) ? prevReportActionErrors : _.extend(prevReportActionErrors, action.errors)),
        {},
    );

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
    const lastReportAction = lastReportActions[report.reportID];
    let lastMessageTextFromReport = '';

    if (ReportUtils.isReportMessageAttachment({text: report.lastMessageText, html: report.lastMessageHtml, translationKey: report.lastMessageTranslationKey})) {
        lastMessageTextFromReport = `[${Localize.translateLocal(report.lastMessageTranslationKey || 'common.attachment')}]`;
    } else if (ReportActionUtils.isReportPreviewAction(lastReportAction)) {
        const iouReport = ReportUtils.getReport(ReportActionUtils.getIOUReportIDFromReportActionPreview(lastReportAction));
        lastMessageTextFromReport = ReportUtils.getReportPreviewMessage(iouReport, lastReportAction);
    } else {
        lastMessageTextFromReport = report ? report.lastMessageText || '' : '';

        // Yeah this is a bit ugly. If the latest report action that is not a whisper has been moderated as pending remove, then set the last message text to the text of the latest visible action that is not a whisper.
        const lastNonWhisper = _.find(allSortedReportActions[report.reportID], (action) => !ReportActionUtils.isWhisperAction(action)) || {};
        if (ReportActionUtils.isPendingRemove(lastNonWhisper)) {
            const latestVisibleAction = _.find(allSortedReportActions[report.reportID], (action) => ReportActionUtils.shouldReportActionBeVisibleAsLastAction(action)) || {};
            lastMessageTextFromReport = lodashGet(latestVisibleAction, 'message[0].text', '');
        }
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
        payPalMeAddress: null,
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
        isExpenseReport: false,
    };

    const personalDetailMap = getPersonalDetailsForAccountIDs(accountIDs, personalDetails);
    const personalDetailList = _.values(personalDetailMap);
    const personalDetail = personalDetailList[0] || {};
    let hasMultipleParticipants = personalDetailList.length > 1;
    let subtitle;
    let reportName;

    result.participantsList = personalDetailList;

    if (report) {
        result.isChatRoom = ReportUtils.isChatRoom(report);
        result.isDefaultRoom = ReportUtils.isDefaultRoom(report);
        result.isArchivedRoom = ReportUtils.isArchivedRoom(report);
        result.isPolicyExpenseChat = ReportUtils.isPolicyExpenseChat(report);
        result.isExpenseReport = ReportUtils.isExpenseReport(report);
        result.isMoneyRequestReport = ReportUtils.isMoneyRequestReport(report);
        result.isThread = ReportUtils.isChatThread(report);
        result.isTaskReport = ReportUtils.isTaskReport(report);
        result.shouldShowSubscript = ReportUtils.shouldReportShowSubscript(report);
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

        if (result.isChatRoom || result.isPolicyExpenseChat) {
            result.alternateText = showChatPreviewLine && !forcePolicyNamePreview && lastMessageText ? lastMessageText : subtitle;
        } else if (result.isMoneyRequestReport) {
            result.alternateText = lastMessageTextFromReport.length > 0 ? lastMessageText : Localize.translate(preferredLocale, 'report.noActivityYet');
        } else if (result.isTaskReport) {
            result.alternateText = showChatPreviewLine && lastMessageText ? lastMessageTextFromReport : Localize.translate(preferredLocale, 'report.noActivityYet');
        } else {
            result.alternateText = showChatPreviewLine && lastMessageText ? lastMessageText : LocalePhoneNumber.formatPhoneNumber(personalDetail.login);
        }
        reportName = ReportUtils.getReportName(report);
    } else {
        reportName = ReportUtils.getDisplayNameForParticipant(accountIDs[0]);
        result.keyForList = String(accountIDs[0]);
        result.alternateText = LocalePhoneNumber.formatPhoneNumber(lodashGet(personalDetails, [accountIDs[0], 'login'], ''));
    }

    result.isIOUReportOwner = ReportUtils.isIOUOwnedByCurrentUser(result);
    result.iouReportAmount = ReportUtils.getMoneyRequestTotal(result);

    if (!hasMultipleParticipants) {
        result.login = personalDetail.login;
        result.accountID = Number(personalDetail.accountID);
        result.phoneNumber = personalDetail.phoneNumber;
        result.payPalMeAddress = personalDetail.payPalMeAddress;
    }

    result.text = reportName;
    result.searchText = getSearchText(report, reportName, personalDetailList, result.isChatRoom || result.isPolicyExpenseChat, result.isThread);
    result.icons = ReportUtils.getIcons(report, personalDetails, UserUtils.getAvatar(personalDetail.avatar, personalDetail.accountID), false, personalDetail.login, personalDetail.accountID);
    result.subtitle = subtitle;

    return result;
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
    },
) {
    if (!isPersonalDetailsReady(personalDetails)) {
        return {
            recentReports: [],
            personalDetails: [],
            userToInvite: null,
            currentUserOption: null,
        };
    }

    // We're only picking personal details that have logins set
    // This is a temporary fix for all the logic that's been breaking because of the new privacy changes
    // See https://github.com/Expensify/Expensify/issues/293465 for more context
    // eslint-disable-next-line no-param-reassign
    personalDetails = _.pick(personalDetails, (detail) => Boolean(detail.login));

    let recentReportOptions = [];
    let personalDetailsOptions = [];
    const reportMapForAccountIDs = {};
    const parsedPhoneNumber = parsePhoneNumber(LoginUtils.appendCountryCode(Str.removeSMSDomain(searchInputValue)));
    const searchValue = parsedPhoneNumber.possible ? parsedPhoneNumber.number.e164 : searchInputValue.toLowerCase();

    // Filter out all the reports that shouldn't be displayed
    const filteredReports = _.filter(reports, (report) => ReportUtils.shouldReportBeInOptionList(report, Navigation.getTopmostReportId(), false, null, betas, policies));

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

    let allPersonalDetailsOptions = _.map(personalDetails, (personalDetail) =>
        createOption([personalDetail.accountID], personalDetails, reportMapForAccountIDs[personalDetail.accountID], reportActions, {
            showChatPreviewLine,
            forcePolicyNamePreview,
        }),
    );

    if (sortPersonalDetailsByAlphaAsc) {
        // PersonalDetails should be ordered Alphabetically by default - https://github.com/Expensify/App/issues/8220#issuecomment-1104009435
        allPersonalDetailsOptions = lodashOrderBy(allPersonalDetailsOptions, [(personalDetail) => personalDetail.text && personalDetail.text.toLowerCase()], 'asc');
    }

    // Always exclude already selected options and the currently logged in user
    const loginOptionsToExclude = [...selectedOptions, {login: currentUserLogin}];

    _.each(excludeLogins, (login) => {
        loginOptionsToExclude.push({login});
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
            if (!includeThreads && reportOption.login && _.some(loginOptionsToExclude, (option) => option.login === reportOption.login)) {
                continue;
            }

            // Finally check to see if this option is a match for the provided search string if we have one
            const {searchText, participantsList, isChatRoom} = reportOption;
            const participantNames = getParticipantNames(participantsList);
            if (searchValue && !isSearchStringMatch(searchValue, searchText, participantNames, isChatRoom)) {
                continue;
            }

            recentReportOptions.push(reportOption);

            // Add this login to the exclude list so it won't appear when we process the personal details
            if (reportOption.login) {
                loginOptionsToExclude.push({login: reportOption.login});
            }
        }
    }

    if (includePersonalDetails) {
        // Next loop over all personal details removing any that are selectedUsers or recentChats
        _.each(allPersonalDetailsOptions, (personalDetailOption) => {
            if (_.some(loginOptionsToExclude, (loginOptionToExclude) => loginOptionToExclude.login === personalDetailOption.login)) {
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
    if (searchValue && !isSearchStringMatch(searchValue, currentUserOption.searchText)) {
        currentUserOption = null;
    }

    let userToInvite = null;
    const noOptions = recentReportOptions.length + personalDetailsOptions.length === 0 && !currentUserOption;
    const noOptionsMatchExactly = !_.find(personalDetailsOptions.concat(recentReportOptions), (option) => option.login === addSMSDomainIfPhoneNumber(searchValue).toLowerCase());

    if (
        searchValue &&
        (noOptions || noOptionsMatchExactly) &&
        !isCurrentUser({login: searchValue}) &&
        _.every(selectedOptions, (option) => option.login !== searchValue) &&
        ((Str.isValidEmail(searchValue) && !Str.isDomainEmail(searchValue) && !Str.endsWith(searchValue, CONST.SMS.DOMAIN)) ||
            (parsedPhoneNumber.possible && Str.isValidPhone(LoginUtils.getPhoneNumberWithoutSpecialChars(parsedPhoneNumber.number.input)))) &&
        !_.find(loginOptionsToExclude, (loginOptionToExclude) => loginOptionToExclude.login === addSMSDomainIfPhoneNumber(searchValue).toLowerCase()) &&
        (searchValue !== CONST.EMAIL.CHRONOS || Permissions.canUseChronos(betas))
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
        personalDetails: personalDetailsOptions,
        recentReports: recentReportOptions,
        userToInvite,
        currentUserOption,
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
    return {
        text: personalDetail.displayName ? personalDetail.displayName : personalDetail.login,
        alternateText: personalDetail.login || personalDetail.displayName,
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
 * @returns {Object}
 */
function getNewChatOptions(reports, personalDetails, betas = [], searchValue = '', selectedOptions = [], excludeLogins = [], includeOwnedWorkspaceChats = false) {
    return getOptions(reports, personalDetails, {
        betas,
        searchInputValue: searchValue.trim(),
        selectedOptions,
        includeRecentReports: true,
        includePersonalDetails: true,
        maxRecentReportsToShow: 5,
        excludeLogins,
        includeOwnedWorkspaceChats,
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

function getShareDestinationOptions(reports, personalDetails, betas = [], searchValue = '', selectedOptions = [], excludeLogins = [], includeOwnedWorkspaceChats = true) {
    return getOptions(reports, personalDetails, {
        betas,
        searchInputValue: searchValue.trim(),
        selectedOptions,
        maxRecentReportsToShow: 5,
        includeRecentReports: true,
        includeMultipleParticipantReports: true,
        includePersonalDetails: true,
        excludeLogins,
        includeOwnedWorkspaceChats,
    });
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
 * @return {String}
 */
function getHeaderMessage(hasSelectableOptions, hasUserToInvite, searchValue, maxParticipantsReached = false) {
    if (maxParticipantsReached) {
        return Localize.translate(preferredLocale, 'common.maxParticipantsReached', {count: CONST.REPORT.MAXIMUM_PARTICIPANTS});
    }

    const isValidPhone = parsePhoneNumber(LoginUtils.appendCountryCode(searchValue)).possible;

    const isValidEmail = Str.isValidEmail(searchValue);

    if (searchValue && CONST.REGEX.DIGITS_AND_PLUS.test(searchValue) && !isValidPhone) {
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

export {
    addSMSDomainIfPhoneNumber,
    getAvatarsForAccountIDs,
    isCurrentUser,
    isPersonalDetailsReady,
    getSearchOptions,
    getNewChatOptions,
    getShareDestinationOptions,
    getMemberInviteOptions,
    getHeaderMessage,
    getPersonalDetailsForAccountIDs,
    getIOUConfirmationOptionsFromPayeePersonalDetail,
    getIOUConfirmationOptionsFromParticipants,
    getSearchText,
    getAllReportErrors,
    getPolicyExpenseReportOptions,
    getParticipantsOptions,
    isSearchStringMatch,
    shouldOptionShowTooltip,
    getLastMessageTextForReport,
};
