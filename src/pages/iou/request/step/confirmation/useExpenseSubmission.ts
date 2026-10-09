import useBlockDistanceRequest from '@hooks/useBlockDistanceRequest';
import useDelegateAccountID from '@hooks/useDelegateAccountID';
import useOnyx from '@hooks/useOnyx';

import {isSelfDMSoleDestination} from '@libs/IOUUtils';
import {findSelfDMReportID} from '@libs/ReportUtils';
import {getSpan} from '@libs/telemetry/activeSpans';
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

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import {hasSeenTourSelector} from '@selectors/Onboarding';

import type {CreateTransactionParams} from './submission/types';
import type {SubmitLock} from './submission/useSubmitLock';
import type {SubmissionPath} from './submission/utils/resolveSubmissionPath';

import useDistanceDraftData from './submission/useDistanceDraftData';
import useGpsCapture from './submission/useGpsCapture';
import useRequestMoneySubmission from './submission/useRequestMoneySubmission';
import useSubmissionOnboardingIntent from './submission/useSubmissionOnboardingIntent';
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

    /** Draft reports, needed to resolve chats that only exist in REPORT_DRAFT (e.g. a not-yet-created workspace chat) */
    reportDrafts: OnyxCollection<Report>;

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

    /** The page-owned submit lock, shared with the page's destination pre-mount. */
    submitLock: SubmitLock;
};

function useExpenseSubmission(params: UseExpenseSubmissionParams) {
    const {
        transaction,
        transactions,
        receiptFiles,
        canEnterScanFieldsManually,
        report,
        reportDrafts,
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
        submitLock,
    } = params;
    const {acquireSubmitLock} = submitLock;

    const isSelfDMDestination = isSelfDMSoleDestination(participants, iouType, currentUserPersonalDetails.accountID);
    const selectedParticipants = participants.filter((participant) => participant.selected);

    const {introSelected, isTrackIntentUser, isLookingAroundUser} = useSubmissionOnboardingIntent();

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
    const {transactionViolationsRef} = useSubmissionViolations();
    const distanceDraftData = useDistanceDraftData({transaction, isGPSDistanceRequest, isManualDistanceRequest, isOdometerDistanceRequest});
    const {submitWithGpsPoint} = useGpsCapture();
    const [policyTags] = useOnyx(`${ONYXKEYS.COLLECTION.POLICY_TAGS}${policy?.id}`);
    const [rules] = useOnyx(ONYXKEYS.COLLECTION.RULE);
    const [quickAction] = useOnyx(ONYXKEYS.NVP_QUICK_ACTION_GLOBAL_CREATE);
    const [isSelfTourViewed = false] = useOnyx(ONYXKEYS.NVP_ONBOARDING, {selector: hasSeenTourSelector});
    const [conciergeReportID] = useOnyx(ONYXKEYS.CONCIERGE_REPORT_ID);
    const [conciergeChat] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${conciergeReportID}`);
    const [selfDMReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${findSelfDMReportID()}`);
    const delegateAccountID = useDelegateAccountID();

    // Only a workspace destination can enforce a workspace's distance rules.
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

    const requestMoneySubmission = useRequestMoneySubmission({
        transaction,
        transactions,
        receiptFiles,
        canEnterScanFieldsManually,
        report,
        reportDrafts,
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
        reportDrafts,
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

    // Distance, split, invoice and per diem submit through their own variants; this composer only serves the paths that haven't forked yet.
    const submitByPath: Record<
        Exclude<SubmissionPath, typeof SUBMISSION_PATH.DISTANCE | typeof SUBMISSION_PATH.SPLIT | typeof SUBMISSION_PATH.INVOICE | typeof SUBMISSION_PATH.PER_DIEM>,
        (params: CreateTransactionParams) => boolean
    > = {
        [SUBMISSION_PATH.TRACK]: trackSubmission.createTransaction,
        [SUBMISSION_PATH.REQUEST_MONEY]: requestMoneySubmission.createTransaction,
    };

    function createTransaction({locationPermissionGranted = false, shouldHandleNavigation = true, writeBarrier}: CreateTransactionParams): boolean {
        if (
            submissionPath === SUBMISSION_PATH.DISTANCE ||
            submissionPath === SUBMISSION_PATH.SPLIT ||
            submissionPath === SUBMISSION_PATH.INVOICE ||
            submissionPath === SUBMISSION_PATH.PER_DIEM
        ) {
            return false;
        }
        getSpan(CONST.TELEMETRY.SPAN_SUBMIT_EXPENSE)?.setAttribute(CONST.TELEMETRY.ATTRIBUTE_LOCATION_SOURCE, CONST.TELEMETRY.SUBMIT_EXPENSE_LOCATION_SOURCE.NONE);
        if (blockDistanceRequestIfNeeded()) {
            return false;
        }

        if (!acquireSubmitLock()) {
            return false;
        }

        // Telemetry spans (SPAN_SUBMIT_EXPENSE, SPAN_SUBMIT_TO_DESTINATION_VISIBLE)
        // are started by SubmitExpenseOrchestrator before calling createTransaction.
        return submitByPath[submissionPath]({locationPermissionGranted, shouldHandleNavigation, writeBarrier});
    }

    return {createTransaction};
}

export default useExpenseSubmission;
export type {UseExpenseSubmissionParams};
