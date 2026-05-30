import React from 'react';
import {View} from 'react-native';
import TextInput from '@components/TextInput';
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
};

function TableSearchBar({label}: TableSearchBarProps) {
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['MagnifyingGlass']);
    const {
        activeSearchString,
        tableMethods: {updateSearchString},
    } = useTableContext();

    return (
        <View>
            <TextInput
                label={label}
                accessibilityLabel={label}
                value={activeSearchString}
                onChangeText={(text) => updateSearchString(text)}
                icon={activeSearchString.length === 0 ? expensifyIcons.MagnifyingGlass : undefined}
                includeIconPadding={false}
                shouldShowClearButton
                shouldHideClearButton={activeSearchString.length === 0}
                onClearInput={() => updateSearchString('')}
                autoCapitalize="none"
                autoCorrect={false}
                spellCheck={false}
            />
        </View>
    );
}

export default TableSearchBar;
