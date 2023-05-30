import _ from 'underscore';
import Str from 'expensify-common/lib/str';
import lodashGet from 'lodash/get';
import lodashIntersection from 'lodash/intersection';
import Onyx from 'react-native-onyx';
import ExpensiMark from 'expensify-common/lib/ExpensiMark';
import ONYXKEYS from '../ONYXKEYS';
import CONST from '../CONST';
import * as Localize from './Localize';
import * as Expensicons from '../components/Icon/Expensicons';
import Navigation from './Navigation/Navigation';
import ROUTES from '../ROUTES';
import * as NumberUtils from './NumberUtils';
import * as NumberFormatUtils from './NumberFormatUtils';
import * as ReportActionsUtils from './ReportActionsUtils';
import Permissions from './Permissions';
import DateUtils from './DateUtils';
import linkingConfig from './Navigation/linkingConfig';
import isReportMessageAttachment from './isReportMessageAttachment';
import * as defaultWorkspaceAvatars from '../components/Icon/WorkspaceDefaultAvatars';
import * as LocalePhoneNumber from './LocalePhoneNumber';
import * as CurrencyUtils from './CurrencyUtils';
import * as UserUtils from './UserUtils';

let sessionEmail;
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (val) => (sessionEmail = val ? val.email : null),
});

let preferredLocale = CONST.LOCALES.DEFAULT;
Onyx.connect({
    key: ONYXKEYS.NVP_PREFERRED_LOCALE,
    callback: (val) => {
        if (!val) {
            return;
        }
        preferredLocale = val;
    },
});

let currentUserEmail;
let currentUserAccountID;
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (val) => {
        // When signed out, val is undefined
        if (!val) {
            return;
        }

        currentUserEmail = val.email;
        currentUserAccountID = val.accountID;
    },
});

let allPersonalDetails;
let currentUserPersonalDetails;
Onyx.connect({
    key: ONYXKEYS.PERSONAL_DETAILS,
    callback: (val) => {
        currentUserPersonalDetails = lodashGet(val, currentUserEmail, {});
        allPersonalDetails = val;
    },
});

let allReports;
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback: (val) => (allReports = val),
});

let doesDomainHaveApprovedAccountant;
Onyx.connect({
    key: ONYXKEYS.ACCOUNT,
    waitForCollectionCallback: true,
    callback: (val) => (doesDomainHaveApprovedAccountant = lodashGet(val, 'doesDomainHaveApprovedAccountant', false)),
});

let allPolicies;
Onyx.connect({
    key: ONYXKEYS.COLLECTION.POLICY,
    waitForCollectionCallback: true,
    callback: (val) => (allPolicies = val),
});

function getChatType(report) {
    return report ? report.chatType : '';
}

/**
 * Returns the concatenated title for the PrimaryLogins of a report
 *
 * @param {Array} logins
 * @returns {string}
 */
function getReportParticipantsTitle(logins) {
    return (
        _.chain(logins)

            // Somehow it's possible for the logins coming from report.participants to contain undefined values so we use compact to remove them.
            .compact()
            .map((login) => Str.removeSMSDomain(login))
            .value()
            .join(', ')
    );
}

/**
 * Checks if a report is a chat report.
 *
 * @param {Object} report
 * @returns {Boolean}
 */
function isChatReport(report) {
    return lodashGet(report, 'type') === CONST.REPORT.TYPE.CHAT;
}

/**
 * Checks if a report is an Expense report.
 *
 * @param {Object} report
 * @returns {Boolean}
 */
function isExpenseReport(report) {
    return lodashGet(report, 'type') === CONST.REPORT.TYPE.EXPENSE;
}

/**
 * Checks if a report is an IOU report.
 *
 * @param {Object} report
 * @returns {Boolean}
 */
function isIOUReport(report) {
    return lodashGet(report, 'type') === CONST.REPORT.TYPE.IOU;
}

/**
 * Checks if a report is a task report.
 *
 * @param {Object} report
 * @returns {Boolean}
 */
function isTaskReport(report) {
    return lodashGet(report, 'type') === CONST.REPORT.TYPE.TASK;
}

/**
 * Checks if a report is an IOU or expense report.
 *
 * @param {Object} report
 * @returns {Boolean}
 */
function isMoneyRequestReport(report) {
    return isIOUReport(report) || isExpenseReport(report);
}

/**
 * Given a collection of reports returns them sorted by last read
 *
 * @param {Object} reports
 * @returns {Array}
 */
function sortReportsByLastRead(reports) {
    return _.chain(reports)
        .toArray()
        .filter((report) => report && report.reportID && !isIOUReport(report))
        .sortBy('lastReadTime')
        .value();
}

/**
 * Can only edit if:
 *
 * - It was written by the current user
 * - It's an ADDCOMMENT that is not an attachment
 * - It's not pending deletion
 *
 * @param {Object} reportAction
 * @returns {Boolean}
 */
function canEditReportAction(reportAction) {
    return (
        reportAction.actorEmail === sessionEmail &&
        reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT &&
        !isReportMessageAttachment(lodashGet(reportAction, ['message', 0], {})) &&
        !ReportActionsUtils.isDeletedAction(reportAction) &&
        !ReportActionsUtils.isCreatedTaskReportAction(reportAction) &&
        reportAction.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE
    );
}

/**
 * Whether the Money Request report is settled
 *
 * @param {String} reportID
 * @returns {Boolean}
 */
