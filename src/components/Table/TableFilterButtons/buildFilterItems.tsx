import React from 'react';
import type {ReactNode} from 'react';
import type {PopoverComponentProps} from '@components/Search/FilterDropdowns/DropdownButton';
import MultiSelectPopup from '@components/Search/FilterDropdowns/MultiSelectPopup';
import SingleSelectPopup from '@components/Search/FilterDropdowns/SingleSelectPopup';
import type {FilterConfig, FilterConfigEntry} from '@components/Table/middlewares/filtering';

/**
 * A single filter button item.
 *
 * @template FilterKey - The type of filter keys.
 */
type FilterButtonItem<FilterKey extends string = string> = {
    key: FilterKey;
    label: string;
    value: string | string[] | null;
    PopoverComponent: (props: PopoverComponentProps) => React.ReactNode;
};

/**
 * Builds filter button items from a filter configuration.
 *
 * @template FilterKey - The type of filter keys.
 * @param filterConfigs - The filter configuration.
 * @param filters - The current filters.
 * @param setFilter - The function to set a filter.
 * @param filtersLabel - The label to display for the filters.
 * @returns The filter button items.
 */
function buildFilterItems<FilterKey extends string = string>(
    filterConfigs: FilterConfig<FilterKey> | undefined,
    filters: Record<string, unknown>,
    setFilter: (key: string, value: unknown) => void,
    filtersLabel: string,
): Array<FilterButtonItem<FilterKey>> {
    if (!filterConfigs) {
        return [];
    }

    const filterKeys = Object.keys(filterConfigs) as FilterKey[];

    return filterKeys.map((filterKey) => {
        const filterConfig = filterConfigs[filterKey];
        const currentFilterValue = filters[filterKey];
        const displayValue = getDisplayValue(filterConfig, currentFilterValue);

        const PopoverComponent = createPopoverComponent(filterKey, filterConfig, currentFilterValue, setFilter);

        // Determine the label to display
        let label: string;
        if (filterConfig.filterType === 'multi-select') {
            // For multi-select: show selected values joined, or translated "Filters" if nothing selected
            if (Array.isArray(displayValue) && displayValue.length > 0) {
                label = displayValue.join(', ');
            } else {
                label = filtersLabel;
            }

            return {
                key: filterKey,
                label,
                value: null,
                PopoverComponent,
            };
        }

        // For single-select: show display value, or default option label, or filterKey
        if (displayValue && !Array.isArray(displayValue)) {
            label = displayValue;
        } else if (filterConfig.default) {
            // Find the default option label
            const defaultOption = filterConfig.options.find((opt) => opt.value === filterConfig.default);
            label = defaultOption?.label ?? filterKey;
        } else {
            label = filterKey;
        }

        return {
            key: filterKey,
            label,
            value: null,
            PopoverComponent,
        };
    });
}

/**
 * Creates a popover component for a filter.
 *
 * @template FilterKey - The type of filter keys.
 * @param filterKey - The key of the filter.
 * @param filterConfig - The filter configuration.
 * @param currentFilterValue - The current filter value.
 * @param setFilter - The function to set a filter.
 * @returns The popover component.
 */
function createPopoverComponent<FilterKey extends string = string>(
    filterKey: FilterKey,
    filterConfig: FilterConfigEntry,
    currentFilterValue: unknown,
    setFilter: (key: string, value: unknown) => void,
): (props: PopoverComponentProps) => ReactNode {
    if (filterConfig.filterType === 'multi-select') {
        return createMultiSelectPopover({filterKey, filterConfig, currentFilterValue, setFilter});
    }

    return createSingleSelectPopover({filterKey, filterConfig, currentFilterValue, setFilter});
}

/**
 * Props for the multi-select popover factory.
 *
 * @template FilterKey - The type of filter keys.
 */
type MultiSelectPopoverFactoryProps<FilterKey extends string = string> = {
    filterKey: FilterKey;
    filterConfig: FilterConfigEntry;
    currentFilterValue: unknown;
    setFilter: (key: FilterKey, value: unknown) => void;
};

/**
 * Creates a multi-select popover component.
 *
 * @template FilterKey - The type of filter keys.
 * @param filterKey - The key of the filter.
 * @param filterConfig - The filter configuration.
 * @param currentFilterValue - The current filter value.
 * @param setFilter - The function to set a filter.
 * @returns The multi-select popover component.
 */
function createMultiSelectPopover<FilterKey extends string = string>({filterKey, filterConfig, currentFilterValue, setFilter}: MultiSelectPopoverFactoryProps<FilterKey>) {
    return ({closeOverlay}: PopoverComponentProps) => {
        const currentValueArray = Array.isArray(currentFilterValue) ? currentFilterValue : [];
        const selectedItems = filterConfig.options
            .filter((option) => currentValueArray.includes(option.value))
            .map((option) => ({
                text: option.label,
                value: option.value,
            }));

        return (
            <MultiSelectPopup
                label={filterKey}
                items={filterConfig.options.map((option) => ({
                    text: option.label,
                    value: option.value,
                }))}
                value={selectedItems}
                closeOverlay={closeOverlay}
                onChange={(items) => {
                    const values = items.map((item) => item.value);
                    setFilter(filterKey, values);
                }}
            />
        );
    };
}

/**
 * Props for the single-select popover factory.
 *
 * @template FilterKey - The type of filter keys.
 */
type SingleSelectPopoverFactoryProps<FilterKey extends string = string> = {
    filterKey: FilterKey;
    filterConfig: FilterConfigEntry;
    currentFilterValue: unknown;
    setFilter: (key: string, value: unknown) => void;
};

/**
 * Creates a single-select popover component.
 *
 * @template FilterKey - The type of filter keys.
 * @param filterKey - The key of the filter.
 * @param filterConfig - The filter configuration.
 * @param currentFilterValue - The current filter value.
 * @param setFilter - The function to set a filter.
 * @returns The single-select popover component.
 */
function createSingleSelectPopover<FilterKey extends string = string>({filterKey, filterConfig, currentFilterValue, setFilter}: SingleSelectPopoverFactoryProps<FilterKey>) {
    return ({closeOverlay}: PopoverComponentProps) => {
        const foundOption = filterConfig.options.find((option) => option.value === currentFilterValue);
        const selectedItem = foundOption
            ? {
                  text: foundOption.label,
                  value: currentFilterValue as FilterKey,
              }
            : null;

        return (
            <SingleSelectPopup
                defaultValue={filterConfig.default}
                label={filterConfig.showLabel ? filterKey : undefined}
                items={filterConfig.options.map((option) => ({
                    text: option.label,
                    value: option.value,
                }))}
                value={selectedItem}
                closeOverlay={closeOverlay}
                onChange={(item) => setFilter(filterKey, item?.value ?? null)}
            />
        );
    };
}

/**
 * Gets the display value for a filter.
 *
 * @param filterConfig - The filter configuration.
 * @param currentFilterValue - The current filter value.
 * @returns The display value.
 */
function getDisplayValue(filterConfig: FilterConfigEntry, currentFilterValue: unknown): string | string[] | null {
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

export default buildFilterItems;
export type {FilterButtonItem};
