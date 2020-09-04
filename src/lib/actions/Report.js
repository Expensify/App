import moment from 'moment';
import _ from 'underscore';
import lodashGet from 'lodash.get';
import Ion from '../Ion';
import {queueRequest, onReconnect} from '../Network';
import IONKEYS from '../../IONKEYS';
import CONFIG from '../../CONFIG';
import * as Pusher from '../Pusher/pusher';
import promiseAllSettled from '../promiseAllSettled';
import ExpensiMark from '../ExpensiMark';
import Notification from '../Notification';
import * as PersonalDetails from './PersonalDetails';

// Disabling these rules makes the following code more compact and easier to read for these instances
/* eslint-disable object-curly-newline,object-property-newline */
let currentUserEmail;
let currentUserAccountID;
Ion.connect({key: IONKEYS.SESSION, callback: (val) => {
    if (val) {
        currentUserEmail = val.email;
        currentUserAccountID = val.accountID;
    }
}});

let currentURL;
Ion.connect({key: IONKEYS.CURRENT_URL, callback: val => currentURL = val});

// Use a regex pattern here for an exact match so it doesn't also match "my_personal_details"
let personalDetails;
Ion.connect({key: `^${IONKEYS.PERSONAL_DETAILS}$`, callback: val => personalDetails = val});

let myPersonalDetails;
Ion.connect({key: IONKEYS.MY_PERSONAL_DETAILS, callback: val => myPersonalDetails = val});
/* eslint-enable object-curly-newline,object-property-newline */

const reportMaxSequenceNumbers = {};

// List of reportIDs that we define in .env
const configReportIDs = CONFIG.REPORT_IDS.split(',').map(Number);

/**
 * Checks the report to see if there are any unread action items
 *
 * @param {string} accountID
 * @param {object} report
 * @returns {boolean}
 */
function hasUnreadActions(accountID, report) {
    const usersLastReadActionID = lodashGet(report, ['reportNameValuePairs', `lastReadActionID_${accountID}`]);
    if (!usersLastReadActionID || report.reportActionList.length === 0) {
        return false;
    }

    // Find the most recent sequence number from the report history
    const sequenceNumber = _.chain(report.reportActionList)
        .pluck('sequenceNumber')
        .max()
        .value();

    if (!sequenceNumber) {
        return false;
    }

    // There are unread items if the last one the user has read is less than the highest sequence number we have
    return usersLastReadActionID < sequenceNumber;
}

/**
 * Only store the minimal amount of data in Ion that needs to be stored
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
        hasUnread: hasUnreadActions(currentUserAccountID, report),
        pinnedReport: configReportIDs.includes(report.reportID),
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
        .map(participant => lodashGet(personalDetails, [participant, 'firstName']) || participant)
        .value()
        .join(', ');
}

/**
 * Fetches chat reports when provided a list of
 * chat report IDs
 *
 * @param {Array} chatList
 * @return {Promise}
 */
function fetchChatReportsByIDs(chatList) {
    let fetchedReports;
    return queueRequest('Get', {
        returnValueList: 'reportStuff',
        reportIDList: chatList.join(','),
        shouldLoadOptionalKeys: true,
    })
        .then(({reports}) => {
            fetchedReports = reports;

            // Build array of all participant emails so we can
            // get the personal details.
            const emails = _.chain(reports)
                .pluck('sharedReportList')
                .reduce((participants, sharedList) => {
                    const emailArray = _.map(sharedList, participant => participant.email);
                    return [...participants, ...emailArray];
                }, [])
                .filter(email => email !== currentUserEmail)
                .unique()
                .value();

            // Fetch the person details if there are any
            if (emails && emails.length !== 0) {
                PersonalDetails.getForEmails(emails.join(','));
            }


            // Process the reports and store them in Ion
            const ionPromises = _.map(fetchedReports, (report) => {
                const newReport = getSimplifiedReportObject(report);

                if (lodashGet(report, 'reportNameValuePairs.type') === 'chat') {
                    newReport.reportName = getChatReportName(report.sharedReportList);
                }

                // Merge the data into Ion. Don't use set() here or multiSet() because then that would
                // overwrite any existing data (like if they have unread messages)
                return Ion.merge(`${IONKEYS.REPORT}_${report.reportID}`, newReport);
            });

            return Promise.all(ionPromises);
        });
}

/**
 * Get the history of a report
 *
 * @param {string} reportID
 * @returns {Promise}
 */
function fetchHistory(reportID) {
    return queueRequest('Report_GetHistory', {
        reportID,
        offset: 0,
    })
        .then((data) => {
            const indexedData = _.indexBy(data.history, 'sequenceNumber');
            Ion.set(`${IONKEYS.REPORT_HISTORY}_${reportID}`, indexedData);
        });
}

