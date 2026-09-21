import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useDelegateAccountID from '@hooks/useDelegateAccountID';
import useLocalize from '@hooks/useLocalize';
import useMoneyRequestPolicyTags from '@hooks/useMoneyRequestPolicyTags';
import useOnboardingTaskInformation from '@hooks/useOnboardingTaskInformation';
import useOnyx from '@hooks/useOnyx';
import useParentReportAction from '@hooks/useParentReportAction';
import usePermissions from '@hooks/usePermissions';
import useTransactionsByID from '@hooks/useTransactionsByID';

import {completeTestDriveTask} from '@libs/actions/Task';
import {WRITE_COMMANDS} from '@libs/API/types';
import DistanceRequestUtils from '@libs/DistanceRequestUtils';
import {getExistingTransactionID, getReusableP2PReportID, resolveOptimisticChatReportID} from '@libs/IOUUtils';
import {rand64, roundToTwoDecimalPlaces} from '@libs/NumberUtils';
import {isMoneyRequestReport as isMoneyRequestReportReportUtils} from '@libs/ReportUtils';
import {
    getIsFromGlobalCreate,
    getRateID,
    getValidWaypoints,
    isDistanceRequest as isDistanceRequestTransactionUtils,
    isManualDistanceRequest as isManualDistanceRequestTransactionUtils,
} from '@libs/TransactionUtils';

import {requestMoney as requestMoneyIOUActions} from '@userActions/IOU/TrackExpense';
import type {GPSPoint as GpsPoint} from '@userActions/IOU/types/TrackExpenseTransactionParams';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {PersonalDetailsList, PolicyCategories, QuickAction, Report, Rule, TransactionViolation} from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';
import type {CurrentUserPersonalDetails} from '@src/types/onyx/PersonalDetails';
import type Policy from '@src/types/onyx/Policy';
import type {Receipt} from '@src/types/onyx/Transaction';
import type Transaction from '@src/types/onyx/Transaction';
import type DeepValueOf from '@src/types/utils/DeepValueOf';

import type {RefObject} from 'react';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import {delegateEmailSelector} from '@selectors/Account';

import type {CreateTransactionParams, SubmissionHandle} from './types';
import type {SubmitWithGpsPoint} from './useGpsCapture';
import type {SubmissionRecentlyUsedData} from './useSubmissionRecentlyUsedData';
import type {TransactionTaxValues} from './utils/getTransactionTaxValues';

import getCurrentReceiptState from './utils/getCurrentReceiptState';
import logSubmittedReceiptMilestone from './utils/logSubmittedReceiptMilestone';
import performPostBatchCleanup from './utils/performPostBatchCleanup';

const shouldGenerateTransactionThreadReport = false;

type UseRequestMoneySubmissionParams = TransactionTaxValues & {
    transaction: OnyxEntry<Transaction>;
    transactions: Transaction[];
    receiptFiles: Record<string, Receipt>;
    canEnterScanFieldsManually: boolean;
    report: OnyxEntry<Report>;
    policy: OnyxEntry<Policy>;
    policyCategories: OnyxEntry<PolicyCategories>;
    personalDetails: OnyxEntry<PersonalDetailsList>;
    currentUserPersonalDetails: CurrentUserPersonalDetails;
    selectedParticipants: Participant[];
    iouType: DeepValueOf<typeof CONST.IOU.TYPE>;
    action: DeepValueOf<typeof CONST.IOU.ACTION>;
    isGPSDistanceRequest: boolean;
    isTimeRequest: boolean;
    isMovingTransactionFromTrackExpense: boolean;
    isCategorizingTrackExpense: boolean;
    isSharingTrackExpense: boolean;
    isSelfDMDestination: boolean;
    isLookingAroundUser: boolean;
    isTrackIntentUser: boolean;
    draftTransactionIDs: string[] | undefined;
    privateIsArchivedMap: Record<string, boolean | undefined>;
    backToReport?: string;
    onExpenseWriteWillStart?: () => void;

    /** TEMP: hoisted in useExpenseSubmission so these Onyx keys open once across all mounted submission hooks.
     *  Read them here again once the page forks into per-path variants and only one hook mounts. */
    recentlyUsedData: SubmissionRecentlyUsedData;
    rules: OnyxCollection<Rule>;
    quickAction: OnyxEntry<QuickAction>;
    isSelfTourViewed: boolean;
    conciergeChat: OnyxEntry<Report>;
    transactionViolationsRef: RefObject<OnyxCollection<TransactionViolation[]>>;
    submitWithGpsPoint: SubmitWithGpsPoint;
};

