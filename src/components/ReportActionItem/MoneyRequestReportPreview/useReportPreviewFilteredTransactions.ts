import useNetwork from '@hooks/useNetwork';
import useReportTransactionsCollection from '@hooks/useReportTransactionsCollection';

import CONST from '@src/CONST';
import type {Transaction} from '@src/types/onyx';

function useReportPreviewFilteredTransactions(iouReportID: string | undefined) {
    const {isOffline} = useNetwork();
    const reportTransactionsCollection = useReportTransactionsCollection(iouReportID);
    return Object.values(reportTransactionsCollection ?? {}).filter(
        (transaction): transaction is Transaction => !!transaction && (isOffline || transaction.pendingAction !== CONST.RED_BRICK_ROAD_PENDING_ACTION.DELETE),
    );
}

export default useReportPreviewFilteredTransactions;
