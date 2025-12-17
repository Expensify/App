import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import Icon from '@components/Icon';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {useTableContext} from './TableContext';
import type {ActiveSorting} from './types';

type SortButtonProps<ColumnKey extends string = string> = {
    option: {label: string; value: ColumnKey};
    isActive: boolean;
    sortingConfig: ActiveSorting<ColumnKey>;
    onPress: (columnKey: ColumnKey) => void;
};

function TableSortButtons<T, ColumnKey extends string = string>() {
    const styles = useThemeStyles();
    const {columns, activeSorting, toggleSorting} = useTableContext<T, ColumnKey>();

    if (!columns || columns.length === 0) {
        return null;
    }

    return (
        <View style={[styles.flexRow, styles.gap2]}>
            {columns.map((column) => {
                const isActive = activeSorting.columnKey === column.key;
                return (
                    <SortButton
                        key={column.key}
                        option={{label: column.label, value: column.key}}
                        isActive={isActive}
                        sortingConfig={activeSorting}
                        onPress={() => toggleSorting(column.key)}
                    />
                );
            })}
        </View>
    );
}

function SortButton<ColumnKey extends string = string>({option, isActive, sortingConfig, onPress}: SortButtonProps<ColumnKey>) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['ArrowUpLong', 'ArrowDownLong'] as const);
    const sortIcon = sortingConfig.order === 'asc' ? expensifyIcons.ArrowUpLong : expensifyIcons.ArrowDownLong;

    const handlePress = () => {
        onPress(option.value);
    };

    return (
        <Button
            small
            onPress={handlePress}
            innerStyles={isActive ? [styles.buttonHoveredBG] : []}
            shouldUseDefaultHover={false}
        >
            <View style={[styles.flexRow, styles.alignItemsCenter, styles.gap1]}>
                <Icon
                    src={isActive ? sortIcon : undefined}
                    fill={theme.icon}
                    height={12}
                    width={12}
                />
                {option.label}
            </View>
        </Button>
    );
}

export default TableSortButtons;
