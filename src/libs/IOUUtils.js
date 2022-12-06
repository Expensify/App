import _ from 'underscore';
import CONST from '../CONST';

/**
 * Calculates the amount per user given a list of participants
 * @param {Array} participants - List of logins for the participants in the chat. It should not include the current user's login.
 * @param {Number} total - IOU total amount
 * @param {Boolean} isDefaultUser - Whether we are calculating the amount for the current user
 * @returns {Number}
 */
function calculateAmount(participants, total, isDefaultUser = false) {
    // Convert to cents before working with iouAmount to avoid
    // javascript subtraction with decimal problem -- when dealing with decimals,
    // because they are encoded as IEEE 754 floating point numbers, some of the decimal
    // numbers cannot be represented with perfect accuracy.
    // Cents is temporary and there must be support for other currencies in the future
    const iouAmount = Math.round(parseFloat(total * 100));
    const totalParticipants = participants.length + 1;
    const amountPerPerson = Math.round(iouAmount / totalParticipants);

    if (!isDefaultUser) {
        return amountPerPerson;
    }

    const sumAmount = amountPerPerson * totalParticipants;
    const difference = iouAmount - sumAmount;

    return iouAmount !== sumAmount ? (amountPerPerson + difference) : amountPerPerson;
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

    const iouReportUpdate = {...iouReport};

    if (actorEmail === iouReport.ownerEmail) {
        iouReportUpdate.total += type === CONST.IOU.REPORT_ACTION_TYPE.CANCEL ? -amount : amount;
    } else {
        iouReportUpdate.total += type === CONST.IOU.REPORT_ACTION_TYPE.CANCEL ? amount : -amount;
    }

    if (iouReportUpdate.total < 0) {
        // The total sign has changed and hence we need to flip the manager and owner of the report.
        iouReportUpdate.ownerEmail = iouReport.managerEmail;
        iouReportUpdate.managerEmail = iouReport.ownerEmail;
        iouReportUpdate.total = -iouReportUpdate.total;
    }

    return iouReportUpdate;
}

/**
 * Returns the list of IOU actions depnding on the type and whehter or not they are pending.
 * Used below so that we can decide if an IOU report is pending currency conversion.
 *
 * @param {Array} reportIOUActions
 * @param {Object} iouReport
 * @param {String} type - iouReportAction type. Can be oneOf(create, decline, cancel, pay, split)
 * @param {String} pendingAction
 * @param {Boolean} filterRequestsInDifferentCurrency
 *
 * @returns {Array}
 */
function getIOUReportActions(reportIOUActions, iouReport, type, pendingAction = '', filterRequestsInDifferentCurrency = false) {
    return _.chain(reportIOUActions)
        .filter(action => action.originalMessage
            && action.originalMessage.IOUReportID.toString() === iouReport.reportID.toString()
            && action.originalMessage.type === type)
        .filter(action => (!_.isEmpty(pendingAction) ? action.pendingAction === pendingAction : true))
        .filter(action => (filterRequestsInDifferentCurrency ? action.originalMessage.currency !== iouReport.currency : true))
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
    const pendingRequestsInDifferentCurrency = _.chain(getIOUReportActions(
        reportActions,
        iouReport,
        CONST.IOU.REPORT_ACTION_TYPE.CREATE,
        CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        true,
    )).value();

    // Pending cancelled money requests that are in a different currency
    const pendingCancelledRequestsInDifferentCurrency = _.chain(getIOUReportActions(
        reportActions,
        iouReport,
        CONST.IOU.REPORT_ACTION_TYPE.CANCEL,
        CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD,
        true,
    )).value();

    // If the count of the pending requests in different currency plus the count of cancelled ones is even,
    // then all of the requests have been cancelled and the report is not waiting for conversion in the backend
    return (pendingRequestsInDifferentCurrency.length + pendingCancelledRequestsInDifferentCurrency.length) % 2 !== 0;
}

export {
    calculateAmount,
    updateIOUOwnerAndTotal,
    getIOUReportActions,
    isIOUReportPendingCurrencyConversion,
};
