import moment from 'moment';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import ExpensiMark from 'expensify-common/lib/ExpensiMark';
import Onyx from 'react-native-onyx';
import ONYXKEYS from '../../ONYXKEYS';
import * as Pusher from '../Pusher/pusher';
import LocalNotification from '../Notification/LocalNotification';
import PushNotification from '../Notification/PushNotification';
import * as PersonalDetails from './PersonalDetails';
import Navigation from '../Navigation/Navigation';
import * as ActiveClientManager from '../ActiveClientManager';
import Visibility from '../Visibility';
import ROUTES from '../../ROUTES';
import NetworkConnection from '../NetworkConnection';
import Timing from './Timing';
import * as API from '../API';
import CONST from '../../CONST';
import Log from '../Log';
import {isReportMessageAttachment} from '../reportUtils';

let currentUserEmail;
let currentUserAccountID;
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (val) => {
        // When signed out, val is undefined
        if (val) {
            currentUserEmail = val.email;
            currentUserAccountID = val.accountID;
        }
    },
});

let lastViewedReportID;
Onyx.connect({
    key: ONYXKEYS.CURRENTLY_VIEWED_REPORTID,
    callback: val => lastViewedReportID = val ? Number(val) : null,
});

let myPersonalDetails;
Onyx.connect({
    key: ONYXKEYS.MY_PERSONAL_DETAILS,
    callback: val => myPersonalDetails = val,
});

const typingWatchTimers = {};

// Keeps track of the max sequence number for each report
const reportMaxSequenceNumbers = {};

// Keeps track of the last read for each report
const lastReadSequenceNumbers = {};

// Map of optimistic report action IDs. These should be cleared when replaced by a recent fetch of report history
// since we will then be up to date and any optimistic actions that are still waiting to be replaced can be removed.
const optimisticReportActionIDs = {};

/**
 * Checks the report to see if there are any unread action items
 *
 * @param {Object} report
 * @returns {Boolean}
 */
function getUnreadActionCount(report) {
    const lastReadSequenceNumber = lodashGet(report, [
        'reportNameValuePairs',
        `lastRead_${currentUserAccountID}`,
        'sequenceNumber',
    ]);

    // Save the lastReadActionID locally so we can access this later
    lastReadSequenceNumbers[report.reportID] = lastReadSequenceNumber;

    if (report.reportActionList.length === 0) {
        return 0;
    }

    if (!lastReadSequenceNumber) {
        return report.reportActionList.length;
    }

    // There are unread items if the last one the user has read is less
    // than the highest sequence number we have
    const unreadActionCount = report.reportActionList.length - lastReadSequenceNumber;
    return Math.max(0, unreadActionCount);
}

/**
 * @param {Object} report
 * @return {String[]}
 */
function getParticipantEmailsFromReport({sharedReportList}) {
    const emailArray = _.map(sharedReportList, participant => participant.email);
    return _.without(emailArray, currentUserEmail);
}

/**
 * Returns a generated report title based on the participants
 *
 * @param {Array} sharedReportList
 * @return {String}
 */
function getChatReportName(sharedReportList) {
    return _.chain(sharedReportList)
        .map(participant => participant.email)
        .filter(participant => participant !== currentUserEmail)
        .map(participant => PersonalDetails.getDisplayName(participant))
        .value()
        .join(', ');
}

/**
 * Only store the minimal amount of data in Onyx that needs to be stored
 * because space is limited
 *
 * @param {Object} report
 * @param {Number} report.reportID
 * @param {String} report.reportName
 * @param {Object} report.reportNameValuePairs
 * @returns {Object}
 */
