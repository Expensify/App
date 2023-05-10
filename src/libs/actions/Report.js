import {InteractionManager} from 'react-native';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import ExpensiMark from 'expensify-common/lib/ExpensiMark';
import Onyx from 'react-native-onyx';
import Str from 'expensify-common/lib/str';
import ONYXKEYS from '../../ONYXKEYS';
import * as Pusher from '../Pusher/pusher';
import LocalNotification from '../Notification/LocalNotification';
import Navigation from '../Navigation/Navigation';
import * as ActiveClientManager from '../ActiveClientManager';
import Visibility from '../Visibility';
import ROUTES from '../../ROUTES';
import * as API from '../API';
import CONFIG from '../../CONFIG';
import CONST from '../../CONST';
import Log from '../Log';
import * as ReportUtils from '../ReportUtils';
import DateUtils from '../DateUtils';
import * as ReportActionsUtils from '../ReportActionsUtils';
import * as OptionsListUtils from '../OptionsListUtils';
import * as Localize from '../Localize';
import * as CollectionUtils from '../CollectionUtils';

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

let preferredSkinTone;
Onyx.connect({
    key: ONYXKEYS.PREFERRED_EMOJI_SKIN_TONE,
    callback: (val) => {
        // the preferred skin tone is sometimes still "default", although it
        // was changed that "default" has become -1.
        if (!_.isNull(val) && Number.isInteger(Number(val))) {
            preferredSkinTone = val;
        } else {
            preferredSkinTone = -1;
        }
    },
});

const allReportActions = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
    callback: (actions, key) => {
        if (!key || !actions) {
            return;
        }
        const reportID = CollectionUtils.extractCollectionItemID(key);
        allReportActions[reportID] = actions;
    },
});

