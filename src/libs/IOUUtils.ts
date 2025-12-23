import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import type {ValueOf} from 'type-fest';
import type {ReceiptFile} from '@pages/iou/request/step/IOURequestStepScan/types';
import type {IOUAction, IOUType} from '@src/CONST';
import CONST from '@src/CONST';
import type {TranslationParameters, TranslationPaths} from '@src/languages/types';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import type {LastSelectedDistanceRates, OnyxInputOrEntry, PersonalDetails, PersonalDetailsList, Policy, QuickAction, Report, Transaction, TransactionViolation} from '@src/types/onyx';
import type {ReportAttributes} from '@src/types/onyx/DerivedValues';
import type {Attendee, Participant} from '@src/types/onyx/IOU';
import type {Receipt, WaypointCollection} from '@src/types/onyx/Transaction';
import SafeString from '@src/utils/SafeString';
import type {GpsPoint, IOURequestType} from './actions/IOU';
import {
    createDistanceRequest,
    getMoneyRequestParticipantsFromReport,
    requestMoney,
    resetSplitShares,
    setCustomUnitRateID,
    setMoneyRequestMerchant,
    setMoneyRequestParticipants,
    setMoneyRequestParticipantsFromReport,
    setMoneyRequestPendingFields,
    setMultipleMoneyRequestParticipantsFromReport,
    startSplitBill,
    trackExpense,
} from './actions/IOU';
import {setTransactionReport} from './actions/Transaction';
import {getCurrencyUnit} from './CurrencyUtils';
import DistanceRequestUtils from './DistanceRequestUtils';
import getCurrentPosition from './getCurrentPosition';
import Log from './Log';
import Navigation from './Navigation/Navigation';
import {getManagerMcTestParticipant, getParticipantsOption, getReportOption} from './OptionsListUtils';
import Performance from './Performance';
import {isPaidGroupPolicy} from './PolicyUtils';
import {findSelfDMReportID, generateReportID, getPolicyExpenseChat, getReportTransactions} from './ReportUtils';
import {shouldRestrictUserBillableActions} from './SubscriptionUtils';
import {getCurrency, getTagArrayFromName, getValidWaypoints} from './TransactionUtils';

type CreateTransactionParams = {
    transactions: Transaction[];
    iouType: string;
    report: OnyxEntry<Report>;
    currentUserAccountID: number;
    currentUserEmail?: string;
    backToReport?: string;
    shouldGenerateTransactionThreadReport: boolean;
    isASAPSubmitBetaEnabled: boolean;
    transactionViolations?: OnyxCollection<TransactionViolation[]>;
    files: ReceiptFile[];
    participant: Participant;
    gpsPoint?: GpsPoint;
    policyParams?: {policy: OnyxEntry<Policy>};
    billable?: boolean;
    reimbursable?: boolean;
};

type InitialTransactionParams = {
    transactionID: string;
    reportID?: string;
    taxCode: string;
    taxAmount: number;
    isFromGlobalCreate?: boolean;
    currency?: string;
    participants?: Participant[];
};

type MoneyRequestStepScanParticipantsFlowParams = {
    iouType: IOUType;
    policy: OnyxEntry<Policy>;
    report: OnyxEntry<Report>;
    reportID: string;
    reportAttributesDerived?: Record<string, ReportAttributes>;
    transactions: Transaction[];
    initialTransaction: InitialTransactionParams;
    personalDetails?: PersonalDetailsList;
    currentUserLogin?: string;
    currentUserAccountID: number;
    backTo: Route;
    backToReport?: string;
    shouldSkipConfirmation: boolean;
    defaultExpensePolicy?: OnyxEntry<Policy> | null;
    isArchivedExpenseReport: boolean;
    isAutoReporting: boolean;
    isASAPSubmitBetaEnabled: boolean;
    transactionViolations?: OnyxCollection<TransactionViolation[]>;
    quickAction: OnyxEntry<QuickAction>;
    policyRecentlyUsedCurrencies?: string[];
    files: ReceiptFile[];
    isTestTransaction: boolean;
    locationPermissionGranted: boolean;
    shouldGenerateTransactionThreadReport: boolean;
};

