import type {IOUAction, IOUType} from '@src/CONST';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {OnyxInputOrEntry, Report, Transaction} from '@src/types/onyx';
import type {IOURequestType} from './actions/IOU';
import * as CurrencyUtils from './CurrencyUtils';
import Navigation from './Navigation/Navigation';
import * as TransactionUtils from './TransactionUtils';

function navigateToStartMoneyRequestStep(requestType: IOURequestType, iouType: IOUType, transactionID: string, reportID: string, iouAction?: IOUAction): void {
    if (iouAction === CONST.IOU.ACTION.CATEGORIZE || iouAction === CONST.IOU.ACTION.SUBMIT || iouAction === CONST.IOU.ACTION.SHARE) {
        Navigation.goBack();
        return;
    }
    // If the participants were automatically added to the transaction, then the user needs taken back to the starting step
    switch (requestType) {
        case CONST.IOU.REQUEST_TYPE.DISTANCE:
            Navigation.goBack(ROUTES.MONEY_REQUEST_CREATE_TAB_DISTANCE.getRoute(CONST.IOU.ACTION.CREATE, iouType, transactionID, reportID));
            break;
        case CONST.IOU.REQUEST_TYPE.SCAN:
            Navigation.goBack(ROUTES.MONEY_REQUEST_CREATE_TAB_SCAN.getRoute(CONST.IOU.ACTION.CREATE, iouType, transactionID, reportID));
            break;
        default:
            Navigation.goBack(ROUTES.MONEY_REQUEST_CREATE_TAB_MANUAL.getRoute(CONST.IOU.ACTION.CREATE, iouType, transactionID, reportID));
            break;
    }
}

/**
 * Calculates the amount per user given a list of participants
 *
 * @param numberOfParticipants - Number of participants in the chat. It should not include the current user.
 * @param total - IOU total amount in backend format (cents, no matter the currency)
 * @param currency - This is used to know how many decimal places are valid to use when splitting the total
 * @param isDefaultUser - Whether we are calculating the amount for the current user
 */
function calculateAmount(numberOfParticipants: number, total: number, currency: string, isDefaultUser = false): number {
    // Since the backend can maximum store 2 decimal places, any currency with more than 2 decimals
    // has to be capped to 2 decimal places
    const currencyUnit = Math.min(100, CurrencyUtils.getCurrencyUnit(currency));
    const totalInCurrencySubunit = Math.round((total / 100) * currencyUnit);
    const totalParticipants = numberOfParticipants + 1;
    const amountPerPerson = Math.round(totalInCurrencySubunit / totalParticipants);
    let finalAmount = amountPerPerson;
    if (isDefaultUser) {
        const sumAmount = amountPerPerson * totalParticipants;
        const difference = totalInCurrencySubunit - sumAmount;
        finalAmount = totalInCurrencySubunit !== sumAmount ? amountPerPerson + difference : amountPerPerson;
    }
    return Math.round((finalAmount * 100) / currencyUnit);
}

/**
 * The owner of the IOU report is the account who is owed money and the manager is the one who owes money!
 * In case the owner/manager swap, we need to update the owner of the IOU report and the report total, since it is always positive.
 * For example: if user1 owes user2 $10, then we have: {ownerAccountID: user2, managerID: user1, total: $10 (a positive amount, owed to user2)}
 * If user1 requests $17 from user2, then we have: {ownerAccountID: user1, managerID: user2, total: $7 (still a positive amount, but now owed to user1)}
 *
 * @param isDeleting - whether the user is deleting the expense
 * @param isUpdating - whether the user is updating the expense
 */
function updateIOUOwnerAndTotal<TReport extends OnyxInputOrEntry<Report>>(
    iouReport: TReport,
    actorAccountID: number,
    amount: number,
    currency: string,
    isDeleting = false,
    isUpdating = false,
): TReport {
    // For the update case, we have calculated the diff amount in the calculateDiffAmount function so there is no need to compare currencies here
    if ((currency !== iouReport?.currency && !isUpdating) || !iouReport) {
        return iouReport;
    }

    // Make a copy so we don't mutate the original object
    const iouReportUpdate = {...iouReport};

    // Let us ensure a valid value before updating the total amount.
    iouReportUpdate.total = iouReportUpdate.total ?? 0;

    if (actorAccountID === iouReport.ownerAccountID) {
        iouReportUpdate.total += isDeleting ? -amount : amount;
    } else {
        iouReportUpdate.total += isDeleting ? amount : -amount;
    }

    if (iouReportUpdate.total < 0) {
        // The total sign has changed and hence we need to flip the manager and owner of the report.
        iouReportUpdate.ownerAccountID = iouReport.managerID;
        iouReportUpdate.managerID = iouReport.ownerAccountID;
        iouReportUpdate.total = -iouReportUpdate.total;
    }

    return iouReportUpdate;
}

/**
 * Returns whether or not an IOU report contains expenses in a different currency
 * that are either created or cancelled offline, and thus haven't been converted to the report's currency yet
 */
function isIOUReportPendingCurrencyConversion(iouReport: Report): boolean {
    const reportTransactions: Transaction[] = TransactionUtils.getAllReportTransactions(iouReport.reportID);
    const pendingRequestsInDifferentCurrency = reportTransactions.filter((transaction) => transaction.pendingAction && TransactionUtils.getCurrency(transaction) !== iouReport.currency);
    return pendingRequestsInDifferentCurrency.length > 0;
}

/**
 * Checks if the iou type is one of request, send, invoice or split.
 */
function isValidMoneyRequestType(iouType: string): boolean {
    const moneyRequestType: string[] = [
        CONST.IOU.TYPE.REQUEST,
        CONST.IOU.TYPE.SUBMIT,
        CONST.IOU.TYPE.SPLIT,
        CONST.IOU.TYPE.SEND,
        CONST.IOU.TYPE.PAY,
        CONST.IOU.TYPE.TRACK,
        CONST.IOU.TYPE.INVOICE,
        CONST.IOU.TYPE.CREATE,
    ];

    return moneyRequestType.includes(iouType);
}

/**
 * Inserts a newly selected tag into the already existing tags like a string
 *
 * @param transactionTags - currently selected tags for a report
 * @param tag - a newly selected tag, that should be added to the transactionTags
 * @param tagIndex - the index of a tag list
 * @returns
 */
function insertTagIntoTransactionTagsString(transactionTags: string, tag: string, tagIndex: number): string {
    const tagArray = TransactionUtils.getTagArrayFromName(transactionTags);
    tagArray[tagIndex] = tag;

    while (tagArray.length > 0 && !tagArray.at(-1)) {
        tagArray.pop();
    }

    return tagArray.map((tagItem) => tagItem.trim()).join(CONST.COLON);
}

function isMovingTransactionFromTrackExpense(action?: IOUAction) {
    if (action === CONST.IOU.ACTION.SUBMIT || action === CONST.IOU.ACTION.SHARE || action === CONST.IOU.ACTION.CATEGORIZE) {
        return true;
    }

    return false;
}

function shouldUseTransactionDraft(action: IOUAction | undefined) {
    return action === CONST.IOU.ACTION.CREATE || isMovingTransactionFromTrackExpense(action);
}

export {
    calculateAmount,
    insertTagIntoTransactionTagsString,
    isIOUReportPendingCurrencyConversion,
    isMovingTransactionFromTrackExpense,
    shouldUseTransactionDraft,
    isValidMoneyRequestType,
    navigateToStartMoneyRequestStep,
    updateIOUOwnerAndTotal,
};
