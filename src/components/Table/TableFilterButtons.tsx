import React from 'react';
import type {ReactNode} from 'react';
import {FlatList} from 'react-native';
import DropdownButton from '@components/Search/FilterDropdowns/DropdownButton';
import type {PopoverComponentProps} from '@components/Search/FilterDropdowns/DropdownButton';
import MultiSelectPopup from '@components/Search/FilterDropdowns/MultiSelectPopup';
import SingleSelectPopup from '@components/Search/FilterDropdowns/SingleSelectPopup';
import withViewportOffsetTop from '@components/withViewportOffsetTop';
import useThemeStyles from '@hooks/useThemeStyles';
import {useTableContext} from './TableContext';
import type {FilterConfig} from './types';

type FilterButtonItem = {
    key: string;
    label: string;
    value: string | string[] | null;
    PopoverComponent: (props: PopoverComponentProps) => ReactNode;
};

type MultiSelectPopoverFactoryProps = {
    filterKey: string;
    filterConfig: FilterConfig;
    currentFilterValue: unknown;
    setFilter: (key: string, value: unknown) => void;
};

function createMultiSelectPopover({filterKey, filterConfig, currentFilterValue, setFilter}: MultiSelectPopoverFactoryProps) {
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

type SingleSelectPopoverFactoryProps = {
    filterKey: string;
    filterConfig: FilterConfig;
    currentFilterValue: unknown;
    setFilter: (key: string, value: unknown) => void;
};

function createSingleSelectPopover({filterKey, filterConfig, currentFilterValue, setFilter}: SingleSelectPopoverFactoryProps) {
    return ({closeOverlay}: PopoverComponentProps) => {
        const selectedItem = filterConfig.options.find((option) => option.value === currentFilterValue)
            ? {
                  text: filterConfig.options.find((option) => option.value === currentFilterValue)?.label,
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
}

type FilterItemRendererProps = {
    item: FilterButtonItem;
};

function FilterItemRenderer({item}: FilterItemRendererProps) {
    const DropdownButtonWithViewport = withViewportOffsetTop(DropdownButton);
    return (
        <DropdownButtonWithViewport
            label={item.label}
            value={item.value}
            PopoverComponent={item.PopoverComponent}
        />
    );
}

function getDisplayValue(filterConfig: FilterConfig, currentFilterValue: unknown): string | string[] | null {
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
}

function createPopoverComponent(
    filterKey: string,
    filterConfig: FilterConfig,
    currentFilterValue: unknown,
    setFilter: (key: string, value: unknown) => void,
): (props: PopoverComponentProps) => ReactNode {
    if (filterConfig.filterType === 'multi-select') {
        return createMultiSelectPopover({filterKey, filterConfig, currentFilterValue, setFilter});
    }

    return createSingleSelectPopover({filterKey, filterConfig, currentFilterValue, setFilter});
}

function buildFilterItems(filterConfigs: Record<string, FilterConfig> | undefined, filters: Record<string, unknown>, setFilter: (key: string, value: unknown) => void): FilterButtonItem[] {
    if (!filterConfigs) {
        return [];
    }

    return Object.keys(filterConfigs).map((filterKey) => {
        const filterConfig = filterConfigs[filterKey];
        const currentFilterValue = filters[filterKey];

        return {
            key: filterKey,
            label: filterKey,
            value: getDisplayValue(filterConfig, currentFilterValue),
            PopoverComponent: createPopoverComponent(filterKey, filterConfig, currentFilterValue, setFilter),
        };
    });
}

function renderFilterItem({item}: {item: FilterButtonItem}) {
    return <FilterItemRenderer item={item} />;
}

function TableFilterButtons() {
    const styles = useThemeStyles();
    const {currentFilters: filterConfigs, currentFilters: filters, updateFilter: setFilter} = useTableContext();

    const filterItems = buildFilterItems(filterConfigs, filters, setFilter);

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

export default TableFilterButtons;