/**
 * Updates a report in the store with a new report action
 *
 * @param {string} reportID
 * @param {object} reportAction
 */
function updateReportWithNewAction(reportID, reportAction) {
    // Always merge the reportID into Ion
    // If the report doesn't exist in Ion yet, then all the rest of the data will be filled out
    // from the code at the top of this file
    Ion.merge(`${IONKEYS.REPORT}_${reportID}`, {
        reportID,
        maxSequenceNumber: reportAction.sequenceNumber,
    });

    const previousMaxSequenceNumber = reportMaxSequenceNumbers[reportID];
    const newMaxSequenceNumber = reportAction.sequenceNumber;

    // Mark the report as unread if there is a new max sequence number
    if (newMaxSequenceNumber > previousMaxSequenceNumber) {
        Ion.merge(`${IONKEYS.REPORT}_${reportID}`, {
            hasUnread: true,
            maxSequenceNumber: newMaxSequenceNumber,
        });
    }

    // Add the action into Ion
    Ion.merge(`${IONKEYS.REPORT_ACTIONS}_${reportID}`, {
        [reportAction.sequenceNumber]: reportAction,
    });

    // If this comment is from the current user we don't want to parrot whatever they wrote back to them.
    if (reportAction.actorEmail === currentUserEmail) {
        return;
    }

    const currentReportID = Number(lodashGet(currentURL.split('/'), [1], 0));

    // If we are currently viewing this report do not show a notification.
    if (reportID === currentReportID) {
        return;
    }

    Notification.showCommentNotification({
        reportAction,
        onClick: () => {
            // Navigate to this report onClick
            Ion.set(IONKEYS.APP_REDIRECT_TO, `/${reportID}`);
        }
    });
}

/**
 * Initialize our pusher subscriptions to listen for new report comments
 */
function subscribeToReportCommentEvents() {
    const pusherChannelName = `private-user-accountID-${currentUserAccountID}`;
    if (Pusher.isSubscribed(pusherChannelName) || Pusher.isAlreadySubscribing(pusherChannelName)) {
        return;
    }

    Pusher.subscribe(pusherChannelName, 'reportComment', (pushJSON) => {
        updateReportWithNewAction(pushJSON.reportID, pushJSON.reportAction);
    });
}

/**
 * Get all chat reports and provide the proper report name
 * by fetching sharedReportList and personalDetails
 *
 * @returns {Promise}
 */
function fetchChatReports() {
    return queueRequest('Get', {returnValueList: 'chatList'})

        // The string cast below is necessary as Get rvl='chatList' may return an int
        .then(({chatList}) => fetchChatReportsByIDs(String(chatList).split(',')));
}

/**
 * Get all of our reports
 *
 * @returns {Promise}
 */
function fetchAll() {
    let fetchedReports;

    // Request each report one at a time to allow individual reports to fail if access to it is prevented by Auth
    const reportFetchPromises = _.map(configReportIDs, reportID => queueRequest('Get', {
        returnValueList: 'reportStuff',
        reportIDList: reportID,
        shouldLoadOptionalKeys: true,
    }));

    // Chat reports need to be fetched separately than the reports hard-coded in the config
    // files. The promise for fetching them is added to the array of promises here so
    // that both types of reports (chat reports and hard-coded reports) are fetched in
    // parallel
    reportFetchPromises.push(fetchChatReports());

    return promiseAllSettled(reportFetchPromises)
        .then((data) => {
            fetchedReports = _.compact(_.map(data, (promiseResult) => {
                // Grab the report from the promise result which stores it in the `value` key
                const report = lodashGet(promiseResult, 'value.reports', {});

                // If there is no report found from the promise, return null
                // Otherwise, grab the actual report object from the first index in the values array
                return _.isEmpty(report) ? null : _.values(report)[0];
            }));

            // Store the first report ID in Ion
            Ion.set(IONKEYS.FIRST_REPORT_ID, _.first(_.pluck(fetchedReports, 'reportID')) || 0);

            _.each(fetchedReports, (report) => {
                // Store only the absolute bare minimum of data in Ion because space is limited
                const newReport = getSimplifiedReportObject(report);

                // Merge the data into Ion. Don't use set() here or multiSet() because then that would
                // overwrite any existing data (like if they have unread messages)
                Ion.merge(`${IONKEYS.REPORT}_${report.reportID}`, newReport);
            });

            return fetchedReports;
        });
}

/**
 * Get the actions of a report
 *
 * @param {string} reportID
 * @returns {Promise}
 */
