import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type IconAsset from '@src/types/utils/IconAsset';

import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

import type {SearchColumnType, SearchSortBy, SortOrder, TableColumnSize} from './types';

import {useSearchColumnStyles} from './SearchColumnWidthsContext';
import SortableHeaderText, {SortableHeaderLabel} from './SortableHeaderText';

type ColumnConfig = {
    columnName: SearchColumnType;
    translationKey: TranslationPaths | undefined;
    icon?: IconAsset;
    isColumnSortable?: boolean;
    sortColumnName?: SearchSortBy;
    canBeMissing?: boolean;
    canEdit?: boolean;
};

type ColumnMenuParams = {
    columnName: SearchColumnType;
    label: string;

    /** `undefined` when the column doesn't sort. */
    sortColumnName: SearchSortBy | undefined;

    /** Lays out the heading cell. */
    style: StyleProp<ViewStyle>;

    /** The heading's label, without the sort button. */
    children: React.ReactNode;
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
    paidColumnSize?: TableColumnSize;
    withdrawnColumnSize?: TableColumnSize;
    amountColumnSize: TableColumnSize;
    taxAmountColumnSize: TableColumnSize;
    containerStyles?: StyleProp<ViewStyle>;
    shouldShowColumn: (columnName: SearchColumnType) => boolean;
    onSortPress: (column: SearchSortBy, order: SortOrder) => void;
    shouldRemoveTotalColumnFlex?: boolean;
    isActionColumnWide?: boolean;
    isDateColumnCreated?: boolean;

    /** Renders each labelled column's heading as a menu, which replaces sorting on press. Without it the headings sort when pressed. */
    renderColumnMenu?: (params: ColumnMenuParams) => React.ReactNode;
};

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
    paidColumnSize,
    withdrawnColumnSize,
    containerStyles,
    shouldShowSorting,
    onSortPress,
    amountColumnSize,
    taxAmountColumnSize,
    shouldRemoveTotalColumnFlex,
    isActionColumnWide,
    renderColumnMenu,
}: SearchTableHeaderProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const getSearchColumnStyles = useSearchColumnStyles();
    const {translate} = useLocalize();

    return (
        <View style={[styles.flex1, styles.alignSelfStretch]}>
            <View style={[styles.flex1, styles.flexRow, styles.gap3, containerStyles]}>
                {columns.map(({columnName, translationKey, icon, isColumnSortable, sortColumnName, canEdit}) => {
                    if (!shouldShowColumn(columnName)) {
                        return null;
                    }

                    // Columns without the flag sort, the same default SortableHeaderText applies, so the menu offers sorting for them too.
                    const isSortable = shouldShowSorting && isColumnSortable !== false;
                    const sortByColumnName = sortColumnName ?? columnName;
                    const isActive = sortBy === sortByColumnName;
                    const isYesNoColumn =
                        columnName === CONST.SEARCH.TABLE_COLUMNS.REIMBURSABLE ||
                        columnName === CONST.SEARCH.TABLE_COLUMNS.BILLABLE ||
                        columnName === CONST.SEARCH.TABLE_COLUMNS.HELD ||
                        columnName === CONST.SEARCH.TABLE_COLUMNS.DECLINED;
                    const isConversionAmountColumn =
                        columnName === CONST.SEARCH.TABLE_COLUMNS.GROUP_AMOUNT_DEBITED ||
                        columnName === CONST.SEARCH.TABLE_COLUMNS.GROUP_AMOUNT_REIMBURSED ||
                        columnName === CONST.SEARCH.TABLE_COLUMNS.AMOUNT_DEBITED ||
                        columnName === CONST.SEARCH.TABLE_COLUMNS.AMOUNT_REIMBURSED;
                    const label = translationKey ? translate(translationKey) : '';
                    const textStyle = [
                        columnName === CONST.SEARCH.TABLE_COLUMNS.RECEIPT ? StyleUtils.getTextOverflowStyle('clip') : null,
                        isYesNoColumn || isConversionAmountColumn ? styles.flexShrink1 : null,
                    ];

                    const containerStyle = [
                        getSearchColumnStyles(columnName, {
                            isDateColumnWide: dateColumnSize === CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE,
                            isDateColumnCreated,
                            isSubmittedColumnWide: submittedColumnSize === CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE,
                            isApprovedColumnWide: approvedColumnSize === CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE,
                            isPostedColumnWide: postedColumnSize === CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE,
                            isExportedColumnWide: exportedColumnSize === CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE,
                            isPaidColumnWide: paidColumnSize === CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE,
                            isTaxAmountColumnWide: taxAmountColumnSize === CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE,
                            isAmountColumnWide: amountColumnSize === CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE,
                            shouldRemoveTotalColumnFlex,
                            isWithdrawnColumnWide: withdrawnColumnSize === CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE,
                            isActionColumnWide,
                        }),
                        styles.justifyContentCenter,
                    ];
                    const resolvedSortOrder = sortOrder ?? CONST.SEARCH.SORT_ORDER.ASC;
                    const innerContainerStyle = canEdit && styles.editableCellHeader;

                    if (renderColumnMenu && !!label) {
                        return (
                            <React.Fragment key={columnName}>
                                {renderColumnMenu({
                                    columnName,
                                    label,
                                    sortColumnName: isSortable ? sortByColumnName : undefined,
                                    style: containerStyle,
                                    children: (
                                        <SortableHeaderLabel
                                            text={label}
                                            icon={icon}
                                            isActive={isActive}
                                            sortOrder={resolvedSortOrder}
                                            innerContainerStyle={innerContainerStyle}
                                            textStyle={textStyle}
                                        />
                                    ),
                                })}
                            </React.Fragment>
                        );
                    }

                    return (
                        <SortableHeaderText
                            key={columnName}
                            text={label}
                            icon={icon}
                            textStyle={textStyle}
                            sortOrder={resolvedSortOrder}
                            isActive={isActive}
                            sentryLabel={CONST.SENTRY_LABEL.SEARCH.SORTABLE_HEADER}
                            innerContainerStyle={innerContainerStyle}
                            containerStyle={containerStyle}
                            isSortable={isSortable}
                            onPress={(order: SortOrder) => onSortPress(sortByColumnName, order)}
                        />
                    );
                })}
            </View>
        </View>
    );
}

export default SortableTableHeader;
