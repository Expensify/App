import type {TransactionWithOptionalSearchFields} from '@components/TransactionItemRow/types';

type TransactionDataCellProps = {
    transactionItem: TransactionWithOptionalSearchFields;
    shouldShowTooltip: boolean;
    shouldUseNarrowLayout?: boolean;
};

export default TransactionDataCellProps;
