import {format as timezoneFormat, utcToZonedTime} from 'date-fns-tz';
import ExpensiMark from 'expensify-common/lib/ExpensiMark';
import Str from 'expensify-common/lib/str';
import lodashDebounce from 'lodash/debounce';
import lodashGet from 'lodash/get';
import {DeviceEventEmitter, InteractionManager} from 'react-native';
import Onyx from 'react-native-onyx';
import _ from 'underscore';
import * as ActiveClientManager from '@libs/ActiveClientManager';
import * as API from '@libs/API';
import * as CollectionUtils from '@libs/CollectionUtils';
import DateUtils from '@libs/DateUtils';
import * as EmojiUtils from '@libs/EmojiUtils';
import * as Environment from '@libs/Environment/Environment';
import * as ErrorUtils from '@libs/ErrorUtils';
import Log from '@libs/Log';
import Navigation from '@libs/Navigation/Navigation';
import LocalNotification from '@libs/Notification/LocalNotification';
import * as PersonalDetailsUtils from '@libs/PersonalDetailsUtils';
import * as Pusher from '@libs/Pusher/pusher';
import * as ReportActionsUtils from '@libs/ReportActionsUtils';
import * as ReportUtils from '@libs/ReportUtils';
import * as UserUtils from '@libs/UserUtils';
import Visibility from '@libs/Visibility';
import CONFIG from '@src/CONFIG';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import * as Session from './Session';
import * as Welcome from './Welcome';

let currentUserAccountID;
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (val) => {
        // When signed out, val is undefined
        if (!val) {
            return;
        }

        currentUserAccountID = val.accountID;
    },
});

let preferredSkinTone;
Onyx.connect({
    key: ONYXKEYS.PREFERRED_EMOJI_SKIN_TONE,
    callback: (val) => {
        preferredSkinTone = EmojiUtils.getPreferredSkinToneIndex(val);
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

const currentReportData = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT,
    callback: (data, key) => {
        if (!key || !data) {
            return;
        }
        const reportID = CollectionUtils.extractCollectionItemID(key);
        currentReportData[reportID] = data;
    },
});

let isNetworkOffline = false;
Onyx.connect({
    key: ONYXKEYS.NETWORK,
    callback: (val) => (isNetworkOffline = lodashGet(val, 'isOffline', false)),
});

let allPersonalDetails;
Onyx.connect({
    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    callback: (val) => {
        allPersonalDetails = val || {};
    },
});

const draftNoteMap = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.PRIVATE_NOTES_DRAFT,
    callback: (value, key) => {
        if (!key) {
            return;
        }

        const reportID = key.replace(ONYXKEYS.COLLECTION.PRIVATE_NOTES_DRAFT, '');
        draftNoteMap[reportID] = value;
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
 * There are 2 possibilities that we can receive via pusher for a user's typing/leaving status:
 * 1. The "new" way from New Expensify is passed as {[login]: Boolean} (e.g. {yuwen@expensify.com: true}), where the value
 * is whether the user with that login is typing/leaving on the report or not.
 * 2. The "old" way from e.com which is passed as {userLogin: login} (e.g. {userLogin: bstites@expensify.com})
 *
 * This method makes sure that no matter which we get, we return the "new" format
 *
 * @param {Object} status
 * @returns {Object}
 */
function getNormalizedStatus(status) {
    let normalizedStatus = status;

    if (_.first(_.keys(status)) === 'userLogin') {
        normalizedStatus = {[status.userLogin]: true};
    }

    return normalizedStatus;
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
        // If the pusher message comes from OldDot, we expect the typing status to be keyed by user
        // login OR by 'Concierge'. If the pusher message comes from NewDot, it is keyed by accountID
        // since personal details are keyed by accountID.
        const normalizedTypingStatus = getNormalizedStatus(typingStatus);
        const accountIDOrLogin = _.first(_.keys(normalizedTypingStatus));

        if (!accountIDOrLogin) {
            return;
        }

        // Don't show the typing indicator if the user is typing on another platform
        if (Number(accountIDOrLogin) === currentUserAccountID) {
            return;
        }

        // Use a combo of the reportID and the accountID or login as a key for holding our timers.
        const reportUserIdentifier = `${reportID}-${accountIDOrLogin}`;
        clearTimeout(typingWatchTimers[reportUserIdentifier]);
        Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_USER_IS_TYPING}${reportID}`, normalizedTypingStatus);

        // Wait for 1.5s of no additional typing events before setting the status back to false.
        typingWatchTimers[reportUserIdentifier] = setTimeout(() => {
            const typingStoppedStatus = {};
            typingStoppedStatus[accountIDOrLogin] = false;
            Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_USER_IS_TYPING}${reportID}`, typingStoppedStatus);
            delete typingWatchTimers[reportUserIdentifier];
        }, 1500);
    }).catch((error) => {
        Log.hmmm('[Report] Failed to initially subscribe to Pusher channel', false, {errorType: error.type, pusherChannelName});
    });
}

/**
 * Initialize our pusher subscriptions to listen for someone leaving a room.
 *
 * @param {String} reportID
 */
function subscribeToReportLeavingEvents(reportID) {
    if (!reportID) {
        return;
    }

    // Make sure we have a clean Leaving indicator before subscribing to leaving events
    Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_USER_IS_LEAVING_ROOM}${reportID}`, false);

    const pusherChannelName = getReportChannelName(reportID);
    Pusher.subscribe(pusherChannelName, Pusher.TYPE.USER_IS_LEAVING_ROOM, (leavingStatus) => {
        // If the pusher message comes from OldDot, we expect the leaving status to be keyed by user
        // login OR by 'Concierge'. If the pusher message comes from NewDot, it is keyed by accountID
        // since personal details are keyed by accountID.
        const normalizedLeavingStatus = getNormalizedStatus(leavingStatus);
        const accountIDOrLogin = _.first(_.keys(normalizedLeavingStatus));

        if (!accountIDOrLogin) {
            return;
        }

        if (Number(accountIDOrLogin) !== currentUserAccountID) {
            return;
        }

        Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_USER_IS_LEAVING_ROOM}${reportID}`, true);
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

/**
 * Remove our pusher subscriptions to listen for someone leaving a report.
 *
 * @param {String} reportID
 */