const allReports = {};
let conciergeChatReportID;
const typingWatchTimers = {};

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
    Pusher.subscribe(pusherChannelName, Pusher.TYPE.USER_IS_TYPING, (typingStatus) => {
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
    }).catch((error) => {
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
    Pusher.unsubscribe(pusherChannelName, Pusher.TYPE.USER_IS_TYPING);
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

    if (text) {
        const reportComment = ReportUtils.buildOptimisticAddCommentReportAction(text);
        reportCommentAction = reportComment.reportAction;
        reportCommentText = reportComment.commentText;
    }

    if (file) {
        // When we are adding an attachment we will call AddAttachment.
        // It supports sending an attachment with an optional comment and AddComment supports adding a single text comment only.
        commandName = 'AddAttachment';
        const attachment = ReportUtils.buildOptimisticAddCommentReportAction('', file);
        attachmentAction = attachment.reportAction;
    }

    // Always prefer the file as the last action over text
    const lastAction = attachmentAction || reportCommentAction;

    const currentTime = DateUtils.getDBTime();

    const lastCommentText = ReportUtils.formatReportLastMessageText(lastAction.message[0].text);

    const optimisticReport = {
        lastVisibleActionCreated: currentTime,
        lastMessageText: Str.htmlDecode(lastCommentText),
        lastActorEmail: currentUserEmail,
        lastReadTime: currentTime,
    };

    // Optimistically add the new actions to the store before waiting to save them to the server
    const optimisticReportActions = {};
    if (text) {
        optimisticReportActions[reportCommentAction.reportActionID] = reportCommentAction;
    }
    if (file) {
        optimisticReportActions[attachmentAction.reportActionID] = attachmentAction;
    }

    const parameters = {
        reportID,
        reportActionID: file ? attachmentAction.reportActionID : reportCommentAction.reportActionID,
        commentReportActionID: file && reportCommentAction ? reportCommentAction.reportActionID : null,
        reportComment: reportCommentText,
        file,
    };

    const optimisticData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: optimisticReport,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: optimisticReportActions,
        },
    ];

    const successData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: _.mapObject(optimisticReportActions, () => ({pendingAction: null})),
        },
    ];

    const failureData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: _.mapObject(optimisticReportActions, (action) => ({
                ...action,
                errors: {[DateUtils.getMicroseconds()]: Localize.translateLocal('report.genericAddCommentFailureMessage')},
            })),
        },
    ];

    // Update the timezone if it's been 5 minutes from the last time the user added a comment
    if (DateUtils.canUpdateTimezone()) {
        const timezone = DateUtils.getCurrentTimezone();
        parameters.timezone = JSON.stringify(timezone);
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.PERSONAL_DETAILS,
            value: {[currentUserEmail]: {timezone}},
        });
        DateUtils.setTimezoneUpdated();
    }

    API.write(commandName, parameters, {
        optimisticData,
        successData,
        failureData,
    });

    // Notify the ReportActionsView that a new comment has arrived
    if (reportID === newActionSubscriber.reportID) {
        const isFromCurrentUser = lastAction.actorAccountID === currentUserAccountID;
        newActionSubscriber.callback(isFromCurrentUser, lastAction.reportActionID);
    }
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
    const optimisticReportData = {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
        value: {
            isLoadingReportActions: true,
            isLoadingMoreReportActions: false,
            lastReadTime: DateUtils.getDBTime(),
            reportName: lodashGet(allReports, [reportID, 'reportName'], CONST.REPORT.DEFAULT_REPORT_NAME),
        },
    };
    const reportSuccessData = {
        onyxMethod: Onyx.METHOD.MERGE,
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
    };
    const reportFailureData = {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
        value: {
            isLoadingReportActions: false,
        },
    };

    const onyxData = {
        optimisticData: [optimisticReportData],
        successData: [reportSuccessData],
        failureData: [reportFailureData],
    };

    const params = {
        reportID,
        emailList: participantList ? participantList.join(',') : '',
    };

    // If we are creating a new report, we need to add the optimistic report data and a report action
    if (!_.isEmpty(newReportObject)) {
        // Change the method to set for new reports because it doesn't exist yet, is faster,
        // and we need the data to be available when we navigate to the chat page
        optimisticReportData.onyxMethod = Onyx.METHOD.SET;
        optimisticReportData.value = {
            ...optimisticReportData.value,
            ...newReportObject,
            pendingFields: {
                createChat: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            },
            isOptimisticReport: true,
        };

        const optimisticCreatedAction = ReportUtils.buildOptimisticCreatedReportAction(newReportObject.ownerEmail);
        onyxData.optimisticData.push({
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: {[optimisticCreatedAction.reportActionID]: optimisticCreatedAction},
        });
        onyxData.successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: {[optimisticCreatedAction.reportActionID]: {pendingAction: null}},
        });

        // Add the createdReportActionID parameter to the API call
        params.createdReportActionID = optimisticCreatedAction.reportActionID;
    }

    API.write('OpenReport', params, onyxData);
}

/**
 * This will find an existing chat, or create a new one if none exists, for the given user or set of users. It will then navigate to this chat.
 *
 * @param {Array} userLogins list of user logins.
 */
function navigateToAndOpenReport(userLogins) {
    const formattedUserLogins = _.map(userLogins, (login) => OptionsListUtils.addSMSDomainIfPhoneNumber(login).toLowerCase());
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
    API.write(
        'ReconnectToReport',
        {
            reportID,
        },
        {
            optimisticData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
                    value: {
                        isLoadingReportActions: true,
                        isLoadingMoreReportActions: false,
                        reportName: lodashGet(allReports, [reportID, 'reportName'], CONST.REPORT.DEFAULT_REPORT_NAME),
                    },
                },
            ],
            successData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
                    value: {
                        isLoadingReportActions: false,
                    },
                },
            ],
            failureData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
                    value: {
                        isLoadingReportActions: false,
                    },
                },
            ],
        },
    );
}

