import {useCurrencyListActions} from '@hooks/useCurrencyList';
import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePermissions from '@hooks/usePermissions';

import {getStringifiedGPSCoordinates} from '@libs/GPSDraftDetailsUtils';
import {getReusableP2PReportID} from '@libs/IOUUtils';
import {getReportOrDraftReport, isMoneyRequestReport as isMoneyRequestReportReportUtils} from '@libs/ReportUtils';
import markSubmitExpenseEnd from '@libs/telemetry/markSubmitExpenseEnd';
import {getDistanceRequestType, getIsFromGlobalCreate, getRateID, getSelectedRouteDistance, getValidWaypoints, hasAppliedCommuterExclusion} from '@libs/TransactionUtils';

import {createDistanceRequest as createDistanceRequestIOUActions} from '@userActions/IOU/Split';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {ParticipantsPolicyTags, PersonalDetailsList, PolicyCategories, QuickAction, Report, Rule, TransactionViolation} from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';
import type {CurrentUserPersonalDetails} from '@src/types/onyx/PersonalDetails';
import type Policy from '@src/types/onyx/Policy';
import type {Receipt} from '@src/types/onyx/Transaction';
import type Transaction from '@src/types/onyx/Transaction';
import type DeepValueOf from '@src/types/utils/DeepValueOf';

import type {RefObject} from 'react';
import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import type {CreateTransactionParams, SubmissionHandle} from './types';
import type {DistanceDraftData} from './useDistanceDraftData';
import type {SubmissionRecentlyUsedData} from './useSubmissionRecentlyUsedData';
import type {TransactionTaxValues} from './utils/getTransactionTaxValues';

import getSelectedParticipantsForSubmission from './utils/getSelectedParticipantsForSubmission';
import performPostBatchCleanup from './utils/performPostBatchCleanup';

type UseDistanceSubmissionParams = TransactionTaxValues & {
    transaction: OnyxEntry<Transaction>;
    transactions: Transaction[];
    receiptFiles: Record<string, Receipt>;
    report: OnyxEntry<Report>;
    policy: OnyxEntry<Policy>;
    policyCategories: OnyxEntry<PolicyCategories>;
    personalDetails: OnyxEntry<PersonalDetailsList>;
    currentUserPersonalDetails: CurrentUserPersonalDetails;
    selectedParticipants: Participant[];
    iouType: DeepValueOf<typeof CONST.IOU.TYPE>;
    isGPSDistanceRequest: boolean;
    isManualDistanceRequest: boolean;
    isOdometerDistanceRequest: boolean;
    isTrackIntentUser: boolean;
    backToReport?: string;
    draftTransactionIDs: string[] | undefined;
    isLookingAroundUser: boolean;
    isSelfDMDestination: boolean;
    action: DeepValueOf<typeof CONST.IOU.ACTION>;
    onExpenseWriteWillStart?: () => void;

    /** TEMP: hoisted in useExpenseSubmission so these Onyx keys open once across all mounted submission hooks.
     *  Read them here again once the page forks into per-path variants and only one hook mounts. */
    recentlyUsedData: SubmissionRecentlyUsedData;
    rules: OnyxCollection<Rule>;
    quickAction: OnyxEntry<QuickAction>;
    transactionViolationsRef: RefObject<OnyxCollection<TransactionViolation[]>>;
    distanceDraftData: DistanceDraftData;
    delegateAccountID: number | undefined;
    participantsPolicyTags: ParticipantsPolicyTags;
};