function unsubscribeFromLeavingRoomReportChannel(reportID) {
    if (!reportID) {
        return;
    }

    const pusherChannelName = getReportChannelName(reportID);
    Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_USER_IS_LEAVING_ROOM}${reportID}`, false);
    Pusher.unsubscribe(pusherChannelName, Pusher.TYPE.USER_IS_LEAVING_ROOM);
}

// New action subscriber array for report pages
let newActionSubscribers = [];

/**
 * Enables the Report actions file to let the ReportActionsView know that a new comment has arrived in realtime for the current report
 * Add subscriber for report id
 * @param {String} reportID
 * @param {Function} callback
 * @returns {Function} Remove subscriber for report id
 */
function subscribeToNewActionEvent(reportID, callback) {
    newActionSubscribers.push({callback, reportID});
    return () => {
        newActionSubscribers = _.filter(newActionSubscribers, (subscriber) => subscriber.reportID !== reportID);
    };
}

/**
 * Notify the ReportActionsView that a new comment has arrived
 *
 * @param {String} reportID
 * @param {Number} accountID
 * @param {String} reportActionID
 */
function notifyNewAction(reportID, accountID, reportActionID) {
    const actionSubscriber = _.find(newActionSubscribers, (subscriber) => subscriber.reportID === reportID);
    if (!actionSubscriber) {
        return;
    }
    const isFromCurrentUser = accountID === currentUserAccountID;
    actionSubscriber.callback(isFromCurrentUser, reportActionID);
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
        lastMessageTranslationKey: lodashGet(lastAction, 'message[0].translationKey', ''),
        lastMessageText: lastCommentText,
        lastMessageHtml: lastCommentText,
        lastActorAccountID: currentUserAccountID,
        lastReadTime: currentTime,
    };

    if (ReportUtils.getReportNotificationPreference(ReportUtils.getReport(reportID)) === CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN) {
        optimisticReport.notificationPreference = CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS;
    }

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

    let failureReport = {
        lastMessageTranslationKey: '',
        lastMessageText: '',
        lastVisibleActionCreated: '',
    };
    const {lastMessageText = '', lastMessageTranslationKey = ''} = ReportActionsUtils.getLastVisibleMessage(reportID);
    if (lastMessageText || lastMessageTranslationKey) {
        const lastVisibleAction = ReportActionsUtils.getLastVisibleAction(reportID);
        const lastVisibleActionCreated = lodashGet(lastVisibleAction, 'created');
        const lastActorAccountID = lodashGet(lastVisibleAction, 'actorAccountID');
        failureReport = {
            lastMessageTranslationKey,
            lastMessageText,
            lastVisibleActionCreated,
            lastActorAccountID,
        };
    }
    const failureData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: failureReport,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`,
            value: _.mapObject(optimisticReportActions, (action) => ({
                ...action,
                errors: ErrorUtils.getMicroSecondOnyxError('report.genericAddCommentFailureMessage'),
            })),
        },
    ];

    // Update optimistic data for parent report action if the report is a child report
    const optimisticParentReportData = ReportUtils.getOptimisticDataForParentReportAction(reportID, currentTime, CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD);
    if (!_.isEmpty(optimisticParentReportData)) {
        optimisticData.push(optimisticParentReportData);
    }

    // Update the timezone if it's been 5 minutes from the last time the user added a comment
    if (DateUtils.canUpdateTimezone()) {
        const timezone = DateUtils.getCurrentTimezone();
        parameters.timezone = JSON.stringify(timezone);
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
            value: {[currentUserAccountID]: {timezone}},
        });
        DateUtils.setTimezoneUpdated();
    }

    API.write(commandName, parameters, {
        optimisticData,
        successData,
        failureData,
    });
    notifyNewAction(reportID, lastAction.actorAccountID, lastAction.reportActionID);
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

function reportActionsExist(reportID) {
    return allReportActions[reportID] !== undefined;
}

/**
 * Gets the latest page of report actions and updates the last read message
 * If a chat with the passed reportID is not found, we will create a chat based on the passed participantList
 *
 * @param {String} reportID
 * @param {Array} participantLoginList The list of users that are included in a new chat, not including the user creating it
 * @param {Object} newReportObject The optimistic report object created when making a new chat, saved as optimistic data
 * @param {String} parentReportActionID The parent report action that a thread was created from (only passed for new threads)
 * @param {Boolean} isFromDeepLink Whether or not this report is being opened from a deep link
 * @param {Array} participantAccountIDList The list of accountIDs that are included in a new chat, not including the user creating it
 */
