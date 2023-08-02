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
import * as CurrencyUtils from './CurrencyUtils';
import * as UserUtils from './UserUtils';

let currentUserEmail;
let currentUserAccountID;
let isAnonymousUser;

Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (val) => {
        // When signed out, val is undefined
        if (!val) {
            return;
        }

        currentUserEmail = val.email;
        currentUserAccountID = val.accountID;
        isAnonymousUser = val.authTokenType === 'anonymousAccount';
    },
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

let allPersonalDetails;
let currentUserPersonalDetails;
Onyx.connect({
    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    callback: (val) => {
        currentUserPersonalDetails = lodashGet(val, currentUserAccountID, {});
        allPersonalDetails = val || {};
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

let loginList;
Onyx.connect({
    key: ONYXKEYS.LOGIN_LIST,
    callback: (val) => (loginList = val),
});

function getChatType(report) {
    return report ? report.chatType : '';
}

/**
 * Returns the concatenated title for the PrimaryLogins of a report
 *
 * @param {Array} accountIDs
 * @returns {string}
 */
function getReportParticipantsTitle(accountIDs) {
    return (
        _.chain(accountIDs)

            // Somehow it's possible for the logins coming from report.participantAccountIDs to contain undefined values so we use compact to remove them.
            .compact()
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
 * Checks if a report is an open task report.
 *
 * @param {Object} report
 * @returns {Boolean}
 */
function isOpenTaskReport(report) {
    return isTaskReport(report) && report.stateNum === CONST.REPORT.STATE_NUM.OPEN && report.statusNum === CONST.REPORT.STATUS.OPEN;
}

/**
 * Checks if the current user is assigned to the task report
 *
 * @param {Object} report
 * @returns {Boolean}
 */
function isCanceledTaskReport(report) {
    return isTaskReport(report) && report.stateNum === CONST.REPORT.STATE_NUM.SUBMITTED && report.statusNum === CONST.REPORT.STATUS.CLOSED;
}

/**
 * Checks if a report is a completed task report.
 *
 * @param {Object} report
 * @returns {Boolean}
 */
function isCompletedTaskReport(report) {
    return isTaskReport(report) && report.stateNum === CONST.REPORT.STATE_NUM.SUBMITTED && report.statusNum === CONST.REPORT.STATUS.APPROVED;
}

function isTaskAssignee(report) {
    return lodashGet(report, 'managerID') === currentUserAccountID;
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
        .filter((report) => report && report.reportID && report.lastReadTime)
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
        reportAction.actorAccountID === currentUserAccountID &&
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
    const report = lodashGet(allReports, `${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {});
    return !_.isEmpty(report) && !report.isWaitingOnBankAccount && report.stateNum > CONST.REPORT.STATE_NUM.PROCESSING;
}

/**
 * Whether the current user is the submitter of the report
 *
 * @param {String} reportID
 * @returns {Boolean}
 */
function isCurrentUserSubmitter(reportID) {
    const report = lodashGet(allReports, `${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {});
    return report && report.ownerEmail === currentUserEmail;
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
    // For now, users cannot delete split actions
    if (ReportActionsUtils.isMoneyRequestAction(reportAction) && lodashGet(reportAction, 'originalMessage.type') === CONST.IOU.REPORT_ACTION_TYPE.SPLIT) {
        return false;
    }
    const isActionOwner = reportAction.actorAccountID === currentUserAccountID;
    if (isActionOwner && ReportActionsUtils.isMoneyRequestAction(reportAction) && !isSettled(reportAction.originalMessage.IOUReportID)) {
        return true;
    }
    if (
        reportAction.actionName !== CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT ||
        reportAction.pendingAction === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE ||
        ReportActionsUtils.isCreatedTaskReportAction(reportAction) ||
        (ReportActionsUtils.isMoneyRequestAction(reportAction) && isSettled(reportAction.originalMessage.IOUReportID)) ||
        reportAction.actorAccountID === CONST.ACCOUNT_ID.CONCIERGE
    ) {
        return false;
    }
    if (isActionOwner) {
        return true;
    }
    const report = lodashGet(allReports, `${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {});
    const policy = lodashGet(allPolicies, `${ONYXKEYS.COLLECTION.POLICY}${report.policyID}`) || {};
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
 * Whether the provided report is an Admin-only posting room
 * @param {Object} report
 * @param {String} report.writeCapability
 * @returns {Boolean}
 */
function isAdminsOnlyPostingRoom(report) {
    return lodashGet(report, 'writeCapability', CONST.REPORT.WRITE_CAPABILITIES.ALL) === CONST.REPORT.WRITE_CAPABILITIES.ADMINS;
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
 * Checks if a report is a task report from a policy expense chat.
 *
 * @param {Object} report
 * @returns {Boolean}
 */
function isWorkspaceTaskReport(report) {
    if (!isTaskReport(report)) {
        return false;
    }
    const parentReport = allReports[`${ONYXKEYS.COLLECTION.REPORT}${report.parentReportID}`];
    return isPolicyExpenseChat(parentReport);
}

/**
 * Returns true if report has a parent
 *
 * @param {Object} report
 * @returns {Boolean}
 */
function isThread(report) {
    return Boolean(report && report.parentReportID && report.parentReportActionID);
}

/**
 * Returns true if report is of type chat and has a parent and is therefore a Thread.
 *
 * @param {Object} report
 * @returns {Boolean}
 */
function isChatThread(report) {
    return isThread(report) && report.type === CONST.REPORT.TYPE.CHAT;
}

/**
 * Only returns true if this is our main 1:1 DM report with Concierge
 *
 * @param {Object} report
 * @returns {Boolean}
 */
function isConciergeChatReport(report) {
    return lodashGet(report, 'participantAccountIDs', []).length === 1 && Number(report.participantAccountIDs[0]) === CONST.ACCOUNT_ID.CONCIERGE && !isChatThread(report);
}

/**
 * Returns true if there are any Expensify accounts (i.e. with domain 'expensify.com') in the set of accountIDs
 * by cross-referencing the accountIDs with personalDetails.
 *
 * @param {Array<Number>} accountIDs
 * @return {Boolean}
 */
function hasExpensifyEmails(accountIDs) {
    return _.some(accountIDs, (accountID) => Str.extractEmailDomain(lodashGet(allPersonalDetails, [accountID, 'login'], '')) === CONST.EXPENSIFY_PARTNER_NAME);
}

/**
 * Returns true if there are any guides accounts (team.expensify.com) in a list of accountIDs
 * by cross-referencing the accountIDs with personalDetails since guides that are participants
 * of the user's chats should have their personal details in Onyx.
 * @param {Array<Number>} accountIDs
 * @returns {Boolean}
 */
function hasExpensifyGuidesEmails(accountIDs) {
    return _.some(accountIDs, (accountID) => Str.extractEmailDomain(lodashGet(allPersonalDetails, [accountID, 'login'], '')) === CONST.EMAIL.GUIDES_DOMAIN);
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
            (report) => !isDomainRoom(report) || getPolicyType(report, policies) === CONST.POLICY.TYPE.FREE || hasExpensifyGuidesEmails(lodashGet(report, ['participantAccountIDs'], [])),
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
 * @param {Boolean} [returnEmptyIfNotFound]
 * @param {Object} [policy]
 * @returns {String}
 */
function getPolicyName(report, returnEmptyIfNotFound = false, policy = undefined) {
    const noPolicyFound = returnEmptyIfNotFound ? '' : Localize.translateLocal('workspace.common.unavailable');
    if (_.isEmpty(report)) {
        return noPolicyFound;
    }

    if ((!allPolicies || _.size(allPolicies) === 0) && !report.policyName) {
        return Localize.translateLocal('workspace.common.unavailable');
    }
    const finalPolicy = policy || _.get(allPolicies, `${ONYXKEYS.COLLECTION.POLICY}${report.policyID}`);

    // Public rooms send back the policy name with the reportSummary,
    // since they can also be accessed by people who aren't in the workspace

    return lodashGet(finalPolicy, 'name') || report.policyName || report.oldPolicyName || noPolicyFound;
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
 * Checks if the current user is the admin of the policy.
 * @param {String} policyID
 * @param {Object} policies must have OnyxKey prefix (i.e 'policy_') for keys
 * @returns {Boolean}
 */
function isPolicyAdmin(policyID, policies) {
    const policyRole = lodashGet(policies, [`${ONYXKEYS.COLLECTION.POLICY}${policyID}`, 'role']);

    return policyRole === CONST.POLICY.ROLE.ADMIN;
}

/**
 * Returns true if report is a DM/Group DM chat.
 *
 * @param {Object} report
 * @returns {Boolean}
 */
function isDM(report) {
    return !getChatType(report);
}

/**
 * Returns true if report has a single participant.
 *
 * @param {Object} report
 * @returns {Boolean}
 */
function hasSingleParticipant(report) {
    return report.participants && report.participants.length === 1;
}

/**
 * If the report is a thread and has a chat type set, it is a workspace chat.
 *
 * @param {Object} report
 * @returns {Boolean}
 */
function isWorkspaceThread(report) {
    return Boolean(isThread(report) && !isDM(report));
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
 * @param {String} reportID
 * @returns {Boolean}
 */
function isThreadFirstChat(reportAction, reportID) {
    return !_.isUndefined(reportAction.childReportID) && reportAction.childReportID.toString() === reportID;
}

/**
 * Checks if a report is a child report.
 *
 * @param {Object} report
 * @returns {Boolean}
 */
function isChildReport(report) {
    return isThread(report) || isTaskReport(report);
}

/**
 * An Expense Request is a thread where the parent report is an Expense Report and
 * the parentReportAction is a transaction.
 *
 * @param {Object} report
 * @returns {Boolean}
 */
function isExpenseRequest(report) {
    if (isThread(report)) {
        const parentReportAction = ReportActionsUtils.getParentReportAction(report);
        const parentReport = lodashGet(allReports, [`${ONYXKEYS.COLLECTION.REPORT}${report.parentReportID}`]);
        return isExpenseReport(parentReport) && ReportActionsUtils.isTransactionThread(parentReportAction);
    }
    return false;
}

/**
 * An IOU Request is a thread where the parent report is an IOU Report and
 * the parentReportAction is a transaction.
 *
 * @param {Object} report
 * @returns {Boolean}
 */
function isIOURequest(report) {
    if (isThread(report)) {
        const parentReportAction = ReportActionsUtils.getParentReportAction(report);
        const parentReport = allReports[`${ONYXKEYS.COLLECTION.REPORT}${report.parentReportID}`];
        return isIOUReport(parentReport) && ReportActionsUtils.isTransactionThread(parentReportAction);
    }
    return false;
}

/**
 * Checks if a report is an IOU or expense request.
 *
 * @param {Object|String} reportOrID
 * @returns {Boolean}
 */
function isMoneyRequest(reportOrID) {
    const report = _.isObject(reportOrID) ? reportOrID : allReports[`${ONYXKEYS.COLLECTION.REPORT}${reportOrID}`];
    return isIOURequest(report) || isExpenseRequest(report);
}

/**
 * Checks if a report is an IOU or expense report.
 *
 * @param {Object|String} reportOrID
 * @returns {Boolean}
 */
function isMoneyRequestReport(reportOrID) {
    const report = _.isObject(reportOrID) ? reportOrID : allReports[`${ONYXKEYS.COLLECTION.REPORT}${reportOrID}`];
    return isIOUReport(report) || isExpenseReport(report);
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
    } else if (isAdminsOnlyPostingRoom(report)) {
        welcomeMessage.phrase1 = Localize.translateLocal('reportActionsView.beginningOfChatHistoryAdminOnlyPostingRoomPartOne');
        welcomeMessage.phrase2 = Localize.translateLocal('reportActionsView.beginningOfChatHistoryAdminOnlyPostingRoomPartTwo', {workspaceName});
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
    return report.participantAccountIDs && _.contains(report.participantAccountIDs, CONST.ACCOUNT_ID.CONCIERGE);
}

/**
 * Returns true if there is any automated expensify account in accountIDs
 * @param {Array} accountIDs
 * @returns {Boolean}
 */
function hasAutomatedExpensifyAccountIDs(accountIDs) {
    return _.intersection(accountIDs, CONST.EXPENSIFY_ACCOUNT_IDS).length > 0;
}

/**
 * Whether the time row should be shown for a report.
 * @param {Array<Object>} personalDetails
 * @param {Object} report
 * @param {Number} accountID
 * @return {Boolean}
 */
function canShowReportRecipientLocalTime(personalDetails, report, accountID) {
    const reportParticipants = _.without(lodashGet(report, 'participantAccountIDs', []), accountID);
    const participantsWithoutExpensifyAccountIDs = _.difference(reportParticipants, CONST.EXPENSIFY_ACCOUNT_IDS);
    const hasMultipleParticipants = participantsWithoutExpensifyAccountIDs.length > 1;
    const reportRecipient = personalDetails[participantsWithoutExpensifyAccountIDs[0]];
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
 * Shorten last message text to fixed length and trim spaces.
 * @param {String} lastMessageText
 * @returns {String}
 */
function formatReportLastMessageText(lastMessageText) {
    return String(lastMessageText).trim().replace(CONST.REGEX.AFTER_FIRST_LINE_BREAK, '').substring(0, CONST.REPORT.LAST_MESSAGE_TEXT_MAX_LENGTH).trim();
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
        const accountID = participantsList[i];
        const avatarSource = UserUtils.getAvatar(lodashGet(personalDetails, [accountID, 'avatar'], ''), accountID);
        participantDetails.push([
            accountID,
            lodashGet(personalDetails, [accountID, 'login'], lodashGet(personalDetails, [accountID, 'displayName'], '')),
            lodashGet(personalDetails, [accountID, 'firstName'], ''),
            avatarSource,
        ]);
    }

    // Sort all logins by first name (which is the second element in the array)
    const sortedParticipantDetails = participantDetails.sort((a, b) => a[2] - b[2]);

    // Now that things are sorted, gather only the avatars (third element in the array) and return those
    const avatars = [];
    for (let i = 0; i < sortedParticipantDetails.length; i++) {
        const userIcon = {
            id: sortedParticipantDetails[i][0],
            source: sortedParticipantDetails[i][3],
            type: CONST.ICON_TYPE_AVATAR,
            name: sortedParticipantDetails[i][1],
        };
        avatars.push(userIcon);
    }

    return avatars;
}

/**
 * Given a report, return the associated workspace icon.
 *
 * @param {Object} report
 * @param {Object} [policy]
 * @returns {Object}
 */
function getWorkspaceIcon(report, policy = undefined) {
    const workspaceName = getPolicyName(report, false, policy);
    const policyExpenseChatAvatarSource = lodashGet(allPolicies, [`${ONYXKEYS.COLLECTION.POLICY}${report.policyID}`, 'avatar']) || getDefaultWorkspaceAvatar(workspaceName);
    const workspaceIcon = {
        source: policyExpenseChatAvatarSource,
        type: CONST.ICON_TYPE_WORKSPACE,
        name: workspaceName,
        id: -1,
    };
    return workspaceIcon;
}

/**
 * Returns the appropriate icons for the given chat report using the stored personalDetails.
 * The Avatar sources can be URLs or Icon components according to the chat type.
 *
 * @param {Object} report
 * @param {Object} personalDetails
 * @param {*} [defaultIcon]
 * @param {Boolean} [isPayer]
 * @param {String} [defaultName]
 * @param {Number} [defaultAccountID]
 * @param {Object} [policy]
 * @returns {Array<*>}
 */
function getIcons(report, personalDetails, defaultIcon = null, isPayer = false, defaultName = '', defaultAccountID = -1, policy = undefined) {
    if (_.isEmpty(report)) {
        const fallbackIcon = {
            source: defaultIcon || Expensicons.FallbackAvatar,
            type: CONST.ICON_TYPE_AVATAR,
            name: defaultName,
            id: defaultAccountID,
        };
        return [fallbackIcon];
    }
    if (isExpenseRequest(report)) {
        const parentReportAction = ReportActionsUtils.getParentReportAction(report);
        const workspaceIcon = getWorkspaceIcon(report, policy);
        const memberIcon = {
            source: UserUtils.getAvatar(lodashGet(personalDetails, [parentReportAction.actorAccountID, 'avatar']), parentReportAction.actorAccountID),
            id: parentReportAction.actorAccountID,
            type: CONST.ICON_TYPE_AVATAR,
            name: lodashGet(personalDetails, [parentReportAction.actorAccountID, 'displayName'], ''),
        };

        return [memberIcon, workspaceIcon];
    }
    if (isChatThread(report)) {
        const parentReportAction = ReportActionsUtils.getParentReportAction(report);

        const actorAccountID = lodashGet(parentReportAction, 'actorAccountID', -1);
        const actorDisplayName = lodashGet(allPersonalDetails, [actorAccountID, 'displayName'], '');
        const actorIcon = {
            id: actorAccountID,
            source: UserUtils.getAvatar(lodashGet(personalDetails, [actorAccountID, 'avatar']), actorAccountID),
            name: actorDisplayName,
            type: CONST.ICON_TYPE_AVATAR,
        };

        if (isWorkspaceThread(report)) {
            const workspaceIcon = getWorkspaceIcon(report, policy);
            return [actorIcon, workspaceIcon];
        }
        return [actorIcon];
    }
    if (isTaskReport(report)) {
        const ownerIcon = {
            id: report.ownerAccountID,
            source: UserUtils.getAvatar(lodashGet(personalDetails, [report.ownerAccountID, 'avatar']), report.ownerAccountID),
            type: CONST.ICON_TYPE_AVATAR,
            name: lodashGet(personalDetails, [report.ownerAccountID, 'displayName'], ''),
        };

        if (isWorkspaceTaskReport(report)) {
            const workspaceIcon = getWorkspaceIcon(report, policy);
            return [ownerIcon, workspaceIcon];
        }

        return [ownerIcon];
    }
    if (isDomainRoom(report)) {
        // Get domain name after the #. Domain Rooms use our default workspace avatar pattern.
        const domainName = report.reportName.substring(1);
        const policyExpenseChatAvatarSource = getDefaultWorkspaceAvatar(domainName);
        const domainIcon = {
            source: policyExpenseChatAvatarSource,
            type: CONST.ICON_TYPE_WORKSPACE,
            name: domainName,
            id: -1,
        };
        return [domainIcon];
    }
    if (isAdminRoom(report) || isAnnounceRoom(report) || isChatRoom(report) || isArchivedRoom(report)) {
        const workspaceIcon = getWorkspaceIcon(report, policy);
        return [workspaceIcon];
    }
    if (isPolicyExpenseChat(report) || isExpenseReport(report)) {
        const workspaceIcon = getWorkspaceIcon(report, policy);
        const memberIcon = {
            source: UserUtils.getAvatar(lodashGet(personalDetails, [report.ownerAccountID, 'avatar']), report.ownerAccountID),
            id: report.ownerAccountID,
            type: CONST.ICON_TYPE_AVATAR,
            name: lodashGet(personalDetails, [report.ownerAccountID, 'displayName'], ''),
        };
        return isExpenseReport(report) ? [memberIcon, workspaceIcon] : [workspaceIcon, memberIcon];
    }
    if (isIOUReport(report)) {
        const managerIcon = {
            source: UserUtils.getAvatar(lodashGet(personalDetails, [report.managerID, 'avatar']), report.managerID),
            id: report.managerID,
            type: CONST.ICON_TYPE_AVATAR,
            name: lodashGet(personalDetails, [report.managerID, 'displayName'], ''),
        };

        const ownerIcon = {
            id: report.ownerAccountID,
            source: UserUtils.getAvatar(lodashGet(personalDetails, [report.ownerAccountID, 'avatar']), report.ownerAccountID),
            type: CONST.ICON_TYPE_AVATAR,
            name: lodashGet(personalDetails, [report.ownerAccountID, 'displayName'], ''),
        };

        return isPayer ? [managerIcon, ownerIcon] : [ownerIcon, managerIcon];
    }
    return getIconsForParticipants(report.participantAccountIDs, personalDetails);
}

/**
 * Gets the personal details for a login by looking in the ONYXKEYS.PERSONAL_DETAILS_LIST Onyx key (stored in the local variable, allPersonalDetails). If it doesn't exist in Onyx,
 * then a default object is constructed.
 * @param {Number} accountID
 * @returns {Object}
 */
function getPersonalDetailsForAccountID(accountID) {
    if (!accountID) {
        return {};
    }
    if (Number(accountID) === CONST.ACCOUNT_ID.CONCIERGE) {
        return {
            accountID,
            displayName: 'Concierge',
            login: CONST.EMAIL.CONCIERGE,
            avatar: UserUtils.getDefaultAvatar(accountID),
        };
    }
    return (
        (allPersonalDetails && allPersonalDetails[accountID]) || {
            avatar: UserUtils.getDefaultAvatar(accountID),
        }
    );
}

/**
 * Get the displayName for a single report participant.
 *
 * @param {Number} accountID
 * @param {Boolean} [shouldUseShortForm]
 * @returns {String}
 */
function getDisplayNameForParticipant(accountID, shouldUseShortForm = false) {
    if (!accountID) {
        return '';
    }
    const personalDetails = getPersonalDetailsForAccountID(accountID);
    const longName = personalDetails.displayName;
    const shortName = personalDetails.firstName || longName;
    return shouldUseShortForm ? shortName : longName;
}

/**
 * @param {Object} personalDetailsList
 * @param {Boolean} isMultipleParticipantReport
 * @returns {Array}
 */
function getDisplayNamesWithTooltips(personalDetailsList, isMultipleParticipantReport) {
    return _.map(personalDetailsList, (user) => {
        const accountID = Number(user.accountID);
        const displayName = getDisplayNameForParticipant(accountID, isMultipleParticipantReport) || user.login || '';
        const avatar = UserUtils.getDefaultAvatar(accountID);

        let pronouns = user.pronouns;
        if (pronouns && pronouns.startsWith(CONST.PRONOUNS.PREFIX)) {
            const pronounTranslationKey = pronouns.replace(CONST.PRONOUNS.PREFIX, '');
            pronouns = Localize.translateLocal(`pronouns.${pronounTranslationKey}`);
        }

        return {
            displayName,
            avatar,
            login: user.login || '',
            accountID,
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
 * Determines if a report has an IOU that is waiting for an action from the current user (either Pay or Add a credit bank account)
 *
 * @param {Object} report (chatReport or iouReport)
 * @param {Object} allReportsDict
 * @returns {boolean}
 */
function isWaitingForIOUActionFromCurrentUser(report, allReportsDict = null) {
    const allAvailableReports = allReportsDict || allReports;
    if (!report || !allAvailableReports) {
        return false;
    }

    // Money request waiting for current user to add their credit bank account
    if (report.ownerAccountID === currentUserAccountID && report.isWaitingOnBankAccount) {
        return true;
    }

    let reportToLook = report;
    if (report.iouReportID) {
        const iouReport = allAvailableReports[`${ONYXKEYS.COLLECTION.REPORT}${report.iouReportID}`];
        if (iouReport) {
            reportToLook = iouReport;
        }
    }
    // Money request waiting for current user to Pay (from chat or from iou report)
    if (reportToLook.ownerAccountID && (reportToLook.ownerAccountID !== currentUserAccountID || currentUserAccountID === reportToLook.managerID) && reportToLook.hasOutstandingIOU) {
        return true;
    }

    return false;
}

/**
 * @param {Object} report
 * @param {Object} allReportsDict
 * @returns {Number}
 */
function getMoneyRequestTotal(report, allReportsDict = null) {
    const allAvailableReports = allReportsDict || allReports;
    let moneyRequestReport;
    if (isMoneyRequestReport(report)) {
        moneyRequestReport = report;
    }
    if (allAvailableReports && report.hasOutstandingIOU && report.iouReportID) {
        moneyRequestReport = allAvailableReports[`${ONYXKEYS.COLLECTION.REPORT}${report.iouReportID}`];
    }
    if (moneyRequestReport) {
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
 * @param {Object} [policy]
 * @returns {String}
 */
function getPolicyExpenseChatName(report, policy = undefined) {
    const reportOwnerDisplayName = getDisplayNameForParticipant(report.ownerAccountID) || lodashGet(allPersonalDetails, [report.ownerAccountID, 'login']) || report.reportName;

    // If the policy expense chat is owned by this user, use the name of the policy as the report name.
    if (report.isOwnPolicyExpenseChat) {
        return getPolicyName(report, false, policy);
    }

    const policyExpenseChatRole = lodashGet(allPolicies, [`${ONYXKEYS.COLLECTION.POLICY}${report.policyID}`, 'role']) || 'user';

    // If this user is not admin and this policy expense chat has been archived because of account merging, this must be an old workspace chat
    // of the account which was merged into the current user's account. Use the name of the policy as the name of the report.
    if (isArchivedRoom(report)) {
        const lastAction = ReportActionsUtils.getLastVisibleAction(report.reportID);
        const archiveReason = (lastAction && lastAction.originalMessage && lastAction.originalMessage.reason) || CONST.REPORT.ARCHIVE_REASON.DEFAULT;
        if (archiveReason === CONST.REPORT.ARCHIVE_REASON.ACCOUNT_MERGED && policyExpenseChatRole !== CONST.POLICY.ROLE.ADMIN) {
            return getPolicyName(report, false, policy);
        }
    }

    // If user can see this report and they are not its owner, they must be an admin and the report name should be the name of the policy member
    return reportOwnerDisplayName;
}

/**
 * Get the title for a IOU or expense chat which will be showing the payer and the amount
 *
 * @param {Object} report
 * @param {Object} [policy]
 * @returns  {String}
 */
function getMoneyRequestReportName(report, policy = undefined) {
    const formattedAmount = CurrencyUtils.convertToDisplayString(getMoneyRequestTotal(report), report.currency);
    const payerName = isExpenseReport(report) ? getPolicyName(report, false, policy) : getDisplayNameForParticipant(report.managerID);
    const payerPaidAmountMesssage = Localize.translateLocal('iou.payerPaidAmount', {payer: payerName, amount: formattedAmount});

    if (report.isWaitingOnBankAccount) {
        return `${payerPaidAmountMesssage} • ${Localize.translateLocal('iou.pending')}`;
    }

    if (report.hasOutstandingIOU) {
        return Localize.translateLocal('iou.payerOwesAmount', {payer: payerName, amount: formattedAmount});
    }

    return payerPaidAmountMesssage;
}

/**
 * Given a parent IOU report action get report name for the LHN.
 *
 * @param {Object} reportAction
 * @returns {String}
 */
function getTransactionReportName(reportAction) {
    if (ReportActionsUtils.isDeletedParentAction(reportAction)) {
        return Localize.translateLocal('parentReportAction.deletedRequest');
    }

    return Localize.translateLocal(ReportActionsUtils.isSentMoneyReportAction(reportAction) ? 'iou.threadSentMoneyReportName' : 'iou.threadRequestReportName', {
        formattedAmount: ReportActionsUtils.getFormattedAmount(reportAction),
        comment: lodashGet(reportAction, 'originalMessage.comment'),
    });
}

/**
 * Get money request message for an IOU report
 *
 * @param {Object} report
 * @param {Object} [reportAction={}]
 * @returns  {String}
 */
function getReportPreviewMessage(report, reportAction = {}) {
    const reportActionMessage = lodashGet(reportAction, 'message[0].html', '');

    if (_.isEmpty(report) || !report.reportID) {
        // The iouReport is not found locally after SignIn because the OpenApp API won't return iouReports if they're settled
        // As a temporary solution until we know how to solve this the best, we just use the message that returned from BE
        return reportActionMessage;
    }

    const totalAmount = getMoneyRequestTotal(report);
    const payerName = isExpenseReport(report) ? getPolicyName(report) : getDisplayNameForParticipant(report.managerID, true);
    const formattedAmount = CurrencyUtils.convertToDisplayString(totalAmount, report.currency);

    if (isSettled(report.reportID)) {
        // A settled report preview message can come in three formats "paid ... using Paypal.me", "paid ... elsewhere" or "paid ... using Expensify"
        let translatePhraseKey = 'iou.paidElsewhereWithAmount';
        if (reportActionMessage.match(/ Paypal.me$/)) {
            translatePhraseKey = 'iou.paidUsingPaypalWithAmount';
        } else if (reportActionMessage.match(/ using Expensify$/)) {
            translatePhraseKey = 'iou.paidUsingExpensifyWithAmount';
        }
        return Localize.translateLocal(translatePhraseKey, {amount: formattedAmount});
    }

    if (report.isWaitingOnBankAccount) {
        const submitterDisplayName = getDisplayNameForParticipant(report.ownerAccountID, true);
        return Localize.translateLocal('iou.waitingOnBankAccount', {submitterDisplayName});
    }

    return Localize.translateLocal('iou.payerOwesAmount', {payer: payerName, amount: formattedAmount});
}

/**
 * Get the title for a report.
 *
 * @param {Object} report
 * @param {Object} [policy]
 * @returns {String}
 */
function getReportName(report, policy = undefined) {
    let formattedName;
    if (isChatThread(report)) {
        const parentReportAction = ReportActionsUtils.getParentReportAction(report);
        if (ReportActionsUtils.isTransactionThread(parentReportAction)) {
            return getTransactionReportName(parentReportAction);
        }

        const isAttachment = _.has(parentReportAction, 'isAttachment') ? parentReportAction.isAttachment : isReportMessageAttachment(_.last(lodashGet(parentReportAction, 'message', [{}])));
        const parentReportActionMessage = lodashGet(parentReportAction, ['message', 0, 'text'], '').replace(/(\r\n|\n|\r)/gm, ' ');
        if (isAttachment && parentReportActionMessage) {
            return `[${Localize.translateLocal('common.attachment')}]`;
        }
        if (
            lodashGet(parentReportAction, 'message[0].moderationDecision.decision') === CONST.MODERATION.MODERATOR_DECISION_PENDING_HIDE ||
            lodashGet(parentReportAction, 'message[0].moderationDecision.decision') === CONST.MODERATION.MODERATOR_DECISION_HIDDEN
        ) {
            return Localize.translateLocal('parentReportAction.hiddenMessage');
        }
        return parentReportActionMessage || Localize.translateLocal('parentReportAction.deletedMessage');
    }
    if (isChatRoom(report) || isTaskReport(report)) {
        formattedName = report.reportName;
    }

    if (isPolicyExpenseChat(report)) {
        formattedName = getPolicyExpenseChatName(report, policy);
    }

    if (isMoneyRequestReport(report)) {
        formattedName = getMoneyRequestReportName(report, policy);
    }

    if (isArchivedRoom(report)) {
        formattedName += ` (${Localize.translateLocal('common.archived')})`;
    }

    if (formattedName) {
        return formattedName;
    }

    // Not a room or PolicyExpenseChat, generate title from participants
    const participantAccountIDs = (report && report.participantAccountIDs) || [];
    const participantsWithoutCurrentUser = _.without(participantAccountIDs, currentUserAccountID);
    const isMultipleParticipantReport = participantsWithoutCurrentUser.length > 1;

    return _.map(participantsWithoutCurrentUser, (accountID) => getDisplayNameForParticipant(accountID, isMultipleParticipantReport)).join(', ');
}

/**
 * Recursively navigates through thread parents to get the root report and workspace name.
 * The recursion stops when we find a non thread or money request report, whichever comes first.
 * @param {Object} report
 * @returns {Object}
 */
function getRootReportAndWorkspaceName(report) {
    if (isChildReport(report) && !isMoneyRequestReport(report)) {
        const parentReport = lodashGet(allReports, [`${ONYXKEYS.COLLECTION.REPORT}${report.parentReportID}`]);
        return getRootReportAndWorkspaceName(parentReport);
    }

    if (isIOURequest(report)) {
        return {
            rootReportName: lodashGet(report, 'displayName', ''),
        };
    }
    if (isExpenseRequest(report)) {
        return {
            rootReportName: lodashGet(report, 'displayName', ''),
            workspaceName: isIOUReport(report) ? CONST.POLICY.OWNER_EMAIL_FAKE : getPolicyName(report, true),
        };
    }

    return {
        rootReportName: getReportName(report),
        workspaceName: getPolicyName(report, true),
    };
}

/**
 * Get either the policyName or domainName the chat is tied to
 * @param {Object} report
 * @returns {String}
 */
function getChatRoomSubtitle(report) {
    if (isChatThread(report)) {
        return '';
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
 * Gets the parent navigation subtitle for the report
 * @param {Object} report
 * @returns {String}
 */
function getParentNavigationSubtitle(report) {
    if (isThread(report)) {
        const parentReport = lodashGet(allReports, [`${ONYXKEYS.COLLECTION.REPORT}${report.parentReportID}`]);
        const {rootReportName, workspaceName} = getRootReportAndWorkspaceName(parentReport);
        if (_.isEmpty(rootReportName)) {
            return '';
        }

        return Localize.translateLocal('threads.parentNavigationSummary', {rootReportName, workspaceName});
    }
    return '';
}

/**
 * Get the report for a reportID
 *
 * @param {String} reportID
 * @returns {Object}
 */
function getReport(reportID) {
    return lodashGet(allReports, `${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {});
}

/**
 * Navigate to the details page of a given report
 *
 * @param {Object} report
 */
function navigateToDetailsPage(report) {
    const participantAccountIDs = lodashGet(report, 'participantAccountIDs', []);

    if (isChatRoom(report) || isPolicyExpenseChat(report) || isChatThread(report)) {
        Navigation.navigate(ROUTES.getReportDetailsRoute(report.reportID));
        return;
    }
    if (participantAccountIDs.length === 1) {
        Navigation.navigate(ROUTES.getProfileRoute(participantAccountIDs[0]));
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
    const htmlForNewComment = isAttachment ? CONST.ATTACHMENT_UPLOADING_MESSAGE_HTML : commentText;

    // Remove HTML from text when applying optimistic offline comment
    const textForNewComment = isAttachment ? CONST.ATTACHMENT_MESSAGE_TEXT : parser.htmlToText(htmlForNewComment);

    return {
        commentText,
        reportAction: {
            reportActionID: NumberUtils.rand64(),
            actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
            actorAccountID: currentUserAccountID,
            person: [
                {
                    style: 'strong',
                    text: lodashGet(allPersonalDetails, [currentUserAccountID, 'displayName'], currentUserEmail),
                    type: 'TEXT',
                },
            ],
            automatic: false,
            avatar: lodashGet(allPersonalDetails, [currentUserAccountID, 'avatar'], UserUtils.getDefaultAvatarURL(currentUserAccountID)),
            created: DateUtils.getDBTime(),
            message: [
                {
                    translationKey: isAttachment ? CONST.TRANSLATION_KEYS.ATTACHMENT : '',
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
 * update optimistic parent reportAction when a comment is added or remove in the child report
 * @param {String} parentReportAction - Parent report action of the child report
 * @param {String} lastVisibleActionCreated - Last visible action created of the child report
 * @param {String} type - The type of action in the child report
 * @returns {Object}
 */

function updateOptimisticParentReportAction(parentReportAction, lastVisibleActionCreated, type) {
    let childVisibleActionCount = parentReportAction.childVisibleActionCount || 0;
    let childCommenterCount = parentReportAction.childCommenterCount || 0;
    let childOldestFourAccountIDs = parentReportAction.childOldestFourAccountIDs;

    if (type === CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD) {
        childVisibleActionCount += 1;
        const oldestFourAccountIDs = childOldestFourAccountIDs ? childOldestFourAccountIDs.split(',') : [];
        if (oldestFourAccountIDs.length < 4) {
            const index = _.findIndex(oldestFourAccountIDs, (accountID) => accountID === currentUserAccountID.toString());
            if (index === -1) {
                childCommenterCount += 1;
                oldestFourAccountIDs.push(currentUserAccountID);
            }
        }
        childOldestFourAccountIDs = oldestFourAccountIDs.join(',');
    } else if (type === CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE) {
        if (childVisibleActionCount > 0) {
            childVisibleActionCount -= 1;
        }

        if (childVisibleActionCount === 0) {
            childCommenterCount = 0;
            childOldestFourAccountIDs = '';
        }
    }

    return {
        childVisibleActionCount,
        childCommenterCount,
        childLastVisibleActionCreated: lastVisibleActionCreated,
        childOldestFourAccountIDs,
    };
}

/**
 * Get optimistic data of parent report action
 * @param {String} reportID The reportID of the report that is updated
 * @param {String} lastVisibleActionCreated Last visible action created of the child report
 * @param {String} type The type of action in the child report
 * @returns {Object}
 */
const getOptimisticDataForParentReportAction = (reportID, lastVisibleActionCreated, type) => {
    const report = getReport(reportID);
    if (report && report.parentReportActionID) {
        const parentReportAction = ReportActionsUtils.getParentReportAction(report);
        if (parentReportAction && parentReportAction.reportActionID) {
            return {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${report.parentReportID}`,
                value: {
                    [parentReportAction.reportActionID]: updateOptimisticParentReportAction(parentReportAction, lastVisibleActionCreated, type),
                },
            };
        }
    }
    return {};
};

/**
 * Builds an optimistic reportAction for the parent report when a task is created
 * @param {String} taskReportID - Report ID of the task
 * @param {String} taskTitle - Title of the task
 * @param {String} taskAssignee - Email of the person assigned to the task
 * @param {Number} taskAssigneeAccountID - AccountID of the person assigned to the task
 * @param {String} text - Text of the comment
 * @param {String} parentReportID - Report ID of the parent report
 * @returns {Object}
 */
function buildOptimisticTaskCommentReportAction(taskReportID, taskTitle, taskAssignee, taskAssigneeAccountID, text, parentReportID) {
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
    reportAction.reportAction.childReportName = taskTitle;
    reportAction.reportAction.childManagerAccountID = taskAssigneeAccountID;
    reportAction.reportAction.childStatusNum = CONST.REPORT.STATUS.OPEN;
    reportAction.reportAction.childStateNum = CONST.REPORT.STATE_NUM.OPEN;

    return reportAction;
}

/**
 * Builds an optimistic IOU report with a randomly generated reportID
 *
 * @param {Number} payeeAccountID - AccountID of the person generating the IOU.
 * @param {Number} payerAccountID - AccountID of the other person participating in the IOU.
 * @param {Number} total - IOU amount in the smallest unit of the currency.
 * @param {String} chatReportID - Report ID of the chat where the IOU is.
 * @param {String} currency - IOU currency.
 * @param {Boolean} isSendingMoney - If we send money the IOU should be created as settled
 *
 * @returns {Object}
 */
function buildOptimisticIOUReport(payeeAccountID, payerAccountID, total, chatReportID, currency, isSendingMoney = false) {
    const formattedTotal = CurrencyUtils.convertToDisplayString(total, currency);
    const personalDetails = getPersonalDetailsForAccountID(payerAccountID);
    const payerEmail = personalDetails.login;
    return {
        // If we're sending money, hasOutstandingIOU should be false
        hasOutstandingIOU: !isSendingMoney,
        type: CONST.REPORT.TYPE.IOU,
        cachedTotal: formattedTotal,
        chatReportID,
        currency,
        managerID: payerAccountID,
        ownerAccountID: payeeAccountID,
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
 * @param {Number} payeeAccountID - AccountID of the employee (payee)
 * @param {Number} total - Amount in cents
 * @param {String} currency
 *
 * @returns {Object}
 */
function buildOptimisticExpenseReport(chatReportID, policyID, payeeAccountID, total, currency) {
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
        ownerAccountID: payeeAccountID,
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
    const currencyUnit = CurrencyUtils.getCurrencyUnit(currency);
    const amount = NumberFormatUtils.format(preferredLocale, Math.abs(total) / currencyUnit, {style: 'currency', currency});
    let paymentMethodMessage;
    switch (paymentType) {
        case CONST.IOU.PAYMENT_TYPE.ELSEWHERE:
            paymentMethodMessage = ' elsewhere';
            break;
        case CONST.IOU.PAYMENT_TYPE.VBBA:
            paymentMethodMessage = ' using Expensify';
            break;
        default:
            paymentMethodMessage = ` using ${paymentType}`;
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
            iouMessage = isSettlingUp ? `paid ${amount}${paymentMethodMessage}` : `sent ${amount}${comment && ` for ${comment}`}${paymentMethodMessage}`;
            break;
        default:
            break;
    }

    return [
        {
            html: _.escape(iouMessage),
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

    const originalMessage = {
        amount,
        comment,
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
        originalMessage.participantAccountIDs = [currentUserAccountID, ..._.pluck(participants, 'accountID')];
    }

    return {
        actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
        actorAccountID: currentUserAccountID,
        automatic: false,
        avatar: lodashGet(currentUserPersonalDetails, 'avatar', UserUtils.getDefaultAvatar(currentUserAccountID)),
        isAttachment: false,
        originalMessage,
        message: getIOUReportActionMessage(type, amount, comment, currency, paymentType, isSettlingUp),
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

/**
 * Builds an optimistic report preview action with a randomly generated reportActionID.
 *
 * @param {Object} chatReport
 * @param {Object} iouReport
 *
 * @returns {Object}
 */
function buildOptimisticReportPreview(chatReport, iouReport) {
    const message = getReportPreviewMessage(iouReport);
    return {
        reportActionID: NumberUtils.rand64(),
        reportID: chatReport.reportID,
        actionName: CONST.REPORT.ACTIONS.TYPE.REPORTPREVIEW,
        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        originalMessage: {
            linkedReportID: iouReport.reportID,
        },
        message: [
            {
                html: message,
                text: message,
                isEdited: false,
                type: CONST.REPORT.MESSAGE.TYPE.COMMENT,
            },
        ],
        created: DateUtils.getDBTime(),
        accountID: iouReport.managerID || 0,
        actorAccountID: iouReport.managerID || 0,
    };
}

/**
 * Updates a report preview action that exists for an IOU report.
 *
 * @param {Object} iouReport
 * @param {Object} reportPreviewAction
 *
 * @returns {Object}
 */
function updateReportPreview(iouReport, reportPreviewAction) {
    const message = getReportPreviewMessage(iouReport, reportPreviewAction);
    return {
        ...reportPreviewAction,
        created: DateUtils.getDBTime(),
        message: [
            {
                html: message,
                text: message,
                isEdited: false,
                type: CONST.REPORT.MESSAGE.TYPE.COMMENT,
            },
        ],
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
        automatic: false,
        avatar: lodashGet(currentUserPersonalDetails, 'avatar', UserUtils.getDefaultAvatar(currentUserAccountID)),
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
                text: lodashGet(currentUserPersonalDetails, 'displayName', currentUserAccountID),
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
 * @param {Array} participantList Array of participant accountIDs
 * @param {String} reportName
 * @param {String} chatType
 * @param {String} policyID
 * @param {Number} ownerAccountID
 * @param {Boolean} isOwnPolicyExpenseChat
 * @param {String} oldPolicyName
 * @param {String} visibility
 * @param {String} writeCapability
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
    ownerAccountID = CONST.REPORT.OWNER_ACCOUNT_ID_FAKE,
    isOwnPolicyExpenseChat = false,
    oldPolicyName = '',
    visibility = undefined,
    writeCapability = undefined,
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
        lastActorAccountID: 0,
        lastMessageTranslationKey: '',
        lastMessageHtml: '',
        lastMessageText: null,
        lastReadTime: currentTime,
        lastVisibleActionCreated: currentTime,
        notificationPreference,
        oldPolicyName,
        ownerAccountID: ownerAccountID || CONST.REPORT.OWNER_ACCOUNT_ID_FAKE,
        parentReportActionID,
        parentReportID,
        participantAccountIDs: participantList,
        policyID,
        reportID: generateReportID(),
        reportName,
        stateNum: 0,
        statusNum: 0,
        visibility,
        welcomeMessage: '',
        writeCapability,
    };
}

/**
 * Returns the necessary reportAction onyx data to indicate that the chat has been created optimistically
 * @param {String} emailCreatingAction
 * @returns {Object}
 */
function buildOptimisticCreatedReportAction(emailCreatingAction) {
    return {
        reportActionID: NumberUtils.rand64(),
        actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        actorAccountID: currentUserAccountID,
        message: [
            {
                type: CONST.REPORT.MESSAGE.TYPE.TEXT,
                style: 'strong',
                text: emailCreatingAction === currentUserEmail ? 'You' : emailCreatingAction,
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
                text: lodashGet(allPersonalDetails, [currentUserAccountID, 'displayName'], currentUserEmail),
            },
        ],
        automatic: false,
        avatar: lodashGet(allPersonalDetails, [currentUserAccountID, 'avatar'], UserUtils.getDefaultAvatar(currentUserAccountID)),
        created: DateUtils.getDBTime(),
        shouldShow: true,
    };
}

/**
 * Returns the necessary reportAction onyx data to indicate that a task report has been edited
 *
 * @param {String} emailEditingTask
 * @returns {Object}
 */

function buildOptimisticEditedTaskReportAction(emailEditingTask) {
    return {
        reportActionID: NumberUtils.rand64(),
        actionName: CONST.REPORT.ACTIONS.TYPE.TASKEDITED,
        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        actorAccountID: currentUserAccountID,
        message: [
            {
                type: CONST.REPORT.MESSAGE.TYPE.TEXT,
                style: 'strong',
                text: emailEditingTask === currentUserEmail ? 'You' : emailEditingTask,
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
                text: lodashGet(allPersonalDetails, [currentUserAccountID, 'displayName'], currentUserEmail),
            },
        ],
        automatic: false,
        avatar: lodashGet(allPersonalDetails, [currentUserAccountID, 'avatar'], UserUtils.getDefaultAvatar(currentUserAccountID)),
        created: DateUtils.getDBTime(),
        shouldShow: false,
    };
}

/**
 * Returns the necessary reportAction onyx data to indicate that a chat has been archived
 *
 * @param {String} emailClosingReport
 * @param {String} policyName
 * @param {String} reason - A reason why the chat has been archived
 * @returns {Object}
 */
function buildOptimisticClosedReportAction(emailClosingReport, policyName, reason = CONST.REPORT.ARCHIVE_REASON.DEFAULT) {
    return {
        actionName: CONST.REPORT.ACTIONS.TYPE.CLOSED,
        actorAccountID: currentUserAccountID,
        automatic: false,
        avatar: lodashGet(allPersonalDetails, [currentUserAccountID, 'avatar'], UserUtils.getDefaultAvatar(currentUserAccountID)),
        created: DateUtils.getDBTime(),
        message: [
            {
                type: CONST.REPORT.MESSAGE.TYPE.TEXT,
                style: 'strong',
                text: emailClosingReport === currentUserEmail ? 'You' : emailClosingReport,
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
                text: lodashGet(allPersonalDetails, [currentUserAccountID, 'displayName'], currentUserEmail),
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
        [currentUserAccountID],
        CONST.REPORT.WORKSPACE_CHAT_ROOMS.ANNOUNCE,
        CONST.REPORT.CHAT_TYPE.POLICY_ANNOUNCE,
        policyID,
        CONST.POLICY.OWNER_ACCOUNT_ID_FAKE,
        false,
        policyName,
        null,
        undefined,

        // #announce contains all policy members so notifying always should be opt-in only.
        CONST.REPORT.NOTIFICATION_PREFERENCE.DAILY,
    );
    const announceChatReportID = announceChatData.reportID;
    const announceCreatedAction = buildOptimisticCreatedReportAction(CONST.POLICY.OWNER_EMAIL_FAKE);
    const announceReportActionData = {
        [announceCreatedAction.reportActionID]: announceCreatedAction,
    };

    const adminsChatData = buildOptimisticChatReport(
        [currentUserAccountID],
        CONST.REPORT.WORKSPACE_CHAT_ROOMS.ADMINS,
        CONST.REPORT.CHAT_TYPE.POLICY_ADMINS,
        policyID,
        CONST.POLICY.OWNER_ACCOUNT_ID_FAKE,
        false,
        policyName,
    );
    const adminsChatReportID = adminsChatData.reportID;
    const adminsCreatedAction = buildOptimisticCreatedReportAction(CONST.POLICY.OWNER_EMAIL_FAKE);
    const adminsReportActionData = {
        [adminsCreatedAction.reportActionID]: adminsCreatedAction,
    };

    const expenseChatData = buildOptimisticChatReport([currentUserAccountID], '', CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT, policyID, currentUserAccountID, true, policyName);
    const expenseChatReportID = expenseChatData.reportID;
    const expenseReportCreatedAction = buildOptimisticCreatedReportAction(currentUserEmail);
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
 * @param {Number} ownerAccountID - Account ID of the person generating the Task.
 * @param {String} assigneeAccountID - AccountID of the other person participating in the Task.
 * @param {String} parentReportID - Report ID of the chat where the Task is.
 * @param {String} title - Task title.
 * @param {String} description - Task description.
 *
 * @returns {Object}
 */

function buildOptimisticTaskReport(ownerAccountID, assigneeAccountID = 0, parentReportID, title, description) {
    return {
        reportID: generateReportID(),
        reportName: title,
        description,
        ownerAccountID,
        managerID: assigneeAccountID,
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
 * @param {Object} report
 * @param {Object} allReportsDict
 * @returns {Boolean}
 */
function isIOUOwnedByCurrentUser(report, allReportsDict = null) {
    const allAvailableReports = allReportsDict || allReports;
    if (!report || !allAvailableReports) {
        return false;
    }

    let reportToLook = report;
    if (report.iouReportID) {
        const iouReport = allAvailableReports[`${ONYXKEYS.COLLECTION.REPORT}${report.iouReportID}`];
        if (iouReport) {
            reportToLook = iouReport;
        }
    }

    return reportToLook.ownerAccountID === currentUserAccountID;
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
    if (isDomainRoom(report) && doesDomainHaveApprovedAccountant && hasExpensifyEmails(lodashGet(report, ['participantAccountIDs'], []))) {
        return true;
    }

    // If the room has an assigned guide, it can be seen.
    if (hasExpensifyGuidesEmails(lodashGet(report, ['participantAccountIDs'], []))) {
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
 * @param {Object} report
 * @param {Array<Object>} policies
 * @param {Array<String>} betas
 * @param {Object} allReportActions
 * @returns {Boolean}
 */
function canAccessReport(report, policies, betas, allReportActions) {
    if (isThread(report) && ReportActionsUtils.isPendingRemove(ReportActionsUtils.getParentReportAction(report, allReportActions))) {
        return false;
    }

    // We hide default rooms (it's basically just domain rooms now) from people who aren't on the defaultRooms beta.
    if (isDefaultRoom(report) && !canSeeDefaultRoom(report, policies, betas)) {
        return false;
    }

    return true;
}

/**
 * Takes several pieces of data from Onyx and evaluates if a report should be shown in the option list (either when searching
 * for reports or the reports shown in the LHN).
 *
 * This logic is very specific and the order of the logic is very important. It should fail quickly in most cases and also
 * filter out the majority of reports before filtering out very specific minority of reports.
 *
 * @param {Object} report
 * @param {String} currentReportId
 * @param {Boolean} isInGSDMode
 * @param {Object} iouReports
 * @param {String[]} betas
 * @param {Object} policies
 * @param {Object} allReportActions
 * @returns {boolean}
 */
function shouldReportBeInOptionList(report, currentReportId, isInGSDMode, iouReports, betas, policies, allReportActions) {
    const isInDefaultMode = !isInGSDMode;

    // Exclude reports that have no data because there wouldn't be anything to show in the option item.
    // This can happen if data is currently loading from the server or a report is in various stages of being created.
    // This can also happen for anyone accessing a public room or archived room for which they don't have access to the underlying policy.
    if (
        !report ||
        !report.reportID ||
        (_.isEmpty(report.participantAccountIDs) && !isChatThread(report) && !isPublicRoom(report) && !isArchivedRoom(report) && !isMoneyRequestReport(report) && !isTaskReport(report))
    ) {
        return false;
    }

    if (!canAccessReport(report, policies, betas, allReportActions)) {
        return false;
    }

    // Include the currently viewed report. If we excluded the currently viewed report, then there
    // would be no way to highlight it in the options list and it would be confusing to users because they lose
    // a sense of context.
    if (report.reportID === currentReportId) {
        return true;
    }

    // Include reports if they have a draft or have an outstanding IOU
    // These are always relevant to the user no matter what view mode the user prefers
    if (report.hasDraft || isWaitingForIOUActionFromCurrentUser(report, iouReports)) {
        return true;
    }

    // Hide only chat threads that haven't been commented on (other threads are actionable)
    if (isChatThread(report) && !report.lastMessageText) {
        return false;
    }

    // Include reports if they are pinned
    if (report.isPinned) {
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

    // Exclude policy expense chats if the user isn't in the policy expense chat beta
    if (isPolicyExpenseChat(report) && !Permissions.canUsePolicyExpenseChat(betas)) {
        return false;
    }

    return true;
}

/**
 * Attempts to find a report in onyx with the provided list of participants. Does not include threads, task, money request, room, and policy expense chat.
 * @param {Array<Number>} newParticipantList
 * @returns {Array|undefined}
 */
function getChatByParticipants(newParticipantList) {
    newParticipantList.sort();
    return _.find(allReports, (report) => {
        // If the report has been deleted, or there are no participants (like an empty #admins room) then skip it
        if (
            !report ||
            _.isEmpty(report.participantAccountIDs) ||
            isChatThread(report) ||
            isTaskReport(report) ||
            isMoneyRequestReport(report) ||
            isChatRoom(report) ||
            isPolicyExpenseChat(report)
        ) {
            return false;
        }

        // Only return the chat if it has all the participants
        return _.isEqual(newParticipantList, _.sortBy(report.participantAccountIDs));
    });
}

/**
 * Attempts to find a report in onyx with the provided email list of participants. Does not include threads
 * This is temporary function while migrating from PersonalDetails to PersonalDetailsList
 *
 * @deprecated - use getChatByParticipants()
 *
 * @param {Array} participantsLoginList
 * @returns {Array|undefined}
 */
function getChatByParticipantsByLoginList(participantsLoginList) {
    participantsLoginList.sort();
    return _.find(allReports, (report) => {
        // If the report has been deleted, or there are no participants (like an empty #admins room) then skip it
        if (!report || _.isEmpty(report.participantAccountIDs) || isThread(report)) {
            return false;
        }

        // Only return the room if it has all the participants and is not a policy room
        return !isUserCreatedPolicyRoom(report) && _.isEqual(participantsLoginList, _.sortBy(report.participants));
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
        if (!report || !report.participantAccountIDs) {
            return false;
        }

        // Only return the room if it has all the participants and is not a policy room
        return report.policyID === policyID && _.isEqual(newParticipantList, _.sortBy(report.participantAccountIDs));
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
    return report.participantAccountIDs && _.contains(report.participantAccountIDs, CONST.ACCOUNT_ID.CHRONOS);
}

/**
 * Can only flag if:
 *
 * - It was written by someone else
 * - It's an ADDCOMMENT that is not an attachment
 *
 * @param {Object} reportAction
 * @param {number} reportID
 * @returns {Boolean}
 */
function canFlagReportAction(reportAction, reportID) {
    return (
        reportAction.actorAccountID !== currentUserAccountID &&
        reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT &&
        !ReportActionsUtils.isDeletedAction(reportAction) &&
        !ReportActionsUtils.isCreatedTaskReportAction(reportAction) &&
        isAllowedToComment(getReport(reportID))
    );
}

/**
 * Whether flag comment page should show
 *
 * @param {Object} reportAction
 * @param {Object} report
 * @returns {Boolean}
 */

function shouldShowFlagComment(reportAction, report) {
    return (
        canFlagReportAction(reportAction, report.reportID) &&
        !isArchivedRoom(report) &&
        !chatIncludesChronos(report) &&
        !isConciergeChatReport(report.reportID) &&
        reportAction.actorAccountID !== CONST.ACCOUNT_ID.CONCIERGE
    );
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
 * Check if the chat report is linked to an iou that is waiting for the current user to add a credit bank account.
 *
 * @param {Object} chatReport
 * @returns {Boolean}
 */
function hasIOUWaitingOnCurrentUserBankAccount(chatReport) {
    if (chatReport.iouReportID) {
        const iouReport = allReports[`${ONYXKEYS.COLLECTION.REPORT}${chatReport.iouReportID}`];
        if (iouReport && iouReport.isWaitingOnBankAccount && iouReport.ownerAccountID === currentUserAccountID) {
            return true;
        }
    }

    return false;
}

/**
 * Users can request money in policy expense chats only if they are in a role of a member in the chat (in other words, if it's their policy expense chat)
 *
 * @param {Object} report
 * @returns {Boolean}
 */
function canRequestMoney(report) {
    // Prevent requesting money if pending iou waiting for their bank account already exists.
    if (hasIOUWaitingOnCurrentUserBankAccount(report)) {
        return false;
    }
    return !isPolicyExpenseChat(report) || report.isOwnPolicyExpenseChat;
}

/**
 * @param {Object} report
 * @param {Array<Number>} reportParticipants
 * @param {Array} betas
 * @returns {Array}
 */
function getMoneyRequestOptions(report, reportParticipants, betas) {
    // In any thread or task report, we do not allow any new money requests yet
    if (isChatThread(report) || isTaskReport(report)) {
        return [];
    }

    const participants = _.filter(reportParticipants, (accountID) => currentUserPersonalDetails.accountID !== accountID);

    const hasExcludedIOUAccountIDs = lodashIntersection(reportParticipants, CONST.EXPENSIFY_ACCOUNT_IDS).length > 0;
    const hasSingleParticipantInReport = participants.length === 1;
    const hasMultipleParticipants = participants.length > 1;

    if (hasExcludedIOUAccountIDs || (participants.length === 0 && !report.isOwnPolicyExpenseChat)) {
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
        ...(Permissions.canUseIOUSend(betas) && isChatReport(report) && !isPolicyExpenseChat(report) && hasSingleParticipantInReport ? [CONST.IOU.MONEY_REQUEST_TYPE.SEND] : []),
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
 * @param {Number[]} participantAccountIDs
 * @returns {Boolean}
 */
function isCurrentUserTheOnlyParticipant(participantAccountIDs) {
    return participantAccountIDs && participantAccountIDs.length === 1 && participantAccountIDs[0] === currentUserAccountID;
}

/**
 * Returns display names for those that can see the whisper.
 * However, it returns "you" if the current user is the only one who can see it besides the person that sent it.
 *
 * @param {Number[]} participantAccountIDs
 * @returns {string}
 */
function getWhisperDisplayNames(participantAccountIDs) {
    const isWhisperOnlyVisibleToCurrentUser = isCurrentUserTheOnlyParticipant(participantAccountIDs);

    // When the current user is the only participant, the display name needs to be "you" because that's the only person reading it
    if (isWhisperOnlyVisibleToCurrentUser) {
        return Localize.translateLocal('common.youAfterPreposition');
    }

    return _.map(participantAccountIDs, (accountID) => getDisplayNameForParticipant(accountID, !isWhisperOnlyVisibleToCurrentUser)).join(', ');
}

/**
 * Show subscript on workspace chats / threads and expense requests
 * @param {Object} report
 * @returns {Boolean}
 */
function shouldReportShowSubscript(report) {
    if (isArchivedRoom(report)) {
        return false;
    }

    if (isPolicyExpenseChat(report) && !isChatThread(report) && !isTaskReport(report) && !report.isOwnPolicyExpenseChat) {
        return true;
    }

    if (isPolicyExpenseChat(report) && !isThread(report) && !isTaskReport(report)) {
        return true;
    }

    if (isExpenseRequest(report)) {
        return true;
    }

    if (isWorkspaceTaskReport(report)) {
        return true;
    }

    if (isWorkspaceThread(report)) {
        return true;
    }

    return false;
}

/**
 * Return true if reports data exists
 * @returns {Boolean}
 */
function isReportDataReady() {
    return !_.isEmpty(allReports) && _.some(_.keys(allReports), (key) => allReports[key].reportID);
}

/**
 * Returns the parentReport if the given report is a thread.
 *
 * @param {Object} report
 * @returns {Object}
 */
function getParentReport(report) {
    if (!report || !report.parentReportID) {
        return {};
    }
    return lodashGet(allReports, `${ONYXKEYS.COLLECTION.REPORT}${report.parentReportID}`, {});
}

/**
 * Return true if the composer should be hidden
 * @param {Object} report
 * @param {Object} reportErrors
 * @returns {Boolean}
 */
function shouldHideComposer(report, reportErrors) {
    return isArchivedRoom(report) || !_.isEmpty(reportErrors) || !isAllowedToComment(report) || isAnonymousUser;
}

/**
 * Returns ID of the original report from which the given reportAction is first created.
 *
 * @param {String} reportID
 * @param {Object} reportAction
 * @returns {String}
 */
function getOriginalReportID(reportID, reportAction) {
    return isThreadFirstChat(reportAction, reportID) ? lodashGet(allReports, [`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, 'parentReportID']) : reportID;
}

/**
 * Return the pendingAction and the errors when we have creating a chat or a workspace room offline
 * @param {Object} report
 * @returns {Object} pending action , errors
 */
function getReportOfflinePendingActionAndErrors(report) {
    // We are either adding a workspace room, or we're creating a chat, it isn't possible for both of these to be pending, or to have errors for the same report at the same time, so
    // simply looking up the first truthy value for each case will get the relevant property if it's set.
    const addWorkspaceRoomOrChatPendingAction = lodashGet(report, 'pendingFields.addWorkspaceRoom') || lodashGet(report, 'pendingFields.createChat');
    const addWorkspaceRoomOrChatErrors = lodashGet(report, 'errorFields.addWorkspaceRoom') || lodashGet(report, 'errorFields.createChat');
    return {addWorkspaceRoomOrChatPendingAction, addWorkspaceRoomOrChatErrors};
}

/**
 * @param {String} policyID
 * @returns {Object}
 */
function getPolicy(policyID) {
    const policy = lodashGet(allPolicies, `${ONYXKEYS.COLLECTION.POLICY}${policyID}`) || {};
    return policy;
}

/*
 * @param {Object|null} report
 * @returns {Boolean}
 */
function shouldDisableSettings(report) {
    return !isPolicyExpenseChat(report) && !isChatRoom(report) && !isChatThread(report);
}

/**
 * @param {Object|null} report
 * @param {Object|null} policy - the workspace the report is on, null if the user isn't a member of the workspace
 * @returns {Boolean}
 */
function shouldDisableRename(report, policy) {
    if (isDefaultRoom(report) || isArchivedRoom(report) || isChatThread(report)) {
        return true;
    }

    // if the linked workspace is null, that means the person isn't a member of the workspace the report is in
    // which means this has to be a public room we want to disable renaming for
    if (!policy) {
        return true;
    }

    // If there is a linked workspace, that means the user is a member of the workspace the report is in.
    // Still, we only want policy owners and admins to be able to modify the name.
    return !_.keys(loginList).includes(policy.owner) && policy.role !== CONST.POLICY.ROLE.ADMIN;
}

export {
    getReportParticipantsTitle,
    isReportMessageAttachment,
    findLastAccessedReport,
    canEditReportAction,
    canFlagReportAction,
    shouldShowFlagComment,
    canDeleteReportAction,
    canLeaveRoom,
    sortReportsByLastRead,
    isDefaultRoom,
    isAdminRoom,
    isAnnounceRoom,
    isUserCreatedPolicyRoom,
    isChatRoom,
    getChatRoomSubtitle,
    getParentNavigationSubtitle,
    getPolicyName,
    getPolicyType,
    isArchivedRoom,
    isPolicyExpenseChatAdmin,
    isPolicyAdmin,
    isPublicRoom,
    isPublicAnnounceRoom,
    isConciergeChatReport,
    isCurrentUserTheOnlyParticipant,
    hasAutomatedExpensifyAccountIDs,
    hasExpensifyGuidesEmails,
    isWaitingForIOUActionFromCurrentUser,
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
    getReport,
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
    updateReportPreview,
    buildOptimisticTaskReportAction,
    buildOptimisticAddCommentReportAction,
    buildOptimisticTaskCommentReportAction,
    updateOptimisticParentReportAction,
    getOptimisticDataForParentReportAction,
    shouldReportBeInOptionList,
    getChatByParticipants,
    getChatByParticipantsByLoginList,
    getChatByParticipantsAndPolicy,
    getAllPolicyReports,
    getIOUReportActionMessage,
    getDisplayNameForParticipant,
    isChatReport,
    isCurrentUserSubmitter,
    isExpenseReport,
    isExpenseRequest,
    isIOUReport,
    isTaskReport,
    isOpenTaskReport,
    isCanceledTaskReport,
    isCompletedTaskReport,
    isTaskAssignee,
    isMoneyRequestReport,
    isMoneyRequest,
    chatIncludesChronos,
    getNewMarkerReportActionID,
    canSeeDefaultRoom,
    getDefaultWorkspaceAvatar,
    getCommentLength,
    getParsedComment,
    getMoneyRequestOptions,
    hasIOUWaitingOnCurrentUserBankAccount,
    canRequestMoney,
    getWhisperDisplayNames,
    getWorkspaceAvatar,
    isThread,
    isChatThread,
    isThreadParent,
    isThreadFirstChat,
    isChildReport,
    shouldReportShowSubscript,
    isReportDataReady,
    isSettled,
    isAllowedToComment,
    getMoneyRequestAction,
    getBankAccountRoute,
    getParentReport,
    getReportPreviewMessage,
    shouldHideComposer,
    getOriginalReportID,
    canAccessReport,
    getReportOfflinePendingActionAndErrors,
    isDM,
    getPolicy,
    shouldDisableSettings,
    shouldDisableRename,
    hasSingleParticipant,
};
