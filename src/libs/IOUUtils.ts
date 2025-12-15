import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import type {IOUAction, IOUType} from '@src/CONST';
import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import ROUTES from '@src/ROUTES';
import type {OnyxInputOrEntry, PersonalDetails, Policy, Report, Transaction} from '@src/types/onyx';
import type {Attendee} from '@src/types/onyx/IOU';
import SafeString from '@src/utils/SafeString';
import type {IOURequestType} from './actions/IOU';
import {getCurrencyUnit} from './CurrencyUtils';
import Navigation from './Navigation/Navigation';
import Performance from './Performance';
import {isPaidGroupPolicy} from './PolicyUtils';
import {getReportTransactions, isExpenseReport} from './ReportUtils';
import {getAmount, getCurrency, getTagArrayFromName, isOnHold} from './TransactionUtils';

function navigateToStartMoneyRequestStep(requestType: IOURequestType, iouType: IOUType, transactionID: string, reportID: string, iouAction?: IOUAction): void {
    if (iouAction === CONST.IOU.ACTION.CATEGORIZE || iouAction === CONST.IOU.ACTION.SUBMIT || iouAction === CONST.IOU.ACTION.SHARE) {
        Navigation.goBack();
        return;
    }
    // If the participants were automatically added to the transaction, then the user needs taken back to the starting step
    switch (requestType) {
        case CONST.IOU.REQUEST_TYPE.DISTANCE:
            Navigation.goBack(ROUTES.MONEY_REQUEST_CREATE_TAB_DISTANCE.getRoute(CONST.IOU.ACTION.CREATE, iouType, transactionID, reportID), {compareParams: false});
            break;
        case CONST.IOU.REQUEST_TYPE.DISTANCE_MAP:
            Navigation.goBack(ROUTES.DISTANCE_REQUEST_CREATE_TAB_MAP.getRoute(CONST.IOU.ACTION.CREATE, iouType, transactionID, reportID), {compareParams: false});
            break;
        case CONST.IOU.REQUEST_TYPE.DISTANCE_MANUAL:
            Navigation.goBack(ROUTES.DISTANCE_REQUEST_CREATE_TAB_MANUAL.getRoute(CONST.IOU.ACTION.CREATE, iouType, transactionID, reportID), {compareParams: false});
            break;
        case CONST.IOU.REQUEST_TYPE.SCAN:
            Navigation.goBack(ROUTES.MONEY_REQUEST_CREATE_TAB_SCAN.getRoute(CONST.IOU.ACTION.CREATE, iouType, transactionID, reportID), {compareParams: false});
            break;
        default:
            Navigation.goBack(ROUTES.MONEY_REQUEST_CREATE_TAB_MANUAL.getRoute(CONST.IOU.ACTION.CREATE, iouType, transactionID, reportID), {compareParams: false});
            break;
    }
}

function navigateToParticipantPage(iouType: ValueOf<typeof CONST.IOU.TYPE>, transactionID: string, reportID: string) {
    Performance.markStart(CONST.TIMING.OPEN_CREATE_EXPENSE_CONTACT);
    switch (iouType) {
        case CONST.IOU.TYPE.REQUEST:
            Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_PARTICIPANTS.getRoute(CONST.IOU.TYPE.SUBMIT, transactionID, reportID));
            break;
        case CONST.IOU.TYPE.SEND:
            Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_PARTICIPANTS.getRoute(CONST.IOU.TYPE.PAY, transactionID, reportID));
            break;
        default:
            Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_PARTICIPANTS.getRoute(iouType, transactionID, reportID));
    }
}

/**
 * Calculates the amount per split.
 *
 * @param numberOfSplits - Number of splits EXCLUDING the remainder holder ("default user").
 * @param total - IOU total amount in backend format (cents, no matter the currency)
 * @param currency - Used to know how many decimal places are valid when splitting the total
 * @param isDefaultUser - Whether we are calculating the amount for the remainder holder
 * @param useFloorToLastRounding - `false` (default, legacy behavior) or `true` to floor all and put full remainder on the default user
 */