function openReport(reportID, participantLoginList = [], newReportObject = {}, parentReportActionID = '0', isFromDeepLink = false, participantAccountIDList = []) {
    if (!reportID) {
        return;
    }
    const optimisticReportData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: reportActionsExist(reportID)
                ? {}
                : {
                      reportName: lodashGet(allReports, [reportID, 'reportName'], CONST.REPORT.DEFAULT_REPORT_NAME),
                  },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`,
            value: {
                isLoadingInitialReportActions: true,
                isLoadingOlderReportActions: false,
                isLoadingNewerReportActions: false,
            },
        },
    ];

    const reportSuccessData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                pendingFields: {
                    createChat: null,
                },
                errorFields: {
                    createChat: null,
                },
                isOptimisticReport: false,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`,
            value: {
                isLoadingInitialReportActions: false,
            },
        },
    ];

    const reportFailureData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`,
            value: {
                isLoadingInitialReportActions: false,
            },
        },
    ];

    const onyxData = {
        optimisticData: optimisticReportData,
        successData: reportSuccessData,
        failureData: reportFailureData,
    };

    const params = {
        reportID,
        emailList: participantLoginList ? participantLoginList.join(',') : '',
        accountIDList: participantAccountIDList ? participantAccountIDList.join(',') : '',
        parentReportActionID,
    };

    if (isFromDeepLink) {
        params.shouldRetry = false;
    }

    // If we open an exist report, but it is not present in Onyx yet, we should change the method to set for this report
    // and we need data to be available when we navigate to the chat page
    if (_.isEmpty(ReportUtils.getReport(reportID))) {
        onyxData.optimisticData[0].onyxMethod = Onyx.METHOD.SET;
    }

    // If we are creating a new report, we need to add the optimistic report data and a report action
    if (!_.isEmpty(newReportObject)) {
        // Change the method to set for new reports because it doesn't exist yet, is faster,
        // and we need the data to be available when we navigate to the chat page
        onyxData.optimisticData[0].onyxMethod = Onyx.METHOD.SET;
        onyxData.optimisticData[0].value = {
            reportName: CONST.REPORT.DEFAULT_REPORT_NAME,
            ...onyxData.optimisticData[0].value,
            ...newReportObject,
            pendingFields: {
                createChat: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            },
            isOptimisticReport: true,
        };

        let emailCreatingAction = CONST.REPORT.OWNER_EMAIL_FAKE;
        if (newReportObject.ownerAccountID && newReportObject.ownerAccountID !== CONST.REPORT.OWNER_ACCOUNT_ID_FAKE) {
            emailCreatingAction = lodashGet(allPersonalDetails, [newReportObject.ownerAccountID, 'login'], '');
        }
        const optimisticCreatedAction = ReportUtils.buildOptimisticCreatedReportAction(emailCreatingAction);
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

        // Add optimistic personal details for new participants
        const optimisticPersonalDetails = {};
        const settledPersonalDetails = {};
        _.map(participantLoginList, (login, index) => {
            const accountID = newReportObject.participantAccountIDs[index];
            optimisticPersonalDetails[accountID] = allPersonalDetails[accountID] || {
                login,
                accountID,
                avatar: UserUtils.getDefaultAvatarURL(accountID),
                displayName: login,
                isOptimisticPersonalDetail: true,
            };

            settledPersonalDetails[accountID] = allPersonalDetails[accountID] || null;
        });
        onyxData.optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
            value: optimisticPersonalDetails,
        });

        onyxData.successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
            value: settledPersonalDetails,
        });
        onyxData.failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
            value: settledPersonalDetails,
        });

        // Add the createdReportActionID parameter to the API call
        params.createdReportActionID = optimisticCreatedAction.reportActionID;

        // If we are creating a thread, ensure the report action has childReportID property added
        if (newReportObject.parentReportID && parentReportActionID) {
            onyxData.optimisticData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${newReportObject.parentReportID}`,
                value: {[parentReportActionID]: {childReportID: reportID, childType: CONST.REPORT.TYPE.CHAT}},
            });
            onyxData.failureData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${newReportObject.parentReportID}`,
                value: {[parentReportActionID]: {childReportID: '0', childType: ''}},
            });
        }
    }

    params.clientLastReadTime = lodashGet(currentReportData, [reportID, 'lastReadTime'], '');

    if (isFromDeepLink) {
        // eslint-disable-next-line rulesdir/no-api-side-effects-method
        API.makeRequestWithSideEffects('OpenReport', params, onyxData).finally(() => {
            Onyx.set(ONYXKEYS.IS_CHECKING_PUBLIC_ROOM, false);
        });
    } else {
        // eslint-disable-next-line rulesdir/no-multiple-api-calls
        API.write('OpenReport', params, onyxData);
    }
}

/**
 * This will find an existing chat, or create a new one if none exists, for the given user or set of users. It will then navigate to this chat.
 *
 * @param {Array} userLogins list of user logins to start a chat report with.
 * @param {Boolean} shouldDismissModal a flag to determine if we should dismiss modal before navigate to report or navigate to report directly.
 */
function navigateToAndOpenReport(userLogins, shouldDismissModal = true) {
    let newChat = {};

    const participantAccountIDs = PersonalDetailsUtils.getAccountIDsByLogins(userLogins);
    const chat = ReportUtils.getChatByParticipants(participantAccountIDs);

    if (!chat) {
        newChat = ReportUtils.buildOptimisticChatReport(participantAccountIDs);
    }
    const reportID = chat ? chat.reportID : newChat.reportID;

    // We want to pass newChat here because if anything is passed in that param (even an existing chat), we will try to create a chat on the server
    openReport(reportID, userLogins, newChat);
    if (shouldDismissModal) {
        Navigation.dismissModal(reportID);
    } else {
        Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(reportID));
    }
}

/**
 * This will find an existing chat, or create a new one if none exists, for the given accountID or set of accountIDs. It will then navigate to this chat.
 *
 * @param {Array} participantAccountIDs of user logins to start a chat report with.
 */
function navigateToAndOpenReportWithAccountIDs(participantAccountIDs) {
    let newChat = {};
    const chat = ReportUtils.getChatByParticipants(participantAccountIDs);
    if (!chat) {
        newChat = ReportUtils.buildOptimisticChatReport(participantAccountIDs);
    }
    const reportID = chat ? chat.reportID : newChat.reportID;

    // We want to pass newChat here because if anything is passed in that param (even an existing chat), we will try to create a chat on the server
    openReport(reportID, [], newChat, '0', false, participantAccountIDs);
    Navigation.dismissModal(reportID);
}

/**
 * This will navigate to an existing thread, or create a new one if necessary
 *
 * @param {String} childReportID The reportID we are trying to open
 * @param {Object} parentReportAction the parent comment of a thread
 * @param {String} parentReportID The reportID of the parent
 *
 */
function navigateToAndOpenChildReport(childReportID = '0', parentReportAction = {}, parentReportID = '0') {
    if (childReportID !== '0') {
        openReport(childReportID);
        Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(childReportID));
    } else {
        const participantAccountIDs = _.uniq([currentUserAccountID, Number(parentReportAction.actorAccountID)]);
        const parentReport = allReports[parentReportID];
        const newChat = ReportUtils.buildOptimisticChatReport(
            participantAccountIDs,
            lodashGet(parentReportAction, ['message', 0, 'text']),
            lodashGet(parentReport, 'chatType', ''),
            lodashGet(parentReport, 'policyID', CONST.POLICY.OWNER_EMAIL_FAKE),
            CONST.POLICY.OWNER_ACCOUNT_ID_FAKE,
            false,
            '',
            undefined,
            undefined,
            CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN,
            parentReportAction.reportActionID,
            parentReportID,
        );

        const participantLogins = PersonalDetailsUtils.getLoginsByAccountIDs(newChat.participantAccountIDs);
        openReport(newChat.reportID, participantLogins, newChat, parentReportAction.reportActionID);
        Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(newChat.reportID));
    }
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
                        reportName: lodashGet(allReports, [reportID, 'reportName'], CONST.REPORT.DEFAULT_REPORT_NAME),
                    },
                },
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`,
                    value: {
                        isLoadingInitialReportActions: true,
                        isLoadingNewerReportActions: false,
                        isLoadingOlderReportActions: false,
                    },
                },
            ],
            successData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`,
                    value: {
                        isLoadingInitialReportActions: false,
                    },
                },
            ],
            failureData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`,
                    value: {
                        isLoadingInitialReportActions: false,
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
function getOlderActions(reportID, reportActionID) {
    API.read(
        'GetOlderActions',
        {
            reportID,
            reportActionID,
        },
        {
            optimisticData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`,
                    value: {
                        isLoadingOlderReportActions: true,
                    },
                },
            ],
            successData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`,
                    value: {
                        isLoadingOlderReportActions: false,
                    },
                },
            ],
            failureData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`,
                    value: {
                        isLoadingOlderReportActions: false,
                    },
                },
            ],
        },
    );
}

/**
 * Gets the newer actions that have not been read yet.
 * Normally happens when you are not located at the bottom of the list and scroll down on a chat.
 *
 * @param {String} reportID
 * @param {String} reportActionID
 */
function getNewerActions(reportID, reportActionID) {
    API.read(
        'GetNewerActions',
        {
            reportID,
            reportActionID,
        },
        {
            optimisticData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`,
                    value: {
                        isLoadingNewerReportActions: true,
                    },
                },
            ],
            successData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`,
                    value: {
                        isLoadingNewerReportActions: false,
                    },
                },
            ],
            failureData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT_METADATA}${reportID}`,
                    value: {
                        isLoadingNewerReportActions: false,
                    },
                },
            ],
        },
    );
}

/**
 * Gets metadata info about links in the provided report action
 *
 * @param {String} reportID
 * @param {String} reportActionID
 */
function expandURLPreview(reportID, reportActionID) {
    API.read('ExpandURLPreview', {
        reportID,
        reportActionID,
    });
}

/**
 * Marks the new report actions as read
 *
 * @param {String} reportID
 */
