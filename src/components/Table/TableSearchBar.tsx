import React, {useEffect, useLayoutEffect, useRef} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import SearchBar from '@components/SearchBar';
import isTextInputFocused from '@components/TextInput/BaseTextInput/isTextInputFocused';
import type {BaseTextInputRef} from '@components/TextInput/BaseTextInput/types';
import {useMemoizedLazyExpensifyIcons} from '@hooks/useLazyAsset';
import useThemeStyles from '@hooks/useThemeStyles';
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
    const styles = useThemeStyles();
    const expensifyIcons = useMemoizedLazyExpensifyIcons(['MagnifyingGlass']);
    const inputRef = useRef<BaseTextInputRef>(null);
    const {
        activeSearchString,
        processedData,
        tableMethods: {updateSearchString},
    } = useTableContext();

    const hasActiveSearchString = activeSearchString.length > 0;

    useLayoutEffect(() => {
        if (!hasActiveSearchString || isTextInputFocused(inputRef)) {
            return;
        }

        inputRef.current?.focus?.();
    }, [hasActiveSearchString, processedData]);

    useEffect(() => {
        return () => updateSearchString('');
        // We only want the cleanup to run on unmount to reset the search state
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <SearchBar
            ref={inputRef}
            label={label}
            style={[styles.mnw200, style]}
            inputValue={activeSearchString}
            icon={activeSearchString.length === 0 ? expensifyIcons.MagnifyingGlass : undefined}
            onChangeText={(text) => updateSearchString(text)}
        />
    );
}

export default TableSearchBar;
