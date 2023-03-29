import Onyx from 'react-native-onyx';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import Str from 'expensify-common/lib/str';
import CONST from '../../CONST';
import ONYXKEYS from '../../ONYXKEYS';
import ROUTES from '../../ROUTES';
import Navigation from '../Navigation/Navigation';
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
    if (chatReport.iouReportID) {
        iouReport = IOUUtils.updateIOUOwnerAndTotal(
            iouReports[`${ONYXKEYS.COLLECTION.REPORT}${chatReport.iouReportID}`],
            recipientEmail,
            amount,
            currency,
        );
    } else {
        iouReport = ReportUtils.buildOptimisticIOUReport(recipientEmail, debtorEmail, amount, chatReport.reportID, currency, preferredLocale);
    }

    // Note: The created action must be optimistically generated before the IOU action so there's no chance that the created action appears after the IOU action in the chat
    const optimisticCreatedAction = ReportUtils.buildOptimisticCreatedReportAction(recipientEmail);
    const optimisticReportAction = ReportUtils.buildOptimisticIOUReportAction(
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
    const optimisticChatReportData = {
        onyxMethod: CONST.ONYX.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`,
        value: {
            ...chatReport,
            lastReadTime: DateUtils.getDBTime(),
            lastMessageText: optimisticReportAction.message[0].text,
            lastMessageHtml: optimisticReportAction.message[0].html,
            hasOutstandingIOU: iouReport.total !== 0,
            iouReportID: iouReport.reportID,
        },
    };

    const optimisticIOUReportData = {
        onyxMethod: chatReport.hasOutstandingIOU ? CONST.ONYX.METHOD.MERGE : CONST.ONYX.METHOD.SET,
        key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport.reportID}`,
        value: iouReport,
    };

    const optimisticReportActionsData = {
        onyxMethod: CONST.ONYX.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport.reportID}`,
        value: {
            [optimisticReportAction.reportActionID]: optimisticReportAction,
        },
    };

    let chatReportSuccessData = {};
    const reportActionsSuccessData = {
        onyxMethod: CONST.ONYX.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport.reportID}`,
        value: {
            [optimisticReportAction.reportActionID]: {
                pendingAction: null,
            },
        },
    };

    const chatReportFailureData = {
        onyxMethod: CONST.ONYX.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`,
        value: {
            hasOutstandingIOU: chatReport.hasOutstandingIOU,
        },
    };

    const reportActionsFailureData = {
        onyxMethod: CONST.ONYX.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport.reportID}`,
        value: {
            [optimisticReportAction.reportActionID]: {
                ...optimisticReportAction,
                pendingAction: null,
                errors: {
                    [DateUtils.getMicroseconds()]: Localize.translateLocal('iou.error.genericCreateFailureMessage'),
                },
            },
        },
    };

    // Now, let's add the data we need just when we are creating a new chat report
    if (isNewChat) {
        // Change the method to set for new reports because it doesn't exist yet, is faster,
        // and we need the data to be available when we navigate to the chat page
        optimisticChatReportData.onyxMethod = CONST.ONYX.METHOD.SET;
        optimisticIOUReportData.onyxMethod = CONST.ONYX.METHOD.SET;
        optimisticReportActionsData.onyxMethod = CONST.ONYX.METHOD.SET;

        // Then add and clear pending fields from the chat report
        optimisticChatReportData.value.pendingFields = {createChat: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD};
        chatReportSuccessData = {
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: optimisticChatReportData.key,
            value: {
                pendingFields: null,
                errorFields: null,
            },
        };
        chatReportFailureData.value.pendingFields = null;

        // Then add an optimistic created action
        optimisticReportActionsData.value[optimisticCreatedAction.reportActionID] = optimisticCreatedAction;
        reportActionsSuccessData.value[optimisticCreatedAction.reportActionID] = {pendingAction: null};
        reportActionsFailureData.value[optimisticCreatedAction.reportActionID] = {pendingAction: null};
    }

    const optimisticData = [
        optimisticChatReportData,
        optimisticIOUReportData,
        optimisticReportActionsData,
    ];

    const successData = [
        reportActionsSuccessData,
    ];
    if (!_.isEmpty(chatReportSuccessData)) {
        successData.push(chatReportSuccessData);
    }

    const failureData = [
        chatReportFailureData,
        reportActionsFailureData,
    ];

    const parsedComment = ReportUtils.getParsedComment(comment);
    API.write('RequestMoney', {
        debtorEmail,
        amount,
        currency,
        comment: parsedComment,
        iouReportID: iouReport.reportID,
        chatReportID: chatReport.reportID,
        transactionID: optimisticReportAction.originalMessage.IOUTransactionID,
        reportActionID: optimisticReportAction.reportActionID,
        createdReportActionID: isNewChat ? optimisticCreatedAction.reportActionID : 0,
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
 *      {email: 'user2', amount: 100, iouReportID: '100', chatReportID: '110', transactionID: '120', reportActionID: '130'},
 *      {email: 'user3', amount: 100, iouReportID: '200', chatReportID: '210', transactionID: '220', reportActionID: '230'}
 *  ]
 * @param {Array} participants
 * @param {String} currentUserLogin
 * @param {Number} amount
 * @param {String} comment
 * @param {String} currency
 * @param {String} locale
 * @param {String} existingGroupChatReportID
 *
 * @return {Object}
 */
function createSplitsAndOnyxData(participants, currentUserLogin, amount, comment, currency, locale, existingGroupChatReportID = '') {
    const currentUserEmail = OptionsListUtils.addSMSDomainIfPhoneNumber(currentUserLogin);
    const participantLogins = _.map(participants, participant => OptionsListUtils.addSMSDomainIfPhoneNumber(participant.login).toLowerCase());
    const existingGroupChatReport = existingGroupChatReportID
        ? chatReports[`${ONYXKEYS.COLLECTION.REPORT}${existingGroupChatReportID}`]
        : ReportUtils.getChatByParticipants(participantLogins);
    const groupChatReport = existingGroupChatReport || ReportUtils.buildOptimisticChatReport(participantLogins);

    // Note: The created action must be optimistically generated before the IOU action so there's no chance that the created action appears after the IOU action in the chat
    const groupCreatedReportAction = ReportUtils.buildOptimisticCreatedReportAction(currentUserEmail);
    const groupIOUReportAction = ReportUtils.buildOptimisticIOUReportAction(
        CONST.IOU.REPORT_ACTION_TYPE.SPLIT,
        Math.round(amount * 100),
        currency,
        comment,
        participants,
    );

    groupChatReport.lastReadTime = DateUtils.getDBTime();
    groupChatReport.lastMessageText = groupIOUReportAction.message[0].text;
    groupChatReport.lastMessageHtml = groupIOUReportAction.message[0].html;

    // If we have an existing groupChatReport use it's pending fields, otherwise indicate that we are adding a chat
    if (!existingGroupChatReport) {
        groupChatReport.pendingFields = {
            createChat: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        };
    }

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
                ...(existingGroupChatReport ? {} : {[groupCreatedReportAction.reportActionID]: groupCreatedReportAction}),
                [groupIOUReportAction.reportActionID]: groupIOUReportAction,
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
                ...(existingGroupChatReport ? {} : {[groupCreatedReportAction.reportActionID]: {pendingAction: null}}),
                [groupIOUReportAction.reportActionID]: {pendingAction: null},
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
                ...(existingGroupChatReport ? {} : {[groupCreatedReportAction.reportActionID]: {pendingAction: null}}),
                [groupIOUReportAction.reportActionID]: {pendingAction: null},
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

        // If we only have one participant and the request was initiated from the global create menu, i.e. !existingGroupChatReportID, the oneOnOneChatReport is the groupChatReport
        const existingOneOnOneChatReport = (!hasMultipleParticipants && !existingGroupChatReportID) ? groupChatReport : ReportUtils.getChatByParticipants([email]);
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

        // Note: The created action must be optimistically generated before the IOU action so there's no chance that the created action appears after the IOU action in the chat
        const oneOnOneCreatedReportAction = ReportUtils.buildOptimisticCreatedReportAction(currentUserEmail);
        const oneOnOneIOUReportAction = ReportUtils.buildOptimisticIOUReportAction(
            CONST.IOU.REPORT_ACTION_TYPE.CREATE,
            splitAmount,
            currency,
            comment,
            [participant],
            '',
            '',
            oneOnOneIOUReport.reportID,
        );

        oneOnOneChatReport.lastMessageText = oneOnOneIOUReportAction.message[0].text;
        oneOnOneChatReport.lastMessageHtml = oneOnOneIOUReportAction.message[0].html;

        if (!existingOneOnOneChatReport) {
            oneOnOneChatReport.pendingFields = {
                createChat: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            };
        }

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
                    ...(existingOneOnOneChatReport
                        ? {}
                        : {[oneOnOneCreatedReportAction.reportActionID]: oneOnOneCreatedReportAction}
                    ),
                    [oneOnOneIOUReportAction.reportActionID]: oneOnOneIOUReportAction,
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
                    ...(existingOneOnOneChatReport
                        ? {}
                        : {[oneOnOneCreatedReportAction.reportActionID]: {pendingAction: null}}
                    ),
                    [oneOnOneIOUReportAction.reportActionID]: {pendingAction: null},
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
                },
            },
            {
                onyxMethod: CONST.ONYX.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${oneOnOneChatReport.reportID}`,
                value: {
                    ...(existingOneOnOneChatReport
                        ? {}
                        : {[oneOnOneCreatedReportAction.reportActionID]: {pendingAction: null}}
                    ),
                    [oneOnOneIOUReportAction.reportActionID]: {pendingAction: null},
                },
            },
        );

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

        const splitData = {
            email,
            amount: splitAmount,
            iouReportID: oneOnOneIOUReport.reportID,
            chatReportID: oneOnOneChatReport.reportID,
            transactionID: oneOnOneIOUReportAction.originalMessage.IOUTransactionID,
            reportActionID: oneOnOneIOUReportAction.reportActionID,
        };

        if (!_.isEmpty(oneOnOneCreatedReportAction)) {
            splitData.createdReportActionID = oneOnOneCreatedReportAction.reportActionID;
        }

        splits.push(splitData);
    });

    const groupData = {
        chatReportID: groupChatReport.reportID,
        transactionID: groupIOUReportAction.originalMessage.IOUTransactionID,
        reportActionID: groupIOUReportAction.reportActionID,
    };

    if (!_.isEmpty(groupCreatedReportAction)) {
        groupData.createdReportActionID = groupCreatedReportAction.reportActionID;
    }

    return {
        groupData,
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
 * @param {String} existingGroupChatReportID
 */
function splitBill(participants, currentUserLogin, amount, comment, currency, locale, existingGroupChatReportID = '') {
    const {groupData, splits, onyxData} = createSplitsAndOnyxData(participants, currentUserLogin, amount, comment, currency, locale, existingGroupChatReportID);
    const parsedComment = ReportUtils.getParsedComment(comment);

    API.write('SplitBill', {
        reportID: groupData.chatReportID,
        amount: Math.round(amount * 100),
        splits: JSON.stringify(splits),
        currency,
        comment: parsedComment,
        transactionID: groupData.transactionID,
        reportActionID: groupData.reportActionID,
        createdReportActionID: groupData.createdReportActionID,
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
    const parsedComment = ReportUtils.getParsedComment(comment);

    API.write('SplitBillAndOpenReport', {
        reportID: groupData.chatReportID,
        amount: Math.round(amount * 100),
        splits: JSON.stringify(splits),
        currency,
        comment: parsedComment,
        transactionID: groupData.transactionID,
        reportActionID: groupData.reportActionID,
        createdReportActionID: groupData.createdReportActionID,
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
    const optimisticReportAction = ReportUtils.buildOptimisticIOUReportAction(
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

    chatReport.lastMessageText = optimisticReportAction.message[0].text;
    chatReport.lastMessageHtml = optimisticReportAction.message[0].html;
    chatReport.hasOutstandingIOU = updatedIOUReport.total !== 0;

    const optimisticData = [
        {
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReportID}`,
            value: {
                [optimisticReportAction.reportActionID]: {
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
                [optimisticReportAction.reportActionID]: {
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
                [optimisticReportAction.reportActionID]: {
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
    const parsedComment = ReportUtils.getParsedComment(comment);
    const newIOUReportDetails = JSON.stringify({
        amount,
        currency,
        requestorEmail: recipientEmail,
        comment: parsedComment,
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

    // Note: The created action must be optimistically generated before the IOU action so there's no chance that the created action appears after the IOU action in the chat
    const optimisticCreatedAction = ReportUtils.buildOptimisticCreatedReportAction(recipientEmail);
    const optimisticIOUReportAction = ReportUtils.buildOptimisticIOUReportAction(
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
    const optimisticChatReportData = {
        onyxMethod: CONST.ONYX.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`,
        value: {
            ...chatReport,
            lastReadTime: DateUtils.getDBTime(),
            lastVisibleActionCreated: optimisticIOUReportAction.created,
            lastMessageText: optimisticIOUReportAction.message[0].text,
            lastMessageHtml: optimisticIOUReportAction.message[0].html,
        },
    };
    const optimisticIOUReportData = {
        onyxMethod: CONST.ONYX.METHOD.SET,
        key: `${ONYXKEYS.COLLECTION.REPORT}${optimisticIOUReport.reportID}`,
        value: optimisticIOUReport,
    };
    const optimisticReportActionsData = {
        onyxMethod: CONST.ONYX.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport.reportID}`,
        value: {
            [optimisticIOUReportAction.reportActionID]: {
                ...optimisticIOUReportAction,
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            },
        },
    };

    const successData = [
        {
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport.reportID}`,
            value: {
                [optimisticIOUReportAction.reportActionID]: {
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
                [optimisticIOUReportAction.reportActionID]: {
                    errors: {
                        [DateUtils.getMicroseconds()]: Localize.translateLocal('iou.error.other'),
                    },
                },
            },
        },
    ];

    // Now, let's add the data we need just when we are creating a new chat report
    if (isNewChat) {
        // Change the method to set for new reports because it doesn't exist yet, is faster,
        // and we need the data to be available when we navigate to the chat page
        optimisticChatReportData.onyxMethod = CONST.ONYX.METHOD.SET;
        optimisticReportActionsData.onyxMethod = CONST.ONYX.METHOD.SET;
        optimisticIOUReportData.onyxMethod = CONST.ONYX.METHOD.SET;

        // Set and clear pending fields on the chat report
        optimisticChatReportData.value.pendingFields = {createChat: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD};
        successData.push({
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: optimisticChatReportData.key,
            value: {pendingFields: null},
        });

        // Add an optimistic created action to the optimistic reportActions data
        optimisticReportActionsData.value[optimisticCreatedAction.reportActionID] = optimisticCreatedAction;
    }

    const optimisticData = [
        optimisticChatReportData,
        optimisticIOUReportData,
        optimisticReportActionsData,
    ];

    return {
        params: {
            iouReportID: optimisticIOUReport.reportID,
            chatReportID: chatReport.reportID,
            reportActionID: optimisticIOUReportAction.reportActionID,
            paymentMethodType,
            transactionID: optimisticIOUReportAction.originalMessage.IOUTransactionID,
            newIOUReportDetails,
            createdReportActionID: isNewChat ? optimisticCreatedAction.reportActionID : 0,
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
    const optimisticIOUReportAction = ReportUtils.buildOptimisticIOUReportAction(
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
                lastReadTime: DateUtils.getDBTime(),
                lastVisibleActionCreated: optimisticIOUReportAction.created,
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
                [optimisticIOUReportAction.reportActionID]: {
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
                [optimisticIOUReportAction.reportActionID]: {
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
                [optimisticIOUReportAction.reportActionID]: {
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
            chatReportID: chatReport.reportID,
            reportActionID: optimisticIOUReportAction.reportActionID,
            paymentMethodType,
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
function sendMoneyWithWallet(report, amount, currency, comment, managerEmail, recipient) {
    const {
        params, optimisticData, successData, failureData,
    } = getSendMoneyParams(report, amount, currency, comment, CONST.IOU.PAYMENT_TYPE.EXPENSIFY, managerEmail, recipient);

    API.write('SendMoneyWithWallet', params, {optimisticData, successData, failureData});

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
function payMoneyRequestWithWallet(chatReport, iouReport, recipient) {
    const {
        params, optimisticData, successData, failureData,
    } = getPayMoneyRequestParams(chatReport, iouReport, recipient, CONST.IOU.PAYMENT_TYPE.EXPENSIFY);

    API.write('PayMoneyRequestWithWallet', params, {optimisticData, successData, failureData});

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
    sendMoneyElsewhere,
    sendMoneyViaPaypal,
    payMoneyRequestElsewhere,
    payMoneyRequestViaPaypal,
    setIOUSelectedCurrency,
    sendMoneyWithWallet,
    payMoneyRequestWithWallet,
};
