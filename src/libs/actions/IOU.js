import Onyx from 'react-native-onyx';
import _ from 'underscore';
import lodashGet from 'lodash/get';
import CONST from '../../CONST';
import ONYXKEYS from '../../ONYXKEYS';
import ROUTES from '../../ROUTES';
import * as DeprecatedAPI from '../deprecatedAPI';
import * as Report from './Report';
import Navigation from '../Navigation/Navigation';
import Growl from '../Growl';
import * as Localize from '../Localize';
import asyncOpenURL from '../asyncOpenURL';
import Log from '../Log';
import * as API from '../API';
import * as ReportUtils from '../ReportUtils';
import * as NumberUtils from '../NumberUtils';
import * as IOUUtils from '../IOUUtils';
import DateUtils from '../DateUtils';
import * as OptionsListUtils from "../OptionsListUtils";

let iouReports;
Onyx.connect({
    key: ONYXKEYS.COLLECTION.REPORT_IOUS,
    waitForCollectionCallback: true,
    callback: val => iouReports = val,
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
 * Gets the IOU Reports for new transaction
 *
 * @param {Object[]} requestParams
 * @param {Number} requestParams.reportID the ID of the IOU report
 * @param {Number} requestParams.chatReportID the ID of the chat report that the IOU report belongs to
 */
function getIOUReportsForNewTransaction(requestParams) {
    DeprecatedAPI.Get({
        returnValueList: 'reportStuff',
        reportIDList: _.pluck(requestParams, 'reportID').join(','),
        shouldLoadOptionalKeys: true,
        includePinnedReports: true,
    })
        .then((response) => {
            if (response.jsonCode !== 200) {
                Onyx.merge(ONYXKEYS.IOU, {error: true});
                return;
            }

            const chatReportsToUpdate = {};
            const iouReportsToUpdate = {};

            _.each(response.reports, (reportData) => {
                // First, the existing chat report needs to be updated with the details about the new IOU
                const paramsForIOUReport = _.findWhere(requestParams, {reportID: reportData.reportID});
                if (paramsForIOUReport && paramsForIOUReport.chatReportID) {
                    const chatReportID = paramsForIOUReport.chatReportID;
                    const chatReportKey = `${ONYXKEYS.COLLECTION.REPORT}${chatReportID}`;
                    chatReportsToUpdate[chatReportKey] = {
                        iouReportID: reportData.reportID,
                        total: reportData.total,
                        stateNum: reportData.stateNum,
                        hasOutstandingIOU: true,
                    };

                    // Second, the IOU report needs to be updated with the new IOU details too
                    const iouReportKey = `${ONYXKEYS.COLLECTION.REPORT_IOUS}${reportData.reportID}`;
                    iouReportsToUpdate[iouReportKey] = Report.getSimplifiedIOUReport(reportData, chatReportID);
                }
            });

            Onyx.mergeCollection(ONYXKEYS.COLLECTION.REPORT, chatReportsToUpdate);
            Onyx.mergeCollection(ONYXKEYS.COLLECTION.REPORT_IOUS, iouReportsToUpdate);
        })
        .finally(() => Onyx.merge(ONYXKEYS.IOU, {loading: false, creatingIOUTransaction: false}));
}

/**
 * Returns IOU Transaction Error Messages
 *
 * @param {Object} response
 * @returns {String}
 */
function getIOUErrorMessage(response) {
    if (response && response.jsonCode) {
        if (response.jsonCode === 405) {
            return Localize.translateLocal('common.error.invalidAmount');
        }

        if (response.jsonCode === 404) {
            return Localize.translateLocal('iou.error.invalidSplit');
        }

        if (response.jsonCode === 402) {
            return Localize.translateLocal('common.error.phoneNumber');
        }
    }
    return Localize.translateLocal('iou.error.other');
}

/**
 * @param {Object} response
 */
function processIOUErrorResponse(response) {
    Onyx.merge(ONYXKEYS.IOU, {
        loading: false,
        creatingIOUTransaction: false,
        error: true,
    });
    Growl.error(getIOUErrorMessage(response));
}

function startLoadingAndResetError() {
    Onyx.merge(ONYXKEYS.IOU, {loading: true, creatingIOUTransaction: true, error: false});
}

/**
 * Request money from another user
 *
 * @param {Object} report
 * @param {Number} amount
 * @param {String} currency
 * @param {Array} recipient
 * @param {Array} debtor
 * @param {String} comment
 */
function requestMoney(report, amount, currency, recipient, debtor, comment) {
    const recipientEmail = OptionsListUtils.addSMSDomainIfPhoneNumber(recipient.login);
    const debtorEmail = OptionsListUtils.addSMSDomainIfPhoneNumber(debtor.login);
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
            iouReports[`${ONYXKEYS.COLLECTION.REPORT_IOUS}${chatReport.iouReportID}`],
            recipientEmail,
            amount,
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
        '',
        '',
        iouReport.reportID,
        debtor.firstName,
        preferredLocale,
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
            onyxMethod: CONST.ONYX.METHOD.MERGE,
            key: `${ONYXKEYS.COLLECTION.REPORT_IOUS}${iouReport.reportID}`,
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
        const optimisticCreateAction = ReportUtils.buildOptimisticCreatedReportAction(recipientEmail);
        optimisticData[0].value = {
            ...optimisticData[0].value,
            pendingFields: {createChat: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD},
        };
        optimisticData.push(
            {
                onyxMethod: CONST.ONYX.METHOD.MERGE,
                key: `${ONYXKEYS.COLLECTION.REPORT_ACTIONS}${chatReport.reportID}`,
                value: optimisticCreateAction,
            },
        );

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
        transactionID: NumberUtils.rand64(),
        reportActionID: optimisticReportAction.reportActionID,
        clientID: optimisticReportAction.sequenceNumber,
    }, {optimisticData, successData, failureData});
    Navigation.navigate(ROUTES.getReportRoute(chatReport.reportID));
}

