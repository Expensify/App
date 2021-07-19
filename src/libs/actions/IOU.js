import Onyx from 'react-native-onyx';
import _ from 'underscore';
import CONST from '../../CONST';
import ONYXKEYS from '../../ONYXKEYS';
import ROUTES from '../../ROUTES';
import * as API from '../API';
import {getSimplifiedIOUReport, syncChatAndIOUReports} from './Report';
import Navigation from '../Navigation/Navigation';
import Growl from '../Growl';
import {translateLocal} from '../translate';
import asyncOpenURL from '../asyncOpenURL';

/**
 * @param {Object[]} requestParams
 * @param {Number} requestParams.reportID the ID of the IOU report
 * @param {Number} requestParams.chatReportID the ID of the chat report that the IOU report belongs to
 * @returns {Promise}
 * Gets the IOU Reports for new transaction
 */
function getIOUReportsForNewTransaction(requestParams) {
    return API.Get({
        returnValueList: 'reportStuff',
        reportIDList: _.pluck(requestParams, 'reportID').join(','),
        shouldLoadOptionalKeys: true,
        includePinnedReports: true,
    })
        .then(({reports}) => {
            const chatReportsToUpdate = {};
            const iouReportsToUpdate = {};

            _.each(reports, (reportData) => {
                // First, the existing chat report needs updated with the details about the new IOU
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

                    // Second, the IOU report needs updated with the new IOU details too
                    const iouReportKey = `${ONYXKEYS.COLLECTION.REPORT_IOUS}${reportData.reportID}`;
                    iouReportsToUpdate[iouReportKey] = getSimplifiedIOUReport(reportData, chatReportID);
                }
            });

            // Now, merge the updated objects into our store
            Onyx.mergeCollection(ONYXKEYS.COLLECTION.REPORT, chatReportsToUpdate);
            return Onyx.mergeCollection(ONYXKEYS.COLLECTION.REPORT_IOUS, iouReportsToUpdate);
        })
        .catch(() => Onyx.merge(ONYXKEYS.IOU, {error: true}))
        .finally(() => Onyx.merge(ONYXKEYS.IOU, {loading: false, creatingIOUTransaction: false}));
}

/**
 * Creates IOUSplit Transaction
 * @param {Object} params
 * @param {Number} params.amount
 * @param {String} params.comment
 * @param {String} params.currency
 * @param {String} params.debtorEmail
 */
function createIOUTransaction(params) {
    Onyx.merge(ONYXKEYS.IOU, {loading: true, creatingIOUTransaction: true, error: false});
    API.CreateIOUTransaction(params)
        .then((data) => {
            getIOUReportsForNewTransaction([data]);
            Navigation.navigate(ROUTES.getReportRoute(data.chatReportID));
        });
}

/**
 * Creates IOUSplit Transaction
 * @param {Object} params
 * @param {Array} params.splits
 * @param {String} params.comment
 * @param {Number} params.amount
 * @param {String} params.currency
 */