function readNewestAction(reportID) {
    const lastReadTime = DateUtils.getDBTime();
    API.write(
        'ReadNewestAction',
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
 * Sets the last read time on a report
 *
 * @param {String} reportID
 * @param {String} reportActionCreated
 */
function markCommentAsUnread(reportID, reportActionCreated) {
    // If no action created date is provided, use the last action's
    const actionCreationTime = reportActionCreated || lodashGet(allReports, [reportID, 'lastVisibleActionCreated'], DateUtils.getDBTime(new Date(0)));

    // We subtract 1 millisecond so that the lastReadTime is updated to just before a given reportAction's created date
    // For example, if we want to mark a report action with ID 100 and created date '2014-04-01 16:07:02.999' unread, we set the lastReadTime to '2014-04-01 16:07:02.998'
    // Since the report action with ID 100 will be the first with a timestamp above '2014-04-01 16:07:02.998', it's the first one that will be shown as unread
    const lastReadTime = DateUtils.subtractMillisecondsFromDateTime(actionCreationTime, 1);
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
    DeviceEventEmitter.emit(`unreadAction_${reportID}`, lastReadTime);
}

/**
 * Toggles the pinned state of the report.
 *
 * @param {Object} reportID
 * @param {Boolean} isPinnedChat
 */
function togglePinnedState(reportID, isPinnedChat) {
    const pinnedValue = !isPinnedChat;

    // Optimistically pin/unpin the report before we send out the command
    const optimisticData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {isPinned: pinnedValue},
        },
    ];

    API.write(
        'TogglePinnedChat',
        {
            reportID,
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
    typingStatus[currentUserAccountID] = true;
    Pusher.sendEvent(privateReportChannelName, Pusher.TYPE.USER_IS_TYPING, typingStatus);
}
/**
 * Broadcasts to the report's private pusher channel whether a user is leaving a report
 *
 * @param {String} reportID
 */
function broadcastUserIsLeavingRoom(reportID) {
    const privateReportChannelName = getReportChannelName(reportID);
    const leavingStatus = {};
    leavingStatus[currentUserAccountID] = true;
    Pusher.sendEvent(privateReportChannelName, Pusher.TYPE.USER_IS_LEAVING_ROOM, leavingStatus);
}

/**
 * When a report changes in Onyx, this fetches the report from the API if the report doesn't have a name
 *
 * @param {Object} report
 */
function handleReportChanged(report) {
    if (!report) {
        return;
    }

    // It is possible that we optimistically created a DM/group-DM for a set of users for which a report already exists.
    // In this case, the API will let us know by returning a preexistingReportID.
    // We should clear out the optimistically created report and re-route the user to the preexisting report.
    if (report && report.reportID && report.preexistingReportID) {
        Onyx.set(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, null);

        // Only re-route them if they are still looking at the optimistically created report
        if (Navigation.getActiveRoute().includes(`/r/${report.reportID}`)) {
            // Pass 'FORCED_UP' type to replace new report on second login with proper one in the Navigation
            Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(report.preexistingReportID), CONST.NAVIGATION.TYPE.FORCED_UP);
        }
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
    const originalReportID = ReportUtils.getOriginalReportID(reportID, reportAction);
    const reportActionID = reportAction.reportActionID;
    const deletedMessage = [
        {
            translationKey: '',
            type: 'COMMENT',
            html: '',
            text: '',
            isEdited: true,
            isDeletedParentAction: ReportActionsUtils.isThreadParentMessage(reportAction, reportID),
        },
    ];
    const optimisticReportActions = {
        [reportActionID]: {
            pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
            previousMessage: reportAction.message,
            message: deletedMessage,
            errors: null,
            linkMetadata: [],
        },
    };

    // If we are deleting the last visible message, let's find the previous visible one (or set an empty one if there are none) and update the lastMessageText in the LHN.
    // Similarly, if we are deleting the last read comment we will want to update the lastVisibleActionCreated to use the previous visible message.
    let optimisticReport = {
        lastMessageTranslationKey: '',
        lastMessageText: '',
        lastVisibleActionCreated: '',
    };
    const {lastMessageText = '', lastMessageTranslationKey = ''} = ReportUtils.getLastVisibleMessage(originalReportID, optimisticReportActions);
    if (lastMessageText || lastMessageTranslationKey) {
        const lastVisibleAction = ReportActionsUtils.getLastVisibleAction(originalReportID, optimisticReportActions);
        const lastVisibleActionCreated = lodashGet(lastVisibleAction, 'created');
        const lastActorAccountID = lodashGet(lastVisibleAction, 'actorAccountID');
        optimisticReport = {
            lastMessageTranslationKey,
            lastMessageText,
            lastVisibleActionCreated,
            lastActorAccountID,
        };
    }

    // If the API call fails we must show the original message again, so we revert the message content back to how it was
    // and and remove the pendingAction so the strike-through clears
    const failureData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${originalReportID}`,
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
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${originalReportID}`,
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
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${originalReportID}`,
            value: optimisticReportActions,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${originalReportID}`,
            value: optimisticReport,
        },
    ];

    // Update optimistic data for parent report action if the report is a child report and the reportAction has no visible child
    const childVisibleActionCount = reportAction.childVisibleActionCount || 0;
    if (childVisibleActionCount === 0) {
        const optimisticParentReportData = ReportUtils.getOptimisticDataForParentReportAction(
            originalReportID,
            optimisticReport.lastVisibleActionCreated,
            CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
        );
        if (!_.isEmpty(optimisticParentReportData)) {
            optimisticData.push(optimisticParentReportData);
        }
    }

    // Check to see if the report action we are deleting is the first comment on a thread report. In this case, we need to trigger
    // an update to let the LHN know that the parentReportAction is now deleted.
    if (ReportUtils.isThreadFirstChat(reportAction, reportID)) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {updateReportInLHN: true},
        });
    }

    const parameters = {
        reportID: originalReportID,
        reportActionID,
    };
    API.write('DeleteComment', parameters, {optimisticData, successData, failureData});
}

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
        const regex = new RegExp(`<(a)[^><]*href\\s*=\\s*(['"])(${Str.escapeForRegExp(link)})\\2(?:".*?"|'.*?'|[^'"><])*>([\\s\\S]*?)<\\/\\1>(?![^<]*(<\\/pre>|<\\/code>))`, 'g');
        htmlCopy = htmlCopy.replace(regex, '$4');
    });
    return htmlCopy;
};

/**
 * This function will handle removing only links that were purposely removed by the user while editing.
 *
 * @param {String} newCommentText text of the comment after editing.
 * @param {String} originalCommentMarkdown original markdown of the comment before editing.
 * @returns {String}
 */
const handleUserDeletedLinksInHtml = (newCommentText, originalCommentMarkdown) => {
    const parser = new ExpensiMark();
    if (newCommentText.length > CONST.MAX_MARKUP_LENGTH) {
        return newCommentText;
    }
    const htmlForNewComment = parser.replace(newCommentText);
    const removedLinks = parser.getRemovedMarkdownLinks(originalCommentMarkdown, newCommentText);
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
    const originalReportID = ReportUtils.getOriginalReportID(reportID, originalReportAction);

    // Do not autolink if someone explicitly tries to remove a link from message.
    // https://github.com/Expensify/App/issues/9090
    // https://github.com/Expensify/App/issues/13221
    const originalCommentHTML = lodashGet(originalReportAction, 'message[0].html');
    const originalCommentMarkdown = parser.htmlToMarkdown(originalCommentHTML).trim();

    // Skip the Edit if draft is not changed
    if (originalCommentMarkdown === textForNewComment) {
        return;
    }

    const htmlForNewComment = handleUserDeletedLinksInHtml(textForNewComment, originalCommentMarkdown);
    const reportComment = parser.htmlToText(htmlForNewComment);

    // For comments shorter than or equal to 10k chars, convert the comment from MD into HTML because that's how it is stored in the database
    // For longer comments, skip parsing and display plaintext for performance reasons. It takes over 40s to parse a 100k long string!!
    let parsedOriginalCommentHTML = originalCommentHTML;
    if (textForNewComment.length <= CONST.MAX_MARKUP_LENGTH) {
        const autolinkFilter = {filterRules: _.filter(_.pluck(parser.rules, 'name'), (name) => name !== 'autolink')};
        parsedOriginalCommentHTML = parser.replace(originalCommentMarkdown, autolinkFilter);
    }

    //  Delete the comment if it's empty
    if (_.isEmpty(htmlForNewComment)) {
        deleteReportComment(originalReportID, originalReportAction);
        return;
    }

    // Skip the Edit if message is not changed
    if (parsedOriginalCommentHTML === htmlForNewComment.trim() || originalCommentHTML === htmlForNewComment.trim()) {
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
                    text: reportComment,
                },
            ],
        },
    };

    const optimisticData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${originalReportID}`,
            value: optimisticReportActions,
        },
    ];

    const lastVisibleAction = ReportActionsUtils.getLastVisibleAction(originalReportID, optimisticReportActions);
    if (reportActionID === lodashGet(lastVisibleAction, 'reportActionID')) {
        const lastMessageText = ReportUtils.formatReportLastMessageText(reportComment);
        const optimisticReport = {
            lastMessageTranslationKey: '',
            lastMessageText,
        };
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${originalReportID}`,
            value: optimisticReport,
        });
    }

    const failureData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${originalReportID}`,
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
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${originalReportID}`,
            value: {
                [reportActionID]: {
                    pendingAction: null,
                },
            },
        },
    ];

    const parameters = {
        reportID: originalReportID,
        reportComment: htmlForNewComment,
        reportActionID,
    };
    API.write('UpdateComment', parameters, {optimisticData, successData, failureData});
}

