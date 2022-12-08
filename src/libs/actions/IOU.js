import Onyx from 'react-native-onyx';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import Str from 'expensify-common/lib/str';
import CONST from '../../CONST';
import ONYXKEYS from '../../ONYXKEYS';
import ROUTES from '../../ROUTES';
import * as DeprecatedAPI from '../deprecatedAPI';
import * as Report from './Report';
import Navigation from '../Navigation/Navigation';
import Growl from '../Growl';
import * as Localize from '../Localize';
import asyncOpenURL from '../asyncOpenURL';
import * as API from '../API';
import * as ReportUtils from '../ReportUtils';
import * as IOUUtils from '../IOUUtils';
import * as OptionsListUtils from '../OptionsListUtils';
import DateUtils from '../DateUtils';

const chatReports = {};
const iouReports = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT,
    callback: (report, key) => {
        if (!report) {
            delete iouReports[key];
            delete chatReports[key];
        } else if (ReportUtils.isIOUReport(report)) {
            iouReports[key] = report;
        } else {
            chatReports[key] = report;
        }
    },
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

/**
 * Request money from another user
 *
 * @param {Object} report
 * @param {Number} amount
 * @param {String} currency
 * @param {String} recipientEmail
 * @param {Object} participant
 * @param {String} comment
 */
function requestMoney(report, amount, currency, recipientEmail, participant, comment) {
    const debtorEmail = OptionsListUtils.addSMSDomainIfPhoneNumber(participant.login);
    let chatReport = lodashGet(report, 'reportID', null) ? report : null;
    let isNewChat = false;
    if (!chatReport) {
        chatReport = ReportUtils.getChatByParticipants([debtorEmail]);
    }
    if (!chatReport) {
        chatReport = ReportUtils.buildOptimisticChatReport([debtorEmail]);
        isNewChat = true;
    }
    let iouReport;
    const originalIOUStatus = chatReport.hasOutstandingIOU;
    if (originalIOUStatus) {
        iouReport = IOUUtils.updateIOUOwnerAndTotal(
            iouReports[`${ONYXKEYS.COLLECTION.REPORT}${chatReport.iouReportID}`],
            recipientEmail,
            amount,
            currency,
        );
    } else {
        iouReport = ReportUtils.buildOptimisticIOUReport(recipientEmail, debtorEmail, amount, chatReport.reportID, currency, preferredLocale);
    }
    const newSequenceNumber = Report.getMaxSequenceNumber(chatReport.reportID) + 1;

    const optimisticReportAction = ReportUtils.buildOptimisticIOUReportAction(
        newSequenceNumber,
        CONST.IOU.REPORT_ACTION_TYPE.CREATE,
        amount,
        currency,
        comment,
        [participant],
        '',
        '',
        iouReport.reportID,
    );

    // First, add data that will be used in all cases
    const optimisticData = [
        {
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`,
            value: {
                ...chatReport,
                lastVisitedTimestamp: Date.now(),
                lastReadSequenceNumber: newSequenceNumber,
                maxSequenceNumber: newSequenceNumber,
                lastMessageText: optimisticReportAction.message[0].text,
                lastMessageHtml: optimisticReportAction.message[0].html,
                hasOutstandingIOU: iouReport.total !== 0,
                iouReportID: iouReport.reportID,
            },
        },
        {
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport.reportID}`,
            value: {
                [optimisticReportAction.sequenceNumber]: optimisticReportAction,
            },
        },
        {
            onyxMethod: originalIOUStatus ? CONST.ONYX.METHOD.MERGE : CONST.ONYX.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport.reportID}`,
            value: iouReport,
        },
    ];

    const successData = [
        {
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport.reportID}`,
            value: {
                [optimisticReportAction.sequenceNumber]: {
                    pendingAction: null,
                },
            },
        },
    ];
    const failureData = [
        {
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`,
            value: {
                hasOutstandingIOU: originalIOUStatus,
            },
        },
        {
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport.reportID}`,
            value: {
                [optimisticReportAction.sequenceNumber]: {
                    ...optimisticReportAction,
                    pendingAction: null,
                    errors: {
                        [DateUtils.getMicroseconds()]: Localize.translateLocal('iou.error.genericCreateFailureMessage'),
                    },
                },
            },
        },
    ];

    // Now, let's add the data we need just when we are creating a new chat report
    if (isNewChat) {
        const optimisticCreatedAction = ReportUtils.buildOptimisticCreatedReportAction(recipientEmail);

        // Change the method to set for new reports because it doesn't exist yet, is faster,
        // and we need the data to be available when we navigate to the chat page
        optimisticData[0].onyxMethod = CONST.ONYX.METHOD.SET;
        optimisticData[0].value = {
            ...optimisticData[0].value,
            pendingFields: {createChat: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD},
        };
        optimisticData[1].onyxMethod = CONST.ONYX.METHOD.SET;
        optimisticData[1].value = {
            ...optimisticCreatedAction,
            ...optimisticData[1].value,
        };
        optimisticData[2].onyxMethod = CONST.ONYX.METHOD.SET;
        successData.push(
            {
                onyxMethod: CONST.ONYX.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`,
                value: {
                    pendingFields: null,
                    errorFields: null,
                },
            },
            {
                onyxMethod: CONST.ONYX.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport.reportID}`,
                value: {
                    0: {
                        pendingAction: null,
                    },
                },
            },
        );

        failureData.push(
            {
                onyxMethod: CONST.ONYX.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`,
                value: {
                    pendingFields: null,
                },
            },
            {
                onyxMethod: CONST.ONYX.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport.reportID}`,
                value: {
                    0: {
                        pendingAction: null,
                    },
                },
            },
        );
    }
    API.write('RequestMoney', {
        debtorEmail,
        amount,
        currency,
        comment,
        iouReportID: iouReport.reportID,
        chatReportID: chatReport.reportID,
        transactionID: optimisticReportAction.originalMessage.IOUTransactionID,
        reportActionID: optimisticReportAction.reportActionID,
        clientID: optimisticReportAction.sequenceNumber,
    }, {optimisticData, successData, failureData});
    Navigation.navigate(ROUTES.getReportRoute(chatReport.reportID));
}

