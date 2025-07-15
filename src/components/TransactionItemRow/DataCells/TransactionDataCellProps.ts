import type {TransactionWithOptionalSearchFields} from '..';

type TransactionDataCellProps = {
    transactionItem: TransactionWithOptionalSearchFields;
    shouldShowTooltip: boolean;
    shouldUseNarrowLayout?: boolean;
};

export default TransactionDataCellProps;
