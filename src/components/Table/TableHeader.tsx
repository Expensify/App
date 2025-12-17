import React from 'react';
import {View} from 'react-native';
import Icon from '@components/Icon';
import {PressableWithFeedback} from '@components/Pressable';
import Text from '@components/Text';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import variables from '@styles/variables';
import {useTableContext} from './TableContext';
import type {TableColumn} from './types';

function TableHeader() {
    const styles = useThemeStyles();
    const {columns} = useTableContext();

    return (
        <View style={[styles.flexRow, styles.appBG, styles.justifyContentBetween, styles.mh5, styles.gap5, styles.p4]}>
            {columns.map((column) => {
                return (
                    <TableHeaderColumn
                        column={column}
                        key={column.key}
                    />
                );
            })}
        </View>
    );
}

function TableHeaderColumn({column}: {column: TableColumn}) {
    const theme = useTheme();
    const styles = useThemeStyles();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['ArrowUpLong', 'ArrowDownLong'] as const);

    const {activeSorting, toggleSorting} = useTableContext();
    const isSortingByColumn = column.key === activeSorting.columnKey;
    const sortIcon = activeSorting.order === 'asc' ? expensifyIcons.ArrowUpLong : expensifyIcons.ArrowDownLong;

    return (
        <PressableWithFeedback
            accessible
            accessibilityLabel={column.label}
            accessibilityRole="button"
            style={[styles.flexRow, styles.alignItemsCenter, column.styling?.flex ? {flex: column.styling.flex} : styles.flex1, column.styling?.containerStyles]}
            onPress={() => toggleSorting(column.key)}
        >
            <Text
                numberOfLines={1}
                color={theme.textSupporting}
                style={[
                    styles.lh16,
                    column.styling?.labelStyles,
                    isSortingByColumn ? styles.textMicroBoldSupporting : [styles.textMicroSupporting, styles.pr1, {marginRight: variables.iconSizeExtraSmall, marginBottom: 1, marginTop: 1}],
                ]}
            >
                {column.label}
            </Text>

            {isSortingByColumn && (
                <Icon
                    additionalStyles={styles.ml1}
                    width={variables.iconSizeExtraSmall}
                    height={12}
                    src={sortIcon}
                    fill={theme.icon}
                />
            )}
        </PressableWithFeedback>
    );
}

export default TableHeader;
