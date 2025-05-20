import type {TransactionWithOptionalSearchFields} from '@components/MoneyRequestReportView/MoneyRequestReportTransactionList';

type TransactionDataCellProps = {
    transactionItem: TransactionWithOptionalSearchFields;
    shouldShowTooltip: boolean;
    shouldUseNarrowLayout?: boolean;
};

export default TransactionDataCellProps;
