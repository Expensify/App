import Table from '@components/Table';
import {useTableContext} from '@components/Table/TableContext';
import TransactionItemRow from '@components/TransactionItemRow';

import useLocalize from '@hooks/useLocalize';
import useOnyx from '@hooks/useOnyx';
import usePolicy from '@hooks/usePolicy';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';

import getNonEmptyStringOnyxID from '@libs/getNonEmptyStringOnyxID';
import {getDescription, getMerchantName} from '@libs/TransactionUtils';

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
    const {translate} = useLocalize();
    const {tableMethods, processedData} = useTableContext<UnreportedExpenseTableRowData>();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isSmallScreenWidth} = useResponsiveLayout();
    const rowData = processedData.at(rowIndex);
    const isSelected = !!rowData?.selected;
    const isRowDisabled = !!rowData?.disabled;

    const transactionReportID = getNonEmptyStringOnyxID(item.reportID);
    const [transactionReport] = useOnyx(`${ONYXKEYS.COLLECTION.REPORT}${transactionReportID}`);
    const transactionPolicy = usePolicy(transactionReport?.policyID);

    // Merchant or description doubles as the row's accessible name, matching what the row visibly shows.
    const accessibilityLabel = getMerchantName(item, translate) || getDescription(item);

    return (
        <Table.Row
            interactive
            rowIndex={rowIndex}
            disabled={item.disabled}
            accessibilityLabel={accessibilityLabel}
            sentryLabel={CONST.SENTRY_LABEL.SEARCH.UNREPORTED_EXPENSE_LIST_ITEM}
            offlineWithFeedback={{pendingAction: item.pendingAction}}
            // This list has no per-row navigation, so the whole row is the selection target. On small screens the row is
            // only a target once selection mode is on, which the user enters by long pressing, as in the other tables.
            onPress={() => {
                if (isSmallScreenWidth) {
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
