import Onyx from 'react-native-onyx';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import Str from 'expensify-common/lib/str';
import moment from 'moment';
import CONST from '../../CONST';
import ROUTES from '../../ROUTES';
import ONYXKEYS from '../../ONYXKEYS';
import Navigation from '../Navigation/Navigation';
import * as Localize from '../Localize';
import asyncOpenURL from '../asyncOpenURL';
import * as API from '../API';
import * as ReportUtils from '../ReportUtils';
import * as CurrencyUtils from '../CurrencyUtils';
import * as ReportActionsUtils from '../ReportActionsUtils';
import * as IOUUtils from '../IOUUtils';
import * as OptionsListUtils from '../OptionsListUtils';
import DateUtils from '../DateUtils';
import * as TransactionUtils from '../TransactionUtils';
import * as ErrorUtils from '../ErrorUtils';
import * as UserUtils from '../UserUtils';
import * as Report from './Report';
import * as NumberUtils from '../NumberUtils';

let allReports;
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT,
    waitForCollectionCallback: true,
    callback: (val) => (allReports = val),
});

let allTransactions;
Onyx.connect({
    key: ONYXKEYS.COLLECTION.TRANSACTION,
    waitForCollectionCallback: true,
    callback: (val) => {
        if (!val) {
            allTransactions = {};
            return;
        }

        allTransactions = val;
    },
});

let userAccountID = '';
Onyx.connect({
    key: ONYXKEYS.SESSION,
    callback: (val) => {
        userAccountID = lodashGet(val, 'accountID', '');
    },
});

let currentUserPersonalDetails = {};
Onyx.connect({
    key: ONYXKEYS.PERSONAL_DETAILS_LIST,
    callback: (val) => {
        currentUserPersonalDetails = lodashGet(val, userAccountID, {});
    },
});

let currentDate = '';
Onyx.connect({
    key: ONYXKEYS.CURRENT_DATE,
    callback: (val) => {
        currentDate = val;
    },
});

/**
 * Reset money request info from the store with its initial value
 * @param {String} id
 */
function resetMoneyRequestInfo(id = '') {
    const date = currentDate || moment().format('YYYY-MM-DD');
    Onyx.merge(ONYXKEYS.IOU, {
        id,
        amount: 0,
        currency: lodashGet(currentUserPersonalDetails, 'localCurrencyCode', CONST.CURRENCY.USD),
        comment: '',
        participants: [],
        merchant: '',
        date,
        receiptPath: '',
        receiptSource: '',
    });
}

