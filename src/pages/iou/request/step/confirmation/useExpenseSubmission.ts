import useBlockDistanceRequest from '@hooks/useBlockDistanceRequest';

import {isSelfDMSoleDestination} from '@libs/IOUUtils';
import {isGPSDistanceRequest as isGPSDistanceRequestTransactionUtils} from '@libs/TransactionUtils';

import CONST from '@src/CONST';
import type {PersonalDetailsList, PolicyCategories, Report} from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';
import type {CurrentUserPersonalDetails} from '@src/types/onyx/PersonalDetails';
import type Policy from '@src/types/onyx/Policy';
import type {Receipt} from '@src/types/onyx/Transaction';
import type Transaction from '@src/types/onyx/Transaction';
import type DeepValueOf from '@src/types/utils/DeepValueOf';

import type {OnyxCollection, OnyxEntry} from 'react-native-onyx';

import type {CreateTransactionParams} from './submission/types';
import type {SubmitLock} from './submission/useSubmitLock';
import type {SubmissionPath} from './submission/utils/resolveSubmissionPath';

import useDistanceSubmission from './submission/useDistanceSubmission';
import useInvoiceSubmission from './submission/useInvoiceSubmission';
import usePerDiemSubmission from './submission/usePerDiemSubmission';
import useRequestMoneySubmission from './submission/useRequestMoneySubmission';
import useSendMoneySubmission from './submission/useSendMoneySubmission';
import useSplitSubmission from './submission/useSplitSubmission';
import useTrackExpenseSubmission from './submission/useTrackExpenseSubmission';
import getTransactionTaxValues from './submission/utils/getTransactionTaxValues';
import guardSubmission from './submission/utils/guardSubmission';
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
        reportID,
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
    const {setIsConfirmed, unlockSubmission} = submitLock;

    const isSelfDMDestination = isSelfDMSoleDestination(participants, iouType, currentUserPersonalDetails.accountID);
    const selectedParticipants = participants.filter((participant) => participant.selected);

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

    const {sendMoney} = useSendMoneySubmission({
        transaction,
        receiptFiles,
        report,
        participants,
        currentUserPersonalDetails,
        setIsConfirmed,
        onExpenseWriteWillStart,
    });

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
        draftTransactionIDs,
        privateIsArchivedMap,
        backToReport,
        transactionTaxCode,
        transactionTaxAmount,
        transactionTaxValue,
        onExpenseWriteWillStart,
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
        draftTransactionIDs,
        privateIsArchivedMap,
        transactionTaxCode,
        transactionTaxAmount,
        transactionTaxValue,
        onExpenseWriteWillStart,
    });

    const splitSubmission = useSplitSubmission({
        transaction,
        transactions,
        receiptFiles,
        report,
        policyID: policy?.id,
        personalDetails,
        currentUserPersonalDetails,
        selectedParticipants,
        iouType,
        releaseSubmitLock: unlockSubmission,
        transactionTaxCode,
        transactionTaxAmount,
        transactionTaxValue,
    });

    const distanceSubmission = useDistanceSubmission({
        transaction,
        transactions,
        receiptFiles,
        report,
        reportDrafts,
        policy,
        policyCategories,
        personalDetails,
        currentUserPersonalDetails,
        selectedParticipants,
        iouType,
        isGPSDistanceRequest,
        isManualDistanceRequest,
        isOdometerDistanceRequest,
        transactionTaxCode,
        transactionTaxAmount,
        transactionTaxValue,
        backToReport,
        draftTransactionIDs,
        isSelfDMDestination,
        action,
        onExpenseWriteWillStart,
    });

    const perDiemSubmission = usePerDiemSubmission({
        transaction,
        report,
        reportDrafts,
        policy,
        policyCategories,
        personalDetails,
        currentUserPersonalDetails,
        selectedParticipants,
        isTrackExpense,
        isSelfDMDestination,
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

    const submitByPath: Record<SubmissionPath, (params: CreateTransactionParams) => boolean> = {
        [SUBMISSION_PATH.DISTANCE]: distanceSubmission.createTransaction,
        [SUBMISSION_PATH.SPLIT]: splitSubmission.createTransaction,
        [SUBMISSION_PATH.INVOICE]: invoiceSubmission.createTransaction,
        [SUBMISSION_PATH.TRACK]: trackSubmission.createTransaction,
        [SUBMISSION_PATH.PER_DIEM]: perDiemSubmission.createTransaction,
        [SUBMISSION_PATH.REQUEST_MONEY]: requestMoneySubmission.createTransaction,
    };

    const createTransaction = guardSubmission(
        submitLock,
        ({locationPermissionGranted = false, shouldHandleNavigation = true, writeBarrier}: CreateTransactionParams) =>
            submitByPath[submissionPath]({locationPermissionGranted, shouldHandleNavigation, writeBarrier}),
        blockDistanceRequestIfNeeded,
    );

    return {createTransaction, sendMoney};
}

export default useExpenseSubmission;
