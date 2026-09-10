import {useTableContext} from '@components/Table/TableContext';
import TableRowComponent from '@components/Table/TableRow';
import TransactionItemRow from '@components/TransactionItemRow';

import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getDescription, getMerchant} from '@libs/TransactionUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import {View} from 'react-native';

import type {UnreportedExpenseTableRowData} from './AddExistingExpense';

type AddExistingExpenseTableRowProps = {
    item: UnreportedExpenseTableRowData;
    rowIndex: number;
};

function AddExistingExpenseTableRow({item, rowIndex}: AddExistingExpenseTableRowProps) {
    const styles = useThemeStyles();
    // Table.Row re-reads the row by index off processedData internally to get its `selected` and `disabled` state,
    // since the `item` FlashList hands to renderItem is typed as the plain row data, not the table's selection wrapper.
    const {tableMethods, processedData} = useTableContext<UnreportedExpenseTableRowData>();
    const rowData = processedData.at(rowIndex);
    const isSelected = !!rowData?.selected;
    const isRowDisabled = !!rowData?.disabled;

    const transactionReportID = getNonEmptyStringOnyxID(item.reportID);
    const [transactionReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${transactionReportID}`);
    const transactionPolicy = usePolicy(transactionReport?.policyID);

    // Merchant/description doubles as the row's accessible name, matching what the row visibly shows.
    const accessibilityLabel = getMerchant(item) || getDescription(item);

    return (
        <TableRowComponent
            interactive
            rowIndex={rowIndex}
            disabled={item.disabled}
            accessibilityLabel={accessibilityLabel}
            sentryLabel={CONST.SENTRY_LABEL.SEARCH.UNREPORTED_EXPENSE_LIST_ITEM}
            offlineWithFeedback={{pendingAction: item.pendingAction}}
            onPress={() => {
                if (item.isSelectionDisabled) {
                    return;
                }
                tableMethods.handleSingleRowSelection(item.keyForList);
            }}
        >
            <View style={styles.flex1}>
                <TransactionItemRow
                    transactionItem={item}
                    report={transactionReport}
                    policy={transactionPolicy}
                    shouldUseNarrowLayout
                    isSelected={isSelected}
                    shouldShowTooltip
                    dateColumnSize={CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL}
                    amountColumnSize={CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL}
                    taxAmountColumnSize={CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL}
                    isDisabled={isRowDisabled}
                    shouldShowCheckbox={false}
                />
            </View>
        </TableRowComponent>
    );
}

export default AddExistingExpenseTableRow;