/**
 * Build the Onyx data and IOU split necessary for splitting a bill with 3+ users.
 * 1. Build the optimistic Onyx data for the group chat, i.e. chatReport and iouReportAction creating the former if it doesn't yet exist.
 * 2. Loop over the group chat participant list, building optimistic or updating existing chatReports, iouReports and iouReportActions between the user and each participant.
 * We build both Onyx data and the IOU split that is sent as a request param and is used by Auth to create the chatReports, iouReports and iouReportActions in the database.
 * The IOU split has the following shape:
 *  [
 *      {email: 'currentUser', amount: 100},
 *      {email: 'user2', amount: 100, iouReportID: '100', chatReportID: '110', transactionID: '120', reportActionID: '130', clientID: '140'},
 *      {email: 'user3', amount: 100, iouReportID: '200', chatReportID: '210', transactionID: '220', reportActionID: '230', clientID: '240'}
 *  ]
 * @param {Array} participants
 * @param {String} currentUserLogin
 * @param {Number} amount
 * @param {String} comment
 * @param {String} currency
 * @param {String} locale
 *
 * @return {Object}
 */
function createSplitsAndOnyxData(participants, currentUserLogin, amount, comment, currency, locale) {
    const currentUserEmail = OptionsListUtils.addSMSDomainIfPhoneNumber(currentUserLogin);
    const participantLogins = _.map(participants, participant => OptionsListUtils.addSMSDomainIfPhoneNumber(participant.login).toLowerCase());
    const existingGroupChatReport = ReportUtils.getChatByParticipants(participantLogins);
    const groupChatReport = existingGroupChatReport || ReportUtils.buildOptimisticChatReport(participantLogins);
    const groupCreatedReportAction = existingGroupChatReport ? {} : ReportUtils.buildOptimisticCreatedReportAction(currentUserEmail);
    const groupChatReportMaxSequenceNumber = lodashGet(groupChatReport, 'maxSequenceNumber', 0);
    const groupIOUReportAction = ReportUtils.buildOptimisticIOUReportAction(
        groupChatReportMaxSequenceNumber + 1,
        CONST.IOU.REPORT_ACTION_TYPE.SPLIT,
        Math.round(amount * 100),
        currency,
        comment,
        participants,
    );

    groupChatReport.maxSequenceNumber = groupChatReportMaxSequenceNumber + 1;
    groupChatReport.lastReadSequenceNumber = groupChatReportMaxSequenceNumber + 1;
    groupChatReport.lastVisitedTimestamp = Date.now();
    groupChatReport.lastMessageText = groupIOUReportAction.message[0].text;
    groupChatReport.lastMessageHtml = groupIOUReportAction.message[0].html;
    groupChatReport.pendingFields = {
        createChat: existingGroupChatReport ? null : CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
    };

    const optimisticData = [
        {
            // Use set for new reports because it doesn't exist yet, is faster,
            // and we need the data to be available when we navigate to the chat page
            onyxMethod: existingGroupChatReport ? CONST.ONYX.METHOD.MERGE : CONST.ONYX.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT}${groupChatReport.reportID}`,
            value: groupChatReport,
        },
        {
            onyxMethod: existingGroupChatReport ? CONST.ONYX.METHOD.MERGE : CONST.ONYX.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${groupChatReport.reportID}`,
            value: {
                ...groupCreatedReportAction,
                [groupIOUReportAction.sequenceNumber]: groupIOUReportAction,
            },
        },
    ];

    const successData = [
        {
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${groupChatReport.reportID}`,
            value: {pendingFields: {createChat: null}},
        },
        {
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${groupChatReport.reportID}`,
            value: {
                0: {pendingAction: null},
                [groupIOUReportAction.sequenceNumber]: {pendingAction: null},
            },
        },
    ];

    const failureData = [
        {
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${groupChatReport.reportID}`,
            value: {
                pendingFields: {createChat: null},
            },
        },
        {
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${groupChatReport.reportID}`,
            value: {
                0: {pendingAction: null},
                [groupIOUReportAction.sequenceNumber]: {pendingAction: null},
            },
        },
    ];

    // Loop through participants creating individual chats, iouReports and reportActionIDs as needed
    const splitAmount = IOUUtils.calculateAmount(participants, amount);
    const splits = [{email: currentUserEmail, amount: IOUUtils.calculateAmount(participants, amount, true)}];

    const hasMultipleParticipants = participants.length > 1;
    _.each(participants, (participant) => {
        const email = OptionsListUtils.addSMSDomainIfPhoneNumber(participant.login).toLowerCase();
        if (email === currentUserEmail) {
            return;
        }

        // If we only have one participant, the oneOnOneChatReport is the groupChatReport
        const existingOneOnOneChatReport = hasMultipleParticipants ? ReportUtils.getChatByParticipants([email]) : groupChatReport;
        const oneOnOneChatReport = existingOneOnOneChatReport || ReportUtils.buildOptimisticChatReport([email]);
        let oneOnOneIOUReport;
        let existingIOUReport = null;
        if (oneOnOneChatReport.iouReportID) {
            existingIOUReport = iouReports[`${ONYXKEYS.COLLECTION.REPORT}${oneOnOneChatReport.iouReportID}`];
            oneOnOneIOUReport = IOUUtils.updateIOUOwnerAndTotal(
                existingIOUReport,
                currentUserEmail,
                splitAmount,
                currency,
            );
            oneOnOneChatReport.hasOutstandingIOU = oneOnOneIOUReport.total !== 0;
        } else {
            oneOnOneIOUReport = ReportUtils.buildOptimisticIOUReport(
                currentUserEmail,
                email,
                splitAmount,
                oneOnOneChatReport.reportID,
                currency,
                locale,
            );
            oneOnOneChatReport.hasOutstandingIOU = true;
            oneOnOneChatReport.iouReportID = oneOnOneIOUReport.reportID;
        }

        const oneOnOneCreatedReportAction = existingOneOnOneChatReport ? {} : ReportUtils.buildOptimisticCreatedReportAction(currentUserEmail);
        const oneOnOneChatReportMaxSequenceNumber = lodashGet(oneOnOneChatReport, 'maxSequenceNumber', 0);
        const oneOnOneIOUReportAction = ReportUtils.buildOptimisticIOUReportAction(
            oneOnOneChatReportMaxSequenceNumber + 1,
            CONST.IOU.REPORT_ACTION_TYPE.CREATE,
            splitAmount,
            currency,
            comment,
            [participant],
            '',
            '',
            oneOnOneIOUReport.reportID,
        );

        oneOnOneChatReport.maxSequenceNumber = oneOnOneChatReportMaxSequenceNumber + 1;
        oneOnOneChatReport.lastReadSequenceNumber = oneOnOneChatReportMaxSequenceNumber + 1;
        oneOnOneChatReport.lastMessageText = oneOnOneIOUReportAction.message[0].text;
        oneOnOneChatReport.lastMessageHtml = oneOnOneIOUReportAction.message[0].html;
        oneOnOneChatReport.pendingFields = {
            createChat: existingOneOnOneChatReport ? null : CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        };

        // If we only have one other participant, we just need to update onyxData for the groupChatReport and add an iouReportAction of type = create
        // If we have more participants, we need to push the new oneOnOneChaReport, the create reportAction and iouReportAction of type = create to onyxData
        if (!hasMultipleParticipants) {
            optimisticData[0].value = oneOnOneChatReport;
            optimisticData[1].value = {
                ...optimisticData[1].value,
                [oneOnOneIOUReportAction.sequenceNumber]: oneOnOneIOUReportAction,
            };
            successData[1].value = {
                ...successData[1].value,
                [oneOnOneIOUReportAction.sequenceNumber]: {pendingAction: null},
            };
            failureData[1].value = {
                ...failureData[1].value,
                [oneOnOneIOUReportAction.sequenceNumber]: {pendingAction: null},
            };
        } else {
            optimisticData.push(
                {
                    onyxMethod: existingOneOnOneChatReport ? CONST.ONYX.METHOD.MERGE : CONST.ONYX.METHOD.SET,
                    key: `${ONYXKEYS.COLLECTION.REPORT}${oneOnOneChatReport.reportID}`,
                    value: oneOnOneChatReport,
                },
                {
                    onyxMethod: existingOneOnOneChatReport ? CONST.ONYX.METHOD.MERGE : CONST.ONYX.METHOD.SET,
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${oneOnOneChatReport.reportID}`,
                    value: {
                        ...oneOnOneCreatedReportAction,
                        [oneOnOneIOUReportAction.sequenceNumber]: oneOnOneIOUReportAction,
                    },
                },
            );

            successData.push(
                {
                    onyxMethod: CONST.ONYX.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT}${oneOnOneChatReport.reportID}`,
                    value: {pendingFields: {createChat: null}},
                },
                {
                    onyxMethod: CONST.ONYX.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${oneOnOneChatReport.reportID}`,
                    value: {
                        0: {pendingAction: null},
                        [oneOnOneIOUReportAction.sequenceNumber]: {pendingAction: null},
                    },
                },
            );

            failureData.push(
                {
                    onyxMethod: CONST.ONYX.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT}${oneOnOneChatReport.reportID}`,
                    value: {
                        pendingFields: {createChat: null},
                        hasOutstandingIOU: existingOneOnOneChatReport ? existingOneOnOneChatReport.hasOutstandingIOU : false,
                        iouReportID: existingOneOnOneChatReport ? existingOneOnOneChatReport.iouReportID : null,
                        maxSequenceNumber: oneOnOneChatReportMaxSequenceNumber,
                        lastReadSequenceNumber: oneOnOneChatReportMaxSequenceNumber,
                    },
                },
                {
                    onyxMethod: CONST.ONYX.METHOD.MERGE,
                    key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${oneOnOneChatReport.reportID}`,
                    value: {
                        0: {pendingAction: null},
                        [oneOnOneIOUReportAction.sequenceNumber]: {pendingAction: null},
                    },
                },
            );
        }

        // Regardless of the number of participants, we always want to push the iouReport update to onyxData
        optimisticData.push({
            // We want to use set in case we are creating the the optimistic chat.
            // If we have multiple participants selected, we need to check if the 1:1 chat between the users already exists
            // If we have only one other participant, the group chat is the 1:1 chat and we need to check if that already exists
            onyxMethod: ((hasMultipleParticipants && existingOneOnOneChatReport) || (!hasMultipleParticipants && existingGroupChatReport)) ? CONST.ONYX.METHOD.MERGE : CONST.ONYX.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT}${oneOnOneIOUReport.reportID}`,
            value: oneOnOneIOUReport,
        });

        failureData.push({
            onyxMethod: CONST.ONYX.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT}${oneOnOneIOUReport.reportID}`,
            value: existingIOUReport || oneOnOneIOUReport,
        });

        splits.push({
            email,
            amount: splitAmount,
            iouReportID: oneOnOneIOUReport.reportID,
            chatReportID: oneOnOneChatReport.reportID,
            transactionID: oneOnOneIOUReportAction.originalMessage.IOUTransactionID,
            reportActionID: oneOnOneIOUReportAction.reportActionID,
            clientID: oneOnOneIOUReportAction.clientID.toString(),
        });
    });

    return {
        groupData: {
            chatReportID: groupChatReport.reportID,
            transactionID: groupIOUReportAction.originalMessage.IOUTransactionID,
            reportActionID: groupIOUReportAction.reportActionID,
            clientID: groupIOUReportAction.clientID.toString(),
        },
        splits,
        onyxData: {optimisticData, successData, failureData},
    };
}

/**
 * @param {Array} participants
 * @param {String} currentUserLogin
 * @param {Number} amount
 * @param {String} comment
 * @param {String} currency
 * @param {String} locale
 */
function splitBill(participants, currentUserLogin, amount, comment, currency, locale) {
    const {groupData, splits, onyxData} = createSplitsAndOnyxData(participants, currentUserLogin, amount, comment, currency, locale);

    API.write('SplitBill', {
        reportID: groupData.chatReportID,
        amount: Math.round(amount * 100),
        splits: JSON.stringify(splits),
        currency,
        comment,
        transactionID: groupData.transactionID,
        reportActionID: groupData.reportActionID,
        clientID: groupData.clientID,
    }, onyxData);

    Navigation.dismissModal();
}

/**
 * @param {Array} participants
 * @param {String} currentUserLogin
 * @param {Number} amount
 * @param {String} comment
 * @param {String} currency
 * @param {String} locale
 */
function splitBillAndOpenReport(participants, currentUserLogin, amount, comment, currency, locale) {
    const {groupData, splits, onyxData} = createSplitsAndOnyxData(participants, currentUserLogin, amount, comment, currency, locale);

    API.write('SplitBillAndOpenReport', {
        reportID: groupData.chatReportID,
        amount: Math.round(amount * 100),
        splits: JSON.stringify(splits),
        currency,
        comment,
        transactionID: groupData.transactionID,
        reportActionID: groupData.reportActionID,
        clientID: groupData.clientID,
    }, onyxData);

    Navigation.navigate(ROUTES.getReportRoute(groupData.chatReportID));
}

/**
 * Cancels or declines a transaction in iouReport.
 * Declining and cancelling transactions are done via the same Auth command.
 *
 * @param {String} chatReportID
 * @param {String} iouReportID
 * @param {String} type - cancel|decline
 * @param {Object} moneyRequestAction - the create IOU reportAction we are cancelling
 */
function cancelMoneyRequest(chatReportID, iouReportID, type, moneyRequestAction) {
    const chatReport = chatReports[`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`];
    const iouReport = iouReports[`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`];
    const transactionID = moneyRequestAction.originalMessage.IOUTransactionID;

    // Get the amount we are cancelling
    const amount = moneyRequestAction.originalMessage.amount;
    const newSequenceNumber = Report.getMaxSequenceNumber(chatReport.reportID) + 1;
    const optimisticReportAction = ReportUtils.buildOptimisticIOUReportAction(
        newSequenceNumber,
        type,
        amount,
        moneyRequestAction.originalMessage.currency,
        moneyRequestAction.originalMessage.comment,
        [],
        '',
        transactionID,
        iouReportID,
    );

    const currentUserEmail = optimisticReportAction.actorEmail;
    const updatedIOUReport = IOUUtils.updateIOUOwnerAndTotal(iouReport, currentUserEmail, amount, moneyRequestAction.originalMessage.currency, type);

    chatReport.maxSequenceNumber = newSequenceNumber;
    chatReport.lastReadSequenceNumber = newSequenceNumber;
    chatReport.lastMessageText = optimisticReportAction.message[0].text;
    chatReport.lastMessageHtml = optimisticReportAction.message[0].html;
    chatReport.hasOutstandingIOU = updatedIOUReport.total !== 0;

    const optimisticData = [
        {
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReportID}`,
            value: {
                [optimisticReportAction.sequenceNumber]: {
                    ...optimisticReportAction,
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                },
            },
        },
        {
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`,
            value: chatReport,
        },
        {
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`,
            value: updatedIOUReport,
        },
    ];
    const successData = [
        {
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReportID}`,
            value: {
                [optimisticReportAction.sequenceNumber]: {
                    pendingAction: null,
                },
            },
        },
    ];
    const failureData = [
        {
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReportID}`,
            value: {
                [optimisticReportAction.sequenceNumber]: {
                    pendingAction: null,
                    errors: {
                        [DateUtils.getMicroseconds()]: Localize.translateLocal('iou.error.genericCancelFailureMessage', {type}),
                    },
                },
            },
        },
    ];

    API.write('CancelMoneyRequest', {
        transactionID,
        iouReportID: updatedIOUReport.reportID,
        comment: '',
        clientID: optimisticReportAction.sequenceNumber,
        cancelMoneyRequestReportActionID: optimisticReportAction.reportActionID,
        chatReportID,
        debtorEmail: chatReport.participants[0],
    }, {optimisticData, successData, failureData});

    Navigation.navigate(ROUTES.getReportRoute(chatReportID));
}

