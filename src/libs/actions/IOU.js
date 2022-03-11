import Onyx from 'react-native-onyx';
import _ from 'underscore';
import CONST from '../../CONST';
import ONYXKEYS from '../../ONYXKEYS';
import ROUTES from '../../ROUTES';
import * as API from '../API';
import * as Report from './Report';
import Navigation from '../Navigation/Navigation';
import Growl from '../Growl';
import * as Localize from '../Localize';
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
                    iouReportsToUpdate[iouReportKey] = Report.getSimplifiedIOUReport(reportData, chatReportID);
                }
            });

            // Now, merge the updated objects into our store
            Onyx.mergeCollection(ONYXKEYS.COLLECTION.REPORT, chatReportsToUpdate);
            return Onyx.mergeCollection(ONYXKEYS.COLLECTION.REPORT_IOUS, iouReportsToUpdate);
        })
        .finally(() => Onyx.merge(ONYXKEYS.IOU, {loading: false, creatingIOUTransaction: false}));
}

/**
 *  Returns IOU Transaction Error Messages
 * @param {Object} response
 */

function getIOUErrorMessage(response) {
    if (response && response.jsonCode) {
        if (response.jsonCode === 405) {
            return Localize.translateLocal('common.error.invalidAmount');
        } if (response.jsonCode === 404) {
            return Localize.translateLocal('iou.error.invalidSplit');
        }
    }
    return Localize.translateLocal('iou.error.other');
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
        .then((response) => {
            if (response.jsonCode === 200) {
                getIOUReportsForNewTransaction([response]);
                Navigation.navigate(ROUTES.getReportRoute(response.chatReportID));
                return;
            }

            Onyx.merge(ONYXKEYS.IOU, {
                loading: false,
                creatingIOUTransaction: false,
                error: true,
            });
            Growl.error(getIOUErrorMessage(response));
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
        emailList: _.map(params.splits, participant => participant.email).join(','),
    })
        .then((response) => {
            chatReportID = response.reportID;
            return API.CreateIOUSplit({
                ...params,
                splits: JSON.stringify(params.splits),
                reportID: response.reportID,
            });
        })
        .then((response) => {
            if (response.jsonCode === 200) {
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
                return;
            }

            Onyx.merge(ONYXKEYS.IOU, {
                loading: false,
                creatingIOUTransaction: false,
                error: true,
            });
            Growl.error(getIOUErrorMessage(response));
        });
}

/**
 * Creates IOUSplit Transaction for Group DM
 * @param {Object} params
 * @param {Array} params.splits
 * @param {String} params.comment
 * @param {Number} params.amount
 * @param {String} params.currency
 * @param {String} params.reportID
 */
function createIOUSplitGroup(params) {
    Onyx.merge(ONYXKEYS.IOU, {loading: true, creatingIOUTransaction: true, error: false});

    API.CreateIOUSplit({
        ...params,
        splits: JSON.stringify(params.splits),
    })
        .then(() => Onyx.merge(ONYXKEYS.IOU, {loading: false, creatingIOUTransaction: false}));
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
                return;
            }

            const chatReport = response.reports[chatReportID];
            const iouReport = response.reports[reportID];
            Report.syncChatAndIOUReports(chatReport, iouReport);
        })
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
 * @param {String} selectedCurrencyCode
 */
function setIOUSelectedCurrency(selectedCurrencyCode) {
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
    const note = encodeURIComponent('For New Expensify request');
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
 * @param {String} [params.requestorPhoneNumber] - used for Venmo
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
    requestorPhoneNumber,
    requestorPayPalMeAddress,
    newIOUReportDetails,
}) {
    Onyx.merge(ONYXKEYS.IOU, {loading: true, error: false});

    const payIOUPromise = paymentMethodType === CONST.IOU.PAYMENT_TYPE.EXPENSIFY
        ? API.PayWithWallet({reportID, newIOUReportDetails})
        : API.PayIOU({reportID, paymentMethodType, newIOUReportDetails});

    // Build the url for the user's platform of choice if they have
    // selected something other than a manual settlement or Expensify Wallet e.g. Venmo or PayPal.me
    let url;
    if (paymentMethodType === CONST.IOU.PAYMENT_TYPE.PAYPAL_ME) {
        url = buildPayPalPaymentUrl(amount, requestorPayPalMeAddress, currency);
    }
    if (paymentMethodType === CONST.IOU.PAYMENT_TYPE.VENMO) {
        url = buildVenmoPaymentURL(amount, requestorPhoneNumber);
    }

    const promiseWithHandlers = payIOUPromise
        .then((response) => {
            if (response.jsonCode !== 200) {
                switch (response.message) {
                    // eslint-disable-next-line max-len
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
    createIOUTransaction,
    createIOUSplit,
    createIOUSplitGroup,
    rejectTransaction,
    payIOUReport,
    setIOUSelectedCurrency,
};