function createIOUSplit(params) {
    Onyx.merge(ONYXKEYS.IOU, {loading: true, creatingIOUTransaction: true, error: false});

    let chatReportID;
    API.CreateChatReport({
        emailList: params.splits.map(participant => participant.email).join(','),
    })
        .then((data) => {
            chatReportID = data.reportID;
            return API.CreateIOUSplit({
                ...params,
                splits: JSON.stringify(params.splits),
                reportID: data.reportID,
            });
        })
        .then((data) => {
            // This data needs to go from this:
            // {reportIDList: [1, 2], chatReportIDList: [3, 4]}
            // to this:
            // [{reportID: 1, chatReportID: 3}, {reportID: 2, chatReportID: 4}]
            // in order for getIOUReportsForNewTransaction to know which IOU reports are associated with which
            // chat reports
            const reportParams = [];
            for (let i = 0; i < data.reportIDList.length; i++) {
                reportParams.push({
                    reportID: data.reportIDList[i],
                    chatReportID: data.chatReportIDList[i],
                });
            }
            getIOUReportsForNewTransaction(reportParams);
            Navigation.navigate(ROUTES.getReportRoute(chatReportID));
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
    API.RejectTransaction({
        reportID,
        transactionID,
        comment,
    })
        .then((response) => {
            if (response.jsonCode !== 200) {
                throw new Error(`${response.code} ${response.message}`);
            }

            const chatReport = response.reports[chatReportID];
            const iouReport = response.reports[reportID];
            syncChatAndIOUReports(chatReport, iouReport);
        })
        .catch(error => console.error(`Error rejecting transaction: ${error}`))
        .finally(() => {
            // setting as null deletes the tranactionID
            Onyx.merge(ONYXKEYS.TRANSACTIONS_BEING_REJECTED, {
                [transactionID]: null,
            });
        });
}

/**
 * Sets IOU'S selected currency
 *
 * @param {Object} params.selectedCurrencyCode
 */
function setSelectedCurrency({selectedCurrencyCode}) {
    Onyx.merge(ONYXKEYS.IOU, {selectedCurrencyCode});
}

/**
 * @private
 *
 * @param {Number} amount
 * @param {String} submitterPhoneNumber
 * @returns {String}
 */
function buildVenmoPaymentURL(amount, submitterPhoneNumber) {
    const note = 'For%20Expensify.cash%20request';
    return `venmo://paycharge?txn=pay&recipients=${submitterPhoneNumber}&amount=${(amount / 100)}&note=${note}`;
}

/**
 * @private
 *
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
 * @param {Number} params.reportID
 * @param {String} params.paymentMethodType - one of CONST.IOU.PAYMENT_TYPE
 * @param {Number} params.amount
 * @param {String} params.currency
 * @param {String} [params.submitterPhoneNumber] - used for Venmo
 * @param {String} [params.submitterPayPalMeAddress]
 */
function payIOUReport({
    chatReportID, reportID, paymentMethodType, amount, currency, submitterPhoneNumber, submitterPayPalMeAddress,
}) {
    Onyx.merge(ONYXKEYS.IOU, {loading: true, error: false});
    const payIOUPromise = paymentMethodType === CONST.IOU.PAYMENT_TYPE.EXPENSIFY
        ? API.PayWithWallet({reportID})
        : API.PayIOU({reportID, paymentMethodType});

    // Build the url for the user's platform of choice if they have
    // selected something other than a manual settlement or Expensify Wallet e.g. Venmo or PayPal.me
    let url;
    if (paymentMethodType === CONST.IOU.PAYMENT_TYPE.PAYPAL_ME) {
        url = buildPayPalPaymentUrl(amount, submitterPayPalMeAddress, currency);
    }
    if (paymentMethodType === CONST.IOU.PAYMENT_TYPE.VENMO) {
        url = buildVenmoPaymentURL(amount, submitterPhoneNumber);
    }

    asyncOpenURL(payIOUPromise
        .then((response) => {
            if (response.jsonCode !== 200) {
                throw new Error(response.message);
            }

            const chatReportStuff = response.reports[chatReportID];
            const iouReportStuff = response.reports[reportID];
            syncChatAndIOUReports(chatReportStuff, iouReportStuff);
        })
        .catch((error) => {
            switch (error.message) {
                // eslint-disable-next-line max-len
                case 'You cannot pay via Expensify Wallet until you have either a verified deposit bank account or debit card.':
                    Growl.error(translateLocal('bankAccount.error.noDefaultDepositAccountOrDebitCardAvailable'), 5000);
                    break;
                case 'This report doesn\'t have reimbursable expenses.':
                    Growl.error(translateLocal('iou.noReimbursableExpenses'), 5000);
                    break;
                default:
                    Growl.error(error.message, 5000);
            }
            Onyx.merge(ONYXKEYS.IOU, {error: true});
        })
        .finally(() => Onyx.merge(ONYXKEYS.IOU, {loading: false})),
    url);
}

export {
    createIOUTransaction,
    createIOUSplit,
    rejectTransaction,
    payIOUReport,
    setSelectedCurrency,
};
