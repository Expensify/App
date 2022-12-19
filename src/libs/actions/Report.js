import {Linking} from 'react-native';
import moment from 'moment';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import ExpensiMark from 'expensify-common/lib/ExpensiMark';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import * as Pusher from '../Pusher/pusher';
import LocalNotification from '../Notification/LocalNotification';
import PushNotification from '../Notification/PushNotification';
import Navigation from '../Navigation/Navigation';
import * as ActiveClientManager from '../ActiveClientManager';
import Visibility from '../Visibility';
import ROUTES from '../../ROUTES';
import * as API from '../API';
import CONFIG from '../../CONFIG';
import CONST from '../../CONST';
import Log from '../Log';
import * as LoginUtils from '../LoginUtils';
import * as ReportUtils from '../ReportUtils';
import DateUtils from '../DateUtils';
import * as ReportActionsUtils from '../ReportActionsUtils';
import * as OptionsListUtils from '../OptionsListUtils';

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

const allReports = {};
let conciergeChatReportID;
const typingWatchTimers = {};

/**
 * @param {String} reportID
 * @returns {Number}
 */
function getLastReadSequenceNumber(reportID) {
    return lodashGet(allReports, [reportID, 'lastReadSequenceNumber'], 0);
}

/**
 * @param {String} reportID
 * @returns {Number}
 */
function getMaxSequenceNumber(reportID) {
    return lodashGet(allReports, [reportID, 'maxSequenceNumber'], 0);
}

/**
 * @param {Object} report
 * @return {String[]}
 */
function getParticipantEmailsFromReport({sharedReportList, reportNameValuePairs, ownerEmail}) {
    const emailArray = _.map(sharedReportList, participant => participant.email);
    if (ReportUtils.isChatRoom(reportNameValuePairs)) {
        return emailArray;
    }
    if (ReportUtils.isPolicyExpenseChat(reportNameValuePairs)) {
        // The owner of the policyExpenseChat isn't in the sharedReportsList so they need to be explicitly included.
        return [ownerEmail, ...emailArray];
    }

    // The current user is excluded from the participants array in DMs/Group DMs because their participation is implied
    // by the chat being shared to them. This also prevents the user's own avatar from being a part of the chat avatar.
    return _.without(emailArray, currentUserEmail);
}

/**
 * Only store the minimal amount of data in Onyx that needs to be stored
 * because space is limited.
 *
 * @param {Object} report
 * @param {Number} report.reportID
 * @param {String} report.reportName
 * @param {Object} report.reportNameValuePairs
 * @returns {Object}
 */
function getSimplifiedReportObject(report) {
    const lastActionCreated = lodashGet(report, 'lastActionCreated', 0);
    const lastActionMessage = lodashGet(report, ['lastActionMessage', 'html'], '');
    const isLastMessageAttachment = new RegExp(`<img|a\\s[^>]*${CONST.ATTACHMENT_SOURCE_ATTRIBUTE}\\s*=\\s*"[^"]*"[^>]*>`, 'gi').test(lastActionMessage);
    const chatType = lodashGet(report, ['reportNameValuePairs', 'chatType'], '');

    let lastMessageText = null;
    if (report.reportActionCount > 0) {
        // We are removing any html tags from the message html since we cannot access the text version of any comments as
        // the report only has the raw reportActionList and not the processed version returned by Report_GetHistory
        const parser = new ExpensiMark();
        lastMessageText = parser.htmlToText(lastActionMessage);
        lastMessageText = ReportUtils.formatReportLastMessageText(lastMessageText);
    }

    // Used for archived rooms, will store the policy name that the room used to belong to.
    const oldPolicyName = lodashGet(report, ['reportNameValuePairs', 'oldPolicyName'], '').toString();

    const lastActorEmail = lodashGet(report, 'lastActionActorEmail', '');
    const notificationPreference = lodashGet(report, ['reportNameValuePairs', 'notificationPreferences', currentUserAccountID], CONST.REPORT.NOTIFICATION_PREFERENCE.DAILY);

    // Used for User Created Policy Rooms, will denote how access to a chat room is given among workspace members
    const visibility = lodashGet(report, ['reportNameValuePairs', 'visibility']);
    const lastReadSequenceNumber = lodashGet(report, [
        'reportNameValuePairs',
        `lastRead_${currentUserAccountID}`,
        'sequenceNumber',
    ]);

    return {
        // This needs to be cast to a string until the IOU API has been fully migrated to OfflineFirst API
        reportID: report.reportID.toString(),
        reportName: report.reportName,
        chatType,
        ownerEmail: LoginUtils.getEmailWithoutMergedAccountPrefix(lodashGet(report, ['ownerEmail'], '')),
        policyID: lodashGet(report, ['reportNameValuePairs', 'expensify_policyID'], ''),
        maxSequenceNumber: lodashGet(report, 'reportActionCount', 0),
        participants: getParticipantEmailsFromReport(report),
        isPinned: report.isPinned,
        lastReadTimestamp: lodashGet(report, [
            'reportNameValuePairs',
            `lastRead_${currentUserAccountID}`,
            'timestamp',
        ], 0),
        lastReadSequenceNumber,
        lastActionCreated,
        lastMessageText: isLastMessageAttachment ? '[Attachment]' : lastMessageText,
        lastActorEmail,
        notificationPreference,
        stateNum: report.state,
        statusNum: report.status,
        oldPolicyName,
        visibility,
        isOwnPolicyExpenseChat: lodashGet(report, ['isOwnPolicyExpenseChat'], false),
        lastMessageHtml: lastActionMessage,
    };
}

