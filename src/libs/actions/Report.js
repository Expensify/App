import moment from 'moment';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import ExpensiMark from 'expensify-common/lib/ExpensiMark';
import Str from 'expensify-common/lib/str';
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
import {
    isConciergeChatReport, isDefaultRoom, isReportMessageAttachment, sortReportsByLastVisited,
} from '../reportUtils';
import Timers from '../Timers';
import {dangerouslyGetReportActionsMaxSequenceNumber, isReportMissingActions} from './ReportActions';
import Growl from '../Growl';
import {translateLocal} from '../translate';

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

const allReports = {};
let conciergeChatReportID;
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT,
    callback: (val) => {
        if (val && val.reportID) {
            allReports[val.reportID] = val;

            if (isConciergeChatReport(val)) {
                conciergeChatReportID = val.reportID;
            }
        }
    },
});

const typingWatchTimers = {};

/**
 * Map of the most recent sequenceNumber for a reports_* key in Onyx by reportID.
 *
 * There are several sources that can set the most recent reportAction's sequenceNumber for a report:
 *
 *     - Fetching the report object
 *     - Fetching the report history
 *     - Optimistically creating a report action
 *     - Handling a report action via Pusher
 *
 * Those values are stored in reportMaxSequenceNumbers and treated as the main source of truth for each report's max
 * sequenceNumber.
 */
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

    if (report.reportActionCount === 0) {
        return 0;
    }

    if (!lastReadSequenceNumber) {
        return report.reportActionCount;
    }

    // There are unread items if the last one the user has read is less
    // than the highest sequence number we have
    const unreadActionCount = report.reportActionCount - lastReadSequenceNumber;
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
 * Returns the title for a default room or generates one based on the participants
 *
 * @param {Object} fullReport
 * @param {String} chatType
 * @return {String}
 */
