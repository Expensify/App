import React from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import SearchBar from '@components/SearchBar';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import {useTableContext} from './TableContext';

/**
 * Renders a search input that filters table data.
 *
 * This component displays a text input that updates the table's search string.
 * The filtering logic is defined by the `isItemInSearch` callback passed to the
 * parent `<Table>` component.
 *
 * Features:
 * - Magnifying glass icon when empty
 * - Clear button when text is present
 * - Auto-updates table data as user types
 *
 * @example
 * ```tsx
 * <Table
 *   data={items}
 *   columns={columns}
 *   renderItem={renderItem}
 *   isItemInSearch={(item, searchString) =>
 *     item.name.toLowerCase().includes(searchString.toLowerCase())
 *   }
 * >
 *   <Table.SearchBar label="Find item" />
 *   <Table.Body />
 * </Table>
 * ```
 */
type TableSearchBarProps = {
    /** Label and accessibility label for the search input. */
    label: string;

    /** Optional style for the search bar container. */
    style?: StyleProp<ViewStyle>;
};

function TableSearchBar({label, style}: TableSearchBarProps) {
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['MagnifyingGlass']);
    const {
        activeSearchString,
        tableMethods: {updateSearchString},
    } = useTableContext();

    return (
        <SearchBar
            label={label}
            style={style}
            inputValue={activeSearchString}
            icon={activeSearchString.length === 0 ? expensifyIcons.MagnifyingGlass : undefined}
            onChangeText={(text) => updateSearchString(text)}
        />
    );
}

export default TableSearchBar;