/**
 * Get a simplified version of an IOU report
 *
 * @param {Object} reportData
 * @param {String} reportData.transactionID
 * @param {Number} reportData.amount
 * @param {String} reportData.currency
 * @param {String} reportData.created
 * @param {String} reportData.comment
 * @param {Object[]} reportData.transactionList
 * @param {String} reportData.ownerEmail
 * @param {String} reportData.managerEmail
 * @param {Number} reportData.reportID
 * @param {Number|String} chatReportID
 * @returns {Object}
 */
function getSimplifiedIOUReport(reportData, chatReportID) {
    return {
        reportID: reportData.reportID,
        ownerEmail: reportData.ownerEmail,
        managerEmail: reportData.managerEmail,
        currency: reportData.currency,
        chatReportID: Number(chatReportID),
        state: reportData.state,
        cachedTotal: reportData.cachedTotal,
        total: reportData.total,
        status: reportData.status,
        stateNum: reportData.stateNum,
        submitterPayPalMeAddress: reportData.submitterPayPalMeAddress,
        submitterPhoneNumbers: reportData.submitterPhoneNumbers,
        hasOutstandingIOU: reportData.stateNum === CONST.REPORT.STATE_NUM.PROCESSING && reportData.total !== 0,
    };
}

/**
 * Get the private pusher channel name for a Report.
 *
 * @param {String} reportID
 * @returns {String}
 */
function getReportChannelName(reportID) {
    return `${CONST.PUSHER.PRIVATE_REPORT_CHANNEL_PREFIX}${reportID}${CONFIG.PUSHER.SUFFIX}`;
}

/**
 * Setup reportComment push notification callbacks.
 */
function subscribeToReportCommentPushNotifications() {
    PushNotification.onReceived(PushNotification.TYPE.REPORT_COMMENT, ({reportID, onyxData}) => {
        Log.info('[Report] Handled event sent by Airship', false, {reportID});
        Onyx.update(onyxData);
    });

    // Open correct report when push notification is clicked
    PushNotification.onSelected(PushNotification.TYPE.REPORT_COMMENT, ({reportID}) => {
        if (Navigation.canNavigate('navigate')) {
            // If a chat is visible other than the one we are trying to navigate to, then we need to navigate back
            if (Navigation.getActiveRoute().slice(1, 2) === ROUTES.REPORT && !Navigation.isActiveRoute(`r/${reportID}`)) {
                Navigation.goBack();
            }
            Navigation.navigate(ROUTES.getReportRoute(reportID));
        } else {
            // Navigation container is not yet ready, use deeplinking to open to correct report instead
            Navigation.setDidTapNotification();
            Linking.openURL(`${CONST.DEEPLINK_BASE_URL}${ROUTES.getReportRoute(reportID)}`);
        }
    });
}

/**
 * There are 2 possibilities that we can receive via pusher for a user's typing status:
 * 1. The "new" way from New Expensify is passed as {[login]: Boolean} (e.g. {yuwen@expensify.com: true}), where the value
 * is whether the user with that login is typing on the report or not.
 * 2. The "old" way from e.com which is passed as {userLogin: login} (e.g. {userLogin: bstites@expensify.com})
 *
 * This method makes sure that no matter which we get, we return the "new" format
 *
 * @param {Object} typingStatus
 * @returns {Object}
 */
function getNormalizedTypingStatus(typingStatus) {
    let normalizedTypingStatus = typingStatus;

    if (_.first(_.keys(typingStatus)) === 'userLogin') {
        normalizedTypingStatus = {[typingStatus.userLogin]: true};
    }

    return normalizedTypingStatus;
}

/**
 * Initialize our pusher subscriptions to listen for someone typing in a report.
 *
 * @param {String} reportID
 */
function subscribeToReportTypingEvents(reportID) {
    if (!reportID) {
        return;
    }

    // Make sure we have a clean Typing indicator before subscribing to typing events
    Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_USER_IS_TYPING}${reportID}`, {});

    const pusherChannelName = getReportChannelName(reportID);
    Pusher.subscribe(pusherChannelName, 'client-userIsTyping', (typingStatus) => {
        const normalizedTypingStatus = getNormalizedTypingStatus(typingStatus);
        const login = _.first(_.keys(normalizedTypingStatus));

        if (!login) {
            return;
        }

        // Don't show the typing indicator if a user is typing on another platform
        if (login === currentUserEmail) {
            return;
        }

        // Use a combo of the reportID and the login as a key for holding our timers.
        const reportUserIdentifier = `${reportID}-${login}`;
        clearTimeout(typingWatchTimers[reportUserIdentifier]);
        Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_USER_IS_TYPING}${reportID}`, normalizedTypingStatus);

        // Wait for 1.5s of no additional typing events before setting the status back to false.
        typingWatchTimers[reportUserIdentifier] = setTimeout(() => {
            const typingStoppedStatus = {};
            typingStoppedStatus[login] = false;
            Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_USER_IS_TYPING}${reportID}`, typingStoppedStatus);
            delete typingWatchTimers[reportUserIdentifier];
        }, 1500);
    })
        .catch((error) => {
            Log.hmmm('[Report] Failed to initially subscribe to Pusher channel', false, {errorType: error.type, pusherChannelName});
        });
}

/**
 * Remove our pusher subscriptions to listen for someone typing in a report.
 *
 * @param {String} reportID
 */
function unsubscribeFromReportChannel(reportID) {
    if (!reportID) {
        return;
    }

    const pusherChannelName = getReportChannelName(reportID);
    Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_USER_IS_TYPING}${reportID}`, {});
    Pusher.unsubscribe(pusherChannelName);
}