function getChatReportName(fullReport, chatType) {
    if (isDefaultRoom({chatType})) {
        return `#${fullReport.reportName}`;
    }

    const {sharedReportList} = fullReport;
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
    const createTimestamp = lodashGet(report, 'lastActionCreated', 0);
    const lastMessageTimestamp = moment.utc(createTimestamp).unix();
    const lastActionMessage = lodashGet(report, ['lastActionMessage', 'html'], '');
    const isLastMessageAttachment = /<img([^>]+)\/>/gi.test(lastActionMessage);
    const chatType = lodashGet(report, ['reportNameValuePairs', 'chatType'], '');

    // We are removing any html tags from the message html since we cannot access the text version of any comments as
    // the report only has the raw reportActionList and not the processed version returned by Report_GetHistory
    // We convert the line-breaks in html to space ' ' before striping the tags
    const lastMessageText = lastActionMessage
        .replace(/((<br[^>]*>)+)/gi, ' ')
        .replace(/(<([^>]+)>)/gi, '');
    const reportName = lodashGet(report, ['reportNameValuePairs', 'type']) === 'chat'
        ? getChatReportName(report, chatType)
        : report.reportName;
    const lastActorEmail = lodashGet(report, 'lastActionActorEmail', '');
    const notificationPreference = isDefaultRoom({chatType})
        ? lodashGet(report, ['reportNameValuePairs', 'notificationPreferences', currentUserAccountID], 'daily')
        : '';

    return {
        reportID: report.reportID,
        reportName,
        chatType,
        ownerEmail: lodashGet(report, ['ownerEmail'], ''),
        policyID: lodashGet(report, ['reportNameValuePairs', 'expensify_policyID'], ''),
        unreadActionCount: getUnreadActionCount(report),
        maxSequenceNumber: lodashGet(report, 'reportActionCount', 0),
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
        notificationPreference,
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
 * Given IOU and chat report ID fetches most recent IOU data from API.
 *
 * @param {Number} iouReportID
 * @param {Number} chatReportID
 * @returns {Promise}
 */
function fetchIOUReport(iouReportID, chatReportID) {
    return API.Get({
        returnValueList: 'reportStuff',
        reportIDList: iouReportID,
        shouldLoadOptionalKeys: true,
        includePinnedReports: true,
    }).then((response) => {
        if (!response) {
            return;
        }
        if (response.jsonCode !== 200) {
            console.error(response.message);
            return;
        }
        const iouReportData = response.reports[iouReportID];
        if (!iouReportData) {
            // IOU data for a report will be missing when the IOU report has already been paid.
            // This is expected and we return early as no further processing can be done.
            return;
        }
        return getSimplifiedIOUReport(iouReportData, chatReportID);
    }).catch((error) => {
        console.debug(`[Report] Failed to populate IOU Collection: ${error.message}`);
    });
}

/**
 * Given debtorEmail finds active IOU report ID via GetIOUReport API call
 *
 * @param {String} debtorEmail
 * @returns {Promise}
 */
function fetchIOUReportID(debtorEmail) {
    return API.GetIOUReport({
        debtorEmail,
    }).then((response) => {
        const iouReportID = response.reportID || 0;
        if (response.jsonCode !== 200) {
            console.error(response.message);
            return;
        }
        if (iouReportID === 0) {
            // If there is no IOU report for this user then we will assume it has been paid and do nothing here.
            // All reports are initialized with hasOutstandingIOU: false. Since the IOU report we were looking for has
            // been settled then there's nothing more to do.
            console.debug('GetIOUReport returned a reportID of 0, not fetching IOU report data');
            return;
        }
        return iouReportID;
    });
}

/**
 * Fetches chat reports when provided a list of
 * chat report IDs
 *
 * @param {Array} chatList
 * @returns {Promise<Number[]>} only used internally when fetchAllReports() is called
 */
function fetchChatReportsByIDs(chatList) {
    let fetchedReports;
    const simplifiedReports = {};
    return API.GetReportSummaryList({reportIDList: chatList.join(',')})
        .then(({reportSummaryList}) => {
            Log.info('[Report] successfully fetched report data', true);
            fetchedReports = reportSummaryList;
            return Promise.all(_.map(fetchedReports, (chatReport) => {
                // If there aren't any IOU actions, we don't need to fetch any additional data
                if (!chatReport.hasIOUAction) {
                    return;
                }

                // Group chat reports cannot and should not be associated with a specific IOU report
                const participants = getParticipantEmailsFromReport(chatReport);
                if (participants.length > 1) {
                    return;
                }
                if (participants.length === 0) {
                    Log.alert('[Report] Report with IOU action but does not have any participant.', true, {
                        reportID: chatReport.reportID,
                        participants,
                    });
                    return;
                }

                return fetchIOUReportID(participants[0])
                    .then(iouReportID => fetchIOUReport(iouReportID, chatReport.reportID));
            }));
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
                simplifiedReports[reportKey].hasOutstandingIOU = iouReportObject.stateNum
                    === CONST.REPORT.STATE_NUM.PROCESSING && iouReportObject.total !== 0;
            });

            // We use mergeCollection such that it updates the collection in one go.
            // Any withOnyx subscribers to this key will also receive the complete updated props just once
            // than updating props for each report and re-rendering had merge been used.
            Onyx.mergeCollection(ONYXKEYS.COLLECTION.REPORT_IOUS, reportIOUData);
            Onyx.mergeCollection(ONYXKEYS.COLLECTION.REPORT, simplifiedReports);

            // Fetch the personal details if there are any
            PersonalDetails.getFromReportParticipants(Object.values(simplifiedReports));

            return _.map(fetchedReports, report => report.reportID);
        });
}

/**
 * Given IOU object, save the data to Onyx.
 *
 * @param {Object} iouReportObject
 * @param {Number} iouReportObject.stateNum
 * @param {Number} iouReportObject.total
 * @param {Number} iouReportObject.reportID
 */
function setLocalIOUReportData(iouReportObject) {
    const iouReportKey = `${ONYXKEYS.COLLECTION.REPORT_IOUS}${iouReportObject.reportID}`;
    Onyx.merge(iouReportKey, iouReportObject);
}

/**
 * Update the lastRead actionID and timestamp in local memory and Onyx
 *
 * @param {Number} reportID
 * @param {Number} lastReadSequenceNumber
 */
