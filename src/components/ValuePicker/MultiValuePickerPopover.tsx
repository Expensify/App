/** A multi-select list of plain values in a container anchored to a field's row */
import AnchoredSelectionListPopover from '@components/AnchoredSelectionListPopover';
import type {AnchoredSelectionListPopoverProps} from '@components/AnchoredSelectionListPopover';
import FSClassView from '@components/FSClassView';

import useThemeStyles from '@hooks/useThemeStyles';

import canFocusInputOnScreenFocus from '@libs/canFocusInputOnScreenFocus';
import type {ForwardedFSClassProps} from '@libs/Fullstory/types';

import CONST from '@src/CONST';

import React from 'react';

import type {MultiValueSelectionListProps} from './MultiValueSelectionList';

import MultiValueSelectionList from './MultiValueSelectionList';

type MultiValuePickerPopoverProps = ForwardedFSClassProps &
    Omit<MultiValueSelectionListProps, 'isVisible' | 'addBottomSafeAreaPadding' | 'shouldAutoFocusSearchInput'> &
    Omit<AnchoredSelectionListPopoverProps, 'optionCount' | 'isSearchable' | 'headerActions' | 'children'>;

/**
 * A list of plain values the user checks several of, in a container anchored to a row: a pop-over on a wide layout,
 * a bottom sheet on a narrow one. Applying the checked values hands them to `onApply` and closes the container, and
 * dismissing it drops them, as the attendee list does.
 */
function MultiValuePickerPopover({items, selectedValues, onApply, applyButtonSentryLabel, forwardedFSClass, isVisible, onClose, ...popoverProps}: MultiValuePickerPopoverProps) {
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
                <MultiValueSelectionList
                    items={items}
                    selectedValues={selectedValues}
                    isVisible={isVisible}
                    onApply={(values) => {
                        onApply(values);
                        onClose();
                    }}
                    applyButtonSentryLabel={applyButtonSentryLabel}
                    // A bottom sheet opening with the keyboard up would have most of its options covered
                    shouldAutoFocusSearchInput={canFocusInputOnScreenFocus()}
                />
            </FSClassView>
        </AnchoredSelectionListPopover>
    );
}

export default MultiValuePickerPopover;
