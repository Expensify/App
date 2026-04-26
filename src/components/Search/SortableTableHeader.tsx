import React from 'react';
import {View} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type IconAsset from '@src/types/utils/IconAsset';
import SortableHeaderText from './SortableHeaderText';
import type {SearchColumnType, SortOrder, TableColumnSize} from './types';

type ColumnConfig = {
    columnName: SearchColumnType;
    translationKey: TranslationPaths | undefined;
    icon?: IconAsset;
    isColumnSortable?: boolean;
    canBeMissing?: boolean;
};

type SearchTableHeaderProps = {
    columns: ColumnConfig[];
    sortBy?: SearchColumnType;
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
    onSortPress: (column: SearchColumnType, order: SortOrder) => void;
    shouldRemoveTotalColumnFlex?: boolean;
    isActionColumnWide?: boolean;
};

function SortableTableHeader({
    columns,
    sortBy,
    sortOrder,
    shouldShowColumn,
    dateColumnSize,
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
}: SearchTableHeaderProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();

    return (
        <View style={[styles.flex1]}>
            <View style={[styles.flex1, styles.flexRow, styles.gap3, containerStyles]}>
                {columns.map(({columnName, translationKey, icon, isColumnSortable}) => {
                    if (!shouldShowColumn(columnName)) {
                        return null;
                    }

                    const isSortable = shouldShowSorting && isColumnSortable;
                    const isActive = sortBy === columnName;
                    const textStyle = columnName === CONST.SEARCH.TABLE_COLUMNS.RECEIPT ? StyleUtils.getTextOverflowStyle('clip') : null;

                    return (
                        <SortableHeaderText
                            key={columnName}
                            text={translationKey ? translate(translationKey) : ''}
                            icon={icon}
                            textStyle={textStyle}
                            sortOrder={sortOrder ?? CONST.SEARCH.SORT_ORDER.ASC}
                            isActive={isActive}
                            sentryLabel={CONST.SENTRY_LABEL.SEARCH.SORTABLE_HEADER}
                            containerStyle={[
                                StyleUtils.getReportTableColumnStyles(columnName, {
                                    isDateColumnWide: dateColumnSize === CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE,
                                    isSubmittedColumnWide: submittedColumnSize === CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE,
                                    isApprovedColumnWide: approvedColumnSize === CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE,
                                    isPostedColumnWide: postedColumnSize === CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE,
                                    isExportedColumnWide: exportedColumnSize === CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE,
                                    isTaxAmountColumnWide: taxAmountColumnSize === CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE,
                                    isAmountColumnWide: amountColumnSize === CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE,
                                    shouldRemoveTotalColumnFlex,
                                    isWithdrawnColumnWide: withdrawnColumnSize === CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE,
                                    isActionColumnWide,
                                }),
                            ]}
                            isSortable={isSortable}
                            onPress={(order: SortOrder) => onSortPress(columnName, order)}
                        />
                    );
                })}
            </View>
        </View>
    );
}

export default SortableTableHeader;