/**
 * Sets IOU'S selected currency
 *
 * @param {String} selectedCurrencyCode
 */
function setIOUSelectedCurrency(selectedCurrencyCode) {
    Onyx.merge(ONYXKEYS.IOU, {selectedCurrencyCode});
}

/**
 * @param {Number} amount
 * @param {String} submitterPayPalMeAddress
 * @param {String} currency
 * @returns {String}
 */
function buildPayPalPaymentUrl(amount, submitterPayPalMeAddress, currency) {
    return `https://paypal.me/${submitterPayPalMeAddress}/${(amount / 100)}${currency}`;
}

/**
 * Pays an IOU Report and then retrieves the iou and chat reports to trigger updates to the UI.
 *
 * @param {Object} params
 * @param {Number} params.chatReportID
 * @param {String} params.reportID
 * @param {String} params.paymentMethodType - one of CONST.IOU.PAYMENT_TYPE
 * @param {Number} params.amount
 * @param {String} params.currency
 * @param {String} [params.requestorPayPalMeAddress]
 * @param {String} [params.newIOUReportDetails] - Extra details required only for send money flow
 *
 * @return {Promise}
 */
function payIOUReport({
    chatReportID,
    reportID,
    paymentMethodType,
    amount,
    currency,
    requestorPayPalMeAddress,
    newIOUReportDetails,
}) {
    Onyx.merge(ONYXKEYS.IOU, {loading: true, error: false});

    // Build the url for Paypal.me if they have selected it instead of a manual settlement or Expensify Wallet
    let url;
    if (paymentMethodType === CONST.IOU.PAYMENT_TYPE.PAYPAL_ME) {
        url = buildPayPalPaymentUrl(amount, requestorPayPalMeAddress, currency);
    }

    const promiseWithHandlers = DeprecatedAPI.PayWithWallet({reportID, newIOUReportDetails})
        .then((response) => {
            if (response.jsonCode !== 200) {
                switch (response.message) {
                    case 'You cannot pay via Expensify Wallet until you have either a verified deposit bank account or debit card.':
                        Growl.error(Localize.translateLocal('bankAccount.error.noDefaultDepositAccountOrDebitCardAvailable'), 5000);
                        break;
                    case 'This report doesn\'t have reimbursable expenses.':
                        Growl.error(Localize.translateLocal('iou.noReimbursableExpenses'), 5000);
                        break;
                    default:
                        Growl.error(response.message, 5000);
                }
                Onyx.merge(ONYXKEYS.IOU, {error: true});
                return;
            }

            const chatReportStuff = response.reports[chatReportID];
            const iouReportStuff = response.reports[reportID];
            Report.syncChatAndIOUReports(chatReportStuff, iouReportStuff);
        })
        .finally(() => {
            Onyx.merge(ONYXKEYS.IOU, {loading: false});
        });
    asyncOpenURL(promiseWithHandlers, url);
    return promiseWithHandlers;
}