/**
 * Add up to two report actions to a report. This method can be called for the following situations:
 *
 * - Adding one comment
 * - Adding one attachment
 * - Add both a comment and attachment simultaneously
 *
 * @param {String} reportID
 * @param {String} [text]
 * @param {Object} [file]
 */
function addActions(reportID, text = '', file) {
    let reportCommentText = '';
    let reportCommentAction;
    let attachmentAction;
    let commandName = 'AddComment';

    const highestSequenceNumber = getMaxSequenceNumber(reportID);

    if (text) {
        const nextSequenceNumber = highestSequenceNumber + 1;
        const reportComment = ReportUtils.buildOptimisticReportAction(nextSequenceNumber, text);
        reportCommentAction = reportComment.reportAction;
        reportCommentText = reportComment.commentText;
    }

    if (file) {
        const nextSequenceNumber = (text && file) ? highestSequenceNumber + 2 : highestSequenceNumber + 1;

        // When we are adding an attachment we will call AddAttachment.
        // It supports sending an attachment with an optional comment and AddComment supports adding a single text comment only.
        commandName = 'AddAttachment';
        const attachment = ReportUtils.buildOptimisticReportAction(nextSequenceNumber, '', file);
        attachmentAction = attachment.reportAction;
    }

    // Always prefer the file as the last action over text
    const lastAction = attachmentAction || reportCommentAction;

    // Our report needs a new maxSequenceNumber that is n larger than the current depending on how many actions we are adding.
    const actionCount = text && file ? 2 : 1;
    const newSequenceNumber = highestSequenceNumber + actionCount;

    // Update the report in Onyx to have the new sequence number
    const optimisticReport = {
        maxSequenceNumber: newSequenceNumber,
        lastActionCreated: DateUtils.getDBTime(),
        lastMessageText: ReportUtils.formatReportLastMessageText(lastAction.message[0].text),
        lastActorEmail: currentUserEmail,
        lastReadSequenceNumber: newSequenceNumber,
    };

    // Optimistically add the new actions to the store before waiting to save them to the server. We use the clientID
    // so that we can later unset these messages via the server by sending {[clientID]: null}
    const optimisticReportActions = {};
    if (text) {
        optimisticReportActions[reportCommentAction.clientID] = reportCommentAction;
    }
    if (file) {
        optimisticReportActions[attachmentAction.clientID] = attachmentAction;
    }

    const parameters = {
        reportID,
        reportActionID: file ? attachmentAction.reportActionID : reportCommentAction.reportActionID,
        commentReportActionID: file && reportCommentAction ? reportCommentAction.reportActionID : null,
        reportComment: reportCommentText,
        clientID: lastAction.clientID,
        commentClientID: lodashGet(reportCommentAction, 'clientID', ''),
        file,
    };

    const optimisticData = [
        {
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: optimisticReport,
        },
        {
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: optimisticReportActions,
        },
    ];

    // Update the timezone if it's been 5 minutes from the last time the user added a comment
    if (DateUtils.canUpdateTimezone()) {
        const timezone = DateUtils.getCurrentTimezone();
        parameters.timezone = JSON.stringify(timezone);
        optimisticData.push({
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: ONYXKEYS.PERSONAL_DETAILS,
            value: {[currentUserEmail]: {timezone}},
        });
        DateUtils.setTimezoneUpdated();
    }

    API.write(commandName, parameters, {
        optimisticData,
    });
}

/**
 *
 * Add an attachment and optional comment.
 *
 * @param {String} reportID
 * @param {File} file
 * @param {String} [text]
 */
function addAttachment(reportID, file, text = '') {
    addActions(reportID, text, file);
}

/**
 * Add a single comment to a report
 *
 * @param {String} reportID
 * @param {String} text
 */
function addComment(reportID, text) {
    addActions(reportID, text);
}

/**
 * Gets the latest page of report actions and updates the last read message
 * If a chat with the passed reportID is not found, we will create a chat based on the passed participantList
 *
 * @param {String} reportID
 * @param {Array} participantList The list of users that are included in a new chat, not including the user creating it
 * @param {Object} newReportObject The optimistic report object created when making a new chat, saved as optimistic data
 */
