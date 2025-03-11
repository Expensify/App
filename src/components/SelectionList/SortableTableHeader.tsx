import React from 'react';
import {View} from 'react-native';
import type {SearchColumnType, SortOrder} from '@components/Search/types';
import useLocalize from '@hooks/useLocalize';
import useStyleUtils from '@hooks/useStyleUtils';
import useThemeStyles from '@hooks/useThemeStyles';
import CONST from '@src/CONST';
import type {TranslationPaths} from '@src/languages/types';
import SortableHeaderText from './SortableHeaderText';

type SortableColumnName = SearchColumnType | typeof CONST.REPORT.TRANSACTION_LIST.COLUMNS.COMMENTS;

type ColumnConfig = {
    columnName: SortableColumnName;
    translationKey: TranslationPaths | undefined;
    isColumnSortable?: boolean;
};

type SearchTableHeaderProps = {
    columns: ColumnConfig[];
    sortBy?: SortableColumnName;
    sortOrder?: SortOrder;
    shouldShowSorting: boolean;
    dateColumnSize: 'normal' | 'wide';
    shouldShowColumn: (columnName: SortableColumnName) => boolean;
    onSortPress: (column: SortableColumnName, order: SortOrder) => void;
};

function SortableTableHeader({columns, sortBy, sortOrder, onSortPress, shouldShowColumn, dateColumnSize, shouldShowSorting}: SearchTableHeaderProps) {
    const styles = useThemeStyles();
    const StyleUtils = useStyleUtils();
    const {translate} = useLocalize();

    return (
        <View style={[styles.flex1]}>
            <View style={[styles.flex1, styles.flexRow, styles.gap3, styles.pl4]}>
                {columns.map(({columnName, translationKey, isColumnSortable}) => {
                    if (!shouldShowColumn(columnName)) {
                        return null;
                    }

                    const isSortable = shouldShowSorting && isColumnSortable;
                    const isActive = sortBy === columnName;
                    const textStyle = columnName === CONST.SEARCH.TABLE_COLUMNS.RECEIPT ? StyleUtils.getTextOverflowStyle('clip') : null;

                    return (
                        <SortableHeaderText
                            key={translationKey}
                            text={translationKey ? translate(translationKey) : ''}
                            textStyle={textStyle}
                            sortOrder={sortOrder ?? CONST.SEARCH.SORT_ORDER.ASC}
                            isActive={isActive}
                            containerStyle={[StyleUtils.getReportTableColumnStyles(columnName, dateColumnSize === 'wide')]}
                            isSortable={isSortable}
                            onPress={(order: SortOrder) => onSortPress(columnName, order)}
                        />
                    );
                })}
            </View>
        </View>
    );
}

SortableTableHeader.displayName = 'SortableTableHeader';

export default SortableTableHeader;
