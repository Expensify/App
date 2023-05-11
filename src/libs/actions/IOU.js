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
import TransactionUtils from '../TransactionUtils';

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

let transactions = {};
Onyx.connect({
    key: ONYXKEYS.COLLECTION.TRANSACTION,
    waitForCollectionCallback: true,
    callback: (val) => {
        if (!val) {
            return;
        }
        transactions = val;
    },
});

/**
 * Request money from another user
 *
 * @param {Object} report
 * @param {Number} amount - always in the smallest unit of the currency
 * @param {String} currency
 * @param {String} payeeEmail
 * @param {Object} participant
 * @param {String} comment
 */
function requestMoney(report, amount, currency, payeeEmail, participant, comment) {
    const payerEmail = OptionsListUtils.addSMSDomainIfPhoneNumber(participant.login);
    let chatReport = lodashGet(report, 'reportID', null) ? report : null;
    const isPolicyExpenseChat = participant.isPolicyExpenseChat || participant.isOwnPolicyExpenseChat;
    let isNewChat = false;

    // If this is a policyExpenseChat, the chatReport must exist and we can get it from Onyx.
    // report is null if the flow is initiated from the global create menu. However, participant always stores the reportID if it exists, which is the case for policyExpenseChats
    if (!chatReport && isPolicyExpenseChat) {
        chatReport = chatReports[`${ONYXKEYS.COLLECTION.REPORT}${participant.reportID}`];
    }

    if (!chatReport) {
        chatReport = ReportUtils.getChatByParticipants([payerEmail]);
    }
    if (!chatReport) {
        chatReport = ReportUtils.buildOptimisticChatReport([payerEmail]);
        isNewChat = true;
    }
    let moneyRequestReport;
    if (chatReport.iouReportID) {
        if (isPolicyExpenseChat) {
            moneyRequestReport = {...iouReports[`${ONYXKEYS.COLLECTION.REPORT}${chatReport.iouReportID}`]};
            moneyRequestReport.total += amount;
        } else {
            moneyRequestReport = IOUUtils.updateIOUOwnerAndTotal(iouReports[`${ONYXKEYS.COLLECTION.REPORT}${chatReport.iouReportID}`], payeeEmail, amount, currency);
        }
    } else {
        moneyRequestReport = isPolicyExpenseChat
            ? ReportUtils.buildOptimisticExpenseReport(chatReport.reportID, chatReport.policyID, payeeEmail, amount, currency)
            : ReportUtils.buildOptimisticIOUReport(payeeEmail, payerEmail, amount, chatReport.reportID, currency);
    }

    const optimisticTransaction = TransactionUtils.buildOptimisticTransaction(amount, currency, moneyRequestReport.reportID, comment);
    const optimisticTransactionData = {
        onyxMethod: Onyx.METHOD.SET,
        key: `${ONYXKEYS.COLLECTION.TRANSACTION}${optimisticTransaction.transactionID}`,
        value: optimisticTransaction,
    };
    const transactionSuccessData = {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.TRANSACTION}${optimisticTransaction.transactionID}`,
        value: {
            pendingAction: null,
        },
    };
    const transactionFailureData = {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.TRANSACTION}${optimisticTransaction.transactionID}`,
        value: {
            errors: {
                [DateUtils.getMicroseconds()]: Localize.translateLocal('iou.error.genericCreateFailureMessage'),
            },
        },
    };

    // Note: The created action must be optimistically generated before the IOU action so there's no chance that the created action appears after the IOU action in the chat
    const optimisticCreatedAction = ReportUtils.buildOptimisticCreatedReportAction(payeeEmail);
    const optimisticReportAction = ReportUtils.buildOptimisticIOUReportAction(
        CONST.IOU.REPORT_ACTION_TYPE.CREATE,
        amount,
        currency,
        comment,
        [participant],
        optimisticTransaction.transactionID,
        '',
        moneyRequestReport.reportID,
    );

    // First, add data that will be used in all cases
    const optimisticChatReportData = {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`,
        value: {
            ...chatReport,
            lastReadTime: DateUtils.getDBTime(),
            lastMessageText: optimisticReportAction.message[0].text,
            lastMessageHtml: optimisticReportAction.message[0].html,
            hasOutstandingIOU: moneyRequestReport.total !== 0,
            iouReportID: moneyRequestReport.reportID,
        },
    };

    const optimisticIOUReportData = {
        onyxMethod: chatReport.hasOutstandingIOU ? Onyx.METHOD.MERGE : Onyx.METHOD.SET,
        key: `${ONYXKEYS.COLLECTION.REPORT}${moneyRequestReport.reportID}`,
        value: moneyRequestReport,
    };

    const optimisticReportActionsData = {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport.reportID}`,
        value: {
            [optimisticReportAction.reportActionID]: optimisticReportAction,
        },
    };

    let chatReportSuccessData = {};
    const reportActionsSuccessData = {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport.reportID}`,
        value: {
            [optimisticReportAction.reportActionID]: {
                pendingAction: null,
            },
        },
    };

    const chatReportFailureData = {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`,
        value: {
            hasOutstandingIOU: chatReport.hasOutstandingIOU,
        },
    };

    const reportActionsFailureData = {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport.reportID}`,
        value: {
            [optimisticReportAction.reportActionID]: {
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
        optimisticChatReportData.onyxMethod = Onyx.METHOD.SET;
        optimisticIOUReportData.onyxMethod = Onyx.METHOD.SET;
        optimisticReportActionsData.onyxMethod = Onyx.METHOD.SET;

        // Then add and clear pending fields from the chat report
        optimisticChatReportData.value.pendingFields = {createChat: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD};
        chatReportSuccessData = {
            onyxMethod: Onyx.METHOD.MERGE,
            key: optimisticChatReportData.key,
            value: {
                pendingFields: null,
                errorFields: null,
            },
        };
        chatReportFailureData.value.pendingFields = {createChat: null};
        delete chatReportFailureData.value.hasOutstandingIOU;
        chatReportFailureData.value.errorFields = {
            createChat: {
                [DateUtils.getMicroseconds()]: Localize.translateLocal('report.genericCreateReportFailureMessage'),
            },
        };

        // Then add an optimistic created action
        optimisticReportActionsData.value[optimisticCreatedAction.reportActionID] = optimisticCreatedAction;
        reportActionsSuccessData.value[optimisticCreatedAction.reportActionID] = {pendingAction: null};

        // Failure data should feature red brick road
        reportActionsFailureData.value[optimisticCreatedAction.reportActionID] = {pendingAction: null};
        reportActionsFailureData.value[optimisticReportAction.reportActionID] = {pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD};
    }

    const optimisticData = [optimisticChatReportData, optimisticIOUReportData, optimisticReportActionsData, optimisticTransactionData];

    const successData = [reportActionsSuccessData, transactionSuccessData];
    if (!_.isEmpty(chatReportSuccessData)) {
        successData.push(chatReportSuccessData);
    }

    const failureData = [chatReportFailureData, reportActionsFailureData, transactionFailureData];

    const parsedComment = ReportUtils.getParsedComment(comment);
    API.write(
        'RequestMoney',
        {
            debtorEmail: payerEmail,
            amount,
            currency,
            comment: parsedComment,
            iouReportID: moneyRequestReport.reportID,
            chatReportID: chatReport.reportID,
            transactionID: optimisticTransaction.transactionID,
            reportActionID: optimisticReportAction.reportActionID,
            createdReportActionID: isNewChat ? optimisticCreatedAction.reportActionID : 0,
        },
        {optimisticData, successData, failureData},
    );
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
 * @param {Number} amount - always in the smallest unit of the currency
 * @param {String} comment
 * @param {String} currency
 * @param {String} existingGroupChatReportID
 *
 * @return {Object}
 */
function createSplitsAndOnyxData(participants, currentUserLogin, amount, comment, currency, existingGroupChatReportID = '') {
    const currentUserEmail = OptionsListUtils.addSMSDomainIfPhoneNumber(currentUserLogin);
    const participantLogins = _.map(participants, (participant) => OptionsListUtils.addSMSDomainIfPhoneNumber(participant.login).toLowerCase());
    const existingGroupChatReport = existingGroupChatReportID
        ? chatReports[`${ONYXKEYS.COLLECTION.REPORT}${existingGroupChatReportID}`]
        : ReportUtils.getChatByParticipants(participantLogins);
    const groupChatReport = existingGroupChatReport || ReportUtils.buildOptimisticChatReport(participantLogins);

    // ReportID is -2 (aka "deleted") on the group transaction: https://github.com/Expensify/Auth/blob/3fa2698654cd4fbc30f9de38acfca3fbeb7842e4/auth/command/SplitTransaction.cpp#L24-L27
    const formattedParticipants = Localize.arrayToString([currentUserLogin, ..._.map(participants, (participant) => participant.login)]);
    const groupTransaction = TransactionUtils.buildOptimisticTransaction(
        amount,
        currency,
        CONST.REPORT.SPLIT_REPORTID,
        comment,
        '',
        '',
        `${Localize.translateLocal('iou.splitBill')} ${Localize.translateLocal('common.with')} ${formattedParticipants} [${DateUtils.getDBTime().slice(0, 10)}]`,
    );

    // Note: The created action must be optimistically generated before the IOU action so there's no chance that the created action appears after the IOU action in the chat
    const groupCreatedReportAction = ReportUtils.buildOptimisticCreatedReportAction(currentUserEmail);
    const groupIOUReportAction = ReportUtils.buildOptimisticIOUReportAction(CONST.IOU.REPORT_ACTION_TYPE.SPLIT, amount, currency, comment, participants, groupTransaction.transactionID);

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
            onyxMethod: existingGroupChatReport ? Onyx.METHOD.MERGE : Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT}${groupChatReport.reportID}`,
            value: groupChatReport,
        },
        {
            onyxMethod: existingGroupChatReport ? Onyx.METHOD.MERGE : Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${groupChatReport.reportID}`,
            value: {
                ...(existingGroupChatReport ? {} : {[groupCreatedReportAction.reportActionID]: groupCreatedReportAction}),
                [groupIOUReportAction.reportActionID]: groupIOUReportAction,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${groupTransaction.transactionID}`,
            value: groupTransaction,
        },
    ];

    const successData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${groupChatReport.reportID}`,
            value: {
                ...(existingGroupChatReport ? {} : {[groupCreatedReportAction.reportActionID]: {pendingAction: null}}),
                [groupIOUReportAction.reportActionID]: {pendingAction: null},
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${groupTransaction.transactionID}`,
            value: {pendingAction: null},
        },
    ];

    if (!existingGroupChatReport) {
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${groupChatReport.reportID}`,
            value: {pendingFields: {createChat: null}},
        });
    }

    const failureData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${groupChatReport.reportID}`,
            value: {
                [groupIOUReportAction.reportActionID]: {
                    errors: {
                        [DateUtils.getMicroseconds()]: Localize.translateLocal('iou.error.genericCreateFailureMessage'),
                    },
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${groupTransaction.transactionID}`,
            value: {
                errors: {
                    [DateUtils.getMicroseconds()]: Localize.translateLocal('iou.error.genericCreateFailureMessage'),
                },
            },
        },
    ];

    if (!existingGroupChatReport) {
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${groupChatReport.reportID}`,
            value: {
                errorFields: {
                    createChat: {
                        [DateUtils.getMicroseconds()]: Localize.translateLocal('report.genericCreateReportFailureMessage'),
                    },
                },
            },
        });
    }

    // Loop through participants creating individual chats, iouReports and reportActionIDs as needed
    const splitAmount = IOUUtils.calculateAmount(participants, amount, false);
    const splits = [{email: currentUserEmail, amount: IOUUtils.calculateAmount(participants, amount, true)}];

    const hasMultipleParticipants = participants.length > 1;
    _.each(participants, (participant) => {
        const email = OptionsListUtils.addSMSDomainIfPhoneNumber(participant.login).toLowerCase();
        if (email === currentUserEmail) {
            return;
        }

        // If we only have one participant and the request was initiated from the global create menu, i.e. !existingGroupChatReportID, the oneOnOneChatReport is the groupChatReport
        const existingOneOnOneChatReport = !hasMultipleParticipants && !existingGroupChatReportID ? groupChatReport : ReportUtils.getChatByParticipants([email]);
        const oneOnOneChatReport = existingOneOnOneChatReport || ReportUtils.buildOptimisticChatReport([email]);
        let oneOnOneIOUReport;
        let existingIOUReport = null;
        if (oneOnOneChatReport.iouReportID) {
            existingIOUReport = iouReports[`${ONYXKEYS.COLLECTION.REPORT}${oneOnOneChatReport.iouReportID}`];
            oneOnOneIOUReport = IOUUtils.updateIOUOwnerAndTotal(existingIOUReport, currentUserEmail, splitAmount, currency);
            oneOnOneChatReport.hasOutstandingIOU = oneOnOneIOUReport.total !== 0;
        } else {
            oneOnOneIOUReport = ReportUtils.buildOptimisticIOUReport(currentUserEmail, email, splitAmount, oneOnOneChatReport.reportID, currency);
            oneOnOneChatReport.hasOutstandingIOU = true;
            oneOnOneChatReport.iouReportID = oneOnOneIOUReport.reportID;
        }

        const oneOnOneTransaction = TransactionUtils.buildOptimisticTransaction(
            splitAmount,
            currency,
            oneOnOneIOUReport.reportID,
            comment,
            CONST.IOU.MONEY_REQUEST_TYPE.SPLIT,
            groupTransaction.transactionID,
        );

        // Note: The created action must be optimistically generated before the IOU action so there's no chance that the created action appears after the IOU action in the chat
        const oneOnOneCreatedReportAction = ReportUtils.buildOptimisticCreatedReportAction(currentUserEmail);
        const oneOnOneIOUReportAction = ReportUtils.buildOptimisticIOUReportAction(
            CONST.IOU.REPORT_ACTION_TYPE.CREATE,
            splitAmount,
            currency,
            comment,
            [participant],
            oneOnOneTransaction.transactionID,
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
                onyxMethod: existingOneOnOneChatReport ? Onyx.METHOD.MERGE : Onyx.METHOD.SET,
                key: `${ONYXKEYS.COLLECTION.REPORT}${oneOnOneChatReport.reportID}`,
                value: oneOnOneChatReport,
            },
            {
                onyxMethod: existingOneOnOneChatReport ? Onyx.METHOD.MERGE : Onyx.METHOD.SET,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${oneOnOneChatReport.reportID}`,
                value: {
                    ...(existingOneOnOneChatReport ? {} : {[oneOnOneCreatedReportAction.reportActionID]: oneOnOneCreatedReportAction}),
                    [oneOnOneIOUReportAction.reportActionID]: oneOnOneIOUReportAction,
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.TRANSACTION}${oneOnOneTransaction.transactionID}`,
                value: oneOnOneTransaction,
            },
        );

        successData.push(
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${oneOnOneChatReport.reportID}`,
                value: {
                    ...(existingOneOnOneChatReport ? {} : {[oneOnOneCreatedReportAction.reportActionID]: {pendingAction: null}}),
                    [oneOnOneIOUReportAction.reportActionID]: {pendingAction: null},
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.TRANSACTION}${oneOnOneTransaction.transactionID}`,
                value: {pendingAction: null},
            },
        );

        if (!existingOneOnOneChatReport) {
            successData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${oneOnOneChatReport.reportID}`,
                value: {pendingFields: {createChat: null}},
            });
        }

        failureData.push(
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${oneOnOneChatReport.reportID}`,
                value: {
                    [oneOnOneIOUReportAction.reportActionID]: {
                        errors: {
                            [DateUtils.getMicroseconds()]: Localize.translateLocal('iou.error.genericCreateFailureMessage'),
                        },
                    },
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.TRANSACTION}${oneOnOneTransaction.transactionID}`,
                value: {
                    errors: {
                        [DateUtils.getMicroseconds()]: Localize.translateLocal('iou.error.genericCreateFailureMessage'),
                    },
                },
            },
        );

        if (!existingOneOnOneChatReport) {
            failureData.push({
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${oneOnOneChatReport.reportID}`,
                value: {
                    hasOutstandingIOU: existingOneOnOneChatReport ? existingOneOnOneChatReport.hasOutstandingIOU : false,
                    iouReportID: existingOneOnOneChatReport ? existingOneOnOneChatReport.iouReportID : null,
                    errorFields: {
                        createChat: {
                            [DateUtils.getMicroseconds()]: Localize.translateLocal('report.genericCreateReportFailureMessage'),
                        },
                    },
                },
            });
        }

        // Regardless of the number of participants, we always want to push the iouReport update to onyxData
        optimisticData.push({
            // We want to use set in case we are creating the the optimistic chat.
            // If we have multiple participants selected, we need to check if the 1:1 chat between the users already exists
            // If we have only one other participant, the group chat is the 1:1 chat and we need to check if that already exists
            onyxMethod: (hasMultipleParticipants && existingOneOnOneChatReport) || (!hasMultipleParticipants && existingGroupChatReport) ? Onyx.METHOD.MERGE : Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT}${oneOnOneIOUReport.reportID}`,
            value: oneOnOneIOUReport,
        });

        failureData.push({
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT}${oneOnOneIOUReport.reportID}`,
            value: existingIOUReport || oneOnOneIOUReport,
        });

        const splitData = {
            email,
            amount: splitAmount,
            iouReportID: oneOnOneIOUReport.reportID,
            chatReportID: oneOnOneChatReport.reportID,
            transactionID: oneOnOneTransaction.transactionID,
            reportActionID: oneOnOneIOUReportAction.reportActionID,
        };

        if (!_.isEmpty(oneOnOneCreatedReportAction)) {
            splitData.createdReportActionID = oneOnOneCreatedReportAction.reportActionID;
        }

        splits.push(splitData);
    });

    const groupData = {
        chatReportID: groupChatReport.reportID,
        transactionID: groupTransaction.transactionID,
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
 * @param {Number} amount - always in smallest currency unit
 * @param {String} comment
 * @param {String} currency
 * @param {String} existingGroupChatReportID
 */
function splitBill(participants, currentUserLogin, amount, comment, currency, existingGroupChatReportID = '') {
    const {groupData, splits, onyxData} = createSplitsAndOnyxData(participants, currentUserLogin, amount, comment, currency, existingGroupChatReportID);
    const parsedComment = ReportUtils.getParsedComment(comment);

    API.write(
        'SplitBill',
        {
            reportID: groupData.chatReportID,
            amount,
            splits: JSON.stringify(splits),
            currency,
            comment: parsedComment,
            transactionID: groupData.transactionID,
            reportActionID: groupData.reportActionID,
            createdReportActionID: groupData.createdReportActionID,
        },
        onyxData,
    );

    Navigation.dismissModal();
}

/**
 * @param {Array} participants
 * @param {String} currentUserLogin
 * @param {Number} amount - always in smallest currency unit
 * @param {String} comment
 * @param {String} currency
 */
function splitBillAndOpenReport(participants, currentUserLogin, amount, comment, currency) {
    const {groupData, splits, onyxData} = createSplitsAndOnyxData(participants, currentUserLogin, amount, comment, currency);
    const parsedComment = ReportUtils.getParsedComment(comment);

    API.write(
        'SplitBillAndOpenReport',
        {
            reportID: groupData.chatReportID,
            amount,
            splits: JSON.stringify(splits),
            currency,
            comment: parsedComment,
            transactionID: groupData.transactionID,
            reportActionID: groupData.reportActionID,
            createdReportActionID: groupData.createdReportActionID,
        },
        onyxData,
    );

    Navigation.navigate(ROUTES.getReportRoute(groupData.chatReportID));
}

/**
 * @param {String} chatReportID
 * @param {String} iouReportID
 * @param {Object} moneyRequestAction - the money request reportAction we are deleting
 * @param {Boolean} shouldCloseOnDelete
 */
function deleteMoneyRequest(chatReportID, iouReportID, moneyRequestAction, shouldCloseOnDelete) {
    const iouReport = iouReports[`${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`];
    const transactionID = moneyRequestAction.originalMessage.IOUTransactionID;

    // Make a copy of the chat report so we don't mutate the original one when updating its values
    const chatReport = {...chatReports[`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`]};

    // Get the amount we are deleting
    const amount = moneyRequestAction.originalMessage.amount;
    const optimisticReportAction = ReportUtils.buildOptimisticIOUReportAction(
        CONST.IOU.REPORT_ACTION_TYPE.DELETE,
        amount,
        moneyRequestAction.originalMessage.currency,
        Str.htmlDecode(moneyRequestAction.originalMessage.comment),
        [],
        transactionID,
        '',
        iouReportID,
    );

    const currentUserEmail = optimisticReportAction.actorEmail;
    const updatedIOUReport = IOUUtils.updateIOUOwnerAndTotal(iouReport, currentUserEmail, amount, moneyRequestAction.originalMessage.currency, CONST.IOU.REPORT_ACTION_TYPE.DELETE);
    chatReport.lastMessageText = optimisticReportAction.message[0].text;
    chatReport.lastMessageHtml = optimisticReportAction.message[0].html;
    chatReport.hasOutstandingIOU = updatedIOUReport.total !== 0;

    const optimisticData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReportID}`,
            value: {
                [optimisticReportAction.reportActionID]: {
                    ...optimisticReportAction,
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`,
            value: chatReport,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`,
            value: updatedIOUReport,
        },
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: null,
        },
    ];
    const successData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
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
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReportID}`,
            value: {
                [optimisticReportAction.reportActionID]: {
                    errors: {
                        [DateUtils.getMicroseconds()]: Localize.translateLocal('iou.error.genericDeleteFailureMessage'),
                    },
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`,
            value: {
                lastMessageText: chatReports[`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`].lastMessageText,
                lastMessageHtml: chatReports[`${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`].lastMessageHtml,
                hasOutstandingIOU: iouReport.total !== 0,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${iouReportID}`,
            value: iouReport,
        },
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: transactions[transactionID],
        },
    ];

    API.write(
        'DeleteMoneyRequest',
        {
            transactionID,
            chatReportID,
            reportActionID: optimisticReportAction.reportActionID,
            iouReportID: updatedIOUReport.reportID,
        },
        {optimisticData, successData, failureData},
    );

    if (shouldCloseOnDelete) {
        Navigation.navigate(ROUTES.getReportRoute(chatReportID));
    }
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
 * Sets Money Request description
 *
 * @param {String} comment
 */
function setMoneyRequestDescription(comment) {
    Onyx.merge(ONYXKEYS.IOU, {comment: comment.trim()});
}

/**
 * @param {Number} amount
 * @param {String} submitterPayPalMeAddress
 * @param {String} currency
 * @returns {String}
 */
function buildPayPalPaymentUrl(amount, submitterPayPalMeAddress, currency) {
    return `https://paypal.me/${submitterPayPalMeAddress}/${amount / 100}${currency}`;
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
    const optimisticIOUReport = ReportUtils.buildOptimisticIOUReport(recipientEmail, managerEmail, amount, chatReport.reportID, currency, true);

    const optimisticTransaction = TransactionUtils.buildOptimisticTransaction(amount * 100, currency, optimisticIOUReport.reportID, comment);
    const optimisticTransactionData = {
        onyxMethod: Onyx.METHOD.SET,
        key: `${ONYXKEYS.COLLECTION.TRANSACTION}${optimisticTransaction.transactionID}`,
        value: optimisticTransaction,
    };

    // Note: The created action must be optimistically generated before the IOU action so there's no chance that the created action appears after the IOU action in the chat
    const optimisticCreatedAction = ReportUtils.buildOptimisticCreatedReportAction(recipientEmail);
    const optimisticIOUReportAction = ReportUtils.buildOptimisticIOUReportAction(
        CONST.IOU.REPORT_ACTION_TYPE.PAY,
        amount,
        currency,
        comment,
        [recipient],
        optimisticTransaction.transactionID,
        paymentMethodType,
        optimisticIOUReport.reportID,
    );

    // First, add data that will be used in all cases
    const optimisticChatReportData = {
        onyxMethod: Onyx.METHOD.MERGE,
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
        onyxMethod: Onyx.METHOD.SET,
        key: `${ONYXKEYS.COLLECTION.REPORT}${optimisticIOUReport.reportID}`,
        value: optimisticIOUReport,
    };
    const optimisticReportActionsData = {
        onyxMethod: Onyx.METHOD.MERGE,
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
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport.reportID}`,
            value: {
                [optimisticIOUReportAction.reportActionID]: {
                    pendingAction: null,
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${optimisticTransaction.transactionID}`,
            value: {pendingAction: null},
        },
    ];

    const failureData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport.reportID}`,
            value: {
                [optimisticIOUReportAction.reportActionID]: {
                    errors: {
                        [DateUtils.getMicroseconds()]: Localize.translateLocal('iou.error.other'),
                    },
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${optimisticTransaction.transactionID}`,
            value: {
                pendingAction: null,
                errors: {
                    [DateUtils.getMicroseconds()]: Localize.translateLocal('iou.error.other'),
                },
            },
        },
    ];

    // Now, let's add the data we need just when we are creating a new chat report
    if (isNewChat) {
        // Change the method to set for new reports because it doesn't exist yet, is faster,
        // and we need the data to be available when we navigate to the chat page
        optimisticChatReportData.onyxMethod = Onyx.METHOD.SET;
        optimisticReportActionsData.onyxMethod = Onyx.METHOD.SET;
        optimisticIOUReportData.onyxMethod = Onyx.METHOD.SET;

        // Set and clear pending fields on the chat report
        optimisticChatReportData.value.pendingFields = {createChat: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD};
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: optimisticChatReportData.key,
            value: {pendingFields: null},
        });
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: optimisticChatReportData.key,
            value: {
                errorFields: {
                    createChat: {
                        [DateUtils.getMicroseconds()]: Localize.translateLocal('report.genericCreateReportFailureMessage'),
                    },
                },
            },
        });

        // Add an optimistic created action to the optimistic reportActions data
        optimisticReportActionsData.value[optimisticCreatedAction.reportActionID] = optimisticCreatedAction;

        // If we're going to fail to create the report itself, let's not have redundant error messages for the IOU
        failureData[0].value[optimisticIOUReportAction.reportActionID] = {pendingAction: null};
    }

    const optimisticData = [optimisticChatReportData, optimisticIOUReportData, optimisticReportActionsData, optimisticTransactionData];

    return {
        params: {
            iouReportID: optimisticIOUReport.reportID,
            chatReportID: chatReport.reportID,
            reportActionID: optimisticIOUReportAction.reportActionID,
            paymentMethodType,
            transactionID: optimisticTransaction.transactionID,
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
    const optimisticTransaction = TransactionUtils.buildOptimisticTransaction(iouReport.total, iouReport.currency, iouReport.reportID);
    const optimisticIOUReportAction = ReportUtils.buildOptimisticIOUReportAction(
        CONST.IOU.REPORT_ACTION_TYPE.PAY,
        iouReport.total,
        iouReport.currency,
        '',
        [recipient],
        optimisticTransaction.transactionID,
        paymentMethodType,
        iouReport.reportID,
        true,
    );

    const optimisticData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
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
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport.reportID}`,
            value: {
                [optimisticIOUReportAction.reportActionID]: {
                    ...optimisticIOUReportAction,
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport.reportID}`,
            value: {
                ...iouReport,
                hasOutstandingIOU: false,
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            },
        },
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${optimisticTransaction.transactionID}`,
            value: optimisticTransaction,
        },
    ];

    const successData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport.reportID}`,
            value: {
                [optimisticIOUReportAction.reportActionID]: {
                    pendingAction: null,
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${optimisticTransaction.transactionID}`,
            value: {
                pendingAction: null,
            },
        },
    ];

    const failureData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
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
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${optimisticTransaction.transactionID}`,
            value: {
                pendingAction: null,
                errors: {
                    [DateUtils.getMicroseconds()]: Localize.translateLocal('iou.error.genericCreateFailureMessage'),
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
    const {params, optimisticData, successData, failureData} = getSendMoneyParams(report, amount, currency, comment, CONST.IOU.PAYMENT_TYPE.ELSEWHERE, managerEmail, recipient);

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
    const {params, optimisticData, successData, failureData} = getSendMoneyParams(report, amount, currency, comment, CONST.IOU.PAYMENT_TYPE.EXPENSIFY, managerEmail, recipient);

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
    const {params, optimisticData, successData, failureData} = getSendMoneyParams(report, amount, currency, comment, CONST.IOU.PAYMENT_TYPE.PAYPAL_ME, managerEmail, recipient);

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
    const {params, optimisticData, successData, failureData} = getPayMoneyRequestParams(chatReport, iouReport, recipient, CONST.IOU.PAYMENT_TYPE.ELSEWHERE);

    API.write('PayMoneyRequestElsewhere', params, {optimisticData, successData, failureData});

    Navigation.navigate(ROUTES.getReportRoute(chatReport.reportID));
}

/**
 * @param {Object} chatReport
 * @param {Object} iouReport
 * @param {Object} recipient
 */
function payMoneyRequestWithWallet(chatReport, iouReport, recipient) {
    const {params, optimisticData, successData, failureData} = getPayMoneyRequestParams(chatReport, iouReport, recipient, CONST.IOU.PAYMENT_TYPE.EXPENSIFY);

    API.write('PayMoneyRequestWithWallet', params, {optimisticData, successData, failureData});

    Navigation.navigate(ROUTES.getReportRoute(chatReport.reportID));
}

/**
 * @param {Object} chatReport
 * @param {Object} iouReport
 * @param {Object} recipient
 */
function payMoneyRequestViaPaypal(chatReport, iouReport, recipient) {
    const {params, optimisticData, successData, failureData} = getPayMoneyRequestParams(chatReport, iouReport, recipient, CONST.IOU.PAYMENT_TYPE.PAYPAL_ME);

    API.write('PayMoneyRequestViaPaypal', params, {optimisticData, successData, failureData});

    Navigation.navigate(ROUTES.getReportRoute(chatReport.reportID));

    asyncOpenURL(Promise.resolve(), buildPayPalPaymentUrl(iouReport.total, recipient.payPalMeAddress, iouReport.currency));
}

export {
    deleteMoneyRequest,
    splitBill,
    splitBillAndOpenReport,
    requestMoney,
    sendMoneyElsewhere,
    sendMoneyViaPaypal,
    payMoneyRequestElsewhere,
    payMoneyRequestViaPaypal,
    setIOUSelectedCurrency,
    setMoneyRequestDescription,
    sendMoneyWithWallet,
    payMoneyRequestWithWallet,
};