function buildOnyxDataForMoneyRequest(
    chatReport,
    iouReport,
    transaction,
    chatCreatedAction,
    iouCreatedAction,
    iouAction,
    optimisticPersonalDetailListAction,
    reportPreviewAction,
    isNewChatReport,
    isNewIOUReport,
) {
    const optimisticData = [
        {
            // Use SET for new reports because it doesn't exist yet, is faster and we need the data to be available when we navigate to the chat page
            onyxMethod: isNewChatReport ? Onyx.METHOD.SET : Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`,
            value: {
                ...chatReport,
                lastReadTime: DateUtils.getDBTime(),
                hasOutstandingIOU: iouReport.total !== 0,
                iouReportID: iouReport.reportID,
                ...(isNewChatReport ? {pendingFields: {createChat: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD}} : {}),
            },
        },
        {
            onyxMethod: isNewIOUReport ? Onyx.METHOD.SET : Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport.reportID}`,
            value: {
                ...iouReport,
                lastMessageText: iouAction.message[0].text,
                lastMessageHtml: iouAction.message[0].html,
                ...(isNewIOUReport ? {pendingFields: {createChat: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD}} : {}),
            },
        },
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`,
            value: transaction,
        },
        {
            onyxMethod: isNewChatReport ? Onyx.METHOD.SET : Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport.reportID}`,
            value: {
                ...(isNewChatReport ? {[chatCreatedAction.reportActionID]: chatCreatedAction} : {}),
                [reportPreviewAction.reportActionID]: reportPreviewAction,
            },
        },
        {
            onyxMethod: isNewIOUReport ? Onyx.METHOD.SET : Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport.reportID}`,
            value: {
                ...(isNewIOUReport ? {[iouCreatedAction.reportActionID]: iouCreatedAction} : {}),
                [iouAction.reportActionID]: iouAction,
            },
        },
    ];

    if (!_.isEmpty(optimisticPersonalDetailListAction)) {
        optimisticData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
            value: optimisticPersonalDetailListAction,
        });
    }

    const successData = [
        ...(isNewChatReport
            ? [
                  {
                      onyxMethod: Onyx.METHOD.MERGE,
                      key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`,
                      value: {
                          pendingFields: null,
                          errorFields: null,
                      },
                  },
              ]
            : []),
        ...(isNewIOUReport
            ? [
                  {
                      onyxMethod: Onyx.METHOD.MERGE,
                      key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport.reportID}`,
                      value: {
                          pendingFields: null,
                          errorFields: null,
                      },
                  },
              ]
            : []),
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`,
            value: {pendingAction: null},
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport.reportID}`,
            value: {
                ...(isNewChatReport
                    ? {
                          [chatCreatedAction.reportActionID]: {
                              pendingAction: null,
                              errors: null,
                          },
                      }
                    : {}),
                [reportPreviewAction.reportActionID]: {
                    pendingAction: null,
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport.reportID}`,
            value: {
                ...(isNewIOUReport
                    ? {
                          [iouCreatedAction.reportActionID]: {
                              pendingAction: null,
                              errors: null,
                          },
                      }
                    : {}),
                [iouAction.reportActionID]: {
                    pendingAction: null,
                    errors: null,
                },
            },
        },
    ];

    const failureData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`,
            value: {
                hasOutstandingIOU: chatReport.hasOutstandingIOU,
                iouReportID: chatReport.iouReportID,
                lastReadTime: chatReport.lastReadTime,
                ...(isNewChatReport
                    ? {
                          errorFields: {
                              createChat: ErrorUtils.getMicroSecondOnyxError('report.genericCreateReportFailureMessage'),
                          },
                      }
                    : {}),
            },
        },
        ...(isNewIOUReport
            ? [
                  {
                      onyxMethod: Onyx.METHOD.MERGE,
                      key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport.reportID}`,
                      value: {
                          errorFields: {
                              createChat: ErrorUtils.getMicroSecondOnyxError('report.genericCreateReportFailureMessage'),
                          },
                      },
                  },
              ]
            : []),
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transaction.transactionID}`,
            value: {
                errors: ErrorUtils.getMicroSecondOnyxError('iou.error.genericCreateFailureMessage'),
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport.reportID}`,
            value: {
                ...(isNewChatReport
                    ? {
                          [chatCreatedAction.reportActionID]: {
                              errors: ErrorUtils.getMicroSecondOnyxError('iou.error.genericCreateFailureMessage'),
                          },
                          [reportPreviewAction.reportActionID]: {
                              errors: ErrorUtils.getMicroSecondOnyxError(null),
                          },
                      }
                    : {
                          [reportPreviewAction.reportActionID]: {
                              created: reportPreviewAction.created,
                          },
                      }),
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport.reportID}`,
            value: {
                ...(isNewIOUReport
                    ? {
                          [iouCreatedAction.reportActionID]: {
                              errors: ErrorUtils.getMicroSecondOnyxError('iou.error.genericCreateFailureMessage'),
                          },
                          [iouAction.reportActionID]: {
                              errors: ErrorUtils.getMicroSecondOnyxError(null),
                          },
                      }
                    : {
                          [iouAction.reportActionID]: {
                              errors: ErrorUtils.getMicroSecondOnyxError('iou.error.genericCreateFailureMessage'),
                          },
                      }),
            },
        },
    ];

    return [optimisticData, successData, failureData];
}

/**
 * Gathers all the data needed to make a money request. It attempts to find existing reports, iouReports, and receipts. If it doesn't find them, then
 * it creates optimistic versions of them and uses those instead
 *
 * @param {Object} report
 * @param {Object} participant
 * @param {String} comment
 * @param {Number} amount
 * @param {String} currency
 * @param {Number} payeeAccountID
 * @param {String} payeeEmail
 * @param {Object} [receipt]
 * @returns {Object} data
 * @returns {String} data.payerEmail
 * @returns {Object} data.iouReport
 * @returns {Object} data.chatReport
 * @returns {Object} data.transaction
 * @returns {Object} data.iouAction
 * @returns {Object} data.createdChatReportActionID
 * @returns {Object} data.createdIOUReportActionID
 * @returns {Object} data.reportPreviewAction
 * @returns {Object} data.onyxData
 * @returns {Object} data.onyxData.optimisticData
 * @returns {Object} data.onyxData.successData
 * @returns {Object} data.onyxData.failureData
 * @param {String} [existingTransactionID]
 */
function getMoneyRequestInformation(report, participant, comment, amount, currency, payeeAccountID, payeeEmail, receipt = undefined, existingTransactionID = null) {
    const payerEmail = OptionsListUtils.addSMSDomainIfPhoneNumber(participant.login);
    const payerAccountID = Number(participant.accountID);
    const isPolicyExpenseChat = participant.isPolicyExpenseChat;

    // STEP 1: Get existing chat report OR build a new optimistic one
    let isNewChatReport = false;
    let chatReport = lodashGet(report, 'reportID', null) ? report : null;

    // If this is a policyExpenseChat, the chatReport must exist and we can get it from Onyx.
    // report is null if the flow is initiated from the global create menu. However, participant always stores the reportID if it exists, which is the case for policyExpenseChats
    if (!chatReport && isPolicyExpenseChat) {
        chatReport = allReports[`${ONYXKEYS.COLLECTION.REPORT}${participant.reportID}`];
    }

    if (!chatReport) {
        chatReport = ReportUtils.getChatByParticipants([payerAccountID]);
    }

    // If we still don't have a report, it likely doens't exist and we need to build an optimistic one
    if (!chatReport) {
        isNewChatReport = true;
        chatReport = ReportUtils.buildOptimisticChatReport([payerAccountID]);
    }

    // STEP 2: Get existing IOU report and update its total OR build a new optimistic one
    const isNewIOUReport = !chatReport.iouReportID || ReportUtils.hasIOUWaitingOnCurrentUserBankAccount(chatReport);
    let iouReport = isNewIOUReport ? null : allReports[`${ONYXKEYS.COLLECTION.REPORT}${chatReport.iouReportID}`];

    if (iouReport) {
        if (isPolicyExpenseChat) {
            iouReport = {...iouReport};

            // Because of the Expense reports are stored as negative values, we substract the total from the amount
            iouReport.total -= amount;
        } else {
            iouReport = IOUUtils.updateIOUOwnerAndTotal(iouReport, payeeAccountID, amount, currency);
        }
    } else {
        iouReport = isPolicyExpenseChat
            ? ReportUtils.buildOptimisticExpenseReport(chatReport.reportID, chatReport.policyID, payeeAccountID, amount, currency)
            : ReportUtils.buildOptimisticIOUReport(payeeAccountID, payerAccountID, amount, chatReport.reportID, currency);
    }

    // STEP 3: Build optimistic receipt and transaction
    const receiptObject = {};
    if (receipt && receipt.source) {
        receiptObject.source = receipt.source;
        receiptObject.state = CONST.IOU.RECEIPT_STATE.SCANREADY;
    }
    let optimisticTransaction = TransactionUtils.buildOptimisticTransaction(
        ReportUtils.isExpenseReport(iouReport) ? -amount : amount,
        currency,
        iouReport.reportID,
        comment,
        '',
        '',
        undefined,
        receiptObject,
        existingTransactionID,
    );

    // If there is an existing transaction (which is the case for distance requests), then the data from the existing transaction
    // needs to be manually merged into the optimistic transaction. This is because buildOnyxDataForMoneyRequest() uses `Onyx.set()` for the transaction
    // data. This is a big can of worms to change it to `Onyx.merge()` as explored in https://expensify.slack.com/archives/C05DWUDHVK7/p1692139468252109.
    // I want to clean this up at some point, but it's possible this will live in the code for a while so I've created https://github.com/Expensify/App/issues/25417
    // to remind me to do this.
    const existingTransaction = existingTransactionID && TransactionUtils.getTransaction(existingTransactionID);
    if (existingTransaction) {
        optimisticTransaction = {
            ...optimisticTransaction,
            ...existingTransaction,
        };
    }

    // STEP 4: Build optimistic reportActions. We need:
    // 1. CREATED action for the chatReport
    // 2. CREATED action for the iouReport
    // 3. IOU action for the iouReport
    // 4. REPORTPREVIEW action for the chatReport
    // Note: The CREATED action for the IOU report must be optimistically generated before the IOU action so there's no chance that it appears after the IOU action in the chat
    const optimisticCreatedActionForChat = ReportUtils.buildOptimisticCreatedReportAction(payeeEmail);
    const optimisticCreatedActionForIOU = ReportUtils.buildOptimisticCreatedReportAction(payeeEmail);
    const iouAction = ReportUtils.buildOptimisticIOUReportAction(
        CONST.IOU.REPORT_ACTION_TYPE.CREATE,
        amount,
        currency,
        comment,
        [participant],
        optimisticTransaction.transactionID,
        '',
        iouReport.reportID,
        receiptObject,
    );

    let reportPreviewAction = isNewIOUReport ? null : ReportActionsUtils.getReportPreviewAction(chatReport.reportID, iouReport.reportID);
    if (reportPreviewAction) {
        reportPreviewAction = ReportUtils.updateReportPreview(iouReport, reportPreviewAction, comment);
    } else {
        reportPreviewAction = ReportUtils.buildOptimisticReportPreview(chatReport, iouReport, comment);
    }

    // Add optimistic personal details for participant
    const optimisticPersonalDetailListAction = isNewChatReport
        ? {
              [payerAccountID]: {
                  accountID: payerAccountID,
                  avatar: UserUtils.getDefaultAvatarURL(payerAccountID),
                  displayName: participant.displayName || payerEmail,
                  login: participant.login,
              },
          }
        : undefined;

    // STEP 5: Build Onyx Data
    const [optimisticData, successData, failureData] = buildOnyxDataForMoneyRequest(
        chatReport,
        iouReport,
        optimisticTransaction,
        optimisticCreatedActionForChat,
        optimisticCreatedActionForIOU,
        iouAction,
        optimisticPersonalDetailListAction,
        reportPreviewAction,
        isNewChatReport,
        isNewIOUReport,
    );

    return {
        payerEmail,
        iouReport,
        chatReport,
        transaction: optimisticTransaction,
        iouAction,
        createdChatReportActionID: isNewChatReport ? optimisticCreatedActionForChat.reportActionID : 0,
        createdIOUReportActionID: isNewIOUReport ? optimisticCreatedActionForIOU.reportActionID : 0,
        reportPreviewAction,
        onyxData: {
            optimisticData,
            successData,
            failureData,
        },
    };
}

/**
 * Requests money based on a distance (eg. mileage from a map)
 *
 * @param {Object} report
 * @param {String} payeeEmail
 * @param {Number} payeeAccountID
 * @param {Object} participant
 * @param {String} comment
 * @param {Object[]} waypoints
 * @param {String} waypoints[].address required and must be non empty
 * @param {String} [waypoints[].lat] optional
 * @param {String} [waypoints[].lng] optional
 * @param {String} created
 * @param {String} [transactionID]
 */
function createDistanceRequest(report, payeeEmail, payeeAccountID, participant, comment, waypoints, created, transactionID) {
    const {payerEmail, iouReport, chatReport, transaction, iouAction, createdChatReportActionID, createdIOUReportActionID, reportPreviewAction, onyxData} = getMoneyRequestInformation(
        report,
        participant,
        comment,
        0,
        'USD',
        payeeAccountID,
        payeeEmail,
        null,
        transactionID,
    );

    API.write(
        'CreateDistanceRequest',
        {
            debtorEmail: payerEmail,
            comment,
            iouReportID: iouReport.reportID,
            chatReportID: chatReport.reportID,
            transactionID: transaction.transactionID,
            reportActionID: iouAction.reportActionID,
            createdChatReportActionID,
            createdIOUReportActionID,
            reportPreviewReportActionID: reportPreviewAction.reportActionID,
            waypoints,
            created,
        },
        onyxData,
    );
}

/**
 * Request money from another user
 *
 * @param {Object} report
 * @param {Number} amount - always in the smallest unit of the currency
 * @param {String} currency
 * @param {String} payeeEmail
 * @param {Number} payeeAccountID
 * @param {Object} participant
 * @param {String} comment
 * @param {Object} [receipt]
 */
function requestMoney(report, amount, currency, payeeEmail, payeeAccountID, participant, comment, receipt = undefined) {
    const {payerEmail, iouReport, chatReport, transaction, iouAction, createdChatReportActionID, createdIOUReportActionID, reportPreviewAction, onyxData} = getMoneyRequestInformation(
        report,
        participant,
        comment,
        amount,
        currency,
        payeeAccountID,
        payeeEmail,
        receipt,
    );

    API.write(
        'RequestMoney',
        {
            debtorEmail: payerEmail,
            amount,
            currency,
            comment,
            iouReportID: iouReport.reportID,
            chatReportID: chatReport.reportID,
            transactionID: transaction.transactionID,
            reportActionID: iouAction.reportActionID,
            createdChatReportActionID,
            createdIOUReportActionID,
            reportPreviewReportActionID: reportPreviewAction.reportActionID,
            receipt,
        },
        onyxData,
    );
    resetMoneyRequestInfo();
    Navigation.dismissModal(chatReport.reportID);
    Report.notifyNewAction(chatReport.reportID, payeeAccountID);
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
 * @param {Number} currentUserAccountID
 * @param {Number} amount - always in the smallest unit of the currency
 * @param {String} comment
 * @param {String} currency
 * @param {String} existingSplitChatReportID - the report ID where the split bill happens, could be a group chat or a workspace chat
 *
 * @return {Object}
 */
function createSplitsAndOnyxData(participants, currentUserLogin, currentUserAccountID, amount, comment, currency, existingSplitChatReportID = '') {
    const currentUserEmail = OptionsListUtils.addSMSDomainIfPhoneNumber(currentUserLogin);
    const participantAccountIDs = _.map(participants, (participant) => Number(participant.accountID));
    const existingSplitChatReport = existingSplitChatReportID
        ? allReports[`${ONYXKEYS.COLLECTION.REPORT}${existingSplitChatReportID}`]
        : ReportUtils.getChatByParticipants(participantAccountIDs);
    const splitChatReport = existingSplitChatReport || ReportUtils.buildOptimisticChatReport(participantAccountIDs);
    const isOwnPolicyExpenseChat = splitChatReport.isOwnPolicyExpenseChat;

    // ReportID is -2 (aka "deleted") on the group transaction: https://github.com/Expensify/Auth/blob/3fa2698654cd4fbc30f9de38acfca3fbeb7842e4/auth/command/SplitTransaction.cpp#L24-L27
    const formattedParticipants = isOwnPolicyExpenseChat
        ? [currentUserLogin, ReportUtils.getReportName(splitChatReport)]
        : Localize.arrayToString([currentUserLogin, ..._.map(participants, (participant) => participant.login || '')]);

    const splitTransaction = TransactionUtils.buildOptimisticTransaction(
        amount,
        currency,
        CONST.REPORT.SPLIT_REPORTID,
        comment,
        '',
        '',
        `${Localize.translateLocal('iou.splitBill')} ${Localize.translateLocal('common.with')} ${formattedParticipants} [${DateUtils.getDBTime().slice(0, 10)}]`,
    );

    // Note: The created action must be optimistically generated before the IOU action so there's no chance that the created action appears after the IOU action in the chat
    const splitCreatedReportAction = ReportUtils.buildOptimisticCreatedReportAction(currentUserEmail);
    const splitIOUReportAction = ReportUtils.buildOptimisticIOUReportAction(
        CONST.IOU.REPORT_ACTION_TYPE.SPLIT,
        amount,
        currency,
        comment,
        participants,
        splitTransaction.transactionID,
        '',
        '',
        false,
        false,
        {},
        isOwnPolicyExpenseChat,
    );

    splitChatReport.lastReadTime = DateUtils.getDBTime();
    splitChatReport.lastMessageText = splitIOUReportAction.message[0].text;
    splitChatReport.lastMessageHtml = splitIOUReportAction.message[0].html;

    // If we have an existing groupChatReport use it's pending fields, otherwise indicate that we are adding a chat
    if (!existingSplitChatReport) {
        splitChatReport.pendingFields = {
            createChat: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        };
    }

    const optimisticData = [
        {
            // Use set for new reports because it doesn't exist yet, is faster,
            // and we need the data to be available when we navigate to the chat page
            onyxMethod: existingSplitChatReport ? Onyx.METHOD.MERGE : Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT}${splitChatReport.reportID}`,
            value: splitChatReport,
        },
        {
            onyxMethod: existingSplitChatReport ? Onyx.METHOD.MERGE : Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${splitChatReport.reportID}`,
            value: {
                ...(existingSplitChatReport ? {} : {[splitCreatedReportAction.reportActionID]: splitCreatedReportAction}),
                [splitIOUReportAction.reportActionID]: splitIOUReportAction,
            },
        },
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${splitTransaction.transactionID}`,
            value: splitTransaction,
        },
    ];

    const successData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${splitChatReport.reportID}`,
            value: {
                ...(existingSplitChatReport ? {} : {[splitCreatedReportAction.reportActionID]: {pendingAction: null}}),
                [splitIOUReportAction.reportActionID]: {pendingAction: null},
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${splitTransaction.transactionID}`,
            value: {pendingAction: null},
        },
    ];

    if (!existingSplitChatReport) {
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${splitChatReport.reportID}`,
            value: {pendingFields: {createChat: null}},
        });
    }

    const failureData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${splitTransaction.transactionID}`,
            value: {
                errors: ErrorUtils.getMicroSecondOnyxError('iou.error.genericCreateFailureMessage'),
            },
        },
    ];

    if (existingSplitChatReport) {
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${splitChatReport.reportID}`,
            value: {
                [splitIOUReportAction.reportActionID]: {
                    errors: ErrorUtils.getMicroSecondOnyxError('iou.error.genericCreateFailureMessage'),
                },
            },
        });
    } else {
        failureData.push(
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT}${splitChatReport.reportID}`,
                value: {
                    errorFields: {
                        createChat: ErrorUtils.getMicroSecondOnyxError('report.genericCreateReportFailureMessage'),
                    },
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${splitChatReport.reportID}`,
                value: {
                    [splitIOUReportAction.reportActionID]: {
                        errors: ErrorUtils.getMicroSecondOnyxError(null),
                    },
                },
            },
        );
    }

    // Loop through participants creating individual chats, iouReports and reportActionIDs as needed
    const splitAmount = IOUUtils.calculateAmount(participants.length, amount, currency, false);
    const splits = [{email: currentUserEmail, accountID: currentUserAccountID, amount: IOUUtils.calculateAmount(participants.length, amount, currency, true)}];

    const hasMultipleParticipants = participants.length > 1;
    _.each(participants, (participant) => {
        const email = isOwnPolicyExpenseChat ? '' : OptionsListUtils.addSMSDomainIfPhoneNumber(participant.login).toLowerCase();
        const accountID = isOwnPolicyExpenseChat ? 0 : Number(participant.accountID);
        if (email === currentUserEmail) {
            return;
        }

        // STEP 1: Get existing chat report OR build a new optimistic one
        // If we only have one participant and the request was initiated from the global create menu, i.e. !existingGroupChatReportID, the oneOnOneChatReport is the groupChatReport
        let oneOnOneChatReport;
        let isNewOneOnOneChatReport = false;
        let shouldCreateOptimisticPersonalDetails = false;

        // If this is a split between two people only and the function
        // wasn't provided with an existing group chat report id
        // or, if this is workspace chat, then the oneOnOneChatReport is the same as the splitChatReport
        if ((!hasMultipleParticipants && !existingSplitChatReportID) || isOwnPolicyExpenseChat) {
            oneOnOneChatReport = splitChatReport;
            shouldCreateOptimisticPersonalDetails = !existingSplitChatReport;
        } else {
            const existingChatReport = ReportUtils.getChatByParticipants([accountID]);
            isNewOneOnOneChatReport = !existingChatReport;
            shouldCreateOptimisticPersonalDetails = isNewOneOnOneChatReport;
            oneOnOneChatReport = existingChatReport || ReportUtils.buildOptimisticChatReport([accountID]);
        }

        // STEP 2: Get existing IOU report and update its total OR build a new optimistic one
        const isNewOneOnOneIOUReport = !oneOnOneChatReport.iouReportID;
        let oneOnOneIOUReport;
        if (!isNewOneOnOneIOUReport) {
            oneOnOneIOUReport = allReports[`${ONYXKEYS.COLLECTION.REPORT}${oneOnOneChatReport.iouReportID}`];
            if (isOwnPolicyExpenseChat) {
                // Because of the Expense reports are stored as negative values, we substract the total from the amount
                oneOnOneIOUReport.total -= splitAmount;
            } else {
                oneOnOneIOUReport = IOUUtils.updateIOUOwnerAndTotal(oneOnOneIOUReport, currentUserAccountID, splitAmount, currency);
            }
        } else {
            oneOnOneIOUReport = ReportUtils.buildOptimisticIOUReport(currentUserAccountID, accountID, splitAmount, oneOnOneChatReport.reportID, currency);
        }

        // STEP 3: Build optimistic transaction
        const oneOnOneTransaction = TransactionUtils.buildOptimisticTransaction(
            ReportUtils.isExpenseReport(oneOnOneIOUReport) ? -splitAmount : splitAmount,
            currency,
            oneOnOneIOUReport.reportID,
            comment,
            CONST.IOU.MONEY_REQUEST_TYPE.SPLIT,
            splitTransaction.transactionID,
        );

        // STEP 4: Build optimistic reportActions. We need:
        // 1. CREATED action for the chatReport
        // 2. CREATED action for the iouReport
        // 3. IOU action for the iouReport
        // 4. REPORTPREVIEW action for the chatReport
        // Note: The CREATED action for the IOU report must be optimistically generated before the IOU action so there's no chance that it appears after the IOU action in the chat
        const oneOnOneCreatedActionForChat = ReportUtils.buildOptimisticCreatedReportAction(currentUserEmail);
        const oneOnOneCreatedActionForIOU = ReportUtils.buildOptimisticCreatedReportAction(currentUserEmail);
        const oneOnOneIOUAction = ReportUtils.buildOptimisticIOUReportAction(
            CONST.IOU.REPORT_ACTION_TYPE.CREATE,
            splitAmount,
            currency,
            comment,
            [participant],
            oneOnOneTransaction.transactionID,
            '',
            oneOnOneIOUReport.reportID,
        );

        // Add optimistic personal details for new participants
        const oneOnOnePersonalDetailListAction = shouldCreateOptimisticPersonalDetails
            ? {
                  [accountID]: {
                      accountID,
                      avatar: UserUtils.getDefaultAvatarURL(accountID),
                      displayName: participant.displayName || email,
                      login: participant.login,
                  },
              }
            : undefined;

        let oneOnOneReportPreviewAction = ReportActionsUtils.getReportPreviewAction(oneOnOneChatReport.reportID, oneOnOneIOUReport.reportID);
        if (oneOnOneReportPreviewAction) {
            oneOnOneReportPreviewAction = ReportUtils.updateReportPreview(oneOnOneIOUReport, oneOnOneReportPreviewAction);
        } else {
            oneOnOneReportPreviewAction = ReportUtils.buildOptimisticReportPreview(oneOnOneChatReport, oneOnOneIOUReport);
        }

        // STEP 5: Build Onyx Data
        const [oneOnOneOptimisticData, oneOnOneSuccessData, oneOnOneFailureData] = buildOnyxDataForMoneyRequest(
            oneOnOneChatReport,
            oneOnOneIOUReport,
            oneOnOneTransaction,
            oneOnOneCreatedActionForChat,
            oneOnOneCreatedActionForIOU,
            oneOnOneIOUAction,
            oneOnOnePersonalDetailListAction,
            oneOnOneReportPreviewAction,
            isNewOneOnOneChatReport,
            isNewOneOnOneIOUReport,
        );

        const splitData = {
            email,
            accountID,
            amount: splitAmount,
            iouReportID: oneOnOneIOUReport.reportID,
            chatReportID: oneOnOneChatReport.reportID,
            transactionID: oneOnOneTransaction.transactionID,
            reportActionID: oneOnOneIOUAction.reportActionID,
            createdChatReportActionID: oneOnOneCreatedActionForChat.reportActionID,
            createdIOUReportActionID: oneOnOneCreatedActionForIOU.reportActionID,
            reportPreviewReportActionID: oneOnOneReportPreviewAction.reportActionID,
        };

        splits.push(splitData);
        optimisticData.push(...oneOnOneOptimisticData);
        successData.push(...oneOnOneSuccessData);
        failureData.push(...oneOnOneFailureData);
    });

    const splitData = {
        chatReportID: splitChatReport.reportID,
        transactionID: splitTransaction.transactionID,
        reportActionID: splitIOUReportAction.reportActionID,
        policyID: splitChatReport.policyID,
    };

    if (_.isEmpty(existingSplitChatReport)) {
        splitData.createdReportActionID = splitCreatedReportAction.reportActionID;
    }

    return {
        splitData,
        splits,
        onyxData: {optimisticData, successData, failureData},
    };
}

/**
 * @param {Array} participants
 * @param {String} currentUserLogin
 * @param {Number} currentUserAccountID
 * @param {Number} amount - always in smallest currency unit
 * @param {String} comment
 * @param {String} currency
 * @param {String} existingGroupChatReportID
 */
function splitBill(participants, currentUserLogin, currentUserAccountID, amount, comment, currency, existingGroupChatReportID = '') {
    const {splitData, splits, onyxData} = createSplitsAndOnyxData(participants, currentUserLogin, currentUserAccountID, amount, comment, currency, existingGroupChatReportID);

    API.write(
        'SplitBill',
        {
            reportID: splitData.chatReportID,
            amount,
            splits: JSON.stringify(splits),
            currency,
            comment,
            transactionID: splitData.transactionID,
            reportActionID: splitData.reportActionID,
            createdReportActionID: splitData.createdReportActionID,
            policyID: splitData.policyID,
        },
        onyxData,
    );

    resetMoneyRequestInfo();
    Navigation.dismissModal();
    Report.notifyNewAction(splitData.chatReportID, currentUserAccountID);
}

/**
 * @param {Array} participants
 * @param {String} currentUserLogin
 * @param {Number} currentUserAccountID
 * @param {Number} amount - always in smallest currency unit
 * @param {String} comment
 * @param {String} currency
 */
function splitBillAndOpenReport(participants, currentUserLogin, currentUserAccountID, amount, comment, currency) {
    const {splitData, splits, onyxData} = createSplitsAndOnyxData(participants, currentUserLogin, currentUserAccountID, amount, comment, currency);

    API.write(
        'SplitBillAndOpenReport',
        {
            reportID: splitData.chatReportID,
            amount,
            splits: JSON.stringify(splits),
            currency,
            comment,
            transactionID: splitData.transactionID,
            reportActionID: splitData.reportActionID,
            createdReportActionID: splitData.createdReportActionID,
        },
        onyxData,
    );

    resetMoneyRequestInfo();
    Navigation.dismissModal(splitData.chatReportID);
    Report.notifyNewAction(splitData.chatReportID, currentUserAccountID);
}

/**
 * @param {String} transactionID
 * @param {Number} transactionThreadReportID
 * @param {Object} transactionChanges
 */
function editMoneyRequest(transactionID, transactionThreadReportID, transactionChanges) {
    // STEP 1: Get all collections we're updating
    const transactionThread = allReports[`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadReportID}`];
    const transaction = allTransactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
    const iouReport = allReports[`${ONYXKEYS.COLLECTION.REPORT}${transactionThread.parentReportID}`];
    const isFromExpenseReport = ReportUtils.isExpenseReport(iouReport);

    // STEP 2: Build new modified expense report action.
    const updatedReportAction = ReportUtils.buildOptimisticModifiedExpenseReportAction(transactionThread, transaction, transactionChanges, isFromExpenseReport);
    const updatedTransaction = TransactionUtils.getUpdatedTransaction(transaction, transactionChanges, isFromExpenseReport);
    // STEP 3: Compute the IOU total and update the report preview message so LHN amount owed is correct
    // STEP 4: Compose the optimistic data
    const optimisticData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThread.reportID}`,
            value: {
                [updatedReportAction.reportActionID]: updatedReportAction,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: updatedTransaction,
        },
    ];

    const successData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThread.reportID}`,
            value: {
                [updatedReportAction.reportActionID]: {pendingAction: null},
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: {pendingAction: null},
        },
    ];

    const failureData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThread.reportID}`,
            value: {
                [updatedReportAction.reportActionID]: updatedReportAction,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: transaction,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport.report}`,
            value: iouReport,
        },
    ];

    // STEP 6: Call the API endpoint
    const {created, amount, currency, comment} = ReportUtils.getTransactionDetails(updatedTransaction);
    API.write(
        'EditMoneyRequest',
        {
            transactionID,
            reportActionID: updatedReportAction.reportActionID,
            created,
            amount,
            currency,
            comment,
        },
        {optimisticData, successData, failureData},
    );
}

/**
 * @param {String} transactionID
 * @param {Object} reportAction - the money request reportAction we are deleting
 * @param {Boolean} isSingleTransactionView
 */
function deleteMoneyRequest(transactionID, reportAction, isSingleTransactionView = false) {
    // STEP 1: Get all collections we're updating
    const iouReport = allReports[`${ONYXKEYS.COLLECTION.REPORT}${reportAction.originalMessage.IOUReportID}`];
    const chatReport = allReports[`${ONYXKEYS.COLLECTION.REPORT}${iouReport.chatReportID}`];
    const reportPreviewAction = ReportActionsUtils.getReportPreviewAction(iouReport.chatReportID, iouReport.reportID);
    const transaction = allTransactions[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];
    const transactionThreadID = reportAction.childReportID;
    let transactionThread = null;
    if (transactionThreadID) {
        transactionThread = allReports[`${ONYXKEYS.COLLECTION.REPORT}${transactionThreadID}`];
    }

    // STEP 2: Decide if we need to:
    // 1. Delete the transactionThread - delete if there are no visible comments in the thread
    // 2. Update the iouPreview to show [Deleted request] - update if the transactionThread exists AND it isn't being deleted
    const shouldDeleteTransactionThread = transactionThreadID ? ReportActionsUtils.getLastVisibleMessage(transactionThreadID).lastMessageText.length === 0 : false;
    const shouldShowDeletedRequestMessage = transactionThreadID && !shouldDeleteTransactionThread;

    // STEP 3: Update the IOU reportAction and decide if the iouReport should be deleted. We delete the iouReport if there are no visible comments left in the report.
    const updatedReportAction = {
        [reportAction.reportActionID]: {
            pendingAction: shouldShowDeletedRequestMessage ? CONST.RED_BRICK_ROAD_PENDING_ACTION.UPDATE : CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE,
            previousMessage: reportAction.message,
            message: [
                {
                    type: 'COMMENT',
                    html: '',
                    text: '',
                    isEdited: true,
                    isDeletedParentAction: shouldShowDeletedRequestMessage,
                },
            ],
            originalMessage: {
                IOUTransactionID: null,
            },
            errors: null,
        },
    };

    const lastVisibleAction = ReportActionsUtils.getLastVisibleAction(iouReport.reportID, updatedReportAction);
    const iouReportLastMessageText = ReportActionsUtils.getLastVisibleMessage(iouReport.reportID, updatedReportAction).lastMessageText;
    const shouldDeleteIOUReport =
        iouReportLastMessageText.length === 0 && !ReportActionsUtils.isDeletedParentAction(lastVisibleAction) && (!transactionThreadID || shouldDeleteTransactionThread);

    // STEP 4: Update the iouReport and reportPreview with new totals and messages if it wasn't deleted
    let updatedIOUReport = null;
    let updatedReportPreviewAction = null;
    if (!shouldDeleteIOUReport) {
        if (ReportUtils.isExpenseReport(iouReport)) {
            updatedIOUReport = {...iouReport};

            // Because of the Expense reports are stored as negative values, we add the total from the amount
            updatedIOUReport.total += TransactionUtils.getAmount(transaction, true);
        } else {
            updatedIOUReport = IOUUtils.updateIOUOwnerAndTotal(
                iouReport,
                reportAction.actorAccountID,
                TransactionUtils.getAmount(transaction, false),
                TransactionUtils.getCurrency(transaction),
                true,
            );
        }

        updatedIOUReport.lastMessageText = iouReportLastMessageText;
        updatedIOUReport.lastVisibleActionCreated = lastVisibleAction.created;

        updatedReportPreviewAction = {...reportPreviewAction};
        const messageText = Localize.translateLocal('iou.payerOwesAmount', {
            payer: updatedIOUReport.managerEmail,
            amount: CurrencyUtils.convertToDisplayString(updatedIOUReport.total, updatedIOUReport.currency),
        });
        updatedReportPreviewAction.message[0].text = messageText;
        updatedReportPreviewAction.message[0].html = messageText;
        if (reportPreviewAction.childMoneyRequestCount > 0) {
            updatedReportPreviewAction.childMoneyRequestCount = reportPreviewAction.childMoneyRequestCount - 1;
        }
    }

    // STEP 5: Build Onyx data
    const optimisticData = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: null,
        },
        ...(shouldDeleteTransactionThread
            ? [
                  {
                      onyxMethod: Onyx.METHOD.SET,
                      key: `${ONYXKEYS.COLLECTION.REPORT}${transactionThreadID}`,
                      value: null,
                  },
                  {
                      onyxMethod: Onyx.METHOD.SET,
                      key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${transactionThreadID}`,
                      value: null,
                  },
              ]
            : []),
        {
            onyxMethod: shouldDeleteIOUReport ? Onyx.METHOD.SET : Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport.reportID}`,
            value: shouldDeleteIOUReport ? null : updatedReportAction,
        },
        {
            onyxMethod: shouldDeleteIOUReport ? Onyx.METHOD.SET : Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport.reportID}`,
            value: updatedIOUReport,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport.reportID}`,
            value: {
                [reportPreviewAction.reportActionID]: updatedReportPreviewAction,
            },
        },
        ...(shouldDeleteIOUReport
            ? [
                  {
                      onyxMethod: Onyx.METHOD.MERGE,
                      key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`,
                      value: {
                          hasOutstandingIOU: false,
                          iouReportID: null,
                          lastMessageText: ReportActionsUtils.getLastVisibleMessage(iouReport.chatReportID, {[reportPreviewAction.reportActionID]: null}).lastMessageText,
                          lastVisibleActionCreated: ReportActionsUtils.getLastVisibleAction(iouReport.chatReportID, {[reportPreviewAction.reportActionID]: null}).created,
                      },
                  },
              ]
            : []),
    ];

    const successData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport.reportID}`,
            value: {
                [reportAction.reportActionID]: {pendingAction: null},
            },
        },
    ];

    const failureData = [
        {
            onyxMethod: Onyx.METHOD.SET,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`,
            value: transaction,
        },
        ...(shouldDeleteTransactionThread
            ? [
                  {
                      onyxMethod: Onyx.METHOD.SET,
                      key: `${ONYXKEYS.COLLECTION.REPORT}${transactionThreadID}`,
                      value: transactionThread,
                  },
              ]
            : []),
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport.reportID}`,
            value: {
                [reportAction.reportActionID]: {
                    ...reportAction,
                    errors: ErrorUtils.getMicroSecondOnyxError('iou.error.genericDeleteFailureMessage'),
                },
            },
        },
        {
            onyxMethod: shouldDeleteIOUReport ? Onyx.METHOD.SET : Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport.reportID}`,
            value: iouReport,
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport.reportID}`,
            value: {
                [reportPreviewAction.reportActionID]: reportPreviewAction,
            },
        },
        ...(shouldDeleteIOUReport
            ? [
                  {
                      onyxMethod: Onyx.METHOD.MERGE,
                      key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`,
                      value: chatReport,
                  },
              ]
            : []),
    ];

    // STEP 6: Make the API request
    API.write(
        'DeleteMoneyRequest',
        {
            transactionID,
            reportActionID: reportAction.reportActionID,
        },
        {optimisticData, successData, failureData},
    );

    // STEP 7: Navigate the user depending on which page they are on and which resources were deleted
    if (isSingleTransactionView && shouldDeleteTransactionThread && !shouldDeleteIOUReport) {
        // Pop the deleted report screen before navigating. This prevents navigating to the Concierge chat due to the missing report.
        Navigation.goBack();
        Navigation.navigate(ROUTES.getReportRoute(iouReport.reportID));
        return;
    }

    if (shouldDeleteIOUReport) {
        // Pop the deleted report screen before navigating. This prevents navigating to the Concierge chat due to the missing report.
        Navigation.goBack();
        Navigation.navigate(ROUTES.getReportRoute(iouReport.chatReportID));
    }
}

