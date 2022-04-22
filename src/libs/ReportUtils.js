import _ from 'underscore';
import Str from 'expensify-common/lib/str';
import lodashGet from 'lodash/get';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '../ONYXKEYS';
import CONST from '../CONST';
import * as Localize from './Localize';
import * as LocalePhoneNumber from './LocalePhoneNumber';
import * as Expensicons from '../components/Icon/Expensicons';
import md5 from './md5';

let sessionEmail;
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: val => sessionEmail = val ? val.email : null,
});

let preferredLocale = CONST.DEFAULT_LOCALE;
Onyx.connect({
    key: ONYXKEYS.NVP_PREFERRED_LOCALE,
    callback: (val) => {
        if (!val) {
            return;
        }
        preferredLocale = val;
    },
});

/**
 * Returns the concatenated title for the PrimaryLogins of a report
 *
 * @param {Array} logins
 * @returns {string}
 */
function getReportParticipantsTitle(logins) {
    return _.map(logins, login => Str.removeSMSDomain(login)).join(', ');
}

/**
 * Check whether a report action is Attachment or not.
 * Ignore messages containing [Attachment] as the main content. Attachments are actions with only text as [Attachment].
 *
 * @param {Object} reportActionMessage report action's message as text and html
 * @returns {Boolean}
 */
function isReportMessageAttachment({text, html}) {
    return text === '[Attachment]' && html !== '[Attachment]';
}

/**
 * Given a collection of reports returns them sorted by last visited
 *
 * @param {Object} reports
 * @returns {Array}
 */
function sortReportsByLastVisited(reports) {
    return _.chain(reports)
        .toArray()
        .filter(report => report && report.reportID)
        .sortBy('lastVisitedTimestamp')
        .value();
}

/**
 * Can only edit if it's an ADDCOMMENT that is not an attachment,
 * the author is this user and it's not an optimistic response.
 * If it's an optimistic response comment it will not have a reportActionID,
 * and we should wait until it does before we show the actions
 *
 * @param {Object} reportAction
 * @returns {Boolean}
 */
function canEditReportAction(reportAction) {
    return reportAction.actorEmail === sessionEmail
        && reportAction.reportActionID
        && reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT
        && !isReportMessageAttachment(lodashGet(reportAction, ['message', 0], {}));
}

/**
 * Can only delete if it's an ADDCOMMENT, the author is this user and it's not an optimistic response.
 * If it's an optimistic response comment it will not have a reportActionID,
 * and we should wait until it does before we show the actions
 *
 * @param {Object} reportAction
 * @returns {Boolean}
 */
function canDeleteReportAction(reportAction) {
    return reportAction.actorEmail === sessionEmail
        && reportAction.reportActionID
        && reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT;
}

/**
 * Whether the provided report is a default room
 * @param {Object} report
 * @param {String} report.chatType
 * @returns {Boolean}
 */
function isDefaultRoom(report) {
    return _.contains([
        CONST.REPORT.CHAT_TYPE.POLICY_ADMINS,
        CONST.REPORT.CHAT_TYPE.POLICY_ANNOUNCE,
        CONST.REPORT.CHAT_TYPE.DOMAIN_ALL,
    ], lodashGet(report, ['chatType'], ''));
}

/**
 * Whether the provided report is an Admin room
 * @param {Object} report
 * @param {String} report.chatType
 * @returns {Boolean}
 */
function isAdminRoom(report) {
    return lodashGet(report, ['chatType'], '') === CONST.REPORT.CHAT_TYPE.POLICY_ADMINS;
}

/**
 * Whether the provided report is a Announce room
 * @param {Object} report
 * @param {String} report.chatType
 * @returns {Boolean}
 */
function isAnnounceRoom(report) {
    return lodashGet(report, ['chatType'], '') === CONST.REPORT.CHAT_TYPE.POLICY_ANNOUNCE;
}

/**
 * Whether the provided report is a user created policy room
 * @param {Object} report
 * @param {String} report.chatType
 * @returns {Boolean}
 */
function isUserCreatedPolicyRoom(report) {
    return lodashGet(report, ['chatType'], '') === CONST.REPORT.CHAT_TYPE.POLICY_ROOM;
}

/**
 * Whether the provided report is a Policy Expense chat.
 * @param {Object} report
 * @param {String} report.chatType
 * @returns {Boolean}
 */
