import type {OnyxEntry} from 'react-native-onyx';
import {getIsFromGlobalCreate} from '@libs/TransactionUtils';
import type {Report} from '@src/types/onyx';
import type Transaction from '@src/types/onyx/Transaction';
import cleanupAndNavigateAfterExpenseCreate from './cleanupAndNavigateAfterExpenseCreate';

type BuildPostDistanceTrackCallbackParams = {
    report: OnyxEntry<Report>;
    draftTransactionIDs: string[] | undefined;
    transaction: OnyxEntry<Transaction>;
    backToReport: string | undefined;
};

function buildPostDistanceTrackCallback({report, draftTransactionIDs, transaction, backToReport}: BuildPostDistanceTrackCallbackParams) {
    return (lastTransactionID: string | undefined, optimisticChatReportID?: string) => {
        cleanupAndNavigateAfterExpenseCreate({
            report,
            draftTransactionIDs,
            transactionID: lastTransactionID,
            isFromGlobalCreate: getIsFromGlobalCreate(transaction),
            backToReport,
            optimisticChatReportID,
        });
    };
}

export default buildPostDistanceTrackCallback;