/**
 * Saves the draft for a comment report action. This will put the comment into "edit mode"
 *
 * @param {String} reportID
 * @param {Object} reportAction
 * @param {String} draftMessage
 */
function saveReportActionDraft(reportID, reportAction, draftMessage) {
    const originalReportID = ReportUtils.getOriginalReportID(reportID, reportAction);
    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${originalReportID}`, {[reportAction.reportActionID]: draftMessage});
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
 * @param {boolean} navigate
 * @param {String} parentReportID
 * @param {String} parentReportActionID
 * @param {Object} report
 */
function updateNotificationPreference(reportID, previousValue, newValue, navigate, parentReportID = 0, parentReportActionID = 0, report = {}) {
    if (previousValue === newValue) {
        if (navigate && report.reportID) {
            ReportUtils.goBackToDetailsPage(report);
        }
        return;
    }
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
    if (parentReportID && parentReportActionID) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID}`,
            value: {[parentReportActionID]: {childReportNotificationPreference: newValue}},
        });
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${parentReportID}`,
            value: {[parentReportActionID]: {childReportNotificationPreference: previousValue}},
        });
    }
    API.write('UpdateReportNotificationPreference', {reportID, notificationPreference: newValue}, {optimisticData, failureData});
    if (navigate) {
        ReportUtils.goBackToDetailsPage(report);
    }
}

/**
 * This will subscribe to an existing thread, or create a new one and then subsribe to it if necessary
 *
 * @param {String} childReportID The reportID we are trying to open
 * @param {Object} parentReportAction the parent comment of a thread
 * @param {String} parentReportID The reportID of the parent
 * @param {String} prevNotificationPreference The previous notification preference for the child report
 *
 */
function toggleSubscribeToChildReport(childReportID = '0', parentReportAction = {}, parentReportID = '0', prevNotificationPreference) {
    if (childReportID !== '0') {
        openReport(childReportID);
        const parentReportActionID = lodashGet(parentReportAction, 'reportActionID', '0');
        if (!prevNotificationPreference || prevNotificationPreference === CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN) {
            updateNotificationPreference(childReportID, prevNotificationPreference, CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS, false, parentReportID, parentReportActionID);
        } else {
            updateNotificationPreference(childReportID, prevNotificationPreference, CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN, false, parentReportID, parentReportActionID);
        }
    } else {
        const participantAccountIDs = _.uniq([currentUserAccountID, Number(parentReportAction.actorAccountID)]);
        const parentReport = allReports[parentReportID];
        const newChat = ReportUtils.buildOptimisticChatReport(
            participantAccountIDs,
            lodashGet(parentReportAction, ['message', 0, 'text']),
            lodashGet(parentReport, 'chatType', ''),
            lodashGet(parentReport, 'policyID', CONST.POLICY.OWNER_EMAIL_FAKE),
            CONST.POLICY.OWNER_ACCOUNT_ID_FAKE,
            false,
            '',
            undefined,
            undefined,
            CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS,
            parentReportAction.reportActionID,
            parentReportID,
        );

        const participantLogins = PersonalDetailsUtils.getLoginsByAccountIDs(newChat.participantAccountIDs);
        openReport(newChat.reportID, participantLogins, newChat, parentReportAction.reportActionID);
        const notificationPreference =
            prevNotificationPreference === CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN ? CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS : CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN;
        updateNotificationPreference(newChat.reportID, prevNotificationPreference, notificationPreference, false, parentReportID, parentReportAction.reportActionID);
    }
}

/**
 * @param {String} reportID
 * @param {String} previousValue
 * @param {String} newValue
 */
function updateWelcomeMessage(reportID, previousValue, newValue) {
    // No change needed, navigate back
    if (previousValue === newValue) {
        Navigation.goBack(ROUTES.REPORT_SETTINGS.getRoute(reportID));
        return;
    }

    const parsedWelcomeMessage = ReportUtils.getParsedComment(newValue);
    const optimisticData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {welcomeMessage: parsedWelcomeMessage},
        },
    ];
    const failureData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {welcomeMessage: previousValue},
        },
    ];
    API.write('UpdateWelcomeMessage', {reportID, welcomeMessage: parsedWelcomeMessage}, {optimisticData, failureData});
    Navigation.goBack(ROUTES.REPORT_SETTINGS.getRoute(reportID));
}

/**
 * @param {Object} report
 * @param {String} newValue
 */
function updateWriteCapabilityAndNavigate(report, newValue) {
    if (report.writeCapability === newValue) {
        Navigation.goBack(ROUTES.REPORT_SETTINGS.getRoute(report.reportID));
        return;
    }

    const optimisticData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`,
            value: {writeCapability: newValue},
        },
    ];
    const failureData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`,
            value: {writeCapability: report.writeCapability},
        },
    ];
    API.write('UpdateReportWriteCapability', {reportID: report.reportID, writeCapability: newValue}, {optimisticData, failureData});
    // Return to the report settings page since this field utilizes push-to-page
    Navigation.goBack(ROUTES.REPORT_SETTINGS.getRoute(report.reportID));
}

/**
 * Navigates to the 1:1 report with Concierge
 *
 * @param {Boolean} ignoreConciergeReportID - Flag to ignore conciergeChatReportID during navigation. The default behavior is to not ignore.
 */
function navigateToConciergeChat(ignoreConciergeReportID = false) {
    // If conciergeChatReportID contains a concierge report ID, we navigate to the concierge chat using the stored report ID.
    // Otherwise, we would find the concierge chat and navigate to it.
    // Now, when user performs sign-out and a sign-in again, conciergeChatReportID may contain a stale value.
    // In order to prevent navigation to a stale value, we use ignoreConciergeReportID to forcefully find and navigate to concierge chat.
    if (!conciergeChatReportID || ignoreConciergeReportID) {
        // In order to avoid creating concierge repeatedly,
        // we need to ensure that the server data has been successfully pulled
        Welcome.serverDataIsReadyPromise().then(() => {
            // If we don't have a chat with Concierge then create it
            navigateToAndOpenReport([CONST.EMAIL.CONCIERGE], false);
        });
    } else {
        Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(conciergeChatReportID));
    }
}

/**
 * Add a policy report (workspace room) optimistically and navigate to it.
 *
 * @param {String} policyID
 * @param {String} reportName
 * @param {String} visibility
 * @param {String} writeCapability
 * @param {String} welcomeMessage
 */
function addPolicyReport(policyID, reportName, visibility, writeCapability = CONST.REPORT.WRITE_CAPABILITIES.ALL, welcomeMessage = '') {
    const participants = [currentUserAccountID];
    const parsedWelcomeMessage = ReportUtils.getParsedComment(welcomeMessage);
    const policyReport = ReportUtils.buildOptimisticChatReport(
        participants,
        reportName,
        CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
        policyID,
        CONST.REPORT.OWNER_ACCOUNT_ID_FAKE,
        false,
        '',
        visibility,
        writeCapability,

        // The room might contain all policy members so notifying always should be opt-in only.
        CONST.REPORT.NOTIFICATION_PREFERENCE.DAILY,
        '',
        '',
        parsedWelcomeMessage,
    );
    const createdReportAction = ReportUtils.buildOptimisticCreatedReportAction(CONST.POLICY.OWNER_EMAIL_FAKE);

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
    const failureData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${policyReport.reportID}`,
            value: {
                errorFields: {
                    addWorkspaceRoom: ErrorUtils.getMicroSecondOnyxError('report.genericCreateReportFailureMessage'),
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
            writeCapability,
            welcomeMessage: parsedWelcomeMessage,
        },
        {optimisticData, successData, failureData},
    );
    Navigation.dismissModal(policyReport.reportID);
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
    // Dismiss the current report screen and replace it with Concierge Chat
    Navigation.goBack(ROUTES.HOME);
    navigateToConciergeChat();
    deleteReport(reportID);
}

