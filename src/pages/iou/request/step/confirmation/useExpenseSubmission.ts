import useActivePolicy from '@hooks/useActivePolicy';
import useDelegateAccountID from '@hooks/useDelegateAccountID';
import useLastWorkspaceNumber from '@hooks/useLastWorkspaceNumber';
import useLocalize from '@hooks/useLocalize';
import useMoneyRequestPolicyTags from '@hooks/useMoneyRequestPolicyTags';
import useOnboardingTaskInformation from '@hooks/useOnboardingTaskInformation';
import useOnyx from '@hooks/useOnyx';
import useParentReportAction from '@hooks/useParentReportAction';
import useParticipantsInvoiceReport from '@hooks/useParticipantsInvoiceReport';
import useParticipantsPolicyTags from '@hooks/useParticipantsPolicyTags';
import usePermissions from '@hooks/usePermissions';
import useReportTransactions from '@hooks/useReportTransactions';
import useTransactionsByID from '@hooks/useTransactionsByID';

import {generateDefaultWorkspaceName} from '@libs/actions/Policy/Policy';
import {completeTestDriveTask} from '@libs/actions/Task';
import {getCurrencySymbol} from '@libs/CurrencyUtils';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import getCurrentPosition from '@libs/getCurrentPosition';
import {getStringifiedGPSCoordinates} from '@libs/GPSDraftDetailsUtils';
import {getExistingTransactionID, isSelfDMSoleDestination, resolveOptimisticChatReportID} from '@libs/IOUUtils';
import Log from '@libs/Log';
import cleanupAfterExpenseCreate from '@libs/Navigation/helpers/cleanupAfterExpenseCreate';
import cleanupAndNavigateAfterExpenseCreate from '@libs/Navigation/helpers/cleanupAndNavigateAfterExpenseCreate';
import dismissModalAndOpenReportInInboxTabHelper from '@libs/Navigation/helpers/dismissModalAndOpenReportInInboxTab';
import isSearchTopmostFullScreenRoute from '@libs/Navigation/helpers/isSearchTopmostFullScreenRoute';
import navigateAfterExpenseCreate from '@libs/Navigation/helpers/navigateAfterExpenseCreate';
import {rand64, roundToTwoDecimalPlaces} from '@libs/NumberUtils';
import {isTaxTrackingEnabled} from '@libs/PolicyUtils';
import {
    findSelfDMReportID,
    generateReportID,
    getAllPolicyExpenseChatReportActions,
    getReportOrDraftReport,
    hasViolations as hasViolationsReportUtils,
    isMoneyRequestReport as isMoneyRequestReportReportUtils,
} from '@libs/ReportUtils';
import {endSpan, getSpan, startSpan} from '@libs/telemetry/activeSpans';
import markSubmitExpenseEnd from '@libs/telemetry/markSubmitExpenseEnd';
import {
    getDefaultTaxCode,
    getDistanceRequestType,
    getIsFromGlobalCreate,
    getRateID,
    getTaxValue,
    getValidWaypoints,
    isDistanceRequest as isDistanceRequestTransactionUtils,
    isGPSDistanceRequest as isGPSDistanceRequestTransactionUtils,
    isManualDistanceRequest as isManualDistanceRequestTransactionUtils,
} from '@libs/TransactionUtils';

import {resolveChatTargetForSubmitCleanup} from '@pages/iou/request/step/resolveChatTarget';

import {isOneToTwoTransactionTransition} from '@userActions/IOU/PendingNewTransactions';
import {submitPerDiemExpenseForSelfDM, submitPerDiemExpense as submitPerDiemExpenseIOUActions} from '@userActions/IOU/PerDiem';
import {getReceiverType, sendInvoice} from '@userActions/IOU/SendInvoice';
import {sendMoneyElsewhere, sendMoneyWithWallet} from '@userActions/IOU/SendMoney';
import {createDistanceRequest as createDistanceRequestIOUActions, splitBill, splitBillAndOpenReport, startSplitBill} from '@userActions/IOU/Split';
import {requestMoney as requestMoneyIOUActions, trackExpense as trackExpenseIOUActions} from '@userActions/IOU/TrackExpense';
import type {GPSPoint as GpsPoint} from '@userActions/IOU/types/TrackExpenseTransactionParams';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList, PolicyCategories, RecentlyUsedCategories, Report} from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';
import type {PaymentMethodType} from '@src/types/onyx/OriginalMessage';
import type Policy from '@src/types/onyx/Policy';
import type {Receipt} from '@src/types/onyx/Transaction';
import type Transaction from '@src/types/onyx/Transaction';
import type DeepValueOf from '@src/types/utils/DeepValueOf';
import {isEmptyObject} from '@src/types/utils/EmptyObject';

import type {OnyxEntry} from 'react-native-onyx';

import {delegateEmailSelector} from '@selectors/Account';
import {hasSeenTourSelector} from '@selectors/Onboarding';
import {isDraftReportSelector} from '@selectors/Report';
import {useEffect, useRef, useState} from 'react';

function getCurrentPositionWithGeolocationSpan(onPosition: (gpsCoords?: {lat: number; long: number}) => void) {
    const parentSpan = getSpan(CONST.TELEMETRY.SPAN_SUBMIT_EXPENSE);
    markSubmitExpenseEnd();

    startSpan(CONST.TELEMETRY.SPAN_GEOLOCATION_WAIT, {
        name: CONST.TELEMETRY.SPAN_GEOLOCATION_WAIT,
        op: CONST.TELEMETRY.SPAN_GEOLOCATION_WAIT,
        parentSpan,
    });

    getCurrentPosition(
        (successData) => {
            onPosition({lat: successData.coords.latitude, long: successData.coords.longitude});
            endSpan(CONST.TELEMETRY.SPAN_GEOLOCATION_WAIT);
        },
        (errorData) => {
            Log.info('[useExpenseSubmission] getCurrentPosition failed', false, errorData);
            onPosition();
            endSpan(CONST.TELEMETRY.SPAN_GEOLOCATION_WAIT);
        },
    );
}