function isPolicyExpenseChat(report) {
    return lodashGet(report, ['chatType'], '') === CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT;
}

/**
 * Whether the provided report is a chat room
 * @param {Object} report
 * @param {String} report.chatType
 * @returns {Boolean}
 */
function isChatRoom(report) {
    return isUserCreatedPolicyRoom(report) || isDefaultRoom(report);
}

/**
 * Given a collection of reports returns the most recently accessed one
 *
 * @param {Record<String, {lastVisitedTimestamp, reportID}>|Array<{lastVisitedTimestamp, reportID}>} reports
 * @param {Boolean} [ignoreDefaultRooms]
 * @returns {Object}
 */
function findLastAccessedReport(reports, ignoreDefaultRooms) {
    let sortedReports = sortReportsByLastVisited(reports);

    if (ignoreDefaultRooms) {
        sortedReports = _.filter(sortedReports, report => !isDefaultRoom(report));
    }

    return _.last(sortedReports);
}

/**
 * Whether the provided report is an archived room
 * @param {Object} report
 * @param {String} report.chatType
 * @param {Number} report.stateNum
 * @param {Number} report.statusNum
 * @returns {Boolean}
 */
function isArchivedRoom(report) {
    if (!isChatRoom(report) && !isPolicyExpenseChat(report)) {
        return false;
    }

    return report.statusNum === CONST.REPORT.STATUS.CLOSED && report.stateNum === CONST.REPORT.STATE_NUM.SUBMITTED;
}

/**
 * Get the policy name from a given report
 * @param {Object} report
 * @param {String} report.policyID
 * @param {String} report.oldPolicyName
 * @param {Object} policies must have Onyxkey prefix (i.e 'policy_') for keys
 * @returns {String}
 */
function getPolicyName(report, policies) {
    const defaultValue = report.oldPolicyName || Localize.translateLocal('workspace.common.unavailable');
    return lodashGet(policies, [`${ONYXKEYS.COLLECTION.POLICY}${report.policyID}`, 'name'], defaultValue);
}

/**
 * Get either the policyName or domainName the chat is tied to
 * @param {Object} report
 * @param {Object} policiesMap must have onyxkey prefix (i.e 'policy_') for keys
 * @returns {String}
 */
function getChatRoomSubtitle(report, policiesMap) {
    if (!isDefaultRoom(report) && !isUserCreatedPolicyRoom(report) && !isPolicyExpenseChat(report)) {
        return '';
    }
    if (report.chatType === CONST.REPORT.CHAT_TYPE.DOMAIN_ALL) {
        // The domainAll rooms are just #domainName, so we ignore the prefix '#' to get the domainName
        return report.reportName.substring(1);
    }
    if (isPolicyExpenseChat(report) && report.isOwnPolicyExpenseChat) {
        return Localize.translateLocal('workspace.common.workspace');
    }
    if (isArchivedRoom(report)) {
        return report.oldPolicyName;
    }
    return getPolicyName(report, policiesMap);
}

/**
 * Get welcome message based on room type
 * @param {Object} report
 * @param {Object} policiesMap must have Onyxkey prefix (i.e 'policy_') for keys
 * @returns {Object}
 */

function getRoomWelcomeMessage(report, policiesMap) {
    const welcomeMessage = {};
    const workspaceName = getPolicyName(report, policiesMap);

    if (isArchivedRoom(report)) {
        welcomeMessage.phrase1 = Localize.translateLocal('reportActionsView.begginningOfArchivedRoomPartOne');
        welcomeMessage.phrase2 = Localize.translateLocal('reportActionsView.begginningOfArchivedRoomPartTwo');
    } else if (isAdminRoom(report)) {
        welcomeMessage.phrase1 = Localize.translateLocal('reportActionsView.beginningOfChatHistoryAdminRoomPartOne', {workspaceName});
        welcomeMessage.phrase2 = Localize.translateLocal('reportActionsView.beginningOfChatHistoryAdminRoomPartTwo');
    } else if (isAnnounceRoom(report)) {
        welcomeMessage.phrase1 = Localize.translateLocal('reportActionsView.beginningOfChatHistoryAnnounceRoomPartOne', {workspaceName});
        welcomeMessage.phrase2 = Localize.translateLocal('reportActionsView.beginningOfChatHistoryAnnounceRoomPartTwo', {workspaceName});
    } else {
        // Message for user created rooms or other room types.
        welcomeMessage.phrase1 = Localize.translateLocal('reportActionsView.beginningOfChatHistoryUserRoomPartOne');
        welcomeMessage.phrase2 = Localize.translateLocal('reportActionsView.beginningOfChatHistoryUserRoomPartTwo');
    }

    return welcomeMessage;
}

