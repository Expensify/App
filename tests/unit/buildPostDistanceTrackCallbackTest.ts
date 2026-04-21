import buildPostDistanceTrackCallback from '@libs/Navigation/helpers/buildPostDistanceTrackCallback';
import cleanupAndNavigateAfterExpenseCreate from '@libs/Navigation/helpers/cleanupAndNavigateAfterExpenseCreate';
import type {Report} from '@src/types/onyx';
import type Transaction from '@src/types/onyx/Transaction';

jest.mock('@libs/Navigation/helpers/cleanupAndNavigateAfterExpenseCreate', () => jest.fn());

describe('buildPostDistanceTrackCallback', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should forward isFromGlobalCreate=true when the transaction was started from the FAB (isFromFloatingActionButton)', () => {
        const transaction = {isFromFloatingActionButton: true} as Transaction;
        const callback = buildPostDistanceTrackCallback({report: undefined, draftTransactionIDs: [], transaction, backToReport: undefined});

        callback('txn-1');

        expect(cleanupAndNavigateAfterExpenseCreate).toHaveBeenCalledWith(expect.objectContaining({isFromGlobalCreate: true}));
    });

    it('should forward the full cleanup payload unchanged (report, draftTransactionIDs, transactionID, isFromGlobalCreate, backToReport)', () => {
        const transaction = {isFromGlobalCreate: true} as Transaction;
        const report = {reportID: 'r-1'} as Report;
        const callback = buildPostDistanceTrackCallback({report, draftTransactionIDs: ['d-1'], transaction, backToReport: 'back-1'});

        callback('txn-2');

        expect(cleanupAndNavigateAfterExpenseCreate).toHaveBeenCalledWith({
            report,
            draftTransactionIDs: ['d-1'],
            transactionID: 'txn-2',
            isFromGlobalCreate: true,
            backToReport: 'back-1',
        });
    });
});