type UseExpenseSubmissionParams = {
    // Transaction data
    transaction: OnyxEntry<Transaction>;
    transactions: Transaction[];
    receiptFiles: Record<string, Receipt>;

    // Report data
    report: OnyxEntry<Report>;
    reportID: string;

    // Policy data
    policy: OnyxEntry<Policy>;
    policyCategories: OnyxEntry<PolicyCategories>;
    isDraftPolicy: boolean;

    // User data
    currentUserPersonalDetails: {accountID: number; login?: string; email?: string; localCurrencyCode?: string};
    personalDetails: OnyxEntry<PersonalDetailsList>;
    participants: Participant[];

    // Request type flags
    iouType: DeepValueOf<typeof CONST.IOU.TYPE>;
    action: DeepValueOf<typeof CONST.IOU.ACTION>;
    requestType: DeepValueOf<typeof CONST.IOU.REQUEST_TYPE> | undefined;
    isDistanceRequest: boolean;
    isManualDistanceRequest: boolean;
    isOdometerDistanceRequest: boolean;
    isPerDiemRequest: boolean;
    isTimeRequest: boolean;
    isMovingTransactionFromTrackExpense: boolean;
    isCategorizingTrackExpense: boolean;
    isSharingTrackExpense: boolean;
    isUnreported: boolean;
    isPolicyExpenseChat: boolean;

    // Onyx values
    draftTransactionIDs: string[] | undefined;
    privateIsArchivedMap: Record<string, boolean | undefined>;

    // Navigation
    backToReport?: string;
};

type SendMoneyReportIDs = {
    /** Optimistic report ID generated before the server round-trip. */
    optimisticChatReportID: string | undefined;
    /** Resolved chat report ID (may match an existing report). */
    chatReportID: string | undefined;
};

type SendMoneyOptions = {
    /** Whether the send-money action should handle its own post-submit navigation. */
    shouldHandleNavigation?: boolean;
    /** Pre-resolved report IDs to avoid redundant resolution when the caller already resolved them. */
    resolvedReportIDs?: SendMoneyReportIDs;
    /** Whether to start telemetry tracking; false when the orchestrator starts tracking externally. */
    shouldStartTracking?: boolean;
    /** Whether to defer the API write for the Search skeleton optimization. */
    shouldDeferForSearch?: boolean;
};