/**
 * Only returns true if this is our main 1:1 DM report with Concierge
 *
 * @param {Object} report
 * @returns {Boolean}
 */
function isConciergeChatReport(report) {
    return lodashGet(report, 'participants', []).length === 1
        && report.participants[0] === CONST.EMAIL.CONCIERGE;
}

/**
 * Returns true if Concierge is one of the chat participants (1:1 as well as group chats)
 * @param {Object} report
 * @returns {Boolean}
 */
function chatIncludesConcierge(report) {
    return report.participants
            && _.contains(report.participants, CONST.EMAIL.CONCIERGE);
}

/**
 * Returns true if there is any automated expensify account in emails
 * @param {Array} emails
 * @returns {Boolean}
 */
function hasExpensifyEmails(emails) {
    return _.intersection(emails, CONST.EXPENSIFY_EMAILS).length > 0;
}

/**
 * Whether the time row should be shown for a report.
 * @param {Array<Object>} personalDetails
 * @param {Object} report
 * @return {Boolean}
 */
function canShowReportRecipientLocalTime(personalDetails, report) {
    const reportParticipants = lodashGet(report, 'participants', []);
    const hasMultipleParticipants = reportParticipants.length > 1;
    const reportRecipient = personalDetails[reportParticipants[0]];
    const reportRecipientTimezone = lodashGet(reportRecipient, 'timezone', CONST.DEFAULT_TIME_ZONE);
    return !hasExpensifyEmails(reportParticipants)
        && !hasMultipleParticipants
        && reportRecipient
        && reportRecipientTimezone
        && reportRecipientTimezone.selected;
}

/**
 * Check if the comment is deleted
 * @param {Object} action
 * @returns {Boolean}
 */
function isDeletedAction(action) {
    // A deleted comment has either an empty array or an object with html field with empty string as value
    return action.message.length === 0 || action.message[0].html === '';
}

/**
 * Trim the last message text to a fixed limit.
 * @param {String} lastMessageText
 * @returns {String}
 */
function formatReportLastMessageText(lastMessageText) {
    return String(lastMessageText).substring(0, CONST.REPORT.LAST_MESSAGE_TEXT_MAX_LENGTH);
}

/**
 * Helper method to return a default avatar
 *
 * @param {String} [login]
 * @returns {String}
 */
function getDefaultAvatar(login = '') {
    // There are 8 possible default avatars, so we choose which one this user has based
    // on a simple hash of their login (which is converted from HEX to INT)
    const loginHashBucket = (parseInt(md5(login).substring(0, 4), 16) % 8) + 1;
    return `${CONST.CLOUDFRONT_URL}/images/avatars/avatar_${loginHashBucket}.png`;
}

/**
 * Returns the appropriate icons for the given chat report using the stored personalDetails.
 * The Avatar sources can be URLs or Icon components according to the chat type.
 *
 * @param {Object} report
 * @param {Object} personalDetails
 * @param {Object} policies
 * @param {*} [defaultIcon]
 * @returns {Array<*>}
 */
function getIcons(report, personalDetails, policies, defaultIcon = null) {
    if (!report) {
        return [defaultIcon || getDefaultAvatar()];
    }
    if (isArchivedRoom(report)) {
        return [Expensicons.DeletedRoomAvatar];
    }
    if (isAdminRoom(report)) {
        return [Expensicons.AdminRoomAvatar];
    }
    if (isAnnounceRoom(report)) {
        return [Expensicons.AnnounceRoomAvatar];
    }
    if (isChatRoom(report)) {
        return [Expensicons.ActiveRoomAvatar];
    }
    if (isPolicyExpenseChat(report)) {
        const policyExpenseChatAvatarSource = lodashGet(policies, [
            `${ONYXKEYS.COLLECTION.POLICY}${report.policyID}`, 'avatarURL',
        ]) || Expensicons.Workspace;

        // Return the workspace avatar if the user is the owner of the policy expense chat
        if (report.isOwnPolicyExpenseChat) {
            return [policyExpenseChatAvatarSource];
        }

        // If the user is an admin, return avatar source of the other participant of the report
        // (their workspace chat) and the avatar source of the workspace
        return [
            lodashGet(personalDetails, [report.ownerEmail, 'avatar']) || getDefaultAvatar(report.ownerEmail),
            policyExpenseChatAvatarSource,
        ];
    }

    // Return avatar sources for Group chats
    const sortedParticipants = _.map(report.participants, dmParticipant => ({
        firstName: lodashGet(personalDetails, [dmParticipant, 'firstName'], ''),
        avatar: lodashGet(personalDetails, [dmParticipant, 'avatar']) || getDefaultAvatar(dmParticipant),
    })).sort((first, second) => first.firstName - second.firstName);
    return _.map(sortedParticipants, item => item.avatar);
}