function setLocalLastRead(reportID, lastReadSequenceNumber) {
    lastReadSequenceNumbers[reportID] = lastReadSequenceNumber;
    const reportMaxSequenceNumber = reportMaxSequenceNumbers[reportID];

    // Determine the number of unread actions by deducting the last read sequence from the total. If, for some reason,
    // the last read sequence is higher than the actual last sequence, let's just assume all actions are read
    const unreadActionCount = Math.max(reportMaxSequenceNumber - lastReadSequenceNumber, 0);

    // Update the report optimistically.
    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {
        unreadActionCount,
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
 * Fetch the iouReport and persist the data to Onyx.
 *
 * @param {Number} iouReportID - ID of the report we are fetching
 * @param {Number} chatReportID - associated chatReportID, set as an iouReport field
 * @returns {Promise}
 */
function fetchIOUReportByID(iouReportID, chatReportID) {
    return fetchIOUReport(iouReportID, chatReportID)
        .then((iouReportObject) => {
            setLocalIOUReportData(iouReportObject);
            return iouReportObject;
        });
}

/**
 * If an iouReport is open (has an IOU, but is not yet paid) then we sync the reportIDs of both chatReport and
 * iouReport in Onyx, simplifying IOU data retrieval and reducing necessary API calls when displaying IOU components:
 * - chatReport: {id: 123, iouReportID: 987, ...}
 * - iouReport: {id: 987, chatReportID: 123, ...}
 *
 * The reports must remain in sync when the iouReport is modified. This function ensures that we sync reportIds after
 * fetching the iouReport and therefore should only be called if we are certain that the fetched iouReport is currently
 * open - else we would overwrite the existing open iouReportID with a closed iouReportID.
 *
 * Examples of usage include 'receieving a push notification', or 'paying an IOU', because both of these cases can only
 * occur for an iouReport that is currently open (notifications are not sent for closed iouReports, and you cannot pay a
 * closed IOU).
 *
 * @param {Number} iouReportID - ID of the report we are fetching
 * @param {Number} chatReportID - associated chatReportID, used to sync the reports
 */
function fetchIOUReportByIDAndUpdateChatReport(iouReportID, chatReportID) {
    fetchIOUReportByID(iouReportID, chatReportID)
        .then((iouReportObject) => {
            // Now sync the chatReport data to ensure it has a reference to the updated iouReportID
            const chatReportObject = {
                hasOutstandingIOU: iouReportObject.stateNum === CONST.REPORT.STATE_NUM.PROCESSING
                    && iouReportObject.total !== 0,
                iouReportID: iouReportObject.reportID,
            };

            if (!chatReportObject.hasOutstandingIOU) {
                chatReportObject.iouReportID = null;
            }

            const reportKey = `${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`;
            Onyx.merge(reportKey, chatReportObject);
        });
}

/**
 * @param {Number} reportID
 * @param {Number} sequenceNumber
 */
function setNewMarkerPosition(reportID, sequenceNumber) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {
        newMarkerSequenceNumber: sequenceNumber,
    });
}

/**
 * Updates a report action's message to be a new value.
 *
 * @param {Number} reportID
 * @param {Number} sequenceNumber
 * @param {Object} message
 */
function updateReportActionMessage(reportID, sequenceNumber, message) {
    const actionToMerge = {};
    actionToMerge[sequenceNumber] = {message: [message]};
    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, actionToMerge);

    // If this is the most recent message, update the lastMessageText in the report object as well
    if (sequenceNumber === reportMaxSequenceNumbers[reportID]) {
        Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {
            lastMessageText: message.html,
        });
    }
}

/**
 * Updates a report in the store with a new report action
 *
 * @param {Number} reportID
 * @param {Object} reportAction
 * @param {String} notificationPreference On what cadence the user would like to be notified
 */