function isSettled(reportID) {
    return !lodashGet(allReports, [`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, 'hasOutstandingIOU']);
}

/**
 * Can only delete if the author is this user and the action is an ADDCOMMENT action or an IOU action in an unsettled report, or if the user is a
 * policy admin
 *
 * @param {Object} reportAction
 * @param {String} reportID
 * @returns {Boolean}
 */
function canDeleteReportAction(reportAction, reportID) {
    if (
        reportAction.actionName !== CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT ||
        reportAction.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE ||
        ReportActionsUtils.isCreatedTaskReportAction(reportAction) ||
        (ReportActionsUtils.isMoneyRequestAction(reportAction) && isSettled(reportAction.originalMessage.IOUReportID))
    ) {
        return false;
    }
    if (reportAction.actorEmail === sessionEmail) {
        return true;
    }
    const report = lodashGet(allReports, `${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {});
    const policy = lodashGet(allPolicies, `${ONYXKEYS.COLLECTION.POLICY}${report.policyID}`, {});
    return policy.role === CONST.POLICY.ROLE.ADMIN;
}

/**
 * Whether the provided report is an Admin room
 * @param {Object} report
 * @param {String} report.chatType
 * @returns {Boolean}
 */
function isAdminRoom(report) {
    return getChatType(report) === CONST.REPORT.CHAT_TYPE.POLICY_ADMINS;
}

/**
 * Whether the provided report is a Announce room
 * @param {Object} report
 * @param {String} report.chatType
 * @returns {Boolean}
 */
function isAnnounceRoom(report) {
    return getChatType(report) === CONST.REPORT.CHAT_TYPE.POLICY_ANNOUNCE;
}

/**
 * Whether the provided report is a default room
 * @param {Object} report
 * @param {String} report.chatType
 * @returns {Boolean}
 */
function isDefaultRoom(report) {
    return [CONST.REPORT.CHAT_TYPE.POLICY_ADMINS, CONST.REPORT.CHAT_TYPE.POLICY_ANNOUNCE, CONST.REPORT.CHAT_TYPE.DOMAIN_ALL].indexOf(getChatType(report)) > -1;
}

/**
 * Whether the provided report is a Domain room
 * @param {Object} report
 * @param {String} report.chatType
 * @returns {Boolean}
 */
function isDomainRoom(report) {
    return getChatType(report) === CONST.REPORT.CHAT_TYPE.DOMAIN_ALL;
}

/**
 * Whether the provided report is a user created policy room
 * @param {Object} report
 * @param {String} report.chatType
 * @returns {Boolean}
 */
function isUserCreatedPolicyRoom(report) {
    return getChatType(report) === CONST.REPORT.CHAT_TYPE.POLICY_ROOM;
}

/**
 * Whether the provided report is a Policy Expense chat.
 * @param {Object} report
 * @param {String} report.chatType
 * @returns {Boolean}
 */
function isPolicyExpenseChat(report) {
    return getChatType(report) === CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT;
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
 * Whether the provided report is a public room
 * @param {Object} report
 * @param {String} report.visibility
 * @returns {Boolean}
 */
function isPublicRoom(report) {
    const visibility = lodashGet(report, 'visibility', '');
    return visibility === CONST.REPORT.VISIBILITY.PUBLIC || visibility === CONST.REPORT.VISIBILITY.PUBLIC_ANNOUNCE;
}

/**
 * Whether the provided report is a public announce room
 * @param {Object} report
 * @param {String} report.visibility
 * @returns {Boolean}
 */
function isPublicAnnounceRoom(report) {
    const visibility = lodashGet(report, 'visibility', '');
    return visibility === CONST.REPORT.VISIBILITY.PUBLIC_ANNOUNCE;
}

/**
 * Get the policy type from a given report
 * @param {Object} report
 * @param {String} report.policyID
 * @param {Object} policies must have Onyxkey prefix (i.e 'policy_') for keys
 * @returns {String}
 */
function getPolicyType(report, policies) {
    return lodashGet(policies, [`${ONYXKEYS.COLLECTION.POLICY}${report.policyID}`, 'type'], '');
}

/**
 * If the report is a policy expense, the route should be for adding bank account for that policy
 * else since the report is a personal IOU, the route should be for personal bank account.
 * @param {Object} report
 * @returns {String}
 */
function getBankAccountRoute(report) {
    return isPolicyExpenseChat(report) ? ROUTES.getBankAccountRoute('', report.policyID) : ROUTES.SETTINGS_ADD_BANK_ACCOUNT;
}

/**
 * Returns true if there are any guides accounts (team.expensify.com) in emails
 * @param {Array} emails
 * @returns {Boolean}
 */
function hasExpensifyGuidesEmails(emails) {
    return _.some(emails, (email) => Str.extractEmailDomain(email) === CONST.EMAIL.GUIDES_DOMAIN);
}

/**
 * Only returns true if this is our main 1:1 DM report with Concierge
 *
 * @param {Object} report
 * @returns {Boolean}
 */
function isConciergeChatReport(report) {
    return lodashGet(report, 'participants', []).length === 1 && report.participants[0] === CONST.EMAIL.CONCIERGE;
}

/**
 * @param {Record<String, {lastReadTime, reportID}>|Array<{lastReadTime, reportID}>} reports
 * @param {Boolean} [ignoreDomainRooms]
 * @param {Object} policies
 * @param {Boolean} isFirstTimeNewExpensifyUser
 * @param {Boolean} openOnAdminRoom
 * @returns {Object}
 */
function findLastAccessedReport(reports, ignoreDomainRooms, policies, isFirstTimeNewExpensifyUser, openOnAdminRoom = false) {
    // If it's the user's first time using New Expensify, then they could either have:
    //   - just a Concierge report, if so we'll return that
    //   - their Concierge report, and a separate report that must have deeplinked them to the app before they created their account.
    // If it's the latter, we'll use the deeplinked report over the Concierge report,
    // since the Concierge report would be incorrectly selected over the deep-linked report in the logic below.
    let sortedReports = sortReportsByLastRead(reports);

    if (isFirstTimeNewExpensifyUser) {
        if (sortedReports.length === 1) {
            return sortedReports[0];
        }
        return _.find(sortedReports, (report) => !isConciergeChatReport(report));
    }

    if (ignoreDomainRooms) {
        // We allow public announce rooms, admins, and announce rooms through since we bypass the default rooms beta for them.
        // Check where ReportUtils.findLastAccessedReport is called in MainDrawerNavigator.js for more context.
        // Domain rooms are now the only type of default room that are on the defaultRooms beta.
        sortedReports = _.filter(
            sortedReports,
            (report) => !isDomainRoom(report) || getPolicyType(report, policies) === CONST.POLICY.TYPE.FREE || hasExpensifyGuidesEmails(lodashGet(report, ['participants'], [])),
        );
    }

    let adminReport;
    if (openOnAdminRoom) {
        adminReport = _.find(sortedReports, (report) => {
            const chatType = getChatType(report);
            return chatType === CONST.REPORT.CHAT_TYPE.POLICY_ADMINS;
        });
    }

    return adminReport || _.last(sortedReports);
}

/**
 * Whether the provided report is an archived room
 * @param {Object} report
 * @param {Number} report.stateNum
 * @param {Number} report.statusNum
 * @returns {Boolean}
 */
function isArchivedRoom(report) {
    return lodashGet(report, ['statusNum']) === CONST.REPORT.STATUS.CLOSED && lodashGet(report, ['stateNum']) === CONST.REPORT.STATE_NUM.SUBMITTED;
}

/**
 * Get the policy name from a given report
 * @param {Object} report
 * @param {String} report.policyID
 * @param {String} report.oldPolicyName
 * @param {String} report.policyName
 * @returns {String}
 */
function getPolicyName(report) {
    // Public rooms send back the policy name with the reportSummary,
    // since they can also be accessed by people who aren't in the workspace
    if (report.policyName) {
        return report.policyName;
    }

    if (!allPolicies || _.size(allPolicies) === 0) {
        return Localize.translateLocal('workspace.common.unavailable');
    }

    const policy = allPolicies[`${ONYXKEYS.COLLECTION.POLICY}${report.policyID}`];
    if (!policy) {
        return report.oldPolicyName || Localize.translateLocal('workspace.common.unavailable');
    }

    return policy.name || report.oldPolicyName || Localize.translateLocal('workspace.common.unavailable');
}

/**
 * Checks if the current user is allowed to comment on the given report.
 * @param {Object} report
 * @param {String} [report.writeCapability]
 * @returns {Boolean}
 */
function isAllowedToComment(report) {
    // Default to allowing all users to post
    const capability = lodashGet(report, 'writeCapability', CONST.REPORT.WRITE_CAPABILITIES.ALL) || CONST.REPORT.WRITE_CAPABILITIES.ALL;

    if (capability === CONST.REPORT.WRITE_CAPABILITIES.ALL) {
        return true;
    }

    // If unauthenticated user opens public chat room using deeplink, they do not have policies available and they cannot comment
    if (!allPolicies) {
        return false;
    }

    // If we've made it here, commenting on this report is restricted.
    // If the user is an admin, allow them to post.
    const policy = allPolicies[`${ONYXKEYS.COLLECTION.POLICY}${report.policyID}`];
    return lodashGet(policy, 'role', '') === CONST.POLICY.ROLE.ADMIN;
}

/**
 * Checks if the current user is the admin of the policy given the policy expense chat.
 * @param {Object} report
 * @param {String} report.policyID
 * @param {Object} policies must have OnyxKey prefix (i.e 'policy_') for keys
 * @returns {Boolean}
 */
function isPolicyExpenseChatAdmin(report, policies) {
    if (!isPolicyExpenseChat(report)) {
        return false;
    }

    const policyRole = lodashGet(policies, [`${ONYXKEYS.COLLECTION.POLICY}${report.policyID}`, 'role']);

    return policyRole === CONST.POLICY.ROLE.ADMIN;
}

/**
 * Returns true if report has a parent and is therefore a Thread.
 *
 * @param {Object} report
 * @returns {Boolean}
 */
function isThread(report) {
    return Boolean(report && report.parentReportID && report.parentReportActionID && report.type === CONST.REPORT.TYPE.CHAT);
}

/**
 * Returns true if reportAction has a child.
 *
 * @param {Object} reportAction
 * @returns {Boolean}
 */
function isThreadParent(reportAction) {
    return reportAction && reportAction.childReportID && reportAction.childReportID !== 0;
}

/**
 * Returns true if reportAction is the first chat preview of a Thread
 *
 * @param {Object} reportAction
 *  @param {String} reportID
 * @returns {Boolean}
 */
function isThreadFirstChat(reportAction, reportID) {
    return !_.isUndefined(reportAction.childReportID) && reportAction.childReportID.toString() === reportID;
}

/**
 * Get either the policyName or domainName the chat is tied to
 * @param {Object} report
 * @returns {String}
 */
function getChatRoomSubtitle(report) {
    if (isThread(report)) {
        if (!getChatType(report)) {
            return '';
        }

        const parentReport = lodashGet(allReports, [`${ONYXKEYS.COLLECTION.REPORT}${report.parentReportID}`]);

        // If thread is not from a DM or group chat, the subtitle will follow the pattern 'Workspace Name • #roomName'
        const workspaceName = getPolicyName(report);
        let roomName = '';
        if (isChatRoom(report)) {
            if (parentReport) {
                roomName = lodashGet(parentReport, 'displayName', '');
            } else {
                roomName = lodashGet(report, 'displayName', '');
            }
        }

        return [workspaceName, roomName].join(' • ');
    }
    if (!isDefaultRoom(report) && !isUserCreatedPolicyRoom(report) && !isPolicyExpenseChat(report)) {
        return '';
    }
    if (getChatType(report) === CONST.REPORT.CHAT_TYPE.DOMAIN_ALL) {
        // The domainAll rooms are just #domainName, so we ignore the prefix '#' to get the domainName
        return report.reportName.substring(1);
    }
    if ((isPolicyExpenseChat(report) && report.isOwnPolicyExpenseChat) || isExpenseReport(report)) {
        return Localize.translateLocal('workspace.common.workspace');
    }
    if (isArchivedRoom(report)) {
        return report.oldPolicyName || '';
    }
    return getPolicyName(report);
}

/**
 * Get welcome message based on room type
 * @param {Object} report
 * @returns {Object}
 */

function getRoomWelcomeMessage(report) {
    const welcomeMessage = {};
    const workspaceName = getPolicyName(report);

    if (isArchivedRoom(report)) {
        welcomeMessage.phrase1 = Localize.translateLocal('reportActionsView.beginningOfArchivedRoomPartOne');
        welcomeMessage.phrase2 = Localize.translateLocal('reportActionsView.beginningOfArchivedRoomPartTwo');
    } else if (isDomainRoom(report)) {
        welcomeMessage.phrase1 = Localize.translateLocal('reportActionsView.beginningOfChatHistoryDomainRoomPartOne', {domainRoom: report.reportName});
        welcomeMessage.phrase2 = Localize.translateLocal('reportActionsView.beginningOfChatHistoryDomainRoomPartTwo');
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
 * Returns true if Concierge is one of the chat participants (1:1 as well as group chats)
 * @param {Object} report
 * @returns {Boolean}
 */
function chatIncludesConcierge(report) {
    return report.participants && _.contains(report.participants, CONST.EMAIL.CONCIERGE);
}

/**
 * Returns true if there is any automated expensify account in emails
 * @param {Array} emails
 * @returns {Boolean}
 */
function hasAutomatedExpensifyEmails(emails) {
    return _.intersection(emails, CONST.EXPENSIFY_EMAILS).length > 0;
}

/**
 * Returns true if there are any Expensify accounts (i.e. with domain 'expensify.com') in the set of emails.
 *
 * @param {Array<String>} emails
 * @return {Boolean}
 */
function hasExpensifyEmails(emails) {
    return _.some(emails, (email) => Str.extractEmailDomain(email) === CONST.EXPENSIFY_PARTNER_NAME);
}

/**
 * Whether the time row should be shown for a report.
 * @param {Array<Object>} personalDetails
 * @param {Object} report
 * @return {Boolean}
 */
function canShowReportRecipientLocalTime(personalDetails, report) {
    const reportParticipants = _.without(lodashGet(report, 'participants', []), sessionEmail);
    const participantsWithoutExpensifyEmails = _.difference(reportParticipants, CONST.EXPENSIFY_EMAILS);
    const hasMultipleParticipants = participantsWithoutExpensifyEmails.length > 1;
    const reportRecipient = personalDetails[participantsWithoutExpensifyEmails[0]];
    const reportRecipientTimezone = lodashGet(reportRecipient, 'timezone', CONST.DEFAULT_TIME_ZONE);
    const isReportParticipantValidated = lodashGet(reportRecipient, 'validated', false);
    return Boolean(
        !hasMultipleParticipants &&
            !isChatRoom(report) &&
            !isPolicyExpenseChat(report) &&
            reportRecipient &&
            reportRecipientTimezone &&
            reportRecipientTimezone.selected &&
            isReportParticipantValidated,
    );
}

/**
 * Html decode, shorten last message text to fixed length and trim spaces.
 * @param {String} lastMessageText
 * @returns {String}
 */
function formatReportLastMessageText(lastMessageText) {
    return Str.htmlDecode(String(lastMessageText)).replace(CONST.REGEX.AFTER_FIRST_LINE_BREAK, '').substring(0, CONST.REPORT.LAST_MESSAGE_TEXT_MAX_LENGTH).trim();
}

/**
 * Helper method to return the default avatar associated with the given login
 * @param {String} [workspaceName]
 * @returns {String}
 */
function getDefaultWorkspaceAvatar(workspaceName) {
    if (!workspaceName) {
        return defaultWorkspaceAvatars.WorkspaceBuilding;
    }

    // Remove all chars not A-Z or 0-9 including underscore
    const alphaNumeric = workspaceName
        .normalize('NFD')
        .replace(/[^0-9a-z]/gi, '')
        .toUpperCase();

    return !alphaNumeric ? defaultWorkspaceAvatars.WorkspaceBuilding : defaultWorkspaceAvatars[`Workspace${alphaNumeric[0]}`];
}

function getWorkspaceAvatar(report) {
    const workspaceName = getPolicyName(report, allPolicies);
    return lodashGet(allPolicies, [`${ONYXKEYS.COLLECTION.POLICY}${report.policyID}`, 'avatar']) || getDefaultWorkspaceAvatar(workspaceName);
}

/**
 * Returns the appropriate icons for the given chat report using the stored personalDetails.
 * The Avatar sources can be URLs or Icon components according to the chat type.
 *
 * @param {Array} participants
 * @param {Object} personalDetails
 * @returns {Array<*>}
 */
function getIconsForParticipants(participants, personalDetails) {
    const participantDetails = [];
    const participantsList = participants || [];

    for (let i = 0; i < participantsList.length; i++) {
        const login = participantsList[i];
        const avatarSource = UserUtils.getAvatar(lodashGet(personalDetails, [login, 'avatar'], ''), login);
        participantDetails.push([login, lodashGet(personalDetails, [login, 'firstName'], ''), avatarSource]);
    }

    // Sort all logins by first name (which is the second element in the array)
    const sortedParticipantDetails = participantDetails.sort((a, b) => a[1] - b[1]);

    // Now that things are sorted, gather only the avatars (third element in the array) and return those
    const avatars = [];
    for (let i = 0; i < sortedParticipantDetails.length; i++) {
        const userIcon = {
            source: sortedParticipantDetails[i][2],
            type: CONST.ICON_TYPE_AVATAR,
            name: sortedParticipantDetails[i][0],
        };
        avatars.push(userIcon);
    }

    return avatars;
}

/**
 * Returns the appropriate icons for the given chat report using the stored personalDetails.
 * The Avatar sources can be URLs or Icon components according to the chat type.
 *
 * @param {Object} report
 * @param {Object} personalDetails
 * @param {*} [defaultIcon]
 * @param {Boolean} [isPayer]
 * @returns {Array<*>}
 */
function getIcons(report, personalDetails, defaultIcon = null, isPayer = false) {
    const result = {
        source: '',
        type: CONST.ICON_TYPE_AVATAR,
        name: '',
    };

    if (_.isEmpty(report)) {
        result.source = defaultIcon || Expensicons.FallbackAvatar;
        return [result];
    }
    if (isConciergeChatReport(report)) {
        result.source = CONST.CONCIERGE_ICON_URL;
        return [result];
    }
    if (isArchivedRoom(report)) {
        result.source = Expensicons.DeletedRoomAvatar;
        return [result];
    }
    if (isThread(report)) {
        const parentReportAction = ReportActionsUtils.getParentReportAction(report);

        const actorEmail = lodashGet(parentReportAction, 'actorEmail', '');
        const actorIcon = {
            source: UserUtils.getAvatar(lodashGet(personalDetails, [actorEmail, 'avatar']), actorEmail),
            name: actorEmail,
            type: CONST.ICON_TYPE_AVATAR,
        };

        return [actorIcon];
    }
    if (isDomainRoom(report)) {
        result.source = Expensicons.DomainRoomAvatar;
        return [result];
    }
    if (isAdminRoom(report)) {
        result.source = Expensicons.AdminRoomAvatar;
        return [result];
    }
    if (isAnnounceRoom(report)) {
        result.source = Expensicons.AnnounceRoomAvatar;
        return [result];
    }
    if (isChatRoom(report)) {
        result.source = Expensicons.ActiveRoomAvatar;
        return [result];
    }
    if (isPolicyExpenseChat(report) || isExpenseReport(report)) {
        const workspaceName = lodashGet(allPolicies, [`${ONYXKEYS.COLLECTION.POLICY}${report.policyID}`, 'name']);

        const policyExpenseChatAvatarSource = lodashGet(allPolicies, [`${ONYXKEYS.COLLECTION.POLICY}${report.policyID}`, 'avatar']) || getDefaultWorkspaceAvatar(workspaceName);

        // Return the workspace avatar if the user is the owner of the policy expense chat
        if (report.isOwnPolicyExpenseChat && !isExpenseReport(report)) {
            result.source = policyExpenseChatAvatarSource;
            result.type = CONST.ICON_TYPE_WORKSPACE;
            result.name = workspaceName;
            return [result];
        }

        const adminIcon = {
            source: UserUtils.getAvatar(lodashGet(personalDetails, [report.ownerEmail, 'avatar']), report.ownerEmail),
            name: report.ownerEmail,
            type: CONST.ICON_TYPE_AVATAR,
        };

        const workspaceIcon = {
            source: policyExpenseChatAvatarSource,
            type: CONST.ICON_TYPE_WORKSPACE,
            name: workspaceName,
        };

        // If the user is an admin, return avatar source of the other participant of the report
        // (their workspace chat) and the avatar source of the workspace
        return [adminIcon, workspaceIcon];
    }
    if (isIOUReport(report)) {
        const email = isPayer ? report.managerEmail : report.ownerEmail;
        return [
            {
                source: UserUtils.getAvatar(lodashGet(personalDetails, [email, 'avatar']), email),
                name: email,
                type: CONST.ICON_TYPE_AVATAR,
            },
        ];
    }

    return getIconsForParticipants(report.participants, personalDetails);
}

/**
 * Gets the personal details for a login by looking in the ONYXKEYS.PERSONAL_DETAILS Onyx key (stored in the local variable, allPersonalDetails). If it doesn't exist in Onyx,
 * then a default object is constructed.
 * @param {String} login
 * @returns {Object}
 */
function getPersonalDetailsForLogin(login) {
    if (!login) {
        return {};
    }
    return (
        (allPersonalDetails && allPersonalDetails[login]) || {
            login,
            displayName: LocalePhoneNumber.formatPhoneNumber(login),
            avatar: UserUtils.getDefaultAvatar(login),
        }
    );
}

/**
 * Get the displayName for a single report participant.
 *
 * @param {String} login
 * @param {Boolean} [shouldUseShortForm]
 * @returns {String}
 */
function getDisplayNameForParticipant(login, shouldUseShortForm = false) {
    if (!login) {
        return '';
    }
    const personalDetails = getPersonalDetailsForLogin(login);

    const longName = personalDetails.displayName;

    const shortName = personalDetails.firstName || longName;

    return shouldUseShortForm ? shortName : longName;
}

/**
 * @param {Object} participants
 * @param {Boolean} isMultipleParticipantReport
 * @returns {Array}
 */
function getDisplayNamesWithTooltips(participants, isMultipleParticipantReport) {
    return _.map(participants, (participant) => {
        const displayName = getDisplayNameForParticipant(participant.login, isMultipleParticipantReport);
        const tooltip = participant.login ? Str.removeSMSDomain(participant.login) : '';

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
 * We get the amount, currency and comment money request value from the action.originalMessage.
 * But for the send money action, the above value is put in the IOUDetails object.
 *
 * @param {Object} reportAction
 * @param {Number} reportAction.amount
 * @param {String} reportAction.currency
 * @param {String} reportAction.comment
 * @param {Object} [reportAction.IOUDetails]
 * @returns {Object}
 */
function getMoneyRequestAction(reportAction = {}) {
    const originalMessage = lodashGet(reportAction, 'originalMessage', {});
    let amount = originalMessage.amount || 0;
    let currency = originalMessage.currency || CONST.CURRENCY.USD;
    let comment = originalMessage.comment || '';

    if (_.has(originalMessage, 'IOUDetails')) {
        amount = lodashGet(originalMessage, 'IOUDetails.amount', 0);
        currency = lodashGet(originalMessage, 'IOUDetails.currency', CONST.CURRENCY.USD);
        comment = lodashGet(originalMessage, 'IOUDetails.comment', '');
    }

    return {amount, currency, comment};
}

/**
 * @param {Object} report
 * @param {String} report.iouReportID
 * @param {Object} moneyRequestReports
 * @returns {Number}
 */
function getMoneyRequestTotal(report, moneyRequestReports = {}) {
    if (report.hasOutstandingIOU || isMoneyRequestReport(report)) {
        const moneyRequestReport = moneyRequestReports[`${ONYXKEYS.COLLECTION.REPORT}${report.iouReportID}`] || report;
        const total = lodashGet(moneyRequestReport, 'total', 0);

        if (total !== 0) {
            // There is a possibility that if the Expense report has a negative total.
            // This is because there are instances where you can get a credit back on your card,
            // or you enter a negative expense to “offset” future expenses
            return isExpenseReport(moneyRequestReport) ? total * -1 : Math.abs(total);
        }
    }
    return 0;
}

/**
 * Get the title for a policy expense chat which depends on the role of the policy member seeing this report
 *
 * @param {Object} report
 * @returns {String}
 */
function getPolicyExpenseChatName(report) {
    const reportOwnerDisplayName = getDisplayNameForParticipant(report.ownerEmail) || report.ownerEmail || report.reportName;

    // If the policy expense chat is owned by this user, use the name of the policy as the report name.
    if (report.isOwnPolicyExpenseChat) {
        return getPolicyName(report);
    }

    const policyExpenseChatRole = lodashGet(allPolicies, [`${ONYXKEYS.COLLECTION.POLICY}${report.policyID}`, 'role']) || 'user';

    // If this user is not admin and this policy expense chat has been archived because of account merging, this must be an old workspace chat
    // of the account which was merged into the current user's account. Use the name of the policy as the name of the report.
    if (isArchivedRoom(report)) {
        const lastAction = ReportActionsUtils.getLastVisibleAction(report.reportID);
        const archiveReason = (lastAction && lastAction.originalMessage && lastAction.originalMessage.reason) || CONST.REPORT.ARCHIVE_REASON.DEFAULT;
        if (archiveReason === CONST.REPORT.ARCHIVE_REASON.ACCOUNT_MERGED && policyExpenseChatRole !== CONST.POLICY.ROLE.ADMIN) {
            return getPolicyName(report);
        }
    }

    // If user can see this report and they are not its owner, they must be an admin and the report name should be the name of the policy member
    return reportOwnerDisplayName;
}

/**
 * Get the title for a IOU or expense chat which will be showing the payer and the amount
 *
 * @param {Object} report
 * @returns  {String}
 */
function getMoneyRequestReportName(report) {
    const formattedAmount = CurrencyUtils.convertToDisplayString(getMoneyRequestTotal(report), report.currency);
    const payerName = isExpenseReport(report) ? getPolicyName(report) : getDisplayNameForParticipant(report.managerEmail);

    return Localize.translateLocal('iou.payerOwesAmount', {payer: payerName, amount: formattedAmount});
}

/**
 * Given a parent IOU report action get report name for the LHN.
 *
 * @param {Object} reportAction
 * @returns {String}
 */
function getTransactionReportName(reportAction) {
    return Localize.translateLocal(ReportActionsUtils.isSentMoneyReportAction(reportAction) ? 'iou.threadSentMoneyReportName' : 'iou.threadRequestReportName', {
        formattedAmount: ReportActionsUtils.getFormattedAmount(reportAction),
        comment: lodashGet(reportAction, 'originalMessage.comment'),
    });
}

/**
 * Get the title for a report.
 *
 * @param {Object} report
 * @returns {String}
 */
function getReportName(report) {
    let formattedName;
    if (isThread(report)) {
        const parentReportAction = ReportActionsUtils.getParentReportAction(report);
        if (ReportActionsUtils.isTransactionThread(parentReportAction)) {
            return getTransactionReportName(parentReportAction);
        }

        const isAttachment = _.has(parentReportAction, 'isAttachment') ? parentReportAction.isAttachment : isReportMessageAttachment(_.last(lodashGet(parentReportAction, 'message', [{}])));
        if (isAttachment) {
            return `[${Localize.translateLocal('common.attachment')}]`;
        }
        const parentReportActionMessage = lodashGet(parentReportAction, ['message', 0, 'text'], '').replace(/(\r\n|\n|\r)/gm, ' ');
        return parentReportActionMessage || Localize.translateLocal('parentReportAction.deletedMessage');
    }
    if (isChatRoom(report) || isTaskReport(report)) {
        formattedName = report.reportName;
    }

    if (isPolicyExpenseChat(report)) {
        formattedName = getPolicyExpenseChatName(report);
    }

    if (isMoneyRequestReport(report)) {
        formattedName = getMoneyRequestReportName(report);
    }

    if (isArchivedRoom(report)) {
        formattedName += ` (${Localize.translateLocal('common.archived')})`;
    }

    if (formattedName) {
        return formattedName;
    }

    // Not a room or PolicyExpenseChat, generate title from participants
    const participants = (report && report.participants) || [];
    const participantsWithoutCurrentUser = _.without(participants, sessionEmail);
    const isMultipleParticipantReport = participantsWithoutCurrentUser.length > 1;

    return _.map(participantsWithoutCurrentUser, (login) => getDisplayNameForParticipant(login, isMultipleParticipantReport)).join(', ');
}

/**
 * Navigate to the details page of a given report
 *
 * @param {Object} report
 */
function navigateToDetailsPage(report) {
    const participants = lodashGet(report, 'participants', []);

    if (isChatRoom(report) || isPolicyExpenseChat(report) || isThread(report)) {
        Navigation.navigate(ROUTES.getReportDetailsRoute(report.reportID));
        return;
    }
    if (participants.length === 1) {
        Navigation.navigate(ROUTES.getDetailsRoute(participants[0]));
        return;
    }
    Navigation.navigate(ROUTES.getReportParticipantsRoute(report.reportID));
}

/**
 * Generate a random reportID up to 53 bits aka 9,007,199,254,740,991 (Number.MAX_SAFE_INTEGER).
 * There were approximately 98,000,000 reports with sequential IDs generated before we started using this approach, those make up roughly one billionth of the space for these numbers,
 * so we live with the 1 in a billion chance of a collision with an older ID until we can switch to 64-bit IDs.
 *
 * In a test of 500M reports (28 years of reports at our current max rate) we got 20-40 collisions meaning that
 * this is more than random enough for our needs.
 *
 * @returns {String}
 */
function generateReportID() {
    return (Math.floor(Math.random() * 2 ** 21) * 2 ** 32 + Math.floor(Math.random() * 2 ** 32)).toString();
}

/**
 * @param {Object} report
 * @returns {Boolean}
 */
function hasReportNameError(report) {
    return !_.isEmpty(lodashGet(report, 'errorFields.reportName', {}));
}

/**
 * For comments shorter than 10k chars, convert the comment from MD into HTML because that's how it is stored in the database
 * For longer comments, skip parsing, but still escape the text, and display plaintext for performance reasons. It takes over 40s to parse a 100k long string!!
 *
 * @param {String} text
 * @returns {String}
 */
function getParsedComment(text) {
    const parser = new ExpensiMark();
    return text.length < CONST.MAX_MARKUP_LENGTH ? parser.replace(text) : _.escape(text);
}

/**
 * @param {String} [text]
 * @param {File} [file]
 * @returns {Object}
 */
function buildOptimisticAddCommentReportAction(text, file) {
    const parser = new ExpensiMark();
    const commentText = getParsedComment(text);
    const isAttachment = _.isEmpty(text) && file !== undefined;
    const attachmentInfo = isAttachment ? file : {};
    const htmlForNewComment = isAttachment ? 'Uploading attachment...' : commentText;

    // Remove HTML from text when applying optimistic offline comment
    const textForNewComment = isAttachment ? CONST.ATTACHMENT_MESSAGE_TEXT : parser.htmlToText(htmlForNewComment);

    return {
        commentText,
        reportAction: {
            reportActionID: NumberUtils.rand64(),
            actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
            actorEmail: currentUserEmail,
            actorAccountID: currentUserAccountID,
            person: [
                {
                    style: 'strong',
                    text: lodashGet(allPersonalDetails, [currentUserEmail, 'displayName'], currentUserEmail),
                    type: 'TEXT',
                },
            ],
            automatic: false,
            avatar: lodashGet(allPersonalDetails, [currentUserEmail, 'avatar'], UserUtils.getDefaultAvatar(currentUserEmail)),
            created: DateUtils.getDBTime(),
            message: [
                {
                    type: CONST.REPORT.MESSAGE.TYPE.COMMENT,
                    html: htmlForNewComment,
                    text: textForNewComment,
                },
            ],
            isFirstItem: false,
            isAttachment,
            attachmentInfo,
            pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            shouldShow: true,
        },
    };
}

/**
 * Builds an optimistic reportAction for the parent report when a task is created
 * @param {String} taskReportID - Report ID of the task
 * @param {String} taskTitle - Title of the task
 * @param {String} taskAssignee - Email of the person assigned to the task
 * @param {String} text - Text of the comment
 * @param {String} parentReportID - Report ID of the parent report
 * @returns {Object}
 */
function buildOptimisticTaskCommentReportAction(taskReportID, taskTitle, taskAssignee, text, parentReportID) {
    const reportAction = buildOptimisticAddCommentReportAction(text);
    reportAction.reportAction.message[0].taskReportID = taskReportID;

    // These parameters are not saved on the reportAction, but are used to display the task in the UI
    // Added when we fetch the reportActions on a report
    reportAction.reportAction.originalMessage = {
        html: reportAction.reportAction.message[0].html,
        taskReportID: reportAction.reportAction.message[0].taskReportID,
    };
    reportAction.reportAction.childReportID = taskReportID;
    reportAction.reportAction.parentReportID = parentReportID;
    reportAction.reportAction.childType = CONST.REPORT.TYPE.TASK;
    reportAction.reportAction.taskTitle = taskTitle;
    reportAction.reportAction.taskAssignee = taskAssignee;
    reportAction.reportAction.childStatusNum = CONST.REPORT.STATUS.OPEN;
    reportAction.reportAction.childStateNum = CONST.REPORT.STATE_NUM.OPEN;

    return reportAction;
}

/**
 * Builds an optimistic IOU report with a randomly generated reportID
 *
 * @param {String} payeeEmail - Email of the person generating the IOU.
 * @param {String} payerEmail - Email of the other person participating in the IOU.
 * @param {Number} total - IOU amount in the smallest unit of the currency.
 * @param {String} chatReportID - Report ID of the chat where the IOU is.
 * @param {String} currency - IOU currency.
 * @param {Boolean} isSendingMoney - If we send money the IOU should be created as settled
 *
 * @returns {Object}
 */
function buildOptimisticIOUReport(payeeEmail, payerEmail, total, chatReportID, currency, isSendingMoney = false) {
    const formattedTotal = CurrencyUtils.convertToDisplayString(total, currency);
    return {
        // If we're sending money, hasOutstandingIOU should be false
        hasOutstandingIOU: !isSendingMoney,
        type: CONST.REPORT.TYPE.IOU,
        cachedTotal: formattedTotal,
        chatReportID,
        currency,
        managerEmail: payerEmail,
        ownerEmail: payeeEmail,
        reportID: generateReportID(),
        state: CONST.REPORT.STATE.SUBMITTED,
        stateNum: isSendingMoney ? CONST.REPORT.STATE_NUM.SUBMITTED : CONST.REPORT.STATE_NUM.PROCESSING,
        total,

        // We don't translate reportName because the server response is always in English
        reportName: `${payerEmail} owes ${formattedTotal}`,
    };
}

/**
 * Builds an optimistic Expense report with a randomly generated reportID
 *
 * @param {String} chatReportID - Report ID of the PolicyExpenseChat where the Expense Report is
 * @param {String} policyID - The policy ID of the PolicyExpenseChat
 * @param {String} payeeEmail - Email of the employee (payee)
 * @param {Number} total - Amount in cents
 * @param {String} currency
 *
 * @returns {Object}
 */
function buildOptimisticExpenseReport(chatReportID, policyID, payeeEmail, total, currency) {
    // The amount for Expense reports are stored as negative value in the database
    const storedTotal = total * -1;
    const policyName = getPolicyName(allReports[`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`]);
    const formattedTotal = CurrencyUtils.convertToDisplayString(storedTotal, currency);

    // The expense report is always created with the policy's output currency
    const outputCurrency = lodashGet(allPolicies, [`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, 'outputCurrency'], CONST.CURRENCY.USD);

    return {
        reportID: generateReportID(),
        chatReportID,
        policyID,
        type: CONST.REPORT.TYPE.EXPENSE,
        ownerEmail: payeeEmail,
        hasOutstandingIOU: true,
        currency: outputCurrency,

        // We don't translate reportName because the server response is always in English
        reportName: `${policyName} owes ${formattedTotal}`,
        state: CONST.REPORT.STATE.SUBMITTED,
        stateNum: CONST.REPORT.STATE_NUM.PROCESSING,
        total: storedTotal,
    };
}

/**
 * @param {String} type - IOUReportAction type. Can be oneOf(create, decline, cancel, pay, split)
 * @param {Number} total - IOU total in cents
 * @param {String} comment - IOU comment
 * @param {String} currency - IOU currency
 * @param {String} paymentType - IOU paymentMethodType. Can be oneOf(Elsewhere, Expensify, PayPal.me)
 * @param {Boolean} isSettlingUp - Whether we are settling up an IOU
 * @returns {Array}
 */
function getIOUReportActionMessage(type, total, comment, currency, paymentType = '', isSettlingUp = false) {
    const amount = NumberFormatUtils.format(preferredLocale, total / 100, {style: 'currency', currency});
    let paymentMethodMessage;
    switch (paymentType) {
        case CONST.IOU.PAYMENT_TYPE.EXPENSIFY:
            paymentMethodMessage = '!';
            break;
        case CONST.IOU.PAYMENT_TYPE.ELSEWHERE:
            paymentMethodMessage = ' elsewhere';
            break;
        case CONST.IOU.PAYMENT_TYPE.PAYPAL_ME:
            paymentMethodMessage = ' using PayPal.me';
            break;
        default:
            break;
    }

    let iouMessage;
    switch (type) {
        case CONST.IOU.REPORT_ACTION_TYPE.CREATE:
            iouMessage = `requested ${amount}${comment && ` for ${comment}`}`;
            break;
        case CONST.IOU.REPORT_ACTION_TYPE.SPLIT:
            iouMessage = `split ${amount}${comment && ` for ${comment}`}`;
            break;
        case CONST.IOU.REPORT_ACTION_TYPE.DELETE:
            iouMessage = `deleted the ${amount} request${comment && ` for ${comment}`}`;
            break;
        case CONST.IOU.REPORT_ACTION_TYPE.PAY:
            iouMessage = isSettlingUp ? `settled up ${amount}${paymentMethodMessage}` : `sent ${amount}${comment && ` for ${comment}`}${paymentMethodMessage}`;
            break;
        default:
            break;
    }

    return [
        {
            html: getParsedComment(iouMessage),
            text: iouMessage,
            isEdited: false,
            type: CONST.REPORT.MESSAGE.TYPE.COMMENT,
        },
    ];
}

/**
 * Builds an optimistic IOU reportAction object
 *
 * @param {String} type - IOUReportAction type. Can be oneOf(create, delete, pay, split).
 * @param {Number} amount - IOU amount in cents.
 * @param {String} currency
 * @param {String} comment - User comment for the IOU.
 * @param {Array}  participants - An array with participants details.
 * @param {String} transactionID
 * @param {String} [paymentType] - Only required if the IOUReportAction type is 'pay'. Can be oneOf(elsewhere, payPal, Expensify).
 * @param {String} [iouReportID] - Only required if the IOUReportActions type is oneOf(decline, cancel, pay). Generates a randomID as default.
 * @param {Boolean} [isSettlingUp] - Whether we are settling up an IOU.
 * @param {Boolean} [isSendMoneyFlow] - Whether this is send money flow
 * @returns {Object}
 */
function buildOptimisticIOUReportAction(type, amount, currency, comment, participants, transactionID, paymentType = '', iouReportID = '', isSettlingUp = false, isSendMoneyFlow = false) {
    const IOUReportID = iouReportID || generateReportID();
    const parser = new ExpensiMark();
    const commentText = getParsedComment(comment);
    const textForNewComment = parser.htmlToText(commentText);
    const textForNewCommentDecoded = Str.htmlDecode(textForNewComment);
    const originalMessage = {
        amount,
        comment: textForNewComment,
        currency,
        IOUTransactionID: transactionID,
        IOUReportID,
        type,
    };

    // We store amount, comment, currency in IOUDetails when type = pay
    if (type === CONST.IOU.REPORT_ACTION_TYPE.PAY && isSendMoneyFlow) {
        _.each(['amount', 'comment', 'currency'], (key) => {
            delete originalMessage[key];
        });
        originalMessage.IOUDetails = {amount, comment, currency};
        originalMessage.paymentType = paymentType;
    }

    // IOUs of type split only exist in group DMs and those don't have an iouReport so we need to delete the IOUReportID key
    if (type === CONST.IOU.REPORT_ACTION_TYPE.SPLIT) {
        delete originalMessage.IOUReportID;
        originalMessage.participants = [currentUserEmail, ..._.pluck(participants, 'login')];
    }

    return {
        actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
        actorAccountID: currentUserAccountID,
        actorEmail: currentUserEmail,
        automatic: false,
        avatar: lodashGet(currentUserPersonalDetails, 'avatar', UserUtils.getDefaultAvatar(currentUserEmail)),
        isAttachment: false,
        originalMessage,
        message: getIOUReportActionMessage(type, amount, textForNewCommentDecoded, currency, paymentType, isSettlingUp),
        person: [
            {
                style: 'strong',
                text: lodashGet(currentUserPersonalDetails, 'displayName', currentUserEmail),
                type: 'TEXT',
            },
        ],
        reportActionID: NumberUtils.rand64(),
        shouldShow: true,
        created: DateUtils.getDBTime(),
        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
    };
}

function buildOptimisticReportPreview(reportID, iouReportID, payeeAccountID) {
    return {
        reportActionID: NumberUtils.rand64(),
        reportID,
        created: DateUtils.getDBTime(),
        actionName: CONST.REPORT.ACTIONS.TYPE.REPORTPREVIEW,
        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        accountID: payeeAccountID,
        message: [
            {
                html: '',
                text: '',
                isEdited: false,
                type: CONST.REPORT.MESSAGE.TYPE.COMMENT,
            },
        ],
        originalMessage: {
            linkedReportID: iouReportID,
        },
        actorEmail: currentUserEmail,
    };
}

function buildOptimisticTaskReportAction(taskReportID, actionName, message = '') {
    const originalMessage = {
        taskReportID,
        type: actionName,
        text: message,
    };

    return {
        actionName,
        actorAccountID: currentUserAccountID,
        actorEmail: currentUserEmail,
        automatic: false,
        avatar: lodashGet(currentUserPersonalDetails, 'avatar', UserUtils.getDefaultAvatar(currentUserEmail)),
        isAttachment: false,
        originalMessage,
        message: [
            {
                text: message,
                taskReportID,
                type: CONST.REPORT.MESSAGE.TYPE.TEXT,
            },
        ],
        person: [
            {
                style: 'strong',
                text: lodashGet(currentUserPersonalDetails, 'displayName', currentUserEmail),
                type: 'TEXT',
            },
        ],
        reportActionID: NumberUtils.rand64(),
        shouldShow: true,
        created: DateUtils.getDBTime(),
        isFirstItem: false,
        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
    };
}

/**
 * Builds an optimistic chat report with a randomly generated reportID and as much information as we currently have
 *
 * @param {Array} participantList
 * @param {String} reportName
 * @param {String} chatType
 * @param {String} policyID
 * @param {String} ownerEmail
 * @param {Boolean} isOwnPolicyExpenseChat
 * @param {String} oldPolicyName
 * @param {String} visibility
 * @param {String} notificationPreference
 * @param {String} parentReportActionID
 * @param {String} parentReportID
 * @returns {Object}
 */
function buildOptimisticChatReport(
    participantList,
    reportName = CONST.REPORT.DEFAULT_REPORT_NAME,
    chatType = '',
    policyID = CONST.POLICY.OWNER_EMAIL_FAKE,
    ownerEmail = CONST.REPORT.OWNER_EMAIL_FAKE,
    isOwnPolicyExpenseChat = false,
    oldPolicyName = '',
    visibility = undefined,
    notificationPreference = CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
    parentReportActionID = '',
    parentReportID = '',
) {
    const currentTime = DateUtils.getDBTime();
    return {
        type: CONST.REPORT.TYPE.CHAT,
        chatType,
        hasOutstandingIOU: false,
        isOwnPolicyExpenseChat,
        isPinned: reportName === CONST.REPORT.WORKSPACE_CHAT_ROOMS.ADMINS,
        lastActorEmail: '',
        lastMessageHtml: '',
        lastMessageText: null,
        lastReadTime: currentTime,
        lastVisibleActionCreated: currentTime,
        notificationPreference,
        oldPolicyName,
        ownerEmail: ownerEmail || CONST.REPORT.OWNER_EMAIL_FAKE,
        parentReportActionID,
        parentReportID,
        participants: participantList,
        policyID,
        reportID: generateReportID(),
        reportName,
        stateNum: 0,
        statusNum: 0,
        visibility,
        welcomeMessage: '',
    };
}

/**
 * Returns the necessary reportAction onyx data to indicate that the chat has been created optimistically
 * @param {String} ownerEmail
 * @returns {Object}
 */
function buildOptimisticCreatedReportAction(ownerEmail) {
    return {
        reportActionID: NumberUtils.rand64(),
        actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        actorAccountID: currentUserAccountID,
        actorEmail: currentUserEmail,
        message: [
            {
                type: CONST.REPORT.MESSAGE.TYPE.TEXT,
                style: 'strong',
                text: ownerEmail === currentUserEmail ? 'You' : ownerEmail,
            },
            {
                type: CONST.REPORT.MESSAGE.TYPE.TEXT,
                style: 'normal',
                text: ' created this report',
            },
        ],
        person: [
            {
                type: CONST.REPORT.MESSAGE.TYPE.TEXT,
                style: 'strong',
                text: lodashGet(allPersonalDetails, [currentUserEmail, 'displayName'], currentUserEmail),
            },
        ],
        automatic: false,
        avatar: lodashGet(allPersonalDetails, [currentUserEmail, 'avatar'], UserUtils.getDefaultAvatar(currentUserEmail)),
        created: DateUtils.getDBTime(),
        shouldShow: true,
    };
}

/**
 * Returns the necessary reportAction onyx data to indicate that a task report has been edited
 *
 * @param {String} ownerEmail
 * @returns {Object}
 */

function buildOptimisticEditedTaskReportAction(ownerEmail) {
    return {
        reportActionID: NumberUtils.rand64(),
        actionName: CONST.REPORT.ACTIONS.TYPE.TASKEDITED,
        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        actorAccountID: currentUserAccountID,
        actorEmail: currentUserEmail,
        message: [
            {
                type: CONST.REPORT.MESSAGE.TYPE.TEXT,
                style: 'strong',
                text: ownerEmail === currentUserEmail ? 'You' : ownerEmail,
            },
            {
                type: CONST.REPORT.MESSAGE.TYPE.TEXT,
                style: 'normal',
                text: ' edited this task',
            },
        ],
        person: [
            {
                type: CONST.REPORT.MESSAGE.TYPE.TEXT,
                style: 'strong',
                text: lodashGet(allPersonalDetails, [currentUserEmail, 'displayName'], currentUserEmail),
            },
        ],
        automatic: false,
        avatar: lodashGet(allPersonalDetails, [currentUserEmail, 'avatar'], UserUtils.getDefaultAvatar(currentUserEmail)),
        created: DateUtils.getDBTime(),
        shouldShow: false,
    };
}

/**
 * Returns the necessary reportAction onyx data to indicate that a chat has been archived
 *
 * @param {String} ownerEmail
 * @param {String} policyName
 * @param {String} reason - A reason why the chat has been archived
 * @returns {Object}
 */
function buildOptimisticClosedReportAction(ownerEmail, policyName, reason = CONST.REPORT.ARCHIVE_REASON.DEFAULT) {
    return {
        actionName: CONST.REPORT.ACTIONS.TYPE.CLOSED,
        actorAccountID: currentUserAccountID,
        automatic: false,
        avatar: lodashGet(allPersonalDetails, [currentUserEmail, 'avatar'], UserUtils.getDefaultAvatar(currentUserEmail)),
        created: DateUtils.getDBTime(),
        message: [
            {
                type: CONST.REPORT.MESSAGE.TYPE.TEXT,
                style: 'strong',
                text: ownerEmail === currentUserEmail ? 'You' : ownerEmail,
            },
            {
                type: CONST.REPORT.MESSAGE.TYPE.TEXT,
                style: 'normal',
                text: ' closed this report',
            },
        ],
        originalMessage: {
            policyName,
            reason,
        },
        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        person: [
            {
                type: CONST.REPORT.MESSAGE.TYPE.TEXT,
                style: 'strong',
                text: lodashGet(allPersonalDetails, [currentUserEmail, 'displayName'], currentUserEmail),
            },
        ],
        reportActionID: NumberUtils.rand64(),
        shouldShow: true,
    };
}

/**
 * @param {String} policyID
 * @param {String} policyName
 * @returns {Object}
 */
function buildOptimisticWorkspaceChats(policyID, policyName) {
    const announceChatData = buildOptimisticChatReport(
        [currentUserEmail],
        CONST.REPORT.WORKSPACE_CHAT_ROOMS.ANNOUNCE,
        CONST.REPORT.CHAT_TYPE.POLICY_ANNOUNCE,
        policyID,
        null,
        false,
        policyName,
        null,

        // #announce contains all policy members so notifying always should be opt-in only.
        CONST.REPORT.NOTIFICATION_PREFERENCE.DAILY,
    );
    const announceChatReportID = announceChatData.reportID;
    const announceCreatedAction = buildOptimisticCreatedReportAction(announceChatData.ownerEmail);
    const announceReportActionData = {
        [announceCreatedAction.reportActionID]: announceCreatedAction,
    };

    const adminsChatData = buildOptimisticChatReport([currentUserEmail], CONST.REPORT.WORKSPACE_CHAT_ROOMS.ADMINS, CONST.REPORT.CHAT_TYPE.POLICY_ADMINS, policyID, null, false, policyName);
    const adminsChatReportID = adminsChatData.reportID;
    const adminsCreatedAction = buildOptimisticCreatedReportAction(adminsChatData.ownerEmail);
    const adminsReportActionData = {
        [adminsCreatedAction.reportActionID]: adminsCreatedAction,
    };

    const expenseChatData = buildOptimisticChatReport([currentUserEmail], '', CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT, policyID, currentUserEmail, true, policyName);
    const expenseChatReportID = expenseChatData.reportID;
    const expenseReportCreatedAction = buildOptimisticCreatedReportAction(expenseChatData.ownerEmail);
    const expenseReportActionData = {
        [expenseReportCreatedAction.reportActionID]: expenseReportCreatedAction,
    };

    return {
        announceChatReportID,
        announceChatData,
        announceReportActionData,
        announceCreatedReportActionID: announceCreatedAction.reportActionID,
        adminsChatReportID,
        adminsChatData,
        adminsReportActionData,
        adminsCreatedReportActionID: adminsCreatedAction.reportActionID,
        expenseChatReportID,
        expenseChatData,
        expenseReportActionData,
        expenseCreatedReportActionID: expenseReportCreatedAction.reportActionID,
    };
}

/**
 * Builds an optimistic Task Report with a randomly generated reportID
 *
 * @param {String} ownerEmail - Email of the person generating the Task.
 * @param {String} assignee - Email of the other person participating in the Task.
 * @param {String} parentReportID - Report ID of the chat where the Task is.
 * @param {String} title - Task title.
 * @param {String} description - Task description.
 *
 * @returns {Object}
 */

function buildOptimisticTaskReport(ownerEmail, assignee = null, parentReportID, title, description) {
    return {
        reportID: generateReportID(),
        reportName: title,
        description,
        ownerEmail,
        managerEmail: assignee,
        type: CONST.REPORT.TYPE.TASK,
        parentReportID,
        stateNum: CONST.REPORT.STATE_NUM.OPEN,
        statusNum: CONST.REPORT.STATUS.OPEN,
    };
}

/**
 * @param {Object} report
 * @returns {Boolean}
 */
function isUnread(report) {
    if (!report) {
        return false;
    }

    // lastVisibleActionCreated and lastReadTime are both datetime strings and can be compared directly
    const lastVisibleActionCreated = report.lastVisibleActionCreated || '';
    const lastReadTime = report.lastReadTime || '';
    return lastReadTime < lastVisibleActionCreated;
}

/**
 * @param {Object} report
 * @returns {Boolean}
 */
function isUnreadWithMention(report) {
    if (!report) {
        return false;
    }

    // lastMentionedTime and lastReadTime are both datetime strings and can be compared directly
    const lastMentionedTime = report.lastMentionedTime || '';
    const lastReadTime = report.lastReadTime || '';
    return lastReadTime < lastMentionedTime;
}

/**
 * Determines if a report has an outstanding IOU that doesn't belong to the currently logged in user
 *
 * @param {Object} report
 * @param {String} report.iouReportID
 * @param {String} currentUserLogin
 * @param {Object} iouReports
 * @returns {boolean}
 */
function hasOutstandingIOU(report, currentUserLogin, iouReports) {
    if (!report || !report.iouReportID || _.isUndefined(report.hasOutstandingIOU)) {
        return false;
    }

    const iouReport = iouReports && iouReports[`${ONYXKEYS.COLLECTION.REPORT}${report.iouReportID}`];
    if (!iouReport || !iouReport.ownerEmail) {
        return false;
    }

    if (iouReport.ownerEmail === currentUserEmail) {
        return false;
    }

    return report.hasOutstandingIOU;
}

/**
 * @param {Object} report
 * @param {String} report.iouReportID
 * @param {Object} iouReports
 * @returns {Boolean}
 */
function isIOUOwnedByCurrentUser(report, iouReports = {}) {
    if (report.hasOutstandingIOU) {
        const iouReport = iouReports[`${ONYXKEYS.COLLECTION.REPORT}${report.iouReportID}`];
        if (iouReport) {
            return iouReport.ownerEmail === currentUserEmail;
        }
    }
    return false;
}

/**
 * Assuming the passed in report is a default room, lets us know whether we can see it or not, based on permissions and
 * the various subsets of users we've allowed to use default rooms.
 *
 * @param {Object} report
 * @param {Array<Object>} policies
 * @param {Array<String>} betas
 * @return {Boolean}
 */
function canSeeDefaultRoom(report, policies, betas) {
    // Include archived rooms
    if (isArchivedRoom(report)) {
        return true;
    }

    // Include default rooms for free plan policies (domain rooms aren't included in here because they do not belong to a policy)
    if (getPolicyType(report, policies) === CONST.POLICY.TYPE.FREE) {
        return true;
    }

    // Include domain rooms with Partner Managers (Expensify accounts) in them for accounts that are on a domain with an Approved Accountant
    if (isDomainRoom(report) && doesDomainHaveApprovedAccountant && hasExpensifyEmails(lodashGet(report, ['participants'], []))) {
        return true;
    }

    // If the room has an assigned guide, it can be seen.
    if (hasExpensifyGuidesEmails(lodashGet(report, ['participants'], []))) {
        return true;
    }

    // Include any admins and announce rooms, since only non partner-managed domain rooms are on the beta now.
    if (isAdminRoom(report) || isAnnounceRoom(report)) {
        return true;
    }

    // For all other cases, just check that the user belongs to the default rooms beta
    return Permissions.canUseDefaultRooms(betas);
}

/**
 * Takes several pieces of data from Onyx and evaluates if a report should be shown in the option list (either when searching
 * for reports or the reports shown in the LHN).
 *
 * This logic is very specific and the order of the logic is very important. It should fail quickly in most cases and also
 * filter out the majority of reports before filtering out very specific minority of reports.
 *
 * @param {Object} report
 * @param {String} reportIDFromRoute
 * @param {Boolean} isInGSDMode
 * @param {String} currentUserLogin
 * @param {Object} iouReports
 * @param {String[]} betas
 * @param {Object} policies
 * @returns {boolean}
 */
function shouldReportBeInOptionList(report, reportIDFromRoute, isInGSDMode, currentUserLogin, iouReports, betas, policies) {
    const isInDefaultMode = !isInGSDMode;

    // Exclude reports that have no data because there wouldn't be anything to show in the option item.
    // This can happen if data is currently loading from the server or a report is in various stages of being created.
    // This can also happen for anyone accessing a public room or archived room for which they don't have access to the underlying policy.
    if (
        !report ||
        !report.reportID ||
        (_.isEmpty(report.participants) && !isThread(report) && !isPublicRoom(report) && !isArchivedRoom(report) && !isMoneyRequestReport(report) && !isTaskReport(report))
    ) {
        return false;
    }

    if (isDefaultRoom(report) && !canSeeDefaultRoom(report, policies, betas)) {
        return false;
    }

    // Include the currently viewed report. If we excluded the currently viewed report, then there
    // would be no way to highlight it in the options list and it would be confusing to users because they lose
    // a sense of context.
    if (report.reportID === reportIDFromRoute) {
        return true;
    }

    // Include reports if they have a draft, are pinned, or have an outstanding IOU
    // These are always relevant to the user no matter what view mode the user prefers
    if (report.hasDraft || report.isPinned || hasOutstandingIOU(report, currentUserLogin, iouReports)) {
        return true;
    }

    // Include reports that have errors from trying to add a workspace
    // If we excluded it, then the red-brock-road pattern wouldn't work for the user to resolve the error
    if (report.errorFields && !_.isEmpty(report.errorFields.addWorkspaceRoom)) {
        return true;
    }

    // All unread chats (even archived ones) in GSD mode will be shown. This is because GSD mode is specifically for focusing the user on the most relevant chats, primarily, the unread ones
    if (isInGSDMode) {
        return isUnread(report);
    }

    // Archived reports should always be shown when in default (most recent) mode. This is because you should still be able to access and search for the chats to find them.
    if (isInDefaultMode && isArchivedRoom(report)) {
        return true;
    }

    // Include policy expense chats if the user isn't in the policy expense chat beta
    if (isPolicyExpenseChat(report) && !Permissions.canUsePolicyExpenseChat(betas)) {
        return false;
    }

    return true;
}

/**
 * Attempts to find a report in onyx with the provided list of participants. Does not include threads
 * @param {Array} newParticipantList
 * @returns {Array|undefined}
 */
function getChatByParticipants(newParticipantList) {
    newParticipantList.sort();
    return _.find(allReports, (report) => {
        // If the report has been deleted, or there are no participants (like an empty #admins room) then skip it
        if (!report || !report.participants || isThread(report)) {
            return false;
        }

        // Only return the room if it has all the participants and is not a policy room
        return !isUserCreatedPolicyRoom(report) && _.isEqual(newParticipantList, _.sortBy(report.participants));
    });
}

/**
 * Attempts to find a report in onyx with the provided list of participants in given policy
 * @param {Array} newParticipantList
 * @param {String} policyID
 * @returns {object|undefined}
 */
function getChatByParticipantsAndPolicy(newParticipantList, policyID) {
    newParticipantList.sort();
    return _.find(allReports, (report) => {
        // If the report has been deleted, or there are no participants (like an empty #admins room) then skip it
        if (!report || !report.participants) {
            return false;
        }

        // Only return the room if it has all the participants and is not a policy room
        return report.policyID === policyID && _.isEqual(newParticipantList, _.sortBy(report.participants));
    });
}

/**
 * @param {String} policyID
 * @returns {Array}
 */
function getAllPolicyReports(policyID) {
    return _.filter(allReports, (report) => report && report.policyID === policyID);
}

/**
 * Returns true if Chronos is one of the chat participants (1:1)
 * @param {Object} report
 * @returns {Boolean}
 */
function chatIncludesChronos(report) {
    return report.participants && _.contains(report.participants, CONST.EMAIL.CHRONOS);
}

/**
 * @param {Object} report
 * @param {String} report.lastReadTime
 * @param {Array} sortedAndFilteredReportActions - reportActions for the report, sorted newest to oldest, and filtered for only those that should be visible
 *
 * @returns {String|null}
 */
function getNewMarkerReportActionID(report, sortedAndFilteredReportActions) {
    if (!isUnread(report)) {
        return '';
    }

    const newMarkerIndex = _.findLastIndex(sortedAndFilteredReportActions, (reportAction) => (reportAction.created || '') > report.lastReadTime);

    return _.has(sortedAndFilteredReportActions[newMarkerIndex], 'reportActionID') ? sortedAndFilteredReportActions[newMarkerIndex].reportActionID : '';
}

/**
 * Performs the markdown conversion, and replaces code points > 127 with C escape sequences
 * Used for compatibility with the backend auth validator for AddComment, and to account for MD in comments
 * @param {String} textComment
 * @returns {Number} The comment's total length as seen from the backend
 */
function getCommentLength(textComment) {
    return getParsedComment(textComment)
        .replace(/[^ -~]/g, '\\u????')
        .trim().length;
}

/**
 * @param {String|null} url
 * @returns {String}
 */
function getRouteFromLink(url) {
    if (!url) {
        return '';
    }

    // Get the reportID from URL
    let route = url;
    _.each(linkingConfig.prefixes, (prefix) => {
        const localWebAndroidRegEx = /^(http:\/\/([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3})\.([0-9]{1,3}))/;
        if (route.startsWith(prefix)) {
            route = route.replace(prefix, '');
        } else if (localWebAndroidRegEx.test(route)) {
            route = route.replace(localWebAndroidRegEx, '');
        } else {
            return;
        }

        // Remove the port if it's a localhost URL
        if (/^:\d+/.test(route)) {
            route = route.replace(/:\d+/, '');
        }

        // Remove the leading slash if exists
        if (route.startsWith('/')) {
            route = route.replace('/', '');
        }
    });
    return route;
}

/**
 * @param {String|null} url
 * @returns {String}
 */
function getReportIDFromLink(url) {
    const route = getRouteFromLink(url);
    const {reportID, isSubReportPageRoute} = ROUTES.parseReportRouteParams(route);
    if (isSubReportPageRoute) {
        // We allow the Sub-Report deep link routes (settings, details, etc.) to be handled by their respective component pages
        return '';
    }
    return reportID;
}

/**
 * Users can request money in policy expense chats only if they are in a role of a member in the chat (in other words, if it's their policy expense chat)
 *
 * @param {Object} report
 * @returns {Boolean}
 */
function canRequestMoney(report) {
    return !isPolicyExpenseChat(report) || report.isOwnPolicyExpenseChat;
}

/**
 * @param {Object} report
 * @param {Array} reportParticipants
 * @param {Array} betas
 * @returns {Array}
 */
function getMoneyRequestOptions(report, reportParticipants, betas) {
    // In the transaction thread, we do not allow any new money requests
    if (ReportActionsUtils.isTransactionThread(ReportActionsUtils.getParentReportAction(report))) {
        return [];
    }

    const participants = _.filter(reportParticipants, (email) => currentUserPersonalDetails.login !== email);
    const hasExcludedIOUEmails = lodashIntersection(reportParticipants, CONST.EXPENSIFY_EMAILS).length > 0;
    const hasMultipleParticipants = participants.length > 1;

    if (hasExcludedIOUEmails || (participants.length === 0 && !report.isOwnPolicyExpenseChat) || !Permissions.canUseIOU(betas)) {
        return [];
    }

    // Additional requests should be blocked for money request reports
    if (isMoneyRequestReport(report)) {
        return [];
    }

    // User created policy rooms and default rooms like #admins or #announce will always have the Split Bill option
    // unless there are no participants at all (e.g. #admins room for a policy with only 1 admin)
    // DM chats will have the Split Bill option only when there are at least 3 people in the chat.
    // There is no Split Bill option for Workspace chats
    if (isChatRoom(report) || (hasMultipleParticipants && !isPolicyExpenseChat(report))) {
        return [CONST.IOU.MONEY_REQUEST_TYPE.SPLIT];
    }

    // DM chats that only have 2 people will see the Send / Request money options.
    // Workspace chats should only see the Request money option, as "easy overages" is not available.
    return [
        ...(canRequestMoney(report) ? [CONST.IOU.MONEY_REQUEST_TYPE.REQUEST] : []),

        // Send money option should be visible only in DMs
        ...(Permissions.canUseIOUSend(betas) && isChatReport(report) && !isPolicyExpenseChat(report) && participants.length === 1 ? [CONST.IOU.MONEY_REQUEST_TYPE.SEND] : []),
    ];
}

/**
 * Allows a user to leave a policy room according to the following conditions of the visibility or chatType rNVP:
 * `public` - Anyone can leave (because anybody can join)
 * `public_announce` - Only non-policy members can leave (it's auto-shared with policy members)
 * `policy_admins` - Nobody can leave (it's auto-shared with all policy admins)
 * `policy_announce` - Nobody can leave (it's auto-shared with all policy members)
 * `policy` - Anyone can leave (though only policy members can join)
 * `domain` - Nobody can leave (it's auto-shared with domain members)
 * `dm` - Nobody can leave (it's auto-shared with users)
 * `private` - Anybody can leave (though you can only be invited to join)
 *
 * @param {Object} report
 * @param {String} report.visibility
 * @param {String} report.chatType
 * @param {Boolean} isPolicyMember
 * @returns {Boolean}
 */
function canLeaveRoom(report, isPolicyMember) {
    if (_.isEmpty(report.visibility)) {
        if (
            report.chatType === CONST.REPORT.CHAT_TYPE.POLICY_ADMINS ||
            report.chatType === CONST.REPORT.CHAT_TYPE.POLICY_ANNOUNCE ||
            report.chatType === CONST.REPORT.CHAT_TYPE.DOMAIN_ALL ||
            _.isEmpty(report.chatType)
        ) {
            // DM chats don't have a chatType
            return false;
        }
    } else if (isPublicAnnounceRoom(report) && isPolicyMember) {
        return false;
    }
    return true;
}

/**
 * @param {string[]} participants
 * @returns {Boolean}
 */
function isCurrentUserTheOnlyParticipant(participants) {
    return participants && participants.length === 1 && participants[0] === sessionEmail;
}

/**
 * Returns display names for those that can see the whisper.
 * However, it returns "you" if the current user is the only one who can see it besides the person that sent it.
 *
 * @param {string[]} participants
 * @returns {string}
 */
function getWhisperDisplayNames(participants) {
    const isWhisperOnlyVisibleToCurrentUSer = isCurrentUserTheOnlyParticipant(participants);

    // When the current user is the only participant, the display name needs to be "you" because that's the only person reading it
    if (isWhisperOnlyVisibleToCurrentUSer) {
        return Localize.translateLocal('common.youAfterPreposition');
    }

    return _.map(participants, (login) => getDisplayNameForParticipant(login, !isWhisperOnlyVisibleToCurrentUSer)).join(', ');
}

/**
 * Show subscript on IOU or expense report
 * @param {Object} report
 * @returns {Boolean}
 */
function shouldReportShowSubscript(report) {
    if (isArchivedRoom(report)) {
        return false;
    }

    if (isPolicyExpenseChat(report) && !report.isOwnPolicyExpenseChat) {
        return true;
    }

    return isExpenseReport(report);
}

/**
 * Return true if reports data exists
 * @returns {Boolean}
 */
function isReportDataReady() {
    return !_.isEmpty(allReports) && _.some(_.keys(allReports), (key) => allReports[key].reportID);
}

export {
    getReportParticipantsTitle,
    isReportMessageAttachment,
    findLastAccessedReport,
    canEditReportAction,
    canDeleteReportAction,
    canLeaveRoom,
    sortReportsByLastRead,
    isDefaultRoom,
    isAdminRoom,
    isAnnounceRoom,
    isUserCreatedPolicyRoom,
    isChatRoom,
    getChatRoomSubtitle,
    getPolicyName,
    getPolicyType,
    isArchivedRoom,
    isPolicyExpenseChatAdmin,
    isPublicRoom,
    isPublicAnnounceRoom,
    isConciergeChatReport,
    isCurrentUserTheOnlyParticipant,
    hasAutomatedExpensifyEmails,
    hasExpensifyGuidesEmails,
    hasOutstandingIOU,
    isIOUOwnedByCurrentUser,
    getMoneyRequestTotal,
    canShowReportRecipientLocalTime,
    formatReportLastMessageText,
    chatIncludesConcierge,
    isPolicyExpenseChat,
    getIconsForParticipants,
    getIcons,
    getRoomWelcomeMessage,
    getDisplayNamesWithTooltips,
    getReportName,
    getReportIDFromLink,
    getRouteFromLink,
    navigateToDetailsPage,
    generateReportID,
    hasReportNameError,
    isUnread,
    isUnreadWithMention,
    buildOptimisticWorkspaceChats,
    buildOptimisticTaskReport,
    buildOptimisticChatReport,
    buildOptimisticClosedReportAction,
    buildOptimisticCreatedReportAction,
    buildOptimisticEditedTaskReportAction,
    buildOptimisticIOUReport,
    buildOptimisticExpenseReport,
    buildOptimisticIOUReportAction,
    buildOptimisticReportPreview,
    buildOptimisticTaskReportAction,
    buildOptimisticAddCommentReportAction,
    buildOptimisticTaskCommentReportAction,
    shouldReportBeInOptionList,
    getChatByParticipants,
    getChatByParticipantsAndPolicy,
    getAllPolicyReports,
    getIOUReportActionMessage,
    getDisplayNameForParticipant,
    isChatReport,
    isExpenseReport,
    isIOUReport,
    isTaskReport,
    isMoneyRequestReport,
    chatIncludesChronos,
    getNewMarkerReportActionID,
    canSeeDefaultRoom,
    getDefaultWorkspaceAvatar,
    getCommentLength,
    getParsedComment,
    getMoneyRequestOptions,
    canRequestMoney,
    getWhisperDisplayNames,
    getWorkspaceAvatar,
    isThread,
    isThreadParent,
    isThreadFirstChat,
    shouldReportShowSubscript,
    isReportDataReady,
    isSettled,
    isAllowedToComment,
    getMoneyRequestAction,
    getBankAccountRoute,
};