function getSimplifiedReportObject(report) {
    const reportActionList = lodashGet(report, ['reportActionList'], []);
    const lastReportAction = !_.isEmpty(reportActionList) ? _.last(reportActionList) : null;
    const createTimestamp = lastReportAction ? lastReportAction.created : 0;
    const lastMessageTimestamp = moment.utc(createTimestamp).unix();
    const isLastMessageAttachment = /<img([^>]+)\/>/gi.test(lodashGet(lastReportAction, ['message', 'html'], ''));

    // We are removing any html tags from the message html since we cannot access the text version of any comments as
    // the report only has the raw reportActionList and not the processed version returned by Report_GetHistory
    const lastMessageText = lodashGet(lastReportAction, ['message', 'html'], '').replace(/(<([^>]+)>)/gi, '');
    const reportName = lodashGet(report, 'reportNameValuePairs.type') === 'chat'
        ? getChatReportName(report.sharedReportList)
        : report.reportName;
    const lastActorEmail = lodashGet(lastReportAction, 'accountEmail', '');

    return {
        reportID: report.reportID,
        reportName,
        unreadActionCount: getUnreadActionCount(report),
        maxSequenceNumber: report.reportActionList.length,
        participants: getParticipantEmailsFromReport(report),
        isPinned: report.isPinned,
        lastVisitedTimestamp: lodashGet(report, [
            'reportNameValuePairs',
            `lastRead_${currentUserAccountID}`,
            'timestamp',
        ], 0),
        lastMessageTimestamp,
        lastMessageText: isLastMessageAttachment ? '[Attachment]' : lastMessageText,
        lastActorEmail,
        hasOutstandingIOU: false,
    };
}

/**
 * Get a simplified version of an IOU report
 *
 * @param {Object} reportData
 * @param {Number} reportData.transactionID
 * @param {Number} reportData.amount
 * @param {String} reportData.currency
 * @param {String} reportData.created
 * @param {String} reportData.comment
 * @param {Object[]} reportData.transactionList
 * @param {String} reportData.ownerEmail
 * @param {String} reportData.managerEmail
 * @param {Number} reportData.reportID
 * @param {Number} chatReportID
 * @returns {Object}
 */
function getSimplifiedIOUReport(reportData, chatReportID) {
    const transactions = _.map(reportData.transactionList, transaction => ({
        transactionID: transaction.transactionID,
        amount: transaction.amount,
        currency: transaction.currency,
        created: transaction.created,
        comment: transaction.comment,
    }));

    return {
        reportID: reportData.reportID,
        ownerEmail: reportData.ownerEmail,
        managerEmail: reportData.managerEmail,
        currency: reportData.currency,
        transactions,
        chatReportID,
        state: reportData.state,
        cachedTotal: reportData.cachedTotal,
        total: reportData.total,
        status: reportData.status,
        stateNum: reportData.stateNum,
    };
}

/**
 * Fetches the updated data for an IOU Report and updates the IOU collection in Onyx
 *
 * @param {Object} chatReport
 * @param {Object[]} chatReport.reportActionList
 * @param {Number} chatReport.reportID
 * @return {Promise}
 */
function updateIOUReportData(chatReport) {
    const reportActionList = chatReport.reportActionList || [];
    const containsIOUAction = _.any(reportActionList,
        reportAction => reportAction.action === CONST.REPORT.ACTIONS.TYPE.IOU);

    // If there aren't any IOU actions, we don't need to fetch any additional data
    if (!containsIOUAction) {
        return;
    }

    // If we don't have one participant (other than the current user), this is not an IOU
    const participants = getParticipantEmailsFromReport(chatReport);
    if (participants.length !== 1) {
        Log.alert('[Report] Report with IOU action has more than 2 participants', true, {
            reportID: chatReport.reportID,
            participants,
        });
        return;
    }

    // Since the Chat and the IOU are different reports with different reportIDs, and GetIOUReport only returns the
    // IOU's reportID, keep track of the IOU's reportID so we can use it to get the IOUReport data via `GetReportStuff`.
    // Note: GetIOUReport does not return IOU reports that have been settled.
    let iouReportID = 0;
    return API.GetIOUReport({
        debtorEmail: participants[0],
    }).then((response) => {
        iouReportID = response.reportID || 0;
        if (response.jsonCode !== 200) {
            throw new Error(response.message);
        } else if (iouReportID === 0) {
            // If there is no IOU report for this user then we will assume it has been paid and do nothing here.
            // All reports are initialized with hasOutstandingIOU: false. Since the IOU report we were looking for has
            // been settled then there's nothing more to do.
            console.debug('GetIOUReport returned a reportID of 0, not fetching IOU report data');
            return;
        }

        return API.Get({
            returnValueList: 'reportStuff',
            reportIDList: iouReportID,
            shouldLoadOptionalKeys: true,
            includePinnedReports: true,
        });
    }).then((response) => {
        if (!response) {
            return;
        }

        if (response.jsonCode !== 200) {
            throw new Error(response.message);
        }

        const iouReportData = response.reports[iouReportID];
        if (!iouReportData) {
            throw new Error(`No iouReportData found for reportID ${iouReportID}`);
        }
        return getSimplifiedIOUReport(iouReportData, chatReport.reportID);
    }).catch((error) => {
        console.debug(`[Report] Failed to populate IOU Collection: ${error.message}`);
    });
}