function updateReportWithNewAction(reportID, reportAction, notificationPreference) {
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

    // If chat report receives an action with IOU and we have an IOUReportID, update IOU object
    if (reportAction.actionName === CONST.REPORT.ACTIONS.TYPE.IOU && reportAction.originalMessage.IOUReportID) {
        const iouReportID = reportAction.originalMessage.IOUReportID;

        // We know this iouReport is open because reportActions of type CONST.REPORT.ACTIONS.TYPE.IOU can only be
        // triggered for an open iouReport (an open iouReport has an IOU, but is not yet paid). After fetching the
        // iouReport we must update the chatReport with the correct iouReportID. If we don't, then new IOUs would not
        // be displayed and paid IOUs would show as unpaid.
        fetchIOUReportByIDAndUpdateChatReport(iouReportID, reportID);
    }

    if (!ActiveClientManager.isClientTheLeader()) {
        console.debug('[LOCAL_NOTIFICATION] Skipping notification because this client is not the leader');
        return;
    }

    // We don't want to send a local notification if the user preference is daily or mute
    if (notificationPreference === 'mute' || notificationPreference === 'daily') {
        // eslint-disable-next-line max-len
        console.debug(`[LOCAL_NOTIFICATION] No notification because user preference is to be notified: ${notificationPreference}`);
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
    if (lodashGet(reportAction, 'actorEmail') === CONST.EMAIL.CONCIERGE) {
        return;
    }

    // When a new message comes in, if the New marker is not already set (newMarkerSequenceNumber === 0), set the
    // marker above the incoming message.
    if (lodashGet(allReports, [reportID, 'newMarkerSequenceNumber'], 0) === 0
        && updatedReportObject.unreadActionCount > 0) {
        const oldestUnreadSeq = (updatedReportObject.maxSequenceNumber - updatedReportObject.unreadActionCount) + 1;
        setNewMarkerPosition(reportID, oldestUnreadSeq);
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
 * Updates a report in Onyx with a new pinned state.
 *
 * @param {Number} reportID
 * @param {Boolean} isPinned
 */
function updateReportPinnedState(reportID, isPinned) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {isPinned});
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
 * Initialize our pusher subscriptions to listen for new report comments and pin toggles
 */
function subscribeToUserEvents() {
    // If we don't have the user's accountID yet we can't subscribe so return early
    if (!currentUserAccountID) {
        return;
    }

    const pusherChannelName = `private-user-accountID-${currentUserAccountID}`;
    if (Pusher.isSubscribed(pusherChannelName) || Pusher.isAlreadySubscribing(pusherChannelName)) {
        return;
    }

    // Live-update a report's actions when a 'report comment' event is received.
    Pusher.subscribe(pusherChannelName, Pusher.TYPE.REPORT_COMMENT, (pushJSON) => {
        Log.info(
            `[Report] Handled ${Pusher.TYPE.REPORT_COMMENT} event sent by Pusher`, true, {reportID: pushJSON.reportID},
        );
        updateReportWithNewAction(pushJSON.reportID, pushJSON.reportAction, pushJSON.notificationPreference);
    }, false,
    () => {
        NetworkConnection.triggerReconnectionCallbacks('pusher re-subscribed to private user channel');
    })
        .catch((error) => {
            Log.info(
                '[Report] Failed to subscribe to Pusher channel',
                true,
                {error, pusherChannelName, eventName: Pusher.TYPE.REPORT_COMMENT},
            );
        });

    // Live-update a report's actions when an 'edit comment' event is received.
    Pusher.subscribe(pusherChannelName, Pusher.TYPE.REPORT_COMMENT_EDIT, (pushJSON) => {
        Log.info(
            `[Report] Handled ${Pusher.TYPE.REPORT_COMMENT_EDIT} event sent by Pusher`, true, {
                reportActionID: pushJSON.reportActionID,
            },
        );
        updateReportActionMessage(pushJSON.reportID, pushJSON.sequenceNumber, pushJSON.message);
    }, false,
    () => {
        NetworkConnection.triggerReconnectionCallbacks('pusher re-subscribed to private user channel');
    })
        .catch((error) => {
            Log.info(
                '[Report] Failed to subscribe to Pusher channel',
                true,
                {error, pusherChannelName, eventName: Pusher.TYPE.REPORT_COMMENT_EDIT},
            );
        });

    // Live-update a report's pinned state when a 'report toggle pinned' event is received.
    Pusher.subscribe(pusherChannelName, Pusher.TYPE.REPORT_TOGGLE_PINNED, (pushJSON) => {
        Log.info(
            `[Report] Handled ${Pusher.TYPE.REPORT_TOGGLE_PINNED} event sent by Pusher`,
            true,
            {reportID: pushJSON.reportID},
        );
        updateReportPinnedState(pushJSON.reportID, pushJSON.isPinned);
    }, false,
    () => {
        NetworkConnection.triggerReconnectionCallbacks('pusher re-subscribed to private user channel');
    })
        .catch((error) => {
            Log.info(
                '[Report] Failed to subscribe to Pusher channel',
                true,
                {error, pusherChannelName, eventName: Pusher.TYPE.REPORT_TOGGLE_PINNED},
            );
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
 * set of participants and navigate to it if wanted.
 *
 * @param {String[]} participants
 * @param {Boolean} shouldNavigate
 * @returns {Promise<Number[]>}
 */
function fetchOrCreateChatReport(participants, shouldNavigate = true) {
    if (participants.length < 2) {
        throw new Error('fetchOrCreateChatReport() must have at least two participants.');
    }

    return API.CreateChatReport({
        emailList: participants.join(','),
    })
        .then((data) => {
            if (data.jsonCode !== 200) {
                console.error(data.message);
                return;
            }

            // Merge report into Onyx
            Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${data.reportID}`, {reportID: data.reportID});

            if (shouldNavigate) {
                // Redirect the logged in person to the new report
                Navigation.navigate(ROUTES.getReportRoute(data.reportID));
            }

            // We are returning an array with the reportID here since fetchAllReports calls this method or
            // fetchChatReportsByIDs which returns an array of reportIDs.
            return [data.reportID];
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
 * @param {Boolean} shouldRecordHomePageTiming whether or not performance timing should be measured
 * @param {Boolean} shouldDelayActionsFetch when the app loads we want to delay the fetching of additional actions
 * @returns {Promise}
 */
function fetchAllReports(
    shouldRecordHomePageTiming = false,
    shouldDelayActionsFetch = false,
) {
    return API.Get({
        returnValueList: 'chatList',
    })
        .then((response) => {
            if (response.jsonCode !== 200) {
                return;
            }

            // The cast here is necessary as Get rvl='chatList' may return an int or Array
            const reportIDs = String(response.chatList)
                .split(',')
                .filter(_.identity);

            // Get all the chat reports if they have any, otherwise create one with concierge
            if (reportIDs.length > 0) {
                return fetchChatReportsByIDs(reportIDs);
            }

            return fetchOrCreateChatReport([currentUserEmail, CONST.EMAIL.CONCIERGE], false);
        })
        .then((returnedReportIDs) => {
            Onyx.set(ONYXKEYS.INITIAL_REPORT_DATA_LOADED, true);

            if (shouldRecordHomePageTiming) {
                Timing.end(CONST.TIMING.HOMEPAGE_REPORTS_LOADED);
            }

            // Delay fetching report history as it significantly increases sign in to interactive time.
            // Register the timer so we can clean it up if the user quickly logs out after logging in. If we don't
            // cancel the timer we'll make unnecessary API requests from the sign in page.
            Timers.register(setTimeout(() => {
                // Filter reports to see which ones have actions we need to fetch so we can preload Onyx with new
                // content and improve chat switching experience by only downloading content we don't have yet.
                // This improves performance significantly when reconnecting by limiting API requests and unnecessary
                // data processing by Onyx.
                const reportIDsWithMissingActions = _.filter(returnedReportIDs, id => (
                    isReportMissingActions(id, reportMaxSequenceNumbers[id])
                ));

                // Once we have the reports that are missing actions we will find the intersection between the most
                // recently accessed reports and reports missing actions. Then we'll fetch the history for a small
                // set to avoid making too many network requests at once.
                const reportIDsToFetchActions = _.chain(sortReportsByLastVisited(allReports))
                    .map(report => report.reportID)
                    .reverse()
                    .intersection(reportIDsWithMissingActions)
                    .slice(0, 10)
                    .value();

                if (_.isEmpty(reportIDsToFetchActions)) {
                    console.debug('[Report] Local reportActions up to date. Not fetching additional actions.');
                    return;
                }

                console.debug('[Report] Fetching reportActions for reportIDs: ', {
                    reportIDs: reportIDsToFetchActions,
                });
                _.each(reportIDsToFetchActions, (reportID) => {
                    const offset = dangerouslyGetReportActionsMaxSequenceNumber(reportID, false);
                    fetchActions(reportID, offset);
                });

                // We are waiting a set amount of time to allow the UI to finish loading before bogging it down with
                // more requests and operations. Startup delay is longer since there is a lot more work done to build
                // up the UI when the app first initializes.
            }, shouldDelayActionsFetch ? CONST.FETCH_ACTIONS_DELAY.STARTUP : CONST.FETCH_ACTIONS_DELAY.RECONNECT));
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
        : htmlForNewComment.replace(/((<br[^>]*>)+)/gi, ' ').replace(/<[^>]*>?/gm, '');

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
            actionName: CONST.REPORT.ACTIONS.TYPE.ADDCOMMENT,
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
            clientID: optimisticReportActionID,
            avatar: myPersonalDetails.avatar,
            timestamp: moment().unix(),
            message: [
                {
                    type: CONST.REPORT.MESSAGE.TYPE.COMMENT,
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
        .then((response) => {
            if (response.jsonCode === 408) {
                Growl.error(translateLocal('reportActionCompose.fileUploadFailed'));
                Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
                    [optimisticReportActionID]: null,
                });
                console.error(response.message);
                return;
            }
            updateReportWithNewAction(reportID, response.reportAction);
        });
}

/**
 * Deletes a comment from the report, basically sets it as empty string
 *
 * @param {Number} reportID
 * @param {Object} reportAction
 */
function deleteReportComment(reportID, reportAction) {
    // Optimistic Response
    const sequenceNumber = reportAction.sequenceNumber;
    const reportActionsToMerge = {};
    const oldMessage = {...reportAction.message};
    reportActionsToMerge[sequenceNumber] = {
        ...reportAction,
        message: [
            {
                type: CONST.REPORT.MESSAGE.TYPE.COMMENT,
                html: '',
                text: '',
            },
        ],
    };

    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, reportActionsToMerge);

    // Try to delete the comment by calling the API
    API.Report_EditComment({
        reportID,
        reportActionID: reportAction.reportActionID,
        reportComment: '',
        sequenceNumber,
    })
        .then((response) => {
            if (response.jsonCode !== 200) {
                // Reverse Optimistic Response
                reportActionsToMerge[sequenceNumber] = {
                    ...reportAction,
                    message: oldMessage,
                };

                Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, reportActionsToMerge);
            }
        });
}

/**
 * Updates the last read action ID on the report. It optimistically makes the change to the store, and then let's the
 * network layer handle the delayed write.
 *
 * @param {Number} reportID
 * @param {Number} [sequenceNumber] This can be used to set the last read actionID to a specific
 *  spot (eg. mark-as-unread). Otherwise, when this param is omitted, the highest sequence number becomes the one that
 *  is last read (meaning that the entire report history has been read)
 */
function updateLastReadActionID(reportID, sequenceNumber) {
    // If we aren't specifying a sequenceNumber and have no valid maxSequenceNumber for this report then we should not
    // update the last read. Most likely, we have just created the report and it has no comments. But we should err on
    // the side of caution and do nothing in this case.
    if (_.isUndefined(sequenceNumber)
        && (!reportMaxSequenceNumbers[reportID] && reportMaxSequenceNumbers[reportID] !== 0)) {
        return;
    }

    // Need to subtract 1 from sequenceNumber so that the "New" marker appears in the right spot (the last read
    // action). If 1 isn't subtracted then the "New" marker appears one row below the action (the first unread action)
    const lastReadSequenceNumber = (sequenceNumber - 1) || reportMaxSequenceNumbers[reportID];

    setLocalLastRead(reportID, lastReadSequenceNumber);

    // Mark the report as not having any unread items
    API.Report_UpdateLastRead({
        accountID: currentUserAccountID,
        reportID,
        sequenceNumber: lastReadSequenceNumber,
    });
}

/**
 * Toggles the pinned state of the report.
 *
 * @param {Object} report
 */
function togglePinnedState(report) {
    const pinnedValue = !report.isPinned;
    updateReportPinnedState(report.reportID, pinnedValue);
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
NetworkConnection.onReconnect(fetchAllReports);

/**
 * Saves a new message for a comment. Marks the comment as edited, which will be reflected in the UI.
 *
 * @param {Number} reportID
 * @param {Object} originalReportAction
 * @param {String} textForNewComment
 */
function editReportComment(reportID, originalReportAction, textForNewComment) {
    const parser = new ExpensiMark();
    const htmlForNewComment = parser.replace(textForNewComment);

    // Skip the Edit if message is not changed
    if (originalReportAction.message[0].html === htmlForNewComment.trim()) {
        return;
    }

    // Optimistically update the report action with the new message
    const sequenceNumber = originalReportAction.sequenceNumber;
    const newReportAction = {...originalReportAction};
    const actionToMerge = {};
    newReportAction.message[0].isEdited = true;
    newReportAction.message[0].html = htmlForNewComment;
    newReportAction.message[0].text = Str.stripHTML(htmlForNewComment.replace(/((<br[^>]*>)+)/gi, ' '));
    actionToMerge[sequenceNumber] = newReportAction;
    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, actionToMerge);

    // Persist the updated report comment
    API.Report_EditComment({
        reportID,
        reportActionID: originalReportAction.reportActionID,
        reportComment: htmlForNewComment,
        sequenceNumber,
    })
        .catch(() => {
            // If it fails, reset Onyx
            actionToMerge[sequenceNumber] = originalReportAction;
            Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, actionToMerge);
        });
}

/**
 * Saves the draft for a comment report action. This will put the comment into "edit mode"
 *
 * @param {Number} reportID
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
    const iouReportKey = `${ONYXKEYS.COLLECTION.REPORT_IOUS}${iouReport.reportID}`;

    // We don't want to sync an iou report that's already been reimbursed with its chat report.
    if (!iouReport.stateNum === CONST.REPORT.STATE_NUM.SUBMITTED) {
        simplifiedReport[chatReportKey].iouReportID = iouReport.reportID;
    }
    simplifiedReport[chatReportKey] = getSimplifiedReportObject(chatReport);
    simplifiedReport[chatReportKey].hasOutstandingIOU = iouReport.stateNum
        === (CONST.REPORT.STATE_NUM.PROCESSING && iouReport.total !== 0);
    simplifiedIouReport[iouReportKey] = getSimplifiedIOUReport(iouReport, chatReport.reportID);

    Onyx.mergeCollection(ONYXKEYS.COLLECTION.REPORT_IOUS, simplifiedIouReport);
    Onyx.mergeCollection(ONYXKEYS.COLLECTION.REPORT, simplifiedReport);
}

/**
 * Updates a user's notification preferences for a chat room
 *
 * @param {Number} reportID
 * @param {String} notificationPreference
 */
function updateNotificationPreference(reportID, notificationPreference) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {notificationPreference});
    API.Report_UpdateNotificationPreference({reportID, notificationPreference});
}

/**
 * Navigates to the 1:1 report with Concierge
 */
function navigateToConciergeChat() {
    // If we don't have a chat with Concierge then create it
    if (!conciergeChatReportID) {
        fetchOrCreateChatReport([currentUserEmail, CONST.EMAIL.CONCIERGE], true);
        return;
    }

    Navigation.navigate(ROUTES.getReportRoute(conciergeChatReportID));
    Navigation.closeDrawer();
}

export {
    fetchAllReports,
    fetchActions,
    fetchOrCreateChatReport,
    fetchChatReportsByIDs,
    fetchIOUReportByID,
    fetchIOUReportByIDAndUpdateChatReport,
    addAction,
    updateLastReadActionID,
    updateNotificationPreference,
    setNewMarkerPosition,
    subscribeToReportTypingEvents,
    subscribeToUserEvents,
    unsubscribeFromReportChannel,
    saveReportComment,
    broadcastUserIsTyping,
    togglePinnedState,
    updateCurrentlyViewedReportID,
    editReportComment,
    saveReportActionDraft,
    deleteReportComment,
    getSimplifiedIOUReport,
    syncChatAndIOUReports,
    navigateToConciergeChat,
};