/**
 * Gets the older actions that have not been read yet.
 * Normally happens when you scroll up on a chat, and the actions have not been read yet.
 *
 * @param {String} reportID
 * @param {String} reportActionID
 */
function readOldestAction(reportID, reportActionID) {
    API.read(
        'ReadOldestAction',
        {
            reportID,
            reportActionID,
        },
        {
            optimisticData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
                    value: {
                        isLoadingMoreReportActions: true,
                    },
                },
            ],
            successData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
                    value: {
                        isLoadingMoreReportActions: false,
                    },
                },
            ],
            failureData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
                    value: {
                        isLoadingMoreReportActions: false,
                    },
                },
            ],
        },
    );
}

/**
 * Gets the IOUReport and the associated report actions.
 *
 * @param {String} chatReportID
 * @param {Number} iouReportID
 */
function openPaymentDetailsPage(chatReportID, iouReportID) {
    API.read(
        'OpenPaymentDetailsPage',
        {
            reportID: chatReportID,
            iouReportID,
        },
        {
            optimisticData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.IOU,
                    value: {
                        loading: true,
                    },
                },
            ],
            successData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.IOU,
                    value: {
                        loading: false,
                    },
                },
            ],
            failureData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.IOU,
                    value: {
                        loading: false,
                    },
                },
            ],
        },
    );
}

/**
 * Gets transactions and data associated with the linked report (expense or IOU report)
 *
 * @param {String} chatReportID
 * @param {String} linkedReportID
 */
function openMoneyRequestsReportPage(chatReportID, linkedReportID) {
    API.read(
        'OpenMoneyRequestsReportPage',
        {
            reportID: chatReportID,
            linkedReportID,
        },
        {
            optimisticData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.IOU,
                    value: {
                        loading: true,
                    },
                },
            ],
            successData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.IOU,
                    value: {
                        loading: false,
                    },
                },
            ],
            failureData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.IOU,
                    value: {
                        loading: false,
                    },
                },
            ],
        },
    );
}

/**
 * Marks the new report actions as read
 *
 * @param {String} reportID
 */
function readNewestAction(reportID) {
    API.write(
        'ReadNewestAction',
        {
            reportID,
        },
        {
            optimisticData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
                    value: {
                        lastReadTime: DateUtils.getDBTime(),
                    },
                },
            ],
        },
    );
}

/**
 * Sets the last read time on a report
 *
 * @param {String} reportID
 * @param {String} reportActionCreated
 */
function markCommentAsUnread(reportID, reportActionCreated) {
    // We subtract 1 millisecond so that the lastReadTime is updated to just before a given reportAction's created date
    // For example, if we want to mark a report action with ID 100 and created date '2014-04-01 16:07:02.999' unread, we set the lastReadTime to '2014-04-01 16:07:02.998'
    // Since the report action with ID 100 will be the first with a timestamp above '2014-04-01 16:07:02.998', it's the first one that will be shown as unread
    const lastReadTime = DateUtils.subtractMillisecondsFromDateTime(reportActionCreated, 1);
    API.write(
        'MarkAsUnread',
        {
            reportID,
            lastReadTime,
        },
        {
            optimisticData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
                    value: {
                        lastReadTime,
                    },
                },
            ],
        },
    );
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
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`,
            value: {isPinned: pinnedValue},
        },
    ];

    API.write(
        'TogglePinnedChat',
        {
            reportID: report.reportID,
            pinnedValue,
        },
        {optimisticData},
    );
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
 * Saves the number of lines for the comment
 * @param {String} reportID
 * @param {Number} numberOfLines
 */
function saveReportCommentNumberOfLines(reportID, numberOfLines) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT_NUMBER_OF_LINES}${reportID}`, numberOfLines);
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
    Pusher.sendEvent(privateReportChannelName, Pusher.TYPE.USER_IS_TYPING, typingStatus);
}