type MoneyRequestStepDistanceNavigationParams = {
    iouType: IOUType;
    policy: OnyxEntry<Policy>;
    report: OnyxEntry<Report>;
    reportID: string;
    transactionID: string;
    transaction?: Transaction;
    reportAttributesDerived?: Record<string, ReportAttributes>;
    personalDetails?: PersonalDetailsList;
    waypoints?: WaypointCollection;
    customUnitRateID: string;
    manualDistance?: number;
    currentUserLogin?: string;
    currentUserAccountID: number;
    backTo?: Route;
    backToReport?: string;
    shouldSkipConfirmation: boolean;
    defaultExpensePolicy?: OnyxEntry<Policy> | null;
    isArchivedExpenseReport: boolean;
    isAutoReporting: boolean;
    isASAPSubmitBetaEnabled: boolean;
    transactionViolations?: OnyxCollection<TransactionViolation[]>;
    lastSelectedDistanceRates?: OnyxEntry<LastSelectedDistanceRates>;
    setDistanceRequestData?: (participants: Participant[]) => void;
    translate: <TPath extends TranslationPaths>(path: TPath, ...parameters: TranslationParameters<TPath>) => string;
    quickAction: OnyxEntry<QuickAction>;
    policyRecentlyUsedCurrencies?: string[];
};

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

function createTransaction({
    transactions,
    iouType,
    report,
    currentUserAccountID,
    currentUserEmail,
    backToReport,
    shouldGenerateTransactionThreadReport,
    isASAPSubmitBetaEnabled,
    transactionViolations,
    files,
    participant,
    gpsPoint,
    policyParams,
    billable,
    reimbursable = true,
}: CreateTransactionParams) {
    for (const [index, receiptFile] of files.entries()) {
        const transaction = transactions.find((item) => item.transactionID === receiptFile.transactionID);
        const receipt: Receipt = receiptFile.file ?? {};
        receipt.source = receiptFile.source;
        receipt.state = CONST.IOU.RECEIPT_STATE.SCAN_READY;
        if (iouType === CONST.IOU.TYPE.TRACK && report) {
            trackExpense({
                report,
                isDraftPolicy: false,
                participantParams: {
                    payeeEmail: currentUserEmail,
                    payeeAccountID: currentUserAccountID,
                    participant,
                },
                transactionParams: {
                    amount: 0,
                    currency: transaction?.currency ?? 'USD',
                    created: transaction?.created,
                    receipt,
                    billable,
                    reimbursable,
                    gpsPoint,
                },
                ...(policyParams ?? {}),
                shouldHandleNavigation: index === files.length - 1,
                isASAPSubmitBetaEnabled,
            });
        } else {
            requestMoney({
                report,
                participantParams: {
                    payeeEmail: currentUserEmail,
                    payeeAccountID: currentUserAccountID,
                    participant,
                },
                ...(policyParams ?? {}),
                gpsPoint,
                transactionParams: {
                    amount: 0,
                    attendees: transaction?.comment?.attendees,
                    currency: transaction?.currency ?? 'USD',
                    created: transaction?.created ?? '',
                    merchant: '',
                    receipt,
                    billable,
                    reimbursable,
                },
                shouldHandleNavigation: index === files.length - 1,
                backToReport,
                shouldGenerateTransactionThreadReport,
                isASAPSubmitBetaEnabled,
                currentUserAccountIDParam: currentUserAccountID,
                currentUserEmailParam: currentUserEmail ?? '',
                transactionViolations,
            });
        }
    }
}

