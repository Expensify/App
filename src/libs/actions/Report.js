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
import * as PersonalDetails from './PersonalDetails';
import Navigation from '../Navigation/Navigation';
import * as ActiveClientManager from '../ActiveClientManager';
import Visibility from '../Visibility';
import ROUTES from '../../ROUTES';
import Timing from './Timing';
import * as DeprecatedAPI from '../deprecatedAPI';
import * as API from '../API';
import CONFIG from '../../CONFIG';
import CONST from '../../CONST';
import Log from '../Log';
import * as LoginUtils from '../LoginUtils';
import * as ReportUtils from '../ReportUtils';
import * as ReportActions from './ReportActions';
import Growl from '../Growl';
import * as Localize from '../Localize';
import DateUtils from '../DateUtils';
import * as ReportActionsUtils from '../ReportActionsUtils';
import * as NumberUtils from '../NumberUtils';

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

let lastViewedReportID;
Onyx.connect({
    key: ONYXKEYS.CURRENTLY_VIEWED_REPORTID,
    callback: val => lastViewedReportID = val ? Number(val) : null,
});

let personalDetails;
Onyx.connect({
    key: ONYXKEYS.PERSONAL_DETAILS,
    callback: val => personalDetails = val,
});

const allReports = {};
let conciergeChatReportID;
const typingWatchTimers = {};

/**
 * @param {Number} reportID
 * @returns {Number}
 */
function getLastReadSequenceNumber(reportID) {
    return lodashGet(allReports, [reportID, 'lastReadSequenceNumber'], 0);
}

/**
 * @param {Number} reportID
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
    const createTimestamp = lodashGet(report, 'lastActionCreated', 0);
    const lastMessageTimestamp = moment.utc(createTimestamp).unix();
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
        reportID: report.reportID,
        reportName: report.reportName,
        chatType,
        ownerEmail: LoginUtils.getEmailWithoutMergedAccountPrefix(lodashGet(report, ['ownerEmail'], '')),
        policyID: lodashGet(report, ['reportNameValuePairs', 'expensify_policyID'], ''),
        maxSequenceNumber: lodashGet(report, 'reportActionCount', 0),
        participants: getParticipantEmailsFromReport(report),
        isPinned: report.isPinned,
        lastVisitedTimestamp: lodashGet(report, [
            'reportNameValuePairs',
            `lastRead_${currentUserAccountID}`,
            'timestamp',
        ], 0),
        lastReadSequenceNumber,
        lastMessageTimestamp,
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
 * Given IOU and chat report ID fetches most recent IOU data from DeprecatedAPI.
 *
 * @param {Number} iouReportID
 * @param {Number} chatReportID
 * @returns {Promise}
 */
function fetchIOUReport(iouReportID, chatReportID) {
    return DeprecatedAPI.Get({
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
        Log.hmmm('[Report] Failed to populate IOU Collection:', error.message);
    });
}

/**
 * Given debtorEmail finds active IOU report ID via GetIOUReport API call
 *
 * @param {String} debtorEmail
 * @returns {Promise}
 */
function fetchIOUReportID(debtorEmail) {
    return DeprecatedAPI.GetIOUReport({
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
            Log.info('GetIOUReport returned a reportID of 0, not fetching IOU report data');
            return;
        }
        return iouReportID;
    });
}

/**
 * Fetches chat reports when provided a list of chat report IDs.
 * If the shouldRedirectIfInaccessible flag is set, we redirect to the Concierge chat
 * when we find an inaccessible chat
 * @param {Array} chatList
 * @param {Boolean} shouldRedirectIfInaccessible
 * @returns {Promise<Object[]>} only used internally when fetchAllReports() is called
 */
