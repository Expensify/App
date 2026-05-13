import React, {useState} from 'react';
import type {ReactNode} from 'react';
import {ListFilterHeightContextProvider} from '@components/Search/FilterComponents/ListFilterHeightContext';
import MultiSelect from '@components/Search/FilterComponents/MultiSelect';
import CONST from '@src/CONST';
import type {Icon} from '@src/types/onyx/OnyxCommon';
import BasePopup from './BasePopup';

type MultiSelectItem<T> = {
    text: string;
    value: T;
    icons?: Icon[];
    leftElement?: ReactNode;
};

type MultiSelectPopupProps<T> = {
    /** The label to show when in an overlay on mobile */
    label: string;

    /** The list of all items to show up in the list */
    items: Array<MultiSelectItem<T>>;

    /** The currently selected items */
    value: Array<MultiSelectItem<T>>;

    /** Function to call to close the overlay when changes are applied */
    closeOverlay: () => void;

    /** Function to call when changes are applied */
    onChange: (item: Array<MultiSelectItem<T>>) => void;

    /** Whether the search input should be displayed. */
    isSearchable?: boolean;

    /** Search input placeholder. Defaults to 'common.search' when not provided. */
    searchPlaceholder?: string;

    /** Whether the data for the popover is loading */
    loading?: boolean;
};

function MultiSelectPopup<T extends string>({label, loading, value, items, closeOverlay, onChange, isSearchable, searchPlaceholder}: MultiSelectPopupProps<T>) {
    const [selectedItems, setSelectedItems] = useState(value);

    const applyChanges = () => {
        onChange(selectedItems);
        closeOverlay();
    };

    const resetChanges = () => {
        onChange([]);
        closeOverlay();
    };

    return (
        <BasePopup
            label={label}
            onReset={resetChanges}
            onApply={applyChanges}
            resetSentryLabel={CONST.SENTRY_LABEL.SEARCH.FILTER_POPUP_RESET_MULTI_SELECT}
            applySentryLabel={CONST.SENTRY_LABEL.SEARCH.FILTER_POPUP_APPLY_MULTI_SELECT}
        >
            <ListFilterHeightContextProvider>
                <MultiSelect
                    loading={loading}
                    value={value}
                    items={items}
                    isSearchable={isSearchable}
                    searchPlaceholder={searchPlaceholder}
                    onChange={setSelectedItems}
                />
            </ListFilterHeightContextProvider>
        </BasePopup>
    );
}

export type {MultiSelectItem};
export default MultiSelectPopup;
