import _ from 'underscore';
import lodashGet from 'lodash/get';
import CONST from '../CONST';

/**
 * Calculates the amount per user given a list of participants
 *
 * @param {Array} participants - List of logins for the participants in the chat. It should not include the current user's login.
 * @param {Number} total - IOU total amount in the smallest units of the currency
 * @param {Boolean} isDefaultUser - Whether we are calculating the amount for the current user
 * @returns {Number}
 */
function calculateAmount(participants, total, isDefaultUser = false) {
    const totalParticipants = participants.length + 1;
    const amountPerPerson = Math.round(total / totalParticipants);
    let finalAmount = amountPerPerson;
    if (isDefaultUser) {
        const sumAmount = amountPerPerson * totalParticipants;
        const difference = total - sumAmount;
        finalAmount = total !== sumAmount ? amountPerPerson + difference : amountPerPerson;
    }
    return finalAmount;
}

/**
 * The owner of the IOU report is the account who is owed money and the manager is the one who owes money!
 * In case the owner/manager swap, we need to update the owner of the IOU report and the report total, since it is always positive.
 * For example: if user1 owes user2 $10, then we have: {ownerEmail: user2, managerEmail: user1, total: $10 (a positive amount, owed to user2)}
 * If user1 requests $17 from user2, then we have: {ownerEmail: user1, managerEmail: user2, total: $7 (still a positive amount, but now owed to user1)}
 *
 * @param {Object} iouReport
 * @param {String} actorEmail
 * @param {Number} amount
 * @param {String} currency
 * @param {String} type
 * @returns {Object}
 */
function updateIOUOwnerAndTotal(iouReport, actorEmail, amount, currency, type = CONST.IOU.REPORT_ACTION_TYPE.CREATE) {
    if (currency !== iouReport.currency) {
        return iouReport;
    }

    // Make a copy so we don't mutate the original object
    const iouReportUpdate = {...iouReport};

    if (actorEmail === iouReport.ownerEmail) {
        iouReportUpdate.total += type === CONST.IOU.REPORT_ACTION_TYPE.DELETE ? -amount : amount;
    } else {
        iouReportUpdate.total += type === CONST.IOU.REPORT_ACTION_TYPE.DELETE ? amount : -amount;
    }

    if (iouReportUpdate.total < 0) {
        // The total sign has changed and hence we need to flip the manager and owner of the report.
        iouReportUpdate.ownerEmail = iouReport.managerEmail;
        iouReportUpdate.managerEmail = iouReport.ownerEmail;
        iouReportUpdate.total = -iouReportUpdate.total;
    }

    iouReportUpdate.hasOutstandingIOU = iouReportUpdate.total !== 0;

    return iouReportUpdate;
}

/**
 * Returns the list of IOU actions depending on the type and whether or not they are pending.
 * Used below so that we can decide if an IOU report is pending currency conversion.
 *
 * @param {Array} reportActions
 * @param {Object} iouReport
 * @param {String} type - iouReportAction type. Can be oneOf(create, delete, pay, split)
 * @param {String} pendingAction
 * @param {Boolean} filterRequestsInDifferentCurrency
 *
 * @returns {Array}
 */
function getIOUReportActions(reportActions, iouReport, type = '', pendingAction = '', filterRequestsInDifferentCurrency = false) {
    return _.chain(reportActions)
        .filter((action) => action.originalMessage && action.actionName === CONST.REPORT.ACTIONS.TYPE.IOU && (!_.isEmpty(type) ? action.originalMessage.type === type : true))
        .filter((action) => action.originalMessage.IOUReportID.toString() === iouReport.reportID.toString())
        .filter((action) => (!_.isEmpty(pendingAction) ? action.pendingAction === pendingAction : true))
        .filter((action) => (filterRequestsInDifferentCurrency ? action.originalMessage.currency !== iouReport.currency : true))
        .value();
}

/**
 * Returns whether or not an IOU report contains money requests in a different currency
 * that are either created or cancelled offline, and thus haven't been converted to the report's currency yet
 *
 * @param {Array} reportActions
 * @param {Object} iouReport
 *
 * @returns {Boolean}
 */
function isIOUReportPendingCurrencyConversion(reportActions, iouReport) {
    // Pending money requests that are in a different currency
    const pendingRequestsInDifferentCurrency = _.chain(getIOUReportActions(reportActions, iouReport, CONST.IOU.REPORT_ACTION_TYPE.CREATE, CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD, true))
        .map((action) => action.originalMessage.IOUTransactionID)
        .sort()
        .value();

    // Pending deleted money requests that are in a different currency
    const pendingDeletedRequestsInDifferentCurrency = _.chain(
        getIOUReportActions(reportActions, iouReport, CONST.IOU.REPORT_ACTION_TYPE.DELETE, CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD, true),
    )
        .map((action) => action.originalMessage.IOUTransactionID)
        .sort()
        .value();

    const hasPendingRequests = Boolean(pendingRequestsInDifferentCurrency.length || pendingDeletedRequestsInDifferentCurrency.length);

    // If we have pending money requests made offline, check if all of them have been cancelled offline
    // In order to do that, we can grab transactionIDs of all the created and cancelled money requests and check if they're identical
    if (hasPendingRequests && _.isEqual(pendingRequestsInDifferentCurrency, pendingDeletedRequestsInDifferentCurrency)) {
        return false;
    }

    // Not all requests made offline had been cancelled,
    // simply return if we have any pending created or cancelled requests
    return hasPendingRequests;
}

/**
 * Builds and returns the deletableTransactionIDs array. A transaction must meet multiple requirements in order
 * to be deletable. We must exclude transactions not associated with the iouReportID, actions which have already
 * been deleted, those which are not of type 'create', and those with errors.
 *
 * @param {Object[]} reportActions
 * @param {String} iouReportID
 * @param {String} userEmail
 * @param {Boolean} isIOUSettled
 * @returns {Array}
 */
function getDeletableTransactions(reportActions, iouReportID, userEmail, isIOUSettled = false) {
    if (isIOUSettled) {
        return [];
    }

    // iouReportIDs should be strings, but we still have places that send them as ints so we convert them both to Numbers for comparison
    const actionsForIOUReport = _.filter(
        reportActions,
        (action) => action.originalMessage && action.originalMessage.type && Number(action.originalMessage.IOUReportID) === Number(iouReportID),
    );

    const deletedTransactionIDs = _.chain(actionsForIOUReport)
        .filter((action) => _.contains([CONST.IOU.REPORT_ACTION_TYPE.CANCEL, CONST.IOU.REPORT_ACTION_TYPE.DECLINE, CONST.IOU.REPORT_ACTION_TYPE.DELETE], action.originalMessage.type))
        .map((deletedAction) => lodashGet(deletedAction, 'originalMessage.IOUTransactionID', ''))
        .compact()
        .value();

    return _.chain(actionsForIOUReport)
        .filter((action) => action.originalMessage.type === CONST.IOU.REPORT_ACTION_TYPE.CREATE)
        .filter((action) => !_.contains(deletedTransactionIDs, action.originalMessage.IOUTransactionID))
        .filter((action) => userEmail === action.actorEmail)
        .filter((action) => _.isEmpty(action.errors))
        .map((action) => lodashGet(action, 'originalMessage.IOUTransactionID', ''))
        .compact()
        .value();
}

export {calculateAmount, updateIOUOwnerAndTotal, getIOUReportActions, isIOUReportPendingCurrencyConversion, getDeletableTransactions};
