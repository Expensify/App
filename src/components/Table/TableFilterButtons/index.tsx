import React from 'react';
import type {ReactNode} from 'react';
import {FlatList, View} from 'react-native';
import type {StyleProp, ViewProps, ViewStyle} from 'react-native';
import DropdownButton from '@components/Search/FilterDropdowns/DropdownButton';
import {useTableContext} from '@components/Table/TableContext';
import useLocalize from '@hooks/useLocalize';
import useResponsiveLayout from '@hooks/useResponsiveLayout';
import useThemeStyles from '@hooks/useThemeStyles';
import buildFilterItems from './buildFilterItems';
import type {FilterButtonItem} from './buildFilterItems';

/**
 * Props for the TableFilterButtons component.
 */
type TableFilterButtonsProps = ViewProps & {
    /** Optional custom styles for the horizontal FlatList content container. */
    contentContainerStyle?: StyleProp<ViewStyle>;
};

/**
 * Renders dropdown filter buttons for the table.
 *
 * This component displays filter buttons based on the `filters` configuration passed
 * to the parent `<Table>` component. Each filter becomes a dropdown button that shows
 * either a single-select or multi-select popup.
 *
 * The filtering logic is defined by the `isItemInFilter` callback on the parent Table.
 *
 * Supports:
 * - Single-select filters (one value at a time)
 * - Multi-select filters (multiple values)
 * - Responsive layout adjustments for narrow screens
 *
 * @example
 * ```tsx
 * const filterConfig: FilterConfig = {
 *   status: {
 *     filterType: 'single-select',
 *     options: [
 *       { label: 'All', value: 'all' },
 *       { label: 'Active', value: 'active' },
 *     ],
 *     default: 'all',
 *   },
 *   categories: {
 *     filterType: 'multi-select',
 *     options: [
 *       { label: 'Food', value: 'food' },
 *       { label: 'Travel', value: 'travel' },
 *     ],
 *   },
 * };
 *
 * <Table
 *   data={items}
 *   columns={columns}
 *   renderItem={renderItem}
 *   filters={filterConfig}
 *   isItemInFilter={(item, filterValues) =>
 *     filterValues.includes(item.status)
 *   }
 * >
 *   <Table.FilterButtons />
 *   <Table.Body />
 * </Table>
 * ```
 */
function TableFilterButtons({contentContainerStyle, ...props}: TableFilterButtonsProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {
        filterConfig: filterConfigs,
        activeFilters: filters,
        tableMethods: {updateFilter},
    } = useTableContext();

    const setFilter = (key: string, value: unknown) => {
        updateFilter({key, value});
    };

    const filterItems = buildFilterItems(filterConfigs, filters, setFilter, translate('search.filtersHeader'));

    if (filterItems.length === 0) {
        return null;
    }

    return (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <View {...props}>
            <FlatList
                horizontal
                data={filterItems}
                keyExtractor={(item) => item.key}
                renderItem={({item}) => <FilterItemRenderer item={item} />}
                contentContainerStyle={[styles.flexRow, styles.gap2, styles.w100, contentContainerStyle]}
                showsHorizontalScrollIndicator={false}
                CellRendererComponent={CellRendererComponent}
            />
        </View>
    );
}

/**
 * Props for the FilterItemRenderer component.
 */
type FilterItemRendererProps = {
    /** The filter button configuration to render. */
    item: FilterButtonItem;
};

/**
 * Renders a single filter dropdown button.
 */
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
            caretWrapperStyle={styles.gap2}
            medium
        />
    );
}

/**
 * Custom cell renderer for responsive layout adjustments.
 */
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

export default TableFilterButtons;