/**
 * Fetches chat reports when provided a list of
 * chat report IDs
 *
 * @param {Array} chatList
 * @return {Promise} only used internally when fetchAll() is called
 */
function fetchChatReportsByIDs(chatList) {
    let fetchedReports;
    const simplifiedReports = {};
    return API.Get({
        returnValueList: 'reportStuff',
        reportIDList: chatList.join(','),
        shouldLoadOptionalKeys: true,
        includePinnedReports: true,
    })
        .then(({reports}) => {
            Log.info('[Report] successfully fetched report data', true);
            fetchedReports = reports;
            return Promise.all(_.map(fetchedReports, updateIOUReportData));
        })
        .then((iouReportObjects) => {
            // Process the reports and store them in Onyx. At the same time we'll save the simplified reports in this
            // variable called simplifiedReports which hold the participants (minus the current user) for each report.
            // Using this simplifiedReport we can call PersonalDetails.getFromReportParticipants to get the
            // personal details of all the participants and even link up their avatars to report icons.
            const reportIOUData = {};
            _.each(fetchedReports, (report) => {
                const simplifiedReport = getSimplifiedReportObject(report);
                simplifiedReports[`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`] = simplifiedReport;
            });

            _.each(iouReportObjects, (iouReportObject) => {
                if (!iouReportObject) {
                    return;
                }

                const iouReportKey = `${ONYXKEYS.COLLECTION.REPORT_IOUS}${iouReportObject.reportID}`;
                const reportKey = `${ONYXKEYS.COLLECTION.REPORT}${iouReportObject.chatReportID}`;
                reportIOUData[iouReportKey] = iouReportObject;
                simplifiedReports[reportKey].iouReportID = iouReportObject.reportID;
                simplifiedReports[reportKey].hasOutstandingIOU = iouReportObject.stateNum === 1
                    && iouReportObject.total !== 0;
            });

            // We use mergeCollection such that it updates the collection in one go.
            // Any withOnyx subscribers to this key will also receive the complete updated props just once
            // than updating props for each report and re-rendering had merge been used.
            Onyx.mergeCollection(ONYXKEYS.COLLECTION.REPORT_IOUS, reportIOUData);
            Onyx.mergeCollection(ONYXKEYS.COLLECTION.REPORT, simplifiedReports);
            Onyx.set(ONYXKEYS.INITIAL_REPORT_DATA_LOADED, true);

            // Fetch the personal details if there are any
            PersonalDetails.getFromReportParticipants(Object.values(simplifiedReports));

            return _.map(fetchedReports, report => report.reportID);
        });
}

/**
 * Update the lastRead actionID and timestamp in local memory and Onyx
 *
 * @param {Number} reportID
 * @param {Number} sequenceNumber
 */
function setLocalLastRead(reportID, sequenceNumber) {
    lastReadSequenceNumbers[reportID] = sequenceNumber;

    // Update the report optimistically
    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {
        unreadActionCount: 0,
        lastVisitedTimestamp: Date.now(),
    });
}

