import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';

import variables from '@styles/variables';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type IconAsset from '@src/types/utils/IconAsset';

import type {GestureResponderEvent, StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {StyleSheet, View} from 'react-native';

import type {SearchColumnType, SearchSortBy, SortOrder, TableColumnSize} from './types';

import {getFrozenCellPosition, hasPinnedColumns, PIN_SIDE, useFrozenColumnState} from './FrozenColumnContext';
import {FROZEN_CELL_DATA_KEY, FROZEN_EDGE_LEFT_DATA_KEY, FROZEN_EDGE_RIGHT_DATA_KEY, FROZEN_RIGHT_CELL_DATA_KEY, getFrozenCellStyle} from './frozenColumnUtils';
import {useSearchColumnStyles} from './SearchColumnWidthsContext';
import SortableHeaderText from './SortableHeaderText';

type ColumnConfig = {
    columnName: SearchColumnType;
    translationKey: TranslationPaths | undefined;
    icon?: IconAsset;
    isColumnSortable?: boolean;
    sortColumnName?: SearchSortBy;
    canBeMissing?: boolean;
    canEdit?: boolean;
};

type SearchTableHeaderProps = {
    columns: ColumnConfig[];
    sortBy?: SearchSortBy;
    sortOrder?: SortOrder;
    shouldShowSorting: boolean;
    dateColumnSize: TableColumnSize;
    submittedColumnSize?: TableColumnSize;
    approvedColumnSize?: TableColumnSize;
    postedColumnSize?: TableColumnSize;
    exportedColumnSize?: TableColumnSize;
    withdrawnColumnSize?: TableColumnSize;
    amountColumnSize: TableColumnSize;
    taxAmountColumnSize: TableColumnSize;
    containerStyles?: StyleProp<ViewStyle>;
    shouldShowColumn: (columnName: SearchColumnType) => boolean;
    onSortPress: (column: SearchSortBy, order: SortOrder) => void;
    shouldRemoveTotalColumnFlex?: boolean;
    isActionColumnWide?: boolean;
    isDateColumnCreated?: boolean;

    /** Called when a column header is right-clicked or long-pressed. */
    onColumnSecondaryInteraction?: (columnName: SearchColumnType, event: GestureResponderEvent | MouseEvent) => void;
};

/** Marks a frozen header cell for the stylesheet that moves it, and the edge cell for the overlay measured from it. */
function getFrozenHeaderDataSet(isLeft: boolean, isEdge: boolean): Record<string, boolean> {
    if (isLeft) {
        return {[FROZEN_CELL_DATA_KEY]: true, [FROZEN_EDGE_LEFT_DATA_KEY]: isEdge};
    }
    return {[FROZEN_RIGHT_CELL_DATA_KEY]: true, [FROZEN_EDGE_RIGHT_DATA_KEY]: isEdge};
}

function SortableTableHeader({
    columns,
    sortBy,
    sortOrder,
    shouldShowColumn,
    dateColumnSize,
    isDateColumnCreated,
    submittedColumnSize,
    approvedColumnSize,
    postedColumnSize,
    exportedColumnSize,
    withdrawnColumnSize,
    containerStyles,
    shouldShowSorting,
    onSortPress,
    amountColumnSize,
    taxAmountColumnSize,
    shouldRemoveTotalColumnFlex,
    isActionColumnWide,
    onColumnSecondaryInteraction,
}: SearchTableHeaderProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const {pinnedColumns} = useFrozenColumnState();
    const visibleColumnNames = columns.filter(({columnName}) => shouldShowColumn(columnName)).map(({columnName}) => columnName);
    const StyleUtils = useStyleUtils();
    const getSearchColumnStyles = useSearchColumnStyles();
    const {translate} = useLocalize();

    return (
        <View style={[styles.flex1, hasPinnedColumns(pinnedColumns) && styles.alignSelfStretch]}>
            <View style={[styles.flex1, styles.flexRow, styles.gap3, containerStyles]}>
                {columns.map(({columnName, translationKey, icon, isColumnSortable, sortColumnName, canEdit}) => {
                    if (!shouldShowColumn(columnName)) {
                        return null;
                    }

                    const isSortable = shouldShowSorting && isColumnSortable;
                    const frozenPosition = getFrozenCellPosition(columnName, visibleColumnNames, pinnedColumns);
                    const columnStyle = getSearchColumnStyles(columnName, {
                        isDateColumnWide: dateColumnSize === CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE,
                        isDateColumnCreated,
                        isSubmittedColumnWide: submittedColumnSize === CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE,
                        isApprovedColumnWide: approvedColumnSize === CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE,
                        isPostedColumnWide: postedColumnSize === CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE,
                        isExportedColumnWide: exportedColumnSize === CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE,
                        isTaxAmountColumnWide: taxAmountColumnSize === CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE,
                        isAmountColumnWide: amountColumnSize === CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE,
                        shouldRemoveTotalColumnFlex,
                        isWithdrawnColumnWide: withdrawnColumnSize === CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE,
                        isActionColumnWide,
                    });
                    const sortByColumnName = sortColumnName ?? columnName;
                    const isActive = sortBy === sortByColumnName;
                    const isReimbursableOrBillableColumn = columnName === CONST.SEARCH.TABLE_COLUMNS.REIMBURSABLE || columnName === CONST.SEARCH.TABLE_COLUMNS.BILLABLE;
                    const isConversionAmountColumn =
                        columnName === CONST.SEARCH.TABLE_COLUMNS.GROUP_AMOUNT_DEBITED ||
                        columnName === CONST.SEARCH.TABLE_COLUMNS.GROUP_AMOUNT_REIMBURSED ||
                        columnName === CONST.SEARCH.TABLE_COLUMNS.AMOUNT_DEBITED ||
                        columnName === CONST.SEARCH.TABLE_COLUMNS.AMOUNT_REIMBURSED;
                    const textStyle = [
                        columnName === CONST.SEARCH.TABLE_COLUMNS.RECEIPT ? StyleUtils.getTextOverflowStyle('clip') : null,
                        isReimbursableOrBillableColumn || isConversionAmountColumn ? styles.flexShrink1 : null,
                    ];

                    return (
                        <SortableHeaderText
                            key={columnName}
                            text={translationKey ? translate(translationKey) : ''}
                            icon={icon}
                            textStyle={textStyle}
                            sortOrder={sortOrder ?? CONST.SEARCH.SORT_ORDER.ASC}
                            isActive={isActive}
                            sentryLabel={CONST.SENTRY_LABEL.SEARCH.SORTABLE_HEADER}
                            innerContainerStyle={canEdit && styles.editableCellHeader}
                            containerStyle={[
                                columnStyle,
                                !!frozenPosition &&
                                    getFrozenCellStyle({
                                        backgroundColor: theme.highlightBG,
                                        side: frozenPosition.side,
                                        isEdge: frozenPosition.isEdge,
                                        verticalBleed: variables.searchTableHeaderPaddingVertical,
                                        sizing: StyleSheet.flatten(columnStyle),
                                    }),
                            ]}
                            isSortable={isSortable}
                            onPress={(order: SortOrder) => onSortPress(sortByColumnName, order)}
                            dataSet={frozenPosition ? getFrozenHeaderDataSet(frozenPosition.side === PIN_SIDE.LEFT, frozenPosition.isEdge) : undefined}
                            onSecondaryInteraction={onColumnSecondaryInteraction ? (event) => onColumnSecondaryInteraction(columnName, event) : undefined}
                        />
                    );
                })}
                {pinnedColumns.right.length > 0 && (
                    // Lines up with the rows' trailing arrow, which stays frozen at the far right with the right-pinned columns.
                    <View
                        style={[
                            {width: variables.iconSizeNormal},
                            getFrozenCellStyle({
                                backgroundColor: theme.highlightBG,
                                side: PIN_SIDE.RIGHT,
                                isEdge: false,
                                verticalBleed: variables.searchTableHeaderPaddingVertical,
                            }),
                        ]}
                        dataSet={{[FROZEN_RIGHT_CELL_DATA_KEY]: true}}
                    />
                )}
            </View>
        </View>
    );
}

export default SortableTableHeader;
