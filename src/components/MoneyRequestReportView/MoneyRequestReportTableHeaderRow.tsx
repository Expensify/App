import Checkbox from '@components/Checkbox';
import OfflineWithFeedback from '@components/OfflineWithFeedback';
import {useSearchSelectionActions, useSearchSelectionContext} from '@components/Search/SearchContext';
import type {SearchColumnType, SearchSortBy, SortOrder, TableColumnSize} from '@components/Search/types';
import Text from '@components/Text';

import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useResponsiveLayoutOnWideRHP from '@hooks/useResponsiveLayoutOnWideRHP';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import type {SortableColumnName} from '@libs/ReportUtils';
import {hasFlexColumn} from '@libs/SearchUIUtils';
import {isTransactionPendingDelete} from '@libs/TransactionUtils';

import variables from '@styles/variables';

import type * as OnyxTypes from '@src/types/onyx';
import type {PendingAction} from '@src/types/onyx/OnyxCommon';

import React from 'react';
import {View} from 'react-native';

import MoneyRequestReportTableHeader from './MoneyRequestReportTableHeader';

type MoneyRequestReportTableHeaderRowProps = {
    /** List of transactions belonging to one report */
    transactions: OnyxTypes.Transaction[];

    /** The report's offline pending action, shown as feedback on the whole row */
    pendingAction: PendingAction | undefined;

    /** The columns the table renders, in order */
    columns: SearchColumnType[];

    /** The column the table is currently sorted by */
    sortBy: SortableColumnName;

    /** The current sort direction */
    sortOrder: SortOrder;

    /** Column-header sort handler */
    onSortPress: (selectedSortBy: SearchSortBy, selectedSortOrder: SortOrder) => void;

    /** Width bucket of the date column */
    dateColumnSize: TableColumnSize;

    /** Width bucket of the posted-date column */
    postedColumnSize: TableColumnSize;

    /** Width bucket of the amount column */
    amountColumnSize: TableColumnSize;

    /** Width bucket of the tax-amount column */
    taxAmountColumnSize: TableColumnSize;

    /** True when the table scrolls horizontally — the column headers must stay visible then */
    shouldScrollHorizontally: boolean;
};

/**
 * The transaction table's header row: the select-all checkbox plus the sortable column headers.
 */
function MoneyRequestReportTableHeaderRow({
    transactions,
    pendingAction,
    columns,
    sortBy,
    sortOrder,
    onSortPress,
    dateColumnSize,
    postedColumnSize,
    amountColumnSize,
    taxAmountColumnSize,
    shouldScrollHorizontally,
}: MoneyRequestReportTableHeaderRowProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();
    // eslint-disable-next-line rulesdir/prefer-shouldUseNarrowLayout-instead-of-isSmallScreenWidth
    const {isMediumScreenWidth} = useResponsiveLayout();
    const {shouldUseNarrowLayout} = useResponsiveLayoutOnWideRHP();
    const {selectedTransactionIDs} = useSearchSelectionContext();
    const {setSelectedTransactions, clearSelectedTransactions} = useSearchSelectionActions();

    const isDesktopTableLayout = !shouldUseNarrowLayout;
    const transactionsWithoutPendingDelete = transactions.filter((t) => !isTransactionPendingDelete(t));

    return (
        <OfflineWithFeedback pendingAction={pendingAction}>
            <View
                style={[
                    styles.dFlex,
                    styles.flexRow,
                    !isDesktopTableLayout && styles.pl5,
                    isDesktopTableLayout ? styles.pr11 : styles.pr16,
                    styles.alignItemsCenter,
                    isDesktopTableLayout && [styles.highlightBG, styles.tableTopRadius, styles.mh5],
                    StyleUtils.getSelectedBorderBottomStyle(selectedTransactionIDs.length > 0),
                ]}
            >
                <View
                    style={[
                        styles.dFlex,
                        styles.flexRow,
                        styles.alignItemsCenter,
                        styles.pv2,
                        !isDesktopTableLayout && styles.pr4,
                        StyleUtils.getPaddingLeft(variables.w12),
                        isDesktopTableLayout && {minHeight: variables.tableGroupRowHeight},
                    ]}
                >
                    <Checkbox
                        onPress={() => {
                            if (selectedTransactionIDs.length !== 0) {
                                clearSelectedTransactions(true);
                            } else {
                                setSelectedTransactions(transactionsWithoutPendingDelete.map((t) => t.transactionID));
                            }
                        }}
                        accessibilityLabel={translate('accessibilityHints.selectAllTransactions')}
                        isIndeterminate={selectedTransactionIDs.length > 0 && selectedTransactionIDs.length !== transactionsWithoutPendingDelete.length}
                        isChecked={selectedTransactionIDs.length > 0 && selectedTransactionIDs.length === transactionsWithoutPendingDelete.length}
                        containerStyle={isDesktopTableLayout && styles.m0}
                        style={isDesktopTableLayout && styles.mr3}
                    />
                    {isMediumScreenWidth && !shouldScrollHorizontally && <Text style={[styles.labelStrong]}>{translate('workspace.people.selectAll')}</Text>}
                </View>
                {(!isMediumScreenWidth || shouldScrollHorizontally) && (
                    <MoneyRequestReportTableHeader
                        shouldShowSorting
                        sortBy={sortBy}
                        sortOrder={sortOrder}
                        shouldRemoveTotalColumnFlex={hasFlexColumn(columns)}
                        columns={columns}
                        dateColumnSize={dateColumnSize}
                        postedColumnSize={postedColumnSize}
                        amountColumnSize={amountColumnSize}
                        taxAmountColumnSize={taxAmountColumnSize}
                        onSortPress={onSortPress}
                    />
                )}
            </View>
        </OfflineWithFeedback>
    );
}

export default MoneyRequestReportTableHeaderRow;
