import type {TransactionWithOptionalSearchFields} from '..';

type TransactionDataCellProps = {
    transactionItem: TransactionWithOptionalSearchFields;
    shouldShowTooltip: boolean;
    shouldUseNarrowLayout?: boolean;

    /** The report's output currency, used to show converted amounts for foreign-currency transactions */
    reportCurrency?: string;
};

export default TransactionDataCellProps;
