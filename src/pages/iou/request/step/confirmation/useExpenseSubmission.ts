import useBlockDistanceRequest from '@hooks/useBlockDistanceRequest';
import useDelegateAccountID from '@hooks/useDelegateAccountID';
import useNetwork from '@hooks/useNetwork';
import useOnyx from '@hooks/useOnyx';
import useParticipantsPolicyTags from '@hooks/useParticipantsPolicyTags';
import useReportTransactions from '@hooks/useReportTransactions';

import {isLookingAroundSearchRoutingActive, isSelfDMSoleDestination} from '@libs/IOUUtils';
import {isTrackOnboardingChoice} from '@libs/OnboardingUtils';
import {findSelfDMReportID} from '@libs/ReportUtils';
import {isGPSDistanceRequest as isGPSDistanceRequestTransactionUtils} from '@libs/TransactionUtils';

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

import {hasSeenTourSelector} from '@selectors/Onboarding';
import {useRef, useState} from 'react';

import type {CreateTransactionParams} from './submission/types';
import type {SubmissionPath} from './submission/utils/resolveSubmissionPath';

import useDistanceDraftData from './submission/useDistanceDraftData';
import useDistanceSubmission from './submission/useDistanceSubmission';
import useGpsCapture from './submission/useGpsCapture';
import useInvoiceSubmission from './submission/useInvoiceSubmission';
import usePerDiemSubmission from './submission/usePerDiemSubmission';
import useRequestMoneySubmission from './submission/useRequestMoneySubmission';
import useSendMoneySubmission from './submission/useSendMoneySubmission';
import useSplitSubmission from './submission/useSplitSubmission';
import useSubmissionRecentlyUsedData from './submission/useSubmissionRecentlyUsedData';
import useSubmissionViolations from './submission/useSubmissionViolations';
import useTrackExpenseSubmission from './submission/useTrackExpenseSubmission';
import getTransactionTaxValues from './submission/utils/getTransactionTaxValues';
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

    const [isConfirmed, setIsConfirmed] = useState(false);
    const formHasBeenSubmitted = useRef(false);

    // formHasBeenSubmitted is never reset on its own, so a submit that returns without writing has to hand the page back or every later tap is swallowed.
    const releaseSubmitLock = () => {
        formHasBeenSubmitted.current = false;
        setIsConfirmed(false);
    };

    const isSelfDMDestination = isSelfDMSoleDestination(participants, iouType, currentUserPersonalDetails.accountID);
    const selectedParticipants = participants.filter((participant) => participant.selected);

    const [introSelected] = useOnyx(ONYXKEYS.NVP_INTRO_SELECTED);
    const isTrackIntentUser = isTrackOnboardingChoice(introSelected?.choice);
    const {isOffline} = useNetwork();
    const isLookingAroundUser = isLookingAroundSearchRoutingActive(introSelected?.choice === CONST.ONBOARDING_CHOICES.LOOKING_AROUND, isOffline);

    const isTrackExpense = iouType === CONST.IOU.TYPE.TRACK;
    const isGPSDistanceRequest = isGPSDistanceRequestTransactionUtils(transaction);

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

    /**
     * TEMP: shared Onyx reads hoisted here so they open once instead of once per submission hook.
     *
     * All six submission hooks mount together while this composer exists, so each one calling these itself
     * opened duplicate subscriptions on a page that previously had none. They are passed down as params
     * until the page forks into per-path variants - at that point only one submission hook mounts, each hook
     * goes back to reading what it needs, and every `TEMP` param below disappears.
     */
    const recentlyUsedData = useSubmissionRecentlyUsedData(policy?.id);
    const {transactionViolations, transactionViolationsRef} = useSubmissionViolations();
    const distanceDraftData = useDistanceDraftData({transaction, isGPSDistanceRequest, isManualDistanceRequest, isOdometerDistanceRequest});
    const {submitWithGpsPoint} = useGpsCapture();
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policy?.id}`);
    const [rules] = useOnyx(ONYXKEYS.COLLECTION.RULE);
    const [quickAction] = useOnyx(ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE);
    const [isSelfTourViewed = false] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [conciergeChat] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${conciergeReportID}`);
    const [selfDMReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${findSelfDMReportID()}`);
    const reportTransactions = useReportTransactions(report?.reportID);
    const delegateAccountID = useDelegateAccountID();
    const participantsPolicyTags = useParticipantsPolicyTags(participants ?? []);

    const blockDistanceRequestIfNeeded = useBlockDistanceRequest({
        policyID: isPolicyExpenseChat ? policy?.id : undefined,
        isDistanceRequest,
        isManualDistanceRequest,
        isOdometerDistanceRequest,
    });

    // "Submit to my employer" with no existing workspace creates a draft Submit (submit2026) workspace. Route it
    // through trackExpense (AddTrackedExpenseToPolicy) so the workspace is created and the expense submitted
    // atomically, instead of requestMoney/ConvertTrackedExpenseToRequest which can't create a workspace.
    // Scoped to submit2026 drafts only so other (team/corporate) draft flows keep their existing behavior.
    const isSubmittingExpenseToDraftWorkspace = action === CONST.IOU.ACTION.SUBMIT && isDraftPolicy && policy?.type === CONST.POLICY.TYPE.SUBMIT;

    const {sendMoney} = useSendMoneySubmission({
        transaction,
        receiptFiles,
        report,
        participants,
        currentUserPersonalDetails,
        setIsConfirmed,
        quickAction,
        reportTransactions,
        delegateAccountID,
        onExpenseWriteWillStart,
    });

    const requestMoneySubmission = useRequestMoneySubmission({
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
        delegateAccountID,
    });

    const trackSubmission = useTrackExpenseSubmission({
        transaction,
        transactions,
        receiptFiles,
        canEnterScanFieldsManually,
        report,
        policy,
        policyCategories,
        isDraftPolicy,
        personalDetails,
        currentUserPersonalDetails,
        selectedParticipants,
        iouType,
        action,
        isGPSDistanceRequest,
        isManualDistanceRequest,
        isOdometerDistanceRequest,
        isCategorizingTrackExpense,
        isSharingTrackExpense,
        isSubmittingExpenseToDraftWorkspace,
        isSelfDMDestination,
        isLookingAroundUser,
        draftTransactionIDs,
        privateIsArchivedMap,
        transactionTaxCode,
        transactionTaxAmount,
        transactionTaxValue,
        onExpenseWriteWillStart,
        policyTags,
        rules,
        quickAction,
        introSelected,
        isSelfTourViewed,
        conciergeChat,
        selfDMReport,
        distanceDraftData,
        submitWithGpsPoint,
        delegateAccountID,
    });

    const splitSubmission = useSplitSubmission({
        transaction,
        transactions,
        receiptFiles,
        report,
        personalDetails,
        currentUserPersonalDetails,
        selectedParticipants,
        iouType,
        isTrackIntentUser,
        releaseSubmitLock,
        transactionTaxCode,
        transactionTaxAmount,
        transactionTaxValue,
        recentlyUsedData,
        rules,
        quickAction,
        transactionViolationsRef,
        reportTransactions,
        delegateAccountID,
        participantsPolicyTags,
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
        recentlyUsedData,
        policyTags,
        rules,
        quickAction,
        selfDMReport,
        transactionViolations,
        reportTransactions,
        delegateAccountID,
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
        recentlyUsedData,
        policyTags,
        delegateAccountID,
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

    const submitByPath: Record<SubmissionPath, (params: CreateTransactionParams) => void> = {
        [SUBMISSION_PATH.DISTANCE]: distanceSubmission.createTransaction,
        [SUBMISSION_PATH.SPLIT]: splitSubmission.createTransaction,
        [SUBMISSION_PATH.INVOICE]: invoiceSubmission.createTransaction,
        [SUBMISSION_PATH.TRACK]: trackSubmission.createTransaction,
        [SUBMISSION_PATH.PER_DIEM]: perDiemSubmission.createTransaction,
        [SUBMISSION_PATH.REQUEST_MONEY]: requestMoneySubmission.createTransaction,
    };

    function createTransaction({locationPermissionGranted = false, shouldHandleNavigation = true}: CreateTransactionParams) {
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
        submitByPath[submissionPath]({locationPermissionGranted, shouldHandleNavigation});
    }

    return {createTransaction, sendMoney, isConfirmed, setIsConfirmed, formHasBeenSubmitted};
}

export default useExpenseSubmission;
