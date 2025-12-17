import React from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import Icon from '@components/Icon';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {useTableContext} from './TableContext';

type SortButtonProps = {
    option: {label: string; value: string};
    isActive: boolean;
    sortOrder: 'asc' | 'desc';
    onPress: (sortKey: string) => void;
};

function SortButton({option, isActive, sortOrder, onPress}: SortButtonProps) {
    const styles = useThemeStyles();
    const theme = useTheme();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['ArrowUpLong', 'ArrowDownLong'] as const);
    const sortIcon = sortOrder === 'asc' ? expensifyIcons.ArrowUpLong : expensifyIcons.ArrowDownLong;

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

function TableSortButtons() {
    const styles = useThemeStyles();
    const {columns, sortColumn: sortBy, sortOrder, updateSorting} = useTableContext();

    const handleSortPress = (sortKey: string) => {
        // If clicking the same sort key, toggle order; otherwise set new sort key with ascending order
        if (sortBy === sortKey) {
            const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
            updateSorting({columnKey: sortKey, order: newOrder});
            return;
        }

        updateSorting({columnKey: sortKey, order: 'asc'});
    };

    if (!columns || columns.length === 0) {
        return null;
    }

    return (
        <View style={[styles.flexRow, styles.gap2]}>
            {columns.map((column) => {
                const isActive = sortBy === column.key;
                return (
                    <SortButton
                        key={column.key}
                        option={{label: column.label, value: column.key}}
                        isActive={isActive}
                        sortOrder={sortOrder}
                        onPress={handleSortPress}
                    />
                );
            })}
        </View>
    );
}

export default TableSortButtons;