/**
 * Creates IOUSplit Transaction
 *
 * @param {Object} params
 * @param {Array} params.splits
 * @param {String} params.comment
 * @param {Number} params.amount
 * @param {String} params.currency
 */
function createIOUSplit(params) {
    startLoadingAndResetError();

    let chatReportID;
    DeprecatedAPI.CreateChatReport({
        emailList: _.map(params.splits, participant => participant.email).join(','),
    })
        .then((response) => {
            if (response.jsonCode !== 200) {
                return response;
            }

            chatReportID = response.reportID;
            return DeprecatedAPI.CreateIOUSplit({
                ...params,
                splits: JSON.stringify(params.splits),
                reportID: response.reportID,
            });
        })
        .then((response) => {
            if (response.jsonCode !== 200) {
                processIOUErrorResponse(response);
                return;
            }

            // This data needs to go from this:
            // {reportIDList: [1, 2], chatReportIDList: [3, 4]}
            // to this:
            // [{reportID: 1, chatReportID: 3}, {reportID: 2, chatReportID: 4}]
            // in order for getIOUReportsForNewTransaction to know which IOU reports are associated with which
            // chat reports
            const reportParams = [];
            for (let i = 0; i < response.reportIDList.length; i++) {
                reportParams.push({
                    reportID: response.reportIDList[i],
                    chatReportID: response.chatReportIDList[i],
                });
            }
            getIOUReportsForNewTransaction(reportParams);
            Navigation.navigate(ROUTES.getReportRoute(chatReportID));
        });
}

/**
 * Creates IOUSplit Transaction for Group DM
 *
 * @param {Object} params
 * @param {Array} params.splits
 * @param {String} params.comment
 * @param {Number} params.amount
 * @param {String} params.currency
 * @param {String} params.reportID
 */
function createIOUSplitGroup(params) {
    startLoadingAndResetError();

    DeprecatedAPI.CreateIOUSplit({
        ...params,
        splits: JSON.stringify(params.splits),
    })
        .then((response) => {
            if (response.jsonCode !== 200) {
                Onyx.merge(ONYXKEYS.IOU, {error: true});
                return;
            }

            Onyx.merge(ONYXKEYS.IOU, {loading: false, creatingIOUTransaction: false});
        });
}

/**
 * Reject an iouReport transaction. Declining and cancelling transactions are done via the same Auth command.
 *
 * @param {Object} params
 * @param {Number} params.reportID
 * @param {Number} params.chatReportID
 * @param {String} params.transactionID
 * @param {String} params.comment
 */
function rejectTransaction({
    reportID, chatReportID, transactionID, comment,
}) {
    Onyx.merge(ONYXKEYS.TRANSACTIONS_BEING_REJECTED, {
        [transactionID]: true,
    });
    DeprecatedAPI.RejectTransaction({
        reportID,
        transactionID,
        comment,
    })
        .then((response) => {
            if (response.jsonCode !== 200) {
                Log.hmmm('Error rejecting transaction', {error: response.error});
                return;
            }

            const chatReport = response.reports[chatReportID];
            const iouReport = response.reports[reportID];
            Report.syncChatAndIOUReports(chatReport, iouReport);
        })
        .finally(() => {
            // Setting as null deletes the transactionID
            Onyx.merge(ONYXKEYS.TRANSACTIONS_BEING_REJECTED, {
                [transactionID]: null,
            });
        });
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

    const payIOUPromise = paymentMethodType === CONST.IOU.PAYMENT_TYPE.EXPENSIFY
        ? DeprecatedAPI.PayWithWallet({reportID, newIOUReportDetails})
        : DeprecatedAPI.PayIOU({reportID, paymentMethodType, newIOUReportDetails});

    // Build the url for Paypal.me if they have selected it instead of a manual settlement or Expensify Wallet
    let url;
    if (paymentMethodType === CONST.IOU.PAYMENT_TYPE.PAYPAL_ME) {
        url = buildPayPalPaymentUrl(amount, requestorPayPalMeAddress, currency);
    }

    const promiseWithHandlers = payIOUPromise
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

export {
    createIOUSplit,
    createIOUSplitGroup,
    rejectTransaction,
    requestMoney,
    payIOUReport,
    setIOUSelectedCurrency,
};
