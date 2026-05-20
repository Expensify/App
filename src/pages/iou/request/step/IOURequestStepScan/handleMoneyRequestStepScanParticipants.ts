import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';
import {
    createTransaction,
    getMoneyRequestParticipantsFromReport,
    setMoneyRequestParticipants,
    setMoneyRequestParticipantsFromReport,
    setMultipleMoneyRequestParticipantsFromReport,
} from '@libs/actions/IOU/MoneyRequest';
import {startSplitBill} from '@libs/actions/IOU/Split';
import getCurrentPosition from '@libs/getCurrentPosition';
import {calculateDefaultReimbursable, navigateToConfirmationPage, navigateToParticipantPage} from '@libs/IOUUtils';
import Log from '@libs/Log';
import submitWithCleanup from '@libs/Navigation/helpers/submitWithCleanup';
import Navigation from '@libs/Navigation/Navigation';
import {getManagerMcTestParticipant} from '@libs/OptionsListUtils';
import {generateReportID, getPolicyExpenseChat, isSelfDM} from '@libs/ReportUtils';
import shouldUseDefaultExpensePolicy from '@libs/shouldUseDefaultExpensePolicy';
import {cancelSpan} from '@libs/telemetry/activeSpans';
import type {ReceiptFile} from '@pages/iou/request/step/IOURequestStepScan/types';
import {setTransactionReport} from '@userActions/Transaction';
import type {IOUAction, IOUType} from '@src/CONST';
import CONST from '@src/CONST';
import type {Route} from '@src/ROUTES';
import ROUTES from '@src/ROUTES';
import type {
    Beta,
    BillingGraceEndPeriod,
    IntroSelected,
    PersonalDetailsList,
    Policy,
    PolicyTagLists,
    QuickAction,
    RecentWaypoint,
    Report,
    ReportAction,
    Transaction,
    TransactionViolation,
} from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';
import type {Receipt} from '@src/types/onyx/Transaction';

type InitialTransactionParams = {
    transactionID: string;
    reportID?: string;
    taxCode: string;
    taxAmount: number;
    taxValue?: string;
    isFromGlobalCreate?: boolean;
    currency?: string;
    participants?: Participant[];
};

type MoneyRequestStepScanParticipantsFlowParams = {
    iouType: IOUType;
    policy: OnyxEntry<Policy>;
    report: OnyxEntry<Report>;
    reportID: string;
    transactions: Transaction[];
    initialTransaction: InitialTransactionParams;
    policyForMovingExpenses?: OnyxEntry<Policy>;
    personalDetails: OnyxEntry<PersonalDetailsList>;
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
    quickAction: OnyxEntry<QuickAction>;
    policyRecentlyUsedCurrencies?: string[];
    introSelected?: IntroSelected;
    files: ReceiptFile[];
    isTestTransaction?: boolean;
    locationPermissionGranted?: boolean;
    shouldGenerateTransactionThreadReport: boolean;
    selfDMReport: OnyxEntry<Report>;
    isSelfTourViewed: boolean;
    allTransactionDrafts: OnyxCollection<Transaction>;
    betas: OnyxEntry<Beta[]>;
    recentWaypoints: OnyxEntry<RecentWaypoint[]>;
    participants: Participant[];
    participantsPolicyTags: Record<string, PolicyTagLists>;
    amountOwed: OnyxEntry<number>;
    userBillingGracePeriodEnds: OnyxCollection<BillingGraceEndPeriod>;
    ownerBillingGracePeriodEnd?: OnyxEntry<number>;
    optimisticTransactionIDs: string[];
    optimisticChatReportID: string | undefined;

    /** IOU action (CREATE / SUBMIT / TRACK / CATEGORIZE / SHARE) — drives post-create nav targeting. */
    action: IOUAction;
    /** Resolved chat report ID that cleanup nav should land on (existing report's ID or the optimistic one). */
    chatReportID: string | undefined;
    /** Existing draft transaction IDs to remove on cleanup. */
    draftTransactionIDs: string[];
    /** Pre-computed `getIsFromGlobalCreate(initialTransaction)` — UI threads it through to avoid widening InitialTransactionParams to a full Transaction. */
    initialIsFromGlobalCreate: boolean | undefined;
    /** The original tracked-expense report action this transaction came from (for the move-from-track flow); used by post-create cleanup. */
    linkedTrackedExpenseReportAction?: OnyxEntry<ReportAction>;
};

/**
 * Decides what to do after the user selected files on the scan step:
 * navigate-only branches (backTo / global-create / participant page) just navigate,
 * and skip-confirm branches submit the write + cleanup via `submitWithCleanup`.
 *
 * Lives in the UI layer because every branch either navigates or composes
 * `submitWithDismissFirst` with view-layer cleanup — no part of this is reusable from a non-UI caller.
 */
