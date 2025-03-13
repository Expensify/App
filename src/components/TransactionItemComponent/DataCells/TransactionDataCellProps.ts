import type Transaction from '@src/types/onyx/Transaction';

type TransactionDataCellProps = {
    transactionItem: Transaction;
    shouldShowTooltip: boolean;
    shouldUseNarrowLayout?: boolean;
};

export default TransactionDataCellProps;