function handleMoneyRequestStepScanParticipants({
    iouType,
    policy,
    report,
    reportID,
    reportAttributesDerived,
    transactions,
    initialTransaction,
    personalDetails,
    currentUserLogin,
    currentUserAccountID,
    backTo,
    backToReport,
    shouldSkipConfirmation,
    defaultExpensePolicy,
    shouldGenerateTransactionThreadReport,
    isArchivedExpenseReport,
    isAutoReporting,
    isASAPSubmitBetaEnabled,
    transactionViolations,
    quickAction,
    policyRecentlyUsedCurrencies,
    files,
    isTestTransaction = false,
    locationPermissionGranted = false,
}: MoneyRequestStepScanParticipantsFlowParams) {
    if (backTo) {
        Navigation.goBack(backTo);
        return;
    }

    if (isTestTransaction) {
        const managerMcTestParticipant = getManagerMcTestParticipant() ?? {};
        let reportIDParam = managerMcTestParticipant.reportID;
        if (!managerMcTestParticipant.reportID && report?.reportID) {
            reportIDParam = generateReportID();
        }
        setMoneyRequestParticipants(
            initialTransaction.transactionID,
            [
                {
                    ...managerMcTestParticipant,
                    reportID: reportIDParam,
                    selected: true,
                },
            ],
            true,
        ).then(() => {
            navigateToConfirmationPage(iouType, initialTransaction.transactionID, reportID, backToReport, true, reportIDParam);
        });
        return;
    }

    // If the user started this flow from using the + button in the composer inside a report
    // the participants can be automatically assigned from the report and the user can skip the participants step and go straight
    // to the confirmation step.
    // If the user is started this flow using the Create expense option (combined submit/track flow), they should be redirected to the participants page.
    if (!initialTransaction?.isFromGlobalCreate && !isArchivedExpenseReport && iouType !== CONST.IOU.TYPE.CREATE) {
        const selectedParticipants = getMoneyRequestParticipantsFromReport(report, currentUserAccountID);
        const participants = selectedParticipants.map((participant) => {
            const participantAccountID = participant?.accountID ?? CONST.DEFAULT_NUMBER_ID;
            return participantAccountID ? getParticipantsOption(participant, personalDetails) : getReportOption(participant, reportAttributesDerived);
        });

        if (shouldSkipConfirmation) {
            const firstReceiptFile = files.at(0);
            if (iouType === CONST.IOU.TYPE.SPLIT && firstReceiptFile) {
                const splitReceipt: Receipt = firstReceiptFile.file ?? {};
                splitReceipt.source = firstReceiptFile.source;
                splitReceipt.state = CONST.IOU.RECEIPT_STATE.SCAN_READY;
                startSplitBill({
                    participants,
                    currentUserLogin: currentUserLogin ?? '',
                    currentUserAccountID,
                    comment: '',
                    receipt: splitReceipt,
                    existingSplitChatReportID: reportID,
                    billable: false,
                    category: '',
                    tag: '',
                    currency: initialTransaction?.currency ?? 'USD',
                    taxCode: initialTransaction.taxCode,
                    taxAmount: initialTransaction.taxAmount,
                    quickAction,
                    policyRecentlyUsedCurrencies: policyRecentlyUsedCurrencies ?? [],
                });
                return;
            }
            const participant = participants.at(0);
            if (!participant) {
                return;
            }
            if (locationPermissionGranted) {
                getCurrentPosition(
                    (successData) => {
                        const policyParams = {policy};
                        const gpsPoint = {
                            lat: successData.coords.latitude,
                            long: successData.coords.longitude,
                        };
                        createTransaction({
                            transactions,
                            iouType,
                            report,
                            currentUserAccountID,
                            currentUserEmail: currentUserLogin,
                            backToReport,
                            shouldGenerateTransactionThreadReport,
                            isASAPSubmitBetaEnabled,
                            transactionViolations,
                            files,
                            participant,
                            gpsPoint,
                            policyParams,
                            billable: false,
                            reimbursable: true,
                        });
                    },
                    (errorData) => {
                        Log.info('[IOURequestStepScan] getCurrentPosition failed', false, errorData);
                        // When there is an error, the money can still be requested, it just won't include the GPS coordinates
                        createTransaction({
                            transactions,
                            iouType,
                            report,
                            currentUserAccountID,
                            currentUserEmail: currentUserLogin,
                            backToReport,
                            shouldGenerateTransactionThreadReport,
                            isASAPSubmitBetaEnabled,
                            transactionViolations,
                            files,
                            participant,
                        });
                    },
                );
                return;
            }
            createTransaction({
                transactions,
                iouType,
                report,
                currentUserAccountID,
                currentUserEmail: currentUserLogin,
                backToReport,
                shouldGenerateTransactionThreadReport,
                isASAPSubmitBetaEnabled,
                transactionViolations,
                files,
                participant,
            });
            return;
        }
        const transactionIDs = files.map((receiptFile) => receiptFile.transactionID);
        setMultipleMoneyRequestParticipantsFromReport(transactionIDs, report, currentUserAccountID).then(() =>
            navigateToConfirmationPage(iouType, initialTransaction.transactionID, reportID, backToReport),
        );
        return;
    }

    // If there was no reportID, then that means the user started this flow from the global + menu
    // and an optimistic reportID was generated. In that case, the next step is to select the participants for this expense.
    if (
        iouType === CONST.IOU.TYPE.CREATE &&
        isPaidGroupPolicy(defaultExpensePolicy) &&
        defaultExpensePolicy?.isPolicyExpenseChatEnabled &&
        !shouldRestrictUserBillableActions(defaultExpensePolicy.id)
    ) {
        const activePolicyExpenseChat = getPolicyExpenseChat(currentUserAccountID, defaultExpensePolicy?.id);
        const shouldAutoReport = !!defaultExpensePolicy?.autoReporting || isAutoReporting;
        const transactionReportID = shouldAutoReport ? activePolicyExpenseChat?.reportID : CONST.REPORT.UNREPORTED_REPORT_ID;

        // If the initial transaction has different participants selected that means that the user has changed the participant in the confirmation step
        if (initialTransaction?.participants && initialTransaction?.participants?.at(0)?.reportID !== activePolicyExpenseChat?.reportID) {
            const selfDMReportID = findSelfDMReportID();
            const isTrackExpense = initialTransaction?.participants?.at(0)?.reportID === selfDMReportID;

            const setParticipantsPromises = files.map((receiptFile) => setMoneyRequestParticipants(receiptFile.transactionID, initialTransaction?.participants));
            Promise.all(setParticipantsPromises).then(() => {
                if (isTrackExpense) {
                    Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.TRACK, initialTransaction.transactionID, selfDMReportID));
                } else {
                    navigateToConfirmationPage(iouType, initialTransaction.transactionID, reportID, backToReport, iouType === CONST.IOU.TYPE.CREATE, initialTransaction?.reportID);
                }
            });
            return;
        }

        const setParticipantsPromises = files.map((receiptFile) => {
            setTransactionReport(receiptFile.transactionID, {reportID: transactionReportID}, true);
            return setMoneyRequestParticipantsFromReport(receiptFile.transactionID, activePolicyExpenseChat, currentUserAccountID);
        });
        Promise.all(setParticipantsPromises).then(() =>
            Navigation.navigate(
                ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(
                    CONST.IOU.ACTION.CREATE,
                    iouType === CONST.IOU.TYPE.CREATE ? CONST.IOU.TYPE.SUBMIT : iouType,
                    initialTransaction.transactionID,
                    activePolicyExpenseChat?.reportID,
                ),
            ),
        );
    } else {
        navigateToParticipantPage(iouType, initialTransaction.transactionID, reportID);
    }
}