function fetchActions(reportID) {
    return queueRequest('Report_GetHistory', {
        reportID,
        offset: 0,
    })
        .then((data) => {
            const indexedData = _.indexBy(data.history, 'sequenceNumber');
            const maxSequenceNumber = _.chain(data.history)
                .pluck('sequenceNumber')
                .max()
                .value();
            Ion.set(`${IONKEYS.REPORT_ACTIONS}_${reportID}`, indexedData);
            Ion.merge(`${IONKEYS.REPORT}_${reportID}`, {maxSequenceNumber});
        });
}

/**
 * Get the report ID, and then the actions, for a chat report for a specific
 * set of participants
 *
 * @param {string[]} participants
 * @returns {Promise}
 */
function fetchOrCreateChatReport(participants) {
    let reportID;

    // Get the current users accountID and set it aside in a local variable
    // which is used for checking if there are unread comments
    return queueRequest('CreateChatReport', {
        emailList: participants.join(','),
    })

        .then((data) => {
            // Set aside the reportID in a local variable so it can be accessed in the rest of the chain
            reportID = data.reportID;

            // Make a request to get all the information about the report
            return queueRequest('Get', {
                returnValueList: 'reportStuff',
                reportIDList: reportID,
                shouldLoadOptionalKeys: true,
            });
        })

        // Put the report object into Ion
        .then((data) => {
            const report = data.reports[reportID];

            // Store only the absolute bare minimum of data in Ion because space is limited
            const newReport = getSimplifiedReportObject(report);
            newReport.reportName = getChatReportName(report.sharedReportList);

            // Merge the data into Ion. Don't use set() here or multiSet() because then that would
            // overwrite any existing data (like if they have unread messages)
            Ion.merge(`${IONKEYS.REPORT}_${reportID}`, newReport);

            // Return the reportID as the final return value
            return reportID;
        });
}

/**
 * Add an action item to a report
 *
 * @param {string} reportID
 * @param {string} text
 */
function addAction(reportID, text) {
    const actionKey = `${IONKEYS.REPORT_ACTIONS}_${reportID}`;

    // Convert the comment from MD into HTML because that's how it is stored in the database
    const parser = new ExpensiMark();
    const htmlComment = parser.replace(text);

    // The new sequence number will be one higher than the highest
    let highestSequenceNumber = reportMaxSequenceNumbers[reportID] || 0;
    const newSequenceNumber = highestSequenceNumber + 1;

    // Update the report in Ion to have the new sequence number
    Ion.merge(`${IONKEYS.REPORT}_${reportID}`, {
        maxSequenceNumber: newSequenceNumber,
    });

    // Optimistically add the new comment to the store before waiting to save it to the server
    Ion.merge(actionKey, {
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
            sequenceNumber: ++highestSequenceNumber,
            avatar: myPersonalDetails.avatarURL,
            timestamp: moment().unix(),
            message: [
                {
                    type: 'COMMENT',
                    html: htmlComment,

                    // Remove HTML from text when applying optimistic offline comment
                    text: htmlComment.replace(/<[^>]*>?/gm, ''),
                }
            ],
            isFirstItem: false,
            isAttachmentPlaceHolder: false,
        }
    });

    queueRequest('Report_AddComment', {
        reportID,
        reportComment: htmlComment,
    });
}

/**
 * Updates the last read action ID on the report. It optimistically makes the change to the store, and then let's the
 * network layer handle the delayed write.
 *
 * @param {string} accountID
 * @param {string} reportID
 * @param {number} sequenceNumber
 */
function updateLastReadActionID(accountID, reportID, sequenceNumber) {
    // Mark the report as not having any unread items
    Ion.merge(`${IONKEYS.REPORT}_${reportID}`, {
        hasUnread: false,
        reportNameValuePairs: {
            [`lastReadActionID_${accountID}`]: sequenceNumber,
        }
    });


    // Update the lastReadActionID on the report optimistically
    queueRequest('Report_SetLastReadActionID', {
        accountID,
        reportID,
        sequenceNumber,
    });
}

// When the app reconnects from being offline, fetch all of the reports and their actions
onReconnect(() => {
    fetchAll().then(reports => _.each(reports, report => fetchActions(report.reportID)));
});

// Listen for all reports added to Ion and if there is one that doesn't have a name, then
// fetch that report from the server so that it has all updated information about it
Ion.connect({
    key: `${IONKEYS.REPORT}_[0-9]+$`,
    callback: (val) => {
        // Nothing can be done without a report ID and it's OK to fail gracefully
        if (!val.reportID) {
            return;
        }

        if (val && val.reportName === undefined) {
            fetchChatReportsByIDs([val.reportID]);
        }

        // Keep a local copy of all the max sequence numbers for reports
        reportMaxSequenceNumbers[val.reportID] = val.maxSequenceNumber;
    }
});
export {
    fetchAll,
    fetchActions,
    fetchOrCreateChatReport,
    addAction,
    updateLastReadActionID,
    subscribeToReportCommentEvents,
};
