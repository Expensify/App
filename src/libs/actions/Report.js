import moment from 'moment';
import _ from 'underscore';
import lodashGet from 'lodash.get';
import ExpensiMark from 'expensify-common/lib/ExpensiMark';
import Onyx from 'react-native-onyx';
import * as API from '../API';
import ONYXKEYS from '../../ONYXKEYS';
import * as Pusher from '../Pusher/pusher';
import LocalNotification from '../Notification/LocalNotification';
import PushNotification from '../Notification/PushNotification';
import * as PersonalDetails from './PersonalDetails';
import {redirect} from './App';
import * as ActiveClientManager from '../ActiveClientManager';
import Visibility from '../Visibility';
import ROUTES from '../../ROUTES';
import NetworkConnection from '../NetworkConnection';
import {hide as hideSidebar} from './Sidebar';

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
    }
});

let currentURL;
Onyx.connect({
    key: ONYXKEYS.CURRENT_URL,
    callback: val => currentURL = val,
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
const lastReadActionIDs = {};

/**
 * Checks the report to see if there are any unread action items
 *
 * @param {object} report
 * @returns {boolean}
 */
function getUnreadActionCount(report) {
    const usersLastReadActionID = lodashGet(report, [
        'reportNameValuePairs',
        `lastReadActionID_${currentUserAccountID}`,
    ]);

    // Save the lastReadActionID locally so we can access this later
    lastReadActionIDs[report.reportID] = usersLastReadActionID;

    if (report.reportActionList.length === 0) {
        return 0;
    }

    if (!usersLastReadActionID) {
        return report.reportActionList.length;
    }

    // There are unread items if the last one the user has read is less
    // than the highest sequence number we have
    const unreadActionCount = report.reportActionList.length - usersLastReadActionID;
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
 * Only store the minimal amount of data in Onyx that needs to be stored
 * because space is limited
 *
 * @param {object} report
 * @param {number} report.reportID
 * @param {string} report.reportName
 * @param {object} report.reportNameValuePairs
 * @returns {object}
 */
function getSimplifiedReportObject(report) {
    return {
        reportID: report.reportID,
        reportName: report.reportName,
        reportNameValuePairs: report.reportNameValuePairs,
        unreadActionCount: getUnreadActionCount(report),
        maxSequenceNumber: report.reportActionList.length,
        participants: getParticipantEmailsFromReport(report),
        isPinned: report.isPinned,
    };
}

/**
 * Returns a generated report title based on the participants
 *
 * @param {array} sharedReportList
 * @return {string}
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
 * Fetches chat reports when provided a list of
 * chat report IDs
 *
 * @param {Array} chatList
 * @return {Promise} only used internally when fetchAll() is called
 */
function fetchChatReportsByIDs(chatList) {
    let fetchedReports;
    return API.get({
        returnValueList: 'reportStuff',
        reportIDList: chatList.join(','),
        shouldLoadOptionalKeys: true,
        includePinnedReports: true,
    })
        .then(({reports}) => {
            fetchedReports = reports;

            // Build array of all participant emails so we can
            // get the personal details.
            let participantEmails = [];

            // Process the reports and store them in Onyx
            _.each(fetchedReports, (report) => {
                const newReport = getSimplifiedReportObject(report);

                participantEmails.push(newReport.participants);

                if (lodashGet(report, 'reportNameValuePairs.type') === 'chat') {
                    newReport.reportName = getChatReportName(report.sharedReportList);
                }

                // Merge the data into Onyx
                Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, newReport);
            });

            // Fetch the person details if there are any
            participantEmails = _.unique(participantEmails);
            if (participantEmails && participantEmails.length !== 0) {
                PersonalDetails.getForEmails(participantEmails.join(','));
            }

            return _.map(fetchedReports, report => report.reportID);
        });
}

/**
 * Update the lastReadActionID in Onyx and local memory.
 *
 * @param {Number} reportID
 * @param {Number} sequenceNumber
 */
function setLocalLastReadActionID(reportID, sequenceNumber) {
    lastReadActionIDs[reportID] = sequenceNumber;

    // Update the lastReadActionID on the report optimistically
    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {
        unreadActionCount: 0,
        reportNameValuePairs: {
            [`lastReadActionID_${currentUserAccountID}`]: sequenceNumber,
        }
    });
}

/**
 * Updates a report in the store with a new report action
 *
 * @param {number} reportID
 * @param {object} reportAction
 */
function updateReportWithNewAction(reportID, reportAction) {
    const newMaxSequenceNumber = reportAction.sequenceNumber;
    const isFromCurrentUser = reportAction.actorAccountID === currentUserAccountID;

    // When handling an action from the current users we can assume that their
    // last read actionID has been updated in the server but not necessarily reflected
    // locally so we must first update it and then calculate the unread (which should be 0)
    if (isFromCurrentUser) {
        setLocalLastReadActionID(reportID, newMaxSequenceNumber);
    }

    // Always merge the reportID into Onyx
    // If the report doesn't exist in Onyx yet, then all the rest of the data will be filled out
    // by handleReportChanged
    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {
        reportID,
        unreadActionCount: newMaxSequenceNumber - (lastReadActionIDs[reportID] || 0),
        maxSequenceNumber: reportAction.sequenceNumber,
    });

    // Add the action into Onyx
    const messageText = lodashGet(reportAction, ['message', 0, 'text'], '');
    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`, {
        [reportAction.sequenceNumber]: {
            ...reportAction,
            isAttachment: messageText === '[Attachment]',
            loading: false,
        },
    });

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
            redirect(ROUTES.getReportRoute(reportID));
        }
    });
}

/**
 * Get the private pusher channel name for a Report.
 *
 * @param {number} reportID
 * @returns {string}
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
        updateReportWithNewAction(pushJSON.reportID, pushJSON.reportAction);
    });

    PushNotification.onReceived(PushNotification.TYPE.REPORT_COMMENT, ({reportID, reportAction}) => {
        updateReportWithNewAction(reportID, reportAction);
    });

    // Open correct report when push notification is clicked
    PushNotification.onSelected(PushNotification.TYPE.REPORT_COMMENT, ({reportID}) => {
        redirect(ROUTES.getReportRoute(reportID));
        hideSidebar();
    });
}

/**
 * Initialize our pusher subscriptions to listen for someone typing in a report.
 *
 * @param {number} reportID
 */
function subscribeToReportTypingEvents(reportID) {
    if (!reportID) {
        return;
    }

    // Make sure we have a clean Typing indicator before subscribing to typing events
    Onyx.set(`${ONYXKEYS.COLLECTION.REPORT_USER_IS_TYPING}${reportID}`, {});

    const pusherChannelName = getReportChannelName(reportID);

    // Typing status is an object with the shape {[login]: Boolean} (e.g. {yuwen@expensify.com: true}), where the value
    // is whether the user with that login is typing on the report or not.
    Pusher.subscribe(pusherChannelName, 'client-userIsTyping', (typingStatus) => {
        const login = _.first(_.keys(typingStatus));
        if (!login) {
            return;
        }

        // Use a combo of the reportID and the login as a key for holding our timers.
        const reportUserIdentifier = `${reportID}-${login}`;
        clearTimeout(typingWatchTimers[reportUserIdentifier]);
        Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_USER_IS_TYPING}${reportID}`, typingStatus);

        // Wait for 1.5s of no additional typing events before setting the status back to false.
        typingWatchTimers[reportUserIdentifier] = setTimeout(() => {
            const typingStoppedStatus = {};
            typingStoppedStatus[login] = false;
            Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_USER_IS_TYPING}${reportID}`, typingStoppedStatus);
            delete typingWatchTimers[reportUserIdentifier];
        }, 1500);
    });
}

/**
 * Remove our pusher subscriptions to listen for someone typing in a report.
 *
 * @param {number} reportID
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
 * Get all chat reports and provide the proper report name
 * by fetching sharedReportList and personalDetails
 *
 * @returns {Promise} only used internally when fetchAll() is called
 */
function fetchChatReports() {
    return API.get({
        returnValueList: 'chatList',
    })

        // The string cast below is necessary as Get rvl='chatList' may return an int
        .then(({chatList}) => fetchChatReportsByIDs(String(chatList).split(',')));
}

/**
 * Get the actions of a report
 *
 * @param {number} reportID
 */
function fetchActions(reportID) {
    API.getReportHistory({reportID})
        .then((data) => {
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
 * @param {boolean} shouldRedirectToReport this is set to false when the network reconnect
 *     code runs
 * @param {boolean} shouldFetchActions whether or not the actions of the reports should also be fetched
 */
function fetchAll(shouldRedirectToReport = true, shouldFetchActions = false) {
    fetchChatReports()
        .then((reportIDs) => {
            if (shouldRedirectToReport && (currentURL === ROUTES.ROOT || currentURL === ROUTES.HOME)) {
                // Redirect to either the last viewed report ID or the first report ID from our report collection
                if (lastViewedReportID) {
                    redirect(ROUTES.getReportRoute(lastViewedReportID));
                } else {
                    redirect(ROUTES.getReportRoute(_.first(reportIDs)));
                }
            }

            if (shouldFetchActions) {
                _.each(reportIDs, (reportID) => {
                    console.debug(`[RECONNECT] Fetching report actions for report ${reportID}`);
                    fetchActions(reportID);
                });
            }
        });
}

/**
 * Get the report ID, and then the actions, for a chat report for a specific
 * set of participants
 *
 * @param {string[]} participants
 */
function fetchOrCreateChatReport(participants) {
    let reportID;

    if (participants.length < 2) {
        throw new Error('fetchOrCreateChatReport() must have at least two participants');
    }

    API.createChatReport({
        emailList: participants.join(','),
    })

        .then((data) => {
            // Set aside the reportID in a local variable so it can be accessed in the rest of the chain
            reportID = data.reportID;

            // Make a request to get all the information about the report
            return API.get({
                returnValueList: 'reportStuff',
                reportIDList: reportID,
                shouldLoadOptionalKeys: true,
            });
        })

        // Put the report object into Onyx
        .then((data) => {
            const report = data.reports[reportID];

            // Store only the absolute bare minimum of data in Onyx because space is limited
            const newReport = getSimplifiedReportObject(report);
            newReport.reportName = getChatReportName(report.sharedReportList);

            // Merge the data into Onyx. Don't use set() here or multiSet() because then that would
            // overwrite any existing data (like if they have unread messages)
            Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, newReport);

            // Redirect the logged in person to the new report
            redirect(ROUTES.getReportRoute(reportID));
        });
}

/**
 * Add an action item to a report
 *
 * @param {number} reportID
 * @param {string} text
 * @param {object} file
 */
function addAction(reportID, text, file) {
    const actionKey = `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${reportID}`;

    // Convert the comment from MD into HTML because that's how it is stored in the database
    const parser = new ExpensiMark();
    const htmlComment = parser.replace(text);
    const isAttachment = _.isEmpty(text) && file !== undefined;

    // The new sequence number will be one higher than the highest
    const highestSequenceNumber = reportMaxSequenceNumbers[reportID] || 0;
    const newSequenceNumber = highestSequenceNumber + 1;

    // Update the report in Onyx to have the new sequence number
    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${reportID}`, {
        maxSequenceNumber: newSequenceNumber,
    });

    // Optimistically add the new comment to the store before waiting to save it to the server
    Onyx.merge(actionKey, {
        [newSequenceNumber]: {
            actionName: 'ADDCOMMENT',
            actorEmail: currentUserEmail,
            person: [
                {
                    style: 'strong',
                    text: myPersonalDetails.displayName || currentUserEmail,
                    type: 'TEXT'
                }
            ],
            automatic: false,
            sequenceNumber: newSequenceNumber,
            avatar: myPersonalDetails.avatarURL,
            timestamp: moment().unix(),
            message: [
                {
                    type: 'COMMENT',
                    html: isAttachment ? 'Uploading Attachment...' : htmlComment,

                    // Remove HTML from text when applying optimistic offline comment
                    text: isAttachment ? '[Attachment]'
                        : htmlComment.replace(/<[^>]*>?/gm, ''),
                }
            ],
            isFirstItem: false,
            isAttachment,
            loading: true,
        }
    });

    API.addReportComment({
        reportID,
        reportComment: htmlComment,
        file
    });
}