/**
 * Remove all optimistic actions from report actions and reset the optimisticReportActionsIDs array. We do this
 * to clear any stuck optimistic actions that have not be updated for whatever reason.
 *
 * @param {Number} reportID
 */
function removeOptimisticActions(reportID) {
    const actionIDs = optimisticReportActionIDs[reportID] || [];
    const actionsToRemove = _.reduce(actionIDs, (actions, actionID) => ({
        ...actions,
        [actionID]: null,
    }), {});
    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, actionsToRemove);

    // Reset the optimistic report action IDs to an empty array
    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {
        optimisticReportActionIDs: [],
    });
}

/**
 * Updates a report in the store with a new report action
 *
 * @param {Number} reportID
 * @param {Object} reportAction
 */
function updateReportWithNewAction(reportID, reportAction) {
    const newMaxSequenceNumber = reportAction.sequenceNumber;
    const isFromCurrentUser = reportAction.actorAccountID === currentUserAccountID;
    const initialLastReadSequenceNumber = lastReadSequenceNumbers[reportID] || 0;

    // When handling an action from the current users we can assume that their
    // last read actionID has been updated in the server but not necessarily reflected
    // locally so we must first update it and then calculate the unread (which should be 0)
    if (isFromCurrentUser) {
        setLocalLastRead(reportID, newMaxSequenceNumber);
    }

    const messageText = lodashGet(reportAction, ['message', 0, 'text'], '');

    // Always merge the reportID into Onyx
    // If the report doesn't exist in Onyx yet, then all the rest of the data will be filled out
    // by handleReportChanged
    const updatedReportObject = {
        reportID,

        // Use updated lastReadSequenceNumber, value may have been modified by setLocalLastRead
        unreadActionCount: newMaxSequenceNumber - (lastReadSequenceNumbers[reportID] || 0),
        maxSequenceNumber: reportAction.sequenceNumber,
    };

    // If the report action from pusher is a higher sequence number than we know about (meaning it has come from
    // a chat participant in another application), then the last message text and author needs to be updated as well
    if (newMaxSequenceNumber > initialLastReadSequenceNumber) {
        updatedReportObject.lastMessageTimestamp = reportAction.timestamp;
        updatedReportObject.lastMessageText = messageText;
        updatedReportObject.lastActorEmail = reportAction.actorEmail;
    }

    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, updatedReportObject);

    const reportActionsToMerge = {};
    if (reportAction.clientID) {
        // Remove the optimistic action from the report since we are about to replace it with the real one (which has
        // the true sequenceNumber)
        reportActionsToMerge[reportAction.clientID] = null;
    }

    // Add the action into Onyx
    reportActionsToMerge[reportAction.sequenceNumber] = {
        ...reportAction,
        isAttachment: isReportMessageAttachment(messageText),
        loading: false,
    };

    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, reportActionsToMerge);

    if (!ActiveClientManager.isClientTheLeader()) {
        console.debug('[LOCAL_NOTIFICATION] Skipping notification because this client is not the leader');
        return;
    }

    // If this comment is from the current user we don't want to parrot whatever they wrote back to them.
    if (isFromCurrentUser) {
        console.debug('[LOCAL_NOTIFICATION] No notification because comment is from the currently logged in user');
        return;
    }

    // If we are currently viewing this report do not show a notification.
    if (reportID === lastViewedReportID && Visibility.isVisible()) {
        console.debug('[LOCAL_NOTIFICATION] No notification because it was a comment for the current report');
        return;
    }

    // If the comment came from Concierge let's not show a notification since we already show one for expensify.com
    if (lodashGet(reportAction, 'actorEmail') === 'concierge@expensify.com') {
        return;
    }
    console.debug('[LOCAL_NOTIFICATION] Creating notification');
    LocalNotification.showCommentNotification({
        reportAction,
        onClick: () => {
            // Navigate to this report onClick
            Navigation.navigate(ROUTES.getReportRoute(reportID));
        },
    });
}

/**
 * Get the private pusher channel name for a Report.
 *
 * @param {Number} reportID
 * @returns {String}
 */
function getReportChannelName(reportID) {
    return `private-report-reportID-${reportID}`;
}

