import type {PopoverComponentProps} from '@components/Search/FilterDropdowns/FilterPopupButton';
import MultiSelectPopup from '@components/Search/FilterDropdowns/MultiSelectPopup';
import SingleSelectPopup from '@components/Search/FilterDropdowns/SingleSelectPopup';
import {useTableContext} from '@components/Table/TableContext';

import CONST from '@src/CONST';

import React from 'react';

export default function TableFilterPopoverComponent({closeOverlay}: PopoverComponentProps) {
    const {filterConfig, activeFilters, tableMethods} = useTableContext();
    // To start with, we expect tables to only have one set of filters. This will be updated in the future
    const filterKey = Object.keys(filterConfig ?? {}).at(0);

    if (!filterKey || !filterConfig) {
        return null;
    }

    const config = filterConfig[filterKey];
    const items = config.options.map((option) => ({
        text: option.label,
        value: option.value,
    }));

    if (config.filterType === CONST.TABLES.FILTER_TYPE.MULTI_SELECT) {
        const selectedValues = Array.isArray(activeFilters[filterKey]) ? activeFilters[filterKey] : [];
        const value = items.filter((item) => selectedValues.includes(item.value));

        return (
            <MultiSelectPopup
                showLabel
                items={items}
                value={value}
                label={config.label}
                closeOverlay={closeOverlay}
                onChange={(selectedItems) => {
                    tableMethods.updateFilter({
                        key: filterKey,
                        value: selectedItems.map((item) => item.value),
                    });
                }}
            />
        );
    }

    const value = items.find((item) => activeFilters[filterKey].includes(item.value));

    return (
        <SingleSelectPopup
            showLabel
            items={items}
            value={value}
            label={config.label}
            closeOverlay={closeOverlay}
            onChange={(selectedItem) => {
                tableMethods.updateFilter({
                    key: filterKey,
                    value: selectedItem ? [selectedItem.value] : [],
                });
            }}
        />
    );
}