function openReport(reportID, participantList = [], newReportObject = {}) {
    const onyxData = {
        optimisticData: [{
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                isLoadingReportActions: true,
                isLoadingMoreReportActions: false,
                lastReadTimestamp: Date.now(),
                lastReadSequenceNumber: getMaxSequenceNumber(reportID),
                reportName: lodashGet(allReports, [reportID, 'reportName'], CONST.REPORT.DEFAULT_REPORT_NAME),
            },
        }],
        successData: [{
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                isLoadingReportActions: false,
                pendingFields: {
                    createChat: null,
                },
                errorFields: {
                    createChat: null,
                },
                isOptimisticReport: false,
            },
        }],
    };

    // If we are creating a new report, we need to add the optimistic report data and a report action
    if (!_.isEmpty(newReportObject)) {
        onyxData.optimisticData[0].value = {
            ...onyxData.optimisticData[0].value,
            ...newReportObject,
            pendingFields: {
                createChat: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            },
            isOptimisticReport: true,
        };

        // Change the method to set for new reports because it doesn't exist yet, is faster,
        // and we need the data to be available when we navigate to the chat page
        onyxData.optimisticData[0].onyxMethod = CONST.ONYX.METHOD.SET;

        // Also create a report action so that the page isn't endlessly loading
        onyxData.optimisticData[1] = {
            onyxMethod: CONST.ONYX.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: ReportUtils.buildOptimisticCreatedReportAction(newReportObject.ownerEmail),
        };
    }
    API.write('OpenReport',
        {
            reportID,
            emailList: participantList ? participantList.join(',') : '',
        },
        onyxData);
}

/**
 * This will find an existing chat, or create a new one if none exists, for the given user or set of users. It will then navigate to this chat.
 *
 * @param {Array} userLogins list of user logins.
 */
function navigateToAndOpenReport(userLogins) {
    const formattedUserLogins = _.map(userLogins, login => OptionsListUtils.addSMSDomainIfPhoneNumber(login).toLowerCase());
    let newChat = {};
    const chat = ReportUtils.getChatByParticipants(formattedUserLogins);
    if (!chat) {
        newChat = ReportUtils.buildOptimisticChatReport(formattedUserLogins);
    }
    const reportID = chat ? chat.reportID : newChat.reportID;

    // We want to pass newChat here because if anything is passed in that param (even an existing chat), we will try to create a chat on the server
    openReport(reportID, newChat.participants, newChat);
    Navigation.navigate(ROUTES.getReportRoute(reportID));
}

/**
 * Get the latest report history without marking the report as read.
 *
 * @param {String} reportID
 */
function reconnect(reportID) {
    API.write('ReconnectToReport',
        {reportID},
        {
            optimisticData: [{
                onyxMethod: CONST.ONYX.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
                value: {
                    isLoadingReportActions: true,
                    isLoadingMoreReportActions: false,
                },
            }],
            successData: [{
                onyxMethod: CONST.ONYX.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
                value: {
                    isLoadingReportActions: false,
                },
            }],
            failureData: [{
                onyxMethod: CONST.ONYX.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
                value: {
                    isLoadingReportActions: false,
                },
            }],
        });
}

/**
 * Gets the older actions that have not been read yet.
 * Normally happens when you scroll up on a chat, and the actions have not been read yet.
 *
 * @param {String} reportID
 * @param {Number} oldestActionSequenceNumber
 */
function readOldestAction(reportID, oldestActionSequenceNumber) {
    API.read('ReadOldestAction',
        {
            reportID,
            reportActionsOffset: oldestActionSequenceNumber,
        },
        {
            optimisticData: [{
                onyxMethod: CONST.ONYX.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
                value: {
                    isLoadingMoreReportActions: true,
                },
            }],
            successData: [{
                onyxMethod: CONST.ONYX.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
                value: {
                    isLoadingMoreReportActions: false,
                },
            }],
            failureData: [{
                onyxMethod: CONST.ONYX.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
                value: {
                    isLoadingMoreReportActions: false,
                },
            }],
        });
}

/**
 * Gets the IOUReport and the associated report actions.
 *
 * @param {Number} chatReportID
 * @param {Number} iouReportID
 */
function openPaymentDetailsPage(chatReportID, iouReportID) {
    API.read('OpenPaymentDetailsPage', {
        reportID: chatReportID,
        iouReportID,
    });
}

/**
 * Marks the new report actions as read
 *
 * @param {String} reportID
 * @param {String} createdDate
 */
function readNewestAction(reportID, createdDate) {
    const sequenceNumber = getMaxSequenceNumber(reportID);
    API.write('ReadNewestAction',
        {
            reportID,
            createdDate,
            sequenceNumber,
        },
        {
            optimisticData: [{
                onyxMethod: CONST.ONYX.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
                value: {
                    lastReadSequenceNumber: sequenceNumber,
                    lastReadTimestamp: Date.now(),
                },
            }],
        });
}

/**
 * Sets the last read comment on a report
 *
 * @param {String} reportID
 * @param {String} createdDate
 * @param {Number} sequenceNumber
 */
function markCommentAsUnread(reportID, createdDate, sequenceNumber) {
    const newLastReadSequenceNumber = sequenceNumber - 1;
    API.write('MarkAsUnread',
        {
            reportID,

            // We subtract 1 millisecond so that the lastRead is updated to just before this reportAction's created date
            createdDate: DateUtils.getDBTime(moment.utc(createdDate).valueOf() - 1),
            sequenceNumber,
        },
        {
            optimisticData: [{
                onyxMethod: CONST.ONYX.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
                value: {
                    lastReadSequenceNumber: newLastReadSequenceNumber,
                    lastReadTimestamp: Date.now(),
                },
            }],
        });
}

