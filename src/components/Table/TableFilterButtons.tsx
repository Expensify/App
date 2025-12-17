import React, {useCallback} from 'react';
import type {ReactNode} from 'react';
import {FlatList} from 'react-native';
import type {StyleProp, ViewStyle} from 'react-native';
import {View} from 'react-native-web';
import DropdownButton from '@components/Search/FilterDropdowns/DropdownButton';
import type {PopoverComponentProps} from '@components/Search/FilterDropdowns/DropdownButton';
import MultiSelectPopup from '@components/Search/FilterDropdowns/MultiSelectPopup';
import SingleSelectPopup from '@components/Search/FilterDropdowns/SingleSelectPopup';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import {useTableContext} from './TableContext';
import type {FilterConfig, FilterConfigEntry} from './types';

type FilterButtonItem = {
    key: string;
    label: string;
    value: string | string[] | null;
    PopoverComponent: (props: PopoverComponentProps) => ReactNode;
};

type MultiSelectPopoverFactoryProps = {
    filterKey: string;
    filterConfig: FilterConfigEntry;
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
                value: option.value,
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
                    value: option.value,
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
    filterConfig: FilterConfigEntry;
    currentFilterValue: unknown;
    setFilter: (key: string, value: unknown) => void;
};

function createSingleSelectPopover({filterKey, filterConfig, currentFilterValue, setFilter}: SingleSelectPopoverFactoryProps) {
    return ({closeOverlay}: PopoverComponentProps) => {
        const foundOption = filterConfig.options.find((option) => option.value === currentFilterValue);
        const selectedItem = foundOption
            ? {
                  text: foundOption.label,
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
                    value: option.value,
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
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();
    const shouldShowResponsiveLayout = shouldUseNarrowLayout || isMediumScreenWidth;
    return (
        <DropdownButton
            label={item.label}
            value={item.value}
            PopoverComponent={item.PopoverComponent}
            innerStyles={[styles.gap2, shouldShowResponsiveLayout && styles.mw100]}
            wrapperStyle={shouldShowResponsiveLayout && styles.w100}
            labelStyle={styles.fontSizeLabel}
            carretWrapperStyle={styles.gap2}
            medium
        />
    );
}

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

function createPopoverComponent(
    filterKey: string,
    filterConfig: FilterConfigEntry,
    currentFilterValue: unknown,
    setFilter: (key: string, value: unknown) => void,
): (props: PopoverComponentProps) => ReactNode {
    if (filterConfig.filterType === 'multi-select') {
        return createMultiSelectPopover({filterKey, filterConfig, currentFilterValue, setFilter});
    }

    return createSingleSelectPopover({filterKey, filterConfig, currentFilterValue, setFilter});
}

function buildFilterItems(
    filterConfigs: FilterConfig | undefined,
    filters: Record<string, unknown>,
    setFilter: (key: string, value: unknown) => void,
    filtersLabel: string,
): FilterButtonItem[] {
    if (!filterConfigs) {
        return [];
    }

    return Object.keys(filterConfigs).map((filterKey) => {
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

function renderFilterItem({item}: {item: FilterButtonItem}) {
    return <FilterItemRenderer item={item} />;
}

function CellRendererComponent({children, style, ...props}: {children: ReactNode; style: StyleProp<ViewStyle>}) {
    const styles = useThemeStyles();
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();
    const shouldShowResponsiveLayout = shouldUseNarrowLayout || isMediumScreenWidth;
    return (
        <View
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...props}
            style={[style, shouldShowResponsiveLayout && styles.flex1]}
        >
            {children}
        </View>
    );
}

function TableFilterButtons() {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {shouldUseNarrowLayout, isMediumScreenWidth} = useResponsiveLayout();
    const {filterConfig: filterConfigs, currentFilters: filters, updateFilter} = useTableContext();

    const setFilter = useCallback(
        (key: string, value: unknown) => {
            updateFilter({key, value});
        },
        [updateFilter],
    );

    const filterItems = buildFilterItems(filterConfigs, filters, setFilter, translate('search.filtersHeader'));

    if (filterItems.length === 0) {
        return null;
    }

    const shouldShowResponsiveLayout = shouldUseNarrowLayout || isMediumScreenWidth;

    return (
        <FlatList
            horizontal
            data={filterItems}
            keyExtractor={(item) => item.key}
            renderItem={renderFilterItem}
            style={shouldShowResponsiveLayout && [styles.flexGrow0, styles.flexShrink0]}
            contentContainerStyle={[styles.flexRow, styles.gap2, styles.w100]}
            showsHorizontalScrollIndicator={false}
            CellRendererComponent={CellRendererComponent}
        />
    );
}

export default TableFilterButtons;