function useRequestMoneySubmission({
    transaction,
    transactions,
    receiptFiles,
    canEnterScanFieldsManually,
    report,
    policy,
    policyCategories,
    personalDetails,
    currentUserPersonalDetails,
    selectedParticipants,
    iouType,
    action,
    isGPSDistanceRequest,
    isTimeRequest,
    isMovingTransactionFromTrackExpense,
    isCategorizingTrackExpense,
    isSharingTrackExpense,
    isSelfDMDestination,
    isLookingAroundUser,
    isTrackIntentUser,
    draftTransactionIDs,
    privateIsArchivedMap,
    backToReport,
    transactionTaxCode,
    transactionTaxAmount,
    transactionTaxValue,
    onExpenseWriteWillStart,
    recentlyUsedData,
    rules,
    quickAction,
    isSelfTourViewed,
    conciergeChat,
    transactionViolationsRef,
    submitWithGpsPoint,
}: UseRequestMoneySubmissionParams): SubmissionHandle {
    const {translate, toLocaleDigit, formatPhoneNumber} = useLocalize();
    const {getCurrencyDecimals, getCurrencySymbol} = useCurrencyListActions();
    const delegateAccountID = useDelegateAccountID();
    const {isBetaEnabled, isBetaEnabledOrUnknown} = usePermissions();
    const isVendorMatchingBetaEnabled = isBetaEnabledOrUnknown(CONST.BETAS.VENDOR_MATCHING);
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);

    const {policyRecentlyUsedCategories, policyRecentlyUsedTags, policyRecentlyUsedCurrencies} = recentlyUsedData;
    const [delegateEmail] = useOnyx(ONYXKEYS.ACCOUNT, {selector: delegateEmailSelector});

    const isIouReport = isMoneyRequestReportReportUtils(report);
    const policyTagsForRequestMoney = useMoneyRequestPolicyTags({
        moneyRequestReportID: isIouReport ? report?.reportID : undefined,
        parentChatReportPolicyID: isMovingTransactionFromTrackExpense ? undefined : report?.policyID,
        participantReportID: selectedParticipants?.at(0)?.reportID,
    });

    const [storedTransactions] = useTransactionsByID(transactions?.map((tx) => tx.transactionID));

    const {
        taskReport: viewTourTaskReport,
        taskParentReport: viewTourTaskParentReport,
        isOnboardingTaskParentReportArchived: isViewTourTaskParentReportArchived,
        hasOutstandingChildTask,
    } = useOnboardingTaskInformation(CONST.ONBOARDING_TASK_TYPE.VIEW_TOUR);
    const parentReportAction = useParentReportAction(viewTourTaskReport);

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
                    customUnitRateID: getRateID(transaction) ?? '',
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

    function createTransaction({locationPermissionGranted = false, shouldHandleNavigation = true}: CreateTransactionParams) {
        const hasAnyReceiptFile = Object.values(receiptFiles).filter((receipt) => !!receipt).length > 0;
        // A zero amount means the expense came through the "Scan" flow, which needs GPS coordinates attached.
        const shouldCaptureGpsPoint = hasAnyReceiptFile && !!transaction && transaction.amount === 0 && !isSharingTrackExpense && !isCategorizingTrackExpense && locationPermissionGranted;

        submitWithGpsPoint({shouldCaptureGpsPoint, shouldHandleNavigation, write: requestMoney});
    }

    return {createTransaction};
}

export default useRequestMoneySubmission;
