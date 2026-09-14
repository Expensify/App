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
    // The item FlashList passes to renderItem is the plain row data, so selection state comes from processedData.
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
            // This list has no per-row navigation, so the whole row is the selection target.
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
                    // Without this the row's own radius clips the receipt cell's corner. Table.Row draws the corners.
                    style={styles.noBorderRadius}
                />
            </View>
        </Table.Row>
    );
}

export default AddExistingExpenseTableRow;