/**
 * @param {Object} policyRoomReport
 * @param {Number} policyRoomReport.reportID
 * @param {String} policyRoomReport.reportName
 * @param {String} policyRoomName The updated name for the policy room
 */
function updatePolicyRoomNameAndNavigate(policyRoomReport, policyRoomName) {
    const reportID = policyRoomReport.reportID;
    const previousName = policyRoomReport.reportName;

    // No change needed, navigate back
    if (previousName === policyRoomName) {
        Navigation.goBack(ROUTES.REPORT_SETTINGS.getRoute(reportID));
        return;
    }
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
    Navigation.goBack(ROUTES.REPORT_SETTINGS.getRoute(reportID));
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

    // We don't want to send a local notification if the user preference is daily, mute or hidden.
    const notificationPreference = lodashGet(allReports, [reportID, 'notificationPreference'], CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS);
    if (notificationPreference !== CONST.REPORT.NOTIFICATION_PREFERENCE.ALWAYS) {
        Log.info(`${tag} No notification because user preference is to be notified: ${notificationPreference}`);
        return false;
    }

    // If this comment is from the current user we don't want to parrot whatever they wrote back to them.
    if (action && action.actorAccountID === currentUserAccountID) {
        Log.info(`${tag} No notification because comment is from the currently logged in user`);
        return false;
    }

    // If we are currently viewing this report do not show a notification.
    if (reportID === Navigation.getTopmostReportId() && Visibility.isVisible() && Visibility.hasFocus()) {
        Log.info(`${tag} No notification because it was a comment for the current report`);
        return false;
    }

    // If this notification was delayed and the user saw the message already, don't show it
    const report = allReports[reportID];
    if (action && report && report.lastReadTime >= action.created) {
        Log.info(`${tag} No notification because the comment was already read`, false, {created: action.created, lastReadTime: report.lastReadTime});
        return false;
    }

    // Only show notifications for supported types of report actions
    if (!ReportActionsUtils.isNotifiableReportAction(action)) {
        Log.info(`${tag} No notification because this action type is not supported`, false, {actionName: lodashGet(action, 'actionName')});
        return false;
    }

    return true;
}

/**
 * @param {String} reportID
 * @param {Object} reportAction
 */
function showReportActionNotification(reportID, reportAction) {
    if (!shouldShowReportActionNotification(reportID, reportAction)) {
        return;
    }

    Log.info('[LocalNotification] Creating notification');
    const report = allReports[reportID];

    const notificationParams = {
        report,
        reportAction,
        onClick: () => Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(reportID)),
    };
    if (reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.MODIFIEDEXPENSE) {
        LocalNotification.showModifiedExpenseNotification(notificationParams);
    } else {
        LocalNotification.showCommentNotification(notificationParams);
    }

    notifyNewAction(reportID, reportAction.actorAccountID, reportAction.reportActionID);
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
 * Adds a reaction to the report action.
 * Uses the NEW FORMAT for "emojiReactions"
 * @param {String} reportID
 * @param {String} reportActionID
 * @param {Object} emoji
 * @param {String} emoji.name
 * @param {String} emoji.code
 * @param {String[]} [emoji.types]
 * @param {Number} [skinTone]
 */
function addEmojiReaction(reportID, reportActionID, emoji, skinTone = preferredSkinTone) {
    const createdAt = timezoneFormat(utcToZonedTime(new Date(), 'UTC'), CONST.DATE.FNS_DB_FORMAT_STRING);
    const optimisticData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS}${reportActionID}`,
            value: {
                [emoji.name]: {
                    createdAt,
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                    users: {
                        [currentUserAccountID]: {
                            skinTones: {
                                [!_.isUndefined(skinTone) ? skinTone : -1]: createdAt,
                            },
                        },
                    },
                },
            },
        },
    ];

    const failureData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS}${reportActionID}`,
            value: {
                [emoji.name]: {
                    pendingAction: null,
                },
            },
        },
    ];

    const successData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS}${reportActionID}`,
            value: {
                [emoji.name]: {
                    pendingAction: null,
                },
            },
        },
    ];

    const parameters = {
        reportID,
        skinTone,
        emojiCode: emoji.name,
        reportActionID,
        createdAt,
        // This will be removed as part of https://github.com/Expensify/App/issues/19535
        useEmojiReactions: true,
    };
    API.write('AddEmojiReaction', parameters, {optimisticData, successData, failureData});
}

/**
 * Removes a reaction to the report action.
 * Uses the NEW FORMAT for "emojiReactions"
 * @param {String} reportID
 * @param {String} reportActionID
 * @param {Object} emoji
 * @param {String} emoji.name
 * @param {String} emoji.code
 * @param {String[]} [emoji.types]
 */
function removeEmojiReaction(reportID, reportActionID, emoji) {
    const optimisticData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS}${reportActionID}`,
            value: {
                [emoji.name]: {
                    users: {
                        [currentUserAccountID]: null,
                    },
                },
            },
        },
    ];

    const parameters = {
        reportID,
        reportActionID,
        emojiCode: emoji.name,
        // This will be removed as part of https://github.com/Expensify/App/issues/19535
        useEmojiReactions: true,
    };
    API.write('RemoveEmojiReaction', parameters, {optimisticData});
}

/**
 * Calls either addEmojiReaction or removeEmojiReaction depending on if the current user has reacted to the report action.
 * Uses the NEW FORMAT for "emojiReactions"
 * @param {String} reportID
 * @param {Object} reportAction
 * @param {Object} reactionObject
 * @param {Object} existingReactions
 * @param {Number} [paramSkinTone]
 */
