import React from 'react';
import {View} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import type {SearchColumnType, SortOrder, TableColumnSize} from '@components/Search/types';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import type IconAsset from '@src/types/utils/IconAsset';
import SortableHeaderText from './SortableHeaderText';
import type {SortableColumnName} from './types';

type ColumnConfig = {
    columnName: SearchColumnType;
    translationKey: TranslationPaths | undefined;
    icon?: IconAsset;
    isColumnSortable?: boolean;
    canBeMissing?: boolean;
};

type SearchTableHeaderProps = {
    columns: ColumnConfig[];
    sortBy?: SortableColumnName;
    sortOrder?: SortOrder;
    shouldShowSorting: boolean;
    dateColumnSize: TableColumnSize;
    submittedColumnSize?: TableColumnSize;
    approvedColumnSize?: TableColumnSize;
    postedColumnSize?: TableColumnSize;
    exportedColumnSize?: TableColumnSize;
    amountColumnSize: TableColumnSize;
    taxAmountColumnSize: TableColumnSize;
    containerStyles?: StyleProp<ViewStyle>;
    shouldShowColumn: (columnName: SearchColumnType) => boolean;
    onSortPress: (column: SortableColumnName, order: SortOrder) => void;
    shouldRemoveTotalColumnFlex?: boolean;
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
    containerStyles,
    shouldShowSorting,
    onSortPress,
    amountColumnSize,
    taxAmountColumnSize,
    shouldRemoveTotalColumnFlex,
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
                            containerStyle={[
                                StyleUtils.getReportTableColumnStyles(
                                    columnName,
                                    dateColumnSize === CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE,
                                    amountColumnSize === CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE,
                                    taxAmountColumnSize === CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE,
                                    submittedColumnSize === CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE,
                                    approvedColumnSize === CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE,
                                    postedColumnSize === CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE,
                                    exportedColumnSize === CONST.SEARCH.TABLE_COLUMN_SIZES.WIDE,
                                    shouldRemoveTotalColumnFlex,
                                ),
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