/**
 * Initialize our pusher subscriptions to listen for new report comments
 */
function subscribeToReportCommentEvents() {
    // If we don't have the user's accountID yet we can't subscribe so return early
    if (!currentUserAccountID) {
        return;
    }

    const pusherChannelName = `private-user-accountID-${currentUserAccountID}`;
    if (Pusher.isSubscribed(pusherChannelName) || Pusher.isAlreadySubscribing(pusherChannelName)) {
        return;
    }

    Pusher.subscribe(pusherChannelName, 'reportComment', (pushJSON) => {
        Log.info('[Report] Handled event sent by Pusher', true, {reportID: pushJSON.reportID});
        updateReportWithNewAction(pushJSON.reportID, pushJSON.reportAction);
    }, false,
    () => {
        NetworkConnection.triggerReconnectionCallbacks('pusher re-subscribed to private user channel');
    })
        .catch((error) => {
            Log.info('[Report] Failed to initially subscribe to Pusher channel', true, {error, pusherChannelName});
        });

    PushNotification.onReceived(PushNotification.TYPE.REPORT_COMMENT, ({reportID, reportAction}) => {
        Log.info('[Report] Handled event sent by Airship', true, {reportID});
        updateReportWithNewAction(reportID, reportAction);
    });

    // Open correct report when push notification is clicked
    PushNotification.onSelected(PushNotification.TYPE.REPORT_COMMENT, ({reportID}) => {
        Navigation.navigate(ROUTES.getReportRoute(reportID));
    });
}

/**
 * There are 2 possibilities that we can receive via pusher for a user's typing status:
 * 1. The "new" way from e.cash is passed as {[login]: Boolean} (e.g. {yuwen@expensify.com: true}), where the value
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
 * @param {Number} reportID
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
            Log.info('[Report] Failed to initially subscribe to Pusher channel', true, {error, pusherChannelName});
        });
}

/**
 * Remove our pusher subscriptions to listen for someone typing in a report.
 *
 * @param {Number} reportID
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
 * Get the report ID for a chat report for a specific
 * set of participants and redirect to it.
 *
 * @param {String[]} participants
 */
function fetchOrCreateChatReport(participants) {
    if (participants.length < 2) {
        throw new Error('fetchOrCreateChatReport() must have at least two participants');
    }

    API.CreateChatReport({
        emailList: participants.join(','),
    })
        .then((data) => {
            if (data.jsonCode !== 200) {
                throw new Error(data.message);
            }

            // Merge report into Onyx
            const reportID = data.reportID;
            Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {reportID});

            // Redirect the logged in person to the new report
            Navigation.navigate(ROUTES.getReportRoute(reportID));
        });
}

/**
 * Get all chat reports and provide the proper report name
 * by fetching sharedReportList and personalDetails
 *
 * @returns {Promise} only used internally when fetchAll() is called
 */
function fetchChatReports() {
    return API.Get({
        returnValueList: 'chatList',
    })
        .then((response) => {
            if (response.jsonCode !== 200) {
                return;
            }

            // Get all the chat reports if they have any, otherwise create one with concierge
            if (lodashGet(response, 'chatList', []).length) {
                // The string cast here is necessary as Get rvl='chatList' may return an int
                fetchChatReportsByIDs(String(response.chatList).split(','));
            } else {
                fetchOrCreateChatReport([currentUserEmail, 'concierge@expensify.com']);
            }

            return response.chatList;
        });
}

/**
 * Get the actions of a report
 *
 * @param {Number} reportID
 * @param {Number} [offset]
 * @returns {Promise}
 */
