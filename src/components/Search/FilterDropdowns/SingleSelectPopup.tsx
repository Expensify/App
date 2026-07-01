import React, {useCallback, useState} from 'react';
import type {StyleProp, ViewStyle} from 'react-native';
import {ListFilterHeightContextProvider} from '@components/Search/FilterComponents/ListFilterHeightContext';
import type {SingleSelectItem} from '@components/Search/FilterComponents/SingleSelect';
import SingleSelect from '@components/Search/FilterComponents/SingleSelect';
import type {SelectionListStyle} from '@components/SelectionList/types';
import CONST from '@src/CONST';
import BasePopup from './BasePopup';

type SingleSelectPopupProps<T> = {
    /** The label to show when in an overlay on mobile */
    label?: string;

    /** The list of all items to show up in the list */
    items: Array<SingleSelectItem<T>>;

    /** The currently selected item */
    value: SingleSelectItem<T> | undefined;

    onBackButtonPress?: () => void;

    /** Function to call to close the overlay when changes are applied */
    closeOverlay: () => void;

    /** Function to call when changes are applied */
    onChange: (item: SingleSelectItem<T> | undefined) => void;

    /** Whether the search input should be displayed */
    isSearchable?: boolean;

    /** Search input place holder */
    searchPlaceholder?: string;

    /** The default value to set when reset is clicked */
    defaultValue?: string;

    style?: StyleProp<ViewStyle>;

    /** Custom styles for the SelectionList */
    selectionListStyle?: SelectionListStyle;

    /** Custom height for each item in the list. Overrides the default row height and adjusts the popover size accordingly. */
    itemHeight?: number;

    /** Whether SelectionList of popup should stay mounted when popup is not visible. */
    shouldShowList?: boolean;
};

function SingleSelectPopup<T extends string>({
    label,
    value,
    items,
    onBackButtonPress,
    closeOverlay,
    onChange,
    isSearchable,
    searchPlaceholder,
    defaultValue,
    style,
    selectionListStyle,
    itemHeight,
    shouldShowList = true,
}: SingleSelectPopupProps<T>) {
    const [selectedItem, setSelectedItem] = useState(value);

    const applyChanges = useCallback(() => {
        onChange(selectedItem);
        closeOverlay();
    }, [closeOverlay, onChange, selectedItem]);

    const resetChanges = useCallback(() => {
        onChange(items.find((item) => item.value === defaultValue));
        closeOverlay();
    }, [closeOverlay, onChange, defaultValue, items]);

    return (
        <BasePopup
            label={label}
            onReset={resetChanges}
            onApply={applyChanges}
            onBackButtonPress={onBackButtonPress}
            resetSentryLabel={CONST.SENTRY_LABEL.SEARCH.FILTER_POPUP_RESET_SINGLE_SELECT}
            applySentryLabel={CONST.SENTRY_LABEL.SEARCH.FILTER_POPUP_APPLY_SINGLE_SELECT}
            style={[style]}
        >
            <ListFilterHeightContextProvider>
                <SingleSelect
                    items={items}
                    value={value}
                    onChange={setSelectedItem}
                    hasHeader={!!onBackButtonPress}
                    hasTitle={!!label}
                    isSearchable={isSearchable}
                    searchPlaceholder={searchPlaceholder}
                    selectionListStyle={selectionListStyle}
                    shouldShowList={shouldShowList}
                    itemHeight={itemHeight}
                />
            </ListFilterHeightContextProvider>
        </BasePopup>
    );
}

export default SingleSelectPopup;