/**
 * Toggles the pinned state of the report.
 *
 * @param {Object} report
 */
function togglePinnedState(report) {
    const pinnedValue = !report.isPinned;

    // Optimistically pin/unpin the report before we send out the command
    const optimisticData = [
        {
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`,
            value: {isPinned: pinnedValue},
        },
    ];

    API.write('TogglePinnedChat', {
        reportID: report.reportID,
        pinnedValue,
    }, {optimisticData});
}

/**
 * Saves the comment left by the user as they are typing. By saving this data the user can switch between chats, close
 * tab, refresh etc without worrying about loosing what they typed out.
 *
 * @param {String} reportID
 * @param {String} comment
 */
function saveReportComment(reportID, comment) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${reportID}`, comment);
}

/**
 * Immediate indication whether the report has a draft comment.
 *
 * @param {String} reportID
 * @param {Boolean} hasDraft
 * @returns {Promise}
 */
function setReportWithDraft(reportID, hasDraft) {
    return Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {hasDraft});
}

/**
 * Broadcasts whether or not a user is typing on a report over the report's private pusher channel.
 *
 * @param {String} reportID
 */
function broadcastUserIsTyping(reportID) {
    const privateReportChannelName = getReportChannelName(reportID);
    const typingStatus = {};
    typingStatus[currentUserEmail] = true;
    Pusher.sendEvent(privateReportChannelName, 'client-userIsTyping', typingStatus);
}

/**
 * When a report changes in Onyx, this fetches the report from the API if the report doesn't have a name
 * and it keeps track of the max sequence number on the report actions.
 *
 * @param {Object} report
 */
function handleReportChanged(report) {
    if (!report || ReportUtils.isIOUReport(report)) {
        return;
    }

    if (report && report.reportID) {
        allReports[report.reportID] = report;

        if (ReportUtils.isConciergeChatReport(report)) {
            conciergeChatReportID = report.reportID;
        }
    }

    // A report can be missing a name if a comment is received via pusher event
    // and the report does not yet exist in Onyx (eg. a new DM created with the logged in person)
    if (report.reportID && report.reportName === undefined) {
        openReport(report.reportID);
    }
}

Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT,
    callback: handleReportChanged,
});

/**
 * Deletes a comment from the report, basically sets it as empty string
 *
 * @param {String} reportID
 * @param {Object} reportAction
 */
function deleteReportComment(reportID, reportAction) {
    const sequenceNumber = reportAction.sequenceNumber;
    const deletedMessage = [{
        type: 'COMMENT',
        html: '',
        text: '',
        isEdited: true,
    }];
    const optimisticReportActions = {
        [sequenceNumber]: {
            pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
            previousMessage: reportAction.message,
            message: deletedMessage,
        },
    };

    // If we are deleting the last visible message, let's find the previous visible one and update the lastMessageText in the LHN.
    // Similarly, if we are deleting the last read comment we will want to update the lastReadSequenceNumber and maxSequenceNumber to use the previous visible message.
    const lastMessageText = ReportActionsUtils.getLastVisibleMessageText(reportID, optimisticReportActions);
    const lastReadSequenceNumber = ReportActionsUtils.getOptimisticLastReadSequenceNumberForDeletedAction(
        reportID,
        optimisticReportActions,
        reportAction.sequenceNumber,
        getLastReadSequenceNumber(reportID),
    );
    const optimisticReport = {
        lastMessageText,
        lastReadSequenceNumber,
        maxSequenceNumber: lastReadSequenceNumber,
    };

    // If the API call fails we must show the original message again, so we revert the message content back to how it was
    // and and remove the pendingAction so the strike-through clears
    const failureData = [
        {
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: {
                [sequenceNumber]: {
                    message: reportAction.message,
                    pendingAction: null,
                    previousMessage: null,
                },
            },
        },
    ];

    const successData = [
        {
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: {
                [sequenceNumber]: {
                    pendingAction: null,
                    previousMessage: null,
                },
            },
        },
    ];

    const optimisticData = [
        {
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: optimisticReportActions,
        },
        {
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: optimisticReport,
        },
    ];

    const parameters = {
        reportID,
        sequenceNumber,
        reportActionID: reportAction.reportActionID,
    };
    API.write('DeleteComment', parameters, {optimisticData, successData, failureData});
}

/**
 * @param {String} comment
 * @returns {Array}
 */
const extractLinksInMarkdownComment = (comment) => {
    const regex = /\[[^[\]]*\]\(([^()]*)\)/gm;
    const matches = [...comment.matchAll(regex)];

    // Element 1 from match is the regex group if it exists which contains the link URLs
    const links = _.map(matches, match => match[1]);
    return links;
};

/**
 * Compares two markdown comments and returns a list of the links removed in a new comment.
 *
 * @param {String} oldComment
 * @param {String} newComment
 * @returns {Array}
 */
const getRemovedMarkdownLinks = (oldComment, newComment) => {
    const linksInOld = extractLinksInMarkdownComment(oldComment);
    const linksInNew = extractLinksInMarkdownComment(newComment);
    return _.difference(linksInOld, linksInNew);
};

