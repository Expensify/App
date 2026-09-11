import Table from '@components/Table';
import {useTableContext} from '@components/Table/TableContext';
import TransactionItemRow from '@components/TransactionItemRow';

import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useThemeStyles from '@hooks/useThemeStyles';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getDescription, getMerchant} from '@libs/TransactionUtils';

import CONST from '@src/CONST';
import ONYXKEYS from '@src/ONYXKEYS';

import {View} from 'react-native';

import type {UnreportedExpenseTableRowData} from '.';

type AddExistingExpenseTableRowProps = {
    item: UnreportedExpenseTableRowData;
    rowIndex: number;
    shouldUseNarrowTableLayout: boolean;
};

function AddExistingExpenseTableRow({item, rowIndex, shouldUseNarrowTableLayout}: AddExistingExpenseTableRowProps) {
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
        <Table.Row
            interactive
            rowIndex={rowIndex}
            disabled={item.disabled}
            accessibilityLabel={accessibilityLabel}
            sentryLabel={CONST.SENTRY_LABEL.SEARCH.UNREPORTED_EXPENSE_LIST_ITEM}
            offlineWithFeedback={{pendingAction: item.pendingAction}}
            // This list has no per-row navigation, so unlike other tables (where onPress opens details and the
            // checkbox is the only way to select) the whole row is the selection target, matching the old
            // SelectionList behavior this page replaced.
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
                    shouldUseNarrowLayout={shouldUseNarrowTableLayout}
                    isSelected={isSelected}
                    shouldShowTooltip
                    dateColumnSize={CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL}
                    amountColumnSize={CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL}
                    taxAmountColumnSize={CONST.SEARCH.TABLE_COLUMN_SIZES.NORMAL}
                    isDisabled={isRowDisabled}
                    shouldShowCheckbox={false}
                    // The row clips its content to its own 8px radius, which shaves the corner off the receipt cell
                    // sitting flush against it. Table.Row already draws the row's background and corners, so cancel it.
                    style={styles.noBorderRadius}
                />
            </View>
        </Table.Row>
    );
}

export default AddExistingExpenseTableRow;