function calculateAmount(numberOfSplits: number, total: number, currency: string, isDefaultUser = false, useFloorToLastRounding = false): number {
    // Since the backend can maximum store 2 decimal places, any currency with more than 2 decimals
    // has to be capped to 2 decimal places
    const currencyUnit = Math.min(100, getCurrencyUnit(currency));
    const totalInCurrencySubunit = (total / 100) * currencyUnit;
    const totalParticipants = numberOfSplits + 1;

    // New optional mode
    if (useFloorToLastRounding) {
        // For positive totals, floor for everyone and add the full remainder to the default user
        // For negative totals, do the inverse of above and round up using Math.ceil to calculate the base share
        const baseShareSubunit = totalInCurrencySubunit >= 0 ? Math.floor(totalInCurrencySubunit / totalParticipants) : Math.ceil(totalInCurrencySubunit / totalParticipants);
        const remainderSubunit = totalInCurrencySubunit - baseShareSubunit * totalParticipants;

        const subunitAmount = baseShareSubunit + (isDefaultUser ? remainderSubunit : 0);
        return Math.round((subunitAmount * 100) / currencyUnit);
    }

    // Legacy behavior (backwards compatible): round equally and adjust default user by +/- difference
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
    isTransactionOnHold = false,
    unHeldAmount = amount,
): TReport {
    // For the update case, we have calculated the diff amount in the calculateDiffAmount function so there is no need to compare currencies here
    if ((currency !== iouReport?.currency && !isUpdating) || !iouReport) {
        return iouReport;
    }

    // Make a copy so we don't mutate the original object
    const iouReportUpdate = {...iouReport};

    // Let us ensure a valid value before updating the total amount.
    iouReportUpdate.total = iouReportUpdate.total ?? 0;
    iouReportUpdate.unheldTotal = iouReportUpdate.unheldTotal ?? 0;

    if (actorAccountID === iouReport.ownerAccountID) {
        iouReportUpdate.total += isDeleting ? -amount : amount;
        if (!isTransactionOnHold) {
            iouReportUpdate.unheldTotal += isDeleting ? -unHeldAmount : unHeldAmount;
        }
    } else {
        iouReportUpdate.total += isDeleting ? amount : -amount;
        if (!isTransactionOnHold) {
            iouReportUpdate.unheldTotal += isDeleting ? unHeldAmount : -unHeldAmount;
        }
    }

    if (iouReportUpdate.total < 0) {
        // The total sign has changed and hence we need to flip the manager and owner of the report.
        iouReportUpdate.ownerAccountID = iouReport.managerID;
        iouReportUpdate.managerID = iouReport.ownerAccountID;
        iouReportUpdate.total = -iouReportUpdate.total;
        iouReportUpdate.unheldTotal = -iouReportUpdate.unheldTotal;
    }

    return iouReportUpdate;
}

/**
 * Returns whether or not an IOU report contains expenses in a different currency
 * that are either created or cancelled offline, and thus haven't been converted to the report's currency yet
 */