function fetchChatReportsByIDs(chatList, shouldRedirectIfInaccessible = false) {
    let fetchedReports;
    const simplifiedReports = {};
    return DeprecatedAPI.GetReportSummaryList({reportIDList: chatList.join(',')})
        .then(({reportSummaryList, jsonCode}) => {
            Log.info('[Report] successfully fetched report data', false, {chatList});
            fetchedReports = reportSummaryList;

            // If we receive a 404 response while fetching a single report, treat that report as inaccessible.
            if (jsonCode === 404 && shouldRedirectIfInaccessible) {
                throw new Error(CONST.REPORT.ERROR.INACCESSIBLE_REPORT);
            }

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
                    Log.alert('[Report] Report with IOU action but does not have any participant.', {
                        reportID: chatReport.reportID,
                        participants,
                    });
                    return;
                }

                return fetchIOUReportID(participants[0])
                    .then((iouReportID) => {
                        if (!iouReportID) {
                            return Promise.resolve();
                        }

                        return fetchIOUReport(iouReportID, chatReport.reportID);
                    });
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
            PersonalDetails.getFromReportParticipants(_.values(simplifiedReports));
            return simplifiedReports;
        })
        .catch((err) => {
            if (err.message !== CONST.REPORT.ERROR.INACCESSIBLE_REPORT) {
                return;
            }

            // eslint-disable-next-line no-use-before-define
            handleInaccessibleReport();
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
 * Fetch the iouReport and persist the data to Onyx.
 *
 * @param {Number} iouReportID - ID of the report we are fetching
 * @param {Number} chatReportID - associated chatReportID, set as an iouReport field
 * @param {Boolean} [shouldRedirectIfEmpty=false] - Whether to redirect to Active Report Screen if IOUReport is empty
 * @returns {Promise}
 */
function fetchIOUReportByID(iouReportID, chatReportID, shouldRedirectIfEmpty = false) {
    return fetchIOUReport(iouReportID, chatReportID)
        .then((iouReportObject) => {
            if (!iouReportObject && shouldRedirectIfEmpty) {
                Growl.error(Localize.translateLocal('notFound.iouReportNotFound'));
                Navigation.navigate(ROUTES.REPORT);
                return;
            }
            setLocalIOUReportData(iouReportObject);
            return iouReportObject;
        });
}

/**
 * Get the private pusher channel name for a Report.
 *
 * @param {Number} reportID
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
            Log.hmmm('[Report] Failed to initially subscribe to Pusher channel', false, {errorType: error.type, pusherChannelName});
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
 * @returns {Promise<Object[]>}
 */
function fetchOrCreateChatReport(participants, shouldNavigate = true) {
    if (participants.length < 2) {
        throw new Error('fetchOrCreateChatReport() must have at least two participants.');
    }

    return DeprecatedAPI.CreateChatReport({
        emailList: participants.join(','),
    })
        .then((data) => {
            if (data.jsonCode !== 200) {
                console.error(data.message);
                Growl.error(data.message);
                return;
            }

            // Merge report into Onyx
            const simplifiedReportObject = getSimplifiedReportObject(data);
            Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT}${data.reportID}`, simplifiedReportObject);

            // Fetch the personal details if there are any
            PersonalDetails.getFromReportParticipants([simplifiedReportObject]);

            if (shouldNavigate) {
                // Redirect the logged in person to the new report
                Navigation.navigate(ROUTES.getReportRoute(data.reportID));
            }

            // We are returning an array with a report object here since fetchAllReports calls this method or
            // fetchChatReportsByIDs which returns an array of report objects.
            return [simplifiedReportObject];
        });
}

/**
 * Get all of our reports
 *
 * @param {Boolean} shouldRecordHomePageTiming whether or not performance timing should be measured
 * @returns {Promise}
 */
function fetchAllReports(
    shouldRecordHomePageTiming = false,
) {
    Onyx.set(ONYXKEYS.IS_LOADING_REPORT_DATA, true);
    return DeprecatedAPI.Get({
        returnValueList: 'chatList',
    })
        .then((response) => {
            if (response.jsonCode !== 200) {
                return;
            }

            // The cast here is necessary as Get rvl='chatList' may return an int or Array
            const reportIDs = _.filter(String(response.chatList).split(','), _.identity);

            // Get all the chat reports if they have any, otherwise create one with concierge
            if (reportIDs.length > 0) {
                return fetchChatReportsByIDs(reportIDs);
            }

            return fetchOrCreateChatReport([currentUserEmail, CONST.EMAIL.CONCIERGE], false);
        })
        .then((returnedReports) => {
            Onyx.set(ONYXKEYS.IS_LOADING_REPORT_DATA, false);

            // If at this point the user still doesn't have a Concierge report, create it for them.
            // This means they were a participant in reports before their account was created (e.g. default rooms)
            const hasConciergeChat = _.some(returnedReports, report => ReportUtils.isConciergeChatReport(report));
            if (!hasConciergeChat) {
                fetchOrCreateChatReport([currentUserEmail, CONST.EMAIL.CONCIERGE], false);
            }

            if (shouldRecordHomePageTiming) {
                Timing.end(CONST.TIMING.HOMEPAGE_REPORTS_LOADED);
            }
        });
}

/**
 * Creates an optimistic chat report with a randomly generated reportID and as much information as we currently have
 *
 * @param {Array} participantList
 * @param {String} reportName
 * @param {String} chatType
 * @param {String} policyID
 * @param {String} ownerEmail
 * @param {Boolean} isOwnPolicyExpenseChat
 * @param {String} oldPolicyName
 * @param {String} visibility
 * @returns {Object}
 */
function createOptimisticChatReport(
    participantList,
    reportName = 'Chat Report',
    chatType = '',
    policyID = CONST.POLICY.OWNER_EMAIL_FAKE,
    ownerEmail = CONST.REPORT.OWNER_EMAIL_FAKE,
    isOwnPolicyExpenseChat = false,
    oldPolicyName = '',
    visibility = undefined,
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
        lastMessageTimestamp: 0,
        lastVisitedTimestamp: 0,
        maxSequenceNumber: 0,
        notificationPreference: '',
        oldPolicyName,
        ownerEmail,
        participants: participantList,
        policyID,
        reportID: ReportUtils.generateReportID(),
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
function createOptimisticCreatedReportAction(ownerEmail) {
    return {
        0: {
            actionName: CONST.REPORT.ACTIONS.TYPE.CREATED,
            pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            actorEmail: currentUserEmail,
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
                    text: lodashGet(personalDetails, [currentUserEmail, 'displayName'], currentUserEmail),
                },
            ],
            automatic: false,
            sequenceNumber: 0,
            avatar: lodashGet(personalDetails, [currentUserEmail, 'avatar'], ReportUtils.getDefaultAvatar(currentUserEmail)),
            timestamp: moment().unix(),
            shouldShow: true,
        },
    };
}

/**
 * @param {String} policyID
 * @param {String} policyName
 * @returns {Object}
 */
function createOptimisticWorkspaceChats(policyID, policyName) {
    const announceChatData = createOptimisticChatReport(
        [currentUserEmail],
        CONST.REPORT.WORKSPACE_CHAT_ROOMS.ANNOUNCE,
        CONST.REPORT.CHAT_TYPE.POLICY_ANNOUNCE,
        policyID,
        null,
        false,
        policyName,
    );
    const announceChatReportID = announceChatData.reportID;
    const announceReportActionData = createOptimisticCreatedReportAction(announceChatData.ownerEmail);

    const adminsChatData = createOptimisticChatReport([currentUserEmail], CONST.REPORT.WORKSPACE_CHAT_ROOMS.ADMINS, CONST.REPORT.CHAT_TYPE.POLICY_ADMINS, policyID, null, false, policyName);
    const adminsChatReportID = adminsChatData.reportID;
    const adminsReportActionData = createOptimisticCreatedReportAction(adminsChatData.ownerEmail);

    const expenseChatData = createOptimisticChatReport([currentUserEmail], '', CONST.REPORT.CHAT_TYPE.POLICY_EXPENSE_CHAT, policyID, currentUserEmail, true, policyName);
    const expenseChatReportID = expenseChatData.reportID;
    const expenseReportActionData = createOptimisticCreatedReportAction(expenseChatData.ownerEmail);

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
 * @param {Number} reportID
 * @param {String} [text]
 * @param {File} [file]
 * @returns {Object}
 */
function createOptimisticReportAction(reportID, text, file) {
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

    const optimisticReportActionSequenceNumber = NumberUtils.generateReportActionSequenceNumber();

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
                    text: lodashGet(personalDetails, [currentUserEmail, 'displayName'], currentUserEmail),
                    type: 'TEXT',
                },
            ],
            automatic: false,

            // Use the client generated ID as a optimistic action ID so we can remove it later
            sequenceNumber: optimisticReportActionSequenceNumber,
            clientID: optimisticReportActionSequenceNumber,
            avatar: lodashGet(personalDetails, [currentUserEmail, 'avatar'], ReportUtils.getDefaultAvatar(currentUserEmail)),
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
            attachmentInfo,
            pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            shouldShow: true,
        },
    };
}

/**
 * Add up to two report actions to a report. This method can be called for the following situations:
 *
 * - Adding one comment
 * - Adding one attachment
 * - Add both a comment and attachment simultaneously
 *
 * @param {Number} reportID
 * @param {String} [text]
 * @param {Object} [file]
 */
function addActions(reportID, text = '', file) {
    let reportCommentText = '';
    let reportCommentAction;
    let attachmentAction;
    let commandName = 'AddComment';

    if (text) {
        const reportComment = createOptimisticReportAction(reportID, text);
        reportCommentAction = reportComment.reportAction;
        reportCommentText = reportComment.commentText;
    }

    if (file) {
        // When we are adding an attachment we will call AddAttachment.
        // It supports sending an attachment with an optional comment and AddComment supports adding a single text comment only.
        commandName = 'AddAttachment';
        const attachment = createOptimisticReportAction(reportID, '', file);
        attachmentAction = attachment.reportAction;
    }

    // Always prefer the file as the last action over text
    const lastAction = attachmentAction || reportCommentAction;

    // We need a newSequenceNumber that is n larger than the current depending on how many actions we are adding.
    const actionCount = text && file ? 2 : 1;
    const highestSequenceNumber = getMaxSequenceNumber(reportID);
    const newSequenceNumber = highestSequenceNumber + actionCount;

    // Update the report in Onyx to have the new sequence number
    const optimisticReport = {
        maxSequenceNumber: newSequenceNumber,
        lastMessageTimestamp: Date.now(),
        lastMessageText: ReportUtils.formatReportLastMessageText(lastAction.message[0].text),
        lastActorEmail: currentUserEmail,
        lastReadSequenceNumber: newSequenceNumber,
    };

    // Optimistically add the new actions to the store before waiting to save them to the server
    const optimisticReportActions = {};
    if (text) {
        optimisticReportActions[reportCommentAction.sequenceNumber] = reportCommentAction;
    }
    if (file) {
        optimisticReportActions[attachmentAction.sequenceNumber] = attachmentAction;
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
            value: {[currentUserEmail]: timezone},
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
 * @param {Number} reportID
 * @param {File} file
 * @param {String} [text]
 */
function addAttachment(reportID, file, text = '') {
    addActions(reportID, text, file);
}

/**
 * Add a single comment to a report
 *
 * @param {Number} reportID
 * @param {String} text
 */
function addComment(reportID, text) {
    addActions(reportID, text);
}

/**
 * Gets the latest page of report actions and updates the last read message
 *
 * @param {Number} reportID
 */
function openReport(reportID) {
    API.write('OpenReport',
        {
            reportID,
        },
        {
            optimisticData: [{
                onyxMethod: CONST.ONYX.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
                value: {
                    isLoadingReportActions: true,
                    lastVisitedTimestamp: Date.now(),
                    lastReadSequenceNumber: getMaxSequenceNumber(reportID),
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
 * Get the latest report history without marking the report as read.
 *
 * @param {Number} reportID
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
 * @param {Number} reportID
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
 * @param {Number} reportID
 */
function readNewestAction(reportID) {
    const sequenceNumber = getMaxSequenceNumber(reportID);
    API.write('ReadNewestAction',
        {
            reportID,
            sequenceNumber,
        },
        {
            optimisticData: [{
                onyxMethod: CONST.ONYX.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
                value: {
                    lastReadSequenceNumber: sequenceNumber,
                    lastVisitedTimestamp: Date.now(),
                },
            }],
        });
}

/**
 * Sets the last read comment on a report
 *
 * @param {Number} reportID
 * @param {Number} sequenceNumber
 */
function markCommentAsUnread(reportID, sequenceNumber) {
    const newLastReadSequenceNumber = sequenceNumber - 1;
    API.write('MarkAsUnread',
        {
            reportID,
            sequenceNumber,
        },
        {
            optimisticData: [{
                onyxMethod: CONST.ONYX.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${reportID}`,
                value: {
                    lastReadSequenceNumber: newLastReadSequenceNumber,
                    lastVisitedTimestamp: Date.now(),
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
 * @param {Number} reportID
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

    if (report && report.reportID) {
        allReports[report.reportID] = report;

        if (ReportUtils.isConciergeChatReport(report)) {
            conciergeChatReportID = report.reportID;
        }
    }

    // A report can be missing a name if a comment is received via pusher event
    // and the report does not yet exist in Onyx (eg. a new DM created with the logged in person)
    if (report.reportID && report.reportName === undefined) {
        fetchChatReportsByIDs([report.reportID]);
    }
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

/**
 * Deletes a comment from the report, basically sets it as empty string
 *
 * @param {Number} reportID
 * @param {Object} reportAction
 */
function deleteReportComment(reportID, reportAction) {
    const sequenceNumber = reportAction.sequenceNumber;

    // We are not updating the message content here so the message can re-appear as strike-throughed
    // if the user goes offline. The API will update the message content to empty strings on success.
    const optimisticReportActions = {
        [sequenceNumber]: {
            pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
        },
    };

    // If we are deleting the last visible message, let's find the previous visible one
    // and update the lastMessageText in the chat preview.
    const optimisticReport = {
        lastMessageText: ReportActions.getLastVisibleMessageText(reportID, {
            [sequenceNumber]: {
                message: [{
                    html: '',
                    text: '',
                }],
            },
        }),
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
 * Saves a new message for a comment. Marks the comment as edited, which will be reflected in the UI.
 *
 * @param {Number} reportID
 * @param {Object} originalReportAction
 * @param {String} textForNewComment
 */
function editReportComment(reportID, originalReportAction, textForNewComment) {
    const parser = new ExpensiMark();

    // Do not autolink if someone explicitly tries to remove a link from message.
    // https://github.com/Expensify/App/issues/9090
    const htmlForNewComment = parser.replace(textForNewComment, {filterRules: _.filter(_.pluck(parser.rules, 'name'), name => name !== 'autolink')});

    //  Delete the comment if it's empty
    if (_.isEmpty(htmlForNewComment)) {
        deleteReportComment(reportID, originalReportAction);
        return;
    }

    // Skip the Edit if message is not changed
    if (originalReportAction.message[0].html === htmlForNewComment.trim()) {
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
                text: textForNewComment,
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
        === CONST.REPORT.STATE_NUM.PROCESSING && iouReport.total !== 0;
    simplifiedIouReport[iouReportKey] = getSimplifiedIOUReport(iouReport, chatReport.reportID);
    Onyx.mergeCollection(ONYXKEYS.COLLECTION.REPORT_IOUS, simplifiedIouReport);
    Onyx.mergeCollection(ONYXKEYS.COLLECTION.REPORT, simplifiedReport);
}

/**
 * @param {Number} reportID
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
        fetchOrCreateChatReport([currentUserEmail, CONST.EMAIL.CONCIERGE], true);
        return;
    }

    Navigation.navigate(ROUTES.getReportRoute(conciergeChatReportID));
}

/**
 * Handle the navigation when report is inaccessible
 */
function handleInaccessibleReport() {
    Growl.error(Localize.translateLocal('notFound.chatYouLookingForCannotBeFound'));
    navigateToConciergeChat();
}

/**
 * Creates a policy room, fetches it, and navigates to it.
 * @param {String} policyID
 * @param {String} reportName
 * @param {String} visibility
 * @return {Promise}
 */
function createPolicyRoom(policyID, reportName, visibility) {
    Onyx.set(ONYXKEYS.IS_LOADING_CREATE_POLICY_ROOM, true);
    return DeprecatedAPI.CreatePolicyRoom({policyID, reportName, visibility})
        .then((response) => {
            if (response.jsonCode === CONST.JSON_CODE.UNABLE_TO_RETRY) {
                Growl.error(Localize.translateLocal('newRoomPage.growlMessageOnError'));
                return;
            }

            if (response.jsonCode !== CONST.JSON_CODE.SUCCESS) {
                Growl.error(response.message);
                return;
            }

            return fetchChatReportsByIDs([response.reportID]);
        })
        .then((chatReports) => {
            const reportID = lodashGet(_.first(_.values(chatReports)), 'reportID', '');
            if (!reportID) {
                Log.error('Unable to grab policy room after creation', reportID);
                return;
            }
            Navigation.navigate(ROUTES.getReportRoute(reportID));
        })
        .finally(() => Onyx.set(ONYXKEYS.IS_LOADING_CREATE_POLICY_ROOM, false));
}

/**
 * Add a workspace room optimistically and navigate to it.
 *
 * @param {Object} policy
 * @param {String} reportName
 * @param {String} visibility
 */
function addWorkspaceRoom(policy, reportName, visibility) {
    const workspaceRoom = createOptimisticChatReport(
        policy.emailList,
        reportName,
        CONST.REPORT.CHAT_TYPE.POLICY_ROOM,
        policy.id,
        CONST.REPORT.OWNER_EMAIL_FAKE,
        false,
        '',
        visibility,
    );
    const optimisticData = [
        {
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${workspaceRoom.reportID}`,
            value: {
                pendingFields: {
                    addWorkspaceRoom: CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
                },
                ...workspaceRoom,
            },
        },
    ];
    const successData = [
        {
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${workspaceRoom.reportID}`,
            value: {
                pendingFields: {
                    addWorkspaceRoom: null,
                },
            },
        },
    ];
    const failureData = [
        {
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${workspaceRoom.reportID}`,
            value: {
                pendingFields: {
                    addWorkspaceRoom: null,
                },
            },
        },
    ];

    API.write('AddWorkspaceRoom', {workspaceRoom: JSON.stringify(workspaceRoom)}, {optimisticData, successData, failureData});
    Navigation.navigate(ROUTES.getReportRoute(workspaceRoom.reportID));
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
 * @param {Number} reportID The reportID of the policy room.
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
 * @param {Number} reportID
 * @param {Boolean} isComposerFullSize
 */
function setIsComposerFullSize(reportID, isComposerFullSize) {
    Onyx.merge(`${ONYXKEYS.COLLECTION.REPORT_IS_COMPOSER_FULL_SIZE}${reportID}`, isComposerFullSize);
}

/**
 * @param {Number} reportID
 * @param {Object} action
 */
function viewNewReportAction(reportID, action) {
    const isFromCurrentUser = action.actorAccountID === currentUserAccountID;
    const lastReadSequenceNumber = getLastReadSequenceNumber(reportID);
    const updatedReportObject = {};

    // When handling an action from the current user we can assume that their last read actionID has been updated in the server, but not necessarily reflected
    // locally so we will update the lastReadSequenceNumber to mark the report as read.
    if (isFromCurrentUser) {
        updatedReportObject.lastVisitedTimestamp = Date.now();
        updatedReportObject.lastReadSequenceNumber = action.pendingAction ? lastReadSequenceNumber : action.sequenceNumber;
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
    if (reportID === lastViewedReportID && Visibility.isVisible()) {
        Log.info('[LOCAL_NOTIFICATION] No notification because it was a comment for the current report');
        return;
    }

    // If the comment came from Concierge let's not show a notification since we already show one for expensify.com
    if (lodashGet(action, 'actorEmail') === CONST.EMAIL.CONCIERGE) {
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

// We are using this map to ensure actions are only handled once
const handledReportActions = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT_ACTIONS,
    initWithStoredValues: false,
    callback: (actions, key) => {
        // reportID can be derived from the Onyx key
        const reportID = parseInt(key.split('_')[1], 10);
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

            if (action.isLoading) {
                return;
            }

            if (!action.timestamp) {
                return;
            }

            // If we are past the deadline to notify for this comment don't do it
            if (moment.utc(action.timestamp * 1000).isBefore(moment.utc().subtract(10, 'seconds'))) {
                return;
            }

            viewNewReportAction(reportID, action);
            handledReportActions[reportID] = handledReportActions[reportID] || {};
            handledReportActions[reportID][action.sequenceNumber] = true;
        });
    },
});

export {
    fetchAllReports,
    fetchOrCreateChatReport,
    fetchChatReportsByIDs,
    fetchIOUReportByID,
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
    updateCurrentlyViewedReportID,
    editReportComment,
    saveReportActionDraft,
    deleteReportComment,
    getSimplifiedIOUReport,
    syncChatAndIOUReports,
    navigateToConciergeChat,
    handleInaccessibleReport,
    setReportWithDraft,
    createPolicyRoom,
    addWorkspaceRoom,
    setIsComposerFullSize,
    markCommentAsUnread,
    readNewestAction,
    readOldestAction,
    openReport,
    openPaymentDetailsPage,
    createOptimisticWorkspaceChats,
    createOptimisticChatReport,
    createOptimisticCreatedReportAction,
    updatePolicyRoomName,
    clearPolicyRoomNameErrors,
};
