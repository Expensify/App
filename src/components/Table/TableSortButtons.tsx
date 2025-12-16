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
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['ArrowUpLong', 'ArrowDownLong'] as const);
    const {sortByConfig, sortColumn: sortBy, sortOrder, updateSorting: setSortBy} = useTableContext();

    const handleSortPress = (sortKey: string) => {
        // If clicking the same sort key, toggle order; otherwise set new sort key with ascending order
        if (sortBy === sortKey) {
            const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
            setSortBy(sortKey, newOrder);
            return;
        }

        setSortBy(sortKey, 'asc');
    };

    if (!sortByConfig || sortByConfig.options.length === 0) {
        return null;
    }

    return (
        <View style={[styles.flexRow, styles.gap2]}>
            {sortByConfig.options.map((option) => {
                const isActive = sortBy === option.value;
                return (
                    <SortButton
                        key={option.value}
                        option={option}
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