function fetchActions(reportID, offset) {
    const reportActionsOffset = !_.isUndefined(offset) ? offset : -1;

    if (!_.isNumber(reportActionsOffset)) {
        Log.alert('[Report] Offset provided is not a number', true, {
            offset,
            reportActionsOffset,
        });
        return;
    }

    return API.Report_GetHistory({
        reportID,
        reportActionsOffset,
        reportActionsLimit: CONST.REPORT.ACTIONS.LIMIT,
    })
        .then((data) => {
            // We must remove all optimistic actions so there will not be any stuck comments. At this point, we should
            // be caught up and no longer need any optimistic comments.
            removeOptimisticActions(reportID);

            const indexedData = _.indexBy(data.history, 'sequenceNumber');
            const maxSequenceNumber = _.chain(data.history)
                .pluck('sequenceNumber')
                .max()
                .value();

            Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, indexedData);
            Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {maxSequenceNumber});
        });
}

/**
 * Get all of our reports
 *
 * @param {Boolean} shouldRedirectToReport this is set to false when the network reconnect code runs
 * @param {Boolean} shouldRecordHomePageTiming whether or not performance timing should be measured
 */
function fetchAll(shouldRedirectToReport = true, shouldRecordHomePageTiming = false) {
    fetchChatReports()
        .then((reportIDs) => {
            if (shouldRedirectToReport) {
                // Update currentlyViewedReportID to be our first reportID from our report collection if we don't have
                // one already.
                if (lastViewedReportID) {
                    return;
                }

                const firstReportID = _.first(reportIDs);
                const currentReportID = firstReportID ? String(firstReportID) : '';
                Onyx.merge(ONYXKEYS.CURRENTLY_VIEWED_REPORTID, currentReportID);
            }

            Log.info('[Report] Fetching report actions for reports', true, {reportIDs});
            _.each(reportIDs, (reportID) => {
                fetchActions(reportID);
            });

            if (shouldRecordHomePageTiming) {
                Timing.end(CONST.TIMING.HOMEPAGE_REPORTS_LOADED);
            }
        });
}

/**
 * Add an action item to a report
 *
 * @param {Number} reportID
 * @param {String} text
 * @param {Object} [file]
 */
function addAction(reportID, text, file) {
    // Convert the comment from MD into HTML because that's how it is stored in the database
    const parser = new ExpensiMark();
    const commentText = parser.replace(text);
    const isAttachment = _.isEmpty(text) && file !== undefined;

    // The new sequence number will be one higher than the highest
    const highestSequenceNumber = reportMaxSequenceNumbers[reportID] || 0;
    const newSequenceNumber = highestSequenceNumber + 1;
    const htmlForNewComment = isAttachment ? 'Uploading Attachment...' : commentText;

    // Remove HTML from text when applying optimistic offline comment
    const textForNewComment = isAttachment ? '[Attachment]'
        : htmlForNewComment.replace(/<[^>]*>?/gm, '');

    // Update the report in Onyx to have the new sequence number
    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {
        maxSequenceNumber: newSequenceNumber,
        lastMessageTimestamp: moment().unix(),
        lastMessageText: textForNewComment,
        lastActorEmail: currentUserEmail,
    });

    // Generate a clientID so we can save the optimistic action to storage with the clientID as key. Later, we will
    // remove the optimistic action when we add the real action created in the server. We do this because it's not
    // safe to assume that this will use the very next sequenceNumber. An action created by another can overwrite that
    // sequenceNumber if it is created before this one. We use a combination of current epoch timestamp (milliseconds)
    // and a random number so that the probability of someone else having the same optimisticReportActionID is
    // extremely low even if they left the comment at the same moment as another user on the same report. The random
    // number is 3 digits because if we go any higher JS will convert the digits after the 16th position to 0's in
    // optimisticReportActionID.
    const randomNumber = Math.floor((Math.random() * (999 - 100)) + 100);
    const optimisticReportActionID = parseInt(`${Date.now()}${randomNumber}`, 10);

    // Store the optimistic action ID on the report the comment was added to. It will be removed later when refetching
    // report actions in order to clear out any stuck actions (i.e. actions where the client never received a Pusher
    // event, for whatever reason, from the server with the new action data
    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {
        optimisticReportActionIDs: [...(optimisticReportActionIDs[reportID] || []), optimisticReportActionID],
    });

    // Optimistically add the new comment to the store before waiting to save it to the server
    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
        [optimisticReportActionID]: {
            actionName: 'ADDCOMMENT',
            actorEmail: currentUserEmail,
            actorAccountID: currentUserAccountID,
            person: [
                {
                    style: 'strong',
                    text: myPersonalDetails.displayName || currentUserEmail,
                    type: 'TEXT',
                },
            ],
            automatic: false,

            // Use the client generated ID as a optimistic action ID so we can remove it later
            sequenceNumber: optimisticReportActionID,
            avatar: myPersonalDetails.avatar,
            timestamp: moment().unix(),
            message: [
                {
                    type: 'COMMENT',
                    html: htmlForNewComment,
                    text: textForNewComment,
                },
            ],
            isFirstItem: false,
            isAttachment,
            loading: true,
            shouldShow: true,
        },
    });

    API.Report_AddComment({
        reportID,
        reportComment: commentText,
        file,
        clientID: optimisticReportActionID,

        // The persist flag enables this request to be retried if we are offline and the app is completely killed. We do
        // not retry attachments as we have no solution for storing them persistently and attachments can't be "lost" in
        // the same way report actions can.
        persist: !isAttachment,
    })
        .then(({reportAction}) => updateReportWithNewAction(reportID, reportAction));
}