/**
 * @param {Object} report
 * @param {Number} amount
 * @param {String} currency
 * @param {String} comment
 * @param {String} paymentMethodType
 * @param {String} managerEmail - Email of the person sending the money
 * @param {Object} recipient - The user receiving the money
 * @returns {Object}
 */
function getSendMoneyParams(report, amount, currency, comment, paymentMethodType, managerEmail, recipient) {
    const recipientEmail = OptionsListUtils.addSMSDomainIfPhoneNumber(recipient.login);

    const newIOUReportDetails = JSON.stringify({
        amount,
        currency,
        requestorEmail: recipientEmail,
        comment,
        idempotencyKey: Str.guid(),
    });

    let chatReport = report.reportID ? report : null;
    let isNewChat = false;
    if (!chatReport) {
        chatReport = ReportUtils.getChatByParticipants([recipientEmail]);
    }
    if (!chatReport) {
        chatReport = ReportUtils.buildOptimisticChatReport([recipientEmail]);
        isNewChat = true;
    }
    const optimisticIOUReport = ReportUtils.buildOptimisticIOUReport(recipientEmail, managerEmail, amount, chatReport.reportID, currency, preferredLocale, true);

    // This will be deprecated soon, in case the migration happens before this PR is merged we'll need to adjust the code here
    const newSequenceNumber = Report.getMaxSequenceNumber(chatReport.reportID) + 1;

    const optimisticIOUReportAction = ReportUtils.buildOptimisticIOUReportAction(
        newSequenceNumber,
        CONST.IOU.REPORT_ACTION_TYPE.PAY,
        amount,
        currency,
        comment,
        [recipient],
        paymentMethodType,
        '',
        optimisticIOUReport.reportID,
    );

    // First, add data that will be used in all cases
    const optimisticData = [
        {
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`,
            value: {
                ...chatReport,
                lastVisitedTimestamp: Date.now(),
                lastActionCreated: optimisticIOUReportAction.created,
                lastReadSequenceNumber: newSequenceNumber,
                maxSequenceNumber: newSequenceNumber,
                lastMessageText: optimisticIOUReportAction.message[0].text,
                lastMessageHtml: optimisticIOUReportAction.message[0].html,
            },
        },
        {
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport.reportID}`,
            value: {
                [optimisticIOUReportAction.sequenceNumber]: {
                    ...optimisticIOUReportAction,
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                },
            },
        },
        {
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${optimisticIOUReport.reportID}`,
            value: optimisticIOUReport,
        },
    ];

    const successData = [
        {
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport.reportID}`,
            value: {
                [optimisticIOUReportAction.sequenceNumber]: {
                    pendingAction: null,
                },
            },
        },
    ];

    const failureData = [
        {
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport.reportID}`,
            value: {
                [optimisticIOUReportAction.sequenceNumber]: {
                    errors: {
                        [DateUtils.getMicroseconds()]: Localize.translateLocal('iou.error.other'),
                    },
                },
            },
        },
    ];

    // Now, let's add the data we need just when we are creating a new chat report
    if (isNewChat) {
        const optimisticCreatedAction = ReportUtils.buildOptimisticCreatedReportAction(recipientEmail);

        // Change the method to set for new reports because it doesn't exist yet, is faster,
        // and we need the data to be available when we navigate to the chat page
        optimisticData[0].onyxMethod = CONST.ONYX.METHOD.SET;
        optimisticData[0].value = {
            ...optimisticData[0].value,
            pendingFields: {createChat: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD},
        };
        optimisticData[1].onyxMethod = CONST.ONYX.METHOD.SET;
        optimisticData[1].value = {
            ...optimisticCreatedAction,
            ...optimisticData[1].value,
        };
        optimisticData[2].onyxMethod = CONST.ONYX.METHOD.SET;
    }

    return {
        params: {
            iouReportID: optimisticIOUReport.reportID,
            chatReportID: chatReport.reportID,
            reportActionID: optimisticIOUReportAction.reportActionID,
            paymentMethodType,
            transactionID: optimisticIOUReportAction.originalMessage.IOUTransactionID,
            clientID: optimisticIOUReportAction.sequenceNumber,
            newIOUReportDetails,
        },
        optimisticData,
        successData,
        failureData,
    };
}

/**
 * @param {Object} chatReport
 * @param {Object} iouReport
 * @param {Object} recipient
 * @param {String} paymentMethodType
 * @returns {Object}
 */
function getPayMoneyRequestParams(chatReport, iouReport, recipient, paymentMethodType) {
    const newSequenceNumber = Report.getMaxSequenceNumber(chatReport.reportID) + 1;

    const optimisticIOUReportAction = ReportUtils.buildOptimisticIOUReportAction(
        newSequenceNumber,
        CONST.IOU.REPORT_ACTION_TYPE.PAY,
        iouReport.total,
        iouReport.currency,
        '',
        [recipient],
        paymentMethodType,
        '',
        iouReport.reportID,
        true,
    );

    const optimisticData = [
        {
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`,
            value: {
                ...chatReport,
                lastVisitedTimestamp: Date.now(),
                lastActionCreated: optimisticIOUReportAction.created,
                lastReadSequenceNumber: newSequenceNumber,
                maxSequenceNumber: newSequenceNumber,
                lastMessageText: optimisticIOUReportAction.message[0].text,
                lastMessageHtml: optimisticIOUReportAction.message[0].html,
                hasOutstandingIOU: false,
                iouReportID: null,
            },
        },
        {
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport.reportID}`,
            value: {
                [optimisticIOUReportAction.sequenceNumber]: {
                    ...optimisticIOUReportAction,
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                },
            },
        },
        {
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport.reportID}`,
            value: {
                ...iouReport,
                hasOutstandingIOU: false,
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            },
        },
    ];

    const successData = [
        {
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport.reportID}`,
            value: {
                [optimisticIOUReportAction.sequenceNumber]: {
                    pendingAction: null,
                },
            },
        },
    ];

    const failureData = [
        {
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport.reportID}`,
            value: {
                [optimisticIOUReportAction.sequenceNumber]: {
                    pendingAction: null,
                    errors: {
                        [DateUtils.getMicroseconds()]: Localize.translateLocal('iou.error.other'),
                    },
                },
            },
        },
    ];

    return {
        params: {
            iouReportID: iouReport.reportID,
            reportActionID: optimisticIOUReportAction.reportActionID,
            paymentMethodType,
            clientID: optimisticIOUReportAction.sequenceNumber,
        },
        optimisticData,
        successData,
        failureData,
    };
}