/**
 * Removes the links in a markdown comment.
 * example:
 *      comment="test [link](https://www.google.com) test",
 *      links=["https://www.google.com"]
 * returns: "test link test"
 * @param {String} comment
 * @param {Array} links
 * @returns {String}
 */
const removeLinks = (comment, links) => {
    let commentCopy = comment.slice();
    _.forEach(links, (link) => {
        const regex = new RegExp(`\\[([^\\[\\]]*)\\]\\(${link}\\)`, 'gm');
        const linkMatch = regex.exec(commentCopy);
        const linkText = linkMatch && linkMatch[1];
        commentCopy = commentCopy.replace(`[${linkText}](${link})`, linkText);
    });
    return commentCopy;
};

/**
 * This function will handle removing only links that were purposely removed by the user while editing.
 * @param {String} newCommentText text of the comment after editing.
 * @param {Array} originalHtml original html of the comment before editing
 * @returns {String}
 */
const handleUserDeletedLinks = (newCommentText, originalHtml) => {
    const parser = new ExpensiMark();
    const htmlWithAutoLinks = parser.replace(newCommentText);
    const markdownWithAutoLinks = parser.htmlToMarkdown(htmlWithAutoLinks);
    const markdownOriginalComment = parser.htmlToMarkdown(originalHtml);
    const removedLinks = getRemovedMarkdownLinks(markdownOriginalComment, newCommentText);
    return removeLinks(markdownWithAutoLinks, removedLinks);
};

/**
 * Saves a new message for a comment. Marks the comment as edited, which will be reflected in the UI.
 *
 * @param {String} reportID
 * @param {Object} originalReportAction
 * @param {String} textForNewComment
 */
function editReportComment(reportID, originalReportAction, textForNewComment) {
    const parser = new ExpensiMark();

    // Do not autolink if someone explicitly tries to remove a link from message.
    // https://github.com/Expensify/App/issues/9090
    // https://github.com/Expensify/App/issues/13221
    const originalCommentHTML = lodashGet(originalReportAction, 'message[0].html');
    const markdownForNewComment = handleUserDeletedLinks(textForNewComment, originalCommentHTML);

    const autolinkFilter = {filterRules: _.filter(_.pluck(parser.rules, 'name'), name => name !== 'autolink')};
    const htmlForNewComment = parser.replace(markdownForNewComment, autolinkFilter);
    const parsedOriginalCommentHTML = parser.replace(originalCommentHTML, autolinkFilter);

    //  Delete the comment if it's empty
    if (_.isEmpty(htmlForNewComment)) {
        deleteReportComment(reportID, originalReportAction);
        return;
    }

    // Skip the Edit if message is not changed
    if (parsedOriginalCommentHTML === htmlForNewComment.trim()) {
        return;
    }

    // Optimistically update the reportAction with the new message
    const sequenceNumber = originalReportAction.sequenceNumber;
    const optimisticReportActions = {
        [sequenceNumber]: {
            pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
            message: [{
                isEdited: true,
                html: htmlForNewComment,
                text: markdownForNewComment,
                type: originalReportAction.message[0].type,
            }],
        },
    };

    const optimisticData = [
        {
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: optimisticReportActions,
        },
    ];

    const failureData = [
        {
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: {
                [sequenceNumber]: {
                    ...originalReportAction,
                    pendingAction: null,
                },
            },
        },
    ];

    const successData = [
        {
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: {
                [sequenceNumber]: {
                    pendingAction: null,
                },
            },
        },
    ];

    const parameters = {
        reportID,
        sequenceNumber,
        reportComment: htmlForNewComment,
        reportActionID: originalReportAction.reportActionID,
    };
    API.write('UpdateComment', parameters, {optimisticData, successData, failureData});
}

/**
 * Saves the draft for a comment report action. This will put the comment into "edit mode"
 *
 * @param {String} reportID
 * @param {Number} reportActionID
 * @param {String} draftMessage
 */