/**
 * @param {Number} amount
 * @param {String} submitterPayPalMeAddress
 * @param {String} currency
 * @returns {String}
 */
function buildPayPalPaymentUrl(amount, submitterPayPalMeAddress, currency) {
    return `https://paypal.me/${submitterPayPalMeAddress}/${Math.abs(amount) / 100}${currency}`;
}

/**
 * @param {Object} report
 * @param {Number} amount
 * @param {String} currency
 * @param {String} comment
 * @param {String} paymentMethodType
 * @param {String} managerID - Account ID of the person sending the money
 * @param {Object} recipient - The user receiving the money
 * @returns {Object}
 */
function getSendMoneyParams(report, amount, currency, comment, paymentMethodType, managerID, recipient) {
    const recipientEmail = OptionsListUtils.addSMSDomainIfPhoneNumber(recipient.login);
    const recipientAccountID = Number(recipient.accountID);
    const newIOUReportDetails = JSON.stringify({
        amount,
        currency,
        requestorEmail: recipientEmail,
        requestorAccountID: recipientAccountID,
        comment,
        idempotencyKey: Str.guid(),
    });

    let chatReport = report.reportID ? report : null;
    let isNewChat = false;
    if (!chatReport) {
        chatReport = ReportUtils.getChatByParticipants([recipientAccountID]);
    }
    if (!chatReport) {
        chatReport = ReportUtils.buildOptimisticChatReport([recipientAccountID]);
        isNewChat = true;
    }
    const optimisticIOUReport = ReportUtils.buildOptimisticIOUReport(recipientAccountID, managerID, amount, chatReport.reportID, currency, true);

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
        false,
        true,
    );

    const reportPreviewAction = ReportUtils.buildOptimisticReportPreview(chatReport, optimisticIOUReport);

    // First, add data that will be used in all cases
    const optimisticChatReportData = {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`,
        value: {
            ...chatReport,
            lastReadTime: DateUtils.getDBTime(),
            lastVisibleActionCreated: reportPreviewAction.created,
        },
    };
    const optimisticIOUReportData = {
        onyxMethod: Onyx.METHOD.SET,
        key: `${ONYXKEYS.COLLECTION.REPORT}${optimisticIOUReport.reportID}`,
        value: {
            ...optimisticIOUReport,
            lastMessageText: optimisticIOUReportAction.message[0].text,
            lastMessageHtml: optimisticIOUReportAction.message[0].html,
        },
    };
    const optimisticIOUReportActionsData = {
        onyxMethod: Onyx.METHOD.MERGE,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${optimisticIOUReport.reportID}`,
        value: {
            [optimisticIOUReportAction.reportActionID]: {
                ...optimisticIOUReportAction,
                pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
            },
        },
    };
    const optimisticChatReportActionsData = {
        onyxMethod: Onyx.METHOD.SET,
        key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport.reportID}`,
        value: {
            [reportPreviewAction.reportActionID]: reportPreviewAction,
        },
    };

    const successData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${optimisticIOUReport.reportID}`,
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
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport.reportID}`,
            value: {
                [reportPreviewAction.reportActionID]: {
                    pendingAction: null,
                },
            },
        },
    ];

    const failureData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.TRANSACTION}${optimisticTransaction.transactionID}`,
            value: {
                errors: ErrorUtils.getMicroSecondOnyxError('iou.error.other'),
            },
        },
    ];

    let optimisticPersonalDetailListData = {};

    // Now, let's add the data we need just when we are creating a new chat report
    if (isNewChat) {
        // Change the method to set for new reports because it doesn't exist yet, is faster,
        // and we need the data to be available when we navigate to the chat page
        optimisticChatReportData.onyxMethod = Onyx.METHOD.SET;
        optimisticIOUReportData.onyxMethod = Onyx.METHOD.SET;

        // Set and clear pending fields on the chat report
        optimisticChatReportData.value.pendingFields = {createChat: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD};
        successData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: optimisticChatReportData.key,
            value: {pendingFields: null},
        });
        failureData.push(
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: optimisticChatReportData.key,
                value: {
                    errorFields: {
                        createChat: ErrorUtils.getMicroSecondOnyxError('report.genericCreateReportFailureMessage'),
                    },
                },
            },
            {
                onyxMethod: Onyx.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${optimisticIOUReport.reportID}`,
                value: {
                    [optimisticIOUReportAction.reportActionID]: {
                        errors: ErrorUtils.getMicroSecondOnyxError(null),
                    },
                },
            },
        );

        // Add optimistic personal details for recipient
        optimisticPersonalDetailListData = {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.PERSONAL_DETAILS_LIST,
            value: {
                [recipientAccountID]: {
                    accountID: recipientAccountID,
                    avatar: UserUtils.getDefaultAvatarURL(recipient.accountID),
                    displayName: recipient.displayName || recipient.login,
                    login: recipient.login,
                },
            },
        };

        // Add an optimistic created action to the optimistic chat reportActions data
        optimisticChatReportActionsData.value[optimisticCreatedAction.reportActionID] = optimisticCreatedAction;
    } else {
        failureData.push({
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${optimisticIOUReport.reportID}`,
            value: {
                [optimisticIOUReportAction.reportActionID]: {
                    errors: ErrorUtils.getMicroSecondOnyxError('iou.error.other'),
                },
            },
        });
    }

    const optimisticData = [optimisticChatReportData, optimisticIOUReportData, optimisticChatReportActionsData, optimisticIOUReportActionsData, optimisticTransactionData];
    if (!_.isEmpty(optimisticPersonalDetailListData)) {
        optimisticData.push(optimisticPersonalDetailListData);
    }

    return {
        params: {
            iouReportID: optimisticIOUReport.reportID,
            chatReportID: chatReport.reportID,
            reportActionID: optimisticIOUReportAction.reportActionID,
            paymentMethodType,
            transactionID: optimisticTransaction.transactionID,
            newIOUReportDetails,
            createdReportActionID: isNewChat ? optimisticCreatedAction.reportActionID : 0,
            reportPreviewReportActionID: reportPreviewAction.reportActionID,
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
        '',
        paymentMethodType,
        iouReport.reportID,
        true,
    );

    const optimisticReportPreviewAction = ReportUtils.updateReportPreview(iouReport, ReportActionsUtils.getReportPreviewAction(chatReport.reportID, iouReport.reportID));

    const optimisticData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${chatReport.reportID}`,
            value: {
                ...chatReport,
                lastReadTime: DateUtils.getDBTime(),
                lastVisibleActionCreated: optimisticIOUReportAction.created,
                hasOutstandingIOU: false,
                iouReportID: null,
                lastMessageText: optimisticIOUReportAction.message[0].text,
                lastMessageHtml: optimisticIOUReportAction.message[0].html,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport.reportID}`,
            value: {
                [optimisticIOUReportAction.reportActionID]: {
                    ...optimisticIOUReportAction,
                    pendingAction: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport.reportID}`,
            value: {
                [optimisticReportPreviewAction.reportActionID]: optimisticReportPreviewAction,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT}${iouReport.reportID}`,
            value: {
                ...iouReport,
                lastMessageText: optimisticIOUReportAction.message[0].text,
                lastMessageHtml: optimisticIOUReportAction.message[0].html,
                hasOutstandingIOU: false,
                stateNum: CONST.REPORT.STATE_NUM.SUBMITTED,
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: ONYXKEYS.NVP_LAST_PAYMENT_METHOD,
            value: {[iouReport.policyID]: paymentMethodType},
        },
    ];

    const successData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport.reportID}`,
            value: {
                [optimisticIOUReportAction.reportActionID]: {
                    pendingAction: null,
                },
            },
        },
    ];

    const failureData = [
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${iouReport.reportID}`,
            value: {
                [optimisticIOUReportAction.reportActionID]: {
                    errors: ErrorUtils.getMicroSecondOnyxError('iou.error.other'),
                },
            },
        },
        {
            onyxMethod: Onyx.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport.reportID}`,
            value: {
                [optimisticReportPreviewAction.reportActionID]: {
                    created: optimisticReportPreviewAction.created,
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
 * @param {String} managerID - Account ID of the person sending the money
 * @param {Object} recipient - The user receiving the money
 */
function sendMoneyElsewhere(report, amount, currency, comment, managerID, recipient) {
    const {params, optimisticData, successData, failureData} = getSendMoneyParams(report, amount, currency, comment, CONST.IOU.PAYMENT_TYPE.ELSEWHERE, managerID, recipient);

    API.write('SendMoneyElsewhere', params, {optimisticData, successData, failureData});

    resetMoneyRequestInfo();
    Navigation.dismissModal(params.chatReportID);
    Report.notifyNewAction(params.chatReportID, managerID);
}

/**
 * @param {Object} report
 * @param {Number} amount
 * @param {String} currency
 * @param {String} comment
 * @param {String} managerID - Account ID of the person sending the money
 * @param {Object} recipient - The user receiving the money
 */
function sendMoneyWithWallet(report, amount, currency, comment, managerID, recipient) {
    const {params, optimisticData, successData, failureData} = getSendMoneyParams(report, amount, currency, comment, CONST.IOU.PAYMENT_TYPE.EXPENSIFY, managerID, recipient);

    API.write('SendMoneyWithWallet', params, {optimisticData, successData, failureData});

    resetMoneyRequestInfo();
    Navigation.dismissModal(params.chatReportID);
    Report.notifyNewAction(params.chatReportID, managerID);
}

/**
 * @param {Object} report
 * @param {Number} amount
 * @param {String} currency
 * @param {String} comment
 * @param {String} managerID - Account ID of the person sending the money
 * @param {Object} recipient - The user receiving the money
 */
function sendMoneyViaPaypal(report, amount, currency, comment, managerID, recipient) {
    const {params, optimisticData, successData, failureData} = getSendMoneyParams(report, amount, currency, comment, CONST.IOU.PAYMENT_TYPE.PAYPAL_ME, managerID, recipient);

    API.write('SendMoneyViaPaypal', params, {optimisticData, successData, failureData});

    resetMoneyRequestInfo();
    Navigation.dismissModal(params.chatReportID);
    Report.notifyNewAction(params.chatReportID, managerID);

    asyncOpenURL(Promise.resolve(), buildPayPalPaymentUrl(amount, recipient.payPalMeAddress, currency));
}

/**
 * @param {String} paymentType
 * @param {Object} chatReport
 * @param {Object} iouReport
 * @param {String} reimbursementBankAccountState
 */
function payMoneyRequest(paymentType, chatReport, iouReport) {
    const recipient = {
        login: iouReport.ownerEmail,
        accountID: iouReport.ownerAccountID,
        payPalMeAddress: iouReport.submitterPayPalMeAddress,
    };
    const {params, optimisticData, successData, failureData} = getPayMoneyRequestParams(chatReport, iouReport, recipient, paymentType);

    // For now we need to call the PayMoneyRequestWithWallet API since PayMoneyRequest was not updated to work with
    // Expensify Wallets.
    const apiCommand = paymentType === CONST.IOU.PAYMENT_TYPE.EXPENSIFY ? 'PayMoneyRequestWithWallet' : 'PayMoneyRequest';

    API.write(apiCommand, params, {optimisticData, successData, failureData});
    Navigation.dismissModal(chatReport.reportID);
    if (paymentType === CONST.IOU.PAYMENT_TYPE.PAYPAL_ME) {
        asyncOpenURL(Promise.resolve(), buildPayPalPaymentUrl(iouReport.total, recipient.payPalMeAddress, iouReport.currency));
    }
}

/**
 * Initialize money request info and navigate to the MoneyRequest page
 * @param {String} iouType
 * @param {String} reportID
 */
function startMoneyRequest(iouType, reportID = '') {
    resetMoneyRequestInfo(`${iouType}${reportID}`);
    Navigation.navigate(ROUTES.getMoneyRequestRoute(iouType, reportID));
}

/**
 * @param {String} id
 */
function setMoneyRequestId(id) {
    Onyx.merge(ONYXKEYS.IOU, {id});
}

/**
 * @param {Number} amount
 */
function setMoneyRequestAmount(amount) {
    Onyx.merge(ONYXKEYS.IOU, {amount});
}

/**
 * @param {String} currency
 */
function setMoneyRequestCurrency(currency) {
    Onyx.merge(ONYXKEYS.IOU, {currency});
}

/**
 * @param {String} comment
 */
function setMoneyRequestDescription(comment) {
    Onyx.merge(ONYXKEYS.IOU, {comment: comment.trim()});
}

/**
 * @param {Object[]} participants
 */
function setMoneyRequestParticipants(participants) {
    Onyx.merge(ONYXKEYS.IOU, {participants});
}

/**
 * @param {String} receiptPath
 * @param {String} receiptSource
 */
function setMoneyRequestReceipt(receiptPath, receiptSource) {
    Onyx.merge(ONYXKEYS.IOU, {receiptPath, receiptSource});
}

function createEmptyTransaction() {
    const transactionID = NumberUtils.rand64();
    Onyx.merge(`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`, {transactionID});
    Onyx.merge(ONYXKEYS.IOU, {transactionID});
}

/**
 * Navigates to the next IOU page based on where the IOU request was started
 *
 * @param {Object} iou
 * @param {String} iouType
 * @param {String} reportID
 * @param {Object} report
 */
function navigateToNextPage(iou, iouType, reportID, report) {
    const moneyRequestID = `${iouType}${reportID}`;
    const shouldReset = iou.id !== moneyRequestID;

    // If the money request ID in Onyx does not match the ID from params, we want to start a new request
    // with the ID from params. We need to clear the participants in case the new request is initiated from FAB.
    if (shouldReset) {
        resetMoneyRequestInfo(moneyRequestID);
    }

    // If a request is initiated on a report, skip the participants selection step and navigate to the confirmation page.
    if (report.reportID) {
        // Reinitialize the participants when the money request ID in Onyx does not match the ID from params
        if (_.isEmpty(iou.participants) || shouldReset) {
            const currentUserAccountID = currentUserPersonalDetails.accountID;
            const participants = ReportUtils.isPolicyExpenseChat(report)
                ? [{reportID: report.reportID, isPolicyExpenseChat: true, selected: true}]
                : _.chain(report.participantAccountIDs)
                      .filter((accountID) => currentUserAccountID !== accountID)
                      .map((accountID) => ({accountID, selected: true}))
                      .value();
            setMoneyRequestParticipants(participants);
        }
        Navigation.navigate(ROUTES.getMoneyRequestConfirmationRoute(iouType, reportID));
        return;
    }
    Navigation.navigate(ROUTES.getMoneyRequestParticipantsRoute(iouType));
}

export {
    createDistanceRequest,
    editMoneyRequest,
    deleteMoneyRequest,
    splitBill,
    splitBillAndOpenReport,
    requestMoney,
    sendMoneyElsewhere,
    sendMoneyViaPaypal,
    payMoneyRequest,
    sendMoneyWithWallet,
    startMoneyRequest,
    resetMoneyRequestInfo,
    setMoneyRequestId,
    setMoneyRequestAmount,
    setMoneyRequestCurrency,
    setMoneyRequestDescription,
    setMoneyRequestParticipants,
    setMoneyRequestReceipt,
    createEmptyTransaction,
    navigateToNextPage,
};
