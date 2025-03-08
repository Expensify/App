import type Transaction from '@src/types/onyx/Transaction';

type TransactionDataCellProps = {
    transactionItem: Transaction;
    showTooltip: boolean;
    isLargeScreenWidth?: boolean;
};

export default TransactionDataCellProps;
