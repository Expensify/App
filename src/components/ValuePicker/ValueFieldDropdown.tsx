import AnchoredSelectionListPopover from '@components/AnchoredSelectionListPopover';
import ExpenseFieldDropdown from '@components/MoneyRequestConfirmationList/sections/ExpenseFieldDropdown';

import CONST from '@src/CONST';

import type {ComponentRef, ForwardedRef} from 'react';

import React, {useState} from 'react';
import {View} from 'react-native';

import type {ValuePickerItem, ValuePickerListItem} from './types';

import ValueSelectionList from './ValueSelectionList';
import ValueSelectorModal from './ValueSelectorModal';

type ValueFieldDropdownProps = {
    /** Value of the picked item */
    value?: string;

    /** Name of the field, shown as its placeholder and above the picked item */
    label: string;

    /** Items the user picks from */
    items?: ValuePickerItem[];

    /** Form error shown below the field */
    errorText?: string;

    /** Called with the picked item's value. Not called when the user picks the item already chosen. */
    onInputChange?: (value: string | undefined) => void;

    /** Sentry label for the field's row */
    sentryLabel?: string;

    ref?: ForwardedRef<ComponentRef<typeof View>>;
};

/**
 * A form field that picks one item from a list, opening the list in a container anchored to the field instead of on
 * its own page. When there isn't room around the field for the container, the list opens full page instead, the way
 * `ValuePicker` opens it.
 */
function ValueFieldDropdown({value, label, items = [], errorText, onInputChange, sentryLabel, ref}: ValueFieldDropdownProps) {
    const [isFullPagePickerVisible, setIsFullPagePickerVisible] = useState(false);
    const selectedItem = items.find((item) => item.value === value);

    const selectItem = (item: ValuePickerListItem) => {
        if (item.value === value) {
            return;
        }
        onInputChange?.(item.value);
    };

    const hideFullPagePicker = () => setIsFullPagePickerVisible(false);

    return (
        <View ref={ref}>
            <ExpenseFieldDropdown
                name={label}
                value={selectedItem?.label}
                errorText={errorText}
                shouldOpenInDropdown
                onPress={() => setIsFullPagePickerVisible(true)}
                renderDropdown={({onClose, ...popoverProps}) => (
                    <AnchoredSelectionListPopover
                        {...popoverProps}
                        onClose={onClose}
                        shouldFitContentHeight
                        optionCount={items.length}
                        // The list shows its search input from the standard limit, and the container sizes itself the same way.
                        isSearchable={items.length >= CONST.STANDARD_LIST_ITEM_LIMIT}
                        title={label}
                        backButtonSentryLabel={CONST.SENTRY_LABEL.VALUE_FIELD_DROPDOWN.BACK_BUTTON}
                    >
                        <ValueSelectionList
                            items={items}
                            selectedItem={selectedItem}
                            isVisible={popoverProps.isVisible}
                            onItemSelected={(item) => {
                                selectItem(item);
                                onClose();
                            }}
                        />
                    </AnchoredSelectionListPopover>
                )}
                sentryLabel={sentryLabel}
            />
            <ValueSelectorModal
                isVisible={isFullPagePickerVisible}
                label={label}
                selectedItem={selectedItem}
                items={items}
                onClose={hideFullPagePicker}
                onItemSelected={(item) => {
                    selectItem(item);
                    hideFullPagePicker();
                }}
                shouldEnableKeyboardAvoidingView={false}
            />
        </View>
    );
}

export default ValueFieldDropdown;
