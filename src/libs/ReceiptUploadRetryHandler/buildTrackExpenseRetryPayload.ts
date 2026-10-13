/** Decides whether a failed `TrackExpense` can be retried and rebuilds the call from Onyx. */
import {getAllReportActions, isCreatedAction} from '@libs/ReportActionsUtils';
import {isSelfDM} from '@libs/ReportUtils';

import {getAllReports, getCurrentUserPersonalDetails} from '@userActions/IOU';
import type {CreateTrackExpenseParams} from '@userActions/IOU/types/CreateTrackExpenseParams';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';
import type {FileObject} from '@src/types/utils/Attachment';

import type {ReceiptRetryContext} from './types';

import {buildRetryTransactionParams, getCurrentUserAccountID, isRetryableFlow, resolveParticipant} from './buildRetryPayload';

function canBuildTrackExpenseRetryPayload(context: ReceiptRetryContext): boolean {
    const {transaction, iouReport, receiptError} = context;
    if (receiptError.action !== CONST.IOU.ACTION_PARAMS.TRACK_EXPENSE || !isSelfDM(iouReport)) {
        return false;
    }
    return isRetryableFlow(context) && !!iouReport?.reportID && !!transaction?.transactionID && !!resolveParticipant(iouReport);
}

/** Rebuilds the `TrackExpense` call behind a failed receipt upload from the records the failure left in Onyx. */
function buildTrackExpenseRetryPayload(context: ReceiptRetryContext, receiptFile: FileObject): CreateTrackExpenseParams | undefined {
    const {
        transaction,
        iouReport,
        iouActionID,
        transactionThreadReportID,
        policyParams,
        rules,
        conciergeReportID,
        isSelfTourViewed,
        isASAPSubmitBetaEnabled,
        introSelected,
        delegateAccountID,
        getCurrencyDecimals,
    } = context;
    const participant = resolveParticipant(iouReport);
    if (!canBuildTrackExpenseRetryPayload(context) || !transaction || !iouReport || !participant) {
        return undefined;
    }

    const currentUser = getCurrentUserPersonalDetails();
    const transactionParams = buildRetryTransactionParams(context, receiptFile);
    if (!transactionParams) {
        return undefined;
    }

    return {
        report: iouReport,
        isDraftPolicy: false,
        isDraftChatReport: false,
        participantParams: {
            payeeEmail: currentUser?.login,
            payeeAccountID: getCurrentUserAccountID(),
            participant,
        },
        policyParams,
        transactionParams,
        optimisticTransactionID: transaction.transactionID,
        currentReportActionID: iouActionID,
        existingTransactionThreadReportID: transactionThreadReportID,
        existingTransactionThreadCreatedReportActionID: Object.values(getAllReportActions(transactionThreadReportID)).find((action) => isCreatedAction(action))?.reportActionID,
        existingTransaction: transaction,
        isASAPSubmitBetaEnabled,
        currentUser: {
            accountID: getCurrentUserAccountID(),
            email: currentUser?.login ?? '',
        },
        introSelected,
        conciergeChat: conciergeReportID ? getAllReports()?.[`${ONYXKEYS.COLLECTION.REPORT}${conciergeReportID}`] : undefined,
        quickAction: undefined,
        recentWaypoints: [],
        isSelfTourViewed,
        currentUserLocalCurrency: undefined,
        delegateAccountID,
        reportActionsList: undefined,
        getCurrencyDecimals,
        rules,
    };
}

export default buildTrackExpenseRetryPayload;
export {canBuildTrackExpenseRetryPayload};
