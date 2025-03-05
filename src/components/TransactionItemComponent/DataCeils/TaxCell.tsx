import type {TransactionListItemType} from '@components/SelectionList/types';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import {getCurrency as getTransactionCurrency, getTaxAmount} from '@libs/TransactionUtils';
import TextWithTooltip from '@components/TextWithTooltip';
import {convertToDisplayString} from '@libs/CurrencyUtils';

type CellProps = {
    // eslint-disable-next-line react/no-unused-prop-types
    showTooltip: boolean;
    // eslint-disable-next-line react/no-unused-prop-types
    isLargeScreenWidth: boolean;
};

type TransactionCellProps = {
    transactionItem: TransactionListItemType;
} & CellProps;


function TaxCell({transactionItem, showTooltip}: TransactionCellProps) {
    const styles = useThemeStyles();

    const isFromExpenseReport = transactionItem.reportType === CONST.REPORT.TYPE.EXPENSE;
    const taxAmount = getTaxAmount(transactionItem, isFromExpenseReport);
    const currency = getTransactionCurrency(transactionItem);

    return (
        <TextWithTooltip
            shouldShowTooltip={showTooltip}
    text={convertToDisplayString(taxAmount, currency)}
    style={[styles.optionDisplayName, styles.lineHeightLarge, styles.pre, styles.justifyContentCenter, styles.textAlignRight]}
    />
);
}

TaxCell.displayName = 'TaxCell';
export default TaxCell;
