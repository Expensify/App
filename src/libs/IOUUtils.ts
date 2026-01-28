import type {ValueOf} from 'type-fest';
import type {IOUAction, IOUType} from '@src/CONST';
import CONST from '@src/CONST';
import ROUTES from '@src/ROUTES';
import type {OnyxInputOrEntry, PersonalDetails, Policy, Report, ReportAction} from '@src/types/onyx';
import type {Attendee} from '@src/types/onyx/IOU';
import SafeString from '@src/utils/SafeString';
import type {IOURequestType} from './actions/IOU';
import {getCurrencyUnit} from './CurrencyUtils';
import Navigation from './Navigation/Navigation';
import Performance from './Performance';
import {isPaidGroupPolicy} from './PolicyUtils';
import {getOriginalMessage, isMoneyRequestAction} from './ReportActionsUtils';
import {getReportTransactions} from './ReportUtils';
import {getCurrency, getTagArrayFromName} from './TransactionUtils';

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
        case CONST.IOU.REQUEST_TYPE.DISTANCE_GPS:
            Navigation.goBack(ROUTES.DISTANCE_REQUEST_CREATE_TAB_GPS.getRoute(CONST.IOU.ACTION.CREATE, iouType, transactionID, reportID), {compareParams: false});
            break;
        case CONST.IOU.REQUEST_TYPE.DISTANCE_ODOMETER:
            Navigation.goBack(ROUTES.DISTANCE_REQUEST_CREATE_TAB_ODOMETER.getRoute(CONST.IOU.ACTION.CREATE, iouType, transactionID, reportID), {compareParams: false});
            break;
        case CONST.IOU.REQUEST_TYPE.SCAN:
            Navigation.goBack(ROUTES.MONEY_REQUEST_CREATE_TAB_SCAN.getRoute(CONST.IOU.ACTION.CREATE, iouType, transactionID, reportID), {compareParams: false});
            break;
        case CONST.IOU.REQUEST_TYPE.TIME:
            Navigation.goBack(ROUTES.MONEY_REQUEST_CREATE_TAB_TIME.getRoute(CONST.IOU.ACTION.CREATE, iouType, transactionID, reportID), {compareParams: false});
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
 * Calculate a split amount in backend cents from a percentage of the original amount.
 * - Clamps percentage to [0, 100]
 * - Preserves decimal precision in percentage (supports 0.1 precision)
 * - Preserves the sign of the original amount (negative amounts stay negative)
 */
function calculateSplitAmountFromPercentage(totalInCents: number, percentage: number): number {
    const totalAbs = Math.abs(totalInCents);
    // Clamp percentage to [0, 100] without rounding to preserve decimal precision
    const clamped = Math.min(100, Math.max(0, percentage));
    const amount = Math.round((totalAbs * clamped) / 100);
    // Return 0 for zero amounts to avoid -0
    if (amount === 0) {
        return 0;
    }
    return totalInCents < 0 ? -amount : amount;
}

/**
 * Given a list of split amounts (in backend cents) and the original total amount, calculate display percentages
 * for each split so that:
 * - Each row is a percentage of the original total with one decimal place (0.1 precision)
 * - Equal amounts ALWAYS have equal percentages
 * - The remainder needed to reach 100% goes to the last item (which should be the largest)
 * - When the sum of split amounts does not match the original total (over/under splits), percentages still reflect
 *   each amount as a percentage of the original total and may sum to something other than 100
 */
function calculateSplitPercentagesFromAmounts(amountsInCents: number[], totalInCents: number): number[] {
    const totalAbs = Math.abs(totalInCents);

    if (totalAbs <= 0 || amountsInCents.length === 0) {
        return amountsInCents.map(() => 0);
    }

    const amountsAbs = amountsInCents.map((amount) => Math.abs(amount ?? 0));

    // Helper functions for decimal precision
    const roundToOneDecimal = (value: number): number => Math.round(value * 10) / 10;
    const floorToOneDecimal = (value: number): number => Math.floor(value * 10) / 10;

    // ALWAYS use floored percentages to guarantee equal amounts get equal percentages
    const flooredPercentages = amountsAbs.map((amount) => (totalAbs > 0 ? floorToOneDecimal((amount / totalAbs) * 100) : 0));

    const amountsTotal = amountsAbs.reduce((sum, curr) => sum + curr, 0);

    // If the split amounts don't add up to the original total, return floored percentages as-is
    // (the sum may not be 100, but that's expected when there's a validation error)
    if (amountsTotal !== totalAbs) {
        return flooredPercentages;
    }

    // Calculate remainder and add it to the LAST item (which should be the largest in even splits)
    const sumOfFlooredPercentages = roundToOneDecimal(flooredPercentages.reduce((sum, current) => sum + current, 0));
    const remainder = roundToOneDecimal(100 - sumOfFlooredPercentages);

    if (remainder <= 0) {
        return flooredPercentages;
    }

    // Add remainder to the last item with the MAXIMUM amount (not just the last item since that can be a new split with 0 amount)
    // This ensures 0-amount splits stay at 0%
    const maxAmount = Math.max(...amountsAbs);
    let lastMaxIndex = amountsAbs.length - 1; // fallback to last
    for (let i = 0; i < amountsAbs.length; i += 1) {
        if (amountsAbs.at(i) === maxAmount) {
            lastMaxIndex = i;
        }
    }

    const adjustedPercentages = [...flooredPercentages];
    adjustedPercentages[lastMaxIndex] = roundToOneDecimal((adjustedPercentages.at(lastMaxIndex) ?? 0) + remainder);

    return adjustedPercentages;
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
    isOnHold = false,
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
        if (!isOnHold) {
            iouReportUpdate.unheldTotal += isDeleting ? -unHeldAmount : unHeldAmount;
        }
    } else {
        iouReportUpdate.total += isDeleting ? amount : -amount;
        if (!isOnHold) {
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

function navigateToConfirmationPage(
    iouType: IOUType,
    transactionID: string,
    reportID: string,
    backToReport: string | undefined,
    shouldNavigateToSubmit = false,
    reportIDParam: string | undefined = undefined,
    fromManualDistanceRequest = false,
) {
    switch (iouType) {
        case CONST.IOU.TYPE.REQUEST:
            Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.SUBMIT, transactionID, reportID, backToReport));
            break;
        case CONST.IOU.TYPE.SEND:
            if (fromManualDistanceRequest) {
                Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.CREATE, iouType, transactionID, reportID, backToReport));
            } else {
                Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.PAY, transactionID, reportID));
            }
            break;
        default:
            Navigation.navigate(
                ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(
                    CONST.IOU.ACTION.CREATE,
                    shouldNavigateToSubmit ? CONST.IOU.TYPE.SUBMIT : iouType,
                    transactionID,
                    // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                    reportIDParam || reportID,
                    backToReport,
                ),
            );
    }
}

/**
 * Get the existing transaction ID from a linked tracked expense report action.
 * This is used when moving a transaction from track expense to submit.
 */
function getExistingTransactionID(linkedTrackedExpenseReportAction: ReportAction | undefined): string | undefined {
    if (!linkedTrackedExpenseReportAction || !isMoneyRequestAction(linkedTrackedExpenseReportAction)) {
        return undefined;
    }
    return getOriginalMessage(linkedTrackedExpenseReportAction)?.IOUTransactionID;
}

export {
    calculateAmount,
    calculateSplitAmountFromPercentage,
    calculateSplitPercentagesFromAmounts,
    getExistingTransactionID,
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
    navigateToConfirmationPage,
};
