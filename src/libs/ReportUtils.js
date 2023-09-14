import _ from 'underscore';
import {format, parseISO} from 'date-fns';
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
import * as ReportActionsUtils from './ReportActionsUtils';
import * as TransactionUtils from './TransactionUtils';
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
 * @param {String} policyID
 * @returns {Object}
 */
function getPolicy(policyID) {
    const policy = lodashGet(allPolicies, `${ONYXKEYS.COLLECTION.POLICY}${policyID}`) || {};
    return policy;
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
    const policyName = lodashGet(finalPolicy, 'name') || report.policyName || report.oldPolicyName || noPolicyFound;

    return policyName;
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

/**
 * Checks if the current user is the manager of the supplied report
 *
 * @param {Object} report
 * @returns {Boolean}
 */
function isReportManager(report) {
    return lodashGet(report, 'managerID') === currentUserAccountID;
}

/**
 * Checks if the supplied report has been approved
 *
 * @param {Object} report
 * @returns {Boolean}
 */
function isReportApproved(report) {
    return lodashGet(report, 'stateNum') === CONST.REPORT.STATE_NUM.SUBMITTED && lodashGet(report, 'statusNum') === CONST.REPORT.STATUS.APPROVED;
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
 * Whether the Money Request report is settled
 *
 * @param {String} reportID
 * @returns {Boolean}
 */
function isSettled(reportID) {
    const report = lodashGet(allReports, `${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {});

    if (_.isEmpty(report) || report.isWaitingOnBankAccount) {
        return false;
    }

    return report.statusNum === CONST.REPORT.STATUS.REIMBURSED;
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

/** Wether the provided report belongs to a Control policy and is an epxense chat
 * @param {Object} report
 * @returns {Boolean}
 */
function isControlPolicyExpenseChat(report) {
    return isPolicyExpenseChat(report) && getPolicyType(report, allPolicies) === CONST.POLICY.TYPE.CORPORATE;
}

/** Wether the provided report belongs to a Control policy and is an epxense report
 * @param {Object} report
 * @returns {Boolean}
 */
function isControlPolicyExpenseReport(report) {
    return isExpenseReport(report) && getPolicyType(report, allPolicies) === CONST.POLICY.TYPE.CORPORATE;
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
 * If the report is a policy expense, the route should be for adding bank account for that policy
 * else since the report is a personal IOU, the route should be for personal bank account.
 * @param {Object} report
 * @returns {String}
 */
function getBankAccountRoute(report) {
    return isPolicyExpenseChat(report) ? ROUTES.getBankAccountRoute('', report.policyID) : ROUTES.SETTINGS_ADD_BANK_ACCOUNT;
}

/**
 * Check if personal detail of accountID is empty or optimistic data
 * @param {String} accountID user accountID
 * @returns {Boolean}
 */
function isOptimisticPersonalDetail(accountID) {
    return _.isEmpty(allPersonalDetails[accountID]) || !!allPersonalDetails[accountID].isOptimisticPersonalDetail;
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
 * Check if the report is a single chat report that isn't a thread
 * and personal detail of participant is optimistic data
 * @param {Object} report
 * @param {Array} report.participantAccountIDs
 * @returns {Boolean}
 */
function shouldDisableDetailPage(report) {
    const participantAccountIDs = lodashGet(report, 'participantAccountIDs', []);

    if (isChatRoom(report) || isPolicyExpenseChat(report) || isChatThread(report) || isTaskReport(report)) {
        return false;
    }
    if (participantAccountIDs.length === 1) {
        return isOptimisticPersonalDetail(participantAccountIDs[0]);
    }
    return false;
}

/**
 * Returns true if this report has only one participant and it's an Expensify account.
 * @param {Object} report
 * @returns {Boolean}
 */
function isExpensifyOnlyParticipantInReport(report) {
    const reportParticipants = _.without(lodashGet(report, 'participantAccountIDs', []), currentUserAccountID);
    return lodashGet(report, 'participantAccountIDs', []).length === 1 && _.some(reportParticipants, (accountID) => _.contains(CONST.EXPENSIFY_ACCOUNT_IDS, accountID));
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

    let adminReport;
    if (openOnAdminRoom) {
        adminReport = _.find(sortedReports, (report) => {
            const chatType = getChatType(report);
            return chatType === CONST.REPORT.CHAT_TYPE.POLICY_ADMINS;
        });
    }

    if (isFirstTimeNewExpensifyUser) {
        if (sortedReports.length === 1) {
            return sortedReports[0];
        }

        return adminReport || _.find(sortedReports, (report) => !isConciergeChatReport(report));
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
    return report.participantAccountIDs && report.participantAccountIDs.length === 1;
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
    return policy.role === CONST.POLICY.ROLE.ADMIN && !isDM(report);
}

/**
 * Get welcome message based on room type
 * @param {Object} report
 * @param {Boolean} isUserPolicyAdmin
 * @returns {Object}
 */

function getRoomWelcomeMessage(report, isUserPolicyAdmin) {
    const welcomeMessage = {showReportName: true};
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
    } else if (isAdminsOnlyPostingRoom(report) && !isUserPolicyAdmin) {
        welcomeMessage.phrase1 = Localize.translateLocal('reportActionsView.beginningOfChatHistoryAdminOnlyPostingRoom');
        welcomeMessage.showReportName = false;
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
    return !_.isEmpty(report.participantAccountIDs) && _.contains(report.participantAccountIDs, CONST.ACCOUNT_ID.CONCIERGE);
}

/**
 * Returns true if there is any automated expensify account `in accountIDs
 * @param {Array} accountIDs
 * @returns {Boolean}
 */
function hasAutomatedExpensifyAccountIDs(accountIDs) {
    return _.intersection(accountIDs, CONST.EXPENSIFY_ACCOUNT_IDS).length > 0;
}

/**
 * @param {Object} report
 * @param {Number} currentLoginAccountID
 * @returns {Array}
 */
function getReportRecipientAccountIDs(report, currentLoginAccountID) {
    const participantAccountIDs = isTaskReport(report) ? [report.managerID] : lodashGet(report, 'participantAccountIDs');
    const reportParticipants = _.without(participantAccountIDs, currentLoginAccountID);
    const participantsWithoutExpensifyAccountIDs = _.difference(reportParticipants, CONST.EXPENSIFY_ACCOUNT_IDS);
    return participantsWithoutExpensifyAccountIDs;
}

/**
 * Whether the time row should be shown for a report.
 * @param {Array<Object>} personalDetails
 * @param {Object} report
 * @param {Number} accountID
 * @return {Boolean}
 */
function canShowReportRecipientLocalTime(personalDetails, report, accountID) {
    const reportRecipientAccountIDs = getReportRecipientAccountIDs(report, accountID);
    const hasMultipleParticipants = reportRecipientAccountIDs.length > 1;
    const reportRecipient = personalDetails[reportRecipientAccountIDs[0]];
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
            lodashGet(personalDetails, [accountID, 'displayName']) || lodashGet(personalDetails, [accountID, 'login'], ''),
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
 * Determines if a report has an IOU that is waiting for an action from the current user (either Pay or Add a credit bank account)
 *
 * @param {Object} report (chatReport or iouReport)
 * @returns {boolean}
 */
function isWaitingForIOUActionFromCurrentUser(report) {
    if (!report) {
        return false;
    }

    const policy = getPolicy(report.policyID);
    if (policy.type === CONST.POLICY.TYPE.CORPORATE) {
        // If the report is already settled, there's no action required from any user.
        if (isSettled(report.reportID)) {
            return false;
        }

        // Report is pending approval and the current user is the manager
        if (isReportManager(report) && !isReportApproved(report)) {
            return true;
        }

        // Current user is an admin and the report has been approved but not settled yet
        return policy.role === CONST.POLICY.ROLE.ADMIN && isReportApproved(report);
    }

    // Money request waiting for current user to add their credit bank account
    if (report.hasOutstandingIOU && report.ownerAccountID === currentUserAccountID && report.isWaitingOnBankAccount) {
        return true;
    }

    // Money request waiting for current user to Pay (from expense or iou report)
    if (report.hasOutstandingIOU && report.ownerAccountID && (report.ownerAccountID !== currentUserAccountID || currentUserAccountID === report.managerID)) {
        return true;
    }

    return false;
}

function isWaitingForTaskCompleteFromAssignee(report) {
    return isTaskReport(report) && isReportManager(report) && isOpenTaskReport(report);
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
    const payerPaidAmountMesssage = Localize.translateLocal('iou.payerPaidAmount', {
        payer: payerName,
        amount: formattedAmount,
    });

    if (report.isWaitingOnBankAccount) {
        return `${payerPaidAmountMesssage} • ${Localize.translateLocal('iou.pending')}`;
    }

    if (report.hasOutstandingIOU) {
        return Localize.translateLocal('iou.payerOwesAmount', {payer: payerName, amount: formattedAmount});
    }

    return payerPaidAmountMesssage;
}

/**
 * Get the report given a reportID
 *
 * @param {String} reportID
 * @returns {Object}
 */
function getReport(reportID) {
    // Deleted reports are set to null and lodashGet will still return null in that case, so we need to add an extra check
    return lodashGet(allReports, `${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {}) || {};
}

/**
 * Gets transaction created, amount, currency and comment
 *
 * @param {Object} transaction
 * @returns {Object}
 */
function getTransactionDetails(transaction) {
    const report = getReport(transaction.reportID);
    return {
        created: TransactionUtils.getCreated(transaction),
        amount: TransactionUtils.getAmount(transaction, isExpenseReport(report)),
        currency: TransactionUtils.getCurrency(transaction),
        comment: TransactionUtils.getDescription(transaction),
        merchant: TransactionUtils.getMerchant(transaction),
        category: TransactionUtils.getCategory(transaction),
    };
}

/**
 * Can only edit if:
 *
 * - in case of IOU report
 *    - the current user is the requestor
 * - in case of expense report
 *    - the current user is the requestor
 *    - or the user is an admin on the policy the expense report is tied to
 *
 * @param {Object} reportAction
 * @returns {Boolean}
 */
function canEditMoneyRequest(reportAction) {
    // If the report action i snot IOU type, return true early
    if (reportAction.actionName !== CONST.REPORT.ACTIONS.TYPE.IOU) {
        return true;
    }
    const moneyRequestReportID = lodashGet(reportAction, 'originalMessage.IOUReportID', 0);
    if (!moneyRequestReportID) {
        return false;
    }
    const moneyRequestReport = getReport(moneyRequestReportID);
    const isReportSettled = isSettled(moneyRequestReport.reportID);
    const isAdmin = isExpenseReport(moneyRequestReport) && lodashGet(getPolicy(moneyRequestReport.policyID), 'role', '') === CONST.POLICY.ROLE.ADMIN;
    const isRequestor = currentUserAccountID === reportAction.actorAccountID;
    return !isReportSettled && (isAdmin || isRequestor);
}

/**
 * Can only edit if:
 *
 * - It was written by the current user
 * - It's an ADDCOMMENT that is not an attachment
 * - It's money request where conditions for editability are defined in canEditMoneyRequest method
 * - It's not pending deletion
 *
 * @param {Object} reportAction
 * @returns {Boolean}
 */
function canEditReportAction(reportAction) {
    const isCommentOrIOU = reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT || reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.IOU;
    return (
        reportAction.actorAccountID === currentUserAccountID &&
        isCommentOrIOU &&
        canEditMoneyRequest(reportAction) && // Returns true for non-IOU actions
        !isReportMessageAttachment(lodashGet(reportAction, ['message', 0], {})) &&
        !ReportActionsUtils.isDeletedAction(reportAction) &&
        !ReportActionsUtils.isCreatedTaskReportAction(reportAction) &&
        reportAction.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE
    );
}

/**
 * Gets all transactions on an IOU report with a receipt
 *
 * @param {Object|null} iouReportID
 * @returns {[Object]}
 */
function getTransactionsWithReceipts(iouReportID) {
    const allTransactions = TransactionUtils.getAllReportTransactions(iouReportID);
    return _.filter(allTransactions, (transaction) => TransactionUtils.hasReceipt(transaction));
}

/**
 * For report previews, we display a "Receipt scan in progress" indicator
 * instead of the report total only when we have no report total ready to show. This is the case when
 * all requests are receipts that are being SmartScanned. As soon as we have a non-receipt request,
 * or as soon as one receipt request is done scanning, we have at least one
 * "ready" money request, and we remove this indicator to show the partial report total.
 *
 * @param {Object|null} iouReportID
 * @param {Object|null} reportPreviewAction the preview action associated with the IOU report
 * @returns {Boolean}
 */
function areAllRequestsBeingSmartScanned(iouReportID, reportPreviewAction) {
    const transactionsWithReceipts = getTransactionsWithReceipts(iouReportID);
    // If we have more requests than requests with receipts, we have some manual requests
    if (ReportActionsUtils.getNumberOfMoneyRequests(reportPreviewAction) > transactionsWithReceipts.length) {
        return false;
    }
    return _.all(transactionsWithReceipts, (transaction) => TransactionUtils.isReceiptBeingScanned(transaction));
}

/**
 * Check if any of the transactions in the report has required missing fields
 *
 * @param {Object|null} iouReportID
 * @returns {Boolean}
 */
function hasMissingSmartscanFields(iouReportID) {
    const transactionsWithReceipts = getTransactionsWithReceipts(iouReportID);
    return _.some(transactionsWithReceipts, (transaction) => TransactionUtils.hasMissingSmartscanFields(transaction));
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

    const transaction = TransactionUtils.getLinkedTransaction(reportAction);
    if (TransactionUtils.hasReceipt(transaction) && TransactionUtils.isReceiptBeingScanned(transaction)) {
        return Localize.translateLocal('iou.receiptScanning');
    }

    if (TransactionUtils.hasMissingSmartscanFields(transaction)) {
        return Localize.translateLocal('iou.receiptMissingDetails');
    }

    const {amount, currency, comment} = getTransactionDetails(transaction);

    return Localize.translateLocal(ReportActionsUtils.isSentMoneyReportAction(reportAction) ? 'iou.threadSentMoneyReportName' : 'iou.threadRequestReportName', {
        formattedAmount: CurrencyUtils.convertToDisplayString(amount, currency),
        comment,
    });
}

/**
 * Get money request message for an IOU report
 *
 * @param {Object} report
 * @param {Object} [reportAction={}] This can be either a report preview action or the IOU action
 * @param {Boolean} [shouldConsiderReceiptBeingScanned=false]
 * @returns  {String}
 */
function getReportPreviewMessage(report, reportAction = {}, shouldConsiderReceiptBeingScanned = false) {
    const reportActionMessage = lodashGet(reportAction, 'message[0].html', '');

    if (_.isEmpty(report) || !report.reportID) {
        // The iouReport is not found locally after SignIn because the OpenApp API won't return iouReports if they're settled
        // As a temporary solution until we know how to solve this the best, we just use the message that returned from BE
        return reportActionMessage;
    }

    const totalAmount = getMoneyRequestTotal(report);
    const payerName = isExpenseReport(report) ? getPolicyName(report) : getDisplayNameForParticipant(report.managerID, true);
    const formattedAmount = CurrencyUtils.convertToDisplayString(totalAmount, report.currency);

    if (isReportApproved(report) && getPolicyType(report, allPolicies) === CONST.POLICY.TYPE.CORPORATE) {
        return `approved ${formattedAmount}`;
    }

    if (shouldConsiderReceiptBeingScanned && ReportActionsUtils.isMoneyRequestAction(reportAction)) {
        const linkedTransaction = TransactionUtils.getLinkedTransaction(reportAction);

        if (!_.isEmpty(linkedTransaction) && TransactionUtils.hasReceipt(linkedTransaction) && TransactionUtils.isReceiptBeingScanned(linkedTransaction)) {
            return Localize.translateLocal('iou.receiptScanning');
        }
    }

    if (isSettled(report.reportID)) {
        // A settled report preview message can come in three formats "paid ... using Paypal.me", "paid ... elsewhere" or "paid ... with Expensify"
        let translatePhraseKey = 'iou.paidElsewhereWithAmount';
        if (reportAction.originalMessage.paymentType === CONST.IOU.PAYMENT_TYPE.PAYPAL_ME || reportActionMessage.match(/ PayPal.me$/)) {
            translatePhraseKey = 'iou.paidUsingPaypalWithAmount';
        } else if (
            _.contains([CONST.IOU.PAYMENT_TYPE.VBBA, CONST.IOU.PAYMENT_TYPE.EXPENSIFY], reportAction.originalMessage.paymentType) ||
            reportActionMessage.match(/ (with Expensify|using Expensify)$/)
        ) {
            translatePhraseKey = 'iou.paidWithExpensifyWithAmount';
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
 * Get the proper message schema for modified expense message.
 *
 * @param {String} newValue
 * @param {String} oldValue
 * @param {String} valueName
 * @param {Boolean} valueInQuotes
 * @returns {String}
 */

function getProperSchemaForModifiedExpenseMessage(newValue, oldValue, valueName, valueInQuotes) {
    const newValueToDisplay = valueInQuotes ? `"${newValue}"` : newValue;
    const oldValueToDisplay = valueInQuotes ? `"${oldValue}"` : oldValue;
    const displayValueName = valueName.toLowerCase();

    if (!oldValue) {
        return Localize.translateLocal('iou.setTheRequest', {valueName: displayValueName, newValueToDisplay});
    }
    if (!newValue) {
        return Localize.translateLocal('iou.removedTheRequest', {valueName: displayValueName, oldValueToDisplay});
    }
    return Localize.translateLocal('iou.updatedTheRequest', {valueName: displayValueName, newValueToDisplay, oldValueToDisplay});
}

/**
 * Get the report action message when expense has been modified.
 *
 * @param {Object} reportAction
 * @returns {String}
 */
function getModifiedExpenseMessage(reportAction) {
    const reportActionOriginalMessage = lodashGet(reportAction, 'originalMessage', {});
    if (_.isEmpty(reportActionOriginalMessage)) {
        return Localize.translateLocal('iou.changedTheRequest');
    }

    const hasModifiedAmount =
        _.has(reportActionOriginalMessage, 'oldAmount') &&
        _.has(reportActionOriginalMessage, 'oldCurrency') &&
        _.has(reportActionOriginalMessage, 'amount') &&
        _.has(reportActionOriginalMessage, 'currency');
    if (hasModifiedAmount) {
        const oldCurrency = reportActionOriginalMessage.oldCurrency;
        const oldAmount = CurrencyUtils.convertToDisplayString(reportActionOriginalMessage.oldAmount, oldCurrency);

        const currency = reportActionOriginalMessage.currency;
        const amount = CurrencyUtils.convertToDisplayString(reportActionOriginalMessage.amount, currency);

        return getProperSchemaForModifiedExpenseMessage(amount, oldAmount, Localize.translateLocal('iou.amount'), false);
    }

    const hasModifiedComment = _.has(reportActionOriginalMessage, 'oldComment') && _.has(reportActionOriginalMessage, 'newComment');
    if (hasModifiedComment) {
        return getProperSchemaForModifiedExpenseMessage(reportActionOriginalMessage.newComment, reportActionOriginalMessage.oldComment, Localize.translateLocal('common.description'), true);
    }

    const hasModifiedCreated = _.has(reportActionOriginalMessage, 'oldCreated') && _.has(reportActionOriginalMessage, 'created');
    if (hasModifiedCreated) {
        // Take only the YYYY-MM-DD value as the original date includes timestamp
        let formattedOldCreated = parseISO(reportActionOriginalMessage.oldCreated);
        formattedOldCreated = format(formattedOldCreated, CONST.DATE.FNS_FORMAT_STRING);
        return getProperSchemaForModifiedExpenseMessage(reportActionOriginalMessage.created, formattedOldCreated, Localize.translateLocal('common.date'), false);
    }

    const hasModifiedMerchant = _.has(reportActionOriginalMessage, 'oldMerchant') && _.has(reportActionOriginalMessage, 'merchant');
    if (hasModifiedMerchant) {
        return getProperSchemaForModifiedExpenseMessage(reportActionOriginalMessage.merchant, reportActionOriginalMessage.oldMerchant, Localize.translateLocal('common.merchant'), true);
    }
}

/**
 * Given the updates user made to the request, compose the originalMessage
 * object of the modified expense action.
 *
 * At the moment, we only allow changing one transaction field at a time.
 *
 * @param {Object} oldTransaction
 * @param {Object} transactionChanges
 * @param {Boolen} isFromExpenseReport
 * @returns {Object}
 */
function getModifiedExpenseOriginalMessage(oldTransaction, transactionChanges, isFromExpenseReport) {
    const originalMessage = {};

    // Remark: Comment field is the only one which has new/old prefixes for the keys (newComment/ oldComment),
    // all others have old/- pattern such as oldCreated/created
    if (_.has(transactionChanges, 'comment')) {
        originalMessage.oldComment = TransactionUtils.getDescription(oldTransaction);
        originalMessage.newComment = transactionChanges.comment;
    }
    if (_.has(transactionChanges, 'created')) {
        originalMessage.oldCreated = TransactionUtils.getCreated(oldTransaction);
        originalMessage.created = transactionChanges.created;
    }
    if (_.has(transactionChanges, 'merchant')) {
        originalMessage.oldMerchant = TransactionUtils.getMerchant(oldTransaction);
        originalMessage.merchant = transactionChanges.merchant;
    }

    // The amount is always a combination of the currency and the number value so when one changes we need to store both
    // to match how we handle the modified expense action in oldDot
    if (_.has(transactionChanges, 'amount') || _.has(transactionChanges, 'currency')) {
        originalMessage.oldAmount = TransactionUtils.getAmount(oldTransaction, isFromExpenseReport);
        originalMessage.amount = lodashGet(transactionChanges, 'amount', originalMessage.oldAmount);
        originalMessage.oldCurrency = TransactionUtils.getCurrency(oldTransaction);
        originalMessage.currency = lodashGet(transactionChanges, 'currency', originalMessage.oldCurrency);
    }

    return originalMessage;
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
    if (isChildReport(report) && !isMoneyRequestReport(report) && !isTaskReport(report)) {
        const parentReport = lodashGet(allReports, [`${ONYXKEYS.COLLECTION.REPORT}${report.parentReportID}`]);
        return getRootReportAndWorkspaceName(parentReport);
    }

    if (isIOURequest(report)) {
        return {
            rootReportName: getReportName(report),
        };
    }
    if (isExpenseRequest(report)) {
        return {
            rootReportName: getReportName(report),
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
 * @returns {Object}
 */
function getParentNavigationSubtitle(report) {
    if (isThread(report)) {
        const parentReport = lodashGet(allReports, [`${ONYXKEYS.COLLECTION.REPORT}${report.parentReportID}`]);
        const {rootReportName, workspaceName} = getRootReportAndWorkspaceName(parentReport);
        if (_.isEmpty(rootReportName)) {
            return {};
        }

        return {rootReportName, workspaceName};
    }
    return {};
}

/**
 * Navigate to the details page of a given report
 *
 * @param {Object} report
 */
function navigateToDetailsPage(report) {
    const participantAccountIDs = lodashGet(report, 'participantAccountIDs', []);

    if (isChatRoom(report) || isPolicyExpenseChat(report) || isChatThread(report) || isTaskReport(report)) {
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
 * @param {String} parentReportID Custom reportID to be updated
 * @param {String} parentReportActionID Custom reportActionID to be updated
 * @returns {Object}
 */
function getOptimisticDataForParentReportAction(reportID, lastVisibleActionCreated, type, parentReportID = '', parentReportActionID = '') {
    const report = getReport(reportID);
    const parentReportAction = ReportActionsUtils.getParentReportAction(report);
    if (_.isEmpty(parentReportAction)) {
        return {};
    }

    const optimisticParentReportAction = updateOptimisticParentReportAction(parentReportAction, lastVisibleActionCreated, type);
    return {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID || report.parentReportID}`,
        value: {
            [parentReportActionID || report.parentReportActionID]: optimisticParentReportAction,
        },
    };
}

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
        parentReportID: chatReportID,
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
        parentReportID: chatReportID,
    };
}

/**
 * @param {String} iouReportID - the report ID of the IOU report the action belongs to
 * @param {String} type - IOUReportAction type. Can be oneOf(create, decline, cancel, pay, split)
 * @param {Number} total - IOU total in cents
 * @param {String} comment - IOU comment
 * @param {String} currency - IOU currency
 * @param {String} paymentType - IOU paymentMethodType. Can be oneOf(Elsewhere, Expensify, PayPal.me)
 * @param {Boolean} isSettlingUp - Whether we are settling up an IOU
 * @returns {Array}
 */
function getIOUReportActionMessage(iouReportID, type, total, comment, currency, paymentType = '', isSettlingUp = false) {
    const amount =
        type === CONST.IOU.REPORT_ACTION_TYPE.PAY
            ? CurrencyUtils.convertToDisplayString(getMoneyRequestTotal(getReport(iouReportID)), currency)
            : CurrencyUtils.convertToDisplayString(total, currency);

    let paymentMethodMessage;
    switch (paymentType) {
        case CONST.IOU.PAYMENT_TYPE.ELSEWHERE:
            paymentMethodMessage = ' elsewhere';
            break;
        case CONST.IOU.PAYMENT_TYPE.VBBA:
        case CONST.IOU.PAYMENT_TYPE.EXPENSIFY:
            paymentMethodMessage = ' with Expensify';
            break;
        default:
            paymentMethodMessage = ` using ${paymentType}`;
            break;
    }

    let iouMessage;
    switch (type) {
        case CONST.REPORT.ACTIONS.TYPE.APPROVED:
            iouMessage = `approved ${amount}`;
            break;
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
 * @param {String} [transactionID] - Not required if the IOUReportAction type is 'pay'
 * @param {String} [paymentType] - Only required if the IOUReportAction type is 'pay'. Can be oneOf(elsewhere, payPal, Expensify).
 * @param {String} [iouReportID] - Only required if the IOUReportActions type is oneOf(decline, cancel, pay). Generates a randomID as default.
 * @param {Boolean} [isSettlingUp] - Whether we are settling up an IOU.
 * @param {Boolean} [isSendMoneyFlow] - Whether this is send money flow
 * @param {Object} [receipt]
 * @param {Boolean} [isOwnPolicyExpenseChat] - Whether this is an expense report create from the current user's policy expense chat
 * @returns {Object}
 */
function buildOptimisticIOUReportAction(
    type,
    amount,
    currency,
    comment,
    participants,
    transactionID = '',
    paymentType = '',
    iouReportID = '',
    isSettlingUp = false,
    isSendMoneyFlow = false,
    receipt = {},
    isOwnPolicyExpenseChat = false,
) {
    const IOUReportID = iouReportID || generateReportID();

    const originalMessage = {
        amount,
        comment,
        currency,
        IOUTransactionID: transactionID,
        IOUReportID,
        type,
    };

    if (type === CONST.IOU.REPORT_ACTION_TYPE.PAY) {
        // In send money flow, we store amount, comment, currency in IOUDetails when type = pay
        if (isSendMoneyFlow) {
            _.each(['amount', 'comment', 'currency'], (key) => {
                delete originalMessage[key];
            });
            originalMessage.IOUDetails = {amount, comment, currency};
            originalMessage.paymentType = paymentType;
        } else {
            // In case of pay money request action, we dont store the comment
            // and there is no single transctionID to link the action to.
            delete originalMessage.IOUTransactionID;
            delete originalMessage.comment;
            originalMessage.paymentType = paymentType;
        }
    }

    // IOUs of type split only exist in group DMs and those don't have an iouReport so we need to delete the IOUReportID key
    if (type === CONST.IOU.REPORT_ACTION_TYPE.SPLIT) {
        delete originalMessage.IOUReportID;
        // Split bill made from a policy expense chat only have the payee's accountID as the participant because the payer could be any policy admin
        if (isOwnPolicyExpenseChat) {
            originalMessage.participantAccountIDs = [currentUserAccountID];
        } else {
            originalMessage.participantAccountIDs = [currentUserAccountID, ..._.pluck(participants, 'accountID')];
        }
    }

    return {
        actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
        actorAccountID: currentUserAccountID,
        automatic: false,
        avatar: lodashGet(currentUserPersonalDetails, 'avatar', UserUtils.getDefaultAvatar(currentUserAccountID)),
        isAttachment: false,
        originalMessage,
        message: getIOUReportActionMessage(iouReportID, type, amount, comment, currency, paymentType, isSettlingUp),
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
        receipt,
        whisperedToAccountIDs: !_.isEmpty(receipt) ? [currentUserAccountID] : [],
    };
}
/**
 * Builds an optimistic APPROVED report action with a randomly generated reportActionID.
 *
 * @param {Number} amount
 * @param {String} currency
 * @param {Number} expenseReportID
 *
 * @returns {Object}
 */
function buildOptimisticApprovedReportAction(amount, currency, expenseReportID) {
    const originalMessage = {
        amount,
        currency,
        expenseReportID,
    };

    return {
        actionName: CONST.REPORT.ACTIONS.TYPE.APPROVED,
        actorAccountID: currentUserAccountID,
        automatic: false,
        avatar: lodashGet(currentUserPersonalDetails, 'avatar', UserUtils.getDefaultAvatar(currentUserAccountID)),
        isAttachment: false,
        originalMessage,
        message: getIOUReportActionMessage(expenseReportID, CONST.REPORT.ACTIONS.TYPE.APPROVED, Math.abs(amount), '', currency),
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
 * @param {String} [comment] - User comment for the IOU.
 * @param {Object} [transaction] - optimistic first transaction of preview
 *
 * @returns {Object}
 */
function buildOptimisticReportPreview(chatReport, iouReport, comment = '', transaction = undefined) {
    const hasReceipt = TransactionUtils.hasReceipt(transaction);
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
        // The preview is initially whispered if created with a receipt, so the actor is the current user as well
        actorAccountID: hasReceipt ? currentUserAccountID : iouReport.managerID || 0,
        childMoneyRequestCount: 1,
        childLastMoneyRequestComment: comment,
        childLastReceiptTransactionIDs: hasReceipt ? transaction.transactionID : '',
        whisperedToAccountIDs: hasReceipt ? [currentUserAccountID] : [],
    };
}

/**
 * Builds an optimistic modified expense action with a randomly generated reportActionID.
 *
 * @param {Object} transactionThread
 * @param {Object} oldTransaction
 * @param {Object} transactionChanges
 * @param {Object} isFromExpenseReport
 * @returns {Object}
 */
function buildOptimisticModifiedExpenseReportAction(transactionThread, oldTransaction, transactionChanges, isFromExpenseReport) {
    const originalMessage = getModifiedExpenseOriginalMessage(oldTransaction, transactionChanges, isFromExpenseReport);
    return {
        actionName: CONST.REPORT.ACTIONS.TYPE.MODIFIEDEXPENSE,
        actorAccountID: currentUserAccountID,
        automatic: false,
        avatar: lodashGet(currentUserPersonalDetails, 'avatar', UserUtils.getDefaultAvatar(currentUserAccountID)),
        created: DateUtils.getDBTime(),
        isAttachment: false,
        message: [
            {
                // Currently we are composing the message from the originalMessage and message is only used in OldDot and not in the App
                text: 'You',
                style: 'strong',
                type: CONST.REPORT.MESSAGE.TYPE.TEXT,
            },
        ],
        originalMessage,
        person: [
            {
                style: 'strong',
                text: lodashGet(currentUserPersonalDetails, 'displayName', currentUserAccountID),
                type: 'TEXT',
            },
        ],
        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        reportActionID: NumberUtils.rand64(),
        reportID: transactionThread.reportID,
        shouldShow: true,
    };
}

/**
 * Updates a report preview action that exists for an IOU report.
 *
 * @param {Object} iouReport
 * @param {Object} reportPreviewAction
 * @param {String} [comment] - User comment for the IOU.
 * @param {Object} [transaction] - optimistic newest transaction of a report preview
 *
 * @returns {Object}
 */
function updateReportPreview(iouReport, reportPreviewAction, comment = '', transaction = undefined) {
    const hasReceipt = TransactionUtils.hasReceipt(transaction);
    const lastReceiptTransactionIDs = lodashGet(reportPreviewAction, 'childLastReceiptTransactionIDs', '');
    const previousTransactionIDs = lastReceiptTransactionIDs.split(',').slice(0, 2);

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
        childLastMoneyRequestComment: comment || reportPreviewAction.childLastMoneyRequestComment,
        childMoneyRequestCount: reportPreviewAction.childMoneyRequestCount + 1,
        childLastReceiptTransactionIDs: hasReceipt ? [transaction.transactionID, ...previousTransactionIDs].join(',') : lastReceiptTransactionIDs,
        // As soon as we add a transaction without a receipt to the report, it will have ready money requests,
        // so we remove the whisper
        whisperedToAccountIDs: hasReceipt ? reportPreviewAction.whisperedToAccountIDs : [],
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
        participantAccountIDs: assigneeAccountID && assigneeAccountID !== ownerAccountID ? [assigneeAccountID] : [],
        managerID: assigneeAccountID,
        type: CONST.REPORT.TYPE.TASK,
        parentReportID,
        stateNum: CONST.REPORT.STATE_NUM.OPEN,
        statusNum: CONST.REPORT.STATUS.OPEN,
    };
}

/**
 * A helper method to create transaction thread
 *
 * @param {Object} reportAction - the parent IOU report action from which to create the thread
 *
 * @param {String} moneyRequestReportID - the reportID which the report action belong to
 *
 * @returns {Object}
 */
function buildTransactionThread(reportAction, moneyRequestReportID) {
    const participantAccountIDs = _.uniq([currentUserAccountID, Number(reportAction.actorAccountID)]);
    return buildOptimisticChatReport(
        participantAccountIDs,
        getTransactionReportName(reportAction),
        '',
        lodashGet(getReport(moneyRequestReportID), 'policyID', CONST.POLICY.OWNER_EMAIL_FAKE),
        CONST.POLICY.OWNER_ACCOUNT_ID_FAKE,
        false,
        '',
        undefined,
        undefined,
        CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
        reportAction.reportActionID,
        moneyRequestReportID,
    );
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
 * Should return true only for personal 1:1 report
 *
 * @param {Object} report (chatReport or iouReport)
 * @returns {boolean}
 */
function isOneOnOneChat(report) {
    const isChatRoomValue = lodashGet(report, 'isChatRoom', false);
    const participantsListValue = lodashGet(report, 'participantsList', []);
    return (
        !isThread(report) &&
        !isChatRoom(report) &&
        !isChatRoomValue &&
        !isExpenseRequest(report) &&
        !isMoneyRequestReport(report) &&
        !isPolicyExpenseChat(report) &&
        !isTaskReport(report) &&
        isDM(report) &&
        !isIOUReport(report) &&
        participantsListValue.length === 1
    );
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
 * @param {String[]} betas
 * @param {Object} policies
 * @param {Object} allReportActions
 * @param {Boolean} excludeEmptyChats
 * @returns {boolean}
 */
function shouldReportBeInOptionList(report, currentReportId, isInGSDMode, betas, policies, allReportActions, excludeEmptyChats = false) {
    const isInDefaultMode = !isInGSDMode;

    // Exclude reports that have no data because there wouldn't be anything to show in the option item.
    // This can happen if data is currently loading from the server or a report is in various stages of being created.
    // This can also happen for anyone accessing a public room or archived room for which they don't have access to the underlying policy.
    if (
        !report ||
        !report.reportID ||
        report.isHidden ||
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

    // Include reports that are relevant to the user in any view mode. Criteria include having a draft, having an outstanding IOU, or being assigned to an open task.
    if (report.hasDraft || isWaitingForIOUActionFromCurrentUser(report) || isWaitingForTaskCompleteFromAssignee(report)) {
        return true;
    }

    const lastVisibleMessage = ReportActionsUtils.getLastVisibleMessage(report.reportID);
    const isEmptyChat = !lastVisibleMessage.lastMessageText && !lastVisibleMessage.lastMessageTranslationKey;

    // Hide only chat threads that haven't been commented on (other threads are actionable)
    if (isChatThread(report) && isEmptyChat) {
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

    // Hide chats between two users that haven't been commented on from the LNH
    if (excludeEmptyChats && isEmptyChat && isChatReport(report) && !isChatRoom(report) && !isPolicyExpenseChat(report)) {
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

    // Additional requests should be blocked for money request reports if it is approved or reimbursed
    if (isMoneyRequestReport(report) && (isReportApproved(report) || isSettled(report.reportID))) {
        return [];
    }

    // User created policy rooms and default rooms like #admins or #announce will always have the Split Bill option
    // unless there are no participants at all (e.g. #admins room for a policy with only 1 admin)
    // DM chats will have the Split Bill option only when there are at least 3 people in the chat.
    // There is no Split Bill option for Workspace chats
    if (isChatRoom(report) || (hasMultipleParticipants && !isPolicyExpenseChat(report)) || isControlPolicyExpenseChat(report)) {
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
 * `policyExpenseChat` - Nobody can leave (it's auto-shared with all policy members)
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
            report.chatType === CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT ||
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
 * Find the parent report action in assignee report for a task report
 * Returns an empty object if assignee report is the same as the share destination report
 *
 * @param {Object} taskReport
 * @returns {Object}
 */
function getTaskParentReportActionIDInAssigneeReport(taskReport) {
    const assigneeChatReportID = lodashGet(getChatByParticipants(isReportManager(taskReport) ? [taskReport.ownerAccountID] : [taskReport.managerID]), 'reportID');
    if (!assigneeChatReportID || assigneeChatReportID === taskReport.parentReportID) {
        return {};
    }

    const clonedParentReportActionID = lodashGet(ReportActionsUtils.getParentReportActionInReport(taskReport.reportID, assigneeChatReportID), 'reportActionID');
    if (!clonedParentReportActionID) {
        return {};
    }

    return {
        reportID: assigneeChatReportID,
        reportActionID: clonedParentReportActionID,
    };
}

/**
 * Return the errors we have when creating a chat or a workspace room
 * @param {Object} report
 * @returns {Object} errors
 */
function getAddWorkspaceRoomOrChatReportErrors(report) {
    // We are either adding a workspace room, or we're creating a chat, it isn't possible for both of these to have errors for the same report at the same time, so
    // simply looking up the first truthy value will get the relevant property if it's set.
    return lodashGet(report, 'errorFields.addWorkspaceRoom') || lodashGet(report, 'errorFields.createChat');
}

/**
 * Returns true if write actions like assign task, money request, send message should be disabled on a report
 * @param {Object} report
 * @returns {Boolean}
 */
function shouldDisableWriteActions(report) {
    const reportErrors = getAddWorkspaceRoomOrChatReportErrors(report);
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
 * Return the pendingAction and the errors we have when creating a chat or a workspace room offline
 * @param {Object} report
 * @returns {Object} pending action , errors
 */
function getReportOfflinePendingActionAndErrors(report) {
    // We are either adding a workspace room, or we're creating a chat, it isn't possible for both of these to be pending, or to have errors for the same report at the same time, so
    // simply looking up the first truthy value for each case will get the relevant property if it's set.
    const addWorkspaceRoomOrChatPendingAction = lodashGet(report, 'pendingFields.addWorkspaceRoom') || lodashGet(report, 'pendingFields.createChat');
    const addWorkspaceRoomOrChatErrors = getAddWorkspaceRoomOrChatReportErrors(report);
    return {addWorkspaceRoomOrChatPendingAction, addWorkspaceRoomOrChatErrors};
}

/**
 * @param {String} policyOwner
 * @returns {String|null}
 */
function getPolicyExpenseChatReportIDByOwner(policyOwner) {
    const policyWithOwner = _.find(allPolicies, (policy) => policy.owner === policyOwner);
    if (!policyWithOwner) {
        return null;
    }

    const expenseChat = _.find(allReports, (report) => isPolicyExpenseChat(report) && report.policyID === policyWithOwner.id);
    if (!expenseChat) {
        return null;
    }
    return expenseChat.reportID;
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

/**
 * Returns the onyx data needed for the task assignee chat
 * @param {Number} accountID
 * @param {String} assigneeEmail
 * @param {Number} assigneeAccountID
 * @param {String} taskReportID
 * @param {String} assigneeChatReportID
 * @param {String} parentReportID
 * @param {String} title
 * @param {Object} assigneeChatReport
 * @returns {Object}
 */
function getTaskAssigneeChatOnyxData(accountID, assigneeEmail, assigneeAccountID, taskReportID, assigneeChatReportID, parentReportID, title, assigneeChatReport) {
    // Set if we need to add a comment to the assignee chat notifying them that they have been assigned a task
    let optimisticAssigneeAddComment;
    // Set if this is a new chat that needs to be created for the assignee
    let optimisticChatCreatedReportAction;
    const currentTime = DateUtils.getDBTime();
    const optimisticData = [];
    const successData = [];
    const failureData = [];

    // You're able to assign a task to someone you haven't chatted with before - so we need to optimistically create the chat and the chat reportActions
    // Only add the assignee chat report to onyx if we haven't already set it optimistically
    if (assigneeChatReport.isOptimisticReport && lodashGet(assigneeChatReport, 'pendingFields.createChat') !== CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD) {
        optimisticChatCreatedReportAction = buildOptimisticCreatedReportAction(assigneeChatReportID);
        optimisticData.push(
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${assigneeChatReportID}`,
                value: {
                    pendingFields: {
                        createChat: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                    },
                    isHidden: false,
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${assigneeChatReportID}`,
                value: {[optimisticChatCreatedReportAction.reportActionID]: optimisticChatCreatedReportAction},
            },
        );

        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${assigneeChatReportID}`,
            value: {
                pendingFields: {
                    createChat: null,
                },
                isOptimisticReport: false,
            },
        });

        failureData.push(
            {
                onyxMethod: Onyx.METHOD.SET,
                key: `${ONYXKEYS.COLLECTION.REPORT}${assigneeChatReportID}`,
                value: null,
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${assigneeChatReportID}`,
                value: {[optimisticChatCreatedReportAction.reportActionID]: {pendingAction: null}},
            },
            // If we failed, we want to remove the optimistic personal details as it was likely due to an invalid login
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: ONYXKEYS.PERSONAL_DETAILS_LIST,
                value: {
                    [assigneeAccountID]: null,
                },
            },
        );
    }

    // If you're choosing to share the task in the same DM as the assignee then we don't need to create another reportAction indicating that you've been assigned
    if (assigneeChatReportID !== parentReportID) {
        optimisticAssigneeAddComment = buildOptimisticTaskCommentReportAction(taskReportID, title, assigneeEmail, assigneeAccountID, `Assigned a task to you: ${title}`, parentReportID);

        const lastAssigneeCommentText = formatReportLastMessageText(optimisticAssigneeAddComment.reportAction.message[0].text);
        const optimisticAssigneeReport = {
            lastVisibleActionCreated: currentTime,
            lastMessageText: lastAssigneeCommentText,
            lastActorAccountID: accountID,
            lastReadTime: currentTime,
        };

        optimisticData.push(
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${assigneeChatReportID}`,
                value: {[optimisticAssigneeAddComment.reportAction.reportActionID]: optimisticAssigneeAddComment.reportAction},
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${assigneeChatReportID}`,
                value: optimisticAssigneeReport,
            },
        );
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${assigneeChatReportID}`,
            value: {[optimisticAssigneeAddComment.reportAction.reportActionID]: {pendingAction: null}},
        });
    }

    return {
        optimisticData,
        successData,
        failureData,
        optimisticAssigneeAddComment,
        optimisticChatCreatedReportAction,
    };
}

/**
 * Get the last 3 transactions with receipts of an IOU report that will be displayed on the report preview
 *
 * @param {Object} reportPreviewAction
 * @returns {Object}
 */
function getReportPreviewDisplayTransactions(reportPreviewAction) {
    const transactionIDs = lodashGet(reportPreviewAction, ['childLastReceiptTransactionIDs'], '').split(',');
    return _.reduce(
        transactionIDs,
        (transactions, transactionID) => {
            const transaction = TransactionUtils.getTransaction(transactionID);
            if (TransactionUtils.hasReceipt(transaction)) {
                transactions.push(transaction);
            }
            return transactions;
        },
        [],
    );
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
    isAdminsOnlyPostingRoom,
    isAnnounceRoom,
    isUserCreatedPolicyRoom,
    isChatRoom,
    getChatRoomSubtitle,
    getParentNavigationSubtitle,
    getPolicyName,
    getPolicyType,
    isArchivedRoom,
    isExpensifyOnlyParticipantInReport,
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
    isControlPolicyExpenseChat,
    isControlPolicyExpenseReport,
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
    buildOptimisticApprovedReportAction,
    buildOptimisticExpenseReport,
    buildOptimisticIOUReportAction,
    buildOptimisticReportPreview,
    buildOptimisticModifiedExpenseReportAction,
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
    getWorkspaceIcon,
    isOptimisticPersonalDetail,
    shouldDisableDetailPage,
    isChatReport,
    isCurrentUserSubmitter,
    isExpenseReport,
    isExpenseRequest,
    isIOUReport,
    isTaskReport,
    isOpenTaskReport,
    isCanceledTaskReport,
    isCompletedTaskReport,
    isReportManager,
    isReportApproved,
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
    getBankAccountRoute,
    getParentReport,
    getTaskParentReportActionIDInAssigneeReport,
    getReportPreviewMessage,
    getModifiedExpenseMessage,
    shouldDisableWriteActions,
    getOriginalReportID,
    canAccessReport,
    getAddWorkspaceRoomOrChatReportErrors,
    getReportOfflinePendingActionAndErrors,
    isDM,
    getPolicy,
    getPolicyExpenseChatReportIDByOwner,
    shouldDisableSettings,
    shouldDisableRename,
    hasSingleParticipant,
    getReportRecipientAccountIDs,
    isOneOnOneChat,
    getTransactionReportName,
    getTransactionDetails,
    getTaskAssigneeChatOnyxData,
    canEditMoneyRequest,
    buildTransactionThread,
    areAllRequestsBeingSmartScanned,
    getReportPreviewDisplayTransactions,
    getTransactionsWithReceipts,
    hasMissingSmartscanFields,
};