function saveReportActionDraft(reportID, reportActionID, draftMessage) {
    Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${reportID}_${reportActionID}`, draftMessage);
}

/**
 * Syncs up a chat report and an IOU report in Onyx after an IOU transaction has been made
 * by setting the iouReportID and hasOutstandingIOU for the chat report.
 * Even though both reports are updated in the back-end, the API doesn't handle syncing their reportIDs.
 * If we didn't sync these reportIDs, the paid IOU would still be shown to users as unpaid.
 * The iouReport being fetched here must be open, because only an open iouReport can be paid.
 *
 * @param {Object} chatReport
 * @param {Object} iouReport
 */
function syncChatAndIOUReports(chatReport, iouReport) {
    // Return early in case there's a back-end issue preventing the IOU command from returning the report objects.
    if (!chatReport || !iouReport) {
        return;
    }

    const simplifiedIouReport = {};
    const simplifiedReport = {};
    const chatReportKey = `${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`;
    const iouReportKey = `${ONYXKEYS.COLLECTION.REPORT}${iouReport.reportID}`;

    // We don't want to sync an iou report that's already been reimbursed with its chat report.
    if (!iouReport.stateNum === CONST.REPORT.STATE_NUM.SUBMITTED) {
        simplifiedReport[chatReportKey].iouReportID = iouReport.reportID;
    }
    simplifiedReport[chatReportKey] = getSimplifiedReportObject(chatReport);
    simplifiedReport[chatReportKey].hasOutstandingIOU = iouReport.stateNum
        === CONST.REPORT.STATE_NUM.PROCESSING && iouReport.total !== 0;
    simplifiedIouReport[iouReportKey] = getSimplifiedIOUReport(iouReport, chatReport.reportID);
    Onyx.mergeCollection(ONYXKEYS.COLLECTION.REPORT, simplifiedIouReport);
    Onyx.mergeCollection(ONYXKEYS.COLLECTION.REPORT, simplifiedReport);
}

/**
 * @param {String} reportID
 * @param {String} previousValue
 * @param {String} newValue
 */
function updateNotificationPreference(reportID, previousValue, newValue) {
    const optimisticData = [
        {
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {notificationPreference: newValue},
        },
    ];
    const failureData = [
        {
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {notificationPreference: previousValue},
        },
    ];
    API.write('UpdateReportNotificationPreference', {reportID, notificationPreference: newValue}, {optimisticData, failureData});
}

/**
 * Navigates to the 1:1 report with Concierge
 */
function navigateToConciergeChat() {
    // If we don't have a chat with Concierge then create it
    if (!conciergeChatReportID) {
        navigateToAndOpenReport([CONST.EMAIL.CONCIERGE]);
        return;
    }

    Navigation.navigate(ROUTES.getReportRoute(conciergeChatReportID));
}

/**
 * Add a policy report (workspace room) optimistically and navigate to it.
 *
 * @param {Object} policy
 * @param {String} reportName
 * @param {String} visibility
 */
function addPolicyReport(policy, reportName, visibility) {
    // The participants include the current user (admin) and the employees. Participants must not be empty.
    const participants = _.unique([currentUserEmail, ..._.pluck(policy.employeeList, 'email')]);
    const policyReport = ReportUtils.buildOptimisticChatReport(
        participants,
        reportName,
        CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
        policy.id,
        CONST.REPORT.OWNER_EMAIL_FAKE,
        false,
        '',
        visibility,

        // The room might contain all policy members so notifying always should be opt-in only.
        CONST.REPORT.NOTIFICATION_PREFERENCE.DAILY,
    );

    // Onyx.set is used on the optimistic data so that it is present before navigating to the workspace room. With Onyx.merge the workspace room reportID is not present when
    // fetchReportIfNeeded is called on the ReportScreen, so openReport is called which is unnecessary since the optimistic data will be stored in Onyx.
    // Therefore, Onyx.set is used instead of Onyx.merge.
    const optimisticData = [
        {
            onyxMethod: CONST.ONYX.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT}${policyReport.reportID}`,
            value: {
                pendingFields: {
                    addWorkspaceRoom: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                },
                ...policyReport,
            },
        },
        {
            onyxMethod: CONST.ONYX.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${policyReport.reportID}`,
            value: ReportUtils.buildOptimisticCreatedReportAction(policyReport.ownerEmail),
        },
    ];
    const successData = [
        {
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${policyReport.reportID}`,
            value: {
                pendingFields: {
                    addWorkspaceRoom: null,
                },
            },
        },
        {
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${policyReport.reportID}`,
            value: {
                0: {
                    pendingAction: null,
                },
            },
        },
    ];

    API.write(
        'AddWorkspaceRoom',
        {
            policyID: policyReport.policyID,
            reportName,
            visibility,
            reportID: policyReport.reportID,
        },
        {optimisticData, successData},
    );
    Navigation.navigate(ROUTES.getReportRoute(policyReport.reportID));
}

/**
 * @param {String} reportID The reportID of the policy report (workspace room)
 */
function navigateToConciergeChatAndDeleteReport(reportID) {
    navigateToConciergeChat();
    Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, null);
    Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, null);
}

/**
 * @param {Object} policyRoomReport
 * @param {Number} policyRoomReport.reportID
 * @param {String} policyRoomReport.reportName
 * @param {String} policyRoomName The updated name for the policy room
 */
function updatePolicyRoomName(policyRoomReport, policyRoomName) {
    const reportID = policyRoomReport.reportID;
    const previousName = policyRoomReport.reportName;
    const optimisticData = [
        {
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                reportName: policyRoomName,
                pendingFields: {
                    reportName: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                },
                errorFields: {
                    reportName: null,
                },
            },
        },
    ];
    const successData = [
        {

            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                pendingFields: {
                    reportName: null,
                },
            },
        },
    ];
    const failureData = [
        {

            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                reportName: previousName,
            },
        },
    ];
    API.write('UpdatePolicyRoomName', {reportID, policyRoomName}, {optimisticData, successData, failureData});
}

/**
 * @param {String} reportID The reportID of the policy room.
 */
function clearPolicyRoomNameErrors(reportID) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {
        errorFields: {
            reportName: null,
        },
        pendingFields: {
            reportName: null,
        },
    });
}

/**
 * @param {String} reportID
 * @param {Boolean} isComposerFullSize
 */
function setIsComposerFullSize(reportID, isComposerFullSize) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_IS_COMPOSER_FULL_SIZE}${reportID}`, isComposerFullSize);
}

const defaultNewActionSubscriber = {
    reportID: '',
    callback: () => {},
};

let newActionSubscriber = defaultNewActionSubscriber;