function handleMoneyRequestStepDistanceNavigation({
    iouType,
    report,
    policy,
    transaction,
    reportID,
    transactionID,
    reportAttributesDerived,
    personalDetails,
    waypoints,
    customUnitRateID,
    manualDistance,
    currentUserLogin,
    currentUserAccountID,
    backTo,
    backToReport,
    shouldSkipConfirmation,
    defaultExpensePolicy,
    isArchivedExpenseReport,
    isAutoReporting,
    isASAPSubmitBetaEnabled,
    transactionViolations,
    lastSelectedDistanceRates,
    setDistanceRequestData,
    translate,
    quickAction,
    policyRecentlyUsedCurrencies,
}: MoneyRequestStepDistanceNavigationParams) {
    if (transaction?.splitShares && !manualDistance) {
        resetSplitShares(transaction);
    }
    if (backTo) {
        Navigation.goBack(backTo);
        return;
    }

    // If a reportID exists in the report object, it's because either:
    // - The user started this flow from using the + button in the composer inside a report.
    // - The user started this flow from using the global create menu by selecting the Track expense option.
    // In this case, the participants can be automatically assigned from the report and the user can skip the participants step and go straight
    // to the confirm step.
    // If the user started this flow using the Create expense option (combined submit/track flow), they should be redirected to the participants page.
    if (report?.reportID && !isArchivedExpenseReport && iouType !== CONST.IOU.TYPE.CREATE) {
        const selectedParticipants = getMoneyRequestParticipantsFromReport(report, currentUserAccountID);
        const participants = selectedParticipants.map((participant) => {
            const participantAccountID = participant?.accountID ?? CONST.DEFAULT_NUMBER_ID;
            return participantAccountID ? getParticipantsOption(participant, personalDetails) : getReportOption(participant, reportAttributesDerived);
        });
        setDistanceRequestData?.(participants);
        if (shouldSkipConfirmation) {
            setMoneyRequestPendingFields(transactionID, {waypoints: CONST.RED_BRICK_ROAD_PENDING_ACTION.ADD});
            setMoneyRequestMerchant(transactionID, translate('iou.fieldPending'), false);
            const participant = participants.at(0);
            if (iouType === CONST.IOU.TYPE.TRACK && participant) {
                trackExpense({
                    report,
                    isDraftPolicy: false,
                    participantParams: {
                        payeeEmail: currentUserLogin,
                        payeeAccountID: currentUserAccountID,
                        participant,
                    },
                    policyParams: {
                        policy,
                    },
                    transactionParams: {
                        amount: 0,
                        distance: manualDistance,
                        currency: transaction?.currency ?? 'USD',
                        created: transaction?.created ?? '',
                        merchant: translate('iou.fieldPending'),
                        receipt: {},
                        billable: false,
                        reimbursable: manualDistance ? undefined : true,
                        validWaypoints: manualDistance ? undefined : getValidWaypoints(waypoints, true),
                        customUnitRateID,
                        attendees: transaction?.comment?.attendees,
                    },
                    isASAPSubmitBetaEnabled,
                });
                return;
            }
            const isPolicyExpenseChat = !!participant?.isPolicyExpenseChat;

            createDistanceRequest({
                report,
                participants,
                currentUserLogin,
                currentUserAccountID,
                iouType,
                existingTransaction: transaction,
                transactionParams: {
                    amount: 0,
                    distance: manualDistance,
                    comment: '',
                    created: transaction?.created ?? '',
                    currency: transaction?.currency ?? 'USD',
                    merchant: translate('iou.fieldPending'),
                    billable: !!policy?.defaultBillable,
                    reimbursable: manualDistance ? undefined : !!policy?.defaultReimbursable,
                    validWaypoints: manualDistance ? undefined : getValidWaypoints(waypoints, true),
                    customUnitRateID: DistanceRequestUtils.getCustomUnitRateID({reportID: report.reportID, isPolicyExpenseChat, policy, lastSelectedDistanceRates}),
                    splitShares: transaction?.splitShares,
                    attendees: transaction?.comment?.attendees,
                },
                backToReport,
                isASAPSubmitBetaEnabled,
                transactionViolations,
                quickAction,
                policyRecentlyUsedCurrencies: policyRecentlyUsedCurrencies ?? [],
            });
            return;
        }
        setMoneyRequestParticipantsFromReport(transactionID, report, currentUserAccountID).then(() => {
            navigateToConfirmationPage(iouType, transactionID, reportID, backToReport, false, undefined, !!manualDistance);
        });
        return;
    }

    // If there was no reportID, then that means the user started this flow from the global menu
    // and an optimistic reportID was generated. In that case, the next step is to select the participants for this expense.
    if (
        iouType === CONST.IOU.TYPE.CREATE &&
        isPaidGroupPolicy(defaultExpensePolicy) &&
        defaultExpensePolicy?.isPolicyExpenseChatEnabled &&
        !shouldRestrictUserBillableActions(defaultExpensePolicy.id)
    ) {
        const activePolicyExpenseChat = getPolicyExpenseChat(currentUserAccountID, defaultExpensePolicy?.id);
        const shouldAutoReport = !!defaultExpensePolicy?.autoReporting || isAutoReporting;
        const transactionReportID = shouldAutoReport ? activePolicyExpenseChat?.reportID : CONST.REPORT.UNREPORTED_REPORT_ID;
        const rateID = DistanceRequestUtils.getCustomUnitRateID({
            reportID: transactionReportID,
            isPolicyExpenseChat: true,
            policy: defaultExpensePolicy,
            lastSelectedDistanceRates,
        });
        setTransactionReport(transactionID, {reportID: transactionReportID}, true);
        setCustomUnitRateID(transactionID, rateID);
        setMoneyRequestParticipantsFromReport(transactionID, activePolicyExpenseChat, currentUserAccountID).then(() => {
            Navigation.navigate(
                ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(
                    CONST.IOU.ACTION.CREATE,
                    iouType === CONST.IOU.TYPE.CREATE ? CONST.IOU.TYPE.SUBMIT : iouType,
                    transactionID,
                    activePolicyExpenseChat?.reportID,
                ),
            );
        });
    } else {
        navigateToParticipantPage(iouType, transactionID, reportID);
    }
}

export {
    calculateAmount,
    calculateSplitAmountFromPercentage,
    calculateSplitPercentagesFromAmounts,
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
    createTransaction,
    handleMoneyRequestStepScanParticipants,
    handleMoneyRequestStepDistanceNavigation,
};