/**
 * When a report changes in Onyx, this fetches the report from the API if the report doesn't have a name
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

    // A report can be missing a name if a comment is received via pusher event and the report does not yet exist in Onyx (eg. a new DM created with the logged in person)
    // In this case, we call reconnect so that we can fetch the report data without marking it as read
    if (report.reportID && report.reportName === undefined) {
        reconnect(report.reportID);
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
    const reportActionID = reportAction.reportActionID;
    const deletedMessage = [
        {
            type: 'COMMENT',
            html: '',
            text: '',
            isEdited: true,
        },
    ];
    const optimisticReportActions = {
        [reportActionID]: {
            pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
            previousMessage: reportAction.message,
            message: deletedMessage,
            errors: null,
        },
    };

    // If we are deleting the last visible message, let's find the previous visible one (or set an empty one if there are none) and update the lastMessageText in the LHN.
    // Similarly, if we are deleting the last read comment we will want to update the lastVisibleActionCreated to use the previous visible message.
    let optimisticReport = {
        lastMessageText: '',
        lastVisibleActionCreated: '',
    };
    const lastMessageText = ReportActionsUtils.getLastVisibleMessageText(reportID, optimisticReportActions);
    if (lastMessageText.length > 0) {
        const lastVisibleActionCreated = ReportActionsUtils.getLastVisibleAction(reportID, optimisticReportActions).created;
        optimisticReport = {
            lastMessageText,
            lastVisibleActionCreated,
        };
    }

    // If the API call fails we must show the original message again, so we revert the message content back to how it was
    // and and remove the pendingAction so the strike-through clears
    const failureData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: {
                [reportActionID]: {
                    message: reportAction.message,
                    pendingAction: null,
                    previousMessage: null,
                },
            },
        },
    ];

    const successData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: {
                [reportActionID]: {
                    pendingAction: null,
                    previousMessage: null,
                },
            },
        },
    ];

    const optimisticData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: optimisticReportActions,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: optimisticReport,
        },
    ];

    const parameters = {
        reportID,
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
    const links = _.map(matches, (match) => match[1]);
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
 * Removes the links in html of a comment.
 * example:
 *      html="test <a href="https://www.google.com" target="_blank" rel="noreferrer noopener">https://www.google.com</a> test"
 *      links=["https://www.google.com"]
 * returns: "test https://www.google.com test"
 *
 * @param {String} html
 * @param {Array} links
 * @returns {String}
 */
const removeLinksFromHtml = (html, links) => {
    let htmlCopy = html.slice();
    _.forEach(links, (link) => {
        // We want to match the anchor tag of the link and replace the whole anchor tag with the text of the anchor tag
        const regex = new RegExp(`<(a)[^><]*href\\s*=\\s*(['"])(${Str.escapeForRegExp(link)})\\2(?:".*?"|'.*?'|[^'"><])*>([\\s\\S]*?)<\\/\\1>(?![^<]*(<\\/pre>|<\\/code>))`, 'gi');
        htmlCopy = htmlCopy.replace(regex, '$4');
    });
    return htmlCopy;
};

/**
 * This function will handle removing only links that were purposely removed by the user while editing.
 *
 * @param {String} newCommentText text of the comment after editing.
 * @param {String} originalHtml original html of the comment before editing.
 * @returns {String}
 */
