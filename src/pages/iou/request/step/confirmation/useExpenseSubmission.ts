import useBlockDistanceRequest from '@hooks/useBlockDistanceRequest';

import {isSelfDMSoleDestination} from '@libs/IOUUtils';
import {isGPSDistanceRequest as isGPSDistanceRequestTransactionUtils} from '@libs/TransactionUtils';

import type {ConfirmationSubmissionParams} from '@pages/iou/request/step/IOURequestStepConfirmation/variants/types';

import CONST from '@src/CONST';

import type {CreateTransactionParams} from './submission/types';
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

function useExpenseSubmission(params: ConfirmationSubmissionParams) {
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