/**
 * Updates the last read action ID on the report. It optimistically makes the change to the store, and then let's the
 * network layer handle the delayed write.
 *
 * @param {Number} reportID
 * @param {Number} sequenceNumber
 */
function updateLastReadActionID(reportID, sequenceNumber) {
    const currentMaxSequenceNumber = reportMaxSequenceNumbers[reportID];
    if (sequenceNumber < currentMaxSequenceNumber) {
        return;
    }

    setLocalLastRead(reportID, sequenceNumber);

    // Mark the report as not having any unread items
    API.Report_UpdateLastRead({
        accountID: currentUserAccountID,
        reportID,
        sequenceNumber,
    });
}

/**
 * Toggles the pinned state of the report
 *
 * @param {Object} report
 */
function togglePinnedState(report) {
    const pinnedValue = !report.isPinned;
    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, {isPinned: pinnedValue});
    API.Report_TogglePinned({
        reportID: report.reportID,
        pinnedValue,
    });
}

/**
 * Saves the comment left by the user as they are typing. By saving this data the user can switch between chats, close
 * tab, refresh etc without worrying about loosing what they typed out.
 *
 * @param {Number} reportID
 * @param {String} comment
 */
function saveReportComment(reportID, comment) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${reportID}`, comment);
}

/**
 * Broadcasts whether or not a user is typing on a report over the report's private pusher channel.
 *
 * @param {Number} reportID
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
    if (!report) {
        return;
    }

    // A report can be missing a name if a comment is received via pusher event
    // and the report does not yet exist in Onyx (eg. a new DM created with the logged in person)
    if (report.reportID && report.reportName === undefined) {
        fetchChatReportsByIDs([report.reportID]);
    }

    // Store the max sequence number for each report
    reportMaxSequenceNumbers[report.reportID] = report.maxSequenceNumber;

    // Store optimistic actions IDs for each report
    optimisticReportActionIDs[report.reportID] = report.optimisticReportActionIDs;
}

/**
 * @param {Number} reportID
 */
function updateCurrentlyViewedReportID(reportID) {
    Onyx.merge(ONYXKEYS.CURRENTLY_VIEWED_REPORTID, String(reportID));
}

Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT,
    callback: handleReportChanged,
});

// When the app reconnects from being offline, fetch all of the reports and their actions
NetworkConnection.onReconnect(() => {
    fetchAll(false);
});

export {
    fetchAll,
    fetchActions,
    fetchOrCreateChatReport,
    addAction,
    updateLastReadActionID,
    subscribeToReportCommentEvents,
    subscribeToReportTypingEvents,
    unsubscribeFromReportChannel,
    saveReportComment,
    broadcastUserIsTyping,
    togglePinnedState,
    updateCurrentlyViewedReportID,
    getSimplifiedIOUReport,
    getSimplifiedReportObject,
};