const handleUserDeletedLinksInHtml = (newCommentText, originalHtml) => {
    const parser = new ExpensiMark();
    if (newCommentText.length >= CONST.MAX_MARKUP_LENGTH) {
        return newCommentText;
    }
    const markdownOriginalComment = parser.htmlToMarkdown(originalHtml).trim();
    const htmlForNewComment = parser.replace(newCommentText);
    const removedLinks = getRemovedMarkdownLinks(markdownOriginalComment, newCommentText);
    return removeLinksFromHtml(htmlForNewComment, removedLinks);
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
    const htmlForNewComment = handleUserDeletedLinksInHtml(textForNewComment, originalCommentHTML);

    // For comments shorter than 10k chars, convert the comment from MD into HTML because that's how it is stored in the database
    // For longer comments, skip parsing and display plaintext for performance reasons. It takes over 40s to parse a 100k long string!!
    let parsedOriginalCommentHTML = originalCommentHTML;
    if (textForNewComment.length < CONST.MAX_MARKUP_LENGTH) {
        const autolinkFilter = {filterRules: _.filter(_.pluck(parser.rules, 'name'), (name) => name !== 'autolink')};
        parsedOriginalCommentHTML = parser.replace(parser.htmlToMarkdown(originalCommentHTML).trim(), autolinkFilter);
    }

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
    const reportActionID = originalReportAction.reportActionID;
    const originalMessage = lodashGet(originalReportAction, ['message', 0]);
    const optimisticReportActions = {
        [reportActionID]: {
            pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
            message: [
                {
                    ...originalMessage,
                    isEdited: true,
                    html: htmlForNewComment,
                    text: textForNewComment,
                },
            ],
        },
    };

    const optimisticData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: optimisticReportActions,
        },
    ];

    const lastVisibleAction = ReportActionsUtils.getLastVisibleAction(reportID, optimisticReportActions);
    if (reportActionID === lastVisibleAction.reportActionID) {
        const reportComment = parser.htmlToText(htmlForNewComment);
        const lastMessageText = ReportUtils.formatReportLastMessageText(reportComment);
        const optimisticReport = {
            lastMessageText: Str.htmlDecode(lastMessageText),
        };
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: optimisticReport,
        });
    }

    const failureData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: {
                [reportActionID]: {
                    ...originalReportAction,
                    pendingAction: null,
                },
            },
        },
    ];

    const successData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: {
                [reportActionID]: {
                    pendingAction: null,
                },
            },
        },
    ];

    const parameters = {
        reportID,
        reportComment: htmlForNewComment,
        reportActionID,
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
 * Saves the number of lines for the report action draft
 * @param {String} reportID
 * @param {Number} reportActionID
 * @param {Number} numberOfLines
 */
function saveReportActionDraftNumberOfLines(reportID, reportActionID, numberOfLines) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT_NUMBER_OF_LINES}${reportID}_${reportActionID}`, numberOfLines);
}

/**
 * @param {String} reportID
 * @param {String} previousValue
 * @param {String} newValue
 */
function updateNotificationPreference(reportID, previousValue, newValue) {
    const optimisticData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {notificationPreference: newValue},
        },
    ];
    const failureData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
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
    const createdReportAction = ReportUtils.buildOptimisticCreatedReportAction(policyReport.ownerEmail);

    // Onyx.set is used on the optimistic data so that it is present before navigating to the workspace room. With Onyx.merge the workspace room reportID is not present when
    // fetchReportIfNeeded is called on the ReportScreen, so openReport is called which is unnecessary since the optimistic data will be stored in Onyx.
    // Therefore, Onyx.set is used instead of Onyx.merge.
    const optimisticData = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT}${policyReport.reportID}`,
            value: {
                pendingFields: {
                    addWorkspaceRoom: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                },
                ...policyReport,
            },
        },
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${policyReport.reportID}`,
            value: {[createdReportAction.reportActionID]: createdReportAction},
        },
    ];
    const successData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${policyReport.reportID}`,
            value: {
                pendingFields: {
                    addWorkspaceRoom: null,
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${policyReport.reportID}`,
            value: {
                [createdReportAction.reportActionID]: {
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
            createdReportActionID: createdReportAction.reportActionID,
        },
        {optimisticData, successData},
    );
    Navigation.navigate(ROUTES.getReportRoute(policyReport.reportID));
}

/**
 * Deletes a report, along with its reportActions, any linked reports, and any linked IOU report.
 *
 * @param {String} reportID
 */
function deleteReport(reportID) {
    const report = allReports[reportID];
    const onyxData = {
        [`${ONYXKEYS.COLLECTION.REPORT}${reportID}`]: null,
        [`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`]: null,
    };

    // Delete linked transactions
    const reportActionsForReport = allReportActions[reportID];
    _.chain(reportActionsForReport)
        .filter((reportAction) => reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.IOU)
        .map((reportAction) => reportAction.originalMessage.IOUTransactionID)
        .uniq()
        .each((transactionID) => (onyxData[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`] = null));

    Onyx.multiSet(onyxData);

    // Delete linked IOU report
    if (report && report.iouReportID) {
        deleteReport(report.iouReportID);
    }
}