function isIOUReportPendingCurrencyConversion(iouReport: Report): boolean {
    const reportTransactions = getReportTransactions(iouReport.reportID);
    const pendingRequestsInDifferentCurrency = reportTransactions.filter((transaction) => transaction.pendingAction && getCurrency(transaction) !== iouReport.currency);
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
        CONST.IOU.TYPE.SPLIT_EXPENSE,
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
 * @param hasMultipleTagLists - whether the policy has multiple levels tag
 * @returns
 */
function insertTagIntoTransactionTagsString(transactionTags: string, tag: string, tagIndex: number, hasMultipleTagLists: boolean): string {
    if (!hasMultipleTagLists) {
        return tag;
    }

    const tagArray = getTagArrayFromName(transactionTags);
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

function shouldShowReceiptEmptyState(iouType: IOUType, action: IOUAction, policy: OnyxInputOrEntry<Policy>, isPerDiemRequest: boolean) {
    // Determine when to show the receipt empty state:
    // - Show for pay, submit or track expense types
    // - Hide for per diem requests
    // - Hide when submitting a track expense to a non-paid group policy (personal users)
    return (
        (iouType === CONST.IOU.TYPE.SUBMIT || iouType === CONST.IOU.TYPE.TRACK || iouType === CONST.IOU.TYPE.PAY) &&
        !isPerDiemRequest &&
        (!isMovingTransactionFromTrackExpense(action) || isPaidGroupPolicy(policy))
    );
}

function shouldUseTransactionDraft(action: IOUAction | undefined, type?: IOUType) {
    return action === CONST.IOU.ACTION.CREATE || type === CONST.IOU.TYPE.SPLIT_EXPENSE || isMovingTransactionFromTrackExpense(action);
}

function formatCurrentUserToAttendee(currentUser?: PersonalDetails, reportID?: string) {
    if (!currentUser) {
        return;
    }
    const initialAttendee: Attendee = {
        email: currentUser?.login ?? '',
        login: currentUser?.login ?? '',
        displayName: currentUser.displayName ?? '',
        avatarUrl: SafeString(currentUser.avatar),
        accountID: currentUser.accountID,
        text: currentUser.login,
        selected: true,
        reportID,
    };

    return [initialAttendee];
}

type DuplicateTransactionTotals = {
    /** Total amount of all transactions */
    total: number;
    /** Total amount of transactions that are not on hold */
    unheldTotal: number;
    /** Total amount of non-reimbursable transactions that are not on hold */
    unheldNonReimbursableTotal: number;
};

/**
 * Calculates the total amounts for a list of duplicate transactions.
 * Used when merging or resolving duplicates to update report totals.
 *
 * @param transactionIDList - List of transaction IDs to calculate totals for
 * @param report - The report the transactions belong to
 * @param allTransactions - Collection of all transactions from Onyx
 * @param options - Options for calculation
 * @param options.includeHeldTransactions - Whether to include held transactions in the total calculation (default: true)
 * @returns Object containing total, unheldTotal, and unheldNonReimbursableTotal
 */
function calculateDuplicateTransactionsTotals(
    transactionIDList: string[],
    report: OnyxEntry<Report>,
    allTransactions: OnyxCollection<Transaction>,
    options: {includeHeldTransactions?: boolean} = {},
): DuplicateTransactionTotals {
    const {includeHeldTransactions = true} = options;
    const isExpenseReportLocal = isExpenseReport(report);
    const coefficient = isExpenseReportLocal ? -1 : 1;

    let total = 0;
    let unheldTotal = 0;
    let unheldNonReimbursableTotal = 0;

    for (const transactionID of transactionIDList) {
        const transaction = allTransactions?.[`${ONYXKEYS.COLLECTION.TRANSACTION}${transactionID}`];

        // Skip if transaction doesn't exist or has different currency than the report
        if (!transaction || transaction.currency !== report?.currency) {
            continue;
        }

        const isTransactionOnHold = isOnHold(transaction);

        // Skip held transactions if we're not including them in totals (e.g., resolveDuplicates)
        if (!includeHeldTransactions && isTransactionOnHold) {
            continue;
        }

        const transactionAmount = getAmount(transaction, isExpenseReportLocal) * coefficient;

        // Always add to total (for mergeDuplicates where transactions are deleted)
        if (includeHeldTransactions) {
            total += transactionAmount;
        }

        // Only add to unheld totals if transaction is not on hold
        if (!isTransactionOnHold) {
            unheldTotal += transactionAmount;

            if (!transaction.reimbursable) {
                unheldNonReimbursableTotal += transactionAmount;
            }
        }
    }

    return {total, unheldTotal, unheldNonReimbursableTotal};
}

export type {DuplicateTransactionTotals};

export {
    calculateAmount,
    calculateDuplicateTransactionsTotals,
    insertTagIntoTransactionTagsString,
    isIOUReportPendingCurrencyConversion,
    isMovingTransactionFromTrackExpense,
    shouldUseTransactionDraft,
    isValidMoneyRequestType,
    navigateToStartMoneyRequestStep,
    updateIOUOwnerAndTotal,
    formatCurrentUserToAttendee,
    navigateToParticipantPage,
    shouldShowReceiptEmptyState,
};
