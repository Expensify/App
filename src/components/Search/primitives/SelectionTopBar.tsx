import SearchSelectAllMenu from '@components/Search/SearchList/SearchSelectAllMenu';

import useThemeStyles from '@hooks/useThemeStyles';

import React from 'react';
import {View} from 'react-native';

type SelectionTopBarProps = {
    /** Wide-layout flag, drives the compact header style. */
    isLargeScreenWidth: boolean;

    /** Whether grouped rows are split into sticky pairs (adds the sticky-overlap style). Always false in the flat view. */
    shouldSplitGroups: boolean;

    /** Whether the list supports multi-select (renders the select-all menu). */
    canSelectMultiple: boolean;

    /** Whether every selectable row is selected. */
    isSelectAllChecked: boolean | undefined;

    /** Count of currently-selected rows. */
    selectedItemsLength: number;

    /** Count of selectable rows. */
    totalItems: number;

    /** Whether all transactions are loaded (gates the fully-checked state in grouped views). */
    hasLoadedAllTransactions: boolean | undefined;

    /** Whether to render the textual select-all button (no column header present). */
    selectAllButtonVisible: boolean;

    /** Fired when the header checkbox / select-all button is pressed. */
    onAllCheckboxPress: () => void;

    /** The column header element rendered to the right of the select-all control. */
    SearchTableHeader?: React.JSX.Element;
};

/**
 * The Search list's sticky header bar: an optional select-all control plus the column header.
 * Extracted from SearchList so ExpenseFlatSearchView can reuse it. Purely presentational,
 * the consumer computes the selection counts and passes them in so a checkbox press does not re-render
 * the whole bar subtree through a selection subscription here.
 */
function SelectionTopBar({
    isLargeScreenWidth,
    shouldSplitGroups,
    canSelectMultiple,
    isSelectAllChecked,
    selectedItemsLength,
    totalItems,
    hasLoadedAllTransactions,
    selectAllButtonVisible,
    onAllCheckboxPress,
    SearchTableHeader,
}: SelectionTopBarProps) {
    const styles = useThemeStyles();

    return (
        <View
            style={[
                styles.searchListHeaderContainerStyle,
                isLargeScreenWidth ? [styles.listTableHeaderCompact, styles.searchListHeaderTableStyle, styles.mh5] : styles.listTableHeader,
                isLargeScreenWidth && shouldSplitGroups && styles.searchListHeaderTableStickyOverlap,
            ]}
        >
            {canSelectMultiple && (
                <SearchSelectAllMenu
                    isSelectAllChecked={isSelectAllChecked}
                    isIndeterminate={selectedItemsLength > 0 && (selectedItemsLength !== totalItems || !hasLoadedAllTransactions)}
                    selectedItemsLength={selectedItemsLength}
                    totalItems={totalItems}
                    shouldShowTextButton={selectAllButtonVisible}
                    onAllCheckboxPress={onAllCheckboxPress}
                />
            )}

            {SearchTableHeader}
        </View>
    );
}

export default SelectionTopBar;