/**
 * Updates the last read action ID on the report. It optimistically makes the change to the store, and then let's the
 * network layer handle the delayed write.
 *
 * @param {number} reportID
 * @param {number} sequenceNumber
 */
function updateLastReadActionID(reportID, sequenceNumber) {
    const currentMaxSequenceNumber = reportMaxSequenceNumbers[reportID];
    if (sequenceNumber < currentMaxSequenceNumber) {
        return;
    }

    setLocalLastReadActionID(reportID, sequenceNumber);

    // Mark the report as not having any unread items
    API.setLastReadActionID({
        accountID: currentUserAccountID,
        reportID,
        sequenceNumber,
    });
}

/**
 * Toggles the pinned state of the report
 *
 * @param {object} report
 */
function togglePinnedState(report) {
    const pinnedValue = !report.isPinned;
    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${report.reportID}`, {isPinned: pinnedValue});
    API.togglePinnedReport({
        reportID: report.reportID,
        pinnedValue,
    });
}

/**
 * Saves the comment left by the user as they are typing. By saving this data the user can switch between chats, close
 * tab, refresh etc without worrying about loosing what they typed out.
 *
 * @param {number} reportID
 * @param {string} comment
 */
function saveReportComment(reportID, comment) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_DRAFT_COMMENT}${reportID}`, comment);
}

/**
 * Broadcasts whether or not a user is typing on a report over the report's private pusher channel.
 *
 * @param {number} reportID
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
 * @param {object} report
 */
function handleReportChanged(report) {
    if (!report) {
        return;
    }

    // A report can be missing a name if a comment is received via pusher event
    // and the report does not yet exist in Onyx (eg. a new DM created with the logged in person)
    if (report.reportName === undefined) {
        fetchChatReportsByIDs([report.reportID]);
    }

    // Store the max sequence number for each report
    reportMaxSequenceNumbers[report.reportID] = report.maxSequenceNumber;
}

Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT,
    callback: handleReportChanged
});

// When the app reconnects from being offline, fetch all of the reports and their actions
NetworkConnection.onReconnect(() => {
    fetchAll(false, true);
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
};
