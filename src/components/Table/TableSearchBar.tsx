import React from 'react';
import {View} from 'react-native';
import TextInput from '@components/TextInput';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useLocalize from '@hooks/useLocalize';
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
 *   <Table.SearchBar />
 *   <Table.Body />
 * </Table>
 * ```
 */
type TableSearchBarProps = {
    /** Optional label and accessibility label for the search input. Defaults to "Find card". */
    label?: string;
};

function TableSearchBar({label}: TableSearchBarProps = {}) {
    const {translate} = useLocalize();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['MagnifyingGlass']);
    const {
        activeSearchString,
        tableMethods: {updateSearchString},
    } = useTableContext();

    const inputLabel = label ?? translate('workspace.companyCards.findCard');

    return (
        <View>
            <TextInput
                label={inputLabel}
                accessibilityLabel={inputLabel}
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