function toggleEmojiReaction(reportID, reportAction, reactionObject, existingReactions, paramSkinTone = preferredSkinTone) {
    const originalReportID = ReportUtils.getOriginalReportID(reportID, reportAction);
    const originalReportAction = ReportActionsUtils.getReportAction(originalReportID, reportAction.reportActionID);

    if (_.isEmpty(originalReportAction)) {
        return;
    }

    // This will get cleaned up as part of https://github.com/Expensify/App/issues/16506 once the old emoji
    // format is no longer being used
    const emoji = EmojiUtils.findEmojiByCode(reactionObject.code);
    const existingReactionObject = lodashGet(existingReactions, [emoji.name]);

    // Only use skin tone if emoji supports it
    const skinTone = emoji.types === undefined ? -1 : paramSkinTone;

    if (existingReactionObject && EmojiUtils.hasAccountIDEmojiReacted(currentUserAccountID, existingReactionObject.users, skinTone)) {
        removeEmojiReaction(originalReportID, reportAction.reportActionID, emoji);
        return;
    }

    addEmojiReaction(originalReportID, reportAction.reportActionID, emoji, skinTone);
}

/**
 * @param {String|null} url
 * @param {Boolean} isAuthenticated
 */
function openReportFromDeepLink(url, isAuthenticated) {
    const reportID = ReportUtils.getReportIDFromLink(url);

    if (reportID && !isAuthenticated) {
        // Call the OpenReport command to check in the server if it's a public room. If so, we'll open it as an anonymous user
        openReport(reportID, [], {}, '0', true);

        // Show the sign-in page if the app is offline
        if (isNetworkOffline) {
            Onyx.set(ONYXKEYS.IS_CHECKING_PUBLIC_ROOM, false);
        }
    } else {
        // If we're not opening a public room (no reportID) or the user is authenticated, we unblock the UI (hide splash screen)
        Onyx.set(ONYXKEYS.IS_CHECKING_PUBLIC_ROOM, false);
    }

    // Navigate to the report after sign-in/sign-up.
    InteractionManager.runAfterInteractions(() => {
        Session.waitForUserSignIn().then(() => {
            Navigation.waitForProtectedRoutes().then(() => {
                const route = ReportUtils.getRouteFromLink(url);
                if (route === ROUTES.CONCIERGE) {
                    navigateToConciergeChat(true);
                    return;
                }
                if (Session.isAnonymousUser() && !Session.canAccessRouteByAnonymousUser(route)) {
                    Session.signOutAndRedirectToSignIn();
                    return;
                }
                Navigation.navigate(route, CONST.NAVIGATION.ACTION_TYPE.PUSH);
            });
        });
    });
}

function getCurrentUserAccountID() {
    return currentUserAccountID;
}

/**
 * Leave a report by setting the state to submitted and closed
 *
 * @param {String} reportID
 * @param {Boolean} isWorkspaceMemberLeavingWorkspaceRoom
 */
function leaveRoom(reportID, isWorkspaceMemberLeavingWorkspaceRoom = false) {
    const report = lodashGet(allReports, [reportID], {});
    const reportKeys = _.keys(report);

    // Pusher's leavingStatus should be sent earlier.
    // Place the broadcast before calling the LeaveRoom API to prevent a race condition
    // between Onyx report being null and Pusher's leavingStatus becoming true.
    broadcastUserIsLeavingRoom(reportID);

    // If a workspace member is leaving a workspace room, they don't actually lose the room from Onyx.
    // Instead, their notification preference just gets set to "hidden".
    const optimisticData = [
        isWorkspaceMemberLeavingWorkspaceRoom
            ? {
                  onyxMethod: Onyx.METHOD.MERGE,
                  key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
                  value: {
                      notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN,
                  },
              }
            : {
                  onyxMethod: Onyx.METHOD.SET,
                  key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
                  value: {
                      stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                      statusNum: CONST.REPORT.STATUS.CLOSED,
                  },
              },
    ];

    const successData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: isWorkspaceMemberLeavingWorkspaceRoom ? {notificationPreference: CONST.REPORT.NOTIFICATION_PREFERENCE.HIDDEN} : _.object(reportKeys, Array(reportKeys.length).fill(null)),
        },
    ];

    API.write(
        'LeaveRoom',
        {
            reportID,
        },
        {
            optimisticData,
            successData,
            failureData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
                    value: report,
                },
            ],
        },
    );

    if (isWorkspaceMemberLeavingWorkspaceRoom) {
        const participantAccountIDs = PersonalDetailsUtils.getAccountIDsByLogins([CONST.EMAIL.CONCIERGE]);
        const chat = ReportUtils.getChatByParticipants(participantAccountIDs);
        Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(chat.reportID));
    }
}

/**
 * Invites people to a room
 *
 * @param {String} reportID
 * @param {Object} inviteeEmailsToAccountIDs
 */
function inviteToRoom(reportID, inviteeEmailsToAccountIDs) {
    const report = lodashGet(allReports, [reportID], {});

    const inviteeEmails = _.keys(inviteeEmailsToAccountIDs);
    const inviteeAccountIDs = _.values(inviteeEmailsToAccountIDs);

    const {participantAccountIDs} = report;
    const participantAccountIDsAfterInvitation = _.uniq([...participantAccountIDs, ...inviteeAccountIDs]);

    API.write(
        'InviteToRoom',
        {
            reportID,
            inviteeEmails,
        },
        {
            optimisticData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
                    value: {
                        participantAccountIDs: participantAccountIDsAfterInvitation,
                    },
                },
            ],
            failureData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
                    value: {
                        participantAccountIDs,
                    },
                },
            ],
        },
    );
}

/**
 * Removes people from a room
 *
 * @param {String} reportID
 * @param {Array} targetAccountIDs
 */
function removeFromRoom(reportID, targetAccountIDs) {
    const report = lodashGet(allReports, [reportID], {});

    const {participantAccountIDs} = report;
    const participantAccountIDsAfterRemoval = _.difference(participantAccountIDs, targetAccountIDs);

    API.write(
        'RemoveFromRoom',
        {
            reportID,
            targetAccountIDs,
        },
        {
            optimisticData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
                    value: {
                        participantAccountIDs: participantAccountIDsAfterRemoval,
                    },
                },
            ],
            failureData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
                    value: {
                        participantAccountIDs,
                    },
                },
            ],

            // We need to add success data here since in high latency situations,
            // the OpenRoomMembersPage call has the chance of overwriting the optimistic data we set above.
            successData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
                    value: {
                        participantAccountIDs: participantAccountIDsAfterRemoval,
                    },
                },
            ],
        },
    );
}

/**
 * @param {String} reportID
 */
function setLastOpenedPublicRoom(reportID) {
    Onyx.set(ONYXKEYS.LAST_OPENED_PUBLIC_ROOM_ID, reportID);
}

/**
 * Navigates to the last opened public room
 *
 * @param {String} lastOpenedPublicRoomID
 */
function openLastOpenedPublicRoom(lastOpenedPublicRoomID) {
    Navigation.isNavigationReady().then(() => {
        setLastOpenedPublicRoom('');
        Navigation.navigate(ROUTES.REPORT_WITH_ID.getRoute(lastOpenedPublicRoomID));
    });
}

/**
 * Flag a comment as offensive
 *
 * @param {String} reportID
 * @param {Object} reportAction
 * @param {String} severity
 */