/**
 * @param {String} reportID The reportID of the policy report (workspace room)
 */
function navigateToConciergeChatAndDeleteReport(reportID) {
    navigateToConciergeChat();
    deleteReport(reportID);
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
            onyxMethod: Onyx.METHOD.MERGE,
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
            onyxMethod: Onyx.METHOD.MERGE,
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
            onyxMethod: Onyx.METHOD.MERGE,
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

/**
 * @param {String} reportID
 * @param {Object} action the associated report action (optional)
 * @param {Boolean} isRemote whether or not this notification is a remote push notification
 * @returns {Boolean}
 */
function shouldShowReportActionNotification(reportID, action = null, isRemote = false) {
    const tag = isRemote ? '[PushNotification]' : '[LocalNotification]';

    // Due to payload size constraints, some push notifications may have their report action stripped
    // so we must double check that we were provided an action before using it in these checks.
    if (action && ReportActionsUtils.isDeletedAction(action)) {
        Log.info(`${tag} Skipping notification because the action was deleted`, false, {reportID, action});
        return false;
    }

    if (!ActiveClientManager.isClientTheLeader()) {
        Log.info(`${tag} Skipping notification because this client is not the leader`);
        return false;
    }

    // We don't want to send a local notification if the user preference is daily or mute
    const notificationPreference = lodashGet(allReports, [reportID, 'notificationPreference'], CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS);
    if (notificationPreference === CONST.REPORT.NOTIFICATION_PREFERENCE.MUTE || notificationPreference === CONST.REPORT.NOTIFICATION_PREFERENCE.DAILY) {
        Log.info(`${tag} No notification because user preference is to be notified: ${notificationPreference}`);
        return false;
    }

    // If this comment is from the current user we don't want to parrot whatever they wrote back to them.
    if (action && action.actorAccountID === currentUserAccountID) {
        Log.info(`${tag} No notification because comment is from the currently logged in user`);
        return false;
    }

    // If we are currently viewing this report do not show a notification.
    if (reportID === Navigation.getReportIDFromRoute() && Visibility.isVisible() && Visibility.hasFocus()) {
        Log.info(`${tag} No notification because it was a comment for the current report`);
        return false;
    }

    // If this notification was delayed and the user saw the message already, don't show it
    const report = allReports[reportID];
    if (action && report && report.lastReadTime >= action.created) {
        Log.info(`${tag} No notification because the comment was already read`, false, {created: action.created, lastReadTime: report.lastReadTime});
        return false;
    }

    // Don't show a notification if no comment exists
    if (action && !_.some(action.message, (f) => f.type === 'COMMENT')) {
        Log.info(`${tag} No notification because no comments exist for the current action`);
        return false;
    }

    return true;
}

/**
 * @param {String} reportID
 * @param {Object} action
 */
function showReportActionNotification(reportID, action) {
    if (!shouldShowReportActionNotification(reportID, action)) {
        return;
    }

    Log.info('[LocalNotification] Creating notification');
    LocalNotification.showCommentNotification({
        reportAction: action,
        onClick: () => {
            // Navigate to this report onClick
            Navigation.navigate(ROUTES.getReportRoute(reportID));
        },
    });

    // Notify the ReportActionsView that a new comment has arrived
    if (reportID === newActionSubscriber.reportID) {
        const isFromCurrentUser = action.actorAccountID === currentUserAccountID;
        newActionSubscriber.callback(isFromCurrentUser, action.reportActionID);
    }
}

/**
 * Clear the errors associated with the IOUs of a given report.
 *
 * @param {String} reportID
 */
function clearIOUError(reportID) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {errorFields: {iou: null}});
}

