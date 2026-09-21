import useActivePolicy from '@hooks/useActivePolicy';
import useBlockDistanceRequest from '@hooks/useBlockDistanceRequest';
import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useDelegateAccountID from '@hooks/useDelegateAccountID';
import useLastWorkspaceNumber from '@hooks/useLastWorkspaceNumber';
import useLocalize from '@hooks/useLocalize';
import useMoneyRequestPolicyTags from '@hooks/useMoneyRequestPolicyTags';
import useNetwork from '@hooks/useNetwork';
import useOnboardingTaskInformation from '@hooks/useOnboardingTaskInformation';
import useOnyx from '@hooks/useOnyx';
import useParentReportAction from '@hooks/useParentReportAction';
import usePermissions from '@hooks/usePermissions';
import useTransactionsByID from '@hooks/useTransactionsByID';

import {generateDefaultWorkspaceName} from '@libs/actions/Policy/Policy';
import {completeTestDriveTask} from '@libs/actions/Task';
import {WRITE_COMMANDS} from '@libs/API/types';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import {getStringifiedGPSCoordinates} from '@libs/GPSDraftDetailsUtils';
import {getExistingTransactionID, getReusableP2PReportID, isLookingAroundSearchRoutingActive, isSelfDMSoleDestination, resolveOptimisticChatReportID} from '@libs/IOUUtils';
import {rand64, roundToTwoDecimalPlaces} from '@libs/NumberUtils';
import {isTrackOnboardingChoice} from '@libs/OnboardingUtils';
import {getNewAccountIDsAndLogins} from '@libs/PersonalDetailsUtils';
import {findSelfDMReportID, generateReportID, getAllPolicyExpenseChatReportActions, getReportOrDraftReport, isMoneyRequestReport as isMoneyRequestReportReportUtils} from '@libs/ReportUtils';
import {
    getDistanceRequestType,
    getIsFromGlobalCreate,
    getRateID,
    getSelectedRouteDistance,
    getValidWaypoints,
    isDistanceRequest as isDistanceRequestTransactionUtils,
    isGPSDistanceRequest as isGPSDistanceRequestTransactionUtils,
    isManualDistanceRequest as isManualDistanceRequestTransactionUtils,
} from '@libs/TransactionUtils';

import {requestMoney as requestMoneyIOUActions, trackExpense as trackExpenseIOUActions} from '@userActions/IOU/TrackExpense';
import type {GPSPoint as GpsPoint} from '@userActions/IOU/types/TrackExpenseTransactionParams';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList, PolicyCategories, Report} from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';
import type {CurrentUserPersonalDetails} from '@src/types/onyx/PersonalDetails';
import type Policy from '@src/types/onyx/Policy';
import type {Receipt} from '@src/types/onyx/Transaction';
import type Transaction from '@src/types/onyx/Transaction';
import type DeepValueOf from '@src/types/utils/DeepValueOf';

import type {OnyxEntry} from 'react-native-onyx';

import {delegateEmailSelector} from '@selectors/Account';
import {hasSeenTourSelector} from '@selectors/Onboarding';
import {isDraftReportSelector} from '@selectors/Report';
import {useRef, useState} from 'react';

import type {SubmissionPath} from './submission/utils/resolveSubmissionPath';

import useDistanceDraftData from './submission/useDistanceDraftData';
import useDistanceSubmission from './submission/useDistanceSubmission';
import useGpsCapture from './submission/useGpsCapture';
import useInvoiceSubmission from './submission/useInvoiceSubmission';
import usePerDiemSubmission from './submission/usePerDiemSubmission';
import useSendMoneySubmission from './submission/useSendMoneySubmission';
import useSplitSubmission from './submission/useSplitSubmission';
import useSubmissionRecentlyUsedData from './submission/useSubmissionRecentlyUsedData';
import useSubmissionViolations from './submission/useSubmissionViolations';
import getCurrentReceiptState from './submission/utils/getCurrentReceiptState';
import getTransactionTaxValues from './submission/utils/getTransactionTaxValues';
import logSubmittedReceiptMilestone from './submission/utils/logSubmittedReceiptMilestone';
import performPostBatchCleanup from './submission/utils/performPostBatchCleanup';
import {resolveSubmissionPath, SUBMISSION_PATH} from './submission/utils/resolveSubmissionPath';

