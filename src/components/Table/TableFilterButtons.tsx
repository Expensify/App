<<<<<<< Current (Your changes)
=======
import React, {useCallback, useMemo} from 'react';
import type {ReactNode} from 'react';
import {FlatList, View} from 'react-native';
import DropdownButton from '@components/Search/FilterDropdowns/DropdownButton';
import type {PopoverComponentProps} from '@components/Search/FilterDropdowns/DropdownButton';
import MultiSelectPopup from '@components/Search/FilterDropdowns/MultiSelectPopup';
import SingleSelectPopup from '@components/Search/FilterDropdowns/SingleSelectPopup';
import withViewportOffsetTop from '@components/withViewportOffsetTop';
import {useTableContext} from './TableContext';
import useThemeStyles from '@hooks/useThemeStyles';

type FilterButtonItem = {
    key: string;
    label: string;
    value: string | string[] | null;
    PopoverComponent: (props: PopoverComponentProps) => ReactNode;
};

function TableFilterButtons() {
    const styles = useThemeStyles();
    const {filterConfigs, filters, setFilter} = useTableContext();

    // Build filter button items from filter configs
    const filterItems = useMemo<FilterButtonItem[]>(() => {
        if (!filterConfigs) {
            return [];
        }

        return Object.keys(filterConfigs).map((filterKey) => {
            const filterConfig = filterConfigs[filterKey];
            const currentFilterValue = filters[filterKey];

            // Format display value based on filter type
            const getDisplayValue = (): string | string[] | null => {
                if (currentFilterValue === undefined || currentFilterValue === null) {
                    return null;
                }

                if (filterConfig.filterType === 'multi-select') {
                    const filterValueArray = Array.isArray(currentFilterValue) ? currentFilterValue : [];
                    if (filterValueArray.length === 0) {
                        return null;
                    }

                    // Find matching option labels for selected values
                    const selectedOptions = filterConfig.options.filter((option) => filterValueArray.includes(option.value));
                    return selectedOptions.map((option) => option.label);
                }

                // Single-select: find the matching option label
                const selectedOption = filterConfig.options.find((option) => option.value === currentFilterValue);
                return selectedOption?.label ?? null;
            };

            // Create popover component based on filter type
            const createPopoverComponent = (): (props: PopoverComponentProps) => ReactNode => {
                if (filterConfig.filterType === 'multi-select') {
                    return ({closeOverlay}: PopoverComponentProps) => {
                        const currentValueArray = Array.isArray(currentFilterValue) ? currentFilterValue : [];
                        const selectedItems = filterConfig.options
                            .filter((option) => currentValueArray.includes(option.value))
                            .map((option) => ({
                                text: option.label,
                                value: option.value as string,
                            }));

                        const handleChange = (items: Array<{text: string; value: string}>) => {
                            const values = items.map((item) => item.value);
                            setFilter(filterKey, values);
                        };

                        return (
                            <MultiSelectPopup
                                label={filterKey}
                                items={filterConfig.options.map((option) => ({
                                    text: option.label,
                                    value: option.value as string,
                                }))}
                                value={selectedItems}
                                closeOverlay={closeOverlay}
                                onChange={handleChange}
                            />
                        );
                    };
                }

                // Single-select popover
                return ({closeOverlay}: PopoverComponentProps) => {
                    const selectedItem = filterConfig.options.find((option) => option.value === currentFilterValue)
                        ? {
                              text: filterConfig.options.find((option) => option.value === currentFilterValue)!.label,
                              value: currentFilterValue as string,
                          }
                        : null;

                    const handleChange = (item: {text: string; value: string} | null) => {
                        setFilter(filterKey, item?.value ?? null);
                    };

                    return (
                        <SingleSelectPopup
                            label={filterKey}
                            items={filterConfig.options.map((option) => ({
                                text: option.label,
                                value: option.value as string,
                            }))}
                            value={selectedItem}
                            closeOverlay={closeOverlay}
                            onChange={handleChange}
                        />
                    );
                };
            };

            return {
                key: filterKey,
                label: filterKey,
                value: getDisplayValue(),
                PopoverComponent: createPopoverComponent(),
            };
        });
    }, [filterConfigs, filters, setFilter]);

    const renderFilterItem = useCallback(
        ({item}: {item: FilterButtonItem}) => {
            const DropdownButtonWithViewport = withViewportOffsetTop(DropdownButton);
            return (
                <DropdownButtonWithViewport
                    label={item.label}
                    value={item.value}
                    PopoverComponent={item.PopoverComponent}
                />
            );
        },
        [],
    );

    if (filterItems.length === 0) {
        return null;
    }

    return (
        <FlatList
            horizontal
            data={filterItems}
            keyExtractor={(item) => item.key}
            renderItem={renderFilterItem}
            contentContainerStyle={[styles.flexRow, styles.gap2]}
            showsHorizontalScrollIndicator={false}
        />
    );
}

TableFilterButtons.displayName = 'TableFilterButtons';

export default TableFilterButtons;
>>>>>>> Incoming (Background Agent changes)
