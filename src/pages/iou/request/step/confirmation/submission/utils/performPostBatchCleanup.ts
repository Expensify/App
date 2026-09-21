import {getExistingTransactionID} from '@libs/IOUUtils';
import cleanupAfterExpenseCreate from '@libs/Navigation/helpers/cleanupAfterExpenseCreate';
import cleanupAndNavigateAfterExpenseCreate from '@libs/Navigation/helpers/cleanupAndNavigateAfterExpenseCreate';
import {getIsFromGlobalCreate} from '@libs/TransactionUtils';

import {resolveChatTargetForSubmitCleanup} from '@pages/iou/request/step/resolveChatTarget';

import type CONST from '@src/CONST';
import type {Report} from '@src/types/onyx';
import type {Participant} from '@src/types/onyx/IOU';
import type {CurrentUserPersonalDetails} from '@src/types/onyx/PersonalDetails';
import type Transaction from '@src/types/onyx/Transaction';
import type DeepValueOf from '@src/types/utils/DeepValueOf';

import type {OnyxEntry} from 'react-native-onyx';

type PerformPostBatchCleanupParams = {
    transactions: Transaction[];
    report: OnyxEntry<Report>;
    action: DeepValueOf<typeof CONST.IOU.ACTION>;
    draftTransactionIDs: string[] | undefined;
    currentUserPersonalDetails: CurrentUserPersonalDetails;
    isLookingAroundUser: boolean;
    isSelfDMDestination: boolean;
    participant: Participant;
    shouldHandleNavigation: boolean;
    allTransactionsCreated: boolean;
    fallbackOptimisticChatReportID: string;
    navigateBackToReport: string | undefined;
    lastOptimisticTransactionID: string | undefined;
    preResolvedChatTarget?: {report: OnyxEntry<Report>; chatReportID: string};
};

function performPostBatchCleanup({
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
    fallbackOptimisticChatReportID,
    navigateBackToReport,
    lastOptimisticTransactionID,
    preResolvedChatTarget,
}: PerformPostBatchCleanupParams) {
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
        isLookingAroundUser,
        isSelfDMDestination,
    });
}

export default performPostBatchCleanup;