/**
 * @param {Object} report
 * @param {Number} amount
 * @param {String} currency
 * @param {String} comment
 * @param {String} managerEmail - Email of the person sending the money
 * @param {Object} recipient - The user receiving the money
 */
function sendMoneyElsewhere(report, amount, currency, comment, managerEmail, recipient) {
    const {
        params, optimisticData, successData, failureData,
    } = getSendMoneyParams(report, amount, currency, comment, CONST.IOU.PAYMENT_TYPE.ELSEWHERE, managerEmail, recipient);

    API.write('SendMoneyElsewhere', params, {optimisticData, successData, failureData});

    Navigation.navigate(ROUTES.getReportRoute(params.chatReportID));
}

/**
 * @param {Object} report
 * @param {Number} amount
 * @param {String} currency
 * @param {String} comment
 * @param {String} managerEmail - Email of the person sending the money
 * @param {Object} recipient - The user receiving the money
 */
function sendMoneyViaPaypal(report, amount, currency, comment, managerEmail, recipient) {
    const {
        params, optimisticData, successData, failureData,
    } = getSendMoneyParams(report, amount, currency, comment, CONST.IOU.PAYMENT_TYPE.PAYPAL_ME, managerEmail, recipient);

    API.write('SendMoneyViaPaypal', params, {optimisticData, successData, failureData});

    Navigation.navigate(ROUTES.getReportRoute(params.chatReportID));

    asyncOpenURL(Promise.resolve(), buildPayPalPaymentUrl(amount, recipient.payPalMeAddress, currency));
}