type UseExpenseSubmissionParams = {
    // Transaction data
    transaction: OnyxEntry<Transaction>;
    transactions: Transaction[];
    receiptFiles: Record<string, Receipt>;

    /** Whether this surface offers manual entry of the amount / merchant / date. False for splits, test receipts and moved tracked expenses. */
    canEnterScanFieldsManually: boolean;

    // Report data
    report: OnyxEntry<Report>;
    reportID: string;

    // Policy data
    policy: OnyxEntry<Policy>;
    policyCategories: OnyxEntry<PolicyCategories>;
    isDraftPolicy: boolean;

    // User data
    currentUserPersonalDetails: CurrentUserPersonalDetails;
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

    /**
     * Called once validation has passed and the write is guaranteed to happen. Clear a pre-mount
     * pre-mount marker here, not earlier - clearing it before validation could pass risks orphaning
     * the pre-mounted report if validation then bails with no write.
     */
    onExpenseWriteWillStart?: () => void;
};

function useExpenseSubmission(params: UseExpenseSubmissionParams) {
    const {
        transaction,
        transactions,
        receiptFiles,
        canEnterScanFieldsManually,
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
        onExpenseWriteWillStart,
    } = params;

    // Localization
    const {translate, toLocaleDigit, formatPhoneNumber} = useLocalize();
    const {getCurrencyDecimals, getCurrencySymbol} = useCurrencyListActions();
    const delegateAccountID = useDelegateAccountID();

    // Permissions
    const {isBetaEnabled, isBetaEnabledOrUnknown} = usePermissions();
    const isVendorMatchingBetaEnabled = isBetaEnabledOrUnknown(CONST.BETAS.VENDOR_MATCHING);
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);
    const shouldGenerateTransactionThreadReport = false;

    // UI state
    const [isConfirmed, setIsConfirmed] = useState(false);
    const formHasBeenSubmitted = useRef(false);

    // formHasBeenSubmitted is never reset on its own, so a submit that returns without writing has to hand the page back or every later tap is swallowed.
    const releaseSubmitLock = () => {
        formHasBeenSubmitted.current = false;
        setIsConfirmed(false);
    };

    // Ref so callbacks always read the latest transactionViolations.
    const {transactionViolationsRef} = useSubmissionViolations();

    // Policy-scoped Onyx data
    const policyID = policy?.id;
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policyID}`);
    const isIouReport = isMoneyRequestReportReportUtils(report);
    const {policyRecentlyUsedCategories, policyRecentlyUsedTags, policyRecentlyUsedCurrencies} = useSubmissionRecentlyUsedData(policyID);
    const lastWorkspaceNumber = useLastWorkspaceNumber();
    const activePolicy = useActivePolicy();
    const [allReports] = useOnyx(ONYXKEYS.COLLECTION.REPORT);
    const [allReportActions] = useOnyx(ONYXKEYS.COLLECTION.REPORT_ACTIONS);
    const [rules] = useOnyx(ONYXKEYS.COLLECTION.RULE);

    // Reports
    const [selfDMReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${findSelfDMReportID()}`);
    const isMoneyRequestReport = isMoneyRequestReportReportUtils(report);
    const currentChatReport = isMoneyRequestReport ? getReportOrDraftReport(report?.chatReportID) : report;
    const isSelfDMDestination = isSelfDMSoleDestination(participants, iouType, currentUserPersonalDetails.accountID);
    // A self-DM destination passes `undefined` as the chat to trackExpense, which then resolves the chat to the self-DM — a real report that is never a draft
    const destinationChatReportID = isSelfDMDestination ? undefined : currentChatReport?.reportID;
    const [isDraftChatReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT_DRAFT}${destinationChatReportID}`, {selector: isDraftReportSelector});
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

    // Global Onyx values
    const [quickAction] = useOnyx(ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE);
    const [isSelfTourViewed = false] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});
    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [conciergeChat] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${conciergeReportID}`);
    const [betas] = useOnyx(ONYXKEYS.BETAS);
    const [delegateEmail] = useOnyx(ONYXKEYS.ACCOUNT, {selector: delegateEmailSelector});
    const isTrackIntentUser = isTrackOnboardingChoice(introSelected?.choice);
    const {isOffline} = useNetwork();
    const isLookingAroundUser = isLookingAroundSearchRoutingActive(introSelected?.choice === CONST.ONBOARDING_CHOICES.LOOKING_AROUND, isOffline);
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
    const {gpsDraftDetails, recentWaypoints, odometerDraft, transactionDistance, isModifiedGPSDistanceRequest} = useDistanceDraftData({
        transaction,
        isGPSDistanceRequest,
        isManualDistanceRequest,
        isOdometerDistanceRequest,
    });
    const {transactionTaxCode, transactionTaxAmount, transactionTaxValue} = getTransactionTaxValues({
        transaction,
        policy,
        isPolicyExpenseChat,
        isUnreported,
        isTrackExpense,
        isSelfDMDestination,
        isDistanceRequest,
        isPerDiemRequest,
        isTimeRequest,
    });

    const transactionIDs = transactions?.map((tx) => tx.transactionID);
    const [storedTransactions] = useTransactionsByID(transactionIDs);

    const blockDistanceRequestIfNeeded = useBlockDistanceRequest({
        policyID: policy?.id,
        isDistanceRequest,
        isManualDistanceRequest,
        isOdometerDistanceRequest,
    });

    // "Submit to my employer" with no existing workspace creates a draft Submit (submit2026) workspace. Route it
    // through trackExpense (AddTrackedExpenseToPolicy) so the workspace is created and the expense submitted
    // atomically, instead of requestMoney/ConvertTrackedExpenseToRequest which can't create a workspace.
    // Scoped to submit2026 drafts only so other (team/corporate) draft flows keep their existing behavior.
    const isSubmittingExpenseToDraftWorkspace = action === CONST.IOU.ACTION.SUBMIT && isDraftPolicy && policy?.type === CONST.POLICY.TYPE.SUBMIT;

    const {submitWithGpsPoint} = useGpsCapture();

    const {sendMoney} = useSendMoneySubmission({
        transaction,
        receiptFiles,
        report,
        participants,
        currentUserPersonalDetails,
        setIsConfirmed,
        onExpenseWriteWillStart,
    });

    const splitSubmission = useSplitSubmission({
        transaction,
        transactions,
        receiptFiles,
        report,
        policy,
        personalDetails,
        currentUserPersonalDetails,
        participants,
        selectedParticipants,
        splitParticipants,
        isTrackIntentUser,
        releaseSubmitLock,
        transactionTaxCode,
        transactionTaxAmount,
        transactionTaxValue,
    });

    const distanceSubmission = useDistanceSubmission({
        transaction,
        transactions,
        receiptFiles,
        report,
        policy,
        policyCategories,
        personalDetails,
        currentUserPersonalDetails,
        participants,
        selectedParticipantsForRequest,
        iouType,
        isGPSDistanceRequest,
        isManualDistanceRequest,
        isOdometerDistanceRequest,
        isTrackIntentUser,
        transactionTaxCode,
        transactionTaxAmount,
        transactionTaxValue,
        backToReport,
        draftTransactionIDs,
        isLookingAroundUser,
        isSelfDMDestination,
        action,
        onExpenseWriteWillStart,
    });

    const perDiemSubmission = usePerDiemSubmission({
        transaction,
        report,
        policy,
        policyCategories,
        personalDetails,
        currentUserPersonalDetails,
        selectedParticipants,
        isTrackExpense,
        isSelfDMDestination,
        isLookingAroundUser,
        isTrackIntentUser,
        backToReport,
        onExpenseWriteWillStart,
    });

    const invoiceSubmission = useInvoiceSubmission({
        transaction,
        receiptFiles,
        report,
        reportID,
        policy,
        policyCategories,
        currentUserPersonalDetails,
        action,
        draftTransactionIDs,
    });

    // Which API command a submission will run. Resolved here rather than inside createTransaction because every
    // input is render-time state - that is what lets each path own its own hook once this file is split up.
    const submissionPath = resolveSubmissionPath({
        iouType,
        action,
        isDistanceRequest,
        isPerDiemRequest,
        isCategorizingTrackExpense,
        isSharingTrackExpense,
        isSelfDMDestination,
        isMovingTransactionFromTrackExpense,
        isUnreported,
        isSubmittingExpenseToDraftWorkspace,
    });

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
        onExpenseWriteWillStart?.();

        // For a brand-new P2P recipient, reuse the optimistic report ID the confirmation screen already
        // committed to the transaction, so the chat report built here is the one the screen subscribes
        // to - otherwise it'd wait forever on an ID that's never created.
        const transactionReportID = transaction?.reportID;
        const reusableP2PReportID = getReusableP2PReportID(participant, transactionReportID);
        const participantAccountIDs = [participant.accountID ?? CONST.DEFAULT_NUMBER_ID, currentUserPersonalDetails.accountID];
        const {chatReportID: optimisticChatReportID} = resolveOptimisticChatReportID(participantAccountIDs, undefined, reusableP2PReportID);
        const optimisticCreatedReportActionID = rand64();
        const optimisticReportPreviewActionID = rand64();
        let existingIOUReport: Report | undefined;
        let allTransactionsCreated = true;
        let lastOptimisticTransactionID: string | undefined;

        for (const item of transactions) {
            lastOptimisticTransactionID = rand64();
            const receipt = receiptFiles[item.transactionID];
            logSubmittedReceiptMilestone({
                item,
                receipt,
                optimisticTransactionID: lastOptimisticTransactionID,
                command: isMovingTransactionFromTrackExpense ? WRITE_COMMANDS.CONVERT_TRACKED_EXPENSE_TO_REQUEST : WRITE_COMMANDS.REQUEST_MONEY,
                iouType,
            });
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
                isVendorMatchingBetaEnabled,
                getCurrencyDecimals,
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
                    receiptState: getCurrentReceiptState({item, receiptFiles, canEnterScanFieldsManually}),
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
                conciergeChat,
                personalDetails,
                isTrackIntentUser,
                delegateAccountID,
                formatPhoneNumber,
                rules,
            });
            existingIOUReport = iouReport;
            if (!iouReport) {
                allTransactionsCreated = false;
            }
        }
        const isExpenseReport = isMoneyRequestReportReportUtils(report);
        performPostBatchCleanup({
            transactions,
            report,
            action,
            draftTransactionIDs,
            currentUserPersonalDetails,
            isLookingAroundUser,
            isSelfDMDestination,
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
        onExpenseWriteWillStart?.();
        const optimisticSelfDMReportID = selfDMReport?.reportID ?? generateReportID();
        // When the destination resolved to the current user/self-DM, force the self-DM as the chat (clearing any
        // non-self route report) so getTrackExpenseInformation defaults to the self-DM instead of the route report.
        const trackReport = isSelfDMDestination ? undefined : report;
        const policyExpenseChatReportActions = getAllPolicyExpenseChatReportActions(allReports, allReportActions);
        let submittedCommand: string = WRITE_COMMANDS.TRACK_EXPENSE;
        if (isCategorizingTrackExpense) {
            submittedCommand = WRITE_COMMANDS.CATEGORIZE_TRACKED_EXPENSE;
        } else if (isSharingTrackExpense) {
            submittedCommand = WRITE_COMMANDS.SHARE_TRACKED_EXPENSE;
        }
        let lastOptimisticTransactionID: string | undefined;
        for (const item of transactions) {
            const {newAccountIDs, newLogins} =
                item.accountant?.login && item.accountant.accountID ? getNewAccountIDsAndLogins({[item.accountant.login]: item.accountant.accountID}, personalDetails) : {};
            lastOptimisticTransactionID = rand64();
            const trackReceipt = receiptFiles[item.transactionID];
            logSubmittedReceiptMilestone({item, receipt: trackReceipt, optimisticTransactionID: lastOptimisticTransactionID, command: submittedCommand, iouType});
            const isLinkedTrackedExpenseReportArchived =
                !!item.linkedTrackedExpenseReportID && privateIsArchivedMap[`${ONYXKEYS.COLLECTION.REPORT_NAME_VALUE_PAIRS}${item.linkedTrackedExpenseReportID}`];
            const itemDistance = isManualDistanceRequest || isOdometerDistanceRequest || isGPSDistanceRequest ? (item.comment?.customUnit?.quantity ?? undefined) : undefined;
            const itemDistanceUnit = item.comment?.customUnit?.distanceUnit;
            const originalItemDistance =
                isModifiedGPSDistanceRequest && gpsDraftDetails?.distanceInMeters && itemDistanceUnit
                    ? DistanceRequestUtils.convertDistanceUnit(gpsDraftDetails.distanceInMeters, itemDistanceUnit)
                    : itemDistance;
            const modifiedItemDistance = isModifiedGPSDistanceRequest ? transactionDistance : undefined;

            const email = currentUserPersonalDetails.email ?? '';

            trackExpenseIOUActions({
                getCurrencyDecimals,
                report: trackReport,
                isDraftPolicy,
                isDraftChatReport: !!isDraftChatReport,
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
                    distance: originalItemDistance,
                    modifiedDistance: modifiedItemDistance,
                    currency: item.currency,
                    created: item.created,
                    merchant: item.merchant,
                    comment: item?.comment?.comment?.trim() ?? '',
                    receipt: trackReceipt,
                    receiptState: getCurrentReceiptState({item, receiptFiles, canEnterScanFieldsManually}),
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
                    selectedRouteDistance: getSelectedRouteDistance(item),
                },
                accountantParams: {
                    accountant: item.accountant,
                    newLogins,
                    newAccountIDs,
                    formatPhoneNumber,
                },
                optimisticChatReportID: optimisticSelfDMReportID,
                optimisticTransactionID: lastOptimisticTransactionID,
                isASAPSubmitBetaEnabled,
                currentUser: {accountID: currentUserPersonalDetails.accountID, email},
                introSelected,
                activePolicy,
                conciergeChat,
                quickAction,
                recentWaypoints,
                betas,
                draftTransactionIDs,
                isSelfTourViewed,
                defaultWorkspaceName: generateDefaultWorkspaceName(email, currentUserPersonalDetails.displayName, lastWorkspaceNumber, translate),
                previousOdometerDraft: odometerDraft,
                reportActionsList: policyExpenseChatReportActions,
                currentUserLocalCurrency: currentUserPersonalDetails.localCurrencyCode ?? CONST.CURRENCY.USD,
                delegateAccountID,
                rules,
            });
        }
        performPostBatchCleanup({
            transactions,
            report,
            action,
            draftTransactionIDs,
            currentUserPersonalDetails,
            isLookingAroundUser,
            isSelfDMDestination,
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

    function submitTrack(locationPermissionGranted: boolean, shouldHandleNavigation: boolean) {
        const hasAnyReceiptFile = Object.values(receiptFiles).filter((receipt) => !!receipt).length > 0;
        // A zero amount means the expense came through the "Scan" flow, which needs GPS coordinates attached.
        const shouldCaptureGpsPoint =
            hasAnyReceiptFile &&
            !!transaction &&
            transaction.amount === 0 &&
            !isSharingTrackExpense &&
            !isCategorizingTrackExpense &&
            !isSubmittingExpenseToDraftWorkspace &&
            locationPermissionGranted;

        submitWithGpsPoint({
            shouldCaptureGpsPoint,
            shouldHandleNavigation,
            write: (navigate, gpsPoint) => trackExpense(navigate, {gpsPoint}),
        });
    }

    function submitRequestMoney(locationPermissionGranted: boolean, shouldHandleNavigation: boolean) {
        const hasAnyReceiptFile = Object.values(receiptFiles).filter((receipt) => !!receipt).length > 0;
        // A zero amount means the expense came through the "Scan" flow, which needs GPS coordinates attached.
        const shouldCaptureGpsPoint = hasAnyReceiptFile && !!transaction && transaction.amount === 0 && !isSharingTrackExpense && !isCategorizingTrackExpense && locationPermissionGranted;

        submitWithGpsPoint({
            shouldCaptureGpsPoint,
            shouldHandleNavigation,
            write: (navigate, gpsPoint) => requestMoney(navigate, gpsPoint),
        });
    }

    const submitByPath: Record<SubmissionPath, (locationPermissionGranted: boolean, shouldHandleNavigation: boolean) => void> = {
        [SUBMISSION_PATH.DISTANCE]: distanceSubmission.createTransaction,
        [SUBMISSION_PATH.SPLIT]: splitSubmission.createTransaction,
        [SUBMISSION_PATH.INVOICE]: invoiceSubmission.createTransaction,
        [SUBMISSION_PATH.TRACK]: submitTrack,
        [SUBMISSION_PATH.PER_DIEM]: perDiemSubmission.createTransaction,
        [SUBMISSION_PATH.REQUEST_MONEY]: submitRequestMoney,
    };

    function createTransaction(locationPermissionGranted = false, shouldHandleNavigation = true) {
        if (blockDistanceRequestIfNeeded()) {
            return;
        }

        setIsConfirmed(true);

        // Don't let the form be submitted multiple times while the navigator is waiting to take the user to a different page
        if (formHasBeenSubmitted.current) {
            return;
        }

        formHasBeenSubmitted.current = true;

        // Telemetry spans (SPAN_SUBMIT_EXPENSE, SPAN_SUBMIT_TO_DESTINATION_VISIBLE)
        // are started by SubmitExpenseOrchestrator before calling createTransaction.
        submitByPath[submissionPath](locationPermissionGranted, shouldHandleNavigation);
    }

    return {createTransaction, sendMoney, isConfirmed, setIsConfirmed, formHasBeenSubmitted};
}

export default useExpenseSubmission;
