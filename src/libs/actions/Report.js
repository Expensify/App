import {InteractionManager} from 'react-native';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import ExpensiMark from 'expensify-common/lib/ExpensiMark';
import Onyx from 'react-native-onyx';
import Str from 'expensify-common/lib/str';
import moment from 'moment';
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
import * as CollectionUtils from '../CollectionUtils';
import * as EmojiUtils from '../EmojiUtils';
import * as ErrorUtils from '../ErrorUtils';
import * as UserUtils from '../UserUtils';
import * as Welcome from './Welcome';
import * as PersonalDetailsUtils from '../PersonalDetailsUtils';
import SidebarUtils from '../SidebarUtils';
import * as OptionsListUtils from '../OptionsListUtils';
import * as Environment from '../Environment/Environment';

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
        // If the pusher message comes from OldDot, we expect the typing status to be keyed by user
        // login OR by 'Concierge'. If the pusher message comes from NewDot, it is keyed by accountID
        // since personal details are keyed by accountID.
        const normalizedTypingStatus = getNormalizedTypingStatus(typingStatus);
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
        isLastMessageDeletedParentAction: null,
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

    let failureReport = {
        lastMessageTranslationKey: '',
        lastMessageText: '',
        lastVisibleActionCreated: '',
    };
    const {lastMessageText = '', lastMessageTranslationKey = ''} = ReportActionsUtils.getLastVisibleMessage(reportID);
    if (lastMessageText || lastMessageTranslationKey) {
        const lastVisibleAction = ReportActionsUtils.getLastVisibleAction(reportID);
        const lastVisibleActionCreated = lastVisibleAction.created;
        const lastActorAccountID = lastVisibleAction.actorAccountID;
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
    const optimisticReportData = {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
        value: reportActionsExist(reportID)
            ? {}
            : {
                  isLoadingReportActions: true,
                  isLoadingMoreReportActions: false,
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
        optimisticReportData.onyxMethod = Onyx.METHOD.SET;
    }

    // If we are creating a new report, we need to add the optimistic report data and a report action
    if (!_.isEmpty(newReportObject)) {
        // Change the method to set for new reports because it doesn't exist yet, is faster,
        // and we need the data to be available when we navigate to the chat page
        optimisticReportData.onyxMethod = Onyx.METHOD.SET;
        optimisticReportData.value = {
            reportName: CONST.REPORT.DEFAULT_REPORT_NAME,
            ...optimisticReportData.value,
            ...newReportObject,
            pendingFields: {
                createChat: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            },
            isOptimisticReport: true,
        };

        let reportOwnerEmail = CONST.REPORT.OWNER_EMAIL_FAKE;
        if (newReportObject.ownerAccountID && newReportObject.ownerAccountID !== CONST.REPORT.OWNER_ACCOUNT_ID_FAKE) {
            reportOwnerEmail = lodashGet(allPersonalDetails, [newReportObject.ownerAccountID, 'login'], '');
        }
        const optimisticCreatedAction = ReportUtils.buildOptimisticCreatedReportAction(reportOwnerEmail);
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
                value: {[parentReportActionID]: {childReportID: reportID}},
            });
            onyxData.failureData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${newReportObject.parentReportID}`,
                value: {[parentReportActionID]: {childReportID: '0'}},
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
    const formattedUserLogins = _.map(userLogins, (login) => OptionsListUtils.addSMSDomainIfPhoneNumber(login).toLowerCase());
    const chat = ReportUtils.getChatByParticipantsByLoginList(formattedUserLogins);
    if (!chat) {
        const participantAccountIDs = PersonalDetailsUtils.getAccountIDsByLogins(userLogins);
        newChat = ReportUtils.buildOptimisticChatReport(participantAccountIDs);
    }
    const reportID = chat ? chat.reportID : newChat.reportID;

    // We want to pass newChat here because if anything is passed in that param (even an existing chat), we will try to create a chat on the server
    openReport(reportID, userLogins, newChat);
    if (shouldDismissModal) {
        Navigation.dismissModal(reportID);
    } else {
        Navigation.navigate(ROUTES.getReportRoute(reportID));
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
        Navigation.navigate(ROUTES.getReportRoute(childReportID));
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
        Navigation.navigate(ROUTES.getReportRoute(newChat.reportID));
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
            Navigation.navigate(ROUTES.getReportRoute(report.preexistingReportID), CONST.NAVIGATION.TYPE.FORCED_UP);
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
            isDeletedParentAction: ReportActionsUtils.hasCommentThread(reportAction),
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
    if (reportAction.childVisibleActionCount === 0) {
        optimisticReport = {
            lastMessageTranslationKey: '',
            lastMessageText: '',
            isLastMessageDeletedParentAction: true,
        };
    } else {
        const {lastMessageText = '', lastMessageTranslationKey = ''} = ReportActionsUtils.getLastVisibleMessage(originalReportID, optimisticReportActions);
        if (lastMessageText || lastMessageTranslationKey) {
            const lastVisibleAction = ReportActionsUtils.getLastVisibleAction(originalReportID, optimisticReportActions);
            const lastVisibleActionCreated = lastVisibleAction.created;
            const lastActorAccountID = lastVisibleAction.actorAccountID;
            optimisticReport = {
                lastMessageTranslationKey,
                lastMessageText,
                lastVisibleActionCreated,
                lastActorAccountID,
            };
        }
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

    // Update optimistic data for parent report action if the report is a child report
    const optimisticParentReportData = ReportUtils.getOptimisticDataForParentReportAction(
        originalReportID,
        optimisticReport.lastVisibleActionCreated,
        CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
    );
    if (!_.isEmpty(optimisticParentReportData)) {
        optimisticData.push(optimisticParentReportData);
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
    const removedLinks = parser.getRemovedMarkdownLinks(markdownOriginalComment, newCommentText);
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
    const htmlForNewComment = handleUserDeletedLinksInHtml(textForNewComment, originalCommentHTML);
    const reportComment = parser.htmlToText(htmlForNewComment);

    // For comments shorter than 10k chars, convert the comment from MD into HTML because that's how it is stored in the database
    // For longer comments, skip parsing and display plaintext for performance reasons. It takes over 40s to parse a 100k long string!!
    let parsedOriginalCommentHTML = originalCommentHTML;
    if (textForNewComment.length < CONST.MAX_MARKUP_LENGTH) {
        const autolinkFilter = {filterRules: _.filter(_.pluck(parser.rules, 'name'), (name) => name !== 'autolink')};
        parsedOriginalCommentHTML = parser.replace(parser.htmlToMarkdown(originalCommentHTML).trim(), autolinkFilter);
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
    if (reportActionID === lastVisibleAction.reportActionID) {
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
    Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS_DRAFTS}${originalReportID}_${reportAction.reportActionID}`, draftMessage);
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
function updateNotificationPreferenceAndNavigate(reportID, previousValue, newValue) {
    if (previousValue === newValue) {
        Navigation.goBack(ROUTES.getReportSettingsRoute(reportID));
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
    API.write('UpdateReportNotificationPreference', {reportID, notificationPreference: newValue}, {optimisticData, failureData});
    Navigation.goBack(ROUTES.getReportSettingsRoute(reportID));
}

/**
 * @param {String} reportID
 * @param {String} previousValue
 * @param {String} newValue
 */
function updateWelcomeMessage(reportID, previousValue, newValue) {
    // No change needed, navigate back
    if (previousValue === newValue) {
        Navigation.goBack();
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
    Navigation.goBack();
}

/**
 * @param {Object} report
 * @param {String} newValue
 */
function updateWriteCapabilityAndNavigate(report, newValue) {
    if (report.writeCapability === newValue) {
        Navigation.goBack(ROUTES.getReportSettingsRoute(report.reportID));
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
    Navigation.goBack(ROUTES.getReportSettingsRoute(report.reportID));
}

/**
 * Navigates to the 1:1 report with Concierge
 */
function navigateToConciergeChat() {
    if (!conciergeChatReportID) {
        // In order not to delay the report life cycle, we first navigate to the unknown report
        if (!Navigation.getTopmostReportId()) {
            Navigation.navigate(ROUTES.REPORT);
        }
        // In order to avoid creating concierge repeatedly,
        // we need to ensure that the server data has been successfully pulled
        Welcome.serverDataIsReadyPromise().then(() => {
            // If we don't have a chat with Concierge then create it
            navigateToAndOpenReport([CONST.EMAIL.CONCIERGE], false);
        });
    } else {
        Navigation.navigate(ROUTES.getReportRoute(conciergeChatReportID));
    }
}

/**
 * Add a policy report (workspace room) optimistically and navigate to it.
 *
 * @param {String} policyID
 * @param {String} reportName
 * @param {String} visibility
 * @param {Array<Number>} policyMembersAccountIDs
 * @param {String} writeCapability
 */
function addPolicyReport(policyID, reportName, visibility, policyMembersAccountIDs, writeCapability = CONST.REPORT.WRITE_CAPABILITIES.ALL) {
    // The participants include the current user (admin), and for restricted rooms, the policy members. Participants must not be empty.
    const members = visibility === CONST.REPORT.VISIBILITY.RESTRICTED ? policyMembersAccountIDs : [];
    const participants = _.unique([currentUserAccountID, ...members]);
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
    Navigation.goBack();
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
        Navigation.goBack(ROUTES.getReportSettingsRoute(reportID));
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
    Navigation.goBack(ROUTES.getReportSettingsRoute(reportID));
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
        report: allReports[reportID],
        reportAction: action,
        onClick: () => {
            // Navigate to this report onClick
            Navigation.navigate(ROUTES.getReportRoute(reportID));
        },
    });
    notifyNewAction(reportID, action.actorAccountID, action.reportActionID);
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
 * Returns true if the accountID has reacted to the report action (with the given skin tone).
 * Uses the NEW FORMAT for "emojiReactions"
 * @param {String} accountID
 * @param {Array<Object | String | number>} users
 * @param {Number} [skinTone]
 * @returns {boolean}
 */
function hasAccountIDEmojiReacted(accountID, users, skinTone) {
    if (_.isUndefined(skinTone)) {
        return Boolean(users[accountID]);
    }
    const usersReaction = users[accountID];
    if (!usersReaction || !usersReaction.skinTones || !_.size(usersReaction.skinTones)) {
        return false;
    }
    return Boolean(usersReaction.skinTones[skinTone]);
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
    const createdAt = moment().utc().format(CONST.DATE.SQL_DATE_TIME);
    const optimisticData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS_REACTIONS}${reportActionID}`,
            value: {
                [emoji.name]: {
                    createdAt,
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

    const parameters = {
        reportID,
        skinTone,
        emojiCode: emoji.name,
        reportActionID,
        createdAt,
        // This will be removed as part of https://github.com/Expensify/App/issues/19535
        useEmojiReactions: true,
    };
    API.write('AddEmojiReaction', parameters, {optimisticData});
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

    if (existingReactionObject && hasAccountIDEmojiReacted(currentUserAccountID, existingReactionObject.users, skinTone)) {
        removeEmojiReaction(reportID, reportAction.reportActionID, emoji);
        return;
    }

    addEmojiReaction(reportID, reportAction.reportActionID, emoji, skinTone);
}

/**
 * @param {String|null} url
 * @param {Boolean} isAuthenticated
 */
function openReportFromDeepLink(url, isAuthenticated) {
    const route = ReportUtils.getRouteFromLink(url);
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
        SidebarUtils.isSidebarLoadedReady().then(() => {
            if (reportID) {
                Navigation.navigate(ROUTES.getReportRoute(reportID), CONST.NAVIGATION.TYPE.UP);
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

/**
 * Leave a report by setting the state to submitted and closed
 *
 * @param {String} reportID
 */
function leaveRoom(reportID) {
    const report = lodashGet(allReports, [reportID], {});
    const reportKeys = _.keys(report);
    API.write(
        'LeaveRoom',
        {
            reportID,
        },
        {
            optimisticData: [
                {
                    onyxMethod: Onyx.METHOD.SET,
                    key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
                    value: {
                        stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
                        statusNum: CONST.REPORT.STATUS.CLOSED,
                    },
                },
            ],
            // Manually clear the report using merge. Should not use set here since it would cause race condition
            // if it was called right after a merge.
            successData: [
                {
                    onyxMethod: Onyx.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
                    value: _.object(reportKeys, Array(reportKeys.length).fill(null)),
                },
            ],
            failureData: [
                {
                    onyxMethod: Onyx.METHOD.SET,
                    key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
                    value: {
                        stateNum: CONST.REPORT.STATE_NUM.OPEN,
                        statusNum: CONST.REPORT.STATUS.OPEN,
                    },
                },
            ],
        },
    );
    Navigation.dismissModal();
    if (Navigation.getTopmostReportId() === reportID) {
        Navigation.goBack();
    }
    navigateToConciergeChat();
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
        Navigation.navigate(ROUTES.getReportRoute(lastOpenedPublicRoomID));
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

export {
    addComment,
    addAttachment,
    reconnect,
    updateWelcomeMessage,
    updateWriteCapabilityAndNavigate,
    updateNotificationPreferenceAndNavigate,
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
    expandURLPreview,
    markCommentAsUnread,
    readNewestAction,
    readOldestAction,
    openReport,
    openReportFromDeepLink,
    navigateToAndOpenReport,
    navigateToAndOpenReportWithAccountIDs,
    navigateToAndOpenChildReport,
    updatePolicyRoomNameAndNavigate,
    clearPolicyRoomNameErrors,
    clearIOUError,
    subscribeToNewActionEvent,
    notifyNewAction,
    showReportActionNotification,
    toggleEmojiReaction,
    hasAccountIDEmojiReacted,
    shouldShowReportActionNotification,
    leaveRoom,
    getCurrentUserAccountID,
    setLastOpenedPublicRoom,
    flagComment,
    openLastOpenedPublicRoom,
};
