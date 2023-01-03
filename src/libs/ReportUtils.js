import _ from 'underscore';
import Str from 'expensify-common/lib/str';
import lodashGet from 'lodash/get';
import Onyx from 'react-native-onyx';
import ExpensiMark from 'expensify-common/lib/ExpensiMark';
import ONYXKEYS from '../ONYXKEYS';
import CONST from '../CONST';
import * as Localize from './Localize';
import * as LocalePhoneNumber from './LocalePhoneNumber';
import * as Expensicons from '../components/Icon/Expensicons';
import hashCode from './hashCode';
import Navigation from './Navigation/Navigation';
import ROUTES from '../ROUTES';
import * as NumberUtils from './NumberUtils';
import * as NumberFormatUtils from './NumberFormatUtils';
import Permissions from './Permissions';
import DateUtils from './DateUtils';

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
        currentUserPersonalDetails = lodashGet(val, currentUserEmail);
        allPersonalDetails = val;
    },
});

let allReports;
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback: val => allReports = val,
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
    return _.map(logins, login => Str.removeSMSDomain(login)).join(', ');
}

/**
 * Attempts to find a report in onyx with the provided list of participants
 * @param {Object} report
 * @returns {Boolean}
 */
function isIOUReport(report) {
    return report && _.has(report, 'total');
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
 * Given a collection of reports returns them sorted by last read
 *
 * @param {Object} reports
 * @returns {Array}
 */
function sortReportsByLastRead(reports) {
    return _.chain(reports)
        .toArray()
        .filter(report => report && report.reportID && !isIOUReport(report))
        .sortBy('lastReadTimestamp')
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
        && !isReportMessageAttachment(lodashGet(reportAction, ['message', 0], {}))
        && reportAction.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD
        && reportAction.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
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
        && reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT
        && reportAction.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD
        && reportAction.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE;
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
    return [
        CONST.REPORT.CHAT_TYPE.POLICY_ADMINS,
        CONST.REPORT.CHAT_TYPE.POLICY_ANNOUNCE,
        CONST.REPORT.CHAT_TYPE.DOMAIN_ALL,
    ].indexOf(getChatType(report)) > -1;
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
 * Returns true if there are any guides accounts (team.expensify.com) in emails
 * @param {Array} emails
 * @returns {Boolean}
 */
function hasExpensifyGuidesEmails(emails) {
    return _.some(emails, email => Str.extractEmailDomain(email) === CONST.EMAIL.GUIDES_DOMAIN);
}

/**
 * Given a collection of reports returns the most recently accessed one
 *
 * @param {Record<String, {lastReadTimestamp, reportID}>|Array<{lastReadTimestamp, reportID}>} reports
 * @param {Boolean} [ignoreDefaultRooms]
 * @param {Object} policies
 * @returns {Object}
 */
function findLastAccessedReport(reports, ignoreDefaultRooms, policies) {
    let sortedReports = sortReportsByLastRead(reports);

    if (ignoreDefaultRooms) {
        sortedReports = _.filter(sortedReports, report => !isDefaultRoom(report)
            || getPolicyType(report, policies) === CONST.POLICY.TYPE.FREE
            || hasExpensifyGuidesEmails(lodashGet(report, ['participants'], [])));
    }

    return _.last(sortedReports);
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
 * @param {Object} policies must have Onyxkey prefix (i.e 'policy_') for keys
 * @returns {String}
 */
function getPolicyName(report, policies) {
    if (_.isEmpty(policies)) {
        return Localize.translateLocal('workspace.common.unavailable');
    }

    const policy = policies[`${ONYXKEYS.COLLECTION.POLICY}${report.policyID}`];
    if (!policy) {
        return report.oldPolicyName || Localize.translateLocal('workspace.common.unavailable');
    }

    return policy.name
        || report.oldPolicyName
        || Localize.translateLocal('workspace.common.unavailable');
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
    if (getChatType(report) === CONST.REPORT.CHAT_TYPE.DOMAIN_ALL) {
        // The domainAll rooms are just #domainName, so we ignore the prefix '#' to get the domainName
        return report.reportName.substring(1);
    }
    if (isPolicyExpenseChat(report) && report.isOwnPolicyExpenseChat) {
        return Localize.translateLocal('workspace.common.workspace');
    }
    if (isArchivedRoom(report)) {
        return report.oldPolicyName || '';
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
    const reportParticipants = _.without(lodashGet(report, 'participants', []), sessionEmail);
    const participantsWithoutExpensifyEmails = _.difference(reportParticipants, CONST.EXPENSIFY_EMAILS);
    const hasMultipleParticipants = participantsWithoutExpensifyEmails.length > 1;
    const reportRecipient = personalDetails[participantsWithoutExpensifyEmails[0]];
    const reportRecipientTimezone = lodashGet(reportRecipient, 'timezone', CONST.DEFAULT_TIME_ZONE);
    const isReportParticipantValidated = lodashGet(reportRecipient, 'validated', false);
    return !hasMultipleParticipants
        && !isChatRoom(report)
        && reportRecipient
        && reportRecipientTimezone
        && reportRecipientTimezone.selected
        && isReportParticipantValidated;
}

/**
 * Trim the last message text to a fixed limit.
 * @param {String} lastMessageText
 * @returns {String}
 */
function formatReportLastMessageText(lastMessageText) {
    return String(lastMessageText)
        .replace(CONST.REGEX.AFTER_FIRST_LINE_BREAK, '')
        .substring(0, CONST.REPORT.LAST_MESSAGE_TEXT_MAX_LENGTH);
}

/**
 * Helper method to return a default avatar
 *
 * @param {String} [login]
 * @returns {String}
 */
function getDefaultAvatar(login = '') {
    // There are 8 possible default avatars, so we choose which one this user has based
    // on a simple hash of their login
    const loginHashBucket = (Math.abs(hashCode(login.toLowerCase())) % 8) + 1;
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
    if (_.isEmpty(report)) {
        return [defaultIcon || getDefaultAvatar()];
    }
    if (isArchivedRoom(report)) {
        return [Expensicons.DeletedRoomAvatar];
    }
    if (isDomainRoom(report)) {
        return [Expensicons.DomainRoomAvatar];
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
            `${ONYXKEYS.COLLECTION.POLICY}${report.policyID}`, 'avatar',
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

    const participantDetails = [];
    for (let i = 0; i < report.participants.length; i++) {
        const login = report.participants[i];
        participantDetails.push([
            login,
            lodashGet(personalDetails, [login, 'firstName'], ''),
            lodashGet(personalDetails, [login, 'avatar']) || getDefaultAvatar(login),
        ]);
    }

    // Sort all logins by first name (which is the second element in the array)
    const sortedParticipantDetails = participantDetails.sort((a, b) => a[1] - b[1]);

    // Now that things are sorted, gather only the avatars (third element in the array) and return those
    const avatars = [];
    for (let i = 0; i < sortedParticipantDetails.length; i++) {
        avatars.push(sortedParticipantDetails[i][2]);
    }

    return avatars;
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
    return (allPersonalDetails && allPersonalDetails[login]) || {
        login,
        displayName: Str.removeSMSDomain(login),
        avatar: getDefaultAvatar(login),
    };
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

    const loginWithoutSMSDomain = Str.removeSMSDomain(personalDetails.login);
    let longName = personalDetails.displayName || loginWithoutSMSDomain;
    if (longName === loginWithoutSMSDomain && Str.isSMSLogin(longName)) {
        longName = LocalePhoneNumber.toLocalPhone(preferredLocale, longName);
    }
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
 * @param {Object} [policies]
 * @returns {String}
 */
function getReportName(report, policies = {}) {
    let formattedName;
    if (isChatRoom(report)) {
        formattedName = report.reportName;
    }

    if (isPolicyExpenseChat(report)) {
        const reportOwnerDisplayName = getDisplayNameForParticipant(report.ownerEmail) || report.ownerEmail || report.reportName;
        formattedName = report.isOwnPolicyExpenseChat ? getPolicyName(report, policies) : reportOwnerDisplayName;
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

    const displayNames = [];
    for (let i = 0; i < participantsWithoutCurrentUser.length; i++) {
        const login = participantsWithoutCurrentUser[i];
        displayNames.push(getDisplayNameForParticipant(login, isMultipleParticipantReport));
    }
    return displayNames.join(', ');
}

/**
 * Navigate to the details page of a given report
 *
 * @param {Object} report
 */
function navigateToDetailsPage(report) {
    const participants = lodashGet(report, 'participants', []);

    if (isChatRoom(report) || isPolicyExpenseChat(report)) {
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
    return ((Math.floor(Math.random() * (2 ** 21)) * (2 ** 32)) + Math.floor(Math.random() * (2 ** 32))).toString();
}

/**
 * @param {Object} report
 * @returns {Boolean}
 */
function hasReportNameError(report) {
    return !_.isEmpty(lodashGet(report, 'errorFields.reportName', {}));
}

/**
 * @param {Number} sequenceNumber sequenceNumber must be provided and it must be a number. It cannot and should not be a clientID,
 *                                reportActionID, or anything else besides an estimate of what the next sequenceNumber will be for the
 *                                optimistic report action. Until we deprecate sequenceNumbers please assume that all report actions
 *                                have them and they should be numbers.
 * @param {String} [text]
 * @param {File} [file]
 * @returns {Object}
 */
function buildOptimisticReportAction(sequenceNumber, text, file) {
    // For comments shorter than 10k chars, convert the comment from MD into HTML because that's how it is stored in the database
    // For longer comments, skip parsing and display plaintext for performance reasons. It takes over 40s to parse a 100k long string!!
    const parser = new ExpensiMark();
    const commentText = text.length < 10000 ? parser.replace(text) : text;
    const isAttachment = _.isEmpty(text) && file !== undefined;
    const attachmentInfo = isAttachment ? file : {};
    const htmlForNewComment = isAttachment ? 'Uploading Attachment...' : commentText;

    // Remove HTML from text when applying optimistic offline comment
    const textForNewComment = isAttachment ? '[Attachment]'
        : parser.htmlToText(htmlForNewComment);

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
            sequenceNumber,
            clientID: NumberUtils.generateReportActionClientID(),
            avatar: lodashGet(allPersonalDetails, [currentUserEmail, 'avatar'], getDefaultAvatar(currentUserEmail)),
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
 * Builds an optimistic IOU report with a randomly generated reportID
 *
 * @param {String} ownerEmail - Email of the person generating the IOU.
 * @param {String} userEmail - Email of the other person participating in the IOU.
 * @param {Number} total - IOU amount in cents.
 * @param {String} chatReportID - Report ID of the chat where the IOU is.
 * @param {String} currency - IOU currency.
 * @param {String} locale - Locale where the IOU is created
 * @param {Boolean} isSendingMoney - If we send money the IOU should be created as settled
 *
 * @returns {Object}
 */
function buildOptimisticIOUReport(ownerEmail, userEmail, total, chatReportID, currency, locale, isSendingMoney = false) {
    const formattedTotal = NumberFormatUtils.format(locale,
        total, {
            style: 'currency',
            currency,
        });

    return {
        // If we're sending money, hasOutstandingIOU should be false
        hasOutstandingIOU: !isSendingMoney,
        cachedTotal: formattedTotal,
        chatReportID,
        currency,
        managerEmail: userEmail,
        ownerEmail,
        reportID: generateReportID(),
        state: CONST.REPORT.STATE.SUBMITTED,
        stateNum: isSendingMoney
            ? CONST.REPORT.STATE_NUM.SUBMITTED
            : CONST.REPORT.STATE_NUM.PROCESSING,
        total,
    };
}

/**
 * @param {String} type - IOUReportAction type. Can be oneOf(create, decline, cancel, pay, split)
 * @param {Number} total - IOU total in cents
 * @param {Array} participants - List of logins for the IOU participants, excluding the current user login
 * @param {String} comment - IOU comment
 * @param {String} currency - IOU currency
 * @param {String} paymentType - IOU paymentMethodType. Can be oneOf(Elsewhere, Expensify, PayPal.me)
 * @param {Boolean} isSettlingUp - Whether we are settling up an IOU
 * @returns {Array}
 */
function getIOUReportActionMessage(type, total, participants, comment, currency, paymentType = '', isSettlingUp = false) {
    const amount = NumberFormatUtils.format(preferredLocale, total / 100, {style: 'currency', currency});
    const displayNames = _.map(participants, participant => getDisplayNameForParticipant(participant.login, true));
    const who = displayNames.length < 3
        ? displayNames.join(' and ')
        : `${displayNames.slice(0, -1).join(', ')}, and ${_.last(displayNames)}`;

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
            iouMessage = `Requested ${amount} from ${who}${comment && ` for ${comment}`}`;
            break;
        case CONST.IOU.REPORT_ACTION_TYPE.SPLIT:
            iouMessage = `Split ${amount} with ${who}${comment && ` for ${comment}`}`;
            break;
        case CONST.IOU.REPORT_ACTION_TYPE.CANCEL:
            iouMessage = `Cancelled the ${amount} request${comment && ` for ${comment}`}`;
            break;
        case CONST.IOU.REPORT_ACTION_TYPE.DECLINE:
            iouMessage = `Declined the ${amount} request${comment && ` for ${comment}`}`;
            break;
        case CONST.IOU.REPORT_ACTION_TYPE.PAY:
            iouMessage = isSettlingUp
                ? `Settled up ${paymentMethodMessage}`
                : `Sent ${amount}${comment && ` for ${comment}`}${paymentMethodMessage}`;
            break;
        default:
            break;
    }

    return [{
        html: iouMessage,
        text: iouMessage,
        isEdited: false,
        type: CONST.REPORT.MESSAGE.TYPE.COMMENT,
    }];
}

/**
 * Builds an optimistic IOU reportAction object
 *
 * @param {Number} sequenceNumber - Caller is responsible for providing a best guess at what the next sequenceNumber will be.
 * @param {String} type - IOUReportAction type. Can be oneOf(create, decline, cancel, pay, split).
 * @param {Number} amount - IOU amount in cents.
 * @param {String} currency
 * @param {String} comment - User comment for the IOU.
 * @param {Array}  participants - An array with participants details.
 * @param {String} paymentType - Only required if the IOUReportAction type is 'pay'. Can be oneOf(elsewhere, payPal, Expensify).
 * @param {String} iouTransactionID - Only required if the IOUReportAction type is oneOf(cancel, decline). Generates a randomID as default.
 * @param {String} iouReportID - Only required if the IOUReportActions type is oneOf(decline, cancel, pay). Generates a randomID as default.
 * @param {String} isSettlingUp - Whether we are settling up an IOU.
 *
 * @returns {Object}
 */
function buildOptimisticIOUReportAction(sequenceNumber, type, amount, currency, comment, participants, paymentType = '', iouTransactionID = '', iouReportID = '', isSettlingUp) {
    const IOUTransactionID = iouTransactionID || NumberUtils.rand64();
    const IOUReportID = iouReportID || generateReportID();
    const originalMessage = {
        amount,
        comment,
        currency,
        IOUTransactionID,
        IOUReportID,
        type,
    };

    // We store amount, comment, currency in IOUDetails when type = pay
    if (type === CONST.IOU.REPORT_ACTION_TYPE.PAY) {
        _.each(['amount', 'comment', 'currency'], (key) => {
            delete originalMessage[key];
        });
        originalMessage.IOUDetails = {amount, comment, currency};
        originalMessage.paymentType = paymentType;
    }

    // IOUs of type split only exist in group DMs and those don't have an iouReport so we need to delete the IOUReportID key
    if (type === CONST.IOU.REPORT_ACTION_TYPE.SPLIT) {
        delete originalMessage.IOUReportID;
    }

    return {
        actionName: CONST.REPORT.ACTIONS.TYPE.IOU,
        actorAccountID: currentUserAccountID,
        actorEmail: currentUserEmail,
        automatic: false,
        avatar: lodashGet(currentUserPersonalDetails, 'avatar', getDefaultAvatar(currentUserEmail)),
        clientID: NumberUtils.generateReportActionClientID(),
        isAttachment: false,
        originalMessage,
        message: getIOUReportActionMessage(type, amount, participants, comment, currency, paymentType, isSettlingUp),
        person: [{
            style: 'strong',
            text: lodashGet(currentUserPersonalDetails, 'displayName', currentUserEmail),
            type: 'TEXT',
        }],
        reportActionID: NumberUtils.rand64(),
        sequenceNumber,
        shouldShow: true,
        created: DateUtils.getDBTime(),
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
) {
    return {
        chatType,
        hasOutstandingIOU: false,
        isOwnPolicyExpenseChat,
        isPinned: false,
        lastActorEmail: '',
        lastMessageHtml: '',
        lastMessageText: null,
        lastReadSequenceNumber: 0,
        lastActionCreated: DateUtils.getDBTime(),
        lastReadTimestamp: 0,
        maxSequenceNumber: 0,
        notificationPreference,
        oldPolicyName,
        ownerEmail,
        participants: participantList,
        policyID,
        reportID: generateReportID(),
        reportName,
        stateNum: 0,
        statusNum: 0,
        visibility,
    };
}

/**
 * Returns the necessary reportAction onyx data to indicate that the chat has been created optimistically
 * @param {String} ownerEmail
 * @returns {Object}
 */
function buildOptimisticCreatedReportAction(ownerEmail) {
    return {
        0: {
            actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
            reportActionID: NumberUtils.rand64(),
            pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            actorAccountID: currentUserAccountID,
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
            sequenceNumber: 0,
            avatar: lodashGet(allPersonalDetails, [currentUserEmail, 'avatar'], getDefaultAvatar(currentUserEmail)),
            created: DateUtils.getDBTime(),
            shouldShow: true,
        },
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
    const announceReportActionData = buildOptimisticCreatedReportAction(announceChatData.ownerEmail);

    const adminsChatData = buildOptimisticChatReport(
        [currentUserEmail],
        CONST.REPORT.WORKSPACE_CHAT_ROOMS.ADMINS,
        CONST.REPORT.CHAT_TYPE.POLICY_ADMINS,
        policyID,
        null,
        false,
        policyName,
    );
    const adminsChatReportID = adminsChatData.reportID;
    const adminsReportActionData = buildOptimisticCreatedReportAction(adminsChatData.ownerEmail);

    const expenseChatData = buildOptimisticChatReport(
        [currentUserEmail],
        '',
        CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT,
        policyID,
        currentUserEmail,
        true,
        policyName,
    );
    const expenseChatReportID = expenseChatData.reportID;
    const expenseReportActionData = buildOptimisticCreatedReportAction(expenseChatData.ownerEmail);

    return {
        announceChatReportID,
        announceChatData,
        announceReportActionData,
        adminsChatReportID,
        adminsChatData,
        adminsReportActionData,
        expenseChatReportID,
        expenseChatData,
        expenseReportActionData,
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

    const lastReadSequenceNumber = report.lastReadSequenceNumber || 0;
    const maxSequenceNumber = report.maxSequenceNumber || 0;
    return lastReadSequenceNumber < maxSequenceNumber;
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
 * @returns {Number}
 */
function getIOUTotal(report, iouReports = {}) {
    if (report.hasOutstandingIOU) {
        const iouReport = iouReports[`${ONYXKEYS.COLLECTION.REPORT}${report.iouReportID}`];
        if (iouReport) {
            return iouReport.total;
        }
    }
    return 0;
}

/**
 * @param {Object} report
 * @param {String} report.iouReportID
 * @param {String} currentUserLogin
 * @param {Object} iouReports
 * @returns {Boolean}
 */
function isIOUOwnedByCurrentUser(report, currentUserLogin, iouReports = {}) {
    if (report.hasOutstandingIOU) {
        const iouReport = iouReports[`${ONYXKEYS.COLLECTION.REPORT}${report.iouReportID}`];
        if (iouReport) {
            return iouReport.ownerEmail === currentUserLogin;
        }
    }
    return false;
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
    if (!report || !report.reportID || !report.participants || _.isEmpty(report.participants) || isIOUReport(report)) {
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

    // Include default rooms for free plan policies
    if (isDefaultRoom(report) && getPolicyType(report, policies) === CONST.POLICY.TYPE.FREE) {
        return true;
    }

    // Include default rooms unless you're on the default room beta, unless you have an assigned guide
    if (isDefaultRoom(report) && !Permissions.canUseDefaultRooms(betas) && !hasExpensifyGuidesEmails(lodashGet(report, ['participants'], []))) {
        return false;
    }

    // Include user created policy rooms if the user isn't on the policy rooms beta
    if (isUserCreatedPolicyRoom(report) && !Permissions.canUsePolicyRooms(betas)) {
        return false;
    }

    // Include policy expense chats if the user isn't in the policy expense chat beta
    if (isPolicyExpenseChat(report) && !Permissions.canUsePolicyExpenseChat(betas)) {
        return false;
    }

    return true;
}

/**
 * Attempts to find a report in onyx with the provided list of participants
 * @param {Array} newParticipantList
 * @returns {Array|undefined}
 */
function getChatByParticipants(newParticipantList) {
    newParticipantList.sort();
    return _.find(allReports, (report) => {
        // If the report has been deleted, or there are no participants (like an empty #admins room) then skip it
        if (!report || !report.participants) {
            return false;
        }
        return _.isEqual(newParticipantList, report.participants.sort());
    });
}

/**
* Returns true if Chronos is one of the chat participants (1:1)
* @param {Object} report
* @returns {Boolean}
*/
function chatIncludesChronos(report) {
    return report.participants
                && _.contains(report.participants, CONST.EMAIL.CHRONOS);
}

export {
    getReportParticipantsTitle,
    isReportMessageAttachment,
    findLastAccessedReport,
    canEditReportAction,
    canDeleteReportAction,
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
    isConciergeChatReport,
    hasExpensifyEmails,
    hasExpensifyGuidesEmails,
    hasOutstandingIOU,
    isIOUOwnedByCurrentUser,
    getIOUTotal,
    canShowReportRecipientLocalTime,
    formatReportLastMessageText,
    chatIncludesConcierge,
    isPolicyExpenseChat,
    getDefaultAvatar,
    getIcons,
    getRoomWelcomeMessage,
    getDisplayNamesWithTooltips,
    getReportName,
    navigateToDetailsPage,
    generateReportID,
    hasReportNameError,
    isUnread,
    buildOptimisticWorkspaceChats,
    buildOptimisticChatReport,
    buildOptimisticCreatedReportAction,
    buildOptimisticIOUReport,
    buildOptimisticIOUReportAction,
    buildOptimisticReportAction,
    shouldReportBeInOptionList,
    getChatByParticipants,
    getIOUReportActionMessage,
    getDisplayNameForParticipant,
    isIOUReport,
    chatIncludesChronos,
};