function handleMoneyRequestStepScanParticipants({
    iouType,
    policy,
    report,
    reportID,
    transactions,
    initialTransaction,
    policyForMovingExpenses,
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
    introSelected,
    files,
    isTestTransaction = false,
    locationPermissionGranted = false,
    selfDMReport,
    isSelfTourViewed,
    allTransactionDrafts,
    betas,
    recentWaypoints,
    participants,
    participantsPolicyTags,
    amountOwed,
    userBillingGracePeriodEnds,
    ownerBillingGracePeriodEnd,
    optimisticTransactionIDs,
    optimisticChatReportID,
    action,
    chatReportID,
    draftTransactionIDs,
    initialIsFromGlobalCreate,
    linkedTrackedExpenseReportAction,
}: MoneyRequestStepScanParticipantsFlowParams): void {
    if (backTo) {
        Navigation.goBack(backTo);
        return;
    }

    if (isTestTransaction) {
        const managerMcTestParticipant = getManagerMcTestParticipant(currentUserAccountID, personalDetails) ?? {};
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

    const lastOptimisticTransactionID = optimisticTransactionIDs.at(-1) ?? initialTransaction.transactionID;

    // If the user started this flow from using the + button in the composer inside a report
    // the participants can be automatically assigned from the report and the user can skip the participants step and go straight
    // to the confirmation step.
    // If the user is started this flow using the Create expense option (combined submit/track flow), they should be redirected to the participants page.
    if (!initialTransaction?.isFromGlobalCreate && !isArchivedExpenseReport && iouType !== CONST.IOU.TYPE.CREATE) {
        if (shouldSkipConfirmation) {
            cancelSpan(CONST.TELEMETRY.SPAN_SCAN_PROCESS_AND_NAVIGATE);
            cancelSpan(CONST.TELEMETRY.SPAN_CONFIRMATION_MOUNT);
            cancelSpan(CONST.TELEMETRY.SPAN_SHUTTER_TO_CONFIRMATION);
            cancelSpan(CONST.TELEMETRY.SPAN_ODOMETER_TO_CONFIRMATION);
            cancelSpan(CONST.TELEMETRY.SPAN_CONFIRMATION_LIST_READY);
            cancelSpan(CONST.TELEMETRY.SPAN_CONFIRMATION_RECEIPT_LOAD);
            const firstReceiptFile = files.at(0);
            if (iouType === CONST.IOU.TYPE.SPLIT && firstReceiptFile) {
                const splitReceipt: Receipt = firstReceiptFile.file ?? {};
                splitReceipt.source = firstReceiptFile.source;
                splitReceipt.state = CONST.IOU.RECEIPT_STATE.SCAN_READY;

                const splitBaseParams = {
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
                    taxValue: initialTransaction.taxValue,
                    quickAction,
                    policyRecentlyUsedCurrencies: policyRecentlyUsedCurrencies ?? [],
                    policyRecentlyUsedTags: undefined,
                    participantsPolicyTags,
                };

                submitWithCleanup({
                    executeWrite: (overrides) =>
                        startSplitBill({
                            ...splitBaseParams,
                            shouldHandleNavigation: overrides.shouldHandleNavigation,
                            shouldDeferForSearch: overrides.shouldDeferForSearch,
                        }),
                    destinationReportID: reportID,
                    telemetryContext: {
                        scenario: CONST.TELEMETRY.SUBMIT_EXPENSE_SCENARIO.SPLIT_RECEIPT,
                        iouType: CONST.IOU.TYPE.SPLIT,
                        requestType: CONST.IOU.REQUEST_TYPE.SCAN,
                        isFromGlobalCreate: !report?.reportID,
                        hasReceipt: true,
                    },
                    report,
                    action,
                    draftTransactionIDs,
                    transactionID: lastOptimisticTransactionID,
                    isFromGlobalCreate: initialIsFromGlobalCreate,
                    backToReport,
                    optimisticChatReportID: chatReportID,
                    linkedTrackedExpenseReportAction: linkedTrackedExpenseReportAction,
                });
                return;
            }
            const participant = participants.at(0);
            if (!participant) {
                return;
            }
            const defaultReimbursable = calculateDefaultReimbursable({
                iouType,
                policy,
                policyForMovingExpenses,
                participant,
                transactionReportID: initialTransaction?.reportID,
            });

            const baseCreateTransactionParams = {
                transactions,
                iouType,
                report,
                currentUserAccountID,
                currentUserEmail: currentUserLogin,
                backToReport,
                shouldGenerateTransactionThreadReport,
                isASAPSubmitBetaEnabled,
                transactionViolations,
                quickAction,
                policyRecentlyUsedCurrencies,
                introSelected,
                files,
                participant,
                policyParams: {policy},
                reimbursable: defaultReimbursable,
                isSelfTourViewed,
                allTransactionDrafts,
                betas,
                personalDetails,
                recentWaypoints,
                optimisticTransactionIDs,
                optimisticChatReportID,
            };

            const scanDestinationReportID = iouType === CONST.IOU.TYPE.TRACK ? selfDMReport?.reportID : report?.reportID;
            submitWithCleanup({
                executeWrite: (overrides) => {
                    const scanCreateParams = {...baseCreateTransactionParams, shouldHandleNav: overrides.shouldHandleNavigation};
                    if (locationPermissionGranted) {
                        getCurrentPosition(
                            (successData) => createTransaction({...scanCreateParams, gpsPoint: {lat: successData.coords.latitude, long: successData.coords.longitude}}),
                            (errorData) => {
                                Log.info('[IOURequestStepScan] getCurrentPosition failed', false, errorData);
                                // When there is an error, the money can still be requested, it just won't include the GPS coordinates
                                createTransaction(scanCreateParams);
                            },
                        );
                        return;
                    }
                    createTransaction(scanCreateParams);
                },
                destinationReportID: scanDestinationReportID,
                telemetryContext: {
                    scenario: iouType === CONST.IOU.TYPE.TRACK ? CONST.TELEMETRY.SUBMIT_EXPENSE_SCENARIO.TRACK_EXPENSE : CONST.TELEMETRY.SUBMIT_EXPENSE_SCENARIO.REQUEST_MONEY_SCAN,
                    iouType,
                    requestType: CONST.IOU.REQUEST_TYPE.SCAN,
                    isFromGlobalCreate: !report?.reportID,
                    hasReceipt: true,
                },
                report,
                action,
                draftTransactionIDs,
                transactionID: lastOptimisticTransactionID,
                isFromGlobalCreate: initialIsFromGlobalCreate,
                backToReport,
                optimisticChatReportID: chatReportID,
                linkedTrackedExpenseReportAction: linkedTrackedExpenseReportAction,
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
    if (shouldUseDefaultExpensePolicy(iouType, defaultExpensePolicy, amountOwed, userBillingGracePeriodEnds, ownerBillingGracePeriodEnd)) {
        const shouldAutoReport = !!defaultExpensePolicy?.autoReporting || isAutoReporting;
        const targetReport = shouldAutoReport ? getPolicyExpenseChat(currentUserAccountID, defaultExpensePolicy?.id) : selfDMReport;
        const transactionReportID = isSelfDM(targetReport) ? CONST.REPORT.UNREPORTED_REPORT_ID : targetReport?.reportID;
        const iouTypeTrackOrSubmit = transactionReportID === CONST.REPORT.UNREPORTED_REPORT_ID ? CONST.IOU.TYPE.TRACK : CONST.IOU.TYPE.SUBMIT;

        // If the initial transaction has different participants selected that means that the user has changed the participant in the confirmation step
        if (initialTransaction?.participants && initialTransaction?.participants?.at(0)?.reportID !== targetReport?.reportID) {
            const isTrackExpense = initialTransaction?.participants?.at(0)?.reportID === selfDMReport?.reportID;

            const setParticipantsPromises = files.map((receiptFile) => setMoneyRequestParticipants(receiptFile.transactionID, initialTransaction?.participants));
            Promise.all(setParticipantsPromises).then(() => {
                if (isTrackExpense) {
                    Navigation.navigate(
                        ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.CREATE, CONST.IOU.TYPE.TRACK, initialTransaction.transactionID, selfDMReport?.reportID),
                    );
                } else {
                    navigateToConfirmationPage(iouType, initialTransaction.transactionID, reportID, backToReport, iouType === CONST.IOU.TYPE.CREATE, initialTransaction?.reportID);
                }
            });
            return;
        }

        const setParticipantsPromises = files.map((receiptFile) => {
            setTransactionReport(receiptFile.transactionID, {reportID: transactionReportID}, true);
            return setMoneyRequestParticipantsFromReport(receiptFile.transactionID, targetReport, currentUserAccountID);
        });
        Promise.all(setParticipantsPromises).then(() =>
            Navigation.navigate(ROUTES.MONEY_REQUEST_STEP_CONFIRMATION.getRoute(CONST.IOU.ACTION.CREATE, iouTypeTrackOrSubmit, initialTransaction.transactionID, targetReport?.reportID)),
        );
        return;
    }
    navigateToParticipantPage(iouType, initialTransaction.transactionID, reportID);
}

export default handleMoneyRequestStepScanParticipants;
export type {MoneyRequestStepScanParticipantsFlowParams};
