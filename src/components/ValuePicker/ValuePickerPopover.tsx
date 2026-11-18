/** A list of plain values in a container anchored to a field's row */
import AnchoredSelectionListPopover from '@components/AnchoredSelectionListPopover';
import type {AnchoredSelectionListPopoverProps} from '@components/AnchoredSelectionListPopover';
import FSClassView from '@components/FSClassView';

import useThemeStyles from '@hooks/useThemeStyles';

import canFocusInputOnScreenFocus from '@libs/canFocusInputOnScreenFocus';
import type {ForwardedFSClassProps} from '@libs/Fullstory/types';

import CONST from '@src/CONST';

import React from 'react';

import type {ValuePickerItem, ValueSelectionListProps} from './types';

import ValueSelectionList from './ValueSelectionList';

type ValuePickerPopoverProps = ForwardedFSClassProps &
    Pick<ValueSelectionListProps, 'selectedItem' | 'onItemSelected'> & {
        /** Options, one row each */
        items: ValuePickerItem[];
    } & Omit<AnchoredSelectionListPopoverProps, 'optionCount' | 'isSearchable' | 'headerActions' | 'children'>;

/**
 * A list of plain values in a container anchored to a row: a pop-over on a wide layout, a bottom sheet on a narrow one.
 * Picking a value hands it to `onItemSelected` and closes the container, as the category, tag and tax lists do.
 */
function ValuePickerPopover({items, selectedItem, onItemSelected, forwardedFSClass, onClose, isVisible, ...popoverProps}: ValuePickerPopoverProps) {
    const styles = useThemeStyles();

    return (
        <AnchoredSelectionListPopover
            {...popoverProps}
            isVisible={isVisible}
            onClose={onClose}
            optionCount={items.length}
            // The list shows its search input from the standard limit, and the container sizes itself the same way.
            isSearchable={items.length >= CONST.STANDARD_LIST_ITEM_LIMIT}
        >
            {/* The container renders outside the row, so a masked field masks its options here too */}
            <FSClassView
                style={styles.flex1}
                forwardedFSClass={forwardedFSClass}
            >
                <ValueSelectionList
                    items={items}
                    selectedItem={selectedItem}
                    isVisible={isVisible}
                    onItemSelected={(item) => {
                        onItemSelected?.(item);
                        onClose();
                    }}
                    addBottomSafeAreaPadding={false}
                    // A bottom sheet opening with the keyboard up would have most of its options covered
                    shouldAutoFocusSearchInput={canFocusInputOnScreenFocus()}
                />
            </FSClassView>
        </AnchoredSelectionListPopover>
    );
}

export default ValuePickerPopover;
export type {ValuePickerPopoverProps};
