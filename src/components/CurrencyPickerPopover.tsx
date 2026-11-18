/** The currency list in a container anchored to a field's row */
import {useCurrencyListState} from '@hooks/useCurrencyList';
import useLocalize from '@hooks/useLocalize';
import useThemeStyles from '@hooks/useThemeStyles';

import canFocusInputOnScreenFocus from '@libs/canFocusInputOnScreenFocus';
import type {ForwardedFSClassProps} from '@libs/Fullstory/types';

import React from 'react';

import type {AnchoredSelectionListPopoverProps} from './AnchoredSelectionListPopover';
import type {CurrencyListItem} from './CurrencySelectionList/types';

import AnchoredSelectionListPopover from './AnchoredSelectionListPopover';
import CurrencySelectionList from './CurrencySelectionList';
import FSClassView from './FSClassView';

type CurrencyPickerPopoverProps = ForwardedFSClassProps & {
    /** Code of the currency the field holds, which the list marks and pins to the top */
    selectedCurrencyCode?: string;

    /** Called with the picked currency, before the container closes itself */
    onSelected: (item: CurrencyListItem) => void;
} & Omit<AnchoredSelectionListPopoverProps, 'optionCount' | 'isSearchable' | 'headerActions' | 'children'>;

/**
 * The searchable currency list in a container anchored to a row: a pop-over on a wide layout, a bottom sheet on a
 * narrow one. Picking a currency hands it to `onSelected` and closes the container, as the category, tag and tax
 * lists do.
 */
function CurrencyPickerPopover({selectedCurrencyCode, onSelected, forwardedFSClass, onClose, ...popoverProps}: CurrencyPickerPopoverProps) {
    const styles = useThemeStyles();
    const {translate} = useLocalize();
    const {currencyList} = useCurrencyListState();

    return (
        <AnchoredSelectionListPopover
            {...popoverProps}
            onClose={onClose}
            optionCount={Object.keys(currencyList).length}
            isSearchable
        >
            {/* The container renders outside the row, so a masked field masks its options here too */}
            <FSClassView
                style={styles.flex1}
                forwardedFSClass={forwardedFSClass}
            >
                <CurrencySelectionList
                    searchInputLabel={translate('common.search')}
                    initiallySelectedCurrencyCode={selectedCurrencyCode}
                    onSelect={(item) => {
                        onSelected(item);
                        onClose();
                    }}
                    // A bottom sheet opening with the keyboard up would have most of its options covered
                    shouldAutoFocusSearchInput={canFocusInputOnScreenFocus()}
                />
            </FSClassView>
        </AnchoredSelectionListPopover>
    );
}

export default CurrencyPickerPopover;