/**
 * @param {Object} chatReport
 * @param {Object} iouReport
 * @param {Object} recipient
 */
function payMoneyRequestElsewhere(chatReport, iouReport, recipient) {
    const {
        params, optimisticData, successData, failureData,
    } = getPayMoneyRequestParams(chatReport, iouReport, recipient, CONST.IOU.PAYMENT_TYPE.ELSEWHERE);

    API.write('PayMoneyRequestElsewhere', params, {optimisticData, successData, failureData});

    Navigation.navigate(ROUTES.getReportRoute(chatReport.reportID));
}

/**
 * @param {Object} chatReport
 * @param {Object} iouReport
 * @param {Object} recipient
 */
function payMoneyRequestViaPaypal(chatReport, iouReport, recipient) {
    const {
        params, optimisticData, successData, failureData,
    } = getPayMoneyRequestParams(chatReport, iouReport, recipient, CONST.IOU.PAYMENT_TYPE.PAYPAL_ME);

    API.write('PayMoneyRequestViaPaypal', params, {optimisticData, successData, failureData});

    Navigation.navigate(ROUTES.getReportRoute(chatReport.reportID));

    asyncOpenURL(Promise.resolve(), buildPayPalPaymentUrl(iouReport.total, recipient.payPalMeAddress, iouReport.currency));
}

export {
    cancelMoneyRequest,
    splitBill,
    splitBillAndOpenReport,
    requestMoney,
    payIOUReport,
    sendMoneyElsewhere,
    sendMoneyViaPaypal,
    payMoneyRequestElsewhere,
    payMoneyRequestViaPaypal,
    setIOUSelectedCurrency,
};