/**
 * Internal function to help with updating the onyx state of a message of a report action.
 * @param {Object} originalReportAction
 * @param {Object} message
 * @param {String} reportID
 * @return {Object[]}
 */
function getOptimisticDataForReportActionUpdate(originalReportAction, message, reportID) {
    const reportActionID = originalReportAction.reportActionID;

    return [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: {
                [reportActionID]: {
                    message: [message],
                },
            },
        },
    ];
}

/**
 * Returns true if the accountID has reacted to the report action (with the given skin tone).
 * @param {String} accountID
 * @param {Array<Object | String | number>} users
 * @param {Number} [skinTone]
 * @returns {boolean}
 */
function hasAccountIDReacted(accountID, users, skinTone) {
    return (
        _.find(users, (user) => {
            let userAccountID;
            if (typeof user === 'object') {
                userAccountID = `${user.accountID}`;
            } else {
                userAccountID = `${user}`;
            }

            return userAccountID === `${accountID}` && (skinTone == null ? true : user.skinTone === skinTone);
        }) !== undefined
    );
}

/**
 * Adds a reaction to the report action.
 * @param {String} reportID
 * @param {Object} originalReportAction
 * @param {{ name: string, code: string, types: string[] }} emoji
 * @param {number} [skinTone] Optional.
 */
function addEmojiReaction(reportID, originalReportAction, emoji, skinTone = preferredSkinTone) {
    const message = originalReportAction.message[0];
    let reactionObject = message.reactions && _.find(message.reactions, (reaction) => reaction.emoji === emoji.name);
    const needToInsertReactionObject = !reactionObject;
    if (needToInsertReactionObject) {
        reactionObject = {
            emoji: emoji.name,
            users: [],
        };
    } else {
        // Make a copy of the reaction object so that we can modify it without mutating the original
        reactionObject = {...reactionObject};
    }

    if (hasAccountIDReacted(currentUserAccountID, reactionObject.users, skinTone)) {
        return;
    }

    reactionObject.users = [...reactionObject.users, {accountID: currentUserAccountID, skinTone}];
    let updatedReactions = [...(message.reactions || [])];
    if (needToInsertReactionObject) {
        updatedReactions = [...updatedReactions, reactionObject];
    } else {
        updatedReactions = _.map(updatedReactions, (reaction) => (reaction.emoji === emoji.name ? reactionObject : reaction));
    }

    const updatedMessage = {
        ...message,
        reactions: updatedReactions,
    };

    // Optimistically update the reportAction with the reaction
    const optimisticData = getOptimisticDataForReportActionUpdate(originalReportAction, updatedMessage, reportID);

    const parameters = {
        reportID,
        skinTone,
        emojiCode: emoji.name,
        sequenceNumber: originalReportAction.sequenceNumber,
        reportActionID: originalReportAction.reportActionID,
    };
    API.write('AddEmojiReaction', parameters, {optimisticData});
}

/**
 * Removes a reaction to the report action.
 * @param {String} reportID
 * @param {Object} originalReportAction
 * @param {{ name: string, code: string, types: string[] }} emoji
 */