/** Hook implementing the distance-request submission path (CreateDistanceRequest) for the expense confirmation screen. */
function useDistanceSubmission({
    transaction,
    transactions,
    receiptFiles,
    report,
    policy,
    policyCategories,
    personalDetails,
    currentUserPersonalDetails,
    selectedParticipants,
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
    recentlyUsedData,
    rules,
    quickAction,
    transactionViolationsRef,
    distanceDraftData,
    delegateAccountID,
    participantsPolicyTags,
}: UseDistanceSubmissionParams): SubmissionHandle {
    const {formatPhoneNumber} = useLocalize();
    const {getCurrencyDecimals} = useCurrencyListActions();
    const {isBetaEnabled, isBetaEnabledOrUnknown} = usePermissions();
    const isVendorMatchingBetaEnabled = isBetaEnabledOrUnknown(CONST.BETAS.VENDOR_MATCHING);
    const isASAPSubmitBetaEnabled = isBetaEnabled(CONST.BETAS.ASAP_SUBMIT);

    const {policyRecentlyUsedCategories, policyRecentlyUsedTags, policyRecentlyUsedCurrencies} = recentlyUsedData;
    const {gpsDraftDetails, recentWaypoints, odometerDraft, originalTransactionDistance, modifiedTransactionDistance} = distanceDraftData;

    const selectedParticipantsForRequest = getSelectedParticipantsForSubmission({transaction, iouType, selectedParticipants});
    const isMoneyRequestReport = isMoneyRequestReportReportUtils(report);
    const currentChatReport = isMoneyRequestReport ? getReportOrDraftReport(report?.chatReportID) : report;
    const moneyRequestReportID = isMoneyRequestReport ? report?.reportID : '';
    const [moneyRequestReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${moneyRequestReportID}`);
    const firstSelectedParticipantReportID = selectedParticipantsForRequest.at(0)?.reportID;
    const [selectedParticipantsReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${firstSelectedParticipantReportID}`);
    const iouReportPolicyID = (moneyRequestReportID ? moneyRequestReport?.policyID : undefined) ?? currentChatReport?.policyID ?? selectedParticipantsReport?.policyID;
    const [iouReportPolicyTagList] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${iouReportPolicyID}`);

    function createTransaction({shouldHandleNavigation = true}: CreateTransactionParams) {
        if (!transaction) {
            markSubmitExpenseEnd();
            return;
        }
        const participant = selectedParticipantsForRequest.at(0);
        if (!participant) {
            markSubmitExpenseEnd();
            return;
        }
        const trimmedComment = transaction.comment?.comment?.trim() ?? '';

        onExpenseWriteWillStart?.();

        // Same reasoning as above: reuse the confirmation screen's optimistic report ID for a brand-new
        // P2P recipient, so the screen isn't left subscribed to a report ID that's never created.
        const optimisticChatReportID = getReusableP2PReportID(participant, transaction.reportID);
        const shouldIncludeCommuterExclusionOverrides = hasAppliedCommuterExclusion(transaction);

        const {chatReportID: distanceChatReportID, transactionID: distanceTransactionID} = createDistanceRequestIOUActions({
            isVendorMatchingBetaEnabled,
            getCurrencyDecimals,
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
                ...(shouldIncludeCommuterExclusionOverrides && typeof transaction.modifiedAmount === 'number' && {modifiedAmount: transaction.modifiedAmount}),
                ...(shouldIncludeCommuterExclusionOverrides && transaction.modifiedMerchant && {modifiedMerchant: transaction.modifiedMerchant}),
                comment: trimmedComment,
                distance: originalTransactionDistance,
                modifiedDistance: modifiedTransactionDistance,
                created: transaction.created,
                currency: transaction.currency,
                merchant: transaction.merchant,
                category: transaction.category,
                tag: transaction.tag,
                taxCode: transactionTaxCode,
                taxAmount: transactionTaxAmount,
                taxValue: transactionTaxValue,
                customUnitRateID: getRateID(transaction) ?? '',
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
                distanceRequestType: getDistanceRequestType(transaction),
                selectedRouteDistance: getSelectedRouteDistance(transaction),
            },
            isASAPSubmitBetaEnabled,
            transactionViolations: transactionViolationsRef.current,
            quickAction,
            policyRecentlyUsedCurrencies,
            personalDetails,
            recentWaypoints,
            previousOdometerDraft: odometerDraft,
            isTrackIntentUser,
            delegateAccountID,
            formatPhoneNumber,
            participantsPolicyTags,
            rules,
        });

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
            allTransactionsCreated: true,
            fallbackOptimisticChatReportID: distanceChatReportID,
            navigateBackToReport: backToReport,
            lastOptimisticTransactionID: distanceTransactionID,
            preResolvedChatTarget: {
                report: isExpenseReport ? report : undefined,
                chatReportID: isExpenseReport ? '' : distanceChatReportID,
            },
        });
        markSubmitExpenseEnd();
    }

    return {createTransaction};
}

export default useDistanceSubmission;
