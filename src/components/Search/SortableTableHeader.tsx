import {useColumnResizeController} from '@components/Table/columnResize/ColumnResizeContext';
import ColumnResizeHandle from '@components/Table/columnResize/ColumnResizeHandle';

import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';

import {getSearchColumnTranslationKey} from '@libs/SearchUIUtils';

import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type IconAsset from '@src/types/utils/IconAsset';

import type {StyleProp, ViewStyle} from 'react-native';

import React from 'react';
import {View} from 'react-native';

import type {SearchColumnType, SearchSortBy, SortOrder, TableColumnSize} from './types';

import {usePinnedColumnStyles} from './PinnedColumnsContext';
import {useSearchColumnStyles} from './SearchColumnWidthsContext';
import {SortableColumnProvider} from './SortableColumnContext';
import SortableHeaderText from './SortableHeaderText';

type ColumnConfig = {
    columnName: SearchColumnType;
    translationKey: TranslationPaths | undefined;
    icon?: IconAsset;
    isColumnSortable: boolean;
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

    /**
     * Replaces each heading that shows a label or an icon, reading the column from `useSortableColumn`.
     * Without it the headings sort when pressed.
     */
    children?: React.ReactNode;
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
    children,
}: SearchTableHeaderProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const getSearchColumnStyles = useSearchColumnStyles();
    const {translate} = useLocalize();
    const columnResize = useColumnResizeController();
    const {getPinnedHeadingDataSet, cellContainerStyle} = usePinnedColumnStyles();

    return (
        <View style={[styles.flex1, styles.alignSelfStretch, cellContainerStyle]}>
            <View style={[styles.flex1, styles.flexRow, styles.gap3, containerStyles, cellContainerStyle]}>
                {columns.map(({columnName, translationKey, icon, isColumnSortable, sortColumnName, canEdit}) => {
                    if (!shouldShowColumn(columnName)) {
                        return null;
                    }

                    const isSortable = shouldShowSorting && isColumnSortable;
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
                    // An icon-only heading takes the name the Columns page shows, so its menu and resize handle are still named.
                    const columnLabel = label || translate(getSearchColumnTranslationKey(columnName));
                    const textStyle = isYesNoColumn || isConversionAmountColumn ? styles.flexShrink1 : null;

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

                    const resizeHandle = (
                        <ColumnResizeHandle
                            columnKey={columnName}
                            columnLabel={columnLabel}
                        />
                    );

                    // A heading with neither a label nor an icon, like the report table's Comments, shows nothing to open a menu from.
                    if (children && (!!label || !!icon)) {
                        return (
                            <View
                                key={columnName}
                                style={containerStyle}
                                dataSet={getPinnedHeadingDataSet(columnName)}
                            >
                                <SortableColumnProvider
                                    columnName={columnName}
                                    label={columnLabel}
                                    alignment={StyleUtils.getReportTableColumnAlignment(columnName)}
                                    hasResizeHandle={!!columnResize?.hasHandle(columnName)}
                                    sorting={isSortable ? {activeSortOrder: isActive ? sortOrder : undefined, onSort: (order) => onSortPress(sortByColumnName, order)} : undefined}
                                    labelProps={{text: label, icon, isActive, sortOrder: resolvedSortOrder, innerContainerStyle, textStyle}}
                                >
                                    {children}
                                </SortableColumnProvider>
                                {resizeHandle}
                            </View>
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
                        >
                            {resizeHandle}
                        </SortableHeaderText>
                    );
                })}
            </View>
        </View>
    );
}

export default SortableTableHeader;
export type {ColumnConfig};
