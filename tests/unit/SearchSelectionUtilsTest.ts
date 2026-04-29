import getSearchMoveSelectionValidation from '@components/Search/SearchSelectionUtils';
import type {SelectedTransactionInfo, SelectedTransactions} from '@components/Search/types';
import CONST from '@src/CONST';

function createSelectedTransaction(overrides: Partial<SelectedTransactionInfo> = {}): SelectedTransactionInfo {
    return {
        isSelected: true,
        canReject: false,
        canHold: false,
        canSplit: false,
        hasBeenSplit: false,
        canChangeReport: true,
        isHeld: false,
        canUnhold: false,
        action: CONST.SEARCH.ACTION_TYPES.VIEW,
        reportID: 'report-1',
        policyID: 'policy-1',
        amount: 100,
        currency: 'USD',
        isFromOneTransactionReport: false,
        transaction: {
            transactionID: 'tx-1',
        } as SelectedTransactionInfo['transaction'],
        ...overrides,
    };
}

describe('getSearchMoveSelectionValidation', () => {
    it('allows a same-owner movable selection', () => {
        const selectedTransactions: SelectedTransactions = {
            tx1: createSelectedTransaction({
                transaction: {transactionID: 'tx-1'} as SelectedTransactionInfo['transaction'],
                ownerAccountID: 1,
            }),
            tx2: createSelectedTransaction({
                transaction: {transactionID: 'tx-2'} as SelectedTransactionInfo['transaction'],
                ownerAccountID: 1,
                reportID: 'report-2',
            }),
        };

        expect(getSearchMoveSelectionValidation(selectedTransactions)).toEqual({
            canMoveToReport: true,
        });
    });

    it('blocks empty selections', () => {
        expect(getSearchMoveSelectionValidation({})).toEqual({
            canMoveToReport: false,
        });
    });

    it('blocks report-level selections without transaction data even when canChangeReport is true', () => {
        const selectedTransactions: SelectedTransactions = {
            report1: createSelectedTransaction({
                transaction: undefined,
                canChangeReport: true,
            }),
        };

        expect(getSearchMoveSelectionValidation(selectedTransactions)).toEqual({
            canMoveToReport: false,
        });
    });

    it('blocks mixed-owner selections', () => {
        const selectedTransactions: SelectedTransactions = {
            tx1: createSelectedTransaction({
                transaction: {transactionID: 'tx-1'} as SelectedTransactionInfo['transaction'],
                ownerAccountID: 1,
            }),
            tx2: createSelectedTransaction({
                transaction: {transactionID: 'tx-2'} as SelectedTransactionInfo['transaction'],
                ownerAccountID: 2,
                reportID: 'report-2',
            }),
        };

        expect(getSearchMoveSelectionValidation(selectedTransactions)).toEqual({
            canMoveToReport: false,
        });
    });

    it('blocks selections when any transaction cannot move', () => {
        const selectedTransactions: SelectedTransactions = {
            tx1: createSelectedTransaction({
                transaction: {transactionID: 'tx-1'} as SelectedTransactionInfo['transaction'],
                ownerAccountID: 1,
            }),
            tx2: createSelectedTransaction({
                transaction: {transactionID: 'tx-2'} as SelectedTransactionInfo['transaction'],
                ownerAccountID: 1,
                canChangeReport: false,
                reportID: 'report-2',
            }),
        };

        expect(getSearchMoveSelectionValidation(selectedTransactions)).toEqual({
            canMoveToReport: false,
        });
    });

    it('uses the report-owner fallback when owner metadata is not attached to the selection', () => {
        const selectedTransactions: SelectedTransactions = {
            tx1: createSelectedTransaction({
                transaction: {transactionID: 'tx-1'} as SelectedTransactionInfo['transaction'],
                ownerAccountID: undefined,
                report: undefined,
                reportID: 'report-1',
            }),
        };

        expect(
            getSearchMoveSelectionValidation(selectedTransactions, {
                getOwnerAccountIDForReportID: (reportID) => (reportID === 'report-1' ? 42 : undefined),
            }),
        ).toEqual({
            canMoveToReport: true,
        });
    });

    it('blocks the move action in expense-report search even when the selection is otherwise valid', () => {
        const selectedTransactions: SelectedTransactions = {
            tx1: createSelectedTransaction({
                transaction: {transactionID: 'tx-1'} as SelectedTransactionInfo['transaction'],
                ownerAccountID: 1,
            }),
        };

        expect(
            getSearchMoveSelectionValidation(selectedTransactions, {
                isExpenseReportSearch: true,
            }),
        ).toEqual({
            canMoveToReport: false,
        });
    });
});