function flagComment(reportID, reportAction, severity) {
    const originalReportID = ReportUtils.getOriginalReportID(reportID, reportAction);
    const message = reportAction.message[0];
    let updatedDecision;
    if (severity === CONST.MODERATION.FLAG_SEVERITY_SPAM || severity === CONST.MODERATION.FLAG_SEVERITY_INCONSIDERATE) {
        if (!message.moderationDecision) {
            updatedDecision = {
                decision: CONST.MODERATION.MODERATOR_DECISION_PENDING,
            };
        } else {
            updatedDecision = message.moderationDecision;
        }
    } else if (severity === CONST.MODERATION.FLAG_SEVERITY_ASSAULT || severity === CONST.MODERATION.FLAG_SEVERITY_HARASSMENT) {
        updatedDecision = {
            decision: CONST.MODERATION.MODERATOR_DECISION_PENDING_REMOVE,
        };
    } else {
        updatedDecision = {
            decision: CONST.MODERATION.MODERATOR_DECISION_PENDING_HIDE,
        };
    }

    const reportActionID = reportAction.reportActionID;

    const updatedMessage = {
        ...message,
        moderationDecision: updatedDecision,
    };

    const optimisticData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${originalReportID}`,
            value: {
                [reportActionID]: {
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                    message: [updatedMessage],
                },
            },
        },
    ];

    const failureData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${originalReportID}`,
            value: {
                [reportActionID]: {
                    ...reportAction,
                    pendingAction: null,
                },
            },
        },
    ];

    const successData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${originalReportID}`,
            value: {
                [reportActionID]: {
                    pendingAction: null,
                },
            },
        },
    ];

    const parameters = {
        severity,
        reportActionID,
        // This check is to prevent flooding Concierge with test flags
        // If you need to test moderation responses from Concierge on dev, set this to false!
        isDevRequest: Environment.isDevelopment(),
    };

    API.write('FlagComment', parameters, {optimisticData, successData, failureData});
}

/**
 * Updates a given user's private notes on a report
 *
 * @param {String} reportID
 * @param {Number} accountID
 * @param {String} note
 */
const updatePrivateNotes = (reportID, accountID, note) => {
    const optimisticData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                privateNotes: {
                    [accountID]: {
                        pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE,
                        errors: null,
                        note,
                    },
                },
            },
        },
    ];

    const successData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                privateNotes: {
                    [accountID]: {
                        pendingAction: null,
                        errors: null,
                    },
                },
            },
        },
    ];

    const failureData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
            value: {
                privateNotes: {
                    [accountID]: {
                        errors: ErrorUtils.getMicroSecondOnyxError("Private notes couldn't be saved"),
                    },
                },
            },
        },
    ];

    API.write(
        'UpdateReportPrivateNote',
        {
            reportID,
            privateNotes: note,
        },
        {optimisticData, successData, failureData},
    );
};

/**
 * Fetches all the private notes for a given report
 *
 * @param {String} reportID
 */
function getReportPrivateNote(reportID) {
    if (_.isEmpty(reportID)) {
        return;
    }
    API.read(
        'GetReportPrivateNote',
        {
            reportID,
        },
        {
            optimisticData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
                    value: {
                        isLoadingPrivateNotes: true,
                    },
                },
            ],
            successData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
                    value: {
                        isLoadingPrivateNotes: false,
                    },
                },
            ],
            failureData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
                    value: {
                        isLoadingPrivateNotes: false,
                    },
                },
            ],
        },
    );
}

/**
 * Loads necessary data for rendering the RoomMembersPage
 *
 * @param {String|Number} reportID
 */
function openRoomMembersPage(reportID) {
    API.read('OpenRoomMembersPage', {
        reportID,
    });
}

/**
 * Checks if there are any errors in the private notes for a given report
 *
 * @param {Object} report
 * @returns {Boolean} Returns true if there are errors in any of the private notes on the report
 */
function hasErrorInPrivateNotes(report) {
    const privateNotes = lodashGet(report, 'privateNotes', {});
    return _.some(privateNotes, (privateNote) => !_.isEmpty(privateNote.errors));
}

/**
 * Clears all errors associated with a given private note
 *
 * @param {String} reportID
 * @param {Number} accountID
 */
function clearPrivateNotesError(reportID, accountID) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {privateNotes: {[accountID]: {errors: null}}});
}

function getDraftPrivateNote(reportID) {
    return draftNoteMap[reportID] || '';
}

/**
 * Saves the private notes left by the user as they are typing. By saving this data the user can switch between chats, close
 * tab, refresh etc without worrying about loosing what they typed out.
 *
 * @param {String} reportID
 * @param {String} note
 */
function savePrivateNotesDraft(reportID, note) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.PRIVATE_NOTES_DRAFT}${reportID}`, note);
}

/**
 * @private
 * @param {string} searchInput
 */
function searchForReports(searchInput) {
    // We do not try to make this request while offline because it sets a loading indicator optimistically
    if (isNetworkOffline) {
        Onyx.set(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, false);
        return;
    }

    API.read(
        'SearchForReports',
        {searchInput},
        {
            successData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.IS_SEARCHING_FOR_REPORTS,
                    value: false,
                },
            ],
            failureData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: ONYXKEYS.IS_SEARCHING_FOR_REPORTS,
                    value: false,
                },
            ],
        },
    );
}

/**
 * @private
 * @param {string} searchInput
 */
const debouncedSearchInServer = lodashDebounce(searchForReports, CONST.TIMING.SEARCH_FOR_REPORTS_DEBOUNCE_TIME, {leading: false});

/**
 * @param {string} searchInput
 */
function searchInServer(searchInput) {
    if (isNetworkOffline) {
        Onyx.set(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, false);
        return;
    }

    // Why not set this in optimistic data? It won't run until the API request happens and while the API request is debounced
    // we want to show the loading state right away. Otherwise, we will see a flashing UI where the client options are sorted and
    // tell the user there are no options, then we start searching, and tell them there are no options again.
    Onyx.set(ONYXKEYS.IS_SEARCHING_FOR_REPORTS, true);
    debouncedSearchInServer(searchInput);
}

export {
    searchInServer,
    addComment,
    addAttachment,
    reconnect,
    updateWelcomeMessage,
    updateWriteCapabilityAndNavigate,
    updateNotificationPreference,
    subscribeToReportTypingEvents,
    subscribeToReportLeavingEvents,
    unsubscribeFromReportChannel,
    unsubscribeFromLeavingRoomReportChannel,
    saveReportComment,
    saveReportCommentNumberOfLines,
    broadcastUserIsTyping,
    broadcastUserIsLeavingRoom,
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
    expandURLPreview,
    markCommentAsUnread,
    readNewestAction,
    openReport,
    openReportFromDeepLink,
    navigateToAndOpenReport,
    navigateToAndOpenReportWithAccountIDs,
    navigateToAndOpenChildReport,
    toggleSubscribeToChildReport,
    updatePolicyRoomNameAndNavigate,
    clearPolicyRoomNameErrors,
    clearIOUError,
    subscribeToNewActionEvent,
    notifyNewAction,
    showReportActionNotification,
    toggleEmojiReaction,
    shouldShowReportActionNotification,
    leaveRoom,
    inviteToRoom,
    removeFromRoom,
    getCurrentUserAccountID,
    setLastOpenedPublicRoom,
    flagComment,
    openLastOpenedPublicRoom,
    updatePrivateNotes,
    getReportPrivateNote,
    clearPrivateNotesError,
    hasErrorInPrivateNotes,
    getOlderActions,
    getNewerActions,
    openRoomMembersPage,
    savePrivateNotesDraft,
    getDraftPrivateNote,
};