function removeEmojiReaction(reportID, originalReportAction, emoji) {
    const message = originalReportAction.message[0];
    const reactionObject = message.reactions && _.find(message.reactions, (reaction) => reaction.emoji === emoji.name);
    if (!reactionObject) {
        return;
    }

    const updatedReactionObject = {
        ...reactionObject,
    };
    updatedReactionObject.users = _.filter(reactionObject.users, (sender) => sender.accountID !== currentUserAccountID);
    const updatedReactions = _.filter(
        // Replace the reaction object either with the updated one or null if there are no users
        _.map(message.reactions, (reaction) => {
            if (reaction.emoji === emoji.name) {
                if (updatedReactionObject.users.length === 0) {
                    return null;
                }
                return updatedReactionObject;
            }
            return reaction;
        }),

        // Remove any null reactions
        (reportObject) => reportObject !== null,
    );

    const updatedMessage = {
        ...message,
        reactions: updatedReactions,
    };

    // Optimistically update the reportAction with the reaction
    const optimisticData = getOptimisticDataForReportActionUpdate(originalReportAction, updatedMessage, reportID);

    const parameters = {
        reportID,
        sequenceNumber: originalReportAction.sequenceNumber,
        reportActionID: originalReportAction.reportActionID,
        emojiCode: emoji.name,
    };
    API.write('RemoveEmojiReaction', parameters, {optimisticData});
}

/**
 * Calls either addEmojiReaction or removeEmojiReaction depending on if the current user has reacted to the report action.
 * @param {String} reportID
 * @param {Object} reportAction
 * @param {Object} emoji
 * @param {number} paramSkinTone
 * @returns {Promise}
 */
function toggleEmojiReaction(reportID, reportAction, emoji, paramSkinTone = preferredSkinTone) {
    const message = reportAction.message[0];
    const reactionObject = message.reactions && _.find(message.reactions, (reaction) => reaction.emoji === emoji.name);
    const skinTone = emoji.types === undefined ? null : paramSkinTone; // only use skin tone if emoji supports it
    if (reactionObject) {
        if (hasAccountIDReacted(currentUserAccountID, reactionObject.users, skinTone)) {
            return removeEmojiReaction(reportID, reportAction, emoji, skinTone);
        }
    }
    return addEmojiReaction(reportID, reportAction, emoji, skinTone);
}

/**
 * @param {String|null} url
 */
function openReportFromDeepLink(url) {
    InteractionManager.runAfterInteractions(() => {
        Navigation.isReportScreenReady().then(() => {
            const route = ReportUtils.getRouteFromLink(url);
            const reportID = ReportUtils.getReportIDFromLink(url);
            if (reportID) {
                Navigation.navigate(ROUTES.getReportRoute(reportID));
            }
            if (route === ROUTES.CONCIERGE) {
                navigateToConciergeChat();
            }
        });
    });
}

function getCurrentUserAccountID() {
    return currentUserAccountID;
}

export {
    addComment,
    addAttachment,
    reconnect,
    updateNotificationPreference,
    subscribeToReportTypingEvents,
    unsubscribeFromReportChannel,
    saveReportComment,
    saveReportCommentNumberOfLines,
    broadcastUserIsTyping,
    togglePinnedState,
    editReportComment,
    handleUserDeletedLinksInHtml,
    saveReportActionDraft,
    saveReportActionDraftNumberOfLines,
    deleteReportComment,
    navigateToConciergeChat,
    setReportWithDraft,
    addPolicyReport,
    deleteReport,
    navigateToConciergeChatAndDeleteReport,
    setIsComposerFullSize,
    markCommentAsUnread,
    readNewestAction,
    readOldestAction,
    openReport,
    openReportFromDeepLink,
    navigateToAndOpenReport,
    openPaymentDetailsPage,
    openMoneyRequestsReportPage,
    updatePolicyRoomName,
    clearPolicyRoomNameErrors,
    clearIOUError,
    subscribeToNewActionEvent,
    showReportActionNotification,
    addEmojiReaction,
    removeEmojiReaction,
    toggleEmojiReaction,
    hasAccountIDReacted,
    getCurrentUserAccountID,
    shouldShowReportActionNotification,
};
