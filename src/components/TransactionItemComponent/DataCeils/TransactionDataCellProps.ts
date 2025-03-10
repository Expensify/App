import type Transaction from '@src/types/onyx/Transaction';

type TransactionDataCellProps = {
    transactionItem: Transaction;
    showTooltip: boolean;
    shouldUseNarrowLayout?: boolean;
};

export default TransactionDataCellProps;