/**
 * Get the displayName for a single report participant.
 *
 * @param {Object} participant
 * @param {String} participant.displayName
 * @param {String} participant.firstName
 * @param {String} participant.login
 * @param {Boolean} [useShortForm]
 * @returns {String}
 */
function getDisplayNameForParticipant(participant, useShortForm = false) {
    if (!participant) {
        return '';
    }

    const loginWithoutSMSDomain = Str.removeSMSDomain(participant.login);
    let longName = participant.displayName || loginWithoutSMSDomain;
    if (Str.isSMSLogin(longName)) {
        longName = LocalePhoneNumber.toLocalPhone(preferredLocale, longName);
    }
    const shortName = participant.firstName || longName;

    return useShortForm ? shortName : longName;
}

/**
 * @param {Object} participants
 * @param {Boolean} isMultipleParticipantReport
 * @returns {Array}
 */
function getDisplayNamesWithTooltips(participants, isMultipleParticipantReport) {
    return _.map(participants, (participant) => {
        const displayName = getDisplayNameForParticipant(participant, isMultipleParticipantReport);
        const tooltip = Str.removeSMSDomain(participant.login);

        let pronouns = participant.pronouns;
        if (pronouns && pronouns.startsWith(CONST.PRONOUNS.PREFIX)) {
            const pronounTranslationKey = pronouns.replace(CONST.PRONOUNS.PREFIX, '');
            pronouns = Localize.translateLocal(`pronouns.${pronounTranslationKey}`);
        }

        return {
            displayName,
            tooltip,
            pronouns,
        };
    });
}

/**
 * Get the title for a report.
 *
 * @param {Object} report
 * @param {Object} [personalDetailsForParticipants]
 * @param {Object} [policies]
 * @returns {String}
 */
function getReportName(report, personalDetailsForParticipants = {}, policies = {}) {
    let title;
    if (isChatRoom(report)) {
        title = report.reportName;
    }

    if (isPolicyExpenseChat(report)) {
        const reportOwnerPersonalDetails = lodashGet(personalDetailsForParticipants, report.ownerEmail);
        const reportOwnerDisplayName = getDisplayNameForParticipant(reportOwnerPersonalDetails) || report.reportName;
        title = report.isOwnPolicyExpenseChat ? getPolicyName(report, policies) : reportOwnerDisplayName;
    }

    if (isArchivedRoom(report)) {
        title += ` (${Localize.translateLocal('common.archived')})`;
    }

    if (title) {
        return title;
    }

    // Not a room or PolicyExpenseChat, generate title from participants
    if (!_.has(report, 'participants')) {
        return '';
    }

    const displayNamesWithTooltips = getDisplayNamesWithTooltips(
        _.isEmpty(personalDetailsForParticipants) ? report.participants : personalDetailsForParticipants,
        report.participants.length > 1,
    );
    return _.map(displayNamesWithTooltips, ({displayName}) => displayName).join(', ');
}

export {
    getReportParticipantsTitle,
    isDeletedAction,
    isReportMessageAttachment,
    findLastAccessedReport,
    canEditReportAction,
    canDeleteReportAction,
    sortReportsByLastVisited,
    isDefaultRoom,
    isAdminRoom,
    isAnnounceRoom,
    isUserCreatedPolicyRoom,
    isChatRoom,
    getChatRoomSubtitle,
    getPolicyName,
    isArchivedRoom,
    isConciergeChatReport,
    hasExpensifyEmails,
    canShowReportRecipientLocalTime,
    formatReportLastMessageText,
    chatIncludesConcierge,
    isPolicyExpenseChat,
    getDefaultAvatar,
    getIcons,
    getRoomWelcomeMessage,
    getDisplayNamesWithTooltips,
    getReportName,
};