function useExpenseSubmission(params: UseExpenseSubmissionParams) {
    const {
        transaction,
        transactions,
        receiptFiles,
        report,
        reportID,
        policy,
        policyCategories,
        isDraftPolicy,
        currentUserPersonalDetails,
        personalDetails,
        participants,
        iouType,
        action,
        isDistanceRequest,
        isManualDistanceRequest,
        isOdometerDistanceRequest,
        isPerDiemRequest,
        isTimeRequest,
        isMovingTransactionFromTrackExpense,
        isCategorizingTrackExpense,
        isSharingTrackExpense,
        isUnreported,
        isPolicyExpenseChat,
        draftTransactionIDs,
        privateIsArchivedMap,
        backToReport,
    } = params;

    // Localization
    const {translate, toLocaleDigit} = useLocalize();

    // Permissions
    const {isBetaEnabled} = usePermissions();
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const shouldGenerateTransactionThreadReport = false;

    // UI state
    const [isConfirmed, setIsConfirmed] = useState(false);
    const formHasBeenSubmitted = useRef(false);

    // Ref so callbacks always read the latest transactionViolations.
    const [transactionViolations] = useOnyx(ONYXKEYS.COLLECTION.TRANSACTION_VIOLATIONS);
    const transactionViolationsRef = useRef(transactionViolations);
    useEffect(() => {
        transactionViolationsRef.current = transactionViolations;
    }, [transactionViolations]);
    const hasViolations = hasViolationsReportUtils(report?.reportID, transactionViolations, currentUserPersonalDetails.accountID, currentUserPersonalDetails.login ?? '');

    // Policy-scoped Onyx data
    const policyID = policy?.id;
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`);
    const isIouReport = isMoneyRequestReportReportUtils(report);
    const [policyRecentlyUsedCategories] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_CATEGORIES}${policyID}`);
    const [policyRecentlyUsedTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_TAGS}${policyID}`);
    const [policyRecentlyUsedCurrenciesOnyx] = useOnyx(ONYXKEYS.RECENTLY_USED_CURRENCIES);
    const policyRecentlyUsedCurrencies = policyRecentlyUsedCurrenciesOnyx ?? [];
    const [recentlyUsedDestinations] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_RECENTLY_USED_DESTINATIONS}${policyID}`);
    const lastWorkspaceNumber = useLastWorkspaceNumber();
    const activePolicy = useActivePolicy();
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [allReportActions] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS);

    // Reports
    const [selfDMReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${findSelfDMReportID()}`);
    const reportTransactions = useReportTransactions(report?.reportID);
    const isMoneyRequestReport = isMoneyRequestReportReportUtils(report);
    const currentChatReport = isMoneyRequestReport ? getReportOrDraftReport(report?.chatReportID) : report;
    const [isDraftChatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_DRAFT}${currentChatReport?.reportID}`, {selector: isDraftReportSelector});
    const moneyRequestReportID = isMoneyRequestReport ? report?.reportID : '';
    const [moneyRequestReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${moneyRequestReportID}`);
    const selectedParticipants = participants.filter((participant) => participant.selected);
    const policyTagsForRequestMoney = useMoneyRequestPolicyTags({
        moneyRequestReportID: isIouReport ? report?.reportID : undefined,
        parentChatReportPolicyID: isMovingTransactionFromTrackExpense ? undefined : report?.policyID,
        participantReportID: selectedParticipants?.at(0)?.reportID,
    });
    // Filter out participants with an amount equal to O
    let splitParticipants = selectedParticipants;
    if (iouType === CONST.IOU.TYPE.SPLIT && transaction?.splitShares) {
        const participantsWithAmount = new Set(
            Object.keys(transaction.splitShares ?? {})
                .filter((accountID: string): boolean => (transaction?.splitShares?.[Number(accountID)]?.amount ?? 0) > 0)
                .map((accountID) => Number(accountID)),
        );
        splitParticipants = selectedParticipants.filter((participant) =>
            participantsWithAmount.has(participant.isPolicyExpenseChat ? (participant?.ownerAccountID ?? CONST.DEFAULT_NUMBER_ID) : (participant.accountID ?? CONST.DEFAULT_NUMBER_ID)),
        );
    }
    const selectedParticipantsForRequest = iouType === CONST.IOU.TYPE.SPLIT ? splitParticipants : selectedParticipants;

    const isSelfDMDestination = isSelfDMSoleDestination(participants, iouType, currentUserPersonalDetails.accountID);

    const firstSelectedParticipantReportID = selectedParticipantsForRequest.at(0)?.reportID;
    const [selectedParticipantsReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${firstSelectedParticipantReportID}`);
    const iouReportPolicyID = (moneyRequestReportID ? moneyRequestReport?.policyID : undefined) ?? currentChatReport?.policyID ?? selectedParticipantsReport?.policyID;
    const [iouReportPolicyTagList] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${iouReportPolicyID}`);

    // Invoice data
    const receiverParticipant = transaction?.participants?.find((p) => p?.accountID) ?? report?.invoiceReceiver;
    const receiverAccountID = receiverParticipant && 'accountID' in receiverParticipant && receiverParticipant.accountID ? receiverParticipant.accountID : CONST.DEFAULT_NUMBER_ID;
    const receiverType = getReceiverType(receiverParticipant);
    const senderWorkspaceID = transaction?.participants?.find((p) => p?.isSender)?.policyID;
    const [senderWorkspacePolicyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${senderWorkspaceID}`);
    const existingInvoiceReport = useParticipantsInvoiceReport(receiverAccountID, receiverType, senderWorkspaceID);

    // Policy tags from participants
    const participantsPolicyTags = useParticipantsPolicyTags(participants ?? []);

    // Global Onyx values
    const [userLocation] = useOnyx(ONYXKEYS.USER_LOCATION);
    const [quickAction] = useOnyx(ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE);
    const [isSelfTourViewed = false] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [gpsDraftDetails] = useOnyx(ONYXKEYS.GPS_DRAFT_DETAILS);
    const [recentWaypoints] = useOnyx(ONYXKEYS.NVP_RECENT_WAYPOINTS);
    const [odometerDraft] = useOnyx(ONYXKEYS.ODOMETER_DRAFT);
    const delegateAccountID = useDelegateAccountID();
    const [delegateEmail] = useOnyx(ONYXKEYS.ACCOUNT, {selector: delegateEmailSelector});
    // Onboarding task data
    const {
        taskReport: viewTourTaskReport,
        taskParentReport: viewTourTaskParentReport,
        isOnboardingTaskParentReportArchived: isViewTourTaskParentReportArchived,
        hasOutstandingChildTask,
    } = useOnboardingTaskInformation(CONST.ONBOARDING_TASK_TYPE.VIEW_TOUR);
    const parentReportAction = useParentReportAction(viewTourTaskReport);

    // Derived values from transaction
    const isTrackExpense = iouType === CONST.IOU.TYPE.TRACK;
    const isGPSDistanceRequest = isGPSDistanceRequestTransactionUtils(transaction);
    const distanceRequestType = getDistanceRequestType(transaction);

    const customUnitRateID = getRateID(transaction) ?? '';
    const transactionDistance = isManualDistanceRequest || isOdometerDistanceRequest || isGPSDistanceRequest ? (transaction?.comment?.customUnit?.quantity ?? undefined) : undefined;
    const defaultTaxCode = getDefaultTaxCode(policy, transaction);
    const transactionTaxCode = isTaxTrackingEnabled(isPolicyExpenseChat || isUnreported || isTrackExpense || isSelfDMDestination, policy, isDistanceRequest, isPerDiemRequest, isTimeRequest)
        ? ((transaction?.taxCode ? transaction?.taxCode : defaultTaxCode) ?? '')
        : '';
    const transactionTaxAmount = transaction?.taxAmount ?? 0;
    const transactionTaxValue = transaction?.taxValue ?? getTaxValue(policy, transaction, transactionTaxCode) ?? '';

    const transactionIDs = transactions?.map((tx) => tx.transactionID);
    const [storedTransactions] = useTransactionsByID(transactionIDs);

    function performPostBatchCleanup({
        participant,
        shouldHandleNavigation,
        allTransactionsCreated,
        fallbackOptimisticChatReportID,
        navigateBackToReport,
        lastOptimisticTransactionID,
        preResolvedChatTarget,
    }: {
        participant: Participant;
        shouldHandleNavigation: boolean;
        allTransactionsCreated: boolean;
        fallbackOptimisticChatReportID: string;
        navigateBackToReport: string | undefined;
        lastOptimisticTransactionID: string | undefined;
        preResolvedChatTarget?: {report: OnyxEntry<Report>; chatReportID: string};
    }) {
        const lastTransaction = transactions.at(-1);
        // Action bailed mid-batch — keep drafts for retry.
        if (!allTransactionsCreated) {
            return;
        }
        if (!shouldHandleNavigation) {
            cleanupAfterExpenseCreate({draftTransactionIDs, linkedTrackedExpenseReportAction: lastTransaction?.linkedTrackedExpenseReportAction});
            return;
        }
        // requestMoney passes the chat it wrote to (iouReport.chatReportID) as preResolvedChatTarget; trackExpense is void so it still derives (self-DM case).
        const {report: resolvedReport, chatReportID} =
            preResolvedChatTarget ??
            resolveChatTargetForSubmitCleanup({
                participant,
                currentUserAccountID: currentUserPersonalDetails.accountID,
                report,
                fallbackOptimisticChatReportID,
                action,
            });
        // Move-from-track (SUBMIT/CATEGORIZE/SHARE) reuses the tracked transaction's ID — mirror the builder's `existingTransactionID ?? optimisticTransactionID`.
        const lastTransactionID = getExistingTransactionID(lastTransaction?.linkedTrackedExpenseReportAction) ?? lastOptimisticTransactionID;
        cleanupAndNavigateAfterExpenseCreate({
            report: resolvedReport,
            action,
            draftTransactionIDs,
            transactionID: lastTransactionID,
            isFromGlobalCreate: getIsFromGlobalCreate(lastTransaction),
            backToReport: navigateBackToReport,
            optimisticChatReportID: chatReportID,
            linkedTrackedExpenseReportAction: lastTransaction?.linkedTrackedExpenseReportAction,
        });
    }

    function requestMoney(shouldHandleNavigation: boolean, gpsPoint?: GpsPoint) {
        if (!transactions.length) {
            return;
        }

        const participant = selectedParticipants.at(0);
        if (!participant) {
            return;
        }
        // requestMoney bails per-item on malformed SUBMIT too late for UI cleanup — reject the batch upfront.
        const requiresLinkedTracked = action === CONST.IOU.ACTION.SUBMIT;
        if (requiresLinkedTracked && !transactions.every((item) => item.linkedTrackedExpenseReportAction && item.linkedTrackedExpenseReportID)) {
            return;
        }

        const optimisticChatReportID = generateReportID();
        const optimisticCreatedReportActionID = rand64();
        const optimisticReportPreviewActionID = rand64();
        let existingIOUReport: Report | undefined;
        let allTransactionsCreated = true;
        let lastOptimisticTransactionID: string | undefined;

        for (const item of transactions) {
            lastOptimisticTransactionID = rand64();
            const receipt = receiptFiles[item.transactionID];
            const isTestReceipt = receipt?.isTestReceipt ?? false;
            const isTestDriveReceipt = receipt?.isTestDriveReceipt ?? false;
            const isLinkedTrackedExpenseReportArchived =
                !!item.linkedTrackedExpenseReportID && privateIsArchivedMap[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${item.linkedTrackedExpenseReportID}`];

            const itemAmount = isTestReceipt ? CONST.TEST_RECEIPT.AMOUNT : item.amount;
            const itemCurrency = isTestReceipt ? CONST.TEST_RECEIPT.CURRENCY : item.currency;

            if (isTestDriveReceipt) {
                completeTestDriveTask(
                    viewTourTaskReport,
                    viewTourTaskParentReport,
                    isViewTourTaskParentReportArchived,
                    currentUserPersonalDetails.accountID,
                    hasOutstandingChildTask,
                    parentReportAction,
                    delegateEmail,
                    false,
                );
            }

            const existingTransactionID = getExistingTransactionID(item.linkedTrackedExpenseReportAction);
            const existingTransactionDraft = transactions.find((tx) => tx.transactionID === existingTransactionID);
            const existingTransaction = existingTransactionID ? storedTransactions?.find((tx) => tx?.transactionID === existingTransactionID) : undefined;
            let merchantToUse = isTestReceipt ? CONST.TEST_RECEIPT.MERCHANT : item.merchant;
            if (!isTestReceipt && isManualDistanceRequestTransactionUtils(item)) {
                const distance = item.comment?.customUnit?.quantity;
                const unit = item.comment?.customUnit?.distanceUnit;
                const rate = item.comment?.customUnit?.defaultP2PRate;
                if (distance && unit && rate) {
                    // Convert distance to meters
                    const distanceInMeters = DistanceRequestUtils.convertToDistanceInMeters(distance, unit);
                    merchantToUse = DistanceRequestUtils.getDistanceMerchant(
                        true,
                        distanceInMeters,
                        unit,
                        rate,
                        item.currency ?? CONST.CURRENCY.USD,
                        translate,
                        toLocaleDigit,
                        getCurrencySymbol,
                    );
                }
            }

            const {iouReport} = requestMoneyIOUActions({
                report,
                existingIOUReport,
                optimisticChatReportID,
                optimisticCreatedReportActionID,
                optimisticReportPreviewActionID,
                participantParams: {
                    payeeEmail: currentUserPersonalDetails.login,
                    payeeAccountID: currentUserPersonalDetails.accountID,
                    participant,
                },
                policyParams: {
                    policy,
                    policyTagList: policyTagsForRequestMoney,
                    policyCategories,
                    policyRecentlyUsedCategories,
                    policyRecentlyUsedTags,
                },
                gpsPoint,
                action,
                transactionParams: {
                    amount: itemAmount,
                    // Pass the stored quantity for any distance request so that a manually-edited distance
                    // on a map-based expense survives `convertTrackedExpenseToRequest`. Without this, BE
                    // would recompute the distance from waypoints and drop the user's edit. Check the
                    // per-item transaction (not the page-level `isDistanceRequest` prop) because in
                    // submit-from-self-DM flows the page-level transaction can be a draft optimistic one
                    // that hasn't yet inherited the distance custom unit.
                    distance:
                        isDistanceRequestTransactionUtils(item) && typeof item.comment?.customUnit?.quantity === 'number'
                            ? roundToTwoDecimalPlaces(item.comment.customUnit.quantity)
                            : undefined,
                    attendees: item.comment?.attendees,
                    currency: itemCurrency,
                    created: item.created,
                    merchant: merchantToUse,
                    comment: item?.comment?.comment?.trim() ?? '',
                    receipt,
                    category: item.category,
                    tag: item.tag,
                    taxCode: transactionTaxCode,
                    taxAmount: transactionTaxAmount,
                    taxValue: transactionTaxValue,
                    billable: item.billable,
                    reimbursable: item.reimbursable,
                    actionableWhisperReportActionID: item.actionableWhisperReportActionID,
                    linkedTrackedExpenseReportAction: item.linkedTrackedExpenseReportAction,
                    linkedTrackedExpenseReportID: item.linkedTrackedExpenseReportID,
                    waypoints: Object.keys(item.comment?.waypoints ?? {}).length ? getValidWaypoints(item.comment?.waypoints, true, isGPSDistanceRequest) : undefined,
                    customUnitRateID,
                    isTestDrive: item.receipt?.isTestDriveReceipt,
                    originalTransactionID: item.comment?.originalTransactionID,
                    source: item.comment?.source,
                    isLinkedTrackedExpenseReportArchived,
                    isFromGlobalCreate: getIsFromGlobalCreate(item),
                    ...(isTimeRequest ? {type: CONST.TRANSACTION.TYPE.TIME, count: item.comment?.units?.count, rate: item.comment?.units?.rate, unit: CONST.TIME_TRACKING.UNIT.HOUR} : {}),
                },
                optimisticTransactionID: lastOptimisticTransactionID,
                shouldGenerateTransactionThreadReport,
                isASAPSubmitBetaEnabled,
                currentUserAccountIDParam: currentUserPersonalDetails.accountID,
                currentUserEmailParam: currentUserPersonalDetails.email ?? '',
                transactionViolations: transactionViolationsRef.current,
                policyRecentlyUsedCurrencies,
                quickAction,
                existingTransaction: existingTransaction ?? item,
                existingTransactionDraft,
                draftTransactionIDs,
                isSelfTourViewed,
                betas,
                personalDetails,
                delegateAccountID,
            });
            existingIOUReport = iouReport;
            if (!iouReport) {
                allTransactionsCreated = false;
            }
        }
        const isExpenseReport = isMoneyRequestReportReportUtils(report);
        performPostBatchCleanup({
            participant,
            shouldHandleNavigation,
            allTransactionsCreated,
            fallbackOptimisticChatReportID: optimisticChatReportID,
            navigateBackToReport: backToReport,
            lastOptimisticTransactionID,
            preResolvedChatTarget: {
                report: isExpenseReport ? report : undefined,
                chatReportID: isExpenseReport ? optimisticChatReportID : (existingIOUReport?.chatReportID ?? optimisticChatReportID),
            },
        });
    }

    function submitPerDiemExpense(trimmedComment: string, shouldHandleNavigation: boolean, policyRecentlyUsedCategoriesParam?: RecentlyUsedCategories) {
        if (!transaction) {
            return;
        }

        const participant = selectedParticipants.at(0);
        if (!participant || isEmptyObject(transaction.comment) || isEmptyObject(transaction.comment.customUnit)) {
            return;
        }
        if (isTrackExpense) {
            const optimisticChatReportID = selfDMReport?.reportID ?? generateReportID();
            submitPerDiemExpenseForSelfDM({
                selfDMReport,
                policy,
                transactionParams: {
                    currency: transaction.currency,
                    created: transaction.created,
                    comment: trimmedComment,
                    category: transaction.category,
                    tag: transaction.tag,
                    customUnit: transaction.comment?.customUnit,
                    billable: transaction.billable,
                    reimbursable: transaction.reimbursable,
                    attendees: transaction.comment?.attendees,
                    isFromGlobalCreate: getIsFromGlobalCreate(transaction),
                },
                currentUserAccountIDParam: currentUserPersonalDetails.accountID,
                currentUserEmailParam: currentUserPersonalDetails.login ?? '',
                quickAction,
                optimisticChatReportID,
            });
            if (shouldHandleNavigation) {
                dismissModalAndOpenReportInInboxTabHelper(optimisticChatReportID, false, false);
            }
        } else {
            const isExpenseReport = isMoneyRequestReportReportUtils(report);
            let existingChatReport = report;
            if (isExpenseReport) {
                existingChatReport = getReportOrDraftReport(report?.chatReportID);
            } else if (!report?.reportID && participant.isPolicyExpenseChat && participant.reportID) {
                existingChatReport = getReportOrDraftReport(participant.reportID);
            }
            const {optimisticChatReportID, chatReportID} = resolveOptimisticChatReportID(
                [participant.accountID ?? CONST.DEFAULT_NUMBER_ID, currentUserPersonalDetails.accountID],
                existingChatReport,
            );
            const activeReportID = isExpenseReport ? report?.reportID : chatReportID;

            const result = submitPerDiemExpenseIOUActions({
                report,
                participantParams: {
                    payeeEmail: currentUserPersonalDetails.login,
                    payeeAccountID: currentUserPersonalDetails.accountID,
                    participant,
                },
                policyParams: {
                    policy,
                    policyTagList: policyTags,
                    policyRecentlyUsedTags,
                    policyCategories,
                    policyRecentlyUsedCategories: policyRecentlyUsedCategoriesParam,
                },
                recentlyUsedParams: {
                    destinations: recentlyUsedDestinations,
                },
                transactionParams: {
                    currency: transaction.currency,
                    created: transaction.created,
                    comment: trimmedComment,
                    category: transaction.category,
                    tag: transaction.tag,
                    customUnit: transaction.comment?.customUnit,
                    billable: transaction.billable,
                    reimbursable: transaction.reimbursable,
                    attendees: transaction.comment?.attendees,
                    isFromGlobalCreate: getIsFromGlobalCreate(transaction),
                },
                isASAPSubmitBetaEnabled,
                currentUserAccountIDParam: currentUserPersonalDetails.accountID,
                currentUserEmailParam: currentUserPersonalDetails.login ?? '',
                hasViolations,
                policyRecentlyUsedCurrencies,
                quickAction,
                betas,
                personalDetails,
                optimisticChatReportID,
            });
            const targetReportID = backToReport ?? activeReportID;
            // When backToReport exists we are creating the expense from chat, not the expense report, so no pending transaction registration needed.
            const isOneToTwoTransition = !backToReport && isOneToTwoTransactionTransition(isMoneyRequestReport, reportTransactions);

            if (result && targetReportID) {
                navigateAfterExpenseCreate({
                    activeReportID: targetReportID,
                    transactionID: result.transactionID,
                    isFromGlobalCreate: getIsFromGlobalCreate(transaction),
                    hasMultipleTransactions: reportTransactions.length > 0,
                    shouldAddPendingNewTransactionIDs: (shouldHandleNavigation && targetReportID === chatReportID) || isOneToTwoTransition,
                    shouldNavigate: shouldHandleNavigation,
                });
            }
        }
    }

    function trackExpense(shouldHandleNavigation: boolean, options?: {gpsPoint?: GpsPoint}) {
        const {gpsPoint} = options ?? {};
        if (!transactions.length) {
            return;
        }
        const participant = selectedParticipants.at(0);
        if (!participant) {
            return;
        }
        // trackExpense bails per-item on malformed CATEGORIZE/SHARE/SUBMIT too late for UI cleanup — reject the batch upfront.
        const requiresLinkedTracked = action === CONST.IOU.ACTION.CATEGORIZE || action === CONST.IOU.ACTION.SHARE || action === CONST.IOU.ACTION.SUBMIT;
        if (requiresLinkedTracked && !transactions.every((item) => item.linkedTrackedExpenseReportAction && item.linkedTrackedExpenseReportID)) {
            return;
        }
        const optimisticSelfDMReportID = selfDMReport?.reportID ?? generateReportID();
        // When the destination resolved to the current user/self-DM, force the self-DM as the chat (clearing any
        // non-self route report) so getTrackExpenseInformation defaults to the self-DM instead of the route report.
        const trackReport = isSelfDMDestination ? undefined : report;
        const policyExpenseChatReportActions = getAllPolicyExpenseChatReportActions(allReports, allReportActions);
        let lastOptimisticTransactionID: string | undefined;
        for (const item of transactions) {
            lastOptimisticTransactionID = rand64();
            const isLinkedTrackedExpenseReportArchived =
                !!item.linkedTrackedExpenseReportID && privateIsArchivedMap[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${item.linkedTrackedExpenseReportID}`];
            const itemDistance = isManualDistanceRequest || isOdometerDistanceRequest || isGPSDistanceRequest ? (item.comment?.customUnit?.quantity ?? undefined) : undefined;

            const email = currentUserPersonalDetails.email ?? '';
            trackExpenseIOUActions({
                report: trackReport,
                isDraftPolicy,
                isDraftChatReport,
                action,
                existingTransaction: item,
                participantParams: {
                    payeeEmail: currentUserPersonalDetails.login,
                    payeeAccountID: currentUserPersonalDetails.accountID,
                    participant,
                },
                policyParams: {
                    policy,
                    policyCategories,
                    policyTagList: policyTags,
                },
                transactionParams: {
                    amount: item.amount,
                    distance: itemDistance,
                    currency: item.currency,
                    created: item.created,
                    merchant: item.merchant,
                    comment: item?.comment?.comment?.trim() ?? '',
                    receipt: receiptFiles[item.transactionID],
                    category: item.category,
                    tag: item.tag,
                    taxCode: transactionTaxCode,
                    taxAmount: transactionTaxAmount,
                    taxValue: transactionTaxValue,
                    billable: item.billable,
                    reimbursable: item.reimbursable,
                    gpsPoint,
                    validWaypoints: Object.keys(item?.comment?.waypoints ?? {}).length ? getValidWaypoints(item.comment?.waypoints, true, isGPSDistanceRequest) : undefined,
                    actionableWhisperReportActionID: item.actionableWhisperReportActionID,
                    linkedTrackedExpenseReportAction: item.linkedTrackedExpenseReportAction,
                    linkedTrackedExpenseReportID: item.linkedTrackedExpenseReportID,
                    customUnitRateID,
                    attendees: item.comment?.attendees,
                    isLinkedTrackedExpenseReportArchived,
                    odometerStart: isOdometerDistanceRequest ? item.comment?.odometerStart : undefined,
                    odometerEnd: isOdometerDistanceRequest ? item.comment?.odometerEnd : undefined,
                    isFromGlobalCreate: getIsFromGlobalCreate(item),
                    gpsCoordinates: isGPSDistanceRequest ? getStringifiedGPSCoordinates(gpsDraftDetails) : undefined,
                    distanceRequestType,
                },
                accountantParams: {
                    accountant: item.accountant,
                },
                optimisticChatReportID: optimisticSelfDMReportID,
                optimisticTransactionID: lastOptimisticTransactionID,
                isASAPSubmitBetaEnabled,
                currentUser: {accountID: currentUserPersonalDetails.accountID, email},
                introSelected,
                activePolicy,
                quickAction,
                recentWaypoints,
                betas,
                draftTransactionIDs,
                isSelfTourViewed,
                defaultWorkspaceName: generateDefaultWorkspaceName(email, lastWorkspaceNumber, translate),
                previousOdometerDraft: odometerDraft,
                reportActionsList: policyExpenseChatReportActions,
                personalDetailsList: personalDetails,
                currentUserLocalCurrency: currentUserPersonalDetails.localCurrencyCode ?? CONST.CURRENCY.USD,
                delegateAccountID,
            });
        }
        performPostBatchCleanup({
            participant,
            shouldHandleNavigation,
            allTransactionsCreated: true,
            fallbackOptimisticChatReportID: optimisticSelfDMReportID,
            navigateBackToReport: undefined,
            lastOptimisticTransactionID,
            // trackExpense wrote to optimisticSelfDMReportID, so resolve the self-DM nav target directly. This
            // suppresses the route-report fallback in resolveChatTargetForSubmitCleanup, which would otherwise keep a
            // policy/group/source route report as the target when the self-DM report isn't loaded yet (fresh account
            // or before Onyx hydration) — leaving first-time self-DM creates navigating against the wrong report.
            preResolvedChatTarget: isSelfDMDestination ? {report: selfDMReport, chatReportID: optimisticSelfDMReportID} : undefined,
        });
    }

    function createDistanceRequest(trimmedComment: string, shouldHandleNavigation = true) {
        if (!transaction) {
            return;
        }
        const participant = selectedParticipantsForRequest.at(0);
        if (!participant) {
            return;
        }

        // For a brand-new P2P recipient (no existing chat), the confirmation screen has already committed the draft
        // transaction to a freshly generated optimistic reportID via setTransactionReport. Build the optimistic chat
        // report at that same ID so the report the screen subscribes to is the one that actually gets created.
        // Otherwise the builder mints a different ID and the screen hangs waiting on a report that never materializes.
        const isBrandNewP2PRecipient = !report && !participant.isPolicyExpenseChat && !participant.reportID;
        const optimisticChatReportID = isBrandNewP2PRecipient && !!transaction.reportID && transaction.reportID !== CONST.REPORT.UNREPORTED_REPORT_ID ? transaction.reportID : undefined;

        const {chatReportID: distanceChatReportID, transactionID: distanceTransactionID} = createDistanceRequestIOUActions({
            report,
            participants: selectedParticipantsForRequest,
            optimisticChatReportID,
            currentUserLogin: currentUserPersonalDetails.login ?? '',
            currentUserAccountID: currentUserPersonalDetails.accountID,
            iouType,
            existingTransaction: transaction,
            policyParams: {
                policy,
                policyCategories,
                policyTagList: iouReportPolicyTagList,
                policyRecentlyUsedCategories,
                policyRecentlyUsedTags,
            },
            transactionParams: {
                amount: transaction.amount,
                comment: trimmedComment,
                distance: transactionDistance,
                created: transaction.created,
                currency: transaction.currency,
                merchant: transaction.merchant,
                category: transaction.category,
                tag: transaction.tag,
                taxCode: transactionTaxCode,
                taxAmount: transactionTaxAmount,
                taxValue: transactionTaxValue,
                customUnitRateID,
                splitShares: transaction.splitShares,
                validWaypoints: getValidWaypoints(transaction.comment?.waypoints, true, isGPSDistanceRequest),
                billable: transaction.billable,
                reimbursable: transaction.reimbursable,
                attendees: transaction.comment?.attendees,
                receipt: isManualDistanceRequest || isOdometerDistanceRequest ? receiptFiles[transaction.transactionID] : undefined,
                odometerStart: isOdometerDistanceRequest ? transaction.comment?.odometerStart : undefined,
                odometerEnd: isOdometerDistanceRequest ? transaction.comment?.odometerEnd : undefined,
                isFromGlobalCreate: getIsFromGlobalCreate(transaction),
                gpsCoordinates: isGPSDistanceRequest ? getStringifiedGPSCoordinates(gpsDraftDetails) : undefined,
                distanceRequestType,
            },
            isASAPSubmitBetaEnabled,
            transactionViolations: transactionViolationsRef.current,
            quickAction,
            policyRecentlyUsedCurrencies,
            personalDetails,
            recentWaypoints,
            betas,
            previousOdometerDraft: odometerDraft,
            delegateAccountID,
        });

        const isExpenseReport = isMoneyRequestReportReportUtils(report);
        performPostBatchCleanup({
            participant,
            shouldHandleNavigation,
            allTransactionsCreated: true,
            fallbackOptimisticChatReportID: distanceChatReportID,
            navigateBackToReport: backToReport,
            lastOptimisticTransactionID: distanceTransactionID,
            preResolvedChatTarget: {
                report: isExpenseReport ? report : undefined,
                chatReportID: isExpenseReport ? '' : distanceChatReportID,
            },
        });
    }

    function createTransaction(locationPermissionGranted = false, shouldHandleNavigation = true) {
        setIsConfirmed(true);
        const trimmedComment = transaction?.comment?.comment?.trim() ?? '';

        // Don't let the form be submitted multiple times while the navigator is waiting to take the user to a different page
        if (formHasBeenSubmitted.current) {
            return;
        }

        formHasBeenSubmitted.current = true;

        const isDeferredSearchSubmit = !shouldHandleNavigation && isSearchTopmostFullScreenRoute();

        // Telemetry spans (SPAN_SUBMIT_EXPENSE, SPAN_SUBMIT_TO_DESTINATION_VISIBLE)
        // are started by SubmitExpenseOrchestrator before calling createTransaction.
        if (!isTrackExpense && !isSelfDMDestination && isDistanceRequest && !isMovingTransactionFromTrackExpense && !isUnreported) {
            createDistanceRequest(trimmedComment, shouldHandleNavigation);
            markSubmitExpenseEnd();
            return;
        }

        const currentTransactionReceiptFile = transaction?.transactionID ? receiptFiles[transaction.transactionID] : undefined;
        const shouldDeferSplitForSearch = iouType === CONST.IOU.TYPE.SPLIT && isDeferredSearchSubmit;

        // Split flows usually navigate to the destination report internally, but dismiss-first
        // handlers can pass shouldHandleNavigation=false after revealing/dismissing first.
        if (iouType === CONST.IOU.TYPE.SPLIT && Object.values(receiptFiles).filter((receipt) => !!receipt).length) {
            const currentUserLogin = currentUserPersonalDetails.login;
            if (currentUserLogin) {
                for (const [index, item] of transactions.entries()) {
                    const transactionReceiptFile = receiptFiles[item.transactionID];
                    if (!transactionReceiptFile) {
                        continue;
                    }
                    const itemTrimmedComment = item?.comment?.comment?.trim() ?? '';

                    // If we have a receipt let's start the split expense by creating only the action, the transaction, and the group DM if needed
                    startSplitBill({
                        participants: selectedParticipants,
                        currentUserLogin,
                        currentUserAccountID: currentUserPersonalDetails.accountID,
                        comment: itemTrimmedComment,
                        receipt: transactionReceiptFile,
                        existingSplitChatReportID: report?.reportID,
                        billable: item.billable,
                        reimbursable: item.reimbursable,
                        category: item.category,
                        tag: item.tag,
                        currency: item.currency,
                        taxCode: transactionTaxCode,
                        taxAmount: transactionTaxAmount,
                        taxValue: transactionTaxValue,
                        shouldPlaySound: index === transactions.length - 1,
                        policyRecentlyUsedCategories,
                        policyRecentlyUsedTags,
                        quickAction,
                        policyRecentlyUsedCurrencies,
                        participantsPolicyTags,
                        shouldHandleNavigation,
                        shouldDeferForSearch: shouldDeferSplitForSearch,
                    });
                }
            }
            markSubmitExpenseEnd();
            return;
        }

        // IOUs created from a group report will have a reportID param in the route.
        // Since the user is already viewing the report, we don't need to navigate them to the report
        if (iouType === CONST.IOU.TYPE.SPLIT && !transaction?.isFromGlobalCreate) {
            if (currentUserPersonalDetails.login && !!transaction) {
                splitBill({
                    participants: splitParticipants,
                    currentUserLogin: currentUserPersonalDetails.login,
                    currentUserAccountID: currentUserPersonalDetails.accountID,
                    amount: transaction.amount,
                    comment: trimmedComment,
                    currency: transaction.currency,
                    merchant: transaction.merchant,
                    created: transaction.created,
                    category: transaction.category,
                    tag: transaction.tag,
                    existingSplitChatReportID: report?.reportID,
                    billable: transaction.billable,
                    reimbursable: transaction.reimbursable,
                    iouRequestType: transaction.iouRequestType,
                    splitShares: transaction.splitShares,
                    taxCode: transactionTaxCode,
                    taxAmount: transactionTaxAmount,
                    taxValue: transactionTaxValue,
                    policyRecentlyUsedCategories,
                    policyRecentlyUsedTags,
                    isASAPSubmitBetaEnabled,
                    transactionViolations: transactionViolationsRef.current,
                    quickAction,
                    policyRecentlyUsedCurrencies,
                    betas,
                    personalDetails,
                    shouldHandleNavigation,
                    shouldDeferForSearch: shouldDeferSplitForSearch,
                });
            }
            markSubmitExpenseEnd();
            return;
        }

        // If the split expense is created from the global create menu, we also navigate the user to the group report
        if (iouType === CONST.IOU.TYPE.SPLIT) {
            if (currentUserPersonalDetails.login && !!transaction) {
                splitBillAndOpenReport({
                    participants: splitParticipants,
                    currentUserLogin: currentUserPersonalDetails.login,
                    currentUserAccountID: currentUserPersonalDetails.accountID,
                    amount: transaction.amount,
                    comment: trimmedComment,
                    currency: transaction.currency,
                    merchant: transaction.merchant,
                    created: transaction.created,
                    category: transaction.category,
                    tag: transaction.tag,
                    billable: !!transaction.billable,
                    reimbursable: !!transaction.reimbursable,
                    iouRequestType: transaction.iouRequestType,
                    splitShares: transaction.splitShares,
                    taxCode: transactionTaxCode,
                    taxAmount: transactionTaxAmount,
                    taxValue: transactionTaxValue,
                    policyRecentlyUsedCategories,
                    policyRecentlyUsedTags,
                    isASAPSubmitBetaEnabled,
                    transactionViolations: transactionViolationsRef.current,
                    quickAction,
                    policyRecentlyUsedCurrencies,
                    betas,
                    personalDetails,
                    shouldHandleNavigation,
                    shouldDeferForSearch: shouldDeferSplitForSearch,
                });
            }
            markSubmitExpenseEnd();
            return;
        }

        if (iouType === CONST.IOU.TYPE.INVOICE) {
            const invoiceChatReport = !isEmptyObject(report) && report?.reportID ? report : existingInvoiceReport;
            const invoiceChatReportID = invoiceChatReport ? undefined : reportID;

            sendInvoice({
                currentUserAccountID: currentUserPersonalDetails.accountID,
                transaction,
                policyRecentlyUsedCurrencies,
                invoiceChatReport,
                invoiceChatReportID,
                receiptFile: currentTransactionReceiptFile,
                policy,
                policyTagList: policyTags,
                policyCategories,
                policyRecentlyUsedCategories,
                isFromGlobalCreate: getIsFromGlobalCreate(transaction),
                policyRecentlyUsedTags,
                senderPolicyTags: senderWorkspacePolicyTags ?? {},
                shouldHandleNavigation,
            });
            markSubmitExpenseEnd();
            return;
        }

        // "Submit to my employer" with no existing workspace creates a draft Submit (submit2026) workspace. Route it
        // through trackExpense (AddTrackedExpenseToPolicy) so the workspace is created and the expense submitted
        // atomically, instead of requestMoney/ConvertTrackedExpenseToRequest which can't create a workspace.
        // Scoped to submit2026 drafts only so other (team/corporate) draft flows keep their existing behavior.
        const isSubmittingExpenseToDraftWorkspace = action === CONST.IOU.ACTION.SUBMIT && isDraftPolicy && policy?.type === CONST.POLICY.TYPE.SUBMIT;

        if (!isPerDiemRequest && (isTrackExpense || isCategorizingTrackExpense || isSharingTrackExpense || isSelfDMDestination || isSubmittingExpenseToDraftWorkspace)) {
            if (Object.values(receiptFiles).filter((receipt) => !!receipt).length && transaction) {
                // If the transaction amount is zero, then the money is being requested through the "Scan" flow and the GPS coordinates need to be included.
                if (transaction.amount === 0 && !isSharingTrackExpense && !isCategorizingTrackExpense && !isSubmittingExpenseToDraftWorkspace && locationPermissionGranted) {
                    if (userLocation) {
                        trackExpense(shouldHandleNavigation, {
                            gpsPoint: {lat: userLocation.latitude, long: userLocation.longitude},
                        });
                        markSubmitExpenseEnd();
                        return;
                    }

                    getCurrentPositionWithGeolocationSpan((gpsCoords) => trackExpense(shouldHandleNavigation, {gpsPoint: gpsCoords}));
                    return;
                }

                // Otherwise, the money is being requested through the "Manual" flow with an attached image and the GPS coordinates are not needed.
                trackExpense(shouldHandleNavigation);
                markSubmitExpenseEnd();
                return;
            }
            trackExpense(shouldHandleNavigation);
            markSubmitExpenseEnd();
            return;
        }

        if (isPerDiemRequest && action !== CONST.IOU.ACTION.SUBMIT) {
            submitPerDiemExpense(trimmedComment, shouldHandleNavigation, policyRecentlyUsedCategories);
            markSubmitExpenseEnd();
            return;
        }

        if (Object.values(receiptFiles).filter((receipt) => !!receipt).length && !!transaction) {
            // If the transaction amount is zero, then the money is being requested through the "Scan" flow and the GPS coordinates need to be included.
            if (transaction.amount === 0 && !isSharingTrackExpense && !isCategorizingTrackExpense && locationPermissionGranted) {
                if (userLocation) {
                    requestMoney(shouldHandleNavigation, {
                        lat: userLocation.latitude,
                        long: userLocation.longitude,
                    });
                    markSubmitExpenseEnd();
                    return;
                }

                getCurrentPositionWithGeolocationSpan((gpsCoords) => requestMoney(shouldHandleNavigation, gpsCoords));
                return;
            }

            // Otherwise, the money is being requested through the "Manual" flow with an attached image and the GPS coordinates are not needed.
            requestMoney(shouldHandleNavigation);
            markSubmitExpenseEnd();
            return;
        }

        requestMoney(shouldHandleNavigation);
        markSubmitExpenseEnd();
    }

    function sendMoney(paymentMethod: PaymentMethodType | undefined, options?: SendMoneyOptions) {
        const {shouldHandleNavigation = true, resolvedReportIDs, shouldStartTracking = true, shouldDeferForSearch = false} = options ?? {};
        const currency = transaction?.currency;
        const trimmedComment = transaction?.comment?.comment?.trim() ?? '';
        const participant = participants?.at(0);

        if (!participant || !transaction?.amount || !currency) {
            return;
        }

        const {optimisticChatReportID, chatReportID} =
            resolvedReportIDs ?? resolveOptimisticChatReportID([participant.accountID ?? CONST.DEFAULT_NUMBER_ID, currentUserPersonalDetails.accountID], report);
        const sendMoneyParams = {
            report,
            quickAction,
            amount: transaction.amount,
            currency,
            comment: trimmedComment,
            currentUserAccountID: currentUserPersonalDetails.accountID,
            recipient: participant,
            created: transaction.created,
            merchant: transaction.merchant,
            receipt: receiptFiles[transaction.transactionID],
            optimisticChatReportID,
            shouldStartTracking,
            shouldDeferForSearch,
        };

        if (paymentMethod === CONST.IOU.PAYMENT_TYPE.ELSEWHERE) {
            setIsConfirmed(true);
            sendMoneyElsewhere(sendMoneyParams);
        } else if (paymentMethod === CONST.IOU.PAYMENT_TYPE.EXPENSIFY) {
            setIsConfirmed(true);
            sendMoneyWithWallet(sendMoneyParams);
        } else {
            return;
        }
        if (shouldHandleNavigation) {
            dismissModalAndOpenReportInInboxTabHelper(chatReportID, undefined, reportTransactions.length > 0);
        }
    }

    return {createTransaction, sendMoney, isConfirmed, setIsConfirmed, formHasBeenSubmitted};
}

export default useExpenseSubmission;
