<<<<<<< Current (Your changes)
=======
import React, {useCallback, useMemo} from 'react';
import {View} from 'react-native';
import Button from '@components/Button';
import Icon from '@components/Icon';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useTheme from '@hooks/useTheme';
import useThemeStyles from '@hooks/useThemeStyles';
import {useTableContext} from './TableContext';

function TableSortButtons() {
    const styles = useThemeStyles();
    const theme = useTheme();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['ArrowUpLong', 'ArrowDownLong'] as const);
    const {sortByConfig, sortBy, sortOrder, setSortBy} = useTableContext();

    const handleSortPress = useCallback(
        (sortKey: string) => {
            // If clicking the same sort key, toggle order; otherwise set new sort key with ascending order
            if (sortBy === sortKey) {
                const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
                setSortBy(sortKey, newOrder);
                return;
            }

            setSortBy(sortKey, 'asc');
        },
        [sortBy, sortOrder, setSortBy],
    );

    const sortButtons = useMemo(() => {
        if (!sortByConfig) {
            return [];
        }

        return sortByConfig.options.map((option) => {
            const isActive = sortBy === option.value;
            const sortIcon = sortOrder === 'asc' ? expensifyIcons.ArrowUpLong : expensifyIcons.ArrowDownLong;

            return (
                <Button
                    key={option.value}
                    small
                    onPress={() => handleSortPress(option.value)}
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
        });
    }, [sortByConfig, sortBy, sortOrder, handleSortPress, expensifyIcons, styles, theme]);

    if (!sortByConfig || sortButtons.length === 0) {
        return null;
    }

    return <View style={[styles.flexRow, styles.gap2]}>{sortButtons}</View>;
}

TableSortButtons.displayName = 'TableSortButtons';

export default TableSortButtons;
>>>>>>> Incoming (Background Agent changes)