/**
 * Enables the Report actions file to let the ReportActionsView know that a new comment has arrived in realtime for the current report
 *
 * @param {String} reportID
 * @param {Function} callback
 * @returns {Function}
 */
function subscribeToNewActionEvent(reportID, callback) {
    newActionSubscriber = {callback, reportID};
    return () => {
        newActionSubscriber = defaultNewActionSubscriber;
    };
}

/**
 * @param {String} reportID
 * @param {Object} action
 */
function viewNewReportAction(reportID, action) {
    const isFromCurrentUser = action.actorAccountID === currentUserAccountID;
    const updatedReportObject = {};

    // When handling an action from the current user we can assume that their last read actionID has been updated in the server,
    // but not necessarily reflected locally so we will update the lastReadSequenceNumber to mark the report as read.
    updatedReportObject.maxSequenceNumber = action.sequenceNumber;
    if (isFromCurrentUser) {
        updatedReportObject.lastReadTimestamp = Date.now();
        updatedReportObject.lastReadSequenceNumber = action.sequenceNumber;
    }

    if (reportID === newActionSubscriber.reportID) {
        newActionSubscriber.callback(isFromCurrentUser, updatedReportObject.maxSequenceNumber);
    }

    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, updatedReportObject);

    const notificationPreference = lodashGet(allReports, [reportID, 'notificationPreference'], CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS);
    if (!ActiveClientManager.isClientTheLeader()) {
        Log.info('[LOCAL_NOTIFICATION] Skipping notification because this client is not the leader');
        return;
    }

    // We don't want to send a local notification if the user preference is daily or mute
    if (notificationPreference === CONST.REPORT.NOTIFICATION_PREFERENCE.MUTE || notificationPreference === CONST.REPORT.NOTIFICATION_PREFERENCE.DAILY) {
        Log.info(`[LOCAL_NOTIFICATION] No notification because user preference is to be notified: ${notificationPreference}`);
        return;
    }

    // If this comment is from the current user we don't want to parrot whatever they wrote back to them.
    if (isFromCurrentUser) {
        Log.info('[LOCAL_NOTIFICATION] No notification because comment is from the currently logged in user');
        return;
    }

    // If we are currently viewing this report do not show a notification.
    if (reportID === Navigation.getReportIDFromRoute() && Visibility.isVisible()) {
        Log.info('[LOCAL_NOTIFICATION] No notification because it was a comment for the current report');
        return;
    }

    // If the comment came from Concierge let's not show a notification since we already show one for expensify.com
    if (lodashGet(action, 'actorEmail') === CONST.EMAIL.CONCIERGE) {
        return;
    }

    // Don't show a notification if no comment exists
    if (!_.some(action.message, f => f.type === 'COMMENT')) {
        Log.info('[LOCAL_NOTIFICATION] No notification because no comments exist for the current report');
        return;
    }

    Log.info('[LOCAL_NOTIFICATION] Creating notification');
    LocalNotification.showCommentNotification({
        reportAction: action,
        onClick: () => {
            // Navigate to this report onClick
            Navigation.navigate(ROUTES.getReportRoute(reportID));
        },
    });
}

/**
 * Clear the errors associated with the IOUs of a given report.
 *
 * @param {String} reportID
 */
function clearIOUError(reportID) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {errorFields: {iou: null}});
}

// We are using this map to ensure actions are only handled once
const handledReportActions = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
    initWithStoredValues: false,
    callback: (actions, key) => {
        // reportID can be derived from the Onyx key
        const reportID = key.split('_')[1];
        if (!reportID) {
            return;
        }

        _.each(actions, (action) => {
            if (lodashGet(handledReportActions, [reportID, action.sequenceNumber])) {
                return;
            }

            if (ReportActionsUtils.isDeletedAction(action)) {
                return;
            }

            if (!action.created) {
                return;
            }

            // If we are past the deadline to notify for this comment don't do it
            if (moment.utc(moment(action.created).unix() * 1000).isBefore(moment.utc().subtract(10, 'seconds'))) {
                handledReportActions[reportID] = handledReportActions[reportID] || {};
                handledReportActions[reportID][action.sequenceNumber] = true;
                return;
            }

            viewNewReportAction(reportID, action);
            handledReportActions[reportID] = handledReportActions[reportID] || {};
            handledReportActions[reportID][action.sequenceNumber] = true;
        });
    },
});

export {
    addComment,
    addAttachment,
    reconnect,
    updateNotificationPreference,
    subscribeToReportTypingEvents,
    subscribeToReportCommentPushNotifications,
    unsubscribeFromReportChannel,
    saveReportComment,
    broadcastUserIsTyping,
    togglePinnedState,
    editReportComment,
    handleUserDeletedLinks,
    saveReportActionDraft,
    deleteReportComment,
    syncChatAndIOUReports,
    navigateToConciergeChat,
    setReportWithDraft,
    addPolicyReport,
    navigateToConciergeChatAndDeleteReport,
    setIsComposerFullSize,
    markCommentAsUnread,
    readNewestAction,
    readOldestAction,
    openReport,
    navigateToAndOpenReport,
    openPaymentDetailsPage,
    updatePolicyRoomName,
    clearPolicyRoomNameErrors,
    clearIOUError,
    getMaxSequenceNumber,
    subscribeToNewActionEvent,
};
